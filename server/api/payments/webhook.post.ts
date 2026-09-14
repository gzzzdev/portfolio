import crypto from 'node:crypto'

type 결제Row = {
  id: string
  tossOrderId?: string
  status?: 'READY' | 'PAID' | 'FAILED' | 'REFUNDED'
}

type 결제수단 = 'CARD' | 'TRANSFER' | 'VIRTUAL_ACCOUNT' | 'E_WALLET'

const 결제수단매핑 = (method?: string): 결제수단 => {
  if (!method) return 'CARD'
  if (method === '계좌이체') return 'TRANSFER'
  if (method === '가상계좌') return 'VIRTUAL_ACCOUNT'
  if (method === '간편결제') return 'E_WALLET'
  return 'CARD'
}

const 결제ID찾기 = async (orderId: string) => {
  const list = await $fetch<결제Row[]>('/api/v1/payments', { method: 'GET' })
  const found = list.find(x => x.id === orderId || x.tossOrderId === orderId)
  return found?.id ?? null
}

const 상태업데이트가능 = (
  current: 결제Row['status'] | undefined,
  next: 'PAID' | 'FAILED'
) => {
  if (current === next) return false
  if (current === 'REFUNDED') return false
  if (current === 'PAID' && next === 'FAILED') return false
  return true
}

const safeEqual = (a: string, b: string) => {
  const aa = Buffer.from(a)
  const bb = Buffer.from(b)
  if (aa.length !== bb.length) return false
  return crypto.timingSafeEqual(aa, bb)
}

const verifyWebhookSignature = (rawBody: string, signature: string | undefined, secret: string) => {
  if (!signature) return false
  const digest = crypto.createHmac('sha256', secret).update(rawBody).digest('base64')
  return safeEqual(digest, signature)
}

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig(event)
  const webhookSecret = runtimeConfig.tossPaymentsWebhookSecret
  const rawBody = (await readRawBody(event, 'utf8')) || ''
  const signature = getHeader(event, 'tosspayments-signature') || ''

  if (!rawBody) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Webhook body is empty.'
    })
  }

  // 웹훅 시크릿이 설정된 경우에만 서명 검증을 강제합니다.
  if (webhookSecret && webhookSecret !== '1') {
    const verified = verifyWebhookSignature(rawBody, signature, webhookSecret)
    if (!verified) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized',
        message: 'Invalid webhook signature.'
      })
    }
  }

  const payload = JSON.parse(rawBody) as {
    eventType?: string
    data?: {
      paymentKey?: string
      orderId?: string
      status?: string
      totalAmount?: number
      method?: string
      receipt?: { url?: string }
    }
  }

  const eventType = String(payload?.eventType || '').trim()
  const data = payload?.data || {}
  const orderId = String(data.orderId || '').trim()
  if (!orderId) return { ok: true, skipped: true, reason: 'orderId is missing' }

  const paymentId = await 결제ID찾기(orderId)
  if (!paymentId) return { ok: true, skipped: true, reason: 'payment not found' }

  const paidEvent = eventType.includes('DONE') || data.status === 'DONE'
  const failedEvent = eventType.includes('FAIL') || data.status === 'ABORTED'
  if (!paidEvent && !failedEvent) {
    return { ok: true, skipped: true, reason: 'unsupported event type', eventType }
  }

  const nextStatus = paidEvent ? 'PAID' : 'FAILED'
  const current = await $fetch<결제Row>(`/api/v1/payments/${paymentId}`, { method: 'GET' })
  if (!상태업데이트가능(current?.status, nextStatus)) {
    return {
      ok: true,
      skipped: true,
      reason: 'status transition blocked',
      currentStatus: current?.status ?? null,
      nextStatus
    }
  }

  await $fetch(`/api/v1/payments/${paymentId}`, {
    method: 'PUT',
    body: {
      amount: data.totalAmount,
      method: 결제수단매핑(data.method),
      status: nextStatus,
      transactionId: paidEvent ? (data.paymentKey ?? null) : null,
      receiptUrl: paidEvent ? (data.receipt?.url ?? null) : null,
      updatedAt: new Date().toISOString()
    }
  })

  return { ok: true }
})

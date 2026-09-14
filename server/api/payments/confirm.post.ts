type ConfirmBody = {
  paymentKey: string
  orderId: string
  amount: number
}

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

const 결제행찾기 = async (orderId: string) => {
  const list = await $fetch<결제Row[]>('/api/v1/payments', { method: 'GET' })
  return list.find(x => x.id === orderId || x.tossOrderId === orderId) ?? null
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

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig(event)
  const body = await readBody<ConfirmBody>(event)

  if (!body?.paymentKey || !body?.orderId || !body?.amount) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'paymentKey, orderId, amount are required.'
    })
  }

  const secretKey = runtimeConfig.tossPaymentsSecretKey
  if (!secretKey || secretKey === '1') {
    throw createError({
      statusCode: 500,
      statusMessage: 'Server Misconfigured',
      message: 'Toss Payments secret key is missing.'
    })
  }

  const auth = Buffer.from(`${secretKey}:`).toString('base64')

  try {
    const result = await $fetch<{
      paymentKey: string
      orderId: string
      status: string
      totalAmount: number
      method?: string
      receipt?: { url?: string }
    }>('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      body: {
        paymentKey: body.paymentKey,
        orderId: body.orderId,
        amount: body.amount
      }
    })

    const payment = await 결제행찾기(body.orderId)
    if (!payment?.id) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Payment Not Found',
        message: `orderId에 매칭되는 결제 레코드를 찾을 수 없습니다: ${body.orderId}`
      })
    }

    if (상태업데이트가능(payment.status, 'PAID')) {
      await $fetch(`/api/v1/payments/${payment.id}`, {
        method: 'PUT',
        body: {
          amount: result.totalAmount ?? body.amount,
          method: 결제수단매핑(result.method),
          status: 'PAID',
          transactionId: result.paymentKey,
          receiptUrl: result.receipt?.url ?? null,
          updatedAt: new Date().toISOString()
        }
      })
    }

    return result
  } catch (error: any) {
    try {
      const paymentId = await 결제ID찾기(body.orderId)
      if (paymentId) {
        const payment = await $fetch<결제Row>(`/api/v1/payments/${paymentId}`, { method: 'GET' })
        if (상태업데이트가능(payment?.status, 'FAILED')) {
          await $fetch(`/api/v1/payments/${paymentId}`, {
            method: 'PUT',
            body: {
              status: 'FAILED',
              updatedAt: new Date().toISOString()
            }
          })
        }
      }
    } catch {
      // 결제 승인 실패 처리 중 DB 갱신 실패는 원래 에러를 우선 반환합니다.
    }

    throw createError({
      statusCode: error?.statusCode || 502,
      statusMessage: 'Toss Confirm Failed',
      message:
        error?.data?.message || error?.message || '결제 승인 요청에 실패했습니다.'
    })
  }
})

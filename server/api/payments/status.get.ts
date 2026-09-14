type 결제Row = {
  id: string
  tossOrderId?: string | null
  amount: number
  method: 'CARD' | 'TRANSFER' | 'VIRTUAL_ACCOUNT' | 'E_WALLET'
  status: 'READY' | 'PAID' | 'FAILED' | 'REFUNDED'
  transactionId: string | null
  receiptUrl: string | null
  createdAt: string
  updatedAt: string
}

const findByOrder = (list: 결제Row[], orderId: string, readyId?: string | null) =>
  list.find((item) => {
    if (readyId && (item.id === readyId || item.tossOrderId === readyId)) return true
    return item.id === orderId || item.tossOrderId === orderId
  }) ?? null

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const orderId = String(query.orderId || '').trim()
  const readyId = String(query.ready || '').trim()

  if (!orderId && !readyId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'orderId or ready is required.'
    })
  }

  const list = await $fetch<결제Row[]>('/api/v1/payments', { method: 'GET' })
  const found = findByOrder(list, orderId, readyId || null)
  if (!found) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Payment Not Found',
      message: '결제 레코드를 찾을 수 없습니다.'
    })
  }

  return {
    id: found.id,
    tossOrderId: found.tossOrderId ?? null,
    status: found.status,
    amount: found.amount,
    method: found.method,
    transactionId: found.transactionId,
    receiptUrl: found.receiptUrl
  }
})

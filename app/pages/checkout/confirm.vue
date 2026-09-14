<template>
  <view영수증
    v-if="진입허용됨"
    v-bind="영수증정보"
  />
</template>

<script setup lang="ts">
import { model결제s } from '~models/test2'

definePageMeta({
  layout: 'layout-none',
  middleware: [
    (to) => {
      if (!import.meta.client) return
      const readyId = String(to.query.ready || '')
      const gateToken = String(to.query.gate || '')
      if (!readyId || !gateToken) {
        return navigateTo('/checkout', { replace: true })
      }
    }
  ]
})

type 결제상세타입 = {
  id: string
  status: 'READY' | 'PAID' | 'FAILED' | 'REFUNDED'
  method: 'CARD' | 'TRANSFER' | 'VIRTUAL_ACCOUNT' | 'E_WALLET'
  amount: number
  transactionId: string | null
}

type 영수증스냅샷타입 = {
  ready?: string
  orderId?: string
  method?: 결제상세타입['method']
  amount?: number
  requestedAt?: string
  createdAt?: number
}

const route = useRoute()
const router = useRouter()
const 결제Repo = model결제s.getInstance()
const 결제상세 = ref<결제상세타입 | null>(null)
const 영수증스냅샷 = ref<영수증스냅샷타입 | null>(null)
const 이동대상경로 = ref('/checkout')
const 진입허용됨 = ref(false)
const RETURN_GATE_STORAGE_KEY = 'checkout:payment:return-gate'
const RECEIPT_SNAPSHOT_STORAGE_KEY = 'checkout:payment:receipt-snapshot'

const 결제수단라벨: Record<결제상세타입['method'], string> = {
  CARD: '신용카드',
  TRANSFER: '계좌이체',
  VIRTUAL_ACCOUNT: '가상계좌',
  E_WALLET: '간편결제'
}

const parseReturnPath = (value: unknown) => {
  const text = String(value || '').trim()
  if (!text.startsWith('/')) return '/checkout'
  if (text.startsWith('//')) return '/checkout'
  return text
}

const 금액포맷 = (value: number) =>
  new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(
    value
  )

const 요청시각문구 = computed(() => {
  const snapshotTime = String(영수증스냅샷.value?.requestedAt || '').trim()
  if (snapshotTime) return new Date(snapshotTime).toLocaleString('ko-KR')
  return new Date().toLocaleString('ko-KR')
})
const 영수증정보 = computed(() => ({
  주문번호: String(route.query.orderId || 결제상세.value?.id || 영수증스냅샷.value?.orderId || '-'),
  결제수단: 결제상세.value
    ? 결제수단라벨[결제상세.value.method]
    : 영수증스냅샷.value?.method
      ? 결제수단라벨[영수증스냅샷.value.method]
      : '확인 중',
  결제요청시각: 요청시각문구.value,
  승인번호: 결제상세.value?.transactionId ?? '승인 완료 후 표시',
  총결제금액: 결제상세.value
    ? 금액포맷(결제상세.value.amount)
    : Number.isFinite(영수증스냅샷.value?.amount)
      ? 금액포맷(Number(영수증스냅샷.value?.amount))
      : '금액 확인 중'
}))

const findStatus = async (orderId: string, readyId: string) =>
  await $fetch<결제상세타입>('/api/payments/status', {
    method: 'GET',
    query: { orderId, ready: readyId || undefined }
  })

const verifyAndConsumeReturnGate = (readyId: string, gateToken: string) => {
  if (!readyId || !gateToken) return false
  try {
    const raw = sessionStorage.getItem(RETURN_GATE_STORAGE_KEY)
    sessionStorage.removeItem(RETURN_GATE_STORAGE_KEY)
    if (!raw) return false
    const parsed = JSON.parse(raw) as {
      ready?: string
      token?: string
      createdAt?: number
    }
    const createdAt = Number(parsed.createdAt || 0)
    const maxAgeMs = 30 * 60 * 1000
    const notExpired = createdAt > 0 && Date.now() - createdAt < maxAgeMs
    return parsed.ready === readyId && parsed.token === gateToken && notExpired
  } catch {
    return false
  }
}

const loadAndConsumeReceiptSnapshot = (readyId: string) => {
  if (!readyId) return null
  try {
    const raw = sessionStorage.getItem(RECEIPT_SNAPSHOT_STORAGE_KEY)
    sessionStorage.removeItem(RECEIPT_SNAPSHOT_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as 영수증스냅샷타입
    const createdAt = Number(parsed?.createdAt || 0)
    const maxAgeMs = 30 * 60 * 1000
    const notExpired = createdAt > 0 && Date.now() - createdAt < maxAgeMs
    if (!notExpired) return null
    if (String(parsed.ready || '') !== readyId) return null
    return parsed
  } catch {
    return null
  }
}

const waitForFinalStatus = async (orderId: string, readyId: string) => {
  const attempts = 15
  for (let i = 0; i < attempts; i += 1) {
    try {
      const detail = await findStatus(orderId, readyId)
      결제상세.value = detail
      if (detail.status === 'PAID') return 'PAID'
      if (detail.status === 'FAILED') return 'FAILED'
    } catch {
      // 웹훅 반영 전 상태일 수 있으므로 재시도합니다.
    }
    await new Promise(resolve => window.setTimeout(resolve, 1000))
  }
  return 'TIMEOUT'
}

const 요청승인 = async ({
  paymentKey,
  orderId,
  amount,
  readyId
}: {
  paymentKey: string
  orderId: string
  amount: number
  readyId: string
}) => {
  if (!paymentKey || !orderId || !Number.isFinite(amount) || amount <= 0) return false

  const { 결제 } = await 결제Repo.do결제성공({
    paymentKey,
    orderId,
    amount,
    readyId: readyId || undefined
  })
  if (결제) {
    결제상세.value = {
      id: String(결제.id),
      status: 결제.결제상태,
      method: 결제.결제수단,
      amount: 결제.결제금액,
      transactionId: 결제.거래아이디
    }
  }
  return true
}

onMounted(async () => {
  const orderId = String(route.query.orderId || '')
  const readyId = String(route.query.ready || '')
  const paymentKey = String(route.query.paymentKey || '')
  const amountFromQuery = Number(route.query.amount || 0)
  const gateToken = String(route.query.gate || '')
  이동대상경로.value = parseReturnPath(route.query.returnTo)
  영수증스냅샷.value = loadAndConsumeReceiptSnapshot(readyId)

  const validEntry = verifyAndConsumeReturnGate(readyId, gateToken)
  if (!validEntry) {
    void router.replace('/checkout')
    return
  }
  진입허용됨.value = true

  if (!orderId && !readyId) {
    void router.replace('/checkout/fail')
    return
  }

  try {
    try {
      const amount = Number.isFinite(영수증스냅샷.value?.amount)
        ? Number(영수증스냅샷.value?.amount)
        : amountFromQuery
      await 요청승인({ paymentKey, orderId, amount, readyId })
    } catch {
      // 승인 API 오류 시에도 웹훅 반영 조회로 폴백합니다.
    }

    const finalStatus = await waitForFinalStatus(orderId, readyId)
    if (finalStatus === 'PAID') {
      window.setTimeout(() => {
        useAlert().success('결제 완료', `${영수증정보.value.총결제금액} 결제되었습니다`)
        void router.replace(이동대상경로.value)
      }, 2000)
      return
    }
    void router.replace('/checkout/fail')
  } catch (error: any) {
    void router.replace('/checkout/fail')
  }
})
</script>

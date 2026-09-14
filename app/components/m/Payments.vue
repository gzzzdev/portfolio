<template>
  <div class="mx-auto w-full max-w-3xl space-y-4 p-3 sm:p-4 md:p-5">
    <div class="flex items-start justify-between gap-3">
      <div>
        <h2 class="text-lg font-semibold">
          {{ titleText }}
        </h2>
        <p
          v-if="descriptionText"
          class="text-sm text-muted"
        >
          {{ descriptionText }}
        </p>
      </div>
      <mButton
        v-if="props.onClose"
        역할="조용"
        icon="i-lucide-x"
        @click="props.onClose"
      >
        닫기
      </mButton>
    </div>

    <UCard>
      <div class="space-y-4">
        <UFormField label="주문명">
          <UInput v-model="orderNameModel" />
        </UFormField>

        <div class="grid gap-4 md:grid-cols-2">
          <UFormField label="구매자명">
            <UInput v-model="customerNameModel" />
          </UFormField>
          <UFormField label="이메일">
            <UInput
              v-model="customerEmailModel"
              type="email"
            />
          </UFormField>
        </div>

        <div class="flex items-center justify-between rounded-lg border p-3">
          <div>
            <p class="text-sm font-medium">
              쿠폰 할인
            </p>
            <p class="text-xs text-muted">
              체크 시 결제 금액에 즉시 반영됩니다.
            </p>
          </div>
          <UCheckbox v-model="couponEnabled" />
        </div>

        <div class="rounded-lg bg-muted/40 p-3 text-sm">
          <div class="flex items-center justify-between">
            <span>상품 금액</span>
            <strong>{{ formatAmount(baseAmount) }}</strong>
          </div>
          <div class="mt-1 flex items-center justify-between">
            <span>쿠폰 할인</span>
            <strong>-{{ formatAmount(discountAmount) }}</strong>
          </div>
          <div class="mt-2 flex items-center justify-between text-base">
            <span class="font-semibold">총 결제 금액</span>
            <strong class="text-primary">{{ formatAmount(totalAmount) }}</strong>
          </div>
        </div>
      </div>
    </UCard>

    <UCard>
      <template #header>
        <h3 class="font-semibold">
          결제수단 선택
        </h3>
      </template>
      <div :id="paymentMethodSelectorId" />
    </UCard>

    <UCard>
      <template #header>
        <h3 class="font-semibold">
          약관 동의
        </h3>
      </template>
      <div :id="agreementSelectorId" />
    </UCard>

    <UCard>
      <div class="space-y-3">
        <p
          v-if="errorMessage"
          class="text-sm text-error"
        >
          {{ errorMessage }}
        </p>
        <mButton
          역할="강조"
          block
          size="lg"
          :loading="requestingPayment"
          :disabled="!initialized"
          @click="requestPayment"
        >
          {{ initialized ? "결제하기" : "결제위젯 준비 중..." }}
        </mButton>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { ANONYMOUS, loadTossPayments } from '@tosspayments/tosspayments-sdk'
import { computed, nextTick, onMounted, ref, watch } from 'vue'

type Props = {
  title?: string
  description?: string
  orderName: string
  customerName: string
  customerEmail: string
  amount: number
  couponDiscount?: number
  successUrl: string
  failUrl: string
  readyOrderId?: string
  onClose?: () => void
}

const props = withDefaults(defineProps<Props>(), {
  title: '결제',
  description: '',
  couponDiscount: 0
})

const runtimeConfig = useRuntimeConfig()
const route = useRoute()
const clientKey = runtimeConfig.public.tossPaymentsClientKey

const widget = ref<any>(null)
const initialized = ref(false)
const requestingPayment = ref(false)
const errorMessage = ref('')
const couponEnabled = ref(false)

const orderNameModel = ref(props.orderName)
const customerNameModel = ref(props.customerName)
const customerEmailModel = ref(props.customerEmail)

const uid = useId()
const paymentMethodSelectorId = `payment-method-${uid}`
const agreementSelectorId = `agreement-${uid}`

const titleText = computed(() => props.title || '결제')
const descriptionText = computed(() => props.description || '')
const baseAmount = computed(() => props.amount)
const discountAmount = computed(() =>
  couponEnabled.value ? Math.max(0, props.couponDiscount ?? 0) : 0
)
const totalAmount = computed(() => Math.max(0, baseAmount.value - discountAmount.value))

const formatAmount = (value: number) =>
  new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(value)

const createRandomKey = () =>
  (globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2)).slice(0, 20)
const RETURN_GATE_STORAGE_KEY = 'checkout:payment:return-gate'
const RECEIPT_SNAPSHOT_STORAGE_KEY = 'checkout:payment:receipt-snapshot'

const appendQueryToUrl = (baseUrl: string, query: Record<string, string>) => {
  const url = new URL(baseUrl)
  Object.entries(query).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value)
  })
  return url.toString()
}

const syncAmount = async () => {
  if (!widget.value) return
  await widget.value.setAmount({
    currency: 'KRW',
    value: totalAmount.value
  })
}

const initWidget = async () => {
  try {
    if (!clientKey || clientKey === '1') {
      throw new Error(
        'NUXT_PUBLIC_TOSS_PAYMENTS_CLIENT_KEY 값이 비어 있습니다. .env 설정 후 dev 서버를 재시작하세요.'
      )
    }

    const tossPayments = await loadTossPayments(clientKey)
    widget.value = tossPayments.widgets({
      customerKey: createRandomKey() || ANONYMOUS
    })

    // selector 대상 엘리먼트가 실제 DOM에 그려진 뒤 렌더합니다.
    await nextTick()
    await syncAmount()
    await Promise.all([
      widget.value.renderPaymentMethods({
        selector: `#${paymentMethodSelectorId}`,
        variantKey: 'DEFAULT'
      }),
      widget.value.renderAgreement({
        selector: `#${agreementSelectorId}`,
        variantKey: 'AGREEMENT'
      })
    ])
    initialized.value = true
  } catch (error) {
    console.error(error)
    const detail
      = error instanceof Error
        ? error.message
        : typeof error === 'string'
          ? error
          : 'unknown error'
    errorMessage.value = `결제위젯 초기화 실패: ${detail}`
  }
}

const requestPayment = async () => {
  if (!widget.value || !initialized.value) return
  requestingPayment.value = true
  errorMessage.value = ''

  try {
    const sanitizedReadyOrderId = String(props.readyOrderId || '').replace(/[^A-Za-z0-9_-]/g, '').slice(0, 64)
    const orderId = sanitizedReadyOrderId.length >= 6 ? sanitizedReadyOrderId : ''
    if (!orderId) throw new Error('결제 READY 레코드 생성에 실패했습니다.')

    const returnTo = route.fullPath || '/'
    const gateToken = createRandomKey()
    sessionStorage.setItem(
      RETURN_GATE_STORAGE_KEY,
      JSON.stringify({
        ready: orderId,
        token: gateToken,
        createdAt: Date.now()
      })
    )
    sessionStorage.setItem(
      RECEIPT_SNAPSHOT_STORAGE_KEY,
      JSON.stringify({
        ready: orderId,
        orderId,
        method: 'CARD',
        amount: totalAmount.value,
        requestedAt: new Date().toISOString(),
        createdAt: Date.now()
      })
    )
    await widget.value.requestPayment({
      orderId,
      orderName: orderNameModel.value,
      successUrl: appendQueryToUrl(props.successUrl, { ready: orderId, returnTo, gate: gateToken }),
      failUrl: appendQueryToUrl(props.failUrl, { ready: orderId, returnTo, gate: gateToken }),
      customerName: customerNameModel.value,
      customerEmail: customerEmailModel.value
    })
  } catch (error: any) {
    if (error?.code !== 'USER_CANCEL') {
      console.error(error)
      errorMessage.value = '결제 요청 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
    }
  } finally {
    requestingPayment.value = false
  }
}

watch(totalAmount, () => {
  void syncAmount()
})

onMounted(() => {
  void initWidget()
})
</script>

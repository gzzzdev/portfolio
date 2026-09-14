<template>
  <div class="mx-auto flex w-full max-w-(--ui-container) flex-col gap-4 p-6">
    <Input선택기계층
      v-model="selectedSubscription"
      :items="SUBSCRIPTION_ITEMS"
    />

    <UAlert
      v-if="selectedSubscription.value && selectedSubscription.subValue"
      title="선택 결과"
      :description="`상태: ${currentStatusLabel} / 사유: ${currentSubLabel}`"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const SUBSCRIPTION_ITEMS = [
  {
    label: '유효기간 내',
    value: 'ACTIVE',
    items: [
      { label: '정상 이용', value: 'NORMAL' },
      { label: '만료 임박', value: 'EXPIRING_SOON' },
      { label: '유예 기간', value: 'GRACE_PERIOD' }
    ]
  },
  {
    label: '납부전',
    value: 'INACTIVE',
    items: [
      { label: '납부전', value: 'NEVER_SUBSCRIBED' },
      { label: '최종 만료', value: 'FINALLY_EXPIRED' },
      { label: '중도 해지', value: 'REFUNDED' }
    ]
  },
  {
    label: '결제/대기',
    value: 'PENDING',
    items: [
      { label: '결제 진행 중', value: 'PAYING' },
      { label: '결제 실패', value: 'PAYMENT_FAILED' }
    ]
  }
]

const selectedSubscription = ref<{ value: string | number | null, subValue: string | number | null }>({
  value: null,
  subValue: null
})

const currentStatusLabel = computed(() => {
  if (!selectedSubscription.value.value) return ''
  return SUBSCRIPTION_ITEMS.find(item => item.value === selectedSubscription.value.value)?.label ?? ''
})

const currentSubLabel = computed(() => {
  const selectedValue = selectedSubscription.value.value
  const selectedSubValue = selectedSubscription.value.subValue
  if (!selectedValue || !selectedSubValue) return ''
  const parent = SUBSCRIPTION_ITEMS.find(item => item.value === selectedValue)
  return parent?.items.find(item => item.value === selectedSubValue)?.label ?? ''
})
</script>

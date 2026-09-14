<template>
  <div class="mx-auto w-full max-w-(--ui-container) p-4 md:p-8">
    <UCard>
      <template #header>
        <h1 class="text-xl font-semibold">
          결제 실패
        </h1>
      </template>

      <div class="space-y-2 text-sm">
        <p class="text-muted">
          결제가 완료되지 않았습니다.
        </p>
        <p><strong>에러 코드:</strong> {{ code }}</p>
        <p><strong>메시지:</strong> {{ message }}</p>
        <mButton to="/checkout">
          주문서로 돌아가기
        </mButton>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { model결제s } from '~models/test2'

definePageMeta({ layoutHero: 'default' })

const route = useRoute()
const 결제Repo = model결제s.getInstance()
const code = computed(() => String(route.query.code || 'UNKNOWN'))
const message = computed(() => String(route.query.message || '알 수 없는 오류'))

onMounted(async () => {
  const readyId = String(route.query.ready || '')
  if (!readyId) return

  try {
    await 결제Repo.do결제실패({
      readyId,
      code: String(route.query.code || ''),
      message: String(route.query.message || '')
    })
  } catch (error) {
    console.error('READY 결제 실패 상태 반영 오류', error)
  }
})
</script>

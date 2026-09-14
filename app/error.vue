<template>
  <div class="error-page">
    <NuxtImg
      :src="backgroundImageUrl"
      alt=""
      class="error-page__image"
      sizes="100vw"
      quality="80"
      format="webp"
      loading="eager"
      fit="cover"
    />
    <div class="error-page__overlay" />
    <UContainer class="relative z-10 h-dvh items-center px-6 py-8 lg:py-10 flex flex-col justify-end">
      <section class="error-page__content w-full">
        <div class="error-page__hero">
          <p class="text-xs font-semibold tracking-[0.3em] text-white/70">
            ERROR {{ statusCode }}
          </p>
          <h1 class="mt-4 text-3xl font-semibold leading-tight text-white sm:text-5xl">
            {{ title }}
          </h1>
          <p class="mt-6 max-w-3xl whitespace-pre-line text-base leading-8 text-white/85 sm:text-lg">
            {{ description }}
          </p>
        </div>
        <div class="error-page__actions-panel text-white/90">
          <p class="text-sm font-semibold tracking-wide text-white/70">
            에러 상세
          </p>
          <dl class="mt-4 grid gap-3 text-sm">
            <div class="grid gap-1">
              <dt class="text-white/60">
                Status Code
              </dt>
              <dd class="font-medium text-white">
                {{ statusCode }}
              </dd>
            </div>
            <div
              v-if="statusMessage"
              class="grid gap-1"
            >
              <dt class="text-white/60">
                Status Message
              </dt>
              <dd class="font-medium text-white">
                {{ statusMessage }}
              </dd>
            </div>
            <div
              v-if="errorMessage"
              class="grid gap-1"
            >
              <dt class="text-white/60">
                Message
              </dt>
              <dd class="font-medium text-white">
                {{ errorMessage }}
              </dd>
            </div>
          </dl>
          <div
            v-if="errorData"
            class="mt-4"
          >
            <p class="text-xs font-semibold uppercase tracking-wide text-white/60">
              Data
            </p>
            <pre class="mt-2 max-h-40 overflow-auto rounded-md bg-black/30 p-3 text-xs leading-5 text-white/90">{{ errorData }}</pre>
          </div>
        </div>
      </section>
      <div class="error-page__floating-actions">
        <mButton
          size="xl"
          역할="강조"
          icon="i-lucide-house"
          to="/"
        >
          홈으로 이동
        </mButton>
        <mButton
          size="xl"
          icon="i-lucide-refresh-cw"
          @click="handleClearError"
        >
          다시 시도
        </mButton>
      </div>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const statusCode = computed(() => props.error?.statusCode ?? 500)
const title = computed(() =>
  statusCode.value === 404 ? '페이지 경로를 찾을 수 없습니다' : '오류가 발생했습니다'
)
const statusMessage = computed(() => props.error?.statusMessage?.trim() ?? '')
const errorMessage = computed(() => props.error?.message?.trim() ?? '')
const errorData = computed(() => {
  const data = props.error?.data

  if (typeof data === 'string') {
    return data
  }

  if (data && typeof data === 'object') {
    return JSON.stringify(data, null, 2)
  }

  return ''
})
const description = computed(() =>
  statusCode.value === 404
    ? '입력하신 주소가 변경되었거나 삭제되었을 수 있습니다.\n홈으로 이동해 다시 확인해 주세요.'
    : (statusMessage.value
      || errorMessage.value
      || '요청을 처리하는 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.')
)
const backgroundImageUrl
  = 'https://images.unsplash.com/photo-1674198412097-88c2d83012de?q=80&w=1548&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'

function handleClearError() {
  clearError({ redirect: '/' })
}
</script>

<style scoped>
.error-page {
  position: relative;
  min-height: 100dvh;
  overflow: hidden;
  background-color: #111827;
}

.error-page__image {
  position: absolute;
  inset: 0;
  z-index: 0;
  height: 100%;
  width: 100%;
  object-fit: cover;
  filter: blur(3px);
  transform: scale(1.03);
}

.error-page__overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: radial-gradient(circle at center, rgba(0, 0, 0, 0.12) 0%, rgba(0, 0, 0, 0.5) 100%);
}

.error-page__content {
  display: grid;
  gap: 2.5rem;
  align-items: end;
}

.error-page__hero {
  max-width: 64rem;
}

.error-page__actions-panel {
  max-width: 32rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 1rem;
  background: rgba(17, 24, 39, 0.35);
  backdrop-filter: blur(12px);
  box-shadow: 0 24px 44px rgba(0, 0, 0, 0.25);
  padding: 1.25rem;
}

.error-page__floating-actions {
  position: absolute;
  left: 50%;
  top: 56%;
  z-index: 20;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
  transform: translate(-50%, -50%);
}

@media (min-width: 1024px) {
  .error-page__content {
    grid-template-columns: minmax(0, 1fr) minmax(22rem, 32rem);
    gap: 3.5rem;
  }
}
</style>

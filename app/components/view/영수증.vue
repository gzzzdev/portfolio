<template>
  <div
    class="layout-soft-dashboard-bg flex min-h-screen items-center justify-center px-4 py-10"
  >
    <div class="w-full max-w-md">
      <UCard class="payment-glow m-층-떠있음">
        <template #header>
          <div class="space-y-1 text-center">
            <p class="text-sm font-medium text-primary">
              결제 확인 중
            </p>
            <h1 class="flex items-center justify-center gap-1 text-2xl font-bold tracking-tight">
              <span>결제가 거의 끝났어요</span>
              <span
                class="dot-spinner"
                aria-hidden="true"
              >
                <span>.</span><span>.</span><span>.</span>
              </span>
            </h1>
          </div>
        </template>

        <div class="space-y-5">
          <div class="flex items-center justify-between rounded-xl border border-default bg-elevated/40 px-4 py-3">
            <div class="flex items-center gap-2">
              <UIcon
                name="i-lucide-clock-3"
                class="h-4 w-4 text-primary"
              />
              <p class="text-sm font-medium">
                결제 상태
              </p>
            </div>
            <UBadge label="승인 대기중" />
          </div>

          <div class="rounded-lg border border-default/50 px-4 py-3">
            <div class="mb-1 flex items-center justify-between">
              <p class="text-sm text-toned">
                주문 요약
              </p>
            </div>

            <dl class="space-y-2 text-sm">
              <div class="flex items-center justify-between gap-4 py-1">
                <dt class="text-muted">
                  주문번호
                </dt>
                <dd class="tracking-wide text-toned">
                  {{ props.주문번호 }}
                </dd>
              </div>
              <div class="flex items-center justify-between gap-4 py-1">
                <dt class="text-muted">
                  결제수단
                </dt>
                <dd class="text-toned">
                  {{ props.결제수단 }}
                </dd>
              </div>
              <div class="flex items-center justify-between gap-4 py-1">
                <dt class="text-muted">
                  결제 요청시각
                </dt>
                <dd class="text-toned">
                  {{ props.결제요청시각 }}
                </dd>
              </div>
              <div class="flex items-center justify-between gap-4 py-1">
                <dt class="text-muted">
                  승인번호
                </dt>
                <dd class="text-muted">
                  <UBadge
                    v-if="승인대기중"
                    color="warning"
                    label="승인 대기중"
                  />
                  <span v-else>{{ props.승인번호 }}</span>
                </dd>
              </div>
              <div class="mt-1 flex items-center justify-between gap-4 border-t border-default/50 pt-2">
                <dt class="text-muted">
                  총 결제금액
                </dt>
                <dd class="text-base font-semibold text-primary">
                  {{ props.총결제금액 }}
                </dd>
              </div>
            </dl>
          </div>

          <UAlert
            title="창을 닫지 말고 잠시 기다려 주세요."
            description="승인 처리에는 보통 3~10초가 소요됩니다. 지연될 경우 주문내역에서 결제 상태를 확인해 주세요."
          />

          <div
            v-if="false"
            class="flex flex-col-reverse gap-2 sm:flex-row"
          >
            <mButton
              block
              icon="i-lucide-headset"
              to="/support"
            >
              고객센터
            </mButton>
            <mButton
              역할="강조"
              block
              icon="i-lucide-receipt-text"
              to="/mypage/orders"
            >
              주문내역 보기
            </mButton>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  주문번호: string
  결제수단: string
  결제요청시각: string
  승인번호: string
  총결제금액: string
}

const props = defineProps<Props>()
const 승인대기중 = computed(() => {
  const 승인번호 = String(props.승인번호 || '').trim()
  return !승인번호 || 승인번호 === '승인 완료 후 표시'
})
</script>

  <style scoped>
  .payment-glow {
    position: relative;
    isolation: isolate;
    animation: payment-glow-pulse 2.4s ease-in-out infinite;
  }

  .payment-glow::before {
    content: '';
    position: absolute;
    inset: -2px;
    z-index: -1;
    border-radius: inherit;
    pointer-events: none;
    padding: 1px;
    /* 배경 워시와 같은 토큰 — `:root` 에 있는 공개 변수라 그대로 쓴다 (워시.ts) */
    background: linear-gradient(
      125deg,
      color-mix(in srgb, rgb(var(--layout-complement-1-rgb)) 58%, transparent),
      color-mix(in srgb, rgb(var(--layout-complement-2-rgb)) 58%, transparent)
    );
    filter: blur(8px);
    opacity: 0.9;
    -webkit-mask:
      linear-gradient(#000 0 0) content-box,
      linear-gradient(#000 0 0);
    mask:
      linear-gradient(#000 0 0) content-box,
      linear-gradient(#000 0 0);
    -webkit-mask-composite: xor;
            mask-composite: exclude;
  }

  .dot-spinner > span {
    animation: dot-fade 1.2s infinite;
    display: inline-block;
    color: rgb(var(--layout-complement-1-rgb));
  }

  .dot-spinner > span:nth-child(2) {
    animation-delay: 0.2s;
    color: color-mix(
      in srgb,
      rgb(var(--layout-complement-1-rgb)) 50%,
      rgb(var(--layout-complement-2-rgb)) 50%
    );
  }

  .dot-spinner > span:nth-child(3) {
    animation-delay: 0.4s;
    color: rgb(var(--layout-complement-2-rgb));
  }

  @keyframes dot-fade {
    0%,
    80%,
    100% {
      opacity: 0.25;
    }
    40% {
      opacity: 1;
    }
  }

  @keyframes payment-glow-pulse {
    0%,
    100% {
      box-shadow:
        0 0 0 1px color-mix(in srgb, rgb(var(--layout-complement-1-rgb)) 24%, transparent),
        0 0 0 0 color-mix(in srgb, rgb(var(--layout-complement-1-rgb)) 9%, transparent);
    }
    50% {
      box-shadow:
        0 0 0 1px color-mix(in srgb, rgb(var(--layout-complement-2-rgb)) 40%, transparent),
        0 0 22px 2px color-mix(in srgb, rgb(var(--layout-complement-2-rgb)) 20%, transparent);
    }
  }
</style>

<!--
  포트폴리오 역할 입장의 진행 막. **이 리포(portfolio)에만 있다** — 띠(`m포트폴리오띠`)와 같은 겉옷.

  역할 카드·띠 버튼을 누르면 로그아웃 → 로그인 → 첫 화면까지 1~2초가 빈다. 그동안 화면이 가만있으면
  리뷰어가 다시 누르거나 뒤로가기를 누른다. 그래서 **화면 전체를 덮고 지금 무엇을 하는지 말한다.**
  상태는 `usePortfolio` 의 `진행중`·`단계` 가 갖는다 — 어디서 눌렀든 막은 하나라 `app.vue` 에 한 번만 선다.

  - 레이아웃이 바뀌어도(`layout-official` → `default`) 막이 끊기지 않게 레이아웃 **바깥**에 둔다.
  - 들어설 때만 살짝 늦춘다 — 이미 그 계정이라 이동만 하는 경우엔 번쩍이지 않는다.
-->
<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200 ease-out delay-150"
      leave-active-class="transition-opacity duration-150 ease-in"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="안내"
        class="fixed inset-0 z-[70] flex items-center justify-center bg-default/75 px-4 backdrop-blur-sm"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <div class="flex w-full max-w-xs flex-col items-center gap-4 rounded-xl border border-default bg-default p-6 text-center shadow-xl">
          <div class="relative flex size-12 items-center justify-center">
            <UIcon
              name="i-lucide-loader-circle"
              class="absolute size-12 animate-spin text-primary/40"
            />
            <UIcon
              :name="안내.icon"
              class="size-5 text-primary"
            />
          </div>
          <div class="flex flex-col gap-1">
            <p class="font-semibold text-highlighted">
              {{ 안내.역할 }} 계정으로 들어가는 중
            </p>
            <p class="text-sm text-muted">
              {{ 단계문구 }}
            </p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePortfolio, type PortfolioStep } from '~/composables/usePortfolio'

const { 역할s, 진행중, 단계 } = usePortfolio()

const 안내 = computed(() => 역할s.find(역할 => 역할.email === 진행중.value) ?? null)

const 단계문구s: Record<PortfolioStep, string> = {
  '': '잠시만 기다려 주세요',
  '로그아웃': '앞 계정에서 나오는 중입니다',
  '로그인': '체험 계정으로 로그인하는 중입니다',
  '화면': '첫 화면을 여는 중입니다'
}
const 단계문구 = computed(() => 단계문구s[단계.value])
</script>

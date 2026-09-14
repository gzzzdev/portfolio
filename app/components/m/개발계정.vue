<!--
  개발 계정 여닫이. 로그인 창 **맨 아래 작은 글자 하나**로만 서 있다가, 누르면 계정 칩이 편다.

  펼친 채로 두지 않는 이유 — 개발 계정은 운영에선 없는 줄이라, 늘 보이면 창의 디자인을
  **운영에 없는 것 기준으로** 보게 된다. 닫힌 모양이 곧 운영 모양이다.
  열림은 기억하지 않는다(다음에 열면 다시 닫혀 있다) — 같은 이유다.

  운영에서는 목록이 비어 아무것도 안 그린다(`use로그인`).

  **`안내` 판** — 포트폴리오 배포에서 리뷰어가 소셜 버튼을 누르면 켜진다(`m로그인모달`).
  소셜 가입을 시킬 수는 없으니, 여닫이 대신 "개발 계정을 이용해주세요" 안내와 계정 칩을 편다.
-->
<template>
  <div
    v-if="개발로그인s.length && 안내"
    ref="안내판"
    class="w-full rounded-2xl border border-default bg-elevated/60 px-4 py-3.5"
  >
    <p class="flex items-center justify-center gap-1.5 text-sm font-medium text-highlighted">
      <UIcon
        name="i-lucide-code-xml"
        class="size-4"
      />
      개발 계정을 이용해주세요
    </p>
    <p class="mt-1 text-xs text-muted">
      포트폴리오 사이트예요 · 누르면 바로 로그인돼요
    </p>
    <div class="mt-3 flex flex-wrap justify-center gap-1.5">
      <button
        v-for="방법 in 개발로그인s"
        :key="방법.label"
        type="button"
        class="rounded-full border border-default bg-default px-3 py-1.5 text-xs text-default transition-colors hover:border-accented hover:bg-elevated disabled:opacity-50"
        :disabled="방법.disabled || authStore.isLoading"
        @click="방법.onSelect"
      >
        {{ 방법.label }}
      </button>
    </div>
  </div>
  <div
    v-else-if="개발로그인s.length"
    class="flex w-full flex-col items-center"
  >
    <button
      type="button"
      class="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs text-dimmed transition-colors hover:bg-elevated hover:text-muted"
      :aria-expanded="열림"
      @click="열림 = !열림"
    >
      <UIcon
        name="i-lucide-code-xml"
        class="size-3.5"
      />
      개발 계정
      <UIcon
        name="i-lucide-chevron-down"
        class="size-3.5 transition-transform"
        :class="열림 ? 'rotate-180' : ''"
      />
    </button>
    <div
      v-if="열림"
      class="mt-2 flex flex-wrap justify-center gap-1.5"
    >
      <button
        v-for="방법 in 개발로그인s"
        :key="방법.label"
        type="button"
        class="rounded-full border border-default px-3 py-1 text-xs text-default transition-colors hover:border-accented hover:bg-elevated disabled:opacity-50"
        :disabled="방법.disabled || authStore.isLoading"
        @click="방법.onSelect"
      >
        {{ 방법.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMyAuthStore } from '~/stores/useMyAuthStore'
import { use로그인 } from '~/composables/use로그인'

/** 여닫이 대신 안내와 함께 편다. 위 머리말 */
const 안내 = defineModel<boolean>('안내', { default: false })

const authStore = useMyAuthStore()

/** 비회원 칸까지 펴진 긴 창에선 맨 아래가 가려져 있다 — 펼친 자리까지 내려 준다. */
const 안내판 = useTemplateRef<HTMLElement>('안내판')
watch(안내, async (is안내) => {
  if (!is안내) return
  await nextTick()
  안내판.value?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
})
const { 개발로그인s } = await use로그인()

const 열림 = ref(false)
</script>

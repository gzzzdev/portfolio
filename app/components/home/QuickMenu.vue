<!--
  홈 퀵메뉴 — 왼쪽에 고정된 섹션 목록. 옛 랜딩 `l/QuickMenu_l`(250c23b 에서 지워짐)을 되살렸다.
  활성은 흔적(막대)이 길어지고, 아이콘이 아니라 줄 전체가 손잡이다.

  스크롤 스파이까지 여기서 한다 — 홈마다 같은 계산을 다시 적지 않게. 판정은 dashboard2 와 같다:
  화면 35% 선을 지난 마지막 섹션. 레이아웃이 창 대신 안쪽 상자를 굴릴 수 있어 `capture` 로 받는다.

  내용 폭(`--ui-container`, 지금 1280)과 겹치지 않을 만큼 창이 넓을 때만 선다 — 양옆 100px씩 여유.
-->
<template>
  <nav
    class="fixed top-1/2 left-0 z-40 hidden -translate-y-1/2 select-none min-[1480px]:block"
    :aria-label="ariaLabel"
  >
    <div class="flex flex-col gap-4 px-4 py-2">
      <button
        v-for="항 in items"
        :key="항.id"
        type="button"
        class="group flex items-center gap-2.5 text-left"
        :aria-current="항.id === 활성 ? 'location' : undefined"
        @click="이동(항.id)"
      >
        <span
          class="shrink-0 rounded-sm transition-[width,height,background-color] duration-200"
          :class="항.id === 활성 ? 'h-[3px] w-6 bg-inverted' : 'h-[2px] w-2 bg-inverted/25 group-hover:w-4'"
          aria-hidden="true"
        />
        <span
          class="text-xs tracking-[0.15em] transition-colors"
          :class="항.id === 활성 ? 'font-semibold text-highlighted' : 'text-muted group-hover:text-default'"
        >{{ 항.label }}</span>
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const props = withDefaults(defineProps<{
  items: { id: string, label: string }[]
  ariaLabel?: string
}>(), {
  ariaLabel: '페이지 섹션 이동'
})

const 활성 = ref(props.items[0]?.id ?? '')

const 이동 = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

let raf = 0
const 훑기 = () => {
  cancelAnimationFrame(raf)
  raf = requestAnimationFrame(() => {
    const 선 = window.innerHeight * 0.35
    let 지금 = props.items[0]?.id ?? ''
    for (const 항 of props.items) {
      const el = document.getElementById(항.id)
      if (el && el.getBoundingClientRect().top <= 선) 지금 = 항.id
    }
    활성.value = 지금
  })
}
onMounted(() => {
  document.addEventListener('scroll', 훑기, { passive: true, capture: true })
  window.addEventListener('resize', 훑기, { passive: true })
  훑기()
})
onBeforeUnmount(() => {
  document.removeEventListener('scroll', 훑기, { capture: true })
  window.removeEventListener('resize', 훑기)
  cancelAnimationFrame(raf)
})
</script>

<template>
  <div class="inline-flex items-center justify-center">
    <div
      class="relative inline-flex items-center justify-center"
      :class="{ 'opacity-60': readonly }"
    >
      <svg
        viewBox="0 0 100 100"
        class="size-20 -rotate-90"
      >
        <circle
          cx="50"
          cy="50"
          :r="radius"
          class="text-muted/40"
          fill="none"
          :stroke-width="strokeWidth"
          stroke="currentColor"
        />
        <circle
          cx="50"
          cy="50"
          :r="radius"
          class="text-primary"
          fill="none"
          :stroke-width="strokeWidth"
          stroke-linecap="round"
          stroke="currentColor"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="dashOffset"
        />
      </svg>

      <span class="absolute text-sm font-semibold tabular-nums text-highlighted">{{ percent }}%</span>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 0~100 을 원 하나로 보여준다. **입력칸이 아니라 표시 부품이다.**
 *
 * 2026-09-05 까지 `Input/숫자3.vue` 였고 `타입지정._.숫자3` 으로 폼에 꽂을 수 있었는데,
 * 이 파일에는 처음부터 상호작용이 한 줄도 없었다 — 클릭도 드래그도 입력도 없고 `readonly`
 * 는 흐리게만 만든다. 폼에 얹으면 수정모드로 바꿔도 이 칸만 혼자 안 변한다.
 * (`model견본` 에 전 타입을 깔아놓고 나서야 눈에 띄었다.)
 *
 * 값을 **고치는** 원형 컨트롤이 필요해지면 이걸 고치지 말고 `Input/` 아래에 따로 만들 것 —
 * 표시와 입력은 같은 그림을 쓸 뿐 다른 물건이다.
 */
import { computed } from 'vue'

interface Props {
  readonly?: boolean
}
withDefaults(defineProps<Props>(), {
  readonly: false
})

const model = defineModel<string | number | null>({ required: false, default: null })
const strokeWidth = 10
const radius = 42
const circumference = 2 * Math.PI * radius

const percent = computed(() => {
  const value = Number(model.value)
  if (Number.isNaN(value)) return 0
  return Math.max(0, Math.min(100, Math.round(value)))
})

const dashOffset = computed(() => circumference * (1 - percent.value / 100))
</script>

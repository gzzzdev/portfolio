<!--
  색 고르는 판. **지금 아무 화면도 안 쓴다**(2026-09-07 확인) — 남겨 둔 것은 의도다.

  짝이던 `m/ColorPicker.vue`(31줄, 얇은 판)는 같은 날 지웠다. 둘 다 죽어 있는데 둘이라
  다음에 여는 사람이 어느 쪽이 본체인지 알 수 없었다. 남는 건 이쪽 하나다.

  썸(손잡이) 색은 `mTheme.css` 「면(surface)」 블록의 부품 손잡이 칸을 따른다 — `m/Slider` 와 같은 값.
-->
<template>
  <div :class="wrapperClass">
    <div
      v-if="showCaptionRow"
      class="mb-1.5 flex min-h-4 items-end justify-between gap-2 px-0.5 text-xs text-muted"
    >
      <span class="tabular-nums">{{ captionLabel }}</span>
      <span class="font-mono text-[0.625rem] tabular-nums opacity-70">{{ currentHex }}</span>
    </div>

    <div class="relative flex w-full items-center">
      <!-- 채도 슬라이더 막대(그라데이션) — 실제 값은 이산 팔레트 인덱스 -->
      <div
        aria-hidden="true"
        class="pointer-events-none absolute inset-x-0 top-1/2 z-0 h-2 -translate-y-1/2 rounded-full border border-accented/60 shadow-[inset_0_1px_3px_rgba(0,0,0,0.12)] dark:border-accented/50 dark:shadow-[inset_0_1px_3px_rgba(0,0,0,0.45)]"
        :style="{ background: stripGradient }"
      />

      <USlider
        v-model="model"
        :min="0"
        :max="maxIdx"
        :step="1"
        class="relative z-10 w-full cursor-pointer"
        v-bind="sliderAttrs"
        :ui="sliderUi"
      />
    </div>

    <div
      v-if="labels"
      class="mt-3 flex flex-row items-center justify-between gap-2 text-sm leading-normal text-muted"
    >
      <span>{{ labels.left }}</span>
      <span>{{ labels.right }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 팔레트 색을 채도 막대(그라데이션)처럼 보이게 하는 이산 슬라이더.
 * model 은 0..colors.length-1 인덱스.
 */
interface Props {
  /** hex 등 CSS 색 문자열 — 좌→우로 채도가 올라가는 것처럼 배열해 두면 됨 */
  colors: readonly string[]
  labels?: { left: string, right: string }
  /** 상단 라벨: false 이면 숨김, 문자열이면 문구 지정, 기본 `채도` */
  caption?: string | boolean
  wrapperClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  caption: undefined,
  wrapperClass: 'mx-1 my-2 flex w-full min-w-20 flex-col'
})

const showCaptionRow = computed(() => props.caption !== false)
const captionLabel = computed(() => {
  if (props.caption === false)
    return ''
  if (typeof props.caption === 'string' && props.caption.length)
    return props.caption
  return '채도'
})

const model = defineModel<number>({ required: true })

const attrs = useAttrs()
const sliderAttrs = computed(() => {
  const { class: _c, ...rest } = attrs as Record<string, unknown>
  return rest
})

const maxIdx = computed(() => Math.max(0, props.colors.length - 1))

const stripGradient = computed(() => {
  const c = props.colors
  if (!c.length)
    return 'linear-gradient(90deg, #888, #888)'
  if (c.length === 1)
    return `linear-gradient(90deg, ${c[0]}, ${c[0]})`
  return `linear-gradient(90deg, ${c.join(', ')})`
})

const currentHex = computed(() => {
  const i = Math.min(Math.max(0, model.value ?? 0), maxIdx.value)
  return props.colors[i] ?? '—'
})

const sliderUi = computed(() => ({
  root: 'relative flex w-full select-none touch-none items-center',
  track:
        'relative min-h-9 flex grow w-full min-w-0 items-center overflow-visible rounded-full bg-transparent [&::before]:hidden',
  range: '!h-0 !min-h-0 !opacity-0',
  thumb:
        'z-20 h-4 w-4 rounded-full border-2 border-white bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.28),0_2px_6px_rgba(0,0,0,0.18)] dark:border-neutral-200 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.35),0_2px_8px_rgba(0,0,0,0.5)]'
}))
</script>

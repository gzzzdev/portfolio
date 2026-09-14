<!--
  목록 카드의 **그림 자리**. `portrait`·`landscape`·`row` 셋이 같이 쓴다.

  **자리가 모양을 정하고 그림은 거기 맞춘다**(`object-cover`). 예전엔 카드마다 폭만 정하고
  높이를 그림에 맡겼다(`h-auto`) — 그러면 그림 모양이 곧 카드 모양이 된다. 정사각 아바타(회원)는
  그럴듯했고, 나머지 표지 그림은 전부 16:9(1376×768 — 역할·등급·수업·행사·설문·퀴즈·투표,
  2026-09-11 실측)라 세로카드에선 120×67, 가로카드에선 64×36 의 가는 띠가 됐다.

  **그림이 없거나 깨져도 자리는 남는다** — 아이콘, 그것도 없으면 라벨 첫 글자. 자리를 둘지 말지는
  이 부품이 아니라 목록이 정한다(`Item.vue` 의 `그림칸`). 예전엔 `@error` 폴백이 없어 깨진 그림의
  alt 글자가 최종 상태였다.

  **표지 칸(`비율` 있음)에서 모양이 너무 다르면 자르지 않고 담는다.** 정사각 아바타를 16:10 에
  채우면 얼굴이 위아래로 잘린다. 로드 후 실제 비율이 칸과 1.3배 넘게 다르면 `object-contain`.
  정사각 **표시** 칸은 늘 채운다 — 16:9 를 44px 에 담으면 여백만 남은 띠가 된다.
-->
<template>
  <div
    class="relative shrink-0 overflow-hidden bg-elevated"
    :style="props.비율 ? { aspectRatio: props.비율 } : undefined"
  >
    <NuxtImg
      v-if="props.src && !깨짐"
      ref="ref그림"
      :src="props.src"
      :alt="props.alt"
      :width="props.px"
      :height="props.비율 ? undefined : props.px"
      loading="lazy"
      class="block size-full"
      :class="담기 ? 'object-contain p-1' : 'object-cover'"
      @load="on로드"
      @error="깨짐 = true"
    />
    <div
      v-else
      class="flex size-full items-center justify-center text-dimmed"
    >
      <UIcon
        v-if="props.icon"
        :name="props.icon"
        :class="props.아이콘cls"
      />
      <span
        v-else
        class="font-medium text-muted"
      >{{ 머리글자 }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  src?: string
  icon?: string
  alt?: string
  /** CSS aspect-ratio (`'16 / 10'`). 없으면 담은 자리가 크기를 정한다(정사각 표시 칸) */
  비율?: string
  /** 요청 폭(px). ipx 가 줄여 준다 — 원본 600KB 를 64px 칸에 받지 않게 */
  px?: number
  아이콘cls?: string
}>(), {
  src: undefined,
  icon: undefined,
  alt: '',
  비율: undefined,
  px: 128,
  아이콘cls: 'size-6'
})

const 깨짐 = ref(false)
const 담기 = ref(false)
watch(() => props.src, () => {
  깨짐.value = false
  담기.value = false
})

const 칸비율 = computed(() => {
  if (!props.비율) return 1
  const [w, h] = props.비율.split('/').map(Number)
  return w && h ? w / h : 1
})

const ref그림 = useTemplateRef<{ $el?: HTMLImageElement }>('ref그림')

/**
 * **`e.target` 을 믿지 않는다.** 하이드레이션 전에 이미 받아진 그림이면 `NuxtImg` 가 `load` 를
 * 다시 쏘는데, 그 이벤트는 새로 만든 것이라 `target` 이 `null` 이다 — 그대로 읽으면 화면이 500 으로 죽는다
 * (`/decisions/theme/selection` 에서 실제로 났다). 그래서 요소는 ref 로 잡는다.
 */
const on로드 = (e?: Event) => {
  if (!props.비율) return
  const img = (e?.target as HTMLImageElement | null) ?? ref그림.value?.$el
  if (!img?.naturalWidth || !img.naturalHeight) return
  const 차 = (img.naturalWidth / img.naturalHeight) / 칸비율.value
  담기.value = 차 > 1.3 || 차 < 1 / 1.3
}

const 머리글자 = computed(() => (props.alt ?? '').trim().slice(0, 1))
</script>

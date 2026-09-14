<template>
  <UChip
    v-if="text !== undefined || number > 0"
    v-bind="binds"
  >
    <slot />
  </UChip>
  <slot v-else />
</template>

<script setup lang="ts">
interface Props {
  text?: string
  number?: number
  size: string
  color: string
  class: string
  icon: string
}
const props = withDefaults(defineProps<Props>(), {
  text: undefined,
  number: 0,

  size: '3xl',
  /**
     * **강조색을 쓰는 건 여기가 예외 셋 중 하나라서다.** `mTheme.css` 면 블록:
     * *"primary 면이 허용되는 곳은 셋 — solid 부품(강조·켜짐), 상태 알림, **선택 표시**."*
     * 호출부 넷이 전부 「고른 필터 개수」·「그 칸에 걸린 수」라 셋째 칸에 든다
     * (`목록5`·`_view필터조건`). 개수가 0이면 아예 안 그리므로 화면당 한둘이고,
     * 그래서 칠해도 화면이 물들지 않는다 — `역할="강조"` 에 붙은 규율과 같은 근거다.
     */
  color: 'primary',
  class: '',
  icon: ''
})

const text = computed(() => props.text ?? (props.number > 0 ? props.number : undefined))

const binds = computed(() => {
  return {
    ...props,
    text: toValue(text)
  }
})
</script>

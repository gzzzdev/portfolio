<template>
  <div
    class="flex max-h-full min-h-0 min-w-0 flex-1 flex-row items-center gap-2 overflow-hidden"
  >
    <UTabs
      v-model="model"
      variant="link"
      v-bind="attrs"
      :content="false"
      class="min-h-0 max-h-full min-w-0 flex-1 overflow-hidden"
      :ui="tabsUi"
    />
    <slot name="top" />
  </div>
</template>

<script setup lang="ts">
interface Props {
  side?: 'left' | 'right'
}
/**
 * **`inheritAttrs: false` — 여기선 사고가 아니라 위생이다.**
 *
 * `v-bind="attrs"` 로 attrs 를 손수 펴 주는데 fallthrough 가 한 번 더 얹힌다.
 * 다만 이 컴포넌트의 **뿌리는 `UTabs` 가 아니라 바깥 `<div>`** 라, 그 두 번째는 div 로 가고
 * `:ui="tabsUi"`·`:content` 는 안 지워진다(`m/Button/Button.vue` 는 뿌리가 단일 컴포넌트라
 * 사정이 다르다 — 그 파일 머리말). 그래서 지금 깨지는 건 없고, 대신 `ui="[object Object]"`
 * 같은 값이 감싸개 div 에 HTML 속성으로 찍힌다. 그걸 안 나가게 하는 것이 이 한 줄이다.
 */
defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<Props>(), {
  side: 'left'
})

const attrs = useAttrs()

const model = defineModel<string>({ required: true, default: '0' })

const tabsUi = {
  root: 'max-h-full min-h-0 min-w-0 flex flex-col justify-center overflow-hidden p-0 m-0',
  list: 'max-h-full w-fit max-w-full flex-nowrap gap-1 border-b-0 p-0 m-0',
  trigger: 'cursor-pointer shrink-0 py-1 text-sm leading-tight',
  indicator: 'bottom-0',
  label: 'truncate'
}
</script>

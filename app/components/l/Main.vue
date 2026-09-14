<template>
  <UMain
    class="relative flex w-full flex-1 flex-col"
    :class="[
      isolateViewport ? 'min-h-0 overflow-hidden' : '',
      화면높이class
    ]"
  >
    <div
      ref="mainScrollEl"
      class="mx-auto flex w-full min-w-0 flex-col flex-1"
      :class="isolateViewport ? 'min-h-0 overflow-y-auto' : ''"
    >
      <slot />
    </div>
  </UMain>
</template>

<script setup lang="ts">
const mainScrollEl = useTemplateRef<HTMLElement>('mainScrollEl')
provide('layout:mainScrollEl', mainScrollEl)

interface Props {
  is화면높이?: boolean
  /**
   * true: 뷰포트 한 칸에 메인 고정 + 내부 스크롤(예: `layout-side` h-dvh 셸).
   * false: Nuxt UI 권장과 같이 문서(`window`) 스크롤 — 푸터가 본문 길이 끝에 붙음.
   */
  isolateViewport?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  is화면높이: !false,
  isolateViewport: false
})
const { isHeader: layoutIsHeader } = useAppLayout()

const 화면높이class = computed(() => {
  if (!props.is화면높이) return ''
  if (props.isolateViewport) {
    return layoutIsHeader.value
      ? 'h-[calc(100dvh-var(--ui-layout-header-offset,var(--ui-header-height)))]'
      : 'h-[calc(100dvh)]'
  }
  /** 문서 스크롤: 최소 한 화면은 채우되 콘텐츠만큼 늘어남 */
  return layoutIsHeader.value
    ? 'min-h-[calc(100dvh-var(--ui-layout-header-offset,var(--ui-header-height)))]'
    : 'min-h-dvh'
})
</script>

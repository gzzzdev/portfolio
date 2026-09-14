<template>
  <div
    ref="container"
    class=" flex flex-row h-full w-full overflow-y-auto min-h-0 select-none relative mx-auto "
    :class="{ 'flex-row-reverse': props.reverse }"
  >
    <div
      class="flex-shrink-0 overflow-y-auto min-h-0"
      :class="panelTransitionClass"
      :style="{ flexBasis: `${ratio}%`, minWidth: '1%', maxWidth: '99%' }"
    >
      <slot name="left" />
    </div>
    <div
      v-if="can수정"
      class="group relative -mx-1 z-10 flex w-3 shrink-0 cursor-col-resize flex-col items-center justify-center rounded-full py-3 transition-colors duration-200 hover:bg-elevated/60"
      :class="{ 'bg-primary/10 dark:bg-primary/15': dragging }"
      @mousedown="onDragStart"
      @touchstart.prevent="onDragStart"
    >
      <div
        class="h-8 w-[3px] rounded-full m-층-카드 ring-1 transition-all duration-200 ease-out"
        :class="
          dragging
            ? 'scale-y-[1.02] bg-primary m-층-떠있음 ring-primary/25 dark:bg-primary-400 dark:ring-primary-400/30'
            : 'bg-accented ring-accented group-hover:bg-primary group-hover:shadow group-hover:ring-primary/20 dark:group-hover:bg-primary-400'
        "
      />
    </div>
    <div
      class="flex-grow overflow-y-auto min-h-0"
      :class="panelTransitionClass"
      :style="{ flexBasis: `${100 - ratio}%`, minWidth: '1%', maxWidth: '99%' }"
    >
      <slot name="right" />
    </div>
  </div>
</template>

<script lang="ts">
</script>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useEventListener } from '@vueuse/core'

interface Props {
  can수정?: boolean
  reverse?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  can수정: !false,
  reverse: false
})
const ratio = defineModel<number>({ default: 50, required: true })
const container = ref<HTMLElement | null>(null)
const dragging = ref(false)
const panelTransitionClass = computed(() =>
  dragging.value
    ? 'transition-none'
    : 'transition-[flex-basis] duration-200 ease-in-out'
)

function getClientX(e: MouseEvent | TouchEvent) {
  return 'touches' in e ? e.touches[0].clientX : e.clientX
}

function onDragStart(e: MouseEvent | TouchEvent) {
  dragging.value = true
  document.body.style.cursor = 'col-resize'
}

function onDrag(e: MouseEvent | TouchEvent) {
  if (!dragging.value || !container.value) return
  const clientX = getClientX(e)
  const rect = container.value.getBoundingClientRect()
  let newRatio = ((clientX - rect.left) / rect.width) * 100
  newRatio = Math.max(1, Math.min(99, Math.round(newRatio)))
  ratio.value = newRatio
}

function onDragEnd() {
  dragging.value = false
  document.body.style.cursor = ''
}

useEventListener(window, 'mousemove', onDrag)
useEventListener(window, 'mouseup', onDragEnd)
useEventListener(window, 'touchmove', onDrag)
useEventListener(window, 'touchend', onDragEnd)
</script>

<template>
  <div :class="wrapperClass">
    <USlider
      v-model="model"
      :min="min"
      :max="max"
      class="cursor-pointer"
      v-bind="sliderAttrs"
      :variants="{
      // color: {
      //   primary: {
      //     range: 'bg-red-500',
      //     // thumb: 'ring-primary focus-visible:outline-primary/50'
      //   },
      // }
      }"
      :ui="{
        root: 'relative flex w-full select-none touch-none items-center',
        // ' ' + props.rangeClass +
        range:
          props.rangeColor != undefined
            ? getStyle(radius, 'radius') + ' absolute top-1/2 z-[1] -translate-y-1/2 !h-1.5 rounded-full bg-gradient-to-r from-primary/50 to-primary/30 m_range'
            : getStyle(radius, 'radius') + ' absolute top-1/2 z-[1] -translate-y-1/2 !h-1.5 rounded-full bg-gradient-to-r from-primary/50 to-primary/30',
        //  + (props.rangeColor != undefined) ? 'm_range' : '',//(props.rangeColor == undefined ? '' : ``),
        // 보이는 막대는 얇게(before), 히트 영역만 min-h-11
        track: getStyle(radius, 'radius') + ' relative min-h-7 flex grow w-full min-w-0 items-center overflow-hidden rounded-full bg-transparent before:pointer-events-none before:absolute before:inset-x-0 before:top-1/2 before:z-0 before:h-1 before:-translate-y-1/2 before:rounded-full before:bg-accented',

        thumb: 'z-10 h-3 w-3 rounded-md bg-white border border-neutral-300 m-층-카드'
      }"
    />

    <div
      v-if="labels"
      class="mt-4 flex flex-row items-center justify-between gap-2 text-sm leading-normal"
    >
      <div v-if="labels">
        {{ labels?.left }}
      </div>
      <div v-if="labels">
        {{ labels?.right }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useThemeStore } from '~/stores/useThemeStore'

interface Props {
  labels?: { left: string, right: string }
  min?: number
  max?: number
  rangeClass?: string
  rangeColor?: string
  wrapperClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  // rangeClass: 'bg-red-500',
  // rangeColor: 'blue-500',
  // labels: () => ({ left: 'left', right: 'right' }),
  // mt≠mb 이면 flex row + items-center 일 때 마진 박스 중심과 슬라이더 시각 중심이 어긋남
  wrapperClass: 'flex w-full min-w-20 flex-col mx-1 my-2'
})
const rangeColor = computed(() => props.rangeColor)

const model = defineModel<number>()

const attrs = useAttrs()
const sliderAttrs = computed(() => attrs)
const themeStore = useThemeStore()

const { radius } = toRefs(themeStore)

const list = [
  { radius: 'rounded-lg', value: 0.5 },
  { radius: 'rounded-md', value: 0.375 },
  { radius: 'rounded-sm', value: 0.25 },
  { radius: 'rounded-xs', value: 0.125 },
  { radius: 'rounded-none ', value: 0 }
]
const getStyle = (value: number, type: 'radius') => {
  return list.find(v => v.value === value)?.[type] + ' '
}
</script>

<style>
.m_range {
  /* background-color: v-bind(rangeColor); */
  background: v-bind(rangeColor);
}
</style>

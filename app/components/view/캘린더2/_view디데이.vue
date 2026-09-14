<template>
  <div
    v-if="isVisible"
    class="inline-flex items-center gap-1 text-xs"
    :class="{ 'text-error': isExceeded }"
  >
    <mChart미니
      type="pie"
      :data="elapsedPercent"
      :size="17"
      :reverse="!true"
      class="font-light"
      :class="[props.colorClass, { 'text-error': isExceeded }]"
      :style="props.colorStyle"
    />
    <span>{{ ddayLabel }}</span>
  </div>
</template>

<script setup lang="ts">
import { mDayjs } from '~utils'
import mChart미니 from '~/components/m/Chart/미니.vue'

type LabelMode = 'dday' | 'current'

const props = withDefaults(defineProps<{
  baseDate: Date | string
  startDate?: Date | string
  targetDate: Date | string
  labelMode?: LabelMode
  colorClass?: string
  colorStyle?: string | Record<string, string>
}>(), {
  labelMode: 'dday',
  colorClass: 'text-primary',
  colorStyle: undefined
})

const formatDayCount = (days: number) => {
  if (days < 10_000) return days.toLocaleString('ko-KR')
  const man = days / 10_000
  const value = Number.isInteger(man) ? `${man}` : man.toFixed(1)
  return `${value}만`
}

const formatYearCount = (days: number) => {
  const year = days / 365
  const rounded = Math.round(year * 10) / 10
  return Number.isInteger(rounded) ? `${rounded}년` : `${rounded.toFixed(1)}년`
}

const formatDdayDistance = (days: number) => {
  if (days >= 365) return formatYearCount(days)
  return formatDayCount(days)
}

const formatDistance = (days: number) => {
  if (days >= 365) {
    return {
      unit: 'Y',
      value: (days / 365).toFixed(1)
    }
  }

  return {
    unit: 'D',
    value: formatDayCount(days)
  }
}

const daysDiff = computed(() => {
  const base = mDayjs(props.baseDate).startOf('day')
  const target = mDayjs(props.targetDate).startOf('day')
  return target.diff(base, 'day')
})

const isVisible = computed(() => {
  if (!props.startDate) return true
  const base = mDayjs(props.baseDate).startOf('day')
  const start = mDayjs(props.startDate).startOf('day')
  return !base.isBefore(start)
})

const isExceeded = computed(() => daysDiff.value < 0)

const elapsedPercent = computed(() => {
  if (!props.startDate) return daysDiff.value < 0 ? 100 : 0

  const start = mDayjs(props.startDate).startOf('day')
  const base = mDayjs(props.baseDate).startOf('day')
  const target = mDayjs(props.targetDate).startOf('day')
  const total = target.diff(start, 'day')
  if (total <= 0) return base.isSameOrAfter(target, 'day') ? 100 : 0

  const elapsed = base.diff(start, 'day')
  const raw = Math.round((elapsed / total) * 100)
  return Math.min(100, Math.max(0, raw))
})

const ddayLabel = computed(() => {
  if (daysDiff.value === 0) return 'D-day'
  const distance = formatDdayDistance(Math.abs(daysDiff.value))

  if (props.labelMode === 'dday') {
    return daysDiff.value > 0 ? `D-${distance}` : `D+${distance}`
  }

  const currentDistance = formatDistance(Math.abs(daysDiff.value))
  return daysDiff.value > 0
    ? `${currentDistance.unit}-${currentDistance.value}`
    : `${currentDistance.unit}+${currentDistance.value}`
})
</script>

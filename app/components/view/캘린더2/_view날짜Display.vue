<template>
  <p class="px-2 text-muted">
    {{ currentDateLabel }}
  </p>
</template>

<script setup lang="ts">
type ViewType = 'day' | 'week' | 'month' | 'year' | 'life' | 'life2'

const props = defineProps<{
  selectedDate: Date
  view: ViewType
}>()

const formatters = {
  weekDay: new Intl.DateTimeFormat('ko-KR', { month: 'numeric', day: 'numeric' }),
  month: new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long' }),
  year: new Intl.DateTimeFormat('ko-KR', { year: 'numeric' })
} as const

const getWeekRange = (baseDate: Date) => {
  const day = baseDate.getDay()
  const offset = day === 0 ? -6 : 1 - day
  const start = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate() + offset)
  return { start, end: new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6) }
}

const currentDateLabel = computed(() => props.view === 'day'
  ? `${props.selectedDate.getFullYear()}년 ${props.selectedDate.getMonth() + 1}월 ${props.selectedDate.getDate()}일`
  : props.view === 'week'
    ? (({ start, end }) => `${formatters.weekDay.format(start)} - ${formatters.weekDay.format(end)}`)(getWeekRange(props.selectedDate))
    : props.view === 'month'
      ? formatters.month.format(props.selectedDate)
      : props.view === 'year'
        ? formatters.year.format(props.selectedDate)
        : `${formatters.year.format(props.selectedDate)}생`)
</script>

<template>
  <view공통박스
    title="브리핑"
    :sub="기간라벨"
    :content="요약문"
    :bottom="보조문"
    body-class="flex flex-col gap-1 rounded-md border border-default/50 bg-muted/10 p-2"
  >
    <template #header-right>
      <UBadge
        size="sm"
        :label="뷰라벨"
      />
    </template>
    <template #footer>
      <UBadge
        v-for="tag in 태그목록"
        :key="tag"
        size="sm"
        :label="tag"
      />
    </template>
  </view공통박스>
</template>

<script setup lang="ts">
import view공통박스 from './공통박스.vue'
import type { ViewType, 브리핑문구 } from '../props'

interface Props {
  view: ViewType
  selectedDate: Date
  briefing: 브리핑문구
}

const props = defineProps<Props>()

const 포맷터 = {
  day: new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' }),
  weekDay: new Intl.DateTimeFormat('ko-KR', { month: 'numeric', day: 'numeric' }),
  month: new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long' }),
  year: new Intl.DateTimeFormat('ko-KR', { year: 'numeric' })
} as const

const 현재브리핑 = computed(() => props.briefing[props.view])
const 뷰라벨 = computed(() => 현재브리핑.value.viewLabel)

const getWeekRange = (baseDate: Date) => {
  const start = new Date(baseDate)
  const day = start.getDay()
  const offset = day === 0 ? -6 : 1 - day
  start.setDate(start.getDate() + offset)
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  return { start, end }
}

const 기간라벨 = computed(() => {
  if (props.view === 'day') {
    return `${포맷터.day.format(props.selectedDate)} ${현재브리핑.value.periodText}`
  }
  if (props.view === 'week') {
    const { start, end } = getWeekRange(props.selectedDate)
    return `${포맷터.weekDay.format(start)} - ${포맷터.weekDay.format(end)} ${현재브리핑.value.periodText}`
  }
  if (props.view === 'month') {
    return `${포맷터.month.format(props.selectedDate)} ${현재브리핑.value.periodText}`
  }
  if (props.view === 'year') {
    return `${포맷터.year.format(props.selectedDate)} ${현재브리핑.value.periodText}`
  }
  return `${포맷터.year.format(props.selectedDate)}생 ${현재브리핑.value.periodText}`
})

const 요약문 = computed(() => 현재브리핑.value.summary)

const 보조문 = computed(() => 현재브리핑.value.bottom)

const 태그목록 = computed(() => 현재브리핑.value.tags)
</script>

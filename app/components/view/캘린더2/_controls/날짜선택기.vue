<template>
  <view공통박스
    :title="monthLabel"
    body-class="rounded-md border border-default/50 bg-muted/10 p-1"
  >
    <template #header-right>
      <UFieldGroup>
        <mButton
          역할="조용"
          size="xs"
          class="h-5 w-5 p-0"
          icon="i-lucide-chevron-left"
          aria-label="이전 기간"
          @click="movePeriod(-1)"
        />
        <mButton
          역할="조용"
          size="xs"
          class="h-5 w-5 p-0"
          icon="i-lucide-chevron-right"
          aria-label="다음 기간"
          @click="movePeriod(1)"
        />
      </UFieldGroup>
    </template>

    <UCalendar
      v-model="calendarDate"
      class="rounded-md border-0 bg-transparent p-0 text-xs"
      :ui="{
        heading: 'hidden',
        header: 'hidden',
        weekdays: 'text-[0.625rem]',
        weekday: 'text-[0.625rem]',
        cell: 'h-6 w-6',
        day: 'h-6 w-6 text-[0.6875rem]'
      }"
    />
  </view공통박스>
</template>

<script setup lang="ts">
import { CalendarDate } from '@internationalized/date'
import view공통박스 from './공통박스.vue'

type ViewType = 'day' | 'week' | 'month' | 'year' | 'life' | 'life2'

interface Props {
  view: ViewType
}

const props = defineProps<Props>()
const selectedDate = defineModel<Date>({ required: true })

const formatters = {
  month: new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long' })
} as const

const toCalendarDate = (date: Date) => new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate())

const clampToDate = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())

const monthLabel = computed(() => formatters.month.format(selectedDate.value))

const calendarDate = computed({
  get: () => toCalendarDate(selectedDate.value),
  set: (v: CalendarDate) => {
    selectedDate.value = clampToDate(new Date(v.year, v.month - 1, v.day))
  }
})

const movePeriod = (direction: -1 | 1) => {
  const next = new Date(selectedDate.value)
  if (props.view === 'year') {
    next.setFullYear(next.getFullYear() + direction)
  } else if (props.view === 'life' || props.view === 'life2') {
    next.setFullYear(next.getFullYear() + direction * 10)
  } else if (props.view === 'month') {
    next.setMonth(next.getMonth() + direction)
  } else if (props.view === 'week') {
    next.setDate(next.getDate() + direction * 7)
  } else {
    next.setDate(next.getDate() + direction)
  }
  selectedDate.value = clampToDate(next)
}
</script>

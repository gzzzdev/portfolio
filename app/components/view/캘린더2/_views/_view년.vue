<template>
  <div class="year-grid h-full min-h-0 overflow-auto rounded-lg border border-default/50 bg-default/40 p-3">
    <div class="grid grid-cols-1 justify-items-center gap-x-6 gap-y-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      <section
        v-for="monthDate in monthDates"
        :key="monthDate.getMonth()"
        class="w-full max-w-[260px] rounded-lg p-2.5"
      >
        <header class="mb-1.5 px-1 text-sm font-semibold text-muted">
          {{ formatMonth(monthDate) }}
        </header>

        <UCalendar
          v-model="calendarValue"
          :placeholder="toCalendarDate(monthDate)"
          :default-placeholder="toCalendarDate(monthDate)"
          :month-controls="false"
          :year-controls="false"
          :fixed-weeks="false"
          :week-starts-on="0"
          variant="ghost"
          :ui="ui"
          class="border-0 bg-transparent p-0"
        />
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CalendarDate } from '@internationalized/date'

const selectedDate = defineModel<Date>({ default: () => new Date() })

const monthFormatter = new Intl.DateTimeFormat('ko-KR', { month: 'long' })

const toCalendarDate = (date: Date) => new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate())

const toDateOnly = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())

const monthDates = computed(() => {
  const year = selectedDate.value.getFullYear()
  return Array.from({ length: 12 }, (_, monthIndex) => new Date(year, monthIndex, 1))
})

const calendarValue = computed({
  get: () => toCalendarDate(selectedDate.value),
  set: (value: CalendarDate) => {
    selectedDate.value = toDateOnly(new Date(value.year, value.month - 1, value.day))
  }
})

const formatMonth = (date: Date) => monthFormatter.format(date)

const ui = {
  root: 'w-full bg-transparent',
  header: 'hidden',
  heading: 'hidden',
  body: 'w-full bg-transparent',
  grid: 'w-full bg-transparent',
  gridWeekDaysRow: 'mb-1',
  headCell: 'h-6 text-xs font-medium text-muted',
  cell: 'h-7 w-8 p-0',
  cellTrigger: 'h-7 w-8 rounded-md text-sm font-normal transition data-[selected]:bg-primary data-[selected]:text-inverted data-today:border data-today:border-primary data-today:bg-primary/10 data-today:text-primary'
} as const
</script>

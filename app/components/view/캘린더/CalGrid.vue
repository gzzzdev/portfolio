<template>
  <div class="cal-grid-wrap min-h-0 flex-1 overflow-hidden rounded-xl border border-default/40 bg-default">
    <FullCalendar
      ref="fullCalendar"
      class="cal-fc h-full w-full"
      :class="{ 'is-red-sunday': is빨간날 }"
      :options="options"
    >
      <template #eventContent="{ event, view }">
        <CalEventDot
          v-if="view.type === 'multiMonthYear'"
          :title="event.title"
          :color="event.extendedProps.color ?? event.backgroundColor"
        />
        <CalEventRow
          v-else
          :title="event.title"
          :color="event.extendedProps.color ?? event.backgroundColor"
          :tag="event.extendedProps.tag"
          :icon="event.extendedProps.icon"
          :more-count="event.extendedProps.moreCount"
        />
      </template>
    </FullCalendar>
  </div>
</template>

<script setup lang="ts">
import FullCalendar from '@fullcalendar/vue3'
import type { CalendarOptions } from '@fullcalendar/core'
import CalEventDot from './CalEventDot.vue'
import CalEventRow from './CalEventRow.vue'
import type { CalendarGridExpose } from './useCalendarMonth'

defineProps<{
  options: CalendarOptions
  is빨간날?: boolean
}>()

const fullCalendar = ref<{ getApi: CalendarGridExpose['getApi'] } | null>(null)

defineExpose<CalendarGridExpose>({
  getApi: () => fullCalendar.value?.getApi()
})
</script>

<style scoped>
.cal-grid-wrap {
    background: var(--ui-bg);
}

.cal-fc :deep(.fc) {
    --cal-accent: #3b82f6;
    --cal-border: color-mix(in oklab, var(--color-default) 12%, transparent);
    --cal-muted-read: var(--color-muted);
    --cal-muted-strong: color-mix(in oklab, var(--color-default) 72%, transparent);
    --cal-year-day-text: #4b5563;
    --cal-year-day-other-text: #9ca3af;
    --fc-border-color: var(--cal-border);
    --fc-neutral-text-color: var(--cal-muted-read);
    --fc-page-bg-color: transparent;
    --fc-neutral-bg-color: transparent;
    --fc-today-bg-color: color-mix(in oklab, var(--cal-accent) 8%, transparent);
    --fc-event-text-color: var(--color-default);
    height: 100%;
    font-family: inherit;
}

.cal-fc :deep(.fc-scrollgrid) {
    border: none;
}

.cal-fc :deep(.fc-col-header-cell) {
    padding: 0.65rem 0;
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--color-muted);
    background: transparent;
    border-color: var(--cal-border);
}

.cal-fc :deep(.fc-daygrid-day) {
    background: var(--ui-bg);
}

.cal-fc :deep(.fc-daygrid-day-frame) {
    min-height: 7.5rem;
    padding: 0.35rem 0.4rem 0.25rem;
}

.cal-fc :deep(.fc-daygrid-day-top) {
    flex-direction: row;
    justify-content: flex-end;
    padding-bottom: 0.15rem;
}

.cal-fc :deep(.fc-daygrid-day-number) {
    font-size: 0.8rem;
    font-weight: 500;
    color: var(--color-muted);
    padding: 0.15rem 0.35rem;
    border-radius: 0.375rem;
}

.cal-fc :deep(.fc-day-today .fc-daygrid-day-number) {
    background: var(--cal-accent);
    color: var(--ui-text-inverted);
    font-weight: 600;
}

.cal-fc :deep(.fc-daygrid-day-events) {
    margin-top: 0;
    overflow: hidden;
}

.cal-fc :deep(.fc-daygrid-event) {
    margin: 0 0 3px !important;
    border: none !important;
    background: transparent !important;
    box-shadow: none !important;
}

.cal-fc :deep(.fc-daygrid-event-harness) {
    margin: 0 !important;
}

.cal-fc :deep(.fc-daygrid-event .fc-event-main) {
    padding: 0;
    color: inherit;
}

.cal-fc :deep(.fc-daygrid-more-link) {
    margin-top: 2px;
    font-size: 0.7rem;
    font-weight: 600;
    color: var(--cal-accent);
}

.cal-fc :deep(.fc-more-popover) {
    display: none !important;
}

.cal-fc :deep(.is-red-sunday .fc-day-sun .fc-col-header-cell-cushion),
.cal-fc :deep(.is-red-sunday .fc-day-sun .fc-daygrid-day-number) {
    color: #ef4444;
}

.cal-fc :deep(.fc-timegrid-slot-label) {
    font-size: 0.7rem;
    font-weight: 500;
    color: var(--color-muted);
    vertical-align: top;
}

.cal-fc :deep(.fc-timegrid-slot) {
    height: 2.25rem;
}

.cal-fc :deep(.fc-timegrid-col.fc-day-today) {
    background: color-mix(in oklab, var(--cal-accent) 5%, transparent);
}

.cal-fc :deep(.fc-timegrid-now-indicator-line) {
    border-color: #ef4444;
    border-width: 2px;
}

.cal-fc :deep(.fc-timegrid-now-indicator-arrow) {
    border-top-color: #ef4444;
    border-bottom-color: #ef4444;
}

.cal-fc :deep(.fc-timegrid-event) {
    margin: 0 1px 1px !important;
    border: none !important;
    background: transparent !important;
    background-color: transparent !important;
    border-color: transparent !important;
    box-shadow: none !important;
    color: var(--color-default) !important;
    --fc-event-text-color: var(--color-default);
}

.cal-fc :deep(.fc-timegrid-event .fc-event-main) {
    padding: 0 2px;
    color: var(--color-default) !important;
}

.cal-fc :deep(.fc-timegrid-event .fc-event-title),
.cal-fc :deep(.fc-timegrid-event .fc-event-time) {
    color: var(--color-default) !important;
}

.cal-fc :deep(.fc-timegrid-event.is-bundle) {
    cursor: pointer;
}

.cal-fc :deep(.fc-timegrid-event.is-bundle .cal-event-title) {
    font-weight: 500;
}

.cal-fc :deep(.fc-timegrid-allday .fc-daygrid-event) {
    margin: 0 0 3px !important;
}

.cal-fc :deep(.fc-multimonth) {
    --fc-border-color: var(--cal-border);
}

.cal-fc :deep(.fc-multimonth-month) {
    flex: 1 1 33.333%;
    background: var(--ui-bg);
    border-color: var(--cal-border);
}

.cal-fc :deep(.fc-multimonth-title) {
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--cal-muted-strong);
    text-align: center;
    background: var(--ui-bg);
}

.cal-fc :deep(.fc-multimonth .fc-scrollgrid-section-header > *) {
    background: var(--ui-bg) !important;
}

.cal-fc :deep(.fc-multimonth .fc-col-header),
.cal-fc :deep(.fc-multimonth .fc-col-header-cell) {
    background: var(--ui-bg) !important;
}

.cal-fc :deep(.fc-multimonth-daygrid-day-frame) {
    min-height: 1.75rem;
    padding: 0.1rem 0.15rem;
}

.cal-fc :deep(.fc-multimonth-daygrid-day-top) {
    padding-bottom: 0;
}

.cal-fc :deep(.fc-multimonth .fc-daygrid-day-number) {
    font-size: 0.55rem;
    font-weight: 500;
    color: var(--cal-year-day-text) !important;
    padding: 0.05rem 0.2rem;
}

.cal-fc :deep(.fc-multimonth-header-table),
.cal-fc :deep(.fc-multimonth-daygrid-table) {
    color: var(--cal-muted-read);
}

.cal-fc :deep(.fc-multimonth .fc-day-other .fc-daygrid-day-number) {
    color: var(--cal-year-day-other-text) !important;
}

.dark .cal-fc :deep(.fc) {
    --cal-muted-read: #9ca3af;
    --cal-muted-strong: #d1d5db;
    --cal-year-day-text: #6b7280;
    --cal-year-day-other-text: #4b5563;
    --fc-neutral-text-color: #6b7280;
}

.dark .cal-fc :deep(.fc-multimonth .fc-daygrid-day-number) {
    color: #6b7280 !important;
}

.dark .cal-fc :deep(.fc-multimonth .fc-day-other .fc-daygrid-day-number) {
    color: #4b5563 !important;
}

.dark .cal-fc :deep(.fc-multimonth .fc-multimonth-title) {
    color: #9ca3af !important;
}

.dark .cal-fc :deep(.fc-multimonth .fc-scrollgrid-section-header > *),
.dark .cal-fc :deep(.fc-multimonth .fc-col-header),
.dark .cal-fc :deep(.fc-multimonth .fc-col-header-cell) {
    background: var(--ui-bg) !important;
}

.dark .cal-fc :deep(.fc-multimonth .fc-multimonth-header-table),
.dark .cal-fc :deep(.fc-multimonth .fc-multimonth-daygrid-table) {
    color: #6b7280 !important;
}

.cal-fc :deep(.fc-multimonth-daygrid-day-events) {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 2px;
    margin: 0;
    min-height: 0;
}

.cal-fc :deep(.fc-multimonth-daygrid-event) {
    margin: 0 !important;
    border: none !important;
    background: transparent !important;
    box-shadow: none !important;
    width: auto !important;
}

.cal-fc :deep(.fc-multimonth-daygrid-event .fc-event-main) {
    padding: 0;
}

.cal-fc :deep(.fc-multimonth-daygrid-event .fc-event-title) {
    display: none;
}

.cal-fc :deep(.fc-multimonth-daygrid-more-link) {
    margin: 0;
    padding: 0;
    font-size: 0.5rem;
    font-weight: 600;
    line-height: 1;
    color: var(--cal-accent);
}
</style>

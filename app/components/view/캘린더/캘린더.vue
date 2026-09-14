<template>
  <div
    class="cal-shell flex h-full min-h-0 w-full gap-5 rounded-2xl border border-default/50 bg-default p-4 m-층-카드"
  >
    <aside class="cal-sidebar flex w-56 shrink-0 flex-col gap-6">
      <CalLegend
        v-model:enabled-keys="enabledKeys"
        :items="legendItems"
      />
    </aside>

    <div class="cal-main flex min-w-0 flex-1 flex-col gap-4">
      <CalToolbar
        :label="현재날짜"
        :view="현재뷰"
        @update:view="setView"
        @prev="goPrev"
        @next="goNext"
        @today="goToday"
      />
      <CalGrid
        ref="gridRef"
        :options="calendarOptions"
        :is-빨간날="is빨간날"
      />
    </div>

    <CalDayMoreModal
      v-model:open="isMoreOpen"
      :title="moreDayTitle"
      :items="moreItems"
    />
  </div>
</template>

<script setup lang="ts">
import CalDayMoreModal from './CalDayMoreModal.vue'
import CalGrid from './CalGrid.vue'
import CalLegend from './CalLegend.vue'
import CalToolbar from './CalToolbar.vue'
import { model달력s } from '~models/test2'
import type { CalEvent, CalLegendItem } from './types'
import { useCalendarMonth } from './useCalendarMonth'
import { useCalendarEvents } from './useCalendarEvents'

interface Props {
  events?: CalEvent[]
  legend?: CalLegendItem[]
  is빨간날?: boolean
  dayMaxEvents?: number
}

const events = defineModel<CalEvent[]>('events', { default: () => [] })
const props = withDefaults(defineProps<Props>(), {
  is빨간날: false,
  dayMaxEvents: 5
})

const legendItems = computed(() => props.legend?.length ? props.legend : toValue(model달력s.getInstance().범례))

const { gridRef, 현재뷰, 현재날짜, setView, onDatesSet, goToday, goPrev, goNext }
  = useCalendarMonth()

const {
  enabledKeys,
  calendarOptions,
  isMoreOpen,
  moreDayTitle,
  moreItems
} = useCalendarEvents(events, {
  dayMaxEvents: props.dayMaxEvents,
  initialView: 현재뷰,
  onDatesSet,
  legend: legendItems
})
</script>

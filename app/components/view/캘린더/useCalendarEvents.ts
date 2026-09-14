import type { DatesSetArg } from '@fullcalendar/core'
import dayGridPlugin from '@fullcalendar/daygrid'
import multiMonthPlugin from '@fullcalendar/multimonth'
import timeGridPlugin from '@fullcalendar/timegrid'
import { mDayjs } from '~utils'
import { model달력s } from '~models/test2'
import {
  bucketTimedEvents,
  formatBundleModalTitle,
  TIME_BUCKET_MINUTES
} from './bucketTimedEvents'
import type { CalViewId } from './calendarViews'
import type { CalEvent, CalLegendItem, CalMoreItem } from './types'

export const useCalendarEvents = (
  events: Ref<CalEvent[] | undefined>,
  options: {
    dayMaxEvents: number
    initialView: Ref<CalViewId>
    onDatesSet: (info: DatesSetArg) => void
    legend?: Ref<CalLegendItem[] | undefined>
  }
) => {
  const legendItems = computed(() =>
    options.legend?.value?.length ? options.legend.value : toValue(model달력s.getInstance().범례)
  )

  const enabledKeys = ref(new Set<string>(legendItems.value.map(x => x.key)))

  watch(
    legendItems,
    (items) => {
      enabledKeys.value = new Set(items.map(x => x.key))
    },
    { deep: true }
  )

  const eventLegendKey = (e: CalEvent): string =>
    e.legendKey
    ?? (e.source === 'member-joined' ? 'member-joined' : (e.entityType ?? e.source))

  const filteredEvents = computed(() =>
    (events.value ?? []).filter(e => enabledKeys.value.has(eventLegendKey(e)))
  )

  const toExclusiveEnd = (dayStart: Date) =>
    mDayjs(dayStart).add(1, 'day').startOf('day').toDate()

  const isTimeGridView = (v: CalViewId) => v === 'timeGridDay' || v === 'timeGridWeek'
  const isYearView = (v: CalViewId) => v === 'multiMonthYear'

  const toFcEvent = (e: CalEvent, view: CalViewId) => {
    const base = {
      id: e.id,
      title: e.title,
      extendedProps: {
        source: e.source,
        entityType: e.entityType,
        tag: e.tag,
        icon: e.icon,
        color: e.color,
        bundleItems: e.bundleItems,
        moreCount: e.moreCount
      }
    }

    if (isTimeGridView(view)) {
      const start = e.start
      const end
        = e.end && mDayjs(e.end).isAfter(mDayjs(start))
          ? e.end
          : mDayjs(start).add(30, 'minute').toDate()
      return {
        ...base,
        start,
        end,
        allDay: false,
        backgroundColor: 'transparent',
        borderColor: 'transparent'
      }
    }

    const day = mDayjs(e.start).startOf('day').toDate()
    const allDay = {
      ...base,
      start: day,
      end: toExclusiveEnd(day),
      allDay: true
    }

    if (isYearView(view)) {
      return {
        ...allDay,
        backgroundColor: 'transparent',
        borderColor: 'transparent'
      }
    }

    return {
      ...allDay,
      backgroundColor: e.color,
      borderColor: e.color
    }
  }

  /** 일/주: 슬롯당 1개만 표시, 2개부터 +n개 더 (가로 겹침 방지) */
  const TIME_MAX_VISIBLE = 1

  const prepareForView = (list: CalEvent[], view: CalViewId) =>
    isTimeGridView(view)
      ? bucketTimedEvents(list, TIME_MAX_VISIBLE, TIME_BUCKET_MINUTES)
      : list

  const toFcEvents = (list: CalEvent[], view: CalViewId) =>
    prepareForView(list, view).map(e => toFcEvent(e, view))

  const openBundleModal = (start: Date, items: CalMoreItem[]) => {
    moreDayTitle.value = formatBundleModalTitle(start)
    moreItems.value = items
    isMoreOpen.value = true
  }

  const onEventClick = (info: {
    event: {
      start: Date | null
      extendedProps: { bundleItems?: CalMoreItem[] }
    }
    jsEvent: MouseEvent
  }) => {
    const items = info.event.extendedProps?.bundleItems
    if (!items?.length || !info.event.start) return
    info.jsEvent.preventDefault()
    openBundleModal(info.event.start, items)
  }

  const isMoreOpen = ref(false)
  const moreDayTitle = ref('')
  const moreItems = ref<CalMoreItem[]>([])

  const onMoreLinkClick = (info: {
    date: Date
    jsEvent: MouseEvent
    allSegs: {
      event: {
        id: string
        title: string
        backgroundColor?: string
        extendedProps: { tag?: string, icon?: string }
      }
    }[]
  }) => {
    info.jsEvent.preventDefault()
    info.jsEvent.stopPropagation()

    moreDayTitle.value = mDayjs(info.date).format('YYYY년 M월 D일')
    moreItems.value = info.allSegs.map((seg, i) => ({
      id: String(seg.event.id || `more-${i}`),
      title: String(seg.event.title ?? ''),
      color: seg.event.backgroundColor,
      tag: seg.event.extendedProps?.tag,
      icon: seg.event.extendedProps?.icon
    }))
    isMoreOpen.value = true
    return 'handled'
  }

  const scrollTime = () => mDayjs().subtract(30, 'minute').format('HH:mm:ss')

  const timeGridShared = {
    nowIndicator: true,
    scrollTime: scrollTime(),
    slotMinTime: '00:00:00',
    slotMaxTime: '24:00:00',
    slotDuration: `00:${String(TIME_BUCKET_MINUTES).padStart(2, '0')}:00`,
    slotLabelInterval: '01:00:00',
    slotLabelFormat: { hour: 'numeric', minute: '2-digit', hour12: false },
    allDaySlot: true,
    expandRows: true
  }

  const currentView = computed(() => options.initialView.value)

  const calendarOptions = computed(() => ({
    locale: 'ko',
    headerToolbar: false,
    plugins: [dayGridPlugin, timeGridPlugin, multiMonthPlugin],
    initialView: currentView.value,
    showNonCurrentDates: true,
    weekends: true,
    events: toFcEvents(filteredEvents.value, currentView.value),
    eventDisplay: isYearView(currentView.value) ? 'block' : 'list-item',
    dayMaxEvents: isYearView(currentView.value) ? 12 : options.dayMaxEvents,
    moreLinkText: (n: number) => `+${n}개 더`,
    moreLinkClick: onMoreLinkClick,
    eventClick: onEventClick,
    eventClassNames: (arg: {
      event: { extendedProps: { moreCount?: number } }
    }) => (arg.event.extendedProps?.moreCount ? ['is-bundle'] : []),
    datesSet: options.onDatesSet,
    views: {
      timeGridDay: timeGridShared,
      timeGridWeek: timeGridShared,
      multiMonthYear: {
        type: 'multiMonthYear',
        duration: { years: 1 },
        multiMonthMaxColumns: 3,
        multiMonthMinWidth: 0,
        fixedWeekCount: false
      }
    }
  }))

  return {
    enabledKeys,
    calendarOptions,
    isMoreOpen,
    moreDayTitle,
    moreItems
  }
}

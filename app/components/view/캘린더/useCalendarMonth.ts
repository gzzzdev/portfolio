import type { DatesSetArg } from '@fullcalendar/core'
import { mDayjs } from '~utils'
import { isCalViewId, type CalViewId } from './calendarViews'

export type CalendarGridExpose = {
  getApi: () => {
    today: () => void
    prev: () => void
    next: () => void
    getDate: () => Date
    changeView: (view: string) => void
    scrollToTime: (time: string) => void
    view: { type: string }
  } | undefined
}

const formatRangeLabel = (view: CalViewId, start: Date, end: Date) => {
  const s = mDayjs(start)
  const e = mDayjs(end).subtract(1, 'millisecond')

  switch (view) {
    case 'timeGridDay':
      return s.format('YYYY년 M월 D일')
    case 'timeGridWeek': {
      if (s.isSame(e, 'day')) return s.format('YYYY년 M월 D일')
      if (s.year() !== e.year()) {
        return `${s.format('YYYY년 M월 D일')} – ${e.format('YYYY년 M월 D일')}`
      }
      if (s.month() !== e.month()) {
        return `${s.format('YYYY년 M월 D일')} – ${e.format('M월 D일')}`
      }
      return `${s.format('YYYY년 M월 D일')} – ${e.format('D일')}`
    }
    case 'multiMonthYear':
      return s.format('YYYY년')
    default:
      return s.format('YYYY년 M월')
  }
}

export const useCalendarMonth = () => {
  const gridRef = ref<CalendarGridExpose | null>(null)
  const 현재뷰 = ref<CalViewId>('dayGridMonth')
  const _rangeStart = ref<Date>()
  const _rangeEnd = ref<Date>()

  const api = computed(() => gridRef.value?.getApi?.())

  const 현재날짜 = computed(() => {
    if (_rangeStart.value && _rangeEnd.value) {
      return formatRangeLabel(현재뷰.value, _rangeStart.value, _rangeEnd.value)
    }
    return mDayjs().format('YYYY년 M월')
  })

  const syncFromApi = () => {
    const cal = api.value
    if (!cal) return
    const type = cal.view?.type
    if (isCalViewId(type)) {
      현재뷰.value = type
    }
  }

  const scrollToNow = () => {
    nextTick(() => {
      api.value?.scrollToTime(mDayjs().subtract(30, 'minute').format('HH:mm:ss'))
    })
  }

  const onDatesSet = (info: DatesSetArg) => {
    _rangeStart.value = info.start
    _rangeEnd.value = info.end
    const type = info.view.type
    if (isCalViewId(type)) {
      현재뷰.value = type
    }
    if (type === 'timeGridDay' || type === 'timeGridWeek') {
      scrollToNow()
    }
  }

  const setView = (view: CalViewId) => {
    현재뷰.value = view
    api.value?.changeView(view)
  }

  const goToday = () => {
    api.value?.today()
  }
  const goPrev = () => {
    api.value?.prev()
  }
  const goNext = () => {
    api.value?.next()
  }

  onMounted(() => {
    nextTick(syncFromApi)
  })

  const 현재기간시작 = computed(() => _rangeStart.value)

  return {
    gridRef,
    현재뷰,
    현재날짜,
    현재기간시작,
    setView,
    onDatesSet,
    goToday,
    goPrev,
    goNext
  }
}

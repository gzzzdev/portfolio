export type CalViewId = 'timeGridDay' | 'timeGridWeek' | 'dayGridMonth' | 'multiMonthYear'

export const CAL_VIEW_IDS: CalViewId[] = [
  'timeGridDay',
  'timeGridWeek',
  'dayGridMonth',
  'multiMonthYear'
]

export const isCalViewId = (v: string): v is CalViewId =>
  (CAL_VIEW_IDS as string[]).includes(v)

export const CAL_VIEW_TABS: { label: string, value: CalViewId }[] = [
  { label: '일', value: 'timeGridDay' },
  { label: '주', value: 'timeGridWeek' },
  { label: '월', value: 'dayGridMonth' },
  { label: '년', value: 'multiMonthYear' }
]

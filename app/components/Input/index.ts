import type { mDayjs } from '~utils'
import { mTime } from '~utils'
import { CalendarDate } from '@internationalized/date'

export const toCalendarDate = (_date: typeof mDayjs) => {
  const a = new CalendarDate(_date?.year() ?? 0, _date?.month() + 1, _date?.date())
  if ([isNaN(a.year), isNaN(a.month), isNaN(a.day)].some(x => x))
    return undefined
  return a
}

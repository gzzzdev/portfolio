import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc.js'
import timezone from 'dayjs/plugin/timezone.js'
import minMax from 'dayjs/plugin/minMax.js'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter.js'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore.js'

import { Time } from '@internationalized/date'
import { Solar, Lunar } from 'lunar-javascript'

export type mDayjs = Dayjs

// 이걸 써야 tz를 적용가능.
dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(minMax)
dayjs.extend(isSameOrAfter)
dayjs.extend(isSameOrBefore)

// GMT : 런던 그리니치의 경도 0°의 GMT 0, 한국은 GMT+9

// 기본 타임존(dayjs.tz.setDefault) 또는 전달된 tz를 사용해 생성
// export { dayjs as mDayjs };

// export const mDayjs_max = (...v: any) => dayjs.max(...v);

// export type i기간 = [ReturnType<typeof mDayjs>, ReturnType<typeof mDayjs>];
export type i기간 = [mDayjs, mDayjs]
export type i날짜 = mDayjs
type iMDayjs = {
  (date?: string | Date, tz?: string): Dayjs
  ageToDate: (rule: iAgeDueDateRule, birthDate?: string | Date, tz?: string) => Date
}

export const mDayjs = ((date: string | Date = new Date(), tz: string = 'Asia/Seoul') => {
  const hasTimezoneInfo
    = typeof date === 'string'
      && /(?:Z|[+-]\d{2}:\d{2})$/i.test(date.trim())

  const a = hasTimezoneInfo
    ? dayjs.utc(date).tz(tz)
    : dayjs(date).tz(tz)
  return a
}) as iMDayjs

export type iDateInput = string | Date | Dayjs
export interface iCompactDateRangeOptions {
  separator?: string
  openEndedLabel?: string
}
export const toCompactDates = (
  startDate: iDateInput,
  endDate?: iDateInput | null,
  options: iCompactDateRangeOptions = {}
) => {
  const separator = options.separator ?? '~'
  const openEndedLabel = options.openEndedLabel ?? '현재'
  const 시작일 = mDayjs(startDate as string | Date)
  if (!시작일?.isValid?.()) return ''
  const 시작 = 시작일.format('YY.MM.DD')

  const endRaw = typeof endDate === 'string' ? endDate.trim() : endDate
  if (endRaw == null || endRaw === '') return `${시작}${separator}${openEndedLabel}`
  const 종료일 = mDayjs(endRaw as string | Date)
  if (!종료일?.isValid?.()) return `${시작}${separator}${openEndedLabel}`
  if (시작일.isSame(종료일, 'day')) {
    const 시작시간 = 시작일.format('HH:mm')
    const 종료시간 = 종료일.format('HH:mm')
    return `${시작} ${시작시간}${separator}${종료시간}`
  }

  const 시작YY = 시작일.format('YY')
  const 종료YY = 종료일.format('YY')
  const 시작MM = 시작일.format('MM')
  const 종료MM = 종료일.format('MM')
  const 종료DD = 종료일.format('DD')

  const 종료조각s: string[] = []
  if (시작YY !== 종료YY) 종료조각s.push(종료YY)
  if (시작MM !== 종료MM) 종료조각s.push(종료MM)
  종료조각s.push(종료DD)
  return `${시작}${separator}${종료조각s.join('.')}`
}

export type iAgeDueDateRule = `age:${number}`

const parseAgeDueDateRule = (rule: iAgeDueDateRule): number => {
  const age = Number(rule.replace('age:', ''))
  if (!Number.isFinite(age)) {
    throw new Error(`Invalid dueDate rule: ${rule}`)
  }
  return age
}

export const ageToDate = (
  rule: iAgeDueDateRule,
  birthDate: string | Date = new Date(),
  tz: string = 'Asia/Seoul'
): Date => {
  const birth = mDayjs(birthDate, tz)
  if (!birth?.isValid?.()) {
    throw new Error(`Invalid birthDate: ${String(birthDate)}`)
  }

  const age = parseAgeDueDateRule(rule)
  return birth.startOf('day').add(age, 'year').toDate()
}

mDayjs.ageToDate = ageToDate

export class mTime extends Time {
  constructor(hour: number = mDayjs().hour(), minute: number = mDayjs().minute(), second: number = 0) {
    super(hour, minute, second)
  }
}
// export { Time }
// export const mTime = (hour: number = mDayjs().hour(), minute: number = mDayjs().minute(), second: number = 0) => {
//     // = mDayjs().second()
//     const a = new Time(hour, minute, second);
//     return a;
// }
// export const mTime = (hour: number = mDayjs().hour(), minute: number = mDayjs().minute(), second: number = 0): Time => {

//     // = mDayjs().second()
//     const a = new Time(hour, minute, second);
//     return a;
// }
// typeof v === 'object' &&
export const is_mTime = (v: any) => (v !== null && typeof v === 'object' && 'hour' in v && 'minute' in v && !('year' in v))
export const is_mDayjs = (v: any) => (v && typeof v === 'object' && 'year' in v && 'month' in v && 'day' in v)

export const is_Period = (v: any) => (Array.isArray(v) && v.length === 2 && is_mDayjs(v[0]) && is_mDayjs(v[1]))

// export const is_Period = (v: any) => (typeof v === 'object' && 'start' in v && 'end' in v);
// 타임존을 적용해도 절대시간으로 표시되나,
// format() 메서드를 사용시 Z를 붙여줘야함.
// hour(), minute() 등의 메서드를 사용하면 타임존을 적용한 시간을 반환함.

// class mDayjs2 {
//     _dayjs: dayjs.Dayjs;
//     constructor(tz: string = 'Asia/Seoul') {
//         this._dayjs = dayjs().tz(tz);
//     }

// }

export const sortByUpcoming = (aDate: Dayjs, bDate: Dayjs, 기준일 = mDayjs().startOf('month')) => {
  const a미래 = !aDate?.isBefore(기준일, 'day')
  const b미래 = !bDate?.isBefore(기준일, 'day')
  if (a미래 !== b미래) return a미래 ? -1 : 1
  return aDate?.diff(bDate)
}

export const getDDayLabel = (_date: Dayjs, _기준일: Dayjs = mDayjs()) => {
  // 시간을 제외하고 날짜만 비교하기 위해 startOf('day') 사용
  // const 남은일 = _date ? (_date.startOf('day').diff(_기준일.startOf('day'), 'day')-1) : 0;
  const 남은일 = _date ? (_date.startOf('day').diff(_기준일.startOf('day'), 'day')) : 0
  return 남은일 === 0 ? 'D-day' : 남은일 < 0 ? `D+${Math.abs(남은일)}` : `D-${남은일}`
}

export const toSolar = (d: mDayjs): mDayjs => {
  let solar = Lunar.fromYmd(d.year(), d.month() + 1, d.date())

  solar = solar.getSolar()// .getDay()
  const formattedString = `${solar.getYear()}-${solar.getMonth()}-${solar.getDay()}`
  const result = mDayjs(formattedString)
  return result
}

export const toLunar = (d: mDayjs): mDayjs => {
  const solar = Solar.fromYmd(d.year(), d.month() + 1, d.date())
  const lunar = solar.getLunar()

  const result = mDayjs(`${lunar.getYear()}-${lunar.getMonth()}-${lunar.getDay()}`)

  return result
}

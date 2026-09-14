import { generateNKeysBetween } from 'fractional-indexing'
import { mDayjs } from '../mDayjs'

import lodash from 'lodash'
/** 하나 뽑기. `as const` 목록도 그대로 넘길 수 있게 readonly 배열을 받는다. */
export const pick1 = <T>(array: readonly T[]): T => {
  if (array.length === 0) throw new Error('array is empty')
  return array[Math.floor(Math.random() * array.length)]!
}

/**
 * 섞기 (Fisher-Yates). 원본은 두고 섞은 새 배열을 돌려준다.
 *
 * `sort(() => Math.random() - 0.5)`를 쓰지 말 것 — 비교함수가 일관되지 않아 균등하게 안 섞인다.
 * 앞쪽 원소가 제자리에 남기 쉬워서, 뒤쪽에 몰아둔 항목일수록 뽑히지 않는다.
 */
export const shuffle = <T>(array: readonly T[]): T[] => {
  const a = [...array]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!]
  }
  return a
}

/** 중복 없이 n개 뽑기. 목록이 n보다 짧으면 있는 만큼만 준다. */
export const pickN = <T>(array: readonly T[], n: number): T[] =>
  shuffle(array).slice(0, Math.max(0, Math.floor(n)))

export const randomN = (min: number = 1, max: number = 100): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}
export const randomCoordi = (base: [number, number] = [35.965829, 126.954483], meter: number = 1000): [number, number] => {
  const randomBetween = (min: number, max: number): number => {
    const [start, end] = min <= max ? [min, max] : [max, min]
    return Math.random() * (end - start) + start
  }

  // `meter` is the side length of a square (in meters) centered on baseLat/baseLng.
  const halfSide = Math.max(0, meter) / 2
  const metersPerLatDeg = 111_320
  const cosLat = Math.cos((base[0] * Math.PI) / 180)
  const metersPerLngDeg = 111_320 * (Math.abs(cosLat) < 1e-6 ? 1e-6 : cosLat)

  const offsetLat = randomBetween(-halfSide, halfSide) / metersPerLatDeg
  const offsetLng = randomBetween(-halfSide, halfSide) / metersPerLngDeg

  return [base[0] + offsetLat, base[1] + offsetLng]
}

/**
 * `randomDate` 옵션이 받는 시점.
 * `Date` | `'2025-01-01'`·`'2025-01-01 09:00'` 같은 절대값 | `'-150d'`·`'+30d'`·`'now'` 같은 상대값.
 */
export type i시점 = Date | string

/**
 * 랜덤 날짜의 쏠림. 게시글·가입일은 최근이 촘촘한 게 자연스럽다.
 * `t0 + (t1 - t0) * random ** k` 로 굽힌다 — k<1이면 끝(최근)으로, k>1이면 앞(과거)으로 쏠린다.
 */
export type i쏠림 = '균등' | '최근' | '과거'

/**
 * 시각을 어떻게 채울지.
 * - `자정`     : 00:00:00. 날짜만 쓰는 값(생년월일)에 `03:42:06.972`가 붙으면 가짜 티가 난다.
 *                (`from`이 자정이 아니면 첫날만은 `from` 시각 그대로다 — 범위 밖으로 나갈 순 없으므로)
 * - `활동시간` : 08~24시. 사람이 남긴 기록(게시글·신청)에 새벽 시각이 섞이는 걸 막는다.
 * - `하루종일` : 24시간 균등 (연도 인자로 부르는 기존 방식의 동작).
 */
export type i시각대 = '자정' | '활동시간' | '하루종일'

export interface iRandomDateOptions {
  /** 하한. 기본 1년 전. */
  from?: i시점
  /** 상한. 기본 지금. 날짜만 준 문자열(`'2006-12-31'`)은 **그 날의 끝**으로 읽는다. */
  to?: i시점
  /** 기본 `균등`. */
  쏠림?: i쏠림
  /** 기본 `하루종일`. */
  시각?: i시각대
}

const 쏠림지수: Record<i쏠림, number> = { 균등: 1, 최근: 0.45, 과거: 2.2 }

const is날짜만 = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v.trim())
const 상대표현 = /^([+-]\d+)\s*(ms|s|m|h|d|w|M|y)$/

/** `'-150d'`·`'now'`·`'2025-01-01'`·`Date` 를 하나의 밀리초로 푼다. `is끝`이면 날짜만 준 값을 그 날의 끝으로 읽는다. */
const to시점 = (v: i시점 | undefined, 기본: () => Date, is끝 = false): number => {
  if (v == null) return 기본().getTime()
  if (v instanceof Date) return v.getTime()

  const t = v.trim()
  if (t === 'now') return Date.now()

  const 상대 = 상대표현.exec(t)
  if (상대) return mDayjs().add(Number(상대[1]), 상대[2] as any).valueOf()

  const d = mDayjs(t)
  return (is끝 && is날짜만(t) ? d.endOf('day') : d).valueOf()
}

/**
 * 범위 안의 랜덤 날짜.
 *
 * 연도 두 개(`randomDate(1980, 2006)`)로 부르던 기존 방식은 그대로 두고, 옵션 객체를 받는 쪽을 더했다.
 * 옵션 쪽은 세 가지를 더 할 수 있다 — 상대 표현(`'-150d'`), 쏠림, 시각대.
 *
 * 날짜를 먼저 고르고 그 날 안에서 시각을 채우는 2단 구조다. 시각을 나중에 덧씌우면
 * 값이 `from`/`to` 밖으로 삐져나가는데, 이렇게 하면 경계 날짜에서도 범위를 안 벗어난다.
 */
export function randomDate(startYear?: number, endYear?: number): Date
export function randomDate(options: iRandomDateOptions): Date
export function randomDate(a: number | iRandomDateOptions = 1940, b: number = new Date().getFullYear()): Date {
  const o: iRandomDateOptions = typeof a === 'object'
    ? a
    : { from: `${a}-01-01`, to: `${b}-12-31` }

  const _t0 = to시점(o.from, () => mDayjs().subtract(1, 'year').toDate())
  const _t1 = to시점(o.to, () => new Date(), true)
  const t0 = Math.min(_t0, _t1)
  const t1 = Math.max(_t0, _t1)

  // 1) 날짜 고르기. 쏠림은 여기에만 건다 (시각까지 굽힐 이유가 없다).
  const 첫날 = mDayjs(new Date(t0)).startOf('day')
  const 날수 = mDayjs(new Date(t1)).startOf('day').diff(첫날, 'day')
  const r = Math.random() ** 쏠림지수[o.쏠림 ?? '균등']
  const 고른날 = 첫날.add(Math.min(날수, Math.floor(r * (날수 + 1))), 'day')

  // 2) 그 날 안에서 실제로 허용되는 구간 (경계 날짜는 하루가 통째로 열려 있지 않다)
  let lo = Math.max(t0, 고른날.valueOf())
  let hi = Math.min(t1, 고른날.endOf('day').valueOf())

  const 시각 = o.시각 ?? '하루종일'
  if (시각 === '자정') return new Date(lo)
  if (시각 === '활동시간') {
    const a2 = Math.max(lo, 고른날.add(8, 'hour').valueOf())
    const b2 = Math.min(hi, 고른날.add(24, 'hour').valueOf())
    // 경계 날짜라 활동시간이 통째로 잘려나가면 그냥 허용 구간에서 뽑는다.
    if (a2 < b2) { lo = a2; hi = b2 }
  }
  return new Date(lo + Math.random() * (hi - lo))
}

export const randomDatebyDate = (start: Date = new Date(1970, 0, 1), end: Date = new Date()) => {
  const t0 = Math.min(start.getTime(), end.getTime())
  const t1 = Math.max(start.getTime(), end.getTime())
  return new Date(t0 + Math.random() * (t1 - t0))
}

/**
 * 범위 안에 통째로 들어가는 기간 하나.
 *
 * 길이를 먼저 정하고 그 길이가 들어갈 자리에서 시작을 고른다 — 시작부터 뽑으면 범위 끝에
 * 가까울수록 남은 자리가 없어 기간이 0일로 뭉개진다. (예전에는 그렇게 뭉개진 게 40%였다)
 * `최소일`/`최대일`로 길이를 묶을 수 있다. 안 주면 범위 안에서 자유롭게 잡는다.
 */
export const randomPeriod = (_start = randomDate(), _end?: Date, a?: { 최소일?: number, 최대일?: number }): [Date, Date] => {
  const endCap = _end ?? new Date()
  const t0 = Math.min(_start.getTime(), endCap.getTime())
  const t1 = Math.max(_start.getTime(), endCap.getTime())
  const 폭 = t1 - t0

  const 최소 = Math.min(폭, Math.max(0, a?.최소일 ?? 0) * 86400_000)
  const 최대 = Math.min(폭, Math.max(최소, (a?.최대일 ?? Number.MAX_SAFE_INTEGER) * 86400_000))

  const 길이 = 최소 + Math.random() * (최대 - 최소)
  const start = t0 + Math.random() * (폭 - 길이)
  return [new Date(start), new Date(start + 길이)]
}

export const get유튜브영상길이 = async (url: string): Promise<number> => {
  if (!url || (!url.includes('youtube') && !url.includes('youtu.be'))) return 0

  try {
    const result = await $fetch<{ totalTime: number }>('/api/youtube/duration', {
      method: 'GET',
      query: { url }
    })
    return result?.totalTime ?? 0
  } catch {
    return 0
  }
}
export const clone = (original: any) => lodash.cloneDeep(original)

export const delay = (ms: number = 1000) => new Promise(r => setTimeout(r, ms))

//

export const mIndexing = (a?: string | null, b?: string | null, n?: number) => {
  const start = a ?? null
  const end = b ?? null

  if (n == null) return generateNKeysBetween(start, end, 1)

  const count = Math.floor(n)
  if (count <= 0) return []
  return generateNKeysBetween(start, end, count)
}

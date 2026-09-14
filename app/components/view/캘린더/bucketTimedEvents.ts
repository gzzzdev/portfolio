import { mDayjs } from '~utils'
import type { CalEvent, CalMoreItem } from './types'

/** 일/주 뷰 시간대 묶음 단위(분) */
export const TIME_BUCKET_MINUTES = 15

const floorToBucket = (d: Date, bucketMinutes: number) => {
  const m = mDayjs(d)
  const remainder = m.minute() % bucketMinutes
  return m.subtract(remainder, 'minute').second(0).millisecond(0)
}

const toMoreItem = (e: CalEvent): CalMoreItem => ({
  id: e.id,
  title: e.title,
  color: e.color,
  tag: e.tag,
  icon: e.icon
})

/**
 * 같은 날·같은 N분 구간 이벤트를 묶음.
 * maxVisible(기본 1) 초과 시 월 뷰처럼 한 줄 +n개 더 (겹침 방지).
 */
export const bucketTimedEvents = (
  list: CalEvent[],
  maxVisible: number,
  bucketMinutes = TIME_BUCKET_MINUTES
): CalEvent[] => {
  const groups = new Map<string, CalEvent[]>()

  for (const e of list) {
    const slot = floorToBucket(e.start, bucketMinutes)
    const key = slot.format('YYYY-MM-DD HH:mm')
    const arr = groups.get(key) ?? []
    arr.push(e)
    groups.set(key, arr)
  }

  const out: CalEvent[] = []

  for (const [, items] of groups) {
    items.sort((a, b) => a.start.getTime() - b.start.getTime())

    if (items.length <= maxVisible) {
      out.push(...items)
      continue
    }

    const start = floorToBucket(items[0]!.start, bucketMinutes).toDate()
    const end = mDayjs(start).add(bucketMinutes, 'minute').toDate()
    const bundleItems = items.map(toMoreItem)
    const key = mDayjs(start).format('YYYY-MM-DD HH:mm')
    const first = items[0]!
    const moreCount = items.length - maxVisible

    out.push({
      id: `bundle:${key}`,
      title: first.title,
      start,
      end,
      color: first.color,
      source: first.source,
      sourceId: key,
      tag: first.tag,
      icon: first.icon,
      bundleItems,
      moreCount
    })
  }

  return out.sort((a, b) => a.start.getTime() - b.start.getTime())
}

export const formatBundleModalTitle = (start: Date, bucketMinutes = TIME_BUCKET_MINUTES) => {
  const s = mDayjs(start)
  const e = s.add(bucketMinutes, 'minute')
  return `${s.format('YYYY년 M월 D일')} ${s.format('H:mm')}–${e.format('H:mm')}`
}

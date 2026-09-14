export type CalLegendItem = {
  key: string
  label: string
  color: string
  icon: string
}

export type CalMoreItem = {
  id: string
  title: string
  color?: string
  tag?: string
  icon?: string
}

export type CalEvent = {
  id: string
  title: string
  start: Date
  end?: Date
  color?: string
  allDay?: boolean
  source: string
  sourceId: string
  /** 범례 필터 키 — 없으면 source / entityType 으로 추론 */
  legendKey?: string
  memberId?: string
  entityType?: string
  tag?: string
  icon?: string
  /** 일/주 뷰 시간대 묶음 — 클릭 시 모달에 펼침 */
  bundleItems?: CalMoreItem[]
  /** 묶음일 때 첫 항목 외 숨긴 개수 */
  moreCount?: number
}

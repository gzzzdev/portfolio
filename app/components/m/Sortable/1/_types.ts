import { is구분선, type i구분선 } from './_view구분선.vue'

export type RowId = string | number

export type RowItem = {
  id: RowId
  label: string
  icon?: string
  /** 생략 또는 true면 표시; false면 숨김 (카탈로그 미러 — 실제 저장은 folders 트리) */
  show?: boolean
}

/** folders 트리의 리프. bare id도 허용(하위호환 = show true) */
export type RowNode = {
  id: RowId
  /** 생략 또는 true면 표시; false면 숨김 */
  show?: boolean
}

export type FolderItem = {
  id: RowId
  label: string
  children: ChildItem[]
  /** 생략 또는 true면 표시; false면 숨김 */
  show?: boolean
}

export type ChildItem = RowId | RowNode | i구분선
export type SortableItem = FolderItem | RowId | RowNode | i구분선

export type i아이템 = RowItem
export type i아이템s = RowItem[]
export type i폴더아이템 = FolderItem
export type i행노드 = RowNode
export type i폴더s = SortableItem[]

export const isFolderItem = (item: unknown): item is FolderItem =>
  typeof item === 'object' && item !== null && !is구분선(item) && Array.isArray((item as FolderItem).children)

export const isRowNode = (item: unknown): item is RowNode =>
  typeof item === 'object'
  && item !== null
  && !is구분선(item)
  && !isFolderItem(item)
  && 'id' in item

export const rowIdOf = (item: RowId | RowNode): RowId =>
  isRowNode(item) ? item.id : item

export const isEntryShown = (item: RowId | RowNode | FolderItem): boolean => {
  if (isFolderItem(item) || isRowNode(item))
    return item.show !== false
  return true
}

/** show true면 bare id, false면 { id, show:false } */
export const toRowEntry = (id: RowId, show: boolean): RowId | RowNode =>
  show ? id : { id, show: false }

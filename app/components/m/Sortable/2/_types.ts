export type RowId = string | number

/** 구분선 — items에 함께 두고 rootIds/childIds로 참조 */
export type i구분선Item = {
  id: RowId
  is구분선: true
  label?: string
  childIds?: undefined
}

/** 일반 아이템. 모든 row가 childIds를 가질 수 있음 */
export type iSortable2Item = {
  id: RowId
  label: string
  icon?: string
  childIds?: RowId[]
}

export type iSortable2Items = Array<iSortable2Item | i구분선Item>

export const is구분선Item = (item: unknown): item is i구분선Item =>
  typeof item === 'object'
  && item !== null
  && (item as i구분선Item).is구분선 === true

export const isFolderItem = (item: unknown): item is iSortable2Item & { childIds: RowId[] } =>
  typeof item === 'object'
  && item !== null
  && !is구분선Item(item)
  && Array.isArray((item as iSortable2Item).childIds)

export type Sortable2Props = {
  is수정중?: boolean
  is계층?: boolean
  can선택?: boolean
  /** 외곽/row 보더·패딩 없이 임베드 (List 등) */
  bare?: boolean
  folderFrameClass?: string
  itemFrameClass?: string
}

export type Sortable2ListSlots = {
  'row-handle'?: (props: {
    id: RowId
    item: iSortable2Item
    depth: number
    isEditing: boolean
  }) => unknown
  'item-label'?: (props: {
    id: RowId
    item: iSortable2Item
    depth: number
    isEditing: boolean
    isSelected: boolean
    select: () => void
  }) => unknown
  'item-trailing'?: (props: {
    id: RowId
    item: iSortable2Item
    depth: number
    isEditing: boolean
  }) => unknown
  'item-top'?: (props: {
    id: RowId
    item: iSortable2Item
    depth: number
  }) => unknown
  'item-bot'?: (props: {
    id: RowId
    item: iSortable2Item
    depth: number
  }) => unknown
  'divider'?: (props: {
    id: RowId
    depth: number
    isEditing: boolean
    inset: boolean
  }) => unknown
}

export type Sortable2Slots = Sortable2ListSlots & {
  'folder-add'?: (props: {
    addFolder: () => void
    addDivider: () => void
    isEditing: boolean
    doFolder: { 추가: () => void }
  }) => unknown
}

export const SORTABLE2_KEY = Symbol('mSortable2')

export type Sortable2Ctx = {
  props: Required<Sortable2Props>
  itemsModel: { value: iSortable2Items }
  selected: { value: RowId | null | undefined }
  itemOf: (id: RowId) => iSortable2Item | undefined
  is구분선Id: (id: RowId) => boolean
  idKey: (id: RowId) => string
  do폴더: {
    추가: () => void
  }
  /** 없으면 []로 만들고 반환. 구분선이면 undefined */
  ensureChildIds: (id: RowId) => RowId[] | undefined
  wouldCreateCycle: (draggingId: RowId, targetId: RowId) => boolean
  /** 계층 자식 접힘 여부 */
  isCollapsed: (id: RowId) => boolean
  toggleCollapsed: (id: RowId) => void
}

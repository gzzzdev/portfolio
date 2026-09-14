import type { Props as ItemProps } from './_/Item.vue'
import type { ListCardItem } from './types'

export type Props = Pick<ItemProps, 'type' | 'can확장' | 'can'> & {
  items?: ListCardItem[]
  itemKey?: string
  추가라벨?: string
  do추가?: () => void | Promise<void>
  selectToggle?: boolean
  /** row + List2: mSortable2 DnD 활성 (상세 is수정중과 별개) */
  can정렬?: boolean
  /** row + List2: 계층 childIds 드롭존 */
  is계층?: boolean
}

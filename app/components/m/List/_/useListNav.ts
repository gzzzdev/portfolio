import type { MaybeRefOrGetter, Ref } from 'vue'
import { toValue, watch, nextTick } from 'vue'

type Id = string | number

type Opts<T> = {
  root: MaybeRefOrGetter<HTMLElement | null | undefined>
  items: MaybeRefOrGetter<T[] | undefined>
  /** 현재 열 수. useGridCols가 레이아웃에 쓰는 것과 같은 값이어야 한다. */
  cols: MaybeRefOrGetter<number>
  selectedId: Ref<Id | null>
  idOf: (item: T) => Id | undefined
  onSelect: (item: T) => void
  /** scrollIntoView 대상 셀렉터. 기본: [data-list-idx="{idx}"] */
  itemSelector?: (idx: number) => string
}

const KEYS: Record<string, [dx: number, dy: number]> = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1]
}

export function useListNav<T>(opts: Opts<T>) {
  const itemSelector = opts.itemSelector
    ?? ((idx: number) => `[data-list-idx="${idx}"]`)

  const onKeydown = (e: KeyboardEvent) => {
    if (e.target !== toValue(opts.root)) return
    const [dx, dy] = KEYS[e.key] ?? []
    if (dx == null || dy == null) return
    e.preventDefault()

    const items = toValue(opts.items) ?? []
    const i = items.findIndex(item => opts.idOf(item) == opts.selectedId.value)
    if (i < 0) {
      if (items[0]) opts.onSelect(items[0])
      return
    }

    let n = i + dx + dy * toValue(opts.cols)
    if (dy > 0 && n >= items.length) n = items.length - 1 // 마지막 줄이 덜 찬 경우
    if (n !== i && n >= 0 && n < items.length) opts.onSelect(items[n]!)
  }

  watch(opts.selectedId, (id) => {
    if (id == null) return
    const items = toValue(opts.items) ?? []
    const idx = items.findIndex(item => opts.idOf(item) == id)
    if (idx < 0) return
    nextTick(() => requestAnimationFrame(() => {
      toValue(opts.root)
        ?.querySelector<HTMLElement>(itemSelector(idx))
        ?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }))
  })

  return { onKeydown }
}

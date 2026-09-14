<template>
  <div
    ref="ref_root"
    class="flex flex-col overflow-y-auto min-h-0 h-full py-2 outline-none [&_[data-list-idx]]:scroll-mt-1"
    tabindex="0"
    @keydown="onKeydown"
  >
    <!-- row: mSortable2 컨테이너 + Item UI 슬롯 -->
    <template v-if="isRow">
      <mSortable2
        v-model:items="sortableItems"
        v-model:root-ids="rootIds"
        :is수정중="!!is수정중 && !!props.can정렬"
        :is계층="!!props.is계층"
        :can선택="false"
        bare
      >
        <template #item-label="{ id }">
          <div
            v-if="cardOf(id)"
            class="min-w-0 grow"
          >
            <Item
              v-bind="toProps({
                ...props,
                item: cardOf(id)!,
                idx: idxOf(id),
                selected: is선택됨(cardOf(id)!),
                그림칸,
                표지비율,
                deferBody: true
              })"
              v-model:is수정중="is수정중"
              @select="do선택(cardOf(id)!)"
              @close="selectedId = null"
            >
              <template #trailing="scope">
                <slot
                  name="trailing"
                  v-bind="scope"
                />
              </template>
            </Item>
          </div>
        </template>

        <template #item-bot="{ id }">
          <div
            v-if="cardOf(id) && is선택됨(cardOf(id)!)"
            class="min-w-0 px-1 pb-1"
            @click.stop
          >
            <view상세4
              v-if="cardOf(id)!.model"
              v-model:is수정중="is수정중"
              is투명
              class="p-0!"
              :model-value="cardOf(id)!.model"
              :can="props.can"
              @on-close="selectedId = null"
            />
            <template v-else>
              <View렌더
                v-if="cardOf(id)!.content"
                class="ml-3 my-3"
                :model-value="cardOf(id)!.content"
              />
              <slot
                name="body"
                v-bind="{
                  item: cardOf(id)!,
                  idx: idxOf(id),
                  selected: true
                }"
              />
            </template>
          </div>
        </template>

        <!-- 폴더/구분선 추가 UI 숨김 — List는 do추가 Item 사용 -->
        <template #folder-add>
          <span />
        </template>
      </mSortable2>

      <Item
        v-if="props.do추가"
        v-bind="toProps({ ...props, isAdd: true, label: props.추가라벨 })"
        @add="props.do추가?.()"
      />
    </template>

    <!-- portrait / landscape: 기존 그리드 -->
    <!-- px-2: 선택 배지가 카드 밖으로 6px 나갈 자리 (`m/테마/선택표시.ts` 「함정 2」) -->
    <div
      v-else
      ref="ref_grid"
      class="grid pt-2 px-2"
      :style="gridStyle"
    >
      <Item
        v-for="(item, idx) in itemsModel"
        :key="`${idOf(item)}-${idx}`"
        v-bind="toProps({ ...props, item, idx, selected: is선택됨(item), 그림칸, 표지비율 })"
        v-model:is수정중="is수정중"
        @select="do선택(item)"
        @close="selectedId = null"
      >
        <template #trailing="scope">
          <slot
            name="trailing"
            v-bind="scope"
          />
        </template>
        <template #body="scope">
          <slot
            name="body"
            v-bind="scope"
          />
        </template>
      </Item>
      <Item
        v-if="props.do추가"
        v-bind="toProps({ ...props, isAdd: true, label: props.추가라벨 })"
        @add="props.do추가?.()"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import Item, { toProps } from './_/Item.vue'
import { useGridCols } from './_/useGridCols'
import { useListNav } from './_/useListNav'
import type { Props as ListProps } from './props'
import type { ListCardItem } from './types'
import type { iSortable2Items, RowId } from '@/components/m/Sortable/2/_types'

export type Props = ListProps

type List2Props = Omit<ListProps, 'items'> & {
  can정렬?: boolean
  is계층?: boolean
}

const props = withDefaults(defineProps<List2Props>(), {
  type: 'row',
  itemKey: 'id',
  추가라벨: undefined,
  do추가: undefined,
  selectToggle: undefined,
  can확장: false,
  can정렬: !false,
  is계층: !false,
  can: () => ({
    생성: false,
    수정: false,
    삭제: false
  })
})

const itemsModel = defineModel<ListCardItem[]>('items', { default: () => [] })
const selectedId = defineModel<string | number | null>('selectedId', { default: null })
const tab = defineModel<string>('tab', { default: '' })
const is수정중 = defineModel<boolean>('is수정중', { default: false })

const { tap } = useSfx()
const slots = useSlots()
const ref_root = useTemplateRef<HTMLElement>('ref_root')

const isRow = computed(() => props.type === 'row')

/** 그림 자리는 목록이 정한다 — 한 장이라도 그림이 있으면 모두 자리를 갖는다(`_/Item.vue` 의 `그림칸`) */
const 그림칸 = computed(() => itemsModel.value.some(item => !!item?.thumbnail))
/** 표지 칸 비율도 목록 단위 — 첫 장 값으로 맞춘다. 섞인 목록에서 줄마다 칸이 달라지면 격자가 깨진다 */
const 표지비율 = computed(() => itemsModel.value.find(item => item?.표지비율)?.표지비율)

const ref_grid = useTemplateRef<HTMLElement>('ref_grid')
const { cols, gridStyle } = useGridCols(ref_grid, () => props.type)

const idOf = (item: ListCardItem) => item?.[props.itemKey as keyof ListCardItem] as RowId | undefined

const cardById = computed(() => {
  const map = new Map<RowId, ListCardItem>()
  for (const item of itemsModel.value) {
    const id = idOf(item)
    if (id != null) map.set(id, item)
  }
  return map
})

const cardOf = (id: RowId) => cardById.value.get(id)

const sortableItems = ref<iSortable2Items>([])
const rootIds = ref<RowId[]>([])
let syncingFromDrag = false
let syncingFromItems = false

const sameIdOrder = (a: RowId[], b: RowId[]) =>
  a.length === b.length && a.every((id, i) => id === b[i])

const childIdsOf = (item: ListCardItem | undefined): RowId[] =>
  Array.isArray(item?.childIds) ? [...item.childIds] as RowId[] : []

/** sortable → itemsModel (순서 + childIds) */
const writeItemsFromSortable = () => {
  const byId = cardById.value
  const next: ListCardItem[] = []
  const used = new Set<RowId>()

  const pushId = (id: RowId) => {
    if (used.has(id)) return
    const card = byId.get(id)
    if (!card) return
    used.add(id)
    const row = sortableItems.value.find(r => r.id === id)
    const childIds = props.is계층 && row && !('is구분선' in row && row.is구분선)
      ? [...(row.childIds ?? [])]
      : undefined
    next.push(childIds !== undefined ? { ...card, childIds } : { ...card, childIds: undefined })
  }

  for (const id of rootIds.value) pushId(id)
  for (const item of itemsModel.value) {
    const id = idOf(item)
    if (id != null) pushId(id)
  }

  const curIds = itemsModel.value.map(idOf).filter((x): x is RowId => x != null)
  const nextIds = next.map(idOf).filter((x): x is RowId => x != null)
  const orderSame = sameIdOrder(curIds, nextIds)
  const childSame = !props.is계층 || next.every((card) => {
    const id = idOf(card)
    if (id == null) return true
    const prev = byId.get(id)
    return sameIdOrder(childIdsOf(prev), childIdsOf(card))
  })
  if (orderSame && childSame && next.length === itemsModel.value.length) return

  syncingFromDrag = true
  itemsModel.value = next
  nextTick(() => { syncingFromDrag = false })
}

/** itemsModel → sortable 어댑터 (item.childIds 우선, 없으면 이전 sortable 유지) */
watch(
  itemsModel,
  (items) => {
    if (syncingFromDrag) return
    syncingFromItems = true
    const prevChildIds = new Map<RowId, RowId[]>()
    if (props.is계층) {
      for (const row of sortableItems.value) {
        if ('is구분선' in row && row.is구분선) continue
        if (Array.isArray(row.childIds))
          prevChildIds.set(row.id, row.childIds)
      }
    }
    const nextSortable: iSortable2Items = []
    const allIds: RowId[] = []
    for (const item of items) {
      const id = idOf(item)
      if (id == null) continue
      allIds.push(id)
      const fromItem = childIdsOf(item)
      nextSortable.push({
        id,
        label: item.label ?? '',
        icon: item.icon,
        childIds: props.is계층
          ? (fromItem.length > 0 || Array.isArray(item.childIds)
              ? fromItem
              : [...(prevChildIds.get(id) ?? [])])
          : []
      })
    }
    sortableItems.value = nextSortable

    if (!props.is계층) {
      if (!sameIdOrder(rootIds.value, allIds))
        rootIds.value = allIds
      nextTick(() => { syncingFromItems = false })
      return
    }
    // 계층: items 순서 기준으로 루트 = 어디에도 중첩되지 않은 id
    const nested = new Set<RowId>()
    for (const row of nextSortable) {
      if ('is구분선' in row && row.is구분선) continue
      for (const cid of row.childIds ?? []) nested.add(cid)
    }
    const nextRoot = allIds.filter(id => !nested.has(id))
    if (!sameIdOrder(rootIds.value, nextRoot))
      rootIds.value = nextRoot
    nextTick(() => { syncingFromItems = false })
  },
  { immediate: true, deep: true }
)

/** DnD → itemsModel */
watch(
  [rootIds, sortableItems],
  () => {
    if (syncingFromDrag || syncingFromItems) return
    writeItemsFromSortable()
  },
  { deep: true }
)

const idxOf = (id: RowId) => rootIds.value.indexOf(id)

const is선택됨 = (item: ListCardItem) => idOf(item) == selectedId.value

const do선택 = (item: ListCardItem) => {
  tap.play()
  const id = idOf(item)
  const toggle = props.selectToggle ?? (!!slots.body || props.can확장)
  selectedId.value = toggle && selectedId.value == id ? null : id ?? null
}

const { onKeydown } = useListNav({
  root: ref_root,
  items: () => itemsModel.value,
  cols,
  selectedId,
  idOf,
  onSelect: do선택
})

defineExpose({
  do포커스: () => ref_root.value?.focus()
})
</script>

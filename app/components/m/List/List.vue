<template>
  <div
    ref="ref_root"
    class="flex flex-col overflow-y-auto min-h-0 h-full py-2 outline-none [&_[data-list-idx]]:scroll-mt-1"
    tabindex="0"
    @keydown="onKeydown"
  >
    <!-- gap-2·px-2 는 취향이 아니라 선택 배지가 카드 밖으로 6px 나갈 자리다 (`m/테마/선택표시.ts` 「함정 2」) -->
    <div
      ref="ref_grid"
      :class="isRow ? 'flex flex-col gap-2 pt-2' : 'grid pt-2 px-2'"
      :style="isRow ? undefined : gridStyle"
    >
      <Item
        v-for="(item, idx) in props.items"
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
import Item, { toProps } from './_/Item.vue'
import { useGridCols } from './_/useGridCols'
import { useListNav } from './_/useListNav'
import type { Props } from './props'
import type { ListCardItem } from './types'

export type { Props }

const props = withDefaults(defineProps<Props>(), {
  items: () => [],
  type: 'row',
  itemKey: 'id',
  추가라벨: undefined,
  do추가: undefined,
  selectToggle: undefined,
  can확장: false,
  can: () => ({
    생성: false,
    수정: false,
    삭제: false
  })
})

const selectedId = defineModel<string | number | null>('selectedId', { default: null })
const tab = defineModel<string>('tab', { default: '' })
const is수정중 = defineModel<boolean>('is수정중', { default: false })

const { tap } = useSfx()
const slots = useSlots()
const ref_root = useTemplateRef<HTMLElement>('ref_root')

const isRow = computed(() => props.type === 'row')

/** 그림 자리는 목록이 정한다 — 한 장이라도 그림이 있으면 모두 자리를 갖는다(`_/Item.vue` 의 `그림칸`) */
const 그림칸 = computed(() => props.items.some(item => !!item?.thumbnail))
/** 표지 칸 비율도 목록 단위 — 첫 장 값으로 맞춘다. 섞인 목록에서 줄마다 칸이 달라지면 격자가 깨진다 */
const 표지비율 = computed(() => props.items.find(item => item?.표지비율)?.표지비율)

const ref_grid = useTemplateRef<HTMLElement>('ref_grid')
const { cols, gridStyle } = useGridCols(ref_grid, () => props.type)

const idOf = (item: ListCardItem) => item?.[props.itemKey as keyof ListCardItem]
const is선택됨 = (item: ListCardItem) => idOf(item) == selectedId.value

const do선택 = (item: ListCardItem) => {
  tap.play()
  const id = idOf(item)
  const toggle = props.selectToggle ?? (!!slots.body || props.can확장)
  selectedId.value = toggle && selectedId.value == id ? null : id
}

const { onKeydown } = useListNav({
  root: ref_root,
  items: () => props.items,
  cols,
  selectedId,
  idOf,
  onSelect: do선택
})

defineExpose({
  do포커스: () => ref_root.value?.focus()
})
</script>

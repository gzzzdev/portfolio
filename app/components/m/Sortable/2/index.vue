<template>
  <div>
    <div
      :class="props.bare
        ? 'pt-2'
        : 'border border-default rounded-md p-2 mt-2'"
    >
      <List
        v-model:ids="rootIdsView"
        :depth="0"
        group-name="mixed-root"
        :put-groups="['mixed-root', 'items-shared']"
      >
        <template #row-handle="scope">
          <slot
            name="row-handle"
            v-bind="scope"
          >
            <LazyUIcon
              name="i-lucide-grip-vertical"
              class="cursor-grab z-999"
            />
          </slot>
        </template>

        <template #item-label="scope">
          <slot
            name="item-label"
            v-bind="scope"
          >
            <div
              class="inline-flex min-w-0 grow items-center gap-2 cursor-pointer text-md py-1.5"
              :class="[
                props.itemFrameClass,
                scope.isSelected ? 'bg-elevated/60' : ''
              ]"
              @click="scope.select"
            >
              <mIcon
                v-if="scope.item.icon"
                :name="scope.item.icon"
                class="size-5"
              />
              <m라벨
                v-model:label="scope.item.label"
                :can수정="scope.isEditing"
                size="md"
              />
              <UBadge
                v-if="props.is계층"
                size="xs"
              >
                {{ scope.item.childIds?.length ?? 0 }}
              </UBadge>
            </div>
          </slot>
        </template>

        <template
          v-if="$slots['item-trailing']"
          #item-trailing="scope"
        >
          <slot
            name="item-trailing"
            v-bind="scope"
          />
        </template>

        <template
          v-if="$slots['item-top']"
          #item-top="scope"
        >
          <slot
            name="item-top"
            v-bind="scope"
          />
        </template>

        <template
          v-if="$slots['item-bot']"
          #item-bot="scope"
        >
          <slot
            name="item-bot"
            v-bind="scope"
          />
        </template>

        <template
          v-if="$slots.divider"
          #divider="scope"
        >
          <slot
            name="divider"
            v-bind="scope"
          />
        </template>
      </List>
    </div>

    <slot
      name="folder-add"
      :add-folder="do폴더추가"
      :add-divider="do구분선추가"
      :is-editing="props.is수정중"
      :do-folder="do폴더"
    >
      <div
        v-if="props.is수정중"
        class="mt-2 flex justify-end gap-1"
      >
        <mButton
          v-if="props.is계층"
          size="sm"
          icon="i-lucide-folder-plus"
          @click="do폴더추가"
        >
          폴더 추가
        </mButton>
        <mButton
          size="sm"
          icon="i-lucide-minus"
          @click="do구분선추가"
        >
          구분선 추가
        </mButton>
      </div>
    </slot>
  </div>
</template>

<script lang="ts">
// 값 re-export 는 setup 블록에 못 둔다 — 거기는 모듈 스코프가 아니다.
// 두 블록은 한 모듈로 합쳐지므로 setup 에서도 그대로 보인다.
export { is구분선Item, isFolderItem } from './_types'
export type {
  RowId,
  i구분선Item,
  iSortable2Item,
  iSortable2Items
} from './_types'

// 값 재수출은 setup 블록에 못 둔다 — 거기는 모듈 스코프가 아니다.
</script>

<script setup lang="ts">
import { computed, provide, reactive, watch } from 'vue'
import List from './_List.vue'
import {
  SORTABLE2_KEY,
  isFolderItem,
  is구분선Item,
  type Sortable2Props,
  type Sortable2Slots,
  type iSortable2Items,
  type RowId,
  type Sortable2Ctx
} from './_types'

const props = withDefaults(defineProps<Sortable2Props>(), {
  is수정중: true,
  is계층: true,
  can선택: false,
  bare: false,
  folderFrameClass: '',
  itemFrameClass: 'rounded-md'
})

defineSlots<Sortable2Slots>()

const itemsModel = defineModel<iSortable2Items>('items', { required: true })
/** 루트 순서. 각 아이템의 childIds와 같은 역할 */
const rootIdsModel = defineModel<RowId[]>('rootIds', { required: true })
const selected = defineModel<RowId | null>('selected', {})

const itemMap = computed(() => {
  const map = new Map<RowId, iSortable2Items[number]>()
  for (const item of itemsModel.value)
    map.set(item.id, item)
  return map
})

const itemOf = (id: RowId) => {
  const item = itemMap.value.get(id)
  if (!item || is구분선Item(item))
    return undefined
  return item
}

/** 구분선 제외 모든 item에 childIds 보장 */
watch(itemsModel, (items) => {
  for (const item of items) {
    if (is구분선Item(item))
      continue
    if (!Array.isArray(item.childIds))
      item.childIds = []
  }
}, { immediate: true, deep: false })

const is구분선Id = (id: RowId) => {
  const item = itemMap.value.get(id)
  return item != null && is구분선Item(item)
}

const rootIdsView = computed({
  get: () => rootIdsModel.value,
  set: (next) => {
    rootIdsModel.value = next
  }
})

const idKey = (id: RowId) => String(id)

const do구분선추가 = () => {
  const id: RowId = `sep-${Date.now()}`
  itemsModel.value.push({ id, is구분선: true })
  rootIdsModel.value.push(id)
}

const do폴더추가 = () => {
  const folders = itemsModel.value.filter(isFolderItem)
  const nextNo = folders.length + 1
  const numericIds = folders
    .map(f => f.id)
    .filter((id): id is number => typeof id === 'number' && Number.isFinite(id))

  const id: RowId
    = numericIds.length === folders.length && folders.length > 0
      ? Math.max(0, ...numericIds) + 1
      : `folder-${Date.now()}`

  itemsModel.value.push({
    id,
    label: `폴더 ${nextNo}`,
    childIds: []
  })
  rootIdsModel.value.push(id)
}

const ensureChildIds = (id: RowId) => {
  const item = itemOf(id)
  if (!item)
    return undefined
  if (!Array.isArray(item.childIds))
    item.childIds = []
  return item.childIds
}

/** draggingId가 targetId의 조상/본인이면 순환 → 드롭 불가 */
const wouldCreateCycle = (draggingId: RowId, targetId: RowId) => {
  if (draggingId === targetId)
    return true
  const walk = (id: RowId): boolean => {
    const item = itemOf(id)
    if (!item?.childIds?.length)
      return false
    for (const childId of item.childIds) {
      if (childId === targetId || walk(childId))
        return true
    }
    return false
  }
  return walk(draggingId)
}

const do폴더 = {
  추가: do폴더추가
}

/** id → 접힘. 없으면 펼침 */
const collapsedMap = reactive<Record<string, boolean>>({})

const isCollapsed = (id: RowId) => !!collapsedMap[idKey(id)]

const toggleCollapsed = (id: RowId) => {
  const key = idKey(id)
  collapsedMap[key] = !collapsedMap[key]
}

provide(SORTABLE2_KEY, {
  props,
  itemsModel,
  selected,
  itemOf,
  is구분선Id,
  idKey,
  do폴더,
  ensureChildIds,
  wouldCreateCycle,
  isCollapsed,
  toggleCollapsed
} satisfies Sortable2Ctx)
</script>

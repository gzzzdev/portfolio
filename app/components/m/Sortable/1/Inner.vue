<template>
  <div>
    <div class="border border-default rounded-md p-2 mt-2">
      <draggable
        v-model="foldersModel"
        :item-key="rootItemKey"
        :group="{ name: 'mixed-root', pull: true, put: ['mixed-root', 'items-shared'] }"
        :disabled="!props.is수정중"
        handle=".folder-handle, .row-handle"
        :animation="150"
      >
        <template #item="{ element: item, index }">
          <div
            v-if="isFolderItem(item)"
            data-kind="folder"
            :class="isEntryShown(item) ? '' : 'opacity-50'"
            class="border border-default px-2 my-1 rounded-md"
          >
            <slot name="folder-top" />

            <div
              :class="props.folderFrameClass"
              class="flex flex-col"
            >
              <div class="w-full flex flex-row items-center gap-2">
                <div
                  v-if="props.is수정중"
                  class="folder-handle"
                >
                  <slot
                    name="folder-handle"
                    :folder="item"
                  >
                    <LazyUIcon
                      name="i-lucide-grip-vertical"
                      class="cursor-grab z-999"
                    />
                  </slot>
                </div>
                <slot
                  name="folder-label"
                  :folder="item"
                  :folder-index="index"
                  :is-editing="props.is수정중"
                  :do-folder="do폴더"
                >
                  <div>{{ item.label }}</div>
                </slot>

                <div
                  v-if="props.is수정중"
                  class="shrink-0 ml-auto"
                  @click.stop
                >
                  <Input선택기
                    :model-value="isEntryShown(item)"
                    :items="showItems"
                    :search="false"
                    :indicator="false"
                    :is-u-i="false"
                    @update:model-value="(v) => { item.show = resolveShow(v) }"
                  />
                </div>
                <slot
                  name="folder-trailing"
                  :folder="item"
                  :folder-index="index"
                  :is-editing="props.is수정중"
                  :do-folder="do폴더"
                />
              </div>
              <draggable
                v-model="item.children"
                :item-key="childItemKey"
                :group="{ name: 'items-shared', pull: true, put: (_to: unknown, _from: unknown, draggedEl: HTMLElement) => draggedEl.dataset.kind !== 'folder' }"
                :disabled="!props.is수정중"
                handle=".row-handle"
                :animation="150"
                :move="(evt: { draggedContext?: { element?: SortableItem | ChildItem } }) => {
                  const draggingItem = evt.draggedContext?.element
                  return draggingItem == null || !isFolderItem(draggingItem)
                }"
              >
                <template #item="{ element: child, index: childIndex }">
                  <template v-if="is구분선(child)">
                    <view구분선
                      inset
                      :is수정중="props.is수정중"
                      @삭제="do구분선삭제(item.children, child.id)"
                    />
                  </template>
                  <div
                    v-else-if="isKnownRow(child)"
                    :class="[props.itemFrameClass, isEntryShown(child) ? '' : 'opacity-50']"
                    class="w-full flex flex-row items-center gap-2 pl-3"
                  >
                    <div
                      v-if="props.is수정중"
                      class="row-handle"
                    >
                      <slot
                        name="row-handle"
                        :row-id="rowIdOf(child)"
                        :folder="item"
                      >
                        <LazyUIcon
                          name="i-lucide-grip-vertical"
                          class="cursor-grab"
                        />
                      </slot>
                    </div>
                    <slot
                      name="item-label"
                      :row-id="rowIdOf(child)"
                      :row-label="rowLabelOf(child)"
                      :folder="item"
                      :icon="iconOf(child)"
                    >
                      <slot
                        name="row-label"
                        :row-id="rowIdOf(child)"
                        :row-label="rowLabelOf(child)"
                        :folder="item"
                        :icon="iconOf(child)"
                      >
                        <span>{{ rowLabelOf(child) }}</span>
                      </slot>
                    </slot>
                    <div
                      v-if="props.is수정중"
                      class="shrink-0 ml-auto"
                      @click.stop
                    >
                      <Input선택기
                        :model-value="isEntryShown(child)"
                        :items="showItems"
                        :search="false"
                        :indicator="false"
                        :is-u-i="false"
                        @update:model-value="(v) => setListEntryShow(item.children, childIndex, resolveShow(v))"
                      />
                    </div>
                  </div>
                </template>
              </draggable>
            </div>
            <slot name="folder-bot" />
          </div>

          <template v-else-if="is구분선(item)">
            <view구분선
              :is수정중="props.is수정중"
              @삭제="do루트구분선삭제(item.id)"
            />
          </template>

          <div
            v-else-if="isKnownRow(item)"
            data-kind="row"
            :class="isEntryShown(item) ? '' : 'opacity-50'"
          >
            <div
              :class="props.itemFrameClass"
              class="w-full flex flex-row items-center gap-2"
            >
              <div
                v-if="props.is수정중"
                class="row-handle"
              >
                <slot
                  name="row-handle"
                  :row-id="rowIdOf(item)"
                  :folder="null"
                >
                  <LazyUIcon
                    name="i-lucide-grip-vertical"
                    class="cursor-grab"
                  />
                </slot>
              </div>
              <slot
                name="item-label"
                :row-id="rowIdOf(item)"
                :row-label="rowLabelOf(item)"
                :folder="null"
                :icon="iconOf(item)"
              >
                <slot
                  name="row-label"
                  :row-id="rowIdOf(item)"
                  :row-label="rowLabelOf(item)"
                  :folder="null"
                  :icon="iconOf(item)"
                >
                  <span>{{ rowLabelOf(item) }}</span>
                </slot>
              </slot>
              <div
                v-if="props.is수정중"
                class="shrink-0 ml-auto"
                @click.stop
              >
                <Input선택기
                  :model-value="isEntryShown(item)"
                  :items="showItems"
                  :search="false"
                  :indicator="false"
                  :is-u-i="false"
                  @update:model-value="(v) => setListEntryShow(foldersModel, index, resolveShow(v))"
                />
              </div>
            </div>
          </div>
        </template>
      </draggable>
    </div>
    <slot
      name="folder-add"
      :add-folder="do폴더추가"
      :add-divider="do구분선추가"
      :is-editing="props.is수정중"
      :do-folder="do폴더"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import draggable from 'vuedraggable'
import view구분선, { is구분선, 구분선ItemKey, type i구분선 } from './_view구분선.vue'
import {
  isEntryShown,
  isFolderItem,
  isRowNode,
  rowIdOf,
  toRowEntry,
  type ChildItem,
  type FolderItem,
  type i행노드,
  type RowId,
  type RowItem,
  type SortableItem
} from './_types'

interface Props {
  is수정중: boolean
  folderFrameClass?: string
  itemFrameClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  folderFrameClass: '',
  itemFrameClass: ''
})
const itemsModel = defineModel<RowItem[]>('items', { required: true })
const foldersModel = defineModel<SortableItem[]>('folders', { required: true })

const itemIdSet = computed(() => {
  return new Set(itemsModel.value.map(row => row.id))
})

const rowMap = computed(() => {
  return new Map(itemsModel.value.map(row => [row.id, row.label]))
})

const iconMap = computed(() => {
  return new Map(itemsModel.value.map(row => [row.id, row.icon]))
})

const isKnownRow = (item: unknown): item is RowId | i행노드 => {
  if (typeof item === 'string' || typeof item === 'number')
    return itemIdSet.value.has(item)
  if (isRowNode(item))
    return itemIdSet.value.has(item.id)
  return false
}

const rowLabelOf = (item: RowId | i행노드) => {
  const id = rowIdOf(item)
  return rowMap.value.get(id) ?? String(id)
}

const iconOf = (item: RowId | i행노드) => {
  return iconMap.value.get(rowIdOf(item))
}

const rootItemKey = (item: SortableItem) => {
  if (is구분선(item))
    return 구분선ItemKey(item)
  if (isFolderItem(item))
    return `folder-${String(item.id)}`
  return `root-row-${String(rowIdOf(item))}`
}

const childItemKey = (child: ChildItem) => {
  if (is구분선(child))
    return 구분선ItemKey(child)
  return String(rowIdOf(child))
}

const showItems = [
  { label: '보기', value: true },
  { label: '끄기', value: false }
]

const resolveShow = (v: string | number | boolean | { value?: string | number | boolean } | null) => {
  const raw = v != null && typeof v === 'object' && 'value' in v ? v.value : v
  return raw === true || raw === 1 || raw === 'true'
}

const syncItemShow = (id: RowId, show: boolean) => {
  const row = itemsModel.value.find(item => item.id === id)
  if (!row)
    return
  row.show = show
}

const setListEntryShow = (
  list: Array<ChildItem | SortableItem>,
  index: number,
  show: boolean
) => {
  const cur = list[index]
  if (cur == null || is구분선(cur) || isFolderItem(cur))
    return
  const id = rowIdOf(cur)
  list[index] = toRowEntry(id, show) as typeof cur
  syncItemShow(id, show)
}

const do구분선추가 = () => {
  foldersModel.value.push({
    is구분선: true,
    id: `sep-${Date.now()}`
  })
}

const do구분선삭제 = (children: ChildItem[], dividerId: RowId) => {
  const index = children.findIndex(child => is구분선(child) && child.id === dividerId)
  if (index < 0)
    return
  children.splice(index, 1)
}

const do루트구분선삭제 = (dividerId: RowId) => {
  const index = foldersModel.value.findIndex(item => is구분선(item) && item.id === dividerId)
  if (index < 0)
    return
  foldersModel.value.splice(index, 1)
}

const do폴더추가 = () => {
  const existingFolders = foldersModel.value.filter(isFolderItem)
  const nextFolderNo = existingFolders.length + 1
  const numericFolderIds = existingFolders
    .map(folder => folder.id)
    .filter((id): id is number => typeof id === 'number' && Number.isFinite(id))

  const nextFolderId: RowId
    = numericFolderIds.length === existingFolders.length
      ? (Math.max(0, ...numericFolderIds) + 1)
      : `folder-${Date.now()}`

  foldersModel.value.push({
    id: nextFolderId,
    label: `폴더 ${nextFolderNo}`,
    children: []
  })
}

const do폴더삭제 = (target: number | RowId | FolderItem) => {
  const folderIndex = typeof target === 'number'
    ? target
    : foldersModel.value.findIndex((item) => {
        if (!isFolderItem(item))
          return false

        if (typeof target === 'object' && target !== null)
          return item === target || item.id === target.id

        return item.id === target
      })

  if (folderIndex < 0 || folderIndex >= foldersModel.value.length)
    return

  if (!isFolderItem(foldersModel.value[folderIndex]))
    return

  foldersModel.value.splice(folderIndex, 1)
}

const do폴더 = {
  추가: do폴더추가,
  삭제: do폴더삭제
}
</script>

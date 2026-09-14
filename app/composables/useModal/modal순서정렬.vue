<template>
  <div class="flex max-h-[80vh] flex-col gap-2 p-5">
    <div
      v-if="title?.trim()"
      class="text-lg"
    >
      {{ title }}
    </div>
    <div
      v-if="description?.trim()"
      class="text-sm text-muted"
    >
      {{ description }}
    </div>
    <div
      v-if="title?.trim() || description?.trim()"
      class="my-2 border-t border-default"
    />

    <div class="min-h-0 flex-1 overflow-y-auto">
      <mSortable1
        v-model:items="draftItems"
        v-model:folders="draftFolders"
        v-model:selected="selectedId"
      />
    </div>

    <div class="mt-2 flex flex-row gap-2">
      <div class="grow" />
      <mButton
        label="초기화"
        icon="i-material-symbols-light:refresh"
        @click="do초기화"
      />
      <mButton
        size="xl"
        class="px-3"
        :역할="!false? undefined : '강조'"
        :label="confirmLabel"
        @click="submit"
      >
        {{ confirmLabel }}
      </mButton>
    </div>

    <div class="mt-2 flex flex-row gap-2">
      <mButton
        v-for="action in actions"
        :key="action.label"
        size="xl"
        class="px-3"
        :역할="!false? undefined : '강조'"
        :label="action.label"
        :icon="action.icon"
        @click="action.onClick"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import {
  is구분선,
  isFolderItem,
  isRowNode,
  type i아이템s,
  type i폴더s
} from '@/components/m/Sortable/1/index.vue'

type RowId = string | number

function cloneItems(items: i아이템s): i아이템s {
  return items.map(row => ({ ...row }))
}

function cloneFolders(folders: i폴더s): i폴더s {
  return folders.map((item) => {
    if (is구분선(item)) return { ...item }
    if (isFolderItem(item)) {
      return {
        ...item,
        children: item.children.map((child) => {
          if (is구분선(child)) return { ...child }
          if (isRowNode(child)) return { ...child }
          return child
        })
      }
    }
    if (isRowNode(item)) return { ...item }
    return item
  })
}

interface Props {
  items: i아이템s
  folders: i폴더s
  is계층?: boolean
  title?: string
  description?: string
  confirmLabel?: string
  onConfirm: (payload: { items: i아이템s, folders: i폴더s }) => void

  actions?: { label: string, icon: string, onClick: () => void }[]
}

const props = withDefaults(defineProps<Props>(), {
  items: () => [],
  folders: () => [],
  is계층: true,
  title: '순서 정렬',
  description: '',
  confirmLabel: '확인',
  onConfirm: () => {},
  actions: () => []

})

const draftItems = ref<i아이템s>(cloneItems(props.items))
const draftFolders = ref<i폴더s>(cloneFolders(props.folders))
const selectedId = ref<RowId | null>(null)

watch(
  () => [props.items, props.folders] as const,
  ([items, folders]) => {
    draftItems.value = cloneItems(items)
    draftFolders.value = cloneFolders(folders)
    selectedId.value = null
  },
  { deep: true }
)

const submit = () => {
  props.onConfirm({
    items: cloneItems(draftItems.value),
    folders: cloneFolders(draftFolders.value)
  })
}

const do초기화 = () => {
  if (confirm('초기화하시겠습니까?'))
    draftFolders.value = [...props.items]// cloneFolders(props.folders)
}
</script>

<template>
  <Inner
    v-model:items="itemsModel"
    v-model:folders="foldersViewModel"
    :is수정중="props.is수정중"
    folder-frame-class=""
    :item-frame-class="`rounded-md`"
  >
    <template #folder-top />
    <template #folder-label="{ folder }">
      <div class="flex flex-col min-w-0 grow">
        <div class="flex items-center justify-between gap-2">
          <div class="inline-flex min-w-0 items-center gap-2 w-full">
            <m라벨
              v-model:label="folder.label"
              :can수정="is수정중"
              size="lg"
            />
            <div class="grow" />
            <UBadge size="xs">
              {{ folder.children?.length }}
            </UBadge>
          </div>
        </div>
      </div>
    </template>

    <template #folder-trailing="{ folder, folderIndex, isEditing, doFolder }">
      <mButton
        v-if="isEditing && folder.children?.length === 0"
        size="xs"
        역할="조용"
        icon="i-mdi-close"
        aria-label="빈 폴더 삭제"
        @click.stop="doFolder?.삭제(folderIndex)"
      />
    </template>

    <template #item-label="{ rowId, icon }">
      <div
        class="inline-flex min-w-0 grow items-center gap-2 cursor-pointer text-md py-1.5"
        :class="selected == rowId ? 'bg-elevated/60' : ''"
        @click="() => props.can선택 && (selected = rowId)"
      >
        <mIcon
          v-if="icon"
          :name="icon"
          class="size-5"
        />
        <m라벨
          v-if="itemOf(rowId)"
          v-model:label="itemOf(rowId)!.label"
          :can수정="is수정중"
          size="md"
        />
        <span class="ml-3 text-sm text-muted">{{ itemOf(rowId)?.sub }}</span>
      </div>
    </template>

    <template #folder-add="{ addFolder, addDivider, isEditing }">
      <div
        v-if="isEditing"
        class="mt-2 flex justify-end gap-1"
      >
        <mButton
          v-if="props.is계층"
          size="sm"
          icon="i-lucide-folder-plus"
          @click="addFolder"
        >
          폴더 추가
        </mButton>
        <mButton
          size="sm"
          icon="i-lucide-minus"
          @click="addDivider"
        >
          구분선 추가
        </mButton>
      </div>
    </template>
  </Inner>
</template>

<script lang="ts">
// 값 re-export 는 setup 블록에 못 둔다 — 거기는 모듈 스코프가 아니다.
// 두 블록은 한 모듈로 합쳐지므로 setup 에서도 그대로 보인다.
export type { i구분선 } from './_view구분선.vue'
export { is구분선 } from './_view구분선.vue'
export {
  isEntryShown,
  isFolderItem,
  isRowNode,
  rowIdOf,
  toRowEntry,
  type i아이템,
  type i아이템s,
  type i폴더아이템,
  type i폴더s,
  type i행노드
} from './_types'

// 재수출은 setup 블록에 못 둔다 — 거기는 모듈 스코프가 아니다.
</script>

<script setup lang="ts">
import { computed } from 'vue'
import Inner from './Inner.vue'
import { isFolderItem, type i아이템s, type i폴더s, type RowId } from './_types'

interface Props {
  is수정중: boolean
  // can폴더추가: boolean
  is계층: boolean

  can선택: boolean
}

const props = withDefaults(defineProps<Props>(), {
  is계층: true,
  is수정중: true,
  can선택: false
})

const itemsModel = defineModel<i아이템s>('items', { required: !true })
const foldersModel = defineModel<i폴더s>('folders', { required: !true })
const foldersViewModel = computed<i폴더s>({
  get: () => {
    if (props.is계층)
      return foldersModel.value

    return foldersModel.value.filter(item => !isFolderItem(item))
  },
  set: (nextFolders) => {
    if (props.is계층) {
      foldersModel.value = nextFolders
      return
    }

    foldersModel.value = nextFolders.filter(item => !isFolderItem(item))
  }
})

const selected = defineModel<RowId | null>('selected', {})

const itemOf = (rowId: RowId) => itemsModel.value?.find(x => x.id == rowId)
</script>

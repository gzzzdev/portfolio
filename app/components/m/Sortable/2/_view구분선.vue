<template>
  <div
    data-kind="divider"
    class="w-full flex flex-row items-center gap-2 py-1"
    :class="inset ? 'pl-3' : ''"
  >
    <div
      v-if="is수정중"
      class="row-handle"
    >
      <LazyUIcon
        name="i-lucide-grip-vertical"
        class="cursor-grab"
      />
    </div>
    <USeparator class="grow" />
  </div>
</template>

<script lang="ts">
type RowId = string | number

/** 정렬 목록에 끼워 넣는 구분선. id는 드래그 키용(여러 개일 때 필수). */
export type i구분선 = {
  is구분선: true
  id: RowId
}

export const is구분선 = (item: unknown): item is i구분선 =>
  typeof item === 'object' && item !== null && (item as i구분선).is구분선 === true

export const 구분선ItemKey = (item: i구분선) => `divider-${String(item.id)}`

interface Props {
  is수정중: boolean
  /** 폴더 children 안일 때 들여쓰기 */
  inset?: boolean
}
</script>

<script setup lang="ts">
withDefaults(defineProps<Props>(), {
  inset: false
})
</script>

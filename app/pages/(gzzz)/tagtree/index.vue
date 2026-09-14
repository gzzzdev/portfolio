<template>
  <div class="flex w-full">
    <mSidebar no-header>
      <m트리
        v-model="selectedTagKey"
        :items="items"
        :is여러개="false"
      />
    </mSidebar>
    <div class="grow flex h-full min-h-0 flex-col gap-3 rounded-xl border border-default/50 bg-default p-3">
      <div
        v-if="selected메모s.length === 0"
        class="text-sm text-dimmed"
      >
        트리에서 태그를 선택하면 해당 메모만 표시됩니다.
      </div>

      <div
        v-else
        class="space-y-2 overflow-auto"
      >
        <div
          v-for="메모 in selected메모s"
          :key="메모.id"
          class="rounded-lg border border-default/60 p-3"
        >
          <div class="font-medium">
            {{ 메모.제목 }}
          </div>
          <div class="mt-1 text-sm text-toned">
            {{ 메모.내용 }}
          </div>
        </div>
      </div>
    </div>

    <mSidebar
      side="right"
      no-header
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ 꽉찬폭: true })

import type { TreeItem } from '@nuxt/ui'
import { 메모s } from './메모s'

import { 태그s } from './태그s'

interface i태그 {
  id: number
  label: string
  parentId?: number
  icon?: string
}

interface i트리태그 extends i태그 {
  children?: i트리태그[]
  defaultExpanded?: boolean
}

const converter = (목록: i태그[]): TreeItem[] => {
  const 맵 = new Map(목록.map(태그 => [태그.id, { ...태그, defaultExpanded: true, children: [] as i트리태그[] }]))

  return [...맵.values()].filter((태그) => {
    const 부모 = 태그.parentId !== undefined ? 맵.get(태그.parentId) : undefined
    if (부모) 부모.children?.push(태그)
    return !부모
  })
}

const items = computed(() => converter(태그s))
const selectedTagKey = ref<string | string[] | undefined>()

const selectedTagIds = computed(() => {
  const keys = Array.isArray(selectedTagKey.value) ? selectedTagKey.value : [selectedTagKey.value]
  return keys.map(Number).filter(Number.isFinite)
})

const parentIdByTagId = new Map(태그s.map(태그 => [태그.id, 태그.parentId]))

const selected메모s = computed(() => {
  if (selectedTagIds.value.length === 0) {
    return []
  }

  const selectedTagIdSet = new Set(selectedTagIds.value)
  const isSelectedOrAncestorSelected = (tagId: number) => {
    let currentId: number | undefined = tagId

    while (currentId !== undefined) {
      if (selectedTagIdSet.has(currentId)) {
        return true
      }

      currentId = parentIdByTagId.get(currentId)
    }

    return false
  }

  return 메모s.filter((메모) => {
    return 메모.태그ids.some(isSelectedOrAncestorSelected)
  })
})
</script>

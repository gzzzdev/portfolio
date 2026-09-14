<template>
  <UModal
    v-model:open="open"
    :ui="{ content: 'sm:max-w-md' }"
  >
    <template #content>
      <div class="flex flex-col gap-3 p-5">
        <div class="text-lg font-semibold">
          {{ title }}
        </div>
        <ul class="flex max-h-[min(60vh,24rem)] flex-col gap-2 overflow-y-auto">
          <li
            v-for="item in items"
            :key="item.id"
          >
            <CalEventRow
              card
              :title="item.title"
              :color="item.color"
              :tag="item.tag"
              :icon="item.icon"
            />
          </li>
        </ul>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import CalEventRow from './CalEventRow.vue'
import type { CalMoreItem } from './types'

defineProps<{
  title: string
  items: CalMoreItem[]
}>()

const open = defineModel<boolean>('open', { default: false })
</script>

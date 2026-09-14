<template>
  <view공통박스
    title="일정유형"
    body-class="flex flex-col gap-0.5 rounded-md border border-default/50 bg-muted/10 p-1"
  >
    <template #header-right>
      <div class="flex items-center gap-0.5">
        <mButton
          역할="조용"
          size="xs"
          class="h-6 px-1 text-[0.625rem]"
          label="전체"
          @click="setAll(true)"
        />
        <mButton
          역할="조용"
          size="xs"
          class="h-6 px-1 text-[0.625rem]"
          label="해제"
          @click="setAll(false)"
        />
      </div>
    </template>

    <label
      v-for="item in 일정필터목록"
      :key="item.id"
      class="flex cursor-pointer items-center gap-1.5 rounded px-1 py-0.5 hover:bg-muted/40"
    >
      <input
        :checked="item.visible"
        type="checkbox"
        class="size-3 cursor-pointer rounded border-accented/60 bg-default ring-offset-0"
        :class="getCheckboxClass(item.checkboxClass)"
        :style="getCheckboxStyle(item.checkboxClass)"
        @change="setFilterVisible(item.id, ($event.target as HTMLInputElement).checked)"
      >
      <div class="flex min-w-0 items-center">
        <span class="truncate text-[0.625rem] text-default">
          {{ item.label }}
        </span>
      </div>
    </label>
  </view공통박스>
</template>

<script setup lang="ts">
import view공통박스 from './공통박스.vue'
import type { 일정필터 } from '../data/props'

const 일정필터목록 = defineModel<일정필터[]>('filters', { default: () => [] })

const isCssColorValue = (value: string) =>
  value.startsWith('#') || value.startsWith('hsl(') || value.startsWith('rgb(') || value.startsWith('var(')

const getCheckboxClass = (value: string) => (isCssColorValue(value) ? undefined : value)
const getCheckboxStyle = (value: string) => (isCssColorValue(value) ? { accentColor: value } : undefined)

const setFilterVisible = (id: string, visible: boolean) => {
  일정필터목록.value = 일정필터목록.value.map(item =>
    item.id === id
      ? {
          ...item,
          visible
        }
      : item)
}

const setAll = (visible: boolean) => {
  일정필터목록.value = 일정필터목록.value.map(item => ({
    ...item,
    visible
  }))
}
</script>

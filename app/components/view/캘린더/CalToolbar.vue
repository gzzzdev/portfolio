<template>
  <header class="flex flex-wrap items-center gap-3">
    <h2 class="min-w-0 text-2xl font-semibold tracking-tight text-highlighted">
      {{ label }}
    </h2>
    <div class="grow" />
    <div class="shrink-0">
      <Input선택기
        :model-value="view"
        :items="CAL_VIEW_TABS"
        :search="false"
        :indicator="false"
        :is-u-i="false"
        @update:model-value="onViewChange"
      />
    </div>
    <div class="flex items-center gap-1 rounded-lg border border-default/60 bg-muted/30 p-1">
      <mButton
        icon="i-lucide-chevron-left"
        역할="조용"
        size="sm"
        aria-label="이전"
        @click="emit('prev')"
      />
      <mButton
        class="px-3"
        역할="조용"
        size="sm"
        @click="emit('today')"
      >
        오늘
      </mButton>
      <mButton
        icon="i-lucide-chevron-right"
        역할="조용"
        size="sm"
        aria-label="다음"
        @click="emit('next')"
      />
    </div>
  </header>
</template>

<script setup lang="ts">
import { CAL_VIEW_TABS, isCalViewId, type CalViewId } from './calendarViews'

defineProps<{ label: string, view: CalViewId }>()
const emit = defineEmits<{
  'prev': []
  'next': []
  'today': []
  'update:view': [CalViewId]
}>()

const onViewChange = (v: string | number | { value?: string | number } | null) => {
  const raw = v != null && typeof v === 'object' && 'value' in v ? v.value : v
  const next = String(raw ?? '')
  if (isCalViewId(next)) emit('update:view', next)
}
</script>

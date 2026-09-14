<template>
  <div>
    <p class="mb-3 text-xs font-semibold tracking-wide text-muted uppercase">
      일정 유형
    </p>
    <ul class="flex flex-col gap-3">
      <li
        v-for="item in items"
        :key="item.key"
        class="flex flex-col gap-1.5"
      >
        <div class="flex min-w-0 items-center gap-2">
          <span
            class="size-2.5 shrink-0 rounded-full"
            :style="{ backgroundColor: item.color }"
          />
          <UIcon
            :name="item.icon"
            class="size-4 shrink-0 text-muted"
          />
          <span class="min-w-0 truncate text-sm text-default">{{ item.label }}</span>
          <div class="grow" />
          <div>
            <Input선택기
              :model-value="enabledKeys.has(item.key) ? 1 : 0"
              :items="visibilityItems"
              :search="false"
              :indicator="false"
              :is-u-i="false"
              @update:model-value="(v) => onVisibilityChange(item.key, v)"
            />
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { model달력s } from '~models/test2'
import type { CalLegendItem } from './types'

const props = defineProps<{
  items?: CalLegendItem[]
}>()

const items = computed(() => props.items?.length ? props.items : toValue(model달력s.getInstance().범례))

const enabledKeys = defineModel<Set<string>>('enabledKeys', { required: true })

const visibilityItems = [
  { label: '보기', value: 1 },
  { label: '끄기', value: 0 }
]

const onVisibilityChange = (
  key: string,
  v: string | number | { value?: string | number } | null
) => {
  const raw = v != null && typeof v === 'object' && 'value' in v ? v.value : v
  const on = Number(raw) === 1
  const next = new Set(enabledKeys.value)
  if (on) next.add(key)
  else next.delete(key)
  enabledKeys.value = next
}
</script>

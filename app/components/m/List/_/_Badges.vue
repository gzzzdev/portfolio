<template>
  <div
    v-if="props.badges?.length"
    class="flex gap-1.5"
    :class="props.wrap ? 'min-w-0 flex-wrap pt-1' : 'shrink-0 flex-nowrap'"
  >
    <UBadge
      v-for="(badge, badgeIdx) in visibleBadges"
      :key="badgeIdx"
      :label="badge.label"
      :color="badge.color"
      :icon="badge.icon"
      :size="props.size"
    />
    <UBadge
      v-if="!open && overflowCount > 0"
      :label="`+${overflowCount}`"
      :size="props.size"
      class="cursor-pointer"
      @click.stop="() => open = true"
    />
  </div>
</template>

<script setup lang="ts">
import type { ListCardBadge } from '../types'

const props = withDefaults(defineProps<{
  badges?: ListCardBadge[]
  max?: number
  size?: 'sm' | 'md' | 'lg' | 'xs'
  wrap?: boolean
}>(), {
  badges: () => [],
  max: 2,
  size: 'sm',
  wrap: true
})

const open = ref(false)

const visibleBadges = computed(() =>
  open.value ? props.badges : props.badges.slice(0, props.max)
)

const overflowCount = computed(() =>
  Math.max(0, props.badges.length - props.max)
)
</script>

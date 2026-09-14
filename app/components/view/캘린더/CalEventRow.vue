<template>
  <div
    class="cal-event-row"
    :class="{ 'cal-event-row--card': card }"
    :title="title"
  >
    <span
      class="cal-event-bar"
      :style="{ backgroundColor: color ?? '#94a3b8' }"
    />
    <span
      v-if="tag"
      class="cal-event-tag"
    >{{ tag }}</span>
    <UIcon
      v-if="icon"
      :name="icon"
      class="cal-event-icon"
    />
    <span
      class="cal-event-title"
      :class="{ 'text-sm': card }"
    >{{ title }}</span>
    <span
      v-if="moreCount"
      class="cal-event-more"
    >+{{ moreCount }}개 더</span>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
  color?: string
  tag?: string
  icon?: string
  moreCount?: number
  /** 모달 리스트 등 카드형 레이아웃 */
  card?: boolean
}

defineProps<Props>()
</script>

<style scoped>
.cal-event-row {
    display: flex;
    min-width: 0;
    align-items: center;
    gap: 0.35rem;
    line-height: 1.2;
}

.cal-event-row--card {
    border-radius: 0.5rem;
    border: 1px solid color-mix(in oklab, var(--color-default) 12%, transparent);
    padding: 0.5rem 0.65rem;
}

.cal-event-bar {
    width: 3px;
    height: 0.95rem;
    flex-shrink: 0;
    border-radius: 999px;
}

.cal-event-tag {
    flex-shrink: 0;
    font-size: 0.625rem;
    font-weight: 600;
    color: var(--color-muted);
    min-width: 1.75rem;
}

.cal-event-icon {
    width: 0.8rem;
    height: 0.8rem;
    flex-shrink: 0;
    color: var(--color-muted);
}

.cal-event-title {
    min-width: 0;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.7rem;
    font-weight: 500;
    color: var(--color-default);
}

.cal-event-more {
    flex-shrink: 0;
    font-size: 0.65rem;
    font-weight: 600;
    color: var(--cal-accent, #3b82f6);
}
</style>

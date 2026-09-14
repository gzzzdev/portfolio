<template>
  <span
    class="cal-event-dot"
    :style="{ backgroundColor: color ?? '#94a3b8' }"
    :title="title"
  />
</template>

<script setup lang="ts">
defineProps<{
  title?: string
  color?: string
}>()
</script>

<style scoped>
.cal-event-dot {
    display: block;
    width: 0.4rem;
    height: 0.4rem;
    flex-shrink: 0;
    border-radius: 999px;
}
</style>

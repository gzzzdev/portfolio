<template>
  <div class="flex items-start justify-between gap-4">
    <div class="min-w-0">
      <p
        v-if="eyebrow"
        class="text-xs uppercase tracking-wider text-primary sm:text-sm"
      >
        {{ eyebrow }}
      </p>
      <h2
        :id="headingId"
        class="mt-1 text-2xl tracking-tight text-highlighted sm:text-3xl"
      >
        {{ title }}
      </h2>
    </div>
    <div v-if="$slots.actions" class="shrink-0">
      <slot name="actions" />
    </div>
  </div>

  <div class="my-4">
    <USeparator />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  eyebrow?: string
  title: string
  headingId?: string
}>()
</script>

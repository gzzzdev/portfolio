<template>
  <UModal
    v-model:open="open"
    :ui="ui"
    v-bind="$attrs"
  >
    <template #content>
      <slot />
    </template>
  </UModal>
</template>

<script setup lang="ts">
const open = defineModel<boolean>('open', { default: false })
const ui = {
  content: 'z-31'
}
</script>

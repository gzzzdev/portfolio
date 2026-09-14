<template>
  <USidebar
    :ui="{
      header: 'p-1 m-0',
      body: 'p-1 m-0',
      footer: 'p-1 m-0'
    }"
    class="p-0 m-0"
    v-bind="$attrs"
  >
    <template #header="slotProps">
      <slot
        v-if="!p.noHeader"
        name="header"
        v-bind="slotProps ?? {}"
      />
    </template>

    <template #default="slotProps">
      <slot
        name="default"
        v-bind="slotProps ?? {}"
      />
    </template>

    <template #footer="slotProps">
      <slot
        name="footer"
        v-bind="slotProps ?? {}"
      />
    </template>
  </USidebar>
</template>

<script setup lang="ts">
const p = withDefaults(defineProps<{
  noHeader?: boolean
}>(), {
  noHeader: false
})

defineOptions({
  inheritAttrs: false
})
</script>

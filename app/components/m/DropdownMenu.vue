<template>
  <UDropdownMenu :ui="{ content: 'z-41!' }">
    <slot />
    <template #content>
      <slot name="content" />
    </template>
  </UDropdownMenu>
</template>

<script setup lang="ts">

</script>

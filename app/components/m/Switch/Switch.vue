<template>
  <div class="flex flex-row items-center gap-1 ">
    <div
      v-if="leftLabel"
      class="text-sm text-muted"
    >
      {{ leftLabel }}
    </div>
    <USwitch
      v-bind="attrs"
      style="cursor: pointer !important;"
    />
  </div>
</template>

<script setup lang="ts">
interface Props {
  leftLabel?: string
}
const attrs = useAttrs()
const props = withDefaults(defineProps<Props>(), {
  leftLabel: ''
})
</script>

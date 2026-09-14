<template>
  <div class="flex flex-row gap-2">
    <template
      v-for="item in items"
      :key="item.value"
    >
      <div
        class="rounded-full min-w-20 overflow-hidden py-2 px-3 cursor-pointer text-center hover:border-gray-300 transition-colors duration-200"
        :class="[
          { 'bg-inverted text-inverted': model === item.value },
          { 'border-1 text-default bg-default border-accented hover:bg-elevated/60': model !== item.value }
        ]"
        @click="() => model = item.value"
      >
        <div class="text-sm font-medium">
          {{ item.label }}
        </div>
      </div>
      <div v-if="false">
        <input
          :id="item.value"
          name="myabc"
          type="radio"
          :value="item.value"
          :checked="model === item.value"
        >
        <label :for="item.value">{{ item.label }}</label>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  items: { label: string, value: string }[]
}>(), {
})

const model = defineModel<string>({ default: '' })
</script>

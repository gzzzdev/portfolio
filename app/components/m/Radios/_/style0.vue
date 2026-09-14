<template>
  <div class="flex flex-row gap-2">
    <template
      v-for="item in options"
      :key="item.value"
    >
      <div>
        <input
          :id="item.value"
          name="myabc"
          type="radio"
          :value="item.value"
          :checked="selectedOption === item.value"
          @change="() => selectedOption = item.value"
        >
        <label :for="item.value">{{ item.label }}</label>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  options: { label: string, value: string }[]
}>(), {
  options: () => [{ label: '상세정보', value: '상세정보' }, { label: '강의', value: '강의' }]
})

const selectedOption = defineModel<string>({ required: true, default: '' })
selectedOption.value = selectedOption.value ?? props.options[0].value
</script>

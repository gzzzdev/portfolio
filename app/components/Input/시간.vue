<template>
  <div :class="_class">
    <input
      :class="ui2"
      type="time"
      :value="timeInputValue"
      :disabled="readonly"
      :readonly="readonly"
      @input="(e) => onChange(e)"
    >
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { mTime } from '~utils'

import { _ui, _class } from './_'

interface Props {
  readonly?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  readonly: false
})

const ui2 = 'bg-muted w-full border-1 border-gray-300 dark:border-gray-700 rounded-md py-1 px-3 text-[1rem]  cursor-pointer'

// mTime ==  Time(nuxt uim internationalized date)  동일함.
const model = defineModel<typeof mTime | null>({ required: false, default: null })

const timeInputValue = computed(() => {
  const m = model.value
  if (m == null)
    return '00:00'
  return `${String(m.hour).padStart(2, '0')}:${String(m.minute).padStart(2, '0')}`
})

const onChange = (e: Event) => {
  const t = (e.target as HTMLInputElement).value
  const hour = Number(t.split(':')[0])
  const minute = Number(t.split(':')[1])
  const cur = model.value ?? new mTime(0, 0)
  model.value = cur.set({ hour, minute, second: 0 })
}
</script>

<style scoped>
input:focus {
  outline: none;
}
</style>

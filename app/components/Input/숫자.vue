<template>
  <div :class="_class">
    <!-- size="xl" 아이폰 문제가 안생김. -->
    <UInputNumber
      v-model="model"
      size="lg"
      :ui="ui읽기(readonly)"
      :readonly="readonly"
      :disabled="readonly"
    />
  </div>
</template>

<script setup lang="ts">
import { _class, ui읽기 } from './_'

interface Props {
  readonly?: boolean
}
withDefaults(defineProps<Props>(), {
  readonly: false
})

const model = defineModel<string | number | null>({ required: false, default: null })
</script>

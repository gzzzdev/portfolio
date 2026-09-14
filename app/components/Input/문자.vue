<template>
  <div class="w-full overflow-x-hidden">
    <UTextarea
      v-if="is여러줄"
      v-model="model"
      class="w-full text-md"
      :ui="ui읽기(readonly)"
      :readonly="readonly"
      :rows="rows"
      :maxrows="maxrows"
      autoresize
    />
    <UInput
      v-else
      v-model="model"
      class="max-w-full"
      :ui="ui읽기(readonly, inputUi)"
      :readonly="readonly"
    />
  </div>
</template>

<script setup lang="ts">
import { _ui, ui읽기 } from './_'

const inputUi = {
  ..._ui,
  base: `${_ui.base} w-auto min-w-48 max-w-full field-sizing-content`
}

interface Props {
  readonly?: boolean
  is여러줄?: boolean
  rows?: number
  maxrows?: number
}

withDefaults(defineProps<Props>(), {
  readonly: false,
  is여러줄: false,
  rows: 3,
  maxrows: 10
})

const model = defineModel<string | null>({ required: false, default: null })
</script>

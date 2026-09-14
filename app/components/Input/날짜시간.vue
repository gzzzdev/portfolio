<template>
  <div>
    <input
      v-model="model"
      :class="[_ui, props.readonly ? 'border-0! px-0! [&::-webkit-datetime-edit]:p-0 cursor-default' : '']"
      type="datetime-local"
      :readonly="props.readonly"
    >
  </div>
</template>

<script lang="ts">
</script>

<script setup lang="ts">
import { computed } from 'vue'
import { mDayjs } from '~utils'

interface Props {
  readonly?: boolean
}

const _ui = 'border-1 border-gray-300 dark:border-gray-700 rounded-md py-1 px-3 text-[0.875rem]'
const _model = defineModel<ReturnType<typeof mDayjs> | null>({
  required: false,
  default: null
})

const props = withDefaults(defineProps<Props>(), {
  readonly: false
})

const toFormat = (v: ReturnType<typeof mDayjs>) => v?.format('YYYY-MM-DDTHH:mm') ?? ''

const model = computed({
  get: () => {
    return _model.value ? toFormat(_model.value) : ''
  },
  set: (v: string) => {
    if (v === '' || v == null) {
      _model.value = null
      return
    }
    // datetime-local 값은 타임존이 없으므로 KST(+09:00)를 명시해 저장한다.
    _model.value = mDayjs(`${v}+09:00`)
  }
})
</script>

<style scoped>
input:focus {
    outline: none;
}
</style>

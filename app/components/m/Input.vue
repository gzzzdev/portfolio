<template>
  <UInput
    v-model="model"
    :readonly="readonly"
    :loading="isLoading"
    :ui="{ base: 'text-md' }"
    :trailing-icon="trailingIcon || undefined"
    size="sm"
    autofocus
    @keydown.enter.prevent="emitSearch"
  />
</template>

<script setup lang="ts">
interface Props {
  isLoading?: boolean
  readonly?: boolean
  mode?: 'enter' | 'debounce'
  debounceMs?: number
  /** 우측 아이콘. 빈 문자열이면 아이콘 없이 쓴다. */
  trailingIcon?: string
}
const props = withDefaults(defineProps<Props>(), {
  readonly: false,
  mode: 'enter',
  debounceMs: 300,
  trailingIcon: 'i-mdi-search'
})
const model = defineModel<string>({ required: true })
const emit = defineEmits<{
  search: [value: string]
}>()

function emitSearch() {
  emit('search', model.value)
}

const emitDebounced = useDebounceFn(emitSearch, props.debounceMs)

watch(model, () => {
  if (props.mode === 'debounce')
    emitDebounced()
})
</script>

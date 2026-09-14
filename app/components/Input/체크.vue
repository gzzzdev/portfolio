<template>
  <div
    v-if="showSelector"
    :class="[alignCenter ? matrixWrapClass : _class, cursorWrap]"
  >
    <Input선택기
      v-model="selectorModel"
      :items="selectorItems"
      type="radio"
      :readonly="readonly"
      :is-u-i="false"
    />
  </div>
  <div
    v-else
    :class="[alignCenter ? matrixWrapClass : _class, cursorWrap]"
  >
    <UCheckbox
      v-model="model"
      size="lg"
      :ui="checkboxUi"
      :readonly="readonly"
      :disabled="readonly"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { _ui, _class } from './_'

/** 매트릭스 셀용: Nuxt UI checkbox 기본 `items-start` + ./_ 의 max-w-80 보정 */
const matrixWrapClass = 'flex w-full max-w-none min-w-0 items-center justify-center'

interface Props {
  readonly?: boolean
  /** `Input/매트릭스` 등 테이블 셀에서 가운데 정렬 */
  alignCenter?: boolean
  items?: Array<{ label: string, value: any }>
}
const props = withDefaults(defineProps<Props>(), {
  readonly: false,
  alignCenter: false,
  items: () => []
})

const cursorWrap = computed(() => (props.readonly ? 'cursor-not-allowed' : 'cursor-pointer'))

const checkboxUi = computed(() => {
  const c = props.readonly ? 'cursor-not-allowed' : 'cursor-pointer'
  if (props.alignCenter) {
    return {
      ..._ui,
      root: `relative flex w-full max-w-none min-w-0 !items-center !justify-center ${c}`,
      container: `flex !items-center !justify-center ${c}`,
      content: `z-51 ${c}`,
      base: `z-51 text-md ${c}`,
      item: `z-51 ${c}`
    }
  }
  return {
    ..._ui,
    content: `z-51 ${c}`,
    base: `z-51 text-md ${c}`,
    item: `z-51 ${c}`
  }
})

const model = defineModel<boolean>({ required: false, default: false })

const showSelector = computed(() => props.items.length === 2)
const selectorItems = computed(() =>
// props.items
  props.items.map(item => ({
    icon: item.icon,
    label: item.label,
    value: Boolean(item.value)
  }))
)
const selectorModel = computed<boolean>({
  get: () => Boolean(model.value),
  set: (v) => {
    model.value = Boolean(v)
  }
})
</script>

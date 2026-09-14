<template>
  <div class="flex w-full flex-col gap-2">
    <Input선택기
      :items="items"
      :readonly="readonly"
      :search="search"
      :indicator="indicator"
      :type="type"
      :is-미니="is미니"
      :has-삭제="has삭제"
      :삭제라벨="삭제라벨"
      :is-u-i="isUI"
      :model-value="valueModel"
      @update:model-value="onChangeValue"
    />

    <Input선택기
      :items="subItems"
      :readonly="readonly || !hasValue"
      :search="search"
      :indicator="indicator"
      :type="type"
      :is-미니="is미니"
      :has-삭제="has삭제"
      :삭제라벨="sub삭제라벨"
      :is-u-i="isUI"
      :model-value="subValueModel"
      @update:model-value="onChangeSubValue"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'

type iValue = string | number

interface iSubItem {
  icon?: string
  label: string
  value: iValue
}

interface iItem extends iSubItem {
  items?: iSubItem[]
}

interface i기타 {
  search?: boolean
  indicator?: boolean
  type?: 'radio' | 'select' | 'search'
  is미니?: boolean
  has삭제?: boolean
  삭제라벨?: string
  sub삭제라벨?: string
}

interface Props extends i기타 {
  items: iItem[]
  readonly?: boolean
  isUI?: boolean
}

interface iModel {
  value: iValue | null
  subValue: iValue | null
}

const props = withDefaults(defineProps<Props>(), {
  items: () => [{ label: '...', value: '...' }],
  search: !false,
  readonly: false,
  indicator: true,
  isUI: true,
  is미니: false,
  has삭제: false,
  삭제라벨: '선택 해제',
  sub삭제라벨: '하위 선택 해제'
})

const model = defineModel<iModel>({
  required: false,
  default: () => ({ value: null, subValue: null })
})

const valueModel = computed<iValue | null>({
  get: () => model.value?.value ?? null,
  set: (value) => {
    model.value = {
      value,
      subValue: model.value?.subValue ?? null
    }
  }
})

const subValueModel = computed<iValue | null>({
  get: () => model.value?.subValue ?? null,
  set: (subValue) => {
    model.value = {
      value: model.value?.value ?? null,
      subValue
    }
  }
})

const hasValue = computed(() => valueModel.value != null && valueModel.value !== '')

const subItems = computed<iSubItem[]>(() => {
  const parent = props.items.find(item => item.value == valueModel.value)
  return parent?.items ?? []
})

watch([valueModel, subItems], () => {
  const hasCurrentSub = subItems.value.some(item => item.value == subValueModel.value)
  if (!hasCurrentSub) subValueModel.value = null
})

const onChangeValue = (value: unknown) => {
  valueModel.value = (value as iValue) ?? null
}

const onChangeSubValue = (value: unknown) => {
  subValueModel.value = (value as iValue) ?? null
}
</script>

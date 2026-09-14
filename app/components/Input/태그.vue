<template>
  <div :class="_class">
    <UInputTags
      v-model="model"
      class="w-full "
      size="lg"
      :ui="ui최종"
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
const props = withDefaults(defineProps<Props>(), {
  readonly: false
})
const model = defineModel<string[]>({ required: false, default: () => [] })

const ui = {
  root: [
    ' relative inline-flex items-center',
    'flex-wrap',
    'z-40 '
  ],
  base: [
    'text-md',
    'rounded-md',
    'transition-colors'
  ],
  leading: 'absolute inset-y-0 start-0 flex items-center',
  leadingIcon: 'shrink-0 text-dimmed',
  leadingAvatar: 'shrink-0',
  leadingAvatarSize: '',
  trailing: 'absolute inset-y-0 end-0 flex items-center',
  trailingIcon: 'shrink-0 text-dimmed',
  item: 'rounded-md px-1.5 py-0.5  font-medium inline-flex items-center gap-0.5 ring ring-inset ring-accented bg-elevated text-default data-disabled:cursor-not-allowed data-disabled:opacity-75 wrap-anywhere data-[state="active"]:bg-accented',
  itemText: '',
  itemDelete: [
    'inline-flex items-center rounded-xs text-dimmed hover:text-default hover:bg-accented/75 disabled:pointer-events-none',
    'transition-colors'
  ],
  itemDeleteIcon: 'shrink-0',
  input: 'flex-1 border-0 bg-transparent placeholder:text-dimmed focus:outline-none disabled:cursor-not-allowed disabled:opacity-75'
}

/** 못 고치는 칸에 지우기 손잡이가 보이면 "읽기"라는 신호와 어긋난다 — 읽기면 ×를 숨긴다. */
const ui최종 = computed(() => props.readonly
  ? { ...ui읽기(true, ui), itemDelete: 'hidden' }
  : ui)
</script>

<template>
  <div class="flex flex-col gap-2 p-5">
    <div
      v-if="headline"
      class="flex flex-row text-lg"
    >
      {{ headline }}
    </div>
    <div
      v-if="subline"
      class="text-sm text-muted"
    >
      {{ subline }}
    </div>

    <USeparator
      v-if="headline || subline"
      class="my-2"
    />

    <UInput
      v-model="value"
      class="w-full"
      :placeholder="placeholder"
      autofocus
      @keydown.enter.prevent="submit"
    />

    <div class="mt-2 flex flex-row gap-2">
      <div class="grow" />
      <mButton
        size="xl"
        class="px-3"
        :label="confirmLabel"
        @click="submit"
      >
        {{ confirmLabel }}
      </mButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { USeparator } from '#components'
import { computed, ref, watch } from 'vue'

interface Props {
  /** 큰 제목 (없으면 message만 표시) */
  title?: string
  /** 안내 문구 (`window.prompt`의 첫 인자에 해당) */
  message?: string
  /** 초기값 (`window.prompt`의 두 번째 인자) */
  defaultValue?: string
  placeholder?: string
  confirmLabel?: string
  /** true이면 확인 시 앞뒤 공백 제거 */
  trim?: boolean
  onConfirm: (value: string) => void
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  message: '',
  defaultValue: '',
  placeholder: '',
  confirmLabel: '확인',
  trim: false,
  onConfirm: () => {}
})

const value = ref(props.defaultValue ?? '')

watch(
  () => props.defaultValue,
  (v) => {
    value.value = v ?? ''
  }
)

/** 제목이 있으면 제목, 없으면 `window.prompt`처럼 message만 크게 */
const headline = computed(() => {
  const t = props.title?.trim()
  if (t) return t
  return props.message?.trim() || ''
})

/** 제목이 있을 때만 message를 보조 설명으로 */
const subline = computed(() => {
  if (!props.title?.trim()) return ''
  return props.message?.trim() || ''
})

const submit = () => {
  const raw = value.value ?? ''
  props.onConfirm(props.trim ? raw.trim() : raw)
}
</script>

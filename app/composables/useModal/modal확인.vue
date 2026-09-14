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

    <div class="mt-2 flex flex-row flex-wrap items-center gap-2">
      <div class="grow" />
      <mButton
        v-for="갈래 in choices"
        :key="갈래.key"
        size="xl"
        class="px-3"
        :color="갈래.color"
        :variant="갈래.variant"
        :역할="갈래.역할"
        :label="갈래.label"
        @click="onConfirm(갈래.key)"
      >
        {{ 갈래.label }}
      </mButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { USeparator } from '#components'
import { computed } from 'vue'
import type { ModalConfirmChoice } from './modal확인.types'

interface Props {
  /** 큰 제목 (없으면 message만 크게) */
  title?: string
  /** 안내 문구 (`window.confirm`의 인자에 해당) */
  message?: string
  /** 버튼 목록. 순서대로 왼쪽부터 놓인다 */
  choices?: ModalConfirmChoice[]
  onConfirm?: (key: string) => void
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  message: '',
  choices: () => [{ key: 'confirm', label: '확인', color: 'primary', 역할: '강조' }],
  onConfirm: () => {}
})

/** 제목이 있으면 제목, 없으면 `window.confirm`처럼 message만 크게 */
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
</script>

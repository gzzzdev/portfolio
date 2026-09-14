<template>
  <div class="flex flex-col gap-2 p-5">
    <div
      v-if="title?.trim()"
      class="text-lg"
    >
      {{ title }}
    </div>
    <div
      v-if="description?.trim()"
      class="text-sm text-muted"
    >
      {{ description }}
    </div>
    <div
      v-if="title?.trim() || description?.trim()"
      class="my-2 border-t border-default"
    />

    <div
      v-for="step in steps"
      :key="step.key"
      class="flex flex-col gap-1"
    >
      <div
        v-if="step.label?.trim()"
        class="text-sm text-toned"
      >
        {{ step.label }}
      </div>
      <Input선택기
        v-if="step.kind === 'select'"
        type="select"
        :items="effectiveItems(step)"
        :model-value="values[step.key]"
        @update:model-value="(v) => commitField(step, v)"
      />
      <UInput
        v-else-if="step.kind === 'input'"
        :model-value="values[step.key]"
        class="w-full"
        :placeholder="step.placeholder"
        @update:model-value="(v) => commitField(step, v)"
      />
    </div>

    <div class="mt-2 flex items-center gap-2">
      <div class="grow" />
      <mButton
        v-if="wholeRandom"
        size="xl"
        class="shrink-0 px-3"
        :label="wholeRandomLabel"
        @click="doWholeRandom"
      />
      <div class="flex shrink-0 items-center gap-2">
        <mButton
          v-if="hasSelectSteps"
          size="sm"
          class="px-3"

          label="무작위"
          @click="doRandomSelect"
        />
        <mButton
          size="xl"
          class="px-3"
          :label="confirmLabel"
          :disabled="!canSubmit"
          @click="submit"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import type { ModalFieldStep, ModalFieldStepSelect, ModalFieldsWholeRandom } from './modal필드폼.types'

interface Props {
  steps: ModalFieldStep[]
  title?: string
  description?: string
  confirmLabel?: string
  wholeRandom?: ModalFieldsWholeRandom
  onConfirm: (payload: Record<string, any>) => void
}

const props = withDefaults(defineProps<Props>(), {
  steps: () => [],
  title: '',
  description: '',
  confirmLabel: '확인',
  wholeRandom: undefined,
  onConfirm: () => {}
})

const wholeRandomLabel = computed(() => props.wholeRandom?.label?.trim() || '전체 랜덤')

function doWholeRandom() {
  const patch = props.wholeRandom?.fill()
  if (!patch || typeof patch !== 'object') return
  for (const k of Object.keys(patch)) {
    if (k in values) values[k] = (patch as Record<string, any>)[k]
  }
  refreshDepSnapshots()
}

const hasSelectSteps = computed(() => props.steps.some(s => s.kind === 'select'))

function valueFromSelectItem(raw: any) {
  if (raw != null && typeof raw === 'object' && 'value' in raw) return (raw as { value: any }).value
  return raw
}

/** `Input선택기`(select) 스텝만, 위에서 아래로 한 번씩 랜덤 값 적용 (`resolveItems` 의존 순서 유지) */
function doRandomSelect() {
  for (const step of props.steps) {
    if (step.kind !== 'select') continue
    const items = effectiveItems(step)
    if (!items.length) continue
    const raw = items[Math.floor(Math.random() * items.length)]
    commitField(step, valueFromSelectItem(raw))
  }
  refreshDepSnapshots()
}

const values = reactive<Record<string, any>>({})

/** `resolveItems` 단계별로, 직전까지의 값 스냅샷 (상세 `setter` 연쇄와 같은 역할의 기준점) */
const depSnapshots = new Map<number, any[]>()

function snapshotFromSteps(): Record<string, any> {
  const next: Record<string, any> = {}
  for (const s of props.steps) {
    next[s.key] = s.kind === 'select' ? (s.initialValue ?? null) : (s.defaultValue ?? '')
  }
  return next
}

function replaceValues(next: Record<string, any>) {
  for (const key of Object.keys(values)) delete values[key]
  Object.assign(values, next)
}

function computeDepSlice(stepIndex: number) {
  return props.steps.slice(0, stepIndex).map(p => values[p.key])
}

function shallowEqualArr(a: any[], b: any[]) {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false
  return true
}

function refreshDepSnapshots() {
  depSnapshots.clear()
  for (let i = 0; i < props.steps.length; i++) {
    const s = props.steps[i]
    if (s.kind === 'select' && s.resolveItems) depSnapshots.set(i, computeDepSlice(i))
  }
}

function resetSelectAndTrailingSelects(stepIndex: number) {
  const s = props.steps[stepIndex]
  if (s.kind !== 'select' || !s.resolveItems) return
  values[s.key] = s.initialValue ?? null
  for (let j = stepIndex + 1; j < props.steps.length; j++) {
    const sj = props.steps[j]
    if (sj.kind === 'select') values[sj.key] = sj.initialValue ?? null
  }
}

/** 한 필드가 바뀐 뒤, 그 앞 단계를 물고 있는 `resolveItems` 셀렉트부터 초기화 */
function invalidateDependentsAfterChange(changedKey: string) {
  const changedIdx = props.steps.findIndex(s => s.key === changedKey)
  if (changedIdx === -1) return
  for (;;) {
    let progressed = false
    for (let i = 0; i < props.steps.length; i++) {
      const s = props.steps[i]
      if (s.kind !== 'select' || !s.resolveItems) continue
      if (changedIdx >= i) continue
      const prev = depSnapshots.get(i)
      if (prev === undefined) continue
      const curr = computeDepSlice(i)
      if (shallowEqualArr(prev, curr)) continue
      resetSelectAndTrailingSelects(i)
      refreshDepSnapshots()
      progressed = true
      break
    }
    if (!progressed) break
  }
}

function commitField(step: ModalFieldStep, v: any) {
  values[step.key] = v
  invalidateDependentsAfterChange(step.key)
}

function initFromSteps() {
  replaceValues(snapshotFromSteps())
  refreshDepSnapshots()
}

watch(() => props.steps, initFromSteps, { deep: true, immediate: true })

function effectiveItems(step: ModalFieldStepSelect) {
  return step.resolveItems ? step.resolveItems({ ...values }) ?? [] : step.items ?? []
}

const canSubmit = computed(() => {
  if (!props.steps.length) return false
  for (const s of props.steps) {
    const req = s.required ?? (s.kind === 'select')
    if (!req) continue
    const v = values[s.key]
    if (s.kind === 'select') {
      if (v === null || v === undefined || v === '') return false
    } else if (String(v ?? '').trim() === '') return false
  }
  return true
})

function submit() {
  if (!canSubmit.value) return
  const payload: Record<string, any> = { ...values }
  for (const s of props.steps) {
    if (s.kind === 'input' && s.trim) payload[s.key] = String(payload[s.key] ?? '').trim()
  }
  props.onConfirm(payload)
}
</script>

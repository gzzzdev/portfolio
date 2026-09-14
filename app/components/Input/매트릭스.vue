<template>
  <!-- `Input/_` 의 _class 는 max-w-80 이라 CRUD 열 4개가 잘림 → 전폭 사용 -->
  <div class="w-full min-w-0 max-w-full">
    <div
      v-if="!rows.length || !columns.length"
      class="text-sm text-muted py-2 px-1"
    >
      행·열 정의가 없습니다.
    </div>
    <div
      v-else
      class="overflow-x-auto rounded-md border border-default"
    >
      <table class="w-max min-w-full border-collapse text-xs sm:text-sm">
        <thead>
          <tr>
            <th
              scope="col"
              class="sticky left-0 z-1 border-b border-default py-2.5 pl-4 pr-2 text-left text-sm font-semibold text-default bg-default"
            >
              <div class="flex min-w-0 items-center gap-2">
                <span
                  v-if="rowSelectAll"
                  class="inline-flex w-10 shrink-0"
                  aria-hidden="true"
                />
                <span class="whitespace-nowrap">구분</span>
              </div>
            </th>
            <th
              v-for="col in columns"
              :key="col.key"
              scope="col"
              class="border-b border-default px-1.5 py-2.5 text-center text-sm font-semibold text-default whitespace-nowrap min-w-14"
            >
              {{ col.label }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in rows"
            :key="row.key"
            class="border-b border-default last:border-b-0"
          >
            <th
              scope="row"
              class="sticky left-0 z-1 border-r border-default py-1.5 pl-4 pr-2 text-left text-xs font-normal text-toned bg-default"
            >
              <div
                v-if="rowSelectAll"
                class="flex min-w-0 items-center gap-2"
              >
                <div
                  class="flex w-10 shrink-0 items-center justify-center"
                  :title="readonly ? undefined : '이 행 권한 전체 선택/해제'"
                >
                  <UCheckbox
                    :model-value="rowSelectModel(row.key)"
                    :disabled="readonly"
                    size="lg"
                    :ui="rowSelectAllCheckboxUi"
                    :aria-label="`${row.label} 행 전체 선택`"
                    @update:model-value="onRowSelectAll(row.key, $event)"
                  />
                </div>
                <span class="min-w-0 whitespace-nowrap text-[0.9375rem] font-semibold">{{ row.label }}</span>
              </div>
              <span
                v-else
                class="whitespace-nowrap"
              >{{ row.label }}</span>
            </th>
            <td
              v-for="col in columns"
              :key="col.key"
              class="min-w-14 px-1 py-2 align-middle"
            >
              <div class="flex w-full min-h-9 items-center justify-center">
                <Input체크
                  align-center
                  :model-value="cell(row.key, col.key)"
                  :readonly="readonly"
                  @update:model-value="onCheckboxUpdate(row.key, col.key, $event)"
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { clone } from '~utils'
import { _ui } from './_'

/** 행 전체 체크: `Input체크`와 톤 맞춤. 부분 선택은 UCheckbox `indeterminate` */
const rowSelectAllCheckboxUi = {
  ..._ui,
  root: 'relative flex w-10 max-w-none min-w-0 shrink-0 !items-center !justify-center cursor-pointer',
  container: 'flex !items-center !justify-center cursor-pointer'
}

type tTriBool = boolean | 'indeterminate'

export interface iMatrixAxisItem {
  key: string
  label: string
}

/** `행키 → 열키 → 허용 여부`. 미설정 셀은 UI상 `false`로 표시. */
export type iMatrixValue = Record<string, Record<string, boolean>>

interface Props {
  /** 다른 Input과 동일: 부모 `v-model` / `:modelValue` */
  modelValue?: iMatrixValue
  rows: iMatrixAxisItem[]
  columns: iMatrixAxisItem[]
  readonly?: boolean
  /** 행 라벨 왼쪽 «이 행 열 전체» 체크 (일부만 켜져 있으면 줄 표시) */
  rowSelectAll?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  rows: () => [],
  columns: () => [],
  readonly: false,
  rowSelectAll: true
})

const emit = defineEmits<{
  'update:modelValue': [value: iMatrixValue]
}>()

function normalize(
  raw: iMatrixValue | undefined,
  rows: iMatrixAxisItem[],
  columns: iMatrixAxisItem[]
): iMatrixValue {
  const src = raw ?? {}
  const out: iMatrixValue = {}
  for (const r of rows) {
    const row: Record<string, boolean> = {}
    for (const c of columns) {
      row[c.key] = Boolean(src[r.key]?.[c.key])
    }
    out[r.key] = row
  }
  return out
}

/** 체크박스용 내부 행렬. 부모 JSON과 분리 */
const localMatrix = ref<iMatrixValue>(normalize(props.modelValue, props.rows, props.columns))

function matrixSignature(m: iMatrixValue): string {
  return JSON.stringify(m)
}

/** `() => [a,b,c]` 는 매 평가마다 새 배열이라 watch가 과도하게 도는 경우가 있음 → 소스 배열 형태 사용 */
watch(
  [() => props.modelValue, () => props.rows, () => props.columns],
  () => {
    const next = normalize(props.modelValue, props.rows, props.columns)
    if (matrixSignature(next) !== matrixSignature(localMatrix.value)) {
      localMatrix.value = next
    }
  },
  { deep: true, immediate: true }
)

function cell(rowKey: string, colKey: string): boolean {
  return Boolean(localMatrix.value[rowKey]?.[colKey])
}

function rowSelectionStats(rowKey: string): { on: number, total: number } {
  let on = 0
  for (const c of props.columns) {
    if (cell(rowKey, c.key)) on++
  }
  return { on, total: props.columns.length }
}

function rowSelectModel(rowKey: string): tTriBool {
  const { on, total } = rowSelectionStats(rowKey)
  if (total === 0) return false
  if (on === total) return true
  if (on === 0) return false
  return 'indeterminate'
}

function onRowSelectAll(rowKey: string, v: tTriBool) {
  if (props.readonly) return
  applyRowAll(rowKey, v === true)
}

function applyRowAll(rowKey: string, nextVal: boolean) {
  if (props.readonly) return
  const m = clone(localMatrix.value) as iMatrixValue
  if (!m[rowKey]) m[rowKey] = {}
  const row: Record<string, boolean> = { ...m[rowKey] }
  for (const c of props.columns) {
    row[c.key] = nextVal
  }
  m[rowKey] = row
  localMatrix.value = m
  emit('update:modelValue', clone(m) as iMatrixValue)
}

function onCheckboxUpdate(rowKey: string, colKey: string, v: boolean) {
  if (props.readonly) return
  applyCell(rowKey, colKey, v === true)
}

function applyCell(rowKey: string, colKey: string, nextVal: boolean) {
  if (props.readonly) return
  const m = clone(localMatrix.value) as iMatrixValue
  if (!m[rowKey]) m[rowKey] = {}
  m[rowKey] = { ...m[rowKey], [colKey]: nextVal }
  localMatrix.value = m
  emit('update:modelValue', clone(m) as iMatrixValue)
}
</script>

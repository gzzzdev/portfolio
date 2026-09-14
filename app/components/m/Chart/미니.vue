<template>
  <span
    v-if="!false"
    class="m-chart-mini inline-block leading-none whitespace-nowrap text-dimmed font-light "
    :class="ui?.root"
    :style="chartStyle"
    role="img"
    :aria-label="ariaLabel"
  >{{ chartText }}</span>
</template>

<script setup lang="ts">
/** Datatype 폰트 문법: https://github.com/franktisellano/datatype */
export type ChartMiniType = 'bar' | 'line' | 'pie'

const TYPE_PREFIX: Record<ChartMiniType, 'b' | 'l' | 'p'> = {
  bar: 'b',
  line: 'l',
  pie: 'p'
}

const MAX_POINTS = 20
const VALUE_MIN = 0
const VALUE_MAX = 100
const WDTH_MIN = 50
const WDTH_MAX = 150
const WGHT_MIN = 100
const WGHT_MAX = 900

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

/** bar/line: 데이터 내 min-max → Datatype용 0–100 상대 스케일 */
function normalizeValues(values: number[]): number[] {
  if (!values.length) return []
  const min = Math.min(...values)
  const max = Math.max(...values)
  if (min === max) {
    if (min === 0) return values.map(() => VALUE_MIN)
    return values.map(() => VALUE_MAX)
  }
  return values.map(v => Math.round(((v - min) / (max - min)) * 100))
}

/** bar/line: 임의 크기(3, 6, 8 등) + max → Datatype용 0–100 절대 스케일 */
function scaleToMax(values: number[], max: number): number[] {
  if (!values.length || !Number.isFinite(max) || max <= 0) return values
  return values.map(v => Math.round((v / max) * 100))
}

function toDataArray(data: number | number[]): number[] {
  const arr = Array.isArray(data) ? data : [data]
  return arr.map(v => Number(v)).filter(n => Number.isFinite(n))
}

function toChartValues(
  data: number | number[],
  type: ChartMiniType,
  normalize: boolean,
  max?: number
): number[] {
  const sliced = toDataArray(data).slice(0, MAX_POINTS)
  if (type === 'pie') {
    return sliced.map(v => clamp(Math.round(v), VALUE_MIN, VALUE_MAX))
  }
  const values
    = max != null
      ? scaleToMax(sliced, max)
      : normalize
        ? normalizeValues(sliced)
        : sliced
  return values.map(v => clamp(Math.round(v), VALUE_MIN, VALUE_MAX))
}

interface Props {
  /** 차트 값 (bar/line: 최대 20개. 건수·점수 등 임의 숫자 또는 0–100 백분율) */
  data: number | number[]
  type?: ChartMiniType
  /** bar/line: 스케일 기준 최대값 (3,6,8 + max=10 → 30,60,80). 지정 시 normalize보다 우선 */
  max?: number
  /** bar/line: true면 min-max로 0–100 상대 스케일 (3,6,8 → 0,60,100). max 미지정 시만 적용 */
  normalize?: boolean
  /** bar/line: 데이터 순서 반전, pie(도넛): 진행/잔여 비율 반전 */
  reverse?: boolean
  /** variable axis wdth (50–150) */
  width?: number
  /** variable axis wght (100–900) */
  weight?: number
  /** font-size (예: '1.25rem', 20) */
  size?: string | number
  ui?: {
    root?: string
  }
}

const props = withDefaults(defineProps<Props>(), {
  data: () => [30, 70, 50, 90],
  type: 'bar',
  normalize: true,
  reverse: false,
  width: 100,
  weight: 400
})

const chartValues = computed(() => {
  const values = toChartValues(props.data, props.type, props.normalize, props.max)
  if (props.type === 'pie') {
    if (!props.reverse) return values
    return values.map(v => clamp(100 - v, VALUE_MIN, VALUE_MAX))
  }
  return props.reverse ? [...values].reverse() : values
})

const chartText = computed(() => {
  const values = chartValues.value
  const prefix = TYPE_PREFIX[props.type]

  if (props.type === 'pie') {
    return `{p:${values[0] ?? 0}}`
  }

  if (!values.length) return `{${prefix}:0}`

  return `{${prefix}:${values.join(',')}}`
})

const chartStyle = computed(() => {
  const style: Record<string, string> = {
    fontVariationSettings: `'wdth' ${clamp(props.width, WDTH_MIN, WDTH_MAX)}, 'wght' ${clamp(props.weight, WGHT_MIN, WGHT_MAX)}`
  }
  if (props.size != null) {
    style.fontSize = typeof props.size === 'number' ? `${props.size}px` : props.size
  }
  return style
})

const ariaLabel = computed(() => {
  const kind = { bar: '막대', line: '추이', pie: '비율' }[props.type]
  const values = chartValues.value.join(', ')
  return `${kind} 차트: ${values}`
})
</script>

<style scoped>
.m-chart-mini {
  font-family: 'Datatype', sans-serif;
  font-feature-settings: 'liga' 1, 'calt' 1;
  font-variant-ligatures: contextual;
}
</style>

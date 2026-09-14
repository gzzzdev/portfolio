<template>
  <div class="h-full w-full">
    <canvas ref="chartCanvas" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue'
import Chart from 'chart.js/auto'
import type { Chart as ChartType, ChartDataset, Plugin, ScriptableContext } from 'chart.js'
import { getCSSColor, resolveCSSColor } from './_'

export interface BubblePoint {
  x: number
  y: number
  /** Chart.js bubble 반지름(px) */
  r: number
  /** 툴팁용 이름 */
  label?: string
  /** 차트 위 짧은 라벨 (미지정 시 label) */
  shortLabel?: string
  /** 툴팁용 원본 중요도 점수 */
  importance?: number
  /** 점별 색상 (있으면 dataset 색보다 우선) */
  color?: string
}

export interface BubbleDataset {
  label: string
  data: BubblePoint[]
  backgroundColor?: string
  borderColor?: string
  borderWidth?: number
  /** 배경 투명도 0–1 */
  backgroundAlpha?: number
  /** 평균점 등 라벨 표시 */
  showLabels?: boolean
}

interface QuadrantLabels {
  /** 좌상: 매력적 Attractive */
  tl: string
  /** 우상: 일원적 Performance */
  tr: string
  /** 좌하: 무관심 Indifferent */
  bl: string
  /** 우하: 필수적 Must-be */
  br: string
}

interface Props {
  datasets?: BubbleDataset[]
  options?: Record<string, unknown>
  xLabel?: string
  yLabel?: string
  xMin?: number
  xMax?: number
  yMin?: number
  yMax?: number
  /** 사분면 중앙 (미지정 시 축 mid) */
  xMid?: number
  yMid?: number
  /** X축 좌우 반전 */
  xReverse?: boolean
  /** 눈금 value → 표시 라벨 (문자열 또는 줄바꿈 배열) */
  xTickLabels?: Record<number, string | string[]>
  yTickLabels?: Record<number, string | string[]>
  quadrants?: QuadrantLabels | null
}

const props = withDefaults(defineProps<Props>(), {
  datasets: () => [],
  options: () => ({}),
  xLabel: 'X',
  yLabel: 'Y',
  xMin: 0,
  xMax: 3,
  yMin: 0,
  yMax: 3,
  xReverse: false,
  xTickLabels: () => ({}),
  yTickLabels: () => ({}),
  quadrants: null
})

type TickLabelMap = Record<number, string | string[]>

const chartCanvas = ref<HTMLCanvasElement>()
let chart: ChartType | null = null

function withAlpha(color: string, alpha: number) {
  const hsl = color.match(/^hsl\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%\s*\)$/i)
  if (hsl) return `hsla(${hsl[1]}, ${hsl[2]}%, ${hsl[3]}%, ${alpha})`

  if (color.startsWith('oklch(') || color.startsWith('rgb(')) {
    return color.replace(/\)$/, ` / ${alpha})`)
  }
  if (color.startsWith('hsla(') || color.startsWith('rgba(')) {
    return color.replace(/,\s*[\d.]+\)$/, `, ${alpha})`)
  }
  if (color.startsWith('#')) {
    const hex = color.slice(1)
    const full = hex.length === 3
      ? hex.split('').map(c => c + c).join('')
      : hex
    const r = Number.parseInt(full.slice(0, 2), 16)
    const g = Number.parseInt(full.slice(2, 4), 16)
    const b = Number.parseInt(full.slice(4, 6), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }
  return color
}

const quadrantPlugin: Plugin<'bubble'> = {
  id: 'kanoQuadrants',
  beforeDraw(chartInstance) {
    const { ctx, chartArea, scales } = chartInstance
    if (!chartArea || !scales.x || !scales.y) return

    const xMid = props.xMid ?? 0
    const yMid = props.yMid ?? 0
    const midX = scales.x.getPixelForValue(xMid)
    const midY = scales.y.getPixelForValue(yMid)
    const zeroX = scales.x.getPixelForValue(0)
    const zeroY = scales.y.getPixelForValue(0)
    const axisColor = getCSSColor('--ui-text') || '#334155'

    // x=0, y=0 기준선 (가독성)
    ctx.save()
    ctx.strokeStyle = axisColor
    ctx.globalAlpha = 0.55
    ctx.lineWidth = 2
    ctx.setLineDash([])
    ctx.beginPath()
    if (zeroX >= chartArea.left && zeroX <= chartArea.right) {
      ctx.moveTo(zeroX, chartArea.top)
      ctx.lineTo(zeroX, chartArea.bottom)
    }
    if (zeroY >= chartArea.top && zeroY <= chartArea.bottom) {
      ctx.moveTo(chartArea.left, zeroY)
      ctx.lineTo(chartArea.right, zeroY)
    }
    ctx.stroke()
    ctx.restore()

    // 0이 아닌 분면 중앙이면 점선 보조
    if (xMid !== 0 || yMid !== 0) {
      ctx.save()
      ctx.strokeStyle = getCSSColor('--ui-border') || 'rgba(128,128,128,0.35)'
      ctx.lineWidth = 1
      ctx.setLineDash([4, 4])
      ctx.beginPath()
      ctx.moveTo(midX, chartArea.top)
      ctx.lineTo(midX, chartArea.bottom)
      ctx.moveTo(chartArea.left, midY)
      ctx.lineTo(chartArea.right, midY)
      ctx.stroke()
      ctx.restore()
    }

    if (!props.quadrants) return

    const muted = getCSSColor('--ui-text-muted') || 'rgba(128,128,128,0.55)'
    ctx.save()
    ctx.fillStyle = muted
    ctx.font = '12px sans-serif'
    ctx.textBaseline = 'middle'

    const pad = 10
    ctx.textAlign = 'left'
    ctx.fillText(props.quadrants.tl, chartArea.left + pad, (chartArea.top + midY) / 2)
    ctx.textAlign = 'right'
    ctx.fillText(props.quadrants.tr, chartArea.right - pad, (chartArea.top + midY) / 2)
    ctx.textAlign = 'left'
    ctx.fillText(props.quadrants.bl, chartArea.left + pad, (midY + chartArea.bottom) / 2)
    ctx.textAlign = 'right'
    ctx.fillText(props.quadrants.br, chartArea.right - pad, (midY + chartArea.bottom) / 2)
    ctx.restore()
  }
}

const labelPlugin: Plugin<'bubble'> = {
  id: 'bubblePointLabels',
  afterDatasetsDraw(chartInstance) {
    const { ctx } = chartInstance
    chartInstance.data.datasets.forEach((dataset, datasetIndex) => {
      const meta = chartInstance.getDatasetMeta(datasetIndex)
      if (meta.hidden) return
      const showLabels = (props.datasets[datasetIndex] as BubbleDataset | undefined)?.showLabels
      if (!showLabels) return

      ctx.save()
      ctx.fillStyle = getCSSColor('--ui-text') || '#333'
      ctx.font = '11px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'bottom'

      meta.data.forEach((element, index) => {
        const point = dataset.data[index] as BubblePoint | undefined
        const text = point?.shortLabel ?? point?.label
        if (!text) return
        const { x, y } = element.getProps(['x', 'y'], true)
        ctx.fillText(text, x, y - (point.r || 0) - 2)
      })
      ctx.restore()
    })
  }
}

function tickCallback(value: string | number, labels: TickLabelMap) {
  const n = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(n)) return ''
  if (Object.keys(labels).length) {
    return labels[n] ?? ''
  }
  return Number.isInteger(n) ? String(n) : n.toFixed(1)
}

function createChart() {
  if (!chartCanvas.value) return
  const ctx = chartCanvas.value.getContext('2d')
  if (!ctx) return

  const primary = getCSSColor('--ui-primary') || getCSSColor('--color-primary') || '#3b82f6'
  const secondary = getCSSColor('--ui-secondary') || getCSSColor('--color-secondary') || '#64748b'
  const textColor = getCSSColor('--ui-text') || getCSSColor('--color-neutral-700') || '#334155'
  const mutedColor = getCSSColor('--ui-text-muted') || getCSSColor('--color-neutral-500') || '#64748b'
  const gridColor = 'rgba(128,128,128,0.14)'

  if (chart) chart.destroy()

  const chartDatasets: ChartDataset<'bubble', BubblePoint[]>[] = props.datasets.map((dataset, i) => {
    const fallback = resolveCSSColor(dataset.backgroundColor || (i === 0 ? primary : secondary))
    const alpha = dataset.backgroundAlpha ?? (i === 0 ? 0.35 : 0.75)
    const hasPointColors = dataset.data.some(p => p.color)

    return {
      label: dataset.label,
      data: dataset.data,
      backgroundColor: hasPointColors
        ? dataset.data.map(p => withAlpha(resolveCSSColor(p.color || fallback), alpha))
        : withAlpha(fallback, alpha),
      borderColor: hasPointColors
        ? dataset.data.map(p => resolveCSSColor(p.color || dataset.borderColor || fallback))
        : resolveCSSColor(dataset.borderColor || fallback),
      borderWidth: dataset.borderWidth ?? 1.5
    }
  })

  const axisTitle = (text: string) => ({
    display: true,
    text,
    color: textColor,
    font: { size: 13, weight: 600 as const },
    padding: { top: 8, bottom: 4 }
  })

  const axisTicks = (labels: TickLabelMap) => ({
    stepSize: 1,
    color: mutedColor,
    font: { size: 11, weight: 500 as const },
    padding: 8,
    autoSkip: false,
    callback: (value: string | number) => tickCallback(value, labels)
  })

  chart = new Chart(ctx, {
    type: 'bubble',
    data: { datasets: chartDatasets },
    plugins: [quadrantPlugin, labelPlugin],
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: {
        padding: { top: 8, right: 20, bottom: 8, left: 12 }
      },
      plugins: {
        legend: {
          position: 'top',
          display: props.datasets.length > 1,
          labels: {
            color: textColor,
            font: { size: 12 },
            boxWidth: 12,
            padding: 16
          }
        },
        tooltip: {
          callbacks: {
            label(context: ScriptableContext<'bubble'>) {
              const raw = context.raw as BubblePoint
              const title = raw.label ? `${raw.label}: ` : ''
              const imp = raw.importance != null ? raw.importance.toFixed(2) : '-'
              return `${title}필요도 ${raw.x.toFixed(2)}, 매력도 ${raw.y.toFixed(2)}, 중요도 ${imp}`
            }
          }
        }
      },
      scales: {
        x: {
          min: props.xMin,
          max: props.xMax,
          reverse: props.xReverse,
          bounds: 'ticks',
          title: axisTitle(props.xLabel),
          ticks: axisTicks(props.xTickLabels),
          grid: { color: gridColor },
          border: { display: true, color: mutedColor }
        },
        y: {
          min: props.yMin,
          max: props.yMax,
          bounds: 'ticks',
          title: axisTitle(props.yLabel),
          ticks: axisTicks(props.yTickLabels),
          grid: { color: gridColor },
          border: { display: true, color: mutedColor }
        }
      },
      ...props.options
    }
  })
}

onMounted(() => createChart())

watch(
  () => [
    props.datasets,
    props.options,
    props.quadrants,
    props.xMin,
    props.xMax,
    props.yMin,
    props.yMax,
    props.xReverse,
    props.xTickLabels,
    props.yTickLabels
  ],
  () => createChart(),
  { deep: true }
)

onUnmounted(() => {
  chart?.destroy()
  chart = null
})
</script>

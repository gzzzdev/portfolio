<template>
  <div class="h-full w-full">
    <canvas ref="chartCanvas" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import Chart from 'chart.js/auto'
import { resolveCSSColor } from '../_'
import { hoverGuideLinePlugin, getCurrentIndex, applyCurrentFocus } from './chartBehavior'

interface ChartDataset {
  label: string
  data: number[]
  fill?: boolean
  borderColor?: string
  backgroundColor?: string
  borderWidth?: number
  tension?: number
  pointBackgroundColor?: string
  pointBorderColor?: string
  pointBorderWidth?: number
  pointRadius?: number
  color?: string
  onClick?: () => void
}

interface ChartData {
  labels: string[]
  datasets: ChartDataset[]
}

interface Props {
  data?: ChartData
  options?: any
  current?: number | null
  is영역?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  data: () => ({
    labels: ['1주차', '2주차', '3주차', '4주차', '5주차', '6주차', '7주차', '8주차'],
    datasets: [
      {
        label: '수학 이수율 (%)',
        data: [78, 85, 82, 88, 91, 87, 89, 92],
        fill: true,
        color: 'var(--color-secondary)',
        onClick: () => console.log('수학 이수율 click')
      },
      {
        label: '사회 이수율 (%)',
        data: [92, 88, 95, 82, 87, 90, 93, 89],
        fill: true,
        color: 'var(--color-neutral-600)',
        onClick: () => console.log('사회 이수율 click')
      },
      {
        label: '과학 이수율 (%)',
        data: [80, 87, 83, 90, 85, 88, 91, 86],
        fill: true,
        color: 'var(--color-neutral-500)',
        onClick: () => console.log('과학 이수율 click')
      }
    ]
  }),
  options: () => ({}),
  current: null,
  is영역: !true,
  onClick: undefined
})

const chartCanvas = ref<HTMLCanvasElement>()
let chart: Chart | null = null

const createChart = () => {
  if (!chartCanvas.value) return

  const ctx = chartCanvas.value.getContext('2d')
  if (!ctx) return

  if (chart) {
    chart.destroy()
  }

  chart = new Chart(ctx, {
    type: 'line',
    plugins: [hoverGuideLinePlugin],
    data: {
      labels: props.data.labels,
      datasets: props.data.datasets.map(dataset => ({
        ...dataset,
        borderColor: resolveCSSColor(dataset.borderColor || dataset.color),
        backgroundColor: dataset.color,
        fill: props.is영역,
        tension: 0.3,
        borderWidth: 2,
        pointBorderWidth: 1
      }))
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      onHover: (_event, elements) => {
        if (elements.length === 0) {
          applyCurrentFocus(chart, props.data, props.current)
        }
      },
      onClick: (_event, elements) => {
        if (elements.length > 0) {
          const element = elements[0]
          const datasetIndex = element.datasetIndex
          const dataIndex = element.index
          const dataset = props.data.datasets[datasetIndex]

          if (dataset.onClick && typeof dataset.onClick === 'function') {
            dataset.onClick()
          }
        }
      },
      plugins: {
        hoverGuideLine: {
          display: true,
          color: 'rgba(148, 163, 184, 0.7)',
          lineWidth: 1,
          dashed: true,
          currentIndex: getCurrentIndex(props.current, props.data)
        },
        legend: {
          display: true,
          labels: {
            font: {},
            pointStyle: 'circle',
            boxWidth: 5,
            boxHeight: 5
          },
          position: 'top' as const
        },
        title: {
          display: !true
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              return context.dataset.label + ': ' + context.parsed.y
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: false,
          min: () => {
            const allData = props.data.datasets.flatMap(dataset => dataset.data)
            const minValue = Math.min(...allData)
            return minValue > 0 ? minValue - 10 : 0
          },
          max: () => {
            const allData = props.data.datasets.flatMap(dataset => dataset.data)
            const maxValue = Math.max(...allData.filter(x => x > 0))
            return maxValue + 5
          },
          ticks: props.options?.ticks
        }
      },
      ...props.options
    }
  })

  applyCurrentFocus(chart, props.data, props.current)
}

onMounted(() => {
  createChart()
})

watch(() => props.data, () => {
  createChart()
}, { deep: true })

watch(() => props.options, () => {
  createChart()
}, { deep: true })

watch(() => props.current, () => {
  createChart()
})
</script>

import type Chart from 'chart.js/auto'

interface ChartDataset {
  data: number[]
}

interface ChartData {
  labels: string[]
  datasets: ChartDataset[]
}

export const hoverGuideLinePlugin = {
  id: 'hoverGuideLine',
  afterDatasetsDraw(chartInstance: any, _args: any, pluginOptions: any) {
    if (pluginOptions?.display === false) return

    const activeElements = chartInstance.getActiveElements()
    const { ctx, chartArea } = chartInstance

    let x: number | null = null
    if (activeElements.length > 0) {
      x = activeElements[0].element.x
    } else if (typeof pluginOptions?.currentIndex === 'number') {
      const fallbackPoint = chartInstance.getDatasetMeta(0)?.data?.[pluginOptions.currentIndex]
      if (fallbackPoint) x = fallbackPoint.x
    }
    if (x === null) return

    ctx.save()
    ctx.beginPath()
    ctx.moveTo(x, chartArea.top)
    ctx.lineTo(x, chartArea.bottom)
    ctx.lineWidth = pluginOptions?.lineWidth ?? 1
    ctx.strokeStyle = pluginOptions?.color ?? 'rgba(148, 163, 184, 0.7)'
    ctx.setLineDash(pluginOptions?.dashed ? [4, 4] : [])
    ctx.stroke()
    ctx.restore()
  }
}

export const getCurrentIndex = (current: number | null | undefined, data: ChartData) => {
  if (!Number.isInteger(current)) return null
  const index = Number(current)
  if (index < 0 || index >= data.labels.length) return null
  return index
}

export const applyCurrentFocus = (chart: Chart | null, data: ChartData, current: number | null | undefined) => {
  if (!chart) return
  const currentIndex = getCurrentIndex(current, data)
  if (currentIndex === null) return

  const activeElements = data.datasets.map((_, datasetIndex) => ({
    datasetIndex,
    index: currentIndex
  }))
  const anchorPoint = chart.getDatasetMeta(0)?.data?.[currentIndex]
  if (!anchorPoint) return

  chart.setActiveElements(activeElements)
  chart.tooltip?.setActiveElements(activeElements, {
    x: anchorPoint.x,
    y: anchorPoint.y
  })
  chart.update()
}

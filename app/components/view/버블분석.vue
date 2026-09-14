<template>
  <div class="mx-auto max-w-5xl space-y-4 px-5 py-6">
    <div>
      <h1 class="text-2xl font-semibold">
        Kano 버블 분석
      </h1>
      <p class="mt-1 text-sm text-muted">
        X 필요도 · Y 매력도 · 지름 중요도 · 응답 {{ totalResponses }}명 · 기능 {{ features.length }}개
      </p>
    </div>

    <div class="flex items-center justify-end gap-2">
      <span class="shrink-0 text-xs text-muted">버블 지름</span>
      <mSlider
        v-model="radiusScale"
        class="w-40"
        wrapper-class="flex w-40 min-w-20 flex-col"
        size="sm"
        :min="0.5"
        :max="2"
        :step="0.05"
      />
      <span class="w-10 shrink-0 text-right text-xs tabular-nums text-muted">{{ radiusScale.toFixed(2) }}×</span>
    </div>

    <div class="h-140 w-full">
      <mChart버블
        :datasets="chartDatasets"
        x-label="이 기능이 없다면? → 필요도"
        y-label="매력도 ← 이 기능이 있다면?"
        :x-min="AXIS_MIN"
        :x-max="AXIS_MAX"
        :y-min="AXIS_MIN"
        :y-max="AXIS_MAX"
        :x-mid="AXIS_MID"
        :y-mid="AXIS_MID"
        :x-reverse="true"
        :x-tick-labels="xTickLabels"
        :y-tick-labels="yTickLabels"
        :quadrants="quadrants"
      />
    </div>

    <div class="flex flex-wrap gap-x-3 gap-y-1.5">
      <div
        v-for="item in featureLegend"
        :key="item.index"
        class="flex items-center gap-1.5 text-xs"
      >
        <span
          class="size-2.5 shrink-0 rounded-full"
          :style="{ backgroundColor: item.color }"
        />
        <span class="text-muted tabular-nums">{{ item.index + 1 }}.</span>
        <span>{{ item.title }}</span>
      </div>
    </div>

    <p class="text-xs text-muted">
      점수: {{ scoreHint }}
    </p>
  </div>
</template>

<script setup lang="ts">
import As from '~/pages/(_renew)/(test)/sandbox/survey/As'
import Qs, { features, subQs } from '~/pages/(_renew)/(test)/sandbox/survey/Qs'
import type { BubbleDataset, BubblePoint } from '~/components/m/Chart/버블.vue'

const SUB = {
  ATTRACTIVE: 1,
  NECESSITY: 2,
  IMPORTANCE: 3
} as const

const subById = new Map(subQs.map(q => [q.qId, q]))

const SCORE_ATTRACTIVE = subById.get(SUB.ATTRACTIVE)!.scores!
const SCORE_NECESSITY = subById.get(SUB.NECESSITY)!.scores!
const SCORE_IMPORTANCE = subById.get(SUB.IMPORTANCE)!.scores!

const axisScores = [...SCORE_ATTRACTIVE, ...SCORE_NECESSITY]
const AXIS_MIN = Math.min(...axisScores) - 0.35
const AXIS_MAX = Math.max(...axisScores) + 0.35
const AXIS_MID = 0

function buildTickLabels(qId: number) {
  const q = subById.get(qId)!
  return Object.fromEntries(
    q.options!.map((opt, i) => [q.scores![i]!, [opt, String(q.scores![i])]])
  ) as Record<number, string[]>
}

const xTickLabels = buildTickLabels(SUB.NECESSITY)
const yTickLabels = buildTickLabels(SUB.ATTRACTIVE)

const IMP_MIN = Math.min(...SCORE_IMPORTANCE)
const IMP_MAX = Math.max(...SCORE_IMPORTANCE)
const R_MIN = 5
const R_MAX = 22
/** 중요도 버블 지름 배율 (슬라이더) */
const radiusScale = ref(1)

/** 기능(질문)별 고정 색 — hue를 고르게 분배 (canvas 호환) */
function featureColor(index: number, total = features.length) {
  const hue = Math.round((index * 360) / total)
  return `hsl(${hue}, 65%, 48%)`
}

const featureLegend = features.map((feature, index) => ({
  index,
  title: feature.title,
  color: featureColor(index)
}))

const totalResponses = As.length

const quadrants = {
  tl: 'Performance · 일원적',
  tr: 'Attractive · 매력적',
  bl: 'Must-be · 필수적',
  br: 'Indifferent · 무관심'
}

const scoreHint = computed(() => {
  const fmt = (qId: number) => {
    const q = subById.get(qId)!
    return q.options!.map((opt, i) => `${opt}=${q.scores![i]}`).join(' · ')
  }
  return `긍정 ${fmt(SUB.ATTRACTIVE)} / 부정 ${fmt(SUB.NECESSITY)} / 중요도 ${fmt(SUB.IMPORTANCE)}`
})

function scoreFromIdx(idx: number | undefined, map: number[]) {
  if (idx == null || idx < 0 || idx >= map.length) return null
  return map[idx]!
}

function radiusFromImportance(importance: number) {
  const span = IMP_MAX - IMP_MIN || 1
  const t = (importance - IMP_MIN) / span
  return R_MIN + t * (R_MAX - R_MIN)
}

function pickScores(optionIdx: number[]) {
  return {
    attractive: scoreFromIdx(optionIdx[0], SCORE_ATTRACTIVE),
    necessity: scoreFromIdx(optionIdx[1], SCORE_NECESSITY),
    importance: scoreFromIdx(optionIdx[2], SCORE_IMPORTANCE)
  }
}

/** 개별 응답 점 (응답×기능) */
const responsePoints = computed<BubblePoint[]>(() => {
  const points: BubblePoint[] = []

  As.forEach((response, responseIdx) => {
    for (const answer of response.answers) {
      const featureIdx = Qs.findIndex(q => q.qId === answer.qId)
      if (featureIdx < 0) continue
      const scores = pickScores(answer.optionIdx)
      if (scores.attractive == null || scores.necessity == null || scores.importance == null) continue

      // 동일 좌표 겹침 완화용 아주 작은 jitter
      const jx = ((responseIdx % 5) - 2) * 0.03
      const jy = ((Math.floor(responseIdx / 5) % 5) - 2) * 0.03

      points.push({
        x: scores.necessity + jx,
        y: scores.attractive + jy,
        r: radiusFromImportance(scores.importance) * 0.7 * radiusScale.value,
        importance: scores.importance,
        color: featureColor(featureIdx),
        label: `${features[featureIdx]!.title} (#${responseIdx + 1})`
      })
    }
  })

  return points
})

/** 기능별 평균 점 */
const averagePoints = computed<BubblePoint[]>(() =>
  features.map((feature, index) => {
    const qId = Qs[index]!.qId
    const scores = As.map((response) => {
      const answer = response.answers.find(a => a.qId === qId)
      if (!answer) return null
      return pickScores(answer.optionIdx)
    }).filter((s): s is NonNullable<typeof s> =>
      s != null && s.attractive != null && s.necessity != null && s.importance != null
    )

    const n = scores.length || 1
    const attractive = scores.reduce((sum, s) => sum + s.attractive!, 0) / n
    const necessity = scores.reduce((sum, s) => sum + s.necessity!, 0) / n
    const importance = scores.reduce((sum, s) => sum + s.importance!, 0) / n

    return {
      x: necessity,
      y: attractive,
      r: radiusFromImportance(importance) * radiusScale.value,
      importance,
      color: featureColor(index),
      label: feature.title,
      shortLabel: `${index + 1}`
    }
  })
)

const chartDatasets = computed<BubbleDataset[]>(() => [
  {
    label: '개별 응답',
    data: responsePoints.value,
    borderWidth: 0.5,
    backgroundAlpha: 0.35
  },
  {
    label: '기능 평균',
    data: averagePoints.value,
    borderWidth: 2,
    backgroundAlpha: 0.85,
    showLabels: true
  }
])
</script>

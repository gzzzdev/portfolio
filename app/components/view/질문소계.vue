<template>
  <div class="mx-auto max-w-3xl space-y-4 px-5 py-6">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="text-2xl font-semibold">
          질문별 응답 소계
        </h1>
        <p class="mt-1 text-sm text-muted">
          응답 {{ totalResponses }}명 · 질문 {{ features.length }}개
        </p>
      </div>

      <div class="flex flex-wrap gap-2">
        <mButton
          size="sm"
          :켜짐="sortKey === null"
          label="기본순"
          @click="sortKey = null"
        />
        <mButton
          v-for="(label, subIdx) in SUB_LABELS"
          :key="label"
          size="sm"
          :켜짐="sortKey === subIdx"
          :label="sortLabel(label, subIdx)"
          @click="toggleSort(subIdx)"
        />
      </div>
    </div>

    <UCard
      v-for="q in displayedQuestions"
      :key="q.qId"
    >
      <template #header>
        <div>
          <div class="font-medium">
            {{ q.originalIndex + 1 }}. {{ q.title }}
          </div>
          <div class="text-sm text-muted">
            {{ q.description }}
          </div>
        </div>
      </template>

      <div class="space-y-4">
        <div
          v-for="(sub, subIdx) in q.subs"
          :key="sub.subQId"
          class="space-y-1.5"
        >
          <div class="flex items-baseline justify-between gap-3 text-sm">
            <div class="font-medium">
              {{ sub.label }}
              <span class="font-normal text-muted">· {{ sub.question }}</span>
            </div>
            <div
              class="shrink-0 tabular-nums"
              :class="sortKey === subIdx ? 'font-semibold' : 'text-muted'"
            >
              평균
              <span
                class="font-medium"
                :style="{ color: colorByScore(sub.avgScore) }"
              >{{ formatAvg(sub.avgScore) }}</span>
            </div>
          </div>

          <div class="flex h-7 w-full overflow-hidden rounded-md bg-muted/40">
            <div
              v-for="opt in sub.options"
              :key="opt.label"
              class="flex items-center justify-center text-[0.6875rem] font-medium text-white tabular-nums transition-all"
              :style="{
                width: `${opt.pct}%`,
                backgroundColor: opt.color,
                minWidth: opt.count ? '1.25rem' : '0'
              }"
              :title="`${opt.label}: ${opt.count}명`"
            >
              <span v-if="opt.pct >= 12">{{ opt.count }}</span>
            </div>
          </div>

          <div class="flex flex-wrap gap-x-3 gap-y-1">
            <div
              v-for="opt in sub.options"
              :key="opt.label"
              class="flex items-center gap-1.5 text-xs text-muted"
            >
              <span
                class="size-2 shrink-0 rounded-sm"
                :style="{ backgroundColor: opt.color }"
              />
              <span>{{ opt.label }}</span>
              <span class="tabular-nums">{{ opt.count }}</span>
            </div>
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import As from '~/pages/(_renew)/(test)/sandbox/survey/As'
import Qs, { features, subQs } from '~/pages/(_renew)/(test)/sandbox/survey/Qs'

const SUB_LABELS = ['매력도', '필요도', '중요도'] as const

const totalResponses = As.length

/** scores: + 파랑 · 0 회색 · - 빨강 (절댓값이 클수록 진하게) */
function colorByScore(score: number) {
  const t = Math.min(Math.abs(score) / 2, 1)
  if (score > 0) return `hsl(215, ${55 + t * 20}%, ${72 - t * 28}%)`
  if (score < 0) return `hsl(0, ${55 + t * 20}%, ${72 - t * 28}%)`
  return 'hsl(0, 0%, 68%)'
}

function countOption(qId: number, subIdx: number, optionIdx: number) {
  let count = 0
  for (const response of As) {
    const answer = response.answers.find(a => a.qId === qId)
    if (answer?.optionIdx[subIdx] === optionIdx) count += 1
  }
  return count
}

function formatAvg(score: number) {
  const rounded = Math.round(score * 100) / 100
  return rounded > 0 ? `+${rounded}` : String(rounded)
}

const questions = features.map((feature, index) => {
  const q = Qs[index]!
  const subIds = q.qIds ?? subQs.map(s => s.qId)

  return {
    qId: q.qId,
    originalIndex: index,
    title: feature.title,
    description: feature.description,
    subs: subIds.map((subId, subIdx) => {
      const sub = subQs.find(s => s.qId === subId)!
      const options = (sub.options ?? []).map((label, optionIdx) => {
        const count = countOption(q.qId, subIdx, optionIdx)
        const score = sub.scores?.[optionIdx] ?? 0
        return {
          label,
          count,
          score,
          pct: totalResponses ? (count / totalResponses) * 100 : 0,
          color: colorByScore(score)
        }
      })

      const answered = options.reduce((sum, opt) => sum + opt.count, 0)
      const avgScore = answered
        ? options.reduce((sum, opt) => sum + opt.score * opt.count, 0) / answered
        : 0

      return {
        subQId: subId,
        label: SUB_LABELS[subIdx] ?? sub.question,
        question: sub.question,
        avgScore,
        options
      }
    })
  }
})

/** null = 기본순, 0·1·2 = 해당 소질문 평균 */
const sortKey = ref<number | null>(null)
/** true = 높은 평균 먼저 */
const sortDesc = ref(true)

function toggleSort(subIdx: number) {
  if (sortKey.value === subIdx) {
    sortDesc.value = !sortDesc.value
    return
  }
  sortKey.value = subIdx
  sortDesc.value = true
}

function sortLabel(label: string, subIdx: number) {
  if (sortKey.value !== subIdx) return label
  return `${label} ${sortDesc.value ? '↓' : '↑'}`
}

const displayedQuestions = computed(() => {
  if (sortKey.value == null) return questions

  const key = sortKey.value
  const dir = sortDesc.value ? -1 : 1

  return [...questions].sort((a, b) => {
    const av = a.subs[key]?.avgScore ?? 0
    const bv = b.subs[key]?.avgScore ?? 0
    if (av === bv) return a.originalIndex - b.originalIndex
    return (av - bv) * dir
  })
})
</script>

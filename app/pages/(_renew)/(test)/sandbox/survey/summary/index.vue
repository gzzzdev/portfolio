<template>
  <div class="h-[calc(100dvh-4.75rem)] min-h-0 w-full">
    <mSplitter
      v-model="ratio"
      :can수정="true"
    >
      <template #left>
        <div class="h-full space-y-4 overflow-y-auto px-5 py-6">
          <div class="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 class="text-2xl font-semibold">
                요약보고 근거 테이블
              </h1>
              <p class="mt-1 text-sm text-muted">
                응답 {{ totalResponses }}명 · 기능 {{ rows.length }}개 · 매력도 · 필요도 · 중요도 평균
              </p>
            </div>

            <mButton
              size="sm"

              icon="i-lucide-copy"
              label="마크다운 복사"
              @click="copyMarkdown"
            />
          </div>

          <UCard>
            <UTable
              :data="rows"
              :columns="columns"
              class="w-full"
            >
              <template #index-cell="{ row }">
                <span class="tabular-nums text-muted">{{ row.original.index + 1 }}</span>
              </template>

              <template #title-cell="{ row }">
                <div>
                  <div class="font-medium">
                    {{ row.original.title }}
                  </div>
                  <div class="text-xs text-muted">
                    {{ row.original.description }}
                  </div>
                </div>
              </template>

              <template #attractive-cell="{ row }">
                <span
                  class="tabular-nums font-medium"
                  :style="{ color: colorByScore(row.original.attractive) }"
                >{{ formatAvg(row.original.attractive) }}</span>
              </template>

              <template #necessity-cell="{ row }">
                <span
                  class="tabular-nums font-medium"
                  :style="{ color: colorByScore(row.original.necessity) }"
                >{{ formatAvg(row.original.necessity) }}</span>
              </template>

              <template #importance-cell="{ row }">
                <span
                  class="tabular-nums font-medium"
                  :style="{ color: colorByScore(row.original.importance) }"
                >{{ formatAvg(row.original.importance) }}</span>
              </template>
            </UTable>
          </UCard>

          <p class="text-xs text-muted">
            점수 범위: {{ scoreHint }}
          </p>
        </div>
      </template>

      <template #right>
        <Chat :markdown="markdown" />
      </template>
    </mSplitter>
  </div>
</template>

<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { useClipboard } from '@vueuse/core'
import As from '../As'
import Qs, { features, subQs } from '../Qs'
import Chat from './Chat.vue'

definePageMeta({
  layout: 'layout-test',
  제목: '요약 근거표',
  설명: '요약보고가 어떤 숫자에서 나왔는지 따라가는 표.',
  상태: '대기'
})

const SUB = {
  ATTRACTIVE: 1,
  NECESSITY: 2,
  IMPORTANCE: 3
} as const

const subById = new Map(subQs.map(q => [q.qId, q]))

const SCORE_ATTRACTIVE = subById.get(SUB.ATTRACTIVE)!.scores!
const SCORE_NECESSITY = subById.get(SUB.NECESSITY)!.scores!
const SCORE_IMPORTANCE = subById.get(SUB.IMPORTANCE)!.scores!

const totalResponses = As.length
const { copy } = useClipboard()
const toast = useToast()
const ratio = ref(58)

interface Row {
  index: number
  title: string
  description: string
  attractive: number
  necessity: number
  importance: number
}

function scoreFromIdx(idx: number | undefined, map: number[]) {
  if (idx == null || idx < 0 || idx >= map.length) return null
  return map[idx]!
}

function pickScores(optionIdx: number[]) {
  return {
    attractive: scoreFromIdx(optionIdx[0], SCORE_ATTRACTIVE),
    necessity: scoreFromIdx(optionIdx[1], SCORE_NECESSITY),
    importance: scoreFromIdx(optionIdx[2], SCORE_IMPORTANCE)
  }
}

function avg(values: number[]) {
  if (!values.length) return 0
  return values.reduce((sum, v) => sum + v, 0) / values.length
}

function formatAvg(score: number) {
  const rounded = Math.round(score * 100) / 100
  return rounded > 0 ? `+${rounded}` : String(rounded)
}

/** scores: + 파랑 · 0 회색 · - 빨강 (절댓값이 클수록 진하게) */
function colorByScore(score: number) {
  const t = Math.min(Math.abs(score) / 2, 1)
  if (score > 0) return `hsl(215, ${55 + t * 20}%, ${72 - t * 28}%)`
  if (score < 0) return `hsl(0, ${55 + t * 20}%, ${72 - t * 28}%)`
  return 'hsl(0, 0%, 68%)'
}

function fmtScale(qId: number) {
  const q = subById.get(qId)!
  return q.options!.map((opt, i) => `${opt}=${q.scores![i]}`).join(', ')
}

const scoreHint = `매력도(${fmtScale(SUB.ATTRACTIVE)}) / 필요도(${fmtScale(SUB.NECESSITY)}) / 중요도(${fmtScale(SUB.IMPORTANCE)})`

const rows: Row[] = features.map((feature, index) => {
  const qId = Qs[index]!.qId
  const scores = As.map((response) => {
    const answer = response.answers.find(a => a.qId === qId)
    if (!answer) return null
    return pickScores(answer.optionIdx)
  }).filter((s): s is NonNullable<typeof s> =>
    s != null && s.attractive != null && s.necessity != null && s.importance != null
  )

  return {
    index,
    title: feature.title,
    description: feature.description,
    attractive: avg(scores.map(s => s.attractive!)),
    necessity: avg(scores.map(s => s.necessity!)),
    importance: avg(scores.map(s => s.importance!))
  }
})

const columns: TableColumn<Row>[] = [
  { accessorKey: 'index', header: '#' },
  { accessorKey: 'title', header: '기능' },
  { accessorKey: 'attractive', header: '매력도' },
  { accessorKey: 'necessity', header: '필요도' },
  { accessorKey: 'importance', header: '중요도' }
]

const markdown = computed(() => {
  const header = [
    `- 응답 수: ${totalResponses}명`,
    `- 기능 수: ${rows.length}개`,
    `- 점수: ${scoreHint}`,
    '',
    '| # | 기능 | 설명 | 매력도 | 필요도 | 중요도 |',
    '|---|------|------|--------|--------|--------|'
  ]

  const body = rows.map(r =>
    `| ${r.index + 1} | ${r.title} | ${r.description} | ${formatAvg(r.attractive)} | ${formatAvg(r.necessity)} | ${formatAvg(r.importance)} |`
  )

  return [...header, ...body].join('\n')
})

async function copyMarkdown() {
  await copy(markdown.value)
  toast.add({
    title: '복사됨',
    description: 'LLM에 붙여넣을 마크다운이 클립보드에 있습니다.',
    color: 'success'
  })
}
</script>

<!--
  고민 기록 한 장의 상세 — `/decisions` 카드를 누르면 온다.

  ## 왜 카드가 판으로 곧장 가지 않나 (2026-09-15)

  한때 카드 = 판 링크였다. 그러면 카드가 결론 원문을 다 져야 했고(판은 기록의 메모를 안 그린다),
  그 원문이 만든 사람의 메모라 — CSS 변수·컴포넌트 이름·이 리포에서만 통하는 말 — 한 장을 두세 번
  읽어야 했다. 게다가 판이 없는 설계 결정(데이터·권한)은 누를 곳이 없어 목차에 아예 못 올랐다.

  그래서 두 층으로 갈랐다. **카드 = 처음 보는 사람의 말(`고민`·`요약`), 여기 = 메모 그대로.**
  판은 여기서 한 번 더 눌러 연다.

  **옷은 목차(`decisions/index.vue`)와 같다**(`layout-official`). 판은 안 입는다 — 그 머리말.
  이 화면도 도메인 데이터를 안 읽는다 — `~/utils/decisions` 정적 배열만 본다.
-->
<template>
  <article class="mx-auto flex w-full max-w-3xl flex-col gap-10 px-5 py-6">
    <header class="flex flex-col gap-4">
      <NuxtLink
        to="/decisions"
        class="w-fit text-sm text-muted hover:text-highlighted"
      >
        ← 고민 기록
      </NuxtLink>
      <p class="flex items-center gap-2 text-xs tracking-widest text-dimmed">
        <UIcon
          :name="상태.icon"
          class="size-4"
          :class="상태.색"
        />
        {{ 기록.갈래 }} · {{ 상태.이름 }}
      </p>
      <h1 class="text-2xl font-semibold tracking-tight text-highlighted sm:text-3xl">
        {{ 기록.고민 }}
      </h1>
      <p class="text-base leading-relaxed text-default">
        {{ 기록.요약 }}
      </p>
      <UButton
        v-if="is판열림"
        :to="기록.판"
        color="neutral"
        variant="outline"
        trailing-icon="i-lucide-arrow-up-right"
        class="self-start"
      >
        그때 깔았던 비교판 열기
      </UButton>
    </header>

    <!-- 메모 — 만든 사람이 적은 말 그대로다. 옮겨 적으면서 다듬지 않는다(두 벌이 된다). -->
    <dl class="flex flex-col gap-6 border-t border-default pt-8 text-[15px] leading-[1.8]">
      <div class="flex flex-col gap-1">
        <dt class="text-sm font-semibold text-highlighted">
          나란히 놓고 본 것
        </dt>
        <dd>{{ 기록.놓고본것 }}</dd>
      </div>
      <div
        v-if="기록.결론"
        class="flex flex-col gap-1"
      >
        <dt class="text-sm font-semibold text-highlighted">
          고른 것과 이유
        </dt>
        <dd>{{ 기록.결론 }}</dd>
      </div>
      <div
        v-if="기록.반영"
        class="flex flex-col gap-1"
      >
        <dt class="text-sm font-semibold text-highlighted">
          {{ 상태.이름 === '정함' ? '반영된 곳' : '지금까지 온 곳' }}
        </dt>
        <dd class="text-sm text-muted">
          {{ 기록.반영 }}
        </dd>
      </div>
      <div class="flex flex-col gap-1">
        <dt class="text-sm font-semibold text-highlighted">
          논거 원문
        </dt>
        <dd class="text-sm text-muted">
          <a
            v-if="코드주소"
            :href="코드주소"
            target="_blank"
            rel="noopener"
            class="font-mono underline decoration-primary/50 underline-offset-4 hover:text-primary hover:decoration-primary"
          >{{ 기록.근거 }}</a>
          <span
            v-else
            class="font-mono"
          >{{ 기록.근거 }}</span>
          <span class="block">왜 그 값이 이겼는지는 코드 옆 머리말에 적어 두었습니다.</span>
        </dd>
      </div>
    </dl>
  </article>
</template>

<script setup lang="ts">
import { decisionRecord, decisionStatus, decisionSourceUrl, hasDecisionBoard } from '~/utils/decisions'
import { 포트폴리오저장소 } from '~/composables/usePortfolio'
import { useHeroPageTitle } from '~/composables/useLayoutHero'

definePageMeta({ layout: 'layout-official' })
useHeroPageTitle('고민 기록')

const route = useRoute()
const router = useRouter()

const 찾은기록 = decisionRecord.find(x => x.키 === String(route.params.key))
if (!찾은기록) throw createError({ statusCode: 404, statusMessage: '없는 기록입니다', fatal: true })
const 기록 = 찾은기록

useHead({ title: `${기록.고민} — 고민 기록` })

const 상태 = {
  정함: { 이름: '정함', icon: 'i-lucide-circle-check', 색: 'text-success' },
  미반영: { 이름: '골랐고, 아직 안 넣음', icon: 'i-lucide-clock', 색: 'text-info' },
  열림: { 이름: '아직 열려 있음', icon: 'i-lucide-circle-help', 색: 'text-warning' }
}[decisionStatus(기록)]

/** 판이 지워졌으면 버튼만 빠진다 — 기록은 그대로 선다(`~/utils/decisions` 의 `판`) */
const is판열림 = hasDecisionBoard(기록, router)
const 코드주소 = decisionSourceUrl(기록, 포트폴리오저장소)
</script>

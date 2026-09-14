<!--
  개발자 이력서 — 포트폴리오 소개 화면(`/portfolio`)의 「개발자 이력서」 버튼이 여기로 온다.

  `/portfolio` 와 같은 결의 공개 화면이다. **이 화면은 도메인 데이터를 안 읽는다** — 내용은 전부 `~/utils/resume` 의 정적 자료다.
  그래서 `access-control.global` 의 `접근제어제외경로s` 에 올려 두었다(`/decisions` 와 같은 사정).

  **옷은 `/portfolio` 와 같다**(`layout-official` — 투명 헤더·짧은 사진 히어로·바닥). 예전엔 셸 없는 빈 레이아웃(`layout-none`)이라
  입구에서 「개발자 이력서」를 누르면 머리·바닥이 사라져 딴 사이트로 넘어간 것처럼 읽혔다.
  폭·여백도 `/portfolio` 의 바깥 틀(`max-w-(--ui-container) px-5 py-6`)을 그대로 쓴다. 히어로 제목은 이 화면이 올린다(`useHeroPageTitle`).

  ## 세 칸 — 가운데가 메인축

  서류의 링크로 들어온 검토자가 3초 안에 누구인지, 어디서 무엇을 했는지 알아야 한다. 그래서 넓은 화면은
  - **가운데** — 머리(이름·직함·연락처·링크·경력 기간·소개 `profile.intro`) → applying → 경력 → 프로젝트.
    경력·프로젝트는 **경력순**(`경력순`)이고 `summary`·`highlights` 만 보인다(`ResumeEntry`).
    **story 줄글은 따로 서지 않고 가리키는 칸 안에 산다**(`story단락s`) — 제목만 보이고 누르면 펼친다.
    `details` 도 접힌 채다.
  - **왼쪽** — threads(웹 줄기 · 단계별 생성 …). 좁은 칸이라 표가 아니라 `year · what` / `how` 두 줄로 쌓는다.
    `ref` 가 있는 단계를 누르면 가운데 그 칸으로 건너가며 접힌 것을 연다(`펼치기`).
    story 「웹 줄기」는 다섯 칸을 가리키는 개관이라 같은 제목의 thread 밑에 접어 둔다(`줄기에붙는단락`).
  - **오른쪽** — 기술 · 학력 · 수상. 작게.

  두 사이드는 `lg` 부터 본문과 같이 내려가다 멈춘다(sticky) — 제 안의 스크롤바는 없다(`.side`). 그보다 좁으면 한 줄로 쌓는다 —
  머리 → applying·경력·프로젝트 → threads → 기술·학력·수상.

  ## 이 화면이 안 하는 것

  - **json 에 없는 문장을 짓지 않는다.** 요약·수식어·배경을 덧붙이지 않고, 비어 있는 칸은 비워 둔다.
    제목(「경력」 같은 섹션 이름) 말고는 전부 json 의 문장 그대로다.
  - 아이콘·배지·차트·애니메이션 없음. 흑백과 회색, 본문 위주 — 서류 PDF 와 같은 톤.
    **강조색(`primary`)은 세 자리에만 옅게** — 링크 밑줄, 진행 중 경력의 「현재」, 줄글 펼침 화살표(`ResumeEntry`). 제목·배경·꼬리표엔 안 쓴다 — 늘어나면 서류가 아니라 광고로 읽힌다.
  - `lineage` 는 안 그린다 — threads 의 「웹 줄기」(`t-web`)와 같은 네 줄이라 두 번 나온다.
  - `stats.note` 도 안 그린다 — 머리는 경력 한 줄 + 소개만 두는 자리다.
    소개(`profile.intro`)는 한때 빠져 있었는데, 이력서만 따로 연 사람이 누구인지 모른 채 카드부터 읽게 돼 올렸다.
-->
<template>
  <!-- 위아래 여백은 레이아웃의 `main` 이 준다(`/portfolio` 와 같다) -->
  <div class="resume mx-auto grid w-full max-w-2xl gap-16 px-5 py-6 text-[15px] leading-[1.75] text-default sm:text-base lg:max-w-(--ui-container) lg:gap-x-8">
    <!-- 머리 -->
    <header class="area-head flex flex-col gap-2 border-b border-default pb-6">
      <NuxtLink
        to="/portfolio"
        class="mb-2 w-fit text-sm text-muted hover:text-highlighted"
      >
        ← 포트폴리오
      </NuxtLink>
      <h1 class="flex flex-wrap items-baseline gap-x-3 text-2xl font-semibold tracking-tight text-highlighted">
        {{ 이력.profile.name }}
        <span class="text-base font-normal text-muted">{{ 이력.profile.title }}</span>
      </h1>
      <p class="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
        <a
          :href="`mailto:${이력.profile.email}`"
          class="hover:text-highlighted"
        >{{ 이력.profile.email }}</a>
        <a
          v-for="l in 바깥링크s(이력.profile.links)"
          :key="l.url"
          :href="l.url"
          target="_blank"
          rel="noopener"
          class="underline decoration-primary/50 underline-offset-4 hover:text-primary hover:decoration-primary"
        >{{ l.label }}</a>
      </p>
      <p class="text-sm text-muted">
        총 경력 {{ 이력.stats.total }} · 웹 프론트엔드 {{ 이력.stats.webFrontend }}
      </p>
      <!-- 이력서만 따로 연 사람이 카드보다 먼저 「어떤 사람인가」를 읽는 자리 -->
      <div class="mt-2 flex max-w-2xl flex-col gap-3">
        <p
          v-for="단락 in 이력.profile.intro.split('\n\n')"
          :key="단락"
        >
          {{ 단락 }}
        </p>
      </div>
    </header>

    <!-- 가운데: applying · 경력 · 프로젝트 -->
    <div class="area-main flex flex-col gap-16">
      <section
        v-if="문구.is지원"
        class="flex flex-col gap-8 border-b border-default pb-8"
      >
        <div>
          <h2 class="text-lg font-semibold text-highlighted">
            {{ 이력.applying.target }} 지원
          </h2>
          <div class="prose-tight">
            <MDC :value="이력.applying.motivation" />
          </div>
        </div>

        <ul class="flex flex-col gap-1">
          <li
            v-for="p in 바깥링크s(이력.applying.proof)"
            :key="p.url"
          >
            <a
              :href="p.url"
              target="_blank"
              rel="noopener"
              class="underline decoration-primary/50 underline-offset-4 hover:text-primary hover:decoration-primary"
            >{{ p.label }}</a>
          </li>
        </ul>
      </section>

      <section class="flex flex-col gap-6">
        <h2 class="text-lg font-semibold text-highlighted">
          경력
        </h2>
        <ResumeEntry
          v-for="e in 경력s"
          :id="e.id"
          :key="e.id"
          :title="e.org"
          :subtitle="e.role"
          :tag="고용형태s[e.employmentType]"
          :period="기간(e.period)"
          :current="!e.period.end"
          :summary="e.summary"
          :highlights="e.highlights"
          :stories="story단락s[e.id]"
          :details="e.details"
          :tech="e.tech"
          :links="바깥링크s(e.links)"
        />
      </section>

      <section class="flex flex-col gap-6">
        <h2 class="text-lg font-semibold text-highlighted">
          프로젝트
        </h2>
        <ResumeEntry
          v-for="p in 프로젝트s"
          :id="p.id"
          :key="p.id"
          :title="p.name"
          :subtitle="p.context"
          :tag="진행상태s[p.status]"
          :period="기간(p.period)"
          :current="!p.period.end"
          :summary="p.summary"
          :highlights="p.highlights"
          :stories="story단락s[p.id]"
          :details="p.details"
          :tech="p.tech"
          :links="바깥링크s(p.links)"
        />
      </section>
    </div>

    <!-- 왼쪽: threads -->
    <aside
      ref="왼쪽Ref"
      class="area-threads side flex flex-col gap-10 lg:gap-8"
      :style="{ '--side-h': `${왼쪽높이}px` }"
    >
      <article
        v-for="t in 이력.threads"
        :key="t.id"
        class="flex flex-col gap-3"
      >
        <div>
          <h2 class="text-lg font-semibold text-highlighted lg:text-base">
            {{ t.title }}
          </h2>
          <p class="text-sm text-muted">
            {{ t.why }}
          </p>
        </div>
        <details
          v-if="문구.is지원 && 줄기에붙는단락 && 줄기에붙는단락.heading === t.title"
          class="group text-sm"
        >
          <summary class="w-fit cursor-pointer list-none text-muted underline underline-offset-4 hover:text-highlighted [&::-webkit-details-marker]:hidden">
            <span class="group-open:hidden">줄글로 보기</span>
            <span class="hidden group-open:inline">접기</span>
          </summary>
          <div class="prose-tight">
            <MDC :value="줄기에붙는단락.body" />
          </div>
        </details>
        <ol class="flex flex-col text-sm leading-relaxed">
          <li
            v-for="step in t.steps"
            :key="step.year + step.what"
            class="grid grid-cols-[4rem_1fr] gap-2 border-t border-default py-2 last:border-b"
          >
            <span class="tabular-nums text-muted">{{ step.year }}</span>
            <span>
              <a
                v-if="step.ref"
                :href="`#${step.ref}`"
                class="text-highlighted underline decoration-primary/40 underline-offset-4 hover:text-primary hover:decoration-primary"
                @click="펼치기(step.ref)"
              >{{ step.what }}</a>
              <span
                v-else
                class="text-highlighted"
              >{{ step.what }}</span>
              <span class="block text-muted">{{ step.how }}</span>
            </span>
          </li>
        </ol>
      </article>
    </aside>

    <!-- 오른쪽: 기술 · 학력 · 수상 -->
    <aside
      ref="오른쪽Ref"
      class="area-facts side flex flex-col gap-8 text-sm leading-relaxed"
      :style="{ '--side-h': `${오른쪽높이}px` }"
    >
      <div>
        <h2 class="mb-2 font-semibold text-highlighted">
          기술
        </h2>
        <dl class="flex flex-col gap-1">
          <div
            v-for="g in 이력.skills"
            :key="g.label"
            class="flex gap-3"
          >
            <dt class="w-16 shrink-0 text-muted">
              {{ g.label }}
            </dt>
            <dd>{{ g.items.join(' · ') }}</dd>
          </div>
        </dl>
      </div>
      <div>
        <h2 class="mb-2 font-semibold text-highlighted">
          학력
        </h2>
        <p
          v-for="ed in 이력.education"
          :key="ed.school"
        >
          {{ ed.school }} {{ ed.major }}
          <span class="block text-muted tabular-nums">{{ 기간(ed.period) }}</span>
        </p>
      </div>
      <div>
        <h2 class="mb-2 font-semibold text-highlighted">
          수상 · 선정 · 특허
        </h2>
        <ul class="flex flex-col gap-1.5">
          <li
            v-for="aw in 이력.awards"
            :key="aw.title"
            class="grid grid-cols-[2.75rem_1fr] gap-2"
          >
            <span class="text-muted tabular-nums">{{ aw.year ?? '' }}</span>
            <span>
              {{ aw.title }}
              <span
                v-if="aw.by || aw.note"
                class="block text-muted"
              >{{ [aw.by, aw.note].filter(Boolean).join(' · ') }}</span>
            </span>
          </li>
        </ul>
      </div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { useElementSize } from '@vueuse/core'
import { useHeroPageTitle } from '~/composables/useLayoutHero'
import { 이력, 기간, 경력순, 진행상태s, 고용형태s, story단락s, 줄기에붙는단락, 바깥링크s } from '~/utils/resume'
import { usePortfolio } from '~/composables/usePortfolio'

/** 외주 배포(`wishket`)에선 지원 섹션과 토스를 부르는 「웹 줄기」 줄글을 안 그린다 */
const { 문구 } = usePortfolio()

/**
 * `/portfolio` 와 같은 옷(머리말). `/resume` 은 어느 메뉴에도 없어 히어로 제목을 이 화면이 올린다 —
 * 포트폴리오 띠의 링크 이름(「이력서」)과 같은 말로(`/portfolio`·`/decisions` 와 같은 규칙).
 */
definePageMeta({ layout: 'layout-official' })
useHeroPageTitle('이력서')
useHead({ title: `개발자 이력서 — ${이력.profile.name}` })

const 경력s = 경력순(이력.experience)
const 프로젝트s = 경력순(이력.projects)

/**
 * 왼쪽에서 가리킨 칸의 접힌 것(story·더보기)을 연다. 스크롤은 `href="#id"` 가 한다 —
 * 같은 링크를 두 번 눌러도(사이에 접었어도) 다시 열리게 해시 감시가 아니라 클릭에 건다.
 */
function 펼치기(id: string) {
  document.getElementById(id)?.querySelectorAll('details').forEach((d) => {
    d.open = true
  })
}

/** 해시 붙은 주소로 바로 들어와도 연다 */
onMounted(() => {
  const id = decodeURIComponent(location.hash.slice(1))
  if (id) 펼치기(id)
})

/**
 * 사이드가 멈출 자리(`.side` 의 `top`)를 셈하려고 제 높이를 잰다. 펼치기(「줄글로 보기」)로 늘어도 따라 잰다.
 * 서버엔 높이가 없어(0) 헤더 밑에 붙는 값으로 시작한다 — 좁은 화면은 `.side` 규칙 자체가 안 선다.
 */
const 왼쪽Ref = useTemplateRef<HTMLElement>('왼쪽Ref')
const 오른쪽Ref = useTemplateRef<HTMLElement>('오른쪽Ref')
const { height: 왼쪽높이 } = useElementSize(왼쪽Ref, undefined, { box: 'border-box' })
const { height: 오른쪽높이 } = useElementSize(오른쪽Ref, undefined, { box: 'border-box' })
</script>

<style scoped>
.resume {
  grid-template-areas: 'head' 'main' 'threads' 'facts';
}
.area-head { grid-area: head; }
.area-main { grid-area: main; }
.area-threads { grid-area: threads; }
.area-facts { grid-area: facts; }

/*
  세 칸 — 사이드는 **제 안에서 스크롤하지 않는다**(패널마다 스크롤바가 서면 서류가 앱처럼 보였다).
  본문과 같이 내려가다가 멈춘다: 화면보다 짧으면 헤더 밑에, 길면 제 끝이 화면 바닥에 닿은 자리에(`--side-h` 를 잰 값).
  헤더 높이는 `layout-official` 이 잰다(`--ui-layout-header-offset`).
*/
@media (min-width: 1024px) {
  .resume {
    grid-template-columns: 18rem minmax(0, 1fr) 15rem;
    grid-template-rows: auto 1fr;
    grid-template-areas:
      'threads head facts'
      'threads main facts';
    justify-content: center;
    row-gap: 3rem;
  }
  .side {
    position: sticky;
    top: min(var(--ui-layout-header-offset, 4rem), calc(100vh - var(--side-h, 0px)));
    align-self: start;
    padding-block: 1.5rem;
  }
}

/* 산문 기본 문단 여백(`my-5`)이 단락 제목과 떠 보인다 — 첫 문단만 붙인다 */
.prose-tight :deep(p:first-child) {
  margin-top: 0.5rem;
}
.prose-tight :deep(p:last-child) {
  margin-bottom: 0;
}
.prose-tight :deep(p) {
  line-height: 1.75;
}
</style>

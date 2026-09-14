<!--
  이력서의 경력·프로젝트 한 칸. 둘은 머리만 다르고 몸(요약 · 불릿 · 더보기 · 기술 · 링크)은 같은 모양이라 한 벌로 둔다.
  머리의 꼬리표(고용형태·진행상태)는 `tag` 로 받는다 — 글자만, 색 없이. 강조색은 진행 중 기간·링크·줄글 화살표에만.
  story 줄글(`stories`)도 이 칸 안에 산다 — 제목 한 줄만 보이고 누르면 본문이 펼쳐진다.

  **`details` 는 접힌 채가 기본이다.** 한 칸에 `더보기` 하나 — 제목들까지 늘 보이면 카드가 길어져
  검토자가 훑는 목록이 목록으로 안 읽힌다. `<details>` 라 자바스크립트 없이 열린다.
  `highlights`·`details` 가 비었으면 그 자리를 비워 둔다 — 채울 말을 지어내지 않는다.
-->
<template>
  <article
    :id="id"
    class="flex scroll-mt-[calc(var(--ui-layout-header-offset,4rem)+1.5rem)] flex-col gap-2.5 border-t border-default pt-5"
  >
    <header class="flex flex-col gap-0.5">
      <div class="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
        <h3 class="text-base font-semibold text-highlighted">
          {{ title }}
        </h3>
        <span
          v-if="tag"
          class="text-sm text-muted"
        >{{ tag }}</span>
        <span
          class="ml-auto text-sm tabular-nums"
          :class="current ? 'text-primary' : 'text-muted'"
        >{{ period }}</span>
      </div>
      <p
        v-if="subtitle"
        class="text-sm text-muted"
      >
        {{ subtitle }}
      </p>
    </header>

    <p>{{ summary }}</p>

    <ul
      v-if="highlights.length"
      class="flex list-disc flex-col gap-1 pl-5 marker:text-dimmed"
    >
      <li
        v-for="줄 in highlights"
        :key="줄"
      >
        {{ 줄 }}
      </li>
    </ul>

    <!-- story 줄글 — 제목만 보이고 누르면 펼친다. 단락마다 따로 열리게 한 덩어리로 묶지 않는다 -->
    <details
      v-for="s in stories"
      :key="s.id"
      class="group/story"
    >
      <summary class="w-fit cursor-pointer list-none text-sm font-semibold text-highlighted hover:underline hover:underline-offset-4 [&::-webkit-details-marker]:hidden">
        <span class="mr-1.5 inline-block text-primary group-open/story:rotate-90">›</span>{{ s.heading }}
      </summary>
      <div class="mt-2 border-l border-default pl-4 [&_div>*:first-child]:mt-0 [&_div>*:last-child]:mb-0">
        <MDC :value="s.body" />
      </div>
    </details>

    <details
      v-if="details.length"
      class="group"
    >
      <summary class="w-fit cursor-pointer list-none text-sm text-muted underline underline-offset-4 hover:text-highlighted [&::-webkit-details-marker]:hidden">
        <span class="group-open:hidden">더보기</span>
        <span class="hidden group-open:inline">접기</span>
      </summary>
      <div class="mt-3 flex flex-col gap-4 border-l border-default pl-4">
        <section
          v-for="d in details"
          :key="d.title"
        >
          <h4 class="text-sm font-semibold text-highlighted">
            {{ d.title }}
          </h4>
          <!-- 산문 기본 여백(`my-5`)은 이 칸에서 위아래가 뜬다 — 첫·끝 문단만 붙인다 -->
          <div class="[&_div>*:first-child]:mt-1 [&_div>*:last-child]:mb-0">
            <MDC :value="d.body" />
          </div>
        </section>
      </div>
    </details>

    <p
      v-if="tech.length || links?.length"
      class="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted"
    >
      <span v-if="tech.length">{{ tech.join(' · ') }}</span>
      <a
        v-for="l in links"
        :key="l.url"
        :href="l.url"
        target="_blank"
        rel="noopener"
        class="underline decoration-primary/50 underline-offset-4 hover:text-primary hover:decoration-primary"
      >{{ l.label }}</a>
    </p>
  </article>
</template>

<script setup lang="ts">
import type { Detail, Link, StorySection } from '~/utils/resume'

withDefaults(defineProps<{
  id: string
  title: string
  subtitle?: string
  tag?: string
  period: string
  /** 진행 중 — 기간을 강조색으로(`pages/resume.vue` 머리말의 네 자리) */
  current?: boolean
  summary: string
  highlights: string[]
  /** 이 칸에 사는 story 단락(`story단락s`) */
  stories?: StorySection[]
  details: Detail[]
  tech: string[]
  links?: Link[]
}>(), { stories: () => [] })
</script>

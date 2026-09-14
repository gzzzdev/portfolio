<!--
  홈 1 · 포털형 — official.team-mjt.com 메인과 같은 판.
  사진 캐러셀(+ 바닥 공지 띠) → 공지 → 오늘의 소식(대표·곁) → 자료(스레드) → 영상 띠.

  **맨 위는 사진 캐러셀이다**(2026-09-15 되살림 — 그리는 건 레이아웃 `layout-official`). 한동안 테마에 맞춘다고 매거진식 머리글 + 고정 공지 2줄로
  바꿨었는데, 원래 판의 첫인상이 통째로 빠져서 되돌렸다. 고정 공지 2줄은 캐러셀 바닥의 **돌아가는 공지 띠**
  (`lLandingNoticeBar`)로 옮겼다 — 바로 아래 공지 칸과 같은 글을 두 번 늘어놓지 않고, 첫 화면 안에서 최신 공지가 보인다.
  왼쪽 퀵메뉴는 뺐다.

  글은 표본이 아니라 **실제 게시글**이다(`components/home/_홈글`). 자료 칸만 게시글이 아니라
  챗봇도 참조하는 조직 문서(`model자료`)를 읽는다.
-->
<template>
  <div class="flex w-full flex-col">
    <HomeNotices
      eyebrow="NOTICE"
      title="팀 마장터에서 알립니다"
      :categories="공지구분s"
      :notices="공지카드s"
    />

    <div class="bg-neutral-200 dark:bg-neutral-800">
      <HomeNews
        today-eyebrow="TODAY"
        today-title="지원 현장과 모임 소식"
        people-eyebrow="PEOPLE"
        people-title="함께하는 사람들"
        :items="소식카드s"
      />
    </div>

    <section
      id="index-resources"
      ref="자료칸"
      class="mx-auto w-full max-w-(--ui-container) scroll-mt-20 px-4 py-8 sm:px-6 sm:py-10 lg:px-8"
    >
      <div v-bind="자료등장(0)">
        <HomeSectionHead
          eyebrow="RESOURCES"
          title="자료"
        />
      </div>
      <!--
        자료는 내려받는 파일이 아니라 **읽는 긴 글**(`model자료`, 협회 디지털전환 에세이)이다 — 표지 사진이 없는 글에
        물감 표지를 씌우면 빈 액자만 남는다. 그래서 카드가 아니라 **스레드**: 왼쪽 레일(아바타 + 세로줄)에 글이 이어 달리는
        모양. 글쓴이는 기관 하나뿐이라 아바타도 하나로 통일했다. 넓은 화면은 두 줄기, 폰은 한 줄기.
      -->
      <div class="grid gap-x-12 lg:grid-cols-2">
        <ol
          v-for="(열, 열i) in 자료열s"
          :key="열i"
          class="min-w-0"
        >
          <!-- 폰에선 두 줄기가 위아래로 쌓여 한 줄기가 된다 — 줄기 끝 항목도 폰에선 여백·세로줄을 이어 준다(마지막 줄기 끝만 뺀다). -->
          <li
            v-for="(자료, i) in 열"
            :key="자료.stateId"
            class="flex gap-3"
            v-bind="자료등장(120 + i * 70 + 열i * 35)"
            :class="i < 열.length - 1 ? 'pb-7' : (열i < 자료열s.length - 1 ? 'pb-7 lg:pb-0' : '')"
          >
            <div class="flex shrink-0 flex-col items-center">
              <UAvatar
                text="마"
                size="md"
                :alt="기관.이름"
                :ui="{ root: 'bg-primary/10 ring ring-primary/20', fallback: 'font-semibold text-primary' }"
              />
              <span
                v-if="i < 열.length - 1 || 열i < 자료열s.length - 1"
                class="mt-2 w-px grow bg-accented"
                :class="{ 'lg:hidden': i === 열.length - 1 }"
                aria-hidden="true"
              />
            </div>
            <NuxtLink
              :to="`/resources/${자료.stateId}`"
              class="group min-w-0 grow rounded-md outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            >
              <div class="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
                <span class="font-medium text-default">{{ 기관.이름 }}</span>
                <span aria-hidden="true">·</span>
                <span class="tabular-nums">{{ 짧은날(자료.state?.createdAt ?? new Date()) }}</span>
                <UBadge
                  v-if="!자료.공개"
                  label="회원"
                  color="warning"
                  variant="subtle"
                  size="xs"
                />
              </div>
              <h3 class="mt-1 font-medium leading-snug text-highlighted break-keep group-hover:text-primary">
                {{ 자료.제목 }}
              </h3>
              <p class="mt-1.5 line-clamp-3 text-sm leading-relaxed text-muted break-keep">
                {{ 자료.요약 }}
              </p>
              <p class="mt-2 flex items-center gap-1 text-xs text-dimmed">
                <UIcon
                  name="i-lucide-book-open"
                  class="size-3.5"
                />
                약 {{ 읽기분(자료) }}분 읽기
              </p>
            </NuxtLink>
          </li>
        </ol>
      </div>
    </section>

    <!--
      QnA 는 메뉴에 없다(공지·뉴스와 같이 홈이 입구). 공지·소식처럼 늘 읽는 글이 아니라 **막혔을 때 찾아가는 글**이라
      칸을 세우지 않고 링크 한 줄로 둔다.
    -->
    <div class="mx-auto w-full max-w-(--ui-container) px-4 pb-8 sm:px-6 lg:px-8">
      <NuxtLink
        to="/boards/qna"
        class="group flex items-center gap-3 rounded-xl border border-default bg-default px-4 py-3 hover:bg-elevated/50"
      >
        <UIcon
          name="i-ph:chat-centered-dots-light"
          class="size-5 shrink-0 text-muted"
        />
        <span class="min-w-0 grow text-sm text-default break-keep">
          궁금한 점이 있으신가요? <span class="font-medium text-highlighted group-hover:text-primary">QnA 보기</span>
        </span>
        <UIcon
          name="i-lucide-chevron-right"
          class="size-4 shrink-0 text-dimmed"
        />
      </NuxtLink>
    </div>

    <HomeYoutubes
      eyebrow="NOW"
      title="영상으로 먼저 만나 보세요"
      description="정기 모임 발표와 지원 현장을 영상으로 확인하세요."
      :clips="영상클립s"
      :contact="{ phone: '', note: '' }"
      :social-links="채널s"
    />
  </div>
</template>

<script setup lang="ts">
/**
 * `layoutHero: 'default'` — 공식 레이아웃(`layout-official`, `/official/*` 이라 `app.vue` 가 고른다)이 이 값을 보고
 * 맨 위에 **큰 캐러셀**을 세운다. 다른 공식 화면은 같은 사진의 짧은 히어로다. 히어로는 페이지가 아니라 레이아웃이 그린다.
 */
definePageMeta({ 꽉찬폭: true, layoutHero: 'default' })

import { computed, ref, toValue } from 'vue'
import { storeToRefs } from 'pinia'
import { 본문영상s } from '~utils'
import { model자료s, type model자료 } from '~models/test2'
import { useMyAuthStore } from '~/stores/useMyAuthStore'
import { 기관, 채널s, 물감, 짧은날, 발췌, use홈글 } from '~/components/home/_홈글'

/**
 * 모임자료 칸은 게시글이 아니라 **챗봇도 참조하는 조직 문서**(`model자료`)다.
 * 링크는 `/resources/{id}` — 비공개(MEMBER) 자료는 거기서 막히므로 비회원에겐 목록에서부터 뺀다.
 *
 * 게시판·게시글(`use홈글`)과 자료는 서로를 안 보므로 **같이** 받는다(2026-09-15).
 * 차례로 받던 동안은 자료 요청이 게시글 응답을 기다렸고, 그 사이 클라이언트 이동은 앞 화면에 멈춰 있었다.
 */
const [{ 공지s, 소식s }] = await Promise.all([
  use홈글(),
  model자료s.getInstance().reads().catch(() => {
    /* 못 읽으면 칸이 빈 채로 선다 */
  })
])

const { isLoggedIn: is로그인 } = storeToRefs(useMyAuthStore())
const 받을자료s = computed(() =>
  [...toValue(model자료s.getInstance().list)]
    .filter(자료 => 자료.공개 || is로그인.value)
    .sort((a, b) => String(b.state?.createdAt ?? '').localeCompare(String(a.state?.createdAt ?? '')))
    .slice(0, 6)
)
/** 스레드 두 줄기 — 세로줄이 이어져야 해서 그리드 자동 배치가 아니라 앞뒤 반으로 가른다. 한 줄기는 3편. */
const 자료열s = computed(() => {
  const 반 = Math.ceil(받을자료s.value.length / 2)
  return [받을자료s.value.slice(0, 반), 받을자료s.value.slice(반)].filter(열 => 열.length)
})
/** 한국어 읽기 속도 분당 500자쯤 — 내려받기 크기 대신 「얼마나 걸리나」를 적는다. */
const 읽기분 = (자료: model자료) => Math.max(1, Math.round(자료.분량 / 500))
/** 넓은 화면은 두 줄기가 나란히 서니 줄기 순서보다 줄 순서로 시차를 준다. */
const 자료칸 = ref<HTMLElement | null>(null)
const { 등장: 자료등장 } = useRise(자료칸)

const 날짜 = (d: string | Date) => new Date(d).toISOString().slice(0, 10)

/** 게시글에 구분 칸이 없어 탭은 「공지」 한 칸이다. 구분이 생기면 `category` 만 바꾸면 된다. */
const 공지카드s = computed(() => 공지s.value.map(row => ({
  category: row.type ?? '공지',
  title: row.title,
  description: 발췌(row.body),
  date: 날짜(row.date),
  to: row.path
})))
const 공지구분s = computed(() => [...new Set(공지카드s.value.map(카드 => 카드.category))])

/**
 * 소식을 나눈다 — 최신이 대표, 나머지가 곁(몇 편 세울지는 `HomeNews` 의 `sideLimit`). 그림은 글의 대표 썸네일(본문 첫 사진), 없으면 물감.
 *
 * **사람 칸은 숨겼다** — 사람을 담은 데이터가 없어서 소식 글 하나를 빌려 쓰던 자리였다.
 * `people` 항목을 안 넘기면 `HomeNews` 가 칸째로 안 그린다. 되살리려면 실제 출처(역할 가진 회원 등)부터 정한다.
 */
const 소식카드s = computed(() => {
  const rows = 소식s.value
  return rows.map((row, i) => {
    const 공통 = { imageSrc: row.thumbnail ?? '', imageAlt: row.title, imageClass: 물감(i), to: row.path }
    return { kind: i === 0 ? 'featured' as const : 'side' as const, title: row.title, summary: 발췌(row.body), ...공통 }
  })
})

/**
 * 영상 칸 — 영상 게시판이 아니라 **공지·소식 글 중 본문에 영상이 든 최근 3개.**
 * 글마다 첫 영상 하나만 쓴다.
 */
const 영상클립s = computed(() => [...공지s.value, ...소식s.value]
  .map(row => ({ row, 영상: 본문영상s(row.body)[0] }))
  .filter(({ 영상 }) => 영상)
  .sort((a, b) => +new Date(b.row.date) - +new Date(a.row.date))
  .slice(0, 3)
  .map(({ row, 영상 }) => ({ title: row.title, videoId: 영상!.videoId, startSeconds: 영상!.startSeconds })))
</script>

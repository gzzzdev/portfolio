<!--
  대시보드 원점 — `/admin`(운영자 홈) 을 「무엇에 답하는 화면인가」부터 다시 세운 판(2026-09-11).

  ## 지금 판이 답하는 물음

  「DB 에 표가 몇 개, 행이 몇 개 있나」. 칸 하나가 표 하나라 **재고 조사**다. 그 물음에는
  정직하게 답한다(못 셈 ≠ 0 까지). 문제는 그 물음을 가진 사람이 **개발자**라는 것이다 —
  `menus` 32 · `design-templates` · `tables` 같은 설정 표의 개수는 운영자가 아침에 볼 이유가 없고,
  안 자란다. 분해 칩을 칩 → 판독 줄로 갈아도 별로였던 건 모양 탓이 아니라, 모든 표의 모든 축을
  늘어놓는 **자리 자체**가 답할 물음이 없어서였다.

  ## 관리자가 들어와서 묻는 것 — 차례대로

  1. **손볼 것이 있나.** 미납 신청 · 진행 중 심사 · 비공개 게시판 — 모델이 `대기` 로 선언한 칸.
     못 센 표도 여기다: 장애는 재고가 아니라 할 일이다.
  2. **무엇이 들어왔나.** 유입 표(`i누가 = '유입'`)의 최근 7일 — 가입 · 신청 · 글 · 댓글.
     개수가 아니라 **흐름**이다. 23 이라는 글 수보다 「이번 주 +12, 지난주보다 많다」가 운영 신호다.
  3. **회원은 어떤 사람들인가.** 분해는 이 도메인의 주인공 하나(회원)에게만 준다.
     모든 표에 축을 다 펴던 걸 걷고, 회원 축만 **막대 목록**으로 — 크기가 길이로 읽힌다.
  4. 나머지 재고는 곁다리 한 줄. 필요하면 지금 판(`표` 보기)으로 간다.

  ## 두 안 — 무엇을 본문으로 삼느냐가 다르다

  - **A 「오늘」** — 위에서 아래로 1→4 를 쌓는다. 한 번 훑고 나가는 화면. (Stripe·Shopify 첫 화면 결)
  - **B 「받은편지함」** — 손볼 것이 본문 전체, 숫자는 곁 열. 들어와서 **일을 치우는** 화면.
    손볼 것이 비면 들어온 것(최근 가입·글)이 본문을 받는다. (Linear 받은편지함 결)

  둘 다 회색조, 색은 신호에만(못 셈 = warning). 누르는 자리는 아이콘이 아니라 **줄·타일 전체**다.

  ## 견본 수치

  회원 분해(8명 · 역할 · 등급 · 나이대 · 성별)와 못 센 표 넷은 2026-09-11 실측이다.
  손볼 것의 개수, 7일 흐름, 받은편지함 미리보기 행은 **모양을 보려고 넣은 값**이다 —
  실코드로 옮길 때 흐름은 행의 `createdAt` 으로 센다(`model회원.가입일` 이 이미 그 값을 읽는다).
  (같은 날 실측: 미납 0 · 비공개 0 · 최근 7일 글·댓글·신청 0 — 실데이터로는 A 의 타일이 `+0` 이 된다.)
-->
<template>
  <div class="mx-auto flex w-full max-w-(--ui-container) flex-col gap-6 px-4 py-6">
    <div class="flex flex-row flex-wrap items-center gap-3">
      <div class="min-w-0">
        <h1 class="text-lg font-semibold text-highlighted">
          대시보드 원점
        </h1>
        <p class="text-xs text-dimmed">
          견본 수치 · 회원 분해와 못 센 표만 실측 ·
          <NuxtLink
            to="/admin"
            class="text-muted underline underline-offset-2 hover:text-default"
          >지금 판</NuxtLink>
        </p>
      </div>
      <div class="grow" />
      <div class="-mr-2 shrink-0">
        <Input선택기
          v-model="안"
          :items="안s"
          type="radio"
          is폭자동
          :search="false"
        />
      </div>
    </div>

    <!-- ══ A 「오늘」 ═══════════════════════════════════════════════════════ -->
    <div
      v-if="안 === 'A'"
      class="flex flex-col gap-8"
    >
      <!-- 1. 손볼 것 — 줄 전체가 손잡이. 숫자가 오른쪽 끝 한 열에 서야 훑어진다 -->
      <section class="flex flex-col gap-2">
        <div class="flex items-baseline gap-2">
          <h2 class="text-sm font-semibold text-highlighted">
            손볼 것
          </h2>
          <span class="text-xs tabular-nums text-dimmed">{{ 손볼것합 }}</span>
        </div>
        <div class="flex flex-col divide-y divide-default overflow-hidden rounded-lg ring-1 ring-default">
          <NuxtLink
            v-for="할 in 손볼것s"
            :key="할.key"
            :to="할.경로"
            class="flex flex-row items-baseline gap-3 px-4 py-3 transition-colors hover:bg-elevated"
          >
            <span class="text-sm text-highlighted">{{ 할.표 }}</span>
            <span class="text-sm text-muted">{{ 할.라벨 }}</span>
            <span class="grow" />
            <span class="text-lg tabular-nums text-highlighted">{{ 할.수량 }}</span>
            <span class="w-4 text-xs text-dimmed">{{ 할.단위 }}</span>
          </NuxtLink>
          <div class="flex flex-row flex-wrap items-baseline gap-x-3 gap-y-1 px-4 py-3">
            <span class="text-sm text-warning">못 센 표 {{ 못센표s.length }}</span>
            <span class="text-xs text-muted">개수를 못 받았다 — 0 이 아니다 ·</span>
            <span class="font-mono text-xs text-dimmed">{{ 못센표s.join(' · ') }}</span>
          </div>
        </div>
      </section>

      <!-- 2. 들어온 것 — 큰 숫자 + 14일 선. 선은 모양만 말한다, 축·눈금 없음 -->
      <section class="flex flex-col gap-2">
        <div class="flex items-baseline gap-2">
          <h2 class="text-sm font-semibold text-highlighted">
            들어온 것
          </h2>
          <span class="text-xs text-dimmed">최근 7일 · 선은 14일</span>
        </div>
        <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <NuxtLink
            v-for="흐 in 흐름s"
            :key="흐.key"
            :to="흐.경로"
            class="flex flex-col gap-2 rounded-lg px-4 py-3 ring-1 ring-default transition-colors hover:bg-elevated"
          >
            <span class="text-xs text-muted">{{ 흐.이름 }}</span>
            <span class="flex items-baseline gap-1.5">
              <span class="text-2xl tabular-nums text-highlighted">+{{ 흐.이번 }}</span>
              <span class="text-xs tabular-nums text-dimmed">전 7일 {{ 흐.지난 }}</span>
            </span>
            <svg
              viewBox="0 0 100 24"
              preserveAspectRatio="none"
              class="h-6 w-full text-muted"
              aria-hidden="true"
            >
              <line
                x1="50"
                x2="50"
                y1="0"
                y2="24"
                class="stroke-default"
                stroke-width="1"
                vector-effect="non-scaling-stroke"
              />
              <polyline
                :points="선(흐.일별)"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linejoin="round"
                vector-effect="non-scaling-stroke"
              />
            </svg>
            <span class="text-xs tabular-nums text-dimmed">누적 {{ 흐.누적 }}{{ 흐.단위 }}</span>
          </NuxtLink>
        </div>
      </section>

      <!-- 3. 회원 구성 — 축마다 막대 목록. 넓으면 옆으로, 좁으면 한 열 -->
      <section class="flex flex-col gap-2">
        <div class="flex items-baseline gap-2">
          <h2 class="text-sm font-semibold text-highlighted">
            회원 {{ 회원총계 }}명
          </h2>
          <span class="text-xs text-dimmed">막대는 {{ 회원총계 }}명 대비 · 역할은 겹친다</span>
        </div>
        <div class="grid grid-cols-1 gap-x-8 gap-y-5 rounded-lg px-4 py-4 ring-1 ring-default sm:grid-cols-2 lg:grid-cols-4">
          <L막대목록
            v-for="한축 in 회원축s"
            :key="한축.제목"
            :축="한축"
            :총계="회원총계"
          />
        </div>
      </section>

      <!-- 4. 재고 — 곁다리 한 줄 -->
      <NuxtLink
        to="/admin"
        class="flex flex-row flex-wrap items-baseline gap-x-4 gap-y-1 border-t border-default pt-3 text-xs text-dimmed hover:text-muted"
      >
        <span>나머지 표</span>
        <span
          v-for="묶 in 재고s"
          :key="묶.이름"
        >{{ 묶.이름 }} <span class="tabular-nums text-muted">{{ 묶.표 }}</span>표 · <span class="tabular-nums text-muted">{{ 묶.행 }}</span>행</span>
      </NuxtLink>
    </div>

    <!-- ══ B 「받은편지함」 ══════════════════════════════════════════════════ -->
    <div
      v-else
      class="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]"
    >
      <!-- 본문 — 손볼 것 묶음마다 앞 몇 줄을 미리 편다. 묶음 머리가 곧 그 목록으로 가는 손잡이 -->
      <div class="flex min-w-0 flex-col gap-5">
        <section
          v-for="할 in 손볼것s"
          :key="할.key"
          class="flex flex-col"
        >
          <NuxtLink
            :to="할.경로"
            class="flex flex-row items-baseline gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-elevated"
          >
            <span class="text-sm font-semibold text-highlighted">{{ 할.표 }} — {{ 할.라벨 }}</span>
            <span class="text-sm tabular-nums text-muted">{{ 할.수량 }}</span>
            <span class="grow" />
            <span class="text-xs text-dimmed">전부 보기</span>
          </NuxtLink>
          <div class="mt-1 flex flex-col divide-y divide-default overflow-hidden rounded-lg ring-1 ring-default">
            <NuxtLink
              v-for="줄 in 할.미리보기"
              :key="줄.이름"
              :to="할.경로"
              class="flex flex-row items-baseline gap-3 px-4 py-2.5 transition-colors hover:bg-elevated"
            >
              <span class="shrink-0 text-sm text-default">{{ 줄.이름 }}</span>
              <span class="min-w-0 truncate text-sm text-muted">{{ 줄.내용 }}</span>
              <span class="grow" />
              <span class="shrink-0 text-xs tabular-nums text-dimmed">{{ 줄.언제 }}</span>
            </NuxtLink>
          </div>
        </section>

        <div class="flex flex-row flex-wrap items-baseline gap-x-3 gap-y-1 rounded-lg px-4 py-3 ring-1 ring-warning/40">
          <span class="text-sm text-warning">못 센 표 {{ 못센표s.length }}</span>
          <span class="text-xs text-muted">supabase 에 표가 없다 —</span>
          <span class="font-mono text-xs text-dimmed">{{ 못센표s.join(' · ') }}</span>
        </div>
      </div>

      <!-- 곁 열 — 숫자만. 들어온 것은 한 줄씩, 회원 구성은 같은 막대 목록 -->
      <aside class="flex flex-col gap-5 lg:border-l lg:border-default lg:pl-6">
        <div class="flex flex-col">
          <div class="mb-1 text-xs text-dimmed">
            최근 7일
          </div>
          <NuxtLink
            v-for="흐 in 흐름s"
            :key="흐.key"
            :to="흐.경로"
            class="-mx-2 flex flex-row items-baseline gap-2 rounded-md px-2 py-1 transition-colors hover:bg-elevated"
          >
            <span class="text-sm text-muted">{{ 흐.이름 }}</span>
            <span class="grow" />
            <span class="text-sm tabular-nums text-highlighted">+{{ 흐.이번 }}</span>
            <span class="w-10 text-right text-xs tabular-nums text-dimmed">{{ 증감(흐) }}</span>
          </NuxtLink>
        </div>

        <div class="flex flex-col gap-4 border-t border-default pt-4">
          <div class="flex items-baseline gap-2">
            <span class="text-sm font-semibold text-highlighted">회원 {{ 회원총계 }}명</span>
          </div>
          <L막대목록
            v-for="한축 in 회원축s"
            :key="한축.제목"
            :축="한축"
            :총계="회원총계"
          />
        </div>

        <NuxtLink
          to="/admin"
          class="border-t border-default pt-3 text-xs text-dimmed hover:text-muted"
        >
          나머지 표 {{ 재고s.reduce((a, 묶) => a + 묶.표, 0) }}개 — 지금 판에서
        </NuxtLink>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineComponent, h, ref, type PropType } from 'vue'

definePageMeta({
  제목: '대시보드 원점'
})

type i안 = 'A' | 'B'
const 안s: { label: string, value: i안 }[] = [
  { label: 'A 오늘', value: 'A' },
  { label: 'B 받은편지함', value: 'B' }
]
/** `?안=B` 로 바로 연다 — 두 안을 링크로 나눠 줄 때 */
const 안 = ref<i안>(useRoute().query.안 === 'B' ? 'B' : 'A')

// ── 견본 ──────────────────────────────────────────────────────────────────

type i손볼것 = {
  key: string
  표: string
  라벨: string
  수량: number
  단위: string
  경로: string
  미리보기: { 이름: string, 내용: string, 언제: string }[]
}

/** 모델이 `대기: true` 로 선언한 칸 셋 — 신청 미납 · 등급심사 진행중 · 게시판 비공개. 개수는 견본. */
const 손볼것s: i손볼것[] = [
  {
    key: '신청-미납', 표: '신청', 라벨: '미납', 수량: 3, 단위: '건', 경로: '/applications',
    미리보기: [
      { 이름: '박서준', 내용: '9월 정기 수업 · 30,000원', 언제: '2일 전' },
      { 이름: '이하은', 내용: '가을 행사 참가비 · 15,000원', 언제: '3일 전' },
      { 이름: '최민재', 내용: '9월 정기 수업 · 30,000원', 언제: '5일 전' }
    ]
  },
  {
    key: '심사-진행중', 표: '등급 심사', 라벨: '진행중', 수량: 2, 단위: '건', 경로: '/admin/gradings',
    미리보기: [
      { 이름: '정유나', 내용: '입문자 → 중급자 · 요건 3/4', 언제: '오늘' },
      { 이름: '한도윤', 내용: '입문자 → 중급자 · 요건 2/4', 언제: '4일 전' }
    ]
  },
  {
    key: '게시판-비공개', 표: '게시판', 라벨: '비공개', 수량: 1, 단위: '개', 경로: '/admin/boards',
    미리보기: [
      { 이름: '자료실', 내용: '열기 전 — 글 0', 언제: '6일 전' }
    ]
  }
]
const 손볼것합 = 손볼것s.reduce((a, 할) => a + 할.수량, 0)

/** 실측(2026-09-11) — supabase 에 표가 없어 개수 판이 `null` 을 싣는 넷 */
const 못센표s = ['gradings', 'basics', 'member-gradings', 'per-gradings']

type i흐름 = { key: string, 이름: string, 경로: string, 단위: string, 누적: number, 일별: number[], 이번: number, 지난: number }

/** 유입 표 넷. `일별` 은 14일(앞 7 = 지난 주, 뒤 7 = 이번 주). 회원 누적 8 만 실측. */
const 흐름s: i흐름[] = [
  { key: 'members', 이름: '가입', 경로: '/admin/members', 단위: '명', 누적: 8, 일별: [0, 0, 0, 0, 0, 0, 0, 1, 0, 2, 1, 0, 3, 1] },
  { key: 'applications', 이름: '신청', 경로: '/applications', 단위: '건', 누적: 11, 일별: [1, 0, 2, 1, 0, 1, 1, 0, 1, 1, 2, 0, 1, 0] },
  { key: 'member-posts', 이름: '글', 경로: '/admin/boards', 단위: '개', 누적: 23, 일별: [1, 2, 0, 1, 1, 0, 2, 3, 1, 2, 0, 4, 1, 1] },
  { key: 'member-comments', 이름: '댓글', 경로: '/admin/boards', 단위: '개', 누적: 28, 일별: [2, 1, 1, 0, 3, 1, 0, 2, 4, 1, 3, 2, 0, 3] }
].map(흐 => ({
  ...흐,
  지난: 흐.일별.slice(0, 7).reduce((a, n) => a + n, 0),
  이번: 흐.일별.slice(7).reduce((a, n) => a + n, 0)
}))

const 증감 = (흐: i흐름) => {
  const d = 흐.이번 - 흐.지난
  return d === 0 ? '±0' : d > 0 ? `↑${d}` : `↓${-d}`
}

/** 14 점을 0..100 × 0..24 에 편다. 위아래 2 씩 비워 선이 잘리지 않게. */
const 선 = (일별: number[]) => {
  const 최대 = Math.max(1, ...일별)
  return 일별
    .map((n, i) => `${(i / (일별.length - 1)) * 100},${22 - (n / 최대) * 20}`)
    .join(' ')
}

type i축 = { 제목: string, 줄s: { 라벨: string, 수량: number }[], 그밖: number }

/** 실측(2026-09-11 스크린샷). 가입일 축은 들어온 것이 맡으므로 여기서 뺀다. */
const 회원총계 = 8
const 회원축s: i축[] = [
  { 제목: '역할', 줄s: [{ 라벨: '준회원', 수량: 4 }, { 라벨: '운영자', 수량: 2 }, { 라벨: '교수자', 수량: 2 }, { 라벨: '학습자', 수량: 1 }], 그밖: 0 },
  { 제목: '등급', 줄s: [{ 라벨: '입문자', 수량: 7 }], 그밖: 1 },
  { 제목: '나이대', 줄s: [{ 라벨: '20대', 수량: 5 }, { 라벨: '30대', 수량: 2 }, { 라벨: '40대', 수량: 1 }], 그밖: 0 },
  { 제목: '성별', 줄s: [{ 라벨: '남자', 수량: 5 }, { 라벨: '여자', 수량: 3 }], 그밖: 0 }
]

/** 재고 — `i누가` 묶음별 표 수 · 행 합. 견본. */
const 재고s = [
  { 이름: '운영', 표: 14, 행: 187 },
  { 이름: '설정', 표: 12, 행: 96 }
]

// ── 막대 목록 ────────────────────────────────────────────────────────────
// 이름 앞 `L` — 템플릿 파서가 태그 이름을 ASCII 글자로만 시작하게 받는다(`<막대목록>` 은 글자로 새어 나온다).

/**
 * 축 하나 = 라벨 · 막대 · 숫자 세 열. 막대 길이는 **총계 대비**다 — 축 안 최댓값 대비로 두면
 * 「입문자 7/8」과 「남자 5/8」이 둘 다 꽉 차서 크기가 거짓말을 한다. 역할처럼 겹치는 축도
 * 총계 대비라야 합이 넘어도 각 막대가 참이다. 「그 밖」은 끝에 흐리게.
 */
const L막대목록 = defineComponent({
  props: {
    축: { type: Object as PropType<i축>, required: true },
    총계: { type: Number, required: true }
  },
  setup(props) {
    const 줄 = (라벨: string, 수량: number, is그밖: boolean) =>
      h('div', { class: 'grid grid-cols-[3.5rem_minmax(0,1fr)_1.5rem] items-center gap-2' }, [
        h('span', { class: ['truncate text-xs', is그밖 ? 'text-dimmed' : 'text-muted'] }, 라벨),
        h('span', { class: 'h-1.5 overflow-hidden rounded-full bg-elevated' }, [
          h('span', {
            class: ['block h-full rounded-full', is그밖 ? 'bg-inverted/20' : 'bg-inverted/60'],
            style: { width: `${Math.min(100, (수량 / Math.max(1, props.총계)) * 100)}%` }
          })
        ]),
        h('span', { class: ['text-right text-xs tabular-nums', is그밖 ? 'text-dimmed' : 'text-highlighted'] }, String(수량))
      ])

    return () => h('div', { class: 'flex flex-col gap-1.5' }, [
      h('div', { class: 'text-xs text-dimmed' }, props.축.제목),
      ...props.축.줄s.filter(x => x.수량 > 0).map(x => 줄(x.라벨, x.수량, false)),
      ...(props.축.그밖 > 0 ? [줄('그 밖', props.축.그밖, true)] : [])
    ])
  }
})
</script>

<!--
  **로그인 모달을 어떤 모양으로 세울까**의 판. 기록은 `~/utils/decisions` 의 `로그인-창`.

  ## 이 판이 답하는 물음

  머리글의 「로그인」이 드롭다운 대신 `m로그인모달` 을 연다(2026-09-14). 지금 모달은 회색 버튼 셋을
  쌓은 **기능 목록**이라, 처음 온 사람에게 반가운 문 한 장으로는 안 읽힌다.
  물음은 — **창 한 장을 산뜻하게, 그러면서도 무엇을 누르면 되는지 한눈에 보이게 하려면.**

  ## 판 읽는 법

  - 안마다 **카드 전체**(머리·닫기·바닥까지)를 스스로 그린다. 요즘 로그인 창은 머리 모양이 곧
    인상이라, `UModal` 의 기본 머리를 빌리면 안끼리 차이가 안 난다.
  - 소셜 목록은 **표본**이다(아래 `소셜s`) — 밖에 내보이는 판이라 진짜 로그인을 안 부른다. 눌러도 아무 일 없다.
  - 개발 계정 여닫이는 판에서 뺐다 — 운영 모양만 본다(실코드는 `m개발계정`).
  - 「상황」 손잡이 — `머리글` 은 그냥 들어오는 길, `신청 중` 은 신청 상세에서 막혀 들어오는 길.
  - 브랜드 색(카카오 노랑·네이버 초록)과 파스텔 배경은 **테마 축을 안 탄다.** 파스텔은 `--ui-bg` 에
    섞고, 다크에서는 섞는 양을 줄였다(`--파스텔`). 고르면 옮길 때 예외로 이름 붙일 것.
  - 「진짜 모달로 열기」가 같은 카드를 `UModal` 에 담아 띄운다. 고른 A 의 실코드는 `m로그인모달`.
-->
<template>
  <div class="mx-auto w-full max-w-(--ui-container) px-4 py-8">
    <header class="mb-5">
      <h1 class="text-2xl font-semibold text-highlighted">
        로그인 모달 다섯 안
      </h1>
      <p class="mt-1 text-sm text-muted">
        같은 목록(소셜 셋) · 창 한 장을 산뜻하게 · A 로 골랐다
      </p>
    </header>

    <div class="mb-4 flex flex-wrap items-center gap-2">
      <mButton
        v-for="안 in 안s"
        :key="안.키"
        size="sm"
        역할="조용"
        :켜짐="안키 === 안.키"
        :label="안.이름"
        @click="안키 = 안.키"
      />
    </div>

    <div class="mb-4 flex flex-wrap items-center gap-x-5 gap-y-2">
      <div
        v-for="손잡이 in 손잡이s"
        :key="손잡이.이름"
        class="flex items-center gap-2"
      >
        <span class="text-xs text-dimmed">{{ 손잡이.이름 }}</span>
        <div class="flex overflow-hidden rounded-md border border-accented">
          <button
            v-for="값 in 손잡이.값s"
            :key="값"
            type="button"
            class="px-2.5 py-1 text-xs transition-colors"
            :class="손잡이.현재.value === 값 ? 'bg-inverted font-medium text-inverted' : 'text-muted hover:bg-elevated'"
            @click="손잡이.현재.value = 값"
          >
            {{ 값 }}
          </button>
        </div>
      </div>
      <div class="grow" />
      <mButton
        size="sm"
        icon="i-lucide-square-arrow-out-up-right"
        label="진짜 모달로 열기"
        @click="is모달 = true"
      />
    </div>

    <div class="mb-5 rounded-lg border border-default bg-muted px-4 py-3 text-sm leading-relaxed">
      <p><span class="text-dimmed">왜 ·</span> {{ 판.왜 }}</p>
      <p class="mt-1">
        <span class="text-dimmed">대가 ·</span> {{ 판.대가 }}
      </p>
    </div>

    <!-- ── 카드 한 벌 — 판 위의 그림과 진짜 모달이 같이 쓴다 ─────────────── -->
    <Define카드>
      <!-- ── A · 구름 ─────────────────────────────────────────────── -->
      <div
        v-if="안키 === '구름'"
        class="relative w-full max-w-[400px] overflow-hidden rounded-[28px] bg-default ring-1 ring-default m-층-모달 [--파스텔:1] dark:[--파스텔:0.3]"
      >
        <div
          class="h-36"
          :style="{ background: 구름칠 }"
        />
        <button
          type="button"
          class="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-default/70 text-muted backdrop-blur transition-colors hover:text-highlighted"
          aria-label="닫기"
          @click="닫기"
        >
          <UIcon
            name="i-lucide-x"
            class="size-4"
          />
        </button>
        <div class="-mt-16 flex flex-col items-center px-7 pb-6 text-center">
          <span class="flex size-[72px] items-center justify-center rounded-[22px] bg-inverted text-[28px] font-bold text-inverted m-층-떠있음">
            마
          </span>
          <h2 class="mt-5 text-[22px] font-bold tracking-tight text-highlighted">
            {{ 글.제목 }}
          </h2>
          <p class="mt-1.5 text-sm text-muted">
            {{ 글.설명 }}
          </p>
          <div class="mt-7 w-full space-y-2.5">
            <button
              v-for="방법 in 소셜s"
              :key="방법.label"
              type="button"
              class="relative flex h-12 w-full items-center justify-center rounded-full border border-default bg-default text-[15px] font-medium text-highlighted transition-all hover:border-accented hover:bg-elevated active:scale-[.99] disabled:opacity-60"
              @click="방법.onSelect"
            >
              <m브랜드마크
                :이름="방법.마크!"
                타일
                원
                class="absolute left-2 size-8"
              />
              {{ 방법.label }}로 계속하기
            </button>
          </div>
          <p class="mt-5 text-xs text-dimmed">
            처음이면 이 버튼으로 바로 가입돼요
          </p>
        </div>
      </div>

      <!-- ── B · 브랜드 알약 ─────────────────────────────────────── -->
      <div
        v-else-if="안키 === '알약'"
        class="w-full max-w-[400px] rounded-[28px] bg-default p-7 ring-1 ring-default m-층-모달"
      >
        <div class="flex items-center justify-between">
          <span class="flex size-10 items-center justify-center rounded-xl bg-inverted text-base font-bold text-inverted">마</span>
          <button
            type="button"
            class="flex size-9 items-center justify-center rounded-full bg-elevated text-muted transition-colors hover:text-highlighted"
            aria-label="닫기"
            @click="닫기"
          >
            <UIcon
              name="i-lucide-x"
              class="size-4"
            />
          </button>
        </div>
        <h2 class="mt-7 whitespace-pre-line text-[28px] font-bold leading-[1.2] tracking-tight text-highlighted">
          {{ 글.큰제목 }}
        </h2>
        <p class="mt-2.5 text-[15px] text-muted">
          {{ 글.설명 }}
        </p>
        <div class="mt-8 space-y-2.5">
          <button
            v-for="방법 in 한국순s"
            :key="방법.label"
            type="button"
            class="relative flex h-[52px] w-full items-center justify-center rounded-full text-[15px] font-semibold transition-all hover:brightness-[.97] active:scale-[.99] disabled:opacity-60"
            :class="브랜드칠[방법.마크!]"
            @click="방법.onSelect"
          >
            <m브랜드마크
              :이름="방법.마크!"
              class="absolute left-5 size-5"
            />
            {{ 방법.label }}로 계속하기
          </button>
        </div>
      </div>

      <!-- ── C · 반반 ─────────────────────────────────────────────── -->
      <div
        v-else-if="안키 === '반반'"
        class="grid w-full max-w-[760px] overflow-hidden rounded-[28px] bg-default ring-1 ring-default m-층-모달 sm:grid-cols-[1fr_1.05fr] [--파스텔:1] dark:[--파스텔:0.3]"
      >
        <div
          class="relative hidden flex-col justify-between gap-10 p-7 sm:flex"
          :style="{ background: 반반칠 }"
        >
          <span class="text-sm font-bold tracking-tight text-highlighted">마장터</span>
          <div class="space-y-2.5">
            <div
              v-for="(이득, i) in 이득s"
              :key="이득.글"
              class="flex items-center gap-3 rounded-2xl bg-default/70 p-3 ring-1 ring-default/50 backdrop-blur"
              :class="i === 1 ? 'ml-6' : 'mr-6'"
            >
              <span
                class="flex size-9 shrink-0 items-center justify-center rounded-xl"
                :class="이득.칠"
              >
                <UIcon
                  :name="이득.아이콘"
                  class="size-[18px]"
                />
              </span>
              <span class="text-sm font-medium text-highlighted">{{ 이득.글 }}</span>
            </div>
          </div>
        </div>
        <div class="relative flex flex-col justify-center p-7 sm:p-9">
          <button
            type="button"
            class="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full text-dimmed transition-colors hover:bg-elevated hover:text-highlighted"
            aria-label="닫기"
            @click="닫기"
          >
            <UIcon
              name="i-lucide-x"
              class="size-4"
            />
          </button>
          <h2 class="text-2xl font-bold tracking-tight text-highlighted">
            {{ 글.제목 }}
          </h2>
          <p class="mt-1.5 text-sm text-muted">
            {{ 글.설명 }}
          </p>
          <div class="mt-7 space-y-2.5">
            <button
              v-for="방법 in 소셜s"
              :key="방법.label"
              type="button"
              class="flex h-12 w-full items-center gap-3 rounded-2xl border border-default px-3 text-[15px] font-medium text-highlighted transition-all hover:border-accented hover:bg-elevated active:scale-[.99] disabled:opacity-60"
              @click="방법.onSelect"
            >
              <m브랜드마크
                :이름="방법.마크!"
                타일
                class="size-7"
              />
              {{ 방법.label }}로 계속하기
              <UIcon
                name="i-lucide-arrow-right"
                class="ml-auto size-4 text-dimmed"
              />
            </button>
          </div>
        </div>
      </div>

      <!-- ── D · 타일 ─────────────────────────────────────────────── -->
      <div
        v-else-if="안키 === '타일'"
        class="relative w-full max-w-[420px] rounded-[28px] bg-default px-6 pb-6 pt-9 text-center ring-1 ring-default m-층-모달"
      >
        <button
          type="button"
          class="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full text-dimmed transition-colors hover:bg-elevated hover:text-highlighted"
          aria-label="닫기"
          @click="닫기"
        >
          <UIcon
            name="i-lucide-x"
            class="size-4"
          />
        </button>
        <span class="inline-flex items-center gap-1.5 rounded-full bg-elevated px-3 py-1 text-xs font-medium text-muted">
          <UIcon
            name="i-lucide-sparkles"
            class="size-3.5"
          />
          가입도 같은 버튼으로
        </span>
        <h2 class="mt-4 text-[22px] font-bold tracking-tight text-highlighted">
          {{ 글.제목 }}
        </h2>
        <p class="mt-1.5 text-sm text-muted">
          어떤 계정으로 들어올까요?
        </p>
        <div class="mt-7 grid grid-cols-3 gap-2.5">
          <button
            v-for="방법 in 한국순s"
            :key="방법.label"
            type="button"
            class="group flex aspect-[4/5] flex-col items-center justify-center gap-3 rounded-2xl transition-all hover:-translate-y-0.5 active:scale-[.98] disabled:opacity-60"
            :class="타일바탕[방법.마크!]"
            @click="방법.onSelect"
          >
            <m브랜드마크
              :이름="방법.마크!"
              타일
              class="size-12 transition-transform group-hover:scale-105"
            />
            <span class="text-sm font-semibold text-highlighted">{{ 방법.label }}</span>
          </button>
        </div>
      </div>

      <!-- ── E · 지난번 ───────────────────────────────────────────── -->
      <div
        v-else-if="안키 === '지난번'"
        class="relative w-full max-w-[400px] rounded-[28px] bg-default px-7 pb-6 pt-8 ring-1 ring-default m-층-모달"
      >
        <button
          type="button"
          class="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full text-dimmed transition-colors hover:bg-elevated hover:text-highlighted"
          aria-label="닫기"
          @click="닫기"
        >
          <UIcon
            name="i-lucide-x"
            class="size-4"
          />
        </button>
        <div class="text-center">
          <h2 class="text-[22px] font-bold tracking-tight text-highlighted">
            {{ 최근방법 ? '다시 만나 반가워요' : 글.제목 }}
          </h2>
          <p class="mt-1.5 text-sm text-muted">
            {{ 최근방법 ? '지난번 쓰던 계정으로 이어서 들어오세요.' : 글.설명 }}
          </p>
        </div>

        <template v-if="최근방법">
          <div class="relative mt-11">
            <span class="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-inverted px-2.5 py-1 text-[11px] font-medium text-inverted after:absolute after:left-1/2 after:top-full after:-translate-x-1/2 after:border-4 after:border-transparent after:border-t-(--ui-bg-inverted)">
              지난번에 이걸로 들어왔어요
            </span>
            <button
              type="button"
              class="relative flex h-14 w-full items-center justify-center rounded-full text-base font-semibold transition-all hover:brightness-[.97] active:scale-[.99] disabled:opacity-60"
              :class="브랜드칠[최근방법.마크!]"
              @click="최근방법.onSelect"
            >
              <m브랜드마크
                :이름="최근방법.마크!"
                class="absolute left-6 size-5"
              />
              {{ 최근방법.label }}로 계속하기
            </button>
          </div>
          <div class="mt-7 flex items-center gap-3">
            <span class="h-px flex-1 bg-(--ui-border)" />
            <span class="text-xs text-dimmed">다른 계정으로</span>
            <span class="h-px flex-1 bg-(--ui-border)" />
          </div>
          <div class="mt-4 flex justify-center gap-3">
            <button
              v-for="방법 in 소셜s.filter(방법 => 방법 !== 최근방법)"
              :key="방법.label"
              type="button"
              class="rounded-full transition-transform hover:-translate-y-0.5 disabled:opacity-60"
              :aria-label="`${방법.label}로 계속하기`"
              :title="방법.label"
              @click="방법.onSelect"
            >
              <m브랜드마크
                :이름="방법.마크!"
                타일
                원
                class="size-12"
              />
            </button>
          </div>
        </template>
        <div
          v-else
          class="mt-8 flex justify-center gap-5"
        >
          <button
            v-for="방법 in 한국순s"
            :key="방법.label"
            type="button"
            class="group flex flex-col items-center gap-2 disabled:opacity-60"
            @click="방법.onSelect"
          >
            <m브랜드마크
              :이름="방법.마크!"
              타일
              원
              class="size-14 transition-transform group-hover:-translate-y-0.5"
            />
            <span class="text-xs font-medium text-muted">{{ 방법.label }}</span>
          </button>
        </div>
      </div>
    </Define카드>

    <!-- ── 판 위의 창 (그림) ─────────────────────────────────────── -->
    <div
      data-판
      class="flex min-h-[40rem] items-center justify-center rounded-xl border border-default p-4 sm:p-10 [--파스텔:1] dark:[--파스텔:0.3]"
      :style="{ background: 판바탕 }"
    >
      <Reuse카드 />
    </div>

    <!-- 틀은 가장 넓은 안(C)만큼 열어 두고 카드가 자기 max-w 로 줄어든다 — `w-auto` 면 카드가 글자폭으로 쪼그라든다(실측) -->
    <UModal
      v-model:open="is모달"
      :title="글.제목"
      :description="글.설명"
      :ui="{ content: 'w-[calc(100vw-2rem)] max-w-[760px] sm:max-w-[760px] overflow-visible bg-transparent shadow-none ring-0 flex flex-col items-center' }"
    >
      <template #content>
        <Reuse카드 />
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { createReusableTemplate } from '@vueuse/core'
import type { i브랜드, i로그인방법 } from '~/composables/use로그인'

definePageMeta({
  제목: '로그인 창 · 다섯 안'
})

const [Define카드, Reuse카드] = createReusableTemplate()

/** 표본 — 차례는 실코드 `use로그인` 과 같다. 누르면 아무 일 없다. */
const 소셜s = computed<i로그인방법[]>(() => (['구글', '네이버', '카카오'] as const)
  .map(마크 => ({ label: 마크, 마크, onSelect: () => {} })))

type i안키 = '구름' | '알약' | '반반' | '타일' | '지난번'

const 안s: { 키: i안키, 이름: string, 왜: string, 대가: string }[] = [
  {
    키: '구름',
    이름: 'A · 구름',
    왜: '파스텔 구름 머리 위에 앱 마크가 걸터앉는다 — 문 앞 인사가 먼저인 창. 버튼은 흰 알약에 원 타일 마크라 브랜드 색이 창을 안 잡아먹는다.',
    대가: '머리 그림 높이만큼 창이 길다. 앱 마크가 「마」 글자 자리표시라, 진짜 로고가 없으면 인상이 약하다.'
  },
  {
    키: '알약',
    이름: 'B · 브랜드 알약',
    왜: '큰 두 줄 제목을 왼쪽에 세우고, 한국에서 가장 많이 누르는 차례(카카오 → 네이버 → 구글)로 브랜드 색 알약을 깐다. 무엇을 누를지 가장 빨리 읽힌다.',
    대가: '창에서 가장 센 색이 우리 색이 아니라 카카오 노랑이다. 테마를 바꿔도 이 창만 그대로다.'
  },
  {
    키: '반반',
    이름: 'C · 반반',
    왜: '왼쪽 파스텔 판에 "로그인하면 되는 것"을 떠 있는 카드로 띄운다. 신청 중에 막혀 들어온 사람에게 왜 로그인하는지 곁에서 말한다.',
    대가: '폭이 두 배라 머리글에서 가볍게 열기엔 무겁다. 좁은 화면에선 왼쪽 판을 걷는다 — 그러면 설명이 사라진다.'
  },
  {
    키: '타일',
    이름: 'D · 타일',
    왜: '세 계정을 브랜드 빛깔 타일 셋으로 — 고르는 창이라는 게 모양으로 읽힌다. 「가입도 같은 버튼으로」 칩이 가입/로그인 망설임을 먼저 푼다.',
    대가: '타일이 커서 누를 곳은 넉넉하지만 "로 계속하기" 같은 동사가 빠진다. 소셜이 넷·다섯으로 늘면 격자가 다시 짜여야 한다.'
  },
  {
    키: '지난번',
    이름: 'E · 지난번',
    왜: '셋 중 무엇으로 가입했는지 사람들은 잊는다 — 다른 소셜로 들어가 계정이 둘이 되는 게 제일 흔한 사고다. 지난번 방법 하나를 말풍선과 함께 크게.',
    대가: '"지난번"을 브라우저에 적어 둬야 한다(localStorage). 처음이거나 다른 기기면 원 셋으로 돌아간다 — 「지난번」 손잡이로 볼 것.'
  }
]

const 안키 = ref<i안키>('구름')
const 판 = computed(() => 안s.find(안 => 안.키 === 안키.value)!)

const 상황 = ref<'머리글' | '신청 중'>('머리글')
const 최근값 = ref<'카카오' | '없음'>('카카오')

const 손잡이s = computed(() => [
  { 이름: '상황', 값s: ['머리글', '신청 중'], 현재: 상황 as Ref<string> },
  ...(안키.value === '지난번' ? [{ 이름: '지난번', 값s: ['카카오', '없음'], 현재: 최근값 as Ref<string> }] : [])
])

const 글 = computed(() => 상황.value === '신청 중'
  ? { 제목: '로그인하고 신청하기', 큰제목: '로그인하고\n신청을 이어가요', 설명: '어느 기기에서든 내 신청을 이어 볼 수 있어요.' }
  : { 제목: '마장터에 오신 걸 반겨요', 큰제목: '간편하게\n시작해요', 설명: '쓰던 계정으로 바로 들어오세요.' })

const is모달 = ref(false)
/** 판 위 그림에서는 닫을 게 없다 — 진짜 모달일 때만 뜻이 있다. */
const 닫기 = () => {
  is모달.value = false
}

/** 한국에서 누르는 차례. 목록(`use로그인`)의 차례는 안 건드리고 이 판에서만 다시 줄 세운다. */
const 한국순s = computed(() => {
  const 차례: i브랜드[] = ['카카오', '네이버', '구글']
  return [...소셜s.value].sort((a, b) => 차례.indexOf(a.마크!) - 차례.indexOf(b.마크!))
})

const 최근방법 = computed<i로그인방법 | undefined>(() =>
  최근값.value === '없음' ? undefined : 소셜s.value.find(방법 => 방법.마크 === 최근값.value))

/**
 * 각 사 가이드 색. 테마 축 밖이다(머리말).
 * 구글만 테마를 따른다 — 가이드의 `#747775` 테두리는 노랑·초록 알약 곁에서 혼자 굵은 선으로 읽혀서,
 * 흰 바탕 + 테마 테두리로 무게를 맞췄다(구글 가이드가 허용하는 건 로고 쪽이고 테두리 값은 느슨하다).
 */
const 브랜드칠: Record<i브랜드, string> = {
  구글: 'bg-default text-highlighted ring-1 ring-inset ring-(--ui-border-accented)',
  네이버: 'bg-[#03C75A] text-white',
  카카오: 'bg-[#FEE500] text-black/85',
  토스: 'bg-[#0064FF] text-white'
}

/**
 * 타일 바탕 — 브랜드 색을 옅게. 글자는 테마 색이라 다크에서도 읽힌다.
 * 다크는 따로 더 옅게 — 노랑 25% 는 검은 바탕에서 올리브색이 된다(실측).
 */
const 타일바탕: Record<i브랜드, string> = {
  구글: 'bg-black/[.04] hover:bg-black/[.07] dark:bg-white/[.06] dark:hover:bg-white/10',
  네이버: 'bg-[#03C75A]/12 hover:bg-[#03C75A]/20 dark:bg-[#03C75A]/10 dark:hover:bg-[#03C75A]/16',
  카카오: 'bg-[#FEE500]/25 hover:bg-[#FEE500]/35 dark:bg-[#FEE500]/8 dark:hover:bg-[#FEE500]/14',
  토스: 'bg-[#0064FF]/12 hover:bg-[#0064FF]/20 dark:bg-[#0064FF]/15 dark:hover:bg-[#0064FF]/22'
}

/**
 * 파스텔은 `--ui-bg` 에 섞는다. 섞는 양에 `--파스텔`(라이트 1 · 다크 0.3, 카드 뿌리에 적음)을 곱한다 —
 * 다크 바탕에 파스텔을 라이트만큼 섞으면 흙빛 회색이 된다(실측).
 */
const 파스텔 = (색: string, 양 = 55) => `color-mix(in oklab, ${색} calc(${양}% * var(--파스텔, 1)), var(--ui-bg))`

const 구름칠 = [
  /** 끝을 100% 가 아니라 90% 에 둔다 — 1배율 화면에서 머리 밑단이 반 픽셀 걸쳐 가는 선이 보였다(실측). */
  'linear-gradient(to bottom, transparent 45%, var(--ui-bg) 90%)',
  `radial-gradient(60% 90% at 15% 10%, ${파스텔('#A5B4FC', 80)}, transparent 70%)`,
  `radial-gradient(55% 80% at 85% 0%, ${파스텔('#FBCFE8', 85)}, transparent 70%)`,
  `radial-gradient(70% 100% at 55% 100%, ${파스텔('#BAE6FD', 80)}, transparent 70%)`,
  파스텔('#E0E7FF', 60)
].join(', ')

const 반반칠 = [
  `radial-gradient(80% 60% at 0% 0%, ${파스텔('#C7D2FE', 85)}, transparent 70%)`,
  `radial-gradient(70% 60% at 100% 100%, ${파스텔('#FDE68A', 70)}, transparent 70%)`,
  `radial-gradient(60% 50% at 100% 20%, ${파스텔('#FBCFE8', 70)}, transparent 70%)`,
  파스텔('#EEF2FF', 70)
].join(', ')

/** 판 바탕 — 뒤에 흐린 화면이 깔린 느낌만. */
const 판바탕 = `radial-gradient(40% 50% at 20% 30%, ${파스텔('#C7D2FE', 30)}, transparent), radial-gradient(40% 50% at 80% 70%, ${파스텔('#FBCFE8', 30)}, transparent), var(--ui-bg-muted)`

const 이득s = [
  { 아이콘: 'i-lucide-monitor-smartphone', 글: '어느 기기에서든 내 신청 보기', 칠: 'bg-[#C7D2FE] text-[#3730A3]' },
  { 아이콘: 'i-lucide-message-circle', 글: '게시판에 글·댓글 남기기', 칠: 'bg-[#FBCFE8] text-[#9D174D]' },
  { 아이콘: 'i-lucide-download', 글: '자료실 파일 받기', 칠: 'bg-[#FDE68A] text-[#92400E]' }
]
</script>

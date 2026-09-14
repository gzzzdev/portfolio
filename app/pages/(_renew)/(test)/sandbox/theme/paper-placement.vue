<!--
  **종이를 어디에 까나**의 비교판 (2026-09-14).

  ## 질문

  `do-enrolls/[id]` 에서 바깥(바닥)과 본문이 안 갈린다. 본문이 바닥(`bg-page`)에 바로 앉고
  레일만 종이(`bg-default`)라서다. 라이트 바닥·종이는 L 0.97 / 1 이라 선·그림자 없이는 경계가 없다.
  고칠 자리가 **레이아웃(`lMain` 이 한 장 깐다)** 이냐 **페이지(규칙 한 줄)** 냐.

  | 안 | 어디서 까나 | 뭐가 종이인가 |
  |---|---|---|
  | 지금 | 페이지마다 제각각 | 레일·카드만. 글·폼은 바닥 |
  | lMain 한 장 | 레이아웃 | 화면 전체. 원래 종이였던 레일·카드는 종이 위 종이 |
  | 규칙 | 페이지 | **글·폼·표는 종이, 길잡이(뒤로가기·목록 제목줄·필터)는 바닥** |
  | 세로선 | 레이아웃 | 지금과 같다. 칸 좌우 가장자리에 선만 긋는다 |

  lMain 한 장을 보고 나온 안이다 — 종이가 칸보다 넓어서 좌우에 흰 여백이 남고, 경계가 칸 가장자리가 아니라
  엉뚱한 곳에 섰다. 문제는 「종이가 없다」가 아니라 **「칸 가장자리가 안 보인다」** 였다.

  ## 판 읽는 법

  - **실제 크기로 한 안씩 본다.** 셋을 나란히 줄이면 폭이 좁아 레일이 밑으로 떨어지고, 이 질문이
    폭 넓은 화면에서 생긴 것이라 답이 달라진다.
  - 화면 셋은 페이지 모양 셋의 대표다 — 읽기+레일(신청 상세) · 읽기 한 칸(글 상세) · 카드 목록(신청 목록).
    카드 목록은 **대조군**이다. 카드가 이미 종이라 규칙 안에서는 지금과 같고, lMain 한 장에서만 달라진다.
  - 관리자 작업대(`view목록5`·`view상세5` 전체 높이)는 판에 없다. 패널이 이미 종이라 카드 목록과 같은 결과다.
  - 표본은 이 파일 안의 고정값이다. 모델을 안 읽는다.
-->
<template>
  <div class="mx-auto w-full max-w-(--ui-container) px-4 py-6">
    <!-- 판의 손잡이 줄. 이것도 길잡이라 바닥에 둔다 -->
    <div class="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold text-highlighted">
          종이 까는 자리
        </h1>
        <p class="mt-1 text-sm text-muted">
          {{ 안s.find(x => x.value === 안)?.설명 }}
        </p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <mTabs
          v-model="화면"
          :items="화면s"
          type="segment"
          size="sm"
        />
        <mTabs
          v-model="안"
          :items="안s"
          type="segment"
          size="sm"
        />
      </div>
    </div>

    <!--
      lMain 한 장 — 레이아웃이 까는 것처럼 화면 전체를 한 번 감싼다. 안의 것은 **손대지 않는다**
      (레이아웃은 페이지 안을 모른다). 그래서 원래 종이였던 것이 종이 위 종이로 남는다.
    -->
    <!--
      세로선 — 칸 가장자리에 선만 긋는다. 층이 아니라서 안의 종이(레일·카드)는 그대로고 sticky 도 산다.
      선이 중간에 끊기면 그게 또 경계처럼 읽혀서 최소 한 화면 높이를 준다. 폰 폭은 여백이 없어 선을 안 긋는다.
    -->
    <component
      :is="안 === 'lMain' ? mBox종이 : 'div'"
      :class="{
        '!p-4 sm:!p-6': 안 === 'lMain',
        'min-h-[80dvh] sm:border-x sm:border-default sm:bg-default sm:px-6 sm:py-6': 안 === '세로선'
      }"
    >
      <!-- ── 1. 신청 상세: 읽기 + 레일 ─────────────────────────────── -->
      <div
        v-if="화면 === '신청'"
        class="mx-auto w-full max-w-6xl"
      >
        <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_19rem]">
          <!-- 규칙: 머리말·본문·문항이 한 장. 문항은 상자가 아니라 구획선으로 갈린다 -->
          <component
            :is="안 === '규칙' ? mBox종이 : 'div'"
            :class="안 === '규칙' ? '!p-0 overflow-hidden' : 'space-y-6'"
          >
            <header
              class="flex flex-wrap items-baseline gap-x-3 gap-y-1"
              :class="안 === '규칙' ? 'px-6 pt-6 sm:px-8 sm:pt-8' : ''"
            >
              <span class="flex items-center gap-1.5 text-xs font-medium text-muted">
                <UIcon
                  name="i-lucide-party-popper"
                  class="size-4 shrink-0"
                />
                행사
              </span>
              <h2 class="text-xl font-bold tracking-tight text-highlighted sm:text-2xl">
                신입 회원 오리엔테이션
              </h2>
              <UBadge
                color="success"
                size="sm"
              >
                신청받는 중
              </UBadge>
              <p class="w-full text-sm text-muted">
                모임이 무엇을 하는 곳이고 회원이 무엇을 할 수 있는지 안내합니다. 새로 가입한 회원 필수 참석.
              </p>
            </header>

            <article
              class="m-본문"
              :class="안 === '규칙' ? 'mt-6 border-t border-default px-6 py-6 sm:px-8' : ''"
            >
              <ClientOnly>
                <MDC :value="신청본문" />
              </ClientOnly>
            </article>

            <!-- 문항 — 지금·lMain 은 따로 선 상자, 규칙은 같은 장의 아래 구획 -->
            <section
              :class="안 === '규칙'
                ? 'border-t border-default'
                : 'overflow-hidden rounded-xl border border-default bg-default m-층-카드'"
            >
              <header
                class="flex items-center gap-2 border-b border-default py-3.5"
                :class="안 === '규칙' ? 'bg-muted px-6 sm:px-8' : 'px-5'"
              >
                <h3 class="text-sm font-semibold text-highlighted">
                  문항 {{ 문항s.length }}개
                </h3>
                <span class="grow" />
                <span class="text-xs text-muted tabular-nums">0 / {{ 문항s.length }} 응답</span>
              </header>
              <div class="divide-y divide-default">
                <div
                  v-for="(문항, i) in 문항s"
                  :key="문항"
                  class="flex items-start gap-2.5 py-5"
                  :class="안 === '규칙' ? 'px-6 sm:px-8' : 'px-5'"
                >
                  <span class="mt-0.5 w-5 shrink-0 text-sm font-semibold text-dimmed tabular-nums">{{ i + 1 }}</span>
                  <div class="min-w-0 flex-1 space-y-3">
                    <p class="font-medium text-highlighted">
                      {{ 문항 }}
                    </p>
                    <UInput class="w-full" />
                  </div>
                </div>
              </div>
              <div
                class="flex items-center gap-2 border-t border-default py-4"
                :class="안 === '규칙' ? 'px-6 sm:px-8' : 'px-5'"
              >
                <p class="text-sm text-muted tabular-nums">
                  0 / {{ 문항s.length }} 응답
                </p>
                <div class="grow" />
                <mButton
                  역할="강조"
                  label="제출"
                  disabled
                />
              </div>
            </section>
          </component>

          <!-- 레일 — 세 안 모두 같은 코드. lMain 한 장에서만 종이 위 종이가 된다 -->
          <aside class="lg:sticky lg:top-4 lg:self-start">
            <div class="overflow-hidden rounded-xl border border-default bg-default m-층-카드">
              <dl class="divide-y divide-default">
                <div
                  v-for="타일 in 레일타일s"
                  :key="타일.label"
                  class="flex items-baseline gap-3 px-4 py-3"
                >
                  <dt class="flex shrink-0 items-center gap-1.5 whitespace-nowrap text-xs text-dimmed">
                    <UIcon
                      :name="타일.icon"
                      class="size-3.5 shrink-0"
                    />
                    {{ 타일.label }}
                  </dt>
                  <dd class="min-w-0 flex-1 text-right">
                    <div class="truncate text-base leading-tight font-semibold text-highlighted tabular-nums">
                      {{ 타일.value }}
                    </div>
                    <div
                      v-if="타일.sub"
                      class="mt-0.5 truncate text-[0.625rem] leading-none text-dimmed"
                    >
                      {{ 타일.sub }}
                    </div>
                  </dd>
                </div>
              </dl>
              <div class="border-t border-default p-4">
                <mButton
                  역할="강조"
                  block
                  size="lg"
                  label="로그인하고 신청하기"
                />
              </div>
            </div>
          </aside>
        </div>
      </div>

      <!-- ── 2. 글 상세: 읽기 한 칸 + 댓글 ───────────────────────────── -->
      <div
        v-else-if="화면 === '글'"
        class="mx-auto w-full max-w-3xl space-y-4"
      >
        <!-- 길잡이 — 규칙에서도 바닥에 남는다 -->
        <UButton
          icon="i-lucide-arrow-left"
          variant="ghost"
          color="neutral"
          size="sm"
        >
          소식
        </UButton>

        <component
          :is="안 === '규칙' ? mBox종이 : 'div'"
          :class="안 === '규칙' ? '!p-0' : 'space-y-6'"
        >
          <article
            class="space-y-6"
            :class="안 === '규칙' ? 'p-6 sm:p-8' : ''"
          >
            <header class="space-y-2 border-b border-default pb-4">
              <h2 class="text-2xl font-semibold text-highlighted">
                가을 정기 모임 후기
              </h2>
              <p class="text-xs text-muted">
                운영진 · 2026.09.12 · 조회 48
              </p>
            </header>
            <div class="m-본문">
              <ClientOnly>
                <MDC :value="글본문" />
              </ClientOnly>
            </div>
          </article>

          <!-- 댓글 — 규칙에서는 같은 장 아래 구획, 지금은 바닥 위 목록 -->
          <section
            class="space-y-4"
            :class="안 === '규칙' ? 'border-t border-default p-6 sm:px-8' : ''"
          >
            <h3 class="text-sm font-semibold text-highlighted">
              댓글 {{ 댓글s.length }}
            </h3>
            <div
              v-for="댓글 in 댓글s"
              :key="댓글.이름"
              class="flex gap-3"
            >
              <UAvatar
                :text="댓글.이름.slice(0, 1)"
                size="sm"
              />
              <div class="min-w-0">
                <p class="text-sm font-medium text-highlighted">
                  {{ 댓글.이름 }} <span class="text-xs font-normal text-dimmed">{{ 댓글.언제 }}</span>
                </p>
                <p class="text-sm text-default">
                  {{ 댓글.말 }}
                </p>
              </div>
            </div>
            <UTextarea
              :rows="2"
              placeholder="댓글 쓰기"
              class="w-full"
            />
          </section>
        </component>
      </div>

      <!-- ── 3. 카드 목록 (대조군) ──────────────────────────────────── -->
      <div
        v-else
        class="mx-auto w-full max-w-7xl space-y-5"
      >
        <!-- 길잡이 줄 — 제목·필터는 바닥 -->
        <div class="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 class="text-xl font-bold text-highlighted">
              신청
            </h2>
            <p class="text-sm text-muted">
              지금 신청받는 행사·수업·설문
            </p>
          </div>
          <mTabs
            v-model="목록필터"
            :items="[{ label: '전체', value: '전체' }, { label: '받는 중', value: '받는중' }, { label: '마감', value: '마감' }]"
            type="segment"
            size="sm"
          />
        </div>

        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="카드 in 카드s"
            :key="카드.제목"
            class="overflow-hidden rounded-xl border border-default bg-default m-층-카드"
          >
            <div class="aspect-16/10 bg-elevated" />
            <div class="space-y-1.5 p-4">
              <div class="flex items-center gap-1.5 text-xs text-muted">
                <UIcon
                  :name="카드.icon"
                  class="size-3.5"
                />
                {{ 카드.종류 }}
              </div>
              <p class="font-semibold text-highlighted">
                {{ 카드.제목 }}
              </p>
              <p class="line-clamp-2 text-sm text-muted">
                {{ 카드.설명 }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </component>

    <!-- 안마다 볼 것 — 판 아래 바닥에 둔다 -->
    <ul class="mt-8 max-w-3xl list-disc space-y-1 ps-5 text-xs text-muted">
      <li
        v-for="줄 in 볼것s[안]"
        :key="줄"
      >
        {{ 줄 }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import mBox종이 from '~base-comps/m/Box/종이.vue'

definePageMeta({
  제목: '종이 까는 자리',
  설명: '본문이 바닥에 바로 앉아 바깥과 안 갈리는 문제를 lMain 에서 한 장 까는 안과 페이지 규칙(글·폼은 종이, 길잡이는 바닥)으로 나란히 본다.',
  상태: '대기',
  쓰는곳: '읽기 화면(신청 상세·글 상세·자료)에 종이를 어디서 깔지 정할 때'
})

type i화면 = '신청' | '글' | '목록'
type i안 = '지금' | 'lMain' | '규칙' | '세로선'

const 화면 = ref<i화면>('신청')
const 안 = ref<i안>('지금')
const 목록필터 = ref('전체')

const 화면s = [
  { label: '신청 상세', value: '신청' },
  { label: '글 상세', value: '글' },
  { label: '카드 목록', value: '목록' }
]

const 안s = [
  { label: '지금', value: '지금', 설명: '페이지마다 제각각 — 레일·카드만 종이, 글·폼은 바닥에 바로 앉는다.' },
  { label: 'lMain 한 장', value: 'lMain', 설명: '레이아웃이 화면 전체에 종이 한 장. 페이지 안은 손대지 않는다.' },
  { label: '규칙', value: '규칙', 설명: '글·폼·표는 종이, 길잡이(뒤로가기·목록 제목줄·필터)는 바닥.' },
  { label: '세로선', value: '세로선', 설명: '면은 그대로, 칸 좌우 가장자리에 선 한 줄씩. 층을 안 만든다.' }
]

const 볼것s: Record<i안, string[]> = {
  지금: [
    '신청 상세 — 제목·본문이 바닥에 떠 있고 레일만 종이다. 오른쪽 레일이 없는 넓은 화면이면 어디까지가 본문인지 안 보인다.',
    '글 상세 — 댓글 입력칸이 바닥 위에 바로 선다.',
    '카드 목록 — 문제없다. 카드가 종이다.'
  ],
  lMain: [
    '신청 상세 — 경계는 생기지만 레일·문항 상자가 종이 위 종이라 선 한 줄로만 갈린다. 레일이 떠 보이던 값을 잃는다.',
    '카드 목록 — 카드가 종이 위 종이로 묻힌다. 관리자 작업대(패널이 이미 종이)도 똑같이 된다.',
    '게다가 default 레이아웃은 lMain 을 안 쓴다(`layouts/default.vue` 가 slot 을 바로 꽂는다).'
  ],
  규칙: [
    '신청 상세 — 왼쪽 한 장 + 레일 한 장. 문항은 따로 선 상자가 아니라 같은 장의 아래 구획이라 「읽는 것·쓰는 것」이 한 벌로 읽힌다.',
    '글 상세 — 뒤로가기만 바닥, 글과 댓글이 한 장.',
    '카드 목록 — 지금과 같다. 규칙이 손대는 곳은 글·폼이 바닥에 앉은 화면뿐이다.'
  ],
  세로선: [
    '칸 바깥(여백)과 안(본문)이 선으로 갈린다. 종이 위 종이가 없어서 카드·레일이 그대로 뜨고 sticky 도 산다.',
    '선은 칸 폭(--ui-container)에 선다 — 글 상세처럼 칸 안에서 더 좁게(3xl) 읽는 화면은 선과 글 사이가 넓게 빈다. 그게 거슬리는지 볼 것.',
    '칸 안은 종이(bg-default)다. 바닥 위에 선만 그으면 구조선이 바닥에 묻혀 안 보였고, 「종이만 무채 — 바닥은 색온도」 규칙과도 어긋났다. 면이 경계를 나르니 선은 구조선 그대로다.',
    '레이아웃에 둘 수 있는 유일한 안이다(층이 아니라 안을 몰라도 된다). 다만 헤더 밑줄과 선이 만나야 한 틀로 읽힌다 — 이 판은 헤더 아래 손잡이 줄이 끼어 그 만남을 못 보여 준다.'
  ]
}

const 신청본문 = `모임이 무엇을 하는 곳이고 회원으로서 무엇을 할 수 있는지 안내합니다. 한 시간 반쯤 걸립니다.

## 순서

1. 모임 소개와 지금까지 함께한 협회
2. 지원 프로젝트가 돌아가는 방식과 회원의 역할
3. 교육 과정과 등급 (준회원 → 정회원)
4. 질의응답`

const 문항s = ['어떤 경로로 모임을 알게 되셨나요?', '오리엔테이션에서 특히 듣고 싶은 것이 있나요?']

const 레일타일s = [
  { label: '마감', icon: 'i-lucide-hourglass', value: 'D-5', sub: '26.08.30~09.19' },
  { label: '남은 자리', icon: 'i-lucide-users', value: '26자리', sub: '신청 0 / 26명' },
  { label: '일시', icon: 'i-lucide-calendar', value: '26.10.18 09:00', sub: '온라인(Zoom)' },
  { label: '요금', icon: 'i-lucide-tag', value: '무료', sub: '' }
]

const 글본문 = `지난 토요일 마장터에서 가을 정기 모임을 했습니다. 스물두 분이 오셨고, 처음 오신 분이 여섯이었습니다.

## 나눈 것

- 상반기 지원 프로젝트 셋의 결과
- 하반기 교육 과정 일정
- 회비 사용 내역

다음 모임은 12월 첫 주입니다. 자료는 자료실에 올려 두었습니다.`

const 댓글s = [
  { 이름: '김하늘', 언제: '2시간 전', 말: '처음 갔는데 분위기가 좋았어요. 다음에도 갈게요.' },
  { 이름: '박도윤', 언제: '어제', 말: '회비 내역 정리해 주셔서 감사합니다.' }
]

const 카드s = [
  { 종류: '행사', icon: 'i-lucide-party-popper', 제목: '신입 회원 오리엔테이션', 설명: '모임이 무엇을 하는 곳이고 회원이 무엇을 할 수 있는지 안내합니다.' },
  { 종류: '수업', icon: 'i-lucide-graduation-cap', 제목: '기초 과정 3기', 설명: '준회원이 정회원으로 가는 첫 과정. 여섯 번 만납니다.' },
  { 종류: '설문', icon: 'i-lucide-clipboard-list', 제목: '하반기 모임 요일 조사', 설명: '가장 많이 되는 요일로 정합니다. 3분이면 끝납니다.' }
]
</script>

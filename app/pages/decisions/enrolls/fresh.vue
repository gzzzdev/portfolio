<!--
  **신청 목록·상세를 산뜻하게 다시 세우면**의 판. 실화면은 `/official/enrolls`(목록) · `/official/enrolls/[id]`(상세).

  ## 이 판이 답하는 물음

  지금 목록은 **관리자 표**처럼 읽힌다 — 마감/이름/종류/자리/요금 열에 줄마다 작은 「신청」 버튼,
  가장 큰 글자인 D-day 가 회색이라 D-5 와 D-73 이 똑같고, 칩 세 줄·정렬·보기 전환이 내용보다 먼저 와서
  폰에서는 목록이 첫 화면 밖으로 밀린다. 자리 막대는 거의 비어(0/26) 소음이다.
  상세는 제목 줄이 비좁고, 폰에서 「신청하기」가 1554px 페이지 맨 끝에 있다.
  물음은 — **급한 것이 급해 보이고, 누를 곳이 한눈에, 폰 첫 화면에서 끝나게 하려면.**

  ## 판 읽는 법

  - 「화면」 손잡이로 목록·상세를 오간다. 안 버튼은 화면마다 따로다(목록 셋 · 상세 둘).
  - 「폭」의 `폰` 은 390px 틀 안에 그린다. Tailwind 의 `sm:`·`lg:` 는 **뷰포트** 기준이라 틀 안에서 안 바뀐다 —
    그래서 안들의 반응형은 전부 **컨테이너 쿼리**(`@container` + `@3xl:`)로 적었다. 옮길 때 뷰포트 변형으로 바꿔도 되고
    그대로 둬도 된다(목록이 사이드바 곁에 끼는 자리라면 컨테이너 쪽이 오히려 맞다).
    틀 이름만 `@container/frame` 로 영문이다 — 한글 이름(`/틀`)은 Tailwind 가 클래스를 안 뽑았다(실측).
  - 표본(아래 `표본s` · `상세`)은 **지어낸 정적 값**이다 — 모델·DB 를 안 읽는다. 오늘은 2026-09-14 로 고정했다.
  - 급함 색(장미·호박)과 종류 파스텔은 **테마 축을 안 탄다.** 파스텔은 `--ui-bg` 에 섞고 다크에서는 섞는 양을
    줄였다(`--파스텔`). 글자에 준 색은 전부 `dark:` 짝이 있다.
  - 거르기(종류·신청받기·요금·정렬)는 판 안에서만 진짜로 걸린다. 누르면 이동하는 곳은 없다.
-->
<template>
  <div class="mx-auto w-full max-w-(--ui-container) px-4 py-8">
    <header class="mb-5">
      <h1 class="text-2xl font-semibold text-highlighted">
        신청 목록·상세 새 판
      </h1>
      <p class="mt-1 text-sm text-muted">
        같은 표본(15건) · 급한 것이 급해 보이게, 폰 첫 화면에서 신청이 끝나게
      </p>
    </header>

    <div class="mb-4 flex flex-wrap items-center gap-2">
      <mButton
        v-for="안 in 지금안s"
        :key="안.키"
        size="sm"
        역할="조용"
        :켜짐="지금안키 === 안.키"
        :label="안.이름"
        @click="do안고르기(안.키)"
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
    </div>

    <div class="mb-5 rounded-lg border border-default bg-muted px-4 py-3 text-sm leading-relaxed">
      <p><span class="text-dimmed">왜 ·</span> {{ 판.왜 }}</p>
      <p class="mt-1">
        <span class="text-dimmed">대가 ·</span> {{ 판.대가 }}
      </p>
    </div>

    <!-- ── 판 ─────────────────────────────────────────────────────── -->
    <div
      class="flex justify-center rounded-xl border border-default p-3 sm:p-8"
      :style="{ background: 판바탕 }"
    >
      <div
        data-틀
        class="@container/frame relative overflow-hidden bg-default [--파스텔:1] dark:[--파스텔:0.3]"
        :class="폭 === '폰'
          ? 'h-[800px] w-[406px] shrink-0 rounded-[40px] border-8 border-neutral-800 m-층-모달 dark:border-neutral-700'
          : 'w-full rounded-2xl border border-default'"
      >
        <div
          :key="`${화면}-${지금안키}-${폭}`"
          class="@container [scrollbar-width:none]"
          :class="폭 === '폰' ? 'h-full overflow-y-auto' : ''"
        >
          <!-- ══ 목록 A · 마감 묶음 ═══════════════════════════════════ -->
          <div
            v-if="화면 === '목록' && 목록안키 === '묶음'"
            class="px-5 pb-10 pt-7 @3xl:px-10 @3xl:pt-10"
          >
            <h2 class="text-[28px] font-bold tracking-tight text-highlighted @3xl:text-[34px]">
              신청
            </h2>
            <p class="mt-1 text-[15px] text-muted">
              마감이 가까운 것부터 보여 드려요
            </p>

            <div class="-mx-5 mt-5 flex gap-2 overflow-x-auto px-5 [mask-image:linear-gradient(to_right,black_calc(100%-32px),transparent)] [scrollbar-width:none] @3xl:mx-0 @3xl:px-0 @3xl:[mask-image:none]">
              <button
                v-for="종류 in 종류탭s"
                :key="종류.이름"
                type="button"
                class="flex h-10 shrink-0 items-center gap-1.5 rounded-full px-4 text-sm font-medium transition-colors"
                :class="종류필터 === 종류.이름 ? 'bg-inverted text-inverted' : 'bg-elevated text-default hover:bg-accented'"
                @click="종류필터 = 종류.이름"
              >
                {{ 종류.이름 }}
                <span
                  class="text-xs tabular-nums"
                  :class="종류필터 === 종류.이름 ? 'text-inverted/70' : 'text-dimmed'"
                >{{ 종류.수 }}</span>
              </button>
            </div>

            <section
              v-for="묶음 in 마감묶음s"
              :key="묶음.이름"
              class="mt-9"
            >
              <div class="flex items-baseline gap-2">
                <h3 class="text-lg font-bold tracking-tight text-highlighted">
                  {{ 묶음.이름 }}
                </h3>
                <span class="text-sm text-dimmed">{{ 묶음.설명 }}</span>
              </div>
              <ul class="mt-3 grid gap-2.5 @3xl:grid-cols-2 @3xl:gap-3">
                <li
                  v-for="항목 in 묶음.항목s"
                  :key="항목.id"
                >
                  <button
                    type="button"
                    class="group flex w-full items-center gap-4 rounded-[22px] bg-default p-2.5 pr-3.5 text-left ring-1 ring-default transition-all hover:ring-accented active:scale-[.99] m-층-카드"
                    :class="항목.남은날 === null ? 'opacity-70' : ''"
                  >
                    <span
                      class="flex size-[68px] shrink-0 flex-col items-center justify-center rounded-[18px]"
                      :class="날타일칠[급함of(항목)]"
                    >
                      <span
                        class="font-bold leading-none tracking-tight tabular-nums"
                        :class="[급함표[급함of(항목)].글, 급함of(항목) === '여유' || 항목.남은날 === null ? 'text-base' : 'text-[21px]']"
                      >{{ 디데이(항목) }}</span>
                      <span class="mt-1.5 text-[11px] font-medium text-muted">{{ 마감일(항목) }}</span>
                    </span>
                    <span class="min-w-0 flex-1 py-0.5">
                      <span
                        class="flex items-center gap-1 text-xs font-semibold"
                        :class="종류표[항목.종류].글"
                      >
                        <UIcon
                          :name="종류표[항목.종류].아이콘"
                          class="size-3.5"
                        />
                        {{ 항목.종류 }}
                      </span>
                      <span class="mt-0.5 line-clamp-2 text-[15px] font-semibold leading-snug text-highlighted">
                        {{ 항목.제목 }}
                      </span>
                      <span class="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-muted">
                        <span>{{ 항목.일시 }}</span>
                        <span
                          v-if="자리of(항목)?.is급함"
                          class="rounded-full px-2 py-px text-xs font-semibold text-rose-700 dark:text-rose-300"
                          :style="{ background: 파스텔('#FECDD3', 70) }"
                        >{{ 자리of(항목)!.글 }}</span>
                        <span
                          v-if="항목.요금"
                          class="rounded-full bg-inverted px-2 py-px text-xs font-semibold text-inverted"
                        >{{ 원(항목.요금) }}</span>
                      </span>
                    </span>
                    <UIcon
                      name="i-lucide-chevron-right"
                      class="size-5 shrink-0 text-dimmed transition-transform group-hover:translate-x-0.5"
                    />
                  </button>
                </li>
              </ul>
            </section>

            <p
              v-if="!마감묶음s.length"
              class="mt-10 text-center text-sm text-muted"
            >
              이 종류로 열린 신청이 없어요
            </p>
          </div>

          <!-- ══ 목록 B · 파스텔 카드 ══════════════════════════════════ -->
          <div
            v-else-if="화면 === '목록' && 목록안키 === '카드'"
            class="px-5 pb-10 pt-7 @3xl:px-10 @3xl:pt-10"
          >
            <div class="flex flex-col gap-4 @3xl:flex-row @3xl:items-end @3xl:justify-between">
              <div>
                <h2 class="text-[28px] font-bold tracking-tight text-highlighted @3xl:text-[34px]">
                  함께할 자리
                </h2>
                <p class="mt-1 text-[15px] text-muted">
                  행사·수업·설문·퀴즈 {{ 열린수 }}개가 신청을 받고 있어요
                </p>
              </div>
              <label class="flex h-11 w-full items-center gap-2 rounded-full bg-elevated px-4 text-sm text-dimmed @3xl:w-72">
                <UIcon
                  name="i-lucide-search"
                  class="size-4"
                />
                <input
                  v-model="검색"
                  type="search"
                  placeholder="찾기"
                  class="min-w-0 flex-1 bg-transparent text-default outline-none placeholder:text-dimmed"
                >
              </label>
            </div>

            <div class="-mx-5 mt-5 overflow-x-auto px-5 [mask-image:linear-gradient(to_right,black_calc(100%-32px),transparent)] [scrollbar-width:none] @3xl:mx-0 @3xl:px-0 @3xl:[mask-image:none]">
              <div class="inline-flex gap-1 rounded-full bg-elevated p-1">
                <button
                  v-for="종류 in 종류탭s"
                  :key="종류.이름"
                  type="button"
                  class="flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-sm font-medium transition-all"
                  :class="종류필터 === 종류.이름 ? 'bg-default text-highlighted m-층-카드' : 'text-muted hover:text-highlighted'"
                  @click="종류필터 = 종류.이름"
                >
                  <UIcon
                    v-if="종류.아이콘"
                    :name="종류.아이콘"
                    class="size-4"
                    :class="종류필터 === 종류.이름 ? 종류표[종류.이름 as i종류].글 : ''"
                  />
                  {{ 종류.이름 }}
                </button>
              </div>
            </div>

            <ul class="mt-6 grid gap-4 @xl:grid-cols-2 @4xl:grid-cols-3">
              <li
                v-for="항목 in 걸러진s"
                :key="항목.id"
                class="flex flex-col overflow-hidden rounded-[26px] bg-default ring-1 ring-default m-층-카드"
                :class="항목.남은날 === null ? 'opacity-75' : ''"
              >
                <div
                  class="relative h-[104px] p-4"
                  :style="{ background: 카드머리칠(항목) }"
                >
                  <div class="flex items-center justify-between gap-2">
                    <span
                      class="inline-flex items-center gap-1.5 rounded-full bg-default/80 px-2.5 py-1 text-xs font-semibold"
                      :class="종류표[항목.종류].글"
                    >
                      <UIcon
                        :name="종류표[항목.종류].아이콘"
                        class="size-3.5"
                      />
                      {{ 항목.종류 }}
                    </span>
                    <span
                      class="rounded-full px-2.5 py-1 text-xs font-bold tabular-nums"
                      :class="{
                        급함: 'bg-rose-600 text-white dark:bg-rose-500',
                        곧: 'bg-default/80 text-amber-700 dark:text-amber-300',
                        여유: 'bg-default/80 text-default',
                        마감: 'bg-default/80 text-muted'
                      }[급함of(항목)]"
                    >{{ 항목.남은날 === null ? '마감' : `${디데이(항목)} · ${마감일(항목)}` }}</span>
                  </div>
                  <UIcon
                    :name="종류표[항목.종류].아이콘"
                    class="absolute bottom-2 right-4 size-11 opacity-25"
                    :class="종류표[항목.종류].글"
                  />
                </div>
                <div class="flex flex-1 flex-col px-5 pb-5">
                  <h3 class="text-lg font-bold leading-snug tracking-tight text-highlighted">
                    {{ 제목앞(항목.제목) }}
                    <span
                      v-if="제목뒤(항목.제목)"
                      class="mt-0.5 block text-[15px] font-semibold text-muted"
                    >{{ 제목뒤(항목.제목) }}</span>
                  </h3>
                  <p class="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">
                    {{ 항목.설명 }}
                  </p>
                  <div class="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[13px] text-default">
                    <span class="inline-flex items-center gap-1">
                      <UIcon
                        name="i-lucide-calendar"
                        class="size-3.5 text-dimmed"
                      />{{ 항목.일시 }}
                    </span>
                    <span class="inline-flex items-center gap-1">
                      <UIcon
                        name="i-lucide-map-pin"
                        class="size-3.5 text-dimmed"
                      />{{ 항목.장소 }}
                    </span>
                  </div>
                  <div class="mt-auto flex items-center gap-3 pt-5">
                    <div class="min-w-0 flex-1 leading-tight">
                      <p class="text-[15px] font-bold text-highlighted">
                        {{ 항목.요금 ? 원(항목.요금) : '무료' }}
                      </p>
                      <p
                        class="mt-0.5 text-xs"
                        :class="자리of(항목)?.is급함 ? 'font-semibold text-rose-700 dark:text-rose-300' : 'text-dimmed'"
                      >
                        {{ 자리of(항목)?.글 ?? '누구나' }}
                      </p>
                    </div>
                    <button
                      type="button"
                      class="h-11 shrink-0 rounded-full px-5 text-sm font-semibold transition-all active:scale-[.98]"
                      :class="항목.남은날 === null ? 'bg-elevated text-dimmed' : 'bg-inverted text-inverted hover:opacity-90'"
                      :disabled="항목.남은날 === null"
                    >
                      {{ 항목.남은날 === null ? '마감됐어요' : 행동말(항목) }}
                    </button>
                  </div>
                </div>
              </li>
            </ul>
          </div>

          <!-- ══ 목록 C · 티켓 ═════════════════════════════════════════ -->
          <div
            v-else-if="화면 === '목록' && 목록안키 === '티켓'"
            class="pb-10 @3xl:min-h-[720px]"
          >
            <div class="px-5 pt-7 @3xl:px-10 @3xl:pt-10">
              <div class="flex items-center justify-between">
                <h2 class="text-[28px] font-bold tracking-tight text-highlighted @3xl:text-[34px]">
                  신청 <span class="text-dimmed">{{ 걸러진s.length }}</span>
                </h2>
                <button
                  type="button"
                  class="flex size-10 items-center justify-center rounded-full bg-elevated text-default"
                  aria-label="찾기"
                >
                  <UIcon
                    name="i-lucide-search"
                    class="size-[18px]"
                  />
                </button>
              </div>
            </div>

            <!-- 붙는 알약 줄 — 바탕은 불투명하게 두고, 아래 여백만 mask 로 흐린다(색 덮개 경계가 안 생긴다) -->
            <div class="sticky top-0 z-10 bg-default/85 px-5 pb-5 pt-3 backdrop-blur [mask-image:linear-gradient(to_bottom,black_calc(100%-16px),transparent)] @3xl:px-10">
              <div class="flex h-12 items-center gap-1 rounded-full bg-default p-1 ring-1 ring-default m-층-카드">
                <button
                  data-시트열기
                  type="button"
                  class="flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-inverted pl-3.5 pr-3 text-sm font-semibold text-inverted"
                  @click="is시트 = true"
                >
                  <UIcon
                    name="i-lucide-sliders-horizontal"
                    class="size-4"
                  />
                  거르기
                  <span
                    v-if="걸린조건s.length"
                    class="flex size-5 items-center justify-center rounded-full bg-default text-[11px] font-bold text-highlighted"
                  >{{ 걸린조건s.length }}</span>
                </button>
                <div class="flex min-w-0 flex-1 gap-1 overflow-x-auto [mask-image:linear-gradient(to_right,black_calc(100%-20px),transparent)] [scrollbar-width:none]">
                  <button
                    v-for="조건 in 걸린조건s"
                    :key="조건.이름"
                    type="button"
                    class="flex h-10 shrink-0 items-center gap-1 rounded-full bg-elevated pl-3 pr-2 text-sm font-medium text-highlighted"
                    @click="조건.지우기()"
                  >
                    {{ 조건.값 }}
                    <UIcon
                      name="i-lucide-x"
                      class="size-3.5 text-muted"
                    />
                  </button>
                  <span
                    v-if="!걸린조건s.length"
                    class="flex h-10 items-center whitespace-nowrap px-2 text-sm text-dimmed"
                  >모든 종류 · 모든 요금</span>
                </div>
                <button
                  type="button"
                  class="flex h-10 shrink-0 items-center gap-1 rounded-full px-3 text-sm font-medium text-muted hover:bg-elevated"
                  @click="is시트 = true"
                >
                  <UIcon
                    name="i-lucide-arrow-up-down"
                    class="size-3.5"
                  />
                  {{ 정렬 === '마감순' ? '마감순' : '가나다' }}
                </button>
              </div>
            </div>

            <ul class="grid gap-3 px-5 @3xl:grid-cols-2 @3xl:px-10">
              <li
                v-for="항목 in 걸러진s"
                :key="항목.id"
              >
                <button
                  type="button"
                  class="group flex w-full text-left transition-transform active:scale-[.99]"
                  :class="항목.남은날 === null ? 'opacity-65' : ''"
                  :style="{ mask: 티켓홈, WebkitMask: 티켓홈 }"
                >
                  <span
                    class="flex w-[78px] shrink-0 flex-col items-center justify-center rounded-l-2xl py-3"
                    :style="{ background: 파스텔(종류표[항목.종류].색, 60, 'var(--ui-bg-elevated)') }"
                  >
                    <span
                      class="text-lg font-bold leading-none tracking-tight tabular-nums"
                      :class="급함표[급함of(항목)].글"
                    >{{ 디데이(항목) }}</span>
                    <span class="mt-1.5 text-[11px] font-medium text-muted">{{ 마감일(항목) }}</span>
                  </span>
                  <span class="relative flex min-w-0 flex-1 items-center gap-2 rounded-r-2xl bg-elevated/60 py-3 pl-3.5 pr-3 transition-colors before:absolute before:inset-y-3 before:left-0 before:border-l-2 before:border-dashed before:border-(--ui-border-accented) group-hover:bg-elevated">
                    <span class="min-w-0 flex-1">
                      <span
                        class="flex items-center gap-1 text-xs font-semibold"
                        :class="종류표[항목.종류].글"
                      >
                        <UIcon
                          :name="종류표[항목.종류].아이콘"
                          class="size-3.5"
                        />
                        {{ 항목.종류 }}
                        <span class="font-normal text-dimmed">· {{ 항목.일시 }}</span>
                      </span>
                      <span class="mt-0.5 line-clamp-2 text-[15px] font-semibold leading-snug text-highlighted">{{ 항목.제목 }}</span>
                      <span class="mt-1.5 flex flex-wrap gap-1.5 text-xs font-medium">
                        <span
                          v-if="항목.요금"
                          class="rounded-full bg-inverted px-2 py-0.5 text-inverted"
                        >{{ 원(항목.요금) }}</span>
                        <span
                          v-if="자리of(항목) && (자리of(항목)!.is급함 || 항목.남은날 === null)"
                          class="rounded-full px-2 py-0.5"
                          :class="자리of(항목)!.is급함 ? 'text-rose-700 dark:text-rose-300' : 'bg-accented text-muted'"
                          :style="자리of(항목)!.is급함 ? { background: 파스텔('#FECDD3', 70) } : undefined"
                        >{{ 자리of(항목)!.글 }}</span>
                        <span class="inline-flex items-center gap-1 py-0.5 font-normal text-muted">
                          <UIcon
                            :name="항목.장소.startsWith('온라인') ? 'i-lucide-video' : 'i-lucide-map-pin'"
                            class="size-3.5 text-dimmed"
                          />{{ 항목.장소 }}
                        </span>
                      </span>
                    </span>
                    <UIcon
                      name="i-lucide-chevron-right"
                      class="size-5 shrink-0 text-dimmed"
                    />
                  </span>
                </button>
              </li>
            </ul>
          </div>

          <!-- ══ 상세 A · 파스텔 머리 ══════════════════════════════════ -->
          <div v-else-if="화면 === '상세' && 상세안키 === '머리'">
            <div
              class="px-5 pb-8 pt-4 @3xl:px-10 @3xl:pb-12 @3xl:pt-6"
              :style="{ background: 머리칠 }"
            >
              <div class="flex items-center justify-between">
                <button
                  type="button"
                  class="flex h-9 items-center gap-1 rounded-full bg-default/70 pl-2 pr-3.5 text-sm font-medium text-default backdrop-blur"
                >
                  <UIcon
                    name="i-lucide-chevron-left"
                    class="size-4"
                  />
                  신청
                </button>
                <div class="flex gap-2">
                  <button
                    v-for="아이콘 in ['i-lucide-share-2', 'i-lucide-bookmark']"
                    :key="아이콘"
                    type="button"
                    class="flex size-9 items-center justify-center rounded-full bg-default/70 text-default backdrop-blur"
                  >
                    <UIcon
                      :name="아이콘"
                      class="size-4"
                    />
                  </button>
                </div>
              </div>

              <div class="mx-auto max-w-5xl">
                <div class="mt-7 flex flex-wrap gap-2 @3xl:mt-10">
                  <span class="inline-flex items-center gap-1.5 rounded-full bg-default/80 px-3 py-1 text-[13px] font-semibold text-indigo-700 dark:text-indigo-300">
                    <UIcon
                      name="i-lucide-graduation-cap"
                      class="size-4"
                    />
                    수업
                  </span>
                  <span class="inline-flex items-center gap-1.5 rounded-full bg-default/80 px-3 py-1 text-[13px] font-semibold text-emerald-700 dark:text-emerald-300">
                    <span class="size-1.5 rounded-full bg-emerald-500" />
                    신청받는 중
                  </span>
                </div>
                <h2 class="mt-3 text-[28px] font-bold leading-[1.2] tracking-tight text-highlighted @3xl:text-[42px]">
                  {{ 상세.제목 }}
                  <span class="block text-muted">{{ 상세.부제 }}</span>
                </h2>
                <p class="mt-3 max-w-2xl text-[15px] leading-relaxed text-default @3xl:text-[17px]">
                  {{ 상세.요약 }}
                </p>
                <div class="mt-5 flex flex-wrap gap-2">
                  <span
                    v-for="사실 in 사실s"
                    :key="사실.글"
                    class="inline-flex items-center gap-1.5 rounded-full bg-default/80 px-3 py-1.5 text-[13px] font-medium ring-1 ring-default/60"
                    :class="사실.칠 ?? 'text-default'"
                  >
                    <UIcon
                      :name="사실.아이콘"
                      class="size-4 opacity-80"
                    />
                    {{ 사실.글 }}
                  </span>
                </div>
              </div>
            </div>

            <div class="px-5 pb-10 pt-2 @3xl:px-10 @3xl:pb-14">
              <div class="mx-auto grid max-w-5xl gap-10 @3xl:grid-cols-[1fr_320px]">
                <article class="min-w-0 space-y-9">
                  <section>
                    <h3 class="text-lg font-bold tracking-tight text-highlighted">
                      이런 분께 맞아요
                    </h3>
                    <ul class="mt-3 space-y-2.5">
                      <li
                        v-for="대상 in 상세.대상s"
                        :key="대상"
                        class="flex gap-3 text-[15px] leading-relaxed text-default"
                      >
                        <span
                          class="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-indigo-700 dark:text-indigo-300"
                          :style="{ background: 파스텔('#C7D2FE', 80) }"
                        >
                          <UIcon
                            name="i-lucide-check"
                            class="size-3.5"
                          />
                        </span>
                        {{ 대상 }}
                      </li>
                    </ul>
                  </section>

                  <section>
                    <h3 class="text-lg font-bold tracking-tight text-highlighted">
                      이렇게 진행해요
                    </h3>
                    <ol class="mt-3 space-y-2.5">
                      <li
                        v-for="(순서, i) in 상세.순서s"
                        :key="순서.이름"
                        class="flex gap-4 rounded-[20px] bg-elevated/60 p-4"
                      >
                        <span class="flex size-9 shrink-0 items-center justify-center rounded-full bg-inverted text-sm font-bold text-inverted">
                          {{ i + 1 }}
                        </span>
                        <div class="min-w-0">
                          <p class="flex flex-wrap items-baseline gap-x-2 text-[15px] font-semibold text-highlighted">
                            {{ 순서.이름 }}
                            <span class="text-[13px] font-medium tabular-nums text-dimmed">{{ 순서.때 }}</span>
                          </p>
                          <p class="mt-1 text-sm leading-relaxed text-muted">
                            {{ 순서.글 }}
                          </p>
                        </div>
                      </li>
                    </ol>
                  </section>

                  <section>
                    <h3 class="text-lg font-bold tracking-tight text-highlighted">
                      준비물
                    </h3>
                    <div class="mt-3 flex flex-wrap gap-2">
                      <span
                        v-for="준비물 in 상세.준비물s"
                        :key="준비물"
                        class="rounded-full border border-default px-3.5 py-1.5 text-sm text-default"
                      >{{ 준비물 }}</span>
                    </div>
                  </section>

                  <div
                    class="flex gap-3 rounded-[20px] p-4 text-sm leading-relaxed text-default"
                    :style="{ background: 파스텔('#BAE6FD', 55) }"
                  >
                    <UIcon
                      name="i-lucide-info"
                      class="mt-0.5 size-[18px] shrink-0 text-sky-700 dark:text-sky-300"
                    />
                    {{ 상세.알림 }}
                  </div>
                </article>

                <aside class="hidden @3xl:block">
                  <div class="sticky top-6 rounded-[26px] bg-default p-5 ring-1 ring-default m-층-떠있음">
                    <p class="text-sm text-muted">
                      마감까지
                    </p>
                    <p class="mt-0.5 flex items-baseline gap-2">
                      <span class="text-[34px] font-bold leading-none tracking-tight text-amber-700 dark:text-amber-300">D-{{ 상세.남은날 }}</span>
                      <span class="text-sm text-muted">9.24(목) 마감</span>
                    </p>
                    <dl class="mt-5 space-y-3 border-t border-default pt-4 text-sm">
                      <div
                        v-for="줄 in 요약줄s"
                        :key="줄.이름"
                        class="flex items-start gap-3"
                      >
                        <UIcon
                          :name="줄.아이콘"
                          class="mt-0.5 size-4 shrink-0 text-dimmed"
                        />
                        <dt class="w-12 shrink-0 text-muted">
                          {{ 줄.이름 }}
                        </dt>
                        <dd class="min-w-0 font-medium text-highlighted">
                          {{ 줄.값 }}
                        </dd>
                      </div>
                    </dl>
                    <button
                      type="button"
                      class="mt-5 flex h-12 w-full items-center justify-center rounded-full bg-inverted text-[15px] font-semibold text-inverted transition-all hover:opacity-90 active:scale-[.99]"
                    >
                      신청하기
                    </button>
                    <p class="mt-2.5 text-center text-xs text-dimmed">
                      회원이 아니어도 바로 신청돼요
                    </p>
                  </div>
                </aside>
              </div>
            </div>

            <!-- 폰: 아래에 붙는 행동 줄 -->
            <div class="sticky bottom-0 z-10 px-3 pb-3 pt-6 @3xl:hidden">
              <div class="flex items-center gap-3 rounded-[24px] bg-default py-2 pl-4 pr-2 ring-1 ring-default m-층-모달">
                <div class="min-w-0 flex-1 leading-tight">
                  <p class="text-[15px] font-bold text-highlighted">
                    무료 · {{ 상세.정원 - 상세.신청수 }}자리 남음
                  </p>
                  <p class="mt-0.5 text-xs font-semibold text-amber-700 dark:text-amber-300">
                    D-{{ 상세.남은날 }} · 9.24(목) 마감
                  </p>
                </div>
                <button
                  type="button"
                  class="h-12 shrink-0 rounded-full bg-inverted px-6 text-[15px] font-semibold text-inverted active:scale-[.98]"
                >
                  신청하기
                </button>
              </div>
            </div>
          </div>

          <!-- ══ 상세 B · 잡지 ═════════════════════════════════════════ -->
          <div v-else-if="화면 === '상세' && 상세안키 === '잡지'">
            <div class="mx-auto grid max-w-6xl gap-12 px-5 pb-6 pt-6 @3xl:grid-cols-[1fr_300px] @3xl:px-12 @3xl:pb-16 @3xl:pt-12">
              <article class="min-w-0">
                <p class="flex items-center gap-1.5 text-sm text-muted">
                  신청
                  <UIcon
                    name="i-lucide-chevron-right"
                    class="size-3.5 text-dimmed"
                  />
                  <span class="font-semibold text-indigo-700 dark:text-indigo-300">수업</span>
                </p>
                <h2 class="mt-4 text-[32px] font-bold leading-[1.12] tracking-tight text-highlighted @3xl:text-[52px]">
                  {{ 상세.제목 }}
                </h2>
                <p class="mt-2 text-xl font-semibold tracking-tight text-muted @3xl:text-2xl">
                  {{ 상세.부제 }}
                </p>

                <!-- 폰 첫 화면의 요약 — 넓으면 오른쪽 떠 있는 카드가 대신한다 -->
                <div
                  class="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-[22px] @3xl:hidden"
                  :style="{ background: 파스텔('#C7D2FE', 50) }"
                >
                  <div
                    v-for="칸 in 요약칸s"
                    :key="칸.이름"
                    class="bg-default/60 p-3.5"
                  >
                    <p class="text-xs text-muted">
                      {{ 칸.이름 }}
                    </p>
                    <p
                      class="mt-0.5 text-[15px] font-bold tracking-tight"
                      :class="칸.칠 ?? 'text-highlighted'"
                    >
                      {{ 칸.값 }}
                    </p>
                  </div>
                </div>

                <p class="mt-7 text-[17px] leading-[1.75] text-default @3xl:mt-8 @3xl:text-xl @3xl:leading-[1.7]">
                  {{ 상세.요약 }}
                </p>
                <div class="mt-5 flex items-center gap-3">
                  <span
                    class="flex size-10 items-center justify-center rounded-full text-sm font-bold text-indigo-700 dark:text-indigo-300"
                    :style="{ background: 파스텔('#C7D2FE', 90) }"
                  >정</span>
                  <p class="text-sm leading-tight">
                    <span class="block font-semibold text-highlighted">{{ 상세.진행이 }}</span>
                    <span class="text-muted">마장터 실무팀 · 명부 이관 14건</span>
                  </p>
                </div>

                <div class="mt-12 space-y-12">
                  <section class="grid gap-3 @xl:grid-cols-[72px_1fr]">
                    <span class="text-[34px] font-bold leading-none tracking-tight text-dimmed">01</span>
                    <div>
                      <h3 class="text-xl font-bold tracking-tight text-highlighted">
                        이런 분께 맞아요
                      </h3>
                      <ul class="mt-4 divide-y divide-default border-y border-default">
                        <li
                          v-for="대상 in 상세.대상s"
                          :key="대상"
                          class="py-3 text-[15px] leading-relaxed text-default"
                        >
                          {{ 대상 }}
                        </li>
                      </ul>
                    </div>
                  </section>

                  <blockquote
                    class="rounded-[28px] px-6 py-7 text-[20px] font-semibold leading-snug tracking-tight text-highlighted @3xl:px-10 @3xl:text-[26px]"
                    :style="{ background: 인용칠 }"
                  >
                    “명부를 옮기는 날이 정리하는 날이에요. 법이 요구하는 선은 생각보다 짧습니다.”
                  </blockquote>

                  <section class="grid gap-3 @xl:grid-cols-[72px_1fr]">
                    <span class="text-[34px] font-bold leading-none tracking-tight text-dimmed">02</span>
                    <div>
                      <h3 class="text-xl font-bold tracking-tight text-highlighted">
                        세 시간의 순서
                      </h3>
                      <ol class="mt-4 border-t border-default">
                        <li
                          v-for="순서 in 상세.순서s"
                          :key="순서.이름"
                          class="grid grid-cols-[56px_1fr] gap-3 border-b border-default py-4"
                        >
                          <span class="text-[15px] font-bold tabular-nums text-indigo-700 dark:text-indigo-300">{{ 순서.때 }}</span>
                          <div>
                            <p class="text-[15px] font-semibold text-highlighted">
                              {{ 순서.이름 }}
                            </p>
                            <p class="mt-1 text-sm leading-relaxed text-muted">
                              {{ 순서.글 }}
                            </p>
                          </div>
                        </li>
                      </ol>
                    </div>
                  </section>

                  <section class="grid gap-3 @xl:grid-cols-[72px_1fr]">
                    <span class="text-[34px] font-bold leading-none tracking-tight text-dimmed">03</span>
                    <div>
                      <h3 class="text-xl font-bold tracking-tight text-highlighted">
                        챙겨 올 것
                      </h3>
                      <ul class="mt-4 space-y-2 text-[15px] text-default">
                        <li
                          v-for="준비물 in 상세.준비물s"
                          :key="준비물"
                          class="flex items-center gap-2.5"
                        >
                          <span class="size-1.5 shrink-0 rounded-full bg-(--ui-text-dimmed)" />
                          {{ 준비물 }}
                        </li>
                      </ul>
                      <p class="mt-5 flex gap-2.5 border-l-2 border-sky-400 pl-4 text-sm leading-relaxed text-muted dark:border-sky-500">
                        {{ 상세.알림 }}
                      </p>
                    </div>
                  </section>
                </div>
              </article>

              <aside class="hidden @3xl:block">
                <div class="sticky top-8 overflow-hidden rounded-[28px] bg-default ring-1 ring-default m-층-모달">
                  <div
                    class="px-5 pb-4 pt-5"
                    :style="{ background: 요약머리칠 }"
                  >
                    <div class="flex items-end gap-3">
                      <span class="flex w-16 flex-col items-center rounded-2xl bg-default py-2 m-층-카드">
                        <span class="text-[11px] font-semibold text-rose-600 dark:text-rose-300">10월</span>
                        <span class="text-[26px] font-bold leading-none tracking-tight text-highlighted">11</span>
                        <span class="mt-0.5 text-[11px] text-muted">일요일</span>
                      </span>
                      <p class="pb-1 text-sm leading-tight">
                        <span class="block font-semibold text-highlighted">10:00 – 13:00</span>
                        <span class="text-muted">온라인 · Zoom</span>
                      </p>
                    </div>
                  </div>
                  <div class="px-5 pb-5">
                    <div class="grid grid-cols-3 gap-2 pt-1 text-center">
                      <div
                        v-for="칸 in 요약칸s.filter(칸 => 칸.이름 !== '일시')"
                        :key="칸.이름"
                        class="rounded-2xl bg-elevated/70 px-1 py-2.5"
                      >
                        <p class="text-[11px] text-muted">
                          {{ 칸.이름 }}
                        </p>
                        <p
                          class="mt-0.5 text-sm font-bold"
                          :class="칸.칠 ?? 'text-highlighted'"
                        >
                          {{ 칸.짧게 ?? 칸.값 }}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      class="mt-4 flex h-12 w-full items-center justify-between rounded-full bg-inverted pl-5 pr-1.5 text-[15px] font-semibold text-inverted transition-all hover:opacity-90 active:scale-[.99]"
                    >
                      신청하기
                      <span class="flex size-9 items-center justify-center rounded-full bg-default/15">
                        <UIcon
                          name="i-lucide-arrow-right"
                          class="size-4"
                        />
                      </span>
                    </button>
                    <p class="mt-2.5 text-center text-xs text-dimmed">
                      신청 1명 · 9.24(목)까지 받아요
                    </p>
                  </div>
                </div>
              </aside>
            </div>

            <!-- 폰: 가운데 떠 있는 알약 하나 -->
            <div class="pointer-events-none sticky bottom-5 z-10 flex justify-center px-5 @3xl:hidden">
              <button
                type="button"
                class="pointer-events-auto flex h-14 items-center gap-3 rounded-full bg-inverted pl-2 pr-6 text-[15px] font-semibold text-inverted m-층-모달 active:scale-[.98]"
              >
                <span class="flex h-10 items-center rounded-full bg-default px-3 text-[13px] font-bold text-amber-700 dark:text-amber-300">
                  D-{{ 상세.남은날 }}
                </span>
                무료로 신청하기
              </button>
            </div>
          </div>
        </div>

        <!-- ── 티켓 안의 거르기 시트 — 폰은 아래에서 올라오고, 넓으면 알약 줄 곁에 뜬다 ── -->
        <template v-if="화면 === '목록' && 목록안키 === '티켓' && is시트">
          <button
            type="button"
            class="absolute inset-0 z-20 bg-black/40 @3xl/frame:bg-black/10"
            aria-label="닫기"
            @click="is시트 = false"
          />
          <div
            data-시트
            class="absolute inset-x-0 bottom-0 z-30 rounded-t-[28px] bg-default px-5 pb-5 pt-2.5 m-층-모달 @3xl/frame:inset-x-auto @3xl/frame:bottom-auto @3xl/frame:right-10 @3xl/frame:top-[168px] @3xl/frame:w-[400px] @3xl/frame:rounded-[28px] @3xl/frame:pt-5"
          >
            <span class="mx-auto block h-1.5 w-10 rounded-full bg-accented @3xl/frame:hidden" />
            <div class="mt-3 flex items-center justify-between @3xl/frame:mt-0">
              <p class="text-lg font-bold tracking-tight text-highlighted">
                거르기
              </p>
              <button
                type="button"
                class="text-sm font-medium text-muted hover:text-highlighted"
                @click="do조건지우기"
              >
                모두 지우기
              </button>
            </div>
            <div class="mt-4 space-y-5">
              <div
                v-for="축 in 시트축s"
                :key="축.이름"
              >
                <p class="text-[13px] font-medium text-muted">
                  {{ 축.이름 }}
                </p>
                <div class="mt-2 flex flex-wrap gap-2">
                  <button
                    v-for="값 in 축.값s"
                    :key="값"
                    type="button"
                    class="h-10 rounded-full px-4 text-sm font-medium transition-colors"
                    :class="축.현재.value === 값 ? 'bg-inverted text-inverted' : 'bg-elevated text-default hover:bg-accented'"
                    @click="축.현재.value = 값"
                  >
                    {{ 값 }}
                  </button>
                </div>
              </div>
            </div>
            <button
              type="button"
              class="mt-6 flex h-12 w-full items-center justify-center rounded-full bg-inverted text-[15px] font-semibold text-inverted"
              @click="is시트 = false"
            >
              {{ 걸러진s.length }}개 보기
            </button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  제목: '신청 목록·상세 · 새 판'
})

// ─────────────────────────────────────────────────────────────────────────────
// 표본 — 지어낸 정적 값. 오늘은 2026-09-14(월)로 고정한다.
// ─────────────────────────────────────────────────────────────────────────────

type i종류 = '행사' | '수업' | '설문' | '퀴즈'

interface i표본 {
  id: number
  제목: string
  종류: i종류
  설명: string
  /** 마감까지 남은 날. 닫혔으면 null */
  남은날: number | null
  /** 닫힌 것의 마감일(오늘 기준 며칠 전) */
  지난날?: number
  일시: string
  장소: string
  신청수: number
  /** null = 제한 없음 */
  정원: number | null
  요금: number
}

const 표본s: i표본[] = [
  { id: 1, 제목: '명부 정리 1:1 상담의 날', 종류: '행사', 설명: '우리 협회 명부를 들고 오면 실무팀이 한 시간씩 같이 봅니다. 한 협회 한 자리.', 남은날: 3, 일시: '9.26(토) 14:00', 장소: '마장터 작업실', 신청수: 11, 정원: 12, 요금: 0 },
  { id: 2, 제목: '신입 회원 오리엔테이션', 종류: '행사', 설명: '처음 온 식구에게 팀이 일하는 방식, 도울 협회 목록, 연락 채널을 소개합니다.', 남은날: 5, 일시: '9.23(수) 19:30', 장소: '온라인 · Zoom', 신청수: 0, 정원: 26, 요금: 0 },
  { id: 3, 제목: '회원관리 실무 집중 과정 (4주)', 종류: '수업', 설명: '명부 설계부터 회비·출석 기록까지 네 번에 나눠 직접 만들어 봅니다. 교재비 포함.', 남은날: 8, 일시: '10.5(월)부터 매주', 장소: '온라인 · Zoom', 신청수: 9, 정원: 20, 요금: 40000 },
  { id: 4, 제목: '10월 정기 모임 — 회원 명부 이관 사례 공유', 종류: '행사', 설명: '지난달 명부를 옮긴 세 협회가 무엇이 막혔고 어떻게 풀었는지 이야기합니다.', 남은날: 10, 일시: '10.8(목) 19:30', 장소: '온라인 · Zoom', 신청수: 14, 정원: null, 요금: 0 },
  { id: 9, 제목: '회원 명부 정비 워크숍 — 개인정보보호법 실무', 종류: '수업', 설명: '흩어진 명부를 한 곳에 모으면서 법이 요구하는 최소한을 같이 챙깁니다.', 남은날: 10, 일시: '10.11(일) 10:00', 장소: '온라인 · Zoom', 신청수: 1, 정원: 30, 요금: 0 },
  { id: 5, 제목: '토론: 2027년 지원 협회 선정 기준', 종류: '행사', 설명: '내년에 어느 협회부터 도울지, 기준 초안을 두고 식구들 의견을 모읍니다.', 남은날: 23, 일시: '10.14(수) 19:30', 장소: '마장터 작업실', 신청수: 0, 정원: 25, 요금: 0 },
  { id: 6, 제목: '2026 하반기 교육 과정', 종류: '수업', 설명: '10월부터 12월까지 격주로 여는 기초 과정 묶음. 한 번만 신청하면 전부 들을 수 있어요.', 남은날: 23, 일시: '10.12 – 12.14', 장소: '온라인 · Zoom', 신청수: 6, 정원: null, 요금: 0 },
  { id: 7, 제목: '총회 전자투표 운영 실습', 종류: '수업', 설명: '가상 총회를 열어 안건 등록부터 투표 결과 공지까지 한 바퀴 돌려 봅니다.', 남은날: 24, 일시: '10.17(토) 10:00', 장소: '마장터 작업실', 신청수: 0, 정원: 16, 요금: 0 },
  { id: 8, 제목: '지원 프로젝트 종료 평가 — 전국독서지도사협회', 종류: '설문', 설명: '반년 동안 함께한 프로젝트를 돌아봅니다. 12문항, 10분 남짓.', 남은날: 27, 일시: '언제든 · 10분', 장소: '온라인', 신청수: 3, 정원: null, 요금: 0 },
  { id: 10, 제목: '협회 디지털 준비도 진단', 종류: '설문', 설명: '우리 협회가 어디까지 와 있는지 스스로 점검하는 진단. 결과는 바로 보여 드려요.', 남은날: 30, 일시: '언제든 · 7분', 장소: '온라인', 신청수: 12, 정원: null, 요금: 0 },
  { id: 11, 제목: '협회 실무 이해도 진단', 종류: '퀴즈', 설명: '회비·명부·총회 실무를 20문항으로 가볍게 확인합니다.', 남은날: 55, 일시: '언제든 · 15분', 장소: '온라인', 신청수: 5, 정원: null, 요금: 0 },
  { id: 12, 제목: '2027년 회원 활동 수요 조사', 종류: '설문', 설명: '내년에 어떤 모임과 수업이 있으면 좋을지 알려 주세요.', 남은날: 60, 일시: '언제든 · 5분', 장소: '온라인', 신청수: 21, 정원: null, 요금: 0 },
  { id: 13, 제목: '개인정보 취급자 교육 이수 평가', 종류: '퀴즈', 설명: '교육을 들은 뒤 15문항을 풀면 이수 확인서를 받을 수 있어요.', 남은날: 70, 일시: '언제든 · 15분', 장소: '온라인', 신청수: 2, 정원: null, 요금: 0 },
  { id: 14, 제목: '2026 정기총회 · 활동 보고회', 종류: '행사', 설명: '한 해 동안 도운 협회와 남은 일을 나누고, 내년 계획을 함께 정합니다.', 남은날: 73, 일시: '11.28(토) 14:00', 장소: '서울 · 장소 추후 안내', 신청수: 0, 정원: 80, 요금: 0 },
  { id: 15, 제목: '9월 번개 모임 — 회비 수납 이야기', 종류: '행사', 설명: '회비를 어떻게 걷고 기록하는지, 협회마다의 방법을 나눴어요.', 남은날: null, 지난날: 2, 일시: '9.18(금) 19:30', 장소: '마장터 작업실', 신청수: 20, 정원: 20, 요금: 0 }
]

/** 상세 표본 — 목록의 id 9 와 같은 것. 실화면의 마크다운 본문을 칸으로 풀어 적었다. */
const 상세 = {
  제목: '회원 명부 정비 워크숍',
  부제: '개인정보보호법 실무',
  요약: '엑셀·수기로 흩어진 회원 명부를 한 곳에 모으면서, 개인정보보호법이 협회에 요구하는 최소한을 같이 챙깁니다. 세 시간 동안 우리 협회 명부를 직접 고쳐 봅니다.',
  남은날: 10,
  신청수: 1,
  정원: 30,
  진행이: '정은서',
  대상s: [
    '회원 명부를 엑셀 여러 벌로 나눠 관리하고 있는 협회 실무자',
    '동의서·파기 기록을 어떻게 남겨야 할지 막막한 분',
    '곧 회원관리 시스템으로 명부를 옮길 계획이 있는 협회'
  ],
  순서s: [
    { 때: '10:00', 이름: '1부 · 우리 명부 진단', 글: '지금 명부에 무엇이 있고 무엇이 없어야 하는지 체크리스트로 훑습니다.' },
    { 때: '11:00', 이름: '2부 · 법이 요구하는 최소한', 글: '수집·이용 동의, 보관 기간, 파기 기록 — 협회 규모에 맞는 선만 짚습니다.' },
    { 때: '12:00', 이름: '3부 · 함께 고쳐 보기', 글: '각자 명부 사본을 열어 항목을 정리하고, 남은 질문을 받습니다.' }
  ],
  준비물s: ['노트북', '명부 사본(이름·연락처를 가린 것)', 'Zoom 링크 — 신청하면 문자로 보내요'],
  알림: '명부 원본은 올리거나 화면에 띄우지 마세요. 워크숍에서는 개인정보를 가린 사본으로 충분합니다.'
}

// ─────────────────────────────────────────────────────────────────────────────
// 판 손잡이
// ─────────────────────────────────────────────────────────────────────────────

type i목록안키 = '묶음' | '카드' | '티켓'
type i상세안키 = '머리' | '잡지'

interface i안 { 키: string, 이름: string, 왜: string, 대가: string }

const 목록안s: i안[] = [
  {
    키: '묶음',
    이름: 'A · 마감 묶음',
    왜: '목록을 「이번 주 · 이번 달 · 10월부터」로 끊고, 줄 머리의 날 타일이 급할수록 진해진다(7일 안 장미 · 14일 안 호박 · 그 뒤는 회색 작은 글자). 칩 세 줄은 종류 한 줄로 줄였고, 자리·요금은 뜻이 있을 때(거의 찼다 · 유료)만 뱃지로 뜬다. 줄 전체가 누르는 곳이라 버튼 15개가 사라진다.',
    대가: '신청받기·요금 축이 화면에서 빠진다 — 무료만 보고 싶은 사람은 못 거른다. 마감 순이 고정이라 「새로 열린 것」을 찾는 사람에겐 맞지 않는다.'
  },
  {
    키: '카드',
    이름: 'B · 파스텔 카드',
    왜: '종류마다 파스텔 머리(행사 분홍 · 수업 남색 · 설문 초록 · 퀴즈 노랑)를 둬서 스크롤하면서도 무엇인지 색으로 읽힌다. 제목은 「—」에서 두 줄로 나눠 잘리지 않고, 카드 바닥에 요금·자리 한 줄과 검은 알약 하나 — 설문이면 「응답하기」, 퀴즈면 「풀어 보기」로 동사가 바뀐다.',
    대가: '카드 한 장이 커서 폰에서 한 화면에 1.5장 — 15건을 훑는 데 스크롤이 길다. 버튼이 카드마다 있으니 「줄마다 버튼」 소음이 모양만 바꿔 남는다.'
  },
  {
    키: '티켓',
    이름: 'C · 티켓',
    왜: '거르기를 알약 줄 하나로 접고(걸린 조건만 칩으로, 누르면 풀린다) 나머지는 아래 시트로 보냈다 — 폰 첫 화면에 티켓 다섯 장이 든다. 떼는 쪽(왼쪽)에 D-day 와 마감일, 몸통에 제목·요금·급한 자리. 알약 줄은 스크롤해도 위에 붙는다.',
    대가: '종류가 한 번 더 누른 시트 안에 있어 「수업만」이 두 번 누름이다. 티켓 홈(mask)이 그림자를 잘라서 이 안만 카드 층 그림자가 없다.'
  }
]

const 상세안s: i안[] = [
  {
    키: '머리',
    이름: 'A · 파스텔 머리',
    왜: '파스텔 구름 머리에 종류·상태 칩, 두 줄 큰 제목, 핵심 사실(마감 · 일시 · 장소 · 요금 · 자리)을 알약으로 늘어놓아 본문 전에 판단이 끝난다. 폰은 「무료 · 29자리 남음 / D-10」 행동 줄이 화면 아래에 붙어서 첫 화면부터 신청하기가 보인다.',
    대가: '머리가 폰 첫 화면의 절반을 쓴다. 사실 알약과 오른쪽 카드가 같은 값을 두 번 말한다(넓은 화면).'
  },
  {
    키: '잡지',
    이름: 'B · 잡지',
    왜: '글이 긴 수업·행사를 읽을거리로 대접한다 — 큰 제목, 큰 첫 문단, 진행이, 01·02·03 번호 단락과 인용 한 줄. 넓으면 오른쪽에 달력 타일이 달린 요약 카드가 떠서 따라오고, 폰은 제목 밑 네 칸 요약 + 가운데 떠 있는 「D-10 무료로 신청하기」 알약.',
    대가: '인용·진행이 같은 칸은 본문 마크다운이 안 주는 값이라 운영자가 채울 칸이 는다. 설문·퀴즈처럼 짧은 것엔 잡지 틀이 헐겁다.'
  }
]

const 화면 = ref<'목록' | '상세'>('목록')
const 폭 = ref<'넓게' | '폰'>('넓게')
const 목록안키 = ref<i목록안키>('묶음')
const 상세안키 = ref<i상세안키>('머리')

const 지금안s = computed(() => (화면.value === '목록' ? 목록안s : 상세안s))
const 지금안키 = computed(() => (화면.value === '목록' ? 목록안키.value : 상세안키.value))
const 판 = computed(() => 지금안s.value.find(안 => 안.키 === 지금안키.value)!)

const do안고르기 = (키: string) => {
  if (화면.value === '목록') 목록안키.value = 키 as i목록안키
  else 상세안키.value = 키 as i상세안키
}

const 손잡이s = computed(() => [
  { 이름: '화면', 값s: ['목록', '상세'], 현재: 화면 as Ref<string> },
  { 이름: '폭', 값s: ['넓게', '폰'], 현재: 폭 as Ref<string> }
])

// ─────────────────────────────────────────────────────────────────────────────
// 거르기 — 판 안에서만 진짜로 걸린다
// ─────────────────────────────────────────────────────────────────────────────

const 종류필터 = ref<'전체' | i종류>('전체')
const 상태필터 = ref<'전체' | '신청받는 중' | '마감'>('전체')
const 요금필터 = ref<'전체' | '무료' | '유료'>('전체')
const 정렬 = ref<'마감순' | '가나다'>('마감순')
const 검색 = ref('')
const is시트 = ref(false)

const 걸러진s = computed(() => {
  const 걸린 = 표본s.filter(항목 =>
    (종류필터.value === '전체' || 항목.종류 === 종류필터.value)
    && (상태필터.value === '전체' || (상태필터.value === '마감') === (항목.남은날 === null))
    && (요금필터.value === '전체' || (요금필터.value === '유료') === (항목.요금 > 0))
    && (!검색.value.trim() || 항목.제목.includes(검색.value.trim())))
  return [...걸린].sort(정렬.value === '가나다'
    ? (a, b) => a.제목.localeCompare(b.제목, 'ko')
    : (a, b) => (a.남은날 ?? 999) - (b.남은날 ?? 999))
})

const 열린수 = 표본s.filter(항목 => 항목.남은날 !== null).length

const 종류탭s = computed(() => [
  { 이름: '전체' as const, 수: 표본s.length, 아이콘: '' },
  ...(['행사', '수업', '설문', '퀴즈'] as const).map(이름 => ({
    이름,
    수: 표본s.filter(항목 => 항목.종류 === 이름).length,
    아이콘: 종류표[이름].아이콘
  }))
])

const 걸린조건s = computed(() => [
  종류필터.value !== '전체' && { 이름: '종류', 값: 종류필터.value, 지우기: () => { 종류필터.value = '전체' } },
  상태필터.value !== '전체' && { 이름: '상태', 값: 상태필터.value, 지우기: () => { 상태필터.value = '전체' } },
  요금필터.value !== '전체' && { 이름: '요금', 값: 요금필터.value, 지우기: () => { 요금필터.value = '전체' } }
].filter(x => !!x))

const 시트축s = computed(() => [
  { 이름: '종류', 값s: ['전체', '행사', '수업', '설문', '퀴즈'], 현재: 종류필터 as Ref<string> },
  { 이름: '신청받기', 값s: ['전체', '신청받는 중', '마감'], 현재: 상태필터 as Ref<string> },
  { 이름: '요금', 값s: ['전체', '무료', '유료'], 현재: 요금필터 as Ref<string> },
  { 이름: '정렬', 값s: ['마감순', '가나다'], 현재: 정렬 as Ref<string> }
])

const do조건지우기 = () => {
  종류필터.value = '전체'
  상태필터.value = '전체'
  요금필터.value = '전체'
  정렬.value = '마감순'
}

/** A 의 묶음. 이번 주 = 이번 일요일(9.20)까지, 이번 달 = 9.30 까지. 닫힌 것은 맨 끝에 흐리게. */
const 마감묶음s = computed(() => {
  const 항목s = [...걸러진s.value].sort((a, b) => (a.남은날 ?? 999) - (b.남은날 ?? 999))
  return [
    { 이름: '이번 주', 설명: '9.20(일)까지', 항목s: 항목s.filter(x => x.남은날 !== null && x.남은날 <= 6) },
    { 이름: '이번 달', 설명: '9.30(수)까지', 항목s: 항목s.filter(x => x.남은날 !== null && x.남은날 > 6 && x.남은날 <= 16) },
    { 이름: '10월부터', 설명: '넉넉해요', 항목s: 항목s.filter(x => x.남은날 !== null && x.남은날 > 16) },
    { 이름: '마감됐어요', 설명: '다음 회차를 기다려 주세요', 항목s: 항목s.filter(x => x.남은날 === null) }
  ].filter(묶음 => 묶음.항목s.length)
})

// ─────────────────────────────────────────────────────────────────────────────
// 글·색 도우미
// ─────────────────────────────────────────────────────────────────────────────

const 요일s = '일월화수목금토'
const 날짜of = (오늘부터: number) => {
  const 날 = new Date(2026, 8, 14 + 오늘부터)
  return `${날.getMonth() + 1}.${날.getDate()}(${요일s[날.getDay()]})`
}
const 마감일 = (항목: i표본) => (항목.남은날 === null ? `${날짜of(-(항목.지난날 ?? 0))}` : `${날짜of(항목.남은날)}`)
const 디데이 = (항목: i표본) => (항목.남은날 === null ? '마감' : 항목.남은날 === 0 ? '오늘' : `D-${항목.남은날}`)
const 원 = (값: number) => `${값.toLocaleString('ko-KR')}원`
const 제목앞 = (제목: string) => 제목.split(' — ')[0]
const 제목뒤 = (제목: string) => 제목.split(' — ')[1] ?? ''
const 행동말 = (항목: i표본) => ({ 행사: '신청하기', 수업: '신청하기', 설문: '응답하기', 퀴즈: '풀어 보기' })[항목.종류]

type i급함 = '급함' | '곧' | '여유' | '마감'
/** 색은 급할 때만 — 여유 있는 D-30 이 튀면 정작 D-3 이 묻힌다. */
const 급함of = (항목: i표본): i급함 =>
  항목.남은날 === null ? '마감' : 항목.남은날 <= 7 ? '급함' : 항목.남은날 <= 14 ? '곧' : '여유'

const 급함표: Record<i급함, { 색: string | null, 글: string }> = {
  급함: { 색: '#FECDD3', 글: 'text-rose-700 dark:text-rose-300' },
  곧: { 색: '#FDE68A', 글: 'text-amber-700 dark:text-amber-300' },
  여유: { 색: null, 글: 'text-default' },
  마감: { 색: null, 글: 'text-dimmed' }
}

/** 종류 색. 파스텔은 바탕에만 섞고, 글자는 테마 짝(`dark:`)이 있는 색만 쓴다. */
const 종류표: Record<i종류, { 아이콘: string, 색: string, 글: string }> = {
  행사: { 아이콘: 'i-lucide-party-popper', 색: '#FBCFE8', 글: 'text-pink-700 dark:text-pink-300' },
  수업: { 아이콘: 'i-lucide-graduation-cap', 색: '#C7D2FE', 글: 'text-indigo-700 dark:text-indigo-300' },
  설문: { 아이콘: 'i-lucide-clipboard-list', 색: '#A7F3D0', 글: 'text-emerald-700 dark:text-emerald-300' },
  퀴즈: { 아이콘: 'i-lucide-circle-help', 색: '#FDE68A', 글: 'text-amber-700 dark:text-amber-300' }
}

/**
 * 자리는 뜻이 있을 때만 말한다. 0/26 막대는 소음이라 안 그린다 —
 * 거의 찼을 때(5자리 이하 또는 20% 이하)만 급함, 나머지는 정원만 조용히.
 */
const 자리of = (항목: i표본) => {
  if (항목.정원 === null) return null
  const 남은 = 항목.정원 - 항목.신청수
  if (남은 <= 0) return { 글: '정원 마감', is급함: false }
  if (남은 <= 5 || 남은 / 항목.정원 <= 0.2) return { 글: `${남은}자리 남음`, is급함: true }
  return { 글: `${항목.정원}명까지`, is급함: false }
}

/**
 * 파스텔은 `--ui-bg` 에 섞는다. 섞는 양에 `--파스텔`(라이트 1 · 다크 0.3, 틀 뿌리에 적음)을 곱한다 —
 * 다크 바탕에 라이트만큼 섞으면 흙빛이 된다(로그인 창 판에서 실측).
 */
const 파스텔 = (색: string, 양 = 55, 바탕 = 'var(--ui-bg)') => `color-mix(in oklab, ${색} calc(${양}% * var(--파스텔, 1)), ${바탕})`

/**
 * 날짜 타일 바탕. 급함·곧은 **다크에서 파스텔을 섞지 않고 진한 색을 옅게 깐다** — 연분홍·연노랑을
 * 다크의 slate 에 섞으면 회보라·올리브가 돼서 급함이 안 읽혔다(실측).
 */
const 날타일칠: Record<i급함, string> = {
  급함: 'bg-rose-100 dark:bg-rose-500/20',
  곧: 'bg-amber-100 dark:bg-amber-400/15',
  여유: 'bg-elevated dark:bg-muted',
  마감: 'bg-elevated dark:bg-muted'
}

/**
 * 카드 머리 — 아래 끝을 바탕색으로 녹여 본문과 경계선이 안 생긴다.
 * 파스텔은 `elevated` 에 섞는다 — 다크에서 거의 검은 바탕에 섞으면 분홍이 흙빛이 됐다(실측).
 */
const 카드머리칠 = (항목: i표본) => [
  'linear-gradient(to bottom, transparent 40%, var(--ui-bg) 100%)',
  `radial-gradient(80% 120% at 100% 100%, ${파스텔('#FFFFFF', 30)}, transparent 70%)`,
  파스텔(종류표[항목.종류].색, 80, 'var(--ui-bg-elevated)')
].join(', ')

/** 티켓 홈 — 떼는 줄(78px) 위아래를 반원으로 판다. */
const 티켓홈 = 'radial-gradient(circle 8px at 78px 0, #0000 97%, #000) top / 100% 51% no-repeat, radial-gradient(circle 8px at 78px 100%, #0000 97%, #000) bottom / 100% 51% no-repeat'

const 머리칠 = [
  /** 끝을 90% 에 둔다 — 1배율에서 밑단이 반 픽셀 걸쳐 선이 보였다(로그인 창 판 실측). */
  'linear-gradient(to bottom, transparent 55%, var(--ui-bg) 92%)',
  `radial-gradient(55% 70% at 10% 0%, ${파스텔('#C7D2FE', 90)}, transparent 70%)`,
  `radial-gradient(45% 60% at 90% 10%, ${파스텔('#FBCFE8', 80)}, transparent 70%)`,
  `radial-gradient(60% 70% at 60% 60%, ${파스텔('#BAE6FD', 60)}, transparent 70%)`,
  파스텔('#E0E7FF', 55)
].join(', ')

const 인용칠 = [
  `radial-gradient(60% 100% at 0% 0%, ${파스텔('#C7D2FE', 80)}, transparent 70%)`,
  `radial-gradient(50% 100% at 100% 100%, ${파스텔('#FBCFE8', 70)}, transparent 70%)`,
  파스텔('#EEF2FF', 60)
].join(', ')

const 요약머리칠 = [
  'linear-gradient(to bottom, transparent 50%, var(--ui-bg) 100%)',
  `radial-gradient(70% 90% at 0% 0%, ${파스텔('#C7D2FE', 85)}, transparent 70%)`,
  `radial-gradient(60% 80% at 100% 20%, ${파스텔('#FBCFE8', 70)}, transparent 70%)`,
  파스텔('#EEF2FF', 60)
].join(', ')

const 판바탕 = `radial-gradient(40% 50% at 20% 30%, ${파스텔('#C7D2FE', 30)}, transparent), radial-gradient(40% 50% at 80% 70%, ${파스텔('#FBCFE8', 30)}, transparent), var(--ui-bg-muted)`

const 사실s: { 아이콘: string, 글: string, 칠?: string }[] = [
  { 아이콘: 'i-lucide-hourglass', 글: `D-${상세.남은날} · 9.24(목) 마감`, 칠: 'text-amber-700 dark:text-amber-300' },
  { 아이콘: 'i-lucide-calendar', 글: '10.11(일) 10:00–13:00' },
  { 아이콘: 'i-lucide-video', 글: '온라인 · Zoom' },
  { 아이콘: 'i-lucide-wallet', 글: '무료' },
  { 아이콘: 'i-lucide-users', 글: `${상세.정원 - 상세.신청수}자리 남음 · 정원 ${상세.정원}` }
]

const 요약줄s = [
  { 아이콘: 'i-lucide-calendar', 이름: '일시', 값: '10.11(일) 10:00–13:00' },
  { 아이콘: 'i-lucide-video', 이름: '장소', 값: '온라인 · Zoom' },
  { 아이콘: 'i-lucide-wallet', 이름: '요금', 값: '무료' },
  { 아이콘: 'i-lucide-users', 이름: '자리', 값: `${상세.정원 - 상세.신청수}자리 남음 (정원 ${상세.정원})` }
]

const 요약칸s: { 이름: string, 값: string, 짧게?: string, 칠?: string }[] = [
  { 이름: '마감', 값: `D-${상세.남은날} · 9.24`, 짧게: `D-${상세.남은날}`, 칠: 'text-amber-700 dark:text-amber-300' },
  { 이름: '일시', 값: '10.11(일) 10시' },
  { 이름: '자리', 값: `${상세.정원 - 상세.신청수}자리 남음`, 짧게: `${상세.정원 - 상세.신청수}자리` },
  { 이름: '요금', 값: '무료' }
]
</script>

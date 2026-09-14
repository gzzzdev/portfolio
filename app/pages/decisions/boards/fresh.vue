<!--
  **소통 게시판(공지 · Q&A · 소식)을 산뜻하게 다시 세우면**의 판. 실화면은 안 건드린다.

  ## 이 판이 답하는 물음

  지금 `/boards/notice` 는 세 게시판이 **같은 줄 한 벌**(작은 그림 · 제목 · 작성자 · 날짜 · 조회)을 쓴다.
  작성자 열은 줄마다 같은 사람이라 열 하나를 통째로 먹고, 구분은 제목 앞 `[모집]` 대괄호 글자라
  고정·새 글·중요가 모양으로 안 갈린다. 상세는 무거운 2열 표와 동떨어진 「♥ 1」, 딱딱한 댓글 상자다.
  물음은 — **공지·질문·소식이 각자 제 모양을 가지면서도 한 식구로 읽히게 하려면.**

  ## 판 읽는 법

  - 값은 전부 **표본**이다(`_소통표본.ts`). 구분·고정·답·사진이 데이터로 있다고 치고 그린다 — 실코드에 아직 없는 칸이다.
  - 사진 파일은 리포에 없다 — **파스텔 구름 면**으로 사진 자리의 무게만 본다.
  - 「폭」 손잡이의 `폰` 은 390px 틀에 담는다. 안의 반응형은 전부 **컨테이너 쿼리**(`@container` · `@md:` · `@lg:` …)라
    창 폭이 아니라 틀 폭을 따른다 — 그래서 넓은 모니터에서도 폰 모양이 진짜로 선다. 옮길 땐 `@` 를 떼면 된다.
  - 방향은 로그인 창 판(`/decisions/login-modal`)에서 고른 「구름」이다. 파스텔은 `--ui-bg` 에 섞고
    다크에서 섞는 양을 줄였다(`--파스텔`). 구분 알약의 빛깔(`톤s`)은 테마 축을 안 탄다 — 고르면 예외로 이름 붙일 것.
  - 목록 세 안은 모두 탭 셋을 스스로 그린다 — 탭 모양이 곧 안의 성격이라서. 판 위 「탭」 손잡이와 같은 값이다.
-->
<template>
  <div class="mx-auto w-full max-w-(--ui-container) px-4 py-8">
    <header class="mb-5">
      <h1 class="text-2xl font-semibold text-highlighted">
        소통 게시판 · 목록 셋 상세 둘
      </h1>
      <p class="mt-1 text-sm text-muted">
        같은 표본(공지 6 · Q&A 5 · 소식 5) · 세 게시판이 제 모양을 가지면서 한 식구로 읽히게
      </p>
    </header>

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

    <div class="mb-4 flex flex-wrap items-center gap-2">
      <mButton
        v-for="안 in 지금안s"
        :key="안.키"
        size="sm"
        역할="조용"
        :켜짐="지금안키 === 안.키"
        :label="안.이름"
        @click="지금안키 = 안.키"
      />
    </div>

    <div class="mb-5 rounded-lg border border-default bg-muted px-4 py-3 text-sm leading-relaxed">
      <p><span class="text-dimmed">왜 ·</span> {{ 판.왜 }}</p>
      <p class="mt-1">
        <span class="text-dimmed">대가 ·</span> {{ 판.대가 }}
      </p>
    </div>

    <!-- ── 판 ─────────────────────────────────────────────────────── -->
    <div
      class="rounded-xl border border-default p-3 sm:p-8 [--파스텔:1] [--사진:1] dark:[--파스텔:0.3] dark:[--사진:0.6]"
      :style="{ background: 판바탕 }"
    >
      <div
        data-보드
        class="@container mx-auto overflow-hidden break-keep bg-default text-default"
        :class="폭 === '폰'
          ? 'w-[390px] max-w-full rounded-[36px] ring-1 ring-(--ui-border-accented) m-층-모달'
          : 'w-full rounded-[28px] ring-1 ring-default m-층-카드'"
      >
        <!-- ══ 목록 A · 구름 머리 ═══════════════════════════════════ -->
        <template v-if="화면 === '목록' && 목록안키 === '구름'">
          <div
            class="px-5 pb-6 pt-8 @lg:px-10 @lg:pb-8 @lg:pt-12"
            :style="{ background: 머리구름 }"
          >
            <p class="text-xs font-semibold text-muted">
              마장터 소통
            </p>
            <h2 class="mt-1 text-[28px] font-bold tracking-tight text-highlighted @lg:text-4xl">
              {{ 탭.이름 }}
            </h2>
            <p class="mt-1.5 text-sm text-muted">
              {{ 탭.설명 }}
            </p>
            <div class="mt-6 flex flex-col gap-3 @2xl:flex-row @2xl:items-center">
              <div class="flex self-start rounded-full bg-default/80 p-1 ring-1 ring-default backdrop-blur">
                <button
                  v-for="t in 탭s"
                  :key="t.키"
                  type="button"
                  class="flex h-9 items-center gap-1.5 rounded-full px-4 text-sm font-medium transition-colors"
                  :class="탭키 === t.키 ? 'bg-inverted text-inverted' : 'text-muted hover:text-highlighted'"
                  @click="탭키 = t.키"
                >
                  {{ t.이름 }}
                  <span class="text-xs tabular-nums opacity-60">{{ t.수 }}</span>
                </button>
              </div>
              <label class="flex h-11 items-center gap-2 rounded-full bg-default px-4 ring-1 ring-default @2xl:ml-auto @2xl:w-72">
                <UIcon
                  name="i-lucide-search"
                  class="size-4 shrink-0 text-dimmed"
                />
                <input
                  type="search"
                  :placeholder="`${탭.이름}에서 찾기`"
                  class="min-w-0 flex-1 bg-transparent text-sm text-highlighted outline-none placeholder:text-dimmed"
                >
              </label>
            </div>
          </div>

          <div class="px-5 pb-8 @lg:px-10 @lg:pb-12">
            <!-- 공지 — 고정 글은 머리 카드, 나머지는 맑은 줄 -->
            <template v-if="탭키 === '공지'">
              <button
                type="button"
                class="block w-full rounded-[28px] p-6 text-left transition-transform active:scale-[.995] @lg:p-8"
                :style="{ background: 고정칠 }"
              >
                <div class="flex items-center gap-2">
                  <span class="inline-flex h-6 items-center gap-1 rounded-full bg-default/70 px-2.5 text-xs font-medium text-highlighted">
                    <UIcon
                      name="i-lucide-pin"
                      class="size-3.5"
                    />
                    고정
                  </span>
                  <P알약 :구분="고정.구분" />
                  <span class="ml-auto inline-flex h-7 items-center rounded-full bg-inverted px-3 text-xs font-bold tabular-nums text-inverted">
                    D-{{ 고정.마감?.남은날 }}
                  </span>
                </div>
                <h3 class="mt-5 text-xl font-bold tracking-tight text-highlighted @lg:text-[26px]">
                  {{ 고정.제목 }}
                </h3>
                <p class="mt-2 max-w-xl text-sm leading-6 text-muted @lg:text-[15px]">
                  {{ 고정.요약 }}
                </p>
                <div class="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
                  <span class="inline-flex h-10 items-center gap-1.5 rounded-full bg-inverted px-5 text-sm font-semibold text-inverted">
                    자세히 보기
                    <UIcon
                      name="i-lucide-arrow-right"
                      class="size-4"
                    />
                  </span>
                  <span class="text-xs text-muted">{{ 고정.마감?.날 }} 마감 · 조회 {{ 고정.조회.toLocaleString() }}</span>
                </div>
              </button>

              <ul class="mt-4 divide-y divide-(--ui-border)">
                <li
                  v-for="공 in 보통공지s"
                  :key="공.id"
                >
                  <button
                    type="button"
                    class="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1.5 py-4 text-left @xl:grid-cols-[4.25rem_minmax(0,1fr)_auto]"
                  >
                    <P알약
                      :구분="공.구분"
                      class="col-span-2 justify-self-start @xl:col-span-1"
                    />
                    <span class="min-w-0">
                      <span class="flex items-center gap-2">
                        <span class="truncate text-[15px] font-semibold text-highlighted">{{ 공.제목 }}</span>
                        <span
                          v-if="공.is새글"
                          class="flex size-5 shrink-0 items-center justify-center rounded-full bg-pink-500 text-[10px] font-bold text-white"
                        >N</span>
                      </span>
                      <span class="mt-0.5 block text-xs text-dimmed @xl:hidden">{{ 공.날짜 }} · 조회 {{ 공.조회 }}</span>
                    </span>
                    <span class="hidden text-right text-xs tabular-nums text-dimmed @xl:block">
                      {{ 공.날짜 }}<span class="ml-3 @3xl:inline hidden">조회 {{ 공.조회 }}</span>
                    </span>
                    <UIcon
                      name="i-lucide-chevron-right"
                      class="size-4 text-dimmed @xl:hidden"
                    />
                  </button>
                </li>
              </ul>
            </template>

            <!-- Q&A — 답이 달렸나가 먼저, 답은 한 줄 미리 -->
            <template v-else-if="탭키 === 'Q&A'">
              <div class="flex items-center gap-2">
                <span class="text-sm text-muted">답변 완료 <b class="font-semibold text-highlighted">{{ 답한수 }}</b></span>
                <span class="text-dimmed">·</span>
                <span class="text-sm text-muted">기다리는 중 <b class="font-semibold text-highlighted">{{ 질문s.length - 답한수 }}</b></span>
                <span class="ml-auto inline-flex h-9 items-center gap-1.5 rounded-full bg-inverted px-4 text-sm font-semibold text-inverted">
                  <UIcon
                    name="i-lucide-pencil"
                    class="size-4"
                  />
                  질문하기
                </span>
              </div>
              <ul class="mt-4 space-y-3">
                <li
                  v-for="q in 질문s"
                  :key="q.id"
                  class="rounded-3xl bg-default p-5 ring-1 ring-default m-층-카드"
                >
                  <div class="flex items-center gap-2">
                    <P답상태 :is답="!!q.답" />
                    <P알약 :구분="q.구분" />
                    <span class="ml-auto text-xs text-dimmed">{{ q.날짜 }}</span>
                  </div>
                  <h3 class="mt-3 text-[15px] font-semibold leading-6 text-highlighted @lg:text-base">
                    {{ q.제목 }}
                  </h3>
                  <p class="mt-0.5 text-xs text-muted">
                    {{ q.묻는이 }}
                  </p>
                  <div
                    v-if="q.답"
                    class="mt-4 flex gap-3 rounded-2xl bg-elevated/60 p-3.5"
                  >
                    <span class="flex size-7 shrink-0 items-center justify-center rounded-full bg-inverted text-xs font-bold text-inverted">{{ q.답.누가.slice(-3, -2) }}</span>
                    <div class="min-w-0 text-sm">
                      <p class="text-xs font-semibold text-highlighted">
                        {{ q.답.누가 }}
                      </p>
                      <p class="mt-0.5 line-clamp-2 leading-6 text-muted">
                        {{ q.답.글 }}
                      </p>
                    </div>
                  </div>
                  <div
                    v-else
                    class="mt-4 flex items-center gap-2.5 rounded-2xl border border-dashed border-accented p-3.5 text-sm text-muted"
                  >
                    <UIcon
                      name="i-lucide-hourglass"
                      class="size-4 shrink-0 text-dimmed"
                    />
                    운영진이 곧 답해요 · 보통 하루 안
                  </div>
                </li>
              </ul>
            </template>

            <!-- 소식 — 사진이 주인공인 카드 -->
            <ul
              v-else
              class="grid gap-x-5 gap-y-8 @xl:grid-cols-2 @4xl:grid-cols-3"
            >
              <li
                v-for="n in 소식s"
                :key="n.id"
              >
                <div
                  class="relative aspect-[16/10] overflow-hidden rounded-3xl @xl:aspect-[4/3]"
                  :class="n.사진 ? '' : 'bg-elevated/60'"
                  :style="n.사진 ? { background: 사진칠(n.사진) } : undefined"
                >
                  <span
                    v-if="n.사진"
                    class="absolute bottom-3 left-3 inline-flex h-7 items-center gap-1.5 rounded-full bg-default/80 px-2.5 text-xs font-medium text-highlighted backdrop-blur"
                  >
                    <UIcon
                      name="i-lucide-images"
                      class="size-3.5"
                    />
                    사진 {{ n.사진수 }}
                  </span>
                  <div
                    v-else
                    class="flex h-full flex-col justify-end p-5"
                  >
                    <UIcon
                      name="i-lucide-quote"
                      class="size-6 text-dimmed"
                    />
                    <p class="mt-2 text-[15px] font-semibold leading-6 text-highlighted">
                      {{ n.요약 }}
                    </p>
                  </div>
                </div>
                <div class="mt-3 flex items-center gap-2 px-1">
                  <P알약 :구분="n.구분" />
                  <span class="text-xs text-dimmed">{{ n.날짜 }}</span>
                  <span class="ml-auto inline-flex items-center gap-1 text-xs text-muted">
                    <UIcon
                      name="i-lucide-heart"
                      class="size-3.5"
                    />
                    {{ n.좋아요 }}
                  </span>
                </div>
                <h3 class="mt-2 line-clamp-2 px-1 text-base font-semibold leading-6 tracking-tight text-highlighted">
                  {{ n.제목 }}
                </h3>
              </li>
            </ul>
          </div>
        </template>

        <!-- ══ 목록 B · 곁길 ════════════════════════════════════════ -->
        <div
          v-else-if="화면 === '목록' && 목록안키 === '곁길'"
          class="@3xl:grid @3xl:grid-cols-[16rem_minmax(0,1fr)]"
        >
          <nav
            class="px-5 pt-7 @3xl:border-r @3xl:border-default @3xl:bg-(--ui-bg-muted)/60 @3xl:p-6"
            aria-label="게시판"
          >
            <h2 class="text-2xl font-bold tracking-tight text-highlighted">
              소통
            </h2>
            <p class="mt-1 text-sm text-muted">
              운영 소식과 질문을 한곳에
            </p>
            <div class="mt-5 flex gap-2 @3xl:mt-7 @3xl:flex-col @3xl:gap-1.5">
              <button
                v-for="t in 탭s"
                :key="t.키"
                type="button"
                class="flex min-w-0 flex-1 items-center gap-2 rounded-full p-1 pr-3 text-left transition-colors @3xl:flex-none @3xl:gap-3 @3xl:rounded-2xl @3xl:p-2.5"
                :class="탭키 === t.키 ? 'bg-default ring-1 ring-default m-층-카드' : 'hover:bg-elevated'"
                @click="탭키 = t.키"
              >
                <span
                  class="flex size-8 shrink-0 items-center justify-center rounded-full @3xl:size-10 @3xl:rounded-xl"
                  :class="톤(t.구분).글"
                  :style="{ background: 파스텔(톤(t.구분).색, 탭키 === t.키 ? 60 : 35) }"
                >
                  <UIcon
                    :name="t.아이콘"
                    class="size-4 @3xl:size-5"
                  />
                </span>
                <span class="min-w-0 flex-1">
                  <span class="block truncate text-sm font-semibold text-highlighted">{{ t.이름 }}</span>
                  <span class="hidden truncate text-xs text-muted @3xl:block">{{ t.덧 }}</span>
                </span>
                <span class="text-xs tabular-nums text-dimmed">{{ t.수 }}</span>
              </button>
            </div>
          </nav>

          <div class="min-w-0 px-5 pb-8 pt-7 @3xl:p-8">
            <div class="flex items-center gap-3">
              <h3 class="text-xl font-bold tracking-tight text-highlighted @lg:text-2xl">
                {{ 탭.이름 }}
              </h3>
              <span class="text-sm tabular-nums text-dimmed">{{ 탭.수 }}</span>
              <button
                type="button"
                class="ml-auto flex size-10 items-center justify-center rounded-full bg-elevated/60 text-muted transition-colors hover:text-highlighted"
                aria-label="찾기"
              >
                <UIcon
                  name="i-lucide-search"
                  class="size-[18px]"
                />
              </button>
            </div>

            <!-- 공지 — 고정은 띠, 나머지는 달력 칸과 함께 달별로 -->
            <template v-if="탭키 === '공지'">
              <button
                type="button"
                class="mt-5 flex w-full items-center gap-3 rounded-2xl p-3.5 text-left"
                :style="{ background: 파스텔(톤s.보라.색, 32) }"
              >
                <span class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-default text-indigo-600 dark:text-indigo-300">
                  <UIcon
                    name="i-lucide-pin"
                    class="size-[18px]"
                  />
                </span>
                <span class="min-w-0 flex-1">
                  <span class="block truncate text-[15px] font-semibold text-highlighted">{{ 고정.제목 }}</span>
                  <span class="block text-xs text-muted">{{ 고정.마감?.날 }} 마감 · {{ 고정.마감?.남은날 }}일 남음</span>
                </span>
                <UIcon
                  name="i-lucide-chevron-right"
                  class="size-4 shrink-0 text-muted"
                />
              </button>

              <section
                v-for="묶음 in 달별공지s"
                :key="묶음.달"
                class="mt-7"
              >
                <h4 class="text-xs font-semibold text-dimmed">
                  {{ 묶음.달 }}
                </h4>
                <ul class="mt-2">
                  <li
                    v-for="공 in 묶음.글s"
                    :key="공.id"
                  >
                    <button
                      type="button"
                      class="-mx-2 flex w-[calc(100%+1rem)] items-center gap-4 rounded-2xl px-2 py-2.5 text-left transition-colors hover:bg-elevated"
                    >
                      <span class="flex size-12 shrink-0 flex-col items-center justify-center rounded-2xl bg-elevated/60 leading-none">
                        <span class="text-lg font-bold tabular-nums text-highlighted">{{ 일(공.날짜) }}</span>
                        <span class="mt-1 text-[10px] text-muted">{{ 요일(공.날짜) }}</span>
                      </span>
                      <span class="min-w-0 flex-1">
                        <span class="flex items-center gap-1.5">
                          <P알약
                            :구분="공.구분"
                            작게
                          />
                          <span
                            v-if="공.is새글"
                            class="text-[11px] font-bold text-pink-600 dark:text-pink-300"
                          >새 글</span>
                        </span>
                        <span class="mt-1 block truncate text-[15px] font-medium text-highlighted">{{ 공.제목 }}</span>
                      </span>
                      <span class="hidden shrink-0 text-xs tabular-nums text-dimmed @xl:block">조회 {{ 공.조회 }}</span>
                    </button>
                  </li>
                </ul>
              </section>
            </template>

            <!-- Q&A — 기다리는 질문을 먼저 따로 -->
            <template v-else-if="탭키 === 'Q&A'">
              <section class="mt-5">
                <h4 class="flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-300">
                  <UIcon
                    name="i-lucide-clock"
                    class="size-3.5"
                  />
                  답을 기다려요
                </h4>
                <div
                  v-for="q in 질문s.filter(q => !q.답)"
                  :key="q.id"
                  class="mt-2 rounded-2xl border border-dashed border-accented p-4"
                >
                  <p class="text-[15px] font-semibold leading-6 text-highlighted">
                    {{ q.제목 }}
                  </p>
                  <p class="mt-1 text-xs text-muted">
                    {{ q.묻는이 }} · {{ q.날짜 }}
                  </p>
                </div>
              </section>
              <section class="mt-7">
                <h4 class="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                  <UIcon
                    name="i-lucide-circle-check"
                    class="size-3.5"
                  />
                  답이 달렸어요
                </h4>
                <ul class="mt-1 divide-y divide-(--ui-border)">
                  <li
                    v-for="q in 질문s.filter(q => q.답)"
                    :key="q.id"
                    class="flex gap-3 py-4"
                  >
                    <UIcon
                      name="i-lucide-circle-check"
                      class="mt-0.5 size-5 shrink-0 text-emerald-500 dark:text-emerald-400"
                    />
                    <div class="min-w-0 flex-1">
                      <p class="text-[15px] font-medium leading-6 text-highlighted">
                        {{ q.제목 }}
                      </p>
                      <p class="mt-1 line-clamp-1 text-sm text-muted">
                        {{ q.답?.글 }}
                      </p>
                      <p class="mt-1.5 text-xs text-dimmed">
                        {{ q.답?.누가 }} 답변 · {{ q.답?.날짜 }}
                      </p>
                    </div>
                    <span class="hidden shrink-0 @xl:block">
                      <P알약
                        :구분="q.구분"
                        작게
                      />
                    </span>
                  </li>
                </ul>
              </section>
            </template>

            <!-- 소식 — 맨 위 한 편은 크게, 나머지는 글 옆 작은 사진 -->
            <template v-else>
              <article class="mt-5 grid gap-5 @2xl:grid-cols-[1.15fr_1fr] @2xl:items-center">
                <div
                  class="aspect-[16/10] rounded-3xl"
                  :style="{ background: 사진칠(첫소식.사진!) }"
                />
                <div>
                  <div class="flex items-center gap-2">
                    <P알약 :구분="첫소식.구분" />
                    <span class="text-xs text-dimmed">{{ 첫소식.날짜 }} · 사진 {{ 첫소식.사진수 }}</span>
                  </div>
                  <h4 class="mt-3 text-xl font-bold leading-snug tracking-tight text-highlighted @lg:text-2xl">
                    {{ 첫소식.제목 }}
                  </h4>
                  <p class="mt-2 text-sm leading-6 text-muted">
                    {{ 첫소식.요약 }}
                  </p>
                </div>
              </article>
              <ul class="mt-6">
                <li
                  v-for="n in 소식s.slice(1)"
                  :key="n.id"
                  class="flex items-center gap-4 border-t border-default py-4"
                >
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-1.5">
                      <P알약
                        :구분="n.구분"
                        작게
                      />
                      <span class="text-xs text-dimmed">{{ n.날짜 }}</span>
                    </div>
                    <p class="mt-1.5 line-clamp-2 text-[15px] font-semibold leading-6 text-highlighted">
                      {{ n.제목 }}
                    </p>
                    <p class="mt-0.5 hidden truncate text-sm text-muted @xl:block">
                      {{ n.요약 }}
                    </p>
                  </div>
                  <div
                    v-if="n.사진"
                    class="size-20 shrink-0 rounded-2xl @xl:h-20 @xl:w-28"
                    :style="{ background: 사진칠(n.사진) }"
                  />
                  <div
                    v-else
                    class="flex size-20 shrink-0 items-center justify-center rounded-2xl bg-elevated/60 text-muted @xl:h-20 @xl:w-28"
                  >
                    <UIcon
                      name="i-lucide-chart-no-axes-column"
                      class="size-6"
                    />
                  </div>
                </li>
              </ul>
            </template>
          </div>
        </div>

        <!-- ══ 목록 C · 타일 ════════════════════════════════════════ -->
        <div
          v-else-if="화면 === '목록' && 목록안키 === '타일'"
          class="p-5 @lg:p-8"
        >
          <h2 class="text-[28px] font-bold tracking-tight text-highlighted @lg:text-4xl">
            소통
          </h2>
          <p class="mt-1 text-sm text-muted">
            운영진이 알리고, 식구들이 묻고, 함께 한 일을 나눠요
          </p>

          <div class="mt-6 grid grid-cols-3 gap-2 @lg:gap-3">
            <button
              v-for="t in 탭s"
              :key="t.키"
              type="button"
              class="rounded-2xl p-3 text-left ring-inset transition-all @lg:rounded-3xl @lg:p-5"
              :class="탭키 === t.키 ? 'ring-2 ring-(--ui-border-inverted)' : 'ring-1 ring-transparent hover:-translate-y-0.5'"
              :style="{ background: 파스텔(톤(t.구분).색, 탭키 === t.키 ? 55 : 25) }"
              @click="탭키 = t.키"
            >
              <UIcon
                :name="t.아이콘"
                class="size-5 @lg:size-6"
                :class="톤(t.구분).글"
              />
              <p class="mt-5 text-[15px] font-bold text-highlighted @lg:mt-8 @lg:text-lg">
                {{ t.이름 }}
              </p>
              <p class="text-xs text-muted">
                {{ t.수 }}개<span class="hidden @lg:inline"> · {{ t.덧 }}</span>
              </p>
            </button>
          </div>

          <!-- 공지 — 구분 알약이 곧 거름망, 고정은 짙은 띠 -->
          <template v-if="탭키 === '공지'">
            <div class="-mx-5 mt-6 flex gap-1.5 overflow-x-auto px-5 [mask-image:linear-gradient(to_right,transparent,#000_1.25rem,#000_calc(100%-1.25rem),transparent)] @lg:mx-0 @lg:flex-wrap @lg:px-0 @lg:[mask-image:none]">
              <button
                v-for="이름 in ['전체', ...공지구분s]"
                :key="이름"
                type="button"
                class="h-8 shrink-0 rounded-full px-3.5 text-sm font-medium transition-colors"
                :class="구분거름 === 이름
                  ? 'bg-inverted text-inverted'
                  : 이름 === '전체' ? 'bg-elevated/60 text-muted' : 톤(이름).글"
                :style="구분거름 !== 이름 && 이름 !== '전체' ? { background: 파스텔(톤(이름).색, 35) } : undefined"
                @click="구분거름 = 이름"
              >
                {{ 이름 }}
              </button>
            </div>

            <button
              v-if="구분거름 === '전체' || 구분거름 === 고정.구분"
              type="button"
              class="mt-4 flex w-full items-center gap-4 rounded-3xl bg-inverted p-5 text-left text-inverted @lg:p-6"
            >
              <span class="min-w-0 flex-1">
                <span class="flex items-center gap-1.5 text-xs font-medium opacity-70">
                  <UIcon
                    name="i-lucide-pin"
                    class="size-3.5"
                  />
                  고정 · {{ 고정.구분 }}
                </span>
                <span class="mt-2 block text-lg font-bold leading-snug tracking-tight @lg:text-xl">{{ 고정.제목 }}</span>
                <span class="mt-1 block text-sm opacity-70">{{ 고정.마감?.날 }}까지 신청</span>
              </span>
              <span class="flex size-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-(--ui-bg)/15 leading-none">
                <span class="text-[11px] opacity-70">마감</span>
                <span class="mt-1 text-lg font-bold tabular-nums">D-{{ 고정.마감?.남은날 }}</span>
              </span>
            </button>

            <ul class="mt-3 grid gap-3 @xl:grid-cols-2">
              <li
                v-for="공 in 거른공지s"
                :key="공.id"
                class="flex flex-col rounded-3xl bg-default p-5 ring-1 ring-default m-층-카드"
              >
                <div class="flex items-center gap-2">
                  <P알약 :구분="공.구분" />
                  <span
                    v-if="공.is새글"
                    class="size-1.5 rounded-full bg-pink-500"
                    aria-label="새 글"
                  />
                  <span class="ml-auto text-xs text-dimmed">{{ 공.날짜 }}</span>
                </div>
                <h3 class="mt-3 text-base font-semibold leading-6 tracking-tight text-highlighted">
                  {{ 공.제목 }}
                </h3>
                <p class="mt-1 line-clamp-2 text-sm leading-6 text-muted">
                  {{ 공.요약 }}
                </p>
                <p class="mt-auto flex items-center gap-3 pt-4 text-xs text-dimmed">
                  <span class="inline-flex items-center gap-1"><UIcon
                    name="i-lucide-eye"
                    class="size-3.5"
                  />{{ 공.조회 }}</span>
                  <span class="inline-flex items-center gap-1"><UIcon
                    name="i-lucide-message-circle"
                    class="size-3.5"
                  />{{ 공.댓글 }}</span>
                </p>
              </li>
            </ul>
          </template>

          <!-- Q&A — 그 자리에서 펼치는 Q · A -->
          <ul
            v-else-if="탭키 === 'Q&A'"
            class="mt-6 space-y-2"
          >
            <li
              v-for="q in 질문s"
              :key="q.id"
              class="rounded-3xl bg-elevated/40 transition-colors"
            >
              <button
                type="button"
                class="flex w-full items-start gap-3 p-4 text-left @lg:p-5"
                :aria-expanded="펼친질문s.includes(q.id)"
                @click="펼치기(q.id)"
              >
                <span
                  class="flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                  :class="톤(q.구분).글"
                  :style="{ background: 파스텔(톤(q.구분).색, 55) }"
                >Q</span>
                <span class="min-w-0 flex-1">
                  <span class="block pt-1 text-[15px] font-semibold leading-6 text-highlighted">{{ q.제목 }}</span>
                  <span class="mt-1 flex items-center gap-1.5 text-xs text-muted">
                    <span
                      class="size-1.5 rounded-full"
                      :class="q.답 ? 'bg-emerald-500' : 'bg-amber-500'"
                    />
                    {{ q.답 ? '답변 완료' : '답을 기다리는 중' }} · {{ q.구분 }} · {{ q.날짜 }}
                  </span>
                </span>
                <UIcon
                  name="i-lucide-chevron-down"
                  class="mt-1.5 size-4 shrink-0 text-dimmed transition-transform"
                  :class="{ 'rotate-180': 펼친질문s.includes(q.id) }"
                />
              </button>
              <div
                v-if="펼친질문s.includes(q.id)"
                class="flex gap-3 px-4 pb-4 @lg:px-5 @lg:pb-5"
              >
                <span
                  class="flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                  :class="q.답 ? 'bg-inverted text-inverted' : 'border border-dashed border-accented text-dimmed'"
                >A</span>
                <div
                  v-if="q.답"
                  class="min-w-0 flex-1 rounded-2xl bg-default p-4 text-sm leading-6"
                >
                  <p class="text-highlighted">
                    {{ q.답.글 }}
                  </p>
                  <p class="mt-2 text-xs text-dimmed">
                    {{ q.답.누가 }} · {{ q.답.날짜 }}
                  </p>
                </div>
                <div
                  v-else
                  class="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-2 pt-1 text-sm text-muted"
                >
                  아직 답이 없어요. 운영진이 보통 하루 안에 답해요.
                  <span class="inline-flex h-8 items-center gap-1.5 rounded-full bg-default px-3 text-xs font-medium text-highlighted ring-1 ring-default">
                    <UIcon
                      name="i-lucide-bell"
                      class="size-3.5"
                    />
                    답 달리면 알림
                  </span>
                </div>
              </div>
            </li>
          </ul>

          <!-- 소식 — 사진 모자이크 -->
          <ul
            v-else
            class="mt-6 grid grid-cols-2 gap-2.5 @3xl:grid-cols-4 @3xl:gap-3"
          >
            <li
              v-for="(n, i) in 소식s"
              :key="n.id"
              class="relative overflow-hidden rounded-3xl"
              :class="[
                i === 0 ? 'col-span-2 aspect-[4/3] @3xl:row-span-2 @3xl:aspect-auto' : 'aspect-[4/5] @3xl:aspect-square',
                n.사진 ? '' : 'bg-inverted text-inverted'
              ]"
              :style="n.사진 ? { background: 사진칠(n.사진) } : undefined"
            >
              <template v-if="n.사진">
                <span class="absolute left-3 top-3 inline-flex h-6 items-center gap-1 rounded-full bg-default/80 px-2 text-[11px] font-medium text-highlighted backdrop-blur">
                  <UIcon
                    name="i-lucide-images"
                    class="size-3"
                  />
                  {{ n.사진수 }}
                </span>
                <div
                  class="absolute inset-x-2 bottom-2 rounded-2xl bg-default/85 backdrop-blur"
                  :class="i === 0 ? 'p-4' : 'p-3'"
                >
                  <P알약
                    v-if="i === 0"
                    :구분="n.구분"
                    작게
                  />
                  <p
                    class="line-clamp-2 font-semibold tracking-tight text-highlighted"
                    :class="i === 0 ? 'mt-2 text-lg leading-snug @3xl:text-xl' : 'text-[13px] leading-[1.35]'"
                  >
                    {{ n.제목 }}
                  </p>
                </div>
              </template>
              <div
                v-else
                class="flex h-full flex-col p-4"
              >
                <span class="text-[11px] font-medium opacity-70">{{ n.구분 }} · {{ n.날짜 }}</span>
                <span class="mt-auto text-[26px] font-bold leading-none tracking-tight">2,480<span class="text-sm">명</span></span>
                <span class="mt-2 text-[13px] leading-[1.35] opacity-80">석 달 동안 옮긴 회원</span>
              </div>
            </li>
          </ul>
        </div>

        <!-- ══ 상세 A · 읽기 ════════════════════════════════════════ -->
        <div
          v-else-if="화면 === '상세' && 상세안키 === '읽기'"
          class="px-5 pb-10 pt-5 @lg:px-10 @lg:pb-16 @lg:pt-8"
        >
          <article class="mx-auto max-w-[680px]">
            <button
              type="button"
              class="inline-flex h-9 items-center gap-1.5 rounded-full bg-elevated/60 pl-2.5 pr-3.5 text-sm font-medium text-muted transition-colors hover:text-highlighted"
            >
              <UIcon
                name="i-lucide-arrow-left"
                class="size-4"
              />
              공지 목록
            </button>

            <div class="mt-8 flex items-center gap-2">
              <P알약 :구분="글.구분" />
              <span class="inline-flex h-6 items-center rounded-full bg-inverted px-2.5 text-xs font-bold tabular-nums text-inverted">D-{{ 글.마감?.남은날 }}</span>
            </div>
            <h1 class="mt-3 text-[26px] font-bold leading-[1.25] tracking-tight text-highlighted @lg:text-[34px]">
              {{ 글.제목 }}
            </h1>
            <div class="mt-5 flex flex-wrap items-center gap-2">
              <span class="mr-1 inline-flex items-center gap-2 text-sm font-medium text-highlighted">
                <span class="flex size-8 items-center justify-center rounded-full bg-inverted text-xs font-bold text-inverted">강</span>
                {{ 글.작성 }}
              </span>
              <span
                v-for="칩 in 메타칩s"
                :key="칩.아이콘"
                class="inline-flex h-7 items-center gap-1.5 rounded-full bg-elevated/60 px-2.5 text-xs text-muted"
              >
                <UIcon
                  :name="칩.아이콘"
                  class="size-3.5"
                />
                {{ 칩.글 }}
              </span>
            </div>

            <p class="mt-8 text-[17px] leading-8 text-default">
              {{ 글.머리말 }}
            </p>

            <figure class="mt-8">
              <div
                class="aspect-[16/9] rounded-[28px]"
                :style="{ background: 사진칠(글.사진) }"
              />
              <figcaption class="mt-3 text-center text-xs text-dimmed">
                {{ 글.사진설명 }}
              </figcaption>
            </figure>

            <section
              class="mt-8 rounded-[28px] p-5 @lg:p-6"
              :style="{ background: 파스텔(톤s.보라.색, 22) }"
            >
              <h2 class="text-sm font-bold text-highlighted">
                한눈에 보기
              </h2>
              <dl class="mt-4 grid grid-cols-2 gap-2 @xl:grid-cols-4">
                <div
                  v-for="사실 in 글.핵심s"
                  :key="사실.이름"
                  class="rounded-2xl bg-default p-3.5"
                >
                  <UIcon
                    :name="사실.아이콘"
                    class="size-[18px] text-indigo-600 dark:text-indigo-300"
                  />
                  <dt class="mt-3 text-xs text-muted">
                    {{ 사실.이름 }}
                  </dt>
                  <dd class="mt-0.5 text-[15px] font-semibold leading-snug text-highlighted">
                    {{ 사실.값 }}
                    <span
                      v-if="사실.덧"
                      class="mt-1 block text-xs font-normal text-muted"
                    >{{ 사실.덧 }}</span>
                  </dd>
                </div>
              </dl>
            </section>

            <div
              class="mt-6 flex gap-3 rounded-2xl p-4"
              :style="{ background: 파스텔(톤s.하늘.색, 26) }"
            >
              <UIcon
                name="i-lucide-info"
                class="mt-0.5 size-[18px] shrink-0 text-sky-700 dark:text-sky-300"
              />
              <p class="text-sm leading-6 text-default">
                {{ 글.안내 }}
              </p>
            </div>

            <p class="mt-6 text-base leading-8 text-default">
              {{ 글.본문 }}
            </p>

            <div class="mt-6 flex gap-3 rounded-2xl bg-elevated/60 p-4">
              <UIcon
                name="i-lucide-file-pen-line"
                class="mt-0.5 size-[18px] shrink-0 text-muted"
              />
              <p class="text-sm leading-6 text-muted">
                {{ 글.참고 }}
              </p>
            </div>

            <div class="mt-10 flex items-center gap-2 border-y border-default py-4">
              <button
                type="button"
                class="inline-flex h-10 items-center gap-1.5 rounded-full px-4 text-sm font-medium ring-1 transition-colors"
                :class="is좋아요 ? 'text-pink-700 ring-pink-300 dark:text-pink-200 dark:ring-pink-400/40' : 'text-muted ring-(--ui-border)'"
                :style="is좋아요 ? { background: 파스텔(톤s.분홍.색, 30) } : undefined"
                @click="is좋아요 = !is좋아요"
              >
                <UIcon
                  :name="is좋아요 ? 'i-lucide-heart' : 'i-lucide-heart'"
                  class="size-4"
                />
                도움돼요 {{ 글.좋아요 + (is좋아요 ? 1 : 0) }}
              </button>
              <button
                type="button"
                class="flex size-10 items-center justify-center rounded-full text-muted ring-1 ring-(--ui-border)"
                aria-label="공유"
              >
                <UIcon
                  name="i-lucide-share-2"
                  class="size-4"
                />
              </button>
              <span class="ml-auto inline-flex h-10 items-center gap-1.5 rounded-full bg-inverted px-4 text-sm font-semibold text-inverted">
                신청하러 가기
                <UIcon
                  name="i-lucide-arrow-right"
                  class="size-4"
                />
              </span>
            </div>

            <section class="mt-10">
              <h2 class="text-lg font-bold tracking-tight text-highlighted">
                댓글 <span class="text-dimmed">{{ 댓글수 }}</span>
              </h2>
              <ul class="mt-4 space-y-5">
                <li
                  v-for="c in 글.댓글s"
                  :key="c.글"
                >
                  <div class="flex gap-3">
                    <span
                      class="flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                      :class="톤(이름톤(c.누가)).글"
                      :style="{ background: 파스텔(톤(이름톤(c.누가)).색, 50) }"
                    >{{ c.누가.slice(0, 1) }}</span>
                    <div class="min-w-0 flex-1">
                      <p class="text-sm">
                        <span class="font-semibold text-highlighted">{{ c.누가 }}</span>
                        <span class="ml-2 text-xs text-dimmed">{{ c.날짜 }}</span>
                      </p>
                      <p class="mt-1 text-[15px] leading-7 text-default">
                        {{ c.글 }}
                      </p>
                    </div>
                  </div>
                  <div
                    v-if="c.답"
                    class="ml-12 mt-3 flex gap-3 rounded-2xl bg-elevated/60 p-3.5"
                  >
                    <span class="flex size-7 shrink-0 items-center justify-center rounded-full bg-inverted text-xs font-bold text-inverted">강</span>
                    <div class="min-w-0 flex-1">
                      <p class="flex items-center gap-1.5 text-sm">
                        <span class="font-semibold text-highlighted">{{ c.답.누가 }}</span>
                        <span class="text-xs text-dimmed">{{ c.답.날짜 }}</span>
                      </p>
                      <p class="mt-0.5 text-sm leading-6 text-default">
                        {{ c.답.글 }}
                      </p>
                    </div>
                  </div>
                </li>
              </ul>

              <div class="mt-6 rounded-3xl bg-default p-2 ring-1 ring-default m-층-카드">
                <textarea
                  rows="2"
                  placeholder="궁금한 점이나 응원을 남겨 주세요"
                  class="block w-full resize-none bg-transparent px-3 py-2 text-[15px] leading-6 text-highlighted outline-none placeholder:text-dimmed"
                />
                <div class="flex items-center gap-2">
                  <label class="flex h-9 min-w-0 items-center gap-1.5 rounded-full bg-elevated/60 px-3">
                    <UIcon
                      name="i-lucide-user-round"
                      class="size-3.5 shrink-0 text-dimmed"
                    />
                    <input
                      placeholder="닉네임"
                      class="w-24 min-w-0 bg-transparent text-sm text-highlighted outline-none placeholder:text-dimmed"
                    >
                  </label>
                  <span class="ml-auto inline-flex h-9 items-center rounded-full bg-inverted px-4 text-sm font-semibold text-inverted">등록</span>
                </div>
              </div>
            </section>

            <nav class="mt-10 grid gap-2 @md:grid-cols-2">
              <button
                v-for="(이웃, i) in 이웃글s"
                :key="이웃.id"
                type="button"
                class="rounded-2xl p-4 text-left ring-1 ring-default transition-colors hover:bg-elevated"
                :class="i === 1 ? '@md:text-right' : ''"
              >
                <span class="text-xs text-dimmed">{{ i === 0 ? '← 이전 글' : '다음 글 →' }}</span>
                <span class="mt-1 block truncate text-sm font-medium text-highlighted">{{ 이웃.제목 }}</span>
              </button>
            </nav>
          </article>
        </div>

        <!-- ══ 상세 B · 대화 ════════════════════════════════════════ -->
        <div v-else>
          <div
            class="px-5 pb-8 pt-5 @lg:px-10 @lg:pb-10 @lg:pt-7"
            :style="{ background: 머리구름 }"
          >
            <div class="mx-auto max-w-5xl">
              <div class="flex items-center gap-2 text-sm text-muted">
                <button
                  type="button"
                  class="flex size-9 items-center justify-center rounded-full bg-default/80 text-muted ring-1 ring-default backdrop-blur"
                  aria-label="공지 목록"
                >
                  <UIcon
                    name="i-lucide-arrow-left"
                    class="size-4"
                  />
                </button>
                소통 <UIcon
                  name="i-lucide-chevron-right"
                  class="size-3.5 text-dimmed"
                /> 공지
              </div>
              <div class="mt-7 flex items-center gap-2">
                <P알약 :구분="글.구분" />
                <span class="text-xs text-muted">{{ 글.날짜전체 }} · 조회 {{ 글.조회 }}</span>
              </div>
              <h1 class="mt-3 max-w-3xl text-[26px] font-bold leading-[1.25] tracking-tight text-highlighted @lg:text-[38px]">
                {{ 글.제목 }}
              </h1>
              <p class="mt-3 text-sm text-muted">
                <span class="font-medium text-highlighted">{{ 글.작성 }}</span>이 알려요
              </p>
              <div class="mt-5 flex flex-wrap gap-2">
                <button
                  v-for="반응 in 반응s"
                  :key="반응.이름"
                  type="button"
                  class="inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-sm font-medium backdrop-blur transition-colors"
                  :class="반응.켜짐 ? 반응.켠글 : 'bg-default/80 text-muted ring-1 ring-default hover:text-highlighted'"
                  :style="반응.켜짐 ? { background: 파스텔(반응.색, 50) } : undefined"
                  @click="반응.켜짐 = !반응.켜짐"
                >
                  <UIcon
                    :name="반응.아이콘"
                    class="size-4"
                  />
                  {{ 반응.이름 }}
                  <span class="tabular-nums opacity-70">{{ 반응.수 + (반응.켜짐 ? 1 : 0) }}</span>
                </button>
                <span class="inline-flex h-9 items-center gap-1.5 rounded-full bg-inverted px-3.5 text-sm font-medium text-inverted">
                  <UIcon
                    name="i-lucide-message-circle"
                    class="size-4"
                  />
                  이야기 {{ 댓글수 }}
                </span>
              </div>
            </div>
          </div>

          <div class="px-5 pb-10 @lg:px-10 @4xl:pb-14">
            <div class="mx-auto grid max-w-5xl gap-8 @4xl:grid-cols-[minmax(0,1fr)_18rem] @4xl:gap-12">
              <!-- 곁 카드 — 폰에서는 제목 바로 아래 온다 -->
              <aside class="@4xl:col-start-2 @4xl:row-start-1">
                <div class="rounded-[28px] bg-default p-5 ring-1 ring-default m-층-카드 @4xl:sticky @4xl:top-6">
                  <p class="text-xs font-semibold text-dimmed">
                    일정
                  </p>
                  <ol class="mt-3">
                    <li
                      v-for="(단계, i) in 일정s"
                      :key="단계.이름"
                      class="relative flex gap-3 pb-4 last:pb-0"
                    >
                      <span
                        v-if="i < 일정s.length - 1"
                        class="absolute left-[7px] top-5 h-[calc(100%-1.25rem)] w-0.5 rounded-full bg-accented"
                      />
                      <span
                        class="mt-1 size-4 shrink-0 rounded-full"
                        :class="단계.is지금 ? 'bg-indigo-500 ring-4 ring-indigo-500/20' : 'border-2 border-accented bg-default'"
                      />
                      <div class="min-w-0 flex-1">
                        <p class="flex items-center gap-1.5 text-xs text-muted">
                          {{ 단계.이름 }}
                          <span
                            v-if="단계.is지금"
                            class="rounded-full px-1.5 text-[10px] font-bold text-indigo-700 dark:text-indigo-200"
                            :style="{ background: 파스텔(톤s.보라.색, 45) }"
                          >지금</span>
                        </p>
                        <p class="text-[15px] font-semibold text-highlighted">
                          {{ 단계.값 }}
                        </p>
                      </div>
                    </li>
                  </ol>
                  <div class="mt-5 flex items-center justify-between rounded-2xl bg-elevated/60 px-4 py-3">
                    <span class="text-xs text-muted">선정 규모</span>
                    <span class="text-sm font-bold text-highlighted">3개 협회</span>
                  </div>
                  <span class="mt-3 flex h-11 items-center justify-center gap-1.5 rounded-full bg-inverted text-sm font-semibold text-inverted">
                    신청하러 가기 · D-{{ 글.마감?.남은날 }}
                  </span>
                </div>
              </aside>

              <main class="min-w-0 @4xl:col-start-1 @4xl:row-start-1">
                <p class="text-[17px] leading-8 text-default">
                  {{ 글.머리말 }}
                </p>
                <div
                  class="mt-7 aspect-[16/9] rounded-[28px]"
                  :style="{ background: 사진칠(글.사진) }"
                />
                <p class="mt-3 text-xs text-dimmed">
                  {{ 글.사진설명 }}
                </p>
                <p class="mt-6 text-base leading-8 text-default">
                  {{ 글.본문 }}
                </p>
                <div
                  class="mt-6 flex gap-3 rounded-2xl p-4"
                  :style="{ background: 파스텔(톤s.하늘.색, 26) }"
                >
                  <UIcon
                    name="i-lucide-info"
                    class="mt-0.5 size-[18px] shrink-0 text-sky-700 dark:text-sky-300"
                  />
                  <p class="text-sm leading-6 text-default">
                    {{ 글.안내 }}
                  </p>
                </div>
                <div class="mt-3 flex gap-3 rounded-2xl bg-elevated/60 p-4">
                  <UIcon
                    name="i-lucide-file-pen-line"
                    class="mt-0.5 size-[18px] shrink-0 text-muted"
                  />
                  <p class="text-sm leading-6 text-muted">
                    {{ 글.참고 }}
                  </p>
                </div>

                <!-- 이야기 — 말풍선, 운영진 답은 이어 붙는다 -->
                <section class="mt-12">
                  <div class="flex items-center gap-3">
                    <h2 class="text-xl font-bold tracking-tight text-highlighted">
                      이야기 나누기
                    </h2>
                    <span class="flex -space-x-2">
                      <span
                        v-for="c in 글.댓글s"
                        :key="c.누가"
                        class="flex size-7 items-center justify-center rounded-full text-[11px] font-bold ring-2 ring-(--ui-bg)"
                        :class="톤(이름톤(c.누가)).글"
                        :style="{ background: 파스텔(톤(이름톤(c.누가)).색, 55) }"
                      >{{ c.누가.slice(0, 1) }}</span>
                    </span>
                  </div>

                  <ul class="mt-5 space-y-5">
                    <li
                      v-for="c in 글.댓글s"
                      :key="c.글"
                    >
                      <div class="flex gap-2.5">
                        <span
                          class="mt-5 flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                          :class="톤(이름톤(c.누가)).글"
                          :style="{ background: 파스텔(톤(이름톤(c.누가)).색, 55) }"
                        >{{ c.누가.slice(0, 1) }}</span>
                        <div class="min-w-0">
                          <p class="px-1 text-xs text-muted">
                            <span class="font-semibold text-default">{{ c.누가 }}</span> · {{ c.날짜 }}
                          </p>
                          <p class="mt-1 rounded-[22px] rounded-tl-md bg-elevated/60 px-4 py-2.5 text-[15px] leading-6 text-highlighted">
                            {{ c.글 }}
                          </p>
                        </div>
                      </div>
                      <div
                        v-if="c.답"
                        class="ml-10 mt-2 flex gap-2.5"
                      >
                        <UIcon
                          name="i-lucide-corner-down-right"
                          class="mt-6 size-4 shrink-0 text-dimmed"
                        />
                        <div class="min-w-0">
                          <p class="flex items-center gap-1.5 px-1 text-xs text-muted">
                            <span class="font-semibold text-default">{{ c.답.누가 }}</span>
                            <span class="rounded-full bg-inverted px-1.5 text-[10px] font-bold leading-4 text-inverted">운영진</span>
                          </p>
                          <p
                            class="mt-1 rounded-[22px] rounded-tl-md px-4 py-2.5 text-[15px] leading-6 text-highlighted"
                            :style="{ background: 파스텔(톤s.보라.색, 32) }"
                          >
                            {{ c.답.글 }}
                          </p>
                        </div>
                      </div>
                    </li>
                  </ul>

                  <div class="mt-8">
                    <p class="text-xs text-dimmed">
                      이런 걸 물어봐도 돼요
                    </p>
                    <div class="mt-2 flex flex-wrap gap-1.5">
                      <button
                        v-for="말 in 물어볼말s"
                        :key="말"
                        type="button"
                        class="h-8 rounded-full px-3 text-sm text-default ring-1 ring-default transition-colors hover:bg-elevated"
                        @click="쓰는말 = 말"
                      >
                        {{ 말 }}
                      </button>
                    </div>
                    <div class="mt-3 flex items-end gap-2 rounded-[28px] bg-elevated/60 p-2">
                      <span class="flex size-10 shrink-0 items-center justify-center rounded-full bg-default text-muted ring-1 ring-default">
                        <UIcon
                          name="i-lucide-user-round"
                          class="size-[18px]"
                        />
                      </span>
                      <textarea
                        v-model="쓰는말"
                        rows="1"
                        placeholder="이야기를 남겨 주세요"
                        class="min-h-10 min-w-0 flex-1 resize-none bg-transparent py-2 text-[15px] leading-6 text-highlighted outline-none placeholder:text-dimmed"
                      />
                      <button
                        type="button"
                        class="flex size-10 shrink-0 items-center justify-center rounded-full transition-colors"
                        :class="쓰는말 ? 'bg-inverted text-inverted' : 'bg-accented text-dimmed'"
                        aria-label="남기기"
                      >
                        <UIcon
                          name="i-lucide-arrow-up"
                          class="size-[18px]"
                        />
                      </button>
                    </div>
                    <p class="mt-2 px-3 text-xs text-dimmed">
                      <span class="font-medium text-muted">방문자12</span> 로 남겨요 · 이름 바꾸기
                    </p>
                  </div>
                </section>
              </main>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, reactive, ref } from 'vue'
import {
  공지s, 질문s, 소식s, 상세글, 톤, 톤s, 파스텔, 사진칠,
  type i톤
} from './_소통표본'

definePageMeta({
  제목: '소통 게시판 · 목록 셋 상세 둘'
})

type i탭키 = '공지' | 'Q&A' | '소식'
type i목록안키 = '구름' | '곁길' | '타일'
type i상세안키 = '읽기' | '대화'
interface i안<K> { 키: K, 이름: string, 왜: string, 대가: string }

const 목록안s: i안<i목록안키>[] = [
  {
    키: '구름',
    이름: 'A · 구름 머리',
    왜: '파스텔 구름 머리에 제목·알약 탭·찾기를 모으고, 탭마다 제 모양을 준다 — 공지는 고정 글 한 장을 D-day 머리 카드로 띄우고 나머지는 알약 + 제목의 맑은 줄, Q&A 는 「답변 완료/기다리는 중」과 답 한 줄 미리보기, 소식은 사진이 주인공인 카드.',
    대가: '머리 구름만큼 첫 글이 내려간다. 탭 셋이 서로 다른 카드라 게시판이 넷째·다섯째로 늘면 모양을 또 하나 골라야 한다.'
  },
  {
    키: '곁길',
    이름: 'B · 곁길',
    왜: '넓으면 왼쪽 곁길에 게시판 셋을 「새 글 1 · 답 기다림 1」 같은 한 줄과 함께 세우고, 폰에선 그대로 알약 셋으로 눕는다. 공지는 달력 칸과 함께 달별로, Q&A 는 기다리는 질문을 따로 위에, 소식은 한 편 크게 + 글 옆 작은 사진.',
    대가: '곁길이 폭 16rem 을 늘 먹는다 — 게시판이 셋뿐일 땐 휑하다. 달별 묶음은 글이 뜸하면 한 달에 한 줄씩이라 되레 길어진다.'
  },
  {
    키: '타일',
    이름: 'C · 타일',
    왜: '게시판 셋을 파스텔 타일로 크게 — 어디로 갈지가 첫 화면이다. 공지는 구분 알약이 곧 거름망이고 고정은 짙은 띠, Q&A 는 그 자리에서 펼치는 Q·A, 소식은 사진 모자이크(사진 없는 소식은 숫자 한 장).',
    대가: '타일 셋이 폰 첫 화면의 1/4 을 먹는다. 모자이크는 사진이 고르게 있어야 예쁘다 — 사진 없는 소식이 많으면 짙은 칸이 얼룩진다.'
  }
]

const 상세안s: i안<i상세안키>[] = [
  {
    키: '읽기',
    이름: 'A · 읽기',
    왜: '680px 한 기둥에 글만. 메타는 부드러운 칩, 2열 표는 「한눈에 보기」 네 칸 카드로, 외톨이 ♥ 는 공유·신청과 한 줄에 선다. 댓글 입력은 닉네임을 바닥에 품은 상자 하나.',
    대가: '넓은 화면에서 양옆이 비어 보인다. 신청 버튼이 글 끝에 있어 긴 글에선 내려가야 만난다.'
  },
  {
    키: '대화',
    이름: 'B · 대화',
    왜: '제목 바로 아래 반응 알약(도움돼요·궁금해요·이야기 N)이 서서 읽기 전에 분위기가 보인다. 일정·신청은 곁 카드로 붙어 따라오고(폰은 제목 밑), 댓글은 말풍선 + 운영진 답 이어 붙이기 + 물어볼 말 칩.',
    대가: '반응 종류를 정해야 한다(무엇을 셀지). 곁 카드가 글마다 다른 칸을 요구한다 — 모집 글이 아니면 곁 카드에 넣을 게 없다.'
  }
]

const 화면 = ref<'목록' | '상세'>('목록')
const 폭 = ref<'넓게' | '폰'>('넓게')
const 탭키 = ref<i탭키>('공지')
const 목록안키 = ref<i목록안키>('구름')
const 상세안키 = ref<i상세안키>('읽기')

const 손잡이s = computed(() => [
  { 이름: '화면', 값s: ['목록', '상세'], 현재: 화면 as Ref<string> },
  { 이름: '폭', 값s: ['넓게', '폰'], 현재: 폭 as Ref<string> },
  ...(화면.value === '목록' ? [{ 이름: '탭', 값s: ['공지', 'Q&A', '소식'], 현재: 탭키 as Ref<string> }] : [])
])

const 지금안s = computed<i안<string>[]>(() => 화면.value === '목록' ? 목록안s : 상세안s)
const 지금안키 = computed<string>({
  get: () => 화면.value === '목록' ? 목록안키.value : 상세안키.value,
  set: (키) => {
    if (화면.value === '목록') 목록안키.value = 키 as i목록안키
    else 상세안키.value = 키 as i상세안키
  }
})
const 판 = computed(() => 지금안s.value.find(안 => 안.키 === 지금안키.value)!)

// ── 표본에서 뽑는 값 ──────────────────────────────────────────────

const 탭s = [
  { 키: '공지' as const, 이름: '공지', 수: 공지s.length, 구분: '모집', 아이콘: 'i-lucide-megaphone', 설명: '운영진이 알리는 일정과 바뀌는 것', 덧: `새 글 ${공지s.filter(글 => 글.is새글).length}` },
  { 키: 'Q&A' as const, 이름: 'Q&A', 수: 질문s.length, 구분: '가입', 아이콘: 'i-lucide-messages-square', 설명: '묻고 운영진이 답해요', 덧: `답 기다림 ${질문s.filter(q => !q.답).length}` },
  { 키: '소식' as const, 이름: '소식', 수: 소식s.length, 구분: '사례', 아이콘: 'i-lucide-images', 설명: '협회와 함께 한 일, 모임 기록', 덧: `사진 ${소식s.reduce((합, n) => 합 + n.사진수, 0)}장` }
]
const 탭 = computed(() => 탭s.find(t => t.키 === 탭키.value)!)

const 고정 = 공지s.find(글 => 글.is고정)!
const 보통공지s = 공지s.filter(글 => !글.is고정)
const 답한수 = 질문s.filter(q => q.답).length
const 첫소식 = 소식s[0]!

const 달 = (날짜: string) => 날짜.split(' ')[0]!
const 일 = (날짜: string) => Number.parseInt(날짜.split(' ')[1]!)
/** 표본 날짜는 전부 2026년이다. */
const 요일 = (날짜: string) => '일월화수목금토'[new Date(2026, Number.parseInt(달(날짜)) - 1, 일(날짜)).getDay()]!

const 달별공지s = [...new Set(보통공지s.map(글 => 달(글.날짜)))]
  .map(이름 => ({ 달: 이름, 글s: 보통공지s.filter(글 => 달(글.날짜) === 이름) }))

const 공지구분s = [...new Set(공지s.map(글 => 글.구분))]
const 구분거름 = ref('전체')
const 거른공지s = computed(() => 보통공지s.filter(글 => 구분거름.value === '전체' || 글.구분 === 구분거름.value))

const 펼친질문s = ref<number[]>([56, 58])
const 펼치기 = (id: number) => {
  펼친질문s.value = 펼친질문s.value.includes(id) ? 펼친질문s.value.filter(v => v !== id) : [...펼친질문s.value, id]
}

// ── 상세 ─────────────────────────────────────────────────────────

const 글 = 상세글
const 댓글수 = 글.댓글s.reduce((합, c) => 합 + 1 + (c.답 ? 1 : 0), 0)
const 메타칩s = [
  { 아이콘: 'i-lucide-calendar', 글: 글.날짜전체 },
  { 아이콘: 'i-lucide-eye', 글: `조회 ${글.조회}` },
  { 아이콘: 'i-lucide-message-circle', 글: `댓글 ${댓글수}` }
]
const 이웃글s = [공지s[5]!, 공지s[4]!]
const is좋아요 = ref(false)

/** 이름마다 늘 같은 빛깔 — 글자 코드 합으로 고른다. */
const 이름톤 = (이름: string): string => {
  const 순 = ['사례', '모임', '활동', '휴무'] as const
  return 순[[...이름].reduce((합, 자) => 합 + 자.charCodeAt(0), 0) % 순.length]!
}

const 반응s = reactive([
  { 이름: '도움돼요', 아이콘: 'i-lucide-heart', 수: 글.좋아요, 켜짐: false, 색: 톤s.분홍.색, 켠글: 'text-pink-700 dark:text-pink-200' },
  { 이름: '궁금해요', 아이콘: 'i-lucide-circle-help', 수: 3, 켜짐: false, 색: 톤s.노랑.색, 켠글: 'text-amber-800 dark:text-amber-200' }
])

const 일정s = [
  { 이름: '신청 기간', 값: '9월 1일 – 9월 30일', is지금: true },
  { 이름: '선정 발표', 값: '10월 14일', is지금: false },
  { 이름: '지원 기간 · 3개월', 값: '11월 – 이듬해 1월', is지금: false }
]
const 물어볼말s = ['발표를 문자로도 받나요?', '회원 수 기준이 궁금해요', '예전 양식도 되나요?']
const 쓰는말 = ref('')

// ── 칠 ───────────────────────────────────────────────────────────

/** 구분 알약. 빛깔은 테마 축 밖이다(머리말). */
const P알약 = defineComponent({
  props: { 구분: { type: String, required: true }, 작게: Boolean },
  setup: props => () => h('span', {
    class: [
      'inline-flex shrink-0 items-center rounded-full font-semibold',
      props.작게 ? 'h-5 px-2 text-[11px]' : 'h-6 px-2.5 text-xs',
      톤(props.구분).글
    ],
    style: { background: 파스텔(톤(props.구분).색, 50) }
  }, props.구분)
})

const P답상태 = defineComponent({
  props: { is답: Boolean },
  setup: props => () => {
    const 톤이름: i톤 = props.is답 ? '초록' : '노랑'
    return h('span', {
      class: ['inline-flex h-6 shrink-0 items-center gap-1 rounded-full px-2.5 text-xs font-semibold', 톤s[톤이름].글],
      style: { background: 파스텔(톤s[톤이름].색, 45) }
    }, props.is답 ? '답변 완료' : '기다리는 중')
  }
})

const 머리구름 = [
  /** 끝을 100% 가 아니라 92% 에 둔다 — 로그인 창 판에서 1배율 밑단에 반 픽셀 선이 보였다(실측). */
  'linear-gradient(to bottom, transparent 35%, var(--ui-bg) 92%)',
  `radial-gradient(45% 110% at 8% 0%, ${파스텔('#A5B4FC', 70)}, transparent 70%)`,
  `radial-gradient(40% 100% at 92% 0%, ${파스텔('#FBCFE8', 80)}, transparent 70%)`,
  `radial-gradient(50% 90% at 55% 60%, ${파스텔('#BAE6FD', 60)}, transparent 70%)`,
  파스텔('#EEF2FF', 55)
].join(', ')

const 고정칠 = [
  `radial-gradient(60% 120% at 100% 0%, ${파스텔('#FBCFE8', 75)}, transparent 70%)`,
  `radial-gradient(60% 120% at 0% 100%, ${파스텔('#BAE6FD', 60)}, transparent 70%)`,
  파스텔('#C7D2FE', 50)
].join(', ')

const 판바탕 = `radial-gradient(40% 50% at 20% 20%, ${파스텔('#C7D2FE', 30)}, transparent), radial-gradient(40% 50% at 80% 80%, ${파스텔('#FBCFE8', 30)}, transparent), var(--ui-bg-muted)`
</script>

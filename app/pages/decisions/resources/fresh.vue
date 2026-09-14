<!--
  **자료(받는 파일 + 읽는 문서)를 어떤 모양으로 세울까**의 판. 실화면은 `/resources` · `/resources/[id]`.

  ## 이 판이 답하는 물음

  지금 목록은 파일 줄(「파일 1개」+「받기」)과 문서 줄(「읽기 3분」+ ›)이 한 표에 섞여서,
  **오른쪽 열의 뜻이 줄마다 바뀐다.** 태그는 회색 글자 한 칸, 요약은 잘린 작은 회색 글이다.
  파일 상세는 「파일」 자리표시 네모와 「notion.so」 가 전부라 무엇을 받는지 안 보이고,
  문서 상세는 읽기는 괜찮은데 레일이 비고 차례가 없다.
  물음은 — **두 종류를 섞지 않고 한눈에 가르면서, 받는 것은 받기 쉽게·읽는 것은 읽기 쉽게 하려면.**

  ## 판 읽는 법

  - 「화면」 손잡이 — 목록(세 안) · 파일 상세(두 안, 13번 명부 이관 가이드) · 문서 상세(두 안, 9번 총회의 법적 요건).
  - 「폭」 손잡이 — `폰` 은 판을 390px 틀에 담는다. **안의 반응형은 전부 컨테이너 쿼리**(`@container` + `@md:`·`@3xl:`)라
    뷰포트가 넓어도 틀 폭대로 접힌다. 옮길 때는 `@3xl:` → `md:` 처럼 뷰포트 변형으로 바꾸면 된다.
  - 값은 전부 **표본**(`_자료표본.ts`)이다 — 라이브 DB를 안 읽는다. 받기·검색은 눌러도 아무 일 없고, 태그·형태 거르기만 판 안에서 돈다.
  - 파일 형식 색(PDF 빨강 · HWP 청록 · XLSX 초록 · DOCX 남색 · 글 호박)과 파스텔은 **테마 축을 안 탄다.**
    파스텔은 `--ui-bg` 에 섞고 다크에서는 섞는 양을 줄였다(`--파스텔`, 로그인 창 판과 같은 규칙). 고르면 옮길 때 예외로 이름 붙일 것.
  - 형식 배지(접힌 모서리 종이 + 확장자)는 `Define배지` 한 벌이다 — 목록·상세가 같은 그림을 쓴다.
-->
<template>
  <div class="mx-auto w-full max-w-(--ui-container) px-4 py-8">
    <header class="mb-5">
      <h1 class="text-2xl font-semibold text-highlighted">
        자료 · 목록과 상세 일곱 안
      </h1>
      <p class="mt-1 text-sm text-muted">
        같은 표본(파일 다섯 · 문서 넷) · 받는 것과 읽는 것을 섞지 않고 가르기
      </p>
    </header>

    <div class="mb-4 flex flex-wrap items-center gap-2">
      <mButton
        v-for="안 in 화면안s"
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
    </div>

    <div class="mb-5 rounded-lg border border-default bg-muted px-4 py-3 text-sm leading-relaxed">
      <p><span class="text-dimmed">왜 ·</span> {{ 판.왜 }}</p>
      <p class="mt-1">
        <span class="text-dimmed">대가 ·</span> {{ 판.대가 }}
      </p>
    </div>

    <!-- ── 조각 — 안끼리 같이 쓰는 그림 ─────────────────────────────── -->

    <!-- 형식 배지 — 접힌 모서리 종이 + 확장자. `글` 은 확장자 대신 줄 아이콘. -->
    <Define배지 v-slot="{ 형식, 크기 }">
      <span
        class="relative inline-block shrink-0"
        :class="배지크기[크기 ?? 'md'].틀"
        :aria-label="형식 === '글' ? '문서' : `${형식} 파일`"
        role="img"
      >
        <svg
          viewBox="0 0 40 48"
          class="block size-full"
          aria-hidden="true"
        >
          <path
            d="M9 0H27L40 13V39A9 9 0 0 1 31 48H9A9 9 0 0 1 0 39V9A9 9 0 0 1 9 0Z"
            :fill="형식칠[형식].진한"
          />
          <path
            d="M27 0V6.5A6.5 6.5 0 0 0 33.5 13H40Z"
            fill="#fff"
            fill-opacity=".42"
          />
        </svg>
        <UIcon
          v-if="형식 === '글'"
          name="i-lucide-align-left"
          class="absolute left-1/2 top-[58%] -translate-x-1/2 -translate-y-1/2 text-white"
          :class="배지크기[크기 ?? 'md'].아이콘"
        />
        <span
          v-else
          class="absolute inset-x-0 bottom-[18%] text-center font-bold leading-none tracking-tight text-white"
          :class="배지크기[크기 ?? 'md'].글"
        >{{ 형식 }}</span>
      </span>
    </Define배지>

    <!-- 태그 알약 — 태그마다 파스텔 한 빛 -->
    <Define태그 v-slot="{ 태그, 작게, 흰 }">
      <!-- `흰` — 색 표지 위에 얹을 때. 파스텔 위에 파스텔을 얹으면 초록 위 초록처럼 알약이 사라진다(실측) -->
      <span
        class="inline-flex shrink-0 items-center gap-1 rounded-full font-medium text-default"
        :class="[작게 ? 'h-6 px-2.5 text-xs' : 'h-7 px-3 text-[13px]', 흰 ? 'bg-default/80 backdrop-blur' : '']"
        :style="흰 ? undefined : { background: 파스텔(태그칠[태그]?.색 ?? '#E5E7EB', 50) }"
      >
        <UIcon
          :name="태그칠[태그]?.아이콘 ?? 'i-lucide-tag'"
          class="size-3.5 opacity-70"
        />
        {{ 태그 }}
      </span>
    </Define태그>

    <!-- `**굵게**` 한 겹만 아는 글 -->
    <Define글 v-slot="{ 글 }">
      <template
        v-for="(조각, i) in 조각s(글)"
        :key="i"
      >
        <strong
          v-if="조각.굵게"
          class="font-semibold text-highlighted"
        >{{ 조각.t }}</strong>
        <template v-else>
          {{ 조각.t }}
        </template>
      </template>
    </Define글>

    <!-- 태그 줄 — 폰에서는 옆으로 밀고 오른쪽 끝을 흐린다 -->
    <Define태그줄>
      <div class="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [mask-image:linear-gradient(to_right,#000_calc(100%-40px),transparent)] [scrollbar-width:none] @3xl:mx-0 @3xl:flex-wrap @3xl:overflow-visible @3xl:px-0 @3xl:[mask-image:none]">
        <button
          v-for="태그 in [null, ...태그s]"
          :key="태그 ?? '전체'"
          type="button"
          class="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-4 text-sm font-medium transition-colors"
          :class="고른태그 === 태그 ? 'bg-inverted text-inverted' : 'bg-elevated text-muted hover:bg-accented hover:text-highlighted'"
          @click="고른태그 = 태그"
        >
          <UIcon
            v-if="태그"
            :name="태그칠[태그]!.아이콘"
            class="size-4"
          />
          {{ 태그 ?? '전체' }}
        </button>
      </div>
    </Define태그줄>

    <!-- 검색 알약 -->
    <Define검색 v-slot="{ 높게 }">
      <label
        class="flex w-full items-center gap-2.5 rounded-full bg-elevated px-4 text-muted ring-1 ring-transparent transition focus-within:bg-default focus-within:ring-accented"
        :class="높게 ? 'h-12' : 'h-11'"
      >
        <UIcon
          name="i-lucide-search"
          class="size-[18px] shrink-0"
        />
        <input
          v-model="검색"
          type="search"
          placeholder="제목·요약으로 찾기"
          class="min-w-0 flex-1 bg-transparent text-[15px] text-highlighted outline-none placeholder:text-dimmed"
        >
      </label>
    </Define검색>

    <!-- 조건에 맞는 게 없을 때 -->
    <Define빈칸>
      <div class="rounded-3xl border border-dashed border-default px-6 py-14 text-center">
        <UIcon
          name="i-lucide-library-big"
          class="size-9 text-dimmed"
        />
        <p class="mt-2 text-sm text-muted">
          조건에 맞는 자료가 없어요
        </p>
        <button
          type="button"
          class="mt-3 h-9 rounded-full bg-elevated px-4 text-sm font-medium text-highlighted hover:bg-accented"
          @click="do조건지우기"
        >
          조건 지우기
        </button>
      </div>
    </Define빈칸>

    <!-- 뒤로 -->
    <Define뒤로>
      <button
        type="button"
        class="-ml-1 inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-muted transition-colors hover:bg-elevated hover:text-highlighted"
        @click="화면 = '목록'"
      >
        <UIcon
          name="i-lucide-arrow-left"
          class="size-4"
        />
        자료
      </button>
    </Define뒤로>

    <!-- 문서 본문 — 두 안이 같은 몸을 쓰고 절 머리만 다르다 -->
    <Define본문 v-slot="{ 번호 }">
      <div class="text-[16px] leading-[1.85] text-default">
        <p class="text-[17px] leading-[1.8]">
          <Reuse글 :글="총회머리글" />
        </p>
        <section
          v-for="(절, i) in 총회절s"
          :id="`절-${절.키}`"
          :key="절.키"
          :data-절="절.키"
          class="mt-12 scroll-mt-24"
        >
          <h2 class="flex items-center gap-3 text-xl font-bold tracking-tight text-highlighted @3xl:text-[22px]">
            <span
              v-if="번호"
              class="flex size-8 shrink-0 items-center justify-center rounded-xl text-sm font-bold tabular-nums text-violet-800 dark:text-violet-200"
              :style="{ background: 파스텔('#DDD6FE', 80) }"
            >{{ String(i + 1).padStart(2, '0') }}</span>
            {{ 절.제목 }}
          </h2>
          <template
            v-for="(블록, j) in 절.블록s"
            :key="j"
          >
            <p
              v-if="블록.종류 === '글'"
              class="mt-4"
            >
              <Reuse글 :글="블록.글" />
            </p>
            <ul
              v-else-if="블록.종류 === '점'"
              class="mt-4 space-y-2.5"
            >
              <li
                v-for="줄 in 블록.줄s"
                :key="줄"
                class="flex gap-3"
              >
                <span class="mt-[0.8em] size-1.5 shrink-0 rounded-full bg-(--ui-text-dimmed)" />
                <span><Reuse글 :글="줄" /></span>
              </li>
            </ul>
            <ol
              v-else-if="블록.종류 === '번호'"
              class="mt-5 space-y-3"
            >
              <li
                v-for="(줄, k) in 블록.줄s"
                :key="줄"
                class="flex gap-3.5"
              >
                <span class="mt-[0.3em] flex size-6 shrink-0 items-center justify-center rounded-full bg-elevated text-xs font-semibold tabular-nums text-muted">{{ k + 1 }}</span>
                <span><Reuse글 :글="줄" /></span>
              </li>
            </ol>
            <template v-else-if="블록.종류 === '조항표'">
              <!-- 넓으면 표, 좁으면 조항마다 카드 — 세 칸 표를 390px 에 욱여넣으면 칸마다 두 글자씩 끊긴다 -->
              <div class="mt-5 hidden overflow-clip rounded-2xl ring-1 ring-default @2xl:block">
                <table class="w-full text-left text-[14px] leading-relaxed">
                  <thead class="bg-elevated text-xs text-muted">
                    <tr>
                      <th class="w-24 px-4 py-2.5 font-medium">
                        조항
                      </th>
                      <th class="px-4 py-2.5 font-medium">
                        내용
                      </th>
                      <th class="px-4 py-2.5 font-medium">
                        실무
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="줄 in 블록.줄s"
                      :key="줄.조항"
                      class="border-t border-default align-top"
                    >
                      <td class="px-4 py-3">
                        <span class="inline-flex h-6 items-center rounded-full bg-elevated px-2.5 text-xs font-semibold tabular-nums text-highlighted">{{ 줄.조항 }}</span>
                      </td>
                      <td class="px-4 py-3 text-default">
                        <Reuse글 :글="줄.내용" />
                      </td>
                      <td class="px-4 py-3 text-muted">
                        {{ 줄.실무 }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="mt-5 space-y-2.5 @2xl:hidden">
                <div
                  v-for="줄 in 블록.줄s"
                  :key="줄.조항"
                  class="rounded-2xl bg-elevated p-4 text-[15px] leading-relaxed"
                >
                  <span class="inline-flex h-6 items-center rounded-full bg-default px-2.5 text-xs font-semibold tabular-nums text-highlighted">{{ 줄.조항 }}</span>
                  <p class="mt-2">
                    <Reuse글 :글="줄.내용" />
                  </p>
                  <p class="mt-1.5 text-sm text-muted">
                    <span class="text-dimmed">실무 ·</span> {{ 줄.실무 }}
                  </p>
                </div>
              </div>
            </template>
          </template>
        </section>
      </div>
    </Define본문>

    <!-- ── 판 ─────────────────────────────────────────────────────── -->
    <div
      class="[--파스텔:1] dark:[--파스텔:0.3]"
      :class="폭 === '폰' ? 'rounded-xl border border-default px-3 py-8 sm:py-10' : ''"
      :style="폭 === '폰' ? { background: 무대바탕 } : undefined"
    >
      <div
        ref="판El"
        data-판
        class="@container mx-auto overflow-clip bg-default break-keep"
        :class="폭 === '폰' ? 'w-[390px] max-w-full rounded-[36px] border border-accented m-층-모달' : 'w-full rounded-[28px] border border-default'"
      >
        <!-- ══ 목록 A · 두 선반 ═══════════════════════════════════════ -->
        <div
          v-if="안키 === '선반'"
          class="px-5 py-7 @3xl:px-10 @3xl:py-10"
        >
          <div class="flex flex-col gap-5 @3xl:flex-row @3xl:items-end @3xl:justify-between">
            <div>
              <h2 class="text-[28px] font-bold tracking-tight text-highlighted @3xl:text-4xl">
                자료
              </h2>
              <p class="mt-1.5 text-[15px] text-muted">
                받아서 쓰는 서식과, 몇 분이면 읽는 해설
              </p>
            </div>
            <div class="@3xl:w-80">
              <Reuse검색 />
            </div>
          </div>
          <div class="mt-6">
            <Reuse태그줄 />
          </div>

          <div
            v-if="!보이는자료s.length"
            class="mt-8"
          >
            <Reuse빈칸 />
          </div>

          <!-- 선반 1 — 받는 것 -->
          <section
            v-if="보이는파일s.length"
            class="mt-9"
          >
            <div class="flex items-baseline gap-2">
              <h3 class="text-lg font-bold tracking-tight text-highlighted">
                받아 쓰는 파일
              </h3>
              <span class="text-sm tabular-nums text-dimmed">{{ 보이는파일s.length }}</span>
              <p class="ml-auto hidden text-sm text-muted @md:block">
                내려받아 채우거나 인쇄해요
              </p>
            </div>
            <div class="mt-4 grid gap-3 @xl:grid-cols-2 @4xl:grid-cols-3">
              <article
                v-for="자료 in 보이는파일s"
                :key="자료.id"
                class="group flex cursor-pointer flex-col rounded-3xl p-5 ring-1 ring-default transition hover:-translate-y-0.5 m-층-카드"
                :style="{ background: `linear-gradient(to bottom, ${파스텔(형식칠[자료.파일s[0]!.형식].옅은, 42)}, var(--ui-bg) 62%)` }"
                @click="do열기(자료)"
              >
                <div class="flex items-start justify-between gap-3">
                  <Reuse배지
                    :형식="자료.파일s[0]!.형식"
                    크기="md"
                  />
                  <Reuse태그
                    :태그="자료.태그"
                    작게
                  />
                </div>
                <h4 class="mt-4 line-clamp-2 text-[15px] font-semibold leading-snug text-highlighted">
                  {{ 자료.제목 }}
                </h4>
                <p class="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted">
                  {{ 자료.요약 }}
                </p>
                <div class="mt-auto flex items-center justify-between gap-3 pt-5">
                  <span class="min-w-0 text-xs tabular-nums text-muted">
                    <span
                      class="font-semibold"
                      :class="형식칠[자료.파일s[0]!.형식].글"
                    >{{ 자료.파일s[0]!.형식 }}</span>
                    · {{ 자료.파일s[0]!.크기 }}
                    <template v-if="자료.파일s.length > 1"> · 외 {{ 자료.파일s.length - 1 }}개</template>
                  </span>
                  <button
                    type="button"
                    class="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-inverted px-4 text-sm font-semibold text-inverted transition hover:opacity-90 active:scale-[.98]"
                    @click.stop
                  >
                    <UIcon
                      name="i-lucide-download"
                      class="size-4"
                    />
                    받기
                  </button>
                </div>
              </article>
            </div>
          </section>

          <!-- 선반 2 — 읽는 것 -->
          <section
            v-if="보이는문서s.length"
            class="mt-10"
          >
            <div class="flex items-baseline gap-2">
              <h3 class="text-lg font-bold tracking-tight text-highlighted">
                읽을거리
              </h3>
              <span class="text-sm tabular-nums text-dimmed">{{ 보이는문서s.length }}</span>
              <p class="ml-auto hidden text-sm text-muted @md:block">
                명부·총회·회비를 만지기 전에
              </p>
            </div>
            <div class="mt-3 grid gap-x-6 @4xl:grid-cols-2">
              <article
                v-for="자료 in 보이는문서s"
                :key="자료.id"
                class="-mx-3 flex cursor-pointer gap-4 rounded-2xl p-3 transition-colors hover:bg-elevated"
                @click="do열기(자료)"
              >
                <span
                  class="flex size-12 shrink-0 items-center justify-center rounded-2xl"
                  :class="태그칠[자료.태그]!.글"
                  :style="{ background: 파스텔(태그칠[자료.태그]!.색, 75) }"
                >
                  <UIcon
                    :name="태그칠[자료.태그]!.아이콘"
                    class="size-[22px]"
                  />
                </span>
                <div class="min-w-0 flex-1">
                  <h4 class="text-[15px] font-semibold leading-snug text-highlighted">
                    {{ 자료.제목 }}
                  </h4>
                  <p class="mt-1 line-clamp-2 text-sm leading-relaxed text-muted">
                    {{ 자료.요약 }}
                  </p>
                  <p class="mt-2 flex items-center gap-1.5 text-xs text-dimmed">
                    <UIcon
                      name="i-lucide-clock-3"
                      class="size-3.5"
                    />
                    <span><span class="font-medium text-muted">읽기 {{ 자료.읽기분 }}분</span> · {{ 자료.태그 }} · {{ 날짜(자료.올린날) }}</span>
                  </p>
                </div>
              </article>
            </div>
          </section>
        </div>

        <!-- ══ 목록 B · 형식 카드 ═════════════════════════════════════ -->
        <div
          v-else-if="안키 === '카드'"
          class="px-5 py-7 @3xl:px-10 @3xl:py-10"
        >
          <h2 class="text-[28px] font-bold tracking-tight text-highlighted @3xl:text-4xl">
            자료
          </h2>
          <p class="mt-1.5 text-[15px] text-muted">
            받는 파일은 형식 색으로, 읽는 문서는 호박색 종이로
          </p>
          <div class="mt-6 flex flex-col gap-3 @3xl:flex-row @3xl:items-center">
            <div class="flex rounded-full bg-elevated p-1">
              <button
                v-for="형태 in 형태s"
                :key="형태.값"
                type="button"
                class="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full px-4 text-sm font-medium transition @3xl:flex-none"
                :class="고른형태 === 형태.값 ? 'bg-default text-highlighted m-층-카드' : 'text-muted hover:text-highlighted'"
                @click="고른형태 = 형태.값"
              >
                {{ 형태.값 }}
                <span class="text-xs tabular-nums text-dimmed">{{ 형태.수 }}</span>
              </button>
            </div>
            <div class="@3xl:ml-auto @3xl:w-72">
              <Reuse검색 />
            </div>
          </div>

          <div
            v-if="!보이는자료s.length"
            class="mt-8"
          >
            <Reuse빈칸 />
          </div>
          <div
            v-else
            class="mt-7 grid gap-4 @xl:grid-cols-2 @4xl:grid-cols-3"
          >
            <article
              v-for="자료 in 보이는자료s"
              :key="자료.id"
              class="group flex cursor-pointer flex-col overflow-clip rounded-[24px] bg-default ring-1 ring-default transition hover:-translate-y-0.5 m-층-카드"
              @click="do열기(자료)"
            >
              <!-- 표지 — 형식 빛이 아래로 바탕에 녹는다(선 없이) -->
              <div
                class="relative flex h-[104px] items-start justify-between px-5 pt-5"
                :style="{ background: 표지칠(대표형식(자료)) }"
              >
                <Reuse배지
                  :형식="대표형식(자료)"
                  크기="lg"
                />
                <Reuse태그
                  :태그="자료.태그"
                  작게
                  흰
                />
              </div>
              <div class="flex flex-1 flex-col px-5 pb-5 pt-3">
                <h3 class="line-clamp-2 text-[15px] font-semibold leading-snug text-highlighted">
                  {{ 자료.제목 }}
                </h3>
                <p class="mb-5 mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted">
                  {{ 자료.요약 }}
                </p>
                <!-- 행동 칸 — 파일·문서 모두 **같은 자리 같은 모양**. 동사와 곁말만 다르다 -->
                <div
                  class="mt-auto flex h-11 items-center gap-2 rounded-full pl-4 pr-1.5 transition-colors"
                  :class="자료.형태 === '파일' ? 'bg-inverted text-inverted' : 'bg-elevated text-highlighted group-hover:bg-accented'"
                >
                  <UIcon
                    :name="자료.형태 === '파일' ? 'i-lucide-download' : 'i-lucide-book-open'"
                    class="size-4 shrink-0"
                  />
                  <span class="text-sm font-semibold">{{ 자료.형태 === '파일' ? '받기' : '읽기' }}</span>
                  <span
                    class="ml-auto inline-flex h-8 items-center rounded-full px-3 text-xs font-medium tabular-nums"
                    :class="자료.형태 === '파일' ? 'bg-white/15 dark:bg-black/10' : 'bg-default text-muted'"
                  >
                    <template v-if="자료.형태 === '파일'">
                      {{ 자료.파일s[0]!.형식 }} · {{ 자료.파일s[0]!.크기 }}<template v-if="자료.파일s.length > 1"> · +{{ 자료.파일s.length - 1 }}</template>
                    </template>
                    <template v-else>{{ 자료.읽기분 }}분 · {{ 자료.글자수!.toLocaleString('ko-KR') }}자</template>
                  </span>
                </div>
              </div>
            </article>
          </div>
        </div>

        <!-- ══ 목록 C · 서가 ══════════════════════════════════════════ -->
        <div
          v-else-if="안키 === '서가'"
          class="grid gap-6 px-5 py-7 @3xl:grid-cols-[13rem_minmax(0,1fr)] @3xl:gap-10 @3xl:px-10 @3xl:py-10"
        >
          <aside class="min-w-0">
            <h2 class="text-[28px] font-bold tracking-tight text-highlighted @3xl:text-3xl">
              자료
            </h2>
            <p class="mt-1.5 text-[15px] text-muted">
              주제로 꺼내 보는 서가
            </p>
            <!-- 넓으면 세로 서가, 좁으면 옆으로 미는 알약 -->
            <nav class="-mx-5 mt-5 flex gap-2 overflow-x-auto px-5 pb-1 [mask-image:linear-gradient(to_right,#000_calc(100%-40px),transparent)] [scrollbar-width:none] @3xl:sticky @3xl:top-6 @3xl:mx-0 @3xl:flex-col @3xl:gap-1 @3xl:overflow-visible @3xl:px-0 @3xl:[mask-image:none]">
              <button
                v-for="칸 in 서가칸s"
                :key="칸.이름"
                type="button"
                class="flex h-11 shrink-0 items-center gap-2.5 rounded-full pl-1.5 pr-4 text-sm transition-colors @3xl:pr-3"
                :class="고른태그 === 칸.값 ? 'bg-inverted font-semibold text-inverted' : 'bg-elevated font-medium text-default hover:bg-accented @3xl:bg-transparent @3xl:hover:bg-elevated'"
                @click="고른태그 = 칸.값"
              >
                <span
                  class="flex size-8 items-center justify-center rounded-full"
                  :class="칸.글"
                  :style="{ background: 칸.바탕 }"
                >
                  <UIcon
                    :name="칸.아이콘"
                    class="size-4"
                  />
                </span>
                {{ 칸.이름 }}
                <span
                  class="ml-1 text-xs tabular-nums @3xl:ml-auto"
                  :class="고른태그 === 칸.값 ? 'opacity-70' : 'text-dimmed'"
                >{{ 칸.수 }}</span>
              </button>
            </nav>
          </aside>

          <div class="min-w-0">
            <Reuse검색 높게 />
            <div class="mt-6 flex items-baseline gap-2 px-1">
              <h3 class="text-lg font-bold tracking-tight text-highlighted">
                {{ 고른태그 ?? '모든 자료' }}
              </h3>
              <span class="text-sm tabular-nums text-dimmed">{{ 보이는자료s.length }}</span>
            </div>
            <div
              v-if="!보이는자료s.length"
              class="mt-3"
            >
              <Reuse빈칸 />
            </div>
            <ul
              v-else
              class="mt-3 divide-y divide-default overflow-clip rounded-[28px] ring-1 ring-default"
            >
              <li
                v-for="자료 in 보이는자료s"
                :key="자료.id"
                class="grid cursor-pointer grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-x-4 px-4 py-4 transition-colors hover:bg-elevated/60 @3xl:px-5"
                @click="do열기(자료)"
              >
                <Reuse배지
                  :형식="대표형식(자료)"
                  크기="md"
                />
                <div class="min-w-0">
                  <h4 class="text-[15px] font-semibold leading-snug text-highlighted">
                    {{ 자료.제목 }}
                  </h4>
                  <p class="mt-1 line-clamp-2 text-sm leading-relaxed text-muted @4xl:line-clamp-1">
                    {{ 자료.요약 }}
                  </p>
                  <!-- 곁말은 한 줄에 모은다 — 열이 아니라서 줄마다 뜻이 바뀌어도 이름이 같이 적힌다 -->
                  <div class="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
                    <Reuse태그
                      :태그="자료.태그"
                      작게
                    />
                    <span
                      v-if="자료.형태 === '파일'"
                      class="tabular-nums"
                    >{{ 자료.파일s.map(파일 => 파일.형식).join(' · ') }} · {{ 자료.파일s[0]!.크기 }}</span>
                    <span v-else>읽기 {{ 자료.읽기분 }}분</span>
                    <span class="text-dimmed">{{ 날짜(자료.올린날) }}</span>
                  </div>
                </div>
                <button
                  type="button"
                  class="flex size-10 items-center justify-center rounded-full transition"
                  :class="자료.형태 === '파일' ? 'bg-inverted text-inverted hover:opacity-90' : 'text-muted ring-1 ring-default ring-inset hover:bg-elevated hover:text-highlighted'"
                  :aria-label="자료.형태 === '파일' ? '받기' : '읽기'"
                  @click.stop="자료.형태 === '문서' && do열기(자료)"
                >
                  <UIcon
                    :name="자료.형태 === '파일' ? 'i-lucide-download' : 'i-lucide-arrow-right'"
                    class="size-[18px]"
                  />
                </button>
              </li>
            </ul>
          </div>
        </div>

        <!-- ══ 파일 상세 A · 받는 곳 ══════════════════════════════════ -->
        <div
          v-else-if="안키 === '받는곳'"
          class="px-5 py-6 @3xl:px-10 @3xl:py-8"
        >
          <Reuse뒤로 />
          <div class="mx-auto mt-4 max-w-[640px]">
            <div class="overflow-clip rounded-[28px] ring-1 ring-default m-층-카드">
              <div
                class="flex flex-col items-center px-6 pb-7 pt-10 text-center"
                :style="{ background: 받는곳머리칠 }"
              >
                <!-- 파일 둘을 겹친 종이 더미 — 몇 개 받는지가 그림으로 보인다 -->
                <div class="relative h-[104px] w-[140px]">
                  <span class="absolute right-0 top-3 rotate-[10deg]">
                    <Reuse배지
                      :형식="이관.파일s[1]!.형식"
                      크기="lg"
                    />
                  </span>
                  <span class="absolute left-2 top-0 -rotate-3">
                    <Reuse배지
                      :형식="이관.파일s[0]!.형식"
                      크기="xl"
                    />
                  </span>
                </div>
                <div class="mt-5">
                  <Reuse태그 :태그="이관.태그" />
                </div>
                <h2 class="mt-3 text-balance text-2xl font-bold leading-tight tracking-tight text-highlighted @3xl:text-[30px]">
                  {{ 이관.제목 }}
                </h2>
                <p class="mt-2.5 max-w-md text-[15px] leading-relaxed text-muted">
                  {{ 이관.요약 }}
                </p>
                <p class="mt-3 text-xs text-dimmed">
                  {{ 날짜(이관.올린날) }} 올림 · 누구나 받을 수 있어요
                </p>
              </div>

              <div class="space-y-2 px-4 pb-4 @md:px-6 @md:pb-6">
                <div
                  v-for="(파일, i) in 이관.파일s"
                  :key="파일.이름"
                  class="flex items-center gap-3 rounded-2xl p-3"
                  :class="i === 0 ? 'bg-elevated' : ''"
                >
                  <Reuse배지
                    :형식="파일.형식"
                    크기="sm"
                  />
                  <div class="min-w-0 flex-1">
                    <p class="truncate text-sm font-semibold text-highlighted">
                      {{ 파일.이름 }}
                    </p>
                    <p class="mt-0.5 text-xs tabular-nums text-muted">
                      <span
                        class="font-semibold"
                        :class="형식칠[파일.형식].글"
                      >{{ 파일.형식 }}</span> · {{ 파일.크기 }} · {{ 파일.분량 }}
                    </p>
                  </div>
                  <button
                    type="button"
                    class="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full px-4 text-sm font-semibold transition active:scale-[.98]"
                    :class="i === 0 ? 'bg-inverted text-inverted hover:opacity-90' : 'text-highlighted ring-1 ring-accented ring-inset hover:bg-elevated'"
                  >
                    <UIcon
                      name="i-lucide-download"
                      class="size-4"
                    />
                    받기
                  </button>
                </div>
              </div>
            </div>

            <!-- 안에 든 것 — 지금의 4줄 표를 차례로 -->
            <section class="mt-10">
              <div class="flex items-baseline justify-between gap-3 px-1">
                <h3 class="text-lg font-bold tracking-tight text-highlighted">
                  안에 든 것
                </h3>
                <span class="text-xs text-dimmed">PDF 24쪽 · 일곱 단계</span>
              </div>
              <ol class="mt-3">
                <li
                  v-for="(단계, i) in 이관단계s"
                  :key="단계.단계"
                  class="relative flex gap-4 pb-5 last:pb-0"
                >
                  <span
                    v-if="i < 이관단계s.length - 1"
                    class="absolute bottom-0 left-[15px] top-8 w-px bg-(--ui-border)"
                  />
                  <span class="relative flex size-[31px] shrink-0 items-center justify-center rounded-full bg-elevated text-xs font-semibold tabular-nums text-muted ring-4 ring-(--ui-bg)">{{ i }}</span>
                  <div class="min-w-0 flex-1 pt-1">
                    <div class="flex flex-wrap items-baseline gap-x-2">
                      <p class="text-[15px] font-semibold text-highlighted">
                        {{ 단계.단계 }}
                      </p>
                      <span class="text-xs tabular-nums text-dimmed">{{ 단계.쪽 }}쪽</span>
                    </div>
                    <p class="mt-0.5 text-sm text-muted">
                      {{ 단계.하는일 }}
                    </p>
                  </div>
                  <span class="mt-0.5 inline-flex h-7 shrink-0 items-center rounded-full bg-elevated px-3 text-xs font-medium tabular-nums text-default">{{ 단계.시간 }}</span>
                </li>
              </ol>
            </section>

            <section class="mt-10">
              <h3 class="px-1 text-lg font-bold tracking-tight text-highlighted">
                곁에 두면 좋은 것
              </h3>
              <div class="mt-3 grid gap-3 @xl:grid-cols-3">
                <article
                  v-for="자료 in 곁자료of(이관곁자료ids)"
                  :key="자료.id"
                  class="flex cursor-pointer gap-3 rounded-2xl bg-elevated p-4 transition-colors hover:bg-accented @xl:flex-col"
                  @click="do열기(자료)"
                >
                  <Reuse배지
                    :형식="대표형식(자료)"
                    크기="sm"
                  />
                  <div class="min-w-0">
                    <p class="line-clamp-2 text-sm font-semibold leading-snug text-highlighted">
                      {{ 자료.제목 }}
                    </p>
                    <p class="mt-1 text-xs text-muted">
                      {{ 곁말(자료) }}
                    </p>
                  </div>
                </article>
              </div>
            </section>
          </div>
        </div>

        <!-- ══ 파일 상세 B · 미리보기 레일 ════════════════════════════ -->
        <div
          v-else-if="안키 === '미리보기'"
          class="px-5 py-6 @3xl:px-10 @3xl:py-8"
        >
          <Reuse뒤로 />
          <div class="mt-4 grid gap-8 @4xl:grid-cols-[minmax(0,1fr)_20rem] @4xl:gap-x-12">
            <header class="min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <Reuse태그 :태그="이관.태그" />
                <span class="text-xs text-dimmed">{{ 날짜(이관.올린날) }} 올림 · 누구나</span>
              </div>
              <h2 class="mt-3 text-balance text-[26px] font-bold leading-tight tracking-tight text-highlighted @3xl:text-4xl">
                {{ 이관.제목 }}
              </h2>
              <p class="mt-3 text-[15px] leading-relaxed text-muted @3xl:text-[17px]">
                {{ 이관.요약 }}
              </p>
            </header>

            <!-- 레일 — 좁으면 머리 바로 아래(받기가 먼저), 넓으면 오른쪽에 붙어 따라온다 -->
            <aside class="@4xl:col-start-2 @4xl:row-span-3 @4xl:row-start-1">
              <div class="space-y-5 @4xl:sticky @4xl:top-6">
                <div class="rounded-[24px] bg-default p-5 ring-1 ring-default m-층-카드">
                  <p class="text-xs font-medium text-dimmed">
                    받을 파일 {{ 이관.파일s.length }}개
                  </p>
                  <div class="mt-3 space-y-3">
                    <div
                      v-for="파일 in 이관.파일s"
                      :key="파일.이름"
                      class="flex items-center gap-3"
                    >
                      <Reuse배지
                        :형식="파일.형식"
                        크기="md"
                      />
                      <div class="min-w-0">
                        <p class="truncate text-sm font-semibold text-highlighted">
                          {{ 파일.이름 }}
                        </p>
                        <p class="mt-0.5 text-xs tabular-nums text-muted">
                          {{ 파일.크기 }} · {{ 파일.분량 }}
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    class="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-inverted text-[15px] font-semibold text-inverted transition hover:opacity-90 active:scale-[.99]"
                  >
                    <UIcon
                      name="i-lucide-download"
                      class="size-[18px]"
                    />
                    가이드 받기
                    <span class="text-sm font-medium opacity-60">PDF {{ 이관.파일s[0]!.크기 }}</span>
                  </button>
                  <button
                    type="button"
                    class="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-full text-sm font-semibold text-highlighted ring-1 ring-accented ring-inset transition hover:bg-elevated"
                  >
                    <UIcon
                      name="i-lucide-table-2"
                      class="size-4"
                    />
                    정리 템플릿 받기
                    <span class="font-medium text-dimmed">XLSX {{ 이관.파일s[1]!.크기 }}</span>
                  </button>
                </div>

                <div class="hidden gap-2 @4xl:flex">
                  <button
                    v-for="도구 in 파일도구s"
                    :key="도구.이름"
                    type="button"
                    class="inline-flex h-9 items-center gap-1.5 rounded-full bg-elevated px-3.5 text-sm font-medium text-default transition-colors hover:bg-accented"
                  >
                    <UIcon
                      :name="도구.아이콘"
                      class="size-4 text-muted"
                    />
                    {{ 도구.이름 }}
                  </button>
                </div>

                <div class="hidden @4xl:block">
                  <p class="text-xs font-medium text-dimmed">
                    곁에 두면 좋은 것
                  </p>
                  <div class="mt-2 space-y-1">
                    <article
                      v-for="자료 in 곁자료of(이관곁자료ids)"
                      :key="자료.id"
                      class="-mx-2 flex cursor-pointer items-center gap-3 rounded-2xl p-2 transition-colors hover:bg-elevated"
                      @click="do열기(자료)"
                    >
                      <Reuse배지
                        :형식="대표형식(자료)"
                        크기="sm"
                      />
                      <div class="min-w-0">
                        <p class="truncate text-sm font-medium text-highlighted">
                          {{ 자료.제목 }}
                        </p>
                        <p class="text-xs text-muted">
                          {{ 곁말(자료) }}
                        </p>
                      </div>
                    </article>
                  </div>
                </div>
              </div>
            </aside>

            <!-- 미리 보기 — 쪽 세 장 -->
            <section class="min-w-0">
              <div class="flex items-baseline justify-between gap-3">
                <h3 class="text-lg font-bold tracking-tight text-highlighted">
                  미리 보기
                </h3>
                <span class="text-xs text-dimmed">24쪽 중 3쪽</span>
              </div>
              <div
                class="mt-3 rounded-[28px] p-4 @3xl:p-6"
                :style="{ background: 미리보기바탕 }"
              >
                <div class="flex snap-x gap-3 overflow-x-auto pb-1 [mask-image:linear-gradient(to_right,#000_calc(100%-28px),transparent)] [scrollbar-width:none] @3xl:grid @3xl:grid-cols-3 @3xl:gap-5 @3xl:overflow-visible @3xl:[mask-image:none]">
                  <figure
                    v-for="쪽 in 미리보기쪽s"
                    :key="쪽.번호"
                    class="w-[44%] shrink-0 snap-start @3xl:w-auto"
                  >
                    <div class="flex aspect-[210/297] flex-col gap-2 rounded-lg bg-default p-[11%] ring-1 ring-default m-층-카드">
                      <template v-if="쪽.모양 === '표지'">
                        <div
                          class="h-[38%] rounded-md"
                          :style="{ background: 표지칠('PDF', 70) }"
                        />
                        <div class="mt-2 h-2 w-[85%] rounded-full bg-(--ui-text-highlighted) opacity-70" />
                        <div class="h-2 w-[60%] rounded-full bg-(--ui-text-highlighted) opacity-70" />
                        <div class="mt-3 h-1 w-[70%] rounded-full bg-accented" />
                        <div class="h-1 w-[55%] rounded-full bg-accented" />
                        <div class="mt-auto flex items-center gap-1.5">
                          <span class="size-2.5 rounded-full bg-(--ui-text-highlighted) opacity-70" />
                          <span class="h-1 w-[35%] rounded-full bg-accented" />
                        </div>
                      </template>
                      <template v-else-if="쪽.모양 === '차례'">
                        <div class="h-1.5 w-[45%] rounded-full bg-(--ui-text-highlighted) opacity-70" />
                        <div
                          v-for="n in 7"
                          :key="n"
                          class="mt-0.5 flex items-center gap-1.5"
                        >
                          <span class="size-1.5 shrink-0 rounded-full bg-accented" />
                          <span
                            class="h-1 rounded-full bg-accented"
                            :style="{ width: `${48 + (n * 17) % 30}%` }"
                          />
                          <span class="ml-auto h-1 w-[10%] rounded-full bg-accented" />
                        </div>
                        <div class="mt-auto rounded-md bg-muted p-[8%]">
                          <div class="h-1 w-[80%] rounded-full bg-accented" />
                          <div class="mt-1.5 h-1 w-[60%] rounded-full bg-accented" />
                        </div>
                      </template>
                      <template v-else>
                        <div class="h-1.5 w-[55%] rounded-full bg-(--ui-text-highlighted) opacity-70" />
                        <div class="h-1 w-[90%] rounded-full bg-accented" />
                        <div class="h-1 w-[75%] rounded-full bg-accented" />
                        <div class="mt-1 grid grid-cols-3 gap-[3px]">
                          <span
                            v-for="n in 15"
                            :key="n"
                            class="h-2.5 rounded-[2px]"
                            :class="n <= 3 ? 'bg-accented' : 'bg-muted'"
                          />
                        </div>
                        <div class="mt-1 h-1 w-[80%] rounded-full bg-accented" />
                        <div class="h-1 w-[65%] rounded-full bg-accented" />
                        <div class="mt-2 h-1.5 w-[40%] rounded-full bg-(--ui-text-highlighted) opacity-70" />
                        <div class="h-1 w-[85%] rounded-full bg-accented" />
                        <div class="h-1 w-[70%] rounded-full bg-accented" />
                        <div class="h-1 w-[78%] rounded-full bg-accented" />
                      </template>
                    </div>
                    <figcaption class="mt-2 text-center text-xs text-muted">
                      <span class="tabular-nums text-dimmed">{{ 쪽.번호 }}쪽</span> · {{ 쪽.이름 }}
                    </figcaption>
                  </figure>
                </div>
              </div>
            </section>

            <!-- 단계 표 — 선 적은 표. 좁으면 하는 일이 단계 아래로 -->
            <section class="min-w-0">
              <h3 class="text-lg font-bold tracking-tight text-highlighted">
                단계별로 걸리는 시간
              </h3>
              <div class="mt-3 overflow-clip rounded-[24px] ring-1 ring-default">
                <div
                  v-for="(단계, i) in 이관단계s"
                  :key="단계.단계"
                  class="grid grid-cols-[1.75rem_minmax(0,1fr)_auto] items-baseline gap-x-3 px-4 py-3.5 @3xl:grid-cols-[2rem_11rem_minmax(0,1fr)_auto] @3xl:px-5"
                  :class="i ? 'border-t border-default' : ''"
                >
                  <span class="text-xs font-semibold tabular-nums text-dimmed">{{ String(i).padStart(2, '0') }}</span>
                  <div class="min-w-0 @3xl:contents">
                    <p class="text-[15px] font-semibold text-highlighted">
                      {{ 단계.단계 }}
                    </p>
                    <p class="text-sm text-muted">
                      {{ 단계.하는일 }}
                    </p>
                  </div>
                  <span class="text-sm font-medium tabular-nums text-default">{{ 단계.시간 }}</span>
                </div>
              </div>
            </section>

            <!-- 폰 — 레일의 곁 자료는 넓을 때만 레일에 선다. 좁으면 글 끝으로 -->
            <section class="min-w-0 @4xl:hidden">
              <h3 class="text-lg font-bold tracking-tight text-highlighted">
                곁에 두면 좋은 것
              </h3>
              <div class="mt-2 space-y-1">
                <article
                  v-for="자료 in 곁자료of(이관곁자료ids)"
                  :key="자료.id"
                  class="-mx-2 flex cursor-pointer items-center gap-3 rounded-2xl p-2 transition-colors hover:bg-elevated"
                  @click="do열기(자료)"
                >
                  <Reuse배지
                    :형식="대표형식(자료)"
                    크기="sm"
                  />
                  <div class="min-w-0">
                    <p class="text-sm font-medium leading-snug text-highlighted">
                      {{ 자료.제목 }}
                    </p>
                    <p class="mt-0.5 text-xs text-muted">
                      {{ 곁말(자료) }}
                    </p>
                  </div>
                </article>
              </div>
            </section>
          </div>
        </div>

        <!-- ══ 문서 상세 A · 옆 차례 ══════════════════════════════════ -->
        <div
          v-else-if="안키 === '옆차례'"
          class="relative"
        >
          <!-- 읽은 만큼 — 판 맨 위에 붙는 가는 띠 -->
          <div class="sticky top-0 z-20 h-1 bg-transparent">
            <div
              class="h-full rounded-r-full transition-[width] duration-150"
              :style="{ width: `${진행 * 100}%`, background: 진행띠칠 }"
            />
          </div>
          <div class="grid gap-10 px-5 pb-10 pt-5 @3xl:px-10 @3xl:pt-7 @4xl:grid-cols-[minmax(0,1fr)_16rem] @4xl:gap-14">
            <article
              data-글
              class="min-w-0 max-w-[680px]"
            >
              <Reuse뒤로 />
              <p class="mt-5 flex items-center gap-2 text-sm text-muted">
                <Reuse배지
                  형식="글"
                  크기="xs"
                />
                문서 · 읽기 {{ 총회.읽기분 }}분
              </p>
              <h2 class="mt-3 text-balance text-[28px] font-bold leading-[1.2] tracking-tight text-highlighted @3xl:text-[36px]">
                {{ 총회.제목 }}
              </h2>
              <div class="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted">
                <Reuse태그 :태그="총회.태그" />
                <span class="tabular-nums">{{ 날짜(총회.올린날) }} 올림</span>
                <span class="tabular-nums text-dimmed">{{ 총회.글자수!.toLocaleString('ko-KR') }}자</span>
              </div>

              <!-- 폰 — 차례는 접힌 알약 하나로 따라온다 -->
              <!-- 뒤 글이 알약 위로 비치지 않게 바탕을 아래로 흐려 깐다(선 없이) -->
              <div class="sticky top-3 z-10 mt-6 before:pointer-events-none before:absolute before:-inset-x-5 before:-top-3 before:-bottom-6 before:-z-10 before:bg-default before:[mask-image:linear-gradient(to_bottom,#000_60%,transparent)] @4xl:hidden">
                <button
                  type="button"
                  class="flex h-12 w-full items-center gap-3 rounded-full bg-default/85 pl-1.5 pr-4 text-left ring-1 ring-default backdrop-blur m-층-떠있음"
                  @click="is차례열림 = !is차례열림"
                >
                  <span class="relative flex size-9 shrink-0 items-center justify-center">
                    <svg
                      viewBox="0 0 36 36"
                      class="absolute inset-0 size-full -rotate-90"
                      aria-hidden="true"
                    >
                      <circle
                        cx="18"
                        cy="18"
                        r="15"
                        fill="none"
                        stroke="var(--ui-border)"
                        stroke-width="3"
                      />
                      <circle
                        cx="18"
                        cy="18"
                        r="15"
                        fill="none"
                        stroke="#8B5CF6"
                        stroke-width="3"
                        stroke-linecap="round"
                        :stroke-dasharray="`${진행 * 94.25} 94.25`"
                      />
                    </svg>
                    <span class="text-[10px] font-semibold tabular-nums text-muted">{{ 현재절번호 }}/{{ 총회절s.length }}</span>
                  </span>
                  <span class="min-w-0 flex-1 truncate text-sm font-medium text-highlighted">{{ 현재절?.제목 }}</span>
                  <UIcon
                    name="i-lucide-chevron-down"
                    class="size-4 shrink-0 text-muted transition-transform"
                    :class="is차례열림 ? 'rotate-180' : ''"
                  />
                </button>
                <div
                  v-if="is차례열림"
                  class="absolute inset-x-0 top-full mt-2 rounded-[22px] bg-default p-2 ring-1 ring-default m-층-드롭다운"
                >
                  <button
                    v-for="(절, i) in 총회절s"
                    :key="절.키"
                    type="button"
                    class="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm transition-colors hover:bg-elevated"
                    :class="현재절키 === 절.키 ? 'font-semibold text-highlighted' : 'text-muted'"
                    @click="do절로(절.키)"
                  >
                    <span class="w-4 text-xs tabular-nums text-dimmed">{{ i + 1 }}</span>
                    {{ 절.제목 }}
                  </button>
                </div>
              </div>

              <div class="mt-8">
                <Reuse본문 :번호="false" />
              </div>
            </article>

            <aside class="min-w-0">
              <div class="space-y-6 @4xl:sticky @4xl:top-7">
                <nav class="hidden @4xl:block">
                  <div class="flex items-center justify-between">
                    <p class="text-xs font-medium text-dimmed">
                      이 글의 차례
                    </p>
                    <span class="text-xs font-semibold tabular-nums text-violet-700 dark:text-violet-300">{{ Math.round(진행 * 100) }}%</span>
                  </div>
                  <ol class="relative mt-3 space-y-0.5 before:absolute before:bottom-2 before:left-[11px] before:top-2 before:w-px before:bg-(--ui-border)">
                    <li
                      v-for="(절, i) in 총회절s"
                      :key="절.키"
                    >
                      <button
                        type="button"
                        class="relative flex w-full items-start gap-3 rounded-2xl py-2 pr-2 text-left text-sm leading-snug transition-colors"
                        :class="현재절키 === 절.키 ? 'font-semibold text-highlighted' : 'text-muted hover:text-highlighted'"
                        @click="do절로(절.키)"
                      >
                        <span
                          class="relative mt-[3px] flex size-[23px] shrink-0 items-center justify-center rounded-full text-[11px] tabular-nums ring-4 ring-(--ui-bg)"
                          :class="현재절키 === 절.키 ? 'bg-violet-600 font-semibold text-white dark:bg-violet-500' : 절번호(절.키) < 현재절번호 ? 'bg-accented text-default' : 'bg-elevated text-dimmed'"
                        >{{ i + 1 }}</span>
                        <span class="pt-[3px]">{{ 절.제목 }}</span>
                      </button>
                    </li>
                  </ol>
                </nav>

                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="도구 in 문서도구s"
                    :key="도구.이름"
                    type="button"
                    class="inline-flex h-9 items-center gap-1.5 rounded-full bg-elevated px-3.5 text-sm font-medium text-default transition-colors hover:bg-accented"
                  >
                    <UIcon
                      :name="도구.아이콘"
                      class="size-4 text-muted"
                    />
                    {{ 도구.이름 }}
                  </button>
                </div>

                <div class="rounded-[24px] p-4 ring-1 ring-default @4xl:ring-0 @4xl:p-0">
                  <p class="text-xs font-medium text-dimmed">
                    다음에 읽을 것
                  </p>
                  <div class="mt-2 space-y-1">
                    <article
                      v-for="자료 in 곁자료of(총회곁자료ids)"
                      :key="자료.id"
                      class="-mx-2 flex cursor-pointer items-center gap-3 rounded-2xl p-2 transition-colors hover:bg-elevated"
                      @click="do열기(자료)"
                    >
                      <Reuse배지
                        :형식="대표형식(자료)"
                        크기="sm"
                      />
                      <div class="min-w-0">
                        <p class="line-clamp-2 text-sm font-medium leading-snug text-highlighted">
                          {{ 자료.제목 }}
                        </p>
                        <p class="mt-0.5 text-xs text-muted">
                          {{ 곁말(자료) }}
                        </p>
                      </div>
                    </article>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>

        <!-- ══ 문서 상세 B · 요약 먼저 ════════════════════════════════ -->
        <div
          v-else-if="안키 === '요약먼저'"
          class="px-5 pb-10 pt-6 @3xl:px-10 @3xl:pt-8"
        >
          <div class="mx-auto max-w-[720px]">
            <Reuse뒤로 />
            <h2 class="mt-5 text-balance text-[28px] font-bold leading-[1.2] tracking-tight text-highlighted @3xl:text-[38px]">
              {{ 총회.제목 }}
            </h2>

            <!-- 세 줄 먼저 — 파스텔 카드. 곁말(분량·날짜·태그)이 카드 밑단에 모인다 -->
            <div
              class="mt-6 rounded-[28px] p-5 @3xl:p-7"
              :style="{ background: 요약칠 }"
            >
              <p class="flex items-center gap-1.5 text-sm font-semibold text-violet-800 dark:text-violet-200">
                <UIcon
                  name="i-lucide-sparkles"
                  class="size-4"
                />
                세 줄로 먼저
              </p>
              <ol class="mt-4 space-y-2.5">
                <li
                  v-for="(핵심, i) in 총회핵심s"
                  :key="핵심"
                  class="flex items-start gap-3 rounded-2xl bg-default/75 px-3.5 py-3 text-[15px] leading-relaxed text-default backdrop-blur"
                >
                  <span class="mt-px flex size-6 shrink-0 items-center justify-center rounded-full bg-inverted text-xs font-semibold tabular-nums text-inverted">{{ i + 1 }}</span>
                  <span><Reuse글 :글="핵심" /></span>
                </li>
              </ol>
              <div class="mt-5 flex flex-wrap items-center gap-2 text-sm text-default">
                <span class="inline-flex h-7 items-center gap-1.5 rounded-full bg-default/75 px-3 font-medium tabular-nums">
                  <UIcon
                    name="i-lucide-clock-3"
                    class="size-3.5 text-muted"
                  />
                  읽기 {{ 총회.읽기분 }}분 · {{ 총회.글자수!.toLocaleString('ko-KR') }}자
                </span>
                <span class="inline-flex h-7 items-center rounded-full bg-default/75 px-3 tabular-nums text-muted">{{ 날짜(총회.올린날) }} 올림</span>
                <Reuse태그 :태그="총회.태그" />
              </div>
            </div>
          </div>

          <!-- 차례 띠 — 알약 줄이 위에 붙어 따라오고, 밑단에 읽은 만큼 선이 찬다 -->
          <div class="sticky top-3 z-10 mx-auto mt-8 max-w-[720px] before:pointer-events-none before:absolute before:-inset-x-5 before:-top-3 before:-bottom-6 before:-z-10 before:bg-default before:[mask-image:linear-gradient(to_bottom,#000_60%,transparent)]">
            <div class="relative overflow-clip rounded-full bg-default/85 ring-1 ring-default backdrop-blur m-층-떠있음">
              <div
                ref="차례띠El"
                class="flex gap-1 overflow-x-auto p-1.5 [mask-image:linear-gradient(to_right,#000_calc(100%-36px),transparent)] [scrollbar-width:none]"
              >
                <button
                  v-for="(절, i) in 총회절s"
                  :key="절.키"
                  type="button"
                  :data-차례="절.키"
                  class="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-sm transition-colors"
                  :class="현재절키 === 절.키 ? 'bg-inverted font-semibold text-inverted' : 'text-muted hover:bg-elevated hover:text-highlighted'"
                  @click="do절로(절.키)"
                >
                  <span class="text-xs tabular-nums opacity-60">{{ i + 1 }}</span>
                  {{ 짧은제목(절.제목) }}
                </button>
              </div>
              <div
                class="absolute bottom-0 left-0 h-[3px] transition-[width] duration-150"
                :style="{ width: `${진행 * 100}%`, background: 진행띠칠 }"
              />
            </div>
          </div>

          <article
            data-글
            class="mx-auto mt-6 max-w-[720px]"
          >
            <Reuse본문 :번호="true" />
          </article>

          <section class="mx-auto mt-14 max-w-[720px]">
            <p class="text-sm font-semibold text-highlighted">
              다 읽었다면, 다음은
            </p>
            <div class="mt-3 grid gap-3 @xl:grid-cols-3">
              <article
                v-for="자료 in 곁자료of(총회곁자료ids)"
                :key="자료.id"
                class="flex cursor-pointer flex-col gap-3 rounded-[22px] p-4 ring-1 ring-default transition hover:-translate-y-0.5"
                :style="{ background: `linear-gradient(to bottom, ${파스텔(형식칠[대표형식(자료)].옅은, 40)}, var(--ui-bg) 75%)` }"
                @click="do열기(자료)"
              >
                <Reuse배지
                  :형식="대표형식(자료)"
                  크기="sm"
                />
                <p class="line-clamp-2 text-sm font-semibold leading-snug text-highlighted">
                  {{ 자료.제목 }}
                </p>
                <p class="mt-auto text-xs text-muted">
                  {{ 곁말(자료) }}
                </p>
              </article>
            </div>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { createReusableTemplate, useEventListener } from '@vueuse/core'
import {
  자료s,
  태그s,
  이관단계s,
  이관곁자료ids,
  총회핵심s,
  총회머리글,
  총회절s,
  총회곁자료ids,
  type i자료,
  type i형식
} from './_자료표본'

definePageMeta({
  제목: '자료 · 목록과 상세 일곱 안'
})

type i배지형식 = i형식 | '글'
type i배지크기 = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

const [Define배지, Reuse배지] = createReusableTemplate<{ 형식: i배지형식, 크기?: i배지크기 }>()
const [Define태그, Reuse태그] = createReusableTemplate<{ 태그: string, 작게?: boolean, 흰?: boolean }>()
const [Define글, Reuse글] = createReusableTemplate<{ 글: string }>()
const [Define태그줄, Reuse태그줄] = createReusableTemplate()
const [Define검색, Reuse검색] = createReusableTemplate<{ 높게?: boolean }>()
const [Define빈칸, Reuse빈칸] = createReusableTemplate()
const [Define뒤로, Reuse뒤로] = createReusableTemplate()
const [Define본문, Reuse본문] = createReusableTemplate<{ 번호: boolean }>()

// ─────────────────────────────────────────────────────────────────────────────
// 안·손잡이
// ─────────────────────────────────────────────────────────────────────────────

type i화면 = '목록' | '파일 상세' | '문서 상세'
type i안키 = '선반' | '카드' | '서가' | '받는곳' | '미리보기' | '옆차례' | '요약먼저'

const 안s: { 키: i안키, 화면: i화면, 이름: string, 왜: string, 대가: string }[] = [
  {
    키: '선반',
    화면: '목록',
    이름: 'A · 두 선반',
    왜: '받는 것과 읽는 것을 처음부터 다른 선반에 둔다 — 위는 형식 배지 + 「받기」 알약 카드, 아래는 주제 타일 + 「읽기 N분」 줄. 칸의 뜻이 선반마다 한 가지라 섞일 일이 없다.',
    대가: '「형태」 칩이 선반 이름으로 녹아 사라진다. 한쪽이 길어지면(파일 30개) 읽을거리가 한참 아래로 밀려서, 선반마다 「더 보기」가 필요해진다.'
  },
  {
    키: '카드',
    화면: '목록',
    이름: 'B · 형식 카드',
    왜: '모든 자료가 같은 카드다. 표지 색이 곧 형식(PDF 빨강·XLSX 초록·글 호박)이고, 밑단의 **행동 칸이 같은 자리 같은 모양**이라 동사(받기/읽기)와 곁말(형식·크기 / 분·자)만 바뀐다.',
    대가: '카드 한 장이 커서 한 화면에 여섯~아홉 건. 제목으로 훑어 찾는 사람(운영자)에게는 A·C 보다 느리다. 형식 색 다섯이 테마 축 밖에 선다.'
  },
  {
    키: '서가',
    화면: '목록',
    이름: 'C · 서가',
    왜: '태그를 주 거르개로 세운다 — 넓으면 왼쪽 세로 서가(건수 포함), 좁으면 옆으로 미는 알약. 줄은 배지·제목·곁말 한 줄·둥근 행동 단추로, 곁말이 열이 아니라 글이라 「PDF · 3.2MB」 와 「읽기 4분」 이 각자 이름을 달고 선다.',
    대가: '태그가 하나뿐인 자료만 맞는 구조다(지금 표본은 전부 하나). 여럿이 되면 서가 칸과 줄의 알약이 어긋난다. 파일·문서가 한 목록에 섞이는 건 그대로라 배지가 그 일을 혼자 진다.'
  },
  {
    키: '받는곳',
    화면: '파일 상세',
    이름: 'A · 받는 곳',
    왜: '상세의 할 일은 받기 하나라 가운데 카드 한 장에 다 모았다 — 겹친 형식 배지(몇 개를 받는지 그림으로), 제목·요약, 파일마다 이름·형식·크기·쪽과 받기. 아래는 PDF 안의 일곱 단계를 쪽 번호와 함께, 곁 자료 셋.',
    대가: '가운데 640px 한 줄이라 넓은 화면에서 좌우가 빈다(지금 판의 「빈 페이지」 느낌이 폭만 좁혀 남는다). 레일이 없어 인쇄·링크 복사 자리가 없다.'
  },
  {
    키: '미리보기',
    화면: '파일 상세',
    이름: 'B · 미리보기 레일',
    왜: '신청 상세의 2단 문법은 지키고 비던 왼쪽을 **파일 속 미리 보기**(쪽 세 장)와 선 적은 단계 표로 채운다. 레일은 받기 카드(주 파일은 검은 알약, 템플릿은 테두리 알약)가 따라온다. 좁으면 레일이 머리 바로 아래로 — 받기가 먼저.',
    대가: '미리 보기는 쪽 썸네일이 있어야 산다 — 올릴 때 PDF 첫 쪽들을 그려 두는 일(스토리지·변환)이 새로 생긴다. 없으면 이 칸을 걷어야 하고 그러면 A 와 가까워진다.'
  },
  {
    키: '옆차례',
    화면: '문서 상세',
    이름: 'A · 옆 차례',
    왜: '읽기 칸(680px·줄간 1.85)은 지금처럼 두고, 비던 레일에 **차례 + 읽은 %** 를 붙인다. 지금 절이 보라 동그라미로 켜지고 지난 절은 옅게 찬다. 좁으면 차례가 진행 고리 달린 알약 하나로 접혀 위에 붙는다.',
    대가: '절이 다섯 개 이하면 차례가 레일에서 짧아 아래 「다음에 읽을 것」과 무게가 비슷해진다. 조항표는 좁은 폭에서 카드로 바꿔 그리므로 본문 렌더러(md)에 표→카드 규칙이 하나 는다.'
  },
  {
    키: '요약먼저',
    화면: '문서 상세',
    이름: 'B · 요약 먼저',
    왜: '「읽기 4분」 짜리 법 해설을 끝까지 안 읽는 사람이 대부분이다 — 파스텔 카드에 **세 줄 요약**을 먼저 두고 분량·날짜·태그를 그 밑단에 모았다. 차례는 가로 알약 띠로 위에 붙어 따라오고 밑단 선이 읽은 만큼 찬다.',
    대가: '세 줄은 누가 써야 한다 — 자료에 「핵심」 칸이 새로 생기거나 AI 요약을 받아야 한다. 가운데 한 줄 배치라 넓은 화면의 좌우는 빈다.'
  }
]

const 화면 = ref<i화면>('목록')
const 폭 = ref<'넓게' | '폰'>('넓게')
const 안키 = ref<i안키>('선반')

const 화면안s = computed(() => 안s.filter(안 => 안.화면 === 화면.value))
const 판 = computed(() => 안s.find(안 => 안.키 === 안키.value)!)

watch(화면, (새) => {
  if (판.value.화면 !== 새) 안키.value = 화면안s.value[0]!.키
})

const 손잡이s = [
  { 이름: '화면', 값s: ['목록', '파일 상세', '문서 상세'], 현재: 화면 as Ref<string> },
  { 이름: '폭', 값s: ['넓게', '폰'], 현재: 폭 as Ref<string> }
]

// ─────────────────────────────────────────────────────────────────────────────
// 거르기 — 판 안에서만 돈다
// ─────────────────────────────────────────────────────────────────────────────

const 고른태그 = ref<string | null>(null)
const 고른형태 = ref<'전체' | '파일' | '문서'>('전체')
const 검색 = ref('')

const 태그걸린자료s = computed(() => 자료s.filter((자료) => {
  if (고른태그.value && 자료.태그 !== 고른태그.value) return false
  const 말 = 검색.value.trim()
  return !말 || `${자료.제목} ${자료.요약}`.includes(말)
}))
const 보이는자료s = computed(() => 태그걸린자료s.value.filter(자료 => 고른형태.value === '전체' || 자료.형태 === 고른형태.value))
const 보이는파일s = computed(() => 보이는자료s.value.filter(자료 => 자료.형태 === '파일'))
const 보이는문서s = computed(() => 보이는자료s.value.filter(자료 => 자료.형태 === '문서'))

const 형태s = computed(() => (['전체', '파일', '문서'] as const).map(값 => ({
  값,
  수: 태그걸린자료s.value.filter(자료 => 값 === '전체' || 자료.형태 === 값).length
})))

const do조건지우기 = () => {
  고른태그.value = null
  고른형태.value = '전체'
  검색.value = ''
}

/** 안을 바꾸면 거르개는 비운다 — A 에는 형태 손잡이가 없어서, B 에서 건 「문서」가 A 의 파일 선반을 몰래 지운다. */
watch(안키, do조건지우기)

// ─────────────────────────────────────────────────────────────────────────────
// 표본 꺼내기
// ─────────────────────────────────────────────────────────────────────────────

const 이관 = 자료s.find(자료 => 자료.id === 13)!
const 총회 = 자료s.find(자료 => 자료.id === 9)!

const 곁자료of = (ids: number[]) => ids.map(id => 자료s.find(자료 => 자료.id === id)!)
const 대표형식 = (자료: i자료): i배지형식 => 자료.파일s[0]?.형식 ?? '글'
const 곁말 = (자료: i자료) => 자료.형태 === '파일'
  ? `${자료.파일s.map(파일 => 파일.형식).join(' · ')} · ${자료.파일s[0]!.크기}`
  : `읽기 ${자료.읽기분}분`
const 날짜 = (값: string) => {
  const [, 월, 일] = 값.split('-').map(Number)
  return `${월}월 ${일}일`
}
const 조각s = (글: string) => 글.split('**').map((t, i) => ({ t, 굵게: i % 2 === 1 }))
/** 가로 차례 띠의 짧은 이름 — 긴 절 제목은 알약에서 한 줄을 넘는다 */
const 짧은제목 = (제목: string) => 제목.replace(/^사단법인 총회에 적용되는 /, '').replace(/ — .*$/, '').replace(/\(.*\)/, '')

/** 목록에서 누르면 표본 상세로 간다 — 파일은 13번, 문서는 9번 한 벌뿐이다. */
const do열기 = (자료: i자료) => {
  화면.value = 자료.형태 === '파일' ? '파일 상세' : '문서 상세'
  판El.value?.scrollIntoView({ block: 'start' })
}

const 파일도구s = [
  { 이름: '링크 복사', 아이콘: 'i-lucide-link' },
  { 이름: '인쇄', 아이콘: 'i-lucide-printer' }
]
const 문서도구s = [
  { 이름: '인쇄·보기', 아이콘: 'i-lucide-printer' },
  { 이름: '링크 복사', 아이콘: 'i-lucide-link' }
]

const 미리보기쪽s = [
  { 번호: 1, 이름: '표지', 모양: '표지' },
  { 번호: 2, 이름: '차례', 모양: '차례' },
  { 번호: 5, 이름: '합치기 표', 모양: '표' }
] as const

// ─────────────────────────────────────────────────────────────────────────────
// 칠 — 형식·태그 색은 테마 축 밖이다(머리말)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * 진한 = 배지 면(흰 글자가 4.5:1 넘게 읽히는 700 대), 옅은 = 파스텔로 섞을 원색, 글 = 곁말에 쓰는 형식 글자.
 * HWP 는 한컴의 파랑이 DOCX 남색과 붙어 버려서 청록으로 갈랐다.
 */
const 형식칠: Record<i배지형식, { 진한: string, 옅은: string, 글: string }> = {
  PDF: { 진한: '#DC2626', 옅은: '#FECACA', 글: 'text-red-700 dark:text-red-300' },
  HWP: { 진한: '#0E7490', 옅은: '#A5F3FC', 글: 'text-cyan-800 dark:text-cyan-300' },
  XLSX: { 진한: '#15803D', 옅은: '#BBF7D0', 글: 'text-green-800 dark:text-green-300' },
  DOCX: { 진한: '#4338CA', 옅은: '#C7D2FE', 글: 'text-indigo-700 dark:text-indigo-300' },
  글: { 진한: '#B45309', 옅은: '#FDE68A', 글: 'text-amber-800 dark:text-amber-300' }
}

const 태그칠: Record<string, { 색: string, 아이콘: string, 글: string }> = {
  가이드: { 색: '#C7D2FE', 아이콘: 'i-lucide-compass', 글: 'text-indigo-700 dark:text-indigo-200' },
  서식: { 색: '#BAE6FD', 아이콘: 'i-lucide-pen-line', 글: 'text-sky-800 dark:text-sky-200' },
  체크리스트: { 색: '#BBF7D0', 아이콘: 'i-lucide-list-checks', 글: 'text-green-800 dark:text-green-200' },
  보고서: { 색: '#FBCFE8', 아이콘: 'i-lucide-chart-pie', 글: 'text-pink-800 dark:text-pink-200' },
  법령: { 색: '#DDD6FE', 아이콘: 'i-lucide-scale', 글: 'text-violet-800 dark:text-violet-200' },
  회계: { 색: '#FDE68A', 아이콘: 'i-lucide-receipt-text', 글: 'text-amber-800 dark:text-amber-200' }
}

const 배지크기: Record<i배지크기, { 틀: string, 글: string, 아이콘: string }> = {
  xs: { 틀: 'w-4 h-[19px]', 글: 'text-[0px]', 아이콘: 'size-2.5' },
  sm: { 틀: 'w-8 h-[38px]', 글: 'text-[7.5px]', 아이콘: 'size-3.5' },
  md: { 틀: 'w-10 h-12', 글: 'text-[9px]', 아이콘: 'size-4' },
  lg: { 틀: 'w-14 h-[67px]', 글: 'text-[12px]', 아이콘: 'size-6' },
  xl: { 틀: 'w-[76px] h-[91px]', 글: 'text-[16px]', 아이콘: 'size-8' }
}

/**
 * 파스텔은 `--ui-bg` 에 섞는다. 섞는 양에 `--파스텔`(라이트 1 · 다크 0.3, 판 뿌리에 적음)을 곱한다 —
 * 다크 바탕에 라이트만큼 섞으면 흙빛 회색이 된다(로그인 창 판에서 실측).
 */
const 파스텔 = (색: string, 양 = 55) => `color-mix(in oklab, ${색} calc(${양}% * var(--파스텔, 1)), var(--ui-bg))`

/** 형식 표지 — 위가 가장 진하고 아래로 바탕에 녹는다. 끝을 100% 가 아니라 앞에 둬서 반 픽셀 선이 안 선다. */
const 표지칠 = (형식: i배지형식, 양 = 55) => [
  'linear-gradient(to bottom, transparent 30%, var(--ui-bg) 96%)',
  `radial-gradient(80% 120% at 0% 0%, ${파스텔(형식칠[형식].옅은, 양 + 20)}, transparent 70%)`,
  파스텔(형식칠[형식].옅은, 양)
].join(', ')

const 서가칸s = computed(() => [
  { 이름: '전체', 값: null, 아이콘: 'i-lucide-library-big', 글: 'text-default', 바탕: 'var(--ui-bg-accented)', 수: 자료s.length },
  ...태그s.map(태그 => ({
    이름: 태그,
    값: 태그 as string | null,
    아이콘: 태그칠[태그]!.아이콘,
    글: 태그칠[태그]!.글,
    바탕: 파스텔(태그칠[태그]!.색, 80),
    수: 자료s.filter(자료 => 자료.태그 === 태그).length
  }))
])

const 받는곳머리칠 = [
  'linear-gradient(to bottom, transparent 40%, var(--ui-bg) 94%)',
  `radial-gradient(55% 70% at 20% 0%, ${파스텔('#FECACA', 80)}, transparent 70%)`,
  `radial-gradient(50% 70% at 85% 10%, ${파스텔('#BBF7D0', 75)}, transparent 70%)`,
  `radial-gradient(60% 60% at 50% 60%, ${파스텔('#FDE68A', 45)}, transparent 70%)`,
  파스텔('#FFF1F2', 60)
].join(', ')

const 미리보기바탕 = [
  `radial-gradient(60% 80% at 0% 0%, ${파스텔('#FECACA', 45)}, transparent 70%)`,
  `radial-gradient(60% 80% at 100% 100%, ${파스텔('#C7D2FE', 45)}, transparent 70%)`,
  'var(--ui-bg-muted)'
].join(', ')

const 요약칠 = [
  `radial-gradient(70% 90% at 0% 0%, ${파스텔('#DDD6FE', 90)}, transparent 70%)`,
  `radial-gradient(60% 80% at 100% 100%, ${파스텔('#BAE6FD', 75)}, transparent 70%)`,
  `radial-gradient(40% 60% at 100% 0%, ${파스텔('#FBCFE8', 70)}, transparent 70%)`,
  파스텔('#EEF2FF', 70)
].join(', ')

const 진행띠칠 = 'linear-gradient(to right, #A78BFA, #8B5CF6)'

/** 폰 무대 — 뒤에 흐린 화면이 깔린 느낌만. */
const 무대바탕 = `radial-gradient(40% 50% at 20% 30%, ${파스텔('#C7D2FE', 30)}, transparent), radial-gradient(40% 50% at 80% 70%, ${파스텔('#FBCFE8', 30)}, transparent), var(--ui-bg-muted)`

// ─────────────────────────────────────────────────────────────────────────────
// 읽은 만큼 · 지금 절 — 창 스크롤로 잰다(판은 스크롤 상자가 아니다: `overflow-clip` 이라 sticky 가 산다)
// ─────────────────────────────────────────────────────────────────────────────

const 판El = ref<HTMLElement>()
const 차례띠El = ref<HTMLElement>()
const 진행 = ref(0)
const 현재절키 = ref(총회절s[0]!.키)
const is차례열림 = ref(false)

const 절번호 = (키: string) => 총회절s.findIndex(절 => 절.키 === 키) + 1
const 현재절번호 = computed(() => 절번호(현재절키.value))
const 현재절 = computed(() => 총회절s.find(절 => 절.키 === 현재절키.value))

/** 절 머리가 이 선(창 위에서 px)을 넘으면 그 절을 읽는 중으로 본다 */
const 기준선 = 140

const 재기 = () => {
  const 글 = 판El.value?.querySelector<HTMLElement>('[data-글]')
  if (!글) return
  const r = 글.getBoundingClientRect()
  const 전체 = r.height - (window.innerHeight - 기준선)
  진행.value = 전체 > 0 ? Math.min(1, Math.max(0, (기준선 - r.top) / 전체)) : 1
  let 키 = 총회절s[0]!.키
  판El.value!.querySelectorAll<HTMLElement>('[data-절]').forEach((절) => {
    if (절.getBoundingClientRect().top < 기준선 + 20) 키 = 절.dataset.절!
  })
  현재절키.value = 키
}

useEventListener(window, 'scroll', 재기, { passive: true })
useEventListener(window, 'resize', 재기, { passive: true })
onMounted(재기)
watch([안키, 폭], () => nextTick(재기))

/** 가로 차례 띠(B)에서 지금 절 알약이 늘 보이게 민다 */
watch(현재절키, (키) => {
  const 알약 = 차례띠El.value?.querySelector<HTMLElement>(`[data-차례="${키}"]`)
  const 띠 = 차례띠El.value
  if (!알약 || !띠) return
  띠.scrollTo({ left: 알약.offsetLeft - 띠.clientWidth / 2 + 알약.clientWidth / 2, behavior: 'smooth' })
})

const do절로 = (키: string) => {
  is차례열림.value = false
  const 절 = 판El.value?.querySelector<HTMLElement>(`[data-절="${키}"]`)
  if (!절) return
  window.scrollTo({ top: window.scrollY + 절.getBoundingClientRect().top - 90, behavior: 'smooth' })
}
</script>

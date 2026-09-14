<!--
  neutral 검토대 — 테마가 컨트롤에 어떻게 앉는지 한 화면에 깔아 놓고,
  **색이 남은 자리를 눈과 Tab 으로 찾는** 상설 판.

  ## 옳게 보이는 상태는 하나다

  **컨트롤은 전부 회색조, 색은 신호에만.** 강조 버튼 하나(`역할="강조"`), 상태 배지·알림
  (success·warning·error), focus 링. 그 밖에 색이 뜨면 그 자리가 잘못된 것이다.

  왜 아무것도 안 적으면 그렇게 되나 — `app.config.ts` 의 `NEUTRAL_DEFAULTS` 가 33개 컴포넌트의
  기본 color 를 `neutral` 로 내리고, `m/테마/재질.ts` 가 variant 를 축에 맡긴다.
  **침묵이 곧 규칙을 지키는 것**이라, 규칙을 깨려면 호출부가 뭔가를 적어야 한다.

  ## 보는 법

  1. **손잡이를 끝에서 끝까지 굴린다** — 헤더의 팔레트로 도크 테마 pane 을 연다.
     재질(선만↔선+면)·진하기·강조색을 바꿔도 회색조가 유지돼야 한다.
  2. **다크에서 한 번 더 본다.** `neutral` 만 시맨틱 토큰(`bg-inverted`·`ring-accented`)을 써서
     모드별로 갈리는 값이라, 라이트에서 맞아도 다크에서 맞지 않는다.
  3. **Tab 으로 훑는다.** focus 링은 눈으로 못 찾는다.

  **손으로 적지 않는다.** 견본은 전부 배열을 돌려 만든다. 재질을 하나 늘리거나 빼면
  아래 상수(또는 그 상수가 물어보는 `m/테마/*`)만 고치면 되고, 화면이 알아서 따라온다.

  **여기는 회색조 화면이다.** 색 견본첩이 필요해서 별칭을 늘어놓고 싶어지면 「시맨틱 토큰」의
  `별칭` 줄에 붙일 것. 컨트롤로 칠하면 그 순간 이 화면이 자기 주장을 배신한다.

  ## 판정은 여기서 안 한다 (2026-09-07 에 걷음)

  「호출부의 `color="neutral"` 을 걷어도 되나」를 브라우저에게 묻던 판정표 두 벌, `variant` 축을
  끊는 prop 을 찾던 진단 줄, mIcon 의 죽은 prop 을 재던 칸 — 셋 다 **끝난 조사**였다.
  결론은 각각 코드로 내려갔다(`app.config` 목록 대조 · `style1.vue` 의 `inheritAttrs: false` ·
  `m/Icon.vue` 에서 죽은 prop 삭제).

  남겨 두면 **사람이 화면을 열어야만 도는 검사**가 된다 — 페이지가 늘면 아무도 안 연다.
  그 일은 「회색조 규약」(`eslint.회색조.mjs`)이 한다 — `bun run lint:색` 한 줄이 리포 전체를 훑고,
  IDE 에서는 손댄 그 줄에 바로 뜬다. 세운 날 97건이 나왔고 같은 날 0 으로 걷었다.
  이 판이 지금 맡은 것은 **린트가 못 보는 것**뿐이다 — 축을 굴렸을 때 회색조가 유지되는지,
  다크에서 무너지지 않는지, 경계 대비가 몇인지.

  ## 같이 보는 것

  - `eslint.회색조.mjs`            — 회색조 규약(호출부가 색·재질을 적는 걸 막는 자리)
  - `app/app.config.ts`            — `NEUTRAL_DEFAULTS` 33개 목록과 그 논거
  - `app/assets/css/mTheme.css`    — `:focus-visible` 에서만 강조색으로 갈아끼우는 규칙
  - `app/components/m/테마/재질.ts` — `역할`·`colorFor` (호출부가 색을 안 적는 어휘)
  - `app/components/m/테마/축s.ts`  — 테마 폴더의 정문(지도·축 정의)
  - `app/components/l/테마.vue`     — 손잡이 한 벌이 있는 곳(도크 pane). 이 판은 그걸 굴려서 본다
  - `app/components/m/Button/_/style1.vue` — `resolvedColor` (적으면 이긴다는 규칙의 정본)
-->
<template>
  <!--
    **좌측 손잡이 레일을 걷었다 (2026-09-07).** 축 줄s 한 벌은 헤더의 팔레트 → 도크 테마 pane
    (`l/테마.vue`)에 이미 있고 **같은 컴포넌트**다(`m/테마/축줄s.vue`). 이 판의 검증법
    (「손잡이를 끝에서 끝까지 굴린다」)은 한 벌이기만 하면 성립하는데, 레일은 그 한 벌을 **두 벌로
    만들면서** 본문 폭까지 176px 먹고 있었다. 도크는 덮지 않고 **미는** 창이라(`useThemePane.ts`)
    굴리면서 아래 진열을 보는 왕복도 그대로 된다 — 레일이 sticky 로 하던 일이 그거였다.

    걷고 나서 남긴 것 둘은 **이 판에만 있는 것**이다 — 축의 현재 값 한 줄과 `다시 재기`.
    (본문은 옆 모래밭들처럼 `max-w-7xl` 로 세운다. 아래 실측 격자가 `min-w-[36rem]` 이라
    도크를 열어도 가로로 안 무너진다.)
  -->
  <div class="mx-auto w-full max-w-7xl px-4 py-8">
    <main class="flex min-w-0 flex-col gap-8">
      <header class="flex flex-col gap-2">
        <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
          <h1 class="text-xl font-semibold">
            neutral 검토대
          </h1>
          <!-- 축을 안 굴려도 손으로 한 번 더 (아래 실측 격자의 탐침을 다시 읽는다) -->
          <mButton
            size="xs"
            variant="ghost"
            label="다시 재기"
            icon="i-lucide-refresh-cw"
            @click="다시재기"
          />
        </div>
        <p class="text-xs text-muted">
          <b>색이 남은 컨트롤을 찾는 판</b>이다 — 아래 진열을 눈과 Tab 으로 훑는다.
          호출부가 색·재질을 적었는지는 화면이 아니라 <b>린트</b>가 본다
          (<code>bun run lint:색</code>).
        </p>
        <UAlert
          icon="i-lucide-keyboard"
          variant="subtle"
          title="focus 는 Tab 으로 확인한다"
          description="이 페이지에서 Tab 을 계속 누르면 링 색이 강조색으로 뜬다. 나머지는 전부 회색조여야 정상이다 — 색이 남아 있는 컨트롤을 찾는 것이 이 화면의 절반이다."
        />
        <!--
          축이 지금 어디 서 있나. **손잡이가 도크로 갔으니 이 줄은 더 필요해졌다** — 도크를 닫으면
          축 위치가 화면에서 통째로 사라지는데, 아래 실측 격자의 숫자를 받아 적을 때 같이 적어야
          하는 게 이 값들이다.
        -->
        <ClientOnly>
          <dl class="flex flex-wrap items-baseline gap-x-4 gap-y-1 text-[0.625rem] leading-tight text-dimmed">
            <div
              v-for="행 in 현재값s"
              :key="행.이름"
              class="flex items-baseline gap-1"
            >
              <dt>{{ 행.이름 }}</dt>
              <dd class="font-medium text-default">
                {{ 행.값 }}
              </dd>
            </div>
          </dl>
        </ClientOnly>
      </header>

      <!--
        ── 버튼: 재질 사다리 (전부 neutral) ────────────────────
        예전엔 여기가 variant × color 7열 격자였다(56칸). 걷은 이유 — **이 화면의 주장과 정반대로
        생긴 그림**이었다. 머리말에 "나머지는 전부 회색조여야 정상"이라 적어 놓고 첫 화면이
        색 견본첩이면, 눈이 먼저 배우는 건 문장이 아니라 그 격자다.

        진단으로도 안 쓰였다 — `:color` 를 손으로 박아 그린 진열이라 **색이 새는 자리를 잡아내지
        못한다**(그건 Tab 으로 훑는 일이다). 별칭 카탈로그가 필요하면 아래 「시맨틱 토큰」의
        `별칭` 견본 줄이 같은 것을 회색조 판 위에서 보여 준다.

        그래서 남은 건 앱이 실제로 쓰는 것뿐이다: neutral 사다리 한 줄. 색이 붙는 버튼은
        바로 아래 표의 `강조` 하나이므로 여기서 또 칠하지 않는다.
      -->
      <section class="flex flex-col gap-2">
        <div class="flex items-baseline gap-2 border-b border-default pb-1">
          <h2 class="text-sm font-medium">
            버튼
          </h2>
          <span class="text-xs text-dimmed">
            전부 기본값(neutral)이다. 축이 고르는 건 <b>가운데 셋</b>뿐이고, 위아래는 고정 —
            색이 붙는 버튼은 아래 표의 <b>강조</b> 하나다.
          </span>
        </div>
        <div class="flex flex-wrap items-end gap-x-4 gap-y-3">
          <div
            v-for="묶음 in 사다리묶음s"
            :key="묶음.variants[0]"
            class="relative flex items-end gap-3 pb-1 pt-4"
            :class="묶음.이름 && 'rounded-lg border border-dashed border-muted px-3'"
          >
            <span
              v-if="묶음.이름"
              class="absolute inset-x-0 top-1 text-center text-[0.5625rem] leading-none text-dimmed"
            >
              {{ 묶음.이름 }}
            </span>
            <div
              v-for="v in 묶음.variants"
              :key="v"
              class="flex flex-col items-center gap-1"
            >
              <UButton
                :variant="v"
                size="sm"
                label="버튼"
                icon="i-lucide-check"
              />
              <code class="text-[0.5625rem] leading-none text-dimmed">{{ v }}</code>
            </div>
          </div>
          <div class="flex flex-col items-center gap-1 pb-1 pt-4">
            <UButton
              variant="solid"
              size="sm"
              label="버튼"
              disabled
            />
            <code class="text-[0.5625rem] leading-none text-dimmed">disabled</code>
          </div>
        </div>
      </section>

      <!--
        ── 재질 3단 · 걷으면 무엇이 생기나 ─────────────────────
        위 줄은 Nuxt UI 의 **원재료**(variant)를 그대로 늘어놓은 것이고, 여기는 앱이 실제로 쓰는
        **어휘**다. 화면에 버튼을 놓을 때 고르는 건 위가 아니라 아래여야 한다.

        도크 테마 pane 의 `재질` 행을 돌리면 **가운데 줄만** 움직인다. 위 줄은 variant 를 직접 박은
        원재료 진열이라 안 움직이는 게 정상이다.

        마지막 열은 **린트가 왜 색을 막는지**를 눈으로 보여 주는 자리다 — 같은 역할에
        `color="neutral"` 만 얹었다. **`강조` 줄에서만 갈린다**: 색을 적으면 `재질.colorFor` 까지
        못 가서 강조색이 영영 안 붙는다(`style1.resolvedColor` 가 호출부 손을 들어 준다).
        나머지 줄이 안 갈리는 건 그 색이 **죽은 값**이라는 뜻이고, 갈리는 그 한 줄이
        **죽은 줄 알았던 값이 산 값처럼 구는** 자리다. 그래서 규약은 "적지 마라"가 된다 —
        대부분 무의미하고, 의미가 생기는 한 곳에서는 축을 끊는다.
      -->
      <section class="flex flex-col gap-2">
        <div class="flex items-baseline gap-2 border-b border-default pb-1">
          <h2 class="text-sm font-medium">
            재질 3단
          </h2>
          <span class="text-xs text-dimmed">
            테마 pane 의 <b>재질</b> 행을 돌리면 <b>가운데 줄만</b> 바뀐다.
            위(강조=solid)와 아래(조용=ghost)는 축 바깥으로 고정 — 재질을 통일해도 위계는 남게 하는 골격이다.
            <b>켜짐</b>도 어느 재질에서든 solid다.
          </span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full min-w-max border-separate border-spacing-1 text-xs">
            <thead>
              <tr>
                <th class="text-start font-normal text-dimmed" />
                <th class="px-2 text-start font-normal text-dimmed">
                  기본
                </th>
                <th class="px-2 text-start font-normal text-dimmed">
                  켜짐
                </th>
                <th class="px-2 text-start font-normal text-dimmed">
                  ＋<code>color="neutral"</code>
                </th>
                <th class="px-2 text-start font-normal text-dimmed">
                  쓰는 자리
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="r in 역할s"
                :key="r.이름"
              >
                <th class="pe-2 text-start font-normal text-dimmed">
                  {{ r.이름 }}
                </th>
                <td>
                  <mButton
                    :역할="r.역할"
                    size="sm"
                    label="버튼"
                    icon="i-lucide-check"
                  />
                </td>
                <td>
                  <mButton
                    v-if="r.역할 !== '인라인'"
                    :역할="r.역할"
                    :켜짐="true"
                    size="sm"
                    label="버튼"
                    icon="i-lucide-check"
                  />
                  <span
                    v-else
                    class="text-muted"
                  >—</span>
                </td>
                <td>
                  <mButton
                    :역할="r.역할"
                    color="neutral"
                    size="sm"
                    label="버튼"
                    icon="i-lucide-check"
                  />
                </td>
                <td class="ps-2 text-dimmed">
                  {{ r.쓰는곳 }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="text-[0.625rem] leading-relaxed text-dimmed">
          마지막 열에서 <b>갈리는 줄이 「강조」 하나뿐</b>이면 제대로 그린 것이다 —
          나머지 역할은 어차피 회색이라 색을 적으나 마나고, 강조만 색을 잃는다.
          이 한 칸이 「회색조 규약」(<code>bun run lint:색</code>)이 지키는 것 전부다.
        </p>
      </section>

      <!-- ── 입력: focus 링이 실제로 강조색으로 뜨는지 ──────────── -->
      <section class="flex flex-col gap-2">
        <div class="flex items-baseline gap-2 border-b border-default pb-1">
          <h2 class="text-sm font-medium">
            입력
          </h2>
          <span class="text-xs text-dimmed">전부 기본값(neutral)이다. Tab 으로 훑어 focus 링만 강조색인지 본다.</span>
        </div>
        <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <UInput
            placeholder="한 줄 입력"
            icon="i-lucide-search"
          />
          <UInputNumber :model-value="3" />
          <USelect
            :items="선택지s"
            :model-value="선택지s[0]"
          />
          <UTextarea
            placeholder="여러 줄 입력"
            :rows="2"
            class="sm:col-span-2 lg:col-span-1"
          />
          <div class="flex items-center gap-4">
            <UCheckbox
              :model-value="true"
              label="체크"
            />
            <USwitch :model-value="true" />
          </div>
          <URadioGroup
            :items="선택지s"
            :model-value="선택지s[0]"
            orientation="horizontal"
          />
          <USlider
            :model-value="40"
            class="self-center sm:col-span-2 lg:col-span-3"
          />
        </div>
      </section>

      <!-- ── 표시 요소 ─────────────────────────────────────────── -->
      <section class="flex flex-col gap-2">
        <div class="flex items-baseline gap-2 border-b border-default pb-1">
          <h2 class="text-sm font-medium">
            표시
          </h2>
          <span class="text-xs text-dimmed">뱃지·알림은 신호(success·error·warning)만 색이 남아야 한다.</span>
        </div>
        <div class="flex flex-col gap-3">
          <!-- 별칭 일곱을 두 줄로 늘어놓던 자리. 남는 게 신호 넷뿐이라 넷만 둔다 (짝 = 면/선) -->
          <div class="flex flex-wrap items-center gap-x-4 gap-y-2">
            <div
              v-for="c in 신호s"
              :key="c"
              class="flex items-center gap-1.5"
            >
              <UBadge
                :color="c"
                variant="subtle"
                size="sm"
                :label="c"
              />
              <UBadge
                :color="c"
                variant="solid"
                size="sm"
                :label="c"
              />
            </div>
          </div>
          <UProgress :model-value="60" />
          <UTabs
            :items="탭s"
            class="w-full"
          />
          <UStepper
            :items="단계s"
            :model-value="1"
          />
          <UBreadcrumb :items="경로s" />
          <div class="grid gap-2 sm:grid-cols-2">
            <UAlert
              v-for="c in ['neutral', 'success', 'error'] as const"
              :key="c"
              :color="c"
              variant="subtle"
              :title="`${c} 알림`"
              description="신호로 쓰는 색만 남는다."
            />
          </div>
        </div>
      </section>

      <!-- ── 시맨틱 토큰: 회색조 램프가 실제로 어떻게 서는지 ────── -->
      <section class="flex flex-col gap-2">
        <div class="flex items-baseline gap-2 border-b border-default pb-1">
          <h2 class="text-sm font-medium">
            시맨틱 토큰
          </h2>
          <span class="text-xs text-dimmed">neutral 컨트롤이 딛고 서는 바닥. 색온도 축을 굴리면 여기가 통째로 움직인다.</span>
        </div>
        <div class="flex flex-col gap-3">
          <div
            v-for="묶음 in 토큰묶음s"
            :key="묶음.이름"
            class="flex flex-col gap-1"
          >
            <span class="text-xs text-dimmed">{{ 묶음.이름 }}</span>
            <div class="flex flex-wrap gap-1">
              <div
                v-for="t in 묶음.토큰s"
                :key="t"
                class="flex w-24 flex-col gap-1"
              >
                <div
                  class="h-8 rounded-md border border-default"
                  :style="{ background: `var(--ui-${t})` }"
                />
                <span class="truncate text-[0.5625rem] leading-none text-dimmed">{{ t }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ── 진하기: 사다리 다섯 칸이 통째로 움직이는지 ────────── -->
      <section class="flex flex-col gap-2">
        <div class="flex items-baseline gap-2 border-b border-default pb-1">
          <h2 class="text-sm font-medium">
            진하기
          </h2>
          <span class="text-xs text-dimmed">
            축을 굴리면 아래 줄들이 <b>간격을 유지한 채</b> 같이 움직인다. 위 진열의 탭·스텝·체크박스·입력 테두리도 같이 간다.
          </span>
        </div>
        <div class="flex flex-col gap-1">
          <div
            v-for="칸 in 진하기칸s"
            :key="칸.class"
            class="flex items-baseline gap-3"
          >
            <code class="w-32 shrink-0 text-[0.625rem] text-dimmed">{{ 칸.class }}</code>
            <span
              :class="칸.class"
              class="text-sm"
            >{{ 칸.설명 }}</span>
          </div>
        </div>
        <!-- 부품 칸 — 위 진열에서 실제로 칠해지는 자리를 견본으로 한 번 더 (스크롤 없이 옆에서 비교되게) -->
        <div class="flex flex-wrap items-center gap-3 pt-1">
          <div
            v-for="부 in 진하기부품s"
            :key="부.이름"
            class="flex items-center gap-1.5"
          >
            <span
              class="size-5 rounded"
              :class="부.class"
            />
            <code class="text-[0.625rem] text-dimmed">{{ 부.이름 }}</code>
          </div>
        </div>
        <!--
          옆에 나란히 둬야 "지금 몇 칸짜리 중 어디"가 읽힌다 — 사다리를 보면서 굴리는 자리라
          도크를 여는 한 단계가 끼면 안 된다. 이 판에 남은 유일한 손잡이고, 두 줄뿐이라
          「한 벌은 도크」와 다투지 않는다(`decisions/theme/*` 가 하는 것과 같은 자리 손잡이).
        -->
        <ClientOnly>
          <div class="pt-1">
            <M테마축줄s
              :줄s="['진하기', '선 진하기']"
              class="w-fit"
            />
          </div>
        </ClientOnly>
      </section>

      <!-- ── 그림자: 층 넷이 갈리는지 + 다크 후광이 층별로 다른지 ──── -->
      <section class="flex flex-col gap-2">
        <div class="flex items-baseline gap-2 border-b border-default pb-1">
          <h2 class="text-sm font-medium">
            그림자 (층 사다리)
          </h2>
          <span class="text-xs text-dimmed">
            축을 굴리면 넷이 <b>간격을 유지한 채</b> 같이 오르내린다. 어둡게에서는 채널이 갈린다 —
            검은 그림자 대신 <b>흰 후광</b>이 진다(색만 뒤집히고 아래로 번지는 방향은 그대로 —
            판 뒤에 숨은 간접조명). 경계는 각 칸의 테두리가 진다. 조합을 고르는 판은
            <code>decisions/theme/depth-dark</code>.
          </span>
        </div>
        <!-- 바닥(`bg-page`) 위에 종이를 얹어야 층이 읽힌다. 종이 위에 종이를 얹으면 안 갈린다 -->
        <div class="flex flex-wrap gap-4 rounded-lg bg-page p-6">
          <div
            v-for="층 in 층칸s"
            :key="층.이름"
            class="flex w-32 flex-col gap-1.5 rounded-lg border border-default bg-default p-3"
            :class="층.class"
          >
            <span class="text-xs text-highlighted">{{ 층.이름 }}</span>
            <code class="text-[0.5625rem] leading-tight text-dimmed">{{ 층.class || '(안 적음)' }}</code>
          </div>
        </div>
      </section>

      <!-- ── 재질 × 진하기: 두 축이 서로를 지우는 구간 ──────────── -->
      <section class="flex flex-col gap-2">
        <div class="flex items-baseline gap-2 border-b border-default pb-1">
          <h2 class="text-sm font-medium">
            재질 × 진하기
          </h2>
          <span class="text-xs text-dimmed">경계를 나르는 축은 이 둘뿐이다. 15칸이 전부고, 숫자는 브라우저에서 잰 실측이다.</span>
        </div>

        <!--
          왜 이 격자가 있나 — 축이 여섯인데 조합을 다 볼 수는 없다. 하지만 **경계 신호를 나르는 축은
          재질과 진하기 둘뿐이다.** 색·글꼴·라운드·그림자는 "여기가 컨트롤이다"를 말하지 않는다.
          그래서 볼 것은 곱집합 전체가 아니라 3×5=15칸이고, 15칸은 한 화면에 들어간다.

          각 재질이 경계를 무엇으로 나르는지가 다르다 — 그래서 칸마다 재는 채널이 다르다:
            outline  선만        → 선/종이.   진하기 축을 그대로 따라간다 (라이트 -2 에서 선이 #fff)
            soft     면만        → 면/종이.   면은 축 밖이라 **진하기를 굴려도 안 변한다**
            subtle   선+면       → 둘 중 강한 쪽
          `soft` 열이 세로로 평평하고 `outline` 열이 아래에서 무너지는 게 보이면 제대로 그린 것이다.

          숫자는 주석에 적힌 실측값(`진하기.ts`)의 살아 있는 짝이다 — 팔레트를 바꾸면
          여기가 먼저 움직인다. 둘이 어긋나면 주석이 썩은 것.
        -->
        <ClientOnly>
          <div
            ref="격자el"
            class="overflow-x-auto"
          >
            <!-- 전역 탐침 — 종이·파임은 축 밖이라 행 밖에서 한 번만 잰다 -->
            <span
              data-탐침="종이"
              class="block size-px opacity-0"
              :style="{ background: 'var(--ui-bg)' }"
            />
            <span
              data-탐침="면"
              class="block size-px opacity-0"
              :style="{ background: 'var(--ui-bg-elevated)' }"
            />

            <table class="w-full min-w-[36rem] border-separate border-spacing-1 text-xs">
              <thead>
                <tr>
                  <th class="w-28 pb-1 text-left font-normal text-dimmed">
                    진하기
                  </th>
                  <th
                    v-for="v in 재질s"
                    :key="v"
                    class="pb-1 text-left font-normal text-dimmed"
                  >
                    {{ v }} <span class="text-[0.5625rem]">· {{ 채널이름[v] }}</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                <!-- 행은 진하기 5칸. 선 진하기는 독립 축이라 행마다 바뀌지 않고 지금 값 그대로 들어간다 -->
                <tr
                  v-for="(칸, ci) in 진하기options"
                  :key="칸.value"
                  :style="contrastVars(칸.value, isDark, theme.borderContrast)"
                >
                  <th
                    scope="row"
                    class="pe-2 text-left align-middle font-normal"
                  >
                    <button
                      type="button"
                      class="block text-left transition-colors hover:text-default"
                      :class="theme.contrast === 칸.value ? 'font-semibold text-highlighted' : 'text-dimmed'"
                      :title="`이 단계로 화면 전체를 바꾼다`"
                      @click="테마행.축앉히기('contrast', ci)"
                    >
                      {{ 칸.label }}
                    </button>
                    <!--
                      측정용 탐침. 이 행의 인라인 변수를 그대로 받으므로 여기서 잰 값이 곧 그 단계다.
                      `opacity-0` 이지 `hidden` 이 아닌 이유 — 안 그리면 계산된 색도 안 나온다.
                    -->
                    <span
                      :data-탐침="`${칸.value}:글자`"
                      class="block size-px opacity-0"
                      :style="{ background: 'var(--ui-text)' }"
                    />
                    <span
                      :data-탐침="`${칸.value}:선`"
                      class="block size-px opacity-0"
                      :style="{ background: 'var(--ui-border-accented)' }"
                    />
                    <!--
                      잉크(`--ui-bg-inverted`)는 안 잰다 — **재 봤더니 매 단계 본문 글자와 같은 칸이었다**
                      (라이트·다크 둘 다. `진하기.ts` 의 두 배열을 나란히 놓으면 보인다).
                      같은 숫자를 두 번 찍으면 열만 먹고 아무것도 안 알려준다.
                    -->
                    <span class="mt-0.5 block text-[0.5625rem] leading-tight tabular-nums text-dimmed">
                      글자 <b :class="비율색(비율(`${칸.value}:글자`, '종이'), 4.5)">{{ 표시(비율(`${칸.value}:글자`, '종이')) }}</b>
                    </span>
                  </th>
                  <td
                    v-for="v in 재질s"
                    :key="v"
                    class="rounded-md bg-default p-2 align-top"
                  >
                    <div class="flex flex-wrap items-center gap-1.5">
                      <UButton
                        :variant="v"
                        color="neutral"
                        size="xs"
                        label="버튼"
                      />
                      <UInput
                        :variant="v"
                        color="neutral"
                        size="xs"
                        placeholder="입력"
                        class="w-16"
                      />
                      <UBadge
                        :variant="v"
                        color="neutral"
                        size="sm"
                        label="배지"
                      />
                    </div>
                    <code
                      class="mt-1 block text-[0.625rem] tabular-nums"
                      :class="비율색(경계대비(칸.value, v), 1.05)"
                    >{{ 표시(경계대비(칸.value, v)) }}</code>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </ClientOnly>

        <p class="text-[0.625rem] leading-relaxed text-dimmed">
          읽는 법 — <b>글자</b>는 WCAG AA 4.5:1 이 기준선이고 못 넘으면 빨갛다.
          <b>경계</b>는 다르다: 1.4.11(3:1)은 <b>어느 단계로도 못 닿는 게 정상</b>이고
          (천장이 neutral-400 = 2.58:1 — `진하기.ts` 참고), 여기서 빨간 건
          <b>1.05:1 미만 = 경계가 아예 없음</b>이다. 라이트 <b>아주 연하게 × outline</b> 한 칸이
          정확히 그 자리(1.00:1 — 선이 `#fff`)고, 의도된 것이다 — 그 단계를 고른 사람은 선을 지우라고
          고른 것이라 여백과 면이 대신 가른다. <b>면(soft 열)은 1.09:1 로 세로로 평평하다</b> —
          진하기를 아무리 굴려도 안 움직인다. 그래서 그 칸에서도 컨트롤이 아주 희미하게나마 남는다.
          <br>
          <b>화면모드를 뒤집어 볼 것 — 두 모드에서 순서가 뒤집힌다.</b> 라이트는 면(1.09)이 선(기본 1.26)보다
          약한데, 다크는 면이 1.73 으로 선(기본 1.18)보다 <b>강하다</b>. 다크 <b>연하게</b> 이하에서는 선이
          1.00:1 로 사라지고(바탕과 같은 칸 — `진하기.ts` 의 `DARK_BORDER` 에 적힌 그대로다)
          면만 남는다. <b>즉 outline 은 다크 저단에서, soft 는 라이트 전 구간에서 약하다</b> —
          두 재질이 서로 다른 모드에서 무너지므로 어느 한쪽만 보고 판단하면 안 된다.
        </p>
      </section>

      <!-- ── 앱 전용 회색조 토큰 ───────────────────────────────── -->
      <section class="flex flex-col gap-2">
        <div class="flex items-baseline gap-2 border-b border-default pb-1">
          <h2 class="text-sm font-medium">
            앱 토큰
          </h2>
          <span class="text-xs text-dimmed">mTheme.css 가 든 것. 강조색이던 자리를 회색조로 옮기면서 생겼다.</span>
        </div>
        <div class="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            class="m-빈자리 flex w-full items-center justify-center gap-2 rounded-md px-3 py-4 text-sm"
          >
            <UIcon
              name="i-stash-list-add-light"
              class="size-5 text-current opacity-70"
            />
            .m-빈자리 · 눌러서 추가 (hover 해볼 것)
          </button>
          <div class="m-자리표시 flex items-center justify-center rounded-lg p-4 text-sm text-dimmed">
            .m-자리표시 · 아직 안 채워진 영역
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { 선진하기options, 재질options, 진하기options, 축값s, 축라벨, type i재질 } from '~utils/theme/축'
import { 배경s } from '~utils/theme/색'
import { contrastVars } from '~utils/theme/css'
import { 현재테마행 } from '~models/(system)'
import { useThemeStore } from '~/stores/useThemeStore'

definePageMeta({
  제목: 'neutral 검토대'
})

const theme = useThemeStore()
/**
 * 축을 **쓰는** 일은 행을 거친다 — 값 읽기는 스토어 그대로다(`m/테마/축줄s.vue` 머리말).
 * 이름이 `행` 이 아닌 이유: 이 판의 표가 `v-for="행 in 현재값s"` 로 그 이름을 이미 쓴다.
 */
const 테마행 = 현재테마행()
const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

// ── 진열 견본 ───────────────────────────────────────────────────────

/**
 * 버튼 재질 사다리 — 묶음으로 든다. 이름이 붙은 묶음만 테두리가 쳐진다.
 * 가운데가 `재질options` 그대로인 것이 요점이라 손으로 다시 적지 않는다 (`재질.ts` 가 정본).
 */
const 사다리묶음s = [
  { 이름: '', variants: ['solid'] },
  { 이름: '축이 고르는 셋', variants: [...축값s(재질options)] },
  { 이름: '', variants: ['ghost', 'link'] }
] as const

/**
 * 색이 남아도 되는 별칭. `primary` 는 여기 없다 — 배지는 상태를 말하지 행동을 유도하지 않는다.
 * (`secondary`·`info` 는 앱이 안 쓴다. 별칭 전부를 보고 싶으면 아래 「시맨틱 토큰」의 `별칭` 줄)
 */
const 신호s = ['neutral', 'success', 'warning', 'error'] as const

/**
 * 앱이 실제로 쓰는 어휘. 위 사다리가 원재료라면 이쪽이 완제품이다.
 *
 * 가운데 줄(역할 `undefined`)이 이 표의 요점이다 — **대부분의 버튼이 그 줄이고, 축이 움직이는 것도 그 줄뿐.**
 * 위아래 두 줄은 축 바깥으로 고정돼 있어서 재질을 어떻게 바꿔도 안 움직인다.
 * 값 목록은 `~base-comps/m/_스킨.ts` 의 `ROLES` 와 같아야 한다.
 */
const 역할s = [
  { 이름: '강조', 역할: '강조', 쓰는곳: '저장·신청·출력. 화면당 0~1개 — solid + 강조색 고정' },
  { 이름: '(안 적음)', 역할: undefined, 쓰는곳: '대부분. 테마 재질을 따른다 ← 축이 움직이는 자리' },
  { 이름: '조용', 역할: '조용', 쓰는곳: '툴바 아이콘. 있는지 없는지 몰라도 되는 것 — ghost 고정' },
  { 이름: '인라인', 역할: '인라인', 쓰는곳: '본문 속 링크형 — link 고정' }
] as const

const 선택지s = ['하나', '둘', '셋']
const 탭s = [{ label: '첫째' }, { label: '둘째' }, { label: '셋째' }]
const 단계s = [{ title: '접수' }, { title: '검토' }, { title: '완료' }]
const 경로s = [{ label: '고민 기록', to: '/decisions' }, { label: 'neutral 검토대' }]

/** 머리말 아래 한 줄 요약 — 축이 지금 어디 서 있는지 값으로도 보여준다 (손잡이는 도크에 있다) */
const 현재값s = computed(() => [
  { 이름: '강조색', 값: theme.primary },
  { 이름: '색온도', 값: 배경s.find(b => b.colors[5] === theme.bg)?.label ?? '—' },
  { 이름: '재질', 값: 축라벨(재질options, theme.variant) },
  { 이름: '진하기', 값: 축라벨(진하기options, theme.contrast) },
  { 이름: '선 진하기', 값: 축라벨(선진하기options, theme.borderContrast) },
  { 이름: '라운드', 값: `${theme.radius}rem` }
])

/** 사다리 다섯 칸 — 옅은 쪽부터. 위계가 순서로 읽혀야 하므로 이 순서를 바꾸지 말 것 */
const 진하기칸s = [
  { class: 'text-dimmed', 설명: 'dimmed — 비활성·구분선 옆 잔글씨' },
  { class: 'text-muted', 설명: 'muted — 설명·보조 문구 (가장 많이 쓰임)' },
  { class: 'text-toned', 설명: 'toned — 본문보다 한 칸 뒤' },
  { class: 'text-default', 설명: 'default — 본문. 이 칸이 예전의 neutral-700 자리다' },
  { class: 'text-highlighted', 설명: 'highlighted — 제목·강조' }
]

/** 부품 칸 — 글자가 아니라 컨트롤 자체의 중립색. `inverted` 가 탭·스텝·체크박스가 딛고 선 그 색이다 */
const 진하기부품s = [
  { 이름: 'border-muted', class: 'bg-transparent border border-muted' },
  { 이름: 'border', class: 'bg-transparent border border-default' },
  { 이름: 'border-accented', class: 'bg-transparent border border-accented' },
  { 이름: 'bg-inverted (탭·스텝·체크박스)', class: 'bg-inverted' }
]

/**
 * Nuxt UI 시맨틱 토큰. `--ui-` 접두사는 템플릿에서 붙이므로 여기선 뒷부분만 든다.
 * neutral 컨트롤(`bg-inverted`·`ring-accented`·`text-muted` …)이 전부 이 위에서 돈다.
 */
const 토큰묶음s = [
  { 이름: '바탕 (bg)', 토큰s: ['bg', 'bg-muted', 'bg-elevated', 'bg-accented', 'bg-inverted'] },
  { 이름: '테두리 (border)', 토큰s: ['border', 'border-muted', 'border-accented', 'border-inverted'] },
  { 이름: '글자 (text)', 토큰s: ['text-dimmed', 'text-muted', 'text-toned', 'text', 'text-highlighted'] },
  { 이름: '별칭', 토큰s: ['primary', 'secondary', 'success', 'info', 'warning', 'error'] }
] as const

/**
 * 층 사다리 견본 — 이름표 넷 + 층 0. 값을 여기 적지 않는 것이 요점이다
 * (호출부는 몇 번 층인지만 적고 px 은 축이 정한다 — `m/테마/그림자.ts`).
 */
const 층칸s = [
  { 이름: '층 0 · 종이', class: '' },
  { 이름: '1 카드', class: 'm-층-카드' },
  { 이름: '2 떠있음', class: 'm-층-떠있음' },
  { 이름: '3 드롭다운', class: 'm-층-드롭다운' },
  { 이름: '4 모달', class: 'm-층-모달' }
]

// ── 재질 × 진하기 격자 ───────────────────────────────────────────────
/** 재질 축이 고르는 셋 (`재질.ts`). solid·ghost 는 축 밖이라 여기 없다 */
const 재질s = 축값s(재질options)

/** 그 재질이 경계를 무엇으로 나르는가 — 칸마다 재는 채널이 다른 이유 */
const 채널이름: Record<i재질, string> = {
  outline: '선/종이',
  soft: '면/종이',
  subtle: '선·면'
}

const 격자el = ref<HTMLElement | null>(null)
const 잰값 = ref<Record<string, [number, number, number]>>({})

/**
 * CSS 색 문자열 → sRGB. **변환을 손으로 안 짠다** — 캔버스에 칠하고 픽셀을 읽으면
 * 브라우저가 oklch 든 뭐든 풀어 준다. 팔레트가 oklch 라(`색.ts`) 직접 변환하려면
 * oklch→oklab→LMS→선형sRGB 를 손으로 써야 하는데, 그 코드가 틀리면 **틀린 줄 모르는 숫자**가 나온다.
 */
function toRgb(css: string): [number, number, number] | null {
  const cv = document.createElement('canvas')
  cv.width = cv.height = 1
  const ctx = cv.getContext('2d', { willReadFrequently: true })
  if (!ctx) return null
  ctx.fillStyle = '#000'
  ctx.fillStyle = css
  ctx.fillRect(0, 0, 1, 1)
  const d = ctx.getImageData(0, 0, 1, 1).data
  return [d[0]!, d[1]!, d[2]!]
}

/** WCAG 상대 휘도 */
function 휘도([r, g, b]: [number, number, number]) {
  const f = (v: number) => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}

/** 탐침 두 개의 대비비. 하나라도 아직 안 재였으면 `null` */
function 비율(a: string, b: string): number | null {
  const x = 잰값.value[a]
  const y = 잰값.value[b]
  if (!x || !y) return null
  const [l1, l2] = [휘도(x), 휘도(y)].sort((p, q) => q - p) as [number, number]
  return (l1 + 0.05) / (l2 + 0.05)
}

/** 그 조합이 실제로 쓰는 경계 채널의 대비 — 재질마다 채널이 다르다 (위 `채널이름`) */
function 경계대비(step: number, v: i재질): number | null {
  const 선 = 비율(`${step}:선`, '종이')
  const 면 = 비율('면', '종이')
  if (v === 'outline') return 선
  if (v === 'soft') return 면
  if (선 == null || 면 == null) return 선 ?? 면
  return Math.max(선, 면)
}

function 표시(n: number | null) {
  return n == null ? '—' : `${n.toFixed(2)}:1`
}

/** 기준선을 못 넘으면 빨갛게. 기준은 자리마다 다르다 (글자 4.5 · 잉크 3 · 경계 1.1) */
function 비율색(n: number | null, 기준: number) {
  if (n == null) return 'text-dimmed'
  return n < 기준 ? 'text-error' : 'text-muted'
}

/**
 * 탐침을 훑어 색을 잰다. 색온도 축·화면 모드가 바뀌면 중립 램프 자체가 갈리므로 다시 잰다.
 * (진하기는 행마다 인라인이라 여기서는 안 바뀐다 — 그게 이 격자의 요점이다)
 */
function 색재기() {
  const root = 격자el.value
  if (!root) return
  const out: Record<string, [number, number, number]> = {}
  for (const el of root.querySelectorAll<HTMLElement>('[data-탐침]')) {
    const key = el.dataset['탐침']
    if (!key) continue
    const rgb = toRgb(getComputedStyle(el).backgroundColor)
    if (rgb) out[key] = rgb
  }
  잰값.value = out
}

// ── 다시 재는 때 ────────────────────────────────────────────────────
// 실측 격자는 **중립 램프 자체를 갈아치우는 둘**(색온도·화면모드)에만 반응하면 된다.
// 진하기는 행마다 인라인이라 축을 굴려도 이 탐침들은 안 움직인다 — 그게 이 격자의 요점이다.
function 다시재기() {
  nextTick(색재기)
}

onMounted(다시재기)
watch(() => [theme.bg, isDark.value], 다시재기)
</script>

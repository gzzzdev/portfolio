<!--
  기기 축 검토대 — **모바일 / 태블릿 / PC 를 어디서 가를지** 한 화면에서 재고 고르는 자리.

  ## 왜 이 판이 필요했나

  `useResponsive` 가 돌려주는 여섯 값 중 넷은 소비자가 0개고, `is데스크탑` 과 `is데스크탑_이상`
  은 같은 식이다. 3단계 축을 세우려다 만 흔적인데, 이름만 있고 아무도 안 쓰니 어긋나도 안
  들킨다. 그래서 **먼저 눈에 보이게** 깔아 놓고 값을 물려 보는 자리를 만들었다.

  터진 자리는 갤럭시 폴드였다. 펼침(≈884)이 「좁지 않다」로 판정돼 27인치와 **똑같은 마크업**을
  받는다 — 목록5 가 아는 상태가 `is미니` 참/거짓 둘뿐이라 태블릿이 갈 칸이 없다.

  ## 보는 법

  1. **창을 끝에서 끝까지 줄였다 늘린다.** 눈금 위 마커가 경계를 넘을 때 판정이 바뀐다.
  2. **실기기에서 「지금 폭 기록」을 누른다.** 폴드면 접고·펴고·눕혀서 세 번. 경계값을 옮길
     일이 생기면 그 표가 근거다 — 코드 속 리터럴은 근거가 아니다.

     **폭만으로는 못 담는 게 하나 더 있다 — 글자 배율**(2026-09-10). 안드로이드의 글꼴 크기
     설정은 뷰포트를 그대로 둔 채 글자만 곱해서, 같은 393px 안에서 레이아웃을 깬다.
     데스크톱에서 창을 줄이는 것으로도 `list2` 에 폰을 세우는 것으로도 **안 재현된다** —
     여기서 눌러 담은 `×1.40` 같은 수를 `list2` 의 「글자」 손잡이에 그대로 물려야 재현된다.
  3. **맨 아래 「이 기기에서만 드러나는 것」** — 데스크톱에서는 멀쩡해 보이는데 안드로이드에서만
     깨지는 둘(성별 글리프·아바타)을 같이 세워 뒀다. 폴드를 들고 있을 때 확인할 것.

  **색은 신호에만 쓴다.** 회색조가 기본이고, 색이 뜨는 자리는 「어긋났다」는 뜻이다 —
  죽은 축, UA 와 실측의 불일치.
-->
<template>
  <div class="mx-auto w-full max-w-(--ui-container) px-4 py-8 flex flex-col gap-8">
    <div>
      <h1 class="text-2xl font-semibold text-highlighted">
        기기 축 검토대
      </h1>
      <p class="mt-1 text-sm text-muted">
        모바일 / 태블릿 / PC 를 어디서 가를지. 경계는
        <code class="rounded bg-elevated px-1 font-mono text-xs">태블릿 {{ 기기경계.태블릿 }}</code>
        ·
        <code class="rounded bg-elevated px-1 font-mono text-xs">PC {{ 기기경계.PC }}</code>
        — 정본은 <code class="font-mono text-xs">decisions/device/_기기.ts</code>
      </p>
    </div>

    <!-- ── 지금 이 기기 ──────────────────────────────────────────────── -->
    <section class="rounded-xl border border-default p-4">
      <div class="mb-3 flex items-center gap-2">
        <h2 class="text-sm font-medium text-highlighted">
          지금 이 기기
        </h2>
        <!-- 창 크기와 달리 글자 배율은 **이벤트로 안 온다** — 설정을 바꾸고 돌아오면 직접 눌러 다시 잰다. -->
        <mButton
          역할="조용"
          size="xs"
          icon="i-lucide-refresh-cw"
          label="글자 다시 재기"
          @click="재기"
        />
      </div>

      <div class="flex flex-wrap items-end gap-x-8 gap-y-4">
        <div>
          <div class="text-xs text-dimmed">
            판정
          </div>
          <div class="text-3xl font-semibold text-highlighted tabular-nums">
            {{ 마운트됨 ? 기기 : '—' }}
          </div>
        </div>
        <div>
          <div class="text-xs text-dimmed">
            뷰포트
          </div>
          <div class="text-3xl font-semibold text-highlighted tabular-nums">
            {{ 마운트됨 ? `${폭} × ${높이}` : '—' }}
          </div>
        </div>
        <div>
          <div class="text-xs text-dimmed">
            방향
          </div>
          <div class="text-xl text-highlighted">
            {{ 마운트됨 ? 방향 : '—' }}
          </div>
        </div>
        <div>
          <div class="text-xs text-dimmed">
            입력 <span class="text-dimmed">(폭과 직교)</span>
          </div>
          <div class="text-xl text-highlighted">
            {{ 마운트됨 ? (is터치 ? '손가락' : '포인터') : '—' }}
            <span class="text-sm text-muted">· hover {{ 마운트됨 ? (is호버없음 ? '없음' : '있음') : '—' }}</span>
          </div>
        </div>
        <!--
          **글자 배율도 폭과 직교다.** 색이 뜨면 「이 기기는 기본 글자 크기가 아니다」 —
          판이 그리는 393px 그림과 실기기가 여기서 갈린다.
        -->
        <div>
          <div class="text-xs text-dimmed">
            글자 <span class="text-dimmed">(폭과 직교)</span>
          </div>
          <div
            class="text-xl tabular-nums"
            :class="글자어긋남 ? 'text-warning' : 'text-highlighted'"
          >
            {{ 마운트됨 ? `×${글자배율.toFixed(2)}` : '—' }}
            <span class="text-sm text-muted">
              · 루트 {{ 마운트됨 ? 루트px.toFixed(1) : '—' }}px
              · 못박은 {{ 마운트됨 ? 못박은px.toFixed(1) : '—' }}px
            </span>
          </div>
        </div>
        <div>
          <div class="text-xs text-dimmed">
            화소비
          </div>
          <div class="text-xl text-highlighted tabular-nums">
            {{ 마운트됨 ? `×${화소비.toFixed(2)}` : '—' }}
          </div>
        </div>
      </div>

      <!-- 눈금. 경계가 폭 위 어디에 서 있는지가 표보다 빨리 읽힌다. -->
      <div class="mt-6">
        <div class="relative h-14">
          <!-- 세 칸 -->
          <div class="absolute inset-x-0 top-4 flex h-8 overflow-hidden rounded-md border border-default">
            <div
              v-for="칸 in 눈금칸s"
              :key="칸.이름"
              class="flex items-center justify-center border-e border-default last:border-e-0 text-xs transition-colors"
              :class="마운트됨 && 기기 === 칸.이름 ? 'bg-inverted text-inverted font-medium' : 'bg-elevated/40 text-dimmed'"
              :style="{ width: `${칸.퍼센트}%` }"
            >
              <span class="truncate px-1">{{ 칸.이름 }}</span>
            </div>
          </div>

          <!-- 경계 눈금값 -->
          <div
            v-for="경계 in 경계눈금s"
            :key="경계.값"
            class="absolute top-0 -translate-x-1/2 font-mono text-[0.625rem] text-muted"
            :style="{ left: `${경계.퍼센트}%` }"
          >
            {{ 경계.값 }}
          </div>

          <!-- 지금 위치 — 색이 붙는 유일한 자리(신호) -->
          <div
            v-if="마운트됨"
            class="absolute top-2 h-12 w-0.5 bg-primary transition-[left] duration-150"
            :style="{ left: `${마커퍼센트}%` }"
          >
            <div class="absolute -top-1 left-1/2 size-2 -translate-x-1/2 rounded-full bg-primary" />
          </div>
        </div>

        <!-- 기준 기기들이 눈금 어디에 찍히는지 -->
        <div class="relative mt-1 h-8">
          <div
            v-for="기 in 기준기기점s"
            :key="기.이름"
            class="absolute top-0 -translate-x-1/2 text-center"
            :style="{ left: `${기.퍼센트}%` }"
          >
            <div class="mx-auto h-2 w-px bg-accented" />
            <div class="mt-0.5 whitespace-nowrap text-[0.5625rem] leading-tight text-dimmed">
              {{ 기.짧은이름 }}
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── 실측 기록 ────────────────────────────────────────────────── -->
    <section class="rounded-xl border border-default p-4">
      <div class="mb-3 flex flex-wrap items-center gap-2">
        <h2 class="text-sm font-medium text-highlighted">
          실측 기록
        </h2>
        <p class="text-xs text-muted">
          폴드면 접고 · 펴고 · 눕혀서 세 번. 이 브라우저에만 남는다(localStorage).
        </p>
        <div class="grow" />
        <mButton
          역할="강조"
          size="xs"
          icon="i-lucide-crosshair"
          label="지금 폭 기록"
          @click="기록하기"
        />
        <mButton
          v-if="기록s.length"
          역할="조용"
          size="xs"
          label="지우기"
          @click="기록s = []"
        />
      </div>

      <p
        v-if="!기록s.length"
        class="text-sm text-dimmed"
      >
        아직 없다. <code class="font-mono text-xs">_기기.ts</code> 의 기준기기 숫자는 알려진 값이지 실측이 아니다 — 경계를 옮길 근거는 여기 쌓인다.
      </p>

      <div
        v-else
        class="overflow-x-auto"
      >
        <table class="w-full min-w-2xl text-sm">
          <thead>
            <tr class="border-b border-default text-left text-xs text-dimmed">
              <th class="py-1.5 pe-3 font-normal">
                폭 × 높이
              </th>
              <th class="py-1.5 pe-3 font-normal">
                방향
              </th>
              <th class="py-1.5 pe-3 font-normal">
                판정
              </th>
              <th class="py-1.5 pe-3 font-normal">
                입력
              </th>
              <th class="py-1.5 pe-3 font-normal">
                글자
              </th>
              <th class="py-1.5 pe-3 font-normal">
                화소비
              </th>
              <th class="py-1.5 pe-3 font-normal">
                때
              </th>
              <th
                v-if="is건넬판"
                class="py-1.5 font-normal"
              >
                판으로
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(기록, i) in 기록s"
              :key="i"
              class="border-b border-default/60 last:border-b-0"
            >
              <td class="py-1.5 pe-3 font-mono tabular-nums text-highlighted">
                {{ 기록.폭 }} × {{ 기록.높이 }}
              </td>
              <td class="py-1.5 pe-3 text-muted">
                {{ 기록.방향 }}
              </td>
              <td class="py-1.5 pe-3 text-highlighted">
                {{ 기록.기기 }}
              </td>
              <td class="py-1.5 pe-3 text-muted">
                {{ 기록.터치 ? '손가락' : '포인터' }}
              </td>
              <td
                class="py-1.5 pe-3 font-mono tabular-nums"
                :class="기록.글자 !== 1 ? 'text-warning' : 'text-muted'"
                :title="`루트 ${(기록.글자 * 16).toFixed(1)}px · 못박은 ${(기록.못박은 * 16).toFixed(1)}px`"
              >
                ×{{ 기록.글자.toFixed(2) }}<span
                  v-if="기록.못박은 !== 기록.글자"
                  class="text-dimmed"
                > · 못박은 ×{{ 기록.못박은.toFixed(2) }}</span>
              </td>
              <td class="py-1.5 pe-3 font-mono tabular-nums text-muted">
                ×{{ 기록.화소비.toFixed(2) }}
              </td>
              <td class="py-1.5 pe-3 font-mono text-xs text-dimmed">
                {{ 기록.때 }}
              </td>
              <!--
                **기록은 이 브라우저 안에만 산다**(`localStorage`). 판은 데스크톱에서 여니까
                그 저장소를 못 본다 — 사람이 옮길 수 있는 건 주소뿐이라 주소를 짓는다.
                누르면 복사까지 해 보지만 폰이 `http` 로 붙어 있으면 클립보드가 막혀서,
                **주소를 표 아래에 늘 눈에 보이게 펼친다.**
              -->
              <td
                v-if="is건넬판"
                class="py-1.5"
              >
                <mButton
                  size="xs"
                  역할="조용"
                  :label="편i === i ? (복사됨 ? '복사됨' : '아래에 폈다') : '판 링크'"
                  @click="링크주기(기록, i)"
                />
              </td>
            </tr>
          </tbody>
        </table>
        <div
          v-if="편링크"
          class="mt-3 flex flex-col gap-1"
        >
          <p class="text-xs text-muted">
            이 주소를 데스크톱에서 열면 <strong class="text-highlighted">그 기기가 판 맨 위에 서고 글자 배율까지 물린다.</strong>
          </p>
          <input
            class="w-full rounded-lg border border-default bg-elevated/40 px-2 py-1.5 font-mono text-xs text-highlighted"
            readonly
            :value="편링크"
            @focus="($event.target as HTMLInputElement).select()"
          >
        </div>
      </div>
    </section>

    <!-- ── 옛 축 vs 새 축 ──────────────────────────────────────────── -->
    <section class="rounded-xl border border-default p-4">
      <h2 class="mb-1 text-sm font-medium text-highlighted">
        지금 축이 돌려주는 값
      </h2>
      <p class="mb-3 text-xs text-muted">
        <code class="font-mono">app/composables/useResponsive.ts</code> — 소비자 수는 리포 전체 검색값(2026-09-09).
      </p>

      <div class="overflow-x-auto">
        <table class="w-full min-w-lg text-sm">
          <thead>
            <tr class="border-b border-default text-left text-xs text-dimmed">
              <th class="py-1.5 pe-3 font-normal">
                이름
              </th>
              <th class="py-1.5 pe-3 font-normal">
                식
              </th>
              <th class="py-1.5 pe-3 font-normal">
                지금
              </th>
              <th class="py-1.5 pe-3 font-normal">
                소비자
              </th>
              <th class="py-1.5 font-normal">
                비고
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="줄 in 옛축s"
              :key="줄.이름"
              class="border-b border-default/60"
            >
              <td class="py-1.5 pe-3 font-mono text-xs text-highlighted">
                {{ 줄.이름 }}
              </td>
              <td class="py-1.5 pe-3 font-mono text-xs text-muted">
                {{ 줄.식 }}
              </td>
              <td class="py-1.5 pe-3 tabular-nums">
                <span :class="줄.값 ? 'text-highlighted' : 'text-dimmed'">{{ 마운트됨 ? (줄.값 ? 'true' : 'false') : '—' }}</span>
              </td>
              <td class="py-1.5 pe-3">
                <span
                  v-if="줄.소비자 === 0"
                  class="rounded bg-warning/10 px-1.5 py-0.5 text-xs text-warning"
                >0 · 죽음</span>
                <span
                  v-else
                  class="text-xs text-muted"
                >{{ 줄.소비자 }}</span>
              </td>
              <td class="py-1.5 text-xs text-muted">
                {{ 줄.비고 }}
              </td>
            </tr>
            <tr class="border-t-2 border-default">
              <td class="py-2 pe-3 font-mono text-xs text-highlighted">
                기기
              </td>
              <td class="py-2 pe-3 font-mono text-xs text-muted">
                &lt;768 | &lt;1024 | ≥1024
              </td>
              <td
                class="py-2 pe-3 font-medium text-highlighted"
                colspan="3"
              >
                {{ 마운트됨 ? 기기 : '—' }}
                <span class="ms-2 text-xs font-normal text-muted">← 제안. 불리언이 아니라 값 하나라 빠뜨린 단계를 타입이 잡는다</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- UA 와 실측이 갈리는 자리 -->
      <div
        class="mt-4 rounded-lg border p-3 text-sm"
        :class="UA어긋남 ? 'border-warning/40 bg-warning/5' : 'border-default'"
      >
        <div class="text-xs text-dimmed">
          UA 판정 vs 실측
        </div>
        <div class="mt-1 text-highlighted">
          <code class="font-mono text-xs">useDevice().isMobile</code> =
          <span class="font-medium">{{ isMobileUA ? 'true' : 'false' }}</span>
          <span class="mx-2 text-dimmed">·</span>
          SSR 가정 폭 =
          <span class="font-mono">{{ isMobileUA ? '360' : '모름' }}</span>
          <span class="mx-2 text-dimmed">·</span>
          실측 폭 = <span class="font-mono tabular-nums">{{ 마운트됨 ? 폭 : '—' }}</span>
        </div>
        <p
          v-if="UA어긋남"
          class="mt-2 text-xs text-warning"
        >
          어긋났다. UA 는 모바일이라는데 실제로는 {{ 폭 }}px 다 — 폴드가 정확히 이 기기다.
          <code class="font-mono">useResponsive.ts:8</code> 의 <code class="font-mono">ssrWidth: 360</code> 때문에
          서버는 360px 로 그리고 하이드레이션 때 뒤집힌다. <b>첫 페인트가 한 번 튄다.</b>
        </p>
        <p
          v-else
          class="mt-2 text-xs text-muted"
        >
          지금은 안 어긋난다. 폴드 내부 화면에서 열면 어긋난다.
        </p>
      </div>
    </section>

    <!-- ── 기준 기기 ────────────────────────────────────────────────── -->
    <section class="rounded-xl border border-default p-4">
      <h2 class="mb-1 text-sm font-medium text-highlighted">
        기준 기기가 어느 칸에 떨어지나
      </h2>
      <p class="mb-3 text-xs text-muted">
        폭을 안 바꿔도 확인할 수 있는 자리. <span class="text-dimmed">숫자는 알려진 값이고 실측이 아니다.</span>
      </p>

      <div class="overflow-x-auto">
        <table class="w-full min-w-lg text-sm">
          <thead>
            <tr class="border-b border-default text-left text-xs text-dimmed">
              <th class="py-1.5 pe-3 font-normal">
                기기
              </th>
              <th class="py-1.5 pe-3 font-normal">
                폭
              </th>
              <th class="py-1.5 pe-3 font-normal">
                제안 축
              </th>
              <th class="py-1.5 pe-3 font-normal">
                지금 목록5
              </th>
              <th class="py-1.5 font-normal">
                비고
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="기 in 기준기기표s"
              :key="기.이름"
              class="border-b border-default/60 last:border-b-0"
            >
              <td class="py-1.5 pe-3 text-highlighted">
                {{ 기.이름 }}
              </td>
              <td class="py-1.5 pe-3 font-mono tabular-nums text-muted">
                {{ 기.폭 }}
              </td>
              <td class="py-1.5 pe-3 text-highlighted">
                {{ 기.판정 }}
              </td>
              <td class="py-1.5 pe-3">
                <span :class="기.지금 === '분할(=PC 와 같음)' ? 'text-warning' : 'text-muted'">{{ 기.지금 }}</span>
              </td>
              <td class="py-1.5 text-xs text-dimmed">
                {{ 기.비고 }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="mt-3 text-xs text-dimmed">
        「지금 목록5」는 <code class="font-mono">m/Box/반응형.vue:99</code> 의
        <code class="font-mono">요소폭 &lt; 512</code> 판정이다. 뷰포트가 아니라 **요소** 폭을 재므로
        위 숫자는 「그 칸이 화면 전체를 쓴다」고 봤을 때의 값이다.
      </p>
    </section>

    <!-- ── 실기기에서만 드러나는 것 ─────────────────────────────────── -->
    <section class="rounded-xl border border-default p-4">
      <h2 class="mb-1 text-sm font-medium text-highlighted">
        이 기기에서만 드러나는 것
      </h2>
      <p class="mb-4 text-xs text-muted">
        폭 축과는 별개다. 맥에서는 멀쩡해 보이는데 안드로이드에서만 깨지는 둘 — 폴드를 들고 있을 때 눈으로 확인할 것.
      </p>

      <div class="flex flex-col gap-4">
        <div>
          <div class="text-xs text-dimmed">
            성별 글리프 — <code class="font-mono">model회원.ts:82</code>
          </div>
          <div class="mt-1 flex flex-wrap items-baseline gap-6">
            <div>
              <span class="text-2xl">00{{ 글리프.이모지 }}(5)</span>
              <div class="mt-0.5 font-mono text-[0.625rem] text-warning">
                U+2642 U+FE0F · 지금 코드
              </div>
            </div>
            <div>
              <span class="text-2xl">00{{ 글리프.글자 }}(5)</span>
              <div class="mt-0.5 font-mono text-[0.625rem] text-muted">
                U+2642 만 · 리포의 다른 자리들
              </div>
            </div>
          </div>
          <p class="mt-1 text-xs text-muted">
            둘이 다르게 보이면 <code class="font-mono">U+FE0F</code>(변이 선택자)가 컬러 이모지를 강제하는 것이다.
            같아 보이면 이 기기 폰트가 흡수한 것 — 삼성 One UI 에서 갈린다.
          </p>
        </div>

        <div>
          <div class="text-xs text-dimmed">
            아바타 — <code class="font-mono">model회원.ts:525</code> 의 dicebear
          </div>
          <div class="mt-2 flex flex-wrap items-start gap-6">
            <div class="text-center">
              <NuxtImg
                :src="아바타url"
                alt="NuxtImg"
                class="size-16 rounded-lg border border-default"
              />
              <div class="mt-1 font-mono text-[0.625rem] text-muted">
                NuxtImg
              </div>
            </div>
            <div class="text-center">
              <img
                :src="아바타url"
                alt="img"
                class="size-16 rounded-lg border border-default"
              >
              <div class="mt-1 font-mono text-[0.625rem] text-muted">
                &lt;img&gt; 생짜
              </div>
            </div>
          </div>
          <p class="mt-2 text-xs text-muted">
            왼쪽만 깨지면 <code class="font-mono">nuxt.config.ts:92</code> 의
            <code class="font-mono">image.domains</code> 에 <code class="font-mono">api.dicebear.com</code> 이 없어서다.
            둘 다 깨지면 망·차단기 쪽. 목록 카드는 어느 쪽이든 <code class="font-mono">m/List/_/_그림.vue</code> 의
            <code class="font-mono">@error</code> 가 아이콘 타일로 받는다(2026-09-11 전에는 깨진 아이콘이 최종 상태였다).
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useDevicePixelRatio, useWindowSize } from '@vueuse/core'
import { computed, onMounted, ref, watch } from 'vue'
import { 기기경계, 기기of, 기기s, 기준기기s, use기기, use글자, use입력 } from './_기기'
import { 실기기쿼리 } from './_틀'

definePageMeta({
  제목: '기기 축'
})

/** SSR 과 값이 갈리는 자리라 마운트 전에는 `—` 를 그린다(하이드레이션 경고 방지). */
const 마운트됨 = ref(false)
onMounted(() => (마운트됨.value = true))

const { width: 폭, height: 높이 } = useWindowSize({ initialWidth: 0, initialHeight: 0 })
const { 기기 } = use기기()
const { is터치, is호버없음 } = use입력()

/**
 * **폭과 직교하는 둘.** 실기기에서 깨졌는데 판에서 안 깨진다면 폭이 아니라 이쪽일 수 있다 —
 * 그런데 여태 이 표는 폭만 담았다(2026-09-10).
 */
const { 루트px, 못박은px, 글자배율, 못박은배율, 재기 } = use글자()
const { pixelRatio: 화소비 } = useDevicePixelRatio()

/** 색이 뜨는 자리 = 「어긋났다」. 기본 글자 크기가 아니면 판의 그림과 실기기가 갈린다. */
const 글자어긋남 = computed(() =>
  마운트됨.value && (글자배율.value !== 1 || 못박은배율.value !== 1))

const 방향 = computed(() => (폭.value >= 높이.value ? '가로' : '세로'))

/* ── 눈금 ──────────────────────────────────────────────────────────── */

/** 눈금이 담는 최대 폭. 노트북(1440)까지 여유 있게. */
const 눈금최대 = 1600

const 퍼센트of = (v: number) => Math.min(100, Math.max(0, (v / 눈금최대) * 100))

const 눈금칸s = computed(() => {
  const 시작s = [0, 기기경계.태블릿, 기기경계.PC, 눈금최대]
  return 기기s.map((이름, i) => ({
    이름,
    퍼센트: ((시작s[i + 1]! - 시작s[i]!) / 눈금최대) * 100
  }))
})

const 경계눈금s = [기기경계.태블릿, 기기경계.PC].map(값 => ({ 값, 퍼센트: 퍼센트of(값) }))

const 마커퍼센트 = computed(() => 퍼센트of(폭.value))

/** 겹쳐서 글자가 뭉개지므로 눈금 밑에는 짧은 이름만 찍는다. */
const 기준기기점s = 기준기기s.map(기 => ({
  이름: 기.이름,
  짧은이름: 기.이름.replace('아이패드 ', '').replace('폴드 ', '폴드'),
  퍼센트: 퍼센트of(기.폭)
}))

/* ── 옛 축 대조 ───────────────────────────────────────────────────── */

const { isMobile: isMobileUA } = useDevice()
const 옛 = useResponsive()

const UA어긋남 = computed(() => 마운트됨.value && isMobileUA && 폭.value >= 기기경계.태블릿)

/**
 * 소비자 수는 리포 전체를 훑은 값이다(2026-09-09). **화면이 세지 않는다** —
 * 여기서 세려면 소스를 읽어야 하는데 그건 판이 할 일이 아니다. 수가 틀리면 이 배열을 고칠 것.
 */
const 옛축s = computed(() => [
  { 이름: 'is데스크탑', 식: '≥ lg(1024)', 값: 옛.is데스크탑.value, 소비자: 1, 비고: 'useDock 하나' },
  { 이름: 'is데스크탑_이상', 식: '≥ lg(1024)', 값: 옛.is데스크탑_이상.value, 소비자: 0, 비고: 'is데스크탑과 같은 식' },
  { 이름: 'is태블릿_이상', 식: '≥ md(768)', 값: 옛.is태블릿_이상.value, 소비자: 0, 비고: '3단계 축의 흔적' },
  { 이름: 'is모바일_이상', 식: '≥ sm(640)', 값: 옛.is모바일_이상.value, 소비자: 0, 비고: '' },
  { 이름: 'is미니모바일_이상', 식: '≥ xs(800)', 값: 옛.is미니모바일_이상.value, 소비자: 0, 비고: 'xs 를 800 으로 덮어써서 sm(640)보다 좁다' },
  { 이름: 'is미니', 식: '< xs(800)', 값: 옛.is미니.value, 소비자: 2, 비고: 'Input/카드 · Input/카드s' }
])

const 기준기기표s = 기준기기s.map(기 => ({
  ...기,
  판정: 기기of(기.폭),
  /** 목록5 는 `요소폭 < 512` 하나로 가른다 — 512 를 넘으면 전부 PC 와 같은 마크업이다. */
  지금: 기.폭 < 512 ? '밀기' : '분할(=PC 와 같음)'
}))

/* ── 실측 기록 ────────────────────────────────────────────────────── */

interface i기록 {
  폭: number
  높이: number
  방향: string
  기기: string
  터치: boolean
  /** 루트(`html`) 글자 크기 ÷ 16. 테일윈드가 `rem` 이라 화면의 글자가 거의 다 여기 매달린다. */
  글자: number
  /** `font-size:16px` 으로 못을 박은 글자가 그려진 크기 ÷ 16. */
  못박은: number
  화소비: number
  때: string
}

/** 셋을 나중에 보탰다(2026-09-10) — 그 전에 쌓인 기록에는 없어서 기본값을 물린다. */
const 기록채우기 = (기: Partial<i기록>): i기록 => ({
  폭: 0, 높이: 0, 방향: '—', 기기: '—', 터치: false, 때: '—',
  글자: 1, 못박은: 1, 화소비: 1,
  ...기
})

const 기록키 = 'sandbox:device:기록s'
const 기록s = ref<i기록[]>([])

onMounted(() => {
  try {
    const raw = localStorage.getItem(기록키)
    if (raw) 기록s.value = (JSON.parse(raw) as Partial<i기록>[]).map(기록채우기)
  } catch { /* 사생활 모드·차단 — 빈 채로 시작하면 된다 */ }
})

watch(기록s, (v) => {
  try {
    localStorage.setItem(기록키, JSON.stringify(v))
  } catch { /* 위와 같다 */ }
}, { deep: true })

const 기록하기 = () => {
  // **누를 때마다 다시 잰다.** 글자 배율은 설정에서 바꾸고 돌아오는 값이라 이벤트가 없다 —
  // 마운트 때 잰 수를 그대로 담으면 「바꾸고 눌렀는데 옛날 수가 담긴다」.
  재기()
  기록s.value = [{
    폭: 폭.value,
    높이: 높이.value,
    방향: 방향.value,
    기기: 기기.value,
    터치: is터치.value,
    글자: 글자배율.value,
    못박은: 못박은배율.value,
    화소비: 화소비.value,
    때: new Date().toLocaleTimeString('ko-KR', { hour12: false })
  }, ...기록s.value].slice(0, 20)
}

/* ── 판으로 건네기 ────────────────────────────────────────────────── */

/**
 * **잰 것이 판에 안 닿으면 잰 값이 아니다.** 판(`list2`)은 데스크톱에서 여는데 기록은 폰
 * `localStorage` 안에 있어서, 옮길 수 있는 건 주소뿐이다. 그 주소를 여기서 짓는다.
 */
/**
 * 받는 판(`list2`)은 아직 모래밭에 있다 — **이 판은 공개 경로라 지워지는 자리를 그냥 가리키면 안 된다.**
 * 라우터에 실재할 때만 「판으로」 칸을 세운다(`~/utils/decisions` 의 `판` 규칙과 같다). 지우면 칸만 빠진다.
 */
const 건넬판 = '/sandbox/device/list2'
const is건넬판 = useRouter().getRoutes().some(route => route.path === 건넬판)

const 편i = ref<number | null>(null)
const 편링크 = ref('')
const 복사됨 = ref(false)

const 링크주기 = async (기록: i기록, i: number) => {
  const 주소 = `${location.origin}${건넬판}?${실기기쿼리({
    폭: 기록.폭,
    높이: 기록.높이,
    글자: 기록.글자,
    이름: `${기록.기기} ${기록.방향}`
  })}`
  편i.value = i
  편링크.value = 주소
  복사됨.value = false
  try {
    // `http` 로 붙어 있으면 클립보드가 아예 없다 — 실패해도 주소는 아래에 펼쳐진다.
    await navigator.clipboard?.writeText(주소)
    복사됨.value = true
  } catch { /* 위와 같다 */ }
}

/* ── 실기기에서만 드러나는 것 ────────────────────────────────────── */

/**
 * 소스에 이모지를 직접 못 적는다 — **이 판이 검사하려는 게 바로 그 바이트**라
 * 에디터·포매터가 조용히 정규화하면 판이 거짓말을 한다. 코드포인트로 조립한다.
 */
const 글리프 = {
  이모지: String.fromCodePoint(0x2642, 0xFE0F),
  글자: String.fromCodePoint(0x2642)
}

const 아바타url = 'https://api.dicebear.com/9.x/lorelei/svg?seed=sandbox'
</script>

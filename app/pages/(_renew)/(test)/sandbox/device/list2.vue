<!--
  기기별 view목록5 **② 한 대씩** — 고르는 줄 하나에 프레임 하나(2026-09-09).

  짝은 `list1`(다섯 대 늘어놓기)이다. **둘은 같은 물음의 두 답**이라 기기 표·주소·감추는
  규칙은 `_틀.ts` 한 벌을 나눠 쓰고, 갈리는 건 **배율을 어떻게 고르느냐** 하나뿐이다.

  ## 무엇을 사고 무엇을 파나

  **산 것은 크기다.** 다섯 대 폭을 합치면 5,471 기기픽셀이라 어떤 모니터에도 다 못 들어온다.
  한 대만 세우면 그 한 대가 칸을 다 쓰므로, 대개 `×1.00` 으로 서서 **글자가 읽힌다.**
  늘어놓기에서는 `×0.3` 이라 블록만 보이던 것이 여기서는 진짜 화면이다.

  **판 것은 비교다.** 「폴드에서 밀기가 분할로 넘어간다」를 보려면 두 화면 사이에 무엇이
  달랐는지를 **사람이 기억해야 한다.** 이 판은 그 값을 못 갚는다 — 그래서 `list1` 이 따로 있다.

  ## 그래서 고르는 줄이 왼쪽에 선다

  머리띠에 알약으로 늘어놓지 않고 세로 레일로 세운 건, 여기서는 **고르는 일이 화면의 절반**
  이기 때문이다. 레일이면 이름 옆에 `폭×높이` 와 등급을 같이 적을 수 있어서, 프레임을
  세우기 **전에** 무엇이 다른지가 먼저 읽힌다. 알약 줄로는 이름밖에 못 적는다.

  **창보다 넓은 기기도 세운다.** 한동안 감췄는데, 그 규칙이 실제로 한 일은 1920 모니터에서
  모니터 칸을 지우는 것이었다 — 창은 늘 화면보다 조금 좁아서 지금 쓰는 바로 그 기기가
  언제나 빠졌다. 줄여 세운 그림은 근사치가 아니라 **배치가 한 군데도 안 틀린 진짜**이고
  (`iframe` 안은 진짜로 1920 CSS 픽셀이다), 줄였다는 건 캡션의 `×0.95` 가 늘 말한다.

  ## 껍데기를 씌운다 — 여기만

  모바일은 모바일 껍데기에, 랩탑은 랩탑 껍데기에 세운다. 한 대뿐이라 **무엇을 보고 있는지**를
  치수 글자가 아니라 모양이 먼저 말하는 게 낫다.

  **눕히면 껍데기도 같이 눕는다** — 슬릿은 왼쪽 테두리, 홈바는 오른쪽, 버튼은 위아래로 간다.
  안 돌리면 「누운 폰」이 아니라 「넓적한 폰」이 되어서, 회전 손잡이가 답하려던 물음을 못 답한다.

  **선 하나로 그린다.** 테두리·모서리·색은 셋이 똑같고 갈리는 건 화면 아래뿐이다 —
  손에 드는 것은 아무것도, 랩탑은 받침, 모니터는 목과 발. 노치·카메라·버튼은 안 그린다.
  더 그리면 판이 아니라 그림이 되고, **색은 이 판에서 신호에만 뜬다**(등급 배지).

  껍데기는 화면 **바깥에만** 있다 — 안쪽은 여전히 기기 뷰포트 그대로라 판이 말하는 치수가
  안 바뀐다. 대신 배율을 고를 때 그 몫을 **먼저 뺀다**(`껍데기몫`).

  **`list1` 은 안 씌운다.** 「전체」 배율이 다섯 대의 폭을 정확히 나눠 담는데 껍데기가
  기기마다 다른 몫을 더하면 그 계산이 흐트러지고, `×0.3` 으로 줄면 테두리가 화면의 1/6 을
  먹어서 비교하려던 것이 껍데기에 가린다.

  ## 글자만 키우는 손잡이 — 배율과 정반대의 것

  **`배율` 로는 실기기의 깨짐이 한 번도 안 재현된다.** 프레임을 통째로 줄이면 글자도 칸도
  같이 줄어서 판이 안 바뀌기 때문이다. 실기기에서 깨진 건 **뷰포트 폭은 393 그대로인데
  글자만 컸기** 때문인데(안드로이드 글꼴 크기 설정), 그건 밖에서 프레임 안 루트 글자 크기를
  밀어 넣어야만 생긴다 — 그 손잡이가 「글자」다(2026-09-10).

  **눈금의 `1.13`·`1.25` 는 앱 자신의 축이다** — 테마의 「글자 크기」가 `보통 1 · 크게 1.125 ·
  아주 크게 1.25` 를 루트 `font-size` 로 쓴다(`utils/theme/css.ts`). 그리고 그 값은 **브라우저마다
  다른 `m_theme` 쿠키**에 살아서, 폰에서 「크게」로 해 뒀으면 폰에서만 글자가 크다.
  프레임은 데스크톱 쿠키를 물고 뜨니 **판은 그걸 영영 못 본다.** `1.5`·`2` 는 그 위에 기기
  글꼴 설정까지 얹혔을 때다.

  ## 실기기를 주소로 물린다

  **손잡이만 있고 기본값이 `×1` 이면 아무것도 안 물린 채로 열린다** — 「몇으로 맞추나」의 답이
  판 밖에 있기 때문이다. 그래서 `axis` 가 실기기에서 잰 폭·높이·글자 배율을 **주소에 실어**
  보내고(`?폭=&높이=&글자=`), 이 판은 그걸 읽어 **맨 위에 그 기기를 세우고 글자 배율도 미리
  물린다**(`실기기of`). 기록이 `localStorage` 에 사는데 그건 폰 브라우저 안에만 있어서,
  사람이 옮길 수 있는 건 주소뿐이다.

  안 물렸으면 머리띠가 **「실기기 안 물림」이라고 적는다.** 판이 아는 척하는 것보다 낫다.

  ## 늘리지는 않는다

  칸이 남아도 `×1.00` 을 안 넘는다. 키워 봐야 새로 보이는 게 없고 「이만 하게 보인다」가
  거짓말이 된다. 그래서 폰을 고르면 칸 한가운데 작게 서고 둘레가 빈다 — **그 빈자리가
  「폰은 이만하다」는 답이다.**
-->
<template>
  <!--
    **창을 보는 판이라 서버에서는 안 그린다.**

    `use기기화면s` 의 「이 창보다 넓으면 안 세운다」는 `useWindowSize` 를 보는데, 서버에는
    창이 없어 `Infinity` 가 온다. 그러면 서버는 「아무것도 안 넓다」로 그리고 클라이언트는
    「모니터가 넓다」로 그려서 **히드레이션이 어긋난다** — 어긋나면 Vue 가 서버 마크업을
    붙든 채로 텍스트만 갈아 끼워서, 줄에 「창보다 넓다」라고 적혀 있는데 단추는 눌리는
    상태로 남았다(2026-09-09 실측).

    판정을 늦추는 대신 **판정하는 자리를 통째로 클라이언트로 옮긴다.** 모래밭 판이라
    서버 렌더로 얻는 것이 없고, 이러면 「창을 아직 모르는 순간」이 아예 안 생긴다.
  -->
  <ClientOnly>
    <div class="flex h-[calc(100dvh-var(--ui-layout-header-offset,4rem))] w-full flex-row">
      <!-- ── 고르는 줄 ───────────────────────────────────────────────────
      **레일은 스크롤이 안 생겨야 한다.** 고를 것을 찾으러 또 스크롤하면 나눈 뜻이 없다.
      그래서 한 줄에 이름·치수·등급만 적고 다섯 줄로 끝낸다.
    -->
      <aside class="flex w-48 shrink-0 flex-col gap-1 border-e border-default p-2">
        <div class="mb-1 flex items-baseline gap-2 px-1">
          <h1 class="text-sm font-medium text-highlighted">
            한 대씩
          </h1>
          <NuxtLink
            to="/sandbox/device/list1"
            class="text-xs text-dimmed underline underline-offset-2 hover:text-muted"
          >늘어놓기 →</NuxtLink>
        </div>

        <button
          v-for="화 in 전부"
          :key="화.키"
          type="button"
          class="rounded-lg border px-2 py-1.5 text-start transition-colors"
          :class="고른키 === 화.키
            ? 'border-inverted bg-elevated'
            : 'border-transparent hover:bg-elevated'"
          @click="고른키 = 화.키"
        >
          <span class="flex items-baseline gap-1.5">
            <span class="text-xs font-medium text-highlighted">{{ 화.이름 }}</span>
            <span
              class="rounded px-1 py-px text-[0.5625rem]"
              :class="화.등급바뀜 ? 'bg-warning/10 text-warning' : 'bg-elevated text-muted'"
            >{{ 화.등급 }}</span>
          </span>
          <span class="mt-0.5 block font-mono text-[0.625rem] tabular-nums text-dimmed">
            {{ 화.폭 }}×{{ 화.높이 }}
            <span v-if="화.폭멈춤"> · 1280 멈춤</span>
          </span>
        </button>
      </aside>

      <!-- ── 세우는 칸 ─────────────────────────────────────────────────── -->
      <div class="flex min-w-0 grow flex-col">
        <header class="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-2 border-b border-default px-3 py-2">
          <span class="text-xs text-dimmed">{{ 주소 }}</span>

          <div class="grow" />

          <div class="flex items-center gap-1">
            <span class="me-1 text-[0.6875rem] text-dimmed">표</span>
            <mButton
              v-for="것 in 표s"
              :key="것.키"
              size="xs"
              :역할="표 === 것.키 ? undefined : '조용'"
              :label="것.이름"
              @click="표 = 것.키"
            />
          </div>

          <!-- 못 눕히는 랩탑·모니터는 안 움직인다. -->
          <div class="flex items-center gap-1">
            <span class="me-1 text-[0.6875rem] text-dimmed">회전</span>
            <mButton
              v-for="것 in 방향s"
              :key="것"
              size="xs"
              :역할="회전 === 것 ? undefined : '조용'"
              :label="것"
              @click="회전 = 것"
            />
          </div>

          <div class="flex items-center gap-1">
            <span class="me-1 text-[0.6875rem] text-dimmed">배율</span>
            <mButton
              v-for="것 in 배율모드s"
              :key="것"
              size="xs"
              :역할="배율모드 === 것 ? undefined : '조용'"
              :label="것"
              @click="배율모드 = 것"
            />
          </div>

          <!--
            **폭은 그대로 두고 글자만 키운다.** 실기기의 글꼴 크기 설정이 하는 일이 그것이고,
            깨진 화면을 여기서 다시 만드는 유일한 손잡이다. 실기기 수는 `axis` 가 잰다.
          -->
          <div class="flex items-center gap-1">
            <span class="me-1 text-[0.6875rem] text-dimmed">글자</span>
            <mButton
              v-for="것 in 글자배율s"
              :key="것"
              size="xs"
              :역할="글자배율 === 것 ? undefined : '조용'"
              :label="`×${것}`"
              @click="글자배율 = 것"
            />
            <!-- **아는 척을 안 한다.** 실기기 값이 안 왔으면 판이 그렇다고 적는다. -->
            <span
              v-if="!실기기"
              class="ms-1 text-[0.6875rem] text-warning"
              title="axis 를 실기기에서 열고 「지금 폭 기록」 → 「판 링크」 를 눌러 나온 주소를 여기서 열면, 그 기기의 폭·높이·글자 배율이 그대로 물린다"
            >실기기 안 물림</span>
          </div>

          <mButton
            size="xs"
            역할="조용"
            icon="i-lucide-rotate-cw"
            title="프레임을 통째로 다시 세운다"
            @click="다시세우기"
          />
        </header>

        <!--
        **한가운데에 세운다.** 칸이 남는 건 「이 기기는 이만하다」는 답이라 위로 붙이지 않는다.
        `100%` 로 밀어 칸을 넘으면 그때만 스크롤이 생긴다.
      -->
        <div
          ref="칸"
          class="flex min-h-0 grow items-center justify-center overflow-auto p-4"
        >
          <sandbox기기프레임
            v-if="준비됨 && 고른화면"
            :화면="고른화면"
            :주소="주소"
            :배율="배율"
            :글자배율="글자배율"
            :세대="세대"
            껍데기
          />
          <p
            v-else-if="!고른화면"
            class="text-sm text-dimmed"
          >
            세울 기기가 없다 — 다섯 대 전부 이 창보다 넓다.
          </p>
        </div>
      </div>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { useElementSize } from '@vueuse/core'
import { computed, ref, useTemplateRef } from 'vue'
import {
  use기기화면s,
  껍데기몫,
  방향s,
  실기기of,
  표s,
  type i방향,
  type i표키
} from '~/pages/decisions/device/_틀'

definePageMeta({
  layout: 'layout-test',
  제목: 'view목록5 · 기기별 ② 한 대씩',
  설명: '고르는 줄 하나에 프레임 하나. 크기를 사고 비교를 판다 — 대개 1:1 로 서서 글자가 읽힌다. 짝은 list1.',
  상태: '대기',
  쓰는곳: '목록5 · mBox반응형 · mList · layout-v2 셸'
})

const 표 = ref<i표키>('fruits')
const 주소 = computed(() => `/v2/${표.value}`)

const 회전 = ref<i방향>('세로')

/**
 * **주소로 건너온 실기기.** `axis` 가 실기기에서 잰 것이고, 오면 목록 맨 위에 서고
 * 글자 배율도 그 값으로 미리 물린다 — 판을 열자마자 그 기기가 서 있어야 「반영됐다」다.
 */
const route = useRoute()
const 실기기 = computed(() => 실기기of(route.query))

const { 전부 } = use기기화면s(회전, 실기기)

const 고른키 = ref<string>(실기기.value ? '실기기' : '폰')

const 고른화면 = computed(() =>
  전부.value.find(화 => 화.키 === 고른키.value) ?? 전부.value[0] ?? null)

/* ── 배율 ──────────────────────────────────────────────────────────── */

const 배율모드s = ['맞춤', '100%'] as const
const 배율모드 = ref<typeof 배율모드s[number]>('맞춤')

/* ── 글자 배율 ─────────────────────────────────────────────────────── */

/**
 * **글자만 키우는 축.** 위의 `배율` 과 헷갈리면 안 된다 — 저건 프레임을 통째로 줄여서 판을
 * 안 바꾸고, 이건 뷰포트 폭을 그대로 둔 채 글자만 키워서 **판을 깬다.**
 *
 * `1.125`·`1.25` 는 **앱 자신의 축**이다(테마 「글자 크기」의 크게·아주 크게, `theme/css.ts`).
 * 브라우저마다 다른 쿠키에 살아서 폰에서만 켜져 있기 쉽다. `1.5`·`2` 는 그 위에 기기 글꼴
 * 설정까지 얹혔을 때 — **이쪽은 알려진 값이지 실측이 아니다.**
 *
 * **실기기가 물렸으면 그 수를 눈금에 끼운다.** 안 끼우면 판이 잰 값을 못 고른다.
 */
const 글자눈금s = [1, 1.125, 1.25, 1.5, 2]

const 글자배율s = computed(() => {
  const 잰 = 실기기.value?.글자
  const 다 = 잰 && !글자눈금s.includes(잰) ? [...글자눈금s, 잰] : 글자눈금s
  return [...다].sort((a, b) => a - b)
})

const 글자배율 = ref<number>(실기기.value?.글자 ?? 1)

const 칸 = useTemplateRef<HTMLElement>('칸')
const { width: 칸폭raw, height: 칸높이raw } = useElementSize(칸)

/** 캡션 한 줄 + `p-4` 가 먹는 몫. */
const 캡션몫 = 62
const 여백 = 32

const 칸폭 = computed(() => (칸폭raw.value > 0 ? Math.max(200, 칸폭raw.value - 여백) : 0))
const 칸높이 = computed(() => (칸높이raw.value > 0 ? Math.max(200, 칸높이raw.value - 캡션몫) : 0))

/**
 * 한 대뿐이니 **폭·높이 둘 다** 칸에 맞춘다. 그래도 `1` 은 안 넘는다 —
 * 늘리면 「이만 하게 보인다」가 거짓말이 되고, 남는 자리가 곧 답이다.
 *
 * **껍데기 몫을 먼저 뺀다.** 껍데기는 화면 밖에 붙는 것이라 배율에 안 곱해지고 그대로 더해진다 —
 * 안 빼면 씌운 만큼 칸을 넘는다(랩탑은 받침까지 있어 세로로 28px).
 */
const 배율 = computed(() => {
  const 화 = 고른화면.value
  if (!화 || 배율모드.value === '100%') return 1
  if (칸폭.value <= 0 || 칸높이.value <= 0) return 1
  const 몫 = 껍데기몫(화.껍데기, 화.눕는가)
  return Math.min(
    1,
    (칸폭.value - 몫.폭) / 화.폭,
    (칸높이.value - 몫.높이) / 화.높이
  )
})

/* ── 첫 그림 ───────────────────────────────────────────────────────── */

/** 칸을 재기 전에는 안 세운다 — 「모르니까 아직 하지 마라」(`list1` 과 같은 갈래). */
const 준비됨 = computed(() =>
  배율모드.value === '100%' || 칸높이.value > 0)

const 세대 = ref(0)
const 다시세우기 = () => {
  세대.value += 1
}
</script>

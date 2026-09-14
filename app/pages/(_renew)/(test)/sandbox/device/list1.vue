<!--
  기기별 view목록5 **① 늘어놓기** — 다섯 대를 한 줄에 세워 나란히 본다(2026-09-09).

  짝은 `list2`(한 대씩 크게)다. **둘은 같은 물음의 두 답**이라 기기 표·주소·감추는 규칙은
  `_틀.ts` 한 벌을 나눠 쓰고, 갈리는 건 **배율을 어떻게 고르느냐** 하나뿐이다.

  ## 넓은 쪽 둘은 같은 그림이다 (2026-09-10 실측)

  랩탑(1440)과 모니터(1920)를 나란히 세우면 **내용이 똑같고 여백만 는다.** 목록5 의 상자가
  `max-w-(--ui-container)` = 1280 에서 성장을 멈추기 때문이고(`m/Box/반응형.vue` 첫 줄),
  그래서 1296 위로는 1440 이든 3840 이든 목록 칸이 470px 로 같다(`멈춤폭`).

  **그 두 칸을 붙여 둔 이유가 그거다.** 나란히 놔야 「넓은 화면에서 여백만 는다」가 보인다 —
  한 대씩 보면 알 수 없는 종류의 답이라 이 판이 답한다.

  ## 왜 늘어놓나

  「폴드에서 밀기가 분할로 넘어간다」 같은 것은 **나란히 놔야** 보인다. 한 대씩 갈아 끼우면
  그 사이에 무엇이 달랐는지를 사람이 기억해야 하고, 기억으로 비교한 것은 근거가 안 된다.
  (앞선 판이 프리셋 단추를 단 이유도 같았다 — 손잡이를 하나씩 맞추게 하면 안 된다.)

  ## 배율 셋 — 무엇을 포기하느냐가 다르다

  다섯 대의 가로세로비 합이 **5.34**다. 높이를 750 으로 맞추면 줄 전체가 **약 4,000px** 라
  **어떤 모니터에도 안 들어온다.** 폭을 합치면 5,471 기기픽셀이고 화면은 2,500 남짓이니
  「다섯 대를 다 읽히게」는 배치로 못 이기는 산수다. 그래서 셋 중 하나를 포기하게 된다.

  - **전체** — 전역 배율 하나로 다 넣는다. 글자는 못 읽지만 **상대 크기가 정직해진다.**
    (높이 맞춤은 폰과 모니터를 같은 높이로 세워서 「모니터가 3배 크다」를 되레 지운다.)
  - **맞춤** — 높이를 맞추고 옆으로 스크롤. 기기별 배치를 읽는 자리.
  - **100%** — 1:1.

  기본은 **전체**다. 판을 열었을 때 「다섯 대가 있다」가 먼저 보여야 고르는 것이 시작된다.

  **늘리지는 않는다**(셋 다 `min(1, …)`). 키워 봐야 새로 보이는 게 없고 「이만 하게 보인다」가
  거짓말이 된다. 그래서 눕히면 짧은 기기가 `×1.00` 으로 서고 높이가 안 맞는데,
  섞였다는 건 캡션의 `×0.68` 이 진다 — 세우는 것보다 **거짓말 안 하는 것**이 먼저다.

  ## 고르는 줄은 머리띠에 있다

  앞 판은 캡션의 이름을 누르면 혼자 서게 해 뒀는데, **캡션에 파묻혀서 누를 수 있는 줄
  몰랐다.** 손잡이가 안 보이면 없는 것과 같다. 그래서 이름 다섯을 머리띠로 올렸다 —
  아이콘이 아니라 **누를 수 있는 영역**이 어디를 누르는지 말한다.

  ## 이 판이 답 안 하는 것

  세로 예산(「카드 몇 장 남나」)은 여기서 안 잰다. 답이 나서 코드로 내려갔다 —
  `m/List/_/useGridCols.ts` 의 `드는장수`·`최소장수`, `목록5.vue` 의 `is보기강등`.
  **재는 판이 아니라 보는 판이다.**
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
    <div class="flex h-[calc(100dvh-var(--ui-layout-header-offset,4rem))] w-full flex-col">
      <!-- ── 머리띠 ──────────────────────────────────────────────────────
      한 줄에 다 넣는다. 손잡이를 찾으러 스크롤하면 나란히 보는 뜻이 없다.
    -->
      <header class="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-2 border-b border-default px-3 py-2">
        <div class="flex items-baseline gap-2">
          <h1 class="text-sm font-medium text-highlighted">
            늘어놓기
          </h1>
          <NuxtLink
            to="/sandbox/device/list2"
            class="text-xs text-dimmed underline underline-offset-2 hover:text-muted"
          >한 대씩 →</NuxtLink>
          <span class="text-xs text-dimmed">{{ 주소 }}</span>
        </div>

        <!-- **고르는 줄.** 누르면 그 기기만 선다. -->
        <div class="flex flex-wrap items-center gap-1">
          <mButton
            size="xs"
            :역할="단독 ? '조용' : undefined"
            label="전체"
            @click="단독 = null"
          />
          <mButton
            v-for="화 in 전부"
            :key="화.키"
            size="xs"
            :역할="단독 === 화.키 ? undefined : '조용'"
            :label="화.이름"
            :title="`${화.폭}×${화.높이}${화.폭멈춤 ? ' · 1280 멈춤' : ''}`"
            @click="단독 = 단독 === 화.키 ? null : 화.키"
          />
        </div>

        <div class="grow" />

        <!-- 표를 갈아 끼운다. 저장소마다 카드 종류가 달라 서는 꼴이 달라진다. -->
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

        <!--
        **회전은 손잡이 하나다.** 기기마다 스위치를 달면 그 사이에 무엇이 달랐는지를
        사람이 기억해야 한다. 못 눕히는 랩탑·모니터는 안 움직인다.
      -->
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

        <mButton
          size="xs"
          역할="조용"
          icon="i-lucide-rotate-cw"
          title="프레임을 통째로 다시 세운다"
          @click="다시세우기"
        />
      </header>

      <!-- ── 선반 ────────────────────────────────────────────────────────
      좁은 것부터 넓은 것까지 한 줄. 늘어놓는 차례가 곧 기기 축이라 따로 설명할 게 없다.
      「전체」면 다 들어와서 안 넘치고, 「맞춤」·「100%」면 옆으로 스크롤한다.
    -->
      <div
        ref="선반"
        class="min-h-0 grow overflow-auto p-4"
      >
        <div
          v-if="준비됨"
          class="flex h-full w-max items-center gap-5"
        >
          <sandbox기기프레임
            v-for="화 in 보일화면s"
            :key="화.키"
            class="shrink-0"
            :화면="화"
            :주소="주소"
            :배율="배율of(화)"
            :세대="세대"
          >
            <template #이름>
              <button
                type="button"
                class="-mx-1.5 rounded px-1.5 py-0.5 text-xs font-medium text-highlighted transition-colors hover:bg-elevated"
                @click="단독 = 단독 === 화.키 ? null : 화.키"
              >
                {{ 화.이름 }}
              </button>
            </template>
          </sandbox기기프레임>
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
  방향s,
  표s,
  type i방향,
  type i표키,
  type i화면
} from '~/pages/decisions/device/_틀'

definePageMeta({
  layout: 'layout-test',
  제목: 'view목록5 · 기기별 ① 늘어놓기',
  설명: '다섯 대를 한 줄에 세워 나란히 본다. 배율 셋(전체·맞춤·100%)이 무엇을 포기하는지가 이 판의 물음. 짝은 list2.',
  상태: '대기',
  쓰는곳: '목록5 · mBox반응형 · mList · layout-v2 셸'
})

const 표 = ref<i표키>('fruits')
const 주소 = computed(() => `/v2/${표.value}`)

const 회전 = ref<i방향>('세로')
const { 전부 } = use기기화면s(회전)

const 단독 = ref<string | null>(null)

const 보일화면s = computed(() =>
  단독.value ? 전부.value.filter(화 => 화.키 === 단독.value) : 전부.value)

/* ── 배율 ──────────────────────────────────────────────────────────── */

const 배율모드s = ['전체', '맞춤', '100%'] as const
const 배율모드 = ref<typeof 배율모드s[number]>('전체')

const 선반 = useTemplateRef<HTMLElement>('선반')
const { width: 선반폭, height: 선반높이 } = useElementSize(선반)

/** 캡션 한 줄 + 위아래 여백이 먹는 몫. 프레임이 설 자리는 그만큼 낮다. */
const 캡션몫 = 62
/** 프레임 사이 간격(`gap-5`) + 좌우 여백(`p-4`). 「전체」가 폭을 나눌 때 먼저 뺀다. */
const 간격 = 20
const 여백 = 32

const 칸높이 = computed(() => (선반높이.value > 0 ? Math.max(200, 선반높이.value - 캡션몫) : 0))
const 칸폭 = computed(() => (선반폭.value > 0 ? Math.max(200, 선반폭.value - 여백) : 0))

/**
 * **「전체」의 배율은 기기마다가 아니라 줄 하나에 하나다.** 기기별로 맞추면 전부 같은 크기가
 * 되어 「모니터가 폰의 5배」라는 사실이 지워진다 — 그게 이 모드가 사는 이유라 전역이어야 한다.
 *
 * 폭과 높이 둘 다 본다. 폭은 늘어선 것의 합, 높이는 제일 높은 기기 하나가 정한다.
 */
const 전역배율 = computed(() => {
  const 대수 = 보일화면s.value.length
  if (!대수 || 칸폭.value <= 0 || 칸높이.value <= 0) return 1
  const 총폭 = 보일화면s.value.reduce((합, 화) => 합 + 화.폭, 0)
  const 최대높이 = Math.max(...보일화면s.value.map(화 => 화.높이))
  return Math.min(
    1,
    (칸폭.value - 간격 * (대수 - 1)) / 총폭,
    칸높이.value / 최대높이
  )
})

/**
 * 한 대만 세울 때는 **폭·높이 둘 다** 칸에 맞춘다. 여럿일 때 높이만 보는 것은 높이를
 * 맞춰야 나란히 읽히기 때문인데, 혼자면 맞출 상대가 없어 칸을 다 쓰는 것이 맞다.
 */
const 배율of = (화: i화면) => {
  if (배율모드.value === '100%') return 1
  if (칸높이.value <= 0) return 1
  if (단독.value) return Math.min(1, 칸폭.value / 화.폭, 칸높이.value / 화.높이)
  if (배율모드.value === '전체') return 전역배율.value
  return Math.min(1, 칸높이.value / 화.높이)
}

/* ── 첫 그림 ───────────────────────────────────────────────────────── */

/**
 * **선반을 재기 전에는 프레임을 안 세운다.** 칸이 `0` 이면 배율이 1 이 되어 1920 짜리
 * 상자가 한 프레임 번쩍였다가 줄어든다 — `useGridCols` 가 안 재어 봤을 때 `Infinity` 를
 * 돌려주는 것과 같은 갈래다(「모르니까 아직 하지 마라」).
 */
const 준비됨 = computed(() =>
  배율모드.value === '100%' || 칸높이.value > 0)

/**
 * 프레임을 통째로 다시 세운다. 프레임 안은 별개의 앱이라 여기서 표를 갈아 끼워도
 * 안에 남은 상태(고른 행·펼친 필터)는 따라오지 않는다 — 처음부터 보고 싶을 때 누른다.
 */
const 세대 = ref(0)
const 다시세우기 = () => {
  세대.value += 1
}
</script>

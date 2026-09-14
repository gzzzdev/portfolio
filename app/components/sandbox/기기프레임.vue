<!--
  기기 하나를 프레임으로 세운다 — 판 둘(`sandbox/device/list1`·`list2`)이 같이 쓴다.

  **재는 법은 판이 정하고, 세우는 법은 여기가 진다.** 배율을 어떻게 고르느냐가 두 판이
  갈리는 유일한 자리라 그것만 밖에서 받고, 상자 치수·`scale` 원점·캡션에 적는 것은
  여기 한 벌이다. 이게 갈리면 같은 기기가 두 판에서 다른 수를 달고 서게 된다.

  ## 상자와 프레임은 크기가 다르다

  `transform: scale` 은 **레이아웃 상자를 안 줄인다.** 그래서 바깥 상자에 「줄어든 크기」를
  따로 잡아 주지 않으면 옆 기기가 겹치고, 한 대만 세울 때도 빈자리가 남는다.
  원점을 `top left` 로 두는 것도 같은 이유 — 기본값(`center`)이면 줄어든 그림이
  상자 밖으로 삐져나간다.
-->
<template>
  <figure
    class="flex min-w-0 flex-col gap-1.5"
    :style="{ width: `${칸폭}px` }"
  >
    <!--
      ## 껍데기 (`껍데기` 를 켰을 때만)

      **진짜 몸체로 그린다.** 테두리 한 줄로는 「기기」로 안 읽혔다 — 화면에 테를 두른 것과
      구분이 안 갔다. 그래서 몸통은 **어두운 무채색 덩어리**이고 화면이 그 안에 박힌다.
      기기 사진이 늘 어두운 몸체인 데는 이유가 있다: 밝은 화면과 대비가 서야 화면이 화면으로
      보인다. 어두운 몸체는 **밝은 테마에서도 어두운 테마에서도 그대로** 어둡다 —
      실물이 테마를 안 따르기 때문이고, 배경에 묻히지 않게 테를 하나 두른다.

      **색은 여전히 안 쓴다.** 전부 무채색이고, 이 판에서 색이 뜨는 자리는 등급 배지뿐이다.

      표식은 종류를 말하는 데 필요한 만큼만 — 폰은 스피커 슬릿·홈바·옆버튼, 태블릿은
      카메라 점·홈바, 랩탑은 카메라 점과 받침, 모니터는 턱·목·발. 치수는 전부
      `_틀.ts` 의 `껍데기틀s` 에서 오고 **배율 계산도 같은 값을 쓴다** — 두 벌로 두면 갈린다.

      껍데기는 `표시폭×표시높이` **바깥에만** 있다. 안쪽 화면은 한 화소도 안 바뀌어서,
      껍데기를 씌워도 판이 말하는 뷰포트는 그대로다.
    -->
    <div
      v-if="껍데기 && 틀"
      class="flex flex-col items-center"
    >
      <!-- ── 몸통 ─────────────────────────────────────────────────────── -->
      <div
        class="relative bg-neutral-800 shadow-xl ring-1 ring-neutral-600/60"
        :style="{ padding: 테두리, borderRadius: `${틀.바깥R}px` }"
      >
        <div
          class="overflow-hidden bg-white"
          :style="{
            width: `${표시폭}px`,
            height: `${표시높이}px`,
            borderRadius: `${틀.안쪽R}px`
          }"
        >
          <iframe v-bind="프레임" />
        </div>

        <!--
          위 테두리의 표식. 폰은 스피커 슬릿, 태블릿·랩탑은 카메라 점.
          **눕히면 왼쪽 테두리로 간다** — 자리를 미는 축이 통째로 바뀌므로 `자리` 가 짓는다.
        -->
        <div
          v-if="틀.위표식 === '슬릿'"
          class="absolute rounded-full bg-neutral-600"
          :style="슬릿"
        />
        <div
          v-else-if="틀.위표식 === '카메라'"
          class="absolute rounded-full bg-neutral-600"
          :style="카메라"
        />

        <!-- 아래 테두리의 홈 막대(손에 드는 것만). 눕히면 오른쪽 테두리다. -->
        <div
          v-if="틀.홈바"
          class="absolute rounded-full bg-neutral-500"
          :style="홈바"
        />

        <!--
          옆 버튼(폰만). 몸통 밖으로 2px 나온다 — `껍데기몫` 이 그 4px 을 이미 셌다.
          세로로 세우면 왼쪽 둘이 볼륨, 오른쪽 하나가 전원. 눕히면(위가 왼쪽으로 가는
          쪽으로 돌린다) 볼륨이 아래 테두리, 전원이 위 테두리로 간다.
        -->
        <template v-if="틀.옆버튼">
          <div
            v-for="버튼 in 옆버튼s"
            :key="버튼.키"
            class="absolute rounded-full bg-neutral-600"
            :style="버튼.style"
          />
        </template>
      </div>

      <!--
        랩탑 받침 — 뚜껑보다 좌우로 내밀고, 가운데 여는 홈이 팬다.
        **홈이 없으면 받침이 아니라 밑줄로 읽힌다.**
      -->
      <div
        v-if="틀.받침"
        class="flex items-start justify-center rounded-b-lg bg-neutral-700 shadow-md ring-1 ring-neutral-600/60"
        :style="{ height: `${틀.받침.높이}px`, width: `${표시폭 + 틀.옆 * 2 + 틀.받침.내밀기 * 2}px` }"
      >
        <div class="h-1 w-20 rounded-b-full bg-neutral-800" />
      </div>

      <!-- 모니터 목과 발. -->
      <div
        v-if="틀.목"
        class="bg-neutral-700"
        :style="{ height: `${틀.목.높이}px`, width: `${틀.목.폭}px` }"
      />
      <div
        v-if="틀.발"
        class="rounded-full bg-neutral-700 shadow-md"
        :style="{ height: `${틀.발.높이}px`, width: `${발폭}px` }"
      />
    </div>

    <div
      v-else
      class="overflow-hidden rounded-lg border border-default bg-default shadow-xs"
      :style="{ width: `${표시폭}px`, height: `${표시높이}px` }"
    >
      <iframe v-bind="프레임" />
    </div>

    <figcaption
      class="flex flex-wrap items-baseline gap-x-2 gap-y-0.5"
      :title="전체설명"
    >
      <!-- 이름은 판이 그린다 — 선반에서는 누르는 손잡이고, 한 대 판에서는 그냥 이름이다. -->
      <slot name="이름">
        <span class="text-xs font-medium text-highlighted">{{ 화면.이름 }}</span>
      </slot>
      <span
        v-if="!좁은가"
        class="font-mono text-[0.6875rem] tabular-nums text-muted"
      >{{ 화면.폭 }}×{{ 화면.높이 }}</span>
      <!-- **색이 뜨는 유일한 자리.** 눕히는 것만으로 축을 넘는 기기인가. 좁아도 안 걷는다. -->
      <span
        class="rounded px-1 py-px text-[0.625rem]"
        :class="화면.등급바뀜 ? 'bg-warning/10 text-warning' : 'bg-elevated text-muted'"
        :title="화면.등급바뀜 ? '눕히면 등급이 넘어간다' : ''"
      >{{ 화면.등급 }}</span>
      <template v-if="!좁은가">
        <span class="font-mono text-[0.625rem] tabular-nums text-dimmed">×{{ 배율.toFixed(2) }}</span>
        <!-- **물린 글자 배율은 늘 적는다.** 안 적으면 「왜 깨지지」의 답이 화면 어디에도 없다. -->
        <span
          v-if="글자배율 !== 1"
          class="rounded bg-warning/10 px-1 py-px font-mono text-[0.625rem] tabular-nums text-warning"
          :title="물린법 === 'rem통째'
            ? '이 브라우저가 text-size-adjust 를 무시해서 루트 글자 크기로 대신 밀었다 — rem 여백까지 같이 커지므로 실기기보다 세게 깨진다'
            : '기기의 글꼴 크기 설정과 같은 길로 물렸다 — 글자만 커지고 여백은 그대로다'"
        >글자 ×{{ 글자배율.toFixed(2) }}<span
          v-if="물린법 === 'rem통째'"
          class="font-sans"
        > · rem 통째</span></span>
        <span
          v-if="화면.부제"
          class="text-[0.625rem] text-dimmed"
        >{{ 화면.부제 }}</span>
        <!-- 실측이 아닌 것은 그렇다고 적는다. 코드 속 리터럴은 근거가 아니다. -->
        <span
          class="text-[0.625rem] text-dimmed"
          :class="화면.실측 ? 'invisible' : ''"
          title="알려진 값이지 실측이 아니다. 브라우저 크롬을 안 뺐다."
        >추정</span>
        <!--
          **「내 모니터는 1600 인데?」에 판이 스스로 답한다.** 목록5 의 상자가 1280
          (`max-w-(--ui-container)`)에서 성장을 멈춰서, 이 폭 위로는 1440 이든 3840 이든
          목록 칸이 470px 로 같다. 그래서 기기 크기를 더 늘어놓을 이유가 없다.
        -->
        <span
          v-if="화면.폭멈춤"
          class="rounded bg-elevated px-1 py-px text-[0.625rem] text-dimmed"
          title="목록5 의 상자가 1280(--ui-container)에서 멈춘다 — 이 위로는 1440 이든 3840 이든 같은 그림이고 여백만 는다 (2026-09-10 실측)"
        >1280 멈춤</span>
      </template>
      <slot name="뒤" />
    </figcaption>
  </figure>
</template>

<script setup lang="ts">
import { computed, ref, shallowRef, watch } from 'vue'
import { 껍데기몫, 껍데기틀s, type i화면 } from '~/pages/decisions/device/_틀'

const props = withDefaults(defineProps<{
  화면: i화면
  주소: string
  배율: number
  /** 프레임을 통째로 다시 세울 때 바뀌는 수. 안에 남은 상태를 버린다. */
  세대: number
  /**
   * 기기 껍데기를 씌울지. 기본 끔.
   *
   * **`list1`(늘어놓기)은 안 씌운다** — 「전체」 배율이 다섯 대의 폭을 정확히 나눠 담는데,
   * 껍데기가 기기마다 다른 몫을 더하면 그 계산이 흐트러진다. 게다가 `×0.3` 으로 줄면
   * 테두리 8px 이 화면의 1/6 을 먹어서, 비교하려던 것이 껍데기에 가린다.
   */
  껍데기?: boolean
  /**
   * **기기의 글자 배율** — 안드로이드 글꼴 크기 설정을 프레임 안에 물린다. 기본 `1`.
   *
   * `배율` 과 정반대의 것이다. `배율` 은 프레임을 통째로 줄이니 **판이 안 바뀐다**
   * (글자도 칸도 같이 줄어든다). 이건 **뷰포트 폭을 그대로 둔 채 글자만** 키워서
   * 레이아웃을 깬다 — 실기기에서 깨지고 여기서 안 깨지던 그 차이다(2026-09-10).
   *
   * 실기기의 수는 `/decisions/device/axis` 의 「지금 폭 기록」이 담는다.
   */
  글자배율?: number
}>(), { 껍데기: false, 글자배율: 1 })

/* ── 글자 배율 물리기 ──────────────────────────────────────────────── */

/**
 * ## 물리는 법이 둘이고, **둘은 다르게 깨진다**
 *
 * 안드로이드의 글꼴 크기 설정이 하는 일은 **글자 크기만** 곱하는 것이다. 테일윈드의 여백
 * (`p-4` = `1rem`)은 `rem` 이지만 그건 안 커진다 — 브라우저가 `em`·`rem` 을 풀 때 쓰는 밑은
 * 배율이 곱해지기 **전**의 크기라서다. 그래서 실기기에서는 **글자만 부풀어 칸을 넘는다.**
 *
 * 1. **`text-size-adjust: 130%`** — 그 동작을 그대로 부르는 표준 손잡이다. 먹으면 실기기와
 *    같은 그림이 된다. 그런데 **데스크톱 크롬은 이걸 무시한다**(글자 자동 확대가 모바일에서만
 *    도는 기능이라). 그래서 걸어 보고 **재서** 먹었는지 확인한다 — 문서에 적힌 대로 믿지 않는다.
 * 2. **루트 글자 크기 밀기** — 1이 안 먹었을 때의 대타. 글자는 정확히 배율만큼 커지지만
 *    `rem` 여백까지 같이 커져서 **실기기보다 세게 깨진다.** 근사치라는 걸 캡션이 적는다
 *    (`물린법`) — 안 적으면 판이 조용히 거짓말을 한다.
 *
 * 어느 쪽이든 **뷰포트 폭은 한 화소도 안 건드린다.** 그게 `배율`(프레임을 통째로 줄이는 것)과
 * 갈리는 자리이고, 실기기의 깨짐이 `배율` 로는 한 번도 안 재현되던 이유다(2026-09-10).
 */
type i물린법 = '글자만' | 'rem통째'

/**
 * 프레임 안에서 **글자 한 줄이 실제로 몇 px 로 서는지.** 계산된 값을 읽지 않고 그려서 재는
 * 건, 배율이 계산된 값에 반영되는지가 브라우저마다 갈리기 때문이다. `line-height:1` 이라
 * 상자 높이가 곧 글자 크기고, 크기를 안 적어서 루트에서 물려받는다.
 */
const 잰글자 = (doc: Document) => {
  const 자 = doc.createElement('div')
  자.style.cssText = 'position:fixed;top:-9999px;left:0;line-height:1;visibility:hidden'
  자.textContent = '가'
  doc.body.append(자)
  const 높이 = 자.getBoundingClientRect().height
  자.remove()
  return 높이 || 16
}

/**
 * **`load` 를 기다린다.** 프레임을 다시 세우면(`세대`) 문서가 갈려서 다시 물려야 하고,
 * 안에서 링크를 눌러 넘어가도 같은 자리를 탄다. `주소` 가 늘 같은 오리진이라
 * `contentDocument` 가 열리지만, 아직 안 실린 순간이 있어 `null` 을 다 받는다.
 */
const 선것 = shallowRef<HTMLIFrameElement | null>(null)

/** 지금 먹은 법. 캡션이 이걸 적는다 — `rem통째` 는 근사치라는 뜻이다. */
const 물린법 = ref<i물린법 | null>(null)

/**
 * **프레임의 인라인 스타일을 건드리면 안 된다.** 앱 자신이 거기에 테마의 글자 크기 축을
 * 쓴다(`theme/css.ts` 가 `html` 에 `font-size: 125%`). 같은 자리를 둘이 쓰면 나중에 쓴 쪽이
 * 이기는데, 테마는 프레임이 실린 **뒤에** 붙어서 판이 물린 값을 지웠다(2026-09-10 실측 —
 * 캡션엔 `×1.25` 라고 적혀 있는데 프레임 루트는 16px 이었다).
 *
 * 그래서 **판은 `<style>` 한 장을 얹는다.** `!important` 라 앱의 인라인 값을 렌더에서만
 * 이기고, 앱이 쓴 값은 그대로 남는다 — 판을 끄면 앱 값이 그대로 되살아난다.
 */
const 딱지id = 'sandbox-글자배율'

const 판떼기 = (doc: Document) => {
  doc.getElementById(딱지id)?.remove()
}

const 판얹기 = (doc: Document, 규칙: string) => {
  판떼기(doc)
  const st = doc.createElement('style')
  st.id = 딱지id
  st.textContent = `html{${규칙}}`
  doc.head.append(st)
}

const 물리기 = () => {
  const doc = 선것.value?.contentDocument
  if (!doc?.documentElement || !doc.head || !doc.body) return

  // 늘 맨바닥에서 다시 문다 — 배율을 낮출 때 옛 값이 남으면 판이 큰 쪽으로 거짓말을 한다.
  판떼기(doc)
  물린법.value = null
  if (props.글자배율 === 1) return

  // **밑은 그때그때 프레임 안에서 잰다.** 앱 테마의 글자 크기 축이 이미 물려 있을 수 있고,
  // `16` 으로 박으면 그 위에 곱해야 할 것을 덮어써서 판이 조용히 거짓말을 한다.
  const 기본px = 잰글자(doc)
  const 퍼센트 = `${props.글자배율 * 100}%`

  판얹기(doc, `-webkit-text-size-adjust:${퍼센트}!important;text-size-adjust:${퍼센트}!important`)
  // **먹었는지 재서 안다.** 1% 만 넘으면 먹은 것 — 반올림 때문에 딱 맞진 않는다.
  if (잰글자(doc) > 기본px * 1.01) {
    물린법.value = '글자만'
    return
  }

  판얹기(doc, `font-size:${(기본px * props.글자배율).toFixed(3)}px!important`)
  물린법.value = 'rem통째'
}

const 실렸다 = (e: Event) => {
  선것.value = e.target as HTMLIFrameElement
  물리기()
  // **테마가 프레임보다 늦게 붙는다.** `load` 뒤에 앱이 루트 글자 크기를 다시 쓰므로,
  // 그 뒤에 한 번 더 재서 문다(`<style>` 은 안 뺏기지만 **밑**이 바뀌므로 다시 곱해야 한다).
  requestAnimationFrame(() => setTimeout(물리기, 0))
}

watch(() => props.글자배율, 물리기)

/** 상자가 둘(껍데기 있고 없고)이라 프레임 바인딩은 한 벌로 둔다. */
const 프레임 = computed(() => ({
  key: `${props.화면.키}-${props.세대}`,
  src: props.주소,
  title: `${props.화면.이름} ${props.화면.폭}×${props.화면.높이}`,
  class: 'block border-0',
  style: {
    width: `${props.화면.폭}px`,
    height: `${props.화면.높이}px`,
    transform: `scale(${props.배율})`,
    transformOrigin: 'top left'
  },
  onLoad: 실렸다
}))

const 표시폭 = computed(() => Math.round(props.화면.폭 * props.배율))
const 표시높이 = computed(() => Math.round(props.화면.높이 * props.배율))

/** 이 기기의 껍데기 치수. `껍데기` 를 껐으면 `null` 이라 몸통을 통째로 안 그린다. */
const 틀 = computed(() => (props.껍데기 ? 껍데기틀s[props.화면.껍데기] : null))

/** `figure` 가 잡을 폭. 껍데기를 씌우면 그만큼 넓다(`껍데기몫` 이 정본, 눕히면 같이 눕는다). */
const 칸폭 = computed(() =>
  표시폭.value + (props.껍데기 ? 껍데기몫(props.화면.껍데기, props.화면.눕는가).폭 : 0))

/**
 * ## 눕히면 **몸통이 돈다** — 화면만 넓어지는 게 아니다
 *
 * 눕힌 폰에 슬릿이 위에, 홈바가 아래에, 버튼이 좌우에 그대로 남으면 「누운 폰」이 아니라
 * **「넓적한 폰」**으로 읽힌다. 판이 답해야 할 물음이 「이 기기를 눕히면 어떻게 서나」인데
 * 껍데기가 안 돌면 그 답이 반만 그려진다.
 *
 * **위가 왼쪽으로 가는 쪽으로 돌린다**(아이폰의 가로 기본과 같다). 그러면
 * 슬릿·카메라는 왼쪽 테두리, 홈바는 오른쪽 테두리, 볼륨은 아래·전원은 위로 간다.
 * 도는 것은 몸통뿐이고 **안쪽 화면은 그대로**라 판이 말하는 뷰포트는 안 바뀐다.
 */
const 테두리 = computed(() => {
  const 틀v = 틀.value
  if (!틀v) return undefined
  return props.화면.눕는가
    ? `${틀v.옆}px ${틀v.아래}px ${틀v.옆}px ${틀v.위}px`
    : `${틀v.위}px ${틀v.옆}px ${틀v.아래}px`
})

/**
 * 테두리 한 줄 한가운데에 눕는 막대(슬릿·카메라 점·홈바). 눕히면 **미는 축과 길이·두께가
 * 통째로 바뀌어서** 클래스로는 못 가른다 — `inset-x-0 mx-auto` 가 `inset-y-0 my-auto` 가 된다.
 */
const 막대 = (테: number, 두께: number, 길이: number, 쪽: '위' | '아래') => {
  const 밀기 = `${(테 - 두께) / 2}px`
  return props.화면.눕는가
    ? {
        [쪽 === '위' ? 'left' : 'right']: 밀기,
        top: '0', bottom: '0', marginBlock: 'auto',
        width: `${두께}px`, height: `${길이}px`
      }
    : {
        [쪽 === '위' ? 'top' : 'bottom']: 밀기,
        left: '0', right: '0', marginInline: 'auto',
        height: `${두께}px`, width: `${길이}px`
      }
}

const 슬릿 = computed(() => 막대(틀.value?.위 ?? 0, 4, 54, '위'))
const 카메라 = computed(() => 막대(틀.value?.위 ?? 0, 5, 5, '위'))
const 홈바 = computed(() => 막대(틀.value?.아래 ?? 0, 4, 틀.value?.홈바 ?? 0, '아래'))

/** 긴 쪽의 몇 %에 어느 버튼이 서나. 실물 자리를 눈대중으로 옮긴 값이다. */
const 옆버튼자리s = [
  { 키: '볼륨위', 자리: 0.19, 길이: 0.07, 볼륨: true },
  { 키: '볼륨아래', 자리: 0.28, 길이: 0.07, 볼륨: true },
  { 키: '전원', 자리: 0.22, 길이: 0.1, 볼륨: false }
]

const 옆버튼s = computed(() => {
  const 눕 = props.화면.눕는가
  /** 세로면 몸통 높이, 눕히면 몸통 폭 — 버튼이 늘어서는 축이다. */
  const 긴쪽 = 눕 ? 표시폭.value : 표시높이.value
  return 옆버튼자리s.map(({ 키, 자리, 길이, 볼륨 }) => ({
    키,
    style: 눕
      ? { [볼륨 ? 'bottom' : 'top']: '-2px', left: `${긴쪽 * 자리}px`, width: `${긴쪽 * 길이}px`, height: '2px' }
      : { [볼륨 ? 'left' : 'right']: '-2px', top: `${긴쪽 * 자리}px`, height: `${긴쪽 * 길이}px`, width: '2px' }
  }))
})

/** 모니터 발은 몸통보다 좁다 — 그래서 폭에 안 더해진다(`껍데기몫`). */
const 발폭 = computed(() => {
  const 발 = 틀.value?.발
  return 발 ? Math.max(발.최소폭, Math.round(표시폭.value * 발.폭비)) : 0
})

/**
 * **캡션은 상자보다 넓으면 안 된다.** 넓으면 줄 전체를 밀어서 「전체」 배율이 다 넣었다고
 * 계산해 놓고도 넘친다 — 폰 상자가 177 인데 캡션이 238 이라 다섯 대에서 156px 이 샜다
 * (2026-09-09 실측). 그래서 `figure` 에 상자 폭을 박고, 안 들어갈 만큼 좁으면 **줄인다.**
 *
 * 줄여도 **등급 배지는 남는다.** 이 판에서 색이 뜨는 유일한 자리라 그게 빠지면 판이 답을
 * 못 한다 — 필터 띠가 접혀도 개수와 고른 칩을 남기는 것과 같은 이유다.
 * 걷은 것은 사라지지 않고 캡션 툴팁(`전체설명`)으로 간다.
 */
const 좁은가 = computed(() => 칸폭.value < 200)

const 전체설명 = computed(() => [
  props.화면.이름,
  `${props.화면.폭}×${props.화면.높이}`,
  props.화면.등급,
  `×${props.배율.toFixed(2)}`,
  props.글자배율 === 1 ? '' : `글자 ×${props.글자배율.toFixed(2)} (${물린법.value ?? '못 물림'})`,
  props.화면.부제,
  props.화면.실측 ? '실측' : '추정(알려진 값)',
  props.화면.폭멈춤 ? '1280 에서 멈춤 — 이 위는 다 같은 그림' : ''
].filter(Boolean).join(' · '))
</script>

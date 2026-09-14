import { breakpointsTailwind, useBreakpoints, useElementSize } from '@vueuse/core'

import { computed, type Ref } from 'vue'

/**
 * **뷰포트 폭 쿠키.** 클라가 실제 `innerWidth`(CSS px)를 적고, 다음 SSR 이 첫 페인트의 폭으로 읽는다.
 * 테마 쿠키(`m_theme`, `plugins/00.theme-ssr.server.ts`)와 같은 패턴 — 첫 HTML 을 클라 판정과 맞추는 힌트.
 */
const 폭쿠키 = 'm_vw'
const 폭쿠키수명 = 60 * 60 * 24 * 365

/** 클라: resize 리스너는 탭에 하나면 된다(호출부가 넷). */
let 폭기록시작됨 = false
/**
 * 클라: **하이드레이션 전에 읽어 둔** 쿠키 폭. `null` = 쿠키 없음.
 * 아래 `폭기록()` 이 쿠키를 곧바로 최신값으로 덮으므로, 서버가 읽은 값을 남겨 두려면 먼저 잡아야 한다.
 */
let 하이드레이션폭: number | null | undefined

const 폭기록 = () => {
  document.cookie = `${폭쿠키}=${window.innerWidth}; path=/; max-age=${폭쿠키수명}; samesite=lax`
}

const 쿠키폭 = (): number | undefined => {
  const raw = useCookie<number | string | null>(폭쿠키, { default: () => null, readonly: true }).value
  const n = Number(raw)
  return Number.isFinite(n) && n > 0 ? n : undefined
}

/**
 * `useBreakpoints` 의 `ssrWidth` — **서버와 클라 첫 렌더가 같은 수를 보게** 하는 값.
 *
 * - 서버: 이 요청의 쿠키.
 * - 클라(하이드레이션 중): 서버가 읽었을 그 쿠키값. 실제 폭이 아니다 — 첫 렌더는 서버 HTML 과 같아야 하고,
 *   진짜 폭은 vueuse 가 바로 다음 틱에 `matchMedia` 로 갈아끼운다(`useMediaQuery` 의 `ssrSupport` 경로).
 * - 클라(그 뒤): 실제 폭. 늦게 마운트되는 소비자가 옛값으로 한 번 그릴 이유가 없다.
 */
const 첫렌더폭 = (): number | undefined => {
  if (import.meta.server) return 쿠키폭()
  if (하이드레이션폭 === undefined) 하이드레이션폭 = 쿠키폭() ?? null
  return useNuxtApp().isHydrating ? (하이드레이션폭 ?? undefined) : window.innerWidth
}

/**
 * ## 조치1 (2026-09-13, 적용) — 실제 폭을 쿠키로 SSR 에 넘긴다
 *
 * ### 원인
 * 서버는 뷰포트 폭을 모른다. 예전엔 `ssrWidth: isMobile ? 360 : undefined` 였다 — `isMobile` 은
 * `@nuxtjs/device` 의 **폰 전용** 플래그라 태블릿·좁힌 데스크톱 창·DevTools 반응형 모드는 전부 `undefined` 로
 * 떨어졌고, `ssrWidth` 가 없으면 vueuse 는 서버에서 **모든 미디어쿼리를 false** 로 답한다(`is미니=false` → 분할판).
 * 한편 클라는 mount 를 기다리지 않는다 — `useSupported` 가 setup 에서 곧장 `matchMedia` 를 부르므로
 * 하이드레이션 첫 vnode 부터 실제 폭(모바일 트랙)이다. 서버 HTML 과 클라 첫 트리가 처음부터 다르다.
 *
 * 그 mismatch 를 Vue 가 복구하는 과정이 화면을 비웠다(실측, `/admin/members` 500px + 데스크톱 UA):
 * 같은 태그는 클래스가 달라도 재사용되어 `mSplitter` 의 두 pane 이 모바일 트랙의 두 칸으로 쓰이고,
 * pane 안에서는 슬롯(fragment) 구조가 달라 `handleMismatch` 가 서버 목록을 떼고, "fewer child nodes" 분기가
 * 클라 목록을 pane 끝에 붙인 뒤, 같은 pane 의 "more child nodes than client vdom" 분기가 **방금 붙인 그 목록을
 * 도로 지웠다.** 컴포넌트 상태엔 행이 다 있는데 `mList` 요소만 문서에서 떨어져 있다(`isConnected=false`).
 * 운영 빌드도 같다 — 구조 복구는 프로덕션에서도 돌고 경고만 빠진다.
 *
 * ### 조치
 * 클라가 `innerWidth` 를 `m_vw` 쿠키에 적고(첫 호출 + resize), 서버는 그 값을 `ssrWidth` 로 쓴다.
 * **새로고침은 정확하다.** 쿠키가 없거나 낡았을 때(첫 방문, 다른 앱에서 회전한 뒤 돌아와 새로고침)만 추정으로
 * 떨어지는데, 그때도 서버·클라 첫 렌더는 **같은 수**를 보므로 mismatch 가 아니라 하이드레이션 뒤의 평범한
 * 재렌더(한 번 튐)로 끝난다 — 예전의 `undefined` 는 클라 쪽만 실측이라 첫 렌더부터 갈렸다.
 * 폰이 아닌 UA 의 추정값이 1024 인 이유: 그 부류(데스크톱·태블릿)에서 더 흔한 쪽이고, 틀려도 튐이지 빈 화면이 아니다.
 *
 * ### 남는 것
 * 쿠키가 낡은 한 번의 로드에서 튐이 남는다. 그것까지 없애는 게 아래 조치2 다.
 *
 * ## 조치2 (미적용) — 폭 분기를 JS 가 아니라 CSS 브레이크포인트로 옮겨 DOM 을 같게 만든다
 *
 * 서버·클라가 **같은 DOM** 을 내고 폭에 따른 모양은 클래스 변형(`max-xs:` / `xs:`)이 고르게 한다.
 * `l/Dock.vue` 가 이미 이렇게 한다("폭 분기는 JS 가 아니라 CSS 로 한다") — 마크업이 같으니 mismatch 자체가 없다.
 * 남은 자리는 `is미니` 로 **트리를 가르는** 소비자들이다: `m/Box/반응형.vue`(splitter ↔ 밀리는 트랙, `v-if`),
 * `view/목록5`(`#top` 슬롯 유무·상세 팝업), `Input/카드·카드s`. 반응형 상자라면 두 트랙을 한 DOM 으로 합치고
 * 좁을 때만 `absolute`·`translate` 로 미는 식이 된다. 마크업 구조가 커지고 splitter 드래그처럼 JS 가 꼭 필요한 부분은
 * 여전히 남으므로, 그 화면들을 다시 짤 때 같이 옮기는 게 맞다. 그 전까지는 조치1 이 새로고침을 지킨다.
 */
export const useResponsive = () => {
  const { isMobile } = useDevice()

  const ssrWidth = 첫렌더폭() ?? (isMobile ? 360 : 1024)

  if (import.meta.client && !폭기록시작됨) {
    폭기록시작됨 = true
    폭기록()
    window.addEventListener('resize', 폭기록, { passive: true })
  }

  const breakpoints = useBreakpoints({ ...breakpointsTailwind, xs: 800 }, { ssrWidth })

  const is데스크탑 = breakpoints.greaterOrEqual('lg')
  const is데스크탑_이상 = breakpoints.greaterOrEqual('lg')
  const is태블릿_이상 = breakpoints.greaterOrEqual('md')
  const is모바일_이상 = breakpoints.greaterOrEqual('sm')
  const is미니모바일_이상 = breakpoints.greaterOrEqual('xs')

  const is미니 = breakpoints.smaller('xs')

  return {
    is데스크탑,
    is데스크탑_이상,
    is태블릿_이상,
    is모바일_이상,
    is미니모바일_이상,
    is미니
  }
  // const isLargeScreen = useMediaQuery('(min-width: 1024px)')
  // const isPreferredDark = useMediaQuery('(prefers-color-scheme: dark)')

  // return {
  //     isLargeScreen,
  //     isPreferredDark
  // }
}

export const useResponsive2 = (el: Ref<HTMLElement | null>) => {
  const { width } = useElementSize(el)
  type Breakpoints = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl'
  const breakpoints = {
    'xs': 320, // '320px',
    'sm': 384, // '384px',
    'md': 448, // '448px',
    'lg': 512, // '512px',
    'xl': 576, // '576px',
    '2xl': 672, // '672px',
    '3xl': 768, // '768px',
    '4xl': 896, // '896px',
    '5xl': 1024, // '1024px',
    '6xl': 1152, // '1152px',
    '7xl': 1280// '1280px',
  }

  const is = computed(() => {
    const w = width.value
    const result: Record<string, boolean> = {}

    for (const [key, val] of Object.entries(breakpoints)) {
      const px = val
      result[key] = w >= px
    }
    return result
  })

  // 개별 접근을 위한 computed 헬퍼 (옵션)
  const active = computed(() => {
    // 가장 큰 매칭되는 브레이크포인트 찾기 (예: 'lg')
    const entries = Object.entries(breakpoints).reverse()
    for (const [key, value] of entries) {
      if (width.value >= value) return key
    }
    return ''
  })

  const isGreaterOrEqual = computed(() => {
    return (key: Breakpoints) =>
      breakpoints[key] <= width.value
  })

  return {
    isGreaterOrEqual,
    width,
    is,
    active
  }
}

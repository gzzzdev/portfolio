import { cookieToThemeState, DEFAULT_THEME, parseThemeCookie, resolveDefaultTheme, THEME_COOKIE, 상태채우기, 상태키s, type ColorModePreference, type i화면, type i굵기, type i그림자, type i글꼴, type i글자크기, type i재질, type i줄간격, type i진하기, type ThemeConfig, type ThemeConfigInput, type ThemeState } from '~utils/theme/축'

/**
 * 테마 **값의 보관소**. 조작은 여기 없다 — 축을 밀고 굴리고 되돌리고 완제품을 씌우는 일은
 * 전부 `~models/(system)/model테마` 의 현재 테마 행이 든다(2026-09-09 이관).
 *
 * ## 왜 값만 남았나
 *
 * 같은 일에 입구가 둘이면 **범위가 조용히 갈린다.** 실제로 무작위가 그랬다 — 화면은 묶음 단위,
 * 모델·챗봇은 `'full'` 한 줄이라 챗봇으로 굴린 것을 테마 화면에서 못 되돌렸다. 조작을 거는 자리가
 * 셋(화면·목록 버튼·챗봇)인데 뒤의 둘은 행의 `do*` 를 거치는 길밖에 없으므로, 앞의 하나를 그리로
 * 모았다.
 *
 * ## 그런데 값은 왜 안 옮겼나
 *
 * **첫 바이트에 필요한 값이라서다.** SSR 첫 페인트가 쿠키 하나를 파싱해 이 스토어로 서고
 * (`plugins/00.theme-ssr.server.ts`), `css.ts` 가 이 refs 를 감시해 문서에 바른다
 * (`01.theme-sync.client.ts`). 표를 읽어야 서는 값이 그 경로에 끼면 안 된다 —
 * 누가 요청했는지부터 알아야 하고 비로그인 방문자에겐 읽을 행조차 없다.
 *
 * **여기에 조작을 다시 심지 말 것.** 축 값을 쓰는 길은 행의 `축쓰기` 하나이고, 거기에
 * 직접 맞춤 갈무리가 물려 있다. 스토어에 쓰기 함수를 하나 만들면 그 갈무리를 건너뛴다.
 */

/**
 * localStorage 에서 돌아온 직접 맞춤을 눈금으로 당긴다.
 *
 * 축 값들과 달리 **채워 줄 선언이 없다** — 축은 ref 하나가 칸 하나라 저장값에 빠진 칸이
 * 선언된 기본값으로 서지만, 연습장은 ref 하나에 담긴 객체라 칸이 빠지면 그냥 빈다.
 * 그래서 여기만 `상태채우기` 를 지난다.
 */

function 직접맞춤정규화(v: unknown): { theme: ThemeState, mode: i화면 } | null {
  const o = v as { theme?: unknown, mode?: unknown } | null
  if (!o || typeof o !== 'object' || !o.theme || typeof o.theme !== 'object') return null
  return {
    theme: 상태채우기(o.theme as Partial<Record<keyof ThemeState, unknown>>),
    mode: o.mode === 'dark' ? 'dark' : 'light'
  }
}

const useThemeStore = defineStore(
  'm_theme1233',
  () => {
    /**
     * ── 축 값 열둘 (persist 대상) ──
     *
     * **이 표가 이 파일의 유일한 축 목록이다.** 전에는 같은 열둘이 **네 벌** 있었다 — 여기 선언,
     * `init` 의 대입, `themeState` 의 조립, 그리고 `return` 블록. 축을 하나 늘리면 나머지 셋 중
     * 하나는 반드시 빠뜨린다. 지금은 셋 다 `상태키s` 를 돌아서 여길 읽는다.
     *
     * **초기값은 전부 `DEFAULT_THEME` 다.** 복원(persist)은 `init()` 을 안 타므로 저장값에 없는
     * 칸은 여기 선언값이 그대로 화면으로 나간다 — 자리표시자를 두면 그게 나간다(그래서 뺐다).
     *
     * 글꼴의 `mixed` 는 「고른 적 없음」이고 스택은 `--font-stack-mixed` 로 떨어진다.
     */
    const 축 = {
      font: ref<i글꼴>(DEFAULT_THEME.font),
      weight: ref<i굵기>(DEFAULT_THEME.weight),
      fontScale: ref<i글자크기>(DEFAULT_THEME.fontScale),
      lineHeight: ref<i줄간격>(DEFAULT_THEME.lineHeight),
      primary: ref<string>(DEFAULT_THEME.primary),
      secondary: ref<string>(DEFAULT_THEME.secondary),
      bg: ref<string>(DEFAULT_THEME.bg),
      radius: ref<number>(DEFAULT_THEME.radius),
      elevation: ref<i그림자>(DEFAULT_THEME.elevation),
      variant: ref<i재질>(DEFAULT_THEME.variant),
      contrast: ref<i진하기>(DEFAULT_THEME.contrast),
      borderContrast: ref<i진하기>(DEFAULT_THEME.borderContrast)
    }

    /** 축이 아닌 값들. `bg2` 는 사다리의 짝 칸, `darkMode` 는 화면 모드 선호(주인은 `useColorMode`). */
    const bg2 = ref<string>(DEFAULT_THEME.bg2)
    const darkMode = ref<ColorModePreference>('light')
    const log = ref()

    /**
     * 손으로 맞춘 마지막 조합. 격자에서 완제품 카드들 뒤에 마지막 한 장으로 선다.
     *
     * **저장 버튼이 없다 — 저절로 담긴다.** 목적이 「구경하고 돌아올 자리」라서다: 노을을 고르고
     * 라운드만 돌린 상태에서 심해가 궁금해 눌러 보면 예전엔 그 조합이 이름도 자리도 없이 사라졌다.
     * 되돌리기가 있었지만 그건 스택 pop 이라 서너 장 구경한 뒤엔 못 찾는다.
     *
     * **한 장뿐이고 덮어써진다.** 여러 장을 남기려면 이름을 붙여야 하고 이름이 붙는 자리는 표인데
     * (`model테마s`), 그 표는 조직 공용이라 슬라이더를 미는 족족 남의 격자에 실험이 뜬다.
     * 그래서 연습장은 브라우저에 한 장만 둔다.
     */
    const 직접맞춤 = ref<{ theme: ThemeState, mode: i화면 } | null>(null)

    // ── 초기값 ────────────────────────────────────────────────
    /**
     * 우선순위: 테마 쿠키 > `app/app.config.ts` 의 `기본값` > `DEFAULT_THEME`.
     *
     * 쿠키를 먼저 보는 이유는 서버다. 서버는 localStorage 를 못 읽으므로 쿠키가 없으면
     * 기본 테마로 마크업을 그리는데, 그러면 재방문자의 SSR 마크업(mBox 그림자 클래스 등)이
     * `00.theme-ssr.server.ts` 가 심은 CSS 와 어긋난다.
     */
    const init = () => {
      const _config = (useAppConfig() as any)?.defaultTheme as ThemeConfigInput | undefined
      log.value = _config

      const config: ThemeConfig = {
        ...resolveDefaultTheme(_config),
        ...쿠키테마()
      }

      for (const k of 상태키s) (축[k] as Ref<unknown>).value = config[k]
      bg2.value = config.bg2
      darkMode.value = config.preference
      useColorMode().preference = config.preference
    }

    /** 쿠키에 미러링된 실제 테마 (없거나 Nuxt 컨텍스트 밖이면 빈 값) */
    const 쿠키테마 = (): Partial<ThemeState> => {
      try {
        const parsed = parseThemeCookie(useCookie<unknown>(THEME_COOKIE).value)
        return parsed ? cookieToThemeState(parsed) : {}
      } catch {
        return {}
      }
    }

    const hasPersistedTheme = () => {
      if (!import.meta.client) return false
      try {
        const raw = localStorage.getItem('m_theme1233')
        return !!raw && raw !== '{}'
      } catch {
        return false
      }
    }

    if (!hasPersistedTheme()) init()

    // ── 상태 읽기 ─────────────────────────────────────────────
    /** 축 정의가 다루는 평평한 상태 스냅 (ref → 값) */
    function themeState(): ThemeState {
      return Object.fromEntries(상태키s.map(k => [k, 축[k].value])) as unknown as ThemeState
    }

    return { init, log, ...축, bg2, darkMode, themeState, 직접맞춤 }
  },
  {
    persist: {
      /**
       * 복원은 `init()` 을 안 타고 저장값을 refs 에 바로 꽂는다. **축 값은 손댈 것이 없다** —
       * ref 가 이미 `DEFAULT_THEME` 로 서 있어서 저장값에 없는 칸은 그 기본값 그대로다.
       * 연습장만 객체라 칸을 채워 줄 선언이 없어서 여기를 지난다(`직접맞춤정규화`).
       */
      afterHydrate: (ctx) => {
        const store = ctx.store as unknown as { 직접맞춤: unknown }
        store.직접맞춤 = 직접맞춤정규화(store.직접맞춤)
      }
    }
  }
)

export { useThemeStore }

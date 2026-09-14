import { applyVariantToAppConfig, cookieToThemeState, parseThemeCookie, resolveDefaultTheme, THEME_COOKIE, type ThemeConfigInput } from '~utils/theme/축'
import { themeInlineCss } from '~utils/theme/css'

/**
 * 첫 HTML 에 테마 CSS 변수를 주입 → SSR 첫 페인트를 클라이언트 적용 결과와 맞춘다.
 *
 * - 재방문: 쿠키(`plugins/01.theme-sync.client.ts` 가 씀)의 실제 테마
 * - 첫 방문: `app/app.config.ts` 의 `기본값`
 *
 * 이게 없으면 첫 페인트는 Nuxt UI 기본 팔레트로 칠해졌다가 하이드레이션 후 사용자 색으로 튄다.
 */
export default defineNuxtPlugin(() => {
  const cookie = useCookie<unknown>(THEME_COOKIE, {
    default: () => null,
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
    path: '/'
  })

  const parsed = parseThemeCookie(cookie.value)
  const state = parsed
    ? cookieToThemeState(parsed)
    : resolveDefaultTheme((useAppConfig() as { defaultTheme?: ThemeConfigInput }).defaultTheme)

  // 배지·알럿 등은 CSS 가 아니라 컴포넌트 기본값으로 재질을 받는다 — 첫 페인트도 같이 맞춘다
  applyVariantToAppConfig(useAppConfig() as Record<string, any>, state.variant)

  useHead({
    style: [{
      innerHTML: themeInlineCss(state)
    }]
  })
})

import { nextTick, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { applyThemeToDocument } from '~utils/theme/css'
import { applyVariantToAppConfig, THEME_COOKIE, themeToCookie, type ThemeCookiePayload } from '~utils/theme/축'
import { 현재테마행 } from '~models/(system)/model테마'
import { useThemeStore } from '~/stores/useThemeStore'

/**
 * 테마 상태(Pinia/localStorage) → 문서(CSS 변수) 단방향 반영.
 *
 * 테마 메뉴·축 패널은 스토어 값만 바꾸고 DOM 은 건드리지 않는다. 실제 적용은 여기 한 곳.
 * 적용값은 쿠키에도 미러링해 다음 SSR 첫 페인트(`00.theme-ssr.server.ts`)와 맞춘다.
 */
export default defineNuxtPlugin(async () => {
  const store = useThemeStore()
  const { font, weight, fontScale, lineHeight, primary, secondary, bg, radius, elevation, variant, contrast, borderContrast }
    = storeToRefs(store)

  const cookie = useCookie<ThemeCookiePayload | null>(THEME_COOKIE, {
    default: () => null,
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
    path: '/'
  })

  const colorMode = useColorMode()

  async function sync() {
    await nextTick()
    const state = store.themeState()
    applyThemeToDocument(state)
    // 버튼 아닌 컴포넌트(배지·알럿…)는 래퍼가 없다 — Nuxt UI 기본값을 갈아끼워 따라오게 한다
    applyVariantToAppConfig(useAppConfig() as Record<string, any>, state.variant)
    cookie.value = themeToCookie(state)
  }

  await sync()
  // 하이드레이션 직후 한 번 더 — persist 복원이 늦게 끝나는 경우 대비
  requestAnimationFrame(() => {
    void sync()
  })

  watch(
    [font, weight, fontScale, lineHeight, primary, secondary, bg, radius, elevation, variant, contrast, borderContrast],
    () => {
      void sync()
    }
  )

  // 밝게/어둡게가 바뀌면 기본색 팔레트 목록 자체가 달라짐 → 가장 가까운 색으로 재스냅.
  // **행을 거친다** — 축 값을 쓰는 문이 거기 하나고, 거기에 직접 맞춤 갈무리가 물려 있다
  // (`model테마.축쓰기`). 배럴이 아니라 파일을 직접 부르는 이유는 `(system)/index.ts` 머리말.
  watch(() => colorMode.value, () => {
    현재테마행().축리스냅()
  })
})

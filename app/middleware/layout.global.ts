import { useOfficialSite } from '~/composables/useOfficialSite'

/**
 * **레이아웃은 여기서 고른다** — `route.meta.layout` 하나가 정본이고, `NuxtLayout` 은 `name` 없이 그걸 읽는다.
 *
 * 페이지가 `definePageMeta({ layout })` 로 적은 건 그대로 둔다(문자열도, `false` 도). 안 적은 화면은 **누가 보느냐**로
 * 갈린다 — 공식 사이트 화면(`/official/*`, 그리고 공식 사이트 사람이 자기 메뉴 화면을 볼 때)이면 `layout-official`,
 * 아니면 아무것도 안 적어 `default` 다. 판정은 `useOfficialSite().is공식화면` 이고, 경로는 `useRoute()` 가 아니라
 * **`to.path` 로 넘긴다** — 미들웨어 안의 `useRoute()` 는 아직 앞 화면이다.
 *
 * ## 왜 `app.vue` 의 `<NuxtLayout :name>` 이 아닌가 (2026-09-15)
 *
 * 전엔 `app.vue` 가 `:name="레이아웃"` 으로 골랐다 — 공식 화면이면 문자열, 아니면 `undefined`. 그런데 Nuxt 의 `NuxtLayout` 은
 * `name` 이 **비어 있을 때만** 「이 라우트가 내 레이아웃 것인가」 판정(`LayoutMeta`)을 제공하고, 그 판정은 레이아웃이
 * 태어나는 순간 한 번 고정된다. `app.vue` 의 `useRoute()` 는 `page:finish` 뒤에야 바뀌는 지연 라우트라, 운영자가 `/admin` 에서
 * 띠의 「고민 기록」으로 갈 때 `layout-official` 은 `name` 이 아직 `undefined` 인 채로 태어났다 — 그 판정을 품은 채로.
 * 그 뒤 `meta.layout` 이 없는 화면(`/official`·`/resources`·「운영 화면으로」의 `/admin` …)으로 가면 판정이 거짓이라
 * `NuxtPage` 가 옛 페이지를 그대로 돌려주고(`page.js` 의 「새 레이아웃이 뜰 때까지 옛 vnode」), Suspense 가 안 돌아
 * 지연 라우트도 안 바뀌고, 그래서 새 레이아웃도 영영 안 뜬다 — 주소만 바뀌고 화면은 앞 것이 남는 교착이었다.
 * 정본을 `meta.layout` 하나로 모으면 `NuxtLayout` 이 제 방식(즉시 라우트로 레이아웃 갈아끼우기)대로 돈다.
 *
 * ## 왜 `setPageLayout` 이 아닌가
 *
 * 그건 `beforeResolve` 훅을 하나 걸어 두고 처음 오는 이동에 적는다. 이 뒤에서 리다이렉트가 나면(페이지 미들웨어 등)
 * 그 훅이 **다음 이동**에 잘못 붙는다. `to.meta` 는 이 이동의 것이고 Nuxt 가 `beforeEach` 에서 `reactive` 로 감싸 두므로
 * 바로 적는다 — Nuxt 자신도 hydration 때 같은 방식으로 적는다(`plugins/router.js` 의 `initialLayout`).
 *
 * 순서: 전역 미들웨어는 파일 이름순이라 `access-control.global` 뒤에 돈다 — 그쪽이 읽어 둔 메뉴(`reads네비`)로 판정한다.
 * 서버는 역할 쿠키, 클라이언트는 실제 로그인 상태로 판정하는 건 `useOfficialSite` 그대로다(어긋나면 hydration 뒤 한 번 바뀐다).
 */
export default defineNuxtRouteMiddleware((to) => {
  if (to.meta.layout != null) return
  const { is공식화면 } = useOfficialSite(() => to.path)
  if (is공식화면.value) to.meta.layout = 'layout-official'
})

import { storeToRefs } from 'pinia'
import { toValue } from 'vue'
import { model메뉴s } from '~models/test2'
import { useMyAuthStore } from '~/stores/useMyAuthStore'
import { gnbRolesFromArray, type AuthGnbRole } from '~/stores/useMyAuthStore'
import type { NavGroup } from '~/composables/useNavs'
import { getNavsByMode, pathsFromNavItems } from '~/composables/useNavs'
import { is서브도메인루트 } from '~/composables/useNavs'

const ACCESS_DENIED_TOAST_COOKIE = '__access_denied_toast'
const ACCESS_DENIED_TOAST_VALUE = 'nav-access-denied'
function pathsFromGroup(group: NavGroup): string[] {
  return pathsFromNavItems(group.navs)
}

function normalizePath(path: string): string {
  const p = path.trim()
  if (!p) return '/'
  const cleaned = p.replace(/\/+$/, '')
  return cleaned || '/'
}

/**
 * 루트(`/`·서브도메인 `/admin`·`/official`)는 자기 경로만 잡는다(`is서브도메인루트`).
 * 하위까지 품게 두면 운영자 홈 메뉴 하나가 행 없는 `/admin/*` 전부를 **보호 대상으로도, 허용으로도** 삼는다 —
 * 전자는 메뉴 없는 화면(`/admin/setup` 등)을 막고, 후자는 홈 자격만으로 그 아래를 연다.
 * 서브도메인 홈을 경로로 나누기 전(`/dashboard`·`/home1`)과 같은 판정이다.
 */
function isSameOrChildPath(currentPath: string, basePath: string): boolean {
  const current = normalizePath(currentPath)
  const base = normalizePath(basePath)
  if (base === '/' || is서브도메인루트(base)) return current === base
  return current === base || current.startsWith(`${base}/`)
}

/**
 * 접근제어 밖에 두는 실험 경로.
 *
 * 이 미들웨어는 전역이라 어떤 경로로 들어와도 `useSystem().reads네비()` 가 먼저 돈다 —
 * 역할·메뉴·게시판. 보호할 경로 목록이 메뉴에서 나오므로 그 자체는 맞지만,
 * **메뉴에 없는 실험 화면은 그 대가를 치를 이유가 없다.**
 * (`/v2` 는 자기 테이블 셋만 읽는 독립 실험장이고, 메뉴 행이 없어 애초에 보호 대상도 아니다.
 *  `/p` 는 `/v2` 에서 갈라 나온 persona(인물·배경·장소, `layout-p`) — 같은 lowDB 시험 표라 사정이 같다.
 *  `/sandbox` 는 부품을 실코드로 옮기기 전에 세워 보는 모래밭이라 도메인 데이터를 아예 안 읽는다.
 *  `/decisions` 는 밖에 내보이는 소개 화면 + 그 결정의 증거물인 비교판들이다.
 *  기록은 `utils/decisions` 의 정적 배열이고, **판도 도메인 데이터를 안 읽는다**
 *  — 공개 경로라 그게 규율이다(`pages/decisions/index.vue` 머리말).
 *  `/resume` 은 포트폴리오 소개(`/portfolio`)에서 건너가는 이력서 — 같은 규율의 정적 공개 화면이다.)
 *
 * 그래서 여기서 걷어내도 접근제어가 느슨해지지 않는다 — 보호 대상이 아닌 경로가
 * 보호 대상이 아닌 채로 남을 뿐이다. 메뉴에 올릴 경로라면 이 목록에서 빼야 한다.
 */
const 접근제어제외경로s = ['/v2', '/p', '/sandbox', '/decisions', '/resume']

/**
 * 위 실험 경로 **안쪽인데도 보호 대상인** 것들 — `_tags` 의 태그·메모·일정.
 *
 * 셸만 `layout-v2` 로 옮기면서 주소가 `/v2/*` 로 따라 들어왔을 뿐, 이 셋은 실험이 아니다.
 * `menus` 행이 있고(`접근역할codes` 가 거기 붙어 있다) 진짜 회원 데이터를 든다.
 * **여기 안 적으면 위 한 줄이 통째로 걷어내서 로그아웃 상태로도 메모·일정이 열린다.**
 *
 * 경로의 정본은 이 배열이 아니라 `menus` 행이다(시드는 `seeds/model메뉴.seed.ts`).
 * 그쪽 주소를 옮기면 여기도 같이 옮길 것 — 어긋나면 조용히 열린다.
 *
 * 넷째였던 **자료는 빠졌다** — `/v2/resources` 에서 본(`/resources`) 으로 옮겨서
 * `/v2` 밖이 됐고, 그러면 위 예외에 애초에 안 걸려 평범하게 메뉴가 막는다.
 * 여기 남겨 두면 없는 주소를 보호하는 죽은 줄이 된다.
 *
 * 캘린더(`/calendar`, 파일은 `(test)/(test2)/`)는 여기 없다. `/v2` 밖이라 위 예외에 안 걸리고
 * 미들웨어가 평범하게 도는데, 메뉴 행이 없어 `isManagedPath` 가 안 잡으므로 게이트는 안 걸린다
 * (`/v2/calendar2` 에 있던 동안도 같았다). 행 데이터는 어차피 `api-guard` 가 표 권한(`events:read` 등)으로 막는다.
 */
const 실험경로속보호대상s = ['/v2/tags', '/v2/memos', '/v2/events']

export default defineNuxtRouteMiddleware(async (to) => {
  const is실험경로 = 접근제어제외경로s.some(prefix => isSameOrChildPath(to.path, prefix))
  const is보호대상 = 실험경로속보호대상s.some(prefix => isSameOrChildPath(to.path, prefix))
  if (is실험경로 && !is보호대상) return

  const alert = useAlert()
  const accessDeniedToast = useCookie<string | null>(ACCESS_DENIED_TOAST_COOKIE, {
    default: () => null,
    sameSite: 'lax'
  })

  const showAccessDenied = () =>
    alert.error('접근 제한', '허용된 역할로 접근할 수 없는 메뉴입니다.')

  const notifyAccessDenied = () => {
    if (import.meta.client) showAccessDenied()
    else accessDeniedToast.value = ACCESS_DENIED_TOAST_VALUE
  }

  if (import.meta.client && accessDeniedToast.value === ACCESS_DENIED_TOAST_VALUE) {
    showAccessDenied()
    accessDeniedToast.value = null
  }

  const authStore = useMyAuthStore()
  const { currentRole, roles, isLoggedIn, user } = storeToRefs(authStore)
  const 시스템 = useSystem()

  /**
   * SSR에선 스토어가 비어 있다(`user`는 `skipHydrate` + localStorage 지속).
   * 세션을 먼저 복원하지 않으면 서버가 로그인 사용자를 전부 guest로 보고 되돌려보낸다.
   */
  // `isLoggedIn` 이 아니라 `user` 로 묻는다 — 비회원 세션은 `isLoggedIn` 이 늘 false 라 매 SSR 마다 다시 읽게 된다.
  if (import.meta.server && !user.value) {
    await authStore.fetchUser()
  }

  /**
   * **`/` 는 「내 홈」이다** — 로그인한 사람은 아래에서 자기 역할의 첫 메뉴로 간다(운영자 `/admin`, 담당자 `/admin/own`).
   * 비로그인만 포트폴리오 소개(`/portfolio`)로 보낸다 — 이 배포(portfolio)만의 분기이고, 제품(base)에선 `/official` 이다.
   *
   * 소개를 `/` 에 두었던 적이 있다(2026-09-15). 그러자 `/` 가 「소개」와 「내 홈」 두 뜻을 떠안아 운영자가 `/` 로 와도
   * `/admin` 에 못 갔고, 제품이 「홈으로」 쓰는 이동(로그아웃·401·에러 화면·설정 화면)이 전부 소개로 샜다.
   * 소개는 주소를 따로 갖고, 띠의 「소개」가 거기로 간다 — 로그인한 채로도 돌아갈 길이 막히지 않는다.
   *
   * 비로그인은 메뉴를 읽기 전에 보낸다 — 갈 곳이 메뉴와 상관없다.
   * 판정은 서버가 쿠키로 복원한 세션이라, 새로 연 `/` 는 클라이언트의 localStorage `user` 를 볼 틈 없이 서버에서 갈린다.
   */
  if (to.path === '/' && !isLoggedIn.value) {
    return navigateTo('/portfolio')
  }

  /**
   * 초기데이터 판정(아래 `/admin/setup` 유도)을 **먼저 띄워 두고** 뒤에서 기다린다.
   * 아래에 세우면 `reads네비()` 뒤에 왕복이 하나 직렬로 붙어, 관리자만 그만큼 느려진다 —
   * 두 조회는 서로를 안 본다. 조건이 안 맞으면 아예 안 부른다(`null`).
   */
  const 빈표확인 = import.meta.server && roles.value.includes('admin') && to.path !== '/admin/setup'
    ? 시스템.do빈표확인().catch((error) => {
        console.error('[access-control] core seed check failed', error)
        return false
      })
    : null

  /**
   * 역할/메뉴/게시판은 비로그인 세션에서도 먼저 준비한다 — 메뉴가 비면 보호 대상이 사라진다.
   *
   * **로그인 여부로 갈리지 않는다.** 예전엔 로그인 상태면 `시스템.reads()` 로 표 여덟 개를
   * 통째로 읽었는데, 이 미들웨어가 그중 쓰는 건 `메뉴s`(경로 판정)와 "표가 비었나" 하나뿐이었다.
   * 나머지 다섯(등급·등급요건·회원·게시글·댓글)은 **최초 진입의 대가로만** 존재했다 —
   * 그 표를 실제로 쓰는 화면·부품은 전부 자기 `reads()` 를 부른다(`LandingNoticeBar` 포함).
   * "비었나"는 위 `do빈표확인()` 이 행 없이 묻는다.
   */
  try {
    await 시스템.reads네비()
  } catch (error) {
    console.error('[access-control] core model preload failed', error)
  }

  const allowedRoles = roles.value

  const navsByMode = getNavsByMode() as Record<AuthGnbRole, NavGroup>

  /**
   * 보호 대상과 자격은 메뉴가 소유한다(`접근역할codes`).
   * 역할의 `메뉴순서`는 배치일 뿐이라, 거기서 뽑으면 순서에 안 실린 메뉴가 무방비로 열린다.
   */
  const 메뉴s = toValue(model메뉴s.getInstance().list)
  const allManagedPaths = 메뉴s.map(menu => menu.경로).filter(path => Boolean(path?.trim()))

  /**
   * SSR 단계에서 핵심 seed 표 중 비어있는 게 있으면 `/admin/setup`으로 유도.
   *
   * `is초기데이터`(읽어 둔 목록으로 판정)가 아니라 `do빈표확인()`(개수만 조회)을 쓴다 —
   * 위에서 세 표만 읽으므로 목록으로는 답할 수 없고, 답하려고 여덟 표를 읽던 것이
   * 최초 진입을 무겁게 하던 원인이었다. 실패는 위에서 이미 로그로 삼켰다(`false`).
   */
  if (빈표확인 && await 빈표확인) {
    return navigateTo('/admin/setup')
  }

  let firstNavPath = '/'
  if (allowedRoles.length) {
    let tabRole: AuthGnbRole | null = currentRole.value
    if (!tabRole || !allowedRoles.includes(tabRole)) {
      tabRole = allowedRoles[0] ?? null
      if (tabRole) currentRole.value = tabRole
    }
    if (tabRole) {
      const modePaths = pathsFromGroup(navsByMode[tabRole])
      firstNavPath = modePaths[0] ?? '/'
    }
  }

  /** 로그인한 사람의 `/` → 지금 역할 탭의 첫 메뉴(위 `/` 분기). 메뉴가 하나도 없는 역할이면 제자리 돌기 대신 소개로. */
  if (to.path === '/') {
    return navigateTo(firstNavPath !== '/' ? firstNavPath : '/portfolio')
  }

  const unionPaths = 메뉴s
    .filter(menu => menu.접근역할codes.some(code => allowedRoles.includes(code)))
    .map(menu => menu.경로)
    .filter(path => Boolean(path?.trim()))
  const isManagedPath = allManagedPaths.some(path => isSameOrChildPath(to.path, path))
  const isAllowedForRoles = unionPaths.some(path => isSameOrChildPath(to.path, path))

  /** 비로그인·gnb_roles 없음: 관리 네비 경로는 전부 홈으로 */
  if (!allowedRoles.length && isManagedPath) {
    notifyAccessDenied()
    return navigateTo('/')
  }

  if (allowedRoles.length && isManagedPath && !isAllowedForRoles) {
    notifyAccessDenied()
    return navigateTo(firstNavPath)
  }
})

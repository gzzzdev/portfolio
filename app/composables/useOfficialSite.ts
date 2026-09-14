import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { storeToRefs } from 'pinia'
import {
  isNavDivider,
  isNavItemActive,
  normalizeNavPath,
  useNavs,
  type GnbMode,
  type NavItem,
  type NavLink
} from '~/composables/useNavs'
// 한글 이름은 따로 가져온다 — 자동 import 스캐너가 한글 식별자를 못 읽어 한 줄에 섞으면 그 줄을 통째로 못 알아본다
// (`layouts/layout-official.vue` 머리 주석).
import { is서브도메인루트 } from '~/composables/useNavs'
import { useMyAuthStore } from '~/stores/useMyAuthStore'
import { i역할코드s } from '~models/test2'

/** 공식 사이트(서브도메인 `official`)의 홈. 역할 메뉴의 `home` 행 경로와 같다(`seeds/model메뉴.seed.ts`). */
export const OFFICIAL_HOME = '/official'

const 역할코드인가 = (raw: unknown): raw is GnbMode =>
  typeof raw === 'string' && (i역할코드s as readonly string[]).includes(raw)

function 잎들(items: NavItem[]): NavLink[] {
  const out: NavLink[] = []
  for (const item of items) {
    if (isNavDivider(item)) continue
    out.push(item)
    if (item.children?.length) out.push(...잎들(item.children))
  }
  return out
}

/**
 * **지금 화면이 공식 사이트인가** — 레이아웃(`middleware/layout.global` 이 고른다)·내비·짧은 히어로가 같은 답을 쓴다.
 *
 * 배포에선 서브도메인마다 앱이 따로라(`*-official`·`*-admin`) 공식 앱의 모든 화면이 공식 머리를 쓴다.
 * 이 리포는 한 벌이라 경로와 역할로 가른다:
 *
 * - `/official/*` 는 누가 보든 공식 사이트다.
 * - **공식 사이트 사람**(첫 메뉴가 `/official` 인 역할 — 지금 시드로는 비회원·학습자·준회원)은 **자기 메뉴에 있는 화면**
 *   (신청·소통·자료·내 정보 …)도 공식 사이트로 본다. `/boards/*`·`/resources` 는 여러 서브도메인이 같이 쓰는 공용 화면이라
 *   경로만으론 못 가른다.
 * - 운영자·담당자는 공용 화면에서도 앱 GNB(`default`)다 — 일하는 화면이지 바깥 얼굴이 아니다.
 *
 * 역할을 「이름 목록」이 아니라 **첫 메뉴**로 가르는 이유: 운영자가 역할 메뉴 순서를 바꾸면 그 역할의 홈이 바뀌고,
 * 그게 곧 그 사람이 어느 서브도메인 사람인가다. 코드에 역할 이름을 적어 두면 메뉴 편집과 조용히 어긋난다.
 */
/*
 * 파일·함수 이름이 영문인 건 자동 import 때문이다 — 한글 식별자는 `use`·`is` 로 잘려 잡히고, `use` 는 이미 `use로그인` 이 차지했다.
 */
/**
 * @param 경로 판정할 경로. 안 주면 `useRoute()` — 레이아웃·부품처럼 setup 안에서 부를 때.
 *   미들웨어는 `to.path` 를 넘긴다 — 거기서 `useRoute()` 는 아직 앞 화면이고, Nuxt 도 경고를 찍는다.
 */
export function useOfficialSite(경로?: MaybeRefOrGetter<string>) {
  const route = 경로 == null ? useRoute() : null
  const 지금경로 = () => normalizeNavPath(경로 == null ? route!.path : toValue(경로))
  const { isLoggedIn, currentRole } = storeToRefs(useMyAuthStore())

  /**
   * 지금 역할. 로그인 정보(`user`)는 localStorage 에만 있어서 **서버는 늘 비로그인으로 본다** — 그대로 두면 운영자가
   * 공용 화면을 새로고침할 때 공식 머리로 그렸다가 앱 GNB 로 바뀌며 번쩍인다. 그래서 서버는 역할 쿠키(`auth_current_gnb_role`)를 믿는다.
   * 쿠키는 로그아웃해도 남으니 클라이언트는 실제 로그인 상태로 다시 판정한다(어긋나면 한 번 바뀔 뿐 막히진 않는다).
   */
  const 역할쿠키 = useCookie<string>('auth_current_gnb_role')
  const 지금역할 = computed<GnbMode>(() => {
    if (import.meta.server) return 역할코드인가(역할쿠키.value) ? 역할쿠키.value : 'guest'
    return isLoggedIn.value ? (currentRole.value ?? 'guest') : 'guest'
  })

  const { activeNav: 지금역할메뉴 } = useNavs(지금역할)
  const is공식역할 = computed(() => {
    const 첫 = 잎들(toValue(지금역할메뉴).navs).find(item => item.path?.trim())
    return Boolean(첫?.path && normalizeNavPath(첫.path) === OFFICIAL_HOME)
  })

  /** 공식 머리에 세울 메뉴의 주인. 운영자가 `/official` 을 열면 비회원 메뉴를 보인다 — 바깥 얼굴은 누가 봐도 같아야 한다. */
  const 메뉴역할 = computed<GnbMode>(() => (is공식역할.value ? 지금역할.value : 'guest'))
  const { activeNav: 메뉴원본, visibleNavs } = useNavs(메뉴역할)

  const is공식화면 = computed(() => {
    const path = 지금경로()
    if (path === OFFICIAL_HOME || path.startsWith(`${OFFICIAL_HOME}/`)) return true
    if (!is공식역할.value) return false
    // 숨긴 행(`내 정보` 처럼 `show: false`)도 그 역할의 화면이다 — 줄에 안 설 뿐.
    return 잎들(toValue(메뉴원본).navs).some(item => isNavItemActive(item, path))
  })

  /** 줄에 서는 메뉴. 홈(서브도메인 루트)은 빼고 기관 이름이 입구다. */
  const 메뉴s = computed(() =>
    visibleNavs.value
      .filter((item): item is NavLink => !isNavDivider(item))
      .filter(item => !(item.path && is서브도메인루트(item.path)))
  )

  /**
   * 짧은 히어로 머리 — 지금 경로를 켜는 **가장 깊은** 메뉴 이름. 공지·소식·Q&A 는 「소통」 한 칸이 켠다(`활성경로s`).
   * 메뉴 밖 경로(`/official/enrolls/{id}` 의 부모 없는 상세 등)는 켜진 조상이 답한다.
   */
  const 지금메뉴 = computed<NavLink | null>(() => {
    const path = 지금경로()
    const 켜진것s = 잎들(toValue(메뉴원본).navs)
      .filter(item => !(item.path && is서브도메인루트(item.path)))
      .filter(item => isNavItemActive(item, path))
    return 켜진것s.at(-1) ?? null
  })

  return { 지금역할, is공식역할, 메뉴역할, is공식화면, 메뉴s, 지금메뉴 }
}

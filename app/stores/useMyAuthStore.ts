import { defineStore, skipHydrate } from 'pinia'
import { type i역할코드, i역할코드s } from '~models/test2'
import { do전체repo초기화 } from '~utils/models'

export type AuthGnbRole = i역할코드

export const gnbRolesFromArray = (raw: unknown): AuthGnbRole[] => Array.isArray(raw) ? raw : []
const clampGnbRole = (raw: unknown): AuthGnbRole => typeof raw === 'string' && i역할코드s.includes(raw as AuthGnbRole) ? (raw as AuthGnbRole) : 'guest'

export const useMyAuthStore = defineStore('myAuth', () => {
  // ==========================================
  // 1. State
  // ==========================================
  const user = ref<Record<string, any> | null>(null)
  const isLoading = ref(false)
  const error = ref<Error | null>(null)
  const is수정중 = ref(false)

  /**
   * `isLoading` 은 이제 **화면이 본다**(`로그인4.vue` 의 `:loading`). 그래서 중첩에 견뎌야 한다 —
   * `login클릭` 이 `withLoading` 안에서 `fetchUser` 를 부르고 그 안에 또 `withLoading` 이 있어서,
   * 불린 한 칸으로 두면 **안쪽이 끝날 때 바깥이 아직 도는데도 스피너가 꺼진다.**
   * 깊이를 세서 가장 바깥이 끝날 때만 내린다.
   */
  const 진행깊이 = ref(0)
  const withLoading = async <T>(fn: () => Promise<T>) => {
    진행깊이.value++
    isLoading.value = true
    error.value = null
    try {
      return await fn()
    } catch (e: any) {
      error.value = e
      throw e
    } finally {
      진행깊이.value--
      if (진행깊이.value <= 0) isLoading.value = false
    }
  }

  // ==========================================
  // 2. Getters
  // ==========================================
  /**
   * **회원으로 로그인했나.** 세션이 있어도 비회원(익명 로그인)이면 `false` 다.
   *
   * 비회원도 세션과 회원 행이 있다(신청할 때 익명 로그인이 만든다). 그런데 화면의 「로그인」은 그 사람에게
   * 여전히 로그인 버튼·로그인 안내가 떠야 하는 상태라, 이 이름은 회원 뜻으로 둔다.
   * "신원이 있나"(내 신청을 찾을 수 있나)는 `회원Id` 로 묻는다 — 비회원 세션에도 값이 있다.
   */
  const isLoggedIn = computed(() => !!user.value && !user.value.isAnonymous)

  const roles = computed<AuthGnbRole[]>(() => {
    const u = user.value
    if (!u) return ['guest']
    const codes = gnbRolesFromArray(u.member?.roleCodes ?? u.roleCodes)
    const 역할s = codes.length ? codes : gnbRolesFromArray(u.member?.gnb_roles ?? u.gnb_roles)
    // 역할 없는 세션(비회원 익명 세션)은 서버와 같이 guest 로 본다(`auth-인가.do역할codes`).
    // 빈 배열이면 access-control 이 "역할 없음"으로 보고 비회원에게 열린 메뉴에서도 홈으로 튕긴다.
    return 역할s.length ? 역할s : ['guest']
  })

  /**
   * 로그인한 사람의 **`members` 행 id**. 비로그인이면 빈 문자열.
   *
   * 계정(`users`)이 아니라 회원(`members`)의 id다 — 모델들이 `memberId`로 잡는 축이 후자라
   * `user.id`보다 `member.id`가 앞선다. `nUser`는 네이버 로그인이 실어 보내는 객체.
   */
  const 회원Id = computed<string>(() => {
    const u = user.value
    const id = u?.member?.id ?? u?.nUser?.id ?? u?.id
    return id == null || id === '' ? '' : String(id)
  })

  /** 화면에 띄우는 이름. 회원명 → 계정명 → 소셜 표시명 → 이메일 순. */
  const 표시이름 = computed<string>(() => {
    const u = user.value
    if (!u) return ''
    return String(
      u.member?.name ?? u.name ?? u.nUser?.displayName ?? u.nUser?.nickName ?? u.email ?? ''
    ).trim() || '회원'
  })

  const is관리자 = computed(() => (isLoggedIn.value && roles.value.includes('admin')) ?? false)
  /** 담당자 — 운영자가 맡긴 회원(`members.managerId`)을 관리한다. 무엇을 할 수 있는지는 역할 권한이 정한다. */
  const is담당자 = computed(() => (isLoggedIn.value && roles.value.includes('manager')) ?? false)
  const is학습자 = computed(() => (isLoggedIn.value && roles.value.includes('learner')) ?? false)
  const is준회원 = computed(() => (isLoggedIn.value && roles.value.includes('associate')) ?? false)
  /** 회원이 아니다 — 세션이 없거나, 비회원 익명 세션이거나. */
  const is비회원 = computed(() => (!isLoggedIn.value) ?? true)

  const isUnauthenticated = computed(() => !isLoggedIn.value || roles.value.includes('guest'))

  const currentRoleCookie = useCookie<string>('auth_current_gnb_role', { default: () => '', maxAge: 31536000, sameSite: 'lax', path: '/' })

  const currentRole = computed<AuthGnbRole | null>({
    get: () => {
      if (!roles.value.length) return null
      const raw = clampGnbRole(currentRoleCookie.value)
      return roles.value.includes(raw) ? raw : (roles.value[0] ?? null)
    },
    set: (r) => {
      if (!roles.value.length) return
      const next = clampGnbRole(r)
      currentRoleCookie.value = roles.value.includes(next) ? next : (roles.value[0] ?? next)
    }
  })

  if (import.meta.client) {
    watchEffect(() => {
      if (roles.value.length && !roles.value.includes(clampGnbRole(currentRoleCookie.value)) && roles.value[0]) {
        currentRoleCookie.value = roles.value[0]
      }
    })
  }

  // ==========================================
  // 3. Actions
  // ==========================================
  const fetchUser = async () => {
    // 서버에선 `credentials: 'include'`가 무의미하다 — 들어온 요청의 쿠키를 실어 보내려면 `useRequestFetch`.
    // (동기 시점에 잡아둬야 Nuxt 컨텍스트가 살아있다.)
    const request = import.meta.server ? useRequestFetch() : $fetch
    await withLoading(async () => {
      user.value = await request<Record<string, any>>('/auth/me', { method: 'GET', credentials: 'include' })
    }).catch(() => {
      user.value = null
      // 비로그인은 오류가 아니다. 그리고 `FetchError`를 state에 남기면
      // SSR payload 직렬화가 통째로 터진다("Cannot stringify arbitrary non-POJOs").
      error.value = null
    })
  }

  const logout = async () => {
    await withLoading(async () => {
      await $fetch('/auth/logout', { method: 'POST', credentials: 'include' })
    }).catch(() => {})
    user.value = null
    // repo는 탭 수명 내내 사는 싱글턴이다. 여기서 안 비우면 새로고침 전까지 앞 사람의 목록이 남는다.
    do전체repo초기화()
  }

  /**
   * 개발용 클릭로그인. 이메일만 보내고 **비밀번호는 서버가 안다**(`server/utils/auth-개발계정`).
   *
   * 서버가 `signInWithPassword`를 돌려 세션 쿠키를 심어주므로, 여기서 할 일은
   * 캐시를 비우고 `/auth/me`를 다시 읽는 것뿐이다 — 소셜 로그인 뒤에 할 일과 정확히 같다.
   */
  const login클릭 = (email: string) => withLoading(async () => {
    if (!useRuntimeConfig().public.isDev) return

    await $fetch('/auth/dev/login', { method: 'POST', body: { email }, credentials: 'include' })
    do전체repo초기화()
    await fetchUser()
  })

  /**
   * 소셜 로그인. Supabase Auth가 provider 왕복을 전부 진다 —
   * 구글·카카오는 네이티브, 네이버는 커스텀 OIDC provider로 등록해 둔 slug를 쓴다
   * (`https://nid.naver.com/.well-known/openid-configuration`).
   *
   * 예전엔 provider마다 인가 URL·콜백 라우트·토큰 교환을 직접 짰고, 그렇게 만든 토큰에
   * 역할이 안 실려서 로그인해도 guest였다. 지금은 그 자리를 Access Token Hook이 맡는다.
   */
  /**
   * **비회원으로 신원을 얻는다** — Supabase 익명 로그인. 비회원 신청의 첫걸음이다.
   *
   * `auth.users` 에 이메일 없는 행이 생기고, `on_auth_user_created` 트리거가 `members`(`isGuest`)·`users`
   * 행을 만든다(`schema.auth.sql` 4절). 이름·연락처는 메타데이터로 실어 보내 트리거가 회원 행에 옮긴다 —
   * guest 에게 `members:update` 를 안 열어도 된다.
   *
   * 비회원의 신원은 **이 브라우저의 세션**이다. 쿠키가 지워지거나 다른 기기면 새 비회원이 된다.
   * 이미 비회원 세션이면 새로 만들지 않는다(같은 사람이 두 번째 신청을 하는 경우).
   */
  const login비회원 = (입력: { 이름: string, 연락처: string }) => withLoading(async () => {
    if (!import.meta.client) return
    if (user.value?.isAnonymous) return
    const supabase = useSupabaseClient()
    const { error: 익명오류 } = await supabase.auth.signInAnonymously({
      options: { data: { name: 입력.이름.trim(), phone: 입력.연락처.replace(/\D/g, '') } }
    })
    if (익명오류) throw 익명오류
    do전체repo초기화()
    await fetchUser()
  })

  const oauthLogin = async (provider: 'google' | 'kakao' | 'naver', callbackURL?: string) => {
    if (!import.meta.client) return
    const supabase = useSupabaseClient()
    const redirectTo = `${window.location.origin}/auth/callback${callbackURL ? `?next=${encodeURIComponent(callbackURL)}` : ''}`

    /**
     * 여기는 `withLoading` 을 **안 쓴다.** `signInWithOAuth` 는 `window.location.assign` 을 부르고
     * **바로 돌아온다** — `finally` 가 스피너를 내리는 시점이 provider 화면이 뜨기 전이라, 클릭로그인처럼
     * 감싸면 한 프레임 깜빡이고 끝난다. 문서가 떠나는 길이니 올린 채 둔다(새 문서는 새 스토어다).
     *
     * 내리는 경우는 둘뿐이다. provider 로 못 떠났을 때(설정 오류 — 그때는 `error` 에 남긴다), 그리고
     * provider 화면에서 **뒤로가기**로 돌아왔을 때 — bfcache 가 이 문서를 그대로 되살리면 켜진 스피너도
     * 같이 살아나 버튼이 막힌 채 남으므로 `pageshow` 에서 내린다. 새로 그려진 문서엔 이 리스너가 없다.
     */
    isLoading.value = true
    error.value = null
    window.addEventListener('pageshow', (e) => {
      if (e.persisted) isLoading.value = false
    }, { once: true })

    /**
     * **비회원 세션이면 새로 로그인하지 않고 잇는다**(`linkIdentity`). 새로 로그인하면 세션이 갈아끼워져
     * 비회원 때 낸 신청이 옛 익명 계정에 남는다 — 잇기는 `auth.users` id 가 그대로라 회원 행도 신청도 그대로고,
     * `on_auth_user_linked` 트리거가 `isGuest` 를 끈다. 대시보드의 manual linking 이 꺼져 있으면 여기서 바로
     * 오류가 오는데, 그때는 평범한 로그인으로 물러난다(신청은 따로 남는다).
     */
    if (user.value?.isAnonymous) {
      const { error: linkError } = await supabase.auth.linkIdentity({ provider: provider as never, options: { redirectTo } })
      if (!linkError) return
      console.warn('[auth] 비회원 계정 잇기 실패 — 새로 로그인한다', linkError)
    }

    const { error: oauthError } = await supabase.auth.signInWithOAuth({ provider: provider as never, options: { redirectTo } })
    if (oauthError) {
      isLoading.value = false
      error.value = oauthError
    }
  }

  const oauthGoogle = (url?: string) => oauthLogin('google', url)
  const oauthNaver = (url?: string) => oauthLogin('naver', url)
  const oauthKakao = (url?: string) => oauthLogin('kakao', url)

  // ==========================================
  // 4. Return
  // ==========================================
  return {
    user: skipHydrate(user), isLoading, error, is수정중: skipHydrate(is수정중),
    isLoggedIn,
    isUnauthenticated, roles, currentRole,
    is관리자, is담당자, is학습자, is준회원, is비회원,
    회원Id, 표시이름,

    fetchUser, login클릭, login비회원, oauthGoogle, oauthNaver, oauthKakao, logout
  }
}, { persist: true })

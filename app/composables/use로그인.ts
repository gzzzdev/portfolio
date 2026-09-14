import { useMyAuthStore } from '~/stores/useMyAuthStore'

export type i개발계정 = {
  email: string
  이름: string
  역할codes: string[]
  역할표기: string
  is연결됨: boolean
}

export type i브랜드 = '구글' | '네이버' | '카카오' | '토스'

export type i로그인방법 = {
  label: string
  /** 소셜만 — 그림은 `m브랜드마크` 가 그린다(아이콘 폰트는 세 벌 무게가 안 맞는다) */
  마크?: i브랜드
  disabled?: boolean
  onSelect: () => void
}

/**
 * 로그인 방법 목록. 그리는 자리는 로그인 모달(`m로그인모달`) 하나다 — 머리글(`m로그인4`)도
 * 신청 상세도 그 모달을 연다. 목록을 모달 밖에 따로 두는 건 모래밭 시안이 같은 목록을 읽게 하려는 것.
 */
export async function use로그인() {
  const authStore = useMyAuthStore()
  const route = useRoute()
  const isDev = Boolean(useRuntimeConfig().public.isDev)

  /**
   * 클릭로그인 목록은 **DB가 답한다**(`/auth/dev/accounts`).
   *
   * 예전엔 이메일 다섯 줄이 `로그인4.vue` 에 박혀 있었다. 그래서 회원·역할이 바뀌어도 버튼은 그대로였고,
   * 실제로 오타 난 이메일(`leaner@local.dev`)이 화면에만 살아 있었다.
   *
   * `server: false`인 이유: 비로그인 SSR 첫 페인트가 이걸 기다릴 이유가 없다.
   * 펼치기 전엔 안 보이는 목록이고, 운영에서는 라우트가 404라 아예 안 부른다.
   * 모달이 한 화면에 둘 떠도(머리글·신청 상세) 키가 같아 요청은 하나다.
   */
  const { data: 개발계정s } = await useLazyFetch<i개발계정[]>('/auth/dev/accounts', {
    key: 'auth-dev-accounts',
    server: false,
    immediate: isDev,
    /** 한 화면에 부르는 자리가 여럿이다(머리글 모달·신청 상세 모달·여닫이). 기본 `cancel` 은 뒤에 부른 쪽이 앞 요청을 끊어 콘솔에 AbortError 가 찍힌다. */
    dedupe: 'defer',
    default: () => []
  })

  /** 소셜은 provider 를 다녀와서 **지금 주소로** 돌아온다(`/auth/callback?next=`). */
  const 소셜s = computed<i로그인방법[]>(() => [
    /**
     * 토스는 **버튼만 있다.** Supabase 에 토스 provider 가 없어 떠날 곳이 없다 — 포트폴리오(`isDev`)에선
     * 모달이 소셜 클릭을 가로채 개발 계정을 안내하므로 여기까지 오지 않고, 운영에서 누르면 준비 중이라고만 말한다.
     * 붙일 땐 토스 로그인(OAuth2) 콜백을 서버에 두고 여기 `onSelect` 만 바꾼다.
     */
    { label: '토스', 마크: '토스', onSelect: () => { useToast().add({ color: 'neutral', icon: 'i-lucide-construction', title: '토스 로그인은 준비 중이에요', description: '다른 방법으로 로그인해주세요.' }) } },
    { label: '구글', 마크: '구글', onSelect: () => { void authStore.oauthGoogle(route.fullPath) } },
    { label: '네이버', 마크: '네이버', onSelect: () => { void authStore.oauthNaver(route.fullPath) } },
    { label: '카카오', 마크: '카카오', onSelect: () => { void authStore.oauthKakao(route.fullPath) } }
  ])

  /**
   * 개발 계정은 **소셜과 같은 방식으로** 로그인한다(진짜 Supabase 이메일 계정).
   * `is연결됨`이 false면 `auth.users`에 계정이 아직 없다 — 눌러도 안 되므로 막고 이유를 말한다.
   * 운영에서는 빈 목록이다.
   */
  const 개발로그인s = computed<i로그인방법[]>(() => {
    if (!isDev) return []
    const 줄s = (개발계정s.value ?? []).map(계정 => ({
      label: [계정.역할표기, 계정.이름].filter(Boolean).join(' · ') || 계정.email,
      disabled: !계정.is연결됨,
      onSelect: () => { void authStore.login클릭(계정.email) }
    }))
    return 줄s.length ? 줄s : [{ label: '개발 계정 없음 — /admin에서 초기데이터 후 계정 만들기', disabled: true, onSelect: () => {} }]
  })

  return { isDev, 소셜s, 개발로그인s }
}

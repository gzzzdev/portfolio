import { useMyAuthStore, type AuthGnbRole } from '~/stores/useMyAuthStore'

/**
 * **이 파일의 export 이름은 ASCII 여야 한다** — `app/composables` auto-import 가 한글 export 명을 못 읽는다
 * (`useThemePane.ts` 머리말).
 */

/**
 * 포트폴리오 배포 전용. 리뷰어가 역할별 화면을 **클릭 한 번**으로 들어가게 한다.
 * 그리는 자리는 둘 — 소개 화면(`pages/portfolio.vue`)과 모든 화면 맨 위 띠(`m포트폴리오띠`).
 *
 * - 로그인은 모달의 개발 계정과 **같은 문**이다(`authStore.login클릭` → `/auth/dev/login`).
 *   비밀번호는 서버만 안다. `isDev` 가 꺼진 배포에선 그 문이 404라 부르는 쪽이 버튼을 안 그린다.
 * - 역할을 갈아탈 땐 먼저 로그아웃한다 — 앞 계정의 repo 캐시가 남지 않게(`logout` 이 비운다).
 * - 가는 곳은 역할의 첫 메뉴(`model메뉴.seed`)를 적어 둔다. `/` 로 보내 미들웨어에 맡기면
 *   쿠키에 남은 앞 역할 탭을 따라가는 경우가 있다.
 * - 볼 것 문구는 메뉴 시드의 `accessRoleCodes` 로 확인한 것만 적는다.
 * - **누른 뒤 1~2초가 빈다**(로그아웃 → 로그인 → `/auth/me` → 첫 화면 청크). 카드 구석 스피너만으론 안 보여
 *   리뷰어가 다시 누르거나 뒤로가기를 누른다 — 화면 전체를 덮는 진행 막(`m포트폴리오입장`)이 `단계` 를 읽어 말한다.
 *   막은 **첫 화면이 다 그려질 때(`page:loading:end`)** 내린다. 라우터 이동만 끝난 때 내리면 새 레이아웃이 뜨기 전 빈 틈이 보인다.
 * - 도는 중에 **브라우저 뒤로가기(popstate)** 가 오면 그 뜻을 따른다 — 로그인은 마저 끝내되 첫 화면으로 끌고 가지 않는다.
 */
export type PortfolioRole = {
  역할: string
  code: Exclude<AuthGnbRole, 'guest'>
  icon: string
  /** `server/utils/auth-개발계정` 에 비밀번호가 있는 계정만 통한다 */
  email: string
  /** 그 역할의 첫 메뉴 */
  경로: string
  볼것: string
}

export const 포트폴리오저장소 = 'https://github.com/gzzzdev/portfolio'

export const 포트폴리오역할s: PortfolioRole[] = [
  {
    역할: '운영자',
    code: 'admin',
    icon: 'i-lucide-shield-check',
    email: 'admin@local.dev',
    경로: '/admin',
    볼것: '권한 체계와 35개 메뉴의 역할별 분기, 회원·등급·신청 관리, 회원증 출력'
  },
  {
    역할: '담당자',
    code: 'manager',
    icon: 'i-lucide-user-cog',
    email: 'manager@local.dev',
    경로: '/admin/own',
    볼것: '맡은 회원·신청만 보이는 화면 — 같은 코드가 권한으로 갈리는 모습'
  },
  {
    역할: '학습자',
    code: 'learner',
    icon: 'i-lucide-graduation-cap',
    email: 'learner@local.dev',
    경로: '/official/enrolls',
    볼것: '학술대회·학회지·등급·행사 신청 흐름'
  },
  {
    역할: '준회원',
    code: 'associate',
    icon: 'i-lucide-user',
    email: 'associate@local.dev',
    경로: '/official',
    볼것: '읽기 권한만 — 공지·Q&A·자료실'
  }
]

/**
 * **누구에게 보이는 배포인가.** 코드는 한 벌이고 Netlify 사이트마다 `NUXT_PUBLIC_AUDIENCE` 만 다르게 준다.
 * 브랜치를 가르지 않는 이유 — 달라지는 건 겉옷 문구뿐인데 브랜치를 나누면 기능 수정마다 두 곳에 옮겨야 한다.
 *
 * - `toss` — 채용 지원. 띠·소개 머리말에 지원 직무를 걸고, 이력서에 지원 섹션과 스택 이야기(「웹 줄기」 줄글)를 편다.
 * - `wishket` — 외주 의뢰인. 지원 문구를 전부 걷는다(취업 준비 중으로 읽히면 손해다). 이력서의 지원 섹션도 안 그린다.
 *
 * 모르는 값은 `toss` 로 읽는다 — 설정을 빠뜨린 배포가 빈 문구로 뜨지 않게.
 */
export type PortfolioAudience = 'toss' | 'wishket'

type AudienceCopy = {
  /** 띠 앞줄, 이름 뒤 */
  띠: string
  /** 소개 화면 맨 위 작은 줄 */
  머리말: string
  /** 이력서의 지원 섹션(`applying`)과 토스를 부르는 줄글을 펴는가 */
  is지원: boolean
}

const 대상문구s: Record<PortfolioAudience, AudienceCopy> = {
  toss: {
    띠: '토스플레이스 Frontend Developer 지원',
    머리말: 'PORTFOLIO · 김건엽 · 토스플레이스 Frontend Developer 지원',
    is지원: true
  },
  wishket: {
    띠: '회원관리·결제 웹 서비스 개발',
    머리말: 'PORTFOLIO · 회원관리·결제 웹 서비스 개발',
    is지원: false
  }
}

export type PortfolioStep = '' | '로그아웃' | '로그인' | '화면'

/** 첫 화면이 끝내 신호를 안 줄 때(중간에 튕김 등) 막이 영영 안 걷히지 않게 */
const 화면대기상한ms = 8000

export function usePortfolio() {
  const { isDev: isDevValue, audience } = useRuntimeConfig().public
  const isDev = Boolean(isDevValue)
  const 대상: PortfolioAudience = audience === 'wishket' ? 'wishket' : 'toss'
  const 문구 = 대상문구s[대상]
  const authStore = useMyAuthStore()
  const toast = useToast()
  const nuxtApp = useNuxtApp()
  const router = useRouter()

  /** 누른 계정의 이메일. 버튼 하나에만 스피너를 돌리고 나머지는 막는다. 화면 어디서 눌렀든 하나다. */
  const 진행중 = useState('portfolio:진행중', () => '')
  /** 진행 막이 읽는 지금 단계 */
  const 단계 = useState<PortfolioStep>('portfolio:단계', () => '')

  /** 다음 화면이 다 그려질 때까지. 상한을 넘기면 그냥 놓는다. */
  function 화면다뜸() {
    return new Promise<void>((resolve) => {
      const 끝 = () => {
        clearTimeout(타이머)
        끊기()
        resolve()
      }
      const 끊기 = nuxtApp.hook('page:loading:end', 끝)
      const 타이머 = setTimeout(끝, 화면대기상한ms)
    })
  }

  async function 둘러보기(안내: PortfolioRole) {
    if (진행중.value) return
    진행중.value = 안내.email
    // `history.listen` 은 popstate(뒤로·앞으로)에만 불린다 — 우리 `navigateTo`(push)나 레이아웃의 replace 는 안 걸린다
    let is떠남 = false
    const 뒤로가기끊기 = router.options.history.listen(() => {
      is떠남 = true
    })
    try {
      if (authStore.user?.email !== 안내.email) {
        if (authStore.isLoggedIn) {
          단계.value = '로그아웃'
          await authStore.logout()
        }
        단계.value = '로그인'
        await authStore.login클릭(안내.email)
      }
      authStore.currentRole = 안내.code
      if (is떠남) {
        toast.add({ color: 'neutral', title: `${안내.역할} 계정으로 로그인했습니다`, description: '화면 맨 위 띠에서 언제든 들어갈 수 있습니다.' })
        return
      }
      단계.value = '화면'
      const 다뜸 = 화면다뜸()
      const 실패 = await navigateTo(안내.경로)
      // 이미 그 화면이면(같은 경로) 그릴 것이 없어 신호도 안 온다
      if (!실패) await 다뜸
    } catch (e) {
      const 오류 = e as { statusMessage?: string, message?: string }
      toast.add({
        color: 'error',
        title: `${안내.역할} 계정으로 들어가지 못했습니다`,
        description: 오류.statusMessage ?? 오류.message ?? '잠시 후 다시 시도해 주세요.'
      })
    } finally {
      뒤로가기끊기()
      진행중.value = ''
      단계.value = ''
    }
  }

  return { isDev, 대상, 문구, 역할s: 포트폴리오역할s, 저장소: 포트폴리오저장소, 진행중, 단계, 둘러보기 }
}

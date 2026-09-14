/**
 * repo **싱글턴의 수명 관리**. 클라는 탭 스코프, 서버는 요청 스코프.
 * 저장소 클래스 자신은 이걸 부르지 않는다 — 부르는 쪽은 각 모델 모듈의 `getInstance()`다.
 */
/** 클라이언트: 탭 하나 = 인스턴스 하나. 모듈 스코프면 충분하다. */
const 클라repos = new Map<string, unknown>()
/** 서버: 요청 스코프. nuxtApp이 요청마다 새 객체라 요청이 끝나면 캐시도 같이 사라진다. */
const 서버repos = new WeakMap<object, Map<string, unknown>>()

/**
 * repo 싱글턴의 유일한 출처.
 *
 * 서버에서 호출마다 `new`를 주면 같은 요청 안에서도 서로 다른 빈 목록을 보게 된다
 * (`_list`가 인스턴스별 ref라, 미들웨어가 읽은 인스턴스와 렌더가 보는 인스턴스가 달라짐).
 * 그렇다고 모듈 스코프에 두면 요청끼리 데이터가 섞이므로, 서버에서는 **요청 스코프**로 캐시한다.
 * `useNuxtApp`이 렌더 도중에도 살아있어야 하므로 `nuxt.config`의 `experimental.asyncContext`가 필요하다.
 *
 * Nuxt 컨텍스트 밖(Nitro 라우트 등)에서는 공유할 요청 스코프가 없어 1회용 인스턴스를 준다 —
 * 그런 곳에서는 `getInstance()`를 여러 번 부르지 말고 변수 하나에 받아 쓸 것.
 */
export function getRepoInstance<T>(key: string, make: () => T): T {
  const cache = ((): Map<string, unknown> | null => {
    if (!import.meta.server) return 클라repos
    // Nitro 번들에는 `tryUseNuxtApp` 자동import가 없다. 맨 식별자면 ReferenceError라 `typeof`로 막는다.
    const nuxtApp = typeof tryUseNuxtApp === 'function' ? tryUseNuxtApp() : null
    if (!nuxtApp) return null
    let store = 서버repos.get(nuxtApp)
    if (!store) 서버repos.set(nuxtApp, store = new Map())
    return store
  })()

  /** repo 식별키를 아는 곳이 여기뿐이라, 생성 직후 payload를 물려준다. */
  const 만들기 = (): T => {
    const repo = make();
    (repo as { bindPayload?: (key: string) => void })?.bindPayload?.(key)
    return repo
  }

  if (!cache) return 만들기()
  let hit = cache.get(key)
  if (!hit) cache.set(key, hit = 만들기())
  return hit as T
}

/**
 * 계정이 바뀌었을 때(로그아웃·다른 계정 로그인) 클라이언트 repo가 들고 있던 데이터를 전부 버린다.
 *
 * repo는 탭 수명 내내 사는 싱글턴이라, 인증 상태만 갈아끼우면 앞 사람의 목록·모델·더티 상태가
 * 화면에 그대로 남는다. 서버 repo는 요청 스코프라 요청이 끝나면 알아서 사라지므로 대상이 아니다.
 */
export function do전체repo초기화() {
  클라repos.forEach(repo => (repo as { reset?: () => void })?.reset?.())
}

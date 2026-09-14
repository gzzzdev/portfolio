/**
 * 목록 재조회 "시점"만 판단하는 게이트를 만든다. 데이터도 URL도 모른다.
 *
 * - TTL 내 같은 tag로 다시 부르면 fetcher를 건너뛴다 (호출부가 기존 상태를 그대로 재활용).
 * - 동시에 여러 곳에서 부르면 fetcher는 하나만 돌고 나머지는 그 결과를 기다린다.
 *
 * 여러 페이지가 같은 목록을 공유할 때(page1: api1+api2+api4, page2: api2+api3+api4)
 * 두 번째 페이지 진입에서 공통 api를 다시 받지 않게 하는 용도.
 *
 * @param ttl 재사용 유효시간(ms). 0이면 매번 fetcher 실행
 *
 * @example
 * const 읽기 = cachedRead(60_000);
 * await 읽기('full', async () => { this.list = await $fetch(url); });
 */
export const cachedRead = (ttl = 5000) => {
  let freshAt = 0
  let freshTag: string | null = null
  let inflight: Promise<boolean> | null = null

  /**
     * @param tag 요청 구분자. 달라지면 TTL이 남아있어도 다시 받는다 (예: 'brief' / 'full')
     * @param force TTL 무시하고 강제 재조회
     * @returns true = 실제로 fetcher를 돌림, false = TTL 내라 건너뜀
     */
  const gate = async (tag: string, fetcher: () => Promise<void>, force = false): Promise<boolean> => {
    if (inflight)
      return inflight

    if (!force && freshTag === tag && Date.now() - freshAt < ttl)
      return false

    inflight = (async () => {
      try {
        await fetcher()
        freshAt = Date.now()
        freshTag = tag
        return true
      } finally {
        inflight = null
      }
    })()

    return inflight
  }

  /**
     * fetcher 없이 "방금 받은 것"으로 표시한다. 이미 채워진 상태를 밖에서 받아왔을 때 쓴다.
     *
     * 용례는 SSR payload — 서버가 받아둔 목록이 그대로 넘어왔는데도 클라의 게이트는 `freshAt=0`이라,
     * 하이드레이션 직후 같은 목록을 한 번 더 받는다. TTL 안에서 그 한 번을 없애는 용도.
     */
  return Object.assign(gate, {
    prime: (tag: string) => {
      freshAt = Date.now()
      freshTag = tag
    },
    /** 들고 있던 결과를 무효로 돌린다. 다음 호출은 TTL과 무관하게 다시 받는다(계정 전환 등). */
    invalidate: () => {
      freshAt = 0
      freshTag = null
    }
  })
}

/** `cachedRead()`가 돌려주는 게이트 함수 타입 */
export type CachedRead = ReturnType<typeof cachedRead>

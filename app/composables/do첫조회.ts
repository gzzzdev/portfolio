import type { MaybeRefOrGetter } from 'vue'

/**
 * 화면의 **첫 조회**. 하는 일은 두 가지이고, 그중 새로운 쪽은 하나다 —
 * 지금까지처럼 조회를 띄우는 것, 그리고 **SSR 이 그 조회를 기다리게 만드는 것.**
 *
 * ## 왜 필요해졌나
 *
 * 목록을 클라로 실어 보내는 장치는 이미 있다(`BaseModels2.bindPayload` — 서버가 받은 목록을
 * `nuxtApp.payload` 에 넣고 클라가 집으면서 `cachedRead` 를 prime 한다). 그런데 화면들이
 * `watch(is관리자, …)` 안에서 `reads()` 를 **기다리지 않고** 던지기만 해서, 렌더와 payload
 * 직렬화가 왕복보다 먼저 끝났다 — 서버가 받아온 목록은 아무에게도 안 실리고 버려졌고,
 * SSR HTML 은 「0명 + 뼈대」로 찍혔다.
 *
 * 그 구조로도 **예전엔 목록이 찍혔다.** 전역 미들웨어가 최초 진입마다 `시스템.reads()` 로
 * 표 여덟 개(게시판·메뉴·역할·등급·등급요건·회원·계정·게시글·댓글)를 **await** 했고,
 * 화면들은 그 결과에 얹혀 있었을 뿐이다. 그 대가가 모든 진입에 붙어 있어 미들웨어를
 * `reads네비()`(역할·메뉴·게시판)로 줄였고, 그때 화면들이 자기 표를 기다릴 자리를 잃었다.
 * 여기가 그 자리다 — 대가는 자기 화면을 여는 사람만 낸다.
 *
 * ## 서버에서만 기다린다
 *
 * `await` 는 SSR 에서만 건다. 클라 이동에서까지 기다리면 왕복이 끝날 때까지 **앞 화면에
 * 머무른다**(async setup + Suspense) — 첫 렌더에 뼈대라도 내주는 지금이 낫다. 클라에서
 * 목록이 이미 payload 로 와 있으면 `cachedRead` 가 prime 되어 왕복이 안 난다.
 *
 * @param key   payload 키. 화면마다 달라야 한다 — 파일 이름을 쓴다.
 * @param 조회   기다릴 조회. 여러 표는 `Promise.all` 로 묶어 **한 왕복 시간**에 받는다.
 * @param 조건   조회 자격(`is관리자` 등). 주면 false→true 로 바뀔 때 다시 띄운다. 없으면 바로 띄운다.
 */
export async function do첫조회(
  key: string,
  조회: () => Promise<unknown>,
  조건?: MaybeRefOrGetter<boolean>
) {
  const is켜짐 = () => 조건 == null ? true : toValue(조건)

  if (import.meta.server) {
    /**
     * 반환값은 안 쓴다 — 목록을 실어 나르는 건 `bindPayload` 다. 여기서 `useAsyncData` 는
     * **기다리게 하는 장치**다.
     *
     * **오류를 삼킨다.** 안 삼키면 표 하나가 터질 때(권한 없음, supabase 에 표가 없음)
     * `useAsyncData` 가 그대로 던져 화면이 통째로 오류 페이지가 된다 — 기다리지 않던
     * 예전에는 경고 한 줄이었다. 조회 실패는 화면을 비울 이유이지 못 열 이유가 아니다.
     */
    if (is켜짐()) {
      await useAsyncData(`첫조회:${key}`, () => 조회().then(() => true).catch((error) => {
        console.error(`[첫조회] ${key}`, error)
        return false
      }))
    }
    return
  }

  if (조건 == null) {
    void 조회()
    return
  }

  /** 로그인·역할 전환으로 뒤늦게 자격이 생기는 경우까지 받는다(`once: false` 였던 이유). */
  watch(is켜짐, (v) => {
    if (v) void 조회()
  }, { immediate: true })
}

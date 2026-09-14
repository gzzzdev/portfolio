/**
 * 저장소 계층이 공유하는 **환경값과 로깅**. `BaseModel2`·`BaseModels2` 양쪽이 쓴다.
 */
import { computed } from 'vue'

export const globalConfig = {
  isDev: import.meta.env.NUXT_PUBLIC_NODE_ENV === 'DEVELOP',
  apiBaseUrl: import.meta.env.NUXT_PUBLIC_API_BASE_URL,
  apiUrl: import.meta.env.NUXT_PUBLIC_API_URL
}

/**
 * 서버에서는 `credentials: 'include'`가 아무 일도 하지 않는다 — 들어온 요청의 쿠키를 실어 보내려면
 * `useRequestFetch`가 필요하다. 이게 없으면 SSR에서 나가는 모든 API 호출이 **비로그인으로 도착**해서
 * `server/middleware/api-guard`가 guest로 판정한다.
 * Nitro(서버 라우트)에는 이 함수가 없으므로 `typeof`로 확인하고 평범한 `$fetch`로 떨어진다.
 */
export const apiFetch = () =>
  (import.meta.server && typeof useRequestFetch === 'function' ? useRequestFetch() : $fetch) as typeof $fetch

/** 개발용 버튼(로그·초기화·초안)의 노출 조건. 모델이 개발용 버튼을 더 둘 때 같은 게이팅을 쓰라고 내보낸다. */
export const is개발자 = computed(() => globalConfig.isDev)

export const doLog = (msg: string) => {
  console.log(msg)
}

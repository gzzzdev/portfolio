import { useMyAuthStore } from '~/stores/useMyAuthStore'

/**
 * 앱 세션이 끊긴 응답(401/403)을 한 곳에서 받아 로그아웃 → 홈으로 보낸다.
 *
 * **`.client` 를 떼지 말 것.** 여기서 갈아끼우는 `globalThis.$fetch` 는 서버에선 프로세스 전역이라,
 * A 요청이 심은 핸들러가 B 요청 SSR 중의 401 에서 깨어나 엉뚱한 컨텍스트로 `useMyAuthStore()`·
 * `navigateTo` 를 부른다.
 */
export default defineNuxtPlugin(() => {
  globalThis.$fetch = $fetch.create({
    onRequestError({ error }) {
      console.error('[fetch request error]', error)
    },
    async onResponseError({ request, response }) {
      const requestUrl: string = typeof request === 'string'
        ? request
        : (request instanceof Request ? request.url : String(request))
      const isMeRequest = requestUrl.indexOf('/auth/me') !== -1
      // Gemini 등 upstream 401이 세션 만료로 오인되지 않도록 제외
      const isExternalAiRequest = requestUrl.indexOf('/api-etc/ai/') !== -1

      // 401 Unauthorized 처리 (앱 세션 만료만)
      if (response.status === 401 || response.status === 403) {
        // 쿠키 기반 세션 확인용 me 호출은 미로그인일 수 있으므로 조용히 통과.
        if (isMeRequest || isExternalAiRequest) return

        const { logout } = useMyAuthStore()
        await logout()

        // 로그아웃/세션 만료 시 에러 페이지를 띄우지 않고 홈으로 보낸다.
        await navigateTo('/')
        return
      }
      if (response.status >= 500) {
        console.error(`[${response.status}] Server Error`)
      }
    }
  })
})

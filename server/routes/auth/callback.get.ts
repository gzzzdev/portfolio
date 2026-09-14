import { serverSupabaseClient } from '#supabase/server'

/**
 * 소셜 로그인이 돌아오는 자리. **provider가 몇이든 여기 하나다.**
 *
 * 예전엔 provider마다 콜백을 따로 짰다(`auth/callback/naver.get`, `/code/kakao` 페이지…).
 * 각자 토큰을 교환하고 프로필을 읽고 회원을 만들었고, 그중 카카오는 페이지 자체가 없어서
 * 돌아올 곳이 404였다. 지금은 Supabase Auth가 그 왕복을 다 지고 `code` 하나만 넘긴다.
 *
 * 교환을 클라가 아니라 서버에서 하는 이유는 로그인 라우트와 같다 —
 * `@supabase/ssr`이 세션을 **응답 쿠키**로 심어야 SSR·Nitro·브라우저가 같은 세션을 본다.
 * (`users` 행이 없는 첫 로그인은 `on_auth_user_created` 트리거가 만든다.)
 */

/** 열린 리다이렉트 방지: 우리 경로만 허용한다(`//evil.com`은 프로토콜 상대 URL이라 밖으로 나간다). */
const 안전경로 = (next: unknown) => {
  if (typeof next !== 'string' || !next.startsWith('/')) return '/'
  if (next.startsWith('//')) return '/'
  return next
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const next = 안전경로(query.next)

  /** provider가 거절했을 때(사용자가 취소 등). 메시지를 그대로 붙여 보낸다. */
  if (query.error) {
    const 사유 = String(query.error_description ?? query.error)
    return sendRedirect(event, `/?authError=${encodeURIComponent(사유)}`, 302)
  }

  const code = typeof query.code === 'string' ? query.code : ''
  if (!code) {
    return sendRedirect(event, `/?authError=${encodeURIComponent('missing_code')}`, 302)
  }

  const client = await serverSupabaseClient(event)
  const { error } = await client.auth.exchangeCodeForSession(code)
  if (error) {
    return sendRedirect(event, `/?authError=${encodeURIComponent(error.message)}`, 302)
  }

  return sendRedirect(event, next, 302)
})

import { serverSupabaseClient } from '#supabase/server'

/**
 * 로그아웃. Supabase 세션을 끝내면 `@supabase/ssr`이 세션 쿠키를 지우는 헤더까지 내려준다.
 *
 * 예전엔 `accessToken`·`refreshToken` 쿠키를 손으로 지웠다. 그 토큰은 이제 없다 —
 * 자체 JWT를 안 쓰고(`server/utils/auth-jwt` 폐기) 신원은 Supabase Auth가 소유한다.
 *
 * 실패해도 `ok`를 돌려준다. 서버 쪽 세션 폐기가 안 됐어도 클라는 로그아웃된 것으로 진행해야
 * 하고(안 그러면 "로그아웃이 안 되는" 상태에 갇힌다), 쿠키가 남았으면 만료로 자연히 끊긴다.
 */
export default defineEventHandler(async (event) => {
  try {
    const client = await serverSupabaseClient(event)
    await client.auth.signOut()
  } catch (error) {
    console.error('[auth/logout] signOut 실패', (error as Error)?.message ?? error)
  }
  return { ok: true }
})

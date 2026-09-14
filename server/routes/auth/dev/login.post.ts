import { serverSupabaseClient } from '#supabase/server'
import { do개발비밀번호 } from '../../../utils/auth-개발계정'

/**
 * 개발용 클릭로그인. `{ email }`만 받고 비밀번호는 서버가 안다.
 *
 * **평범한 Supabase 이메일 로그인이다.** 예전 `auth/login/fake`처럼 가짜 토큰을 지어내지 않는다 —
 * 진짜 `auth.users` 계정으로 로그인하므로 발급되는 토큰도, 거기 실리는 역할
 * (Custom Access Token Hook)도 소셜 로그인과 **완전히 같다.** 6단계에서 SNS를 붙일 때
 * 이 뒤의 코드가 하나도 안 바뀌는 이유가 그것이다.
 *
 * 로그인을 클라가 아니라 서버에서 하는 이유: 비밀번호가 클라 번들·네트워크로 나가면 안 된다.
 * `serverSupabaseClient`는 `@supabase/ssr`이라 세션을 **응답 쿠키로 심어준다** —
 * 이후 SSR·Nitro·브라우저가 모두 같은 세션을 본다.
 *
 * 받는 이메일은 `개발계정s`에 있는 것만 통한다. 임의 이메일을 받으면 이 라우트가
 * "비밀번호 없이 아무나 되는 문"이 된다.
 */
export default defineEventHandler(async (event) => {
  if (!useRuntimeConfig(event).public.isDev) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }

  const body = await readBody<{ email?: string }>(event).catch(() => ({ email: undefined }))
  const email = typeof body?.email === 'string' ? body.email.trim() : ''
  if (!email) {
    throw createError({ statusCode: 400, statusMessage: 'email이 필요합니다.' })
  }

  const password = do개발비밀번호(email)
  if (!password) {
    throw createError({ statusCode: 400, statusMessage: `개발 계정이 아닙니다: ${email}` })
  }

  const client = await serverSupabaseClient(event)
  const { data, error } = await client.auth.signInWithPassword({ email, password })
  if (error || !data?.user) {
    /**
     * 대개 계정이 아직 `auth.users`에 없다 — 초기데이터만 돌리고 `auth/dev/accounts`를 안 부른 상태.
     * 그 처방을 여기서 말해준다. 안 그러면 "Invalid login credentials"만 보고 비밀번호를 의심하게 된다.
     */
    throw createError({
      statusCode: 401,
      statusMessage: `${email} 로그인 실패: ${error?.message ?? '알 수 없는 오류'}`
        + ' — 계정이 아직 없으면 POST /auth/dev/accounts 를 먼저 부를 것'
    })
  }

  return { ok: true, email, authId: data.user.id }
})

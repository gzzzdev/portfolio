import { createClient } from '@supabase/supabase-js'
import { 개발계정s } from '../../../utils/auth-개발계정'

/**
 * 개발용 클릭로그인 계정을 **Supabase Auth에 실제로 만든다.**
 *
 * 초기데이터(`useSystem.do초기데이터`)는 `public.users` 행까지만 만든다 — 그건 평범한 표라
 * `/api/v1/users/bulk`를 타고, v0(lowdb)에도 똑같이 들어간다. 하지만 신원은 `auth.users`가
 * 소유하고 그건 PostgREST 밖이라, 그 한 칸만 여기서 채운다(`users.authId`).
 *
 * 그래서 순서가 있다: **초기데이터 먼저, 이 라우트 나중.** 계정 행이 없으면 이을 곳이 없다.
 *
 * 비밀번호는 요청으로 받지 않고 `server/utils/auth-개발계정`에서 읽는다 — 부르는 쪽이 아무 계정이나
 * 만들 수 있으면 이 라우트가 백도어가 되고, 개발 비밀번호가 네트워크로 오갈 이유도 없다.
 * `isDev`가 아니면 존재 자체를 숨긴다(404) — 운영에서 이 문은 없다.
 *
 * 여러 번 불러도 안전하다. 이미 이어진 계정은 건너뛴다.
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  if (!config.public.isDev) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }
  if (!config.supabaseUrl || !config.supabaseServiceRoleKey) {
    throw createError({ statusCode: 500, statusMessage: 'Supabase URL/SERVICE_ROLE_KEY is missing' })
  }

  const supabase = createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  /** `createUser`가 email_exists를 낼 때만 훑는다 — 계정 다섯 개라 한 장이면 충분하다. */
  const findAuthUserByEmail = async (email: string) => {
    const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 200 })
    if (error) throw createError({ statusCode: 500, statusMessage: error.message })
    return data.users.find(u => (u.email ?? '').toLowerCase() === email.toLowerCase()) ?? null
  }

  const 결과s: { email: string, 상태: string }[] = []

  for (const { email, password } of 개발계정s) {
    const { data: row, error: rowError } = await supabase
      .from('users')
      .select('id, email, memberId, authId')
      .ilike('email', email)
      .maybeSingle()
    if (rowError) throw createError({ statusCode: 500, statusMessage: rowError.message })

    if (!row) {
      결과s.push({ email, 상태: '계정 행 없음 — /admin에서 초기데이터를 먼저 돌릴 것' })
      continue
    }
    if (row.authId) {
      결과s.push({ email, 상태: '이미 연결됨' })
      continue
    }

    let authId: string
    const { data: created, error: createError_ } = await supabase.auth.admin.createUser({
      email,
      password,
      // 개발 계정은 받을 메일함이 없다. 확인 대기로 두면 로그인이 막힌다.
      email_confirm: true
    })

    if (created?.user?.id) {
      authId = created.user.id
    } else {
      /**
       * 이미 `auth.users`에 있는 경우(표를 다시 세웠지만 Auth는 그대로일 때가 그렇다).
       * 그 신원을 그대로 잇고, 비밀번호는 시드 값으로 맞춰 둔다 — 안 그러면
       * 클릭로그인 버튼이 "왜인지 이 계정만" 안 되는 상태로 남는다.
       */
      const 기존 = await findAuthUserByEmail(email)
      if (!기존) {
        throw createError({
          statusCode: 500,
          statusMessage: `${email} 계정 생성 실패: ${createError_?.message ?? '알 수 없는 오류'}`
        })
      }
      const { error: 갱신오류 } = await supabase.auth.admin.updateUserById(기존.id, { password })
      if (갱신오류) throw createError({ statusCode: 500, statusMessage: 갱신오류.message })
      authId = 기존.id
    }

    /**
     * `on_auth_user_created` 트리거가 이메일이 같은 행을 찾아 이미 채웠을 수 있다.
     * 그래도 한 번 더 쓴다 — 트리거가 아직 안 깔린 DB에서도 이 라우트만으로 성립해야 한다.
     */
    const { error: 연결오류 } = await supabase
      .from('users')
      .update({ authId })
      .eq('id', row.id)
    if (연결오류) throw createError({ statusCode: 500, statusMessage: 연결오류.message })

    결과s.push({ email, 상태: created?.user?.id ? '생성·연결됨' : '기존 신원에 연결됨' })
  }

  return { ok: true, 결과s }
})

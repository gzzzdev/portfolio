import { createClient } from '@supabase/supabase-js'
import { do신원, do역할s } from '../../utils/auth-인가'

/**
 * 로그인한 사람의 계정 + 도메인 회원 + 역할.
 *
 * **경로가 하나다.** 예전엔 `fake` 분기(개발용 클릭로그인)와 Supabase 분기가 갈려 있었고,
 * 앞쪽은 localDB의 users/members/member-entity-historys를 읽고 뒤쪽은 존재하지 않는 열
 * (`members.roleCodes`)을 읽었다 — 그래서 **실로그인은 언제나 역할 0개**였다.
 * 지금은 클릭로그인도 진짜 Supabase 계정이라(`auth/dev/accounts`) 나눌 이유가 없다.
 *
 * 역할은 여기서 다시 조인하지 않는다. 토큰의 `app_metadata.gnbRoles`가 이미 답이고
 * (Custom Access Token Hook이 채운다), 그게 `api-guard`가 보는 값과 **같은 출처**여야
 * 화면과 API의 판정이 안 갈린다.
 */
export default defineEventHandler(async (event) => {
  const 신원 = await do신원(event)
  if (!신원) {
    throw createError({ statusCode: 401, statusMessage: '로그인이 필요합니다.' })
  }

  const config = useRuntimeConfig(event)
  if (!config.supabaseUrl || !config.supabaseServiceRoleKey) {
    throw createError({ statusCode: 500, statusMessage: 'Supabase URL/SERVICE_ROLE_KEY is missing' })
  }
  const supabase = createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })

  const { data: 계정, error: 계정오류 } = await supabase
    .from('users')
    .select('id, email, memberId')
    .eq('authId', 신원.authId)
    .maybeSingle()
  if (계정오류) throw createError({ statusCode: 500, statusMessage: 계정오류.message })

  /**
   * 신원은 있는데 계정 행이 없다 = `auth.users`에만 있고 `public.users`에 안 이어진 상태.
   * 소셜 신규 가입은 `on_auth_user_created` 트리거가 그 자리를 메우므로, 여기 오면
   * 트리거가 안 깔렸거나 실패한 것이다. 조용히 guest로 떨어뜨리면 원인을 못 찾는다.
   */
  if (!계정) {
    throw createError({
      statusCode: 404,
      statusMessage: '계정이 회원과 연결되지 않았습니다. (users.authId 누락 — _CUSTOM/sql/schema.auth.sql의 트리거 확인)'
    })
  }

  const { data: 회원, error: 회원오류 } = 계정.memberId == null
    ? { data: null, error: null }
    : await supabase.from('members').select('*').eq('id', 계정.memberId).maybeSingle()
  if (회원오류) throw createError({ statusCode: 500, statusMessage: 회원오류.message })

  const gnb_roles = 신원.gnbRoles
  const 역할s = await do역할s(event)
  const role_names = 역할s
    .filter(row => gnb_roles.includes(row.code as typeof gnb_roles[number]))
    .map(row => row.label ?? row.code ?? '')
    .filter(Boolean)

  return {
    id: 계정.id,
    email: 계정.email,
    authId: 신원.authId,
    member: {
      ...회원,
      id: 계정.memberId,
      name: 회원?.name ?? '[이름없음]',
      roleCodes: gnb_roles
    },
    role_names,
    gnb_roles,
    roleCodes: gnb_roles,
    /** 비회원(익명 세션). 스토어가 이걸로 `isLoggedIn`(회원)과 비회원 세션을 가른다. */
    isAnonymous: 신원.isAnonymous
  }
})

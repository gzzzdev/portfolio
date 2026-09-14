import type { H3Event } from 'h3'
import { createClient } from '@supabase/supabase-js'
import { serverSupabaseClient } from '#supabase/server'
import type { i역할코드 } from '~models/test2'

/**
 * **인증/인가의 재료 두 가지.** 「누구냐」(`do신원`)와 「무슨 권한이 있냐」(`do역할s`).
 *
 * 예전엔 이 판정이 네 곳에 복붙돼 있었다(`api-guard`·`auth-session-jwt-hooks`·`me.get`·`login/fake`).
 * 각자 `gnbRoles ?? gnb_roles ?? roleCodes ?? devGnbRole` 순으로 더듬었고, 그중 하나(`me.get`)는
 * 존재하지 않는 열(`members.roleCodes`)을 읽어서 **실로그인이 늘 guest**였다. 한 자리로 모은다.
 */

/**
 * **`export type`을 안 쓴다.** `server/utils`는 `nitro.imports.dirs`라 이 파일의 export가 전부
 * 자동 import 후보가 되는데, 스캐너가 `i신원` 같은 이름을 ASCII까지만 읽어 `i`로 잡는다
 * (`easys.ts`의 진짜 `i`와 충돌해 prepare가 경고를 뱉었다). 쓰는 쪽은 전부 명시 import라 필요도 없다.
 */
type i신원 = {
  /** `auth.users.id`. `public.users.authId`가 이 값을 가리킨다. */
  authId: string
  gnbRoles: i역할코드[]
  /** 익명 로그인(비회원) 세션인가. 토큰의 `is_anonymous` — Supabase 가 채우고 사용자가 못 고친다. */
  isAnonymous: boolean
}

/**
 * 요청에 실린 Supabase 세션에서 신원을 꺼낸다. 비로그인이면 `null`.
 *
 * `getClaims()`는 프로젝트가 **비대칭 서명(ES256)**을 쓰므로 JWKS로 **로컬 검증**한다 —
 * 요청마다 Auth 서버로 왕복하지 않는다. JWKS 캐시는 auth-js의 모듈 전역(`GLOBAL_JWKS`)이라
 * `serverSupabaseClient`가 요청마다 새 클라이언트를 만들어도 다시 받지 않는다.
 *
 * `getUser()`가 아니라 이걸 쓰는 이유가 그것이다. `getUser()`는 매 호출이 네트워크 왕복이고,
 * 이 함수는 `/api/*` **모든 요청**의 미들웨어에서 돈다.
 *
 * 역할은 `app_metadata.gnbRoles`에서 온다. 그 칸은 Custom Access Token Hook이 채우고
 * (`_CUSTOM/sql/schema.auth.sql`), `user_metadata`와 달리 **사용자가 못 고치는 자리**다.
 */
export const do신원 = async (event: H3Event): Promise<i신원 | null> => {
  const client = await serverSupabaseClient(event)
  const { data, error } = await client.auth.getClaims()
  const claims = data?.claims
  if (error || !claims?.sub) return null

  const raw = (claims.app_metadata as Record<string, unknown> | undefined)?.gnbRoles
  return {
    authId: String(claims.sub),
    gnbRoles: Array.isArray(raw) ? (raw as i역할코드[]) : [],
    isAnonymous: claims.is_anonymous === true
  }
}

/** 비로그인도 역할이 하나 있는 것으로 다룬다 — 메뉴·게시판 읽기가 `guest` 권한에 걸려 있다. */
export const do역할codes = async (event: H3Event): Promise<i역할코드[]> => {
  const 신원 = await do신원(event)
  if (!신원 || 신원.gnbRoles.length === 0) return ['guest' as i역할코드]
  return 신원.gnbRoles
}

/** 로그인한 사람의 계정 행 + 역할. 비로그인이면 `null`. */
type i로그인회원 = i신원 & {
  /** `public.users.id` */
  userId: number | string
  email: string | null
  /** `members.id`. 계정이 회원과 안 이어져 있으면 `null`. */
  memberId: number | string | null
}

/**
 * 신원(`auth.users`)에서 도메인 회원까지 한 번에 내려간다 — `users.authId` → `users.memberId`.
 *
 * **요청당 한 번만 조회한다.** 한 요청에서 여러 라우트·유틸이 "내 회원id"를 물을 수 있고
 * (`grade`·`me`·소유자 확인), 그때마다 DB를 때리면 같은 답을 위해 왕복이 늘어난다.
 */
export const do로그인회원 = async (event: H3Event): Promise<i로그인회원 | null> => {
  const 캐시 = (event.context as Record<string, unknown>)._로그인회원
  if (캐시 !== undefined) return 캐시 as i로그인회원 | null

  const 답 = await (async (): Promise<i로그인회원 | null> => {
    const 신원 = await do신원(event)
    if (!신원) return null

    const { supabaseUrl, supabaseServiceRoleKey } = useRuntimeConfig(event)
    if (!supabaseUrl || !supabaseServiceRoleKey) return null

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
    const { data, error } = await supabase
      .from('users')
      .select('id, email, memberId')
      .eq('authId', 신원.authId)
      .maybeSingle()
    if (error || !data) return null

    return { ...신원, userId: data.id, email: data.email ?? null, memberId: data.memberId ?? null }
  })()

  ;(event.context as Record<string, unknown>)._로그인회원 = 답
  return 답
}

type i역할행 = { code?: string, label?: string, permissions?: string[] }

/**
 * 권한 어휘(`역할.권한s`). **요청마다 읽지 않는다.**
 *
 * 예전엔 `_CUSTOM/localDB/roles.json`을 파일로 읽었다 — 도메인 표는 이미 Supabase였는데
 * 인가만 파일을 보고 있어서, `/admin/roles` 화면에서 권한을 고쳐도 가드는 영영 못 봤다.
 */
const ROLES_TTL = 3000
let rolesCache: { at: number, rows: i역할행[] } | null = null

export const do역할s = async (event: H3Event): Promise<i역할행[]> => {
  const now = Date.now()
  if (rolesCache && now - rolesCache.at < ROLES_TTL) return rolesCache.rows

  const { supabaseUrl, supabaseServiceRoleKey } = useRuntimeConfig(event)
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    rolesCache = { at: now, rows: [] }
    return rolesCache.rows
  }

  /**
   * service role로 읽는다. 권한 표 자체를 읽는 데 권한이 필요하면 닭이 먼저냐가 된다 —
   * 비로그인 요청도 `guest` 권한을 확인하려면 이 표를 봐야 한다.
   */
  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
  const { data, error } = await supabase.from('roles').select('code, label, permissions')

  /**
   * 실패는 **빈 목록**으로 떨어진다(캐시도 남긴다 — 매 요청 재시도로 DB를 때리지 않게).
   * `warn`에선 로그만 늘고, `enforce`에선 전부 403이다. 조용히 다 통과시키는 것보단 낫다.
   */
  if (error) {
    console.error('[auth-인가] roles 조회 실패', error.message)
    rolesCache = { at: now, rows: [] }
    return rolesCache.rows
  }

  rolesCache = { at: now, rows: (data ?? []) as i역할행[] }
  return rolesCache.rows
}

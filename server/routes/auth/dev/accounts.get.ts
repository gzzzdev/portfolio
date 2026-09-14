import { createClient } from '@supabase/supabase-js'
import { is개발계정 } from '../../../utils/auth-개발계정'

/**
 * 클릭로그인 드롭다운이 그릴 목록. **dev 전용.**
 *
 * 예전엔 이 목록이 `로그인4.vue`에 이메일 다섯 줄로 박혀 있었다. 그래서 회원이나 역할이 바뀌어도
 * 버튼은 그대로였고, 실제로 `leaner@local.dev`처럼 오타가 난 이메일이 화면에만 살아 있었다.
 * 지금은 DB가 답한다 — 계정이 실제로 로그인 가능한지(`authId`)까지 여기서 보인다.
 *
 * 역할은 회원 표에 없으므로 `member-entity-historys`의 **끝나지 않은 이력**으로 조인한다.
 * (`api-guard`·토큰이 보는 것과 같은 정의다.)
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

  const [계정결과, 이력결과, 역할결과] = await Promise.all([
    supabase.from('users').select('id, email, memberId, authId').order('id'),
    supabase.from('member-entity-historys').select('memberId, roleId').is('endDate', null).not('roleId', 'is', null),
    supabase.from('roles').select('id, code, label')
  ])
  for (const r of [계정결과, 이력결과, 역할결과]) {
    if (r.error) throw createError({ statusCode: 500, statusMessage: r.error.message })
  }

  const 계정s = (계정결과.data ?? []).filter(row => row.email && is개발계정(String(row.email)))
  const 회원ids = [...new Set(계정s.map(row => row.memberId).filter(id => id != null))]
  const { data: 회원s, error: 회원오류 } = 회원ids.length
    ? await supabase.from('members').select('id, name').in('id', 회원ids)
    : { data: [], error: null }
  if (회원오류) throw createError({ statusCode: 500, statusMessage: 회원오류.message })

  const 이름by회원id = new Map((회원s ?? []).map(m => [String(m.id), String(m.name ?? '')]))
  const 역할byId = new Map((역할결과.data ?? []).map(r => [String(r.id), r]))
  const 역할sby회원id = new Map<string, { code: string, label: string }[]>()
  for (const h of 이력결과.data ?? []) {
    const 역할 = 역할byId.get(String(h.roleId))
    if (!역할) continue
    const key = String(h.memberId)
    const list = 역할sby회원id.get(key) ?? []
    if (!list.some(x => x.code === 역할.code)) list.push({ code: String(역할.code), label: String(역할.label ?? 역할.code) })
    역할sby회원id.set(key, list)
  }

  return 계정s.map((row) => {
    const 역할s = 역할sby회원id.get(String(row.memberId)) ?? []
    return {
      email: String(row.email),
      이름: 이름by회원id.get(String(row.memberId)) ?? '',
      역할codes: 역할s.map(x => x.code),
      /** 드롭다운에 그대로 쓰는 문구. 복수 역할은 `·`로 잇는다(`model회원.역할표기`와 같은 꼴). */
      역할표기: 역할s.map(x => x.label).join(' · '),
      /** `auth.users`에 실제 계정이 있는가. 없으면 눌러도 로그인이 안 된다. */
      is연결됨: row.authId != null
    }
  })
})

#!/usr/bin/env node
/**
 * **lowDB(`_CUSTOM/localDB/*.json`) → supabase 이관기.** v0 → v1 스위치를 넘기기 전에 데이터를 옮긴다.
 *
 *   node _CUSTOM/sql/_생성기/lowdb-to-supabase.mjs            # 드라이런 — 무엇을 할지만 찍는다
 *   node _CUSTOM/sql/_생성기/lowdb-to-supabase.mjs --apply    # 백업 → 지움 → 넣음 → 재배선 → 검증
 *   node _CUSTOM/sql/_생성기/lowdb-to-supabase.mjs --apply members boards   # 표를 골라서
 *
 * **교체다, 병합이 아니다.** 대상 표의 supabase 행을 전부 지우고 localDB 행으로 채운다.
 * 지우기 전에 `_아카이브/supabase-backup-{시각}/{표}.json` 으로 떠 둔다(되돌릴 곳은 거기뿐이다).
 *
 * PK 를 그대로 못 옮긴다 — supabase 는 `generated always as identity` 라 id 를 새로 매긴다.
 * 그래서 옛 id → 새 id 표를 들고 **참조를 전부 다시 잇는다.** 참조는 세 종류다:
 *  1. **FK 제약** — PostgREST OpenAPI 의 `<fk table=…>` 에서 읽는다(손목록 `fk.mjs` 가 아니라 살아 있는 DB 가 근거).
 *  2. **폴리모픽** — 제약이 없어 스키마가 모른다. `폴리모픽s` 에 손으로 적는다.
 *  3. **jsonb 안의 id** — 메뉴 폴더 순서·역할의 메뉴 디렉터리·상태이력 스냅숏. `jsonb재배선s` 에 적는다.
 * 2·3 은 제약이 없어서 틀려도 에러가 안 난다 — 화면이 조용히 비거나 엉뚱한 행을 가리킨다.
 * 새 jsonb 참조를 만들면 여기도 같이 적을 것.
 *
 * `users.authId` 는 localDB 에 없다(신원은 `auth.users` 소유). 백업의 같은 email 행에서 가져와 잇는다.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { createClient } from '@supabase/supabase-js'

const SRC = '_CUSTOM/localDB'

/**
 * 이번에 옮기는 표 — 등록부(`model테이블`) 시드에서 `store: '스위치'` 이면서 localDB 에 행이 있는 것.
 * 뺀 것과 이유:
 *  - `tables` — 등록부는 bump 트리거가 스스로 채운다. 옮기면 번호가 뒤엉킨다.
 *  - `tags`·`memos`·`tag-links`·`tag-memos` — 시험 축이고 localDB 안에서 이미 참조가 끊겨 있다.
 *  - `store: 'v0'` 표(`models/v2`·`models/persona`·`theme`) — 모델이 `/api/v0` 에 못박혀 있어 스위치와 무관하다.
 */
const 기본표s = [
  'roles', 'grades', 'grade-conditions', 'boards', 'members', 'users',
  'member-entity-historys', 'member-status-historys', 'member-posts', 'member-comments',
  'surveys', 'quizzes', 'polls', 'classes', 'occasions', 'enrollables', 'enrolls',
  'resources', 'assets', 'design-templates', 'events', 'menus',
]

/** 값이 남의 PK 인데 제약이 없는 열. `타입열` 값 → 표 이름. */
const 폴리모픽s = {
  'member-comments': { 열: 'commentableId', 타입열: 'commentableType', 표: { member_posts: 'member-posts' } },
}

/**
 * 폴더 레이아웃(`model메뉴.i폴더레이아웃아이템dto`) — 문자열이면 행 id, `{ id: 문자열 }` 이면 숨김 등 옵션이 붙은 행,
 * `{ id: 숫자, children }` 이면 **폴더**(행이 아니다), `sep-*` 는 구분선. 행 id 만 바꾸고, 못 찾은 행은 뺀다.
 */
const 폴더재배선 = (items, 표, 맵) => (Array.isArray(items) ? items : []).flatMap((item) => {
  if (typeof item === 'string') return 맵(표, item) != null ? [맵(표, item)] : []
  if (!item || typeof item !== 'object') return [item]
  const out = { ...item }
  if (Array.isArray(item.children)) out.children = 폴더재배선(item.children, 표, 맵)
  if (typeof item.id === 'string' && !item.id.startsWith('sep-') && !item.is구분선) {
    const 새 = 맵(표, item.id)
    if (새 == null) return []
    out.id = 새
  }
  return [out]
})

/**
 * jsonb 안의 id. 새 id 는 **문자열**로 넣는다 — 앱이 행 id 를 `String(id)` 로 비교하고, localDB 도 문자열이었다.
 */
const jsonb재배선s = {
  menus: (row, 맵) => {
    const t = row.target
    if (!t || typeof t !== 'object') return row
    const target = { ...t }
    if (target.kind === 'BOARD' && target.boardId != null) target.boardId = 맵('boards', target.boardId)
    if (target.dbTable?.folders) target.dbTable = { ...target.dbTable, folders: 폴더재배선(target.dbTable.folders, target.dbTable.name, 맵) }
    return { ...row, target }
  },
  roles: (row, 맵) => ({ ...row, menuDirectory: 폴더재배선(row.menuDirectory, 'menus', 맵) }),
  'member-status-historys': (row, 맵) => row.snapshot?.id == null ? row
    : { ...row, snapshot: { ...row.snapshot, id: 맵('members', row.snapshot.id) } },
}

/**
 * **트리거가 먼저 만들어 두는 행.** 콘텐츠 표 다섯에 행이 들어가면 `enrollable_round1` 이 1회차를 세운다
 * (`enrolls.sql`). 그대로 insert 하면 `enrollables_owner_round` 에 부딪히므로, 같은 자리의 행이
 * 있으면 **UPDATE 로 채우고 그 id 를 쓴다** — 시드가 하는 방식과 같다.
 * 값은 새 id 로 바꾼 뒤의 payload 를 받아 PostgREST 필터(열 → 값)를 돌려준다.
 */
const 트리거행s = {
  enrollables: (payload) => {
    const 열 = ['surveyId', 'quizId', 'pollId', 'classId', 'occasionId'].find((c) => payload[c] != null)
    return 열 ? { [열]: payload[열], round: payload.round ?? 1 } : null
  },
}

// ───────────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2)
const isApply = args.includes('--apply')
const 고른표s = args.filter((a) => !a.startsWith('--'))
const 표s = 고른표s.length ? 고른표s : 기본표s

const env = Object.fromEntries(readFileSync('.env', 'utf8').split('\n')
  .filter((l) => /^[A-Z_]+=/.test(l))
  .map((l) => { const i = l.indexOf('='); return [l.slice(0, i), l.slice(i + 1).replace(/\s+#.*$/, '').trim()] }))
const URL_ = env.NUXT_SUPABASE_URL
const KEY = env.NUXT_SUPABASE_SERVICE_ROLE_KEY
if (!URL_ || !KEY) throw new Error('.env 에 NUXT_SUPABASE_URL / NUXT_SUPABASE_SERVICE_ROLE_KEY 가 없다')
const sb = createClient(URL_, KEY, { auth: { persistSession: false } })

const spec = await (await fetch(`${URL_}/rest/v1/`, {
  headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, Accept: 'application/openapi+json' },
})).json()
const defs = spec.definitions

/** 살아 있는 DB 의 열·FK·필수열 */
const 스키마 = (표) => {
  const d = defs[표]
  if (!d) throw new Error(`supabase 에 "${표}" 표가 없다`)
  const fk = {}
  for (const [열, p] of Object.entries(d.properties)) {
    const m = (p.description ?? '').match(/<fk table='([^']+)' column='id'/)
    if (m) fk[열] = m[1]
  }
  const 필수 = (d.required ?? []).filter((열) => 열 !== 'id' && d.properties[열]?.default == null)
  return { 열s: new Set(Object.keys(d.properties)), fk, 필수 }
}

const 로컬 = Object.fromEntries(표s.map((표) => [표, JSON.parse(readFileSync(join(SRC, `${표}.json`), 'utf8'))]))
const 스키마s = Object.fromEntries(표s.map((표) => [표, 스키마(표)]))

/** FK 의존 순서(자기참조 제외). 폴리모픽 대상도 앞에 둔다. */
const 순서 = (() => {
  const deps = Object.fromEntries(표s.map((표) => {
    const d = new Set(Object.values(스키마s[표].fk).filter((x) => x !== 표 && 표s.includes(x)))
    for (const 대상 of Object.values(폴리모픽s[표]?.표 ?? {})) if (표s.includes(대상)) d.add(대상)
    return [표, d]
  }))
  const out = []
  const 방문 = new Set()
  const visit = (표, 경로 = []) => {
    if (방문.has(표)) return
    if (경로.includes(표)) throw new Error(`FK 순환: ${[...경로, 표].join(' → ')}`)
    for (const d of deps[표]) visit(d, [...경로, 표])
    방문.add(표); out.push(표)
  }
  표s.forEach((표) => visit(표))
  return out
})()

/** 옛 id(문자열) → 새 id(숫자) */
const id맵 = Object.fromEntries(표s.map((표) => [표, new Map()]))
const 경고s = []
/** 대상 표가 이관 범위 밖이면 `undefined`(= 모름), 범위 안인데 못 찾으면 `null`(= 끊김). */
const 새id = (표, 옛) => {
  if (옛 == null || 옛 === '') return null
  if (!id맵[표]) return undefined
  return id맵[표].get(String(옛)) ?? null
}
const 새id문자 = (표, 옛) => { const v = 새id(표, 옛); return v == null ? v : String(v) }

// ── 드라이런: 막힐 자리를 먼저 찍는다 ──────────────────────────────────────
console.log(`\n대상 ${표s.length}개 (순서): ${순서.join(' → ')}\n`)
let 막힘 = 0
for (const 표 of 순서) {
  const { 열s, fk, 필수 } = 스키마s[표]
  const rows = 로컬[표]
  const 로컬열s = new Set(rows.flatMap((r) => Object.keys(r)))
  const 버릴열s = [...로컬열s].filter((열) => !열s.has(열))
  const 빈필수 = 필수.filter((열) => rows.some((r) => r[열] == null) && !(표 === 'users' && 열 === 'authId'))
  const 참조 = Object.entries(fk).map(([열, 대상]) => `${열}→${대상}${표s.includes(대상) ? '' : '(범위밖!)'}`)
  console.log(`  ${표.padEnd(24)} ${String(rows.length).padStart(4)}행  FK[${참조.join(' ')}]`
    + (폴리모픽s[표] ? `  폴리모픽[${폴리모픽s[표].열}]` : '')
    + (jsonb재배선s[표] ? '  jsonb재배선' : '')
    + (버릴열s.length ? `  ⚠ supabase에 없는 열: ${버릴열s.join(',')}` : '')
    + (빈필수.length ? `  ✖ 필수열이 비어 있음: ${빈필수.join(',')}` : ''))
  if (버릴열s.length || 빈필수.length) 막힘++
  for (const [열, 대상] of Object.entries(fk)) if (!표s.includes(대상) && rows.some((r) => r[열] != null)) {
    console.log(`      ✖ ${열} 이 범위 밖 표 ${대상} 를 가리킨다 — 같이 옮겨야 한다`); 막힘++
  }
}

/** 범위 밖 표가 대상 표를 FK 로 가리키면, 지우는 순간 cascade/restrict 에 걸린다. */
for (const [표, d] of Object.entries(defs)) {
  if (표s.includes(표) || !d.properties) continue
  const 가리킴 = Object.entries(스키마(표).fk).filter(([, 대상]) => 표s.includes(대상))
  if (!가리킴.length) continue
  const { count } = await sb.from(표).select('*', { count: 'exact', head: true })
  if (count) { console.log(`  ✖ 범위 밖 ${표}(${count}행)이 ${가리킴.map(([열, 대상]) => `${열}→${대상}`).join(',')} 를 가리킨다`); 막힘++ }
}

if (!isApply) {
  console.log(`\n드라이런 끝. 막힘 ${막힘}건.${막힘 ? '' : ' `--apply` 로 실행한다.'}\n`)
  process.exit(막힘 ? 1 : 0)
}
if (막힘) { console.error(`\n막힘 ${막힘}건 — 실행하지 않는다.\n`); process.exit(1) }

// ── 1. 백업 ────────────────────────────────────────────────────────────────
const 모두읽기 = async (표) => {
  const out = []
  for (let from = 0; ; from += 1000) {
    const { data, error } = await sb.from(표).select('*').order('id').range(from, from + 999)
    if (error) throw error
    out.push(...data)
    if (data.length < 1000) return out
  }
}
const 백업dir = join('_아카이브', `supabase-backup-${new Date().toISOString().replace(/[:.]/g, '-')}`)
mkdirSync(백업dir, { recursive: true })
const 백업 = {}
for (const 표 of [...순서, 'tables']) {
  백업[표] = await 모두읽기(표)
  writeFileSync(join(백업dir, `${표}.json`), JSON.stringify(백업[표], null, 2))
}
console.log(`\n1) 백업 → ${백업dir}`)

// ── 2. 지움 (의존 역순) ─────────────────────────────────────────────────────
for (const 표 of [...순서].reverse()) {
  const { error } = await sb.from(표).delete().gte('id', 0)
  if (error) throw new Error(`${표} 지우기 실패: ${error.message}`)
}
console.log('2) 지움')

// ── 3. 넣음 (의존 순) — 자기참조·jsonb 는 4 에서 ─────────────────────────────
const authId들 = new Map((백업.users ?? []).filter((u) => u.email && u.authId).map((u) => [u.email, u.authId]))
for (const 표 of 순서) {
  const { 열s, fk } = 스키마s[표]
  const poly = 폴리모픽s[표]
  for (const row of 로컬[표]) {
    const payload = {}
    for (const [열, 값] of Object.entries(row)) if (열 !== 'id' && 열s.has(열)) payload[열] = 값
    for (const [열, 대상] of Object.entries(fk)) {
      if (!(열 in payload)) continue
      if (대상 === 표) { payload[열] = null; continue } // 4 에서 잇는다
      const v = 새id(대상, payload[열])
      if (payload[열] != null && v == null) 경고s.push(`${표}#${row.id}.${열}=${payload[열]} → ${대상} 에 없음, null`)
      payload[열] = v ?? null
    }
    if (poly && payload[poly.열] != null) {
      const 대상 = poly.표[payload[poly.타입열]]
      const v = 대상 ? 새id(대상, payload[poly.열]) : null
      if (v == null) 경고s.push(`${표}#${row.id}.${poly.열}=${payload[poly.열]} (${payload[poly.타입열]}) 못 찾음, null`)
      payload[poly.열] = v ?? null
    }
    if (표 === 'users') payload.authId = authId들.get(payload.email) ?? null

    const 자리 = 트리거행s[표]?.(payload)
    const 있는 = 자리 ? (await sb.from(표).select('id').match(자리).maybeSingle()).data : null
    const { data, error } = 있는
      ? await sb.from(표).update(payload).eq('id', 있는.id).select('id').single()
      : await sb.from(표).insert(payload).select('id').single()
    if (error) throw new Error(`${표}#${row.id} 넣기 실패: ${error.message}`)
    id맵[표].set(String(row.id), data.id)
  }
  process.stdout.write(`   ${표} ${로컬[표].length} `)
}
console.log('\n3) 넣음')

// ── 4. 재배선 — 자기참조 FK 와 jsonb ────────────────────────────────────────
for (const 표 of 순서) {
  const self열s = Object.entries(스키마s[표].fk).filter(([, 대상]) => 대상 === 표).map(([열]) => 열)
  const jsonb = jsonb재배선s[표]
  if (!self열s.length && !jsonb) continue
  for (const row of 로컬[표]) {
    let patch = {}
    for (const 열 of self열s) if (row[열] != null) {
      const v = 새id(표, row[열])
      if (v == null) 경고s.push(`${표}#${row.id}.${열}=${row[열]} 못 찾음`)
      patch[열] = v
    }
    if (jsonb) {
      const 바뀐 = jsonb(row, 새id문자)
      for (const 열 of Object.keys(바뀐)) if (바뀐[열] !== row[열]) patch[열] = 바뀐[열]
    }
    if (!Object.keys(patch).length) continue
    const { error } = await sb.from(표).update(patch).eq('id', id맵[표].get(String(row.id)))
    if (error) throw new Error(`${표}#${row.id} 재배선 실패: ${error.message}`)
  }
}
console.log('4) 재배선')

// ── 5. 검증 ────────────────────────────────────────────────────────────────
let 틀림 = 0
for (const 표 of 순서) {
  const { count } = await sb.from(표).select('*', { count: 'exact', head: true })
  if (count !== 로컬[표].length) { 틀림++; console.log(`   ✖ ${표}: local ${로컬[표].length} ≠ supabase ${count}`) }
}
const 연결안된계정 = 로컬.users ? 로컬.users.filter((u) => !authId들.get(u.email)).map((u) => u.email) : []
writeFileSync(join(백업dir, '_id맵.json'), JSON.stringify(Object.fromEntries(Object.entries(id맵).map(([t, m]) => [t, Object.fromEntries(m)])), null, 2))
console.log(`5) 검증 — 행 수 ${틀림 ? `${틀림}표 틀림` : '전부 일치'}`)
if (연결안된계정.length) console.log(`   ⚠ authId 를 못 이은 계정(백업에 같은 email 없음): ${연결안된계정.join(', ')}`)
if (경고s.length) console.log(`   ⚠ 끊긴 참조 ${경고s.length}건:\n     ${경고s.join('\n     ')}`)
console.log(`   id 맵 → ${join(백업dir, '_id맵.json')}\n`)

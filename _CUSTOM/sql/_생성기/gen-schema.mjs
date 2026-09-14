#!/usr/bin/env node
/**
 * `_CUSTOM/localDB/*.json`(+ 모델 dto로 메운 구멍)에서 Postgres DDL을 뽑는다.
 *
 * 설계 규칙은 이관 논의에서 정한 그대로다:
 *  - `id`는 **bigint identity**. 클라 ORM이 `compareTo`에서 `Number(stateId)`로 정렬하고
 *    「PK 큰 순 = 최신순」이 문서화된 불변식이라, 정렬이 숫자를 요구한다.
 *  - `code` 열은 `roles`·`grades`뿐이다 — **앱이 읽는 값**이라 남긴다.
 *    시드가 FK를 엮을 때 쓰는 code는 DB에 안 들어간다(`CODE열` 주석 참고).
 *  - `createdAt`은 `default now()`. `db_supabase.Create`는 이 열을 안 채운다.
 *  - FK는 이름으로 못 정한다(`tag-links.memoId`는 `memos`가 아니라 `tag-memos`다).
 *    그래서 `FK` 표를 손으로 들고 있고, 이게 곧 제약 목록이다.
 *
 * 열 타입은 실제 값에서 추론하고, 전부 null이라 추론이 안 되는 열만 `열재정의`가 메운다.
 *
 *   node _CUSTOM/sql/_생성기/gen-schema.mjs [srcDir] > schema.sql
 *   node _CUSTOM/sql/_생성기/gen-schema.mjs --drop   # 다시 만들 표를 먼저 지우는 블록을 앞에 붙인다
 */
import { readFileSync, readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { FK, 폴리모픽s } from './fk.mjs'

const DEFAULT_SRC = '_CUSTOM/localDB'

/**
 * 값이 전부 null이라 추론이 안 되는 열 + 데이터가 거짓말하는 열. 근거를 옆에 적는다.
 * 여기 없는 열은 전부 실제 값에서 뽑는다.
 */
const 열재정의 = {
  // dto가 `string | null` (model캐릭터.ts)
  'characters.roleImage': 'text',
  // dto에 없는 유령 열. 5행에 null로만 있다 — 지우기 아까우면 두되, 쓰는 코드는 없다.
  'characters.billing': 'text',
  // dto가 `string | null` (model회원게시글.ts). 비회원 글에만 값이 있다.
  'member-posts.guestName': 'text',
  'member-posts.guestPassword': 'text',
  // 회원 썸네일. 지금 데이터엔 전부 null이지만 URL 문자열이다.
  'members.thumbnail': 'text',
  // FK 자리인데 값이 전부 null이라 추론이 안 된다. `FK` 표가 bigint로 만들지만 명시해 둔다.
  'members.currentMemberFeeId': 'bigint',
  /**
   * 폴리모픽이라 FK는 못 걸지만 **값은 남의 PK**다(전부 숫자, 지금은 `member_posts`만 가리킨다).
   * 모든 PK가 bigint이므로 여기도 bigint로 맞춘다 — text로 두면 비교마다 형변환이 붙는다.
   * (`records.targetId`는 `"vegetables:1002"` 꼴이라 이쪽과 달리 text가 맞다.)
   */
  'member-comments.commentableId': 'bigint',
  /**
   * `ownerTable` 과 짝인 폴리모픽 열 — 값은 surveys·quizzes·polls·classes·occasions 중
   * **`ownerTable` 이 가리키는 표**의 PK다. 그래서 FK를 못 건다.
   *
   * 한때 `FK` 표에 `ownerId: 'members'` 로 들어가 있었다. 표마다 id가 1부터 매겨져서
   * 모집의 `ownerId` 가 우연히 실재하는 회원 id와 겹치고, `rowkey-check fk` 도 그래서
   * 「무결성 통과」를 냈다 — 끊긴 데가 없어서가 아니라 **엉뚱한 표에서 찾아 맞았기 때문**이다.
   * 그대로 Postgres에 올렸으면 회원을 지울 때 `on delete set null` 이 남의 모집에서
   * 대상을 지웠을 것이다.
   */
  'recruits.ownerId': 'bigint',
  /**
   * 폼 위젯 데모용 표. 날짜인데 **빈 문자열(`''`)이 섞여 있다** — `date`/`timestamptz`로 두면
   * `''` 저장이 실패한다. 지금 앱이 쓰는 값에 맞춰 `text`로 둔다.
   * 모델이 `'' → null`을 정리하면 그때 날짜형으로 좁힐 것.
   */
  'samples.day': 'text',
  'samples.dayTime': 'text'
}

/**
 * `code` **열**을 두는 표. 여기 없는 표에도 시드는 code를 쓰지만, 그건 DB로 안 나간다.
 *
 * 구분이 요점이다:
 *  - **앱이 읽는 code** — `roles`·`grades`. `api-guard`가 `역할.권한s`를 code로 찾고 JWT가
 *    code를 싣고 `menus.accessRoleCodes`가 code를 저장한다. 그러니 열로 남아야 한다.
 *  - **시드가 짝을 맞출 때만 쓰는 code** — `boards`·`members`·`member-posts` 등.
 *    `useSystem.do초기데이터`가 의존 순서대로 훑는 **그 한 번의 실행 동안만** 필요하다.
 *    앞 표를 만들며 `시드PK` 등록부에 code→PK를 남기면 뒤 표가 꺼내 쓴다. 열로 만들 이유가 없고,
 *    만들면 시딩 부산물이 운영 스키마에 남는다(`etcFields`가 서버 페이로드에서 걷어낸다).
 */
const CODE열 = {
  roles: 'text not null unique',
  grades: 'text not null unique'
}

/**
 * supabase에 남아 있지만 **이 스키마에 없는** 옛 세대 표. 2026-09-08에 `/api/v1/{표}`로 전수 조사한 결과다.
 * (`db_supabase.ReadByRelation`이 참조하는 `courses`·`member-courses`는 거기에도 없었다 — 그 코드는 죽어 있다.)
 *
 * 새 스키마의 일부가 아니므로 **지우지 않는다.** 지울지는 데이터를 아는 사람이 정할 일이라
 * 주석으로만 내보낸다.
 */
const 옛표s = {
  'enrollables': 38,
  'enrolls': 3,
  'fees': 0,
  'lectures': 10,
  'm-c-lectures': 6,
  'member-fees': 0,
  'payments': 0
}

const DATE = /^\d{4}-\d{2}-\d{2}$/
const TS = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/

function 추론(값s) {
  const 값 = 값s.filter(v => v !== null && v !== undefined)
  if (값.length === 0) return null // 재정의가 메워야 한다

  if (값.every(v => typeof v === 'boolean')) return 'boolean'
  if (값.every(v => typeof v === 'number')) {
    return 값.every(v => Number.isInteger(v)) ? 'integer' : 'double precision'
  }
  if (값.some(v => Array.isArray(v) || (typeof v === 'object' && v !== null))) return 'jsonb'

  if (값.every(v => typeof v === 'string')) {
    const 빈칸 = 값.filter(v => v === '')
    const 나머지 = 값.filter(v => v !== '')
    if (나머지.length && 빈칸.length === 0) {
      if (나머지.every(v => TS.test(v))) return 'timestamptz'
      if (나머지.every(v => DATE.test(v) || TS.test(v))) return 'date'
    }
    return 'text'
  }
  return 'text' // 타입 혼재
}

function load(srcDir) {
  const dir = resolve(srcDir)
  const out = {}
  for (const f of readdirSync(dir).filter(x => x.endsWith('.json')).sort()) {
    const table = f.slice(0, -5)
    let rows
    try {
      rows = JSON.parse(readFileSync(join(dir, f), 'utf8'))
    } catch {
      continue
    }
    if (Array.isArray(rows)) out[table] = rows
  }
  return out
}

function 열s(table, rows) {
  const 모음 = new Map()
  for (const r of rows) {
    if (!r || typeof r !== 'object') continue
    for (const [k, v] of Object.entries(r)) {
      if (!모음.has(k)) 모음.set(k, [])
      모음.get(k).push(v)
    }
  }
  const fk = FK[table] ?? {}
  const out = []
  for (const [이름, 값s] of 모음) {
    if (이름 === 'id' || 이름 === 'createdAt') continue // 아래에서 고정 형태로 낸다
    const 재정의 = 열재정의[`${table}.${이름}`]
    const 타입 = 재정의 ?? (fk[이름] ? 'bigint' : 추론(값s)) ?? 'text'
    out.push({ 이름, 타입, 미추론: !재정의 && !fk[이름] && 추론(값s) === null })
  }
  // id·createdAt 다음에 code, 그 뒤는 선언 순서
  out.sort((a, b) => (a.이름 === 'code' ? -1 : b.이름 === 'code' ? 1 : 0))
  return out
}

const args = process.argv.slice(2)
const is드롭 = args.includes('--drop')
const src = args.find(a => !a.startsWith('--')) || DEFAULT_SRC
const tables = load(src)

const L = []
L.push(`-- ${'='.repeat(74)}`)
L.push(`-- localDB ${Object.keys(tables).length}개 표에서 뽑은 스키마.`)
L.push(`-- 생성: node _CUSTOM/sql/_생성기/gen-schema.mjs   (손으로 고치지 말고 생성기를 고칠 것)`)
L.push(`--`)
L.push(`-- id는 bigint identity — 클라 ORM의 compareTo가 Number(stateId)로 정렬하고`)
L.push(`-- 「PK 큰 순 = 최신순」이 불변식이라 정렬이 숫자를 요구한다.`)
L.push(`-- code 열은 roles·grades뿐 — 앱(api-guard·JWT)이 읽는 값이라 남긴다.`)
L.push(`-- 열은 id·createdAt 말고 전부 nullable — 필수 여부는 모델이 판정한다.`)
L.push(`-- FK는 on delete set null — localDB엔 제약이 아예 없었으므로 cascade로 올리면`)
L.push(`-- 지금까지 없던 연쇄 삭제가 생긴다. 지우는 쪽을 좁히는 건 나중에.`)
L.push(`-- ${'='.repeat(74)}`)
L.push('')

if (is드롭) {
  L.push(`-- ${'!'.repeat(74)}`)
  L.push(`-- 이 블록은 아래에서 다시 만드는 ${Object.keys(tables).length}개 표를 **통째로 지운다.**`)
  L.push(`-- supabase에 남은 옛 세대 데이터를 버리고 새 스키마로 다시 세우려는 것이다.`)
  L.push(`-- 지우면 안 되는 게 있으면 여기서 멈출 것.`)
  L.push(`-- ${'!'.repeat(74)}`)
  for (const table of Object.keys(tables)) L.push(`drop table if exists "${table}" cascade;`)
  L.push('')
  L.push(`-- 아래는 supabase에 있지만 이 스키마에 **없는** 옛 표다. 새 스키마의 일부가 아니라서`)
  L.push(`-- 손대지 않는다 — 지우려면 주석을 직접 풀 것. 괄호 안은 조사 시점 행수.`)
  for (const [table, n] of Object.entries(옛표s)) {
    L.push(`-- drop table if exists "${table}" cascade;   -- ${n}행`)
  }
  L.push('')
}

const 미추론s = []
for (const [table, rows] of Object.entries(tables)) {
  const cols = 열s(table, rows)
  L.push(`-- ${'─'.repeat(70)}`)
  L.push(`-- ${table}  (localDB ${rows.length}행)`)
  L.push(`create table if not exists "${table}" (`)
  const 줄s = []
  줄s.push(`  "id"          bigint generated always as identity primary key`)
  줄s.push(`  "createdAt"   timestamptz not null default now()`)
  // 데이터에 아직 없어도 code를 두는 표가 있다(`members`는 시드가 붙이므로 localDB엔 없다).
  if (CODE열[table] && !cols.some(c => c.이름 === 'code')) cols.unshift({ 이름: 'code', 타입: null })
  for (const c of cols) {
    const 폭 = Math.max(1, 26 - c.이름.length)
    const 정의 = c.이름 === 'code' && CODE열[table] ? CODE열[table] : c.타입
    줄s.push(`  "${c.이름}"${' '.repeat(폭)}${정의}`)
    if (c.미추론) 미추론s.push(`${table}.${c.이름}`)
  }
  L.push(줄s.join(',\n'))
  L.push(`);`)
  L.push('')
}

L.push(`-- ${'='.repeat(74)}`)
L.push(`-- 외래키. 이름만으로는 대상을 못 정한다 —`)
L.push(`-- tag-links.memoId 는 memos(4행)가 아니라 tag-memos(28행)를 가리킨다.`)
L.push(`-- ${'='.repeat(74)}`)
for (const [table, cols] of Object.entries(FK)) {
  if (!tables[table]) continue
  for (const [col, target] of Object.entries(cols)) {
    if (!tables[target]) continue
    L.push(
      `alter table "${table}" add constraint "${table}_${col}_fkey" `
      + `foreign key ("${col}") references "${target}"("id") on delete set null;`
    )
  }
}
L.push('')
L.push(`-- 폴리모픽 참조라 FK를 못 건다:`)
for (const { 열, 사유 } of 폴리모픽s) L.push(`--   ${열.padEnd(30)} ${사유}`)

console.log(L.join('\n'))
if (미추론s.length) console.error(`\n! 타입 못 정한 열 (text로 떨어짐): ${미추론s.join(', ')}`)

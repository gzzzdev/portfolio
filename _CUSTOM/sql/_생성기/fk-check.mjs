#!/usr/bin/env node
/**
 * FK 무결성 검사기 — `fk.mjs`의 표를 데이터에 대고 맞춰본다.
 *
 * localDB(JSON)엔 제약이 아예 없어서 끊긴 참조가 조용히 쌓인다. Postgres로 올리면
 * 같은 행을 제약이 거부하므로, **올리기 전에** 기계로 걸러내려는 것이다.
 * 판정 기준은 `fk.mjs`의 `FK` 하나뿐이다 — 스키마를 뽑는 `gen-schema.mjs`와
 * 같은 표를 읽으므로, 제약과 검사가 갈라지지 않는다.
 *
 * 표에 없는 열은 검사하지 않는다. 특히 `폴리모픽s`의 셋은 값이 남의 PK인데도
 * 가리키는 표가 값 하나로 안 정해져서 일부러 빠져 있다 — 넣으면 엉뚱한 표에서
 * 찾아 맞고 「통과」가 나온다(그 사고 기록은 `fk.mjs`에 있다).
 *
 *   node _CUSTOM/sql/_생성기/fk-check.mjs [srcDir]
 *
 * srcDir 기본값은 `_CUSTOM/localDB`. supabase 쪽은 테이블별로 `{table}.json` 배열을
 * 덤프한 디렉터리를 같은 모양으로 넘기면 된다.
 */
import { readFileSync, readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { FK } from './fk.mjs'

const DEFAULT_SRC = '_CUSTOM/localDB'

function load(srcDir) {
  const dir = resolve(srcDir)
  const out = {}
  for (const f of readdirSync(dir).filter(f => f.endsWith('.json'))) {
    const table = f.slice(0, -5)
    let rows
    try {
      rows = JSON.parse(readFileSync(join(dir, f), 'utf8'))
    } catch (e) {
      console.error(`  ! ${table}: 파싱 실패 — ${e.message}`)
      continue
    }
    if (!Array.isArray(rows)) continue
    out[table] = rows
  }
  return out
}

function fk(srcDir = DEFAULT_SRC) {
  const tables = load(srcDir)
  const ids = Object.fromEntries(
    Object.entries(tables).map(([t, rows]) => [t, new Set(rows.map(r => String(r?.id)))])
  )
  let 끊김 = 0

  for (const [table, cols] of Object.entries(FK)) {
    const rows = tables[table]
    if (!rows) {
      console.log(`  ?   ${table}: 테이블 없음`)
      continue
    }
    for (const [col, target] of Object.entries(cols)) {
      const 대상 = ids[target]
      if (!대상) {
        console.log(`  ?   ${table}.${col} → ${target}: 대상 테이블 없음`)
        continue
      }
      const bad = rows
        .map(r => r?.[col])
        .filter(v => v != null && v !== '')
        .filter(v => !대상.has(String(v)))
      if (bad.length === 0) continue
      끊김 += 1
      const vals = [...new Set(bad.map(String))]
      console.log(`  X   ${table}.${col} → ${target}: 끊긴 참조 ${bad.length}행 / 값 ${vals.length}종`)
      console.log(`        ${vals.slice(0, 8).join(', ')}${vals.length > 8 ? ' …' : ''}`)
    }
  }

  console.log()
  if (끊김) {
    console.log(`끊긴 FK ${끊김}건. Postgres로 옮기면 제약이 거부한다 — 옮기기 전에 고칠 것.`)
    process.exitCode = 1
  } else {
    console.log(`FK 무결성 통과.`)
  }
}

const [src] = process.argv.slice(2)
fk(src || DEFAULT_SRC)

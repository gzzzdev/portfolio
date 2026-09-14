
import { H3Event, EventHandlerRequest } from 'h3'
export type iDB = any
type Event = H3Event<EventHandlerRequest>;

import { do공개투영 } from '~models/test2/_basics/공개필드s'
import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import { join, dirname } from 'path'
import { mkdirSync } from 'fs'

// 동시성 제어를 위한 간단한 Mutex 구현
class Mutex {
  private _locking = Promise.resolve();
  async run<T>(action: () => Promise<T>): Promise<T> {
    const previous = this._locking;
    let release: () => void;
    const current = new Promise<void>(resolve => release = resolve);
    this._locking = this._locking.then(() => current);
    await previous;
    try { return await action(); }
    finally { release!(); }
  }
}
const locks = new Map<string, Mutex>();
const getLock = (table: string) => {
  if (!locks.has(table)) locks.set(table, new Mutex());
  return locks.get(table)!;
}

const withLock = (handler: (event: Event) => Promise<any>) => (event: Event) => {
  const table = event.context.params?.table as string;
  return getLock(table).run(() => handler(event));
};

const tableOf = (event: any): string => String(event.context.params?.table ?? '')

const getDB = <T = any>(event: any) => {
  const table = event.context.params?.table

  const dbFile = join(process.cwd(), '_CUSTOM/localDB', `${table}.json`)
  /**
   * 폴더는 **쓸 때를 위해** 만든다. 서버리스 배포(Netlify)는 함수 폴더가 읽기 전용이고 `localDB` 가
   * 번들에 없어서, 여기서 던지면(EROFS) 읽기까지 전부 500 이었다 — 테마 패널이 여는 `GET /api/v0/theme`
   * 가 콘솔에 빨간 줄을 쌓던 원인. 읽기는 파일이 없으면 lowdb 가 기본값(`[]`)으로 돌려주므로 여기서 삼킨다.
   * 쓰기는 그대로 `db.write()` 에서 실패한다(그 배포에선 쓸 수 없는 게 맞다).
   */
  try {
    mkdirSync(dirname(dbFile), { recursive: true })
  } catch { /* 읽기 전용 파일시스템 */ }
  const db = new Low<iDB[]>(new JSONFile(dbFile), [])
  return db;
}

const do임의딜레이 = () => delay(200);




/** 1001부터 사용 중이지 않은 id를 count개 할당 */
const allocateIds = (existing: iDB[], count: number): string[] => {
  const usedIds = new Set((existing ?? []).map((item: any) => String(item?.id)))
  let nextId = 1001
  const out: string[] = []
  for (let i = 0; i < count; i++) {
    while (usedIds.has(String(nextId))) nextId += 1
    const id = String(nextId)
    out.push(id)
    usedIds.add(id)
    nextId += 1
  }
  return out
}

/** Create 시 id·createdAt을 서버에서 부여 (클라이언트 body 값은 무시) */
const withCreateMeta = (body: Record<string, unknown>, id: string) => ({
  ...body,
  id,
  createdAt: new Date().toISOString(),
})

/**
 * 표별 **변경 번호**를 담는 표. 행 하나가 표 하나다 — `{ name, version }`.
 *
 * 이 표 자신은 버전을 안 단다(`do버전올림`이 자기를 건너뛴다). 캐시 판정의 뿌리라
 * 늘 새로 읽어야 하고, 자기 버전을 자기가 들고 있으면 물어볼 방법이 없기 때문이다.
 * (`menus` 에 버전을 두면 안 됐던 것과 같은 이유 — 거긴 자기 자신을 매번 무효화한다.)
 */
const 버전표 = 'tables'

/**
 * 쓰기 한 번에 그 표의 번호를 1 올린다. **행 수가 아니라 번호**라, 추가·삭제로 원래 수로
 * 돌아와도 값이 다르다 — "1개 남은 상태"와 "추가·삭제·추가로 1개 남은 상태"가 갈린다.
 *
 * 읽기 경로에서는 아무것도 안 만든다. 행 목록의 정본은 `model테이블s.seed` 하나다 —
 * 조회가 행을 만들어 두면 그 시드가 "목록이 비어있을 때만"에 막힌다.
 *
 * `버전표`의 잠금을 따로 잡는다. 쓰기 잠금은 대상 표 것이라 여러 표가 동시에 들어오면
 * `tables.json` 에서 서로를 덮는다. 잠금 순서는 언제나 *대상표 → 버전표* 한 방향이고
 * 버전표 자신은 건너뛰므로, 자기 잠금을 두 번 잡는 교착이 없다.
 */
const do버전올림 = async (table: string) => {
  if (!table || table === 버전표) return

  await getLock(버전표).run(async () => {
    const file = join(process.cwd(), '_CUSTOM/localDB', `${버전표}.json`)
    mkdirSync(dirname(file), { recursive: true })
    const db = new Low<iDB[]>(new JSONFile(file), [])
    await db.read()
    if (!Array.isArray(db.data)) db.data = []

    const row = db.data.find((x: iDB) => x?.name === table)
    // 시드에 없는 표에 쓰기가 들어와도 번호는 세야 한다. 그때는 `세는단위` 없이 이름·번호만 있는
    // 행이 생긴다 — `_CUSTOM/sql/tables.sql` 의 `on conflict ... insert` 와 같은 취급이다.
    if (row) row.version = Number(row.version ?? 0) + 1
    else db.data.push(withCreateMeta({ name: table, version: 1 }, allocateIds(db.data, 1)[0]!))

    await db.write()
  })
}


/** 잠금 안에서 쓰기를 돌리고, 성공했을 때만 번호를 올린다. 실패한 쓰기는 변경이 아니다. */
const 쓰기 = (handler: (event: Event) => Promise<iDB>) => withLock(async (event: Event) => {
  const result = await handler(event)
  await do버전올림(tableOf(event))
  return result
})

const Create = async (event: Event) => {

  const db = getDB<iDB>(event)
  const body = await readBody(event)
  await db.read()

  const newId = allocateIds(db.data, 1)[0]!
  const newOne = withCreateMeta(body ?? {}, newId)
  db.data.push(newOne)
  await db.write();
  await do임의딜레이();
  return newOne as iDB
}

const BulkCreate = async (event: Event) => {
  const db = getDB<iDB>(event)
  const body = await readBody(event)
  if (!Array.isArray(body)) {
    throw createError({ statusCode: 400, message: 'Body must be a JSON array' })
  }
  if (body.length === 0) {
    return [] as iDB[]
  }
  await db.read()
  const ids = allocateIds(db.data, body.length)
  const rows = body.map((item: iDB, i: number) => withCreateMeta(item ?? {}, ids[i]!))
  db.data.push(...rows)
  await db.write()
  await do임의딜레이()
  return rows as iDB[]
}

const BulkUpdate = async (event: Event) => {
  const db = getDB<iDB>(event)
  const body = await readBody(event)
  if (!Array.isArray(body)) {
    throw createError({ statusCode: 400, message: 'Body must be a JSON array' })
  }
  if (body.length === 0) {
    return [] as iDB[]
  }
  await db.read()
  const results: iDB[] = []
  for (const item of body) {
    const { id, ...fields } = item ?? {}
    if (!id) throw createError({ statusCode: 400, message: 'Each row must have id' })
    const idx = db.data.findIndex((p: iDB) => p.id === id)
    if (idx === -1) throw createError({ statusCode: 404, message: `Not found: ${id}` })
    Object.assign(db.data[idx], fields)
    results.push(db.data[idx] as iDB)
  }
  await db.write()
  await do임의딜레이()
  return results
}
const Read = async (event: Event) => {

  const { id } = event.context.params || {}
  if (!id) throw createError({ statusCode: 400, message: 'ID required' })

  const db = getDB<iDB>(event)
  {
    await db.read()
    const item = db.data.find((p: iDB) => p.id === id)
    if (!item) throw createError({ statusCode: 404, message: 'Not found' })
    await do임의딜레이();
    if (event.context.투영 === '공개') return do공개투영(item, tableOf(event), event.context.투영본인)
    return item
  }
}

/**
 * `"table-counts"` — supabase 쪽 **뷰와 같은 모양**을 lowDB 에서 만든다.
 * 등록부(`tables.json`) 행 + 그 표 파일의 행 수. 어댑터 계약을 갈라 놓지 않으려고 여기 둔다
 * (`brief=true` 가 `db_low` 에만 생겨 조용히 갈라져 있던 전례가 이 파일에 있었다).
 *
 * **파일이 없으면 `0` 이다, `null` 이 아니다.** lowDB 엔 스키마가 없어서 "표가 없다"와
 * "한 번도 안 썼다"가 같은 상태다 — 첫 쓰기에 파일이 생긴다. supabase 는 스키마가 있어
 * 그 둘이 갈리고, 그래서 그쪽 뷰만 `left join` 으로 `null` 을 낸다.
 */
const 표개수판 = async (): Promise<iDB[]> => {
  const 등록부 = new Low<iDB[]>(new JSONFile(join(process.cwd(), '_CUSTOM/localDB', 'tables.json')), [])
  await 등록부.read()
  if (!Array.isArray(등록부.data)) return []

  return Promise.all(등록부.data.map(async (행: any) => {
    const db = new Low<iDB[]>(new JSONFile(join(process.cwd(), '_CUSTOM/localDB', `${행.name}.json`)), [])
    await db.read()
    return { ...행, count: Array.isArray(db.data) ? db.data.length : 0 }
  }))
}

const Reads = async (event: Event) => {

  if (tableOf(event) === 'table-counts') return 표개수판()

  const db = getDB<iDB>(event)
  await db.read()
  await do임의딜레이();

  const query = getQuery(event)


  // `api-guard`가 `readPublic`만 있는 역할에 세워둔 플래그. 거부 대신 필드를 깎는다.
  if (event.context.투영 === '공개') {
    return db.data.map((item: any) => do공개투영(item, tableOf(event), event.context.투영본인))
  }

  if (query.brief === 'true') //
  {

    return db.data.map((item: any) => ({
      id: item.id,
      title: item.title ?? '',
      name: item.name ?? '',
      label: item.label ?? '',
    }));
  }
  return db.data as iDB[];
}

const Update = async (event: Event) => {
  const { id } = event.context.params || {}
  if (!id) throw createError({ statusCode: 400, message: 'ID required' })

  const db = getDB<iDB>(event)
  const body = await readBody(event);
  console.log(body);
  const { id: _id,  ...fields } = body;

  await db.read()
  const idx = db.data.findIndex((p: iDB) => p.id === id)
  if (idx === -1) throw createError({ statusCode: 404, message: 'Not found' })

  Object.assign(db.data[idx], fields)
  await db.write()
  await do임의딜레이();
  return db.data[idx] as iDB

}

const Delete = async (event: Event) => {
  const id = event.context.params?.id
  if (!id) throw createError({ statusCode: 400, message: 'ID required' })

  const db = getDB(event)
  {
    await db.read()
    db.data = db.data.filter(p => p.id !== id)
    await db.write()
    await do임의딜레이();
    return { success: true }
  }

}

export default {
  Create: 쓰기(Create),
  BulkCreate: 쓰기(BulkCreate),
  BulkUpdate: 쓰기(BulkUpdate),
  Read,
  Reads,
  Update: 쓰기(Update),
  Delete: 쓰기(Delete),
}

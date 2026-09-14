

import { createClient } from '@supabase/supabase-js'
import { 공개필드s, 공개필드sByTable, 본인열ByTable, do공개투영 } from '~models/test2/_basics/공개필드s'

type iDB = any

const getTableName = (event: any) => event.context.params?.table;

/**
 * `api-guard`가 `readPublic`만 있는 역할에 세워둔 플래그. `db_low`와 **같은 판정**을 써야 한다 —
 * 한쪽만 지키면 `.env` 한 줄로 어댑터를 바꿨을 때 공개 범위가 조용히 달라진다.
 * (실제로 그랬다: v1에서 비로그인 `GET /members`가 생년월일·이메일·전화번호까지 내주고 있었다.)
 */
const is공개투영 = (event: any) => event.context.투영 === '공개'

/**
 * 투영이 걸렸으면 **select 인자 자체를 좁힌다.** 받아서 깎는 `db_low`와 달리, 여기서는
 * 감출 열을 애초에 Postgres 밖으로 안 내보낼 수 있다.
 *
 * 단, **선언이 있는 표만** 좁힌다. `공개필드sByTable`에 적힌 열 이름은 사람이 그 표를 보고 적은
 * 것이라 존재를 믿을 수 있지만, 선언이 없으면 `기본공개필드s`(`id,title,name,label`)로 떨어지는데
 * 그건 아무 표에나 맞는 이름이 아니다 — 없는 열을 select에 적으면 PostgREST가 400을 낸다.
 * 그 경우엔 `'*'`로 받아 `do공개투영`이 있는 키만 남기게 둔다(= `db_low`와 같은 관대함).
 */
const select절 = (event: any) => {
    if (!is공개투영(event)) return '*'
    const table = String(getTableName(event) ?? '')
    // 본인 행은 통째로 줘야 하므로 다 받아서 `do공개투영`이 남의 행만 깎게 둔다(`본인열ByTable`).
    if (event.context.투영본인 != null && 본인열ByTable[table]) return '*'
    return 공개필드sByTable[table] ? 공개필드s(table).join(',') : '*'
}

/** 좁힌 select를 통과한 뒤에도 `db_low`와 같은 모양이 되도록 한 번 더 깎는다(이중 방어). */
const 투영1 = <T extends Record<string, unknown>>(row: T | null, event: any) =>
    row && is공개투영(event) ? do공개투영(row, String(getTableName(event) ?? ''), event.context.투영본인) : row

const 투영 = <T extends Record<string, unknown>>(rows: T[] | null, event: any) =>
    rows && is공개투영(event) ? rows.map((row) => 투영1(row, event)) : rows
const handleSupabaseError = (error: any, event: any) => {
    if (error) {
        if (error.code == 'PGRST205') {
            throw createError({ statusCode: 444, message: `supabase에 ${getTableName(event)} 테이블을 먼저 만드세요` });
        }
        else {
            console.error(error);
            throw createError({ statusCode: 500, message: error.message ?? 'Unknown error' })
        }
    }
}

/**
 * **service role**을 쓴다. anon 키가 아니다.
 *
 * 이 어댑터는 서버 라우트(`/api/v1/*`) 뒤에서만 돌고, "누가 무엇을 읽고 쓸 수 있나"는
 * `server/middleware/api-guard`가 `역할.권한s`로 판정한다. 즉 인가는 이미 앱 층에 있고,
 * RLS는 같은 판정을 DB에 한 벌 더 두는 셈이라 둘이 어긋나면 화면이 조용히 빈다.
 *
 * 실제로 그랬다 — 새 표는 RLS가 켜진 채 정책이 없어서 anon 키로는 읽으면 **빈 배열**(에러도
 * 없이), 쓰면 `violates row-level security policy`였다. 빈 표와 막힌 표가 구분되지 않는다.
 *
 * 이 리포의 다른 supabase 라우트(`server/utils/storage`, `api/v1/files/*`, `auth/me.get`)도
 * 전부 service role을 쓴다. 어댑터만 anon이라 혼자 달랐다.
 *
 * ⚠️ service role은 RLS를 통째로 우회한다. 그러니 **공개 범위를 좁히는 책임은 전부 이 위층에**
 * 있다 — `api-guard`의 인가와, `readPublic`일 때 열을 깎는 `select절`/`투영`이 그것이다.
 */
const getClient = (event: any) => {
    const { supabaseUrl, supabaseServiceRoleKey } = useRuntimeConfig(event);

    if (!supabaseUrl || !supabaseServiceRoleKey) {
        throw createError({ statusCode: 500, message: 'Supabase URL/SERVICE_ROLE_KEY is missing' })
    }

    return createClient(supabaseUrl, supabaseServiceRoleKey);
}

const getTable = async (event: any, tableName = event.context.params?.table) => {
    const client = getClient(event);
    const table = client.from(tableName);
    return table;
}


const Create = async (event: any) => {

    const body = await readBody(event)

    // id는 떼고 보낸다 — PK는 서버(DB)가 매긴다. 클라도 `createDraft`에서 이미 지우고 보내지만,
    // 다른 경로로 들어온 body가 PK를 실어 보내면 identity 컬럼이 거부하므로 여기서 한 번 더 막는다.
    const { id: _id, ...bodyWithoutId } = body;

    // `select('*')`인 이유: 부르는 쪽(`BaseModel2`)이 응답을 `Object.assign(this.state, a)`로
    // 상태에 덮는다. id만 돌려주면 서버가 채운 열(`createdAt` 등)이 화면에 안 들어와,
    // 추가 직후엔 빈칸이다가 새로고침해야 뜬다. `db_low`는 새 행을 통째로 돌려준다.
    const { data, error } = await (await getTable(event)).insert(bodyWithoutId).select('*').single();

    handleSupabaseError(error, event);

    return data as unknown as iDB

}

const BulkCreate = async (event: any) => {
    const body = await readBody(event)
    if (!Array.isArray(body)) {
        throw createError({ statusCode: 400, message: 'Body must be a JSON array' })
    }
    if (body.length === 0) {
        return [] as iDB[]
    }
    const rows = body.map((row: any) => {
        const { id: _id, ...rest } = row ?? {}
        return rest
    })
    const { data, error } = await (await getTable(event))
        .insert(rows, { defaultToNull: false })
        .select('*')
    handleSupabaseError(error, event)
    return (data ?? []) as iDB[]
}

const BulkUpdate = async (event: any) => {
    const body = await readBody(event)
    if (!Array.isArray(body)) {
        throw createError({ statusCode: 400, message: 'Body must be a JSON array' })
    }
    if (body.length === 0) {
        return [] as iDB[]
    }
    const table = await getTable(event)
    const results: iDB[] = []
    for (const row of body) {
        const { id, ...fields } = row ?? {}
        if (!id) throw createError({ statusCode: 400, message: 'Each row must have id' })
        const { data, error } = await table.update(fields).eq('id', id).select('*').single()
        handleSupabaseError(error, event)
        results.push(data)
    }
    return results
}
const Read = async (event: any) => {

    const { id } = event.context.params || {}
    if (!id) throw createError({ statusCode: 400, message: 'ID required' })


    const { data, error } = await (await getTable(event)).select(select절(event)).eq('id', id).maybeSingle();

    handleSupabaseError(error, event);

    return 투영1(data as Record<string, unknown> | null, event) as unknown as iDB
}

const Reads = async (event: any) => {
    const { data, error } = await (await getTable(event)).select(select절(event)).order('id').limit(1000);
    handleSupabaseError(error, event);

    return 투영(data as Record<string, unknown>[] | null, event) as iDB[]

}



const Update = async (event: any) => {

    const body = await readBody(event)
    const { id } = event.context.params || {}
    if (!id) throw createError({ statusCode: 400, message: 'ID required' })

    // 갱신할 열에서 PK를 뺀다. `fields`를 뽑아두고 `body`를 보내고 있었는데, 그러면 PK가 같이
    // 실려 나간다 — `generated always as identity` 컬럼은 그걸 거부한다(같은 값이어도).
    const { id: _id, ...fields } = body

    // `select('*')`가 없으면 반환이 null이라 `Object.assign`이 덮을 게 없다. 행이 없을 때
    // `db_low`는 404를 던지므로 여기서도 맞춘다 — `single()`은 500으로 새서 판정이 갈린다.
    const { data, error } = await (await getTable(event))
        .update(fields).eq('id', id).select('*').maybeSingle();

    handleSupabaseError(error, event);
    if (!data) throw createError({ statusCode: 404, message: 'Not found' })

    return data as unknown as iDB

}
const Delete = async (event: any) => {

    const id = event.context.params?.id
    const table = event.context.params?.table
    if (!id) throw createError({ statusCode: 400, message: 'ID required' })

    const { error } = await (await getTable(event)).delete().eq('id', id);

    handleSupabaseError(error, event);

    return { success: true }
}


export default { Create, BulkCreate, BulkUpdate, Read, Reads, Update, Delete, }
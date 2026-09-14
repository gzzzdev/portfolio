/**
 * LMS 흔적 — `server/api/_/db_adapter/db_supabase.ts`에서 2026-09-13에 떼어 옮겼다.
 *
 * `lectures` · `courses` · `member-courses` · `m-c-lectures` 네 표를 전제로 한 코드다.
 * 이 리포에는 그 표가 없다 — `_CUSTOM/models`에도, 시드에도, localDB에도. 커밋 2ebb592로
 * 들어왔고, 클라이언트 어디에도 `/api/v1/{table}/{relation}/{id}` 호출이 없어 한 번도 불린 적이 없다.
 *
 * 옮긴 것 셋:
 *   1. `RELATION_COLUMN_MAP` + `ReadByRelation` — relation 라우트의 구현. `m-c-lectures`를 member로
 *      조회할 때 누락된 lecture 행을 **읽는 도중에 INSERT**하던 자리다.
 *   2. `Delete` 안의 FK 보호 — `member-courses`를 지우기 전에 `m-c-lectures`를 먼저 지우던 8줄.
 *   3. 라우트 파일 `[relation]/[id].get.ts` — 이 폴더에 그대로 옮겼다.
 *
 * 설계 메모: 여기서는 콘텐츠(`courses`)가 `enrollableId`를 들고 모집을 가리킨다. 지금 모델은 반대
 * 방향(모집이 대상을 가리킨다)이고, 새 설계도 그 방향이다.
 *
 * 되살릴 일이 있으면 표 넷을 먼저 만들고, 1을 어댑터에, 3을 `server/api/v1/[table]/` 아래로 돌려놓는다.
 * 이 파일은 컴파일되지 않는다 — `_ARCHIEVE/`는 nuxt tsconfig의 include 밖이다.
 */

const RELATION_COLUMN_MAP: Record<string, Record<string, string>> = {
    lectures: {
        course: 'courseId',
        courses: 'courseId',
    },
    'member-courses': {
        member: 'memberId',
        members: 'memberId',
        user: 'memberId',
        users: 'memberId',
        'n-user': 'memberId',
        'n-users': 'memberId',
        course: 'enrollableId',
        courses: 'enrollableId',
    },
    'm-c-lectures': {
        enroll: 'enrollId',
        enrolls: 'enrollId',
        'member-course': 'enrollId',
        'member-courses': 'enrollId',
        lecture: 'lectureId',
        lectures: 'lectureId',
    },
}

const ReadByRelation = async (event: any) => {
    const { table, relation, id } = event.context.params || {}
    if (!table || !relation || !id)
        throw createError({ statusCode: 400, message: 'table/relation/id required' })

    const relationKey = String(relation)
    const idValue = String(id)

    // m-c-lectures의 member 조회는 member-courses를 한번 거쳐야 함.
    if (table === 'm-c-lectures' && (relationKey === 'member' || relationKey === 'members' || relationKey === 'user' || relationKey === 'users' || relationKey === 'n-user' || relationKey === 'n-users')) {
        const client = getClient(event)
        const enrollRows = await client
            .from('member-courses')
            .select('id, enrollableId')
            .eq('memberId', idValue)

        handleSupabaseError(enrollRows.error, event)
        const enrollList = (enrollRows.data ?? []) as Array<{ id: string | number, enrollableId: string | number | null }>
        const enrollIds = enrollList.map((row) => String(row.id))
        if (enrollIds.length === 0) return []

        const { data, error } = await (await getTable(event, table))
            .select('*')
            .in('enrollId', enrollIds)
            .order('id')
            .limit(1000)
        handleSupabaseError(error, event)

        // 생성 전 단계: course의 lectureId 대비 m-c-lectures 누락 lectureId 목록만 산출
        const enrollableIds = Array.from(
            new Set(
                enrollList
                    .map((row) => row.enrollableId)
                    .filter((value) => value !== null && value !== undefined)
                    .map((value) => String(value)),
            ),
        )

        const missingLectureIdsByEnroll: Record<string, string[]> = {}
        if (enrollableIds.length > 0) {
            const courseRows = await client
                .from('courses')
                .select('id, enrollableId')
                .in('enrollableId', enrollableIds)
            handleSupabaseError(courseRows.error, event)

            const courseIdByEnrollableId = new Map<string, string>()
            for (const row of (courseRows.data ?? []) as Array<{ id: string | number, enrollableId: string | number | null }>) {
                if (row.enrollableId === null || row.enrollableId === undefined) continue
                courseIdByEnrollableId.set(String(row.enrollableId), String(row.id))
            }

            const courseIds = Array.from(new Set(Array.from(courseIdByEnrollableId.values())))
            if (courseIds.length > 0) {
                const lectureRows = await client
                    .from('lectures')
                    .select('id, courseId')
                    .in('courseId', courseIds)
                handleSupabaseError(lectureRows.error, event)

                const lectureIdsByCourseId = new Map<string, Set<string>>()
                for (const row of (lectureRows.data ?? []) as Array<{ id: string | number, courseId: string | number | null }>) {
                    if (row.courseId === null || row.courseId === undefined) continue
                    const key = String(row.courseId)
                    if (!lectureIdsByCourseId.has(key)) lectureIdsByCourseId.set(key, new Set())
                    lectureIdsByCourseId.get(key)!.add(String(row.id))
                }

                const linkedLectureIdSetByEnrollId = new Map<string, Set<string>>()
                for (const row of (data ?? []) as Array<{ enrollId: string | number | null, lectureId: string | number | null }>) {
                    if (row.enrollId === null || row.enrollId === undefined) continue
                    if (row.lectureId === null || row.lectureId === undefined) continue
                    const key = String(row.enrollId)
                    if (!linkedLectureIdSetByEnrollId.has(key)) linkedLectureIdSetByEnrollId.set(key, new Set())
                    linkedLectureIdSetByEnrollId.get(key)!.add(String(row.lectureId))
                }

                for (const enroll of enrollList) {
                    const enrollId = String(enroll.id)
                    const enrollableId = enroll.enrollableId === null || enroll.enrollableId === undefined
                        ? null
                        : String(enroll.enrollableId)
                    const courseId = enrollableId ? courseIdByEnrollableId.get(enrollableId) : undefined
                    if (!courseId) continue

                    const lectureIds = lectureIdsByCourseId.get(courseId) ?? new Set<string>()
                    if (lectureIds.size === 0) continue

                    const linkedLectureIds = linkedLectureIdSetByEnrollId.get(enrollId) ?? new Set<string>()
                    const missingLectureIds = Array.from(lectureIds).filter((lectureId) => !linkedLectureIds.has(lectureId))
                    if (missingLectureIds.length > 0) {
                        missingLectureIdsByEnroll[enrollId] = missingLectureIds
                    }
                }
            }
        }
        // 누락분 생성
        if (Object.keys(missingLectureIdsByEnroll).length > 0) {
            console.info('[m-c-lectures] missing lecture ids by enroll:', missingLectureIdsByEnroll)
            const insertRows: Array<{ enrollId: string, lectureId: string }> = []
            for (const [enrollId, lectureIds] of Object.entries(missingLectureIdsByEnroll)) {
                for (const lectureId of lectureIds) {
                    insertRows.push({ enrollId, lectureId })
                }
            }
            if (insertRows.length > 0) {
                const insertResult = await client
                    .from('m-c-lectures')
                    .insert(insertRows)
                handleSupabaseError(insertResult.error, event)
            }

            const refreshed = await client
                .from('m-c-lectures')
                .select('*')
                .in('enrollId', enrollIds)
                .order('id')
                .limit(1000)
            handleSupabaseError(refreshed.error, event)
            return 투영((refreshed.data ?? []) as Record<string, unknown>[], event) as iDB[]
        }
        return 투영(data as Record<string, unknown>[] | null, event) as iDB[]
    }

    const column = RELATION_COLUMN_MAP[String(table)]?.[relationKey]
    if (!column)
        throw createError({ statusCode: 404, message: `Unsupported relation: ${table}/${relationKey}` })

    const { data, error } = await (await getTable(event, table))
        .select(select절(event))
        .eq(column, idValue)
        .order('id')
        .limit(1000)
    handleSupabaseError(error, event)
    return 투영(data as Record<string, unknown>[] | null, event) as iDB[]
}

// --- `Delete` 안에 있던 FK 보호. `table`·`id`·`getClient`·`handleSupabaseError`는 어댑터의 것이다. ---
    // FK 보호: member-courses 삭제 전 m-c-lectures(enrollId)를 먼저 삭제
    if (String(table) === 'member-courses') {
        const client = getClient(event)
        const { error: childDeleteError } = await client
            .from('m-c-lectures')
            .delete()
            .eq('enrollId', String(id))
        handleSupabaseError(childDeleteError, event)
    }

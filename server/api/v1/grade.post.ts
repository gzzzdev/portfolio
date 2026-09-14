import type { H3Event } from 'h3'
import { do로그인회원 } from '../../utils/auth-인가'
import { db_supabase } from '../_/db_adapter'

/**
 * 신청 한 건의 **채점**. 정답(`answerKey`)을 내려보내지 않고 결과만 돌려준다.
 *
 * 문항은 회차 행의 `questions` jsonb, 답은 신청 행의 `answers` jsonb 다(`_CUSTOM/sql/enrolls.sql`).
 * 채점 대상은 **서버에 저장된 답**이다. 본문으로 받은 답을 채점하면 답을 바꿔가며 정답을
 * 캐낼 수 있는 창구가 된다.
 *
 * ⚠️ 지금은 `enrollables:read` 를 가진 역할이 문항 jsonb 를 통째로(정답 포함) 받는다 —
 * 열 단위 투영으로는 못 빼는 미결 문제다(`공개필드s.ts`). 그 결정이 나기 전까지 이 라우트는
 * "정답을 못 보는 역할"을 위한 자리가 아니라 **채점 규칙을 한 곳에 두는** 자리다.
 * 규칙은 클라 `문항.ts`의 `do채점`과 같아야 관리자 화면과 답이 갈리지 않는다.
 *
 * 경로가 `/api/v1/enrolls/grade`가 **아닌** 이유: 그 정적 가지가 catch-all `[table]`을 가린다.
 * `api-guard`는 이 경로를 건너뛴다(`비테이블경로s`) — 인가를 이 파일이 직접 진다: 로그인 + 소유자.
 */

type Row = Record<string, any>

/** 어댑터는 `context.params.table`을 보고 표를 고른다. 표만 갈아끼운 이벤트를 만든다. */
function tableEvent(event: H3Event, table: string) {
  const { 투영: _버림, ...context } = event.context as Record<string, unknown>
  return Object.assign(Object.create(Object.getPrototypeOf(event)), event, {
    // `투영`은 반드시 떨군다 — 남아 있으면 여기서 읽는 행까지 공개 필드로 깎여 답이 사라진다.
    context: { ...context, params: { ...(event.context.params ?? {}), table } }
  }) as H3Event
}

const reads = (event: H3Event, table: string) =>
  db_supabase.Reads(tableEvent(event, table)) as Promise<Row[]>

/** 순서를 무시한 집합 비교. `문항.ts`의 `do채점`과 같은 규칙이어야 한다. */
const is정답 = (정답s: unknown, 제출s: unknown): boolean => {
  const a = new Set((Array.isArray(정답s) ? 정답s : []).map(String))
  const b = new Set((Array.isArray(제출s) ? 제출s : []).map(String))
  if (a.size !== b.size) return false
  for (const v of a) if (!b.has(v)) return false
  return true
}

export default defineEventHandler(async (event) => {
  const 나 = await do로그인회원(event)
  if (!나) throw createError({ statusCode: 401, message: '로그인이 필요합니다.' })

  // 회원id는 토큰이 아니라 `users.memberId`에서 온다 — 신원과 도메인 회원을 잇는 곳이 거기 하나다.
  const 내회원id = String(나.memberId ?? '')
  const is관리 = 나.gnbRoles.includes('admin') || 나.gnbRoles.includes('manager')

  type i본문 = { enrollId?: string | number }
  const body = await readBody<i본문>(event).catch((): i본문 => ({}))
  const 신청id = String(body.enrollId ?? '').trim()
  if (!신청id) throw createError({ statusCode: 400, message: 'enrollId가 필요합니다.' })

  const 신청 = (await reads(event, 'enrolls')).find(row => String(row.id) === 신청id)
  if (!신청) throw createError({ statusCode: 404, message: '신청을 찾을 수 없습니다.' })

  // 남의 응시를 채점해 볼 수 없다 — 그게 되면 답을 바꿔가며 정답을 캐는 창구가 된다.
  if (!is관리 && String(신청.memberId ?? '') !== 내회원id)
    throw createError({ statusCode: 403, message: '내 신청만 채점할 수 있습니다.' })

  const 신청받기 = (await reads(event, 'enrollables')).find(row => String(row.id) === String(신청.enrollableId))
  if (!신청받기) throw createError({ statusCode: 404, message: '회차를 찾을 수 없습니다.' })

  const 문항s: Row[] = Array.isArray(신청받기.questions) ? 신청받기.questions : []
  const 답s: Record<string, unknown> = 신청.answers && typeof 신청.answers === 'object' ? 신청.answers : {}

  let 점수 = 0
  let 만점 = 0
  const results = 문항s.map((문항) => {
    const id = String(문항.id ?? '')
    const 정답s = Array.isArray(문항.answerKey) && 문항.answerKey.length ? 문항.answerKey : null
    const 배점 = Number(문항.score ?? 0) || 0
    // 정답이 없는 문항(설문·투표)은 채점 대상이 아니다. `null`로 "오답"과 구분한다.
    if (!정답s) return { questionId: id, isCorrect: null as boolean | null, score: 0 }
    만점 += 배점
    const 맞음 = is정답(정답s, 답s[id])
    if (맞음) 점수 += 배점
    return { questionId: id, isCorrect: 맞음, score: 맞음 ? 배점 : 0 }
  })

  // 합격 기준은 퀴즈에만 있다. 0이면 기준을 안 두는 진단용이라 합격/불합격을 매기지 않는다.
  let 합격점수: number | null = null
  if (신청받기.quizId != null) {
    const 퀴즈 = (await reads(event, 'quizzes')).find(row => String(row.id) === String(신청받기.quizId))
    const n = Number(퀴즈?.passScore ?? 0)
    합격점수 = Number.isFinite(n) && n > 0 ? n : null
  }

  return {
    enrollId: 신청id,
    score: 점수,
    maxScore: 만점,
    passScore: 합격점수,
    isPassed: 합격점수 == null ? null : 점수 >= 합격점수,
    results
  }
})

/**
 * 역할에 `{테이블}:read`는 없고 `{테이블}:readPublic`만 있을 때, 서버가 남겨 보낼 필드.
 *
 * 이 파일이 필요한 이유는 **조인이 클라이언트에서 일어나기 때문**이다.
 * 예: 게시글의 작성자 이름 한 줄을 그리려고 `model회원게시글._회원`이
 * `model회원s.getInstance().getById(mid)`를 타고, 그래서 공개 게시판이 회원 테이블을 통째로 읽는다.
 * "테이블을 읽을 수 있나"로는 이걸 못 막는다(막으면 게시판이 깨진다) — 답은 "어떤 필드를 읽을 수 있나"다.
 *
 * Nitro(서버 미들웨어/어댑터)에서 매 요청 import하므로 **의존성 없는 순수 데이터**로 둔다.
 * 모델 배럴(`~models/test2`)을 끌어오면 Vue까지 딸려온다.
 */

/** 선언이 없는 테이블의 기본값. 기존 `?brief=true`가 내주던 것과 같다. */
export const 기본공개필드s = ['id', 'title', 'name', 'label'] as const

/**
 * 테이블별 공개 필드. `[]`면 빈 목록을 준다(= 존재는 알려주되 내용은 없음).
 * 여기 없는 테이블은 `기본공개필드s`로 깎인다.
 */
export const 공개필드sByTable: Record<string, readonly string[]> = {
  /** 게시글 작성자 표시에 필요한 최소치. 연락처·이메일 등은 절대 포함하지 말 것. */
  members: ['id', 'name', 'thumbnail'],
  /**
   * 비회원이 신청 목록에서 보는 건 **몇 명 신청했나**뿐이다(`신청받기.신청수`, 정원 마감 판정).
   * 신청수는 뷰·카운터 열이 아니라 **이 좁힌 행을 클라가 세서** 만든다(2026-09-13 결정 —
   * 수천 건이면 세는 비용이 없고, 카운터는 상태 전이·시드에서 어긋난다).
   *
   * `memberId`·`answers` 가 빠져 있는 게 요점 — 남기면 "누가 무엇에 뭐라고 답했나"가
   * 그대로 명부가 된다. `status` 는 자리를 먹는 상태(대기·승인)만 세기 위해 필요하다.
   * 화이트리스트라서 열이 늘어도 여기 안 적으면 안 나간다 — 실수는 새는 쪽이 아니라 안 보이는 쪽이다.
   *
   * ⚠️ 문항(`enrollables.questions`)은 jsonb 라 열 단위 투영으로 퀴즈 정답을 못 뺀다. 미결이다.
   */
  enrolls: ['id', 'enrollableId', 'status']
}

/**
 * **본인 행은 깎지 않는다** — 표마다 "이 행의 주인"을 가리키는 열.
 *
 * 비회원(익명 세션)은 역할이 `guest` 라 `enrolls` 가 `readPublic` 으로 깎인다. 그러면 **자기가 낸 신청**의
 * `memberId`·`answers` 까지 사라져 「내 신청」도 문항 이어 쓰기도 못 한다. 역할이 아니라 행으로 풀어야
 * 하는 문제라, 요청한 사람의 `members.id` 와 이 열이 같은 행만 통째로 준다(`api-guard` 가 `투영본인` 을 세운다).
 * 여기 없는 표는 본인 행도 똑같이 깎인다.
 */
export const 본인열ByTable: Record<string, string> = {
  members: 'id',
  enrolls: 'memberId'
}

export function 공개필드s(table: string): readonly string[] {
  return 공개필드sByTable[table] ?? 기본공개필드s
}

/** 행 하나를 공개 필드만 남기고 깎는다. `본인`(members.id)이 이 행의 주인이면 그대로 둔다. */
export function do공개투영<T extends Record<string, unknown>>(row: T, table: string, 본인?: string | number | null): Partial<T> {
  const 본인열 = 본인열ByTable[table]
  if (본인열 && 본인 != null && String(row[본인열] ?? '') === String(본인)) return row
  const keys = 공개필드s(table)
  const out: Record<string, unknown> = {}
  for (const k of keys) if (k in row) out[k] = row[k]
  return out as Partial<T>
}

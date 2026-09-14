/**
 * 행의 **정체성 두 축** — 서버 PK와 클라이언트 rowKey. `BaseModel2`(행 하나)와
 * `BaseModels2`(목록) 양쪽이 같은 판정을 써야 해서 여기 한 자리에 모은다.
 */
export type RowId = string | number | undefined | null

/** PK 자리에 오는 자리표시자들. `init()`이 넣는 `just_created`가 대표. */
const isPk자리표시자 = (id: RowId): boolean => id == null || ['', 'undefined', 'just_created'].includes(String(id))

/**
 * 옛 임시 id(`pending-*`). 지금은 **아무도 만들지 않는다** — 저장 전 행의 PK는 `null`이다.
 * 판정만 남겨둔 건, 이 값을 들고 있는 화면이 살아 있는 채로 코드가 갈릴 수 있어서다.
 */
export const isClientPendingRowId = (id: RowId): boolean => typeof id === 'string' && id.startsWith('pending-')

/**
 * 서버가 준 PK가 붙어 있나. 임시 id와 `just_created` 같은 자리표시자는 PK가 아니다.
 *
 * 이 판정이 모델 곳곳에 `id === 'just_created' || id.startsWith('pending-')`로 손복사돼 있었다.
 * 임시 id의 모양이 바뀌면 복사본이 **조용히** 무력화되므로(틀린 게 아니라 늘 "저장됨"이 된다) 한 자리로 모은다.
 */
export const hasServerPk = (id: RowId): boolean => !isPk자리표시자(id) && !isClientPendingRowId(id)

/**
 * 관계 행의 FK로 쓸 **서버 PK**를 꺼낸다. 저장 전 행이면 `null` — 남이 가리킬 수 없다.
 *
 * 부르는 쪽이 `null`을 보고 물러서게 하려고 값으로 돌려준다. 불리언 가드로는 타입이 안 좁혀져서
 * `tagId: 태그.stateId` 같은 자리에서 결국 `null`이 새기 때문이다.
 */
export const pkOf = (m?: { stateId: string | number | null } | null): string | number | null =>
  m?.stateId ?? null

/**
 * 관계 행을 만들기 전에 **가리킬 행들이 다 저장돼 있는지** 확인하고 PK를 한 번에 꺼낸다.
 * 하나라도 저장 전이면 어느 행인지 알려주고 `null`을 준다.
 *
 * 반환을 `Record<string, iID>`로 두면 `noUncheckedIndexedAccess`가 `iID | undefined`를 얹는다.
 * 키를 그대로 실어 나르는 매핑 타입이라야 `pks.태그`가 곧장 PK다.
 */
export const pksOf = <K extends string>(
  대상s: Record<K, { stateId: string | number | null } | null | undefined>
): { [P in K]: string | number } | null => {
  const out = {} as { [P in K]: string | number }
  for (const 이름 of Object.keys(대상s) as K[]) {
    const pk = pkOf(대상s[이름])
    if (pk == null) {
      useAlert().show('저장 필요', `${이름}을(를) 먼저 저장한 뒤 연결할 수 있습니다.`)
      return null
    }
    out[이름] = pk
  }
  return out
}

/**
 * 행의 **클라이언트 identity**. 서버 PK와는 다른 축이다 —
 * 태어날 때 정해지고, 서버가 PK를 줘도 안 변하고, 서버로 나가지도 않는다.
 *
 * PK로 색인하면 저장 전 행들이 한 칸을 나눠 쓴다(`String(null)`이 다 같으니까) — 그게 원래 버그였다.
 * 한때 `pending-*`라는 유일한 가짜 PK로 막았지만, 축을 나눈 지금은 PK를 비워 둘 수 있다.
 *
 * 서버에서 온 행은 PK에서 **결정적으로** 뽑는다. `reads()`가 행 객체를 새로 만들어도(SSR 페이로드로
 * 건너와도) 키가 같아야 `_modelCache`의 모델이 살아남기 때문이다.
 * 반대로 한 번 붙은 키는 **다시 계산하지 않는다** — 초안이 저장돼 PK를 받아도 폼이 쥔 모델이
 * 그대로 살아 있어야 하므로, 키가 `local:*`에서 `pk:*`로 바뀌면 안 된다.
 *
 * 열거 불가로 심어서 `Object.entries`·`JSON.stringify`·`toApiPayload`·`clone`이 전부 못 본다.
 */
const ROW_KEY = Symbol('rowKey')
let 로컬키순번 = 0

export const rowKeyOf = (row: { id?: RowId }): string => {
  const 붙은키 = (row as Record<symbol, unknown>)[ROW_KEY] as string | undefined
  if (붙은키) return 붙은키

  const key = hasServerPk(row.id)
    ? `pk:${row.id}`
    : `local:${String(++로컬키순번).padStart(6, '0')}`
  Object.defineProperty(row, ROW_KEY, { value: key, enumerable: false, writable: false, configurable: true })
  return key
}

/**
 * `_list`를 **서버 PK로 조인하기 위한** 색인 재료 — `[PK, 행, 인덱스]`. PK 없는 행(초안)은 빠진다.
 *
 * 그냥 `map(x => [String(x.id), x])`로 만들면 저장 전 행들이 한 키에 뭉쳐 마지막 하나만 남는다.
 * 이 맵들이 답하는 질문은 "서버가 준 이 행이 목록 어디에 있나"뿐이고, 초안은 답이 될 수 없다.
 */
export const pk색인 = <D extends { id?: RowId }>(rows: readonly D[]): [string, D, number][] =>
  rows.flatMap((x, i) => (hasServerPk(x.id) ? [[String(x.id), x, i] as [string, D, number]] : []))

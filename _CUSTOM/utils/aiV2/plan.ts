import { toValue } from 'vue'
import { 행값, 행검색매칭 } from '../etc/textSearch'
import { 필터조건찾기, type i정렬조건, type i필터라디오그룹 } from '../models/BaseModels2.types'

/**
 * v2 전용 조회 계획. 파이프라인 지도는 `./README.md`.
 *
 * **v1(`../ai/plan.ts`)의 필터축 기계를 복사해 오지 말 것.** 저쪽은 모델이 선언한 `필터조건ss`로
 * `"축=값"` enum을 닫는데, v2 모델에는 닫을 축이 없는 소스가 대부분이라 빈 enum만 나간다.
 * 여기 남는 축은 셋이다: **어느 소스인가 / 무엇을 찾는가 / 무엇을 시키는가.**
 */
export interface PlanV2 {
  /** 어느 소스를 볼지 (`i소스V2.key` = `repo.tableName`) */
  source: string
  /**
   * 자유 키워드 하나. 모델이 선언한 `검색필드s`를 훑는다(**화면 검색창과 같은 함수**).
   *
   * 배열로 넓히지 말 것 — 도우미만 할 수 있는 조회가 생기는 순간
   * "화면에서 걸리는 건 도우미에서도 걸린다"가 한쪽으로 깨진다. 조회가 필요 없는 턴에는 빈 문자열.
   */
  검색어: string
  /**
   * `"축=값"` = `"필터조건ss[].title=options[].label"`. 축끼리 AND — 화면 필터와 같은 의미다.
   *
   * 축과 값을 따로 두지 말 것: 한 문자열을 enum으로 닫아야 **반쪽짜리 조건이 문법적으로 불가능**해진다.
   * 이 값의 최종 목적지는 조회가 아니라 **주소**다(`i소스V2.조회쿼리`).
   */
  필터s?: string[]
  /** `정렬조건s[].label`. 없으면 화면 기본 정렬과 같은 순서로 본다. */
  정렬조건?: string
  /**
   * 이 턴이 무엇을 원하는가. 깊이(가져올 행 수)를 정한다.
   *
   * **`select`를 `act`에 합치지 말 것** — 여는 것은 모델의 행동(`do*`)이 아니라 **화면의 일**이라
   * 어느 모델에도 그런 키가 없고, 합치면 화이트리스트에 걸려 매번 "지원하지 않는다"가 된다.
   */
  intent: 'count' | 'list' | 'act' | 'select' | 'create'
  /** 행 하나 지목. 후보(직전 턴 항목 + 화면 선택)로 enum을 닫으므로 없는 id는 나올 수 없다. */
  대상id?: string
  /**
   * 열면서 펼쳐 둘 **묶음(탭)** 이름. `intent: 'select'`일 때만 뜻이 있다 — "그 사람 성격 보여줘".
   *
   * 조회 축이 아니라 **여는 화면의 생김새**라 `계획실행V2`이 이걸 안 본다. 거르는 데 쓰거나
   * 검색어에 담으면 그런 이름의 행이 없어 0건이 된다. 실제로 열리는지는 앱이 판정한다 —
   * enum은 소스를 안 가리는 합집합이다.
   */
  탭?: string
  /** 만들 행 이름들(`intent: 'create'`). 검색어에 담으면 없는 이름이라 0건이 되고, required로 닫으면 안 만드는 턴에도 지어낸다. */
  생성이름s?: string[]
  /** 만들 **개수**. 이름 없이 수만 말한 턴("채소 3개 추가해")을 위한 자리다. 이름과 겹치면 이름이 이긴다. */
  생성개수?: number
  /** 실행을 **지목**한 행동(`do*`) 키. 명령이 아니라 제안이다 — 실제로 걸리는지는 계획 실행 뒤 앱이 판정한다. */
  행동?: string
  /**
   * 그 행동에 딸린 한 줄 값 — `토마토에 기록추가해 "2222"`의 `2222`.
   *
   * 검색어에 담으면 그 내용으로 목록을 걸러 0건이 된다. 반대로 버리면 앱이 사용자가 방금 한 말을
   * 모달로 **다시** 묻게 된다. 쓸지 말지는 앱이 정한다(지목된 행동에만 넘긴다).
   */
  행동값?: string
  /**
   * `do수정`이 고칠 칸과 새 값의 쌍들. **여럿이다** — 모델의 필수 칸이 둘이면 한 칸짜리 축은 답이 아니다.
   *
   * 칸은 **라벨**로 지목한다(`이름`, `원산지`). 키(`label`·`origin`)는 앱의 내부 이름이지 어휘가 아니다
   * (근거는 `source.ts` 의 `어휘()`). 키로 되돌리는 건 앱이 한다.
   * 값은 자유 문자열이다 — 형을 맞추는 일은 모델의 setter가 이미 하고 있다.
   */
  수정s?: { 필드: string, 값: string }[]
}

/** 계획을 실행할 수 있는 저장소 — `BaseModels2`가 이미 공개하는 것만 요구한다. */
export interface RepoV2 {
  tableName: string
  list: unknown
  reads?: (isBrief?: boolean, force?: boolean) => Promise<unknown>
  /**
   * 모델이 선언한 조회 축들. **목록5가 화면을 그릴 때 읽는 그 정의 그대로다** —
   * 모델에 축을 하나 더 적으면 화면 필터 UI가 생기고 도우미 어휘도 같이 는다. 한 번 적고 두 곳이 산다.
   */
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  필터조건ss?: i필터라디오그룹<any>[]
  정렬조건s?: i정렬조건[]
  검색필드s?: string[]
  /**
   * 목록에 **초안 행** 하나를 끼우고 그 행을 돌려준다(`BaseModels2.empty`). 서버에 안 보낸다.
   *
   * **여기서 POST 하지 말 것.** 서버로 나가는 길이 `do저장` 하나여야 필수칸 검증(`beforeSave`)도
   * 화면의 추가 버튼과 같은 그물을 탄다. 값도 여기서 안 받는다 —
   * 무엇을 앉힐지 아는 건 계획이지 저장소가 아니다(`값s적용`).
   */
  empty?: () => Promise<unknown>
}

/* eslint-disable @typescript-eslint/no-explicit-any */

const rowsOf = (repo: RepoV2) => (toValue(repo.list) ?? []) as any[]

/**
 * 행 식별자. **서버 PK 우선, 저장 전 행이면 `rowKey`**(`목록5`의 `?id=` 축과 같다).
 *
 * 초안까지 id를 갖는 이유: 만든 직후 그 행을 주소로 열어야 하고, 다음 턴이 "거기 제철 봄으로"라고
 * 이어 말할 때 지목할 자리도 있어야 한다.
 */
export const 행idV2 = (row: any) =>
  String((row?.is신규 ? row?.rowKey : row?.stateId ?? row?.id) ?? '')

export interface 계획실행결과V2 {
  rows: any[]
  /** 실제로 적용된 조건. 답변이 "무엇으로 걸렀는지"를 말할 수 있게 앱이 적어 보낸다. */
  적용: string[]
}

/**
 * 계획 실행. 순서는 **대상 지목 → 검색**.
 *
 * 지목이 먼저인 이유는 후속 턴("걔 do토스트 해줘")이 조건을 다시 말해주지 않기 때문이다 —
 * 이번 턴의 검색어와 무관하게 전체에서 그 행을 찾아야 한다.
 */
export function 계획실행V2(repo: RepoV2, plan: PlanV2): 계획실행결과V2 {
  const 전체 = rowsOf(repo)

  if (plan.대상id) {
    const 하나 = 전체.filter(row => 행idV2(row) === String(plan.대상id))
    if (하나.length) return { rows: 하나, 적용: [`대상=${행값(하나[0], 'label')}`] }
    // 못 찾았으면 조용히 전체로 흘려보내지 않는다 — 지목이 빗나갔다는 사실을 답변이 알아야 한다.
    return { rows: [], 적용: [`대상id=${plan.대상id}(없음)`] }
  }

  let rows = 전체
  const 적용: string[] = []

  // 필터 축 — 화면이 쓰는 `match` 그대로다. 거르는 규칙을 두 벌로 두면 반드시 갈린다.
  for (const 조건 of plan.필터s ?? []) {
    const 짝 = 필터조건찾기(repo.필터조건ss ?? [], String(조건 ?? ''))
    if (!짝) continue
    rows = rows.filter((row, i) => 짝.옵션.match(row, i))
    적용.push(`${짝.그룹.title ?? 짝.그룹.key}=${짝.옵션.label}`)
  }

  const 키워드 = String(plan.검색어 ?? '').trim()
  if (키워드) {
    rows = rows.filter(row => 행검색매칭(row, repo.검색필드s, 키워드))
    적용.push(`검색=${키워드}`)
  }

  // 정렬은 **말 안 해도 건다.** 안 걸면 도우미의 "두 번째 거"와 화면의 두 번째 줄이 어긋난다.
  const 정렬s = repo.정렬조건s ?? []
  const 정렬 = 정렬s.find(x => x.label === plan.정렬조건) ?? 정렬s[0]
  if (정렬) {
    rows = rows.toSorted(정렬.func)
    if (plan.정렬조건 && 정렬.label === plan.정렬조건) 적용.push(`정렬=${정렬.label}`)
  }

  return { rows, 적용 }
}

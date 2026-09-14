import { toValue } from 'vue'
import { BaseModels2, BaseModel2, getRepoInstance } from '~utils/models'
import type { BaseXX } from '~utils/models'
import type { i테이블dto } from './model테이블'

/**
 * **표별 행 수.** `"table-counts"` 뷰를 읽는다(`_CUSTOM/sql/tables.sql` 5절).
 *
 * 뷰라서 **여기 특별한 게 없다** — `/api/v1/table-counts` 로 나가고 `api-guard` 를 타고
 * `BaseModels2` 가 그대로 읽는다. 그게 이 파일이 짧은 이유고, 전에 있던 `_counts` RPC 와
 * 갈리는 지점이다. 그쪽은 인자 상한(20)·배치 실패·가드 예외를 **부르는 쪽이** 지고 있었다.
 *
 * ## 등록부와 무엇이 다른가
 *
 * 뷰가 `tables.*` 를 통째로 이므로 열은 등록부와 같고 `count` 하나가 더 있다. 그래서 요약
 * 화면은 이 표 **하나만** 읽으면 된다 — 등록부를 따로 읽을 이유가 없다.
 *
 * **「비었나」만 묻는 자리도 이걸 읽는다**(`useSystem.do빈표확인`). 판을 하나 더 세우는 대신
 * 그쪽이 답을 빗장으로 잡는다 — 이 뷰가 비싼 건 맞지만, 그 자리가 **같은 답을 반복해서**
 * 물어서 비쌌던 거라 답이 아니라 횟수를 고치는 게 맞다.
 *
 * 그런데도 `tables` 를 안 대체한다. 등록부는 캐시 판정(`표버전`)이 **초당** 읽는 표라
 * 싸야 하고, 이쪽은 읽을 때마다 표 서른몇 개를 세는 비싼 판이다. 같은 데이터의 판 둘이고,
 * 비싼 쪽은 부르는 화면만 문다.
 *
 * ## 쓰기가 없다
 *
 * 조인 뷰라 Postgres 가 자동갱신을 안 해준다 — `creates`/`updates` 를 부르면 **DB 가 막는다.**
 * 앱에서 한 번 더 막지 않는 건 그래서다. 값을 고칠 자리는 원본 `tables` 다.
 *
 * ## 등록부 시드에 넣지 않는다
 *
 * 넣으면 `표버전` 판정을 타서 "안 바뀌었으면 안 받는다"에 걸린다. 개수는 늘 최신이어야 하므로
 * 등록부에 행이 없어야 맞다 — `훑기` 가 `undefined` 를 주고 매번 받는다. (뷰는 `relkind='v'`
 * 라 `rebuild_table_counts` 의 union 에도 자기가 안 들어간다.)
 */
export interface i표개수dto extends i테이블dto {
  /**
   * 그 표의 행 수. 뷰가 `count(*)` 로 그 자리에서 센다.
   *
   * **`null` 은 0 이 아니라 「못 셈」이다.** 등록부엔 있는데 DB 엔 없는 표가 `left join` 으로
   * 여기 `null` 이 되어 남는다(`tables.sql` 5절). 화면이 그 둘을 갈라 그린다.
   */
  count: number | null
}

export interface i표개수 extends BaseXX {
  테이블명: string
  개수: number | null
  세는단위: string
}

export class model표개수s extends BaseModels2<model표개수, i표개수dto> {
  static getInstance = () => getRepoInstance('model표개수s', () => new model표개수s())

  private constructor() {
    super(model표개수, 'table-counts')
  }

  /** 표 이름 → 개수. **없는 이름은 `null` 이다** — 뷰에 행이 없다는 건 못 셌다는 뜻이지 0 이 아니다. */
  개수of = (name: string): number | null =>
    toValue(this.list).find(x => x.테이블명 === name)?.개수 ?? null

  override _generate = () => new model표개수().generate()
  override _init = () => new model표개수().init()
}

export class model표개수 extends BaseModel2<i표개수dto> implements i표개수 {
  constructor(state?: i표개수dto) {
    super(model표개수s.getInstance(), state)
  }

  override init(): Omit<i표개수dto, 'id'> {
    return { name: '', version: 0, unit: '개', isHierarchy: false, count: null }
  }

  override generate(): Omit<i표개수dto, 'id'> {
    return this.init()
  }

  override get label() { return this.테이블명 }
  override get sub() { return this.개수 == null ? '못 셈' : `${this.개수}${this.세는단위}` }

  get 테이블명() { return this.state?.name ?? '' }
  /** **`?? 0` 을 쓰지 않는다.** 여기서 `null` 은 못 셌다는 뜻이고, 0 으로 접으면 화면이 장애를 「없음」으로 그린다. */
  get 개수(): number | null { return this.state?.count == null ? null : Number(this.state.count) }
  get 세는단위() { return this.state?.unit || '개' }
}

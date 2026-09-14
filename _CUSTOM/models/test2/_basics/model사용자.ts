import { computed, toValue } from 'vue'
import { BaseModels2, BaseModel2, 타입지정, type BaseXX, type BaseXXDto, type iID, type i목록Badge, getRepoInstance, 시드PK } from '~utils/models'
import { model메뉴s } from './model메뉴'
import { model회원s, type model회원 } from './model회원'
import { i사용자seed } from '../seeds'

/**
 * **로그인 계정.** `members`(도메인 회원정보)와 1:1이고, `memberId`를 소유하는 쪽이 여기다 —
 * 인증이 끝나면 이 행 하나에서 회원·역할·모든 소유 판정이 뻗어 나간다.
 *
 * **신원 자체는 여기 없다.** 이메일·비밀번호·소셜 연동·토큰 갱신은 Supabase Auth(`auth.users`)가
 * 소유하고, 이 표는 그 신원(`authId`)과 도메인 회원(`memberId`)을 잇는다.
 * 그게 Supabase의 표준 배치(`auth.users` ↔ 프로필 표 1:1)이고, 이 리포에선 프로필 자리가
 * `members`라서 연결 표가 하나 더 있는 꼴이다.
 *
 * `id`가 uuid가 아닌 이유는 `_CUSTOM/sql/schema.auth.sql` 머리말에 있다 —
 * `BaseModel2.compareTo`가 `Number(stateId)`로 정렬한다.
 */
export interface i사용자dto extends BaseXXDto {
  email: string
  memberId: iID | null
  /** `auth.users.id`. 계정이 아직 Supabase Auth에 안 만들어졌으면 `null`(시드 직후가 그 상태다). */
  authId: string | null
}

/**
 * 시드 한 행. `회원code`는 **회원 시드가 자기를 부르는 이름**이고 DB로 나가지 않는다(`etcFields`).
 * 실제 `memberId`는 `seed해소`가 `시드PK` 등록부에서 꺼내 채운다 — 게시글 시드의 `작성자code`와 같은 꼴.
 *
 */
export type i사용자시드 = Omit<i사용자dto, 'id'> & { 회원code?: string }

export interface i사용자 extends BaseXX {
  이메일: string
  회원id: iID | null
  authId: string | null
  readonly 회원: model회원 | undefined
  readonly is연결됨: boolean
}

export class model사용자s extends BaseModels2<model사용자, i사용자dto, i사용자시드> {
  /** `회원code`는 시드 전용 이름이라 서버로 보내지 않는다 — `seed해소`가 `memberId`로 바꾼다. */
  protected etcFields = ['회원code']

  static getInstance = () => getRepoInstance('model사용자s', () => new model사용자s())

  private constructor() {
    super(model사용자, 'users')
  }

  /**
   * 화면 머리글(제목·아이콘·보기모드)은 **메뉴 행에서** 온다 — `view목록5`가 `repository.메뉴`를 본다.
   * 행이 없으면 머리글이 통째로 빠지므로, `/admin/users` 화면은 `model메뉴.seed`의 `users`와 한 몸이다.
   */
  get 메뉴() { return model메뉴s.getInstance().getBy테이블명(this.tableName) }

  /**
   * 값이 닫힌 축은 이 표에 하나뿐이다 — **신원이 붙었나**(`authId`).
   * 이메일·회원은 닫히지 않아 필터가 아니라 검색 축(`label`·`sub`)이 받는다.
   */
  override 필터조건ss = [
    this.라디오필터그룹([
      { label: '연결됨', match: (a: model사용자) => a.is연결됨 },
      { label: '미연결', match: (a: model사용자) => !a.is연결됨 }
    ], { title: '로그인' })
  ]

  protected override seed = i사용자seed

  /** 로그인이 계정을 지목하는 축. 클릭로그인(이메일)·SNS(연동 후 이메일) 둘 다 여기로 들어온다. */
  getBy이메일 = (email: string) => toValue(this.list).find(row => row.이메일 === email)

  /**
   * 시드의 `회원code`를 실제 `memberId`로 바꾼다. **DB를 뒤지지 않는다** —
   * `useSystem`이 의존 순서대로 훑으면서 회원을 만들 때 남겨둔 `시드PK` 등록부에서 꺼낸다.
   *
   * 못 찾으면 던진다. 계정은 회원을 못 가리키면 존재 이유가 없고(로그인해도 아무 데도 못 간다),
   * `memberId`가 빈 채로 나가면 FK가 거부한다.
   */
  protected override async seed해소(rows: i사용자dto[]): Promise<i사용자dto[]> {
    return rows.map((row) => {
      const { 회원code, ...rest } = row as i사용자dto & { 회원code?: string }
      const memberId = 회원code ? 시드PK.찾기('members', 회원code) : null
      if (회원code && !memberId) {
        throw new Error(
          `[계정 seed] 회원 '${회원code}'가 시드PK 등록부에 없다.`
          + ` 회원이 이전 실행에서 이미 채워졌다면 등록부가 비어 있다 —`
          + ` 회원·계정을 함께 비우고 초기데이터를 한 번에 돌릴 것.`
        )
      }
      return { ...rest, memberId } as i사용자dto
    })
  }

  override _generate = () => new model사용자().generate()
  override _init = () => new model사용자().init()
}

export class model사용자 extends BaseModel2<i사용자dto> implements i사용자 {
  constructor(state?: i사용자dto) {
    super(model사용자s.getInstance(), state)
  }

  override afterCreate = () => { }
  override beforeSave = () => true
  override afterSave = () => { }

  override 자동필드ss = [
    {
      label: '계정',
      list: [
        { key: '이메일', label: '이메일' },
        {
          key: '회원id',
          label: '회원',
          type: 타입지정.선택0,
          options: computed(() => model회원s.getInstance().options)
        },
        // 신원은 Supabase Auth가 소유하므로 여기선 **연결됐는지만** 보인다. 편집 대상이 아니다.
        { key: 'is연결됨', label: '로그인 연결', canEdit: false }
      ]
    }
  ]

  override generate() {
    return this.init()
  }

  override init() {
    return {
      email: '',
      memberId: null,
      authId: null
    }
  }

  override get label() { return this.회원?.label || this.이메일 }

  /**
   * 목록 카드 윗줄. **회원이 붙었을 때만** 이메일을 낸다 — 안 붙었으면 `label`이 이미 이메일이라
   * 같은 값이 두 줄로 뜬다. (검색도 이 두 축을 본다 — `검색필드s`가 비면 `label`·`sub`가 대상이다.)
   */
  override get sub() { return this.회원 ? this.이메일 : '' }

  /**
   * **성한 계정은 아무 배지도 안 단다.** 배지가 가리키는 건 손이 가야 할 자리뿐이다 —
   * 신원이 없으면 이 계정으론 로그인 자체가 안 되고(`authId`), 회원이 없으면 로그인해도
   * 역할이 안 뻗어 나와 guest로 떨어진다(역할은 회원의 `member-entity-historys`에 산다).
   */
  _badges = computed<i목록Badge[]>(() => {
    const badges: i목록Badge[] = []
    if (this.회원id == null) badges.push({ label: '회원 없음', color: 'error' })
    if (!this.is연결됨) badges.push({ label: '미연결', color: 'warning' })
    return badges
  })

  override get badges() { return toValue(this._badges) }

  get 이메일() { return this.state?.email ?? '' }
  set 이메일(v: string) { if (!this.state) return; this.state.email = v }

  get 회원id() { return this.state?.memberId ?? null }
  set 회원id(v: iID | null) { if (!this.state) return; this.state.memberId = v }

  /** 읽기 전용이다. 이 값을 쓰는 건 Supabase Auth 쪽 사건(계정 생성·소셜 연동)이지 폼이 아니다. */
  get authId() { return this.state?.authId ?? null }

  /** Supabase Auth에 실제 계정이 있는가. 없으면 시드 행만 있고 아직 로그인할 수 없다. */
  get is연결됨() { return this.authId != null }

  get 회원() {
    return this.회원id == null ? undefined : model회원s.getInstance().getById(String(this.회원id))
  }
}

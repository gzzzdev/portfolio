import { computed, toValue } from 'vue'
import { BaseModels2, BaseModel2, 타입지정, type BaseXX, type BaseXXDto, getRepoInstance, 시드PK } from '~utils/models'
import { model메뉴s, type model회원, type model메뉴 } from './'
import { model테이블s } from '~models/(system)/model테이블'
import { model회원이력s } from './model회원이력'
import { i역할seed } from '../seeds'
import type { i폴더s } from '~/components/m/Sortable/1/index.vue'

export const i역할코드s = ['guest', 'learner', 'manager', 'admin', 'associate'] as const
export type i역할코드 = typeof i역할코드s[number]
export type i역할색상 = 'primary' | 'secondary' | 'info' | 'warning' | 'error' | 'neutral'// 'success'. 이유는 알수없으나, success 작동안됨.

/**
 * 역할 색상 **선택지 카탈로그** — 여기서 `color` 는 스타일 결정이 아니라 **데이터**다.
 * 관리자가 역할에 붙일 색을 고르는 목록이고, 각 줄의 `color` 는 그 선택지를 미리보기로
 * 칠하는 값이다. 회색조 규약(`eslint.회색조.mjs`)이 막는 건 "화면을 칠하는 결정"이고
 * 여기는 그 결정을 **사용자에게 넘기는** 자리라 규약 밖이다.
 */
/* eslint-disable no-restricted-syntax -- 색이 스타일이 아니라 선택지 데이터다 (위 주석) */
export const i역할색상options: { label: string, value: i역할색상, color: i역할색상 }[] = [
  { label: '주색', value: 'primary', color: 'primary' },
  { label: '보조색', value: 'secondary', color: 'secondary' },
  { label: '정보', value: 'info', color: 'info' },
  { label: '경고', value: 'warning', color: 'warning' },
  { label: '오류', value: 'error', color: 'error' },
  { label: '중립', value: 'neutral', color: 'neutral' }
]
/* eslint-enable no-restricted-syntax */
const is기본옵션options = [
  { label: '기본값', value: true, icon: 'i-material-symbols-light:start' },
  { label: '아님', value: false, icon: 'i-material-symbols-light:align-justify-center' }
]

/**
 * 권한의 리소스 = **DB 테이블명**(`BaseModels2.tableName` = `/api/{v}/{table}`).
 *
 * 이전에는 menus.json의 경로(`dashboard`, `my-info`, `enroll-journals`…)를 썼는데, 그건
 * "이 화면을 볼 수 있나"라서 이미 `메뉴.접근역할codes`가 답하는 질문이다. 여기 남은 질문은
 * "이 API를 부를 수 있나"뿐이고, API는 테이블 단위라 어휘도 테이블이어야 한다.
 * (guest가 `roles:read`는 되지만 `/admin/roles` 화면은 못 보는 것처럼, 둘은 실제로 다르다.)
 *
 * ## 이 배열은 **대비책**이다
 *
 * 정본은 `model테이블s`(표 등록부)다. 손으로 적은 목록은 어긋난다 — 실제로 어긋나 있었다:
 * `enrollables`·`member-enrolls`는 이전 세대(`localDB_ex`)의 잔재라 지웠고, v2 표 일곱은
 * 빠져 있어서 채웠다. 그 사이 `api-guard`는 **요청 경로에서** 표 이름을 뽑아 판정하므로,
 * 여기 없는 표는 "가드는 요구하는데 편집기는 못 주는" 권한이 된다.
 *
 * 그래서 선택지는 `do권한key옵션s()`가 등록부에서 만들고, **등록부가 비었을 때만** 이 배열로
 * 떨어진다(`tables` 표가 아직 없는 동안 역할 편집기가 빈 목록이 되는 것을 막는다).
 * 타입은 여기 남는다 — 시드(`i역할seed`)가 컴파일 시점에 검사받아야 하기 때문이다.
 */
export const iDB테이블s = [
  'assets', 'basics', 'boards', 'characters', 'design-templates',
  'events', 'fees', 'grade-conditions', 'grades', 'gradings',
  'member-comments', 'member-entity-historys', 'member-fees',
  'member-gradings', 'member-posts', 'member-status-historys', 'members',
  'memos', 'menus', 'payments', 'per-gradings', 'resources', 'roles',
  'tag-links', 'tags',
  // `users`는 로그인 계정(`model사용자s`). 신원은 `auth.users`에 있고 이 표는 회원과의 연결이다.
  // `tables`는 등록부 자신 — 빠지면 `enforce`에서 등록부를 못 읽어 캐시 축이 통째로 죽는다.
  // `table-counts`는 등록부 위에 세운 **뷰**라 등록부에 행이 없다(`model테이블s.뷰이름s`).
  // 그래도 `api-guard`는 경로에서 이름을 뽑으므로 권한을 요구한다 — 빠지면 `enforce`에서
  // 대시보드와 관리자 유도(`do빈표확인`)가 같이 죽는다.
  'users', 'tables', 'table-counts',
  // 신청 세트(`enrolls/`). 콘텐츠 5 + 신청받기(회차)·신청 2. 문항·응답은 jsonb 라 표가 없다.
  'surveys', 'quizzes', 'polls', 'classes', 'occasions',
  'enrollables', 'enrolls',
  // v2 축(`models/v2`·`models/persona`). `/api/v0`로 가지만 `api-guard`의 정규식은 v0도 덮으므로,
  // 여기 없으면 그 표에 대한 권한을 **줄 방법이 아예 없다**(= `enforce` 승격이 막힌다).
  'docs', 'records', 'samples', 'fruits', 'animals', 'vegetables', 'theme', 'eras', 'places'
] as const
export type iDB테이블 = typeof iDB테이블s[number]

/**
 * `readPublic` = 전체 읽기는 없지만 공개 필드만은 읽을 수 있음(`공개필드s.ts`).
 * 클라이언트가 조인하는 구조라 "읽기 금지"로는 화면이 깨져서, 거부 대신 축소하는 축이 필요하다.
 */
export const i액션s = ['create', 'read', 'readPublic', 'readOwn', 'update', 'delete'] as const
export type i액션 = typeof i액션s[number]

/**
 * 표 이름은 **런타임에 정해진다**(등록부). 그래서 앞자리는 `string`이고, 뒤의 액션만 닫혀 있다.
 *
 * 예전엔 `${iDB테이블}:${i액션}`이라 앞자리도 검사됐는데, 그 검사가 지켜준 건 *손으로 적은
 * 목록과 일치하는가*였지 *DB에 그 표가 있는가*가 아니었다 — 그 목록이 틀린 동안 타입은
 * 조용히 통과시켰다. 틀린 걸 검사하느니 안 하는 편이 낫다. 액션은 진짜로 닫힌 집합이라 남긴다.
 */
export type 권한key = `${string}:${i액션}`

/** 손으로 적은 목록으로 만든 선택지. 등록부가 비었을 때만 쓴다. */
const 기본권한keyOptions: { label: string, value: 권한key }[] = iDB테이블s.flatMap(table =>
  i액션s.map(action => ({ label: `${table} : ${action}`, value: `${table}:${action}` as 권한key }))
)

/**
 * 역할 편집 폼의 `권한` 선택지. 표 × 액션 전개.
 *
 * 표 이름은 **등록부(`model테이블s`)가 정본**이다. 등록부가 아직 비어 있으면(= `tables` 표를
 * 안 만들었거나 조회 실패) 손으로 적은 목록으로 떨어진다 — 빈 선택지를 내놓지 않기 위해서다.
 * 부르는 쪽이 `model테이블s.reads()`를 먼저 해야 정본이 잡힌다(`roles` 화면이 그렇게 한다).
 */
export const do권한key옵션s = (): { label: string, value: 권한key }[] => {
  const 이름s = model테이블s.getInstance().이름s
  if (이름s.length === 0) return 기본권한keyOptions
  return [...이름s].sort().flatMap(table =>
    i액션s.map(action => ({ label: `${table} : ${action}`, value: `${table}:${action}` as 권한key }))
  )
}

export interface i역할dto extends BaseXXDto {

  code: i역할코드 // permission: 'guest' | 'learner' | 'manager' | 'admin';// i역할권한맵;
  color: i역할색상
  icon: string | null
  label: string
  labelEn: string
  description: string | null // 되도록 ?로 하지말고. null로 넣어.
  isDefault: boolean
  thumbnail: string | null
  permissions: 권한key[]

  menuDirectory: i폴더s
}

export interface i역할 extends BaseXX {
  stateCode: i역할코드
  색상: i역할색상
  아이콘: string | null
  이름: string
  영문명: string
  소개: string | null
  is기본옵션: boolean
  이미지: string | null

  회원s: model회원[]
  회원수: number
  권한s: 권한key[]

  메뉴순서: i폴더s
  readonly 접근가능메뉴s: model메뉴[]

}

/**
 * 시드 한 행. PK가 없고, `menuDirectory`가 메뉴를 **code로** 가리킨다.
 *
 * `menuDirectory`는 jsonb라 DB가 FK로 안 잡아준다 — 예전엔 메뉴 PK(`'1013'`)를 적어뒀는데,
 * 서버가 매긴 id와 어긋나자 `useNavs.resolveEntry`의 `tableById`가 전부 null을 받아
 * **GNB가 통째로 비었다**(에러 한 줄 없이). code는 `seed해소`가 실제 PK로 바꿔 넣는다.
 */
export type i역할시드 = Omit<i역할dto, 'id'>

export class model역할s extends BaseModels2<model역할, i역할dto, i역할시드> {
  protected etcFields = []

  /**
   * 시드 `menuDirectory`의 **메뉴 code**를 실제 메뉴 PK로 바꾼다.
   *
   * `useNavs.resolveEntry`가 이 배열의 id로 `model메뉴s.getById`를 친다. 못 찾으면 그 항목을
   * 통째로 버리므로, 어긋나면 **GNB가 조용히 빈다** — 에러도 로그도 없다. jsonb라 DB도 못 잡는다.
   * 그래서 메뉴를 먼저 만들고(`useSystem`의 순서), 거기서 남은 `시드PK` 등록부로 여기서 잇는다.
   *
   * 폴더의 `id`(작은 정수)는 폴더 자체 식별자라 건드리지 않는다 — `children` 유무로 가른다.
   * 구분선(`is구분선`)도 그대로 통과시킨다.
   */
  protected override async seed해소(rows: i역할dto[]): Promise<i역할dto[]> {
    const 못찾은: string[] = []

    const 풀기 = (entries: unknown[]): unknown[] => entries.flatMap((entry): unknown[] => {
      if (typeof entry === 'string' || typeof entry === 'number') {
        const pk = 시드PK.찾기('menus', String(entry))
        if (!pk) { 못찾은.push(String(entry)); return [] }
        return [pk]
      }
      if (!entry || typeof entry !== 'object') return []

      const o = entry as Record<string, unknown>
      if (o.is구분선) return [o]
      if (Array.isArray(o.children)) return [{ ...o, children: 풀기(o.children) }]

      const pk = 시드PK.찾기('menus', String(o.id ?? ''))
      if (!pk) { 못찾은.push(String(o.id)); return [] }
      return [{ ...o, id: pk }]
    })

    const out = rows.map((row) => {
      const md = (row as unknown as { menuDirectory?: unknown[] }).menuDirectory
      if (!Array.isArray(md)) return row
      return { ...row, menuDirectory: 풀기(md) } as unknown as i역할dto
    })

    if (못찾은.length) {
      console.warn(`[역할 seed] menuDirectory에서 못 찾은 메뉴 code: ${[...new Set(못찾은)].join(', ')}`
        + ` — 메뉴를 먼저 시드해야 한다(useSystem의 순서).`)
    }
    return out
  }

  static getInstance = () => getRepoInstance('model역할s', () => new model역할s())

  private constructor() {
    super(model역할, 'roles')
  }

  // baseModel2로 보내는거..
  get 메뉴() { return model메뉴s.getInstance().getBy테이블명(this.tableName) }

  override async reads() {
    return super.reads()
  }

  _기본역할 = computed(() => toValue(this.list).find(row => row.is기본옵션)!)
  get기본역할 = (): model역할 => toValue(this._기본역할)

  override _generate = () => new model역할().generate()
  override _init = () => new model역할().init()
  protected override seed = i역할seed
  options = computed(() => toValue(this.list).map(row => ({ label: row.label, icon: row.icon, value: row.stateId })))
  optionsByCode = computed(() => toValue(this.list).map(row => ({ label: row.label, icon: row.icon, value: row.stateCode })))
  getByCode = (code: i역할코드 | string) => toValue(this.list).find(row => row.stateCode === code) ?? null
}

export class model역할 extends BaseModel2<i역할dto> implements i역할 {
  constructor(state?: i역할dto) {
    super(model역할s.getInstance(), state)
  }

  override afterCreate = () => { }
  override beforeSave = () => true
  override afterSave = () => { }

  override 자동필드ss = [
    {
      label: '기본',
      list: [
        { key: '이름', label: '이름' },
        { key: '영문명', label: '영문명' },
        { key: '색상', label: '색상', type: 타입지정.선택0, options: i역할색상options, props: { type: 'radio' } },
        { key: '아이콘', label: '아이콘', type: 타입지정._.아이콘 },
        { key: 'is기본옵션', label: '기본값', type: 타입지정.선택0, options: is기본옵션options as any }

      ]
    },
    {
      label: '상세', config: { ratio: 30 },
      list: [
        { key: '이미지', label: '썸네일', is한줄: false, type: 타입지정.이미지2 },
        { key: '소개', label: '소개', type: 타입지정._.문자, props: { is여러줄: true }, is한줄: false }
      ]
    },
    {
      label: '회원', config: { ratio: 30 },
      show: computed(() => this.stateCode != 'guest'),
      list: [

        // 회원(현재)
        { key: '회원s', label: '회원', type: 타입지정._.카드s, is한줄: false, props: { do빈생성: () => { }, show탭: false } }
      ]
    },
    {
      label: 'API 권한', config: { ratio: 30 },
      list: [
        // 화면 접근이 아니라 `/api/{v}/{테이블}` 호출 권한. 화면은 `메뉴.접근역할codes`가 정한다.
        { key: '권한s', label: '테이블 권한', type: 타입지정.선택s, is한줄: false, options: computed(() => do권한key옵션s()) }
      ]
    }
  ]

  override 자동버튼s = this.기본버튼s.concat([
    {
      key: 'do메뉴관리',
      label: '메뉴관리',
      icon: 'i-healthicons:ui-menu-grid-outline',
      show: computed(() => true),
      onClick: () => {
        this.do메뉴관리()
      }
    }
  ])

  override generate() {
    return this.init()
  }

  override init() {
    return {
      code: 'associate' as i역할코드,
      color: 'primary' as i역할색상,
      icon: 'i-lucide-user',
      thumbnail: null,
      label: '역할명',
      labelEn: 'Role Name',
      description: '역할 설명',
      isDefault: false,
      permissions: [] as 권한key[],
      menuDirectory: [] as i폴더s
    }
  }

  override get label() { return this.이름 }
  override get sub() { return this.영문명 }// `역할`;
  get stateCode(): i역할코드 {
    const v = this.state?.code
    if (v === 'guest' || v === 'learner' || v === 'manager' || v === 'admin' || v === 'associate') return v
    return 'guest'
  }

  set stateCode(v: i역할코드) {
    if (!this.state) return
    this.state.code = v
  }

  get 이름() { return this.state.label }
  set 이름(v) { this.state.label = v }
  get 영문명() { return this.state.labelEn }
  set 영문명(v) { this.state.labelEn = v }
  get 색상() { return this.state.color }
  set 색상(v) { this.state.color = v }
  get 아이콘() { return this.state.icon }
  set 아이콘(v) { this.state.icon = v }
  get 소개() { return this.state.description }
  set 소개(v) { this.state.description = v }
  get 이미지() { return this.state.thumbnail }
  set 이미지(v) { this.state.thumbnail = v }

  get is기본옵션() { return this.state.isDefault }
  set is기본옵션(v) {
    if (v && confirm('바로 적용됩니다. 수정하시겠습니까?')) {
      const 기존item = toValue(model역할s.getInstance().list).find(x => x.is기본옵션)
      기존item!.state.isDefault = false
      this.state.isDefault = v
      this.repo.do모두저장()
    }
  }

  get 회원s() { return model회원이력s.getInstance().get회원sBy역할(this) }

  get 회원수() { return this.회원s.length }

  get 메뉴순서(): i폴더s { return this.state?.menuDirectory ?? [] }
  set 메뉴순서(v: i폴더s) { if (!this.state) return; this.state.menuDirectory = v }

  get 권한s() { return (this.state?.permissions ?? []) as 권한key[] }
  set 권한s(v: 권한key[]) { if (!this.state) return; this.state.permissions = v }

  get 접근가능메뉴s() { return model메뉴s.getInstance().getBy역할(this) }

  _badges = computed(() => [{ label: `회원 ${this.회원수}`, color: this.회원수 > 0 ? 'primary' : 'neutral' }])
  override get badges() { return toValue(this._badges) }

  do메뉴관리 = async () => {
    const items = this.접근가능메뉴s.map(x => ({ id: x.stateId, label: x.label, icon: x.icon }))
    const folders = this.메뉴순서.length > 0 ? this.메뉴순서 : [...items.map(x => x.id)]

    useModalDragDrop().open({
      title: '순서 정렬',
      folders, items

    }).then((result) => {
      if (!result) return

      result.items.forEach((x) => {
        const 메뉴 = model메뉴s.getInstance().getById(x.id)
        if (!메뉴 || 메뉴.label === x.label) return
        메뉴.이름 = x.label
      })

      this.메뉴순서 = result!.folders
      this.do저장()
      model메뉴s.getInstance().do모두저장()
    })
  }
}

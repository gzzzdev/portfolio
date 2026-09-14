import { BaseModels2, BaseModel2, 타입지정, getRepoInstance, 시드PK } from '~utils/models'
import type { BaseXX, BaseXXDto } from '~utils/models'
import { computed, toValue } from 'vue'
import { model역할, model역할s, type i역할코드 } from './model역할'
import { model게시판s, type model게시판 } from './model게시판'
import { model테이블s, type model테이블 } from '~models/(system)/model테이블'
import { i역할seed, i메뉴seed } from '../seeds'
import type {
  i메뉴상태,
  i메뉴보기모드
} from './model메뉴.shared'

export {
  i메뉴공개options,
  i메뉴보기모드options,
  type i메뉴상태,
  type i메뉴보기모드
} from './model메뉴.shared'

/** GNB 모드(=역할코드). */
export type i메뉴권한 = i역할코드
export const i메뉴권한options = [
  { label: '운영자', value: 'admin' },
  { label: '담당자', value: 'manager' },
  { label: '학습자', value: 'learner' },
  { label: '준회원', value: 'associate' },
  { label: '비회원', value: 'guest' }
] as const

export interface i폴더sdto {
  id?: string | number
  label: string
  children: Array<string | number>
}
export type i폴더레이아웃아이템dto = i폴더sdto | string | number

interface i집합 {
  세는단위: string
}
/**
 * 이 메뉴가 다루는 DB 테이블의 메타. `name`은 `BaseModels2.tableName`과 1:1로 대응한다.
 */
export interface iDB테이블dto {
  name: string
  viewMode: i메뉴보기모드
  isHierarchy: boolean
  세는단위: string
  folders: i폴더레이아웃아이템dto[]
}

/** 메뉴는 셋 중 하나다 — 일반 페이지 / DB 테이블 화면 / 게시판. */
export const i메뉴종류options = [
  { label: '페이지', value: 'PAGE', icon: 'i-material-symbols-light:space-dashboard-outline' },
  { label: '테이블', value: 'TABLE', icon: 'i-ph:table-light' },
  { label: '게시판', value: 'BOARD', icon: 'i-ph:list-bullets-light' }
] as const
export type i메뉴종류 = (typeof i메뉴종류options)[number]['value']

/**
 * 메뉴가 여는 대상. `kind` 하나로 판별되고, 종류별 데이터는 그 안에만 있다.
 * 필드를 하나로 묶은 이유: `dbTable`·`boardId`를 나란히 두면 "둘 다 채워진 메뉴"가 만들어질 수 있고,
 * 이 메뉴가 무엇인지 알려면 두 필드를 다 봐야 한다.
 */
export type i메뉴대상dto
  = | { kind: 'PAGE' }
    | { kind: 'TABLE', dbTable: iDB테이블dto }
    | { kind: 'BOARD', boardId: string }

/**
 * 시드 한 행. **PK가 없고, 게시판을 `boardCode`로 가리킨다.**
 *
 * `target`은 jsonb 열이라 DB가 FK로 잡아주지 않는다 — 예전처럼 `boardId: '1001'`을 박아두면
 * 서버가 매긴 PK와 어긋나도 **아무 에러 없이** 메뉴만 빈 게시판을 가리킨다.
 * `code`는 서버도 화면도 안 바꾸므로 `model메뉴s.seed해소`가 그걸로 실제 PK를 찾아 넣는다.
 * (슬러그는 안 된다 — `set 슬러그`로 편집되는 값이다.)
 */
export type i메뉴시드 = Omit<i메뉴dto, 'id' | 'target'> & {
  /** 시드가 이 메뉴를 가리키는 이름. `역할.menuDirectory`가 이걸로 순서를 적는다. DB엔 안 들어간다. */
  code: string
  target: Exclude<i메뉴대상dto, { kind: 'BOARD' }> | { kind: 'BOARD', boardCode: string }
}

export interface i메뉴dto extends BaseXXDto {

  title: string
  icon?: string
  path: string
  status?: i메뉴상태
  children?: i메뉴dto[]

  isSystem?: boolean

  accessRoleCodes: i역할코드[]

  /** 이 메뉴가 여는 대상. 페이지 / 테이블 / 게시판 중 정확히 하나. */
  target: i메뉴대상dto
}

/** `target`으로 올리기 전의 구조들. 마이그레이션에서만 참조한다. */
type i메뉴dto레거시 = Omit<i메뉴dto, 'target'> & {
  target?: i메뉴대상dto
  /** 1세대: 평면 필드 / 2세대: `dbTable`+`board`(인라인) / 3세대: `dbTable`+`boardId` */
  dbTable?: iDB테이블dto | null
  isHierarchy?: boolean
  viewMode?: i메뉴보기모드
  isBoard?: boolean
  pageIntro?: { eyebrow: string, title: string, description: string } | null
  /** 메뉴 안에 인라인으로 들어있던 게시판/게시판 참조. 이제 `boards`가 소유하고 `boards.menuId`로 메뉴를 가리킨다. */
  board?: { pageIntro?: unknown } | null
  boardId?: string | null
  folders?: i폴더레이아웃아이템dto[] | null
  theSet?: i집합
}

export interface i메뉴 extends BaseXX {
  이름: string
  아이콘: string
  경로: string
  종류: i메뉴종류
  테이블명: string
  isDB테이블: boolean
  is게시판: boolean
  게시판Id: string
  공개: i메뉴상태
  is계층: boolean
  보기모드: i메뉴보기모드
  폴더s: i폴더레이아웃아이템dto[]

  모델: BaseModel2<any>

  is시스템: boolean

  집합: i집합

  readonly 게시판: model게시판 | null
  readonly 접근역할s: model역할[]
}

const 메뉴정렬기준경로 = '/admin/menus'
const 기본보기모드: i메뉴보기모드 = '목록'

const to메뉴id = (value: unknown): string => String(value ?? '').trim()
const is폴더레이아웃객체 = (item: i폴더레이아웃아이템dto | null | undefined): item is i폴더sdto =>
  typeof item === 'object' && item !== null && Array.isArray(item.children)

const 메뉴레이아웃순서맵 = (folders?: i폴더레이아웃아이템dto[] | null): Map<string, number> => {
  const map = new Map<string, number>()
  let nextIndex = 0
  for (const item of folders ?? []) {
    if (is폴더레이아웃객체(item)) {
      for (const childId of item.children ?? []) {
        const id = to메뉴id(childId)
        if (!id || map.has(id)) continue
        map.set(id, nextIndex)
        nextIndex += 1
      }
      continue
    }

    const id = to메뉴id(item)
    if (!id || map.has(id)) continue
    map.set(id, nextIndex)
    nextIndex += 1
  }
  return map
}

/** 경로의 마지막 칸이 표 이름이다 — 첫 칸은 서브도메인(`/admin/members` → `members`). */
const 테이블명from경로 = (path: string): string => String(path ?? '').replace(/\/+$/, '').split('/').pop() ?? ''

/**
 * 이전 세대 dto를 `target` 유니온으로 올린다. 이미 올라간 dto는 건드리지 않는다.
 * - `boardId`가 있으면 게시판, `dbTable`이 있으면 테이블, 나머지는 페이지.
 * - 인라인 `board`(2세대)는 되살리지 않는다. 게시판 본문은 `boards` 테이블이 소유하고,
 *   연결은 `boardId`가 들고 있어야 하기 때문. 링크가 없으면 페이지로 떨어진다.
 */
export const 정규화메뉴dto = (dto: i메뉴dto레거시): i메뉴dto => {
  if (dto.target === undefined) {
    const 게시판id = String(dto.boardId ?? '').trim()
    if (게시판id) dto.target = { kind: 'BOARD', boardId: 게시판id }
    else if (dto.dbTable)
      dto.target = { kind: 'TABLE', dbTable: dto.dbTable }
    else if (dto.dbTable === undefined && !dto.isBoard)
      // 1세대 평면 dto: 테이블 화면인지 알 수 없어 일단 테이블로 본다.
      // 실제 repo가 없는 이름은 `getBy테이블명`에서 매칭되지 않으므로 무해하다.
      dto.target = {
        kind: 'TABLE',
        dbTable: {
          name: 테이블명from경로(dto.path),
          viewMode: dto.viewMode ?? 기본보기모드,
          isHierarchy: dto.isHierarchy ?? false,
          세는단위: dto.theSet?.세는단위 ?? '개',
          folders: dto.folders ?? []
        }
      }
    else dto.target = { kind: 'PAGE' }
  }

  delete dto.dbTable
  delete dto.boardId
  delete dto.isHierarchy
  delete dto.viewMode
  delete dto.isBoard
  delete dto.pageIntro
  delete dto.board
  delete dto.folders
  delete dto.theSet
  return dto as i메뉴dto
}

export class model메뉴s extends BaseModels2<model메뉴, i메뉴dto, i메뉴시드> {
  /** `code`는 시드 전용 이름이라 서버로 보내지 않는다 — `시드PK` 등록부에만 남는다. */
  protected etcFields = ['code']
  override 필터조건ss = [
    this.라디오필터그룹(
      i역할seed.map(item => ({ ...item, value: item.code, match: (a: model메뉴) => a.접근역할s.some(x => x.stateCode === item.code) })),
      { title: '메뉴(역할)', initialValues: 'admin' }
    ),
    this.라디오필터그룹(
      i메뉴종류options.map(item => ({ ...item, match: (a: model메뉴) => a.종류 === item.value })),
      { title: '종류' }
    )
  ]

  override 정렬조건s = [

    { label: '최신', value: '최신', func: (a: any, b: any) => (b?.id ?? b?.state?.id ?? 0) - (a?.id ?? a?.state?.id ?? 0) },
    { label: '제목↑', value: '제목↑', func: (a: any, b: any) => String(a?.label ?? '').localeCompare(String(b?.label ?? '')) },
    { label: '부제↑', value: '부제↑', func: (a: any, b: any) => String(b?.sub ?? '').localeCompare(String(a?.sub ?? '')) }
  ]

  static getInstance = () => getRepoInstance('model메뉴s', () => new model메뉴s())

  private constructor() {
    super(model메뉴, 'menus')
  }

  // _메뉴 = computed(() => toValue(model메뉴s.getInstance().list).find(x=>x.경로.includes('menus')) ?? null);
  // get 메뉴() { return toValue(this._메뉴) }
  get 메뉴() { return this.getBy테이블명(this.tableName) }

  /** 레거시 dto가 섞여 들어와도 게터가 한 갈래만 보도록, 읽은 직후 구조를 올린다. */
  private do구조마이그레이션() {
    for (const dto of this._list.value as i메뉴dto레거시[]) {
      if (!dto || (dto.target !== undefined && dto.dbTable === undefined && dto.board === undefined && dto.boardId === undefined)) continue
      정규화메뉴dto(dto)
    }
  }

  override async reads(isBrief = false, force = false) {
    const result = await super.reads(isBrief, force)
    this.do구조마이그레이션()
    return result
  }

  getBy역할(역할: model역할): model메뉴[] {
    return this.list.value.filter(menu => menu.접근역할codes?.includes(역할.stateCode))
  }

  getByPath(path: string): model메뉴 | null {
    return this.list.value.find(menu => menu.경로 === path) ?? null
  }

  getBy경로 = (path: string): model메뉴 | null =>
    toValue(this.list).find(table => table.경로.includes(path) || path.includes(table.경로)) ?? null

  /** `BaseModels2.tableName`과 정확히 일치하는 메뉴. 경로 부분매칭을 대체한다. */
  getBy테이블명 = (tableName: string): model메뉴 | null =>
    toValue(this.list).find(menu => menu.isDB테이블 && menu.테이블명 === tableName) ?? null

  /** 이 게시판을 여는 메뉴. 게시판은 메뉴 없이도 존재할 수 있으므로 `null`일 수 있다. */
  getBy게시판 = (boardId: string): model메뉴 | null => {
    const id = String(boardId ?? '').trim()
    if (!id) return null
    return toValue(this.list).find(menu => menu.게시판Id === id) ?? null
  }

  /** 게시판을 걸 수 있는 메뉴 = 테이블 화면이 아닌 메뉴. `model게시판`의 `노출 메뉴` 옵션. */
  get게시판가능메뉴s = (): model메뉴[] =>
    toValue(this.list).filter(menu => !menu.isDB테이블)

  // _메뉴 = computed(() => toValue(model메뉴s.getInstance().list).find(x => x.경로.includes('roles')) ?? null);
  // get 메뉴() { return toValue(this._메뉴) }

  get폴더sByPath(path: string): i폴더레이아웃아이템dto[] | null {
    return this.getByPath(path)?.폴더s ?? null
  }

  set폴더sByPath(path: string, folders: i폴더레이아웃아이템dto[]): boolean {
    const menu = this.getByPath(path)
    if (!menu) return false
    menu.폴더s = folders
    return true
  }

  get레이아웃순서(target: model메뉴 | i메뉴dto | null | undefined, path = 메뉴정렬기준경로): number {
    if (!target) return Number.MAX_SAFE_INTEGER
    const id = to메뉴id((target as model메뉴)?.stateId ?? (target as i메뉴dto)?.id)
    if (!id) return Number.MAX_SAFE_INTEGER
    const orderMap = 메뉴레이아웃순서맵(this.get폴더sByPath(path))
    if (orderMap.has(id)) return orderMap.get(id) as number
    return Number.MAX_SAFE_INTEGER
  }

  override _generate = () => new model메뉴().generate()
  override _init = () => new model메뉴().init()
  protected override seed = i메뉴seed

  /**
   * 시드의 `target.boardCode`를 실제 게시판 PK로 바꾼다. 게시판이 먼저 있어야 하므로 여기서 읽는다.
   *
   * `target`은 jsonb라 **DB가 FK로 안 잡아준다** — 못 찾은 채 넣으면 에러 없이 메뉴만 빈 게시판을
   * 가리킨다. 그래서 못 찾으면 `PAGE`로 떨어뜨리고 경고를 남긴다: 링크가 죽은 메뉴보다 낫다.
   */
  protected override async seed해소(rows: i메뉴dto[]): Promise<i메뉴dto[]> {
    return rows.map((row) => {
      const target = row.target as i메뉴대상dto | { kind: 'BOARD', boardCode?: string } | undefined
      if (!target || target.kind !== 'BOARD') return row

      const code = (target as { boardCode?: string }).boardCode
      const boardId = code ? 시드PK.찾기('boards', code) : null
      if (!boardId) {
        console.warn(`[메뉴 seed] 게시판 code '${code}'를 못 찾음 — PAGE로 떨어뜨린다`)
        return { ...row, target: { kind: 'PAGE' } } as i메뉴dto
      }
      return { ...row, target: { kind: 'BOARD', boardId } } as i메뉴dto
    })
  }
}

export class model메뉴 extends BaseModel2<i메뉴dto> implements i메뉴 {
  constructor(state?: i메뉴dto) {
    super(model메뉴s.getInstance(), state)
  }

  override 자동필드ss = [
    {
      label: '기본',
      list: [

        { key: '이름', label: '이름', show: true },
        { key: '아이콘', label: '아이콘', type: 타입지정._.아이콘 },

        { key: '경로', label: '경로', show: true, canEdit: false },
        {
          key: '종류',
          label: '종류',
          type: 타입지정.선택0,
          // 게시판 자리로 만드는 건 게시판 화면(`model게시판`의 `노출 메뉴`)에서만 한다.
          // 여기서 BOARD를 고를 수 있게 하면 게시판이 안 붙은 빈 게시판 메뉴가 생긴다.
          options: computed(() =>
            this.is게시판 ? i메뉴종류options : i메뉴종류options.filter(x => x.value !== 'BOARD')
          ),
          canEdit: computed(() => !this.is게시판),
          show: true
        },
        {
          key: '게시판명',
          label: '연결 게시판',
          canEdit: false,
          show: computed(() => this.is게시판)
        },
        { key: 'is계층', label: '계층', canEdit: false, type: 타입지정._.is체크, show: computed(() => this.isDB테이블), options: [
          { icon: 'i-ph:list-bullets-light', label: '계층', value: true as any },
          { icon: 'i-ph:list-bullets-light', label: '비계층', value: false as any }

          // 순서
          // 계층
          // 고정
        ] as any },

        { key: '세는단위', label: '세는단위', type: 타입지정._.문자, show: computed(() => false) },

        { key: '접근역할codes', canEdit: !false, label: '접근 역할', type: 타입지정.선택s, show: true, options: computed(() => model역할s.getInstance().optionsByCode) }
      ]
    }
  ]

  override 자동버튼s = this.기본버튼s.concat([])

  bindModel = null as any
  override afterCreate = () => { }
  override beforeSave = () => {
    // 게시판 메뉴의 경로는 게시판 슬러그에서 파생된다(`get 경로`). 저장할 때 실제 값도 맞춰 둔다.
    const 파생경로 = this.게시판?.경로 ?? ''
    if (파생경로 && this.state && this.state.path !== 파생경로) this.state.path = 파생경로
    return true
  }

  override afterSave = () => { }

  override generate() {
    return {
      ...this.init()
    }
  }

  override init(): i메뉴dto {
    return {
      id: '',
      createdAt: new Date(),
      title: '',
      icon: 'i-lucide-layout-grid',
      path: '/',
      status: 'PUBLISHED',
      isSystem: false,
      accessRoleCodes: [],
      target: {
        kind: 'TABLE',
        dbTable: { name: '', viewMode: 기본보기모드, isHierarchy: false, 세는단위: '개', folders: [] }
      }
    }
  }

  override get sub() { return this.경로 }

  get 이름() { return this.state?.title ?? '' }
  set 이름(v: string) { if (!this.state) return; this.state.title = v }

  /** 게시판 메뉴면 게시판 슬러그에서 파생한다 — 경로의 출처를 한 곳으로 둔다. */
  get 경로() { return this.게시판?.경로 || (this.state?.path ?? '') }
  set 경로(v: string) { if (!this.state) return; this.state.path = v }

  get 아이콘() { return this.state.icon }
  set 아이콘(v) { this.state.icon = v }

  get is메뉴공개() {
    return this.공개 === 'PUBLISHED'
  }

  get 공개() { return (this.state?.status ?? 'PUBLISHED') as i메뉴상태 }
  set 공개(v: i메뉴상태) { if (!this.state) return; this.state.status = v }

  /** 이 메뉴가 여는 대상. `종류` 하나로 판별한다. */
  get 대상(): i메뉴대상dto { return this.state?.target ?? { kind: 'PAGE' } }

  get 종류(): i메뉴종류 { return this.대상.kind }
  set 종류(v: i메뉴종류) {
    if (!this.state || v === this.종류) return
    // 게시판 연결/해제는 `model게시판.노출메뉴Id`가 `do게시판연결`로 한다. 여기선 못 만든다.
    if (v === 'BOARD') return
    this.state.target = v === 'TABLE'
      ? {
          kind: 'TABLE',
          dbTable: {
            name: 테이블명from경로(this.state.path),
            viewMode: 기본보기모드,
            isHierarchy: false,
            세는단위: '개',
            folders: []
          }
        }
      : { kind: 'PAGE' }
  }

  /** 이 메뉴가 다루는 DB 테이블의 메타. 테이블 메뉴가 아니면 `null`. */
  get db테이블() { const 대상 = this.대상; return 대상.kind === 'TABLE' ? 대상.dbTable : null }
  get isDB테이블() { return this.종류 === 'TABLE' }

  get is게시판() { return this.종류 === 'BOARD' }
  get 게시판Id() { const 대상 = this.대상; return 대상.kind === 'BOARD' ? String(대상.boardId ?? '') : '' }
  get 게시판(): model게시판 | null {
    const id = this.게시판Id
    if (!id) return null
    return model게시판s.getInstance().getById(id) ?? null
  }

  get 게시판명() { return this.게시판?.이름 ?? '' }

  /** 게시판 화면에서만 호출한다(`model게시판.노출메뉴Id` 세터). 이 메뉴를 그 게시판의 자리로 만든다. */
  do게시판연결 = (boardId: string) => {
    const id = String(boardId ?? '').trim()
    if (!this.state || !id) return
    this.state.target = { kind: 'BOARD', boardId: id }
  }

  do게시판연결해제 = () => {
    if (!this.state || !this.is게시판) return
    this.state.target = { kind: 'PAGE' }
  }

  /** 테이블 메뉴가 아니면 쓰기를 흘려보낸다(빈 객체 반환) — 종류가 조용히 바뀌지 않게. */
  private ensureDB테이블(): iDB테이블dto {
    const 빈값: iDB테이블dto = { name: '', viewMode: 기본보기모드, isHierarchy: false, 세는단위: '개', folders: [] }
    return this.db테이블 ?? 빈값
  }

  get 테이블명() { return this.db테이블?.name ?? '' }
  set 테이블명(v: string) { this.ensureDB테이블().name = v }

  /**
   * **정본은 표 등록부(`model테이블`)다.** 계층은 *데이터 모양*이지 화면 설정이 아니다 —
   * 메뉴를 두 개 달아도 `menus` 행이 부모-자식을 갖는다는 사실은 안 변한다.
   *
   * 링크는 **이름**으로 건다. `target`은 jsonb라 DB가 FK로 안 잡아주고, 예전에 여기 서버 PK를
   * 박아뒀다가 배정된 값과 어긋나 GNB가 통째로 빈 적이 있다(위 `target` 머리말). 이름은 안 변한다.
   *
   * 등록부에 행이 없으면(초기데이터 전, 조회 실패) **예전 자리(jsonb)로 떨어진다** — 옮기는 동안
   * 화면이 안 깨지게 하려는 것이고, 그래서 setter 도 그대로 jsonb 에 쓴다. 폼에서는 읽기전용이다.
   */
  get is계층() { return this.표?.is계층 ?? this.db테이블?.isHierarchy ?? false }
  set is계층(v: boolean) { this.ensureDB테이블().isHierarchy = Boolean(v) }

  /** 이 메뉴가 다루는 표의 등록부 행. DB 테이블 메뉴가 아니면 `null`. */
  get 표(): model테이블 | null {
    const name = this.db테이블?.name
    return name ? model테이블s.getInstance().getBy이름(name) : null
  }

  get 보기모드() { return (this.db테이블?.viewMode ?? 기본보기모드) as i메뉴보기모드 }
  set 보기모드(v: i메뉴보기모드) { this.ensureDB테이블().viewMode = v }

  get 모델(): BaseModel2<any> { return this }

  get is시스템() { return Boolean(this.state?.isSystem) }
  set is시스템(v: boolean) { if (!this.state) return; this.state.isSystem = Boolean(v) }

  // 여긴 폴더s는 readonly. 실제 modelXX의 폴더s 바인딩하는 역할 뿐.
  get 폴더s() { return this.db테이블?.folders ?? [] }
  set 폴더s(_list: any[]) { this.ensureDB테이블().folders = _list }

  get 집합(): i집합 { return { 세는단위: this.세는단위 } }
  set 집합(v: i집합) { this.세는단위 = v?.세는단위 ?? '개' }

  /** `is계층`과 같다 — 정본은 등록부, 없으면 옛 자리. 회원은 어느 화면에서 세든 '명'이다. */
  get 세는단위() { return this.표?.세는단위 ?? this.db테이블?.세는단위 ?? '개' }
  set 세는단위(v: string) { this.ensureDB테이블().세는단위 = v }

  get 접근역할codes() { return this.state?.accessRoleCodes ?? [] }
  set 접근역할codes(v: i역할코드[]) { if (!this.state) return; this.state.accessRoleCodes = v }
  get 접근역할s() {
    return (this.state?.accessRoleCodes ?? [])
      .map(code => model역할s.getInstance().getByCode(code))
      .filter((x): x is model역할 => x != null)
  }
}

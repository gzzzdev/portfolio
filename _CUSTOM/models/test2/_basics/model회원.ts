import { computed, toValue, type ComputedRef } from 'vue'
import { BaseModels2, BaseModel2, 타입지정, type BaseXXDto, type BaseXX, type i요약타일, getRepoInstance, hasServerPk } from '~utils/models'
import { mDayjs, generateName2, randomDate, type i날짜 } from '~utils'
import { model역할s, type model역할, type i역할코드, model메뉴s, model회원이력s, type model회원이력, type model회원관계이력 } from './'
// model회원관계이력s, model회원상태이력s
import { model등급s, type model등급 } from '../grades'
import { i등급seed, i역할seed, i회원seed } from '../seeds'
import { model회원댓글s, type model회원댓글 } from './model회원댓글'
import { model회원게시글s, type model회원게시글 } from './model회원게시글'
import { model회원회비s, type model회원회비 } from '../payments/model회원회비'
import { model신청s, type model신청 } from '~models/test2'

import { model디자인틀s, to디자인틀, 인쇄폭, 미리보기폭, 조직, 증명문구, type i주입, type i용도 } from '../designs'
import { buildQrVerifyUrl } from '~utils'

import { useMyAuthStore } from '~/stores/useMyAuthStore'
// import { storeToRefs } from "pinia"; //이건 ssr 단계에서 에러인듯.
const is관리자 = computed(() => toValue(useMyAuthStore()?.is관리자))
/** 담당자도 처리(등급·신청)는 한다 — 할 수 있는지는 역할 권한이, 누구에게인지는 담당 화면이 정한다. */
const is처리자 = computed(() => toValue(useMyAuthStore()?.is관리자) || toValue(useMyAuthStore()?.is담당자))

export type i회원성별 = 'MALE' | 'FEMALE'
/** 스냅샷 diff 표시용 — state(영문) 키 → 한글 라벨 */
export const i회원state라벨: Record<string, string> = {
  name: '이름',
  birthdate: '생년월일',
  gender: '성별',
  thumbnail: '이미지',
  currentMemberFeeId: '현재회비id',
  isSleeping: '잠자는중',
  phone: '연락처',
  isGuest: '비회원',
  managerId: '담당자'
  // id, createAt은 예외
}

export interface i회원dto extends BaseXXDto {
  name: string
  birthdate: Date | string | null
  gender: i회원성별
  thumbnail: string | null
  currentMemberFeeId: string | null
  hp: number
  mp: number
  isSleeping: boolean | null
  /** 숫자만. 비회원이 신청할 때 적어 낸 연락처가 여기 온다(`schema.auth.sql` 트리거). */
  phone?: string | null
  /**
   * **비회원 회원 행인가.** 익명 로그인(Supabase `signInAnonymously`)이 만든 행이다 — 비회원의 신원은
   * 그 브라우저 세션이고, 이 행이 있어서 신청·답·결제·채점이 회원과 같은 길을 탄다.
   * 소셜 계정을 이으면 DB 트리거가 끈다. 앱이 직접 켜고 끄지 않는다.
   */
  isGuest?: boolean
  /**
   * **이 회원을 맡은 담당자**(역시 회원). 운영자가 지정하고, 담당자는 `/admin/own-members`·`/admin/own-enrolls` 에서
   * 자기 담당 회원만 본다. 한 명뿐이고 바꾸면 덮어쓴다 — 누가 언제 맡았는지는 안 남는다(`members-manager.sql`).
   */
  managerId?: string | null
}

/**
 * 시드 한 행. `code`는 **시드가 이 회원을 부르는 이름**이고 DB로 나가지 않는다
 * (`etcFields`가 걷는다). 게시글 시드가 작성자를, 계정 시드가 주인을 이 이름으로 가리킨다.
 *
 * `역할codes`도 DB로 안 나간다 — 역할은 회원 테이블의 열이 아니라
 * `member-entity-historys`의 끝나지 않은 이력이다. `afterCreate`가 그 이력으로 바꿔 넣는다.
 */
export type i회원시드 = Omit<i회원dto, 'id'> & { code?: string, 역할codes?: i역할코드[] }

export interface i회원 extends BaseXX {
  이름: string
  생년월일: i날짜 | null
  성별: i회원성별
  readonly 이미지: string | null
  현재회비id: string | null
  readonly 가입일: i날짜
  잠자는중: boolean
  연락처: string
  readonly is비회원: boolean
  체력: number
  마력: number

  //
  _역할s: ComputedRef<model역할[]>
  readonly 역할s: model역할[]
  역할ids: string[]

  _등급: ComputedRef<model등급>
  readonly 등급: model등급
  등급id: string

  // readonly 회원관계이력s: model회원이력[];
  // readonly 회원상태이력s: model회원이력[];
  readonly 회원이력s: model회원이력[]
}

const i성별options = [
  { label: '남자', value: 'MALE', emoji: '♂️', icon: 'i-lucide-mars' },
  { label: '여자', value: 'FEMALE', emoji: '♀️', icon: 'i-lucide-venus' }
]
const 잠자는중options = [
  { label: '정상 회원', value: false, icon: 'i-lucide-user-check' },
  { label: '잠자는 회원', value: true, icon: 'i-lucide-moon-star' }
]
const i수정됨options = [
  { label: '수정됨', value: 'modified', icon: 'i-lucide-pencil' }
] as const

export class model회원s extends BaseModels2<model회원, i회원dto, i회원시드> {
  /**
     * 시드 전용 필드라 서버로 보내지 않는다 — `code`는 `시드PK` 등록부에만 남고,
     * `역할codes`는 `afterCreate`가 역할 이력으로 바꿔 넣는다(회원 표엔 역할 열이 없다).
     */
  protected etcFields = ['code', '역할codes']

  /**
     * 이름은 필터 축이 아니므로(값이 닫히지 않는다) 검색 축으로 연다.
     * 이게 없으면 "김철수 등급 뭐야" 같은 질문이 챗봇에서 아예 성립하지 않는다.
     */
  override 검색필드s = ['이름', '발급번호', '역할표기']

  override 정렬조건s = [

    { label: '시간', value: '시간', func: (a: model회원, b: model회원) => String(a.stateId).localeCompare(String(b.stateId)) },
    { label: '최신', value: '최신', func: (a: model회원, b: model회원) => String(b.stateId).localeCompare(String(a.stateId)) },

    { label: '이름↑', value: '이름↑', func: (a: model회원, b: model회원) => a.이름.localeCompare(b.이름) },
    { label: '이름↓', value: '이름↓', func: (a: model회원, b: model회원) => b.이름.localeCompare(a.이름) },

    { label: '나이↑', value: '생년월일↑', func: (a: model회원, b: model회원) => (a.생년월일?.valueOf() ?? 0) - (b.생년월일?.valueOf() ?? 0) },
    { label: '나이↓', value: '생년월일↓', func: (a: model회원, b: model회원) => (b.생년월일?.valueOf() ?? 0) - (a.생년월일?.valueOf() ?? 0) }

  ]

  override 필터조건ss = [
    /**
     * 비회원은 익명 세션이 신청할 때마다 한 행씩 생긴다. 회원 목록이 **기본으로 회원만** 보이게 둔다 —
     * 안 그러면 명부·개수가 신청 한 번마다 부푼다. 비회원을 볼 일은 칩 하나로 연다.
     */
    this.라디오필터그룹([
      { label: '회원', value: '회원', match: (a: model회원) => !a.is비회원 },
      { label: '비회원', value: '비회원', match: (a: model회원) => a.is비회원 },
      { label: '전체', value: '전체', match: () => true }
    ], { title: '구분', initialValues: '회원' }),

    this.라디오필터그룹([
      { label: '가입 1일', value: (a: model회원) => mDayjs().diff(a.가입일, 'hours') <= 24 },
      { label: '가입 7일', value: (a: model회원) => mDayjs().diff(a.가입일, 'days') < 7 },
      { label: '가입 1달', value: (a: model회원) => mDayjs().diff(a.가입일, 'days') < 30 }
    ], { title: '가입일' }),

    this.라디오필터그룹(
      i역할seed.map(item => ({ ...item, value: item.code, match: (a: model회원) => a.역할s.some(역할 => 역할.stateCode === item.code) })),
      { title: '역할' }),

    this.라디오필터그룹(
      i등급seed.map(item => ({ ...item, value: item.code, match: (a: model회원) => a.등급?.stateCode === item.code })),
      { title: '등급' }),

    // this.라디오필터그룹(
    //     [
    //         ...i회비유효상태options.map((item) => ({
    //             label: item.label,
    //             value: (a: model회원) => a.회비유효상태 === item.value,
    //         })),
    //     ],
    //     { title: '회비·유효기간' },
    // ),

    this.라디오필터그룹([{ label: '10대↓', value: (a: model회원) => (mDayjs().diff(a.생년월일, 'year') >= 0 && mDayjs().diff(a.생년월일, 'year') < 20) },
      ...[20, 30, 40, 50].map(decade => ({
        label: `${decade}대`,
        value: (a: model회원) => (mDayjs().diff(a.생년월일, 'year') >= decade && mDayjs().diff(a.생년월일, 'year') < decade + 10)
      })),
      { label: '60대↑', value: (a: model회원) => (mDayjs().diff(a.생년월일, 'year') >= 60) }], { title: '나이대' }),

    this.라디오필터그룹(
      i성별options.map(item => ({ ...item, match: (a: model회원) => a.성별 === item.value })),
      { title: '성별' })

    // this.라디오필터그룹(
    //     i수정됨options.map((item) => ({ ...item, match: (a: model회원) => toValue(a.is수정됨) })),
    //     { title: '수정됨' },
    // ),
  ]

  static getInstance = () => getRepoInstance('model회원s', () => new model회원s())

  private constructor() {
    super(model회원, 'members')
  }

  get 메뉴() { return model메뉴s.getInstance().getBy테이블명(this.tableName) }

  /**
     * 회원을 가리키는 선택기(`타입지정.선택0`/`선택s`)용 옵션. `model역할s.options`·`model등급s.options`와 같은 꼴이라,
     * 다른 모델이 "작성 회원"·"담당 회원" 같은 열을 폼에 낼 때 회원 목록을 저마다 다시 map 하지 않아도 된다.
     *
     * 이름은 이 도메인에서 흔히 겹친다 — 그래서 **겹치는 이름에만** `sub`(생년·성별·ID)를 덧붙인다.
     * 항상 붙이면 안 겹치는 대다수 줄까지 길어지고, 아예 안 붙이면 동명이인 중 누굴 고른 건지 알 수 없다.
     */
  options = computed(() => {
    const rows = toValue(this.회원s)
    const 이름중복 = new Map<string, number>()
    for (const row of rows) 이름중복.set(row.label, (이름중복.get(row.label) ?? 0) + 1)
    return rows.map(row => ({
      label: (이름중복.get(row.label) ?? 0) > 1 ? `${row.label} ${row.sub}` : row.label || String(row.stateId ?? ''),
      icon: row.icon,
      value: String(row.stateId ?? '')
    }))
  })

  /**
     * **비회원을 뺀 회원들.** 회비 청구·등급 심사·회원 고르기처럼 "우리 회원"을 세는 자리는 `list` 가 아니라 이걸 쓴다.
     *
     * `list` 를 걸러 두지 않는 이유: `getById` 가 `list` 를 뒤진다. 비회원을 거기서 빼면 비회원이 낸 신청의
     * `신청.회원` 이 안 풀려 관리자 신청 목록에서 이름이 빈다. 행은 다 두고, 셀 때 거른다.
     */
  회원s = computed(() => toValue(this.list).filter(회원 => !회원.is비회원))

  /** 담당자로 지정할 수 있는 회원 — 담당자 역할(`manager`)을 지금 가진 회원. */
  담당자options = computed(() => toValue(this.options)
    .filter(o => this.getById(o.value)?.역할s.some(역할 => 역할.stateCode === 'manager')))

  /** 이 담당자가 맡은 회원들. 담당 화면의 범위가 이것이다. */
  getsBy담당자 = (담당자id: string | number | null | undefined): model회원[] => {
    const id = String(담당자id ?? '').trim()
    if (!id) return []
    return toValue(this.회원s).filter(회원 => 회원.담당자id === id)
  }

  _generate = () => new model회원().generate()
  _init = () => new model회원().init()
  protected override seed = i회원seed
  override async create(item: i회원dto) {
    return await super.create(item)
  }

  /**
     * 회원을 읽으면 역할·등급도 같이 보장한다.
     *
     * 역할·등급은 회원 테이블에 없고 `model회원관계이력s`에서 조인돼 나온다(`_역할s`·`_등급`).
     * 그런데 그쪽 `reads()`는 members·own-members·my-info 세 화면에만, 그것도 `is관리자` 안에 걸려 있었다.
     * 그래서 그 화면을 안 거치고 회원을 읽는 진입점(전역 챗봇 등)에서는 역할·등급이 통째로 비고,
     * `필터조건ss`의 역할·등급 축이 **모든 옵션 0건**으로 광고됐다(실측됨).
     * 어느 화면을 먼저 들렀느냐에 따라 같은 질문의 답이 달라진다는 뜻이다.
     *
     * `디자인틀준비`와 같은 처방이다 — 필요한 쪽이 자기 진입점에서 당긴다.
     * `cachedRead`가 TTL·동시요청을 병합하므로 이미 읽힌 뒤라면 비용이 사실상 없고,
     * `getInstance()` 싱글턴이라 화면이 먼저 읽었든 여기가 먼저 읽었든 같은 목록을 본다.
     *
     * 딸림 조회는 실패해도 삼킨다. 권한 없는 사용자가 이력을 못 읽는다고
     * 회원 목록 자체가 깨지면 안 되기 때문이다(역할·등급만 비는 건 원래 상태와 같다).
     */
  override async reads(isBrief = false, force = false) {
    const 곁들임 = (p: Promise<unknown>) => p.catch(() => false)
    const [did받음] = await Promise.all([
      super.reads(isBrief, force),
      곁들임(model회원이력s.getInstance().reads()),
      곁들임(model역할s.getInstance().reads()),
      곁들임(model등급s.getInstance().reads())
    ])
    return did받음
  }
}
export class model회원 extends BaseModel2<i회원dto> implements i회원 {
  constructor(state?: i회원dto) {
    super(model회원s.getInstance(), state)
  }

  override beforeSave = () => true

  override afterCreate = async () => {
    if (this.역할s.length === 0) {
      /**
             * 시드가 역할을 적어 뒀으면 그걸 쓴다. 안 그러면 **전원이 기본 역할(준회원)**이 되어
             * 운영자·담당자·학습자를 가진 회원이 하나도 없는 DB가 선다(실측된 상태였다).
             *
             * `do역할추가`를 안 쓰는 이유는 그쪽이 기본 역할이 아닐 때 `confirm()`을 띄우기 때문이다 —
             * 시드는 사람이 없는 자리에서 돈다. 대신 이력을 직접 세운다.
             */
      const 시드역할codes = (this.state as Record<string, unknown> | undefined)?.역할codes as i역할코드[] | undefined
      if (시드역할codes?.length)
        await model회원이력s.getInstance().do시드역할부여(this, 시드역할codes)
      else
        await model회원이력s.getInstance().do역할추가(this, undefined, '회원 가입')
    }
    if (!this.등급) {
      await model회원이력s.getInstance().do등급기록(this, undefined, '회원 가입')
    }
    if (JSON.stringify(this.state) != JSON.stringify(this.init()))
      await model회원이력s.getInstance().do상태기록(this, '회원 가입')
  }

  override afterSave = () => {
    void model회원이력s.getInstance().do상태기록(this, '회원 저장')
  }

  override 자동필드ss = [
    {
      label: '기본',
      list: [
        { key: 'stateId', label: '고유번호', show: is관리자, props: { readonly: true } },
        { key: '이름', label: '이름' },
        { key: '연락처', label: '연락처', type: 타입지정._.전화번호 },
        { key: '생년월일', label: '생년월일', type: 타입지정._.날짜 },
        { key: '성별', label: '성별', options: i성별options },
        { key: '이미지', label: '이미지', show: !true },
        { key: '가입일', label: '가입일', type: 타입지정._.날짜2, props: { readonly: true }, canEdit: false, 달력: { label: '회원 가입', color: '#10b981' } },
        { key: 'is회비완납', label: '회비 완납', show: !true, type: 타입지정._.is체크, props: { readonly: true }, canEdit: false },
        // 버튼필드: `position`을 안 주면 선언한 이 자리에 인라인으로 그려진다. ('top'을 주면 상단 버튼바로 승격)
        { key: 'do회비납부', label: '회비 납부', type: 타입지정.버튼, icon: 'i-stash:wallet-light', show: computed(() => !this.is회비완납) },
        { key: '잠자는중', label: '잠자는회원', type: 타입지정.선택0, options: 잠자는중options, props: { type: 'radio' } },
        { key: '역할ids', label: '역할', canEdit: is관리자, type: 타입지정.선택s, options: model역할s.getInstance().options },
        { key: '등급id', label: '등급', canEdit: is처리자, type: 타입지정.선택0, options: model등급s.getInstance().options },
        { key: '담당자id', label: '담당자', canEdit: is관리자, type: 타입지정.선택0, options: model회원s.getInstance().담당자options }
      ]
    },
    {
      // 담당자가 회원을 「처리」하는 곳. 신청 카드의 상태를 바꾸는 게 승인·반려다.
      label: '신청',
      list: [
        { key: '신청s', label: '신청', type: 타입지정._.카드s, show: true, canEdit: is처리자, is한줄: false }
      ]
    },
    {
      // 출력(명함/회원증/등급증)은 회원 정보 편집과 성격이 달라 별도 탭으로 뺐다.
      label: '출력',
      list: [
        // 라벨에 '출력'을 다시 붙이지 않는다 — 탭 이름이 이미 출력이라 세 번 반복될 뿐이다.
        // `2xl`은 Input버튼이 자체로 만든 단계(UButton은 xl까지). 이 탭은 버튼이 곧 본문이라 크게 잡는다.
        { key: 'do명함출력', label: '명함', type: 타입지정.버튼, icon: 'i-mage:id-card', show: true, props: { size: '3xl' } },
        { key: 'do회원증출력', label: '회원증', type: 타입지정.버튼, icon: 'i-hugeicons:id-card-lanyard', show: true, props: { size: '3xl' } },
        // 등급이 없을 때 숨기면 회원을 옮길 때마다 버튼 수가 바뀐다. 자리는 두고 못 누르게만.
        {
          key: 'do등급증출력', label: '등급증', type: 타입지정.버튼, icon: 'i-ph-certificate', show: true,
          disabled: computed(() => !this.등급),
          props: {
            size: '3xl',
            title: computed(() => this.등급 ? undefined : '등급이 지정되지 않은 회원입니다')
          }
        }
      ]
    },
    {
      label: '이력',
      list: [
        {
          key: '회원이력s', label: '회원 이력', type: 타입지정._.카드s, show: true, canEdit: is관리자,
          is한줄: false
        }
        // { key: '회원관계이력s', label: '회원 관계 이력', type: 타입지정._.카드s, show: false, is한줄: false },
        // { key: '회원상태이력s', label: '회원 상태 이력', type: 타입지정._.카드s, show: false, is한줄: false },
      ]
    },

    {
      label: '댓글',
      show: false,
      config: { ratio: 30 },
      list: [
        {
          key: '회원댓글s',
          label: '댓글',
          type: 타입지정._.카드s,
          show: true,
          is한줄: false,
          props: {
            do빈생성: () =>
              void model회원댓글s.getInstance().do빈생성_회원관점({
                id: this.stateId,
                이름: this.이름
              })
          }
        }
      ]
    },
    {
      label: '게시글',
      show: false,
      config: { ratio: 30 },
      list: [
        {
          key: '회원게시글s',
          label: '회원 게시글',
          type: 타입지정._.카드s,
          show: true,
          is한줄: false,
          props: {
            do빈생성: () =>
              model회원게시글s.getInstance().do빈생성_회원관점(
                { id: this.stateId, 이름: this.이름 },
                { title: '이 회원의 게시글', description: '게시판·제목·본문을 입력하세요' }
              )
          }
        }
      ]
    }
  ]

  // 명함/회원증/등급증/회비납부는 상단 버튼바가 아니라 자동필드ss 안에 버튼필드로 인라인 배치했다.
  override 자동버튼s = this.기본버튼s

  generate() {
    const gender = Math.random() > 0.5 ? 'MALE' : 'FEMALE'
    const _birthdate = randomDate({ from: '1980-01-01', to: '2006-12-31', 시각: '자정' })
    const name = generateName2(_birthdate.getFullYear(), gender == 'MALE')
    // 최근 가입자가 촘촘한 게 자연스럽다. (예전 식 `60 * 24 * 30 * 60 * 1000`은 30일이 아니라 36일이었다)
    const createdAt = randomDate({ from: '-30d', 쏠림: '최근', 시각: '활동시간' })

    const _state: Omit<i회원dto, 'id'> = {
      gender: gender,
      name: name,
      birthdate: mDayjs(_birthdate).format('YYYY-MM-DD'),
      thumbnail: null,
      currentMemberFeeId: this.state.currentMemberFeeId ?? null,
      hp: Math.max(0, Number(this.state.hp ?? 100) || 0),
      mp: Math.max(0, Number(this.state.mp ?? 50) || 0),
      isSleeping: false
    }

    return {
      ...this.init(),
      ..._state,
      createdAt
    }
  }

  override init() {
    return {
      // id: 'JUST_CREATED_'+Date.now(),  // id는 생성부에서 pending값으로 부여함.
      name: '', // null,//
      birthdate: '2000-01-01', // null,//'2000-01-01',
      gender: 'MALE' as const,
      thumbnail: null,
      currentMemberFeeId: null,
      hp: 100,
      mp: 50,
      isSleeping: false,
      phone: null,
      isGuest: false
      // managerId 는 init 에 안 둔다 — 열이 없는 DB(`members-manager.sql` 전)에서 새 회원 저장이 통째로 깨진다.
    }
  }

  override get label() { return this.이름 }
  override get sub() { return `${this.생년월일?.format('YY') ?? ''}${i성별options.find(o => o.value == this.성별)?.emoji}(${this.stateId})` }

  override get icon() { return 'i-lucide-user' }
  /** 아바타(dicebear, `이미지`)가 정사각이다 */
  override get 표지비율() { return '1 / 1' }

  do회비납부 = async () => {
    const memberId = String(this.stateId ?? '').trim()
    if (!hasServerPk(memberId)) {
      useAlert().show('회비 납부 불가', '회원을 먼저 저장해주세요.')
      return
    }

    let target = this.회원회비
    if (!target) {
      const ensured = await model회원회비s.getInstance().ensureFor회원(memberId)
      target = (ensured as model회원회비 | null) ?? null
    }
    if (!target) {
      useAlert().show('회비 납부 불가', '회비 정보를 준비할 수 없습니다.')
      return
    }

    let feeId = String(target.stateId ?? '')
    if (!hasServerPk(feeId)) {
      const created = await target.add(true)
      target = (created as model회원회비 | null) ?? target
      feeId = String(target?.stateId ?? '')
      if (!hasServerPk(feeId)) {
        useAlert().show('회비 납부 불가', '회비 기록 생성 후 결제를 시작할 수 없습니다.')
        return
      }
    }

    return await target.do결제()
  }

  do활성화 = async () => {
    const memberId = String(this.stateId ?? '').trim()
    if (!hasServerPk(memberId)) {
      useAlert().show('활성화 불가', '회원을 먼저 저장해주세요.')
      return
    }
    this.잠자는중 = false
  }

  _badges = computed(() => {
    const badges = [
      ...(this.is비회원 ? [{ label: '비회원', color: 'neutral' as const }] : []),
      ...(this.등급 ? [{ label: this.등급.sub }] : []),
      ...this.역할s.map(역할 => ({
        label: 역할.label,
        color: 역할.색상
      })),
      this.잠자는중
        ? { label: '휴면', color: 'warning' as const }
        : { label: '정상' }
    ]

    return true ? badges.filter(badge => badge.color) : badges
  })

  override get badges() { return toValue(this._badges) }

  /**
     * 머리글 아래 요약 타일. 이 판이 '회원 편집'이 아니라 '회원 관리'가 되려면
     * 고칠 값 말고 **판단에 쓰는 값**이 먼저 보여야 한다 — 언제부터 회원인지, 회비는 됐는지.
     * 넷 다 이 화면이 이미 읽는 데이터라(`members.vue`의 회원·회원이력) 추가 조회가 없다.
     */
  _요약s = computed((): i요약타일[] => {
    const 이력s = this.회원이력s
    // 이력 목록의 최신 '시작'이 이 회원에게 마지막으로 무슨 일이 있었던 시점이다.
    const 최근 = 이력s
      .map(h => h.state?.startDate)
      .filter(Boolean)
      .map(d => mDayjs(d as string))
      .filter(d => d?.isValid?.())
      .sort((a, b) => b.valueOf() - a.valueOf())[0] ?? null

    // 등급·역할은 머리글 뱃지와 아래 필드에 이미 두 번 나온다 — 타일까지 쓰면 세 번이다.
    return [
      { label: '가입', ...this.경과타일(this.가입일, '일째') },
      { label: '최근 기록', ...this.경과타일(최근, '일 전') },
      {
        label: '회비',
        value: this.is회비완납 ? '완납' : '미납',
        // 완납은 원래 그래야 하는 상태다 — 색은 손봐야 할 쪽에만 준다.
        color: this.is회비완납 ? undefined : ('warning' as const)
      },
      { label: '이력', value: `${이력s.length}건` }
    ]
  })

  /** 지난 날짜 하나를 "N일째/N일 전 + 원본날짜" 타일 값으로. 오늘이면 숫자 대신 '오늘'. */
  private 경과타일(날짜: ReturnType<typeof mDayjs> | null, 접미: string) {
    if (!날짜?.isValid?.()) return { value: '—' }
    const 일수 = mDayjs().diff(날짜, 'day')
    return {
      value: 일수 < 1 ? '오늘' : `${일수}${접미}`,
      sub: 날짜.format('YY.MM.DD')
    }
  }

  override get 요약s() { return toValue(this._요약s) }
  // get label() { return this.이름 + '(' + this.생년월일.format('YYMMDD') + '/' + this.stateId + ')'; }

  get 이름() { return this.state.name }
  set 이름(v) { this.state.name = v }

  _생년월일 = computed(() => mDayjs(this.state.birthdate!))
  get 생년월일() { return toValue(this._생년월일)! }
  set 생년월일(v) { this.state.birthdate = v.format('YYYY-MM-DD') }

  get 성별(): i회원성별 {
    const v = this.state?.gender
    if (v === 'MALE' || v === 'FEMALE') return v
    return 'MALE'
  }

  set 성별(v: i회원성별) { this.state.gender = v }

  get 이미지() {
    const idSeed = this.stateId || 'member'
    return `https://api.dicebear.com/9.x/lorelei/svg?seed=${encodeURIComponent(idSeed)}`
  }

  get 현재회비id() {
    const id = String(this.state.currentMemberFeeId ?? '').trim()
    return id || null
  }

  set 현재회비id(v: string | null) {
    const id = String(v ?? '').trim()
    this.state.currentMemberFeeId = id || null
  }

  get 체력() { return Math.max(0, Number(this.state.hp ?? 0) || 0) }
  set 체력(v: number) { this.state.hp = Math.max(0, Number(v ?? 0) || 0) }

  get 마력() { return Math.max(0, Number(this.state.mp ?? 0) || 0) }
  set 마력(v: number) { this.state.mp = Math.max(0, Number(v ?? 0) || 0) }

  get 잠자는중() { return this.state.isSleeping ?? false }
  set 잠자는중(v: boolean) { this.state.isSleeping = v }

  /** 숫자만 남긴다 — 같은 번호가 하이픈 유무로 둘로 갈리지 않게. */
  get 연락처() { return this.state?.phone ?? '' }
  set 연락처(v: string) { this.state.phone = String(v ?? '').replace(/\D/g, '') || null }

  /** 비회원 회원 행인가(`isGuest`). 읽기만 한다 — 켜고 끄는 건 DB 트리거다. */
  get is비회원() { return this.state?.isGuest === true }

  get 담당자id() { return String(this.state?.managerId ?? '') }
  set 담당자id(v: string) { this.state.managerId = String(v ?? '') || null }

  _담당자 = computed((): model회원 | null => {
    const id = this.담당자id
    return id ? (model회원s.getInstance().getById(id) ?? null) as model회원 | null : null
  })

  get 담당자(): model회원 | null { return toValue(this._담당자) }

  /** 이 회원의 신청들. 담당자가 상태를 바꿔 승인·반려한다. */
  get 신청s(): model신청[] { return model신청s.getInstance().getsBy회원(this) }

  _가입일 = computed(() => mDayjs(this.state.createdAt!))
  get 가입일() { return toValue(this._가입일)! }

  // 이거 엉터리.
  // 고쳐야함.
  _현재도시이력 = computed(() => (model회원이력s.getInstance() as any).get현재도시이력By회원(this))
  get 회원위치() {
    const id = String(toValue(this._현재도시이력)?.state?.entityId ?? '').trim()
    return id || null
  }

  set 회원위치(v: string | number | null) {
    const 위치: model위치 | null
      = v == null || v === '' ? null : model위치s.getInstance().getById(v) ?? null
    void (model회원이력s.getInstance() as any).do위치기록(this, 위치)
  }

  _현재직업이력 = computed(() => (model회원이력s.getInstance() as any).get현재직업이력By회원(this))
  get 회원직업() {
    const id = String(toValue(this._현재직업이력)?.state?.entityId ?? '').trim()
    return id || null
  }

  set 회원직업(v: string | number | null) {
    const 직업: model직업 | null
      = v == null || v === '' ? null : model직업s.getInstance().getById(v) ?? null
    void (model회원이력s.getInstance() as any).do직업기록(this, 직업)
  }

  _역할s = computed(() => model회원이력s.getInstance().get역할sBy회원(this))
  get 역할s() { return toValue(this._역할s) }
  get 역할ids(): string[] { return this.역할s.map(역할 => String(역할.stateId)) }
  set 역할ids(v: string[]) {
    const 다음ids = new Set((v ?? []).map(String))
    const 현재역할s = this.역할s
    const 현재ids = new Set(현재역할s.map(역할 => String(역할.stateId)))

    for (const 역할 of 현재역할s) {
      if (!다음ids.has(String(역할.stateId)))
        void model회원이력s.getInstance().do역할해제(this, 역할)
    }
    for (const 역할id of 다음ids) {
      if (현재ids.has(역할id)) continue
      const 역할 = model역할s.getInstance().getById(역할id)
      if (역할)
        void model회원이력s.getInstance().do역할추가(this, 역할)
    }
  }

  _등급 = computed(() => model회원이력s.getInstance().get등급By회원(this))
  get 등급() { return toValue(this._등급) }
  get 등급id(): string { return String(this.등급?.stateId ?? '') }
  set 등급id(v: string) { void model회원이력s.getInstance().do등급기록(this, model등급s.getInstance().getById(v)) }

  get 회원회비s(): model회원회비[] { return model회원회비s.getInstance().getsBy회원(this) }

  /** 현재 회비 — 회원이 가리키는 행이 먼저, 없으면 최신순 첫 행 */
  get 회원회비(): model회원회비 | null {
    const rows = this.회원회비s
    const 현재id = this.현재회비id
    if (현재id) {
      const 현재 = rows.find(row => String(row.stateId ?? '') === 현재id) ?? null
      if (현재) return 현재
    }
    return rows[0] ?? null
  }
  // _회원이력s = computed(() => model회원이력s.getInstance().getsBy회원(this));
  // get 회원이력s() { return toValue(this._회원이력s); }

  _회원이력s = computed(() => model회원이력s.getInstance().getsBy회원(this))
  get 회원이력s() { return toValue(this._회원이력s) }

  _회원관계이력s = computed(() => model회원이력s.getInstance().get관계이력sBy회원(this))
  get 회원관계이력s() { return toValue(this._회원관계이력s) }

  _회원상태이력s = computed(() => model회원이력s.getInstance().get상태이력sBy회원(this))
  get 회원상태이력s() { return toValue(this._회원상태이력s) }

  get is회비완납() { return this.회원회비?.is회비완납 ?? false }
  // get 회비유효상태(): i회비유효상태 {
  //     return this.회원회비?.회비유효상태 ?? 'NOT_STARTED';
  // }
  /** 이 회원이 쓴 댓글 + 이 회원 프로필에 달린 댓글 — 합치는 규칙은 repo가 든다. */
  get 회원댓글s(): model회원댓글[] {
    return model회원댓글s.getInstance().getsBy회원(this)
  }

  get 회원게시글s(): model회원게시글[] { return model회원게시글s.getInstance().getsBy회원(this) }

  /* ---- 카드 출력 (명함·회원증·등급증) -------------------------------
     * 셋 다 **디자인틀**(`model디자인틀`, 표 `design-templates`)이 그린다 — 좌표를 데이터가 들고,
     * 사람이 캔버스(`/admin/edit/design-templates`)에서 고친 그 배치가 그대로 종이로 나간다.
     * 그래서 이 클래스가 아는 것은 배치가 아니라 **값**뿐이다(`디자인틀주입`).
     *
     * 한때 이 자리에 **좌표는 코드가 들고 AI가 색·서체만 갈아 끼우는** 층이 있었다.
     * 그러면 "이름을 조금 왼쪽으로"가 코드 수정이었다.
     * 지금은 그게 캔버스에서 상자를 끄는 일이다.
     *
     * **회원증이 마지막으로 넘어왔다.** 디자인틀에 색을 칠할 자리가 없어서(배경은 면당 그림 한 장,
     * 글자 상자에는 배경색이 없다) 카드 윗단의 남색 판을 표현할 방법이 없었고, 그동안만
     * 회원증만 그리는 붙박이 렌더러를 붙들고 있었다. 표식이 색판(`i표식.채움`)을 받게 되면서
     * 그 이유가 없어졌고, 붙박이 쪽은 폐기했다.
     * ------------------------------------------------------------------ */

  /**
     * 등급증 한 장이 걸리는 행. **없으면 뽑을 증서도 없다** (등급을 아직 안 받은 회원).
     *
     * 등급 취득 1건 = 등급증 1장이라, 등급증의 번호·발급일·검증 대상이 전부 이 행의 것이다
     * (`model회원관계이력`). 회원은 이름·사진·조직 값만 댄다.
     */
  get 현재등급이력() { return model회원이력s.getInstance().get현재등급이력By회원(this) }

  /**
     * 지금 이 회원의 등급증 발급번호. **번호를 짓지 않는다** — 등급이력 행이 든 것을 편의로 편다.
     *
     * 한때 여기서 회원 id 뒷 세 자리로 지었다(`GRD-{연도}-{id.slice(-3)}`). 두 가지가 틀렸다.
     * 자른 탓에 회원 1001 과 2001 이 **같은 번호**를 냈고, 회원 축이라 등급이 올라가도 번호가
     * 그대로였다 — 증서가 두 장인데 번호가 하나였다는 뜻이다.
     */
  get 발급번호() { return this.현재등급이력?.발급번호 ?? '' }

  get 역할표기() { return this.역할s.map(역할 => 역할.label).join(' · ') }

  /**
     * QR은 여기서만 만든다. 디자인틀은 위치·크기만 정할 수 있고 값은 못 바꾼다.
     *
     * **등급증은 회원이 아니라 등급이력 행을 가리킨다** (`qrVerify.ts`). 회원 id 를 담으면
     * 검증 화면이 "이 사람이 있다"까지만 말하고, 종이에 찍힌 등급·발급일과 대조할 상대가 없다.
     */
  private QR = (용도: i용도, 이력?: model회원관계이력 | null) => 용도 === '등급증'
    ? (이력?.검증URL ?? '')
    : buildQrVerifyUrl({ type: 'member', id: String(this.stateId ?? '') })

  /**
     * 디자인틀의 자리 이름(꼬리표)에 값을 댄다. **용도마다 다른 표를 낸다.**
     *
     * 같은 키가 용도에 따라 다른 것을 뜻하기 때문이다 — 등급증의 `소속` 은 이 사람이 속한 반
     * (`중등부 2반`)이고 명함의 `소속` 은 회사명이다. 하나로 합치면 명함에 반 이름이 찍힌다.
     * (`용도.ts` 가 `이름` 을 두고 같은 경고를 적어 둔 그 지점이다)
     *
     * 회원이 갖지 않은 값(`기관명`·`서명`·`증명문구`)은 조직에서 온다(`designs/조직.ts`).
     * 어느 쪽에도 없는 자리는 **비운다** — 없는 값을 지어내면 종이에서 없다는 사실이 사라진다.
     */
  private 디자인틀주입 = (용도: i용도, 이력?: model회원관계이력 | null): i주입 => {
    const 그림 = { QR: { 종류: 'QR' as const, 값: this.QR(용도, 이력) } }

    if (용도 === '등급증') {
      /*
             * **등급증만 행에서 값을 받는다.** 등급 취득 1건에 증서 1장이라, 무엇을 증명하는지
             * (등급) 와 그 증거(발급일·발급번호·QR)가 전부 그 취득 행의 것이다.
             *
             * 그래서 등급도 `this.등급`(현재 등급)이 아니라 `이력.등급`이다 — 작년 2급 증서를
             * 다시 뽑는데 지금 등급인 1급이 찍히면 그건 다른 문서다.
             *
             * 나머지 값(이름·사진·조직)은 여전히 회원의 것이다. 행이 그것까지 들면 회원 정보가
             * 취득 시점에 얼어붙는데, 개명한 사람의 재발급본에는 **새 이름**이 찍히는 게 맞다.
             */
      const 등급 = 이력?.등급
      return {
        글자: {
          이름: this.이름,
          기관명: 조직.소속,
          서명: 조직.영문소속,
          증명문구,
          // 디자인틀의 예시가 `입문자 (1급)` 이다 — 등급은 이름과 급수 두 조각이라 붙여서 낸다
          등급: 등급 ? `${등급.label} (${등급.sub})` : '',
          역할: this.역할표기,
          회원번호: String(this.stateId ?? ''),
          생년월일: this.생년월일?.format?.('YYYY-MM-DD') ?? '',
          발급일: 이력?.발급일?.format('YYYY-MM-DD') ?? '',
          // 표에 찍는 `발급일`과 서명 위의 날짜는 같은 값의 두 형식이다 (`용도.ts`)
          발급일문구: 이력?.발급일?.format('YYYY년 M월 D일') ?? '',
          발급번호: 이력?.발급번호 ?? ''
        },
        그림: { ...그림, 사진: this.이미지 ? { 종류: '그림' as const, url: this.이미지 } : null }
      }
    }

    if (용도 === '회원증') {
      /*
             * `역할등급` 은 좁은 카드 한 줄에 둘을 붙인 형식이다 (`용도.ts` 의 그 자리).
             * 등급이 두 조각이라 표기가 등급증과 다르다 — 등급증은 `입문자 (1급)` 로 이름까지
             * 적지만, 카드는 역할과 나란히 서므로 급수(`sub`)만 괄호에 넣는다.
             *
             * `휴면` 은 잠자는 회원일 때만 값이 간다. 안 가면 그 상자는 통째로 비므로
             * (`렌더.ts` 의 `글자값`) 조건부 뱃지가 디자인틀 쪽 조건 없이 성립한다.
             */
      const 급수 = this.등급?.sub?.trim() || this.등급?.label?.trim() || ''
      const 역할 = this.역할표기
      const 역할등급 = 역할 && 급수 ? `${역할} (${급수})` : 역할 || (급수 ? `(${급수})` : '')

      return {
        글자: {
          이름: this.이름,
          역할등급,
          역할,
          등급: this.등급 ? `${this.등급.label} (${this.등급.sub})` : '',
          // 카드의 가입일은 점 표기다. 등급증의 `YYYY-MM-DD` 와 형식이 다른 것은
          // 발급일·발급일문구와 같은 사정 — 형식이 둘이면 자리도 둘이다
          가입일: this.가입일?.format?.('YYYY. MM. DD') ?? '',
          회원번호: String(this.stateId ?? ''),
          생년월일: this.생년월일?.format?.('YYYY-MM-DD') ?? '',
          휴면: this.잠자는중 ? '휴면' : ''
        },
        그림: { ...그림, 사진: this.이미지 ? { 종류: '그림' as const, url: this.이미지 } : null }
      }
    }

    if (용도 === '명함') {
      const 연락처s = [조직.전화번호, 조직.이메일, 조직.주소]
      return {
        글자: {
          이름: this.이름,
          역할: this.역할표기,
          직위: this.역할표기,
          소속: 조직.소속,
          슬로건: 조직.슬로건,
          전화번호: 조직.전화번호,
          이메일: 조직.이메일,
          웹사이트: 조직.웹사이트,
          주소: 조직.주소,
          연락처: 연락처s.join('\n'),
          연락처한줄: `${조직.전화번호}\u3000${조직.이메일}`,
          직위소속: [this.역할표기, 조직.소속].filter(Boolean).join('\u3000')
        },
        그림
      }
    }

    return { 글자: {}, 그림 }
  }

  /** 표를 출력 직전에 한 번 보장한다. `cachedRead` 가 TTL·동시요청을 병합하므로 반복 비용은 없다 */
  private 디자인틀준비 = () => model디자인틀s.getInstance().reads()

  /**
     * 이 용도로 발급할 디자인틀 한 벌을 캔버스와 같은 모양(`i틀`)으로 편다.
     * 그 용도의 디자인틀이 표에 하나도 없으면 `null` — 그때는 정말로 뽑을 것이 없다.
     */
  private 발급디자인틀 = (용도: i용도) => model디자인틀s.getInstance().get사용중(용도)?.열기() ?? null

  /**
     * 디자인틀 한 벌을 모달로 연다. 없으면 어디로 가야 하는지까지 말한다 —
     * "출력할 수 없습니다" 만 뜨면 사람이 할 수 있는 일이 없다.
     */
  private do디자인틀출력 = async (용도: i용도, o: { title: string, 면?: number, 이력?: model회원관계이력 | null, 파일명?: string }) => {
    await this.디자인틀준비()
    const 틀 = this.발급디자인틀(용도)
    if (!틀) {
      // 안내가 캔버스를 가리키지 않는다: 그 화면은 준비중이라(`PrintTemplate/준비중.ts`)
      // 거기로 보내면 같은 자리로 돌아온다. 표가 빈 것을 되돌리는 길은 어느 쪽이든 초기데이터다
      useAlert().show(o.title, `${용도} 디자인틀이 없습니다. 표(design-templates)가 비었습니다 — 시스템 관리에서 초기데이터를 세워 주세요.`)
      return
    }

    const 주입 = this.디자인틀주입(용도, o.이력)
    const 그리기 = (폭: number) => to디자인틀(틀, 주입, { 폭, 면: o.면 })
    const 미리보기 = 그리기(미리보기폭(틀.규격))
    if (!미리보기) {
      useAlert().show(o.title, `${틀.이름} 에 ${(o.면 ?? 0) + 1}번째 면이 없습니다.`)
      return
    }

    useModalRender().open({
      title: o.title,
      filename: o.파일명 || `${용도}_${this.이름}(${this.stateId})`,
      modelValue: 미리보기,
      // 좌표가 % 라 폭 하나로 전체가 확대된다 — 300dpi 트리를 새로 그려 그쪽을 찍는다
      printBuild: (폭: number) => 그리기(폭)!,
      printWidth: 인쇄폭(틀.규격),
      orientation: 틀.규격.폭mm > 틀.규격.높이mm ? 'landscape' : 'portrait'
    })
  }

  do명함출력 = () => this.do디자인틀출력('명함', { title: '명함' })

  /**
     * 등급 취득 한 건의 등급증. **발급 단위가 이 행이라 과거 등급도 뽑힌다** —
     * 이력 카드의 '등급증' 버튼(`model회원관계이력.do등급증출력`)이 이리로 들어온다.
     *
     * 파일명에 발급번호를 쓴다. 같은 회원의 증서가 등급마다 여러 장이라
     * `등급증_홍길동(1001)` 로는 저장 폴더에서 서로 구분되지 않는다.
     */
  do등급증출력_이력 = (이력: model회원관계이력) => this.do디자인틀출력('등급증', {
    title: ['등급증', 이력.등급?.label].filter(Boolean).join(' · '),
    파일명: `등급증_${this.이름}(${이력.발급번호})`,
    이력
  })

  /**
     * 회원 화면의 '등급증' 버튼. **현재 등급 한 장**을 뽑는다 — 회원 축에서 물으면
     * 답할 수 있는 것이 지금 등급뿐이라서다. 지난 등급은 이력 카드에서 뽑는다.
     */
  do등급증출력 = async () => {
    // 버튼의 `disabled`(`!this.등급`)와 같은 조건이어야 한다 — 행은 있는데 그 등급이
    // 지워진 경우까지 통과시키면 등급 자리가 빈 증서가 나간다
    const 이력 = this.현재등급이력
    if (!이력?.등급) {
      useAlert().show('등급증', '등급 정보가 없어 등급증을 열 수 없습니다.')
      return
    }
    await this.do등급증출력_이력(이력)
  }

  /** 명함 뒷면. 단면 디자인틀이면 없다고 말한다 (`자동버튼s` 에는 없고 직접 호출용) */
  do명함출력_뒷면 = () => this.do디자인틀출력('명함', { title: '명함 (뒷면)', 면: 1 })

  /**
     * 회원증. 다른 둘과 같은 길을 탄다 — 붙박이 렌더러였을 때는 Tailwind 고정폭 카드라
     * 확대가 안 돼 `printBuild` 를 못 넘겼는데, 디자인틀은 좌표가 % 라 300dpi 로 다시 그릴 수 있다.
     * 저장한 PNG 가 그만큼 선명해진 것이 이 전환의 덤이다.
     */
  do회원증출력 = () => this.do디자인틀출력('회원증', { title: '회원증' })
}

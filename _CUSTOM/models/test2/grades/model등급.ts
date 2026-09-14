import { computed, toValue } from 'vue'
import { BaseModels2, BaseModel2, 타입지정, type BaseXX, type BaseXXDto, getRepoInstance } from '~utils/models'

import { model메뉴s, type model회원 } from '../_basics'
import { model회원이력s } from '../_basics/model회원이력'
import { model등급요건s, type model등급요건 } from './model등급요건'
import { model등급별심사s, type model등급별심사 } from './model등급별심사'
import { i등급seed } from '../seeds'

export type i등급코드 = 'beginner' | 'basic' | 'leader' | 'expert'
export type i등급구독구분 = 'FREE' | 'ANNUAL' | 'LIFETIME'
export type i등급labelAffix = { suffix?: string, prefix?: string }

export const i등급구독구분options: { label: string, value: string }[] = [
  { label: '무료', value: 'FREE' },
  { label: '연간', value: 'ANNUAL' },
  { label: '평생', value: 'LIFETIME' }
]
const is기본옵션options = [
  { label: '기본값', value: true, icon: 'i-material-symbols-light:start' },
  { label: '아님', value: false, icon: 'i-material-symbols-light:align-justify-center' }
]

export const i승급목표등급seed = i등급seed.filter(r => !r.isDefault)

export interface i등급dto extends BaseXXDto {
  code: i등급코드
  label: string
  labelEn: string
  icon: string | null
  description: string | null

  is오름차순: boolean | null
  isDefault: boolean
  thumbnail: string | null

  //
  duration_type: i등급구독구분
  alertDays: number
  graceDays: number
  labelAffix: i등급labelAffix// | null;

  // --- 등급 조건 --- //
  noCondition?: boolean
  requiredWrittenTest: number
}

export interface i등급 extends BaseXX {
  stateCode: i등급코드
  이름: string
  영문명: string
  아이콘: string | null
  소개: string | null

  is오름차순: boolean
  is기본옵션: boolean
  이미지: string | null

  //
  구독구분: i등급구독구분
  알림일수: number
  유예일수: number
  이름접사: i등급labelAffix// | null;
  //
  급수: number
  회원s: model회원[]

  // --- 등급 조건 --- //

  is무조건: boolean
  필기시험컷: number

  // 회원수: number; //내부적.
}

export class model등급s extends BaseModels2<model등급, i등급dto> {
  protected etcFields = []
  static getInstance = () => getRepoInstance('model등급s', () => new model등급s())

  private constructor() {
    super(model등급, 'grades')
  }

  get 메뉴() { return model메뉴s.getInstance().getBy테이블명(this.tableName) }

  override async reads() {
    return super.reads()
  }

  _기본등급 = computed(() => toValue(this.list).find(row => row.is기본옵션)!)
  get기본등급 = (): model등급 => toValue(this._기본등급)

  get다음등급 = (from: model등급): model등급 | null => {
    const n = from.is오름차순 ? from.급수 + 1 : from.급수 - 1
    return toValue(this.list).find(r => r.급수 == n) ?? null
  }

  override _generate = () => new model등급().generate()
  override _init = () => new model등급().init()
  protected override seed = i등급seed

  options = computed(() => toValue(this.list).map(row => ({ label: row.이름, icon: row.아이콘, value: row.stateId })))

  /**
   * **code로** 등급을 집는다. `model역할s.getByCode`와 같은 자리 —
   * 소스코드·시드가 등급을 가리키는 유일한 방법이다(PK는 서버가 매기므로 적을 수 없다).
   */
  getByCode = (code: i등급코드 | string) => toValue(this.list).find(row => row.stateCode === code) ?? null
}

export class model등급 extends BaseModel2<i등급dto> implements i등급 {
  constructor(state?: i등급dto) {
    super(model등급s.getInstance(), state)
  }

  bindModel = computed(() => this.조건 as any)
  override afterCreate = () => { }
  override beforeSave = () => true
  override afterSave = () => { }

  override 자동필드ss = [
    {
      label: '기본',
      list: [
        { key: '이름', label: '이름', show: true },
        { key: '영문명', label: '영문명', show: true },
        { key: '아이콘', label: '아이콘', type: 타입지정._.아이콘, show: true },
        {
          key: '구독구분',
          label: '구독구분',
          type: 타입지정.선택0,
          options: i등급구독구분options as any,
          show: !true
        },
        { key: 'is기본옵션', label: '기본값', type: 타입지정.선택0, options: is기본옵션options as any, show: true },

        { key: 'is무조건', label: '무조건', type: 타입지정.선택0, options: [{ label: '무조건', value: true }, { label: '조건', value: false }] as any, show: true },
        {
          key: '필기시험컷',
          label: '필기시험 컷',
          type: 타입지정._.숫자2,
          props: { min: 0, max: 100, step: 5 },
          show: computed(() => !toValue(this.is무조건))
        },
        {
          key: '조건',
          label: '등급요건',
          type: 타입지정._.카드,
          is한줄: false,
          props: { can: { 수정: true } },
          show: true
        }
      ]
    },
    {
      label: '상세',
      config: { ratio: 30 },
      list: [
        { key: '이미지', label: '썸네일', show: true, is한줄: false, type: 타입지정.이미지2 },
        // 한두 문장짜리 소개다. 본문 편집기(`문자md`)를 세울 자리가 아니다.
        { key: '소개', label: '소개', type: 타입지정._.문자, props: { is여러줄: true }, is한줄: false, show: true }
      ]
    },
    {
      label: '회원',
      config: { ratio: 30 },
      list: [
        {
          key: '회원s', // key: '회원등급s',
          label: '회원',
          type: 타입지정._.카드s,
          show: true,
          is한줄: false,
          props: {
            do빈생성: () => { },
            show탭: false
          }
        }
      ]
    }
    // {//등급심사에서 섬세하게 관리함.
    //   label: '심사',
    //   config: { ratio: 30 },
    //   list: [
    //     {
    //       key: '등급별심사s',
    //       label: '등급별 심사',
    //       type: 타입지정._.카드s,
    //       show: true,
    //       is한줄: false,
    //       props: {
    //         do빈생성: () => {},
    //         show탭: false,
    //       },
    //     },
    //   ],
    // },
  ]

  override generate() {
    return this.init()
  }

  override init() {
    return {
      code: 'beginner' as i등급코드,
      icon: 'i-lucide-star',
      label: '등급명',
      labelEn: 'Grade Name',
      description: '등급 설명',
      is오름차순: true,
      isDefault: false,
      thumbnail: null,
      duration_type: 'ANNUAL' as i등급구독구분,
      alertDays: 7,
      graceDays: 3,
      labelAffix: { prefix: '', suffix: '급' },
      requiredWrittenTest: 60
    }
  }

  override get label() { return this.이름 }
  override get sub() {
    return `${this.이름접사.prefix}${this.급수}${this.이름접사.suffix}`
  }

  _badges = computed(() =>
    [{ label: `회원 ${this.회원수}`, color: this.회원수 > 0 ? 'primary' : 'neutral' },
      { label: `심사 ${this.등급별심사수}`, color: this.등급별심사수 > 0 ? 'primary' : 'neutral' }])

  override get badges() { return toValue(this._badges) }

  get stateCode(): i등급코드 {
    const v = this.state?.code
    if (v === 'beginner' || v === 'basic' || v === 'leader' || v === 'expert') return v
    return 'beginner'
  }

  set stateCode(v: i등급코드) {
    if (!this.state) return
    this.state.code = v
  }

  get 이름() { return this.state.label }
  set 이름(v) { this.state.label = v }
  get 영문명() { return this.state.labelEn }
  set 영문명(v) { this.state.labelEn = v }
  get 아이콘() { return this.state.icon }
  set 아이콘(v) { this.state.icon = v }
  get 소개() { return this.state.description }
  set 소개(v) { this.state.description = v }

  get is오름차순() {
    return this.state.is오름차순 !== false
  }

  get is기본옵션() { return this.state.isDefault ?? false }
  set is기본옵션(v) {
    if (v && confirm('바로 적용됩니다. 수정하시겠습니까?')) {
      const 기존item = toValue(model등급s.getInstance().list).find(x => x.is기본옵션)
      기존item!.state.isDefault = false
      this.state.isDefault = v
      this.repo.do모두저장()
    }
  }

  get 이미지() { return this.state.thumbnail }
  set 이미지(v) { this.state.thumbnail = v }

  get 구독구분(): i등급구독구분 {
    const v = this.state.duration_type
    if (v === 'LIFETIME' || v === 'ANNUAL' || v === 'FREE') return v
    return 'ANNUAL'
  }

  set 구독구분(v: i등급구독구분) {
    if (!this.state) return
    this.state.duration_type = v
  }

  get 알림일수() { return Math.max(0, Math.floor(Number(this.state.alertDays ?? 7))) }
  set 알림일수(v) {
    if (!this.state) return
    this.state.alertDays = Math.max(0, Math.floor(Number(v) || 0))
  }

  get 유예일수() { return Math.max(0, Math.floor(Number(this.state.graceDays ?? 3))) }
  set 유예일수(v) {
    if (!this.state) return
    this.state.graceDays = Math.max(0, Math.floor(Number(v) || 0))
  }

  get 이름접사() { return this.state.labelAffix }
  set 이름접사(v) { this.state.labelAffix = v }

  get 급수() {
    return toValue(model등급s.getInstance().메뉴?.폴더s)?.findIndex(x => x == this.stateId)! + 1
  }

  get 회원s() { return model회원이력s.getInstance().get회원sBy등급(this) }

  private _norm필기시험컷 = (v: unknown) => {
    const n = Number(v ?? 0)
    if (!Number.isFinite(n)) return 0
    return Math.min(100, Math.max(0, Math.floor(n)))
  }

  get is무조건() { return this.state.noCondition ?? false }
  set is무조건(v) { this.state.noCondition = v }
  get 필기시험컷() { return this._norm필기시험컷(this.state.requiredWrittenTest) }
  set 필기시험컷(v) {
    if (!this.state) return
    this.state.requiredWrittenTest = this._norm필기시험컷(v)
  }

  get requiredWrittenTest() { return this.필기시험컷 }
  set requiredWrittenTest(v) { this.필기시험컷 = v }

  get 조건(): model등급요건 | null {
    return model등급요건s.getInstance().getByGradeId(String(this.stateId ?? '')) ?? null
  }

  get 회원수() { return this.회원s.length }

  get 등급별심사s(): model등급별심사[] {
    return model등급별심사s.getInstance().getsBy목표등급(this)
  }

  get 등급별심사수() { return this.등급별심사s.length }

  // --- 등급 조건 --- //
}

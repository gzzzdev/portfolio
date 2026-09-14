import { computed, toValue } from 'vue'
import { 타입지정, getRepoInstance, pkOf } from '~utils/models'
import { model콘텐츠물s, model모임물, type i모임물dto } from './_콘텐츠물'
import { model회원s, type model회원 } from '../_basics'
import { i수업seed } from '../seeds/model수업.seed'

export type i수업구분 = 'TERM' | 'CLASS'
export const i수업구분options = [
  { label: '학기', value: 'TERM' },
  { label: '수업', value: 'CLASS' }
] as const

export interface i수업dto extends i모임물dto {
  /** 학기인가 그 안의 수업인가. 학기 > 수업은 `parentId` 한 열로 묶는다. */
  category: i수업구분
  /** 담당 강사(회원). 학기에는 없어도 된다. */
  teacherId: string | null
}

/**
 * 학기 셀렉트의 항목. **반환 타입을 적어 두는 게 중요하다** — 클래스 안에 두고 추론에 맡기면
 * `model수업s` → `필터조건ss` → `model수업` → `자동필드ss` → `model수업s`로 타입이 자기를 물어
 * `implicitly has type 'any'`(TS7022)로 터진다.
 */
const 학기options = (): { label: string, value: string }[] =>
  model수업s.getInstance().get학기s().map(x => ({ label: x.label, value: String(x.stateId ?? '') }))

const 회원options = (): { label: string, value: string }[] =>
  toValue(model회원s.getInstance().회원s).map(x => ({ label: x.label, value: String(x.stateId ?? '') }))

export class model수업s extends model콘텐츠물s<model수업, i수업dto> {
  protected override seed = i수업seed
  readonly 구분필터그룹 = this.라디오필터그룹<model수업>(
    [
      { label: '전체', value: '전체', match: () => true },
      ...i수업구분options.map(opt => ({
        label: opt.label,
        value: opt.value,
        match: (row: model수업) => row.구분 === opt.value
      }))
    ],
    { key: 'class-category', title: '구분', initialValues: '전체' }
  )

  override 필터조건ss = [this.구분필터그룹]

  static getInstance = () => getRepoInstance('model수업s', () => new model수업s())

  private constructor() {
    super(model수업, 'classes')
  }

  override _generate = () => new model수업().generate()
  override _init = () => new model수업().init()

  get학기s = (): model수업[] => toValue(this.list).filter(row => row.구분 === 'TERM')

  /**
     * seed를 올린 뒤 **실제 PK로** 학기 아래에 수업을 엮는다.
     *
     * seed 파일에 `parentId`를 적어 둘 수 없다 — 서버가 `id`를 다시 매기므로
     * (`db_low.withCreateMeta`) 선언 시점에는 가리킬 PK가 존재하지 않는다.
     */
  override async do초기데이터(opts?: { skipConfirm?: boolean, ensureRead?: boolean }) {
    const 만든s = await super.do초기데이터(opts)
    if (!만든s?.length) return 만든s

    const 학기 = 만든s.find(row => row.구분 === 'TERM')
    if (!학기) return 만든s

    const 수업s = 만든s.filter(row => row.구분 === 'CLASS')
    수업s.forEach((수업) => { 수업.학기id = String(학기.stateId ?? '') })
    await this.do모두저장(수업s)
    return 만든s
  }

  /**
     * 학기 하나. `getById`를 그대로 쓰면 반환 타입이 제네릭 `T`라, 그걸 풀려고 `model수업s`
     * → `model수업` → 다시 이 호출로 추론이 되돌아온다(TS7022). 여기서 타입을 끊는다.
     */
  get학기 = (id: string | number | null | undefined): model수업 | null => {
    const 값 = String(id ?? '').trim()
    if (!값) return null
    return toValue(this.list).find(row => String(row.stateId ?? '') === 값) ?? null
  }

  getsBy학기 = (학기id: string | number | null | undefined): model수업[] => {
    const id = String(학기id ?? '').trim()
    if (!id) return []
    return toValue(this.list).filter(row => row.구분 === 'CLASS' && row.상위id === id)
  }
}

export class model수업 extends model모임물<i수업dto> {
  constructor(state?: i수업dto) {
    super(model수업s.getInstance(), state)
  }

  override 자동필드ss = [
    this.필드_기본([
      { key: '구분', label: '구분', type: 타입지정.선택0, options: i수업구분options, show: true },
      {
        key: '학기id',
        label: '학기',
        type: 타입지정.선택0,
        getOptions: 학기options,
        show: computed(() => this.구분 === 'CLASS')
      },
      {
        key: '강사id',
        label: '강사',
        type: 타입지정.선택0,
        getOptions: 회원options,
        // 교수자 역할을 걷었다(2026-09-14, `members-manager.sql`). 열은 남기고 화면에서만 뺀다.
        show: false
      },
      ...this.필드_기간()
    ]),
    this.필드_신청받기()
  ]

  override generate() {
    return { ...this.init(), title: '수업' }
  }

  override init() {
    return {
      ...this.모임init(),
      category: 'CLASS' as i수업구분,
      teacherId: null
    }
  }

  override get icon() { return this.구분 === 'TERM' ? 'i-ph-calendar-blank-light' : 'i-ph-chalkboard-teacher-light' }

  get 구분() { return (this.state?.category ?? 'CLASS') as i수업구분 }
  set 구분(v: i수업구분) {
    this.state.category = v
    // 학기는 학기에 속하지 않는다 — 남겨두면 자기 자신을 상위로 가리키는 행이 만들어진다.
    if (v === 'TERM') this.state.parentId = null
  }

  /** 상위 학기. `상위id`의 수업 전용 별칭 — 화면에서 "학기"라고 부르는 게 자연스럽다. */
  get 학기id() { return this.구분 === 'CLASS' ? this.상위id : '' }
  set 학기id(v: string) {
    if (this.구분 !== 'CLASS') return
    // 자기 자신을 상위로 잡으면 `학기`/`수업s`가 서로를 무한히 부른다.
    if (v && String(this.stateId ?? '') === String(v)) {
      useAlert().error('지정할 수 없습니다', '자기 자신을 학기로 지정할 수 없습니다.')
      return
    }
    this.상위id = v
  }

  _학기 = computed<model수업 | null>(() => model수업s.getInstance().get학기(this.학기id))
  get 학기() { return toValue(this._학기) }

  _수업s = computed(() => model수업s.getInstance().getsBy학기(this.stateId))
  get 수업s() { return toValue(this._수업s) }

  get 강사id() { return String(this.state?.teacherId ?? '') }
  set 강사id(v: string) { this.state.teacherId = String(v ?? '') || null }

  _강사 = computed(() => {
    const id = this.강사id
    if (!id) return null
    return (model회원s.getInstance().getById(id) ?? null) as model회원 | null
  })

  get 강사() { return toValue(this._강사) }

  override get sub() {
    const 기간 = super.sub
    return [기간, this.장소].filter(Boolean).join(' · ')
  }

  protected override get 사진태그s() { return ['class', 'lecture'] }
  protected override get 기본썸네일() { return '/img/thumb/class.svg' }
}

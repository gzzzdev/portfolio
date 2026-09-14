import { computed, toValue } from 'vue'
import { 타입지정, getRepoInstance } from '~utils/models'
import { model콘텐츠물s, model모임물, type i모임물dto } from './_콘텐츠물'
import { i행사seed } from '../seeds/model행사.seed'

export type i행사구분 = 'EVENT' | 'CONFERENCE' | 'SESSION'
export const i행사구분options = [
  { label: '일반행사', value: 'EVENT' },
  { label: '학술대회', value: 'CONFERENCE' },
  { label: '세션', value: 'SESSION' }
] as const

export interface i행사dto extends i모임물dto {
  category: i행사구분
}

export class model행사s extends model콘텐츠물s<model행사, i행사dto> {
  protected override seed = i행사seed
  readonly 구분필터그룹 = this.라디오필터그룹<model행사>(
    [
      { label: '전체', value: '전체', match: () => true },
      ...i행사구분options.map(opt => ({
        label: opt.label,
        value: opt.value,
        match: (row: model행사) => row.구분 === opt.value
      }))
    ],
    { key: 'occasion-category', title: '구분', initialValues: '전체' }
  )

  override 필터조건ss = [this.구분필터그룹]

  static getInstance = () => getRepoInstance('model행사s', () => new model행사s())

  private constructor() {
    super(model행사, 'occasions')
  }

  override _generate = () => new model행사().generate()
  override _init = () => new model행사().init()

  /** 상위 행사(학술대회)에 딸린 세션들. `parentId` 한 열로 한 겹만 묶는다. */
  getsBy상위 = (상위id: string | number | null | undefined): model행사[] => {
    const id = String(상위id ?? '').trim()
    if (!id) return []
    return toValue(this.list).filter(row => row.상위id === id)
  }

  /** seed를 올린 뒤 **실제 PK로** 학술대회 아래에 세션을 엮는다(`model수업s` 주석 참고). */
  override async do초기데이터(opts?: { skipConfirm?: boolean, ensureRead?: boolean }) {
    const 만든s = await super.do초기데이터(opts)
    if (!만든s?.length) return 만든s

    const 학술대회 = 만든s.find(row => row.구분 === 'CONFERENCE')
    if (!학술대회) return 만든s

    const 세션s = 만든s.filter(row => row.구분 === 'SESSION')
    세션s.forEach((세션) => { 세션.상위id = String(학술대회.stateId ?? '') })
    await this.do모두저장(세션s)
    return 만든s
  }
}

export class model행사 extends model모임물<i행사dto> {
  constructor(state?: i행사dto) {
    super(model행사s.getInstance(), state)
  }

  override 자동필드ss = [
    this.필드_기본([
      { key: '구분', label: '구분', type: 타입지정.선택0, options: i행사구분options, show: true },
      ...this.필드_기간()
    ]),
    this.필드_신청받기()
  ]

  override generate() {
    return { ...this.init(), title: '행사' }
  }

  override init() {
    return {
      ...this.모임init(),
      category: 'EVENT' as i행사구분
    }
  }

  override get icon() { return this.구분 === 'CONFERENCE' ? 'i-ph-presentation-chart-light' : 'i-ph-confetti-light' }

  get 구분() { return (this.state?.category ?? 'EVENT') as i행사구분 }
  set 구분(v: i행사구분) { this.state.category = v }

  _세션s = computed(() => model행사s.getInstance().getsBy상위(this.stateId))
  get 세션s() { return toValue(this._세션s) }

  protected override get 사진태그s() { return ['conference', 'event'] }
  protected override get 기본썸네일() { return '/img/thumb/event.svg' }
}

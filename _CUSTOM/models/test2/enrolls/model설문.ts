import { 타입지정, getRepoInstance } from '~utils/models'
import { model콘텐츠물s, model문답물, type i콘텐츠물dto } from './_콘텐츠물'
import { i설문seed } from '../seeds/model설문.seed'

export type i설문구분 = 'PRE' | 'POST' | 'SATISFACTION' | 'ETC'
export const i설문구분options = [
  { label: '사전', value: 'PRE' },
  { label: '사후', value: 'POST' },
  { label: '만족도', value: 'SATISFACTION' },
  { label: '기타', value: 'ETC' }
] as const

export interface i설문dto extends i콘텐츠물dto {
  category: i설문구분
}

export class model설문s extends model콘텐츠물s<model설문, i설문dto> {
  protected override seed = i설문seed
  static getInstance = () => getRepoInstance('model설문s', () => new model설문s())

  private constructor() {
    super(model설문, 'surveys')
  }

  override _generate = () => new model설문().generate()
  override _init = () => new model설문().init()
}

export class model설문 extends model문답물<i설문dto> {
  constructor(state?: i설문dto) {
    super(model설문s.getInstance(), state)
  }

  override 자동필드ss = [
    this.필드_기본([
      { key: '구분', label: '구분', type: 타입지정.선택0, options: i설문구분options, show: true }
    ]),
    this.필드_신청받기()
  ]

  override generate() {
    return { ...this.init(), title: '설문' }
  }

  override init() {
    return {
      title: '',
      description: '',
      body: '',
      thumbnail: null,
      category: 'PRE' as i설문구분
    }
  }

  override get sub() {
    const 구분 = i설문구분options.find(x => x.value === this.구분)?.label ?? ''
    return [구분, `문항 ${this.문항s.length}`, `응답 ${this.응답수}`].filter(Boolean).join(' · ')
  }

  override get icon() { return 'i-ph-clipboard-text-light' }

  get 구분() { return (this.state?.category ?? 'PRE') as i설문구분 }
  set 구분(v: i설문구분) { this.state.category = v }

  protected override get 사진태그s() { return ['survey', 'form'] }
  protected override get 기본썸네일() { return '/img/thumb/survey.svg' }
}

import { 타입지정, getRepoInstance } from '~utils/models'
import { model콘텐츠물s, model문답물, type i콘텐츠물dto } from './_콘텐츠물'
import { i투표seed } from '../seeds/model투표.seed'

export interface i투표dto extends i콘텐츠물dto {
  /**
     * 결과에서 응답자를 가린다. **표시상 익명**이고 DB에는 신청이 남는다 —
     * 신청 행이 없으면 중복 투표를 막을 방법이 사라진다.
     */
  isAnonymous: boolean
}

export class model투표s extends model콘텐츠물s<model투표, i투표dto> {
  protected override seed = i투표seed
  static getInstance = () => getRepoInstance('model투표s', () => new model투표s())

  private constructor() {
    super(model투표, 'polls')
  }

  override _generate = () => new model투표().generate()
  override _init = () => new model투표().init()
}

export class model투표 extends model문답물<i투표dto> {
  constructor(state?: i투표dto) {
    super(model투표s.getInstance(), state)
  }

  override 자동필드ss = [
    this.필드_기본([
      { key: 'is익명', label: '익명 집계', type: 타입지정._.is체크, show: true }
    ]),
    this.필드_신청받기()
  ]

  override generate() {
    return { ...this.init(), title: '투표' }
  }

  override init() {
    return {
      title: '',
      description: '',
      body: '',
      thumbnail: null,
      isAnonymous: true
    }
  }

  override get sub() {
    return [`문항 ${this.문항s.length}`, `참여 ${this.응답수}`, this.is익명 ? '익명' : '기명'].join(' · ')
  }

  override get icon() { return 'i-ph-check-square-offset-light' }

  get is익명() { return this.state?.isAnonymous ?? true }
  set is익명(v: boolean) { this.state.isAnonymous = !!v }

  protected override get 사진태그s() { return ['vote', 'ballot'] }
  protected override get 기본썸네일() { return '/img/thumb/poll.svg' }
}

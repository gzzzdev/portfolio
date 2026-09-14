import { 타입지정, getRepoInstance } from '~utils/models'
import { model콘텐츠물s, model문답물, type i콘텐츠물dto } from './_콘텐츠물'
import { 문항만점 } from './문항'
import { i퀴즈seed } from '../seeds/model퀴즈.seed'

export interface i퀴즈dto extends i콘텐츠물dto {
  /** 합격 기준 점수. 만점은 문항 배점의 합이라 저장하지 않는다(두 곳에 두면 어긋난다). */
  passScore: number
  /** 허용 응시 횟수. 0이면 제한 없음. */
  maxAttempts: number
}

export class model퀴즈s extends model콘텐츠물s<model퀴즈, i퀴즈dto> {
  protected override seed = i퀴즈seed
  static getInstance = () => getRepoInstance('model퀴즈s', () => new model퀴즈s())

  private constructor() {
    super(model퀴즈, 'quizzes')
  }

  override _generate = () => new model퀴즈().generate()
  override _init = () => new model퀴즈().init()
}

export class model퀴즈 extends model문답물<i퀴즈dto> {
  constructor(state?: i퀴즈dto) {
    super(model퀴즈s.getInstance(), state)
  }

  override 자동필드ss = [
    this.필드_기본([
      { key: '합격점수', label: '합격점수', type: 타입지정._.숫자2, props: { min: 0, max: 100, step: 5, suffix: '(점)' }, show: true },
      { key: '응시제한', label: '응시제한', type: 타입지정._.숫자2, props: { min: 0, max: 10, step: 1, suffix: '(회, 0=무제한)' }, show: true }
    ]),
    this.필드_신청받기()
  ]

  protected override is저장가능(): boolean {
    if (!super.is저장가능()) return false
    // 만점보다 높은 합격선은 아무도 통과 못 한다 — 저장 전에 알린다.
    if (this.만점 > 0 && this.합격점수 > this.만점) {
      useAlert().error('저장할 수 없습니다', `합격점수(${this.합격점수})가 만점(${this.만점})보다 높습니다.`)
      return false
    }
    return true
  }

  override generate() {
    return { ...this.init(), title: '퀴즈' }
  }

  override init() {
    return {
      title: '',
      description: '',
      body: '',
      thumbnail: null,
      passScore: 60,
      maxAttempts: 1
    }
  }

  override get sub() {
    return [`문항 ${this.문항s.length}`, `만점 ${this.만점}`, `합격 ${this.합격점수}`].join(' · ')
  }

  override get icon() { return 'i-ph-exam-light' }

  get 합격점수() {
    const n = Number(this.state?.passScore ?? 0)
    return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0
  }

  set 합격점수(v: number) {
    const n = Number(v)
    this.state.passScore = Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0
  }

  get 응시제한() {
    const n = Number(this.state?.maxAttempts ?? 0)
    return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0
  }

  set 응시제한(v: number) {
    const n = Number(v)
    this.state.maxAttempts = Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0
  }

  /** 만점 = 채점 문항 배점의 합. **파생값이라 저장하지 않는다.** */
  get 만점() { return 문항만점(this.문항s) }

  protected override get 사진태그s() { return ['quiz', 'exam'] }
  protected override get 기본썸네일() { return '/img/thumb/quiz.svg' }
}

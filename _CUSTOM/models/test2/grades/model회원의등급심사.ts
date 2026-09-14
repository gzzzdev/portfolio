import { BaseModels2, BaseModel2, 타입지정, getRepoInstance, hasServerPk } from '~utils/models'
import type { BaseXXDto, BaseXX } from '~utils/models'
import { computed, toValue } from 'vue'

import { model회원s, type model회원 } from '~models/test2'
import { model등급s, type model등급 } from './model등급'
import { model등급요건s } from './'
import { model등급별심사s, type model등급별심사 } from './'
import { model등급심사s, type model등급심사 } from './model등급심사'

import { model회원이력s } from '../_basics/model회원이력'

export type i회원의등급심사저장상태 = 'candidate' | 'passed' | 'fail'
export type i회원의등급심사상태 = i회원의등급심사저장상태 | '기준통과'
export type iDo심사결과 = 'passed' | 'fail' | 'skipped'
export type iDo심사Opts = { silent?: boolean }
export const i회원의등급심사상태options = [
  { label: '대상자', value: 'candidate' },
  { label: '기준통과', value: '기준통과' },
  { label: '합격', value: 'passed', color: 'success' },
  { label: '불합격', value: 'fail', color: 'error' }
] as const
export const i회원의등급심사저장상태options = [
  { label: '대상자', value: 'candidate' },
  { label: '기준통과', value: '기준통과' },
  { label: '합격', value: 'passed', color: 'success' },
  { label: '불합격', value: 'fail', color: 'error' }
] as const

export interface i회원의등급심사dto extends BaseXXDto {

  memberId: string
  perGradingId: string
  /** 비정규화 — per-grading.gradingEventId 와 동기화 */
  gradingEventId: string
  fromGradeId: string
  targetGradeId: string
  status: i회원의등급심사저장상태
  trainingScore: number
  testScore: number
}

export interface i회원의등급심사 extends BaseXX {
  회원: model회원 | null
  등급별심사: model등급별심사 | null
  등급심사: model등급심사 | null
  현재등급: model등급 | null
  목표등급: model등급 | null
  trainingScore: number
  testScore: number
  상태: i회원의등급심사상태
  do심사: (opts?: iDo심사Opts) => Promise<iDo심사결과 | void>
  _do승급: () => Promise<void>
}

export class model회원의등급심사s extends BaseModels2<model회원의등급심사, i회원의등급심사dto> {
  protected etcFields = []
  override 필터조건ss = [
    this.라디오필터그룹(
      i회원의등급심사상태options.map(item => ({
        label: item.label,
        value: (row: model회원의등급심사) => row.상태 === item.value
      })),
      { title: '상태' }
    )
  ]

  static getInstance = () => getRepoInstance('model회원의등급심사s', () => new model회원의등급심사s())

  private constructor() {
    super(model회원의등급심사, 'member-gradings', { hasConfirm: false })
  }

  override _generate = () => new model회원의등급심사().generate()
  override _init = () => new model회원의등급심사().init()

  get다음등급 = (from: model등급): model등급 | null =>
    model등급s.getInstance().get다음등급(from)

  get최소등급 = (): model등급 | null => model등급s.getInstance().get기본등급()

  resolveFromTargetFor회원 = (회원: model회원) => {
    const 이력 = model회원이력s.getInstance().get현재등급이력By회원(회원)
    const fromId = String(이력?.state?.entityId ?? '').trim()
    if (!fromId) {
      const 기본 = this.get최소등급()
      const target = 기본 ? this.get다음등급(기본) : null
      return { from: null as model등급 | null, target }
    }
    const from = model등급s.getInstance().getById(fromId) ?? null
    if (!from) return { from: null, target: null }
    return { from, target: this.get다음등급(from) }
  }

  getsBy등급별심사 = (등급별심사: model등급별심사): model회원의등급심사[] =>
    toValue(this.list).filter(row => row.등급별심사?.isSame(등급별심사))

  getsBy등급심사 = (등급심사: model등급심사): model회원의등급심사[] =>
    toValue(this.list).filter(row => row.등급심사?.isSame(등급심사))

  getsBy회원 = (회원: model회원): model회원의등급심사[] =>
    toValue(this.list)
      .filter(row => row.회원?.isSame(회원))
      .toSorted((a, b) =>
        String(b.stateId ?? '').localeCompare(String(a.stateId ?? ''))
      )

  buildDtoFor심사 = (memberId: string, perGradingId: string) => {
    const dto = this._init()
    dto.memberId = String(memberId ?? '').trim()
    dto.perGradingId = String(perGradingId ?? '').trim()

    const per = model등급별심사s.getInstance().getById(dto.perGradingId)
    if (per) {
      dto.gradingEventId = per.gradingEventId
      dto.targetGradeId = per.targetGradeId
    }

    const 회원 = model회원s.getInstance().getById(dto.memberId)
    if (회원) {
      const { from, target } = this.resolveFromTargetFor회원(회원)
      dto.fromGradeId = from ? String(from.stateId ?? '') : ''
      if (target) dto.targetGradeId = String(target.stateId ?? '')
    }

    return dto
  }

  do빈생성_등급별심사관점 = async (perGradingId: string) => {
    const pid = String(perGradingId ?? '').trim()
    if (!hasServerPk(pid)) return

    const per = model등급별심사s.getInstance().getById(pid)
    if (!per) {
      useAlert().error('회원의 등급심사 생성 불가', '등급별 심사를 찾을 수 없습니다.')
      return
    }

    const 회원s = toValue(model회원s.getInstance().회원s)
    if (!회원s.length) {
      useAlert().show('회원의 등급심사 생성 불가', '선택 가능한 회원이 없습니다.')
      return
    }
    if (import.meta.server) return

    const modal = useModalFields()
    const result = await modal.open({
      title: '심사 대상 회원 추가',
      description: `${per.label}에 포함할 회원을 선택해주세요`,
      steps: [
        {
          key: 'memberId',
          kind: 'select',
          label: '회원',
          required: true,
          items: 회원s.map(item => ({ label: item.label, value: item.stateId }))
        }
      ]
    })
    const memberId = String(result?.memberId ?? '').trim()
    if (!memberId) return

    const existing = this.getsBy등급별심사(per).some(
      row => String(row.state.memberId ?? '').trim() === memberId
    )
    if (existing) {
      useAlert().error('회원의 등급심사 생성 불가', '이미 등록된 회원입니다.')
      return
    }

    const 회원 = model회원s.getInstance().getById(memberId)
    if (회원 && !per.is승급대상(회원)) {
      useAlert().error(
        '회원의 등급심사 생성 불가',
        '이 회원은 해당 등급 승급 대상이 아닙니다.'
      )
      return
    }

    return super.empty(this.buildDtoFor심사(memberId, pid))
  }

  /** @deprecated 등급심사 회차 관점 — per-grading 경로 사용 권장 */
  do빈생성_등급심사관점 = async (gradingEventId: string) => {
    const eid = String(gradingEventId ?? '').trim()
    if (!hasServerPk(eid)) return

    const 등급심사 = model등급심사s.getInstance().getById(eid)
    const tracks = 등급심사 ? model등급별심사s.getInstance().getsBy등급심사(등급심사) : []
    if (!tracks.length) {
      useAlert().error('회원의 등급심사 생성 불가', '등급별 심사 트랙이 없습니다. 회차를 먼저 저장해주세요.')
      return
    }

    const 회원s = toValue(model회원s.getInstance().회원s)
    if (!회원s.length) {
      useAlert().show('회원의 등급심사 생성 불가', '선택 가능한 회원이 없습니다.')
      return
    }
    if (import.meta.server) return

    const modal = useModalFields()
    const result = await modal.open({
      title: '심사 대상 회원 추가',
      description: '등급별 심사 트랙과 회원을 선택해주세요',
      steps: [
        {
          key: 'perGradingId',
          kind: 'select',
          label: '등급별 심사',
          required: true,
          items: tracks.map(item => ({ label: item.label, value: item.stateId }))
        },
        {
          key: 'memberId',
          kind: 'select',
          label: '회원',
          required: true,
          items: 회원s.map(item => ({ label: item.label, value: item.stateId }))
        }
      ]
    })
    const perGradingId = String(result?.perGradingId ?? '').trim()
    const memberId = String(result?.memberId ?? '').trim()
    if (!perGradingId || !memberId) return

    const per = model등급별심사s.getInstance().getById(perGradingId)
    const existing
      = !!per
        && this.getsBy등급별심사(per).some(
          row => String(row.state.memberId ?? '').trim() === memberId
        )
    if (existing) {
      useAlert().error('회원의 등급심사 생성 불가', '이미 등록된 회원입니다.')
      return
    }

    return super.empty(this.buildDtoFor심사(memberId, perGradingId))
  }
}

export class model회원의등급심사 extends BaseModel2<i회원의등급심사dto> implements i회원의등급심사 {
  constructor(state?: i회원의등급심사dto) {
    super(model회원의등급심사s.getInstance(), state)
  }

  bindModel = null as any
  override afterCreate = () => {}
  override beforeSave = () => true
  override afterSave = () => {
    if (this.상태 !== 'passed') return
    if (!this.is합격기준충족()) {
      if (import.meta.server) return
      const cond = model등급요건s.getInstance().getByGradeId(String(this.목표등급?.stateId ?? ''))
      const 미충족
        = cond?.get미충족(this.trainingScore, this.testScore, this.testScore).join(', ') ?? '조건 미충족'
      const msg = [
        `${this.label}`,
        '합격 기준을 충족하지 않았습니다.',
        미충족 ? `(${미충족})` : '',
        '그래도 승급 처리할까요?'
      ]
        .filter(Boolean)
        .join('\n')
      if (!confirm(msg)) return
    }
    void this._do승급()
  }

  override 자동필드ss = [
    {
      label: '기본',
      list: [
        {
          key: 'trainingScore',
          label: '수련 시간',
          type: 타입지정._.숫자2,
          show: true,
          props: { min: 0, max: 5000, step: 1 }
        },
        {
          key: 'testScore',
          label: '필기 점수',
          type: 타입지정._.숫자2,
          show: true,
          props: { min: 0, max: 100, step: 1 }
        },
        {
          key: '상태',
          label: '상태',
          type: 타입지정.선택0,
          options: i회원의등급심사저장상태options,
          props: { type: 'radio' },
          canEdit: false, // do심사를 통해서만 제어가능하도록
          show: true
        }
      ]
    }
  ]

  override 자동버튼s = this.기본버튼s.concat([
    {
      key: 'do심사',
      label: '심사',
      icon: 'i-lucide-badge-check',
      show: computed(() => this.상태 === 'candidate' || this.상태 === '기준통과'),
      func: () => this.do심사()
    }
  ])

  override generate() {
    const statusRaw = this.state?.status
    const status: i회원의등급심사저장상태
      = statusRaw === 'passed' || statusRaw === 'fail' || statusRaw === 'candidate'
        ? statusRaw
        : 'candidate'

    const dto = {
      ...this.init(),
      memberId: String(this.state?.memberId ?? ''),
      perGradingId: String(this.state?.perGradingId ?? ''),
      gradingEventId: String(this.state?.gradingEventId ?? ''),
      fromGradeId: String(this.state?.fromGradeId ?? ''),
      targetGradeId: String(this.state?.targetGradeId ?? ''),
      status,
      trainingScore: this._normalizeTrainingScore(this.state?.trainingScore),
      testScore: this._normalizeTestScore(this.state?.testScore)
    }
    this._syncFromPerGrading(dto)
    return dto
  }

  override init() {
    return {
      memberId: '',
      perGradingId: '',
      gradingEventId: '',
      fromGradeId: '',
      targetGradeId: '',
      status: 'candidate' as i회원의등급심사저장상태,
      trainingScore: 0,
      testScore: 0
    }
  }

  private _syncFromPerGrading(dto: Omit<i회원의등급심사dto, 'id'>) {
    const per = model등급별심사s.getInstance().getById(String(dto.perGradingId ?? '').trim())
    if (!per) return
    dto.gradingEventId = per.gradingEventId
    if (!dto.targetGradeId) dto.targetGradeId = per.targetGradeId
  }

  private _normalizeTrainingScore(v: unknown) {
    const n = Number(v ?? 0)
    if (!Number.isFinite(n)) return 0
    return Math.min(5000, Math.max(0, Math.floor(n)))
  }

  private _normalizeTestScore(v: unknown) {
    const n = Number(v ?? 0)
    if (!Number.isFinite(n)) return 0
    return Math.min(100, Math.max(0, Math.floor(n)))
  }

  private _normalize저장상태(v: unknown): i회원의등급심사저장상태 {
    if (v === 'passed' || v === 'fail' || v === 'candidate') return v
    return 'candidate'
  }

  get 회원() {
    return model회원s.getInstance().getById(String(this.state?.memberId ?? '')) ?? null
  }

  get 등급별심사() {
    return model등급별심사s.getInstance().getById(String(this.state?.perGradingId ?? '')) ?? null
  }

  get 등급심사() {
    const fromPer = this.등급별심사?.등급심사
    if (fromPer) return fromPer
    return model등급심사s.getInstance().getById(String(this.state?.gradingEventId ?? '')) ?? null
  }

  get 현재등급() {
    const id = String(this.state?.fromGradeId ?? '').trim()
    if (!id) return null
    return model등급s.getInstance().getById(id) ?? null
  }

  get 목표등급() {
    const id = String(this.state?.targetGradeId ?? '').trim()
    if (!id) return null
    return model등급s.getInstance().getById(id) ?? null
  }

  get trainingScore() {
    return this._normalizeTrainingScore(this.state?.trainingScore)
  }

  set trainingScore(v: number) {
    this.state.trainingScore = this._normalizeTrainingScore(v)
  }

  get testScore() {
    return this._normalizeTestScore(this.state?.testScore)
  }

  set testScore(v: number) {
    this.state.testScore = this._normalizeTestScore(v)
  }

  get 상태(): i회원의등급심사상태 {
    const v = this._normalize저장상태(this.state?.status)
    if (this.state && this.state.status !== v) this.state.status = v

    if (v === 'passed' || v === 'fail') return v
    return this.is합격기준충족() ? '기준통과' : 'candidate'
  }

  set 상태(v: i회원의등급심사저장상태) {
    if (!this.state) return
    this.state.status = this._normalize저장상태(v)
  }

  override get label() {
    const 회원명 = this.회원?.이름 ?? '회원'
    const 심사명 = this.등급별심사?.label ?? this.등급심사?.label ?? '등급심사'
    return `${회원명} · ${심사명}`
  }

  override get sub() {
    const from = this.현재등급?.sub ?? '-'
    const target = this.목표등급?.sub ?? '-'
    const statusLabel
      = i회원의등급심사상태options.find(row => row.value === this.상태)?.label ?? this.상태
    return `${from} → ${target} · ${statusLabel}`
  }

  is합격기준충족 = () => {
    const target = this.목표등급
    if (!target) return false
    const cond = model등급요건s.getInstance().getByGradeId(String(target.stateId ?? ''))
    if (!cond) return true
    return cond.is충족(this.trainingScore, this.testScore, this.testScore)
  }

  do심사 = async (opts?: iDo심사Opts): Promise<iDo심사결과 | void> => {
    const silent = !!opts?.silent

    if (this.상태 !== 'candidate' && this.상태 !== '기준통과') {
      if (!silent) useAlert().error('심사 불가', '이미 심사가 완료된 건입니다.')
      return silent ? 'skipped' : undefined
    }
    const target = this.목표등급
    if (!target) {
      if (!silent) useAlert().error('심사 불가', '목표 등급이 없습니다. (이미 최고 등급)')
      return silent ? 'skipped' : undefined
    }

    const per = this.등급별심사
    if (per && String(target.stateId ?? '') !== per.targetGradeId) {
      if (!silent) useAlert().error('심사 불가', '목표 등급이 등급별 심사 트랙과 일치하지 않습니다.')
      return silent ? 'skipped' : undefined
    }

    const cond = model등급요건s.getInstance().getByGradeId(String(target.stateId ?? ''))

    if (this.is합격기준충족()) {
      this.상태 = 'passed'
      await this.do저장(false, false)
      if (!silent) {
        useAlert().success(
          '등급 심사',
          `${this.회원?.이름 ?? '회원'} 합격 · ${target.label}(으)로 승급했습니다.`
        )
      }
      return silent ? 'passed' : undefined
    }

    this.상태 = 'fail'
    await this.do저장(false, false)
    if (!silent) {
      const 미충족
        = cond?.get미충족(this.trainingScore, this.testScore, this.testScore).join(', ') ?? '조건 미충족'
      useAlert().show(
        '등급 심사',
        `${this.회원?.이름 ?? '회원'} 불합격 (수련시간 점수 ${this.trainingScore}, 필기시험 점수 ${this.testScore}${미충족 ? ` · ${미충족}` : ''})`
      )
    }
    return silent ? 'fail' : undefined
  }

  _do승급 = async () => {
    const 회원 = this.회원
    const target = this.목표등급
    if (!회원 || !target) return
    await model회원이력s.getInstance().do등급기록(회원, target)
  }
}

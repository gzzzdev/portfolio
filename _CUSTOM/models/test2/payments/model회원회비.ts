import { mDayjs } from '~utils'
import { BaseModels2, BaseModel2, 타입지정, getRepoInstance, hasServerPk } from '~utils/models'
import type { BaseXXDto, BaseXX } from '~utils/models'
import { computed, toValue } from 'vue'
import { model회원s, type model회원 } from '~models/test2'
import { model회비s, type model회비 } from './model회비'
import {
  i결제표시상태options,
  model결제s,
  type model결제,
  type i결제표시상태
} from './model결제'

export type i회비유효상태
  = | 'NOT_STARTED'
    | 'ACTIVE'
    | 'EXPIRING_SOON'
    | 'IN_GRACE'
    | 'EXPIRED'
export const i회비유효상태options = [
  { label: '납부전', value: 'NOT_STARTED', color: 'warning' },
  { label: '유효기간 내', value: 'ACTIVE' },
  { label: '유효기간 만료 임박', value: 'EXPIRING_SOON', color: 'warning' },
  { label: '만료 유예', value: 'IN_GRACE', color: 'error' },
  { label: '최종 만료', value: 'EXPIRED', color: 'error' }
] as const

export type i회비레거시상태
  = | 'UNSUBSCRIBED'
    | 'PAYING'
    | 'PAYMENT_FAILED'
    | 'SUBSCRIBED'
    | 'REFUNDED'
    | 'FINALLY_EXPIRED'

export const i회비레거시상태options = [
  { label: '미납부', value: 'UNSUBSCRIBED' },
  { label: '결제 진행 중', value: 'PAYING', color: 'warning' },
  { label: '결제 실패', value: 'PAYMENT_FAILED', color: 'error' },
  { label: '유효기간 내', value: 'SUBSCRIBED' },
  { label: '중도해지', value: 'REFUNDED', color: 'warning' },
  { label: '최종 만료', value: 'FINALLY_EXPIRED' }
] as const

export interface i회원회비dto extends BaseXXDto {

  memberId: string
  /** 정기회비(periodic-fee) 행과 연결 */
  periodicFeeId?: string | null
  /** 입회비·기타 회비 청구(fee) 행과 연결 */
  feeId?: string | null
  paymentId: string | null
  paidAmount: number | null
  paidAt: string | null
  startDate: string
  endDate: string
  alertDays?: number | null
  graceDays?: number | null
  changedAt?: string | null
}

export interface i회원회비 extends BaseXX {
  회원: model회원 | null
  결제: model결제 | null
  결제Id: string | null
  결제상태: i결제표시상태
  is현재활성회비: boolean
  is이력: boolean
  현재이력구분: '현재' | '이력'
  회비유효상태: i회비유효상태
  기간상태: i회비유효상태
  dynamicState: i회비레거시상태
  시작일: ReturnType<typeof mDayjs>
  종료일: ReturnType<typeof mDayjs>
  alertDays: number
  graceDays: number
  is유효: boolean
  is회비완납: boolean
  do결제: () => Promise<unknown>
}

export type i회원회비기간모드
  = | 'SUBSCRIPTION_YEAR'
    | 'FISCAL_YEAR'
    | 'FISCAL_Q2'
    | 'FISCAL_Q4'
    | 'FISCAL_Q12'

export class model회원회비s extends BaseModels2<model회원회비, i회원회비dto> {
  protected etcFields = []
  override 필터조건ss = [
    this.라디오필터그룹(
      [
        { label: '현재', value: (row: model회원회비) => row.is현재활성회비 },
        { label: '이력', value: (row: model회원회비) => row.is이력 }
      ],
      { title: '구분', initialValues: ['현재'] }
    )
  ]

  static getInstance = () => getRepoInstance('model회원회비s', () => new model회원회비s())

  private constructor() {
    super(model회원회비, 'member-fees')
  }

  override _generate = () => new model회원회비().generate()
  override _init = () => new model회원회비().init()

  private 최신순 = (a: model회원회비, b: model회원회비) =>
    mDayjs(b.state?.startDate ?? '').valueOf() - mDayjs(a.state?.startDate ?? '').valueOf()

  getsBy회원 = (회원: model회원): model회원회비[] =>
    toValue(this.list)
      .filter(row => row.회원?.isSame(회원))
      .toSorted(this.최신순)

  /**
   * 정기회비(periodic-fees)에 묶인 회원회비 목록.
   *
   * 여기만 인스턴스가 아니라 id를 받는다 — `model정기회비`는 폐기됐다(`_구독과회비.ts` 4번).
   * 가리킬 모델이 생기면 다른 `getsBy*`와 같은 꼴로 좁힌다.
   */
  getsBy정기회비 = (정기회비id: string): model회원회비[] => {
    if (!hasServerPk(정기회비id)) return []
    const pid = String(정기회비id).trim()
    return toValue(this.list)
      .filter(row => String(row.state.periodicFeeId ?? '').trim() === pid)
      .toSorted(this.최신순)
  }

  /** 입회비·기타 회비 청구(fees)에 묶인 회원회비 목록 */
  getsBy회비상품 = (회비: model회비): model회원회비[] =>
    toValue(this.list)
      .filter(row => row.연결회비상품?.isSame(회비))
      .toSorted(this.최신순)

  get최신회비By회원(memberId: string): model회원회비 | null {
    const 회원 = model회원s.getInstance().getById(memberId)
    if (!회원) return null
    return this.getsBy회원(회원)[0] ?? null
  }

  ensureFor회원 = async (memberId: string) => {
    const id = String(memberId ?? '').trim()
    if (!id) return null
    const existing = this.get최신회비By회원(id)
    if (existing) return existing
    return this.emptyWith(id)
  }

  do빈생성_회원관점 = async (회원: { id?: string | number | null, 이름?: string }) => {
    const memberId = String(회원?.id ?? '').trim()
    if (!memberId) return
    return this.ensureFor회원(memberId)
  }

  /** `emptyWith` / bulk `creates` 공통 — 정기회비에 묶인 신규 행 DTO */
  buildDtoFor정기회비 = (
    memberId: string,
    periodicFeeId?: string | null,
    기준일?: string | number | Date | ReturnType<typeof mDayjs>
  ) => {
    const dto = this._init()
    dto.memberId = String(memberId ?? '').trim()
    dto.periodicFeeId
      = periodicFeeId != null && String(periodicFeeId).trim()
        ? String(periodicFeeId).trim()
        : null
    dto.feeId = null
    const 기간기본값 = model회원회비.get기본기간(기준일)
    dto.startDate = 기간기본값.startDate
    dto.endDate = 기간기본값.endDate
    dto.changedAt = mDayjs().toISOString()
    return dto
  }

  /** 입회비·기타 회비 청구(fees)에 묶인 신규 행 DTO */
  buildDtoFor회비상품 = (memberId: string, feeId: string) => {
    const dto = this._init()
    dto.memberId = String(memberId ?? '').trim()
    dto.feeId
      = feeId != null && String(feeId).trim() ? String(feeId).trim() : null
    dto.periodicFeeId = null
    const 기간기본값 = model회원회비.get기본기간()
    dto.startDate = 기간기본값.startDate
    dto.endDate = 기간기본값.endDate
    dto.changedAt = mDayjs().toISOString()
    return dto
  }

  /** @deprecated `buildDtoFor정기회비` 사용 */
  buildDtoFor회비청구 = this.buildDtoFor정기회비

  private emptyWith = (memberId: string, periodicFeeId?: string | null) => {
    return super.empty(this.buildDtoFor정기회비(memberId, periodicFeeId))
  }

  /** 회비 청구(`periodicFeeId`)에 묶인 빈 회원회비 행을 API로 추가 — 일괄 등록 등에서 재사용 */
  createEmptyFor회비청구 = (memberId: string, periodicFeeId: string) => {
    const mid = String(memberId ?? '').trim()
    const sid = String(periodicFeeId ?? '').trim()
    if (!mid || !sid) return Promise.resolve(undefined)
    return this.emptyWith(mid, sid)
  }

  /** 선택한 회원을 해당 회비 청구에 연결하는 신규 회원회비 행 생성 (`fee.id`) */
  do빈생성_회비관점 = async (periodicFeeId: string) => {
    const pid = String(periodicFeeId ?? '').trim()
    if (!hasServerPk(pid)) return
    const 회원s = toValue(model회원s.getInstance().회원s)
    if (!회원s.length) {
      useAlert().show('회원회비 생성 불가', '선택 가능한 회원이 없습니다.')
      return
    }
    if (import.meta.server) return

    const modal = useModalFields()
    const result = await modal.open({
      title: '납부 대상 회원 추가',
      description: '이 회비 청구에 포함할 회원을 선택해주세요',
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
    return this.emptyWith(memberId, pid)
  }

  override async empty() {
    const 회원s = toValue(model회원s.getInstance().회원s)
    if (!회원s.length) {
      useAlert().show('회원회비 생성 불가', '선택 가능한 회원이 없습니다.')
      return
    }
    if (import.meta.server) return

    const modal = useModalFields()
    const result = await modal.open({
      title: '회원회비 생성',
      description: '회비 기록을 생성할 회원을 선택해주세요',
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
    return this.ensureFor회원(memberId)
  }
}

export class model회원회비 extends BaseModel2<i회원회비dto> implements i회원회비 {
  static 기간모드: i회원회비기간모드 = 'FISCAL_Q12'

  static get기본기간(기준일?: string | number | Date | ReturnType<typeof mDayjs>) {
    const base = mDayjs(기준일 ?? mDayjs()).startOf('day')
    if (this.기간모드 === 'SUBSCRIPTION_YEAR') {
      return {
        startDate: base.format('YYYY-MM-DD'),
        endDate: base.add(1, 'year').format('YYYY-MM-DD')
      }
    }
    const 회계년시작 = base.startOf('year')
    const start = 회계년시작
    const end = 회계년시작.endOf('year').startOf('day')
    return {
      startDate: start.format('YYYY-MM-DD'),
      endDate: end.format('YYYY-MM-DD')
    }
  }

  constructor(state?: i회원회비dto) {
    super(model회원회비s.getInstance(), state)
  }

  override 자동필드ss = [
    {
      label: '기본',
      list: [
        { key: '현재이력구분', label: '구분', show: true, props: { readonly: true }, canEdit: false },
        { key: '회비유효상태', label: '회비·유효기간', show: true, type: 타입지정.선택0, options: i회비유효상태options, props: { type: 'radio', readonly: true }, canEdit: false },
        { key: '결제상태', label: '결제상태', show: true, type: 타입지정.선택0, options: i결제표시상태options, props: { readonly: true, type: 'radio' }, canEdit: false },
        { key: 'dynamicState', label: '레거시상태', show: false, type: 타입지정.선택0, options: i회비레거시상태options, props: { readonly: true, type: 'radio' }, canEdit: false },
        { key: '시작일', label: '시작일', show: true },
        { key: '종료일', label: '종료일', show: true },
        { key: 'alertDays', label: '만료전알림', show: true, type: 타입지정._.숫자2, props: { min: 0, max: 30, step: 1, suffix: '일' }, canEdit: !false },
        { key: 'graceDays', label: '만료유예일', show: true, type: 타입지정._.숫자2, props: { min: 0, max: 30, step: 1, suffix: '일' }, canEdit: !false },
        { key: 'is유효', label: '유효', show: true, props: { readonly: true }, canEdit: false }
      ]
    }
  ]

  override 자동버튼s = this.기본버튼s.concat([
    {
      key: 'do결제',
      label: '결제',
      icon: 'i-stash:wallet-light',
      show: computed(() => !this.is회비완납),
      func: () => this.do결제()
    }
  ])

  override generate() {
    const 기간기본값 = model회원회비.get기본기간()
    return {
      ...this.init(),
      memberId: String(this.state?.memberId ?? ''),
      periodicFeeId:
        String(this.state?.periodicFeeId ?? '').trim()
          ? String(this.state?.periodicFeeId).trim()
          : null,
      feeId:
        String(this.state?.feeId ?? '').trim() ? String(this.state?.feeId).trim() : null,
      paymentId: this.state?.paymentId ? String(this.state.paymentId) : null,
      paidAmount: Number.isFinite(Number(this.state?.paidAmount))
        ? Math.floor(Number(this.state?.paidAmount))
        : null,
      paidAt: this.state?.paidAt ?? null,
      startDate: this.state?.startDate ?? 기간기본값.startDate,
      endDate: this.state?.endDate ?? 기간기본값.endDate,
      alertDays: Number.isFinite(Number(this.state?.alertDays))
        ? Math.max(0, Math.floor(Number(this.state?.alertDays)))
        : 7,
      graceDays: Number.isFinite(Number(this.state?.graceDays))
        ? Math.max(0, Math.floor(Number(this.state?.graceDays)))
        : 3,
      changedAt: this.state?.changedAt ?? mDayjs().toISOString()
    }
  }

  override init() {
    const 기간기본값 = model회원회비.get기본기간()
    return {
      memberId: '',
      periodicFeeId: null,
      feeId: null,
      paymentId: null,
      paidAmount: null,
      paidAt: null,
      startDate: 기간기본값.startDate,
      endDate: 기간기본값.endDate,
      alertDays: 7,
      graceDays: 3,
      changedAt: mDayjs().toISOString()
    }
  }

  get 회원() {
    return model회원s.getInstance().getById(String(this.state?.memberId ?? '')) ?? null
  }

  get 결제Id() {
    const id = this.state?.paymentId
    return id && String(id).trim() ? String(id).trim() : null
  }

  set 결제Id(v: string | null) {
    const id = String(v ?? '').trim()
    this.state.paymentId = id || null
  }

  get 결제() {
    const id = this.결제Id
    if (!id) return null
    return model결제s.getInstance().getById(id) ?? null
  }

  get 시작일() {
    return mDayjs(this.state?.startDate)
  }

  set 시작일(v: ReturnType<typeof mDayjs>) {
    this.state.startDate = mDayjs(v).format('YYYY-MM-DD')
  }

  get 종료일() {
    return mDayjs(this.state?.endDate)
  }

  set 종료일(v: ReturnType<typeof mDayjs>) {
    this.state.endDate = mDayjs(v).format('YYYY-MM-DD')
  }

  get alertDays() {
    const n = Number(this.state?.alertDays ?? 7)
    if (!Number.isFinite(n)) return 7
    return Math.max(0, Math.floor(n))
  }

  set alertDays(v: number) {
    this.state.alertDays = Math.max(0, Math.floor(Number(v) || 0))
  }

  get graceDays() {
    const n = Number(this.state?.graceDays ?? 3)
    if (!Number.isFinite(n)) return 3
    return Math.max(0, Math.floor(n))
  }

  set graceDays(v: number) {
    this.state.graceDays = Math.max(0, Math.floor(Number(v) || 0))
  }

  get is유효() {
    const 기간상태 = this.기간상태_날짜기준
    return (
      기간상태 === 'ACTIVE'
      || 기간상태 === 'EXPIRING_SOON'
      || 기간상태 === 'IN_GRACE'
    )
  }

  /**
   * 이 납부 행이 묶인 정기회비(periodic-fee).
   *
   * ⚠ **이 축은 폐기됐다.** `model정기회비`는 test1에만 있었고 그 세트를 지우면서 같이 사라졌다
   * (`periodic-fees` 테이블도 없다). 그래서 여기는 언제나 `null`이고, 청구는 `연결회비상품`
   * (`feeId` → `model회비`) 한 축으로만 붙는다. `periodicFeeId`는 아무도 안 채우는 死 컬럼이라
   * 지울 수 있지만, 그러려면 `i회원회비dto`를 건드려야 해서 남겨뒀다.
   * 왜 축이 둘이었는지와 정리 방향은 `_구독과회비.ts` 4번에 적어뒀다.
   */
  get 연결정기회비(): null {
    return null
  }

  /** 입회비·기타 회비 청구(fee) — 결제 금액은 여기 `기본금액` 사용 */
  get 연결회비상품(): model회비 | null {
    const fid = String(this.state?.feeId ?? '').trim()
    if (!fid) return null
    return model회비s.getInstance().getById(fid) ?? null
  }

  get 결제예상금액() {
    const 상품 = this.연결회비상품
    if (!상품) return 0
    return Math.max(0, Math.floor(Number(상품.기본금액) || 0))
  }

  get 청구표시명() {
    return this.연결회비상품?.label ?? '회비'
  }

  get is결제완료() {
    const 결제상태 = this.결제상태
    return 결제상태 === 'PAID' || 결제상태 === 'EXEMPT'
  }

  get is회비완납() {
    return this.is유효 && this.is결제완료
  }

  get is현재활성회비() {
    const 회원 = this.회원
    const feeId = String(this.stateId ?? '')
    if (!회원 || !feeId) return false

    const currentMemberFeeId = String(회원.현재회비id ?? '').trim()
    if (currentMemberFeeId) {
      return currentMemberFeeId === feeId
    }

    // 레거시 호환: 현재회비id가 비어있다면 최신 회비를 현재로 본다.
    const memberId = String(회원.stateId ?? '')
    const latest = model회원회비s.getInstance().get최신회비By회원(memberId)
    const latestFeeId = String(latest?.stateId ?? '')
    return !!latestFeeId && latestFeeId === feeId
  }

  get is이력() {
    return !this.is현재활성회비
  }

  get 현재이력구분(): '현재' | '이력' {
    return this.is현재활성회비 ? '현재' : '이력'
  }

  private get 결제상태배지색상(): 'neutral' | 'warning' | 'error' {
    const map: Record<i결제표시상태, 'neutral' | 'warning' | 'error'> = {
      UNSUBSCRIBED: 'neutral',
      READY: 'warning',
      PAID: 'neutral',
      FAILED: 'error',
      REFUNDED: 'warning',
      EXEMPT: 'neutral'
    }
    return map[this.결제상태] ?? 'neutral'
  }

  _badges = computed(() => {
    const 구분배지 = {
      label: this.현재이력구분
    }
    if (!this.is현재활성회비) return [구분배지]

    const 상태옵션 = i회비유효상태options.find(item => item.value === this.회비유효상태)
    const 결제옵션 = i결제표시상태options.find(item => item.value === this.결제상태)
    return [
      구분배지,
      {
        label: 상태옵션?.label ?? '상태확인',
        color: 상태옵션?.color ?? 'neutral'
      },
      {
        label: 결제옵션?.label ?? '결제상태',
        color: this.결제상태배지색상
      }
    ]
  })

  override get badges() {
    return toValue(this._badges)
  }

  get 결제상태(): i결제표시상태 {
    if (this.연결회비상품 && this.결제예상금액 <= 0) return 'EXEMPT'
    const 결제 = this.결제
    if (결제) return 결제.결제상태
    if (String(this.state?.paidAt ?? '').trim()) return 'PAID'
    return 'UNSUBSCRIBED'
  }

  private get 기간상태_날짜기준(): i회비유효상태 {
    const now = mDayjs().startOf('day')
    const start = this.시작일.startOf('day')
    const end = this.종료일.startOf('day')
    if (now.isBefore(start)) return 'NOT_STARTED'
    if (now.isSameOrBefore(end, 'day')) {
      const alertDays = this.alertDays
      if (alertDays > 0) {
        const alertStart = end.subtract(alertDays, 'day')
        if (now.isSameOrAfter(alertStart, 'day')) return 'EXPIRING_SOON'
      }
      return 'ACTIVE'
    }
    const graceDays = this.graceDays
    if (graceDays > 0) {
      const graceEnd = end.add(graceDays, 'day')
      if (now.isSameOrBefore(graceEnd, 'day')) return 'IN_GRACE'
    }
    return 'EXPIRED'
  }

  get 회비유효상태(): i회비유효상태 {
    const 결제상태 = this.결제상태
    if (결제상태 === 'PAID' || 결제상태 === 'EXEMPT') return this.기간상태_날짜기준
    // 결제 확정 전 단계는 권한 관점에서 '시작 전'으로 묶는다.
    return 'NOT_STARTED'
  }

  get 기간상태(): i회비유효상태 {
    return this.기간상태_날짜기준
  }

  get dynamicState(): i회비레거시상태 {
    const 결제상태 = this.결제상태
    if (결제상태 === 'UNSUBSCRIBED') return 'UNSUBSCRIBED'
    if (결제상태 === 'READY') return 'PAYING'
    if (결제상태 === 'FAILED') return 'PAYMENT_FAILED'
    if (결제상태 === 'REFUNDED') return 'REFUNDED'

    const 회비유효상태 = this.회비유효상태
    if (
      회비유효상태 === 'ACTIVE'
      || 회비유효상태 === 'EXPIRING_SOON'
      || 회비유효상태 === 'IN_GRACE'
      || 회비유효상태 === 'NOT_STARTED'
    ) {
      return 'SUBSCRIBED'
    }
    return 'FINALLY_EXPIRED'
  }

  do결제 = async () => {
    const 회원 = this.회원
    const 회비id = String(this.stateId ?? '')
    const 회비상품 = this.연결회비상품
    if (!회원) {
      throw new Error('회원 정보를 찾을 수 없습니다.')
    }
    if (!hasServerPk(회비id)) {
      throw new Error('회원회비 ID가 없어 결제를 시작할 수 없습니다.')
    }
    if (!회비상품) {
      throw new Error('연결된 회비 청구가 없습니다. 납부 대상으로 등록된 뒤 결제할 수 있습니다.')
    }

    const 결제금액 = this.결제예상금액
    if (결제금액 <= 0) {
      const now = mDayjs()
      let needSave = false
      if (!this.is유효) {
        const 기간기본값 = model회원회비.get기본기간(now)
        this.state.startDate = 기간기본값.startDate
        this.state.endDate = 기간기본값.endDate
        needSave = true
      }
      if (this.결제Id) {
        this.결제Id = null
        needSave = true
      }
      if (this.state.paidAmount !== 0) {
        this.state.paidAmount = 0
        needSave = true
      }
      if (!String(this.state.paidAt ?? '').trim()) {
        this.state.paidAt = now.toISOString()
        needSave = true
      }
      this.state.changedAt = now.toISOString()
      if (needSave) {
        await this.do저장(false, false)
      }
      useAlert().show(
        '회비 적용 완료',
        needSave
          ? `${String(회원?.이름 || '회원')} 회원: 청구 금액이 0원이라 결제 없이 유효기간을 반영했습니다.`
          : `${String(회원?.이름 || '회원')} 회원: 이미 반영된 상태입니다.`
      )
      return { mode: 'ZERO_AMOUNT', saved: needSave }
    }
    if (!Number.isFinite(결제금액) || 결제금액 < 1000) {
      throw new Error('결제금액은 1000원 이상이어야 합니다.')
    }

    const 결제Repo = model결제s.getInstance()
    let readyPayment = this.결제
    if (!readyPayment || readyPayment.결제상태 !== 'READY') {
      readyPayment = await 결제Repo.do결제요청(
        결제금액,
        'CARD',
        'member-fees',
        회비id,
        String(회원.stateId ?? '')
      )
    }

    const readyOrderId = String(
      readyPayment.토스주문번호 ?? readyPayment.state.tossOrderId ?? readyPayment.stateId ?? ''
    )
      .replace(/[^A-Za-z0-9_-]/g, '')
      .slice(0, 64)
    if (!readyOrderId) {
      throw new Error('결제 준비 주문번호를 생성하지 못했습니다.')
    }

    const readyPaymentId = String(readyPayment.stateId ?? '')
    if (readyPaymentId && this.결제Id !== readyPaymentId) {
      this.결제Id = readyPaymentId
      this.state.changedAt = mDayjs().toISOString()
      await this.do저장(false, false)
    }

    const customerName = String(회원?.이름 ?? '').trim() || '회원'
    const 상품명 = this.청구표시명
    const rawEmail = (회원 as any)?.이메일 ?? (회원 as any)?.state?.email ?? ''
    const memberId = String(회원.stateId ?? 'member').trim() || 'member'
    const customerEmail
      = String(rawEmail || '').trim() || `${memberId}@member.local`
    const requestUrl = useRequestURL()
    const successUrl = `${requestUrl.origin}/checkout/confirm`
    const failUrl = `${requestUrl.origin}/checkout/fail`

    return await usePayments().open({
      title: `${상품명} 결제`,
      description: `${customerName} 회원 · ${상품명} 납부를 진행합니다.`,
      orderName: `${customerName} · ${상품명}`,
      amount: 결제금액,
      successUrl,
      failUrl,
      customerName,
      customerEmail,
      readyOrderId
    })
  }

  private do회원현재회비동기화 = async () => {
    const memberId = String(this.state?.memberId ?? '').trim()
    if (!memberId) return
    const latestFee
      = model회원회비s.getInstance().get최신회비By회원(memberId) ?? this
    const feeId = String(latestFee.stateId ?? '')
    if (!memberId || !feeId) return
    // `legacy-`는 이 모델만의 사정이라 여기 남긴다 — 나머지 판정은 `hasServerPk`가 갖는다.
    if (!hasServerPk(feeId) || feeId.startsWith('legacy-')) return
    const 회원 = model회원s.getInstance().getById(memberId)
    if (!회원) return
    if (회원.현재회비id === feeId) return
    회원.현재회비id = feeId
    await 회원.do저장(false, false)
  }

  override beforeSave = () => true

  override afterCreate = () => {
    void this.do회원현재회비동기화()
  }

  override afterSave = () => {
    void this.do회원현재회비동기화()
  }

  override get label() {
    const 회원명 = this.회원?.이름?.trim() || '회원'
    return `${회원명} · ${this.현재이력구분}`
  }

  override get sub() {
    const 기간 = `${this.시작일.format('YYYY-MM-DD')} ~ ${this.종료일.format('YYYY-MM-DD')}`
    const 회비유효상태라벨
      = i회비유효상태options.find(item => item.value === this.회비유효상태)?.label ?? '상태확인'
    const 결제상태라벨
      = i결제표시상태options.find(item => item.value === this.결제상태)?.label ?? '결제상태'
    return `${기간} · ${회비유효상태라벨} · ${결제상태라벨}`
  }
}

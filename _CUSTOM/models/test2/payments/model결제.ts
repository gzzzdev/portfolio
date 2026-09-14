import { mDayjs } from '~utils'
import { BaseModels2, BaseModel2, 타입지정, getRepoInstance, hasServerPk } from '~utils/models'
import type { BaseXXDto, BaseXX } from '~utils/models'
import { toValue } from 'vue'
import type { model회원 } from '~models/test2'
import { model회원s } from '~models/test2'
import { useMyAuthStore } from '~/stores/useMyAuthStore'

export type i결제상태 = 'READY' | 'PAID' | 'FAILED' | 'REFUNDED'
export type i결제수단 = 'CARD' | 'TRANSFER' | 'VIRTUAL_ACCOUNT' | 'E_WALLET'
/** `member-enrolls`는 폐기된 옛 신청 테이블 — 이미 쌓인 결제 행이 가리킬 수 있어 값은 남긴다. */
export type i결제대상엔티티 = 'member-enrolls' | 'member-qualifications' | 'member-fees' | 'applications' | 'enrolls'
const 결제대상엔티티목록 = ['member-enrolls', 'member-qualifications', 'member-fees', 'applications', 'enrolls'] as const
export type i결제표시상태 = i결제상태 | 'UNSUBSCRIBED' | 'EXEMPT'
const 결제상태기본options = [
  { label: '결제중', value: 'READY' },
  { label: '결제완료', value: 'PAID' },
  { label: '결제실패', value: 'FAILED' },
  { label: '환불완료', value: 'REFUNDED' }
] as const
export const i결제상태options = 결제상태기본options
export const i결제상태With미납부Options = [
  { label: '미납부', value: 'UNSUBSCRIBED' },
  ...결제상태기본options
] as const
// Backward compatibility for existing imports.
export const i결제상태WithNoneOptions = i결제상태With미납부Options
export const i결제표시상태options = [
  ...i결제상태With미납부Options,
  { label: '면제', value: 'EXEMPT' }
] as const
export const i결제수단options = [
  { label: '카드', value: 'CARD' },
  { label: '계좌이체', value: 'TRANSFER' },
  { label: '가상계좌', value: 'VIRTUAL_ACCOUNT' },
  { label: '전자지갑', value: 'E_WALLET' }
] as const

export interface i결제dto extends BaseXXDto {

  targetTable: i결제대상엔티티
  targetId: string
  memberId: string
  tossOrderId?: string | null
  amount: number
  method: i결제수단
  status: i결제상태
  transactionId: string | null
  receiptUrl: string | null
  createdAt: string
  updatedAt: string
}

export interface i결제 extends BaseXX {
  결제대상엔티티: i결제대상엔티티
  결제대상Id: string
  회원Id: string
  토스주문번호: string | null
  결제금액: number
  결제수단: i결제수단
  결제상태: i결제상태
  거래아이디: string | null
  영수증링크: string | null
  생성일시: ReturnType<typeof mDayjs>
  수정일시: ReturnType<typeof mDayjs>
}

export type iDo결제성공Args = {
  paymentKey: string
  orderId: string
  amount: number
  readyId?: string
}

export type iToss승인응답 = {
  status?: string
  paymentKey?: string
  orderId?: string
  totalAmount?: number
  method?: string
  receipt?: { url?: string }
}

export type iDo결제성공Result = {
  toss: iToss승인응답
  결제: model결제 | null
}

export type iDo결제실패Args = {
  readyId: string
  code?: string
  message?: string
}

export type iDo결제실패Result = {
  ok: boolean
  결제: model결제 | null
}

export type iDo결제시작Args = {
  title?: string
  description?: string
  orderName: string
  amount: number
  couponDiscount?: number
  successUrl: string
  failUrl: string
  onClose?: () => void
}

/**
 * `do회원결제`가 받는 최소 모양. 신청 모델이 무엇이든 이 셋만 있으면 결제가 붙는다.
 * `메뉴명`은 `BaseModel2`가 `repo.tableName`에서 그대로 주므로 따로 적을 값이 아니다.
 */
export interface i결제가능신청 {
  id?: string | number | null
  메뉴명: string
  회원: model회원 | null
}

export type iDo회원결제Args = Omit<iDo결제시작Args, 'amount' | 'successUrl' | 'failUrl'> & {
  title?: string
  description?: string
  couponDiscount?: number
  onClose?: () => void
}

export class model결제s extends BaseModels2<model결제, i결제dto> {
  protected etcFields = []
  private is결제대상엔티티 = (v: unknown): v is i결제대상엔티티 =>
    typeof v === 'string' && (결제대상엔티티목록 as readonly string[]).includes(v)

  private 생성결제주문번호 = () => {
    const timePart = Date.now().toString(36)
    const randPart = Math.random().toString(36).slice(2, 12)
    const raw = `pay_${timePart}_${randPart}`.replace(/[^A-Za-z0-9_-]/g, '')
    const normalized = raw.slice(0, 64)
    if (normalized.length >= 6) return normalized
    return `pay_${normalized}`.slice(0, 64)
  }

  static getInstance = () => getRepoInstance('model결제s', () => new model결제s())

  private constructor() {
    super(model결제, 'payments')
  }

  override _generate = () => new model결제().generate()
  override _init = () => new model결제().init()

  /**
   * 특정 결제 대상에 연결된 결제 목록 (생성일 내림차순).
   *
   * 다형 관계라 다른 `getsBy*`와 달리 모델 인스턴스가 아니라 `(표, id)` 쌍을 받는다 —
   * 대상이 네 표에 걸쳐 있어서 인스턴스 하나로 좁힐 수가 없다.
   */
  getsBy대상 = (대상표: i결제대상엔티티, 대상Id: string) => {
    if (!hasServerPk(대상Id)) return []
    const id = String(대상Id).trim()
    return toValue(this.list)
      .filter(row => row.결제대상엔티티 === 대상표 && row.결제대상Id === id)
      .sort((a, b) => String(b.state.createdAt ?? '').localeCompare(String(a.state.createdAt ?? '')))
  }

  /** 특정 결제 대상의 최신 결제 1건 */
  get최신결제By대상(targetTable: i결제대상엔티티, targetId: string) {
    const 대상id = String(targetId ?? '').trim()
    if (!대상id) return null

    let latest: model결제 | null = null
    for (const row of toValue(this.list)) {
      if (row.결제대상엔티티 !== targetTable || row.결제대상Id !== 대상id) continue
      if (!latest) {
        latest = row
        continue
      }
      const nextCreatedAt = String(row.state.createdAt ?? '')
      const latestCreatedAt = String(latest.state.createdAt ?? '')
      if (nextCreatedAt.localeCompare(latestCreatedAt) > 0) {
        latest = row
      }
    }
    return latest
  }

  do결제요청 = async (
    paymentAmount: number,
    method: i결제수단 = 'CARD',
    targetTable?: i결제대상엔티티,
    targetId?: string,
    memberId?: string
  ): Promise<model결제> => {
    const normalizedAmount = Math.floor(Number(paymentAmount) || 0)
    if (!Number.isFinite(normalizedAmount) || normalizedAmount < 1000) {
      throw new Error('결제금액은 1000원 이상이어야 합니다.')
    }
    const rawTargetTable = String(targetTable ?? '').trim()
    if (!this.is결제대상엔티티(rawTargetTable)) {
      throw new Error('targetTable은 member-enrolls | member-qualifications | member-fees 중 하나여야 합니다.')
    }
    const normalizedTargetTable = rawTargetTable as i결제대상엔티티
    const normalizedTargetId = String(targetId ?? '').trim()
    if (!normalizedTargetId) {
      throw new Error('targetId가 필요합니다.')
    }
    const normalizedMemberId = String(memberId ?? '').trim()
    if (!normalizedMemberId) {
      throw new Error('memberId가 필요합니다.')
    }
    const now = new Date().toISOString()
    const orderId = this.생성결제주문번호()
    return await this.create({
      id: orderId,
      targetTable: normalizedTargetTable,
      targetId: normalizedTargetId,
      memberId: normalizedMemberId,
      tossOrderId: orderId,
      amount: normalizedAmount,
      method,
      status: 'READY',
      transactionId: null,
      receiptUrl: null,
      createdAt: now,
      updatedAt: now
    })
  }

  do결제시작 = async (args: iDo결제시작Args) => {
    const 회원ID = useMyAuthStore().회원Id
    const 회원 = model회원s.getInstance().getById(회원ID)
    if (!회원) {
      throw new Error('로그인된 회원 정보를 찾을 수 없습니다.')
    }

    const normalizedAmount = Math.floor(Number(args.amount ?? 0))
    if (!Number.isFinite(normalizedAmount) || normalizedAmount < 1000) {
      throw new Error('결제금액은 1000원 이상이어야 합니다.')
    }

    const readyPayment = await this.do결제요청(
      normalizedAmount,
      'CARD',
      'member-enrolls',
      'manual',
      String(회원ID)
    )
    const readyOrderId = String(
      readyPayment.토스주문번호 ?? readyPayment.state.tossOrderId ?? readyPayment.stateId ?? ''
    )
      .replace(/[^A-Za-z0-9_-]/g, '')
      .slice(0, 64)
    const customerName = String(회원?.이름 ?? '').trim() || '회원'
    const rawEmail = (회원 as any)?.이메일 ?? (회원 as any)?.state?.email ?? ''
    const memberId = String(회원?.stateId ?? 'member').trim() || 'member'
    const customerEmail
      = String(rawEmail || '').trim() || `${memberId}@member.local`
    return await usePayments().open({
      ...args,
      customerName,
      customerEmail,
      readyOrderId
    })
  }

  /**
   * 신청 한 건을 결제한다. 필요한 건 `회원`·`id`·`메뉴명`과 금액뿐이라 구조로만 받는다
   * (`i결제가능신청`). 한때 옛 `model회원신청`도 여기 들어왔는데 그 축은 폐기됐다.
   */
  do회원결제 = async (
    회원신청: i결제가능신청,
    args: iDo회원결제Args
  ) => {
    const 회원 = (회원신청 as any)?.회원 as model회원 | null
    if (!회원) {
      throw new Error('회원신청의 회원 정보를 찾을 수 없습니다.')
    }
    // 금액은 `신청받기`가 든다.
    const 결제금액 = Number((회원신청 as any)?.신청받기?.결제금액 ?? 0)
    // 대상 테이블명은 모델이 이미 알고 있다(`메뉴명` = `repo.tableName`). 여기 문자열을 박으면
    // 새 신청 모델의 결제가 옛 테이블 이름으로 기록돼 조용히 안 붙는다.
    const 대상테이블 = ((회원신청 as any)?.메뉴명 ?? 'enrolls') as i결제대상엔티티
    const normalizedAmount = Math.floor(결제금액)
    if (!Number.isFinite(normalizedAmount) || normalizedAmount < 1000) {
      throw new Error('신청 결제금액은 1000원 이상이어야 합니다.')
    }

    const readyPayment = await this.do결제요청(
      normalizedAmount,
      'CARD',
      대상테이블,
      String((회원신청 as any)?.stateId ?? ''),
      String(회원?.stateId ?? '')
    )
    const readyOrderId = String(
      readyPayment.토스주문번호 ?? readyPayment.state.tossOrderId ?? readyPayment.stateId ?? ''
    )
      .replace(/[^A-Za-z0-9_-]/g, '')
      .slice(0, 64)
    const customerName = String(회원?.이름 ?? '').trim() || '회원'
    const rawEmail = (회원 as any)?.이메일 ?? (회원 as any)?.state?.email ?? ''
    const memberId = String(회원?.stateId ?? 'member').trim() || 'member'
    const customerEmail
      = String(rawEmail || '').trim() || `${memberId}@member.local`
    const requestUrl = useRequestURL()
    const successUrl = `${requestUrl.origin}/checkout/confirm`
    const failUrl = `${requestUrl.origin}/checkout/fail`
    return await usePayments().open({
      ...args,
      amount: normalizedAmount,
      successUrl,
      failUrl,
      customerName,
      customerEmail,
      readyOrderId
    })
  }

  private pick결제ByToss = (readyId: string | undefined, orderId: string) =>
    this.list.value.find((row: model결제) => {
      const pid = String(row.stateId ?? '')
      const toss = row.토스주문번호 ?? ''
      if (readyId && (pid === readyId || toss === readyId)) return true
      return pid === orderId || toss === orderId
    }) ?? null

  do결제성공 = async (args: iDo결제성공Args): Promise<iDo결제성공Result> => {
    const paymentKey = String(args.paymentKey || '').trim()
    const orderId = String(args.orderId || '').trim()
    const paymentAmount = Number(args.amount)
    const readyId = args.readyId?.trim() || ''

    if (!paymentKey || !orderId || !Number.isFinite(paymentAmount) || paymentAmount < 1000) {
      throw new Error('paymentKey, orderId, amount(>=1000)가 필요합니다.')
    }

    const toss = await $fetch<iToss승인응답>('/api/payments/confirm', {
      method: 'POST',
      body: { paymentKey, orderId, amount: paymentAmount }
    })

    await this.reads(false)
    const 결제 = this.pick결제ByToss(readyId || undefined, orderId)

    return { toss, 결제 }
  }

  do결제실패 = async (args: iDo결제실패Args): Promise<iDo결제실패Result> => {
    const readyId = String(args.readyId || '').trim()
    if (!readyId) return { ok: false, 결제: null }

    await this.reads(false)
    const 결제
      = this.list.value.find(
        (row: model결제) =>
          String(row.stateId ?? '') === readyId || row.토스주문번호 === readyId
      ) ?? null
    if (!결제) return { ok: false, 결제: null }

    결제.결제상태 = 'FAILED'
    await 결제.do저장(false, false)
    return { ok: true, 결제 }
  }
}

export class model결제 extends BaseModel2<i결제dto> implements i결제 {
  constructor(state?: i결제dto) {
    super(model결제s.getInstance(), state)
  }

  override 자동필드ss = [
    {
      label: '기본',
      list: [
        { key: 'id', label: 'ID', props: { readonly: true }, canEdit: false, show: false },
        { key: '결제대상엔티티', label: '대상엔티티', props: { readonly: true }, canEdit: false, show: true },
        { key: '결제대상Id', label: '대상ID', props: { readonly: true }, canEdit: false, show: true },
        { key: '회원Id', label: '회원ID', props: { readonly: true }, canEdit: false, show: true },
        { key: '결제금액', label: '결제금액', show: true },
        { key: '결제수단', label: '결제수단', type: 타입지정.선택0, options: i결제수단options, show: true },
        { key: '결제상태', label: '결제상태', type: 타입지정.선택0, options: i결제상태options, show: true },
        { key: '거래아이디', label: '거래ID', show: true },
        { key: '영수증링크', label: '영수증URL', show: true },
        { key: '생성일시', label: '생성일', show: true },
        { key: '수정일시', label: '수정일', show: true }
      ]
    }
  ]

  override 자동버튼s = this.기본버튼s
  bindModel = null as any
  override afterCreate = () => {}
  override beforeSave = () => true
  override afterSave = () => {}

  override generate() {
    const now = new Date().toISOString()
    const legacyTargetId = String((this.state as any)?.memberEnrollId ?? '').trim()
    const normalizedTargetId = String(this.state?.targetId ?? '').trim() || legacyTargetId
    return {
      ...this.init(),
      targetTable: (this.state?.targetTable ?? 'member-enrolls') as i결제대상엔티티,
      targetId: normalizedTargetId,
      memberId: String(this.state?.memberId ?? ''),
      tossOrderId: this.state?.tossOrderId ?? null,
      amount: Number(this.state?.amount ?? 0),
      method: this.state?.method ?? 'CARD',
      status: this.state?.status ?? 'READY',
      transactionId: this.state?.transactionId ?? null,
      receiptUrl: this.state?.receiptUrl ?? null,
      createdAt: this.state?.createdAt ?? now,
      updatedAt: this.state?.updatedAt ?? now
    }
  }

  override init() {
    const now = new Date().toISOString()
    return {
      targetTable: 'member-enrolls' as i결제대상엔티티,
      targetId: '',
      memberId: '',
      amount: 0,
      tossOrderId: null,
      method: 'CARD' as i결제수단,
      status: 'READY' as i결제상태,
      transactionId: null,
      receiptUrl: null,
      createdAt: now,
      updatedAt: now
    }
  }

  override get label() {
    return `${this.결제금액.toLocaleString()}원 · ${this.결제상태}`
  }

  get 결제대상메뉴() {
    return (this.state?.targetTable ?? 'member-enrolls') as i결제대상엔티티
  }

  set 결제대상엔티티(v: i결제대상엔티티) {
    this.state.targetTable = v
  }

  get 결제대상Id() {
    return String(this.state?.targetId ?? '')
  }

  set 결제대상Id(v: string) {
    this.state.targetId = String(v ?? '').trim()
  }

  get 회원Id() {
    return String(this.state?.memberId ?? '')
  }

  set 회원Id(v: string) {
    this.state.memberId = String(v ?? '').trim()
  }

  get 결제금액() {
    const n = Number(this.state?.amount ?? 0)
    return Number.isFinite(n) ? Math.floor(n) : 0
  }

  get 토스주문번호() {
    return this.state?.tossOrderId ?? null
  }

  set 토스주문번호(v: string | null) {
    this.state.tossOrderId = v && String(v).trim() ? String(v).trim() : null
  }

  set 결제금액(v: number) {
    const n = Number(v)
    this.state.amount = Number.isFinite(n) ? Math.floor(n) : 0
  }

  get 결제수단() {
    return (this.state?.method ?? 'CARD') as i결제수단
  }

  set 결제수단(v: i결제수단) {
    this.state.method = v
  }

  get 결제상태() {
    return (this.state?.status ?? 'READY') as i결제상태
  }

  set 결제상태(v: i결제상태) {
    this.state.status = v
  }

  get 거래아이디() {
    return this.state?.transactionId ?? null
  }

  set 거래아이디(v: string | null) {
    this.state.transactionId = v && String(v).trim() ? String(v).trim() : null
  }

  get 영수증링크() {
    return this.state?.receiptUrl ?? null
  }

  set 영수증링크(v: string | null) {
    this.state.receiptUrl = v && String(v).trim() ? String(v).trim() : null
  }

  get 생성일시() {
    return mDayjs(this.state?.createdAt)
  }

  get 수정일시() {
    return mDayjs(this.state?.updatedAt)
  }
}

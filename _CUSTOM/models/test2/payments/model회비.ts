import { mDayjs } from '~utils'
import { BaseModels2, BaseModel2, 타입지정, getRepoInstance, hasServerPk } from '~utils/models'
import type { BaseXXDto, BaseXX } from '~utils/models'
import { computed, toValue } from 'vue'

import { model회원회비s, type model회원회비 } from './'
import { model회원s, type model회원 } from '~models/test2'

export type i회비청구상태 = 'DRAFT' | 'ISSUED' | 'CLOSED'

export type i회비청구유형 = 'REGULAR' | 'ADMISSION' | 'MATERIAL'
export const i회비청구유형options = [
  { label: '입회비', value: 'ADMISSION' },
  { label: '기간회비', value: 'REGULAR' },
  { label: '기타', value: 'MATERIAL' }
] as const

export type i회비기본금액 = number

/** 기간회비 고정 단가 — 신규 생성·발행 시 월만 바꾸고 금액은 여기서만 둔다. */
export const 기간회비기본금액 = 12900 as i회비기본금액
const _기간회비 = {
  base_price: 기간회비기본금액
}

export interface i회비dto extends BaseXXDto {

  base_date: string
  nickName: string
  base_price: i회비기본금액
  status: i회비청구상태
  fee_type: i회비청구유형
}

export interface i회비 extends BaseXX {
  이름: string
  기준일: typeof mDayjs
  기본금액: i회비기본금액
  청구상태: i회비청구상태
  청구유형: i회비청구유형
  is기간회비: boolean
  회원회비납부목록: model회원회비[]
}

export class model회비s extends BaseModels2<model회비, i회비dto> {
  protected etcFields = []
  override 정렬조건s = [
    {
      label: '최신',
      value: '최신',
      func: (a: model회비, b: model회비) =>
        Number(b.stateId) - Number(a.stateId)
    },
    {
      label: '이름↑',
      value: '이름↑',
      func: (a: model회비, b: model회비) => a.이름.localeCompare(b.이름)
    },
    {
      label: '이름↓',
      value: '이름↓',
      func: (a: model회비, b: model회비) => b.이름.localeCompare(a.이름)
    },
    {
      label: '기준일↑',
      value: '기준일↑',
      func: (a: model회비, b: model회비) => {
        const ar = a.is기간회비
        const br = b.is기간회비
        if (ar && br) return a.기준일.valueOf() - b.기준일.valueOf()
        return Number(a.stateId) - Number(b.stateId)
      }
    },
    {
      label: '기준일↓',
      value: '기준일↓',
      func: (a: model회비, b: model회비) => {
        const ar = a.is기간회비
        const br = b.is기간회비
        if (ar && br) return b.기준일.valueOf() - a.기준일.valueOf()
        return Number(a.stateId) - Number(b.stateId)
      }
    }
  ]

  override 필터조건ss = [
    this.라디오필터그룹(
      i회비청구유형options.map(item => ({
        label: item.label,
        value: (a: model회비) => a.청구유형 === item.value
      })),
      { title: '청구 유형' }
    )
  ]

  static getInstance = () => getRepoInstance('model회비s', () => new model회비s())

  private constructor() {
    super(model회비, 'fees')
  }

  override _generate = () => new model회비().generate()
  override _init = () => new model회비().init()
}

export class model회비 extends BaseModel2<i회비dto> implements i회비 {
  constructor(state?: i회비dto) {
    super(model회비s.getInstance(), state)
    const upstreamSave = this.save
    this.save = (is모두저장 = false, showAlert = true) => {
      if (this.beforeSave?.() === false) return Promise.resolve(false)
      return upstreamSave(is모두저장, showAlert)
    }
  }

  override 자동필드ss = [
    {
      label: '기본',
      list: [

        {
          key: '청구유형',
          label: '청구 유형',
          type: 타입지정.선택0,
          options: i회비청구유형options,
          show: true
        },
        {
          key: '기준일',
          label: '기준일',
          type: 타입지정._.월선택,
          show: true
        },
        {
          key: '이름',
          label: '이름',
          show: computed(() => this.청구유형 === 'MATERIAL')
        },
        {
          key: '기본금액',
          label: '금액',
          type: 타입지정._.숫자2,
          props: { min: 0, max: 100000, step: 1000 },
          show: true
        }
      ]
    },
    {
      label: '납부',
      config: { ratio: 35 },
      list: [
        {
          key: '회원회비납부목록',
          label: '납부자',
          type: 타입지정._.카드s,
          show: true,
          is한줄: false,
          props: {
            do빈생성: () =>
              model회원회비s
                .getInstance()
                .do빈생성_회비관점(
                  String(this.stateId ?? '')
                )
          }
        }
      ]
    }
  ]

  override 자동버튼s = this.기본버튼s.concat([
    {
      key: 'do납부자s일괄등록',
      label: '납부자 일괄 등록',
      icon: 'i-lucide-user-plus',
      show: true
    }
  ])

  /** 전 회원 중 이 청구에 아직 없는 납부자만 연속 추가 (저장된 회비 id 필요) */
  do납부자s일괄등록 = async () => {
    const sid = String(this.stateId ?? '')
    if (!hasServerPk(sid)) {
      useAlert().error('납부자 일괄 등록 불가', '회비 청구를 먼저 저장한 뒤 다시 시도해주세요.')
      return
    }
    if (import.meta.server) return

    const repo = model회원회비s.getInstance()
    const 회원s = toValue(model회원s.getInstance().회원s)
    if (!회원s.length) {
      useAlert().show('납부자 일괄 등록', '등록된 회원이 없습니다.')
      return
    }

    const 이미있음 = new Set(
      repo
        .getsBy회비상품(this)
        .map(row => String(row.state.memberId ?? '').trim())
        .filter(Boolean)
    )
    const toAdd = 회원s.filter((m: model회원) => {
      const mid = String(m.stateId ?? '')
      return mid !== '' && !이미있음.has(mid)
    })
    if (!toAdd.length) {
      useAlert().show('납부자 일괄 등록', '추가할 회원이 없습니다. (이미 모두 등록됨)')
      return
    }

    const msg = `전체 ${회원s.length}명 중 ${toAdd.length}명의 납부 대상을 추가합니다. 계속할까요?`
    if (!confirm(msg)) return

    const items = toAdd.map((m: model회원) => repo.buildDtoFor회비상품(String(m.stateId), sid))
    try {
      await repo.creates(items)
      useAlert().success('납부자 일괄 등록', `${items.length}명 추가했습니다.`)
    } catch {
      /* `creates`에서 실패 알림 처리 */
    }
  }

  override generate() {
    const feeRaw = this.state?.fee_type
    const fee_type: i회비청구유형
      = feeRaw === 'REGULAR' || feeRaw === 'ADMISSION' || feeRaw === 'MATERIAL'
        ? feeRaw
        : 'REGULAR'
    const statusRaw = this.state?.status
    const status: i회비청구상태
      = statusRaw === 'DRAFT' || statusRaw === 'ISSUED' || statusRaw === 'CLOSED'
        ? statusRaw
        : 'DRAFT'
    const bd = String(this.state?.base_date ?? '').trim()
    const base_date = mDayjs(bd).isValid()
      ? mDayjs(bd).format('YYYY-MM-DD')
      : mDayjs().format('YYYY-MM-DD')

    const base_price
      = fee_type === 'REGULAR'
        ? _기간회비.base_price
        : Math.max(0, Math.floor(Number(this.state?.base_price) || 0))

    const legacy = this.state as (i회비dto & { custom_label?: string }) | undefined
    const nickRaw
      = String(legacy?.nickName ?? '').trim()
        || String(legacy?.custom_label ?? '').trim()

    return {
      ...this.init(),
      nickName: fee_type === 'MATERIAL' ? nickRaw : '',
      base_date,
      base_price,
      fee_type,
      status
    }
  }

  override init() {
    return {
      base_date: mDayjs().format('YYYY-MM-DD'),
      nickName: '',
      base_price: _기간회비.base_price,
      fee_type: 'REGULAR' as i회비청구유형,
      status: 'DRAFT' as i회비청구상태
    }
  }

  _납부기준일 = computed(() => {
    const s = String(this.state?.base_date ?? '').trim()
    const d = mDayjs(s)
    return d.isValid() ? d : mDayjs()
  })

  override get label() {
    if (this.청구유형 === 'MATERIAL') {
      const nick = String(this.state?.nickName ?? '').trim()
      if (nick) return nick
    }
    const 유형
      = i회비청구유형options.find(o => o.value === this.청구유형)?.label ?? ''
    if (this.is기간회비) {
      const d = this.기준일
      return `${d.format('YYYY년 MM월')} ${유형}`
    }
    return 유형
  }

  override get sub() {
    return ''
  }

  get 기준일() {
    return toValue(this._납부기준일)
  }

  set 기준일(v: typeof mDayjs) {
    this.state.base_date = mDayjs(v).format('YYYY-MM-DD')
  }

  get 이름() {
    if (this.청구유형 !== 'MATERIAL') return ''
    return this.state?.nickName ?? ''
  }

  set 이름(v: string) {
    if (this.청구유형 === 'MATERIAL') this.state.nickName = v
  }

  get 기본금액(): i회비기본금액 {
    return Math.max(0, Math.floor(Number(this.state?.base_price) || 0))
  }

  set 기본금액(v: i회비기본금액) {
    this.state.base_price = Math.max(0, Math.floor(Number(v) || 0))
  }

  get 청구상태(): i회비청구상태 {
    const v = this.state?.status
    if (v === 'DRAFT' || v === 'ISSUED' || v === 'CLOSED') return v
    return 'DRAFT'
  }

  set 청구상태(v: i회비청구상태) {
    this.state.status = v
  }

  get 청구유형(): i회비청구유형 {
    const v = this.state?.fee_type
    if (v === 'REGULAR' || v === 'ADMISSION' || v === 'MATERIAL') return v
    return 'REGULAR'
  }

  set 청구유형(v: i회비청구유형) {
    this.state.fee_type = v
    if (v === 'REGULAR') this.state.base_price = _기간회비.base_price
    if (v !== 'MATERIAL') this.state.nickName = ''
  }

  get is기간회비() {
    return this.청구유형 === 'REGULAR'
  }

  /** 이 회비 청구(fee-schedule)에 연결된 회원회비 목록 (= 납부 대상자·상태 카드) */
  get 회원회비납부목록(): model회원회비[] {
    return model회원회비s.getInstance().getsBy회비상품(this)
  }

  /** 기간회비는 같은 기준 월(YYYY-MM)당 하나만 허용 */
  override afterCreate = () => {}
  override afterSave = () => {}

  override beforeSave = () => {
    if (!this.is기간회비) return true
    const ym = this.기준일.format('YYYY-MM')
    const myId = String(this.state?.id ?? '')
    const dup = model회비s.getInstance().list.value.some(
      (m: model회비) =>
        m !== this
        && m.is기간회비
        && String(m.state?.id ?? '') !== myId
        && m.기준일.format('YYYY-MM') === ym
    )
    if (dup) {
      useAlert().error('기간회비 중복', `같은 달(${ym})에 이미 기간회비가 있습니다.`)
      return false
    }
    return true
  }
}

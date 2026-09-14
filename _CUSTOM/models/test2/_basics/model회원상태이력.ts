import { computed, toValue } from 'vue'
import { mDayjs, toCompactDates, clone, type i기간 } from '~utils'
import { BaseModels2, BaseModel2, 타입지정, type BaseXXDto, type BaseXX, type iID, getRepoInstance, pksOf } from '~utils/models'
import { model회원s, model회원, i회원state라벨 } from './model회원'
import { renderComps, type RenderItem } from '~/components/view/렌더/renderComps'

export interface i회원상태이력dto extends BaseXXDto {
  memberId: iID
  snapshot: Record<string, unknown>
  startDate: Date | null
  endDate: Date | null
  reason: string
}

export interface i회원상태이력 extends BaseXX {
  회원id: string
  스냅샷: Record<string, unknown>
  기간: i기간
  사유: string
}

export class model회원상태이력s extends BaseModels2<model회원상태이력, i회원상태이력dto> {
  static getInstance = () => getRepoInstance('model회원상태이력s', () => new model회원상태이력s())

  private constructor() {
    super(model회원상태이력, 'member-status-historys', { hasConfirm: false })
  }

  override _generate = () => new model회원상태이력().generate()
  override _init = () => new model회원상태이력().init()

  getsBy회원 = (_회원: model회원) => toValue(this.list).filter(row => row.회원?.isSame(_회원))
  get현재이력By회원 = (회원: model회원) => this.getsBy회원(회원).find(row => row.is현재)

  get직전이력 = (회원상태이력: model회원상태이력) => {
    const list = this.getsBy회원(회원상태이력.회원!)
    const idx = list.findIndex(row => row.isSame(회원상태이력))
    return list[idx + 1]
  }

  async do상태기록(_회원: model회원, reason = '회원 저장') {
    const next = clone(_회원.state)
    const 전이력 = this.get현재이력By회원(_회원)

    if (전이력) {
      const is최소시간 = false
      if (is최소시간) {
        전이력.state.snapshot = next
        전이력.state.reason = reason
        return 전이력.do저장(false, false)
      }
      전이력.state.endDate = mDayjs().toDate()
    }

    const pks = pksOf({ 회원: _회원 })
    if (!pks) return

    const 새이력 = await this.create({
      memberId: pks.회원,
      snapshot: next,
      startDate: mDayjs().toDate(),
      endDate: null,
      reason: reason
    }, !false)

    return this.do모두저장(전이력 ? [전이력, 새이력] : [새이력])
  }

  /** `[from, to]`(일 단위)와 겹치는 잠자는회원 상태 이력이 있으면 true */
  // 잠자는중DuringPeriod = (회원: model회원,from: ReturnType<typeof mDayjs>,to: ReturnType<typeof mDayjs>)=>false;//추후구현
}

export class model회원상태이력 extends BaseModel2<i회원상태이력dto> implements i회원상태이력 {
  constructor(state?: i회원상태이력dto) {
    super(model회원상태이력s.getInstance(), state)
  }

  override afterCreate = () => { }
  override beforeSave = () => true
  override afterSave = () => { }

  override 자동필드ss = [
    {
      label: '기본',
      list: [
        // { key: '기간', label: '기간', type: 타입지정._.기간시간, show: true, props: { readonly: true }, canEdit: false },
        // { key: '사유', label: '사유', type: 타입지정._.문자, show: true, props: { readonly: true } },

      ]
    }
  ]

  override generate() { return this.init() }

  override init() {
    return {
      memberId: '',
      snapshot: {},
      startDate: new Date(),
      endDate: null,
      reason: ''
    }
  }

  override get icon() {
    return ['i-carbon:user-profile', 'i-teenyicons:face-id-outline', 'i-material-symbols-light:id-card-2-outline-sharp', 'i-carbon:user-profile-alt']
      [3]
  }

  override get label() { return '상태수정' }

  get 회원id() { return this.state.memberId }
  set 회원id(v: string) { this.state.memberId = v }
  get 회원() { return model회원s.getInstance().getById(this.회원id) }

  get 기간() { return [mDayjs(this.state.startDate), mDayjs(this.state.endDate)] as i기간 }
  set 기간(v) { this.state.startDate = v[0].toDate(); this.state.endDate = v[1].toDate() }

  get is현재() { return this.state.endDate == null }
  get is종료() { return !this.is현재 }

  get 사유() { return this.state.reason }
  set 사유(v: string) { this.state.reason = v }

  get 직전스냅샷() { return model회원상태이력s.getInstance().get직전이력(this)?.스냅샷 }
  get 스냅샷() { return (this.state.snapshot) }
  set 스냅샷(v) { this.state.snapshot = v }

  get 변경내역s() {
    const _내역s = Object.entries(this.스냅샷)
      .filter(([key, value]) => this.직전스냅샷?.[key] != value)
      .map(([key, value]) => ({ label: i회원state라벨[key], key, old: this.직전스냅샷?.[key], neu: value }))
      .filter(x => x.old != x.neu && [x.label, x.key, x.neu].every(v => v != null && v != ''))
    // && x.label
    return _내역s
  }

  _content = computed(() => {
    const 회원필드Map: Record<string, { options?: { label: string, value: unknown, icon?: string }[] }> = Object.fromEntries(
      (new model회원().자동필드ss as { list: { key?: string, options?: { label: string, value: unknown, icon?: string }[] }[] }[])
        .flatMap(({ list }) => list).filter(f => f.key).map(f => [f.key!, f])
    )
    const badgeVal = (stateKey: string, v: unknown, color = 'neutral'): RenderItem => {
      if (!v) return { comp: renderComps.div, props: {}, value: '' }
      const opt = 회원필드Map[i회원state라벨[stateKey] ?? stateKey]?.options?.find(o => o.value === v)
      if (opt) return { comp: renderComps.UBadge, props: { label: opt.label, icon: opt.icon, color, variant: 'outline' } }
      return { comp: renderComps.div, props: color === 'primary' ? { class: 'text-primary font-medium' } : undefined, value: v == null || v === '' ? '없음' : String(v) }
    }

    return {
      comp: renderComps.div,
      props: { class: 'flex flex-col w-full gap-2' },
      children:
            ([...this.변경내역s, { key: '사유', label: '사유', neu: this.사유 }]).map((x, idx) => ({
              key: `${x.key}-${idx}`,
              comp: renderComps.div,
              props: { class: 'w-1/2 flex flex-row items-center gap-1.5 mr-3' },
              children: [
                { comp: renderComps.div, value: x.label, props: { class: 'text-xs text-muted' } },
                badgeVal(x.key, x.neu, 'primary')
              ]
                .concat((!x.old)
                  ? []
                  : [
                      { comp: renderComps.MIcon, props: { name: 'i-lucide-arrow-left', class: 'size-3 shrink-0' } },
                      badgeVal(x.key, x.old)

                    ])

            }))
    }
  })

  _header = computed(() => {
    const 회원필드Map: Record<string, { options?: { label: string, value: unknown, icon?: string }[] }> = Object.fromEntries(
      (new model회원().자동필드ss as { list: { key?: string, options?: { label: string, value: unknown, icon?: string }[] }[] }[])
        .flatMap(({ list }) => list).filter(f => f.key).map(f => [f.key!, f])
    )
    const badgeVal = (stateKey: string, v: unknown, color = 'neutral'): RenderItem => {
      if (!v) return { comp: renderComps.div, props: {}, value: '' }
      const opt = 회원필드Map[i회원state라벨[stateKey] ?? stateKey]?.options?.find(o => o.value === v)
      if (opt) return { comp: renderComps.UBadge, props: { label: opt.label, icon: opt.icon, color, variant: 'outline' } }
      return { comp: renderComps.div, props: color === 'primary' ? { class: 'text-primary font-medium' } : undefined, value: v == null || v === '' ? '없음' : String(v) }
    }

    return {
      comp: renderComps.div,
      props: { class: 'flex flex-wrap items-center gap-1.5' },
      children: [
        { comp: renderComps.div, value: this.label, props: { class: 'text-default' } },
        ...this.변경내역s.map((x, idx) => ({
          key: `${x.key}-${idx}`,
          ...badgeVal(x.key, x.neu, 'primary')
        }))]
    }
  })

  override get content() { return toValue(this._content) }
  override get sub() { return toCompactDates(this.기간[0], this.기간[1]) }
}

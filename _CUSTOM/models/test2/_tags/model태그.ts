import { computed, toValue } from 'vue'
import { BaseModels2, BaseModel2, 타입지정, type BaseXX, type BaseXXDto, getRepoInstance } from '~utils/models'
import { model메뉴s } from '../_basics/model메뉴'
import { model태그관계s } from './model태그관계'
import {
  type model메모,
  model메모s
} from './model메모'
import {
  type model일정,
  model일정s
} from './model일정'

export interface i태그dto extends BaseXXDto {
  name: string
  icon: string | null
}

export interface i태그 extends BaseXX {
  이름: string
  아이콘: string | null
  /** root-말단 — badge/선택옵션용 */
  경로라벨: string
  메모s: model메모[]
  readonly 메모수: number
  일정s: model일정[]
  readonly 일정수: number

  readonly 전체메모수: number
  readonly 전체일정수: number
}

export class model태그s extends BaseModels2<model태그, i태그dto> {
  protected etcFields = []
  override 정렬조건s = [
    { label: '이름↑', value: '이름↑', func: (a: model태그, b: model태그) => a.이름.localeCompare(b.이름) },
    { label: '이름↓', value: '이름↓', func: (a: model태그, b: model태그) => b.이름.localeCompare(a.이름) }
  ]

  override 필터조건ss = [
  ]

  static getInstance = () => getRepoInstance('model태그s', () => new model태그s())

  private constructor() {
    super(model태그, 'tags')
  }

  get 메뉴() { return model메뉴s.getInstance().getBy테이블명(this.tableName) }

  override async reads() {
    return super.reads()
  }

  override _generate = () => new model태그().generate()
  override _init = () => new model태그().init()
  options = computed(() => toValue(this.list).map(row => ({ label: row.경로라벨, icon: row.아이콘, value: row.stateId })))
}

export class model태그 extends BaseModel2<i태그dto> implements i태그 {
  constructor(state?: i태그dto) {
    super(model태그s.getInstance(), state)
  }

  override afterCreate = () => { }
  override beforeSave = () => true
  override afterSave = () => { }

  override 자동필드ss = [
    {
      label: '태그',
      list: [
        { key: '이름', label: '이름', show: true },
        { key: '아이콘', label: '아이콘', type: 타입지정._.아이콘, show: true }
      ]
    },
    {
      label: '메모',
      show: computed(() => this.메모수 > 0),
      config: { ratio: 30 },
      list: [
        { key: '메모s', label: '메모', type: 타입지정._.카드s, is한줄: false,
          props: { do빈생성: () => { void this.do새메모() }, show탭: false }, show: true }
      ]
    },
    {
      label: '일정',
      show: computed(() => this.일정수 > 0),
      config: { ratio: 30 },
      list: [
        { key: '일정s', label: '일정', type: 타입지정._.카드s, is한줄: false,
          props: { do빈생성: () => { void this.do새일정() }, show탭: false }, show: true }
      ]
    }
  ]

  override 자동버튼s = [
    {
      label: '새 메모',
      icon: 'i-lucide-plus',
      onClick: () => { void this.do새메모() }
    },
    {
      label: '새 일정',
      icon: 'i-lucide-plus',
      onClick: () => { void this.do새일정() }
    }
  ]

  do새메모 = () => model태그관계s.getInstance().do빈생성메모(this)
  do새일정 = () => model태그관계s.getInstance().do빈생성일정(this)

  override generate() {
    return this.init()
  }

  override init() {
    return {
      name: '이름',
      icon: 'i-lucide-tag'
    }
  }

  override get label() { return this.이름 }
  override get sub() { return '' }

  /** childIds 계층에서 이 태그를 자식으로 가진 부모 */
  get 부모(): model태그 | null {
    const id = String(this.stateId ?? '')
    if (!id) return null
    return toValue(model태그s.getInstance().list).find(t =>
      t.자식s.some(cid => String(cid) === id)
    ) ?? null
  }

  /** root → 말단 */
  get 경로s(): model태그[] {
    const path: model태그[] = []
    const seen = new Set<string>()
    let cur: model태그 | null = this
    while (cur) {
      const id = String(cur.stateId ?? '')
      if (!id || seen.has(id)) break
      seen.add(id)
      path.unshift(cur)
      cur = cur.부모
    }
    return path
  }

  /** badge용: root-말단 (`일-개발(s/w)`). 루트만이면 이름만 */
  get 경로라벨(): string {
    const path = this.경로s.map(t => t.이름).filter(Boolean)
    if (path.length === 0) return this.이름
    if (path.length === 1) return path[0]!
    return `${path[0]}-${path[path.length - 1]}`
  }

  _badges = computed(() => {
    const badges: { label: string, color: string, icon?: string }[] = []
    // badges.push({ label: `${this.메모수}/${this.전체메모수}`, color: this.전체메모수 > 0 ? 'primary' : 'neutral',
    badges.push({ label: `${this.전체메모수}`, color: this.전체메모수 > 0 ? 'primary' : 'neutral',
      icon: model메모s.getInstance().메뉴?.icon ?? 'i-lucide-tag' })
    // badges.push({ label: `${this.일정수}/${this.전체일정수}`, color: this.전체일정수 > 0 ? 'primary' : 'neutral',
    badges.push({ label: `${this.전체일정수}`, color: this.전체일정수 > 0 ? 'primary' : 'neutral',
      icon: model일정s.getInstance().메뉴?.icon ?? 'i-lucide-calendar' })
    return badges
  })

  override get badges() { return toValue(this._badges) }

  get 이름() { return this.state?.name ?? '' }
  set 이름(v: string) { if (!this.state) return; this.state.name = v }

  get 아이콘() { return this.state?.icon ?? 'i-lucide-tag' }
  set 아이콘(v: string | null) { if (!this.state) return; this.state.icon = v }

  get 메모s() { return model태그관계s.getInstance().get메모sBy태그(this) }
  get 메모수() { return this.메모s.length }

  get 일정s() { return model태그관계s.getInstance().get일정sBy태그(this) }
  get 일정수() { return this.일정s.length }

  /** 자신 + 하위 태그 (순환 방지) */
  get 자손포함s(): model태그[] {
    const tags = model태그s.getInstance()
    const collect = (t: model태그, seen = new Set<string>()): model태그[] => {
      const id = String(t.stateId ?? '')
      if (!id || seen.has(id)) return []
      seen.add(id)
      return [
        t,
        ...t.자식s
          .map(cid => tags.getById(cid))
          .filter((c): c is model태그 => !!c)
          .flatMap(c => collect(c, seen))
      ]
    }
    return collect(this)
  }

  /** 자신+하위 태그 메모 (중복 제거) */
  get 전체메모수() {
    return new Set(this.자손포함s.flatMap(t => t.메모s.map(m => String(m.stateId)))).size
  }

  /** 자신+하위 태그 일정 (중복 제거) */
  get 전체일정수() {
    return new Set(this.자손포함s.flatMap(t => t.일정s.map(e => String(e.stateId)))).size
  }
}

import { computed, toValue } from 'vue'
import { BaseModels2, BaseModel2, 타입지정, type BaseXX, type BaseXXDto, getRepoInstance } from '~utils/models'
import { mDayjs, toCompactDates, type i기간 } from '~utils'

import { model메뉴s } from '../_basics/model메뉴'
import { model태그관계s } from './model태그관계'
import { model태그s, type model태그 } from './model태그'

/**
 * 일정 한 건. **달력에 올리는 일은 여기 없다** — `model달력s` 가 `자동필드ss` 의 `달력` 표시를 보고
 * 합친다. 예전엔 이 repo 가 메모 마감까지 끌어와 `calendarEvents` 를 만들었는데, 일정이 메모를
 * 알아야 할 이유가 없었다.
 */
export interface i일정dto extends BaseXXDto {
  name: string
  startDate: Date
  endDate: Date
}

export interface i일정 extends BaseXX {
  이름: string
  기간: i기간
  태그s: model태그[]
}

export class model일정s extends BaseModels2<model일정, i일정dto> {
  protected etcFields = []
  override 정렬조건s = [
    { label: '날짜↑', value: '날짜↑', func: (a: model일정, b: model일정) => a.기간[0].diff(b.기간[0], 'day') },
    { label: '날짜↓', value: '날짜↓', func: (a: model일정, b: model일정) => b.기간[0].diff(a.기간[0], 'day') },
    { label: '이름↑', value: '이름↑', func: (a: model일정, b: model일정) => a.이름.localeCompare(b.이름) },
    { label: '이름↓', value: '이름↓', func: (a: model일정, b: model일정) => b.이름.localeCompare(a.이름) }
  ]

  override 필터조건ss = []
  static getInstance = () => getRepoInstance('model일정s', () => new model일정s())

  private constructor() {
    // API 경로는 'schedules'가 아니라 'events'다 (localDB/events.json). 바꾸지 말 것.
    super(model일정, 'events')
  }

  get 메뉴() { return model메뉴s.getInstance().getBy테이블명(this.tableName) }

  override async reads() {
    return super.reads()
  }

  override _generate = () => new model일정().generate()
  override _init = () => new model일정().init()
}

export class model일정 extends BaseModel2<i일정dto> implements i일정 {
  constructor(state?: i일정dto) {
    super(model일정s.getInstance(), state)
  }

  override afterCreate = () => { }
  override beforeSave = () => true
  override afterSave = () => { }

  override 자동필드ss = [
    {
      label: '일정',
      list: [
        { key: '이름', label: '이름', show: true },
        { key: '기간', label: '기간', type: 타입지정._.기간, show: true, 달력: { label: '일정', color: '#3b82f6' } }
      ]
    }
  ]

  override generate() {
    return this.init()
  }

  override init() {
    const start = mDayjs()!.startOf('day')!
    return {
      name: '이름',
      startDate: start.toDate(),
      endDate: start.add(1, 'day').toDate()
    }
  }

  override get label() { return this.이름 }
  override get sub() { return toCompactDates(this.기간[0], this.기간[1]) }
  override get icon(): string { return this.태그s[0]?.아이콘 ?? 'i-lucide-calendar' }

  _badges = computed(() => {
    const badges: { label: string, color: string, icon?: string }[] = []
    for (const 태그 of this.태그s) {
      badges.push({ label: 태그.경로라벨, icon: 태그.아이콘 ?? 'i-lucide-tag' })
    }
    return badges
  })

  override get badges() { return toValue(this._badges) }

  get 이름() { return this.state?.name ?? '' }
  set 이름(v: string) { if (!this.state) return; this.state.name = v }

  get 기간() {
    return [mDayjs(this.state?.startDate ?? new Date())!, mDayjs(this.state?.endDate ?? new Date())!] as i기간
  }

  set 기간(v: i기간) {
    if (!this.state) return
    this.state.startDate = v[0].toDate()
    this.state.endDate = v[1].toDate()
  }

  get 태그s(): model태그[] { return model태그관계s.getInstance().get태그sBy일정(this) }
  get 태그id() { return String(this.태그s[0]?.stateId ?? '') }
  set 태그id(v: string) {
    void model태그관계s.getInstance().do일정태그변경(this, model태그s.getInstance().getById(v))
  }
}

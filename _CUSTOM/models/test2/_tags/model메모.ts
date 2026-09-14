import { computed, toValue } from 'vue'
import { BaseModels2, BaseModel2, 타입지정, type BaseXX, type BaseXXDto, getRepoInstance } from '~utils/models'
import { mDayjs, getDDayLabel } from '~utils'
import { model메뉴s } from '../_basics/model메뉴'
import { model태그관계s } from './model태그관계'
import { model태그s, type model태그 } from './model태그'

export const i메모typeoptions = [
  { label: '할일', value: 'TASK', icon: 'i-material-symbols-light:task-alt' },
  { label: '노트', value: 'NOTE', icon: 'i-lucide-sticky-note' },
  { label: '링크', value: 'LINK', icon: 'i-lucide-link' }
] as const
export type i메모type = typeof i메모typeoptions[number]['value']

export const i메모중요도options = [
  { label: '안중요', value: 'LOW', icon: 'i-lucide-signal-low' }, // ,color: 'secondary',},
  { label: '보통', value: 'MEDIUM', icon: 'i-lucide-signal-medium' }, // ,color: 'neutral',},
  { label: '중요', value: 'HIGH', icon: 'i-carbon:important' }// ,color: 'error',},
] as const
export type i메모중요도 = typeof i메모중요도options[number]['value']

export const i메모완료상태options = [
  { label: '보류', value: 'HOLD', icon: 'i-lucide-pause' },
  { label: '시작전', value: 'PLANNED', icon: 'i-lucide-circle' },
  { label: '진행중', value: 'IN_PROGRESS', icon: 'i-lucide-loader' },
  { label: '완료', value: 'DONE', icon: 'i-lucide-circle-check' },
  { label: '창고', value: 'ARCHIVED', icon: 'i-lucide-archive' }
] as const
export type i메모완료상태 = typeof i메모완료상태options[number]['value']

export interface i메모dto extends BaseXXDto {
  name: string
  type: i메모type
  importance: i메모중요도
  status: i메모완료상태
  dueDate?: string
  brief?: string
  link?: string
  content?: string
  hasContent?: boolean
}

export interface i메모 extends BaseXX {
  이름: string
  타입: i메모type
  중요도: i메모중요도
  완료상태: i메모완료상태
  시작일: ReturnType<typeof mDayjs>
  마감일: ReturnType<typeof mDayjs>
  요약: string
  링크: string
  내용: string
  has내용: boolean
  태그s: model태그[]
}

export class model메모s extends BaseModels2<model메모, i메모dto> {
  protected etcFields = []
  override 정렬조건s = [
    { label: '마감일↑', value: '마감일↑', func: (a: model메모, b: model메모) => a.마감일.diff(b.마감일, 'day') },
    { label: '이름↑', value: '이름↑', func: (a: model메모, b: model메모) => a.이름.localeCompare(b.이름) },
    { label: '이름↓', value: '이름↓', func: (a: model메모, b: model메모) => b.이름.localeCompare(a.이름) }
  ]

  override 필터조건ss = [
    this.라디오필터그룹(
      i메모typeoptions.map(item => ({ ...item, match: (a: model메모) => a.타입 === item.value })),
      { title: '타입', isMultiple: !true, initialValues: [] }
    ),
    this.라디오필터그룹(
      i메모중요도options.map(item => ({ ...item, match: (a: model메모) => a.중요도 === item.value })),
      { title: '중요도', isMultiple: !true, initialValues: ['HIGH'] }
    ),
    this.라디오필터그룹(
      i메모완료상태options.map(item => ({ ...item, match: (a: model메모) => a.완료상태 === item.value })),
      { title: '완료상태', isMultiple: !true, initialValues: ['PLANNED', 'IN_PROGRESS', 'DONE'] }
    )
  ]

  static getInstance = () => getRepoInstance('model메모s', () => new model메모s())

  private constructor() {
    super(model메모, 'memos')
  }

  get 메뉴() { return model메뉴s.getInstance().getBy테이블명(this.tableName) }

  override async reads() {
    return super.reads()
  }

  override _generate = () => new model메모().generate()
  override _init = () => new model메모().init()
}

export class model메모 extends BaseModel2<i메모dto> implements i메모 {
  constructor(state?: i메모dto) {
    super(model메모s.getInstance(), state)
  }

  override afterCreate = () => { }
  override beforeSave = () => true
  override afterSave = () => { }

  override 자동필드ss = [
    {
      label: '메모',
      list: [

        { key: '이름', label: '이름', show: true },
        { key: '요약', label: '요약', type: 타입지정._.문자 },

        { key: '태그id', label: '태그', type: 타입지정.선택0, options: model태그s.getInstance().options, show: true },
        { key: '타입', label: '타입', type: 타입지정.선택0, options: i메모typeoptions, props: { type: 'radio' }, show: true },
        // 할일
        { key: '중요도', label: '중요도', type: 타입지정.선택0, options: i메모중요도options, show: computed(() => this.is할일) },
        { key: '완료상태', label: '완료상태', type: 타입지정.선택0, options: i메모완료상태options, show: computed(() => this.is할일) },
        { key: '시작일', label: '시작일', type: 타입지정._.날짜, props: { readonly: true }, canEdit: false, show: computed(() => this.is할일) },
        {
          key: '마감일', label: '마감일', type: 타입지정._.날짜, show: computed(() => this.is할일),
          달력: { label: '할일', color: '#f59e0b', 행색: () => this.중요도 === 'HIGH' ? '#ef4444' : undefined }
        },

        // 링크
        { key: '링크', label: '링크(URL)', show: computed(() => this.is링크) }
      ]
    },
    {
      label: '내용',
      list: [
        // { key: 'has내용', label: '내용', type: 타입지정.선택0, options: [{ label: '없음', value: false },{ label: '있음', value: true }], show: true },
        { key: '내용', label: '내용', type: 타입지정._.문자md, is한줄: false, show: computed(() => this.has내용) }
        // 노트

      ]
    }
  ]

  override generate() {
    return this.init()
  }

  override init() {
    return {
      name: '이름',
      type: 'TASK' as i메모type,
      importance: 'MEDIUM' as i메모중요도,
      status: 'PLANNED' as i메모완료상태,
      dueDate: mDayjs().add(7, 'day').format('YYYY-MM-DD'),
      brief: '',
      link: '',
      content: '',
      hasContent: false
    }
  }

  override get label() { return this.이름 }
  override get sub() {
    return ''
  }

  get brief() { return this.요약 ?? '' }

  override get icon() {
    return i메모typeoptions.find(item => item.value == this.타입)?.icon
      ?? 'i-material-symbols-light:task-alt'
  }

  get is할일() { return this.타입 === 'TASK' }
  get is노트() { return this.타입 === 'NOTE' }
  get is링크() { return this.타입 === 'LINK' }

  _badges = computed(() => {
    const badges: { label: string, color: string, icon?: string }[] = []

    if (this.is할일 && this.중요도 === 'HIGH') {
      const opt = i메모중요도options.find(item => item.value === 'HIGH')
      badges.push({ label: opt?.label, color: 'error', icon: opt?.icon })
    }

    for (const 태그 of this.태그s) {
      badges.push({ label: 태그.경로라벨, icon: 태그.아이콘 ?? 'i-lucide-tag' })
    }

    if (this.is할일) {
      const raw = String(this.state?.dueDate ?? '').trim()
      if (raw) {
        const d = mDayjs(raw)
        if (d.isValid()) {
          const 남은일 = d.startOf('day').diff(mDayjs().startOf('day'), 'day')
          const color = 남은일 < 0 ? 'error' : 남은일 === 0 ? 'error' : 남은일 <= 30 ? 'warning' : 'neutral'
          badges.push({ label: getDDayLabel(d), color })
        }
      }
    }
    return badges
  })

  override get badges() { return toValue(this._badges) }

  get 이름() { return this.state?.name ?? '' }
  set 이름(v: string) { if (!this.state) return; this.state.name = v }

  get 타입() { return (this.state?.type ?? 'TASK') as i메모type }
  set 타입(v: i메모type) { if (!this.state) return; this.state.type = v }

  get 요약() { return this.state?.brief ?? '' }
  set 요약(v: string) { if (!this.state) return; this.state.brief = v }

  get 링크() { return this.state?.link ?? '' }
  set 링크(v: string) { if (!this.state) return; this.state.link = v }

  get 중요도() { return (this.state?.importance ?? 'MEDIUM') as i메모중요도 }
  set 중요도(v: i메모중요도) { if (!this.state) return; this.state.importance = v }

  get 완료상태() { return (this.state?.status ?? 'PLANNED') as i메모완료상태 }
  set 완료상태(v: i메모완료상태) { if (!this.state) return; this.state.status = v }

  _시작일 = computed(() => mDayjs(this.state?.createdAt))
  get 시작일() { return toValue(this._시작일)! }

  get 마감일() {
    const raw = String(this.state?.dueDate ?? '').trim()
    const d = mDayjs(raw)
    return d.isValid() ? d : mDayjs().add(30, 'day')
  }

  set 마감일(v: ReturnType<typeof mDayjs>) {
    if (!this.state) return
    this.state.dueDate = mDayjs(v).format('YYYY-MM-DD')
  }

  get 내용() { return this.state?.content ?? '' }
  set 내용(v: string) { this.state.content = v }

  get has내용() { return this.state.hasContent }
  set has내용(v: boolean) { this.state.hasContent = v }

  get 태그s(): model태그[] { return model태그관계s.getInstance().get태그sBy메모(this) }
  get 태그id() { return String(this.태그s[0]?.stateId ?? '') }
  set 태그id(v: string) {
    void model태그관계s.getInstance().do태그변경(this, model태그s.getInstance().getById(v))
  }
}

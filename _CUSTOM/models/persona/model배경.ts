import { computed, reactive, toValue } from 'vue'
import { BaseModels2, BaseModel2, 타입지정, getRepoInstance } from '~utils/models'
import type { BaseXX, BaseXXDto } from '~utils/models'
import { pick1 } from '~utils'
import { model장소s } from './model장소'

/**
 * **시대적 배경**이다. 인물의 삶 둘레에 깔린 한 시기의 정치·경제·사회·문화 형편(`IMF 구조조정기`, `코로나 시기`).
 *
 * 공간적 배경(한양나루·지하철)은 `model장소`가 **이 표 아래** 든다 — 한 장소는 한 배경에 딸린다. 이 표는 **어느 때를 몇 살로 지났나**만 본다 —
 * 같은 해고라도 IMF 한가운데서 겪은 것과 호황기에 겪은 것은 다르다.
 * 한 해에 박힌 일(1997년 IMF 구제금융)이 아니라 **몇 해에 걸친 공기**(1997~2001 구조조정기)다.
 */
export const i배경갈래options = [
  { label: '정치', value: 'POLITICS' },
  { label: '경제', value: 'ECONOMY' },
  { label: '사회', value: 'SOCIETY' },
  { label: '문화', value: 'CULTURE' },
  { label: '기술', value: 'TECH' }
] as const
export type i배경갈래 = typeof i배경갈래options[number]['value']

/**
 * `generate`용 후보. `model캐릭터.generate()`가 1980~2006년생만 뽑으므로 그들이 지나온 시기로 끊었다.
 * `끝: null`은 아직 끝나지 않은 시기다.
 */
const 시대후보s: readonly { 이름: string, 갈래: i배경갈래, 시작: number, 끝: number | null, 시대상: string }[] = [
  { 이름: '3저 호황', 갈래: 'ECONOMY', 시작: 1986, 끝: 1988, 시대상: '월급이 해마다 오르고 내 집 마련이 먼 꿈이 아니던 때' },
  { 이름: '민주화 이행기', 갈래: 'POLITICS', 시작: 1987, 끝: 1992, 시대상: '거리에서 목소리를 내면 바뀐다고 믿은 때' },
  { 이름: 'IMF 구조조정기', 갈래: 'ECONOMY', 시작: 1997, 끝: 2001, 시대상: '평생직장이 사라지고 가장들이 하루아침에 밀려난 때' },
  { 이름: '벤처 붐', 갈래: 'TECH', 시작: 1999, 끝: 2001, 시대상: '초고속 인터넷과 PC방이 퍼지고 코스닥 대박 얘기가 돌던 때' },
  { 이름: '카드대란', 갈래: 'ECONOMY', 시작: 2002, 끝: 2004, 시대상: '빚이 쉽게 생기고 쉽게 사람을 무너뜨린 때' },
  { 이름: '스마트폰 보급기', 갈래: 'TECH', 시작: 2009, 끝: 2012, 시대상: '누구나 손안에 인터넷을 들고 다니기 시작한 때' },
  { 이름: 'N포 세대', 갈래: 'SOCIETY', 시작: 2011, 끝: 2016, 시대상: '연애·결혼·출산을 하나씩 내려놓는 게 이상하지 않던 때' },
  { 이름: '한류 확산기', 갈래: 'CULTURE', 시작: 2012, 끝: 2020, 시대상: '우리 노래와 드라마가 바깥에서 통하는 걸 지켜본 때' },
  { 이름: '부동산 폭등기', 갈래: 'ECONOMY', 시작: 2017, 끝: 2021, 시대상: '영끌·벼락거지 같은 말이 생겨난 때' },
  { 이름: '코로나 시기', 갈래: 'SOCIETY', 시작: 2020, 끝: 2022, 시대상: '사람을 만나지 않는 것이 예의가 된 때' },
  { 이름: '고금리 시기', 갈래: 'ECONOMY', 시작: 2022, 끝: null, 시대상: '빚을 낸 사람과 안 낸 사람의 형편이 갈린 때' }
]

export interface i배경dto extends BaseXXDto {
  name: string
  kind: i배경갈래 | null
  /** 시기가 시작된 해. */
  startYear: number | null
  /** 시기가 끝난 해. `null`이면 아직 이어지고 있다. */
  endYear: number | null
  /** 사람이 읽는 그 시기의 공기(`평생직장이 사라지고 가장들이 하루아침에 밀려난 때`). */
  desc: string
  photo: string | null
}

export interface i배경 extends BaseXX {
  이름: string
  갈래: i배경갈래 | null
  시작연도: number | null
  끝연도: number | null
  시대상: string
  사진: string | null
}

/** 폼의 빈 칸(`''`)과 숫자가 아닌 값은 `null`로 받는다 — `Number('')`가 0이 되어 `0년`이 되지 않게. */
const to연도 = (v: unknown): number | null => {
  const n = Number(v)
  return v != null && String(v) !== '' && Number.isFinite(n) ? Math.round(n) : null
}

export class model배경s extends BaseModels2<model배경, i배경dto> {
  protected etcFields = []
  static getInstance = () => getRepoInstance('model배경s', () => new model배경s())

  private constructor() {
    super(model배경, 'eras')
    /** 시험용 표라 전역 스위치(`NUXT_PUBLIC_API_URL`)를 안 따르고 lowDB에 남는다. */
    this.apiURL = `/api/v0/${this.tableName}`
  }

  /** 목록5 헤더가 읽는 최소 메뉴 — 이 테이블은 model메뉴 행이 없어서 직접 준다. */
  메뉴 = reactive({ label: '배경', 아이콘: 'i-lucide-hourglass', is계층: false, is시스템: false })

  override 검색필드s = ['이름', '시대상']

  /** 장소의 `배경` 칸이 고르는 선택지. (`model등급s.options`와 같은 꼴) */
  options = computed(() => toValue(this.list).map(row => ({ label: row.이름, icon: row.icon, value: String(row.stateId ?? '') })))

  override 정렬조건s = [
    { label: '시대순', value: '시대순', func: (a: model배경, b: model배경) => (a.시작연도 ?? 9999) - (b.시작연도 ?? 9999) },
    { label: '이름↑', value: '이름↑', func: (a: model배경, b: model배경) => a.이름.localeCompare(b.이름) },
    { label: '이름↓', value: '이름↓', func: (a: model배경, b: model배경) => b.이름.localeCompare(a.이름) }
  ]

  override 필터조건ss = [
    this.라디오필터그룹(
      i배경갈래options.map(item => ({ ...item, match: (a: model배경) => a.갈래 === item.value })),
      { title: '갈래', isMultiple: !false, initialValues: [] }
    )
  ]

  override _generate = () => new model배경().generate()
  override _init = () => new model배경().init()
}

export class model배경 extends BaseModel2<i배경dto> implements i배경 {
  constructor(state?: i배경dto) {
    super(model배경s.getInstance(), state)
  }

  override afterCreate = () => { }
  override beforeSave = () => {
    if (!this.이름.trim()) {
      useAlert().error('저장할 수 없습니다', '이름을 입력해주세요.')
      return false
    }
    if (this.시작연도 != null && this.끝연도 != null && this.끝연도 < this.시작연도) {
      useAlert().error('저장할 수 없습니다', '끝난 해가 시작한 해보다 앞설 수 없습니다.')
      return false
    }
    return true
  }

  override afterSave = () => { }

  override 자동필드ss = [
    {
      label: '배경',
      list: [
        { key: '이름', label: '이름', show: true },
        { key: '갈래', label: '갈래', type: 타입지정.선택0, options: [...i배경갈래options], show: true },
        { key: '시작연도', label: '시작한 해', type: 타입지정._.숫자, show: true },
        // 비워 두면 아직 이어지는 시기다(`2022~`).
        { key: '끝연도', label: '끝난 해', type: 타입지정._.숫자, show: true },
        { key: '시대상', label: '시대상', type: 타입지정._.문자, props: { is여러줄: true }, show: true },
        { key: '사진', label: '사진', type: 타입지정.이미지2, show: true },
        // 읽기 전용. 더하고 고치는 자리는 장소 화면(`/p/places`)이다.
        { key: '장소s', label: '장소', type: 타입지정._.문자s, show: true, canEdit: false }
      ]
    }
  ]

  override 자동버튼s = this.기본버튼s

  override generate() {
    const 후보 = pick1(시대후보s)
    return {
      ...this.init(),
      name: 후보.이름,
      kind: 후보.갈래,
      startYear: 후보.시작,
      endYear: 후보.끝,
      desc: 후보.시대상
    }
  }

  override init() {
    return {
      name: '',
      kind: null,
      startYear: null,
      endYear: null,
      desc: '',
      photo: null
    }
  }

  override get label() { return this.이름 }
  override get sub() { return [this.갈래라벨, this.기간라벨].filter(Boolean).join(' · ') }
  override get icon() { return 'i-lucide-hourglass' }
  override get thumbnail() { return this.사진 ?? undefined }

  get 이름() { return this.state?.name ?? '' }
  set 이름(v: string) { if (!this.state) return; this.state.name = v }

  get 갈래() { return (this.state?.kind ?? null) as i배경갈래 | null }
  set 갈래(v: i배경갈래 | null) { if (!this.state) return; this.state.kind = v || null }

  get 갈래라벨() { return i배경갈래options.find(item => item.value === this.갈래)?.label ?? '' }

  get 시작연도() { return to연도(this.state?.startYear) }
  set 시작연도(v: number | null) { if (!this.state) return; this.state.startYear = to연도(v) }

  get 끝연도() { return to연도(this.state?.endYear) }
  set 끝연도(v: number | null) { if (!this.state) return; this.state.endYear = to연도(v) }

  /** `1997~2001`. 끝이 없으면 `2022~`, 시작도 없으면 빈 문자열. */
  get 기간라벨() {
    if (this.시작연도 == null) return this.끝연도 != null ? `~${this.끝연도}` : ''
    return `${this.시작연도}~${this.끝연도 ?? ''}`
  }

  get 시대상() { return this.state?.desc ?? '' }
  set 시대상(v: string) { if (!this.state) return; this.state.desc = v }

  get 사진() { return this.state?.photo ?? null }
  set 사진(v: string | null) { if (!this.state) return; this.state.photo = v || null }

  /** 이 시대에 딸린 장소들(`한양나루`). */
  get 장소s() {
    const id = this.stateId
    if (id == null) return []
    return toValue(model장소s.getInstance().list)
      .filter(row => row.배경id === String(id))
      .map(row => row.이름)
  }
}

import { computed, reactive, toValue } from 'vue'
import { BaseModels2, BaseModel2, 타입지정, getRepoInstance } from '~utils/models'
import type { BaseXX, BaseXXDto } from '~utils/models'
import { pick1 } from '~utils'
import { model배경s, type model배경 } from './model배경'

/**
 * 배경의 나머지 반쪽 — **공간적 배경**이다. 한 시대의 한 자리(`한양나루`, `반지하 원룸`).
 * 시간적 배경(`model배경`)과 짝을 이룬다: `조선 17세기`(배경) · `한양나루`(장소).
 *
 * **한 장소는 한 배경 아래 있다**(`배경` 필수). 지도 위의 좌표가 아니라 *그 시대의 그 자리*라서다 —
 * 이름부터 시대에 묶이고(`한양나루` ↔ `한강 둔치`) 묘사도 시대마다 다르다. 같은 강가라도 시대가 다르면
 * **다른 행 둘**이다.
 */
export const i장소갈래options = [
  { label: '집', value: 'HOME' },
  { label: '일터', value: 'WORK' },
  { label: '가게', value: 'SHOP' },
  { label: '교통', value: 'TRANSIT' },
  { label: '공공', value: 'PUBLIC' },
  { label: '자연', value: 'NATURE' }
] as const
export type i장소갈래 = typeof i장소갈래options[number]['value']

/**
 * `generate`용 후보. **`시대`는 `model배경`의 후보 이름 그대로다** — 뽑을 때 그 이름의 배경 행을 찾아 잇는다.
 * 배경이 하나도 안 실렸으면 배경 없는 초안이 나오고, 그건 저장이 막힌다(`beforeSave`) — 손으로 고르라는 뜻이다.
 *
 * 조선 17세기의 한양나루처럼 배경 후보표 밖의 시대는 여기 없다. 배경 행부터 손으로 만들고 장소도 손으로 넣는다.
 */
const 장소후보s: readonly { 이름: string, 갈래: i장소갈래, 시대: string, 묘사: string }[] = [
  { 이름: '공장 기숙사', 갈래: 'WORK', 시대: '3저 호황', 묘사: '교대 근무가 끝나면 이층 침대에 몸만 누인다' },
  { 이름: '대학 앞 골목', 갈래: 'PUBLIC', 시대: '민주화 이행기', 묘사: '최루탄 냄새가 가시지 않은 채 사람들이 모였다 흩어진다' },
  { 이름: '구청 민원실', 갈래: 'PUBLIC', 시대: 'IMF 구조조정기', 묘사: '번호표를 쥐고 서류가 맞는지 몇 번이고 다시 본다' },
  { 이름: '동네 PC방', 갈래: 'SHOP', 시대: '벤처 붐', 묘사: '담배 연기와 모뎀 소리, 자정이 넘어도 자리가 없다' },
  { 이름: '은행 창구', 갈래: 'PUBLIC', 시대: '카드대란', 묘사: '유리 너머에서 돌려막을 방법을 묻는다' },
  { 이름: '지하철 2호선', 갈래: 'TRANSIT', 시대: '스마트폰 보급기', 묘사: '출근길 사람들 틈에 끼어 휴대폰만 내려다본다' },
  { 이름: '고시원', 갈래: 'HOME', 시대: 'N포 세대', 묘사: '옆방 기침 소리가 다 들리고 창은 복도로 나 있다' },
  { 이름: '명동 거리', 갈래: 'SHOP', 시대: '한류 확산기', 묘사: '외국말이 섞여 들리고 가게마다 같은 노래가 흐른다' },
  { 이름: '모델하우스', 갈래: 'PUBLIC', 시대: '부동산 폭등기', 묘사: '번호표를 받아 들고 남의 집 거실을 구경한다' },
  { 이름: '반지하 원룸', 갈래: 'HOME', 시대: '코로나 시기', 묘사: '창밖으로 지나가는 발목이 보이고 하루 종일 그 안에 있다' },
  { 이름: '한강 둔치', 갈래: 'NATURE', 시대: '코로나 시기', 묘사: '돗자리와 배달 음식, 마스크를 턱에 걸친 사람들' },
  { 이름: '편의점', 갈래: 'SHOP', 시대: '고금리 시기', 묘사: '새벽에도 불이 꺼지지 않고 계산대 너머로 늘 같은 얼굴이 있다' }
]

export interface i장소dto extends BaseXXDto {
  name: string
  kind: i장소갈래 | null
  /** 시간적 배경(`model배경`). **비울 수 없다** — 장소는 그 시대의 그 자리다(머리말). */
  eraId: string | null
  /** 사람이 읽는 그 자리의 모습(`강바람에 나룻배가 흔들리고…`). */
  desc: string
  photo: string | null
}

export interface i장소 extends BaseXX {
  이름: string
  갈래: i장소갈래 | null
  배경: model배경 | null
  묘사: string
  사진: string | null
}

export class model장소s extends BaseModels2<model장소, i장소dto> {
  protected etcFields = []
  static getInstance = () => getRepoInstance('model장소s', () => new model장소s())

  private constructor() {
    super(model장소, 'places')
    /** 시험용 표라 전역 스위치(`NUXT_PUBLIC_API_URL`)를 안 따르고 lowDB에 남는다. */
    this.apiURL = `/api/v0/${this.tableName}`
  }

  /** 목록5 헤더가 읽는 최소 메뉴 — 이 테이블은 model메뉴 행이 없어서 직접 준다. */
  메뉴 = reactive({ label: '장소', 아이콘: 'i-lucide-map-pin', is계층: false, is시스템: false })

  override 검색필드s = ['이름', '묘사']

  /** 장소 전체를 선택지로. 배경을 가리지 않는 자리(목록 헤더 등)에서만 쓴다. (`model배경s.options`와 같은 꼴) */
  options = computed(() => toValue(this.list).map(row => ({ label: row.이름, icon: row.icon, value: String(row.stateId ?? '') })))

  /** 후보의 `시대` 이름으로 배경 행을 찾는다. `generate`가 뽑은 장소를 그 시대에 걸 때 쓴다. */
  getBy시대이름 = (이름: string): model배경 | null =>
    toValue(model배경s.getInstance().list).find(row => row.이름 === 이름.trim()) ?? null

  override 정렬조건s = [
    { label: '이름↑', value: '이름↑', func: (a: model장소, b: model장소) => a.이름.localeCompare(b.이름) },
    { label: '이름↓', value: '이름↓', func: (a: model장소, b: model장소) => b.이름.localeCompare(a.이름) }
  ]

  override 필터조건ss = [
    this.라디오필터그룹(
      i장소갈래options.map(item => ({ ...item, match: (a: model장소) => a.갈래 === item.value })),
      { title: '갈래', isMultiple: !false, initialValues: [] }
    )
  ]

  override _generate = () => new model장소().generate()
  override _init = () => new model장소().init()
}

export class model장소 extends BaseModel2<i장소dto> implements i장소 {
  constructor(state?: i장소dto) {
    super(model장소s.getInstance(), state)
  }

  override afterCreate = () => { }
  override beforeSave = () => {
    if (!this.이름.trim()) {
      useAlert().error('저장할 수 없습니다', '이름을 입력해주세요.')
      return false
    }
    // 배경 없는 장소는 어느 시대의 자리인지 알 수 없다.
    if (!this.배경id) {
      useAlert().error('저장할 수 없습니다', '배경을 골라주세요.')
      return false
    }
    return true
  }

  override afterSave = () => { }

  override 자동필드ss = [
    {
      label: '장소',
      list: [
        { key: '이름', label: '이름', show: true },
        { key: '갈래', label: '갈래', type: 타입지정.선택0, options: [...i장소갈래options], show: true },
        // 필수. 같은 강가라도 시대가 다르면 다른 장소다(`한양나루` ↔ `한강 둔치`).
        { key: '배경id', label: '배경', type: 타입지정.선택0, options: model배경s.getInstance().options, show: true },
        { key: '묘사', label: '묘사', type: 타입지정._.문자, props: { is여러줄: true }, show: true },
        { key: '사진', label: '사진', type: 타입지정.이미지2, show: true }
      ]
    }
  ]

  override 자동버튼s = this.기본버튼s

  override generate() {
    const repo = model장소s.getInstance()
    // 실려 있는 배경에 걸 수 있는 후보만. 하나도 못 걸면 그냥 뽑고 배경은 사람이 고른다.
    const 걸리는s = 장소후보s.filter(item => repo.getBy시대이름(item.시대))
    const 후보 = pick1(걸리는s.length ? 걸리는s : 장소후보s)
    const 배경 = repo.getBy시대이름(후보.시대)
    return {
      ...this.init(),
      name: 후보.이름,
      kind: 후보.갈래,
      eraId: 배경?.stateId ? String(배경.stateId) : null,
      desc: 후보.묘사
    }
  }

  override init() {
    return {
      name: '',
      kind: null,
      eraId: null,
      desc: '',
      photo: null
    }
  }

  override get label() { return this.이름 }
  override get sub() { return [this.갈래라벨, this.배경?.label].filter(Boolean).join(' · ') }
  override get icon() { return 'i-lucide-map-pin' }
  override get thumbnail() { return this.사진 ?? undefined }

  get 이름() { return this.state?.name ?? '' }
  set 이름(v: string) { if (!this.state) return; this.state.name = v }

  get 갈래() { return (this.state?.kind ?? null) as i장소갈래 | null }
  set 갈래(v: i장소갈래 | null) { if (!this.state) return; this.state.kind = v || null }

  get 갈래라벨() { return i장소갈래options.find(item => item.value === this.갈래)?.label ?? '' }

  get 배경id() { return String(this.state?.eraId ?? '') }
  set 배경id(v: string) { if (!this.state) return; this.state.eraId = String(v ?? '').trim() || null }

  get 배경() {
    const id = this.state?.eraId
    return id ? model배경s.getInstance().getById(id) ?? null : null
  }

  get 묘사() { return this.state?.desc ?? '' }
  set 묘사(v: string) { if (!this.state) return; this.state.desc = v }

  get 사진() { return this.state?.photo ?? null }
  set 사진(v: string | null) { if (!this.state) return; this.state.photo = v || null }
}

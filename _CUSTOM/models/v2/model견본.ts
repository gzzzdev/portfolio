import { reactive } from 'vue'
import { BaseModels2, BaseModel2, 타입지정, getRepoInstance } from '~utils/models'
import type { BaseXX, BaseXXDto } from '~utils/models'
import type { iFile } from '~utils'
import { do필드폼, mDayjs, mTime } from '~utils'

/**
 * 입력칸 견본. **값이 아니라 모양을 보는 표다.**
 *
 * 다른 v2 표(과일·동물·채소)는 도우미 실험용이라 칸이 적고 의미가 있어야 한다 — 거기 적힌
 * `원산지`·`분류`는 그대로 도우미 어휘가 되므로 잡칸을 늘리면 어휘가 오염된다. 이 표는 반대다.
 * 칸이 **많고 아무 뜻도 없어야** 한다. 그래서 표를 따로 팠다.
 *
 * 그래서 이 표는 `aiV2/sources.ts`에 **넣지 않는다.** 도우미가 고를 축이 없다.
 *
 * ## 무엇을 확인하는 자리인가
 * `타입지정`에 선언된 입력 타입이 폼에서 실제로 그려지는지. 2026-09-05 기준 v2 전체가 쓰던 타입은
 * 9개뿐이고 나머지 21개는 앱 어디에도 안 걸려 있었다 — ORM 매핑(`ORM.resolve.client.ts`)이 깨져도
 * 아무 화면도 안 아팠다는 뜻이다. 여기가 그 회귀를 눈으로 잡는 판이다.
 *
 * 깔아놓자마자 다섯이 걸려서 같은 날 정리됐다 — `숫자3`(상호작용이 한 줄도 없는 표시 부품이라
 * `m원형게이지`로 옮김) · `선택`·`선택4`(래퍼 없는 날것, 실사용 0) · `top버튼`·`do버튼`(같은 값
 * 두 벌, 부르던 모델 세트가 이미 삭제됨). `선택2`는 박혀 있던 `variant`만 뺐다.
 * **판을 깔지 않으면 안 보이는 것들이었다는 게 이 표의 값이다.**
 *
 * ## 일부러 빠진 것 — `타입지정._.카드` · `타입지정._.카드s`
 * 그 둘은 스칼라 칸이 아니라 **모델 인스턴스**를 받는다(`model등급.하위등급s` 처럼 관계 필드 자리다).
 * `view모델필드s2`가 넘겨주는 건 `modelValue`·`readonly`뿐이라 여기서 값을 지어내 꽂아봐야
 * 실제 쓰임과 다른 모양이 나온다. 관계 필드의 렌더는 test2의 등급·태그 화면에서 이미 매일 돈다.
 */

/** 한 겹짜리 선택지. `선택0`·`선택2`·`선택s`가 같은 배열을 나눠 쓴다. */
export const i견본고르기options = [
  { label: '하나', value: '하나' },
  { label: '둘', value: '둘' },
  { label: '셋', value: '셋' }
]

/** 두 겹짜리 선택지(`선택계층`). 위 칸을 바꾸면 아래 칸은 setter가 비운다. */
export const i견본계층options = [
  {
    label: '과일', value: '과일',
    items: [{ label: '사과', value: '사과' }, { label: '수박', value: '수박' }]
  },
  {
    label: '채소', value: '채소',
    items: [{ label: '감자', value: '감자' }, { label: '당근', value: '당근' }]
  }
]

/** 매트릭스 축. 값과 달리 축은 폼 스펙의 `props`로 넘어간다(모델 상태가 아니다). */
export const i견본매트릭스행s = [
  { key: '읽기', label: '읽기' },
  { key: '쓰기', label: '쓰기' },
  { key: '지우기', label: '지우기' }
]
export const i견본매트릭스열s = [
  { key: '손님', label: '손님' },
  { key: '회원', label: '회원' },
  { key: '관리자', label: '관리자' }
]

/**
 * 저장되는 값. **키는 전부 ASCII다** — `BaseModel2`가 서버로 보낼 때 한글 키를 걸러내므로
 * (`BaseModels2.ts`의 순수 데이터값 추림) 한글로 적으면 조용히 안 저장된다.
 */
export interface i견본dto extends BaseXXDto {
  /** `문자` — 아무 타입도 안 적었을 때 나오는 기본 칸이기도 하다. */
  label: string
  /** `문자` + `props.is여러줄` — 같은 타입인데 props로 모양이 갈리는 유일한 자리. */
  memo: string
  /** `전화번호` */
  phone: string
  /**
   * `문자md` — **md 다**(`Input본문` → `mEditorMd` → `mEditor`). 서식 있는 글은 이 타입 하나뿐이다.
   *
   * 2026-09-07 이전에는 `문자서식`(TipTap WYSIWYG)이라 HTML 이었고, 그래서 여기 마크다운을
   * 넣으면 `## 제목` 이 글자 그대로 보였다(견본 시드에 처음 그렇게 넣었다가 화면에서 보고 고쳤다).
   * 지금은 반대다 — 넣어야 하는 게 md 고, HTML 을 넣으면 글자로 보인다.
   */
  rich: string
  /** `링크` — 하이퍼링크 주소. 그림 주소가 아니다(`model애셋` 머리말 참고). */
  link: string
  /** `아이콘` — iconify 이름 한 줄(`i-lucide-apple`). */
  icon: string
  /** `문자s` — 태그 입력. */
  tags: string[]

  /** `숫자` — 그냥 입력칸. */
  num: number
  /** `숫자2` — 슬라이더. `props`로 min·max·step·suffix를 준다. */
  gauge: number
  /** `is체크` */
  isOn: boolean

  /** `날짜` — `YYYY-MM-DD`. */
  day: string
  /** `날짜2` — 날짜+시각. ISO 문자열. */
  dayTime: string
  /** `시간` — `HH:mm`. 값 타입이 dayjs가 아니라 `mTime`인 유일한 칸. */
  time: string
  /** `월선택` — `YYYY-MM`. */
  month: string
  /** `기간` — `[YYYY-MM-DD, YYYY-MM-DD]`. 끝이 비면 열린 기간. */
  range: string[]
  /** `기간시간` — `[ISO, ISO]`. 기간과 달리 양끝이 다 있어야 한다. */
  rangeTime: string[]

  /** `선택0` = `Input선택기`. 지금 가장 많이 쓰는 고르개. */
  pick: string
  /** `선택2` = `URadioGroup`. 값이 서넛일 때만 — 그 밖에는 `선택0`이다. */
  pickRadio: string
  /** `선택s` = `Input선택기S`. 여러 개. */
  picks: string[]
  /** `선택계층` 위 칸. */
  cat: string
  /** `선택계층` 아래 칸. 위 칸이 바뀌면 비워진다. */
  catSub: string
  /** `매트릭스` — `행키 → 열키 → 참`. */
  matrix: Record<string, Record<string, boolean>>

  /** `이미지` = `Input사진`. 주소 한 줄. */
  photo: string
  /** `이미지2` = `Input사진3`. 같은 주소 한 줄인데 AI생성·검색 패널이 붙는다. */
  photo2: string
  /** `파일` — 이름·확장자·주소 한 덩어리. */
  file: iFile | null
  /** `유튜브` — 영상 주소. */
  youtube: string
}

export interface i견본 extends BaseXX {
  label: string
  메모: string
  전화: string
  서식글: string
  링크: string
  아이콘: string
  태그s: string[]
  숫자: number
  슬라이더: number
  켜짐: boolean
  날짜: ReturnType<typeof mDayjs>
  날짜시각: ReturnType<typeof mDayjs>
  시각: mTime | null
  달: ReturnType<typeof mDayjs>
  기간: [ReturnType<typeof mDayjs>, ReturnType<typeof mDayjs> | null] | null
  기간시각: [ReturnType<typeof mDayjs>, ReturnType<typeof mDayjs>] | null
  고르기: string
  고르기Radio: string
  여럿고르기: string[]
  분류: string
  분류하위: string
  매트릭스: Record<string, Record<string, boolean>>
  사진: string
  사진2: string
  파일: iFile | null
  유튜브: string
}

export class model견본s extends BaseModels2<model견본, i견본dto> {
  protected etcFields = []
  static getInstance = () => getRepoInstance('model견본s', () => new model견본s())

  private constructor() {
    super(model견본, 'samples')
    /** 시험용 표라 전역 스위치(`NUXT_PUBLIC_API_URL`)를 안 따르고 lowDB에 남는다. */
    this.apiURL = `/api/v0/${this.tableName}`
  }

  /** 목록5 헤더가 읽는 최소 메뉴 — v2에는 `model메뉴` 행이 없어서 직접 준다. */
  메뉴 = reactive({ label: '견본', 아이콘: 'i-lucide-shapes', is계층: false, is시스템: false })

  override 검색필드s = ['label', '메모']

  /**
   * 축은 하나만 둔다. 이 표의 목적이 필터가 아니라 폼이라, 축이 많아지면 목록 왼쪽이
   * 확인하려는 폼보다 커진다.
   */
  override 필터조건ss = [
    this.라디오필터그룹<model견본>(
      i견본고르기options.map(o => ({
        label: o.label,
        value: (a: model견본) => a.고르기 === o.value
      })),
      { key: '고르기', title: '고르기' }
    )
  ]

  override _generate = () => new model견본().generate()
  override _init = () => new model견본().init()
}

export class model견본 extends BaseModel2<i견본dto> implements i견본 {
  constructor(state?: i견본dto) {
    super(model견본s.getInstance(), state)
  }

  override afterCreate = () => { }
  override beforeSave = () => {
    if (!this.label.trim()) {
      useAlert().error('저장할 수 없습니다', '이름을 입력해주세요.')
      return false
    }
    return true
  }

  override afterSave = () => { }

  /**
   * 타입 하나당 칸 하나. 묶음(탭)은 값의 종류로 갈랐다 — 타입 순서대로 한 줄로 늘어놓으면
   * 스물몇 칸이 한 탭에 쌓여서 무엇이 무엇인지 안 보인다.
   *
   * `폭`은 일부러 안 적는다. 어떤 칸이 한 줄을 통째로 가져가는지도 확인 대상이라
   * `view/1.ts`의 `기본폭`이 정하는 대로 두는 게 맞다.
   */
  override 자동필드ss = [
    {
      label: '글자',
      list: [
        { key: 'label', label: '이름', show: true },
        { key: '메모', label: '메모(여러줄)', props: { is여러줄: true, rows: 3 }, show: true },
        { key: '전화', label: '전화번호', type: 타입지정._.전화번호, show: true },
        { key: '서식글', label: '서식글', type: 타입지정._.문자md, is한줄: false, show: true },
        { key: '링크', label: '링크', type: 타입지정.링크, show: true },
        { key: '아이콘', label: '아이콘', type: 타입지정._.아이콘, show: true },
        { key: '태그s', label: '태그', type: 타입지정._.문자s, show: true }
      ]
    },
    {
      label: '숫자',
      list: [
        { key: '숫자', label: '숫자', type: 타입지정._.숫자, show: true },
        { key: '슬라이더', label: '슬라이더', type: 타입지정._.숫자2, props: { min: 0, max: 100, step: 5, suffix: '%' }, show: true },
        { key: '켜짐', label: '체크', type: 타입지정._.is체크, show: true }
      ]
    },
    {
      label: '때',
      list: [
        { key: '날짜', label: '날짜', type: 타입지정._.날짜, show: true },
        { key: '날짜시각', label: '날짜+시각', type: 타입지정._.날짜2, show: true },
        { key: '시각', label: '시각', type: 타입지정._.시간, show: true },
        { key: '달', label: '월선택', type: 타입지정._.월선택, show: true },
        { key: '기간', label: '기간', type: 타입지정._.기간, show: true },
        { key: '기간시각', label: '기간+시각', type: 타입지정._.기간시간, show: true }
      ]
    },
    {
      label: '고르기',
      list: [
        { key: '고르기', label: '선택0(선택기)', type: 타입지정.선택0, options: i견본고르기options, show: true },
        { key: '고르기Radio', label: '선택2(라디오줄)', type: 타입지정.선택2, options: i견본고르기options, show: true },
        { key: '여럿고르기', label: '선택s(여러개)', type: 타입지정.선택s, options: i견본고르기options, show: true },
        { key: '분류계층', label: '선택계층(2단)', type: 타입지정.선택계층, options: i견본계층options, show: true },
        { key: '매트릭스', label: '매트릭스', type: 타입지정.매트릭스, is한줄: false, props: { rows: i견본매트릭스행s, columns: i견본매트릭스열s }, show: true }
      ]
    },
    {
      label: '올리기',
      list: [
        { key: '사진', label: '이미지(사진)', type: 타입지정.이미지, is한줄: false, show: true },
        { key: '사진2', label: '이미지2(사진3)', type: 타입지정.이미지2, is한줄: false, show: true },
        { key: '파일', label: '파일', type: 타입지정.파일, is한줄: false, props: { type: 'upload' }, show: true },
        { key: '유튜브', label: '유튜브', type: 타입지정.유튜브, is한줄: false, show: true },
        // `position` 없는 버튼필드 — 상단바로 안 올라가고 선언한 이 자리에 인라인으로 그려진다.
        { key: 'do토스트', label: '인라인 버튼', type: 타입지정.버튼, icon: 'i-lucide-bell', show: true }
      ]
    }
  ]

  override 자동버튼s = this.기본버튼s.concat([
    { key: 'do토스트', label: 'do토스트', icon: 'i-lucide-bell', position: 'top', show: true },
    { key: 'do수정', label: '값수정', icon: 'i-lucide-pencil', position: 'top', show: true },
    { key: 'do삭제', label: '삭제', icon: 'i-lucide-trash-2', position: 'top', show: true }
  ])

  do토스트 = () => useAlert().show(this.label, '')
  do삭제 = () => this.delete()
  do수정 = () => do필드폼(this)

  override generate() {
    return this.init()
  }

  /**
   * 새 행은 **거의 다 비운다.** 값이 차 있으면 "빈 칸이 어떻게 그려지나"를 못 본다 —
   * 빈 값 렌더가 깨지는 게 이 판에서 잡고 싶은 사고의 절반이다.
   */
  override init() {
    return {
      label: '새 견본',
      memo: '',
      phone: '',
      rich: '',
      link: '',
      icon: '',
      tags: [],
      num: 0,
      gauge: 0,
      isOn: false,
      day: '',
      dayTime: '',
      time: '',
      month: '',
      range: [],
      rangeTime: [],
      pick: '',
      pickRadio: '',
      picks: [],
      cat: '',
      catSub: '',
      matrix: {},
      photo: '',
      photo2: '',
      file: null,
      youtube: ''
    }
  }

  override get label() { return this.state?.label ?? '' }
  set label(v: string) { if (!this.state) return; this.state.label = v }

  get 메모() { return this.state?.memo ?? '' }
  set 메모(v: string) { if (!this.state) return; this.state.memo = String(v ?? '') }

  get 전화() { return this.state?.phone ?? '' }
  set 전화(v: string) { if (!this.state) return; this.state.phone = String(v ?? '') }

  get 서식글() { return this.state?.rich ?? '' }
  set 서식글(v: string) { if (!this.state) return; this.state.rich = String(v ?? '') }

  get 링크() { return this.state?.link ?? '' }
  set 링크(v: string) { if (!this.state) return; this.state.link = String(v ?? '') }

  get 아이콘() { return this.state?.icon ?? '' }
  set 아이콘(v: string) { if (!this.state) return; this.state.icon = String(v ?? '') }

  get 태그s() { return this.state?.tags ?? [] }
  set 태그s(v: string[]) { if (!this.state) return; this.state.tags = Array.isArray(v) ? v.map(String) : [] }

  /** 빈 칸이 오면 `Number('')`가 0이 아니라 NaN이라 눌러 둔다 (v2 다른 표와 같은 처방). */
  get 숫자() { const n = Number(this.state?.num); return Number.isFinite(n) ? n : 0 }
  set 숫자(v: number) { if (!this.state) return; const n = Number(v); this.state.num = Number.isFinite(n) ? n : 0 }

  get 슬라이더() { const n = Number(this.state?.gauge); return Number.isFinite(n) ? n : 0 }
  set 슬라이더(v: number) {
    if (!this.state) return
    const n = Number(v)
    this.state.gauge = Number.isFinite(n) ? Math.min(100, Math.max(0, Math.round(n))) : 0
  }

  get 켜짐() { return !!this.state?.isOn }
  set 켜짐(v: boolean) { if (!this.state) return; this.state.isOn = !!v }

  /** 안 적힌 날은 오늘로 채우지 않는다 — 빈 날짜는 "모른다"이지 "오늘"이 아니다. */
  get 날짜() { return mDayjs(String(this.state?.day ?? '').trim()) }
  set 날짜(v: ReturnType<typeof mDayjs>) {
    if (!this.state) return
    const d = mDayjs(v)
    this.state.day = d.isValid() ? d.format('YYYY-MM-DD') : ''
  }

  get 날짜시각() { return mDayjs(String(this.state?.dayTime ?? '').trim()) }
  set 날짜시각(v: ReturnType<typeof mDayjs>) {
    if (!this.state) return
    const d = mDayjs(v)
    this.state.dayTime = d.isValid() ? d.toISOString() : ''
  }

  /**
   * 시각만 dayjs가 아니라 `mTime`(`@internationalized/date`의 `Time`)이다.
   * `is_mTime`이 `year`가 없는 걸로 날짜와 가르므로 dayjs를 여기 넣으면 타입 추론이 어긋난다.
   */
  get 시각(): mTime | null {
    const raw = String(this.state?.time ?? '').trim()
    const m = /^(\d{1,2}):(\d{2})$/.exec(raw)
    if (!m) return null
    return new mTime(Number(m[1]), Number(m[2]))
  }

  set 시각(v: mTime | null) {
    if (!this.state) return
    if (v == null || !Number.isFinite(Number(v.hour))) { this.state.time = ''; return }
    this.state.time = `${String(v.hour).padStart(2, '0')}:${String(v.minute).padStart(2, '0')}`
  }

  get 달() { return mDayjs(String(this.state?.month ?? '').trim()) }
  set 달(v: ReturnType<typeof mDayjs>) {
    if (!this.state) return
    const d = mDayjs(v)
    this.state.month = d.isValid() ? d.format('YYYY-MM') : ''
  }

  /** 끝이 없으면 `null`로 돌려준다 — `Input기간`이 열린 기간을 그렇게 읽는다. */
  get 기간(): [ReturnType<typeof mDayjs>, ReturnType<typeof mDayjs> | null] | null {
    const [a, b] = this.state?.range ?? []
    if (!a) return null
    const start = mDayjs(a)
    if (!start.isValid()) return null
    const end = b ? mDayjs(b) : null
    return [start, end && end.isValid() ? end : null]
  }

  set 기간(v: [ReturnType<typeof mDayjs>, ReturnType<typeof mDayjs> | null] | null) {
    if (!this.state) return
    if (!v?.[0]) { this.state.range = []; return }
    const start = mDayjs(v[0])
    const end = v[1] ? mDayjs(v[1]) : null
    this.state.range = start.isValid()
      ? [start.format('YYYY-MM-DD'), end?.isValid() ? end.format('YYYY-MM-DD') : '']
      : []
  }

  /** 기간과 달리 양끝이 다 있어야 한다(`Input기간시간`이 둘 다 채워 emit 한다). */
  get 기간시각(): [ReturnType<typeof mDayjs>, ReturnType<typeof mDayjs>] | null {
    const [a, b] = this.state?.rangeTime ?? []
    if (!a || !b) return null
    const start = mDayjs(a)
    const end = mDayjs(b)
    return start.isValid() && end.isValid() ? [start, end] : null
  }

  set 기간시각(v: [ReturnType<typeof mDayjs>, ReturnType<typeof mDayjs>] | null) {
    if (!this.state) return
    if (!v?.[0] || !v?.[1]) { this.state.rangeTime = []; return }
    const start = mDayjs(v[0])
    const end = mDayjs(v[1])
    this.state.rangeTime = start.isValid() && end.isValid() ? [start.toISOString(), end.toISOString()] : []
  }

  get 고르기() { return this.state?.pick ?? '' }
  set 고르기(v: string) { if (!this.state) return; this.state.pick = String(v ?? '') }

  get 고르기Radio() { return this.state?.pickRadio ?? '' }
  set 고르기Radio(v: string) { if (!this.state) return; this.state.pickRadio = String(v ?? '') }

  get 여럿고르기() { return this.state?.picks ?? [] }
  set 여럿고르기(v: string[]) { if (!this.state) return; this.state.picks = Array.isArray(v) ? v.map(String) : [] }

  get 분류() { return this.state?.cat ?? '' }
  set 분류(v: string) {
    if (!this.state) return
    this.state.cat = String(v ?? '')
  }

  get 분류하위() { return this.state?.catSub ?? '' }
  set 분류하위(v: string) {
    if (!this.state) return
    const 하위s = i견본계층options.find(o => o.value === this.분류)?.items ?? []
    const next = String(v ?? '')
    this.state.catSub = 하위s.some(o => o.value === next) ? next : ''
  }

  /** `타입지정.선택계층` 필드가 v-model 로 잡는 값. 위 칸만 바뀌면 아래 칸은 setter가 알아서 비운다. */
  get 분류계층() { return { value: this.분류, subValue: this.분류하위 } }
  set 분류계층(v: { value: string | null, subValue: string | null } | null) {
    this.분류 = v?.value ?? ''
    this.분류하위 = v?.subValue ?? ''
  }

  get 매트릭스() { return this.state?.matrix ?? {} }
  set 매트릭스(v: Record<string, Record<string, boolean>>) {
    if (!this.state) return
    this.state.matrix = v && typeof v === 'object' ? v : {}
  }

  get 사진() { return this.state?.photo ?? '' }
  set 사진(v: string) { if (!this.state) return; this.state.photo = String(v ?? '') }

  get 사진2() { return this.state?.photo2 ?? '' }
  set 사진2(v: string) { if (!this.state) return; this.state.photo2 = String(v ?? '') }

  get 파일() { return this.state?.file ?? null }
  set 파일(v: iFile | null) { if (!this.state) return; this.state.file = v ?? null }

  get 유튜브() { return this.state?.youtube ?? '' }
  set 유튜브(v: string) { if (!this.state) return; this.state.youtube = String(v ?? '') }

  /** 목록 두 번째 줄. 어떤 칸이 채워졌는지가 이 표에서 유일하게 궁금한 요약이다. */
  override get sub() {
    return [this.고르기, this.분류, this.태그s.length ? `태그${this.태그s.length}` : ''].filter(Boolean).join(' · ')
  }
}

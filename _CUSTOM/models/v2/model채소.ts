import { reactive } from 'vue'
import { BaseModels2, BaseModel2, 타입지정, getRepoInstance } from '~utils/models'
import type { BaseXX, BaseXXDto } from '~utils/models'
import { do필드폼 } from '~utils'
import { model기록s } from './model기록'

/**
 * 어디를 먹는지 — **폼 선택지이자 필터 축**이다. 두 곳이 같은 배열을 봐야 어긋나지 않는다.
 * (`제철`은 자유 문자라 축을 손으로 적지만, 이건 값이 닫혀 있어 여기서 한 번에 나온다.)
 *
 * 말은 아이 눈높이로 두되 **값이 고르게 갈리는 것**으로 고른다 — 25건이 다섯 갈래로 흩어져야
 * 필터가 필터답고, 한쪽에 몰리면 걸어도 안 걸어도 같은 목록이 나온다.
 */
export const i채소먹는곳options = [
  { label: '잎', value: '잎' },
  { label: '뿌리', value: '뿌리' },
  { label: '열매', value: '열매' },
  { label: '줄기', value: '줄기' },
  { label: '꽃', value: '꽃' }
]

export interface i채소dto extends BaseXXDto {
  label: string
  /** 필수칸. 비어 있으면 `beforeSave`가 저장을 막아 서버까지 가지 않는다. */
  season: string
  /** 어디를 먹는지(`i채소먹는곳options`). 닫힌 값이라 필터 축으로 쓴다. */
  eatPart: string
  /** 씨 뿌리고 먹기까지 며칠. 40~150이라 행마다 값이 갈린다 — 숫자 칸은 그래야 쓸모가 있다. */
  growDays: number
  /** 안 익히고 그냥 먹을 수 있나. 불리언 칸(`is체크`) 폼 경로를 여기서 시험한다. */
  rawOk: boolean
  /** 좋아요 수. 지금은 그냥 숫자 한 칸이라 누가 눌렀는지는 남지 않는다. */
  likes: number
}

export interface i채소 extends BaseXX {
  label: string
  제철: string
  먹는곳: string
  키우는날: number
  생으로먹기: boolean
  좋아요: number
}

export class model채소s extends BaseModels2<model채소, i채소dto> {
  protected etcFields = []
  static getInstance = () => getRepoInstance('model채소s', () => new model채소s())

  private constructor() {
    super(model채소, 'vegetables')
    /** 시험용 표라 전역 스위치(`NUXT_PUBLIC_API_URL`)를 안 따르고 lowDB에 남는다. */
    this.apiURL = `/api/v0/${this.tableName}`
  }

  /** 목록5 헤더가 읽는 최소 메뉴 — 이 테이블은 model메뉴 행이 없어서 직접 준다. */
  메뉴 = reactive({ label: '채소', 아이콘: 'i-lucide-carrot', is계층: false, is시스템: false })

  /**
   * 검색이 훑을 칸. 비워두면 `label`·`sub`만 본다.
   *
   * 도우미도 **같은 함수**(`행검색매칭`)로 거른다 — "화면에서 걸리는 건 도우미에서도 걸린다"가
   * 성립해야, 도우미가 센 건수와 눈앞 목록이 어긋나지 않는다.
   */
  override 검색필드s = ['label', '제철', '먹는곳']

  /**
   * 필터 축. **한 번 적으면 두 곳이 산다** — 목록5가 필터 UI를 그리고, 도우미가 어휘로 읽는다.
   * "여름채소"가 말이 되는 건 이 선언 하나 때문이다.
   *
   * `key`를 명시하는 이유: 안 주면 `f0`·`f1`로 자동 생성되는데, 그 값이 주소(`?f_제철=`)와
   * 도우미 어휘에 그대로 나간다. 코드가 바뀌면 갈리는 이름을 링크에 남길 수는 없다.
   */
  override 필터조건ss = [
    this.라디오필터그룹<model채소>(
      ['봄', '여름', '가을', '겨울'].map(철 => ({
        label: 철,
        value: (a: model채소) => a.제철.includes(철)
      })),
      { key: '제철', title: '제철' }
    ),
    // 축이 둘이면 **AND 조합**이 시험된다("여름 열매채소"). 축 하나짜리로는 안 드러나는 자리다.
    this.라디오필터그룹<model채소>(
      i채소먹는곳options.map(o => ({
        label: o.label,
        value: (a: model채소) => a.먹는곳 === o.value
      })),
      { key: '먹는곳', title: '먹는곳' }
    )
  ]

  override _generate = () => new model채소().generate()
  override _init = () => new model채소().init()
}

export class model채소 extends BaseModel2<i채소dto> implements i채소 {
  constructor(state?: i채소dto) {
    super(model채소s.getInstance(), state)
  }

  override afterCreate = () => { }
  /**
   * 필수칸 검사. 예전엔 추가 버튼이 곧장 POST해서 막을 자리가 없었지만, 지금 새 행은
   * 저장 전까지 목록 안의 초안이다 — 서버로 나가는 길목이 여기 하나뿐이라 여기서 막는다.
   */
  override beforeSave = () => {
    if (!this.label.trim()) {
      useAlert().error('저장할 수 없습니다', '이름을 입력해주세요.')
      return false
    }
    if (!this.제철.trim()) {
      useAlert().error('저장할 수 없습니다', '제철을 입력해주세요.')
      return false
    }
    return true
  }

  override afterSave = () => { }

  override 자동필드ss = [
    {
      label: '채소',
      list: [
        { key: 'label', label: '이름', show: true },
        { key: '제철', label: '제철', show: true },
        { key: '먹는곳', label: '먹는곳', type: 타입지정.선택0, options: i채소먹는곳options, show: true },
        { key: '키우는날', label: '키우는날', type: 타입지정._.숫자, show: true },
        { key: '생으로먹기', label: '생으로먹기', type: 타입지정._.is체크, show: true },
        { key: '좋아요', label: '좋아요', type: 타입지정._.숫자, show: true },
        { key: '기록줄s', label: '기록', type: 타입지정._.문자s, show: true, canEdit: false }
      ]
    }
  ]

  /** `key`가 곧 메서드명 — 폼 상단 버튼바에서 `do토스트()`을 부른다. */
  override 자동버튼s = this.기본버튼s.concat([
    { key: 'do토스트', label: 'do토스트', icon: 'i-lucide-bell', position: 'top', show: true },
    { key: 'do기록', label: '기록', icon: 'i-lucide-scroll-text', position: 'top', show: true },
    { key: 'do수정', label: '값수정', icon: 'i-lucide-pencil', position: 'top', show: true },
    { key: 'do삭제', label: '삭제', icon: 'i-lucide-trash-2', position: 'top', show: true }
  ])

  /** 이 행이 자기 이름을 말한다. 실험이 보는 건 "무엇이 눌렸나"뿐이라 이걸로 충분하다. */
  do토스트 = () => useAlert().show(this.label, '')

  /** 이 행에 쌓인 기록 (최신 날짜부터). 비어 보이면 `model기록s.getInstance().reads()`가 아직 안 돈 것이다. */
  get 기록s() { return model기록s.getInstance().listBy대상(this.repo.tableName, this.stateId) }

  /** 상세 폼에 읽기 전용으로 쌓아 보이는 줄들 — `3/5 새로 들어옴`, `3/4 상함` 순. */
  get 기록줄s() { return this.기록s.map(r => r.줄) }

  /** `감자가 상함` 같은 한 줄을 오늘 날짜로 이 행에 쌓는다. */
  do기록 = (메시지?: string) =>
    model기록s.getInstance().do기록입력(this.repo.tableName, this.stateId, this.label, 메시지)

  /**
   * 이 행을 지운다 — AI도우미의 "고구마 지워줘"가 부르는 자리이자, 폼 상단 버튼이 부르는 자리.
   *
   * 확인 창은 `delete()` 안에 있다(`hasConfirm`). 여기서 또 물으면 같은 질문이 두 번 뜬다.
   * 돌려주는 값은 **정말 지워졌는가**다 — 취소하면 `false`라서, 부르는 쪽이 뒷정리
   * (주소에서 선택 떼기 등)를 할지 말지를 이 값으로 가른다.
   */
  do삭제 = () => this.delete()

  /**
   * 값수정 폼을 연다 — AI도우미의 "사과 원산지 제주로 바꿔줘"가 부르는 자리이자,
   * 폼 상단 버튼이 부르는 자리.
   *
   * **인자를 받지 않는다.** 도우미가 채워 온 값은 `수정안두기`가 놓아둔 것을 폼이 꺼내 쓴다 —
   * 버튼의 `onClick`이 값 한 칸만 나르는데 고칠 칸은 여럿일 수 있어서다.
   * 값이 이미 다 차 있어도 폼은 뜬다. 보이지 않는 것을 누르게 하면 코파일럿이 아니라 대리 실행이다.
   */
  do수정 = () => do필드폼(this)

  override generate() {
    return this.init()
  }

  override init() {
    return {
      label: '새 채소',
      season: '',
      eatPart: '',
      growDays: 0,
      rawOk: false,
      likes: 0
    }
  }

  override get label() { return this.state?.label ?? '' }
  set label(v: string) { if (!this.state) return; this.state.label = v }

  get 제철() { return this.state?.season ?? '' }
  set 제철(v: string) { if (!this.state) return; this.state.season = String(v ?? '') }

  get 먹는곳() { return this.state?.eatPart ?? '' }
  set 먹는곳(v: string) { if (!this.state) return; this.state.eatPart = String(v ?? '') }

  /** 음수·NaN은 0으로 눌러 둔다 — 폼이 빈 칸을 보내면 `Number('')`가 0이 아니라 NaN이 된다. */
  get 키우는날() {
    const n = Number(this.state?.growDays)
    return Number.isFinite(n) ? n : 0
  }

  set 키우는날(v: number) {
    if (!this.state) return
    const n = Number(v)
    this.state.growDays = Number.isFinite(n) ? Math.max(0, Math.round(n)) : 0
  }

  get 생으로먹기() { return this.state?.rawOk === true }
  set 생으로먹기(v: boolean) { if (!this.state) return; this.state.rawOk = !!v }

  /** 음수·NaN은 0으로 눌러 둔다 — 폼이 빈 칸을 보내면 `Number('')`가 0이 아니라 NaN이 된다. */
  get 좋아요() {
    const n = Number(this.state?.likes)
    return Number.isFinite(n) ? n : 0
  }

  set 좋아요(v: number) {
    if (!this.state) return
    const n = Number(v)
    this.state.likes = Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0
  }

  /** 목록 두 번째 줄. 이름만으로는 안 갈리는 행들을 눈으로 가르는 자리다(도우미 명단도 이걸 쓴다). */
  override get sub() {
    return [this.제철, this.먹는곳, this.키우는날 ? `${this.키우는날}일` : '', this.생으로먹기 ? '생으로OK' : ''].filter(Boolean).join(' · ')
  }
}

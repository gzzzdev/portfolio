import { reactive } from 'vue'
import { BaseModels2, BaseModel2, 타입지정, getRepoInstance } from '~utils/models'
import type { BaseXX, BaseXXDto } from '~utils/models'
import { do필드폼, mDayjs } from '~utils'
import { model기록s } from './model기록'

/**
 * 어떤 갈래인지 — 폼 선택지이자 필터 축. 값이 닫혀 있어 축과 선택지가 한 배열에서 나온다.
 *
 * 갈래를 다섯으로 끊은 건 25건이 `2·6·7·5·5`로 흩어져서다 — 걸면 목록이 실제로 줄어든다.
 * 순수 식물학 분류는 아니다(수박·참외는 박과지만 장과로 묶었다). 여기서 필요한 건
 * 정확한 분류학이 아니라 **고르게 갈리는 닫힌 축**이라서다.
 */
export const i과일분류options = [
  { label: '인과', value: '인과' },
  { label: '핵과', value: '핵과' },
  { label: '장과', value: '장과' },
  { label: '감귤', value: '감귤' },
  { label: '열대', value: '열대' }
]

export interface i과일dto extends BaseXXDto {
  label: string
  /** 필수칸. 비어 있으면 `beforeSave`가 저장을 막아 서버까지 가지 않는다. */
  origin: string
  /** 어떤 갈래인지(`i과일분류options`). 닫힌 값이라 필터 축으로 쓴다. */
  kind: string
  /** 단맛 1~10. 레몬 1 · 두리안 10 처럼 끝까지 벌려 둬야 숫자 칸이 정렬에서 쓸모가 있다. */
  sweet: number
  /** 가게에 나오기 시작하는 날(`YYYY-MM-DD`). **날짜 칸은 이 표에만 있다** — 날짜 폼 경로를 여기서 시험한다. */
  openDay: string
  /** 좋아요 수. 지금은 그냥 숫자 한 칸이라 누가 눌렀는지는 남지 않는다. */
  likes: number
}

export interface i과일 extends BaseXX {
  label: string
  원산지: string
  분류: string
  단맛: number
  나오는날: ReturnType<typeof mDayjs>
  좋아요: number
}

export class model과일s extends BaseModels2<model과일, i과일dto> {
  protected etcFields = []
  static getInstance = () => getRepoInstance('model과일s', () => new model과일s())

  private constructor() {
    super(model과일, 'fruits')
    /** 시험용 표라 전역 스위치(`NUXT_PUBLIC_API_URL`)를 안 따르고 lowDB에 남는다. */
    this.apiURL = `/api/v0/${this.tableName}`
  }

  /** 목록5 헤더가 읽는 최소 메뉴 — 이 테이블은 model메뉴 행이 없어서 직접 준다. */
  메뉴 = reactive({ label: '과일', 아이콘: 'i-lucide-apple', is계층: false, is시스템: false })

  /** 검색이 훑을 칸. 도우미도 **같은 함수**(`행검색매칭`)로 거른다. */
  override 검색필드s = ['label', '원산지', '분류']

  /**
   * 필터 축. 한 번 적으면 목록5가 UI를 그리고 도우미가 어휘로 읽는다.
   *
   * 축 이름을 표마다 다르게 둔 게 요점이다(과일=`원산지`·`분류`, 동물=`기후대`·`식성`) —
   * 축 이름 하나가 소스를 말해주므로, 계획이 축을 고르면 소스도 같이 골라진다.
   */
  override 필터조건ss = [
    this.라디오필터그룹<model과일>(
      ['제주', '한국', '칠레', '필리핀', '미국', '태국'].map(곳 => ({
        label: 곳,
        value: (a: model과일) => a.원산지 === 곳
      })),
      { key: '원산지', title: '원산지' }
    ),
    this.라디오필터그룹<model과일>(
      i과일분류options.map(o => ({
        label: o.label,
        value: (a: model과일) => a.분류 === o.value
      })),
      { key: '분류', title: '분류' }
    )
  ]

  override _generate = () => new model과일().generate()
  override _init = () => new model과일().init()
}

export class model과일 extends BaseModel2<i과일dto> implements i과일 {
  constructor(state?: i과일dto) {
    super(model과일s.getInstance(), state)
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
    if (!this.원산지.trim()) {
      useAlert().error('저장할 수 없습니다', '원산지를 입력해주세요.')
      return false
    }
    return true
  }

  override afterSave = () => { }

  override 자동필드ss = [
    {
      label: '과일',
      list: [
        { key: 'label', label: '이름', show: true },
        { key: '원산지', label: '원산지', show: true },
        { key: '분류', label: '분류', type: 타입지정.선택0, options: i과일분류options, show: true },
        { key: '단맛', label: '단맛(1~10)', type: 타입지정._.숫자, show: true },
        { key: '나오는날', label: '나오는날', type: 타입지정._.날짜, show: true },
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
   * 이 행을 지운다 — AI도우미의 "사과 지워줘"가 부르는 자리이자, 폼 상단 버튼이 부르는 자리.
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
      label: '새 과일',
      origin: '',
      kind: '',
      sweet: 0,
      openDay: '',
      likes: 0
    }
  }

  override get label() { return this.state?.label ?? '' }
  set label(v: string) { if (!this.state) return; this.state.label = v }

  get 원산지() { return this.state?.origin ?? '' }
  set 원산지(v: string) { if (!this.state) return; this.state.origin = String(v ?? '') }

  get 분류() { return this.state?.kind ?? '' }
  set 분류(v: string) { if (!this.state) return; this.state.kind = String(v ?? '') }

  /** 1~10 밖은 눌러 둔다 — 폼이 빈 칸을 보내면 `Number('')`가 0이 아니라 NaN이 된다. */
  get 단맛() {
    const n = Number(this.state?.sweet)
    return Number.isFinite(n) ? n : 0
  }

  set 단맛(v: number) {
    if (!this.state) return
    const n = Number(v)
    this.state.sweet = Number.isFinite(n) ? Math.min(10, Math.max(0, Math.round(n))) : 0
  }

  /** 안 적힌 행은 **오늘로 채우지 않는다** — 빈 날짜는 "모른다"이지 "오늘"이 아니다. */
  get 나오는날() { return mDayjs(String(this.state?.openDay ?? '').trim()) }
  set 나오는날(v: ReturnType<typeof mDayjs>) {
    if (!this.state) return
    const d = mDayjs(v)
    this.state.openDay = d.isValid() ? d.format('YYYY-MM-DD') : ''
  }

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
    return [this.원산지, this.분류, this.단맛 ? `단맛${this.단맛}` : ''].filter(Boolean).join(' · ')
  }
}

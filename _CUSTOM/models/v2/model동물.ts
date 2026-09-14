import { reactive } from 'vue'
import { BaseModels2, BaseModel2, 타입지정, getRepoInstance } from '~utils/models'
import type { BaseXX, BaseXXDto } from '~utils/models'
import { do필드폼 } from '~utils'
import { model기록s } from './model기록'

/**
 * 무엇을 먹는지 — 폼 선택지이자 필터 축. 값이 닫혀 있어 축과 선택지가 한 배열에서 나온다.
 *
 * `포유류·조류·어류·파충류`를 안 쓴 이유는 어려워서만이 아니다 — 25건 중 포유류가 20건이라
 * 그 축은 걸어도 목록이 거의 안 줄어든다. 식성은 셋으로 고르게(7·9·9) 갈린다.
 */
export const i동물식성options = [
  { label: '육식', value: '육식' },
  { label: '초식', value: '초식' },
  { label: '잡식', value: '잡식' }
]

/**
 * 기후대 — **자유 문자**다. 여기 적힌 배열은 필터 축이 걸 값일 뿐, 폼은 선택기로 닫지 않는다.
 * (닫힌 칸은 `식성` 하나로 충분하고, 이 표에는 "필수인 자유 문자" 경로도 하나 있어야 한다.)
 *
 * 갈래를 다섯으로 둔 건 25건이 `9·6·5·3·2`로 흩어져서다 — 걸면 목록이 실제로 줄어든다.
 */
export const i동물기후대s = ['온대', '열대', '도시', '한대', '건조']

export interface i동물dto extends BaseXXDto {
  label: string
  /** 필수칸. 비어 있으면 `beforeSave`가 저장을 막아 서버까지 가지 않는다. */
  climate: string
  /** 무엇을 먹는지(`i동물식성options`). 닫힌 값이라 필터 축으로 쓴다. */
  diet: string
  /** 몸무게(kg). 햄스터 0.1 ~ 고래 30000 — 이만큼 벌어져야 숫자 칸이 정렬에서 쓸모가 있다. */
  weight: number
  /** 밤에 돌아다니나. 불리언 칸(`is체크`) 경로를 여기서 시험한다. */
  nightAwake: boolean
  /** 좋아요 수. 지금은 그냥 숫자 한 칸이라 누가 눌렀는지는 남지 않는다. */
  likes: number
}

export interface i동물 extends BaseXX {
  label: string
  기후대: string
  식성: string
  몸무게: number
  밤에활동: boolean
  좋아요: number
}

export class model동물s extends BaseModels2<model동물, i동물dto> {
  protected etcFields = []
  static getInstance = () => getRepoInstance('model동물s', () => new model동물s())

  private constructor() {
    super(model동물, 'animals')
    /** 시험용 표라 전역 스위치(`NUXT_PUBLIC_API_URL`)를 안 따르고 lowDB에 남는다. */
    this.apiURL = `/api/v0/${this.tableName}`
  }

  /** 목록5 헤더가 읽는 최소 메뉴 — 이 테이블은 model메뉴 행이 없어서 직접 준다. */
  메뉴 = reactive({ label: '동물', 아이콘: 'i-lucide-cat', is계층: false, is시스템: false })

  /** 검색이 훑을 칸. 도우미도 **같은 함수**(`행검색매칭`)로 거른다. */
  override 검색필드s = ['label', '기후대', '식성']

  /** 필터 축. 축 이름(`기후대`·`식성`)이 이 표에만 있어서, 축을 고르면 소스도 같이 골라진다. */
  override 필터조건ss = [
    this.라디오필터그룹<model동물>(
      i동물기후대s.map(대 => ({
        label: 대,
        value: (a: model동물) => a.기후대 === 대
      })),
      { key: '기후대', title: '기후대' }
    ),
    this.라디오필터그룹<model동물>(
      i동물식성options.map(o => ({
        label: o.label,
        value: (a: model동물) => a.식성 === o.value
      })),
      { key: '식성', title: '식성' }
    )
  ]

  override _generate = () => new model동물().generate()
  override _init = () => new model동물().init()
}

export class model동물 extends BaseModel2<i동물dto> implements i동물 {
  constructor(state?: i동물dto) {
    super(model동물s.getInstance(), state)
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
    if (!this.기후대.trim()) {
      useAlert().error('저장할 수 없습니다', '기후대를 입력해주세요.')
      return false
    }
    return true
  }

  override afterSave = () => { }

  override 자동필드ss = [
    {
      label: '동물',
      list: [
        { key: 'label', label: '이름', show: true },
        { key: '기후대', label: '기후대', show: true },
        { key: '식성', label: '식성', type: 타입지정.선택0, options: i동물식성options, show: true },
        { key: '몸무게', label: '몸무게(kg)', type: 타입지정._.숫자, show: true },
        { key: '밤에활동', label: '밤에활동', type: 타입지정._.is체크, show: true },
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
   * 이 행을 지운다 — AI도우미의 "강아지 지워줘"가 부르는 자리이자, 폼 상단 버튼이 부르는 자리.
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
      label: '새 동물',
      climate: '',
      diet: '',
      weight: 0,
      nightAwake: false,
      likes: 0
    }
  }

  override get label() { return this.state?.label ?? '' }
  set label(v: string) { if (!this.state) return; this.state.label = v }

  get 기후대() { return this.state?.climate ?? '' }
  set 기후대(v: string) { if (!this.state) return; this.state.climate = String(v ?? '') }

  get 식성() { return this.state?.diet ?? '' }
  set 식성(v: string) { if (!this.state) return; this.state.diet = String(v ?? '') }

  /**
   * 음수·NaN은 0으로 눌러 둔다 — 폼이 빈 칸을 보내면 `Number('')`가 0이 아니라 NaN이 된다.
   * 반올림은 **소수 한 자리까지** 남긴다 — 햄스터 0.1kg 을 정수로 눌러 0으로 만들면 안 된다.
   */
  get 몸무게() {
    const n = Number(this.state?.weight)
    return Number.isFinite(n) ? n : 0
  }

  set 몸무게(v: number) {
    if (!this.state) return
    const n = Number(v)
    this.state.weight = Number.isFinite(n) ? Math.max(0, Math.round(n * 10) / 10) : 0
  }

  get 밤에활동() { return this.state?.nightAwake === true }
  set 밤에활동(v: boolean) { if (!this.state) return; this.state.nightAwake = !!v }

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
    return [this.기후대, this.식성, this.몸무게 ? `${this.몸무게}kg` : '', this.밤에활동 ? '밤에활동' : ''].filter(Boolean).join(' · ')
  }
}

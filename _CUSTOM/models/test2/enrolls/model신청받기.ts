import { computed, toValue } from 'vue'
import { BaseModels2, BaseModel2, 타입지정, getRepoInstance, pkOf } from '~utils/models'
import type { BaseXX, BaseXXDto, i요약타일 } from '~utils/models'
import { mDayjs, randomN, randomPeriod, toCompactDates, type i기간 } from '~utils'
import { model메뉴s } from '../_basics/model메뉴'
import { model신청s, type model신청 } from './model신청'
import {
  보이는대상이름표s,
  i신청받기대상FK열,
  i신청받기상태options,
  i신청받기요금구분options,
  is문답물대상,
  type i신청받기대상,
  type i신청받기FK열,
  type i신청받기상태,
  type i신청받기요금구분,
  type i문항
} from './types'
import { 문항검사, 문항복사, 문항정규화, 새문항 } from './문항'
import type { model회원 } from '../_basics'
// 스토어가 `~models/test2` 배럴을 마주 import 하지만, 쓰는 자리가 전부 함수 안(`is내신청`)이라
// 모듈 평가 시점에는 서로를 안 건드린다. `payments/model결제.ts`가 같은 방식이다.
import { useMyAuthStore } from '~/stores/useMyAuthStore'

/**
 * 신청받기 대상 하나를 푸는 방법. `_대상레지스트리.ts`가 대상 종류마다 하나씩 채운다.
 *
 * repo 자체가 아니라 **필요한 동작만** 받는다 — 콘텐츠 모델들의 타입을 여기로 끌어오면
 * `model신청받기 → 콘텐츠 → model신청받기` 순환이 생기고, `extends`가 그 위에 얹히면 TDZ로 터진다.
 */
export interface i신청받기대상해석 {
  label: string
  icon: string
  getById: (id: string) => i신청받기대상카드 | undefined
}

/**
 * 신청받기 카드 한 장이 대상에게서 가져다 쓰는 것 전부.
 *
 * 콘텐츠 모델 타입을 그대로 쓰면 `model신청받기 → 콘텐츠 → model신청받기` 순환이 되므로 **구조로만** 받는다.
 * 다섯 콘텐츠가 전부 `model콘텐츠물`을 상속해서 이 모양을 이미 만족한다 —
 * 새 대상 종류를 넣을 때 이 항목들을 못 채우면 `_대상레지스트리.ts`가 컴파일로 막는다.
 */
export interface i신청받기대상카드 {
  label: string
  icon: string
  stateId: string | number | null
  /** 한 줄 요약. 목록 카드가 읽는다. */
  설명: string
  /** 본문(md). 상세 화면이 `<MDC>` 로 그린다. 목록 카드는 이걸 안 본다. */
  본문: string
  이미지: string | null
  /**
     * **모임물(행사·수업)만 갖는다.** 그래서 옵셔널이다 — 문답물(설문·퀴즈·투표)에는 열릴 자리가 없다.
     * 신청기간과 **행사가 실제로 열리는 날**은 다른 값이라 여기 뚫는다.
     */
  장소?: string
  기간?: i기간
}

let 대상해석s: Record<i신청받기대상, i신청받기대상해석> | null = null

/** 대상 해석 표를 꽂는다. `_대상레지스트리.ts`가 모듈 로드 시 딱 한 번 부른다. */
export const do대상레지스트리등록 = (map: Record<i신청받기대상, i신청받기대상해석>) => {
  대상해석s = map
}

/**
 * 신청받기 씨앗은 **선언형 seed가 될 수 없다** — 1회차는 콘텐츠가 생길 때 DB 트리거가 만들고,
 * 씨앗은 그 행을 찾아 UPDATE 로 채운다(`seed.ts`). 그 생성기를 여기 꽂는다.
 */
let 씨앗생성기: ((opts?: { skipConfirm?: boolean }) => Promise<model신청받기[]>) | null = null
export const do신청받기씨앗생성기등록 = (fn: (opts?: { skipConfirm?: boolean }) => Promise<model신청받기[]>) => {
  씨앗생성기 = fn
}
export const get신청받기씨앗생성기 = () => 씨앗생성기

/** 대상 종류 하나를 푼다. 레지스트리가 안 실렸으면 조용히 `undefined`가 아니라 큰 소리로 알린다. */
const get대상해석 = (표: i신청받기대상): i신청받기대상해석 | null => {
  if (!대상해석s) {
    console.error('[model신청받기] 대상 레지스트리가 비어 있습니다 — `~models/test2/enrolls`를 import 했는지 확인하세요.')
    return null
  }
  return 대상해석s[표] ?? null
}

/**
 * 신청받기(= 회차) 한 건. 표는 `enrollables`.
 *
 * **콘텐츠 FK 다섯 중 정확히 하나만 채운다**(DB check). `ownerTable`·`ownerId`는 DB가 그 다섯에서
 * 계산하는 열이라 **읽기만** 한다(`etcFields`) — 실어 보내면 PostgREST가 거절한다.
 *
 * 1회차는 콘텐츠 INSERT 시 트리거가 만든다. 클라이언트는 만들지 않는다. 추가 회차는 `do회차추가`.
 * 문항은 표가 아니라 이 행의 `questions` jsonb 다 — 회차마다 기간·정원·요금·문항을 따로 갖는다.
 */
export interface i신청받기dto extends BaseXXDto {
  surveyId: string | null
  quizId: string | null
  pollId: string | null
  classId: string | null
  occasionId: string | null
  /** DB 계산 열. 서버로 안 나간다. */
  ownerTable?: i신청받기대상 | null
  ownerId?: string | null
  round: number
  applicationStartDate: Date
  applicationEndDate: Date
  usageStartDate: Date
  usageEndDate: Date
  priceType: i신청받기요금구분
  price: number
  /** 0 = 정원 없음. */
  maxParticipants: number
  status: i신청받기상태
  questions: i문항[]
  allowGuest: boolean
}

export interface i신청받기 extends BaseXX {
  대상표: i신청받기대상
  대상id: string
  회차: number
  신청기간: i기간
  사용기간: i기간
  요금구분: i신청받기요금구분
  결제금액: number
  정원: number
  공개: i신청받기상태
  문항s: i문항[]
  is비회원허용: boolean
  신청s: model신청[]
}

export class model신청받기s extends BaseModels2<model신청받기, i신청받기dto> {
  /** DB가 계산하는 열. `toApiPayload`가 뺀다. */
  protected etcFields = ['ownerTable', 'ownerId']

  /**
     * 종류 축. 옵션은 **손으로 안 적는다** — `i신청받기대상이름표s` 가 정본이라 대상이 하나 늘면
     * 여기 칸도 같이 는다(`_대상레지스트리`가 컴파일로 막는 그 표와 같은 자리에서 나온다).
     */
  readonly 종류필터그룹 = this.라디오필터그룹<model신청받기>(
    [
      { label: '전체', value: '전체', match: () => true },
      ...보이는대상이름표s.map(이름표 => ({
        label: 이름표.label,
        value: 이름표.value,
        icon: 이름표.icon,
        match: (row: model신청받기) => row.대상표 === 이름표.value
      }))
    ],
    { key: 'recruit-kind', title: '종류', initialValues: '전체' }
  )

  readonly 공개필터그룹 = this.라디오필터그룹<model신청받기>(
    [
      { label: '전체', value: '전체', match: () => true },
      { label: '신청받는 중', value: '신청받는 중', match: (row: model신청받기) => row.is신청받는중 },
      { label: '마감', value: '마감', match: (row: model신청받기) => !row.is신청받는중 }
    ],
    { key: 'recruit-open', title: '신청받기', initialValues: '전체' }
  )

  readonly 요금필터그룹 = this.라디오필터그룹<model신청받기>(
    [
      { label: '전체', value: '전체', match: () => true },
      { label: '무료', value: '무료', match: (row: model신청받기) => row.is무료 },
      { label: '유료', value: '유료', match: (row: model신청받기) => !row.is무료 }
    ],
    { key: 'recruit-fee', title: '요금', initialValues: '전체' }
  )

  /**
     * **보는 사람에 따라 답이 갈리는 유일한 축.** 그래도 모델에 두는 이유는, 화면이 손으로 들면
     * 도우미가 그 축을 못 읽어서 "내가 신청한 것만"이 말이 안 되기 때문이다.
     * 로그인 안 했으면 늘 빈 결과라, **화면이 이 축을 안 그리는 것으로 처리한다**(`/official/enrolls`).
     */
  readonly 내신청필터그룹 = this.라디오필터그룹<model신청받기>(
    [
      { label: '전체', value: '전체', match: () => true },
      { label: '신청함', value: '신청함', match: (row: model신청받기) => row.is내신청 },
      { label: '아직', value: '아직', match: (row: model신청받기) => !row.is내신청 }
    ],
    { key: 'recruit-mine', title: '내신청', initialValues: '전체' }
  )

  override 필터조건ss = [this.종류필터그룹, this.공개필터그룹, this.요금필터그룹, this.내신청필터그룹]

  /**
     * 정렬 축. 첫 줄이 기본값이다(`목록5`·주소 동기화가 그렇게 본다).
     * `마감임박`이 기본인 이유 — 이 목록에서 사람이 놓치면 손해를 보는 건 **닫히는 것**이다.
     */
  override 정렬조건s = [
    {
      label: '마감임박', value: '마감임박',
      func: (a: model신청받기, b: model신청받기) => (a.is신청받는중 !== b.is신청받는중)
        ? (a.is신청받는중 ? -1 : 1)
        : a.신청기간[1].valueOf() - b.신청기간[1].valueOf()
    },
    { label: '최신', value: '최신', func: (a: model신청받기, b: model신청받기) => Number(b.stateId ?? 0) - Number(a.stateId ?? 0) },
    { label: '이름↑', value: '이름↑', func: (a: model신청받기, b: model신청받기) => a.대상명.localeCompare(b.대상명) }
  ]

  /** 검색이 훑을 칸. 도우미도 **같은 함수**(`행검색매칭`)로 거른다. 선언 순서가 곧 가중치다. */
  override 검색필드s = ['대상명', '대상요약']

  static getInstance = () => getRepoInstance('model신청받기s', () => new model신청받기s())

  private constructor() {
    super(model신청받기, 'enrollables', { hasConfirm: false })
  }

  get 메뉴() { return model메뉴s.getInstance().getBy테이블명(this.tableName) }

  override _generate = () => new model신청받기().generate()
  override _init = () => new model신청받기().init()

  /**
     * 한 콘텐츠에 달린 회차들, **회차 오름차순**. 콘텐츠 모델의 `신청받기s`가 전부 이 한 곳을 지난다.
     * `표`까지 같이 비교하는 게 중요하다 — 테이블이 다르면 PK가 겹쳐서, id만 보면 설문 3번의 회차가 행사 3번에 붙어 보인다.
     */
  getsBy대상 = (표: i신청받기대상, 대상id: string | number | null | undefined): model신청받기[] => {
    const id = String(대상id ?? '').trim()
    if (!id) return []
    return toValue(this.list)
      .filter(row => row.대상표 === 표 && row.대상id === id)
      .sort((a, b) => a.회차 - b.회차 || Number(a.stateId ?? 0) - Number(b.stateId ?? 0))
  }

  /** 지금 회차 = 가장 최근 회차. 목록·상태·「신청받기」 구역이 보는 그 하나. */
  get현재회차By대상 = (표: i신청받기대상, 대상id: string | number | null | undefined): model신청받기 | null =>
    this.getsBy대상(표, 대상id).at(-1) ?? null

  /**
     * "초기값설정" 버튼의 자리. 1회차는 트리거가 이미 만들었으므로 씨앗은 그 행을 **채우는** 생성기다
     * (`do신청받기씨앗생성기등록` 주석 참고). 생성기가 없으면 기본 동작(= seed 없음 안내)으로 떨어진다.
     */
  override async do초기데이터(opts?: { skipConfirm?: boolean, ensureRead?: boolean }) {
    if (씨앗생성기) return 씨앗생성기({ skipConfirm: opts?.skipConfirm ?? true })
    return super.do초기데이터(opts)
  }

  /**
     * 콘텐츠에 회차를 하나 더 연다(추가 회차). 콘텐츠가 저장돼 있어야 FK를 채울 수 있다.
     * 문항은 직전 회차에서 **id 째** 복사한다 — 답이 id로 묶이므로 회차별 집계가 이어진다.
     */
  do회차추가 = async (표: i신청받기대상, 대상: { stateId: string | number | null, label: string }) => {
    const pk = pkOf(대상)
    if (pk == null) {
      useAlert().show('저장 필요', `${대상.label}을(를) 먼저 저장한 뒤 회차를 열 수 있습니다.`)
      return
    }
    const 형제s = this.getsBy대상(표, pk)
    const 직전 = 형제s.at(-1) ?? null
    const 초안 = new model신청받기().init()
    초안[i신청받기대상FK열[표]] = String(pk)
    초안.round = (직전?.회차 ?? 0) + 1
    초안.questions = 직전 ? 문항복사(직전.문항s) : []
    if (직전) {
      초안.priceType = 직전.요금구분
      초안.price = 직전.결제금액
      초안.maxParticipants = 직전.정원
    }
    return this.create(초안)
  }
}

export class model신청받기 extends BaseModel2<i신청받기dto> implements i신청받기 {
  constructor(state?: i신청받기dto) {
    super(model신청받기s.getInstance(), state)
  }

  override afterCreate = () => { }
  override afterSave = () => { }
  override beforeSave = () => {
    if (!this.대상id) {
      useAlert().error('저장할 수 없습니다', '이 회차가 붙을 콘텐츠가 없습니다.')
      return false
    }
    if (this.신청기간[1].isBefore(this.신청기간[0])) {
      useAlert().error('저장할 수 없습니다', '신청 종료일이 시작일보다 빠릅니다.')
      return false
    }
    if (this.사용기간[1].isBefore(this.사용기간[0])) {
      useAlert().error('저장할 수 없습니다', '사용 종료일이 시작일보다 빠릅니다.')
      return false
    }
    if (this.요금구분 === 'PAID' && this.결제금액 < 1000) {
      useAlert().error('저장할 수 없습니다', '결제금액은 1000원 이상이어야 합니다.')
      return false
    }
    // 문항이 값이라 행마다 `beforeSave`가 없다 — 여기서 전부 훑는다. 정답이 선택지 밖이면 채점이 조용히 전부 오답이 된다.
    for (const 문항 of this.문항s) {
      const 이유 = 문항검사(문항)
      if (이유) {
        useAlert().error('문항을 저장할 수 없습니다', 이유)
        return false
      }
    }
    return true
  }

  override 자동필드ss = [
    {
      label: '설정',
      list: [
        { key: '회차', label: '회차', type: 타입지정._.숫자2, props: { min: 1, max: 99, step: 1, suffix: '차' }, canEdit: false, show: true },
        { key: '신청기간', label: '신청기간', type: 타입지정._.기간, show: true, 달력: { label: '신청기간', color: '#ec4899' } },
        { key: '사용기간', label: '사용기간', type: 타입지정._.기간, show: true, 달력: { label: '사용기간', color: '#6366f1' } },
        { key: '정원', label: '정원', type: 타입지정._.숫자2, props: { min: 0, max: 5000, step: 5, suffix: '(명, 0=제한 없음)' }, show: true },
        { key: '공개', label: '공개', type: 타입지정.선택0, options: i신청받기상태options, show: true },
        { key: 'is비회원허용', label: '비회원 신청', type: 타입지정._.is체크, show: true },
        { key: '요금구분', label: '요금구분', type: 타입지정.선택0, options: i신청받기요금구분options, show: true },
        {
          key: '결제금액',
          label: '결제금액',
          type: 타입지정._.숫자2,
          props: { min: 1000, max: 1000000, step: 1000, suffix: '(원)' },
          show: computed(() => this.요금구분 === 'PAID')
        }
      ]
    },
    {
      label: '질문',
      config: { ratio: 55 },
      list: [
        {
          key: '문항s',
          label: '질문',
          type: 타입지정._.문항s,
          is한줄: false,
          폭: '전체' as const,
          show: true
        }
      ]
    },
    {
      label: '신청 현황',
      config: { ratio: 45 },
      list: [
        {
          key: '신청s',
          label: '신청',
          type: 타입지정._.카드s,
          is한줄: false,
          폭: '전체' as const,
          show: true,
          props: { do빈생성: () => this.do신청() }
        }
      ]
    }
  ]

  override generate() {
    const 신청 = randomPeriod(new Date(2026, 0, 1), new Date(2027, 0, 1), { 최소일: 14, 최대일: 45 })
    const 사용 = randomPeriod(신청[1], new Date(2027, 6, 1), { 최소일: 30, 최대일: 180 })
    const 금액 = randomN(0, 9) * 10000
    return {
      ...this.init(),
      applicationStartDate: 신청[0],
      applicationEndDate: 신청[1],
      usageStartDate: 사용[0],
      usageEndDate: 사용[1],
      priceType: (금액 > 0 ? 'PAID' : 'FREE') as i신청받기요금구분,
      price: 금액,
      maxParticipants: randomN(20, 30)
    }
  }

  override init(): Omit<i신청받기dto, 'id'> {
    const 시작 = mDayjs().startOf('day')
    return {
      surveyId: null,
      quizId: null,
      pollId: null,
      classId: null,
      occasionId: null,
      round: 1,
      applicationStartDate: 시작.toDate(),
      applicationEndDate: 시작.add(30, 'day').toDate(),
      usageStartDate: 시작.toDate(),
      usageEndDate: 시작.add(90, 'day').toDate(),
      priceType: 'FREE' as i신청받기요금구분,
      price: 0,
      maxParticipants: 0,
      status: 'PREPARING' as i신청받기상태,
      questions: [],
      allowGuest: false
    }
  }

  override get label() {
    const 대상라벨 = this.대상?.label ?? get대상해석(this.대상표)?.label ?? '신청받기'
    return this.is회차표시 ? `${대상라벨} ${this.회차}차` : 대상라벨
  }

  override get sub() { return toCompactDates(this.신청기간[0], this.신청기간[1]) }

  /** 검색·정렬이 읽는 평평한 칸 둘. `행값`이 `a.b` 를 못 따라가서 여기서 한 번 펴 준다. */
  get 대상명() { return this.대상?.label ?? '' }
  get 대상요약() { return this.대상?.설명 ?? '' }

  /**
     * 지금 보고 있는 사람이 이 회차에 신청했나. **행이 아니라 보는 사람에 따라 갈리는 값**이다.
     * 세션이 없는 방문자에게는 늘 `false`. 비회원으로 신청한 사람은 익명 세션의 `회원Id` 가 있어 답이 나온다.
     */
  get is내신청() {
    const 회원id = String(useMyAuthStore().회원Id ?? '').trim()
    if (!회원id) return false
    return this.신청s.some(신청 => 신청.회원id === 회원id && 신청.상태 !== 'CANCELED')
  }

  override get icon() { return get대상해석(this.대상표)?.icon ?? 'i-ph-megaphone-light' }

  _badges = computed(() => {
    const badges: { label: string, color?: string }[] = []
    badges.push({ label: this.is신청받는중 ? '신청받는 중' : '마감', color: this.is신청받는중 ? 'success' : 'neutral' })
    if (this.is회차표시) badges.push({ label: `${this.회차}차` })
    if (!this.is무료) badges.push({ label: `${this.결제금액.toLocaleString()}원` })
    badges.push({
      label: this.정원 > 0 ? `${this.신청수}/${this.정원}` : `${this.신청수}명`,
      color: this.is정원초과 ? 'error' : 'neutral'
    })
    return badges
  })

  override get badges() { return toValue(this._badges) }

  /** 마감까지 남은 날. 닫힌 신청받기는 `null` — 배지도 타일도 이 하나를 보고 갈린다. */
  get 남은날(): number | null {
    if (!this.is신청받는중) return null
    return this.신청기간[1].startOf('day').diff(mDayjs().startOf('day'), 'day')
  }

  /** 남은 자리. 정원이 없으면 `null` — 0과 '제한 없음'은 다른 말이라 섞으면 안 된다. */
  get 남은자리(): number | null {
    return this.정원 > 0 ? Math.max(0, this.정원 - this.신청수) : null
  }

  /**
     * 머리글 아래 요약 타일 (`model회원`과 같은 규약 — `상세5.vue`·`/official/enrolls/[id]`가 같이 그린다).
     * 이 화면에서 사람이 결정하는 건 하나다 — 신청할까 말까. 그 판단에 드는 값이 넷이다:
     * 언제까지 · 자리 있나 · 언제 하나 · 얼마. 색은 **손써야 하는 칸에만** 준다.
     */
  _요약s = computed((): i요약타일[] => {
    const 남은 = this.남은날
    const 자리 = this.남은자리
    const 기간 = this.대상?.기간

    return [
      {
        label: '마감',
        icon: 'i-ph-hourglass-light',
        ...(남은 === null
          ? { value: this.is정원초과 ? '정원 마감' : '기간 마감', color: undefined }
          : 남은 <= 0
            ? { value: '오늘', color: 'error' as const }
            : { value: `D-${남은}`, color: 남은 <= 3 ? ('warning' as const) : undefined }),
        sub: toCompactDates(this.신청기간[0], this.신청기간[1])
      },
      {
        label: '남은 자리',
        icon: 'i-ph-users-light',
        value: 자리 === null ? '제한 없음' : 자리 ? `${자리}자리` : '마감',
        color: 자리 === 0 ? ('error' as const) : 자리 !== null && 자리 <= 3 ? ('warning' as const) : undefined,
        sub: this.정원 > 0 ? `신청 ${this.신청수} / ${this.정원}명` : `신청 ${this.신청수}명`
      },
      {
        label: 기간 ? '일시' : '이용',
        icon: 'i-ph-calendar-blank-light',
        value: 기간 ? toCompactDates(기간[0], 기간[1]) : toCompactDates(this.사용기간[0], this.사용기간[1]),
        sub: this.대상?.장소 || undefined
      },
      {
        label: '요금',
        icon: 'i-ph-tag-light',
        value: this.is무료 ? '무료' : `${this.결제금액.toLocaleString('ko-KR')}원`,
        sub: this.is무료 ? undefined : i신청받기요금구분options.find(x => x.value === this.요금구분)?.label
      }
    ]
  })

  override get 요약s() { return toValue(this._요약s) }

  // ── 대상(콘텐츠) ────────────────────────────────────────────────────────────

  /** 채워진 FK 열. 다섯 중 하나뿐이다(DB check). 저장 전 행은 `do회차추가`가 채운다. */
  private get 채워진FK(): i신청받기FK열 | null {
    for (const 열 of Object.values(i신청받기대상FK열))
      if (String(this.state?.[열] ?? '').trim()) return 열
    return null
  }

  /**
     * 대상 테이블명. FK 다섯 중 채워진 것으로 **클라가 직접** 정한다 — 서버가 준 `ownerTable`은
     * 저장 전 행에는 없어서 그것만 보면 초안이 대상을 잃는다. 둘이 어긋날 일은 없다(같은 규칙).
     */
  get 대상표(): i신청받기대상 {
    const 열 = this.채워진FK
    if (열) return (Object.entries(i신청받기대상FK열).find(([, v]) => v === 열)?.[0] ?? 'surveys') as i신청받기대상
    return (this.state?.ownerTable ?? 'surveys') as i신청받기대상
  }

  get 대상id(): string {
    const 열 = this.채워진FK
    return String((열 ? this.state?.[열] : this.state?.ownerId) ?? '').trim()
  }

  /** 대상을 바꾼다. 다른 FK는 비운다 — 둘 이상 차면 DB가 거절한다. */
  set대상(표: i신청받기대상, 대상id: string | number) {
    for (const 열 of Object.values(i신청받기대상FK열)) this.state[열] = null
    this.state[i신청받기대상FK열[표]] = String(대상id)
  }

  /** 신청받기가 걸린 콘텐츠. **`대상표` 하나로 곧장 결정된다** — 테이블을 훑는 fallback이 없다. */
  _대상 = computed(() => {
    const id = this.대상id
    if (!id) return null
    return get대상해석(this.대상표)?.getById(id) ?? null
  })

  get 대상() { return toValue(this._대상) }

  /** 문항으로 답을 받는 종류인가(설문·퀴즈·투표). 답을 내면 신청이 「제출」이 된다. */
  get is문답물() { return is문답물대상(this.대상표) }

  // ── 회차 ────────────────────────────────────────────────────────────────────

  get 회차() {
    const n = Number(this.state?.round ?? 1)
    return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1
  }

  set 회차(v: number) {
    const n = Number(v)
    this.state.round = Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1
  }

  _형제s = computed(() => model신청받기s.getInstance().getsBy대상(this.대상표, this.대상id))
  /** 같은 콘텐츠의 회차 전부(자기 포함), 회차 오름차순. */
  get 형제s() { return toValue(this._형제s) }

  /** 이 회차가 그 콘텐츠의 **지금 회차**(가장 최근)인가. 목록은 이것만 세운다. */
  get is현재회차() {
    const 마지막 = this.형제s.at(-1)
    return !마지막 || 마지막.rowKey === this.rowKey
  }

  /** 회차라는 말은 둘 이상일 때만 보인다(와이어프레임 원칙 3). */
  get is회차표시() { return this.형제s.length > 1 || this.회차 > 1 }

  // ── 값 ──────────────────────────────────────────────────────────────────────

  get 신청기간() {
    return [mDayjs(this.state?.applicationStartDate), mDayjs(this.state?.applicationEndDate)] as i기간
  }

  set 신청기간(v: i기간) {
    this.state.applicationStartDate = v[0].toDate()
    this.state.applicationEndDate = (v[1] ?? v[0]).toDate()
  }

  get 사용기간() {
    return [mDayjs(this.state?.usageStartDate), mDayjs(this.state?.usageEndDate)] as i기간
  }

  set 사용기간(v: i기간) {
    this.state.usageStartDate = v[0].toDate()
    this.state.usageEndDate = (v[1] ?? v[0]).toDate()
  }

  get 요금구분() { return (this.state?.priceType ?? 'FREE') as i신청받기요금구분 }
  set 요금구분(v: i신청받기요금구분) {
    this.state.priceType = v
    if (v === 'FREE') this.state.price = 0
  }

  get 결제금액() {
    const n = Number(this.state?.price ?? 0)
    return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0
  }

  set 결제금액(v: number) {
    const n = Number(v)
    this.state.price = Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0
  }

  get is무료() { return this.요금구분 === 'FREE' || this.결제금액 <= 0 }

  get 정원() {
    const n = Number(this.state?.maxParticipants ?? 0)
    return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0
  }

  set 정원(v: number) {
    const n = Number(v)
    this.state.maxParticipants = Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0
  }

  get 공개() { return (this.state?.status ?? 'PREPARING') as i신청받기상태 }
  set 공개(v: i신청받기상태) { this.state.status = v }
  get is공개() { return this.공개 === 'PUBLISHED' }

  get is비회원허용() { return this.state?.allowGuest === true }
  set is비회원허용(v: boolean) { this.state.allowGuest = !!v }

  // ── 문항 (jsonb) ────────────────────────────────────────────────────────────

  /**
     * 문항 배열. **state 를 그대로 돌려준다** — `Input문항s`가 v-model 로 받아 제자리에서 고치므로
     * 복사본을 주면 편집이 안 남는다. jsonb 에서 온 값은 `문항정규화`로 한 번 정리해 둔다.
     */
  get 문항s(): i문항[] {
    const raw = this.state?.questions
    if (!Array.isArray(raw)) {
      this.state.questions = 문항정규화(raw)
    }
    return this.state.questions
  }

  set 문항s(v: i문항[]) { this.state.questions = 문항정규화(v) }

  /** 빈 문항 하나를 끝에 붙인다. 화면(`Input문항s`)의 「질문 추가」와 `model문답물.do문항추가`가 쓴다. */
  do문항추가 = (덮어쓰기: Partial<i문항> = {}) => {
    const 문항 = 새문항(덮어쓰기)
    this.문항s.push(문항)
    return 문항
  }

  get 채점문항s() { return this.문항s.filter(q => (q.answerKey?.length ?? 0) > 0) }

  // ── 신청 ────────────────────────────────────────────────────────────────────

  _신청s = computed(() => model신청s.getInstance().getsBy신청받기(this.stateId))
  get 신청s() { return toValue(this._신청s) }
  /** 자리를 먹는 신청(대기·승인). 정원 계산의 유일한 기준이다 — `types.자리차지상태s`. */
  get 유효신청s() { return this.신청s.filter(row => row.is자리차지) }
  get 신청수() { return this.유효신청s.length }
  /** 접수된 것 전부(취소만 뺀다). 관리자 화면의 「신청 12건」은 이 수다. */
  get 접수수() { return this.신청s.filter(row => row.상태 !== 'CANCELED').length }
  /** 답을 낸 수. 문답물(설문·퀴즈·투표)의 「응답 41」. */
  get 응답수() { return this.신청s.filter(row => row.is제출됨).length }
  get is정원초과() { return this.정원 > 0 && this.신청수 >= this.정원 }

  _is기간내 = computed(() => {
    const now = mDayjs()
    return !now.isBefore(this.신청기간[0], 'day') && !now.isAfter(this.신청기간[1], 'day')
  })

  get is기간내() { return toValue(this._is기간내) }

  /** 지금 신청을 받을 수 있나. 공개·기간·정원 셋을 한 자리에서 본다. */
  get is신청받는중() { return this.is공개 && this.is기간내 && !this.is정원초과 }

  /** 신청이 막힌 이유. 버튼 비활성 툴팁과 `do신청`의 안내가 같은 문장을 쓰게 한다. */
  get 신청불가사유(): string | null {
    if (!this.is공개) return '아직 공개되지 않은 신청받기입니다.'
    if (!this.is기간내) return '신청 기간이 아닙니다.'
    if (this.is정원초과) return '정원이 찼습니다.'
    return null
  }

  do신청 = (회원?: model회원 | null) => model신청s.getInstance().do신청(this, 회원)

  // ── 열기·마감 ────────────────────────────────────────────────────────────────

  /**
     * **신청을 연다.** 1회차는 트리거가 「준비중」으로 이미 만들어 두므로 행을 더하지 않고 상태만 바꾼다.
     * `is신청받는중`의 세 조건 중 사람이 버튼 하나로 풀 수 있는 둘(공개·기간)을 여기서 푼다 —
     * 오늘이 기간 밖이면 시작을 오늘로 당기고, 마감이 지났으면 30일(`init`과 같은 폭)을 새로 잡는다.
     * 정원은 풀지 않는다. 자리를 늘리는 건 사람이 정할 일이다.
     */
  do신청열기 = async () => {
    if (this.is신청받는중) return true
    if (this.is정원초과) {
      useAlert().show('열 수 없습니다', '정원이 찼습니다. 정원을 늘린 뒤 여세요.')
      return false
    }
    const 오늘 = mDayjs().startOf('day')
    const [시작, 끝] = this.신청기간
    const 새끝 = 끝.isBefore(오늘, 'day') ? 오늘.add(30, 'day') : 끝
    const 새시작 = 시작.isAfter(오늘, 'day') || 끝.isBefore(오늘, 'day') ? 오늘 : 시작
    this.신청기간 = [새시작, 새끝] as i기간
    this.공개 = 'PUBLISHED'
    return this.do저장(false, false).then((ok) => {
      if (ok) useAlert().log('신청을 열었습니다', toCompactDates(새시작, 새끝))
      return ok
    })
  }

  /**
     * **신청을 마감한다.** 마감일을 어제로 둔다 — 비교가 날 단위라 오늘로 두면 오늘 하루는 계속 열려 있다.
     * 「공개」는 건드리지 않는다: 학습자 목록(`/official/enrolls`)이 공개된 것만 세우므로, 상태를 내리면
     * 「마감」 카드로 남지 않고 사라진다.
     */
  do신청마감 = async () => {
    if (!this.is신청받는중) return true
    const 어제 = mDayjs().startOf('day').subtract(1, 'day')
    const 시작 = this.신청기간[0]
    this.신청기간 = [시작.isAfter(어제, 'day') ? 어제 : 시작, 어제] as i기간
    return this.do저장(false, false).then((ok) => {
      if (ok) useAlert().log('신청을 마감했습니다', this.label)
      return ok
    })
  }
}

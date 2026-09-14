import { computed, ref, toValue } from 'vue'
import { BaseModels2, BaseModel2, 타입지정, getRepoInstance, pksOf } from '~utils/models'
import type { BaseXX, BaseXXDto } from '~utils/models'
import { mDayjs } from '~utils'
import { model메뉴s } from '../_basics/model메뉴'
import { model회원s, type model회원 } from '../_basics'
import { model결제s, i결제상태options, i결제상태With미납부Options, type i결제상태 } from '../payments/model결제'
import { model신청받기s, get신청받기씨앗생성기, type model신청받기 } from './model신청받기'
import { i신청단계options, is자리차지, 보이는대상이름표s, type i답s, type i문항, type i신청단계 } from './types'
import { 답라벨s, 답정규화, do채점, is답있음, is채점문항, 문항만점, 문항선택지s, 문항정답라벨s } from './문항'

/** `model결제`가 이 테이블을 가리킬 때 쓰는 이름. 오타 한 번이면 결제가 조용히 안 붙는다. */
export const 신청결제대상 = 'enrolls' as const

/**
 * 채점 라우트 주소. `BaseModels2`가 `apiURL`을 만드는 방식과 **같은 자리**에서 읽는다 —
 * 거기 `apiURL`은 `protected`라 모델에서 못 꺼내고, 문자열을 잘라 쓰면 경로 규칙이 둘로 갈린다.
 */
const 채점API = () => `${(import.meta.env.NUXT_PUBLIC_API_URL as string) || '/api/v1'}/grade`

/**
 * SSR에서는 `credentials: 'include'`가 **아무 일도 하지 않는다** — 들어온 요청의 쿠키를 실어 보내려면
 * `useRequestFetch`가 필요하다. 없으면 채점 요청이 비로그인으로 도착해 401이 된다.
 */
const 채점Fetch = () =>
  (import.meta.server && typeof useRequestFetch === 'function' ? useRequestFetch() : $fetch) as typeof $fetch

/** 서버 채점 결과(`POST {apiUrl}/grade`). 정답은 들어 있지 않다 — 결과만 온다. */
export interface i채점결과 {
  enrollId: string
  score: number
  maxScore: number
  passScore: number | null
  isPassed: boolean | null
  results: { questionId: string, isCorrect: boolean | null, score: number }[]
}

/** 답지의 한 줄 = 문항 하나. 화면(`Input답지`)은 이걸 그리기만 한다 — 라벨·정답 대조를 화면이 다시 하지 않는다. */
export interface i답줄 {
  문항: i문항
  번호: number
  /** 고른·쓴 값. 선택형은 라벨로 바꿔 뒀다. 채점 문항이면 값마다 맞았는지(`정답여부`)가 붙는다. */
  값s: { value: string, label: string, is선택지밖: boolean, 정답여부: boolean | null }[]
  /** 척도 눈금을 그릴 선택지 전부. 척도가 아니면 비어 있다 — 객관식은 고른 것만 보여도 충분하다. */
  눈금s: readonly { value: string, label: string }[]
  /** 필수인데 비었다. 「답하지 않음」과 갈라야 관리자가 되물을 것을 안다. */
  is누락: boolean
  /** 채점 안 하는 문항이면 `null`. */
  정답여부: boolean | null
  /** 틀렸을 때 보여줄 정답. 정답을 모르는 역할에게는 비어 있다(`answerKey` 가 안 내려온다). */
  정답라벨s: string[]
  /** 정답인데 안 고른 것. 복수 선택에서 「정답 전체」를 다시 적으면 이미 맞게 고른 것까지 되풀이된다. */
  놓친정답라벨s: string[]
  배점: number
  득점: number
}

/** 「답」 탭 한 벌. 줄들 + 줄에 안 묶이는 사실 둘(언제 냈나 · 지금 문항에 없는 답). */
export interface i답지 {
  줄s: i답줄[]
  제출일시: ReturnType<typeof mDayjs> | null
  응답수: number
  /** 답은 있는데 지금 문항 목록에 그 id 가 없다 — 문항을 지운 뒤 남은 답. 버리지도 숨기지도 않고 세어 알린다. */
  떠돌이답수: number
}

/**
 * 신청 한 건. 표는 `enrolls`. **설문응답·퀴즈응시·투표·수업신청·행사신청이 전부 이 한 표다.**
 *
 * - 신청자는 늘 `memberId` 다. **비회원도 회원 행이 있다**(익명 로그인이 만든 `members.isGuest` 행) —
 *   그래서 이 표에 비회원 갈래가 없고, 답·결제·채점이 회원과 같은 길을 탄다.
 * - 답은 `answers` jsonb — `{ [문항id]: string[] }`. 응답 표가 따로 없다.
 * - 결제 상태를 여기 열로 두지 않는다 — `model결제`가 이미 대상별 이력을 들고 있어서,
 *   복사해 두면 둘이 어긋나는 순간 어느 쪽이 맞는지 알 방법이 없다.
 * - 재응시(회차)는 없앴다. 답을 고쳐 다시 제출하면 덮어쓴다.
 */
export interface i신청dto extends BaseXXDto {
  enrollableId: string
  memberId: string | null
  answers: i답s
  status: i신청단계
  submittedAt: string | null
}

export interface i신청 extends BaseXX {
  신청받기: model신청받기 | null
  회원: model회원 | null
  신청일: ReturnType<typeof mDayjs>
  상태: i신청단계
  답s: i답s
  결제상태: i결제상태 | 'UNSUBSCRIBED'
}

export class model신청s extends BaseModels2<model신청, i신청dto> {
  protected etcFields = []

  /**
     * 종류 축 — 설문응답·행사신청이 한 표라 여기서 가른다. `model신청받기s.종류필터그룹` 과 **같은 정본**
     * (`보이는대상이름표s`)에서 칸을 뽑는다. 종류는 신청이 아니라 신청받기가 들고 있어서 한 번 건너 읽는다.
     * 신청받기가 아직 안 읽혔으면 어느 칸에도 안 걸린다(「전체」에서만 보인다).
     */
  readonly 종류필터그룹 = this.라디오필터그룹<model신청>(
    [
      { label: '전체', value: '전체', match: () => true },
      ...보이는대상이름표s.map(이름표 => ({
        label: 이름표.label,
        value: 이름표.value,
        icon: 이름표.icon,
        match: (row: model신청) => row.신청받기?.대상표 === 이름표.value
      }))
    ],
    { key: 'application-kind', title: '종류', initialValues: '전체' }
  )

  readonly 결제필터그룹 = this.라디오필터그룹<model신청>(
    [
      { label: '전체', value: '전체', match: () => true },
      { label: '미납', value: '미납', match: (row: model신청) => !row.is무료 && row.결제상태 === 'UNSUBSCRIBED', 대기: true },
      { label: '결제', value: '결제', match: (row: model신청) => row.결제상태 !== 'UNSUBSCRIBED' }
    ],
    { key: 'application-payment', title: '결제', initialValues: '전체' }
  )

  readonly 상태필터그룹 = this.라디오필터그룹<model신청>(
    [
      { label: '전체', value: '전체', match: () => true },
      ...i신청단계options.map(opt => ({
        label: opt.label,
        value: opt.value,
        match: (row: model신청) => row.상태 === opt.value,
        /** 대기만 기다리는 칸이다 — 승인·반려·제출·취소는 답이 나온 것이라 요약의 「할 일」이 안 든다 */
        대기: opt.value === 'PENDING'
      }))
    ],
    { key: 'application-status', title: '상태', initialValues: '전체' }
  )

  override 필터조건ss = [this.종류필터그룹, this.상태필터그룹, this.결제필터그룹]

  static getInstance = () => getRepoInstance('model신청s', () => new model신청s())

  private constructor() {
    super(model신청, 'enrolls')
  }

  get 메뉴() { return model메뉴s.getInstance().getBy테이블명(this.tableName) }

  override _generate = () => new model신청().generate()
  override _init = () => new model신청().init()

  /**
     * `/admin/enrolls` 의 "초기값설정". 신청 시드는 따로 없다 — 콘텐츠·회차 씨앗(`seed.ts`)으로 보낸다.
     * 옛 `/recruits` 가 지던 자리다.
     */
  override async do초기데이터(opts?: { skipConfirm?: boolean, ensureRead?: boolean }) {
    const 생성기 = get신청받기씨앗생성기()
    if (생성기) {
      await 생성기({ skipConfirm: opts?.skipConfirm ?? true })
      return []
    }
    return super.do초기데이터(opts)
  }

  getsBy신청받기 = (신청받기id: string | number | null | undefined): model신청[] => {
    const id = String(신청받기id ?? '').trim()
    if (!id) return []
    return toValue(this.list).filter(row => String(row.state.enrollableId ?? '') === id)
  }

  getsBy회원 = (회원: model회원 | null | undefined): model신청[] => {
    const id = String(회원?.stateId ?? '').trim()
    if (!id) return []
    return toValue(this.list).filter(row => String(row.state.memberId ?? '') === id)
  }

  /** 이미 신청했나. 중복 신청을 막는 **유일한** 판정 자리다(DB 유일 인덱스가 뒤를 받친다). */
  getBy회원신청받기 = (회원: model회원, 신청받기: model신청받기): model신청 | undefined => {
    const 회원id = String(회원?.stateId ?? '').trim()
    const 신청받기id = String(신청받기?.stateId ?? '').trim()
    if (!회원id || !신청받기id) return undefined
    return toValue(this.list).find(
      row => String(row.state.memberId ?? '') === 회원id && String(row.state.enrollableId ?? '') === 신청받기id
    )
  }

  /**
     * 회차에 회원을 신청시킨다. 회원을 안 주면 골라 받는다.
     *
     * 신청받기 가능 여부는 `신청받기.신청불가사유` 하나만 본다 — 화면의 버튼 비활성 조건과 같은 문장이라
     * "버튼은 눌리는데 안 되는" 어긋남이 안 생긴다. 마지막 한 자리의 동시 신청은 여기서 못 막는다 —
     * DB 정원 트리거의 몫이고 아직 안 걸었다(`enrolls.sql` 「나중」).
     */
  do신청 = async (신청받기: model신청받기, 회원?: model회원 | null): Promise<model신청 | undefined> => {
    const 불가 = 신청받기.신청불가사유
    if (불가) {
      useAlert().show('신청할 수 없습니다', 불가)
      return
    }

    if (!회원) {
      const items = toValue(model회원s.getInstance().회원s).map(item => ({ label: item.label, value: String(item.stateId ?? '') }))
      if (!items.length) {
        useAlert().show('회원 없음', '신청할 회원이 없습니다.')
        return
      }
      if (import.meta.server) return
      return new Promise<model신청 | undefined>((res) => {
        const modal = useModalSelect(
          items,
          async (v: string) => {
            const 선택 = model회원s.getInstance().getById(v)
            res(선택 ? await this.do신청(신청받기, 선택) : undefined)
          },
          { title: '회원 선택', description: '신청할 회원을 선택해주세요' }
        )
        modal.open()
      })
    }

    const 기존 = this.getBy회원신청받기(회원, 신청받기)
    if (기존) {
      useAlert().show('이미 신청했습니다', `${회원.label} · ${신청받기.label}`)
      return 기존
    }

    const pks = pksOf({ 회원, 신청받기 })
    if (!pks) return

    return this.create({
      ...this._init(),
      enrollableId: String(pks.신청받기),
      memberId: String(pks.회원)
    })
  }
}

export class model신청 extends BaseModel2<i신청dto> implements i신청 {
  constructor(state?: i신청dto) {
    super(model신청s.getInstance(), state)
  }

  override afterCreate = () => { }
  override afterSave = () => { }
  override beforeSave = () => {
    if (!String(this.state?.enrollableId ?? '').trim()) {
      useAlert().error('저장할 수 없습니다', '회차가 지정돼야 합니다.')
      return false
    }
    if (!this.회원id) {
      useAlert().error('저장할 수 없습니다', '신청한 회원이 지정돼야 합니다.')
      return false
    }
    // 선택지 밖의 값이 들어가면 집계에서 조용히 사라진다 — 저장 전에 막는다.
    for (const 문항 of this.문항s) {
      if (문항.type === 'SHORT' || 문항.type === 'LONG') continue
      const 후보 = new Set(문항.options.map(x => x.value).concat(문항.type === 'OX' ? ['O', 'X'] : []))
      const 벗어난s = (this.답s[문항.id] ?? []).filter(v => !후보.has(v))
      if (벗어난s.length) {
        useAlert().error('선택지에 없는 값입니다', `${문항.label}: ${벗어난s.join(', ')}`)
        return false
      }
    }
    return true
  }

  override 자동필드ss = [
    {
      label: '신청',
      list: [
        { key: '신청일', label: '신청일', type: 타입지정._.날짜, props: { readonly: true }, canEdit: false, show: true },
        { key: '상태', label: '상태', type: 타입지정.선택0, options: i신청단계options, show: true },
        {
          key: '결제상태',
          label: '결제상태',
          type: 타입지정.선택0,
          options: i결제상태With미납부Options,
          props: { readonly: true, type: 'radio' },
          canEdit: false,
          show: computed(() => !this.is무료)
        },
        // 비회원은 연락할 길이 이것뿐이라 신청 카드에서 바로 보인다. 값은 회원 행의 것이다.
        { key: '신청자연락처', label: '연락처', type: 타입지정._.전화번호, props: { readonly: true }, canEdit: false, show: computed(() => !!this.회원?.is비회원) }
      ]
    },
    {
      label: '답',
      config: { ratio: 50 },
      list: [
        {
          key: '답지',
          label: '답',
          type: 타입지정._.답지,
          canEdit: false,
          is한줄: false,
          폭: '전체' as const,
          show: computed(() => this.문항s.length > 0)
        }
      ]
    }
  ]

  override 자동버튼s = this.기본버튼s.concat([
    {
      key: 'do결제',
      label: '결제',
      icon: 'i-stash:wallet-light',
      position: 'top',
      show: computed(() => !this.is무료 && this.결제상태 === 'UNSUBSCRIBED')
    }
  ])

  override generate() {
    return this.init()
  }

  override init(): Omit<i신청dto, 'id'> {
    return {
      enrollableId: '',
      memberId: null,
      answers: {},
      status: 'PENDING' as i신청단계,
      submittedAt: null
    }
  }

  override get label() { return `${this.신청받기?.대상?.label ?? this.신청받기?.label ?? '신청'} (${this.신청자이름 || '?'})` }
  override get sub() {
    const 이름 = this.신청받기?.label ?? '신청'
    if (this.is무료) return 이름
    const 상태 = this.결제상태 === 'UNSUBSCRIBED'
      ? '미납부'
      : i결제상태options.find(x => x.value === this.결제상태)?.label ?? this.결제상태
    const 금액 = this.신청받기?.결제금액 ?? 0
    return `${이름} · ${상태}${금액 > 0 ? ` · ${금액.toLocaleString()}원` : ''}`
  }

  override get icon() { return this.신청받기?.icon ?? 'i-ph-hand-pointing-light' }

  _badges = computed(() => {
    const badges: { label: string, color: string }[] = []
    const 상태 = i신청단계options.find(x => x.value === this.상태)
    if (상태) {
      const color = this.상태 === 'CANCELED' || this.상태 === 'REJECTED' ? 'neutral' : this.상태 === 'PENDING' ? 'warning' : 'primary'
      badges.push({ label: 상태.label, color })
    }
    if (this.회원?.is비회원) badges.push({ label: '비회원', color: 'neutral' })
    if (this.문항s.length) badges.push({ label: `응답 ${this.응답수}/${this.문항s.length}`, color: this.is제출완료 ? 'success' : 'warning' })
    if (this.is채점대상) badges.push({ label: `${this.점수}/${this.만점}점`, color: 'info' })
    return badges
  })

  override get badges() { return toValue(this._badges) }

  _신청받기 = computed(() => {
    const id = String(this.state?.enrollableId ?? '').trim()
    if (!id) return null
    return model신청받기s.getInstance().getById(id) ?? null
  })

  get 신청받기() { return toValue(this._신청받기) }

  _회원 = computed(() => {
    const id = this.회원id
    if (!id) return null
    return model회원s.getInstance().getById(id) ?? null
  })

  get 회원() { return toValue(this._회원) }

  /** 회원 repo 를 안 타는 원본 FK. 회원 목록이 아직 안 읽혔어도 "누구 것인가"는 답할 수 있다. */
  get 회원id() { return String(this.state?.memberId ?? '').trim() }

  /** 화면에 적는 이름. 비회원도 회원 행의 이름이다(신청할 때 적어 낸 것). */
  get 신청자이름() { return this.회원?.label ?? '' }

  get 신청자연락처() { return this.회원?.연락처 ?? '' }
  set 신청자연락처(_v: string) { }

  get 신청일() { return mDayjs(this.state?.createdAt ?? undefined) }

  get 상태() { return (this.state?.status ?? 'PENDING') as i신청단계 }
  set 상태(v: i신청단계) { this.state.status = v }

  /** 자리를 먹는 신청인가(대기·승인). 정원 계산이 이것만 본다 — `types.자리차지상태s`. */
  get is자리차지() { return is자리차지(this.상태) }

  /** 답해야 할 문항. 경로가 `신청 → 회차.questions` 하나뿐이라 합칠 게 없다. */
  get 문항s(): i문항[] { return this.신청받기?.문항s ?? [] }

  // ── 답 (jsonb) ──────────────────────────────────────────────────────────────

  /** 답 전체. state 를 그대로 돌려준다 — 화면이 제자리에서 고친다. */
  get 답s(): i답s {
    const raw = this.state?.answers
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) this.state.answers = 답정규화(raw)
    return this.state.answers
  }

  set 답s(v: i답s) { this.state.answers = 답정규화(v) }

  답Of = (문항id: string): string[] => this.답s[문항id] ?? []

  /** 답을 놓는다. 빈 값이면 키를 지운다 — "빈 배열"과 "없음"을 갈라 두면 응답수가 틀린다. */
  set답 = (문항id: string, 값s: readonly string[]) => {
    const 정리 = 값s.map(v => String(v ?? '')).filter(v => v.trim().length > 0)
    if (정리.length) {
      this.답s[문항id] = 정리
      return
    }
    // 키를 남기지 않는다 — "빈 배열"과 "없음"을 갈라 두면 응답수가 틀린다.
    const { [문항id]: _빠짐, ...나머지 } = this.답s
    this.state.answers = 나머지
  }

  /** **답을 쓴** 문항의 수. */
  get 응답수() { return this.문항s.filter(q => is답있음(this.답s, q.id)).length }

  /** 아직 안 쓴 **필수** 문항들. 제출을 막는 이유를 화면이 그대로 보여줄 수 있게 목록으로 준다. */
  get 미응답필수s() { return this.문항s.filter(q => q.isRequired && !is답있음(this.답s, q.id)) }

  /** 서버에 낸 적이 있나. */
  get is제출됨() { return !!this.state?.submittedAt }
  get 제출일시() { return this.state?.submittedAt ? mDayjs(this.state.submittedAt) : null }

  /** 필수 문항에 모두 답했나. */
  get is제출완료() {
    const 필수s = this.문항s.filter(q => q.isRequired)
    if (!필수s.length) return this.응답수 > 0
    return 필수s.every(q => is답있음(this.답s, q.id))
  }

  /**
     * 관리자 카드의 「답」 탭이 읽는 한 벌(`Input답지`).
     *
     * 예전엔 「문두: 답」을 줄바꿈으로 이어 붙인 문자열이었다. 그러면 문두 끝의 `?`·`.` 뒤에 `:` 가 붙고,
     * 척도 「보통」이 다섯 칸 중 어디인지, 비어 있는 게 「안 씀」인지 「필수를 빠뜨림」인지, 퀴즈에서 맞았는지가
     * 전부 사라졌다. 그 넷을 값으로 실어 보낸다.
     */
  get 답지(): i답지 {
    const 답s = this.답s
    const 문항id들 = new Set(this.문항s.map(q => q.id))
    const 줄s = this.문항s.map((q, i): i답줄 => {
      const 정답 = new Set(q.answerKey ?? [])
      const 정답여부 = this.is정답Of(q.id)
      const 서버 = this.채점결과?.results.find(r => r.questionId === q.id)
      const 고른 = new Set(this.답Of(q.id))
      const 라벨By값 = new Map(문항선택지s(q).map(x => [x.value, x.label]))
      return {
        문항: q,
        번호: i + 1,
        값s: 답라벨s(q, 답s).map(x => ({ ...x, 정답여부: 정답.size ? 정답.has(x.value) : null })),
        눈금s: q.type === 'SCALE' ? 문항선택지s(q) : [],
        is누락: q.isRequired && !is답있음(답s, q.id),
        정답여부,
        정답라벨s: 문항정답라벨s(q),
        놓친정답라벨s: [...정답].filter(v => !고른.has(v)).map(v => 라벨By값.get(v) ?? v),
        배점: q.score,
        득점: 서버 ? 서버.score : 정답여부 === true ? q.score : 0
      }
    })
    return {
      줄s,
      제출일시: this.제출일시,
      응답수: this.응답수,
      떠돌이답수: Object.keys(답s).filter(id => !문항id들.has(id)).length
    }
  }

  set 답지(_v: i답지) { }

  /**
     * 답을 낸다. 제출 시각을 찍고, **문답물이면 상태를 「제출」로** 올린다(심사가 없다).
     * 모임물(수업·행사)의 신청서 답은 신청 행에 같이 남고 상태는 관리자가 정한다.
     */
  do제출 = async () => {
    if (this.미응답필수s.length) {
      useAlert().error('필수 문항이 남았습니다', this.미응답필수s.map(q => q.label))
      return false
    }
    this.state.submittedAt = mDayjs().toISOString()
    if (this.신청받기?.is문답물 && this.상태 === 'PENDING') this.상태 = 'SUBMITTED'
    return this.do저장(false, true)
  }

  // ── 채점 ────────────────────────────────────────────────────────────────────

  /**
     * 서버가 돌려준 채점 결과. 정답을 모르는 역할에게는 이게 유일한 정답 정보다.
     * 관리자·담당자는 정답(`answerKey`)을 그대로 받으므로 이게 없어도 아래 게터들이 답을 낸다.
     */
  private _채점결과 = ref<i채점결과 | null>(null)
  /**
     * `.value` 로 읽지 않는다 — 행이 repo 목록(reactive)에서 오면 `this` 가 프록시라 ref 가 이미 풀려 있고,
     * 결과가 아직 없으면 `null.value` 로 터진다. `toValue` 는 두 경우를 다 받는다.
     */
  get 채점결과() { return toValue(this._채점결과) }

  /** 서버에 채점을 맡긴다. 저장된 답만 채점하므로 제출 뒤에 부른다. */
  do채점요청 = async (): Promise<i채점결과 | null> => {
    const id = String(this.stateId ?? '').trim()
    if (!id) return null
    try {
      const 결과 = await 채점Fetch()<i채점결과>(채점API(), {
        method: 'POST',
        credentials: 'include',
        body: { enrollId: id }
      })
      this._채점결과.value = 결과
      return 결과
    } catch (error: unknown) {
      const e = error as { data?: { message?: string }, message?: string }
      useAlert().error('채점 실패', e?.data?.message ?? e?.message ?? '알 수 없는 오류')
      return null
    }
  }

  /** 이 문항이 정답이었나. 서버 결과가 있으면 그걸, 없으면(관리자) 정답을 직접 대조한다. */
  is정답Of(문항id: string): boolean | null {
    const 서버 = this.채점결과?.results.find(r => r.questionId === 문항id)
    if (서버) return 서버.isCorrect
    const 문항 = this.문항s.find(q => q.id === 문항id)
    return 문항 ? do채점(문항, this.답Of(문항id)) : null
  }

  get is채점대상() { return (this.채점결과?.maxScore ?? 0) > 0 || this.문항s.some(is채점문항) }
  get 만점() { return this.채점결과?.maxScore ?? 문항만점(this.문항s) }
  /** 점수. 채점 문항이 아니면 배점이 0이라 자연히 빠진다. */
  get 점수() {
    if (this.채점결과) return this.채점결과.score
    return this.문항s.reduce((sum, q) => sum + (do채점(q, this.답Of(q.id)) === true ? q.score : 0), 0)
  }

  get is무료() { return this.신청받기?.is무료 ?? true }

  _신청결제 = computed(() => {
    const id = String(this.stateId ?? '').trim()
    if (!id) return null
    return model결제s.getInstance().get최신결제By대상(신청결제대상, id)
  })

  get 신청결제() { return toValue(this._신청결제) }
  get 결제상태(): i결제상태 | 'UNSUBSCRIBED' { return this.신청결제?.결제상태 ?? 'UNSUBSCRIBED' }
  set 결제상태(_v: i결제상태 | 'UNSUBSCRIBED') { }

  do결제 = async () => {
    const 이름 = String(this.신청받기?.대상?.label ?? this.label ?? '신청').trim() || '신청'
    return await model결제s.getInstance().do회원결제(this, {
      title: '결제하기',
      description: `${이름} 결제를 진행합니다.`,
      orderName: `${이름} 신청`
    })
  }
}

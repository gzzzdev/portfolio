import { computed, toValue } from 'vue'
import { BaseModels2, BaseModel2, 타입지정, getRepoInstance, hasServerPk, 시드PK } from '~utils/models'
import type { BaseXX, BaseXXDto } from '~utils/models'
import { mDayjs, pick1, randomN } from '~utils'
import { model회원s, type model회원 } from './model회원'
import { model회원게시글s, type model회원게시글 } from './model회원게시글'
import { i회원댓글seed } from '../seeds'

/**
 * 폴리모픽 댓글 — `(대상타입, 대상Id)` 한 쌍이 어느 행에 달린 댓글인지를 가리킨다.
 * 축 이름·조회 메서드는 같은 꼴인 `model결제`(`targetTable`/`targetId`, `getsBy대상`)를 따랐다.
 *
 * **쓰기 대상과 읽기 대상이 다르다.** 표(`member-comments`)에는 여기서 안 만드는 대상의 댓글도
 * 들어 있다. 작성 대상을 늘리면 그 엔티티 repo를 다 끌어와야 해서, **작성 UI는
 * `i댓글작성대상`만** 열고 타입 자체(`i댓글대상타입`)는 표에 실제로 들어있는 값 전부를 유지한다.
 *
 * TODO — 읽기 전용 여섯 중 `occasions`·`surveys`·`quizzes` 는 `test2/enrolls` 로 넘어와서
 * 이제 여기서 인스턴스를 쥘 수 있다(작성 대상으로 승격 가능). `conferences`·`journals`·`semesters`
 * 셋은 주인 모델이 없다 — 표에 남은 옛 행을 읽기만 한다. 리터럴 유니온은 import가 필요 없으니 공짜고, 그 덕에
 * `getsBy회원`이 "이 회원이 설문에 단 댓글"도 그대로 집어 온다 — 좁혔으면 회원 탭에서 사라졌을 것들이다.
 */

/** 이 모델이 **작성**할 수 있는 대상 — test2가 소유한 표만 */
export const i댓글대상타입options = [
  { label: '회원 게시글', value: 'member_posts', icon: 'i-lucide-file-text' },
  { label: '회원', value: 'members', icon: 'i-lucide-user' }
] as const
export type i댓글작성대상 = typeof i댓글대상타입options[number]['value']

/** 표에 실제로 들어있는 대상 — 아래 여섯은 test1·test0이 쓰고, 여기서는 읽기만 한다. */
export type i댓글대상타입
  = | i댓글작성대상
    | 'occasions'
    | 'conferences'
    | 'journals'
    | 'surveys'
    | 'quizzes'
    | 'semesters'

export interface i회원댓글dto extends BaseXXDto {
  commentableType: i댓글대상타입
  commentableId: string
  isGuest: boolean
  memberId: string | null
  authorName: string
  guestName: string | null
  guestPassword: string | null
  body: string
  createdAt: string
}

/**
 * 시드 한 행. **PK도 `commentableId`도 없다** — 시드는 서버가 매길 PK를 알 수 없으므로
 * 대상 글을 `대상code`로 가리키고, 실제 id는 `seed해소`가 `시드PK` 등록부에서 꺼내 채운다.
 */
export type i회원댓글시드 = Omit<i회원댓글dto, 'id' | 'commentableId'> & { 대상code: string, 작성자code?: string }

export interface i회원댓글 extends BaseXX {
  대상타입: i댓글대상타입
  대상Id: string
  is비회원: boolean
  회원Id: string | null
  작성자표시: string
  게스트명: string
  게스트비밀번호: string
  내용: string
  작성일시: ReturnType<typeof mDayjs>
  readonly 회원: model회원 | null
  readonly 게시글: model회원게시글 | null
}

/**
 * mock 본문 풀. 대상이 무엇이든 통하는 문장만 담는다 —
 * 글 제목에 맞춘 댓글을 고르던 test1 쪽 사전(`회원게시판목록ss`)은 test1 게시판 mock에 묶여 있어서,
 * 게시판이 표(`boards`)가 된 지금은 제목이 맞아떨어지지 않는다.
 */
const 댓글본문풀 = [
  '내용 잘 보았습니다. 도움이 되었어요.',
  '감사합니다.',
  '좋은 정보 공유해 주셔서 감사드립니다.',
  '의견 남깁니다.',
  '추가로 궁금한 점이 있으면 다시 말씀드리겠습니다.',
  '잘 읽었습니다.',
  '참고하겠습니다.',
  '공감합니다.',
  '유익한 글이었습니다.',
  '잘 정리해 주셔서 이해하기 쉬웠습니다.',
  '덕분에 배웠습니다.',
  '좋은 글 감사합니다.',
  '응원합니다.',
  '도움 많이 받았습니다.',
  '알려 주셔서 감사합니다.',
  '잘 보고 갑니다.',
  '기대하고 있겠습니다.',
  '다음 글도 기대하겠습니다.',
  '생각해 볼 만한 내용이었습니다.',
  '의견 잘 들었습니다.',
  '말씀 감사합니다.',
  '도움이 되었습니다.',
  '잘 읽고 갑니다.',
  '유용한 정보였습니다.',
  '공유 감사합니다.',
  '좋은 하루 되세요.',
  '수고 많으셨습니다.',
  '내용 확인했습니다.',
  '기록해 두겠습니다.',
  '궁금했던 부분이 해소되었습니다.',
  '정리가 깔끔해서 좋았습니다.',
  '한번 더 읽어보겠습니다.',
  '의견 나눠 주셔서 감사합니다.',
  '좋은 말씀 감사드립니다.',
  '잘 참고하겠습니다.',
  '도움이 될 것 같습니다.',
  '알겠습니다. 감사합니다.',
  '네, 확인했습니다.',
  '좋은 글 잘 봤습니다.',
  '배울 점이 많았습니다.',
  '읽는 내내 유익했습니다.'
]

/** mock 댓글 본문 1건 */
export const sample댓글본문 = (): string => pick1(댓글본문풀)

const 게스트별명 = () => `방문자${randomN(1, 99)}`

/** `useModalFields` 결과는 값 또는 `{ label, value }` — 둘 다 받아 문자열로 편다. */
const pick값 = (v: unknown): string =>
  typeof v === 'object' && v && 'value' in v ? String((v as { value: string }).value) : String(v ?? '')

export class model회원댓글s extends BaseModels2<model회원댓글, i회원댓글dto, i회원댓글시드> {
  protected etcFields = []

  override 검색필드s = ['작성자표시', '내용']

  override 정렬조건s = [
    {
      label: '작성↓',
      value: '작성↓',
      func: (a: model회원댓글, b: model회원댓글) =>
        String(b.state.createdAt ?? '').localeCompare(String(a.state.createdAt ?? ''))
    },
    {
      label: '작성↑',
      value: '작성↑',
      func: (a: model회원댓글, b: model회원댓글) =>
        String(a.state.createdAt ?? '').localeCompare(String(b.state.createdAt ?? ''))
    },
    {
      label: '작성자↑',
      value: '작성자↑',
      func: (a: model회원댓글, b: model회원댓글) => a.작성자표시.localeCompare(b.작성자표시)
    }
  ]

  override 필터조건ss = [
    this.라디오필터그룹<model회원댓글>(
      [
        { label: '회원', value: 'MEMBER', icon: 'i-lucide-user', match: a => !a.is비회원 },
        { label: '비회원', value: 'GUEST', icon: 'i-lucide-user-round-x', match: a => a.is비회원 }
      ],
      { title: '작성자' }
    )
  ]

  static getInstance = () => getRepoInstance('model회원댓글s', () => new model회원댓글s())

  private constructor() {
    super(model회원댓글, 'member-comments', { hasConfirm: false })
  }

  override _generate = () => new model회원댓글().generate()
  override _init = () => new model회원댓글().init()
  protected override seed = i회원댓글seed

  /**
   * 시드의 `대상code`를 실제 게시글 PK로 바꾼다. **DB를 뒤지지 않는다** — 게시글 시드가
   * 돌 때 `시드PK` 등록부에 남겨둔 짝을 꺼낸다(`useSystem`이 의존 순서대로 훑는다).
   *
   * 예전엔 제목으로 찾았는데, 제목은 편집되는 값이라 시드가 다시 돌 때 어긋난다.
   * 어긋나면 댓글이 엉뚱한 글에 붙거나 미아가 되는데 **화면엔 에러 없이 그냥 안 보인다.**
   *
   * 못 찾아도 행을 떨어뜨리지 않는다 — `do초기데이터`의 시각 되돌리기가
   * 선언 순서에 1:1로 기대므로 개수가 변하면 안 된다.
   */
  protected override async seed해소(rows: i회원댓글dto[]): Promise<i회원댓글dto[]> {
    return rows.map((row) => {
      const { 대상code, 작성자code, ...rest } = row as i회원댓글dto & { 대상code?: string, 작성자code?: string }
      const commentableId = 대상code ? 시드PK.찾기('member-posts', 대상code) : null
      // 회원 댓글이면 `작성자code` → `memberId`. 못 찾으면 비회원 댓글로 떨어지지 않게 경고만 남긴다(글과 같은 규칙).
      const memberId = 작성자code ? 시드PK.찾기('members', 작성자code) : (rest as { memberId?: string | null }).memberId ?? null
      if (작성자code && !memberId) console.warn(`[댓글 seed] 회원 '${작성자code}'가 등록부에 없음`)
      if (대상code && !commentableId) {
        throw new Error(
          `[댓글 seed] 게시글 '${대상code}'이 시드PK 등록부에 없다.`
          + ` 게시글을 함께 비우고 초기데이터를 한 번에 돌릴 것.`
        )
      }
      return { ...rest, commentableId, memberId } as unknown as i회원댓글dto
    })
  }

  override async do초기데이터(opts?: { skipConfirm?: boolean, ensureRead?: boolean }) {
    const 만든s = await super.do초기데이터(opts)
    if (!만든s?.length) return 만든s

    // FK(`commentableId`)는 `seed해소`가 넣기 전에 채웠다. 남은 건 서버가 덮어쓴 `createdAt`뿐.
    const 고칠s: model회원댓글[] = []
    // `creates`는 넘긴 순서대로 돌려주므로 시드 선언 순서와 1:1이다.
    // 비교 없이 늘 되돌린다 — 모델 state 는 보낸 값(시드 날짜)을 들고 있어 「다르면」 이 늘 거짓이었다(`model회원게시글.do초기데이터` 주석).
    만든s.forEach((row, i) => {
      const 시드 = i회원댓글seed[i]
      if (시드) {
        row.state.createdAt = 시드.createdAt
        고칠s.push(row)
      }
    })
    if (고칠s.length) {
      // `do모두저장`이 아니라 `updates`인 이유: 저 길은 행마다 `beforeSave`를 부르고,
      // `model회원게시글.beforeSave`는 썸네일 없는 글마다 AI를 한 번씩 부른다(`do썸네일자동`).
      // 시드 수십 건에 그게 붙으면 초기데이터 한 번이 AI 호출 수십 번이 된다.
      await this.updates(고칠s.map(row => row.state))
      // 되돌린 값으로 목록을 다시 세운다 — 안 하면 방금 손댄 행들이 "저장 필요"로 남는다.
      await this.reads(false, true)
    }
    return 만든s
  }

  /** 특정 대상에 달린 댓글 (작성일 내림차순) */
  private 최신순 = (a: model회원댓글, b: model회원댓글) =>
    String(b.state.createdAt ?? '').localeCompare(String(a.state.createdAt ?? ''))

  /**
   * 다형 관계라 다른 `getsBy*`와 달리 모델 인스턴스가 아니라 `(대상타입, id)` 쌍을 받는다 —
   * 읽기 전용 대상은 여기서 인스턴스를 쥘 수가 없다.
   */
  getsBy대상 = (대상타입: i댓글대상타입, 대상Id: string) => {
    if (!hasServerPk(대상Id)) return []
    const id = String(대상Id).trim()
    return toValue(this.list)
      .filter(row => row.대상타입 === 대상타입 && row.대상Id === id)
      .sort(this.최신순)
  }

  /**
   * 이 회원이 **쓴** 댓글 + 이 회원 **프로필에 달린** 댓글 (작성일 내림차순).
   *
   * 두 축을 한 목록에 합치는 건 회원 상세의 댓글 탭이 "이 사람과 엮인 댓글"을 보여주기 때문이다.
   * 축을 나눠야 할 화면이 생기면 그때 `getsBy작성자` / `getsBy대상('members', id)`로 갈라 쓰면 된다.
   *
   * 대상 축이 다형이라 인스턴스를 그대로 비교하지 못하고 여기서 PK를 꺼내 쓴다.
   */
  getsBy회원 = (회원: model회원) => {
    const id = String(회원?.stateId ?? '')
    if (!hasServerPk(id)) return []
    return toValue(this.list)
      .filter(row => row.회원Id === id || (row.대상타입 === 'members' && row.대상Id === id))
      .sort(this.최신순)
  }

  /** 공개 댓글 작성 (회원이면 memberId·이름 자동, 비회원은 게스트명/비밀번호 사용) */
  do작성 = async (p: {
    대상타입: i댓글대상타입
    대상Id: string
    is비회원?: boolean
    회원Id: string | null
    작성자표시: string
    게스트명?: string | null
    게스트비밀번호?: string | null
    내용: string
  }) => {
    const 내용 = String(p.내용 ?? '').trim()
    const 회원Id
      = p.회원Id != null && String(p.회원Id).trim() !== '' ? String(p.회원Id).trim() : null
    const is비회원 = typeof p.is비회원 === 'boolean' ? p.is비회원 || !회원Id : !회원Id
    const 표시이름 = String(p.작성자표시 ?? '').trim()
    const 게스트명 = String(p.게스트명 ?? '').trim() || 표시이름 || null
    const 게스트비밀번호 = String(p.게스트비밀번호 ?? '').trim() || null

    const dto: i회원댓글dto = {
      id: 'imsi' + Date.now(),
      commentableType: p.대상타입,
      commentableId: String(p.대상Id),
      isGuest: is비회원,
      memberId: 회원Id,
      authorName: 회원Id ? 표시이름 || `회원#${회원Id}` : (게스트명 ?? ''),
      guestName: 게스트명,
      guestPassword: 게스트비밀번호,
      body: 내용,
      createdAt: new Date().toISOString()
    }
    const m = new model회원댓글(dto)
    await m.add(true)
    return m
  }

  /** 대상 상세(게시글 등): 작성 회원만 모달로 받아 저장 (본문은 빈 값) */
  do빈생성_대상관점 = async (
    대상타입: i댓글대상타입,
    대상Id: string,
    config: { title?: string, description?: string } = {}
  ) => {
    const cid = String(대상Id ?? '').trim()
    if (!cid || import.meta.server) return

    const 회원s = toValue(model회원s.getInstance().회원s)
    if (!회원s.length) {
      useAlert().show('회원 없음', '작성자로 선택할 회원이 없습니다. 회원을 먼저 등록하세요.')
      return
    }

    const modal = useModalFields()
    const result = await modal.open({
      title: config.title ?? '댓글 작성',
      description: config.description ?? '댓글을 남길 회원을 선택하세요',
      steps: [
        {
          key: 'memberId',
          kind: 'select',
          label: '작성 회원',
          items: 회원s.map(m => ({ label: m.label, value: String(m.stateId ?? '') })),
          required: true
        }
      ]
    })
    if (!result) return

    const mid = pick값(result.memberId)
    const 회원 = model회원s.getInstance().getById(mid)
    if (!회원) return

    await this.do작성({
      대상타입,
      대상Id: cid,
      회원Id: mid,
      작성자표시: 회원.이름.trim() || mid,
      내용: ''
    })
    return this.reads()
  }

  /**
   * 회원 상세: 이 회원 명의로 댓글을 남긴다.
   *
   * 고를 수 있는 대상은 `i댓글대상타입options` — 회원 게시글과 회원 프로필뿐이다.
   * 행사·설문 등에 이 회원 명의 댓글을 넣는 건 그쪽 엔티티 상세에서 할 일이다.
   */
  do빈생성_회원관점 = async (작성자: { id: string | number | null, 이름: string }) => {
    const mid = String(작성자.id ?? '')
    if (!mid || import.meta.server) return

    const 게시글items = toValue(model회원게시글s.getInstance().list).map(p => ({
      label: p.제목?.trim() || `게시글#${p.stateId}`,
      value: String(p.stateId ?? '')
    }))

    const modal = useModalFields()
    const result = await modal.open({
      title: `${작성자.이름 || '회원'} 명의로 댓글`,
      description: '대상을 고른 뒤 내용을 입력하면 이 회원이 작성한 댓글로 저장됩니다',
      steps: [
        {
          key: '대상타입',
          kind: 'select',
          label: '댓글 달 곳',
          items: i댓글대상타입options.map(o => ({ label: o.label, value: o.value })),
          required: true
        },
        {
          key: '대상Id',
          kind: 'select',
          label: '대상',
          resolveItems: (vals: Record<string, unknown>) =>
            pick값(vals.대상타입) === 'members'
              ? [{ label: `${작성자.이름 || '회원'} (프로필)`, value: mid }]
              : 게시글items,
          required: true
        },
        {
          key: '내용',
          kind: 'input',
          label: '댓글 내용',
          defaultValue: '',
          placeholder: '이 회원 명의로 저장됩니다.',
          trim: true,
          required: true
        }
      ]
    })
    if (!result) return

    const 내용 = String(result.내용 ?? '').trim()
    if (!내용) return

    await this.do작성({
      대상타입: pick값(result.대상타입) as i댓글대상타입,
      대상Id: pick값(result.대상Id),
      회원Id: mid,
      작성자표시: 작성자.이름.trim() || mid,
      내용
    })
    return this.reads()
  }
}

export class model회원댓글 extends BaseModel2<i회원댓글dto> implements i회원댓글 {
  constructor(state?: i회원댓글dto) {
    super(model회원댓글s.getInstance(), state)
  }

  override 자동필드ss = [
    {
      label: '기본',
      list: [
        { key: '작성자표시', label: '작성자', show: true },
        {
          key: 'is비회원',
          label: '비회원',
          type: 타입지정._.is체크,
          show: true,
          canEdit: false
        },
        {
          key: '게스트명',
          label: '비회원 이름',
          show: computed(() => this.is비회원),
          canEdit: computed(() => this.is비회원)
        },
        {
          key: '게스트비밀번호',
          label: '비회원 비밀번호',
          show: computed(() => this.is비회원),
          canEdit: computed(() => this.is비회원)
        },
        // 댓글에 에디터는 과하다 — 한 줄 입력으로 둔다.
        { key: '내용', label: '내용', type: 타입지정._.문자, show: true },
        { key: '작성일시', label: '작성일', show: true }
      ]
    }
  ]

  override 자동버튼s = this.기본버튼s

  bindModel = null as any
  override afterCreate = () => { }
  override beforeSave = () => {
    if (!this.내용.trim()) {
      useAlert().show('내용 필요', '댓글 내용을 입력하세요.')
      return false
    }
    return true
  }

  override afterSave = () => { }

  override generate() {
    const 대상타입: i댓글대상타입 = this.state?.commentableType ?? 'member_posts'
    const 대상Id = String(this.state?.commentableId ?? '').trim() || '1001'

    const 회원Id
      = this.state?.memberId != null && String(this.state.memberId).trim() !== ''
        ? String(this.state.memberId).trim()
        : null
    const is비회원
      = typeof this.state?.isGuest === 'boolean' ? this.state.isGuest || !회원Id : !회원Id
    const 별명 = 게스트별명()
    const 게스트명 = String(this.state?.guestName ?? '').trim() || (is비회원 ? 별명 : null)
    const 게스트비밀번호
      = String(this.state?.guestPassword ?? '').trim() || (is비회원 ? String(randomN(1000, 9999)) : null)

    return {
      ...this.init(),
      commentableType: 대상타입,
      commentableId: 대상Id,
      isGuest: is비회원,
      memberId: 회원Id,
      authorName: 회원Id ? `회원#${회원Id}` : (게스트명 ?? 별명),
      guestName: 게스트명,
      guestPassword: 게스트비밀번호,
      body: sample댓글본문(),
      createdAt: new Date().toISOString()
    }
  }

  override init() {
    return {
      commentableType: 'member_posts' as i댓글대상타입,
      commentableId: '',
      isGuest: false,
      memberId: null,
      authorName: '',
      guestName: null,
      guestPassword: null,
      body: '',
      createdAt: new Date().toISOString()
    }
  }

  override get label() {
    const head = this.내용.slice(0, 24)
    return `${this.작성자표시}: ${head}${this.내용.length > 24 ? '…' : ''}`
  }

  /** 어디에 달린 댓글인지 — 목록·카드에서 대상 없이 본문만 보면 어느 글 얘긴지 알 수 없다. */
  override get sub() {
    const 언제 = this.작성일시.isValid() ? this.작성일시.format('YYYY-MM-DD HH:mm') : ''
    const 어디 = this.대상라벨
    return 어디 ? `${어디} · ${언제}` : 언제
  }

  override get icon() {
    return (
      i댓글대상타입options.find(o => o.value === this.대상타입)?.icon ?? 'i-lucide-message-circle'
    )
  }

  _badges = computed(() => {
    const badges: { label: string, color: string, icon?: string }[] = []
    if (this.is비회원) badges.push({ label: '비회원', color: 'warning', icon: 'i-lucide-user-round-x' })
    const 대상 = i댓글대상타입options.find(o => o.value === this.대상타입)
    if (대상) badges.push({ label: 대상.label, icon: 대상.icon })
    return badges
  })

  override get badges() { return toValue(this._badges) }

  get 대상타입() { return (this.state?.commentableType ?? 'member_posts') as i댓글대상타입 }
  set 대상타입(v: i댓글대상타입) { if (!this.state) return; this.state.commentableType = v }

  get 대상Id() { return String(this.state?.commentableId ?? '') }
  set 대상Id(v: string) { if (!this.state) return; this.state.commentableId = String(v ?? '') }

  get 회원Id() {
    const v = this.state?.memberId
    if (v == null || String(v).trim() === '') return null
    return String(v)
  }

  set 회원Id(v: string | null) {
    if (!this.state) return
    this.state.memberId = v != null && String(v).trim() !== '' ? String(v).trim() : null
  }

  get is비회원() { return Boolean(this.state?.isGuest) }
  set is비회원(v: boolean) { if (!this.state) return; this.state.isGuest = Boolean(v) }

  get 작성자표시() { return this.state?.authorName ?? '' }
  set 작성자표시(v: string) {
    if (!this.state) return
    const name = String(v ?? '').trim()
    this.state.authorName = name
    if (this.is비회원) this.state.guestName = name || null
  }

  get 게스트명() { return String(this.state?.guestName ?? '') }
  set 게스트명(v: string) {
    if (!this.state || !this.is비회원) return
    const n = String(v ?? '').trim()
    this.state.guestName = n || null
    if (!this.회원Id) this.state.authorName = n
  }

  get 게스트비밀번호() { return String(this.state?.guestPassword ?? '') }
  set 게스트비밀번호(v: string) {
    if (!this.state || !this.is비회원) return
    this.state.guestPassword = String(v ?? '').trim() || null
  }

  get 내용() { return this.state?.body ?? '' }
  set 내용(v: string) { if (!this.state) return; this.state.body = v }

  _작성일시 = computed(() => mDayjs(this.state?.createdAt))
  get 작성일시() { return toValue(this._작성일시) }

  /** 작성자 회원. 비회원 댓글이면 `null`. */
  get 회원(): model회원 | null {
    const id = this.회원Id
    return id ? (model회원s.getInstance().getById(id) ?? null) : null
  }

  /** 댓글이 달린 게시글. 대상이 게시글이 아니면 `null`. */
  get 게시글(): model회원게시글 | null {
    if (this.대상타입 !== 'member_posts') return null
    return model회원게시글s.getInstance().getById(this.대상Id) ?? null
  }

  /** `sub`·목록에 쓰는 대상 표시. test1 소유 대상은 유형 이름까지만 안다. */
  get 대상라벨() {
    if (this.대상타입 === 'member_posts') return this.게시글?.제목?.trim() || '게시글'
    if (this.대상타입 === 'members')
      return model회원s.getInstance().getById(this.대상Id)?.이름?.trim() || '회원'
    return ''
  }
}

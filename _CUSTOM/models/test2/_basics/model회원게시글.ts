import { BaseModels2, BaseModel2, 타입지정, getRepoInstance, 시드PK } from '~utils/models'
import type { BaseXXDto, BaseXX } from '~utils/models'
import {
  mDayjs,
  pick1,
  generateEditorContent,
  randomN,
  md평문,
  본문영상s,
  본문사진s
} from '~utils'
import { computed, toValue } from 'vue'
import sample게시글 from '../seeds/model회원게시글.seed'
import { i회원게시글seed } from '../seeds'
import { model회원s, type model회원 } from './'
import { model게시판s, i게시판표시형식options, type model게시판 } from './model게시판'
import { model회원댓글s, sample댓글본문, type model회원댓글 } from './model회원댓글'
// 평문 → 편집기 md. 챗봇에서 온 초안과 같은 변환을 써야 결과가 갈리지 않는다.
import { 초안본문md } from '~utils/ai/초안'

/**
 * 인증 스토어는 **동적으로** 부른다.
 *
 * `useMyAuthStore`가 `~models/test2`를 정적 import 하므로 여기서 마주 import 하면 순환이 된다.
 * 그러면 초기화 순서에 따라 모델 export가 undefined가 되고, GNB(메뉴·게시판)가 통째로 비는 일이
 * 실제로 있었다 — 게시판 화면은 멀쩡한데 상단 네비만 사라지는 형태라 원인을 찾기도 어렵다.
 */
const get인증 = async () => (await import('~/stores/useMyAuthStore')).useMyAuthStore()

/**
 * AI 초안 — 한 줄 지시를 이 게시글의 제목·본문으로.
 *
 * 프롬프트가 모델 안에 있는 이유: "공지는 안내문, Q&A는 Q/A"는 **게시글의 도메인 지식**이지
 * 챗봇이나 글쓰기 페이지의 지식이 아니다. 여기 두면 부르는 쪽이 어디든(글쓰기 화면·관리 폼·챗봇)
 * 같은 규칙으로 같은 초안이 나온다.
 *
 * `flash`를 쓴다. 계획 수립(`~utils/ai/planner`)은 "보기 중에 고르기"라 lite로 되지만 초안은
 * 없는 문장을 쓰는 일이다. 실측: "다음주 월요일"을 lite는 틀린 날짜로 계산했고 flash는 맞췄다.
 * 공지에서 날짜가 틀리면 초안이 아니라 사고다. 사용자가 누를 때만 한 번 도는 호출이라
 * 매 턴 도는 계획 호출과 비용 성격도 다르다.
 */
const AI초안모델단계 = 'flash'

const AI초안지침 = `너는 게시판에 올릴 글의 초안을 쓴다. 사용자가 준 한 줄 지시를 사람이 그대로 읽을 수 있는 글로 만드는 게 일이다.

[사실]
- 지시에 있는 사실만 써라. 담당자·연락처·환불규정·기대효과처럼 듣지 않은 것을 지어내지 마라.
- 모르는 값은 그럴듯하게 채우지 말고 빼라. 빈칸 표시([ ], TBD)도 남기지 마라.
- 듣지 않은 영향·이유·후속 조치를 사실처럼 쓰지 마라("점검"만 들었으면 무엇이 멈추는지는 네가 알 수 없다).
- 답을 모르는 질문이면 지어내서 답하지 마라. 질문만 세우고 답변 자리는 비워 둬라.
- 날짜·시각은 [지금] 기준으로 실제 날짜를 계산해 적어라("오늘 3~4시" → "9월 2일(수) 오후 3시~4시").

[본문 형식]
- 본문은 마크다운으로 쓴다. 쓸 수 있는 문법은 이것뿐이다:
  문단(빈 줄로 가른다) / ### 소제목 / - 목록 / 1. 번호목록 / **굵게** / > 인용 / [글자](주소)
  | 표 | 는 | 헤더 줄 아래에 |---|---| 구분줄을 반드시 넣어라.
  HTML 태그는 쓰지 마라. 밑줄·색·글자크기 문법은 없다.
- 제목을 본문 안에서 되풀이하지 마라 — 제목은 따로 나간다.
- 제목에 [공지]·[Q&A] 같은 머리표를 붙이지 마라. 어느 게시판인지는 이미 정해져 있다.
  - 사실이 여럿이면 ` - ` 목록으로 나눠라. 일시·대상·영향처럼 항목이 뚜렷할 때 특히 그렇다.
- 전체 3~8문장. 인사말·맺음말·상투어("많은 관심 부탁드립니다")로 분량을 늘리지 마라.

[게시판 성격에 맞춰라]
- 공지·안내: 무슨 일인지 한 문장 → 항목(일시·대상·영향) → 사람이 해야 할 일.
- 질문·답변: **Q. …** 한 줄 뒤에 답변 문단.
- 자료: 무엇에 대한 자료인지 한 문장 → 담긴 내용 목록.
- 카드·목록: 무슨 일이 있었는지 한 문장 → 배경과 이어질 일.

사용자에게 말을 걸지 마라. 네가 쓰는 건 게시판에 그대로 붙을 글이다.`

const AI초안스키마 = {
  type: 'object',
  properties: {
    제목: { type: 'string', description: '게시글 제목 한 줄. 제목만 보고 무슨 글인지 알 수 있게.' },
    본문: { type: 'string', description: '게시글 본문 마크다운. 허용된 문법만. 지시에 있는 사실만.' }
  },
  required: ['제목', '본문']
}

/**
 * 초안에 실어 보낼 게시판 맥락.
 *
 * 이름만 주던 걸 게시판 행 자체로 바꿨다. 같은 지시라도 공지·FAQ·자료는 글 모양이 다르고,
 * 그 판단 근거(설명·표시형식)는 게시판이 이미 들고 있다. **최근 글 제목**까지 주는 게 핵심인데,
 * 규칙을 열 줄 더 쓰는 것보다 그 게시판이 실제로 어떻게 쓰는지 세 줄 보여주는 쪽이 잘 먹는다.
 */
const 최근글수 = 3
function 게시판맥락(게시판?: model게시판 | null): string {
  if (!게시판) return ''
  const 이름 = 게시판.이름?.trim()
  if (!이름) return ''

  const 형식 = i게시판표시형식options.find(o => o.value === 게시판.표시형식)?.label ?? ''
  const 요약 = 게시판.요약?.trim()
  const 최근 = 게시판.회원게시글s
    .slice(0, 최근글수)
    .map(g => g.제목?.trim())
    .filter(Boolean)

  return [
    `\n[게시판] ${이름}${요약 ? ` — ${요약}` : ''}${형식 ? ` (형식: ${형식})` : ''}`,
    최근.length ? `\n[이 게시판의 최근 글] ${최근.join(' / ')}` : ''
  ].join('')
}

/** 계획 호출과 같은 이유로 현재 시각을 준다 — "오늘 3~4시"를 날짜로 옮길 수 있어야 한다. */
/**
 * 이미 쓰여 있는 글을 프롬프트에 싣는 블록. 이게 붙으면 초안이 아니라 **고쳐 쓰기**가 된다.
 *
 * "더 짧게", "일시만 바꿔"가 성립하려면 지금 글이 프롬프트에 들어가야 한다. 통째로 싣는 게
 * 부담스럽지 않은 이유는 이 호출이 사용자가 버튼을 누를 때만 한 번 돌기 때문이다 —
 * 매 턴 도는 챗봇 참조에는 앞부분만 가이드로 나간다(`~utils/ai/작업문맥`의 `작업블록`).
 *
 * 지시를 여기 같이 적는다. 조건부 지시("글이 있으면 ~하라")를 고정 지침에 두면 없는 글을
 * 가정하게 되므로, 해당될 때만 붙이는 게 이 코드베이스의 관례다.
 */
function 현재글블록(현재?: { 제목?: string, 본문?: string } | null): string {
  const 제목 = String(현재?.제목 ?? '').trim()
  const 본문 = String(현재?.본문 ?? '').trim()
  if (!제목 && !본문) return ''

  return [
    '\n[지금 쓰여 있는 글]',
    제목 ? `제목: ${제목}` : '',
    본문 ? `본문(md):\n${본문}` : '',
    '\n이 글을 지시대로 고쳐 **전체를 다시 써라**(부분만 돌려주지 마라).',
    '지시가 건드리지 않은 부분은 뜻도 표현도 그대로 살려라. 시키지 않은 사실을 더하지도, 있던 사실을 빼지도 마라.'
  ]
    .filter(Boolean)
    .join('\n')
}

function 지금표기(): string {
  const d = new Date()
  const 요일 = ['일', '월', '화', '수', '목', '금', '토'][d.getDay()]
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}(${요일}) ${p(d.getHours())}:${p(d.getMinutes())}`
}

/**
 * 표본 글 카탈로그가 게시판을 가르는 이름(`seeds/model회원게시글.seed`). 실제 게시판은 `model게시판` 행이다.
 * 영상 게시판(`youtube`)은 없다 — 영상은 어느 게시판 글이든 본문에 넣고 `영상s` 로 거른다.
 */
export type i게시판ID = 'notice' | 'qna' | 'docs' | 'news'
export type i게시글타입 = 'link' | 'download' | 'content'

/** 게시판(`model게시판`) id + (회원 또는 비회원) 작성자에 귀속되는 게시글 */
export interface i회원게시글dto extends BaseXXDto {

  boardId: string
  isGuest: boolean
  memberId: string | null
  guestName: string | null
  guestPassword: string | null
  title: string
  body: string
  thumbnail: string | null
  isPublished: boolean
  /**
   * 자주 묻는 질문으로 올린 글. FAQ 게시판을 Q&A 로 합치면서(2026-09-14) 게시판 대신 이 표시가
   * 「자주 묻는」 을 가른다 — 운영진이 정리한 답과 방문자가 올린 질문이 한 게시판에 같이 산다.
   */
  isFaq: boolean
  createdAt: string
  updatedAt: string

  likes: number
  views: number
}

/**
 * 시드 한 행. **PK도 FK도 없다** — 시드는 서버가 매길 PK를 알 수 없으므로 게시판을 `boardCode`,
 * 작성자를 `작성자code`로 가리키고, 실제 `boardId`·`memberId`는 `seed해소`가 채운다.
 * 자기 `code`도 들고 있다 — 댓글 시드가 이 글을 그 이름으로 찾는다.
 */
export type i회원게시글시드 = Omit<i회원게시글dto, 'id' | 'boardId' | 'memberId'>
  & { code: string, boardCode: string, 작성자code: string }

export interface i회원게시글 extends BaseXX {
  게시판Id: string
  is비회원: boolean
  회원Id: string | null
  /** 표시 전용 — 회원 이름 또는 비회원명 */
  readonly 작성자표시: string
  게스트명: string
  게스트비밀번호: string
  제목: string
  본문: string
  /** 표시 전용 — 본문 md에서 표시를 걷어낸 평문(검색·발췌용) */
  readonly 본문텍스트: string
  이미지: string | null
  공개: boolean
  is자주: boolean
  작성일시: ReturnType<typeof mDayjs>
  수정일시: ReturnType<typeof mDayjs>
  게시판: model게시판 | null
  회원: model회원 | null

  좋아요수: number
  조회수: number
}

export class model회원게시글s extends BaseModels2<model회원게시글, i회원게시글dto, i회원게시글시드> {
  /** `code`는 시드 전용 이름이라 서버로 보내지 않는다 — `시드PK` 등록부에만 남는다. */
  protected etcFields = ['code']

  /**
   * 목록5 검색창과 챗봇 `검색어s`가 함께 훑는 필드. **선언 순서가 곧 가중치**라
   * 제목에서 맞은 글이 본문에서 맞은 글보다 위로 온다.
   *
   * 본문은 `본문`(md 원문)이 아니라 `본문텍스트`로 훑는다 — 표시째 훑으면
   * `href`의 URL이 키워드에 걸린다.
   */
  override 검색필드s = ['제목', '작성자표시', '본문텍스트']

  override 정렬조건s = [
    {
      label: '작성↓',
      value: '작성↓',
      func: (a: model회원게시글, b: model회원게시글) =>
        String(b.state.createdAt ?? '').localeCompare(String(a.state.createdAt ?? ''))
    },
    {
      label: '작성↑',
      value: '작성↑',
      func: (a: model회원게시글, b: model회원게시글) =>
        String(a.state.createdAt ?? '').localeCompare(String(b.state.createdAt ?? ''))
    },
    {
      label: '제목↑',
      value: '제목↑',
      func: (a: model회원게시글, b: model회원게시글) => a.제목.localeCompare(b.제목)
    },
    {
      label: '제목↓',
      value: '제목↓',
      func: (a: model회원게시글, b: model회원게시글) => b.제목.localeCompare(a.제목)
    },
    {
      label: '최신',
      value: '최신',
      func: (a: model회원게시글, b: model회원게시글) =>
        Number(b.stateId) - Number(a.stateId)
    },
    {
      label: 'ID↓',
      value: 'ID↓',
      func: (a: model회원게시글, b: model회원게시글) =>
        Number(a.stateId) - Number(b.stateId)
    }
  ]

  /** 목록5·GNB `?boardId=`와 동일한 표시 규칙 */
  static navLabelForBoard(b: model게시판): string {
    const n = b.이름?.trim()
    if (n) return n
    const s = b.슬러그?.trim()
    if (s) return s
    return String(b.stateId ?? '')
  }

  readonly 게시판필터그룹 = this.라디오필터그룹<model회원게시글>(
    [{ label: '전체', value: '전체', match: () => true }],
    { key: 'member-post-board', title: '게시판', initialValues: ['전체'] }
  )

  override 필터조건ss = [this.게시판필터그룹]

  /**
   * 게시판 축의 옵션은 `model게시판` 목록에서 만들어진다 — 게시글만 읽어오면 축에 '전체'뿐이라
   * 목록도 챗봇도 게시판으로 좁힐 수 없다(챗봇은 `reads()` 한 번이 적재의 전부다).
   * 그래서 적재와 축 갱신을 여기 묶는다. 둘 다 `cachedRead`가 받쳐주므로 중복 호출은 공짜다.
   */
  override async reads(isBrief = false, force = false): Promise<boolean> {
    const [ok] = await Promise.all([
      super.reads(isBrief, force),
      model게시판s.getInstance().reads()
    ])
    this.sync게시판필터옵션()
    return ok
  }

  private boardFilterLabelByBoardId = new Map<string, string>()

  private static filterLabelForBoardRow(b: model게시판, nameDupCount: Map<string, number>): string {
    const base = model회원게시글s.navLabelForBoard(b)
    return (nameDupCount.get(base) ?? 0) > 1
      ? `${base} (${b.슬러그?.trim() || String(b.stateId ?? '')})`
      : base
  }

  /** 게시판 목록 변경 후 호출 — 옵션·라벨 맵 갱신 */
  sync게시판필터옵션() {
    const boards = [...toValue(model게시판s.getInstance().list)]
      .sort((a, b) => a.순서 - b.순서)
    const nameDupCount = new Map<string, number>()
    for (const b of boards) {
      const base = model회원게시글s.navLabelForBoard(b)
      nameDupCount.set(base, (nameDupCount.get(base) ?? 0) + 1)
    }
    this.boardFilterLabelByBoardId.clear()
    const opts = boards.map((b) => {
      const label = model회원게시글s.filterLabelForBoardRow(b, nameDupCount)
      const bid = String(b.stateId ?? '')
      this.boardFilterLabelByBoardId.set(bid, label)
      return {
        label,
        value: bid,
        match: (a: model회원게시글) => String(a.state?.boardId ?? '') === bid
      }
    })
    this.게시판필터그룹.options = [
      { label: '전체', value: '전체', match: () => true },
      ...opts
    ]
  }

  /**
   * URL `boardId` 쿼리 → 게시판 축의 선택값.
   *
   * 예전엔 여기서 `그룹.selected`에 직접 썼다. 선택의 소유자가 뷰로 옮겨갔으므로(`i필터라디오그룹`)
   * repo는 **값을 계산해 돌려줄 뿐**이고, 목록5에 물리는 건 페이지(`member-posts`)의 몫이다.
   */
  게시판필터값FromBoardId(boardId: string | null | undefined): string {
    if (!boardId) return '전체'
    const bid = String(boardId)
    return this.게시판필터그룹.options.some(o => o.value === bid) ? bid : '전체'
  }

  /** URL `boardSlug` 쿼리 → 게시판 축의 선택값 (`boardId`가 있으면 그쪽이 우선) */
  게시판필터값FromBoardSlug(slug: string | null | undefined): string {
    const s = slug?.trim()
    if (!s) return '전체'
    const b = model게시판s.getInstance().getBy슬러그(s)
    if (!b) return '전체'
    return this.게시판필터값FromBoardId(String(b.stateId ?? ''))
  }

  /** @deprecated selected가 boardId(value)이므로 그대로 반환. 호환용 */
  filterBoardIdForLabel(selectedOrLabel: string): string | undefined {
    if (this.boardFilterLabelByBoardId.has(selectedOrLabel)) return selectedOrLabel
    for (const [bid, lab] of this.boardFilterLabelByBoardId) {
      if (lab === selectedOrLabel) return bid
    }
    return undefined
  }

  /**
   * 한 줄 지시 → 초안 한 벌. **글을 만들지도 저장하지도 않는다.**
   *
   * 행이 아니라 저장소에 있는 이유: 새 글은 아직 행이 아니다. 공개 글쓰기 화면(`/boards/{슬러그}/write`)은
   * 제목·본문을 ref로 들고 있다가 등록할 때 비로소 행이 되므로, 채울 값만 받아 갈 창구가 필요하다.
   * 행이 이미 있는 쪽(관리 폼)은 행의 `doAI초안`이 이걸 불러 자기 필드에 적는다.
   *
   * 실패는 `null`이다 — 부르는 쪽이 폼을 건드리지 않고 안내만 하면 된다.
   *
   * `현재`를 주면 새로 쓰는 게 아니라 그 글을 고쳐 쓴다. 이어 수정("더 짧게")이 성립하는 자리다.
   */
  async doAI초안(
    지시: string,
    게시판?: model게시판 | null,
    현재?: { 제목?: string, 본문?: string } | null
  ): Promise<{ 제목: string, 본문: string } | null> {
    const q = String(지시 ?? '').trim()
    if (!q || import.meta.server) return null

    const res = await $fetch<{ json: { 제목?: string, 본문?: string } | null }>('/api-etc/ai/chat', {
      method: 'POST',
      body: {
        system: `${AI초안지침}\n\n[지금] ${지금표기()}${게시판맥락(게시판)}\n${현재글블록(현재)}`,
        level: AI초안모델단계,
        schema: AI초안스키마,
        messages: [{ role: 'user', text: q }]
      }
    })

    const 제목 = String(res?.json?.제목 ?? '').trim()
    const 본문 = 초안본문md(res?.json?.본문)
    return 제목 || 본문 ? { 제목, 본문 } : null
  }

  static getInstance = () => getRepoInstance('model회원게시글s', () => new model회원게시글s())

  private constructor() {
    super(model회원게시글, 'member-posts')
  }

  override _generate = () => new model회원게시글().generate()
  override _init = () => new model회원게시글().init()
  protected override seed = i회원게시글seed

  /**
   * seed를 올린 뒤 두 가지를 **서버가 매긴 값 위에** 다시 얹는다. 둘 다 POST 한 번으로는 안 되는 것들이다.
   *
   * 1. `boardId` — 시드에 적힌 값은 게시판 시드의 선언 id(1001~1004)다. 게시판을 손으로 지웠다
   *    다시 만든 DB에서는 어긋나는데, 어긋나도 에러 없이 **글이 통째로 안 보이기만** 한다.
   *    슬러그로 다시 맞춘다.
   * 2. `createdAt`·`updatedAt` — 서버가 create에서 "지금"으로 덮어쓴다(`db_low.withCreateMeta`).
   *    그대로 두면 모든 행의 작성일이 같아져 최신순 정렬도, 목록 화면도 의미가 없어진다.
   *
   * PUT(`db_low.BulkUpdate`)은 보낸 필드를 그대로 얹으므로 이 되돌리기가 통한다.
   */
  /**
   * 시드의 `boardCode`·`작성자code`를 실제 PK로 바꾼다. **DB를 뒤지지 않는다** —
   * `useSystem`이 의존 순서대로 훑으면서 앞 표를 만들 때 남겨둔 `시드PK` 등록부에서 꺼낸다.
   * 그래서 `code`는 DB 열일 필요가 없다(`역할.code`·`등급.code`는 앱이 읽는 값이라 별개다).
   *
   * 못 찾아도 행을 **떨어뜨리지 않는다** — 글 본문이 통째로 사라지는 편이 더 나쁘고,
   * `do초기데이터`의 뒤처리가 선언 순서에 1:1로 기대므로 개수가 변하면 안 된다.
   * 대신 빈 FK로 나가면 DB가 거부하므로(`member-posts_memberId_fkey`) 경고를 남긴다.
   */
  protected override async seed해소(rows: i회원게시글dto[]): Promise<i회원게시글dto[]> {
    return rows.map((row) => {
      const { boardCode, 작성자code, ...rest } = row as i회원게시글dto & { boardCode?: string, 작성자code?: string }

      // 못 찾으면 **빈 문자열이 아니라 null**이다. `''`를 bigint 열에 보내면
      // `invalid input syntax for type bigint: ""`로 터진다(실측).
      const boardId = boardCode ? 시드PK.찾기('boards', boardCode) : null
      const memberId = 작성자code ? 시드PK.찾기('members', 작성자code) : null

      // 게시판 없는 글은 어느 화면에도 안 뜬다 — 조용히 글 전부를 미아로 넣느니 여기서 멈춘다.
      if (boardCode && !boardId) {
        throw new Error(
          `[게시글 seed] 게시판 '${boardCode}'가 시드PK 등록부에 없다.`
          + ` 게시판이 이전 실행에서 이미 채워졌다면 등록부가 비어 있다 —`
          + ` 게시판·회원을 함께 비우고 초기데이터를 한 번에 돌릴 것.`
        )
      }
      if (작성자code && !memberId) console.warn(`[게시글 seed] 회원 '${작성자code}'가 등록부에 없음 — 작성자 없이 넣는다`)

      return { ...rest, boardId, memberId } as unknown as i회원게시글dto
    })
  }

  override async do초기데이터(opts?: { skipConfirm?: boolean, ensureRead?: boolean }) {
    const 만든s = await super.do초기데이터(opts)
    if (!만든s?.length) return 만든s

    // FK(`boardId`)는 `seed해소`가 넣기 전에 채웠다. 여기 남은 건 **서버가 덮어쓴 시각**뿐이다 —
    // `db_low.withCreateMeta`가 `createdAt`을 `new Date()`로 박으므로 시드의 날짜가 지워진다.
    const 고칠s: model회원게시글[] = []
    // `creates`는 넘긴 순서대로 돌려주므로 시드 선언 순서와 1:1이다.
    // **비교하지 않고 늘 되돌린다.** `creates` 가 돌려준 모델의 state 는 서버 응답이 아니라 보낸 값을 들고 있어서
    // (`createdAt` 이 이미 시드 값) 「다르면 고친다」 는 늘 거짓이었다 — 그래서 시드 날짜가 한 번도 안 들어갔다(2026-09-15 실측).
    만든s.forEach((row, i) => {
      const 시드 = i회원게시글seed[i]
      if (시드) {
        row.state.createdAt = 시드.createdAt
        row.state.updatedAt = 시드.updatedAt
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

  override async empty(m = this._init()) {
    if (import.meta.server) {
      return super.empty(m)
    }
    // `repo.options`를 그대로 쓴다. 직접 map 하던 예전 코드는 value가 `String(b.id)`였는데
    // `id`는 모델이 아니라 dto의 열이라(모델 쪽은 `stateId`) 모든 항목의 value가 'undefined'였다.
    const boardItems = toValue(model게시판s.getInstance().options)
    const memberItems = toValue(model회원s.getInstance().options)
    if (!boardItems.length) {
      useAlert().show('데이터 없음', '게시판 목록이 있어야 새 글을 추가할 수 있습니다.')
      return
    }
    const canMemberWrite = memberItems.length > 0
    const pick = (v: unknown) =>
      typeof v === 'object' && v && 'value' in v
        ? String((v as { value: string }).value)
        : String(v ?? '')
    const modal = useModalFields()
    const result = await modal.open({
      title: '회원 게시글 추가',
      description: '게시판과 작성자(회원/비회원)를 선택하세요',
      wholeRandom: {
        label: '전체 랜덤',
        fill: () => ({
          boardId: pick1(boardItems).value,
          authorIsGuest: !canMemberWrite || Math.random() < 0.5 ? 'true' : 'false',
          memberId: canMemberWrite ? pick1(memberItems).value : '',
          guestName: `방문자${randomN(1, 99)}`,
          guestPassword: String(randomN(1000, 9999))
        })
      },
      steps: [
        {
          key: 'boardId',
          kind: 'select',
          label: '게시판',
          items: boardItems,
          required: true
        },
        {
          key: 'authorIsGuest',
          kind: 'select',
          label: 'is비회원',
          items: canMemberWrite
            ? [
                { label: '회원', value: 'false' },
                { label: '비회원', value: 'true' }
              ]
            : [{ label: '비회원', value: 'true' }],
          required: true
        },
        {
          key: 'memberId',
          kind: 'select',
          label: '작성 회원',
          items: memberItems,
          required: false
        },
        {
          key: 'guestName',
          kind: 'input',
          label: '비회원 이름',
          defaultValue: '',
          placeholder: 'guestName',
          trim: true,
          required: false
        },
        {
          key: 'guestPassword',
          kind: 'input',
          label: '비회원 비밀번호',
          defaultValue: '',
          placeholder: 'guestPassword',
          trim: true,
          required: false
        }
      ]
    })
    if (!result) return
    const isGuest = pick(result.authorIsGuest).trim() === 'true'
    const memberId = pick(result.memberId).trim()
    const guestName = String(result.guestName ?? '').trim()
    const guestPassword = String(result.guestPassword ?? '').trim()
    if (isGuest && (!guestName || !guestPassword)) {
      useAlert().show('비회원 정보 필요', '비회원 글쓰기는 guestName과 guestPassword가 필요합니다.')
      return
    }
    const now = new Date().toISOString()
    return await super.empty({
      ...this._init(),
      ...m,
      boardId: pick(result.boardId),
      isGuest,
      memberId: memberId || null,
      guestName: guestName || null,
      guestPassword: guestPassword || null,
      thumbnail: m.thumbnail ?? null,
      isPublished: m.isPublished ?? true,
      createdAt: now,
      updatedAt: now
    })
  }

  /** 특정 게시판 글만 (작성일 내림차순) */
  private 최신순 = (a: model회원게시글, b: model회원게시글) =>
    String(b.state.createdAt ?? '').localeCompare(String(a.state.createdAt ?? ''))

  getsBy게시판 = (게시판: model게시판) =>
    toValue(this.list)
      .filter(row => row.게시판?.isSame(게시판))
      .sort(this.최신순)

  /** 특정 회원이 작성한 글만 (작성일 내림차순) */
  getsBy회원 = (회원: model회원) =>
    toValue(this.list)
      .filter(row => row.회원?.isSame(회원))
      .sort(this.최신순)

  /**
   * 글을 다른 게시판으로 옮긴다.
   *
   * 폼의 게시판 선택기가 이 자리를 거쳐 간다. 예전엔 `boardId`가 그냥 문자 인풋이라 없는 id를 적어도
   * 저장까지 통과했고, 그 글은 어느 목록에도 안 뜨는 미아가 됐다(`getsBy게시판`이 실재하는 게시판만 잇는다).
   * 실재하는 게시판인지 여기서 한 번 확인한다.
   *
   * `do등급기록`처럼 **확인을 받고 즉시 저장한다.** 이 글은 게시판 상세의 게시글 목록
   * (`model게시판.회원게시글s` → `getsBy게시판`) 안에서 열려 있는데, 옮기는 순간 그 목록의 조건에서
   * 벗어나 카드가 눈앞에서 사라진다. 안 저장하고 두면 저장 버튼째로 사라진 미저장 행이 남는다.
   */
  do게시판이동 = (글: model회원게시글, to게시판id: string | number) => {
    const id = String(to게시판id ?? '').trim()
    if (!id || String(글.state?.boardId ?? '') === id) return
    const 게시판 = model게시판s.getInstance().getById(id)
    if (!게시판) {
      useAlert().show('게시판 없음', '고른 게시판을 찾을 수 없습니다. 목록을 새로고침한 뒤 다시 시도하세요.')
      return
    }
    const 이름 = 게시판.이름 || 게시판.슬러그 || String(게시판.stateId ?? '')
    if (!confirm(`"${글.제목 || '이 글'}"을 ${이름} 게시판으로 옮기시겠습니까? 바로 적용되고 이 목록에서 사라집니다.`))
      return
    글.state.boardId = String(게시판.stateId ?? '')
    return 글.do저장(false, false)
  }

  do작성 = async (p: {
    boardId: string
    isGuest?: boolean
    memberId?: string | null
    guestName?: string | null
    guestPassword?: string | null
    title: string
    body: string
    isPublished?: boolean
    thumbnail?: string | null
  }) => {
    const rawMemberId = p.memberId != null && String(p.memberId).trim() !== '' ? String(p.memberId).trim() : null
    const isGuest = typeof p.isGuest === 'boolean' ? (p.isGuest || !rawMemberId) : !rawMemberId
    const memberId = rawMemberId
    const guestName = String(p.guestName ?? '').trim()
    const guestPassword = String(p.guestPassword ?? '').trim()
    const now = new Date().toISOString()
    const dto: i회원게시글dto = {
      id: 'imsi' + Date.now(),
      boardId: String(p.boardId),
      isGuest,
      memberId,
      guestName: guestName || null,
      guestPassword: guestPassword || null,
      title: p.title.trim(),
      body: p.body.trim(),
      thumbnail: p.thumbnail ?? null,
      isPublished: p.isPublished ?? true,
      isFaq: false,
      createdAt: now,
      updatedAt: now,
      likes: 0,
      views: 0
    }
    const m = new model회원게시글(dto)
    // `add`가 돌려주는 건 목록에 실제로 실린 모델이다 — 서버가 발급한 id는 거기에만 붙는다.
    // 여기 `m`은 임시 id('imsi…')를 그대로 들고 있어서, 작성 직후 상세로 보내는 쪽이 길을 잃는다.
    return (await m.add(true)) ?? m
  }

  /**
   * 게시판 상세의 '+ 추가' — **지금 로그인한 운영자 명의로** 빈 글을 만든다.
   *
   * 예전엔 "작성 회원을 고르세요" 모달이 먼저 떴다. 관리 화면이 전지적 시점이니 작성자도 골라야 할 것
   * 같지만, 게시판 관리에서 글을 만드는 사람은 **지금 그 화면에 서 있는 운영자 자신**이다.
   * 답이 정해진 값을 물으면 아무나 찍게 되고 실제로 그렇게 됐다 — 이 표의 글 다섯 건이 회원 셋에게
   * 흩어져 붙어 있는데 전부 운영자가 만든 글이다.
   *
   * 남의 명의로 대신 쓰는 건 이 창구가 할 일이 아니다. 회원·비회원 글은 공개 게시판
   * (`/boards/{슬러그}/write`)에서 본인이 쓰고, 그 글의 작성자는 관리 화면에서도 못 바꾼다(표시만 한다).
   */
  async do빈생성_게시판관점(boardId: string) {
    const bid = String(boardId ?? '')
    if (!bid) {
      useAlert().show('게시판 필요', '게시판이 저장되어 있어야 새 글을 추가할 수 있습니다.')
      return
    }
    if (import.meta.server) return

    // `회원Id`는 계정(`users`)이 아니라 회원(`members`) 행의 id다 — 글이 잡는 축이 후자다.
    const 회원Id = String((await get인증()).회원Id ?? '').trim()
    const 운영자 = 회원Id ? model회원s.getInstance().getById(회원Id) : null
    if (!운영자) {
      useAlert().show(
        '작성자 확인 불가',
        '로그인한 계정에 연결된 회원 정보를 찾지 못했습니다. 다시 로그인한 뒤 시도하세요.'
      )
      return
    }

    // 만들어진 모델을 돌려준다 — 부르는 쪽이 새 글을 바로 열어 줄 수 있게.
    return this.do작성({
      boardId: bid,
      memberId: String(운영자.stateId ?? ''),
      title: '',
      body: ''
    }).then(async (글) => {
      await this.reads()
      return 글
    })
  }

  /** 회원 상세: 게시판·제목·본문을 모달로 받아 저장 */
  do빈생성_회원관점(작성자: { id: string | number | null, 이름: string }, config: { title?: string, description?: string } = {}) {
    const mid = String(작성자.id ?? '')
    if (!mid) return
    const repo = this
    const pick = (v: unknown) =>
      typeof v === 'object' && v && 'value' in v
        ? String((v as { value: string }).value)
        : String(v ?? '')
    void import('./model게시판').then(async ({ model게시판s }) => {
      if (import.meta.server) return
      // `empty()`와 같은 이유로 `options`를 쓴다 — 직접 map 하면 value가 'undefined'가 된다.
      const items = toValue(model게시판s.getInstance().options)
      if (!items.length) return
      const modal = useModalFields()
      const result = await modal.open({
        title: config.title ?? `${작성자.이름 || '회원'}님의 게시글`,
        description:
          config.description ?? '게시판을 고른 뒤 제목·본문을 입력하면 이 회원 명의로 저장됩니다',
        steps: [
          {
            key: 'boardId',
            kind: 'select',
            label: '게시판',
            items,
            required: true
          },
          {
            key: 'title',
            kind: 'input',
            label: '제목',
            defaultValue: '',
            placeholder: '제목',
            trim: true,
            required: true
          },
          {
            key: 'body',
            kind: 'input',
            label: '본문',
            defaultValue: '',
            placeholder: '본문',
            trim: true,
            required: true
          }
        ]
      })
      if (!result) return
      const title = String(result.title ?? '').trim()
      const body = String(result.body ?? '').trim()
      if (!title || !body) return
      void repo
        .do작성({
          boardId: pick(result.boardId),
          memberId: mid,
          title,
          body
        })
        .then(() => repo.reads())
    })
  }
}

export class model회원게시글 extends BaseModel2<i회원게시글dto> implements i회원게시글 {
  constructor(state?: i회원게시글dto) {
    super(model회원게시글s.getInstance(), state)
  }

  override 자동필드ss = [
    {
      label: '기본',
      list: [
        { key: 'id', label: 'ID', props: { readonly: true }, canEdit: false, show: false },
        // 게시판 ID를 사람이 타이핑하던 칸 → 선택기. 값 쓰기는 repo의 `do게시판이동`이 맡는다.
        {
          key: '게시판Id',
          label: '게시판',
          type: 타입지정.선택0,
          options: computed(() => toValue(model게시판s.getInstance().options)),
          show: true
        },
        // 작성자는 **읽기 전용**이다. 새 글은 세션 운영자 명의로 생기고(`do빈생성_게시판관점`),
        // 이미 올라온 글은 공개 게시판에서 본인이 쓴 것이라 관리자가 명의를 갈아끼울 자리가 아니다.
        { key: '작성자표시', label: '작성자', canEdit: false, props: { readonly: true }, show: true },
        { key: '게스트명', label: '비회원명', show: computed(() => this.is비회원), canEdit: computed(() => this.is비회원) },
        { key: '게스트비밀번호', label: '비밀번호', show: computed(() => this.is비회원), canEdit: computed(() => this.is비회원) },
        { key: '제목', label: '제목', show: true },
        { key: '공개', label: '공개', type: 타입지정._.is체크, show: true },
        // 질문·답변 형식 게시판(Q&A)에서만 뜻이 있다.
        {
          key: 'is자주',
          label: '자주 묻는 질문',
          type: 타입지정._.is체크,
          show: computed(() => this.게시판?.표시형식 === 'FAQ')
        },
        { key: '작성일시', label: '작성일', show: true },
        { key: '수정일시', label: '수정일', show: true }
      ]
    },
    {
      label: '본문·이미지',
      config: { ratio: 30 },
      list: [
        {
          key: '이미지',
          label: '썸네일',
          show: true,
          is한줄: false,
          type: 타입지정.이미지2
        },
        { key: '본문', label: '본문', type: 타입지정._.문자md, is한줄: false, show: true }
      ]
    },
    {
      label: '댓글',
      config: { ratio: 30 },
      list: [
        {
          key: '회원댓글s',
          label: '댓글',
          type: 타입지정._.카드s,
          show: true,
          is한줄: false,
          props: {
            do빈생성: () =>
              void model회원댓글s.getInstance().do빈생성_대상관점('member_posts', String(this.stateId ?? ''), {
                title: '이 게시글에 댓글',
                description: '댓글 작성자(회원)를 선택하세요'
              })
          }
        }
      ]
    }
  ]

  override 자동버튼s = this.기본버튼s.concat([
    {
      key: 'doAI초안',
      label: 'AI 초안',
      icon: 'i-lucide-wand-sparkles',
      show: true
    },
    {
      key: 'do발행',
      label: '발행',
      icon: 'i-lucide-send',
      /**
       * 올릴 것이 있을 때만. 이 조건이 챗봇 쪽에서 특히 값을 한다 — 빈 폼을 열어둔 채 "발행해"라고
       * 하면 버튼이 아예 안 붙고, 답변도 "무엇을 올릴지 먼저 쓰라"는 쪽으로 흐른다.
       * 이미 올라간 글에서는 고친 것을 다시 올리는 뜻이 된다.
       */
      show: computed(() => Boolean(this.제목.trim() && this.본문텍스트.trim()))
    },
    {
      key: 'do가짜댓글추가',
      label: '가짜댓글추가',
      icon: 'i-ph-dice-three-light',
      show: true
    }
  ])

  bindModel = null as any
  override afterCreate = () => {}
  override beforeSave = async () => {
    if (!this.is비회원 && !this.회원Id) {
      useAlert().show('회원id가 필요합니다.')
      return false
    } else if (this.is비회원 && this.회원Id) {
      useAlert().show('회원은 비회원 글쓰기를 할 수 없어요.')
      return false
    }
    await this.do썸네일자동()
  }

  /**
   * 이 글의 제목·본문을 AI로 쓴다. **저장하지 않는다** — 확인하고 저장하는 건 사람이다.
   *
   * 이미 쓰여 있는 게 있으면 그건 지울 것이 아니라 **재료**다. 그대로 프롬프트에 실어 고쳐 쓴다
   * ("더 짧게", "일시만 바꿔"). 그래서 덮어쓰기를 묻지 않는다 — 물어야 할 것은 덮어쓸지가 아니라
   * 무엇으로 고칠지이고, 그건 지시로 이미 왔다.
   *
   * 지시도 없고 쓰여 있는 것도 없을 때만 모달로 묻는다. 버튼(`자동버튼s`)만 누른 경우가 그렇다 —
   * 행동 버튼은 인자를 넘길 자리가 없다(`i행동버튼.onClick`). 제목만이라도 쳐뒀다면 그게 지시다.
   */
  doAI초안 = async (지시?: string) => {
    if (import.meta.server) return

    // 본문의 유무는 평문으로 본다 — 편집기는 빈 문단도 값으로 내놓는다(md 로는 빈 줄).
    const 현재 = { 제목: this.제목.trim(), 본문: this.본문텍스트.trim() ? this.본문 : '' }
    const has내용 = Boolean(현재.제목 || 현재.본문)

    let q = String(지시 ?? '').trim()
    if (!q && !has내용) {
      q = (await useModalInput().open('무슨 내용으로 쓸까요?', ''))?.trim() ?? ''
      if (!q) return
    }

    try {
      const 초안 = await model회원게시글s.getInstance().doAI초안(
        // 쓰여 있는 것만 있고 지시가 없으면, 시킨 일은 "이걸 마저 써라"다.
        q || '지금 쓰여 있는 글을 다듬어 완성해라.',
        this.게시판,
        has내용 ? 현재 : null
      )
      if (!초안) {
        useAlert().error('초안 실패', '초안을 만들지 못했습니다. 지시를 조금 더 구체적으로 적어주세요.')
        return
      }
      if (초안.제목) this.제목 = 초안.제목
      if (초안.본문) this.본문 = 초안.본문
      useAlert().log(has내용 ? '고쳐 썼습니다' : '초안을 채웠습니다', '확인하고 저장하세요.')
    } catch {
      useAlert().error('초안 실패', '잠시 후 다시 시도해주세요.')
    }
  }

  /**
   * 저장 직전, 썸네일이 비어 있으면 제목·본문을 보고 Unsplash에서 한 장 골라 채운다.
   * 그림을 만들지 않는다 — 찍혀 있는 사진 중에서 고른다(`/api-etc/ai/pick_thumbnail`).
   *
   * **이미 그림이 있으면 손대지 않는다.** 사람이 고른 것을 기계가 덮으면 안 되고,
   * 그래서 다시 고르게 하는 방법도 명확하다 — 썸네일을 비우고 저장하면 된다.
   *
   * 관리자 저장에서만 돈다. 공개 글쓰기(`/boards/{슬러그}/write`)는 비회원도 열려 있어서
   * 여기까지 열면 글 한 건마다 모델 호출 두 번이 아무에게나 붙는다.
   *
   * 실패는 삼킨다. 썸네일은 글의 부속이지 저장의 조건이 아니다.
   */
  private do썸네일자동 = async () => {
    if (import.meta.server) return
    if (this.이미지) return
    // 사진·영상 글의 그림은 그 사진·영상이다 — 풍경 사진을 골라 붙이면 카드가 엉뚱해진다(`대표썸네일`).
    if (this.본문사진s.length || this.대표영상) return

    if (!toValue((await get인증()).is관리자)) return

    const 제목 = this.제목.trim()
    const 본문 = this.본문.trim()
    if (!제목 && !본문) return

    try {
      const r = await $fetch<{ thumbnail: string | null, query?: string, reason?: string }>(
        '/api-etc/ai/pick_thumbnail',
        { method: 'POST', body: { title: 제목, body: 본문, orientation: 'landscape' } }
      )
      if (!r?.thumbnail) return
      this.이미지 = r.thumbnail
      useAlert().log('썸네일 자동 선택', `Unsplash · "${r.query ?? ''}"`)
    } catch {
      // 썸네일을 못 골랐다고 저장을 막지 않는다
    }
  }

  override afterSave = () => {
    this.state.updatedAt = new Date().toISOString()
  }

  get _config이미지() {
    return {
      props: {
        tags: ['member-post'],
        count: 4,
        orientation: 'landscape' as const
      },
      getter: () => this.이미지,
      setter: (_model: model회원게시글, v: string | null) => {
        this.이미지 = v
      }
    }
  }

  override get label() {
    return this.state?.title ?? ''
  }

  _게시판 = computed(() => {
    const bid = String(this.state?.boardId ?? '')
    if (!bid) return null
    return model게시판s.getInstance().getById(bid) ?? null
  })

  get 게시판() {
    return toValue(this._게시판)
  }

  _회원 = computed(() => {
    const mid = String(this.state?.memberId ?? '')
    if (!mid) return null
    return model회원s.getInstance().getById(mid) ?? null
  })

  get 회원() {
    return toValue(this._회원)
  }

  /** 부제: 어떤 게시판 · 누가 작성 (목록 보조 라인) */
  override get sub() {
    const 판
      = this.게시판?.이름?.trim()
        || this.게시판?.슬러그?.trim()
        || (this.게시판Id ? `게시판#${this.게시판Id}` : '게시판 미지정')
    return `${판} · ${this.작성자표시}`
  }

  get 게시판Id() {
    return String(this.state?.boardId ?? '')
  }

  /** 폼의 게시판 선택기가 물리는 자리 — 실재 확인·확인창·즉시 저장은 repo가 한다. */
  set 게시판Id(v: string) {
    void model회원게시글s.getInstance().do게시판이동(this, v)
  }

  /**
   * 작성자를 사람이 읽는 한 줄로. 폼과 `sub`가 같은 규칙을 쓰게 하려고 한 자리에 모았다.
   *
   * 세터가 없는 게 요점이다 — `is비회원`·`회원Id`는 계속 남아 읽는 쪽(공개 게시판의 `can편집즉시`,
   * 비번게이트)이 쓰지만, 관리 화면에서 명의를 갈아끼우는 창구는 두지 않는다.
   */
  get 작성자표시(): string {
    return (
      this.회원?.이름?.trim()
      || (this.회원Id ? `회원#${this.회원Id}` : '')
      || this.게스트명
      || (this.is비회원 ? '비회원' : '작성자 미지정')
    )
  }

  get 회원Id() {
    const v = this.state?.memberId
    if (v == null || String(v).trim() === '') return null
    return String(v)
  }

  set 회원Id(v: string | null) {
    const mid = v != null && String(v).trim() !== '' ? String(v).trim() : null
    this.state.memberId = mid
  }

  get is비회원() {
    return Boolean(this.state?.isGuest)
  }

  set is비회원(v: boolean) {
    this.state.isGuest = Boolean(v)
  }

  get 게스트명() {
    return String(this.state?.guestName ?? '')
  }

  set 게스트명(v: string) {
    if (!this.is비회원) return
    const n = String(v ?? '').trim()
    this.state.guestName = n || null
  }

  get 게스트비밀번호() {
    return String(this.state?.guestPassword ?? '')
  }

  set 게스트비밀번호(v: string) {
    if (!this.is비회원) return
    const n = String(v ?? '').trim()
    this.state.guestPassword = n || null
  }

  get 제목() {
    return this.state?.title ?? ''
  }

  set 제목(v: string) {
    this.state.title = v
  }

  get 본문() {
    return this.state?.body ?? ''
  }

  set 본문(v: string) {
    this.state.body = v
  }

  /**
   * 검색·발췌가 읽는 평문 본문. 저장되는 건 언제나 `본문`(md 원문)이고 이건 파생값이다.
   * `computed`로 캐시하는 게 요점 — 목록 검색은 입력 한 글자마다 전 행을 훑으므로
   * 매번 8만 자에 정규식을 돌리면 그대로 체감된다.
   */
  _본문텍스트 = computed(() => md평문(this.본문))
  get 본문텍스트() {
    return toValue(this._본문텍스트)
  }

  /**
   * 본문에 편집기 유튜브 블록으로 넣은 영상들(`~utils` 의 `본문영상s`). **영상 전용 표가 없다** —
   * 홈의 영상 칸이든 모아보기든 게시글 목록에서 이게 빈 글을 거르면 된다.
   */
  _영상s = computed(() => 본문영상s(this.본문))
  get 영상s() {
    return toValue(this._영상s)
  }

  get 대표영상() {
    return this.영상s[0] ?? null
  }

  /** 본문에 넣은 사진들(`~utils` 의 `본문사진s`). 영상과 같은 자리·같은 이유다. */
  _본문사진s = computed(() => 본문사진s(this.본문))
  get 본문사진s() {
    return toValue(this._본문사진s)
  }

  /**
   * 목록·카드가 그리는 그림. 사람이 넣은 썸네일이 먼저고, 없으면 본문 첫 사진, 그다음 첫 영상의 유튜브 썸네일.
   * 저장값(`이미지`)에 본문 그림을 써 넣지 않는다 — 사진·영상을 빼고 저장했을 때 그림이 남으면 안 된다.
   */
  get 대표썸네일() {
    return this.이미지 || this.본문사진s[0]?.src || this.대표영상?.썸네일 || ''
  }

  /** `m/List` 카드·행이 보는 자리. 게시판 목록(`boards/[boardType]/index.vue`)이 `대표썸네일` 을 쓰는 것과 같은 값. */
  override get thumbnail() {
    return this.대표썸네일 || undefined
  }

  get 이미지() {
    return this.state?.thumbnail ?? ''
  }

  set 이미지(v: string | null) {
    this.state.thumbnail = v
  }

  get 공개() {
    return this.state?.isPublished ?? true
  }

  set 공개(v: boolean) {
    this.state.isPublished = v
  }

  get is자주() {
    return this.state?.isFaq ?? false
  }

  set is자주(v: boolean) {
    this.state.isFaq = Boolean(v)
  }

  _작성일시 = computed(() => mDayjs(this.state?.createdAt))
  get 작성일시() {
    return toValue(this._작성일시)
  }

  _수정일시 = computed(() => mDayjs(this.state?.updatedAt))
  get 수정일시() {
    return toValue(this._수정일시)
  }

  get 좋아요수() {
    const n = Number(this.state?.likes ?? 0)
    return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0
  }

  set 좋아요수(v: number) {
    const n = Number(v)
    this.state.likes = Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0
  }

  get 조회수() {
    const n = Number(this.state?.views ?? 0)
    return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0
  }

  set 조회수(v: number) {
    const n = Number(v)
    this.state.views = Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0
  }

  get 회원댓글s(): model회원댓글[] {
    return model회원댓글s.getInstance().getsBy대상('member_posts', String(this.state?.id ?? ''))
  }

  /**
   * 공개 게시판(`/boards/*`)의 수정·삭제 자격. 관리자 화면은 `is관리자`로 이미 갈리므로 여기 규칙은
   * 프론트 쪽 글쓰기를 위한 것이다.
   *
   * 자격을 세 갈래로 나눈 이유: **비밀번호가 필요 없는 사람**(관리자·본인)과 **비밀번호를 맞히면
   * 되는 사람**(비회원 글)은 화면 흐름이 다르다. 앞은 바로 편집기로 들어가고, 뒤는 게이트를 거친다.
   * 그래서 `can편집즉시`(게이트 없이)와 `can편집시도`(버튼을 보여도 되는가)를 따로 둔다.
   */
  can편집즉시(ctx: { 회원Id?: string | null, is관리자?: boolean } = {}) {
    if (ctx.is관리자) return true
    const 나 = String(ctx.회원Id ?? '').trim()
    return Boolean(나) && !this.is비회원 && this.회원Id === 나
  }

  /** 비회원 글은 비밀번호가 있어야 창구가 열린다 — 비어 있으면(시드 등) 관리자만 손댈 수 있다. */
  get is비번게이트() {
    return this.is비회원 && this.게스트비밀번호.trim() !== ''
  }

  is비번일치(입력: string) {
    const pw = this.게스트비밀번호.trim()
    return pw !== '' && String(입력 ?? '').trim() === pw
  }

  /** 수정·삭제 버튼을 띄워도 되는가. 비회원 글은 이 뒤에 `is비번일치`가 한 번 더 선다. */
  can편집시도(ctx: { 회원Id?: string | null, is관리자?: boolean } = {}) {
    return this.can편집즉시(ctx) || this.is비번게이트
  }

  /**
   * 제목·본문 수정 저장.
   * `afterSave`도 `updatedAt`을 찍지만 그건 저장이 끝난 뒤라 서버로 안 실린다 — 그래서 여기서 먼저 찍는다.
   */
  /**
   * 이 글을 게시판에 올린다. 새 글이면 만들고, 이미 있는 글이면 고친 것을 저장한다.
   *
   * **화면의 등록 버튼과 챗봇의 발행 버튼이 같은 코드여야 한다**는 게 이 메서드가 있는 이유다.
   * 검증(제목·본문·신원)이 글쓰기 화면 안에만 있으면 챗봇에서 부를 때 그 검증이 통째로 빠진다.
   * 여기 두면 어느 문으로 들어오든 같은 규칙이 서고, `show`가 거짓인 동안엔 챗봇이 버튼을
   * 제안조차 하지 않는다 — 빈 폼에 "발행하시겠습니까"라고 묻는 일이 없어진다.
   *
   * 새 글은 `add`가 만든다(`create`는 목록에 싣고 POST까지 한다). 돌아오는 건 목록에 실린 모델이라
   * 서버가 발급한 id가 거기 붙는다 — 이 인스턴스는 임시 id를 든 채로 남으므로 이동은 그쪽으로 한다.
   */
  do발행 = async (): Promise<boolean> => {
    if (import.meta.server) return false

    const 제목 = this.제목.trim()
    if (!제목) {
      useAlert().show('알림', '제목을 입력해주세요.')
      return false
    }
    // 편집기는 빈 문단도 값으로 내놓으므로(md 로는 빈 줄) 평문으로 본다.
    if (!this.본문텍스트.trim()) {
      useAlert().show('알림', '본문을 입력해주세요.')
      return false
    }
    if (!this.게시판Id) {
      useAlert().show('알림', '어느 게시판에 올릴지 정해지지 않았습니다.')
      return false
    }
    if (this.is비회원) {
      if (!this.게스트명.trim() || !this.게스트비밀번호.trim()) {
        useAlert().show('알림', '비회원은 이름과 비밀번호를 모두 입력해야 합니다.')
        return false
      }
    }
    // 로그인은 됐는데 `members` 행이 없는 계정. 그대로 올리면 비번도 주인도 없는 글이 되어
    // 본인조차 고칠 수 없다.
    else if (!this.회원Id) {
      useAlert().error('작성 불가', '회원 정보를 찾을 수 없습니다. 다시 로그인해주세요.')
      return false
    }

    this.제목 = 제목
    const 경로 = this.게시판?.경로 ?? ''

    try {
      // 이미 있는 글이면 고친 것을 저장한다. `do수정`이 `updatedAt`을 찍고 `do저장`으로 넘긴다.
      if (this.stateId) {
        const ok = await this.do수정()
        if (!ok) return false
        useAlert().log('발행했습니다', 제목)
        if (경로) await navigateTo(`${경로}/${encodeURIComponent(String(this.stateId))}`)
        return true
      }

      // 새 글. 화면을 열어둔 채 시간이 흘렀을 수 있으니 시각은 지금으로 다시 찍는다.
      const now = new Date().toISOString()
      this.state.createdAt = now
      this.state.updatedAt = now

      const 만들어진 = await this.add(true)
      const id = String(만들어진?.stateId ?? '')
      useAlert().log('발행했습니다', 제목)
      await model회원게시글s.getInstance().reads(false, true)
      if (경로) await navigateTo(id ? `${경로}/${encodeURIComponent(id)}` : 경로)
      return true
    } catch (error: any) {
      useAlert().error('발행 실패', error?.message ?? '잠시 후 다시 시도해주세요.')
      return false
    }
  }

  do수정 = async (p: { 제목?: string, 본문?: string, 공개?: boolean, 썸네일?: string | null } = {}) => {
    if (p.제목 !== undefined) this.제목 = p.제목.trim()
    if (p.본문 !== undefined) this.본문 = p.본문
    if (p.공개 !== undefined) this.공개 = p.공개
    // 빈 문자열도 값이다 — 썸네일을 지운 것과 건드리지 않은 것(`undefined`)은 다르다.
    if (p.썸네일 !== undefined) this.이미지 = p.썸네일 || null
    this.state.updatedAt = new Date().toISOString()
    return await this.do저장(false, false)
  }

  do가짜댓글추가 = () => {
    const 대상Id = String(this.state?.id ?? '')
    if (!대상Id || import.meta.server) return
    void (async () => {
      const repo = model회원댓글s.getInstance()
      for (let i = 0; i < randomN(1, 4); i++) {
        await repo.do작성({
          대상타입: 'member_posts',
          대상Id,
          회원Id: null,
          작성자표시: `방문자${randomN(1, 99)}`,
          내용: sample댓글본문()
        })
      }
      await repo.reads()
    })()
  }

  override generate() {
    const boards = toValue(model게시판s.getInstance().list)

    const stateBoardId = this.state?.boardId != null ? String(this.state.boardId).trim() : ''
    const stateGuestName = this.state?.guestName != null ? String(this.state.guestName).trim() : ''
    const stateGuestPassword
      = this.state?.guestPassword != null ? String(this.state.guestPassword).trim() : ''

    const boardFromList = stateBoardId
      ? boards.find((b: model게시판) => String(b.stateId ?? '') === stateBoardId)
      : boards.length
        ? pick1(boards)
        : null

    const boardId = stateBoardId
      ? stateBoardId
      : boardFromList
        ? String(boardFromList.stateId ?? '')
        : ''

    const isGuest = true
    const resolvedMemberId = null
    const guestName = stateGuestName || `방문자${randomN(1, 99)}`
    const guestPassword = stateGuestPassword || '0000'// String(randomN(1000, 9999));

    const slugFromBoard = boardFromList?.슬러그?.trim() ?? ''
    const catalogGroup = sample게시글(slugFromBoard)
    const boardType: i게시판ID = catalogGroup.presetKey
    const sample = pick1(catalogGroup.posts)

    const resolveType = (): i게시글타입 => {
      if (sample.preferredType) return sample.preferredType
      if (boardType === 'docs') return Math.random() < 0.35 ? 'download' : 'content'
      if (boardType === 'news') return Math.random() < 0.45 ? 'link' : 'content'
      return Math.random() < 0.18 ? 'link' : 'content'
    }
    const type = resolveType()

    const title = sample.title
    const description = sample.description
    // 게시판은 최근 글이 촘촘하고, 사람이 새벽 4시에 글을 올리진 않는다.
    const posted = randomDate({ from: '-150d', 쏠림: '최근', 시각: '활동시간' })
    const updated = randomDate({ from: posted, 쏠림: '최근', 시각: '활동시간' })
    const thumbSeed = randomN(1, 9999)
    const lead = `**${title}**\n\n${description}`
    const content
      = type === 'content' || type === 'download'
        ? (sample.body ?? `${lead}\n\n${generateEditorContent()}`)
        : null
    const fallbackLink
      = boardType === 'news'
        ? 'https://blog.naver.com/'
        : 'https://www.notion.so/product'
    const link = type === 'link' ? (sample.link ?? fallbackLink) : ''
    const body
      = type === 'link'
        ? `${lead}\n\n<${link}>`
        : (content ?? '')
    const thumbnail
      = boardType === 'news'
        ? `https://picsum.photos/seed/mp-${boardType}-${thumbSeed}/960/540`
        : null

    return {
      ...this.init(),
      boardId,
      isGuest,
      memberId: resolvedMemberId,
      guestName,
      guestPassword,
      title,
      body,
      thumbnail,
      isPublished: Math.random() >= 0.12,
      isFaq: boardType === 'qna' && Math.random() < 0.5,
      createdAt: posted.toISOString(),
      updatedAt: updated.toISOString(),
      likes: randomN(0, 240),
      views: randomN(8, 12000)
    }
  }

  override init() {
    const now = new Date().toISOString()
    return {
      boardId: '',
      isGuest: false,
      memberId: null,
      guestName: null,
      guestPassword: null,
      title: '',
      body: '',
      thumbnail: null,
      isPublished: true,
      isFaq: false,
      createdAt: now,
      updatedAt: now,
      likes: 0,
      views: 0
    }
  }
}

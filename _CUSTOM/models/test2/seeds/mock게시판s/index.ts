/**
 * 게시판 셋의 mock 카탈로그. (넷째였던 자료실은 `model자료` 로 옮겼다 — `seeds/model자료.seed` · 2026-09-14) **글 본문은 md 다**(`Input본문` 가 저장하는 그 형식).
 *
 * ## 2026-09-07 — 글을 줄이고 본문을 세웠다
 *
 * 51건이던 글을 **23건으로 줄이고 본문을 다시 썼다.** 줄인 게 목적이 아니라, 줄여야 본문을
 * 제대로 쓸 수 있어서다 — 51건일 때 본문은 전부 **한 문장짜리 문단 하나**였고, 그러면
 * 게시판 화면이 「목록은 되는데 글이 없는」 상태가 된다. 읽기 렌더러(`<MDC>`)도, 그걸
 * 대조 상대로 삼는 편집기(`m/Editor/Editor.vue`)도 **볼 게 없으면 안 깨진다.**
 * 없는 건 안 깨진다는 그 이유는 `~utils/mdc/samples` 머리말이 열 정렬·영상·목록을 넣을 때
 * 적은 것과 같다. 여기는 그걸 게시판에 대고 한 것이다.
 *
 * **어휘는 아껴 쓴다.** 사전(`~utils/mdc/blocks`)이 블록마다 「한 글에 하나만」을 적어 두었고,
 * 샘플이 그걸 어기면 그 문장이 거짓말이 된다. 그래서 글 하나에 `::` 는 한둘이고 나머지는
 * 문단·목록·표다. 표에는 열 정렬(`|:---:|`)을 값이 실제로 그렇게 읽히는 열에만 줬다.
 *
 * **`::list` 는 안 쓴다.** 앱을 읽어 그리는 유일한 어휘라 공개 게시판에서 목록이 비면
 * 「아직 없다」 상자가 뜨는데, 방문자에게는 그게 고장으로 보인다. 그 어휘의 견본 자리는
 * `~utils/mdc/samples` 의 과정 소개다.
 *
 * **`tags` 가 없어졌다.** 글과 댓글을 잇는 키라고 적혀 있었지만 **읽는 코드가 없었다** —
 * 댓글은 선언 순서로 글에 붙는다(`model게시판콘텐츠.seed`). 안 읽히는 필드는 지운다.
 */

import notice from './공지사항'
import qna from './묻고답하기'
import news from './소식업데이트'

export interface i댓글mock {
  body: string
  /**
   * **회원 댓글**이면 그 회원의 `code`(`model회원.seed`). 운영진 답변은 `'admin'`·담당자 code.
   * 없으면 비회원 댓글이다.
   */
  authorCode?: string
  /** 비회원 댓글의 이름. 없으면 시드가 `방문자12` 같은 이름을 만든다(`model게시판콘텐츠.seed`). */
  authorName?: string
}

export interface i게시글mock {
  title: string
  /** 목록의 「구분」 칸. 시드에서는 `description` 으로 넘어간다. */
  category: string
  /** 본문 **md**. 쓸 수 있는 `::` 어휘는 `~utils/mdc/blocks`. 사진은 `/img/seed/**` 만 쓴다(외부 스톡 사진 금지). */
  content: string
  /** 작성 회원의 `code`. 없으면 운영자(`'admin'`) — 공지·소식은 운영진 발행물이다. */
  author?: string
  /** **비회원 글**의 이름. 있으면 `author` 는 무시된다(Q&A 에 비회원이 묻는 글). */
  guestName?: string
  comments?: i댓글mock[]
}

export interface i게시판mock {
  label: string
  slug: string
  description: string
  pageIntro: { eyebrow: string, title: string, description: string }
  posts: i게시글mock[]
}

const 회원게시판목록ss: i게시판mock[] = [
  notice,
  qna,
  news
]

export default 회원게시판목록ss

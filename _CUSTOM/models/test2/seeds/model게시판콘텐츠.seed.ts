/**
 * 게시판 3개(공지·Q&A·소식)의 **글과 댓글** 시드. 건수는 `mock게시판s` 가 정한다(2026-09-15 기준 공지 15 · Q&A 20 · 소식 14~16). 자료실은 `model자료.seed` 로 갔다.
 *
 * 원본은 `mock게시판s` 카탈로그 — `model회원게시글.generate()`가 한 건씩 뽑아 쓰는 것과 같은 문장이다.
 * 그쪽이 "랜덤으로 한 줄"이라면 여기는 "게시판을 통째로 채운다". 문장을 여기 다시 적지 않고 카탈로그에서
 * 펴는 이유가 그것이다 — 두 벌로 갈라두면 한쪽만 고쳐지고 화면마다 다른 글이 뜬다.
 *
 * **글과 댓글이 한 파일에 있는 이유**: 댓글의 `commentableId`는 글에 매겨지는 id와 한 몸이다.
 * 둘을 갈라두면 같은 배정 규칙을 두 파일이 각자 재현해야 하고, 어긋나는 순간 댓글이 통째로
 * 미아가 된다(화면엔 아무 에러 없이 그냥 안 보인다).
 *
 * **FK 배선**: 시드는 PK를 적지 않는다 — `createDraft`가 `delete payload.id`를 하고 어댑터도
 * body의 id를 떼므로 여기 적어봐야 서버에 닿지 않는다. 그래서 글은 게시판을 `boardCode`로,
 * 댓글은 대상 글을 `대상code`로 가리키고, 실제 PK는 각 repo의 `seed해소`가 **넣기 전에** 채운다.
 *
 * 한때 슬러그·제목으로 엮었는데 **둘 다 화면에서 편집되는 값**이라 물렀다. 시드는 자기 표가
 * 비었을 때만 도니, 게시글 시드 시점에 게시판 슬러그가 이미 바뀌어 있을 수 있다.
 *
 * 예전엔 선언 id가 곧 발급 id라는 전제로 FK를 적고, 어긋날 때를 대비해 `do초기데이터`가
 * 나중에 UPDATE로 고쳤다. 쓰기가 두 배인 데다 병렬 배열(`*키s`)의 선언 순서에 기대는 방식이라
 * 한쪽만 손대면 조용히 어긋난다. 지금은 넣기 전에 맞으므로 그 뒤처리가 필요 없다.
 *
 * 날짜·조회수·좋아요는 제목 해시에서 뽑는다. 랜덤이면 시드를 돌릴 때마다 목록 순서가 바뀌어서
 * "어제 본 화면"과 대조가 안 된다.
 */

import type { i회원게시글시드 } from '../_basics/model회원게시글'
import type { i회원댓글시드 } from '../_basics/model회원댓글'
import 회원게시판목록ss from './mock게시판s'
import { i회원seed } from './model회원.seed'

/** 회원 댓글의 `authorName` — 앱도 회원 댓글에 쓴 시점의 회원 이름을 적는다(`boards/[boardType]/[id].vue` 의 댓글 작성). 비우면 「익명」 으로 보인다. */
const 회원이름By코드 = new Map(i회원seed.map(m => [m.code ?? '', m.name]))

/**
 * 운영자 발행물이라 작성자는 관리자 회원 고정 — `users.json`의 `admin@local.dev`가 가리키는 계정.
 *
 * **PK가 아니라 `code`로** 잡는다. 여기 적은 id는 서버에 안 닿기 때문이다: 예전엔 `'1001'`을
 * 박아 뒀는데 supabase가 identity로 1부터 매기자 그런 회원이 없어 `member-posts_memberId_fkey`
 * 위반이 났다. 이름으로 잡는 것도 안 된다 — `model회원s.options` 주석대로 이 도메인은 동명이인이
 * 흔하다. `code`는 DB가 `unique`로 지켜준다.
 */
const 작성자code = 'admin'

/** FNV-1a. 제목 한 줄에서 날짜·조회수를 뽑아내는 용도라 분포만 고르면 된다. */
const 해시 = (s: string): number => {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** `[min, max]` 안의 값을 씨앗에서 하나 뽑는다. */
const 범위 = (씨앗: number, min: number, max: number) => min + (씨앗 % (max - min + 1))

const 하루 = 24 * 60 * 60 * 1000
/**
 * 시드 기준 시각 — 2026-09-15 00:00 KST(데모의 「오늘」). 여기서 과거로 거슬러 올라가며 글을 놓는다.
 * 예전엔 09-01 이었는데 공지가 「9월 30일 마감 임박」·「9월 20일 점검」을 말하면서 날짜가 8월에 찍혀 앞뒤가 안 맞았다.
 */
const 기준시각 = Date.parse('2026-09-14T15:00:00.000Z')

/** 사람이 새벽 4시에 공지를 올리진 않는다 — 09~18시 사이로 떨군다(KST 기준). */
const 활동시각 = (ms: number, 씨앗: number) => {
  const d = new Date(ms)
  d.setUTCHours(범위(씨앗, 0, 9), 범위(씨앗 >>> 5, 0, 59), 범위(씨앗 >>> 11, 0, 59), 0)
  return d.toISOString()
}

type i펼친글 = {
  dto: i회원게시글시드
  댓글s: { body: string, authorCode?: string, authorName?: string }[]
}

const 펼친글s: i펼친글[] = []

for (const 게시판 of 회원게시판목록ss) {
  게시판.posts.forEach((post, j) => {
    const 씨앗 = 해시(post.title)
    // 목록 위쪽(j=0)이 가장 최근. 7일 간격 + 흔들림(0~3일)이라 글이 스물이어도 게시판 하나가 넉 달 남짓 안에 들어온다.
    // 흔들림이 간격보다 작아야 선언 순서(= 최신순)가 뒤집히지 않는다.
    const 작성ms = 기준시각 - (1 + j * 7 + 범위(씨앗, 0, 3)) * 하루
    const createdAt = 활동시각(작성ms, 씨앗)
    // 손댄 글만 수정일이 벌어진다(대략 셋 중 하나). 기준 시각은 넘지 않게 자른다.
    const updatedAt
      = 씨앗 % 3 === 0
        ? 활동시각(Math.min(작성ms + 범위(씨앗 >>> 3, 1, 5) * 하루, 기준시각 - 하루), 씨앗 >>> 7)
        : createdAt

    펼친글s.push({
      댓글s: post.comments ?? [],
      dto: {
        // 카탈로그의 slug는 게시판 시드의 `code`와 같은 값이다(그쪽에서 code=slug로 넣었다).
        // 여기서 굳는 문자열이라, 나중에 화면에서 슬러그를 고쳐도 이 참조는 안 흔들린다.
        code: `${게시판.slug}-${String(j + 1).padStart(2, '0')}`,
        boardCode: 게시판.slug,
        // 작성자는 mock 이 정한다 — 비회원 이름이 있으면 비회원 글, 아니면 회원 code(기본 운영자).
        작성자code: post.guestName ? '' : (post.author ?? 작성자code),
        isGuest: Boolean(post.guestName),
        guestName: post.guestName ?? null,
        guestPassword: post.guestName ? '0000' : null,
        title: post.title,
        body: post.content,
        // 썸네일 칸은 비운다 — 카드·홈의 표지는 본문 첫 사진이다(`model회원게시글.대표썸네일` → `본문대표그림`).
        // 예전엔 소식에만 picsum 무작위 그림을 박았는데, 글 내용과 무관한 그림이 표지를 가렸다.
        thumbnail: null,
        isPublished: true,
        // 운영진이 올린 Q&A 글(작성자 미지정)은 옛 「자주 묻는 질문」 게시판 글이다. 회원·비회원이 물은 글은 자주 묻는 질문이 아니다.
        isFaq: 게시판.slug === 'qna' && !post.author && !post.guestName,
        createdAt,
        updatedAt,
        likes: 범위(씨앗 >>> 13, 0, 48),
        // 오래된 글일수록 많이 읽혔다.
        views: 범위(씨앗 >>> 17, 40, 900) + j * 범위(씨앗 >>> 23, 20, 120)
      }
    })
  })
}

/** 게시글. `model회원게시글s.seed` */
export const i회원게시글seed: readonly i회원게시글시드[] = 펼친글s.map(x => x.dto)

type i펼친댓글 = { dto: i회원댓글시드 }

const 펼친댓글s: i펼친댓글[] = []

for (const 글 of 펼친글s) {
  const 작성ms = Date.parse(글.dto.createdAt)
  글.댓글s.forEach((댓글, k) => {
    const 씨앗 = 해시(`${글.dto.title}#${k}#${댓글.body}`)
    // 글이 올라온 뒤에 달리되, 기준 시각을 넘지 않게 자른다.
    const 달린ms = Math.min(작성ms + (1 + k * 2 + 범위(씨앗, 0, 3)) * 하루, 기준시각 - 하루)
    // `authorCode` 가 있으면 회원 댓글(이름은 회원 표가 말한다), 없으면 비회원 댓글.
    const is회원 = Boolean(댓글.authorCode)
    const 이름 = 댓글.authorName?.trim() || `방문자${범위(씨앗 >>> 3, 1, 99)}`

    펼친댓글s.push({
      dto: {
        대상code: 글.dto.code,
        ...(is회원 ? { 작성자code: 댓글.authorCode } : {}),
        commentableType: 'member_posts',
        isGuest: !is회원,
        memberId: null,
        authorName: is회원 ? (회원이름By코드.get(댓글.authorCode!) ?? '') : 이름,
        guestName: is회원 ? '' : 이름,
        guestPassword: is회원 ? '' : '0000',
        body: 댓글.body,
        // 기준 시각에 잘려 글과 같은 날이 되면 `활동시각` 이 시각을 새로 뽑아 글보다 앞설 수 있다 — 그땐 글 시각 뒤로 민다.
        createdAt: 달린ms - 작성ms < 하루
          ? new Date(작성ms + (k + 1) * 47 * 60 * 1000).toISOString()
          : 활동시각(달린ms, 씨앗 >>> 9)
      }
    })
  })
}

/** 댓글. `model회원댓글s.seed` */
export const i회원댓글seed: readonly i회원댓글시드[] = 펼친댓글s.map(x => x.dto)

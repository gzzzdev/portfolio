/**
 * 게시판 비교판 둘(`list`·`detail`)이 같이 보는 **표본**.
 *
 * ## 왜 실제 모델을 안 읽나
 *
 * `model회원게시글s` 는 로그인·권한을 타고, 로컬 DB 상태에 따라 목록이 통째로 비기도 한다.
 * 판이 그것 때문에 안 서면 「목록이 휑하다」가 디자인 탓인지 데이터 탓인지 못 가른다.
 * 그래서 값을 손으로 박되, **모양은 실제 행(`BoardRow`)을 그대로 따랐다** — 판이 진짜
 * `mBoards행` 을 물려 그리므로 여기 값이 실제와 어긋나면 판이 거짓말을 한다.
 *
 * ## 네 성격
 *
 * 게시판은 성격에 따라 첫 화면이 갈린다(`model게시판.표시형식`) — 공지는 시간순 목록,
 * 소식은 그림, FAQ는 그 자리에서 펼치는 답, 자료는 받아 가는 파일. **그 넷을 다 깔아 둔다.**
 * 정책 안을 하나 고르면 네 성격이 같이 어떻게 되는지가 이 판이 재는 값이다.
 */
import type { BoardRow } from '~/composables/useBoardFilter'
import type { i게시판표시형식 } from '~models/test2'

export interface i표본게시판 {
  형식: i게시판표시형식
  이름: string
  슬러그: string
  요약: string
  /** 이 게시판에 「구분」으로 쓸 만한 값이 있나. 상세 판의 머리 꼬리표가 쓴다. */
  구분s: string[]
}

export const 표본게시판s: readonly i표본게시판[] = [
  { 형식: 'LIST', 이름: '공지사항', 슬러그: 'notice', 요약: '모임 운영과 일정 공지', 구분s: ['일반', '모임', '모집'] },
  { 형식: 'CARD', 이름: '소식', 슬러그: 'news', 요약: '지원 사례·모임 기록', 구분s: ['사례', '활동'] },
  { 형식: 'FAQ', 이름: '자주 묻는 질문', 슬러그: 'faq', 요약: '지원 신청·가입·회비에 대해', 구분s: ['지원', '가입', '회비'] },
  { 형식: 'DOCS', 이름: '자료실', 슬러그: 'docs', 요약: '진단 체크리스트·가이드·서식', 구분s: ['가이드', '서식'] }
]

const 날 = (n: number) => new Date(Date.now() - n * 86400000)

/** 첨부는 테이블이 없다 — 본문의 받기 블록(`::download`)이 첨부다(`boardAttachmentUrl`). 표본도 그 규약을 따른다. */
const 첨부 = (이름: string) => `${이름} 를 내려받으세요.\n\n::download{url="/files/${이름}" title="${이름}"}\n::`

const 표본표: Record<i게시판표시형식, BoardRow[]> = {
  LIST: [
    { id: 'n1', type: '모집', title: '2026 하반기 지원 협회 모집 — 9월 30일 마감', author: '운영진', date: 날(1), views: 412, likes: 3, path: '/decisions/boards/detail', body: '<p>회원 300명 이하의 비영리 협회·학회가 대상입니다. 세 곳을 선정해 11월부터 3개월 동안 함께합니다.</p>', isPinned: true },
    { id: 'n2', type: '모임', title: '10월 정기 모임 — 회원 명부 이관 사례 공유', author: '운영진', date: 날(3), views: 388, likes: 1, path: '/decisions/boards/detail', body: '<p>10월 11일(토) 14:00, 온라인. 전국독서지도사협회 명부 이관을 맡았던 회원이 과정을 발표합니다.</p>' },
    { id: 'n3', type: '일반', title: '정회원 승급 요건 개정 안내', author: '운영진', date: 날(6), views: 201, likes: 0, path: '/decisions/boards/detail', body: '<p>지원 프로젝트 1회 참여로 요건을 낮췄습니다. 9월 운영회의에서 의결했습니다.</p>' },
    { id: 'n4', type: '일반', title: '2026년 연회비 납부 안내', author: '총무', date: 날(12), views: 96, likes: 0, path: '/decisions/boards/detail', body: '<p>연회비 3만원, 10월 31일까지입니다. 납부 여부는 회원 페이지에서 바로 확인됩니다.</p>' },
    { id: 'n5', type: '일반', title: '개인정보 취급자 교육 이수 확인', author: '운영진', date: 날(20), views: 54, likes: 0, path: '/decisions/boards/detail', body: '<p>협회 회원 정보를 다루는 지원 프로젝트에 참여하려면 교육 이수 퀴즈를 먼저 통과해야 합니다.</p>' }
  ],
  CARD: [
    { id: 'c1', type: '사례', title: '전국독서지도사협회 — 엑셀 명부 1,200명을 회원 DB로', author: '운영진', date: 날(2), views: 522, likes: 41, path: '/decisions/boards/detail', thumbnail: null, body: '<p>중복 340건을 정리하고 회비 미납 안내를 자동화했습니다. 석 달의 기록입니다.</p>' },
    { id: 'c2', type: '사례', title: '한국문화재보존학회 정기총회, 전자투표로 치르다', author: '운영진', date: 날(9), views: 480, likes: 37, path: '/decisions/boards/detail', thumbnail: null, body: '<p>회원 210명 중 168명이 참여했습니다. 종이 위임장이 사라졌습니다.</p>' },
    { id: 'c3', type: '활동', title: '9월 정기 모임 — 협회 디지털 준비도 진단 워크숍', author: '운영진', date: 날(15), views: 310, likes: 12, path: '/decisions/boards/detail', thumbnail: null, body: '<p>참가한 다섯 협회의 진단 결과를 함께 읽었습니다. 발표 영상을 올립니다.</p>' },
    { id: 'c4', type: '활동', title: '하반기 운영진 소개', author: '운영진', date: 날(24), views: 176, likes: 8, path: '/decisions/boards/detail', thumbnail: null, body: '<p>2026 하반기 운영을 맡을 세 사람을 소개합니다. 협회 사무국 출신 회원이 처음 합류했습니다.</p>' }
  ],
  FAQ: [
    { id: 'f1', type: '지원', title: '어떤 협회가 지원을 신청할 수 있나요?', author: '운영진', date: 날(4), views: 640, likes: 5, path: '/decisions/boards/detail', body: '<p>회원 300명 이하의 비영리 협회·학회·단체입니다. 사무국 담당자가 직접 신청해 주세요.</p>' },
    { id: 'f2', type: '지원', title: '지원을 받으면 비용이 드나요?', author: '운영진', date: 날(4), views: 588, likes: 4, path: '/decisions/boards/detail', body: '<p>모임의 지원 활동은 무료입니다. 호스팅·문자 발송 같은 실비만 협회가 부담합니다.</p>' },
    { id: 'f3', type: '가입', title: 'IT 경력이 없어도 회원이 될 수 있나요?', author: '운영진', date: 날(11), views: 402, likes: 2, path: '/decisions/boards/detail', body: '<p>네. 명부 정리, 안내문 작성, 사무국 인터뷰처럼 협회 실무를 아는 분이 오히려 더 필요합니다.</p>' },
    { id: 'f4', type: '회비', title: '회비는 어디에 쓰이나요?', author: '총무', date: 날(18), views: 366, likes: 1, path: '/decisions/boards/detail', body: '<p>모임 장소 대여와 지원 협회의 초기 실비에 씁니다. 연간 결산은 자료실에 공개합니다.</p>' }
  ],
  DOCS: [
    { id: 'd1', type: '가이드', title: '협회 디지털 전환 진단 체크리스트 (2026)', author: '운영진', date: 날(5), views: 291, likes: 6, path: '/decisions/boards/detail', body: 첨부('협회-디지털전환-진단-체크리스트-2026.pdf') },
    { id: 'd2', type: '서식', title: '지원 신청서 서식', author: '운영진', date: 날(13), views: 154, likes: 0, path: '/decisions/boards/detail', body: 첨부('지원신청서.hwp') },
    { id: 'd3', type: '가이드', title: '회원 명부 이관 가이드 — 엑셀에서 회원 DB까지', author: '운영진', date: 날(21), views: 233, likes: 9, path: '/decisions/boards/detail', body: 첨부('회원명부-이관-가이드.pdf') },
    { id: 'd4', type: '서식', title: '개인정보 수집·이용 동의서 서식 (협회용)', author: '운영진', date: 날(30), views: 61, likes: 0, path: '/decisions/boards/detail', body: 첨부('개인정보-동의서-협회용.hwp') }
  ]
}

/**
 * 그 성격의 표본 행들.
 *
 * `is구분있음` 이 꺼져 있으면 `type` 을 지운다 — **지금 실코드가 그 상태다**(게시글에 분류 필드가 없어
 * `type: undefined` 로 넘긴다). 목록은 동결(2026-09-14)로 구분 칸 자체가 없어졌고,
 * 상세 판(`detail`)만 채운 값을 본다.
 */
export const 표본행s = (형식: i게시판표시형식, is구분있음: boolean): BoardRow[] =>
  표본표[형식].map(행 => ({ ...행, type: is구분있음 ? 행.type : undefined }))

/** 상세 판이 쓰는 글 하나. 성격마다 본문이 다른 게 이 판의 물음이라 성격별로 고른다. */
export const 표본글 = (형식: i게시판표시형식) => 표본표[형식][0]!

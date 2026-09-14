/**
 * 공식 홈(`/official`)이 읽는 **실제 게시글**과 기관 소개. 매거진형 둘째 판(`/official/2`)은 지웠다(2026-09-15).
 *
 * 모래밭 홈 시안 다섯에서 골라 옮겼다(시안 판은 지웠다). 시안은 시드를 직접 폈지만 여기는 DB를 읽는다 —
 * 관리자가 공지를 고치면 홈도 바뀌어야 해서다. 글을 게시판 성격(slug)으로 가르고, 목록 행 모양은
 * 공개 게시판(`boards/[boardType]/index.vue`)의 `rows` 와 같은 `BoardRow` 로 맞췄다.
 *
 * - **그림**은 모델의 `대표썸네일` — 사람이 고른 썸네일, 없으면 본문 첫 사진, 없으면 첫 영상 썸네일.
 * - **구분**(공지 탭)도 칸이 없다 — 게시판 화면과 같은 이유로 비워 두고, 탭은 「공지」 한 칸이 된다.
 */
import { computed, toValue } from 'vue'
import { model게시판s, model회원게시글s, type model회원게시글 } from '~models/test2'
import { boardExcerpt, type BoardRow } from '~/composables/useBoardFilter'
import type { CarouselHeroSlide } from '~/composables/useLayoutHero'

export const 기관 = {
  이름: '팀 마장터',
  한줄: '작은 협회의 디지털 전환을 함께 만드는 모임'
}

/**
 * `/official` 맨 위 사진 캐러셀(`lLayoutHero`) 슬라이드. official.team-mjt.com 메인과 같은 사진이다.
 * 사진은 원본(PNG 8MB 안팎)을 1920px JPEG 로 줄여 `_CUSTOM/public/img/hero` 에 두었다 — 히어로가 3px 흐림을 걸어 차이가 안 난다.
 */
export const 히어로s: CarouselHeroSlide[] = [
  {
    src: '/img/hero/office1.jpg',
    srcDark: '/img/hero/office_dark1.jpg',
    alt: '팀 마장터 작업실',
    eyebrow: '팀 마장터',
    title: '작은 협회의 디지털 전환을 함께 만듭니다',
    description: '회원 명부, 회비, 연수 신청처럼 엑셀과 전화로 버티던 일을 한 화면으로 옮깁니다. 사무국 한두 사람이 운영할 수 있는 크기로요.'
  },
  {
    src: '/img/hero/meeting1.jpg',
    srcDark: '/img/hero/meeting_dark1.jpg',
    alt: '사무국과의 미팅',
    eyebrow: '먼저 듣기',
    title: '업무 흐름을 듣고 화면으로 제안합니다',
    description: '사무국이 실제로 일하는 순서를 먼저 받아 적고, 필요한 기능은 우선순위를 함께 정해 바로 눌러 볼 수 있는 시안으로 보여 드립니다.'
  },
  {
    src: '/img/hero/pt1.jpg',
    srcDark: '/img/hero/pt_dark1.jpg',
    alt: '협회 맞춤 발표',
    eyebrow: '협회 맞춤',
    title: '회원부터 수료증까지 한 흐름으로 잇습니다',
    description: '가입과 역할, 연수 신청과 결제, 출석과 수료증 발급을 따로 놀지 않게 연결해 운영 부담을 줄입니다.'
  },
  {
    src: '/img/hero/meeting2.jpg',
    srcDark: '/img/hero/meeting_dark2.jpg',
    alt: '정기 모임',
    eyebrow: '정기 모임',
    title: '오픈 뒤에도 같은 리듬으로 모입니다',
    description: '정기 모임에서 현장의 불편을 모으고 다음 개선에 반영합니다. 공지와 접수 일정처럼 급한 일은 바로 처리합니다.'
  },
  {
    src: '/img/hero/work1.jpg',
    srcDark: '/img/hero/work_dark1.jpg',
    alt: '지원 현장',
    eyebrow: '지원 현장',
    title: '만든 사람이 직접 운영을 돕습니다',
    description: '문의 접수부터 원인 확인, 수정과 배포까지 만든 사람이 한 줄로 이어 받아 협회 운영이 멈추지 않게 합니다.'
  }
]

export const 채널s = [
  { label: 'YouTube', to: 'https://www.youtube.com/', icon: 'i-simple-icons-youtube', buttonClass: 'bg-[#FF0000] text-white hover:bg-[#e60000] dark:bg-[#FF0000]' },
  { label: 'Instagram', to: 'https://www.instagram.com/', icon: 'i-simple-icons-instagram', buttonClass: 'bg-linear-to-br from-[#f58529] via-[#dd2a7b] to-[#8134af] text-white hover:opacity-95' },
  { label: 'Naver Blog', to: 'https://blog.naver.com/', icon: 'i-simple-icons-naver', buttonClass: 'bg-[#03C75A] text-white hover:bg-[#02b351]' }
]

/** 사진 없는 글의 그림 자리 — 결정적인 그라디언트로 채운다(엑박 대신). */
const 물감s = [
  'from-sky-200 to-indigo-300 dark:from-sky-900 dark:to-indigo-900',
  'from-amber-200 to-rose-300 dark:from-amber-900 dark:to-rose-900',
  'from-emerald-200 to-teal-300 dark:from-emerald-900 dark:to-teal-900',
  'from-violet-200 to-fuchsia-300 dark:from-violet-900 dark:to-fuchsia-900'
]
export const 물감 = (i: number) => 물감s[i % 물감s.length]!

export const 짧은날 = (d: string | Date) => {
  const v = new Date(d)
  return `${v.getMonth() + 1}.${String(v.getDate()).padStart(2, '0')}`
}

export const 발췌 = (body?: string, max = 80) => boardExcerpt(body, max)

/**
 * 게시판·게시글을 읽고 성격별 행을 돌려준다. 페이지 `setup` 에서 `await` 한다.
 * 못 읽으면 칸이 빈 채로 선다 — 홈 한 칸 때문에 홈 전체를 에러로 만들지 않는다.
 */
export async function use홈글() {
  const boardsRepo = model게시판s.getInstance()
  const postsRepo = model회원게시글s.getInstance()
  try {
    await Promise.all([boardsRepo.reads(), postsRepo.reads()])
  } catch {
    /* 빈 칸으로 선다 */
  }

  const 행s = (slug: string) => computed((): BoardRow[] => {
    const 게시판 = boardsRepo.getBy슬러그(slug)
    if (!게시판?.공개) return []
    const bid = String(게시판.state?.id ?? 게시판.id ?? '')
    return [...toValue(postsRepo.list)]
      .filter((p: model회원게시글) => String(p.state?.boardId ?? '') === bid && p.공개)
      .sort((a, b) => b.작성일시.valueOf() - a.작성일시.valueOf())
      .map((p) => {
        const id = String(p.id ?? p.state?.id ?? '')
        return {
          id,
          title: p.제목,
          author: '운영진',
          date: p.작성일시.toDate(),
          views: p.조회수,
          likes: p.좋아요수,
          body: p.본문 ?? '',
          thumbnail: p.대표썸네일 || null,
          path: `/boards/${encodeURIComponent(slug)}/${encodeURIComponent(id)}`
        }
      })
  })

  const 공지s = 행s('notice')
  return {
    공지s,
    소식s: 행s('news')
  }
}

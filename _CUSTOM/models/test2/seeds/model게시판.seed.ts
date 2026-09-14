import type { i게시판시드 } from '../_basics/model게시판'

/**
 * 기존 menus.json의 `board` 파트(1014~1017)를 게시판 테이블로 옮긴 시드.
 *
 * id는 서버(`db_low.allocateIds`)가 빈 테이블에 1001부터 삽입 순서대로 다시 매기므로 여기 적힌 값과
 * 순서를 맞춰 두었다. 게시판은 3행이라(자료실은 `model자료` 로 옮겼다) 선언 id = 발급 id가 되고, `i메뉴seed`의 `target.boardId`도
 * 그래서 안전하게 이 값을 가리킬 수 있다.
 */
export const i게시판seed: readonly i게시판시드[] = [
  {
    code: 'notice',

    slug: 'notice',
    title: '공지',
    icon: 'i-fluent:megaphone-20-regular',
    description: '지원 협회 모집, 정기 모임 일정, 운영 규칙 변경을 공지로 정리합니다.',
    isPublished: true,
    viewMode: 'LIST',
    writeAccess: 'ADMIN',
    pageIntro: {
      eyebrow: 'NOTICE',
      title: '모임 운영에 관한 안내를 모았습니다.',
      description: '지원 협회 모집, 정기 모임 일정, 운영 규칙 변경을 공지로 정리합니다.'
    }
  },
  {
    // 옛 「자주 묻는 질문」(slug `faq`). 누구나 묻는 게시판이 되었고, 자주 묻는 것은 글의 `isFaq` 가 가른다.
    code: 'qna',

    slug: 'qna',
    title: 'Q&A',
    icon: 'i-ph:chat-centered-dots-light',
    description: '지원 자격과 절차, 비용, 회원 가입, 회비에 관한 질문과 답을 모았습니다.',
    isPublished: true,
    viewMode: 'FAQ',
    writeAccess: 'ANYONE',
    pageIntro: {
      eyebrow: 'Q&A',
      title: '궁금한 것을 묻고, 자주 묻는 답은 먼저 확인하세요.',
      description: '지원 자격과 절차, 비용, 회원 가입, 회비에 관한 질문과 답을 모았습니다.'
    }
  },
  {
    code: 'news',

    slug: 'news',
    title: '소식',
    icon: 'i-fluent:news-20-regular',
    description: '지원 사례, 정기 모임 기록, 새로 시작하는 일을 카드 형태로 정리했습니다.',
    isPublished: true,
    viewMode: 'CARD',
    writeAccess: 'ADMIN',
    pageIntro: {
      eyebrow: 'NEWS',
      title: '함께한 협회의 이야기와 모임 소식을 모았습니다.',
      description: '지원 사례, 정기 모임 기록, 새로 시작하는 일을 카드 형태로 정리했습니다.'
    }
  }
]

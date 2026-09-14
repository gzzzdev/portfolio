/** 회원 게시글 mock 카탈로그 — `model회원게시글.generate`용 시드 */

import { pick1 } from '~utils'
import type { i게시판ID, i게시글타입, i회원게시글dto } from '../_basics/model회원게시글'

import type { i게시판mock } from './mock게시판s'
import 회원게시판목록ss from './mock게시판s'

/** `model회원게시글.generate`용 포스트 시드 (DTO `title`·`body` 축 + 카탈로그 전용 필드) */
export type iSample회원게시글CatalogPost = Pick<i회원게시글dto, 'title'>
  & Partial<Pick<i회원게시글dto, 'body'>> & {
    description: string
    link?: string
    preferredType?: i게시글타입
  }

export type iSample회원게시글CatalogGroup = {
  presetKey: i게시판ID
  posts: iSample회원게시글CatalogPost[]
}

export default function sample게시글(slug: string): iSample회원게시글CatalogGroup {
  function slugTo게시판PresetKey(s: string): i게시판ID {
    const x = s.trim().toLowerCase()
    if (x === 'notice' || x === 'qna' || x === 'docs' || x === 'news') return x
    return 'notice'
  }

  function postsToCatalogPosts(posts: i게시판mock['posts']): iSample회원게시글CatalogPost[] {
    return posts.map(post => ({
      title: post.title,
      description: post.category,
      body: post.content
    }))
  }

  function groupFromSlug(s: string): iSample회원게시글CatalogGroup | null {
    const board = 회원게시판목록ss.find(b => b.slug === s)
    if (!board) return null
    return {
      presetKey: slugTo게시판PresetKey(board.slug),
      posts: postsToCatalogPosts(board.posts)
    }
  }

  function fallbackGroup(): iSample회원게시글CatalogGroup {
    if (!회원게시판목록ss.length) {
      return {
        presetKey: 'notice',
        posts: [{ title: '샘플 게시글', description: '공지', body: '<p>내용</p>' }]
      }
    }
    const board = pick1(회원게시판목록ss)
    return {
      presetKey: slugTo게시판PresetKey(board.slug),
      posts: postsToCatalogPosts(board.posts)
    }
  }

  let s = slug.trim()
  if (!s && 회원게시판목록ss.length) s = pick1(회원게시판목록ss).slug
  return groupFromSlug(s) ?? fallbackGroup()
}

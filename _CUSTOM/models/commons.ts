export interface i댓글mock {
  body: string
  authorName?: string
  /** 게시글 mock `tags`와 교차한다. 배열 중 하나라도 글 태그와 겹치면 같은 스레드로 취급 (예: `['notice-renew']`) */
  tags?: string[]
}

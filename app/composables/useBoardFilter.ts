import { computed, ref, toValue, type MaybeRefOrGetter } from 'vue'
// 게시글 본문의 평문화는 목록 미리보기와 검색(모델 `본문텍스트`)이 같은 규칙을 써야 한다.
import { md평문, 본문받기s } from '~utils'

/**
 * 공개 게시판(`/boards/*`) 목록 한 행.
 *
 * 게시판이 달라도 행은 한 모양이고 화면도 한 벌이다(`m/Boards/행.vue`) — 줄에 붙는 것은 글이 가진 것이
 * 정한다(답이 펼쳐지는 글, 받을 파일이 있는 글). 그래서 행 타입과 검색 로직은 여기 한 곳에 두고,
 * 줄은 그리기만 한다.
 */
export interface BoardRow {
  id: number | string
  type?: string
  title: string
  author: string
  date: string | Date
  views: number
  /** 없으면 0으로 표시 */
  likes?: number
  path: string
  /** 본문 **md**(`Input본문` 가 저장하는 값). FAQ는 이걸 그 자리에서 펼치고, 받기 버튼은 여기서 주소를 뽑는다. */
  body?: string
  thumbnail?: string | null
  isPinned?: boolean
}

/** 목록 날짜는 하루 단위라 UTC로 자르면 KST 새벽 글이 전날로 밀린다. 로컬 기준으로 찍는다. */
export function formatBoardDate(value?: string | Date | null): string {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

/**
 * 본문 md에서 표시를 걷어낸 미리보기 문장.
 *
 * **사진의 대체글은 뺀다.** `md평문` 은 검색에 걸리라고 `alt` 를 남기는데, 미리보기에서는 그게
 * 「…앉은 모습」 같은 문장으로 끼어든다. 캡션(블록 안의 글)은 사람이 읽으라고 쓴 글이라 둔다.
 * 검색은 이 함수가 아니라 `md평문` 을 그대로 탄다(아래 `useBoardFilter`).
 */
export function boardExcerpt(body?: string, max = 140): string {
  const text = md평문(
    String(body ?? '')
      .replace(/^[ \t]*:{2,3}photo\{[^}\n]*\}[ \t]*$/gm, ' ')
      .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
  )
  return text.length > max ? `${text.slice(0, max)}…` : text
}

/**
 * 받을 파일 주소 — 본문의 첫 `::download` 블록(`~utils` 의 `본문받기s`). 없으면 `null`.
 *
 * 예전엔 **본문의 첫 링크**를 첨부로 봤다. 그 규칙은 사진(`![…](https://…)`)과 안내 링크까지 잡아서
 * 사진 붙은 공지마다 첨부 표시가 섰다. 받기 블록이 생긴 뒤로는(`mdc/Download.vue`) 글이 직접
 * 「이건 받는 파일」이라고 말하므로 그것만 본다.
 */
export function boardAttachmentUrl(body?: string): string | null {
  return 본문받기s(body)[0]?.url ?? null
}

/**
 * 검색 한 벌. **정렬·구분·보기 전환은 없다**(2026-09-14 게시판 동결) — 게시판은 없으면 욕먹고 있어도
 * 칭찬 안 받는 기능이라, 컨트롤을 늘리는 대신 최신순 하나로 멈췄다.
 * 검색은 클라이언트 배열 필터라 즉시 반영한다 — "검색" 버튼을 따로 두면 줄만 길어진다.
 */
export function useBoardFilter(rows: MaybeRefOrGetter<BoardRow[]>) {
  const keyword = ref('')

  const allRows = computed(() => toValue(rows) ?? [])

  /**
   * 검색 대상 텍스트를 행이 바뀔 때 한 번만 만든다.
   * 매 키 입력마다 본문 전체를 태그 제거하면 글자 수에 비례해 느려진다.
   */
  const 검색색인 = computed(() =>
    allRows.value.map(row =>
      `${row.title}\n${row.author}\n${md평문(row.body).slice(0, 4000)}`.toLowerCase()
    )
  )

  /** 고정 글이 먼저, 나머지는 최신순. */
  const sortedRows = computed(() => {
    const query = keyword.value.trim().toLowerCase()
    const 색인 = 검색색인.value
    return allRows.value
      .filter((_, i) => !query || (색인[i]?.includes(query) ?? false))
      .sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      })
  })

  const is검색중 = computed(() => keyword.value.trim() !== '')

  return { keyword, sortedRows, is검색중 }
}

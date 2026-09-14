/**
 * 본문 md 에 박힌 유튜브 영상을 꺼낸다.
 *
 * **영상 전용 표가 없는 이유가 이 파일이다.** 영상은 글 본문에 편집기의 유튜브 블록으로 들어가고
 * (`m/Editor/_/확장.ts` 의 `youtube` 원자 → md 로는 `::youtube{url="…"}` 한 줄), 「영상 글」은
 * 그 줄이 있는 글이다. 그래서 어느 게시판이든, 본문을 md 로 저장하는 어느 표든 같은 함수로 거른다.
 *
 * **편집기 블록만 센다.** 본문에 글자·링크로 붙여 넣은 유튜브 주소는 영상이 아니라 링크다 —
 * 읽기 화면(`<MDC>`)도 그걸 재생하지 않으니, 여기서 영상으로 세면 목록과 상세가 어긋난다.
 *
 * 파서를 붙이지 않는 이유는 `md평문`(`./textSearch`)과 같다 — 동기로, 서버에서도 돈다.
 */

export interface i본문영상 {
  /** 블록에 적힌 주소 그대로 */
  url: string
  videoId: string
  /** 주소의 `t=`·`start=` — 없으면 undefined */
  startSeconds?: number
  썸네일: string
}

export type i유튜브썸네일크기 = 'mqdefault' | 'hqdefault' | 'sddefault' | 'maxresdefault'

const 아이디 = /^[\w-]{11}$/

/** 유튜브 주소(또는 아이디 그대로)에서 11자 아이디. 못 찾으면 null. */
export function 유튜브id(url: unknown): string | null {
  const s = String(url ?? '').trim()
  if (!s) return null
  if (아이디.test(s)) return s
  const m = s.match(/(?:[?&]v=|youtu\.be\/|\/embed\/|\/shorts\/|\/live\/|\/v\/)([\w-]{11})/)
  return m?.[1] ?? null
}

/** `t=90`·`t=1m30s`·`start=90` → 초. 없거나 0이면 undefined. */
function 시작초(url: string): number | undefined {
  const m = url.match(/[?&](?:t|start)=([^&#]+)/)
  if (!m) return undefined
  const v = m[1]!.toLowerCase()
  if (/^\d+s?$/.test(v)) return Number.parseInt(v, 10) || undefined
  const hms = v.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/)
  if (!hms) return undefined
  const 초 = Number(hms[1] ?? 0) * 3600 + Number(hms[2] ?? 0) * 60 + Number(hms[3] ?? 0)
  return 초 || undefined
}

export const 유튜브썸네일 = (videoId: string, 크기: i유튜브썸네일크기 = 'hqdefault') =>
  `https://img.youtube.com/vi/${videoId}/${크기}.jpg`

/**
 * 본문의 유튜브 블록들, 나온 순서대로. 아이디를 못 뽑는 블록(빈 주소 등)은 건너뛴다.
 * 속성 따옴표는 `"`·`'`·없음을 다 받는다 — 사람이 md 를 손으로 고친 행도 있다.
 */
export function 본문영상s(md: unknown): i본문영상[] {
  const s = String(md ?? '')
  if (!s.includes('::youtube')) return []
  const out: i본문영상[] = []
  for (const 줄 of s.matchAll(/^[ \t]*::youtube\{([^}\n]*)\}/gm)) {
    const 속성 = 줄[1]!.match(/\burl\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s}]+))/)
    const url = (속성?.[1] ?? 속성?.[2] ?? 속성?.[3] ?? '').trim()
    const videoId = 유튜브id(url)
    if (!videoId) continue
    const startSeconds = 시작초(url)
    out.push({ url, videoId, ...(startSeconds ? { startSeconds } : {}), 썸네일: 유튜브썸네일(videoId) })
  }
  return out
}

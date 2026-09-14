/**
 * 본문 md 에 박힌 사진을 꺼낸다 — `본문영상`(`./본문영상`)의 사진판.
 *
 * **썸네일 칸을 따로 채우지 않아도 되게 하는 파일이다.** 글을 쓰며 본문에 넣은 첫 사진이 곧 그 글의
 * 얼굴이고, 카드·목록은 모델의 `thumbnail` 한 자리만 보면 된다(본문을 저마다 뒤지지 않는다).
 * 저장값(`state.thumbnail`)에는 써 넣지 않는다 — 본문에서 사진을 빼면 그림도 같이 빠져야 한다.
 *
 * 받는 문법은 둘이다.
 * - 편집기 사진 블록 `::photo{src="…" alt="…"}`. `::columns` 안에서는 `:::photo` 라 콜론 2~3개를 다 받는다.
 * - 손으로 쓴 md 의 `![alt](url)`.
 * 나온 순서(본문 위치)대로 준다. 코드 펜스 안은 가리지 않는다 — `본문영상s` 와 같은 눈높이다.
 *
 * 파서를 붙이지 않는 이유는 `md평문`(`./textSearch`)과 같다 — 동기로, 서버에서도 돈다.
 */
import { 본문영상s } from './본문영상'

export interface i본문사진 {
  src: string
  alt: string
}

const 블록 = /^[ \t]*:{2,3}photo\{([^}\n]*)\}/gm
const md그림 = /!\[([^\]]*)\]\(\s*<?([^\s)>]+)>?(?:\s+"[^"]*")?\s*\)/g

/** 블록 속성 한 개. 따옴표는 `"`·`'`·없음을 다 받는다 — 사람이 md 를 손으로 고친 행도 있다. */
function 속성(들: string, 이름: string): string {
  const m = 들.match(new RegExp(`\\b${이름}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s}]+))`))
  return (m?.[1] ?? m?.[2] ?? m?.[3] ?? '').trim()
}

/** 본문의 사진들, 나온 순서대로. 주소가 빈 것은 건너뛴다. */
export function 본문사진s(md: unknown): i본문사진[] {
  const s = String(md ?? '')
  if (!s.includes('photo{') && !s.includes('![')) return []
  const out: { at: number, 사진: i본문사진 }[] = []
  for (const m of s.matchAll(블록)) {
    const src = 속성(m[1]!, 'src')
    if (src) out.push({ at: m.index!, 사진: { src, alt: 속성(m[1]!, 'alt') } })
  }
  for (const m of s.matchAll(md그림)) {
    const src = m[2]!.trim()
    if (src) out.push({ at: m.index!, 사진: { src, alt: m[1]!.trim() } })
  }
  return out.sort((a, b) => a.at - b.at).map(o => o.사진)
}

/**
 * 본문이 스스로 내놓는 대표 그림 — 첫 사진, 없으면 첫 영상의 유튜브 썸네일. 둘 다 없으면 undefined.
 * 모델의 `thumbnail` 사슬에서 「사람이 고른 그림」 다음, 「타입 기본 그림」 앞에 온다.
 */
export function 본문대표그림(md: unknown): string | undefined {
  return 본문사진s(md)[0]?.src ?? 본문영상s(md)[0]?.썸네일
}

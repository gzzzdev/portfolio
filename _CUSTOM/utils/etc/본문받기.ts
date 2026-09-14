/**
 * 본문 md 에 박힌 받기 블록(`::download{url="…" title="…"}`)을 꺼낸다 — `본문사진`(`./본문사진`)의 파일판.
 *
 * 목록이 「받기」 버튼을 세우려고 본문을 읽는 자리다. 저장값에 따로 적지 않는다 — 본문에서 블록을 빼면
 * 버튼도 같이 빠져야 한다. 파서를 안 붙이는 이유도 `본문사진` 과 같다 — 동기로, 서버에서도 돈다.
 * `::columns` 안이면 `:::download` 라 콜론 2~3개를 다 받는다. 코드 펜스 안은 가리지 않는다.
 */

export interface i본문받기 {
  url: string
  title: string
}

const 블록 = /^[ \t]*:{2,3}download\{([^}\n]*)\}/gm

/** 블록 속성 한 개. 따옴표는 `"`·`'`·없음을 다 받는다(`본문사진` 과 같다). */
function 속성(들: string, 이름: string): string {
  const m = 들.match(new RegExp(`\\b${이름}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s}]+))`))
  return (m?.[1] ?? m?.[2] ?? m?.[3] ?? '').trim()
}

/** 본문의 받기 블록들, 나온 순서대로. 주소가 빈 것은 건너뛴다. */
export function 본문받기s(md: unknown): i본문받기[] {
  const s = String(md ?? '')
  if (!s.includes('download{')) return []
  const out: i본문받기[] = []
  for (const m of s.matchAll(블록)) {
    const url = 속성(m[1]!, 'url')
    if (url) out.push({ url, title: 속성(m[1]!, 'title') })
  }
  return out
}

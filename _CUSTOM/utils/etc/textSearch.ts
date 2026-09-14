/**
 * 검색 — 필터·정렬로 "닫히지 않는" 세 번째 축.
 *
 * 목록5의 검색창과 챗봇의 `검색어s`가 이 파일 하나를 공유한다.
 * 모델도 AI도 import하지 않는 순수 문자열 유틸이라 양쪽이 서로를 모른 채 같은 의미를 쓴다.
 *
 * **fuzzy(편집거리)를 쓰지 않는다.**
 * - 한글에서 필요한 건 오타 내성이 아니라 조사·어미 흡수("재활을/재활은/재활에")고, 부분일치가 이미 한다.
 * - 복합어("무릎재활" ⊃ "재활")도 부분일치가 공짜로 잡는다.
 * - 오타 교정은 챗봇 경로에선 계획 수립 LLM이 앞단에서 이미 해준다(사용자가 "재홥"이라 쳐도 "재활"로 온다).
 * - 반대로 편집거리를 걸면 "재활"과 "재발"이 붙는 손해가 더 크다.
 *
 * 대신 **공백·기호만 건너뛰는 정규식**을 만든다("인대 손상" ↔ "인대손상" ↔ "인대-손상").
 * 원문을 정규화한 사본을 만들지 않으므로 큰 본문에서도 인덱스가 원문 기준 그대로다 → 스니펫에 바로 쓴다.
 */

/** 검색에서 무시할 문자(공백·구두점·기호) */
const 무시문자 = /[\s\p{P}\p{S}]/u
/** 글자 사이에 끼어도 되는 것들 */
const 사이문자열 = '[\\s\\p{P}\\p{S}]*'

const escapeRe = (c: string) => c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

/**
 * 키워드 → 원문에서 찾는 정규식. `g` 플래그가 붙으므로 재사용 전 `lastIndex = 0` 필수.
 * 정규화 사본을 안 만들기 때문에 `exec`가 주는 index를 스니펫 위치로 그대로 쓸 수 있다.
 */
export function 검색정규식(키워드: string): RegExp | null {
  const 문자s = [...String(키워드 ?? '')]
    .filter(c => !무시문자.test(c))
    .map(c => escapeRe(c.toLowerCase()))
  if (!문자s.length) return null
  return new RegExp(문자s.join(사이문자열), 'giu')
}

export interface i검색정규식 { 키워드: string, re: RegExp }

/** 키워드 목록 → 정규식 목록. 빈 키워드는 버린다. */
export function 검색정규식s(키워드s: readonly string[]): i검색정규식[] {
  return (키워드s ?? [])
    .map(키워드 => ({ 키워드: String(키워드 ?? '').trim(), re: 검색정규식(키워드) }))
    .filter((x): x is i검색정규식 => !!x.키워드 && !!x.re)
}

/**
 * 임의 값 → 문자열. 배열은 콤마, dayjs류는 날짜, 모델은 `label`.
 * 여기서 공백 정규화를 하지 않는 게 중요하다 — **자르고 나서** 하는 게 호출부 몫이다.
 */
export function 값문자열(v: unknown): string {
  if (v == null) return ''
  if (typeof v === 'string') return v
  if (Array.isArray(v)) return v.map(값문자열).filter(Boolean).join(',')

  if (typeof v === 'object') {
    const format = (v as { format?: unknown }).format
    if (typeof format === 'function') return (v as { format: (f: string) => string }).format('YYYY-MM-DD')

    const label = (v as { label?: unknown }).label
    if (typeof label === 'string') return label

    try { return JSON.stringify(v) } catch { return '' }
  }
  return String(v)
}

/**
 * md 본문 → 검색·발췌용 평문.
 *
 * 본문은 md로 저장된다(`m/Editor/md.vue`). 그대로 두면 검색은 링크의 URL을 키워드로 맞히고,
 * 발췌는 `::카드` 같은 블록 표시에 예산을 쓴다. 그래서 **읽는 쪽에서 한 번 걷어낸다** —
 * 저장된 원본은 md 그대로 남는다.
 * 호출부는 결과를 캐시하는 게 좋다(모델이면 `computed`). 8만 자짜리 본문에 매 입력마다 돌릴 일이 아니다.
 *
 * **파서를 붙이지 않는다.** 정본 파서는 `@nuxtjs/mdc` 런타임이라 비동기고 클라이언트 전용인데,
 * 이 함수는 검색 루프 안에서 동기로 돌고 서버에서도 돈다(`문서평문`이 그 반대편 —
 * 이미 파싱된 문서를 받는 자리다). 여기서 필요한 건 정확한 트리가 아니라 **사람이 읽는 글자**뿐이다.
 */
export function md평문(md: unknown): string {
  return String(md ?? '')
  // 코드 울타리의 울타리 줄만 걷는다. 안쪽 코드는 글자로 남는다 — 검색어가 거기 있을 수 있다.
    .replace(/^[ \t]*(?:`{3,}|~{3,}).*$/gm, ' ')
  /*
          `::블록` 의 여는·닫는 줄. 이름과 대부분의 속성은 사람이 읽는 글이 아니라 걷지만,
          **`title`·`label`·`alt` 세 값은 남긴다** — 카드 제목·탭 이름·사진 설명은 화면에
          글자로 서고, 그러니 검색에도 걸려야 한다. 반대편(`~utils/mdc/doc` 의 `문서평문`)이
          객체에서 정확히 이 셋만 줍는다. 둘이 갈리면 같은 글이 어느 화면에서 검색되느냐가
          달라진다 — 게시판은 이쪽, `/v2/docs` 는 저쪽을 탄다.
        */
    .replace(/^[ \t]*:{2,}[^\n]*$/gm, 줄 =>
      [...줄.matchAll(/\b(?:title|label|alt)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)]
        .map(m => m[1] ?? m[2]).join(' ') || ' ')
  // 인라인 블록(`:badge[신규]`). 대괄호 안이 곧 화면에 서는 글자다.
    .replace(/:[a-z][a-z0-9-]*\[([^\]]*)\](?:\{[^}]*\})?/g, '$1')
  // 블록 속성 뭉치(`---` 로 둘러싼 yaml)도 표시용이 아니다.
    .replace(/^[ \t]*---[ \t]*$/gm, ' ')
  // 그림은 대체글만 남는다. 링크는 글자만 남기고 주소를 버린다 — 주소가 검색에 걸리면 안 된다.
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
  // 자동링크(`<https://…>`)는 주소가 곧 글자다. 꺾쇠만 벗긴다.
    .replace(/<((?:https?|mailto|tel):[^>\s]+)>/g, '$1')
  // 줄머리 표시 — 제목·인용·목록·표 구분선.
    .replace(/^[ \t]*#{1,6}[ \t]+/gm, '')
    .replace(/^[ \t]*>[ \t]?/gm, '')
    .replace(/^[ \t]*(?:[-*+]|\d+\.)[ \t]+/gm, '')
    .replace(/^[ \t]*\|?[ \t]*:?-{2,}:?[ \t]*(?:\|[ \t]*:?-{2,}:?[ \t]*)*\|?[ \t]*$/gm, ' ')
  /*
          표 구분자·강조 표시·이스케이프를 **한 번에** 훑는다. 나눠서 돌리면 서로를 먹는다 —
          `1\~4주` 에서 표시를 먼저 걷으면 `~` 가 취소선으로 지워지고, 이스케이프를 먼저 풀면
          되살아난 `~` 를 다음 줄이 지운다. 왼쪽에서 한 번만 지나가면 그럴 자리가 없다.
          (그 `\~` 는 우리 저장 경로가 붙인 것이다 — `본문md.vue` 「실측」의 셋째 항목.)

          지우는 표시는 **우리 저장 경로가 실제로 뱉는 것**만이다. 홑 `~` 는 사람이 범위를 적는
          글자라 두고(`1~4주`), 홑 `_` 도 남긴다 — 기울임은 `*` 로 나가므로 `_` 가 나올 자리가 없고,
          지우면 `snake_case` 만 갉힌다.
        */
    .replace(/\\([\\`*_{}[\]()#+\-.!~|>])|\*{1,3}|_{2,3}|~~|`+|\|/g,
      (전체, 이스케이프?: string) => 이스케이프 ?? (전체 === '|' ? ' ' : ''))
    .replace(/\s+/g, ' ')
    .trim()
}

/** 게터 한 칸 읽기. 모델 게터는 던질 수 있으므로 감싼다. */
export function 행값(row: unknown, field: string): string {
  try { return 값문자열((row as Record<string, unknown>)?.[field]) } catch { return '' }
}

/**
 * 상한까지 자른 뒤 공백을 정규화한다. **순서가 핵심** —
 * 80,000자짜리 본문에 정규식을 먼저 돌리고 200자만 쓰면 그 비용이 통째로 낭비된다.
 */
export function 잘라정규화(v: unknown, 상한 = Number.POSITIVE_INFINITY): string {
  const s = 값문자열(v)
  const is잘림 = s.length > 상한
  const cut = is잘림 ? s.slice(0, 상한) : s
  return cut.replace(/\s+/g, ' ').trim() + (is잘림 ? '…' : '')
}

export interface i검색점수 { 점수: number, 맞은키워드s: string[] }

/**
 * 행 하나의 관련도. 한 키워드도 못 맞으면 `null`(= 검색 결과에서 탈락).
 *
 * 키워드끼리는 **OR**다(AND면 한 단어만 빗나가도 0건이 된다). 대신 맞은 개수가 점수에 쌓인다.
 * 필드 가중치는 `필드s`의 **선언 순서**가 곧 가중치다 — 모델이 `['제목','요약','내용']`으로
 * 적어두면 제목에서 맞은 게 본문에서 맞은 것보다 위로 온다. 별도 설정이 필요 없다.
 */
export function 검색평가(row: unknown, 필드s: readonly string[], 정규식s: readonly i검색정규식[]): i검색점수 | null {
  if (!정규식s.length) return { 점수: 0, 맞은키워드s: [] }

  let 점수 = 0
  const 맞은 = new Set<string>()

  필드s.forEach((field, i) => {
    const 가중치 = 필드s.length - i
    const s = 행값(row, field)
    if (!s) return
    for (const { 키워드, re } of 정규식s) {
      re.lastIndex = 0
      if (re.test(s)) { 점수 += 가중치; 맞은.add(키워드) }
    }
  })

  return 맞은.size ? { 점수, 맞은키워드s: [...맞은] } : null
}

/**
 * 목록5 검색창용 — 질의 한 줄을 통째로 한 키워드로 본다(기존 `includes` 동작 + 공백/기호 무시).
 * `필드s`가 비면 `label`/`sub`만 본다 = 이 파일이 들어오기 전 목록5의 동작 그대로.
 */
export function 행검색매칭(row: unknown, 필드s: readonly string[] | undefined, 질의: string): boolean {
  const q = String(질의 ?? '').trim()
  if (!q) return true

  const re = 검색정규식(q)
  if (!re) return true

  const 대상 = 필드s?.length ? 필드s : ['label', 'sub']
  return 대상.some((f) => { re.lastIndex = 0; return re.test(행값(row, f)) })
}

/** 겹치거나 맞닿은 구간을 하나로 합친다(시작 오름차순 전제). */
function 구간병합(구간s: [number, number][]): [number, number][] {
  const 정렬 = [...구간s].sort((a, b) => a[0] - b[0])
  const out: [number, number][] = []
  for (const g of 정렬) {
    const last = out.at(-1)
    if (last && g[0] <= last[1]) last[1] = Math.max(last[1], g[1])
    else out.push([g[0], g[1]])
  }
  return out
}

/**
 * 매칭 구간 앞뒤만 잘라낸 발췌. 예산 안에 전문이 들어가면 전문을 그대로 준다.
 *
 * 창 크기는 **예산에 맞춰 늘어난다.** 고정 폭(±150)으로 두면 매칭이 한 군데뿐인 문서에서
 * 예산이 2,500자여도 300자만 쓰고 끝나버린다 — 예산을 나눠준 의미가 없어진다.
 *
 * 매칭이 하나도 없으면(= 다른 필드에서 걸린 행) 앞머리를 준다 — 빈 문자열보다 낫다.
 */
export function 스니펫추출(
  원문: string,
  정규식s: readonly i검색정규식[],
  예산: number,
  opts?: { 최소앞뒤?: number, 최대구간?: number }
): string {
  if (예산 <= 0 || !원문) return ''
  if (원문.length <= 예산) return 원문.replace(/\s+/g, ' ').trim()

  const 최소앞뒤 = opts?.최소앞뒤 ?? 150
  const 최대구간 = opts?.최대구간 ?? 3

  // 1) 매칭 위치만 먼저 모은다 — 창 크기를 정하려면 창이 몇 개인지부터 알아야 한다.
  const 위치s: [number, number][] = []
  for (const { re } of 정규식s) {
    re.lastIndex = 0
    let m: RegExpExecArray | null
    let n = 0
    while (n < 최대구간 && (m = re.exec(원문)) !== null) {
      위치s.push([m.index, m.index + m[0].length])
      n++
      if (m[0].length === 0) re.lastIndex++ // 0폭 매칭 무한루프 방지
    }
  }

  if (!위치s.length) return 잘라정규화(원문, 예산)

  // 2) 예산을 창 개수로 나눠 앞뒤 폭을 정한다.
  const 창수 = Math.min(위치s.length, 최대구간)
  const 앞뒤 = Math.max(최소앞뒤, Math.floor(예산 / 창수 / 2))

  const 구간s: [number, number][] = 위치s.map(([s, e]) => [
    Math.max(0, s - 앞뒤),
    Math.min(원문.length, e + 앞뒤)
  ])

  let 병합 = 구간병합(구간s)

  // 3) 매칭이 몰려 있으면 창이 하나로 합쳐지면서 예산이 남는다. 남은 만큼 양쪽으로 넓힌다.
  //    이 한 번의 재확장이 없으면 "예산 2,500자"를 줘도 350자만 쓰고 끝난다.
  const 합계 = 병합.reduce((s, [a, b]) => s + (b - a), 0)
  if (합계 < 예산) {
    const 여유 = Math.floor((예산 - 합계) / (병합.length * 2))
    if (여유 > 0) {
      병합 = 구간병합(병합.map(([a, b]) => [
        Math.max(0, a - 여유),
        Math.min(원문.length, b + 여유)
      ] as [number, number]))
    }
  }

  const 조각s: string[] = []
  let 남음 = 예산
  for (const [s, e] of 병합.slice(0, 최대구간)) {
    if (남음 <= 0) break
    const 끝 = Math.min(e, s + 남음)
    const 조각 = 원문.slice(s, 끝).replace(/\s+/g, ' ').trim()
    if (!조각) continue
    남음 -= 끝 - s
    조각s.push(`${s > 0 ? '…' : ''}${조각}${끝 < 원문.length ? '…' : ''}`)
  }
  return 조각s.join(' ')
}

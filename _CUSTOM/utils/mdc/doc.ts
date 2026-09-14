/**
 * 본문 객체 — **사람이 만지는 원본은 md 문자열이 아니라 문서 객체(ProseMirror JSON)다.**
 * 다만 **저장 형식은 md 문자열이고, 그게 최종이다**(아래 「저장은 md 다」). 이 파일은 그 둘 사이의 다리다.
 *
 * ## 왜 편집 원본이 객체인가 (2026-09-06)
 *
 * 「보이는 대로 고치기」(`/decisions/content/wysiwyg`)의 판정 셋 — 문법이 한 글자도 안 보인다 · 화면이 하나다 ·
 * 어휘 밖은 못 만진다 — 을 md 문자열 위에서 채우려다 하루를 썼다(CodeMirror 라이브 프리뷰 → 커서 튐 →
 * 「대가」로 문서화). 원인은 하나였다. **화면이 원본의 번역본**이면 미리보기 창이 존재 이유를 잃지 않고,
 * `**` 가 글자로 있으면 커서가 튄다. 원본이 객체면 둘 다 요구에서 사라진다 — 화면은 번역본이 아니라
 * 원본 그 자체고, 굵게는 글자가 아니라 표시(mark)다.
 *
 * 왕복 무손실 문제는 **사라지지 않고 자리를 옮긴다.** 사람이 고치는 동안에는 객체뿐이라 문제가 없고,
 * 왕복은 저장·불러오기 경계에서만 돈다. 그리고 그 왕복은 남의 어휘 두 파서(marked·remark)가 아니라
 * **우리 어휘 + 한 파서(remark-mdc)** 위에서 돈다 — 잴 수 있고 고칠 수 있는 종류다.
 * (두 파서였을 때를 재 본 적이 있다: TipTap 의 marked 로 쓰고 `<MDC>` 의 remark 로 읽으면 실제 자료
 * 10건 중 9건이 왕복에서 달라졌고, 표 재정렬 같은 서식뿐 아니라 `- [x]` 가 통째로 사라졌다. 2026-09-05.)
 * 실제로 재 봤고 결과는 아래 「아는 손실」과 `본문md.vue` 머리말에 있다.
 * (도우미가 본문을 쓰는 건 아직 없다 — `aiV2/source.ts` 가 본문을 계약에서 뺐다.)
 *
 * ## 길은 셋이다
 *
 * | 길 | 언제 | 함수 |
 * |---|---|---|
 * | md → 객체 | **폼을 열 때마다** · 도우미가 md 를 낼 때마다 | `md에서문서` |
 * | 객체 → md | **저장할 때마다** · 도우미가 읽을 때 | `문서에서md` |
 * | 객체 → 평문 | 검색·발췌. 파생값이라 언제든 다시 만든다 | `문서평문` |
 *
 * 양쪽 다 **읽기 렌더러와 같은 파서**(`@nuxtjs/mdc` 의 remark-mdc)를 쓴다. 파서가 한 벌이라 「본 것 = 나오는 것」이
 * 정의상 참이다. 이 파일이 하는 일은 그 파서의 트리(MDC 트리 —
 * `element`·`text`)와 문서 객체 사이의 **구조 매핑**뿐이다. md 문법은 여기서 한 글자도 안 다룬다.
 *
 * ## 어휘가 닫히는 자리
 *
 * 노드 이름은 사전(`blocks.ts`)의 md 이름 그대로다(`note`·`steps`…). 하이픈 이름만 camel 로 바꾼다
 * (`tabs-item`→`tabsItem`) — ProseMirror content 식이 하이픈을 못 읽어서다. 속성도 사전의 `속성` 목록에 있는
 * 것만 들인다(`속성s`). 그래서 `::note{color="red"}` 가 들어와도 `color` 는 객체에 실리지 않는다 —
 * **어휘 밖은 생길 수가 없다.** 그게 곧 세 번째 판정이다.
 *
 * 사전에 없는 ASCII 블록(`::foo`)은 `unknown` 노드가 이름·속성·알맹이를 그대로 들고 있다가 그대로 뱉는다.
 * 지어내지도 버리지도 않는다. 이름이 한글인 `::뭐시기` 는 파서가 글자로 읽으므로(`blocks.ts` 「ASCII」)
 * 여기까지 오지 않고 문단이 된다.
 *
 * ## 아는 손실 (2026-09-06)
 *
 * - **태스크리스트(`- [x]`)** 는 문서에 체크박스 노드가 없다. 들일 때 `☑ `·`☐ ` 글자로 바꾼다 — 보이기는 하고
 *   되돌아가진 않는다. mdc 의 stringify 도 체크박스를 잃어서(`hast-util-to-mdast` 가 `mdc-element` 를 못 알아본다)
 *   지금은 양쪽 다 없다. `resources` 10건 중 몇에 있다.
 * - **부드러운 줄바꿈**(`\n`)은 들일 때 공백이 된다. 편집판은 `white-space: pre-wrap` 이라 `\n` 을 그대로
 *   두면 줄이 갈리는데, 읽기 렌더러(HTML)는 공백으로 접는다. 화면이 같으려면 공백이어야 한다.
 * - 나가는 md 의 표는 칸 폭이 맞춰지고 속성 순서가 사전순이 된다(2026-09-06 실측).
 * - **줄마다 칸 수가 다른 표**는 들일 때 가장 긴 줄에 맞춰 빈 칸이 채워진다(`네모로`). ProseMirror 의 표가
 *   직사각형이라야 해서 고르는 게 아니라 지켜야 하는 것이고, 나갈 때 그 빈 칸이 `||` 로 같이 나간다.
 *
 * ## 저장은 md 다 (2026-09-06 결정)
 *
 * 폼 칸(`타입지정._.문자md`)은 md 문자열을 저장하고, **그게 임시가 아니라 정한 것이다.**
 * 한동안 「객체로 옮기는 게 방향인데 아직 못 갔다」고 적어 뒀는데, 옮길 이유가 실제로는 없었다 —
 * md 저장이 주는 것(git diff · `.md` 내보내기 · 도우미 토큰 · 읽기 화면 `<MDC>`)을 이미 다 받고 있고,
 * 객체 저장이 더 주는 건 위 「아는 손실」을 저장 경계에서 없애는 것 하나인데 그 값이 실측으로 작았다.
 * 한 번 저장하면 정규화되고 그 뒤로는 고정이며, 보이는 글자는 13건 전부 저장 전후가 같다.
 * 대신 `localDB` 13건 마이그레이션과 읽기 화면 교체를 치러야 했다.
 *
 * 그래서 위 손실 목록은 **출력이 아니라 저장에** 걸린다. 무엇을 감수하고 무엇이 아직 안 걸리는지는
 * `app/components/m/Editor/md.vue` 머리말이 정본이다. **다시 볼 조건은 하나** — 본문에
 * 태스크리스트(`- [x]`)가 실제로 쓰이기 시작하면 그때는 저장 형식을 옮겨야 한다(지금은 해당 0건).
 */
import { MDC블록s, 자식블록s } from './blocks'

export interface iPM마크 { type: string, attrs?: Record<string, unknown> }
export interface iPM노드 {
  type: string
  attrs?: Record<string, unknown>
  content?: iPM노드[]
  text?: string
  marks?: iPM마크[]
}

/** `@nuxtjs/mdc` 파서가 내는 트리. `MDCRoot`·`MDCElement`·`MDCText` 를 느슨하게 받는다. */
export interface iMDC노드 {
  type: string
  tag?: string
  props?: Record<string, unknown>
  children?: iMDC노드[]
  value?: string
}

export const 빈문서: iPM노드 = { type: 'doc', content: [{ type: 'paragraph' }] }

const 하이픈이름s: Record<string, string> = { 'tabs-item': 'tabsItem', 'accordion-item': 'accordionItem', 'card-group': 'cardGroup' }
const camel이름s: Record<string, string> = Object.fromEntries(Object.entries(하이픈이름s).map(([a, b]) => [b, a]))
/** md 이름(태그) → 문서 노드 이름. */
export const 노드타입of = (tag: string) => 하이픈이름s[tag] ?? tag
/** 문서 노드 이름 → md 이름(태그). */
export const 태그of = (type: string) => camel이름s[type] ?? type

/** 사전 블록 태그 전부(자식 포함). 인라인(`badge`)도 든다. */
const 사전태그s = new Set<string>([...MDC블록s.map(b => b.이름), ...Object.keys(자식블록s)])
/** 알맹이가 없는 것 — 화면에서 한 덩어리(atom)다. `youtube` 는 사전에 `본문있음` 이지만 렌더러가 알맹이를 안 그린다. */
const 원자태그s = new Set(['youtube', 'list', 'download'])
const 인라인태그s = new Set(['strong', 'b', 'em', 'i', 'code', 'a', 'del', 's', 'badge', 'br', 'span', 'kbd', 'input'])

const 속성이름s: Record<string, string[]> = {}
for (const b of MDC블록s) 속성이름s[b.이름] = (b.속성 ?? []).map(a => a.이름)
for (const [k, v] of Object.entries(자식블록s)) 속성이름s[k] = v.속성

/** 사전이 허락한 속성만, 문자열로. 나머지는 여기서 떨어진다. */
function 속성s(tag: string, props: Record<string, unknown> | undefined): Record<string, string> {
  const out: Record<string, string> = {}
  for (const k of 속성이름s[tag] ?? []) {
    const v = props?.[k]
    if (v !== undefined && v !== null && v !== '') out[k] = String(v)
  }
  return out
}

const 텍스트 = (n: iMDC노드): string =>
  n.type === 'text' ? String(n.value ?? '') : (n.children ?? []).map(텍스트).join('')

// ───────────────────────────── md(MDC 트리) → 문서 ─────────────────────────────

export function MDC트리에서문서(root: iMDC노드): iPM노드 {
  const content = 블록s(root.children ?? [])
  return { type: 'doc', content: content.length ? content : [{ type: 'paragraph' }] }
}

/** 블록과 인라인이 섞인 자식 열을 블록 열로. 인라인이 이어지면 문단 하나로 묶는다. */
function 블록s(자식s: iMDC노드[]): iPM노드[] {
  const out: iPM노드[] = []
  let 묶음: iMDC노드[] = []
  const 털기 = () => {
    if (묶음.length) {
      const p = 문단(묶음)
      if (p) out.push(p)
    }
    묶음 = []
  }
  for (const n of 자식s) {
    if (n.type === 'text' || (n.type === 'element' && 인라인태그s.has(n.tag ?? ''))) {
      묶음.push(n)
      continue
    }
    if (n.type !== 'element') continue
    털기()
    out.push(...블록(n))
  }
  털기()
  return out
}

/** 비어도 문단 하나는 둔다 — 컨테이너 알맹이가 `block+` 이라 비면 스키마가 거절한다. */
const 블록s또는문단 = (자식s: iMDC노드[]): iPM노드[] => {
  const b = 블록s(자식s)
  return b.length ? b : [{ type: 'paragraph' }]
}

/** 목록 항목은 첫 알맹이가 문단이어야 한다(`listItem: paragraph block*`). */
function 목록항목알맹이(자식s: iMDC노드[]): iPM노드[] {
  const b = 블록s또는문단(자식s)
  return b[0]!.type === 'paragraph' ? b : [{ type: 'paragraph' }, ...b]
}

function 문단(인라인묶음: iMDC노드[]): iPM노드 | null {
  const content = 병합(양끝정리(인라인s(인라인묶음)))
  if (!content.length) return null
  return { type: 'paragraph', content }
}

function 블록(el: iMDC노드): iPM노드[] {
  const tag = el.tag ?? ''
  const props = el.props ?? {}
  const 자식 = el.children ?? []
  switch (tag) {
    case 'p': return 문단들(자식)
    case 'h1': case 'h2': case 'h3': case 'h4': case 'h5': case 'h6': {
      const content = 병합(양끝정리(인라인s(자식)))
      return [{ type: 'heading', attrs: { level: Math.min(4, Number(tag[1])) }, content: content.length ? content : undefined }]
    }
    case 'ul': case 'ol': return [목록(el)]
    case 'table': return [표(el)]
    case 'pre': return [코드블록(el)]
    case 'blockquote': return [{ type: 'blockquote', content: 블록s또는문단(자식) }]
    case 'hr': return [{ type: 'horizontalRule' }]
    case 'img': return [그림(props)]
    case 'div': case 'section': return 블록s(자식) // 껍데기만 벗긴다
    case 'br': case 'input': case 'template': return []
  }
  if (원자태그s.has(tag)) return [{ type: tag, attrs: 속성s(tag, props) }]
  if (사전태그s.has(tag)) return [컨테이너(tag, props, 자식)]
  // 사전 밖 — 지어내지 않고 그대로 든다. 나갈 때 그대로 나간다.
  return [{ type: 'unknown', attrs: { tag, props: { ...props } }, content: 블록s또는문단(자식) }]
}

/** 문단 안에 블록이 끼어 있으면(`p > img`, `:list{…}` 한 줄) 문단을 갈라 블록을 밖으로 낸다. */
function 문단들(자식: iMDC노드[]): iPM노드[] {
  const out: iPM노드[] = []
  let 묶음: iMDC노드[] = []
  const 털기 = () => {
    const p = 문단(묶음)
    if (p) out.push(p)
    묶음 = []
  }
  for (const c of 자식) {
    const tag = c.type === 'element' ? (c.tag ?? '') : ''
    const 블록인가 = tag === 'img' || ((사전태그s.has(tag) || 원자태그s.has(tag)) && !인라인태그s.has(tag))
    if (블록인가) {
      털기()
      out.push(...블록(c))
    } else {
      묶음.push(c)
    }
  }
  털기()
  return out.length ? out : [{ type: 'paragraph' }]
}

function 컨테이너(tag: string, props: Record<string, unknown>, 자식: iMDC노드[]): iPM노드 {
  const type = 노드타입of(tag)
  const attrs = 속성s(tag, props)
  switch (tag) {
    case 'tabs':
    case 'accordion': {
      // 자식은 `tabs-item`·`accordion-item` 만이다. 밖에 떠도는 알맹이는 이름 없는 항목으로 거둔다.
      const 항목태그 = `${tag}-item`
      const 항목 = (p: Record<string, unknown>, c: iMDC노드[]): iPM노드 =>
        ({ type: 노드타입of(항목태그), attrs: 속성s(항목태그, p), content: 블록s또는문단(c) })
      const items: iPM노드[] = []
      let 떠도는: iMDC노드[] = []
      for (const c of 자식) {
        if (c.type === 'element' && c.tag === 항목태그) {
          if (떠도는.some(실속있음)) items.push(항목({}, 떠도는))
          떠도는 = []
          items.push(항목(c.props ?? {}, c.children ?? []))
        } else {
          떠도는.push(c)
        }
      }
      if (떠도는.some(실속있음)) items.push(항목({}, 떠도는))
      if (!items.length) items.push(항목({}, []))
      return { type, attrs, content: items }
    }
    case 'card-group': {
      const cards: iPM노드[] = []
      let 떠도는: iMDC노드[] = []
      for (const c of 자식) {
        if (c.type === 'element' && c.tag === 'card') {
          if (떠도는.some(실속있음)) cards.push(컨테이너('card', {}, 떠도는))
          떠도는 = []
          cards.push(컨테이너('card', c.props ?? {}, c.children ?? []))
        } else {
          떠도는.push(c)
        }
      }
      if (떠도는.some(실속있음)) cards.push(컨테이너('card', {}, 떠도는))
      if (!cards.length) cards.push(컨테이너('card', {}, []))
      return { type, attrs, content: cards }
    }
    case 'photo': {
      // 캡션은 없어도 된다(`block*`).
      const content = 블록s(자식)
      return { type, attrs, content: content.length ? content : undefined }
    }
    default:
      return { type, attrs, content: 블록s또는문단(자식) }
  }
}

const 실속있음 = (n: iMDC노드) => n.type === 'element' || !!String(n.value ?? '').trim()

function 목록(el: iMDC노드): iPM노드 {
  const ol = el.tag === 'ol'
  const items: iPM노드[] = []
  for (const li of el.children ?? []) {
    if (li.type !== 'element' || li.tag !== 'li') continue
    let 자식 = li.children ?? []
    // 태스크리스트 — 체크박스 노드가 없어 글자로 남긴다(머리말 「아는 손실」).
    const 체크 = 자식.find(c => c.type === 'element' && c.tag === 'input')
    if (체크) {
      자식 = [{ type: 'text', value: 체크.props?.checked ? '☑ ' : '☐ ' }, ...자식.filter(c => c !== 체크)]
    }
    items.push({ type: 'listItem', content: 목록항목알맹이(자식) })
  }
  if (!items.length) items.push({ type: 'listItem', content: [{ type: 'paragraph' }] })
  const start = Number(el.props?.start)
  return {
    type: ol ? 'orderedList' : 'bulletList',
    attrs: ol && start > 1 ? { start } : undefined,
    content: items
  }
}

function 표(el: iMDC노드): iPM노드 {
  const rows: iPM노드[] = []
  for (const 구역 of el.children ?? []) {
    if (구역.type !== 'element') continue
    const trs = 구역.tag === 'tr' ? [구역] : (구역.children ?? []).filter(c => c.type === 'element' && c.tag === 'tr')
    for (const tr of trs) {
      const cells: iPM노드[] = []
      for (const c of tr.children ?? []) {
        if (c.type !== 'element' || (c.tag !== 'th' && c.tag !== 'td')) continue
        cells.push({
          type: c.tag === 'th' ? 'tableHeader' : 'tableCell',
          attrs: { align: (c.props?.align as string | undefined) ?? null },
          content: 블록s또는문단(c.children ?? [])
        })
      }
      if (cells.length) rows.push({ type: 'tableRow', content: cells })
    }
  }
  if (!rows.length) rows.push({ type: 'tableRow', content: [{ type: 'tableCell', content: [{ type: 'paragraph' }] }] })
  네모로(rows)
  return { type: 'table', content: rows }
}

/**
 * **줄마다 칸 수가 다른 표를 직사각형으로 채운다.** ProseMirror 의 표는 직사각형이라야 하고, 어긋난 채로
 * 들어오면 편집판이 가장 긴 줄만큼 칸을 세워 놓고 짧은 줄을 그 사이에 흩어 그린다 — 머리줄은 세 칸인데 표는
 * 여덟 칸으로 벌어지고 몸줄의 글이 엉뚱한 칸에 가 붙는 그림이 그것이다.
 * GFM 파서는 맞춰 주지만 md 안의 날 HTML 표는 안 맞춰 준다. 그 자리를 여기서 막는다.
 *
 * 채우는 칸은 **그 줄의 칸 종류를 따른다** — 머리줄에는 `th`, 몸줄에는 `td`. `표요소` 가 「칸이 전부 `th` 인 줄」로
 * 머리줄을 가리기 때문에, 머리줄에 `td` 를 채우면 그 줄이 몸으로 굴러떨어진다.
 * (`colspan` 은 세지 않는다 — 이 파서는 `align` 말고는 칸 속성을 들이지 않아서 늘 1 이다.)
 */
function 네모로(rows: iPM노드[]) {
  const 폭 = Math.max(...rows.map(r => (r.content ?? []).length))
  for (const r of rows) {
    const cells = r.content ?? []
    const 종류 = cells.length && cells.every(c => c.type === 'tableHeader') ? 'tableHeader' : 'tableCell'
    while (cells.length < 폭) cells.push({ type: 종류, attrs: { align: null }, content: [{ type: 'paragraph' }] })
    r.content = cells
  }
}

function 코드블록(el: iMDC노드): iPM노드 {
  const props = el.props ?? {}
  const text = String(props.code ?? 텍스트(el)).replace(/\n$/, '')
  return {
    type: 'codeBlock',
    attrs: { language: props.language ? String(props.language) : null },
    content: text ? [{ type: 'text', text }] : undefined
  }
}

const 그림 = (props: Record<string, unknown>): iPM노드 => ({
  type: 'image',
  attrs: { src: String(props.src ?? ''), alt: props.alt ? String(props.alt) : null, title: props.title ? String(props.title) : null }
})

const 마크더함 = (marks: iPM마크[], m: iPM마크) => marks.some(x => x.type === m.type) ? marks : [...marks, m]

function 인라인s(자식: iMDC노드[], marks: iPM마크[] = []): iPM노드[] {
  const out: iPM노드[] = []
  for (const c of 자식) {
    if (c.type === 'text') {
      const t = String(c.value ?? '').replace(/\n/g, ' ')
      if (t) out.push({ type: 'text', text: t, marks: marks.length ? marks : undefined })
      continue
    }
    if (c.type !== 'element') continue
    const kids = c.children ?? []
    switch (c.tag) {
      case 'strong': case 'b':
        out.push(...인라인s(kids, 마크더함(marks, { type: 'bold' })))
        break
      case 'em': case 'i':
        out.push(...인라인s(kids, 마크더함(marks, { type: 'italic' })))
        break
      case 'del': case 's':
        out.push(...인라인s(kids, 마크더함(marks, { type: 'strike' })))
        break
      case 'badge':
        out.push(...인라인s(kids, 마크더함(marks, { type: 'badge' })))
        break
      case 'code': {
        const t = 텍스트(c)
        if (t) out.push({ type: 'text', text: t, marks: 마크더함(marks, { type: 'code' }) })
        break
      }
      case 'a': {
        const href = String(c.props?.href ?? '')
        out.push(...인라인s(kids, 마크더함(marks, { type: 'link', attrs: { href, target: c.props?.target ? String(c.props.target) : null } })))
        break
      }
      case 'br':
        out.push({ type: 'hardBreak' })
        break
      case 'input': break
      default: out.push(...인라인s(kids, marks)) // 모르는 인라인 — 껍데기만 버린다
    }
  }
  return out
}

/** 문단 양끝 공백. md 의 줄바꿈이 공백으로 바뀌어 앞뒤에 남는다. */
function 양끝정리(nodes: iPM노드[]): iPM노드[] {
  const out = [...nodes]
  while (out.length && out[0]!.type === 'text') {
    const t = out[0]!.text!.replace(/^\s+/, '')
    if (t) {
      out[0] = { ...out[0]!, text: t }
      break
    }
    out.shift()
  }
  while (out.length && out[out.length - 1]!.type === 'text') {
    const t = out[out.length - 1]!.text!.replace(/\s+$/, '')
    if (t) {
      out[out.length - 1] = { ...out[out.length - 1]!, text: t }
      break
    }
    out.pop()
  }
  return out
}

/** 같은 마크의 글자 노드가 붙어 있으면 하나로. ProseMirror 는 JSON 에서 그걸 안 합쳐 준다. */
function 병합(nodes: iPM노드[]): iPM노드[] {
  const out: iPM노드[] = []
  for (const n of nodes) {
    const 앞 = out[out.length - 1]
    if (앞 && 앞.type === 'text' && n.type === 'text' && JSON.stringify(앞.marks ?? []) === JSON.stringify(n.marks ?? [])) {
      out[out.length - 1] = { ...앞, text: (앞.text ?? '') + (n.text ?? '') }
    } else {
      out.push(n)
    }
  }
  return out
}

// ───────────────────────────── 문서 → md(MDC 트리) ─────────────────────────────

const el = (tag: string, props: Record<string, unknown> = {}, children: iMDC노드[] = []): iMDC노드 => ({ type: 'element', tag, props, children })
const tx = (value: string): iMDC노드 => ({ type: 'text', value })

/** 비어 있는 값을 빼고 문자열로. 속성은 md 에 `{k="v"}` 로 나가므로 문자열이어야 한다. */
function 정리(obj: Record<string, unknown> | undefined): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(obj ?? {})) if (v !== undefined && v !== null && v !== '') out[k] = String(v)
  return out
}

export function 문서에서MDC트리(doc: iPM노드): iMDC노드 {
  return { type: 'root', children: 요소s(doc.content ?? []) }
}

const 요소s = (nodes: iPM노드[]): iMDC노드[] => nodes.flatMap(요소)

function 요소(n: iPM노드): iMDC노드[] {
  const c = n.content ?? []
  const a = n.attrs ?? {}
  switch (n.type) {
    case 'paragraph': return [el('p', {}, 인라인요소s(c))]
    case 'heading': return [el(`h${a.level ?? 2}`, {}, 인라인요소s(c))]
    case 'text': case 'hardBreak': return 인라인요소s([n])
    case 'bulletList': return [el('ul', {}, 요소s(c))]
    case 'orderedList': return [el('ol', Number(a.start) > 1 ? { start: String(a.start) } : {}, 요소s(c))]
    case 'listItem': return [el('li', {}, 요소s(c))]
    case 'blockquote': return [el('blockquote', {}, 요소s(c))]
    case 'horizontalRule': return [el('hr')]
    case 'codeBlock': {
      const code = 문서평문(n)
      const language = a.language ? String(a.language) : undefined
      return [el('pre', { code: `${code}\n`, ...(language ? { language, className: [`language-${language}`] } : {}) }, [el('code', {}, [tx(`${code}\n`)])])]
    }
    case 'image': return [el('img', 정리({ src: a.src, alt: a.alt, title: a.title }))]
    case 'table': return [표요소(n)]
    case 'unknown': return [el(String(a.tag ?? 'div'), 정리(a.props as Record<string, unknown> | undefined), 요소s(c))]
    // 알맹이 없는 블록 — 빈 문단을 하나 넣어야 `::name{…}\n::` 블록 꼴로 나간다. 안 넣으면 `:name{…}` 한 줄이 된다.
    case 'youtube': case 'list': case 'download': return [el(n.type, 정리(속성s(n.type, a)), [el('p')])]
    case 'photo': return [el('photo', 정리(속성s('photo', a)), c.length ? 요소s(c) : [el('p')])]
  }
  const tag = 태그of(n.type)
  if (사전태그s.has(tag)) return [el(tag, 정리(속성s(tag, a)), 요소s(c))]
  return 요소s(c) // 모르는 노드 — 알맹이만 살린다
}

/** md 에 있는 마크만, 늘 같은 순서로 겹친다. 순서가 흔들리면 같은 글이 다른 md 가 된다. */
const 마크순서 = ['link', 'badge', 'bold', 'italic', 'strike', 'code']
const 마크태그: Record<string, string> = { bold: 'strong', italic: 'em', strike: 'del', code: 'code', badge: 'badge', link: 'a' }

/**
 * 글자 노드 열을 마크 트리로. 이웃한 글자가 같은 마크를 나눠 가지면 **하나의 요소**로 감싼다 —
 * 글자마다 따로 감싸면 `**a****b**` 같은 md 가 나와 파서가 다르게 읽는다.
 */
function 인라인요소s(nodes: iPM노드[]): iMDC노드[] {
  const root = el('_')
  const 스택: { mark: iPM마크, el: iMDC노드 }[] = []
  const 같음 = (x: iPM마크, y: iPM마크) => x.type === y.type && JSON.stringify(x.attrs ?? {}) === JSON.stringify(y.attrs ?? {})
  for (const n of nodes) {
    const marks = n.type === 'text'
      ? [...(n.marks ?? [])].filter(m => 마크태그[m.type]).sort((x, y) => 마크순서.indexOf(x.type) - 마크순서.indexOf(y.type))
      : []
    let i = 0
    while (i < 스택.length && i < marks.length && 같음(스택[i]!.mark, marks[i]!)) i++
    스택.length = i
    for (; i < marks.length; i++) {
      const m = marks[i]!
      const e = el(마크태그[m.type]!, m.type === 'link' ? 정리({ href: m.attrs?.href, target: m.attrs?.target }) : {})
      ;(스택.length ? 스택[스택.length - 1]!.el : root).children!.push(e)
      스택.push({ mark: m, el: e })
    }
    const 부모 = 스택.length ? 스택[스택.length - 1]!.el : root
    if (n.type === 'text') 부모.children!.push(tx(n.text ?? ''))
    else if (n.type === 'hardBreak') 부모.children!.push(el('br'))
    else 부모.children!.push(...요소(n))
  }
  return root.children!
}

function 표요소(n: iPM노드): iMDC노드 {
  const rows = n.content ?? []
  const 머리 = rows.filter(r => (r.content ?? []).every(c => c.type === 'tableHeader'))
  const 몸 = rows.filter(r => !머리.includes(r))
  const 셀 = (c: iPM노드): iMDC노드 => {
    const align = c.attrs?.align ? { align: String(c.attrs.align) } : {}
    // 칸 알맹이는 인라인이어야 한다. 문단이 여럿이면 `br` 로 잇는다.
    const kids: iMDC노드[] = []
    ;(c.content ?? []).forEach((b, i) => {
      if (i) kids.push(el('br'))
      kids.push(...(b.type === 'paragraph' ? 인라인요소s(b.content ?? []) : 요소(b)))
    })
    return el(c.type === 'tableHeader' ? 'th' : 'td', align, kids)
  }
  const 행 = (r: iPM노드) => el('tr', {}, (r.content ?? []).map(셀))
  const children: iMDC노드[] = []
  if (머리.length) children.push(el('thead', {}, 머리.map(행)))
  if (몸.length) children.push(el('tbody', {}, 몸.map(행)))
  return el('table', {}, children) // props 는 비워야 한다 — 있으면 mdc 가 HTML 로 뱉는다
}

// ───────────────────────────── 입출력 ─────────────────────────────

/** md → 문서 객체. 읽기 렌더러(`<MDC>`)와 같은 파서를 쓴다. */
export async function md에서문서(md: string): Promise<iPM노드> {
  const { parseMarkdown } = await import('@nuxtjs/mdc/runtime')
  const r = await parseMarkdown(md ?? '', { toc: false, contentHeading: false } as never)
  return MDC트리에서문서(r.body as unknown as iMDC노드)
}

/**
 * md 를 뱉는 프로세서. **`stringifyMarkdown` 을 안 쓰고 직접 짓는 이유가 아래 한 가지뿐이다** —
 * `remark-mdc` 가 빠뜨린 `.peek` 를 되붙일 자리가 필요해서다. 그 밖의 설정은 `createStringifyProcessor`
 * 가 주는 그대로고(`stringifyMarkdown` 도 그걸 부른다), 우리가 고르는 값은 없다.
 *
 * ## 굵게 안이 문장부호로 끝나면 굵기가 사라지던 것 (2026-09-07 실측)
 *
 * `앞 **굵게.** 뒤` 를 저장하면 `앞 &#x2A;*굵게.** 뒤` 가 나왔다. 여는 별 하나가 문자참조로
 * 바뀌니 나머지가 기울임으로 재해석되고 **굵기는 통째로 없어진다.** 한국어 문장은 대개 `다.` 로
 * 끝나서 걸릴 자리가 넓었다(`.` `,` `!` `?` `)` 다 같고, 한글·영문을 안 가리며, `*`·`**` 둘 다).
 *
 * 층을 갈라 태워 책임을 특정했다. 같은 mdast, 같은 옵션이다.
 *
 * | 파이프라인 | 결과 |
 * |---|---|
 * | `stringify` 만 | `앞 **굵게.** 뒤` |
 * | `gfm` + `stringify` | `앞 **굵게.** 뒤` |
 * | **`mdc`** + `stringify` | `앞 &#x2A;*굵게.** 뒤` |
 *
 * `remark-mdc` 가 `**text**{.class}` 를 지원하려고 `strong`·`emphasis` 핸들러를 제 것으로
 * 갈아끼우면서 **`.peek` 를 안 물려준다**(`remark-mdc/dist/index.mjs` 의 `toMarkdown` handlers).
 * `.peek` 는 「이 핸들러가 뱉을 첫 글자」만 알려주는 곁가지인데, `mdast-util-to-markdown` 의
 * `containerPhrasing` 이 **다음 형제의 첫 글자**를 알려고 그걸 쓴다 — 없으면 **핸들러 본체를 통째로
 * 한 번 더 부른다.** 그 예행 호출이 `state.attentionEncodeSurroundingInfo` 를 세워 두고 나오고,
 * 부모는 그 플래그를 **지금 처리 중인 앞 텍스트 노드의 것으로 착각해** 다음 노드의 첫 글자를 인코딩한다.
 *
 * 문장부호로 끝날 때만 터지는 이유가 여기 있다 — 그 플래그는 강조 경계가 부호와 맞닿을 때만 선다.
 * `**굵게**` 는 예행 호출을 해도 남기는 게 없어 그냥 지나간다. 그리고 그 플래그를 세우는 핸들러는
 * 라이브러리 전체에 `strong`·`emphasis` **둘뿐이다**(실측). `remark-mdc` 는 `image`·`link`·
 * `inlineCode`·`textComponent` 도 `.peek` 없이 갈았지만, 그것들은 예행 호출이 낭비일 뿐 뒤에 남기는 게 없다.
 *
 * 그래서 되붙이는 것도 그 둘뿐이다. **기본 구현이 하는 일이 정확히 아래 한 줄씩**이고
 * (`strongPeek`·`emphasisPeek`), 프로세서가 `emphasis: '*'` 로 고정이라 값이 갈릴 자리도 없다.
 * `mdast-util-to-markdown` 을 import 할 필요가 없는 것도 그 때문이다 — 우리 의존성이 아니다.
 *
 * **들고 있는 건 손질이 변형이라서다.** `createStringifyProcessor` 는 부를 때마다 확장을 새로 만들어서
 * 손질도 그때마다 따라붙어야 한다 — 짓기와 손질을 한 함수에 묶어 두면 손질 안 된 판이 새어 나갈
 * 자리가 없다. 저장할 때마다 다시 안 짓는 건 덤이다.
 *
 * 고친 뒤 localDB 의 `문자md` 칸 78건을 전부 다시 태웠다 — `&#x2A;` 3건 → 0, 왕복 불안정 3건 → 0,
 * **출력이 달라진 행은 그 3건뿐**이고 나머지 75건은 바이트까지 같다(어휘 13개가 다 든 `docs` 포함).
 *
 * 상류가 고치면 걷을 자리다. `mdast-util-to-markdown` 2.1.2 · `remark-mdc` 3.11.1 에서 잰 것이고,
 * 이 곁가지(`attentionEncodeSurroundingInfo`)는 2.1.1 에 들어왔다.
 */
async function md프로세서짓기() {
  const { createStringifyProcessor } = await import('@nuxtjs/mdc/runtime')
  const p = createStringifyProcessor({})
  // `data()` 는 얼린 뒤에야 확장 목록을 내놓는다.
  p.freeze()

  type i핸들러 = { peek?: unknown }
  const 확장s = (p.data('toMarkdownExtensions') ?? []) as { handlers?: Record<string, i핸들러> }[]
  for (const 확장 of 확장s.flat()) {
    const h = 확장?.handlers
    if (!h) continue
    if (h.strong && !h.strong.peek) h.strong.peek = (_n: unknown, _p: unknown, s: { options: { strong?: string } }) => s.options.strong || '*'
    if (h.emphasis && !h.emphasis.peek) h.emphasis.peek = (_n: unknown, _p: unknown, s: { options: { emphasis?: string } }) => s.options.emphasis || '*'
  }
  return p
}

/** 지어둔 프로세서. **약속째로 들고 있는다** — 저장이 겹쳐도 짓는 일이 한 번이라야 손질도 한 번이다. */
let 굳힌md프로세서: ReturnType<typeof md프로세서짓기> | null = null

/** 문서 객체 → md. 도우미가 읽을 때 쓴다. 저장은 하지 않는다. */
export async function 문서에서md(doc: iPM노드): Promise<string> {
  const p = await (굳힌md프로세서 ??= md프로세서짓기())
  const r = await p.process({ value: JSON.stringify(문서에서MDC트리(doc)) })
  return `${String(r.value ?? '').trimEnd()}\n`
}

const 인라인노드s = new Set(['text', 'hardBreak'])

/** 검색·발췌용 평문. 카드 제목·탭 이름 같은 속성 글도 든다 — 사람이 읽는 글이니까. */
export function 문서평문(doc: iPM노드): string {
  const out: string[] = []
  const walk = (n: iPM노드) => {
    if (n.type === 'text') {
      out.push(n.text ?? '')
      return
    }
    if (n.type === 'hardBreak') {
      out.push('\n')
      return
    }
    const a = n.attrs ?? {}
    for (const k of ['title', 'label', 'alt']) if (typeof a[k] === 'string' && a[k]) out.push(`${a[k]}\n`)
    for (const c of n.content ?? []) walk(c)
    if (!인라인노드s.has(n.type) && n.type !== 'doc') out.push('\n')
  }
  walk(doc)
  return out.join('').replace(/[ \t]+\n/g, '\n').replace(/\n{2,}/g, '\n').trim()
}

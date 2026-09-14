/**
 * **본문 md → 한글 파일(.hwpx).** 쪽 보기의 「저장」이 부른다(`m쪽보기손잡이`). 짝은 `docx.ts`.
 *
 * ## 길 — 문서 객체 → 단순 HTML → `hwp-convert`
 *
 * HWPX(OWPML)는 zip 안의 XML 이라 손으로 지을 수는 있지만, 한글은 머리(`header.xml`)의 글자·문단 모양
 * 참조가 하나만 어긋나도 파일을 안 연다. 한글 없이 그걸 맞출 길이 없어서 **「한컴에서 실제로 열리는
 * HWPX」를 내건 `hwp-convert`(MIT)의 `htmlToHwpx` 에 맡긴다.** 우리가 하는 일은 그 입력 HTML 을 짓는 것뿐이다.
 *
 * 그 HTML 은 **읽기 화면의 DOM 이 아니라 문서 객체(`md에서문서`)에서 새로 짓는다.** 화면 DOM 은 Nuxt UI 의
 * 클래스·탭(고른 것 하나만 보임)이 섞여 변환기가 모르는 것투성이고, 문서 객체는 뜻만 들고 있다.
 * 어휘를 옮기는 규칙은 `docx.ts` 머리말의 표와 같다 — 알림·요점·인용·카드는 왼쪽 선 상자(`상자`), 탭·접기는 이름을 굵게 +
 * 알맹이를 펼쳐서, 영상·받기는 링크 한 줄, `::list` 는 「온라인에서」 한 줄.
 *
 * ## 종이
 *
 * A4 세로, 네 변 여백은 쪽 보기의 `여백mm`. 제목은 첫머리에 `#` 로 얹는다(인쇄·DOCX 와 같다).
 *
 * ## 아는 한계
 *
 * - **꼬리말(제목·쪽 번호)이 없다.** `hwp-convert` 가 머리말·꼬리말을 아직 못 짓는다(README 「향후 지원」).
 *   DOCX 에는 있다.
 * - 가로줄은 빈 문단이다. 취소선은 변환기가 모르면 글자만 남는다.
 * - **한글에서 열어 본 적이 없다(2026-09-14).** 이 컴퓨터에 한글이 없어서, 만든 파일의 zip 구조까지만 확인했다.
 * - 변환기 번들이 830KB 쯤이다. 부를 때 불러와서 읽기 화면에는 안 실린다.
 */
import { md에서문서, type iPM노드 } from './doc'
import { 그림png, 데이터주소, 주소 } from './저장공통'

/**
 * **인용 상자 = 왼쪽 선만 있는 div.** `<blockquote>` 를 주면 변환기가 글 앞에 「> 」 글자를 붙여 md 처럼 찍는다
 * (2026-09-14 실측). div 의 CSS 테두리는 한글 문단 테두리(borderFill)로 옮겨 준다.
 */
const 상자 = (안: string) => `<div style="border-left:2px solid #bfbfbf;border-top:0;border-right:0;border-bottom:0;padding-left:8px">${안}</div>`

const 이스케이프 = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

export async function md에서hwpx(md: string, 옵션: { 제목?: string, 여백mm: number }): Promise<Blob> {
  const 본문 = md || ''
  const 문서 = await md에서문서(옵션.제목 ? `# ${옵션.제목}\n\n${본문}` : 본문)
  /** 그림 최대 폭(px). A4 폭 794px 에서 좌우 여백을 뺀 것 — `docx.ts` 와 같은 셈. */
  const 그림최대폭 = 794 - 2 * Math.round(옵션.여백mm * 96 / 25.4)

  // ── 글자 ──────────────────────────────────────────────────────────────
  function 글자들(nodes: iPM노드[]): string {
    return nodes.map((n) => {
      if (n.type === 'hardBreak') return '<br>'
      if (n.type !== 'text') return ''
      let h = 이스케이프(n.text ?? '')
      const m = n.marks ?? []
      const 있음 = (t: string) => m.some(x => x.type === t)
      if (있음('code')) h = `<code>${h}</code>`
      if (있음('strike')) h = `<s>${h}</s>`
      if (있음('italic')) h = `<em>${h}</em>`
      if (있음('bold')) h = `<strong>${h}</strong>`
      const 링크 = m.find(x => x.type === 'link')
      if (링크) h = `<a href="${이스케이프(주소(String(링크.attrs?.href ?? '')))}">${h}</a>`
      return h
    }).join('')
  }

  const 문단 = (안: string, 정렬?: string) => `<p${정렬 ? ` style="text-align:${정렬}"` : ''}>${안 || '&nbsp;'}</p>`
  const 링크한줄 = (앞: string, 이름: string, href: string) =>
    문단(`${이스케이프(앞)}<a href="${이스케이프(주소(href))}">${이스케이프(이름)}</a>`)

  async function 그림(src: string, alt: string | null) {
    try {
      const { blob, 폭 } = await 그림png(src)
      return `<p><img src="${await 데이터주소(blob)}" width="${Math.min(폭, 그림최대폭)}" alt="${이스케이프(alt ?? '')}"></p>`
    } catch {
      return 문단(이스케이프(`[그림${alt ? `: ${alt}` : ''}]`))
    }
  }

  // ── 블록 ──────────────────────────────────────────────────────────────
  const 블록들 = async (nodes: iPM노드[], 정렬?: string): Promise<string> =>
    (await Promise.all(nodes.map(n => 블록(n, 정렬)))).join('\n')

  async function 블록(n: iPM노드, 정렬?: string): Promise<string> {
    const a = n.attrs ?? {}
    const c = n.content ?? []
    switch (n.type) {
      case 'paragraph':
        return 문단(글자들(c), 정렬)
      case 'heading': {
        const 수준 = Math.min(4, Math.max(1, Number(a.level ?? 2)))
        return `<h${수준}>${글자들(c)}</h${수준}>`
      }
      case 'bulletList':
      case 'orderedList': {
        const 태그 = n.type === 'orderedList' ? 'ol' : 'ul'
        const 항목s = await Promise.all(c.map(async (li) => {
          const [첫, ...나머지] = li.content ?? []
          const 머리 = 첫?.type === 'paragraph' ? 글자들(첫.content ?? []) : 첫 ? await 블록(첫) : ''
          return `<li>${머리}${나머지.length ? await 블록들(나머지) : ''}</li>`
        }))
        return `<${태그}>${항목s.join('')}</${태그}>`
      }
      case 'blockquote':
      case 'note':
      case 'point':
        return 상자(await 블록들(c, 정렬))
      case 'codeBlock':
        return `<pre>${이스케이프(c.map(t => t.text ?? '').join(''))}</pre>`
      case 'horizontalRule':
        return 문단('')
      case 'image':
        return 그림(String(a.src ?? ''), a.alt ? String(a.alt) : null)
      case 'photo':
        return `${await 그림(String(a.src ?? ''), a.alt ? String(a.alt) : null)}\n${await 블록들(c, 정렬)}`
      case 'table': {
        const 줄s = await Promise.all(c.map(async (r) => {
          const 칸s = await Promise.all((r.content ?? []).map(async (cell) => {
            const 태그 = cell.type === 'tableHeader' ? 'th' : 'td'
            return `<${태그}>${await 블록들(cell.content ?? [])}</${태그}>`
          }))
          return `<tr>${칸s.join('')}</tr>`
        }))
        return `<table>${줄s.join('')}</table>`
      }
      case 'tabsItem':
      case 'accordionItem':
      case 'card': {
        const 이름 = String(a.label ?? a.title ?? '')
        const 머리 = 이름 ? 문단(`<strong>${이스케이프(이름)}</strong>`) : ''
        const 알맹이 = await 블록들(c, 정렬)
        return n.type === 'card' ? 상자(`${머리}${알맹이}`) : `${머리}\n${알맹이}`
      }
      case 'align': {
        const to = String(a.to ?? '')
        return 블록들(c, ['center', 'right', 'justify'].includes(to) ? to : undefined)
      }
      case 'youtube':
        return a.url ? 링크한줄('영상: ', String(a.url), String(a.url)) : ''
      case 'download': {
        const url = String(a.url ?? '')
        if (!url) return ''
        return 링크한줄('파일: ', String(a.title ?? '') || decodeURIComponent(url.split('/').pop() ?? url), url)
      }
      case 'list':
        return 문단(`<em>${이스케이프(`${String(a.kind ?? '')} 목록은 온라인에서 볼 수 있습니다.`)}</em>`)
      default:
        // 탭·접기 묶음·나란히·절차·카드 묶음·사전 밖(`unknown`) — 알맹이만 차례로.
        return 블록들(c, 정렬)
    }
  }

  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${이스케이프(옵션.제목 ?? '')}</title></head><body>${await 블록들(문서.content ?? [])}</body></html>`
  const m = 옵션.여백mm
  const { htmlToHwpx } = await import('hwp-convert')
  const 바이트 = await htmlToHwpx(html, {
    title: 옵션.제목,
    page: { size: 'A4', orientation: 'portrait', margins: { left: m, right: m, top: m, bottom: m } }
  })
  return new Blob([바이트 as BlobPart], { type: 'application/hwp+zip' })
}

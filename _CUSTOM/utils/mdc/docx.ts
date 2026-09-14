/**
 * **본문 md → 워드 파일(.docx).** 쪽 보기의 「저장」이 부른다(`m쪽보기손잡이`).
 *
 * ## 길
 *
 * md 를 직접 읽지 않는다. `md에서문서`(`doc.ts`)로 **문서 객체**를 받아 그 노드를 워드 문단·표로 옮긴다 —
 * 읽기 화면·편집기와 같은 파서 한 벌이라 「화면에 선 것 = 파일에 든 것」이 여기서도 참이다.
 * md 문법은 이 파일에 한 글자도 없다.
 *
 * ## 옮기는 법 — 뜻을 옮기고 꾸밈은 버린다
 *
 * 제목·문단·굵게·기울임·취소선·링크·목록·표·인용·코드·가로줄·그림은 워드에 같은 것이 있어 그대로 간다.
 * 우리 어휘(`blocks.ts`)는 워드에 짝이 없어서 **글이 안 빠지는 선에서** 가장 가까운 꼴로 간다.
 *
 * | 어휘 | 워드에서 |
 * |---|---|
 * | 알림(`note`)·요점(`point`) | 왼쪽 선 + 들여쓰기 |
 * | 카드 | 굵은 제목 + 왼쪽 선 |
 * | 탭·접기 | 항목 이름을 굵게, 알맹이를 전부 펼쳐서 (종이·파일에는 누를 것이 없다) |
 * | 나란히·절차·카드 묶음·정렬 | 알맹이만 차례로 (정렬은 그 안 문단에 건다) |
 * | 사진 | 그림 + 캡션 |
 * | 영상·받기 | 「영상: 주소」·「파일: 이름」 링크 한 줄 |
 * | 목록(`::list`) | 「… 목록은 온라인에서 볼 수 있습니다」 — 앱 데이터라 파일에 담을 게 없다 |
 *
 * ## 종이
 *
 * 쪽 보기와 같은 종이다 — A4, 네 변 같은 여백(`여백mm`), 꼬리말 왼쪽에 제목·오른쪽에 「쪽 / 전체」.
 * 제목은 인쇄처럼 첫머리에 `#` 로 얹는다. 글꼴은 맑은 고딕(한글에서 열어도 대체 글꼴로 선다).
 *
 * ## 그림
 *
 * 워드가 받는 형식이 png·jpg·gif·bmp 뿐이라, 형식을 가리지 않고 **캔버스에 한 번 그려 png 로** 담는다(webp·svg 도).
 * 다른 출처 그림이 CORS 를 안 열어 주면 캔버스가 막히는데, 그때는 「그림: 설명」 글 한 줄로 남긴다.
 *
 * ## 아는 한계
 *
 * - 한글 파일은 따로 짓는다(`hwpx.ts`).
 * - 표 칸 정렬(`align`)·태스크 체크박스는 글자 그대로다(체크박스는 `doc.ts` 에서 이미 `☑` 글자다).
 * - 브라우저에서만 돈다(`document`·캔버스). `docx` 는 부를 때 불러와서 읽기 화면 번들에 안 실린다.
 */
import type { FileChild, ParagraphChild } from 'docx'
import { md에서문서, type iPM노드 } from './doc'
import { 그림png, 주소 } from './저장공통'

interface i자리 {
  /** 인용·알림·카드가 겹친 깊이. 한 겹에 들여쓰기 한 칸 + 왼쪽 선. */
  들여: number
  /** 목록 깊이. -1 은 목록 밖. */
  목록깊이: number
  정렬?: 'left' | 'center' | 'right' | 'both'
  /** 표 머리줄 — 글자를 굵게. */
  굵게?: boolean
}

const 기본자리: i자리 = { 들여: 0, 목록깊이: -1 }
const 글꼴 = '맑은 고딕'
const 고정폭 = 'Consolas'
/** 1mm = 56.7 twip. 워드 치수의 기본 단위다. */
const twip = (mm: number) => Math.round(mm * 56.7)
const 선색 = 'BFBFBF'

export async function md에서docx(md: string, 옵션: { 제목?: string, 여백mm: number }): Promise<Blob> {
  const w = await import('docx')
  const 본문 = md || ''
  const 문서 = await md에서문서(옵션.제목 ? `# ${옵션.제목}\n\n${본문}` : 본문)

  /** 번호 목록마다 새로 1부터 — 같은 번호 정의를 `instance` 로 갈라 쓴다. */
  let 번호목록수 = 0
  /** 그림 최대 폭(px). A4 폭 794px 에서 좌우 여백을 뺀 것. */
  const 그림최대폭 = 794 - 2 * Math.round(옵션.여백mm * 96 / 25.4)

  // ── 글자 ──────────────────────────────────────────────────────────────
  function 글자들(nodes: iPM노드[], 자리: i자리): ParagraphChild[] {
    const out: ParagraphChild[] = []
    for (const n of nodes) {
      if (n.type === 'hardBreak') {
        out.push(new w.TextRun({ text: '', break: 1 }))
        continue
      }
      if (n.type !== 'text') continue
      const m = new Set((n.marks ?? []).map(x => x.type))
      const run = new w.TextRun({
        text: n.text ?? '',
        bold: 자리.굵게 || m.has('bold') || undefined,
        italics: m.has('italic') || undefined,
        strike: m.has('strike') || undefined,
        font: m.has('code') ? 고정폭 : undefined,
        shading: m.has('code') || m.has('badge') ? { type: w.ShadingType.CLEAR, fill: 'F2F2F2', color: 'auto' } : undefined,
        ...(m.has('link') ? { color: '0563C1', underline: {} } : {})
      })
      const 링크 = n.marks?.find(x => x.type === 'link')
      out.push(링크 ? new w.ExternalHyperlink({ link: 주소(String(링크.attrs?.href ?? '')), children: [run] }) : run)
    }
    return out
  }

  // ── 문단 ──────────────────────────────────────────────────────────────
  function 문단(children: ParagraphChild[], 자리: i자리, 더: Record<string, unknown> = {}) {
    return new w.Paragraph({
      children,
      alignment: 자리.정렬 ? w.AlignmentType[자리.정렬 === 'both' ? 'BOTH' : 자리.정렬 === 'center' ? 'CENTER' : 자리.정렬 === 'right' ? 'RIGHT' : 'LEFT'] : undefined,
      indent: 자리.들여 ? { left: 자리.들여 * 360 } : undefined,
      border: 자리.들여 ? { left: { style: w.BorderStyle.SINGLE, size: 12, color: 선색, space: 8 } } : undefined,
      spacing: { after: 120 },
      ...더
    })
  }

  // ── 그림 ──────────────────────────────────────────────────────────────
  async function 그림(src: string, alt: string | null, 자리: i자리): Promise<FileChild> {
    try {
      const { blob, 폭, 높이 } = await 그림png(src)
      const 배 = Math.min(1, 그림최대폭 / 폭)
      return 문단([new w.ImageRun({
        type: 'png',
        data: await blob.arrayBuffer(),
        transformation: { width: Math.round(폭 * 배), height: Math.round(높이 * 배) }
      })], 자리)
    } catch {
      return 문단([new w.TextRun({ text: `[그림${alt ? `: ${alt}` : ''}]`, color: '808080' })], 자리)
    }
  }

  // ── 블록 ──────────────────────────────────────────────────────────────
  const 블록들 = async (nodes: iPM노드[], 자리: i자리): Promise<FileChild[]> =>
    (await Promise.all(nodes.map(n => 블록(n, 자리)))).flat()

  const 한줄링크 = (앞: string, 이름: string, href: string, 자리: i자리) => 문단([
    new w.TextRun({ text: 앞 }),
    new w.ExternalHyperlink({ link: 주소(href), children: [new w.TextRun({ text: 이름, color: '0563C1', underline: {} })] })
  ], 자리)

  async function 블록(n: iPM노드, 자리: i자리): Promise<FileChild[]> {
    const a = n.attrs ?? {}
    const c = n.content ?? []
    switch (n.type) {
      case 'paragraph':
        return [문단(글자들(c, 자리), 자리)]
      case 'heading': {
        const 수준 = [w.HeadingLevel.HEADING_1, w.HeadingLevel.HEADING_2, w.HeadingLevel.HEADING_3, w.HeadingLevel.HEADING_4][Number(a.level ?? 2) - 1] ?? w.HeadingLevel.HEADING_2
        return [문단(글자들(c, 자리), 자리, { heading: 수준, spacing: { before: 240, after: 120 }, keepNext: true })]
      }
      case 'bulletList':
      case 'orderedList': {
        const 깊이 = Math.min(자리.목록깊이 + 1, 8)
        const 번호 = n.type === 'orderedList' ? { reference: '번호', level: 깊이, instance: ++번호목록수 } : undefined
        const out: FileChild[] = []
        for (const li of c) {
          const [첫, ...나머지] = li.content ?? []
          const 안자리 = { ...자리, 목록깊이: 깊이 }
          if (첫?.type === 'paragraph') {
            out.push(문단(글자들(첫.content ?? [], 자리), 자리, 번호 ? { numbering: 번호 } : { bullet: { level: 깊이 } }))
          } else if (첫) {
            out.push(...await 블록(첫, 안자리))
          }
          out.push(...await 블록들(나머지, 안자리))
        }
        return out
      }
      case 'blockquote':
      case 'note':
      case 'point':
        return 블록들(c, { ...자리, 들여: 자리.들여 + 1 })
      case 'codeBlock':
        return 문서평문줄(n).map(줄 => 문단([new w.TextRun({ text: 줄 || ' ', font: 고정폭 })], 자리, {
          shading: { type: w.ShadingType.CLEAR, fill: 'F2F2F2', color: 'auto' },
          spacing: { after: 0 }
        }))
      case 'horizontalRule':
        return [문단([], 자리, { border: { bottom: { style: w.BorderStyle.SINGLE, size: 6, color: 선색, space: 1 } } })]
      case 'image':
        return [await 그림(String(a.src ?? ''), a.alt ? String(a.alt) : null, 자리)]
      case 'photo':
        return [await 그림(String(a.src ?? ''), a.alt ? String(a.alt) : null, 자리), ...await 블록들(c, 자리)]
      case 'table':
        return [await 표(n)]
      case 'tabs':
      case 'accordion':
        return 블록들(c, 자리)
      case 'tabsItem':
      case 'accordionItem':
      case 'card': {
        const 이름 = String(a.label ?? a.title ?? '')
        const 머리 = 이름 ? [문단([new w.TextRun({ text: 이름, bold: true })], 자리, { keepNext: true })] : []
        return [...머리, ...await 블록들(c, n.type === 'card' ? { ...자리, 들여: 자리.들여 + 1 } : 자리)]
      }
      case 'align': {
        const to = String(a.to ?? '')
        const 정렬 = to === 'center' ? 'center' : to === 'right' ? 'right' : to === 'justify' ? 'both' : undefined
        return 블록들(c, { ...자리, 정렬 })
      }
      case 'youtube':
        return a.url ? [한줄링크('영상: ', String(a.url), String(a.url), 자리)] : []
      case 'download': {
        const url = String(a.url ?? '')
        if (!url) return []
        return [한줄링크('파일: ', String(a.title ?? '') || decodeURIComponent(url.split('/').pop() ?? url), url, 자리)]
      }
      case 'list':
        return [문단([new w.TextRun({ text: `${String(a.kind ?? '')} 목록은 온라인에서 볼 수 있습니다.`, color: '808080', italics: true })], 자리)]
      default:
        // 나란히·절차·카드 묶음·사전 밖(`unknown`) — 알맹이만 차례로.
        return 블록들(c, 자리)
    }
  }

  async function 표(n: iPM노드) {
    const rows = n.content ?? []
    const 칸수 = Math.max(1, ...rows.map(r => (r.content ?? []).length))
    return new w.Table({
      width: { size: 100, type: w.WidthType.PERCENTAGE },
      rows: await Promise.all(rows.map(async (r) => {
        const 머리 = (r.content ?? []).every(x => x.type === 'tableHeader')
        return new w.TableRow({
          tableHeader: 머리 || undefined,
          children: await Promise.all((r.content ?? []).map(async cell => new w.TableCell({
            width: { size: Math.floor(100 / 칸수), type: w.WidthType.PERCENTAGE },
            shading: 머리 ? { type: w.ShadingType.CLEAR, fill: 'F2F2F2', color: 'auto' } : undefined,
            margins: { top: 60, bottom: 60, left: 100, right: 100 },
            children: await 블록들(cell.content ?? [], { ...기본자리, 굵게: 머리 })
          })))
        })
      }))
    })
  }

  const children = await 블록들(문서.content ?? [], 기본자리)
  const 본문폭 = twip(210 - 2 * 옵션.여백mm)

  const doc = new w.Document({
    title: 옵션.제목,
    styles: { default: { document: { run: { font: { ascii: 글꼴, eastAsia: 글꼴, hAnsi: 글꼴 }, size: 21 } } } },
    numbering: {
      config: [{
        reference: '번호',
        levels: Array.from({ length: 9 }, (_, level) => ({
          level,
          format: w.LevelFormat.DECIMAL,
          text: `%${level + 1}.`,
          alignment: w.AlignmentType.START,
          style: { paragraph: { indent: { left: 360 * (level + 1), hanging: 260 } } }
        }))
      }]
    },
    sections: [{
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: twip(옵션.여백mm), right: twip(옵션.여백mm), bottom: twip(옵션.여백mm), left: twip(옵션.여백mm), footer: twip(옵션.여백mm / 2) }
        }
      },
      footers: {
        default: new w.Footer({
          children: [new w.Paragraph({
            tabStops: [{ type: w.TabStopType.RIGHT, position: 본문폭 }],
            children: [
              new w.TextRun({ text: 옵션.제목 ?? '', size: 16, color: '808080' }),
              new w.TextRun({ children: [new w.Tab(), w.PageNumber.CURRENT, ' / ', w.PageNumber.TOTAL_PAGES], size: 16, color: '808080' })
            ]
          })]
        })
      },
      children: children.length ? children : [new w.Paragraph({})]
    }]
  })
  return w.Packer.toBlob(doc)
}

/** 코드 블록의 줄들. 코드 블록 알맹이는 글자 노드뿐이다. */
const 문서평문줄 = (n: iPM노드) => (n.content ?? []).map(t => t.text ?? '').join('').split('\n')

/**
 * **본문 md → 발표 파일(.pptx).** 쪽 보기의 「저장」이 부른다(`m쪽보기손잡이`). 짝은 `docx.ts`·`hwpx.ts`.
 *
 * ## 문서를 장으로 가르는 법
 *
 * 문서는 흐르는 글이고 발표는 장이라, **옮기는 게 아니라 자르는 게 일이다.** 규칙은 넷이다.
 *
 * 1. **첫 장은 표지** — 자료 제목 하나.
 * 2. **`#`·`##` 제목마다 새 장**이고 그 제목이 장 제목이다. 첫 제목 앞의 글은 자료 제목을 장 제목으로 쓴다.
 *    `###`·`####` 는 장을 안 가르고 본문 안의 굵은 줄이 된다.
 * 3. **넘치면 같은 제목으로 이어서 한 장 더.** 줄 수를 어림한다(한 줄 약 45자, 한 장 14줄) —
 *    파워포인트의 「넘치면 줄이기」는 파일을 연 뒤 글을 고쳐야 걸려서(`pptxgenjs` 의 `fit` 주석) 믿을 수 없다.
 * 4. **표와 그림은 제 장을 따로 갖는다.** 글과 한 상자에 섞으면 높이를 어림할 수 없다. 표는 8줄마다 가르고 머리줄을 되풀이한다.
 *
 * ## 어휘
 *
 * `docx.ts` 머리말의 표와 뜻은 같다 — 알림·요점·인용은 한 칸 들여서 흐린 글, 카드·탭·접기는 이름을 굵게 +
 * 알맹이를 펼쳐서, 영상·받기는 링크 한 줄, `::list` 는 「온라인에서」 한 줄. 코드 블록은 고정폭 줄.
 *
 * ## 판
 *
 * 16:9(13.33×7.5인치), 맑은 고딕. 장마다 왼쪽 아래에 자료 제목, 오른쪽 아래에 장 번호. 꾸밈(테마·배경)은 없다 —
 * 받은 사람이 제 서식을 입히는 게 발표 파일의 쓰임새다. 여백(`여백mm`)은 종이 개념이라 안 쓴다.
 *
 * ## 아는 한계
 *
 * - 줄 수 어림이라 긴 영문·짧은 줄이 많으면 장이 덜 차거나 조금 넘칠 수 있다.
 * - 표 칸 안의 목록·그림은 글자만 남는다.
 * - `pptxgenjs` 는 누를 때 불러와서 읽기 화면 번들에 안 실린다.
 */
import type PptxGenJS from 'pptxgenjs'
import { md에서문서, 문서평문, type iPM노드 } from './doc'
import { 그림png, 데이터주소, 주소 } from './저장공통'

type i글조각 = PptxGenJS.TextProps

type i조각
  = | { 종류: '글', 조각s: i글조각[], 줄수: number }
    | { 종류: '표', 줄s: PptxGenJS.TableRow[] }
    | { 종류: '그림', src: string, alt: string | null, 캡션: string }

interface i절 { 제목: string, 조각s: i조각[] }

interface i자리 {
  /** 목록·인용이 겹친 깊이. `indentLevel` 로 간다. */
  들여: number
  흐림?: boolean
  정렬?: PptxGenJS.HAlign
}

const 판 = { 폭: 13.333, 높이: 7.5, 왼: 0.6, 본문위: 1.45, 본문높이: 5.45 }
const 글꼴 = '맑은 고딕'
const 한줄글자 = 45
const 한장줄 = 14
const 표한장줄 = 8

export async function md에서pptx(md: string, 옵션: { 제목?: string }): Promise<Blob> {
  const 문서 = await md에서문서(md || '')
  const 자료제목 = 옵션.제목 || '본문'

  // ── 문서 → 절 ─────────────────────────────────────────────────────────
  const 절s: i절[] = [{ 제목: 자료제목, 조각s: [] }]
  const 지금절 = () => 절s[절s.length - 1]!

  function 글자들(nodes: iPM노드[], 자리: i자리, 굵게 = false): i글조각[] {
    const out: i글조각[] = []
    for (const n of nodes) {
      if (n.type === 'hardBreak') {
        out.push({ text: '', options: { breakLine: true } })
        continue
      }
      if (n.type !== 'text') continue
      const m = new Set((n.marks ?? []).map(x => x.type))
      const 링크 = n.marks?.find(x => x.type === 'link')
      out.push({
        text: n.text ?? '',
        options: {
          bold: 굵게 || m.has('bold') || undefined,
          italic: m.has('italic') || undefined,
          strike: m.has('strike') ? 'sngStrike' : undefined,
          fontFace: m.has('code') ? 'Consolas' : undefined,
          color: 자리.흐림 ? '595959' : undefined,
          hyperlink: 링크 ? { url: 주소(String(링크.attrs?.href ?? '')) } : undefined
        }
      })
    }
    return out
  }

  /** 글 한 문단을 절에 붙인다. 문단 속성(글머리·들여·정렬)은 그 문단의 모든 조각에 싣는다. */
  function 문단붙이기(조각s: i글조각[], 자리: i자리, 더: PptxGenJS.TextPropsOptions = {}) {
    const 글자수 = 조각s.reduce((합, x) => 합 + (x.text?.length ?? 0), 0)
    if (!글자수 && !더.bullet) return
    const 실음 = 조각s.map(x => ({ text: x.text, options: { ...x.options, indentLevel: 자리.들여 || undefined, align: 자리.정렬, ...더 } }))
    실음[실음.length - 1]!.options!.breakLine = true
    지금절().조각s.push({ 종류: '글', 조각s: 실음, 줄수: Math.max(1, Math.ceil(글자수 / (한줄글자 - 자리.들여 * 3))) })
  }

  function 블록(n: iPM노드, 자리: i자리) {
    const a = n.attrs ?? {}
    const c = n.content ?? []
    const 안 = (자리2: i자리) => c.forEach(x => 블록(x, 자리2))
    switch (n.type) {
      case 'heading': {
        const 수준 = Number(a.level ?? 2)
        const 글 = c.map(x => x.text ?? '').join('')
        if (수준 <= 2 && 자리.들여 === 0) {
          절s.push({ 제목: 글, 조각s: [] })
        } else {
          문단붙이기(글자들(c, 자리, true), 자리, { fontSize: 20 })
        }
        return
      }
      case 'paragraph':
        return 문단붙이기(글자들(c, 자리), 자리)
      case 'bulletList':
      case 'orderedList':
        for (const li of c) {
          const [첫, ...나머지] = li.content ?? []
          const 글머리 = n.type === 'orderedList' ? { type: 'number' as const } : true
          if (첫?.type === 'paragraph') 문단붙이기(글자들(첫.content ?? [], 자리), 자리, { bullet: 글머리 })
          else if (첫) 블록(첫, 자리)
          나머지.forEach(x => 블록(x, { ...자리, 들여: 자리.들여 + 1 }))
        }
        return
      case 'blockquote':
      case 'note':
      case 'point':
        return 안({ ...자리, 들여: 자리.들여 + 1, 흐림: true })
      case 'codeBlock':
        c.map(t => t.text ?? '').join('').split('\n').forEach(줄 =>
          문단붙이기([{ text: 줄 || ' ', options: { fontFace: 'Consolas', fontSize: 14 } }], 자리))
        return
      case 'horizontalRule':
        return
      case 'image':
      case 'photo':
        // 사진의 캡션은 그림 장 아래에 같이 선다 — 글로 흘리면 다음 장에 캡션만 홀로 남는다.
        지금절().조각s.push({ 종류: '그림', src: String(a.src ?? ''), alt: a.alt ? String(a.alt) : null, 캡션: n.type === 'photo' ? 문서평문({ type: 'doc', content: c }).replace(/\n/g, ' ') : '' })
        return
      case 'table':
        지금절().조각s.push({
          종류: '표',
          줄s: c.map(r => (r.content ?? []).map(cell => ({
            text: 문서평문(cell),
            options: cell.type === 'tableHeader' ? { bold: true, fill: { color: 'F2F2F2' } } : {}
          })))
        })
        return
      case 'tabsItem':
      case 'accordionItem':
      case 'card': {
        const 이름 = String(a.label ?? a.title ?? '')
        if (이름) 문단붙이기([{ text: 이름, options: { bold: true } }], 자리)
        return 안(n.type === 'card' ? { ...자리, 들여: 자리.들여 + 1 } : 자리)
      }
      case 'align': {
        const to = String(a.to ?? '')
        return 안({ ...자리, 정렬: to === 'center' || to === 'right' || to === 'justify' ? to : undefined })
      }
      case 'youtube':
        if (a.url) 문단붙이기([{ text: '영상: ' }, { text: String(a.url), options: { hyperlink: { url: String(a.url) } } }], 자리)
        return
      case 'download': {
        const url = String(a.url ?? '')
        const 이름 = String(a.title ?? '') || decodeURIComponent(url.split('/').pop() ?? url)
        if (url) 문단붙이기([{ text: '파일: ' }, { text: 이름, options: { hyperlink: { url: 주소(url) } } }], 자리)
        return
      }
      case 'list':
        return 문단붙이기([{ text: `${String(a.kind ?? '')} 목록은 온라인에서 볼 수 있습니다.`, options: { italic: true, color: '808080' } }], 자리)
      default:
        // 탭·접기 묶음·나란히·절차·카드 묶음·사전 밖 — 알맹이만 차례로.
        return 안(자리)
    }
  }

  ;(문서.content ?? []).forEach(n => 블록(n, { 들여: 0 }))

  // ── 절 → 장 ───────────────────────────────────────────────────────────
  const { default: Pptx } = await import('pptxgenjs')
  const pptx = new Pptx()
  pptx.layout = 'LAYOUT_WIDE'
  pptx.title = 자료제목
  pptx.theme = { headFontFace: 글꼴, bodyFontFace: 글꼴 }

  const 본문폭 = 판.폭 - 판.왼 * 2
  const 새장 = (제목: string) => {
    const s = pptx.addSlide()
    s.addText(제목, { x: 판.왼, y: 0.45, w: 본문폭, h: 0.85, fontFace: 글꼴, fontSize: 28, bold: true, valign: 'bottom', margin: 0 })
    s.addText(자료제목, { x: 판.왼, y: 판.높이 - 0.5, w: 본문폭 - 1.5, h: 0.3, fontFace: 글꼴, fontSize: 10, color: '8C8C8C', margin: 0 })
    s.slideNumber = { x: 판.폭 - 판.왼 - 1, y: 판.높이 - 0.5, w: 1, h: 0.3, fontFace: 글꼴, fontSize: 10, color: '8C8C8C', align: 'right' }
    return s
  }

  // 표지
  const 표지 = pptx.addSlide()
  표지.addText(자료제목, { x: 판.왼, y: 2.6, w: 본문폭, h: 1.6, fontFace: 글꼴, fontSize: 40, bold: true, align: 'center', valign: 'middle' })

  for (const 절 of 절s) {
    if (절 === 절s[0] && !절.조각s.length) continue // 첫 제목 앞에 글이 없으면 표지로 족하다.
    let 쌓인글: i글조각[] = []
    let 쌓인줄 = 0
    let 장수 = 0
    const 글털기 = (마지막 = false) => {
      if (!쌓인글.length && !(마지막 && !장수)) return
      const s = 새장(절.제목)
      장수++
      if (쌓인글.length) {
        s.addText(쌓인글, { x: 판.왼, y: 판.본문위, w: 본문폭, h: 판.본문높이, fontFace: 글꼴, fontSize: 18, valign: 'top', paraSpaceAfter: 6, margin: 0 })
      }
      쌓인글 = []
      쌓인줄 = 0
    }

    for (const 조각 of 절.조각s) {
      if (조각.종류 === '글') {
        if (쌓인줄 && 쌓인줄 + 조각.줄수 > 한장줄) 글털기()
        쌓인글.push(...조각.조각s)
        쌓인줄 += 조각.줄수
        continue
      }
      글털기()
      if (조각.종류 === '표') {
        const [머리, ...몸] = 조각.줄s
        const 머리줄인가 = 머리?.every(cell => typeof cell === 'object' && cell.options?.bold)
        const 몸줄s = 머리줄인가 ? 몸 : 조각.줄s
        for (let i = 0; i < Math.max(1, 몸줄s.length); i += 표한장줄) {
          const s = 새장(절.제목)
          장수++
          s.addTable([...(머리줄인가 && 머리 ? [머리] : []), ...몸줄s.slice(i, i + 표한장줄)], {
            x: 판.왼, y: 판.본문위, w: 본문폭, fontFace: 글꼴, fontSize: 14, valign: 'middle',
            border: { type: 'solid', pt: 0.75, color: 'BFBFBF' }, margin: [4, 6, 4, 6]
          })
        }
      } else {
        const s = 새장(절.제목)
        장수++
        try {
          const { blob, 폭, 높이 } = await 그림png(조각.src)
          const 칸높이 = 판.본문높이 - (조각.캡션 ? 0.5 : 0)
          const 배 = Math.min(본문폭 / (폭 / 96), 칸높이 / (높이 / 96), 1.5)
          const w = (폭 / 96) * 배
          const h = (높이 / 96) * 배
          s.addImage({ data: await 데이터주소(blob), x: (판.폭 - w) / 2, y: 판.본문위 + (칸높이 - h) / 2, w, h, altText: 조각.alt ?? undefined })
        } catch {
          s.addText(`[그림${조각.alt ? `: ${조각.alt}` : ''}]`, { x: 판.왼, y: 판.본문위, w: 본문폭, h: 1, fontFace: 글꼴, fontSize: 18, color: '808080' })
        }
        if (조각.캡션) {
          s.addText(조각.캡션, { x: 판.왼, y: 판.본문위 + 판.본문높이 - 0.4, w: 본문폭, h: 0.4, fontFace: 글꼴, fontSize: 14, color: '595959', align: 'center', margin: 0 })
        }
      }
    }
    글털기(true)
  }

  return await pptx.write({ outputType: 'blob' }) as Blob
}

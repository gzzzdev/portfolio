/**
 * 본문 편집기의 스키마 — **사전(`~utils/mdc/blocks`)의 어휘가 곧 노드다.** 여기 없는 것은 문서에 생길 수 없다.
 *
 * 세 부류다.
 * 1. **기본 md 어휘** — 문단·제목·굵게·목록·표·코드·인용·그림. StarterKit 과 표·그림 확장을 쓰되 옷(클래스)은
 *    읽기 렌더러의 것을 입힌다(`prose.ts`). 밑줄은 md 에 없어 끈다. 색·크기 확장은 **일부러 없다.**
 *    정렬만은 있는데 확장이 아니라 **사전의 블록**(`align`)이다 — md 에 실리는 길이 컨테이너뿐이라서다(`mdc/Align.vue`).
 * 2. **`::` 컨테이너** — 사전의 열두 개. 알맹이가 있는 것은 `content: 'block+'` 이고 노드뷰(Vue)가 읽기 컴포넌트
 *    (`mdc/*.vue` 또는 @nuxt/ui prose 테마)로 그린다. 부품 없이 클래스만으로 되는 것(절차·카드묶음·접기 뿌리)은
 *    노드뷰 없이 `renderHTML` 로 끝낸다 — 자식이 그 요소의 **직계**라야 `[&>h3]` 같은 테마 선택자가 산다.
 * 3. **글이 아닌 노드** — `youtube`·`list`·`download` 는 알맹이 없는 원자(atom)고, `unknown` 은 사전 밖 블록을 그대로 든다.
 *
 * 노드 이름은 md 이름과 같다(`~utils/mdc/doc` 의 `노드타입of`). 문서 JSON 에 그 이름이 박히므로 **이름을 바꾸면
 * 저장된 문서가 안 열린다.** 바꿔야 하면 `doc.ts` 에 옛 이름을 받아주는 줄을 먼저 둘 것.
 */
import { Extension, Mark, Node, mergeAttributes } from '@tiptap/core'
import Image from '@tiptap/extension-image'
import { Table, TableCell, TableHeader, TableRow, TableView } from '@tiptap/extension-table'
import { Plugin, PluginKey, TextSelection } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import StarterKit from '@tiptap/starter-kit'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import { 정렬클래스of } from '~utils/mdc/blocks'
import type { iPM노드 } from '~utils/mdc/doc'
import type { iProse클래스s } from './prose'
import { 탭키, type i탭메타 } from './탭상태'
import 나란히 from './나란히.vue'
import 모름 from './모름.vue'
import 목록 from './목록.vue'
import 받기 from './받기.vue'
import 사진 from './사진.vue'
import 상자 from './상자.vue'
import 영상 from './영상.vue'
import 접기항목 from './접기항목.vue'
import 카드 from './카드.vue'
import 탭 from './탭.vue'

const 클래스속성 = (c?: string) => (c ? { class: c } : {})
const 속성들 = (이름s: string[]) => Object.fromEntries(이름s.map(n => [n, { default: null }]))

/**
 * 제목. StarterKit 의 것을 안 쓰는 이유 하나 — 읽기 화면은 `h1`~`h4` 가 각각 다른 클래스를 입는데
 * (`ProseH2`·`ProseH3`…), 기본 확장은 모든 층에 한 클래스만 준다. 층마다 골라 입히려면 `renderHTML` 을 가져야 한다.
 */
const 제목 = Node.create<{ 클래스: Record<number, string> }>({
  name: 'heading',
  addOptions() { return { 클래스: {} } },
  content: 'inline*',
  group: 'block',
  defining: true,
  addAttributes() { return { level: { default: 2, rendered: false } } },
  parseHTML() { return [1, 2, 3, 4].map(level => ({ tag: `h${level}`, attrs: { level } })) },
  renderHTML({ node, HTMLAttributes }) {
    const level = [1, 2, 3, 4].includes(node.attrs.level) ? node.attrs.level : 2
    return [`h${level}`, mergeAttributes(HTMLAttributes, 클래스속성(this.options.클래스[level])), 0]
  }
})

/** 알림·요점. 같은 껍데기(`ProseCallout`)에 색과 아이콘만 다르다 — 그 결정은 `mdc/Note.vue`·`Point.vue` 머리말. */
const 상자노드 = (name: 'note' | 'point') => Node.create({
  name,
  group: 'block',
  content: 'block+',
  defining: true,
  addAttributes() { return 속성들(['icon']) },
  parseHTML() { return [{ tag: `div[data-type="${name}"]` }] },
  renderHTML({ HTMLAttributes }) { return ['div', mergeAttributes(HTMLAttributes, { 'data-type': name }), 0] },
  addNodeView() { return VueNodeViewRenderer(상자) }
})

/**
 * 정렬 — `::align{to}`. **노드뷰가 없다.** 클래스 한 줄이 전부라 `renderHTML` 로 끝나고(절차·카드묶음과 같은 부류),
 * 자식 문단이 이 `div` 의 직계로 남아서 여백이 껍데기를 통과한다(`mdc/Align.vue` 머리말 「여백을 안 준다」).
 *
 * 왜 문단 속성(TipTap 의 `TextAlign`)이 아닌지는 그 머리말의 표가 정본이다 — 한 줄로는, **md 에 실을 자리가 없어서**다.
 */
const 정렬 = Node.create({
  name: 'align',
  group: 'block',
  content: 'block+',
  defining: true,
  addAttributes() { return { to: { default: 'center' } } },
  parseHTML() { return [{ tag: 'div[data-type="align"]' }] },
  renderHTML({ node, HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'align' }, 클래스속성(정렬클래스of(node.attrs.to))), 0]
  }
})

const 절차 = Node.create<{ 클래스: string }>({
  name: 'steps',
  addOptions() { return { 클래스: '' } },
  group: 'block',
  content: 'block+',
  defining: true,
  parseHTML() { return [{ tag: 'div[data-type="steps"]' }] },
  renderHTML({ HTMLAttributes }) { return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'steps' }, 클래스속성(this.options.클래스)), 0] }
})

/**
 * 탭. 부모가 머리줄을 그리고, 자식(`tabsItem`)은 전부 문서에 있되 **열린 것 하나만 보인다.**
 * 어느 것이 열렸는지는 플러그인 상태(`탭상태.ts`)고, 안 보이는 자식은 데코레이션(`display:none`)이 가린다 —
 * ProseMirror 는 자식 노드가 전부 DOM 에 있어야 하므로 떼어낼 수는 없다.
 */
const 탭노드 = Node.create({
  name: 'tabs',
  group: 'block',
  content: 'tabsItem+',
  isolating: true,
  defining: true,
  parseHTML() { return [{ tag: 'div[data-type="tabs"]' }] },
  renderHTML({ HTMLAttributes }) { return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'tabs' }), 0] },
  addNodeView() { return VueNodeViewRenderer(탭) },
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: 탭키,
        state: {
          init: () => new Map<number, number>(),
          apply(tr, 이전) {
            let 다음 = 이전
            if (tr.docChanged) {
              다음 = new Map()
              for (const [pos, i] of 이전) {
                const r = tr.mapping.mapResult(pos)
                if (!r.deleted) 다음.set(r.pos, i)
              }
            }
            const meta = tr.getMeta(탭키) as i탭메타 | undefined
            if (meta) {
              다음 = new Map(다음)
              다음.set(meta.pos, meta.활성)
            } else if (tr.selectionSet) {
              // 커서가 안 보이는 탭 안으로 갔으면(방향키·되돌리기) 그 탭을 켠다. 안 그러면 보이지 않는 곳에 글이 쓰인다.
              const $from = tr.selection.$from
              for (let d = $from.depth; d > 1; d--) {
                if ($from.node(d).type.name !== 'tabsItem') continue
                const 탭pos = $from.before(d - 1)
                const idx = $from.index(d - 1)
                if ((다음.get(탭pos) ?? 0) !== idx) {
                  다음 = new Map(다음)
                  다음.set(탭pos, idx)
                }
                break
              }
            }
            return 다음
          }
        },
        props: {
          decorations(state) {
            const 활성표 = 탭키.getState(state) ?? new Map<number, number>()
            const decos: Decoration[] = []
            state.doc.descendants((node, pos) => {
              if (node.type.name !== 'tabs') return
              const 활성 = Math.min(활성표.get(pos) ?? 0, node.childCount - 1)
              let 자식pos = pos + 1
              node.forEach((child, _offset, i) => {
                if (i !== 활성) decos.push(Decoration.node(자식pos, 자식pos + child.nodeSize, { style: 'display:none' }))
                자식pos += child.nodeSize
              })
            })
            return DecorationSet.create(state.doc, decos)
          }
        }
      })
    ]
  }
})

const 탭항목 = Node.create<{ 클래스: string }>({
  name: 'tabsItem',
  addOptions() { return { 클래스: '' } },
  content: 'block+',
  isolating: true,
  defining: true,
  addAttributes() { return 속성들(['label', 'icon']) },
  parseHTML() { return [{ tag: 'div[data-type="tabs-item"]' }] },
  renderHTML({ HTMLAttributes }) { return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'tabs-item' }, 클래스속성(this.options.클래스)), 0] }
})

const 접기 = Node.create<{ 클래스: string }>({
  name: 'accordion',
  addOptions() { return { 클래스: '' } },
  group: 'block',
  content: 'accordionItem+',
  isolating: true,
  defining: true,
  parseHTML() { return [{ tag: 'div[data-type="accordion"]' }] },
  renderHTML({ HTMLAttributes }) { return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'accordion' }, 클래스속성(this.options.클래스)), 0] }
})

const 접기항목노드 = Node.create({
  name: 'accordionItem',
  content: 'block+',
  isolating: true,
  defining: true,
  addAttributes() { return 속성들(['label', 'icon']) },
  parseHTML() { return [{ tag: 'div[data-type="accordion-item"]' }] },
  renderHTML({ HTMLAttributes }) { return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'accordion-item' }), 0] },
  addNodeView() { return VueNodeViewRenderer(접기항목) }
})

const 카드노드 = Node.create({
  name: 'card',
  group: 'block',
  content: 'block+',
  isolating: true,
  defining: true,
  addAttributes() { return 속성들(['title', 'icon', 'to']) },
  parseHTML() { return [{ tag: 'div[data-type="card"]' }] },
  renderHTML({ HTMLAttributes }) { return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'card' }), 0] },
  addNodeView() { return VueNodeViewRenderer(카드) }
})

const 카드묶음 = Node.create<{ 클래스: string }>({
  name: 'cardGroup',
  addOptions() { return { 클래스: '' } },
  group: 'block',
  content: 'card+',
  isolating: true,
  defining: true,
  parseHTML() { return [{ tag: 'div[data-type="card-group"]' }] },
  renderHTML({ HTMLAttributes }) { return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'card-group' }, 클래스속성(this.options.클래스)), 0] }
})

const 나란히노드 = Node.create({
  name: 'columns',
  group: 'block',
  content: 'block+',
  defining: true,
  addAttributes() { return 속성들(['cols']) },
  parseHTML() { return [{ tag: 'div[data-type="columns"]' }] },
  renderHTML({ HTMLAttributes }) { return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'columns' }), 0] },
  addNodeView() { return VueNodeViewRenderer(나란히) }
})

const 사진노드 = Node.create({
  name: 'photo',
  group: 'block',
  content: 'block*', // 캡션. 없어도 된다.
  isolating: true,
  defining: true,
  addAttributes() { return 속성들(['src', 'alt', 'ratio', 'size']) },
  parseHTML() { return [{ tag: 'figure[data-type="photo"]' }] },
  renderHTML({ HTMLAttributes }) { return ['figure', mergeAttributes(HTMLAttributes, { 'data-type': 'photo' }), 0] },
  addNodeView() { return VueNodeViewRenderer(사진) }
})

/** 알맹이 없는 원자. 한 덩어리로 고르고 지운다. */
const 원자노드 = (name: 'youtube' | 'list' | 'download', 속성: string[], 뷰: typeof 영상) => Node.create({
  name,
  group: 'block',
  atom: true,
  selectable: true,
  draggable: false,
  addAttributes() { return 속성들(속성) },
  parseHTML() { return [{ tag: `div[data-type="${name}"]` }] },
  renderHTML({ HTMLAttributes }) { return ['div', mergeAttributes(HTMLAttributes, { 'data-type': name })] },
  addNodeView() { return VueNodeViewRenderer(뷰) }
})

/** 사전 밖 블록. 이름과 속성을 그대로 들고 있다가 그대로 뱉는다(`doc.ts`). 화면에서는 점선 상자다. */
const 모름노드 = Node.create({
  name: 'unknown',
  group: 'block',
  content: 'block+',
  defining: true,
  addAttributes() {
    return {
      tag: { default: 'div', rendered: false },
      props: { default: {}, rendered: false }
    }
  },
  parseHTML() { return [{ tag: 'div[data-type="unknown"]' }] },
  renderHTML({ HTMLAttributes }) { return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'unknown' }), 0] },
  addNodeView() { return VueNodeViewRenderer(모름) }
})

/** 태그 — `:badge[값]`. 블록이 아니라 인라인이라 마크다(`blocks.ts` 「인라인이라 `:badge[값]` 으로 적는다」). */
const 태그마크 = Mark.create<{ 클래스: string }>({
  name: 'badge',
  addOptions() { return { 클래스: '' } },
  parseHTML() { return [{ tag: 'span[data-badge]' }] },
  renderHTML({ HTMLAttributes }) { return ['span', mergeAttributes(HTMLAttributes, { 'data-badge': '' }, 클래스속성(this.options.클래스)), 0] }
})

// ── 눌렀을 때 ──

/**
 * `::` 어휘를 툴바에서 눌렀을 때 문서에 무엇이 생기나. **키는 사전(`MDC블록s`)의 이름이다.**
 *
 * **이 표가 여기 사는 이유는 노드 정의가 여기 있어서다.** 「이 어휘가 처음 생길 때 어떻게 생겼나」는
 * 스키마가 답할 일이다 — 빈 `steps` 는 문서에 아예 못 선다(`content: 'block+'`). 그 답을 스키마에서
 * 떼어 놓으면 둘이 어긋나고, 어긋난 쪽은 누르는 순간 조용히 죽는다.
 *
 * **여기 없는 이름은 버튼이 막힌 채로 뜬다.** 사전에만 있고 여기 없으면 「아직 손잡이가 없다」로
 * 화면에 나온다 — 눌러도 아무 일 안 하는 버튼이 되지 않는다. `photo`·`youtube`·`list` 가 지금 그 자리고,
 * 그 셋은 주소를 받을 칸이 있어야 해서 버튼 하나로 안 끝난다.
 *
 * `align` 은 여기 없다. 값이 넷이라 버튼 하나가 아니고, 걸고 벗기는 세 갈래라 `Editor.vue` 가 직접 쥔다.
 *
 * | 방식 | 하는 일 | 본새 |
 * |---|---|---|
 * | `마크` | 고른 글자에 걸고 벗긴다 | 없다 |
 * | `감싸기` | 지금 문단을 감싸고, 한 번 더 누르면 벗긴다 | 없다 — 알맹이가 이미 있다 |
 * | `넣기` | 본새를 통째로 넣는다. 벗길 길은 없다 | 있다 |
 * | `넣거나벗기기` | 밖이면 넣고 안이면 벗긴다 | 있다 |
 *
 * 탭·접기·카드묶음이 `넣기` 인 것은 **항목이 딸려 있어서**다 — 벗기면 항목이 갈 곳이 없다.
 */
export type i누를때
  = | { 방식: '마크' }
    | { 방식: '감싸기' }
    | { 방식: '넣기', 본새: iPM노드 }
    | { 방식: '넣거나벗기기', 본새: iPM노드 }

const 문단json = (글 = ''): iPM노드 => ({ type: 'paragraph', content: 글 ? [{ type: 'text', text: 글 }] : undefined })
const 제목json = (글: string, level = 3): iPM노드 => ({ type: 'heading', attrs: { level }, content: [{ type: 'text', text: 글 }] })
const 카드json = (title: string, 글: string): iPM노드 => ({ type: 'card', attrs: { title }, content: [문단json(글)] })

export const 누를때: Record<string, i누를때> = {
  'badge': { 방식: '마크' },
  'note': { 방식: '감싸기' },
  'point': { 방식: '감싸기' },
  'steps': { 방식: '넣거나벗기기', 본새: { type: 'steps', content: [제목json('첫 단계'), 문단json('여기에 설명을 적습니다.')] } },
  'columns': { 방식: '넣거나벗기기', 본새: { type: 'columns', attrs: { cols: '2' }, content: [문단json('왼쪽'), 문단json('오른쪽')] } },
  'tabs': { 방식: '넣기', 본새: { type: 'tabs', content: [
    { type: 'tabsItem', attrs: { label: '첫째' }, content: [문단json('첫째 탭의 내용')] },
    { type: 'tabsItem', attrs: { label: '둘째' }, content: [문단json('둘째 탭의 내용')] }
  ] } },
  'accordion': { 방식: '넣기', 본새: { type: 'accordion', content: [
    { type: 'accordionItem', attrs: { label: '질문을 적으세요' }, content: [문단json('답을 적으세요.')] }
  ] } },
  'card': { 방식: '넣기', 본새: 카드json('카드 제목', '한두 줄 설명.') },
  // 이름·주소 칸은 노드뷰(`받기.vue`)가 들고 있어서 빈 채로 넣어도 손이 닿는다 — 사진·영상과 다른 점.
  'download': { 방식: '넣기', 본새: { type: 'download', attrs: { title: null, url: null } } },
  'card-group': { 방식: '넣기', 본새: { type: 'cardGroup', content: [카드json('첫 카드', '한두 줄 설명.'), 카드json('둘째 카드', '한두 줄 설명.')] } }
}

/** Enter 로 나가고, Backspace 로 벗긴다. 컨테이너 안에 갇히지 않게 하는 두 손잡이. */
const 컨테이너드나들기 = Extension.create({
  name: '본문드나들기',
  addKeyboardShortcuts() {
    const 나갈수있음 = new Set(['note', 'point', 'steps', 'columns', 'photo', 'card', 'unknown', 'tabsItem', 'accordionItem'])
    const 항목의부모: Record<string, string> = { tabsItem: 'tabs', accordionItem: 'accordion', card: 'cardGroup' }
    return {
      // 컨테이너 마지막의 **빈 문단**에서 Enter — 그 문단을 지우고 컨테이너 뒤에 문단을 하나 둔다.
      Enter: () => {
        const { state } = this.editor
        const { $from, empty } = state.selection
        if (!empty || $from.depth < 2) return false
        const 문단 = $from.parent
        if (문단.type.name !== 'paragraph' || 문단.content.size !== 0) return false
        const 부모 = $from.node(-1)
        if (!나갈수있음.has(부모.type.name)) return false
        if ($from.index(-1) !== 부모.childCount - 1 || 부모.childCount < 2) return false
        // 탭 항목·접기 항목·묶음 속 카드는 항목 뒤가 아니라 **묶음 뒤**로 나간다 — 항목 사이에 문단은 못 선다.
        const 묶음이름 = 항목의부모[부모.type.name]
        const 밖 = 묶음이름 && $from.depth >= 3 && $from.node(-2).type.name === 묶음이름 ? -2 : -1
        return this.editor.chain().command(({ tr, dispatch }) => {
          if (!dispatch) return true
          const 문단pos = $from.before()
          const 끝 = $from.after(밖) - 문단.nodeSize
          tr.delete(문단pos, 문단pos + 문단.nodeSize)
          tr.insert(끝, state.schema.nodes.paragraph!.create())
          tr.setSelection(TextSelection.create(tr.doc, 끝 + 1))
          return true
        }).run()
      },
      // 컨테이너에 **빈 문단 하나만** 남았을 때 Backspace — 컨테이너를 벗기고 문단만 남긴다.
      Backspace: () => {
        const { state } = this.editor
        const { $from, empty } = state.selection
        if (!empty || $from.depth < 2 || $from.parentOffset !== 0) return false
        const 문단 = $from.parent
        if (문단.type.name !== 'paragraph' || 문단.content.size !== 0) return false
        const 부모 = $from.node(-1)
        if (!나갈수있음.has(부모.type.name) || 항목의부모[부모.type.name] || 부모.childCount !== 1) return false
        return this.editor.chain().command(({ tr, dispatch }) => {
          if (!dispatch) return true
          const 시작 = $from.before(-1)
          tr.replaceWith(시작, $from.after(-1), state.schema.nodes.paragraph!.create())
          tr.setSelection(TextSelection.create(tr.doc, 시작 + 1))
          return true
        }).run()
      }
    }
  }
})

/** 「엔터 두 번」 힌트가 앉을 빈 문단 하나. 글이 아니라 **손이 헤맨 자리**라서 문서에도 되돌리기에도 안 남는다. */
const 줄바꿈힌트키 = new PluginKey<number | null>('본문줄바꿈힌트')

/**
 * **한컴에서 오는 손버릇을 그 자리에서 막고, 그 자리에서 알려 준다.**
 *
 * 한컴은 문단 사이가 0 이라 붙은 다음 줄이 `Enter` 로 나오고, 한 칸 띄우려면 두 번 친다.
 * 여기는 문단이 `my-5`(20px)를 지고 있어 **한 번에 이미 띄워진다** — 그래서 손이 한 칸씩 밀린다.
 * 밀린 채로 두 번 치면 빈 문단이 서는데, **md 에는 빈 문단을 적을 자리가 없다**(`본문md.vue` 「저장은 md 다」).
 * 화면에선 벌어져 보이다가 저장하고 다시 열면 없다 — 조용히 사라지는 그 한 칸이 진짜 문제였다.
 *
 * 그래서 **애초에 안 만든다.** 최상위 빈 문단에서 누른 `Enter` 는 삼키고, 대신 그 문단에
 * 「줄을 붙여 쓰려면 Shift+Enter」를 흐리게 얹는다. 손버릇이 발동하는 **바로 그 순간, 그 사람에게만** 뜬다 —
 * 아는 사람은 빈 문단에서 엔터를 두 번 안 치니 볼 일이 없고, 화면에 상시로 붙는 안내문도 아니다.
 *
 * **키 배치는 안 건드렸다.** `Enter`=새 문단 · `Shift+Enter`=줄 나눔은 한컴·워드·구글독스가 다 같은 자리고,
 * 우리도 이미 거기 서 있다(둘 다 StarterKit HardBreak 의 기본값이라 여기서 적을 게 없다).
 * 고칠 게 있었던 건 **키가 아니라 그 키가 있다는 걸 알 길**이었다.
 *
 * ## 왜 최상위에서만 도는가 (`depth === 1`)
 *
 * 빈 문단의 `Enter` 는 이미 임자가 여럿이다 — 컨테이너 안은 바로 위 `컨테이너드나들기` 가 「나가기」로 쓰고,
 * 목록·인용은 그 엔터로 밖에 나가는 게 어느 편집기에나 있는 동작이다. 남의 자리를 안 밟으려고 최상위만 본다.
 * 여기서 삼켜도 **잃는 게 없다** — 최상위 빈 문단의 엔터가 오늘 하는 일은 `splitBlock` 하나뿐이고
 * (`createParagraphNear`·`liftEmptyBlock` 은 최상위에서 둘 다 false 다), 그게 곧 안 남을 빈 문단이다.
 *
 * 한글을 조합하는 중에는 애초에 안 불린다 — `prosemirror-view` 가 `composing` 이면 keydown 을 흘린다.
 * (확장 배열의 순서도 여기 걸린다: TipTap 은 배열을 **뒤집어** 플러그인을 깔아서 뒤에 선 것이 키를 먼저 잡는다.)
 */
const 문단엔터 = Extension.create({
  name: '본문문단엔터',
  addKeyboardShortcuts() {
    return {
      Enter: () => {
        const { state, view } = this.editor
        const { $from, empty } = state.selection
        if (!empty || $from.depth !== 1) return false
        const 문단 = $from.parent
        if (문단.type.name !== 'paragraph' || 문단.content.size !== 0) return false
        // 스텝이 없는 트랜잭션이라 되돌리기에 안 쌓인다. 힌트는 글이 아니다.
        view.dispatch(state.tr.setMeta(줄바꿈힌트키, $from.before()))
        return true
      }
    }
  },
  addProseMirrorPlugins() {
    return [
      new Plugin<number | null>({
        key: 줄바꿈힌트키,
        state: {
          init: (): number | null => null,
          apply(tr, 이전) {
            const meta = tr.getMeta(줄바꿈힌트키) as number | undefined
            if (meta !== undefined) return meta
            // 손이 움직이면 곧 놓는다 — 글자를 넣었거나 커서가 떠났으면 더 볼 일이 없다.
            return 이전 === null || tr.docChanged || tr.selectionSet ? null : 이전
          }
        },
        props: {
          decorations(state) {
            const pos = 줄바꿈힌트키.getState(state)
            if (pos == null) return null
            const 문단 = state.doc.nodeAt(pos)
            if (!문단 || 문단.type.name !== 'paragraph' || 문단.content.size !== 0) return null
            // 글월은 CSS 가 아니라 여기 산다 — 옷은 `Editor.vue` 의 `<style>` 이 입힌다.
            return DecorationSet.create(state.doc, [
              Decoration.node(pos, pos + 문단.nodeSize, { 'class': 'm-본문-줄바꿈힌트', 'data-hint': '줄을 붙여 쓰려면 Shift+Enter' })
            ])
          }
        }
      })
    ]
  }
})

/**
 * 표 칸에 `align` 을 얹고 옷을 입힌다 — GFM 의 칸 정렬(`|:---:|`)이 실리는 자리다.
 * 손잡이는 `Editor.vue` 의 `정렬` 묶음이 표 안에서 되는 것이고, md 왕복은 `doc.ts` 의 `표`·`표요소` 가 맡는다.
 */
const 칸확장 = <T extends typeof TableCell>(Base: T, tag: 'td' | 'th', 클래스: (align: 'left' | 'center' | 'right' | null) => string) =>
  Base.extend({
    addAttributes() {
      return {
        ...this.parent?.(),
        align: {
          default: null,
          parseHTML: (el: HTMLElement) => el.getAttribute('align') || null,
          renderHTML: (attrs: Record<string, unknown>) => (attrs.align ? { align: attrs.align } : {})
        }
      }
    },
    renderHTML({ node, HTMLAttributes }) {
      return [tag, mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, 클래스속성(클래스(node.attrs.align))), 0]
    }
  })

export function 본문확장s(클래스s: iProse클래스s) {
  const 표 = 클래스s.표
  return [
    StarterKit.configure({
      heading: false,
      underline: false, // md 에 없다
      paragraph: { HTMLAttributes: 클래스속성(클래스s.p) },
      bulletList: { HTMLAttributes: 클래스속성(클래스s.ul) },
      orderedList: { HTMLAttributes: 클래스속성(클래스s.ol) },
      listItem: { HTMLAttributes: 클래스속성(클래스s.li) },
      blockquote: { HTMLAttributes: 클래스속성(클래스s.blockquote) },
      horizontalRule: { HTMLAttributes: 클래스속성(클래스s.hr) },
      codeBlock: { HTMLAttributes: 클래스속성(클래스s.pre) },
      code: { HTMLAttributes: 클래스속성(클래스s.code) },
      bold: { HTMLAttributes: 클래스속성(클래스s.strong) },
      italic: { HTMLAttributes: 클래스속성(클래스s.em) },
      link: { openOnClick: false, HTMLAttributes: { ...클래스속성(클래스s.a), rel: 'nofollow' } },
      dropcursor: { color: 'var(--ui-primary)', width: 2 }
    }),
    제목.configure({ 클래스: 클래스s.h }),
    Image.configure({ HTMLAttributes: 클래스속성(클래스s.img) }),
    Table.extend({
      addNodeView() {
        return ({ node, HTMLAttributes, editor }) => {
          // 읽기 화면은 `ProseTable` 이 `div.root > table.base` 로 감싼다. 같은 두 겹을 여기서도 만든다.
          const view = new TableView(node, this.options.cellMinWidth, editor.view, HTMLAttributes)
          view.dom.className = 표.root
          view.table.className = 표.base
          return view
        }
      }
    }).configure({ resizable: false }),
    TableRow.configure({ HTMLAttributes: 클래스속성(표.tr) }),
    칸확장(TableHeader, 'th', 표.th),
    칸확장(TableCell, 'td', 표.td),
    상자노드('note'),
    상자노드('point'),
    정렬,
    절차.configure({ 클래스: 클래스s.steps }),
    탭노드,
    탭항목.configure({ 클래스: 클래스s.tabsItem }),
    접기.configure({ 클래스: 클래스s.accordion }),
    접기항목노드,
    카드노드,
    카드묶음.configure({ 클래스: 클래스s.cardGroup }),
    나란히노드,
    사진노드,
    원자노드('youtube', ['url'], 영상),
    원자노드('list', ['kind', 'view', 'limit'], 목록),
    원자노드('download', ['url', 'title'], 받기),
    모름노드,
    태그마크.configure({ 클래스: 클래스s.badge }),
    컨테이너드나들기,
    문단엔터
  ]
}

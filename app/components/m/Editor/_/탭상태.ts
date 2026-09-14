/**
 * 탭의 「지금 열린 칸」. **문서에는 없는 값이다** — 어느 탭이 열려 있는지는 읽는 사람의 상태고 글의 일부가 아니라서
 * 저장하지 않고, 되돌리기 이력에도 안 남긴다. 그래서 노드 속성이 아니라 플러그인 상태(위치 → 번호)로 들고,
 * 안 열린 칸을 가리는 일은 데코레이션이 하고(`확장.ts` 의 탭 플러그인), 머리줄(`탭.vue`)은 `탭활성()` 으로
 * 여기서 바로 읽는다. 부모 노드뷰와 플러그인이 같은 열쇠를 써야 해서 이 작은 파일로 뗐다 —
 * 둘이 서로 import 하면 고리가 된다.
 */
import type { Editor } from '@tiptap/core'
import type { EditorState } from '@tiptap/pm/state'
import { PluginKey, TextSelection } from '@tiptap/pm/state'

export const 탭키 = new PluginKey<Map<number, number>>('본문탭')

export interface i탭메타 { pos: number, 활성: number }

/**
 * 탭을 고른다 — 활성 표시와 함께 **커서를 그 탭 안으로** 옮긴다.
 * 커서를 옛 탭에 남겨 두면 플러그인이 「커서가 든 탭을 켠다」는 규칙으로 바로 되돌린다.
 */
export function 탭고르기(editor: Editor, pos: number, 활성: number) {
  const node = editor.state.doc.nodeAt(pos)
  if (!node || node.type.name !== 'tabs') return
  const i = Math.max(0, Math.min(활성, node.childCount - 1))
  let 자식pos = pos + 1
  for (let k = 0; k < i; k++) 자식pos += node.child(k).nodeSize
  const tr = editor.state.tr.setMeta(탭키, { pos, 활성: i } satisfies i탭메타)
  tr.setSelection(TextSelection.near(tr.doc.resolve(자식pos + 1)))
  editor.view.dispatch(tr)
}

/** `pos` 에 있는 탭의 열린 칸 번호. 아직 고른 적이 없으면 첫 칸이다. */
export function 탭활성(state: EditorState, pos: number) {
  return 탭키.getState(state)?.get(pos) ?? 0
}

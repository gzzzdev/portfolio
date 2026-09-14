<template>
  <NodeViewWrapper
    as="div"
    :class="ui.root({ class: prose.root() })"
  >
    <!--
      머리줄은 `UTabs` 를 안 쓰고 같은 테마로 직접 그린다. 이유는 라벨이 **속성**이라 열린 탭의 이름을 그 자리에서
      고치게 하려면 버튼 안에 입력칸이 들어가야 하는데, `<button>` 안의 `<input>` 은 브라우저가 제대로 안 받는다.
      밑줄은 테마의 예비 규칙이 그린다 — 목록에 indicator 요소가 없으면 켜진 칸이 `after:` 로 스스로 긋는다.
    -->
    <div
      data-slot="list"
      :class="ui.list()"
      contenteditable="false"
    >
      <div
        v-for="(항목, i) in 항목s"
        :key="i"
        data-slot="trigger"
        :data-state="i === 활성 ? 'active' : 'inactive'"
        :class="[ui.trigger(), i === 활성 ? '' : 'cursor-pointer']"
        @mousedown="고르기(i, $event)"
      >
        <UIcon
          v-if="항목.icon"
          :name="항목.icon"
          :class="ui.leadingIcon()"
        />
        <span
          v-if="i === 활성"
          class="m-본문-자동폭"
          data-slot="label"
        >
          <span aria-hidden="true">{{ 항목.label || '탭 이름' }}</span>
          <input
            :value="항목.label"
            placeholder="탭 이름"
            class="m-본문-속성입력"
            @input="이름바꾸기(i, ($event.target as HTMLInputElement).value)"
          >
        </span>
        <span
          v-else
          data-slot="label"
          :class="ui.label()"
        >{{ 항목.label || '탭' }}</span>
        <button
          v-if="i === 활성 && 항목s.length > 1"
          type="button"
          class="ms-1 inline-flex size-4 cursor-pointer items-center justify-center rounded text-muted hover:text-default"
          title="이 탭 빼기"
          @mousedown.prevent
          @click="빼기(i)"
        >
          <UIcon
            name="i-lucide-x"
            class="size-3.5"
          />
        </button>
      </div>
      <button
        type="button"
        class="ms-1 inline-flex size-6 cursor-pointer items-center justify-center rounded text-muted hover:text-default"
        title="탭 더하기"
        @mousedown.prevent
        @click="더하기"
      >
        <UIcon
          name="i-lucide-plus"
          class="size-4"
        />
      </button>
    </div>
    <NodeViewContent
      as="div"
      :class="ui.content()"
    />
  </NodeViewWrapper>
</template>

<script setup lang="ts">
/**
 * `::tabs` 의 노드뷰. 자식(`tabsItem`)은 전부 `NodeViewContent` 안에 있고, 열린 것 말고는 플러그인의
 * 데코레이션이 `display:none` 으로 가린다(`확장.ts`). 여기가 아는 건 「몇 번째가 열렸나」 하나뿐이고,
 * 그것도 문서가 아니라 플러그인 상태(`탭상태.ts`)에서 읽는다.
 */
import { computed, onBeforeUnmount, ref } from 'vue'
import { NodeViewContent, NodeViewWrapper, nodeViewProps } from '@tiptap/vue-3'
import { TextSelection } from '@tiptap/pm/state'
import { useAppConfig } from '#imports'
import { tv } from '#ui/utils/tv'
import tabsTheme from '#build/ui/tabs'
import proseTabs from '#build/ui/prose/tabs'
import { 탭고르기, 탭활성 } from './탭상태'

const props = defineProps(nodeViewProps)

const appConfig = useAppConfig()
/* eslint-disable @typescript-eslint/no-explicit-any -- 테마 타입이 넓다. `ProseTabs` 가 하는 것과 같은 계산이다. */
const ui = computed(() => (tv(tabsTheme as any) as any)({ color: 'primary', variant: 'link', orientation: 'horizontal', size: 'md' }))
const prose = computed(() => (tv({ extend: proseTabs, ...((appConfig.ui as any)?.prose?.tabs || {}) } as any) as any)())
/* eslint-enable @typescript-eslint/no-explicit-any */

const 항목s = computed(() => {
  const out: { label: string, icon: string | null }[] = []
  props.node.forEach(n => out.push({ label: String(n.attrs.label ?? ''), icon: n.attrs.icon ?? null }))
  return out
})

/*
 * 열린 칸은 트랜잭션마다 플러그인 상태에서 **직접** 읽는다. 데코레이션(`props.decorations`)으로 받아 볼 수도
 * 있을 것 같지만 안 된다 — tiptap 의 노드뷰는 `node !== this.node` 일 때만 prop 을 다시 밀어준다
 * (`VueNodeViewRenderer.update`). 탭 전환은 문서를 안 건드리는 meta 트랜잭션이라 노드가 늘 그대로고,
 * 그래서 알맹이는 바뀌는데 머리줄만 옛 칸에 켜진 채로 멈춰 있었다.
 */
const 열린칸 = ref(0)
function 열린칸읽기() {
  const pos = props.getPos()
  if (typeof pos === 'number') 열린칸.value = 탭활성(props.editor.state, pos)
}
열린칸읽기()
props.editor.on('transaction', 열린칸읽기)
onBeforeUnmount(() => props.editor.off('transaction', 열린칸읽기))

const 활성 = computed(() => Math.min(열린칸.value, Math.max(0, props.node.childCount - 1)))

function 자식pos(i: number) {
  const pos = props.getPos()
  if (typeof pos !== 'number') return null
  let p = pos + 1
  for (let k = 0; k < i; k++) p += props.node.child(k).nodeSize
  return p
}

function 고르기(i: number, e: MouseEvent) {
  if ((e.target as HTMLElement).tagName === 'INPUT') return // 이름 고치는 중 — 입력칸이 포커스를 가져간다
  e.preventDefault()
  const pos = props.getPos()
  if (typeof pos !== 'number') return
  if (i !== 활성.value) 탭고르기(props.editor, pos, i)
}

function 이름바꾸기(i: number, 값: string) {
  const p = 자식pos(i)
  if (p === null) return
  const child = props.node.child(i)
  props.editor.view.dispatch(props.editor.state.tr.setNodeMarkup(p, undefined, { ...child.attrs, label: 값 }))
}

function 더하기() {
  const pos = props.getPos()
  if (typeof pos !== 'number') return
  const { schema } = props.editor
  const 끝 = pos + props.node.nodeSize - 1
  const 새항목 = schema.nodes.tabsItem!.create({ label: `탭 ${props.node.childCount + 1}` }, schema.nodes.paragraph!.create())
  const tr = props.editor.state.tr.insert(끝, 새항목)
  tr.setSelection(TextSelection.create(tr.doc, 끝 + 2))
  props.editor.view.dispatch(tr)
  탭고르기(props.editor, pos, props.node.childCount) // 문서가 바뀐 뒤라 childCount 는 옛 값 = 새 항목의 번호
  props.editor.view.focus()
}

function 빼기(i: number) {
  const p = 자식pos(i)
  const pos = props.getPos()
  if (p === null || typeof pos !== 'number' || props.node.childCount < 2) return
  const child = props.node.child(i)
  props.editor.view.dispatch(props.editor.state.tr.delete(p, p + child.nodeSize))
  탭고르기(props.editor, pos, Math.max(0, i - 1))
  props.editor.view.focus()
}
</script>

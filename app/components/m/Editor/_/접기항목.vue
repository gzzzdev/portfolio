<template>
  <!--
    `UAccordion` 을 안 쓰고 같은 테마로 직접 그린다. 접기는 항목마다 머리(질문)와 알맹이(답)가 **번갈아** 서는데,
    ProseMirror 는 자식 알맹이를 한 곳(`NodeViewContent`)에만 둘 수 있어 부모가 머리를 그릴 수 없다.
    그래서 항목 하나가 자기 머리와 알맹이를 다 그린다. 접힘은 읽는 사람의 상태라 문서에 없고 여기 지역 상태다.
  -->
  <NodeViewWrapper
    as="div"
    :class="ui.item()"
  >
    <div
      data-slot="header"
      :class="ui.header()"
      contenteditable="false"
    >
      <div
        data-slot="trigger"
        :data-state="열림 ? 'open' : 'closed'"
        :class="[ui.trigger({ class: prose.trigger() }), 'cursor-pointer']"
        @mousedown="눌림"
      >
        <UIcon
          v-if="node.attrs.icon"
          :name="node.attrs.icon"
          :class="ui.leadingIcon()"
        />
        <input
          :value="node.attrs.label ?? ''"
          placeholder="질문"
          :class="[ui.label(), 'm-본문-속성입력 grow cursor-text']"
          @input="updateAttributes({ label: ($event.target as HTMLInputElement).value || null })"
        >
        <UIcon
          :name="appConfig.ui.icons.chevronDown"
          :class="ui.trailingIcon()"
        />
      </div>
    </div>
    <div
      data-slot="content"
      :class="ui.content()"
      :hidden="!열림"
    >
      <div
        data-slot="body"
        :class="ui.body()"
      >
        <NodeViewContent
          as="div"
          :class="항목클래스"
        />
      </div>
    </div>
  </NodeViewWrapper>
</template>

<script setup lang="ts">
/** `:::accordion-item` 의 노드뷰. 커서가 안으로 들어오면 저절로 열린다 — 안 보이는 곳에 글이 쓰이면 안 된다. */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { NodeViewContent, NodeViewWrapper, nodeViewProps } from '@tiptap/vue-3'
import { useAppConfig } from '#imports'
import { tv } from '#ui/utils/tv'
import accordionTheme from '#build/ui/accordion'
import proseAccordion from '#build/ui/prose/accordion'
import proseItem from '#build/ui/prose/accordion-item'

const props = defineProps(nodeViewProps)

const appConfig = useAppConfig()
/* eslint-disable @typescript-eslint/no-explicit-any -- 테마 타입이 넓다. `ProseAccordion` 이 하는 것과 같은 계산이다. */
const ui = computed(() => (tv(accordionTheme as any) as any)({ disabled: false }))
const prose = computed(() => (tv({ extend: proseAccordion, ...((appConfig.ui as any)?.prose?.accordion || {}) } as any) as any)())
const 항목클래스 = computed<string>(() => (tv({ extend: proseItem, ...((appConfig.ui as any)?.prose?.accordionItem || {}) } as any) as any)())
/* eslint-enable @typescript-eslint/no-explicit-any */

const 열림 = ref(false)

function 눌림(e: MouseEvent) {
  if ((e.target as HTMLElement).tagName === 'INPUT') return
  e.preventDefault()
  열림.value = !열림.value
}

/** 커서가 이 항목 안에 있으면 연다. 닫는 건 사람만 한다. */
function 커서확인() {
  const pos = props.getPos()
  if (typeof pos !== 'number') return
  const { from } = props.editor.state.selection
  if (from > pos && from < pos + props.node.nodeSize) 열림.value = true
}

onMounted(() => {
  커서확인()
  props.editor.on('selectionUpdate', 커서확인)
})
onBeforeUnmount(() => props.editor.off('selectionUpdate', 커서확인))
</script>

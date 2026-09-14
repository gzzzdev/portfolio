<template>
  <NodeViewWrapper
    as="div"
    class="my-5 rounded-md border border-dashed border-accented p-3"
  >
    <div
      class="mb-1 text-xs text-muted"
      contenteditable="false"
    >
      사전에 없는 블록 · <code>{{ node.attrs.tag }}</code> — 알맹이는 고칠 수 있고, 나갈 때 이름 그대로 나간다.
    </div>
    <NodeViewContent as="div" />
  </NodeViewWrapper>
</template>

<script setup lang="ts">
/** 사전 밖 `::foo`. 지어내지도 버리지도 않고 든다(`~utils/mdc/doc` 머리말). */
import { NodeViewContent, NodeViewWrapper, nodeViewProps } from '@tiptap/vue-3'

defineProps(nodeViewProps)
</script>

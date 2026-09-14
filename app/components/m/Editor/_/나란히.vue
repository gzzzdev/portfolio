<template>
  <NodeViewWrapper as="div">
    <!-- 격자의 칸은 알맹이의 자식들이어야 한다. `contents` 로 알맹이 껍데기를 격자에서 지운다. -->
    <Columns :cols="node.attrs.cols || 2">
      <NodeViewContent
        as="div"
        class="contents"
      />
    </Columns>
  </NodeViewWrapper>
</template>

<script setup lang="ts">
/** `::columns` 의 노드뷰. 껍데기는 `mdc/Columns.vue`. */
import { NodeViewContent, NodeViewWrapper, nodeViewProps } from '@tiptap/vue-3'
import Columns from '~base-comps/mdc/Columns.vue'

defineProps(nodeViewProps)
</script>

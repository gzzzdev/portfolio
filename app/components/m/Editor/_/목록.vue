<template>
  <NodeViewWrapper as="div">
    <MdcList
      :kind="node.attrs.kind || undefined"
      :view="node.attrs.view || undefined"
      :limit="node.attrs.limit || undefined"
    />
  </NodeViewWrapper>
</template>

<script setup lang="ts">
/** `::list` 의 노드뷰. 앱을 읽어서 그리는 블록이라 편집판에서도 진짜 목록이 뜬다. 원자라 통째로 고르고 지운다. */
import { NodeViewWrapper, nodeViewProps } from '@tiptap/vue-3'
import MdcList from '~base-comps/mdc/List.vue'

defineProps(nodeViewProps)
</script>

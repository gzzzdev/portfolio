<template>
  <NodeViewWrapper as="div">
    <Youtube :url="node.attrs.url || ''" />
  </NodeViewWrapper>
</template>

<script setup lang="ts">
/** `::youtube` 의 노드뷰. 원자(atom)라 통째로 고르고 지운다. 주소를 넣는 손잡이는 아직 없다. */
import { NodeViewWrapper, nodeViewProps } from '@tiptap/vue-3'
import Youtube from '~base-comps/mdc/Youtube.vue'

defineProps(nodeViewProps)
</script>

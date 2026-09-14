<template>
  <NodeViewWrapper as="div">
    <!-- 읽기 컴포넌트 그대로. 캡션 자리에 알맹이를 꽂는다 — 읽기 화면은 캡션이 비면 자리를 안 그리지만 편집판은 적을 수 있어야 하니 늘 둔다. -->
    <Photo
      :src="node.attrs.src || ''"
      :alt="node.attrs.alt || ''"
      :ratio="node.attrs.ratio || undefined"
      :size="node.attrs.size || undefined"
    >
      <NodeViewContent as="div" />
    </Photo>
  </NodeViewWrapper>
</template>

<script setup lang="ts">
/** `::photo` 의 노드뷰. 주소(`src`)를 넣는 손잡이는 아직 없다 — 들어온 값을 그리기만 한다. */
import { NodeViewContent, NodeViewWrapper, nodeViewProps } from '@tiptap/vue-3'
import Photo from '~base-comps/mdc/Photo.vue'

defineProps(nodeViewProps)
</script>

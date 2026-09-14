<template>
  <NodeViewWrapper
    as="div"
    class="m-본문-상자"
  >
    <!--
      읽기 컴포넌트를 그대로 쓴다 — 색·아이콘의 결정이 그 파일 머리말에 있고, 여기서 다시 적으면 두 벌이다.
      알맹이(`NodeViewContent`)는 `display: contents` 로 두어 문단이 상자의 직계처럼 흐른다 —
      읽기 화면이 `mdc-unwrap="p"` 로 문단 껍데기를 벗기는 것과 같은 그림을 만들려는 것이다(`Editor.vue` 의 CSS).
    -->
    <component
      :is="node.type.name === 'point' ? Point : Note"
      :icon="node.attrs.icon || undefined"
    >
      <NodeViewContent
        as="div"
        class="m-본문-상자알맹이"
      />
    </component>
  </NodeViewWrapper>
</template>

<script setup lang="ts">
/** `::note`·`::point` 의 노드뷰. 껍데기는 `mdc/Note.vue`·`mdc/Point.vue`. */
import { NodeViewContent, NodeViewWrapper, nodeViewProps } from '@tiptap/vue-3'
import Note from '~base-comps/mdc/Note.vue'
import Point from '~base-comps/mdc/Point.vue'

defineProps(nodeViewProps)
</script>

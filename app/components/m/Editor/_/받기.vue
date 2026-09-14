<template>
  <NodeViewWrapper as="div">
    <Download
      :url="node.attrs.url || ''"
      :title="node.attrs.title || ''"
    />
    <!--
      **주소를 넣는 손잡이가 있는 첫 원자다.** 사진·영상은 아직 없다(`사진.vue`·`영상.vue`) — 받기는 주소가 곧 전부라
      손잡이 없이 넣으면 누를 수 없는 한 줄만 남는다. 입력칸은 카드 제목과 같은 옷(`m-본문속성입력`)이고,
      읽기 화면에는 없다(편집할 수 있을 때만).
    -->
    <div
      v-if="editor.isEditable"
      contenteditable="false"
      class="-mt-3 mb-5 flex flex-col gap-1 px-3 text-sm sm:flex-row sm:gap-3"
    >
      <input
        :value="node.attrs.title ?? ''"
        placeholder="보여줄 이름"
        class="m-본문-속성입력 min-w-0 sm:w-2/5"
        @input="updateAttributes({ title: ($event.target as HTMLInputElement).value || null })"
      >
      <input
        :value="node.attrs.url ?? ''"
        placeholder="파일 주소 (https://… 또는 /uploads/…)"
        class="m-본문-속성입력 min-w-0 grow"
        @input="updateAttributes({ url: ($event.target as HTMLInputElement).value.trim() || null })"
      >
    </div>
  </NodeViewWrapper>
</template>

<script setup lang="ts">
/** `::download` 의 노드뷰. 원자(atom)라 통째로 고르고 지운다. 이름·주소는 속성이라 입력칸으로 고친다. */
import { NodeViewWrapper, nodeViewProps } from '@tiptap/vue-3'
import Download from '~base-comps/mdc/Download.vue'

defineProps(nodeViewProps)
</script>

<template>
  <!--
    껍데기 클래스를 감싸개에 **직접** 입힌다(`ProseCard` 를 안 씀). 두 이유 —
    카드묶음의 `*:my-0` 가 직계 자식을 보므로 카드 자체가 묶음의 자식이어야 하고,
    제목이 속성(`title`)이라 `<p>` 자리에 입력칸을 두어야 해서다. 클래스는 같은 테마에서 읽으니 그림은 같다.
  -->
  <NodeViewWrapper
    as="div"
    :class="ui.base()"
  >
    <UIcon
      v-if="node.attrs.icon"
      :name="node.attrs.icon"
      :class="ui.icon()"
    />
    <p
      :class="ui.title()"
      contenteditable="false"
    >
      <input
        :value="node.attrs.title ?? ''"
        placeholder="카드 제목"
        class="m-본문-속성입력 w-full"
        @input="updateAttributes({ title: ($event.target as HTMLInputElement).value || null })"
      >
    </p>
    <NodeViewContent
      as="div"
      :class="ui.description()"
    />
  </NodeViewWrapper>
</template>

<script setup lang="ts">
/** `::card` 의 노드뷰. 제목은 속성이라 글처럼 보이는 입력칸으로 고친다. */
import { computed } from 'vue'
import { NodeViewContent, NodeViewWrapper, nodeViewProps } from '@tiptap/vue-3'
import { useAppConfig } from '#imports'
import { tv } from '#ui/utils/tv'
import theme from '#build/ui/prose/card'

defineProps(nodeViewProps)

const appConfig = useAppConfig()
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- `ProseCard` 와 같은 식. 테마 타입이 넓다.
const ui = computed(() => (tv({ extend: theme, ...((appConfig.ui as any)?.prose?.card || {}) } as any) as any)({ color: 'primary', to: false, title: true }))
</script>

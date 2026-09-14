<template>
  <MBoardsBoard
    v-bind="props"
    @like="$emit('like')"
  >
    <template #actions>
      <slot name="actions" />
    </template>
  </MBoardsBoard>
</template>

<script setup lang="ts">
interface BoardPost {
  id?: number | string
  type?: string
  title?: string
  author?: string
  date?: string | Date
  views?: number
  likes?: number
  content?: string
}

interface Props {
  post?: BoardPost
  /** 좋아요 요청 중 (하트 버튼 로딩) */
  likeLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  post: undefined,
  likeLoading: false
})

defineEmits<{ like: [] }>()
</script>

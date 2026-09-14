<template>
  <!--
    댓글 한 벌 — 상자 하나에 머리·줄·쓰는 칸. 예전엔 상자 안에 댓글마다 또 상자(`bg-muted` 카드)라 상자 속 상자였다.
    신청 상세의 문항 상자와 같은 골격이다: 머리에 수, 줄은 구분선, 바닥에 행동.
  -->
  <section class="overflow-hidden rounded-xl border border-default bg-default m-층-카드">
    <header class="flex items-center gap-2 border-b border-default px-5 py-3.5">
      <h2 class="text-sm font-semibold text-highlighted">
        댓글 {{ comments.length }}개
      </h2>
    </header>

    <div
      v-if="comments.length > 0"
      class="divide-y divide-default"
    >
      <article
        v-for="comment in comments"
        :key="comment.id"
        class="px-5 py-4"
      >
        <div class="flex flex-wrap items-baseline gap-x-2">
          <span class="text-sm font-medium text-highlighted">{{ comment.author }}</span>
          <span class="text-xs text-dimmed tabular-nums">{{ comment.createdAt }}</span>
        </div>
        <p class="mt-1 text-sm whitespace-pre-line text-default">
          {{ comment.content }}
        </p>
      </article>
    </div>
    <p
      v-else
      class="px-5 py-8 text-center text-sm text-muted"
    >
      아직 댓글이 없습니다.
    </p>

    <div class="space-y-2 border-t border-default px-5 py-4">
      <UInput
        v-if="!is로그인"
        v-model="draftAuthor"
        class="w-full sm:max-w-xs"
        placeholder="닉네임 (비워두면 임의로 짓습니다)"
        aria-label="닉네임"
        :disabled="ing댓글"
        @keydown.enter.prevent="submitDraft"
      />
      <UTextarea
        v-model="draftBody"
        class="w-full"
        :rows="3"
        autoresize
        placeholder="댓글을 남겨주세요. Enter 로 등록, Shift+Enter 로 줄바꿈"
        aria-label="댓글 내용"
        :disabled="ing댓글"
        @keydown.enter="onCommentBodyKeydown"
      />
      <div class="flex justify-end">
        <mButton
          역할="강조"
          label="등록"
          :loading="ing댓글"
          :disabled="ing댓글"
          @click="emit('submit')"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
export type CommentItem = {
  id: string
  author: string
  content: string
  createdAt: string
}

const props = defineProps<{
  comments: CommentItem[]
  is로그인: boolean
  ing댓글: boolean
}>()

const draftAuthor = defineModel<string>('draftAuthor', { default: '' })
const draftBody = defineModel<string>('draftBody', { default: '' })

const emit = defineEmits<{
  submit: []
}>()

function submitDraft() {
  if (props.ing댓글) return
  emit('submit')
}

function onCommentBodyKeydown(e: KeyboardEvent) {
  if (e.shiftKey) return
  e.preventDefault()
  submitDraft()
}
</script>

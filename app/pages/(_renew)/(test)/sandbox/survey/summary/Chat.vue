<template>
  <div class="flex h-full min-h-0 flex-col border-l border-default bg-elevated/30">
    <div class="flex shrink-0 items-center gap-2 border-b border-default px-4 py-3">
      <div class="min-w-0 grow" />
      <mButton
        :icon="showPrompt ? 'i-lucide-chevron-up' : 'i-lucide-file-text'"
        :label="showPrompt ? '보낼 내용 접기' : '보낼 내용'"

        size="sm"
        @click="showPrompt = !showPrompt"
      />

      <mButton
        v-if="answer || error"
        icon="i-lucide-rotate-ccw"
        역할="조용"
        size="sm"
        :disabled="isLoading"
        @click="onReset"
      />
      <mButton
        역할="강조"

        size="sm"
        icon="i-lucide-sparkles"
        label="분석"
        :loading="isLoading"
        :disabled="!markdown.trim()"
        @click="() => onAsk()"
      />
    </div>

    <div
      v-if="showPrompt"
      class="shrink-0 border-b border-default px-4 py-3"
    >
      <pre class="max-h-48 overflow-auto rounded-md border border-default bg-default p-3 text-xs leading-5 whitespace-pre-wrap">{{ promptPreview }}</pre>
    </div>

    <div class="flex min-h-0 flex-1 flex-col overflow-hidden p-4">
      <div
        v-if="error"
        class="mb-3 shrink-0 rounded-md border border-error/30 bg-error/5 px-3 py-2 text-sm text-error"
      >
        {{ error }}
      </div>

      <div class="min-h-0 flex-1 overflow-hidden">
        <pre class="h-full w-full overflow-auto rounded-md border border-default bg-default p-3 leading-5 whitespace-pre-wrap">{{ answer || '' }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  markdown: string
}>()

const QUESTION = '아래 kano 설문결과를 분석한다'
const { ask, error, isLoading, reset } = useAI()
const answer = ref('')
const showPrompt = ref(false)

const promptPreview = computed(() => `${QUESTION}\n\n---\n\n${props.markdown}`)

function toAnswerText(response: string | Record<string, unknown>) {
  if (typeof response === 'string') return response
  try {
    return JSON.stringify(response, null, 2)
  } catch {
    return '응답을 표시하는 중 오류가 발생했습니다.'
  }
}

async function onAsk() {
  if (!props.markdown.trim() || isLoading.value) return

  answer.value = ''
  reset()

  try {
    const response = await ask.lite(promptPreview.value)
    answer.value = toAnswerText(response)
  } catch {
    // error ref from useAI
  }
}

function onReset() {
  answer.value = ''
  reset()
}
</script>

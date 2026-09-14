<template>
  <div :class="_class">
    <div
      v-if="model?.trim()"
      class="aspect-video w-full"
    >
      <mYoutubePlayer
        v-model:watched-time="watchedTime"
        v-model:duration="duration"
        v-model:start-time="startTime"
        v-model:is영화관="is영화관"
        class="h-full w-full min-h-0"
        :url="model"
        :설정="{ config: { autoplay: false, mute: false, canMove: !false }, show: { sound: !true } }"
      />
    </div>
    <input문자
      v-if="!readonly"
      v-model="str"
      class="w-full"
      :readonly="readonly"
    />
  </div>
</template>

<script setup lang="ts">
import { _ui, _class } from './_'

interface Props {
  is수정?: boolean
  readonly?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  // is수정: false
  is수정: !false,
  readonly: false
})
const model = defineModel<string | null>({ required: false, default: null })

const watchedTime = ref(0)
const duration = ref(0)
const startTime = ref(0)
const is영화관 = ref(false)

function extractYoutubeVideoId(url: string): string | null {
  if (!url) return null
  const patterns = [
    /[?&]v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /embed\/([a-zA-Z0-9_-]{11})/,
    /v\/([a-zA-Z0-9_-]{11})/,
    /shorts\/([a-zA-Z0-9_-]{11})/
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

const videoId = computed(() => extractYoutubeVideoId(model.value))

watch(videoId, (id, prev) => {
  if (id !== prev) {
    watchedTime.value = 0
    startTime.value = 0
  }
})

const str = computed({
  get: () => model.value,
  set: (v) => {
    if (!v.includes('youtube')) {
      model.value = 'www.youtube.com/watch?v=' + v
    } else
      model.value = v
  }
})
</script>

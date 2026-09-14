<template>
  <div :class="wrapperClass">
    <div
      :id="playerId"
      :class="iframeClass"
      style="z-index:0 !important; "
    />
    <div
      class="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(to_bottom,rgb(0_0_0)_0%,rgb(0_0_0/0.95)_24%,transparent_50%,rgb(0_0_0/0.95)_76%,rgb(0_0_0)_100%)] transition-opacity duration-300"
      :class="is재생전환커버표시 ? 'opacity-100' : 'pointer-events-none opacity-0'"
    />
    <div
      v-if="canMove && is진행드래그중"
      class="pointer-events-none absolute inset-0 z-20 bg-[linear-gradient(to_bottom,rgb(0_0_0)_0%,rgb(0_0_0/0.95)_24%,transparent_50%,rgb(0_0_0/0.95)_76%,rgb(0_0_0)_100%)]"
      aria-hidden="true"
    />
    <button
      type="button"
      class="absolute inset-0 z-30 flex cursor-pointer items-center justify-center transition-opacity duration-200"
      :class="is중앙컨트롤표시 ? 'opacity-100' : 'pointer-events-none opacity-0'"
      @pointerdown.stop.prevent
      @pointerup.stop.prevent="emit('중앙재생')"
    >
      <span class="inline-flex h-24 w-24 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm transition hover:bg-black/50">
        <UIcon
          :name="isPlaying ? 'i-ph-pause-thin' : 'i-ph-play-light'"
          class="h-14 w-14"
        />
      </span>
    </button>
    <div
      class="absolute inset-x-0 bottom-0 z-40 flex items-center gap-2 bg-linear-to-t from-black/60 to-transparent px-2 pb-2 pt-6 transition-opacity duration-200"
      :class="is중앙컨트롤표시 ? 'opacity-100' : 'pointer-events-none opacity-0'"
    >
      <MSlider
        v-if="canMove"
        :model-value="watchedTime"
        :min="0"
        :max="진행슬라이더최대"
        :step="0.25"
        wrapper-class="min-w-0 flex-1"
        :ui="{ track: 'h-1', range: 'bg-primary' }"
        @pointerdown="emit('진행드래그시작')"
        @update:model-value="emit('진행슬라이더변경', $event)"
      />
      <div
        v-else
        class="relative h-1 min-w-0 flex-1 overflow-hidden rounded-full bg-white/30"
      >
        <div
          class="absolute inset-y-0 left-0 rounded-full bg-primary transition-[width] duration-200 ease-out"
          :style="{ width: `${진행률}%` }"
        />
      </div>
      <div class="ml-1 flex shrink-0 items-center gap-1">
        <div
          v-if="showSound"
          class="relative"
          @mouseenter="on사운드호버진입"
          @mouseleave="on사운드호버이탈"
          @focusin="on사운드호버진입"
          @focusout="on사운드호버이탈"
        >
          <div
            class="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 rounded-full bg-black/55 p-2 backdrop-blur-sm transition-all duration-150"
            :class="is사운드호버중 ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-1 opacity-0'"
          >
            <MSlider
              :model-value="volume"
              orientation="vertical"
              :min="0"
              :max="100"
              :step="1"
              wrapper-class="h-20 w-2"
              :ui="{ track: 'w-1 bg-white/35', range: 'bg-primary', thumb: 'h-2.5 w-2.5 bg-white ring-0' }"
              @update:model-value="on볼륨슬라이더"
            />
          </div>
          <mButton
            size="sm"
            역할="조용"
            :icon="volume <= 0 ? 'i-lucide-volume-x' : 'i-lucide-volume-2'"
            class="h-9 w-9 rounded-full text-white hover:bg-white/20"
            @click.stop
          />
        </div>
        <mButton
          size="sm"
          역할="조용"
          :icon="cinema ? 'i-lucide-shrink' : 'i-lucide-expand'"
          class="h-9 w-9 shrink-0 rounded-full text-white hover:bg-white/20"
          @click.stop="emit('전체화면토글', !cinema)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import MSlider from '../Slider.vue'

const props = withDefaults(
  defineProps<{
    playerId: string
    /** true: 전체화면(영화관) 레이아웃 — iframe·래퍼 높이, 축소 버튼 */
    cinema?: boolean
    is재생전환커버표시: boolean
    is진행드래그중: boolean
    is중앙컨트롤표시: boolean
    isPlaying: boolean
    showSound: boolean
    isHoveringPlayer: boolean
    volume: number
    canMove: boolean
    watchedTime: number
    진행슬라이더최대: number
    진행률: number
  }>(),
  { cinema: false }
)

const emit = defineEmits<{
  '중앙재생': []
  '사용자활동': []
  'update:volume': [v: number]
  '진행드래그시작': []
  '진행슬라이더변경': [v: number | number[] | undefined]
  '전체화면토글': [next: boolean]
}>()

const wrapperClass = computed(() =>
  props.cinema
    ? 'relative isolate h-full min-h-0 w-full overflow-hidden rounded-md bg-black'
    : 'relative isolate min-h-0 w-full overflow-hidden rounded-md'
)

const iframeClass = computed(() =>
  props.cinema
    ? 'youtube-iframe-slot relative z-0 h-full w-full cursor-none overflow-hidden'
    : 'youtube-iframe-slot relative z-0 aspect-video w-full cursor-none overflow-hidden'
)
const is사운드호버중 = ref(false)
let 사운드호버종료타이머: ReturnType<typeof setTimeout> | null = null

function on사운드호버진입() {
  if (사운드호버종료타이머) {
    clearTimeout(사운드호버종료타이머)
    사운드호버종료타이머 = null
  }
  is사운드호버중.value = true
}

function on사운드호버이탈() {
  if (사운드호버종료타이머) clearTimeout(사운드호버종료타이머)
  사운드호버종료타이머 = setTimeout(() => {
    is사운드호버중.value = false
    사운드호버종료타이머 = null
  }, 160)
}

function on볼륨슬라이더(v: number | number[] | undefined) {
  const next = Array.isArray(v) ? v[0] : v
  if (next == null || Number.isNaN(Number(next))) return
  emit('update:volume', Number(next))
  emit('사용자활동')
}

onBeforeUnmount(() => {
  if (!사운드호버종료타이머) return
  clearTimeout(사운드호버종료타이머)
  사운드호버종료타이머 = null
})
</script>

<style scoped>
.youtube-iframe-slot :deep(iframe) {
  position: relative;
  z-index: 0;
  pointer-events: none !important;
}
</style>

<template>
  <component
    :is="rootTag"
    class="relative w-full overflow-hidden bg-muted"
    :class="[aspectClass, wrapperClass]"
    v-bind="rootAttrs"
  >
    <img
      v-if="resolvedVideoId"
      :src="thumbnailSrc"
      :alt="altText"
      class="size-full object-cover transition duration-300"
      :class="imageClass"
      loading="lazy"
      width="640"
      height="360"
    >

    <div
      class="pointer-events-none absolute inset-0 bg-linear-to-t from-black/75 via-black/15 to-transparent"
      aria-hidden="true"
    />

    <div
      v-if="showPlayChrome"
      class="pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity"
      :class="playWrapClass"
      aria-hidden="true"
    >
      <span
        class="flex size-14 items-center justify-center rounded-full bg-white/95 text-red-600 shadow-lg ring ring-white/50 dark:bg-neutral-900/90 dark:text-red-500"
      >
        <UIcon name="i-simple-icons-youtube" class="size-8" />
      </span>
    </div>

    <div
      v-if="title"
      class="pointer-events-none absolute inset-x-0 bottom-0 z-1 px-3 pb-3 pt-8"
    >
      <p
        class="line-clamp-2 text-center text-xs font-semibold text-white drop-shadow sm:text-sm"
      >
        {{ title }}
      </p>
    </div>
  </component>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    videoId?: string
    url?: string
    watchUrl?: string
    title?: string
    thumbnailType?: 'mqdefault' | 'hqdefault' | 'sddefault' | 'maxresdefault'
    ratio?: '16:9' | '4:3'
    interactive?: boolean
    hoverScale?: boolean
    wrapperClass?: string
  }>(),
  {
    thumbnailType: 'hqdefault',
    ratio: '16:9',
    interactive: true,
    hoverScale: true
  }
)

const aspectClass = computed(() =>
  props.ratio === '16:9' ? 'aspect-video' : 'aspect-[4/3]'
)

const imageClass = computed(() =>
  props.hoverScale ? 'group-hover:scale-[1.02]' : ''
)

const playWrapClass = computed(() =>
  props.hoverScale ? 'opacity-90 group-hover:opacity-100' : 'opacity-95'
)

function extractYoutubeVideoId(input: string): string | null {
  if (!input?.trim()) return null
  const s = input.trim()
  const patterns = [
    /[?&]v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /embed\/([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/u
  ]
  for (const pattern of patterns) {
    const match = s.match(pattern)
    if (match) return match[1]
  }
  try {
    const u = new URL(s.includes('://') ? s : `https://${s}`)
    if (u.hostname.includes('youtu.be')) {
      const seg = u.pathname.split('/').filter(Boolean)[0]
      if (seg && /^[a-zA-Z0-9_-]{11}$/u.test(seg)) return seg
    }
    const v = u.searchParams.get('v')
    if (v && /^[a-zA-Z0-9_-]{11}$/u.test(v)) return v
  } catch {
    /* ignore */
  }
  return null
}

const resolvedVideoId = computed(() => {
  if (props.videoId && /^[a-zA-Z0-9_-]{11}$/u.test(props.videoId.trim())) {
    return props.videoId.trim()
  }
  if (props.url) return extractYoutubeVideoId(props.url)
  return null
})

const resolvedWatchUrl = computed(() => {
  if (props.watchUrl?.trim()) return props.watchUrl.trim()
  if (props.url?.trim()) return props.url.trim()
  const id = resolvedVideoId.value
  return id ? `https://www.youtube.com/watch?v=${id}` : ''
})

const thumbnailSrc = computed(() => {
  const id = resolvedVideoId.value
  if (!id) return ''
  return `https://img.youtube.com/vi/${id}/${props.thumbnailType}.jpg`
})

const altText = computed(
  () => props.title?.trim() || 'YouTube video thumbnail'
)

const showPlayChrome = computed(() => Boolean(resolvedVideoId.value))

/** 링크로 열 때는 네이티브 navigation, 부모가 덮는 슬라이드는 div + 비대화식 */
const rootTag = computed(() => {
  if (props.interactive && resolvedWatchUrl.value) return 'a'
  return 'div'
})

const rootAttrs = computed(() => {
  if (rootTag.value !== 'a') return {}
  return {
    'href': resolvedWatchUrl.value,
    'target': '_blank',
    'rel': 'noopener noreferrer',
    'aria-label': props.title?.trim()
      ? `${props.title} — YouTube에서 보기`
      : 'YouTube에서 보기'
  }
})
</script>

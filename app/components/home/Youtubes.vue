<template>
  <section
    id="index-youtubes"
    ref="sectionRef"
    class="scroll-mt-20 border-t border-default/40 py-8 sm:py-10 dark:border-default/30"
    aria-labelledby="gknu-youtubes-heading"
  >
    <div class="mx-auto w-full max-w-(--ui-container) px-4 sm:px-6 lg:px-8">
      <div class="flex w-full min-w-0 flex-col gap-6">
        <div class="flex w-full min-w-0 flex-col gap-0">
          <div
            v-bind="등장(0)"
          >
            <SectionHead
              :eyebrow="eyebrow"
              :title="title"
              heading-id="gknu-youtubes-heading"
            >
              <!-- 채널 링크 · 자동 넘김 토글 — 실제로 안 써서 숨김(자동 넘김 자체는 그대로 돈다) -->
              <template
                v-if="false"
                #actions
              >
                <div class="flex shrink-0 flex-wrap items-center justify-start gap-2.5 sm:justify-end">
                  <UButton
                    v-for="link in socialLinks"
                    :key="link.label"
                    :to="link.to"
                    target="_blank"
                    rel="noopener noreferrer"
                    size="md"
                    :icon="link.icon"
                    :aria-label="link.label"
                    square
                    color="neutral"
                    variant="solid"
                    :class="['rounded-full text-white shadow-sm ring-0', link.buttonClass]"
                    :ui="{ base: 'rounded-full' }"
                  />
                  <UButton
                    color="neutral"
                    variant="solid"
                    square
                    size="md"
                    :icon="stripAutoplayPaused ? 'i-lucide-play' : 'i-lucide-pause'"
                    :aria-label="stripAutoplayPaused ? '자동 넘김 재생' : '자동 넘김 일시정지'"
                    class="rounded-full bg-neutral-900 text-white shadow-md ring-0 hover:bg-neutral-800 dark:bg-neutral-950 dark:hover:bg-neutral-900"
                    @click="toggleStripAutoplay"
                  />
                </div>
              </template>
            </SectionHead>
          </div>
          <div
            v-if="descriptionLines.length"
            class="max-w-3xl space-y-1.5 text-left text-sm leading-relaxed text-muted sm:text-base"
            v-bind="등장(55)"
          >
            <p v-for="(line, idx) in descriptionLines" :key="idx">
              {{ line }}
            </p>
          </div>
        </div>

        <div class="flex min-w-0 flex-col gap-4">
          <UCarousel
            ref="videoStripRef"
            v-slot="{ item, index }"
            :items="videoSlides"
            loop
            :autoplay="stripAutoplayOptions"
            class="w-full min-w-0"
            align="center"
            :ui="{ root: 'relative w-full', viewport: '-mx-4 overflow-hidden px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8', container: 'ms-0 gap-4', item: stripItemClass }"
            @select="onStripSelect"
          >
            <div
              class="group relative block min-w-0 overflow-hidden rounded-md bg-muted ring ring-default shadow-sm transition-[transform,box-shadow] hover:shadow-md hover:ring-primary/30 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary"
              :class="{ 'ring-2 ring-primary': index === activeStripIndex }"
              v-bind="등장(120 + index * 65)"
            >
              <a
                v-if="hasEnteredView"
                :href="item.watchUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="absolute right-2 top-2 z-20 inline-flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur-sm sm:text-xs"
              >YouTube에서 보기</a>
              <div class="relative aspect-video w-full min-w-0 overflow-hidden rounded-md bg-black">
                <iframe
                  v-if="hasEnteredView"
                  :key="`${item.videoId}-${index}`"
                  :title="item.title"
                  class="absolute inset-0 z-2 size-full border-0"
                  :src="youtubeEmbedSrc(item.videoId, item.startSeconds, index === activeStripIndex)"
                  :loading="index === activeStripIndex ? 'eager' : 'lazy'"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowfullscreen
                  referrerpolicy="strict-origin-when-cross-origin"
                />
                <YoutubePreview
                  v-else
                  :video-id="item.videoId"
                  :watch-url="item.watchUrl"
                  :title="item.title"
                  thumbnail-type="hqdefault"
                  wrapper-class="rounded-md"
                />
              </div>
            </div>
          </UCarousel>
          <div
            class="flex flex-wrap items-center justify-between gap-3 px-1"
            v-bind="등장(120 + videoSlides.length * 65 + 40)"
          >
            <p class="text-sm text-muted">
              {{ activeStripTitle }}
            </p>
            <UButton label="YouTube에서 보기" color="neutral" variant="outline" size="sm" icon="i-simple-icons-youtube" :to="activeWatchUrl" target="_blank" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import SectionHead from './SectionHead.vue'
import YoutubePreview from './YoutubePreview.vue'
import type { EmblaCarouselType } from 'embla-carousel'

export interface YoutubesSocialLink { label: string, to: string, icon: string, buttonClass?: string }
export interface YoutubesClip { title: string, videoId: string, startSeconds?: number }
interface VideoSlide { title: string, videoId: string, watchUrl: string, startSeconds?: number }

function normalizeYoutubeVideoId(input: string): string {
  const raw = input.trim()
  if (!raw) return ''

  if (!raw.includes('/') && !raw.includes('?') && !raw.includes('&')) return raw

  let candidate = raw
  if (!/^https?:\/\//i.test(candidate)) {
    candidate = `https://${candidate}`
  }

  let parsed: URL
  try {
    parsed = new URL(candidate)
  } catch {
    return raw
  }

  const host = parsed.hostname.replace(/^www\./, '').toLowerCase()
  if (host === 'youtu.be') {
    const id = parsed.pathname.split('/').filter(Boolean)[0]
    return id || raw
  }

  if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com') {
    if (parsed.pathname === '/watch') {
      const id = parsed.searchParams.get('v')
      if (id) return id
    }

    const pathParts = parsed.pathname.split('/').filter(Boolean)
    if (pathParts[0] === 'embed' || pathParts[0] === 'shorts' || pathParts[0] === 'live') {
      return pathParts[1] || raw
    }
  }

  return raw
}

function slideFromClip(clip: YoutubesClip): VideoSlide {
  const start = clip.startSeconds
  const hasStart = typeof start === 'number' && start > 0
  const normalizedVideoId = normalizeYoutubeVideoId(clip.videoId)
  return {
    title: clip.title,
    videoId: normalizedVideoId,
    watchUrl: hasStart ? `https://www.youtube.com/watch?v=${normalizedVideoId}&t=${start}s` : `https://www.youtube.com/watch?v=${normalizedVideoId}`,
    ...(hasStart ? { startSeconds: start } : {})
  }
}
function youtubeEmbedSrc(videoId: string, startSeconds?: number, autoplayMuted = false): string {
  const params = new URLSearchParams({ autoplay: autoplayMuted ? '1' : '0', mute: autoplayMuted ? '1' : '0', playsinline: '1', rel: '0', modestbranding: '1' })
  if (typeof startSeconds === 'number' && startSeconds > 0) params.set('start', String(Math.floor(startSeconds)))
  return `https://www.youtube.com/embed/${encodeURIComponent(videoId)}?${params.toString()}`
}

const props = withDefaults(defineProps<{ eyebrow: string, title: string, description: string, clips: YoutubesClip[], contact: { phone: string, note: string }, socialLinks: YoutubesSocialLink[], stripAutoplayDelay?: number }>(), { stripAutoplayDelay: 4500 })

const descriptionLines = computed(() => props.description.split('\n').map(s => s.trim()).filter(Boolean))
const stripItemClass = 'min-w-0 shrink-0 grow-0 ps-0 basis-[82%] sm:basis-[46%] md:basis-[38%] lg:basis-[31%]'
const videoSlides = computed<VideoSlide[]>(() => props.clips.map(slideFromClip))
const activeStripIndex = ref(0)
const activeWatchUrl = computed(() => videoSlides.value[activeStripIndex.value]?.watchUrl ?? videoSlides.value[0]?.watchUrl ?? '')
const activeStripTitle = computed(() => videoSlides.value[activeStripIndex.value]?.title ?? '')
const stripAutoplayOptions = computed(() => ({ delay: props.stripAutoplayDelay, stopOnInteraction: false }))
const videoStripRef = ref<{ emblaApi: EmblaCarouselType | null | undefined } | null>(null)
const stripAutoplayPaused = ref(false)

function onStripSelect(index: number) {
  activeStripIndex.value = index
}
function getStripEmbla(): EmblaCarouselType | null | undefined {
  return videoStripRef.value?.emblaApi ?? undefined
}
function toggleStripAutoplay() {
  const ap = getStripEmbla()?.plugins()?.autoplay
  if (!ap) return
  if (ap.isPlaying()) {
    ap.stop()
    stripAutoplayPaused.value = true
  } else {
    ap.play()
    stripAutoplayPaused.value = false
  }
}

watch(() => videoStripRef.value?.emblaApi, (api) => {
  const ap = api?.plugins()?.autoplay
  if (ap) stripAutoplayPaused.value = !ap.isPlaying()
}, { immediate: true })

const sectionRef = ref<HTMLElement | null>(null)
const { 들어옴: hasEnteredView, 등장 } = useRise(sectionRef)
</script>

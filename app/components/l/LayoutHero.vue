<!--
  **공식 레이아웃(`layouts/layout-official.vue`)이 세운다** (2026-09-15). official.team-mjt.com 의 사진 히어로를 되살렸다 —
  공식 홈(`/official`)은 큰 캐러셀, 그 밖의 공식 화면(신청·소통·자료 …)은 같은 사진의 짧은 히어로.
  판은 `mode` prop 으로, 짧은 판의 제목·브레드크럼은 `short` prop 으로 받는다(메뉴에서 파생 — `useOfficialSite`).
  헤더는 레이아웃이 히어로 위에 투명하게 얹는다(`transparentHeader` 상태는 안 쓴다 — 늘 false).

  `default`·`layout-v2` 는 이 컴포넌트를 안 세운다. 그 레이아웃 아래 페이지의 `layoutHero` meta 는 아무 일도 안 일어난다. 딸린 것들:
    · `app/composables/useLayoutHero.ts`  — `useLayoutHeroShort()` 로 short 판에 값을 넣는 자리
    · `app/types/global.d.ts` 의 `layoutHero` 페이지 meta 타입
    · `definePageMeta({ layoutHero })` 를 적어 둔 페이지 6곳
      (`checkout/fail`, `(common)/boards/[boardType]/{index,[id],write}` 등)
      — **지금은 적어도 아무 일도 안 일어난다.**
    · `app/composables/useAppNavigation.ts` 의 `isShortLayoutRoute`
      (`route.meta.layoutHero === 'short'` 분기 — 늘 참이 될 수 있지만 그리는 쪽이 없다)

  `mode` 를 안 넘기면 예전처럼 `route.meta.layoutHero` 를 본다.
-->
<template>
  <!-- default·short 동일 UCarousel — short 는 낮은 높이 + bg-bottom 으로 상단이 잘린 것처럼 보임 -->
  <div
    v-if="showHero"
    :id="isLanding ? 'index-main' : undefined"
    ref="heroRootRef"
    :style="heroTopPx != null ? { '--l-hero-top': `${heroTopPx}px` } : undefined"
    :class="[
      'l-layout-hero relative w-full shrink-0 scroll-mt-0 transition-[min-height] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]',
      isShort ? 'overflow-hidden' : '',
      heroMinHClass
    ]"
  >
    <UCarousel
      v-slot="{ item, index }"
      :items="resolvedCarouselSlides"
      loop
      fade

      class="w-full"
      :ui="carouselUi"
      @select="onHeroCarouselSelect"
    >
      <div
        :class="[
          'relative w-full overflow-hidden transition-[min-height] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]',
          heroMinHClass,
          isShort ? 'l-layout-hero__slide--short' : ''
        ]"
        role="img"
        :aria-label="item.alt"
      >
        <div
          class="l-hero-carousel-bg pointer-events-none absolute z-0 -left-[14px] -top-[14px] h-[calc(100%+28px)] w-[calc(100%+28px)] overflow-hidden will-change-transform"
          :class="[
            { 'is-active': index === heroCarouselZoomIndex },
            item.srcDark ? 'dark:opacity-0' : ''
          ]"
        >
          <NuxtImg
            :src="item.src"
            alt=""
            width="1920"
            height="1080"
            format="webp"
            quality="80"
            sizes="xl:100vw"
            draggable="false"
            class="pointer-events-none absolute inset-0 size-full max-w-none object-cover block"
            :class="heroImgObjectClass"
            :loading="index === 0 ? 'eager' : 'lazy'"
            :fetchpriority="index === 0 ? 'high' : 'auto'"
          />
        </div>
        <div
          v-if="item.srcDark"
          class="l-hero-carousel-bg pointer-events-none absolute z-0 -left-[14px] -top-[14px] h-[calc(100%+28px)] w-[calc(100%+28px)] overflow-hidden will-change-transform opacity-0 dark:opacity-100"
          :class="[{ 'is-active': index === heroCarouselZoomIndex }]"
        >
          <NuxtImg
            :src="item.srcDark"
            alt=""
            width="1920"
            height="1080"
            format="webp"
            quality="80"
            sizes="xl:100vw"
            draggable="false"
            class="pointer-events-none absolute inset-0 size-full max-w-none object-cover block"
            :class="heroImgObjectClass"
            :loading="index === 0 ? 'eager' : 'lazy'"
            :fetchpriority="index === 0 ? 'high' : 'auto'"
          />
        </div>
        <div
          v-if="isLanding"
          class="pointer-events-none absolute inset-0 z-1 bg-linear-to-tr from-primary/48 via-neutral-950/35 to-accent/42 mix-blend-multiply dark:from-primary/40 dark:via-neutral-950/45 dark:to-accent/38"
          aria-hidden="true"
        />
        <div
          v-if="isLanding"
          class="pointer-events-none absolute inset-0 z-2 bg-linear-to-t from-neutral-950/55 via-neutral-950/15 to-transparent dark:from-neutral-950/65 dark:via-neutral-950/20"
          aria-hidden="true"
        />
        <div
          v-else-if="isShort"
          class="pointer-events-none absolute inset-0 z-1 bg-linear-to-t from-neutral-950/72 via-neutral-950/45 to-neutral-950/30 dark:from-neutral-950/78 dark:via-neutral-950/52 dark:to-neutral-950/36"
          aria-hidden="true"
        />
      </div>
    </UCarousel>

    <!-- 랜딩: 캐치프레이즈 전체 -->
    <div
      v-if="isLanding"
      class="pointer-events-none absolute inset-0 z-10 flex w-full items-center"
    >
      <div
        class="mx-auto w-full max-w-(--ui-container) transition-[padding] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
        :class="landingPhraseGutterClass"
      >
        <div
          :key="heroCarouselIndex"
          class="max-w-3xl text-pretty text-left"
        >
          <p
            class="hero-phrase-eyebrow is-active font-semibold tracking-wide text-white"
            :class="landingEyebrowTextClass"
          >
            <span
              v-for="(ch, i) in heroCharSegments(activeCarouselHeroPhrase.eyebrow)"
              :key="`e-${heroCarouselIndex}-${i}`"
              class="hero-glyph hero-glyph--eyebrow"
              :class="{ 'hero-glyph--ws': isHeroWhitespaceSegment(ch) }"
              :style="{ '--hero-g': visibleHeroGlyphIndex(activeCarouselHeroPhrase.eyebrow, i) }"
            >{{ ch }}</span>
          </p>
          <p
            class="hero-phrase-title is-active mt-2 font-bold leading-tight text-white"
            :class="landingTitleTextClass"
          >
            {{ activeCarouselHeroPhrase.title }}
          </p>
          <div
            class="hero-phrase-desc is-active mt-3 border-l border-white/30 pl-3 sm:pl-4"
          >
            <p
              class="leading-relaxed text-white"
              :class="landingDescTextClass"
            >
              <span
                v-for="(ch, i) in heroCharSegments(activeCarouselHeroPhrase.description)"
                :key="`d-${heroCarouselIndex}-${i}`"
                class="hero-glyph hero-glyph--desc"
                :class="{ 'hero-glyph--ws': isHeroWhitespaceSegment(ch) }"
                :style="{ '--hero-g': visibleHeroGlyphIndex(activeCarouselHeroPhrase.description, i) }"
              >{{ ch }}</span>
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- short: 같은 캐로셀 위에 제목·브레드크럼(하단 정렬 → 위가 잘린 느낌과 맞춤) -->
    <div
      v-else-if="isShort"
      class="pointer-events-none absolute inset-0 z-10 flex w-full flex-col justify-end pb-8 pt-24 sm:pb-10 sm:pt-28"
    >
      <div
        :key="`short-hero-${route.fullPath}-${resolvedShortState.title}`"
        :class="[
          shellClass,
          'pointer-events-auto flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-6'
        ]"
      >
        <div class="min-w-0 flex flex-col items-start gap-2.5 sm:gap-3">
          <h1
            class="short-hero-title is-active line-clamp-2 min-w-0 text-left text-pretty break-keep font-semibold tracking-tight text-white"
            :class="resolvedShortState.title.length > 16 ? 'text-2xl sm:text-3xl lg:text-4xl' : 'text-3xl sm:text-4xl'"
          >
            {{ resolvedShortState.title }}
          </h1>
          <p
            class="short-hero-eyebrow is-active text-xs font-medium tracking-[0.12em] text-white/80 uppercase"
          >
            {{ resolvedShortState.description }}
          </p>
        </div>
        <div
          class="short-hero-breadcrumb is-active flex min-w-0 shrink-0 justify-start sm:max-w-[40%] sm:justify-end whitespace-nowrap [&_li:last-child]:min-w-0 [&_li:last-child_span]:truncate text-white/80 [&_a]:text-xs [&_a]:font-normal [&_a]:text-white/90 [&_a:hover]:text-white [&_span]:text-xs [&_span]:font-normal [&_svg]:size-3 [&_svg]:text-white/60"
        >
          <UBreadcrumb
            :items="resolvedShortBreadcrumbItems"
            separator-icon="i-lucide-chevron-right"
            :ui="{ separatorIcon: 'size-2.5', link: '!text-white/85 hover:!text-white', linkLabel: 'truncate' }"
          />
        </div>
      </div>
    </div>

    <!-- 공지바 바로 위 센서: 이 선이 헤더 하단에 닿을 때 헤더 소속으로 전환 -->
    <div
      v-if="isNoticeLanding"
      ref="noticeSensorRef"
      class="pointer-events-none absolute inset-x-0 h-px"
      :style="{ bottom: `${NOTICE_BAR_HEIGHT_PX}px` }"
      aria-hidden="true"
    />

    <div
      v-if="isNoticeLanding && !noticeInHeader"
      class="pointer-events-none absolute inset-x-0 bottom-0 z-20"
    >
      <lLandingNoticeBar tone="hero" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CarouselHeroSlide, LayoutHeroShortPayload } from '../../composables/useLayoutHero'
import type { BreadcrumbItem } from '@nuxt/ui'

const props = withDefaults(defineProps<{
  carouselSlides?: CarouselHeroSlide[]
  /** 히어로 바닥에 공지 띠(`lLandingNoticeBar`)를 깐다. 예전엔 `route.path === '/'` 로 정했는데 `/` 가 포트폴리오 소개가 되면서 prop 으로 뺐다. */
  noticeBar?: boolean
  /** 판. 안 넘기면 `route.meta.layoutHero`. 공식 레이아웃은 경로로 정해 넘긴다 — 공용 화면 페이지는 자기가 공식 화면인지 모른다. */
  mode?: 'default' | 'short' | false
  /** 짧은 판 머리. 안 넘기면 `useLayoutHeroShort()` → `useAppNavigation().shortHeroByRoute` 순. */
  short?: LayoutHeroShortPayload | null
}>(), {
  carouselSlides: () => [],
  noticeBar: false,
  mode: undefined,
  short: null
})
const landingCarouselHeroSlides = useLandingCarouselHeroSlides()
const FALLBACK_HERO_SLIDES: CarouselHeroSlide[] = [
  { src: '/img/bg3.png', alt: '', eyebrow: '', title: '', description: '' }
]

const route = useRoute()
const shortState = useLayoutHeroShort()
const { shortHeroByRoute } = useAppNavigation()
const { isHeader, transparentHeader } = useAppLayout()
const noticeInHeader = useState('landing-notice-in-header', () => false)
const heroRootRef = ref<HTMLElement | null>(null)
/**
 * 히어로가 문서에서 실제로 시작하는 높이(px). 「한 화면 = 100dvh − 헤더」로 잴 때 헤더 변수만 빼면
 * 헤더 **바깥** 줄(포트폴리오 띠 같은 `app.vue` 의 줄)이 안 빠져서 공지 띠가 첫 화면 밑으로 밀려난다.
 * 그래서 마운트·리사이즈 때 제 자리를 재서 `--l-hero-top` 으로 쓴다. 못 재면 헤더 변수로 떨어진다.
 */
const heroTopPx = ref<number | null>(null)
function measureHeroTop() {
  const el = heroRootRef.value
  if (!el) return
  const sc = resolveHeroScrollContainer()
  const scrollTop = sc ? sc.scrollTop - sc.getBoundingClientRect().top : window.scrollY
  heroTopPx.value = Math.max(0, Math.round(el.getBoundingClientRect().top + scrollTop))
}
const noticeSensorRef = ref<HTMLElement | null>(null)
const NOTICE_BAR_HEIGHT_PX = 56
const shortHeroMinHClass
  = 'min-h-52 sm:min-h-60 md:min-h-68 landscape:min-h-[15rem]'
  // 'min-h-36 sm:min-h-40 md:min-h-44 landscape:min-h-[11rem]'

/**
 * 짧은 판 제목·브레드크럼 줄의 폭. **헤더·본문과 같은 자(`--ui-container`)** 에 안쪽 여백은 본문 목록(`p-3 sm:p-6`)과 맞춘다 —
 * 예전엔 `max-w-5xl` 안에 `max-w-6xl` 을 겹쳐 제목이 헤더 로고보다 140px 안쪽에서 시작했다.
 */
const shellClass
  = 'mx-auto w-full max-w-(--ui-container) px-3 sm:px-6'

const layoutHeroMode = computed(() => (props.mode !== undefined ? props.mode : route.meta.layoutHero))

const isLanding = computed(() => layoutHeroMode.value === 'default')
const isNoticeLanding = computed(() => isLanding.value && props.noticeBar)
const isShort = computed(() => layoutHeroMode.value === 'short')
const resolvedShortState = computed(
  () => props.short ?? shortState.value ?? shortHeroByRoute.value ?? { title: '', breadcrumbs: [] }
)
const resolvedShortBreadcrumbItems = computed<BreadcrumbItem[]>(() =>
  (resolvedShortState.value.breadcrumbs ?? []).map((item, index) => ({
    ...item,
    icon:
      item.icon
      ?? (index === 0 && String((item as { to?: unknown }).to ?? '') === '/'
        ? 'i-material-symbols-light-home-outline'
        : undefined)
  }))
)
const resolvedShortPrimaryTitle = computed(() => {
  const crumbs = resolvedShortState.value.breadcrumbs ?? []
  const firstLevel = crumbs.find((item, index) => {
    if (index === 0) return false
    return String((item as { to?: unknown }).to ?? '') !== '/'
  })
  return firstLevel?.label || resolvedShortState.value.title || ''
})
const isLandingCompact = ref(false)
const heroExpandIntentAtTop = ref(false)
const mainScrollEl = inject<Ref<HTMLElement | null>>(
  'layout:mainScrollEl',
  ref(null)
)
const HERO_COMPACT_ENTER_Y = 8
const HERO_COMPACT_EXIT_Y = 0

const showHero = computed(
  () =>
    isLanding.value
    || isShort.value
)

const indexHeroMinHClass = computed(() => {
  if (transparentHeader.value) {
    return 'landscape:min-h-dvh portrait:min-h-[min(50svh,100dvh)] sm:portrait:min-h-[min(68svh,100dvh)]'
  }
  if (isHeader.value) {
    return 'landscape:min-h-[calc(100dvh-var(--l-hero-top,var(--ui-layout-header-offset,var(--ui-header-height,4rem))))] portrait:min-h-[min(50svh,calc(100dvh-var(--l-hero-top,var(--ui-layout-header-offset,var(--ui-header-height,4rem)))))] sm:portrait:min-h-[min(68svh,calc(100dvh-var(--l-hero-top,var(--ui-layout-header-offset,var(--ui-header-height,4rem)))))]'
  }
  return 'landscape:min-h-dvh portrait:min-h-[min(50svh,100dvh)] sm:portrait:min-h-[min(68svh,100dvh)]'
})

/** short: 낮은 뷰포트 — cover + bg-bottom 으로 위쪽이 잘림 */

const compactLandingHeroMinHClass = computed(() => {
  const base
    = 'min-h-[360px] sm:min-h-[420px] md:min-h-[520px] landscape:min-h-[340px]'
  if (transparentHeader.value || isHeader.value) {
    return `${base} max-h-[calc(100dvh-var(--l-hero-top,var(--ui-layout-header-offset,var(--ui-header-height,4rem))))]`
  }
  return `${base} max-h-dvh`
})

const heroMinHClass = computed(() =>
  isShort.value
    ? shortHeroMinHClass
    : isLandingCompact.value
      ? compactLandingHeroMinHClass.value
      : indexHeroMinHClass.value
)

/** 스크롤로 히어로가 컴팩트해질 때 — 좌우 여유 + 한 단계 작은 타이포 */
const landingPhraseGutterClass = computed(() =>
  isLandingCompact.value
    ? 'px-5 sm:px-8 md:px-10 lg:px-14'
    : 'px-6 sm:px-10 lg:px-12'
)

const landingEyebrowTextClass = computed(() =>
  isLandingCompact.value
    ? 'text-[0.6875rem] sm:text-xs md:text-sm lg:text-base'
    : 'text-xs sm:text-sm md:text-base lg:text-lg'
)

const landingTitleTextClass = computed(() =>
  isLandingCompact.value
    ? 'text-xl sm:text-2xl md:text-3xl lg:text-4xl'
    : 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl'
)

const landingDescTextClass = computed(() =>
  isLandingCompact.value
    ? 'text-xs sm:text-sm md:text-base lg:text-lg'
    : 'text-sm sm:text-base md:text-lg lg:text-xl'
)

/** `bg-cover` + `bg-bottom` / `bg-center` 에 대응 */
const heroImgObjectClass = computed(() =>
  isShort.value ? 'object-bottom' : 'object-center'
)

const carouselUi = computed(() => ({
  root: 'relative w-full',
  viewport:
    'w-full overflow-hidden bg-neutral-950 transition-[min-height] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]',
  container: 'ml-0',
  item: 'min-w-0 shrink-0 grow-0 basis-full ps-0',
  dots:
    'absolute bottom-20 sm:bottom-24 inset-x-0 z-20 [&_button]:bg-white/70 [&_button]:ring-white/40 dark:[&_button]:bg-white/30'
}))

const heroCarouselIndex = ref(0)
const heroCarouselZoomIndex = ref(0)
const resolvedCarouselSlides = computed<CarouselHeroSlide[]>(() =>
  props.carouselSlides?.length
    ? props.carouselSlides
    : landingCarouselHeroSlides.value?.length
      ? landingCarouselHeroSlides.value
      : FALLBACK_HERO_SLIDES
)

const activeCarouselHeroPhrase = computed(() => {
  const slides = resolvedCarouselSlides.value
  const n = slides.length || 1
  const i = heroCarouselIndex.value % n
  return slides[i] ?? FALLBACK_HERO_SLIDES[0]!
})

function onHeroCarouselSelect(selectedIndex: number) {
  heroCarouselIndex.value = selectedIndex
  heroCarouselZoomIndex.value = selectedIndex
}

watch(layoutHeroMode, () => {
  heroCarouselIndex.value = 0
  heroCarouselZoomIndex.value = 0
  isLandingCompact.value = false
  heroExpandIntentAtTop.value = false
  void nextTick(() => updateLandingCompactState())
})

watch(
  () => route.fullPath,
  () => {
    // 공지 상태만 라우트 전환 시 정리한다.
    // (상세 페이지의 캐로셀/히어로 상태 리셋과 분리)
    noticeInHeader.value = false
    if (!isLanding.value) return
    void nextTick(() => updateLandingCompactState())
  }
)

function resolveHeroScrollContainer(): HTMLElement | null {
  const el = mainScrollEl.value
  if (!el) return null
  return el.scrollHeight > el.clientHeight + 1 ? el : null
}

function updateLandingCompactState() {
  if (!isLanding.value) {
    isLandingCompact.value = false
    heroExpandIntentAtTop.value = false
    noticeInHeader.value = false
    return
  }
  const sc = resolveHeroScrollContainer()
  const y = sc ? sc.scrollTop : window.scrollY || window.pageYOffset
  if (!isLandingCompact.value) {
    if (y >= HERO_COMPACT_ENTER_Y) {
      isLandingCompact.value = true
      heroExpandIntentAtTop.value = false
    }
  } else {
    if (y <= HERO_COMPACT_EXIT_Y && heroExpandIntentAtTop.value) {
      isLandingCompact.value = false
      heroExpandIntentAtTop.value = false
    }
  }

  if (!isNoticeLanding.value) {
    noticeInHeader.value = false
    return
  }
  const headerOffsetRaw = getComputedStyle(document.documentElement)
    .getPropertyValue('--ui-layout-header-offset')
    .trim()
  const headerOffset = Number.parseFloat(headerOffsetRaw) || 64
  const sensorTop = noticeSensorRef.value?.getBoundingClientRect().top ?? Number.POSITIVE_INFINITY
  noticeInHeader.value = sensorTop <= headerOffset + 1
}

let landingCompactDetach: (() => void) | null = null

onMounted(() => {
  let touchStartY = 0
  const onScroll = () => updateLandingCompactState()
  const onResize = () => {
    measureHeroTop()
    updateLandingCompactState()
  }
  const onWheel = (e: WheelEvent) => {
    if (e.deltaY < 0) heroExpandIntentAtTop.value = true
    if (e.deltaY > 0) heroExpandIntentAtTop.value = false
  }
  const onKeydown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowUp' || e.key === 'PageUp' || e.key === 'Home') {
      heroExpandIntentAtTop.value = true
      return
    }
    if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === 'End') {
      heroExpandIntentAtTop.value = false
    }
  }
  const onTouchStart = (e: TouchEvent) => {
    touchStartY = e.touches[0]?.clientY ?? 0
  }
  const onTouchMove = (e: TouchEvent) => {
    const currentY = e.touches[0]?.clientY ?? touchStartY
    heroExpandIntentAtTop.value = currentY > touchStartY
    touchStartY = currentY
  }
  window.addEventListener('scroll', onScroll, { passive: true, capture: true })
  window.addEventListener('resize', onResize, { passive: true })
  window.addEventListener('wheel', onWheel, { passive: true })
  window.addEventListener('keydown', onKeydown)
  window.addEventListener('touchstart', onTouchStart, { passive: true })
  window.addEventListener('touchmove', onTouchMove, { passive: true })
  landingCompactDetach = () => {
    window.removeEventListener('scroll', onScroll, { capture: true })
    window.removeEventListener('resize', onResize)
    window.removeEventListener('wheel', onWheel)
    window.removeEventListener('keydown', onKeydown)
    window.removeEventListener('touchstart', onTouchStart)
    window.removeEventListener('touchmove', onTouchMove)
  }
  void nextTick(() => {
    mainScrollEl.value?.addEventListener('scroll', onScroll, { passive: true })
    const prevDetach = landingCompactDetach
    landingCompactDetach = () => {
      prevDetach?.()
      mainScrollEl.value?.removeEventListener('scroll', onScroll)
    }
    measureHeroTop()
    updateLandingCompactState()
  })
})

onUnmounted(() => {
  landingCompactDetach?.()
  landingCompactDetach = null
})

function heroCharSegments(text: string): string[] {
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    try {
      const seg = new Intl.Segmenter('ko', { granularity: 'grapheme' })
      return Array.from(seg.segment(text), s => s.segment)
    } catch {
      /* noop */
    }
  }
  return Array.from(text)
}

function isHeroWhitespaceSegment(ch: string): boolean {
  return /^\s+$/.test(ch)
}

function visibleHeroGlyphIndex(text: string, segmentIndex: number): number {
  const segs = heroCharSegments(text)
  let n = 0
  for (let j = 0; j <= segmentIndex && j < segs.length; j++) {
    if (!isHeroWhitespaceSegment(segs[j]!)) n++
  }
  return n - 1
}
</script>

<style scoped>
.hero-glyph {
  display: inline-block;
}

.hero-glyph--ws {
  display: inline;
}

.hero-phrase-eyebrow,
.hero-phrase-title,
.hero-phrase-desc {
  word-break: keep-all;
  overflow-wrap: normal;
  line-break: strict;
}

.hero-phrase-eyebrow.is-active .hero-glyph--eyebrow:not(.hero-glyph--ws) {
  animation: hero-glyph-from-top 0.48s cubic-bezier(0.22, 1, 0.36, 1)
    calc(var(--hero-g, 0) * 0.028s) both;
}

.hero-phrase-title.is-active {
  animation: hero-title-fade-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.hero-phrase-desc.is-active .hero-glyph--desc:not(.hero-glyph--ws) {
  animation: hero-glyph-from-right 0.52s cubic-bezier(0.22, 1, 0.36, 1)
    calc(0.12s + var(--hero-g, 0) * 0.02s) both;
}

.short-hero-title.is-active {
  animation: short-hero-swoosh-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.short-hero-eyebrow.is-active {
  animation: short-hero-swoosh-in 0.42s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.short-hero-breadcrumb.is-active {
  animation: short-hero-swoosh-in 0.56s cubic-bezier(0.22, 1, 0.36, 1) 0.08s both;
}

@keyframes hero-glyph-from-top {
  0% {
    opacity: 0;
    transform: translate3d(0, -0.85em, 0);
  }

  100% {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

@keyframes hero-glyph-from-left {
  0% {
    opacity: 0;
    transform: translate3d(-0.65em, 0, 0);
  }

  100% {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

@keyframes hero-title-fade-in {
  0% {
    opacity: 0;
    transform: translate3d(-0.65em, 0, 0);
  }

  100% {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

@keyframes hero-glyph-from-right {
  0% {
    opacity: 0;
    transform: translate3d(0.65em, 0, 0);
  }

  100% {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

@keyframes short-hero-swoosh-in {
  0% {
    opacity: 0;
    filter: blur(2px);
    transform: translate3d(0, 12px, 0);
  }

  100% {
    opacity: 1;
    filter: blur(0);
    transform: translate3d(0, 0, 0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-phrase-eyebrow.is-active .hero-glyph--eyebrow,
  .hero-phrase-title.is-active,
  .hero-phrase-desc.is-active .hero-glyph--desc,
  .short-hero-eyebrow.is-active,
  .short-hero-title.is-active,
  .short-hero-breadcrumb.is-active {
    animation: none !important;
  }
}
</style>

<style>
.l-layout-hero .l-hero-carousel-bg img {
  transform: scale(1.02);
  transform-origin: center;
  backface-visibility: hidden;
  filter: blur(3px) saturate(0.62) contrast(1.04);
}

.l-layout-hero .l-layout-hero__slide--short .l-hero-carousel-bg img {
  transform-origin: bottom center;
  filter: blur(4.5px) saturate(0.62) contrast(1.04) brightness(0.72);
}

.l-layout-hero .l-hero-carousel-bg.is-active img {
  animation: l-layout-hero-carousel-zoom-in 2s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.l-layout-hero .l-layout-hero__slide--short .l-hero-carousel-bg.is-active img {
  animation: l-layout-hero-carousel-zoom-in-short 2s cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes l-layout-hero-carousel-zoom-in {
  from {
    transform: scale(1.15);
  }

  to {
    transform: scale(1.02);
  }
}

@keyframes l-layout-hero-carousel-zoom-in-short {
  from {
    transform: scale(1.12);
  }

  to {
    transform: scale(1.02);
  }
}

@media (prefers-reduced-motion: reduce) {
  .l-layout-hero .l-hero-carousel-bg img {
    transform: scale(1);
    filter: blur(3px) saturate(0.65) contrast(1.02);
  }

  .l-layout-hero .l-layout-hero__slide--short .l-hero-carousel-bg img {
    transform-origin: bottom center;
    filter: blur(4.5px) saturate(0.65) contrast(1.02) brightness(0.74);
  }

  .l-layout-hero .l-hero-carousel-bg.is-active img {
    animation: none;
  }
}
</style>

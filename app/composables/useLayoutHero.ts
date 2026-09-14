import type { BreadcrumbItem } from '@nuxt/ui'
import { computed, inject, provide, toValue, watch, type InjectionKey, type MaybeRefOrGetter, type Ref } from 'vue'

export type LayoutHeroShortPayload = {
  title: string
  description?: string
  description2?: string
  ariaLabel?: string
  breadcrumbs: BreadcrumbItem[]
}

/** `index.vue` 등 — 랜딩 히어로 캐로셀 슬라이드 */
export interface CarouselHeroSlide {
  src: string
  srcDark?: string
  alt: string
  eyebrow: string
  title: string
  description: string
  pageTitle?: string
}

const LANDING_HERO_SLIDES_FALLBACK: CarouselHeroSlide[] = [
  { src: '/img/bg3.png', alt: '', eyebrow: '', title: '', description: '' }
]

/**
 * `definePageMeta({ layoutHero: 'short' })` 페이지에서 제목·브레드크럼 등을 넣고
 * `lLayoutHero` short 분기에서 표시합니다.
 */
export function useLayoutHeroShort() {
  return useState<LayoutHeroShortPayload | null>('layout-hero-short', () => null)
}

/** 레이어(base2)에서 읽고, 실제 값은 앱(mjt-official) `_CUSTOM/configs/hero`에서 가져온다. */
export function useLandingCarouselHeroSlides() {
  const appConfig = useAppConfig() as { heroSlides?: CarouselHeroSlide[] }
  return computed<CarouselHeroSlide[]>(() =>
    Array.isArray(appConfig.heroSlides) && appConfig.heroSlides.length
      ? appConfig.heroSlides
      : LANDING_HERO_SLIDES_FALLBACK
  )
}

const HERO_TITLE_KEY: InjectionKey<Ref<string>> = Symbol('layout:heroTitle')

/**
 * 짧은 히어로가 **이미 말한 제목**을 아래 페이지 머리에 알린다(`layout-official`).
 * 히어로 제목은 켜진 메뉴 이름이라(「신청」·「자료」) 페이지 머리 제목과 같은 말인 경우가 많다 —
 * 같은 글자를 사진 위와 종이 위에 두 번 적지 않게, 페이지 머리가 이걸 보고 제목 줄만 뺀다(설명·건수는 남는다).
 * 「소통」 히어로 아래 「공지」처럼 **다른 말이면 둘 다 선다** — 그땐 히어로가 묶음, 머리가 이 화면이다.
 */
export function provideHeroTitle(title: Ref<string>) {
  provide(HERO_TITLE_KEY, title)
}

/** 이 제목을 히어로가 이미 말했나. 히어로가 없는 레이아웃에선 늘 false. */
export function useIsHeroTitle(title: MaybeRefOrGetter<string | undefined>) {
  const heroTitle = inject(HERO_TITLE_KEY, null)
  return computed(() => {
    const mine = toValue(title)?.trim()
    return Boolean(mine && heroTitle?.value?.trim() === mine)
  })
}

/**
 * **상세 화면이 제 제목을 히어로에 올린다** — 「신청」 히어로 아래에 더 작은 워크숍 제목이 서면 위계가 뒤집혀서다.
 * 공식 레이아웃은 이 값이 있으면 짧은 히어로를 이 제목으로 쓰고 브레드크럼을 「홈 › 메뉴 › 제목」으로 잇는다.
 * 페이지 머리 쪽 제목 줄은 `useIsHeroTitle` 이 뺀다. 히어로가 없는 레이아웃(`default`)에선 아무 일도 없다.
 *
 * 값은 **경로와 함께** 둔다 — 앞 화면이 남긴 제목이 다음 화면 히어로에 잠깐 붙지 않게, 레이아웃은 경로가 같을 때만 읽는다.
 */
export function useHeroPageTitle(title: MaybeRefOrGetter<string | undefined>) {
  const route = useRoute()
  const state = useHeroPageTitleState()
  const path = route.path
  const put = (v?: string) => {
    state.value = { path, title: v?.trim() ?? '' }
  }
  put(toValue(title))
  watch(() => toValue(title), put)
}

export function useHeroPageTitleState() {
  return useState<{ path: string, title: string } | null>('layout-hero-page-title', () => null)
}

<template>
  <section
    id="index-news"
    ref="newsSectionRef"
    class="scroll-mt-20 border-t border-default/40 py-8 sm:py-10 dark:border-default/30"
    aria-labelledby="gknu-news-heading"
  >
    <div class="mx-auto w-full max-w-(--ui-container) px-4 sm:px-6 lg:px-8">
      <div
        class="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8 xl:gap-10"
      >
        <div
          id="index-news-today"
          class="min-w-0 flex-1 scroll-mt-24"
        >
          <div
            v-bind="등장(0)"
          >
            <SectionHead
              :eyebrow="todayEyebrow"
              :title="todayTitle"
              heading-id="gknu-news-heading"
            >
              <template #actions>
                <UButton
                  square
                  variant="outline"
                  color="neutral"
                  icon="i-lucide-plus"
                  class="shrink-0 self-center border-default/80"
                  :aria-label="`${todayTitle} 더보기`"
                  @click="onTodayMoreClick"
                />
              </template>
            </SectionHead>
          </div>

          <div
            class="grid min-w-0 items-start gap-5 md:grid-cols-[minmax(0,1.12fr)_minmax(0,1fr)] md:gap-6"
          >
            <article
              v-if="hasFeatured"
              class="min-w-0"
              role="link"
              tabindex="0"
              :class="{ 'cursor-pointer': !!featuredLink }"
              v-bind="등장(130)"
              @click="onNewsItemClick(featuredLink)"
              @keydown.enter.prevent="onNewsItemClick(featuredLink)"
            >
              <component
                :is="featuredLink ? 'NuxtLink' : 'div'"
                v-bind="featuredLink ? { to: featuredLink } : {}"
                class="group flex min-h-0 flex-col outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F8F9FA] dark:focus-visible:ring-offset-neutral-900"
                :class="
                  featuredLink
                    ? 'overflow-hidden rounded-xl border border-default/40 bg-white shadow-sm ring ring-default/40 transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-md dark:bg-neutral-900/50'
                    : 'overflow-hidden rounded-xl border border-default/40 bg-white dark:bg-neutral-900/50'
                "
              >
                <div
                  class="relative aspect-4/3 w-full overflow-hidden bg-muted"
                >
                  <div v-if="!featured.imageSrc" class="size-full bg-linear-to-br" :class="featured.imageClass" />
                  <NuxtImg
                    v-else
                    :src="featured.imageSrc"
                    :alt="featured.imageAlt"
                    class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"

                    loading="lazy"
                  />

                  <!-- width="72"
                      height="72"
                      loading="lazy" -->
                </div>
                <div class="p-4 sm:p-5">
                  <h3
                    class="line-clamp-2 text-base leading-snug text-highlighted break-keep group-hover:text-primary sm:text-[17px]"
                  >
                    {{ featured.title }}
                  </h3>
                  <p
                    class="mt-2 line-clamp-3 text-sm leading-relaxed text-muted"
                  >
                    {{ featured.summary }}
                  </p>
                </div>
              </component>
            </article>

            <div
              class="flex min-w-0 flex-col border-t border-default/30 md:border-t-0"
              :class="{ 'md:col-span-2': !hasFeatured }"
            >
              <article
                v-for="(item, idx) in sideNewsSlots"
                :key="idx"
                role="link"
                tabindex="0"
                class="min-w-0 border-b border-default/30 px-0 py-4 last:border-b-0 sm:border-default/25 sm:px-2 sm:py-4 lg:px-3"
                :class="{
                  'hidden': !item,
                  'cursor-pointer': !!resolveNewsLink(item?.to)
                }"
                v-bind="등장(200 + idx * 72)"
                @click="onNewsItemClick(resolveNewsLink(item?.to))"
                @keydown.enter.prevent="onNewsItemClick(resolveNewsLink(item?.to))"
              >
                <component
                  :is="resolveNewsLink(item?.to) ? 'NuxtLink' : 'div'"
                  v-bind="
                    resolveNewsLink(item?.to)
                      ? { to: resolveNewsLink(item?.to) }
                      : {}
                  "
                  class="group flex gap-3 outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F8F9FA] dark:focus-visible:ring-offset-neutral-900"
                  :class="resolveNewsLink(item?.to) ? 'rounded-lg p-1 -m-1 transition-colors hover:bg-white/80 dark:hover:bg-neutral-800/40' : ''"
                >
                  <div
                    class="relative size-18 shrink-0 overflow-hidden rounded-lg bg-muted ring ring-default/50"
                  >
                    <div v-if="!item?.imageSrc" class="size-full bg-linear-to-br" :class="item?.imageClass" />
                    <NuxtImg
                      v-else
                      :src="item?.imageSrc"
                      :alt="item?.imageAlt"
                      class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      width="72"
                      height="72"
                      loading="lazy"
                    />
                  </div>
                  <div class="min-w-0 flex-1">
                    <h3
                      class="line-clamp-2 text-base leading-snug text-highlighted break-keep group-hover:text-primary sm:text-[17px]"
                    >
                      {{ item?.title }}
                    </h3>
                    <p
                      class="mt-1.5 line-clamp-2 text-sm leading-snug text-muted"
                    >
                      {{ item?.summary }}
                    </p>
                  </div>
                </component>
              </article>
            </div>
          </div>
        </div>

        <aside
          v-if="peopleStories.length > 0"
          id="index-news-intro"
          class="bg-primary flex w-full min-w-0 shrink-0 flex-col scroll-mt-24 overflow-visible rounded-xl border border-white/10 px-5 py-5 pb-6 text-white shadow-sm sm:px-6 sm:py-6 lg:max-w-[min(100%,20rem)]"
          aria-labelledby="gknu-people-heading"
          v-bind="등장(260 + sideNews.length * 72)"
        >
          <div class="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
            <div class="min-w-0 flex-1 basis-[min(100%,12rem)] break-keep">
              <p
                class="text-xs uppercase tracking-wider text-amber-300/95 sm:text-sm"
              >
                {{ peopleEyebrow }}
              </p>
              <h2
                id="gknu-people-heading"
                class="mt-1 text-2xl leading-tight tracking-tight sm:text-3xl"
              >
                {{ peopleTitle }}
              </h2>
            </div>
            <div class="flex shrink-0 items-center gap-1 self-center sm:self-start">
              <UButton
                color="neutral"
                variant="ghost"
                size="sm"
                square
                icon="i-lucide-chevron-up"
                class="text-white hover:bg-white/15"
                :aria-label="`${peopleTitle} 이전`"
                @click="prevPeople"
              />
              <UButton
                color="neutral"
                variant="ghost"
                size="sm"
                square
                icon="i-lucide-chevron-down"
                class="text-white hover:bg-white/15"
                :aria-label="`${peopleTitle} 다음`"
                @click="nextPeople"
              />
              <UButton
                color="neutral"
                variant="outline"
                size="sm"
                square
                icon="i-lucide-plus"
                class="border-white/50 text-white hover:bg-white/10"
                :aria-label="`${peopleTitle} 더보기`"
                @click="onPeopleMoreClick"
              />
            </div>
          </div>

          <USeparator class="my-4 border-white/20 sm:my-5" />

          <div
            class="flex flex-col gap-3 rounded-lg sm:gap-4"
            role="link"
            tabindex="0"
            @click="onPeopleItemClick"
            @keydown.enter.prevent="onPeopleItemClick"
          >
            <div
              class="relative mx-auto aspect-4/3 w-full max-w-54 shrink-0 overflow-hidden rounded-xl bg-black/20 ring ring-white/20 sm:max-w-56"
            >
              <div v-if="!activePeople?.imageSrc" class="size-full bg-linear-to-br" :class="activePeople?.imageClass" />
              <NuxtImg
                v-else
                :src="activePeople.imageSrc"
                :alt="activePeople.imageAlt"
                class="h-full w-full object-cover object-center sm:object-top"
                sizes="(max-width: 1024px) 60vw, 224px"
                loading="lazy"
              />
            </div>
            <h3
              class="line-clamp-2 text-center text-base leading-snug break-keep sm:text-[17px]"
            >
              {{ activePeople.headline }}
            </h3>
            <p
              class="text-pretty line-clamp-4 text-sm leading-relaxed text-white/90 break-keep"
            >
              {{ activePeople.body }}
            </p>
          </div>
        </aside>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import SectionHead from './SectionHead.vue'

export type NewsItem
  = | {
    kind: 'featured'
    title: string
    summary: string
    imageSrc: string
    imageAlt: string
    /** 사진이 없을 때 그라디언트 자리 클래스 */
    imageClass?: string
    to: string
  }
  | {
    kind: 'side'
    title: string
    summary: string
    imageSrc: string
    imageAlt: string
    /** 사진이 없을 때 그라디언트 자리 클래스 */
    imageClass?: string
    to: string
  }
  | {
    kind: 'people'
    headline: string
    body: string
    imageSrc: string
    imageAlt: string
    /** 사진이 없을 때 그라디언트 자리 클래스 */
    imageClass?: string
    /** 없으면 소식 게시판 목록(`moreTo`)으로 간다. */
    to?: string
  }

export type NewsFeatured = Omit<
  Extract<NewsItem, { kind: 'featured' }>,
  'kind'
>
export type NewsSideItem = Omit<Extract<NewsItem, { kind: 'side' }>, 'kind'>
export type PeopleStory = Omit<Extract<NewsItem, { kind: 'people' }>, 'kind'>

const EMPTY_FEATURED: NewsFeatured = {
  title: '',
  summary: '',
  imageSrc: '',
  imageAlt: '',
  to: '#'
}

const props = withDefaults(defineProps<{
  todayEyebrow: string
  todayTitle: string
  peopleEyebrow: string
  peopleTitle: string
  items: NewsItem[]
  /** 「더보기」와 링크 없는 항목이 가는 곳 — 소식 게시판 목록. */
  moreTo?: string
  /**
   * 대표 곁에 세우는 글 수. 둘이면 소식 16편 중 3편만 보이고 곁 줄기가 대표 카드(4:3 사진 + 글) 중간에서 끝나 옆이 비었다.
   * 넓은 화면(1440)에서 곁 한 줄이 105px쯤, 대표 카드가 570px쯤이라 다섯이 그 높이에 가장 가깝다 — 공지(6편)와 수도 맞는다.
   */
  sideLimit?: number
}>(), {
  moreTo: '/boards/news',
  sideLimit: 5
})

const featured = computed<NewsFeatured>(() => {
  const row = props.items.find(i => i.kind === 'featured')
  if (!row) return EMPTY_FEATURED
  const { kind: _k, ...rest } = row
  return rest
})

const hasFeatured = computed<boolean>(
  () => !!featured.value.title.trim() || !!featured.value.summary.trim()
)
const featuredLink = computed(() => resolveNewsLink(featured.value.to))

const sideNews = computed<NewsSideItem[]>(() =>
  props.items
    .filter((i): i is Extract<NewsItem, { kind: 'side' }> => i.kind === 'side')
    .map(({ kind: _k, ...rest }) => rest)
)

const sideNewsSlots = computed<Array<NewsSideItem | null>>(() => {
  const visible = sideNews.value.slice(0, props.sideLimit)
  const missing = Math.max(0, props.sideLimit - visible.length)
  return [...visible, ...Array.from({ length: missing }, () => null)]
})

const peopleStories = computed<PeopleStory[]>(() =>
  props.items
    .filter((i): i is Extract<NewsItem, { kind: 'people' }> => i.kind === 'people')
    .map(({ kind: _k, ...rest }) => rest)
)

const peopleIndex = ref(0)

const activePeople = computed(
  () =>
    peopleStories.value[peopleIndex.value] ?? peopleStories.value[0]
)

function prevPeople() {
  const n = peopleStories.value.length
  if (n <= 1) return
  peopleIndex.value = (peopleIndex.value - 1 + n) % n
}

function nextPeople() {
  const n = peopleStories.value.length
  if (n <= 1) return
  peopleIndex.value = (peopleIndex.value + 1) % n
}

function resolveLink(to: string | undefined, fallback: string) {
  if (!to) return fallback
  const trimmed = to.trim()
  return trimmed && trimmed !== '#' ? trimmed : fallback
}

function resolveNewsLink(to: string | undefined) {
  return resolveLink(to, props.moreTo)
}

function onTodayMoreClick() {
  navigateTo(props.moreTo)
}

function onPeopleMoreClick() {
  navigateTo(props.moreTo)
}

function onNewsItemClick(to: string | undefined) {
  if (!to) return
  navigateTo(to)
}

function onPeopleItemClick() {
  navigateTo(resolveNewsLink(activePeople.value?.to))
}

const newsSectionRef = ref<HTMLElement | null>(null)
const { 등장 } = useRise(newsSectionRef)
</script>

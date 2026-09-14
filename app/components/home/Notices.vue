<template>
  <section
    id="index-notices"
    ref="sectionRef"
    class="scroll-mt-20 border-t border-default/40 py-8 sm:py-10 dark:border-default/30"
    aria-labelledby="gknu-notices-heading"
  >
    <div class="mx-auto w-full max-w-(--ui-container) px-4 sm:px-6 lg:px-8">
      <div
        v-bind="등장(0)"
      >
        <SectionHead
          :eyebrow="props.eyebrow"
          :title="props.title"
          heading-id="gknu-notices-heading"
        >
          <template #actions>
            <UButton
              square
              variant="outline"
              color="neutral"
              icon="i-lucide-plus"
              class="shrink-0 border-default/80"
              aria-label="공지 더보기"
              @click="onMoreClick"
            />
          </template>
        </SectionHead>
      </div>

      <nav
        class="mb-6 flex flex-wrap gap-x-4 gap-y-2"
        role="tablist"
        aria-label="공지 카테고리"
        v-bind="등장(110)"
      >
        <button
          v-for="cat in categories"
          :key="cat"
          type="button"
          role="tab"
          :aria-selected="activeCategory === cat"
          class="text-left text-sm transition-colors sm:text-base"
          :class="
            activeCategory === cat
              ? 'text-highlighted'
              : 'text-muted hover:text-default'
          "
          @click="activeCategory = cat"
        >
          <template v-if="activeCategory === cat">
            <span class="text-primary">#</span> {{ cat }}
          </template>
          <template v-else>
            {{ cat }}
          </template>
        </button>
      </nav>

      <div
        :key="activeCategory"
        class="notice-grid grid grid-cols-1 gap-0 border-t border-default/30 sm:grid-cols-2 lg:grid-cols-3"
      >
        <article
          v-for="(item, idx) in filteredNotices"
          :key="`${item.title}-${idx}`"
          role="link"
          tabindex="0"
          class="group flex min-h-0 flex-col border-b border-default/30 px-0 py-4 sm:border-default/25 sm:px-3 lg:px-4"
          :class="{ 'cursor-pointer': !!resolveLink(item.to, props.moreTo) }"
          v-bind="등장(200 + idx * 65)"
          @click="onNoticeItemClick(item.to)"
          @keydown.enter.prevent="onNoticeItemClick(item.to)"
        >
          <component
            :is="resolveLink(item.to, props.moreTo) ? 'NuxtLink' : 'div'"
            v-bind="
              resolveLink(item.to, props.moreTo)
                ? { to: resolveLink(item.to, props.moreTo) }
                : {}
            "
            class="flex min-h-0 flex-1 flex-col outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F8F9FA] dark:focus-visible:ring-offset-neutral-900"
            :class="resolveLink(item.to, props.moreTo) ? '' : 'cursor-default'"
          >
            <h3
              class="line-clamp-2 text-base leading-snug text-highlighted group-hover:text-primary sm:text-[17px]"
            >
              {{ item.title }}
            </h3>
            <p class="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-muted">
              {{ item.description }}
            </p>
            <time
              class="mt-4 block text-xs text-muted/90"
              :datetime="item.date"
            >
              {{ item.date }}
            </time>
          </component>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import SectionHead from './SectionHead.vue'

export type NoticeItem = {
  category: string
  title: string
  description: string
  date: string
  to?: string
}

const props = withDefaults(
  defineProps<{
    categories: readonly string[]
    notices: NoticeItem[]
    eyebrow?: string
    title?: string
    /** 「더보기」와 링크 없는 항목이 가는 곳 — 공지 게시판 목록. */
    moreTo?: string
    /**
     * 한 탭에 세우는 공지 수. 홈은 최신 몇 편만 보이고 나머지는 「더보기」(게시판)로 보낸다 —
     * 자르지 않았더니 공지 15편이 3열 5줄로 깔려 홈이 공지판이 됐다. 6은 3열·2열 어느 쪽에서도 줄이 꽉 찬다.
     */
    limit?: number
  }>(),
  {
    eyebrow: '마장터 NOTICE',
    title: '마장터에서 알립니다',
    moreTo: '/boards/notice',
    limit: 6
  }
)

const activeCategory = ref<string>(props.categories[0] ?? '')

watch(
  () => props.categories,
  (cats) => {
    if (!cats.length) {
      activeCategory.value = ''
      return
    }
    if (!cats.includes(activeCategory.value)) {
      activeCategory.value = cats[0]!
    }
  },
  { deep: true }
)

const filteredNotices = computed(() =>
  props.notices.filter(n => n.category === activeCategory.value).slice(0, props.limit)
)

const sectionRef = ref<HTMLElement | null>(null)
const { 등장 } = useRise(sectionRef)

function onMoreClick() {
  navigateTo(props.moreTo)
}

function resolveLink(to: string | undefined, fallback: string) {
  if (!to) return fallback
  const trimmed = to.trim()
  return trimmed && trimmed !== '#' ? trimmed : fallback
}

function onNoticeItemClick(to: string | undefined) {
  const link = resolveLink(to, props.moreTo)
  if (!link) return
  navigateTo(link)
}
</script>

<style scoped>
.notice-grid {
  overflow: visible;
}
</style>

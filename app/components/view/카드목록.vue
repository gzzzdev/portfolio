<template>
  <!-- max-w-[1280px] px-4 py-6 lg:px-6 -->
  <div class="mx-auto w-full ">
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside class="hidden rounded-lg border border-default bg-default p-4 lg:block">
        <h2 class="mb-4 text-sm font-semibold text-highlighted">
          Filters
        </h2>

        <div class="space-y-5">
          <section
            v-for="group in filterGroups"
            :key="group.key"
          >
            <h3 class="mb-2 text-sm font-semibold text-highlighted">
              {{ group.title || 'Filter' }}
            </h3>
            <Input선택기
              :model-value="selectedFilters[group.key]"
              type="radio"
              :search="false"
              :indicator="false"
              has삭제
              삭제라벨="전체"
              :items="group.options.map((option) => ({ label: option.label, value: option.value }))"
              class="w-full"
              @update:model-value="(value) => emit('setFilter', group.key, value == null ? null : String(value))"
            />
          </section>
        </div>
      </aside>

      <main>
        <div class="mb-3 lg:hidden">
          <mButton
            block

            :label="`필터 ${isMobileFilterOpen ? '닫기' : '열기'}${activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}`"
            @click="emit('update:isMobileFilterOpen', !isMobileFilterOpen)"
          />
        </div>

        <div
          v-if="isMobileFilterOpen"
          class="mb-4 rounded-lg border border-default bg-default p-4 lg:hidden"
        >
          <h2 class="mb-4 text-sm font-semibold text-highlighted">
            Filters
          </h2>
          <div class="space-y-5">
            <section
              v-for="group in filterGroups"
              :key="`mobile-${group.key}`"
            >
              <h3 class="mb-2 text-sm font-semibold text-highlighted">
                {{ group.title || 'Filter' }}
              </h3>
              <div class="space-y-2">
                <UCheckbox
                  :model-value="!selectedFilters[group.key]"
                  label="전체"
                  @update:model-value="(checked) => checked && emit('setFilter', group.key, null)"
                />
                <UCheckbox
                  v-for="option in group.options"
                  :key="`mobile-${group.key}-${option.value}`"
                  :model-value="selectedFilters[group.key] === option.value"
                  :label="option.label"
                  @update:model-value="(checked) => emit('setFilter', group.key, checked ? option.value : null)"
                />
              </div>
            </section>
          </div>
        </div>

        <div class="mb-4 flex flex-col gap-3 md:flex-row md:items-center">
          <UInput
            :model-value="search"
            icon="i-heroicons-magnifying-glass-20-solid"
            class="w-full"
            size="lg"
            placeholder="Search for courses..."
            @update:model-value="(value) => emit('update:search', String(value ?? ''))"
          />
          <USelect
            :model-value="sortValue"
            :items="sortOptions"
            class="w-full md:w-44"
            @update:model-value="(value) => emit('update:sortValue', String(value ?? ''))"
          />
        </div>

        <div class="mb-4 text-2xl font-semibold text-highlighted">
          {{ filteredCourses.length }} courses
        </div>

        <div
          v-if="!isReady"
          class="rounded-lg border border-default bg-default p-8 text-center text-muted"
        >
          Loading courses...
        </div>

        <div
          v-else-if="filteredCourses.length === 0"
          class="rounded-lg border border-default bg-default p-8 text-center text-muted"
        >
          No courses found.
        </div>

        <div
          v-else
          class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          <article
            v-for="course in filteredCourses"
            :key="course.id"
            class="cursor-pointer overflow-hidden rounded-xl border border-default bg-default m-층-카드 transition hover:-translate-y-0.5 hover:shadow-md"
            @click="emit('selectCourse', course.id)"
          >
            <div class="relative aspect-16/10 overflow-hidden bg-elevated">
              <NuxtImg
                :src="course.image"
                :alt="course.title"
                class="h-full w-full object-cover"
                width="640"
                height="400"
                sizes="sm:100vw md:50vw xl:25vw"
                format="avif,webp"
                loading="lazy"
                quality="80"
              />
              <span class="absolute left-2 top-2 rounded bg-black/70 px-2 py-1 text-xs font-medium text-white">
                {{ course.duration }}
              </span>
              <span class="absolute right-2 top-2 rounded bg-primary px-2 py-1 text-xs font-semibold text-white">
                {{ course.badge }}
              </span>
              <span
                v-if="getPriceLabel(course)"
                class="absolute bottom-2 right-2 rounded bg-inverted px-2 py-1 text-xs font-semibold text-inverted"
              >
                {{ getPriceLabel(course) }}
              </span>
            </div>

            <div class="space-y-2 p-4">
              <div
                class="flex items-center gap-2 text-[0.625rem] font-medium tracking-[0.12em] text-muted"
                :class="course.sub ? 'justify-between' : 'justify-end'"
              >
                <span
                  v-if="course.sub"
                  class="min-w-0 flex-1 truncate"
                >{{ course.sub }}</span>
                <span class="shrink-0 text-toned">★ {{ course.rating }}</span>
              </div>
              <h3 class="line-clamp-2 min-h-[2.8rem] text-base font-semibold text-highlighted">
                {{ course.title }}
              </h3>
              <p class="line-clamp-2 text-sm text-toned">
                {{ course.description }}
              </p>
            </div>
          </article>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
interface FilterGroupOption {
  label: string
}

interface FilterGroup {
  key: string
  title?: string
  options: FilterGroupOption[]
}

interface CourseCardView {
  id: number
  sub: string
  title: string
  image: string
  duration: string
  badge: string
  rating: string
  description: string
  price?: number | string | null
  source?: {
    price?: number | string | null
    수강료?: number | string | null
    결제금액?: number | string | null
    state?: {
      price?: number | string | null
    }
  }
}

interface SelectOption {
  label: string
  value: string
}

defineProps<{
  isReady: boolean
  filterGroups: FilterGroup[]
  selectedFilters: Record<string, string | null>
  activeFilterCount: number
  isMobileFilterOpen: boolean
  search: string
  sortValue: string
  sortOptions: SelectOption[]
  filteredCourses: CourseCardView[]
}>()

const emit = defineEmits<{
  'update:isMobileFilterOpen': [value: boolean]
  'update:search': [value: string]
  'update:sortValue': [value: string]
  'setFilter': [key: string, value: string | null]
  'selectCourse': [id: number]
}>()

const getPriceLabel = (course: CourseCardView) => {
  const rawPrice
    = course.price
      ?? course.source?.price
      ?? course.source?.수강료
      ?? course.source?.결제금액
      ?? course.source?.state?.price
  if (rawPrice == null || rawPrice === '') return null

  const parsedPrice = Number(rawPrice)
  if (!Number.isFinite(parsedPrice) || parsedPrice < 0) return null
  if (parsedPrice === 0) return '무료'

  return `₩${Math.floor(parsedPrice).toLocaleString('ko-KR')}`
}
</script>

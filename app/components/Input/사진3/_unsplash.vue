<template>
  <div
    class="flex flex-col gap-2"
    :class="isSidePanelLayout ? 'h-full' : ''"
  >
    <form
      class="flex items-center gap-1.5"
      @submit.prevent="fetchCandidates"
    >
      <mInput
        v-model="tagsInput"
        class="flex-1"
        placeholder="nature, forest"
      />
      <mButton
        type="submit"
        size="sm"

        icon="i-lucide-search"
        :loading="is로딩중"
      />
    </form>
    <div class="px-1">
      <div class="flex flex-wrap items-center gap-1">
        <mButton
          v-for="tag in hintTags"
          :key="tag"
          size="xs"
          역할="조용"
          :켜짐="isTagSelected(tag)"
          class="rounded-full"
          @click="() => toggleHintTag(tag)"
        >
          {{ tag }}
        </mButton>
      </div>
    </div>

    <UAlert
      v-if="errorMessage"
      color="error"
      title="후보 조회 실패"
      :description="errorMessage"
    />

    <div :class="isSidePanelLayout ? 'flex-1 min-h-0 overflow-y-auto pr-1' : ''">
      <div
        v-if="candidates.length > 0"
        class="photo-picker-candidates grid gap-2"
        :class="isSidePanelLayout ? 'grid-cols-1' : 'grid-cols-2'"
      >
        <div
          v-for="item in visibleCandidates"
          :key="item.id"
          role="button"
          tabindex="0"
          class="relative cursor-pointer overflow-hidden rounded-md border transition"
          :class="selectedId === item.id ? 'border-primary ring-2 ring-primary/30' : 'border-accented hover:border-primary/60'"
          @click="pick(item)"
          @keydown.enter.prevent="pick(item)"
          @keydown.space.prevent="pick(item)"
        >
          <img
            :src="item.image.small"
            :alt="item.altDescription || item.description || 'Unsplash candidate'"
            class="aspect-video w-full object-cover"
            loading="lazy"
          >
          <div class="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/75 via-black/35 to-transparent px-2 py-1.5 text-right text-[0.6875rem] text-white">
            <p class="truncate">
              <a
                :href="item.attribution.photographerProfileUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="pointer-events-auto underline decoration-white/40 underline-offset-2 hover:decoration-white"
                @click.stop
              >
                {{ item.attribution.photographerName }}
              </a>
            </p>
          </div>
        </div>
      </div>

      <div
        v-if="candidates.length > 0 && canShowMore"
        class="mt-2 flex justify-center"
      >
        <mButton
          size="xs"
          역할="조용"
          icon="i-lucide-chevrons-down"
          class="min-w-24 justify-center"
          @click="showMoreCandidates"
        />
      </div>
    </div>
    <div class="text-xs text-muted px-1 text-right">
      on Unsplash
    </div>
  </div>
</template>

<script setup lang="ts">
import type { RandPicItem, RandPicOrientation } from '~/app/composables/useRandPic'

interface Props {
  tags?: string | string[]
  count?: number
  orientation?: RandPicOrientation
  isSidePanelLayout?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  tags: '자연',
  count: 8,
  orientation: 'landscape',
  isSidePanelLayout: false
})

const model = defineModel<string | null>({ required: false, default: null })
const is로딩중 = defineModel<boolean>('isDoing', { required: false, default: false })

const { getRandPics, error, reset } = useRandPic()
const MAX_FETCH_COUNT = 30
const INITIAL_VISIBLE_COUNT = 4
const VISIBLE_STEP = 4
const hintTags = ['자연', '여행', '공부', '사무실'] as const

const tagsInput = ref(Array.isArray(props.tags) ? props.tags.join(', ') : props.tags)
const candidates = ref<RandPicItem[]>([])
const selectedId = ref<string | null>(null)
const visibleCount = ref(INITIAL_VISIBLE_COUNT)

const visibleCandidates = computed(() =>
  props.isSidePanelLayout ? candidates.value : candidates.value.slice(0, visibleCount.value)
)
const canShowMore = computed(() =>
  !props.isSidePanelLayout && visibleCount.value < candidates.value.length
)
const errorMessage = computed(() => error.value)

function getTags() {
  return tagsInput.value
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0)
}

function isTagSelected(tag: string) {
  return tagsInput.value.trim() === tag
}

function toggleHintTag(tag: string) {
  tagsInput.value = tag
}

function pick(item: RandPicItem) {
  model.value = item.image.regular
  selectedId.value = item.id
}

function showMoreCandidates() {
  visibleCount.value = Math.min(candidates.value.length, visibleCount.value + VISIBLE_STEP)
}

async function fetchCandidates() {
  if (is로딩중.value) return
  reset()
  is로딩중.value = true
  try {
    const result = await getRandPics({
      tags: getTags(),
      count: Math.max(props.count ?? INITIAL_VISIBLE_COUNT, MAX_FETCH_COUNT),
      orientation: props.orientation
    })
    candidates.value = result.items
    visibleCount.value = Math.min(INITIAL_VISIBLE_COUNT, result.items.length)
    selectedId.value = result.items.find(item => item.image.regular === model.value)?.id ?? null
  } finally {
    is로딩중.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-2 min-h-0 overflow-hidden max-sm:max-h-[70dvh] sm:max-h-120">
    <div class="flex min-h-0 flex-1 flex-col">
      <div
        class="flex min-h-0 flex-1 flex-wrap content-start items-center justify-center gap-6 p-4 overflow-y-auto"
        :class="loading ? 'opacity-50' : ''"
      >
        <template
          v-for="item in results"
          :key="item.value"
        >
          <mIcon
            :name="item.value"
            class="flex aspect-square size-9 cursor-pointer items-center justify-center rounded-md border border-transparent transition-colors hover:border-primary hover:bg-primary"
            :class="item.value === selected ? 'border-primary bg-primary/10' : 'bg-inverted'"
            @click="() => selectIcon(item.value)"
          />
        </template>
      </div>

      <div
        v-if="selectedFullname"
        class="flex flex-row justify-end"
      >
        <mButton
          size="sm"
          icon="ph:copy-simple-light"
          @click="() => do복사()"
        >
          {{ selectedFullname }}
        </mButton>
      </div>

      <p
        v-if="!results.length"
        class="shrink-0 pt-1 text-center text-xs text-muted"
      >
        검색 결과가 없습니다.
      </p>
    </div>
    <mInput
      v-model="query"
      mode="debounce"
      placeholder="아이콘 검색 (영어)"
      :is-loading="loading"
      @search="do검색"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { searchIcons, toIconifyName, type IconSearchResult, defaultResults } from '~/utils/icons/searchIcons'

interface Props {
  autofocus?: boolean
}

withDefaults(defineProps<Props>(), {
  autofocus: false
})

const model = defineModel<string | null>({ required: false, default: null })

const emit = defineEmits<{
  select: [value: string]
}>()

const query = ref('')
const results = ref<IconSearchResult[]>(defaultResults(100))
const loading = ref(false)

let requestId = 0

const selected = computed(() => model.value?.trim() || '')
const selectedFullname = computed(() => selected.value ? toIconifyName(selected.value) : '')

const do검색 = async (q: string) => {
  const id = ++requestId
  loading.value = true

  try {
    const items = await searchIcons(q)
    if (id === requestId)
      results.value = items
  } finally {
    if (id === requestId)
      loading.value = false
  }
}

const do복사 = () => {
  useEasys().복사(selectedFullname.value)
}

const selectIcon = (value: string) => {
  model.value = value
  query.value = ''
  emit('select', value)
}
</script>

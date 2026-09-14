<template>
  <div class="flex w-full">
    <mSidebar no-header>
      <div class="m-0 flex flex-col gap-4 p-0.5">
        <control브리핑
          :selected-date="selectedDate"
          :view="currentView"
          :briefing="p.briefing"
        />
        <USeparator />
        <control날짜선택기
          v-model="selectedDate"
          :view="currentView"
        />
        <USeparator />
        <control일정필터 v-model:filters="filters" />
      </div>
    </mSidebar>
    <div class="grow flex h-full min-h-0 flex-col gap-3 rounded-xl border border-default/50 bg-default p-3">
      <div class="flex items-center justify-between gap-2 rounded-lg border border-default/60 bg-muted/30 p-1">
        <div>기준일(d-day용) / 대상일(구건)</div>
        <view날짜Display
          :selected-date="selectedDate"
          :view="currentView"
        />

        <div class="grow" />
        <mButton
          size="sm"
          @click="selectedDate = new Date()"
        >
          오늘
        </mButton>
        <div class="flex items-center gap-2">
          <mButton
            v-for="item in viewTabs"
            :key="item.value"
            size="sm"
            역할="조용"
            :켜짐="currentView === item.value"
            @click="currentView = item.value"
          >
            {{ item.label }}
          </mButton>
        </div>
      </div>

      <section class="min-h-0 flex-1">
        <view일 v-if="currentView === 'day'" />
        <view주 v-else-if="currentView === 'week'" />
        <view월 v-else-if="currentView === 'month'" />
        <view년
          v-else-if="currentView === 'year'"
          v-model="selectedDate"
        />
        <view생애
          v-else-if="currentView === 'life'"
          v-model="selectedDate"
          :base-year="p.lifeBaseYear"
        />
        <view생애2
          v-else
          :data="생애2차트데이터"
        />
      </section>
    </div>

    <mSidebar
      side="right"
      no-header
    >
      <view선택일
        :selected-date="selectedDate"
        :view="currentView"
        :life-base-year="p.lifeBaseYear"
        :points="filteredPoints"
      />
    </mSidebar>
  </div>
</template>

<script setup lang="ts">
import control브리핑 from './_controls/브리핑.vue'
import control일정필터 from './_controls/일정필터.vue'
import control날짜선택기 from './_controls/날짜선택기.vue'

import view날짜Display from './_view날짜Display.vue'
import view선택일 from './_view선택일.vue'
import view생애 from './_views/_view생애.vue'
import view생애2 from './_views/_view생애2.vue'
import view년 from './_views/_view년.vue'
import view월 from './_views/_view월.vue'
import view일 from './_views/_view일.vue'
import view주 from './_views/_view주.vue'
import { get생애2데이터셋, props, 생애2연령라벨, type ViewType, type 일정필터 } from './data/props'

const p = defineProps(props)

const viewTabs: { label: string, value: ViewType }[] = [
  { label: '일', value: 'day' },
  { label: '주', value: 'week' },
  { label: '월', value: 'month' },
  { label: '년', value: 'year' },
  { label: '생', value: 'life' },
  { label: '생2', value: 'life2' }
]

const currentView = ref<ViewType>('life')
const selectedDate = ref(new Date(p.date))
const filters = ref<일정필터[]>(p.filters.map(item => ({ ...item })))

watch(
  () => p.filters,
  (nextFilters) => {
    filters.value = nextFilters.map(item => ({ ...item }))
  },
  { deep: true }
)

const filteredPoints = computed(() =>
  p.points.filter((group, index) => {
    const defaultId = `시점-${index}`
    const matchedFilter = filters.value.find((item, filterIndex) =>
      item.id === defaultId || item.label === group.label || filterIndex === index)
    return matchedFilter?.visible ?? true
  }))

const 생애2차트데이터 = computed(() => ({
  labels: 생애2연령라벨,
  datasets: get생애2데이터셋(p.lifeBaseYear)
}))
</script>

<style scoped></style>

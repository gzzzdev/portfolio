<template>
  <div class=" flex flex-col gap-2 ">
    <p class="text-sm font-semibold text-default">
      남은 기간 ({{ currentViewLabel }})
    </p>
    <div class="flex w-full items-center justify-center rounded-lg border border-default/50 bg-muted/20 py-3">
      <mChart미니
        type="pie"
        :data="remainingPercent"
        :size="92"
        :reverse="true"
        class="text-primary font-light"
      />
    </div>
    <ul class="space-y-1">
      <li
        v-for="item in remainItems"
        :key="item.key"
        class="flex items-center justify-between text-sm"
      >
        <span class="text-muted">{{ item.label }}</span>
        <span class="font-semibold text-highlighted">{{ item.value }}{{ item.suffix }}</span>
      </li>
    </ul>
    <USeparator />
    <div class="flex items-center justify-between gap-2">
      <p class="text-sm font-semibold text-default">
        시점 필터
      </p>
      <UButtonGroup size="xs">
        <mButton
          v-for="filter in pointFilterOptions"
          :key="filter.value"
          :label="filter.label"
          역할="조용"
          :켜짐="selectedPointFilter === filter.value"
          @click="selectedPointFilter = filter.value"
        />
      </UButtonGroup>
    </div>
    <ul class="space-y-1">
      <li
        v-for="point in filteredUpcomingPoints"
        :key="point.key"
        class="flex items-center justify-between gap-2 text-sm"
      >
        <span class="line-clamp-1 flex items-center gap-1.5 text-muted">
          <span
            class="size-2 shrink-0 rounded-full"
            :style="getPointDotStyle(point.color)"
          />
          <span class="line-clamp-1">{{ point.label }}</span>
        </span>
        <span class="shrink-0 font-semibold text-highlighted">
          <view디데이
            :base-date="props.selectedDate"
            :start-date="point.startDate"
            :target-date="point.targetDate"
            :color-style="getPointChartStyle(point.color)"
          />
        </span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import type { ViewType } from './props'
import type { i시점, i시점묶음 } from './data/data시점ss'
import { get시점sByDate, 시점s } from './data/data시점ss'
import { mDayjs } from '~utils'
import mChart미니 from '~/components/m/Chart/미니.vue'
import view디데이 from './_view디데이.vue'

type PointFilterType = 'all' | 'selected' | 'after'

const props = defineProps<{
  selectedDate: Date
  view: ViewType
  lifeBaseYear?: number
  points?: i시점묶음[]
}>()

const getPointDotStyle = (color?: string) => ({ backgroundColor: color ?? 'var(--ui-primary)' })
const getPointChartStyle = (color?: string) => ({ color: color ?? 'var(--ui-primary)' })

const pointFilterOptions: { label: string, value: PointFilterType }[] = [
  { label: '전체', value: 'all' },
  { label: '선택', value: 'selected' },
  { label: '이후', value: 'after' }
]
const selectedPointFilter = ref<PointFilterType>('selected')

const viewLabelMap: Record<ViewType, string> = {
  day: '일간',
  week: '주간',
  month: '월간',
  year: '연간',
  life: '생애'
}

const remainLabelMap: Record<ViewType, string> = {
  day: '오늘까지',
  week: '이번 주까지',
  month: '이번 달까지',
  year: '올해까지',
  life: '100세까지'
}

const safeDate = (year: number, month: number, day: number) => {
  const base = mDayjs(new Date(year, month, 1))
  const lastDayOfMonth = base.daysInMonth()
  return base.date(Math.min(day, lastDayOfMonth))
}

const daysUntil = (from: ReturnType<typeof mDayjs>, to: ReturnType<typeof mDayjs>) =>
  Math.max(0, to.startOf('day').diff(from.startOf('day'), 'day'))

const formatBundledDays = (days: number) => {
  if (days < 365) return `${days}`
  const years = Math.floor(days / 365)
  const remainDays = days % 365
  return `${years}년 ${remainDays}일`
}

const lifeBirthDate = computed(() =>
  safeDate(
    props.lifeBaseYear ?? props.selectedDate.getFullYear(),
    props.selectedDate.getMonth(),
    props.selectedDate.getDate()
  ))

const endOfLife = (date: ReturnType<typeof mDayjs>) => date.startOf('day').add(100, 'year')

const currentViewLabel = computed(() => viewLabelMap[props.view])

const periodRange = computed(() => {
  const base = mDayjs(props.selectedDate)
  const lifeStart = lifeBirthDate.value.startOf('day')
  const lifeEnd = endOfLife(lifeStart)
  const startDateByView: Record<ViewType, ReturnType<typeof mDayjs>> = {
    day: base,
    week: base.startOf('week'),
    month: base.startOf('month'),
    year: base.startOf('year'),
    life: lifeStart
  }
  const endDateByView: Record<ViewType, ReturnType<typeof mDayjs>> = {
    day: base,
    week: base.endOf('week'),
    month: base.endOf('month'),
    year: base.endOf('year'),
    life: lifeEnd
  }

  const start = startDateByView[props.view]
  const end = endDateByView[props.view]
  const remaining = daysUntil(base, end)
  const total = daysUntil(start, end) + 1
  const elapsed = Math.max(0, total - remaining)

  return { elapsed, remaining }
})

const chartData = computed(() => [periodRange.value.elapsed, periodRange.value.remaining])
const remainingPercent = computed(() => {
  const total = chartData.value[0] + chartData.value[1]
  if (total <= 0) return 0
  return Math.round((chartData.value[1] / total) * 100)
})

const remainItems = computed(() => {
  return [
    {
      key: `${props.view}-elapsed`,
      label: '경과',
      value: formatBundledDays(periodRange.value.elapsed),
      suffix: periodRange.value.elapsed < 365 ? '일 경과' : ' 경과'
    },
    {
      key: `${props.view}-remain`,
      label: remainLabelMap[props.view],
      value: formatBundledDays(periodRange.value.remaining),
      suffix: periodRange.value.remaining < 365 ? '일 남음' : ' 남음'
    }
  ]
})

const upcomingPoints = computed(() => {
  const pointList: i시점[] = props.points
    ? props.points.flatMap(group => group.list.map(point => ({ ...point, color: point.color ?? group.color })))
    : 시점s
  const resolvedPoints = get시점sByDate(pointList)

  return resolvedPoints
    .map((item, idx) => {
      const endDate = mDayjs(item.endDate).startOf('day')
      const startDate = item.startDate
        ? mDayjs(item.startDate).startOf('day')
        : endDate
      return {
        key: `point-${idx}`,
        label: item.label,
        startDate: startDate.toDate(),
        endDate: endDate.toDate(),
        targetDate: endDate.toDate(),
        color: item.color
      }
    })
})

const filteredUpcomingPoints = computed(() => {
  const selectedDate = mDayjs(props.selectedDate).startOf('day')
  if (selectedPointFilter.value === 'all') return upcomingPoints.value

  if (selectedPointFilter.value === 'after') {
    return upcomingPoints.value.filter((item) => {
      const startDate = mDayjs(item.startDate).startOf('day')
      const endDate = mDayjs(item.endDate).startOf('day')
      return startDate.isAfter(selectedDate) || endDate.isAfter(selectedDate)
    })
  }

  return upcomingPoints.value.filter((item) => {
    const startDate = mDayjs(item.startDate).startOf('day')
    const endDate = mDayjs(item.endDate).startOf('day')
    return selectedDate.isSame(startDate) || selectedDate.isSame(endDate)
      || (selectedDate.isAfter(startDate) && selectedDate.isBefore(endDate))
  })
})
</script>

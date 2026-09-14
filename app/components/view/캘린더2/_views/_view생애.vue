<template>
  <div class="h-full min-h-0 overflow-auto rounded-lg border border-default/50 bg-default/40 p-3">
    <div class="grid grid-cols-[repeat(auto-fit,minmax(9.5rem,1fr))] gap-3 xl:grid-cols-5">
      <section
        v-for="group in decadeGroups"
        :key="group.label"
        class="rounded-lg border border-default/60 bg-muted/20 p-3"
      >
        <header class="mb-2 flex items-center justify-between gap-2">
          <p class="text-sm font-semibold text-default">
            {{ group.startYear }} - {{ group.endYear }}
          </p>
          <p class="text-xs text-muted">
            {{ group.label }}
          </p>
        </header>

        <div class="flex flex-col gap-1.5">
          <button
            v-for="year in group.years"
            :key="year"
            type="button"
            class="flex items-center justify-between gap-2 rounded-md border px-2 py-1 transition"
            :class="[
              selectedYear === year
                ? 'border-primary bg-primary text-inverted'
                : 'border-default/60 bg-default hover:border-primary/50 hover:bg-primary/10',
              year < currentYear && selectedYear !== year ? 'opacity-45' : ''
            ]"
            @click="selectYear(year)"
          >
            <span class="text-sm font-medium">
              {{ year }}
            </span>
            <span
              class="text-xs font-normal"
              :class="selectedYear === year ? 'text-inverted/80' : 'text-muted'"
            >
              {{ year - props.baseYear }}세
            </span>
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
type DecadeGroup = {
  label: string
  startYear: number
  endYear: number
  years: number[]
}

const props = withDefaults(defineProps<{
  baseYear?: number
}>(), {
  baseYear: 2001
})

const selectedDate = defineModel<Date>({ default: () => new Date() })

const toDateOnly = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())

const safeDate = (year: number, month: number, day: number) => {
  const lastDayOfMonth = new Date(year, month + 1, 0).getDate()
  const clampedDay = Math.min(day, lastDayOfMonth)
  return new Date(year, month, clampedDay)
}

const selectedYear = computed(() => selectedDate.value.getFullYear())
const currentYear = new Date().getFullYear()

const decadeGroups = computed<DecadeGroup[]>(() =>
  Array.from({ length: 10 }, (_, idx) => {
    const decadeStartAge = idx * 10
    const startYear = props.baseYear + decadeStartAge
    const endYear = startYear + 9

    return {
      label: `~${decadeStartAge + 10}세`,
      startYear,
      endYear,
      years: Array.from({ length: 10 }, (_, offset) => startYear + offset)
    }
  }))

const allYears = computed(() => decadeGroups.value.flatMap(group => group.years))

const alignSelectedYear = () => {
  if (allYears.value.length === 0 || allYears.value.includes(selectedYear.value)) return
  const minYear = allYears.value[0]
  const maxYear = allYears.value[allYears.value.length - 1]
  const nextYear = Math.min(maxYear, Math.max(minYear, selectedYear.value))
  const month = selectedDate.value.getMonth()
  const day = selectedDate.value.getDate()
  selectedDate.value = toDateOnly(safeDate(nextYear, month, day))
}

const selectYear = (year: number) => {
  const month = selectedDate.value.getMonth()
  const day = selectedDate.value.getDate()
  selectedDate.value = toDateOnly(safeDate(year, month, day))
}

watch(() => props.baseYear, alignSelectedYear, { immediate: true })
watch(() => selectedDate.value.getFullYear(), alignSelectedYear)
</script>

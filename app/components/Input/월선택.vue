<template>
  <div :class="_class">
    <UInput
      v-if="readonly"
      :model-value="displayStr"
      readonly
      :ui="pickerInputUi"
    >
      <template #leading2>
        <UIcon
          name="i-lucide-calendar"
          class="pointer-events-none size-5 shrink-0 text-dimmed"
        />
      </template>
    </UInput>
    <UPopover
      v-else
      :ui="{ content: 'z-40' }"
    >
      <UInput
        :model-value="displayStr"
        readonly
        class="cursor-pointer"
        :ui="pickerInputUi"
      >
        <template #leading2>
          <UIcon
            name="i-lucide-calendar"
            class="pointer-events-none size-5 shrink-0 text-dimmed"
          />
        </template>
      </UInput>
      <template #content>
        <MonthPicker.Root
          v-model="calendarMonth"
          locale="ko-KR"
          class="min-w-[280px] p-2"
        >
          <template #default="{ grid }">
            <MonthPicker.Header class="flex items-center justify-between gap-1 pb-2">
              <MonthPicker.Prev as-child>
                <mButton
                  icon="i-lucide-chevrons-left"
                  역할="조용"
                  size="sm"
                />
              </MonthPicker.Prev>
              <MonthPicker.Heading class="grow text-center text-sm font-medium text-highlighted" />
              <MonthPicker.Next as-child>
                <mButton
                  icon="i-lucide-chevrons-right"
                  역할="조용"
                  size="sm"
                />
              </MonthPicker.Next>
            </MonthPicker.Header>
            <MonthPicker.Grid class="w-full">
              <MonthPicker.GridBody>
                <MonthPicker.GridRow
                  v-for="(months, rowIdx) in grid.rows"
                  :key="rowIdx"
                >
                  <MonthPicker.Cell
                    v-for="month in months"
                    :key="month.toString()"
                    :date="month"
                    class="p-0.5"
                  >
                    <MonthPicker.CellTrigger
                      :month="month"
                      class="flex size-10 items-center justify-center rounded-md text-sm hover:bg-elevated data-disabled:pointer-events-none data-disabled:opacity-40 data-selected:bg-primary data-selected:text-inverted"
                    />
                  </MonthPicker.Cell>
                </MonthPicker.GridRow>
              </MonthPicker.GridBody>
            </MonthPicker.Grid>
          </template>
        </MonthPicker.Root>
      </template>
    </UPopover>
  </div>
</template>

<script setup lang="ts">
import { CalendarDate } from '@internationalized/date'
import type { DateValue } from '@internationalized/date'
import { MonthPicker } from 'reka-ui/namespaced'
import { computed } from 'vue'
import { mDayjs } from '~utils'
import { _class, _ui } from './_'

const pickerInputUi = {
  ..._ui,
  base: String(_ui.base).replace(/\bz-51\b/g, '').replace(/\s+/g, ' ').trim(),
  leading: 'z-[1]'
}

interface Props {
  readonly?: boolean
}
withDefaults(defineProps<Props>(), {
  readonly: false
})

const _model = defineModel<ReturnType<typeof mDayjs> | null>({ required: false, default: null })

const displayStr = computed(() => {
  const v = _model.value
  if (!v) return ''
  return v.format('YYYY년 M월')
})

const calendarMonth = computed({
  get(): CalendarDate | undefined {
    const v = _model.value
    if (!v) return undefined
    return new CalendarDate(v.year(), v.month() + 1, 1)
  },
  set(v: DateValue | undefined) {
    if (v == null) {
      _model.value = null
      return
    }
    _model.value = mDayjs(v.toDate()).startOf('month')
  }
})
</script>

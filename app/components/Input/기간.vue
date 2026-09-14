<template>
  <div
    :class="_class"
    class="max-w-64"
  >
    <!-- 원인은 모르나 UInputDate의 target.value가 null인 경우가 있고 예외처리 해줘야함.  -->
    <UInputDate
      class="w-full"
      range
      :model-value="기간"
      :readonly="readonly"
      :ui="_ui"

      @update:model-value="(e) => (e.target?.value != null) && (기간 = e.target?.value)"
    >
      <template #trailing>
        <UPopover
          v-if="!readonly"
          :ui="_ui"
        >
          <UIcon name="i-lucide-calendar" />

          <template #content>
            <UCalendar
              v-model="기간"
              range
              class="p-2"
            />
          </template>
        </UPopover>
      </template>
    </UInputDate>
  </div>
</template>

<script setup lang="ts">
import type { CalendarDate } from '@internationalized/date'
import { mDayjs, mTime } from '~utils'
import { computed } from 'vue'
import { toCalendarDate } from './index'

import { _ui, _class } from './_'

interface Props {
  readonly?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  readonly: false
})

const _model = defineModel<[typeof mDayjs, typeof mDayjs | null] | null>({ required: false, default: () => [mDayjs().startOf('month'), mDayjs().endOf('month')] })

const 기간 = computed({
  get: () => {
    const cur = _model.value
    const start = cur?.[0] ?? mDayjs().startOf('month')
    const end = cur?.[1]
    return { start: toCalendarDate(start), end: end ? toCalendarDate(end) : undefined }
  },
  set: (v: { start: CalendarDate, end?: CalendarDate }) => {
    const prevStart = _시작일.value
    const prevEnd = _종료일.value
    const nextStart = mDayjs(v.start?.toDate())
      .set('hour', prevStart?.hour() ?? 0)
      .set('minute', prevStart?.minute() ?? 0)
      .set('second', 0)
    const nextEnd = v.end
      ? mDayjs(v.end?.toDate())
          .set('hour', prevEnd?.hour() ?? 0)
          .set('minute', prevEnd?.minute() ?? 0)
          .set('second', 0)
      : null

    _model.value = [nextStart, nextEnd]
  }
})

const _시작일 = computed(() => _model.value?.[0])
const _종료일 = computed(() => _model.value?.[1])
</script>

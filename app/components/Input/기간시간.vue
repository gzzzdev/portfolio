<template>
  <div
    :class="_class"
    class="max-w-64"
  >
    <UInputDate
      v-model="기간"
      class="w-full"
      range
      :readonly="readonly"
      :ui="_ui"
    >
      <template #trailing>
        <UPopover
          v-if="!readonly"
          :ui="{ content: 'z-40' }"
        >
          <UIcon name="i-lucide-calendar" />

          <template #content>
            <div class="flex flex-row w-100 justify-between">
              <UCalendar
                v-model="기간"
                range
                class="p-2"
              />
              <div
                v-if="!false"
                class="flex flex-col justify-center pr-1"
              >
                <div class="flex flex-col gap-1">
                  <div class="text-center text-lg text-muted mb-3">
                    시작
                  </div>
                  <div class="pl-3">
                    {{ _시작일?.format('YYYY-MM-DD') }}
                  </div>
                  <div class="flex flex-row gap-1 items-center">
                    <Input시간
                      v-model="time시작"
                      @update:model-value="setTime시작"
                    />
                  </div>
                </div>
                <USeparator class="my-5" />

                <div class="flex flex-col gap-1">
                  <div class="text-center text-lg text-muted mb-3">
                    종료
                  </div>
                  <div class="pl-3">
                    {{ _종료일?.format('YYYY-MM-DD') }}
                  </div>
                  <div class="flex flex-row gap-1 items-center">
                    <Input시간
                      v-model="time종료"
                      @update:model-value="setTime종료"
                    />
                  </div>
                </div>
              </div>
            </div>
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
const _model = defineModel<[typeof mDayjs, typeof mDayjs] | null>({ required: false, default: () => [mDayjs().startOf('month'), mDayjs().endOf('month')] })

const 기간 = computed({
  get: (): typeof CalendarDate => {
    const cur = _model.value
    const start = cur?.[0] ?? mDayjs().startOf('month')
    const end = cur?.[1] ?? mDayjs().endOf('month')
    return { start: toCalendarDate(start), end: toCalendarDate(end) }
  },
  set: (v: { start: CalendarDate, end: CalendarDate }) => {
    const a = mDayjs(v.start?.toDate()).set('hour', _시작일.value?.hour() ?? 0).set('minute', _시작일.value?.minute() ?? 0).set('second', 0)
    const b = mDayjs(v.end?.toDate()).set('hour', _종료일.value?.hour() ?? 0).set('minute', _종료일.value?.minute() ?? 0).set('second', 0) ?? a
    _model.value = [a, b]
  }
})

const time시작 = computed(() => new mTime(_시작일.value?.hour() ?? 0, _시작일.value?.minute() ?? 0))
const setTime시작 = (v: mTime) => {
  const cur = _model.value
  const base0 = cur?.[0] ?? mDayjs().startOf('month')
  const base1 = cur?.[1] ?? mDayjs().endOf('month')
  const a = base0.set('hour', v.hour).set('minute', v.minute).set('second', 0)
  _model.value = [a, base1]
}

const time종료 = computed(() => new mTime(_종료일.value?.hour() ?? 0, _종료일.value?.minute() ?? 0))
const setTime종료 = (v: mTime) => {
  const cur = _model.value
  const base0 = cur?.[0] ?? mDayjs().startOf('month')
  const base1 = cur?.[1] ?? mDayjs().endOf('month')
  const b = base1.set('hour', v.hour).set('minute', v.minute).set('second', 0)
  _model.value = [base0, b]
}

const _시작일 = computed(() => _model.value?.[0])
const _종료일 = computed(() => _model.value?.[1])
</script>

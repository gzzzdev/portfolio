<template>
  <div class="w-full  overflow-x-hidden">
    <UInputDate
      v-model="model2"
      :ui="dateUi"
      :class="{ 'cursor-pointer': !readonly }"
      :readonly="readonly"
    >
      <template
        v-if="!readonly"
        #trailing
      >
        <UPopover :ui="{ content: 'z-40' }">
          <UIcon name="i-lucide-calendar" />

          <template #content>
            <UCalendar
              v-model="model2"
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
import { mDayjs } from '~utils'
import { computed } from 'vue'
import { toCalendarDate } from './index'
import { ui읽기 } from './_'

interface Props {
  readonly?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  readonly: false
})

/**
 * 읽기모드에선 날짜 칸(연/월/일)을 붙인다. 입력용 간격 그대로 두면 상자가 사라진 뒤
 * `2005 . 7 . 9 .` 처럼 흩어져 보인다 — 고를 게 없으니 칸도 없어야 한다.
 */
const dateUi = computed(() =>
  props.readonly
    ? {
        ...ui읽기(true),
        // 칸 고정폭(w-9/w-11)은 입력 중 자릿수가 바뀌어도 안 흔들리라고 있는 것이다.
        // 읽기모드엔 입력이 없으니 글자폭으로 붙인다.
        segment: 'px-0 data-[segment=day]:w-auto data-[segment=month]:w-auto data-[segment=year]:w-auto data-[segment=literal]:pe-1'
      }
    : ui읽기(false)
)

const _model = defineModel<ReturnType<typeof mDayjs> | null>({ required: false, default: null })

const model2 = computed({
  get: (): CalendarDate | undefined => {
    return _model.value ? toCalendarDate(_model.value) : undefined
  },
  set: (v: CalendarDate | undefined) => {
    if (v == null) {
      _model.value = null
      return
    }
    _model.value = mDayjs(v.toDate())
  }
})
</script>

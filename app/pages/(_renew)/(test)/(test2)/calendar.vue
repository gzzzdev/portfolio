<template>
  <div
    class="h-full w-full px-1 sm:px-3"
  >
    <view캘린더
      v-if="is준비"
      v-model:events="events"
      :legend="legend"
      class="mx-auto h-full w-full max-w-(--ui-container)"
    />
  </div>
</template>

<script setup lang="ts">
import { do첫조회 } from '~/composables/do첫조회'

import { model달력s } from '~models/test2'

definePageMeta({ layout: 'layout-v2' })

/** 달력 항목·범례는 `model달력s` 하나에서 온다. 어느 표를 읽을지도 그쪽이 안다. */
const 달력s = model달력s.getInstance()
const events = computed(() => toValue(달력s.list))
const legend = computed(() => toValue(달력s.범례))

/** 참/거짓이 저장소에서 나온다 — 그래야 SSR 이 받아온 달력이 하이드레이션에서 안 지워진다. */
const is준비 = computed(() => toValue(달력s.is읽기완료))

await do첫조회('calendar', () => 달력s.reads())
</script>

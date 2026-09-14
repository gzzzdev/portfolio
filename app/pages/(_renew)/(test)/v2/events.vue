<template>
  <div class="h-full w-full flex flex-row justify-center">
    <view목록5
      v-model:selected="selected"
      :repository="XXs"
      :can수정="true"
      :is수정중="!false"
    />
  </div>
</template>

<script setup lang="ts">
import { do첫조회 } from '~/composables/do첫조회'

import { ref } from 'vue'

import type {
  model일정 as modelXX } from '~models/test2'
import {
  model일정s as modelXXs,
  model메뉴s,
  model태그s,
  model태그관계s
} from '~models/test2'

definePageMeta({ layout: 'layout-v2' })

const XXs = modelXXs.getInstance()
const selected = ref<modelXX | null>(null)

await do첫조회('events', () => Promise.all([
  XXs.reads(),
  model태그s.getInstance().reads(),
  model태그관계s.getInstance().reads(),
  model메뉴s.getInstance().reads()
]))
</script>

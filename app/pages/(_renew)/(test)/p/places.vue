<template>
  <div class="h-full w-full flex flex-row justify-center">
    <view목록5
      v-model:selected="selected"
      :repository="XXs"
      :can수정="true"
      :is수정중="true"
    />
  </div>
</template>

<script setup lang="ts">
import { do첫조회 } from '~/composables/do첫조회'

import { ref } from 'vue'
import type { model장소 as modelXX } from '~models/persona'
import { model장소s as modelXXs, model배경s } from '~models/persona'

definePageMeta({ layout: 'layout-p' })

const XXs = modelXXs.getInstance()
const selected = ref<modelXX | null>(null)

await do첫조회('places', () => Promise.all([
  XXs.reads(),
  // `배경` 칸의 선택지가 읽는다.
  model배경s.getInstance().reads()
]))
</script>

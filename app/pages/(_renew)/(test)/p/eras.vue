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
import type { model배경 as modelXX } from '~models/persona'
import { model배경s as modelXXs, model장소s } from '~models/persona'

definePageMeta({ layout: 'layout-p' })

const XXs = modelXXs.getInstance()
const selected = ref<modelXX | null>(null)

await do첫조회('eras', () => Promise.all([
  XXs.reads(),
  // `장소` 칸(이 시대에 딸린 장소들)이 읽는다.
  model장소s.getInstance().reads()
]))
</script>

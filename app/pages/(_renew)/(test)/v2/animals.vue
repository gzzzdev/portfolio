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
import type { model동물 as modelXX } from '~models/v2'
import { model동물s as modelXXs, model기록s } from '~models/v2'

definePageMeta({ layout: 'layout-v2' })

const XXs = modelXXs.getInstance()
const selected = ref<modelXX | null>(null)

await do첫조회('animals', () => Promise.all([
  XXs.reads(),
  // 행마다 자기 기록을 읽으려면 기록 표도 한 번 실려 있어야 한다.
  model기록s.getInstance().reads()
]))
</script>

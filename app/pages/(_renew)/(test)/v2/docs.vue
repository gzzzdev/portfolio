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
import type { model문서 as modelXX } from '~models/v2'
import { model문서s as modelXXs } from '~models/v2'

definePageMeta({ layout: 'layout-v2' })

const XXs = modelXXs.getInstance()
const selected = ref<modelXX | null>(null)

await do첫조회('docs', () => Promise.all([
  // 견본 판과 같은 이유로 `model기록s`를 안 읽는다 — 이 표는 기록 축이 없다.
  XXs.reads()
]))
</script>

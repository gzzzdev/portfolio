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
import type { model기록 as modelXX } from '~models/v2'
import { model기록s as modelXXs } from '~models/v2'

definePageMeta({ layout: 'layout-v2' })

const XXs = modelXXs.getInstance()
const selected = ref<modelXX | null>(null)

await do첫조회('records', () => Promise.all([
  XXs.reads()
]))
</script>

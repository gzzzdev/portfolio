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
import type { model캐릭터 as modelXX } from '~models/persona'
import { model캐릭터s as modelXXs } from '~models/persona'

definePageMeta({ layout: 'layout-p' })

const XXs = modelXXs.getInstance()
const selected = ref<modelXX | null>(null)

await do첫조회('characters', () => Promise.all([
  // 메뉴는 이제 안 읽는다 — v2에는 model메뉴 행이 없고, 헤더가 읽는 최소 메뉴는 저장소가 직접 준다.
  XXs.reads()
]))
</script>

<template>
  <div class="h-[calc(100dvh-var(--ui-layout-header-offset,var(--ui-header-height,4rem)))] w-full flex flex-row justify-center py-2">
    <viewAlert v-if="!is관리자" />
    <template v-else>
      <view목록5
        v-model:selected="selected"
        v-model:is수정중="is수정중"
        :repository="XXs"
        :can수정="is관리자"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ 꽉찬폭: true })

import { do첫조회 } from '~/composables/do첫조회'

import { storeToRefs } from 'pinia'

import { useMyAuthStore } from '~/stores/useMyAuthStore'

import { ref } from 'vue'
import type { model메뉴 as modelXX } from '~models/test2'
import { model메뉴s as modelXXs, model역할s } from '~models/test2'
import { model회원s } from '~models/test2'// 게시판용..
// import { model회원게시글s, model회원댓글s } from '~models/test2';//게시판용..

const XXs = modelXXs.getInstance()
const selected = ref<modelXX | null>(null)

const { is관리자, is수정중 } = storeToRefs(useMyAuthStore())

await do첫조회('menus', () => Promise.all([
  XXs.reads(),
  model역할s.getInstance().reads(),

  model회원s.getInstance().reads()

  // model회원게시글s.getInstance().reads(),
  // model회원댓글s.getInstance().reads(),

]), is관리자)
</script>

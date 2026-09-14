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
import type {
  model게시판 as modelXX } from '~models/test2'
import {
  model게시판s as modelXXs,
  model메뉴s,
  model회원s,
  model회원게시글s
} from '~models/test2'

const XXs = modelXXs.getInstance()
const selected = ref<modelXX | null>(null)

const { is관리자, is수정중 } = storeToRefs(useMyAuthStore())

await do첫조회('index', () => Promise.all([
  XXs.reads(),
  // 목록5 헤더(`repo.메뉴`)·글 목록·작성자 선택에 필요
  model메뉴s.getInstance().reads(),
  model회원게시글s.getInstance().reads(),
  model회원s.getInstance().reads()
]), is관리자)
</script>

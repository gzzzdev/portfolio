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
  model등급 as modelXX } from '~models/test2'
import { model메뉴s,
  model등급s as modelXXs,
  model등급요건s,
  model등급별심사s,
  model회원의등급심사s,
  model회원s,
  model역할s,
  model회원관계이력s,
  model회원상태이력s } from '~models/test2'

const XXs = modelXXs.getInstance()
const selected = ref<modelXX | null>(null)

const { is관리자, is수정중 } = storeToRefs(useMyAuthStore())

await do첫조회('grades', () => Promise.all([
  XXs.reads(),
  model메뉴s.getInstance().reads(),

  model등급요건s.getInstance().reads(),
  model회원s.getInstance().reads(),
  model역할s.getInstance().reads(), // +회원짝꿍
  model회원관계이력s.getInstance().reads(),
  model회원상태이력s.getInstance().reads(),
  model등급별심사s.getInstance().reads(),
  model회원의등급심사s.getInstance().reads()
]), is관리자)
</script>

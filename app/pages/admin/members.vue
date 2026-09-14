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

import type { model회원 as modelXX } from '~models/test2'
import { model회원s as modelXXs, model메뉴s,
  model회원이력s
  // model회원관계이력s,
  // model회원상태이력s,
  // model위치s,
  // model직업s
} from '~models/test2'

const XXs = modelXXs.getInstance()
const selected = ref<modelXX | null>(null)

const { is관리자, is수정중 } = storeToRefs(useMyAuthStore())

/**
 * 이 화면의 본문은 회원 목록이다 — 그래서 **SSR 이 기다린다**(`do첫조회`).
 * 안 기다리면 서버 HTML 이 「0명 + 뼈대」로 찍혀 나간다.
 */
await do첫조회('members', () => Promise.all([
  XXs.reads(),
  //
  model메뉴s.getInstance().reads(),
  // model신청가능s.getInstance().reads(),
  // model회원신청s.getInstance().reads(),
  //
  // model행사s.getInstance().reads(),

  // model회원댓글s.getInstance().reads(),
  // model회원게시글s.getInstance().reads(),

  // model설문s.getInstance().reads(),
  // model퀴즈s.getInstance().reads(),
  // model학기s.getInstance().reads(),
  // model결제s.getInstance().reads(),
  // model회원회비s.getInstance().reads(),

  //
  model회원이력s.getInstance().reads()
  // model회원관계이력s.getInstance().reads(),
  // model회원상태이력s.getInstance().reads(),
  // model직업s.getInstance().reads(),
  // model위치s.getInstance().reads(),

]), is관리자)
</script>

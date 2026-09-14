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
  model역할 as modelXX } from '~models/test2'
import {
  model역할s as modelXXs,
  model회원s,
  model회원관계이력s,
  model회원상태이력s
} from '~models/test2'
import { model테이블s } from '~models/(system)'

const XXs = modelXXs.getInstance()
const selected = ref<modelXX | null>(null)

const { is관리자, is수정중 } = storeToRefs(useMyAuthStore())

await do첫조회('roles', () => Promise.all([
  XXs.reads(),
  model회원s.getInstance().reads(),
  model회원관계이력s.getInstance().reads(),
  model회원상태이력s.getInstance().reads(),
  /**
   * 「테이블 권한」 선택지의 정본. 안 읽으면 `do권한key옵션s()`가 손으로 적은
   * 대비책 목록으로 떨어진다 — 화면은 돌지만 어휘가 DB와 어긋난 채로 돈다.
   * 표가 아직 없으면(= `_CUSTOM/sql/tables.sql` 미실행) 조회가 실패하는데,
   * 그때도 대비책이 받으므로 편집기는 그대로 뜬다.
   */
  model테이블s.getInstance().reads().catch(() => false)
]), is관리자)
</script>

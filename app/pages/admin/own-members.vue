<template>
  <div
    class="h-[calc(100dvh-var(--ui-layout-header-offset,var(--ui-header-height,4rem)))] w-full flex flex-row justify-center py-2"
  >
    <viewAlert v-if="!is담당자" />
    <view목록5
      v-else
      v-model:selected="selected"
      v-model:is수정중="is수정중"
      :repository="XXs"
      :범위="is내담당"
      :can추가="false"
      :can삭제="false"
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ 꽉찬폭: true })

import { do첫조회 } from '~/composables/do첫조회'

import { storeToRefs } from 'pinia'

import { useMyAuthStore } from '~/stores/useMyAuthStore'

import { ref } from 'vue'

import type { model회원 as modelXX } from '~models/test2'
import { model회원s as modelXXs, model메뉴s, model회원이력s, do신청세트읽기 } from '~models/test2'

/**
 * 담당자가 맡은 회원들(`members.managerId`). 회원 추가·삭제는 운영자 몫이라 막고, 상세에서
 * 상태·등급·신청을 처리한다. 무엇을 고칠 수 있는지는 역할 권한(`/admin/roles`)이 정한다.
 */
const XXs = modelXXs.getInstance()
const selected = ref<modelXX | null>(null)

const { is담당자, is수정중, 회원Id } = storeToRefs(useMyAuthStore())

const is내담당 = (회원: modelXX) => !!회원Id.value && 회원.담당자id === 회원Id.value

/** 본문이 회원 목록이다 — SSR 이 기다린다(`do첫조회`). `onBeforeMount` 는 클라 전용이라 서버가 빈 목록을 찍어 보냈다. */
await do첫조회('own-members', () => Promise.all([
  XXs.reads(),
  model메뉴s.getInstance().reads(),
  model회원이력s.getInstance().reads(),
  // 상세의 「신청」 탭이 조인한다(콘텐츠·회차·결제).
  do신청세트읽기()
]), is담당자)
</script>

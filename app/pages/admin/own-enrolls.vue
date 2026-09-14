<template>
  <div class="h-[calc(100dvh-var(--ui-layout-header-offset,var(--ui-header-height,4rem)))] w-full flex flex-row justify-center py-2">
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

import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useMyAuthStore } from '~/stores/useMyAuthStore'
/**
 * 담당자가 맡은 회원들의 신청. 운영자 `/admin/enrolls` 와 같은 표·같은 목록이고, 범위만 「내 담당 회원」이다.
 * 대기 칩으로 걸러 상태를 바꾸는 게 승인·반려다.
 */
import type { model신청 as modelXX } from '~models/test2'
import { model신청s as modelXXs, do신청세트읽기 } from '~models/test2'

const XXs = modelXXs.getInstance()
const selected = ref<modelXX | null>(null)

const { is담당자, is수정중, 회원Id } = storeToRefs(useMyAuthStore())

const is내담당 = (신청: modelXX) => !!회원Id.value && 신청.회원?.담당자id === 회원Id.value

// 조인이 클라에서 일어나므로 화면이 쓰는 목록을 한 번에 받아 둔다(`do신청세트읽기`).
watch(is담당자, v => v && do신청세트읽기(), { immediate: true })
</script>

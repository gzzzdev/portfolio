<template>
  <div class="h-[calc(100dvh-var(--ui-layout-header-offset,var(--ui-header-height,4rem)))] w-full flex flex-row justify-center py-2">
    <view목록5
      v-model:selected="selected"
      v-model:is수정중="is수정중"
      :repository="XXs"
      :can수정="is관리자"
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ 꽉찬폭: true })

import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useMyAuthStore } from '~/stores/useMyAuthStore'
/**
 * 신청(enrolls) 표의 운영자 목록. 표 이름 그대로 `/admin/enrolls` 에 서고, 회원이 신청하는 문은
 * `/official/enrolls` 에 선다 — 표는 하나, 문은 둘(`model메뉴.seed` 의 `enrolls`·`do-enrolls`).
 * 회차(enrollables) 목록은 따로 없다 — 운영자에게 신청받기는 콘텐츠 상세 안 「신청받기」 구역이다.
 */
import type { model신청 as modelXX } from '~models/test2'
import { model신청s as modelXXs, do신청세트읽기 } from '~models/test2'

const XXs = modelXXs.getInstance()
const selected = ref<modelXX | null>(null)

const { is관리자, is수정중 } = storeToRefs(useMyAuthStore())

// 조인이 클라에서 일어나므로 화면이 쓰는 목록을 한 번에 받아 둔다(`do신청세트읽기`).
watch(is관리자, v => v && do신청세트읽기(), { immediate: true })
</script>

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
import type { model설문 as modelXX } from '~models/test2'
import { model설문s as modelXXs, do신청세트읽기 } from '~models/test2'

const XXs = modelXXs.getInstance()
const selected = ref<modelXX | null>(null)

const { is관리자, is수정중 } = storeToRefs(useMyAuthStore())

// 조인이 클라에서 일어나므로 화면이 쓰는 목록을 한 번에 받아 둔다(`do신청세트읽기`).
watch(is관리자, v => v && do신청세트읽기(), { immediate: true })
</script>

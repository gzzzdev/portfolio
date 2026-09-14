<template>
  <div class="h-[calc(100dvh-var(--ui-layout-header-offset,var(--ui-header-height,4rem)))] w-full flex flex-row justify-center py-2">
    <viewAlert v-if="!is관리자" />
    <template v-else>
      <view목록5
        v-model:selected="selected"
        v-model:is수정중="is수정중"
        :repository="XXs"
        :can수정="is관리자"
        :can추가="false"
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
import type { model테이블 as modelXX } from '~models/(system)'
import { model테이블s as modelXXs } from '~models/(system)'

/**
 * 표 등록부를 **보기만** 하는 화면. 개발자 참고용이다.
 *
 * ## 메뉴 행을 안 만든다
 *
 * 그래서 GNB 에 안 뜨고, 주소를 아는 사람만 들어온다. 보호할 경로 목록은 `menus` 에서 나오므로
 * (`access-control.global`) 이 경로는 **미들웨어가 아예 안 본다** — 다른 관리 화면처럼 역할로
 * 되돌려보내는 일이 없다. 대신 아래 `viewAlert` 가 비관리자에게 목록 대신 안내를 띄우고,
 * 조회도 `is관리자` 일 때만 돈다. 나가는 값이 표 이름·번호·세는단위뿐이라 이 정도면 맞다.
 *
 * ## 여기서 고칠 수 있는 것
 *
 * `세는단위`·`계층`은 **정본이 이 표**다(`menus.target.dbTable` 에서 옮겨 왔다). 그래서 편집이
 * 열려 있다. `표 이름`과 `변경 번호`는 `canEdit: false` 다 — 이름은 `BaseModels2.tableName` 과
 * 짝이라 손으로 바꿀 값이 아니고, 번호는 기계(트리거)가 쓴다.
 */
const XXs = modelXXs.getInstance()
const selected = ref<modelXX | null>(null)

const { is관리자, is수정중 } = storeToRefs(useMyAuthStore())

await do첫조회('tables', () => XXs.reads(), is관리자)
</script>

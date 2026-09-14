<template>
  <!--
    디자인틀 **관리** 화면. 다른 admin 화면과 같은 `view목록5` 한 벌이다 —
    이름·용도·'발급에 사용'을 고치고, 권한·삭제가 여기서 걸린다 (`model디자인틀.자동필드ss`).

    좌표는 여기서 못 고친다. 그건 캔버스(`/admin/edit/design-templates`)의 몫이고,
    이 화면은 표가 아는 것(어떤 디자인틀이 있고 그중 무엇으로 발급하는가)까지만 다룬다.
    한때 이 경로가 곧 캔버스였고, 그래서 메뉴가 `kind: 'TABLE'` 이라 선언해 놓고
    목록을 그리지 않는 유일한 테이블 화면이었다. 그 어긋남을 없애려고 둘로 나눴다.

    **캔버스와 함께 준비중이다** (`~base-comps/PrintTemplate/준비중.ts`). 목록5 자체는 다 됐지만
    여기만 열어 두면 '만들기'·'복제'가 **좌표를 못 고치는 행**을 낳는다 — 배치를 고칠 캔버스가
    잠겨 있어서다. 그렇게 생긴 행도 '발급에 사용'으로 지정될 수 있으니 빈 종이가 나갈 길이 열린다.

    **GNB 는 여기가 아니라 캔버스로 온다** (메뉴 `1026`). 자주 여는 쪽이 그쪽이라서다 —
    이 화면은 캔버스 좌측 디자인틀목록의 '관리' 링크로 들어온다.
  -->
  <viewAlert v-if="!is관리자" />
  <viewComingSoon
    v-else-if="is디자인틀준비중"
    title="디자인틀 관리"
    icon="i-ph:table-light"
    description="디자인틀의 이름 · 용도와 '발급에 사용'을 다루는 표입니다.
배치를 고칠 캔버스가 아직 준비중이라, 좌표 없는 디자인틀이 생기지 않도록 같이 잠가 두었습니다."
    :되는일s="[
      '회원 화면의 등급증 · 명함 · 회원증 출력 — 기본 디자인틀로 그대로 나옵니다',
      '표가 비었을 때 되세우기 — 시스템 관리 화면의 초기데이터'
    ]"
  />
  <div
    v-else
    class="h-[calc(100dvh-var(--ui-layout-header-offset,var(--ui-header-height,4rem)))] w-full flex flex-row justify-center py-2"
  >
    <view목록5
      v-model:selected="selected"
      v-model:is수정중="is수정중"
      :repository="XXs"
      :can수정="is관리자"
    >
      <!-- 좌표를 고치러 가는 유일한 문. 목록5 안에는 캔버스를 얹을 자리가 없다 -->
      <template #top>
        <div class="flex flex-row justify-end">
          <mButton
            label="캔버스에서 편집"
            icon="i-lucide-layout-template"
            is미니
            @click="navigateTo('/admin/edit/design-templates')"
          />
        </div>
      </template>
    </view목록5>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ 꽉찬폭: true })

import { do첫조회 } from '~/composables/do첫조회'

import { storeToRefs } from 'pinia'
import { ref } from 'vue'

import { useMyAuthStore } from '~/stores/useMyAuthStore'
import type { model디자인틀 as modelXX } from '~models/test2'
import { model디자인틀s as modelXXs } from '~models/test2'
import { is디자인틀준비중 } from '~base-comps/PrintTemplate/준비중'

const XXs = modelXXs.getInstance()
const selected = ref<modelXX | null>(null)

const { is관리자, is수정중 } = storeToRefs(useMyAuthStore())

// 준비중 동안에는 표를 읽지 않는다 — 그릴 목록이 없다
await do첫조회('design-templates', () => XXs.reads(), () => is관리자.value && !is디자인틀준비중)
</script>

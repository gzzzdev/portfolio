<template>
  <div class="h-full w-full flex flex-row justify-center">
    <!--
      `ClientOnly` 인 이유: 이 표의 값은 전부 테마 스토어에서 온다. 하이드레이션 전에는
      저장값(localStorage)이 아직 안 붙어 SSR 마크업과 어긋난다 — 테마 메뉴·모래밭이
      같은 이유로 감싸고 있다(`m/테마/축줄s.vue` 머리말).
    -->
    <ClientOnly>
      <view목록5
        v-model:selected="selected"
        :repository="XXs"
        :can수정="true"
        :is수정중="true"
      />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { do첫조회 } from '~/composables/do첫조회'

/**
 * 테마 표 — **첫 행이 현재 테마, 나머지가 완제품.** 설계 근거는 `~models/(system)/model테마.ts` 머리말.
 *
 * 현재 테마를 고치는 길은 첫 행 상세판의 `값수정` 하나이고, AI도우미가 누르는 것도 같은
 * 자리다(`do수정`). 축을 밀면서 눈으로 보는 자리는 여전히 도크 테마 pane 의 축 줄s(`M테마축줄s`)다 —
 * 이 화면의 목적은 **도우미가 몰 수 있는 표**이지 더 나은 테마 편집기가 아니다.
 *
 * 나머지 행은 도크 격자가 펴는 완제품이다(`m/테마/프리셋격자.vue`). 표가 비어 있으면 격자도
 * 비어 있으므로 **여기서 「초기값설정」을 눌러 완제품을 붓는다**(`model테마s.do초기데이터`).
 */
import { ref } from 'vue'
import type { model테마 as modelXX } from '~models/(system)'
import { model테마s as modelXXs } from '~models/(system)'

definePageMeta({ layout: 'layout-v2' })

const XXs = modelXXs.getInstance()
const selected = ref<modelXX | null>(null)

await do첫조회('theme', () => Promise.all([
  // 완제품 행은 서버에서 오고, 현재 테마 행은 그 앞에 지어 붙는다(`model테마s.reads`).
  XXs.reads()
]))
</script>

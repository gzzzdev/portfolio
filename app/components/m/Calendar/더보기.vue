<!--
  「+n개 더」를 누르면 뜨는 하루치 목록. 껍데기는 `UModal` 그대로다 — `useModal/modalWrapper.vue` 도
  같은 것이고, 일반 열기(`useModal2`)는 아직 호출례가 없어 `v-model:open` 으로 둔다.
  줄은 `mCalendar칩 카드` — 격자의 칩과 같은 기호라 모달에서 다시 배우지 않는다.
-->
<template>
  <UModal
    v-model:open="open"
    :ui="{ content: 'sm:max-w-md' }"
  >
    <template #content>
      <div class="flex flex-col gap-3 p-5">
        <div class="text-lg font-semibold text-highlighted">
          {{ 제목 }}
        </div>
        <ul class="flex max-h-[min(60vh,24rem)] flex-col gap-2 overflow-y-auto">
          <li
            v-for="항목 in 항목s"
            :key="항목.id"
          >
            <mCalendar칩
              카드
              :제목="항목.title"
              :색="항목.색"
              :아이콘="항목.아이콘"
              :꼬리표="항목.꼬리표"
              :시각="항목.시각"
            />
          </li>
        </ul>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { iCalendar항목 } from './_/판'

defineProps<{
  제목: string
  항목s: iCalendar항목[]
}>()

const open = defineModel<boolean>('open', { default: false })
</script>

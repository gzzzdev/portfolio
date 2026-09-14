<template>
  <span
    v-if="props.선택됨"
    :class="SELECTION_BADGE_CLS"
  >
    <UIcon
      :name="SELECTION_BADGE_ICON"
      class="size-3"
    />
  </span>
</template>

<script setup lang="ts">
/**
 * 목록 카드의 선택 배지. **카드의 형제**로 그린다 — 카드가 `relative overflow-hidden` 이라
 * 안쪽에 두면 코너에 못 걸친다. 좌표는 카드 겉 래퍼 기준이고, 그 래퍼가 `relative` 를 든다
 * (`_/row.vue`·`portrait.vue`·`landscape.vue`).
 *
 * 밖으로 뺀 근거·6px 이 요구하는 목록 여백·자리(우상단)를 고른 이유는 전부
 * `m/테마/선택표시.ts` 머리말이 정본이다. 여기 다시 적지 말 것 — 이 파일은 클래스만 건다.
 */
import { SELECTION_BADGE_CLS, SELECTION_BADGE_ICON } from '~base-comps/m/_스킨'

const props = withDefaults(defineProps<{ 선택됨?: boolean }>(), { 선택됨: false })
</script>

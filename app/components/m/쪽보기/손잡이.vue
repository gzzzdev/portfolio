<template>
  <div class="flex flex-col gap-3">
    <slot name="앞" />

    <!-- 본문 길이와 상관없이 늘 선다 — 한 장이어도 1쪽·2쪽을 고를 수 있다(`m쪽보기` 머리말 요구 4). -->
    <m쪽보기트랙
      v-model="보기"
      이름="보기"
      :items="쪽보기options"
    />

    <!-- 여백은 쪽일 때만 뜻이 있다. -->
    <m쪽보기트랙
      v-if="보기 !== '흐름'"
      v-model="여백mm"
      이름="여백 (mm)"
      :items="여백items"
    />

    <p
      v-if="보기 !== '흐름'"
      class="text-center text-xs text-dimmed tabular-nums sm:text-left"
    >
      {{ 쪽수 }}쪽<span class="hidden sm:inline"> · {{ Math.round(배율 * 100) }}%</span>
    </p>

    <!-- 인쇄 — 고르는 칸이 아니라 누르는 일이라 트랙이 아니라 버튼이다. -->
    <mButton
      size="sm"
      역할="조용"
      icon="i-lucide-printer"
      title="인쇄 · PDF 로 저장"
      :loading="인쇄준비중"
      :ui="{ base: 'justify-center sm:justify-start' }"
      @click="emit('인쇄')"
    >
      <span class="hidden sm:inline">인쇄</span>
    </mButton>

    <!--
      저장 — 인쇄와 따로 선다(2026-09-14 사람이 정함). PDF 는 인쇄 창의 「PDF로 저장」 길을 그대로 탄다 —
      글자가 글자로 남는 PDF 는 그 길이 가장 깨끗하다. DOCX·PPTX 는 파일을 바로 내준다(`~utils/mdc/docx`·`pptx`). HWPX 는 숨겼다(`_옵션.ts`).
    -->
    <div class="flex flex-col gap-1">
      <span class="hidden text-xs text-muted sm:block">저장</span>
      <mButton
        v-for="형식 in 저장형식s"
        :key="형식.value"
        size="sm"
        역할="조용"
        :icon="형식.icon"
        :title="형식.title"
        :loading="형식.value === 'pdf' ? 인쇄준비중 : 저장중 === 형식.value"
        :ui="{ base: 'justify-center sm:justify-start' }"
        @click="emit('저장', 형식.value)"
      >
        <span class="hidden sm:inline">{{ 형식.label }}</span>
      </mButton>
    </div>

    <slot name="뒤" />
  </div>
</template>

<script setup lang="ts">
/**
 * **쪽 보기의 손잡이 줄** — 보기(흐름·1쪽·2쪽) · 여백 · 쪽 수 · 인쇄. 본문 길이와 상관없이 다 선다. 판(`m쪽보기`)과 짝이고, 화면이
 * 왼쪽 세로 줄에 세운다. 폭은 세우는 쪽이 준다(`w-9 sm:w-44` — 폰 폭은 아이콘만, `m쪽보기트랙` 머리말).
 *
 * **늘 서 있는 줄이 아니다 (2026-09-14 사람이 정함).** 읽는 화면은 위의 「인쇄·보기」 토글 하나만 두고,
 * 켜면 이 줄이 왼쪽에 서고 끄면 걷힌다(`/resources/[id]`). 칸 수를 보고 자리를 옮기는 안(여러 쪽이면 왼쪽,
 * 한 장이면 위)을 거쳐 이쪽으로 왔다 — 자리가 본문 길이 따라 바뀌는 것보다 사람이 여닫는 게 낫다.
 *
 * 화면마다 더 붙일 줄은 `#앞`·`#뒤` 로 끼운다(모래밭의 모드·샘플).
 */
import { 쪽보기options, 여백options, 저장형식s, type i쪽보기, type i저장형식 } from './_옵션'

defineProps<{
  쪽수: number
  배율: number
  인쇄준비중?: boolean
  /** 지금 짓고 있는 파일 형식. 누른 버튼에만 도는 표시가 뜬다. */
  저장중?: i저장형식 | null
}>()
const emit = defineEmits<{ 인쇄: [], 저장: [형식: i저장형식] }>()

const 보기 = defineModel<i쪽보기>('보기', { required: true })
const 여백mm = defineModel<number>('여백mm', { required: true })

const 여백items = 여백options.map(o => ({ ...o, title: `여백 ${o.value}mm` }))
</script>

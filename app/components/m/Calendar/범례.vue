<!--
  달력 범례 = **거르개**다. 줄마다 `mSwitch` 하나 — 켬/끔은 상태 하나라 손잡이도 하나다.
  (실코드 `view/캘린더/CalLegend` 는 줄마다 「보기/끄기」 두 알짜리 선택기를 세워서 왼쪽이 손잡이 밭이었다.)

  **스위치는 회색조다.** 컨트롤은 색을 안 가진다(`/decisions/theme/neutral` 첫 줄). 유형의 색은
  스위치가 아니라 라벨 앞의 표식이 진다 — 칩과 같은 3px 막대라 격자와 범례가 같은 기호를 쓴다.
  **색이 안 정해진 유형은 표식도 중립이다.** 그게 「이 유형은 색이 없다」는 정보다.

  **개수가 옆에 붙는다.** 「사용기간이 왜 안 보이지」의 답이 0 이면 그 자리에서 끝난다 —
  껐는지 원래 없는지 켜 보지 않고 안다.
-->
<template>
  <div class="flex min-w-0 flex-col gap-0.5">
    <div class="mb-1 flex items-baseline gap-2 px-2">
      <p class="text-xs font-semibold tracking-wide text-muted uppercase">
        일정 유형
      </p>
      <div class="grow" />
      <mButton
        역할="인라인"
        size="xs"
        :label="is전부켬 ? '모두 끄기' : '모두 보기'"
        @click="모두(!is전부켬)"
      />
    </div>

    <label
      v-for="항목 in 범례s"
      :key="항목.key"
      class="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-elevated/60"
      :class="켜진키s.has(항목.key) ? 'text-default' : 'text-dimmed'"
      :style="항목.색 ? { '--cal-mark': 항목.색 } : undefined"
    >
      <span
        class="h-3.5 w-[3px] shrink-0 rounded-full bg-[var(--cal-mark,var(--ui-border-accented))]"
        :class="!켜진키s.has(항목.key) && 'opacity-45'"
      />
      <UIcon
        :name="항목.아이콘"
        class="size-4 shrink-0 text-muted"
      />
      <span class="min-w-0 flex-1 truncate text-sm">{{ 항목.label }}</span>
      <span class="shrink-0 text-xs tabular-nums text-dimmed">{{ 개수s?.[항목.key] ?? 0 }}</span>
      <mSwitch
        size="xs"
        :model-value="켜진키s.has(항목.key)"
        :aria-label="항목.label"
        @update:model-value="(v: boolean) => 두기(항목.key, v)"
      />
    </label>
  </div>
</template>

<script setup lang="ts">
import type { iCalendar범례 } from './_/판'

const props = defineProps<{
  범례s: iCalendar범례[]
  /** 범례 키별 전체 개수 — 켜고 끄는 것과 무관하게 원본 수를 센다 */
  개수s?: Record<string, number>
}>()

const 켜진키s = defineModel<Set<string>>('켜진키s', { required: true })

const is전부켬 = computed(() =>
  props.범례s.length > 0 && props.범례s.every(x => 켜진키s.value.has(x.key)))

const 두기 = (key: string, 켬: boolean) => {
  const 다음 = new Set(켜진키s.value)
  if (켬) 다음.add(key)
  else 다음.delete(key)
  켜진키s.value = 다음
}

const 모두 = (켬: boolean) => {
  켜진키s.value = 켬 ? new Set(props.범례s.map(x => x.key)) : new Set()
}
</script>

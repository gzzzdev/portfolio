<!--
  달력의 일정 한 줄. **면은 중립이고 색은 왼쪽 표식 하나다.**

  **색은 정해진 것만 쓴다.** `색` 이 오면 `--cal-mark` 로 넘기고, 안 오면 아무것도 안 넘긴다 —
  그러면 `var(--cal-mark, var(--ui-border-accented))` 가 테마의 중립 선 색을 잡는다.
  `#94a3b8` 같은 값을 여기서 지어 넣지 않는다. 지어낸 색은 「정한 색」과 구분이 안 된다.

  **색이 있어도 면에는 안 칠한다.** 항목 색 틴트를 바탕에 깔면 여러 날짜리 막대 네 줄이 주마다
  깔리는 순간 격자가 색면이 된다 — 「어느 날인지」보다 「무슨 색인지」가 먼저 읽힌다.
  `mTheme.css` 면 블록도 같은 말을 한다: 강조는 면이 아니라 글자와 선으로.
  바탕은 파임 한 칸(`bg-elevated`)이다 — 알파로 두면 라이트에서 흰 종이와 안 갈려 이어진 막대가 끊겨 보였다.

  주 경계에서 이어지는 쪽(`앞잘림`)은 표식을 **숨기되 자리는 둔다** — 시작이 아닌데 시작처럼
  보이면 안 되고, 글자 시작점은 다른 칩과 맞아야 한다.
-->
<template>
  <div
    class="flex min-w-0 items-center overflow-hidden bg-elevated text-default transition-colors hover:bg-accented"
    :class="[
      카드 ? 'gap-2 rounded-lg py-2 pl-2 pr-3' : 'h-[1.375rem] gap-1.5 rounded-md pl-1.5 pr-2 leading-none',
      앞잘림 && 'rounded-l-none',
      뒤잘림 && 'rounded-r-none'
    ]"
    :style="색 ? { '--cal-mark': 색 } : undefined"
    :title="제목"
  >
    <span
      class="w-[3px] shrink-0 rounded-full bg-[var(--cal-mark,var(--ui-border-accented))]"
      :class="[카드 ? 'h-[1.1rem]' : 'h-3.5', 앞잘림 && 'invisible']"
    />
    <UIcon
      v-if="아이콘"
      :name="아이콘"
      class="size-3 shrink-0 text-muted"
    />
    <span
      v-if="시각"
      class="shrink-0 text-[0.65rem] font-semibold tabular-nums text-muted"
    >{{ 시각 }}</span>
    <span
      class="min-w-0 flex-1 truncate font-medium"
      :class="카드 ? 'text-sm' : 'text-[0.72rem]'"
    >{{ 제목 }}</span>
    <span
      v-if="꼬리표"
      class="shrink-0 text-[0.6rem] font-semibold text-dimmed"
    >{{ 꼬리표 }}</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  제목: string
  /** 표시가 정한 색. 없으면 안 넘긴다 */
  색?: string
  아이콘?: string
  꼬리표?: string
  시각?: string
  /** 주 경계에서 잘린 쪽은 모서리를 안 깎는다 — 이어진다는 표시다 */
  앞잘림?: boolean
  뒤잘림?: boolean
  /** 모달 목록처럼 넉넉하게 */
  카드?: boolean
}>()
</script>

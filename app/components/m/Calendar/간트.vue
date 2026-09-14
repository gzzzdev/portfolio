<!--
  간트 띠. **달 격자가 답 못 하는 물음 하나**를 맡는다 — 「이번 달에 뭐가 얼마나 걸쳐 있나」.

  격자는 날짜를 묻는 화면이라 기간이 길수록 불리하다. 3/2~6/19 짜리 수업은 어느 달을 펴도
  칸 몇 개를 지나갈 뿐이고, 여섯 개가 겹치면 전부 「+n개 더」 뒤로 숨는다.
  여기서는 **한 항목이 한 줄**이라 길이가 곧 그림이 되고, 겹침은 세로로 쌓여 안 숨는다.

  왼쪽 이름칸은 붙박이(`sticky`)다 — 좁은 화면에서 가로로 밀어도 무엇의 막대인지 안 잃는다.

  **막대 글자는 막대 밖에 있다.** 하루짜리 막대 안에 글자를 넣으면 못 읽는다(폭이 28px 다).
  이름은 왼쪽 칸이 지고 막대는 길이만 말한다.

  **막대는 중립이고 색은 왼쪽 캡 하나다** — `mCalendar칩` 과 같은 규칙. 막대는 길이가 전부라
  파임 두 칸(`bg-accented`)까지 내려간다. 한 칸은 라이트에서 흰 종이와 안 갈렸다.

  눈금은 **막대와 같은 격자에 두면 안 된다.** 막대가 `grid-column` 을 손으로 잡는 순간 자동 배치되는
  눈금 30칸이 그 칸을 피해 흘러서 줄마다 다른 날짜에 선다. 눈금은 흐름 밖(절대 위치) 한 겹이다.
-->
<template>
  <div
    v-if="!줄s.length"
    class="p-8 text-center text-sm text-muted"
  >
    이 달에 걸친 일정이 없습니다.
  </div>

  <div
    v-else
    class="min-w-[calc(11rem+var(--cal-days)*1.75rem)]"
    :style="{ '--cal-days': 날s.length }"
  >
    <div class="sticky top-0 z-20 flex border-b border-default bg-muted">
      <div class="sticky left-0 z-10 w-44 shrink-0 border-r border-default bg-muted px-2.5 py-2 text-[0.7rem] font-semibold text-muted">
        일정
      </div>
      <div
        class="grid flex-1"
        :style="열s"
      >
        <div
          v-for="날 in 날s"
          :key="날.valueOf()"
          class="py-2 text-center text-[0.62rem] font-semibold tabular-nums"
          :class="[
            날.isSame(오늘, 'day') ? 'text-highlighted' : 'text-dimmed',
            (날.day() === 0 || 날.day() === 6) && 'bg-muted/55'
          ]"
        >
          {{ 날.date() }}
        </div>
      </div>
    </div>

    <div
      v-for="줄 in 줄s"
      :key="줄.항목.id"
      class="flex items-stretch border-b border-default/60 last:border-b-0"
    >
      <div
        class="sticky left-0 z-10 flex w-44 shrink-0 items-center gap-2 border-r border-default bg-default px-2.5 py-1.5 text-[0.78rem] text-default"
        :style="줄.항목.색 ? { '--cal-mark': 줄.항목.색 } : undefined"
        :title="줄.항목.title"
      >
        <span class="h-3.5 w-[3px] shrink-0 rounded-full bg-[var(--cal-mark,var(--ui-border-accented))]" />
        <span class="truncate">{{ 줄.항목.title }}</span>
      </div>

      <div
        class="relative grid flex-1 grid-rows-[1.75rem] items-center"
        :style="열s"
      >
        <div
          class="absolute inset-0 grid"
          :style="열s"
        >
          <div
            v-for="날 in 날s"
            :key="날.valueOf()"
            class="border-r border-default/45"
            :class="[
              (날.day() === 0 || 날.day() === 6) && 'bg-muted/55',
              날.isSame(오늘, 'day') && 'border-r-primary bg-primary/10'
            ]"
          />
        </div>

        <div
          class="relative z-1 row-start-1 flex h-[1.05rem] items-center justify-end overflow-hidden rounded-full bg-accented pr-1.5"
          :class="[줄.앞잘림 && 'rounded-l-none', 줄.뒤잘림 && 'rounded-r-none']"
          :style="{
            ...(줄.항목.색 ? { '--cal-mark': 줄.항목.색 } : {}),
            gridColumn: `${줄.열} / span ${줄.칸수}`
          }"
        >
          <span
            v-if="!줄.앞잘림"
            class="absolute inset-y-0 left-0 w-[3px] bg-[var(--cal-mark,var(--ui-border-accented))]"
          />
          <span class="whitespace-nowrap text-[0.6rem] font-bold tabular-nums text-muted">{{ 줄.항목.일수 }}일</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { mDayjs } from '~utils'
import { 겹치나, type iCalendar항목 } from './_/판'

const props = defineProps<{
  항목s: iCalendar항목[]
  기준월: mDayjs
}>()

const 오늘 = mDayjs()

const 날s = computed(() => {
  const 첫 = props.기준월.startOf('month')
  return Array.from({ length: props.기준월.daysInMonth() }, (_, i) => 첫.add(i, 'day'))
})

/** 눈금·막대·머리가 같은 열을 나눠 쓴다 — 한 자리에서 만든다 */
const 열s = computed(() => ({ gridTemplateColumns: `repeat(${날s.value.length}, minmax(0, 1fr))` }))

/**
 * 이 달에 걸친 것만, **긴 것부터**. 시작이 같으면 이름순이라 다시 그려도 자리가 안 바뀐다.
 * 열·칸수는 달의 첫날을 1열로 잡고 달 밖으로 나간 쪽은 가장자리에서 자른다.
 */
const 줄s = computed(() => {
  const 첫 = props.기준월.startOf('month')
  const 끝 = props.기준월.endOf('month')
  const 날수 = 날s.value.length
  return props.항목s
    .filter(x => 겹치나(x, 첫, 끝))
    .sort((a, b) =>
      b.일수 - a.일수
      || a.첫날.valueOf() - b.첫날.valueOf()
      || a.title.localeCompare(b.title))
    .map((항목) => {
      const from = Math.max(0, 항목.첫날.startOf('day').diff(첫, 'day'))
      const to = Math.min(날수 - 1, 항목.마지막날.startOf('day').diff(첫, 'day'))
      return {
        항목,
        열: from + 1,
        칸수: Math.max(1, to - from + 1),
        앞잘림: 항목.첫날.isBefore(첫, 'day'),
        뒤잘림: 항목.마지막날.isAfter(끝, 'day')
      }
    })
})
</script>

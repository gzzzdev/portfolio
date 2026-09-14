<!--
  달 격자. **FullCalendar 를 안 쓴다** — 여기서 증명하려는 게 「여러 날짜리가 진짜로 이어져
  보이는가」라서다. 실코드(`view/캘린더`)는 월/년 뷰에서 항목을 전부 하루로 눌러 버린다
  (`useCalendarEvents.toFcEvent` 가 `start` 를 `startOf('day')`, `end` 를 그 다음 날로 덮는다).
  그래서 3/2~6/19 짜리 수업이 3월 2일 한 칸으로 뜬다.

  ## 한 주가 한 덩어리다

  칸마다 일정을 담지 않는다. **주(週) 단위로 줄(lane)에 눌러 담고** 막대 하나가 여러 칸을
  가로지른다(`_/판.주막대s`). 긴 것이 위로 가고 그 아래 틈을 한 칸짜리가 메운다.
  그래야 「8일부터 12일까지」가 한 줄로 읽힌다 — 칸마다 쪼개면 같은 일정이 다섯 개로 보인다.

  ## 배경과 막대는 층이 다르다

  날짜 숫자·칸 테두리는 깔개가 절대 위치로 깔고, 막대는 그 위에 흐름대로 쌓인다.
  그래서 **줄이 늘면 주의 높이가 저절로 늘어난다** — 칸 높이를 손으로 잡지 않아도 된다.

  면은 셋뿐이다 — 요일 띠는 파임(`bg-muted`), 주말은 파임 반 칸(`bg-muted/45`), 오늘 숫자는 solid 부품(`bg-primary`).
  스크롤은 담는 상자(`mBox종이`)가 맡는다. 여기서는 높이를 안 잡는다.
-->
<template>
  <div class="flex min-w-0 flex-col">
    <div class="sticky top-0 z-10 grid grid-cols-7 border-b border-default bg-muted">
      <div
        v-for="(요일, i) in 요일s"
        :key="요일"
        class="py-2 text-center text-[0.7rem] font-semibold tracking-wide"
        :class="i === 0 || i === 6 ? 'text-dimmed' : 'text-muted'"
      >
        {{ 요일 }}
      </div>
    </div>

    <div
      v-for="주판 in 주판s"
      :key="주판.키"
      class="relative flex min-h-[6.75rem] flex-col border-b border-default last:border-b-0"
    >
      <!-- 깔개: 날짜 숫자와 칸 선. 막대 뒤에 깔린다 -->
      <div class="absolute inset-0 grid grid-cols-7">
        <div
          v-for="칸 in 주판.칸s"
          :key="칸.키"
          class="min-w-0 border-l border-default px-2 py-1.5 first:border-l-0"
          :class="칸.주말 && 'bg-muted/45'"
        >
          <span
            class="inline-flex h-[1.35rem] min-w-[1.35rem] items-center justify-center rounded-full px-1.5 text-xs font-semibold tabular-nums"
            :class="[
              칸.오늘 ? 'bg-primary text-inverted' : 칸.딴달 ? 'font-medium text-dimmed' : 'text-default'
            ]"
          >{{ 칸.일 }}</span>
        </div>
      </div>

      <!-- 막대: 주 단위 격자에 줄(lane)로 쌓인다 -->
      <div class="relative grid auto-rows-[1.375rem] grid-cols-7 gap-y-[3px] px-1 pb-1.5 pt-[2.05rem]">
        <div
          v-for="막 in 주판.막대s"
          :key="막.항목.id"
          class="min-w-0 px-px"
          :style="{ gridColumn: `${막.열} / span ${막.칸수}`, gridRow: 막.줄 + 1 }"
        >
          <mCalendar칩
            :제목="막.항목.title"
            :색="막.항목.색"
            :아이콘="막.항목.아이콘"
            :꼬리표="막.항목.꼬리표"
            :시각="막.항목.시각"
            :앞잘림="막.앞잘림"
            :뒤잘림="막.뒤잘림"
          />
        </div>

        <mButton
          v-for="더 in 주판.더보기s"
          :key="더.키"
          역할="인라인"
          size="xs"
          class="justify-self-start px-1.5"
          :label="`+${더.항목s.length}개 더`"
          :style="{ gridColumn: 더.열, gridRow: 최대줄 + 1 }"
          @click="emit('더보기', 더.날, 더.항목s)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { mDayjs } from '~utils'
import { 달주s, 겹치나, 주막대s, type iCalendar항목 } from './_/판'

const props = withDefaults(defineProps<{
  항목s: iCalendar항목[]
  기준월: mDayjs
  /** 이 줄 수까지만 보이고 나머지는 「+n개 더」로 접는다 */
  최대줄?: number
  /** 그중 위 몇 줄을 여러 날짜리 몫으로 떼어 둘지 — `_/판.주막대s` 머리말 */
  기간줄?: number
}>(), { 최대줄: 4, 기간줄: 2 })

const emit = defineEmits<{ 더보기: [날: mDayjs, 항목s: iCalendar항목[]] }>()

const 요일s = ['일', '월', '화', '수', '목', '금', '토']
const 오늘 = mDayjs()

/**
 * 주 하나에 필요한 것을 **여기서 다 만들어 넘긴다.** 템플릿에서 셈하면 주마다 배열을 다시 훑게
 * 되고, `주묶음s[wi]!` 같은 TS 전용 문법이 템플릿에 들어간다 — 템플릿 식은 순수 JS 로 컴파일돼서
 * `!` 가 부정 연산자로 읽힌다.
 */
const 주판s = computed(() =>
  달주s(props.기준월).map((주) => {
    const 막대s = 주막대s(props.항목s, 주, { 최대줄: props.최대줄, 기간줄: props.기간줄 })
    const 넘친s = 막대s.filter(막 => 막.줄 < 0)

    return {
      키: 주[0]?.format('YYYY-MM-DD') ?? '',
      칸s: 주.map(날 => ({
        키: 날.format('YYYY-MM-DD'),
        일: 날.date(),
        딴달: 날.month() !== props.기준월.month(),
        주말: 날.day() === 0 || 날.day() === 6,
        오늘: 날.isSame(오늘, 'day')
      })),
      막대s: 막대s.filter(막 => 막.줄 >= 0),
      /** 접힌 것은 **날짜별로** 센다 — 막대는 주 단위지만 「더 보기」는 칸에 붙는다 */
      더보기s: 넘친s.length
        ? 주
            .map((날, di) => ({
              키: 날.format('YYYY-MM-DD'),
              날,
              열: di + 1,
              항목s: 넘친s.filter(막 => 겹치나(막.항목, 날, 날)).map(막 => 막.항목)
            }))
            .filter(x => x.항목s.length > 0)
        : []
    }
  })
)
</script>

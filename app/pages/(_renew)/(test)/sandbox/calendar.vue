<!--
  달력 재설계판. 실코드는 `app/components/view/캘린더`(FullCalendar) 고, 여기는 그 자리에
  **옮겨 넣기 전의 것**이다.

  ## m 부품의 조합이다

  껍데기·손잡이는 있는 것을 쓴다 — `mBox종이`(상자), `mButton 역할="조용"`(◀ 오늘 ▶),
  `mTabs type="segment"`(달력/기간), `mSwitch`(범례 켬끔). 없던 것만 `m/Calendar/` 에 새로 만들었다 —
  `mCalendar월`(주 단위 줄 배치)·`mCalendar간트`·`mCalendar칩`·`mCalendar범례`·`mCalendar도구줄`·`mCalendar더보기`.
  부품은 어느 표에서 왔는지 모른다. `model달력s` 를 부품 입력으로 바꾸는 건 옆의 `_달력판.ts` 다.

  ## 왜 다시 그렸나 — 눈에 걸린 것 넷

  1. **여러 날짜리가 하루로 눌린다.** `useCalendarEvents.toFcEvent` 가 월/년 뷰에서
     `start` 를 `startOf('day')`, `end` 를 그 다음 날로 덮어써서, 3/2~6/19 수업도 한 칸이다.
     달력에 실리는 여섯 표 중 넷(행사·수업·신청기간·사용기간)이 `기간` 칸이라 **대부분이 그렇다.**
  2. **범례 한 줄에 손잡이가 둘**(보기/끄기)이라 왼쪽 200px 이 손잡이 밭이었다.
     켬/끔은 상태 하나다 → 스위치 하나로, 남은 자리에 **개수**를 넣었다.
  3. **색이 지어낸 값이었다.** 모델이 색 안 정한 표에 여섯 색을 돌려 입혔다 → 걷었다.
     색은 표시가 `달력.color` 로 정한 것만 3px 표식에 실리고, 면에는 안 칠한다(`mCalendar칩` 머리말).
  4. **제목이 왼쪽 끝, 이동이 오른쪽 끝**이라 달을 넘길 때 눈이 화면을 가로질렀다 → 붙였다.

  ## 실코드에 남아 있는 것 (여기서 안 고쳤다)

  - `useCalendarMonth.현재날짜` 가 `datesSet` 의 `info.start` 로 달 이름을 만든다. 그 값은
    **보이는 첫 칸**(앞 달의 꼬리)이라 1일이 일요일이 아닌 달은 전부 앞 달 이름이 뜬다 —
    2026년 9월 격자에 「2026년 8월」이 적힌다. 고칠 자리는 `info.view.currentStart` 다.
  - `CalGrid.vue` 가 `var(--color-default)`·`var(--color-muted)` 를 쓰는데 **둘 다 없는 토큰**이라
    그 `color-mix` 가 통째로 무효다. `--ui-text`·`--ui-text-muted`·`--ui-border` 로 바꿀 것.

  ## 옮길 때

  `m/Calendar/*` 는 그대로 실코드가 쓸 수 있다. `_달력판.ts` 는 `view/캘린더` 옆으로.
  일·주·년 뷰는 FullCalendar 가 계속 맡는 게 싸다 — 이 판의 `mCalendar월` 은 월만 안다.
-->
<template>
  <div class="mx-auto flex h-dvh w-full max-w-(--ui-container) flex-col gap-3 px-4 py-6">
    <mCalendar도구줄
      v-model:뷰="뷰"
      :제목="제목"
      :쪽지="쪽지"
      :탭s="탭s"
      @이전="옮기기(-1)"
      @다음="옮기기(1)"
      @오늘="기준월 = mDayjs().startOf('month')"
    />

    <div class="flex min-h-0 flex-1 gap-4">
      <aside class="hidden w-52 shrink-0 lg:block">
        <mCalendar범례
          v-model:켜진키s="켜진키s"
          :범례s="범례s"
          :개수s="개수s"
        />
      </aside>

      <mBox종이 class="min-w-0 flex-1 !p-0">
        <div
          v-if="!is준비"
          class="flex h-full items-center justify-center text-sm text-muted"
        >
          불러오는 중…
        </div>
        <mCalendar월
          v-else-if="뷰 === '월'"
          :항목s="보이는항목s"
          :기준월="기준월"
          @더보기="열기"
        />
        <mCalendar간트
          v-else
          :항목s="보이는항목s"
          :기준월="기준월"
        />
      </mBox종이>
    </div>

    <mCalendar더보기
      v-model:open="is더보기"
      :제목="더보기제목"
      :항목s="더보기항목s"
    />
  </div>
</template>

<script setup lang="ts">
import { mDayjs } from '~utils'
import type { iCalendar항목 } from '~base-comps/m/Calendar/_/판'
import { use달력판 } from './_달력판'

definePageMeta({
  제목: '달력 재설계',
  설명: 'm 부품으로 조립한 달력 — 여러 날짜리를 진짜 폭으로 그리는 달 격자 + 기간용 간트 띠. 범례는 거르개로.',
  상태: '대기',
  쓰는곳: '옮길 곳 — view/캘린더'
})

const { is준비, 범례s, 켜진키s, 보이는항목s, 개수s } = use달력판()

const 탭s = [
  { label: '달력', value: '월' },
  { label: '기간', value: '간트' }
]

/** `?뷰=간트` 로 바로 열 수 있다 — 모래밭이라 링크 하나로 어느 화면을 말하는지 가리키려고 뒀다. */
const 뷰 = ref<string>(useRoute().query.뷰 === '간트' ? '간트' : '월')
const 기준월 = ref(mDayjs().startOf('month'))

const 옮기기 = (n: number) => {
  기준월.value = 기준월.value.add(n, 'month').startOf('month')
}

const 제목 = computed(() => 기준월.value.format('YYYY년 M월'))

const 이달수 = computed(() =>
  보이는항목s.value.filter(x =>
    !x.첫날.isAfter(기준월.value.endOf('month'), 'day')
    && !x.마지막날.isBefore(기준월.value.startOf('month'), 'day')).length)

const 쪽지 = computed(() =>
  is준비.value ? `이 달 ${이달수.value}건 · 전체 ${보이는항목s.value.length}건` : '')

const is더보기 = ref(false)
const 더보기제목 = ref('')
const 더보기항목s = ref<iCalendar항목[]>([])

const 열기 = (날: mDayjs, 항목s: iCalendar항목[]) => {
  더보기제목.value = 날.format('YYYY년 M월 D일')
  더보기항목s.value = 항목s
  is더보기.value = true
}
</script>

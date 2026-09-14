<template>
  <!--
    "고른 것을 어떻게 배치할 것인가"만 다룬다 — 무엇을 만들지 고르는 디자인틀목록은
    성격이 달라 캔버스 왼쪽(`목록.vue`)으로 나갔다.
    만드는 순서가 그대로 탭이 된다: 0 종이·배경 → 1 표식 → 2 글자.
    1~2 는 `types.ts` 의 레이어와 같은 순서다.

    **규격과 배경이 한 단계인 이유**: 배경만 규격에 종속된 레이어다. 글자·표식은 % 좌표라 종이를
    갈아도 제자리를 지키는데, 배경은 그 비율에 맞춰 생성된 픽셀이라
    규격이 바뀌면 잘리거나 늘어나는 것 말고 할 수 있는 게 없다 (`i배경.비율`). 둘을 떼어 놓으면
    종이를 갈고 배경 탭을 안 열어 본 채로 넘어가게 된다 — 같은 화면에 두면 그럴 수가 없다.

    단계별 편집 UI 는 한 단계당 한 파일씩 — 이 파일은 탭·선택 연동만 갖는다.
  -->
  <div class="flex h-full min-h-0 flex-col">
    <!-- ── 단계 ─────────────────────────────────────── -->
    <div class="flex shrink-0 items-center gap-2 border-b border-default px-3 py-1.5">
      <!-- 스페이서를 두면 flex-1 인 탭 줄과 남는 폭을 반씩 나눠 가져 탭이 잘린다. 면 라벨을 ml-auto 로 민다 -->
      <mTabs2
        v-model="단계"
        :items="단계s"
      />
      <!--
        모든 단계가 한 면에 걸린다. 어느 면을 고치는 중인지 안 보이면 뒷면을 앞면으로 착각한다.
        (0단계의 규격만은 디자인틀 전체지만, 같은 화면의 배경이 면 단위라 라벨은 여기서도 필요하다)
      -->
      <span
        v-if="틀.면s.length > 1"
        class="ml-auto shrink-0 text-xs text-muted"
      >{{ 현재면.라벨 }}면</span>
    </div>

    <div class="min-h-0 flex-1 overflow-y-auto p-4">
      <!-- 0단계는 두 벌이 한 화면이다: 종이를 정하고, 그 종이의 표면을 정한다 -->
      <template v-if="단계 === '종이'">
        <Panel규격
          v-model="틀"
          v-model:선택="선택"
        />
        <div class="my-4 border-t border-default" />
        <Panel배경
          v-model="틀"
          :면i="현재면i"
        />
      </template>
      <Panel표식
        v-else-if="단계 === '표식'"
        v-model="틀"
        v-model:선택="선택"
        :면i="현재면i"
      />
      <Panel글자
        v-else
        v-model="틀"
        v-model:선택="선택"
        :면i="현재면i"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import Panel규격 from './패널규격.vue'
import Panel배경 from './패널배경.vue'
import Panel표식 from './패널표식.vue'
import Panel글자 from './패널글자.vue'
import type { i틀 } from '~models/test2'
import type { i선택 } from './편집타입'

const 틀 = defineModel<i틀>({ required: true })
const 선택 = defineModel<i선택>('선택', { required: true })

/* ── 편집 중인 면 ───────────────────────────────────────────────── */

/**
 * 1~4 단계는 한 면에만 걸린다. 그 면은 선택에서 오지만, 선택이 풀려도(`null`) 기억해야 한다 —
 * 뒷면 글자를 고치다 표식 탭을 누르면 뒷면 표식이 나와야지 앞면으로 튀면 안 된다.
 *
 * 캔버스의 '보는 면' 모드와는 다르다. 앞뒤가 늘 함께 떠 있으므로 이 값은 무엇도 숨기지 않고,
 * "패널이 지금 누구를 고치는가"만 답한다.
 */
const 면기억 = ref(0)

/** 면이 지워지면 기억이 범위를 넘는다. 읽는 쪽에서 가둔다 */
const 현재면i = computed(() => Math.min(면기억.value, 틀.value.면s.length - 1))
const 현재면 = computed(() => 틀.value.면s[현재면i.value]!)

/* ── 단계 ────────────────────────────────────────────────────────── */

/**
 * 탭과 `선택`은 같은 것의 두 얼굴이다 — 어긋나면 "캔버스에서 글자를 눌렀는데 패널은 배경"이 된다.
 * 그래서 양쪽을 맞물려 둔다. 값이 같으면 watch 가 안 돌아 되먹임 고리는 생기지 않는다.
 */
const 단계 = ref<'종이' | '표식' | '글자'>('종이')

const 단계s = computed(() => [
  { value: '종이', label: `0 종이·배경${현재면.value.배경.url ? ' ·' : ''}` },
  { value: '표식', label: `1 표식${현재면.value.표식s.length ? ` · ${현재면.value.표식s.length}` : ''}` },
  { value: '글자', label: `2 글자 · ${현재면.value.글자s.length}` }
])

// 캔버스에서 무언가를 집으면 그 면·레이어로 따라간다.
// '배경' 레이어는 이제 0단계 안에 있으므로 그리로 보낸다
watch(선택, (s) => {
  if (!s) return
  면기억.value = s.면
  단계.value = s.레이어 === '배경' ? '종이' : s.레이어
})

// 탭을 직접 누르면 선택을 그 단계에 맞춘다 (딴 레이어를 잡은 채로 두면 캔버스 선택 테두리가 엉뚱한 곳에 남는다).
// 배경은 면 전체에 걸려 고를 상자가 없으므로 탭이 곧 선택이다.
// 0단계는 규격도 같이 들었지만 그 안에서 **잡을 수 있는 것은 배경뿐**이라 배경을 잡는다.
watch(단계, (d) => {
  if (d === '종이') 선택.value = { 면: 현재면i.value, 레이어: '배경' }
  else if (선택.value?.레이어 !== d) 선택.value = null
})
</script>

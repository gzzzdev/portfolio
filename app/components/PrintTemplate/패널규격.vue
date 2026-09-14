<template>
  <!--
    0단계. 종이 자체를 정한다 — 배경·표식·글자는 모두 이 판 위의 % 좌표라
    나중에 규격을 갈면 배치가 통째로 늘어난다. 그래서 먼저 고르는 자리다.
  -->
  <section class="flex flex-col gap-2">
    <p class="text-xs text-muted">
      인쇄될 실물 크기. 배치는 폭 대비 %라 규격을 바꿔도 비율은 유지됩니다.
    </p>

    <!--
      읽히는 순서가 곧 고르는 순서다: 규격(A4 세로) → 크기(mm) → 비고(증서·등급증).
      비고는 곁줄일 뿐 정체가 아니다 — 같은 A4 세로로 증서도 안내문도 만든다.
    -->
    <div class="flex flex-col gap-1">
      <button
        v-for="g in 규격프리셋s"
        :key="g.이름"
        type="button"
        class="flex items-baseline gap-2 rounded-md border px-3 py-2 text-left transition-colors"
        :class="틀.규격.이름 === g.이름
          ? 'border-primary bg-primary/10'
          : 'border-accented bg-default hover:bg-elevated'"
        @click="규격고르기(g)"
      >
        <span class="text-sm font-medium text-default">{{ g.이름 }}</span>
        <span class="text-xs text-muted">{{ g.폭mm }}×{{ g.높이mm }}mm</span>
        <span class="grow" />
        <span
          v-if="g.비고"
          class="text-xs text-dimmed"
        >{{ g.비고 }}</span>
      </button>
    </div>

    <p class="text-xs text-muted">
      인쇄 {{ 인쇄폭(틀.규격) }}×{{ 인쇄높이 }}px @300dpi
    </p>

    <!--
      면 수는 규격이 정하지 않는다 — 같은 90×50 으로 양면(`명함_1`)과 단면(`명함_2`)이 나란히 선다.
      그런데도 이 자리인 건 0단계가 "종이를 정하는" 단계이기 때문이다: 1~3(배경·표식·글자)은 전부
      면 **하나에** 걸리는 단계라, 면이 몇 장인지는 그 셋의 선행 조건으로 여기서 끝나야 한다.
      프리셋과는 나란한 별개 컨트롤이다 — 규격을 갈아도 면 수는 그대로다.
    -->
    <div class="flex items-center gap-2 border-t border-default pt-3">
      <USwitch
        :model-value="틀.면s.length > 1"
        size="xs"
        label="뒷면 만들기"
        @update:model-value="뒷면(!!$event)"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { 규격프리셋s, 새면, 인쇄폭 } from '~models/test2'
import type { i규격, i틀 } from '~models/test2'
import type { i선택 } from './편집타입'

const 틀 = defineModel<i틀>({ required: true })
const 선택 = defineModel<i선택>('선택', { required: true })

/** 프리셋 객체를 그대로 물리면 다음 디자인틀과 규격을 공유하게 되므로 복사해 넣는다 */
const 규격고르기 = (g: i규격) => {
  틀.value.규격 = { ...g }
}

const 인쇄높이 = computed(() => Math.round((틀.value.규격.높이mm / 25.4) * 300))

/**
 * 켜고 끄는 자리가 같아야 한다. 만드는 곳과 지우는 곳이 다르면 되돌리려고 딴 데를 찾게 된다 —
 * 상한이 2라 이 조작은 실제로 불리언이고(`types.ts` 의 `i틀.면s`), 스위치가 그걸 그대로 그린다.
 *
 * **켤 때 선택을 건드리지 않는 이유**: `패널.vue` 가 선택을 보고 탭을 따라 옮기므로,
 * 여기서 새 면을 집으면 스위치를 누른 그 순간 0 종이·배경 탭에서 튕겨 나간다. 사용자는 아직
 * 종이를 고르는 중이다 — 뒷면은 캔버스에 조용히 한 장 더 뜨는 것으로 충분하다.
 */
function 뒷면(켬: boolean) {
  const 면s = 틀.value.면s
  if (켬) {
    if (면s.length > 1) return
    면s.push(새면('뒤'))
    return
  }
  const 뒤 = 면s[1]
  if (!뒤) return
  // 빈 뒷면은 물어볼 게 없다. 그려 둔 게 있을 때만 되돌릴 수 없다고 알린다
  const 있음 = 뒤.글자s.length || 뒤.표식s.length || 뒤.배경.url
  if (있음 && !window.confirm('뒷면을 지웁니다. 이 면의 글자와 표식이 사라집니다.')) return
  면s.splice(1)
  // 지운 면을 가리키던 선택은 놓는다. 이 탭에선 이미 null 이라 대개 무동작이지만,
  // 남아 있으면 캔버스가 없는 면에 테두리를 그린다
  선택.value = null
}
</script>

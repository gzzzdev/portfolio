<template>
  <!--
    1단계. 데이터가 없는 그림 면이라 선택 대상이 하나뿐이다 — 목록도 추가/삭제도 없다.
    배경은 면마다 하나씩이라 `면i` 가 가리키는 면의 것만 만진다 (앞은 회백색, 뒤는 먹색).
  -->
  <section class="flex flex-col gap-2">
    <p class="text-xs text-muted">
      문서의 <b>인쇄 전 백지</b>를 뽑습니다 — 종이 질감과 테두리 문양만.
      글자와 표식은 그 위에 얹히므로 가운데는 비워 둔 채로 나옵니다.
    </p>

    <!--
      고르기가 먼저, 만들기가 나중이다. 목록은 **이 규격에 쓸 수 있는 것만** 보여준다 —
      비율이 다른 배경은 얹는 순간 잘리거나 늘어나는데, 그건 배경을 규격대로 뽑게 만들면서
      없앤 바로 그 문제다 (`model애셋s.list배경`).
    -->
    <Pick애셋
      v-model="면.배경.url"
      v-model:만들기="만들기"
      종류="배경"
      :문서비율="문서비율"
      빈안내="이 규격으로 보관된 배경이 없습니다. + 로 하나 만들어 보세요."
      @고름="애셋고름"
    />

    <Gen배경
      v-if="만들기"
      v-model="면.배경.url"
      v-model:묘사="면.배경.묘사"
      v-model:비율="면.배경.비율"
      :규격="틀.규격"
      :용도="틀.용도"
    />

    <div class="flex flex-wrap items-center gap-1">
      <mButton
        v-for="m in 배경맞춤s"
        :key="m"
        size="xs"
        class="rounded-full"
        :켜짐="면.배경.맞춤 === m"
        @click="면.배경.맞춤 = m"
      >
        {{ m }}
      </mButton>
      <div class="grow" />
      <input
        v-model="면.배경.바탕색"
        type="color"
        class="h-6 w-8 cursor-pointer rounded border border-accented bg-transparent"
        title="바탕색"
      >
    </div>

    <label class="flex items-center gap-2 text-xs text-muted">
      불투명도
      <USlider
        v-model="면.배경.불투명도"
        :min="0.1"
        :max="1"
        :step="0.05"
        class="flex-1"
      />
    </label>
  </section>
</template>

<script setup lang="ts">
import Gen배경 from './생성배경.vue'
import Pick애셋 from './애셋고르기.vue'
import { 배경맞춤s, type i틀, type model애셋 } from '~models/test2'

const 틀 = defineModel<i틀>({ required: true })
const props = defineProps<{ 면i: number }>()

const 면 = computed(() => 틀.value.면s[props.면i]!)
const 문서비율 = computed(() => 틀.value.규격.폭mm / 틀.value.규격.높이mm)

/**
 * 생성기를 펴 둘지. 면을 갈아타면 접는다 — 이 화면의 기본은 "고르기"고,
 * 열려 있으면 보관 목록이 밀려 안 보인다.
 */
const 만들기 = ref(false)
watch(() => props.면i, () => {
  만들기.value = false
})

/**
 * 보관된 배경을 고르면 **묘사와 비율까지 문서로 옮긴다.**
 * 묘사가 없으면 "같은 결로 다시 뽑기"의 근거가 사라지고, 비율이 없으면 나중에 규격을 갈았을 때
 * 어긋난 걸 못 잡는다 (`배경낡음`).
 */
function 애셋고름(a: model애셋) {
  면.value.배경.묘사 = a.묘사
  면.value.배경.비율 = a.비율
}
</script>

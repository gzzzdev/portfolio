<template>
  <!--
    캔버스 위 띠에 얹히는, **열어 둔 디자인틀**에 대한 두 가지. 저장하거나 되돌리거나.

    새로 만들기·복제·지우기는 여기 없다 — 그건 목록이 하나 늘고 주는 일이라 디자인틀목록 쪽이다.
    가르는 선은 "목록이 달라지는가"고, 이 둘은 목록의 길이를 바꾸지 않는다.

    아이콘만 둔다. 이 띠는 규격·선택 상태가 지나가는 좁은 줄이라 글자 라벨 둘이 끼면 메타를
    밀어낸다. 무엇에 대고 누르는지는 바로 왼쪽의 이름 칸이 이미 말한다 — 한때 여기에
    `등급증_1 에서 고침` 이라고 디자인틀 이름을 또 적었는데, 그건 캔버스의 것이 그 디자인틀의
    **사본**이라는 뜻이라 틀린 말이었다. 지금 열려 있는 것이 곧 그 디자인틀이다.

    **손댄 동안에만 선다.** 저장된 모습 그대로면 저장할 것도 되돌릴 것도 없다.
  -->
  <div
    v-if="손댐"
    class="flex shrink-0 items-center gap-1"
  >
    <span class="text-xs text-dimmed">{{ 상태말 }}</span>

    <!-- 되돌릴 곳은 저장된 행이다. 한 번도 저장 안 했으면 돌아갈 데가 없다 -->
    <mButton
      v-if="저장본"
      size="xs"
      역할="조용"
      icon="i-lucide-rotate-ccw"
      title="저장된 모습으로 되돌리기 — 지금 고친 것은 사라집니다"
      @click="되돌리기"
    />

    <mButton
      size="xs"
      역할="조용"
      icon="i-lucide-save"
      :loading="바쁨"
      title="저장"
      @click="저장"
    />
  </div>
</template>

<script setup lang="ts">
import { use디자인틀 } from './use디자인틀'
import type { i틀 } from '~models/test2'
import type { i선택 } from './편집타입'

const 틀 = defineModel<i틀>({ required: true })
const 선택 = defineModel<i선택>('선택', { required: true })

const { 바쁨, 저장본, 손댐, 되돌리기, 저장 } = use디자인틀(틀, 선택)

/**
 * 세 가지가 다른 상태다. 셋 다 "저장하면 목록에 반영된다"로 끝나지만, 저장이 무엇을 할지가
 * 다르다 — 있는 행에 쓰거나(고침), 행을 새로 만들거나(나머지 둘).
 */
const 상태말 = computed(() => {
  if (저장본.value) return '고침'
  return 틀.value.id ? '지워진 디자인틀' : '새 디자인틀'
})
</script>

<template>
  <div class="flex items-center rounded-full bg-default p-[2px] ring-1 ring-accented">
    <button
      type="button"
      class="flex size-[24px] items-center justify-center rounded-full text-dimmed transition-colors hover:text-default disabled:pointer-events-none disabled:opacity-25"
      :disabled="!행.can되돌리기(묶음)"
      :aria-label="`${묶음} 무작위 되돌리기`"
      @click="행.do되돌리기(묶음)"
    >
      <UIcon
        name="i-lucide-undo-2"
        class="size-[12px]"
      />
    </button>
    <button
      type="button"
      class="flex h-[24px] items-center gap-1 rounded-full px-2.5 text-xs text-dimmed transition-colors hover:text-default"
      :title="`${묶음} 축을 한 번에 무작위로`"
      @click="행.do무작위(묶음)"
    >
      <UIcon
        name="i-lucide-shuffle"
        class="size-[14px]"
      />무작위
    </button>
  </div>
</template>

<script setup lang="ts">
/**
 * 무작위 + 되돌리기 — **묶음 하나짜리** 손잡이. 묶음마다 하나씩 붙는다.
 *
 * 상자 크기는 px 로 적는다 — 이유는 `축줄s.vue` 머리말의 「상자는 px, 글자는 rem」.
 *
 * ## 왜 묶음마다인가 (2026-09-05)
 *
 * 한동안 전체 무작위 하나였고, 그게 굴리는 축 목록(`RANDOM_AXIS_NAMES`)이 「생김새」와
 * 정확히 겹쳐서 "그러니 무작위는 생김새의 손잡이"라고 정리했었다. **거꾸로였다** —
 * 그 목록은 자연법칙이 아니라 누가 한 번 그은 선이고, 그 선이 화면 분류를 지배하면
 * 「구현 기준으로 나눴다」는 원래 병이 그대로 돌아온다.
 *
 * 지금은 묶음이 먼저다(`축.ts` 의 `AXIS_GROUPS`). 무작위는 **자기 묶음의 줄만** 굴리고
 * 되돌리기도 그 범위로 걸린다 — 생김새를 굴린 뒤 읽기를 굴리고 되돌려도 생김새는 안 돌아간다.
 * 그래서 `그림자` 이 어느 묶음인지를 무작위 상수 눈치 안 보고 정할 수 있게 됐다.
 *
 * 「읽기」에도 무작위가 붙는 것이 이상해 보이면 — 그 사다리는 칸마다 대비를 실측해 둔 값이라
 * 어디에 서든 읽히고(`진하기.ts`), 되돌리기가 바로 옆이다. 다만 **글자 크기 줄은
 * 안 굴린다** — 축이 아니라서 (`AXIS_GROUPS` 머리말).
 *
 * 되돌리기가 무작위에만 붙는 이유: 축을 손으로 민 것은 다시 밀면 되고 카드는 다시 고르면
 * 되지만, **굴려서 나온 조합은 어디서 왔는지 모르니 되짚을 수가 없다**.
 *
 * ## 왜 스토어가 아니라 행을 부르나 (2026-09-09)
 *
 * 무작위·되돌리기는 이 손잡이 말고 **목록 화면의 버튼과 챗봇**도 건다(`model테마` 의
 * `자동버튼s`·`aiV2/sources.ts`). 그 둘은 행(`do*`)을 거치는 길밖에 없다. 여기만 스토어를
 * 직접 부르면 입구가 둘이 되고, 실제로 그때 범위가 갈렸다 — 저쪽은 `'full'` 한 줄,
 * 여기는 묶음. 챗봇으로 굴리고 이 앞에 서면 되돌리기 둘이 회색인 채였다.
 *
 * 지금은 **행 하나가 문이다.** 묶음은 인자로 넘어가고, 인자가 없으면 전부 — 그래도 되돌리기는
 * 묶음별로 걸린다(`model테마.do무작위`).
 */
import { 현재테마행 } from '~models/(system)'
import type { 축묶음 } from '~utils/theme/축'

defineProps<{ 묶음: 축묶음 }>()

/** 표가 도착하기 전에도 서는 행이다(`현재테마행`). 값을 안 들어서 잡아 둬도 낡지 않는다. */
const 행 = 현재테마행()
</script>

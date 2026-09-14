<template>
  <div
    class="my-5 grid gap-4"
    :class="열클래스"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

/**
 * `::columns` — 아무거나 나란히. 사진 두 장, 글과 사진, 짧은 목록 둘.
 *
 * `card-group` 과 다르다 — 그쪽은 **카드만** 담고 "고르게 하는" 뜻이 있다.
 * 이건 뜻이 없는 배치 도구라, 그래서 열 수를 받는다(뜻이 없으니 축이 정해줄 것도 없다).
 *
 * **좁아지면 무조건 1열로 떨어진다.** 본문은 도크(360)에도 들어가는데 거기서 2열을
 * 유지하면 둘 다 못 읽는다. `sm:` 하나로 끊는 게 전부이고, 그 이상은 안 받는다 —
 * 본문 안에서 반응형을 손으로 짜기 시작하면 그건 이미 본문이 아니다.
 */
interface Props {
  /** 2 또는 3. 그 밖은 2로 본다. */
  cols?: string | number
}
const props = withDefaults(defineProps<Props>(), { cols: 2 })

const 열클래스 = computed(() =>
  Number(props.cols) === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'
)
</script>

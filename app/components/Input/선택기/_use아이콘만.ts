import type { Ref, WatchSource } from 'vue'
import { nextTick, ref, watch } from 'vue'
import { useResizeObserver } from '@vueuse/core'

/**
 * 칩 줄이 칸보다 넓으면 글자를 걷고 아이콘만 남긴다(고른 칩은 글자를 둔다 — `_pill.vue`).
 *
 * 줄바꿈이 아니라 이쪽인 이유: 줄을 바꾸면 그 칸만 키가 자란다(`view/모델필드s2.vue` 의 `min-h-10` 머리말).
 * 가로 스크롤은 칩을 스크롤 뒤에 숨긴다.
 *
 * 판단은 **글자를 단 채 잰 폭**과 칸 폭을 견준다. 접힌 뒤의 폭으로 판단하면
 * 「들어간다 → 편다 → 안 들어간다 → 접는다」로 깜빡인다. 그래서 펼쳐 있을 때 잰 값을 들고 있다가
 * 칸 폭하고만 견준다. 칩이 바뀌면(보기 목록·읽기모드) 그 값이 낡으므로 한 번 펼쳐서 다시 잰다.
 *
 * `칸`은 넘치는 쪽을 품는 스크롤 상자다. 아이콘만으로도 안 들어가면 스크롤이 마지막 받침이다.
 */
export function use아이콘만(칸: Ref<HTMLElement | null>, 다시잴때: WatchSource) {
  const is아이콘만 = ref(false)
  let 펼친폭 = 0

  const 판정 = () => {
    const el = 칸.value
    if (!el) return
    if (!is아이콘만.value) 펼친폭 = el.scrollWidth
    is아이콘만.value = 펼친폭 > el.clientWidth
  }

  useResizeObserver(칸, 판정)
  watch(다시잴때, async () => {
    is아이콘만.value = false
    await nextTick()
    판정()
  })

  return { is아이콘만 }
}

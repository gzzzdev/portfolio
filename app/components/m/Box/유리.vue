<!--
  mBox유리 — 반투명한 상자. 면이 `bg-white/90 dark:bg-white/1` + `backdrop-blur-3xl` 라 **뒤가 비친다**
  (다크에선 1% 흰색 덧칠이라 조상 배경색이 거의 그대로 올라온다).
  **자기 자신을 중첩하며 알파를 쌓는 게 이 상자의 용법이다** — `mTheme.css` 「면(surface)」 블록의 덧칠(alpha lift) 예외.

  짝은 `mBox종이`(`종이.vue`) — 골격·슬롯·prop 이 같고 면만 불투명하다. 차이 전체는 종이 쪽 헤더에 있다.

  **여기서 헷갈리는 것 둘:**
  - **`층` prop 은 그림자를 만든다** (2026-09-04부터. 옛 `elevation` prop 은 없어졌다).
    예전엔 계산만 하고 루트에 안 얹어서, 유리를 쓰는 15곳이 테마의 그림자를 통째로 못 받았다.
    지금은 `.m-층-*` 이름표를 얹고 값은 그림자 축이 정한다 — `m/테마/그림자.ts`.
    층은 테두리도 고른다: 층이 있으면 `_borderSoft`(0.5px 이중선), 바닥(0)이면 `_border`(1px 단선).
  - **`is연하게` 는 기본 상태에서 아무 일도 안 한다.** `_border` 안에만 들어 있는데,
    기본 층이 1(카드)이라 늘 `_borderSoft` 쪽으로 간다. `층="0"` 이거나 `is투명` 일 때만 산다.
-->
<template>
  <!-- max-h-[calc(100dvh-var(--ui-header-height)-12px)] -->
  <!-- 여기서만 작ㅗ됨.  -->
  <!-- max-h-[calc(80dvh-var(--ui-header-height)-12px)] -->
  <div
    class=" w-full h-full flex flex-col p-1 sm:p-2 sm:px-3 rounded-md "
    :class="[

      is중첩 ? 'bg-neutral-300/10! dark:bg-neutral-700/10! border-1 border-default!' : '',
      // (!is투명 && !is중첩) ? 'bg-white/70 dark:bg-white/1 backdrop-blur-3xl' : '',

      (!is투명 && !is중첩) ? 'bg-white/90 dark:bg-white/1 backdrop-blur-3xl' : '',
      !is투명 && !shouldUseSoftBorderByElevation ? _border : '',
      !is투명 && shouldUseSoftBorderByElevation ? _borderSoft : '',

      // (!is투명 && !is중첩) ?'bg-neutral-500/5 dark:bg-white/3 backdrop-blur-xl': ''  ,

      // (is중첩 ) ?'bg-red-500/1 dark:bg-white/3 ': '',
      // (!is중첩 && !is투명) ? 'bg-neutral-500/10 dark:bg-white/10 backdrop-blur-xl' :'' ,
      appliedElevationClass

    //

    // (!is투명 && !is중첩) ?'bg-white/60 dark:bg-black/40 backdrop-blur-3xl': 'bg-transparent'  ,

    // '',//'bg-white/90 dark:bg-neutral-900/90'
    ]"
  >
    <div class="mb-1">
      <slot name="top">
        <div />
      </slot>
    </div>
    <div class="grow overflow-y-auto min-h-0 ">
      <slot name="default">
        <div />
      </slot>
    </div>
    <div
      v-if="slots.bot"
      class="pt-1"
    >
      <slot name="bot">
        <div />
      </slot>
    </div>
  </div>
</template>

<script lang="ts">
import { depthClass, type DepthLayer } from '~utils/theme/축'

interface Props {
  is투명?: boolean
  is중첩?: boolean

  is연하게?: boolean
  /**
     * **몇 번 층인가** — `0` 종이 · `1` 카드(기본) · `2` 떠있음 · `3` 드롭다운 · `4` 모달.
     * 옛 `elevation` prop 을 대신한다. 계약은 `종이.vue` 와 같고, 논거는 `m/테마/그림자.ts`.
     */
  층?: DepthLayer
}
</script>

<script setup lang="ts">
const props = withDefaults(defineProps<Props>(), {
  is투명: false,
  is중첩: false,
  is연하게: false,
  층: 1
})

const slots = useSlots()

/**
 * 선. 둘 다 **구조선 토큰**이다 — 유리도 담는 상자지 컨트롤이 아니다.
 * 연한 쪽을 칸 이름(`border-muted`)이 아니라 투명도로 미는 이유는 `종이.vue` 의 `선` 주석과 같다:
 * 지금 사다리에서 `border-muted` 는 `border-default` 와 같은 칸이라 아무 일도 안 일어난다.
 */
const _border = `border-1 ${props.is연하게 ? 'border-default/50' : 'border-default'}`
const _borderSoft = 'border-[0.5px] border-default/35 outline outline-1 -outline-offset-1 outline-default/15'

/** 중첩은 한 칸 내림 — 계약은 `종이.vue` 와 같다 */
const 층 = computed<number>(() => {
  if (props.is투명)
    return 0
  return Math.max(0, props.층 - (props.is중첩 ? 1 : 0))
})

/**
 * 이제 **실제로 얹는다** (2026-09-04). 예전엔 계산만 하고 클래스 목록에서 주석 처리돼 있어서,
 * 유리를 쓰는 15곳이 테마의 그림자를 통째로 못 받았다. 값은 그림자 축이 정한다.
 */
const appliedElevationClass = computed(() => depthClass(층.value))

/** 층이 있으면 0.5px 이중선, 바닥이면 1px 단선 — 그림자가 있을 때 선이 물러나는 규칙(`종이.vue` 와 같다) */
const shouldUseSoftBorderByElevation = computed(() => 층.value > 0)
</script>

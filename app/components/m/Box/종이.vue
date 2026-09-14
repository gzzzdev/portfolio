<!--
  mBox종이 — 불투명한 상자. 콘텐츠가 실제로 앉는 면이라 `mTheme.css` 「면(surface)」 블록의 **종이**(paper) 그대로다.
  짝은 `mBox유리`(`유리.vue`) — 골격은 같고 면만 반투명이다. 둘 다 남기는 게 의도다.

  **종이가 유리와 다른 점 셋:**

  1. **면이 불투명 토큰이다** — `bg-default`, 중첩이면 `bg-muted`. 유리는
     `bg-white/90 dark:bg-white/1` + `backdrop-blur-3xl` 라 **뒤가 비친다**
     (다크에선 1% 흰색 덧칠이라 조상 배경색이 거의 그대로 올라온다).
     유리의 그 알파는 버그가 아니라 설계다 — 자기 자신을 중첩하며 알파를 쌓는 게 그쪽 용법이고
     `mTheme.css` 「면(surface)」 블록의 덧칠(alpha lift) 예외에 그렇게 적혀 있다.
     **그래서 유리 자리를 종이로 그냥 바꾸면 중첩된 자리의 명도가 달라진다.** 옮길 땐 눈으로 볼 것.

  2. **둘 다 이제 `층` prop 을 쓴다** (2026-09-04. 옛 `elevation` prop 은 없어졌다).
     `.m-층-*` 이름표를 얹고, 몇 px 인지는 **그림자 축**이 정한다 — `m/테마/그림자.ts`.
     유리도 이제 그림자를 실제로 얹는다(예전엔 계산만 하고 주석 처리돼 있었다).

  3. **선이 한 갈래다.** `border-default`, 그림자가 있거나 `is연하게` 면 `border-default/50`.
     유리는 층이 있느냐로 1px 단선과 0.5px 이중선(`outline` 덧댐)이 갈린다.
     기본 층이 1(카드)이라 유리는 사실상 늘 이중선 쪽이고, 그 결과
     **유리의 `is연하게` 는 기본 상태에서 아무 일도 안 한다** (단선 쪽에만 들어 있다).

  선·면이 전부 토큰이라 진하기 축을 따라온다. 유리도 2026-09-04 에 하드코딩을 걷어내 이제 같다 —
  원래 종이를 새로 짠 이유가 그것이었는데, 그 이유는 없어지고 위 셋만 남았다.

  **슬롯 계약은 유리와 같다** — `top` · 기본 · `bot`. 기본 슬롯만 스크롤한다.
  다만 `top` 이 없으면 그 자리를 안 만든다 (유리는 빈 `<div>` 와 `mb-1` 을 늘 그린다).

  prop 은 유리와 완전히 같다: `is투명` · `is중첩` · `is연하게` · `층`.
-->
<template>
  <div
    class="w-full h-full flex flex-col p-1 sm:p-2 sm:px-3 rounded-md"
    :class="[면, 선, 그림자]"
  >
    <div
      v-if="slots.top"
      class="mb-1"
    >
      <slot name="top" />
    </div>

    <div class="grow overflow-y-auto min-h-0">
      <slot />
    </div>

    <div
      v-if="slots.bot"
      class="pt-1"
    >
      <slot name="bot" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { depthClass, type DepthLayer } from '~utils/theme/축'

interface Box9Props {
  /** 면·선·그림자 전부 없음. 배치만 빌릴 때. */
  is투명?: boolean
  /** 상자 안의 상자. 바탕이 한 단 조용해지고(`bg-muted`) 층이 한 칸 내려간다. */
  is중첩?: boolean
  /** 선을 한 단 더 뒤로. 축과 무관하게 늘 먹도록 칸 이름이 아니라 투명도로 민다. */
  is연하게?: boolean
  /**
   * **몇 번 층인가** — `0` 종이 · `1` 카드(기본) · `2` 떠있음 · `3` 드롭다운 · `4` 모달.
   *
   * 옛 `elevation` prop 을 대신한다. 그건 그림자 **세기**를 골랐고 안 적으면 테마 축을 따랐는데,
   * 그 모델에서는 카드와 모달이 같은 그림자를 쓰게 돼서 아무도 못 썼다. 지금은 둘이 직교한다 —
   * **prop 은 층, 축은 사다리 전체 위치.** 논거는 `m/테마/그림자.ts` 머리말.
   */
  층?: DepthLayer
}

const props = withDefaults(defineProps<Box9Props>(), {
  is투명: false,
  is중첩: false,
  is연하게: false,
  층: 1
})

const slots = useSlots()

/** 중첩은 한 칸 내림 — 상자 안의 상자가 바깥보다 더 떠 있으면 안 된다. 바닥(0)에서 더 안 내려간다 */
const 층 = computed<number>(() => {
  if (props.is투명)
    return 0
  return Math.max(0, props.층 - (props.is중첩 ? 1 : 0))
})

const 그림자있음 = computed(() => 층.value > 0)

/** 루트에 **실제로** 얹는다 — 값은 그림자 축이 정한다 */
const 그림자 = computed(() => depthClass(층.value))

/**
 * 바탕. 진하기 축은 바탕을 일부러 안 건드린다(`m/테마/진하기.ts` 참고) — 글자가 딛고 선
 * 바닥이라 잉크와 같이 움직이면 대비가 제자리다. 그래서 여기서도 고정 토큰만 쓴다.
 */
const 면 = computed(() => {
  if (props.is투명)
    return ''
  return props.is중첩 ? 'bg-muted' : 'bg-default'
})

/**
 * 선. **구조선 토큰(`border-default`)이다** — 카드를 담는 선이지 컨트롤의 선이 아니다.
 * 컨트롤에 속한 선(탭 밑줄 같은 것)에 이걸 쓰면 그 컨트롤만 유독 굵어 보인다.
 * 그 함정은 `진하기.ts` 부품 칸 주석의 ⚠️ 에 적혀 있다.
 *
 * 그림자가 있으면 한 단 뒤로 뺀다 — 경계를 알리는 채널이 둘(그림자·선)이 되니 선이 다 짊어질
 * 이유가 없다. 그림자가 없으면 선이 유일한 채널이라 제 농도를 쓴다.
 * (진하기 축의 "채널이 하나뿐인 쪽에 진한 칸을 준다" 와 같은 규칙이다.)
 *
 * 칸 이름(`border-muted`)이 아니라 투명도로 미는 이유: 지금 사다리에서 `border-muted` 는
 * `border-default` 와 **같은 칸**이라 아무 일도 안 일어난다.
 */
const 선 = computed(() => {
  if (props.is투명)
    return ''
  return props.is연하게 || 그림자있음.value ? 'border border-default/50' : 'border border-default'
})
</script>

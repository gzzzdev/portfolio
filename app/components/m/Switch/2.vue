<template>
  <mButton
    :class="ui"
    :label="label"
    :켜짐="켜진가"
    @click="() => onoff = !onoff"
  />
</template>

<script setup lang="ts">
/**
 * 토글 버튼 — 껐다 켰다를 **버튼 하나의 재질**로 말한다(스위치 모양이 아니라).
 *
 * ## 색을 안 적는다 (2026-09-07)
 *
 * 예전엔 이랬다: `:color="(is반대 ? !onoff : onoff) ? color : 'neutral'"` + `color` 기본값 `'primary'`.
 * 켜짐을 **손으로 구현**한 것인데, 그러면 두 가지가 한꺼번에 깨진다.
 *
 * 1. **어휘가 안 돈다.** 색 해석은 "호출부가 적었으면 그쪽이 이긴다"라서
 *    (`m/Button/_/style1.vue` 의 `resolvedColor`), 색을 적는 순간 `재질.colorFor` 까지 못 간다.
 *    `켜짐` prop 이 이미 있는데 그 길을 스스로 막고 있었다.
 * 2. **켜짐이 강조색으로 칠해진다.** `mTheme.css` 면 블록이 정반대를 적어 뒀다 —
 *    *"`켜짐` 은 아직 중립이다 — 허용은 되지만 탭·칩이라 한 화면에 여럿이라서."*
 *    한 화면에 토글이 여럿인데 켜진 것마다 브랜드색이면 화면이 primary 로 물든다.
 *
 * 그래서 **`켜짐` 만 넘기고 색은 안 적는다.** 켜지면 solid(중립), 꺼지면 테마 재질 —
 * 갈라지는 채널이 색이 아니라 **재질**이 되고, 그게 `재질.ts` 가 `켜짐` 을 역할과 직교로
 * 둔 이유다(탭은 `역할="조용"`+켜짐, 칩은 역할 없이 켜짐).
 *
 * 켜짐의 solid 는 중립이라 `bg-inverted`(검정/흰색)다 — 내비의 「지금 여기」와 같은 색이고,
 * 같은 뜻이라 맞다(`l/NavigationMenu2.vue` 의 `알약cls` 머리말).
 *
 * **`color` prop 은 없앴다.** 필요하면 `mButton` 처럼 fallthrough 로 넘어간다(비상구).
 */

interface Props {
  label?: string
  /** 켜짐의 뜻을 뒤집는다 — 「수정하기」처럼 꺼진 쪽이 기본 상태인 손잡이용 */
  is반대?: boolean
}

const onoff = defineModel<boolean>({ required: true, default: false })
const props = withDefaults(defineProps<Props>(), {
  is반대: false
})

const 켜진가 = computed(() => props.is반대 ? !onoff.value : onoff.value)

const ui = 'cursor-pointer'
</script>

<template>
  <comp
    v-bind="attrs"
    :loading="로딩중"
    :역할="역할"
    :켜짐="켜짐"
    class="cursor-pointer"
  >
    <slot />
  </comp>
</template>

<script setup lang="ts">
import type { Role } from '~base-comps/m/_스킨'

import comp from './_/style1.vue'

interface Props {
  ing?: boolean
  /**
     * 축 **바깥**에 고정할 때만 적는다 — `강조`(solid) · `조용`(ghost) · `인라인`(link).
     * 대부분은 아무것도 안 적고 테마 재질을 따른다. 어휘는 `~base-comps/m/_스킨.ts`.
     *
     * `variant` 를 직접 적으면 그쪽이 이긴다(비상구). 다만 테마 축이 못 건드린다.
     */
  역할?: Role
  /** 토글이 켜진 상태인가. 역할과 직교 — 켜지면 어느 재질에서도 solid 로 승격된다 */
  켜짐?: boolean
}

/**
 * **`inheritAttrs: false` — `_/style1.vue` 와 같은 이유고, 같은 함정이다.**
 *
 * 뿌리가 `comp`(=style1) 하나뿐인 컴포넌트가 `v-bind="attrs"` 로 attrs 를 손수 펴 주면,
 * Vue 가 렌더 마무리에 **fallthrough 로 한 번 더** 같은 attrs 를 뿌리에 얹는다. 그 두 번째가
 * 우리 덮어쓰기보다 뒤라, `:loading="…"` 같은 자기 결정이 호출부 값에 조용히 지워진다.
 * (style1 에서는 그게 `resolvedVariant` 를 지워 모델 버튼이 전부 검게 나오는 사고가 됐다.)
 *
 * 여기서는 아직 안 터졌다 — 덮어쓰는 게 `loading` 하나뿐이고, `역할`·`켜짐` 은 **선언된 prop**
 * 이라 애초에 attrs 에 없기 때문이다. 그래도 막는 이유는 덮어쓸 것이 하나 늘어나는 순간
 * 터지는데, **터져도 화면에 오류가 안 나서** 아무도 못 찾기 때문이다.
 */
defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<Props>(), {
  ing: false
})

const attrs = useAttrs()

/**
 * 로딩 — **적으면 호출부가 이긴다**(style1 의 `resolvedVariant`·`resolvedColor` 와 같은 규칙).
 *
 * 두 어휘가 같은 자리를 가리킨다: 이 컴포넌트의 `ing` 과 Nuxt UI 의 `loading`.
 * 호출부 여덟 곳이 `:loading` 을, 둘이 `:ing` 을 쓰고 있어서 **둘 다 살아야 한다.**
 * `inheritAttrs` 를 끄기 전에는 fallthrough 가 뒤에 얹혀서 `:loading` 이 저절로 이겼는데,
 * 끄면 그 우연이 사라진다 — 그래서 그 우선순위를 여기에 **적어서** 남긴다.
 */
const 로딩중 = computed(() => (attrs.loading as boolean | undefined) ?? props.ing)
</script>

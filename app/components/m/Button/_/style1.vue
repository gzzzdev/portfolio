<template>
  <!-- `v-bind="attrs"` 뒤에 오는 바인딩이 이긴다 — 호출부가 적었으면 `resolved*` 안에서 이미 그 값이다 -->
  <UButton
    v-bind="attrs"
    :variant="resolvedVariant"
    :color="resolvedColor"
    :label="is미니 ? undefined : attrs.label"
  >
    <slot />
  </UButton>
</template>

<script setup lang="ts">
import { colorFor, type Role, variantFor } from '~base-comps/m/_스킨'
import { useThemeStore } from '~/stores/useThemeStore'

interface Props {
  is미니?: boolean
  /**
     * 축 **바깥**에 고정할 때만 적는다 — `강조`(solid) · `조용`(ghost) · `인라인`(link).
     * 대부분의 버튼은 아무것도 안 적고 테마 재질을 따른다. 그게 통일성이 생기는 자리다.
     */
  역할?: Role
  /**
     * 토글이 켜진 상태인가. **역할과 직교**다 — 탭은 `역할="조용" :켜짐`,
     * 칩은 역할 없이 `:켜짐` 처럼 바탕은 그대로 두고 켜진 것만 solid 로 승격한다.
     */
  켜짐?: boolean
}

/**
 * **`inheritAttrs: false` 가 이 파일의 전제다. 빼면 아래 `resolved*` 가 조용히 무효가 된다.**
 *
 * 뿌리가 `UButton` 이고 템플릿이 `v-bind="attrs"` 로 **손수** 펴 준 뒤 `:variant`·`:color` 로
 * 덮어쓰는 모양인데, `inheritAttrs` 가 켜져 있으면 Vue 가 렌더 마무리에 **fallthrough 로 한 번 더**
 * 같은 attrs 를 뿌리에 얹는다. 그 두 번째가 **우리 덮어쓰기보다 뒤**라, 호출부가 `variant: undefined`
 * 를 넘긴 순간 `resolvedVariant` 가 그 `undefined` 에 지워지고 UButton 은 자기 기본값(`solid`)으로 간다.
 *
 * **키가 아예 없을 때는 안 지워진다** — 그래서 `<mButton label size />` 는 멀쩡하고,
 * `variant` prop 을 선언해 두고 안 채운 채 넘기는 래퍼만 검게 나왔다. 화면에서 그게
 * `Input/버튼.vue`(모델 스펙 `타입지정.버튼` 이 지나는 길)였고, 필드 목록 한가운데의
 * 검은 「회비 납부」가 이것이다 — 아무도 solid 라고 적지 않았는데 solid 로 나오던 자리.
 *
 * 같은 이유로 `resolvedColor` 도 지워진다. `역할="강조"` 를 줘도 강조색이 안 붙던 이유가
 * 호출부의 `color` 만이 아니었다는 뜻이다(`Input/버튼.vue` 의 기본값은 따로 걷었다).
 *
 * 진단 판: `/decisions/theme/neutral` 의 「어느 prop 이 재질 축을 끊나」 — prop 을 하나씩 얹어
 * `variant: undefined` 한 칸에서 outline→solid 로 갈리는 것을 눈으로 본다.
 */
defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<Props>(), {
  is미니: false
})

const attrs = useAttrs()
const theme = useThemeStore()

/**
 * 색 해석 — variant 와 같은 규칙이다. **적으면 이기고, 안 적으면 역할이 정하고, 역할도 없으면
 * `app.config` 의 기본값(`neutral`)이 먹는다.**
 *
 * 여기서 `?? 'primary'` 로 **모든** 버튼을 채우던 시절이 있었다. 그건 호출부가 안 넘겼는데
 * 컴포넌트가 제3의 값을 박는 것이라 축의 결정이 버튼에 영영 안 닿았다(호출부들이 `color="neutral"`
 * 을 손으로 적고 있던 이유). 지금은 다르다 — **역할이 `강조` 일 때만** 색이 붙고, 그건 컴포넌트가
 * 지어낸 값이 아니라 호출부가 `역할="강조"` 라고 적어서 고른 것이다 (`재질.colorFor`).
 */
const resolvedColor = computed(() => {
  const 직접지정 = attrs.color as string | undefined
  if (직접지정) return 직접지정

  return colorFor(props.역할, props.켜짐)
})

/**
 * variant 해석 — 위가 이긴다.
 *
 *   1. 호출부가 `variant` 를 직접 줬으면 **그대로 쓴다.** 비상구다. 테마 축이 못 건드린다.
 *      역할로 표현이 안 되는 한두 곳을 위한 문이고, 늘어나면 어휘가 부족하다는 신호다.
 *   2. `역할`·`켜짐` → 축 바깥으로 고정된 값 (solid · ghost · link)
 *   3. 아무것도 없으면 **테마 재질** (`AXES.variant` — outline · soft · subtle)
 *
 * 그림자를 mBox 가 스토어에서 읽는 것과 같은 구조 — CSS 변수로 표현 못 하는 축이라 컴포넌트가
 * 직접 읽는다. SSR 첫 페인트는 테마 쿠키(`쿠키.b`)가 맞춰준다.
 */
const resolvedVariant = computed(() => {
  const 직접지정 = attrs.variant as string | undefined
  if (직접지정) return 직접지정

  return variantFor(theme.variant, props.역할, props.켜짐)
})
</script>

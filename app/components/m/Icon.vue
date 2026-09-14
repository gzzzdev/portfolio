<template>
  <div :class="classByLabel">
    <UIcon v-bind="props" />
    <div
      v-if="label"
      :class="labelPosition"
    >
      {{ label }}
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * **색 prop 은 없다.** 예전엔 `color`·`colorDeep` 이 있었는데 둘 다 죽은 값이었다 —
 * `text-${color}-${500 + deep*100}` 을 **런타임에 만들어서** Tailwind 가 소스를 정적으로 훑을 때
 * 그 문자열이 어디에도 없고(safelist 도 없다), 클래스가 아예 생성되지 않았다.
 * 넷을 나란히 렌더해 보면 전부 같은 색으로 나오던 자리다(2026-09-07 에 확인하고 걷음).
 *
 * 되살리지 말 것. 아이콘 색은 **담은 자리의 `text-*` 를 물려받는다** — 그래야 컨트롤이
 * 재질·진하기 축을 따라갈 때 아이콘이 같이 간다. 신호색이 필요하면 담은 자리에
 * `text-error` 같은 시맨틱 클래스를 준다(팔레트 숫자 shade 는 `진하기.ts` 가 금지한다).
 */
interface Props {
  name: string

  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  class?: string
  label?: string
  labelPosition?: 'top' | 'bottom' | 'left' | 'right'
}
const props = withDefaults(defineProps<Props>(), {
  name: 'i-lucide-layout-grid',
  size: 'md',
  class: ''
})

const classByLabel = computed(() => ({
  top: 'flex flex-col reverse',
  bottom: 'flex flex-col',
  left: 'flex flex-row reverse',
  right: 'flex flex-row'
})[props.labelPosition || 'top'] as const)
</script>

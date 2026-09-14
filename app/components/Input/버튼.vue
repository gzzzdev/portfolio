<template>
  <div
    class="flex flex-row gap-2"
    :class="alignClass"
  >
    <mButton
      :icon="icon"
      :label="label"
      :color="color"
      :variant="variant"
      :역할="역할"
      :size="ui크기"
      :block="block"
      :class="확장클래스"
      :disabled="disabled"
      :ing="is로딩중"
      @click.stop.prevent="doClick"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Role } from '~base-comps/m/_스킨'

/**
 * `자동필드ss` 안에 놓는 버튼 (`타입지정.버튼`).
 * 값을 갖지 않으므로 `modelValue`/`readonly`는 받기만 하고 쓰지 않는다 —
 * 읽기모드에서도 눌려야 하는 게 버튼이고, 노출 조건은 `show`/`is수정할때만`이 담당한다.
 */
interface Props {
  label?: string
  icon?: string
  onClick?: () => unknown | Promise<unknown>
  /**
     * 축 바깥으로 고정할 때만. **기본값을 두지 않는다** — 적으면 `mButton` 에서 그대로 이겨서
     * (`_/style1.vue` 의 `resolvedColor`) 역할이 색을 못 고르기 때문이다. 안 적으면 역할이 정하고,
     * 역할도 없으면 `app.config` 의 기본값(`neutral`)이 먹는다.
     */
  color?: string
  /** 축 바깥으로 고정할 때만 — `강조`·`조용`·`인라인` (`~base-comps/m/_스킨`) */
  역할?: Role
  /** 역할로 표현이 안 될 때만. 적으면 테마 축이 못 건드린다 */
  variant?: string
  /** UButton 크기(xs~xl)에 더해 `2xl`/`3xl`을 받는다. 아래 `확장크기s` 참고. */
  size?: string
  block?: boolean
  disabled?: boolean
  /**
     * `'left'`(기본)/`'right'` = 필드칸 안. 위아래 입력칸과 같은 좌우 라인을 쓴다.
     * `'no-field'` = 예외. 라벨 컬럼까지 무시하고 행 맨 왼쪽에 붙인다.
     */
  align?: 'left' | 'right' | 'no-field'
  /** 필드 공통 배선으로 넘어오지만 버튼에서는 무시한다. */
  modelValue?: unknown
  readonly?: boolean
}
/**
 * `color: 'neutral'` 을 기본값으로 갖고 있었다. **그게 제어계통의 구멍이었다** —
 * `mButton` 의 색 해석은 "호출부가 적었으면 그쪽이 이긴다" 라서(`m/Button/_/style1.vue`),
 * 이 컴포넌트는 호출부가 아무 말도 안 했는데 매번 `neutral` 을 적고 있었다. 결과적으로
 * 모델 스펙이 `props: { 역할: '강조' }` 를 줘도 `재질.colorFor` 까지 못 가서 강조색이 안 붙는다.
 * (style1 이 `?? 'primary'` 로 모든 버튼을 칠하던 시절 호출부들이 `color="neutral"` 을 손으로
 *  적었고, 그 시절은 끝났는데 여기만 그 값을 물고 있었다 — 같은 파일 `resolvedColor` 주석.)
 * 빼도 보이는 건 안 바뀐다: 역할 없는 버튼은 `app.config` 기본값으로 똑같이 `neutral` 이다.
 */
const props = withDefaults(defineProps<Props>(), {
  align: 'left',
  block: false,
  disabled: false
})

/**
 * UButton은 `xl`이 최대치라 그 위 단계는 여기서 직접 만든다.
 * (`!`는 예전에 mButton 이 `px-1.5`를 고정하던 시절의 잔재다 — 그 고정은 걷어냈지만,
 *  Nuxt UI 자체 size 패딩을 이기려면 어차피 필요하다.)
 */
const 확장크기s: Record<string, string> = {
  '2xl': 'px-5! py-2.5! text-base! gap-2',
  '3xl': 'px-7! py-3.5! text-lg! gap-2.5'
}
const ui크기 = computed(() => (props.size && 확장크기s[props.size]) ? 'xl' : props.size)
const 확장클래스 = computed(() => (props.size && 확장크기s[props.size]) || '')

// 필드칸 = 모델필드s 한줄 레이아웃의 입력칸 위치. 라벨 w-20(5rem) + gap-1(0.25rem) + pl-1(0.25rem) = 5.5rem
const alignClass = computed(() => ({
  'left': 'justify-start pl-[5.5rem]',
  'right': 'justify-end',
  'no-field': 'justify-start'
}[props.align]))

const is로딩중 = defineModel<boolean>('isDoing', { required: false, default: false })

const doClick = async () => {
  if (props.disabled || is로딩중.value)
    return
  if (!props.onClick)
    return

  is로딩중.value = true
  try {
    await props.onClick()
  } finally {
    is로딩중.value = false
  }
}
</script>

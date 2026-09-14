<template>
  <UTooltip
    :text="label"
    :disabled="!is글자숨김"
  >
    <button
      type="button"
      :disabled="isDisabled"
      :aria-label="is글자숨김 ? label : undefined"
      :aria-disabled="state !== 'idle' || undefined"
      :aria-busy="state === 'loading' || undefined"
      :aria-pressed="active"
      :class="[
        'group relative inline-flex items-center justify-center gap-1.5 grow-0 shrink-0 font-medium rounded-lg transition-colors',
        // 여백·글자크기는 두 모드가 같다. 읽기모드에서 `px-0 py-0 text-sm` 로 줄여 놨었는데,
        // 그러면 뒤집을 때 칩이 10px 오른쪽으로 밀리며 줄 높이도 같이 바뀐다(`_.ts` 의 `_읽기base`
        // 머리말과 같은 사정). 읽기모드 칩은 **수정모드 칩에서 껍데기만 벗긴 것**이다.
        'px-2 py-1 text-xs',
        // 읽기모드엔 고를 게 없으니 '골라진 칸'으로 보일 필요도 없다. 값만 남긴다.
        state === 'readonly'
          ? 'text-highlighted'
          : [스킨.칸(active), 스킨.글자(active)],
        state === 'idle'
          ? 'cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'
          : 'cursor-default',
        state === 'disabled' ? 'pointer-events-none opacity-60' : '',
        state === 'loading' ? 'pointer-events-none opacity-75' : ''
      ]"
      @click="onClick"
    >
      <UIcon
        v-if="state === 'loading' && active"
        name="i-lucide-loader-circle"
        class="size-4 shrink-0 animate-spin"
      />
      <UIcon
        v-else-if="icon || color"
        :name="icon ?? 'i-mdi-circle'"
        class="size-4 shrink-0"
        :class="iconClass"
      />
      <slot v-if="!is글자숨김" />
    </button>
  </UTooltip>
</template>

<script setup lang="ts">
/**
 * 세그먼티드 한 칸. 껍데기(`선택기.vue`·`S.vue` 의 radio 가지)가 이 칩들을 담는다.
 *
 * **생김새는 여기 없다** — 껍데기·칸·글자 전부 `m/테마/세그먼티드.ts` 가 준다
 * (껍데기 = 재질 축, 고른 칸 = 고름 축). 테마 pane 의 축 줄(`m/테마/축줄s.vue`)·탭(`m/Tabs.vue`)이
 * 같은 스킨을 읽는다. 전에는 셋이 각자 그렸고, 그래서 손잡이를 돌려도 안 움직였다.
 */
import { computed } from 'vue'
import { useSegmentSkin } from '~base-comps/m/_스킨'

type State = 'idle' | 'readonly' | 'disabled' | 'loading'
type SemanticColor = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'

const props = withDefaults(defineProps<{
  active?: boolean
  state?: State
  icon?: string
  color?: SemanticColor
  /**
   * 칸이 좁을 때 글자를 걷는다(`_use아이콘만.ts`). 글자는 툴팁·`aria-label` 로 옮긴다.
   * 고른 칩은 껍데기가 이 값을 안 준다 — 등급 아이콘(4·3·2·1 상자)처럼 글자 없이는 뜻이 안 서는 게 있어서,
   * 적어도 지금 값은 읽혀야 한다.
   */
  아이콘만?: boolean
  /** 툴팁·`aria-label` 용 글자. 슬롯은 모양이라 여기서 못 읽는다. */
  label?: string
}>(), {
  active: false,
  state: 'idle',
  아이콘만: false
})

/** 아이콘이 없으면 걷을 수 없다 — 빈 칩이 된다. */
const is글자숨김 = computed(() => props.아이콘만 && !!(props.icon || props.color))

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const 스킨 = useSegmentSkin()

const isDisabled = computed(() => props.state === 'disabled' || props.state === 'loading')

const onClick = (event: MouseEvent) => {
  if (props.state !== 'idle') return
  emit('click', event)
}

const iconClassMap: Record<SemanticColor, string> = {
  primary: 'text-primary!',
  secondary: 'text-secondary!',
  success: 'text-success!',
  info: 'text-info!',
  warning: 'text-warning!',
  error: 'text-error!',
  neutral: 'text-muted!'
}

const iconClass = computed(() => {
  if (!props.active) return ''
  if (props.color) return iconClassMap[props.color]
  return 'text-primary'
})
</script>

<template>
  <!--
    도크 목록의 한 줄. 이 줄이 **곧 전환기**다 — 누르면 이 pane 이 그 자리에서 펴지고
    나머지는 위아래로 밀린다(`lDock` 이 슬롯을 활성 줄 뒤에 끼워 넣는다).

    **줄 전체가 누르는 자리다.** 아이콘만한 과녁을 겨냥하게 두지 않는다 —
    폭이 28rem 이라 이름까지 다 들어가고, 들어가면 안 숨길 이유가 없다.
    (옛 알약 탭은 비활성이면 아이콘만 남겼다. 다섯 개까지 한 줄에 세우려던 값인데,
     세로로 쌓으니 그 제약 자체가 없어졌다 — 이름은 늘 보인다.)
  -->
  <div
    class="group flex shrink-0 items-center gap-1 px-4"
    :class="활성 ? 'bg-elevated/40' : ''"
  >
    <button
      type="button"
      class="flex min-w-0 grow items-center gap-2 py-2 text-start text-sm"
      :class="활성 ? 'font-semibold text-highlighted' : 'text-muted'"
      :aria-expanded="활성"
      @click="emit('열기')"
    >
      <!-- 펴짐/접힘은 꺾쇠가 진다. pane 아이콘은 정체를, 꺾쇠는 상태를 말한다 -->
      <UIcon
        :name="활성 ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right'"
        class="size-4 shrink-0 text-dimmed"
      />
      <UIcon
        :name="pane.icon"
        class="size-4 shrink-0"
      />
      <span class="truncate">{{ 라벨 }}</span>
      <UBadge
        v-if="뱃지"
        size="sm"
        variant="solid"
        :label="String(뱃지)"
      />
    </button>

    <!-- pane 전용 액션(도우미면 '대화 초기화'). 활성일 때만 — 접힌 pane 을 조작할 일은 없다 -->
    <template v-if="활성">
      <mButton
        v-for="(action, i) in 액션s"
        :key="i"
        :icon="action.icon"
        :disabled="action.disabled"
        역할="조용"
        size="xs"
        :aria-label="action.label"
        :title="action.label"
        @click="action.onClick()"
      />
    </template>

    <!--
      × 는 `onClose` 를 준 pane 에만. 무엇을 잃는지(초안 등)는 pane 만 아니까 묻는 것도 pane 몫이다.
      줄 버튼 **안**이 아니라 옆에 둔다 — 버튼 안의 버튼은 안 된다.

      접힌 줄에서는 호버해야 보인다. 늘 붙어 있으면 옮겨가려다 남의 초안을 버린다.
      호버가 없는 기기에서는 그냥 보인다.
    -->
    <button
      v-if="pane.onClose"
      type="button"
      class="rounded-full p-1 text-muted transition-opacity hover:text-highlighted [@media(hover:none)]:opacity-100"
      :class="활성 ? 'opacity-100' : 'opacity-0 focus-visible:opacity-100 group-hover:opacity-100'"
      :aria-label="`${라벨} 닫기`"
      @click="pane.onClose()"
    >
      <UIcon
        name="i-lucide-x"
        class="size-3.5"
      />
    </button>

    <!-- 패널 자신의 크롬(닫기)이 오는 자리. 맨 윗줄에만 붙는다 — `lDock` 참고 -->
    <slot name="끝" />
  </div>
</template>

<script setup lang="ts">
/**
 * 도크 목록의 한 줄 — 라벨·뱃지·활성 pane 의 액션·닫기.
 *
 * `lDock` 에서 두 번(활성 위 / 활성 아래) 도는 v-for 가 이 줄을 그린다. 마크업을 양쪽에
 * 베껴 두면 한쪽만 고치는 날이 오므로 컴포넌트로 뺐다 — DOM 순서를 CSS `order` 로 뒤집는
 * 대신 이렇게 한다(그쪽은 탭 순서가 눈에 보이는 순서와 어긋난다).
 */
import type { DockPaneOptions } from '~/composables/useDock'

const props = defineProps<{
  pane: DockPaneOptions
  활성: boolean
}>()

const emit = defineEmits<{ 열기: [] }>()

const 라벨 = computed(() => toValue(props.pane.label))

const 뱃지 = computed(() => {
  const v = toValue(props.pane.badge)
  return v === 0 || v === '' ? undefined : v
})

const 액션s = computed(() => toValue(props.pane.actions) ?? [])
</script>

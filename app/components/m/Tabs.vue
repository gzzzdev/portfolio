<template>
  <div class="relative h-full min-h-0 flex flex-col">
    <div
      class=" w-full flex flex-row "
      :class="{ 'justify-start': props.side == 'left', 'justify-end': props.side == 'right' }"
    >
      <UTabs
        v-model="model2"
        :items="items2"
        v-bind="passThroughAttrs"
        :size="tabsSize"
        activation-mode="manual"
        :variant="tabsVariant"
        :ui="tabsUi"
      />
      <slot name="top" />
    </div>
    <div class="grow min-h-0 overflow-y-auto">
      <slot
        name="default"
        :active-model="activeModel"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 세그먼티드 탭(`type="segment"`)의 생김새는 여기 없다 — `m/테마/세그먼티드.ts` 가 준다
 * (껍데기 = 재질 축, 고른 칸 = 고름 축). 선택기 칩(`Input/선택기/_pill.vue`)·테마 축 줄
 * (`m/테마/축줄s.vue`)과 같은 스킨을 읽는다.
 */
import { useSegmentSkin } from '~base-comps/m/_스킨'

type TabsSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface TabItem {
  label: string
  value: string | number | boolean
  icon?: string
  disabled?: boolean
}

interface Props {
  side?: 'left' | 'right'
  type?: 'default' | 'segment'
  size?: TabsSize
  disabled?: boolean
  items: TabItem[]
}
const props = withDefaults(defineProps<Props>(), {
  side: 'left',
  type: 'default',
  disabled: false,
  items: () => [{ label: 'A', value: 'A' }, { label: 'B', value: 'B' }, { label: 'C', value: 'C' }]
})

const attrs = useAttrs()

/** 껍데기 생김새는 재질 축이 정한다 */
const 스킨 = useSegmentSkin()

type i값 = string | number | boolean | null

const model = defineModel<i값>({ required: true, default: '0' })

const toTab = (v: i값) => typeof v === 'boolean' ? (v ? 'THIS_IS_TRUE' : 'THIS_IS_FALSE') : v
const fromTab = (v: i값) => v === 'THIS_IS_TRUE' ? true : v === 'THIS_IS_FALSE' ? false : v

const model2 = computed({
  get: () => toTab(model.value),
  set: (v) => {
    if (props.disabled) return
    model.value = fromTab(v)
  }
})

const items2 = computed(() => props.items.map((item) => {
  const normalized = typeof item.value === 'boolean'
    ? { ...item, value: toTab(item.value) }
    : item
  return {
    ...normalized,
    disabled: props.disabled || normalized.disabled
  }
}))

const passThroughAttrs = computed(() => {
  const { ui: _ui, variant: _variant, size: _size, items: _items, ...rest } = attrs as Record<string, any>
  return rest
})

const tabsSize = computed<TabsSize>(() => {
  const size = props.size ?? (attrs as Record<string, any>).size
  if (size === 'xs' || size === 'sm' || size === 'md' || size === 'lg' || size === 'xl') return size
  return 'md'
})

const tabsVariant = computed(() => {
  if (props.type === 'segment') return 'pill'
  return (attrs as Record<string, any>).variant ?? 'link'
})

const tabsUi = computed(() => {
  const triggerCursor = props.disabled ? 'cursor-default' : 'cursor-pointer'

  const commonUi = {
    root: '!items-stretch',
    trigger: triggerCursor,
    list: '!border-b-0 !mb-0 !w-auto'
  }

  const segmentSizeUiMap: Record<TabsSize, { list: string, trigger: string, indicator: string }> = {
    xs: { list: 'rounded-xl p-0.5 gap-0.5', trigger: 'rounded-lg px-2 py-1 text-xs', indicator: 'rounded-lg' },
    sm: { list: 'rounded-xl p-1 gap-0.5', trigger: 'rounded-lg px-2.5 py-1.5 text-xs', indicator: 'rounded-lg' },
    md: { list: 'rounded-2xl p-1.5 gap-1', trigger: 'rounded-xl px-4 py-2 text-sm', indicator: 'rounded-xl' },
    lg: { list: 'rounded-2xl p-1.5 gap-1', trigger: 'rounded-xl px-5 py-2.5 text-sm', indicator: 'rounded-xl' },
    xl: { list: 'rounded-3xl p-2 gap-1.5', trigger: 'rounded-2xl px-6 py-3 text-base', indicator: 'rounded-2xl' }
  }
  const segmentSizeUi = segmentSizeUiMap[tabsSize.value]

  const segmentUi = {
    root: '!w-full !items-stretch',
    list: `!mb-0 !w-full !border-0 ${스킨.value.트랙} ${segmentSizeUi.list}`,
    trigger: `!grow-0 ${triggerCursor} font-medium text-muted hover:text-highlighted data-[state=active]:text-highlighted data-[state=active]:font-semibold transition-colors ${segmentSizeUi.trigger}`,
    indicator: `${스킨.value.칸(true)} ${segmentSizeUi.indicator}`,
    leadingIcon: 'group-data-[state=active]:text-primary'
  }

  const baseUi = props.type === 'segment' ? segmentUi : commonUi
  const userUi = ((attrs as Record<string, any>).ui ?? {}) as Record<string, any>
  return {
    ...baseUi,
    ...userUi
  }
})

const activeModel = computed(() => {
  const _attrs = attrs as Record<string, any>
  const items = Array.isArray(_attrs.items) ? _attrs.items : []

  if (model.value === undefined || model.value === null) return items[0]

  const numericIndex = Number(model.value)
  if (Number.isInteger(numericIndex) && items[numericIndex] !== undefined) {
    return items[numericIndex]
  }

  return items.find((item: any) => item?.value === model.value) ?? items[0]
})
</script>

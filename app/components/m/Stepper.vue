<template>
  <div
    ref="containerRef"
    class="w-full"
  >
    <UStepper
      v-model="modelValue"
      v-bind="stepperProps"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

interface StepperItem {
  slot?: string
  value?: string | number
  title?: string
  description?: string
  icon?: string
  content?: string
  disabled?: boolean
  class?: any
  ui?: {
    item?: any
    container?: any
    trigger?: any
    indicator?: any
    icon?: any
    separator?: any
    wrapper?: any
    title?: any
    description?: any
  }
  [key: string]: any
}

interface Props {
  // exception props (project guideline)
  label?: string
  description?: string

  // UStepper-like props
  as?: any
  items: StepperItem[]
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  color?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'
  orientation?: 'horizontal' | 'vertical'
  autoOrientation?: boolean
  orientationThreshold?: number
  valueKey?: string
  defaultValue?: string | number
  linear?: boolean
  disabled?: boolean
  class?: any
  ui?: any
}

const props = withDefaults(defineProps<Props>(), {
  autoOrientation: true,
  orientationThreshold: 960
})
const modelValue = defineModel<string | number>({
  default: 0
})
const containerRef = ref<HTMLElement | null>(null)
const containerWidth = ref(Number.POSITIVE_INFINITY)
let resizeObserver: ResizeObserver | null = null

const normalizedItems = computed(() =>
  (props.items ?? []).map(item => ({
    ...item,
    ui: {
      ...item.ui,
      // Keep long text readable and aligned.
      title: ['whitespace-normal break-keep', item.ui?.title].filter(Boolean),
      description: ['whitespace-normal break-keep leading-relaxed px-2', item.ui?.description].filter(Boolean)
    }
  }))
)

const syncContainerWidth = () => {
  containerWidth.value = containerRef.value?.clientWidth ?? Number.POSITIVE_INFINITY
}

onMounted(() => {
  syncContainerWidth()
  if (!containerRef.value || typeof ResizeObserver === 'undefined')
    return

  resizeObserver = new ResizeObserver((entries) => {
    const [entry] = entries
    containerWidth.value = entry?.contentRect.width ?? containerRef.value?.clientWidth ?? Number.POSITIVE_INFINITY
  })
  resizeObserver.observe(containerRef.value)
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
})

const resolvedOrientation = computed<'horizontal' | 'vertical'>(() => {
  if (props.orientation)
    return props.orientation

  if (props.autoOrientation === false)
    return 'horizontal'

  const threshold = props.orientationThreshold ?? 960
  return containerWidth.value <= threshold ? 'vertical' : 'horizontal'
})

const stepperProps = computed(() => {
  const {
    label: _label,
    description: _description,
    autoOrientation: _autoOrientation,
    orientationThreshold: _orientationThreshold,
    ...rest
  } = props
  return {
    ...rest,
    items: normalizedItems.value,
    orientation: resolvedOrientation.value
  }
})
</script>

<template>
  <div
    :class="_class"
    class="flex flex-row items-center gap-1 max-w-48"
  >
    <!-- size="xl" 아이폰 문제가 안생김. -->

    <mSlider
      v-model="sliderValue"
      size="lg"
      class="grow cursor-pointer"
      :readonly="readonly"
      :disabled="readonly"
      :min="min"
      :max="max"
      :step="step"
    />

    <template v-if="showLabel">
      <div
        v-if="label"
        class="shrink-0 whitespace-nowrap tabular-nums leading-none"
      >
        {{ label }}
      </div>
      <div
        v-else
        class="shrink-0 whitespace-nowrap tabular-nums leading-none flex items-center gap-1"
        @mouseenter="isHovering = true"
        @mouseleave="onMouseLeave"
      >
        <UInput
          v-if="isEditing"
          ref="manualInputRef"
          v-model="manualValue"
          class="w-24"
          inputmode="numeric"
          autocomplete="off"
          :readonly="readonly"
          :disabled="readonly"
          @focus="onInputFocus"
          @blur="onInputBlur"
        />
        <span
          v-else
          class="cursor-text select-none"
          @click="startEditing"
        >
          {{ displayValue }}
        </span>
        <span
          v-if="displayValue !== '' && displaySuffix"
          class="ml-0.5 text-xs text-muted/80"
        >{{ displaySuffix }}</span>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { _ui, _class } from './_'

interface Props {
  label?: string
  readonly?: boolean
  min?: number
  max?: number
  step?: number
  showLabel?: boolean
  /** 값 뒤에 붙는 단위 (`일`·`%`). 앞에 붙이는 자리는 없다 — 필요해지면 그때 만들 것. */
  suffix?: string
}
const props = withDefaults(defineProps<Props>(), {
  readonly: false,
  showLabel: true
})
const model = defineModel<string | number | null>({ required: false, default: null })
const isHovering = ref(false)
const isClicked = ref(false)
const isInputFocused = ref(false)
const manualInputRef = ref<any>(null)

const sliderValue = computed({
  get: () => {
    const n = Number(model.value)
    if (Number.isNaN(n)) {
      return null
    }

    let clamped = n
    if (typeof props.min === 'number') {
      clamped = Math.max(clamped, props.min)
    }
    if (typeof props.max === 'number') {
      clamped = Math.min(clamped, props.max)
    }
    return clamped
  },
  set: (value: number | null) => {
    model.value = value
  }
})

const isEditing = computed(() => {
  if (props.readonly) {
    return false
  }

  return isHovering.value || isClicked.value || isInputFocused.value
})

const startEditing = () => {
  if (props.readonly) {
    return
  }

  isClicked.value = true
  nextTick(() => {
    const fromExposed = manualInputRef.value?.inputRef as HTMLInputElement | undefined
    const fromElement = (manualInputRef.value?.$el as HTMLElement | undefined)?.querySelector('input') as HTMLInputElement | null
    const input = fromExposed ?? fromElement ?? null
    input?.focus()
    input?.select()
  })
}

const onMouseLeave = () => {
  isHovering.value = false
  if (!isInputFocused.value) {
    isClicked.value = false
  }
}

const onInputFocus = () => {
  isInputFocused.value = true
  isClicked.value = true
}

const onInputBlur = () => {
  isInputFocused.value = false
  if (!isHovering.value) {
    isClicked.value = false
  }
}

const manualValue = computed({
  get: () => {
    if (model.value === null || model.value === undefined) {
      return ''
    }

    return String(model.value).replace(/,/g, '')
  },
  set: (value: string) => {
    const onlyNumber = value.replace(/[^\d]/g, '')
    if (!onlyNumber) {
      model.value = null
      return
    }

    model.value = Number(onlyNumber)
  }
})

const displayValue = computed(() => {
  const n = Number(model.value)
  if (Number.isNaN(n)) {
    return model.value ?? ''
  }

  return Number.isInteger(n)
    ? n.toLocaleString()
    : n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
})

const displaySuffix = computed(() => props.suffix ?? '')
</script>

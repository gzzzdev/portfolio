<template>
  <div
    ref="anchorRef"
    :class="[
      _class,
      'relative size-36 shrink-0 p-1 m-1 border rounded-md bg-default border-accented',
      'cursor-pointer'
    ]"
  >
    <div class="flex size-full items-center justify-center ">
      <UIcon
        v-if="iconName"
        :name="iconName"
        class="size-24 "
        @click="() => useEasys().복사(iconName)"
      />
      <UIcon
        v-else
        name="i-lucide-image"
        class="size-24"
      />
    </div>

    <UPopover
      v-if="!readonly"
      v-model:open="is수정중"
      :reference="anchorRef"
      :content="{ side: 'right', align: 'start', sideOffset: 14 }"
      :ui="{ content: 'z-50 w-80 max-w-[calc(100vw-2rem)] p-3' }"
    >
      <mButton
        v-if="!is수정중"
        size="sm"

        square
        class="absolute right-0 top-0 "
        icon="i-mingcute:edit-line"

        :aria-label="is수정중 ? '편집 취소' : '편집 시작'"
      />

      <template #content>
        <mIconPicker
          v-model="model"
          autofocus
          @select="onSelect"
        />
      </template>
    </UPopover>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { _class } from './_'

interface Props {
  readonly?: boolean
}

withDefaults(defineProps<Props>(), {
  readonly: false
})

const model = defineModel<string | null>({ required: false, default: null })

const iconName = computed(() => model.value?.trim() || '')

const anchorRef = useTemplateRef<HTMLElement>('anchorRef')
const is수정중 = ref(false)

const onSelect = () => {
  is수정중.value = false
}
</script>

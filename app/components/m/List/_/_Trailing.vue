<template>
  <div v-if="true" />
  <div
    v-else-if="hasContent"
    class=" flex flex-row  items-center gap-1 "
    data-no-collapse
    @click.stop
  >
    <div class="grow" />

    <Actions
      v-if="props.actions?.length"
      :actions="props.actions"
      :max="props.max"
      :is압축="props.is압축"
    />
    <div>
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Comment, Fragment, Text, type VNode } from 'vue'
import type { ListCardAction } from '../types'
import Actions from './_Actions.vue'

const slots = useSlots()

const props = withDefaults(defineProps<{
  actions?: ListCardAction[]
  max?: number
  is압축?: boolean
}>(), {
  actions: () => [],
  max: 1,
  is압축: false
})

const isMeaningful = (nodes?: VNode[]): boolean =>
  !!nodes?.some((n) => {
    if (n.type === Comment) return false
    if (n.type === Text) return true
    if (n.type === Fragment) return isMeaningful(n.children as VNode[])
    if (typeof n.children === 'string') return n.children.trim().length > 0
    return true
  })

const hasContent = computed(() =>
  !!props.actions?.length || isMeaningful(slots.default?.())
)
</script>

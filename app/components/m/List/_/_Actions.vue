<template>
  <div
    v-if="props.actions?.length"
    class="flex flex-row shrink-0 items-center justify-end gap-1 mt-3 "
  >
    <div class="grow" />

    <template v-if="!props.is압축">
      <mButton
        v-for="(action, idx) in props.actions"
        :key="idx"
        v-bind="buttonConfig"
        :label="action.label"
        :icon="action.icon"
        :color="action.color"
        :variant="action.variant as any"
        :역할="action.역할"
        :loading="action.loading"
        @click.stop="() => action.onClick?.()"
      />
    </template>

    <template v-else>
      <UFieldGroup
        v-if="overflowItems.length"
        :size="buttonConfig.size"
      >
        <mButton
          v-bind="buttonConfig"
          :label="primaryAction?.label"
          :icon="primaryAction?.icon"
          :color="primaryAction?.color"
          :loading="primaryAction?.loading"
          @click.stop="() => primaryAction?.onClick?.()"
        />
        <mDropdownMenu
          :items="overflowItems"
          :content="{ align: 'center', sideOffset: 0 }"
        >
          <mButton
            v-bind="buttonConfig"
            class="text-muted"
            icon="i-lucide-chevron-down"
            @click.stop
          />
        </mDropdownMenu>
      </UFieldGroup>
      <mButton
        v-else
        v-bind="buttonConfig"
        :label="primaryAction?.label"
        :icon="primaryAction?.icon"
        :color="primaryAction?.color"
        :variant="primaryAction?.variant as any"
        :역할="primaryAction?.역할"
        :size="(primaryAction?.size as any) ?? buttonConfig.size"
        :loading="primaryAction?.loading"
        @click.stop="() => primaryAction?.onClick?.()"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import type { ListCardAction } from '../types'

const props = withDefaults(defineProps<{
  actions?: ListCardAction[]
  max?: number
  is압축?: boolean
}>(), {
  actions: () => [],
  max: 1,
  is압축: false
})

const primaryAction = computed(() => props.actions[0])

const overflowItems = computed<DropdownMenuItem[]>(() =>
  props.actions
    .slice(props.max)
    .map(action => ({
      label: action.label,
      icon: action.icon,
      color: action.color as DropdownMenuItem['color'],
      onSelect() {
        action.onClick?.()
      }
    }))
)

const buttonConfig = {
  size: 'sm'
} as const
</script>

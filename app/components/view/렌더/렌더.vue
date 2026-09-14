<template>
  <template v-if="modelValue != null">
    <component
      :is="resolveComp(modelValue.comp)"
      v-bind="getProps(modelValue)"
    >
      <!-- valueProp이 있으면 value는 prop으로만 전달 (img src 등이 텍스트 자식으로 새지 않게) -->
      <template v-if="shouldRenderValueText(modelValue)">
        {{ modelValue.value }}
      </template>
      <template
        v-for="(child, cidx) in getChildren(modelValue)"
        :key="getKey(child, cidx)"
      >
        <View렌더 :model-value="child" />
      </template>
    </component>
  </template>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import { UBadge, UAvatar, MIcon, MQR, MFit } from '#components'
import {
  renderCompKey,
  renderValueProp,
  type RenderComp,
  type RenderCompKey,
  type RenderItem
} from './renderComps'

defineOptions({ name: 'View렌더' })

defineProps<{ modelValue?: RenderItem | null }>()

const compMap = {
  div: 'div',
  img: 'img',
  UBadge,
  UAvatar,
  MIcon,
  MQR,
  MFit
} as const satisfies Record<RenderCompKey, Component | string>

const resolveComp = (comp: RenderComp) => compMap[renderCompKey(comp)]

const hasChildren = (item: RenderItem) => {
  const children = item.children
  if (children == null)
    return false
  return Array.isArray(children) ? children.length > 0 : true
}

const shouldRenderValueText = (item: RenderItem) => {
  if (item.value == null || item.value === '' || hasChildren(item))
    return false
    // valueProp이 있으면 value는 prop 전용 (div 등 valueProp 없는 컴포넌트만 텍스트 노드)
  return renderValueProp(renderCompKey(item.comp)) == null
}

const getChildren = (item: RenderItem): RenderItem[] => {
  const children = item.children
  if (children == null)
    return []
  return Array.isArray(children) ? children : [children]
}

const getKey = (node: RenderItem, idx: number) =>
  node.key ?? `${renderCompKey(node.comp)}-${idx}`

const getProps = (item: RenderItem) => {
  const base = { ...(item.props ?? {}) }
  if (item.value == null || item.value === '')
    return base
  const valueProp = renderValueProp(renderCompKey(item.comp))
  if (valueProp != null && (base as Record<string, unknown>)[valueProp] == null)
    return { ...base, [valueProp]: item.value }
  return base
}
</script>

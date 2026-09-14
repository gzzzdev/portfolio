<template>
  <component
    :is="comp1"
    :indicator="props.hasBullet ? 'start' : 'hidden'"
    class="cursor-pointer"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
import comp1 from './_/style1.vue'
import comp2 from './_/style2.vue'

interface Props {
  style?: 1 | 2// 'style1' | 'style2' //| 'style3'
  hasBullet?: boolean
}
const props = withDefaults(defineProps<Props>(), { style: 1, hasBullet: false })

const attrs = useAttrs()
</script>

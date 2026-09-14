<template>
  <div class="w-full h-full">
    <NuxtImg
      v-if="props.type == 'server'"
      :src="src2"
      :class="class"
      sizes="100vw sm:50vw md:400px"
      format="avif,webp"
      loading="lazy"
      v-slot="{ src, isLoaded, imgAttrs }"
      quality="80"
      @error="onError"
    >
      <USkeleton
        v-if="!isLoaded"
        class="w-full h-24"
        :class="class"
      />
      <img
        v-else
        :src="src"
        v-bind="imgAttrs"
        :class="class"
        decoding="async"
        @error="onError"
        @load="onLoad"
      >
    </NuxtImg>
    <template v-else>
      <USkeleton
        v-if="loading"
        class="w-full h-24"
        :class="class"
      />
      <img
        v-show="!loading"
        :src="src2"
        :class="class"
        decoding="async"
        @error="onError"
        @load="onLoad"
      >
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props { src: string, class?: string, type?: 'client' | 'server' }
const props = withDefaults(defineProps<Props>(), {
  class: 'w-full h-full object-scale-down',
  type: 'server'
})

const loading = ref(true)
const src2 = ref(props.src)

watch(() => props.src, (v: string) => {
  loading.value = true
  src2.value = v
})

const onLoad = () => {
  loading.value = false
}

const onError = (e) => {
  console.log(e)
  loading.value = false
  src2.value = 'https://cdn0.iconfinder.com/data/icons/one-line-2/1000/business___thought_idea_innovative_innovation_lightbulb_brainstorm_mind_people-1024.png'
}
</script>

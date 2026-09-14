<template>
  <div class="h-full w-full overflow-hidden">
    <mNaverMap2 :model-value="지도" />
  </div>
</template>

<script setup lang="ts">
import mNaverMap2, { model네이버지도 } from './.mNaverMap2.vue'

const 지도 = new model네이버지도()
</script>

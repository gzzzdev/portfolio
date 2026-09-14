<template>
  <transition
    enter-active-class="transition duration-700 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-100 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isOn"
      class="relative h-full w-full overflow-hidden rounded-md"
      :class="is영화관Local ? 'bg-black' : ''"
    >
      <view유튜브플레이어
        v-if="showVideo"
        :key="viewKey"
        v-model:is영화관="is영화관Local"
        v-model:watched-time="watchedTime"
        v-model:duration="duration"
        :url="url"
        :autoplay="merged.config.autoplay"
        :mute="merged.config.mute"
        :show-sound="merged.show.sound"
        :can-move="merged.config.canMove"
        :start-time="startTime"
        class="relative z-10 h-full w-full "
        @on종료="emit('on종료')"
      />
      <div
        v-if="showOverlay"
        class="absolute inset-0 z-30 h-full w-full bg-black transition-opacity duration-700"
        @pointerdown.stop
        @pointerup.stop
        @pointermove.stop
        @mouseenter.stop
        @mouseover.stop
        @mouseleave.stop
      />
    </div>
  </transition>
</template>

<script setup lang="ts">
import view유튜브플레이어 from './_.vue'
import { ref, watch, onMounted, computed } from 'vue'
import { merge_i설정, type i설정부분 } from './설정'

interface Props {
  url: string
  설정?: i설정부분
}

const props = defineProps<Props>()

const merged = computed(() => merge_i설정(props.설정))

const emit = defineEmits(['on재생', 'on일시정지', 'on종료'])

const is영화관 = defineModel<boolean>('is영화관', {
  default: false
})
const is영화관Local = ref(is영화관.value)
const watchedTime = defineModel<number>('watchedTime', {
  required: true
})
const duration = defineModel<number>('duration', {
  required: true, default: 0
})

const startTime = defineModel<number>('startTime', {
  required: true
})

// viewKey가 바뀌면 view 컴포넌트가 재생성됨
const viewKey = ref(0)

function recreateView() {
  startTime.value = watchedTime.value
  viewKey.value++
}
const isOn = ref(false)
const showVideo = ref(false)
const showOverlay = ref(false)

watch(
  is영화관,
  (v) => {
    is영화관Local.value = !!v
  },
  { immediate: true }
)

watch(isOn, (val) => {
  if (val) {
    showVideo.value = true
    showOverlay.value = true
    setTimeout(() => {
      emit('on재생')
      showOverlay.value = false
    }, 1400)// 이벤트 받아서 처리하기.

    // 약 3초 후 오버레이 제거
  } else {
    emit('on일시정지')
    showVideo.value = false
    showOverlay.value = false
  }
})
const Control = {
  재생토글: () => {
    isOn.value = !isOn.value
  },
  일시정지: () => {
    isOn.value = false
  },
  파괴: () => {

  }

}

onMounted(() => {
  if (merged.value.config.is바로시작) isOn.value = true
})
</script>

<style>
.fullscreen-action-menu{
    display: none !important;
}
</style>

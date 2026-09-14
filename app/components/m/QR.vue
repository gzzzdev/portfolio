<template>
  <div
    ref="qrContainer"
    class="inline-block"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useThemeStore } from '~/stores/useThemeStore'

const props = withDefaults(defineProps<{
  modelValue: string
  size?: number
  radius?: number
  fill?: string
  background?: string
  ecLevel?: 'L' | 'M' | 'Q' | 'H'
}>(), {
  size: 160
})

const qrContainer = ref<HTMLElement | null>(null)
const themeStore = useThemeStore()

const render = async () => {
  if (!qrContainer.value || !props.modelValue) return

  // @ts-ignore
  const QrCreator = (await import('qr-creator')).default

  qrContainer.value.innerHTML = ''

  QrCreator.render({
    text: props.modelValue,
    radius: props.radius ?? themeStore.radius ?? 0, // props가 없으면 테마의 테두리(radius) 값 적용
    ecLevel: props.ecLevel ?? 'H',
    fill: props.fill ?? themeStore.primary ?? '#000000', // props가 없으면 테마의 기본색 적용
    background: props.background ?? '#ffffff',
    size: props.size
  }, qrContainer.value)
}

onMounted(render)

// onMounted에서만 그리면 size/색/값이 바뀌어도 옛 QR이 남는다.
// 카드가 배율(미리보기 320px ↔ 인쇄 638px)에 따라 size를 바꾸므로 다시 그려야 한다.
watch(
  () => [props.modelValue, props.size, props.fill, props.background, props.radius, props.ecLevel],
  render
)
</script>

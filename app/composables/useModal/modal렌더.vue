<template>
  <div
    ref="rootEl"
    class="relative  overflow-hidden max-h-[90dvh] w-full flex items-center justify-center"
    @mouseenter="isHover = true"
    @mouseleave="isHover = false"
  >
    <div
      class="origin-top"
      :style="{ transform: `scale(${scale})`, marginBottom: marginBot + 'px' }"
    >
      <div class="relative w-max">
        <!-- 캡처 전용 wrapper -->
        <!-- 내부 컨텐츠(명함, 회원증 등)의 실제 크기에 맞춤 -->
        <div
          ref="contentEl"
          class="relative bg-transparent flex justify-center p-4 w-max cursor-pointer"
          @click="downloadPng"
        >
          <View렌더
            v-if="modelValue"
            :model-value="modelValue"
            class="select-none!"
          />
          <p
            v-else
            class="text-sm text-error"
          >
            표시할 데이터가 없습니다.
          </p>
        </div>

        <!--
          인쇄 해상도 캡처용 오프스크린 렌더.
          미리보기 폭으로 캡처하면 등급증이 145dpi까지 떨어져 인쇄가 뭉갠다.
          좌표계 카드는 폭 하나로 전체가 확대되므로 `printBuild(인쇄폭)`으로 큰 트리를 그려 그쪽을 찍는다.
          화면 밖(left:-99999px)에 두어 사용자에겐 보이지 않는다.
        -->
        <div
          v-if="printTree"
          ref="printEl"
          class="pointer-events-none fixed top-0 flex w-max justify-center bg-transparent p-4"
          style="left: -99999px"
          aria-hidden="true"
        >
          <View렌더
            :model-value="printTree"
            class="select-none!"
          />
        </div>

        <!-- hover 스크림 + 중앙 아이콘. contentEl 밖이라 캡처 이미지에는 포함되지 않음 -->
        <!-- 카드마다 모서리 radius가 달라(명함·등급증=각짐, 회원증=12px) 외곽선을 따라 그리지 않고
             프리뷰 영역 전체를 각진 막으로 덮는다 -->
        <div
          v-if="modelValue"
          role="button"
          aria-label="PNG 다운로드"
          class="absolute inset-0 z-10 flex cursor-pointer items-center justify-center bg-black/45 transition-opacity duration-200"
          :class="isHover || isCapturing ? 'opacity-100' : 'pointer-events-none opacity-0'"
          @click.stop="downloadPng"
        >
          <UIcon
            :name="isCapturing ? 'i-lucide-loader-circle' : 'i-lucide-download'"
            class="size-10 text-white drop-shadow-md transition-transform duration-200"
            :class="isCapturing ? 'animate-spin' : (isHover ? 'scale-100' : 'scale-90')"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import type { RenderItem } from '~/components/view/렌더/renderComps'

interface Props {
  modelValue?: RenderItem
  title?: string
  filename?: string
  /**
   * 저장(PNG)할 때 쓸 고해상도 트리 생성기. 폭(px)을 받아 같은 카드를 그 폭으로 그린다.
   * 없으면 화면에 보이는 그대로 캡처한다(기존 동작).
   */
  printBuild?: (폭: number) => RenderItem
  /** printBuild에 넘길 폭. 보통 `인쇄폭(종류)` (300dpi) */
  printWidth?: number
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  title: '',
  filename: '',
  printBuild: undefined,
  printWidth: 0
})

const rootEl = ref<HTMLElement | null>(null)
const contentEl = ref<HTMLElement | null>(null)
const printEl = ref<HTMLElement | null>(null)
const printTree = ref<RenderItem | null>(null)
const isCapturing = ref(false)
const isHover = ref(false)

const scale = ref(1)
const marginBot = ref(0)

const adjustScale = () => {
  if (!contentEl.value) return
  // w-full 클래스를 가진 최상위 div의 크기를 기준으로 모달 창 크기 가늠
  const parent = rootEl.value
  if (!parent) return

  const pw = parent.clientWidth
  const ph = parent.clientHeight || window.innerHeight * 0.9

  // 요소의 실제 크기 (렌더링 된 후의 사이즈)
  const elWidth = contentEl.value.clientWidth || 600
  const elHeight = contentEl.value.clientHeight || 800

  // 가로 비율, 세로 비율 중 더 작은 것을 선택하여 영역 내에 핏되도록 함
  const scaleW = pw > 0 ? pw / elWidth : 1
  const scaleH = ph > 0 ? ph / elHeight : 1

  // 최대 1배 (확대 방지)
  const newScale = Math.min(scaleW, scaleH, 1)
  scale.value = newScale

  // scale 적용 후 실제 차지하는 시각적 높이
  const visualHeight = elHeight * newScale
  marginBot.value = visualHeight - elHeight
}

onMounted(() => {
  window.addEventListener('resize', adjustScale)
  nextTick(() => {
    adjustScale()
    setTimeout(adjustScale, 100)
    setTimeout(adjustScale, 500)
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', adjustScale)
})

const downloadPng = async () => {
  if (!import.meta.client || isCapturing.value || !contentEl.value || !props.modelValue) return

  isCapturing.value = true

  // 고해상도 트리를 오프스크린에 먼저 올린다.
  // MFit(폰트 자동 축소)과 MQR(canvas)이 마운트 후 실측·재렌더하므로 넉넉히 기다린다.
  if (props.printBuild && props.printWidth > 0) {
    try {
      printTree.value = props.printBuild(props.printWidth)
      await nextTick()
      await new Promise(resolve => setTimeout(resolve, 400))
    } catch (e) {
      console.error('[modal렌더] 고해상도 렌더 실패, 화면 그대로 캡처합니다', e)
      printTree.value = null
    }
  }

  // 상태 변경 후 UI 업데이트 대기
  await new Promise(resolve => setTimeout(resolve, 150))

  const el = (printTree.value && printEl.value) ? printEl.value : contentEl.value

  try {
    if (document.fonts?.ready) await document.fonts.ready
    const { toPng } = await import('html-to-image')

    // toPng 실행 시 본래의 스케일 없는 원본 사이즈로 그려짐
    const dataUrl = await toPng(el, {
      pixelRatio: 2,
      cacheBust: true,
      backgroundColor: 'transparent'
    })

    const safe = (props.filename || props.title || 'render').replace(/[\\/:*?"<>|]/g, '-').slice(0, 80)
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `${safe}.png`
    a.rel = 'noopener'
    document.body.appendChild(a)
    a.click()
    a.remove()
  } catch (e) {
    console.error(e)
    useAlert().show('다운로드', 'PNG로 저장하지 못했습니다.')
  } finally {
    printTree.value = null
    isCapturing.value = false
  }
}
</script>

<template>
  <div
    ref="host"
    :style="style"
  >
    {{ text }}
  </div>
</template>

<script setup lang="ts">
/**
 * 고정 사각형 안에 텍스트를 "잘리지 않게" 넣는다.
 *
 * 카드 출력물(증서·회원증)에서 이름이 `홍길동...`으로 잘리면 폐기물이므로,
 * 길어지면 자르는 대신 폰트를 줄여서 전부 보이게 한다.
 * 폰트 크기를 이분 탐색으로 직접 줄이므로(transform scale 아님) 캡처해도 선명하다.
 */
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    text?: string
    /** 기준(최대) 폰트 px */
    max?: number
    /** 이 아래로는 줄이지 않는다 (읽을 수 없어지므로) */
    min?: number
    /** 1이면 한 줄, 2 이상이면 그 줄 수까지 허용 */
    lines?: number
    /** lines>1일 때 넘침 판정 기준 높이(px). 없으면 부모 높이 */
    maxHeight?: number
    weight?: string | number
    lineHeight?: number
  }>(),
  { text: '', max: 16, min: 8, lines: 1, weight: 'inherit', lineHeight: 1.1 }
)

const host = ref<HTMLElement | null>(null)
const size = ref(props.max)

const style = computed(() => {
  const multi = props.lines > 1
  return {
    fontSize: `${size.value}px`,
    lineHeight: String(props.lineHeight),
    fontWeight: props.weight,
    width: '100%',
    minWidth: '0',
    overflow: 'hidden',
    ...(multi
      ? {
          display: '-webkit-box',
          WebkitLineClamp: String(props.lines),
          WebkitBoxOrient: 'vertical' as const,
          wordBreak: 'break-word' as const
        }
      : {
          whiteSpace: 'nowrap' as const,
          // 하한(min)까지 줄여도 안 들어가는 예외적인 길이는 글자를 반으로 쪼그라뜨리는 대신
          // 말줄임으로 넘긴다. 하드 클립이면 글자가 중간에서 잘려 더 나쁘다.
          textOverflow: 'ellipsis' as const
        })
  }
})

/** 넘치는지: 한 줄이면 가로만, 여러 줄이면 세로 높이로 판정 */
const overflows = (el: HTMLElement) => {
  if (props.lines <= 1) return el.scrollWidth > el.clientWidth + 0.5
  const limit = props.maxHeight ?? (el.parentElement?.clientHeight || 0)
  return limit > 0 ? el.scrollHeight > limit + 0.5 : false
}

/**
 * Vue 렌더를 거치지 않고 DOM에 직접 써가며 이분 탐색한다.
 * (반복마다 nextTick을 기다리면 12회 × 프레임이 되어 캡처 타이밍을 놓친다)
 */
const fit = () => {
  const el = host.value
  if (!el) return

  const apply = (px: number) => { el.style.fontSize = `${px}px` }

  apply(props.max)
  if (!overflows(el)) { size.value = props.max; return }

  let lo = props.min
  let hi = props.max
  for (let i = 0; i < 14 && hi - lo > 0.25; i++) {
    const mid = (lo + hi) / 2
    apply(mid)
    if (overflows(el)) hi = mid; else lo = mid
  }
  apply(lo)
  size.value = lo
}

const refit = async () => { await nextTick(); fit() }

let ro: ResizeObserver | null = null

onMounted(async () => {
  await refit()
  // 웹폰트가 늦게 오면 글자 폭이 달라진다 → 로드 후 한 번 더
  if (document.fonts?.ready) document.fonts.ready.then(() => fit()).catch(() => { })
  if (typeof ResizeObserver !== 'undefined' && host.value?.parentElement) {
    ro = new ResizeObserver(() => fit())
    ro.observe(host.value.parentElement)
  }
})

onUnmounted(() => ro?.disconnect())

watch(() => [props.text, props.max, props.min, props.lines, props.maxHeight], refit)

defineExpose({ size, fit })
</script>

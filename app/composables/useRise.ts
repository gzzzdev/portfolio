import { computed, onMounted, onUnmounted, ref, toValue, type MaybeRefOrGetter } from 'vue'
import { useIntersectionObserver, usePreferredReducedMotion } from '@vueuse/core'

/**
 * 칸이 화면에 들어올 때 안의 조각들이 시차를 두고 떠오르게 한다. 모양은 `assets/css/rise.css`.
 *
 * `영역`(보통 `<section>`)을 지켜보다가 들어오면 조각에 `rise-enter`, 벗어나면 다시 `rise-prep` —
 * 스크롤로 되돌아오면 또 떠오른다. 조각마다 `v-bind="등장(지연ms)"` 를 붙인다.
 * `:class`·`:style` 를 따로 달아도 Vue 가 합친다.
 *
 * - SSR·첫 그림에선 아무 클래스도 없다 — 글이 숨은 채로 내려오지 않는다.
 * - mount 때 이미 대충 보이는 칸은 바로 떠오르고, 아래 칸만 다음 틱에 숨겨 둔다.
 * - 줄임 모션이면 숨기지 않고 곧장 보인다.
 */
export function useRise(영역: MaybeRefOrGetter<HTMLElement | null | undefined>) {
  const 들어옴 = ref(false)
  const 숨김허용 = ref(false)
  const 모션선호 = usePreferredReducedMotion()
  const 줄임모션 = computed(() => 모션선호.value === 'reduce')
  const 준비 = computed(() => 숨김허용.value && !들어옴.value && !줄임모션.value)

  useIntersectionObserver(() => toValue(영역), ([entry]) => {
    if (!entry) return
    if (entry.isIntersecting) {
      들어옴.value = true
    } else if (!줄임모션.value) {
      들어옴.value = false
      숨김허용.value = true
    }
  }, { threshold: 0.1, rootMargin: '0px 0px -8% 0px' })

  let timer: ReturnType<typeof setTimeout> | undefined
  onMounted(() => {
    if (줄임모션.value) {
      들어옴.value = true
      return
    }
    const r = toValue(영역)?.getBoundingClientRect()
    if (r && r.top < window.innerHeight * 0.92 && r.bottom > r.height * 0.06) {
      들어옴.value = true
      return
    }
    timer = setTimeout(() => {
      if (!들어옴.value) 숨김허용.value = true
    }, 0)
  })
  onUnmounted(() => clearTimeout(timer))

  const 등장 = (지연ms = 0) => ({
    class: { 'rise-prep': 준비.value, 'rise-enter': 들어옴.value },
    style: { '--rise-delay': `${지연ms}ms` }
  })

  return { 들어옴, 등장 }
}

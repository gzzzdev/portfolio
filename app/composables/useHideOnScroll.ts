import { onBeforeUnmount, onMounted, shallowRef } from 'vue'

/**
 * 스크롤 방향에 반응하는 헤더("Headroom" 패턴) 상태.
 *
 * 내리면 `hidden=true`(헤더를 `translateY(-100%)` 로 치우고), 올리면 다시 `false`.
 * 붙이는 쪽은 `position: sticky` 를 그대로 쓰고 transform 만 토글한다 —
 * `display:none`/`fixed` 토글은 문서 흐름을 흔들어 스크롤이 튄다.
 *
 * 흔한 버그를 여기서 미리 막는다:
 * - 관성/미세 스크롤 떨림 → 프레임 단위 델타가 아니라 **누적치(acc)** 가 `threshold` 를 넘을 때만 전환.
 * - iOS 고무줄(scrollY < 0, > max) → 클램프 후 계산.
 * - 최상단 근처(`revealAt`)·맨 아래에서는 무조건 보이게 → 숨은 채로 갇히지 않는다.
 * - SSR → mount 전에는 아무것도 읽지 않고, mount 시점에 초기 상태를 한 번 동기화한다.
 *
 * 스크롤이 `window` 가 아니라 `overflow-y:auto` 컨테이너에서 일어나면 `container` 를 넘긴다.
 * (그 경우 sticky 기준도 그 컨테이너다.)
 */
export interface HideOnScrollOptions {
  /** 상태를 뒤집는 데 필요한 누적 이동량(px). 작을수록 예민하다. */
  threshold?: number
  /** 이 스크롤 위치보다 위면 항상 보인다(px). */
  revealAt?: number
  /** 스크롤 컨테이너. 없으면 window. mount 시점에 한 번 평가된다. */
  container?: () => HTMLElement | Window | null | undefined
  /** false 면 항상 보임(모바일에서만 켜는 식으로 쓴다). */
  enabled?: () => boolean
}

export function useHideOnScroll(options: HideOnScrollOptions = {}) {
  const { threshold = 12, revealAt = 80 } = options

  /** 헤더를 치웠는지 */
  const hidden = shallowRef(false)
  /** 최상단에서 벗어났는지 — 그림자/배경 전환용 */
  const stuck = shallowRef(false)
  /** 현재 스크롤 위치 */
  const y = shallowRef(0)

  if (import.meta.server) return { hidden, stuck, y }

  let target: HTMLElement | Window = globalThis.window
  let lastY = 0
  let acc = 0
  let ticking = false

  function metrics() {
    if (target === window) {
      const doc = document.documentElement
      return { y: window.scrollY, max: doc.scrollHeight - window.innerHeight }
    }
    const el = target as HTMLElement
    return { y: el.scrollTop, max: el.scrollHeight - el.clientHeight }
  }

  function update() {
    ticking = false

    const m = metrics()
    const max = Math.max(m.max, 0)
    const now = Math.min(Math.max(m.y, 0), max) // 고무줄 클램프
    const dy = now - lastY
    lastY = now
    y.value = now
    stuck.value = now > 0

    if (options.enabled && !options.enabled()) {
      hidden.value = false
      acc = 0
      return
    }

    // 최상단 근처와 맨 아래(고무줄 구간)에서는 항상 보인다
    if (now <= revealAt || max - now <= 2) {
      hidden.value = false
      acc = 0
      return
    }

    // 방향이 바뀌면 누적을 버린다 → 진동에 반응하지 않는다
    if ((dy > 0) !== (acc > 0)) acc = 0
    acc += dy

    if (acc > threshold) {
      hidden.value = true
      acc = 0
    } else if (acc < -threshold) {
      hidden.value = false
      acc = 0
    }
  }

  function onScroll() {
    if (ticking) return
    ticking = true
    requestAnimationFrame(update) // 프레임당 한 번만 계산
  }

  onMounted(() => {
    target = options.container?.() ?? window
    lastY = metrics().y
    update() // 새로고침 직후 상태 동기화
    target.addEventListener('scroll', onScroll, { passive: true })
  })

  onBeforeUnmount(() => {
    target?.removeEventListener('scroll', onScroll)
  })

  return { hidden, stuck, y }
}

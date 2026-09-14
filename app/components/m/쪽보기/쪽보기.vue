<template>
  <div
    ref="자리"
    class="relative w-full min-w-0"
  >
    <!--
      **잴 벌 — 늘 서 있고 안 보인다.** 쪽 수는 여기서만 센다. 화면의 벌은 `zoom` 이 걸려 배율 따라
      글자 폭이 흔들릴 수 있어서 배율 1 인 벌 하나로 잰다.
      (그래도 폰 폭에서는 쪽 수가 넓은 화면과 다르다 — 7→8. 본문 블록들이 **화면 폭** 반응형(`sm:` 등)이라
      종이 폭이 같아도 폰에서는 폰 모양으로 선다. 종이 폭으로 반응하려면 컨테이너 쿼리로 바꿔야 한다.)
      크기가 0 인 칸에 잘라 넣어 자리를 안 먹는다. `invisible` 이라도 줄 상자는 잡힌다.
    -->
    <ClientOnly>
      <div
        aria-hidden="true"
        class="pointer-events-none invisible absolute top-0 left-0 size-0 overflow-hidden"
      >
        <article
          ref="잴벌"
          class="m-본문 쪽흐름 absolute top-0 left-0"
          :style="흐름칸style(1)"
        >
          <MDC :value="쪽md" />
        </article>
      </div>
    </ClientOnly>

    <!-- 흐름 — 지금의 읽기 화면 그대로. 화면마다 흐름을 그리는 법이 달라서(편집기 readonly · `<MDC>`) 슬롯이다. -->
    <slot
      v-if="보기 === '흐름'"
      name="흐름"
    >
      <article class="m-본문 w-full overflow-x-auto">
        <ClientOnly>
          <MDC :value="md || '본문이 없습니다.'" />
        </ClientOnly>
      </article>
    </slot>

    <!--
      **쪽 격자.** 1쪽이면 한 줄에 한 장, 2쪽이면 두 장 — 어느 쪽이든 세로로 쌓인다.
      배율은 `zoom` 으로 건다 — `transform` 과 달리 차지하는 크기가 같이 줄어서, 넘치지도 빈 칸을 남기지도 않는다.
      면은 `bg-muted` — 종이(`bg-default`)가 그 위에 떠야 쪽이 쪽으로 읽힌다.
    -->
    <div
      v-else
      class="rounded-lg bg-muted p-3 sm:p-6"
    >
      <ClientOnly>
        <div
          ref="격자"
          class="인쇄판 mx-auto grid"
          :class="{ 모아: 한번에 === 2 }"
          :style="{
            zoom: 배율,
            width: `${격자폭}px`,
            gap: `${쪽.틈}px`,
            gridTemplateColumns: `repeat(${한번에}, ${쪽.폭}px)`
          }"
          @mousedown="따라누르기"
          @click="따라누르기"
          @keydown="따라누르기"
        >
          <div
            v-for="i in 쪽수"
            :key="i"
            class="인쇄쪽"
          >
            <div
              class="인쇄종이 relative overflow-clip rounded-sm bg-default ring-1 ring-default m-층-카드"
              :style="{ width: `${쪽.폭}px`, height: `${쪽.높이}px` }"
            >
              <!-- 창. 줄기를 `i-1` 단만큼 왼쪽으로 민다. 머리말 「어떻게 자르나」. -->
              <article
                class="m-본문 쪽흐름 absolute top-0 text-default"
                :style="흐름칸style(i)"
              >
                <MDC :value="쪽md" />
              </article>
              <!--
                **꼬리말 — 종이 안, 아래 여백 한가운데.** 화면과 인쇄가 같은 그림이어야 해서(요구 3) 종이 밖이 아니라
                안에 둔다. 가장 좁은 여백(15mm ≈ 57px)에도 한 줄은 넉넉히 선다. 왼쪽은 제목(주면), 오른쪽은 「쪽 / 전체」.
                글자 크기는 px 로 적는다 — 종이 전체에 `zoom` 이 걸리므로 화면에서도 종이와 같은 비율로 준다.
              -->
              <footer
                class="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between gap-4 text-[11px] text-dimmed tabular-nums"
                :style="{ height: `${여백px}px`, paddingInline: `${여백px}px` }"
              >
                <span class="truncate">{{ 제목 }}</span>
                <span class="shrink-0">{{ i }} / {{ 쪽수 }}</span>
              </footer>
            </div>
          </div>
        </div>
      </ClientOnly>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * **쪽 보기 판.** md 본문을 한글 문서처럼 **A4 쪽으로 잘라** 1쪽·2쪽으로 세로로 쌓고, 그대로 인쇄한다.
 * 손잡이는 짝인 `m쪽보기손잡이` 고, `/decisions/content/pages` 에서 세워 봤다.
 *
 * 쓰는 곳: `/resources/[id]` 읽기 화면 · 모래밭. 게시글 상세(`m/Boards/Board.vue`)·`/official/enrolls/[id]` 도 같은
 * `<MDC>` 자리라 옮겨 붙일 수 있다.
 *
 * ## 요구 (사람이 시킨 것 — 바꾸지 말 것, 2026-09-14)
 *
 * 1. **가로 스크롤은 어떤 이유로도 없다.** 1쪽이면 종이가 세로로 쌓이고, 2쪽이면 두 장씩 줄지어
 *    **세로로** 내려간다(한글의 2쪽 보기). 폭이 모자라면 넘치지 않고 **줄인다**.
 * 2. **여백은 15·20·30mm** 셋 중에 고른다(`_옵션.ts`).
 * 3. **인쇄는 보기 모양 그대로** — 1쪽이면 A4 세로 한 장에 한 쪽, **2쪽이면 A4 가로 한 장에 두 쪽**(모아 찍기).
 * 4. **보기(흐름·1쪽·2쪽)·여백·인쇄는 본문 길이와 상관없이 늘 다 있다**(2026-09-14 사람이 정함 — 한 장이면
 *    보기 고르기를 걷던 안을 거쳐 뒤집었다). 한 장을 2쪽으로 펴면 오른쪽이 비는 건 그대로 둔다.
 *
 * ## 어떻게 자르나 — 다단 한 줄기 + 쪽마다 창
 *
 * **글의 흐름은 다단이 자른다.** 흐름 칸의 높이를 A4 로 못박고 `column-fill: auto` 를 주면 넘친 글이
 * 오른쪽 단으로 흘러간다. 단 폭 = 종이 폭 − 좌우 여백, 단 간격 = 좌우 여백 × 2 로 두면 `i` 번째 단이
 * 정확히 `i × 종이 폭` 만큼 오른쪽에 있다. **문단 중간에서도 쪽이 넘어간다** — 블록 단위로 자르는 것보다 한글에 가깝다.
 *
 * **그 줄기를 종이마다 창으로 들여다본다.** 다단은 넘친 단을 가로로만 늘어놓는데 요구 1 이 가로를 막아서,
 * 종이 한 장마다 같은 줄기를 한 벌씩 세우고 `i` 번째 단만 보이게 옆으로 밀어 `overflow: clip` 으로 자른다.
 * 종이는 그냥 격자라 세로로 쌓인다. (`hidden` 이 아니라 `clip` 인 이유 — `hidden` 은 스크롤 칸이라 창 안의
 * 탭에 초점이 가면 브라우저가 창을 스스로 굴려서 단이 어긋난다.)
 *
 * **한 벌이 아니라서 생기는 일 둘을 막는다.**
 *
 * - **늦게 불러오는 사진(`loading="lazy"`)** — 잘려 안 보이는 벌은 사진을 안 불러와서 높이가 0 이 되고,
 *   그 벌만 글이 위로 당겨진다. 쪽 모드에서는 전부 `eager` 로 돌린다.
 * - **탭·접기** — 한 벌에서 누르면 그 벌만 높이가 바뀌어 쪽이 어긋난다. 사람이 누른 사건(`isTrusted`)을
 *   다른 벌의 **같은 자리**(자식 순번 길)에 그대로 다시 쏜다. 링크는 안 쏜다(여러 번 이동한다).
 *   초점만으로 바뀌는 것(방향키로 탭 옮기기)은 아직 안 따라간다.
 *
 * ## 아는 한계
 *
 * - **긴 글이 무겁다.** 벌이 쪽 수만큼 선다 — 50쪽이면 본문 50벌. 지금 자료는 1,300~2,000자라 한두 쪽이지만
 *   상한이 10만 자다(`model자료` 의 `자료본문상한`). 긴 글이 들어오면 화면 근처 쪽만 그리게 바꿔야 한다.
 * - **제목 id 가 벌 수만큼 겹친다.** `#제목` 으로 바로 가는 링크를 만들면 첫 벌(1쪽 창)로 간다.
 * - 쪽 나누기(한글의 Ctrl+Enter), 머리말, 꼬리말 고르기(지금은 제목·쪽 번호로 고정), A4 말고 다른 쪽 크기는 없다.
 */
import { useEventListener, useMutationObserver, useResizeObserver } from '@vueuse/core'
import { 기본여백mm, type i쪽보기, type i저장형식 } from './_옵션'

const props = withDefaults(defineProps<{
  md: string | null
  /** 주면 쪽 첫머리에 제목(`#`)으로 얹는다 — 본문이 제목으로 시작하지 않는 화면(자료)에서 인쇄물에 제목이 남게. */
  제목?: string
  여백mm?: number
}>(), { 제목: undefined, 여백mm: 기본여백mm })

const 보기 = defineModel<i쪽보기>('보기', { default: '흐름' })

const 쪽md = computed(() => {
  const 본문 = props.md || '본문이 없습니다.'
  return props.제목 ? `# ${props.제목}\n\n${본문}` : 본문
})
const 한번에 = computed(() => (보기.value === '2쪽' ? 2 : 1))

// ── 종이 ────────────────────────────────────────────────────────────────
/** A4 (210×297mm) 를 96dpi px 로. `틈` 은 격자에서 종이 사이 — 다단 계산과는 무관하다(창마다 따로 민다). */
const 쪽 = { 폭: 794, 높이: 1123, 틈: 24 }
const 격자폭 = computed(() => 한번에.value * (쪽.폭 + 쪽.틈) - 쪽.틈)
/** 96dpi 에서 1mm = 96 / 25.4 px. */
const 여백px = computed(() => Math.round(props.여백mm * 96 / 25.4))

const 쪽수 = ref(1)

/** 흐름 칸 한 벌의 자리·크기. `i` 번째 종이의 창이면 줄기를 `i-1` 단만큼 왼쪽으로 민다. 잴 벌은 `i = 1`. */
function 흐름칸style(i: number) {
  return {
    left: `${-(i - 1) * 쪽.폭}px`,
    width: `${쪽.폭}px`,
    height: `${쪽.높이}px`,
    padding: `${여백px.value}px`,
    columnGap: `${여백px.value * 2}px`
  }
}

// ── 배율 — 늘 맞춘다. 100% 로 두면 넘치고, 넘치면 가로 스크롤이다(요구 1). ─────────
const 자리 = ref<HTMLElement | null>(null)
const 자리폭 = ref(0)
useResizeObserver(자리, (es) => {
  자리폭.value = es[0]!.contentRect.width
})
/** 격자를 감싼 면의 안쪽 여백(`p-3`·`sm:p-6`)만큼 뺀다. */
const 배율 = computed(() => {
  if (!자리폭.value) return 1
  const 여백 = 자리폭.value < 640 ? 24 : 48
  return Math.min(1, (자리폭.value - 여백) / 격자폭.value)
})

// ── 쪽 세기 ─────────────────────────────────────────────────────────────
const 잴벌 = ref<HTMLElement | null>(null)
const 격자 = ref<HTMLElement | null>(null)
let 잴예약 = 0

/**
 * **가장 오른쪽 단이 몇 번째 종이 몫인가.** 잴 벌의 줄 상자 중 왼쪽 끝이 가장 먼 것을 본다.
 * 끝에 표식 요소를 두면 그 요소가 제 줄을 차지해서, 글이 단을 꽉 채운 날 빈 쪽이 하나 더 생긴다.
 */
function 재기() {
  const el = 잴벌.value
  if (!el) return
  // 잘려 안 보이는 벌(잴 벌 포함)의 사진도 높이를 가져야 벌끼리 안 어긋난다. 머리말 「한 벌이 아니라서」.
  const 사진s = [...(자리.value?.querySelectorAll<HTMLImageElement>('.쪽흐름 img') ?? [])]
  사진s.forEach((img) => {
    if (img.loading === 'lazy') img.loading = 'eager'
  })
  const 칸 = el.getBoundingClientRect()
  const r = document.createRange()
  r.selectNodeContents(el)
  let 끝 = 0
  for (const 상자 of r.getClientRects()) {
    if (상자.width || 상자.height) 끝 = Math.max(끝, 상자.left)
  }
  const 번째 = Math.floor((끝 - 칸.left - 여백px.value) / 쪽.폭)
  쪽수.value = Math.max(1, 번째 + 1)
}
function 재기예약() {
  cancelAnimationFrame(잴예약)
  잴예약 = requestAnimationFrame(재기)
}

// `<MDC>` 는 파싱을 기다렸다 그리고, 사진은 늦게 들어와 높이를 바꾸고, 새 벌이 서면 그 사진도 돌려야 한다.
useMutationObserver(자리, 재기예약, { childList: true, subtree: true, characterData: true })
watch([쪽md, 여백px, 잴벌, 격자], 재기예약)
watch(자리, (el, 옛) => {
  옛?.removeEventListener('load', 재기예약, { capture: true })
  el?.addEventListener('load', 재기예약, { capture: true })
})

// ── 인쇄 ────────────────────────────────────────────────────────────────
/**
 * **쪽 격자를 그대로 종이로 낸다.** 종이 한 장이 이미 A4 크기라서 인쇄는 「종이 말고 다 걷고, 배율을 1 로」면 된다
 * (아래 전역 `<style>` 의 `@media print`). 흐름 중에 누르면 1쪽으로 바꿔 쪽을 세운 뒤 낸다.
 * 두 쪽을 가로로 붙이면 297×210mm 라 A4 가로에 그대로 들어간다 — 배율은 210/297 ≈ 0.707.
 * 사진이 덜 들어온 채 내면 빈 자리로 찍히므로 다 들어올 때까지 기다린다(최대 5초).
 */
const 인쇄준비중 = ref(false)

/**
 * `@page` 크기는 선택자로 못 가른다 — 종이 방향만 머리에 따로 꽂는다. 나머지 인쇄 규칙은 아래 전역 `<style>`.
 * (CSS `page` 속성 + 이름 붙은 `@page` 로도 되지만 브라우저 지원이 아직 고르지 않다.)
 */
useHead({
  style: [{
    key: '쪽보기-종이방향',
    innerHTML: computed(() => `@media print { @page { size: A4 ${한번에.value === 2 ? 'landscape' : 'portrait'}; margin: 0; } }`)
  }]
})

/**
 * **찍는 동안만 밝은 테마다.** 어두운 테마 그대로 찍으면 밝은 글자가 흰 종이에 앉아 안 읽힌다.
 * 테마는 `<html>` 의 `dark`/`light` 클래스(`@nuxtjs/color-mode`)라 CSS 만으로는 못 뒤집는다 —
 * 토큰이 `.dark {…}` 에 산다(`mTheme.css`). 그래서 `beforeprint` 에 클래스를 바꿔 끼우고 `afterprint` 에 되돌린다.
 * `useColorMode()` 를 안 쓰는 이유: 그건 사람의 선택이라 localStorage 에 남는다. 여기는 한순간 옷만 갈아입는다.
 * 인쇄 버튼이든 Ctrl+P 든 두 사건은 똑같이 온다. 인쇄 창이 떠 있는 동안 뒤 화면도 밝아지는 건 그대로 둔다.
 */
let 찍기전어두움 = false
/**
 * **찍는 동안 탭 제목도 자료 제목이다.** 인쇄 창의 「PDF로 저장」은 탭 제목을 파일 이름으로 내서,
 * 안 바꾸면 어느 자료든 사이트 이름 하나로 저장된다. 테마와 같은 두 사건에 얹는다.
 */
let 찍기전제목: string | null = null
useEventListener('beforeprint', () => {
  const c = document.documentElement.classList
  찍기전어두움 = c.contains('dark')
  if (찍기전어두움) c.replace('dark', 'light')
  if (props.제목) {
    찍기전제목 = document.title
    document.title = props.제목
  }
})
useEventListener('afterprint', () => {
  if (찍기전어두움) document.documentElement.classList.replace('light', 'dark')
  찍기전어두움 = false
  if (찍기전제목 !== null) document.title = 찍기전제목
  찍기전제목 = null
})

async function 인쇄() {
  인쇄준비중.value = true
  const 이전 = 보기.value
  /**
   * 인쇄 창이 닫힌 뒤 흐름으로 돌아온다. `window.print()` 가 창이 닫힐 때까지 멈추는 브라우저(크롬)도 있고
   * 바로 돌아오는 브라우저(사파리)도 있어서, 멈춘 뒤에 되돌리면 사파리에서는 찍기 전에 판이 사라진다 — `afterprint` 를 기다린다.
   */
  const 되돌리기 = () => {
    if (이전 === '흐름') 보기.value = '흐름'
  }
  window.addEventListener('afterprint', 되돌리기, { once: true })
  try {
    if (보기.value === '흐름') 보기.value = '1쪽'
    const 끝 = Date.now() + 5000
    const 한틀 = () => new Promise(r => requestAnimationFrame(r))
    while (Date.now() < 끝) {
      await 한틀()
      const 사진s = [...(격자.value?.querySelectorAll('img') ?? [])]
      if (격자.value?.textContent?.trim() && 사진s.every(img => img.complete)) break
    }
    await 한틀()
    await 한틀()
    window.print()
  } finally {
    인쇄준비중.value = false
  }
}

// ── 저장 ────────────────────────────────────────────────────────────────
/**
 * **PDF 는 인쇄 길, DOCX 는 파일.** PDF 를 따로 짓지 않는 이유 — 브라우저에서 지으면 글자가 그림으로 굳고,
 * 서버에서 지으면 헤드리스 브라우저를 들여야 한다. 인쇄 창의 「PDF로 저장」이 글자를 글자로 남기는 가장 싼 길이다.
 * DOCX·HWPX 는 지금 보기(흐름·1쪽·2쪽)와 상관없이 A4 한 쪽씩이다 — 워드·한글에는 모아 찍기가 없다.
 * PPTX 는 종이가 아니라 장이라 여백을 안 받는다.
 * 짓는 길은 각 파일 머리말(`~utils/mdc/docx`·`pptx`·`hwpx`). 전부 누를 때 불러온다.
 */
const 저장중 = ref<i저장형식 | null>(null)
async function 저장(형식: i저장형식) {
  if (형식 === 'pdf') return 인쇄()
  if (저장중.value) return
  저장중.value = 형식
  try {
    const 옵션 = { 제목: props.제목, 여백mm: props.여백mm }
    const md = props.md ?? ''
    const blob = 형식 === 'docx'
      ? await (await import('~utils/mdc/docx')).md에서docx(md, 옵션)
      : 형식 === 'pptx'
        ? await (await import('~utils/mdc/pptx')).md에서pptx(md, 옵션)
        : await (await import('~utils/mdc/hwpx')).md에서hwpx(md, 옵션)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    // 파일 이름에 못 쓰는 글자(`/\:*?"<>|`)만 바꾼다. 한글은 그대로 둔다.
    a.download = `${(props.제목 || '본문').replace(/[/\\:*?"<>|]/g, '_')}.${형식}`
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  } finally {
    저장중.value = null
  }
}

// ── 벌끼리 맞추기 ────────────────────────────────────────────────────────
/** 흐름 칸에서 그 요소까지 자식 순번 길. 벌마다 같은 md 를 그려서 같은 길이 같은 요소다. */
function 길(el: Element, 뿌리: Element): number[] | null {
  const 순번s: number[] = []
  let 지금: Element | null = el
  while (지금 && 지금 !== 뿌리) {
    const 부모: Element | null = 지금.parentElement
    if (!부모) return null
    순번s.unshift(Array.prototype.indexOf.call(부모.children, 지금))
    지금 = 부모
  }
  return 지금 ? 순번s : null
}

/** 사람이 한 벌에서 누른 것을 다른 벌의 같은 자리에 다시 쏜다. 다시 쏜 것(`isTrusted` 거짓)은 안 퍼뜨린다. */
function 따라누르기(e: Event) {
  if (!e.isTrusted || !(e.target instanceof Element)) return
  if (e.target.closest('a')) return
  const 뿌리 = e.target.closest('.쪽흐름')
  if (!뿌리 || !자리.value) return
  const p = 길(e.target, 뿌리)
  if (!p) return
  // 잴 벌에도 쏜다 — 접기를 펴서 글이 길어지면 쪽 수도 따라 늘어야 한다.
  for (const 다른 of 자리.value.querySelectorAll('.쪽흐름')) {
    if (다른 === 뿌리) continue
    let 짝: Element | undefined = 다른
    for (const n of p) 짝 = 짝?.children[n]
    if (!짝) continue
    const 틀 = e.constructor as new (type: string, init: Event) => Event
    짝.dispatchEvent(new 틀(e.type, e))
  }
}

defineExpose({ 인쇄, 저장, 쪽수, 배율, 인쇄준비중, 저장중 })
</script>

<style scoped>
/*
 * 다단의 뼈대. `column-fill: auto` 가 없으면 브라우저가 단 높이를 고르게 나눠 버려서 쪽이 안 찬다.
 * 자르면 안 되는 것 — 사진·표·알림 상자·나란히. 제목은 제 문단과 떨어져 쪽 맨 아래 혼자 남지 않게.
 */
.쪽흐름 {
  columns: 1;
  column-fill: auto;
  orphans: 2;
  widows: 2;
}
.쪽흐름 :deep(:is(figure, table, pre, blockquote, img, .rounded-lg)) {
  break-inside: avoid;
}
.쪽흐름 :deep(:is(h1, h2, h3, h4)) {
  break-after: avoid;
}
.쪽흐름 :deep(> div > :first-child) {
  margin-top: 0;
}
</style>

<style>
/*
 * **인쇄 — 쪽 격자만 종이로.** 전역이라 `body:has(.인쇄판)` 으로 판이 선 화면에만 걸어 둔다 —
 * 안 그러면 이 CSS 가 한 번 실린 뒤 다른 화면에서 인쇄할 때 전부 걷혀 빈 종이가 나온다.
 * 흐름 보기에서 브라우저 인쇄(Ctrl+P)를 하면 판이 없으니 평소 인쇄 그대로다.
 *
 * - 격자의 조상이 아닌 것은 다 걷는다(머리·손잡이 줄). 쪽 번호는 종이 안 꼬리말이라 같이 찍힌다.
 * - 격자의 조상은 여백·면·폭 제한을 푼다 — 남겨 두면 첫 장이 그만큼 밀려 쪽이 한 칸씩 어긋난다.
 * - 격자는 배율 1, 한 줄에 한 장, 종이는 A4 그대로에 한 장씩 끊는다.
 * - **2쪽(`.모아`)이면** 한 줄에 두 장을 0.705 배로 줄여 A4 가로 한 장에 담고, 두 장마다 끊는다.
 *   딱 맞는 값(0.707)이면 반올림으로 1px 넘쳐 빈 종이가 끼어서 조금 덜 줄인다. 종이 방향은 `useHead` 가 꽂는다.
 *
 * **어두운 테마는 찍는 동안만 밝은 테마로 바꾼다** — 이 CSS 가 아니라 스크립트의 `beforeprint` 가 한다.
 */
@media print {
  body:has(.인쇄판) *:not(:has(.인쇄판), .인쇄판, .인쇄판 *) {
    display: none !important;
  }
  body:has(.인쇄판) :has(.인쇄판) {
    display: block !important;
    position: static !important;
    margin: 0 !important;
    padding: 0 !important;
    max-width: none !important;
    width: auto !important;
    height: auto !important;
    min-height: 0 !important;
    overflow: visible !important;
    background: none !important;
    border: 0 !important;
    box-shadow: none !important;
  }
  .인쇄판 {
    zoom: 1 !important;
    width: 210mm !important;
    gap: 0 !important;
    grid-template-columns: 210mm !important;
  }
  .인쇄쪽 { break-after: page; }
  .인쇄쪽:last-child { break-after: auto; }
  .인쇄종이 {
    width: 210mm !important;
    height: 297mm !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    --tw-ring-shadow: 0 0 #0000 !important;
  }

  .인쇄판.모아 {
    zoom: 0.705 !important;
    width: 1588px !important;
    grid-template-columns: repeat(2, 794px) !important;
  }
  .인쇄판.모아 .인쇄쪽 { break-after: auto; }
  .인쇄판.모아 .인쇄쪽:nth-child(2n):not(:last-child) { break-after: page; }
  .인쇄판.모아 .인쇄종이 {
    width: 794px !important;
    height: 1123px !important;
  }
}
</style>

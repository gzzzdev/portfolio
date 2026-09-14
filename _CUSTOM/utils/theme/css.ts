/**
 * 축 값을 **화면에 내보내는 일 전부** — CSS 변수로 풀고, `<style>` 태그로 꽂는다.
 *
 * **여기선 정규화하지 않는다.** 믿을 수 없는 값(쿠키·appConfig)은 `축.ts` 의 입구 둘
 * (`parseThemeCookie`·`resolveDefaultTheme`)에서 이미 눈금 위로 당겨졌고, 그 뒤로는 타입이
 * 눈금을 보증한다. 층마다 다시 정규화하면 「타입이 말하는 걸 아무도 안 믿는」 코드가 된다.
 *
 * 축이 **무슨 값을 갖는지**는 `축.ts`, 색 데이터와 색 계산은 `색.ts` 가 진다.
 */

import { useState, watch } from '#imports'
import { PRETTY_COLOR_SCALES } from './색사다리.gen'
import { washVars } from './색'
import type { DepthSlot, ThemeState, i그림자, i진하기 } from './축'
import {
  depthVar, BORDER_CONTRAST_DEFAULT, DEPTH_SLOTS, 축값s, 글꼴options, 진하기options, 색온도options
} from './축'

/** `[이름, 값][]` 을 선언 블록 본문으로. SSR 문자열과 클라이언트 `setProperty` 가 같은 목록에서 나온다. */
function 선언s(vars: readonly [string, string][]): string {
  return vars.map(([k, v]) => `${k}:${v}`).join(';')
}

// ═════════════════════════════  <style> 주입  ═════════════════════════════

/**
 * `id` 를 단 `<style>` 태그 하나를 head 에 두고 내용을 갈아 끼운다.
 *
 * **내용이 안 바뀌었으면 건드리지 않는다.** `textContent` 를 그냥 다시 넣으면 브라우저가 스타일을
 * 다시 계산해서, 축을 한 칸 밀 때마다 화면 전체가 한 번씩 깜빡인다.
 */
function 스타일주입(id: string, css: string) {
  if (!import.meta.client)
    return

  let el = document.getElementById(id) as HTMLStyleElement | null
  if (!el) {
    el = document.createElement('style')
    el.id = id
    document.head.appendChild(el)
  }
  if (el.textContent !== css)
    el.textContent = css
}

/** 주입한 태그를 걷어낸다. 켰다 끄는 진단용(`use선진단`)에만 쓴다. */
function 스타일제거(id: string) {
  if (import.meta.client)
    document.getElementById(id)?.remove()
}

// ═════════════════════════════  글꼴  ═════════════════════════════

export type i글꼴상태 = Pick<ThemeState, 'font' | 'weight' | 'fontScale' | 'lineHeight'>

/** `font-size` 만 커스텀 속성이 아니다. 선언 블록에서도 `setProperty` 에서도 그대로 먹는다. */
function themeFontCssVars(state: i글꼴상태): [string, string][] {
  const stack = 글꼴options.find(o => o.value === state.font)?.stackVar ?? '--font-stack-mixed'
  return [
    ['--font-sans-active', `var(${stack})`],
    ['--font-weight-sans-body', String(state.weight)],
    ['font-size', `${state.fontScale * 100}%`],
    ['--m-prose-leading', String(state.lineHeight)]
  ]
}

export function applyThemeFontToDocument(state: i글꼴상태) {
  if (!import.meta.client)
    return

  for (const [name, value] of themeFontCssVars(state))
    document.documentElement.style.setProperty(name, value)
}

// ═════════════════════════════  진하기 · 선 진하기  ═════════════════════════════

const SLOTS = ['dimmed', 'muted', 'toned', 'text', 'highlighted'] as const

const VAR: Record<(typeof SLOTS)[number], string> = {
  dimmed: '--ui-text-dimmed',
  muted: '--ui-text-muted',
  toned: '--ui-text-toned',
  text: '--ui-text',
  highlighted: '--ui-text-highlighted'
}

const 구조선_VAR = ['--ui-border', '--ui-border-muted'] as const
const 컨트롤선_VAR = ['--ui-border-accented'] as const
const 잉크_VAR = ['--ui-bg-inverted', '--ui-border-inverted'] as const

type Shade = 0 | 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950

/** 글자 다섯 칸(`SLOTS` 순서)의 사다리. 진하기 한 칸이 다섯 칸을 통째로 민다. */
const LIGHT: Record<i진하기, readonly Shade[]> = {
  [-2]: [400, 400, 500, 500, 700],
  [-1]: [400, 500, 500, 600, 800],
  0: [400, 500, 600, 700, 900],
  1: [500, 600, 700, 800, 950],
  2: [600, 700, 800, 900, 950]
}

const DARK: Record<i진하기, readonly Shade[]> = {
  [-2]: [600, 500, 500, 400, 200],
  [-1]: [600, 500, 400, 300, 100],
  0: [500, 400, 300, 200, 0],
  1: [400, 300, 200, 100, 0],
  2: [400, 300, 100, 50, 0]
}

/** 잉크 — 반전 면(뱃지·툴팁 바탕)의 색. 글자 사다리와 따로 잰 값이라 표로 둔다. */
const LIGHT_INK: Record<i진하기, Shade> = { [-2]: 500, [-1]: 600, 0: 700, 1: 800, 2: 900 }
const DARK_INK: Record<i진하기, Shade> = { [-2]: 400, [-1]: 300, 0: 200, 1: 100, 2: 50 }

/** 구조선 — 면을 가르는 선. 선 진하기 「없음」에서는 정말 사라져도 된다(밝은 배경의 흰 선). */
const LIGHT_BORDER: Record<i진하기, Shade> = { [-2]: 0, [-1]: 100, 0: 200, 1: 300, 2: 400 }
const DARK_BORDER: Record<i진하기, Shade> = { [-2]: 900, [-1]: 900, 0: 800, 1: 700, 2: 600 }

/**
 * 컨트롤선(입력칸·버튼 테두리)은 구조선과 같은 칸을 쓰되 **연한 쪽 끝에서 안 사라진다.**
 * 면을 가르는 선은 없어도 읽히지만, 눌러야 하는 것의 테두리가 없으면 어디를 누를지 모른다.
 * 그래서 한 칸(밝은 배경 100 · 어두운 배경 800)에서 멈춘다.
 */
const 컨트롤선_바닥 = { light: 100, dark: 800 } as const

function 컨트롤선Shade(b: i진하기, isDark: boolean): Shade {
  return (isDark
    ? Math.min(DARK_BORDER[b], 컨트롤선_바닥.dark)
    : Math.max(LIGHT_BORDER[b], 컨트롤선_바닥.light)) as Shade
}

function shadeValue(s: Shade): string {
  return s === 0 ? '#fff' : `var(--ui-color-neutral-${s})`
}

export function contrastVars(
  step: i진하기,
  isDark: boolean,
  border: i진하기 = BORDER_CONTRAST_DEFAULT
): Record<string, string> {
  const out: Record<string, string> = {}
  const text = (isDark ? DARK : LIGHT)[step]
  SLOTS.forEach((slot, i) => {
    out[VAR[slot]] = shadeValue(text[i]!)
  })

  const 구조선 = shadeValue((isDark ? DARK_BORDER : LIGHT_BORDER)[border])
  const 잉크 = shadeValue((isDark ? DARK_INK : LIGHT_INK)[step])
  for (const v of 구조선_VAR) out[v] = 구조선
  for (const v of 컨트롤선_VAR) out[v] = shadeValue(컨트롤선Shade(border, isDark))
  for (const v of 잉크_VAR) out[v] = 잉크
  return out
}

/** 글자 다섯 칸만. 어두운 배경에서 면마다 사다리를 갈아 끼울 때 쓴다(선·잉크는 그대로 둔다). */
function 글자decls(step: i진하기, isDark: boolean): string {
  const text = (isDark ? DARK : LIGHT)[step]
  return SLOTS.map((slot, i) => `${VAR[slot]}:${shadeValue(text[i]!)}`).join(';')
}

const 진하기_최대 = 축값s(진하기options).at(-1)!

/** 떠 있는 면은 바탕보다 한 칸 진한 글자를 받는다 — 면이 밝아진 만큼 글자도 서야 대비가 유지된다. */
function 한칸위(step: i진하기): i진하기 {
  return Math.min(step + 1, 진하기_최대) as i진하기
}

const CONTRAST_STYLE_ID = 'm-theme-contrast'

function contrastCss(step: i진하기, border: i진하기 = BORDER_CONTRAST_DEFAULT): string {
  const decls = (isDark: boolean) => 선언s(Object.entries(contrastVars(step, isDark, border)) as [string, string][])
  const 기준 = `:root,:host,.light{${decls(false)}}.dark{${decls(true)}}`
  const 면 = `.dark :is(.bg-page,.bg-default,.bg-muted){${글자decls(step, true)}}`
    + `.dark .bg-elevated{${글자decls(한칸위(step), true)}}`
  return 기준 + 면
}

export function contrastBodyColor(step: i진하기, isDark: boolean): string {
  return shadeValue((isDark ? DARK : LIGHT)[step][SLOTS.indexOf('text')]!)
}

export function contrastPartColor(step: i진하기, isDark: boolean): string {
  return shadeValue((isDark ? DARK_INK : LIGHT_INK)[step])
}

export function contrastBorderColor(border: i진하기 = BORDER_CONTRAST_DEFAULT, isDark = false): string {
  return shadeValue((isDark ? DARK_BORDER : LIGHT_BORDER)[border])
}

// ═════════════════════════════  그림자(깊이)  ═════════════════════════════

interface 겹기하 { y: number, blur: number, a: number }

const LIGHT_BASE: Record<DepthSlot, 겹기하[]> = {
  카드: [{ y: 1, blur: 2, a: 0.06 }, { y: 1, blur: 3, a: 0.07 }],
  떠있음: [{ y: 2, blur: 4, a: 0.06 }, { y: 4, blur: 10, a: 0.08 }],
  드롭다운: [{ y: 4, blur: 8, a: 0.07 }, { y: 10, blur: 24, a: 0.10 }],
  모달: [{ y: 8, blur: 16, a: 0.09 }, { y: 20, blur: 48, a: 0.16 }]
}

const DARK_RING: Record<DepthSlot, number> = {
  카드: 0.05,
  떠있음: 0.07,
  드롭다운: 0.09,
  모달: 0.11
}

const DARK_BASE: Record<DepthSlot, 겹기하[]> = {
  카드: [{ y: 1, blur: 3, a: 0.35 }],
  떠있음: [{ y: 3, blur: 8, a: 0.42 }],
  드롭다운: [{ y: 8, blur: 20, a: 0.50 }],
  모달: [{ y: 16, blur: 44, a: 0.60 }]
}

const DARK_GLOW: Record<DepthSlot, 겹기하[]> = {
  카드: [],
  떠있음: [{ y: 4, blur: 22, a: 0.06 }],
  드롭다운: [{ y: 10, blur: 46, a: 0.10 }],
  모달: [{ y: 22, blur: 88, a: 0.14 }]
}

const WHITE_GLOW: Record<DepthSlot, 겹기하[]> = {
  카드: [{ y: 2, blur: 6, a: 0.12 }, { y: 4, blur: 14, a: 0.06 }],
  떠있음: [{ y: 3, blur: 8, a: 0.14 }, { y: 6, blur: 22, a: 0.07 }],
  드롭다운: [{ y: 4, blur: 12, a: 0.16 }, { y: 12, blur: 38, a: 0.08 }],
  모달: [{ y: 8, blur: 18, a: 0.18 }, { y: 24, blur: 70, a: 0.09 }]
}

const ALPHA_MUL: Record<i그림자, number> = { [-2]: 0, [-1]: 0.55, 0: 1, 1: 1.6, 2: 2.4 }
const GEO_MUL: Record<i그림자, number> = { [-2]: 0, [-1]: 0.7, 0: 1, 1: 1.35, 2: 1.8 }

function 반올림(n: number, 자리 = 2) {
  const f = 10 ** 자리
  return Math.round(n * f) / f
}

function 겹(l: 겹기하, step: i그림자): string {
  const a = 반올림(Math.min(l.a * ALPHA_MUL[step], 0.8), 3)
  return `0 ${반올림(l.y * GEO_MUL[step], 1)}px ${반올림(l.blur * GEO_MUL[step], 1)}px rgb(0 0 0 / ${a})`
}

const DARK_CHANNELS = ['링', '검정', '흰후광', '강조후광'] as const

export type DarkChannel = (typeof DARK_CHANNELS)[number]

export const DARK_RECIPE: readonly DarkChannel[] = ['흰후광']

function 후광s(gs: 겹기하[], step: i그림자, color: string, 상한: number, 무방향: boolean): string[] {
  return gs.flatMap((g) => {
    const a = 반올림(Math.min(g.a * ALPHA_MUL[step], 상한), 3)
    if (a <= 0)
      return []
    const y = 무방향 ? 0 : 반올림(g.y * GEO_MUL[step], 1)
    return [`0 ${y}px ${반올림(g.blur * GEO_MUL[step], 1)}px color-mix(in oklab, ${color} ${반올림(a * 100, 1)}%, transparent)`]
  })
}

const 기본강조 = 'var(--ui-primary, var(--ui-color-primary-500))'

export function depthShadowDark(
  step: i그림자,
  slot: DepthSlot,
  channels: readonly DarkChannel[] = DARK_RECIPE,
  primary = 기본강조,
  무방향 = false
): string {
  const 겹s: string[] = []

  if (channels.includes('링'))
    겹s.push(`0 0 0 1px rgb(255 255 255 / ${반올림(Math.min(DARK_RING[slot] * ALPHA_MUL[step], 0.3), 3)})`)

  if (channels.includes('검정'))
    겹s.push(...DARK_BASE[slot].map(l => 겹(l, step)))

  if (channels.includes('흰후광'))
    겹s.push(...후광s(WHITE_GLOW[slot], step, 'white', 0.22, 무방향))

  if (channels.includes('강조후광'))
    겹s.push(...후광s(DARK_GLOW[slot], step, primary, 0.28, 무방향))

  return 겹s.length ? 겹s.join(', ') : '0 0 #0000'
}

export function depthShadow(step: i그림자, slot: DepthSlot, isDark: boolean, primary = 기본강조): string {
  if (step === -2)
    return '0 0 #0000'

  return isDark
    ? depthShadowDark(step, slot, DARK_RECIPE, primary)
    : LIGHT_BASE[slot].map(l => 겹(l, step)).join(', ')
}

const DEPTH_STYLE_ID = 'm-theme-depth'

function depthCss(step: i그림자): string {
  const decls = (isDark: boolean) => DEPTH_SLOTS.map(s => `${depthVar(s)}:${depthShadow(step, s, isDark)}`).join(';')
  return `:root,:host,.light{${decls(false)}}.dark{${decls(true)}}`
}

// ═════════════════════════════  전체 조립  ═════════════════════════════

const SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const

const RADIUS_SCALE = { 'xs': 0.5, 'sm': 1, 'md': 1.5, 'lg': 2, 'xl': 3, '2xl': 4, '3xl': 6 } as const

/** 강조·보조색 한 칸에서 11단 사다리와 별칭 둘. 사다리는 `색사다리.gen.ts` 가 미리 뽑아둔 것. */
function aliasVars(alias: string, hex: string): [string, string][] {
  if (typeof hex !== 'string' || hex.trim() === '')
    return []

  const scale = PRETTY_COLOR_SCALES[hex.trim().toLowerCase()]
  const vars: [string, string][] = SHADES.map((s, i) => [`--ui-color-${alias}-${s}`, scale?.[i] ?? hex])
  vars.push([`--ui-${alias}`, hex], [`--color-${alias}`, hex])
  return vars
}

function themeColorCssVars(state: ThemeState): [string, string][] {
  const vars: [string, string][] = [
    ...aliasVars('primary', state.primary),
    ...aliasVars('secondary', state.secondary),
    ...washVars(state.primary, state.secondary)
  ]

  const 배경 = 색온도options.find(o => o.value === state.bg) ?? 색온도options[0]
  if (배경) {
    vars.push(['--color-neutral', 배경.colors[5]!])
    SHADES.forEach((s, i) => {
      vars.push([`--color-neutral-${s}`, 배경.colors[i]!], [`--ui-color-neutral-${s}`, 배경.colors[i]!])
    })
  }

  for (const [name, mul] of Object.entries(RADIUS_SCALE))
    vars.push([`--radius-${name}`, `${state.radius * mul}rem`])

  return vars
}

/** SSR 첫 화면 — 축 값 전부를 한 덩어리 CSS로. 클라이언트의 `applyThemeToDocument` 와 같은 결과여야 한다. */
export function themeInlineCss(state: ThemeState): string {
  const 인라인 = 선언s([...themeFontCssVars(state), ...themeColorCssVars(state)])
  return `:root:root{${인라인}}${contrastCss(state.contrast, state.borderContrast)}${depthCss(state.elevation)}`
}

/** 클라이언트에서 축 값 전부를 문서에 반영한다. */
export function applyThemeToDocument(state: ThemeState) {
  if (!import.meta.client)
    return

  for (const [name, value] of [...themeFontCssVars(state), ...themeColorCssVars(state)])
    document.documentElement.style.setProperty(name, value)

  스타일주입(CONTRAST_STYLE_ID, contrastCss(state.contrast, state.borderContrast))
  스타일주입(DEPTH_STYLE_ID, depthCss(state.elevation))
}

// ═════════════════════════════  선 진단(개발용)  ═════════════════════════════

const BORDER_AUDIT_STYLE_ID = 'm-theme-border-audit'

/** 구조선·컨트롤선·연한선을 각각 파랑·빨강·초록으로 칠해서 **어느 선이 어느 변수인지** 눈으로 가른다. */
const BORDER_AUDIT_COLORS = {
  '--ui-border': '#2563eb',
  '--ui-border-accented': '#dc2626',
  '--ui-border-muted': '#16a34a'
} as const

export function use선진단() {
  const 켜짐 = useState(BORDER_AUDIT_STYLE_ID, () => false)
  const css = `:root,:host,.light,.dark{`
    + Object.entries(BORDER_AUDIT_COLORS).map(([k, v]) => `${k}:${v}!important`).join(';')
    + `}`

  if (import.meta.client)
    watch(켜짐, on => (on ? 스타일주입(BORDER_AUDIT_STYLE_ID, css) : 스타일제거(BORDER_AUDIT_STYLE_ID)), { immediate: true })

  return 켜짐
}

/**
 * 테마의 **축들** — 무엇을 고를 수 있고, 저장된 값을 어떻게 되살리고, 어떻게 한 칸 옮기는가.
 *
 * 축 하나는 `{options 배열, 정규화 함수}` 한 쌍이고 그게 전부다. 눈금은 `options` 안에 그대로
 * 들어 있으니 「배열에서 찾기」로 현재 칸을 알 수 있고, 정규화는 언제나 눈금 위의 값을 돌려주므로
 * **되돌림 자리를 따로 들고 있을 필요가 없다.** 축을 하나 붙이는 일 = `AXES` 에 줄 하나 붙이는 일.
 *
 * **여기 없는 것:** 축 값을 CSS로 내보내는 일은 `css.ts`, 색 데이터와 색 계산은 `색.ts` 가 진다.
 */

import {
  nearestPrettyPrimaryIndex,
  PRETTY_PRIMARY_PALETTE_DARK,
  PRETTY_PRIMARY_PALETTE_LIGHT,
  배경s
} from './색'
import type { i테마축s } from '~models/(system)/model테마'

// ═════════════════════════════  축 옵션 공통  ═════════════════════════════

export interface 축옵션<V> {
  label: string
  value: V
}

/** options 배열에서 값 타입만 뽑는다. 축 타입은 전부 이걸 거쳐서 **배열이 곧 타입의 근거**가 된다. */
type 값<T extends readonly { value: unknown }[]> = T[number]['value']

export function 축값s<V>(os: readonly 축옵션<V>[]): readonly V[] {
  return os.map(o => o.value)
}

export function 축라벨<V>(os: readonly 축옵션<V>[], v: unknown): string {
  return os.find(o => o.value === v)?.label ?? ''
}

export function 축인덱스<V>(os: readonly 축옵션<V>[], v: unknown): number {
  return os.findIndex(o => o.value === v)
}

function 번호options<V>(값s: readonly V[], 양끝: { left: string, right: string }): readonly 축옵션<V>[] {
  return 값s.map((value, i) => ({
    value,
    label: i === 0 ? `1(${양끝.left})` : i === 값s.length - 1 ? `${값s.length}(${양끝.right})` : String(i + 1)
  }))
}

// ═════════════════════════════  글꼴 · 굵기 · 글자크기 · 줄간격  ═════════════════════════════

export const 글꼴options = [
  { label: '고운돋움', value: 'gowun-dodum', stackVar: '--font-stack-gowun-dodum' },
  { label: 'SUIT', value: 'suit', stackVar: '--font-stack-suit' },
  { label: '프리텐다드', value: 'pretendard', stackVar: '--font-stack-pretendard' },
  { label: '표진고딕', value: 'pyeojin-gothic', stackVar: '--font-stack-pyeojin-gothic' }
] as const satisfies readonly (축옵션<string> & { stackVar: string })[]

/** `mixed` 는 옵션에 없는 값이다 — 「고른 적 없음」을 뜻하고, 스택은 `--font-stack-mixed` 로 떨어진다. */
export type i글꼴 = 값<typeof 글꼴options> | 'mixed'

export const 굵기options = 번호options(
  [100, 200, 300, 400, 500, 600, 700, 800, 900] as const,
  { left: '가늘게', right: '굵게' }
)

export type i굵기 = 값<typeof 굵기options>

export const 글자크기options = [
  { label: '보통', value: 1 },
  { label: '크게', value: 1.125 },
  { label: '아주 크게', value: 1.25 }
] as const satisfies readonly 축옵션<number>[]

export type i글자크기 = 값<typeof 글자크기options>

export const 줄간격options = [
  { label: '좁게', value: 1.5 },
  { label: '보통', value: 1.75 },
  { label: '넓게', value: 2 }
] as const satisfies readonly 축옵션<number>[]

export type i줄간격 = 값<typeof 줄간격options>

// ═════════════════════════════  재질  ═════════════════════════════

export const 재질options = [
  { label: '선', value: 'outline' },
  { label: '면', value: 'soft' },
  { label: '선+면', value: 'subtle' }
] as const satisfies readonly 축옵션<string>[]

export type i재질 = 값<typeof 재질options>

export const VARIANT_DEFAULT: i재질 = 'outline'

export const VARIANT_COMPONENTS = ['badge', 'alert', 'card', 'input', 'textarea', 'select'] as const

export function applyVariantToAppConfig(appConfig: Record<string, any>, step: i재질) {
  const ui = (appConfig.ui ??= {})
  for (const name of VARIANT_COMPONENTS) {
    const slot = (ui[name] ??= {})
    const dv = (slot.defaultVariants ??= {})
    dv.variant = step
  }
}

// ═════════════════════════════  그림자(깊이)  ═════════════════════════════

export const 그림자options = [
  { label: '없음', value: -2 },
  { label: '얕게', value: -1 },
  { label: '기본', value: 0 },
  { label: '깊게', value: 1 },
  { label: '아주 깊게', value: 2 }
] as const satisfies readonly 축옵션<number>[]

export type i그림자 = 값<typeof 그림자options>

/** 처음 온 브라우저가 서는 칸 — 가운데(기본)보다 한 칸 위다. 그림자가 「있다」고 보여야 해서다. */
export const DEPTH_DEFAULT: i그림자 = 1

export const DEPTH_SLOTS = ['카드', '떠있음', '드롭다운', '모달'] as const

export type DepthSlot = (typeof DEPTH_SLOTS)[number]

/** 층 번호 0은 「그림자 없음」이라 슬롯이 없다. 1~4가 `DEPTH_SLOTS` 순서와 맞물린다. */
export type DepthLayer = 0 | 1 | 2 | 3 | 4

export function depthVar(slot: DepthSlot): string {
  return `--m-depth-${DEPTH_SLOTS.indexOf(slot) + 1}`
}

export function depthClass(층: number): string {
  const slot = DEPTH_SLOTS[Math.round(층) - 1]
  return slot ? `m-층-${slot}` : ''
}

// ═════════════════════════════  진하기 · 선 진하기  ═════════════════════════════

/**
 * 두 축은 **눈금 하나**를 나눠 쓴다 — 값도 -2~2, 정규화도 같고, 왼쪽 첫 칸 이름만 다르다:
 * 글자는 「아주 연하게」지만 선은 그 자리에서 정말 사라지니 「없음」이다.
 * 그래서 타입도 `normalize` 도 하나다. 갈라 놨을 때 `contrastVars(step, isDark, border)` 에
 * 두 인자를 바꿔 넣어도 TS가 못 잡았으니, 가른 값이 애초에 0이었다.
 *
 * **눈금을 같이 쓰는 것과 두 손잡이가 같이 움직이는 것은 다른 일이다.** 값은 각자 저장되고
 * 각자 밀린다 — 오프셋으로 묶었다가 되돌린 적이 있다(`m/테마/축줄s.vue` 의 「선 진하기」 주석).
 */
export const 진하기options = [
  { label: '아주 연하게', value: -2 },
  { label: '연하게', value: -1 },
  { label: '기본', value: 0 },
  { label: '진하게', value: 1 },
  { label: '아주 진하게', value: 2 }
] as const satisfies readonly 축옵션<number>[]

export type i진하기 = 값<typeof 진하기options>

export const 선진하기options: readonly 축옵션<i진하기>[]
  = 진하기options.map(o => (o.value === -2 ? { ...o, label: '없음' } : o))

export const CONTRAST_DEFAULT: i진하기 = 0
/** 선 진하기도 가운데보다 한 칸 위에서 선다(`DEPTH_DEFAULT` 와 같은 이유). */
export const BORDER_CONTRAST_DEFAULT: i진하기 = 1

// ═════════════════════════════  색 · 라운드 · 화면  ═════════════════════════════

/** 강조·보조·색온도는 hex(또는 oklch) 문자열이다 — 눈금이 팔레트라 값 자체로는 좁힐 게 없다. */
export type i강조색 = string
export type i보조색 = string
export type i색온도 = string
export type i화면 = 'light' | 'dark'
/** 완제품 행(`~models/(system)/model테마`)의 id. 빈 문자열이면 「직접 맞춤」이다. */
export type i완제품id = string

export const BORDER_RADIUS_STEPS = [0, 0.0625, 0.125, 0.1875, 0.25, 0.375, 0.5] as const

export const 라운드options = 번호options(BORDER_RADIUS_STEPS, { left: '각지게', right: '둥글게' })

/**
 * 라운드만 눈금 유니온이 아니라 **넓은 `number`** 다. 정규화가 「가장 가까운 눈금」을 돌려주는데
 * 그 반환이 `number` 라, 유니온으로 좁히면 대입이 전부 막힌다.
 */
export type i라운드 = number

export const 색온도options = 배경s.map(b => ({ label: b.label, value: b.colors[5]!, colors: b.colors }))

function primaryPalette(isDark: boolean): readonly string[] {
  return isDark ? PRETTY_PRIMARY_PALETTE_DARK : PRETTY_PRIMARY_PALETTE_LIGHT
}

// ═════════════════════════════  테마 상태와 기본값  ═════════════════════════════

/**
 * 테마 한 벌 = 축 열둘. **이름과 타입의 원본은 `model테마` 의 `i테마축s`** 다 —
 * 표의 칸이 곧 축이라 두 벌로 적을 이유가 없고, 기준은 모델이다.
 *
 * **타입만 가져온다**(`import type`). 컴파일에 지워지므로 런타임 간선이 아니고, 그래서
 * 스토어 → 이 파일 → 모델 → 스토어 순환이 안 생긴다. 값을 하나라도 가져오면 그 순간 순환이다.
 */
export type ThemeState = i테마축s

export type ColorModePreference = 'light' | 'dark' | 'system'

export interface ThemeConfig extends ThemeState {
  preference: ColorModePreference
  bg2: string
}

export type ThemeConfigInput = Partial<ThemeConfig>

const 기본색 = '#3e63dd'
const 기본배경 = 배경s[0]?.colors ?? []
const RADIUS_DEFAULT = 0.25

export const DEFAULT_THEME: ThemeConfig = {
  preference: 'light',
  radius: RADIUS_DEFAULT,
  primary: 기본색,
  secondary: 기본색,
  bg: 기본배경[5] ?? 기본색,
  bg2: 기본배경[8] ?? 기본색,
  font: 'pretendard',
  weight: 500,
  fontScale: 1,
  lineHeight: 1.75,
  elevation: DEPTH_DEFAULT,
  variant: VARIANT_DEFAULT,
  contrast: CONTRAST_DEFAULT,
  borderContrast: BORDER_CONTRAST_DEFAULT
}

// ═════════════════════════════  축 목록과 이동  ═════════════════════════════

export interface ThemeAxis<Item, Value> {
  label: string
  labels?: { left: string, right: string }
  options: (isDark?: boolean) => readonly 축옵션<Value>[]
  list: (isDark?: boolean) => readonly Item[]
  toValue: (item: Item) => Value
  indexOf: (value: unknown, isDark?: boolean) => number
  무작위여백?: number | [number, number]
}

/**
 * **눈금이 options 배열 안에 그대로 들어 있는 축.** 열둘 중 열이 이 모양이다.
 *
 * `indexOf` 가 못 찾으면 첫 칸이다(`Math.max(0, -1)`). 눈금 밖 값은 테마피커를 거치는 한
 * 안 들어오고, 옛 브라우저에서 하나 흘러들어도 첫 칸으로 보이는 게 전부다.
 */
function 눈금축<V>(a: {
  label: string
  labels?: { left: string, right: string }
  무작위여백?: number | [number, number]
  options: readonly 축옵션<V>[]
}): ThemeAxis<V, V> {
  const { options } = a

  return {
    label: a.label,
    labels: a.labels,
    무작위여백: a.무작위여백,
    options: () => options,
    list: () => 축값s(options),
    toValue: v => v,
    indexOf: v => Math.max(0, 축인덱스(options, v))
  }
}

/** 강조색·보조색은 **이름 두 글자만 빼고 같다.** 눈금이 팔레트라 화면 모드를 탄다. */
function 색축(이름: 'primary' | 'secondary', label: string): ThemeAxis<string, string> {
  return {
    label,
    labels: { left: '밝은 배경', right: '어두운 배경' },
    options: (isDark = false) => primaryPalette(isDark).map(hex => ({ label: hex.toUpperCase(), value: hex })),
    list: (isDark = false) => primaryPalette(isDark),
    toValue: hex => hex,
    indexOf: (v, isDark = false) => {
      const list = primaryPalette(isDark)
      const raw = v != null && v !== '' ? String(v) : list[Math.floor(list.length / 2)]!
      return nearestPrettyPrimaryIndex(raw, list)
    }
  }
}

export const AXES = {
  font: 눈금축({ label: '글꼴', options: 글꼴options }),

  weight: 눈금축({
    label: '글씨 굵기',
    labels: { left: '가늘게', right: '굵게' },
    options: 굵기options
  }),

  /**
   * 글자 크기·줄간격은 **축이다**(2026-09-09). 전에는 축 밖의 「읽기 보조」였는데, 그러면
   * `captureSnapshot` 이 THEME_AXIS_NAMES 만 돌아서 **되돌리기가 이 둘을 못 잡는다** —
   * 완제품이 이 둘을 나르기 시작하면(`완제품축s`) 카드를 누른 뒤 되돌려도 글자 크기만 남는다.
   *
   * 축이 된 것과 무작위가 굴리는 것은 다른 일이다. 무작위의 범위는 `AXIS_GROUPS` 고 이 둘은
   * 거기 없다 — 시력에 관한 값이라 취향과 같이 굴러다니면 안 된다. 화면 줄은 `l/테마.vue` 가
   * 「읽기」 끝에 손으로 얹는다.
   */
  fontScale: 눈금축({
    label: '글자 크기',
    labels: { left: '보통', right: '아주 크게' },
    options: 글자크기options
  }),

  lineHeight: 눈금축({
    label: '줄간격',
    labels: { left: '좁게', right: '넓게' },
    options: 줄간격options
  }),

  primary: 색축('primary', '강조색'),

  secondary: 색축('secondary', '보조색'),

  bg: 눈금축({
    label: '색온도',
    labels: { left: '차갑게', right: '따뜻하게' },
    options: 색온도options
  }),

  radius: 눈금축({
    label: '라운드',
    labels: { left: '각지게', right: '둥글게' },
    options: 라운드options
  }),

  elevation: 눈금축({
    label: '그림자',
    labels: { left: '얕게', right: '깊게' },
    options: 그림자options
  }),

  variant: 눈금축({
    label: '재질',
    labels: { left: '선만', right: '선+면' },
    무작위여백: [0, 1],
    options: 재질options
  }),

  contrast: 눈금축({
    label: '진하기',
    labels: { left: '연하게', right: '진하게' },
    무작위여백: [2, 1],
    options: 진하기options
  }),

  borderContrast: 눈금축({
    label: '선 진하기',
    labels: { left: '연하게', right: '진하게' },
    무작위여백: 1,
    options: 선진하기options
  })
/**
 * **축 이름이 곧 상태 칸 이름이다** (2026-09-09). 그전에는 축마다 `key: 'colorPrimary'` 같은
 * 줄을 달고 다녔다 — 축 이름(`primary`)과 상태 칸 이름(`colorPrimary`)이 달랐기 때문이고,
 * 그건 다시 `i테마dto` 의 칸 이름(`primary`)과도 달랐다. **같은 열두 축에 이름이 셋이었다.**
 *
 * 기준을 `model테마` 로 맞추면서 셋이 하나가 됐고, 그러자 `key` 는 자기 이름을 한 번 더 적는
 * 줄이 되어 사라졌다. `satisfies` 가 그 일치를 지킨다 — 축을 빠뜨리거나 상태에 없는 축을
 * 만들면 **여기서 컴파일이 깨진다.**
 */
} satisfies Record<keyof ThemeState, unknown>

export type ThemeAxisName = keyof typeof AXES

export const THEME_AXIS_NAMES = Object.keys(AXES) as ThemeAxisName[]

// ═════════════════════════════  상태 정규화 (AXES 에서 나온다)  ═════════════════════════════

/**
 * **테마를 이루는 축 전부.** 축 이름이 곧 상태 칸 이름이라 `THEME_AXIS_NAMES` 와 같은 목록이다
 * (`AXES` 의 `satisfies` 가 그 일치를 지킨다). 완제품이 나르는 칸도 이것이다(`model테마`).
 */
export const 상태키s = THEME_AXIS_NAMES as unknown as (keyof ThemeState)[]

const 축기본값 = Object.fromEntries(상태키s.map(k => [k, DEFAULT_THEME[k]])) as unknown as ThemeState

/**
 * 빠진 칸을 기본값으로 채워 상태 한 벌을 만든다. **검사는 안 한다.**
 *
 * ## 정규화를 걷어낸 이유 — 실측 (2026-09-09)
 *
 * 그전에는 열두 칸을 축마다 정규화해서 되살렸다. 실제 값을 넣어 재봤다: DB 행 아홉 개 +
 * `DEFAULT_THEME` + 쿠키 왕복, **값이 든 칸 81개 중 정규화가 바꾼 칸은 0개**였다.
 * 값이 오는 길이 테마피커의 `options` 뿐이라 눈금 밖 값이 애초에 없고, 눈금 밖 값을 튕기는
 * 일은 `model테마.축설정` 이 이미 한다 — 그게 문이다. 값이 이상하면 고칠 자리는 그 손잡이다.
 *
 * 한때 빈 문자열을 「없음」으로 치는 줄이 있었다. 스토어의 색 ref 가 `ref<string>('')` 로
 * 서 있었기 때문인데, 그건 **거기서 고칠 일**이었다 — 지금 ref 는 `DEFAULT_THEME` 로 선다.
 *
 * 옛 버전이 남긴 값을 옮기는 코드도 없다. 아직 배포한 적이 없어서 남의 브라우저에 옛 값이
 * 있을 수가 없다. **생길 때 만들면 된다.**
 *
 * 완제품 행은 이걸 그대로 안 쓴다 — 시력 축은 비워 둬야 해서(`시력축s`) `model테마` 의
 * `완제품채우기` 가 한 겹 감싼다. 여기를 지나는 것은 스토어의 연습장과 쿠키, 즉 **현재 테마**뿐이다.
 */
export function 상태채우기(v: Partial<Record<keyof ThemeState, unknown>>): ThemeState {
  const out = { ...축기본값 }
  for (const k of 상태키s)
    if (v[k] !== undefined) Object.assign(out, { [k]: v[k] })
  return out
}

/**
 * `app.config.ts` 의 `defaultTheme` 을 기본값 위에 얹는다.
 *
 * **여기서 정규화하지 않는다** (2026-09-09). 저건 우리가 쓰는 파일이고 타입이 붙어 있다 —
 * 틀렸으면 그 파일에서 고칠 일이지, 매 부팅마다 열두 칸을 훑어 되돌릴 일이 아니다.
 * 정규화가 필요한 곳은 **브라우저에 저장된 값** 하나뿐이다(`useThemeStore` 의 `afterHydrate`).
 */
export function resolveDefaultTheme(appConfigTheme?: ThemeConfigInput): ThemeConfig {
  return { ...DEFAULT_THEME, ...appConfigTheme }
}

/**
 * **화면의 줄 순서이자 무작위의 범위다.** 「생김새만 굴리기」가 여기 `생김새` 배열을 그대로 굴리므로,
 * 여기 순서를 바꾸면 `l/테마.vue` 의 줄 순서도 같이 바뀐다 — 한 곳만 고치면 된다는 뜻이고,
 * 한 곳을 고치면 둘 다 바뀐다는 뜻이기도 하다.
 *
 * **이 상수는 「화면의 줄 순서」다.** 무작위의 범위이기도 하지만 그 둘이 완전히 같지는 않다 —
 * 안 굴리는 축은 `시력축s` 가 따로 든다(아래).
 */
export const AXIS_GROUPS = {
  // 굵기(`weight`)는 여기 없다 — 화면에 줄을 안 낸다. 전에는 목록에 넣어 두고
  // `WEIGHT_AXIS_VISIBLE = false` 라는 깃발로 두 군데서 걸러 냈는데, 상수가 `false` 라
  // 그 필터는 언제나 같은 답을 냈다. 목록에서 빼면 깃발도 필터도 필요 없다.
  // **축 자체는 살아 있다** — 완제품 카드가 굵기를 나른다(`i테마축s`).
  생김새: ['primary', 'secondary', 'bg', 'font', 'radius', 'variant'],
  읽기: ['elevation', 'contrast', 'borderContrast', 'fontScale', 'lineHeight']
} as const satisfies Record<string, readonly ThemeAxisName[]>

/**
 * **시력에 관한 축.** 취향이 아니라서 두 가지를 안 한다.
 *
 * - 무작위가 **안 굴린다.** 전에는 이 둘을 `AXIS_GROUPS` 에서 빼는 것으로 처리했다. 그러면
 *   굴러다니지는 않지만 **화면에도 안 나와서**, `l/테마.vue` 가 「읽기」 줄 끝에 이름 둘을 손으로
 *   덧붙여야 했다 — 그래서 두 묶음이 같은 모양인데도 한 줄로 못 묶였다. 목록은 화면 순서를
 *   말하게 두고, 안 굴린다는 사실은 여기 적는다.
 * - 완제품 카드가 **비워 둘 수 있다**(2026-09-13). 빈 칸은 「이 카드는 말이 없다」라, 씌워도 그
 *   축은 손대지 않고 판정도 그 축을 안 본다(`model테마` 의 `PresetTheme`·`matchPresetId`).
 *   「아주 크게」로 놓고 노을을 눌렀다고 글자가 보통으로 떨어지면 안 된다.
 *
 * 2026-09-13 이전 이름은 `무작위제외` 였다. 쓰임 하나를 말하는 이름이라 둘째 쓰임이 생기면서
 * 축이 **무엇인지**를 말하는 이름으로 바꿨다.
 */
export const 시력축s = ['fontScale', 'lineHeight'] as const satisfies readonly ThemeAxisName[]

export type 시력축 = (typeof 시력축s)[number]

export type 축묶음 = keyof typeof AXIS_GROUPS

export const 축묶음s = Object.keys(AXIS_GROUPS) as 축묶음[]

export function 묶음축s(묶음: 축묶음): ThemeAxisName[] {
  return [...AXIS_GROUPS[묶음]]
}

export const COLOR_AXIS_NAMES: ThemeAxisName[] = ['primary', 'secondary', 'bg', 'radius']

export function axisLength(name: ThemeAxisName, isDark: boolean): number {
  return AXES[name].list(isDark).length
}

export function axisIndex(name: ThemeAxisName, state: ThemeState, isDark: boolean): number {
  return AXES[name].indexOf(state[name], isDark)
}

export function axisPatch(name: ThemeAxisName, idx: number, isDark: boolean): Partial<ThemeState> | null {
  const a = AXES[name]
  const list = a.list(isDark) as readonly unknown[]
  const item = list[Math.min(Math.max(0, idx), list.length - 1)]
  if (item === undefined)
    return null
  return { [name]: (a.toValue as (i: unknown) => unknown)(item) } as Partial<ThemeState>
}

export function axisStepIndex(name: ThemeAxisName, state: ThemeState, isDark: boolean, step: number): number {
  const len = axisLength(name, isDark)
  if (len <= 0)
    return 0
  return (((axisIndex(name, state, isDark) + step) % len) + len) % len
}

function randBelow(n: number): number {
  if (n <= 0)
    return 0
  try {
    const u = new Uint32Array(1)
    crypto.getRandomValues(u)
    return u[0]! % n
  } catch {
    return Math.floor(Math.random() * n)
  }
}

/** `무작위여백` 은 「이 축은 양 끝을 안 뽑는다」는 뜻이다 — 무작위가 극단만 골라서 못 쓰게 되는 걸 막는다. */
export function axisRandomIndex(name: ThemeAxisName, isDark: boolean): number {
  const len = axisLength(name, isDark)
  const 여백 = AXES[name].무작위여백 ?? 0
  const [앞, 뒤] = typeof 여백 === 'number' ? [여백, 여백] : 여백
  if (앞 + 뒤 > 0 && len - 앞 - 뒤 >= 1)
    return 앞 + randBelow(len - 앞 - 뒤)
  return randBelow(len)
}

export interface ThemeSnapshot {
  idx: Record<ThemeAxisName, number>
  colorModePreference: ColorModePreference
}

export function captureSnapshot(
  state: ThemeState,
  isDark: boolean,
  colorModePreference: ColorModePreference
): ThemeSnapshot {
  const idx = {} as Record<ThemeAxisName, number>
  for (const name of THEME_AXIS_NAMES)
    idx[name] = axisIndex(name, state, isDark)
  return { idx, colorModePreference }
}

export function snapshotPatch(
  snap: ThemeSnapshot,
  isDark: boolean,
  only?: readonly ThemeAxisName[]
): Partial<ThemeState> {
  const patch: Partial<ThemeState> = {}
  for (const name of only ?? THEME_AXIS_NAMES)
    Object.assign(patch, axisPatch(name, snap.idx[name] ?? 0, isDark))
  return patch
}

// ═════════════════════════════  쿠키(SSR 첫 화면용 저장값)  ═════════════════════════════

export const THEME_COOKIE = 'm_theme'

/**
 * 쿠키에 실리는 것은 **상태 그대로**다 — 칸 이름이 곧 쿠키 키다.
 *
 * 전에는 `p`·`w`·`cp` 같은 짧은 키로 줄여 실었다. 쿠키가 매 요청에 같이 나가서였는데,
 * **재보니 그 절약이 75바이트다**(짧은 키 147B → 칸 이름 222B). SSR HTML 이 172KB 인 요청에서
 * 0.04% 고, 그걸 위해 매핑표·매핑타입·변환 함수로 70줄을 들고 있었다.
 *
 * 이름을 그대로 쓰니 쓰는 쪽은 상태를 그냥 넘기고, 읽는 쪽은 아는 칸만 골라 담는다.
 */
export type ThemeCookiePayload = Partial<ThemeState>

export function themeToCookie(state: ThemeState): ThemeCookiePayload {
  return state
}

/** 아는 칸만 골라 담는다 — 쿠키에 무엇이 더 들어 있든 상태로는 안 넘어간다. */
export function parseThemeCookie(raw: unknown): ThemeCookiePayload | null {
  const o = typeof raw === 'string' ? tryParseJson(raw) : raw
  if (!o || typeof o !== 'object')
    return null

  const rec = o as Record<string, unknown>
  const out: Record<string, unknown> = {}
  for (const k of 상태키s)
    if (rec[k] !== undefined) out[k] = rec[k]
  return out as ThemeCookiePayload
}

/** 쿠키에 없던 칸은 기본값으로 선다. */
export function cookieToThemeState(payload: ThemeCookiePayload): ThemeState {
  return 상태채우기(payload)
}

function tryParseJson(s: string): unknown {
  try {
    return JSON.parse(s) as unknown
  } catch {
    return null
  }
}

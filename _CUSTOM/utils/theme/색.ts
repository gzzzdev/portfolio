/**
 * 테마가 쓰는 **색 전부** — 배경 사다리, 강조색 팔레트, 그리고 그 둘을 재는 계산.
 *
 * 데이터와 계산을 파일로 가르지 않는다. 갈랐을 때 `parseHexToRgb` 가 양쪽에 한 벌씩 생겼었다.
 */

// ─────────────────────────────  배경(중립) 사다리  ─────────────────────────────

/** 색온도 축이 고르는 11단 중립 사다리. Tailwind 기본 팔레트 값 그대로다. */
export const 배경s = [
  {
    label: 'Slate',
    colors: [
      'oklch(0.984 0.003 247.858)',
      'oklch(0.968 0.007 247.896)',
      'oklch(0.929 0.013 255.508)',
      'oklch(0.869 0.022 252.894)',
      'oklch(0.704 0.04 256.788)',
      'oklch(0.554 0.046 257.417)',
      'oklch(0.446 0.043 257.281)',
      'oklch(0.372 0.044 257.287)',
      'oklch(0.279 0.041 260.031)',
      'oklch(0.208 0.042 265.755)',
      'oklch(0.129 0.042 264.695)'
    ]
  },
  {
    label: 'Gray',
    colors: [
      'oklch(0.985 0.002 247.839)',
      'oklch(0.967 0.003 264.542)',
      'oklch(0.928 0.006 264.531)',
      'oklch(0.872 0.01 258.338)',
      'oklch(0.707 0.022 261.325)',
      'oklch(0.551 0.027 264.364)',
      'oklch(0.446 0.03 256.802)',
      'oklch(0.373 0.034 259.733)',
      'oklch(0.278 0.033 256.848)',
      'oklch(0.21 0.034 264.665)',
      'oklch(0.13 0.028 261.692)'
    ]
  },
  {
    label: 'Mono',
    colors: [
      'white',
      'oklch(0.97 0 0)',
      'oklch(0.922 0 0)',
      'oklch(0.87 0 0)',
      'oklch(0.708 0 0)',
      'oklch(0.556 0 0)',
      'oklch(0.439 0 0)',
      'oklch(0.371 0 0)',
      'oklch(0.269 0 0)',
      'oklch(0.205 0 0)',
      'black'
    ]
  },
  {
    label: 'Zinc',
    colors: [
      'oklch(0.985 0 0)',
      'oklch(0.967 0.001 286.375)',
      'oklch(0.92 0.004 286.32)',
      'oklch(0.871 0.006 286.286)',
      'oklch(0.705 0.015 286.067)',
      'oklch(0.552 0.016 285.938)',
      'oklch(0.442 0.017 285.786)',
      'oklch(0.37 0.013 285.805)',
      'oklch(0.274 0.006 286.033)',
      'oklch(0.21 0.006 285.885)',
      'oklch(0.141 0.005 285.823)'
    ]
  },
  {
    label: 'Stone',
    colors: [
      'oklch(0.985 0.001 106.423)',
      'oklch(0.97 0.001 106.424)',
      'oklch(0.923 0.003 48.717)',
      'oklch(0.869 0.005 56.366)',
      'oklch(0.709 0.01 56.259)',
      'oklch(0.553 0.013 58.071)',
      'oklch(0.444 0.011 73.639)',
      'oklch(0.374 0.01 67.558)',
      'oklch(0.268 0.007 34.298)',
      'oklch(0.216 0.006 56.043)',
      'oklch(0.147 0.004 49.25)'
    ]
  }
]

// ─────────────────────────────  강조색 팔레트  ─────────────────────────────

/** 어두운 배경 위에 세우는 칸들 — 밝고, 흰 배경에선 글씨가 안 읽힌다. */
export const PRETTY_PRIMARY_PALETTE_DARK = [
  '#ebebeb', // 흰빛 — 잉크(#111111)의 어두운 쪽 짝
  '#8d8d8d',
  '#ffa18c', // 살구 — 노을(#db3b1b)의 어두운 쪽 짝
  '#ff6369', // 선홍 — 붉은 계열이 비어 있어 추가 (어두운 배경에서 쨍하게 서는 red)
  '#ff7ac3', // 핫핑크 — 발랄한 쪽 끝. 어두운 배경에서 형광처럼 선다
  '#ffc53d',
  '#ffe629',
  '#bdee63',
  '#5ad6c3', // 민트 — 비취(#1e8477)의 어두운 쪽 짝
  '#00a2c7',
  '#7ce2fe',
  '#a1bcff', // 연하늘보라 — 인디고(#3e63dd)의 어두운 쪽 짝
  '#E4707E', // 크림슨
  '#7FA9DC', // 감청
  '#5CB3C4', // 청람
  '#6FBF8E', // 심록
  '#B39BDA', // 자주
  '#D0A25E' // 고동 → 황금
] as const

/** 밝은 배경 위에 세우는 칸들 — 흰 글씨가 읽히는 어둡기(대비 4.5)까지 내려와 있다. */
export const PRETTY_PRIMARY_PALETTE_LIGHT = [
  '#db3b1b', // 주홍 — Radix tomato 보다 한 칸 어둡다 (흰 글씨 대비 4.5)
  '#e54d2e',
  '#e5484d',
  '#f76b15',
  '#30a46c',
  '#29a383',
  '#12a594',
  '#1e8477', // 비취 — 같은 청록 색상, 흰 글씨가 읽히는 어둡기 (대비 4.5)
  '#0090ff',
  '#3e63dd',
  '#5b5bd6',
  '#6e56cf',
  '#8e4ec6',
  '#d6409f',
  '#8C1D2C', // 크림슨 — 하버드·고려대 계열
  '#003A70', // 감청 — 공공·대학 메인 네이비
  '#005F73', // 청람 — 짙은 청록
  '#1E6B3A', // 심록 — 짙은 초록. 색상 자체가 이미 어두워서 더 내리면 검정으로 뭉개진다
  '#4A2E6B', // 자주 — 짙은 보라
  '#8B5A20', // 고동 — 짙은 갈색·황토. 위와 같은 이유로 한 단계 올린 값
  '#111111',
  '#2a2a2a',
  '#000000'
] as const

/** 사다리를 미리 뽑아둘 색 전부(`_CUSTOM/utils/theme/_생성기/gen-theme-scales.mjs`). 화면 모드별 눈금의 합집합이다. */
export const PRETTY_PRIMARY_PALETTE = [
  ...PRETTY_PRIMARY_PALETTE_DARK,
  ...PRETTY_PRIMARY_PALETTE_LIGHT
] as const

// ─────────────────────────────  색 변환  ─────────────────────────────

type RgbColor = { r: number, g: number, b: number }
type HslColor = { h: number, s: number, l: number }

function clampToByte(v: number) {
  return Math.max(0, Math.min(255, Math.round(v)))
}

function normalizeHue(h: number) {
  return ((h % 360) + 360) % 360
}

function parseHexToRgb(value: unknown): RgbColor | null {
  if (typeof value !== 'string')
    return null

  const hex = value.trim().replace(/^#/, '')
  if (!/^(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex))
    return null

  const full = hex.length === 3
    ? hex.split('').map(c => c + c).join('')
    : hex

  return {
    r: Number.parseInt(full.slice(0, 2), 16),
    g: Number.parseInt(full.slice(2, 4), 16),
    b: Number.parseInt(full.slice(4, 6), 16)
  }
}

function rgbToHsl({ r, g, b }: RgbColor): HslColor {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const delta = max - min

  let h = 0
  if (delta !== 0) {
    if (max === rn) h = ((gn - bn) / delta) % 6
    else if (max === gn) h = (bn - rn) / delta + 2
    else h = (rn - gn) / delta + 4
  }
  h = normalizeHue(h * 60)

  const l = (max + min) / 2
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1))
  return { h, s: s * 100, l: l * 100 }
}

function hslToRgb({ h, s, l }: HslColor): RgbColor {
  const normalizedH = normalizeHue(h)
  const sn = s / 100
  const ln = l / 100
  const c = (1 - Math.abs(2 * ln - 1)) * sn
  const hp = normalizedH / 60
  const x = c * (1 - Math.abs((hp % 2) - 1))
  /** 색상환을 60°씩 여섯 구간으로 끊는다. `hp` 는 [0,6) 이라 정수부가 곧 구간 번호다. */
  const 구간s: readonly (readonly [number, number, number])[] = [
    [c, x, 0], [x, c, 0], [0, c, x],
    [0, x, c], [x, 0, c], [c, 0, x]
  ]
  const [rn, gn, bn] = 구간s[Math.min(5, Math.max(0, Math.floor(hp)))]!

  const m = ln - c / 2
  return {
    r: clampToByte((rn + m) * 255),
    g: clampToByte((gn + m) * 255),
    b: clampToByte((bn + m) * 255)
  }
}

// ─────────────────────────────  팔레트에서 가장 가까운 색  ─────────────────────────────

/**
 * `color` 와 RGB 거리가 가장 가까운 팔레트 칸의 번호. 축 이동(`AXES.primary.indexOf`)이
 * 저장값을 눈금으로 되돌릴 때 쓴다 — 저장된 hex가 팔레트에 없어도(옛 값·완제품) 제자리를 찾는다.
 *
 * hex로 안 읽히면 문자열이 똑같은 칸을 찾고, 그것도 없으면 팔레트 한가운데를 준다.
 */
export function nearestPrettyPrimaryIndex(color: string, palette: readonly string[]): number {
  const rgb = parseHexToRgb(color)
  if (!rgb) {
    const exact = palette.findIndex(p => p.toLowerCase() === color.trim().toLowerCase())
    return exact === -1 ? Math.floor(palette.length / 2) : exact
  }

  let best = 0
  let bestD = Infinity
  for (let i = 0; i < palette.length; i++) {
    const pr = parseHexToRgb(palette[i]!)
    if (!pr)
      continue
    const d = (rgb.r - pr.r) ** 2 + (rgb.g - pr.g) ** 2 + (rgb.b - pr.b) ** 2
    if (d < bestD) {
      bestD = d
      best = i
    }
  }
  return best
}

// ─────────────────────────────  워시(레이아웃 보색 두 점)  ─────────────────────────────

const FALLBACK_PRIMARY: RgbColor = { r: 59, g: 130, b: 246 }
const PRIMARY_HUE_SHIFT_DEGREES = 70
const ACHROMATIC_SATURATION = 8
/** 채도 상한. 이게 6이라 어떤 강조색을 골라도 워시는 회색조로 깔린다 — `layout-soft-dashboard-bg.css` 참고. */
const WASH_MAX_SATURATION = 6
const WASH_LIGHTNESS = [62, 44] as const
const MIN_HUE_SPREAD_DEGREES = 15

function softenForWash(color: RgbColor, hueOffset: number, lightness: number): RgbColor {
  const hsl = rgbToHsl(color)

  return hslToRgb({
    h: normalizeHue(hsl.h + hueOffset),
    s: Math.min(WASH_MAX_SATURATION, hsl.s),
    l: lightness
  })
}

/** 두 색이 눈에 갈릴 만큼 벌어졌나. 한쪽만 무채색이면 그것으로 갈리고, 둘 다 유채색이면 색상각으로 잰다. */
function hasEnoughSpread(a: RgbColor, b: RgbColor): boolean {
  const [ha, hb] = [rgbToHsl(a), rgbToHsl(b)]
  const [aChroma, bChroma] = [ha.s > ACHROMATIC_SATURATION, hb.s > ACHROMATIC_SATURATION]
  if (!aChroma || !bChroma)
    return aChroma !== bChroma

  const d = Math.abs(normalizeHue(ha.h) - normalizeHue(hb.h))
  return (d > 180 ? 360 - d : d) >= MIN_HUE_SPREAD_DEGREES
}

export function washVars(primaryHex: unknown, secondaryHex: unknown): [string, string][] {
  const primary = parseHexToRgb(primaryHex) ?? FALLBACK_PRIMARY
  const secondary = parseHexToRgb(secondaryHex)

  const [밝은, 어두운] = WASH_LIGHTNESS
  /** 보조색이 강조색과 충분히 벌어졌을 때만 쓴다. 아니면 강조색 하나를 ±70° 로 갈라 두 점을 만든다. */
  const [c1, c2] = secondary && hasEnoughSpread(primary, secondary)
    ? [softenForWash(primary, 0, 밝은), softenForWash(secondary, 0, 어두운)]
    : [
        softenForWash(primary, -PRIMARY_HUE_SHIFT_DEGREES, 밝은),
        softenForWash(primary, PRIMARY_HUE_SHIFT_DEGREES, 어두운)
      ]

  return [
    ['--layout-complement-1-rgb', `${c1.r} ${c1.g} ${c1.b}`],
    ['--layout-complement-2-rgb', `${c2.r} ${c2.g} ${c2.b}`]
  ]
}

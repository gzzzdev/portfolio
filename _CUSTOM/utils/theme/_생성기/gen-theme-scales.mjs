/**
 * 테마 색 스케일 생성기 — `bun _CUSTOM/utils/theme/_생성기/gen-theme-scales.mjs`
 *
 * 선별 팔레트의 단색 hex 하나를 받아 Nuxt UI 가 요구하는 **11단계 스케일**로 부풀린다.
 * 결과는 `app/components/m/테마/색사다리.gen.ts` 에 상수로 박힌다 —
 * 런타임 색 연산을 없애고, 마음에 안 드는 단계는 손으로 고칠 수 있게 하기 위해서다.
 * (손으로 고친 뒤 이 스크립트를 다시 돌리면 덮어쓰므로, 수정본은 생성기 쪽에 반영할 것)
 *
 * 왜 스케일이 필요한가: Nuxt UI 컴포넌트 테마 전체가 `--ui-color-{alias}-{50..950}` 위에 얹혀
 * 있다. 11칸을 같은 색으로 채우면(예전 `flatColorScale`) subtle variant·hover 가 구분되지 않는다.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { PRETTY_PRIMARY_PALETTE } from '../색.ts'

// ── sRGB ↔ OKLab ────────────────────────────────────────────
const f = c => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
const g = c => (c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055)

function hexToOklch(hex) {
  const h = hex.replace('#', '')
  const [r, gg, b] = [0, 2, 4].map(i => f(Number.parseInt(h.slice(i, i + 2), 16) / 255))
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * gg + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * gg + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * gg + 0.6299787005 * b)
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s
  const C = Math.hypot(A, B)
  let H = (Math.atan2(B, A) * 180) / Math.PI
  if (H < 0) H += 360
  return { L, C, H }
}

function oklchInGamut(L, C, H) {
  const a = C * Math.cos((H * Math.PI) / 180)
  const b = C * Math.sin((H * Math.PI) / 180)
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3
  const rgb = [
    g(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    g(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    g(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s)
  ]
  return rgb.every(v => v >= -0.001 && v <= 1.001)
}

/** sRGB 밖으로 나간 채도를 이분탐색으로 끌어내림 — 단계가 회색으로 뭉개지는 것보다 낫다 */
function clampChroma(L, C, H) {
  if (oklchInGamut(L, C, H)) return C
  let lo = 0, hi = C
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2
    if (oklchInGamut(L, mid, H)) lo = mid
    else hi = mid
  }
  return lo
}

// ── 사다리 (Tailwind 4 유채색 스케일에서 뽑은 모양) ──────────
const SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]
/** 명도 사다리 — 인덱스 5(=500)가 고른 색이 앉는 자리 */
const L_LADDER = [0.970, 0.932, 0.882, 0.809, 0.707, 0.623, 0.546, 0.488, 0.424, 0.379, 0.282]
/** 채도 사다리 — 500 대비 배율. 600~700 이 가장 진하다 */
const C_RATIO = [0.065, 0.150, 0.276, 0.490, 0.771, 1.000, 1.145, 1.136, 1.019, 0.860, 0.509]

/**
 * 고른 색을 500 자리에 앉히고 위아래로 사다리를 다시 편다.
 *
 * `#000000`·`#ffe629` 처럼 끝에 붙은 색은 그대로 앉히면 한쪽 절반이 통째로 뭉개진다.
 * 스케일 생성에 한해 명도를 0.12~0.90 으로 죄는 이유 — 사용자가 고른 원색 자체는
 * `--ui-{alias}` 로 따로 나가므로 눈에 보이는 색은 바뀌지 않는다.
 */
function scaleFrom(hex) {
  const { L: rawL, C, H } = hexToOklch(hex)
  const L = Math.min(0.90, Math.max(0.12, rawL))
  const topL = Math.max(L_LADDER[0], L + 0.02)
  const botL = Math.min(L_LADDER[10], L * 0.45)

  return SHADES.map((_, i) => {
    let Li
    if (i === 5) Li = L
    else if (i < 5) {
      const t = (L_LADDER[i] - L_LADDER[5]) / (L_LADDER[0] - L_LADDER[5])
      Li = L + t * (topL - L)
    } else {
      const t = (L_LADDER[5] - L_LADDER[i]) / (L_LADDER[5] - L_LADDER[10])
      Li = L - t * (L - botL)
    }
    const Ci = clampChroma(Li, C * C_RATIO[i], H)
    return `oklch(${Li.toFixed(3)} ${Ci.toFixed(3)} ${C < 0.002 ? '0' : H.toFixed(1)})`
  })
}

const header = readFileSync(new URL('./gen-theme-scales.header.txt', import.meta.url), 'utf8')
const body = PRETTY_PRIMARY_PALETTE
  .map(hex => `    '${hex.toLowerCase()}': [\n${scaleFrom(hex).map(v => `        '${v}',`).join('\n')}\n    ],`)
  .join('\n')

const out = `${header}export const PRETTY_COLOR_SCALES: Record<string, readonly string[]> = {\n${body}\n}\n`
writeFileSync(new URL('../색사다리.gen.ts', import.meta.url), out)
console.log(`generated ${PRETTY_PRIMARY_PALETTE.length} scales`)

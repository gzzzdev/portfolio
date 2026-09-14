<template>
  <svg
    :viewBox="`0 0 100 ${vh}`"
    preserveAspectRatio="none"
    class="pointer-events-none block h-full w-full"
    :style="{ opacity: String(opacity) }"
    aria-hidden="true"
  >
    <g
      v-for="(p, i) in prims"
      :key="i"
    >
      <path
        v-if="p.t === 'path'"
        :d="p.d"
        :stroke="p.stroke ?? 'none'"
        :fill="p.fill ?? 'none'"
        :stroke-width="p.sw ?? 0.3"
        :opacity="p.op ?? 1"
        stroke-linecap="round"
        stroke-linejoin="round"
        vector-effect="non-scaling-stroke"
      />
      <circle
        v-else-if="p.t === 'circle'"
        :cx="p.cx"
        :cy="p.cy"
        :r="p.r"
        :stroke="p.stroke ?? 'none'"
        :fill="p.fill ?? 'none'"
        :stroke-width="p.sw ?? 0.3"
        :opacity="p.op ?? 1"
        vector-effect="non-scaling-stroke"
      />
      <rect
        v-else-if="p.t === 'rect'"
        :x="p.x"
        :y="p.y"
        :width="p.w"
        :height="p.h"
        :rx="p.rx ?? 0"
        :stroke="p.stroke ?? 'none'"
        :fill="p.fill ?? 'none'"
        :stroke-width="p.sw ?? 0.3"
        :opacity="p.op ?? 1"
        vector-effect="non-scaling-stroke"
      />
    </g>
  </svg>
</template>

<script setup lang="ts">
/**
 * 카드 출력물의 **아트 레이어**.
 *
 * **지금 이걸 그리는 코드는 없다.** 좌표를 코드가 들던 시절의
 * 물건이고, 그 층이 디자인틀(`app/components/PrintTemplate`)으로 넘어가면서 `renderComps` 의 `MArt` 항목도
 * 같이 걷혔다. 그래도 지우지 않은 이유는 하나다 — 이 저장소에 남은 **유일한 벡터 문양 소스**라,
 * 표식을 래스터(AI 생성 PNG) 말고 벡터로 뽑고 싶어지는 날 처음부터 다시 그릴 일이 없다.
 * 되살리려면 `renderComps` 에 한 줄, `렌더.vue` 의 `compMap` 에 한 줄이면 된다.
 *
 * 여기 그려지는 것에는 회원 데이터가 하나도 들어가지 않는다(전 회원 동일).
 * 그래서 레이아웃 엔진이 필요 없고, div의 사각형·직선 어휘에 갇힐 이유도 없다.
 * 곡선·길로슈·문양처럼 인쇄물의 "정품감"을 만드는 요소를 벡터로 그린다.
 *
 * 좌표계: viewBox `0 0 100 vh` — x는 카드 폭의 %, vh는 (높이/폭)*100.
 * 색은 팔레트에서 주입받으므로 같은 문양을 고객 색으로 재사용할 수 있다.
 */
import { computed } from 'vue'

type Prim
  = | { t: 'path', d: string, stroke?: string, fill?: string, sw?: number, op?: number }
    | { t: 'circle', cx: number, cy: number, r: number, stroke?: string, fill?: string, sw?: number, op?: number }
    | { t: 'rect', x: number, y: number, w: number, h: number, rx?: number, stroke?: string, fill?: string, sw?: number, op?: number }

const props = withDefaults(
  defineProps<{
    /** 문양 종류 */
    kind?: string
    /** viewBox 높이 = (카드높이/카드폭)*100 */
    vh?: number
    color?: string
    color2?: string
    opacity?: number
    /** 문양별 세부 파라미터 */
    inset?: number
    density?: number
    seed?: number
  }>(),
  { kind: '이중프레임', vh: 141.4, color: '#B8860B', color2: '#B8860B', opacity: 1, inset: 6, density: 1, seed: 0 }
)

const n = (v: number) => Math.round(v * 1000) / 1000

/** 사인파 한 줄 → path (길로슈 밴드의 기본 단위) */
function wave(x0: number, x1: number, y: number, amp: number, cycles: number, phase: number, steps = 160) {
  const pts: string[] = []
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const x = x0 + (x1 - x0) * t
    const yy = y + amp * Math.sin(t * cycles * Math.PI * 2 + phase)
    pts.push(`${n(x)},${n(yy)}`)
  }
  return `M${pts.join(' L')}`
}

/**
 * 하이포트로코이드(스피로그래프) — 지폐·증서의 길로슈 로제트가 바로 이 곡선이다.
 * div로는 절대 못 그리는 형태이자, 이 레이어를 분리한 이유 그 자체.
 */
function rosette(cx: number, cy: number, R: number, r: number, d: number, steps = 900) {
  const pts: string[] = []
  const k = (R - r) / r
  // r과 R의 최소공배수 주기만큼 돌아야 닫힌 곡선이 된다 → 넉넉히 회전
  const turns = r / gcd(Math.round(R), Math.round(r))
  for (let i = 0; i <= steps; i++) {
    const th = (i / steps) * Math.PI * 2 * turns
    const x = cx + (R - r) * Math.cos(th) + d * Math.cos(k * th)
    const y = cy + (R - r) * Math.sin(th) - d * Math.sin(k * th)
    pts.push(`${n(x)},${n(y)}`)
  }
  return `M${pts.join(' L')}Z`
}

function gcd(a: number, b: number): number { return b === 0 ? Math.abs(a) : gcd(b, a % b) }

/** 모서리 스크롤 장식 (10×10 박스에 그린 뒤 네 귀퉁이로 변환) */
const CORNER = 'M0,10 C0,5 2.6,1.4 7.2,0 C4.6,1.9 3,4.4 2.4,7.2 C2.1,8.5 1.3,9.4 0,10 Z'

function cornerAt(x: number, y: number, sx: number, sy: number, size: number) {
  // path를 직접 변환해 넣기 위해 스케일·미러를 좌표로 반영
  const parse = CORNER.match(/-?\d+(\.\d+)?/g)!.map(Number)
  let i = 0
  const map = (v: number, axis: 0 | 1) =>
    axis === 0 ? n(x + sx * (v / 10) * size) : n(y + sy * (v / 10) * size)
  return CORNER.replace(/-?\d+(\.\d+)?/g, () => {
    const v = parse[i]
    const out = map(v!, (i % 2) as 0 | 1)
    i++
    return String(out)
  })
}

const prims = computed<Prim[]>(() => {
  const H = props.vh
  const c = props.color
  const c2 = props.color2 || props.color
  const inset = props.inset
  const out: Prim[] = []

  switch (props.kind) {
    /* ── 이중 금선 프레임 + 모서리 스크롤 ── */
    case '이중프레임': {
      out.push({ t: 'rect', x: inset, y: inset, w: 100 - inset * 2, h: H - inset * 2, stroke: c, sw: 1.2 })
      out.push({ t: 'rect', x: inset + 1.8, y: inset + 1.8, w: 100 - (inset + 1.8) * 2, h: H - (inset + 1.8) * 2, stroke: c2, sw: 0.5, op: 0.7 })
      const s = 5.2
      const i2 = inset + 2.6
      out.push({ t: 'path', d: cornerAt(i2, i2, 1, 1, s), fill: c, op: 0.75 })
      out.push({ t: 'path', d: cornerAt(100 - i2, i2, -1, 1, s), fill: c, op: 0.75 })
      out.push({ t: 'path', d: cornerAt(i2, H - i2, 1, -1, s), fill: c, op: 0.75 })
      out.push({ t: 'path', d: cornerAt(100 - i2, H - i2, -1, -1, s), fill: c, op: 0.75 })
      break
    }

    /* ── 길로슈 밴드: 프레임 위·아래를 도는 물결 (판화 느낌) ── */
    case '길로슈띠': {
      const lines = Math.max(3, Math.round(7 * props.density))
      const x0 = inset + 3, x1 = 100 - inset - 3
      for (const y of [inset + 5.5, H - inset - 5.5]) {
        for (let i = 0; i < lines; i++) {
          const ph = (i / lines) * Math.PI * 2
          out.push({ t: 'path', d: wave(x0, x1, y, 1.5, 9, ph), stroke: c, sw: 0.25, op: 0.5 })
        }
      }
      break
    }

    /* ── 길로슈 로제트: 중앙 워터마크 (하이포트로코이드) ── */
    case '길로슈로제트': {
      const cx = 50, cy = H / 2
      const R = 30 * props.density
      for (let i = 0; i < 4; i++) {
        out.push({
          t: 'path',
          d: rosette(cx, cy, R, R / (7 + i), R / (2.6 + i * 0.35)),
          stroke: c, sw: 0.22, op: 0.55 - i * 0.08
        })
      }
      break
    }

    /* ── 원형 엠블럼: 톱니 링 + 이중 원 + 내부 로제트 (표식 대체) ── */
    case '엠블럼': {
      const cx = 50, cy = props.seed || H / 2 // seed 미지정이면 박스 세로 중앙
      // 반지름은 "자기 박스 대비"다. 좁은 rect(예: 명함 뒷면 패널)에 넣어도 박스를 채우도록
      // 기본값을 크게 잡는다. 예전엔 카드 전체 기준으로 튜닝돼 있어서 rect를 주면 점처럼 작아졌다.
      const R = 36 * props.density
      out.push({ t: 'circle', cx, cy, r: R, stroke: c, sw: 1 })
      out.push({ t: 'circle', cx, cy, r: R * 0.82, stroke: c2, sw: 0.4, op: 0.8 })
      const teeth = 36
      for (let i = 0; i < teeth; i++) {
        const th = (i / teeth) * Math.PI * 2
        const r1 = R, r2 = R * 1.14
        out.push({
          t: 'path',
          d: `M${n(cx + r1 * Math.cos(th))},${n(cy + r1 * Math.sin(th))} L${n(cx + r2 * Math.cos(th))},${n(cy + r2 * Math.sin(th))}`,
          stroke: c, sw: 0.5, op: 0.75
        })
      }
      out.push({ t: 'path', d: rosette(cx, cy, R * 0.62, R * 0.62 / 5, R * 0.62 / 2.2), stroke: c, sw: 0.3, op: 0.85 })
      break
    }

    /* ── 중앙 구분 장식: 가늘어지는 선 + 마름모 (❖ 문자 대체) ── */
    case '가로장식': {
      const cy = props.seed || H / 2
      const half = 22 * props.density
      out.push({ t: 'path', d: `M${50 - half},${cy} L${50 - 4},${cy}`, stroke: c, sw: 0.6, op: 0.8 })
      out.push({ t: 'path', d: `M${50 + 4},${cy} L${50 + half},${cy}`, stroke: c, sw: 0.6, op: 0.8 })
      out.push({ t: 'path', d: `M50,${cy - 2} L${50 + 2},${cy} L50,${cy + 2} L${50 - 2},${cy} Z`, fill: c, op: 0.85 })
      out.push({ t: 'path', d: `M50,${cy - 1} L${50 + 1},${cy} L50,${cy + 1} L${50 - 1},${cy} Z`, fill: '#fff', op: 0.5 })
      break
    }

    /* ── 명함 뒷면 로고: 마름모 겹침 (기존 div 2개로 흉내내던 것) ── */
    case '로고마름모': {
      const cx = 50, cy = props.seed || H / 2
      const R = 30 * props.density // 엠블럼과 동일 기준 — 자기 박스를 채운다
      const dia = (r: number, dy: number) =>
        `M${cx},${n(cy + dy - r)} L${n(cx + r)},${n(cy + dy)} L${cx},${n(cy + dy + r)} L${n(cx - r)},${n(cy + dy)} Z`
      out.push({ t: 'path', d: dia(R, -R * 0.18), stroke: c, sw: 2 })
      out.push({ t: 'path', d: dia(R * 0.34, R * 0.5), fill: c })
      break
    }

    default:
      break
  }
  return out
})
</script>

<template>
  <!--
      격자 하나. 밝은 카드와 어두운 카드가 **한 줄에 섞여** 흐른다 — 모드는 정렬 기준이 아니다
      (`model테마.seed.ts`). 이름표도 구분선도 없다: 나누는 순간 1군·2군이 된다.
    -->
  <div class="grid grid-cols-2 gap-2.5">
    <button
      v-for="p in 카드s"
      :key="p.id"
      type="button"
      class="relative flex flex-col items-stretch gap-1.5 rounded-xl border p-1.5 transition-colors"
      :class="켜진id === p.id
        ? 'border-primary bg-primary/5'
        : 'border-accented hover:border-inverted/20 hover:bg-elevated'"
      @click="행.테마씌우기(p)"
    >
      <!-- 고른 카드 표시. 테두리 하나로는 약해서 체크를 얹는다 (색을 더 칠하는 것보다 조용하다) -->
      <span
        v-if="켜진id === p.id"
        class="absolute -right-1.5 -top-1.5 flex size-4.5 items-center justify-center rounded-full bg-primary text-inverted m-층-카드"
      >
        <UIcon
          name="i-lucide-check"
          class="size-3"
        />
      </span>

      <!-- 미리보기: 그 프리셋의 실제 색·글꼴·라운드·그림자로 그린 축소 화면 -->
      <span
        class="flex h-16 flex-col gap-1 overflow-hidden p-1.5"
        :style="{
          background: p.pv.page,
          border: `1px solid ${p.pv.border}`,
          borderRadius: p.pv.radius,
          boxShadow: p.pv.shadow,
          fontFamily: p.pv.font
        }"
      >
        <span class="flex items-center gap-1">
          <span
            class="h-[3px] w-3.5 rounded-full"
            :style="{ background: p.pv.primary }"
          />
          <span
            class="h-[3px] w-5 rounded-full opacity-45"
            :style="{ background: p.pv.muted }"
          />
        </span>
        <span
          class="flex flex-1 flex-col justify-between p-1"
          :style="{
            background: p.pv.panel,
            border: `1px solid ${p.pv.border}`,
            borderRadius: p.pv.radius
          }"
        >
          <span
            class="text-[0.5625rem] leading-none"
            :style="{ color: p.pv.text, fontWeight: p.pv.weight }"
          >가나다</span>
          <!--
            버튼 **둘**이다. 하나로는 이 테마가 어떻게 생겼는지 못 말한다 — 화면의 버튼은
            거의 다 왼쪽(중립 + 테마 재질)이고, 강조색이 칠하는 건 오른쪽 하나뿐이다
            (`역할="강조"`, 화면당 0~1개). 예전엔 오른쪽만 그렸고 그마저도 실제와 달랐다.

            왼쪽은 **그 카드의 재질**로 그린다(`p.pv.재질`). 2026-09-09 이전에는 현재 축을
            읽었다 — 그때는 프리셋이 재질을 안 날랐기 때문이고, 그래서 선으로 그린 카드와
            면으로 그린 카드가 격자에서 똑같이 보였다. 지금은 카드가 자기 재질을 든다.
          -->
          <span class="flex items-center gap-1">
            <span
              class="px-1.5 py-[2px] text-[0.4rem] leading-none"
              :style="{ ...중립칩(p.pv), borderRadius: p.pv.radius }"
            >취소</span>
            <span
              class="px-1.5 py-[2px] text-[0.4rem] font-bold leading-none"
              :style="{ background: p.pv.primary, color: p.pv.page, borderRadius: p.pv.radius }"
            >저장</span>
          </span>
        </span>
      </span>

      <!--
              이름이 **카드 안**에 있다. 예전엔 줄 머리에 한 번만 적었는데, 그건 두 장이
              이름을 나눠 갖던 시절의 배치다 — 지금은 카드가 다 다른 테마라 각자 이름을 진다.
            -->
      <span class="flex items-baseline gap-1 px-0.5 text-left">
        <span class="text-[0.6875rem] font-bold leading-tight">{{ p.label }}</span>
        <span class="truncate text-[0.5625rem] leading-tight text-dimmed">{{ p.desc }}</span>
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
/**
 * 프리셋 격자 — 완성된 조합을 카드로 고르는 자리. `축줄s`(손잡이 전부)와 함께
 * 테마 표면을 이루는 **두 조각 중 하나**다 (조각/표면 구분은 `축줄s.vue` 머리말이 정본).
 *
 * 2026-09-05 에 `메뉴.vue` 에서 그대로 꺼냈다. 꺼낸 이유는 재사용이 아니라 **자리 이동**이다 —
 * 테마 손잡이가 헤더 팝오버에서 우측 도크 pane(`l/테마.vue`)으로 갔고, 그러면서 마크업의
 * 주인이 바뀌어야 했다. 축 레일이 이미 컴포넌트였던 것과 같은 이유다.
 * (그 축 레일은 2026-09-05 에 환경줄과 합쳐져 `축줄s.vue` 가 됐다.)
 *
 * 위 여백·구분선·묶음 이름표는 여기 없다 — 조각은 자기 안쪽만 알고, 조각들 사이는 표면이 정한다.
 * 2026-09-05 에 헤더 줄(`테마` 라벨 + 무작위)도 같은 이유로 나갔다: 무작위가 굴리는 축이
 * 정확히 「생김새」 묶음이라 그 묶음의 손잡이가 맞다 (`무작위.vue` 머리말).
 *
 * ## 격자 하나, 카드가 섞여 흐른다 (2026-09-05)
 *
 * 세 번 고쳤고, 세 번 다 **모드가 목록에서 차지하는 자리**가 문제였다:
 *
 * 1. 처음엔 열두 장을 들고 **현재 화면 모드로 걸렀다** — 여섯 장만 보였고, 어두운 판을 보려면
 *    먼저 화면을 어둡게 바꿔야 했다. 그래서 화면 모드 줄이 격자 **위**에 있어야 했다.
 * 2. 다음엔 밝게|어둡게를 **한 줄에 한 쌍**으로 나란히 놓았다. 프리셋이 짝을 안 이루게 되면서
 *    버렸다 — 나란히 놓으면 오른쪽이 왼쪽의 어두운 판으로 읽히는데 그런 관계가 없다.
 * 3. 그다음엔 「밝은 화면」·「어두운 화면」 **두 무리**로 묶었다. 이것도 버렸다. 짝은 아니어도
 *    밝은 넷이 통째로 먼저 오고 어두운 넷이 통째로 나중에 오면 그건 순서가 아니라 **등급**이다
 *    — 한 벌이 아니라 1군과 2군이 있는 것으로 읽힌다.
 *
 * 지금은 **격자 하나**다. 이름표도 구분선도 없고, 목록 순서는 **표의 행 순서**가 그대로 준다
 * (처음 붓는 순서 — `model테마.seed.ts`). 모드가 정렬 기준이 아니라서 밝은 카드와
 * 어두운 카드가 규칙적으로 번갈지도, 뭉치지도 않고 섞인다 — **왼쪽 칸이 밝은 쪽으로 굳지
 * 않는 것이 이 배치가 맞는지 보는 방법이다.**
 *
 * 이름은 **카드마다** 붙는다(카드가 다 다른 테마다). 카드를 누르면 축과 **화면 모드가 같이**
 * 간다(`model테마.테마씌우기`). 그래서 화면 모드 줄은 격자 **아래**로 내려갔다 (`l/테마.vue`).
 *
 * 미리보기는 현재 모드가 아니라 **그 카드 자신의 모드**로 그린다. 그래서 카드가 자기 모드를
 * 스스로 말한다 — 이름표로 묶지 않아도 어두운 카드는 눈에 어둡게 보인다.
 *
 * 왜 축 슬라이더가 아니라 카드인가:
 * - 슬라이더는 "정답이 없으니 네가 맞춰라"는 컨트롤이라, 여덟 개가 쌓이면 결정을 여덟 번 해야 하고
 *   끝나는 지점이 없다. 업무용 관리 도구에서 그건 원하지 않은 숙제다.
 * - 카드는 선택지가 유한하고 한 번 고르면 끝난다. 카드에 되돌리기가 없는 것도 그래서다 — 다시 고르면 된다.
 *   되돌리기(`i-lucide-undo-2`)가 붙은 곳은 **무작위 옆 하나**뿐이다. 굴려서 나온 조합은 어디서 왔는지 모르니
 *   다시 고를 수가 없다.
 *
 * 값은 행을 거쳐 스토어에만 앉는다. DOM(CSS 변수) 적용은 `plugins/01.theme-sync.client.ts`.
 * 하이드레이션 전에는 저장값이 아직 안 붙으므로 **호출부가 `ClientOnly` 로 감싼다**.
 */
import { depthShadow } from '~utils/theme/css'
import { 글꼴options } from '~utils/theme/축'
import { 배경s } from '~utils/theme/색'
import { matchPresetId, model테마s, 현재테마행, 완제품카드s, type PresetMode, type ThemePreset } from '~models/(system)'

/**
 * 카드를 씌우는 것도 재질 축을 읽는 것도 **현재 테마 행**을 거친다(`model테마`).
 * 스토어를 직접 부르지 않는 이유는 `m/테마/무작위.vue` 머리말 — 입구가 둘이면 범위가 갈린다.
 * 행은 값을 안 들고 스토어를 비추는 껍데기라 이렇게 한 번 잡아 둬도 낡지 않는다.
 */
const 행 = 현재테마행()
const colorMode = useColorMode()

/**
 * 목록은 `theme` 표에서 온다(`~models/(system)/model테마`). 예전엔 코드 안의 배열이었고, 카드를 한 장 더
 * 놓으려면 배포가 필요했다. **첫 행은 빼고 읽는다** — 그 자리는 완제품이 아니라 현재 테마다. **여기서 읽어도 되는 이유는 이 조각이 통째로 `ClientOnly` 안이라서다**
 * (`l/테마.vue`) — SSR 첫 페인트는 이 격자를 아예 안 그리므로 표를 기다릴 일이 없다.
 */
const 완제품repo = model테마s.getInstance()
onMounted(() => { void 완제품repo.reads() })

/** 아홉 번째 카드의 id. 표의 PK 와 겹칠 수 없는 값이면 되고, 겹치면 `find` 가 표를 먼저 잡는다. */
const 직접맞춤id = '직접맞춤'

const 현재모드 = computed<PresetMode>(() => (colorMode.value === 'dark' ? 'dark' : 'light'))

/**
 * 프리셋의 실제 값으로 미리보기 색을 뽑는다.
 * 명도는 **그 카드의 모드**가 정한다(현재 화면 모드가 아니라) — 색온도 축은 중립 사다리의
 * 색조만 정하므로 같은 사다리가 밝게/어둡게 양쪽에서 성립한다.
 */
function 미리보기(p: ThemePreset) {
  const c = (배경s.find(b => b.colors[5] === p.theme.bg) ?? 배경s[0]!).colors
  const dark = p.mode === 'dark'
  return {
    // 밝은 모드에서 c[0] 은 다섯 색조가 거의 같은 흰색이라 차이가 안 보인다 → 한 칸 진하게
    page: dark ? c[10]! : c[1]!,
    panel: dark ? c[9]! : '#ffffff',
    border: dark ? c[8]! : c[2]!,
    text: dark ? c[1]! : c[9]!,
    muted: c[5]!,
    // 파임 — 중립 버튼의 soft·subtle 면이 딛고 서는 칸 (`bg-elevated`)
    elevated: dark ? c[7]! : c[1]!,
    // 재질도 카드가 든다(2026-09-09, `완제품축s`) → 지금 축이 아니라 **그 카드의** 값을 그린다.
    // 전에는 `행.재질`(현재 테마)이었다. 프리셋이 안 나르던 값이라 그럴 수밖에 없었고,
    // 그래서 선으로 그린 카드와 면으로 그린 카드가 격자에서 똑같이 보였다.
    재질: p.theme.variant,
    primary: p.theme.primary,
    weight: String(p.theme.weight),
    // 축 값(rem)을 그대로 쓰면 62px 카드에선 과하다 — 비율만 유지해 px 로 죈다
    radius: `${Math.min(p.theme.radius * 8, 8)}px`,
    // 미리보기 카드는 '카드' 층이다 — 축과 같은 함수로 뽑으므로 실제 화면과 어긋날 수 없다.
    // (예전엔 여기에 자기만의 그림자 표를 따로 들고 있었다)
    // 강조색을 넘기는 것은 다크 후광 때문이다. 안 넘기면 카드들이 전부 **지금** 테마 색으로
    // 빛나서, 고르기 전에 어떻게 보일지 보여주는 자리가 거짓말을 한다. 지금 조합
    // (`DARK_RECIPE` = 흰 후광만)에는 강조색이 안 들어가 눈에 띄는 차이가 없지만,
    // 값의 주인이 프리셋이라는 건 조합이 바뀌어도 안 변한다.
    shadow: depthShadow(p.theme.elevation, '카드', dark, p.theme.primary),
    font: `var(${글꼴options.find(f => f.value === p.theme.font)?.stackVar ?? '--font-stack-mixed'})`
  }
}

/**
 * 카드가 자기 모드로 그려지므로 **화면 모드에는 안 걸린다** — 목록도 미리보기도 그대로다.
 * computed 인 것은 표(`완제품카드s()`)와 연습장(`행.직접맞춤`)이 둘 다 변하기 때문이다.
 *
 * (2026-09-09 이전에는 재질 축 때문이기도 했다 — 카드가 안 나르는 값이라 미리보기가 현재 축을
 * 읽어야 했다. 지금은 카드가 자기 재질을 들어서 그 이유는 없어졌다.)
 *
 * **여기서 정렬하지 않는다.** 표가 준 순서가 곧 화면의 순서다 — 목록을 여기서 다시 줄 세우면
 * 순서의 주인이 둘이 되고, 그 순간 한쪽이 모드를 다시 물어보게 된다. 직접 맞춤만 **끝에** 붙는다:
 * 완제품이 아니라 연습장이고, 2열 격자에서 완제품들 뒤에 혼자 서는 것이 곧 그 말이다.
 */
const 목록 = computed<ThemePreset[]>(() => {
  const 완제품s = 완제품카드s()
  const d = 행.직접맞춤
  return d ? [...완제품s, { id: 직접맞춤id, label: '직접 맞춤', desc: '손댄 그대로', mode: d.mode, theme: d.theme }] : 완제품s
})

/**
 * 켜진 카드. **판정과 그리기가 같은 목록을 본다** — 그래서 「완제품이 이긴다」는 규칙을 따로 안 쓴다.
 * 직접 맞춤이 목록 끝에 있고 `matchPresetId` 가 처음 맞는 것을 잡으므로, 손댄 조합이 우연히
 * 「비취」와 같아지면 이름 있는 쪽이 켜진다. 두 장이 같이 켜지는 것보다 그게 읽기 쉽다.
 */
const 켜진id = computed(() => matchPresetId(행.축상태(), 현재모드.value, 목록.value) ?? '')

const 카드s = computed(() => 목록.value.map(p => ({ ...p, pv: 미리보기(p) })))

/**
 * 중립 버튼 칩 — **대부분의 버튼이 이 모습이다.** 재질 축의 세 값을 미리보기 크기로 옮긴 것:
 * `outline` 선만 · `soft` 면만 · `subtle` 선+면. (`재질.ts` 의 3단 그대로)
 */
function 중립칩(pv: { 재질: string, border: string, elevated: string, text: string }) {
  if (pv.재질 === 'outline')
    return { background: 'transparent', border: `1px solid ${pv.border}`, color: pv.text }
  if (pv.재질 === 'soft')
    return { background: pv.elevated, border: '1px solid transparent', color: pv.text }
  return { background: pv.elevated, border: `1px solid ${pv.border}`, color: pv.text }
}
</script>

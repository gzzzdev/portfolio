<template>
  <!-- 좁은 자리(`쌓기`)는 라벨이 위로 올라가 줄이 두 배로 높으므로 간격도 더 준다 -->
  <div
    class="flex flex-col"
    :class="쌓기 ? 'gap-[12px]' : 'gap-[8px]'"
  >
    <div
      v-for="줄 in 보일줄s"
      :key="줄.이름"
      class="flex"
      :class="쌓기 ? 'flex-col gap-[4px]' : 'items-center justify-between gap-4'"
    >
      <span class="text-xs text-muted">{{ 줄.이름 }}</span>

      <!--
              트랙 — 칸이 다 보이는 줄. 고른 칸은 알약 하나가 미끄러지는 것으로 끝낸다.
              껍데기와 알약 **둘 다 재질 축이 정한다** (`세그먼티드.ts` — 선택기 칩·탭이 같은
              표를 읽는다). 아래 `재질` 줄이 그 손잡이고, 돌리면 이 판이 스스로 따라 움직인다.
              idx 가 -1 이면 알약을 숨긴다.
              **프리셋 카드를 누르면 이 알약들이 미끄러진다** — 어느 줄이 프리셋 소유인지가 그걸로 보인다.
            -->
      <div
        v-if="줄.종류 === '트랙'"
        class="relative flex rounded-xl p-[2px]"
        :class="스킨.트랙"
      >
        <span
          class="pointer-events-none absolute inset-y-[2px] left-[2px] rounded-lg transition-[transform,opacity] duration-200 ease-out"
          :class="스킨.칸(true)"
          :style="알약(줄.idx, 줄.칸s.length)"
        />
        <button
          v-for="칸 in 줄.칸s"
          :key="칸.key"
          type="button"
          class="relative z-10 flex h-[28px] items-center justify-center rounded-lg leading-none transition-colors"
          :class="[
            쌓기 ? 'min-w-0 flex-1 gap-0.5 text-xs' : [줄.칸폭, 줄.글자, 'gap-1'],
            // 좁은 레일에서 5칸(진하기)은 `가`+점이 칸 폭을 꽉 채워 점이 옆 글자에 붙는다 → 점만 아래로
            쌓기 && 칸.점 ? 'flex-col' : '',
            칸.선택됨 ? 'font-semibold' : '',
            줄.색직접 ? '' : 스킨.글자(칸.선택됨)
          ]"
          :style="칸.스타일"
          :title="칸.제목"
          :aria-label="칸.읽기"
          @click="칸.누르기()"
        >
          <UIcon
            v-if="칸.아이콘"
            :name="칸.아이콘"
            class="size-[14px] shrink-0"
          />
          <!--
                      네모 = 그 칸의 값으로 실제로 그린 미리보기 (선색·라운드·재질·그림자).
                      면(`네모면`)을 깔아 두는 이유: 사다리 맨 끝(선 `없음`·그림자 `없음`)은 값이 아예
                      안 보이는 게 **맞는데**, 면이 없으면 칸이 통째로 빈칸으로 보여 고장으로 읽힌다.
                      그 면은 껍데기와 한 칸 어긋난다 — 재질 축이 껍데기를 파임으로 내리면 같이 내려간다.
                    -->
          <span
            v-if="칸.네모"
            class="shrink-0"
            :class="[칸.네모.크기 ?? 'size-[14px]', 칸.네모.class]"
            :style="칸.네모.style"
          />
          <span
            v-if="칸.글자"
            class="truncate"
          >{{ 칸.글자 }}</span>
          <span
            v-if="칸.점"
            class="size-[6px] shrink-0 rounded-full"
            :style="{ background: 칸.점 }"
          />
        </button>
      </div>

      <!--
              순환 — 21칸짜리 색 둘. 트랙으로는 칸이 손톱보다 작아진다.
              값 하나만 보이는 대신 **폭이 값 개수와 무관하고, 같은 자리를 계속 누르니 눈을
              화면에 둔 채로** 굴릴 수 있다 — 색은 칩이 아니라 적용된 화면을 봐야 아는 값이라 그게 낫다.
              `n/전체` 를 같이 찍는다. 순환의 유일한 약점이 지금 어디쯤인지가 안 보이는 것이라서.
            -->
      <div
        v-else
        class="flex items-center rounded-xl p-[2px]"
        :class="[스킨.트랙, 쌓기 ? '' : 줄.폭]"
      >
        <button
          type="button"
          class="flex size-[24px] shrink-0 items-center justify-center rounded-lg text-dimmed transition-colors hover:bg-elevated hover:text-default"
          :aria-label="`${줄.이름} 이전 값`"
          @click="줄.밀기(-1)"
        >
          <UIcon
            name="i-lucide-chevron-left"
            class="size-[12px]"
          />
        </button>
        <div class="flex min-w-0 flex-1 items-center justify-center gap-1.5 px-1">
          <!-- 색 축은 값이 `#005F73` 이라 점이 따로 필요하다 -->
          <span
            v-if="줄.점"
            class="size-[12px] shrink-0 rounded-full"
            :style="{ background: 줄.점 }"
          />
          <!-- 글꼴 축은 값이 곧 미리보기다 — 이름을 그 글꼴로 찍는다 (`값스타일`) -->
          <span
            class="truncate text-[0.625rem] font-medium leading-none"
            :style="줄.값스타일"
          >{{ 줄.값 }}</span>
          <span class="shrink-0 text-[0.5625rem] leading-none text-dimmed">{{ 줄.위치 }}</span>
        </div>
        <button
          type="button"
          class="flex size-[24px] shrink-0 items-center justify-center rounded-lg text-dimmed transition-colors hover:bg-elevated hover:text-default"
          :aria-label="`${줄.이름} 다음 값`"
          @click="줄.밀기(1)"
        >
          <UIcon
            name="i-lucide-chevron-right"
            class="size-[12px]"
          />
        </button>
      </div>
    </div>

    <!--
          선 진단 — **개발에서만.** 축이 아니라 검사용 스위치다: 세 border 토큰이 거의 같은 칸이라
          오분류가 화면에 안 드러나는데, 켜면 색이 갈려서 드러난다. 근거·색 대응표는 `선진단.ts`.
        -->
    <button
      v-if="선진단 && 개발"
      type="button"
      class="flex items-center justify-center gap-1 rounded-full py-[4px] text-[0.5625rem] leading-none transition-colors hover:bg-elevated"
      :class="선진단켜짐 ? 'text-highlighted' : 'text-dimmed'"
      title="세 border 토큰을 다른 색으로 — 파랑=담는 선 · 빨강=컨트롤 선 · 초록=오분류 · 회색=하드코딩"
      @click="선진단켜짐 = !선진단켜짐"
    >
      <UIcon
        name="i-lucide-scan-line"
        class="size-[12px] shrink-0"
      />선 진단
    </button>
  </div>
</template>

<script setup lang="ts">
/**
 * 축 줄s — 테마 손잡이 **전부**를 한 목록으로 세운다. 한 줄 = 한 축, 라벨 왼쪽 · 컨트롤 오른쪽.
 *
 * ## 왜 하나로 합쳤나 (2026-09-05)
 *
 * 전에는 두 조각이었다 — `환경줄.vue`(위, 늘 보임)와 `패널.vue`(왼쪽 레일, 접혀 있음).
 * 가른 기준은 **"프리셋이 이 값을 덮는가"**였는데, 그건 값의 주인이 누구냐는 **구현 쪽 기준**이고
 * 쓰는 사람 머릿속의 기준은 **"뭘 조절하려는 거냐"**다. 그래서 진하기·선 진하기를 만지다가
 * 그림자도 같이 보고 싶으면 접힌 레일을 또 열어야 했다 — 사용자에겐 한 덩어리인 셋이
 * 구현 기준으로 두 군데에 흩어져 있었다.
 *
 * 게다가 그 구분은 원래 **팝오버의 좌/우 배치**로만 존재했다. 좌/우는 "종류가 다르다"를 말하지만
 * 도크에는 좌우가 없어 **접힘/펼침**으로 번역됐고, 접힘은 "종류가 다름"이 아니라 **"덜 중요함"**
 * 으로 읽힌다. 성격 구분이 화면에서 안 보였던 진짜 이유다.
 *
 * **"프리셋이 덮는 값"은 이제 숨겨서 말하지 않는다** — 생김새 줄들을 격자 옆에 두면, 카드를
 * 누를 때 그 줄들의 알약만 미끄러지는 게 그대로 보인다. 접기보다 정직한 설명이다.
 * 묶음과 순서는 조각이 아니라 **표면**이 정한다 (`l/테마.vue`).
 *
 * ## 컨트롤은 축 성질이 정한다
 *
 * 기준은 칸 수가 아니라 **한 칸에 그 값을 그려두면 판단이 되는가**다.
 *
 * - **트랙**(세그먼티드, 칸이 다 보임) — 그려서 판단이 되는 축. `가` 의 크기·색, 네모의
 *   선색·라운드·그림자·재질을 **그 칸의 실제 값으로** 찍는다. 「보통/크게」라는 말은 얼마나
 *   큰지를 안 알려주지만 찍어놓은 글자는 알려준다. 그러면 이름이 필요 없어서 칸이 좁아도 된다.
 * - **순환**(`‹ 값 ›`) — 그려도 판단이 안 되는 축. 셋이다:
 *   - 강조색·보조색 — 21칸이라 트랙에 담으면 칸이 손톱보다 작아진다.
 *   - 글꼴 — 한글 산세리프 넷은 14px `가` 한 글자로 못 가른다. 이름을 읽어야 하는데 이름은
 *     넷을 나란히 놓을 폭이 없다.
 *
 *   글꼴은 미리보기가 따로 없다 — **이름을 그 글꼴로 찍으면 그게 곧 미리보기다.**
 *   `가` 를 옆에 하나 더 세웠다가 뺐다(2026-09-05): 글자가 이미 나와 있는 자리에 글자를
 *   또 놓는 것이라 중복이고, 이름이 그 글꼴로 서 있으면 넉 자가 한 자보다 잘 보여준다.
 *   색은 값이 `#005F73` 이라 스스로를 못 보여줘서 점이 따로 붙는다.
 *
 *   대신 순환은 **폭이 값 개수와 무관하고, 같은 자리를 계속 누르니 눈을 화면에 둔 채로** 굴린다 —
 *   색·글꼴은 어차피 적용된 화면을 봐야 아는 값이라 그게 맞다. 잃는 것은 지금 어디쯤인지라
 *   `n/전체` 를 같이 찍는다.
 *   (예전 레일은 왼쪽 24px 만 `이전`이고 나머지 전체가 `다음`이었다 — `›` 가 없어 그걸 알 길이
 *    없었다. 좌우 대칭으로 되돌리고 가운데는 표시로만 둔다.)
 *
 * ## 상자는 px, 글자는 rem (2026-09-05)
 *
 * `글자 크기` 축은 html 에 `font-size: 125%` 를 건다 — **rem 으로 적은 것은 전부 25% 커진다.**
 * 글자가 커지는 건 부탁받은 일이지만 **칸 높이·안쪽 여백·아이콘·간격까지 같이 커지는 건 아무도
 * 안 부탁했다.** 그 25% 가 열두 줄에 쌓여 77px 이 되고, 그만큼 테마 pane 의 격자가 밀려났다.
 *
 * 그래서 **높이를 만드는 값은 px 로 적는다** (`h-[28px]`·`p-[2px]`·`gap-[8px]`·`size-[14px]`).
 * 글자 크기(`text-*`)와 칸 **너비**(`w-9` …)는 rem 그대로다 — 글자는 커져야 하고, 너비는
 * 커진 글자가 앉을 자리라서 같이 커지는 게 맞다. 상자는 그 자리에 앉는 그릇이라 안 커진다.
 *
 * 알약 폭 계산(`알약()`)이 `calc((100% - 4px) / n)` 인 것도 이것 때문이다 — 껍데기 `p-[2px]`
 * 두 쪽과 **같은 단위여야** 알약이 칸에 딱 맞는다. 한쪽만 rem 으로 되돌리면 조용히 어긋난다.
 *
 * ## 쓰는 법
 * - `<M테마축줄s />` — 열두 줄 전부. 넉넉한 폭(≥ 20rem)에서.
 * - `<M테마축줄s 쌓기 />` — 라벨 위 · 컨트롤 아래. 좁은 레일용.
 * - `<M테마축줄s :줄s="['진하기', '선 진하기']" />` — 그 축을 설명하는 자리 옆에 붙일 때.
 * - `<M테마축줄s 선진단 />` — 맨 아래에 개발용 선 진단 스위치를 붙인다.
 *
 * 값은 스토어만 바꾼다. DOM(CSS 변수) 적용은 `plugins/01.theme-sync.client.ts`.
 * 하이드레이션 전에는 저장값이 아직 안 붙으므로 **호출부가 `ClientOnly` 로 감싼다**.
 */
import { 글꼴options, 그림자options, 글자크기options, 라운드options, 색온도options, 선진하기options, 재질options, 줄간격options, 진하기options, type ColorModePreference, type ThemeAxisName } from '~utils/theme/축'
import { contrastBodyColor, contrastBorderColor, contrastPartColor, depthShadow, use선진단 } from '~utils/theme/css'
import { useSegmentSkin } from '~base-comps/m/_스킨'
import { 현재테마행 } from '~models/(system)'

export type 축줄이름
  = '화면' | '글자 크기' | '줄간격' | '진하기' | '선 진하기' | '그림자'
    | '강조색' | '보조색' | '색온도' | '글꼴' | '라운드' | '재질'

const props = withDefaults(defineProps<{
  /** 보일 줄과 순서. 기본은 전부 */
  줄s?: 축줄이름[]
  /** 좁은 자리용 — 라벨을 컨트롤 위로 올리고 칸이 폭을 나눠 갖는다 */
  쌓기?: boolean
  /** 맨 아래에 개발용 선 진단 스위치를 붙인다 */
  선진단?: boolean
}>(), {
  // 기본 순서 — 읽기(환경·시력) 먼저, 생김새(취향) 뒤. 묶음 제목은 표면이 붙인다.
  // (`defineProps` 는 호이스팅돼서 지역 상수를 못 본다 — 그래서 여기 직접 적는다)
  줄s: (): 축줄이름[] => [
    '화면', '글자 크기', '줄간격', '진하기', '선 진하기', '그림자',
    '강조색', '보조색', '색온도', '글꼴', '라운드', '재질'
  ],
  쌓기: false,
  선진단: false
})

/**
 * 축을 읽고 미는 일은 전부 **현재 테마 행**을 거친다(`model테마`). 스토어를 직접 부르지 않는
 * 이유는 `m/테마/무작위.vue` 머리말 — 같은 일에 입구가 둘이면 범위가 조용히 갈린다.
 * 행은 값을 안 들고 스토어를 비추는 껍데기라 이렇게 한 번 잡아 둬도 낡지 않는다.
 */
const 행 = 현재테마행()
const colorMode = useColorMode()

/**
 * 껍데기·칸·글자는 세그먼티드 스킨을 그대로 쓴다 (`세그먼티드.ts`) — 선택기 칩·탭과 같은 표다.
 * 재질 축을 돌리면 이 판이 통째로 한 벌에서 다른 벌로 넘어간다.
 *
 * 이 판이 유일하게 더 지는 것: **칸 안에 중립 미리보기 네모를 그린다.** 그래서 그 칸이 실제로
 * 깔고 앉은 면(`칸면`)을 읽어 한 칸 비켜 앉는다 — 같은 칸에 그리면 미리보기가 바탕에 먹혀
 * 빈칸으로 읽힌다. **고른 칸과 안 고른 칸이 서로 다른 면 위에 있을 수 있어서**(면·선+면 재질에서
 * 고른 칸만 종이로 뜬다) 줄 단위가 아니라 **칸 단위**로 정해야 한다.
 */
const 스킨 = useSegmentSkin()

/** 미리보기 네모의 기본 면 — 칸이 종이면 파임으로, 칸이 파임이면 종이로 */
const 네모면 = (선택됨: boolean) => (스킨.value.칸면(선택됨) === '종이' ? 'bg-muted' : 'bg-default')

/** 재질 줄만은 면 자체가 미리보기다 — 「면 있음」 칸도 바탕과 안 겹치는 칸으로 올린다 */
const 재질면 = (선택됨: boolean) => (스킨.value.칸면(선택됨) === '종이' ? 'bg-elevated' : 'bg-accented')

const isDark = computed(() => colorMode.value === 'dark')

/** 글꼴은 순환이라 이름과 스택을 직접 뽑는다 (트랙이면 칸이 알아서 든다) */
const 글꼴현재 = computed(() => 글꼴options[행.축위치('font')] ?? 글꼴options[0]!)
const 글꼴라벨 = computed(() => 글꼴현재.value.label)
const 글꼴스택 = computed(() => 글꼴현재.value.stackVar)

/** 팔레트 밖 색이 저장돼 있어도 `#RRGGBB` 로 잘라 찍는다 */
function 색라벨(hex: unknown) {
  return typeof hex === 'string' && hex.startsWith('#') ? hex.slice(0, 7).toUpperCase() : '색'
}

const 개발 = import.meta.dev
const 선진단켜짐 = use선진단()

/** 시스템은 기기 설정(`prefers-color-scheme`)을 따라간다 — 알약은 그려지는 값이 아니라 선호를 짚는다 */
const 화면s = [
  { value: 'light', label: '밝게', icon: 'i-ph-sun-light' },
  { value: 'dark', label: '어둡게', icon: 'i-material-symbols-light-dark-mode-outline' },
  { value: 'system', label: '시스템', icon: 'i-ph-desktop-light' }
] as const

function 화면바꾸기(v: ColorModePreference) {
  행.화면선호 = v
}

/** 칸 n 개짜리 트랙에서 idx 번째 칸을 덮는 알약. p-0.5 두 쪽(0.25rem)을 뺀 폭을 n 등분한다 */
function 알약(idx: number, n: number) {
  return {
    width: `calc((100% - 4px) / ${n})`,
    transform: `translateX(${Math.max(idx, 0) * 100}%)`,
    opacity: idx < 0 ? 0 : 1
  }
}

interface 네모정의 {
  class?: string
  /** 기본 `size-3.5`. 그림자처럼 **바깥으로** 번지는 값은 앉을 자리가 더 필요하다 */
  크기?: string
  style?: Record<string, string>
}

interface 칸정의 {
  key: string
  아이콘?: string
  글자?: string
  /** 오른쪽에 찍는 점 — 그 단계의 실제 잉크색 */
  점?: string
  /** 그 칸의 값으로 실제로 그린 미리보기 사각 (선색·라운드·재질·그림자) */
  네모?: 네모정의
  스타일?: Record<string, string>
  제목?: string
  읽기?: string
  선택됨: boolean
  누르기: () => void
}

interface 트랙줄 {
  종류: '트랙'
  이름: 축줄이름
  /** 세그먼티드 인디케이터 위치. 목록 밖이면 -1 */
  idx: number
  /** 라벨 오른쪽에 눕힐 때의 칸 폭 (`쌓기` 에서는 안 쓴다) */
  칸폭: string
  글자: string
  /** 칸이 색을 직접 칠하는 줄인가 — 그러면 중립 글자색 클래스를 안 얹는다 */
  색직접?: boolean
  칸s: 칸정의[]
}

interface 순환줄 {
  종류: '순환'
  이름: 축줄이름
  폭: string
  /** 값 왼쪽 미리보기 — 색 점. 색 축처럼 값(`#005F73`)이 스스로를 못 보여줄 때만 쓴다 */
  점?: string
  값: string
  /** 값 자체를 미리보기로 쓸 때 — 글꼴 축은 이름을 그 글꼴로 찍는다 */
  값스타일?: Record<string, string>
  위치: string
  밀기: (d: number) => void
}

type 줄정의 = 트랙줄 | 순환줄

/** 축 하나를 트랙 줄로 — 칸 미리보기(`그리기`)만 축마다 다르다 */
function 축트랙<T>(
  이름: 축줄이름,
  축: ThemeAxisName,
  칸s: readonly T[],
  그리기: (v: T, i: number, 선택됨: boolean) => Omit<칸정의, 'key' | '선택됨' | '누르기'>,
  옵션: { 칸폭?: string, 글자?: string, 색직접?: boolean } = {}
): 트랙줄 {
  const 현재 = 행.축위치(축)
  return {
    종류: '트랙',
    이름,
    idx: 현재,
    칸폭: 옵션.칸폭 ?? 'w-9',
    글자: 옵션.글자 ?? 'text-sm',
    색직접: 옵션.색직접,
    칸s: 칸s.map((v, i) => ({
      key: String(i),
      ...그리기(v, i, 현재 === i),
      선택됨: 현재 === i,
      누르기: () => 행.축앉히기(축, i)
    }))
  }
}

/** 순환 줄 — `n/전체` 는 순환이 지금 어디쯤인지를 못 보여주는 것에 대한 보상이다 */
function 축순환(
  이름: 축줄이름,
  축: ThemeAxisName,
  값: string,
  미리보기: Pick<순환줄, '점' | '값스타일'>
): 순환줄 {
  return {
    종류: '순환',
    이름,
    폭: 'w-[11rem]',
    ...미리보기,
    값,
    위치: `${행.축위치(축) + 1}/${행.축길이(축)}`,
    밀기: (d: number) => 행.축밀기(축, d)
  }
}

const 모든줄s = computed<Record<축줄이름, 줄정의>>(() => ({

  // ── 읽기 ────────────────────────────────────────────────
  '화면': {
    종류: '트랙',
    이름: '화면',
    idx: 화면s.findIndex(m => m.value === colorMode.preference),
    칸폭: 'w-[3.75rem]',
    글자: 'text-xs',
    칸s: 화면s.map(m => ({
      key: m.value,
      아이콘: m.icon,
      글자: m.label,
      선택됨: colorMode.preference === m.value,
      누르기: () => 화면바꾸기(m.value)
    }))
  },

  /**
   * 라벨(보통/크게/아주 크게)은 폭만 잡아먹는다 — `가` 를 실제 배율로 찍으면 그게 곧 미리보기다.
   *
   * **이 둘은 손으로 짜여 있었다.** 축이 아니어서 `축트랙` 이 못 쓰는 값이었기 때문인데,
   * 2026-09-09 에 축이 되면서(`AXES`) 다른 줄과 다를 이유가 없어졌다 — 40줄이 두 줄이 됐다.
   */
  '글자 크기': 축트랙('글자 크기', 'fontScale', 글자크기options, (칸, i) => ({
    글자: '가',
    스타일: { fontSize: `${11 + i * 3}px` },
    제목: 칸.label,
    읽기: `글자 크기 ${칸.label}`
  }), { 글자: '' }),

  /**
   * 줄간격 — 글자 크기 바로 아래. **읽는 리듬을 고르는 자리**라 둘이 붙어 있어야 한다.
   *
   * 여기만 **라벨을 찍는다.** 글자 크기는 `가` 를 실제 배율로 찍으면 그게 곧 미리보기였는데,
   * 줄간격은 한 줄짜리 칸에 그릴 그림이 없다 — 두 줄이 있어야 보이는 값이라서다.
   *
   * 무는 것은 **본문(prose)의 문단·목록뿐**이다(`app.config.ts` 의 `ui.prose`).
   */
  '줄간격': 축트랙('줄간격', 'lineHeight', 줄간격options, 칸 => ({
    글자: 칸.label,
    제목: `줄간격 ${칸.label}`,
    읽기: `줄간격 ${칸.label}`
  }), { 칸폭: 'w-[3.5rem]', 글자: 'text-xs' }),

  /**
     * 진하기: 중립색 사다리를 통째로 민다 — 글자 5칸과 부품 4칸(테두리·탭 채움·체크박스).
     * `가` 를 **그 단계의 실제 본문색**으로, 옆 점을 **그 단계의 실제 부품색**으로 찍는다.
     * 점이 곧 탭·스텝 동그라미 색이다.
     */
  '진하기': 축트랙('진하기', 'contrast', 진하기options, 칸 => ({
    글자: '가',
    점: contrastPartColor(칸.value, isDark.value),
    스타일: { color: contrastBodyColor(칸.value, isDark.value) },
    제목: 칸.label,
    읽기: `진하기 ${칸.label}`
  }), { 색직접: true }),

  /**
     * 선 진하기: 눈금은 진하기와 **같은 배열에서 나오지만**(`축.ts` 의 `선진하기options` —
     * 첫 칸 이름만 「없음」으로 갈아 끼운 것), **두 손잡이는 따로 움직인다.**
     *
     * 그래서 **미리보기가 `행.진하기` 를 안 읽는다.** 오프셋으로 짰던 첫 판에서는 읽었고,
     * 그 결과 진하기를 올리면 이 줄의 네모 다섯 개가 통째로 같이 진해졌다 — 두 손잡이인데 하나만
     * 돌려도 둘이 움직이니 "분리가 안 됐다" 로 읽혔다. 그게 절대 사다리로 되돌린 이유다.
     *
     * 구조선(`border-default`)으로 그린다 — 컨트롤선은 바닥이 있어 아래 두세 칸이 같은 값이라
     * 미리보기가 뭉갠다(`contrastBorderColor` 주석).
     */
  '선 진하기': 축트랙('선 진하기', 'borderContrast', 선진하기options, (칸, _i, 선택됨) => ({
    네모: {
      class: `rounded-xs border ${네모면(선택됨)}`,
      style: { borderColor: contrastBorderColor(칸.value, isDark.value) }
    },
    제목: 칸.label,
    읽기: `선 진하기 ${칸.label}`
  }), { 색직접: true }),

  /**
     * 그림자 — 「생김새」의 **마지막** 줄이고, 바로 다음이 「읽기」의 첫 줄 진하기다.
     * 두 묶음의 경계에 놓은 것이 의도다: 무작위가 굴리는 축이라 소속은 생김새가 맞는데
     * (`무작위.vue`), 「또렷하게 보이게」라는 목적에서는 진하기·선 진하기와 같이 도는 손잡이다.
     * 경계에 두면 둘 다 성립한다 — 기준을 흐리지 않고 셋이 연달아 붙는다.
     *
     * 네모에 그 칸의 **실제 카드 그림자**를 그대로 건다 — 다크에서 흰 후광으로 뒤집히는 것까지 같이 보인다.
     */
  '그림자': 축트랙('그림자', 'elevation', 그림자options, (칸, _i, 선택됨) => ({
    네모: {
      class: `rounded-xs ${네모면(선택됨)}`,
      크기: 'size-[16px]',
      style: { boxShadow: depthShadow(칸.value, '카드', isDark.value) }
    },
    제목: 칸.label,
    읽기: `그림자 ${칸.label}`
  }), { 칸폭: 'w-10', 색직접: true }),

  // ── 생김새 ──────────────────────────────────────────────
  '강조색': 축순환('강조색', 'primary', 색라벨(행.강조색), { 점: String(행.강조색 ?? '') }),
  '보조색': 축순환('보조색', 'secondary', 색라벨(행.보조색), { 점: String(행.보조색 ?? '') }),

  /** 색온도 — 중립 사다리의 색조. 500 칸을 그대로 찍는다(사다리 가운데라 색조가 제일 잘 보인다) */
  '색온도': 축트랙('색온도', 'bg', 색온도options, 칸 => ({
    네모: {
      class: 'rounded-full',
      // 값이 곧 사다리 가운데 색이다 — 견본은 그 값을 그대로 찍는다
      style: { background: 칸.value }
    },
    제목: 칸.label,
    읽기: `색온도 ${칸.label}`
  }), { 색직접: true }),

  /**
     * 글꼴 — **트랙으로 깔았다가 순환으로 되돌렸다 (2026-09-05).**
     *
     * 다른 축은 칸에 값을 그려두면 이름이 필요 없다(`가` 의 크기·색, 네모의 라운드·그림자).
     * 글꼴은 안 된다 — 한글 산세리프 넷은 14px `가` 한 글자로 못 가른다. 그리면 판단이 안 되고
     * 이름을 읽어야 하는데, 이름(`프리텐다드`)은 넷을 나란히 놓을 폭이 없다.
     * 그래서 **미리보기가 판단을 못 해주는 축은 순환**이다 (파일 머리말의 기준).
     * 미리보기는 버리지 않고 값 왼쪽의 `가` 로 옮겼다 — 이름과 같이 있으면 그때는 읽힌다.
     */
  '글꼴': 축순환('글꼴', 'font', 글꼴라벨.value, {
    값스타일: { fontFamily: `var(${글꼴스택.value})` }
  }),

  /** 라운드 — 14px 네모에 축 값(rem)을 그대로 걸면 다 알약이 된다. 비율만 유지해 px 로 죈다 */
  '라운드': 축트랙('라운드', 'radius', 라운드options, 칸 => ({
    네모: {
      class: 'bg-accented',
      style: { borderRadius: `${Math.min(칸.value * 32, 7)}px` }
    },
    // 이름 없는 축이라 라벨이 `1(각지게)` 꼴이다 — 툴팁엔 실제 rem 도 같이 준다
    제목: `${칸.label} · ${칸.value}rem`,
    읽기: `라운드 ${칸.label}`
  }), { 칸폭: 'w-8', 색직접: true }),

  /**
     * 재질 — 중립 버튼의 3단(선만 / 면만 / 선+면)을 네모로 그대로 옮긴 것 (`재질.ts`).
     *
     * `선만` 에도 **종이(`bg-default`)를 깐다.** 실제 버튼이 카드 위에 앉은 모습 그대로고,
     * `면만`·`선+면` 과의 차이(흰 면 / 회색 면)가 남는다. (원래 이유는 고른 칸에서 선이 알약에
     * 먹히는 것이었는데, 알약이 강조 틴트로 바뀌어 그 이유는 없어졌다 — 종이는 위 이유로 남긴다.)
     *
     * **면 쪽 두 칸은 `재질면` 을 쓴다** — 이 줄을 담은 껍데기·칸 자체가 재질 축을 입고 있어서,
     * 축이 「면」·「선+면」에 있으면 안 고른 칸의 바탕이 파임이 된다. 그때 네모까지 파임으로
     * 그리면 자기가 자기 위에 그려져 사라진다. 그래서 바탕이 파임인 칸은 한 칸 더 올려 그린다.
     * (고른 칸은 그 재질에서 종이로 뜨므로 원래대로 파임을 그려도 갈린다 — 그래서 칸 단위다.)
     */
  '재질': 축트랙('재질', 'variant', 재질options, (칸, _i, 선택됨) => ({
    네모: {
      class: [
        'rounded-xs',
        칸.value === 'outline' ? 'border border-accented bg-default' : '',
        칸.value === 'soft' ? 재질면(선택됨) : '',
        칸.value === 'subtle' ? `border border-accented ${재질면(선택됨)}` : ''
      ].filter(Boolean).join(' ')
    },
    제목: 칸.label,
    읽기: `재질 ${칸.label}`
  }), { 색직접: true })

}))

const 보일줄s = computed(() => props.줄s
  .map(n => 모든줄s.value[n])
  .filter(Boolean))
</script>

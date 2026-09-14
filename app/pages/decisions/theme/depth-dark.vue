<!--
  **다크에서 층을 무엇으로 나를까**의 비교판. 2026-09-05에 `흰후광` 으로 결론이 났고
  `그림자.ts` 의 `DARK_RECIPE` 한 줄이 그날 바뀌었다. 이 페이지는 그 결정의 기록이다 —
  다시 고르려면 여기서 다섯 안을 보고 그 한 줄만 바꾼다.

  ## 왜 정해야 하나

  라이트는 검은 겹 하나로 끝난다. 다크는 아니다 — 바닥이 이미 `oklch(0.145)` 라 **더 어두워질
  자리가 없어서** 검은 겹이 거의 일을 못 한다.
  (2026-09-14 에 다크 바닥·종이가 뒤집혀 지금은 종이가 0.145, 바닥이 0.205 다. 흰 후광은 그대로 두었고,
  뒤집어도 층이 읽히는지는 `/decisions/theme/desk-paper` 에서 봤다 — `mTheme.css` 「면」 블록.) 그래서 다크에서 눈에 보이는 것은 전부
  바닥보다 **밝은** 것이고, 후보가 여럿이다(링·후광·색). 그중 무엇을 쓸지가 미결이었다.

  ## 판이 다루는 논점 둘

  1. **흰 링(`0 0 0 1px`)이 필요한가.** 이름표가 붙은 자리는 전부 이미 자기 테두리를 갖고 있다 —
     `view/*` 는 `border border-default`, `m/List/_/*` 는 `ring-1 ring-default`, `m/Tabs` 는
     `border-accented`. 그 위에 링이 한 겹 더 얹히고 있었다.
  2. **후광에 방향이 있어야 하는가.** `y: 0` 이면 물체가 스스로 빛나는 것이고, `y > 0` 이면
     판 뒤에 숨은 **간접조명**이 아래로 번지는 것이다. 후자는 밝게 모드와 광원 위치가 같아서
     한 사이트에 광원이 하나로 유지된다. 위 줄의 `후광 방향 끄기` 가 그 비교다.
  3. **검은 겹 자리를 흰 후광이 대신할 수 있는가.** 둘은 경계에 **반대로** 작용한다 —
     검은 겹은 종이 바로 바깥을 어둡게 해 대비를 키우고(모서리가 선다), 후광은 밝게 해 대비를
     줄인다(모서리가 뭉갠다). 그래서 "흰 후광만"이 떠 보이되 윤곽이 흐려질 수 있다.
     링을 빼면 그 윤곽을 테두리가 대신 져야 하는데, 다크 테두리가 후광에 먹힐지가 관건이다.

  ## 판 읽는 법

  - **모든 칸이 실제 호출부와 같은 옷을 입는다** — `bg-default` + `border border-default` +
    `rounded-xl`. 옷이 다르면 판이 거짓말을 한다(특히 논점 1은 테두리 유무가 곧 답이다).
  - **밝게 모드에서는 이 판이 성립하지 않는다.** 위 줄에서 화면을 어둡게로 놓고 볼 것.
    처음엔 `.dark` 클래스를 씌운 **섬**으로 밝게 모드에서도 보이게 하려 했는데 안 된다 —
    색 축이 `:root:root{--ui-bg-page…}`(특이도 0,2,0)로 값을 박아서 `.dark`(0,1,0)가 진다.
    섬 안쪽만 회색으로 뜨고 글자가 안 읽혔다. 축을 흉내 내는 대신 축을 돌리는 게 맞다.
  - 값은 축과 **같은 함수**(`depthShadowDark`)로 뽑는다. 판에서 고른 조합이 화면에서
    그대로 나온다는 뜻이다. 여기에 자기만의 겹 표를 따로 들면 그 순간 판이 죽는다.
  - 그림자 단계·강조색은 **전역 축 값을 그대로 쓴다.** 판 전용 손잡이를 따로 두지 않는 이유는
    같다 — 축을 흉내 내면 판이 거짓말을 시작한다. 위 줄이 도크 테마 pane 과 같은 컴포넌트다.
-->
<template>
  <div class="mx-auto w-full max-w-6xl px-4 py-8">
    <div class="mb-6">
      <h1 class="text-2xl font-semibold">
        다크 층 채널 비교
      </h1>
      <p class="mt-1 text-sm text-muted">
        다크에서 그림자를 무엇으로 나를까. 링 · 검은 겹 · 흰 후광 · 강조색 후광의 조합 다섯.
      </p>
    </div>

    <!-- 화면·그림자는 진짜 축이다. 판 전용 손잡이를 만들면 그 순간 판이 화면과 어긋난다 -->
    <div class="mb-4 flex flex-wrap items-center gap-x-6 gap-y-3">
      <ClientOnly>
        <M테마축줄s
          :줄s="['화면', '그림자']"
          class="w-fit"
        />
      </ClientOnly>
      <div class="grow" />
      <UCheckbox
        v-model="무방향"
        label="후광 방향 끄기 (y=0 중심)"
      />
      <UCheckbox
        v-model="테두리"
        label="테두리(border-default) 켜기"
      />
    </div>

    <!-- 밝게에서는 볼 게 없다. 숨기지 않고 말해준다 — 왜 안 보이는지 모르는 게 더 나쁘다 -->
    <ClientOnly>
      <UAlert
        v-if="!is어둡게"
        class="mb-4"
        icon="i-lucide-moon"
        title="화면을 어둡게로 놓고 볼 것"
        description="다섯 안은 전부 다크용 채널이라, 밝게에서는 어두운 바닥을 전제한 값을 흰 바닥 위에 그리는 셈이 된다. 보이긴 하는데 판단이 안 된다."
      />
    </ClientOnly>

    <!-- 다크 섬. 실제 화면과 같은 바닥(bg-page) 위에 종이를 얹어야 층이 읽힌다 -->
    <div class="rounded-xl bg-page p-6">
      <div
        class="grid gap-x-4 gap-y-6"
        :style="{ gridTemplateColumns: `7rem repeat(${안s.length}, minmax(0, 1fr))` }"
      >
        <!-- 머리줄 -->
        <div />
        <div
          v-for="안 in 안s"
          :key="안.이름"
          class="flex flex-col gap-0.5"
        >
          <span class="text-xs font-medium text-highlighted">{{ 안.이름 }}</span>
          <span class="text-[0.625rem] leading-tight text-dimmed">{{ 안.채널s.join(' + ') }}</span>
        </div>

        <!-- 층마다 한 줄 -->
        <template
          v-for="slot in DEPTH_SLOTS"
          :key="slot"
        >
          <div class="flex items-center text-xs text-muted">
            {{ slot }}
          </div>
          <div
            v-for="안 in 안s"
            :key="안.이름 + slot"
            class="flex items-center"
          >
            <div
              class="w-full rounded-xl bg-default p-4 text-xs text-toned"
              :class="테두리 ? 'border border-default' : ''"
              :style="{ boxShadow: depthShadowDark(단계, slot, 안.채널s, undefined, 무방향) }"
            >
              {{ slot }}
            </div>
          </div>
        </template>
      </div>
    </div>

    <!--
      밀집 격자 — **이 판이 처음에 거짓말을 한 자리다.**

      위 격자는 칸마다 어두운 여백을 넉넉히 줬다. 그러면 후광이 전부 바닥에 떨어져서 잘 읽힌다.
      실제 목록은 안 그렇다 — 카드가 gap 만큼만 떨어져 붙어 있고, 후광이 떨어질 자리에 **옆 카드의
      밝은 종이**가 있다. 후광은 어두운 바닥에 떨어져야 보이므로 거기서 거의 사라진다.
      (2026-09-05 실측: `decisions/theme/selection` 의 회원 카드에서 값은 제대로 붙는데 눈에 안 보였다)

      그래서 판에 같은 조건을 만들어 둔다. **카드 층은 여기서 읽히는지로 판단할 것.**
    -->
    <div class="mt-6 rounded-xl bg-page p-6">
      <p class="mb-4 text-xs text-dimmed">
        밀집 격자 — 실제 목록의 조건(카드가 붙어 있고 후광 자리에 옆 카드가 있다).
        <b>카드 층은 여기서 읽히는지로 판단한다.</b>
      </p>
      <div
        class="grid gap-x-4 gap-y-6"
        :style="{ gridTemplateColumns: `repeat(${안s.length}, minmax(0, 1fr))` }"
      >
        <div
          v-for="안 in 안s"
          :key="'밀' + 안.이름"
          class="flex flex-col gap-1.5"
        >
          <span class="text-[0.625rem] text-dimmed">{{ 안.이름 }}</span>
          <div class="grid grid-cols-2 gap-3">
            <div
              v-for="n in 6"
              :key="n"
              class="rounded-lg bg-default p-2 text-[0.625rem] text-toned"
              :class="테두리 ? 'border border-default' : ''"
              :style="{ boxShadow: depthShadowDark(단계, '카드', 안.채널s, undefined, 무방향) }"
            >
              카드 {{ n }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 겹친 상태에서의 확인 — 층은 혼자 있을 때가 아니라 겹쳤을 때 갈려야 뜻이 있다 -->
    <div class="mt-6 rounded-xl bg-page p-6">
      <p class="mb-4 text-xs text-dimmed">
        겹침 — 층은 혼자 있을 때가 아니라 <b>다른 층 위에 있을 때</b> 갈려야 한다.
        카드 위에 드롭다운이 떴을 때 두 층이 구분되는지가 진짜 시험이다.
      </p>
      <div
        class="grid gap-x-4 gap-y-8"
        :style="{ gridTemplateColumns: `repeat(${안s.length}, minmax(0, 1fr))` }"
      >
        <div
          v-for="안 in 안s"
          :key="'겹' + 안.이름"
          class="flex flex-col gap-1.5"
        >
          <span class="text-[0.625rem] text-dimmed">{{ 안.이름 }}</span>
          <div
            class="relative rounded-xl bg-default p-4"
            :class="테두리 ? 'border border-default' : ''"
            :style="{ boxShadow: depthShadowDark(단계, '카드', 안.채널s, undefined, 무방향) }"
          >
            <div class="h-16 text-xs text-toned">
              카드
            </div>
            <div
              class="absolute -bottom-4 right-3 w-32 rounded-lg bg-default p-3 text-xs text-toned"
              :class="테두리 ? 'border border-default' : ''"
              :style="{ boxShadow: depthShadowDark(단계, '드롭다운', 안.채널s, undefined, 무방향) }"
            >
              드롭다운
            </div>
          </div>
          <div class="h-4" />
        </div>
      </div>
    </div>

    <div class="mt-6 text-xs text-muted">
      지금 화면에 나가는 조합은 <code class="text-highlighted">{{ DARK_RECIPE.join(' + ') }}</code> 다
      (<code>그림자.ts</code> 의 <code>DARK_RECIPE</code>). 여기서 고른 것으로 그 한 줄을 바꾼다.
    </div>
  </div>
</template>

<script setup lang="ts">
import { DARK_RECIPE, depthShadowDark, type DarkChannel } from '~utils/theme/css'
import { DEPTH_SLOTS } from '~utils/theme/축'
import { useThemeStore } from '~/stores/useThemeStore'

definePageMeta({
  제목: '다크 층 채널 비교'
})

const theme = useThemeStore()
const colorMode = useColorMode()

const is어둡게 = computed(() => colorMode.value === 'dark')
/** 판이 쓰는 단계 = 전역 그림자 축 값. 위 줄에서 굴리면 스무 칸이 같이 움직인다 */
const 단계 = computed(() => theme.elevation)
/** 논점 1의 답이 테두리 유무에 달려 있어서 끄고 켜 본다 — 실제 호출부는 켜져 있는 쪽이다 */
const 테두리 = ref(true)

/**
 * 논점 3 — 후광에 방향이 있어야 하나. 켜면 `y: 0` 중심 후광(물체가 스스로 빛나는 모습)이 되고,
 * 끄면 지금 값(간접조명 — 위에서 빛이 오고 아래로 번짐)이다. 화면에 나가는 값은 늘 방향이 있다.
 */
const 무방향 = ref(false)

/**
 * 조합 다섯. 왼쪽이 지금 값, 오른쪽으로 갈수록 검정을 빼고 빛으로 옮긴다.
 * 넷째(`흰 후광 + 접지`)가 내 예상 — 검정을 얇게 남겨 모서리를 세우고 사다리는 빛이 진다.
 */
const 안s: { 이름: string, 채널s: DarkChannel[] }[] = [
  { 이름: '지금 값', 채널s: ['링', '검정', '강조후광'] },
  { 이름: '링만 뺌', 채널s: ['검정', '강조후광'] },
  { 이름: '흰 후광만', 채널s: ['흰후광'] },
  { 이름: '흰 후광 + 접지', 채널s: ['검정', '흰후광'] },
  { 이름: '흰 + 강조 후광', 채널s: ['흰후광', '강조후광'] }
]
</script>

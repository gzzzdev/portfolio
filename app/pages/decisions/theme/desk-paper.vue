<!--
  **다크에서 바닥과 종이 중 무엇이 밝아야 하나**의 비교판 (2026-09-14).

  **결론: B′ (뒤집기만).** 같은 날 `mTheme.css` 「면」 블록의 `.dark` 두 값으로 내려갔다.
  그래서 지금 화면의 기본값은 B′ 이고, 아래 칸 이름의 「지금」은 **뒤집기 전** 값이다.

  ## 질문

  라이트는 바닥이 옅고(`resources/[id]` 시험의 neutral-100) 종이가 희다. 다크도 그 모양 그대로
  **바닥이 밝고 종이가 어두워야** 같은 규칙으로 읽히지 않나 — 가 출발이다. 지금 다크는 반대다
  (바닥 0.145 < 종이 0.205, `mTheme.css` 「면」 블록).

  다크의 층은 `DARK_RECIPE = ['흰후광']`(`~utils/theme/css`)이 나른다. 후광은 **어두운 바닥에
  떨어져야** 보인다는 게 `decisions/theme/depth-dark` 의 실측이라, 바닥·종이만 뒤집는 것과
  그림자 채널까지 같이 뒤집는 것은 다른 안이다. 그래서 세 칸이다.

  | 칸 | 바닥 / 종이 | 층 |
  |---|---|---|
  | A  | 0.145 / 0.205 | 흰 후광 (지금) |
  | B  | 0.205 / 0.145 | 검정 |
  | B′ | 0.205 / 0.145 | 흰 후광 (뒤집기만) |

  ## 판 읽는 법

  - **칸마다 `.dark` 섬이다** — 화면 모드와 상관없이 다크로 선다. Nuxt UI·진하기 축·그림자 축의
    다크 값이 전부 `.dark` 클래스 셀렉터라 섬 안에서 그대로 걸린다. 색 축은 모드와 무관한 중립 램프만
    `:root` 에 박으므로 섬을 안 깬다. (`depth-dark` 가 섬을 포기한 이유였던 `--ui-bg-page` 는 지금 축에 없다.)
  - 바닥·종이는 섬 루트에서 `--ui-bg-page`·`--ui-bg` 를 **덮어쓴다.** `bg-default` 가 `var(--ui-bg)` 를
    곧장 물어서 종이 위의 드롭다운·모달까지 같이 따라온다 — 실제로 뒤집었을 때와 같은 조건이다.
  - 층은 `--m-depth-*` 를 덮어쓴다. 값은 축과 **같은 함수**(`depthShadowDark`)·같은 단계(`theme.elevation`)다.
  - **파임(`bg-muted` 0.279 · `bg-elevated` 0.372)은 안 옮겼다.** B 에서 그것이 바닥보다 밝아지는 게
    이 판이 보여 줘야 할 것 중 하나라서다.

  ## 볼 것 넷 (위에서 아래 순서)

  1. 자료 한 건 — 바닥 위 종이, 그 안의 표·툴바 줄. 원래 질문의 화면.
  2. 편집기 — `Input본문` 의 액자(`ring-accented`)가 종이 위에서 서는지.
  3. 종이 위에 뜬 드롭다운 — 같은 `bg-default` 끼리 층이 갈리는지. B 의 약점으로 짚은 자리.
  4. 밀집 카드 — 후광 자리에 옆 카드가 있는 실제 목록 조건.
-->
<template>
  <div class="mx-auto w-full max-w-(--ui-container) px-4 py-8">
    <div class="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 class="text-2xl font-semibold text-highlighted">
          다크 바닥·종이 비교
        </h1>
        <p class="mt-1 text-sm text-muted">
          다크에서 바닥과 종이 중 무엇이 밝아야 하나. 칸마다 다크 섬이라 화면 모드와 상관없이 보인다.
        </p>
      </div>
      <!-- 그림자 단계는 진짜 축이다 — 판 전용 손잡이를 두면 그 순간 화면과 어긋난다 -->
      <ClientOnly>
        <M테마축줄s
          :줄s="['그림자']"
          class="w-fit"
        />
      </ClientOnly>
    </div>

    <div class="grid gap-4 lg:grid-cols-3">
      <section
        v-for="안 in 안s"
        :key="안.이름"
        class="dark min-w-0 space-y-6 rounded-xl p-4 text-default sm:p-5"
        :style="섬style(안)"
      >
        <div>
          <h2 class="text-sm font-semibold text-highlighted">
            {{ 안.이름 }}
          </h2>
          <p class="text-xs text-muted">
            {{ 안.설명 }}
          </p>
        </div>

        <!-- 1. 자료 한 건 -->
        <div class="space-y-3">
          <UButton
            icon="i-lucide-arrow-left"
            variant="ghost"
            color="neutral"
            size="xs"
          >
            자료 목록
          </UButton>
          <article class="space-y-4 rounded-lg bg-default p-4 ring ring-default m-층-카드">
            <header class="space-y-1.5 border-b border-default pb-3">
              <h3 class="text-lg font-semibold text-highlighted">
                2025년 활동 보고서·결산
              </h3>
              <div class="flex items-center gap-1.5 text-xs text-muted">
                <UBadge
                  size="sm"
                  color="neutral"
                  variant="subtle"
                  label="보고서"
                />
                <span>247자</span>
              </div>
            </header>
            <p class="text-sm">
              지난해 모임이 한 일과 회비를 어디에 썼는지 정리했습니다. 정기총회에서 승인된 판입니다.
            </p>
            <div class="overflow-hidden rounded-md ring ring-default">
              <table class="w-full text-sm">
                <thead class="bg-muted text-left">
                  <tr>
                    <th class="px-3 py-2 font-medium">
                      항목
                    </th>
                    <th class="px-3 py-2 font-medium">
                      내용
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="[k, v] in 표"
                    :key="k"
                    class="border-t border-default"
                  >
                    <td class="px-3 py-2">
                      {{ k }}
                    </td>
                    <td class="px-3 py-2">
                      {{ v }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="flex items-center gap-2 rounded-md bg-elevated px-3 py-2 text-xs text-toned">
              <UIcon name="i-lucide-file-down" />
              <span class="grow">bg-elevated 줄 (파임2)</span>
              <span>받기</span>
            </div>
          </article>
        </div>

        <!-- 2. 편집기 -->
        <div class="space-y-1.5">
          <p class="text-xs text-dimmed">
            편집기 — 종이 위의 Input본문
          </p>
          <div class="rounded-lg bg-default p-3 ring ring-default m-층-카드">
            <mEditorMd v-model="본문" />
          </div>
        </div>

        <!-- 3. 종이 위에 뜬 드롭다운 -->
        <div class="space-y-1.5">
          <p class="text-xs text-dimmed">
            겹침 — 종이 위의 드롭다운(같은 bg-default)
          </p>
          <div class="relative rounded-lg bg-default p-4 pb-12 ring ring-default m-층-카드">
            <p class="text-sm">
              카드
            </p>
            <div class="absolute right-3 -bottom-6 w-40 space-y-0.5 rounded-lg bg-default p-1.5 text-sm ring ring-default m-층-드롭다운">
              <div
                v-for="(m, i) in ['수정', '복제', '삭제']"
                :key="m"
                class="rounded px-2 py-1"
                :class="i === 0 ? 'bg-elevated/60 text-highlighted' : ''"
              >
                {{ m }}
              </div>
            </div>
          </div>
          <div class="h-6" />
        </div>

        <!-- 4. 밀집 카드 -->
        <div class="space-y-1.5">
          <p class="text-xs text-dimmed">
            밀집 카드 — 후광 자리에 옆 카드가 있다
          </p>
          <div class="grid grid-cols-3 gap-2.5">
            <div
              v-for="n in 6"
              :key="n"
              class="rounded-lg bg-default p-2.5 text-xs text-toned ring ring-default m-층-카드"
            >
              카드 {{ n }}
            </div>
          </div>
        </div>
      </section>
    </div>

    <p class="mt-6 text-xs text-muted">
      지금 화면에 나가는 다크 층 조합은 <code class="text-highlighted">{{ DARK_RECIPE.join(' + ') }}</code> 다.
      B 로 간다면 `mTheme.css` 의 `.dark` 두 값과 이 한 줄이 같이 움직이고, 파임 두 칸·진하기 면 보정은 다시 잰다.
    </p>
  </div>
</template>

<script setup lang="ts">
import { DARK_RECIPE, depthShadowDark, type DarkChannel } from '~utils/theme/css'
import { DEPTH_SLOTS, depthVar } from '~utils/theme/축'
import { useThemeStore } from '~/stores/useThemeStore'

definePageMeta({
  제목: '다크 바닥·종이 비교'
})

const theme = useThemeStore()

interface i안 { 이름: string, 설명: string, 바닥: string, 종이: string, 채널s: DarkChannel[] }

const 어두움 = 'oklch(0.145 0 0)'
const 밝음 = 'oklch(0.205 0 0)'

const 안s: i안[] = [
  { 이름: 'A · 뒤집기 전', 설명: '바닥 0.145 · 종이 0.205 · 흰 후광', 바닥: 어두움, 종이: 밝음, 채널s: ['흰후광'] },
  { 이름: 'B · 뒤집고 검정', 설명: '바닥 0.205 · 종이 0.145 · 검은 그림자', 바닥: 밝음, 종이: 어두움, 채널s: ['검정'] },
  { 이름: 'B′ · 뒤집기만 (채택)', 설명: '바닥 0.205 · 종이 0.145 · 흰 후광 그대로', 바닥: 밝음, 종이: 어두움, 채널s: ['흰후광'] }
]

/** 섬 루트에서 면 두 칸과 층 넷을 덮어쓴다. 층 값은 축과 같은 함수·같은 단계. */
function 섬style(안: i안): Record<string, string> {
  const 층s = Object.fromEntries(DEPTH_SLOTS.map(s => [depthVar(s), depthShadowDark(theme.elevation, s, 안.채널s)]))
  return { 'background': 안.바닥, '--ui-bg-page': 안.바닥, '--ui-bg': 안.종이, ...층s }
}

const 표: [string, string][] = [
  ['지원 협회', '6곳'],
  ['정기 모임', '11회'],
  ['회비 수입', '354만원']
]

const 본문 = ref('## 수집·이용 동의\n\n동의를 받을 때 **네 가지를 알려야** 한다.\n\n1. 수집·이용 목적\n2. 수집하는 항목')
</script>

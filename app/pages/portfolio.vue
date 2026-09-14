<!--
  포트폴리오 소개 화면 — **이 배포의 입구.** 이력서의 링크가 여기로 온다.

  리뷰어가 첫 3초에 알아야 하는 것 넷을 위에서부터 늘어놓는다.
  1. 무엇을 누가 만들었나 · 저장소
  2. 역할로 들어가기 — 클릭 한 번에 그 역할로 로그인해 첫 메뉴로 간다(`usePortfolio`)
  3. 둘러보는 동안 써 볼 것 — 전체 찾기(⌘K)·AI도우미(⌘J)·테마(키 없음, 찾기 창의 「테마 열기」).
     버튼은 키와 같은 문을 연다(`전체찾기:열림`·`useDock().openPane('ai')`·`useThemePane`).
     키 배치의 까닭은 `l/전체찾기` 머리말.
  4. 이런 고민 속에 만들어졌습니다 — 기록 몇 장과 `/decisions` 로 가는 길. 입구 레일에 「고민 기록」이
     이미 있어, 카드 묶음은 써 볼 것 밑·스택 위로 내렸다(2026-09-15).
  5. 스택
  + 오른쪽 가운데 입구 레일(`l/QuickMenu_r`, 레이아웃이 세운다) — 소개·이력서·고민 기록·비회원 홈·저장소.

  비회원 홈(`/official`)은 따로 있다. 예전엔 비로그인 `/` 가 곧장 그리로 갔는데, 그러면 리뷰어가
  협회 모집 공지부터 보게 되어 비로그인 `/` 를 여기로 보낸다(`access-control.global` 의 `/` 분기).
  **주소가 `/` 가 아니라 `/portfolio` 인 이유** — `/` 는 로그인한 사람의 「내 홈」(운영자 `/admin` …)이다.
  소개를 `/` 에 앉혔더니 운영자가 `/` 로 와도 `/admin` 에 못 갔다. 로그인한 채로는 띠의 「소개」로 온다.
  **이 화면은 도메인 데이터를 안 읽는다** — 첫 페인트가 표 조회를 기다릴 이유가 없다.
-->
<template>
  <!-- 위아래 여백은 레이아웃의 `main` 이 준다(히어로 밑 숨 쉴 자리·바닥까지) -->
  <div class="mx-auto flex w-full max-w-(--ui-container) flex-col gap-14 px-5 py-6">
    <!-- 1. 무엇을 누가 -->
    <section class="flex max-w-3xl flex-col gap-4">
      <p class="text-xs tracking-widest text-dimmed">
        {{ 문구.머리말 }}
      </p>
      <h1 class="text-3xl font-semibold tracking-tight text-highlighted sm:text-4xl">
        팀 마장터 — 영세 협회 운영 시스템
      </h1>
      <p class="text-base leading-relaxed text-muted">
        300명 이하 협회·학회·동호회가 엑셀과 종이로 돌리던 회원 명부, 신청, 전자투표, 회원증을
        한곳에서 운영하는 서비스입니다. 3인 팀에서 개발을 맡아 화면부터 권한·데이터 구조까지 직접 만들었습니다.
      </p>
    </section>

    <!-- 2. 역할로 들어가기 -->
    <section class="flex flex-col gap-4">
      <div class="flex flex-col gap-1">
        <h2 class="text-lg font-semibold text-highlighted">
          역할로 들어가기
        </h2>
        <p class="text-sm text-muted">
          5개 역할마다 메뉴와 권한이 다릅니다. 누르면 그 역할의 체험 계정으로 바로 로그인됩니다.
        </p>
      </div>

      <div
        v-if="isDev"
        class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
      >
        <!--
          카드 한 장이 곧 버튼이다. **안은 `span` 만 쓴다** — `button` 의 내용은 구문 요소(phrasing)여야 하는데
          `div`·`p` 를 넣었더니 접근성 트리에서 카드 안이 generic 덩어리로 읽혔다.
          이름은 「운영자 계정으로 둘러보기」로 준다 — 설명 문장까지 이름에 섞이면 스크린리더가 한 호흡에 다 읽는다.
        -->
        <button
          v-for="안내 in 역할s"
          :key="안내.email"
          type="button"
          class="group flex flex-col gap-3 rounded-lg border border-default bg-default p-4 cursor-pointer text-left transition-colors hover:border-accented hover:bg-elevated/50 focus-visible:outline-2 focus-visible:outline-primary disabled:cursor-wait disabled:opacity-60"
          :aria-label="`${안내.역할} 계정으로 둘러보기`"
          :aria-describedby="`역할-${안내.code}-볼것`"
          :aria-busy="진행중 === 안내.email"
          :disabled="Boolean(진행중)"
          @click="둘러보기(안내)"
        >
          <span class="flex items-center gap-2">
            <UIcon
              :name="안내.icon"
              class="size-5 text-primary"
            />
            <span class="font-semibold text-highlighted">{{ 안내.역할 }}</span>
            <span class="grow" />
            <UIcon
              :name="진행중 === 안내.email ? 'i-lucide-loader-circle' : 'i-lucide-arrow-right'"
              class="size-4 text-dimmed transition-transform group-hover:translate-x-0.5"
              :class="진행중 === 안내.email ? 'animate-spin' : ''"
            />
          </span>
          <span
            :id="`역할-${안내.code}-볼것`"
            class="text-sm leading-relaxed text-muted"
          >
            {{ 안내.볼것 }}
          </span>
        </button>
      </div>
      <p
        v-else
        class="rounded-lg border border-default p-4 text-sm text-muted"
      >
        이 배포에서는 체험 계정이 꺼져 있습니다. 저장소의 README에서 화면 구성을 보실 수 있습니다.
      </p>

      <p class="text-xs text-dimmed">
        비회원은 로그인 없이 <NuxtLink
          to="/official"
          class="underline hover:text-muted"
        >비회원 홈</NuxtLink>에서 공지와 신청 목록을 봅니다.
        들어간 뒤에도 화면 맨 위 띠에서 역할을 바꿀 수 있습니다.
      </p>
    </section>

    <!-- 3. 둘러보는 동안 써 볼 것 -->
    <section class="flex flex-col gap-4">
      <h2 class="text-lg font-semibold text-highlighted">
        둘러보는 동안 써 볼 것
      </h2>
      <div class="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        <div class="flex flex-col gap-3 rounded-lg border border-default bg-default p-5">
          <div class="flex items-center gap-2">
            <UIcon
              name="i-lucide-search"
              class="size-5 text-primary"
            />
            <span class="font-semibold text-highlighted">전체 찾기</span>
            <div class="grow" />
            <span class="flex items-center gap-0.5">
              <UKbd value="meta" />
              <UKbd value="K" />
            </span>
          </div>
          <p class="text-sm leading-relaxed text-muted">
            지금 역할이 갈 수 있는 메뉴, 소개·이력서, 고민 기록을 한 창에서 찾습니다. 맞는 화면이 없으면
            친 말 그대로 AI 도우미에게 넘겨 물을 수 있습니다. 테마 패널도 여기서 엽니다.
          </p>
          <div class="grow" />
          <mButton
            역할="조용"
            size="sm"
            class="self-start"
            trailing-icon="i-lucide-search"
            @click="찾기열림 = true"
          >
            전체 찾기 열기
          </mButton>
        </div>

        <div class="flex flex-col gap-3 rounded-lg border border-default bg-default p-5">
          <div class="flex items-center gap-2">
            <UIcon
              name="i-lucide-bot"
              class="size-5 text-primary"
            />
            <span class="font-semibold text-highlighted">AI 도우미</span>
            <div class="grow" />
            <span class="flex items-center gap-0.5">
              <UKbd value="meta" />
              <UKbd value="J" />
            </span>
          </div>
          <p class="text-sm leading-relaxed text-muted">
            모든 화면 오른쪽에 상주합니다. 자연어로 물으면 지금 로그인한 역할이 볼 수 있는 데이터 안에서
            답하고, 필요하면 해당 화면으로 옮겨 줍니다. 자료는 첫 질문을 보낼 때에만 불러옵니다.
          </p>
          <ul class="flex flex-col gap-1 text-sm text-default">
            <li
              v-for="질문 in AI질문s"
              :key="질문"
              class="flex items-center gap-2"
            >
              <UIcon
                name="i-lucide-message-circle"
                class="size-3.5 shrink-0 text-dimmed"
              />
              {{ 질문 }}
            </li>
          </ul>
          <div class="grow" />
          <mButton
            역할="조용"
            size="sm"
            class="self-start"
            trailing-icon="i-lucide-panel-right-open"
            @click="dock.openPane('ai')"
          >
            AI 도우미 열기
          </mButton>
        </div>

        <div class="flex flex-col gap-3 rounded-lg border border-default bg-default p-5">
          <div class="flex items-center gap-2">
            <UIcon
              name="i-lucide-palette"
              class="size-5 text-primary"
            />
            <span class="font-semibold text-highlighted">테마</span>
          </div>
          <p class="text-sm leading-relaxed text-muted">
            색·진하기·재질·그림자·글꼴을 축으로 나눠 굴려 보는 테마 패널입니다. 화면을 덮는 팝오버가 아니라
            본문을 옆으로 미는 패널이라, 바꾸는 동안 뒤의 실제 화면이 그대로 미리보기가 됩니다.
            단축키는 따로 없고, 전체 찾기에서 「테마」를 치면 바로 열립니다.
          </p>
          <div class="grow" />
          <mButton
            역할="조용"
            size="sm"
            class="self-start"
            trailing-icon="i-lucide-panel-right-open"
            @click="테마.open()"
          >
            테마 열기
          </mButton>
        </div>
      </div>
    </section>

    <!--
      4. 이런 고민 속에 만들어졌습니다 — `/decisions` 로 건너가는 자리.
      카드는 기록(`~/utils/decisions`)에서 키로 골라 읽는다 — 문구를 여기 다시 적으면 두 벌이 된다.
      카드는 `/decisions` 목차와 같다 — 판이 있는 기록만, 물음 + 평범한 한 줄(`요약`), 누르면 그 판.
    -->
    <section class="flex flex-col gap-4">
      <div class="flex flex-col gap-1">
        <h2 class="text-lg font-semibold text-highlighted">
          이런 고민 속에 만들어졌습니다
        </h2>
        <p class="text-sm text-muted">
          갈림길마다 후보를 나란히 놓고 숫자와 화면으로 비교해 골랐습니다. 카드를 누르면 그때 깔았던 비교판이 열립니다.
        </p>
      </div>

      <ul class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <li
          v-for="기록 in 대표기록s"
          :key="기록.키"
        >
          <NuxtLink
            :to="기록.판"
            class="group flex h-full flex-col gap-2 rounded-lg border border-default bg-default p-4 transition-colors hover:border-accented hover:bg-elevated/50"
          >
            <span class="flex items-start gap-2 text-sm font-medium leading-snug text-highlighted">
              <span class="grow">{{ 기록.고민 }}</span>
              <UIcon
                name="i-lucide-arrow-up-right"
                class="mt-0.5 size-4 shrink-0 text-dimmed transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </span>
            <span class="text-xs leading-relaxed text-muted">
              {{ 기록.요약 }}
            </span>
          </NuxtLink>
        </li>
      </ul>

      <!-- 목록 전체로 가는 길은 카드를 다 본 자리(카드 줄 밑)에 버튼으로 — 머리 오른쪽 작은 링크는 지나쳤다 -->
      <UButton
        color="neutral"
        variant="outline"
        to="/decisions"
        trailing-icon="i-lucide-arrow-right"
        class="self-start"
      >
        기록 {{ 기록수 }}개 전체 보기
      </UButton>
    </section>

    <!-- 5. 스택 -->
    <section class="flex flex-col gap-3 border-t border-default pt-8">
      <h2 class="text-sm font-semibold text-highlighted">
        기술 스택
      </h2>
      <div class="flex flex-wrap gap-1.5">
        <UBadge
          v-for="스택 in 스택s"
          :key="스택"
          color="neutral"
          variant="outline"
        >
          {{ 스택 }}
        </UBadge>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { usePortfolio } from '~/composables/usePortfolio'
import { useThemePane } from '~/composables/useThemePane'
import { useHeroPageTitle } from '~/composables/useLayoutHero'
import { decisionRecord, decisionStatus, hasDecisionBoard, type iDecisionEntry } from '~/utils/decisions'

/**
 * **공식 사이트와 같은 옷을 입는다**(`layout-official` — 투명 헤더·사진 히어로·바닥, 메뉴는 비회원 공식 메뉴).
 * 입구가 앱 GNB(`default`)면 리뷰어가 처음 보는 머리와 「비회원 홈」에서 보는 머리가 달라 딴 사이트처럼 읽혔다.
 *
 * 히어로는 **짧은 판**이다 — 큰 캐러셀(`layoutHero: 'default'`)은 첫 화면을 사진이 다 먹어 소개가 접힌 곳 밑으로 내려간다.
 * `/portfolio` 는 어느 메뉴에도 없어 켜진 메뉴 이름이 없으므로, 히어로 제목은 이 화면이 올린다(`useHeroPageTitle`).
 * 제목은 **포트폴리오 띠의 링크 이름(「소개」)과 같은 말**이다 — 띠에서 「소개·이력서·고민 기록」을 오갈 때
 * 누른 이름과 히어로가 다르면 다른 곳에 온 것처럼 읽힌다. 아래 `h1` 과 다른 말이라 둘 다 선다.
 */
definePageMeta({ layout: 'layout-official' })
useHeroPageTitle('소개')

useHead({ title: '팀 마장터 — 김건엽 포트폴리오' })

const { isDev, 문구, 역할s, 진행중, 둘러보기 } = usePortfolio()
const dock = useDock()
const 테마 = useThemePane()
/** 헤더의 전체 찾기(`l/전체찾기`)와 같은 창 */
const 찾기열림 = useState('전체찾기:열림', () => false)

/** 도우미 빈 화면의 추천 질문(`lAI_Copilot` 의 `suggestions`)에서 고른 것 */
const AI질문s = [
  '담당자는 몇 명이야?',
  '20대 남자 회원 명단 보여줘',
  '총회 전자투표는 어떻게 해?'
]

/**
 * 소개 화면에 꺼내 두는 기록. **결론이 났고 이미 나갔고 판이 있는 것**에서 골랐다.
 * 판 없는 설계 기록을 한때 올렸다가 걷었다(2026-09-15) — 카드가 글 상세로만 가서 비교판이 안 보였다.
 * 키가 기록에서 사라지거나 판이 지워지면 조용히 빠진다.
 */
const 대표키s = ['gnb-자식', '다크-그림자', '신청-목록', '로그인-창']
const router = useRouter()
/** `/decisions` 목차와 같은 거름 — 판이 라우터에 실제로 있는 기록만. 개수도 여기서 센다. */
const 기록수 = decisionRecord.filter(기록 => hasDecisionBoard(기록, router)).length
const 대표기록s = 대표키s
  .map(키 => decisionRecord.find(기록 => 기록.키 === 키))
  .filter((기록): 기록 is iDecisionEntry => Boolean(기록) && decisionStatus(기록!) === '정함' && hasDecisionBoard(기록!, router))

const 스택s = ['Nuxt 4', 'Vue 3', 'TypeScript', 'Nuxt UI', 'Supabase']
</script>

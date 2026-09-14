<!--
  「이 사이트는 이런 고민 속에 만들어졌습니다」 — 밖에 내보이는 화면.

  ## 모래밭과 무슨 사이인가 (2026-09-06 정리)

  **아무 사이도 아니다.** 예전엔 「판 열어보기」가 `/sandbox` 로 건너갔는데, 밖에 나가는
  화면이 **언제든 통째로 지우는 도구**를 가리키고 있던 셈이라 끊었다. 지금은 판이
  이 폴더 안(`app/pages/decisions/*`)에 같이 산다 — 기록에 오른 판은 모래밭에서 지우고
  여기로 옮긴다. 두 자리의 차이는 하나다: **모래밭 = 아직 기록에 안 올렸다, 여기 = 올렸다.**

  내용은 그래도 전부 `~/utils/decisions` 의 기록에서 온다. 판의 `definePageMeta` 를 긁던
  옛 방식은 한 소스 두 읽기라 깔끔했지만, 판을 지우면 기록이 같이 사라져서 뒤집었다 —
  **기록이 정본이고, 판은 그 기록에 딸린 증거물이다.**

  ## 판이 여기 있으면 지켜야 하는 것

  이 아래는 공개 경로다. **판은 도메인 데이터를 읽지 않는다** — 표본은 판 옆
  `_표본.ts` 나 `~utils/mdc/samples` 같은 정적 자료로 든다.

  ## 카드에 무엇을 적나 (2026-09-15 다시)

  **목차다. 읽는 자리가 아니다.** 카드 한 장은 **물음(`고민`) + 평범한 말 한 줄(`요약`)** 만 진다.
  한때 `결론` 원문을 세 줄로 잘라 올렸는데, 그 원문은 만든 사람의 메모라(CSS 변수·컴포넌트 이름·
  「판에서 졌다」 같은 말) 처음 보는 사람이 한 장을 두세 번 읽어야 했다.

  **판이 있는 기록만 올리고, 카드를 누르면 바로 판으로 간다** (2026-09-15 되돌림).
  한때 모든 기록을 올리고 카드를 글 상세(`decisions/[key].vue`)로 보냈는데, 판 있는 기록까지
  글자 화면을 한 번 거치게 돼서 이 화면이 「비교판 목차」가 아니라 「글 목록」으로 읽혔다.
  판 없는 기록(설계 갈래 등)은 `~/utils/decisions` 에 그대로 있고, 상세 주소로는 여전히 열린다.

  ## 묶음 — 갈래가 먼저, 상태가 다음 (2026-09-15)

  정한 것은 **설계 → 화면** 순으로 선다. 판이 있는 설계 기록이 없으면 설계 묶음은 안 선다.

  **「고른 것」과 「나간 것」은 다르다.** 결론만 보고 「정한 것」에 올리면, 판에서 고르고 실코드로
  옮기기 전까지 이 화면이 거짓말을 한다. 그 사이를 `is미반영` 이 진다 —
  「골랐고, 아직 안 넣었다」 묶음은 **비어 있는 게 정상**이고, 길어지면 그게 신호다.
-->
<template>
  <!--
    옷은 소개 화면(`pages/portfolio.vue`)을 따른다 — 머리(눈썹·큰 제목·설명),
    카드(`p-4` 종이 칸 · 오른쪽 위 화살표). 두 화면을 띠로 오가므로 같은 문법이어야 한 사이트로 읽힌다.

    **묶음은 색이 아니라 선으로 나눈다** (2026-09-15). 묶음마다 초록·하늘·노랑 아이콘을 달았더니 상태판처럼
    읽혔다 — 묶음 머리는 번호 + 가는 선(`01 제목 ─── 개수`). 선은 섹션 구분에만 쓰고, 카드는 상자 그대로다.
  -->
  <div class="mx-auto flex w-full max-w-(--ui-container) flex-col gap-16 px-5 py-6">
    <header class="flex max-w-3xl flex-col gap-4">
      <p class="text-xs tracking-widest text-dimmed">
        DECISIONS · 기록 {{ 기록수 }}개
      </p>
      <h1 class="text-3xl font-semibold tracking-tight text-highlighted sm:text-4xl">
        이 사이트는 이런 고민 속에 만들어졌습니다
      </h1>
      <p class="text-base leading-relaxed text-muted">
        갈림길이 나오면 말로 고르지 않았습니다. 데이터 구조는 전송량과 권한으로 따져 보고,
        화면은 후보를 한 화면에 나란히 놓고 같은 조건에서 비교해 골랐습니다.
        카드를 누르면 그때 깔았던 비교판이 열립니다.
      </p>
      <!-- 묶음 요약 — 세로 가는 선으로 나눈 한 줄. 누르면 그 묶음으로 내려간다 -->
      <nav class="mt-2 flex flex-wrap items-center gap-y-2 text-sm">
        <a
          v-for="(묶음, i) in 묶음s"
          :key="묶음.이름"
          :href="`#${묶음.키}`"
          class="flex items-baseline gap-1.5 border-default px-3 text-muted transition-colors first:pl-0 hover:text-highlighted not-first:border-l"
        >
          <span class="font-mono text-xs tabular-nums text-dimmed">{{ 번호(i) }}</span>
          {{ 묶음.이름 }}
          <span class="tabular-nums text-dimmed">{{ 묶음.항목s.length }}</span>
        </a>
      </nav>
    </header>

    <section
      v-for="(묶음, i) in 묶음s"
      :id="묶음.키"
      :key="묶음.이름"
      class="flex scroll-mt-24 flex-col gap-6"
    >
      <div class="flex flex-col gap-1.5">
        <h2 class="flex items-baseline gap-3 text-lg font-semibold text-highlighted">
          <span class="font-mono text-xs font-normal tabular-nums text-dimmed">{{ 번호(i) }}</span>
          <span class="shrink-0">{{ 묶음.이름 }}</span>
          <span
            class="h-px grow self-center bg-border"
            aria-hidden="true"
          />
          <span class="font-mono text-xs font-normal tabular-nums text-dimmed">{{ 묶음.항목s.length }}</span>
        </h2>
        <p class="pl-[calc(2ch+0.75rem)] text-sm text-muted">
          {{ 묶음.설명 }}
        </p>
      </div>

      <ul class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <li
          v-for="기록 in 묶음.항목s"
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

            <!-- 갈래가 섞이는 묶음(미반영·열림)에서만 꼬리표를 단다 — 정한 것은 묶음 이름이 이미 말한다 -->
            <span
              v-if="!묶음.갈래"
              class="mt-auto pt-1"
            >
              <UBadge
                color="neutral"
                variant="subtle"
                size="sm"
              >
                {{ 기록.갈래 }}
              </UBadge>
            </span>
          </NuxtLink>
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
import { decisionRecord, decisionStatus, hasDecisionBoard, type iDecisionEntry } from '~/utils/decisions'
import { useHeroPageTitle } from '~/composables/useLayoutHero'

/**
 * **소개 화면(`/portfolio`)과 같은 옷을 입는다**(`layout-official` — 투명 헤더·짧은 사진 히어로·바닥).
 * 포트폴리오 띠에서 「소개 ↔ 고민 기록」을 오갈 때 머리가 바뀌면 딴 사이트로 건너간 것처럼 읽힌다.
 * 히어로 제목은 띠의 링크 이름(「고민 기록」)과 같은 말로 올린다 — 아래 `h1` 과 다른 말이라 둘 다 선다.
 *
 * **목차와 상세만 입는다. 판(`decisions/*`)은 안 입는다** — 판은 헤더·칸 폭·`--ui-layout-header-offset` 을
 * 제 몸으로 재현하는 비교대라, 그 위에 사진 히어로와 공식 머리를 얹으면 비교하던 조건이 바뀐다.
 */
definePageMeta({ layout: 'layout-official' })
useHeroPageTitle('고민 기록')

useHead({ title: '이런 고민 속에 만들어졌습니다' })

const router = useRouter()
/** 판이 라우터에 실제로 있는 기록만 — 카드가 곧 그 판의 링크다. 개수도 여기서 센다. */
const 보이는기록s = decisionRecord.filter(기록 => hasDecisionBoard(기록, router))
const 기록수 = 보이는기록s.length
const 정한것 = (갈래: iDecisionEntry['갈래']) => 보이는기록s.filter(기록 => 기록.갈래 === 갈래 && decisionStatus(기록) === '정함')

/** 묶음 번호 — 걸러진 뒤의 순서라 빈 묶음이 빠져도 01부터 이어진다 */
const 번호 = (i: number) => String(i + 1).padStart(2, '0')

const 묶음s: { 키: string, 이름: string, 설명: string, 갈래?: iDecisionEntry['갈래'], 항목s: iDecisionEntry[] }[] = [
  {
    키: 'architecture',
    이름: '정한 것 · 설계',
    설명: '데이터를 어디서 잇고, 얼마나 받고, 누가 무엇을 보게 할지',
    갈래: '설계' as const,
    항목s: 정한것('설계')
  },
  {
    키: 'decided',
    이름: '정한 것 · 화면',
    설명: '고른 값이 이미 화면에 나가 있습니다',
    갈래: '화면' as const,
    항목s: 정한것('화면')
  },
  {
    /**
     * 고른 날과 나간 날 사이. **이 묶음이 비어 있는 게 정상이고, 길어지면 그게 신호다** —
     * 판에서 고르기만 하고 안 옮기면 실코드와 기록이 서로 다른 말을 하기 시작한다.
     */
    키: 'pending',
    이름: '골랐고, 아직 안 넣었다',
    설명: '방향은 정했고 코드가 아직 거기까지 오지 않았습니다',
    항목s: 보이는기록s.filter(기록 => decisionStatus(기록) === '미반영')
  },
  {
    키: 'open',
    이름: '아직 열려 있는 질문',
    설명: '후보는 놓고 봤고 아직 안 골랐습니다',
    항목s: 보이는기록s.filter(기록 => decisionStatus(기록) === '열림')
  }
].filter(묶음 => 묶음.항목s.length > 0)
</script>

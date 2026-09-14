<template>
  <!--
    v2 전용 최소 셸: 상단 탭 한 줄 + 본문 + 우측 도크.
    도크 패널은 fixed 라 문서 흐름에서 자리를 차지하지 않는다 — 열렸을 때 본문이 가려지지 않도록
    셸에 같은 폭만큼 padding 을 준다(폭은 `useDock().vars` 가 소유한다).
  -->
  <div
    class="min-h-dvh transition-[padding] duration-200 ease-out lg:pe-(--dock-inset)"
    :style="[dockVars, { '--ui-layout-header-offset': HEADER_OFFSET }]"
  >
    <!--
      이 셸은 `lHeader` 를 안 쓰고 내비 한 줄로 끝낸다. 그래도 높이를 알리는 창구는 같아야 한다 —
      `--ui-layout-header-offset` 은 `lHeader` 가 실측값을 적는 그 변수이고, 본문 높이 계산과
      도크 헤더가 모두 이걸 읽는다. 그래서 숫자는 루트에 한 번만 적고 아래는 전부 파생시킨다.
    -->
    <!--
      `relative z-50`: 좁은 화면에서 도우미를 펼치면 스크림이 `fixed inset-0 z-30` 으로 **뷰포트를
      통째로** 덮는다. 이 줄에 z 가 없으면 상단 탭도 같이 덮여 도크 여닫이가 가려지고,
      **도우미로 돌아갈 길이 화면에서 사라진다.** `lHeader`(z-50)가 다른 레이아웃에서 하는 일이다.
      (상세는 더 이상 여기 안 걸린다 — 셸 안 트랙에서 밀리므로 덮는 물건이 아니다.)
    -->
    <nav class="relative z-50 h-(--ui-layout-header-offset) flex flex-row items-center gap-2 px-4 border-b border-(--ui-border) bg-default">
      <div class="shrink-0 font-semibold me-2">
        v2
      </div>

      <!--
        탭이 열하나라 좁은 화면에서 줄이 넘친다. 넘치는 쪽은 가로로 밀고
        (`overflow-x-auto`), 도크 여닫이는 `shrink-0` 으로 자리를 지킨다 —
        그게 밀려나면 도우미로 돌아갈 길이 사라진다.
      -->
      <div class="flex min-w-0 flex-1 flex-row items-center gap-2 overflow-x-auto">
        <NuxtLink
          v-for="item in 표본탭s"
          :key="item.path"
          :to="item.path"
          :class="탭cls(item.path)"
        >
          {{ item.label }}
        </NuxtLink>

        <!--
          묶음이 갈리는 자리. **알약 자신이 아니라 사이에 세운다** — 알약에 `border-s` 를 붙이면
          그 칸이 활성일 때 반전된 배경의 왼쪽 모서리가 각지게 잘린다.
        -->
        <div class="mx-1 h-4 w-px shrink-0 bg-(--ui-border)" />

        <NuxtLink
          v-for="item in 태그탭s"
          :key="item.path"
          :to="item.path"
          :class="탭cls(item.path)"
        >
          {{ item.label }}
        </NuxtLink>
      </div>

      <!-- 테마 손잡이는 도크 목록 안에 있다. 헤더에 남는 건 그 패널의 여닫이뿐이다 -->
      <div class="shrink-0 flex items-center">
        <l전체찾기 />
        <lDock토글 />
      </div>
    </nav>

    <!--
      도크 껍데기는 공용(lDock), 코파일럿만 v2 전용 pane 이다.
    -->
    <lDock>
      <lAICopilotV2 :sources="v2AI소스s()" />
      <l테마 />
    </lDock>

    <!--
      좁은 화면에서 도크가 「한 줄」로 남으면 그만큼 본문이 비켜준다(`--dock-inset-bottom`).
      가로의 `lg:pe-(--dock-inset)` 과 같은 일이다 — 안 비키면 스트립이 폼의 저장 버튼을 덮는데,
      도우미의 `추가`·`수정` 은 **저장을 화면에서** 하게 만드는 흐름이라 그 버튼이 곧 결말이다.
    -->
    <div class="h-[calc(100dvh-var(--ui-layout-header-offset)-var(--dock-inset-bottom,0px))] p-2 transition-[height] duration-200 ease-out">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { v2AI소스s } from '~utils/aiV2/sources'

const route = useRoute()
const { vars: dockVars } = useDock()

/*
 * 헤더 높이는 셸 루트에 인라인으로만 단다(위 `:style`). 한때 `:root` 에도 같이 적었는데,
 * **텔레포트로 셸 밖에 나간 상세**가 인라인을 못 읽어서였다. 상세가 셸 안으로 돌아와
 * 그 소비자가 없어졌다 — 안쪽은 도크까지 전부 상속으로 받는다.
 */
const HEADER_OFFSET = '3rem'

/** 탭 알약 한 벌. 두 묶음이 같은 손잡이라 모양은 한 자리에서만 적는다. */
const 탭cls = (path: string) => [
  'shrink-0 px-3 py-1 rounded-full text-sm transition-colors',
  route.path === path
    ? 'bg-(--ui-bg-inverted) text-(--ui-bg)'
    : 'text-(--ui-text-muted) hover:bg-(--ui-bg-elevated)'
]

/** v2 표본 — lowDB 위의 시험용 표들(`~models/v2`). 지우고 다시 부어도 잃을 게 없는 자리다. */
const 표본탭s = [
  { label: '과일', path: '/v2/fruits' },
  { label: '동물', path: '/v2/animals' },
  { label: '채소', path: '/v2/vegetables' },
  { label: '기록', path: '/v2/records' },
  { label: '견본', path: '/v2/samples' },
  { label: '문서', path: '/v2/docs' },
  { label: '테마', path: '/v2/theme' }
] as const

/*
 * `persona` 묶음(인물·배경·장소)은 여기 한 띠로 서 있다가 자기 셸(`layout-p`, `/p/*`)로 나갔다.
 * 지우고 다시 부을 표본이 아니라서 도우미 소스까지 따로 가진다(`personaAI소스s`).
 */

/**
 * `_tags` 묶음 — 태그·메모·일정. **여기 앞의 표본들과 달리 진짜 표다.**
 *
 * 표본은 lowDB 위의 시험용이라 접근제어 밖에 있지만(`access-control.global.ts` 의
 * `접근제어제외경로s` 가 `/v2` 를 통째로 뺀다), 이 셋은 `menus` 행이 있고 회원 데이터를 든다.
 * 그래서 같은 `/v2` 아래로 들어오면서 **미들웨어에 예외의 예외로 따로 적혔다** —
 * 안 적으면 로그아웃 상태로도 메모·일정이 통째로 열린다.
 *
 * 주소의 정본은 여기가 아니라 `menus` 행이다(`model메뉴.경로`). 옮길 땐 시드
 * (`seeds/model메뉴.seed.ts`)·`localDB/menus.json`·저 미들웨어까지 네 자리가 같이 움직인다.
 *
 * **자료는 여기 있다가 본(`/resources`)으로 나갔다.** 넷이 같이 서 있던 건 셸을 옮기던
 * 동안의 자리였을 뿐이고, 나간 뒤로는 GNB(`menus`)가 그린다 — 이 띠에 남겨 두면
 * 같은 화면으로 가는 문이 둘이 된다.
 *
 * 캘린더만 메뉴에 없다 — 표 하나의 화면이 아니라 여러 표(일정·메모·회원·행사·수업·신청받기)를
 * 날짜로 합쳐 보는 판이라서다(`model달력s`). 메뉴 행이 없으니 보호 대상도 아니다.
 *
 * **주소는 `/calendar` 다, `/v2/*` 가 아니다.** `/v2` 는 `~models/v2` 표본의 자리고 이 판은
 * `~models/test2` 를 읽는다. 페이지 파일은 `(test)/(test2)/` 라우트 그룹에 있다 — 괄호라 주소에 안 남는다.
 */
const 태그탭s = [
  { label: '캘린더', path: '/calendar' },
  { label: '일정', path: '/v2/events' },
  { label: '메모', path: '/v2/memos' },
  { label: '태그', path: '/v2/tags' }
] as const
</script>

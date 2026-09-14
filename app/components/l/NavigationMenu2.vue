<!--
  GNB — **두 자리에 나눠 선다.** 같은 컴포넌트를 `자리` 로 두 번 쓴다.

      [바 가운데]  요약  회원  콘텐츠  신청  자료 | 설정
      [바 밑 한 줄]        설문  퀴즈  투표  수업  행사  자료

  ## 왜 나눴나 — 가로 폭이 문제였다

  자식을 섹션 알약 안에 품어 봤고(트레이), 그 전엔 흐름 밖 둘째 줄이었고, 그 전엔 뜨는 패널이었다.
  셋 다 **바의 가운데 슬롯**에 넣으려 했다는 점이 같다. 거기가 이 앱에서 제일 좁은 자리다 —
  역할 탭·로고(왼쪽)·테마/로그인/도크(오른쪽)와 한 줄을 나눠 쓴다. **실측: 1280px 창에서 가운데
  슬롯은 521px(41%)이고 바 밑 한 줄은 1280px이다.** 자식 여섯짜리 섹션(콘텐츠)이 안 들어가는 건
  그림을 바꿔서 될 일이 아니었다.

  **자라는 것을 안 자라는 자리에서 뺐다.** (도크를 열면 셸 패딩이 두 줄을 똑같이 깎는다 —
  달라지는 건 출발점이지 도크에 대한 면역이 아니다.)

  거쳐온 것과 각각 왜 내렸는지 —

  1. **뜨는 패널**(~2026-09-05 오전). 어휘가 두 벌이었다 — 알약인데 자식이 있으면 알약을 안 씌웠다
     (`navDropdownTriggerClass`). 패널도 Nuxt UI 기본값이라 완전 둥근 알약 옆에서 각졌다.
  2. **흐름 밖 둘째 줄**(하루). **매다는 것 자체는 맞았다** — 틀린 건 옷이었다. 알약 밑에 뜨는
     좁은 카드였고 종이 + 링 + **그림자 3단** 을 입었는데, 그건 메뉴·팝오버의 층이다. 상주하는 물건이
     뜬 물건의 옷을 입으니 열린 드롭다운처럼 보이는데 안 닫혔다.
  3. **트레이**(반나절). 알약이 그 자리에서 벌어져 자식을 품었다. 모양은 이게 제일 조용했는데
     **콘텐츠(6)·커뮤니티(5)에서 줄이 길었다.** 위에 적은 그대로 — 자리가 좁아서지 그림 탓이 아니다.
  4. **흐름 안의 바 밑 한 줄**(한 시간). 폭은 풀렸는데 **매단다는 것을 잃었다.** 헤더가 64→99px 로
     커지면서 본문이 통째로 내려갔고, 실측이 한 프레임 늦게 오는 탓에 그 사이 화면이 넘쳐 흘렀다
     (본문이 35px 초과, 도크 머리는 63px 인데 헤더는 99px). **폭과 매달기는 둘 다 지켜야 한다** —
     하나를 풀려고 다른 하나를 놓은 것이 이 칸의 교훈이다.

  ## 지금 규율

  - **여닫는 것이 없다. 상태도 없다 — 라우트에서 파생된다.** 지금 경로가 속한 섹션의 자식이 곧
    아랫줄이다. 새로고침·뒤로가기·딥링크가 전부 맞는다. (`섹션항목`)
  - **아랫줄은 바 밑에 매달린다 — 밀어내지 않는다.** `lHeader` 안에서 `absolute top-full` 이고,
    `useElementSize` 는 절대 배치된 자식을 안 세므로 **`--ui-layout-header-offset` 이 64px 로 고정**
    이다. 섹션을 갈아타도 헤더 높이가 안 변하고, 그 변수를 읽는 도크·페이지 서른 곳이 아무 일도
    안 겪는다. 이게 이 컴포넌트에서 제일 쉽게 깨지는 규율이다 — 폭을 손보다가 한 번 놓쳤다.
  - **자식이 없는 섹션이면 아랫줄을 아예 안 그린다.** 매달릴 것이 없을 뿐, 높이는 원래 안 준다.
  - **폴더를 누르면 첫 잎으로 이동한다** — 폴더는 `path` 가 없으니 갈 곳이 필요하고, 이동해야
    아랫줄이 바뀐다(이 컴포넌트가 상태를 안 드는 이유).
  - **줄이 넘치면 깨지는 대신 가로로 흐르고**(`.gnb-row`, 스크롤바는 감춘다), 지금 잎이 밖으로
    밀려 있으면 끌어온다(`지금잎을보이게`). 화면 폭을 다 쓰므로 여기까지 갈 일은 거의 없다.

  대가 둘, 알고 고른 것 —
  - **다른 섹션을 미리 볼 수 없다.** 훑어보려면 이동해야 한다. 뜨는 패널이 주던 유일한 것이다.
  - **본문 맨 위 한 줄을 덮는다.** 흐름 밖에 두는 값이다. 헤더가 `relative` 라 스크롤하면 같이
    사라지므로 읽는 동안은 안 걸리지만, **헤더 바로 밑에 누를 것을 두는 화면**이 생기면 여기부터
    의심할 것. 반대쪽 값(밀어내기)은 위 4번에서 이미 치러 봤고 더 비쌌다.

  **진짜 답은 나무 쪽에 있다.** 커뮤니티의 자식 다섯 중 넷은 `model게시판` 의 **행**이고(공지·FAQ·
  자료실·뉴스), 콘텐츠의 여섯 중 다섯은 `model콘텐츠물` 서브클래스라 화면이 같다 — 둘 다 목적지가
  아니라 **필터**다. 그걸 GNB에서 내리면 자식 최대 넷이 되고, 그때는 아랫줄이 없어도 된다.
  `menuDirectory` 는 데이터라 `/admin/menus` 화면에서 코드 없이 줄일 수 있다.

  손자(3단)는 안 그린다. 자식이 또 자식을 가지면 그 자식의 첫 잎으로 가는 링크 한 칸으로 눕는다.

  ## 모바일 (2026-09-05) — **나무를 통째로 서랍에 넣는다**

  `lg` 미만에서는 **윗줄이 Nuxt UI 테마에 의해 통째로 숨는다**(`center: "hidden lg:flex"`).
  그래서 한동안 모바일은 **부모 없이 자식만** 매달린 채였고, 햄버거는 `#body` 가 비어 있어
  전체화면 빈 시트를 열었다. 셋째 자리(`자리="시트"`)가 그 자리를 받는다 —

  - **두 줄이 다 접힌다.** 윗줄은 테마가 숨기고, **아랫줄은 `lg` 미만에서 우리가 뗀다**
    (`hidden lg:flex`). 좁은 화면에서 바 밑에 매달린 줄은 흐르는 본문 위를 덮는데, 모바일은
    그 한 줄이 화면의 5%다. **덮는 값을 안 치르는 대신 한 번 더 눌러 연다.**
  - **서랍 안에는 나무가 다 있다 — 섹션과 그 자식 전부.** 접었다 폈다 하지 않는다(상태가 없다).
    다른 섹션의 자식도 그대로 보이므로, 데스크톱이 포기한 「미리 보기」가 여기서는 공짜로 온다.
    좁은 화면에서는 세로가 남는 축이고 목록은 어차피 굴리는 물건이다.
  - **채워진 칸은 정확히 하나 — 지금 페이지.** 세로로 눕히면 부모와 자식이 위아래로 붙는데,
    두 줄에서처럼 둘 다 채우면 고른 것이 둘로 보인다. 그래서 자식을 가진 섹션 줄은 채우지 않고
    **글자만 또렷해진다**(묶음 머리). 자식이 없는 섹션은 자기가 잎이라 채운다.
  - **햄버거가 「지금 섹션 이름 ▾」 이다**(`lHeader` 의 `#toggle`, 라벨은 `activeNavItemOf`).
    숨은 윗줄이 알려주던 「지금 어느 섹션」을 한 칸으로 돌려놓는다 — 라우트에서 파생되니 상태가 안 는다.
  - 고르면 이동하고 서랍은 닫힌다. (같은 줄을 다시 누르면 라우트가 안 변해 `autoClose` 가
    안 도므로 `선택` 을 쏜다.)

  안 고른 것 — **바닥 탭바.** 라우트 파생 규율은 지키는데 섹션이 여섯 + 설정이라 5칸 관례를 넘고,
  바닥에서 도크와 자리를 다툰다. 바꿀 것이 규율이 아니라 그림뿐이라 지금 치를 값이 아니었다.
-->
<template>
  <!--
    자리 = '섹션' — 바 가운데 한 줄. 자식이 있든 없든 전부 같은 알약이다(그게 첫 개편의 절반).
    **아이콘을 안 그린다** — 묶음(폴더)은 메뉴 표의 행이 아니라 역할의 `메뉴순서`가 만든 것이라
    아이콘이 없다. 잎만 아이콘을 달면 한 줄 안에서 어떤 알약은 그림이 있고 어떤 건 없다.
    아이콘이 있는 자리는 전부 잎인 아랫줄이다.

    `min-w-0` — 이게 없으면 flex 부모 안에서 nav 가 내용만큼 벌어져 `.gnb-row` 의 가로 흐름이 안 걸린다.
  -->
  <nav
    v-if="자리 === '섹션'"
    class="min-w-0"
  >
    <div
      ref="줄ref"
      class="gnb-row flex min-w-0 flex-row items-center gap-1 overflow-x-auto"
    >
      <template
        v-for="(item, index) in items"
        :key="isNavDivider(item) ? `${modeKey}-nav-divider-${index}` : itemKey(item, index)"
      >
        <div
          v-if="isNavDivider(item)"
          role="separator"
          aria-orientation="vertical"
          class="gnb-divider"
        />
        <NuxtLink
          v-else-if="목적지(item)"
          :to="목적지(item)!"
          :class="알약cls(isItemActive(item))"
          :aria-current="isItemActive(item) ? 'page' : undefined"
        >
          {{ item.label }}{{ activeSuffix(isItemActive(item)) }}
        </NuxtLink>
      </template>
    </div>
  </nav>

  <!--
    자리 = '자식' — 바 **밑에 매달리는** 한 줄(`lHeader` 의 `#bottom`, 거기서 `absolute top-full`).
    화면 폭을 통째로 쓰는 자리라 자식이 여섯이든 열이든 안 넘친다.
    자식이 없으면 통째로 안 그린다 → 매달릴 것이 없다.

    **흐름 밖이라 자기 면을 든다** — 본문이 이 줄 밑으로 지나가기 때문이다. **바와 같은 바닥(`bg-page`)** +
    **층 1**, 위는 안 둥글고 아래만 둥글다: 바에서 **내려온 서랍**으로 읽히게.
    (2026-09-15 전엔 종이 `bg-default` 였다 — 회색 바 밑에 흰 조각이 매달려 딴 물건으로 읽혔다.
    바는 `bg-page/50` 이지만 뒤가 같은 바닥이라 결국 바닥색이고, 이 줄은 흰 칸 위에 얹히니 **불투명**으로 칠해야 같은 색이 된다.
    `-mt-px` 로 바의 아래 경계선을 덮어 둘을 한 면으로 잇는다.)
    **그림자는 위쪽을 잘라낸다**(`clip-path: inset(0 -2rem -2rem -2rem)`). 다크에선 층 그림자가 흰 후광이라 위로도 번지는데,
    그게 이음새 바로 위 바를 밝게 물들여(실측 RGB 15,23,43 → 20,28,48) 면 색은 같은데 줄이 다른 색처럼 읽혔다.
    서랍은 바에서 내려온 것이라 위로 드리울 그림자가 원래 없다. 라이트는 아래로 떨어지는 그림자라 잘라도 그대로다.

    **굴림만 축 밖이다 — 붙박이 `0.5rem`.** 여기만 사다리 칸(`rounded-b-lg`)을 안 쓴다.
    굴림 축을 끝까지 올리면 그 칸이 16px 이 되어 이 줄이 **알약**이 되는데, 알약은 바에서
    떨어져 나온 것처럼 보인다 — 「내려온 서랍」이 「뜬 것」으로 뒤집히고, 그건 이 줄이
    하루 만에 한 번 실패했던 바로 그 읽힘이다. **모양의 뜻이 걸린 자리라 축을 안 태운다**
    (CLAUDE.md 「테마」의 "넘기면 뚫린다 — 대신 그 자리는 축 밖으로 나간다").
    그러니 굴림 손잡이를 돌렸을 때 **여기가 혼자 안 움직이는 건 위반이 아니라 의도다.**
    (`rem` 이라 글자 크기는 따라간다. 값은 굴림 기본값에서 나오던 8px 그대로다.)

    층을 2 이상 주지 말 것 —
    층 3 은 메뉴·팝오버의 층이라, 상주하는 줄이 그 옷을 입으면 열린 드롭다운처럼 보이는데 안 닫힌다
    (한 번 그래서 하루 만에 내렸다. 그때 틀린 건 **매단 것이 아니라 입힌 옷**이었다).

    **면은 내용만큼만 넓다**(`w-fit`). 흐름 밖이라 칠한 만큼 본문을 가리는데, 화면 폭을 꽉 채워
    칠했더니 페이지 제목이 통째로 덮였다. 폭은 **필요할 때 쓸 수 있으면** 되는 것이고
    (`max-w-full` + 가로 흐름), 늘 차지할 필요는 없다.

    **좌우·아래에 흐린 구조선(`border-default/50`)을 늘 긋는다** (2026-09-15). 윤곽을 그림자 하나에만
    맡겼더니 그림자 축이 `없음`(-2)인 테마에서 그림자가 `0 0 #0000` 이 되어, 흰 조각이 흰 본문에 녹고
    헤더 경계선만 끊긴 채 떠 보였다. 그림자가 있으면 선은 후광에 묻히고, 없으면 선이 서랍 모양을 지킨다.
    한 단 흐린 농도는 `lHeader` 의 `선농도`(층 > 0)와 같은 값이다. 위쪽은 헤더 경계선에 붙으니 안 긋는다.
    그림자 `없음`일 때만 진하게 하려면 테마가 루트에 단계를 표시해야 한다 — 지금은 변수 값뿐이라 CSS 가 모른다.
  -->
  <nav
    v-else-if="자리 === '자식' && 섹션항목"
    class="hidden w-full flex-row justify-center px-4 lg:flex"
  >
    <div
      ref="줄ref"
      class="gnb-row m-층-카드 flex w-fit max-w-full min-w-0 flex-row items-center gap-1 overflow-x-auto -mt-px [clip-path:inset(0_-2rem_-2rem_-2rem)] rounded-b-[0.5rem] border border-t-0 border-default/50 bg-page px-2 py-1.5"
    >
      <NuxtLink
        v-for="(자식, 자식index) in 섹션항목.children"
        :key="`${modeKey}-sub-${자식.path ?? 자식index}`"
        :to="목적지(자식)!"
        :class="작은알약cls(isItemActive(자식))"
        :aria-current="isItemActive(자식) ? 'page' : undefined"
      >
        <UIcon
          v-if="자식.icon"
          :name="자식.icon"
          class="size-4"
        />
        {{ 자식.label }}
      </NuxtLink>
    </div>
  </nav>

  <!--
    자리 = '시트' — 모바일 서랍 안(`lHeader` 의 `#mobile` → `UHeader` 의 `#body`).
    **두 줄이 여기서 한 나무로 합쳐진다** — 섹션과 그 자식이 전부, 접힘 없이.
    가로 폭이 문제였던 자리(바)를 떠났으므로 나눠 세울 이유도 같이 사라진다.

    가로로 넓은 자리라 알약을 안 쓴다 — 알약은 폭이 내용만큼인 물건인데 여기서는 줄이 폭을 다 쓴다.
    **채워진 칸은 하나뿐**이고(지금 페이지), 자식을 가진 섹션 줄은 묶음 머리라 안 채운다(머리말 참고).

    자식만 아이콘을 단다 — 두 줄에서와 같은 이유다(묶음은 역할의 `메뉴순서` 가 만든 것이라
    아이콘이 없고, 섞으면 한 목록 안에서 어떤 줄은 그림이 있고 어떤 건 없다). 여기서는 들여쓴 단이
    갈라 주므로 「아이콘 있음 = 잎」이 오히려 한 겹 더 읽힌다.
  -->
  <nav
    v-else-if="자리 === '시트'"
    class="flex flex-col gap-0.5"
  >
    <template
      v-for="(item, index) in items"
      :key="isNavDivider(item) ? `${modeKey}-sheet-divider-${index}` : `${modeKey}-sheet-${itemKey(item, index)}`"
    >
      <div
        v-if="isNavDivider(item)"
        role="separator"
        class="gnb-divider-h"
      />
      <template v-else-if="목적지(item)">
        <NuxtLink
          :to="목적지(item)!"
          :class="자식s(item).length
            ? 시트머리cls(isItemActive(item))
            : 시트잎cls(isItemActive(item))"
          :aria-current="!자식s(item).length && isItemActive(item) ? 'page' : undefined"
          @click="emit('선택')"
        >
          {{ item.label }}
        </NuxtLink>

        <!-- 자식 단. 왼쪽 선 하나로 묶음에 매단다 — 들여쓰기만으로는 여섯 줄쯤에서 소속이 흐려진다. -->
        <div
          v-if="자식s(item).length"
          class="ms-3.5 flex flex-col gap-0.5 border-s border-default ps-2.5"
        >
          <NuxtLink
            v-for="(자식, 자식index) in 자식s(item)"
            :key="`${modeKey}-sheet-sub-${자식.path ?? 자식index}`"
            :to="목적지(자식)!"
            :class="시트잎cls(isItemActive(자식))"
            :aria-current="isItemActive(자식) ? 'page' : undefined"
            @click="emit('선택')"
          >
            <UIcon
              v-if="자식.icon"
              :name="자식.icon"
              class="size-4 shrink-0"
            />
            {{ 자식.label }}
          </NuxtLink>
        </div>
      </template>
    </template>
  </nav>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'
import type { NavItem, NavLink } from '~/composables/useNavs'
import { activeSectionOf, firstNavPath, isNavDivider, isNavItemActive } from '~/composables/useNavs'

interface Props {
  items: NavItem[]
  modeKey: string
  /**
   * 어느 자리에 서는가. 같은 나무를 세 번 그리되 자리마다 다른 조각을 낸다 —
   * `'섹션'` 은 바 가운데 알약 줄, `'자식'` 은 바 밑 한 줄(`lHeader` 의 `#bottom`),
   * `'시트'` 는 모바일 서랍 안 세로 목록(`lHeader` 의 `#mobile`).
   * 나누지 않고 한 덩어리로 그리면 셋 다 바의 좁은 가운데 슬롯에 갇힌다(머리말 참고).
   */
  자리?: '섹션' | '자식' | '시트'
  config?: {
    suffix?: string
  }
}

const props = withDefaults(defineProps<Props>(), {
  자리: '섹션',
  config: () => ({})
})

/**
 * `선택` — 시트에서 한 줄을 눌렀다. **서랍을 닫는 건 이 컴포넌트 일이 아니다**(상태를 안 든다).
 * 라우트가 바뀌면 `UHeader` 의 `autoClose` 가 알아서 닫지만, **지금 있는 섹션을 다시 누르면**
 * 라우트가 안 변해 서랍이 열린 채 남는다 — 그 한 경우 때문에 있다.
 */
const emit = defineEmits<{ 선택: [] }>()

const route = useRoute()

function itemKey(item: NavLink, index: number) {
  if (item.path) return `${props.modeKey}-${item.path}`
  return `${props.modeKey}-nav-item-${index}`
}

/**
 * 활성 판정·갈 곳은 **`useNavs` 가 소유한다** — 세 자리(윗줄·아랫줄·시트)에 더해 레이아웃의
 * 토글 라벨까지 같은 답을 써야 하는데, 여기 한 벌 · 레이아웃 한 벌로 두 벌이 되어 있었다.
 */
function isItemActive(item: NavLink): boolean {
  return isNavItemActive(item, route.path)
}

function 목적지(item: NavLink): string | null {
  return firstNavPath(item)
}

/** 시트에서만 쓴다 — 두 줄은 `섹션항목` 하나만 펴지만 여기는 나무를 통째로 편다. */
function 자식s(item: NavLink): NavLink[] {
  return item.children ?? []
}

/**
 * 아랫줄을 내는 섹션. 열림 상태가 아니라 **라우트**가 정한다.
 * 하나만 돌려준다 — 두 섹션이 같은 경로를 물고 있어도 아랫줄은 하나여야 한다.
 */
const 섹션항목 = computed(() => activeSectionOf(props.items, route.path))

const 줄ref = ref<HTMLElement | null>(null)

/**
 * 줄이 넘쳤을 때 **지금 잎**을 보이는 데로 끌어온다. 이 내비의 약속이 "지금 어디가 늘 보인다" 인데,
 * 자식 많은 섹션에서 잎이 오른쪽으로 밀려 나가면 그 약속이 조용히 깨진다.
 *
 * `scrollIntoView` 를 안 쓴다 — 스크롤되는 조상을 전부 움직여서 본문까지 딸려 올라간다.
 * 여기서는 이 줄의 `scrollLeft` 만 만지고, **이미 보이면 아무것도 안 한다**(가운데 정렬하지 않는다 —
 * 라우트마다 줄이 스르륵 움직이면 그게 새 소음이다).
 */
function 지금잎을보이게() {
  const 줄 = 줄ref.value
  if (!줄) return
  const 지금 = 줄.querySelector<HTMLElement>('[aria-current="page"]')
  if (!지금) return

  const 여백 = 12
  const r = 줄.getBoundingClientRect()
  const a = 지금.getBoundingClientRect()
  if (a.left < r.left + 여백) 줄.scrollLeft -= r.left + 여백 - a.left
  else if (a.right > r.right - 여백) 줄.scrollLeft += a.right - (r.right - 여백)
}

onMounted(() => void nextTick(지금잎을보이게))
watch(() => route.path, () => void nextTick(지금잎을보이게))

function activeSuffix(isActive: boolean) {
  if (!isActive) return ''
  return props.config.suffix ?? ''
}

/**
 * 섹션 알약 — 윗줄. 지금 섹션도 여기 그대로 서고, 채워져서 어느 아랫줄인지 알린다.
 *
 * **크롬은 부품을 안 쓰고 자체 선언한다 — 시맨틱 토큰만 타고 취향 축(굴림·재질·강조색)은 안 탄다.**
 * (이 파일·`Header.vue`·`테마.vue` 는 `mButton`/`UButton` 을 0회 쓴다. 도크·코파일럿은 쓴다 — 저긴 도구고
 *  여긴 크롬이다.) 토큰을 타는 건 취향이 아니라 **모드 대응**이라서다: `bg-inverted` 가 다크에서
 *  흰색으로 안 뒤집히면 검은 바탕에 검은 알약이 된다. 그 위층(축)만 안 타는 것이고, 아래는 그대로 탄다.
 *
 * **그래서 `bg-inverted`(검정/흰색)는 이 줄이 선점한 색이다 — 「지금 여기」라는 뜻.**
 * 다른 자리에서 검정 solid 를 쓰면 상주하는 이 줄과 뜻이 부딪힌다. 액션 버튼에 쓰지 말 것
 * (`m/테마/재질.ts` 의 `켜짐` 이 그 색을 쓰는 유일한 어휘다).
 *
 * **굴림은 축 밖이다 — 붙박이 `rounded-full`.** 사다리 칸(`rounded-lg`)을 안 쓴다.
 *
 * 밑에 매달리는 줄(`gnb-row`)이 축을 안 타는 것과 **같은 부류의 결정이고, 이유는 다르다.**
 * 저긴 모양이 「내려온 서랍」이라는 뜻을 져서였다. 여긴 **자리가 전사이트이기 때문**이다 —
 * 내비게이션은 모든 화면에 같은 모양으로 서서 "여기가 어디인지"를 말하는 유일한 줄이고,
 * 그래서 테마 손잡이를 따라 모양이 흔들리면 안 되는 **고정점**이다. 굴림을 「각지게」 끝까지
 * 내렸을 때 판이 전부 각져도 내비만 알약으로 남는 건 어긋난 게 아니라 **그게 기준선**이라는 뜻이다.
 *
 * 그러니 굴림 손잡이를 돌렸을 때 **여기가 혼자 안 움직이는 건 위반이 아니라 의도다.**
 * (아랫줄 `작은알약cls` 도 같은 이유로 `rounded-full` 이다 — 둘은 한 벌이라 같이 간다.)
 */
function 알약cls(isActive: boolean) {
  return [
    'inline-flex shrink-0 items-center gap-2 rounded-full border px-[1.125rem] py-[0.45rem] text-[1.0625rem] leading-tight font-medium whitespace-nowrap no-underline transition-colors duration-200',
    isActive
      ? 'border-transparent bg-inverted text-inverted'
      : 'border-transparent text-muted hover:bg-inverted hover:text-inverted'
  ]
}

/**
 * 자식 알약 — 아랫줄. 한 단 작고, 지금 페이지만 채운다.
 * 채우는 방식은 섹션 알약과 같아야 같은 물건으로 읽힌다.
 */
/**
 * 시트 잎 — 세로 목록의 **누르면 그 페이지인 줄**. 알약이 아니라 폭을 다 쓰는 줄이고,
 * 채우는 방식(`bg-inverted`)만 두 줄과 같게 둬서 같은 물건으로 읽히게 한다.
 * 손가락이 누르는 자리라 세로 여백이 알약보다 한 단 크다.
 */
function 시트잎cls(isActive: boolean) {
  return [
    'flex flex-row items-center gap-2 rounded-lg px-3 py-2.5 text-[0.9375rem] leading-tight no-underline transition-colors duration-200',
    isActive
      ? 'bg-inverted text-inverted font-medium'
      : 'text-default hover:bg-elevated'
  ]
}

/**
 * 시트 묶음 머리 — 자식을 가진 섹션. **안 채운다.** 세로로 눕히면 부모와 자식이 붙어 있어서
 * 둘 다 채우면 고른 것이 둘로 보인다(두 줄에서는 서로 다른 줄에 있어 안 그랬다).
 * 지금 그 섹션 안에 있으면 글자만 또렷해진다. 그래도 링크는 링크다 — 누르면 첫 잎으로 간다.
 */
function 시트머리cls(isActive: boolean) {
  return [
    'flex flex-row items-center gap-2 rounded-lg px-3 pt-2.5 pb-1.5 text-base leading-tight font-semibold no-underline transition-colors duration-200',
    isActive ? 'text-highlighted' : 'text-muted hover:text-default'
  ]
}

/** 자식 알약 — 아랫줄. 한 단 작다. 굴림이 축 밖인 이유는 `알약cls` 주석 — 둘은 한 벌이다. */
function 작은알약cls(isActive: boolean) {
  return [
    'inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-[0.3rem] text-sm leading-tight font-medium whitespace-nowrap no-underline transition-colors duration-200',
    isActive
      ? 'bg-inverted text-inverted'
      : 'text-muted hover:bg-default hover:text-highlighted'
  ]
}
</script>

<style scoped>
/**
 * 줄이 넘치면 깨지는 대신 가로로 흐른다. 스크롤바는 감춘다 — 헤더 한 줄 밑에 막대가 뜨면
 * 그게 새 소음이고, 넘치는 건 자식 많은 섹션에서만 가끔 일어난다.
 */
.gnb-row {
  scrollbar-width: none;
}

.gnb-row::-webkit-scrollbar {
  display: none;
}

.gnb-divider {
  margin-inline: 0.125rem;
  height: 1.75rem;
  width: 1px;
  flex-shrink: 0;
  background: color-mix(in srgb, var(--ui-border) 90%, transparent);
}

/*
 * `:global(.dark) .gnb-divider` 로 적지 말 것 — Vue 는 `:global()` 뒤를 버리고 **`.dark { background }`** 로 컴파일해서
 * `.dark` 가 붙은 모든 요소(다크 모드의 `<html>`, `dark` 로 토큰 범위를 연 포트폴리오 띠)를 칠했다.
 * scoped 는 속성을 마지막 복합 선택자에만 붙이므로 조상 `.dark` 는 그냥 적으면 된다.
 */
.dark .gnb-divider {
  background: color-mix(in srgb, var(--ui-border) 62%, transparent);
}

/** 같은 구분선이 시트에서는 눕는다 */
.gnb-divider-h {
  margin-block: 0.25rem;
  height: 1px;
  width: 100%;
  background: color-mix(in srgb, var(--ui-border) 90%, transparent);
}

.dark .gnb-divider-h {
  background: color-mix(in srgb, var(--ui-border) 62%, transparent);
}
</style>

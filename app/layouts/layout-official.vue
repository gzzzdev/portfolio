<!--
  공식 사이트 레이아웃 — official.team-mjt.com(`mjt-official/app/layouts/default.vue`)을 옮겼다.
  **페이지가 고르지 않는다** — `middleware/layout.global` 이 `useOfficialSite().is공식화면` 으로 `route.meta.layout` 에 적는다. `/official/*` 전부, 그리고
  공식 사이트 사람(비회원·학습자·준회원)이 자기 메뉴 화면(신청·소통·자료 …)을 볼 때. 운영자·담당자의 공용 화면은 `default` 다.

  `default` 와 **내비가 다르다.** 그쪽은 앱의 GNB다 — 로그인한 역할의 메뉴(`gnbMode`), 역할 탭, 가운데 알약, 바 밑 자식 줄.
  여기는 기관 홈페이지의 머리다 — 왼쪽 기관 로고, 오른쪽 드롭다운 메뉴, 로그인. 메뉴는 **공식 사이트 사람이면 자기 역할 것**,
  운영자가 `/official` 을 열었으면 비회원 것이다 — 바깥 얼굴은 누가 봐도 같아야 해서다.
  메뉴 항목은 원본처럼 설정 파일이 아니라 DB(`model메뉴` + 역할 `menuDirectory`)에서 온다 — 운영자 메뉴 편집이 여기까지 닿고,
  접근제어(`access-control.global`)가 보는 목록과 어긋나지 않는다. 폴더(묶음)는 드롭다운이 된다.
  서브도메인 루트(`/official`, 「홈」)는 줄에 안 세운다 — 원본처럼 기관 이름이 그 입구다.

  **히어로는 이 레이아웃이 그린다.** 공식 홈(`layoutHero: 'default'`)은 큰 캐러셀 + 바닥 공지 띠, 나머지는 같은 사진의 짧은 히어로
  (제목·브레드크럼은 지금 켜진 메뉴에서 — `useOfficialSite().지금메뉴`). 내리면 히어로가 줄고 헤더가 위에 붙는다.

  **투명 헤더.** 모든 판에 히어로가 있으니 헤더는 늘 히어로 위에 얹힌다. `lHeader` 의 투명 모드는
  `fixed top-0` 이라 이 리포의 포트폴리오 띠(`app.vue`, 헤더보다 먼저 서는 줄)를 덮는다. 그래서 여기선
  **`sticky` + 제 높이만큼 음수 아래 여백**으로 얹는다 — 띠 밑에서 시작해 히어로를 덮고, 내려가면 위에 붙는다.
  맨 위에선 흰 글자·바탕 없음, 조금이라도 내리면 바탕이 든다.

  **공지 띠.** 히어로 바닥의 공지 띠(`lLandingNoticeBar`)가 헤더 밑선에 닿으면 `lLayoutHero` 가
  `landing-notice-in-header` 를 켜고 제 띠를 숨긴다 — 그때 이 헤더 밑에 같은 띠가 붙는다(원본과 같은 이음).
-->
<template>
  <!--
    바탕은 **종이 한 장**(`bg-default`)이다. 원본(`mjt-official`)도 레이아웃 바탕 위에 페이지가 바로 앉았다.
  -->
  <div
    class="flex min-h-dvh flex-col bg-default transition-[padding] duration-200 ease-out pb-(--dock-inset-bottom) lg:pe-(--dock-inset)"
    :style="dockVars"
  >
    <div
      ref="머리Ref"
      class="sticky top-0 z-50"
      :style="{ marginBottom: `-${머리높이}px` }"
    >
      <UHeader
        v-model:open="모바일메뉴열림"
        mode="drawer"
        :ui="머리ui"
        :to="홈경로"
      >
        <!--
          기관 로고 — 원본(`mjt-official`)과 같은 그림(`/img/logo.png`, 산 + 「마장터」). 히어로 위(흰 글자 때)엔
          검정으로 눌렀다 뒤집어 흰 로고로 쓴다. 그림에 이름이 들어 있어 글자는 스크린리더 몫으로만 둔다.
        -->
        <template #title>
          <img
            src="/img/logo.png"
            :alt="기관.이름"
            width="319"
            height="256"
            class="h-10 w-auto shrink-0 transition sm:h-11"
            :class="is흰글자
              ? 'brightness-0 invert drop-shadow-[0_1px_2px_rgba(0,0,0,0.55)]'
              : 'opacity-90 dark:brightness-0 dark:invert dark:opacity-100'"
          >
        </template>

        <template #right>
          <UNavigationMenu
            :items="메뉴s"
            variant="link"
            color="neutral"
            content-orientation="vertical"
            class="hidden lg:flex"
            :ui="메뉴ui"
          />
          <!--
            **운영 화면으로 돌아가는 문.** 운영자·담당자가 `/official` 을 열면 메뉴가 비회원 것이고(바깥 얼굴은 누가 봐도 같다)
            기관 이름은 `/official` 이라, 이 버튼이 없으면 운영 화면으로 갈 길이 없다.
            가는 곳은 `/` 다 — 미들웨어가 지금 역할의 첫 메뉴로 보낸다(`/admin`·`/admin/own`). 경로를 여기 적지 않는다.
            기관 이름을 `/` 로 바꾸지 않는 이유: 비로그인은 `/` 에서 포트폴리오 소개로 가서 협회 로고가 딴 데로 샌다.
          -->
          <mButton
            v-if="is운영쪽"
            to="/"
            역할="조용"
            size="xs"
            icon="i-lucide-layout-dashboard"
            :class="is흰글자 ? 'text-white hover:bg-white/10' : ''"
          >
            <span class="hidden sm:inline">운영 화면으로</span>
          </mButton>
          <!--
            로그인·패널은 **테 없는 선 아이콘**(`실사`)으로 선다 — 사진 위 기관 머리에서 글자 버튼은 앱 조각처럼 튄다.
            색은 이 줄이 준다: 사진 위 흰색(메뉴와 같은 그림자), 바탕이 들면 기본색.
          -->
          <div
            class="ms-2 flex items-center gap-0.5 transition-colors"
            :class="is흰글자 ? 'text-white [filter:drop-shadow(0_1px_2px_rgb(0_0_0/0.4))]' : 'text-default'"
          >
            <l전체찾기 실사 />
            <m로그인4 실사 />
            <lDock토글 실사 />
          </div>
        </template>

        <template #body>
          <UNavigationMenu
            :items="메뉴s"
            orientation="vertical"
            variant="link"
            color="neutral"
            class="-mx-2.5"
            @update:model-value="모바일메뉴열림 = false"
          />
        </template>
      </UHeader>

      <!-- 흐름 밖(`absolute top-full`)이라 헤더 높이·음수 여백을 안 흔든다 -->
      <div
        v-if="noticeInHeader"
        class="absolute inset-x-0 top-full border-b border-default shadow-sm"
      >
        <lLandingNoticeBar tone="header" />
      </div>
    </div>

    <!--
      포트폴리오 입구 레일 — 소개·이력서·고민 기록 세 화면에서만 선다(판정은 컴포넌트가 자기 목록으로 한다).
      페이지가 아니라 **레이아웃에** 둔다: 세 화면이 이 레이아웃을 같이 입어서, 서로 오갈 때 레일이 갈아끼워지지 않고
      강조 칸만 옮겨 간다(페이지에 두면 누를 때마다 등장 애니메이션이 다시 돈다).
    -->
    <lQuickMenuR />

    <lDock>
      <lAICopilot :sources="사이트AI소스s()" />
      <!-- 테마로 가는 유일한 길이라 여기서도 세운다(`default.vue` 의 같은 자리 주석) -->
      <l테마 />
    </lDock>

    <!--
      페이지를 히어로보다 먼저 두고(DOM) 보이는 순서만 `order` 로 뒤집는다 — 원본 `mjt-official` 레이아웃과 같은 배치.
      **이것만으론 hydration 을 못 맞춘다** — 서버는 비동기 페이지를 기다리는 동안 뒤 형제(히어로)를 먼저 그린다.
      그래서 상세 제목은 마운트 뒤에 바꿔 끼운다(아래 `is마운트`).
    -->
    <div class="flex grow flex-col">
      <!--
        **칸(세로선 + 종이 칸)을 두르지 않는다** (2026-09-15). `default` 의 칸은 운영 화면의 틀이다 — 바닥은 물들고 칸 안만 종이라
        화면 끝까지 닿는 사진 바로 밑에서 폭이 좁아지고 양옆에 선·다른 색이 생겨, 히어로와 본문이 딴 사이트처럼 읽혔다.
        폭은 페이지가 이미 갖는다(`mx-auto max-w-(--ui-container)`). 여기선 히어로 밑 숨 쉴 자리와 바닥까지의 여백만 준다.
      -->
      <main
        class="order-2 grow"
        :class="route.meta.꽉찬폭 ? '' : 'pt-4 pb-16 sm:pt-6 sm:pb-20'"
      >
        <slot />
      </main>
      <lLayoutHero
        class="order-1"
        :mode="is홈 ? 'default' : 'short'"
        :carousel-slides="히어로s"
        :notice-bar="is홈"
        :short="짧은머리"
      />
    </div>

    <UFooter :ui="바닥ui">
      <template #left>
        <div class="flex flex-col gap-0.5">
          <p class="font-semibold text-highlighted">
            {{ 기관.이름 }}
          </p>
          <p class="text-sm text-muted">
            {{ 기관.한줄 }} · © {{ 올해 }}
          </p>
        </div>
      </template>
    </UFooter>
  </div>
</template>

<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
import { computed, ref, watch } from 'vue'
import { useElementSize, useWindowScroll } from '@vueuse/core'
import { provideHeroTitle, useHeroPageTitleState, type LayoutHeroShortPayload } from '~/composables/useLayoutHero'
import { isNavItemActive, type NavLink } from '~/composables/useNavs'
import { OFFICIAL_HOME, useOfficialSite } from '~/composables/useOfficialSite'
import { useMyAuthStore } from '~/stores/useMyAuthStore'
import { model게시판s, model메뉴s, model역할s } from '~models/test2'
import { 사이트AI소스s } from '~utils/ai/sources'
import { 기관, 히어로s } from '~/components/home/_홈글'

const route = useRoute()
const 홈경로 = OFFICIAL_HOME

/** `default.vue` 와 같은 이유로 게시판까지 읽는다 — 게시판 메뉴의 경로가 슬러그에서 파생된다. */
void Promise.all([model메뉴s.getInstance().reads(), model게시판s.getInstance().reads(), model역할s.getInstance().reads()])

const { 메뉴s: 메뉴원본s, 지금메뉴, is공식역할 } = useOfficialSite()

/** 로그인했는데 공식 사이트 사람이 아니다 — 첫 메뉴가 `/official` 이 아닌 역할(지금 시드로는 운영자·담당자). */
const authStore = useMyAuthStore()
const is운영쪽 = computed(() => authStore.isLoggedIn && !is공식역할.value)

const toMenu = (item: NavLink): NavigationMenuItem => {
  const children = item.children?.length ? item.children.map(toMenu) : undefined
  return {
    label: item.label,
    ...(children ? { children } : { to: item.path }),
    active: isNavItemActive(item, route.path)
  }
}
const 메뉴s = computed<NavigationMenuItem[]>(() => 메뉴원본s.value.map(toMenu))

/* ── 히어로 ───────────────────────────────────────────────── */
const is홈 = computed(() => route.meta.layoutHero === 'default')
/** 상세 화면이 올린 제목(`useHeroPageTitle`). 경로가 같을 때만 — 앞 화면이 남긴 값이 붙지 않게. */
const 페이지제목상태 = useHeroPageTitleState()
/**
 * **마운트 뒤에만 읽는다.** 서버는 히어로를 페이지 setup 이 제목을 올리기 전에 그리므로(비동기 페이지를 기다리는 동안 형제가 먼저 선다)
 * 서버 그림은 늘 메뉴 이름이다. hydration 까지 같은 그림을 두고, 그 뒤 상세 제목으로 바꾼다 — 바뀔 땐 히어로의 등장 애니메이션이 다시 돈다.
 */
const is마운트 = ref(false)
onMounted(() => {
  is마운트.value = true
})
const 올린제목 = computed(() => (페이지제목상태.value?.path === route.path ? 페이지제목상태.value.title : ''))
const 페이지제목 = computed(() => (is마운트.value ? 올린제목.value : ''))
/**
 * 짧은 히어로 머리 — 원본처럼 **켜진 메뉴 이름**이 제목이다. 상세 화면이 제 제목을 올렸으면 그게 제목이 되고
 * 메뉴는 브레드크럼 가운데로 물러난다(「홈 › 신청 › 회원 명부 정비 워크숍」).
 */
const 짧은머리 = computed<LayoutHeroShortPayload>(() => {
  const 메뉴 = 지금메뉴.value
  return {
    title: 페이지제목.value || 메뉴?.label || '',
    breadcrumbs: [
      { label: '홈', to: 홈경로, icon: 'i-material-symbols-light-home-outline' },
      ...(메뉴 ? [{ label: 메뉴.label, to: 메뉴.path }] : []),
      ...(페이지제목.value ? [{ label: 페이지제목.value }] : [])
    ]
  }
})
/**
 * 히어로가 말하는(말할) 제목 — 페이지 머리가 같은 말이면 제목 줄을 뺀다(`useIsHeroTitle`). 큰 캐러셀은 제목을 말하지 않는다.
 * 마운트를 안 기다린 값(`올린제목`)을 준다 — 페이지는 제 setup 이 제목을 올린 **뒤에** 그려져서 서버·클라이언트가 같은 답을 내고,
 * 기다리면 서버엔 페이지 제목 줄이 섰다가 마운트 뒤 빠지며 본문이 한 번 튄다.
 */
provideHeroTitle(computed(() => (is홈.value ? '' : 올린제목.value || 지금메뉴.value?.label || '')))

const 모바일메뉴열림 = ref(false)

/* ── 투명 헤더 ─────────────────────────────────────────────── */
const { y: 스크롤y } = useWindowScroll()
const is흰글자 = computed(() => 스크롤y.value <= 12)

const 머리Ref = ref<HTMLElement | null>(null)
const { height: 머리실측 } = useElementSize(머리Ref)
/**
 * SSR 첫 그림에서 음수 여백이 0이면 히어로가 헤더만큼 밀렸다가 튄다 — 바 높이(`--ui-header-height`, 4rem)로 먼저 잡는다.
 * 그래서 바 높이를 내용에 맞춰 줄이면(`h-auto`) 안 된다 — 실측(53px)과 이 값이 어긋나 히어로가 한 번 움직이고,
 * 히어로가 먼저 잰 제 자리(`lLayoutHero` 의 `--l-hero-top`)가 틀려 바닥 공지 띠가 첫 화면 밖으로 잘린다.
 */
const 머리높이 = computed(() => Math.round(머리실측.value) || 64)

/** 히어로(`lLayoutHero`)·도크·페이지가 읽는 헤더 높이. `lHeader` 가 하던 일을 이 레이아웃이 한다. */
watch(머리실측, (h) => {
  if (import.meta.server || h <= 0) return
  document.documentElement.style.setProperty('--ui-layout-header-offset', `${Math.round(h * 100) / 100}px`)
}, { flush: 'post', immediate: true })
onUnmounted(() => document.documentElement.style.removeProperty('--ui-layout-header-offset'))

const noticeInHeader = useState('landing-notice-in-header', () => false)

const 머리ui = computed(() => ({
  root: [
    'static border-b transition-[background-color,border-color,backdrop-filter] duration-300',
    is흰글자.value ? 'border-transparent bg-transparent backdrop-blur-none' : 'border-default bg-default/90 backdrop-blur'
  ].join(' '),
  toggle: is흰글자.value ? 'text-white' : ''
}))

/**
 * 메뉴 줄 — 원본 `lNavigationMenu`(투명 헤더 판)처럼 **켜진 메뉴는 강조색 글자, 박스(`before:` 배경)는 없다.**
 *
 * 원본은 사진 위에서도 `text-primary` 그대로였다. 이 테마의 강조색은 어두워서(보라·남색 계열) 흐린 사진 위에선 글자가 묻힌다 —
 * 그래서 **사진 위에서** 강조색에 흰색을 섞어 한 톤 밝히고(색상은 테마를 따른다), 줄 전체에 옅은 그림자를 준다.
 * 다크 모드는 강조색이 이미 밝아서 덜 섞는다(라이트 45% · 다크 70%) — 라이트와 같이 섞으면 흰 글자와 구분이 안 된다.
 * 바탕이 들면 원래 강조색이다.
 *
 * 누른 뒤 남던 네모는 포커스 테두리(`focus-visible:before:outline`)였다. 테두리는 끄고, 키보드 포커스는 밑줄로 보인다.
 */
const 메뉴ui = computed(() => ({
  link: [
    'px-3.5 text-lg font-semibold tracking-tight before:bg-transparent hover:before:bg-transparent data-[state=open]:before:bg-transparent data-active:before:bg-transparent',
    'focus-visible:before:outline-0 focus-visible:underline underline-offset-8',
    is흰글자.value
      ? 'text-white hover:text-white/80 [text-shadow:0_1px_2px_rgb(0_0_0/0.35)] data-active:text-[color-mix(in_oklab,var(--ui-primary)_45%,white)] aria-[current=page]:!text-[color-mix(in_oklab,var(--ui-primary)_45%,white)] dark:data-active:!text-[color-mix(in_oklab,var(--ui-primary)_70%,white)] dark:aria-[current=page]:!text-[color-mix(in_oklab,var(--ui-primary)_70%,white)]'
      : 'text-default hover:text-highlighted data-active:text-primary aria-[current=page]:!text-primary'
  ].join(' '),
  childLinkLabel: 'font-medium'
}))

/* ── 바닥 ─────────────────────────────────────────────────── */
const 올해 = new Date().getFullYear()
const 바닥ui = {
  root: 'border-t border-default bg-elevated/50',
  container: 'py-6 lg:py-5'
}

const { vars: dockVars } = useDock()
</script>

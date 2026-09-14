<template>
  <!--
    도크 패널은 fixed 라 문서 흐름에서 자리를 차지하지 않는다.
    열렸을 때 본문(헤더·lMain)이 가려지지 않도록 셸에 같은 폭만큼 padding 을 준다.
    가로(`--dock-inset`)는 데스크톱 전용이고, 좁은 화면에서는 도크가 아래에서 올라오므로
    「한 줄」로 남은 높이만큼 세로로 비켜준다(`--dock-inset-bottom` — 넓은 화면에선 언제나 0).
  -->
  <div
    class="min-h-dvh transition-[padding] duration-200 ease-out pb-(--dock-inset-bottom) lg:pe-(--dock-inset)"
    :style="dockVars"
  >
    <lHeader
      v-model:open="모바일메뉴열림"
      :층="1"
      토글자리="left"
    >
      <template #title />

      <!--
        「지금 섹션 이름 ▾」 — 모바일에서만 선다(`lg:hidden`).
        `lg` 미만에서는 바 가운데(윗줄)가 Nuxt UI 테마에 의해 숨으므로 「지금 어느 섹션인가」를
        말할 자리가 없어진다. 라벨은 라우트에서 파생되니(`activeNavItemOf`) 상태가 안 는다.
      -->
      <template #toggle="{ toggle }">
        <mButton
          역할="조용"
          class="lg:hidden"
          trailing-icon="i-lucide-chevron-down"
          :aria-expanded="모바일메뉴열림"
          aria-label="메뉴 열기"
          @click="toggle"
        >
          {{ 지금섹션이름 }}
        </mButton>
      </template>

      <template #left>
        <!-- 역할 탭은 모바일에서 바를 뜬다 — 390px 를 아이콘 셋·토글과 나눠 쓸 폭이 없다. 서랍 맨 위로 간다. -->
        <mTabs
          v-if="역할탭s.length"
          v-model="gnbMode"
          :items="역할탭s"
          type="segment"
          size="sm"
          class="hidden h-full lg:flex"
        />
      </template>

      <template #default>
        <div class="flex flex-row justify-end items-center gap-1">
          <lNavigationMenu2
            :items="visibleNavs"
            :mode-key="gnbMode"
          />
        </div>
      </template>

      <!--
        자식은 바 밑 한 줄로 내려간다 — 가운데 슬롯은 역할 탭·테마·도크와 나눠 쓰는 데다
        도크가 열리면 더 좁아져서, 자식 여섯짜리 섹션이 안 들어간다. 여기는 화면 폭을 다 쓴다.
        자식 없는 섹션에선 아무것도 안 그리므로 높이가 0 이고, 있을 때 늘어난 높이는
        `lHeader` 가 `--ui-layout-header-offset` 에 실어 보낸다(페이지들이 이미 읽는 그 변수).

        **`lg` 이상에서만 선다**(컴포넌트 안 `hidden lg:flex`). 모바일에서는 나무가 통째로
        서랍 안으로 들어가므로 이 줄이 본문 위를 덮을 이유가 없다.
      -->
      <template #bottom>
        <lNavigationMenu2
          :items="visibleNavs"
          :mode-key="gnbMode"
          자리="자식"
        />
      </template>

      <!--
        모바일 서랍(`UHeader` 의 `#body`). **역할 → 나무 전체**(섹션과 그 자식 전부).
        `lg` 미만에서는 윗줄이 테마에 숨고 아랫줄은 우리가 떼므로, 바깥에 남는 내비가 없다 —
        여기가 유일한 자리다 (`lNavigationMenu2` 머리말 「모바일」).
      -->
      <template #mobile>
        <div class="flex flex-col gap-4">
          <mTabs
            v-if="역할탭s.length > 1"
            v-model="gnbMode"
            :items="역할탭s"
            type="segment"
            size="sm"
            class="w-full"
          />
          <lNavigationMenu2
            :items="visibleNavs"
            :mode-key="gnbMode"
            자리="시트"
            @선택="모바일메뉴열림 = false"
          />
        </div>
      </template>

      <template #right>
        <div class="w-full flex flex-row items-center justify-end">
          <!-- 전체 찾기(⌘K). 창은 이 컴포넌트가 들고 있어 레이아웃마다 하나다 -->
          <l전체찾기 />
          <m로그인4 />
          <!-- 도크 여닫이는 맨 오른쪽 — 패널이 나오는 쪽이자, 열렸을 때 그 자리를 패널 닫기 버튼이 이어받는 x 좌표다 -->
          <lDock토글 />
        </div>
      </template>
    </lHeader>

    <!--
      우측 도크. 껍데기(패널·헤더·탭 전환)는 `lDock` 이 소유하고, 그 안에 들어갈 pane 은 여기서 조립한다.
      pane 은 자기를 도크에 신고하므로(`useDockPane`) 도크가 pane 의 prop 을 알 필요가 없다.
      추후 메시징·메일쓰기 pane 도 이 자리에 한 줄로 붙는다.
    -->
    <lDock>
      <lAICopilot :sources="사이트AI소스s()" />
      <!--
        테마 pane. **여기 없으면 테마로 가는 길이 앱에서 통째로 사라진다** — 헤더 팔레트를 걷어낸
        2026-09-07 부터 진입점은 도크 목록의 이 줄 하나뿐이고, pane 은 자기가 마운트돼야
        도크에 신고한다(`useDockPane`). 단축키는 없다 — 전체 찾기(⌘K)의 「테마 열기」가 같은 줄을 연다.
      -->
      <l테마 />
    </lDock>

    <!--
      **칸 좌우에 세로선을 긋는다** (2026-09-14). 페이지가 바닥(`bg-page`)에 바로 앉으면 바깥 여백과 본문 칸이
      안 갈렸다. 종이를 한 장 까는 안은 레일·카드가 종이 위 종이로 묻혀서 졌고, 선은 층이 아니라서
      페이지 안을 몰라도 된다 — 비교는 `sandbox/theme/paper-placement`.

      - **칸 폭은 레이아웃이 갖는다 — 헤더와 같은 `--ui-container`.** 그래서 어느 페이지든 칸 선이 헤더 안쪽 끝과 맞는다.
        목록·상세 페이지는 루트를 이 칸에 꽉 채운다(`max-w-(--ui-container)`). 한때 공지·자료 목록이 `5xl` 로 좁혀져
        선과 본문 사이가 144px 씩 비어 영역이 깨진 것처럼 읽혔다. 선을 페이지 루트에 걸어 폭을 따라가게도 해 봤는데,
        그러면 페이지마다 칸 폭이 달라져 헤더와 안 맞았다. 작은 폼(`checkout/fail`·`my-info`)만 칸 안 가운데에 좁게 선다.
      - **칸 안은 종이(`bg-default`)다.** 바닥과 같은 면에 선만 그었더니 선이 바닥에 묻혀 안 보였고(구조선은 종이 위에서 잰 값),
        무엇보다 「종이만 무채 — 바닥은 색온도를 탄다」(`mTheme.css` 면 블록)와 어긋났다. 칸 안이 흰색·검정이고
        바깥만 물들어야 경계가 면으로 선다. 그래서 선은 구조선(`border-default`) 그대로다.
        대가: 칸 안의 카드(목록 상자·레일)가 종이 위 종이가 되어 선 한 줄로만 갈린다.
      - 선이 중간에 끊기면 그것도 경계로 읽혀서 칸에 최소 한 화면 높이를 준다. 폰 폭은 여백이 없어 선도 면도 안 준다.
      - 화면을 꽉 채우는 작업대·홈은 `definePageMeta({ 꽉찬폭: true })` 로 빠진다. 칸에 두르면 넓은 화면에서 80rem 에 갇힌다.
    -->
    <slot v-if="route.meta.꽉찬폭" />
    <div
      v-else
      class="mx-auto w-full max-w-(--ui-container) sm:min-h-[calc(100dvh-var(--ui-layout-header-offset,var(--ui-header-height))-var(--dock-inset-bottom,0px))] sm:border-x sm:border-default sm:bg-default"
    >
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, toValue, watch } from 'vue'
import {
  activeNavItemOf,
  isNavPathActive,
  normalizeNavPath,
  pathsFromNavItems,
  useNavs,
  type GnbMode
} from '~/composables/useNavs'
import { model게시판s, model메뉴s, model역할s } from '~models/test2'
import { 사이트AI소스s } from '~utils/ai/sources'
import { useMyAuthStore } from '~/stores/useMyAuthStore'
import { storeToRefs } from 'pinia'

const menusRepo = model메뉴s.getInstance()
const boardsRepo = model게시판s.getInstance()
const rolesRepo = model역할s.getInstance()
const authStore = useMyAuthStore()
const { currentRole, roles: authRoles } = storeToRefs(authStore)

const gnbMode = computed<GnbMode>({
  get: () => currentRole.value ?? 'guest',
  set: (mode) => {
    if (mode === 'guest') return
    currentRole.value = mode
  }
})
/**
 * `admin/boards/index.vue`와 동일: `watch` + `immediate`로 `reads()`.
 * 게시판까지 읽는 이유는 `메뉴.경로`가 게시판 슬러그에서 파생되기 때문이다(`model메뉴.get 경로`) —
 * 게시판이 비어 있으면 게시판 메뉴가 저장된 옛 `path` 로 떨어진다.
 */
watch(
  gnbMode,
  () => {
    void Promise.all([menusRepo.reads(), boardsRepo.reads(), rolesRepo.reads()])
  },
  { immediate: true, once: false }
)

/** 모바일 서랍. 여는 건 「지금 섹션 ▾」, 닫는 건 라우트 변화(`autoClose`)와 시트의 `선택`. */
const 모바일메뉴열림 = ref(false)

const gnbModeItems = computed(() => {
  const allowed = new Set(authRoles.value)
  return [...toValue(rolesRepo.list)]
    .filter(role => role.stateCode !== 'guest' && allowed.has(role.stateCode))
    .sort((a, b) => a.order - b.order)
    .map(role => ({
      label: role.이름,
      value: role.stateCode as Exclude<GnbMode, 'guest'>,
      icon: role.icon
    }))
})

/**
 * 역할 탭 — 바(데스크톱)와 서랍(모바일) **두 곳이 같은 배열을 본다.**
 * 예전엔 호출부에서 `gnbModeItems.reverse()` 를 적었는데, `reverse` 는 제자리 뒤집기라
 * computed 가 캐시한 그 배열을 렌더마다 뒤집었다 — 한 곳일 땐 안 드러났지만 두 곳이 되는 순간
 * 둘의 순서가 어긋난다. 사본을 한 번 뒤집어 둔다.
 */
const 역할탭s = computed(() => [...gnbModeItems.value].reverse())

const { visibleNavs } = useNavs(gnbMode)
const route = useRoute()
const modeNavPaths = computed(() =>
  pathsFromNavItems(visibleNavs.value).map(path => normalizeNavPath(path))
)

/**
 * 모바일 토글이 말하는 「지금 어디」. **자식이 없는 섹션(`설정`)도 이름이 나와야** 하므로
 * 아랫줄을 내는 `activeSectionOf` 가 아니라 최상위 활성 항목을 쓴다.
 * 어디에도 안 걸리면(도우미 실험장 같은 메뉴 밖 경로) 그냥 `메뉴`.
 */
const 지금섹션이름 = computed(
  () => activeNavItemOf(visibleNavs.value, route.path)?.label ?? '메뉴'
)

watch(gnbMode, () => {
  const paths = modeNavPaths.value
  if (!paths.length) return
  const isIncluded = paths.some(path => isNavPathActive(path, route.path))
  if (!isIncluded) {
    void navigateTo({ path: paths[0], replace: true })
  }
})

/** 패널 폭·본문 인셋은 도크가 소유한다(`useDock().vars`) — 레이아웃마다 따로 적으면 어긋난다. */
const { vars: dockVars } = useDock()
</script>

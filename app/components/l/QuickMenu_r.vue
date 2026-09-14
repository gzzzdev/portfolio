<!--
  포트폴리오 입구 레일 — 소개(`/portfolio`)·이력서(`/resume`)·고민 기록(`/decisions`) 세 화면에 같이 선다.
  세우는 곳은 `layout-official` 한 곳, 보일지는 여기서 경로로 가른다(`is입구화면`).
  세 화면을 오가는 사람이 어디서든 같은 자리에서 나머지로 건너가게 한다(띠의 「소개·이력서·고민 기록」과 같은 셋 + 비회원 홈·저장소).

  옛 `l/QuickMenu_r`(base2 `58a25fb^:app/components/l/QuickMenu_r/index.vue`)을 **모양 그대로** 되살리고 라벨·아이콘만 바꿨다(2026-09-15).
  - 그땐 `?theme=dev` 개발용 테마 레일이었다. 행은 홈·알림 링크 칸 + 테마 축 칸(첫 칸 「전체」만 꽉 찬 색, 색 축은 아이콘에 색).
    여기선 링크라 되돌리기(‹) 버튼은 뺐다. 색 축 칸의 아이콘 색도 뺐다 — 아이콘은 전부 `text-muted` 한 톤.
  - **강조 칸(옛 「전체」 자리)은 지금 화면**이 받는다(`aria-current`) — 세 화면에 같이 서면서 「여기가 어디냐」가 레일의 일이 됐다.
  - **여닫는 원형 버튼(FAB)은 뺐다** — 늘 펼쳐 둔다. 옛것의 바깥 클릭 닫기도 같이 빠졌다.
  - 바탕은 옛것의 `bg-default/90`(라이트 흰색) 대신 **옅은 neutral**(`neutral-100` / 다크 `neutral-800`) — 본문 종이와
    같은 흰 바탕이라 칸이 묻혀 글자가 안 읽혔다. 보통 칸 hover 도 그 한 칸 위(`neutral-200` / `neutral-700`)로 올렸다.
    강조 칸의 다크 판도 옛것(`neutral-400` 에 흰 글자)은 흐려서 밝은 칸(`neutral-200`)에 검은 글자로 뒤집었다.
  - 자리는 옛것의 `bottom-24` 대신 **세로 가운데**. 도크가 열리면 `--dock-inset` 만큼 비키는 건 옛것 그대로다
    (변수는 셸 `layout-official` 이 싣는다 — 세 화면 다 그 레이아웃이라 그대로 읽힌다).
  - z-20: 도크(z-30)·스크림 **아래**(옛것은 z-40) — 좁은 화면에서 도크 시트 위로 뜨면 안 된다.
-->
<template>
  <div
    v-if="is입구화면"
    class="fixed top-1/2 inset-e-4 z-20 -translate-y-1/2 transition-[inset-inline-end] duration-200 ease-out lg:inset-e-[calc(1rem+var(--dock-inset,0px))]"
  >
    <Transition
      appear
      enter-active-class="transition duration-500 ease-out"
      enter-from-class="translate-y-6 scale-95 opacity-0"
      enter-to-class="translate-y-0 scale-100 opacity-100"
    >
      <aside
        class="w-22 max-h-[min(70vh,calc(100dvh-6rem))] select-none overflow-y-auto rounded-md border border-default/60 bg-neutral-100/95 shadow-lg backdrop-blur-md max-lg:shadow-xl dark:border-default/50 dark:bg-neutral-800/90"
        aria-label="포트폴리오 바로가기"
      >
        <div class="flex flex-col divide-y divide-default/40">
          <NuxtLink
            v-for="문 in 입구s"
            :key="문.이름"
            :to="문.to"
            :target="문.external ? '_blank' : undefined"
            :external="문.external"
            :aria-label="문.이름"
            :aria-current="is지금(문) ? 'page' : undefined"
            :class="is지금(문) ? 칸강조 : 칸"
          >
            <UIcon
              :name="문.icon"
              :class="is지금(문) ? 'size-4 shrink-0 text-white/90 dark:text-neutral-950/90' : 'size-4 shrink-0 text-muted'"
            />
            <span :class="is지금(문) ? 'text-[0.625rem] font-medium leading-tight' : 'max-w-full truncate text-[0.625rem] font-medium leading-tight text-default'">{{ 문.짧은이름 }}</span>
          </NuxtLink>
        </div>
      </aside>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { 포트폴리오저장소 } from '~/composables/usePortfolio'

type 입구 = { 이름: string, 짧은이름: string, icon: string, to: string, external?: boolean }

/** 옛 `QuickMenu_r` 의 칸 두 벌 그대로: 보통 칸(홈·알림 자리) · 강조 칸(「전체」 자리) */
const 칸 = 'flex flex-col items-center gap-1 px-1.5 py-2 text-center transition-colors hover:bg-neutral-200/80 dark:hover:bg-neutral-700/80'
const 칸강조 = 'relative z-0 flex w-full flex-col items-center gap-1 px-1.5 py-2 text-center text-white transition-colors hover:bg-neutral-700 bg-neutral-600 dark:bg-neutral-200 dark:text-neutral-950 dark:hover:bg-neutral-300'

/** 레일 폭(w-22)에 맞춰 이름은 짧게. 아이콘은 색 없이 한 톤(`text-muted`) — 옛 색 축 칸의 아이콘 색은 뺐다 */
const 입구s: 입구[] = [
  { 이름: '포트폴리오 소개', 짧은이름: '소개', icon: 'i-lucide-user-round', to: '/portfolio' },
  { 이름: '개발자 이력서', 짧은이름: '이력서', icon: 'i-lucide-file-user', to: '/resume' },
  { 이름: '고민 기록 보기', 짧은이름: '고민 기록', icon: 'i-lucide-lightbulb', to: '/decisions' },
  { 이름: '비회원 홈 보기', 짧은이름: '비회원 홈', icon: 'i-lucide-globe', to: '/official' },
  { 이름: 'GitHub', 짧은이름: 'GitHub', icon: 'i-simple-icons-github', to: 포트폴리오저장소, external: true }
]

const route = useRoute()
/**
 * 레이아웃(`layout-official`)에 한 번 서고, **세 화면에서만** 보인다 — 같은 레이아웃을 입는 공식 사이트(`/official/*` 등)에는 안 선다.
 * 목차(`/decisions`)만이다 — 판(`/decisions/*`)은 이 레이아웃을 안 입는다. 그래서 같은 경로만 본다.
 */
const 입구화면s = ['/portfolio', '/resume', '/decisions']
const is입구화면 = computed(() => 입구화면s.includes(route.path))
const is지금 = (문: 입구) => !문.external && route.path === 문.to
</script>

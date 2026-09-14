<template>
  <!--
    persona 전용 셸: 상단 탭 한 줄 + 본문 + 우측 도크. 뼈대는 `layout-v2` 와 같다 —
    높이 변수(`--ui-layout-header-offset`)·도크 비킴(`--dock-inset`·`--dock-inset-bottom`)·
    탭 줄의 `relative z-50` 까닭은 거기 주석에 있다. 갈리는 건 탭 묶음과 코파일럿 소스뿐이다.
  -->
  <div
    class="min-h-dvh transition-[padding] duration-200 ease-out lg:pe-(--dock-inset)"
    :style="[dockVars, { '--ui-layout-header-offset': HEADER_OFFSET }]"
  >
    <nav class="relative z-50 h-(--ui-layout-header-offset) flex flex-row items-center gap-2 px-4 border-b border-(--ui-border) bg-default">
      <div class="shrink-0 font-semibold me-2">
        persona
      </div>

      <div class="flex min-w-0 flex-1 flex-row items-center gap-2 overflow-x-auto">
        <NuxtLink
          v-for="item in 탭s"
          :key="item.path"
          :to="item.path"
          :class="탭cls(item.path)"
        >
          {{ item.label }}
        </NuxtLink>
      </div>

      <div class="shrink-0 flex items-center">
        <l전체찾기 />
        <lDock토글 />
      </div>
    </nav>

    <lDock>
      <lAICopilotV2 :sources="personaAI소스s()" />
      <l테마 />
    </lDock>

    <div class="h-[calc(100dvh-var(--ui-layout-header-offset)-var(--dock-inset-bottom,0px))] p-2 transition-[height] duration-200 ease-out">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { personaAI소스s } from '~utils/aiV2/sources'

const route = useRoute()
const { vars: dockVars } = useDock()

const HEADER_OFFSET = '3rem'

const 탭cls = (path: string) => [
  'shrink-0 px-3 py-1 rounded-full text-sm transition-colors',
  route.path === path
    ? 'bg-(--ui-bg-inverted) text-(--ui-bg)'
    : 'text-(--ui-text-muted) hover:bg-(--ui-bg-elevated)'
]

/** 인물·배경·장소(`~models/persona`). 주소를 옮기면 `aiV2/sources.ts` 의 `personaAI소스s` 도 같이 옮긴다. */
const 탭s = [
  { label: '인물', path: '/p/characters' },
  { label: '배경', path: '/p/eras' },
  { label: '장소', path: '/p/places' }
] as const
</script>

<template>
  <!--
    도크 패널은 fixed 라 문서 흐름에서 자리를 차지하지 않는다.
    열렸을 때 본문이 가려지지 않도록 셸에 같은 폭만큼 padding 을 준다(폭은 `useDock().vars` 가 소유).
    좁은 화면에서는 도크가 아래에서 올라오므로 「한 줄」로 남은 높이만큼 세로로 비켜준다.
  -->
  <div
    class="min-h-dvh transition-[padding] duration-200 ease-out pb-(--dock-inset-bottom) lg:pe-(--dock-inset)"
    :style="dockVars"
  >
    <lHeader :층="1">
      <template #title />

      <!--
        **판 사이를 잇는 탭은 여기 없다.** 한때 캘린더·일정·메모·태그 넷을 손으로 적어 뒀는데,
        그 넷이 `layout-v2` 로 옮겨 가면서 남은 건 설문 모래밭 판들뿐이다. 그 자리에 새 목록을
        다시 손으로 적지 않는 이유는 모래밭 규칙이다 — 목차는 각 판의 `definePageMeta`(`제목`·`상태`)를
        `/sandbox` 가 긁어모아 그린다. 여기 적으면 판을 하나 더 만들 때마다 두 곳을 고쳐야 하고,
        한쪽을 잊으면 목차가 조용히 거짓말을 한다.
      -->
      <template #default>
        <div class="flex flex-row justify-end items-center">
          <NuxtLink
            to="/sandbox"
            class="rounded-full px-3 py-1 text-sm text-muted transition-colors hover:bg-elevated hover:text-highlighted"
          >
            모래밭
          </NuxtLink>
        </div>
      </template>

      <template #right>
        <div class="w-full flex flex-row items-center justify-end">
          <l전체찾기 />
          <!-- 테마는 도크 목록 안에 있다(전체 찾기의 「테마 열기」도 같은 줄을 연다) -->
          <lDock토글 />
        </div>
      </template>
    </lHeader>

    <!-- default 와 같은 pane 구성. -->
    <lDock>
      <lAICopilot :sources="사이트AI소스s()" />
      <l테마 />
    </lDock>

    <lMain>
      <slot />
    </lMain>
  </div>
</template>

<script setup lang="ts">
import { 사이트AI소스s } from '~utils/ai/sources'

const { vars: dockVars } = useDock()
</script>

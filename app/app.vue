<template>
  <UApp
    :locale="locale"
    :toaster="toaster"
  >
    <!--
      페이지 전환 진행 막대(Nuxt 내장). 페이지 `setup` 이 데이터를 `await` 하는 동안 Nuxt 는 앞 화면을 그대로 두는데,
      표시가 없어 누른 게 안 먹은 것처럼 읽혔다(`/` → `/official` 실측 0.6~0.9초). 페이지마다 스켈레톤을 두는 대신 전역에 한 줄.
      `throttle` 기본 200ms — 그보다 빨리 끝나는 전환에는 안 뜬다.
    -->
    <NuxtLoadingIndicator
      color="var(--ui-primary)"
      :height="3"
    />
    <!-- 포트폴리오 배포 전용 띠 — 어느 레이아웃이든 맨 위, 헤더보다 먼저 선다. -->
    <m포트폴리오띠 />
    <!-- 역할 입장(띠·소개 카드) 동안 화면을 덮는 진행 막 — 레이아웃이 갈려도 끊기지 않게 레이아웃 바깥에 -->
    <m포트폴리오입장 />
    <!--
      레이아웃은 `route.meta.layout` 이 정한다 — 페이지가 `definePageMeta({ layout })` 으로 적거나, 안 적은 화면은
      `middleware/layout.global` 이 **공식 사이트 화면인가**로 적는다(`/boards/*`·`/resources` 같은 공용 화면은 페이지가 모른다 —
      누가 보느냐로 갈린다). **여기서 `:name` 을 주지 않는다** — 값이 화면에 따라 문자열·`undefined` 를 오가면 `NuxtLayout` 이
      두 모드를 섞어 타서, 운영자가 띠로 들어온 뒤 나가는 이동마다 옛 페이지가 영영 남았다(그 미들웨어 머리말).
    -->
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>

<script setup lang="ts">
import { ko } from '@nuxt/ui/locale'

const locale = ko
const toaster = { position: 'bottom-left' }// 클릭에 걸리적거림..
</script>

<style>
.no-double-tap {
  /* 더블 탭 확대 기능을 끕니다 */
  touch-action: manipulation;

  /* 텍스트 선택 방지 (필요 시) */
  user-select: none;
  -webkit-user-select: none;
}
</style>

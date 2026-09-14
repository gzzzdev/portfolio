<template>
  <!--
    디자인틀 캔버스. **페이지가 얇은 이유**는 편집기가 컴포넌트(`~base-comps/PrintTemplate/편집기.vue`)라서다 —
    나중에 "이 회원의 등급증을 이 디자인틀로 발급" 같은 자리에서 편집기 없이 미리보기만
    띄우려면 캔버스가 페이지가 아니어야 한다. 여기 있는 것은 권한 게이팅 하나뿐이다.

    **지금은 준비중이다** (`~base-comps/PrintTemplate/준비중.ts`). 편집기는 전문 에디터 한 벌만큼의
    공수가 남았고, 그 상태로 문을 열어 두면 반쯤 고친 디자인틀이 발급에 쓰인다.
    되살릴 때 고칠 곳은 그 파일 한 줄이고, `Editor` 를 세우는 가지는 아래 그대로 남아 있다.

    **디자인틀의 GNB 진입점이다** (메뉴 `1026`). 표를 다루는 화면(`/admin/design-templates`)은
    좌측 디자인틀목록의 '관리' 링크로 나간다 — 여는 횟수가 이쪽이 훨씬 많아서다.

    **`/edit/` 아래에 있는 이유**: 이 화면은 표를 목록으로 그리지 않는다. 좌표를 갖는 물건이라
    표로는 못 고치고, 그래서 `view목록5` 를 얹을 수 없다. 같은 표의 관리 화면
    (`/admin/design-templates`)이 그 몫을 지고, 여기는 그 표를 캔버스로 고치는 자리다.
    높이·3분할은 편집기가 스스로 든다.
  -->
  <viewAlert v-if="!is관리자" />
  <viewComingSoon
    v-else-if="is디자인틀준비중"
    title="디자인틀"
    icon="i-lucide-layout-template"
    description="종이 위 상자를 끌어 배치를 짜는 캔버스입니다.
전문 편집기 한 벌만큼의 공수가 남아 있어, 반쯤 된 배치가 발급에 쓰이지 않도록 잠가 두었습니다."
    :되는일s="[
      '회원 화면의 등급증 · 명함 · 회원증 출력 — 기본 디자인틀로 그대로 나옵니다',
      '등급 이력 카드의 등급증 재발급 — 그때의 등급 · 발급번호로 뽑힙니다'
    ]"
  />
  <Editor v-else />
</template>

<script setup lang="ts">
definePageMeta({ 꽉찬폭: true })

import { storeToRefs } from 'pinia'

import { useMyAuthStore } from '~/stores/useMyAuthStore'
// 지역 이름이 ASCII 인 이유: 한글로 **시작하는** 태그는 Vue 템플릿 파서가 태그로 읽지 못한다
// (`<Panel규격>` 은 되고 `<디자인틀편집기>` 는 안 된다). 자동등록 이름도 같은 이유로 못 쓴다.
import Editor from '~base-comps/PrintTemplate/편집기.vue'
import { is디자인틀준비중 } from '~base-comps/PrintTemplate/준비중'

const { is관리자 } = storeToRefs(useMyAuthStore())
</script>

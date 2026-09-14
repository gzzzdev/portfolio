<template>
  <div class="h-[calc(100dvh-var(--ui-layout-header-offset,var(--ui-header-height,4rem)))] w-full flex flex-row justify-center py-2">
    <viewAlert v-if="!is관리자" />
    <template v-else>
      <view목록5
        v-model:selected="selected"
        v-model:is수정중="is수정중"
        :repository="XXs"
        :can수정="is관리자"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ 꽉찬폭: true })

import { do첫조회 } from '~/composables/do첫조회'

import { storeToRefs } from 'pinia'

import { useMyAuthStore } from '~/stores/useMyAuthStore'

import { ref } from 'vue'
import type {
  model사용자 as modelXX } from '~models/test2'
import {
  model사용자s as modelXXs,
  model회원s
} from '~models/test2'

/**
 * **로그인 계정 관리.** 이 표가 답하는 건 한 가지다 — 어떤 신원이 어떤 회원으로 들어오는가
 * (`model사용자.ts` 머리말). 그래서 화면도 그 세 칸만 낸다: 이메일 · 회원 · 로그인 연결.
 *
 * ## 여기서 못 하는 것
 *
 * **계정을 만들지 못한다.** 신원은 Supabase Auth(`auth.users`)가 소유하고 그건 PostgREST 밖이라,
 * 이 화면이 미는 건 언제나 `public.users` 한 행뿐이다. 그래서 여기서 새 행을 더하면
 * `authId`가 빈 「미연결」로 선다 — 그 이메일로 실제 가입이 일어나는 순간
 * `handle_new_auth_user` 트리거가 같은 이메일의 행을 찾아 `authId`를 채운다
 * (`_CUSTOM/sql/schema.auth.sql` 4절). **회원을 새로 만들지 않고 이어 붙이는 건 그 경로뿐이다** —
 * 미리 세워 두는 이 행이 곧 초대장인 셈이고, 없으면 트리거가 회원을 새로 판다.
 * 개발용 클릭로그인 계정만은 예외로 `/admin/setup`의 「개발 계정 만들기」가 Auth 쪽까지 만든다.
 *
 * ## 회원을 함께 읽는 이유
 *
 * 「회원」 선택지(`model회원s.options`)와 카드 제목(`model사용자.label` = 회원 이름)이 둘 다
 * 회원 목록에서 나온다. 안 읽으면 선택기가 비고 목록이 이메일만 늘어선다.
 * (메뉴는 안 읽는다 — 전역 미들웨어의 `reads네비()`가 이미 읽고 들어온다.)
 */
const XXs = modelXXs.getInstance()
const selected = ref<modelXX | null>(null)

const { is관리자, is수정중 } = storeToRefs(useMyAuthStore())

await do첫조회('users', () => Promise.all([
  XXs.reads(),
  model회원s.getInstance().reads()
]), is관리자)
</script>

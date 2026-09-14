<!--
  담당자 홈 — 맡은 회원(`members.managerId`)에게서 **지금 처리할 일**만 모은다.

  운영자 홈(`/admin`)은 「무엇이 얼마나 있나」에 답하고, 여기는 「무엇을 손봐야 하나」에 답한다.
  그래서 표 개수를 세지 않는다 — 담당자에게 표 이름은 일이 아니다. 지금은 대기 중인 신청 하나뿐이고,
  담당자가 처리하는 일(상태·등급)이 기다림을 낳기 시작하면 그때 칸을 더한다.

  빈 판이 정직한 결말이다 — 할 일이 없으면 없다고 말한다(`/admin` 의 `할일` 보기와 같은 태도).
-->
<template>
  <div class="mx-auto flex w-full max-w-(--ui-container) flex-col gap-8 px-5 py-8">
    <viewAlert v-if="!is담당자" />
    <template v-else>
      <header class="flex flex-col gap-1">
        <h1 class="text-2xl font-semibold">
          할 일
        </h1>
        <p class="text-sm text-muted">
          맡은 회원 {{ 담당회원s.length }}명에게서 들어온, 답을 기다리는 것들입니다.
        </p>
      </header>

      <section class="flex flex-col gap-3">
        <div class="flex items-center">
          <h2 class="text-base font-semibold">
            승인 기다리는 신청
            <span class="ml-1 text-dimmed">{{ 대기신청s.length }}</span>
          </h2>
          <div class="grow" />
          <mButton
            to="/admin/own-enrolls"
            역할="인라인"
            size="xs"
            trailing-icon="i-lucide-chevron-right"
          >
            담당신청
          </mButton>
        </div>

        <ul
          v-if="대기신청s.length"
          class="flex flex-col divide-y divide-default rounded-lg border border-default"
        >
          <li
            v-for="신청 in 대기신청s"
            :key="신청.stateId"
            class="flex items-center gap-3 px-4 py-3 text-sm"
          >
            <span class="font-medium">{{ 신청.신청자이름 || '?' }}</span>
            <span class="line-clamp-1 text-muted">{{ 신청.신청받기?.label ?? '신청' }}</span>
            <div class="grow" />
            <span class="shrink-0 text-xs text-dimmed">{{ 신청.신청일.format('M.D') }}</span>
          </li>
        </ul>
        <p
          v-else
          class="rounded-lg border border-dashed border-default px-4 py-8 text-center text-sm text-muted"
        >
          기다리는 신청이 없습니다.
        </p>
      </section>

      <section class="flex items-center rounded-lg border border-default px-4 py-3">
        <span class="text-sm">맡은 회원</span>
        <span class="ml-2 text-sm text-dimmed">{{ 담당회원s.length }}명</span>
        <div class="grow" />
        <mButton
          to="/admin/own-members"
          역할="인라인"
          size="xs"
          trailing-icon="i-lucide-chevron-right"
        >
          담당회원
        </mButton>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, toValue } from 'vue'
import { storeToRefs } from 'pinia'
import { do첫조회 } from '~/composables/do첫조회'
import { useMyAuthStore } from '~/stores/useMyAuthStore'
import { model신청s, model회원s, do신청세트읽기 } from '~models/test2'

const { is담당자, 회원Id } = storeToRefs(useMyAuthStore())

/** 「내 담당」 판정은 담당 화면 둘(`own-members`·`own-enrolls`)과 같다 — `담당자id === 내 회원Id`. */
const 담당회원s = computed(() =>
  toValue(model회원s.getInstance().list).filter(회원 => !!회원Id.value && 회원.담당자id === 회원Id.value)
)

/** 오래 기다린 것부터 — 먼저 들어온 신청이 먼저 답을 받는다. */
const 대기신청s = computed(() =>
  toValue(model신청s.getInstance().list)
    .filter(신청 => 신청.상태 === 'PENDING' && !!회원Id.value && 신청.회원?.담당자id === 회원Id.value)
    .sort((a, b) => a.신청일.valueOf() - b.신청일.valueOf())
)

await do첫조회('own', () => do신청세트읽기(), is담당자)
</script>

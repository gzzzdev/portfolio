<!--
  요약 — **원점 두 안**(2026-09-15, 판 `/decisions/dashboard` 에서 옮김). 「A 오늘」·「B 받은편지함」을 둘 다 두고
  머리의 토글로 고른다(`?안=B` 로 바로 연다).

  같은 날 아침엔 반대로 갔었다 — 섹션형(표 전부를 「누가 만드나」 묶음마다 섹션으로, 판 `sandbox/dashboard2`)이
  이기고 원점이 반려됐다. 그걸 되돌렸다. **등록부의 모든 표를 펴는 건 재고 조사고, 그 물음을 가진 사람은
  개발자다** — 운영자 첫 화면에서는 곁다리 한 줄(「나머지 표」)로 줄이고, 표 하나하나는 `/admin/tables` 가 진다.

  ## 관리자가 들어와서 묻는 것 — 차례대로

  1. **손볼 것이 있나.** 모델이 `i필터옵션.대기` 로 선언한 칸. 판정은 모델이 하고 여기선 세기만 한다.
     못 센 표도 여기다: 장애는 재고가 아니라 할 일이다.
  2. **무엇이 들어왔나.** 유입 표(`i누가 = '유입'`) 중 **행을 읽는 표**의 최근 7일 · 선은 14일.
     `state.createdAt` 으로 센다 — 날이 없는 행은 안 센다.
  3. **회원은 어떤 사람들인가.** 분해는 회원 하나에게만. 축은 `model회원s.필터조건ss` 그대로이되
     「구분」(필터 기본값)과 「가입일」(2 가 맡는다)은 뺀다.
  4. 나머지 재고는 한 줄 — 유입 밖 묶음마다 표 수 · 행 합.

  ## 두 안

  - **A 「오늘」** — 1→4 를 위에서 아래로. 한 번 훑고 나가는 화면.
  - **B 「받은편지함」** — 손볼 것이 본문, 숫자는 곁 열. **손볼 것이 전부 0 이면 들어온 표의 최근 행이 본문을 받는다.**

  ## 못 센 표는 0 이 아니다

  **`count = null` 은 「못 셈」이다.** 뷰가 등록부에 `left join` 하므로 DB 에 없는 표는 `null` 로 온다
  (`_CUSTOM/sql/tables.sql` 5절). 색은 이 신호(warning)에만 쓴다. 행을 못 읽은 표의 흐름·대기도 `0` 이 아니라 「못 셈」이다.
-->
<template>
  <div class="mx-auto flex w-full max-w-(--ui-container) flex-col gap-6 px-4 py-6">
    <div class="flex flex-row flex-wrap items-center gap-3">
      <div class="min-w-0">
        <h1 class="text-lg font-semibold text-highlighted">
          요약
        </h1>
        <p class="text-xs text-dimmed">
          {{ 오늘글 }}
        </p>
      </div>
      <div class="grow" />
      <div class="-mr-2 shrink-0">
        <Input선택기
          v-model="안"
          :items="안s"
          type="radio"
          is폭자동
          :search="false"
        />
      </div>
    </div>

    <!-- 개수 판을 통째로 못 읽었을 때 — 뷰가 아직 안 서 있으면(`tables.sql` 5절 미실행) 여기가 그걸 말한다 -->
    <div
      v-if="개수판오류"
      class="text-sm text-warning"
    >
      개수 판(<code>table-counts</code>)을 못 읽었다 — {{ 개수판오류 }}
    </div>

    <!-- ══ A 「오늘」 ═══════════════════════════════════════════════════════ -->
    <div
      v-if="안 === 'A'"
      class="flex flex-col gap-8"
    >
      <!-- 1. 손볼 것 — 줄 전체가 손잡이. 숫자가 오른쪽 끝 한 열에 서야 훑어진다 -->
      <section class="flex flex-col gap-2">
        <div class="flex items-baseline gap-2">
          <h2 class="text-sm font-semibold text-highlighted">
            손볼 것
          </h2>
          <span class="text-xs tabular-nums text-dimmed">{{ 손볼것합글 }}</span>
        </div>
        <div class="flex flex-col divide-y divide-default overflow-hidden rounded-lg ring-1 ring-default">
          <component
            :is="할.경로 ? NuxtLink : 'div'"
            v-for="할 in 손볼것s"
            :key="할.key"
            v-bind="할.경로 ? { to: 할.경로 } : {}"
            class="flex flex-row items-baseline gap-3 px-4 py-3"
            :class="할.경로 ? 'transition-colors hover:bg-elevated' : undefined"
          >
            <span
              class="text-sm"
              :class="할.수량 ? 'text-highlighted' : 'text-muted'"
            >{{ 할.표 }}</span>
            <span class="text-sm text-muted">{{ 할.라벨 }}</span>
            <span class="grow" />
            <span
              class="text-lg tabular-nums"
              :class="수량색(할)"
            >{{ 수량글(할) }}</span>
            <span class="w-4 text-xs text-dimmed">{{ 할.수량 == null ? '' : 할.단위 }}</span>
          </component>
          <div
            v-if="!손볼것s.length"
            class="px-4 py-3 text-sm text-dimmed"
          >
            아직 어느 표도 「대기」 칸을 선언하지 않았다(<code>i필터옵션.대기</code>).
          </div>
          <div
            v-if="못센s.length"
            class="flex flex-row flex-wrap items-baseline gap-x-3 gap-y-1 px-4 py-3"
          >
            <span class="text-sm text-warning">못 센 표 {{ 못센s.length }}</span>
            <span class="text-xs text-muted">개수를 못 받았다 — 0 이 아니다 ·</span>
            <span class="font-mono text-xs text-dimmed">{{ 못센s.map(칸 => 칸.key).join(' · ') }}</span>
          </div>
        </div>
      </section>

      <!-- 2. 들어온 것 — 큰 숫자 + 14일 선. 선은 모양만 말한다, 축·눈금 없음 -->
      <section
        v-if="흐름s.length"
        class="flex flex-col gap-2"
      >
        <div class="flex items-baseline gap-2">
          <h2 class="text-sm font-semibold text-highlighted">
            들어온 것
          </h2>
          <span class="text-xs text-dimmed">최근 7일 · 선은 14일</span>
        </div>
        <div class="grid grid-cols-2 gap-3 lg:grid-cols-[repeat(auto-fit,minmax(10rem,1fr))]">
          <component
            :is="흐.경로 ? NuxtLink : 'div'"
            v-for="흐 in 흐름s"
            :key="흐.key"
            v-bind="흐.경로 ? { to: 흐.경로 } : {}"
            class="flex min-w-0 flex-col gap-2 rounded-lg px-4 py-3 ring-1 ring-default"
            :class="흐.경로 ? 'transition-colors hover:bg-elevated' : undefined"
          >
            <span class="truncate text-xs text-muted">{{ 흐.이름 }}</span>
            <span class="flex items-baseline gap-1.5">
              <span
                class="text-2xl tabular-nums"
                :class="흐.일별 ? 'text-highlighted' : 흐.is읽는중 ? 'text-dimmed' : 'text-warning'"
              >{{ 흐.일별 ? `+${흐.이번}` : 흐.is읽는중 ? '…' : '못 셈' }}</span>
              <span
                v-if="흐.일별"
                class="text-xs tabular-nums text-dimmed"
              >전 7일 {{ 흐.지난 }}</span>
            </span>
            <svg
              viewBox="0 0 100 24"
              preserveAspectRatio="none"
              class="h-6 w-full text-muted"
              aria-hidden="true"
            >
              <line
                x1="50"
                x2="50"
                y1="0"
                y2="24"
                class="stroke-default"
                stroke-width="1"
                vector-effect="non-scaling-stroke"
              />
              <polyline
                v-if="흐.일별"
                :points="선(흐.일별)"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linejoin="round"
                vector-effect="non-scaling-stroke"
              />
            </svg>
            <span class="text-xs tabular-nums text-dimmed">누적 {{ 흐.누적 ?? '?' }}{{ 흐.누적 == null ? '' : 흐.단위 }}</span>
          </component>
        </div>
      </section>

      <!-- 3. 회원 구성 — 축마다 막대 목록. 넓으면 옆으로, 좁으면 한 열 -->
      <section
        v-if="회원"
        class="flex flex-col gap-2"
      >
        <div class="flex items-baseline gap-2">
          <h2 class="text-sm font-semibold text-highlighted">
            회원 {{ 회원.총계 ?? '?' }}명
          </h2>
          <span
            v-if="회원.축s.length"
            class="text-xs text-dimmed"
          >막대는 {{ 회원.총계 }}명 대비 · 역할은 겹친다</span>
        </div>
        <div
          v-if="회원.축s.length"
          class="grid grid-cols-1 gap-x-8 gap-y-5 rounded-lg px-4 py-4 ring-1 ring-default sm:grid-cols-2 lg:grid-cols-4"
        >
          <L막대목록
            v-for="한축 in 회원.축s"
            :key="한축.key"
            :축="한축"
            :총계="회원.총계 ?? 0"
          />
        </div>
        <div
          v-else
          class="rounded-lg px-4 py-3 text-xs ring-1 ring-default"
          :class="회원.행상태 === 'fail' ? 'text-warning' : 'text-dimmed'"
        >
          {{ 회원.행상태 === 'fail' ? '회원 행을 못 읽었다 — 분해를 못 낸다' : 회원.행상태 == null ? '회원 행 읽는 중…' : '나눌 축이 없다' }}
        </div>
      </section>

      <!-- 4. 재고 — 곁다리 한 줄 -->
      <NuxtLink
        v-if="재고s.length"
        to="/admin/tables"
        class="flex flex-row flex-wrap items-baseline gap-x-4 gap-y-1 border-t border-default pt-3 text-xs text-dimmed hover:text-muted"
      >
        <span>나머지 표</span>
        <span
          v-for="묶 in 재고s"
          :key="묶.이름"
        >{{ 묶.이름 }} <span class="tabular-nums text-muted">{{ 묶.표 }}</span>표 · <span class="tabular-nums text-muted">{{ 묶.행 }}</span>행<span
          v-if="묶.못셈수"
          class="text-warning"
        > +?</span></span>
      </NuxtLink>
    </div>

    <!-- ══ B 「받은편지함」 ══════════════════════════════════════════════════ -->
    <div
      v-else
      class="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]"
    >
      <!-- 본문 — 손볼 것 묶음마다 앞 몇 줄을 미리 편다. 묶음 머리가 곧 그 목록으로 가는 손잡이 -->
      <div class="flex min-w-0 flex-col gap-5">
        <section
          v-for="할 in 본문손볼것s"
          :key="할.key"
          class="flex flex-col"
        >
          <component
            :is="할.경로 ? NuxtLink : 'div'"
            v-bind="할.경로 ? { to: 할.경로 } : {}"
            class="flex flex-row items-baseline gap-2 rounded-md px-2 py-1.5"
            :class="할.경로 ? 'transition-colors hover:bg-elevated' : undefined"
          >
            <span class="text-sm font-semibold text-highlighted">{{ 할.표 }} — {{ 할.라벨 }}</span>
            <span
              class="text-sm tabular-nums"
              :class="할.수량 == null ? 수량색(할) : 'text-muted'"
            >{{ 수량글(할) }}</span>
            <span class="grow" />
            <span
              v-if="할.경로"
              class="text-xs text-dimmed"
            >전부 보기</span>
          </component>
          <div
            v-if="할.미리보기.length"
            class="mt-1 flex flex-col divide-y divide-default overflow-hidden rounded-lg ring-1 ring-default"
          >
            <L미리보기줄
              v-for="미리 in 할.미리보기"
              :key="미리.key"
              :줄="미리"
              :경로="할.경로"
            />
          </div>
        </section>

        <!-- 손볼 것이 비면 들어온 것이 본문을 받는다 -->
        <template v-if="is손볼것없음">
          <p class="px-2 text-sm text-dimmed">
            손볼 것이 없다 — 대신 최근에 들어온 것.
          </p>
          <section
            v-for="흐 in 흐름s.filter(x => x.최근s.length)"
            :key="흐.key"
            class="flex flex-col"
          >
            <component
              :is="흐.경로 ? NuxtLink : 'div'"
              v-bind="흐.경로 ? { to: 흐.경로 } : {}"
              class="flex flex-row items-baseline gap-2 rounded-md px-2 py-1.5"
              :class="흐.경로 ? 'transition-colors hover:bg-elevated' : undefined"
            >
              <span class="text-sm font-semibold text-highlighted">{{ 흐.이름 }}</span>
              <span class="text-sm tabular-nums text-muted">{{ 흐.누적 ?? '?' }}</span>
              <span class="grow" />
              <span
                v-if="흐.경로"
                class="text-xs text-dimmed"
              >전부 보기</span>
            </component>
            <div class="mt-1 flex flex-col divide-y divide-default overflow-hidden rounded-lg ring-1 ring-default">
              <L미리보기줄
                v-for="미리 in 흐.최근s"
                :key="미리.key"
                :줄="미리"
                :경로="흐.경로"
              />
            </div>
          </section>
        </template>

        <div
          v-if="못센s.length"
          class="flex flex-row flex-wrap items-baseline gap-x-3 gap-y-1 rounded-lg px-4 py-3 ring-1 ring-warning/40"
        >
          <span class="text-sm text-warning">못 센 표 {{ 못센s.length }}</span>
          <span class="text-xs text-muted">개수를 못 받았다 — 0 이 아니다 ·</span>
          <span class="font-mono text-xs text-dimmed">{{ 못센s.map(칸 => 칸.key).join(' · ') }}</span>
        </div>
      </div>

      <!-- 곁 열 — 숫자만. 들어온 것은 한 줄씩, 회원 구성은 같은 막대 목록 -->
      <aside class="flex flex-col gap-5 lg:border-l lg:border-default lg:pl-6">
        <div
          v-if="흐름s.length"
          class="flex flex-col"
        >
          <div class="mb-1 text-xs text-dimmed">
            최근 7일
          </div>
          <component
            :is="흐.경로 ? NuxtLink : 'div'"
            v-for="흐 in 흐름s"
            :key="흐.key"
            v-bind="흐.경로 ? { to: 흐.경로 } : {}"
            class="-mx-2 flex flex-row items-baseline gap-2 rounded-md px-2 py-1"
            :class="흐.경로 ? 'transition-colors hover:bg-elevated' : undefined"
          >
            <span class="truncate text-sm text-muted">{{ 흐.이름 }}</span>
            <span class="grow" />
            <span
              class="text-sm tabular-nums"
              :class="흐.일별 ? 'text-highlighted' : 흐.is읽는중 ? 'text-dimmed' : 'text-warning'"
            >{{ 흐.일별 ? `+${흐.이번}` : 흐.is읽는중 ? '…' : '못 셈' }}</span>
            <span class="w-10 text-right text-xs tabular-nums text-dimmed">{{ 증감(흐) }}</span>
          </component>
        </div>

        <div
          v-if="회원"
          class="flex flex-col gap-4 border-t border-default pt-4"
        >
          <div class="flex items-baseline gap-2">
            <span class="text-sm font-semibold text-highlighted">회원 {{ 회원.총계 ?? '?' }}명</span>
          </div>
          <L막대목록
            v-for="한축 in 회원.축s"
            :key="한축.key"
            :축="한축"
            :총계="회원.총계 ?? 0"
          />
        </div>

        <NuxtLink
          v-if="재고s.length"
          to="/admin/tables"
          class="border-t border-default pt-3 text-xs text-dimmed hover:text-muted"
        >
          나머지 표 {{ 재고s.reduce((a, 묶) => a + 묶.표, 0) }}개 — 표 목록에서
        </NuxtLink>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, defineComponent, h, ref, resolveComponent, toValue, watch, type PropType } from 'vue'

import { useMyAuthStore } from '~/stores/useMyAuthStore'
import { mDayjs } from '~utils'
import type { i필터라디오그룹 } from '~utils/models'
import { i누가options, model표개수s, model테이블s, type i누가 } from '~models/(system)'
import {
  model게시판s,
  model등급s,
  model등급심사s,
  model디자인틀s,
  model메뉴s,
  model신청받기s,
  model사용자s,
  model설문s,
  model수업s,
  model신청s,
  model역할s,
  model투표s,
  model퀴즈s,
  model행사s,
  model회원s,
  model회원게시글s,
  model회원댓글s
} from '~models/test2'

const NuxtLink = resolveComponent('NuxtLink')

type i안 = 'A' | 'B'
const 안s: { label: string, value: i안 }[] = [
  { label: 'A 오늘', value: 'A' },
  { label: 'B 받은편지함', value: 'B' }
]
const 안 = ref<i안>(useRoute().query.안 === 'B' ? 'B' : 'A')

const 오늘글 = mDayjs().format('YYYY년 M월 D일')

/**
 * 행까지 읽는 표. repo 여럿을 한 배열에 담으면 타입이 유니온이 되어 `필터조건ss.flatMap`
 * 같은 호출이 막힌다 — 공통분모로 한 번 좁혀서 든다.
 */
type i행 = { rowKey?: string, label?: string, sub?: string, state?: { createdAt?: string | Date } }
type i표 = {
  list: unknown
  tableName: string
  reads: () => Promise<boolean>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  필터조건ss: i필터라디오그룹<any>[]
}

/**
 * **행까지 읽는 표.** 칸(개수)은 개수 판이 낳고, 이 목록은 **대기 · 7일 흐름 · 회원 분해**에 쓸 행을 받는다.
 * 대기를 선언한 표(신청 · 등급심사 · 게시판)와 유입 표가 여기 없으면 그 칸이 안 선다. 늘리면 왕복이 하나 는다.
 */
const 행읽는XXs: i표[] = [
  model게시판s, model등급s, model등급심사s, model디자인틀s, model메뉴s,
  model신청받기s, model사용자s, model설문s, model수업s, model신청s,
  model역할s, model투표s, model퀴즈s, model행사s, model회원s,
  model회원게시글s, model회원댓글s
].map(x => x.getInstance() as unknown as i표)
const 행읽는by이름 = new Map(행읽는XXs.map(XX => [XX.tableName, XX]))

const { is관리자 } = storeToRefs(useMyAuthStore())

/** 개수 판(`"table-counts"` 뷰) — 등록부의 모든 열 + `count`. 인스턴스는 `누가of`(시드 조회) 때문에 든다. */
const 개수s = model표개수s.getInstance()
const 등록부 = model테이블s.getInstance()
const 메뉴s = model메뉴s.getInstance()

// ── 읽기 ──────────────────────────────────────────────────────────────────

const 개수판오류 = ref('')

const do개수읽기 = async () => {
  if (!toValue(is관리자)) return false
  개수판오류.value = ''
  try {
    await 개수s.reads()
    return true
  } catch (error) {
    개수판오류.value = (error as Error)?.message ?? String(error)
    return false
  }
}

/** 표마다 행 읽기 성패. 없으면 읽는 중 — `gradings` 처럼 444 로 던지는 표는 `fail` 로 선다 */
const 행상태 = ref<Record<string, 'ok' | 'fail'>>({})

/**
 * 행은 **진입 후에** 받는다 — 무겁고(실측 병렬 1.5초·25KB 남짓), 표마다 따로 성패를 적는다.
 * 메뉴는 여기 없다 — 전역 미들웨어가 `reads네비()` 로 이미 SSR 에서 받아 payload 로 넘긴다.
 */
watch(
  is관리자,
  (v) => {
    if (!v) return
    void do개수읽기()
    for (const XX of 행읽는XXs) {
      XX.reads()
        .then(() => { 행상태.value = { ...행상태.value, [XX.tableName]: 'ok' } })
        .catch(() => { 행상태.value = { ...행상태.value, [XX.tableName]: 'fail' } })
    }
  },
  { immediate: true }
)

/**
 * **개수는 SSR 로 받는다.** 값을 실어 나르는 건 `BaseModels2.bindPayload` 고,
 * `useAsyncData` 는 SSR 이 기다리게 만드는 일 하나만 한다(반환값을 안 쓴다).
 */
await useAsyncData('dashboard:개수', do개수읽기)

const is개수읽음 = computed(() => toValue(개수s.is읽기완료))

const 행sOf = (XX: i표) => (toValue(XX.list) ?? []) as i행[]

const 날of = (행: i행) => {
  const v = 행.state?.createdAt
  const d = v ? mDayjs(v) : null
  return d?.isValid() ? d : null
}

/** 오늘 0시 기준 며칠 전인가 — 7일 흐름과 「언제」가 같은 자를 쓴다 */
const 며칠전 = (d: ReturnType<typeof mDayjs>) => mDayjs().startOf('day').diff(d.startOf('day'), 'day')

const 언제of = (행: i행) => {
  const d = 날of(행)
  if (!d) return ''
  const n = 며칠전(d)
  return n <= 0 ? '오늘' : n < 30 ? `${n}일 전` : d.format('M/D')
}

type i미리보기 = { key: string, 이름: string, 내용: string, 언제: string }

/** 날 있는 행은 최근 것부터 — 날 없는 표(설정류)는 들어온 차례 그대로 */
const 최근of = (행s: i행[], n: number): i미리보기[] => {
  const 날있음 = 행s.some(행 => 날of(행))
  return [...행s]
    .sort((a, b) => 날있음 ? (날of(b)?.valueOf() ?? 0) - (날of(a)?.valueOf() ?? 0) : 0)
    .slice(0, n)
    .map((행, i) => ({ key: 행.rowKey ?? String(i), 이름: 행.label || '(이름 없음)', 내용: 행.sub ?? '', 언제: 언제of(행) }))
}

// ── 칸 ────────────────────────────────────────────────────────────────────

/**
 * 칸 하나 = 개수 판의 행 하나. **개수는 뷰가 정본이다** — 행 길이를 먼저 쓰면 읽기가 실패한 표가
 * `0` 으로 서는데, 그게 정확히 고치려던 거짓말이다.
 */
const 칸s = computed(() => toValue(개수s.list)
  .filter(표 => 등록부.누가of(표.테이블명) !== '시험')
  .map((표) => {
    const key = 표.테이블명
    const 메뉴 = 메뉴s.getBy테이블명(key)
    return {
      key,
      이름: 메뉴?.label ?? key,
      경로: 메뉴?.경로 ?? null,
      누가: (등록부.누가of(key) ?? '미분류') as i누가 | '미분류',
      총계: 표.개수,
      단위: 표.세는단위
    }
  }))
const 칸by이름 = computed(() => new Map(칸s.value.map(칸 => [칸.key, 칸])))

/** 개수를 못 받은 표. **`0` 인 표와 절대 같은 목록에 두지 않는다.** */
const 못센s = computed(() => is개수읽음.value ? 칸s.value.filter(칸 => 칸.총계 == null) : [])

// ── 1. 손볼 것 ────────────────────────────────────────────────────────────

/**
 * 모델이 `대기` 로 선언한 칸 전부 — 판정은 모델이 한다. 0 인 칸도 세운다 —
 * 「기다리는 게 없음」도 한눈에의 일부다. 행을 못 읽었으면 `수량 = null`(못 셈).
 */
const 손볼것s = computed(() => 행읽는XXs.flatMap((XX) => {
  const 옵션s = XX.필터조건ss.flatMap(그룹 => 그룹.options.filter(옵션 => 옵션.대기 === true))
  if (!옵션s.length) return []
  const 칸 = 칸by이름.value.get(XX.tableName)
  const 상태 = 행상태.value[XX.tableName]
  const 행s = 행sOf(XX)
  return 옵션s.map((옵션) => {
    const 걸린 = 상태 === 'ok'
      ? 행s.filter((행, i) => {
          try {
            return 옵션.match(행, i)
          } catch {
            return false
          }
        })
      : []
    return {
      key: `${XX.tableName}-${옵션.value}`,
      표: 칸?.이름 ?? XX.tableName,
      라벨: 옵션.label,
      경로: 칸?.경로 ?? null,
      단위: 칸?.단위 ?? '',
      is읽는중: 상태 == null,
      수량: 상태 === 'ok' ? 걸린.length : null,
      미리보기: 최근of(걸린, 3)
    }
  })
}))
type i손볼것 = (typeof 손볼것s.value)[number]

const 손볼것합글 = computed(() => {
  const 셈 = 손볼것s.value.filter(할 => 할.수량 != null)
  const 합 = 셈.reduce((a, 할) => a + (할.수량 ?? 0), 0)
  return 셈.length < 손볼것s.value.length ? `${합}+?` : String(합)
})

const 수량글 = (할: i손볼것) => 할.수량 != null ? String(할.수량) : 할.is읽는중 ? '…' : '못 셈'
const 수량색 = (할: i손볼것) => 할.수량 == null ? (할.is읽는중 ? 'text-dimmed' : 'text-warning') : 할.수량 ? 'text-highlighted' : 'text-dimmed'

/** B 본문 — 걸린 게 있거나 못 센 칸만. 0 인 칸은 본문을 차지할 이유가 없다 */
const 본문손볼것s = computed(() => 손볼것s.value.filter(할 => 할.수량 !== 0))

/** 전부 읽었고 전부 0 — 이때만 들어온 것이 본문을 받는다 */
const is손볼것없음 = computed(() => 손볼것s.value.every(할 => 할.수량 === 0))

// ── 2. 들어온 것 ──────────────────────────────────────────────────────────

/**
 * 유입 표 중 행을 읽는 표. `일별` 은 14칸(앞 7 = 지난 주, 뒤 7 = 이번 주, 끝 칸 = 오늘) —
 * 행을 아직/못 읽었으면 `null`. 누적은 개수 판이 정본이다.
 */
const 흐름s = computed(() => 칸s.value
  .filter(칸 => 칸.누가 === '유입' && 행읽는by이름.has(칸.key))
  .sort((a, b) => (b.총계 ?? -1) - (a.총계 ?? -1))
  .map((칸) => {
    const 상태 = 행상태.value[칸.key]
    const 행s = 행sOf(행읽는by이름.get(칸.key)!)
    let 일별: number[] | null = null
    if (상태 === 'ok') {
      일별 = Array.from({ length: 14 }, () => 0)
      for (const 행 of 행s) {
        const d = 날of(행)
        if (!d) continue
        const n = 며칠전(d)
        if (n >= 0 && n < 14) 일별[13 - n]! += 1
      }
    }
    const 합 = (xs: number[]) => xs.reduce((a, n) => a + n, 0)
    return {
      key: 칸.key,
      이름: 칸.이름,
      경로: 칸.경로,
      단위: 칸.단위,
      누적: 칸.총계,
      is읽는중: 상태 == null,
      일별,
      지난: 일별 ? 합(일별.slice(0, 7)) : 0,
      이번: 일별 ? 합(일별.slice(7)) : 0,
      최근s: 상태 === 'ok' ? 최근of(행s, 3) : []
    }
  }))
type i흐름 = (typeof 흐름s.value)[number]

const 증감 = (흐: i흐름) => {
  if (!흐.일별) return ''
  const d = 흐.이번 - 흐.지난
  return d === 0 ? '±0' : d > 0 ? `↑${d}` : `↓${-d}`
}

/** 14 점을 0..100 × 0..24 에 편다. 위아래 2 씩 비워 선이 잘리지 않게. */
const 선 = (일별: number[]) => {
  const 최대 = Math.max(1, ...일별)
  return 일별
    .map((n, i) => `${(i / (일별.length - 1)) * 100},${22 - (n / 최대) * 20}`)
    .join(' ')
}

// ── 3. 회원 구성 ──────────────────────────────────────────────────────────

type i줄 = { 라벨: string, 수량: number, is그밖: boolean }
type i축 = { key: string, 제목: string, 줄s: i줄[] }

/** 「구분」은 필터 기본값(회원/비회원 가르기), 「가입일」은 들어온 것이 맡는다 */
const 회원축제외 = new Set(['구분', '가입일'])

/**
 * 모델 축 그대로 센다. 0 칸은 뺀다. 어느 칸에도 안 걸린 행은 「그 밖」으로 끝에 —
 * **빼기로 안 만든다**: 다대다 축(역할)은 합이 총계를 넘는다.
 */
function 축들of(XX: i표): i축[] {
  const 행s = 행sOf(XX)
  if (!행s.length) return []
  return XX.필터조건ss.filter(그룹 => !회원축제외.has(그룹.title ?? '')).map((그룹) => {
    const 옵션s = 그룹.options.filter(옵션 => 옵션.label !== '전체')
    const 걸림 = (옵션: (typeof 옵션s)[number], 행: i행, i: number) => {
      try {
        return 옵션.match(행, i)
      } catch {
        return false
      }
    }
    const 줄s: i줄[] = 옵션s
      .map(옵션 => ({ 라벨: 옵션.label, 수량: 행s.filter((행, i) => 걸림(옵션, 행, i)).length, is그밖: false }))
      .filter(줄 => 줄.수량 > 0)
    const 그밖 = 행s.filter((행, i) => !옵션s.some(옵션 => 걸림(옵션, 행, i))).length
    if (그밖) 줄s.push({ 라벨: '그 밖', 수량: 그밖, is그밖: true })
    return { key: 그룹.key, 제목: 그룹.title ?? '', 줄s }
  }).filter(축 => 축.줄s.some(줄 => !줄.is그밖))
}

const 회원 = computed(() => {
  const XX = 행읽는by이름.get('members')
  const 칸 = 칸by이름.value.get('members')
  if (!XX || !칸) return null
  const 상태 = 행상태.value.members ?? null
  return {
    총계: 칸.총계,
    행상태: 상태,
    축s: 상태 === 'ok' ? 축들of(XX) : []
  }
})

// ── 4. 재고 ───────────────────────────────────────────────────────────────

/** 유입 밖 묶음마다 표 수 · 행 합. 순서는 `i누가options`, 끝에 미분류 */
const 재고s = computed(() => [
  ...i누가options.filter(x => x.is요약 && x.value !== '유입').map(x => x.value as string),
  '미분류'
].flatMap((누가) => {
  const 담긴 = 칸s.value.filter(칸 => 칸.누가 === 누가)
  if (!담긴.length) return []
  return [{
    이름: 누가,
    표: 담긴.length,
    행: 담긴.reduce((a, 칸) => a + (칸.총계 ?? 0), 0),
    못셈수: 담긴.filter(칸 => 칸.총계 == null).length
  }]
}))

// ── 조각 ──────────────────────────────────────────────────────────────────
// 이름 앞 `L` — 템플릿 파서가 태그 이름을 ASCII 글자로만 시작하게 받는다(`<막대목록>` 은 글자로 새어 나온다).

/**
 * 축 하나 = 라벨 · 막대 · 숫자 세 열. 막대 길이는 **총계 대비**다 — 축 안 최댓값 대비로 두면
 * 「입문자 7/8」과 「남자 5/8」이 둘 다 꽉 차서 크기가 거짓말을 한다. 「그 밖」은 끝에 흐리게.
 */
const L막대목록 = defineComponent({
  props: {
    축: { type: Object as PropType<i축>, required: true },
    총계: { type: Number, required: true }
  },
  setup(props) {
    const 줄 = (x: i줄) =>
      h('div', { class: 'grid grid-cols-[3.5rem_minmax(0,1fr)_1.5rem] items-center gap-2', title: `${x.라벨} ${x.수량}` }, [
        h('span', { class: ['truncate text-xs', x.is그밖 ? 'text-dimmed' : 'text-muted'] }, x.라벨),
        h('span', { class: 'h-1.5 overflow-hidden rounded-full bg-elevated' }, [
          h('span', {
            class: ['block h-full rounded-full', x.is그밖 ? 'bg-inverted/20' : 'bg-inverted/60'],
            style: { width: `${Math.min(100, (x.수량 / Math.max(1, props.총계)) * 100)}%` }
          })
        ]),
        h('span', { class: ['text-right text-xs tabular-nums', x.is그밖 ? 'text-dimmed' : 'text-highlighted'] }, String(x.수량))
      ])

    return () => h('div', { class: 'flex flex-col gap-1.5' }, [
      h('div', { class: 'text-xs text-dimmed' }, props.축.제목),
      ...props.축.줄s.map(줄)
    ])
  }
})

/** 받은편지함 한 줄 — 이름 · 내용 · 언제. 줄 전체가 그 목록으로 가는 손잡이 */
const L미리보기줄 = defineComponent({
  props: {
    줄: { type: Object as PropType<i미리보기>, required: true },
    경로: { type: String as PropType<string | null>, default: null }
  },
  setup(props) {
    return () => {
      const 안쪽 = () => [
        h('span', { class: 'shrink-0 text-sm text-default' }, props.줄.이름),
        h('span', { class: 'min-w-0 truncate text-sm text-muted' }, props.줄.내용),
        h('span', { class: 'grow' }),
        h('span', { class: 'shrink-0 text-xs tabular-nums text-dimmed' }, props.줄.언제)
      ]
      const 틀 = 'flex flex-row items-baseline gap-3 px-4 py-2.5'
      return props.경로
        ? h(NuxtLink, { to: props.경로, class: `${틀} transition-colors hover:bg-elevated` }, { default: 안쪽 })
        : h('div', { class: 틀 }, 안쪽())
    }
  }
})
</script>

<!--
  대시보드 ② 섹션형 — 공식 사이트 첫 화면의 **섹션 문법**으로 요약을 다시 깐 판(2026-09-14).
  짝은 `dashboard`(① 원점 — 회원 한 표로 좁힌 두 안).

  ## 왜 ① 에서 넘어왔나

  ① 은 「운영자가 아침에 묻는 것」으로 좁혀 회원 하나만 폈다. 반려 사유가 이 판의 전제다 —
  **대시보드는 큰 틀에서 여러 개를 보는 화면이다.** 표를 버리지 않는다. 34 개를 다 세우되,
  한 화면에 늘어놓는 대신 **묶음마다 섹션 하나**로 나눠 스크롤로 훑는다.

  ## 빌려 온 것 — `mjt-official` · `mdtps-official` 의 `pages/index.vue`

  그 두 첫 화면은 `lHeroNotices` · `lHeroNews` · `lQuickMenuL` 로 짜여 있다. 부품은 base2 에서
  지워졌고(250c23b) **문법만** 가져온다.

  - **섹션 머리** — 작은 eyebrow + 큰 제목 + 구분선(`l/hero/SectionHead`).
  - **카테고리 탭** — 활성에 `#`. 공지의 분류 자리에 묶음 안의 **표**가 선다. 탭 줄 자체가
    「이 묶음에 무엇이 얼마나」의 한 줄 요약이라, 안 고른 표도 숫자는 보인다.
  - **실선 격자** — 카드 상자 대신 위아래 가는 선(`notice-grid`). 칸이 많아도 무겁지 않다.
  - **크게 하나 + 곁 목록** — 소식의 featured/side. 고른 표의 숫자·분해가 크게, 곁에는 그 표의 최근 행.
  - **퀵메뉴** — 왼쪽 섹션 목록, 활성은 흔적(막대)이 길어진다. 아이콘이 아니라 줄 전체가 손잡이다.

  **안 빌린 것** — `text-primary` eyebrow · 브랜드 색 패널 · 등장 애니메이션. 관리 화면은 회색조고
  색은 신호(못 셈)에만 남긴다. 랜딩은 한 번 보는 화면이라 움직임이 값을 하지만 요약은 매일 연다.

  ## 데이터

  전부 실데이터다 — `/admin` 와 같은 사슬(개수 판 `"table-counts"` + 행 읽는 표). 랜딩은 행이 비면
  견본으로 채우지만(`rows.length ? rows : indexPage.notices`) **요약 화면에선 그러지 않는다** —
  비었으면 빈 것이, 못 읽었으면 못 읽은 것이 선다.
  행은 관리자에게만 제대로 온다(비로그인엔 회원이 `id·name·thumbnail` 으로 투영돼 분해가 틀린다).
-->
<template>
  <div class="mx-auto w-full max-w-(--ui-container) px-4 py-6 lg:grid lg:grid-cols-[7rem_minmax(0,1fr)] lg:gap-8">
    <!-- ── 퀵메뉴 — 넓을 때만. 활성은 막대가 길어진다(`QuickMenu_l` 의 흔적) ── -->
    <nav
      class="hidden lg:block"
      aria-label="요약 섹션 이동"
    >
      <div class="sticky top-24 flex flex-col gap-4 py-2">
        <button
          v-for="항 in 섹션s"
          :key="항.id"
          type="button"
          class="group flex items-center gap-2.5 text-left"
          :aria-current="항.id === 활성 ? 'location' : undefined"
          @click="이동(항.id)"
        >
          <span
            class="shrink-0 rounded-sm transition-[width,height,background-color] duration-200"
            :class="항.id === 활성 ? 'h-[3px] w-6 bg-inverted' : 'h-[2px] w-2 bg-inverted/25 group-hover:w-4'"
            aria-hidden="true"
          />
          <span
            class="text-xs tracking-[0.15em] transition-colors"
            :class="항.id === 활성 ? 'font-semibold text-highlighted' : 'text-muted group-hover:text-default'"
          >{{ 항.label }}</span>
        </button>
      </div>
    </nav>

    <div class="min-w-0">
      <div class="flex flex-row flex-wrap items-baseline gap-x-3 gap-y-1 pb-2">
        <span class="text-sm font-semibold text-highlighted">대시보드 ② 섹션형</span>
        <span class="text-xs text-dimmed">
          실데이터 ·
          <NuxtLink
            to="/decisions/dashboard"
            class="text-muted underline underline-offset-2 hover:text-default"
          >① 원점</NuxtLink>
          ·
          <NuxtLink
            to="/admin"
            class="text-muted underline underline-offset-2 hover:text-default"
          >지금 판</NuxtLink>
        </span>
      </div>

      <!-- ══ 한눈에 ═══════════════════════════════════════════════════════ -->
      <section
        id="dash-overview"
        class="scroll-mt-20 py-8"
      >
        <div class="min-w-0">
          <p class="text-xs uppercase tracking-wider text-dimmed">
            Overview
          </p>
          <h2 class="mt-1 text-2xl tracking-tight text-highlighted sm:text-3xl">
            한눈에
          </h2>
        </div>
        <USeparator class="my-4" />

        <div
          v-if="개수판오류"
          class="mb-4 text-sm text-warning"
        >
          개수 판(<code>table-counts</code>)을 못 읽었다 — {{ 개수판오류 }}
        </div>

        <!-- 묶음 셋이 한 줄. 누르면 그 섹션으로 내려간다 -->
        <!-- 칸 수는 묶음 수를 따른다 — 미분류가 생기면 넷째 칸이 혼자 다음 줄로 떨어지지 않게 -->
        <div
          class="grid grid-cols-1 border-t border-default sm:grid-cols-2"
          :class="묶음s.length >= 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'"
        >
          <button
            v-for="묶음 in 묶음s"
            :key="묶음.누가"
            type="button"
            class="group flex flex-col border-b border-default py-4 pr-6 text-left"
            @click="이동(`dash-${묶음.누가}`)"
          >
            <span class="text-xs text-dimmed">{{ 묶음.설명 }}</span>
            <span class="mt-1 flex items-baseline gap-2">
              <span class="text-base text-highlighted group-hover:underline group-hover:underline-offset-4">{{ 묶음.label }}</span>
              <span class="text-xs text-dimmed">표 {{ 묶음.칸s.length }}</span>
            </span>
            <span class="mt-3 text-3xl tabular-nums tracking-tight text-highlighted">
              {{ is개수읽음 ? 묶음.합 : '…' }}<span
                v-if="묶음.못셈수"
                class="ml-1 text-sm text-warning"
              >+?</span>
            </span>
            <span class="mt-3 line-clamp-2 text-xs text-muted">
              {{ 묶음.칸s.slice(0, 4).map(칸 => `${칸.이름} ${칸.총계 ?? '?'}`).join(' · ') }}
            </span>
          </button>
        </div>

        <div
          v-if="못센s.length"
          class="mt-4 flex flex-row flex-wrap items-baseline gap-x-3 gap-y-1 text-xs"
        >
          <span class="text-warning">못 센 표 {{ 못센s.length }}</span>
          <span class="text-dimmed">개수를 못 받았다 — 0 이 아니다 ·</span>
          <span class="font-mono text-dimmed">{{ 못센s.map(칸 => 칸.key).join(' · ') }}</span>
        </div>
      </section>

      <!-- ══ 할 일 — 공지 격자 결: 제목 · 설명 두 줄 · 바닥에 숫자 ════════════════ -->
      <section
        id="dash-waiting"
        class="scroll-mt-20 border-t border-default py-8"
      >
        <div class="min-w-0">
          <p class="text-xs uppercase tracking-wider text-dimmed">
            Waiting
          </p>
          <h2 class="mt-1 text-2xl tracking-tight text-highlighted sm:text-3xl">
            할 일
          </h2>
        </div>
        <USeparator class="my-4" />

        <div
          v-if="!대기칸s.length"
          class="text-sm text-dimmed"
        >
          아직 어느 표도 「대기」 칸을 선언하지 않았다(`i필터옵션.대기`).
        </div>
        <div
          v-else
          class="grid grid-cols-1 border-t border-default sm:grid-cols-2 lg:grid-cols-3"
        >
          <component
            :is="칸.경로 ? NuxtLink : 'div'"
            v-for="칸 in 대기칸s"
            :key="칸.key"
            v-bind="칸.경로 ? { to: 칸.경로 } : {}"
            class="group flex min-h-0 flex-col border-b border-default py-4 pr-6"
          >
            <h3
              class="line-clamp-2 text-base leading-snug"
              :class="칸.수량 ? 'text-highlighted group-hover:underline group-hover:underline-offset-4' : 'text-muted'"
            >
              {{ 칸.표 }} — {{ 칸.라벨 }}
            </h3>
            <p class="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-muted">
              {{ 칸.설명 }}
            </p>
            <span
              class="mt-4 block text-xs tabular-nums"
              :class="칸.수량 == null ? 'text-warning' : 칸.수량 ? 'text-default' : 'text-dimmed'"
            >
              {{ 칸.수량 == null ? (칸.is읽는중 ? '…' : '못 셈 — 행을 못 읽었다') : `${칸.수량}${칸.단위}` }}
            </span>
          </component>
        </div>
      </section>

      <!-- ══ 묶음 섹션 — 탭(표) · 크게 하나 · 곁에 최근 행 ════════════════════ -->
      <section
        v-for="묶음 in 묶음s"
        :id="`dash-${묶음.누가}`"
        :key="묶음.누가"
        class="scroll-mt-20 border-t border-default py-8"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="min-w-0">
            <p class="text-xs uppercase tracking-wider text-dimmed">
              {{ 묶음.eyebrow }}
            </p>
            <h2 class="mt-1 text-2xl tracking-tight text-highlighted sm:text-3xl">
              {{ 묶음.label }}
            </h2>
          </div>
          <span class="shrink-0 self-end text-xs text-dimmed">{{ 묶음.설명 }}</span>
        </div>
        <USeparator class="my-4" />

        <!-- 탭 = 묶음 안의 표. 안 고른 표도 숫자는 보인다 -->
        <nav
          class="mb-6 flex flex-wrap gap-x-4 gap-y-2"
          role="tablist"
          :aria-label="`${묶음.label} 표`"
        >
          <button
            v-for="칸 in 묶음.칸s"
            :key="칸.key"
            type="button"
            role="tab"
            :aria-selected="고른칸(묶음).key === 칸.key"
            class="text-left text-sm transition-colors sm:text-base"
            :class="고른칸(묶음).key === 칸.key ? 'text-highlighted' : 'text-muted hover:text-default'"
            @click="고름[묶음.누가] = 칸.key"
          >
            <span
              v-if="고른칸(묶음).key === 칸.key"
              class="text-dimmed"
            >#</span>
            {{ 칸.이름 }}
            <span
              class="text-xs tabular-nums"
              :class="칸.총계 == null && is개수읽음 ? 'text-warning' : 'text-dimmed'"
            >{{ 개수글(칸) }}</span>
          </button>
        </nav>

        <div class="grid min-w-0 items-start gap-5 md:grid-cols-[minmax(0,1.12fr)_minmax(0,1fr)] md:gap-6">
          <!-- 크게 하나 -->
          <component
            :is="고른칸(묶음).경로 ? NuxtLink : 'div'"
            v-bind="고른칸(묶음).경로 ? { to: 고른칸(묶음).경로 } : {}"
            class="group flex min-w-0 flex-col rounded-xl bg-default p-5 ring-1 ring-default"
            :class="고른칸(묶음).경로 ? 'transition-shadow hover:shadow-md' : undefined"
          >
            <span class="font-mono text-xs text-dimmed">{{ 고른칸(묶음).key }}</span>
            <span class="mt-1 flex items-baseline gap-2">
              <span class="text-lg text-highlighted">{{ 고른칸(묶음).이름 }}</span>
              <span
                v-if="!고른칸(묶음).경로"
                class="text-xs text-dimmed"
              >화면 없음</span>
            </span>
            <span class="mt-3 text-4xl tabular-nums tracking-tight text-highlighted">
              <template v-if="고른칸(묶음).총계 != null">
                {{ 고른칸(묶음).총계 }}<span class="ml-1 text-base text-dimmed">{{ 고른칸(묶음).단위 }}</span>
              </template>
              <span
                v-else
                :class="is개수읽음 ? 'text-2xl text-warning' : 'text-dimmed'"
              >{{ is개수읽음 ? '못 셈' : '…' }}</span>
            </span>

            <div
              v-if="고른칸(묶음).축s.length"
              class="mt-5 grid grid-cols-1 gap-x-6 gap-y-4 border-t border-default pt-4 sm:grid-cols-2"
            >
              <div
                v-for="축 in 고른칸(묶음).축s"
                :key="축.key"
                class="flex flex-col gap-1"
              >
                <div class="text-xs text-dimmed">
                  {{ 축.제목 }}
                </div>
                <!-- 막대는 표 총계 대비 — 겹치는 축(역할)도 막대마다 참이다 -->
                <div
                  v-for="줄 in 축.줄s"
                  :key="줄.라벨"
                  class="grid grid-cols-[3.5rem_minmax(0,1fr)_1.5rem] items-center gap-2"
                  :title="`${줄.라벨} ${줄.수량}`"
                >
                  <span
                    class="truncate text-xs"
                    :class="줄.is그밖 ? 'text-dimmed' : 'text-muted'"
                  >{{ 줄.라벨 }}</span>
                  <span class="h-1.5 overflow-hidden rounded-full bg-elevated">
                    <span
                      class="block h-full rounded-full"
                      :class="줄.is그밖 ? 'bg-inverted/20' : 'bg-inverted/60'"
                      :style="{ width: `${Math.min(100, (줄.수량 / Math.max(1, 고른칸(묶음).총계 ?? 1)) * 100)}%` }"
                    />
                  </span>
                  <span
                    class="text-right text-xs tabular-nums"
                    :class="줄.is그밖 ? 'text-dimmed' : 'text-highlighted'"
                  >{{ 줄.수량 }}</span>
                </div>
              </div>
            </div>
            <div
              v-else
              class="mt-5 border-t border-default pt-4 text-xs"
              :class="고른칸(묶음).행상태 === 'fail' ? 'text-warning' : 'text-dimmed'"
            >
              {{ 분해없음글(고른칸(묶음)) }}
            </div>
          </component>

          <!-- 곁 — 그 표의 최근 행. 소식 곁 목록 결: 실선으로만 나눈다 -->
          <div class="flex min-w-0 flex-col border-t border-default md:border-t-0">
            <div class="pt-3 text-xs text-dimmed md:pt-0">
              최근
            </div>
            <component
              :is="고른칸(묶음).경로 ? NuxtLink : 'div'"
              v-for="행 in 고른칸(묶음).최근s"
              :key="행.key"
              v-bind="고른칸(묶음).경로 ? { to: 고른칸(묶음).경로 } : {}"
              class="group flex min-w-0 flex-row items-baseline gap-3 border-b border-default py-3 last:border-b-0"
            >
              <span class="min-w-0 flex-1">
                <span class="line-clamp-1 text-sm text-highlighted group-hover:underline group-hover:underline-offset-4">{{ 행.label || '(이름 없음)' }}</span>
                <span
                  v-if="행.sub"
                  class="mt-0.5 line-clamp-1 text-xs text-muted"
                >{{ 행.sub }}</span>
              </span>
              <span class="shrink-0 text-xs tabular-nums text-dimmed">{{ 행.날 }}</span>
            </component>
            <div
              v-if="!고른칸(묶음).최근s.length"
              class="py-3 text-xs text-dimmed"
            >
              {{ 고른칸(묶음).행상태 === 'ok' ? '행이 없다' : 분해없음글(고른칸(묶음)) }}
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, resolveComponent, toValue } from 'vue'

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

definePageMeta({
  제목: '대시보드 ② 섹션형',
  설명: '공식 사이트 첫 화면의 섹션 문법(섹션 머리 · 탭 · 실선 격자 · 크게 하나+곁 목록 · 퀵메뉴)으로 표 전부를 묶음별 섹션에 깐 판. 실데이터.',
  상태: '실사용',
  쓰는곳: '/admin (2026-09-15 옮김) · 짝은 ① 원점'
})

const NuxtLink = resolveComponent('NuxtLink')

/** repo 여럿을 한 배열에 담으려고 공통분모로 좁힌다(`/admin` 의 `i표` 와 같은 이유). */
type i행 = { rowKey?: string, label?: string, sub?: string, state?: { createdAt?: string | Date } }
type i표 = {
  list: unknown
  tableName: string
  reads: () => Promise<boolean>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  필터조건ss: i필터라디오그룹<any>[]
}

/**
 * 행까지 읽는 표 — `/admin` 의 `행읽는XXs` 에 **글 · 댓글**을 더했다. 유입 섹션의 곁 목록
 * (최근 행)이 자라는 표에서 제일 할 말이 많아서다. 여기 없는 표는 숫자만 선다.
 */
const 행읽는XXs: i표[] = [
  model게시판s, model등급s, model등급심사s, model디자인틀s, model메뉴s,
  model신청받기s, model사용자s, model설문s, model수업s, model신청s,
  model역할s, model투표s, model퀴즈s, model행사s, model회원s,
  model회원게시글s, model회원댓글s
].map(x => x.getInstance() as unknown as i표)
const 행읽는by이름 = new Map(행읽는XXs.map(XX => [XX.tableName, XX]))

const 개수s = model표개수s.getInstance()
const 등록부 = model테이블s.getInstance()
const 메뉴s = model메뉴s.getInstance()

// ── 읽기 ──────────────────────────────────────────────────────────────────

const is개수읽음 = ref(false)
const 개수판오류 = ref('')
/** 표마다 행 읽기 성패. 없으면 읽는 중 — `gradings` 처럼 444 로 던지는 표는 `fail` 로 선다 */
const 행상태 = ref<Record<string, 'ok' | 'fail'>>({})

onMounted(() => {
  개수s.reads()
    .catch((error: unknown) => { 개수판오류.value = (error as Error)?.message ?? String(error) })
    .finally(() => { is개수읽음.value = true })
  for (const XX of 행읽는XXs) {
    XX.reads()
      .then(() => { 행상태.value = { ...행상태.value, [XX.tableName]: 'ok' } })
      .catch(() => { 행상태.value = { ...행상태.value, [XX.tableName]: 'fail' } })
  }
})

const 행sOf = (XX: i표) => (toValue(XX.list) ?? []) as i행[]

const 날of = (행: i행) => {
  const v = 행.state?.createdAt
  const d = v ? mDayjs(v) : null
  return d?.isValid() ? d : null
}

// ── 칸 ────────────────────────────────────────────────────────────────────

type i줄 = { 라벨: string, 수량: number, is그밖: boolean }
type i축 = { key: string, 제목: string, 줄s: i줄[] }

/** 모델 축 그대로 센다. 0 칸은 빼고, 어느 칸에도 안 걸린 행은 「그 밖」으로 끝에 — 빼기로 안 만든다(겹치는 축) */
function 축들of(XX: i표): i축[] {
  const 행s = 행sOf(XX)
  if (!행s.length) return []
  return XX.필터조건ss.map((그룹) => {
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

/** 최근 행 다섯. 날짜 없는 표(설정류)는 들어온 차례 그대로 */
function 최근of(XX: i표) {
  const 행s = 행sOf(XX)
  const 날있음 = 행s.some(행 => 날of(행))
  return [...행s]
    .sort((a, b) => 날있음 ? (날of(b)?.valueOf() ?? 0) - (날of(a)?.valueOf() ?? 0) : 0)
    .slice(0, 5)
    .map((행, i) => ({ key: 행.rowKey ?? String(i), label: 행.label ?? '', sub: 행.sub ?? '', 날: 날of(행)?.format('M/D') ?? '' }))
}

const 칸s = computed(() => toValue(개수s.list)
  .filter(표 => 등록부.누가of(표.테이블명) !== '시험')
  .map((표) => {
    const key = 표.테이블명
    const 메뉴 = 메뉴s.getBy테이블명(key)
    const XX = 행읽는by이름.get(key)
    return {
      key,
      이름: 메뉴?.label ?? key,
      경로: 메뉴?.경로 ?? null,
      누가: (등록부.누가of(key) ?? '미분류') as i누가 | '미분류',
      총계: 표.개수,
      단위: 표.세는단위,
      /** `none` = 행을 안 읽는 표, 없으면 읽는 중 */
      행상태: XX ? (행상태.value[key] ?? null) : 'none' as const,
      축s: XX ? 축들of(XX) : [],
      최근s: XX ? 최근of(XX) : []
    }
  }))
type i칸 = (typeof 칸s.value)[number]

const 못센s = computed(() => is개수읽음.value ? 칸s.value.filter(칸 => 칸.총계 == null) : [])

const 개수글 = (칸: i칸) => 칸.총계 != null ? String(칸.총계) : is개수읽음.value ? '?' : '…'

const 분해없음글 = (칸: i칸) =>
  칸.행상태 === 'none'
    ? '숫자만 — 이 표는 행을 안 읽는다'
    : 칸.행상태 === 'fail'
      ? '행을 못 읽었다 — 분해를 못 낸다'
      : 칸.행상태 == null
        ? '행 읽는 중…'
        : '나눌 축이 없다'

// ── 묶음 ──────────────────────────────────────────────────────────────────

const eyebrow: Record<string, string> = { 유입: 'Inflow', 운영: 'Operation', 설정: 'Settings', 미분류: 'Unsorted' }

const 묶음s = computed(() => [
  ...i누가options.filter(x => x.is요약).map(x => ({ 누가: x.value as string, label: x.label as string, 설명: x.설명 as string })),
  { 누가: '미분류', label: '미분류', 설명: '등록부엔 있는데 시드가 아직 안 정했다' }
].flatMap((정의) => {
  const 담긴 = 칸s.value
    .filter(칸 => 칸.누가 === 정의.누가)
    /** 큰 것부터 — 탭 첫 자리가 기본 선택이라 제일 큰 표가 먼저 펴진다. 못 센 표는 끝 */
    .sort((a, b) => (b.총계 ?? -1) - (a.총계 ?? -1))
  if (!담긴.length) return []
  return [{
    ...정의,
    eyebrow: eyebrow[정의.누가] ?? 정의.누가,
    칸s: 담긴,
    합: 담긴.reduce((a, 칸) => a + (칸.총계 ?? 0), 0),
    못셈수: 담긴.filter(칸 => 칸.총계 == null).length
  }]
}))
type i묶음 = (typeof 묶음s.value)[number]

/**
 * 섹션마다 고른 표. 안 골랐으면 **펼 게 있는 표** 중 제일 큰 것 — 화면이 있고 행을 읽는 표.
 * 그냥 제일 큰 표로 두면 운영은 `resources`, 설정은 `tables`(둘 다 행을 안 읽음)가 펴져서
 * 큰 카드도 곁 목록도 빈 채로 섹션을 연다(2026-09-14 실측). 탭 순서는 여전히 크기다.
 */
const 고름 = ref<Record<string, string>>({})
const 고른칸 = (묶음: i묶음) =>
  묶음.칸s.find(칸 => 칸.key === 고름.value[묶음.누가])
  ?? 묶음.칸s.find(칸 => 칸.경로 && 칸.행상태 !== 'none')
  ?? 묶음.칸s[0]!

// ── 할 일 ─────────────────────────────────────────────────────────────────

/** 모델이 `대기` 로 선언한 칸 전부. 0 인 칸도 세운다 — 「기다리는 게 없음」도 한눈에의 일부다 */
const 대기칸s = computed(() => 행읽는XXs.flatMap((XX) => {
  const 옵션s = XX.필터조건ss.flatMap(그룹 => 그룹.options.filter(옵션 => 옵션.대기 === true))
  if (!옵션s.length) return []
  const 칸 = 칸s.value.find(x => x.key === XX.tableName)
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
      설명: 상태 !== 'ok'
        ? ''
        : 걸린.length
          ? 걸린.slice(0, 3).map(행 => 행.label).filter(Boolean).join(' · ')
          : '걸린 행이 없다'
    }
  })
}))

// ── 퀵메뉴 · 스크롤 ───────────────────────────────────────────────────────

const 섹션s = computed(() => [
  { id: 'dash-overview', label: '한눈에' },
  { id: 'dash-waiting', label: '할 일' },
  ...묶음s.value.map(묶음 => ({ id: `dash-${묶음.누가}`, label: 묶음.label }))
])

const 활성 = ref('dash-overview')

const 이동 = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

/**
 * 스크롤 스파이 — 화면 35% 선을 지난 마지막 섹션. 레이아웃이 창 대신 안쪽 상자를 굴릴 수 있어서
 * `capture` 로 문서 전체의 스크롤을 받는다(랜딩은 `layout:mainScrollEl` 을 주입받아 같은 걸 했다).
 */
let raf = 0
const 훑기 = () => {
  cancelAnimationFrame(raf)
  raf = requestAnimationFrame(() => {
    const 선 = window.innerHeight * 0.35
    let 지금 = 섹션s.value[0]!.id
    for (const 항 of 섹션s.value) {
      const el = document.getElementById(항.id)
      if (el && el.getBoundingClientRect().top <= 선) 지금 = 항.id
    }
    활성.value = 지금
  })
}
onMounted(() => {
  document.addEventListener('scroll', 훑기, { passive: true, capture: true })
  window.addEventListener('resize', 훑기, { passive: true })
  훑기()
})
onBeforeUnmount(() => {
  document.removeEventListener('scroll', 훑기, { capture: true })
  window.removeEventListener('resize', 훑기)
  cancelAnimationFrame(raf)
})
</script>

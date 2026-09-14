<!--
  방문자가 보는 신청받기 목록의 **그리는 쪽**. 무엇으로 거를지·정렬할지는 여기가 아니라
  모델(`model신청받기s`)이 들고, 지금 무엇이 걸렸는지는 주소가 든다 — `official/enrolls/index.vue` 참고.

  ## 한 건을 무엇으로 세우나 (2026-09-05)

  판 넷을 나란히 깔고 골랐다(`/decisions/enrolls/list` · 기록은 `/decisions` 의 `신청-목록`).

  - **행이 기본, 카드는 뷰 전환**(`?view=card`). 사진이 붙는 신청받기가 소수라 카드 위 132px가
    대개 회색 네모였다. 행으로 세우면 열두 건이 한 화면에 들고, 제일 급한 값(마감)이
    눈이 처음 닿는 왼쪽 열에 온다. 격자는 틀려서가 아니라 **기본이 아니어서** 졌다 —
    처음 보는 사람과 사진 있는 행사에서는 카드가 이기므로 버리지 않고 남겼다.
  - **「내 신청」은 갈래**다. 새 축이 아니라 모델이 이미 든 `내신청필터그룹` 을 레일 칩에서
    갈래로 세운 것이라, 주소(`?f_내신청=신청함`)도 도우미 어휘도 그대로다.
    도우미가 그 축을 걸면 이 화면이 그 갈래로 열린다.
  - **없앤 것 셋** — 머리말의 눈금 넷 · 급한 배너 · 좌측 레일. 셋이 나눠 하던 말을
    맨 왼쪽 「마감」 열 하나가 진다. 급한 것이 위에 오는 건 배너가 아니라 **정렬**이라서다.

  ## 카드 바닥은 조건 띠다 (2026-09-14)

  카드형은 강좌 카드의 위계(사진 → 큰 제목 → 흐린 설명)라, 사진이 없는 대부분의 건에서
  신청 화면이 궁금한 「마감 · 자리 · 요금」이 바닥 `xs` 회색에 묻혔다. 그 셋을 **같은 크기의 칸**으로
  세운 띠를 바닥에 깔고, 머리의 마감 배지는 뺐다 — 사진이 파는 힘은 그대로 두고 조건도 안 묻힌다.
  티켓형을 뷰로 따로 세우는 안도 봤는데(`/sandbox/enroll-cards`), 마크업 세 벌이 되어 이 띠만 가져왔다.

  ## 대가 (알고 산 것)

  화면 하나가 마크업 두 벌(행·카드)을 든다. **둘이 같은 값을 안 그리기 시작하면 그때부터
  버그도 두 벌이다** — 카드에만 있는 것(사진)과 행에만 있는 것(정렬 열) 말고는
  같은 `i신청받기카드` 를 본다는 게 그걸 막는 장치고, 새 값을 한쪽에만 붙이지 말 것.

  행 한 줄은 **마크업 한 벌**이다. 좁은 화면에서는 격자 배치(`col-start`)만 바뀌고
  위젯이 갈리지 않는다 — 갈리면 조작법도 갈린다.
-->
<template>
  <div class="space-y-4">
    <header class="flex flex-wrap items-end justify-between gap-x-6 gap-y-1">
      <div class="min-w-0">
        <!-- 히어로가 같은 제목을 이미 말했으면 줄째 뺀다(`useIsHeroTitle`, 공식 레이아웃) -->
        <h1
          v-if="!is히어로제목"
          class="text-2xl font-bold tracking-tight text-highlighted sm:text-3xl"
        >
          {{ 제목 }}
        </h1>
        <p
          v-if="설명"
          class="mt-1.5 text-sm text-muted"
        >
          {{ 설명 }}
        </p>
      </div>
      <!-- 건수는 조건을 걸었을 때만 할 말이 있다. 안 걸었으면 아래 목록이 그대로 그 수다. -->
      <p
        v-if="isReady && 갈래 === '전체' && 카드s.length !== 전체수"
        class="text-sm text-muted tabular-nums"
      >
        전체 {{ 전체수 }}건 중 <span class="font-semibold text-toned">{{ 카드s.length }}</span>건
      </p>
    </header>

    <!-- 갈래 + 뷰. 「내 신청」은 로그인해야 답이 있는 갈래라 비회원에게는 안 그린다. -->
    <div class="flex items-end gap-6 border-b border-default">
      <button
        v-for="탭 in 갈래s"
        :key="탭"
        type="button"
        class="-mb-px flex items-center gap-2 border-b-2 pb-2 text-lg transition-colors"
        :class="갈래 === 탭 ? 'border-inverted font-semibold text-highlighted' : 'border-transparent text-muted hover:text-default'"
        @click="emit('update:갈래', 탭)"
      >
        {{ 탭 }}
        <UBadge
          v-if="탭 === '내 신청' && 할일수 && 갈래 !== 탭"
          size="sm"
          color="warning"
          :label="String(할일수)"
        />
        <span
          v-else-if="탭 === '전체' || 내신청줄s.length"
          class="text-sm tabular-nums"
          :class="갈래 === 탭 ? 'text-toned' : 'text-dimmed'"
        >{{ 탭 === '전체' ? 전체수 : 내신청줄s.length }}</span>
      </button>

      <div class="grow" />

      <div
        v-if="갈래 === '전체'"
        class="mb-2 flex overflow-hidden rounded-md border border-accented"
      >
        <button
          v-for="모드 in 뷰s"
          :key="모드"
          type="button"
          class="flex items-center gap-1.5 px-2.5 py-1 text-sm transition-colors"
          :class="뷰 === 모드 ? 'bg-inverted font-medium text-inverted' : 'text-muted hover:bg-elevated'"
          :aria-label="`${모드}으로 보기`"
          @click="emit('update:뷰', 모드)"
        >
          <UIcon
            :name="뷰아이콘[모드]"
            class="size-4"
          />
          <span class="max-sm:sr-only">{{ 모드 }}</span>
        </button>
      </div>
    </div>

    <!-- 도구. 좌측 레일을 눕힌 자리다 — 축이 늘면 여기서 줄바꿈될 뿐 자리는 안 늘어난다. -->
    <template v-if="갈래 === '전체'">
      <div class="flex flex-wrap items-center gap-2">
        <UInput
          :model-value="search"
          icon="i-ph-magnifying-glass-light"
          class="w-full sm:w-64"
          placeholder="이름·설명으로 검색"
          @update:model-value="(v) => emit('update:search', String(v ?? ''))"
        >
          <template
            v-if="search"
            #trailing
          >
            <mButton
              역할="인라인"
              size="xs"
              icon="i-ph-x-light"
              aria-label="검색어 지우기"
              @click="emit('update:search', '')"
            />
          </template>
        </UInput>
        <div class="grow" />
        <USelect
          :model-value="sortValue"
          :items="sortOptions"
          class="w-40"
          @update:model-value="(v) => emit('update:sortValue', String(v ?? ''))"
        />
      </div>

      <div class="flex flex-wrap items-center gap-x-4 gap-y-2">
        <div
          v-for="group in filterGroups"
          :key="group.key"
          class="flex flex-wrap items-center gap-1"
        >
          <span class="mr-1 text-xs font-medium tracking-wide text-dimmed">{{ group.title }}</span>
          <mButton
            size="xs"
            :역할="selectedFilters[group.key] ? '조용' : undefined"
            label="전체"
            @click="emit('setFilter', group.key, null)"
          />
          <mButton
            v-for="option in group.options"
            :key="`${group.key}-${option.value}`"
            size="xs"
            역할="조용"
            :켜짐="selectedFilters[group.key] === option.value"
            :icon="option.icon"
            :label="option.label"
            @click="emit('setFilter', group.key, selectedFilters[group.key] === option.value ? null : option.value)"
          />
        </div>
        <mButton
          v-if="활성필터수 || search"
          size="xs"
          역할="인라인"
          icon="i-ph-arrow-counter-clockwise-light"
          label="조건 지우기"
          @click="emit('reset')"
        />
      </div>
    </template>

    <!-- ── 아직 안 왔다 ─────────────────────────────────────────────── -->
    <div
      v-if="!isReady"
      class="space-y-2"
    >
      <div
        v-for="n in 6"
        :key="n"
        class="flex items-center gap-4 border-b border-default px-3 py-3"
      >
        <USkeleton class="h-4 w-14 shrink-0" />
        <USkeleton class="h-4 w-2/5" />
        <div class="grow" />
        <USkeleton class="h-4 w-24 shrink-0" />
      </div>
    </div>

    <!-- ── 내 신청 갈래 ─────────────────────────────────────────────── -->
    <template v-else-if="갈래 === '내 신청'">
      <div
        v-if="!내신청줄s.length"
        class="rounded-xl border border-dashed border-default px-6 py-14 text-center"
      >
        <UIcon
          name="i-ph-tray-light"
          class="size-10 text-dimmed"
        />
        <p class="mt-2 text-sm text-muted">
          아직 신청한 것이 없습니다.
        </p>
        <mButton
          class="mt-3"
          size="xs"
          label="열린 신청받기 보기"
          @click="emit('update:갈래', '전체')"
        />
      </div>

      <template v-else>
        <section
          v-for="묶음 in 내신청묶음s"
          :key="묶음.키"
        >
          <div class="flex items-baseline gap-2 px-1">
            <h2 class="text-lg font-semibold text-highlighted">
              {{ 묶음.이름 }}
            </h2>
            <span
              class="text-sm font-semibold tabular-nums"
              :class="묶음.키 === '할일' ? 'text-warning' : 'text-dimmed'"
            >{{ 묶음.줄s.length }}</span>
            <span
              v-if="묶음.덧"
              class="text-sm text-muted"
            >— {{ 묶음.덧 }}</span>
            <div class="grow" />
            <mButton
              v-if="묶음.키 === '지남'"
              size="xs"
              역할="인라인"
              :label="지난펼침 ? '접기' : '펼치기'"
              @click="지난펼침 = !지난펼침"
            />
          </div>

          <div
            v-for="줄 in 묶음.줄s"
            :key="줄.id"
            class="flex cursor-pointer items-center gap-3 border-b border-default px-3 py-3 transition-colors hover:bg-elevated"
            :class="줄.묶음 === '지남' ? 'opacity-70 hover:opacity-100' : ''"
            role="button"
            tabindex="0"
            @click="emit('select', 줄.id)"
            @keydown.enter="emit('select', 줄.id)"
            @keydown.space.prevent="emit('select', 줄.id)"
          >
            <UBadge
              size="sm"
              :color="줄.is급함 ? 'warning' : undefined"
              :label="줄.구분"
            />
            <div class="min-w-0">
              <div class="truncate font-medium text-highlighted">
                {{ 줄.제목 }}
              </div>
              <div class="truncate text-sm text-muted">
                {{ 줄.문구 }}
              </div>
            </div>
            <div class="grow" />
            <span
              v-if="줄.값"
              class="shrink-0 text-sm tabular-nums text-toned"
            >{{ 줄.값 }}</span>
            <mButton
              v-else-if="줄.액션"
              size="xs"
              :역할="줄.is급함 ? '강조' : '조용'"
              :label="줄.액션"
              @click.stop="emit('select', 줄.id)"
            />
          </div>
        </section>
      </template>
    </template>

    <!-- ── 조건에 맞는 게 없다 ──────────────────────────────────────── -->
    <div
      v-else-if="!카드s.length"
      class="rounded-xl border border-dashed border-default px-6 py-14 text-center"
    >
      <UIcon
        name="i-ph-megaphone-light"
        class="size-10 text-dimmed"
      />
      <p class="mt-2 text-sm text-muted">
        {{ 활성필터수 || search ? '조건에 맞는 신청받기가 없습니다.' : '지금 열려 있는 신청받기가 없습니다.' }}
      </p>
      <mButton
        v-if="활성필터수 || search"
        class="mt-3"
        size="xs"
        label="조건 지우기"
        @click="emit('reset')"
      />
    </div>

    <!-- ── 목록형 (기본) ────────────────────────────────────────────── -->
    <div v-else-if="뷰 === '목록형'">
      <div class="grid grid-cols-[5rem_minmax(0,1fr)_4rem_9rem_6rem_6.5rem] gap-4 border-b-2 border-inverted px-3 pb-2 text-xs text-dimmed max-md:hidden">
        <span>마감</span>
        <span>이름</span>
        <span>종류</span>
        <span>자리</span>
        <span>요금</span>
        <span />
      </div>
      <div
        v-for="카드 in 카드s"
        :key="카드.id"
        class="grid cursor-pointer grid-cols-[4.5rem_minmax(0,1fr)] items-center gap-x-3 gap-y-1.5 border-b border-default px-3 py-3 transition-colors hover:bg-elevated md:grid-cols-[5rem_minmax(0,1fr)_4rem_9rem_6rem_6.5rem] md:gap-x-4 md:gap-y-0"
        :class="줄강조(카드)"
        role="button"
        tabindex="0"
        @click="emit('select', 카드.id)"
        @keydown.enter="emit('select', 카드.id)"
        @keydown.space.prevent="emit('select', 카드.id)"
      >
        <span
          class="text-base tabular-nums"
          :class="마감색(카드)"
        >{{ 마감라벨(카드) }}</span>

        <div class="min-w-0">
          <div class="truncate font-medium text-highlighted">
            {{ 카드.제목 }}
          </div>
          <div class="truncate text-xs text-dimmed">
            {{ 카드.설명 || 카드.기간 }}
          </div>
        </div>

        <span class="hidden text-xs text-muted md:block">{{ 카드.종류 }}</span>

        <div class="hidden md:block">
          <div class="text-sm tabular-nums text-toned">
            {{ 카드.신청수 }}
            <span
              v-if="카드.정원"
              class="text-dimmed"
            >/ {{ 카드.정원 }}</span>
            <span
              v-else
              class="text-dimmed"
            >명 · 제한 없음</span>
          </div>
          <UProgress
            v-if="카드.정원"
            :model-value="찬비율(카드)"
            :color="막대색(카드)"
            size="sm"
            class="mt-1"
          />
        </div>

        <span class="hidden text-sm tabular-nums text-toned md:block">{{ 카드.요금 }}</span>

        <!-- 좁은 화면에서는 이 칸이 둘째 줄로 내려간다. 위젯은 그대로고 자리만 바뀐다. -->
        <div class="col-start-2 flex items-center gap-3 md:col-start-6 md:justify-end">
          <span class="text-xs text-dimmed md:hidden">{{ 좁은메타(카드) }}</span>
          <div class="grow md:hidden" />
          <span
            v-if="카드.is내신청"
            class="flex shrink-0 items-center gap-1 text-sm text-muted"
          >
            <UIcon
              name="i-ph-check-light"
              class="size-4"
            />
            신청함
          </span>
          <mButton
            v-else-if="is마감(카드)"
            size="xs"
            역할="조용"
            disabled
            :label="카드.상태.label"
          />
          <mButton
            v-else
            size="xs"
            label="신청"
          />
        </div>
      </div>
    </div>

    <!-- ── 카드형 뷰 ────────────────────────────────────────────────── -->
    <!--
      items-start 를 둔다. 빼서 한 줄 높이를 맞추면 조건 띠는 같은 선에 서지만, 사진 카드 옆 카드들
      속이 사진 높이만큼 텅 빈다 — 빈 상자가 들쭉날쭉한 높이보다 더 깨져 보였다.
    -->
    <div
      v-else
      class="grid items-start gap-4 sm:grid-cols-2 xl:grid-cols-3"
    >
      <article
        v-for="카드 in 카드s"
        :key="카드.id"
        class="group flex cursor-pointer flex-col overflow-hidden rounded-xl border bg-default m-층-카드 transition hover:-translate-y-0.5 hover:[box-shadow:var(--m-depth-2)]"
        :class="카드테두리(카드)"
        role="button"
        tabindex="0"
        @click="emit('select', 카드.id)"
        @keydown.enter="emit('select', 카드.id)"
        @keydown.space.prevent="emit('select', 카드.id)"
      >
        <!-- 사진이 **있는** 카드만 사진칸을 갖는다. 없으면 회색 네모 대신 자리째 없앤다. -->
        <div
          v-if="카드.이미지"
          class="relative aspect-16/10 overflow-hidden border-b border-default bg-elevated"
        >
          <NuxtImg
            :src="카드.이미지"
            :alt="카드.제목"
            class="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
            :class="is마감(카드) ? 'grayscale group-hover:grayscale-0' : ''"
            width="640"
            height="400"
            sizes="sm:100vw md:50vw xl:33vw"
            format="avif,webp"
            loading="lazy"
            quality="80"
          />
        </div>

        <div class="flex grow flex-col gap-2 p-4">
          <div class="flex items-center gap-2">
            <span class="flex min-w-0 items-center gap-1.5 text-xs text-dimmed">
              <UIcon
                :name="카드.아이콘"
                class="size-4 shrink-0"
              />
              <span class="truncate">{{ 카드.종류 }}</span>
            </span>
            <div class="grow" />
            <span
              v-if="카드.is내신청"
              class="flex shrink-0 items-center gap-1 text-xs text-muted"
            >
              <UIcon
                name="i-ph-check-light"
                class="size-3.5"
              />
              신청함
            </span>
          </div>

          <h3 class="line-clamp-2 text-lg leading-snug font-semibold text-highlighted">
            {{ 카드.제목 }}
          </h3>
          <p class="line-clamp-2 text-[13px] leading-relaxed text-dimmed">
            {{ 카드.설명 || 카드.기간 }}
          </p>
        </div>

        <!--
          조건 띠 — 마감 · 자리 · 요금을 같은 크기의 칸으로. 신청 화면이 궁금한 셋이라 바닥 xs 회색에 묻히면 안 된다.
          상태를 말하는 자리도 여기 하나다(머리 배지를 뺐다) — 마감 칸이 목록형 마감 열과 같은 글자·색을 쓴다.
        -->
        <div class="grid grid-cols-3 divide-x divide-default border-t border-dashed border-accented py-3 text-center">
          <div>
            <div class="text-[11px] text-dimmed">
              마감
            </div>
            <div
              class="mt-0.5 tabular-nums"
              :class="마감색(카드)"
            >
              {{ 마감라벨(카드) }}
            </div>
          </div>
          <div>
            <div class="text-[11px] text-dimmed">
              자리
            </div>
            <div
              class="mt-0.5 tabular-nums"
              :class="남은자리(카드) === 0 ? 'text-dimmed' : 'text-toned'"
            >
              {{ 자리짧은말(카드) }}
            </div>
          </div>
          <div>
            <div class="text-[11px] text-dimmed">
              요금
            </div>
            <div class="mt-0.5 tabular-nums text-toned">
              {{ 카드.요금 }}
            </div>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useIsHeroTitle } from '~/composables/useLayoutHero'
import type { i내신청줄, i신청받기뷰, i신청받기카드, i신청받기필터그룹 } from './신청받기목록.types'

const props = withDefaults(defineProps<{
  제목?: string
  설명?: string
  isReady: boolean
  카드s: i신청받기카드[]
  전체수: number
  filterGroups: i신청받기필터그룹[]
  selectedFilters: Record<string, string | null>
  활성필터수: number
  search: string
  sortValue: string
  sortOptions: { label: string, value: string }[]
  /** 목록형 ↔ 카드형. 주소가 든다(`?view=card`) — 안 그러면 도우미가 이 화면을 못 몬다. */
  뷰: i신청받기뷰
  /** 전체 ↔ 내 신청. 모델의 `내신청필터그룹` 을 갈래로 세운 것이라 주소도 그 축 그대로다. */
  갈래: '전체' | '내 신청'
  /** 「내 신청」 갈래를 그릴 수 있나(=로그인). 아니면 갈래 자체를 안 그린다. */
  is로그인?: boolean
  내신청줄s?: i내신청줄[]
}>(), {
  제목: '신청',
  설명: '',
  is로그인: false,
  내신청줄s: () => []
})
const is히어로제목 = useIsHeroTitle(() => props.제목)

const emit = defineEmits<{
  'update:search': [value: string]
  'update:sortValue': [value: string]
  'update:뷰': [value: i신청받기뷰]
  'update:갈래': [value: '전체' | '내 신청']
  'setFilter': [key: string, value: string | null]
  'reset': []
  'select': [id: number]
}>()

const 뷰s: readonly i신청받기뷰[] = ['목록형', '카드형']
const 뷰아이콘: Record<i신청받기뷰, string> = {
  목록형: 'i-ph-list-light',
  카드형: 'i-ph-squares-four-light'
}
const 갈래s = computed(() => (props.is로그인 ? ['전체', '내 신청'] as const : ['전체'] as const))

/** 지난 신청은 접힌 채로 연다 — 이 갈래의 첫 화면은 **할 일**이지 이력이 아니다. */
const 지난펼침 = ref(false)

const 할일수 = computed(() => props.내신청줄s.filter(줄 => 줄.묶음 === '할일').length)

const 내신청묶음s = computed(() => {
  const 뽑기 = (키: i내신청줄['묶음']) => props.내신청줄s.filter(줄 => 줄.묶음 === 키)
  const 지남 = 뽑기('지남')
  return [
    { 키: '할일' as const, 이름: '할 일', 덧: '내가 안 끝낸 것', 줄s: 뽑기('할일') },
    { 키: '기다림' as const, 이름: '기다리는 것', 덧: '', 줄s: 뽑기('기다림') },
    { 키: '지남' as const, 이름: '지난 신청', 덧: '', 줄s: 지난펼침.value ? 지남 : [] }
  ].filter(묶음 => 묶음.줄s.length || (묶음.키 === '지남' && 지남.length))
})

/**
 * 끝난 신청받기. 배지 글자 대신 줄·카드 전체의 무게로 말한다.
 * 색으로 가리지 않는다 — 여유 있는 D-n도 neutral이다. 남은날이 null인 게 곧 닫힘이다.
 */
const is마감 = (카드: i신청받기카드) => 카드.남은날 === null

/** 마감 열에 적히는 말. 열린 신청받기면 남은 날, 닫혔으면 왜 못 하는지. */
const 마감라벨 = (카드: i신청받기카드) =>
  (카드.남은날 === null ? 카드.상태.label : 카드.남은날 <= 0 ? '오늘' : `D-${카드.남은날}`)

const 마감색 = (카드: i신청받기카드) => {
  if (카드.남은날 === null) return 'text-dimmed'
  return 카드.남은날 <= 3 ? 'font-semibold text-warning' : 'text-toned'
}

const 남은자리 = (카드: i신청받기카드) =>
  (카드.정원 > 0 ? Math.max(0, 카드.정원 - 카드.신청수) : null)

const 찬비율 = (카드: i신청받기카드) =>
  (카드.정원 > 0 ? Math.min(100, Math.round((카드.신청수 / 카드.정원) * 100)) : 0)

const 막대색 = (카드: i신청받기카드) => {
  const 비율 = 찬비율(카드)
  if (비율 >= 100) return 'error' as const
  return 비율 >= 80 ? ('warning' as const) : ('primary' as const)
}

const 자리문구 = (카드: i신청받기카드) => {
  const 남은 = 남은자리(카드)
  if (남은 === null) return `${카드.신청수}명 신청 · 제한 없음`
  return 남은 ? `신청 ${카드.신청수} / ${카드.정원} · ${남은}자리` : '정원 마감'
}

/** 카드 조건 띠의 「자리」 칸. 칸이 좁아 남은 수만 적는다 — 없음(null)과 다 참(0)은 다른 말이다. */
const 자리짧은말 = (카드: i신청받기카드) => {
  const 남은 = 남은자리(카드)
  return 남은 === null ? '제한 없음' : 남은 ? `${남은}자리` : '마감'
}

/** 좁은 화면에서 접히는 세 칸(종류·자리·요금)을 한 줄로. 값은 위와 같은 것이다. */
const 좁은메타 = (카드: i신청받기카드) => `${카드.종류} · ${자리문구(카드)} · ${카드.요금}`

/** 줄 왼쪽의 선 하나. 급한 것과 내가 낸 것을 **글자를 읽기 전에** 가른다. */
const 줄강조 = (카드: i신청받기카드) => {
  if (카드.남은날 !== null && 카드.남은날 <= 0) return 'border-l-2 border-l-warning bg-warning/5'
  if (카드.is내신청) return 'border-l-2 border-l-inverted'
  return 'border-l-2 border-l-transparent'
}

const 카드테두리 = (카드: i신청받기카드) => {
  if (카드.남은날 !== null && 카드.남은날 <= 0) return 'border-warning'
  return is마감(카드) ? 'border-default opacity-70 hover:opacity-100' : 'border-default'
}
</script>

<!--
  **신청 목록을 무엇으로 세울까**의 비교판.

  ## 이 판이 답하는 물음

  `/do-enrolls` 는 카드 열두 장을 3열 격자로 깐다. 그런데 **사진이 붙는 신청받기가 소수**라
  카드 위쪽 132px가 대개 회색 네모고, 머리말은 같은 말을 세 번 한다
  (건수 · 눈금 넷 · 급한 배너). 그래서 물음은 하나다 — **한 건을 무엇으로 세울까.**

  ## 판 넷

  1. **행 목록**(고름) — 격자를 버리고 표로 세운다. 마감이 맨 왼쪽 열로 오면
     머리말의 눈금 넷·급한 배너·좌측 레일이 다 필요 없어진다. 급한 것이 위에 오는 건
     배너가 아니라 **정렬**이라서다.
  2. **마감 시계** — 오늘/이번 주/이번 달/상시로 묶는다. 급함이 배지 글자가 아니라 형태다.
     대신 정렬 축을 마감 하나로 고정해야 한다 — 「인기순」을 고르는 순간 묶음이 깨진다.
  3. **내 것 먼저** — 안 끝낸 일(미제출 응답 · 미납부)을 맨 위로. 다시 오는 사람이 여기 오는
     이유가 그거라서다. 대신 처음 온 사람에게는 위 절반이 빈다.
  4. **카드 정돈** — 격자를 살리고 채널만 줄인다. 이 안은 **1의 카드형 뷰로 흡수됐다**
     (버튼을 누르면 1 + 카드형으로 간다).

  ## 고른 값 (2026-09-05)

  **행이 기본, 카드는 뷰 전환**(`?view=card`). 격자는 틀려서가 아니라 **기본이 아니어서** 졌다 —
  다시 오는 사람이 열두 건을 훑을 땐 행이, 처음 보는 사람과 사진 있는 행사엔 카드가 이긴다.
  **「내 신청」은 갈래**로 올린다. 새 축이 아니라 모델이 이미 든 `내신청필터그룹` 을
  레일 칩에서 갈래로 세우는 것이라, 주소(`?f_내신청=…`)도 도우미 어휘도 그대로다.

  둘 다 **주소가 든다.** 뷰를 로컬 취향값으로 두면 도우미가 「카드로 보여줘」를 못 몬다
  (`l/AI_CopilotV2.vue` — 도우미의 채널은 페이지 라우터다).

  **옮겼다** — 2026-09-05, `view/신청받기목록.vue` · `(member)/do-enrolls/index.vue`. 이 판은 그 결정의 기록이다.

  ## 판 읽는 법

  - 네 안이 **같은 표본 일곱 건**을 본다(`./_표본.ts`). 검색·종류·정렬은 안을 바꿔도 안 풀린다 —
    조건이 판마다 다르면 무엇 때문에 달라 보이는지 못 가른다.
  - 표본은 손으로 박은 값이고 모델을 안 읽는다. **이유는 `_표본.ts` 머리말에 있다.**
  - 색을 쓰는 자리는 화면당 하나(오늘 마감)로 뒀다. 테마 손잡이를 끝에서 끝까지 돌려
    이 판이 혼자 안 움직이는 데가 없는지 같이 볼 것.
-->
<template>
  <div class="mx-auto w-full max-w-(--ui-container) px-4 py-8">
    <header class="mb-5">
      <h1 class="text-2xl font-semibold text-highlighted">
        신청 목록을 무엇으로 세울까
      </h1>
      <p class="mt-1 text-sm text-muted">
        같은 표본 일곱 건을 네 안에 물려 본다 ·
        고른 값은 <span class="text-highlighted">행이 기본, 카드는 뷰 전환</span>
      </p>
    </header>

    <!-- 판 고르기. 4번은 1번의 카드형 뷰라 따로 서지 않고 그리로 보낸다. -->
    <div class="mb-4 flex flex-wrap items-center gap-2">
      <mButton
        v-for="안 in 안s"
        :key="안.키"
        size="sm"
        역할="조용"
        :켜짐="안키 === 안.키 && !(안.키 === 'A' && 뷰 === '카드형')"
        :label="안.이름"
        @click="do안고르기(안.키)"
      />
      <mButton
        size="sm"
        역할="조용"
        :켜짐="안키 === 'A' && 뷰 === '카드형'"
        label="D · 카드 정돈"
        @click="do카드안()"
      />
      <div class="grow" />
      <span class="text-xs text-dimmed">
        조건(검색·종류·정렬)은 판을 바꿔도 안 풀린다
      </span>
    </div>

    <div class="mb-5 rounded-lg border border-default bg-muted px-4 py-3 text-sm leading-relaxed">
      <p>
        <span class="text-dimmed">왜 ·</span> {{ 판.왜 }}
      </p>
      <p class="mt-1">
        <span class="text-dimmed">대가 ·</span> {{ 판.대가 }}
      </p>
    </div>

    <!-- ══ 판 ══════════════════════════════════════════════════════════ -->
    <div class="rounded-xl border border-default bg-default p-4 m-층-카드 sm:p-6">
      <div class="flex items-baseline gap-3">
        <span class="text-xl font-semibold text-highlighted">
          신청
        </span>
        <span class="text-sm text-muted tabular-nums">
          열려 있는 신청받기 {{ 표본신청받기s.length }}
        </span>
        <div class="grow" />
        <UBadge
          v-if="판.고름"
          size="sm"
          label="고른 안"
        />
      </div>

      <!-- 갈래 + 뷰 전환. 안 A 에만 붙는다 — 나머지는 이 어휘를 안 갖는 안이다. -->
      <div
        v-if="안키 === 'A'"
        class="mt-3 flex items-end gap-6 border-b border-default"
      >
        <button
          v-for="탭 in 갈래s"
          :key="탭"
          type="button"
          class="-mb-px flex items-center gap-2 border-b-2 pb-2 text-lg transition-colors"
          :class="갈래 === 탭 ? 'border-inverted font-semibold text-highlighted' : 'border-transparent text-muted hover:text-default'"
          @click="갈래 = 탭"
        >
          {{ 탭 }}
          <UBadge
            v-if="탭 === '내 신청' && 할일s.length && 갈래 !== 탭"
            size="sm"
            color="warning"
            :label="String(할일s.length)"
          />
          <span
            v-else
            class="text-sm tabular-nums"
            :class="갈래 === 탭 ? 'text-toned' : 'text-dimmed'"
          >{{ 탭 === '전체' ? 표본신청받기s.length : 표본신청s.length }}</span>
        </button>
        <div class="grow" />
        <div class="mb-2 flex overflow-hidden rounded-md border border-accented">
          <button
            v-for="모드 in 뷰s"
            :key="모드"
            type="button"
            class="flex items-center gap-1.5 px-2.5 py-1 text-sm transition-colors"
            :class="뷰 === 모드 ? 'bg-inverted font-medium text-inverted' : 'text-muted hover:bg-elevated'"
            @click="뷰 = 모드"
          >
            <UIcon
              :name="모드 === '목록형' ? 'i-ph-list-light' : 'i-ph-squares-four-light'"
              class="size-4"
            />
            {{ 모드 }}
          </button>
        </div>
      </div>

      <!-- 도구 한 줄. 좌측 레일을 눕힌 자리다. -->
      <div
        v-if="!(안키 === 'A' && 갈래 === '내 신청')"
        class="mt-4 flex flex-wrap items-center gap-2"
      >
        <UInput
          v-model="검색"
          icon="i-ph-magnifying-glass-light"
          class="w-56"
          placeholder="이름·설명으로 검색"
        />
        <div class="flex flex-wrap gap-1">
          <mButton
            v-for="칸 in 종류s"
            :key="칸"
            size="xs"
            역할="조용"
            :켜짐="종류 === 칸"
            :label="칸"
            @click="종류 = 칸"
          />
        </div>
        <div class="grow" />
        <USelect
          v-model="정렬"
          :items="정렬s"
          class="w-40"
        />
      </div>

      <!-- ── 안 A · 목록형 ──────────────────────────────────────────── -->
      <div v-if="안키 === 'A' && 갈래 === '전체' && 뷰 === '목록형'">
        <div class="mt-4 grid grid-cols-[5rem_minmax(0,1fr)_4rem_9rem_6rem_6rem] gap-4 border-b-2 border-inverted px-3 pb-2 text-xs text-dimmed">
          <span>마감</span>
          <span>이름</span>
          <span>종류</span>
          <span>자리</span>
          <span>요금</span>
          <span />
        </div>
        <div
          v-for="신청받기 in 정렬된s"
          :key="신청받기.id"
          class="grid grid-cols-[5rem_minmax(0,1fr)_4rem_9rem_6rem_6rem] items-center gap-4 border-b border-default px-3 py-3"
          :class="줄강조(신청받기)"
        >
          <span
            class="text-base tabular-nums"
            :class="신청받기.남은날 === 0 ? 'font-semibold text-warning' : 'text-toned'"
          >{{ 마감라벨(신청받기.남은날) }}</span>
          <div class="min-w-0">
            <div class="truncate font-medium text-highlighted">
              {{ 신청받기.제목 }}
            </div>
            <div class="truncate text-xs text-dimmed">
              {{ 신청받기.설명 }}
            </div>
          </div>
          <span class="text-xs text-muted">
            {{ 신청받기.종류 }}
          </span>
          <div>
            <div class="text-sm tabular-nums text-toned">
              {{ 신청받기.신청수 }}
              <span
                v-if="신청받기.정원"
                class="text-dimmed"
              >/ {{ 신청받기.정원 }}</span>
              <span
                v-else
                class="text-dimmed"
              >명 · 제한 없음</span>
            </div>
            <UProgress
              v-if="신청받기.정원"
              :model-value="찬비율(신청받기)"
              :color="막대색(신청받기)"
              size="sm"
              class="mt-1"
            />
          </div>
          <span class="text-sm tabular-nums text-toned">
            {{ 요금라벨(신청받기.요금) }}
          </span>
          <div class="flex justify-end">
            <span
              v-if="is내신청(신청받기.id)"
              class="flex items-center gap-1 text-sm text-muted"
            >
              <UIcon
                name="i-ph-check-light"
                class="size-4"
              />
              신청함
            </span>
            <mButton
              v-else-if="남은자리(신청받기) === 0"
              size="xs"
              역할="조용"
              disabled
              label="정원 마감"
            />
            <mButton
              v-else
              size="xs"
              label="신청"
            />
          </div>
        </div>
      </div>

      <!-- ── 안 A · 카드형 (= 흡수된 안 D) ──────────────────────────── -->
      <div
        v-else-if="안키 === 'A' && 갈래 === '전체' && 뷰 === '카드형'"
        class="mt-4 grid items-start gap-4 sm:grid-cols-2 xl:grid-cols-3"
      >
        <article
          v-for="신청받기 in 정렬된s"
          :key="신청받기.id"
          class="flex flex-col overflow-hidden rounded-xl border bg-default m-층-카드"
          :class="신청받기.남은날 === 0 ? 'border-warning' : 'border-default'"
        >
          <!-- 사진이 **있는** 카드만 사진칸을 갖는다. 없으면 자리째 없앤다. -->
          <div
            v-if="신청받기.is사진"
            class="flex h-32 items-center justify-center border-b border-default bg-elevated"
          >
            <UIcon
              :name="신청받기.아이콘"
              class="size-10 text-dimmed"
            />
          </div>
          <div class="flex grow flex-col gap-2 p-4">
            <div class="flex items-center gap-2">
              <UBadge
                size="sm"
                :color="신청받기.남은날 === 0 ? 'warning' : 'neutral'"
                :label="마감라벨(신청받기.남은날)"
              />
              <span class="text-xs text-dimmed">
                {{ 신청받기.종류 }}
              </span>
              <div class="grow" />
              <span
                v-if="is내신청(신청받기.id)"
                class="flex items-center gap-1 text-xs text-muted"
              >
                <UIcon
                  name="i-ph-check-light"
                  class="size-3.5"
                />
                신청함
              </span>
            </div>
            <h3 class="text-lg leading-snug font-semibold text-highlighted">
              {{ 신청받기.제목 }}
            </h3>
            <p class="line-clamp-2 text-sm text-dimmed">
              {{ 신청받기.설명 }}
            </p>
            <div class="grow" />
            <div class="flex items-baseline gap-2 border-t border-default pt-3 text-sm tabular-nums">
              <span class="text-muted">
                {{ 자리문구(신청받기) }}
              </span>
              <div class="grow" />
              <span class="text-toned">
                {{ 요금라벨(신청받기.요금) }}
              </span>
            </div>
          </div>
        </article>
      </div>

      <!-- ── 안 A · 내 신청 갈래 ────────────────────────────────────── -->
      <div v-else-if="안키 === 'A' && 갈래 === '내 신청'">
        <div class="mt-5 flex items-baseline gap-2">
          <h2 class="text-lg font-semibold text-highlighted">
            할 일
          </h2>
          <span class="text-sm font-semibold text-warning tabular-nums">
            {{ 할일s.length }}
          </span>
          <span class="text-sm text-muted">
            — 내가 안 끝낸 것
          </span>
        </div>
        <div
          v-for="신청 in 할일s"
          :key="신청.신청받기id"
          class="flex items-center gap-4 border-b border-default px-3 py-3"
        >
          <UBadge
            size="sm"
            :color="신청.is급함 ? 'warning' : 'neutral'"
            :label="신청.구분"
          />
          <div class="min-w-0">
            <div class="truncate font-medium text-highlighted">
              {{ 제목Of(신청.신청받기id) }}
            </div>
            <div class="truncate text-sm text-muted">
              {{ 신청.문구 }}
            </div>
          </div>
          <div class="grow" />
          <mButton
            size="xs"
            :역할="신청.is급함 ? '강조' : undefined"
            :label="신청.액션"
          />
        </div>

        <div class="mt-6 flex items-baseline gap-2">
          <h2 class="text-lg font-semibold text-highlighted">
            기다리는 것
          </h2>
          <span class="text-sm text-dimmed tabular-nums">
            {{ 기다림s.length }}
          </span>
        </div>
        <div
          v-for="신청 in 기다림s"
          :key="신청.신청받기id"
          class="flex items-center gap-4 border-b border-default px-3 py-3"
        >
          <UBadge
            size="sm"
            :label="신청.구분"
          />
          <div class="min-w-0">
            <div class="truncate font-medium text-highlighted">
              {{ 제목Of(신청.신청받기id) }}
            </div>
            <div class="truncate text-sm text-muted">
              {{ 신청.문구 }}
            </div>
          </div>
          <div class="grow" />
          <mButton
            size="xs"
            역할="조용"
            :label="신청.액션"
          />
        </div>

        <button
          type="button"
          class="mt-6 flex w-full items-baseline gap-2 border-b border-default px-3 pb-2 text-left"
          @click="지난펼침 = !지난펼침"
        >
          <span class="text-lg font-semibold text-highlighted">지난 신청</span>
          <span class="text-sm text-dimmed tabular-nums">{{ 표본지난신청s.length }}</span>
          <span class="text-sm text-muted">— 접힌 채로 연다</span>
          <span class="grow" />
          <UIcon
            :name="지난펼침 ? 'i-ph-caret-up-light' : 'i-ph-caret-down-light'"
            class="size-4 shrink-0 text-dimmed"
          />
        </button>
        <div
          v-for="지난 in (지난펼침 ? 표본지난신청s : [])"
          :key="지난.제목"
          class="flex items-center gap-4 border-b border-default px-3 py-3 opacity-70"
        >
          <span class="w-10 shrink-0 text-xs text-dimmed">
            {{ 지난.종류 }}
          </span>
          <div class="min-w-0">
            <div class="truncate font-medium text-highlighted">
              {{ 지난.제목 }}
            </div>
            <div class="truncate text-sm text-muted">
              {{ 지난.문구 }}
            </div>
          </div>
          <div class="grow" />
          <span class="shrink-0 text-sm tabular-nums text-toned">
            {{ 지난.값 }}
          </span>
        </div>
      </div>

      <!-- ── 안 B · 마감 시계 ───────────────────────────────────────── -->
      <div v-else-if="안키 === 'B'">
        <section
          v-for="묶음 in 시계묶음s"
          :key="묶음.이름"
          class="mt-6"
        >
          <div
            class="flex items-baseline gap-2 border-b-2 pb-1.5"
            :class="묶음.급함 ? 'border-warning' : 'border-inverted'"
          >
            <h2
              class="text-lg font-semibold"
              :class="묶음.급함 ? 'text-warning' : 'text-highlighted'"
            >
              {{ 묶음.이름 }}
            </h2>
            <span class="text-sm text-dimmed tabular-nums">
              {{ 묶음.항목s.length }}
            </span>
          </div>
          <div class="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <div
              v-for="신청받기 in 묶음.항목s"
              :key="신청받기.id"
              class="flex flex-col gap-2 rounded-lg border p-4"
              :class="묶음.급함 ? 'border-warning bg-warning/5' : 'border-default'"
            >
              <div class="flex items-center gap-2">
                <span class="text-xs text-dimmed">{{ 신청받기.종류 }}</span>
                <div class="grow" />
                <span
                  v-if="is내신청(신청받기.id)"
                  class="text-xs text-muted"
                >신청함</span>
              </div>
              <div class="leading-snug font-semibold text-highlighted">
                {{ 신청받기.제목 }}
              </div>
              <div class="flex items-baseline gap-2 text-sm tabular-nums">
                <span class="text-muted">{{ 자리문구(신청받기) }}</span>
                <div class="grow" />
                <span class="text-toned">{{ 요금라벨(신청받기.요금) }}</span>
              </div>
            </div>
          </div>
        </section>
        <p class="mt-6 border-t border-dashed border-default pt-3 text-xs text-dimmed">
          「오늘 마감」 묶음이 비면 그 줄이 통째로 사라진다 — 늘 같은 자리에 있는 급한 배너와 다른 점이 그것이다.
        </p>
      </div>

      <!-- ── 안 C · 내 것 먼저 ──────────────────────────────────────── -->
      <div v-else>
        <div class="mt-5 flex items-baseline gap-2 border-b-2 border-inverted pb-1.5">
          <h2 class="text-lg font-semibold text-highlighted">
            내 신청
          </h2>
          <span class="text-sm text-dimmed tabular-nums">
            {{ 표본신청s.length }} · 할 일 {{ 할일s.length }}
          </span>
        </div>
        <div
          v-for="신청 in 표본신청s"
          :key="신청.신청받기id"
          class="flex items-center gap-4 border-b border-default px-3 py-3"
        >
          <UBadge
            size="sm"
            :color="신청.is급함 ? 'warning' : 'neutral'"
            :label="신청.구분"
          />
          <div class="min-w-0">
            <div class="truncate font-medium text-highlighted">
              {{ 제목Of(신청.신청받기id) }}
            </div>
            <div class="truncate text-sm text-muted">
              {{ 신청.문구 }}
            </div>
          </div>
          <div class="grow" />
          <mButton
            size="xs"
            :역할="신청.is급함 ? '강조' : '조용'"
            :label="신청.액션"
          />
        </div>

        <div class="mt-7 flex items-baseline gap-2 border-b-2 border-inverted pb-1.5">
          <h2 class="text-lg font-semibold text-highlighted">
            열린 신청받기
          </h2>
          <span class="text-sm text-dimmed tabular-nums">
            {{ 정렬된s.length }}
          </span>
        </div>
        <div class="mt-3 grid gap-3 lg:grid-cols-2">
          <div
            v-for="신청받기 in 정렬된s"
            :key="신청받기.id"
            class="flex gap-3 rounded-lg border border-default p-3"
          >
            <div class="flex size-16 shrink-0 items-center justify-center rounded-md bg-elevated">
              <UIcon
                :name="신청받기.아이콘"
                class="size-6 text-dimmed"
              />
            </div>
            <div class="flex min-w-0 grow flex-col gap-1">
              <span class="text-xs text-dimmed">{{ 신청받기.종류 }}</span>
              <span class="truncate font-semibold text-highlighted">{{ 신청받기.제목 }}</span>
              <div class="flex items-baseline gap-2 text-sm tabular-nums">
                <span class="text-muted">{{ 마감라벨(신청받기.남은날) }} · {{ 자리문구(신청받기) }}</span>
                <div class="grow" />
                <span class="text-toned">{{ 요금라벨(신청받기.요금) }}</span>
              </div>
            </div>
          </div>
        </div>
        <p class="mt-6 border-t border-dashed border-default pt-3 text-xs text-dimmed">
          처음 온 사람에게는 위 묶음이 통째로 없다 — 그러면 화면이 사람마다 달라 보인다.
          「늘 같은 자리」를 포기하는 안이다.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  표본신청받기s, 표본신청s, 표본지난신청s,
  is내신청, 마감라벨, 남은자리, 요금라벨,
  type i표본신청받기
} from './_표본'

definePageMeta({
  제목: '신청 목록 네 안'
})

type i안키 = 'A' | 'B' | 'C'

const 안s = [
  {
    키: 'A' as const,
    이름: 'A · 행 목록',
    고름: true,
    왜: '사진이 붙는 신청받기가 소수라 지금은 카드 위 132px가 대개 회색 네모다. 행으로 세우면 열두 건이 한 화면에 들고, 제일 급한 값(마감)이 눈이 처음 닿는 왼쪽 열에 온다.',
    대가: '그림이 파는 것(행사·수업 홍보)이 안 드러난다. 그래서 격자를 버리지 않고 뷰 전환으로 남겼고, 그 대가로 화면 하나가 마크업 두 벌을 든다.'
  },
  {
    키: 'B' as const,
    이름: 'B · 마감 시계',
    고름: false,
    왜: '「지금 신청해야 하나」가 이 화면의 유일한 물음인데, 지금은 그 답이 배지 글자(D-2)에만 있어 열두 장을 다 읽어야 안다. 시간을 묶음으로 세우면 읽기 전에 형태로 갈린다.',
    대가: '정렬 축을 마감 하나로 고정한다 — 「인기순·최신순」을 고르는 순간 묶음이 깨져서, 정렬 셀렉트를 버려야 한다.'
  },
  {
    키: 'C' as const,
    이름: 'C · 내 것 먼저',
    고름: false,
    왜: '다시 오는 사람이 여기 오는 이유는 새 신청받기가 아니라 안 끝낸 일(미제출 응답·미납부)이다. 지금은 그게 카드 왼쪽 3px 선으로만 갈린다.',
    대가: '처음 온 사람에게는 위 절반이 빈다. 할 일이 없으면 묶음이 통째로 사라져야 하고, 그러면 화면이 사람마다 달라 보인다. 이 안의 윗묶음은 A 의 「내 신청」 갈래로 살아남았다.'
  }
]

const 안키 = ref<i안키>('A')
const 뷰 = ref<'목록형' | '카드형'>('목록형')
const 갈래 = ref<'전체' | '내 신청'>('전체')
const 뷰s = ['목록형', '카드형'] as const
const 갈래s = ['전체', '내 신청'] as const
const 지난펼침 = ref(false)

const 판 = computed(() => 안s.find(안 => 안.키 === 안키.value)!)

const do안고르기 = (키: i안키) => {
  안키.value = 키
  뷰.value = '목록형'
  갈래.value = '전체'
}

/** 안 D 는 따로 서지 않는다 — 고른 안의 카드형 뷰가 그 자리다. */
const do카드안 = () => {
  안키.value = 'A'
  갈래.value = '전체'
  뷰.value = '카드형'
}

// ─────────────────────────────────────────────────────────────────────────────
// 조건. 네 판이 **같이** 든다 — 판마다 다르면 무엇 때문에 달라 보이는지 못 가른다.
// ─────────────────────────────────────────────────────────────────────────────

const 검색 = ref('')
const 종류 = ref('전체')
const 정렬 = ref('마감')
const 종류s = ['전체', '설문', '퀴즈', '투표', '수업', '행사']
const 정렬s = [
  { label: '마감 임박순', value: '마감' },
  { label: '이름순', value: '이름' },
  { label: '자리 적은 순', value: '자리' }
]

const 걸러진s = computed(() => {
  const 말 = 검색.value.trim()
  return 표본신청받기s.filter(신청받기 =>
    (종류.value === '전체' || 신청받기.종류 === 종류.value)
    && (!말 || 신청받기.제목.includes(말) || 신청받기.설명.includes(말)))
})

const 정렬된s = computed(() => {
  const s = [...걸러진s.value]
  if (정렬.value === '이름') return s.sort((a, b) => a.제목.localeCompare(b.제목))
  if (정렬.value === '자리') return s.sort((a, b) => (남은자리(a) ?? 9999) - (남은자리(b) ?? 9999))
  // 상시(남은날 null)는 맨 뒤. 「급한 것이 위에 오는 건 배너가 아니라 정렬이라서다」가 이 줄이다.
  return s.sort((a, b) => (a.남은날 ?? 9999) - (b.남은날 ?? 9999))
})

const 할일s = computed(() => 표본신청s.filter(신청 => 신청.is할일))
const 기다림s = computed(() => 표본신청s.filter(신청 => !신청.is할일))

const 제목Of = (id: number) => 표본신청받기s.find(신청받기 => 신청받기.id === id)?.제목 ?? ''

/** 마감 시계(안 B)의 묶음. 비면 그 줄째 사라진다. */
const 시계묶음s = computed(() => [
  { 이름: '오늘 마감', 급함: true, 항목s: 걸러진s.value.filter(신청받기 => 신청받기.남은날 === 0) },
  { 이름: '이번 주', 급함: false, 항목s: 걸러진s.value.filter(신청받기 => (신청받기.남은날 ?? 99) >= 1 && (신청받기.남은날 ?? 99) <= 7) },
  { 이름: '이번 달', 급함: false, 항목s: 걸러진s.value.filter(신청받기 => (신청받기.남은날 ?? 99) >= 8 && (신청받기.남은날 ?? 99) <= 31) },
  { 이름: '상시', 급함: false, 항목s: 걸러진s.value.filter(신청받기 => 신청받기.남은날 === null) }
].filter(묶음 => 묶음.항목s.length))

const 찬비율 = (신청받기: i표본신청받기) =>
  (신청받기.정원 ? Math.min(100, Math.round((신청받기.신청수 / 신청받기.정원) * 100)) : 0)

const 막대색 = (신청받기: i표본신청받기) => {
  const 비율 = 찬비율(신청받기)
  if (비율 >= 100) return 'error' as const
  return 비율 >= 80 ? ('warning' as const) : ('primary' as const)
}

const 자리문구 = (신청받기: i표본신청받기) => {
  const 남은 = 남은자리(신청받기)
  if (남은 === null) return `${신청받기.신청수}명 신청 · 제한 없음`
  return 남은 ? `${신청받기.신청수} / ${신청받기.정원} · ${남은}자리` : '정원 마감'
}

/** 줄 왼쪽의 선 하나. 급한 것과 내가 낸 것을 **글자를 읽기 전에** 가른다. */
const 줄강조 = (신청받기: i표본신청받기) => {
  if (신청받기.남은날 === 0) return 'border-l-2 border-l-warning bg-warning/5'
  if (is내신청(신청받기.id)) return 'border-l-2 border-l-inverted'
  return 'border-l-2 border-l-transparent'
}
</script>

<!--
  **신청 상세의 첫 화면을 무엇이 먹나**의 비교판.

  ## 이 판이 답하는 물음

  `/do-enrolls/[id]` 는 높이 224~288px 짜리 띠로 시작한다. 사진이 없으면 그 자리가
  아이콘 하나 세운 회색 네모고, 그게 첫 화면을 통째로 먹는다. 그 아래로 본문·응답지가 왼쪽,
  요약 타일·신청 버튼이 오른쪽 레일에 서고, 바닥에는 제출 바가 하나 더 붙는다 —
  **행동하는 자리가 셋**(레일 버튼 · 하단 바 · 얼럿)이다. 그래서 물음은 둘이다:
  첫 화면을 무엇이 먹고, 행동은 어디서 하나.

  ## 판 셋

  1. **응답지 먼저** — 머리말을 한 줄로 눕히고 소개를 접는다. 이 화면에 온 사람이 하려는 일
     (신청 or 답 쓰기)을 첫 화면에 올린다. 대신 팔아야 하는 신청받기(행사·수업)에서 그림이 안 팔린다.
  2. **단계** — 신청 → 응답 → 제출·결과를 스텝으로 세운다. 한 화면에 행동이 하나만 남는다.
     대신 문항 없는 신청받기에서는 3단계가 과장이라 2단계로 접혀야 하고, 단계가 상황마다 바뀌면
     그 자체가 학습 비용이다.
  3. **2단 정돈**(고름) — 레일은 옳다(길이와 무관하게 결정 자리가 늘 보인다). 히어로만
     72px 줄로 낮추고, **사진이 없으면 줄째 없앤다**. 하단 sticky 바는 지우고 제출을 응답지 끝에 둔다.

  ## 고른 값 (2026-09-05)

  **2단 정돈.** 히어로를 「사진 토글」로 껐다 켜 보면 이 안이 무엇을 산 건지 바로 보인다 —
  사진이 없는 신청받기(태반이다)에서 첫 화면이 통째로 살아난다.
  진 대가는 하나다: 문항이 스무 개면 제출 버튼을 찾아 다시 내려가야 한다.
  지금의 sticky 바가 풀던 문제라, 옮길 때 **문항 수가 많은 퀴즈에서 한 번 재 볼 것.**

  **옮겼다** — 2026-09-05, `(member)/do-enrolls/[id].vue`. 이 판은 그 결정의 기록이다.

  ## 판 읽는 법

  - 위 손잡이 셋(판 · 사진 · 상태)은 세 판이 같이 쓴다. **사진**을 끄면 히어로가 어떻게 되는지,
    **상태**를 「응답 중」으로 놓으면 행동 자리가 몇 개가 되는지가 이 판이 재는 값이다.
  - 표본은 손으로 박은 값이다(`./_표본.ts`). 문항 셋은 실제 유형(객관식·척도·서술)만 흉내 낸
    껍데기고 채점·저장은 없다 — 이 판이 재는 게 그쪽이 아니라서다.
-->
<template>
  <div class="mx-auto w-full max-w-7xl px-4 py-8">
    <header class="mb-5">
      <h1 class="text-2xl font-semibold text-highlighted">
        신청 상세의 첫 화면을 무엇이 먹나
      </h1>
      <p class="mt-1 text-sm text-muted">
        같은 신청받기 하나를 세 안에 물려 본다 ·
        고른 값은 <span class="text-highlighted">2단 정돈</span>
      </p>
    </header>

    <div class="mb-4 flex flex-wrap items-center gap-x-6 gap-y-2">
      <div class="flex flex-wrap gap-2">
        <mButton
          v-for="안 in 안s"
          :key="안.키"
          size="sm"
          역할="조용"
          :켜짐="안키 === 안.키"
          :label="안.이름"
          @click="안키 = 안.키"
        />
      </div>
      <UCheckbox
        v-model="사진"
        label="사진 있음"
      />
      <UCheckbox
        v-model="응답중"
        label="이미 신청함 (응답 중)"
      />
    </div>

    <div class="mb-5 rounded-lg border border-default bg-muted px-4 py-3 text-sm leading-relaxed">
      <p>
        <span class="text-dimmed">왜 ·</span> {{ 판.왜 }}
      </p>
      <p class="mt-1">
        <span class="text-dimmed">대가 ·</span> {{ 판.대가 }}
      </p>
      <p class="mt-1">
        <span class="text-dimmed">행동하는 자리 ·</span>
        <span class="tabular-nums">{{ 판.행동자리 }}</span>
      </p>
    </div>

    <!-- ══ 판 ══════════════════════════════════════════════════════════ -->
    <div class="rounded-xl border border-default bg-default p-4 m-층-카드 sm:p-6">
      <!-- ── 안 A · 응답지 먼저 ─────────────────────────────────────── -->
      <template v-if="안키 === 'A'">
        <div class="mx-auto max-w-3xl">
          <div class="flex items-center gap-1.5 text-sm text-muted">
            <UIcon
              name="i-ph-caret-left-light"
              class="size-4"
            />
            신청 목록
          </div>
          <div class="mt-3 flex flex-wrap items-start gap-4 border-b-2 border-inverted pb-3">
            <div class="min-w-0">
              <span class="text-xs text-dimmed">{{ 신청받기.종류 }}</span>
              <h2 class="mt-0.5 text-2xl leading-tight font-bold text-highlighted">
                {{ 신청받기.제목 }}
              </h2>
              <p class="mt-2 text-sm tabular-nums text-toned">
                3/14 ~ 3/28 ·
                <span class="font-semibold text-warning">오늘 마감</span> ·
                {{ 자리문구 }} · {{ 요금라벨(신청받기.요금) }}
              </p>
            </div>
            <div class="grow" />
            <mButton
              v-if="!응답중"
              역할="강조"
              label="신청하기"
            />
          </div>

          <!-- 소개는 접는다. 신청한 뒤에는 접힌 채로 시작한다. -->
          <button
            type="button"
            class="mt-4 flex w-full items-center gap-2 rounded-lg border border-dashed border-default px-4 py-3 text-left text-sm text-muted"
            @click="소개펼침 = !소개펼침"
          >
            소개 {{ 소개펼침 ? '접기' : '보기' }}
            <UIcon
              :name="소개펼침 ? 'i-ph-caret-up-light' : 'i-ph-caret-down-light'"
              class="size-4"
            />
            <span class="grow" />
            <span class="text-xs text-dimmed">신청한 뒤에는 접혀 있다</span>
          </button>
          <div
            v-if="소개펼침"
            class="mt-3 space-y-2 text-sm leading-relaxed text-toned"
          >
            <p
              v-for="줄 in 소개s"
              :key="줄"
            >
              {{ 줄 }}
            </p>
          </div>

          <div
            v-if="응답중"
            class="mt-5"
          >
            <div class="overflow-hidden rounded-xl border border-default">
              <div class="flex items-center gap-2 border-b-2 border-inverted px-5 py-3">
                <h3 class="font-semibold text-highlighted">
                  문항 {{ 문항s.length }}개
                </h3>
                <div class="grow" />
                <span class="text-xs tabular-nums text-muted">
                  {{ 응답수 }} / {{ 문항s.length }} 응답
                </span>
              </div>
              <div
                v-for="(문항, i) in 문항s"
                :key="문항.키"
                class="border-b border-default px-5 py-5 last:border-b-0"
              >
                <div class="flex gap-3">
                  <span class="w-4 shrink-0 text-sm font-semibold tabular-nums text-dimmed">{{ i + 1 }}</span>
                  <div class="grow space-y-3">
                    <div class="flex flex-wrap items-center gap-2">
                      <span class="font-medium text-highlighted">{{ 문항.문두 }}</span>
                      <UBadge
                        v-if="문항.is필수"
                        size="xs"
                        :label="'필수'"
                      />
                    </div>
                    <URadioGroup
                      v-if="문항.선택지s"
                      v-model="답s[문항.키]"
                      :items="문항.선택지s"
                    />
                    <UTextarea
                      v-else
                      v-model="답s[문항.키]"
                      :rows="3"
                      class="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div class="mt-4 flex flex-wrap items-center gap-3 rounded-xl border-2 border-inverted px-4 py-3">
              <span class="text-sm tabular-nums text-toned">{{ 응답수 }} / {{ 문항s.length }} 응답</span>
              <span class="text-sm text-muted">· 필수 문항 {{ 남은필수 }}개가 남았습니다</span>
              <div class="grow" />
              <mButton
                size="sm"
                역할="조용"
                label="임시 저장"
              />
              <mButton
                size="sm"
                역할="강조"
                label="제출"
              />
            </div>
            <p class="mt-1 text-center text-xs text-dimmed">
              ↑ 실제로는 화면 아래에 붙어 따라온다
            </p>
          </div>
        </div>
      </template>

      <!-- ── 안 B · 단계 ────────────────────────────────────────────── -->
      <template v-else-if="안키 === 'B'">
        <div class="mx-auto max-w-3xl">
          <div class="flex items-baseline gap-3">
            <span class="text-xs text-dimmed">{{ 신청받기.종류 }}</span>
            <h2 class="text-2xl font-bold text-highlighted">
              {{ 신청받기.제목 }}
            </h2>
          </div>

          <div class="mt-4 flex items-center gap-4 rounded-xl border-2 border-inverted px-5 py-4">
            <template
              v-for="(단계, i) in 단계s"
              :key="단계.이름"
            >
              <div
                v-if="i"
                class="h-px grow"
                :class="i <= 현재단계 ? 'bg-inverted' : 'bg-accented'"
              />
              <div class="flex shrink-0 items-center gap-2">
                <span
                  class="flex size-7 items-center justify-center rounded-full text-sm font-semibold"
                  :class="단계색(i)"
                >
                  <UIcon
                    v-if="i < 현재단계"
                    name="i-ph-check-light"
                    class="size-4"
                  />
                  <template v-else>{{ i + 1 }}</template>
                </span>
                <span
                  class="text-base"
                  :class="i === 현재단계 ? 'font-semibold text-warning' : i < 현재단계 ? 'text-toned' : 'text-dimmed'"
                >{{ 단계.이름 }}</span>
              </div>
            </template>
          </div>

          <dl class="mt-4 flex border-y border-default py-3">
            <div
              v-for="(칸, i) in 눈금s"
              :key="칸.이름"
              class="grow px-5"
              :class="i ? 'border-l border-default' : ''"
            >
              <dt class="text-xs text-dimmed">
                {{ 칸.이름 }}
              </dt>
              <dd
                class="mt-1 text-lg font-semibold tabular-nums"
                :class="칸.급함 ? 'text-warning' : 'text-highlighted'"
              >
                {{ 칸.값 }}
              </dd>
            </div>
          </dl>

          <div
            v-if="!응답중"
            class="mt-5 space-y-2 text-sm leading-relaxed text-toned"
          >
            <p
              v-for="줄 in 소개s"
              :key="줄"
            >
              {{ 줄 }}
            </p>
          </div>

          <div
            v-else
            class="mt-5 overflow-hidden rounded-xl border border-default"
          >
            <div class="flex items-center gap-2 border-b-2 border-inverted px-5 py-3">
              <h3 class="font-semibold text-highlighted">
                문항 {{ 문항s.length }}개
              </h3>
              <div class="grow" />
              <span class="text-xs tabular-nums text-muted">
                {{ 응답수 }} / {{ 문항s.length }} 응답
              </span>
            </div>
            <div
              v-for="(문항, i) in 문항s"
              :key="문항.키"
              class="border-b border-default px-5 py-5 last:border-b-0"
            >
              <div class="flex gap-3">
                <span class="w-4 shrink-0 text-sm font-semibold tabular-nums text-dimmed">{{ i + 1 }}</span>
                <div class="grow space-y-3">
                  <span class="font-medium text-highlighted">{{ 문항.문두 }}</span>
                  <URadioGroup
                    v-if="문항.선택지s"
                    v-model="답s[문항.키]"
                    :items="문항.선택지s"
                  />
                  <UTextarea
                    v-else
                    v-model="답s[문항.키]"
                    :rows="3"
                    class="w-full"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="mt-5 flex flex-wrap items-center gap-3">
            <span class="text-sm text-muted">
              {{ 응답중 ? `필수 문항 ${남은필수}개가 남았습니다` : '신청하면 문항이 열립니다' }}
            </span>
            <div class="grow" />
            <mButton
              역할="강조"
              :label="응답중 ? '제출하고 다음 단계' : '신청하기'"
            />
          </div>
          <p class="mt-3 border-t border-dashed border-default pt-3 text-xs text-dimmed">
            단계 ③ 에 지금의 채점 결과 · 결제 · 다시 풀기가 모인다 — 지금은 셋이 각각 얼럿과 배지로 본문에 흩어져 있다.
            문항이 없는 신청받기에서는 ② 가 없어져 2단계가 된다.
          </p>
        </div>
      </template>

      <!-- ── 안 C · 2단 정돈 (고른 안) ──────────────────────────────── -->
      <template v-else>
        <!-- 히어로. **사진이 없으면 줄째 없다** — 회색 네모를 세우지 않는다. -->
        <div
          v-if="사진"
          class="flex items-center gap-4 rounded-xl border border-default p-3"
        >
          <div class="flex h-18 w-28 shrink-0 items-center justify-center rounded-md bg-elevated">
            <UIcon
              :name="신청받기.아이콘"
              class="size-7 text-dimmed"
            />
          </div>
          <div class="min-w-0">
            <span class="text-xs text-dimmed">{{ 신청받기.종류 }}</span>
            <h2 class="text-xl leading-tight font-bold text-highlighted">
              {{ 신청받기.제목 }}
            </h2>
            <p class="mt-1 line-clamp-1 text-sm text-muted">
              {{ 신청받기.설명 }}
            </p>
          </div>
          <div class="grow" />
          <UBadge
            size="sm"
            color="warning"
            label="오늘 마감"
          />
        </div>
        <div
          v-else
          class="flex flex-wrap items-baseline gap-3"
        >
          <span class="text-xs text-dimmed">{{ 신청받기.종류 }}</span>
          <h2 class="text-xl font-bold text-highlighted">
            {{ 신청받기.제목 }}
          </h2>
          <UBadge
            size="sm"
            color="warning"
            label="오늘 마감"
          />
        </div>

        <div class="mt-5 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_19rem]">
          <div class="min-w-0 space-y-5">
            <div class="space-y-2 text-sm leading-relaxed text-toned">
              <h3 class="text-base font-semibold text-highlighted">
                소개
              </h3>
              <p
                v-for="줄 in 소개s"
                :key="줄"
              >
                {{ 줄 }}
              </p>
            </div>

            <div
              v-if="응답중"
              class="overflow-hidden rounded-xl border border-default"
            >
              <div class="flex items-center gap-2 border-b-2 border-inverted px-5 py-3">
                <h3 class="font-semibold text-highlighted">
                  문항 {{ 문항s.length }}개
                </h3>
                <div class="grow" />
                <span class="text-xs tabular-nums text-muted">
                  {{ 응답수 }} / {{ 문항s.length }} 응답
                </span>
              </div>
              <div
                v-for="(문항, i) in 문항s"
                :key="문항.키"
                class="border-b border-default px-5 py-5"
              >
                <div class="flex gap-3">
                  <span class="w-4 shrink-0 text-sm font-semibold tabular-nums text-dimmed">{{ i + 1 }}</span>
                  <div class="grow space-y-3">
                    <span class="font-medium text-highlighted">{{ 문항.문두 }}</span>
                    <URadioGroup
                      v-if="문항.선택지s"
                      v-model="답s[문항.키]"
                      :items="문항.선택지s"
                    />
                    <UTextarea
                      v-else
                      v-model="답s[문항.키]"
                      :rows="3"
                      class="w-full"
                    />
                  </div>
                </div>
              </div>
              <!-- 제출은 응답지 **안** 끝에. 바닥에 따로 붙는 바가 없다. -->
              <div class="flex flex-wrap items-center gap-3 px-5 py-4">
                <span class="text-sm text-muted">필수 문항 {{ 남은필수 }}개가 남았습니다</span>
                <div class="grow" />
                <mButton
                  역할="강조"
                  label="제출"
                />
              </div>
            </div>
          </div>

          <!-- 레일. 본문 길이와 무관하게 결정 자리가 늘 보인다 — 이 안이 산 값. -->
          <aside class="overflow-hidden rounded-xl border border-default bg-default m-층-카드 lg:sticky lg:top-4">
            <dl class="divide-y divide-default">
              <div
                v-for="칸 in 레일s"
                :key="칸.이름"
                class="flex items-baseline gap-3 px-4 py-3"
              >
                <dt class="shrink-0 text-xs whitespace-nowrap text-dimmed">
                  {{ 칸.이름 }}
                </dt>
                <dd class="grow text-right">
                  <div
                    class="truncate text-base leading-tight font-semibold tabular-nums"
                    :class="칸.급함 ? 'text-warning' : 'text-highlighted'"
                  >
                    {{ 칸.값 }}
                  </div>
                  <div
                    v-if="칸.덧"
                    class="mt-0.5 truncate text-[0.625rem] leading-none text-dimmed"
                  >
                    {{ 칸.덧 }}
                  </div>
                </dd>
              </div>
            </dl>
            <div class="border-t border-default px-4 py-3">
              <UProgress
                :model-value="찬비율"
                color="warning"
                size="sm"
              />
            </div>
            <div class="flex items-center gap-2 border-t border-default px-4 py-3">
              <div class="flex -space-x-2">
                <UAvatar
                  v-for="사람 in 신청자s"
                  :key="사람"
                  :text="사람"
                  size="xs"
                  class="ring-2 ring-default"
                />
              </div>
              <span class="truncate text-xs text-muted">
                김OO 외 26명 신청
              </span>
            </div>
            <div class="border-t border-default p-4">
              <mButton
                v-if="!응답중"
                역할="강조"
                block
                size="lg"
                label="신청하기"
              />
              <div
                v-else
                class="flex flex-wrap items-center gap-2"
              >
                <UBadge
                  size="sm"
                  label="접수"
                />
                <UBadge
                  size="sm"
                  color="warning"
                  label="미납부"
                />
                <mButton
                  size="xs"
                  역할="강조"
                  label="결제하기"
                />
              </div>
            </div>
          </aside>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { 표본신청받기s, 남은자리, 요금라벨 } from './_표본'

definePageMeta({
  제목: '신청 상세 세 안'
})

type i안키 = 'A' | 'B' | 'C'

const 안s = [
  {
    키: 'A' as const,
    이름: 'A · 응답지 먼저',
    왜: '이 화면에 온 사람이 하려는 일은 신청이거나 답 쓰기 둘 중 하나인데, 지금은 그 앞에 높이 288px 짜리 띠(대개 회색 네모)와 레일이 먼저 선다. 머리말을 한 줄로 눕히고 응답지를 첫 화면에 올린다.',
    대가: '행사·수업처럼 팔아야 하는 신청받기에서 그림과 소개가 접힌 채로 시작한다 — 신청 전환이 떨어질 수 있다.',
    행동자리: '2 (위 신청하기 · 아래 제출)'
  },
  {
    키: 'B' as const,
    이름: 'B · 단계',
    왜: '신청 → 응답 → 제출·결과는 실제로 순서인데, 지금은 그 순서가 배지·얼럿·버튼의 유무로만 드러난다. 단계를 세우면 한 화면에 행동이 하나만 남는다.',
    대가: '문항이 없는 신청받기(그냥 신청만 하는 행사)에서는 3단계가 과장이다. 단계가 상황마다 바뀌면 그 자체가 학습 비용이 된다.',
    행동자리: '1 (아래 하나)'
  },
  {
    키: 'C' as const,
    이름: 'C · 2단 정돈 (고름)',
    왜: '레일은 옳다 — 본문 길이와 무관하게 결정 자리가 늘 보인다. 고칠 것은 히어로다. 288px 띠를 72px 줄로 낮추고, 사진이 없으면 줄째 없앤다(위 「사진 있음」을 꺼 볼 것).',
    대가: '문항이 스무 개면 제출 버튼을 찾아 끝까지 내려가야 한다 — 지금의 하단 sticky 바가 풀던 문제가 되돌아온다.',
    행동자리: '2 (레일 · 응답지 끝)'
  }
]

const 안키 = ref<i안키>('C')
const 사진 = ref(true)
const 응답중 = ref(true)
const 소개펼침 = ref(false)

const 판 = computed(() => 안s.find(안 => 안.키 === 안키.value)!)

/** 표본 하나. 유료 + 사진 있음 + 오늘 마감 — 세 판이 제일 세게 갈리는 조합이다. */
const 신청받기 = 표본신청받기s[0]!

const 소개s = [
  '전 학기 화성학 I 을 마친 분을 대상으로 합니다. 4화음과 전위, 비화성음까지 다룹니다.',
  '매주 화·목 19:00, 3층 합주실. 교재는 첫 주에 나눠 드립니다.',
  '결제는 신청 뒤 3일 안에 해 주셔야 자리가 유지됩니다.'
]

const 문항s = [
  {
    키: 'q1',
    문두: '이번 학기 수업 만족도는?',
    is필수: true,
    선택지s: ['매우 그렇다', '그렇다', '보통', '아니다']
  },
  {
    키: 'q2',
    문두: '가장 도움이 된 단원을 고르세요',
    is필수: true,
    선택지s: ['4화음', '전위', '비화성음', '조옮김']
  },
  {
    키: 'q3',
    문두: '개선했으면 하는 점을 적어 주세요',
    is필수: false,
    선택지s: null
  }
]

const 답s = reactive<Record<string, string>>({ q1: '그렇다', q2: '', q3: '' })

const 응답수 = computed(() => Object.values(답s).filter(Boolean).length)
const 남은필수 = computed(() => 문항s.filter(문항 => 문항.is필수 && !답s[문항.키]).length)

const 단계s = [{ 이름: '신청' }, { 이름: '응답' }, { 이름: '제출 · 결과' }]
const 현재단계 = computed(() => (응답중.value ? 1 : 0))

const 단계색 = (i: number) => {
  if (i < 현재단계.value) return 'bg-inverted text-inverted'
  if (i === 현재단계.value) return 'border-2 border-warning bg-warning/10 text-warning'
  return 'border border-accented text-dimmed'
}

const 자리문구 = computed(() => {
  const 남은 = 남은자리(신청받기)
  return 남은 === null ? `${신청받기.신청수}명 신청` : `${남은}자리 남음`
})

const 찬비율 = computed(() =>
  (신청받기.정원 ? Math.min(100, Math.round((신청받기.신청수 / 신청받기.정원) * 100)) : 0))

const 눈금s = computed(() => [
  { 이름: '기간', 값: '3/14 ~ 3/28', 급함: false },
  { 이름: '마감', 값: '오늘', 급함: true },
  { 이름: '자리', 값: `${신청받기.신청수} / ${신청받기.정원}`, 급함: false },
  { 이름: '요금', 값: 요금라벨(신청받기.요금), 급함: false }
])

const 레일s = computed(() => [
  { 이름: '기간', 값: '3/14 ~ 3/28', 덧: '8주', 급함: false },
  { 이름: '마감', 값: '오늘', 덧: '23:59까지', 급함: true },
  { 이름: '남은 자리', 값: 자리문구.value, 덧: `${신청받기.신청수} / ${신청받기.정원}`, 급함: true },
  { 이름: '요금', 값: 요금라벨(신청받기.요금), 덧: '', 급함: false }
])

const 신청자s = ['김', '이', '박', '최', '정']
</script>

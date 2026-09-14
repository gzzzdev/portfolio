<!--
  신청 한 건의 답지. `타입지정._.답지` 가 여기로 온다. 값은 `model신청.답지` 가 다 만들어 오고, 여기는 그리기만 한다.

  **읽기 전용이다.** 답은 신청자가 응답지(`/official/enrolls/[id]`)에서 쓴다 — 관리자가 여기서 고치면
  누가 한 답인지가 흐려진다. 그래서 `readonly` 를 안 받는다.

  한 줄 = 문항 하나. 문두는 작고 흐리게, **답이 주인공**이다(관리자가 훑는 건 답이다).
  유형마다 답이 말해야 하는 게 달라서 그림이 갈린다:
  - 단일·OX: 글자 한 줄. 선택지 목록은 안 편다 — 무엇을 골랐나면 충분하다.
  - 복수: 칩. 선택지 라벨에 `·`·`,` 가 흔해서 이어 쓰면 경계가 안 보인다.
  - 척도: 눈금 막대. 「보통」은 다섯 칸 중 어디인지가 같이 보여야 뜻이 된다.
  - 단답·서술: 원문 그대로, 줄바꿈을 살려서.
  - 비었으면 둘로 가른다 — 선택 문항은 「답하지 않음」(흐리게), 필수 문항은 「필수 · 미응답」(경고).
-->
<template>
  <div class="w-full">
    <!-- 머리: 언제 냈나 · 빠뜨린 필수. 응답 수·점수는 카드 배지가 이미 말한다. -->
    <div class="mb-1 flex flex-wrap items-center gap-x-3 gap-y-1 px-1 text-xs">
      <span
        v-if="답지.제출일시"
        class="flex items-center gap-1 text-muted tabular-nums"
      >
        <UIcon
          name="i-ph-paper-plane-tilt-light"
          class="size-3.5"
        />
        {{ 답지.제출일시.format('YYYY. M. D. HH:mm') }} 제출
      </span>
      <span
        v-else
        class="flex items-center gap-1 text-dimmed"
      >
        <UIcon
          name="i-ph-pencil-simple-line-light"
          class="size-3.5"
        />
        아직 제출하지 않았습니다
      </span>
      <span
        v-if="누락수"
        class="text-warning"
      >필수 {{ 누락수 }}개 미응답</span>
      <template v-if="채점줄s.length">
        <span class="grow" />
        <span class="text-muted tabular-nums">
          {{ 채점줄s.length }}문항 중 {{ 맞은수 }}개 정답
        </span>
      </template>
    </div>

    <div
      v-if="!답지.응답수"
      class="rounded-lg border border-dashed border-default px-4 py-6 text-center text-sm text-muted"
    >
      아직 답한 문항이 없습니다.
      <span class="text-dimmed">(문항 {{ 답지.줄s.length }}개)</span>
    </div>

    <ol
      v-else
      class="divide-y divide-default"
    >
      <li
        v-for="줄 in 답지.줄s"
        :key="줄.문항.id"
        class="flex gap-3 px-1 py-3"
      >
        <span class="w-5 shrink-0 pt-px text-xs font-semibold text-dimmed tabular-nums">{{ 줄.번호 }}</span>

        <div class="min-w-0 flex-1">
          <div class="flex items-start gap-2">
            <p class="min-w-0 flex-1 text-xs leading-5 text-muted">
              {{ 줄.문항.label }}
            </p>
            <!-- 채점 문항만. 맞으면 받은 점수, 틀리면 놓친 배점을 적는다. -->
            <span
              v-if="줄.정답여부 !== null"
              class="flex shrink-0 items-center gap-0.5 text-xs font-medium tabular-nums"
              :class="줄.정답여부 ? 'text-success' : 'text-error'"
            >
              <UIcon
                :name="줄.정답여부 ? 'i-ph-check-bold' : 'i-ph-x-bold'"
                class="size-3.5"
              />
              {{ 줄.정답여부 ? `${줄.득점}점` : `0 / ${줄.배점}점` }}
            </span>
          </div>

          <div class="mt-1">
            <!-- 비었다 -->
            <template v-if="!줄.값s.length">
              <UBadge
                v-if="줄.is누락"
                color="warning"
                variant="soft"
                size="sm"
              >
                필수 · 미응답
              </UBadge>
              <span
                v-else
                class="text-sm text-dimmed"
              >답하지 않음</span>
            </template>

            <!-- 척도: 고른 칸만 칠한 눈금 + 양 끝 라벨 -->
            <div
              v-else-if="줄.눈금s.length"
              class="max-w-sm"
            >
              <p class="text-sm font-medium text-highlighted">
                {{ 줄.값s.map(x => x.label).join(', ') }}
              </p>
              <div
                class="mt-1.5 flex gap-1"
                role="img"
                :aria-label="눈금위치(줄) ? `${줄.눈금s.length}칸 중 ${눈금위치(줄)}번째` : '지금 선택지에 없는 값'"
              >
                <span
                  v-for="눈금 in 줄.눈금s"
                  :key="눈금.value"
                  class="h-1.5 flex-1 rounded-full"
                  :class="줄.값s.some(x => x.value === 눈금.value) ? 'bg-primary' : 'bg-accented'"
                />
              </div>
              <div class="mt-1 flex justify-between gap-2 text-[0.6875rem] leading-none text-dimmed">
                <span class="truncate">{{ 줄.눈금s[0]?.label }}</span>
                <span class="truncate">{{ 줄.눈금s.at(-1)?.label }}</span>
              </div>
            </div>

            <!--
              복수: 칩. 채점 문항이면 고른 칩은 맞게 고름(초록)·잘못 고름(빨강)으로, 안 고른 정답은 점선 칩으로 뒤에 붙인다 —
              「정답: 전체」 한 줄보다 **어디서 틀렸나**가 바로 읽힌다.
            -->
            <div
              v-else-if="줄.문항.type === 'MULTI'"
              class="flex flex-wrap items-center gap-1"
            >
              <UBadge
                v-for="값 in 줄.값s"
                :key="값.value"
                :color="칩색(값.정답여부)"
                variant="soft"
                size="md"
                :title="값.is선택지밖 ? '지금 선택지에 없는 값입니다' : undefined"
                :class="{ 'line-through decoration-1': 값.is선택지밖 }"
              >
                {{ 값.label }}
              </UBadge>
              <UBadge
                v-for="라벨 in 줄.놓친정답라벨s"
                :key="`놓침-${라벨}`"
                color="neutral"
                variant="outline"
                size="md"
                class="border border-dashed border-success/60 text-muted ring-0"
                title="정답인데 고르지 않았습니다"
              >
                <UIcon
                  name="i-ph-plus-light"
                  class="size-3"
                />
                {{ 라벨 }}
              </UBadge>
            </div>

            <!-- 서술·단답: 원문 그대로 -->
            <p
              v-else-if="줄.문항.type === 'LONG' || 줄.문항.type === 'SHORT'"
              class="whitespace-pre-wrap wrap-break-word text-sm text-highlighted"
              :class="{ 'border-l-2 border-default pl-3': 줄.문항.type === 'LONG' }"
            >
              {{ 줄.값s[0]?.label }}
            </p>

            <!-- 단일·OX: 글자 한 줄 -->
            <p
              v-else
              class="font-medium text-highlighted"
              :class="줄.문항.type === 'OX' ? 'text-lg leading-6' : 'text-sm'"
            >
              {{ 줄.값s.map(x => x.label).join(', ') }}
              <span
                v-if="줄.값s.some(x => x.is선택지밖)"
                class="ml-1 text-xs font-normal text-warning"
              >지금 선택지에 없음</span>
            </p>

            <!--
              틀린 채점 문항: 정답을 바로 아래에. 정답을 모르는 역할에게는 라벨이 비어 안 뜬다.
              복수 선택은 위 칩이 이미 말했다 — 단, 아무것도 안 골랐으면 칩이 없으니 여기서 말한다.
            -->
            <p
              v-if="줄.정답여부 === false && 줄.정답라벨s.length && (줄.문항.type !== 'MULTI' || !줄.값s.length)"
              class="mt-1 text-xs text-muted"
            >
              정답 <span class="font-medium text-success">{{ 줄.정답라벨s.join(', ') }}</span>
            </p>
          </div>
        </div>
      </li>
    </ol>

    <p
      v-if="답지.떠돌이답수"
      class="mt-2 flex items-center gap-1 px-1 text-xs text-dimmed"
    >
      <UIcon
        name="i-ph-info-light"
        class="size-3.5 shrink-0"
      />
      지금 문항에 없는 답 {{ 답지.떠돌이답수 }}개가 더 저장돼 있습니다 — 신청 뒤에 지워진 문항의 답입니다.
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { i답지, i답줄 } from '~models/test2'

const props = defineProps<{ modelValue?: i답지 | null }>()

const 빈답지: i답지 = { 줄s: [], 제출일시: null, 응답수: 0, 떠돌이답수: 0 }
const 답지 = computed(() => props.modelValue ?? 빈답지)

const 누락수 = computed(() => 답지.value.줄s.filter(줄 => 줄.is누락).length)
const 채점줄s = computed(() => 답지.value.줄s.filter(줄 => 줄.정답여부 !== null))
const 맞은수 = computed(() => 채점줄s.value.filter(줄 => 줄.정답여부).length)

/** 척도에서 고른 칸이 몇 번째인가(1부터). 스크린리더 문구에만 쓴다 — 눈에는 막대가 말한다. */
const 눈금위치 = (줄: i답줄) => 줄.눈금s.findIndex(눈금 => 줄.값s.some(x => x.value === 눈금.value)) + 1

/** 복수 선택 칩 색. 채점 안 하면 중립, 채점하면 그 값이 정답에 드는지로. */
const 칩색 = (정답여부: boolean | null) => 정답여부 === null ? 'neutral' as const : 정답여부 ? 'success' as const : 'error' as const
</script>

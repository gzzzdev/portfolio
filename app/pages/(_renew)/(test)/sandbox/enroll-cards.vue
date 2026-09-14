<!--
  **신청 카드형이 왜 별로인가**의 모래밭 판.

  ## 이 판이 답하는 물음

  `view/신청받기목록.vue` 의 카드형 뷰는 강좌 소개 카드의 위계(사진 → 큰 제목 → 흐린 설명)를
  그대로 들고 왔다. 그런데 신청 화면에서 궁금한 건 「언제까지 · 자리 남았나 · 얼마」고,
  그 셋이 카드 바닥에 `xs` 회색으로 묻힌다. 사진이 붙는 건은 소수라 대부분 글자 상자다.
  물음은 — **사진이 없는 게 기본일 때, 카드 한 장의 위계를 무엇으로 세울까.**

  ## 판 읽는 법

  - 다섯 안이 **같은 표본 일곱 건**을 본다(`decisions/enrolls/_표본.ts`). 결정 기록의 표본을 읽기만
    한다 — 기록 쪽이 모래밭을 가리키면 안 되지만, 모래밭이 기록을 읽는 건 괜찮다.
  - 리포에 사진 파일이 없어서 **사진은 종류별 색 면으로 대신 칠한다.** 사진의 무게만 보는 자리다.
  - 「사진」 손잡이를 `전부 없음` ↔ `전부 있음` 으로 돌려 **사진에 기대는 안인지** 볼 것.
    지금 카드는 이 손잡이 하나로 모양이 통째로 바뀐다.
-->
<template>
  <div class="mx-auto w-full max-w-(--ui-container) px-4 py-8">
    <header class="mb-5">
      <h1 class="text-2xl font-semibold text-highlighted">
        신청 카드 다섯 안
      </h1>
      <p class="mt-1 text-sm text-muted">
        같은 표본 일곱 건 · 사진이 없는 게 기본일 때 카드 한 장을 무엇으로 세울까
      </p>
    </header>

    <div class="mb-4 flex flex-wrap items-center gap-2">
      <mButton
        v-for="안 in 안s"
        :key="안.키"
        size="sm"
        역할="조용"
        :켜짐="안키 === 안.키"
        :label="안.이름"
        @click="안키 = 안.키"
      />
      <div class="grow" />
      <span class="text-xs text-dimmed">사진</span>
      <div class="flex overflow-hidden rounded-md border border-accented">
        <button
          v-for="모드 in 사진모드s"
          :key="모드"
          type="button"
          class="px-2.5 py-1 text-xs transition-colors"
          :class="사진모드 === 모드 ? 'bg-inverted font-medium text-inverted' : 'text-muted hover:bg-elevated'"
          @click="사진모드 = 모드"
        >
          {{ 모드 }}
        </button>
      </div>
    </div>

    <div class="mb-5 rounded-lg border border-default bg-muted px-4 py-3 text-sm leading-relaxed">
      <p><span class="text-dimmed">왜 ·</span> {{ 판.왜 }}</p>
      <p class="mt-1">
        <span class="text-dimmed">대가 ·</span> {{ 판.대가 }}
      </p>
    </div>

    <div class="rounded-xl border border-default bg-default p-4 m-층-카드 sm:p-6">
      <!-- ── 0 · 지금 (실코드 카드형 그대로) ─────────────────────────── -->
      <div
        v-if="안키 === '지금'"
        class="grid items-start gap-4 sm:grid-cols-2 xl:grid-cols-3"
      >
        <article
          v-for="s in 표본"
          :key="s.id"
          class="flex flex-col overflow-hidden rounded-xl border bg-default m-층-카드"
          :class="s.남은날 === 0 ? 'border-warning' : 'border-default'"
        >
          <div
            v-if="has사진(s)"
            class="relative flex aspect-16/10 items-center justify-center border-b border-default"
            :style="사진칠(s)"
          >
            <UIcon
              :name="s.아이콘"
              class="size-12 text-white/70"
            />
          </div>
          <div class="flex grow flex-col gap-2 p-4">
            <div class="flex items-center gap-2">
              <UBadge
                size="sm"
                :color="is급함(s) ? 'warning' : 'neutral'"
                :variant="s.남은날 === 0 ? 'soft' : 'outline'"
                :label="마감라벨(s.남은날)"
              />
              <span class="flex items-center gap-1.5 text-xs text-dimmed">
                <UIcon
                  :name="s.아이콘"
                  class="size-4"
                />{{ s.종류 }}
              </span>
              <div class="grow" />
              <span
                v-if="is내신청(s.id)"
                class="text-xs text-muted"
              >✓ 신청함</span>
            </div>
            <h3 class="line-clamp-2 text-lg leading-snug font-semibold text-highlighted">
              {{ s.제목 }}
            </h3>
            <p class="line-clamp-2 text-[13px] leading-relaxed text-dimmed">
              {{ s.설명 }}
            </p>
            <div class="grow" />
            <div class="space-y-1.5 border-t border-default pt-3">
              <div class="flex items-baseline justify-between gap-2 text-xs tabular-nums">
                <span class="text-dimmed">{{ 자리문구(s) }}</span>
                <span class="font-semibold text-toned">{{ 요금라벨(s.요금) }}</span>
              </div>
              <UProgress
                v-if="s.정원"
                :model-value="찬비율(s)"
                :color="막대색(s)"
                size="sm"
              />
            </div>
          </div>
        </article>
      </div>

      <!-- ── 1 · 마감 머리 ─────────────────────────────────────────────── -->
      <div
        v-else-if="안키 === '마감머리'"
        class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
      >
        <article
          v-for="s in 표본"
          :key="s.id"
          class="flex flex-col rounded-xl border bg-default m-층-카드"
          :class="[s.남은날 === 0 ? 'border-warning' : 'border-default', is꽉참(s) ? 'opacity-70' : '']"
        >
          <div class="flex items-start gap-3 p-4 pb-3">
            <div class="min-w-0 grow">
              <div
                class="text-3xl leading-none font-semibold tracking-tight tabular-nums"
                :class="마감글자색(s)"
              >
                {{ 마감큰말(s.남은날) }}
              </div>
              <div class="mt-1 text-xs text-dimmed">
                {{ s.남은날 === null ? '마감 없음' : '신청 마감까지' }}
              </div>
            </div>
            <div
              class="flex size-14 shrink-0 items-center justify-center rounded-lg"
              :class="has사진(s) ? '' : 'bg-elevated'"
              :style="has사진(s) ? 사진칠(s) : undefined"
            >
              <UIcon
                :name="s.아이콘"
                class="size-6"
                :class="has사진(s) ? 'text-white/80' : 'text-dimmed'"
              />
            </div>
          </div>
          <div class="flex grow flex-col gap-1 px-4">
            <span class="text-xs text-dimmed">{{ s.종류 }}</span>
            <h3 class="line-clamp-2 leading-snug font-semibold text-highlighted">
              {{ s.제목 }}
            </h3>
            <p class="line-clamp-2 text-xs text-dimmed">
              {{ s.설명 }}
            </p>
          </div>
          <div class="mt-3 flex items-center gap-3 border-t border-default px-4 py-3">
            <div class="min-w-0 grow">
              <div class="text-sm tabular-nums text-toned">
                {{ 자리문구(s) }}
              </div>
              <UProgress
                v-if="s.정원"
                :model-value="찬비율(s)"
                :color="막대색(s)"
                size="xs"
                class="mt-1"
              />
            </div>
            <span class="shrink-0 text-sm font-semibold tabular-nums text-toned">{{ 요금라벨(s.요금) }}</span>
            <component
              :is="행동"
              :s="s"
            />
          </div>
        </article>
      </div>

      <!-- ── 2 · 가로 카드 ─────────────────────────────────────────────── -->
      <div
        v-else-if="안키 === '가로'"
        class="grid gap-3 lg:grid-cols-2"
      >
        <article
          v-for="s in 표본"
          :key="s.id"
          class="flex gap-4 rounded-xl border bg-default p-3 m-층-카드"
          :class="[s.남은날 === 0 ? 'border-warning' : 'border-default', is꽉참(s) ? 'opacity-70' : '']"
        >
          <div
            class="flex size-24 shrink-0 items-center justify-center rounded-lg"
            :class="has사진(s) ? '' : 'bg-elevated'"
            :style="has사진(s) ? 사진칠(s) : undefined"
          >
            <UIcon
              :name="s.아이콘"
              class="size-8"
              :class="has사진(s) ? 'text-white/80' : 'text-dimmed'"
            />
          </div>
          <div class="flex min-w-0 grow flex-col">
            <div class="flex items-baseline gap-2 text-xs">
              <span
                class="tabular-nums"
                :class="마감글자색(s)"
              >{{ 마감라벨(s.남은날) }}</span>
              <span class="text-dimmed">· {{ s.종류 }}</span>
              <div class="grow" />
              <span
                v-if="is내신청(s.id)"
                class="text-muted"
              >✓ 신청함</span>
            </div>
            <h3 class="mt-0.5 truncate font-semibold text-highlighted">
              {{ s.제목 }}
            </h3>
            <p class="truncate text-xs text-dimmed">
              {{ s.설명 }}
            </p>
            <div class="grow" />
            <div class="mt-2 flex items-center gap-3 text-sm tabular-nums">
              <span class="truncate text-toned">{{ 자리문구(s) }}</span>
              <div class="grow" />
              <span class="shrink-0 font-semibold text-toned">{{ 요금라벨(s.요금) }}</span>
              <component
                :is="행동"
                v-if="!is내신청(s.id)"
                :s="s"
              />
            </div>
          </div>
        </article>
      </div>

      <!-- ── 3 · 티켓 ──────────────────────────────────────────────────── -->
      <div
        v-else-if="안키 === '티켓'"
        class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
      >
        <article
          v-for="s in 표본"
          :key="s.id"
          class="flex flex-col rounded-xl border bg-default m-층-카드"
          :class="[s.남은날 === 0 ? 'border-warning' : 'border-default', is꽉참(s) ? 'opacity-70' : '']"
        >
          <div class="flex grow gap-3 p-4">
            <div class="min-w-0 grow">
              <div class="flex items-center gap-1.5 text-xs text-dimmed">
                <UIcon
                  :name="s.아이콘"
                  class="size-4"
                />{{ s.종류 }}
              </div>
              <h3 class="mt-1.5 line-clamp-2 text-lg leading-snug font-semibold text-highlighted">
                {{ s.제목 }}
              </h3>
              <p class="mt-1 line-clamp-2 text-xs text-dimmed">
                {{ s.설명 }}
              </p>
            </div>
            <div
              v-if="has사진(s)"
              class="size-16 shrink-0 rounded-lg"
              :style="사진칠(s)"
            />
          </div>
          <!-- 절취선. 위가 「무엇」, 아래가 「조건」이다. -->
          <div class="relative border-t border-dashed border-accented">
            <span class="absolute -top-2 -left-2 size-4 rounded-full border border-default bg-default" />
            <span class="absolute -top-2 -right-2 size-4 rounded-full border border-default bg-default" />
          </div>
          <div class="grid grid-cols-3 divide-x divide-default px-1 py-3 text-center">
            <div>
              <div class="text-[11px] text-dimmed">
                마감
              </div>
              <div
                class="mt-0.5 font-semibold tabular-nums"
                :class="마감글자색(s)"
              >
                {{ 마감큰말(s.남은날) }}
              </div>
            </div>
            <div>
              <div class="text-[11px] text-dimmed">
                자리
              </div>
              <div
                class="mt-0.5 font-semibold tabular-nums"
                :class="is꽉참(s) ? 'text-dimmed' : 'text-toned'"
              >
                {{ 자리짧은말(s) }}
              </div>
            </div>
            <div>
              <div class="text-[11px] text-dimmed">
                요금
              </div>
              <div class="mt-0.5 font-semibold tabular-nums text-toned">
                {{ 요금라벨(s.요금) }}
              </div>
            </div>
          </div>
          <div class="px-4 pb-4">
            <component
              :is="행동"
              :s="s"
              block
            />
          </div>
        </article>
      </div>

      <!-- ── 4 · 사진 있는 것만 카드 ──────────────────────────────────── -->
      <div v-else>
        <div
          v-if="사진있는s.length"
          class="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
        >
          <article
            v-for="s in 사진있는s"
            :key="s.id"
            class="relative flex aspect-4/3 flex-col justify-end overflow-hidden rounded-xl m-층-카드"
            :style="사진칠(s)"
          >
            <UIcon
              :name="s.아이콘"
              class="absolute top-4 right-4 size-10 text-white/40"
            />
            <div class="bg-linear-to-t from-black/70 to-transparent p-4 pt-12 text-white">
              <div class="flex items-center gap-2 text-xs">
                <span
                  class="rounded px-1.5 py-0.5 font-semibold tabular-nums"
                  :class="is급함(s) ? 'bg-warning text-inverted' : 'bg-white/20'"
                >{{ 마감라벨(s.남은날) }}</span>
                <span class="text-white/70">{{ s.종류 }}</span>
              </div>
              <h3 class="mt-1.5 text-xl leading-snug font-semibold">
                {{ s.제목 }}
              </h3>
              <div class="mt-2 flex items-center gap-3 text-sm tabular-nums text-white/85">
                <span>{{ 자리문구(s) }} · {{ 요금라벨(s.요금) }}</span>
                <div class="grow" />
                <!-- 사진 위라 버튼 아닌 글자는 흰 글자로 따로 쓴다. -->
                <span
                  v-if="is내신청(s.id) || is꽉참(s)"
                  class="shrink-0 text-sm font-medium text-white"
                >{{ is내신청(s.id) ? '✓ 신청함' : '정원 마감' }}</span>
                <component
                  :is="행동"
                  v-else
                  :s="s"
                />
              </div>
            </div>
          </article>
        </div>
        <div
          v-for="s in 사진없는s"
          :key="s.id"
          class="grid grid-cols-[4.5rem_minmax(0,1fr)_auto_auto] items-center gap-4 border-b border-default px-3 py-3"
        >
          <span
            class="tabular-nums"
            :class="마감글자색(s)"
          >{{ 마감라벨(s.남은날) }}</span>
          <div class="min-w-0">
            <div class="truncate font-medium text-highlighted">
              {{ s.제목 }}
            </div>
            <div class="truncate text-xs text-dimmed">
              {{ s.종류 }} · {{ s.설명 }}
            </div>
          </div>
          <span class="text-sm tabular-nums text-toned max-sm:hidden">{{ 자리문구(s) }} · {{ 요금라벨(s.요금) }}</span>
          <component
            :is="행동"
            :s="s"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, ref, resolveComponent } from 'vue'
import {
  표본신청받기s, is내신청, 마감라벨, 남은자리, 요금라벨,
  type i표본신청받기
} from '../../../decisions/enrolls/_표본'

definePageMeta({
  제목: '신청 카드 다섯 안',
  설명: '사진이 없는 게 기본일 때 신청 카드의 위계. 지금 카드 · 마감 머리 · 가로 · 티켓 · 사진 있는 것만 카드.',
  상태: '대기',
  쓰는곳: 'view/신청받기목록.vue 의 카드형 뷰'
})

type i안키 = '지금' | '마감머리' | '가로' | '티켓' | '사진만'

const 안s: { 키: i안키, 이름: string, 왜: string, 대가: string }[] = [
  {
    키: '지금',
    이름: '0 · 지금',
    왜: '실코드 카드형 그대로. 제일 큰 글자는 제목, 마감은 작은 테두리 배지, 자리·요금은 바닥 xs 회색, 신청 버튼은 없다.',
    대가: '사진 손잡이를 돌리면 카드 높이가 130px 넘게 들쭉날쭉하고(items-start), 사진이 없으면 강좌 카드에서 사진만 뺀 글자 상자가 된다.'
  },
  {
    키: '마감머리',
    이름: '1 · 마감 머리',
    왜: '사진 자리를 마감이 차지한다. 목록형이 마감을 맨 왼쪽 열에 둔 것을 카드로 옮기면 「맨 위」다. 사진은 오른쪽 56px 썸네일로 줄여 있어도 없어도 높이가 같다.',
    대가: '그림이 파는 행사·수업도 사진이 작다. 홍보 힘이 필요한 건은 이 안에서 약하다.'
  },
  {
    키: '가로',
    이름: '2 · 가로 카드',
    왜: '행과 카드의 중간. 96px 칸 하나가 사진이든 아이콘이든 같은 자리를 채워서 격자가 안 깨지고, 2열이라 일곱 건이 한 화면에 든다.',
    대가: '설명이 한 줄로 잘린다. 목록형과 너무 닮아서 「뷰 전환」을 둘 이유가 흐려진다.'
  },
  {
    키: '티켓',
    이름: '3 · 티켓',
    왜: '절취선 위가 「무엇」, 아래가 「조건」(마감 · 자리 · 요금)이다. 조건 셋을 같은 크기의 칸으로 세워서 바닥에 묻히지 않고, 버튼이 카드마다 있다.',
    대가: '카드 한 장이 커진다(버튼 줄). 칸 셋이 늘 같은 자리라 「제한 없음」「상시」 같은 빈 값도 칸을 차지한다.'
  },
  {
    키: '사진만',
    이름: '4 · 사진 있는 것만 카드',
    왜: '카드가 이기는 건 사진 있는 행사뿐이라는 원래 결론을 한 화면에 섞는다. 사진 있는 건만 크게 위에, 나머지는 목록형 행으로 아래에. 뷰 전환이 필요 없어진다.',
    대가: '사진을 붙였느냐가 곧 노출 순위가 된다(마감 정렬보다 먼저). 사진이 없는 날은 그냥 목록형이다.'
  }
]

const 안키 = ref<i안키>('지금')
const 판 = computed(() => 안s.find(안 => 안.키 === 안키.value)!)

const 사진모드s = ['표본대로', '전부 없음', '전부 있음'] as const
const 사진모드 = ref<(typeof 사진모드s)[number]>('표본대로')

const has사진 = (s: i표본신청받기) =>
  (사진모드.value === '표본대로' ? s.is사진 : 사진모드.value === '전부 있음')

/** 실코드 정렬과 같다 — 마감 임박순, 상시는 맨 뒤. */
const 표본 = [...표본신청받기s].sort((a, b) => (a.남은날 ?? 9999) - (b.남은날 ?? 9999))
const 사진있는s = computed(() => 표본.filter(has사진))
const 사진없는s = computed(() => 표본.filter(s => !has사진(s)))

/** 사진 대신 칠하는 면. 종류마다 색만 다르다 — 사진의 **무게**만 보는 자리다. */
const 색상각: Record<i표본신청받기['종류'], number> = { 수업: 255, 행사: 25, 설문: 160, 퀴즈: 300, 투표: 85 }
const 사진칠 = (s: i표본신청받기) => {
  const 각 = 색상각[s.종류]
  return { background: `linear-gradient(135deg, oklch(0.72 0.1 ${각}), oklch(0.45 0.12 ${각 + 40}))` }
}

/** 실코드 규칙 — 색은 급할 때만(D-3 이하). */
const is급함 = (s: i표본신청받기) => s.남은날 !== null && s.남은날 <= 3
const is꽉참 = (s: i표본신청받기) => 남은자리(s) === 0

const 마감큰말 = (남은날: number | null) => (남은날 === null ? '상시' : 남은날 === 0 ? '오늘' : `D-${남은날}`)
const 마감글자색 = (s: i표본신청받기) =>
  (s.남은날 === null ? 'text-dimmed' : is급함(s) ? 'font-semibold text-warning' : 'text-toned')

const 찬비율 = (s: i표본신청받기) => (s.정원 ? Math.min(100, Math.round((s.신청수 / s.정원) * 100)) : 0)
const 막대색 = (s: i표본신청받기) => {
  const 비율 = 찬비율(s)
  if (비율 >= 100) return 'error' as const
  return 비율 >= 80 ? ('warning' as const) : ('primary' as const)
}

const 자리문구 = (s: i표본신청받기) => {
  const 남은 = 남은자리(s)
  if (남은 === null) return `${s.신청수}명 신청`
  return 남은 ? `${s.신청수}/${s.정원} · ${남은}자리` : '정원 마감'
}
const 자리짧은말 = (s: i표본신청받기) => {
  const 남은 = 남은자리(s)
  return 남은 === null ? '제한 없음' : 남은 ? `${남은}자리` : '마감'
}

/** 오른쪽 끝 행동 하나. 안 넷이 같은 위젯을 쓴다 — 버튼 모양이 달라 보이는 걸 안 차이로 착각하지 않게. */
const 행동 = defineComponent({
  props: { s: { type: Object as () => i표본신청받기, required: true }, block: Boolean },
  setup(props) {
    const mButton = resolveComponent('mButton')
    return () => {
      if (is내신청(props.s.id))
        return h('span', { class: ['shrink-0 text-sm text-muted', props.block ? 'block text-center' : ''] }, '✓ 신청함')
      if (is꽉참(props.s))
        return h(mButton, { size: 'xs', 역할: '조용', disabled: true, block: props.block, label: '정원 마감' })
      return h(mButton, { size: 'xs', block: props.block, label: '신청', onClick: (e: Event) => e.stopPropagation() })
    }
  }
})
</script>

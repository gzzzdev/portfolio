<!--
  방문자가 보는 신청받기 상세. 읽는 것(소개·문항)이 왼쪽, 결정하는 것(요약·신청·결제)이 오른쪽 레일.

  ## 첫 화면을 무엇이 먹나 (2026-09-05)

  판 셋을 나란히 깔고 「2단 정돈」을 골랐다(`/decisions/enrolls/detail` · 기록은 `/decisions` 의 `신청-상세`).

  - **레일은 남는다.** 본문 길이와 무관하게 결정 자리가 늘 보이는 것이 이 화면이 산 값이다.
    동시에 레일이 오른쪽을 채워서, 본문이 짧아도 화면이 반쪽으로 안 보인다.
  - **히어로는 띠가 아니라 줄이다** — 224~288px 를 72px 로. 그리고 **사진이 없으면 줄째 없앤다.**
    사진이 붙는 신청받기가 소수라 그 자리가 대개 아이콘 하나 세운 회색 네모였고, 회색 네모는 아무것도 안 판다.
  - **하단 sticky 제출 바를 지웠다.** 제출은 응답지 안 끝이다 — 행동하는 자리가 셋
    (레일 버튼 · 하단 바 · 얼럿)으로 흩어져 있었다.

  ## 대가 (알고 산 것)

  **문항이 스무 개면 제출 버튼을 찾아 끝까지 내려가야 한다.** 지운 sticky 바가 풀던 문제가
  그대로 돌아온다 — 문항 수가 많은 퀴즈에서 한 번 재 보고, 아프면 그 바를 되살리는 게 맞다
  (되살릴 때는 「행동 자리 셋」이 다시 생기지 않는지 같이 볼 것).

  진 안 둘: 「응답지 먼저」는 팔아야 하는 신청받기(행사·수업)에서 소개가 접힌 채 시작해서,
  「단계」는 문항 없는 신청받기에서 3단계가 과장이라 졌다.
-->
<template>
  <div class="mx-auto w-full max-w-(--ui-container) p-3 sm:p-6">
    <!--
      비회원도 여기까지는 본다 — 목록 카드가 이리로 보내고, 소개·일정·정원은 신청 전에 읽을 것이다.
      로그인은 **보기**가 아니라 **신청**의 조건이라, 막는 자리는 페이지 머리가 아니라 레일의 버튼이다.
    -->
    <UAlert
      v-if="!신청받기"
      title="신청받기를 찾을 수 없습니다"
      :description="`요청한 신청받기(${ID})이 없거나 아직 불러오지 못했습니다.`"
    />

    <template v-else>
      <!--
        머리말. **띠가 아니라 줄이고, 사진이 없으면 줄째 없다.**

        예전엔 높이 224~288px 짜리 오버레이 띠였다(비율 대신 높이로 묶어 폭을 따라 안 자라게 해 뒀다).
        그래도 첫 화면의 절반을 먹었고, 사진이 붙는 신청받기가 소수라 그 자리가 대개 회색 네모였다.
        그림이 있는 신청받기에서는 여전히 그림이 먼저 보이고, 없으면 제목 한 줄로 시작한다.
      -->
      <header
        v-if="이미지"
        class="flex items-center gap-4 rounded-xl border border-default bg-default p-3 m-층-카드"
      >
        <!--
          `sizes` 와 `format` 은 겉보기와 달리 CSS 가 아니라 **@nuxt/image 문법**이다. 여기 둘 다 무효였다.
          `sizes="14rem"` → `parseSizes` 가 `{'1px':'14rem'}` 로 읽고, `getSizesVariant` 는 `px`·`vw` 로
          안 끝나는 값에 `undefined` 를 돌려준다. 그러면 변형 목록이 통째로 비어 **`src` 자체가 안 나오고**,
          브라우저는 `<img src="">` 를 깨진 그림으로 그린다 — 그림이 없어서가 아니라 주소가 없어서였다.
          `format="avif,webp"` 는 `<NuxtPicture>` 의 문법이다. `<NuxtImg>` 는 포맷 하나만 받는다.
          `width`·`height` 가 이미 있으니 `sizes` 는 필요 없다 — densities(1x·2x)가 224·448 을 만든다.
        -->
        <NuxtImg
          :src="이미지"
          :alt="제목"
          class="h-18 w-28 shrink-0 rounded-md object-cover"
          width="224"
          height="144"
          format="webp"
          quality="82"
        />
        <div class="min-w-0">
          <div class="flex items-center gap-1.5 text-xs font-medium text-muted">
            <UIcon
              :name="종류아이콘"
              class="size-4 shrink-0"
            />
            <span>{{ 대상종류라벨 }}</span>
          </div>
          <h1
            v-if="!is히어로제목"
            class="mt-0.5 truncate text-xl font-bold tracking-tight text-highlighted sm:text-2xl"
          >
            {{ 제목 }}
          </h1>
          <p
            v-if="요약"
            class="mt-0.5 line-clamp-1 text-sm text-muted"
          >
            {{ 요약 }}
          </p>
        </div>
        <div class="grow" />
        <div class="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
          <UBadge
            :color="신청받기.is신청받는중 ? 'success' : undefined"
            size="sm"
          >
            {{ 신청받기.is신청받는중 ? '신청받는 중' : '마감' }}
          </UBadge>
          <!-- 마감이 코앞인 것만 한 번 더 말한다. 여유로운 D-30은 옆 레일이 이미 말했다. -->
          <UBadge
            v-if="임박라벨"
            color="warning"
            size="sm"
          >
            {{ 임박라벨 }}
          </UBadge>
        </div>
      </header>

      <!-- 사진이 없으면 제목 줄이 전부다. 자리표시자를 세우지 않는다. -->
      <header
        v-else
        class="flex flex-wrap items-baseline gap-x-3 gap-y-1"
      >
        <span class="flex items-center gap-1.5 text-xs font-medium text-muted">
          <UIcon
            :name="종류아이콘"
            class="size-4 shrink-0"
          />
          {{ 대상종류라벨 }}
        </span>
        <h1
          v-if="!is히어로제목"
          class="text-xl font-bold tracking-tight text-highlighted sm:text-2xl"
        >
          {{ 제목 }}
        </h1>
        <UBadge
          :color="신청받기.is신청받는중 ? 'success' : undefined"
          size="sm"
        >
          {{ 신청받기.is신청받는중 ? '신청받는 중' : '마감' }}
        </UBadge>
        <UBadge
          v-if="임박라벨"
          color="warning"
          size="sm"
        >
          {{ 임박라벨 }}
        </UBadge>
        <p
          v-if="요약"
          class="w-full text-sm text-muted"
        >
          {{ 요약 }}
        </p>
      </header>

      <div
        class="mt-6 grid gap-6"
        :class="is좌측있음 ? 'lg:grid-cols-[minmax(0,1fr)_19rem]' : 'mx-auto w-full max-w-md'"
      >
        <!-- ── 왼쪽: 읽는 것 · 쓰는 것 ────────────────────────────────────── -->
        <div
          v-if="is좌측있음"
          class="min-w-0 space-y-6"
        >
          <!--
            본문. **카드를 안 두른다** — 산문에 테두리를 치면 아래 문항 상자와 같은 무게가 되어
            '읽는 것'과 '쓰는 것'이 안 갈린다. 본문은 md 로 저장되고, 어휘는 `~utils/mdc/blocks` 가,
            어떻게 보이는지는 테마 축이 정한다.

            **이 자리가 편집기의 대조 상대다.** 쓰는 쪽(`mEditor` — 폼에서는 `Input본문` → `mEditorMd` 를 거친다)은
            읽기 컴포넌트를 그대로 노드뷰로 입어서, 여기 그림과 픽셀로 같아야 한다.
            아는 차이 셋은 `m/Editor/Editor.vue` 머리말에 있다. 그 밖의 차이가 보이면 버그다.
          -->
          <article
            v-if="본문"
            class="m-본문"
          >
            <ClientOnly>
              <MDC :value="본문" />
            </ClientOnly>
          </article>

          <UAlert
            v-if="신청 && !문항s.length"
            title="답할 문항이 없습니다"
            description="신청만으로 접수가 완료됩니다."
          />

          <!--
            문항. 예전엔 문항마다 `UCard` 라 열 문제면 똑같은 상자 열 개가 쌓였다.
            상자는 하나고 문항은 구분선으로 나눈다 — 한 벌의 응답지로 읽힌다.
          -->
          <section
            v-if="신청 && 문항s.length"
            class="overflow-hidden rounded-xl border border-default bg-default m-층-카드"
          >
            <header class="flex items-center gap-2 border-b border-default px-5 py-3.5">
              <h2 class="text-sm font-semibold text-highlighted">
                문항 {{ 문항s.length }}개
              </h2>
              <span class="grow" />
              <span class="text-xs text-muted tabular-nums">
                {{ 신청.응답수 }} / {{ 문항s.length }} 응답
              </span>
            </header>

            <div class="divide-y divide-default">
              <div
                v-for="(문항, i) in 문항s"
                :key="문항.id"
                class="px-5 py-5"
              >
                <div class="flex items-start gap-2.5">
                  <span class="mt-0.5 w-5 shrink-0 text-sm font-semibold text-dimmed tabular-nums">{{ i + 1 }}</span>
                  <div class="min-w-0 flex-1 space-y-3">
                    <div>
                      <p class="font-medium text-highlighted">
                        {{ 문항.label }}
                      </p>
                      <div
                        v-if="문항.isRequired || 배점표시(문항)"
                        class="mt-1.5 flex flex-wrap items-center gap-1"
                      >
                        <UBadge
                          v-if="문항.isRequired"
                          :color="is누락(문항) ? 'error' : undefined"
                          :variant="is누락(문항) ? 'solid' : 'soft'"
                          size="xs"
                        >
                          {{ is누락(문항) ? '필수 · 미응답' : '필수' }}
                        </UBadge>
                        <UBadge
                          v-if="배점표시(문항)"
                          color="info"
                          size="xs"
                        >
                          {{ 문항.score }}점
                        </UBadge>
                      </div>
                    </div>

                    <div class="space-y-2">
                      <!-- 단일 선택: SINGLE · OX · SCALE -->
                      <URadioGroup
                        v-if="is단일선택(문항)"
                        :model-value="답Of(문항)[0] ?? ''"
                        :items="선택지items(문항)"
                        value-key="value"
                        @update:model-value="(v: any) => set답(문항, v ? [String(v)] : [])"
                      />

                      <!-- 복수 선택: MULTI -->
                      <div
                        v-else-if="문항.type === 'MULTI'"
                        class="space-y-1.5"
                      >
                        <UCheckbox
                          v-for="선택지 in 문항.options"
                          :key="선택지.value"
                          :label="선택지.label"
                          :model-value="답Of(문항).includes(선택지.value)"
                          @update:model-value="(v: any) => toggle복수답(문항, 선택지.value, !!v)"
                        />
                      </div>

                      <!-- 자유입력: SHORT · LONG -->
                      <UTextarea
                        v-else-if="문항.type === 'LONG'"
                        :rows="4"
                        class="w-full"
                        :model-value="답Of(문항)[0] ?? ''"
                        @update:model-value="(v: any) => set답(문항, String(v ?? '').trim() ? [String(v)] : [])"
                      />
                      <UInput
                        v-else
                        class="w-full"
                        :model-value="답Of(문항)[0] ?? ''"
                        @update:model-value="(v: any) => set답(문항, String(v ?? '').trim() ? [String(v)] : [])"
                      />

                      <!-- 채점 결과는 제출 뒤에만. 정답 문구는 정답을 아는 역할(관리자·담당자)에게만 붙는다. -->
                      <p
                        v-if="is채점공개 && 정답여부(문항) !== null"
                        class="text-sm"
                        :class="정답여부(문항) ? 'text-success' : 'text-error'"
                      >
                        {{ 정답여부(문항) ? '정답'
                          : 문항정답라벨s(문항).length ? `오답 · 정답은 ${문항정답라벨s(문항).join(', ')}` : '오답' }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!--
              제출은 **응답지 안 끝**이다. 예전엔 화면 바닥에 붙는 sticky 바였는데, 그 바 때문에
              행동하는 자리가 셋(레일 버튼 · 하단 바 · 얼럿)으로 흩어져 있었다.
              대가는 위 머리말에 적어 뒀다 — 문항이 길면 여기까지 다시 내려와야 한다.
            -->
            <div class="flex flex-wrap items-center gap-2 border-t border-default px-5 py-4">
              <p class="text-sm text-muted tabular-nums">
                {{ 신청.응답수 }} / {{ 문항s.length }} 응답
                <!-- 버튼이 왜 안 눌리는지 그 자리에서 말한다. 조용히 비활성이면 '눌러도 안 넘어간다'가 된다. -->
                <span
                  v-if="제출불가사유"
                  class="text-dimmed"
                > · {{ 제출불가사유 }}</span>
              </p>
              <div class="grow" />
              <mButton
                역할="강조"
                :loading="ing"
                :disabled="!!제출불가사유"
                :label="신청.is제출됨 ? '다시 제출' : '제출'"
                @click="do제출"
              />
            </div>
          </section>

          <UAlert
            v-if="is채점공개"
            color="info"
            :title="`${신청!.점수} / ${신청!.만점}점`"
            :description="합격문구"
          />
          <UAlert
            v-else-if="신청?.is제출됨 && 문항s.length"
            color="success"
            title="제출했습니다"
            :description="`${신청.응답수}개 문항에 답했습니다. 고쳐서 다시 제출할 수 있습니다.`"
          />
        </div>

        <!-- ── 오른쪽: 결정하는 자리 ─────────────────────────────────────── -->
        <!--
          신청 패널을 옆으로 뺀 이유는 **길이와 무관하게 늘 보여야** 하기 때문이다.
          본문 아래에 두면 긴 글에서는 스크롤 끝까지 가야 신청 버튼을 만난다.
          동시에 이 레일이 오른쪽을 채워서, 본문이 짧아도 화면이 반쪽으로 안 보인다.
        -->
        <aside class="lg:sticky lg:top-4 lg:self-start">
          <div class="overflow-hidden rounded-xl border border-default bg-default m-층-카드">
            <!--
              요약 타일. 폭을 가로질러 네 칸으로 눕혀 뒀더니 **아래 신청 패널과 같은 말을 두 번** 했다
              (일시도 요금도 두 번 적혔다). 레일로 옮기면서 그 두 벌을 한 벌로 합쳤다 —
              여기가 이 화면에서 값을 말하는 **유일한** 자리다.

              값은 모델이 만든다(`model신청받기._요약s`). 회원 관리판을 '편집 폼'이 아니라 '관리판'으로
              만드는 그 규약과 같은 것이고, 그래서 관리자 콘텐츠 상세의 「신청받기」 카드에도 같은 넷이 뜬다.
            -->
            <dl
              v-if="요약타일s.length"
              class="divide-y divide-default"
            >
              <div
                v-for="타일 in 요약타일s"
                :key="타일.label"
                class="flex items-baseline gap-3 px-4 py-3"
              >
                <dt class="flex shrink-0 items-center gap-1.5 whitespace-nowrap text-xs text-dimmed">
                  <UIcon
                    v-if="타일.icon"
                    :name="타일.icon"
                    class="size-3.5 shrink-0"
                  />
                  {{ 타일.label }}
                </dt>
                <dd class="min-w-0 flex-1 text-right">
                  <div
                    class="truncate text-base leading-tight font-semibold tabular-nums"
                    :class="타일색(타일.color)"
                  >
                    {{ 타일.value }}
                  </div>
                  <div
                    v-if="타일.sub"
                    class="mt-0.5 truncate text-[0.625rem] leading-none text-dimmed"
                  >
                    {{ 타일.sub }}
                  </div>
                </dd>
              </div>
            </dl>

            <!--
              정원 막대. 숫자는 바로 위 「남은 자리」 칸이 이미 말했으니 여기서 다시 안 적는다 —
              막대가 보태는 건 글자가 못 하는 것 하나, **얼마나 찼는지 한눈에**다.

              그래서 **아무도 신청 안 했으면 안 띄운다.** 빈 막대는 그 하나를 못 하고, 회색 줄이
              구분선 부스러기처럼 보인다(목록 카드가 `0명 신청`을 안 세우는 것과 같은 이유).
            -->
            <div
              v-if="신청받기.정원 > 0 && 신청받기.신청수 > 0"
              class="border-t border-default px-4 py-3"
            >
              <UProgress
                :model-value="정원비율"
                :color="막대색"
                size="sm"
              />
            </div>

            <!-- 이미 온 사람들. 빈 화면을 채우려는 장식이 아니라, 신청 전에 제일 궁금한 값이다. -->
            <div
              v-if="신청자s.length"
              class="flex items-center gap-2 border-t border-default px-4 py-3"
            >
              <div class="flex -space-x-2">
                <UAvatar
                  v-for="사람 in 신청자s.slice(0, 5)"
                  :key="사람.id"
                  :src="사람.이미지 ?? undefined"
                  :alt="사람.이름"
                  :text="사람.이름.slice(0, 1)"
                  size="xs"
                  class="ring-2 ring-default"
                />
              </div>
              <span class="min-w-0 truncate text-xs text-muted">
                {{ 신청자s[0]!.이름 }}<template v-if="신청자s.length > 1"> 외 {{ 신청자s.length - 1 }}명</template> 신청
              </span>
            </div>

            <div class="space-y-2 border-t border-default p-4">
              <UAlert
                v-if="신청받기.신청불가사유 && !신청"
                color="warning"
                :title="신청받기.신청불가사유"
              />

              <mButton
                v-if="!신청 && is바로신청"
                역할="강조"
                block
                size="lg"
                :disabled="!!신청받기.신청불가사유 || ing"
                :loading="ing"
                label="신청하기"
                @click="do신청하기"
              />

              <!--
                신원이 없거나(방문자), 비회원 세션인데 이 회차가 회원만 받을 때. 같은 자리에 같은 무게로
                모달을 연다 — 비회원을 받는 회차면 그 안에 비회원 칸이 같이 뜬다.
                마감이면 로그인해 봐야 못 하니 같이 막는다.
              -->
              <mButton
                v-else-if="!신청"
                역할="강조"
                block
                size="lg"
                :disabled="!!신청받기.신청불가사유 || ing"
                :loading="ing"
                :label="is비회원칸 ? '신청하기' : '로그인하고 신청하기'"
                @click="is로그인모달 = true"
              />

              <template v-else>
                <div class="flex flex-wrap items-center gap-1.5">
                  <UBadge>{{ 신청상태라벨 }}</UBadge>
                  <UBadge
                    v-if="!신청받기.is무료"
                    :color="신청.결제상태 === 'UNSUBSCRIBED' ? 'warning' : 'success'"
                  >
                    {{ 신청.결제상태 === 'UNSUBSCRIBED' ? '미납부' : '결제완료' }}
                  </UBadge>
                </div>
                <mButton
                  v-if="!신청받기.is무료 && 신청.결제상태 === 'UNSUBSCRIBED'"
                  역할="강조"
                  block
                  label="결제하기"
                  @click="신청!.do결제()"
                />
              </template>
            </div>
          </div>
        </aside>
      </div>
    </template>

    <m로그인모달
      v-if="!is로그인"
      v-model:open="is로그인모달"
      :제목="is비회원칸 ? '신청하기' : '로그인'"
      :설명="is비회원칸 ? '로그인하거나 비회원으로 신청하세요.' : '회원만 신청할 수 있습니다. 로그인하면 이 화면으로 돌아옵니다.'"
      :비회원신청="is비회원칸"
      @비회원신청="do비회원신청"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, toValue, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useMyAuthStore } from '~/stores/useMyAuthStore'
import { useHeroPageTitle, useIsHeroTitle } from '~/composables/useLayoutHero'
import {
  model신청받기s, model신청s, model회원s,
  model퀴즈s, 신청받기대상표, do신청세트읽기, 문항정답라벨s,
  type i문항
} from '~models/test2'

const ID = String(useRoute().params.id ?? '')
const { isLoggedIn: is로그인, 회원Id } = storeToRefs(useMyAuthStore())
const ing = ref(false)

const is로그인모달 = ref(false)

// 조인이 클라에서 일어나므로 화면이 쓰는 목록을 통째로 받아 둔다.
// 비회원 몫은 권한 밖 표가 빠진다(`do신청세트읽기` 머리말) — 받은 만큼으로 그린다.
try {
  await do신청세트읽기(is로그인.value)
} catch { /* 못 찾으면 위 안내 배너가 말한다 */ }

/**
 * 이 화면에서 로그인하면 **다시 읽는다.** 클릭로그인은 `do전체repo초기화` 로 목록을 비우고 새로고침 없이
 * 돌아오므로, 안 읽으면 비회원 몫(공개 필드만)이 비워진 채 남아 내 신청을 못 찾는다.
 * 소셜 로그인은 provider 를 거쳐 이 주소로 새 문서가 뜨니 여기를 안 탄다.
 */
watch(is로그인, async (v) => {
  if (!v) return
  is로그인모달.value = false
  try {
    await do신청세트읽기(true)
  } catch { /* 위와 같다 */ }
})

const 회원 = computed(() => model회원s.getInstance().getById(toValue(회원Id)) ?? null)
const 신청받기 = computed(() => model신청받기s.getInstance().getById(ID) ?? null)

/**
 * **비회원을 받는 회차인가** — 관리자가 켠 `is비회원허용` 이고 **무료**일 때만.
 * 유료를 빼는 이유: guest 역할에 결제 권한(`payments:*`)이 없어 비회원은 결제 상태를 못 읽는다 —
 * 결제하고도 「미납부」로 보인다. 비회원 결제를 열 때 이 조건을 같이 푼다.
 */
const is비회원받음 = computed(() => !!신청받기.value?.is비회원허용 && !!신청받기.value?.is무료)

/** 모달에 비회원 칸을 띄우나. 이미 비회원 세션이면 신원이 있으니 칸이 필요 없다(바로 신청). */
const is비회원칸 = computed(() => is비회원받음.value && !회원Id.value)

/** 모달 없이 이 자리에서 신청하나 — 회원이거나, 비회원 세션이 비회원 받는 회차에 온 것. */
const is바로신청 = computed(() => !!회원.value && (is로그인.value || is비회원받음.value))

/**
 * 비회원으로 신청. 신원(익명 로그인) → 목록 다시 읽기 → 신청 순서다.
 * 다시 읽어야 방금 생긴 회원 행이 repo 에 들어와 `회원` 이 풀린다.
 * 회차가 비회원을 안 받으면 DB 트리거가 거절한다(`enrolls.sql` 5절) — 화면 조건과 같은 판정의 뒤를 받친다.
 */
const do비회원신청 = async (입력: { 이름: string, 연락처: string }) => {
  // `await` 뒤에서 부르면 컴포넌트 문맥이 끊겨 inject 경고가 난다 — 먼저 잡아 둔다.
  const alert = useAlert()
  ing.value = true
  try {
    await useMyAuthStore().login비회원(입력)
    await do신청세트읽기(false)
    is로그인모달.value = false
    const m = 회원.value, r = 신청받기.value
    if (m && r) await model신청s.getInstance().do신청(r, m)
  } catch (error: unknown) {
    const e = error as { message?: string }
    // 이 문구는 방문자가 읽는다. 설정 문제는 방문자가 풀 수 없으니 "운영자에게"로 말하고, 원문은 콘솔에 남긴다.
    const is설정꺼짐 = /anonymous sign-ins are disabled/i.test(e?.message ?? '')
    if (is설정꺼짐) console.error('[비회원 신청] Supabase 대시보드에서 Allow anonymous sign-ins 를 켜야 합니다.', error)
    alert.error('비회원 신청 실패', is설정꺼짐
      ? '지금은 비회원 신청을 받을 수 없습니다. 로그인해서 신청하거나 운영자에게 문의해주세요.'
      : e?.message ?? '알 수 없는 오류')
  } finally { ing.value = false }
}
const 대상종류라벨 = computed(() => (신청받기.value ? 신청받기대상표[신청받기.value.대상표]?.label ?? '' : ''))
const 문항s = computed(() => 신청받기.value?.문항s ?? [])

// ─────────────────────────────────────────────────────────────────────────────
// 머리말 — 목록 카드가 쓰던 값들을 상세도 그대로 쓴다
// ─────────────────────────────────────────────────────────────────────────────

const 제목 = computed(() => 신청받기.value?.대상?.label ?? 신청받기.value?.label ?? '')
/** 공식 레이아웃에선 제목이 히어로로 올라가고, 여기 제목 줄은 빠진다(`useHeroPageTitle`). 다른 레이아웃에선 그대로 선다. */
useHeroPageTitle(제목)
const is히어로제목 = useIsHeroTitle(제목)
/** 대상이 든 아이콘이 먼저다. 종류 아이콘은 대상이 자기 것을 안 줄 때만. */
const 종류아이콘 = computed(() =>
  신청받기.value?.대상?.icon || 신청받기대상표[신청받기.value?.대상표 ?? 'surveys']?.icon || 'i-ph-megaphone-light')
/** 한 줄 요약(`설명`). 본문과 다른 칸이고, 목록 카드가 두 줄로 자르는 그 값이다. */
const 요약 = computed(() => 신청받기.value?.대상?.설명 ?? '')
/** 콘텐츠의 md 본문. 신청받기가 아니라 대상(설문·수업·행사…)이 든다 — 차수가 갈려도 글은 하나다. */
const 본문 = computed(() => 신청받기.value?.대상?.본문 ?? '')
/** 목록 카드가 16:10으로 쓰는 그 썸네일. 상세가 안 읽던 값이다. */
const 이미지 = computed(() => 신청받기.value?.대상?.이미지 || null)

/**
 * 마감이 코앞일 때만 뜨는 배지 문구. 여유로운 `D-30`은 아래 요약 타일이 이미 말했으니
 * 히어로까지 쓰면 같은 값을 두 번 적는 게 된다 — 그 중복이 목록 카드를 시끄럽게 만든 원인이었다.
 */
const 임박라벨 = computed(() => {
  const 남은 = 신청받기.value?.남은날
  if (남은 == null || 남은 > 3) return ''
  return 남은 <= 0 ? '오늘 마감' : `D-${남은}`
})

/** 타일은 모델이 만든다(`model신청받기._요약s`) — 화면은 그리기만 한다. */
const 요약타일s = computed(() => 신청받기.value?.요약s ?? [])

/** 색은 정적 표로. 동적 클래스는 Tailwind가 못 훑는다 (`상세5.vue`와 같은 처방). */
const 타일색 = (color?: string) => ({
  primary: 'text-primary',
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-error',
  info: 'text-info'
}[color ?? ''] ?? 'text-highlighted')

// ─────────────────────────────────────────────────────────────────────────────
// 신청 패널
// ─────────────────────────────────────────────────────────────────────────────

const 정원비율 = computed(() => {
  const r = 신청받기.value
  if (!r || r.정원 <= 0) return 0
  return Math.min(100, Math.round((r.신청수 / r.정원) * 100))
})

const 막대색 = computed(() => {
  if (정원비율.value >= 100) return 'error' as const
  return 정원비율.value >= 80 ? ('warning' as const) : ('primary' as const)
})

/**
 * 이미 신청한 사람들. 취소된 신청은 자리를 안 차지하므로 `유효신청s` 기준이다.
 *
 * **비회원에게는 안 보인다.** 누가 냈는지는 공개 값이 아니다(`enrolls:readPublic` 이 회원 연결을 뺀다).
 * 가드가 `warn` 이면 실제로는 다 내려오므로, 서버 투영에 기대지 않고 여기서도 끊는다.
 */
const 신청자s = computed(() => {
  if (!is로그인.value) return []
  return (신청받기.value?.유효신청s ?? [])
    .map(신청 => 신청.회원)
    .filter((회원): 회원 is NonNullable<typeof 회원> => !!회원)
    .map(회원 => ({ id: String(회원.stateId ?? ''), 이름: 회원.이름 ?? '', 이미지: 회원.이미지 ?? null }))
})

const 신청 = computed(() => {
  const m = 회원.value, r = 신청받기.value
  if (!m || !r) return null
  return model신청s.getInstance().getBy회원신청받기(m, r) ?? null
})

const 신청상태라벨 = computed(() =>
  ({ PENDING: '접수', APPROVED: '승인', REJECTED: '반려', SUBMITTED: '제출', CANCELED: '취소됨' } as const)[신청.value?.상태 ?? 'PENDING']
)

/**
 * 왼쪽 칸에 세울 게 있나. 본문이 있거나 이미 신청했으면(=문항·채점 결과가 붙는다) 2단,
 * 둘 다 아니면 신청 패널 한 칸이다.
 */
const is좌측있음 = computed(() => !!본문.value || !!신청.value)

/**
 * 답은 신청 행의 `answers` jsonb 다 — 문항 id → 값들. 화면은 신청 모델의 `답Of`·`set답`을
 * 그대로 부른다. 응답 행을 미리 깔던 시절(`do응답지생성`)은 없어졌다.
 */
const 답Of = (문항: i문항) => 신청.value?.답Of(문항.id) ?? []
const set답 = (문항: i문항, 값s: string[]) => 신청.value?.set답(문항.id, 값s)

const is단일선택 = (문항: i문항) => ['SINGLE', 'OX', 'SCALE'].includes(문항.type)
const 선택지items = (문항: i문항) =>
  (문항.type === 'OX' ? [{ label: 'O', value: 'O' }, { label: 'X', value: 'X' }] : 문항.options)
    .map(x => ({ label: x.label, value: x.value }))

const toggle복수답 = (문항: i문항, value: string, on: boolean) => {
  const 현재 = 답Of(문항)
  set답(문항, on ? [...현재.filter(x => x !== value), value] : 현재.filter(x => x !== value))
}

/** 저장 안 된 변경이 있나. 제출 버튼을 켜는 기준. */
const is미저장 = computed(() => toValue(신청.value?.is수정됨) ?? false)

/** 퀴즈 채점 결과는 **제출한 뒤에만** 보여준다. 풀면서 정답이 보이면 평가가 아니다. */
const is채점공개 = computed(() => {
  const 신청행 = 신청.value
  if (!신청행?.is채점대상) return false
  return 신청행.is제출됨 && !is미저장.value
})

/**
 * 채점이 붙는 종류인가. **`문항.is채점`으로는 못 판단한다** — 응시자에게는 `answerKey`가
 * 안 내려와서 늘 `false`다. 대상 종류는 응시자도 아는 값이라 이걸로 가른다.
 */
const is채점물 = computed(() => 신청받기.value?.대상표 === 'quizzes')

const 합격문구 = computed(() => {
  // 서버가 합격 여부까지 계산해 준다. 클라 계산은 정답을 아는 역할(관리자)에서만 맞는다.
  const 서버 = 신청.value?.채점결과
  if (서버?.passScore != null)
    return 서버.isPassed ? '합격입니다.' : `합격 기준은 ${서버.passScore}점입니다.`

  const 퀴즈 = is채점물.value ? model퀴즈s.getInstance().getById(신청받기.value!.대상id) : null
  if (!퀴즈 || 퀴즈.합격점수 <= 0) return ''
  return (신청.value?.점수 ?? 0) >= 퀴즈.합격점수 ? '합격입니다.' : `합격 기준은 ${퀴즈.합격점수}점입니다.`
})

const do신청하기 = async () => {
  const m = 회원.value, r = 신청받기.value
  if (!m || !r) return
  ing.value = true
  try { await model신청s.getInstance().do신청(r, m) } finally { ing.value = false }
}

/**
 * 이 문항이 정답이었나. 응시자에게는 `answerKey`가 안 내려올 수 있으므로 서버 채점 결과를 먼저 보고,
 * 없을 때만(관리자·담당자) 정답을 직접 대조한다 — 둘 다 `model신청.is정답Of` 하나가 한다.
 */
const 정답여부 = (문항: i문항) => 신청.value?.is정답Of(문항.id) ?? null

/** 아직 안 쓴 필수 문항인가. 제출을 막는 이유를 문항 줄에도 표시한다. */
const is누락 = (문항: i문항) => (신청.value?.미응답필수s ?? []).some(q => q.id === 문항.id)

/**
 * 제출이 안 되는 이유. `null`이면 눌린다.
 * 버튼을 `disabled`로만 두면 "눌러도 아무 일이 없다"가 되므로, 이유를 문자열로 만들어 같이 보여준다.
 */
const 제출불가사유 = computed(() => {
  const 신청행 = 신청.value
  if (!신청행) return '먼저 신청해주세요.'
  const 누락 = 신청행.미응답필수s
  if (누락.length) return `필수 문항 ${누락.length}개가 남았습니다: ${누락.map(q => q.label).join(', ')}`
  if (!is미저장.value)
    return 신청행.is제출됨 ? '저장된 내용과 같습니다. 답을 고치면 다시 제출할 수 있습니다.' : '답을 입력해주세요.'
  return null
})

/** 배점 배지. 정답을 모르는 응시자도 서버가 만점을 알려주면 채점물임을 안다. */
const 배점표시 = (문항: i문항) =>
  (문항.answerKey?.length ?? 0) > 0 || (신청.value?.채점결과?.maxScore ?? 0) > 0

const do제출 = async () => {
  const 신청행 = 신청.value
  if (!신청행) return
  ing.value = true
  try {
    // 답은 신청 행 하나에 통째로 실려 나간다 — 부분 저장이 없다.
    const 됨 = await 신청행.do제출()
    if (!됨) return
    // 채점은 저장된 답을 기준으로 서버가 한다 — 저장이 끝난 뒤에 물어야 방금 낸 답이 반영된다.
    if (is채점물.value) await 신청행.do채점요청()
  } finally { ing.value = false }
}

/**
 * 이미 제출된 신청이면 **첫 그림에** 점수가 실리도록 여기서 한 번 받아 둔다.
 * 아래 watch만 두면 하이드레이션 뒤에야 붙어서, 다시 들어온 응시자에게 점수가 잠깐 사라진다.
 */
if (신청.value && is채점물.value && 신청.value.is제출됨 && !신청.value.채점결과)
  await 신청.value.do채점요청()

/** 지난번에 이미 제출해 뒀다면, 열자마자 채점 결과를 받아온다. 한 번만 나가게 막는다. */
const 채점요청중 = ref(false)
watch(
  () => [신청.value?.stateId, 신청.value?.is제출됨, is채점물.value] as const,
  async () => {
    const 신청행 = 신청.value
    if (!신청행 || !is채점물.value || 채점요청중.value) return
    if (!신청행.is제출됨 || 신청행.채점결과) return
    채점요청중.value = true
    try { await 신청행.do채점요청() } finally { 채점요청중.value = false }
  },
  { immediate: true }
)
</script>

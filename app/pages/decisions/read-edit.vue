<!--
  **수정모드는 얼마나 달라 보여야 하나**의 비교판.
  2026-09-05에 **기하 고정으로 결론**이 났고, `Input/_.ts` 의 `_읽기base`·`_pill.vue` 의 읽기 여백과
  `view/모델필드s2.vue` 의 `is읽기판` 분기가 그날 바뀌었다. 이 페이지는 그 결정의 기록이다.

  ## 왜 정해야 하나

  읽기판과 수정판이 똑같이 생기면 지금 어느 쪽인지 화면만 봐선 모른다. 그래서 읽기판은
  상자(테두리·배경)와 **안쪽 여백까지** 벗고, 줄 간격도 촘촘해졌다(`_.ts` 머리말).
  그 대가가 이 판이 재는 것이다 — **모드를 뒤집으면 값이 자리를 옮긴다.**

  - 가로: 읽기판은 입력칸 `px-2.5`(10px)가 없어 값이 10px 왼쪽에서 시작한다. 칩도 같다
    (`_pill.vue` 가 읽기판에서 `px-0`, 무리 상자의 `p-0.5` 도 사라진다 → 합쳐서 역시 10px).
  - 세로: 읽기판은 줄마다 높이가 글자 한 줄(≈20px)인데, 수정판은 입력칸 32px·칩 36px·
    잠긴 평문 20px가 섞인다. 줄 리듬이 사라지는 자리가 여기다.
  - 섞임: 수정판에서도 못 고치는 칸(가입일)은 상자가 안 생긴다. "상자 있는 줄 / 없는 줄"이
    번갈아 나오는데, 지금은 그게 **의도된 읽기전용 표시로 안 보이고 빠뜨린 것처럼 보인다.**

  ## 판 셋

  1. **지금** — `view모델필드s2` 의 값을 그대로 옮겨 적었다(라벨 `text-xs text-dimmed` ↔ `text-sm text-muted`,
     값 `pt-0.5 pb-1.5` ↔ `pt-1 pb-3`). 이 칸이 기준선이라 여기 값이 실제와 어긋나면 판 전체가 거짓말이 된다.
  2. **기하 고정** — 여백·줄 높이를 한 벌로 두고 테두리·배경만 껐다 켠다. 읽기판 값 자리에
     입력칸 여백만큼(`pl-3.5` = 4+10) 미리 넣어 두는 게 전부다. 뒤집어도 아무것도 안 움직인다.
  3. **면만** — 기하 고정에 더해, 수정판 입력칸의 테두리를 빼고 면만 남긴다.
     **칩 무리가 이미 그렇게 말하고 있다**(`bg-elevated/90` 상자, 테두리 없음) — 그 어휘를 입력칸까지 넓히는 안.

  ## 판 읽는 법

  - 세 판이 **같은 값 객체**를 본다. 한 칸을 고치면 셋이 같이 바뀐다 — 글자 길이 차이로 판이 흔들리지 않게.
  - `Δ` 는 모드를 뒤집을 때 그 판 전체 높이가 변하는 양이다. **한 번 뒤집어야 채워진다**(자동 깜빡을 켜면 바로 찬다).
  - `격자선` 은 세로선 하나 + 줄 밑선이다. 세로선은 **수정판 글자가 서는 x**(80+4+4+10=98) 에 그었다.
    입력칸 여백은 못 없애는 값이라 이쪽이 기준이다 — 「지금」 판은 읽기모드에서 값이 이 선 왼쪽으로 빠진다.
  - **한계 하나**: 3번 판의 테두리 벗기기는 페이지 CSS로 `input`·`textarea` 만 친다.
    날짜 칸은 `UInputDate` 안쪽이라 안 벗겨진다 — 진짜로 하려면 `_.ts` 에 재질을 한 벌 더 둬야 한다는 뜻이고,
    그 비용이 이 안의 실제 가격이다.
-->
<template>
  <div class="mx-auto w-full max-w-7xl px-4 py-8">
    <div class="mb-6">
      <h1 class="text-2xl font-semibold">
        읽기판 ↔ 수정판
      </h1>
      <p class="mt-1 text-sm text-muted">
        같은 폼 셋. 모드를 뒤집었을 때 <span class="text-highlighted">무엇이 움직이는지</span>를 보는 자리.
      </p>
    </div>

    <div class="mb-4 flex flex-wrap items-center gap-x-6 gap-y-3">
      <Input선택기
        v-model="모드"
        :items="모드s"
        type="radio"
        :search="false"
        is폭자동
      />
      <UCheckbox
        v-model="깜빡"
        label="자동 깜빡 (1.2초)"
      />
      <UCheckbox
        v-model="격자선"
        label="격자선"
      />
      <UCheckbox
        v-model="세로"
        label="한 열로 세우기 (실제 폼 폭)"
      />
      <div class="grow" />
      <span class="text-xs text-dimmed">
        Δ = 모드를 뒤집을 때 판 전체 높이가 변하는 양 · 한 번 뒤집어야 찬다
      </span>
    </div>

    <ClientOnly>
      <div
        class="grid gap-4"
        :class="세로 ? 'grid-cols-1' : 'lg:grid-cols-3'"
      >
        <section
          v-for="판 in 판s"
          :key="판.key"
          class="rounded-xl border border-default bg-default p-4 m-층-카드"
        >
          <div class="mb-2 flex items-baseline gap-2">
            <h2 class="text-sm font-medium text-highlighted">
              {{ 판.제목 }}
            </h2>
            <UBadge
              size="sm"
              variant="subtle"
              :color="Δ색(판.key)"
            >
              Δ {{ Δ표시(판.key) }}
            </UBadge>
          </div>
          <p class="mb-4 min-h-14 text-xs text-muted">
            {{ 판.근거 }}
          </p>

          <div
            :ref="(el) => 판Els[판.key] = (el as HTMLElement | null)"
            class="relative"
            :class="[판.class, 판.key === '전' && is읽기 ? 'demo-strip-padding' : '']"
          >
            <!-- 수정판 글자가 서는 x. 입력칸 여백은 못 없애는 값이라 이쪽이 기준선이다 -->
            <div
              v-if="격자선"
              class="pointer-events-none absolute inset-y-0 border-l border-dashed border-primary/70"
              :style="{ left: `${값선px}px` }"
            />

            <div
              v-for="f in 필드s"
              :key="f.key"
              class="w-full flex flex-row gap-1"
              :class="격자선 ? 'border-b border-dashed border-accented' : ''"
            >
              <div
                class="w-20 shrink-0 pl-3 text-left"
                :class="라벨class(판, f)"
              >
                <span v-if="!f.is버튼">{{ f.label }}</span>
                <!-- 못 고치는 칸이라는 말을 상자 없음이 아니라 라벨이 한다 -->
                <mIcon
                  v-if="판.잠김표시 && f.잠김 && !is읽기"
                  name="i-material-symbols-light-lock-outline"
                  class="ml-1 inline-block size-3 align-middle text-dimmed"
                />
              </div>
              <div
                class="grow min-w-0"
                :class="값class(판)"
              >
                <mButton
                  v-if="f.is버튼"
                  icon="i-material-symbols-light-credit-card-outline"
                  label="회비 납부"
                />
                <component
                  :is="f.comp"
                  v-else
                  v-bind="f.props"
                  v-model="값s[f.key]"
                  :readonly="is읽기 || !!f.잠김"
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { Input날짜, Input문자, Input선택기, Input선택기S } from '#components'
import { computed, markRaw, nextTick, onMounted, reactive, ref, watch, type Component } from 'vue'
import { mDayjs } from '~utils'

definePageMeta({
  제목: '읽기판 ↔ 수정판'
})

const 모드 = ref<'읽기' | '수정'>('읽기')
const 모드s = [
  { label: '읽기', value: '읽기', icon: 'i-material-symbols-light-visibility-outline' },
  { label: '수정', value: '수정', icon: 'i-material-symbols-light-edit-outline' }
]
const is읽기 = computed(() => 모드.value === '읽기')

const 격자선 = ref(true)
/**
 * 3단으로 세우면 한 칸이 실제 폼보다 좁아 `역할` 칩이 넘치고, 그 가로 스크롤바가 Δ 에 섞인다
 * (판 자체의 흔들림이 아니다). 숫자를 믿어야 할 때는 이걸 켜고 볼 것.
 */
const 세로 = ref(false)
const 깜빡 = ref(false)

/** 라벨 `w-20`(80) + 줄 `gap-1`(4) + 값칸 `pl-1`(4) + 입력칸 `px-2.5`(10) */
const 값선px = 98

/**
 * 세 판이 **같은 객체**를 본다. 판마다 값을 따로 두면 글자 길이가 갈리면서
 * 판 사이 높이 차이가 방식 때문인지 내용 때문인지 알 수 없게 된다.
 */
const 값s = reactive<Record<string, unknown>>({
  고유번호: '1002',
  이름: '김모',
  생년월일: mDayjs('2005-08-04'),
  가입일: mDayjs('2026-07-26'),
  성별: '남자',
  잠자는회원: '정상 회원',
  역할: ['학습자', '교수자', '운영자'],
  등급: '입문자'
})

type i칸 = {
  key: string
  label: string
  comp?: Component
  props?: Record<string, unknown>
  /** 수정판에서도 못 고치는 칸. 이게 있어야 「상자 있는 줄 / 없는 줄」 섞임이 판에 나온다 */
  잠김?: boolean
  is버튼?: boolean
}

/** 회원 상세(`model회원`)의 「기본」 탭 앞머리를 그대로 옮겨 왔다 — 실제로 흔들리는 화면이 거기다 */
const 필드s: i칸[] = [
  { key: '고유번호', label: '고유번호', comp: markRaw(Input문자) },
  { key: '이름', label: '이름', comp: markRaw(Input문자) },
  { key: '생년월일', label: '생년월일', comp: markRaw(Input날짜) },
  {
    key: '성별',
    label: '성별',
    comp: markRaw(Input선택기),
    props: {
      type: 'radio',
      search: false,
      items: [
        { label: '남자', value: '남자', icon: 'i-mdi-gender-male' },
        { label: '여자', value: '여자', icon: 'i-mdi-gender-female' }
      ]
    }
  },
  { key: '가입일', label: '가입일', comp: markRaw(Input날짜), 잠김: true },
  { key: '회비', label: '', is버튼: true },
  {
    key: '잠자는회원',
    label: '잠자는회원',
    comp: markRaw(Input선택기),
    props: {
      type: 'radio',
      search: false,
      items: [
        { label: '정상 회원', value: '정상 회원', icon: 'i-mdi-account-check-outline' },
        { label: '잠자는 회원', value: '잠자는 회원', icon: 'i-mdi-sleep' }
      ]
    }
  },
  {
    key: '역할',
    label: '역할',
    comp: markRaw(Input선택기S),
    props: {
      type: 'radio',
      search: false,
      items: [
        { label: '비회원', value: '비회원', icon: 'i-mdi-account-off-outline' },
        { label: '준회원', value: '준회원', icon: 'i-mdi-account-clock-outline' },
        { label: '학습자', value: '학습자', icon: 'i-mdi-account-school-outline' },
        { label: '교수자', value: '교수자', icon: 'i-mdi-account-tie-outline' },
        { label: '운영자', value: '운영자', icon: 'i-mdi-account-cog-outline' }
      ]
    }
  },
  {
    key: '등급',
    label: '등급',
    comp: markRaw(Input선택기),
    props: {
      type: 'radio',
      search: false,
      items: [
        { label: '지도자', value: '지도자', icon: 'i-mdi-numeric-4-box-outline' },
        { label: '숙련자', value: '숙련자', icon: 'i-mdi-numeric-3-box-outline' },
        { label: '기초', value: '기초', icon: 'i-mdi-numeric-2-box-outline' },
        { label: '입문자', value: '입문자', icon: 'i-mdi-numeric-1-box-outline' }
      ]
    }
  }
]

type i판 = {
  key: string
  제목: string
  근거: string
  class?: string
  /** 못 고치는 칸을 라벨로 말할지. 「지금」은 안 한다(그게 지금 상태다) */
  잠김표시?: boolean
}

const 판s: i판[] = [
  {
    key: '전',
    제목: '전 (2026-09-05까지)',
    근거: '읽기판이 더 촘촘했다 — 상자를 지운 자리가 빈칸으로 남지 않게. 대가는 뒤집을 때 값이 위아래로도 좌우로도 움직인다는 것이었고, 그 대가가 96px 이다.'
  },
  {
    key: '기하고정',
    제목: '지금 — 기하 고정 (채택)',
    근거: '여백·줄 높이를 한 벌로. 뒤집으면 제자리에서 선과 면만 켜지고 꺼진다. 값은 읽기판이 그만큼 성겨진다는 것 — 그게 이 안의 가격이고, 그만큼은 치르기로 했다.',
    잠김표시: true
  },
  {
    key: '면만',
    제목: '면만 (칩처럼)',
    근거: '기하 고정 + 수정판 입력칸의 테두리를 빼고 면만 (탈락). 칩 무리가 이미 그렇게 말하고 있어 말은 되지만, 날짜 칸이 안 벗겨진다 — `_.ts` 에 재질을 한 벌 더 둬야 한다는 뜻이고 그 값을 안 내기로 했다.',
    class: 'demo-surface-only',
    잠김표시: true
  }
]

/**
 * 칸 높이 `min-h-10`(40) 은 제일 큰 내용에 맞춘 값이다 — 입력칸 32 + `py-1` 8.
 * 36 으로 뒀더니 칩 무리(38)가 그걸 넘어서 칩 줄만 2px 씩 자랐고, Δ 가 8px 로 샜다.
 * **줄 높이를 고정한다는 건 제일 큰 칸에 맞춘다는 뜻**이고, 그 값이 이 방식의 진짜 가격이다.
 */
const 라벨class = (판: i판, f: i칸) => {
  // 「전」 = 2026-09-05 이전 `모델필드s2` 의 값 그대로
  if (판.key === '전')
    return is읽기.value ? 'pt-1 text-xs text-dimmed' : 'text-sm text-muted'
  return [
    'min-h-10 flex items-center text-sm',
    !is읽기.value && f.잠김 ? 'text-dimmed' : 'text-muted'
  ]
}

const 값class = (판: i판) => {
  if (판.key === '전')
    return is읽기.value ? 'pl-1 pt-0.5 pb-1.5' : 'pl-1 pt-1 pb-3'
  // 가로 보정은 없다. 입력칸·칩이 읽기모드에도 제 여백을 그대로 갖는다(`Input/_.ts` 의 `_읽기base`)
  return ['min-h-10 flex items-center py-1 pl-1']
}

const 판Els: Record<string, HTMLElement | null> = {}
const 높이s = reactive<Record<string, Record<string, number>>>({})

const 재기 = async () => {
  await nextTick()
  for (const 판 of 판s) {
    const el = 판Els[판.key]
    if (!el)
      continue
    const 칸 = (높이s[판.key] ??= {})
    칸[모드.value] = Math.round(el.getBoundingClientRect().height)
  }
}

const Δ = (key: string) => {
  const h = 높이s[key]
  if (!h || h['읽기'] == null || h['수정'] == null)
    return null
  return Math.abs(h['수정'] - h['읽기'])
}
const Δ표시 = (key: string) => {
  const d = Δ(key)
  return d == null ? '—' : `${d}px`
}
const Δ색 = (key: string) => {
  const d = Δ(key)
  if (d == null)
    return 'neutral' as const
  return d === 0 ? 'success' as const : 'warning' as const
}

watch(모드, () => 재기())
onMounted(() => 재기())

// 뒤집는 걸 손으로 하면 "조금 움직이네" 로 끝난다. 1.2초마다 스스로 뒤집으면 흔들림으로 보인다
const 깜빡이 = useIntervalFn(() => {
  모드.value = is읽기.value ? '수정' : '읽기'
}, 1200, { immediate: false })

watch(깜빡, (on) => {
  if (on)
    깜빡이.resume()
  else
    깜빡이.pause()
})
</script>

<style scoped>
/*
 * 「전」 판. 여백 벗기기는 2026-09-05에 `_읽기base`·`_pill.vue` 에서 빠졌다.
 * 판이 기록으로 남으려면 그 시절 기하를 여기서 되살려야 한다 — 되살리는 건 여백뿐이고,
 * 칩 아이콘은 지금 값 그대로다(그건 같은 날 읽기모드에도 나오게 바뀌었다).
 */
.demo-strip-padding :deep(input),
.demo-strip-padding :deep(textarea) {
  padding-left: 0 !important;
  padding-right: 0 !important;
}

.demo-strip-padding :deep([aria-pressed]) {
  padding: 0 !important;
}

/*
 * 「면만」 판. `_.ts` 에 재질을 한 벌 더 두는 대신 판에서만 흉내 낸다 —
 * 그래서 `UInputDate` 안쪽(날짜 칸)에는 안 닿는다. 그 미달이 곧 이 안의 실제 가격이다.
 */
.demo-surface-only :deep(input),
.demo-surface-only :deep(textarea) {
  box-shadow: none !important;
  background-color: color-mix(in oklab, var(--ui-bg-elevated) 60%, transparent) !important;
}
</style>

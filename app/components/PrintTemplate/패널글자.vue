<template>
  <!--
    3단계. 고른 상자 하나의 상세만 다룬다 — **고르는 일은 캔버스가 한다.**

    상자 목록을 여기 두지 않는 이유: 캔버스가 이미 클릭으로 상자를 집고, 얹으면 점선과
    이름표(`1 행사명`)를 띄우고, Tab 으로 순회까지 한다. 목록은 그 셋을 좁은 패널 안에서
    한 번 더 하는 일이고, 그러느라 상세가 쓸 폭을 절반 넘게 가져갔다.
    (자리 이름을 한눈에 훑는 일은 디자인틀목록 패널의 자리 현황이 맡는다)
  -->
  <section class="flex flex-col gap-2">
    <div class="flex items-center gap-2">
      <p class="text-xs text-muted">
        상자는 고정이고 글자가 그 안에서 줄어듭니다.
      </p>
      <div class="grow" />
      <!--
        이 단계의 **초안**을 AI 가 놓는다. 나온 것은 **평범한 글자 상자**라 그대로 끌고 고치고 지운다
        (`AI채우기.ts` 머리말) — 그래서 이 버튼이 '추가' 옆에 있고, 따로 모드를 만들지 않는다.
        표식 쪽과 같은 이름이다. 한쪽만 '채우기'면 같은 일을 하는 버튼 둘이 다른 약속으로 읽힌다.
      -->
      <mButton
        size="xs"

        icon="i-lucide-sparkles"
        :loading="isLoading"
        @click="doAI초안"
      >
        AI 초안
      </mButton>
      <mButton
        size="xs"

        icon="i-lucide-plus"
        @click="글자추가"
      >
        추가
      </mButton>
    </div>

    <!--
      초안에 거는 한마디. **자유도를 난수가 아니라 이 칸으로 준다** — 매번 다르게 나오는 것은
      자유가 아니라 도박이고, 더 나빠졌을 때 되돌릴 길이 없다. 관례와 부딪히면 이쪽이 이긴다
      (`AI채우기.ts` 의 `요청줄`). 비워 두면 판형 관례대로 간다.
      엔터로도 돌게 둔 것은 이 칸에 적는 사람은 곧바로 돌려 보려 하기 때문이다.
    -->
    <UInput
      v-model="요청"
      size="xs"
      icon="i-lucide-message-square"
      placeholder="AI 초안에 한마디 — 비우면 판형 관례대로 (예: 왼쪽 축으로, 더 단정하게)"
      @keydown.enter="doAI초안"
    />

    <p
      v-if="error"
      class="text-xs text-error"
    >
      {{ error }}
    </p>

    <div
      v-if="선택글자"
      class="flex flex-col gap-2"
    >
      <p class="text-[0.68rem] uppercase tracking-wide text-dimmed">
        {{ 선택번호 }}번 상자
      </p>
      <!--
        주입받는 칸. 자리 상자는 여기가 비어 있는 게 정상이고, 그동안 종이에는 아래 예시가 뜬다
        (`i글자.내용`). 고정문구 상자는 반대로 여기 적은 글자가 곧 최종 문구라 예시 칸이 안 나온다.
      -->
      <UTextarea
        v-model="선택글자.내용"
        :rows="3"
        size="sm"
        autoresize
        :placeholder="꼬리표 ? '주입 전 — 아래 예시가 대신 보입니다' : '상자에 찍힐 글자'"
      />
      <!--
        캔버스는 넘친 글자를 말없이 잘라 낸다(`overflow-hidden`). 편집 중에 그걸 모르면
        종이로 나와서야 안다 — 지금 이 상자가 넘치는지는 캔버스가 실제로 재서 알려 준다.
      -->
      <p
        v-if="선택실측?.넘침"
        class="flex items-start gap-1.5 text-xs text-error"
      >
        <UIcon
          name="i-lucide-triangle-alert"
          class="mt-px size-3.5 shrink-0"
        />
        글자가 상자를 넘칩니다. 캔버스는 넘친 부분을 잘라 냅니다 — 크기를 줄이거나 상자를 키우세요.
      </p>

      <!--
        상자가 가진 건 이 셋뿐이다 — 글자(위 상자) · 좌표(캔버스에서 끈다) · 꼬리표(이 칸).
        꼬리표는 그냥 이 자리의 이름이라 고를 목록도, 이을 셀렉트도 두지 않는다.
        그 이름에 실제 값을 붙이는 건 발급하는 쪽이 한다 (`model회원.디자인틀주입`).
      -->
      <UInput
        v-model="꼬리표"
        size="xs"
        placeholder="꼬리표 없음 (고정문구)"
      />
      <!--
        예시는 **종이에 안 나간다**. 자리 상자의 `내용` 은 꼬리표 그대로라(`행사명`) 실제로 무엇이
        들어오는지는 화면 어디에도 없는데, 상자 크기와 줄간격을 정하는 동안 가장 필요한 게 그 값이다.
        고정문구 상자에는 안 띄운다 — 거기 적힌 글자가 이미 최종 문구라 예시로 삼을 다른 값이 없다.
      -->
      <UTextarea
        v-if="꼬리표"
        v-model="예시"
        :rows="1"
        size="xs"
        autoresize
        :placeholder="`예시 — ${예시자리표시}`"
      />
      <p
        v-if="자리설명"
        class="text-xs text-dimmed"
      >
        {{ 자리설명 }}
      </p>

      <div class="flex items-center gap-2">
        <USelect
          v-model="선택글자.서체"
          :items="서체s"
          size="xs"
          class="flex-1"
        />
        <!-- 두 칸짜리 값은 셀렉트로 열 게 아니라 눌러서 켜는 것이다 -->
        <mButton
          size="xs"
          icon="i-lucide-bold"
          title="굵게"
          aria-label="굵게"
          :켜짐="선택글자.굵기 === '굵게'"
          @click="선택글자.굵기 = 선택글자.굵기 === '굵게' ? '보통' : '굵게'"
        />
        <input
          v-model="선택글자.색"
          type="color"
          class="h-6 w-8 shrink-0 cursor-pointer rounded border border-accented bg-transparent"
          title="글자색"
        >
      </div>

      <!--
        크기·줄간격·가로·세로는 전부 "이 글자를 어떻게 놓을까" 한 묶음이다.
        그래서 한 줄에 하나씩, 라벨 폭을 고정해 컨트롤이 같은 열에서 시작하게 둔다 —
        눈이 왼쪽 라벨만 훑고 내려가면 되고, 방향은 낱말 대신 모양으로 알아본다.
        (이름은 툴팁으로 남는다)
      -->
      <div class="flex flex-col gap-1.5 text-xs text-muted">
        <label class="flex items-center gap-2">
          <span class="w-14 shrink-0">크기</span>
          <USlider
            v-model="선택글자.크기"
            :min="1"
            :max="20"
            :step="0.2"
            class="flex-1"
          />
          <span class="w-10 shrink-0 text-right tabular-nums">{{ 선택글자.크기.toFixed(1) }}%</span>
        </label>

        <label
          class="flex items-center gap-2 transition-opacity"
          :class="{ 'opacity-40': !줄간격쓸모 }"
          :title="줄간격쓸모 ? undefined : '한 줄이라 지금은 바뀌는 게 없습니다'"
        >
          <span class="w-14 shrink-0">줄간격</span>
          <USlider
            v-model="선택글자.줄간격"
            :min="0.9"
            :max="2.4"
            :step="0.1"
            :disabled="!줄간격쓸모"
            class="flex-1"
          />
          <span class="w-10 shrink-0 text-right tabular-nums">{{ 선택글자.줄간격.toFixed(1) }}</span>
        </label>

        <div class="flex items-center gap-2">
          <span class="w-14 shrink-0">가로정렬</span>
          <div class="flex items-center gap-1">
            <mButton
              v-for="a in 정렬s"
              :key="a"
              size="xs"
              :icon="정렬아이콘[a]"
              :title="a"
              :aria-label="`가로 ${a}`"
              :켜짐="선택글자.정렬 === a"
              @click="선택글자.정렬 = a"
            />
          </div>
        </div>

        <div class="flex items-center gap-2">
          <span class="w-14 shrink-0">세로정렬</span>
          <div class="flex items-center gap-1">
            <mButton
              v-for="a in 세로정렬s"
              :key="a"
              size="xs"
              :icon="세로정렬아이콘[a]"
              :title="a"
              :aria-label="`세로 ${a}`"
              :켜짐="선택글자.세로정렬 === a"
              @click="선택글자.세로정렬 = a"
            />
          </div>
        </div>

        <!--
          쓰기방향은 켜고 끄는 게 아니라 둘 중 하나를 고르는 것이다. 스위치로 두면
          꺼진 쪽(가로)에 이름이 없어서, 지금 무엇으로 쓰이는 중인지를 "세로쓰기가 꺼져 있다" 로
          뒤집어 읽어야 했다. 위 세 줄과 같은 자리·같은 모양으로 세운다.
          화살표는 글자가 흘러가는 방향이다 — 세로쓰기(vertical-rl)에서 줄은 아래로 흐른다.
        -->
        <div class="flex items-center gap-2">
          <span class="w-14 shrink-0">쓰기방향</span>
          <div class="flex items-center gap-1">
            <mButton
              v-for="d in 쓰기방향s"
              :key="d.이름"
              size="xs"
              :icon="d.아이콘"
              :title="d.이름"
              :aria-label="d.이름"
              :켜짐="선택글자.세로쓰기 === d.세로"
              @click="선택글자.세로쓰기 = d.세로"
            />
          </div>
        </div>
      </div>

      <!-- 지우는 자리는 고치는 자리와 섞지 않는다 — 줄을 따로 주고 선을 그어 떼어 둔다 -->
      <div class="flex justify-end border-t border-default pt-2">
        <mButton
          size="xs"
          역할="조용"
          color="error"
          icon="i-lucide-trash-2"
          @click="글자삭제"
        >
          삭제
        </mButton>
      </div>
    </div>

    <p
      v-else
      class="text-xs text-dimmed"
    >
      {{ 면.글자s.length ? '캔버스에서 글자 상자를 고르세요.' : "아직 없습니다. '추가'를 누르세요." }}
    </p>
  </section>
</template>

<script setup lang="ts">
import { 빈자리, 새글자, 꼬리표변수 } from '~models/test2'
import { 세로정렬s, 정렬s, 틀서체s, type i세로정렬, type i정렬, type i틀 } from '~models/test2'
import { AI글자배치 } from './AI채우기'
import { 글자실측키, type i선택 } from './편집타입'

const 틀 = defineModel<i틀>({ required: true })
const 선택 = defineModel<i선택>('선택', { required: true })
const props = defineProps<{ 면i: number }>()

/** 이 패널이 만지는 면. 변수(`용도`)는 디자인틀 전체가 공유하지만 글자 상자는 면마다다 */
const 면 = computed(() => 틀.value.면s[props.면i]!)

const 서체s = [...틀서체s]

/** 아이콘으로 줄인 방향 버튼의 얼굴. 값(한글)은 그대로고 그리는 법만 바뀐다 */
const 정렬아이콘: Record<i정렬, string> = {
  왼쪽: 'i-lucide-align-left',
  가운데: 'i-lucide-align-center',
  오른쪽: 'i-lucide-align-right'
}
const 세로정렬아이콘: Record<i세로정렬, string> = {
  위: 'i-lucide-align-start-horizontal',
  가운데: 'i-lucide-align-center-horizontal',
  아래: 'i-lucide-align-end-horizontal'
}

/** 기본값(가로)이 왼쪽이다. 목록 순서가 곧 "안 건드리면 이것" 을 말한다 */
const 쓰기방향s = [
  { 이름: '가로쓰기', 세로: false, 아이콘: 'i-lucide-arrow-right' },
  { 이름: '세로쓰기', 세로: true, 아이콘: 'i-lucide-arrow-down' }
] as const

const 선택글자 = computed(() =>
  (선택.value?.레이어 === '글자' && 선택.value.면 === props.면i
    ? 면.value.글자s.find(t => t.id === 선택.value!.id) ?? null
    : null))

/** 이 면에서 몇 번째 상자인지. 캔버스 이름표가 다는 번호와 같은 번호다 */
const 선택번호 = computed(() =>
  면.value.글자s.findIndex(t => t.id === 선택글자.value?.id) + 1)

/* ── 캔버스가 재 온 것 ──────────────────────────────────────────── */

const 실측 = inject(글자실측키, null)
const 선택실측 = computed(() =>
  (선택글자.value ? 실측?.value[선택글자.value.id] : undefined))

/**
 * 줄간격이 지금 뭔가를 바꾸는가.
 *
 * 세로쓰기에서는 줄간격이 **열 사이 간격**이라 한 열뿐이어도 글자가 열 안에서 움직인다.
 * 가로쓰기 한 줄일 때만 만져도 그대로다. 아직 잰 값이 없으면(첫 그림 전) 켜 둔다 —
 * 모르는 채로 잠그면 멀쩡한 컨트롤이 이유 없이 죽어 보인다.
 */
const 줄간격쓸모 = computed(() => {
  const g = 선택글자.value
  if (!g) return true
  return g.세로쓰기 || (선택실측.value?.줄수 ?? 2) > 1
})

/* ── 자리(꼬리표) · 예시 ─────────────────────────────────────────── */

/** 빈 값은 꼬리표를 떼는 것 — 필드를 남겨 두면 자리 현황에 유령 자리가 선다 */
const 꼬리표 = computed({
  get: () => 선택글자.value?.꼬리표 ?? '',
  set: (v: string) => {
    if (선택글자.value) 선택글자.value.꼬리표 = v.trim() || undefined
  }
})

/** 빈 값은 예시를 떼는 것 — 꼬리표와 같은 규칙이다. 빈 문자열을 남기면 '예시 있음'으로 세어진다 */
const 예시 = computed({
  get: () => 선택글자.value?.예시 ?? '',
  set: (v: string) => {
    if (선택글자.value) 선택글자.value.예시 = v.trim() || undefined
  }
})

/**
 * 상자가 자기 예시를 안 들 때 자리표시로 빌리는 값 — **용도**가 아는 예시(`i변수.샘플`)다.
 * 이 한 줄이 `샘플` 을 읽는 유일한 자리이기도 하다.
 *
 * 꼬리표가 자유 문자열이라 못 빌릴 때가 있다(`행사장소` 를 `장소` 라 적은 상자). 그때는
 * 무슨 칸인지만 말한다. 줄바꿈은 편다 — placeholder 는 한 줄로만 뜬다.
 */
const 예시자리표시 = computed(() =>
  꼬리표변수(틀.value.용도, 꼬리표.value)?.샘플.replace(/\n/g, ' ') ?? '이 자리에 들어올 값')

/**
 * 이 이름을 용도가 아는지만 말해 준다. 값을 **고르는 UI 는 없다** — 값을 가져오는 층 자체가 없다.
 * 꼬리표는 이 자리의 이름일 뿐이고, 무엇이 들어올지는 바로 위 예시 칸이 말한다.
 */
const 자리설명 = computed(() => {
  const h = 꼬리표.value
  if (!h) return '꼬리표가 없는 상자입니다. 고정문구로 인쇄됩니다.'
  const v = 꼬리표변수(틀.value.용도, h)
  return v
    ? `${틀.value.용도}이(가) 아는 자리입니다 — ${v.라벨}.`
    : '이 용도의 어휘에 없는 이름입니다. 오타가 아닌지 보세요.'
})

function 글자추가() {
  const t = 새글자()
  // 캔버스가 유일한 picker 라, 기본 자리에 그대로 쌓으면 밑에 깔린 상자를 클릭으로 못 꺼낸다
  t.rect = 빈자리(면.value.글자s.map(g => g.rect), t.rect)
  면.value.글자s.push(t)
  선택.value = { 면: props.면i, 레이어: '글자', id: t.id }
}

function 글자삭제() {
  if (!선택글자.value) return
  면.value.글자s = 면.value.글자s.filter(t => t.id !== 선택글자.value!.id)
  // 이 면의 배경으로 물린다 — `null` 로 두면 어느 면을 고치던 중이었는지가 사라진다
  선택.value = { 면: props.면i, 레이어: '배경' }
}

/* ── AI 초안 ─────────────────────────────────────────────────────── */

const { ask, isLoading, error } = useAI()
const 확인창 = useModalConfirm()

/** 이 패널이 떠 있는 동안만 사는 한마디. 디자인틀에 저장하지 않는다 — 배치에 이미 반영된 값이라 */
const 요청 = ref('')

/**
 * 이 면의 글자 초안을 AI 가 한 벌 놓는다.
 *
 * **이어 붙이지 않고 갈아엎는다.** 배치는 상자 하나하나가 아니라 종이 전체의 균형이라,
 * 놓여 있는 것 옆에 새 벌을 얹으면 겹치는 상자 두 벌이 되고 어느 쪽이 새것인지도 안 보인다.
 * 그래서 잃는 것이 있을 때만 묻는다 — 저장 자체는 아직 안 하므로, 잘못 나와도 캔버스 위 일이다
 * (`use디자인틀.ts` 의 '되돌리기'가 저장본으로 돌아가는 마지막 탈출구다).
 *
 * 결과를 고르지 않고 그대로 앉히는 이유: 후보 둘을 나란히 보여 주려면 종이도 둘이어야 하는데
 * (그림 후보와 달리 배치는 캔버스 전체다) 그건 이 패널이 아니라 캔버스가 할 일이다.
 * 마음에 안 들면 한 번 더 누르면 된다 — 그림과 달리 값이 거의 안 든다.
 */
async function doAI초안() {
  if (면.value.글자s.length) {
    const 답 = await 확인창.open({
      title: 'AI 로 다시 놓을까요?',
      message: `이 면의 글자 상자 ${면.value.글자s.length}개가 사라지고 AI 가 새로 놓습니다. 아직 저장되지는 않습니다.`,
      choices: [
        { key: '놓기', label: '새로 놓기', color: 'primary', 역할: '강조' },
        { key: '취소', label: '취소' }
      ]
    })
    if (답 !== '놓기') return
  }

  // 실패는 `useAI` 가 error 에 담아 두고, 버튼 아래 한 줄이 그걸 띄운다
  const 새s = await AI글자배치(ask.lite, 틀.value, 면.value, 요청.value).catch(() => null)
  if (!새s) return

  if (!새s.length) {
    error.value = '상자를 하나도 내지 못했습니다. 한 번 더 눌러 보세요.'
    return
  }

  면.value.글자s = 새s
  // 하나를 집으면 패널이 그 상자의 상세로 바뀐다 — 방금 놓인 배치를 통째로 보는 게 먼저다
  선택.value = null
}
</script>

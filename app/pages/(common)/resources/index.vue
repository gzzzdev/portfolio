<template>
  <div class="mx-auto w-full max-w-(--ui-container) space-y-4 p-3 sm:p-6">
    <mPageIntro
      title="자료"
      description="모임이 쌓아 온 원본 문서와 서식입니다. 제목·요약·태그·본문을 함께 찾습니다."
    >
      <!-- 건수는 조건을 걸었을 때만 할 말이 있다. 안 걸었으면 아래 목록이 그대로 그 수다(신청 목록과 같은 규칙). -->
      <template #trailing>
        <p
          v-if="보이는자료s.length !== 볼수있는자료s.length"
          class="text-sm text-muted tabular-nums"
        >
          전체 {{ 볼수있는자료s.length }}건 중 <span class="font-semibold text-toned">{{ 보이는자료s.length }}</span>건
        </p>
      </template>
    </mPageIntro>

    <!-- 도구 — 검색은 왼쪽, 정렬·행동은 오른쪽. 축이 늘면 아래 칩 줄이 줄바꿈될 뿐 자리는 안 늘어난다. -->
    <div class="flex flex-wrap items-center gap-2">
      <UInput
        :model-value="search"
        icon="i-ph-magnifying-glass-light"
        class="w-full sm:w-64"
        placeholder="제목·요약·태그·본문으로 검색"
        aria-label="자료 검색"
        @update:model-value="(v) => (search = String(v ?? ''))"
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
            @click="search = ''"
          />
        </template>
      </UInput>
      <div class="grow" />
      <USelect
        :model-value="정렬"
        :items="정렬options"
        class="w-32"
        aria-label="정렬"
        @update:model-value="(v) => do정렬바꾸기(String(v ?? ''))"
      />
      <!-- 운영자도 같은 문으로 들어와 여기서 만든다 — 게시판의 「글쓰기」와 같은 자리, 같은 무게. -->
      <mButton
        v-if="is관리자"
        역할="강조"
        icon="i-lucide-plus"
        label="새 자료"
        @click="do새자료"
      />
    </div>

    <div class="flex flex-wrap items-center gap-x-4 gap-y-2">
      <div
        v-for="group in 필터그룹s"
        :key="group.key"
        class="flex flex-wrap items-center gap-1"
      >
        <span class="mr-1 text-xs font-medium tracking-wide text-dimmed">{{ group.title }}</span>
        <mButton
          size="xs"
          :역할="selectedFilters[group.key] ? '조용' : undefined"
          label="전체"
          @click="do필터바꾸기(group.key, null)"
        />
        <mButton
          v-for="option in group.options"
          :key="`${group.key}-${option.value}`"
          size="xs"
          역할="조용"
          :켜짐="selectedFilters[group.key] === option.value"
          :icon="option.icon"
          :label="option.label"
          @click="do필터바꾸기(group.key, selectedFilters[group.key] === option.value ? null : option.value)"
        />
      </div>
      <mButton
        v-if="활성필터수 || search"
        size="xs"
        역할="인라인"
        icon="i-ph-arrow-counter-clockwise-light"
        label="조건 지우기"
        @click="do조건지우기"
      />
    </div>

    <USlideover
      :open="!!새자료"
      title="새 자료"
      :ui="{ content: 'sm:max-w-3xl' }"
      @update:open="v => { if (!v) 새자료 = null }"
    >
      <template #body>
        <view상세5
          v-if="새자료"
          v-model:is수정중="is수정중"
          v-model:tab자동필드="tab자동필드"
          class="h-full"
          is중첩
          :model-value="새자료"
          :can="{ 생성: true, 수정: true, 삭제: true }"
          @on-close="새자료 = null"
        />
      </template>
    </USlideover>

    <!-- ── 조건에 맞는 게 없다 ──────────────────────────────────────── -->
    <div
      v-if="!보이는자료s.length"
      class="rounded-xl border border-dashed border-default px-6 py-14 text-center"
    >
      <UIcon
        name="i-lucide-library-big"
        class="size-10 text-dimmed"
      />
      <p class="mt-2 text-sm text-muted">
        {{ 활성필터수 || search ? '조건에 맞는 자료가 없습니다.' : '아직 올라온 자료가 없습니다.' }}
      </p>
      <mButton
        v-if="활성필터수 || search"
        class="mt-3"
        size="xs"
        label="조건 지우기"
        @click="do조건지우기"
      />
    </div>

    <!-- ── 목록 ─────────────────────────────────────────────────────── -->
    <!--
      줄 한 벌이다. 좁은 화면에서는 격자 배치만 바뀌고(태그·분량 열이 제목 아래 한 줄로 내려온다) 위젯은 안 갈린다.
      상자를 안 두른다 — 열 머리의 굵은 선이 위 테두리고, 줄마다 아래 선이 있다(신청 목록의 목록형과 같은 골격).
    -->
    <div v-else>
      <div class="grid grid-cols-[minmax(0,1fr)_9rem_6rem_5rem] gap-4 border-b-2 border-inverted px-3 pb-2 text-xs text-dimmed max-md:hidden">
        <span>제목</span>
        <span>태그</span>
        <span>분량</span>
        <span />
      </div>
      <div
        v-for="자료 in 보이는자료s"
        :key="String(자료.stateId)"
        class="grid cursor-pointer grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 border-b border-default px-3 py-3 transition-colors hover:bg-elevated md:grid-cols-[minmax(0,1fr)_9rem_6rem_5rem] md:gap-x-4 md:gap-y-0"
        role="button"
        tabindex="0"
        @click="do열기(자료)"
        @keydown.enter="do열기(자료)"
        @keydown.space.prevent="do열기(자료)"
      >
        <div class="min-w-0">
          <div class="flex items-center gap-1.5">
            <!-- 회원 자료 표시. 비회원에게는 목록에서부터 빠지므로 이 배지는 회원만 본다. -->
            <UBadge
              v-if="!자료.공개"
              size="xs"
              variant="subtle"
              label="회원"
            />
            <span class="min-w-0 truncate font-medium text-highlighted">{{ 자료.제목 }}</span>
          </div>
          <div
            v-if="자료.요약"
            class="truncate text-xs text-dimmed"
          >
            {{ 자료.요약 }}
          </div>
        </div>

        <span class="hidden truncate text-xs text-muted md:block">{{ 자료.태그s.join(' · ') }}</span>

        <span class="hidden text-sm tabular-nums text-toned md:block">{{ 분량문구(자료) }}</span>

        <!--
          받기는 줄 누름과 **다른 일**이라 `stop` 이다 — 줄은 상세로 가고, 이 버튼은 파일을 연다.
          파일이 여럿이면 첫 것만 받게 하고 나머지는 상세 레일에서 받는다.
        -->
        <div class="col-start-2 row-start-1 flex items-center justify-end md:col-start-auto md:row-start-auto">
          <mButton
            v-if="자료.받기s[0]"
            :to="자료.받기s[0].url"
            target="_blank"
            rel="noopener noreferrer"
            size="xs"
            icon="i-lucide-download"
            label="받기"
            :title="자료.받기s[0].title || undefined"
            @click.stop
          />
          <UIcon
            v-else
            name="i-lucide-chevron-right"
            class="size-4 text-dimmed"
          />
        </div>

        <!-- 좁은 화면에서 접히는 두 칸(분량·태그)을 한 줄로. 값은 위와 같은 것이다. -->
        <span class="col-span-2 text-xs text-dimmed md:hidden">{{ 좁은메타(자료) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 자료 목록. **문은 역할과 상관없이 하나다** — 운영자도 여기로 와서 「새 자료」로 만들고, 상세에서 고친다.
 * 운영자 전용 목록(`/admin/resources`)을 따로 두던 때가 있었는데, 메뉴에 자료가 두 번 떠서 걷었다(2026-09-14).
 *
 * **게시판이 아니다.** 날짜순으로 흘러가는 글이 아니라 찾아 읽는 원본 문서라, 첫 화면이 검색과 축이다.
 *
 * ## 문법은 신청 목록 한 벌이다 (2026-09-14 · `/decisions` 의 `목록-문법`)
 *
 * 머리(이름·설명·걸렀을 때만 건수) · 도구 한 줄(검색 왼쪽, 정렬·행동 오른쪽) · 축 칩 · 상자 없는 줄(열 머리) ·
 * 점선 빈 상태 — `official/enrolls/index.vue` + `view/신청받기목록.vue` 가 먼저 세운 그 모양이다.
 * 옛 판은 작은 머리(`dense`) + 태그 버튼 + 상자 안 줄이었고, 줄마다 태그 배지가 칩과 같은 말을 두 번 했다.
 *
 * ## 축은 이 화면이 안 갖는다
 *
 * 거를 것·정렬할 것·검색할 칸은 전부 **모델**(`model자료s`)이 든다 — `필터조건ss`(형태·공개) · `태그축` ·
 * `정렬조건s` · `검색필드s`. 여기가 하는 일은 「지금 무엇이 걸려 있나」뿐이고, 그 답은 **주소**가 갖는다
 * (`?f_형태=파일` · `?f_태그=서식` · `?sort=` · `?q=`). 쿼리 키는 `필터축쿼리키` — 도우미·목록5와 같은 함수라
 * 도우미가 건 주소가 이 화면에서 그대로 열린다. 옛 `?tag=` 는 이 규약으로 갈아탔다.
 *
 * - **공개 축은 로그인일 때만 칩이다.** 비회원에게는 회원 자료가 아예 안 보여서 그 축이 죽은 축이 된다.
 * - **태그 축은 태그가 하나라도 있을 때만 그린다.** 옵션이 비면 칩 줄에 이름만 남는다.
 *
 * 회원 자료(`공개` 가 아닌 것)는 비회원에게 목록에서부터 뺀다. 상세도 같은 판정으로 막는다.
 * (`/api/v0/resources` 자체는 행을 거르지 않으니 이건 화면의 규율이지 보안 경계가 아니다.)
 */
import { computed, ref, toValue, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useMyAuthStore } from '~/stores/useMyAuthStore'
import { do첫조회 } from '~/composables/do첫조회'
import { 행검색매칭 } from '~utils'
import { 필터축쿼리키 } from '~utils/models'
import { model자료s, type model자료 } from '~models/test2'

definePageMeta({ layoutHero: 'short' })

const route = useRoute()
const router = useRouter()
const { isLoggedIn: is로그인, is관리자, is수정중 } = storeToRefs(useMyAuthStore())

const 자료s = model자료s.getInstance()
await do첫조회('resources-index', () => 자료s.reads())

const 새자료 = ref<model자료 | null>(null)
const tab자동필드 = ref('')
const do새자료 = async () => {
  새자료.value = await 자료s.empty() as model자료
  is수정중.value = true
}

/** 볼 자격이 있는 자료. 이건 축이 아니라 바닥이다 — 사람이 끌 수 없다. */
const 볼수있는자료s = computed(() =>
  toValue(자료s.list).filter(자료 => 자료.공개 || is로그인.value)
)

// ─────────────────────────────────────────────────────────────────────────────
// 축 — 모델에서 그대로 가져온다
// ─────────────────────────────────────────────────────────────────────────────

const 축s = computed(() => [
  ...자료s.필터조건ss.filter(g => is로그인.value || g !== 자료s.공개필터그룹),
  ...(자료s.태그축.options.length ? [자료s.태그축] : [])
])

/** 칩 목록. 모델의 「전체」 옵션은 뺀다 — 여기가 자기 「전체」 버튼을 따로 그린다(자료 축에는 원래 없다). */
const 필터그룹s = computed((): { key: string, title: string, options: { label: string, value: string, icon?: string }[] }[] =>
  축s.value.map(g => ({
    key: g.key,
    title: g.title ?? g.key,
    options: g.options
      .filter(o => o.value !== g.기본선택)
      .map(o => ({ label: o.label, value: o.value, icon: o.icon }))
  }))
)

const 정렬options = computed(() => 자료s.정렬조건s.map(x => ({ label: x.label, value: x.value })))
const 기본정렬 = 자료s.정렬조건s[0]?.value ?? ''

// ─────────────────────────────────────────────────────────────────────────────
// 조건은 URL이 갖는다. 로컬 ref면 새로고침·뒤로가기에 날아가고 링크로 못 넘긴다.
// ─────────────────────────────────────────────────────────────────────────────

/** 쿼리를 통째로 갈아끼우지 않고 준 것만 고친다 — 다른 페이지가 얹어둔 쿼리를 지우면 안 된다. */
const do쿼리반영 = (patch: Record<string, string | null>) => {
  const query = Object.fromEntries(
    Object.entries({ ...route.query, ...patch }).filter(([, value]) => value != null && value !== '')
  )
  void router.replace({ query })
}

const get쿼리 = (key: string) => {
  const raw = route.query[key]
  const value = Array.isArray(raw) ? raw[0] : raw
  return typeof value === 'string' && value ? value : null
}

/** 주소로 들어온 값이 그 축이 아는 값일 때만 필터로 인정한다. 옛 링크·오타가 조용히 빈 목록을 만들지 않게. */
const selectedFilters = computed((): Record<string, string | null> =>
  Object.fromEntries(축s.value.map((g) => {
    const value = get쿼리(필터축쿼리키(g))
    const is유효 = !!value && value !== g.기본선택 && g.options.some(o => o.value === value)
    return [g.key, is유효 ? value : null]
  }))
)

const 활성필터수 = computed(() => Object.values(selectedFilters.value).filter(Boolean).length)

const 정렬 = computed(() => {
  const value = get쿼리('sort')
  return 자료s.정렬조건s.some(x => x.value === value) ? value! : 기본정렬
})

const do필터바꾸기 = (key: string, value: string | null) => {
  const g = 축s.value.find(x => x.key === key)
  if (g) do쿼리반영({ [필터축쿼리키(g)]: value })
}
const do정렬바꾸기 = (value: string) => do쿼리반영({ sort: value === 기본정렬 ? null : value })

// 검색어는 타이핑마다 주소를 바꾸면 낭비라 잠깐 모아서 반영한다. 입력 자체는 로컬이 갖고,
// 주소가 바깥에서 바뀐 경우(뒤로가기·링크 진입)에만 되받는다.
const search = ref(get쿼리('q') ?? '')
watchDebounced(search, v => do쿼리반영({ q: v.trim() || null }), { debounce: 300 })
watch(() => get쿼리('q'), (v) => {
  if ((v ?? '') !== search.value) search.value = v ?? ''
})

const do조건지우기 = () => {
  search.value = ''
  do쿼리반영({ q: null, sort: null, ...Object.fromEntries(축s.value.map(g => [필터축쿼리키(g), null])) })
}

// ─────────────────────────────────────────────────────────────────────────────
// 거르기·정렬 — 판정은 전부 모델의 것을 그대로 부른다
// ─────────────────────────────────────────────────────────────────────────────

const 보이는자료s = computed(() => {
  const 고른 = selectedFilters.value
  const 검색 = search.value.trim()
  const 걸러진 = 볼수있는자료s.value.filter((자료, i) =>
    축s.value.every((g) => {
      const 값 = 고른[g.key]
      if (!값) return true
      return g.options.find(o => o.value === 값)?.match(자료, i) ?? true
    })
    // 검색도 목록5·도우미와 **같은 함수**다. 훑을 칸은 `자료s.검색필드s`가 정한다.
    && 행검색매칭(자료, 자료s.검색필드s, 검색)
  )
  const func = 자료s.정렬조건s.find(x => x.value === 정렬.value)?.func
  return func ? [...걸러진].sort(func) : 걸러진
})

// ─────────────────────────────────────────────────────────────────────────────

/** 한국어 본문 기준 대략 분당 500자. 상세 레일의 「분량」 칸과 같은 셈이다. */
const 읽기분 = (자료: model자료) => Math.max(1, Math.round(자료.분량 / 500))

/** 분량 열. 읽는 글이면 걸리는 시간, 받는 글이면 파일 수 — 「형태」 축이 가르는 그 둘이다. */
const 분량문구 = (자료: model자료) =>
  (자료.받기s.length ? `파일 ${자료.받기s.length}개` : `읽기 ${읽기분(자료)}분`)

/** 좁은 화면에서 접히는 두 칸(분량·태그)을 한 줄로. 값은 위와 같은 것이다. */
const 좁은메타 = (자료: model자료) => [분량문구(자료), ...자료.태그s].join(' · ')

const do열기 = (자료: model자료) => navigateTo(`/resources/${encodeURIComponent(String(자료.stateId))}`)
</script>

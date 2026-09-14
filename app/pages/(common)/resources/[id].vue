<template>
  <!--
    **글은 칸(`--ui-container`)을 꽉 채운다** (2026-09-14). 예전엔 흐름일 때 가운데 읽기 폭(`max-w-3xl`)으로 좁혔는데,
    레이아웃이 칸 전체를 종이로 깔고 좌우 선을 그은 뒤로는 좁은 글이 칸 안에 떠서 영역이 깨진 것처럼 읽혔다.
  -->
  <div class="mx-auto w-full max-w-(--ui-container) p-3 sm:p-6">
    <mButton
      to="/resources"
      역할="조용"
      size="sm"
      icon="i-lucide-arrow-left"
      label="자료 목록"
      class="-ml-2"
    />

    <UAlert
      v-if="!자료"
      class="mt-6"
      color="warning"
      title="자료를 찾을 수 없습니다"
      :description="`요청한 자료(${ID})가 없거나 삭제되었습니다.`"
    />

    <UAlert
      v-else-if="!can읽기"
      class="mt-6"
      color="warning"
      title="회원 자료입니다"
      description="로그인한 회원만 읽을 수 있습니다."
    />

    <!--
      읽는 것(글)이 왼쪽, 결정하는 것(받기·인쇄·고치기)이 오른쪽 레일 — 신청 상세와 같은 2단이다.
      **선이 아니라 여백으로 나눈다** (2026-09-14 저녁). 레일에 상자를 두르고 머리에 밑줄을 긋고 값을 큰 굵은 글씨로
      세웠더니, 종이 칸(세로선) 안에 상자, 그 안에 구분선이라 선이 다섯 종류였고 값은 폼처럼 읽혔다.
      지금은 레일 첫 줄이 글의 눈썹 줄과 같은 높이에 서고, 좌우 여백이 같고, 선은 파일 목록의 구분선 하나뿐이다.
      **쪽 보기가 서면 레일이 손잡이로 바뀌고 좁아진다**(18rem → 11rem). 읽기 폭에 A4 두 장을 넣으면 46% 로
      줄어 안 읽혀서 글이 넓어져야 하고, 그때 레일의 나머지는 손잡이가 선 동안 필요 없는 말이다.
    -->
    <div
      v-else
      class="mt-6 grid gap-x-10 gap-y-10"
      :class="패널열림 ? 'lg:grid-cols-[minmax(0,1fr)_11rem]' : 'lg:grid-cols-[minmax(0,1fr)_18rem]'"
    >
      <!--
        **본문에 따로 종이를 안 깐다** (2026-09-14). 레이아웃(`layouts/default.vue`)이 칸 전체를 종이로 깔아서,
        여기서 `mBox종이` 를 또 두르면 종이 위 종이 상자가 되고 칸보다 좁게 떠 영역이 깨져 보였다.
        상자는 `is투명` 으로 배치만 빌린다. 인쇄에서는 `m쪽보기` 의 `@media print` 가 격자 조상의 면·선·여백을 걷는다.
      -->
      <mBox종이
        is투명
        class="min-w-0 !p-0"
      >
        <article>
          <!--
            머리는 신청 상세의 사진 없는 머리와 같은 셋 — 눈썹(형태) · 제목 · 요약. 활자는 `mPageIntro` 의 값 그대로다.
            분량·공개·올린 날·태그는 레일이 말한다 — 같은 값을 두 자리에 안 적는다.
          -->
          <header class="space-y-3">
            <p class="flex items-center gap-1.5 text-xs font-medium text-muted">
              <UIcon
                :name="형태.icon"
                class="size-4 shrink-0"
              />
              {{ 형태.label }}
            </p>
            <h1
              v-if="!is히어로제목"
              class="text-2xl font-semibold text-highlighted"
            >
              {{ 자료.제목 }}
            </h1>
            <!-- 요약이 본문 첫 문단과 같으면 안 띄운다 — 게시판에서 옮겨 온 글은 첫 문단이 곧 요약이라 같은 문장이 두 번 선다. -->
            <p
              v-if="자료.요약 && !자료.내용.trimStart().startsWith(자료.요약)"
              class="text-muted"
            >
              {{ 자료.요약 }}
            </p>
            <!--
              좁은 화면에서는 레일이 글 아래로 내려가 받기가 묻힌다 — 여기 한 번 더 세우고 레일의 파일 카드는 숨긴다.
              어느 폭에서든 받기는 화면에 **한 자리**다.
            -->
            <div
              v-if="첫파일"
              class="pt-1 lg:hidden"
            >
              <mButton
                :to="첫파일.url"
                target="_blank"
                rel="noopener noreferrer"
                역할="강조"
                icon="i-lucide-download"
                label="받기"
              />
            </div>
          </header>

          <!-- 운영자도 같은 문으로 들어와 여기서 고친다 — 게시판이 글 상세에서 「수정」으로 가는 것과 같은 자리. -->
          <div
            v-if="is고치는중"
            class="mt-8 h-[75dvh]"
          >
            <view상세5
              v-model:is수정중="is수정중"
              v-model:tab자동필드="tab자동필드"
              class="h-full border"
              is중첩
              :model-value="자료"
              :can="{ 수정: true, 삭제: true }"
              @on-close="is고치는중 = false"
            />
          </div>

          <!--
            읽기 화면이라 `<MDC>` 다 — 게시글 상세(`m/Boards/Board.vue`)·`/official/enrolls/[id]` 와 같은 자리, 같은 것.
            흐름은 `m쪽보기` 의 기본 슬롯이 그 `<MDC>` 를 그대로 세운다. 쪽·인쇄에는 제목을 첫머리에 얹는다 —
            자료 본문은 제목으로 시작하지 않아서, 안 얹으면 인쇄물에 제목이 없다(머리는 인쇄에서 걷힌다).
            첫 블록의 위 여백은 지운다 — 머리 아래 간격과 문단 여백이 더해져 첫 문단만 멀리 떨어져 있었다.
          -->
          <div
            v-else
            class="mt-8 [&_.m-본문>div>:first-child]:mt-0"
          >
            <m쪽보기
              ref="판"
              v-model:보기="보기"
              :md="본문표시"
              :제목="자료.제목"
              :여백mm="여백mm"
            />
          </div>
        </article>
      </mBox종이>

      <!-- ── 오른쪽: 결정하는 자리 ─────────────────────────────────────── -->
      <aside
        class="lg:sticky lg:top-6 lg:self-start"
        :class="패널열림 ? 'max-lg:order-first' : ''"
      >
        <!--
          쪽 보기가 켜지면 레일이 곧 손잡이다(`m쪽보기손잡이` 머리말 — 사람이 여닫는 줄). 예전엔 왼쪽 세로 줄이었다.
          끄는 토글은 손잡이의 `#앞` 에 그대로 두어, 켠 자리에서 끈다. 좁은 화면에서는 글 위로 올라온다 —
          글 아래에 두면 쪽을 넘길 때마다 스크롤 끝까지 가야 한다.
        -->
        <m쪽보기손잡이
          v-if="패널열림"
          v-model:보기="보기"
          v-model:여백mm="여백mm"
          :쪽수="판?.쪽수 ?? 1"
          :배율="판?.배율 ?? 1"
          :인쇄준비중="판?.인쇄준비중"
          :저장중="판?.저장중"
          @인쇄="판?.인쇄()"
          @저장="판?.저장($event)"
        >
          <template #앞>
            <mButton
              size="sm"
              역할="조용"
              icon="i-lucide-printer"
              켜짐
              aria-pressed="true"
              title="인쇄·보기 닫기"
              :ui="{ base: 'justify-center sm:justify-start' }"
              @click="패널토글"
            >
              <span class="hidden sm:inline">인쇄·보기</span>
            </mButton>
          </template>
        </m쪽보기손잡이>

        <div
          v-else
          class="space-y-7"
        >
          <!--
            파일 카드 — 이 문서의 주인공이고, **받기의 유일한 자리**다. 본문의 `::download` 블록은 이 화면에서 안 그린다
            (아래 `본문표시`). 면(`bg-elevated`)으로만 서고 선이 없다. 형식 배지는 주소의 확장자에서 읽고, 없으면 「파일」.
            용량은 안 적는다 — 모르는 값을 그럴듯하게 채우지 않는다.
          -->
          <section
            v-if="첫파일"
            class="rounded-xl bg-elevated/50 p-4 max-lg:hidden"
          >
            <div class="flex items-start gap-3">
              <span class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-default text-[10px] font-semibold tracking-wide text-muted ring-1 ring-default">
                {{ 파일형식(첫파일.url) }}
              </span>
              <!-- 이름이 제목과 같으면(시드가 그렇다) 안 적는다 — 바로 왼쪽 h1 을 되풀이하는 셈이라서. 그때는 집이 이름 자리에 선다. -->
              <div class="min-w-0 self-center">
                <p class="line-clamp-2 text-sm font-medium text-highlighted">
                  {{ 카드이름(첫파일) || 파일집(첫파일.url) || '받을 파일' }}
                </p>
                <p
                  v-if="카드이름(첫파일) && 파일집(첫파일.url)"
                  class="mt-0.5 truncate text-xs text-dimmed"
                >
                  {{ 파일집(첫파일.url) }}
                </p>
              </div>
            </div>
            <mButton
              :to="첫파일.url"
              target="_blank"
              rel="noopener noreferrer"
              block
              역할="강조"
              icon="i-lucide-download"
              label="받기"
              class="mt-4"
            />
            <ul
              v-if="나머지파일s.length"
              class="mt-3 space-y-1.5 border-t border-default pt-3"
            >
              <li
                v-for="파일 in 나머지파일s"
                :key="파일.url"
              >
                <NuxtLink
                  :to="파일.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex items-center gap-1.5 text-xs text-muted hover:text-default"
                >
                  <UIcon
                    name="i-lucide-download"
                    class="size-3.5 shrink-0"
                  />
                  <span class="truncate">{{ 파일.title || 파일이름(파일.url) }}</span>
                </NuxtLink>
              </li>
            </ul>
          </section>

          <!-- 정보 — 값은 속성이라 작은 글씨다. 큰 굵은 숫자 문법은 요금·자리처럼 값이 숫자일 때(신청 상세)의 것이다. -->
          <section>
            <p class="text-xs font-medium text-dimmed">
              정보
            </p>
            <dl class="mt-3 space-y-2.5 text-sm">
              <div
                v-for="줄 in 정보줄s"
                :key="줄.label"
                class="flex items-baseline justify-between gap-4"
              >
                <dt class="shrink-0 text-muted">
                  {{ 줄.label }}
                </dt>
                <dd class="min-w-0 truncate text-right text-default tabular-nums">
                  {{ 줄.value }}
                </dd>
              </div>
              <!-- 태그는 누르면 목록이 그 축으로 열린다 — 목록 칩과 같은 주소 규약(`?f_태그=`). -->
              <div
                v-if="자료.태그s.length"
                class="flex items-start justify-between gap-4"
              >
                <dt class="shrink-0 pt-1 text-muted">
                  태그
                </dt>
                <dd class="flex min-w-0 flex-wrap justify-end gap-1">
                  <mButton
                    v-for="태그 in 자료.태그s"
                    :key="태그"
                    :to="태그주소(태그)"
                    size="xs"
                    역할="조용"
                    icon="i-lucide-tag"
                    :label="태그"
                  />
                </dd>
              </div>
            </dl>
          </section>

          <div class="flex flex-wrap gap-2">
            <mButton
              size="sm"
              역할="조용"
              icon="i-lucide-printer"
              label="인쇄·보기"
              title="쪽 보기 · 여백 · 인쇄"
              :disabled="!쪽보기됨"
              @click="패널토글"
            />
            <mButton
              v-if="is관리자"
              size="sm"
              역할="조용"
              :icon="is고치는중 ? 'i-lucide-eye' : 'i-lucide-pencil'"
              :label="is고치는중 ? '읽기로' : '고치기'"
              @click="do고치기전환"
            />
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 자료 한 건. **문은 역할과 상관없이 하나다** — 운영자는 여기서 「고치기」로 상세5(`Input본문`)를 펼친다.
 * 운영자 전용 목록(`/admin/resources`)을 따로 두던 때가 있었는데, 메뉴에 자료가 두 번 떠서 걷었다(2026-09-14).
 *
 * ## 2단이다 (2026-09-14 · `/decisions` 의 `목록-문법`)
 *
 * 신청 상세(`official/enrolls/[id].vue`)와 같은 골격 — 읽는 것이 왼쪽, 결정하는 것이 오른쪽 레일.
 * 레일에 서는 것: 파일 카드 · 정보(분량·공개·올린 날·태그) · 인쇄·보기 · (운영자) 고치기.
 *
 * **받기는 한 자리다.** 파일 카드가 그 자리고, 본문의 `::download` 블록은 여기서 안 그린다(`본문표시`) —
 * 둘 다 그리면 같은 파일이 한 화면에 두 번 선다. 인쇄물·저장 파일에도 안 실리는데, 종이 위의 링크는 어차피 못 누른다.
 * 대가: 글쓴이가 「아래 서식을 받아」 하고 블록을 가리켰다면 그 문장이 허공을 가리킨다. 시드는 전부 블록이 본문 끝이라 아직 없다.
 * 좁은 화면(레일이 글 아래)에서는 머리에 받기 버튼을 세우고 파일 카드를 숨긴다 — 폭마다 한 자리.
 *
 * 쪽 보기(`m쪽보기`)의 손잡이는 예전에 **왼쪽** 세로 줄이었다. 레일이 생기면서 그 자리를 레일이 대신한다 —
 * 켜면 레일이 손잡이가 되고 좁아지며(글이 넓어진다), 끄면 레일로 돌아온다.
 *
 * 챗봇의 「전문 보기」 링크가 여기로 온다(`~utils/ai/sources.ts`). 예전엔 `/md-file/{id}` 가
 * md 원문을 text/plain 으로 내주던 자리였다.
 *
 * 회원 자료는 비회원에게 막는다 — 목록(`./index.vue`)과 같은 판정. 화면의 규율이지 보안 경계는 아니다.
 */
import { useHeroPageTitle, useIsHeroTitle } from '~/composables/useLayoutHero'
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useMyAuthStore } from '~/stores/useMyAuthStore'
import { do첫조회 } from '~/composables/do첫조회'
import { mDayjs } from '~utils'
import { 필터축쿼리키 } from '~utils/models'
import { model자료s } from '~models/test2'
import { 기본여백mm, type i쪽보기, type i저장형식 } from '~base-comps/m/쪽보기/_옵션'

definePageMeta({ layoutHero: 'short' })

const route = useRoute()
const ID = computed(() => decodeURIComponent(String(route.params.id ?? '').trim()))
const { isLoggedIn: is로그인, is관리자, is수정중 } = storeToRefs(useMyAuthStore())

const is고치는중 = ref(false)
const tab자동필드 = ref('')
const do고치기전환 = () => {
  is고치는중.value = !is고치는중.value
  is수정중.value = is고치는중.value
}

const 자료s = model자료s.getInstance()
await do첫조회('resources-[id]', () => 자료s.reads())

const 자료 = computed(() => (ID.value ? 자료s.getById(ID.value) : undefined))
const can읽기 = computed(() => Boolean(자료.value?.공개 || is로그인.value))
/** 공식 레이아웃에선 제목이 히어로로 올라간다(`useHeroPageTitle`). 못 읽는 회원 자료는 제목도 안 올린다 — 비회원 목록이 그 줄을 이미 빼고 있다. */
const 히어로제목 = computed(() => (can읽기.value ? 자료.value?.제목 : ''))
useHeroPageTitle(히어로제목)
const is히어로제목 = useIsHeroTitle(() => 자료.value?.제목)

// ─────────────────────────────────────────────────────────────────────────────
// 머리·레일 — 값은 모델이 든 것을 그리기만 한다
// ─────────────────────────────────────────────────────────────────────────────

const 첫파일 = computed(() => 자료.value?.받기s[0] ?? null)
const 나머지파일s = computed(() => 자료.value?.받기s.slice(1) ?? [])

/** 눈썹. 목록의 「형태」 축과 같은 말·같은 아이콘이다(`model자료s.형태필터그룹`). */
const 형태 = computed(() => {
  const 옵션 = 자료s.형태필터그룹.options.find(o => o.value === (첫파일.value ? '파일' : '문서'))
  return { label: 옵션?.label ?? '', icon: 옵션?.icon ?? 'i-lucide-file-text' }
})

/**
 * 본문의 받기 블록을 뺀 md — 받기는 레일 한 자리다(머리말). 여는 줄 모양은 `~utils` 의 `본문받기s` 와 같고,
 * 블록이 `::download{…}` 한 줄 뒤에 닫는 `::` 줄을 갖는 꼴(시드가 그렇다)이면 그 줄까지 같이 뺀다 —
 * 안 빼면 「::」 두 글자가 본문에 남는다. 콜론 수가 같은 닫는 줄만 뺀다(`::columns` 안의 `:::download` 는 `:::` 로 닫힌다).
 */
const 본문표시 = computed(() =>
  (자료.value?.내용 ?? '').replace(
    /^[ \t]*(:{2,3})download\{[^}\n]*\}[ \t]*\r?\n?(?:(?:[ \t]*\r?\n)*[ \t]*\1[ \t]*(?:\r?\n|$))?/gm,
    ''
  )
)

/** 한국어 본문 기준 대략 분당 500자. 목록의 「분량」 열과 같은 셈이다. */
const 읽기분 = computed(() => Math.max(1, Math.round((자료.value?.분량 ?? 0) / 500)))

const 올린날 = computed(() => {
  const d = mDayjs(자료.value?.state?.createdAt)
  return d.isValid() ? d.format('YYYY-MM-DD') : ''
})

/** 정보 줄. 파일 문서에는 분량을 안 적는다 — 파일 설명 몇 줄의 글자 수는 분량이 아니다. */
const 정보줄s = computed(() => {
  const r = 자료.value
  if (!r) return []
  return [
    ...(첫파일.value ? [] : [{ label: '분량', value: `읽기 ${읽기분.value}분 · ${r.분량.toLocaleString('ko-KR')}자` }]),
    { label: '공개', value: r.공개 ? '누구나' : '회원' },
    ...(올린날.value ? [{ label: '올린 날', value: 올린날.value }] : [])
  ]
})

/** 주소 끝의 파일 이름. 제목 없는 받기 블록의 라벨(`mdc/Download.vue` 와 같은 셈). */
const 파일이름 = (url: string) => {
  const 끝 = (String(url).split(/[?#]/)[0] ?? '').split('/').filter(Boolean).at(-1) ?? ''
  try {
    return decodeURIComponent(끝) || '받을 파일'
  } catch {
    return 끝 || '받을 파일'
  }
}

/** 확장자. 자리표시 주소(`notion.so/product`)에는 없다 — 그런 주소의 마지막 조각은 파일 이름이 아니다. */
const 확장자 = (url: string) => /\.([a-z0-9]{1,5})$/i.exec(파일이름(url))?.[1] ?? ''

/** 형식 배지 — 확장자가 있으면 그것(PDF·XLSX), 없으면 「파일」. */
const 파일형식 = (url: string) => 확장자(url).toUpperCase() || '파일'

/**
 * 파일 카드에 적을 이름. 블록의 제목이 자료 제목과 다르면 그것, 같으면 진짜 파일 이름(확장자 있는 것)만.
 * 둘 다 아니면 빈 문자열 — 카드는 집(host)을 대신 적는다.
 */
const 카드이름 = (파일: { url: string, title: string }) => {
  const 제목 = 파일.title.trim()
  if (제목 && 제목 !== (자료.value?.제목 ?? '').trim()) return 제목
  return 확장자(파일.url) ? 파일이름(파일.url) : ''
}

/** 파일이 있는 집. `www.` 는 뗀다. */
const 파일집 = (url: string) => {
  try {
    return new URL(url).host.replace(/^www\./, '')
  } catch {
    return ''
  }
}

/** 목록이 그 태그로 걸린 채 열리는 주소. 키는 목록 칩과 같은 함수가 만든다. */
const 태그주소 = (태그: string) => ({ path: '/resources', query: { [필터축쿼리키(자료s.태그축)]: 태그 } })

// ─────────────────────────────────────────────────────────────────────────────
// 쪽 보기
// ─────────────────────────────────────────────────────────────────────────────

/** 쪽 보기(흐름·1쪽·2쪽 · 여백 · 인쇄)는 읽을 수 있고 고치는 중이 아닐 때만 선다. 판은 `m쪽보기`. */
const 쪽보기됨 = computed(() => Boolean(자료.value && can읽기.value && !is고치는중.value))
const 보기 = ref<i쪽보기>('흐름')
const 여백mm = ref(기본여백mm)
const 판 = ref<{ 인쇄: () => Promise<void>, 저장: (형식: i저장형식) => Promise<void>, 쪽수: number, 배율: number, 인쇄준비중: boolean, 저장중: i저장형식 | null } | null>(null)

/** 「인쇄·보기」 토글. 닫으면 쪽이던 판도 흐름으로 내린다 — 손잡이 없이 쪽만 남으면 되돌릴 길이 없다. */
const 패널켬 = ref(false)
const 패널열림 = computed(() => 쪽보기됨.value && 패널켬.value)
const 패널토글 = () => {
  패널켬.value = !패널켬.value
  if (!패널켬.value) 보기.value = '흐름'
}
</script>

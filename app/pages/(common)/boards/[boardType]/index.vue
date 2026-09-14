<template>
  <!--
    목록 폭은 레이아웃 칸(`--ui-container`)을 꽉 채운다. 뷰포트만큼 열어두면 제목은 왼쪽 끝, 메타는 오른쪽 끝으로
    찢어져 한 행으로 안 읽혀서 한때 `max-w-5xl` 로 묶었는데, 이제 칸이 헤더와 같은 폭으로 닫혀 있고
    칸 좌우 선보다 좁으면 영역이 깨진 것처럼 읽혀서(2026-09-14) 칸에 맞췄다.
  -->
  <div class="mx-auto w-full max-w-(--ui-container) space-y-4 p-3 sm:p-6">
    <!--
      **제목은 게시판 이름이다**(2026-09-06). 예전에는 이름이 작은 눈썹으로 밀리고 h1 자리에
      `페이지인트로.title` 의 카피(「…빠르게 확인하세요」)가 들어가 있었다 — 위계가 뒤집혀 있었고,
      그게 이 화면이 촌스러워 보이던 큰 몫이다. 목록 화면의 제목은 「여기가 어디냐」지 「왜 좋냐」가 아니다.

      **눈썹은 없다**(2026-09-14). 예전엔 노출 메뉴 이름을 상위 묶음으로 띄웠는데, 게시판이 GNB 「소통」
      한 칸으로 묶이면서 그 한 칸이 이미 「어디냐」를 말하고, 입구 메뉴 행은 묶음 이름(소통)을 들고 있어 게시판 이름과 어긋나
      눈썹이 오히려 틀린 말을 했다.
    -->
    <mPageIntro
      :title="인트로.title"
      :description="인트로.description"
    >
      <!-- 건수는 조건을 걸었을 때만 할 말이 있다. 안 걸었으면 아래 목록이 그대로 그 수다(신청 목록과 같은 규칙). -->
      <template #trailing>
        <p
          v-if="is검색중"
          class="text-sm text-muted tabular-nums"
        >
          전체 {{ rows.length }}건 중 <span class="font-semibold text-toned">{{ sortedRows.length }}</span>건
        </p>
      </template>
    </mPageIntro>

    <!--
      **게시판 화면은 한 벌이다**(2026-09-14 동결). 게시판을 바꿔도 탭·검색·줄 문법이 같고,
      다른 건 글이 가진 것뿐이다 — FAQ면 답이 그 자리에서 펼쳐지고, 받을 파일이 있으면 받기가 선다(`mBoards행`).
      보기 전환(`?view=`)·정렬·구분 칸은 없다. 표시형식마다 본문 컴포넌트를 네 벌 두고 사람이 고르게 하던
      2026-09-06 구조를 걷었다 — 게시판은 없으면 욕먹고 있어도 칭찬 안 받는 기능이라 뻔한 게 맞고,
      품은 핵심 화면에 쓴다. 판: `/decisions/boards/list`, 기록: `/decisions` 의 `게시판-형태`.

      **옷은 신청 목록과 같다**(2026-09-14 저녁 · `/decisions` 의 `목록-문법`). 동결은 컨트롤을 안 늘린다는 뜻이지
      옷이 달라도 된다는 뜻이 아니었다 — 머리·밑줄 갈래·도구 줄·맨 줄·점선 빈 상태가 `official/enrolls/index.vue` 와
      같은 모양이다. 세그먼트 탭과 상자 안 줄이 그 전 판이다.
    -->

    <!-- 갈래: 게시판. 주소가 곧 고른 값이라 따로 기억하지 않는다. 하나뿐이면 안 그린다. -->
    <div
      v-if="게시판탭s.length > 1"
      class="flex items-end gap-6 border-b border-default"
    >
      <button
        v-for="탭 in 게시판탭s"
        :key="탭.value"
        type="button"
        class="-mb-px flex items-center gap-2 border-b-2 pb-2 text-lg transition-colors"
        :class="탭.value === 탭슬러그 ? 'border-inverted font-semibold text-highlighted' : 'border-transparent text-muted hover:text-default'"
        @click="탭슬러그 = 탭.value"
      >
        {{ 탭.label }}
        <span
          class="text-sm tabular-nums"
          :class="탭.value === 탭슬러그 ? 'text-toned' : 'text-dimmed'"
        >{{ 탭.글수 }}</span>
      </button>
    </div>

    <!-- 도구 — 검색은 왼쪽, 행동은 오른쪽. -->
    <div class="flex flex-wrap items-center gap-2">
      <UInput
        v-model="keyword"
        icon="i-ph-magnifying-glass-light"
        class="w-full sm:w-64"
        placeholder="제목·작성자·내용으로 검색"
        aria-label="게시글 검색"
      >
        <template
          v-if="keyword"
          #trailing
        >
          <mButton
            역할="인라인"
            size="xs"
            icon="i-ph-x-light"
            aria-label="검색어 지우기"
            @click="keyword = ''"
          />
        </template>
      </UInput>
      <div class="grow" />
      <mButton
        v-if="can글쓰기"
        역할="강조"
        icon="i-lucide-pencil-line"
        label="글쓰기"
        @click="navigateTo(`/boards/${encodeURIComponent(boardSlug)}/write`)"
      />
    </div>

    <!-- ── 조건에 맞는 게 없다 ──────────────────────────────────────── -->
    <div
      v-if="!sortedRows.length"
      class="rounded-xl border border-dashed border-default px-6 py-14 text-center"
    >
      <UIcon
        :name="resolvedBoard?.아이콘 || 'i-ph-chats-light'"
        class="size-10 text-dimmed"
      />
      <p class="mt-2 text-sm text-muted">
        {{ is검색중 ? '조건에 맞는 글이 없습니다.' : '아직 등록된 글이 없습니다.' }}
      </p>
      <mButton
        v-if="is검색중"
        class="mt-3"
        size="xs"
        label="조건 지우기"
        @click="keyword = ''"
      />
    </div>

    <!-- ── 줄 ───────────────────────────────────────────────────────── -->
    <!-- 상자를 안 두른다 — 줄마다 선이고, 위아래 선이 목록의 끝이다(신청 목록과 같은 골격). -->
    <ul
      v-else
      class="divide-y divide-default border-y border-default"
    >
      <li
        v-for="row in pagedRows"
        :key="row.id"
      >
        <mBoards행
          :row="row"
          :is펼침="is펼침"
        />
      </li>
    </ul>

    <div
      v-if="sortedRows.length > 쪽크기"
      class="flex justify-end"
    >
      <!--
        지금 쪽은 **면**으로 말한다(soft). 색을 쓰면 화면에서 색을 가진 자리가 둘이 되고
        (글쓰기 버튼이 이미 강조색이다), 그러면 색이 아무 말도 안 하게 된다 — CLAUDE.md 「테마」.
      -->
      <UPagination
        v-model:page="page"
        size="xs"
        variant="ghost"
        active-color="neutral"
        active-variant="soft"
        :items-per-page="쪽크기"
        :total="sortedRows.length"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
// 게시글 /boards안에 넣어야 라우팅 에러로부터 안전함.
import {
  model게시판s,
  model회원게시글s,
  model회원s,
  type model게시판,
  type model회원게시글
} from '~models/test2'
import { useBoardFilter, type BoardRow } from '~/composables/useBoardFilter'
import { storeToRefs } from 'pinia'
import { useMyAuthStore } from '~/stores/useMyAuthStore'

definePageMeta({ layoutHero: 'short' })

const route = useRoute()

const boardSlug = computed(() => decodeURIComponent(String(route.params.boardType ?? '').trim()))

const boardsRepo = model게시판s.getInstance()
const postsRepo = model회원게시글s.getInstance()

await Promise.all([
  boardsRepo.reads(),
  postsRepo.reads(),
  model회원s.getInstance().reads()
])

/** 슬러그·공개여부는 게시판(`boards`)이 소유한다. 이 경로에 올 수 있는지는 메뉴 기반 미들웨어가 이미 판단했다. */
const resolvedBoard = computed((): model게시판 | null => {
  const board = boardsRepo.getBy슬러그(boardSlug.value)
  return board?.공개 ? board : null
})

if (!resolvedBoard.value) {
  throw createError({
    statusCode: 404,
    statusMessage: '게시판을 찾을 수 없습니다.'
  })
}

/** 쓰기 자격은 게시판이 소유한다(`쓰기권한`) — 버튼과 `/write` 페이지가 같은 답을 봐야 한다. */
const { isLoggedIn: is로그인, is관리자 } = storeToRefs(useMyAuthStore())
const can글쓰기 = computed(
  () => resolvedBoard.value?.can글쓰기({ is로그인: is로그인.value, is관리자: is관리자.value }) ?? false
)

/**
 * 탭에 서는 게시판들 — 공개됐고 메뉴에 걸린 것만. 메뉴에 안 걸린 게시판은 읽기 권한을
 * 판단할 경로가 없어(`access-control.global.ts` 는 메뉴 기준) 탭으로 열어 줄 수 없다.
 *
 * 순서는 메뉴 행 순서다. GNB 「소통」 한 칸이 공지 게시판 메뉴(첫 행)라서, 들어온 자리가 첫 탭이어야 한다.
 */
/** 갈래 옆 숫자 — 게시판마다 공개 글 수. 지금 게시판의 `rows` 와 같은 판정(공개)으로 센다. */
const 글수By게시판 = computed(() => {
  const 셈 = new Map<string, number>()
  for (const p of toValue(postsRepo.list) as model회원게시글[]) {
    if (!p.공개) continue
    const bid = String(p.state?.boardId ?? '')
    셈.set(bid, (셈.get(bid) ?? 0) + 1)
  }
  return 셈
})

const 게시판탭s = computed(() =>
  toValue(boardsRepo.list)
    .filter(b => b.공개 && b.슬러그 && b.노출메뉴)
    .sort((a, b) => Number(a.노출메뉴!.stateId) - Number(b.노출메뉴!.stateId))
    .map(b => ({
      label: b.이름 || b.슬러그,
      value: b.슬러그,
      글수: 글수By게시판.value.get(String(b.state?.id ?? b.id ?? '')) ?? 0
    }))
)

const 탭슬러그 = computed({
  get: () => resolvedBoard.value?.슬러그 ?? boardSlug.value,
  set: (slug) => {
    if (slug && slug !== boardSlug.value) void navigateTo(`/boards/${encodeURIComponent(String(slug))}`)
  }
})

/**
 * 답을 그 자리에서 펼치나. 표시형식이 이제 이것 하나만 가른다 — FAQ는 제목만 보고 상세로
 * 한 번 더 들어가는 게 최악이라서다. 다른 값(목록·카드)은 같은 줄로 그린다.
 */
const is펼침 = computed(() => resolvedBoard.value?.표시형식 === 'FAQ')

/**
 * 제목은 **이름**, 설명은 **설명**.
 *
 * `페이지인트로.title` 에 든 카피는 설명 자리로 내려온다 — 설명이 따로 있으면 그쪽이 이기고,
 * 없을 때만 카피가 그 자리를 메운다. 셋 다 비면 게시판 요약이 받는다.
 */
const 인트로 = computed(() => {
  const b = resolvedBoard.value
  const intro = b?.페이지인트로
  return {
    title: b?.이름?.trim() || '게시판',
    description: intro?.description?.trim() || intro?.title?.trim() || b?.요약?.trim() || ''
  }
})

const rows = computed((): BoardRow[] => {
  const b = resolvedBoard.value
  const slug = boardSlug.value
  if (!b || !slug) return []
  const bid = String(b.state?.id ?? b.id ?? '')
  return [...toValue(postsRepo.list)]
    .filter((p: model회원게시글) => String(p.state?.boardId ?? '') === bid && p.공개)
    .map(p => ({
      id: p.id ?? p.state?.id ?? '',
      // 게시글에 분류 필드가 없다 — 넣으면 전 행이 같은 값이라 "구분" 칸이 죽는다. 생기면 그때 채운다.
      type: undefined,
      title: p.제목,
      // 비회원 글은 적어 낸 이름이 작성자다 — 예전엔 회원 이름만 보고 전부 「회원」으로 떨어졌다.
      author: p.is비회원 ? (p.게스트명 || '비회원') : (p.회원?.이름?.trim() || '회원'),
      date: p.작성일시.toDate(),
      views: p.조회수,
      likes: p.좋아요수,
      body: p.본문 ?? '',
      thumbnail: p.대표썸네일 || null,
      path: `/boards/${encodeURIComponent(slug)}/${encodeURIComponent(String(p.id ?? p.state?.id ?? ''))}`
    }))
})

const { keyword, sortedRows, is검색중 } = useBoardFilter(rows)

const 쪽크기 = 10
const page = ref(1)
const pagedRows = computed(() => sortedRows.value.slice((page.value - 1) * 쪽크기, page.value * 쪽크기))

// 검색어가 바뀌면 첫 쪽으로 — 3쪽에 머물러 있으면 빈 쪽을 볼 수 있다.
// 게시판을 옮겨도 라우트 컴포넌트는 그대로라 다시 마운트되지 않는다 — 앞 게시판의 검색·쪽을 물려주지 않는다.
watch(keyword, () => {
  page.value = 1
})
watch(boardSlug, () => {
  keyword.value = ''
  page.value = 1
})
</script>

<!--
  게시판 — 뻔하게 묶고 멈춘다 (2026-09-14 동결). 기록은 `/decisions` 의 `게시판-형태`.

  FAQ·공지는 **없으면 욕먹고 있어도 칭찬 안 받는** 기능이다. 그래서 뻔한 게 맞고,
  여기에 쓰는 에너지는 적을수록 좋다. 이 판은 그 결론을 두 자리로 보여준다.

  ① **게시판 화면은 한 벌.** 게시판을 바꿔도 탭·검색·줄 문법이 같고, 다른 건 글이 가진 것뿐이다
     (답이 있으면 펼침, 받을 파일이 있으면 받기 — `mBoards행`). 보기 전환·정렬 칸은 없다.
     실코드로 갔다 — `(common)/boards/[boardType]/index.vue`.
  ② **참신함은 핵심 화면에만.** 신청 화면이 같은 글을 끌어다 「알아둘 것」으로 띄운다.
     게시판을 찾아가지 않아도 필요한 순간에 글이 온다. **아직 안 넣었다** — 글과 신청받기를 잇는 칸이
     없어서, 여기서는 손으로 집었다. 무엇으로 이을지(태그·연결 칸·본문 링크)부터 정해야 한다.

  ## 이 판이 대신한 것

  2026-09-06 에는 네 안(목록↔카드 · 주소가 든다 · 게시판이 정한다 · 한 형태로 통일)을 진짜
  `mBoardsShell` 에 물려 보고 「넷 다 열고 주소가 든다(`?view=`)」를 골랐다. 표시형식마다 본문 컴포넌트가
  네 벌(`Boards`·`Cards`·`Faq`·`Docs`)이었고, 툴바에 구분·정렬·보기 선택기가 섰다.
  동결로 그 넷과 껍데기·툴바를 지웠다. 그때 「한 형태로 통일」이 진 이유(FAQ가 그 자리에서 답을 펼치는 값을
  잃는다)는 줄이 펼침을 갖게 되면서 없어졌다.

  자료실 게시판은 없다 — 자료는 `model자료`(`/resources`) 하나다. 그래서 탭은 셋이고, ②의 받기 줄은
  그쪽 글을 끌어왔을 때의 모습이다.

  표본은 `./_표본.ts` — 상세 판(`detail`)과 같이 본다.
-->
<template>
  <div class="mx-auto flex w-full max-w-3xl flex-col gap-10 px-4 py-8">
    <header class="space-y-3">
      <h1 class="text-2xl font-semibold text-highlighted">
        게시판 — 뻔하게 묶고 멈춘다
      </h1>
      <ol class="list-inside list-decimal space-y-1 text-sm text-muted">
        <li>FAQ·공지는 <b class="text-default">없으면 안 되지만 차별점은 아니다</b> → 뻔해도 된다</li>
        <li>그래서 <b class="text-default">한 벌로 묶고, 더 손대지 않는다</b></li>
        <li>새로움은 <b class="text-default">핵심 화면이 글을 끌어다 쓸 때만</b></li>
      </ol>
    </header>

    <section class="space-y-3">
      <h2 class="text-sm font-medium text-highlighted">
        ① 게시판 화면 — 한 벌로 끝 <span class="font-normal text-dimmed">· 반영됨</span>
      </h2>

      <div class="flex flex-wrap items-center gap-2">
        <mTabs
          v-model="고른형식"
          type="segment"
          size="sm"
          :items="탭s"
        />
        <UInput
          v-model="검색어"
          icon="i-lucide-search"
          placeholder="검색"
          size="sm"
          class="grow"
        />
      </div>

      <ul class="divide-y divide-default overflow-hidden rounded-xl border border-default bg-default">
        <li
          v-for="row in 보이는행s"
          :key="row.id"
        >
          <mBoards행
            :row="row"
            :is펼침="고른형식 === 'FAQ'"
          />
        </li>
        <li
          v-if="!보이는행s.length"
          class="px-4 py-10 text-center text-sm text-muted"
        >
          조건에 맞는 글이 없습니다.
        </li>
      </ul>
    </section>

    <section class="space-y-3">
      <h2 class="text-sm font-medium text-highlighted">
        ② 핵심 화면이 끌어다 쓴다 — 신청 화면 예시 <span class="font-normal text-warning">· 아직</span>
      </h2>

      <div class="overflow-hidden rounded-xl border border-default bg-default">
        <div class="flex flex-wrap items-center gap-3 px-4 py-4">
          <div class="min-w-0 grow">
            <p class="text-lg font-semibold text-highlighted">
              2026 하반기 지원 프로젝트 참여
            </p>
            <p class="text-sm text-muted">
              11월 ~ 1월 · 격주 토요일 14:00 · 온라인
            </p>
          </div>
          <mButton 역할="강조">
            신청하기
          </mButton>
        </div>

        <div class="border-t border-default bg-muted/40">
          <p class="px-4 pt-3 text-xs font-medium text-muted">
            알아둘 것
          </p>
          <ul class="divide-y divide-default">
            <li
              v-for="끌어온것 in 알아둘것s"
              :key="끌어온것.row.id"
            >
              <mBoards행
                :row="끌어온것.row"
                :is펼침="끌어온것.is펼침"
                is조밀
              />
            </li>
          </ul>
        </div>
      </div>

      <p class="text-xs leading-relaxed text-dimmed">
        글과 신청받기를 잇는 칸이 아직 없다 — 위 네 줄은 손으로 집었다. 무엇으로 이을지 정하면
        <code>(member)/do-enrolls/[id].vue</code> 에 이 구역이 선다.
      </p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { i게시판표시형식 } from '~models/test2'
import { 표본게시판s, 표본행s } from './_표본'

definePageMeta({
  제목: '게시판 동결안'
})

/** 자료실은 게시판이 아니다(`model자료`) — 탭은 셋. */
const 탭s = 표본게시판s
  .filter(게시판 => 게시판.형식 !== 'DOCS')
  .map(게시판 => ({ label: 게시판.이름, value: 게시판.형식 }))

const 고른형식 = ref<i게시판표시형식>('LIST')
const 검색어 = ref('')

const 보이는행s = computed(() => {
  const 말 = 검색어.value.trim()
  return 표본행s(고른형식.value, false)
    .filter(row => !말 || row.title.includes(말) || (row.body ?? '').includes(말))
})

const 글 = (형식: i게시판표시형식, id: string) =>
  표본행s(형식, false).find(row => row.id === id)!

/** 이 신청받기에 걸린 글들. 실코드에서는 글에 붙은 태그·연결로 고른다 — 여기서는 손으로 집었다. */
const 알아둘것s = [
  { row: 글('LIST', 'n5'), is펼침: false },
  { row: 글('FAQ', 'f1'), is펼침: true },
  { row: 글('FAQ', 'f2'), is펼침: true },
  { row: 글('DOCS', 'd1'), is펼침: false }
]
</script>

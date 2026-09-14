<template>
  <!--
    게시판 글 한 줄 — **게시판마다 화면을 갈지 않고, 글이 가진 것만큼 줄이 자란다.**

    골격은 늘 같다: 제목 + 메타(작성자·날짜·조회). 여기에 붙는 것은 글의 속성이 정한다 —
    답이 펼쳐지는 글이면 그 자리에서 펼치고, 받을 파일(`::download`)이 있으면 받기 버튼이 서고,
    그림이 있으면 작은 그림이 붙는다(없으면 자리째 없다 — 신청 카드와 같은 규칙).
    그래서 공지·소식·FAQ가 같은 문법으로 읽힌다(판: `/decisions/boards/list`, 기록: `/decisions` 의 `게시판-형태`).

    예전엔 표시형식마다 본문 컴포넌트가 따로 있었다(목록·카드·FAQ 아코디언·자료) — 2026-09-14 동결로
    이 한 줄이 넷을 대신한다. 게시판은 없으면 욕먹고 있어도 칭찬 안 받는 기능이라, 여기에 쓰는 품은 적을수록 좋다.

    ## 줄은 마크업 한 벌이다 (2026-09-14 저녁 · `/decisions` 의 `목록-문법`)

    넓은 화면에서는 메타가 열(작성자·날짜·조회)로 서고, 좁은 화면에서는 제목 아래 한 줄로 내려온다 —
    신청 목록의 줄과 같은 방식(격자 배치만 바뀌고 위젯은 안 갈린다). 상자 안이 아니라 맨 줄이라 `hover` 도
    줄 전체가 받고, 줄 전체가 누르는 자리다(`role="button"`). 받기만 다른 일이라 `stop` 이다.

    `is조밀` 은 핵심 화면(신청 상세 등)이 끌어다 쓸 때 — 메타 열과 그림을 뺀다.
  -->
  <div>
    <div
      class="grid cursor-pointer items-center gap-x-3 gap-y-1 px-3 py-3 transition-colors hover:bg-elevated"
      :class="열s"
      role="button"
      tabindex="0"
      :aria-expanded="is펼침 ? 열림 : undefined"
      @click="on누름"
      @keydown.enter.self="on누름"
      @keydown.space.self.prevent="on누름"
    >
      <div class="flex min-w-0 items-center gap-3">
        <UIcon
          v-if="is펼침"
          name="i-lucide-chevron-right"
          class="size-4 shrink-0 text-dimmed transition-transform"
          :class="{ 'rotate-90': 열림 }"
        />
        <NuxtImg
          v-if="row.thumbnail && !is조밀"
          :src="row.thumbnail"
          alt=""
          class="h-11 w-16 shrink-0 rounded-md object-cover"
          width="128"
          height="88"
          format="webp"
          loading="lazy"
          quality="80"
        />
        <div class="min-w-0 grow">
          <div class="flex items-center gap-1.5">
            <UBadge
              v-if="row.isPinned"
              size="xs"
              variant="subtle"
              label="공지"
            />
            <span class="min-w-0 truncate font-medium text-highlighted">
              {{ row.title || '제목 없음' }}
            </span>
          </div>
          <!-- 좁은 화면에서 접히는 세 칸(작성자·날짜·조회)을 한 줄로. 값은 옆 열과 같은 것이다. -->
          <div
            v-if="!is조밀"
            class="truncate text-xs text-dimmed md:hidden"
          >
            {{ 좁은메타 }}
          </div>
        </div>
      </div>

      <template v-if="!is조밀">
        <span class="hidden truncate text-sm text-muted md:block">{{ row.author }}</span>
        <span class="hidden text-sm tabular-nums text-muted md:block">{{ formatBoardDate(row.date) }}</span>
        <span class="hidden text-sm tabular-nums text-muted md:block">조회 {{ row.views.toLocaleString() }}</span>
      </template>

      <div class="flex items-center justify-end">
        <mButton
          v-if="받기주소"
          :to="받기주소"
          target="_blank"
          rel="noopener noreferrer"
          size="xs"
          icon="i-lucide-download"
          label="받기"
          @click.stop
        />
        <UIcon
          v-else-if="!is펼침"
          name="i-lucide-chevron-right"
          class="size-4 text-dimmed"
        />
      </div>
    </div>

    <div
      v-if="is펼침 && 열림"
      class="space-y-2 px-3 pb-4 ps-10"
    >
      <!-- 답은 md 로 저장된다(`Input본문`). 읽는 자리라 읽기 렌더러를 그대로 쓴다. -->
      <div class="m-본문 w-full overflow-x-auto">
        <ClientOnly>
          <MDC :value="row.body || '등록된 답변이 없습니다.'" />
        </ClientOnly>
      </div>
      <NuxtLink
        v-if="!is조밀"
        :to="row.path"
        class="inline-flex items-center gap-1 text-xs text-muted hover:text-default"
      >
        원문 보기
        <UIcon
          name="i-lucide-arrow-right"
          class="size-3.5"
        />
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { boardAttachmentUrl, formatBoardDate, type BoardRow } from '~/composables/useBoardFilter'

const props = defineProps<{
  row: BoardRow
  /** 누르면 상세로 가지 않고 그 자리에서 본문을 펼친다(FAQ). */
  is펼침?: boolean
  is조밀?: boolean
}>()

const 열림 = ref(false)

const 받기주소 = computed(() => boardAttachmentUrl(props.row.body))

/** 열 배치. 조밀하면 제목·행동 두 칸뿐이고, 아니면 넓은 화면에서 메타 셋이 열로 선다. */
const 열s = computed(() => (props.is조밀
  ? 'grid-cols-[minmax(0,1fr)_auto]'
  : 'grid-cols-[minmax(0,1fr)_auto] md:grid-cols-[minmax(0,1fr)_6rem_6rem_5rem_4rem]'))

const 좁은메타 = computed(() =>
  [props.row.author, formatBoardDate(props.row.date), `조회 ${props.row.views.toLocaleString()}`]
    .filter(Boolean)
    .join(' · ')
)

function on누름() {
  if (props.is펼침) {
    열림.value = !열림.value
    return
  }
  navigateTo(props.row.path)
}
</script>

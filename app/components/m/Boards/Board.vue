<!--
  게시글 상세 한 벌. **네 성격(공지·소식·질문답변·자료)을 이것 하나가 다 그린다.**

  ## 열린 질문 — 상세는 성격을 알아야 하나 (2026-09-02에 적고 미뤘다)

  목록은 성격을 조금 안다 — 한 벌 줄(`Boards/행.vue`)이지만 FAQ면 답을 펼치고 받을 파일이 있으면 받기를 세운다
  (2026-09-14 동결). 상세는 모른다. 그래서:

  - **받을 파일**이 본문 안 `::download` 블록으로만 있다(`boardAttachmentUrl` 이 뽑아 쓰는 그 블록).
    받으러 온 사람에게 받기 버튼이 본문 아래다. 자료실 게시판은 `model자료` 로 옮겨 가서 이 물음의 무게가 줄었다.
  - **질문·답변**은 목록에서 그 자리에 펼치던 답을, 상세에 들어오면 다시 한 벌로 읽는다.
  - `post.type` 이 호출부에서 `'게시글'` 로 박혀 온다 — 목록의 「구분」 칸이 죽어 있는 것과 같은 뿌리다
    (게시글에 분류 필드가 없다).

  판 셋을 깔아 뒀다: `/decisions/boards/detail` (한 벌 / 성격을 따라 넷 / 한 벌 + 주변만).
  **고르기 전까지 여기 구조를 바꾸지 말 것** — 기록은 `/decisions` 의 `게시판-상세`.

  2026-09-14 저녁에 옷만 맞췄다(`/decisions` 의 `목록-문법`) — 눈썹은 부르는 쪽이 넘길 때만 그린다(공개 상세는 안 넘긴다 —
  위 「{게시판} 목록」 링크가 그 말을 이미 한다),
  메타는 목록 줄과 같은 말·같은 순서(작성자 · 날짜 · 조회), 날짜는 목록과 같은 함수(`formatBoardDate` — UTC 로
  자르면 새벽 글이 전날로 밀린다), 여백은 페이지가 갖는다. 본문·좋아요·행동의 자리는 그대로다.
-->
<template>
  <article class="w-full space-y-8">
    <!-- 밑줄은 없다 — 자료 상세와 같이 여백으로 나눈다. 선을 그으면 그 아래 문단 여백과 더해져 첫 문단만 멀리 떨어진다. -->
    <header class="space-y-2">
      <!-- 눈썹은 상위 묶음(게시판 이름)이다 — 없으면 안 그린다(`mPageIntro` 와 같은 규칙). -->
      <p
        v-if="post.type"
        class="text-xs text-dimmed"
      >
        {{ post.type }}
      </p>
      <!-- 공식 레이아웃에선 히어로가 이 제목을 이미 말한다(`useIsHeroTitle`) — 줄째 뺀다 -->
      <h1
        v-if="!is히어로제목"
        class="text-2xl font-semibold text-highlighted"
      >
        {{ post.title }}
      </h1>
      <div class="flex flex-wrap items-center gap-x-1.5 text-sm text-muted">
        <span>{{ post.author || '-' }}</span>
        <span aria-hidden="true">·</span>
        <span class="tabular-nums">{{ formatBoardDate(post.date) || '-' }}</span>
        <span aria-hidden="true">·</span>
        <span class="tabular-nums">조회 {{ (post.views ?? 0).toLocaleString() }}</span>
      </div>
    </header>

    <!--
      **읽기 화면이라 `<MDC>` 다.** 본문은 md 로 저장되고(`Input본문`), 읽는 쪽은 그 md 를
      그대로 그린다 — `/official/enrolls/[id]` 가 같은 자리에서 같은 것을 쓴다.

      한동안 여기 편집기(`mEditor2`)가 `readonly` 로 서 있었다. 글 한 덩이 그리자고 tiptap
      인스턴스를 세우는 것이었고, `is수정중` 이 참일 때 고칠 수는 있어도 **나갈 길이 없었다**
      (`emit` 이 없다). 그래서 그 prop 도 같이 걷었다 — 아무도 안 넘기고 있었다.
    -->
    <section class="m-본문 min-h-56 w-full overflow-x-auto [&>div>:first-child]:mt-0">
      <ClientOnly>
        <MDC :value="post.content || '본문이 없습니다.'" />
      </ClientOnly>
    </section>
    <div class="flex flex-wrap items-center gap-2">
      <mButton
        icon="i-ph-heart-fill"
        역할="조용"
        size="sm"
        :loading="likeLoading"
        @click="do좋아요"
      >
        {{ (post?.likes ?? 0).toLocaleString() }}
      </mButton>
      <div class="grow" />
      <!-- 수정·삭제처럼 자격을 따져야 하는 버튼은 이 컴포넌트가 판단할 수 없다 — 부르는 쪽에 맡긴다 -->
      <slot name="actions" />
    </div>
  </article>
</template>

<script setup lang="ts">
import { formatBoardDate } from '~/composables/useBoardFilter'
import { useIsHeroTitle } from '~/composables/useLayoutHero'

interface BoardPost {
  id?: number | string
  type?: string
  title?: string
  author?: string
  date?: string | Date
  views?: number
  likes?: number
  content?: string
}

interface Props {
  post?: BoardPost
  // Backward compatibility for existing callers using :list="post"
  list?: BoardPost
  /** 좋아요 요청 중 (하트 버튼 로딩) */
  likeLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  post: undefined,
  list: undefined,
  likeLoading: false
})

const emit = defineEmits<{ like: [] }>()

const post = computed<BoardPost>(() => {
  return props.post ?? props.list ?? {}
})
const is히어로제목 = useIsHeroTitle(() => post.value.title)

const likeLoading = computed(() => props.likeLoading)

function do좋아요() {
  emit('like')
}
</script>

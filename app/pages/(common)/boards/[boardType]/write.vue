<template>
  <div class="mx-auto w-full max-w-(--ui-container) p-2 sm:p-4">
    <div
      v-if="차단"
      class="space-y-3"
    >
      <UAlert
        color="warning"
        :title="차단.title"
        :description="차단.description"
      />
      <div class="flex items-center gap-2">
        <div class="grow" />
        <mButton
          역할="조용"
          @click="navigateTo(목록경로)"
        >
          목록으로
        </mButton>
      </div>
    </div>

    <!-- 비회원 글 수정: 비밀번호 게이트 -->
    <form
      v-else-if="!is비번통과"
      class="mx-auto max-w-md space-y-4"
      @submit.prevent="do비번확인"
    >
      <div class="space-y-1">
        <h1 class="text-xl font-semibold text-highlighted">
          비회원 글 수정
        </h1>
        <p class="text-sm text-muted">
          글을 쓸 때 입력한 비밀번호를 넣어주세요.
        </p>
      </div>
      <UInput
        v-model="비번입력"
        class="w-full"
        type="password"
        placeholder="비밀번호"
        autocomplete="current-password"
        autofocus
      />
      <div class="flex items-center gap-2">
        <div class="grow" />
        <mButton
          역할="조용"
          @click="do취소"
        >
          취소
        </mButton>
        <mButton
          역할="강조"
          type="submit"
        >
          확인
        </mButton>
      </div>
    </form>

    <form
      v-else
      class="space-y-4"
      @submit.prevent="do제출"
    >
      <div class="flex flex-wrap items-end justify-between gap-2 border-b border-primary/20 pb-3">
        <div class="space-y-1">
          <p class="text-sm text-primary">
            {{ 게시판이름 }}
          </p>
          <h1 class="text-xl font-semibold text-highlighted">
            {{ is수정 ? '글 수정' : '글쓰기' }}
          </h1>
        </div>
        <p class="text-sm text-muted">
          {{ 작성자표시 }}
        </p>
      </div>

      <UFormField
        label="제목"
        required
      >
        <UInput
          v-model="글.제목"
          class="w-full"
          placeholder="제목을 입력하세요"
          :maxlength="200"
        />
      </UFormField>

      <!-- 비회원 신원은 글이 생길 때 한 번만 정한다. 수정에서 바꾸면 비번 게이트가 무의미해진다. -->
      <div
        v-if="is게스트작성"
        class="grid gap-3 sm:grid-cols-2"
      >
        <UFormField
          label="이름"
          required
        >
          <UInput
            v-model="글.게스트명"
            class="w-full"
            placeholder="표시할 이름"
            :maxlength="20"
          />
        </UFormField>
        <UFormField
          label="비밀번호"
          required
          hint="수정·삭제할 때 필요합니다"
        >
          <UInput
            v-model="글.게스트비밀번호"
            class="w-full"
            type="password"
            placeholder="비밀번호"
            autocomplete="new-password"
          />
        </UFormField>
      </div>

      <!--
        썸네일은 목록에서만 쓰인다(카드형에서는 그림이 먼저 눈에 들어오고, 목록형에서는 안 쓴다).
        그래서 필수가 아니고, 비워두면 그냥 그림 없는 글이다.
        AI 생성 탭은 관리자에게만 연다 — 이 화면은 비회원도 열 수 있어서, 열어두면 글 한 건마다
        생성 호출이 아무에게나 붙는다(`model회원게시글.do썸네일자동`이 관리자만 도는 것과 같은 이유).
      -->
      <UFormField
        label="썸네일"
        hint="목록 카드에 쓰입니다 (선택)"
      >
        <Input사진3
          v-model="글.이미지"
          class="w-full"
          tags="member-post"
          orientation="landscape"
          :count="4"
          :can생성="is관리자"
        />
      </UFormField>

      <UFormField
        label="본문"
        required
      >
        <!--
          **본문은 md 다.** `Input본문` 이 폼 칸 자리고, md ↔ 문서 객체 왕복은 한 층 아래
          `mEditorMd` 가 진다(그 머리말이 왕복의 대가를 적는다). 그 안에 서는 건 읽기 화면과
          픽셀로 같은 편집기(`mEditor`)다. AI 초안도 같은 값을 넣는다
          (`초안본문md`) — 넣는 쪽과 사람이 고치는 쪽이 같은 형식이라야 초안이 글자로 보이지 않는다.
        -->
        <Input본문
          v-model="글.본문"
          class="min-h-100 w-full"
        />
      </UFormField>

      <div class="flex items-center gap-2">
        <div class="grow" />
        <mButton
          역할="조용"
          :disabled="ing"
          @click="do취소"
        >
          취소
        </mButton>
        <mButton
          역할="강조"
          type="submit"
          :loading="ing"
        >
          {{ is수정 ? '수정' : '등록' }}
        </mButton>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
// 게시글 작성/수정을 한 화면에서 본다 — `?id=`가 있으면 수정. 두 흐름의 폼이 같아서
// 페이지를 쪼개면 편집기·검증·저장이 그대로 두 벌이 된다.
// `/boards/{슬러그}` 아래라 접근 판정은 메뉴 미들웨어가 이미 마쳤다.
import { storeToRefs } from 'pinia'
import { take행동초안 } from '~utils/ai/초안'
import { use작업대상 } from '~utils/ai/작업문맥'
import { useMyAuthStore } from '~/stores/useMyAuthStore'
import {
  model게시판s,
  model회원게시글s,
  model회원게시글,
  model회원s,
  type model게시판
} from '~models/test2'

definePageMeta({ layoutHero: 'short' })

const route = useRoute()

const boardSlug = computed(() => decodeURIComponent(String(route.params.boardType ?? '').trim()))
const 수정대상Id = computed(() => decodeURIComponent(String(route.query.id ?? '').trim()))
const is수정 = computed(() => Boolean(수정대상Id.value))

const boardsRepo = model게시판s.getInstance()
const postsRepo = model회원게시글s.getInstance()

const { isLoggedIn: is로그인, 회원Id, is관리자, 표시이름 } = storeToRefs(useMyAuthStore())

await Promise.all([
  boardsRepo.reads(),
  postsRepo.reads(),
  model회원s.getInstance().reads()
])

/** 슬러그·공개여부는 게시판(`boards`)이 소유한다. */
const board = computed((): model게시판 | null => {
  const b = boardsRepo.getBy슬러그(boardSlug.value)
  return b?.공개 ? b : null
})

if (!board.value) {
  throw createError({ statusCode: 404, statusMessage: '게시판을 찾을 수 없습니다.' })
}

const 게시판Id = computed(() => String(board.value?.state?.id ?? board.value?.id ?? ''))
const 게시판이름 = computed(() => board.value?.이름?.trim() || boardSlug.value)
const 목록경로 = computed(() => `/boards/${encodeURIComponent(boardSlug.value)}`)

const 대상글 = computed((): model회원게시글 | null => {
  if (!is수정.value) return null
  const m = postsRepo.getById(수정대상Id.value) as model회원게시글 | undefined
  if (!m) return null
  return String(m.state?.boardId ?? '') === 게시판Id.value ? m : null
})

const 권한ctx = computed(() => ({ 회원Id: 회원Id.value, is관리자: is관리자.value }))

const 차단 = computed(() => {
  // 새 글은 게시판의 `쓰기권한`이 가른다. 수정은 걸지 않는다 — 게시판을 나중에 닫았어도
  // 이미 쓴 사람은 자기 글을 건사할 수 있어야 한다(자격은 `can편집시도`가 따로 본다).
  if (!is수정.value) {
    if (!board.value?.can글쓰기({ is로그인: is로그인.value, is관리자: is관리자.value })) {
      return board.value?.쓰기권한 === 'MEMBER'
        ? {
            title: '회원만 쓸 수 있는 게시판입니다',
            description: '로그인한 뒤에 다시 시도해주세요.'
          }
        : {
            title: '글을 쓸 수 없는 게시판입니다',
            description: '이 게시판은 관리자만 글을 올릴 수 있습니다.'
          }
    }
    return null
  }
  const m = 대상글.value
  if (!m) {
    return {
      title: '글을 찾을 수 없습니다',
      description: '삭제되었거나 이 게시판에 속하지 않는 글일 수 있습니다.'
    }
  }
  if (!m.can편집시도(권한ctx.value)) {
    return {
      title: '수정할 수 없는 글입니다',
      description: '본인이 쓴 글이거나, 비밀번호를 건 비회원 글만 수정할 수 있습니다.'
    }
  }
  return null
})

const 비번입력 = ref('')
const 비번확인됨 = ref(false)
/** 게이트를 세울 필요가 없으면(신규·관리자·본인 글) 통과 상태로 시작한다. */
const is비번통과 = computed(() => {
  const m = 대상글.value
  if (!is수정.value || !m) return true
  if (m.can편집즉시(권한ctx.value)) return true
  return 비번확인됨.value
})

const ing = ref(false)

/** 신규 + 비로그인일 때만 신원을 받는다. 로그인 회원 글은 `memberId`가 작성자다. */
const is게스트작성 = computed(() => !is수정.value && !is로그인.value)

/**
 * 새 글의 그릇. **`repo.create`를 쓰면 안 된다** — 그건 부르는 즉시 POST라
 * 폼을 여는 순간 빈 글이 공개 게시판에 올라간다(`BaseModels2.create`).
 * 생성자는 state만 받고 목록에도 서버에도 닿지 않으므로, 미저장 초안의 그릇으로 이게 맞다.
 *
 * 폼을 ref 다섯 개가 아니라 모델로 들고 있는 이유: 챗봇이 잡을 게 있어야 한다.
 * `제목`·`본문`은 모델의 접근자고, `doAI초안`도 그 접근자에 쓴다 — 화면과 챗봇이 **같은 한 개**를 본다.
 *
 * 목록을 거치지 않고 만든 행이지만 `state` 반응성은 `BaseModel2` 생성자가 보장한다.
 * 여기서 따로 감쌀 것 없다 — 예전엔 그게 없어서 `doAI초안`이 채운 값이 화면에 안 나타났다.
 */
const 새글 = new model회원게시글()
// 게시판은 `state`에 직접 적는다. `게시판Id` 세터는 관리 화면용이라 확인창을 띄우고 즉시 저장까지 한다
// (`do게시판이동`) — 아직 행도 아닌 글에 걸릴 동작이 아니다.
새글.state.boardId = 게시판Id.value

/**
 * 지금 편집 중인 글. 수정이면 **저장소의 그 행을 그대로** 고친다.
 *
 * 예전처럼 ref로 복사해 두면 챗봇이 잡을 대상이 화면 안에만 있게 된다.
 * 대신 제자리 편집이라 물러설 길을 둬야 한다 — 취소·이탈에서 `do수정취소`를 부른다.
 */
const 글 = computed(() => 대상글.value ?? 새글)

/**
 * 신원은 로그인 상태를 따라간다. 세터(`게스트명`·`게스트비밀번호`)가 `is비회원`일 때만 값을 받으므로
 * 이게 먼저 서 있어야 입력이 들어간다. 수정 글의 신원은 만들 때 정해진 것이라 손대지 않는다.
 */
watch(
  [is게스트작성, 회원Id],
  ([게스트, 나]) => {
    if (is수정.value) return
    새글.is비회원 = 게스트
    새글.회원Id = 게스트 ? null : (나 || null)
  },
  { immediate: true }
)

const 작성자표시 = computed(() => {
  const m = 대상글.value
  if (m) return m.is비회원 ? `${m.게스트명 || '비회원'} (비회원)` : m.회원?.이름?.trim() || '회원'
  return is로그인.value ? 표시이름.value || '회원' : '비회원'
})

/**
 * 챗봇이 "이 내용으로 공지해"까지 말한 경우, 그 초안이 여기서 폼에 앉는다.
 *
 * 화면 전환을 건너뛰는 통로는 이것 하나다 — 이 페이지가 열리기 **전에** 나온 초안이라
 * 작업 대상으로 넘길 자리가 아직 없었다. 열린 다음부터는 아래 `use작업대상`이 그 일을 한다.
 * 초안은 한 번 쓰이면 사라진다(`take`).
 */
onMounted(() => {
  if (is수정.value) return
  const 초안 = take행동초안()
  if (!초안) return
  if (초안.제목) 새글.제목 = 초안.제목
  if (초안.본문) 새글.본문 = 초안.본문
})

/**
 * 우측 도크의 챗봇에게 "지금 이 글을 쓰고 있다"고 알린다. AI 초안 입력칸이 이 화면에서 사라진 이유다 —
 * 무엇을 쓸지 말하는 자리는 챗봇 입력창 하나이고, 그 지시가 여기 있는 이 글에 그대로 걸린다.
 *
 * 막힌 화면(권한·비번 게이트)에서는 신고하지 않는다. 손댈 수 없는 폼에 챗봇이 초안을 제안하면
 * 누르고 나서야 아무 일도 안 일어난다는 걸 알게 된다.
 */
use작업대상(
  () => (차단.value || !is비번통과.value ? null : 글.value),
  () => ({
    source: postsRepo.tableName,
    화면: `${is수정.value ? '글 수정' : '글쓰기'} · ${게시판이름.value}`,
    // 본문은 평문 파생값으로 준다(`::` 블록 표시가 자리를 먹지 않게). 매 턴 나가는 자리라 앞부분만 가이드로
    // 실리고, 라벨은 '본문' — 답변이 사용자에게 "본문텍스트"라고 옮겨 적으면 안 된다.
    필드s: ['제목', { key: '본문텍스트', label: '본문' }],
    행동s: ['doAI초안', 'do발행']
  })
)

function do비번확인() {
  const m = 대상글.value
  if (!m) return
  if (!m.is비번일치(비번입력.value)) {
    useAlert().error('비밀번호 불일치', '비밀번호가 맞지 않습니다.')
    return
  }
  비번확인됨.value = true
  비번입력.value = ''
}

const 저장됨 = ref(false)

/**
 * 수정 글은 저장소의 행을 제자리에서 고치고 있다 — 저장하지 않고 떠나면 그 편집이 목록에 남는다.
 * `do수정취소`가 마지막 저장 시점(`state2`)으로 되돌린다. 저장에 성공한 뒤라면 그 시점이 갱신돼 있어
 * 불러도 아무 일이 없다.
 */
function 되돌리기() {
  if (!is수정.value || 저장됨.value) return
  대상글.value?.do수정취소()
}

onUnmounted(되돌리기)

function do취소() {
  const m = 대상글.value
  되돌리기()
  const id = String(m?.state?.id ?? m?.id ?? '')
  void navigateTo(id ? `${목록경로.value}/${encodeURIComponent(id)}` : 목록경로.value)
}

/**
 * 등록 버튼. 검증·저장·이동은 전부 `do발행`이 한다 —
 * 챗봇의 "발행해" 버튼이 부르는 것과 **같은 하나**여야 하기 때문이다.
 * 두 벌로 두면 한쪽에만 검증이 붙는 날이 온다.
 */
async function do제출() {
  if (ing.value) return
  ing.value = true
  try {
    if (await 글.value.do발행()) 저장됨.value = true
  } finally {
    ing.value = false
  }
}
</script>

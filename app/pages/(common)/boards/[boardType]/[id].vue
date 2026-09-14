<template>
  <!-- 폭은 목록과 같은 칸(`--ui-container`)이다 — 글을 열었다 닫을 때 화면이 넓어졌다 좁아지지 않는다. -->
  <div class="mx-auto w-full max-w-(--ui-container) space-y-6 p-3 sm:p-6">
    <div>
      <mButton
        :to="`/boards/${encodeURIComponent(boardSlug)}`"
        역할="조용"
        size="sm"
        icon="i-lucide-arrow-left"
        :label="`${resolvedBoard?.이름 || '글'} 목록`"
        class="-ml-2"
      />
    </div>

    <UAlert
      v-if="!canShowPost"
      color="warning"
      title="글을 찾을 수 없습니다"
      description="삭제되었거나 비공개이거나, 이 게시판에 속하지 않는 글일 수 있습니다."
    />
    <template v-else>
      <mBoard
        :post="post"
        :like-loading="ing좋아요"
        @like="onLike"
      >
        <template #actions>
          <template v-if="can편집">
            <mButton
              size="sm"
              icon="i-lucide-pencil"
              @click="do수정이동"
            >
              수정
            </mButton>
            <mButton
              color="error"

              size="sm"
              icon="i-lucide-trash-2"
              :loading="ing삭제"
              @click="do삭제"
            >
              삭제
            </mButton>
          </template>
        </template>
      </mBoard>
      <View댓글창
        v-model:draft-author="draftAuthor"
        v-model:draft-body="draftBody"
        :comments="comments"
        :is-로그인="is로그인"
        :ing-댓글="ing댓글"
        @submit="submitComment"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
// 게시글 /boards안에 넣어야 라우팅 에러로부터 안전함.
import { storeToRefs } from 'pinia'
import { useMyAuthStore } from '~/stores/useMyAuthStore'
import { useHeroPageTitle } from '~/composables/useLayoutHero'
import type { CommentItem } from '~/components/view/댓글창.vue'
import {
  model게시판s,
  model회원게시글s,
  model회원s,
  model회원댓글s,
  type model게시판,
  type model회원게시글
} from '~models/test2'

definePageMeta({ layoutHero: 'short' })

const route = useRoute()

const boardSlug = computed(() => decodeURIComponent(String(route.params.boardType ?? '').trim()))
const postId = computed(() => decodeURIComponent(String(route.params.id ?? '').trim()))

const boardsRepo = model게시판s.getInstance()
const postsRepo = model회원게시글s.getInstance()
const 댓글Repo = model회원댓글s.getInstance()

const { isLoggedIn: is로그인, 회원Id, is관리자 } = storeToRefs(useMyAuthStore())

await Promise.all([
  boardsRepo.reads(),
  postsRepo.reads(),
  model회원s.getInstance().reads(),
  댓글Repo.reads()
])

/** 슬러그·공개여부는 게시판(`boards`)이 소유한다. */
const resolvedBoard = computed((): model게시판 | null => {
  const board = boardsRepo.getBy슬러그(boardSlug.value)
  return board?.공개 ? board : null
})

const matchedPost = computed((): model회원게시글 | undefined => {
  const id = postId.value
  if (!id) return undefined
  const m = postsRepo.getById(id) as model회원게시글 | undefined
  const b = resolvedBoard.value
  if (!m || !b || !m.공개) return undefined
  if (String(m.state?.boardId ?? '') !== String(b.state?.id ?? b.id ?? '')) return undefined
  return m
})

const canShowPost = computed(() => Boolean(matchedPost.value))

/**
 * `type` 은 눈썹이다 — 게시글에 분류 칸이 없어 한때 '게시글' 로 박혀 있었다(`/decisions` 의 `게시판-상세`).
 * 이제 안 넘긴다. 상위 묶음(게시판)은 바로 위 「{게시판} 목록」 링크가 이미 말하고 있어, 눈썹까지 적으면
 * 같은 말이 두 줄로 선다(자료 상세도 「자료 목록」 링크 + 제목이다).
 */
const post = computed(() => {
  const m = matchedPost.value
  if (!m) {
    return {
      id: postId.value,
      type: '',
      title: '내용 없음',
      author: '-',
      date: new Date(),
      views: 0,
      likes: 0,
      content: ''
    }
  }
  return {
    id: m.id,
    type: '',
    title: m.제목,
    // 비회원 글은 적어 낸 이름이 작성자다(`write.vue` 의 작성자 표시와 같은 규칙).
    author: m.is비회원 ? (m.게스트명 || '비회원') : (m.회원?.이름?.trim() || '회원'),
    date: m.작성일시.toDate(),
    views: m.조회수,
    likes: m.좋아요수,
    content: m.본문 ?? ''
  }
})
/** 공식 레이아웃에선 제목이 히어로로 올라가고, 여기 제목 줄은 빠진다(`useHeroPageTitle`). 다른 레이아웃에선 그대로 선다. */
useHeroPageTitle(() => (canShowPost.value ? post.value.title : ''))

onMounted(() => {
  const m = matchedPost.value
  if (!m || import.meta.server) return
  m.조회수 = m.조회수 + 1
  void m.do저장(false, false)
})

/**
 * 수정·삭제 자격은 모델이 안다(`can편집시도`). 비회원 글이면 버튼은 보이되 비밀번호를 한 번 더 묻는다 —
 * 관리자·본인은 그 게이트를 건너뛴다.
 */
const 권한ctx = computed(() => ({ 회원Id: 회원Id.value, is관리자: is관리자.value }))
const can편집 = computed(() => matchedPost.value?.can편집시도(권한ctx.value) ?? false)

function do수정이동() {
  const m = matchedPost.value
  if (!m) return
  const id = String(m.state?.id ?? m.id ?? '')
  void navigateTo(
    `/boards/${encodeURIComponent(boardSlug.value)}/write?id=${encodeURIComponent(id)}`
  )
}

const ing삭제 = ref(false)
async function do삭제() {
  const m = matchedPost.value
  if (!m || ing삭제.value) return

  if (!m.can편집즉시(권한ctx.value)) {
    const 입력 = await useModalFields().open({
      title: '비회원 글 삭제',
      description: '글을 쓸 때 입력한 비밀번호를 확인합니다',
      steps: [{ key: 'pw', kind: 'input', label: '비밀번호', trim: true, required: true }]
    })
    if (!입력) return
    if (!m.is비번일치(String(입력.pw ?? ''))) {
      useAlert().error('비밀번호 불일치', '비밀번호가 맞지 않습니다.')
      return
    }
  }

  // `BaseModel2.delete(true)`의 window.confirm 대신 모달로 묻는다 — 취소가 실제로 취소여야 한다.
  const 갈래 = await useModalConfirm().open({
    title: '글 삭제',
    message: '이 글을 삭제할까요? 되돌릴 수 없습니다.',
    choices: [
      { key: 'cancel', label: '취소', color: 'neutral', 역할: '조용' },
      { key: 'delete', label: '삭제', color: 'error' }
    ]
  })
  if (갈래 !== 'delete') return

  ing삭제.value = true
  try {
    await m.delete(false)
    useAlert().log('삭제했습니다', m.제목 || '게시글')
    await postsRepo.reads()
    await navigateTo(`/boards/${encodeURIComponent(boardSlug.value)}`)
  } catch (error: any) {
    useAlert().error('삭제 실패', error?.message ?? '잠시 후 다시 시도해주세요.')
  } finally {
    ing삭제.value = false
  }
}

const ing좋아요 = ref(false)
async function onLike() {
  const m = matchedPost.value
  if (!m || ing좋아요.value) return
  ing좋아요.value = true
  try {
    m.좋아요수 = m.좋아요수 + 1
    await m.do저장(false, false)
  } catch {
    m.좋아요수 = Math.max(0, m.좋아요수 - 1)
    useAlert().show('오류', '좋아요 반영에 실패했습니다.')
  } finally {
    ing좋아요.value = false
  }
}

const draftAuthor = ref('')
const draftBody = ref('')
const ing댓글 = ref(false)

const randomGuestAuthorName = () => {
  const a = ['조용한', '신나는', '든든한', '반짝이는', '평화로운', '호기심많은']
  const b = ['펭귄', '고양이', '별', '구름', '바람', '나무늘보']
  return `${a[Math.floor(Math.random() * a.length)]}${b[Math.floor(Math.random() * b.length)]}${Math.floor(100 + Math.random() * 900)}`
}

const comments = computed<CommentItem[]>(() => {
  const m = matchedPost.value
  if (!m) return []
  const id = String(m.state?.id ?? m.id ?? '')
  if (!id) return []
  return 댓글Repo.getsBy대상('member_posts', id).map(row => ({
    id: String(row.id),
    author: row.작성자표시 || '익명',
    content: row.내용,
    createdAt: row.작성일시.isValid() ? row.작성일시.format('YYYY-MM-DD HH:mm') : ''
  }))
})

const submitComment = async () => {
  const m = matchedPost.value
  if (!m) return
  const body = draftBody.value.trim()
  if (!body) {
    useAlert().show('알림', '내용을 입력해주세요.')
    return
  }
  let authorName = draftAuthor.value.trim()
  let memberId: string | null = null
  if (is로그인.value) {
    const 회원ID = 회원Id.value
    if (회원ID) {
      memberId = String(회원ID)
      const 회원 = model회원s.getInstance().getById(memberId)
      authorName = (회원?.이름 ?? '').trim() || authorName || '회원'
    }
  } else if (!authorName) {
    authorName = randomGuestAuthorName()
  }
  if (!authorName) {
    useAlert().show('알림', '닉네임을 입력해주세요.')
    return
  }
  ing댓글.value = true
  try {
    await 댓글Repo.do작성({
      대상타입: 'member_posts',
      대상Id: String(m.state?.id ?? m.id ?? ''),
      회원Id: memberId,
      작성자표시: authorName,
      내용: body
    })
    draftBody.value = ''
    if (!is로그인.value) draftAuthor.value = ''
    await 댓글Repo.reads()
  } catch {
    useAlert().show('오류', '댓글 등록에 실패했습니다.')
  } finally {
    ing댓글.value = false
  }
}
</script>

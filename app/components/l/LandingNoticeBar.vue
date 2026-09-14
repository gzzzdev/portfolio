<template>
  <div class="pointer-events-auto">
    <div :class="outerToneClass">
      <div :class="innerToneClass">
        <div
          class="flex h-14 w-full items-center overflow-hidden"
          :class="containerToneClass"
        >
          <Transition
            name="notice-fade"
            mode="out-in"
          >
            <div
              :key="`${noticeLabel}-${noticeIndex}`"
              class="flex h-full shrink-0 items-center text-sm font-semibold"
              :class="[labelSpacingClass, labelToneClass, labelDividerClass]"
            >
              {{ noticeLabel }}
            </div>
          </Transition>

          <NuxtLink
            :to="currentNotice?.to"
            class="min-w-0 flex-1 px-4 text-left text-sm"
            :class="titleToneClass"
          >
            <Transition
              name="notice-fade"
              mode="out-in"
            >
              <span
                :key="currentNotice?.title"
                class="line-clamp-1"
              >{{ currentNotice?.title }}</span>
            </Transition>
          </NuxtLink>

          <div
            class="flex h-full shrink-0 items-center gap-2 px-3 text-xs"
            :class="[metaToneClass, metaDividerClass]"
          >
            <Transition
              name="notice-fade"
              mode="out-in"
            >
              <span :key="currentNotice?.date">{{ currentNotice?.date }}</span>
            </Transition>
            <div class="flex items-center">
              <mButton
                icon="i-lucide-chevron-left"
                역할="조용"
                size="xs"
                :ui="{ base: arrowBtnToneClass }"
                @click="prevNotice"
              />
              <mButton
                icon="i-lucide-chevron-right"
                역할="조용"
                size="xs"
                :ui="{ base: arrowBtnToneClass }"
                @click="nextNotice"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { model게시판s, model회원게시글s, type model회원게시글 } from '~models/test2'

const props = withDefaults(defineProps<{
  tone?: 'hero' | 'header'
}>(), {
  tone: 'hero'
})

const outerToneClass = computed(() =>
  props.tone === 'header'
    ? 'w-full bg-page/96'
    : 'w-full'
)

const innerToneClass = computed(() =>
  props.tone === 'header'
    ? 'mx-auto w-[80rem] max-w-full'
    : 'mx-auto w-[80rem] max-w-full px-3 sm:px-5 lg:px-6'
)

const containerToneClass = computed(() =>
  props.tone === 'header'
    ? 'bg-page text-default'
    : 'border border-white/15 bg-neutral-900/40 text-white backdrop-blur-md'
)

const labelSpacingClass = computed(() =>
  'px-4'
)

const labelToneClass = computed(() =>
  props.tone === 'header'
    ? 'text-primary dark:text-primary'
    : 'border-white/15 bg-primary/70 text-white'
)

const labelDividerClass = computed(() =>
  props.tone === 'header' ? '' : 'border-r'
)

const titleToneClass = computed(() =>
  props.tone === 'header'
    ? 'text-default hover:text-primary dark:hover:text-primary'
    : 'text-white hover:text-primary-200'
)

const metaToneClass = computed(() =>
  props.tone === 'header'
    ? 'text-muted'
    : 'border-white/15 text-white/80'
)

const metaDividerClass = computed(() =>
  props.tone === 'header' ? '' : 'border-l'
)

const arrowBtnToneClass = computed(() =>
  props.tone === 'header'
    ? 'text-muted hover:bg-elevated/60 hover:text-primary dark:hover:text-primary'
    : 'text-white hover:bg-white/10'
)

type NoticeItem = {
  label: string
  title: string
  date: string
  to: string
}

const 공지슬러그 = 'notice'
const boardModel = model회원게시글s.getInstance()

/**
 * **setup 에서 읽는다**(예전엔 `onMounted`). 이 띠를 세우는 히어로가 레이아웃(`layout-official`)으로 올라가면서
 * 페이지의 `await` 보다 먼저 그려지게 됐다 — 그러면 서버는 빈 목록으로 「등록된 공지가 없습니다」를 그리고
 * 클라이언트는 공지를 그려 hydration 이 어긋난다. 못 읽으면 대체 문구로 선다.
 */
try {
  await Promise.all([model게시판s.getInstance().reads(), boardModel.reads()])
} catch {
  /* 대체 문구(fallbackNotice)로 선다 */
}
const fallbackNotice: NoticeItem = {
  label: '공지',
  title: '등록된 공지가 없습니다.',
  date: '-',
  to: `/boards/${공지슬러그}`
}

/** 게시판은 슬러그로 찾는다 — `boardId`는 시드마다 달라지지만 `notice` 슬러그는 고정이다. */
const notices = computed<NoticeItem[]>(() => {
  const 공지게시판 = model게시판s.getInstance().getBy슬러그(공지슬러그)
  const boardId = String(공지게시판?.stateId ?? '')
  if (!boardId) return [fallbackNotice]

  const rows = toValue(boardModel.list) as model회원게시글[]
  const mapped = rows
    .filter(item => item.게시판Id === boardId && item.공개)
    .sort((a, b) => b.작성일시.valueOf() - a.작성일시.valueOf())
    .map(item => ({
      label: 공지게시판?.이름 || '공지',
      title: item.제목,
      date: item.작성일시.format('YYYY-MM-DD'),
      to: `/boards/${공지슬러그}/${item.stateId}`
    }))
  return mapped.length ? mapped : [fallbackNotice]
})

const noticeIndex = useState<number>('landing-notice-index', () => 0)
const currentNotice = computed(() => notices.value[noticeIndex.value] ?? notices.value[0])
const noticeLabel = computed(() => currentNotice.value?.label ?? '공지')
const NOTICE_ROTATE_MS = 4000
let noticeRotateTimer: ReturnType<typeof setInterval> | null = null

const stopNoticeRotate = () => {
  if (!noticeRotateTimer) return
  clearInterval(noticeRotateTimer)
  noticeRotateTimer = null
}

const startNoticeRotate = () => {
  stopNoticeRotate()
  // 아래 `watch(…, { immediate })` 가 SSR 에서도 불러서 서버에서 setInterval 이 돌면 Nuxt 가 500 을 낸다.
  if (import.meta.server || notices.value.length <= 1) return
  noticeRotateTimer = setInterval(() => {
    noticeIndex.value = (noticeIndex.value + 1) % notices.value.length
  }, NOTICE_ROTATE_MS)
}

const restartNoticeRotate = () => {
  startNoticeRotate()
}

const prevNotice = () => {
  if (!notices.value.length) return
  noticeIndex.value = (noticeIndex.value - 1 + notices.value.length) % notices.value.length
  restartNoticeRotate()
}

const nextNotice = () => {
  if (!notices.value.length) return
  noticeIndex.value = (noticeIndex.value + 1) % notices.value.length
  restartNoticeRotate()
}

watch(notices, (items) => {
  if (!items.length) {
    noticeIndex.value = 0
    return
  }
  if (noticeIndex.value >= items.length) {
    noticeIndex.value = 0
  }
  startNoticeRotate()
}, { immediate: true })

onMounted(() => {
  startNoticeRotate()
})

onUnmounted(() => {
  stopNoticeRotate()
})
</script>

<style scoped>
.notice-fade-enter-active,
.notice-fade-leave-active {
  transition: opacity 180ms ease, transform 180ms ease;
}

.notice-fade-enter-from,
.notice-fade-leave-to {
  opacity: 0;
  transform: translateY(2px);
}
</style>

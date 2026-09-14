<template>
  <!--
    전체 찾기 — ⌘K(맥) / Ctrl+K(윈도우). 헤더의 돋보기와 같은 창을 연다.

    ## 단축키 배치 (2026-09-15)

    | 키 | 여는 것 |
    |---|---|
    | ⌘K | **이 창** — 메뉴·포트폴리오 화면·고민 기록·명령 |
    | ⌘J | AI도우미 (`lDock토글`) |
    | 없음 | 테마 — 이 창의 「테마 열기」와 도크 목록의 줄 |

    ⌘K 는 한때 AI도우미였다. 그런데 GitHub·Vercel·Notion·문서 사이트에서 ⌘K 는 **찾기**라, 처음 온 사람이
    검색하려고 누르면 채팅이 열렸다. 입구는 사람들이 먼저 누르는 키에 두고, 도우미는 이 창 안에서도
    「AI도우미에게 묻기」로 이어지게 했다 — 찾다가 안 나오면 같은 말로 바로 묻는다.
    도우미를 ⌘J 로 옮긴 건 Notion AI 가 같은 키를 쓰기 때문이다.

    테마에 걸려 있던 ⌘⇧K 는 걷었다. ⌘K 가 찾기가 되면 「K 옆에 붙은 하나」라는 짝이 깨지고, 윈도우 파이어폭스에서
    Ctrl+Shift+K 는 웹 콘솔이라 페이지가 못 막는다. 테마는 자주 여는 것이 아니라 설정이라 키 없이 둔다.

    **찾는 것은 지금 역할이 갈 수 있는 곳뿐이다** — 메뉴는 `useNavs(지금 역할)` 이 준다(띠와 같은 목록).
    권한 밖 화면을 결과에 올리면 누르는 순간 미들웨어가 돌려보낸다.
    도메인 데이터(회원·신청 행)는 찾지 않는다 — 그건 AI도우미가 역할의 권한 안에서 한다.
  -->
  <UTooltip
    text="전체 찾기"
    :kbds="['meta', 'K']"
  >
    <mButton
      icon="i-lucide-search"
      역할="조용"
      :class="실사 ? 'text-inherit! hover:bg-current/10!' : ''"
      :ui="실사 ? { leadingIcon: 'size-6' } : undefined"
      aria-label="전체 찾기"
      aria-haspopup="dialog"
      @click="열림 = true"
    />
  </UTooltip>

  <UModal
    v-model:open="열림"
    title="전체 찾기"
    description="메뉴·화면·고민 기록을 찾거나 AI도우미에게 묻습니다"
    :ui="{ content: 'sm:max-w-2xl', title: 'sr-only', description: 'sr-only' }"
  >
    <template #content>
      <UCommandPalette
        v-model:search-term="검색어"
        :groups="묶음s"
        placeholder="메뉴·화면·고민 기록 찾기"
        :fuse="{ fuseOptions: { keys: ['label', 'suffix', '별칭'] }, resultLimit: 8 }"
        close
        class="h-[min(32rem,70dvh)]"
        @update:open="열림 = $event"
      />
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { CommandPaletteGroup, CommandPaletteItem } from '@nuxt/ui'
import { storeToRefs } from 'pinia'
import { filterVisibleNavs, useNavs, type NavItem, type NavLink } from '~/composables/useNavs'
import { 포트폴리오저장소 } from '~/composables/usePortfolio'
import { useMyAuthStore } from '~/stores/useMyAuthStore'
import { decisionRecord, hasDecisionBoard } from '~/utils/decisions'

defineProps<{
  /** 사진 히어로 머리(`layout-official`)용 — `lDock토글`·`m로그인4` 의 `실사` 와 같은 값이다. */
  실사?: boolean
}>()

type 항목 = CommandPaletteItem & { 별칭?: string }

/** 창이 열렸나. `useState` 라 소개 화면의 「전체 찾기 열기」 버튼도 같은 창을 연다. */
const 열림 = useState('전체찾기:열림', () => false)
const 검색어 = ref('')
/** 닫으면 검색어를 비운다 — 다음에 열었을 때 지난 검색 결과부터 보이면 헷갈린다. */
watch(열림, (v) => {
  if (!v) 검색어.value = ''
})

const { currentRole } = storeToRefs(useMyAuthStore())
const { visibleNavs } = useNavs(() => currentRole.value ?? 'guest')
const askAI = useAskAI()
const 테마 = useThemePane()

/** 누르면 창을 닫고 할 일을 한다. 닫기를 먼저 해야 모달 포커스 가두기가 도크의 입력창 포커스를 안 뺏는다. */
function 고르면(할일: () => void) {
  return () => {
    열림.value = false
    void nextTick(할일)
  }
}

/** 메뉴 나무를 한 줄로 편다. 자식은 「섹션 › 이름」으로 적어 같은 이름(「목록」 등)을 가른다. */
function 펴기(items: NavItem[], 위?: string): 항목[] {
  return filterVisibleNavs(items).flatMap((item) => {
    const link = item as NavLink
    const 이름 = 위 ? `${위} › ${link.label}` : link.label
    const 나 = link.path && !입구경로s.has(link.path)
      ? [{ id: `메뉴:${link.path}`, label: 이름, icon: link.icon ?? 'i-lucide-file', onSelect: 고르면(() => navigateTo(link.path!)) }]
      : []
    return [...나, ...(link.children?.length ? 펴기(link.children, link.label) : [])]
  })
}

/** 레일(`l/QuickMenu_r`)과 같은 넷 + 저장소. 메뉴와 경로가 겹치면 메뉴 쪽에서 뺀다. */
const 포트폴리오s: 항목[] = [
  { id: '입구:/portfolio', label: '포트폴리오 소개', icon: 'i-lucide-user-round', 별칭: 'portfolio 소개', onSelect: 고르면(() => navigateTo('/portfolio')) },
  { id: '입구:/resume', label: '개발자 이력서', icon: 'i-lucide-file-user', 별칭: 'resume 경력', onSelect: 고르면(() => navigateTo('/resume')) },
  { id: '입구:/decisions', label: '고민 기록', icon: 'i-lucide-lightbulb', 별칭: 'decisions 결정', onSelect: 고르면(() => navigateTo('/decisions')) },
  { id: '입구:/official', label: '비회원 홈', icon: 'i-lucide-globe', 별칭: 'official 공지 신청', onSelect: 고르면(() => navigateTo('/official')) },
  { id: '입구:github', label: 'GitHub 저장소', icon: 'i-simple-icons-github', onSelect: 고르면(() => navigateTo(포트폴리오저장소, { external: true, open: { target: '_blank' } })) }
]
const 입구경로s = new Set(['/portfolio', '/resume', '/decisions', '/official'])

/** `/decisions` 목차와 같은 거름 — 판이 있는 기록만, 고르면 그 판으로 간다. */
const router = useRouter()
const 기록s: 항목[] = decisionRecord.filter(기록 => hasDecisionBoard(기록, router)).map(기록 => ({
  id: `기록:${기록.키}`,
  label: 기록.고민,
  suffix: 기록.요약,
  icon: 'i-lucide-notebook-pen',
  onSelect: 고르면(() => navigateTo(기록.판!))
}))

const 묶음s = computed<CommandPaletteGroup<항목>[]>(() => {
  const q = 검색어.value.trim()
  return [
    {
      id: '명령',
      label: '명령',
      items: [
        { id: '명령:ai', label: 'AI도우미 열기', icon: 'i-lucide-bot', kbds: ['meta', 'J'], onSelect: 고르면(askAI.open) },
        { id: '명령:테마', label: '테마 열기', icon: 'i-lucide-palette', 별칭: '색 글꼴 다크', onSelect: 고르면(테마.open) }
      ]
    },
    {
      id: '메뉴',
      label: '메뉴',
      items: 펴기(visibleNavs.value)
    },
    { id: '포트폴리오', label: '포트폴리오', items: 포트폴리오s },
    { id: '고민기록', label: '고민 기록', items: 기록s },
    /**
     * 검색어가 있을 때만 서고, 거르지 않는다(`ignoreFilter`) — 무엇을 치든 늘 맨 아래 남아서
     * 결과가 비었을 때도 다음 할 일이 화면에 있다.
     */
    ...(q
      ? [{
          id: '묻기',
          label: 'AI도우미',
          ignoreFilter: true,
          items: [{ id: '묻기:ai', label: `AI도우미에게 묻기: “${q}”`, icon: 'i-lucide-sparkles', onSelect: 고르면(() => askAI.ask(q)) }]
        }]
      : [])
  ]
})

defineShortcuts({
  meta_k: { usingInput: true, handler: () => { 열림.value = !열림.value } }
}, { layoutIndependent: true })
</script>

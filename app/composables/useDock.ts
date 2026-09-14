import type { ShallowRef } from 'vue'

/**
 * 화면 우측 도크.
 *
 * 이 자리는 "전역 AI 창"이 아니라 **본문을 떠나지 않고 옆에서 처리하는 부수 작업**들의 공용 자리다.
 * 지금은 AI도우미 하나뿐이지만 메시징·메일쓰기가 같은 자리에 들어온다.
 * 모달로 하면 본문이 가려져 안 되고(메일 쓰다가 회원 목록을 봐야 한다),
 * 새 페이지로 보내면 하던 일이 끊기는 — 그 사이에 있는 것들이다.
 *
 * 탭 모델은 "고정 3탭"이 아니라 **열려 있는 작업이 곧 탭**이다.
 * - AI도우미처럼 상주하는 pane 은 항상 탭.
 * - 메일쓰기처럼 대상이 있어야 의미가 생기는 pane 은 `visible` 이 참일 때만 탭이 되고 `onClose` 로 닫는다.
 *   수신자 없는 빈 메일쓰기 탭이 늘 떠 있으면 좁은 패널에서 죽은 자리가 되고,
 *   반대로 액션으로만 진입하게 두면 초안이 살아있어도 **돌아갈 길이 화면에 없다**. 둘 다 피한다.
 *
 * **좁은 화면에서는 오른쪽이 아니라 아래에서 올라온다.** 옆에 나란히 세울 폭이 없어서
 * 덮어버리면, 도우미가 화면을 몰아놓고 그 화면을 자기가 가리는 자기모순이 된다
 * (`l/AI_CopilotV2.vue` — 도우미는 렌더러를 안 들고 있고, 그리는 건 언제나 뒤의 화면이다).
 * 그래서 칸이 셋이다: **닫힘 / 한 줄 / 펼침**. 「한 줄」은 채팅이 사라진 게 아니라 납작해진 것이고,
 * 마지막 답변과 **실행 버튼이 거기 남는다** — 화면을 보면서 누를 수 있어야 하기 때문이다.
 * 완전한 교대로 두면 "보려고 닫으면 누를 것도 같이 사라지는" 교착이 그대로 남는다.
 *
 * 상태를 컴포넌트 밖에 두는 이유:
 * 탭이 "열려 있는 작업"을 뜻하는 순간, 탭을 옮겼다 돌아왔을 때 초안이 비어 있으면 앱이 거짓말을 한다.
 * pane 내용물은 offcanvas 로 계속 마운트돼 있고, 도크 자체의 상태는 여기가 쥔다 —
 * 그래야 도크 밖(AI 답변의 실행 버튼 등)에서도 `openPane('메일')` 로 부를 수 있다.
 */

/** 헤더 우측에 그려지는 pane 전용 버튼. AI도우미면 '대화 초기화', 메일이면 '임시저장'이 되는 자리다. */
export interface DockPaneAction {
  icon: string
  label: string
  onClick: () => void
  disabled?: boolean
}

export interface DockPaneOptions {
  /** 탭 식별자. `openPane('ai')` 로 다른 코드가 이 pane 을 부를 때 쓴다. */
  id: string
  icon: string
  /** 활성 탭에만 글자로 나온다 — 비활성은 아이콘만이라 좁은 폭에서도 여러 개가 버틴다. */
  label: MaybeRefOrGetter<string>
  /** 안 읽음 수 등. 0·빈 문자열·undefined 면 그리지 않는다. */
  badge?: MaybeRefOrGetter<number | string | undefined>
  /** 탭이 보일 조건. 기본은 항상(상주 pane). 작업 pane 은 "할 일이 있을 때만"을 여기 건다. */
  visible?: MaybeRefOrGetter<boolean>
  /**
   * 주면 탭에 × 가 붙는다. 버릴지 물어보고 `visible` 을 끄는 건 pane 몫이다 —
   * 무엇을 잃는지는 pane 만 안다(도크는 초안이 있는지도 모른다).
   */
  onClose?: () => void
  /** 활성일 때만 헤더에 그려진다. */
  actions?: MaybeRefOrGetter<DockPaneAction[]>
  /**
   * 이 pane 이 「한 줄」을 스스로 그리는가(`useDockPane().한줄` 을 보고 자기 요약으로 갈아낀다).
   * 안 신고하면 접혔을 때 도크가 **내용을 감추고 이름표만** 남긴다 —
   * 접힘은 뒤의 화면을 보려는 상태인데, 요약을 모르는 pane 은 본문을 그대로 세워서
   * 시트가 안 낮아지거나 오히려 높아진다(테마가 그렇다).
   */
  한줄있음?: boolean
}

declare module '#app' {
  interface NuxtApp {
    /**
     * pane 레지스트리. 모듈 스코프에 두면 **서버에서 요청끼리 공유된다** —
     * 요청마다 등록이 쌓이고, 남의 요청이 연 도크가 다음 사람에게 딸려 나간다.
     * `nuxtApp` 은 서버에서 요청당 하나, 클라이언트에서 앱당 하나라 둘 다 맞다.
     * (함수·computed 가 들어 있어 직렬화되는 `useState` 에는 담을 수 없다)
     */
    _dockPanes?: ShallowRef<DockPaneOptions[]>
  }
}

/**
 * shallowRef: 항목에 `computed` 와 함수가 딸려 있다. 깊은 반응형으로 감싸면 ref 가 한 겹 벗겨져
 * `toValue` 로 읽는 규약이 자리마다 달라진다. 통째로 갈아끼우기만 하므로 얕아도 충분하다.
 */
function usePanes() {
  const nuxtApp = useNuxtApp()
  return (nuxtApp._dockPanes ??= shallowRef<DockPaneOptions[]>([]))
}

export function useDock() {
  const panes = usePanes()
  /** 열림·활성 탭은 직렬화되므로 `useState` 로 둔다(SSR 에서 요청마다 새로 시작한다). */
  const open = useState('dock:open', () => false)
  const activeId = useState<string | null>('dock:activeId', () => null)

  /**
   * 접힘 = 「한 줄」을 원하는 상태. 실제로 한 줄이 되는 건 좁은 화면에서 열려 있을 때뿐이라
   * 판정은 `한줄` 이 진다 — 넓은 화면에서는 이 값이 참이어도 아무 일도 일어나지 않는다.
   * (그래서 도우미는 화면을 밀 때마다 폭을 묻지 않고 그냥 `접기()` 를 부르면 된다.)
   */
  const 접힘 = useState('dock:collapsed', () => false)
  const { is데스크탑 } = useResponsive()
  const 한줄 = computed(() => open.value && 접힘.value && !is데스크탑.value)

  /** 탭 순서 = 등록 순서 = 레이아웃에 적은 순서. */
  const visiblePanes = computed(() => panes.value.filter(p => toValue(p.visible ?? true)))

  /**
   * 활성 pane. 지목된 탭이 사라졌으면(초안을 버렸다 등) 첫 탭으로 흘러내린다 —
   * 감시자를 두지 않아도 "활성인데 화면에 없는 pane" 이 생기지 않는다.
   */
  const activePane = computed(() =>
    visiblePanes.value.find(p => p.id === activeId.value) ?? visiblePanes.value[0] ?? null
  )

  /**
   * 한 줄로 내린다. **도우미가 주소를 밀 때 부르는 자리다** — 바꿔놓은 화면이 안 보이면
   * 바꾼 게 아니고, 답변의 "현재 화면에는 …이 표시되고 있습니다" 도 그때서야 참이 된다.
   */
  function 접기() {
    접힘.value = true
  }

  function 펼치기() {
    접힘.value = false
  }

  function 한줄토글() {
    접힘.value = !접힘.value
  }

  function activate(id: string) {
    activeId.value = id
  }

  /** 지목한 pane 을 띄운다. AI 답변의 실행 버튼처럼 **도크 밖**에서 부르는 경로가 이것이다. */
  function openPane(id?: string) {
    if (id) activate(id)
    open.value = true
    // 손으로 연 것은 말을 하려는 것이다. 접힌 채로 열리면 입력창이 없다.
    펼치기()
  }

  function close() {
    open.value = false
  }

  function isActive(id: string) {
    return activePane.value?.id === id
  }

  /**
   * 셸이 쓸 CSS 변수. **패널 폭과 본문이 비켜주는 폭은 같은 값이어야 하므로 한 군데서 만든다** —
   * 레이아웃마다 따로 적으면 한쪽만 고쳤을 때 본문이 패널 밑으로 들어간다.
   * `--dock-width`: 패널 자체 폭(`lDock` 의 `--sidebar-width` 가 읽는다).
   * `--dock-inset`: 열렸을 때만 본문이 비켜줄 폭. 셸이 `lg:pe-(--dock-inset)` 로 쓴다.
   * `--dock-inset-bottom`: **한 줄일 때** 본문이 비켜줄 높이. 이게 없으면 스트립이 폼의
   *   저장 버튼을 덮는데, 도우미의 `추가`·`수정` 은 저장을 화면에서 하게 만드는 흐름이라 치명적이다.
   *   좁은 화면 전용 판정(`한줄`)이 이미 들어 있어 셸은 `lg:` 를 따로 안 적어도 된다.
   * `--dock-peek`: 「한 줄」의 높이. **재지 않고 정해 둔다.**
   *   실측(`useElementSize`)이었는데 그러면 접힘이 `height: auto` 라야 하고, **auto 는 전이가 안 된다** —
   *   펼침↔한 줄이 매번 툭 끊겼다. 값을 고정하면 두 높이가 다 구체값이라 그냥 흐른다.
   *   대신 스트립은 이 높이 안에 들어와야 한다(글 2줄 + 버튼 한 줄, 버튼은 접지 말고 옆으로 스크롤).
   */
  const 한줄높이 = '7.25rem'
  const vars = computed(() => ({
    '--dock-width': 'min(28rem, calc(100vw - 2rem))',
    '--dock-peek': 한줄높이,
    '--dock-inset': open.value ? 'var(--dock-width)' : '0px',
    '--dock-inset-bottom': 한줄.value ? 한줄높이 : '0px'
  }))

  return {
    open, panes, visiblePanes, activePane, activeId, vars,
    접힘, 한줄, is데스크탑,
    activate, openPane, close, isActive,
    접기, 펼치기, 한줄토글
  }
}

/**
 * pane 이 자기를 도크에 등록한다.
 *
 * 도크는 무엇이 들어오는지 모르고(레이아웃이 조립한다), pane 은 자기 메타·액션만 신고한다.
 * 그래서 `sources` 같은 pane 전용 prop 이 도크를 거치지 않는다.
 */
export function useDockPane(options: DockPaneOptions) {
  const panes = usePanes()
  const dock = useDock()

  // 같은 id 는 밀어낸다. id 는 `openPane('aiV2')` 가 지목하는 **주소**라 유일해야 하는데,
  // 등록은 객체 identity 로 지워지므로 dispose 없이 다시 등록되면(HMR·전환 중 이중 마운트)
  // 탭이 둘로 늘고 `isActive` 가 id 를 비교하므로 **둘 다 활성**으로 그려진다.
  panes.value = [...panes.value.filter(p => p.id !== options.id), options]
  if (!dock.activeId.value) dock.activeId.value = options.id

  onScopeDispose(() => {
    panes.value = panes.value.filter(p => p !== options)
  })

  const isActive = computed(() => dock.isActive(options.id))

  return {
    /** pane 은 자기 루트에 `v-show` 로 이걸 건다. 숨더라도 마운트는 유지돼 작업이 남는다. */
    isActive,
    open: dock.open,
    /**
     * 좁은 화면에서 「한 줄」로 납작해진 상태. pane 은 이걸 보고 **자기 요약**을 대신 그린다 —
     * 도크는 높이만 정하고 무엇을 남길지는 pane 만 안다(도크는 마지막 답변이 있는지도 모른다).
     */
    한줄: computed(() => isActive.value && dock.한줄.value),
    /** 화면을 밀 때 pane 이 스스로 내려간다. */
    접기: dock.접기,
    펼치기: dock.펼치기,
    /** 이 pane 을 띄운다. */
    show: () => dock.openPane(options.id)
  }
}

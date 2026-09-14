/**
 * 도크 밖에서 AI도우미에게 **질문을 들려 보낸다** — 전체 찾기(`l/전체찾기`)의 「AI도우미에게 묻기」가 쓴다.
 *
 * 도우미의 `send` 는 pane 컴포넌트 안에 있어서 밖에서 직접 못 부른다. 그래서 질문을 한 칸(`useState`)에
 * 놓고 도크를 연다. 마운트된 도우미(`AI_Copilot`·`AI_CopilotV2` — 레이아웃마다 하나)가 그 칸을 보고
 * 꺼내 보내고 비운다(`take`). 칸이 하나라 두 번 보내지 않는다.
 *
 * pane id 를 여기 적지 않는다 — v1 은 `ai`, v2 는 `aiV2` 이고 레이아웃이 어느 쪽을 세웠는지는
 * 도크 목록이 안다. 그래서 `ai` 로 시작하는 첫 줄을 고른다.
 */
export function useAskAI() {
  const dock = useDock()
  const 대기질문 = useState<string>('ai:대기질문', () => '')

  /** 이 레이아웃에 선 AI도우미 pane 의 id. 없으면 undefined — 그때 `openPane()` 은 활성 줄을 연다. */
  const aiPaneId = computed(() => dock.panes.value.find(p => p.id.startsWith('ai'))?.id)

  /** 도우미 줄을 연다(질문 없이). */
  function open() {
    dock.openPane(aiPaneId.value)
  }

  /** 질문을 놓고 도우미 줄을 연다. */
  function ask(text: string) {
    const q = text.trim()
    if (q) 대기질문.value = q
    open()
  }

  /** 도우미가 부른다 — 놓인 질문을 꺼내고 칸을 비운다. */
  function take(): string {
    const q = 대기질문.value
    대기질문.value = ''
    return q
  }

  return { 대기질문, aiPaneId, open, ask, take }
}

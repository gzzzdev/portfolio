export type ChatRole = 'user' | 'assistant'
export type ChatStatus = 'ready' | 'submitted' | 'error'

/**
 * 메시지에 딸린 버튼(UChatMessage의 `actions`). `UChatMessages`가 message 객체를 그대로
 * `UChatMessage`에 spread하므로, 여기 넣은 값이 메시지별 액션이 된다.
 */
export interface ChatAction {
  label: string
  to?: string
  target?: string
  icon?: string
  color?: string
  variant?: string
  size?: string
  /**
   * `mButton` 의 역할·켜짐(정본은 `m/Button/_/style1.vue`). 답변에 붙는 버튼도 축 밖으로
   * 나갈 때만 적는다 — 그 턴의 결말인 하나만 `강조`, 나머지는 중립.
   */
  역할?: string
  켜짐?: boolean
  /**
   * 누르면 실행할 동작. `UChatMessage`가 `onClick`만 v-bind에서 떼어내 @click으로 물려주므로
   * 컴포넌트 쪽 배선은 필요 없다.
   */
  onClick?: (e: MouseEvent) => void
}

/**
 * 답변 아래에 앱이 직접 그리는 명단 한 줄. LLM더러 옮겨 적게 하면 토큰을 쓰면서 틀린다 —
 * 실측: `잠자는중=false` 를 보고 "현재 활발히 활동 중"이라고 덧붙였다.
 */
export interface ChatListItem {
  label: string
  /** 동명이인을 가르는 부가 표기. 없으면 빈 문자열. */
  sub: string
  뱃지s: { label: string, color?: string, icon?: string }[]
  /** 열어볼 데가 있는 행만. 있으면 줄 전체가 링크가 된다. */
  to?: string
  /**
   * 누르면 할 일. 있으면 줄 전체가 버튼이 된다(`to`와 같은 자리, 다른 수단).
   * 링크로 못 쓰는 경우가 있다 — 화면 선택을 옮기는 건 URL이 아니라 앱 안의 상태다.
   */
  onClick?: () => void
}

/**
 * `UChatMessage`가 선언한 prop 중 앱이 자유롭게 쓸 수 있는 자리.
 * `messageProps`에 그대로 실려 `#content` 슬롯까지 내려온다 — 컴포넌트 개조 없이 구조화된 값을 넘기는 유일한 경로.
 */
export interface ChatMeta {
  /** 이 답변이 근거로 삼은 행들. LLM이 아니라 앱이 그린다. */
  명단?: ChatListItem[]
  /** 조건에 걸린 전체 건수. `명단.length`(화면 상한에 맞춰 잘린 수)와 다르다. */
  총건수?: number
  제목?: string
}

/** UChatMessages가 기대하는 형태 */
export interface ChatMessage {
  id: string
  role: ChatRole
  parts: { type: 'text', text: string }[]
  actions?: ChatAction[]
  metadata?: ChatMeta
}

/** `context`가 텍스트만이 아니라 답변에 달 버튼까지 줄 때의 반환형. */
export interface ChatContext {
  text: string
  actions?: ChatAction[]
  /** 답변 아래에 앱이 그릴 명단. 프롬프트에는 안 들어간다. */
  metadata?: ChatMeta
  /**
   * **이번 턴에만** 해당하는 지시. 앱이 그 턴에 실제로 무엇을 붙였는지 알고 쓰는 것이다.
   *
   * 조건부 지시("발췌본이면 ~하라")를 고정 프롬프트에 두면 lite 모델이 그 기능이 이번 턴에도
   * 있다고 가정하고 없는 발췌·없는 버튼을 지어낸다(실측). 해당될 때만 넣는 게 유일한 방법이다.
   */
  지시?: string
}

interface UseChatbotOptions {
  /** 시스템 프롬프트. 게터·ref 를 받는다 — 매 요청 직전에 읽는다. */
  system?: MaybeRefOrGetter<string>
  level?: 'lite' | 'flash' | 'pro'
  /** 첫 인사말. 대화 기록으로는 서버에 보내지 않는다. */
  welcome?: string
  /**
   * 질문을 받아 참조 데이터 블록을 만드는 함수. 매 요청 직전 호출된다.
   * 이 composable은 데이터가 어디서 오는지도, 그 안에서 LLM을 한 번 더 부르는지도 모른다.
   */
  context?: (question: string) => string | ChatContext | Promise<string | ChatContext>
  /** 서버로 보낼 최대 메시지 수(슬라이딩 윈도우). 화면에는 전부 남고 전송만 잘린다. */
  maxHistory?: number
}

const WELCOME_ID = 'welcome'

export default function useChatbot(options: UseChatbotOptions = {}) {
  const { system, level = 'lite', welcome, context, maxHistory = 20 } = options

  const buildWelcome = (): ChatMessage[] => welcome
    ? [{ id: WELCOME_ID, role: 'assistant', parts: [{ type: 'text', text: welcome }] }]
    : []

  const messages = ref<ChatMessage[]>(buildWelcome())
  const input = ref('')
  const status = ref<ChatStatus>('ready')
  const error = ref<string | null>(null)

  /** welcome 외에 실제 주고받은 턴이 있는지 */
  const hasConversation = computed(() => messages.value.some(m => m.id !== WELCOME_ID))

  function push(role: ChatRole, text: string, actions?: ChatAction[], metadata?: ChatMeta) {
    messages.value.push({
      id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      role,
      parts: [{ type: 'text', text }],
      ...(actions?.length ? { actions } : {}),
      ...(metadata?.명단?.length ? { metadata } : {})
    })
  }

  /** 최근 maxHistory개만 전송. Gemini는 user 턴으로 시작하길 기대하므로 앞이 assistant면 더 버린다. */
  function recentHistory() {
    const turns = messages.value
      .filter(m => m.id !== WELCOME_ID)
      .map(m => ({ role: m.role, text: m.parts.map(p => p.text).join('\n') }))

    const recent = turns.slice(-maxHistory)
    while (recent.length && recent[0]!.role !== 'user') recent.shift()
    // 전부 잘려나갔다면(직전 질문만이라도) 마지막 user 턴은 반드시 보낸다
    return recent.length ? recent : turns.slice(-1)
  }

  async function send(text?: string) {
    const value = (text ?? input.value).trim()
    if (!value || status.value === 'submitted') return

    input.value = ''
    error.value = null
    push('user', value)
    status.value = 'submitted'

    try {
      // 참조 데이터는 대화 턴이 아니라 systemInstruction에 붙인다 — 대화 기록이 데이터로 오염되지 않게.
      const ctx = await context?.(value)
      const resolved: ChatContext = typeof ctx === 'string' ? { text: ctx } : (ctx ?? { text: '' })
      const reference = resolved.text?.trim()
      const 지시 = resolved.지시?.trim()
      // 발췌·버튼·행동에 대한 조건부 지시는 여기 고정으로 두지 않는다. 이번 턴에 해당하는 것만 `지시`로 온다.
      const 기본프롬프트 = toValue(system)
      // 참조만 여기서 붙인다. 지시는 서버가 붙인다(`api-etc/ai/chat`).
      const systemPrompt = [
        기본프롬프트 ?? '',
        reference
          ? [
              '\n\n[참조 데이터]\n아래는 질문에 맞춰 앱이 직접 조회·집계한 결과다. 건수는 앱이 센 값이니 다시 세지 말고 그대로 쓰라. 여기에 없는 내용은 "확인 필요"라고 답하라.\n\n',
              reference
            ].join('')
          : ''
      ].join('') || undefined

      const res = await $fetch<{ text: string }>('/api-etc/ai/chat', {
        method: 'POST',
        body: {
          system: systemPrompt,
          instruction: 지시,
          level,
          messages: recentHistory()
        }
      })

      push('assistant', res.text?.trim() || '응답이 비어 있습니다.', resolved.actions, resolved.metadata)
      status.value = 'ready'
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'AI 요청에 실패했습니다.'
      push('assistant', error.value)
      status.value = 'error'
    }
  }

  function reset() {
    input.value = ''
    error.value = null
    status.value = 'ready'
    messages.value = buildWelcome()
  }

  return { messages, input, status, error, hasConversation, send, reset }
}

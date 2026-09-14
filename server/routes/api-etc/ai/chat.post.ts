import { AI_MODEL_BY_LEVEL, geminiGenerate, resolveAiLevel, toAiUpstreamError } from '../../../utils/ai'

interface ChatTurn {
  role: 'user' | 'assistant'
  text: string
}

interface ChatBody {
  messages?: ChatTurn[]
  /** 시스템 프롬프트. 대화 턴에 섞지 않고 systemInstruction으로 분리해 넘긴다. */
  system?: string
  /** **이번 턴에만** 걸리는 지시. systemInstruction 꼬리에 붙인다. */
  instruction?: string
  level?: string
  /**
   * 주면 구조화 출력. 모델이 이 스키마를 벗어난 토큰을 못 내도록 강제되므로
   * 파싱 실패나 없는 값 생성이 원천 차단된다(계획 수립 단계에서 사용).
   */
  schema?: unknown
}

export default defineEventHandler(async (event) => {
  const { messages, system, level, schema, instruction } = await readBody<ChatBody>(event) ?? {}
  const 지시 = instruction?.trim()

  // Gemini의 role은 'user' | 'model'
  const contents = (messages ?? [])
    .filter(m => typeof m?.text === 'string' && m.text.trim())
    .map(m => ({
      role: m.role === 'assistant' ? 'model' as const : 'user' as const,
      parts: [{ text: m.text.trim() }]
    }))

  if (!contents.length) {
    throw createError({ statusCode: 400, statusMessage: 'messages is required' })
  }

  // Gemini 는 대화 턴 뒤에 system 을 못 넣는다. systemInstruction 꼬리에 붙인다.
  const config: Record<string, unknown> = {}
  const geminiSystem = [system?.trim() ?? '', 지시 ? `\n\n[이번 답변 지시]\n${지시}` : ''].join('')
  if (geminiSystem) config.systemInstruction = geminiSystem
  if (schema) {
    config.responseMimeType = 'application/json'
    config.responseSchema = schema
  }

  try {
    const response = await geminiGenerate({
      model: AI_MODEL_BY_LEVEL[resolveAiLevel(level)],
      contents,
      config: Object.keys(config).length ? config : undefined
    })

    const text = response.text ?? ''
    if (!schema) return { text }

    try {
      return { text, json: JSON.parse(text.trim()) }
    } catch {
      // 스키마를 줬는데도 파싱이 깨지면 상위에서 폴백할 수 있게 json을 비워 돌려준다.
      console.warn('[api-etc/ai/chat] structured output parse failed')
      return { text, json: null }
    }
  } catch (error: unknown) {
    throw toAiUpstreamError(error, 'api-etc/ai/chat')
  }
})

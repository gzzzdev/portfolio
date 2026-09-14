import { AI_MODEL_BY_LEVEL, geminiGenerate, resolveAiLevel, toAiUpstreamError, type AiModelLevel } from '../../../utils/ai'

export type { AiModelLevel }

export async function ask(
  contents: string,
  schema?: any,
  level: AiModelLevel = 'lite'
) {
  const response = await geminiGenerate({
    model: AI_MODEL_BY_LEVEL[resolveAiLevel(level)],
    contents,
    config: schema
      ? {
          responseMimeType: 'application/json',
          responseSchema: schema
        }
      : undefined
  })

  if (schema) {
    const jsonString = response.text?.trim()
    if (!jsonString) {
      throw createError({ statusCode: 502, statusMessage: 'AI response is empty' })
    }
    return JSON.parse(jsonString)
  }

  return response.text
}

export default defineEventHandler(async (event) => {
  const { contents, schema, level } = await readBody(event)
  if (!contents) return { error: 'No prompt provided' }

  try {
    return await ask(contents, schema, resolveAiLevel(level))
  } catch (error: unknown) {
    throw toAiUpstreamError(error, 'api-etc/ai/ask')
  }
})

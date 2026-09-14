import { GoogleGenAI } from '@google/genai'

export const AI_MODEL_BY_LEVEL = {
  lite: 'gemini-3.1-flash-lite',
  flash: 'gemini-3.6-flash',
  pro: 'gemini-3.1-pro-preview'
} as const

/**
 * 이미지 생성 모델(generateContent 방식).
 * 이 API 키에는 imagen(predict) 계열이 없어 gemini image 모델을 쓴다.
 *
 * 기본은 `lite` — 증명사진처럼 변수가 적은 그림은 이걸로 충분하고 가장 싸다.
 * **위 단계도 지우지 말 것.** 품질이 필요한 호출부에서 `imageLevel`만 올리면 바로 쓴다.
 */
export const AI_IMAGE_MODEL_BY_LEVEL = {
  lite: 'gemini-3.1-flash-lite-image',
  flash: 'gemini-3.1-flash-image',
  pro: 'gemini-3-pro-image'
} as const

export type AiImageLevel = keyof typeof AI_IMAGE_MODEL_BY_LEVEL

export function resolveAiImageLevel(level?: string): AiImageLevel {
  return level && level in AI_IMAGE_MODEL_BY_LEVEL ? (level as AiImageLevel) : 'lite'
}

/** 기본 이미지 모델 (하위 호환용 단일 상수) */
export const AI_IMAGE_MODEL = AI_IMAGE_MODEL_BY_LEVEL.lite

/**
 * 생성 해상도. 기본은 가장 싼 1K.
 *
 * 0.5K('512')는 실측 결과 generateContent에서 거부된다
 * ("Image size 512 is not supported for this model", 400) — 다시 시도하지 말 것.
 * SDK 타입의 '512'는 별개인 인터랙션 API(`ImageConfig_2`) 쪽 값이다.
 */
export const AI_IMAGE_SIZES = ['1K', '2K', '4K'] as const
export type AiImageSize = (typeof AI_IMAGE_SIZES)[number]

export function resolveAiImageSize(size?: string): AiImageSize {
  return AI_IMAGE_SIZES.includes(size as AiImageSize) ? (size as AiImageSize) : '1K'
}

/**
 * **레벨마다 받는 해상도가 다르다.** 위 목록은 이 API 가 아는 전부일 뿐,
 * 아무 레벨에나 아무 크기를 넘기면 400 이 온다 — `imageSize` 는 `imageLevel` 과 한 몸이다.
 *
 * 실측 (2026-08-31), 3:4 로 뽑았을 때 나온 실제 픽셀도 같이 적어 둔다:
 *
 *   lite  — **1K 만.** 2K·4K 는 400 "Image size 2K is not supported for this model"
 *   flash — 1K · 2K · 4K
 *   pro   — 1K · 2K · 4K
 *
 *   1K = 896×1200 (0.7MB) · 2K = 1792×2400 (2.8MB) · 4K = 3584×4800 (9.7MB)
 *
 * A4 300dpi 가 2480px 이므로 인쇄용 그림은 2K 가 실질 기준선이다 (1K 는 2.8배 확대).
 * 그리고 2K 를 쓰려면 레벨도 같이 올려야 한다 — 그게 이 표가 있는 이유다.
 */
export const AI_IMAGE_SIZES_BY_LEVEL = {
  lite: ['1K'],
  flash: ['1K', '2K', '4K'],
  pro: ['1K', '2K', '4K']
} as const satisfies Record<AiImageLevel, readonly AiImageSize[]>

/** 이 레벨이 이 크기를 받는가. 안 받으면 상류가 400 을 던진다 */
export const isAiImageSizeAllowed = (level: AiImageLevel, size: AiImageSize): boolean =>
  (AI_IMAGE_SIZES_BY_LEVEL[level] as readonly AiImageSize[]).includes(size)

export type AiModelLevel = keyof typeof AI_MODEL_BY_LEVEL

export function resolveAiLevel(level?: string): AiModelLevel {
  return level && level in AI_MODEL_BY_LEVEL ? (level as AiModelLevel) : 'lite'
}

type GenerateOptions = Parameters<GoogleGenAI['models']['generateContent']>[0]

let primaryAi: GoogleGenAI | undefined
let configApiKey = ''

function ensureClient() {
  if (!primaryAi) {
    configApiKey = String(useRuntimeConfig().geminiApiKey ?? '').trim()
    // 키가 없거나 placeholder('1')면 Netlify AI Gateway 환경변수를 자동으로 사용. 키는 절대 로깅하지 않는다.
    primaryAi = configApiKey && configApiKey !== '1'
      ? new GoogleGenAI({ apiKey: configApiKey, vertexai: false })
      : new GoogleGenAI({})
  }
  return primaryAi
}

/** Google GenAI ApiError는 `.status`를 갖는다. H3가 이걸 그대로 HTTP status로 쓰면 앱 세션 만료로 오인된다. */
export function aiUpstreamStatus(error: unknown) {
  return error && typeof error === 'object' && 'status' in error
    ? Number((error as { status?: number }).status)
    : undefined
}

async function callWithKeyFallback<T>(run: (ai: GoogleGenAI) => Promise<T>) {
  try {
    return await run(ensureClient())
  } catch (error: unknown) {
    const status = aiUpstreamStatus(error)
    // 커스텀 키가 401/403(무효·제한)이면 Netlify AI Gateway zero-config로 폴백
    if ((status === 401 || status === 403) && configApiKey && configApiKey !== '1') {
      console.warn('[ai] Custom Gemini key failed with 401/403. Retrying via Netlify AI Gateway...')
      return await run(new GoogleGenAI({}))
    }
    throw error
  }
}

export async function geminiGenerate(options: GenerateOptions) {
  return callWithKeyFallback(ai => ai.models.generateContent(options))
}

/** upstream 오류를 502로 감싸 클라이언트 401 인터셉터가 세션 만료로 처리하지 않게 한다. */
export function toAiUpstreamError(error: unknown, tag: string) {
  if (error && typeof error === 'object' && 'statusCode' in error) return error

  const status = aiUpstreamStatus(error)
  const message = error instanceof Error ? error.message : 'Failed to call Gemini API'
  console.error(`[${tag}] Gemini error`, { status, message })

  return createError({
    statusCode: 502,
    statusMessage: 'AI upstream error',
    message: status === 401 || status === 403
      ? 'Gemini API rejected the request (check NUXT_GEMINI_API_KEY / key restrictions)'
      : message,
    data: { upstreamStatus: status }
  })
}

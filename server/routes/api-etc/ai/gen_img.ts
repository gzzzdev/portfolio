import {
  AI_IMAGE_MODEL_BY_LEVEL,
  AI_IMAGE_SIZES_BY_LEVEL,
  isAiImageSizeAllowed,
  resolveAiImageLevel,
  resolveAiImageSize,
  geminiGenerate,
  toAiUpstreamError,
  type AiImageLevel,
  type AiImageSize
} from '../../../utils/ai'
import { deflateSync } from 'node:zlib'
import { extByMime, saveImage } from '../../../utils/storage'
import { ask } from './ask'

/**
 * 상류가 받는 비율. **하드 enum 이고, 목록 밖은 400 INVALID_ARGUMENT 다** (실측 2026-08-31).
 * 실패한 400 이 목록 전체를 돌려주므로 이 배열이 곧 그 응답이다:
 *   "aspect_ratio must be one of '1:1', '1:4', '1:8', '2:3', '3:2', '3:4',
 *    '4:1', '4:3', '4:5', '5:4', '8:1', '9:16', '16:9', or '21:9'."
 * `7:5` · `17:12` · `1:1.414` 는 전부 거부됐다 — **소수 표기는 형식 자체가 없다. 다시 시도하지 말 것.**
 *
 * SDK 의 `ImageConfig.aspectRatio` docstring 은 8개만 적고 있어 **틀렸다**. 정확한 쪽은
 * 별개 API 용으로 보이는 `ImageConfig_2` 의 14개 유니온이다 (`imageSize` 의 '512' 와는 반대 상황이니 주의).
 *
 * 규격이 이 중 하나로 안 떨어지면(A4 = 1:1.414) 비율은 여기서 못 맞춘다.
 * 그때 쓰는 길은 **빈 캔버스를 입력 이미지로 넣고 aspectRatio 를 생략**하는 것이다 — 출력이
 * 입력 비율을 그대로 따라간다 (1240×1754 → 864×1222, 오차 0.00%). 순백 1KB 짜리면 충분하다.
 */
const ASPECT_RATIOS = [
  '1:1', '1:4', '1:8', '2:3', '3:2', '3:4',
  '4:1', '4:3', '4:5', '5:4', '8:1', '9:16', '16:9', '21:9'
] as const
type AspectRatio = (typeof ASPECT_RATIOS)[number]

function resolveAspectRatio(value: unknown): AspectRatio {
  return ASPECT_RATIOS.includes(value as AspectRatio) ? (value as AspectRatio) : '16:9'
}

/* ------------------------------------------------------------------ */
/* 빈 캔버스 — enum 밖의 비율을 얻는 유일한 길                          */
/* ------------------------------------------------------------------ */

/**
 * 순백 PNG 한 장. **그림이 아니라 비율을 나르는 껍데기다.**
 *
 * `aspectRatio` 는 14개짜리 하드 enum 이라 A4(1:1.414) 같은 실물 규격은 표현할 수가 없다.
 * 그런데 **입력 이미지를 주고 `aspectRatio` 를 생략하면 출력이 입력 비율을 그대로 따라간다**
 * (실측 2026-08-31: 1240×1754 → 864×1222, 오차 0.00%). 그게 이 함수가 있는 이유다.
 *
 * 크기는 비율만 정확하면 되고 화질과는 무관하다 — 출력 해상도는 `imageSize` 가 정한다
 * (같은 실측에서 248×351 순백 1KB 입력도 864×1223 을 줬다). 긴 변을 1024 로 잡는 것은
 * 정수 반올림 오차를 0.01% 아래로 눌러 두기 위해서지 그 이상의 뜻은 없다.
 *
 * 순백은 deflate 가 거의 통째로 지우므로 파일은 수 KB 다. sharp 같은 의존을 들일 이유가 없어
 * stdlib(zlib)만으로 직접 쓴다.
 */
const CANVAS_LONG = 1024

let crcTable: number[] | null = null

function crc32(buf: Buffer): number {
  if (!crcTable) {
    crcTable = []
    for (let n = 0; n < 256; n++) {
      let c = n
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
      crcTable[n] = c >>> 0
    }
  }
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]!) & 0xff]! ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function pngChunk(type: string, data: Buffer): Buffer {
  const t = Buffer.from(type, 'ascii')
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(Buffer.concat([t, data])))
  return Buffer.concat([len, t, data, crc])
}

/** 폭/높이 비율 → 순백 PNG(base64). */
function 빈캔버스(비율: number): string {
  const [w, h] = 비율 >= 1
    ? [CANVAS_LONG, Math.max(1, Math.round(CANVAS_LONG / 비율))]
    : [Math.max(1, Math.round(CANVAS_LONG * 비율)), CANVAS_LONG]

  const row = Buffer.alloc(1 + w * 3, 0xff)
  row[0] = 0 // 필터 None
  const raw = Buffer.concat(Array.from({ length: h }, () => row))

  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(w, 0)
  ihdr.writeUInt32BE(h, 4)
  ihdr[8] = 8 // 8bit
  ihdr[9] = 2 // truecolor RGB

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', deflateSync(raw, { level: 9 })),
    pngChunk('IEND', Buffer.alloc(0))
  ]).toString('base64')
}

/**
 * 캔버스를 쓸 때 프롬프트 맨 앞에 붙는 줄.
 *
 * 없으면 모델이 흰 캔버스를 그대로 돌려줄 수 있다 — 입력이 있다는 것과 그것을 덮으라는 것은 다른 말이다.
 * 짧게 유지한다. 이 아래로 호출자의 지시문이 통째로 붙기 때문에 여기서 길이를 쓰면 그쪽이 묽어진다.
 */
const 캔버스머리말 = 'Repaint this blank canvas completely, edge to edge, as described below. '
  + 'Keep the exact same image dimensions and proportions as the canvas you were given.'

/** 문서 비율(폭/높이). 범위를 벗어나면 캔버스를 안 쓴다 — enum 경로로 돌아간다 */
function resolveFrameRatio(value: unknown): number | null {
  const r = Number(value)
  return Number.isFinite(r) && r >= 0.05 && r <= 20 ? r : null
}

/**
 * 1단계: 입력한 주제 → 구체적인 장면 묘사.
 * 짧은 제목을 그대로 그리게 하면 주제가 사라진 밋밋한 그림이 나와서, 먼저 장면으로 번역한다.
 */
async function 장면묘사(주제: string) {
  const scene = await ask(
    `You write scene descriptions for thumbnail illustrations.

Subject (Korean): "${주제}"

Describe ONE concrete visual scene in English, 40 words max:
- the single main object or activity that instantly signals this topic (be specific: real objects, tools, symbols of the field)
- optionally one person and what they are physically doing
- 2-3 supporting props specific to the topic
- what is in the foreground vs background

Rules: describe only WHAT is depicted, never style/colors/medium. No text, letters, numbers or signage in the scene. Output the description only.`,
    undefined,
    'lite'
  )

  return typeof scene === 'string' && scene.trim() ? scene.trim() : 주제
}

/**
 * 2단계: 장면 + 스타일 지시.
 * 프리셋의 단일 출처. 클라이언트는 GET 으로 이 목록(라벨/프롬프트)을 받아 렌더한다.
 */
const 스타일프리셋 = {
  photo: {
    label: '실사',
    skipScene: false,
    build: (scene: string, aspectRatio: string, _accent: string) => `Photorealistic close-up photograph, ${aspectRatio}.

Main subject (must be the focal point): ${scene}

Camera: 85mm telephoto lens at f/1.8. The main subject is tack sharp with fine visible texture.
Background: strongly defocused into smooth creamy bokeh — no readable detail, no recognizable secondary objects or bystanders.
Light: soft natural daylight, muted natural color grading.
Framing: the main subject fills most of the frame, nothing else competing for attention. Not a wide environmental shot.
People: prefer an object-focused frame; include a person only when the subject genuinely needs one. If a person appears, make them Korean / East Asian with a natural everyday look, and keep them non-identifiable — favor hands, a partial figure, or a side / three-quarter view over a frontal portrait. No resemblance to any real or famous person.
No text, letters, numbers, signage, logos or watermarks anywhere in the image.`
  },

  lineart: {
    label: '라인아트',
    skipScene: false,
    build: (scene: string, aspectRatio: string, accent: string) => `Thumbnail illustration, ${aspectRatio}.

Subject: ${scene}

Line: one continuous black line of even, thin weight. No hatching, no sketchy strokes, no heavy outlines.
Color: pure white background. A soft watercolor wash in ${accent} fills only two or three shapes; everything else stays white. Use no other hue.
Detail: draw only what identifies the subject. Omit floors, walls, furniture, scenery and any incidental background object entirely.
Composition: one clear focal point, generous white space, nothing cropped awkwardly at the edges.
Absolutely no text, letters, numbers, equations or labels anywhere in the image.`
  },

  /**
   * 카드 출력물(명함·회원증·증서)의 **배경 아트 레이어** 전용.
   *
   * 이 레이어에는 회원 데이터가 하나도 올라가지 않으므로 이미지 생성이 성립한다.
   * 다만 그 위에 이름·날짜가 얹히므로 두 가지를 강제한다:
   *   - 글자/로고 금지 (생성된 글자는 항상 깨진다)
   *   - 중앙은 비우고 디테일은 가장자리로 (본문 가독성)
   *
   * 주제를 장면으로 번역하면(장면묘사) 사물·인물이 생겨 배경으로 못 쓴다 → skipScene.
   */
  배경: {
    label: '카드 배경',
    skipScene: true,
    build: (scene: string, aspectRatio: string, accent: string) => `A seamless decorative BACKGROUND for a printed card or certificate, ${aspectRatio}.

Desired look: ${scene}
This surface is COMPLETELY BLANK of writing. Whatever the look above suggests, render it as material and ornament only.
Accent: ${accent}.

Absolute rules:
- NO writing of any kind. No text, letters, numbers, words, logos, watermarks or signatures.
- This includes DECORATIVE writing: no calligraphy, no brushwork characters, no seal script, no stamps or chops with characters, no engraved or carved inscriptions, no Hanja / Chinese characters / Kanji / Hangul / Japanese / Arabic script, no runes, no faux or unreadable glyphs.
  (Traditional themes tempt you to add "just a little" calligraphy as ornament — do not. Real text will be printed on top of this image, and generated characters always come out garbled.)
- Ornament means non-linguistic shapes only: borders, frames, corner scrollwork, lattice, clouds, floral or geometric motifs, grain, fiber, marbling.
- NO people, NO objects, NO illustration subject. Surface, texture and ornament only.
- Keep the CENTER calm, low-contrast and uniform so text stays readable on top of it.
- Place any ornament, border or detail near the OUTER EDGES only.
- Even soft lighting, flat straight-on scan of a decorated sheet. No vignette, no glare, no drop shadows.
- Muted, print-friendly tones. Avoid pure black and avoid fully saturated color.`
  }
} as const

type 스타일키 = keyof typeof 스타일프리셋

/** 미리보기용 자리표시자 — 실제 생성 시에는 1단계 장면묘사 결과가 들어간다. */
const SCENE_PLACEHOLDER = '(입력한 주제로 만든 장면 묘사가 여기에 들어갑니다)'

/** 테마 강조색(hex). 없으면 모델이 알아서 고르게 둔다. */
const ACCENT_FALLBACK = 'a single accent color'

function resolveAccent(value: unknown) {
  return typeof value === 'string' && /^#[0-9a-fA-F]{6}$/.test(value.trim())
    ? `the accent color ${value.trim().toLowerCase()}`
    : ACCENT_FALLBACK
}

function resolve스타일(value: unknown): 스타일키 {
  return typeof value === 'string' && value in 스타일프리셋 ? (value as 스타일키) : 'photo'
}

/**
 * 그림이 들어갈 폴더 (`uploads/ai/<dir>`).
 *
 * **전부 루트에 쌓으면 나중에 무엇이 무엇인지 알 수 없다** — 실제로 130장이 한 폴더에
 * 섞여서 한 번 손으로 갈라내야 했다. 그래서 저장 시점에 갈라 둔다.
 *
 * 기본값은 프리셋이 정한다. 프리셋을 아는 것은 서버뿐이므로 여기가 그 자리다.
 * 지시문(`stylePrompt`) 경로는 다르다 — 그때 서버는 용도를 모르므로(증명사진인지
 * 행사포스터인지) 호출부가 `dir` 로 말해 줘야 한다.
 */
const 폴더BY스타일: Record<스타일키, string> = {
  photo: 'ai',
  lineart: 'lineart',
  배경: 'paper_frame'
}

/** 경로 조작을 막으려 영문·숫자·밑줄·하이픈만 받는다 (`save_img` 와 같은 규칙) */
function resolve저장폴더(value: unknown, 스타일: 스타일키) {
  return typeof value === 'string' && /^[a-z0-9_-]{1,32}$/i.test(value)
    ? value
    : 폴더BY스타일[스타일]
}

/** gemini image 모델은 1회 호출당 1장이라, 여러 장은 병렬 호출로 만든다. */
async function genOne(
  prompt: string,
  aspectRatio: AspectRatio,
  level: AiImageLevel,
  imageSize: AiImageSize,
  canvas: string | null,
  dir: string
) {
  const response = await geminiGenerate({
    model: AI_IMAGE_MODEL_BY_LEVEL[level],
    contents: canvas
      ? [{ role: 'user', parts: [{ inlineData: { mimeType: 'image/png', data: canvas } }, { text: prompt }] }]
      : prompt,
    config: {
      responseModalities: ['TEXT', 'IMAGE'],
      // 캔버스가 있으면 비율을 **말하지 않는다**. 말하는 순간 enum 이 이기고 캔버스는 무시된다
      // (실측: 캔버스 + '3:4' 명시 → 896×1200 으로 되돌아갔다)
      imageConfig: canvas ? { imageSize } : { aspectRatio, imageSize }
    }
  })

  const parts = response.candidates?.[0]?.content?.parts ?? []
  const image = parts.find(part => part.inlineData?.data)?.inlineData

  if (!image?.data) {
    throw createError({
      statusCode: 502,
      statusMessage: '이미지가 생성되지 않았습니다. (안전 필터 또는 프롬프트 문제)'
    })
  }

  const mimeType = image.mimeType || 'image/png'
  const buffer = Buffer.from(image.data, 'base64')
  const fileName = `ai-generated-${Date.now()}-${Math.random().toString(36).substring(2)}.${extByMime(mimeType)}`

  return await saveImage(buffer, fileName, mimeType, dir)
}

export default defineEventHandler(async (event) => {
  // GET: 스타일 프리셋 목록(칩 라벨 + 읽기 전용 프롬프트)
  if (event.method === 'GET') {
    return {
      styles: Object.entries(스타일프리셋).map(([key, preset]) => ({
        key,
        label: preset.label,
        prompt: preset.build(SCENE_PLACEHOLDER, '16:9', ACCENT_FALLBACK)
      }))
    }
  }

  const body = await readBody(event)
  const 주제 = typeof body?.prompt === 'string' ? body.prompt.trim() : ''

  if (!주제) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Valid prompt string is required'
    })
  }

  const 스타일 = resolve스타일(body?.style)
  const accent = resolveAccent(body?.accentColor)
  const aspectRatio = resolveAspectRatio(body?.aspectRatio)
  const count = Math.min(4, Math.max(1, Number(body?.count) || 1))
  // 모델·해상도는 호출부가 올릴 수 있다. 기본은 가장 싼 조합(lite / 1K).
  const imageLevel = resolveAiImageLevel(body?.imageLevel)
  const imageSize = resolveAiImageSize(body?.imageSize)
  /**
   * 실물 규격이 있으면 그 비율의 빈 캔버스로 간다 (`빈캔버스`). 주면 `aspectRatio` 는 무시된다 —
   * 둘 다 주는 것은 모순이고, 상류에서는 enum 이 이기기 때문이다.
   */
  const canvas = (r => (r ? 빈캔버스(r) : null))(resolveFrameRatio(body?.frameRatio))

  /**
   * 둘은 한 몸이라 여기서 막는다 (`AI_IMAGE_SIZES_BY_LEVEL`).
   * 그냥 보내면 상류가 400 을 주고 그게 502 "AI upstream error" 로 감싸여 나가는데,
   * 화면에서는 원인이 레벨이라는 걸 알 길이 없다 — 실제로 그걸로 한 번 헤맸다.
   */
  if (!isAiImageSizeAllowed(imageLevel, imageSize)) {
    throw createError({
      statusCode: 400,
      statusMessage: `imageSize ${imageSize}는 imageLevel '${imageLevel}'가 받지 못합니다 `
        + `(가능: ${AI_IMAGE_SIZES_BY_LEVEL[imageLevel].join(' · ')}). imageLevel을 flash 이상으로 올리세요.`
    })
  }

  /**
   * 호출자가 통째로 넘긴 스타일 지시문.
   *
   * 증명사진·행사포스터·강의썸네일처럼 **특정 모델에 종속된** 그림 규칙은 그 모델이 소유해야 한다.
   * 여기 프리셋을 늘리면 서버 라우트가 도메인 모델 카탈로그가 되고 의존이 거꾸로 뒤집힌다.
   * 그래서 프리셋을 늘리는 대신 지시문을 받는 통로만 연다 — gen_img는 도메인을 몰라야 한다.
   *
   * 지시문이 오면 `주제`도 호출자가 이미 완성한 피사체 묘사이므로 장면묘사를 건너뛴다.
   */
  const 지시문 = typeof body?.stylePrompt === 'string' ? body.stylePrompt.trim() : ''

  const 저장폴더 = resolve저장폴더(body?.dir, 스타일)

  try {
    // 배경 텍스처는 "장면"으로 번역하면 사물·인물이 끼어들어 배경으로 못 쓴다
    const skipScene = 지시문 ? true : 스타일프리셋[스타일].skipScene
    const scene = skipScene ? 주제 : await 장면묘사(주제)
    const 본문 = 지시문
      ? `${지시문}\n\nSubject: ${scene}`
      : 스타일프리셋[스타일].build(scene, aspectRatio, accent)
    const prompt = canvas ? `${캔버스머리말}\n\n${본문}` : 본문
    const results = await Promise.all(
      Array.from({ length: count }, () => genOne(prompt, aspectRatio, imageLevel, imageSize, canvas, 저장폴더))
    )

    return {
      success: true,
      url: results[0]!.url, // 하위 호환 (단일 URL 사용처)
      urls: results.map(item => item.url),
      prompt: 주제,
      style: 지시문 ? 'custom' : 스타일,
      model: AI_IMAGE_MODEL_BY_LEVEL[imageLevel],
      imageSize,
      // 캔버스로 갔으면 비율은 캔버스가 정했다. enum 값을 돌려주면 거짓말이 된다
      aspectRatio: canvas ? null : aspectRatio,
      scene
    }
  } catch (error: unknown) {
    throw toAiUpstreamError(error, 'api-etc/ai/gen_img')
  }
})

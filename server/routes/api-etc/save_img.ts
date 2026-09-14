import { extByMime, saveImage } from '../../utils/storage'

/**
 * 브라우저가 만든 그림 한 장을 받아 저장한다. (data URI → `/uploads/...`)
 *
 * **왜 서버가 이걸 받아야 하는가**: 누끼(흰 바탕 키잉)는 브라우저 canvas 에서만 할 수 있다 —
 * 이 프로젝트에는 sharp·jimp 같은 이미지 라이브러리가 없어서 서버는 JPEG 를 디코드하지 못한다.
 * 그런데 결과를 data URI 그대로 두면 PNG 한 장이 문서와 `assets.json` 에 통째로 박힌다
 * (1024px 도장이 ~1MB). lowdb 는 요청마다 테이블 JSON 을 통째로 읽으므로 그건 곧 느려짐이다.
 * 그래서 바이트만 여기로 보내고 링크를 돌려받는다.
 *
 * gen_img 와 같은 저장 경로(`saveImage`)를 쓴다 — Supabase 우선, 없으면 로컬 public.
 */

/** 한 장 상한. 4K PNG 를 넘길 일이 없고, base64 는 원본의 4/3 이라 여유를 둔다 */
const 상한바이트 = 12 * 1024 * 1024

const 허용mime = ['image/png', 'image/jpeg', 'image/webp']

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const dataUrl = typeof body?.dataUrl === 'string' ? body.dataUrl : ''

  const m = /^data:([a-z/+-]+);base64,(.+)$/is.exec(dataUrl)
  if (!m) {
    throw createError({ statusCode: 400, statusMessage: 'dataUrl(base64 data URI)이 필요합니다.' })
  }

  const mimeType = m[1]!.toLowerCase()
  if (!허용mime.includes(mimeType)) {
    throw createError({
      statusCode: 400,
      statusMessage: `지원하지 않는 형식입니다: ${mimeType} (가능: ${허용mime.join(' · ')})`
    })
  }

  const buffer = Buffer.from(m[2]!, 'base64')
  if (!buffer.length || buffer.length > 상한바이트) {
    throw createError({
      statusCode: 400,
      statusMessage: `그림 크기가 범위를 벗어났습니다 (${buffer.length}바이트, 상한 ${상한바이트}).`
    })
  }

  // 폴더는 호출자가 고른다. 경로 조작을 막으려 영문·숫자·밑줄·하이픈만 받는다
  // (밑줄이 없으면 `paper_frame`·`face_snaps` 같은 기존 폴더가 통째로 'ai' 로 떨어진다)
  const dir = /^[a-z0-9_-]{1,32}$/i.test(String(body?.dir ?? '')) ? String(body.dir) : 'ai'
  const fileName = `made-${Date.now()}-${Math.random().toString(36).slice(2)}.${extByMime(mimeType)}`

  const saved = await saveImage(buffer, fileName, mimeType, dir)
  return { success: true, url: saved.url, storage: saved.storage }
})

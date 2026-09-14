import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { createClient } from '@supabase/supabase-js'

const EXT_BY_MIME: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp'
}

export function extByMime(mimeType: string) {
  return EXT_BY_MIME[mimeType] ?? 'png'
}

/** 100년 (실질적으로 영구) */
const SIGNED_URL_EXPIRES_IN = 60 * 60 * 24 * 365 * 100

async function uploadToSupabase(buffer: Buffer, fileName: string, mimeType: string, dir: string) {
  const { supabaseUrl, supabaseServiceRoleKey, supabaseBucketName } = useRuntimeConfig()
  if (!supabaseUrl || !supabaseServiceRoleKey || !supabaseBucketName) return null

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)
  const filePath = `${dir}/${fileName}`

  const { error } = await supabase.storage
    .from(supabaseBucketName)
    .upload(filePath, buffer, { contentType: mimeType, upsert: false })

  if (error) throw new Error(`Upload failed: ${error.message}`)

  const { data: signedUrlData, error: signedUrlError } = await supabase.storage
    .from(supabaseBucketName)
    .createSignedUrl(filePath, SIGNED_URL_EXPIRES_IN)

  if (signedUrlError) {
    const { data: urlData } = supabase.storage.from(supabaseBucketName).getPublicUrl(filePath)
    return { url: urlData.publicUrl, storage: 'supabase' as const }
  }

  return { url: signedUrlData.signedUrl, storage: 'supabase' as const }
}

/**
 * 로컬 public 폴더에 저장(프로토타입/개발용 폴백).
 * nuxt.config 의 `dir.public = _CUSTOM/public` 이라 `/uploads/...` 로 서빙된다.
 * 빌드 후 배포 환경에서는 소스 폴더에 쓰는 것이라 영구적이지 않다 — 운영은 Supabase 설정 필요.
 */
async function saveToLocalPublic(buffer: Buffer, fileName: string, dir: string) {
  const relativeDir = join('uploads', dir)
  const absoluteDir = join(process.cwd(), '_CUSTOM', 'public', relativeDir)

  await mkdir(absoluteDir, { recursive: true })
  await writeFile(join(absoluteDir, fileName), buffer)

  return { url: `/${relativeDir}/${fileName}`, storage: 'local' as const }
}

/**
 * 이미지 저장: Supabase 스토리지 우선, 설정이 없거나 실패하면 로컬 public 폴더로 폴백.
 * @param dir 버킷/public 하위 폴더명 (예: 'ai')
 */
export async function saveImage(buffer: Buffer, fileName: string, mimeType: string, dir = 'ai') {
  try {
    const uploaded = await uploadToSupabase(buffer, fileName, mimeType, dir)
    if (uploaded) return uploaded
  } catch (error) {
    console.warn('[storage] Supabase 업로드 실패 → 로컬 저장으로 폴백:', (error as Error).message)
  }

  return await saveToLocalPublic(buffer, fileName, dir)
}

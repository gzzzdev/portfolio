// import type { iDB } from './_db'
// import db, { getTable, is운영서버 } from './_db'

import { createClient } from '@supabase/supabase-js'
// : Promise<iDB>
export default defineEventHandler(async (event) => {
  try {
    const { supabaseUrl, supabaseAnonKey, supabaseServiceRoleKey, supabaseBucketName } = useRuntimeConfig(event)

    // Supabase 클라이언트 생성
    // supabaseKey
    // supabaseAnonKey
    const supabase = createClient(
      supabaseUrl,
      supabaseAnonKey

    )

    // multipart/form-data 파싱
    const formData = await readMultipartFormData(event)

    if (!formData || formData.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No file uploaded'
      })
    }

    const results = []

    for (const file of formData) {
      if (!file.filename || !file.data) {
        continue
      }

      // 파일 확장자 추출
      const fileExtension = file.filename.split('.').pop()
      const fileId = `f-${Date.now()}-${Math.random().toString(36).substring(2)}`
      const fileName = `${fileId}.${fileExtension}`
      // -${Math.random().toString(36).substring(2)
      // file.filename ??
      // const fileName = file.filename ?? `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`

      // 파일 경로 설정 (예: uploads/ 폴더에 저장)
      const filePath = `files/${fileName}`

      // Supabase Storage에 파일 업로드
      const { data, error } = await supabase.storage
        .from(supabaseBucketName)
        .upload(filePath, file.data, {
          contentType: file.type || 'application/octet-stream',
          upsert: false
        })

      if (error) {
        console.error('Upload error:', error)
        throw createError({
          statusCode: 500,
          statusMessage: `Upload failed: ${error.message}`
        })
      } else {
        const { data: publicUrlData } = await supabase.storage
          .from(supabaseBucketName)
          .getPublicUrl(filePath)

        results.push({
          originalName: file.filename,
          fileId: fileId,
          fileName: fileName,
          publicUrl: publicUrlData.publicUrl

        })
      }
    }

    const firstResult = results[0]
    if (!firstResult) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No valid file uploaded'
      })
    }

    console.log(results)
    return {
      success: true,
      fileId: firstResult.fileId,
      fileName: firstResult.fileName,
      originalName: firstResult.originalName,
      publicUrl: firstResult.publicUrl

    }
  } catch (error: any) {
    console.error('Upload API error:', error)

    if (error.statusCode) {
      throw error
    }

    const message = String(error?.message ?? '').toLowerCase()
    if (message.includes('too large') || message.includes('payload')) {
      throw createError({
        statusCode: 413,
        statusMessage: '업로드 가능한 파일 크기를 초과했습니다.'
      })
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error during upload'
    })
  }
})

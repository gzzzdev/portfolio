import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig(event)
    const { supabaseUrl, supabaseServiceRoleKey } = config

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

    // 요청 본문에서 파일 경로 가져오기
    const body = await readBody(event)
    const { filePath } = body

    if (!filePath) {
      throw createError({
        statusCode: 400,
        statusMessage: 'File path is required'
      })
    }

    // Supabase Storage에서 파일 삭제
    const { data, error } = await supabase.storage
      .from('files') // 버킷 이름을 'files'로 설정 (실제 버킷 이름에 맞게 변경)
      .remove([filePath])

    if (error) {
      console.error('Delete file error:', error)
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to delete file: ${error.message}`
      })
    }

    return {
      success: true,
      message: 'File deleted successfully',
      deletedFile: filePath
    }
  } catch (error: any) {
    console.error('Delete file API error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error while deleting file'
    })
  }
})

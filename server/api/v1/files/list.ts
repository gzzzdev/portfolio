import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig(event)
    const { supabaseUrl, supabaseServiceRoleKey } = config

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

    // 쿼리 파라미터에서 폴더 경로 가져오기
    const query = getQuery(event)
    const folderPath = (query.folder as string) || 'uploads'

    // Supabase Storage에서 파일 목록 가져오기
    const { data, error } = await supabase.storage
      .from('files') // 버킷 이름을 'files'로 설정 (실제 버킷 이름에 맞게 변경)
      .list(folderPath, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'name', order: 'asc' }
      })

    if (error) {
      console.error('List files error:', error)
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to list files: ${error.message}`
      })
    }

    // 파일 정보에 공개 URL 추가
    const filesWithUrls = data.map((file) => {
      const filePath = `${folderPath}/${file.name}`
      const { data: urlData } = supabase.storage
        .from('files')
        .getPublicUrl(filePath)

      return {
        ...file,
        publicUrl: urlData.publicUrl,
        downloadUrl: `/api/files/download?path=${encodeURIComponent(filePath)}`
      }
    })

    return {
      success: true,
      files: filesWithUrls,
      folder: folderPath
    }
  } catch (error: any) {
    console.error('List files API error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error while listing files'
    })
  }
})

import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig(event)
    const { supabaseUrl, supabaseServiceRoleKey } = config

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

    // 쿼리 파라미터에서 파일 경로 가져오기
    const query = getQuery(event)
    const filePath = query.path as string

    if (!filePath) {
      throw createError({
        statusCode: 400,
        statusMessage: 'File path is required'
      })
    }

    // Supabase Storage에서 파일 다운로드
    const { data, error } = await supabase.storage
      .from('files') // 버킷 이름을 'files'로 설정 (실제 버킷 이름에 맞게 변경)
      .download(filePath)

    if (error) {
      console.error('Download error:', error)
      throw createError({
        statusCode: 404,
        statusMessage: `File not found: ${error.message}`
      })
    }

    // 파일 정보 가져오기
    const { data: fileInfo } = await supabase.storage
      .from('files')
      .list(filePath.split('/').slice(0, -1).join('/'), {
        search: filePath.split('/').pop()
      })

    // 파일명 추출
    const fileName = filePath.split('/').pop() || 'download'

    // 응답 헤더 설정
    setHeaders(event, {
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Cache-Control': 'no-cache'
    })

    return data
  } catch (error: any) {
    console.error('Download API error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error during download'
    })
  }
})

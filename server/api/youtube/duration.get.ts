const parseYoutubeVideoId = (url: string): string | null => {
  if (!url) return null

  try {
    const parsed = new URL(url)
    const host = parsed.hostname.replace(/^www\./, '')

    if (host === 'youtu.be') {
      return parsed.pathname.replace('/', '') || null
    }

    if (host.includes('youtube.com')) {
      if (parsed.pathname === '/watch') {
        return parsed.searchParams.get('v')
      }

      if (parsed.pathname.startsWith('/shorts/')) {
        return parsed.pathname.split('/')[2] || null
      }

      if (parsed.pathname.startsWith('/embed/')) {
        return parsed.pathname.split('/')[2] || null
      }
    }
  } catch {
    return null
  }

  return null
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const rawUrl = String(query.url ?? '')
  const videoId = parseYoutubeVideoId(rawUrl)

  if (!videoId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid YouTube URL'
    })
  }

  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`
  const html = await $fetch<string>(watchUrl, { responseType: 'text' as const })

  const lengthSecondsMatch = html.match(/"lengthSeconds":"(\d+)"/)
  const totalTime = Number(lengthSecondsMatch?.[1] ?? 0)

  if (!Number.isFinite(totalTime) || totalTime <= 0) {
    throw createError({
      statusCode: 502,
      statusMessage: 'Unable to parse YouTube duration'
    })
  }

  return { totalTime }
})

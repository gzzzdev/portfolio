type RandPicOrientation = 'landscape' | 'portrait' | 'squarish'
type RandPicContentFilter = 'low' | 'high'

interface UnsplashRandomPhotoResponse {
  id: string
  description: string | null
  alt_description: string | null
  urls: {
    raw: string
    full: string
    regular: string
    small: string
    thumb: string
  }
  links: {
    html: string
    download_location?: string
  }
  user: {
    name: string
    username: string
    links: {
      html: string
    }
  }
}

function normalizeQueryValue(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

function normalizeTags(value: unknown): string[] {
  if (!value) return []
  const rawValues = Array.isArray(value) ? value : [value]
  return rawValues
    .flatMap(item => String(item).split(','))
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0)
}

function normalizeCount(value: unknown, defaultCount = 4): number {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return defaultCount
  return Math.min(30, Math.max(1, Math.floor(parsed)))
}

function mapPhoto(photo: UnsplashRandomPhotoResponse) {
  return {
    id: photo.id,
    description: photo.description,
    altDescription: photo.alt_description,
    image: {
      raw: photo.urls.raw,
      full: photo.urls.full,
      regular: photo.urls.regular,
      small: photo.urls.small,
      thumb: photo.urls.thumb
    },
    attribution: {
      photographerName: photo.user.name,
      photographerUsername: photo.user.username,
      photographerProfileUrl: photo.user.links.html,
      unsplashPhotoUrl: photo.links.html,
      unsplashDownloadLocation: photo.links.download_location ?? null
    }
  }
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const accessKey = config.unsplashAccessKey

  if (!accessKey || accessKey === '1') {
    throw createError({
      statusCode: 500,
      statusMessage: 'UNSPLASH_ACCESS_KEY is not configured'
    })
  }

  const query = getQuery(event)
  const searchQuery = normalizeQueryValue(query.query)
  const tags = normalizeTags(query.tags)
  const tagQuery = tags.join(' ')
  const finalQuery = searchQuery ?? (tagQuery.length > 0 ? tagQuery : undefined)
  const orientation = normalizeQueryValue(query.orientation)
  const contentFilter = normalizeQueryValue(query.contentFilter ?? query.content_filter)
  const count = normalizeCount(query.count, 4)

  if (
    orientation
    && !(['landscape', 'portrait', 'squarish'] as RandPicOrientation[]).includes(
      orientation as RandPicOrientation
    )
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'orientation must be one of landscape, portrait, squarish'
    })
  }

  if (
    contentFilter
    && !(['low', 'high'] as RandPicContentFilter[]).includes(contentFilter as RandPicContentFilter)
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'contentFilter must be one of low, high'
    })
  }

  try {
    const data = await $fetch<UnsplashRandomPhotoResponse | UnsplashRandomPhotoResponse[]>(
      'https://api.unsplash.com/photos/random',
      {
        headers: {
          Authorization: `Client-ID ${accessKey}`
        },
        query: {
          ...(finalQuery ? { query: finalQuery } : {}),
          ...(orientation ? { orientation } : {}),
          ...(contentFilter ? { content_filter: contentFilter } : {}),
          count
        }
      }
    )

    const photos = Array.isArray(data) ? data : [data]

    return {
      count: photos.length,
      items: photos.map(mapPhoto)
    }
  } catch (error) {
    throw createError({
      statusCode: 502,
      statusMessage: 'Failed to fetch random images from Unsplash',
      cause: error
    })
  }
})

export type RandPicOrientation = 'landscape' | 'portrait' | 'squarish'
export type RandPicContentFilter = 'low' | 'high'

export interface RandPicParams {
  query?: string
  tags?: string | string[]
  orientation?: RandPicOrientation
  contentFilter?: RandPicContentFilter
  count?: number
}

export interface RandPicItem {
  id: string
  description: string | null
  altDescription: string | null
  image: {
    raw: string
    full: string
    regular: string
    small: string
    thumb: string
  }
  attribution: {
    photographerName: string
    photographerUsername: string
    photographerProfileUrl: string
    unsplashPhotoUrl: string
    unsplashDownloadLocation: string | null
  }
}

export interface RandPicsResult {
  count: number
  items: RandPicItem[]
}

export default function useRandPic() {
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const getRandPics = async (params: RandPicParams = {}): Promise<RandPicsResult> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await $fetch<RandPicsResult>('/api-etc/randPics', {
        method: 'GET',
        query: params
      })

      return response
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch random picture'
      error.value = message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const reset = () => {
    error.value = null
  }

  return {
    getRandPics,
    error,
    isLoading,
    reset
  }
}

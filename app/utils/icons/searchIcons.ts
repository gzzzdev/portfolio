/**
 * 아이콘 검색은 **Iconify API 를 친다.** 이름 목록을 리포에 쌓아 두지 않는다.
 *
 * 예전엔 `mdi.ts`·`material-symbols.ts`·`mdi4000.ts` 로 2만 줄을 긁어다 뒀는데,
 * 2026-09-07 에 재보니 `curl 'https://api.iconify.design/collection?prefix=mdi'` 가
 * **9,032개**를 주고 쌓아둔 사본은 6,362개였다 — 스냅샷이 원본보다 적다.
 * 다시 긁을 일이 생기면 그 한 줄이고, 그게 항상 최신이다.
 *
 * 여기 남는 로컬 목록은 둘뿐이다:
 *   `outline300` — 검색어가 비었을 때 보여 줄 **고른 기본값**(API로는 못 고른다)
 *   `prefixes`   — 검색 범위를 좁힐 아이콘셋 목록
 */
import outline300 from './outline300'
import iconPrefixes from './prefixes'

const ICONIFY_SEARCH_API = 'https://api.iconify.design/search'
const ICON_PREFIXES = iconPrefixes.join(',')

const PREFIX_SEARCH_CONFIG = {
  palette: !false
} as const

export type IconSearchResult = {
  value: string
  label?: string
  fullname?: string
}

export type IconSearchOptions = {
  prefix?: string
  limit?: number
}

const sortedPrefixes = [...iconPrefixes].sort((a, b) => b.length - a.length)

const iconLabel = (value: string) => value.split(':').at(-1) ?? value

const toUnoIcon = (iconifyName: string) => `i-${iconifyName}`

export const toIconifyName = (unoIcon: string): string => {
  const raw = unoIcon.startsWith('i-') ? unoIcon.slice(2) : unoIcon
  if (raw.includes(':'))
    return raw

  for (const prefix of sortedPrefixes) {
    if (raw === prefix)
      return prefix
    if (raw.startsWith(`${prefix}-`))
      return `${prefix}:${raw.slice(prefix.length + 1)}`
  }

  return raw
}

export const defaultResults = (limit: number): IconSearchResult[] =>
  outline300.slice(0, limit).map(icon => ({
    value: icon,
    label: iconLabel(icon),
    fullname: toIconifyName(icon)
  }))

const cache = new Map<string, IconSearchResult[]>()

const buildSearchQuery = (query: string) => {
  const parts: string[] = []
  if (PREFIX_SEARCH_CONFIG.palette === false)
    parts.push('palette=false')
  parts.push(query)
  return parts.join(' ')
}

const cacheKey = (query: string, prefix: string | undefined, limit: number) =>
  `${prefix ?? '*'}:${limit}:${PREFIX_SEARCH_CONFIG.palette}:${query}`

export const searchIcons = async (
  query: string,
  { prefix, limit = 300 }: IconSearchOptions = {}
): Promise<IconSearchResult[]> => {
  const q = query.trim()
  if (!q)
    return defaultResults(limit)

  const key = cacheKey(q, prefix, limit)
  const cached = cache.get(key)
  if (cached)
    return cached

  try {
    const params = new URLSearchParams({
      query: buildSearchQuery(q),
      limit: String(limit)
    })
    if (prefix)
      params.set('prefix', prefix)
    else
      params.set('prefixes', ICON_PREFIXES)
    const response = await fetch(`${ICONIFY_SEARCH_API}?${params}`)
    if (!response.ok)
      return []

    const data = await response.json()
    const results: IconSearchResult[] = (data.icons ?? []).map((icon: string) => ({
      value: toUnoIcon(icon),
      label: iconLabel(icon),
      fullname: icon
    }))

    cache.set(key, results)
    return results
  } catch {
    return []
  }
}

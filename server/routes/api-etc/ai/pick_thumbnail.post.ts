import { toAiUpstreamError } from '../../../utils/ai'
import { ask } from './ask'

/**
 * 글 제목·본문 → Unsplash 사진 한 장.
 *
 * **그림을 만들지 않는다.** 이미 찍혀 있는 사진 중에서 고른다 — 게시글 썸네일은 "이 글이 무슨 얘기인지"만
 * 알려주면 되고, 그 용도로는 생성보다 검색이 싸고 빠르고 결과도 안정적이다.
 * (그림이 필요하면 `gen_img`가 따로 있다.)
 *
 * 두 번 묻는 이유: 검색어를 먼저 뽑지 않으면 한글 제목으로 Unsplash를 칠 수 없고, 검색 결과를 보기 전에는
 * 고를 수가 없다. 그래서 (1) 한글 → 영어 검색어, (2) 후보 목록 → 하나 선택, 두 단계다. 둘 다 `lite`.
 *
 * 두 번째 호출의 `id`는 **후보 id로 enum을 닫는다** — 열어두면 모델이 없는 사진 id를 지어낸다.
 */

interface UnsplashSearchPhoto {
  id: string
  description: string | null
  alt_description: string | null
  urls: { raw: string, full: string, regular: string, small: string, thumb: string }
  links: { html: string, download_location?: string }
  user: { name: string, username: string, links: { html: string } }
}

interface i후보 {
  id: string
  설명: string
  url: string
  credit: {
    photographerName: string
    photographerProfileUrl: string
    unsplashPhotoUrl: string
  }
  downloadLocation: string | null
}

const ORIENTATIONS = ['landscape', 'portrait', 'squarish'] as const
type i방향 = (typeof ORIENTATIONS)[number]

/** 본문은 HTML이라 태그를 걷어내고 앞부분만 쓴다 — 검색어 뽑는 데 전문이 필요하지 않다. */
function 본문요약(html: unknown, max = 600): string {
  return String(html ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max)
}

async function 검색어뽑기(제목: string, 본문: string): Promise<string[]> {
  const result = await ask(
    `You pick stock-photo search terms for a blog/notice post thumbnail.

Title (Korean): "${제목 || '(없음)'}"
Body excerpt (Korean): "${본문 || '(없음)'}"

Give 3 English Unsplash search queries, best first.
Rules:
- 1-3 words each, concrete photographable nouns/scenes (e.g. "server room", "team meeting", "autumn campus")
- describe what a PHOTO would show, not the abstract topic
- no brand names, no text-in-image concepts, no Korean
- if the post is trivial or has no real subject, still give generic workplace/nature terms`,
    {
      type: 'object',
      properties: { queries: { type: 'array', items: { type: 'string' } } },
      required: ['queries']
    },
    'lite'
  )

  const list = Array.isArray(result?.queries) ? result.queries : []
  return list.map((q: unknown) => String(q ?? '').trim()).filter(Boolean).slice(0, 3)
}

async function unsplash검색(
  query: string,
  accessKey: string,
  orientation: i방향
): Promise<i후보[]> {
  const data = await $fetch<{ results?: UnsplashSearchPhoto[] }>(
    'https://api.unsplash.com/search/photos',
    {
      headers: { Authorization: `Client-ID ${accessKey}` },
      query: { query, per_page: 8, orientation, content_filter: 'high' }
    }
  )

  return (data?.results ?? []).map(p => ({
    id: p.id,
    설명: (p.description || p.alt_description || '').trim().slice(0, 160) || '(설명 없음)',
    url: p.urls.regular,
    credit: {
      photographerName: p.user.name,
      photographerProfileUrl: p.user.links.html,
      unsplashPhotoUrl: p.links.html
    },
    downloadLocation: p.links.download_location ?? null
  }))
}

async function 고르기(제목: string, 본문: string, 후보s: i후보[]): Promise<i후보> {
  if (후보s.length === 1) return 후보s[0]!

  const 목록 = 후보s.map((c, i) => `${i + 1}. id=${c.id} — ${c.설명}`).join('\n')
  const result = await ask(
    `Pick the ONE photo that best fits this post as a thumbnail.

Title (Korean): "${제목 || '(없음)'}"
Body excerpt (Korean): "${본문 || '(없음)'}"

Candidates (English descriptions):
${목록}

Prefer a photo whose subject a reader would connect to the post at a glance.
Avoid photos that are mostly close-up texture, or that show text/logos.`,
    {
      type: 'object',
      properties: {
        id: { type: 'string', enum: 후보s.map(c => c.id) },
        reason: { type: 'string' }
      },
      required: ['id']
    },
    'lite'
  )

  return 후보s.find(c => c.id === result?.id) ?? 후보s[0]!
}

/**
 * Unsplash API 가이드라인 — 사진을 실제로 "쓰면" download 엔드포인트를 한 번 쳐야 한다.
 * 실패해도 무시한다. 이것 때문에 썸네일 선택이 실패할 이유는 없다.
 */
function 다운로드알림(downloadLocation: string | null, accessKey: string) {
  if (!downloadLocation) return
  void $fetch(downloadLocation, { headers: { Authorization: `Client-ID ${accessKey}` } })
    .catch(() => { })
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const accessKey = config.unsplashAccessKey

  if (!accessKey || accessKey === '1') {
    throw createError({
      statusCode: 500,
      statusMessage: 'UNSPLASH_ACCESS_KEY is not configured'
    })
  }

  const body = await readBody(event)
  const 제목 = String(body?.title ?? '').trim().slice(0, 200)
  const 본문 = 본문요약(body?.body)
  const orientation: i방향 = ORIENTATIONS.includes(body?.orientation)
    ? body.orientation
    : 'landscape'

  if (!제목 && !본문) {
    return { thumbnail: null, reason: '제목과 본문이 모두 비어 있습니다.' }
  }

  try {
    const 검색어s = await 검색어뽑기(제목, 본문)
    if (!검색어s.length) return { thumbnail: null, reason: '검색어를 뽑지 못했습니다.' }

    // 첫 검색어가 빈손이면 다음 것으로 넘어간다 — 구체적인 말일수록 결과가 없을 수 있다.
    let 후보s: i후보[] = []
    let 쓴검색어 = ''
    for (const q of 검색어s) {
      후보s = await unsplash검색(q, accessKey, orientation)
      if (후보s.length) { 쓴검색어 = q; break }
    }
    if (!후보s.length) {
      return { thumbnail: null, reason: `Unsplash 결과 없음 (${검색어s.join(', ')})` }
    }

    const 선택 = await 고르기(제목, 본문, 후보s)
    다운로드알림(선택.downloadLocation, accessKey)

    return {
      thumbnail: 선택.url,
      photoId: 선택.id,
      alt: 선택.설명,
      query: 쓴검색어,
      candidates: 후보s.length,
      credit: 선택.credit
    }
  } catch (error: unknown) {
    throw toAiUpstreamError(error, 'api-etc/ai/pick_thumbnail')
  }
})

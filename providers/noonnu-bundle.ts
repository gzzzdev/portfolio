import { defineFontProvider } from 'unifont'
import type { FontFaceData, ResolveFontResult } from 'unifont'

/**
 * 눈누 jsDelivr 폰트 — `defineFontProvider` + `resolveFont` 반환 형태는 Nuxt Fonts 문서·unifont 타입과 동일하게 유지
 * @see https://fonts.nuxt.com/get-started/providers#custom-providers
 * @see https://github.com/unjs/unifont/blob/main/src/types.ts — ResolveFontResult, FontFaceData
 */

const BASE = {
  a2z: 'https://cdn.jsdelivr.net/gh/projectnoonnu/2601-6@1.0',
  escoredream: 'https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_six@1.2',
  suit: 'https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_suit@1.0',
  jalnan: 'https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_231029@1.1',
  pyeojin: 'https://cdn.jsdelivr.net/gh/projectnoonnu/2504-1@1.0',
  paperozi: 'https://cdn.jsdelivr.net/gh/projectnoonnu/2408-3@1.0'
} as const

const a2zWeightToFile: Record<string, string> = {
  100: '에이투지체-1Thin.woff2',
  200: '에이투지체-2ExtraLight.woff2',
  300: '에이투지체-3Light.woff2',
  400: '에이투지체-4Regular.woff2',
  500: '에이투지체-5Medium.woff2',
  600: '에이투지체-6SemiBold.woff2',
  700: '에이투지체-7Bold.woff2',
  800: '에이투지체-8ExtraBold.woff2',
  900: '에이투지체-9Black.woff2'
}

const escoredreamWeightToFile: Record<string, string> = {
  100: 'S-CoreDream-1Thin.woff',
  200: 'S-CoreDream-2ExtraLight.woff',
  300: 'S-CoreDream-3Light.woff',
  400: 'S-CoreDream-4Regular.woff',
  500: 'S-CoreDream-5Medium.woff',
  600: 'S-CoreDream-6Bold.woff',
  700: 'S-CoreDream-7ExtraBold.woff',
  800: 'S-CoreDream-8Heavy.woff',
  900: 'S-CoreDream-9Black.woff'
}

const suitWeightToFile: Record<string, string> = {
  100: 'SUIT-Thin.woff2',
  200: 'SUIT-ExtraLight.woff2',
  300: 'SUIT-Light.woff2',
  400: 'SUIT-Regular.woff2',
  500: 'SUIT-Medium.woff2',
  600: 'SUIT-SemiBold.woff2',
  700: 'SUIT-Bold.woff2',
  800: 'SUIT-ExtraBold.woff2',
  900: 'SUIT-Heavy.woff2'
}

const paperoziWeightToFile: Record<string, string> = {
  100: 'Paperlogy-1Thin.woff2',
  200: 'Paperlogy-2ExtraLight.woff2',
  300: 'Paperlogy-3Light.woff2',
  400: 'Paperlogy-4Regular.woff2',
  500: 'Paperlogy-5Medium.woff2',
  600: 'Paperlogy-6SemiBold.woff2',
  700: 'Paperlogy-7Bold.woff2',
  800: 'Paperlogy-8ExtraBold.woff2',
  900: 'Paperlogy-9Black.woff2'
}

function pyeojinFile(weightStr: string): string {
  const n = Number(weightStr)
  if (n <= 300)
    return 'PyeojinGothic-Light.woff2'
  if (n <= 500)
    return 'PyeojinGothic-Regular.woff2'
  return 'PyeojinGothic-Bold.woff2'
}

const FALLBACKS: ResolveFontResult['fallbacks'] = ['ui-sans-serif', 'system-ui', 'sans-serif']

function ok(fonts: FontFaceData[]): ResolveFontResult {
  return { fonts, fallbacks: FALLBACKS }
}

export default defineFontProvider('noonnu-bundle', async () => {
  return {
    async resolveFont(fontFamily, options) {
      const fonts: FontFaceData[] = []

      if (fontFamily === 'A2z') {
        for (const w of options.weights) {
          const file = a2zWeightToFile[w]
          if (!file)
            continue
          fonts.push({
            src: [{ url: `${BASE.a2z}/${file}`, format: 'woff2' }],
            weight: Number(w),
            style: 'normal'
          })
        }
        return ok(fonts)
      }

      if (fontFamily === 'Escoredream') {
        for (const w of options.weights) {
          const file = escoredreamWeightToFile[w]
          if (!file)
            continue
          fonts.push({
            src: [{ url: `${BASE.escoredream}/${file}`, format: 'woff' }],
            weight: Number(w),
            style: 'normal'
          })
        }
        return ok(fonts)
      }

      if (fontFamily === 'SUIT') {
        for (const w of options.weights) {
          const file = suitWeightToFile[w]
          if (!file)
            continue
          fonts.push({
            src: [{ url: `${BASE.suit}/${file}`, format: 'woff2' }],
            weight: Number(w),
            style: 'normal'
          })
        }
        return ok(fonts)
      }

      if (fontFamily === 'YeogiOttaeJalnanGothic') {
        fonts.push({
          src: [{ url: `${BASE.jalnan}/JalnanGothic.woff`, format: 'woff' }],
          weight: 400,
          style: 'normal'
        })
        return ok(fonts)
      }

      if (fontFamily === 'PyeojinGothic') {
        for (const w of options.weights) {
          const file = pyeojinFile(w)
          fonts.push({
            src: [{ url: `${BASE.pyeojin}/${file}`, format: 'woff2' }],
            weight: Number(w),
            style: 'normal'
          })
        }
        return ok(fonts)
      }

      if (fontFamily === 'Paperozi') {
        for (const w of options.weights) {
          const file = paperoziWeightToFile[w]
          if (!file)
            continue
          fonts.push({
            src: [{ url: `${BASE.paperozi}/${file}`, format: 'woff2' }],
            weight: Number(w),
            style: 'normal'
          })
        }
        return ok(fonts)
      }

      return undefined
    }
  }
})

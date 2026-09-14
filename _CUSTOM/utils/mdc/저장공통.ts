/**
 * **본문 저장(DOCX·HWPX·PPTX)이 같이 쓰는 것.** 셋 다 브라우저에서만 돈다(`window`·캔버스).
 */

/** 앱 안 경로(`/img/…`)를 파일 밖에서도 열리는 주소로. */
export function 주소(href: string) {
  try {
    return new URL(href, window.location.origin).href
  } catch {
    return href
  }
}

/**
 * **그림을 png 로.** 형식을 가리지 않고 캔버스에 한 번 그려 뽑는다(`docx.ts` 머리말 「그림」).
 * 못 가져오면(CORS·깨진 주소) 던진다 — 받는 쪽이 「[그림: 설명]」 글로 남긴다.
 */
export async function 그림png(src: string): Promise<{ blob: Blob, 폭: number, 높이: number }> {
  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.src = 주소(src)
  await img.decode()
  const 캔버스 = document.createElement('canvas')
  캔버스.width = img.naturalWidth
  캔버스.height = img.naturalHeight
  캔버스.getContext('2d')!.drawImage(img, 0, 0)
  const blob = await new Promise<Blob | null>(r => 캔버스.toBlob(r, 'image/png'))
  if (!blob) throw new Error('png 로 못 바꿈')
  return { blob, 폭: img.naturalWidth, 높이: img.naturalHeight }
}

/** Blob → `data:` 주소. 변환기가 그림을 주소가 아니라 데이터로 받을 때 쓴다(HWPX·PPTX). */
export async function 데이터주소(blob: Blob) {
  const 바이트 = new Uint8Array(await blob.arrayBuffer())
  let 이진 = ''
  for (let i = 0; i < 바이트.length; i += 0x8000) 이진 += String.fromCharCode(...바이트.subarray(i, i + 0x8000))
  return `data:${blob.type || 'image/png'};base64,${btoa(이진)}`
}

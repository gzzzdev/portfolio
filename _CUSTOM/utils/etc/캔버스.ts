/**
 * 브라우저 캔버스 배관.
 *
 * 그림을 픽셀로 펴고 다시 바이트로 굳히는 일만 한다 — **무엇을 그리는지도, 왜 만지는지도 모른다.**
 * 누끼(`누끼.ts`)와 규격크롭(`알파크롭.ts`)이 둘 다 이 네 줄을 필요로 하는데, 정작 둘이 공유하는
 * 로직은 하나도 없다. 그래서 알고리즘을 합치는 대신 배관만 여기로 내렸다.
 *
 * 브라우저에서만 돌아간다. 이 프로젝트엔 sharp·jimp 가 없어 서버는 JPEG 를 디코드하지 못한다.
 */

/** 동일 출처 그림을 canvas 로 읽어온다. 오염되면 `getImageData` 가 던진다 */
export function 그림읽기(url: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => res(img)
    img.onerror = () => rej(new Error('그림을 읽지 못했습니다.'))
    img.src = url
  })
}

/** 그림을 캔버스에 펴고 픽셀을 꺼낸다 */
export async function 펼치기(url: string) {
  const img = await 그림읽기(url)

  const canvas = document.createElement('canvas')
  canvas.width = img.naturalWidth
  canvas.height = img.naturalHeight

  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return null

  ctx.drawImage(img, 0, 0)
  return { canvas, ctx, 픽셀: ctx.getImageData(0, 0, canvas.width, canvas.height) }
}

/**
 * 바이트로 들고 있는 그림을 편다 (누끼를 뜬 뒤 아직 올리지 않은 PNG 등).
 *
 * objectURL 은 `펼치기`가 끝난 뒤에 반드시 되돌려준다 — 후보를 여러 장 돌리는 자리라
 * 안 풀면 고르는 동안 메모리에 그대로 쌓인다.
 */
export async function 블롭펼치기(blob: Blob) {
  const url = URL.createObjectURL(blob)
  try {
    return await 펼치기(url)
  } finally {
    URL.revokeObjectURL(url)
  }
}

/** 캔버스를 PNG 바이트로. PNG 여야 한다 — JPEG 에는 알파가 없어 방금 만든 것을 도로 잃는다 */
export function 캔버스블롭(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise(res => canvas.toBlob(b => res(b), 'image/png'))
}

export function dataURL로(blob: Blob): Promise<string> {
  return new Promise((res, rej) => {
    const fr = new FileReader()
    fr.onload = () => res(String(fr.result))
    fr.onerror = () => rej(new Error('그림을 읽지 못했습니다.'))
    fr.readAsDataURL(blob)
  })
}

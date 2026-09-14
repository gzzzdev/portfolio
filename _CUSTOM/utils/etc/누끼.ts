import { 펼치기, 캔버스블롭, dataURL로 } from './캔버스'

/**
 * 단색 바탕 그림 → 알파 있는 PNG.
 *
 * 두 가지 바탕을 지운다. **어느 쪽이든 바탕을 지시문이 보장한다는 것이 전제다** —
 * 알고리즘이 단순한 대신 입력을 프롬프트로 통제한다.
 *
 * - `do누끼` : 흰 바탕 (도장·엠블럼 같은 표식). 잉크가 어두우니 "흰색에서 멀어진 만큼"이 알파다.
 * - `do누끼크로마` : 초록 바탕 (증명사진). 사람은 흰 셔츠·눈 흰자·이마 하이라이트를 갖고 있어서
 *   밝기로 재면 거기에 구멍이 뚫린다. 밝기가 아니라 **색상**으로 재야 한다.
 *
 * 캔버스 배관(`펼치기`·`캔버스블롭`)은 `캔버스.ts` 것을 쓴다. 규격크롭(`알파크롭.ts`)도 같은 네 줄을
 * 필요로 하는데, 정작 둘이 공유하는 로직은 하나도 없어서 알고리즘이 아니라 배관만 모아 둔 파일이다.
 *
 * 브라우저에서만 할 수 있는 일이다. 이 프로젝트엔 sharp·jimp 가 없어 서버는 JPEG 를 디코드하지
 * 못한다. 원본이 동일 출처(`/uploads/...`)라 canvas 가 오염되지 않는 것이 이 길의 전제다.
 */

/* ------------------------------------------------------------------ */
/* 흰 바탕 (표식)                                                        */
/* ------------------------------------------------------------------ */

/**
 * 흰 바탕 위에 그려진 그림에서 원래의 잉크 색과 알파를 되돌린다.
 *
 * 관찰된 픽셀은 `c = a·잉크 + (1-a)·255` 다. 여기서 알파는 **흰색에서 얼마나 멀어졌는가**이므로
 * `a = 1 - min(r,g,b)/255` 이고, 그걸 알면 잉크 색이 `잉크 = (c - 255(1-a)) / a` 로 풀린다.
 *
 * 이 되돌리기가 없으면 색이 바랜다. 금색(212,175,55)을 그냥 반투명하게만 만들면 흐린 노랑이
 * 되지만, 풀어내면 (200,153,0)에 알파 0.78 이라 흰 종이 위에서 원래 금색으로 되돌아오고
 * **어두운 종이 위에서는 제 색으로 남는다**. 그게 곱하기가 못 하던 바로 그 일이다.
 */
export function 흰바탕키잉(data: Uint8ClampedArray, 문턱: number) {
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]!, g = data[i + 1]!, b = data[i + 2]!
    const a = 1 - Math.min(r, g, b) / 255

    // 거의 흰 픽셀은 통째로 버린다. 남겨 두면 도장 둘레에 옅은 사각형 자국이 보인다
    if (a <= 문턱) {
      data[i + 3] = 0
      continue
    }

    const 흰기여 = 255 * (1 - a)
    data[i] = Math.max(0, Math.min(255, (r - 흰기여) / a))
    data[i + 1] = Math.max(0, Math.min(255, (g - 흰기여) / a))
    data[i + 2] = Math.max(0, Math.min(255, (b - 흰기여) / a))
    data[i + 3] = Math.round(a * 255)
  }
}

/* ------------------------------------------------------------------ */
/* 초록 바탕 (증명사진)                                                */
/* ------------------------------------------------------------------ */

/**
 * 초록기 — **밝기를 빼고 남는 초록의 우세**.
 *
 * 크로마키 배경(#00b140)은 113, 살색(220,180,150)은 -40, 흰 셔츠와 눈 흰자는 0 근처다.
 * 흰바탕키잉이 쓰는 `min(r,g,b)` 와 달리 밝기에 휘둘리지 않아 **밝은 인물 픽셀이 살아남는다**.
 */
function 초록기(r: number, g: number, b: number) {
  return g - Math.max(r, b)
}

/**
 * 실제 바탕색을 읽는다. 모델이 정확히 #00b140 을 주는 일은 없어서(실측 rgb(5,163,75))
 * 문턱을 상수로 박으면 어떤 장은 덜 지워지고 어떤 장은 머리카락까지 먹는다.
 *
 * **네 귀의 평균을 쓰면 안 된다.** 증명사진은 머리와 어깨를 담는 구도라 아래 두 귀가
 * 배경이 아니라 **옷**이다. 실측(896×1200 한 장): 위 두 귀는 초록기 88·83 인데 아래 두 귀는
 * 어깨의 남색이라 -9·-8 이고, 넷을 평균하면 38.5 가 나온다. 아래 `do누끼크로마` 의 방어선이
 * 40 이라 **간발의 차로 "초록이 아니다"로 판정돼 누끼가 통째로 건너뛰어졌다** — 초록 배경이
 * 그대로 저장된 사진이 그것이다.
 *
 * 그래서 평균이 아니라 **테두리를 한 바퀴 돌며 블록을 뜨고 그중 가장 초록인 1/4만 쓴다**.
 * 인물이 어디에 걸쳐 있든 배경이 남아 있는 쪽이 위로 올라오고, 배경이 아예 초록이 아니면
 * 가장 초록인 블록조차 0 근처라 방어선이 그대로 작동한다.
 */
function 키색추정(data: Uint8ClampedArray, w: number, h: number): [number, number, number] {
  const 변 = Math.max(4, Math.round(Math.min(w, h) * 0.04))
  const 블록s: [number, number, number][] = []

  const 뜨기 = (x0: number, y0: number) => {
    const x1 = Math.min(w, x0 + 변)
    const y1 = Math.min(h, y0 + 변)
    let sr = 0, sg = 0, sb = 0, n = 0
    for (let y = Math.max(0, y0); y < y1; y++) {
      for (let x = Math.max(0, x0); x < x1; x++) {
        const i = (y * w + x) * 4
        sr += data[i]!
        sg += data[i + 1]!
        sb += data[i + 2]!
        n++
      }
    }
    if (n > 0) 블록s.push([sr / n, sg / n, sb / n])
  }

  for (let x = 0; x < w; x += 변) {
    뜨기(x, 0)
    뜨기(x, h - 변)
  }
  for (let y = 변; y < h - 변; y += 변) {
    뜨기(0, y)
    뜨기(w - 변, y)
  }

  블록s.sort((a, b) => 초록기(b[0], b[1], b[2]) - 초록기(a[0], a[1], a[2]))
  const 뽑을수 = Math.max(1, Math.round(블록s.length / 4))

  let sr = 0, sg = 0, sb = 0
  for (let i = 0; i < 뽑을수; i++) {
    sr += 블록s[i]![0]
    sg += 블록s[i]![1]
    sb += 블록s[i]![2]
  }
  return [sr / 뽑을수, sg / 뽑을수, sb / 뽑을수]
}

/**
 * 초록 바탕을 걷어내고 알파를 만든다. 지운 자리 밖에서도 **초록 물이 빠진다**.
 *
 * 문턱을 절대값이 아니라 **추정한 바탕의 초록기에 대한 비율**로 잡는 이유가 키색추정에 적혀 있다.
 * 두 문턱 사이를 선형으로 이어 머리카락 가장자리에 반투명 띠를 남긴다 — 한 문턱으로 자르면
 * 계단이 보이고, 인물 둘레에 초록 테두리가 1px 남는다.
 *
 * 반투명 픽셀은 `c = a·인물 + (1-a)·바탕` 이므로 흰바탕키잉과 똑같이 **되돌린다**. 이게 없으면
 * 머리카락 둘레가 초록으로 물든 채 남아서, 어두운 종이 위에 올리는 순간 형광 윤곽선이 된다.
 *
 * 마지막 스필 억제(`g > max(r,b)` 면 눌러 준다)는 불투명한 자리에 쓴다 — 그린스크린 촬영은
 * 바탕의 반사광이 뺨과 어깨에 초록을 얹는데, 지시문으로는 못 막고 여기서만 걷힌다.
 * 초록 옷을 입으면 같이 죽으므로 지시문이 초록 옷을 금지한다.
 */
export function 크로마키잉(
  data: Uint8ClampedArray,
  키색: [number, number, number],
  상비: number,
  하비: number
) {
  const [kr, kg, kb] = 키색
  const 키초록 = 초록기(kr, kg, kb)
  const 상문턱 = 키초록 * 상비
  const 하문턱 = 키초록 * 하비
  const 폭 = Math.max(1, 상문턱 - 하문턱)

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]!, g = data[i + 1]!, b = data[i + 2]!
    const 초록 = 초록기(r, g, b)

    const a = 초록 >= 상문턱
      ? 0
      : 초록 <= 하문턱
        ? 1
        : 1 - (초록 - 하문턱) / 폭

    if (a <= 0) {
      // 색까지 지운다. 남겨 두면 축소·확대에서 이 초록이 가장자리로 번져 나온다
      data[i] = 0
      data[i + 1] = 0
      data[i + 2] = 0
      data[i + 3] = 0
      continue
    }

    let nr = r, ng = g, nb = b
    if (a < 1) {
      const 바탕기여 = 1 - a
      nr = (r - kr * 바탕기여) / a
      ng = (g - kg * 바탕기여) / a
      nb = (b - kb * 바탕기여) / a
    }

    nr = Math.max(0, Math.min(255, nr))
    ng = Math.max(0, Math.min(255, ng))
    nb = Math.max(0, Math.min(255, nb))

    const 상한 = Math.max(nr, nb)
    if (ng > 상한) ng = 상한

    data[i] = nr
    data[i + 1] = ng
    data[i + 2] = nb
    data[i + 3] = Math.round(a * 255)
  }
}

/* ------------------------------------------------------------------ */
/* 저장                                                                */
/* ------------------------------------------------------------------ */

/**
 * 브라우저가 만든 그림 한 장을 저장하고 링크를 돌려받는다.
 *
 * data URI 를 그대로 문서에 넣지 않는 이유는 크기다. 1024px PNG 는 ~1MB 이고, 그게 문서와
 * `assets.json` 양쪽에 박힌다. lowdb 는 요청마다 테이블을 통째로 읽으므로 곧 느려진다.
 *
 * **누끼와 따로 떨어져 있어야 한다.** 후보를 여러 장 미리보기로 키잉해 놓고 고른 한 장만
 * 올리려면, 계산(`do누끼크로마블롭`)과 업로드가 다른 순간에 일어나야 하기 때문이다.
 */
export async function do이미지저장(blob: Blob, dir = 'ai'): Promise<string | null> {
  const dataUrl = await dataURL로(blob)

  const res = await $fetch<{ url?: string }>('/api-etc/save_img', {
    method: 'POST',
    body: { dataUrl, dir }
  })
  return res?.url ?? null
}

/** 알파를 얹은 캔버스를 저장하고 링크를 돌려받는다 */
async function 저장(canvas: HTMLCanvasElement, dir: string) {
  const blob = await 캔버스블롭(canvas)
  return blob ? await do이미지저장(blob, dir) : null
}

/**
 * 흰 바탕 누끼를 떠서 저장하고 **새 링크**를 돌려준다. 실패하면 null — 부르는 쪽은 원본을 그대로 쓰면 된다.
 *
 * @param 문턱 이 값 이하의 알파는 완전 투명으로 버린다 (0~1)
 * @param dir 저장 폴더 (`uploads/ai/<dir>`). 무엇을 뗀 그림인지는 부르는 쪽만 안다
 */
export async function do누끼(url: string, 문턱 = 0.06, dir = 'ai'): Promise<string | null> {
  try {
    const 판 = await 펼치기(url)
    if (!판) return null

    흰바탕키잉(판.픽셀.data, 문턱)
    판.ctx.putImageData(판.픽셀, 0, 0)
    return await 저장(판.canvas, dir)
  } catch (e) {
    console.error('[누끼] 실패 — 원본을 그대로 씁니다', e)
    return null
  }
}

/**
 * 초록 바탕 누끼를 떠서 **PNG 바이트로만** 돌려준다. 저장하지 않는다.
 *
 * 고르기 화면이 후보를 전부 이 함수로 키잉해 미리 보여주고, 사람이 고른 한 장만
 * `do이미지저장`으로 올린다. 그래서 서버에 남는 파일 수는 예전(고른 뒤 키잉)과 같은데,
 * **누끼가 망가진 장을 확정 전에 버릴 수 있다** — 후보를 두 장 뽑는 이유와 같은 이야기다.
 *
 * **바탕이 초록이 아니면 아무것도 하지 않고 물러난다.** 모델이 지시문을 무시하고 회색이나
 * 실내를 그려 주는 일이 있는데, 그때 억지로 키잉하면 얼굴에 구멍이 뚫린 사진이 된다.
 * 지워지지 않은 배경은 눈에 보이고 다시 뽑으면 그만이지만, 망가진 얼굴은 되돌릴 수가 없다.
 *
 * @param 상비 이 비율(추정 바탕의 초록기 대비) 이상은 완전 투명
 * @param 하비 이 비율 이하는 완전 불투명
 */
export async function do누끼크로마블롭(url: string, 상비 = 0.55, 하비 = 0.12): Promise<Blob | null> {
  try {
    const 판 = await 펼치기(url)
    if (!판) return null

    const 키색 = 키색추정(판.픽셀.data, 판.canvas.width, 판.canvas.height)
    if (초록기(...키색) < 40) {
      console.warn('[누끼] 바탕이 초록이 아닙니다 — 건드리지 않습니다', 키색)
      return null
    }

    크로마키잉(판.픽셀.data, 키색, 상비, 하비)
    판.ctx.putImageData(판.픽셀, 0, 0)
    return await 캔버스블롭(판.canvas)
  } catch (e) {
    console.error('[누끼] 실패 — 원본을 그대로 씁니다', e)
    return null
  }
}

/**
 * 초록 바탕 누끼를 떠서 저장하고 **새 링크**를 돌려준다. 실패하면 null 이고 부르는 쪽은 원본을 쓴다.
 *
 * 고른 뒤에 한 장만 처리하는 자리를 위한 편의 함수다 — 미리보기가 필요하면
 * `do누끼크로마블롭` + `do이미지저장`으로 나눠 쓴다.
 */
export async function do누끼크로마(url: string, 상비 = 0.55, 하비 = 0.12, dir = 'ai'): Promise<string | null> {
  const blob = await do누끼크로마블롭(url, 상비, 하비)
  return blob ? await do이미지저장(blob, dir) : null
}

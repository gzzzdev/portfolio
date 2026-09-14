/**
 * 배경·표식을 **AI로 뽑을 때** 쓰는 지시문과 원형 목록.
 *
 * 모델(`~models/test2/designs/디자인틀`)에 두지 않는다. 여기 있는 것은 저장되는 값이 아니라
 * 그 값을 만들어 내는 **문장**이고, 문장은 편집기가 '다시 뽑기'를 누를 때만 쓰인다.
 * 디자인틀 한 벌을 종이에 앉히는 데는 이 파일이 하나도 필요 없다.
 */

import { is쓸수있는비율 } from '~models/test2'
import type { i규격, i배경, i용도 } from '~models/test2'

/**
 * gen_img(`server/routes/api-etc/ai/gen_img.ts`)가 받는 프레임 비율. 상류의 하드 enum 이라
 * 여기 없는 값은 400 이다 — 실물 규격이 이 중 하나로 딱 떨어지지 않는 것이 문제의 출발점이다.
 * A4(1:1.414)는 2:3 과 3:4 의 **정확히 가운데**라(1.333 × 1.5 = 2 = √2²) 어느 쪽을 골라도 5.7% 가 남는다.
 */
const 생성비율s = {
  '1:1': 1, '1:4': 1 / 4, '1:8': 1 / 8, '2:3': 2 / 3, '3:2': 3 / 2, '3:4': 3 / 4,
  '4:1': 4, '4:3': 4 / 3, '4:5': 4 / 5, '5:4': 5 / 4, '8:1': 8,
  '9:16': 9 / 16, '16:9': 16 / 9, '21:9': 21 / 9
} as const

/**
 * 그중 문서 규격에 가장 가까운 것. 문서가 297×210 인데 16:9 배경을 받으면 위아래가 잘리거나 늘어난다.
 *
 * **로그 거리**로 고른다. 선형 차이는 1 보다 큰 쪽(16:9 = 1.78)의 어긋남을 작은 쪽(9:16 = 0.56)보다
 * 크게 세어서, 같은 비율만큼 빗나가도 가로 규격과 세로 규격의 판정이 달라진다.
 */
export function 근사비율(규격: i규격): string {
  const 목표 = 규격.폭mm / 규격.높이mm
  return Object.entries(생성비율s)
    .sort((a, b) => Math.abs(Math.log(a[1] / 목표)) - Math.abs(Math.log(b[1] / 목표)))[0]![0]
}

/**
 * 이 배경이 지금 규격과 어긋나는가.
 *
 * **임계는 모델이 갖는다**(`is쓸수있는비율`). 여기서 따로 숫자를 들면 보관 목록의 필터와
 * 갈라져서, **목록에는 뜨는데 얹으면 낡았다고 하는 그림**이 생긴다. 같은 질문의 반대말이므로
 * 같은 함수를 부정해서 쓴다.
 *
 * 비율을 모르는 그림(`null`)은 어긋났다고 하지 않는다 — 밖에서 받은 그림일 수 있고,
 * 모르는 것을 틀렸다고 말하면 사용자가 지울 이유가 없는 그림을 지운다.
 */
export function 배경낡음(배경: i배경, 규격: i규격): boolean {
  if (!배경.url) return false
  return !is쓸수있는비율(배경.비율, 규격.폭mm / 규격.높이mm)
}

/**
 * 표식 생성용 지시문. **모든 표식이 함께 지켜야 하는 것만 적는다.**
 *
 * 한때 여기에 형식까지 다 있었다 — 첫 줄이 `A seal stamp impression` 이었고 본문이
 * `Centered` · `symmetric` · `uneven ink, like a real hand-pressed chop` 을 못 박았다.
 * 그래서 원형 목록에 `금박 리본` 을 적어 둬도 나오는 건 리본 무늬가 새겨진 **도장**이었다.
 * 지시문이 주제보다 뒤에 붙어 이기기 때문인데, 이건 문구를 다듬어서 될 일이 아니었다 —
 * 정중앙에 앉은 대칭 도장과 모서리를 가로지르는 리본은 **같은 형식 문장을 공유할 수 없다.**
 *
 * 그래서 형식(어떤 꼴로, 프레임 어디에)은 원형(`표식원형s`)이 각자 든다. 여기 남은 것은
 * 형식이 무엇이든 안 바뀌는 셋뿐이다:
 *
 *   1. **흰 바탕** — 그걸 키잉해서 지우기 때문이다(`do누끼`). 회색 헤일로나 드리운 그림자가
 *      남으면 지워지지 않고 얼룩으로 남으므로 지시문이 그것까지 금지한다. 왁스의 **자기 음영**은
 *      막지 않는다 — 금지하는 건 바탕에 드리우는 그림자(cast shadow)지 물체 안의 명암이 아니다.
 *   2. **평면 정면** — 얹히는 자리가 종이 위 사각형 하나라 원근이 있으면 떠 보인다.
 *      기울기 자체를 막지는 않는다: 모서리 리본은 45도가 그림 안에 이미 들어 있어야 한다
 *      (`표식회전한계` 가 30이라 얹은 뒤에 45도로 돌릴 수는 없다).
 *   3. **300dpi 실선 · 글자 금지** — 인쇄 해상도와, 글자는 글자 레이어가 진다는 분담.
 *
 * gen_img 의 스타일 프리셋(실사·라인아트·카드배경)에는 이런 것이 없다. 새 프리셋을 서버에 늘리면
 * 그 라우트가 도메인 카탈로그가 되므로, 라우트가 열어둔 `stylePrompt` 통로로 여기서 넘긴다.
 * **색도 여기서 정하지 않는다.** 예전엔 첫 줄이 "A traditional **red** seal"이었고 본문도
 * "Vermilion red ink"를 못 박고 있어서, 사용자가 주제에 "황금"이라고 써도 지시문이 이겼다.
 * 색은 주제의 것이다 — 형식을 내린 지금은 꼴도 마찬가지다.
 */
export const 표식지시문 = `A single graphic mark, isolated on a pure white background.

**The Subject line below decides the form, the placement, the motif and the colour — follow it.**
Only if it names no colour at all, fall back to traditional vermilion red.
Never override a shape, a position or a colour that the subject asked for.

The mark fills the frame — it is not a small object floating in a large white field.
If the subject says where in the frame it sits, put it exactly there; otherwise centre it.
Shot square-on and lit flat, as if scanned on a flatbed: no perspective, no vignette,
and no shadow cast onto the background (relief and folds may still shade themselves).
This is printed onto a certificate at 300dpi, so the mark must be SHARP, and its detail must be
real line work — engraved hairlines, pleats, cut edges, ink grain — not a soft blurred shape.
The background must be pure flat white (#ffffff): every pixel outside the mark is white, with no
grey halo and no drop shadow. The white is keyed out afterwards, so anything grey survives as a smudge.
Ornament and abstract shapes only — NO text, letters, numbers, Hangul, Hanja or Kanji of any kind.`

/**
 * 표식 원형 하나 — "어떤 표식인가". 배경의 `i배경원형` 과 같은 몫이고 같은 규칙을 따른다:
 * 칩은 설정이 아니라 **문장 삽입기**이고, 칸에 든 문장이 곧 서버로 가는 문장이다.
 *
 * **형식을 이 문장이 든다는 것이 이 타입의 전부다.** 형식을 숨은 필드로 따로 두는 길도 있었지만
 * (칩마다 `형식` 을 달고 지시문에 끼워 보내는), 그러면 사용자가 칸의 문장을 한 글자라도 고치는
 * 순간 어느 칩이 켜져 있었는지 근거가 사라져 형식이 조용히 기본값으로 되돌아간다. 보이는
 * 문장과 나가는 문장이 갈리는 셈이라, 원형이 도장에서 못 벗어나던 것과 같은 종류의 고장이다.
 * 형식까지 문장 안에 있으면 고치는 사람이 꼴도 같이 고칠 수 있고, 보이는 것이 곧 나가는 것이다.
 *
 * 배경에만 있고 여기엔 없었다. 그동안 도장은 범용 생성기(`Input사진3Generate`)에 얹혀 있었는데,
 * 그 컴포넌트는 자기 안에 프롬프트 칸을 들고 있어서 **사용자가 친 문장이 `i표식.묘사` 에 닿지
 * 않았다** — 보관함에도 묘사 없이 쌓였고, 그래서 도장만은 "같은 결로 다시 뽑기"가 안 됐다.
 * 배경이 원형·묘사·보관을 다 갖춘 채로 굴러가는 동안 도장은 매번 맨손이었던 셈이다.
 */
export interface i표식원형 {
  key: string
  /** 칩에 보이는 이름 */
  이름: string
  묘사: string
}

/**
 * 표식 원형 목록. **영문으로 적는다** — 배경과 같은 이유다(`배경원형s` 머리말).
 * `stylePrompt` 가 붙는 경로는 한글을 영어로 옮기는 1단계를 건너뛰므로, 한글로 적으면
 * 영문 지시문 끝에 한글 한 줄이 그대로 붙어 나간다.
 *
 * 각 문장이 말하는 것은 넷이다 — **꼴 · 자리 · 획 · 색**. 앞의 둘이 형식이고, 그게 여기 있어야
 * 하는 이유는 `표식지시문` 머리말에 있다. 지시문이 이미 못 박은 것(흰 바탕 · 평면 정면 ·
 * 글자 금지)은 되풀이하지 않는다.
 *
 * **자리를 말하는 것은 지금 모서리 리본뿐이다.** 나머지는 `centred in the frame` 이라 적는데,
 * 지시문의 기본값과 같은 말이라 없어도 그림은 같다. 그래도 적는 이유는 이 목록이 형식을 드는
 * 자리가 됐기 때문이다 — 한 줄만 자리를 말하고 나머지가 침묵하면, 다음에 문장을 고치는 사람이
 * 자리를 적어도 되는지를 목록에서 읽을 수 없다.
 *
 * 가운데 옅게 깔리는 로고는 **여기서 옅게 만들지 않는다.** 진하게 뽑아 두고 `i표식.불투명도` 를
 * 내려서 쓴다 — 흐린 그림을 받으면 누끼가 그 회색을 얼룩으로 남기고, 한 번 옅어진 그림은
 * 다시 진해지지 않는다.
 */
export const 표식원형s: i표식원형[] = [
  {
    key: '중앙로고',
    이름: '중앙 로고',
    묘사: `A single flat emblem centred in the frame: one bold silhouette — a shield, a laurel ring or an interlocking monogram shape — drawn with clean even-width strokes.
Flat solid ink with no gradient, no relief and no lighting, so it stays readable when laid faintly over paper.
One dark ink colour — charcoal or deep navy.`
  },
  {
    key: '모서리리본',
    이름: '모서리 리본',
    묘사: `A ribbon banner running diagonally across the TOP-RIGHT corner of the frame at 45 degrees, both of its cut ends reaching the very edges of the frame; the rest of the frame is empty white.
A folded fabric sash, a small V notch cut into each end, one narrow keyline running along its length.
Deep crimson with a thin gold keyline.`
  },
  {
    key: '금장엠블럼',
    이름: '금장 엠블럼',
    묘사: `A round medallion centred in the frame: a rosette of narrow pointed petals inside a beaded ring, closed by two concentric hairline circles, radially symmetric.
Engraved line work only — fine parallel burin lines, no solid fill.
Antique gold and pale bronze, matte, no gloss.`
  },
  {
    key: '기요셰',
    이름: '기요셰 로제트',
    묘사: `A banknote guilloche rosette centred in the frame: hundreds of hairlines woven into one symmetric spirograph star, radially perfect.
Lines extremely thin and evenly spaced, white showing through between them.
A single dark ink — deep green or navy.`
  },
  {
    key: '인장',
    이름: '전통 인장',
    묘사: `A square hand-pressed chop centred in the frame: a dense abstract lattice of thick strokes inside a heavy square frame.
The ink coverage is slightly uneven where the stone lifted, and the frame is worn at the corners.
Vermilion red cinnabar paste.`
  },
  {
    key: '왁스',
    이름: '봉인 왁스',
    묘사: `A blob of sealing wax centred in the frame, pressed with a die: thick irregular edges, a symmetric star-and-scroll impression sunk into the middle.
The relief catches a little light on its raised edges and darkens in the sunk parts.
Deep burgundy wax.`
  },
  {
    key: '리본로제트',
    이름: '리본 로제트',
    묘사: `An award rosette centred in the frame: a pleated foil starburst with two ribbon tails hanging straight down below it.
Sharp radial pleats, each fold catching light along a narrow line.
Champagne gold foil, not yellow gold.`
  }
]

/**
 * 배경 지시문의 고정 부분 — **이 그림은 아무것도 인쇄되지 않은 종이다.**
 *
 * 한때 이 문장이 "종이의 표면 — 재질과 그 문양"이라고 적었고, 그 `ornament` 한 단어 때문에
 * 여기부터 원형·구도지시까지 전부가 **테두리를 그리는 지시문**이 됐다. 네 판본을 뽑았고 넷 다
 * 무료 상장 템플릿이 나왔다(실측 2026-09-01). 어휘를 아무리 갈아도(장식 → 필리그리 → 기요셰)
 * 결과가 그 자리를 못 벗어난 이유는, 애초에 **틀린 것을 그리라고 시키고 있었기 때문**이다.
 *
 * 실물을 보고 왔다. 하버드 졸업장은 두꺼운 코튼 양피지 한 장에 크림슨 인장 하나가 전부고,
 * 장식 테두리가 없다. 디플로마 디자인 해설도 `avoid excessive decoration` ·
 * `generous white space` 라고 적는다. 요즘 자격증(Google·AWS)은 더해서, 여백과 로고와
 * 악센트 선 하나다. **진짜 증서에서 배경은 그냥 종이고, 디자인은 인장과 글자가 진다.**
 *
 * 그 둘은 이 편집기에서 이미 딴 레이어다(`i표식` · `i글자`). 그러니 배경이 할 일은 남지 않는다 —
 * 종이가 되는 것 말고는. 이 지시문이 이제 **문양 자체를 금지**하는 이유이고,
 * 원형(`배경원형s`)이 문서가 아니라 **지질** 목록인 이유다.
 *
 * **`border`·`frame` 을 금지 목록에 넣는다.** 예전 주석은 이걸 경계했다 — 그 단어를 금지하면
 * 기요셰 띠까지 통째로 물러선다고. 지금은 그게 **의도**다. 물러서야 하는 게 그것이다.
 *
 * **full-bleed 를 세 번 말하는 이유**(실측): "flat, straight-on scan of a BLANK sheet" 로
 * 시작하면 모델이 `sheet` 를 장면 속 사물로 읽어 **책상 위에 놓인 종이 사진**을 준다.
 * 갈색 바닥과 종이 모서리, 옅은 그림자까지 딸려 온다. 그래서 첫 줄을 표면으로 말하고,
 * 종이가 프레임 밖으로 이어진다고 따로 못 박고, 금지 목록에서 다시 말한다.
 *
 * **치수는 넣지 않는다.** 비율은 API 가 나른다(`frameRatio` → 빈 캔버스). `mm`·`trim` 같은
 * 토큰은 학습 데이터에서 재단선 도판과 붙어 있어서, 넣으면 그걸 그려 넣는다.
 */
const 공통제약 = `A FULL-BLEED, edge-to-edge image of the SURFACE TEXTURE of fine printing stock, filling the whole frame — a flatbed scan of the blank material itself, close enough that its grain, fibre and tone are the subject of the picture. The "Subject" line below describes that stock.

The image IS the sheet's own surface. It is not a photograph of a sheet lying on something. The stock runs past all four edges of the frame and is cropped by them.

Render that material fully and visibly: its colour and the way that colour drifts across the sheet, its tooth and grain, the fibres and flecks caught in it, and how flat light sits on it. This texture is the whole content of the picture, and it must be present everywhere, edge to edge — never a flat fill of one colour.

Absolute rules:
- The sheet is BLANK. Nothing is printed on it: no text, letters, numbers, words, logos or signatures — and no printed decoration either: no border, frame, rule, line along any edge, corner motif, scrollwork, filigree, guilloche or medallion. Everything you draw is a property of the material, never ink laid onto it.
- This includes DECORATIVE writing: no calligraphy, no brushwork characters, no seal script, no stamps or chops with characters, no engraved or carved inscriptions, no Hanja / Chinese characters / Kanji / Hangul / Japanese / Arabic script, no runes, no faux or unreadable glyphs.
- NO sheet edge is visible. Do NOT show the outline or corner of a piece of paper, and do NOT show any surface behind or beneath it — no desk, no table, no mat, no cloth, no coloured margin, no shadow cast by the sheet.
- NO people, NO objects, NO illustration subject, no hands, no props. The material and its own texture only.
- Shot square-on and lit flat, as if scanned on a flatbed. No perspective, no curled corners, no vignette, no glare.`

/**
 * 용도별 지시 — **가독성 제약 하나뿐이다.**
 *
 * 한때 이 자리가 테두리를 지시했다: 띠의 깊이, 코너 처리, 연속성, 그 다음엔 폭 상한과 밀도.
 * 고칠수록 길어졌고 프롬프트에 목소리가 둘이 됐다 — 원형은 무엇을 그릴지 말하는데 이쪽은
 * 그걸 얼마나 그리지 말지 말하고 있었다. 배경이 종이만 그리게 되면서 그 몫이 통째로 사라졌다.
 *
 * 남은 것은 **"글자가 어디에 얹히니 거기를 비워라"** 다. 이것만이 용도마다 진짜로 다르고,
 * 이것만이 원형이 알 수 없는 사실이다 — 지질은 이 종이가 무엇에 쓰일지 모른다.
 *
 * 증서는 종이 전체에 글이 앉으므로 사실상 "전면이 고르게" 가 된다. 포스터는 큰 글자가
 * 아무 데나 떨어지니 국소 대비만 낮으면 되고 어두운 바탕도 허용된다. 명함은 진한 단색 한 판이
 * 기본이다. 세 줄이 서로 부딪치므로 하나로 합칠 수 없다(합치면 증서 규칙으로 수렴한다).
 */
const 구도지시: Record<i용도, string> = {
  등급증: `Text and a seal will be printed across this whole sheet, so the stock must read EVENLY from edge to edge: one calm, pale, low-contrast surface with no area that draws the eye, no darker margin, no tonal gradient from edge to middle. Any character it has is the fine, uniform grain of the material itself.`,

  행사포스터: `Large display type will be printed across the whole sheet, so keep transitions smooth and LOCAL contrast low everywhere; a dark overall ground is fine, an abrupt light-to-dark edge across the middle is not. No single focal point and no bright specular highlight.`,

  명함: `The sheet is small and mostly covered by type, so a single flat, evenly inked ground is the norm: deep, near-black or fully saturated stock (ink black, midnight navy, oxblood, forest) is expected here, not avoided. Letterpress bite or embossing may catch light, but the ground itself stays matte and even.`,

  /*
   * 회원증은 배경 그림을 거의 쓰지 않는다 — 카드 윗단은 색판(`i표식.채움`)이 덮고 아랫단은
   * 글자가 앉는 흰 면이다. 그래도 뽑을 수 있어야 하니 지시는 둔다: 색판 아래로 비치는
   * 카드 바탕이라 **밝고 아무 일도 일어나지 않는 면**이 옳다.
   */
  회원증: `Most of this card is covered by a flat colour panel and by type, so the stock underneath must be quiet and PALE: an even, bright surface with no pattern, no focal point and no tonal drift. Any character it has is the faint grain of laminated card stock.`
}

/** 용도 이름을 프롬프트에 쓰는 영문 한 마디로. 한글을 그대로 넣으면 이 줄만 언어가 튄다 */
const 용도영문: Record<i용도, string> = {
  등급증: 'certificate',
  행사포스터: 'event poster',
  명함: 'business card',
  회원증: 'membership card'
}

/**
 * 이 문서의 배경 지시문 — 공통 제약 + 그 용도의 구도.
 *
 * 규격이 기여하는 것은 **방향 한 단어**뿐이다. 크롭 내성은 숫자가 아니라 구도로 요구한다.
 * (남는 오차를 화면에서 처리하는 `i배경.맞춤` 은 그래도 마지막 수단으로 남는다)
 */
export function 배경지시문(규격: i규격, 용도: i용도): string {
  const 비 = 규격.폭mm / 규격.높이mm
  const 방향 = 비 > 1.02 ? 'landscape' : 비 < 0.98 ? 'portrait' : 'square'

  return `${공통제약}

Composition — this is the background of a ${방향} ${용도영문[용도]}:
${구도지시[용도]}`
}

/**
 * 배경 원형 하나 — "어떤 문서의 종이인가".
 *
 * `묘사` 는 설정값이 아니라 **입력창에 그대로 박히는 문장**이다. 칩은 그 문장을 넣어 줄 뿐이고,
 * 사용자는 뒤에 덧붙이거나 통째로 고칠 수 있다. 그래서 화면에 보이는 문장이 곧 서버로 가는
 * 문장이고, 저장된 `i배경.묘사` 하나가 "왜 이 그림인지"와 "같은 결로 다시 뽑기"를 둘 다 댄다.
 * (칩 선택 상태를 따로 들면 사용자가 문장을 고친 순간 그 상태가 거짓말을 시작한다)
 */
export interface i배경원형 {
  key: string
  /** 칩에 보이는 이름 */
  이름: string
  묘사: string
}

/**
 * 지질 목록. **문서가 아니라 종이다.**
 *
 * 예전엔 이 목록이 문서였다 — `금장 인증서` · `아이비리그 이수증` · `호그와트 입학허가서`.
 * 각 항목이 `Stock / Ornament / Tone` 세 줄로 지질과 **문양**을 같이 댔고, 그 `Ornament` 줄이
 * 네 판본을 내리 상장 템플릿으로 만들었다(`공통제약` 머리말). 실물 증서에는 그 줄에 해당하는
 * 것이 없다 — 하버드 졸업장은 코튼 양피지 한 장에 인장 하나이고, 요즘 자격증은 여백과 로고다.
 * 그래서 문양 줄을 지웠고, 지우고 나니 남은 축이 **종이 한 가지**였다. 목록의 정체가 그것이다.
 *
 * 문서 이름으로 부르지 않는 이유: 한 지질이 여러 문서에 쓰인다. 아이보리 레이드지는 졸업장도
 * 되고 초대장도 된다. 문서 이름을 달아 두면 그 종이가 그 문서 전용인 것처럼 보이고, 실제로
 * 예전 목록은 `아이비리그 이수증` 을 명함에 못 쓰게 만들고 있었다.
 *
 * **두 줄로 적는다.** 지질(`Stock`)과 빛(`Light`)뿐이다 — 인쇄된 것이 하나도 없으니 색·문양·
 * 대비를 따로 말할 것이 없고, 종이가 무엇이고 빛이 어떻게 앉는지가 곧 그림의 전부다.
 *
 * **영문으로 적는다.** 이 문장은 `Subject:` 로 지시문 뒤에 붙어 그림을 정하는 유일한 내용인데
 * (`gen_img.ts`), `stylePrompt` 가 오면 `skipScene` 이 서서 **번역 단계를 타지 않는다.**
 * 화면에 보이는 문장이 곧 서버로 가는 문장이라는 규칙은 그대로고(사용자가 고칠 수 있다),
 * 대신 시작 문장을 영문으로 둬서 언어가 섞이지 않게 한다.
 */
export const 배경원형s: i배경원형[] = [
  {
    key: '코튼양피지',
    이름: '코튼 양피지',
    묘사: `Stock: heavy cream cotton rag, made to feel like parchment. A fine irregular tooth runs over the whole surface, short pale fibres are pressed into it here and there, and the tone drifts in faint clouds from where the pulp settled unevenly.
Light: flat and diffuse over the whole frame, raking just enough that the tooth and the fibres stay visible as texture.`
  },
  {
    key: '아이보리레이드',
    이름: '아이보리 레이드지',
    묘사: `Stock: stiff ivory laid paper. Fine chain and laid lines pass through it at even intervals, fibre flecks sit scattered between them, and the sheet is a shade paler where the lines press through.
Light: flat and diffuse; the laid lines read only as a faint change in tone, never as printed stripes.`
  },
  {
    key: '백지',
    이름: '매끈한 백지',
    묘사: `Stock: bright smooth uncoated white paper. Very little tooth, but the surface is not perfectly flat — a fine even grain runs across it and the white drifts a touch cooler in places.
Light: flat and even, catching just enough of the grain that the sheet does not read as a blank fill.`
  },
  {
    key: '고지',
    이름: '오래된 양피지',
    묘사: `Stock: aged parchment. Uneven skin grain and fine follicle pitting cover it, the thickness varies from place to place, and pale tide rings and faint foxing spots have been left by age.
Light: flat and diffuse; warm tan paling toward buff, low saturation, no sheen.`
  },
  {
    key: '한지',
    이름: '한지',
    묘사: `Stock: thick Korean hanji with mulberry fibre showing through it. Horizontal mould lines from the papermaking screen pass at even intervals, and knots of fibre sit in the sheet as small raised flecks.
Light: flat and diffuse; buff fading gently to ochre, matte, weak contrast.`
  },
  {
    key: '흑지',
    이름: '먹빛 카드지',
    묘사: `Stock: black card stock with a linen weave pressed tightly into it, fully matte, returning almost no light. The weave shows as a fine even grain and the black is a shade warmer where it catches.
Light: flat and even, the weave reading as texture across a near-black ground.`
  }
]

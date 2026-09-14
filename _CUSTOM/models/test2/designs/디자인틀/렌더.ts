/**
 * 디자인틀 한 벌 + 값 → `RenderItem` 트리. **디자인틀이 종이로 나가는 유일한 길이다.**
 *
 * 여기가 생기기 전까지 디자인틀에는 실값 층이 없었다 — 화면에 뜨는 글자가 곧 종이에 나가는
 * 글자였고(`types.ts` 머리말), 회원 카드 출력에 물려 있는 것은 좌표를 코드로 든 쪽
 * (`renders/`)이었다. 이 파일이 그 자리를 넘겨받는다.
 *
 * **좌표 계산을 새로 하지 않는다.** 캔버스와 같은 `스타일.ts` 를 부른다 — 두 벌로 두면
 * 화면과 종이가 갈라지고, 그러면 사람이 화면을 보고 짠 배치가 거짓이 된다.
 *
 * 나가는 트리는 `View렌더` 가 읽는 모양이라 기존 인쇄·PNG 파이프(`useModalRender` 의
 * `printBuild` / `printWidth`)를 그대로 탄다. 새 캡처 경로를 만들지 않는다.
 */

import { renderComps, type RenderItem } from '~/components/view/렌더/renderComps'
import { 글자스타일, rect스타일, 배경스타일, 표식그림스타일, 표식스타일 } from './스타일'
import type { i규격, i면, i틀 } from './types'

/* ------------------------------------------------------------------ */
/* 주입                                                                */
/* ------------------------------------------------------------------ */

/**
 * 표식 자리에 들어오는 그림 하나.
 *
 * **표식이 아니라 값이 종류를 든다.** 표식 상자는 여전히 갈래가 없고(`i표식` 머리말),
 * 그 자리에 QR 이 오는지 로고가 오는지는 값을 대는 쪽만 안다 — `model회원` 은 자기가 만든
 * QR 문자열이 QR 인 걸 알지만, 디자인틀은 사각형 하나만 안다. 아는 쪽이 말하게 둔다.
 *
 * QR 이 `그림` 과 갈라져 있어야 하는 실질적인 이유도 있다: QR 은 링크가 아니라 **문자열**이고,
 * 이미지로 부으면 종이에 주소가 그대로 인쇄된다.
 */
export type i주입그림
  = | { 종류: '그림', url: string }
    | { 종류: 'QR', 값: string, 색?: string, 바탕?: string }

/**
 * 디자인틀의 자리들을 실제로 채우는 값 한 벌. 키는 상자에 붙은 **꼬리표**다.
 *
 * 없는 꼬리표는 **빈 채로 나간다.** 이게 이 파일에서 가장 중요한 한 줄이다 —
 * 값이 없을 때 예시를 대신 인쇄하면 없다는 사실이 종이에서 사라지고 그 자리에 그럴듯한
 * 남의 이름이 앉는다. 편집기가 `_source.ts` 를 지우면서 겪은 그대로다(`용도.ts` 머리말:
 * `위 사람은 undefined 과정(undefined, undefined)을`). 비어 있는 자리는 비어 보여야 고친다.
 */
export interface i주입 {
  글자?: Record<string, string | null | undefined>
  그림?: Record<string, i주입그림 | null | undefined>
}

export interface i디자인틀렌더옵션 {
  /** 그릴 폭(px). 미리보기든 300dpi 인쇄든 이 값 하나로 전체가 확대된다 */
  폭: number
  /** 몇 번째 면인가. 양면 인쇄물은 한 번에 한 면씩 나간다 (`useModalRender` 가 트리 하나를 받는다) */
  면?: number
  /**
     * 값이 없는 자리에 상자의 `예시` 를 대신 앉힌다. **미리보기 전용이다.**
     *
     * 디자인틀을 고르는 화면에서 빈 종이만 뜨면 무엇을 고르는지 알 수 없어서 두는 문이고,
     * 실제 발급 경로는 절대 켜지 않는다 — 켜는 순간 위 `i주입` 머리말의 그 문제가 돌아온다.
     */
  예시허용?: boolean
}

/* ------------------------------------------------------------------ */
/* 노드                                                                */
/* ------------------------------------------------------------------ */

const 상자 = (스타일: Record<string, unknown>, children?: RenderItem[]): RenderItem => ({
  comp: renderComps.div,
  props: { style: { position: 'absolute', ...스타일 } },
  ...(children?.length ? { children } : {})
})

/**
 * 이 상자에 실제로 찍힐 글자.
 *
 * 꼬리표가 있으면 **주입된 값만** 본다 — 꼬리표는 "여기 밖에서 값이 온다"는 선언이라,
 * 안 왔는데 상자가 든 옛 글자를 대신 찍으면 그건 남의 자리에 남은 흔적이다.
 * 꼬리표가 없으면 고정문구라 상자에 적힌 것이 곧 최종 문구다.
 */
const 글자값 = (
  꼬리표: string | undefined,
  내용: string,
  예시: string | undefined,
  주입: i주입,
  예시허용: boolean
): string => {
  if (!꼬리표) return 내용
  const v = 주입.글자?.[꼬리표]
  if (v != null && v !== '') return String(v)
  return 예시허용 ? (예시 ?? '') : ''
}

/* ------------------------------------------------------------------ */
/* 면                                                                  */
/* ------------------------------------------------------------------ */

/**
 * 면 한 장. 레이어 순서는 배열 순서가 곧 그리는 순서라 따로 z-index 를 두지 않는다 —
 * `types.ts` 가 "배경 → 표식 → 글자"를 타입 정의 자체로 정해 둔 것을 그대로 따른다.
 */
export function to디자인틀면(면: i면, 규격: i규격, 주입: i주입, o: i디자인틀렌더옵션): RenderItem {
  const 폭 = o.폭
  const 높이 = (폭 * 규격.높이mm) / 규격.폭mm
  const 예시허용 = !!o.예시허용

  const children: RenderItem[] = []

  // 1. 배경 — 바탕색은 종이 자신이 들고, 그림은 그 위에 깔린다.
  //    그림이 없거나 `맞추기` 여백이 생기면 그 바탕색이 그대로 보인다.
  if (면.배경.url) {
    children.push({
      comp: renderComps.img,
      value: 면.배경.url,
      props: {
        style: {
          position: 'absolute',
          left: 0, top: 0, width: '100%', height: '100%',
          ...배경스타일(면.배경)
        }
      }
    })
  }

  // 2. 표식 (그림 · QR · 색판). 배열 순서가 곧 겹치는 순서다
  for (const 표식 of 면.표식s) {
    const 주 = 표식.꼬리표 ? 주입.그림?.[표식.꼬리표] : null
    const 자리 = { ...rect스타일(표식.rect), ...표식스타일(표식) }

    if (주?.종류 === 'QR') {
      /*
             * QR 은 디자인보다 스캔이 우선이다 — 반전 QR(어두운 판 + 밝은 모듈)은 리더에 따라
             * 못 읽는다. 그래서 기본이 흰 바탕에 검은 모듈이고, 표식의 불투명도·합성은 그대로
             * 걸리되 그 값을 여기서 손보지는 않는다 (사람이 옅게 깔았다면 그건 그 사람의 선택이다).
             *
             * 변은 상자의 **짧은 쪽**이다. QR 은 정사각이라 긴 쪽에 맞추면 반대 축으로 넘친다.
             */
      const 변 = Math.max(1, Math.min((표식.rect.w / 100) * 폭, (표식.rect.h / 100) * 높이))
      children.push(상자({ ...자리, display: 'flex', alignItems: 'center', justifyContent: 'center' }, [{
        comp: renderComps.MQR,
        value: 주.값,
        props: { size: Math.round(변), fill: 주.색 ?? '#111111', background: 주.바탕 ?? '#ffffff' }
      }]))
      continue
    }

    // 주입된 그림이 상자의 그림을 덮는다. 주입이 없으면 얹어 둔 그림 그대로다
    const url = 주?.종류 === '그림' ? 주.url : 표식.url

    /*
         * 그림이 없으면 **색판**이다 (`i표식.채움`). 회원증 윗단의 남색 판이 이 갈래로 나간다.
         *
         * 순서가 이렇게 되는 이유: 사진 자리(`꼬리표: '사진'`)에 주입이 안 왔을 때 그 상자가
         * 색판으로 둔갑하면 안 된다. 그림 자리는 값이 없으면 **비는 것**이 맞다 —
         * 없는 것을 그럴듯한 무언가로 메우지 않는다는 이 파일의 규칙(`i주입` 머리말)이 여기도 같다.
         * 색판은 애초에 `url` 도 `꼬리표` 도 없는 상자라 그 상황 자체가 생기지 않는다.
         */
    if (!url) {
      if (표식.채움) children.push(상자({ ...자리, background: 표식.채움 }))
      continue
    }

    children.push({
      comp: renderComps.img,
      value: url,
      props: { style: { position: 'absolute', ...자리, ...표식그림스타일(표식) } }
    })
  }

  // 3. 글자 — 상자는 고정이고 글자가 그 안에서 줄어든다(`i글자.크기` 는 **상한**이다).
  //    그 줄이는 몫을 MFit 이 진다: 폰트를 이분 탐색으로 직접 줄이므로 캡처해도 선명하다.
  for (const g of 면.글자s) {
    const 글 = 글자값(g.꼬리표, g.내용, g.예시, 주입, 예시허용)
    if (!글) continue
    const st = 글자스타일(g, 폭)
    children.push(상자({ ...rect스타일(g.rect), ...st, overflow: 'hidden' }, [{
      comp: renderComps.MFit,
      value: 글,
      props: {
        max: (g.크기 / 100) * 폭,
        // 세로쓰기는 열이 늘어나는 축이 달라 줄 수로 가둘 수 없다. 넉넉히 열어 두고
        // 높이(maxHeight)로만 재게 한다 — 그쪽은 축과 무관하게 상자 밖을 잡아낸다
        lines: 99,
        maxHeight: (g.rect.h / 100) * 높이,
        weight: st.fontWeight,
        lineHeight: g.줄간격
      }
    }]))
  }

  return {
    comp: renderComps.div,
    props: {
      style: {
        position: 'relative',
        width: `${폭}px`,
        height: `${높이}px`,
        overflow: 'hidden',
        background: 면.배경.바탕색
      }
    },
    children
  }
}

/**
 * 디자인틀 한 벌에서 한 면을 뽑아 그린다. 없는 면을 부르면 `null` —
 * 단면 디자인틀에 뒷면을 물으면 그건 부르는 쪽의 착각이지 그릴 것이 있는 상태가 아니다.
 */
export function to디자인틀(틀: i틀, 주입: i주입, o: i디자인틀렌더옵션): RenderItem | null {
  const 면 = 틀.면s[o.면 ?? 0]
  if (!면) return null
  return to디자인틀면(면, 틀.규격, 주입, o)
}

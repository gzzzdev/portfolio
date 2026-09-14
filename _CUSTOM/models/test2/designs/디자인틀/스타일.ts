/**
 * 디자인틀 한 벌을 화면에 앉히는 **계산**. 캔버스와 인쇄 렌더러가 **같은 함수를 부른다.**
 *
 * 두 벌로 두면 안 되는 이유가 이 파일의 존재 이유 전부다 — 편집 화면과 종이가 갈라지면
 * 사람은 화면을 믿고 배치를 짜는데 나오는 것이 다르다. 그건 편집기가 있을 이유를 없앤다.
 * 그래서 좌표·정렬·회전·합성은 여기 한 번만 적히고, 두 쪽은 그것을 쓰기만 한다.
 *
 * **다른 것은 글자 크기의 단위 하나뿐이다.**
 *   · 캔버스 — 종이가 `container-type: inline-size` 라 `cqw` 로 적으면 종이가 커지든 작아지든
 *     비율이 저절로 따라온다. 패널을 끌어 종이 폭이 변해도 접히는 자리가 그대로인 이유다.
 *   · 인쇄   — `html-to-image` 가 캡처할 때 오프스크린 트리를 실제 폭으로 세우므로 `px` 로 굳힌다.
 *     컨테이너 질의는 캡처 경로에서 무엇으로 풀릴지 보장이 없어 숫자를 직접 낸다.
 *
 * 그래서 `폭` 을 받는다. `null` 이면 cqw(캔버스), 숫자면 그 폭 기준 px(인쇄).
 * 값이 같은 식에서 나오므로 둘은 언제나 같은 그림이다.
 */

import { 서체스택 } from '../서체'
import type { iRect, i글자, i배경, i표식 } from './types'

/**
 * 렌더 폭. `null` = 컨테이너 질의(cqw), 숫자 = 그 px 폭을 100% 로 친다.
 *
 * 좌표(`rect`)는 어느 쪽이든 `%` 라 이 값을 안 탄다 — absolute 는 부모를 기준으로 풀리므로
 * 종이 크기가 무엇이든 제자리다. 이 값이 필요한 것은 **글자 크기**뿐이다.
 */
export type i렌더폭 = number | null

/** 문서 폭 대비 % → 실제 CSS 길이 */
export const 폭비율 = (값: number, 폭: i렌더폭) =>
  폭 == null ? `${값}cqw` : `${(값 / 100) * 폭}px`

/** 상자 하나의 자리. 표식과 글자가 공유하는 유일한 위치 표현이라 함수도 하나다 */
export const rect스타일 = (r: iRect) => ({
  left: `${r.x}%`,
  top: `${r.y}%`,
  width: `${r.w}%`,
  height: `${r.h}%`
})

export const 배경맞춤css = { 채우기: 'cover', 맞추기: 'contain', 늘이기: 'fill' } as const

export const 배경스타일 = (배경: i배경) => ({
  objectFit: 배경맞춤css[배경.맞춤],
  opacity: 배경.불투명도
})

/**
 * 표식 한 장. 회전·투명도·합성이 전부다 — 이 층이 종류를 나누지 않는 이유(`i표식` 머리말)가
 * 여기서도 그대로다. 리본이든 인주 도장이든 하는 일이 이 셋뿐이라 갈래가 생길 자리가 없다.
 */
export const 표식맞춤css = { 맞추기: 'contain', 채우기: 'cover' } as const

/**
 * 표식 그림 한 장의 채움 방식. `채우기` 만 위쪽 기준으로 자른다 —
 * 자를 일이 있는 그림은 사실상 인물 사진이고, 거기서 남겨야 하는 쪽은 늘 얼굴이다
 * (`i표식.맞춤`). 가운데 기준으로 자르면 세로로 긴 사진에서 턱 아래가 남는다.
 */
export const 표식그림스타일 = (표식: i표식) => ({
  objectFit: 표식맞춤css[표식.맞춤 ?? '맞추기'],
  objectPosition: (표식.맞춤 === '채우기' ? 'center top' : 'center') as string
})

export const 표식스타일 = (표식: i표식) => ({
  transform: `rotate(${표식.회전}deg)`,
  opacity: 표식.불투명도,
  mixBlendMode: (표식.합성 === '곱하기' ? 'multiply' : 'normal') as 'multiply' | 'normal'
})

const 가로값 = { 왼쪽: 'flex-start', 가운데: 'center', 오른쪽: 'flex-end' } as const
const 세로값 = { 위: 'flex-start', 가운데: 'center', 아래: 'flex-end' } as const

/**
 * 400/700. **800 이 아니다** — 웨이트가 하나뿐인 서체(신라·솔뫼·조선명조)에서 브라우저가
 * 합성하는 굵기가 700 쯤이라, 800 으로 적으면 진짜 볼드를 가진 서체(프리텐다드·수트)만
 * 혼자 더 두꺼워진다. 같은 '굵게'가 서체마다 다르게 보이면 굵기 토글이 거짓말이 된다.
 */
export const 굵기값 = { 보통: 400, 굵게: 700 } as const

/**
 * 세로쓰기(`vertical-rl`)에서는 flex 주축이 쓰기 방향을 따라 돌아간다.
 * justify/align 을 바꿔 끼워야 '가운데 정렬'이 사람이 기대한 축에 걸린다.
 */
const 정렬축 = (g: i글자) =>
  g.세로쓰기
    ? {
        justifyContent: 세로값[g.세로정렬],
        alignItems: 가로값[g.정렬 === '왼쪽' ? '오른쪽' : g.정렬 === '오른쪽' ? '왼쪽' : '가운데']
      }
    : { justifyContent: 가로값[g.정렬], alignItems: 세로값[g.세로정렬] }

export const 글자스타일 = (g: i글자, 폭: i렌더폭 = null) => ({
  ...정렬축(g),
  display: 'flex',
  fontSize: 폭비율(g.크기, 폭),
  lineHeight: g.줄간격,
  color: g.색,
  fontFamily: 서체스택[g.서체],
  fontWeight: 굵기값[g.굵기],
  textAlign: (g.정렬 === '왼쪽' ? 'left' : g.정렬 === '오른쪽' ? 'right' : 'center') as 'left' | 'right' | 'center',
  whiteSpace: 'pre-wrap' as const,
  writingMode: (g.세로쓰기 ? 'vertical-rl' : 'horizontal-tb') as 'vertical-rl' | 'horizontal-tb'
})

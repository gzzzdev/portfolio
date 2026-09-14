import type { i투표dto } from '../enrolls/model투표'

export const i투표seed: readonly i투표dto[] = [
  {
    id: null,
    title: '2027년 운영진 선출',
    description: '정기총회 안건입니다. 투표는 1인 1표이며 결과는 익명으로 집계합니다.',
    body: `11월 21일 정기총회 안건입니다. 후보자 소개는 총회 자료에 실려 있습니다.
투표는 11월 14일에 열고 총회 당일 11시 선출 순서에서 닫습니다.

::point
**1인 1표**이고 한 번 제출하면 고칠 수 없습니다. 결과는 익명으로 집계됩니다. 투표권은 정회원에게 있습니다.
::`,
    thumbnail: '/img/seed/photos/ballot-box.jpg',
    isAnonymous: true
  },
  {
    id: null,
    title: '2026 하반기 지원 협회 최종 선정',
    description: '운영회의가 추린 후보 협회 중 함께할 세 곳을 고릅니다.',
    body: `운영회의가 진단 결과를 보고 추린 후보 다섯 곳입니다. 이 중 세 곳을 고릅니다.

이 투표는 기명이고, 결과가 그대로 선정입니다. 후보 협회의 진단 요약은 소식 게시판의 「9월 정기 모임 발표 영상」에서 볼 수 있습니다.`,
    thumbnail: '/img/seed/photos/tablet-stylus.jpg',
    isAnonymous: false
  },
  {
    id: null,
    title: '2026 정기총회 안건 사전 투표',
    description: '총회에 못 오는 정회원이 안건 세 개에 미리 표를 냅니다. 위임장을 대신합니다.',
    body: `11월 21일 정기총회에 참석하지 못하는 정회원이 안건에 미리 표를 내는 투표입니다. 사전 투표를 하면 위임장을 따로 내지 않아도 됩니다.

## 안건

| 번호 | 안건 | 자료 |
|---|---|---|
| 제1호 | 2026년 결산 승인 | 자료 메뉴 「2026 결산서」 |
| 제2호 | 2027년 사업계획 및 예산 승인 | 총회 자료집 3~6쪽 |
| 제3호 | 정관 일부 개정 — 전자 의결 조항 신설 | 총회 자료집 7쪽 (신구 조문 대비표) |

::point
사전 투표는 **11월 20일 자정**에 닫습니다. 사전 투표를 한 정회원이 총회에 오면 현장 표로 바꿀 수 없습니다.
::`,
    thumbnail: '/img/seed/photos/library-reading.jpg',
    isAnonymous: true
  }
]

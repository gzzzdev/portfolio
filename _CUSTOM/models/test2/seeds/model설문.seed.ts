import type { i설문dto } from '../enrolls/model설문'

/**
 * 서버가 `id`를 무조건 다시 매긴다(`db_low.withCreateMeta`). 그래서 여기 `id`는 자리표시자일 뿐이고,
 * 다른 테이블에서 이 행을 가리켜야 하는 FK는 **생성 응답의 실제 PK**로 엮는다(`enrolls/seed.ts`).
 */
export const i설문seed: readonly i설문dto[] = [
  {
    id: null,
    title: '협회 디지털 준비도 진단',
    description: '지원을 신청하기 전에 협회의 지금 상태를 스스로 봅니다. 명부·회비·소통·개인정보 네 영역입니다.',
    body: `지원 신청서를 쓰기 전에 협회의 지금 상태를 먼저 봅니다. 답한 내용은 착수 회의의 출발점이 됩니다.

- 문항은 12개이고 10분쯤 걸립니다
- 사무국 담당자가 답해 주세요. 모르는 항목은 「모름」으로 두셔도 됩니다
- 결과는 협회에만 드리고 따로 쓰지 않습니다

::note
진단만 받고 지원을 신청하지 않으셔도 됩니다. 10월 진단 주간에는 담당 회원이 결과를 같이 읽어 드립니다.
::`,
    thumbnail: '/img/seed/photos/desk-handwriting.jpg',
    category: 'PRE'
  },
  {
    id: null,
    title: '지원 프로젝트 종료 평가 — 전국독서지도사협회',
    description: '3개월 지원이 끝난 뒤 협회 사무국이 남기는 평가입니다. 다음 기수 운영에 반영합니다.',
    body: `지원이 끝난 뒤 사무국에서 남겨 주시는 평가입니다. 다음 기수의 진행 방식에 그대로 반영합니다.

지난 기수 평가에서 나온 말들 중 이런 것이 실제로 바뀌었습니다.

| 나온 말 | 바뀐 것 |
|---|---|
| 착수 회의가 너무 기술적이다 | 첫 회의는 명부와 회칙만 본다 |
| 동의서 받는 기간이 부족했다 | 이관 일정에 동의 기간 4주를 따로 뒀다 |
| 끝난 뒤 누구에게 물어야 할지 모르겠다 | 종료 후 3개월 질문 창구를 정했다 |`,
    thumbnail: '/img/seed/photos/tablet-reading.jpg',
    category: 'SATISFACTION'
  },
  {
    id: null,
    title: '2027년 회원 활동 수요 조사',
    description: '내년에 모임이 열 교육과 활동을 정하기 위해 회원의 관심과 쓸 수 있는 시간을 묻습니다.',
    body: '',
    thumbnail: '/img/seed/photos/magazine-review.jpg',
    category: 'ETC'
  },
  {
    id: null,
    title: '2026 하반기 교육 사전 설문',
    description: '10월 교육을 신청했거나 들을 예정인 분께 수준과 궁금한 점을 묻습니다. 강사가 실습 자료를 맞춥니다.',
    body: `10월 교육을 듣기 전에 지금 어느 정도 해 보셨는지 묻습니다. 답을 보고 강사가 실습 파일의 난이도와 예시 협회를 고릅니다.

- 문항은 5개, 5분쯤 걸립니다
- 교육을 아직 신청하지 않았어도 들을 생각이 있으면 답해 주세요
- 협회 담당자는 협회 사정을, 회원은 본인 경험을 기준으로 답해 주세요

::note
10월 4일까지 받습니다. 가장 많이 나온 질문은 첫 수업 앞 10분에 먼저 다룹니다.
::`,
    thumbnail: '/img/seed/photos/pencil-notes.jpg',
    category: 'PRE'
  }
]

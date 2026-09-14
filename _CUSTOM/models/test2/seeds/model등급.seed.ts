import type { i등급dto } from '../grades/model등급'

// 시드는 PK를 적지 않는다 — 타입(`Omit<…,'id'>`)이 막는다. 서버가 매기기 때문이다.
// 남의 행을 가리켜야 하면 `code`로 적고 `BaseModels2`의 `시드PK` 등록부가 실제 PK로 바꾼다.
// (여기 `code`는 그것과 별개다 — `api-guard`·JWT가 읽는 앱 데이터라 DB 열로도 남는다.)

export const i등급seed: readonly Omit<i등급dto, 'id'>[] = [
  {
    code: 'beginner',
    icon: 'i-ph:number-square-one-light',
    label: '입문자',
    labelEn: 'Beginner',
    description: '기본 회원에게 부여되는 시작 등급.',
    is오름차순: true,
    isDefault: true,
    thumbnail: '/img/grades/grade1.jpg',
    duration_type: 'FREE',
    alertDays: 7,
    graceDays: 3,
    labelAffix: {
      prefix: '',
      suffix: '급'
    },
    requiredWrittenTest: 60,
    createdAt: new Date('2026-07-27T07:48:59.835Z')
  },
  {
    code: 'basic',
    icon: 'i-ph:number-square-two-light',
    label: '기초',
    labelEn: 'Intermediate',
    description: '요건 충족 후 승급 가능한 중간 등급.',
    is오름차순: true,
    isDefault: false,
    thumbnail: '/img/grades/grade2.jpg',
    duration_type: 'ANNUAL',
    alertDays: 7,
    graceDays: 3,
    labelAffix: {
      prefix: '',
      suffix: '급'
    },
    requiredWrittenTest: 60,
    createdAt: new Date('2026-07-27T07:48:59.835Z')
  },
  {
    code: 'expert',
    icon: 'i-ph:number-square-three-light',
    label: '숙련자',
    labelEn: 'Beginner',
    description: '기본 회원에게 부여되는 시작 등급.',
    is오름차순: true,
    isDefault: false,
    thumbnail: '/img/grades/grade3.jpg',
    duration_type: 'ANNUAL',
    alertDays: 7,
    graceDays: 3,
    labelAffix: {
      prefix: '',
      suffix: '급'
    },
    requiredWrittenTest: 70,
    createdAt: new Date('2026-07-27T07:48:59.835Z')
  },
  {
    code: 'leader',
    icon: 'i-ph:number-square-four-light',
    label: '지도자',
    labelEn: 'Expert',
    description: '가장 높은 단계의 최상위 등급.',
    is오름차순: true,
    isDefault: false,
    thumbnail: '/img/grades/grade4.jpg',
    duration_type: 'ANNUAL',
    alertDays: 7,
    graceDays: 3,
    labelAffix: {
      prefix: '',
      suffix: '급'
    },
    requiredWrittenTest: 60,
    createdAt: new Date('2026-07-27T07:48:59.835Z')
  }
]

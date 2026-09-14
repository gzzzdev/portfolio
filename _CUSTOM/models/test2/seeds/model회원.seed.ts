import type { i회원시드 } from '~models/test2'

/**
 * 회원 38명. **전원 `code`를 든다** — 글·댓글·신청 시드가 회원을 `code`로 가리키고(`시드PK` 등록부), code 없는 회원은 못 가리킨다.
 * 앞의 다섯은 **로그인 계정이 가리키는 회원**이다(`model사용자.seed`의 `회원code`).
 *
 * 사진(thumbnail)은 비운다 — 사람 얼굴 사진은 쓰지 않는다(2026-09-15). 구성은 운영자 1(담당자·학습자 겸) · 전 역할 1 ·
 * 담당자 4 · 학습자 19 · 준회원 13(지원받은 협회 사무국 사람이 많다). 휴면(`isSleeping`)은 셋.
 *
 * `역할codes`가 여기 있는 이유: 역할은 계정이 아니라 회원의 것이고
 * (`member-entity-historys.memberId`가 그렇게 말한다), 이 선언이 없으면 `afterCreate`가
 * 전원에게 기본 역할(`associate`)만 붙인다 — 실제로 그랬다. 실DB에 역할 이력이 9행 있었는데
 * 전부 준회원이었고, 운영자·담당자·학습자를 가진 회원이 한 명도 없었다.
 */
export const i회원seed: readonly i회원시드[] = [
  {
    /**
     * 운영자. `i사용자seed`의 `admin@local.dev`가 가리키는 회원이고, 게시판 시드의 기본 작성자다.
     * 담당자·학습자도 든다 — 클릭로그인 한 번으로 상단 역할 전환에서 세 화면을 갈아끼워 테스트한다.
     */
    code: 'admin',
    역할codes: ['admin', 'manager', 'learner'],
    name: '강준훈',
    birthdate: '1990-03-18',
    gender: 'MALE',
    thumbnail: null,
    currentMemberFeeId: null,
    hp: 100,
    mp: 50,
    isSleeping: false
  },
  {
    /** 역할을 전부 든 회원. 클릭로그인 한 번으로 운영자~준회원 화면을 다 갈아끼워 볼 수 있다. */
    code: 'admin_manager',
    역할codes: ['admin', 'manager', 'learner', 'associate'],
    name: '한정재',
    birthdate: '2005-08-04',
    gender: 'MALE',
    thumbnail: null,
    currentMemberFeeId: null,
    hp: 100,
    mp: 50,
    isSleeping: false
  },
  {
    code: 'manager',
    역할codes: ['manager'],
    name: '송서영',
    birthdate: '2005-07-09',
    gender: 'FEMALE',
    thumbnail: null,
    currentMemberFeeId: null,
    hp: 100,
    mp: 50,
    isSleeping: false
  },
  {
    code: 'learner',
    역할codes: ['learner'],
    name: '고채민',
    birthdate: '2000-04-03',
    gender: 'FEMALE',
    thumbnail: null,
    currentMemberFeeId: null,
    hp: 100,
    mp: 50,
    isSleeping: false
  },
  {
    code: 'associate',
    역할codes: ['associate'],
    name: '장준준',
    birthdate: '2000-10-25',
    gender: 'MALE',
    thumbnail: null,
    currentMemberFeeId: null,
    hp: 100,
    mp: 50,
    isSleeping: false
  },
  // ── 여기부터 로그인 계정이 없는 회원 ── 글·댓글·신청이 `code`로 가리킨다(`시드PK`).,
  {
    code: 'yoon-migyeong',
    역할codes: ['manager'],
    name: '윤미경',
    birthdate: '1978-11-02',
    gender: 'FEMALE',
    thumbnail: null,
    currentMemberFeeId: null,
    hp: 100,
    mp: 50,
    isSleeping: false
  },
  {
    code: 'park-seongho',
    역할codes: ['manager'],
    name: '박성호',
    birthdate: '1982-05-17',
    gender: 'MALE',
    thumbnail: null,
    currentMemberFeeId: null,
    hp: 100,
    mp: 50,
    isSleeping: false
  },
  {
    code: 'lee-jieun',
    역할codes: ['manager'],
    name: '이지은',
    birthdate: '1988-01-29',
    gender: 'FEMALE',
    thumbnail: null,
    currentMemberFeeId: null,
    hp: 100,
    mp: 50,
    isSleeping: false
  },
  {
    code: 'choi-minjun',
    역할codes: ['learner'],
    name: '최민준',
    birthdate: '1994-07-11',
    gender: 'MALE',
    thumbnail: null,
    currentMemberFeeId: null,
    hp: 100,
    mp: 50,
    isSleeping: false
  },
  {
    code: 'jung-daeun',
    역할codes: ['learner'],
    name: '정다은',
    birthdate: '1996-02-23',
    gender: 'FEMALE',
    thumbnail: null,
    currentMemberFeeId: null,
    hp: 100,
    mp: 50,
    isSleeping: false
  },
  {
    code: 'oh-sehun',
    역할codes: ['learner'],
    name: '오세훈',
    birthdate: '1987-09-05',
    gender: 'MALE',
    thumbnail: null,
    currentMemberFeeId: null,
    hp: 100,
    mp: 50,
    isSleeping: false
  },
  {
    code: 'kim-haneul',
    역할codes: ['learner'],
    name: '김하늘',
    birthdate: '1999-12-14',
    gender: 'FEMALE',
    thumbnail: null,
    currentMemberFeeId: null,
    hp: 100,
    mp: 50,
    isSleeping: false
  },
  {
    code: 'seo-jihun',
    역할codes: ['learner'],
    name: '서지훈',
    birthdate: '1992-04-30',
    gender: 'MALE',
    thumbnail: null,
    currentMemberFeeId: null,
    hp: 100,
    mp: 50,
    isSleeping: false
  },
  {
    code: 'moon-subin',
    역할codes: ['learner'],
    name: '문수빈',
    birthdate: '1995-06-08',
    gender: 'FEMALE',
    thumbnail: null,
    currentMemberFeeId: null,
    hp: 100,
    mp: 50,
    isSleeping: false
  },
  {
    code: 'bae-hyeonwoo',
    역할codes: ['learner'],
    name: '배현우',
    birthdate: '1990-10-19',
    gender: 'MALE',
    thumbnail: null,
    currentMemberFeeId: null,
    hp: 100,
    mp: 50,
    isSleeping: false
  },
  {
    code: 'lim-chaewon',
    역할codes: ['learner'],
    name: '임채원',
    birthdate: '1998-03-03',
    gender: 'FEMALE',
    thumbnail: null,
    currentMemberFeeId: null,
    hp: 100,
    mp: 50,
    isSleeping: false
  },
  {
    code: 'jo-yunseo',
    역할codes: ['learner'],
    name: '조윤서',
    birthdate: '1993-08-27',
    gender: 'FEMALE',
    thumbnail: null,
    currentMemberFeeId: null,
    hp: 100,
    mp: 50,
    isSleeping: false
  },
  {
    code: 'shin-donghyuk',
    역할codes: ['learner'],
    name: '신동혁',
    birthdate: '1985-01-12',
    gender: 'MALE',
    thumbnail: null,
    currentMemberFeeId: null,
    hp: 100,
    mp: 50,
    isSleeping: false
  },
  {
    code: 'kwon-nayoung',
    역할codes: ['learner'],
    name: '권나영',
    birthdate: '1991-11-21',
    gender: 'FEMALE',
    thumbnail: null,
    currentMemberFeeId: null,
    hp: 100,
    mp: 50,
    isSleeping: false
  },
  {
    code: 'hwang-junseo',
    역할codes: ['learner'],
    name: '황준서',
    birthdate: '1997-05-15',
    gender: 'MALE',
    thumbnail: null,
    currentMemberFeeId: null,
    hp: 100,
    mp: 50,
    isSleeping: false
  },
  {
    code: 'yoo-seoyeon',
    역할codes: ['learner'],
    name: '유서연',
    birthdate: '2001-09-09',
    gender: 'FEMALE',
    thumbnail: null,
    currentMemberFeeId: null,
    hp: 100,
    mp: 50,
    isSleeping: false
  },
  {
    code: 'nam-gihyeon',
    역할codes: ['learner'],
    name: '남기현',
    birthdate: '1983-02-06',
    gender: 'MALE',
    thumbnail: null,
    currentMemberFeeId: null,
    hp: 100,
    mp: 50,
    isSleeping: false
  },
  {
    code: 'ahn-sohee',
    역할codes: ['learner'],
    name: '안소희',
    birthdate: '1989-07-24',
    gender: 'FEMALE',
    thumbnail: null,
    currentMemberFeeId: null,
    hp: 100,
    mp: 50,
    isSleeping: false
  },
  {
    code: 'jeon-taewoong',
    역할codes: ['learner'],
    name: '전태웅',
    birthdate: '1979-12-01',
    gender: 'MALE',
    thumbnail: null,
    currentMemberFeeId: null,
    hp: 100,
    mp: 50,
    isSleeping: false
  },
  {
    code: 'hong-yerin',
    역할codes: ['learner'],
    name: '홍예린',
    birthdate: '2000-01-18',
    gender: 'FEMALE',
    thumbnail: null,
    currentMemberFeeId: null,
    hp: 100,
    mp: 50,
    isSleeping: false
  },
  {
    code: 'ryu-geonwoo',
    역할codes: ['learner'],
    name: '류건우',
    birthdate: '1995-10-10',
    gender: 'MALE',
    thumbnail: null,
    currentMemberFeeId: null,
    hp: 100,
    mp: 50,
    isSleeping: true
  },
  {
    code: 'han-sugyeong',
    역할codes: ['associate'],
    name: '한수경',
    birthdate: '1983-08-22',
    gender: 'FEMALE',
    thumbnail: null,
    currentMemberFeeId: null,
    hp: 100,
    mp: 50,
    isSleeping: true
  },
  {
    code: 'no-sangjun',
    역할codes: ['associate'],
    name: '노상준',
    birthdate: '1991-09-25',
    gender: 'MALE',
    thumbnail: null,
    currentMemberFeeId: null,
    hp: 100,
    mp: 50,
    isSleeping: false
  },
  {
    code: 'kim-youngja',
    역할codes: ['associate'],
    name: '김영자',
    birthdate: '1962-04-13',
    gender: 'FEMALE',
    thumbnail: null,
    currentMemberFeeId: null,
    hp: 100,
    mp: 50,
    isSleeping: false
  },
  {
    code: 'park-junghee',
    역할codes: ['associate'],
    name: '박정희',
    birthdate: '1966-09-30',
    gender: 'FEMALE',
    thumbnail: null,
    currentMemberFeeId: null,
    hp: 100,
    mp: 50,
    isSleeping: false
  },
  {
    code: 'lee-sangcheol',
    역할codes: ['associate'],
    name: '이상철',
    birthdate: '1964-06-22',
    gender: 'MALE',
    thumbnail: null,
    currentMemberFeeId: null,
    hp: 100,
    mp: 50,
    isSleeping: false
  },
  {
    code: 'kang-dongwon',
    역할codes: ['associate'],
    name: '강동원',
    birthdate: '1975-03-08',
    gender: 'MALE',
    thumbnail: null,
    currentMemberFeeId: null,
    hp: 100,
    mp: 50,
    isSleeping: false
  },
  {
    code: 'song-jaehyuk',
    역할codes: ['associate'],
    name: '송재혁',
    birthdate: '1980-11-11',
    gender: 'MALE',
    thumbnail: null,
    currentMemberFeeId: null,
    hp: 100,
    mp: 50,
    isSleeping: false
  },
  {
    code: 'cha-eunbi',
    역할codes: ['associate'],
    name: '차은비',
    birthdate: '1997-02-14',
    gender: 'FEMALE',
    thumbnail: null,
    currentMemberFeeId: null,
    hp: 100,
    mp: 50,
    isSleeping: false
  },
  {
    code: 'pyo-minseok',
    역할codes: ['associate'],
    name: '표민석',
    birthdate: '1986-08-03',
    gender: 'MALE',
    thumbnail: null,
    currentMemberFeeId: null,
    hp: 100,
    mp: 50,
    isSleeping: false
  },
  {
    code: 'gu-bonseok',
    역할codes: ['associate'],
    name: '구본석',
    birthdate: '1972-01-25',
    gender: 'MALE',
    thumbnail: null,
    currentMemberFeeId: null,
    hp: 100,
    mp: 50,
    isSleeping: true
  },
  {
    code: 'seonu-jin',
    역할codes: ['associate'],
    name: '선우진',
    birthdate: '1977-07-07',
    gender: 'MALE',
    thumbnail: null,
    currentMemberFeeId: null,
    hp: 100,
    mp: 50,
    isSleeping: false
  },
  {
    code: 'baek-jia',
    역할codes: ['associate'],
    name: '백지아',
    birthdate: '2002-05-20',
    gender: 'FEMALE',
    thumbnail: null,
    currentMemberFeeId: null,
    hp: 100,
    mp: 50,
    isSleeping: false
  }
]

/**
 * 신청 세트.
 *
 * 테이블 배치는 이렇다 — 콘텐츠는 각자 테이블을 지키고(그래야 `/surveys = model설문s = surveys`
 * 사슬이 살아 화면이 공짜로 나온다), 신청받기(회차) 표 하나가 FK 다섯 중 하나로 콘텐츠를 가리킨다.
 *
 * ```
 *  surveys / quizzes / polls / classes / occasions      ← 콘텐츠 (제목·본문·이미지 + 종류별 칸)
 *      ▲ surveyId | quizId | pollId | classId | occasionId  (정확히 하나, DB check)
 *  enrollables     신청받기 = 회차   round · 기간 · 정원 · 요금 · questions(jsonb) · allowGuest
 *      ▲ enrollableId                     1회차는 콘텐츠 INSERT 트리거가 만든다
 *  enrolls         신청           memberId(비회원도 회원 행) · answers(jsonb) · status
 * ```
 *
 * 문항·응답은 표가 아니라 값이다(`questions`·`answers`). 옛 questionnaires·questions·answers 는 없다.
 * 설계 결정과 근거: `_CUSTOM/sql/enrolls.sql` 머리말.
 *
 * import 순서가 곧 평가 순서다. 잎(`types`·`문항`)부터 올라가고, `_대상레지스트리`는 콘텐츠가 다 정의된
 * **맨 끝**에 온다 — 그 안의 표가 콘텐츠 repo들을 참조하기 때문이다.
 */
export * from './types'
export * from './문항'
export * from './model신청받기'
export * from './model신청'
export * from './_콘텐츠물'
export * from './model설문'
export * from './model퀴즈'
export * from './model투표'
export * from './model수업'
export * from './model행사'
export * from './_대상레지스트리'
export * from './seed'

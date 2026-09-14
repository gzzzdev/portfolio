import type { i등급요건시드 } from '../grades/model등급요건'

/**
 * 승급 조건 시드. 대상 등급을 **`gradeCode`로** 가리킨다 — PK가 아니라.
 *
 * 예전엔 `{ id: '1001', gradeId: '3001' }`처럼 PK를 적었는데, 시드의 id는 서버에 닿지 않는다
 * (`createDraft`가 `delete payload.id`를 하고 어댑터도 body의 id를 뗀다). 그래서 적어둔
 * `3001~3003`은 실제 등급 PK(`1001~1004`)와 무관한 값이 됐고, 세 행 전부 아무것도 가리키지
 * 못한 채 `getByGradeId`가 항상 `null`을 돌려줬다. code는 서버가 안 바꾸므로 그 일이 없다.
 *
 * 대상이 `basic`·`expert`·`leader`인 이유: 이 조건은 **승급 목표 등급**에 걸리고
 * (`getByGradeId(목표등급.stateId)`), 목표가 될 수 있는 건 `i승급목표등급seed`
 * (= `isDefault`가 아닌 등급) 셋이다. 시작 등급 `beginner`는 승급 대상이 아니라 빠진다.
 */
export const i등급요건seed: readonly i등급요건시드[] = [
  { gradeCode: 'basic', noCondition: true },
  { gradeCode: 'expert', noCondition: false, requiredTrainingHoursCut: 100, requiredWrittenTimeCut: 60 },
  { gradeCode: 'leader', noCondition: false, requiredTrainingHoursCut: 150, requiredWrittenTimeCut: 65 }
]

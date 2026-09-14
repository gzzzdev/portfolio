/**
 * 신청받기가 붙을 수 있는 대상 표. **`i신청받기대상`에 값을 늘리면 여기가 컴파일 에러로 막는다.**
 *
 * `satisfies Record<i신청받기대상, i신청받기대상해석>`가 그 장치다. 예전 구조는 `entityType`에 값을 하나
 * 더해도 조용히 통과하고 런타임에 `undefined`가 됐다 — 그래서 "못 찾으면 전 테이블을 훑는"
 * fallback이 붙었고, 그게 다시 느려지는 원인이 됐다. 표를 강제하면 fallback 자체가 필요 없다.
 *
 * 이 파일은 **아무도 import 하지 않는다**(`index.ts`의 부수효과 import 하나뿐). `model신청받기`가
 * 콘텐츠 모델을 직접 알면 `신청받기 → 설문 → _콘텐츠물 → 신청받기` 순환이 생기고, 그 위에 `extends`가
 * 얹혀 있어 TDZ(ReferenceError)로 터진다. 표를 바깥에서 꽂는 이유가 이것이다.
 */
import { model신청받기s, do대상레지스트리등록, type i신청받기대상해석 } from './model신청받기'
import { model신청s } from './model신청'
import { model메뉴s } from '../_basics/model메뉴'
import { model회원s } from '../_basics'
import { model결제s } from '../payments/model결제'
import { i신청받기대상이름표s, type i신청받기대상 } from './types'
import { model설문s } from './model설문'
import { model퀴즈s } from './model퀴즈'
import { model투표s } from './model투표'
import { model수업s } from './model수업'
import { model행사s } from './model행사'

/**
 * **이 파일이 아는 것은 repo 뿐이다.** 라벨·아이콘은 `types.i신청받기대상이름표s` 가 정본이고
 * (거기 머리말 참고), 여기서 그걸 repo 와 짝지어 준다.
 *
 * `satisfies Record<i신청받기대상, …>` 는 그대로 남는다 — `i신청받기대상`에 값을 하나 늘리면
 * 이 표를 안 채운 것이 **컴파일 에러**로 잡힌다.
 */
const 대상repo표 = {
  surveys: (id: string) => model설문s.getInstance().getById(id),
  quizzes: (id: string) => model퀴즈s.getInstance().getById(id),
  polls: (id: string) => model투표s.getInstance().getById(id),
  classes: (id: string) => model수업s.getInstance().getById(id),
  occasions: (id: string) => model행사s.getInstance().getById(id)
} satisfies Record<i신청받기대상, i신청받기대상해석['getById']>

export const 신청받기대상표 = Object.fromEntries(
  i신청받기대상이름표s.map(이름표 => [
    이름표.value,
    { label: 이름표.label, icon: 이름표.icon, getById: 대상repo표[이름표.value] }
  ])
) as Record<i신청받기대상, i신청받기대상해석>

do대상레지스트리등록(신청받기대상표)

/** 신청받기 대상 목록을 화면 셀렉트로 쓸 때. 이름표 하나에서 나오므로 따로 관리할 목록이 없다. */
export const i신청받기대상options = i신청받기대상이름표s.map(x => ({ label: x.label, value: x.value, icon: x.icon }))

/** 대상 repo를 한 번에 읽는다. 신청/신청받기 화면이 조인할 목록을 빠뜨리지 않게 한 자리로 모은다. */
export const do대상전체읽기 = () => Promise.all([
  model설문s.getInstance().reads(),
  model퀴즈s.getInstance().reads(),
  model투표s.getInstance().reads(),
  model수업s.getInstance().reads(),
  model행사s.getInstance().reads()
])

/**
 * 신청받기 화면 한 장이 조인할 목록을 **한 번에** 읽는다.
 *
 * 조인이 클라이언트에서 일어나는 구조라, 하나라도 빠지면 라벨이 빈칸으로 나오고
 * 원인을 화면에서 못 찾는다. 페이지마다 목록을 손으로 나열하는 대신 여기 한 자리에 모은다.
 *
 * `is회원 = false` 면 결제를 안 읽는다 — 비회원(guest)에게 `payments:read` 가 없고, 비회원 화면은
 * 결제를 그리지도 않는다. 읽으면 `warn` 에선 남의 결제가 내려가고 `enforce` 에선 이 Promise 가 거부된다.
 */
export const do신청세트읽기 = (is회원 = true) => Promise.all([
  do대상전체읽기(),
  model신청받기s.getInstance().reads(),
  model신청s.getInstance().reads(),
  model회원s.getInstance().reads(),
  is회원 ? model결제s.getInstance().reads() : null,
  model메뉴s.getInstance().reads()
])

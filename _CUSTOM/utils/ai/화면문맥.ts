import { shallowRef } from 'vue'
import { 행id } from './plan'
import { 행값 } from '../etc/textSearch'

/**
 * 지금 화면이 보고 있는 대상 하나.
 *
 * "대화만이 대상을 좁히는 유일한 채널"이라는 가정이 이 챗봇의 실패 원인이었다.
 * 회원 상세를 띄워놓고 "회원증출력!"이라고 하면 대상은 이미 화면에 있는데,
 * 계획 호출은 현재 질문 한 줄만 받으므로(`계획조회`) 그걸 알 방법이 없었다.
 * 그래서 대상이 안 좁혀지고, 앱은 행동을 못 붙이고, 답변 LLM은 "지원하지 않습니다"라고 말했다.
 *
 * 화면이 자기 선택을 여기 등록하면 계획 단계가 `대상id` 후보로 읽는다.
 * `직전항목s`(대화가 남긴 지목 근거)와 같은 자리에 놓이는, **대화 밖에서 온** 또 하나의 근거다.
 */
export interface i화면대상 {
  /** 이 행이 속한 소스 키(= `repo.tableName` = `AiSource.key`). 계획이 소스를 빗나가도 되돌릴 수 있다. */
  source: string
  id: string
  label: string
  sub: string
  /** 프롬프트에는 가지 않는다. 앱이 행동 버튼을 만들 때만 쓴다 — `i실행항목.row`와 같은 규칙. */
  row: unknown
}

/**
 * shallow: 모델 인스턴스를 담는다. 깊은 반응형으로 싸면 프록시가 한 겹 더 붙어
 * 저장소가 쥔 원본과 identity가 어긋난다(`AI_Copilot.vue`의 `직전항목s`와 같은 이유).
 */
const 대상 = shallowRef<i화면대상 | null>(null)

/**
 * 화면(목록5 등)이 자기 선택을 등록한다. 선택이 풀리면 `row`에 null을 준다.
 *
 * 서버에서는 아무것도 하지 않는다. 모듈 스코프 상태라 SSR에서는 요청끼리 공유되는데,
 * 이걸 읽는 쪽(챗봇의 `context`)은 언제나 클라이언트라 서버에 쌓아둘 이유가 없다.
 */
export function set화면대상(source: string, row: unknown) {
  if (import.meta.server) return
  대상.value = (row == null || !source)
    ? null
    : { source, id: 행id(row), label: 행값(row, 'label'), sub: 행값(row, 'sub'), row }
}

/**
 * 화면을 벗어날 때. 무조건 지우지 않고 **자기가 걸어둔 것일 때만** 지운다 —
 * 목록이 중첩돼 있으면 안쪽이 사라질 때 바깥쪽 대상까지 날아간다.
 */
export function clear화면대상(row: unknown) {
  if (row != null && 대상.value?.row === row) 대상.value = null
}

/** 저장 전 행은 id가 없어 `대상id`로 지목할 수 없다 — 그런 건 없는 것으로 친다. */
export function get화면대상(): i화면대상 | null {
  const v = 대상.value
  return v?.id ? v : null
}

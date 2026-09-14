import { shallowRef, toValue, onScopeDispose, watch, type MaybeRefOrGetter } from 'vue'
import { 행값, 잘라정규화 } from '../etc/textSearch'

/**
 * 지금 화면이 **편집하고 있는** 대상 하나.
 *
 * `화면문맥`(선택한 행)과 왜 따로인가 — 그쪽은 조회 결과를 지목하기 위한 자리라
 * `id` 없는 행을 버린다(`get화면대상`). 여기 담기는 건 **아직 저장되지 않은 것이 정상**이다.
 * 글쓰기 화면의 새 글은 행이 아니고, 그래서 조회로는 영영 지목할 수 없다.
 * 두 축을 하나로 합치면 한쪽의 규칙이 다른 쪽을 망친다.
 *
 * 담기는 `row`는 모델 인스턴스다. 챗봇이 값을 읽는 것도(`필드s`), 고치는 것도(`행동s`의 `do*`)
 * 전부 그 인스턴스의 접근자를 거친다 — 화면의 ref를 챗봇이 직접 만지는 경로는 두지 않는다.
 * 그래야 화면이 무엇으로 폼을 그리든(공개 글쓰기·관리 폼·ORM 폼) 챗봇 쪽 배선이 같다.
 */
export interface i작업대상 {
  /** 소스 키(= `repo.tableName` = `AiSource.key`). 어휘·소스와 잇는 데 쓴다. */
  source: string
  /** 사람이 읽는 화면 이름. "글쓰기 · 공지사항"처럼 프롬프트에 그대로 나간다. */
  화면: string
  /** 편집 중인 모델 인스턴스. 미저장이어도 된다. */
  row: unknown
  /**
   * 챗봇이 **읽을** 게터명. 값은 매 턴 프롬프트에 실리므로 상한(`필드상한`)까지만 잘린다.
   * 본문 전체가 필요한 일(초안 다시 쓰기)은 그 `do*`가 자기 호출에서 직접 읽는다 —
   * 매 턴 나가는 자리에 8만 자를 실을 이유가 없다.
   *
   * 게터명이 사람 말과 다르면(`본문텍스트`) 라벨을 따로 준다. 프롬프트에 그대로 나가는 이름이고,
   * 답변이 그 말을 사용자에게 도로 옮기기 때문이다.
   */
  필드s: (string | { key: string, label: string })[]
  /**
   * 챗봇이 **제안할** 수 있는 `do*` 키. `sources.ts`의 `행동키s`와 같은 성격의 화이트리스트다.
   * 모델에 `do`를 추가했다고 챗봇 권한이 따라 늘어나면 안 된다.
   */
  행동s: string[]
}

/** shallow: 모델 인스턴스를 담는다. 깊게 싸면 프록시가 한 겹 더 붙어 저장소가 쥔 원본과 identity가 어긋난다. */
const 작업 = shallowRef<i작업대상 | null>(null)

/**
 * 화면이 자기 작업 대상을 등록한다. 서버에서는 아무것도 하지 않는다 —
 * 모듈 스코프라 SSR에서는 요청끼리 공유되는데, 읽는 쪽(챗봇)은 언제나 클라이언트다.
 */
export function set작업대상(v: i작업대상 | null) {
  if (import.meta.server) return
  작업.value = v?.row ? v : null
}

/** 화면을 벗어날 때. **자기가 걸어둔 것일 때만** 지운다(`clear화면대상`과 같은 이유). */
export function clear작업대상(row: unknown) {
  if (row != null && 작업.value?.row === row) 작업.value = null
}

export function get작업대상(): i작업대상 | null {
  return 작업.value
}

/**
 * 화면이 한 줄로 신고한다. 대상이 바뀌면(신규→수정 등) 따라가고, 화면을 떠나면 스스로 지운다.
 * `useDockPane`이 도크에 자기를 신고하는 것과 같은 관례다.
 */
export function use작업대상(
  row: MaybeRefOrGetter<unknown>,
  opts: MaybeRefOrGetter<Omit<i작업대상, 'row'>>
) {
  watch(
    () => [toValue(row), toValue(opts)] as const,
    ([r, o]) => set작업대상(r ? { ...o, row: r } : null),
    { immediate: true }
  )
  onScopeDispose(() => set작업대상(null))
}

/**
 * 한 필드가 프롬프트에서 차지할 수 있는 상한.
 *
 * 여기 실리는 건 "무슨 글을 쓰고 있는지" 알아보게 하는 **가이드**지 글 자체가 아니다.
 * 매 턴 나가는 자리라 본문을 통째로 실으면 대화가 길어질수록 그 값이 곱해진다.
 */
const 필드상한 = 120

/**
 * 계획·답변 양쪽 프롬프트에 실리는 블록. 한 군데서 만든다 —
 * 계획이 본 화면과 답변이 본 화면이 다르면 "이거"가 가리키는 게 둘로 갈린다.
 */
export function 작업블록(v: i작업대상 | null): string {
  if (!v) return ''

  const 줄s = v.필드s.map((f) => {
    const { key, label } = typeof f === 'string' ? { key: f, label: f } : f
    const 원본 = 행값(v.row, key)

    /**
     * **빈 칸도 반드시 적는다.** 빼면 답변이 그 침묵을 사용자의 말로 메운다 —
     * 실측: 빈 폼에서 "내용 채워 내일 김밥축제 참가비 1만원"이라고 하자
     * "화면에 …라는 내용이 입력되어 있습니다"라고 답했다. 값이 없다는 것도 사실이고,
     * 사실을 적지 않으면 지어낸다(`AI_Copilot.vue`의 `버튼없음`이 침묵을 막는 것과 같은 이유).
     */
    if (!원본) return `${label}: (비어 있음)`

    const 값 = 잘라정규화(원본, 필드상한)
    // 잘렸으면 잘렸다고 적는다. 안 적으면 답변이 앞 120자를 글 전체로 읽고 "짧다"고 말한다.
    return `${label}: ${원본.length > 필드상한 ? `(${원본.length}자 중 앞 ${필드상한}자) ` : ''}${값}`
  })

  return [
    '\n\n[작업 중인 화면] 사용자가 지금 열어놓고 편집하고 있는 것. 아래가 지금 화면에 들어 있는 값 전부다.',
    v.화면,
    ...줄s
  ].join('\n')
}

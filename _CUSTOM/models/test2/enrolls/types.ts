/**
 * 신청 세트의 **잎(leaf) 타입 모듈**.
 *
 * 이 파일은 아무것도 import 하지 않는다 — `model신청받기`와 `_대상레지스트리`가 둘 다 여기서
 * `i신청받기대상`을 가져가야 하는데, 어느 한쪽에 두면 순환이 생긴다.
 */

/** 신청받기(회차) 공개 상태. 「신청받는 중」은 상태값이 아니라 공개·기간·정원으로 계산한다(`model신청받기.is신청받는중`). */
export type i신청받기상태 = 'PREPARING' | 'PUBLISHED' | 'HIDDEN' | 'COMPLETED'
export const i신청받기상태options = [
  { label: '준비중', value: 'PREPARING' },
  { label: '공개', value: 'PUBLISHED' },
  { label: '비공개', value: 'HIDDEN' },
  { label: '완료', value: 'COMPLETED' }
] as const

/** 이름에 `신청받기`를 붙인 건 옛 `adds/` 세트의 `i요금구분`과 배럴에서 부딪혔기 때문이다(그 세트는 폐기). */
export type i신청받기요금구분 = 'FREE' | 'PAID'
export const i신청받기요금구분options = [
  { label: '무료', value: 'FREE' },
  { label: '유료', value: 'PAID' }
] as const

/**
 * 신청 한 건의 진행 단계. 결제 상태는 여기 없다 — `model결제`가 따로 답한다.
 *
 * - 대기·승인·반려는 **모임물**(수업·행사)의 심사 단계다.
 * - 제출은 **문답물**(설문·퀴즈·투표)이 답을 내면 자동으로 되는 단계다 — 심사가 없다.
 * - 취소는 본인이 뺀 것.
 */
export type i신청단계 = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUBMITTED' | 'CANCELED'
export const i신청단계options = [
  { label: '대기', value: 'PENDING' },
  { label: '승인', value: 'APPROVED' },
  { label: '반려', value: 'REJECTED' },
  { label: '제출', value: 'SUBMITTED' },
  { label: '취소', value: 'CANCELED' }
] as const

/**
 * **자리를 먹는 상태.** 정원 계산·신청수·「정원 마감」 판정이 전부 이 하나를 본다(2026-09-13 결정).
 * 반려·취소는 자리를 안 먹고, 제출은 정원 개념이 없는 문답물의 것이라 응답 수로 따로 센다.
 *
 * 정원 트리거를 DB 에 걸 때(`_CUSTOM/sql/enrolls.sql` 「나중」 절) 같은 집합을 SQL 로 옮긴다 —
 * 세 벌로 적히면 반드시 어긋나므로 그때 이 상수를 정본으로 삼는다.
 */
export const 자리차지상태s: readonly i신청단계[] = ['PENDING', 'APPROVED']
export const is자리차지 = (상태: i신청단계) => 자리차지상태s.includes(상태)

/**
 * 신청받기가 붙을 수 있는 대상 **테이블명**.
 *
 * 값이 곧 `BaseModels2.tableName`이다 — 별도의 `entityType` 코드를 두지 않는 이유가 이것이다.
 * 콘텐츠 모델은 `this.메뉴명`(= `repo.tableName`)을 그대로 쓰므로 두 곳이 어긋날 자리가 없다.
 *
 * 여기에 값을 하나 늘리면 `_대상레지스트리.ts`·`i신청받기대상FK열`이 **컴파일 에러**로 막는다(`satisfies`).
 */
export type i신청받기대상 = 'surveys' | 'quizzes' | 'polls' | 'classes' | 'occasions'

/** 대상 종류 하나의 이름표. repo 는 여기 못 온다 — 콘텐츠 모델을 알면 순환이다. */
export interface i신청받기대상이름표 { value: i신청받기대상, label: string, icon: string }

/**
 * 다섯 종류의 **이름표 정본.** 라벨·아이콘을 찾는 곳은 여기 하나다.
 *
 * 전에는 같은 표가 세 벌이었다 — `_대상레지스트리.신청받기대상표` · `mdc/List.vue` 의 `종류표` ·
 * 화면이 손으로 적던 필터 옵션. 셋이 갈리면 같은 것을 화면마다 다른 이름으로 부르게 되고,
 * 그때 도우미가 건 `종류=설문` 이 어느 화면에서는 안 걸린다.
 *
 * **이 파일에 두는 게 중요하다** — 여기는 아무것도 import 하지 않아서 `model신청받기`(필터 축)도
 * `_대상레지스트리`(repo 표)도 순환 없이 가져다 쓴다. repo 를 아는 부분만 저쪽에 남는다.
 */
export const i신청받기대상이름표s = [
  { value: 'occasions', label: '행사', icon: 'i-ph-confetti-light' },
  { value: 'classes', label: '수업', icon: 'i-ph-chalkboard-teacher-light' },
  { value: 'surveys', label: '설문', icon: 'i-ph-clipboard-text-light' },
  { value: 'quizzes', label: '퀴즈', icon: 'i-ph-exam-light' },
  { value: 'polls', label: '투표', icon: 'i-ph-check-square-offset-light' }
] as const satisfies readonly i신청받기대상이름표[]

export const i신청받기대상목록: readonly i신청받기대상[] = i신청받기대상이름표s.map(x => x.value)

/**
 * **사람 눈에서 치운 종류.** 표·모델·라우트는 그대로 살아 있고, 고르는 자리(종류 필터·`/official/enrolls` 목록·`::list`)만 안 보인다.
 * GNB 는 역할의 `menuDirectory` 가 따로 숨긴다(`model역할.seed`). 되살리려면 여기서 빼고 거기서 `show:false` 를 걷는다.
 */
export const 숨긴대상s: readonly i신청받기대상[] = ['polls']
export const is숨긴대상 = (표: i신청받기대상) => 숨긴대상s.includes(표)
/** 고르는 자리가 읽는 이름표. 정본(`i신청받기대상이름표s`)에서 숨긴 종류만 뺐다. */
export const 보이는대상이름표s = i신청받기대상이름표s.filter(x => !is숨긴대상(x.value))

/**
 * `enrollables` 의 콘텐츠 FK 열 이름. 다섯 중 **정확히 하나**만 채운다(DB check).
 * `ownerTable`·`ownerId` 는 DB 가 이 다섯에서 계산하는 열이라 클라는 읽기만 한다.
 */
export type i신청받기FK열 = 'surveyId' | 'quizId' | 'pollId' | 'classId' | 'occasionId'
export const i신청받기대상FK열 = {
  surveys: 'surveyId',
  quizzes: 'quizId',
  polls: 'pollId',
  classes: 'classId',
  occasions: 'occasionId'
} as const satisfies Record<i신청받기대상, i신청받기FK열>

/** 문항으로 답을 받는 종류(문답물). 답을 내면 신청이 「제출」이 된다 — 심사 단계가 없다. */
export const 문답물대상s: readonly i신청받기대상[] = ['surveys', 'quizzes', 'polls']
export const is문답물대상 = (표: i신청받기대상) => 문답물대상s.includes(표)

/** 문항 유형. `options`를 쓰는 건 SINGLE·MULTI·SCALE 셋뿐이다. */
export type i문항유형 = 'SHORT' | 'LONG' | 'SINGLE' | 'MULTI' | 'OX' | 'SCALE'
export const i문항유형options = [
  { label: '단답', value: 'SHORT' },
  { label: '서술', value: 'LONG' },
  { label: '객관식(1개)', value: 'SINGLE' },
  { label: '객관식(여러개)', value: 'MULTI' },
  { label: 'OX', value: 'OX' },
  { label: '척도', value: 'SCALE' }
] as const

/** `options`로 고르는 유형인가. 아니면 자유입력이라 선택지가 의미 없다. */
export const is선택형 = (유형: i문항유형) => 유형 === 'SINGLE' || 유형 === 'MULTI' || 유형 === 'SCALE' || 유형 === 'OX'
/** 답이 여러 개 나올 수 있는 유형인가. */
export const is복수응답 = (유형: i문항유형) => 유형 === 'MULTI'

export interface i선택지 {
  label: string
  value: string
}

export const create선택지 = (label = '', value = ''): i선택지 => ({ label, value: value || label })

/** OX 문항이 늘 쓰는 고정 선택지. 저장하지 않고 `문항선택지s`가 만들어 준다. */
export const OX선택지s: readonly i선택지[] = [
  { label: 'O', value: 'O' },
  { label: 'X', value: 'X' }
]

/**
 * 문항 하나 — **표가 아니라 값**이다. `enrollables.questions` jsonb 배열의 원소.
 *
 * `id` 는 JSON 안의 짧은 랜덤 문자열이다. 답(`enrolls.answers`)이 배열 위치가 아니라 이 id 로 묶여서,
 * 문항 순서를 바꾸거나 중간에 하나를 지워도 이미 낸 답이 안 밀린다. 회차를 복사할 때도 id 를 그대로
 * 가져간다 — 2차 문항을 고쳐도 1차 답은 1차 문항 id 에 묶여 그대로다.
 *
 * `answerKey`(퀴즈 정답)가 여기 같이 있는 건 **알고 미룬 것**이다 — jsonb 라 열 단위 투영으로 못 뺀다.
 */
export interface i문항 {
  id: string
  label: string
  type: i문항유형
  /** SINGLE·MULTI·SCALE 전용. OX는 고정 선택지를 쓰므로 비워 둔다. */
  options: i선택지[]
  /** 퀴즈 정답(선택지 value들). `null`이면 채점하지 않는 문항 = 설문·투표. */
  answerKey: string[] | null
  /** 퀴즈 배점. 채점하지 않는 문항에서는 무시된다. */
  score: number
  isRequired: boolean
}

/**
 * 답 — `enrolls.answers` jsonb. **문항 id → 값들.**
 * 선택형이면 선택지 value 들, 자유입력이면 `[입력값]`. 키가 없거나 빈 배열이면 아직 안 쓴 것.
 */
export type i답s = Record<string, string[]>

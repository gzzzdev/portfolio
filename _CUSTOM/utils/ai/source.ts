import { toValue } from 'vue'
import { 계획실행, 어휘블록, 어휘열거, 행id, type Plan, type PlannableRepo, type 어휘열거결과 } from './plan'
import type { i목록Badge } from '../models/BaseModels2.types'
import { 검색정규식s, 스니펫추출, 잘라정규화, 행값, type i검색정규식 } from '../etc/textSearch'

export interface i실행항목 {
  id: string
  label: string
  /** 이 행이 나온 소스 키. 다음 턴이 `대상id`로 지목했을 때 소스를 되찾는 데 쓴다. */
  source: string
  /** 본문을 가진 행인가. 전문을 읽어줄 수 있는 행만 true. */
  has본문: boolean
  /**
   * 이 행을 열어볼 주소(`fromRepo`의 `링크`). 없으면 챗봇은 표시만 한다.
   *
   * 경로 규칙은 모델마다 다르다(`/resources/:id` vs `/boards/:슬러그/:id`). 그걸 챗봇이 알면
   * 소스가 늘 때마다 `AI_Copilot.vue`에 분기가 하나씩 생기므로, 아는 자리(`sources.ts`)에서 만들어 싣는다.
   */
  to?: string
  /** 동명이인을 가르는 부가 표기(회원이면 `93♂(93000)`). 되묻기를 앱이 구체적으로 쓰기 위한 것. */
  sub: string
  /**
   * 행이 스스로 내놓는 뱃지(`BaseModel2.badges`) — 목록5가 카드에 그리는 그 정의를 그대로 읽는다.
   * AI 전용 정의를 새로 두지 않는 이유는 `필터조건ss`·`검색필드s`와 같다:
   * 모델에 뱃지를 하나 추가하면 화면과 챗봇에 동시에 잡혀야 한다.
   *
   * `row`와 마찬가지로 **프롬프트에는 가지 않는다.** 앱이 명단을 그릴 때만 쓴다.
   */
  뱃지s: i목록Badge[]
  /**
   * 프롬프트에 올라간 그 행(모델 인스턴스). 앱이 행동 버튼을 만들 때만 쓴다.
   * LLM에는 절대 가지 않는다 — 프롬프트로 나가는 건 `id`·`label`뿐이다.
   */
  row?: unknown
}

/** 계획 실행 결과 — 텍스트와, 다음 턴이 "그거 전문 보여줘"로 지목할 수 있는 항목 목록. */
export interface 실행결과 {
  text: string
  /**
   * 프롬프트에 실제로 등장한 행들. 다음 턴 `대상id` enum의 원천이자,
   * 챗봇이 답변 아래에 다는 "전문 보기" 링크의 원천이다.
   */
  항목s: i실행항목[]
  /**
   * 조건에 걸린 **전체** 건수. `항목s.length`는 프롬프트 예산에 맞춰 잘린 수라 다르다.
   * "대상이 몇 건이냐"를 말할 때 잘린 수를 쓰면 앱이 거짓말을 하게 된다.
   */
  총건수: number
  /** 본문 발췌가 실제로 붙었는가. 발췌 얘기를 할지 말지는 앱이 알고 있어야 한다. */
  is발췌: boolean
}

/**
 * 챗봇이 참조할 데이터 한 덩어리.
 *
 * 이 파일은 모델도(`~models/*`) AI도(`server/utils/ai`) import하지 않는다.
 * 모델과 챗봇은 서로를 모른 채 이 타입 하나만 공유한다.
 */
export interface AiSource {
  key: string
  label: string
  /** 프롬프트를 만들기 직전 1회 호출. 데이터 적재가 필요하면 여기서 한다. */
  load?: () => Promise<unknown>

  /** 이 소스로 무엇을 조회할 수 있는지(필터 축·옵션·검색·정렬). 행은 넣지 않으므로 크기가 상수. */
  vocabulary?: () => string
  /** responseSchema의 enum을 실제 존재하는 값으로 닫기 위한 목록. */
  enumerate?: () => 어휘열거결과
  /** 계획 실행 결과를 예산 안에서 텍스트로. `vocabulary`와 짝. */
  run?: (plan: Plan, limit?: number) => 실행결과

  /** 전량 덤프. 소량이거나 계획을 못 세웠을 때의 폴백. */
  toText: () => string

  /**
   * 이 소스에서 챗봇이 **제안할 수 있는** 행동(`do*`) 키의 화이트리스트.
   *
   * 기본은 비어 있다(=행동 없음). 모델에 `do*`를 하나 추가했다고 챗봇이 자동으로
   * 그걸 누를 수 있게 되면 안 되므로, 노출은 `sources.ts`에서 명시적으로 opt-in한다.
   * 개발용 버튼(do로그·do초기화·do초안)이 새어나가지 않는 것도 같은 이유로 보장된다.
   */
  행동키s?: string[]
}

export interface FromRepoOptions {
  /** 표에 넣을 게터명(예: `['이름','성별']`). 전체 덤프는 토큰이 감당 안 되므로 명시 필수. */
  fields: string[]
  /**
   * 매칭 구간을 뽑을 본문 게터명. **`fields`에 본문을 넣지 말고 이걸 쓴다** —
   * 표 셀은 한 줄이라 8만 자짜리를 감당 못 하고, 발췌는 예산 배분을 따로 받아야 하기 때문.
   */
  본문필드?: string
  label?: string
  /** 프롬프트에 넣을 최대 행 수 */
  limit?: number
  /** 이 소스가 참조 블록에서 쓸 수 있는 총 문자 수. 기본 8,000자. */
  예산?: number
  /** 표 셀 하나의 상한. 긴 필드가 실수로 `fields`에 들어와도 표가 터지지 않게. */
  셀상한?: number
  /** 챗봇이 제안할 수 있는 행동(`do*`) 키. 안 주면 이 소스에는 행동이 없다. */
  행동?: string[]
  /**
   * 행 하나를 열어볼 주소. 주면 챗봇이 명단·전문 버튼에 링크를 건다.
   * 열 데가 없거나(회원) 지금은 열면 안 되는 행(비공개 글)이면 빈 값을 돌려주면 된다.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  링크?: (row: any) => string | null | undefined
}

/**
 * 참조 블록 총예산(문자). 한글 1자 ≈ 1토큰으로 보수적으로 잡은 값.
 *
 * 회원 300건 덤프가 7.4k 토큰이었고 그건 이미 lite로 검증된 크기다. 대화기록 20턴(≈1.3k)과
 * 합쳐 10k 언저리 — 비용이 예측 가능하고 "lost in the middle"도 아직 안 걸린다.
 */
const 기본예산 = 8000
/**
 * 이 밑으로 쪼개면 발췌가 의미를 잃는다. 건당 몫이 여기 못 미치면 **건수를 줄인다.**
 * 30건에 250자씩 흩뿌리는 것보다 상위 몇 건을 제대로 보여주는 쪽이 답변에 쓸모 있다.
 */
const 최소발췌 = 800
const 기본셀상한 = 200

/**
 * 명단 한 줄에 붙일 뱃지. 목록5의 `getBadges`와 같은 규칙이다 — 문자열도 받아주고, 라벨 없는 건 버린다.
 *
 * `badges`는 대개 computed 게터라 던질 수 있으므로 `행값`과 같은 이유로 감싼다.
 * 좁은 패널에 한 줄로 놓이니 앞의 몇 개만 — 자료처럼 태그까지 붙는 모델은 뱃지가 길어진다.
 */
const 뱃지최대 = 3
function 행뱃지s(row: unknown): i목록Badge[] {
  try {
    const raw = (row as { badges?: unknown })?.badges
    if (!Array.isArray(raw)) return []
    return raw
      .map(b => (typeof b === 'string' ? { label: b } : b))
      .filter((b): b is i목록Badge => typeof b?.label === 'string' && b.label.length > 0)
      .slice(0, 뱃지최대)
  } catch {
    return []
  }
}

function cell(row: unknown, field: string, 상한: number) {
  // 자르고 나서 정규화한다(`잘라정규화`) — 순서가 뒤집히면 큰 본문에서 그대로 비용이 된다.
  return 잘라정규화(행값(row, field), 상한).replace(/\t/g, ' ')
}

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * 행 목록 → TSV, **예산이 허락하는 만큼만**.
 *
 * 건수로 자르지 않고 누적 길이로 자르는 게 핵심이다. `label`/`sub` 100건(≈6k자)은 그대로 통과하고,
 * 같은 코드가 큰 행에서는 알아서 몇 건만 남긴다 — 임계값이 예산 하나뿐이라 분기가 없다.
 */
function 표만들기(head: string, all: any[], fields: string[], o: { 최대건수: number, 예산: number, 셀상한: number }) {
  if (!all.length) return { text: `${head} 총 0건`, 행s: [] as any[], 총건수: 0 }

  const 머리 = fields.join('\t')
  let 남음 = o.예산 - head.length - 머리.length
  const 줄s: string[] = []
  const 행s: any[] = []

  for (const row of all.slice(0, o.최대건수)) {
    const 줄 = fields.map(f => cell(row, f, o.셀상한)).join('\t')
    if (줄.length + 1 > 남음) break
    남음 -= 줄.length + 1
    줄s.push(줄)
    행s.push(row)
  }

  const 잘림 = all.length > 행s.length ? ` (상위 ${행s.length}건만 표시)` : ''
  return {
    text: [`${head} 총 ${all.length}건${잘림}`, 머리, ...줄s].join('\n'),
    행s,
    총건수: all.length
  }
}

/**
 * 남은 예산을 발췌에 배분한다.
 *
 * 균등 분할하되 건당 몫이 `최소발췌`에 못 미치면 **건수를 줄인다** — 30건에 250자씩 흩뿌리는 것보다
 * 상위 몇 건을 제대로 보여주는 쪽이 답변에 쓸모 있다. 결과적으로:
 * - 1건 → 예산 전액(≈전문)
 * - 3건 × 8만 자 → 건당 ≈2,500자 발췌
 * - 30건 → 상위 몇 건만 발췌, 나머지는 표의 제목·요약으로 남는다
 */
function 발췌만들기(행s: any[], 본문필드: string, 정규식s: i검색정규식[], 예산: number) {
  const 블록머리 = '\n\n[본문 발췌]\n'
  if (예산 - 블록머리.length < 최소발췌) return ''

  const 후보 = 행s
    .map(row => ({ row, 본문: 행값(row, 본문필드) }))
    .filter(x => x.본문)
  if (!후보.length) return ''

  let 남음 = 예산 - 블록머리.length
  const 건당 = Math.floor(남음 / 후보.length)
  const 대상 = 건당 >= 최소발췌
    ? 후보
    : 후보.slice(0, Math.max(1, Math.floor(남음 / 최소발췌)))

  const 블록s: string[] = []
  // 한 건씩 실제 길이를 빼며 진행한다 — 예산이 추정치가 아니라 진짜 천장이 되도록.
  대상.forEach(({ row, 본문 }, i) => {
    const 남은건수 = 대상.length - i
    if (남음 < 최소발췌) return

    const 이름 = 행값(row, 'label')
    // 머리글 몫을 미리 떼고 본문 몫을 계산한다.
    const 머리여유 = 이름.length + 40
    const 몫 = Math.max(0, Math.floor(남음 / 남은건수) - 머리여유)
    const 발췌 = 스니펫추출(본문, 정규식s, 몫)
    if (!발췌) return

    // 잘랐다는 사실을 반드시 적는다 — 답변 LLM이 "발췌본입니다, 범위를 좁혀주세요"로
    // 되받을 수 있어야 재협상이 별도 왕복 없이 대화 안에서 일어난다.
    const 머리 = 발췌.length >= 본문.length
      ? `${i + 1}. ${이름} (전문 ${본문.length.toLocaleString()}자)`
      : `${i + 1}. ${이름} (전문 ${본문.length.toLocaleString()}자 중 ${발췌.length.toLocaleString()}자 발췌)`

    const 블록 = `${머리}\n${발췌}`
    if (블록.length + 2 > 남음) return
    남음 -= 블록.length + 2
    블록s.push(블록)
  })

  if (!블록s.length) return ''

  const 남은건수 = 후보.length - 블록s.length
  const 꼬리 = 남은건수 > 0 ? `\n(나머지 ${남은건수}건은 본문 생략 — 조건을 더 좁히면 본문을 볼 수 있다)` : ''
  return `${블록머리}${블록s.join('\n\n')}${꼬리}`
}

/** 임의의 모델 저장소 → AiSource. 모델별 코드가 필요 없다. */
export function fromRepo(repo: PlannableRepo, options: FromRepoOptions): AiSource {
  const {
    fields,
    본문필드,
    label = repo.tableName,
    limit = 300,
    예산 = 기본예산,
    셀상한 = 기본셀상한,
    행동 = [],
    링크
  } = options

  return {
    key: repo.tableName,
    label,
    행동키s: 행동,
    load: repo.reads ? () => repo.reads!() : undefined,

    // 행동 목록도 어휘에 싣는다. 키가 한국어라 따로 설명이 필요 없고, 소스당 몇 개뿐이라 크기도 상수다.
    vocabulary: () => 어휘블록(repo, label, { 본문필드 })
      + (행동.length ? `\n행동: ${행동.join(' | ')}` : ''),

    enumerate: () => 어휘열거(repo),

    run: (plan, max = 20) => {
      const { rows, 적용, 무시 } = 계획실행(repo, plan)
      const 조건 = 적용.length ? 적용.join(', ') : '없음'
      // 건수는 앱이 센 값이다. LLM이 다시 세지 않도록 헤더에 명시한다.
      const head = `[${label}] 조건(${조건}) 결과`

      const 표 = 표만들기(head, rows, fields, { 최대건수: max, 예산, 셀상한 })

      const 발췌 = 본문필드
        ? 발췌만들기(표.행s, 본문필드, 검색정규식s(plan.검색어s ?? []), 예산 - 표.text.length)
        : ''

      const 경고 = 무시.length ? `\n(인식 못한 조건 무시: ${무시.join(', ')})` : ''

      return {
        text: 표.text + 발췌 + 경고,
        총건수: 표.총건수,
        is발췌: !!발췌,
        항목s: 표.행s.map(row => ({
          id: 행id(row),
          source: repo.tableName,
          label: 행값(row, 'label'),
          sub: 행값(row, 'sub'),
          뱃지s: 행뱃지s(row),
          has본문: !!본문필드 && !!행값(row, 본문필드),
          to: 링크?.(row) || undefined,
          row
        }))
      }
    },

    toText: () => {
      const all = (toValue(repo.list) ?? []) as any[]
      if (!all.length) return ''
      // 폴백에는 본문을 절대 싣지 않는다 — 문서 한 건이 회원 300건보다 크다.
      return 표만들기(`[${label}]`, all, fields, { 최대건수: limit, 예산, 셀상한 }).text
    }
  }
}

/** 소스들을 적재한 뒤 하나의 프롬프트 블록으로 합친다. */
export async function buildContext(sources: AiSource[]): Promise<string> {
  await Promise.all(sources.map(s => s.load?.()))
  return sources.map(s => s.toText()).filter(Boolean).join('\n\n')
}

import { toValue } from 'vue'
// 타입만 가져온다(런타임 의존 없음) — 이름·모양이 모델과 어긋나지 않게 하는 게 목적.
import type { i정렬조건, i필터라디오그룹 } from '../models/BaseModels2.types'
// 순수 문자열 유틸(모델도 AI도 모른다). 목록5 검색창과 같은 함수를 쓴다.
import { 검색정규식s, 검색평가, 행값 } from '../etc/textSearch'

/**
 * LLM이 뱉는 "조회 계획". 행 데이터 대신 이걸 받아서 앱이 직접 실행한다.
 * 집계는 앱이 하므로 LLM이 수만 건을 세다 틀릴 일이 없다.
 *
 * 필드명은 모델(`BaseModels2`)의 `필터조건ss`/`정렬조건s`/`검색필드s`에서 그대로 따온다.
 * 목록5가 같은 이름을 읽어 화면을 그리므로, "화면에서 되는 건 챗봇에서도 된다"가 이름만 봐도 성립한다.
 */
export interface Plan {
  /** 어느 소스를 조회할지 (AiSource.key) */
  source: string
  /**
   * `"축=값"` = `"필터조건ss[].title=options[].label"`. 축끼리 AND — `view/목록5/목록5.vue` 의 필터 조합 의미와 동일.
   *
   * 축과 값을 따로 두면 모델이 축만 고르고 값을 빠뜨려 필터가 통째로 무시된다(실측됨).
   * 그래서 `"축=값"` 한 문자열을 enum으로 닫아 **반쪽짜리 조건이 문법적으로 불가능**하게 만든다.
   */
  필터조건s?: string[]
  /**
   * 자유 키워드. `필터조건s`와 달리 **enum으로 닫지 않는다.**
   *
   * 닫았던 이유(반쪽 조건 방지)가 여기엔 없다 — 자유 문자열은 반쪽이 될 수가 없고,
   * 최악이 0건인데 그건 앱이 감지해서 알려줄 수 있다. `검색필드s`를 선언한 소스에만 걸린다.
   */
  검색어s?: string[]
  /** `정렬조건s[].label`. 검색어가 있는데 이게 비면 관련도순이 기본이다. */
  정렬조건?: string
  /** 특정 행 하나를 지목(전문 요청). 직전 턴이 돌려준 id 중에서만 고를 수 있게 enum으로 닫는다. */
  대상id?: string
  /**
   * 실행을 **지목**한 행동(`do*`) 키. 명령이 아니다.
   *
   * 계획 시점에는 이 조건이 몇 건에 걸릴지도, 그 행에서 그 행동이 지금 가능한지(`show`)도 알 수 없다.
   * 그래서 여기 담긴 건 희망사항이고, 실제 가용성 판정은 계획 실행 뒤 앱이 한다 —
   * `필터조건s`를 enum으로 닫아두고도 `계획실행`이 다시 검증해 `무시`에 적는 것과 같은 구조다.
   */
  행동?: string
  /**
   * 지목한 행동에 딸려 보낼 초안(`i행동초안`). 이 계획에서 **유일하게 조회가 아닌** 항목이다.
   *
   * "오늘 3~4시에 점검한다고 공지해"의 뒷부분이 여기 담긴다. 이게 없으면 챗봇이 열어주는 건
   * 빈 글쓰기 폼이고, 사용자는 방금 말한 걸 다시 타이핑하게 된다.
   * 행동과 마찬가지로 **제안**이다 — 폼을 채울 뿐, 등록은 사용자가 화면에서 누른다.
   */
  초안?: { 제목?: string, 본문?: string }
  /**
   * **지금 편집 중인 것**(`i작업대상`)에 걸 행동(`do*`) 키. 조회 축과 자리를 따로 둔 게 요점이다.
   *
   * `행동`은 "조회로 찾아낸 행"에 걸리지만, 글쓰기 화면에서 쓰고 있는 새 글은 조회로 영영 못 찾는다
   * (행이 아니다). 같은 키를 한 자리에 두면 "이 글 고쳐줘"의 대상이 화면인지 검색 결과인지 가려낼
   * 방법이 없어진다 — `필터조건s`를 `"축=값"`으로 닫아 반쪽 조건을 불가능하게 만든 것과 같은 처방이다.
   */
  작업행동?: string
  /**
   * `작업행동`에 그대로 넘길 사용자의 말("더 짧게", "9월 3일 맥주 축제 공지").
   *
   * 계획이 글을 쓰지 않는다 — 쓰는 건 그 `do*`가 자기 프롬프트로 한다(`model회원게시글.doAI초안`).
   * `초안`과 다른 점이 이것이다. 저쪽은 화면이 없어 계획이 대신 써야 하지만, 이쪽은 고칠 글이
   * 이미 화면에 있고 그 전문은 계획 호출에 실리지도 않는다.
   */
  작업지시?: string
  intent?: 'count' | 'list' | 'read'
  limit?: number
}

/**
 * 조회 계획을 세울 수 있는 저장소 = `BaseModels2`가 이미 공개하는 것만 요구한다.
 *
 * 클래스를 import하지 않고 타입만 맞춘다(런타임 의존 없음). 이름을 모델과 똑같이 두었으므로
 * AI 전용 별칭(`필터그룹ss` 등)은 더 이상 없다 — 모델에 축을 추가하면 화면과 챗봇에 동시에 잡힌다.
 */
export interface PlannableRepo {
  tableName: string
  list: unknown
  reads?: (isBrief?: boolean, force?: boolean) => Promise<unknown>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  필터조건ss?: i필터라디오그룹<any>[]
  정렬조건s?: i정렬조건[]
  검색필드s?: string[]
}

/* eslint-disable @typescript-eslint/no-explicit-any */

const rowsOf = (repo: PlannableRepo) => (toValue(repo.list) ?? []) as any[]

/** 어휘로 노출할 축 — `title`이 있어야 "축=값"으로 지칭할 수 있다. */
const 축s = (repo: PlannableRepo) => (repo.필터조건ss ?? []).filter(g => g.title && g.options?.length)

/** '전체'는 필터를 안 거는 옵션이라 어휘에서 뺀다. */
const 옵션s = (g: i필터라디오그룹<any>) => g.options.filter(o => o.label !== '전체')

/** 행 식별자. 모델은 `stateId`, 생 dto는 `id`. */
export const 행id = (row: any) => String(row?.stateId ?? row?.id ?? '')

/** 옵션 하나가 몇 건에 걸리는지. dashboard.vue가 하던 계산과 동일. */
function 옵션건수(rows: any[], option: i필터라디오그룹<any>['options'][number]) {
  return rows.reduce((합계, row, index) => {
    if (row == null) return 합계
    try {
      return option.match(row, index) ? 합계 + 1 : 합계
    } catch {
      return 합계
    }
  }, 0)
}

export interface 어휘옵션 {
  /** 스니펫·전문을 뽑을 본문 게터명. 주면 어휘에 "분량"이 붙어 계획 단계가 깊이를 가늠할 수 있다. */
  본문필드?: string
}

/**
 * 소스가 "무엇을 할 수 있는지"를 적은 블록. 행은 한 줄도 넣지 않으므로
 * 회원이 8명이든 10만명이든 크기가 거의 같다.
 *
 * 본문 분량을 여기 적는 이유: 계획 수립 호출은 **답변 전에 어차피 일어나므로**,
 * 깊이(목록/발췌/전문)를 여기서 정하면 승인 왕복을 따로 둘 필요가 없다.
 */
export function 어휘블록(repo: PlannableRepo, label: string, opts?: 어휘옵션): string {
  const rows = rowsOf(repo)

  const 축설명 = 축s(repo).map((g) => {
    const opts = 옵션s(g).map(o => `${o.label}(${옵션건수(rows, o)})`).join(' | ')
    return `- ${g.title}: ${opts}`
  })

  const 정렬 = (repo.정렬조건s ?? []).map(s => s.label).join(' | ')
  const 검색 = repo.검색필드s?.length
    ? `검색어s: 자유 키워드(${repo.검색필드s.join('·')}를 훑는다)`
    : ''

  return [
    `[${label}] key=${repo.tableName}, 총 ${rows.length}건`,
    축설명.length ? '필터 조건(필터조건s에는 "축=값" 형식으로. 축끼리 AND):' : '',
    ...축설명,
    검색,
    정렬 ? `정렬조건: ${정렬}` : '',
    분량블록(rows, opts?.본문필드)
  ].filter(Boolean).join('\n')
}

/** 본문이 있는 소스의 규모. 계획 단계가 "전문을 요구해도 되는지"를 가늠하는 유일한 단서다. */
function 분량블록(rows: any[], 본문필드?: string): string {
  if (!본문필드 || !rows.length) return ''
  let 합계 = 0
  let 최대 = 0
  let 보유 = 0
  for (const row of rows) {
    const n = 행값(row, 본문필드).length
    if (!n) continue
    보유++
    합계 += n
    if (n > 최대) 최대 = n
  }
  if (!보유) return ''
  return `본문: ${보유}건 보유, 평균 ${Math.round(합계 / 보유).toLocaleString()}자, 최대 ${최대.toLocaleString()}자`
}

export interface 어휘열거결과 {
  /** `"축=값"` 완성형 조건. 이걸 enum으로 닫으면 축-값 불일치도 반쪽 조건도 불가능해진다. */
  조건s: string[]
  정렬s: string[]
}

/** 어휘에 실제로 존재하는 조건/정렬만 모은다 — responseSchema의 enum으로 쓴다. */
export function 어휘열거(repo: PlannableRepo): 어휘열거결과 {
  return {
    조건s: 축s(repo).flatMap(g => 옵션s(g).map(o => `${g.title}=${o.label}`)),
    정렬s: (repo.정렬조건s ?? []).map(s => s.label)
  }
}

export interface 계획실행결과 {
  rows: any[]
  적용: string[]
  무시: string[]
  /** 관련도순으로 정렬돼 있는지. 발췌를 상위부터 배분할지 판단에 쓴다. */
  is관련도순: boolean
}

/**
 * 계획 실행. enum을 벗어난 값이 들어와도(스키마 미지원 모델 대비) 여기서 걸러진다.
 *
 * 순서는 **대상 지목 → 필터 → 검색 → 정렬**.
 * 필터(닫힌 축)로 먼저 좁히고 검색(열린 축)을 거는 건 비용·의미 둘 다 그게 맞다.
 */
export function 계획실행(repo: PlannableRepo, plan: Plan): 계획실행결과 {
  const 전체 = rowsOf(repo)
  const 적용: string[] = []
  const 무시: string[] = []

  // 0. 전문 요청("그거 전문 보여줘")은 직전 턴이 준 id를 지목한다.
  //    이번 턴의 필터·검색과 무관하게 전체에서 찾는다 — 후속 질문은 조건을 다시 말해주지 않으므로.
  if (plan.대상id) {
    const 하나 = 전체.filter(row => 행id(row) === String(plan.대상id))
    if (하나.length) return { rows: 하나, 적용: [`대상=${plan.대상id}`], 무시, is관련도순: false }
    무시.push(`대상id=${plan.대상id}`)
  }

  let rows = 전체

  // 1. 필터 — 닫힌 축
  for (const 조건 of plan.필터조건s ?? []) {
    const idx = 조건.indexOf('=')
    const 축 = idx > 0 ? 조건.slice(0, idx) : ''
    const 값 = idx > 0 ? 조건.slice(idx + 1) : ''
    const g = 축s(repo).find(x => x.title === 축)
    // 어휘는 label로 뱉지만, 목록5가 쓰는 선택키(value)로 와도 받아준다.
    const o = g?.options.find(x => x.label === 값) ?? g?.options.find(x => x.value === 값)
    if (!o) {
      무시.push(조건)
      continue
    }
    rows = rows.filter((row, i) => {
      try {
        return o.match(row, i)
      } catch {
        return false
      }
    })
    적용.push(조건)
  }

  // 2. 검색 — 열린 축. 탈락시키는 동시에 관련도로 줄을 세운다.
  let is관련도순 = false
  const 키워드s = (plan.검색어s ?? []).map(s => String(s ?? '').trim()).filter(Boolean)
  if (키워드s.length) {
    const 필드s = repo.검색필드s ?? []
    if (!필드s.length) {
      무시.push(`검색어s=${키워드s.join(',')}`)
    } else {
      const 정규식s = 검색정규식s(키워드s)
      rows = rows
        .map(row => ({ row, 점수: 검색평가(row, 필드s, 정규식s)?.점수 ?? -1 }))
        .filter(x => x.점수 >= 0)
        .toSorted((a, b) => b.점수 - a.점수)
        .map(x => x.row)
      적용.push(`검색=${키워드s.join(' ')}`)
      is관련도순 = true
    }
  }

  // 3. 정렬 — 명시 정렬이 오면 관련도순을 덮는다("최신순으로"라고 했으면 그게 맞다).
  if (plan.정렬조건) {
    const s = (repo.정렬조건s ?? []).find(x => x.label === plan.정렬조건)
      ?? (repo.정렬조건s ?? []).find(x => x.value === plan.정렬조건)
    if (s) {
      rows = rows.toSorted(s.func)
      적용.push(`정렬조건=${s.label}`)
      is관련도순 = false
    } else {
      무시.push(`정렬조건=${plan.정렬조건}`)
    }
  }

  return { rows, 적용, 무시, is관련도순 }
}

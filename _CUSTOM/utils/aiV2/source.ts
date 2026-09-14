import { toValue } from 'vue'
import { 계획실행V2, 행idV2, type PlanV2, type RepoV2 } from './plan'
import { 행값 } from '../etc/textSearch'
import { 필터조건찾기, 필터축이름, 필터축쿼리키 } from '../models/BaseModels2.types'
import { 선택지of값, 수정가능필드s, 값s적용, type i수정필드 } from '../etc/필드수정'

/** 프롬프트에 실제로 올라간 행 하나. */
export interface i항목V2 {
  id: string
  /** 이 행이 나온 소스 키. 다음 턴이 `대상id`로 지목했을 때 소스를 되찾는 데 쓴다. */
  source: string
  label: string
  sub: string
  /**
   * 그 행(모델 인스턴스). 앱이 행동 버튼을 만들 때만 쓴다.
   * **LLM에는 절대 가지 않는다** — 프롬프트로 나가는 건 `label`뿐이다.
   */
  row?: unknown
}

export interface i실행V2 {
  text: string
  항목s: i항목V2[]
  /** 조건에 걸린 **전체** 건수. `항목s.length`(상한에 맞춰 잘린 수)와 다르다. */
  총건수: number
}

/**
 * aiV2가 참조할 데이터 한 덩어리. 파이프라인 지도는 `./README.md`.
 *
 * 이 파일은 모델도(`~models/*`) AI도(`server/utils/ai`) import하지 않는다 —
 * 모델과 코파일럿은 서로를 모른 채 이 타입 하나만 공유한다.
 */
export interface i소스V2 {
  key: string
  label: string
  /** 이 소스를 그리는 화면의 경로. 없으면 화면이 없는 것으로 쳐서 선택도 추가도 안 켠다. */
  path?: string
  /** 프롬프트를 만들기 직전 1회. 적재가 필요하면 여기서. */
  load?: () => Promise<unknown>
  /** 이 소스로 무엇을 할 수 있는지. 행은 넣지 않으므로 크기가 건수와 무관하다. */
  어휘: () => string
  /** 계획 실행 → 결과 텍스트와 항목들. */
  조회: (plan: PlanV2, max?: number) => i실행V2
  /**
   * 계획의 조회 조건 → **화면 주소의 쿼리**(`?q=` · `?sort=` · `?f_<축>=`).
   *
   * 도우미가 화면을 모는 **유일한 방법**이다. 키는 목록5와 같은 `필터축쿼리키`로 만든다 —
   * 두 벌이면 이름이 갈린다. 기본값은 안 담는다(주소에는 벗어난 것만 적는다).
   */
  조회쿼리: (plan: PlanV2) => Record<string, string>
  /**
   * 주소의 `?f_<축>=`들을 계획 어휘(`"축=값"`)로 되돌린다. **`조회쿼리`의 역함수다.**
   *
   * 도우미가 앞 턴의 조건을 기억하지 않아도 되는 이유다 — 이어받을 조건은 이미 주소에 적혀 있다.
   * 도우미가 따로 들면 화면과 갈리지만, 화면이 든 것을 읽으면 갈릴 자리가 없다.
   * (주소는 옵션의 `value`, 어휘는 `label`이라 그 되돌림도 여기서 한다.)
   */
  쿼리필터s: (query: Record<string, unknown>) => string[]
  /** 계획 스키마가 닫을 `"축=값"` 목록. 비면 이 소스에는 필터 축이 없다. */
  필터어휘s: () => string[]
  /** 계획 스키마가 닫을 정렬 이름들. */
  정렬어휘s: () => string[]
  /**
   * 상세 폼의 묶음(탭) 이름들. **둘 이상일 때만 준다** — 하나뿐이면 탭이랄 게 없다.
   * 행이 아니라 정의라 건수를 따라 안 자란다. 여는 이유는 탭이 주소에 살기 때문이다(`목록5`의 `?tab=`).
   */
  탭어휘s: () => string[]
  /**
   * 코파일럿이 **제안할 수 있는** 행동(`do*`) 화이트리스트. 기본은 비어 있다 —
   * 모델에 `do*`를 추가했다고 권한이 따라 늘면 안 된다(여는 건 `sources.ts`).
   */
  행동키s: string[]
  /**
   * 목록에 **초안 행**들을 끼운다. **없으면 이 소스에는 추가가 없다** — `행동키s`와 같은 규율이다.
   * 저장소에 `empty`가 있어도 `sources.ts`가 켜주지 않으면 도우미는 만들지 못한다.
   *
   * 서버에 아무것도 안 보낸다. 화면의 추가 버튼이 놓는 것과 **같은 빈 줄**이고 저장은 사람이 누른다.
   *
   * **한 번에 여럿이다.** "채소 3개 추가해"가 실재하는 말이라, 한 건짜리 시그니처를 두면
   * 부르는 쪽이 루프를 돌며 같은 판단(무엇을 앉힐지)을 반복하게 된다. 값 뭉치 하나가 행 하나다.
   * 돌려주는 `i항목V2`의 식별자는 `rowKey`다(`행idV2`) — 부르는 쪽이 곧바로 그 행을 열기 때문이다.
   */
  초안?: (값s목록: Record<string, unknown>[]) => Promise<i항목V2[]>
  /**
   * 도우미가 값을 다룰 수 있는 칸들. **비어 있으면 이 소스에는 수정이 없다.**
   *
   * 권한(`sources.ts`의 `수정`)과 능력(행의 `자동필드ss`에서 `canEdit !== false`)의 **교집합**이다.
   * 능력이 저장소가 아니라 **행**에 있어서(칸을 아는 건 행이다) 목록이 비어 있는 동안에는 이것도 비어 있다.
   */
  수정필드s: i수정필드[]
}

export interface FromRepoV2Options {
  label?: string
  /** 이 소스를 그리는 화면 경로. 선택을 화면으로 옮기려면 필요하다. */
  path?: string
  /**
   * 이 목록에 무엇이 들었는지 한 줄. **행이 아니라 종류를 말한다.**
   *
   * `고양이`는 어느 목록인지 스스로 말하지 않는다. 그렇다고 라벨을 실으면 어휘 크기가
   * 행 수를 따라 자란다 — 소스당 한 줄이면 건수와 무관하다.
   */
  설명?: string
  /** 코파일럿이 제안할 수 있는 행동 키. 안 주면 이 소스에는 행동이 없다. */
  행동?: string[]
  /**
   * 새 항목 추가를 허용할지. 저장소에 `empty`가, 이 소스에 `path`가 있어야 실제로 켜진다 —
   * 만든 초안은 화면에서 채워야 하는데, 그릴 화면이 없으면 아무 데도 못 여는 빈 줄만 남는다.
   */
  생성?: boolean
  /**
   * 도우미가 고쳐도 되는 칸의 `key` 목록. 안 주면 이 소스에는 수정이 없다 — `행동`과 같은 규율로,
   * 모델이 칸을 열어뒀다고(`canEdit`) 도우미 권한이 따라 늘면 안 된다.
   *
   * 하나라도 적으면 `행동키s`에 `do수정`이 **자동으로 들어간다.** 두 곳에 나눠 적게 하면
   * 칸만 열고 행동을 빼먹은 소스가 생기는데, 그건 눌러도 아무 일이 없는 조합이다.
   */
  수정?: string[]
  /**
   * 어휘에 **지금 값**까지 실을지. 기본 꺼짐.
   *
   * 켜는 이유는 상대적인 말이다 — "좀 줄여"·"한 칸만 더"는 지금이 어디인지 알아야 풀린다.
   * 행이 하나뿐인 소스(설정 한 벌)에서는 값 몇 개가 영원히 몇 개라 어휘가 안 자란다.
   *
   * **여러 행짜리 소스에는 켜지 말 것.** 그 순간 어휘 크기가 건수를 따라 자라고,
   * 이 구조가 존재하는 이유가 첫 줄부터 무너진다(`README.md`).
   */
  현재값?: boolean
}

/** 결과 텍스트 상한(문자). v2 표는 `label` 한 열이라 넉넉하지만, 천장은 있어야 한다. */
const 예산 = 2000

/* eslint-disable @typescript-eslint/no-explicit-any */

/** 임의의 모델 저장소 → aiV2 소스. 모델별 코드가 필요 없다. */
export function fromRepoV2(repo: RepoV2, options: FromRepoV2Options = {}): i소스V2 {
  const { label = repo.tableName, path, 설명, 행동 = [], 생성 = false, 수정 = [], 현재값 = false } = options
  // 권한(옵션)·능력(저장소의 `empty`)·**놓을 자리**(`path`)가 셋 다 있어야 켠다. 하나라도 빠진 채
  // 켜면 "추가할 수 있다"고 어휘에 적어놓고 눌렀을 때 아무 일도 안 하는 버튼이 된다.
  const can초안 = 생성 && !!path && typeof repo.empty === 'function'

  /**
   * 칸을 아는 건 행이라 목록에서 한 줄 빌려 읽는다. 적재 전에는 비는데 그게 맞다 —
   * 고칠 행이 없는 소스에 무슨 칸을 고칠 수 있다고 적어봐야 할 말이 아니다.
   */
  const 열린필드s = (): i수정필드[] => {
    if (!수정.length) return []
    const 표본 = ((toValue(repo.list) ?? []) as any[])[0]
    return 수정가능필드s(표본).filter(f => 수정.includes(f.key))
  }

  /**
   * 묶음(탭) 라벨들. 아는 건 행이라 목록에서 한 줄 빌려 읽고, `show`는 상세5와 같은 것을 쓴다.
   * 하나뿐이면 빈 배열 — 자리가 있으면 lite 는 채우려 든다(`계획스키마V2`의 같은 규율).
   */
  const 탭s = (): string[] => {
    const 표본 = ((toValue(repo.list) ?? []) as any[])[0]
    const 라벨s = ((표본?.자동필드ss ?? []) as any[])
      .filter(g => toValue(g?.show ?? true))
      .map(g => String(g?.label ?? ''))
      .filter(Boolean)
    return 라벨s.length > 1 ? 라벨s : []
  }

  const 축s = () => (repo.필터조건ss ?? []).filter(g => (g.title || g.key) && g.options?.length)
  const 정렬s = () => repo.정렬조건s ?? []

  /** 옵션 하나가 몇 건에 걸리는지. 어휘에 적어두면 계획이 "0건인 축"을 안 고른다. */
  const 옵션건수 = (rows: any[], o: { match: (row: any, i: number) => boolean }) =>
    rows.reduce((n, row, i) => {
      if (row == null) return n
      try {
        return o.match(row, i) ? n + 1 : n
      } catch {
        return n
      }
    }, 0)

  /** 행 하나 → 프롬프트·버튼이 쓰는 항목. 만들기와 조회가 같은 모양을 내야 다음 턴의 지목이 맞는다. */
  const 항목 = (row: any): i항목V2 => ({
    id: 행idV2(row),
    source: repo.tableName,
    label: 행값(row, 'label'),
    sub: 행값(row, 'sub'),
    row
  })

  return {
    key: repo.tableName,
    label,
    path,
    // 칸을 열었으면 그걸 고칠 행동도 같이 열린다. 따로 적게 하면 반드시 한쪽을 빼먹는다.
    행동키s: 수정.length ? [...행동, 'do수정'] : 행동,

    get 수정필드s() { return 열린필드s() },
    load: repo.reads ? () => repo.reads!() : undefined,

    초안: can초안
      ? async (값s목록) => {
        const 만든s: i항목V2[] = []
        for (const 값s of 값s목록) {
          const row = await repo.empty!()
          if (!row) continue
          // 값은 만든 **뒤에** 앉힌다. `empty`는 빈 줄을 놓는 일만 알고, 무엇을 채울지는 계획이 안다.
          값s적용(row, 값s)
          만든s.push(항목(row))
        }
        return 만든s
      }
      : undefined,

    // 건수까지만 싣는다. 라벨을 통째로 실으면 어휘 크기가 행 수를 따라 자라고,
    // 그러면 이 파이프라인이 존재하는 이유(행은 LLM에 안 간다)가 첫 줄부터 무너진다.
    필터어휘s: () => 축s().flatMap(g => g.options.map(o => `${필터축이름(g)}=${o.label}`)),
    정렬어휘s: () => 정렬s().map(x => x.label),
    탭어휘s: 탭s,

    조회쿼리: (plan) => {
      const out: Record<string, string> = {}

      const 키워드 = String(plan.검색어 ?? '').trim()
      if (키워드) out.q = 키워드

      // 기본 정렬은 안 적는다 — 화면이 어차피 그걸로 그린다(목록5의 같은 규칙과 짝이다).
      const 정렬 = 정렬s().find(x => x.label === plan.정렬조건)
      if (정렬 && 정렬.value !== 정렬s()[0]?.value) out.sort = 정렬.value

      for (const 조건 of plan.필터s ?? []) {
        const 짝 = 필터조건찾기(repo.필터조건ss ?? [], String(조건 ?? ''))
        if (짝) out[필터축쿼리키(짝.그룹)] = 짝.옵션.value
      }
      return out
    },

    // 축을 훑어 되돌린다(쿼리 키를 파싱하지 않는다). 키를 만드는 쪽과 읽는 쪽이 같은
    // `필터축쿼리키`를 쓰므로, 축 이름이 바뀌어도 두 방향이 같이 움직인다.
    쿼리필터s: (query) => {
      const out: string[] = []
      for (const g of 축s()) {
        const raw = query[필터축쿼리키(g)]
        const v = String((Array.isArray(raw) ? raw[0] : raw) ?? '')
        if (!v) continue
        const 옵션 = g.options.find(o => String(o.value) === v)
        if (옵션) out.push(`${필터축이름(g)}=${옵션.label}`)
      }
      return out
    },

    어휘: () => [
      `[${label}] key=${repo.tableName}, 총 ${((toValue(repo.list) ?? []) as any[]).length}건`,
      설명 ? `내용: ${설명}` : '',
      // 축·옵션은 **정의**라 건수를 따라 자라지 않는다. 걸리는 건수만 옆에 적어 0건인 축을 안 고르게 한다.
      ...(축s().length
        ? ['필터s(축끼리 AND, "축=값" 형식):',
            ...축s().map((g) => {
              const rows = (toValue(repo.list) ?? []) as any[]
              return `- ${필터축이름(g)}: ${g.options.map(o => `${o.label}(${옵션건수(rows, o)})`).join(' | ')}`
            })]
        : []),
      repo.검색필드s?.length
        ? `검색어: 자유 키워드(${repo.검색필드s.join('·')}를 훑는다)`
        : '검색어: 이름(label) 부분일치',
      정렬s().length > 1 ? `정렬조건: ${정렬s().map(x => x.label).join(' | ')}` : '',
      행동.length ? `행동: ${행동.join(' | ')}` : '',
      // 묶음은 **여는 화면의 생김새**라 조회 조건이 아니다. 한 건을 열 때만 뜻이 있어서
      // 그 사실을 그대로 적는다 — 안 적으면 계획이 이 이름을 검색어로 흘린다("성격" 0건).
      (() => {
        // `자동필드ss`는 getter라 부를 때마다 옵션 배열을 다시 만든다. 한 번만 부른다.
        const ts = 탭s()
        return ts.length ? `묶음(한 건을 열 때만): ${ts.join(' | ')}` : ''
      })(),
      can초안 ? '추가: 새 항목을 만들 수 있다' : '',
      // 칸 이름은 행이 아니라 **정의**라 건수를 따라 자라지 않는다. 그래서 어휘에 실을 수 있다.
      // **키가 아니라 라벨을 적는다.** 실측: 키로 열어두니 "사과 이름 홍옥으로"에 lite 가 사람 말
      // 그대로 `이름`을 냈고, enum에 없는 값이라 그 턴이 통째로 "지원하지 않습니다"가 됐다.
      // **닫힌 칸은 고를 것을 같이 적는다** — 안 적으면 계획이 `열매줄기` 같은 값을 내고 턴이 죽는다.
      (() => {
        const fs = 열린필드s()
        if (!fs.length) return ''
        const 적기 = (f: i수정필드) =>
          f.선택지?.length
            ? `${f.label}{${f.선택지.map(o => o.label).join('/')}}`
            : f.label + (f.타입 === '문자' ? '' : `[${f.타입}]`)
        return `수정: ${fs.map(적기).join(' | ')}`
      })(),
      // 지금 값 — `현재값`을 켠 소스(행이 하나인 설정 표)에만 붙는다. 옵션 머리말 참고.
      (() => {
        if (!현재값) return ''
        const 행 = ((toValue(repo.list) ?? []) as any[])[0]
        const fs = 열린필드s()
        if (!행 || !fs.length) return ''
        const 지금 = (f: i수정필드) => {
          const v = (행 as Record<string, unknown>)[f.key]
          return `${f.label}=${선택지of값(f, v)?.label ?? String(v ?? '')}`
        }
        return `지금 값: ${fs.map(지금).join(' | ')}`
      })()
    ].filter(Boolean).join('\n'),

    조회: (plan, max = 20) => {
      const { rows, 적용 } = 계획실행V2(repo, plan)
      const 조건 = 적용.length ? 적용.join(', ') : '없음'
      // 건수는 앱이 센 값이다. LLM이 다시 세지 않도록 헤더에 명시한다.
      const head = `[${label}] 조건(${조건}) 결과 총 ${rows.length}건`

      const 담을s: any[] = []
      let 남음 = 예산 - head.length
      for (const row of rows.slice(0, max)) {
        const 줄 = 행값(row, 'label')
        if (줄.length + 1 > 남음) break
        남음 -= 줄.length + 1
        담을s.push(row)
      }

      const 잘림 = rows.length > 담을s.length ? ` (상위 ${담을s.length}건만 표시)` : ''

      return {
        text: [head + 잘림, ...담을s.map(row => 행값(row, 'label'))].join('\n'),
        총건수: rows.length,
        항목s: 담을s.map(항목)
      }
    }
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
import { toValue } from 'vue'
import type { ModalFieldStep } from '~/composables/useModal'

/**
 * 행 하나의 **여러 칸을 한 번에** 고치는 장치.
 *
 * 처음엔 `필드=값` 한 줄을 행동 버튼에 실어 보냈다. `i행동버튼.onClick`이 값 한 칸만 나르기
 * 때문이었는데, 그 한 칸이 곧 **한 번에 한 필드**라는 제약이 됐다. 모델의 필수 칸이 둘이면
 * (과일의 `label`+`원산지`) 셋일 수도 있다는 뜻이고, 그때 단일 입력창은 답이 아니다.
 *
 * 그래서 값은 버튼이 아니라 **모듈 스코프 핸드오프**로 넘기고(`수정안두기`), 확정은
 * `useModalFields` 한 판으로 받는다. 칸이 몇이든 같은 장치다.
 */

/** 값을 어떻게 받아야 하는가. 컴포넌트 이름에서 유도한다 — 세 갈래면 충분하다. */
export type i수정타입 = '문자' | '숫자' | '날짜'

/** 닫힌 칸의 선택지 하나. `자동필드ss`의 `options`(= 목록5 폼이 쓰는 그 배열) 그대로다. */
export interface i수정선택지 { label: string, value: string | number | boolean }

/**
 * 한 행에서 고칠 수 있는 칸 하나. `자동필드ss`가 이미 아는 것을 옮겨 적을 뿐이다.
 *
 * `선택지`가 있으면 **닫힌 칸**이다. 2026-09-05까지 이 자리가 비어 있어서, 화면 폼에서는
 * 선택기로 닫히는 칸(`채소.먹는곳`·`과일.분류`·`동물.식성`)이 도우미 경로에서만 자유 문자였다 —
 * `열매줄기` 같은 값이 그대로 setter로 들어가 **필터에 안 걸리는 행**이 조용히 생겼다.
 */
export interface i수정필드 { key: string, label: string, 타입: i수정타입, 선택지?: readonly i수정선택지[] }

const 숫자컴포s = new Set(['Input숫자', 'Input숫자2'])
const 날짜컴포s = new Set(['Input날짜', 'Input날짜시간', 'Input월선택', 'Input시간'])

const 타입of = (comp?: string): i수정타입 =>
  숫자컴포s.has(comp ?? '') ? '숫자' : 날짜컴포s.has(comp ?? '') ? '날짜' : '문자'

/**
 * 이 행이 **열어둔** 칸들. 권한이 아니라 능력이다 — 무엇을 도우미에게 열지는 `sources.ts`가 정한다.
 *
 * `canEdit: false`(과일의 `기록줄s`, 기록의 `대상Id`)는 폼에서 못 고치는 칸이고,
 * 도우미가 고칠 수 있어야 할 이유도 없다. 버튼필드(`타입지정.버튼`)도 값 칸이 아니라 뺀다.
 */
export function 수정가능필드s(row: any): i수정필드[] {
  const groups = (row?.자동필드ss ?? []) as any[]
  return groups
    .flatMap(g => (g?.list ?? []) as any[])
    .filter(spec => spec?.key && spec.canEdit !== false && spec.type?.name !== 'Input버튼')
    .map(spec => ({
      key: String(spec.key),
      label: String(spec.label ?? spec.key),
      타입: 타입of(spec.type?.name),
      // `getOptions`는 다른 칸 값에 따라 목록이 달라지는 자리다(계층 선택기). 여기서는 한 번 펴서
      // 들고 가는데, 도우미가 쓰는 순간의 목록이면 충분하고 폼은 어차피 자기가 다시 그린다.
      선택지: 선택지of(spec)
    }))
}

/** `자동필드ss` 한 칸의 선택지. 없으면 `undefined` — 그게 "열린 칸"이라는 뜻이다. */
function 선택지of(spec: any): readonly i수정선택지[] | undefined {
  // `options`는 `computed`일 수 있다(`ORM.i필드` 주석). 펴서 안 보면 그 칸은 "열린 칸"으로
  // 잘못 읽혀, 도우미가 선택지 있는 칸에 아무 문자열이나 넣게 된다.
  const raw = toValue(spec?.options) ?? (typeof spec?.getOptions === 'function' ? spec.getOptions() : undefined)
  if (!Array.isArray(raw) || !raw.length) return undefined
  return raw
    .filter((o: any) => o && o.label != null)
    .map((o: any) => ({ label: String(o.label), value: o.value ?? String(o.label) }))
}

/** 비교용 정규화 — 공백을 지운다. `열매 줄기`와 `열매줄기`를 갈라 되물을 이유가 없다. */
const 납작 = (v: unknown) => String(v ?? '').replace(/\s+/g, '').toLowerCase()

/**
 * 사람이 말한 것(라벨) → 그 칸의 선택지. **어휘는 라벨이고 내부 값은 앱의 것이다**는 규율의 짝이다.
 *
 * `value`로도 찾아준다 — 라벨과 값이 같은 표(`채소.먹는곳`)가 많아서 어느 쪽이 왔는지 따질 실익이 없다.
 */
export function 선택지찾기(필드: i수정필드 | undefined, 말: unknown): i수정선택지 | undefined {
  if (!필드?.선택지?.length) return undefined
  const s = 납작(말)
  if (!s) return undefined
  return 필드.선택지.find(o => 납작(o.label) === s) ?? 필드.선택지.find(o => 납작(o.value) === s)
}

/**
 * **이미 값인 것**(행이 들고 있는 값)으로 찾는다. `선택지찾기`와 방향이 반대다.
 *
 * 둘을 가른 이유는 실측이다(2026-09-05): 라벨이 숫자인 표(`테마`의 칸 번호)에서 라벨 우선으로
 * 찾으면 값 `"14"`가 **라벨이 `"14"`인 다른 칸**(값 `"13"`)에 걸린다. 사람 말은 라벨이고
 * 행이 든 것은 값이라, 어느 쪽에서 왔는지를 부르는 자리가 알고 골라야 한다.
 */
export function 선택지of값(필드: i수정필드 | undefined, 값: unknown): i수정선택지 | undefined {
  if (!필드?.선택지?.length) return undefined
  const s = 납작(값)
  if (!s) return undefined
  return 필드.선택지.find(o => 납작(o.value) === s)
}

/**
 * 계획이 낸 `{필드, 값}` 쌍들을 행에 적을 수 있는 모양(`{key: 값}`)으로 되돌린다.
 *
 * 닫힌 칸이면 라벨을 **내부 값**으로 바꾼다. 이 되돌림이 앱 몫인 이유는 `plan.ts` 머리말과 같다 —
 * `label`·`origin` 같은 내부 이름은 어휘가 아니고, 어휘로 열면 사람 말이 그대로 나와 턴이 죽는다.
 */
export function 값s되돌리기(쌍s: { 필드?: i수정필드, 값: string }[]): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {}
  for (const { 필드, 값 } of 쌍s) {
    if (!필드 || !String(값 ?? '').trim()) continue
    out[필드.key] = 선택지찾기(필드, 값)?.value ?? 값
  }
  return out
}

/** 숫자·날짜 칸에 들어갈 수 있는 값인가. 문자 칸은 무엇이든 받는다. */
export function 값받을수있나(필드: i수정필드, 값: string): boolean {
  const s = String(값 ?? '').trim()
  if (!s) return true // 비우는 것은 못 받을 값과 다른 사정이다. 막을지는 모델의 `beforeSave`가 정한다.
  // 닫힌 칸은 목록 밖을 못 받는다. 통과시키면 필터·정렬에서 영영 안 걸리는 행이 하나 생긴다.
  if (필드.선택지?.length) return !!선택지찾기(필드, s)
  if (필드.타입 === '숫자') return Number.isFinite(Number(s))
  if (필드.타입 === '날짜') return !Number.isNaN(new Date(s).getTime())
  return true
}

/**
 * 열린 칸 값들을 행에 적는다. 키는 칸의 `key`이고, **값을 다듬는 건 각 setter의 몫이다**
 * (`set 좋아요`가 숫자로 바꾸고 음수를 누른다). 새 행을 만드는 쪽이 쓴다 —
 * 필수 칸이 둘이든 넷이든 부르는 자리가 바뀌지 않는 게 요점이다.
 */
export function 값s적용(row: any, 값s: Record<string, unknown>) {
  Object.entries(값s).forEach(([k, v]) => {
    if (v !== undefined) row[k] = v
  })
}

/** 폼에 앉힐 값. 키는 칸의 `key`다. */
export interface i수정안 {
  /** 폼에 세울 칸들. 안 주면 행이 연 칸 전부. 도우미는 자기 화이트리스트만 준다. */
  칸s?: i수정필드[]
  /** 미리 채워 둘 값. 사용자가 이미 말한 것이다. */
  값s?: Record<string, string>
}

let 대기중: i수정안 | null = null

/**
 * 다음 `do필드폼` 한 번에만 쓰일 값을 놓아둔다. **일회성이다.**
 *
 * 버튼의 `onClick`이 무인자라 필요한 우회로다(v1의 `초안.ts`가 같은 이유로 있었다).
 * 놓고 곧바로 부르므로 그 사이에 다른 것이 끼어들 틈이 없고, 꺼내는 순간 비워지므로
 * 눌리지 않은 제안이 다음 번 폼에 새지 않는다.
 */
export function 수정안두기(안: i수정안) {
  대기중 = 안
}

function 수정안꺼내기(): i수정안 | null {
  const x = 대기중
  대기중 = null
  return x
}

/**
 * 칸들을 한 폼으로 받아 **바뀐 것만** 적으로 저장한다. 모델의 `do수정`이 이걸 부른다.
 *
 * **값을 다듬지 않는다** — 음수를 0으로 누르고 빈 칸을 NaN에서 건지는 일은 이미 각 모델의
 * setter가 하고 있다(`model과일.set 좋아요`). 여기서 한 번 더 손대면 규칙이 두 벌이 되고,
 * 두 벌은 반드시 갈라진다. 이 함수가 하는 일은 폼을 세우고, 못 받을 값을 막고, 저장하는 것뿐이다.
 *
 * 도우미가 값을 다 채워 왔더라도 폼은 **뜬다.** 칸이 여럿일 때 버튼 라벨로는 무엇이 무엇으로
 * 바뀌는지 보여줄 수 없고, 보이지 않는 것을 누르게 하면 그건 코파일럿이 아니라 대리 실행이다.
 */
export async function do필드폼(row: any): Promise<boolean> {
  if (import.meta.server) return false

  const 안 = 수정안꺼내기()
  const 칸s = 안?.칸s?.length ? 안.칸s : 수정가능필드s(row)
  if (!칸s.length) {
    useAlert().show('고칠 수 있는 칸이 없습니다', '')
    return false
  }

  const 지금값 = (f: i수정필드) => String(row?.[f.key] ?? '')

  /**
   * 닫힌 칸은 **선택기로 세운다.** 텍스트 상자로 세우면 화면 폼에서는 못 넣는 값이
   * 이 폼에서만 들어가고, 그 행은 필터에 안 걸린 채 목록에 남는다.
   * (`값받을수있나`가 이미 막지만, 애초에 고를 수 없게 하는 게 한 겹 앞이다.)
   */
  const 스텝 = (f: i수정필드): ModalFieldStep => {
    // 도우미가 채운 값은 **라벨**이고(`선택지찾기`), 행이 든 값은 **값**이다(`선택지of값`).
    // 한쪽으로만 찾으면 라벨이 숫자인 표에서 엉뚱한 칸이 미리 골라진다.
    const 제안 = 안?.값s?.[f.key]
    if (f.선택지?.length)
      return {
        key: f.key,
        kind: 'select',
        label: f.label,
        items: [...f.선택지],
        initialValue: (제안 != null ? 선택지찾기(f, 제안) : 선택지of값(f, 지금값(f)))?.value ?? null
      }
    const 지금 = 제안 ?? 지금값(f)
    return {
      key: f.key,
      kind: 'input',
      label: f.label,
      defaultValue: 지금,
      placeholder: f.타입 === '문자' ? '' : f.타입,
      trim: true
    }
  }

  const 값s = await useModalFields().open({
    title: `${row?.label ?? '항목'} 값수정`,
    description: 안?.값s ? '도우미가 채운 값입니다. 확인하고 저장하세요.' : undefined,
    confirmLabel: '저장',
    steps: 칸s.map(스텝)
  })
  if (!값s) return false

  // 손대지 않은 칸은 건드리지 않는다. 전부 다시 쓰면 setter가 도는 김에
  // 사용자가 만진 적 없는 값까지 정규화돼(공백·자릿수) 저장 이력이 지저분해진다.
  const 바뀐s = 칸s
    .map(f => ({ f, v: String(값s[f.key] ?? '') }))
    .filter(({ f, v }) => v !== 지금값(f))
  if (!바뀐s.length) return false

  const 못받음 = 바뀐s.find(({ f, v }) => !값받을수있나(f, v))
  if (못받음) {
    useAlert().error('그 값은 넣을 수 없습니다', `${못받음.f.label}은(는) ${못받음.f.타입} 칸입니다 — "${못받음.v}"`)
    return false
  }

  // 닫힌 칸은 선택기가 **내부 값**을 그대로 준다. 여기서 또 라벨로 찾으면(위 실측) 어긋난다.
  바뀐s.forEach(({ f, v }) => Object.assign(row, {
    [f.key]: f.선택지?.length ? v : f.타입 === '숫자' ? Number(v) : v
  }))
  return await row.do저장() === true
}

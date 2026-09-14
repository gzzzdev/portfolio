import {
  OX선택지s, create선택지, is선택형, is복수응답,
  type i답s, type i문항, type i문항유형, type i선택지
} from './types'

/**
 * jsonb 문항(`i문항`)을 다루는 **순수 함수 모음.** 클래스가 아니다.
 *
 * 문항이 표였을 때는 `model문항` 이 이 일을 했다. 값이 되면서 행 identity·저장·repo 가 다 사라지고
 * 남은 건 「선택지가 뭔가」「정답인가」「빈 문항을 어떻게 만드나」 셋뿐이라, 클래스를 세울 이유가 없다.
 * 서버 채점 라우트(`server/api/v1/grade.post.ts`)가 같은 규칙(`do채점`)을 써야 관리자 화면과 답이 안 갈린다 —
 * 그래서 여기는 Vue 도 repo 도 import 하지 않는다.
 */

/** 문항 id. 답이 이 값으로 묶이므로 한 신청받기 안에서만 유일하면 된다 — 6자면 충돌 확률이 무시할 만하다. */
export const 문항id생성 = () => Math.random().toString(36).slice(2, 8)

export const 새문항 = (덮어쓰기: Partial<i문항> = {}): i문항 => ({
  id: 문항id생성(),
  label: '',
  type: 'SINGLE',
  options: [],
  answerKey: null,
  score: 0,
  isRequired: true,
  ...덮어쓰기
})

/**
 * jsonb 에서 온 값을 **믿지 않고** 정리한다. 열이 `not null default '[]'` 라 대개 배열이지만,
 * 손으로 넣은 행·옛 데이터가 섞일 수 있다. 여기서 한 번 걸러 두면 아래 함수들이 `?.` 를 안 쓴다.
 */
export const 문항정규화 = (raw: unknown): i문항[] => {
  if (!Array.isArray(raw)) return []
  return raw.flatMap((x): i문항[] => {
    if (!x || typeof x !== 'object') return []
    const o = x as Record<string, unknown>
    const type = (typeof o.type === 'string' ? o.type : 'SINGLE') as i문항유형
    const options = Array.isArray(o.options)
      ? (o.options as unknown[]).flatMap((op): i선택지[] => {
          if (typeof op === 'string') return [create선택지(op)]
          if (op && typeof op === 'object') {
            const p = op as Record<string, unknown>
            const label = String(p.label ?? p.value ?? '')
            return label ? [create선택지(label, String(p.value ?? label))] : []
          }
          return []
        })
      : []
    const answerKey = Array.isArray(o.answerKey) && o.answerKey.length ? (o.answerKey as unknown[]).map(String) : null
    const score = Number(o.score ?? 0)
    return [{
      id: String(o.id ?? '') || 문항id생성(),
      label: String(o.label ?? ''),
      type,
      options: is선택형(type) && type !== 'OX' ? options : [],
      answerKey: is선택형(type) ? answerKey : null,
      score: Number.isFinite(score) ? Math.max(0, Math.floor(score)) : 0,
      isRequired: o.isRequired !== false
    }]
  })
}

/** 답 jsonb 정리. 값은 늘 문자열 배열로 — 단일선택도 `[value]` 라 읽는 쪽이 안 갈린다. */
export const 답정규화 = (raw: unknown): i답s => {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {}
  const out: i답s = {}
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    const 값s = (Array.isArray(v) ? v : v == null ? [] : [v]).map(x => String(x ?? '')).filter(x => x.trim().length > 0)
    if (값s.length) out[k] = 값s
  }
  return out
}

/** 회차를 복사할 때 쓴다. **id 를 그대로** 가져간다 — 답이 id 로 묶이므로 새로 매기면 통계가 끊긴다. */
export const 문항복사 = (문항s: readonly i문항[]): i문항[] =>
  문항s.map(q => ({ ...q, options: q.options.map(o => ({ ...o })), answerKey: q.answerKey ? [...q.answerKey] : null }))

/** OX는 선택지를 저장하지 않는다 — 늘 같은 두 개라 사용자가 지우거나 바꿀 수 있으면 그게 버그다. */
export const 문항선택지s = (문항: i문항): readonly i선택지[] => {
  if (문항.type === 'OX') return OX선택지s
  if (!is선택형(문항.type)) return []
  return 문항.options
}

/** 채점 대상인가. **정답이 있으면 채점, 없으면 안 함** — 별도 플래그를 두지 않는다. */
export const is채점문항 = (문항: i문항) => (문항.answerKey?.length ?? 0) > 0

/** 정답 라벨들(화면용). 선택지 value → label. */
export const 문항정답라벨s = (문항: i문항): string[] => {
  const byValue = new Map(문항선택지s(문항).map(x => [x.value, x.label]))
  return (문항.answerKey ?? []).map(v => byValue.get(v) ?? v)
}

/**
 * 이 답이 정답인가. 순서를 무시하고 집합으로 비교한다.
 * 채점 문항이 아니면 `null` — "오답"과 "채점 안 함"을 같은 값으로 뭉개지 않는다.
 */
export const do채점 = (문항: i문항, 답s: readonly string[] | undefined): boolean | null => {
  if (!is채점문항(문항)) return null
  const 정답 = new Set(문항.answerKey!)
  const 제출 = new Set(답s ?? [])
  if (정답.size !== 제출.size) return false
  for (const v of 정답) if (!제출.has(v)) return false
  return true
}

/** 만점 = 채점 문항 배점의 합. 파생값이라 저장하지 않는다. */
export const 문항만점 = (문항s: readonly i문항[]) =>
  문항s.reduce((sum, q) => sum + (is채점문항(q) ? q.score : 0), 0)

/** 답이 있는 문항인가(빈 문자열은 없는 것). */
export const is답있음 = (답s: i답s, 문항id: string) =>
  (답s[문항id] ?? []).some(v => String(v ?? '').trim().length > 0)

/**
 * 답 하나를 값·라벨 쌍으로. 선택형은 value 를 라벨로 바꾸고, **선택지에 없는 값은 원문 그대로 두되 표시한다** —
 * 문항을 고친 뒤 옛 답이 남은 경우라, 조용히 라벨인 척하면 관리자가 못 알아챈다.
 * 자유입력(SHORT·LONG)은 선택지가 없으니 늘 원문이고 `is선택지밖`이 아니다.
 */
export const 답라벨s = (문항: i문항, 답s: i답s): { value: string, label: string, is선택지밖: boolean }[] => {
  const 값s = 답s[문항.id] ?? []
  if (!is선택형(문항.type)) return 값s.map(v => ({ value: v, label: v, is선택지밖: false }))
  const byValue = new Map(문항선택지s(문항).map(x => [x.value, x.label]))
  return 값s.map(v => ({ value: v, label: byValue.get(v) ?? v, is선택지밖: !byValue.has(v) }))
}

/**
 * 유형을 바꿀 때 딸린 값을 정리한다. 자유입력으로 바뀌면 선택지·정답이 가리킬 곳이 사라지고,
 * 단일선택으로 바뀌면 정답은 하나만 남는다 — 남겨두면 채점이 늘 오답이 된다.
 */
export const 문항유형바꾸기 = (문항: i문항, 유형: i문항유형) => {
  문항.type = 유형
  if (!is선택형(유형)) {
    문항.options = []
    문항.answerKey = null
  }
  if (유형 === 'OX') 문항.options = []
  if (!is복수응답(유형) && (문항.answerKey?.length ?? 0) > 1)
    문항.answerKey = 문항.answerKey!.slice(0, 1)
}

/** 저장 전 검사. 통과하면 `null`, 아니면 이유. `model신청받기.beforeSave` 가 부른다. */
export const 문항검사 = (문항: i문항): string | null => {
  if (!문항.label.trim()) return '문두를 입력해주세요.'
  if (is선택형(문항.type) && 문항.type !== 'OX' && 문항.options.length < 2) return `「${문항.label}」 선택지를 2개 이상 넣어주세요.`
  if (is채점문항(문항)) {
    const 후보 = new Set(문항선택지s(문항).map(x => x.value))
    const 벗어난s = (문항.answerKey ?? []).filter(v => !후보.has(v))
    if (벗어난s.length) return `「${문항.label}」 정답이 선택지에 없습니다: ${벗어난s.join(', ')}`
  }
  return null
}

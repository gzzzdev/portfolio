/**
 * 서체 한 벌 — 이름 목록과 그 이름이 가리키는 CSS 스택.
 *
 * **폐기된 스킨 스펙에서 떼어냈다.** 저쪽은 통째로 걷어냈는데
 * 디자인틀(`디자인틀/types.ts` · `app/components/PrintTemplate/캔버스.vue`)이 같은 서체표를 쓴다.
 * 붙어 있으면 스펙을 지울 때 디자인틀의 서체가 같이 사라지므로, 디자인틀이 기대는 것만 여기로 내렸다.
 *
 * **폰트를 새로 만들지 않는다.** `mTheme.css` 가 이미 로드해 둔 CSS 변수를 가리킬 뿐이라,
 * 여기에 이름을 하나 늘리려면 그쪽에 `@font-face` 가 먼저 있어야 한다. 목록을 두 벌로
 * 두면 고를 수는 있는데 화면에는 아무 일도 안 일어나는 이름이 생긴다.
 *
 * **한때 `제목`·`본문` 이 목록 맨 앞에 있었다.** 폰트 이름이 아니라 "이 문서 스펙의
 * 제목서체/본문서체를 따르라"는 가리킴이었는데, 그 스펙(스킨)이 폐기되면서 가리킬 곳이
 * 없어져 스택에서 나란히 `null` 이었다 — 고를 수는 있고 골라도 아무 일이 안 일어나는 이름
 * 둘이다. 그래서 목록에서 뺐고, 그것들을 걸러 내려고 `types.ts` 가 들고 있던 `Exclude` 도
 * 같이 걷었다. 지금은 이 목록이 곧 편집기가 고르는 목록이다.
 */

/**
 * 디자인틀이 고르는 서체 목록. 프리셋 셋(sans/serif/mono)으로 안 가는 이유는
 * "호패"·"목간"·"양피지" 같은 인쇄물에서 서체가 절반이기 때문이다.
 * mTheme.css가 이미 로드해 둔 스택을 그대로 노출한다 (새 폰트를 추가하지 않는다).
 */
export const 틀서체s = [
  '고운바탕', '조선명조', '신라', '솔뫼',
  '고운돋움', '수트', '프리텐다드', '페여진고딕', '에스코어드림', '페이퍼로지', '잘난고딕',
  '필기체'
] as const

export type i틀서체 = (typeof 틀서체s)[number]

/**
 * 서체 → CSS font-family 스택.
 * `필기체`는 라틴 전용이라 한글이 들어가면 폴백으로 떨어진다 — 서명(영문소속)에만 쓸 것.
 */
export const 서체스택: Record<i틀서체, string> = {
  고운바탕: 'var(--font-gowun-batang)',
  조선명조: 'var(--font-chosun)',
  신라: 'var(--font-shilla)',
  솔뫼: 'var(--font-solmoe)',
  고운돋움: 'var(--font-gowun-dodum)',
  수트: 'var(--font-suit)',
  프리텐다드: 'var(--font-pretendard)',
  페여진고딕: 'var(--font-pyeojin-gothic)',
  에스코어드림: 'var(--font-escoredream)',
  페이퍼로지: 'var(--font-paperozi)',
  잘난고딕: 'var(--font-yeogi-jalnan)',
  필기체: 'var(--font-herr-von)'
}

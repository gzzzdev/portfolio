/**
 * 디자인틀의 모양 · 어휘 · 기본값 · 렌더. **표를 모르는 층이다** —
 * 저장·조회는 한 칸 위의 `model디자인틀.ts` 가 진다.
 *
 * 의존 방향은 한쪽이다: `types` ← (`기본값` · `스타일` · `렌더`) ← `용도` ← `model디자인틀`.
 */
export * from './types'
export * from './기본값'
export * from './스타일'
export * from './렌더'
export * from './용도'

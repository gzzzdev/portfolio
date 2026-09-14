/**
 * `model직업`은 test1과 함께 폐기됐다. 이 표는 `model등급`의 `급수` 데모용으로 아직 쓰여서
 * 모양만 여기 인라인해 둔다 — 되살릴 모델이 생기면 그쪽으로 옮기면 된다.
 */
type i직업seed행 = { id: string, label: string, grade: number }

export const i직업seed: readonly i직업seed행[] = [
  { id: '1003', label: '전사', grade: 0 },
  { id: '1004', label: '마법사', grade: 0 },
  { id: '1002', label: '도적', grade: 0 },
  { id: '1001', label: '도사', grade: 0 }
]

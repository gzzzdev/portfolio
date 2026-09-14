type i반복 = '매일' | '매주_월' | '매주_화' | '매주_수' | '매주_목' | '매주_금' | '매주_토' | '매주_일' | '매월_1일' | '매월_15일' | '매월_말일' | '매년_1월_1일' | '매년_12월_31일'

export interface i공통 {
  type: '할일' | '기록'
  title: string
  cnt?: number
}

export interface i할일 extends i공통 {
  isRepeat?: boolean
  repeatType?: i반복
  isDone?: boolean
  dueDate?: Date
}

export interface i기록 extends i공통 {
  createdAt: Date
  updatedAt?: Date
}
export type i메모 = i할일 | i기록

/** `useModalFields` 한 모달 안에서 순서대로 그릴 필드 정의 (상세 `표시필드s`와 같은 아이디어) */

export type ModalFieldStepSelect = {
  key: string
  kind: 'select'
  label?: string
  /** 정적 선택지 */
  items?: any[]
  /** 있으면 `items` 대신, 앞 단계 값을 반영해 선택지를 계산 */
  resolveItems?: (values: Record<string, any>) => any[]
  initialValue?: any
  required?: boolean
}

export type ModalFieldStepInput = {
  key: string
  kind: 'input'
  label?: string
  defaultValue?: string
  placeholder?: string
  trim?: boolean
  required?: boolean
}

export type ModalFieldStep = ModalFieldStepSelect | ModalFieldStepInput

/** 한 번에 모든 스텝 값을 채우는 보조 버튼 (`modal필드폼` 좌측) */
export type ModalFieldsWholeRandom = {
  label?: string
  fill: () => Record<string, any> | void | null | undefined
}

export type UseModalFieldsOpenOptions = {
  steps: ModalFieldStep[]
  title?: string
  description?: string
  confirmLabel?: string
  wholeRandom?: ModalFieldsWholeRandom
}

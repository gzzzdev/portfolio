import type { Role } from '~base-comps/m/_스킨'

/**
 * `window.confirm`은 갈래가 둘뿐이라, "저장할까요?" 처럼 **셋으로 갈리는 물음**을 담지 못한다.
 * (저장하고 진행 / 저장 없이 진행 / 그만두기 — 가운데 하나를 지우면 나머지 둘의 뜻이 흐려진다.)
 * 그래서 버튼을 배열로 받는다.
 */

export type ModalConfirmChoice = {
  /** 고른 결과로 돌아오는 값. 부르는 쪽이 이 문자열로 갈래를 가른다 */
  key: string
  label: string
  color?: 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'
  /** 축 바깥으로 고정할 때만. 보통은 확인 갈래 하나만 `'강조'` 다 */
  역할?: Role
  /** 역할로 표현이 안 될 때만. 적으면 테마 축이 못 건드린다 */
  variant?: 'solid' | 'outline' | 'soft' | 'subtle' | 'ghost' | 'link'
}

export type UseModalConfirmOpenOptions = {
  /** 큰 제목 (없으면 `message`만 상단에 표시) */
  title?: string
  /** 안내 문구 (`window.confirm`의 인자) */
  message?: string
  /** 버튼 목록. 생략하면 '확인' 하나 */
  choices?: ModalConfirmChoice[]
}

/**
 * 신청받기 카드 한 장이 화면에 필요한 것 전부.
 *
 * 강좌 카드(`view카드목록`)의 `duration`·`rating` 자리에 마감일과 신청수를 끼워 넣던 걸 그만두고,
 * **신청받기가 실제로 가진 이름**으로 받는다. `★ 12명` 같은 표시는 슬롯 이름이 거짓말을 해서 생겼다.
 *
 * 타입만 있는 모듈을 따로 둔 이유는 `<script setup>`이 export를 못 갖기 때문이다.
 * (`nuxt.config`의 components 설정이 `.vue`만 등록하므로 이 파일은 컴포넌트로 잡히지 않는다)
 */
export interface i신청받기카드 {
  id: number
  종류: string
  아이콘: string
  제목: string
  설명: string
  이미지: string | null
  기간: string
  /** 신청받는 중이면 남은 날, 아니면 왜 못 하는지. */
  상태: { label: string, color: 'warning' | 'neutral' }
  /**
     * 마감까지 남은 날. 이미 닫혔으면 null — 0(오늘 마감)과 섞이면 안 된다.
     * `상태.label` 의 'D-3' 을 도로 파싱하지 않으려고 숫자로도 싣는다. 머리말이 이걸로 센다.
     */
  남은날: number | null
  신청수: number
  /** 0이면 정원 없음 — 진행률 막대를 그리지 않는다. */
  정원: number
  요금: string
  is무료: boolean
  is내신청: boolean
}

/**
 * 「내 신청」 갈래의 한 줄.
 *
 * **신청받기가 아니라 신청을 센다** — 그래서 전체 목록과 열이 다르다(자리·요금 대신 할 일과 상태).
 * 같은 표처럼 보이는데 다른 표라, 이 타입이 갈려 있는 것 자체가 그 사실을 진다.
 */
export interface i내신청줄 {
  /** 열 때 쓰는 신청받기 id. 줄의 정체는 신청이지만 갈 곳은 신청받기 상세다. */
  id: number
  묶음: '할일' | '기다림' | '지남'
  구분: '응답' | '결제' | '확정'
  종류: string
  아이콘: string
  제목: string
  /** 왜 이 줄이 여기 있나. 「필수 문항 4개가 남았습니다 · 오늘 마감」 */
  문구: string
  /** 버튼 글자. 없으면 버튼을 안 그린다. */
  액션: string
  /** 오늘 안에 안 하면 못 하는 것. 색을 쓰는 자리는 이 목록에서 여기 하나뿐이다. */
  is급함: boolean
  /** 지난 줄의 오른쪽에 적는 값(점수·상태). 없으면 빈칸. */
  값: string
}

/** 목록을 세우는 모양. 주소는 `?view=card`(목록형이 기본이라 쿼리가 없다). */
export type i신청받기뷰 = '목록형' | '카드형'

export interface i신청받기필터그룹 {
  key: string
  title: string
  options: { label: string, value: string, icon?: string }[]
}

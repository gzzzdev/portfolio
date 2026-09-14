import { mDayjs } from '~utils'

type i시점날짜규칙 = `${number}-${number}-${number}`

export interface i시점 {
  label: string
  startDate?: i시점날짜규칙
  endDate: i시점날짜규칙
  color?: string
  태그구분id?: string
}

export interface i시점묶음 {
  label: string
  list: i시점[]
  color: string
}

export interface i태그구분 {
  id: string
  label: string
  color: string
}

export type i시점날짜 = Omit<i시점, 'startDate' | 'endDate'> & {
  startDate?: Date
  endDate: Date
}

export const 태그구분s: i태그구분[] = [
  { id: '신체', label: '신체적', color: '#86efac' },
  { id: '나이', label: '나이', color: '#fde68a' },
  { id: '창업', label: '창업', color: '#fdba74' },
  { id: '소속', label: '소속', color: '#93c5fd' },
  { id: '주거', label: '주거', color: '#a5f3fc' },
  { id: '자산', label: '자산', color: '#c4b5fd' },
  { id: '학습', label: '학습', color: '#f9a8d4' },
  { id: '휴식', label: '휴식', color: '#d9f99d' },
  { id: '사람', label: '사람', color: '#16a34a' }
]

export const 시점s: i시점[] = [
  // 신체 (체력 및 건강 관리)
  { 태그구분id: '신체', label: '노화 변곡점 대비 체력 관리', startDate: '2026-01-05', endDate: '2026-03-31' },
  { 태그구분id: '신체', label: '생애주기별 신체 변화 분석 (서비스 기획 연계)', startDate: '2026-04-01', endDate: '2026-06-30' },
  { 태그구분id: '신체', label: '하반기 근력 운동 루틴 점검 및 식단 조정', startDate: '2026-08-01', endDate: '2026-08-31' },

  // 나이 (생애주기 및 시간적 기점)
  { 태그구분id: '나이', label: '생일 주간 (음력 4월 1일 기준)', startDate: '2026-05-11', endDate: '2026-05-17' },
  { 태그구분id: '나이', label: '연말 회고 및 다음 해 목표 리포지셔닝', startDate: '2026-12-20', endDate: '2026-12-31' },

  // 창업 및 소속 (팀 마장터, 1인 비즈니스 구축)
  { 태그구분id: '창업', label: '팀 마장터: 예비창업패키지 준비 및 제출', startDate: '2026-02-01', endDate: '2026-04-15' },
  { 태그구분id: '창업', label: '예비창업패키지 1차 평가 대응 및 BM 고도화', startDate: '2026-04-16', endDate: '2026-05-15' },
  { 태그구분id: '소속', label: 'LMS 고도화 및 현금흐름 창출 전략 수립', startDate: '2026-06-01', endDate: '2026-09-30' },
  { 태그구분id: '소속', label: 'LMS 유저 피드백 수집 및 MVP 개선', startDate: '2026-10-01', endDate: '2026-10-31' },
  { 태그구분id: '창업', label: '2029년 1인 시스템 구축을 위한 중간 점검', startDate: '2026-11-23', endDate: '2026-12-18' },

  // 주거 (부동산 트래킹 및 주거 환경)
  { 태그구분id: '주거', label: '부동산 시장 조사 (용인 수지/성남 분당)', startDate: '2026-02-08', endDate: '2026-02-14' },
  { 태그구분id: '주거', label: '하반기 관심 지역(수지/분당) 임장 및 시세 트래킹', startDate: '2026-09-01', endDate: '2026-09-30' },
  { 태그구분id: '주거', label: '자산 6억 달성 계획 기반 주거 환경 점검', startDate: '2026-10-01', endDate: '2026-10-14' },

  // 자산 (투자 및 현금흐름 관리)
  { 태그구분id: '자산', label: '상반기 현금흐름 분석 및 시드머니 재분배', startDate: '2026-06-15', endDate: '2026-06-30' },
  { 태그구분id: '자산', label: '6억 자산 달성을 위한 포트폴리오 리밸런싱', startDate: '2026-12-01', endDate: '2026-12-15' },

  // 학습 (자기계발 및 업무 효율화)
  { 태그구분id: '학습', label: '1인 비즈니스를 위한 개발/운영 자동화 스택 학습', startDate: '2026-03-01', endDate: '2026-04-30' },
  { 태그구분id: '학습', label: '창업 및 비즈니스 관련 세미나/네트워킹 참석', startDate: '2026-05-01', endDate: '2026-05-31' },
  { 태그구분id: '학습', label: '하반기 신규 기술 트렌드 리서치 및 토이 프로젝트', startDate: '2026-07-01', endDate: '2026-08-31' },

  // 휴식 (멘탈 케어 및 재충전)
  { 태그구분id: '휴식', label: '예비창업패키지 마무리 후 리프레시 휴가', startDate: '2026-05-20', endDate: '2026-05-27' },
  { 태그구분id: '휴식', label: '가을맞이 멘탈 케어 및 짧은 여행', startDate: '2026-10-15', endDate: '2026-10-22' }
]

export const 시점ss: i시점묶음[] = 태그구분s.map(태그구분 => ({
  label: 태그구분.label,
  color: 태그구분.color,
  list: 시점s
    .filter(시점 => 시점.태그구분id === 태그구분.id)
    .map(({ 태그구분id, ...시점 }) => ({
      ...시점,
      color: 시점.color ?? 태그구분.color
    }))
}))

const 시점날짜문자열ToDate = (dateString: i시점날짜규칙): Date => {
  const parsed = mDayjs(dateString)
  return parsed?.toDate?.() ?? new Date(dateString)
}

export const get시점sByDate = (
  points: i시점[] = 시점s
): i시점날짜[] =>
  points.map(item => ({
    label: item.label,
    startDate: item.startDate ? 시점날짜문자열ToDate(item.startDate) : undefined,
    endDate: 시점날짜문자열ToDate(item.endDate),
    color: item.color
  }))

export const 생애2연령라벨 = ['0살', '10대', '20대', '30대', '40대', '50대', '60대', '70대', '80대', '90대', '100대']

export interface i가치항목 {
  label: string
  value: number
  date: string | Date
}

export interface i가치태그총합 {
  tag: string
  list: i가치항목[]
}

// 생애2 가치 데이터는 연령 흐름과 별개로 태그별 총합을 가진다.
export const 생애2가치총합태그s: i가치태그총합[] = [
  {
    tag: '마음-멘탈',
    list: [
      { label: '새벽 명상', value: 8, date: '1996-03-01' },
      { label: '호흡 훈련', value: 14, date: '2024-06-15' },
      { label: '집중 수련', value: 21, date: '2048-09-01' },
      { label: '집중력 저하', value: -7, date: '2062-04-10' },
      { label: '회복 속도 둔화', value: -10, date: '2084-11-20' }
    ]
  },
  {
    tag: '몸-건강',
    list: [
      { label: '기초 체력 형성', value: 8, date: '1998-01-20' },
      { label: '성장기 체력 향상', value: 10, date: '2002-05-11' },
      { label: '유산소 습관', value: 12, date: '2006-10-03' },
      { label: '기초 근력 루틴', value: 14, date: '2010-03-18' },
      { label: '수면 패턴 안정', value: 16, date: '2013-07-22' },
      { label: '영양 균형 개선', value: 18, date: '2016-11-09' },
      { label: '유연성 훈련', value: 20, date: '2019-04-04' },
      { label: '체성분 관리', value: 22, date: '2022-08-14' },
      { label: '정기 검진 시작', value: 24, date: '2025-01-30' },
      { label: '스트레스 관리', value: 26, date: '2028-06-16' },
      { label: '회복 루틴 정착', value: 28, date: '2031-10-07' },
      { label: '관절 보호 운동', value: 30, date: '2035-02-25' },
      { label: '혈압·혈당 관리', value: 32, date: '2038-09-13' },
      { label: '근육량 유지', value: 34, date: '2042-03-01' },
      { label: '균형감각 강화', value: 36, date: '2045-07-28' },
      { label: '만성 피로 증가', value: -10, date: '2052-11-02' },
      { label: '대사 저하', value: -12, date: '2058-04-19' },
      { label: '뼈·근육 약화', value: -14, date: '2063-08-05' },
      { label: '감각 둔해짐', value: -16, date: '2068-05-27' },
      { label: '회복 속도 저하', value: -18, date: '2074-12-10' }
    ]
  },
  {
    tag: '몸-물건',
    list: [
      { label: 'minivan', value: 8, date: '2012-03-01' },
      { label: 'campervan', value: 12, date: '2014-01-01' },
      { label: '차박 매트 세트', value: 14, date: '2015-06-15' },
      { label: '루프박스 장착', value: 15, date: '2016-10-09' },
      { label: '접이식 테이블·의자', value: 16, date: '2018-04-20' },
      { label: '이동식 주방 키트', value: 18, date: '2019-09-12' },
      { label: '태양광 충전 패널', value: 20, date: '2021-02-28' },
      { label: '물탱크 업그레이드', value: 21, date: '2023-07-06' },
      { label: '자전거 세트', value: 23, date: '2026-05-01' },
      { label: '카약 랙', value: 24, date: '2028-08-19' },
      { label: '휴대 공구 세트', value: 26, date: '2030-11-03' },
      { label: '목공 장비', value: 29, date: '2032-03-18' },
      { label: '온실 프레임 제작', value: 31, date: '2034-06-25' },
      { label: '빗물 저장통 설치', value: 33, date: '2036-09-14' },
      { label: '토양 개선 작업', value: 34, date: '2038-12-01' },
      { label: '퇴비 시스템', value: 36, date: '2040-04-22' },
      { label: '과수 묘목 심기', value: 38, date: '2042-07-10' },
      { label: '허브 텃밭', value: 39, date: '2044-10-05' },
      { label: '작은 정원', value: 40, date: '2047-03-30' },
      { label: '정원 확장', value: 42, date: '2050-06-18' }
    ]
  },
  {
    tag: '사람-종단',
    list: [
      { label: '공동체 모임', value: 7, date: '1998-04-02' },
      { label: '멘토링', value: 14, date: '2028-10-14' },
      { label: '프로젝트 연대', value: 22, date: '2040-02-07' },
      { label: '관계 밀도 완화', value: -8, date: '2056-07-21' },
      { label: '참여 빈도 감소', value: -12, date: '2088-12-03' }
    ]
  },
  {
    tag: '사람-사회',
    list: [
      { label: '동네 행사', value: 6, date: '1992-09-01' },
      { label: '봉사 활동', value: 13, date: '2016-11-11' },
      { label: '시민 포럼', value: 21, date: '2033-03-25' },
      { label: '사회활동 피로', value: -9, date: '2050-06-30' },
      { label: '대외 활동 축소', value: -13, date: '2082-10-19' }
    ]
  },
  {
    tag: '일-기술',
    list: [
      { label: '코드 리팩터링', value: 8, date: '2008-01-08' },
      { label: '아키텍처 설계', value: 19, date: '2022-08-22' },
      { label: '성능 최적화', value: 31, date: '2031-04-17' },
      { label: '신기술 적응 난도', value: -11, date: '2043-09-12' },
      { label: '실행 속도 둔화', value: -15, date: '2076-02-28' }
    ]
  },
  {
    tag: '일-회사',
    list: [
      { label: '팀 빌딩', value: 7, date: '2002-07-07' },
      { label: '사업 기획', value: 18, date: '2020-02-19' },
      { label: '신규 런칭', value: 30, date: '2034-05-13' },
      { label: '조직 피로 누적', value: -10, date: '2049-11-01' },
      { label: '역할 축소 전환', value: -14, date: '2092-03-15' }
    ]
  }
]

const 생애2대분류s = ['마음', '몸', '사람', '일'] as const

type 생애2대분류 = (typeof 생애2대분류s)[number]

const 생애2대분류색상: Record<생애2대분류, string> = {
  마음: '#14b8a6',
  몸: '#4b5563',
  공간: '#f7b267',
  사람: '#fb923c',
  일: '#2563eb'
}

const get대분류ByTag = (tag: string): 생애2대분류 | null => {
  const [group] = tag.split('-')
  if (생애2대분류s.includes(group as 생애2대분류)) {
    return group as 생애2대분류
  }
  return null
}

const get연령인덱스ByDate = (date: string | Date, baseYear: number): number => {
  const parsedDate = new Date(date)
  const year = parsedDate.getFullYear()
  if (Number.isNaN(year)) {
    return 0
  }

  const age = year - baseYear
  if (age <= 0) {
    return 0
  }
  if (age >= 100) {
    return 생애2연령라벨.length - 1
  }
  return Math.floor(age / 10)
}

const to백분율데이터 = (values: number[]): number[] => {
  const maxValue = Math.max(...values)
  if (maxValue <= 0) {
    return values.map(() => 0)
  }

  return values.map((value) => {
    const scaled = (value / maxValue) * 100
    const bounded = Math.max(0, Math.min(100, scaled))
    return Math.round(bounded * 10) / 10
  })
}

export const get생애2데이터셋 = (baseYear: number) =>
  생애2대분류s
    .map(분류 => ({
      label: 분류,
      data: Array.from({ length: 생애2연령라벨.length }, () => 0),
      fill: true,
      color: 생애2대분류색상[분류]
    }))
    .map((dataset) => {
      for (const tagGroup of 생애2가치총합태그s) {
        if (get대분류ByTag(tagGroup.tag) !== dataset.label) {
          continue
        }
        for (const item of tagGroup.list) {
          const ageIndex = get연령인덱스ByDate(item.date, baseYear)
          const bucketValue = dataset.data[ageIndex] ?? 0
          dataset.data[ageIndex] = bucketValue + item.value
        }
      }

      // 연령 버킷별 합계를 시간 순 누적값으로 변환한다.
      for (let i = 1; i < dataset.data.length; i++) {
        dataset.data[i] = (dataset.data[i - 1] ?? 0) + (dataset.data[i] ?? 0)
      }

      dataset.data = to백분율데이터(dataset.data)

      return dataset
    })

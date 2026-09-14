import type { PropType } from 'vue'
import { 시점ss, type i시점묶음 } from './data시점ss'
import { get생애2데이터셋, 생애2연령라벨 } from './data가치s'

export type ViewType = 'day' | 'week' | 'month' | 'year' | 'life' | 'life2'
export type 일정필터 = {
  id: string
  label: string
  checkboxClass: string
  visible: boolean
}
export type 브리핑항목 = {
  viewLabel: string
  periodText: string
  summary: string
  bottom: string
  tags: string[]
}
export type 브리핑문구 = Record<ViewType, 브리핑항목>

const 기본필터색상목록 = [
  '#10b981',
  '#f59e0b',
  '#0ea5e9',
  '#06b6d4',
  '#16a34a'
] as const

export { get생애2데이터셋, 생애2연령라벨 }

export interface Props {
  view?: ViewType
  date?: Date
  lifeBaseYear?: number
  points?: i시점묶음[]
  filters?: 일정필터[]
  briefing?: 브리핑문구
}

export const props = {
  view: {
    type: String as PropType<ViewType>,
    default: 'day'
  },
  date: {
    type: Date as PropType<Date>,
    default: () => new Date()
  },
  lifeBaseYear: {
    type: Number,
    default: 1992
  },
  points: {
    type: Array as PropType<i시점묶음[]>,
    default: () => 시점ss
  },
  filters: {
    type: Array as PropType<일정필터[]>,
    default: () =>
      시점ss.map((group, index) => ({
        id: `시점-${index}`,
        label: group.label,
        checkboxClass: group.color ?? 기본필터색상목록[index % 기본필터색상목록.length],
        visible: true
      }))
  },
  briefing: {
    type: Object as PropType<브리핑문구>,
    default: () => ({
      day: {
        viewLabel: '일간',
        periodText: '오늘의 연표',
        summary: '오늘은 핵심 사건 1~2개를 깊게 파고들기 좋은 날입니다. 인물 관계도와 배경 사료를 함께 보면 맥락이 빠르게 잡힙니다.',
        bottom: '아침에는 사건 흐름, 저녁에는 사료 한 줄 요약으로 마무리해 기억 고리를 만드세요.',
        tags: ['연표', '사건맥락', '당일복습']
      },
      week: {
        viewLabel: '주간',
        periodText: '주간 연대기',
        summary: '이번 주는 시대별 굵직한 전환점을 묶어 보기 좋습니다. 월-수에는 사건 전개를, 목-금에는 원인과 결과를 비교해 정리해보세요.',
        bottom: '주말에는 인물 중심으로 다시 읽으면 사건 간 연결이 선명해집니다.',
        tags: ['주간정리', '인과관계', '전환점']
      },
      month: {
        viewLabel: '월간',
        periodText: '월간 테마',
        summary: '이번 달은 한 왕조 혹은 한 지역을 중심으로 깊게 들어가기 좋습니다. 정치사-문화사-경제사를 나눠 보면 입체감이 살아납니다.',
        bottom: '매주 말 "이번 달 핵심 사건 3개"를 다시 적어 누적 기억을 확보하세요.',
        tags: ['월간탐구', '왕조사', '입체정리']
      },
      year: {
        viewLabel: '연간',
        periodText: '연간 대서사',
        summary: '연간 단위에서는 사건 그 자체보다 문명 변화의 큰 흐름을 잡는 것이 중요합니다. 전쟁, 제도, 기술의 상호작용을 축으로 보세요.',
        bottom: '분기마다 "무엇이 변했고 무엇이 지속됐는가"를 점검하면 사관이 단단해집니다.',
        tags: ['연간흐름', '문명사', '사관훈련']
      },
      life: {
        viewLabel: '생애',
        periodText: '세대/연령대',
        summary: '생애 관점에서는 인물의 나이대별 사건을 묶어 보는 것이 핵심입니다. 10대부터 90대까지 중요한 전환점을 빠르게 비교하세요.',
        bottom: '연령대별로 "무엇을 했는가"를 1줄로 남기면 인물 흐름이 훨씬 또렷해집니다.',
        tags: ['생애사', '연령대', '인물흐름']
      },
      life2: {
        viewLabel: '생애2',
        periodText: '세대/연령대',
        summary: '생애2에서는 생애와 다른 방식으로 연령별 흐름을 빠르게 훑어봅니다. 기준 연도를 바탕으로 연도 선택과 전환점을 함께 확인할 수 있습니다.',
        bottom: '생애와 생애2를 번갈아 보며 같은 시기를 다른 관점으로 비교해 보세요.',
        tags: ['생애2', '연령대', '전환점']
      }
    })
  }
} as const

/**
 * 달력 부품들의 **셈만** 있는 자리. 그리는 것은 `월.vue`·`간트.vue` 가 한다.
 *
 * 부품은 어느 표에서 왔는지 모른다 — 받는 건 「첫날·마지막날·제목」뿐이다(`iCalendar항목`).
 * `model달력s` 의 배타 끝(`end` = 다음 날 0시)을 포함 구간으로 바꾸는 일은 부르는 쪽 어댑터가 한다
 * (모래밭 `sandbox/_달력판.ts`). 그 변환을 부품마다 되풀이하면 월 격자와 간트가 하루씩 어긋난다.
 */
import type { mDayjs } from '~utils'

/** 부품이 받는 한 줄. **끝은 포함**이다 — 8/8~8/9 는 이틀. */
export interface iCalendar항목 {
  id: string
  title: string
  /** 범례 키. 거르개·개수가 이 값으로 묶는다 */
  갈래: string
  /** 표시가 정한 색만. 없으면 없다 — 부품이 지어 주지 않는다 */
  색?: string
  아이콘?: string
  꼬리표?: string
  첫날: mDayjs
  마지막날: mDayjs
  /** 며칠짜리인가 (하루면 1). 첫날·마지막날에서 나오지만 정렬에서 자주 읽어 미리 센다 */
  일수: number
  /** 시각이 있는 항목의 `14:30` — 종일이면 없다 */
  시각?: string
}

export interface iCalendar범례 {
  key: string
  label: string
  색?: string
  아이콘: string
}

const 날수차 = (a: mDayjs, b: mDayjs) => b.startOf('day').diff(a.startOf('day'), 'day')

/** 달 격자에 깔 주(週) 묶음. 앞뒤 달의 꼬리까지 물고 늘 7칸씩이다. */
export const 달주s = (기준월: mDayjs): mDayjs[][] => {
  const 첫칸 = 기준월.startOf('month').startOf('week')
  const 주수 = Math.ceil((날수차(첫칸, 기준월.endOf('month')) + 1) / 7)
  return Array.from({ length: 주수 }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => 첫칸.add(w * 7 + d, 'day'))
  )
}

export const 겹치나 = (항목: iCalendar항목, 시작: mDayjs, 끝: mDayjs) =>
  !항목.첫날.isAfter(끝, 'day') && !항목.마지막날.isBefore(시작, 'day')

export interface i막대 {
  항목: iCalendar항목
  /** 1-based 그리드 열 */
  열: number
  칸수: number
  /** 0-based 줄. **-1 은 자리를 못 얻은 것**이라 「+n개 더」로 접힌다 */
  줄: number
  /** 이 주 앞에서 이미 시작했다 — 왼쪽 모서리를 안 깎는다 */
  앞잘림: boolean
  뒤잘림: boolean
}

/**
 * 한 주의 막대를 줄(lane)에 눌러 담는다.
 *
 * **여러 날짜리와 하루짜리에 각각 몫을 준다.** 길이순으로만 담으면 달을 통째로 지나가는
 * 신청받기 기간 몇 개가 줄을 전부 차지하고, 그날 하루짜리(회원 가입 같은)는 늘 「+n개 더」 뒤로
 * 숨는다 — 신청받기 28건이 들어오자 9월 12일의 가입 8건이 통째로 사라졌다.
 * 그래서 **위 `기간줄` 칸은 여러 날짜리 몫**이고 아래는 하루짜리 몫이다.
 * 한쪽이 비면 다른 쪽이 그 자리를 가져간다(두 번째 훑기) — 칸을 놀리지는 않는다.
 */
export const 주막대s = (
  항목s: iCalendar항목[],
  주: mDayjs[],
  옵션: { 최대줄: number, 기간줄: number }
): i막대[] => {
  const 주시작 = 주[0]
  const 주끝 = 주[6]
  if (!주시작 || !주끝) return []

  const 최대줄 = Math.max(1, 옵션.최대줄)
  const 기간줄 = Math.min(Math.max(0, 옵션.기간줄), 최대줄)

  const 차례 = (a: iCalendar항목, b: iCalendar항목) =>
    b.일수 - a.일수
    || a.첫날.valueOf() - b.첫날.valueOf()
    || a.title.localeCompare(b.title)

  const 찬칸ss: boolean[][] = Array.from({ length: 최대줄 }, () =>
    Array.from({ length: 7 }, () => false))

  const 막대s: i막대[] = 항목s
    .filter(x => 겹치나(x, 주시작, 주끝))
    .sort(차례)
    .map((항목) => {
      const from = Math.max(0, 날수차(주시작, 항목.첫날))
      const to = Math.min(6, 날수차(주시작, 항목.마지막날))
      return {
        항목,
        열: from + 1,
        칸수: to - from + 1,
        줄: -1,
        앞잘림: 항목.첫날.isBefore(주시작, 'day'),
        뒤잘림: 항목.마지막날.isAfter(주끝, 'day')
      }
    })

  /** 주어진 줄 구간에 담고, 못 담은 것을 돌려준다. */
  const 담기 = (목록: i막대[], 시작줄: number, 끝줄: number) => {
    const 남은s: i막대[] = []
    for (const 막 of 목록) {
      const from = 막.열 - 1
      const to = from + 막.칸수 - 1
      let 줄 = -1
      for (let l = 시작줄; l < 끝줄; l++) {
        if (찬칸ss[l]?.slice(from, to + 1).every(v => !v)) {
          줄 = l
          break
        }
      }
      if (줄 < 0) {
        남은s.push(막)
        continue
      }
      for (let i = from; i <= to; i++) 찬칸ss[줄]![i] = true
      막.줄 = 줄
    }
    return 남은s
  }

  const 긴것s = 막대s.filter(막 => 막.항목.일수 >= 2)
  const 하루s = 막대s.filter(막 => 막.항목.일수 < 2)

  // 제 몫부터, 그 다음 남의 빈자리
  const 긴남은s = 담기(긴것s, 0, 기간줄)
  const 하루남은s = 담기(하루s, 기간줄, 최대줄)
  담기(긴남은s, 기간줄, 최대줄)
  담기(하루남은s, 0, 기간줄)

  return 막대s
}

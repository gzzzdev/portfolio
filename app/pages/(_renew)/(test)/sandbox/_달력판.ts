/**
 * `model달력s` → `mCalendar*` 부품 입력. **도메인은 여기서 끝난다** — 부품은 어느 표에서 왔는지 모른다.
 *
 * 모델이 주는 `i달력항목` 은 시작·끝이 `Date` 이고 **끝이 배타**(종일이면 다음 날 0시)다.
 * 화면은 「첫날과 마지막날」로 생각하는 게 편해서 여기서 한 번만 포함 구간으로 바꾼다.
 * 이 변환을 부품마다 되풀이하면 월 격자와 간트가 하루씩 어긋난다.
 *
 * 다른 모래밭의 `device/_기기.ts` 처럼 페이지 옆에 둔다 — 옮길 때 같이 간다.
 */
import { mDayjs } from '~utils'
import { model달력s, type i달력항목 } from '~models/test2'
import type { iCalendar범례, iCalendar항목 } from '~base-comps/m/Calendar/_/판'

const 날수차 = (a: mDayjs, b: mDayjs) => b.startOf('day').diff(a.startOf('day'), 'day')

/** 배타 끝 → 포함 마지막날. 끝이 없거나 시작보다 앞서면 하루짜리로 본다. */
const 마지막날of = (항목: i달력항목, 첫날: mDayjs) => {
  if (!항목.end) return 첫날
  const 끝 = mDayjs(항목.end)
  const 후보 = 항목.allDay ? 끝.subtract(1, 'millisecond').startOf('day') : 끝.startOf('day')
  return 후보.isBefore(첫날) ? 첫날 : 후보
}

export const to달력항목 = (항목: i달력항목): iCalendar항목 => {
  const 첫날 = mDayjs(항목.start).startOf('day')
  const 마지막날 = 마지막날of(항목, 첫날)
  return {
    id: 항목.id,
    title: 항목.title || '(제목 없음)',
    갈래: 항목.legendKey,
    색: 항목.color,
    아이콘: 항목.icon,
    꼬리표: 항목.tag,
    첫날,
    마지막날,
    일수: 날수차(첫날, 마지막날) + 1,
    시각: 항목.allDay === false ? mDayjs(항목.start).format('H:mm') : undefined
  }
}

/** 달력 항목·범례를 한 자리에서 읽는다. 어느 표를 읽을지는 `model달력s` 가 안다. */
export const use달력판 = () => {
  const 달력s = model달력s.getInstance()
  const is준비 = ref(false)

  const 항목s = computed<iCalendar항목[]>(() => toValue(달력s.list).map(to달력항목))
  const 범례s = computed<iCalendar범례[]>(() =>
    toValue(달력s.범례).map(x => ({ key: x.key, label: x.label, 색: x.color, 아이콘: x.icon })))

  /**
   * **끈 것만 기억한다.** 켠 것을 기억하면 처음 한 번 `범례s` 를 보고 전부 켜야 하는데,
   * 범례는 표본 한 행에서 나오므로 표가 하나씩 읽히는 동안 **여러 번 커진다** — 처음 값으로
   * 잠그면 제일 먼저 온 유형 하나만 켜진 채 굳는다(실제로 그렇게 됐다).
   * 기본을 「켬」으로 두면 늦게 온 유형도 저절로 켜지고, 잠글 시점을 고를 필요가 없다.
   */
  const 꺼진키s = ref(new Set<string>())

  const 켜진키s = computed<Set<string>>({
    get: () => new Set(범례s.value.filter(x => !꺼진키s.value.has(x.key)).map(x => x.key)),
    set: (v) => {
      꺼진키s.value = new Set(범례s.value.filter(x => !v.has(x.key)).map(x => x.key))
    }
  })

  const 보이는항목s = computed(() => 항목s.value.filter(x => 켜진키s.value.has(x.갈래)))

  const 개수s = computed<Record<string, number>>(() => {
    const out: Record<string, number> = {}
    for (const x of 항목s.value) out[x.갈래] = (out[x.갈래] ?? 0) + 1
    return out
  })

  달력s.reads().then(() => {
    is준비.value = true
  })

  return { is준비, 항목s, 범례s, 켜진키s, 보이는항목s, 개수s }
}

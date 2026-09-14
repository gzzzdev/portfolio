import dayjs, { type Dayjs } from 'dayjs'
import utc from 'dayjs/plugin/utc.js'
import timezone from 'dayjs/plugin/timezone.js'

// 플러그인은 한 번만 확장
dayjs.extend(utc)
dayjs.extend(timezone)

export const mDate = (date: string | Date = new Date()): Dayjs => {
  const tz = 'Asia/Seoul'
  // 로컬/원본 Date를 그대로 받아서 지정된 타임존으로만 변환
  return dayjs(date).tz(tz)
}

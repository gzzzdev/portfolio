import { computed, toValue, type ComputedRef } from 'vue'
import { mDayjs, is_mDayjs, is_Period, type i기간 } from '~utils'
import { getRepoInstance, 타입지정, type BaseModel2, type BaseXXDto, type i필드 } from '~utils/models'
import { model일정s } from './model일정'
import { model메모s } from './model메모'
import { model태그s } from './model태그'
import { model태그관계s } from './model태그관계'
import { model회원s } from '../_basics/model회원'
// 낱개 파일이 아니라 index 로 — enrolls 안의 순환(신청받기→설문→_콘텐츠물→신청받기)는 index 의 순서와 `_대상레지스트리` 가 푼다.
import { model행사s, model수업s, model신청받기s } from '../enrolls'

/**
 * **달력에 올라갈 것들의 합집합.** 표 없이 다른 repo 들을 합쳐 보여주는 Facade 다 —
 * `model회원이력s` 가 상태이력 + 관계이력을 합치는 것과 같은 자리.
 *
 * ## 어떤 칸이 날짜인지 아는 법
 *
 * 각 표의 `자동필드ss` 가 이미 말한다. `type` 이 `날짜`·`날짜2`·`기간`·`기간시간` 이고
 * **`달력` 표시가 달린** 칸만 항목이 된다(`i필드.달력`). 타입만 보고 올리면 가입일·신청일·
 * 심사일까지 달력에 실려 잡음이 되므로 표시는 opt-in 이다. `aiV2/source.ts` 가 같은 배열을
 * 메타데이터로 읽어 탭·수정칸을 뽑는 것과 같은 방식이다.
 *
 * 칸의 `show` 는 행마다 다시 본다 — 메모 마감일은 `show: computed(() => this.is할일)` 이라
 * 노트 메모의 마감일은 여기서 저절로 빠진다. 그래서 `자동필드ss` 를 표본 한 행이 아니라
 * **행마다** 읽는다(그 배열의 `show`·`행색` 이 그 행의 `this` 에 묶여 있다).
 *
 * ## 손으로 적는 것은 repo 목록뿐
 *
 * 등록된 repo 전부를 훑지 않는다 — 표마다 `read` 권한이 따로 걸리고, 달력 때문에 표 마흔 개를
 * 읽을 이유가 없다. repo 를 `출처s` 에 하나 넣으면 그 표의 `달력` 칸은 자동으로 잡힌다.
 *
 * ## 쓰기가 없다
 *
 * 한 줄은 (행, 칸) 쌍에서 나온 파생값이라 모델 인스턴스가 아니다. 고칠 자리는 원본 행이다.
 */

/** 범례 키 = `{표}:{칸}`. 같은 표에 달력 칸이 둘이면(신청받기의 신청기간·사용기간) 따로 걸러진다. */
export type i달력출처 = `${string}:${string}`

export interface i달력항목 {
  id: string
  title: string
  start: Date
  end?: Date
  color?: string
  allDay?: boolean
  /** 표 이름 */
  source: string
  sourceId: string
  legendKey: i달력출처
  tag?: string
  icon?: string
}

export interface i달력범례항목 {
  key: i달력출처
  label: string
  /** 표시가 `달력.color` 로 정한 것만. **안 정했으면 없다** — 여기서 지어 주지 않는다. */
  color?: string
  icon: string
}

type i달력칸설정 = Exclude<NonNullable<i필드['달력']>, boolean>
type i행 = BaseModel2<BaseXXDto> & Record<string, unknown>
/** 출처가 갖춰야 할 최소 모양. `BaseModels2<T, Dto>` 를 그대로 받으면 T 의 분산 때문에 구체 repo 가 안 들어온다. */
interface i출처repo {
  tableName: string
  list: ComputedRef<unknown[]>
  reads: () => Promise<unknown>
  메뉴?: { 아이콘?: string, label?: string } | null | undefined
}

const 날짜타입s = new Set([타입지정._.날짜, 타입지정._.날짜2, 타입지정._.기간, 타입지정._.기간시간])
const 시각있는타입s = new Set([타입지정._.날짜2, 타입지정._.기간시간])

/**
 * **색은 지어 주지 않는다.** 표시가 `달력.color`(또는 `행색`)로 정한 것만 항목에 실리고,
 * 안 정한 표(`달력: true` 만 켠 `_콘텐츠물.기간` — 행사·수업)는 색 없이 나간다.
 * 2026-09-12 까지는 출처 순서대로 여섯 색을 돌려 입혔는데, 그러면 화면에서 「정한 색」과
 * 「지어낸 색」이 구분이 안 된다 — 색이 있으면 누군가 뜻을 담아 정한 것이어야 한다.
 * 아이콘은 다르다. 표 메뉴의 아이콘은 이미 그 표가 정한 것이라 물려받을 수 있다.
 */
const 기본아이콘 = 'i-lucide-calendar'

const toExclusiveEnd = (dayStart: Date) => mDayjs(dayStart).add(1, 'day').startOf('day').toDate()
const hasClockTime = (d: mDayjs) => d.hour() !== 0 || d.minute() !== 0 || d.second() !== 0 || d.millisecond() !== 0
const defaultTimedEnd = (start: Date) => mDayjs(start).add(30, 'minute').toDate()

const 설정of = (칸: i필드): i달력칸설정 | null => {
  if (!칸.달력 || !칸.key || !칸.type || !날짜타입s.has(칸.type)) return null
  return 칸.달력 === true ? {} : 칸.달력
}

/** 행의 `자동필드ss` 를 평평하게. `protected` 라 형식상 밖에서 못 보지만 `aiV2/source.ts` 와 같은 자리다. */
const 칸sOf = (행: i행): i필드[] =>
  (((행 as unknown as { 자동필드ss?: { list: i필드[] }[] }).자동필드ss) ?? []).flatMap(g => g.list ?? [])

export class model달력s {
  static getInstance = () => getRepoInstance('model달력s', () => new model달력s())

  private constructor() {}

  /**
   * 달력에 실을 표들. **여기만 손으로 적는다.**
   * 표를 더하면 그 표의 `달력` 칸이 저절로 잡힌다 — 변환기를 표마다 쓰지 않는다.
   */
  private get 출처s(): i출처repo[] {
    return [
      model일정s.getInstance(),
      model메모s.getInstance(),
      model회원s.getInstance(),
      model행사s.getInstance(),
      model수업s.getInstance(),
      model신청받기s.getInstance()
    ]
  }

  /**
   * 출처 + 태그(항목의 `tag` 라벨·아이콘이 태그에서 온다). 한 자리에서 읽어야 빠뜨리지 않는다.
   *
   * **출처 하나가 실패해도 달력은 뜬다.** 표마다 `read` 권한이 따로라, 회원을 못 읽는 역할이
   * 일정까지 못 보면 안 된다 — `model회원s.reads()` 의 `곁들임` 과 같은 처방이다.
   */
  reads = () => {
    const 곁들임 = (p: Promise<unknown>) => p.catch(() => false)
    return Promise.all([
      ...this.출처s.map(repo => 곁들임(repo.reads())),
      곁들임(model태그s.getInstance().reads()),
      곁들임(model태그관계s.getInstance().reads())
    ])
  }

  /**
   * 출처가 다 실려 왔나. 달력 화면의 「준비됨」이 이걸 본다.
   *
   * `ref` 를 `reads().then()` 으로 올리면 **SSR 과 클라 첫 렌더가 갈린다** — 서버는 기다린 뒤
   * 참으로 찍고, 클라는 하이드레이션 시점에 아직 거짓이라 달력이 한 번 지워진다. 출처의
   * `is읽기완료` 는 payload 로 실려 온 목록에도 서 있으므로(`bindPayload`) 양쪽이 같다.
   */
  is읽기완료 = computed(() => this.출처s.every(repo => toValue(repo.is읽기완료)))

  /**
   * 범례. 표본 한 행의 칸 정의에서 뽑는다 — 행이 하나도 없는 표는 범례에도 안 나온다.
   * (`aiV2/source.ts` 의 `탭s` 가 같은 이유로 표본을 쓴다.)
   */
  범례 = computed<i달력범례항목[]>(() => {
    const out: i달력범례항목[] = []
    for (const repo of this.출처s) {
      const 표본 = (toValue(repo.list) as i행[])[0]
      if (!표본) continue
      for (const 칸 of 칸sOf(표본)) {
        const 설정 = 설정of(칸)
        if (!설정) continue
        // 표시가 라벨을 안 정했으면 「표 이름 + 칸 이름」— 행사·수업이 같은 `기간` 칸을 쓰므로 표 이름이 있어야 갈린다.
        const 표라벨 = repo.메뉴?.label
        out.push({
          key: `${repo.tableName}:${칸.key}`,
          label: 설정.label ?? (표라벨 ? `${표라벨} ${칸.label ?? 칸.key}` : (칸.label ?? 칸.key!)),
          color: 설정.color,
          icon: 설정.icon ?? repo.메뉴?.아이콘 ?? 기본아이콘
        })
      }
    }
    return out
  })

  /** 달력 항목 전부, 시작 시각순. */
  list = computed<i달력항목[]>(() => {
    void toValue(model태그관계s.getInstance().list)
    const out: i달력항목[] = []
    for (const repo of this.출처s) {
      for (const 행 of toValue(repo.list) as i행[])
        out.push(...this.항목sOf(repo, 행))
    }
    return out.sort((a, b) => a.start.getTime() - b.start.getTime())
  })

  getsBy출처 = (key: i달력출처) => toValue(this.list).filter(x => x.legendKey === key)

  private 항목sOf(repo: i출처repo, 행: i행): i달력항목[] {
    const sourceId = String(행.stateId ?? '').trim()
    if (!sourceId) return []

    const out: i달력항목[] = []
    for (const 칸 of 칸sOf(행)) {
      const 설정 = 설정of(칸)
      if (!설정) continue
      if (!toValue(칸.show ?? true)) continue

      const 때 = this.때of(행[칸.key!], 시각있는타입s.has(칸.type!))
      if (!때) continue

      // 태그 라벨은 태그 도메인의 것이다. 태그가 붙는 표(일정·메모·자료)만 `태그s` 를 갖는다.
      const 태그 = (행.태그s as { 경로라벨?: string }[] | undefined)?.[0]
      out.push({
        id: `${repo.tableName}:${칸.key}:${sourceId}`,
        title: 행.label || 칸.label || '',
        ...때,
        color: 설정.행색?.(행) ?? 설정.color,
        source: repo.tableName,
        sourceId,
        legendKey: `${repo.tableName}:${칸.key}`,
        tag: 태그?.경로라벨,
        icon: 행.icon
      })
    }
    return out
  }

  /**
   * 칸 값 → 시작·끝. 값의 모양이 타입을 말한다: `mDayjs` 하나면 날짜, `[mDayjs, mDayjs]` 면 기간.
   * `날짜`·`기간` 은 종일이고, `날짜2`·`기간시간` 이거나 값에 시각이 있으면 시간대다.
   */
  private 때of(값: unknown, is시각타입: boolean): Pick<i달력항목, 'start' | 'end' | 'allDay'> | null {
    let startD: mDayjs, endD: mDayjs | undefined
    if (is_Period(값)) [startD, endD] = 값 as i기간
    else if (is_mDayjs(값)) startD = 값 as mDayjs
    else return null
    if (!startD?.isValid?.()) return null
    if (endD && !endD.isValid?.()) endD = undefined

    const allDay = !is시각타입 && !hasClockTime(startD) && (!endD || !hasClockTime(endD))
    const start = allDay ? startD.startOf('day').toDate() : startD.toDate()
    // **종일의 끝은 늘 배타다**(다음 날 0시). 한 칸만 배타로 내보내고 여러 날은 포함으로 내보내면
    // 받는 쪽이 8/8~8/9 와 8/8 하루를 구분할 수 없다 — 둘 다 `end = 8/9 00:00` 이 되기 때문이다.
    // FullCalendar 도 배타로 읽는다.
    const end = allDay
      ? toExclusiveEnd(endD?.isAfter(startD) ? endD.startOf('day').toDate() : start)
      : (endD?.isAfter(startD) ? endD.toDate() : defaultTimedEnd(start))
    return { start, end, allDay }
  }
}

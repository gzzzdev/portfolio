import { computed, toValue } from 'vue'
import { mDayjs, toCompactDates, type i기간 } from '~utils'
import { BaseModels2, BaseModel2, getRepoInstance, pksOf } from '~utils/models'
import type { BaseXXDto, BaseXX, iID } from '~utils/models'

import { model태그s, type model태그 } from './model태그'
import { model메모s, type model메모 } from './model메모'
import { model일정s, type model일정 } from './model일정'
// import { model자료s, type model자료 } from './model자료'
import { renderComps } from '~/components/view/렌더/renderComps'

export interface i태그관계dto extends BaseXXDto {
  tagId: iID
  memoId: iID
  eventId: iID
  resourceId: iID
  startDate: Date
  endDate: Date | null
  reason: string
}

export interface i태그관계 extends BaseXX {
  태그id: string | number
  태그: model태그
  메모: model메모 | undefined
  일정: model일정 | undefined
  // 자료: model자료 | undefined
  기간: i기간
  사유: string
  is현재: boolean
}

export class model태그관계s extends BaseModels2<model태그관계, i태그관계dto> {
  static getInstance = () => getRepoInstance('model태그관계s', () => new model태그관계s())

  private constructor() {
    super(model태그관계, 'tag-links', { hasConfirm: false })
  }

  override _generate = () => new model태그관계().generate()
  override _init = () => new model태그관계().init()

  getsBy태그 = (태그: model태그) => toValue(this.list).filter(row => row.태그?.isSame(태그))

  get현재sBy태그 = (태그: model태그) => this.getsBy태그(태그).filter(row => row.is현재)

  get현재By태그_메모 = (태그: model태그, 메모: model메모) =>
    this.get현재sBy태그(태그).find(row => row.메모?.isSame(메모)) ?? null

  get현재By태그_일정 = (태그: model태그, 일정: model일정) =>
    this.get현재sBy태그(태그).find(row => row.일정?.isSame(일정)) ?? null

  get메모sBy태그 = (태그: model태그) => {
    const 메모ById = new Map<string, model메모>()
    for (const row of this.get현재sBy태그(태그)) {
      if (row.메모)
        메모ById.set(String(row.메모.stateId), row.메모)
    }
    return [...메모ById.values()]
  }

  get일정sBy태그 = (태그: model태그) => {
    const 일정ById = new Map<string, model일정>()
    for (const row of this.get현재sBy태그(태그)) {
      if (row.일정)
        일정ById.set(String(row.일정.stateId), row.일정)
    }
    return [...일정ById.values()]
  }

  get현재sBy메모 = (메모: model메모) =>
    toValue(this.list).filter(row => row.is현재 && row.메모?.isSame(메모))

  get현재sBy일정 = (일정: model일정) =>
    toValue(this.list).filter(row => row.is현재 && row.일정?.isSame(일정))

  get태그sBy메모 = (메모: model메모): model태그[] => [
    ...new Map(
      this.get현재sBy메모(메모).map(row => [String(row.태그.stateId), row.태그] as const)
    ).values()
  ]

  get태그sBy일정 = (일정: model일정): model태그[] => [
    ...new Map(
      this.get현재sBy일정(일정).map(row => [String(row.태그.stateId), row.태그] as const)
    ).values()
  ]

  // 자료 연결은 걷었다 — `model자료.태그s`가 문자열 배열이 됐다. 되살리려면 이 블록과 `model자료` 주석을 같이 푼다.
  /*
  get현재sBy자료 = (자료: model자료) =>
    toValue(this.list).filter(row => row.is현재 && row.자료?.isSame(자료))

  get태그sBy자료 = (자료: model자료): model태그[] => [
    ...new Map(
      this.get현재sBy자료(자료).map(row => [String(row.태그.stateId), row.태그] as const)
    ).values()
  ]

  get자료sBy태그 = (태그: model태그) => {
    const 자료ById = new Map<string, model자료>()
    for (const row of this.get현재sBy태그(태그)) {
      if (row.자료)
        자료ById.set(String(row.자료.stateId), row.자료)
    }
    return [...자료ById.values()]
  }

  do자료태그변경 = async (자료: model자료, to태그?: model태그 | null, reason: string = '자료 태그 변경') => {
    if (!to태그) return

    const 현재s = this.get현재sBy자료(자료)
    if (현재s.length === 1 && 현재s[0]?.태그?.isSame(to태그)) return

    if (!confirm(`${자료.제목}의 태그를 ${to태그.경로라벨}로 변경하시겠습니까? 바로 적용됩니다.`))
      return

    const pks = pksOf({ 태그: to태그, 자료 })
    if (!pks) return

    const 새관계 = await this.create({
      tagId: pks.태그,
      memoId: '',
      eventId: '',
      resourceId: pks.자료,
      startDate: mDayjs().toDate(),
      endDate: null,
      reason
    }, !false)

    const 종료일 = mDayjs().toDate()
    현재s.forEach((row) => {
      row.state.endDate = 종료일
    })
    return this.do모두저장([...현재s, 새관계])
  }
  */

  do태그변경 = async (메모: model메모, to태그?: model태그 | null, reason: string = '메모 태그 변경') => {
    if (!to태그) return

    const 현재s = this.get현재sBy메모(메모)
    if (현재s.length === 1 && 현재s[0]?.태그?.isSame(to태그)) return

    if (!confirm(`${메모.이름}의 태그를 ${to태그.경로라벨}로 변경하시겠습니까? 바로 적용됩니다.`))
      return

    const pks = pksOf({ 태그: to태그, 메모 })
    if (!pks) return

    const 새관계 = await this.create({
      tagId: pks.태그,
      memoId: pks.메모,
      eventId: '',
      resourceId: '',
      startDate: mDayjs().toDate(),
      endDate: null,
      reason
    }, !false)

    const 종료일 = mDayjs().toDate()
    현재s.forEach((row) => {
      row.state.endDate = 종료일
    })
    return this.do모두저장([...현재s, 새관계])
  }

  do일정태그변경 = async (일정: model일정, to태그?: model태그 | null, reason: string = '일정 태그 변경') => {
    if (!to태그) return

    const 현재s = this.get현재sBy일정(일정)
    if (현재s.length === 1 && 현재s[0]?.태그?.isSame(to태그)) return

    if (!confirm(`${일정.이름}의 태그를 ${to태그.경로라벨}로 변경하시겠습니까? 바로 적용됩니다.`))
      return

    const pks = pksOf({ 태그: to태그, 일정 })
    if (!pks) return

    const 새관계 = await this.create({
      tagId: pks.태그,
      memoId: '',
      eventId: pks.일정,
      resourceId: '',
      startDate: mDayjs().toDate(),
      endDate: null,
      reason
    }, !false)

    const 종료일 = mDayjs().toDate()
    현재s.forEach((row) => {
      row.state.endDate = 종료일
    })
    return this.do모두저장([...현재s, 새관계])
  }

  do메모변경 = async (태그: model태그, to메모: model메모, reason: string = '태그 메모 변경') => {
    if (!confirm(`${태그.이름}의 메모를 ${to메모.label}로 변경하시겠습니까? 바로 적용됩니다.`))
      return

    const pks = pksOf({ 태그, 메모: to메모 })
    if (!pks) return

    const 현재s = this.get현재sBy태그(태그).filter(row => row.메모)
    const 새관계 = await this.create({
      tagId: pks.태그,
      memoId: pks.메모,
      eventId: '',
      resourceId: '',
      startDate: mDayjs().toDate(),
      endDate: null,
      reason
    }, !false)

    const 종료일 = mDayjs().toDate()
    현재s.forEach((row) => {
      row.state.endDate = 종료일
    })
    return this.do모두저장([...현재s, 새관계])
  }

  do메모추가 = async (태그: model태그, to메모: model메모, reason: string = '태그 메모 추가') => {
    const 현재 = this.get현재By태그_메모(태그, to메모)
    if (현재) return 현재

    if (!confirm(`${태그.이름}에게 ${to메모.label} 메모를 추가하시겠습니까? 바로 적용됩니다.`))
      return

    const pks = pksOf({ 태그, 메모: to메모 })
    if (!pks) return

    const 새관계 = await this.create({
      tagId: pks.태그,
      memoId: pks.메모,
      eventId: '',
      resourceId: '',
      startDate: mDayjs().toDate(),
      endDate: null,
      reason
    }, !false)
    return this.do모두저장([새관계])
  }

  do일정추가 = async (태그: model태그, to일정: model일정, reason: string = '태그 일정 추가') => {
    const 현재 = this.get현재By태그_일정(태그, to일정)
    if (현재) return 현재

    if (!confirm(`${태그.이름}에게 ${to일정.label} 일정을 추가하시겠습니까? 바로 적용됩니다.`))
      return

    const pks = pksOf({ 태그, 일정: to일정 })
    if (!pks) return

    const 새관계 = await this.create({
      tagId: pks.태그,
      memoId: '',
      eventId: pks.일정,
      resourceId: '',
      startDate: mDayjs().toDate(),
      endDate: null,
      reason
    }, !false)
    return this.do모두저장([새관계])
  }

  /**
     * 태그 상세 카드s 빈생성: 메모를 **초안으로** 만들고, 저장되면 이 태그에 잇는다.
     *
     * 예전엔 메모를 곧장 POST했다 — 관계행의 `memoId`로 쓸 PK가 당장 필요해서였다.
     * 그 대가로 사용자가 손도 안 댄 빈 메모가 DB에 쌓였다. 이제 연결을 **메모의 저장 뒷일**로 미룬다.
     *
     * 대신 저장 전까지는 관계행이 없어서 태그 카드 목록에 안 뜬다 — 그래서 안내를 띄운다.
     */
  do빈생성메모 = async (태그: model태그) => {
    if (!pksOf({ 태그 })) return

    const 메모 = await model메모s.getInstance().empty()
    if (!메모) return

    메모.do저장후에({
      qId: `태그연결:${태그.rowKey}`,
      label: `태그 연결 (${태그.이름})`,
      // PK는 반드시 여기서 읽는다 — 큐가 도는 시점에야 메모에 서버 PK가 붙는다.
      func: async () => {
        const pks = pksOf({ 태그, 메모 })
        if (!pks) return
        const 새관계 = await this.create({
          tagId: pks.태그,
          memoId: pks.메모,
          eventId: '',
          resourceId: '',
          startDate: mDayjs().toDate(),
          endDate: null,
          reason: '태그에서 메모 생성'
        }, !false)
        await this.do모두저장([새관계])
      }
    })

    useAlert().log('메모를 만들었습니다', `저장하면 ${태그.이름}에 연결됩니다`)
    return 메모
  }

  /** 태그 상세 카드s 빈생성: 일정을 **초안으로** 만들고, 저장되면 이 태그에 잇는다(`do빈생성메모` 참고). */
  do빈생성일정 = async (태그: model태그) => {
    if (!pksOf({ 태그 })) return

    const 일정 = await model일정s.getInstance().empty()
    if (!일정) return

    일정.do저장후에({
      qId: `태그연결:${태그.rowKey}`,
      label: `태그 연결 (${태그.이름})`,
      func: async () => {
        const pks = pksOf({ 태그, 일정 })
        if (!pks) return
        const 새관계 = await this.create({
          tagId: pks.태그,
          memoId: '',
          eventId: pks.일정,
          resourceId: '',
          startDate: mDayjs().toDate(),
          endDate: null,
          reason: '태그에서 일정 생성'
        }, !false)
        await this.do모두저장([새관계])
      }
    })

    useAlert().log('일정을 만들었습니다', `저장하면 ${태그.이름}에 연결됩니다`)
    return 일정
  }

  do메모해제 = (태그: model태그, 메모: model메모) => {
    const 현재 = this.get현재By태그_메모(태그, 메모)
    if (!현재) return
    if (!confirm(`${태그.이름}에게서 ${메모.label} 메모를 해제하시겠습니까? 바로 적용됩니다.`))
      return

    현재.state.endDate = mDayjs().toDate()
    return 현재.do저장(false, false)
  }

  do일정해제 = (태그: model태그, 일정: model일정) => {
    const 현재 = this.get현재By태그_일정(태그, 일정)
    if (!현재) return
    if (!confirm(`${태그.이름}에게서 ${일정.label} 일정을 해제하시겠습니까? 바로 적용됩니다.`))
      return

    현재.state.endDate = mDayjs().toDate()
    return 현재.do저장(false, false)
  }
}

export class model태그관계 extends BaseModel2<i태그관계dto> implements i태그관계 {
  constructor(state?: i태그관계dto) {
    super(model태그관계s.getInstance(), state)
  }

  override afterCreate = () => { }
  override beforeSave = () => true
  override afterSave = () => { }

  override 자동필드ss = [
    {
      label: '기본',
      list: []
    }
  ]

  override generate() { return this.init() }

  override init() {
    return {
      tagId: '',
      memoId: '',
      eventId: '',
      resourceId: '',
      startDate: new Date(),
      endDate: null,
      reason: ''
    }
  }

  get 연결대상() { return this.메모 ?? this.일정 /* ?? this.자료 */ }

  override get icon() { return this.연결대상?.icon ?? 'i-lucide-link' }
  override get label() {
    if (this.메모) return `${this.메모.label} 연결`
    if (this.일정) return `${this.일정.label} 연결`
    // if (this.자료) return `${this.자료.label} 연결`
    return '태그 관계'
  }

  override get sub() { return toCompactDates(this.기간[0], this.기간[1]) }

  get 태그id() { return this.state.tagId }
  set 태그id(v: string) { this.state.tagId = v }
  get 태그() { return model태그s.getInstance().getById(this.태그id)! }

  get 메모() {
    const id = String(this.state?.memoId ?? '').trim()
    if (!id) return undefined
    return model메모s.getInstance().getById(id)
  }

  get 일정() {
    const id = String(this.state?.eventId ?? '').trim()
    if (!id) return undefined
    return model일정s.getInstance().getById(id)
  }

  // get 자료() {
  //   const id = String(this.state?.resourceId ?? '').trim()
  //   if (!id) return undefined
  //   return model자료s.getInstance().getById(id)
  // }

  get 기간() { return [mDayjs(this.state.startDate), mDayjs(this.state.endDate)] as i기간 }
  set 기간(v) { this.state.startDate = v[0].toDate(); this.state.endDate = v[1].toDate() }

  get 사유() { return this.state.reason }
  set 사유(v: string) { this.state.reason = v }

  get is현재() { return this.state.endDate == null }
  get is종료() { return !this.is현재 }

  _content = computed(() => {
    const target = this.연결대상
    return {
      comp: renderComps.div,
      props: { class: 'flex flex-col w-full gap-2' },
      children: [
        {
          comp: renderComps.div,
          props: { class: 'flex flex-row items-end' },
          children: [
            { comp: renderComps.UBadge, props: { label: target?.label, icon: target?.icon } },
            { comp: renderComps.div, value: ` 로 연결 됨`, props: { class: 'text-sm text-muted' } }
          ]
        },
        {
          comp: renderComps.div,
          props: { class: 'w-1/2 flex flex-row items-center gap-1.5 mr-3' },
          children: [
            { comp: renderComps.div, value: '사유', props: { class: 'text-xs text-muted' } },
            { comp: renderComps.div, props: { class: 'text-primary font-medium' }, value: this.사유 || '없음' }
          ]
        }
      ]
    }
  })

  override get content() {
    return toValue(this._content)
  }
}

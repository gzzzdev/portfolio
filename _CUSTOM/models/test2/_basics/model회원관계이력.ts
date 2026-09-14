import { computed, toValue } from 'vue'
import { buildQrVerifyUrl, mDayjs, toCompactDates, type i기간 } from '~utils'
import { BaseModels2, BaseModel2, 타입지정, getRepoInstance, pksOf, 시드PK } from '~utils/models'
import type { BaseXXDto, BaseXX, iID } from '~utils/models'

import { model회원s, type model회원 } from './model회원'
import { model역할s, type model역할 } from './model역할'
import { model등급s, type model등급 } from '../grades'
import { renderComps } from '~/components/view/렌더/renderComps'

export type i회원관계이력엔티티타입 = 'roles' | 'grades'

type i기록엔티티 = model역할 | model등급

export interface i회원관계이력dto extends BaseXXDto {
  memberId: iID
  roleId?: iID
  gradeId?: iID
  startDate: Date
  endDate: Date | null
  reason: string
}

export interface i회원관계이력 extends BaseXX {
  회원id: string | number
  회원: model회원
  기간: i기간
  사유: string

  엔티티: i기록엔티티
  역할: model역할 | undefined
  등급: model등급 | undefined
  is현재: boolean
}

const i엔티티맵 = {
  get roles() { return model역할s.getInstance() },
  get grades() { return model등급s.getInstance() }
}

export class model회원관계이력s extends BaseModels2<model회원관계이력, i회원관계이력dto> {
  static getInstance = () => getRepoInstance('model회원관계이력s', () => new model회원관계이력s())

  private constructor() {
    super(model회원관계이력, 'member-entity-historys', { hasConfirm: false })
  }

  override _generate = () => new model회원관계이력().generate()
  override _init = () => new model회원관계이력().init()

  역할이력s = computed(() => toValue(this.list).filter(row => row.state.roleId != null))
  등급이력s = computed(() => toValue(this.list).filter(row => row.state.gradeId != null))

  getsBy회원 = (_회원: model회원) => toValue(this.list).filter(row => row.회원?.isSame(_회원))
  // 따로 엔티티 이력만 부를일이 없긴함..
  get등급이력sBy회원 = (_회원: model회원) => toValue(this.등급이력s).filter(row => row.회원?.isSame(_회원))
  get역할이력sBy회원 = (_회원: model회원) => toValue(this.역할이력s).filter(row => row.회원?.isSame(_회원))

  // 회원?. => 1개인경우가 있기 떄문.

  get현재이력By회원_엔티티 = (회원: model회원, entityKey: keyof i회원관계이력dto) => {
    return toValue(this.list).find(row => row.회원id == 회원.stateId && row.is현재 && row.state[entityKey] != null) ?? null
  }

  get현재역할이력sBy회원 = (회원: model회원) =>
    this.get역할이력sBy회원(회원).filter(row => row.is현재)

  get현재역할이력By회원_역할 = (회원: model회원, 역할: model역할) =>
    this.get현재역할이력sBy회원(회원).find(row => row.역할?.isSame(역할)) ?? null

  // --- 현재만 : 딱히 전이력까지 부르는 경우가 잘 없음 --- //
  get등급By회원 = (회원: model회원) => this.get등급이력sBy회원(회원).find(row => row.is현재)?.등급
  get역할sBy회원 = (회원: model회원) => {
    const 역할ById = new Map<string, model역할>()
    for (const row of this.get현재역할이력sBy회원(회원)) {
      if (row.역할)
        역할ById.set(String(row.역할.stateId), row.역할)
    }
    return [...역할ById.values()]
  }

  get회원sBy등급 = (등급: model등급) => toValue(this.등급이력s).filter(row => row.is현재 && row.등급?.isSame(등급)).map(x => x.회원)
  get회원sBy역할 = (역할: model역할) => [
    ...new Map(
      toValue(this.역할이력s)
        .filter(row => row.is현재 && row.역할?.isSame(역할))
        .map(row => [String(row.회원.stateId), row.회원] as const)
    ).values()
  ]

  async _do기록(회원: model회원, 엔티티: i기록엔티티, 사유: string) {
    const getKeyOfId = (엔티티: i기록엔티티) => `${엔티티.메뉴명.slice(0, -1)}Id` as keyof i회원관계이력dto
    const pks = pksOf({ 회원, 엔티티 })
    if (!pks) return

    const 전이력 = this.get현재이력By회원_엔티티(회원, getKeyOfId(엔티티))
    if (전이력) {
      const is최소시간 = (mDayjs().diff(전이력.기간[0], 'seconds')) < 5
      if (is최소시간) {
        전이력.state[getKeyOfId(엔티티)] = pks.엔티티
        return 전이력.do저장(false, false)
      } else
        전이력.state.endDate = mDayjs().toDate()
    }

    console.log(getKeyOfId(엔티티))
    const 새이력 = await this.create({
      memberId: pks.회원,
      [getKeyOfId(엔티티)]: pks.엔티티,
      startDate: mDayjs().toDate(),
      endDate: null,
      reason: 사유
    }, !false)

    console.log(새이력.state)

    return this.do모두저장(전이력 ? [전이력, 새이력] : [새이력])
  }

  do등급기록 = (회원: model회원, to등급?: model등급, reason: string = '회원 등급 선택기 변경') => {
    if (!to등급)
      to등급 = model등급s.getInstance().get기본등급()
    else if (!confirm(`${회원.이름}을 ${to등급.label}로 변경하시겠습니까? 바로 적용됩니다.`))
      return
    return this._do기록(회원, to등급, reason)
  }

  do역할변경 = async (회원: model회원, to역할: model역할, reason: string = '회원 역할 변경') => {
    if (!confirm(`${회원.이름}의 역할을 ${to역할.label}로 변경하시겠습니까? 바로 적용됩니다.`))
      return

    const pks = pksOf({ 회원, 역할: to역할 })
    if (!pks) return

    const 현재역할이력s = this.get현재역할이력sBy회원(회원)
    const 새이력 = await this.create({
      memberId: pks.회원,
      roleId: pks.역할,
      startDate: mDayjs().toDate(),
      endDate: null,
      reason
    }, !false)

    const 종료일 = mDayjs().toDate()
    현재역할이력s.forEach((row) => {
      row.state.endDate = 종료일
    })
    return this.do모두저장([...현재역할이력s, 새이력])
  }

  /**
     * 시드가 선언한 역할을 이력으로 세운다. `i회원seed.역할codes` → `member-entity-historys`.
     *
     * **`do역할추가`를 안 쓴다.** 그쪽은 기본 역할이 아닐 때 `confirm()`을 띄우고
     * 기본 역할과 겹치면 `do역할변경`으로 새는데, 둘 다 사람이 보는 화면의 규칙이다.
     * 시드는 사람 없이 도는 데다 "선언한 대로 정확히" 들어가야 한다.
     *
     * 역할 PK는 `시드PK` 등록부에서 꺼낸다 — `useSystem`의 순서상 역할이 회원보다 먼저 만들어진다.
     * 못 찾으면 던진다. 역할 없는 계정은 로그인해도 갈 데가 없어서, 조용히 넘기면
     * 화면이 빈 이유를 한참 뒤에 찾게 된다.
     */
  do시드역할부여 = async (회원: model회원, codes: readonly string[]) => {
    const 회원id = 회원.stateId
    if (회원id == null) return

    const rows = codes.map((code) => {
      const roleId = 시드PK.찾기('roles', code)
      if (!roleId)
        throw new Error(
          `[회원 seed] 역할 '${code}'가 시드PK 등록부에 없다.`
          + ` 역할이 이전 실행에서 이미 채워졌다면 등록부가 비어 있다 —`
          + ` 역할·회원을 함께 비우고 초기데이터를 한 번에 돌릴 것.`
        )
      return {
        memberId: 회원id,
        roleId,
        startDate: mDayjs().toDate(),
        endDate: null,
        reason: '초기데이터'
      } as unknown as Omit<i회원관계이력dto, 'id'>
    })

    return this.creates(rows)
  }

  do역할추가 = async (회원: model회원, to역할?: model역할, reason?: string) => {
    const is기본역할부여 = !to역할
    if (!to역할)
      to역할 = model역할s.getInstance().get기본역할()

    const 현재이력 = this.get현재역할이력By회원_역할(회원, to역할)
    if (현재이력) return 현재이력

    const 현재역할이력s = this.get현재역할이력sBy회원(회원)
    const 현재기본역할이력 = 현재역할이력s
      .find(row => row.역할?.is기본옵션)
    if (현재기본역할이력 || (to역할.is기본옵션 && 현재역할이력s.length > 0))
      return this.do역할변경(회원, to역할, reason)

    if (!is기본역할부여 && !confirm(`${회원.이름}에게 ${to역할.label} 역할을 추가하시겠습니까? 바로 적용됩니다.`))
      return

    const pks = pksOf({ 회원, 역할: to역할 })
    if (!pks) return

    const 새이력 = await this.create({
      memberId: pks.회원,
      roleId: pks.역할,
      startDate: mDayjs().toDate(),
      endDate: null,
      reason: reason ?? '회원 역할 추가'
    }, !false)
    return this.do모두저장([새이력])
  }

  do역할해제 = (회원: model회원, 역할: model역할) => {
    const 현재이력 = this.get현재역할이력By회원_역할(회원, 역할)
    if (!현재이력) return
    if (!confirm(`${회원.이름}에게서 ${역할.label} 역할을 해제하시겠습니까? 바로 적용됩니다.`))
      return

    현재이력.state.endDate = mDayjs().toDate()
    return 현재이력.do저장(false, false)
  }
}

export class model회원관계이력 extends BaseModel2<i회원관계이력dto> implements i회원관계이력 {
  constructor(state?: i회원관계이력dto) {
    super(model회원관계이력s.getInstance(), state)
  }

  override afterCreate = () => { }
  override beforeSave = () => true
  override afterSave = () => { }

  override 자동필드ss = [
    {
      label: '기본',
      list: [
        // { key: '기간', label: '기간', type: 타입지정._.기간시간, show: computed(() => !this.is현재),props: { readonly: true }, canEdit: false },
        // { key: '사유', label: '사유', type: 타입지정._.문자, show: true, props: { readonly: true } },
        // { key: '아이콘', label: '아이콘', type: 타입지정._.아이콘, show: true, canEdit: false },
      ]
    }
  ]

  /**
     * 이력 카드 위의 행동. **등급 행에만 뜬다** — 역할 행에는 뽑을 종이가 없다.
     *
     * 이 자리에 있는 이유는 발급 단위가 이 행이라서다. 회원 화면의 '등급증' 버튼은 회원 축이라
     * 현재 등급 한 장만 뽑지만, 여기서는 그 행의 증서가 나오므로 작년에 딴 등급도 다시 뽑힌다.
     */
  override 자동버튼s = this.기본버튼s.concat([
    {
      key: 'do등급증출력',
      label: '등급증',
      icon: 'i-ph-certificate',
      show: computed(() => this.state?.gradeId != null)
    }
  ])

  override generate() { return this.init() }

  override init() {
    return {
      memberId: '',
      startDate: new Date(),
      endDate: null,
      reason: ''
    }
  }

  override get icon() {
    return i엔티티맵[this.엔티티?.메뉴명].메뉴.아이콘
    //     return this.엔티티?.아이콘
  }

  override get label() {
    return i엔티티맵[this.엔티티?.메뉴명].메뉴.label + '수정'
  }

  override get sub() { return toCompactDates(this.기간[0], this.기간[1]) }

  get 회원id() { return this.state.memberId }
  set 회원id(v: string) { this.state.memberId = v }
  get 회원() { return model회원s.getInstance().getById(this.회원id)! } // 회원이 없는경우는 없음.

  get 기간() { return [mDayjs(this.state.startDate), mDayjs(this.state.endDate)] as i기간 }
  set 기간(v) { this.state.startDate = v[0].toDate(); this.state.endDate = v[1].toDate() }

  get 사유() { return this.state.reason }
  set 사유(v: string) { this.state.reason = v }

  get is현재() { return this.state.endDate == null }
  get is종료() { return !this.is현재 }

  // --- 엔티티 --- //

  get 엔티티() {
    if (this.state.roleId != null) return model역할s.getInstance().getById(this.state.roleId)
    if (this.state.gradeId != null) return model등급s.getInstance().getById(this.state.gradeId)
    return null // 이런 경우는 없음.
  }

  get 역할() { return model역할s.getInstance().getById(this.state?.roleId) }
  get 등급() { return model등급s.getInstance().getById(this.state?.gradeId) }

  /* ---- 등급증 --------------------------------------------------------
     * **등급 취득 한 건에 등급증 한 장이다.** 그래서 발급을 담는 표가 따로 없다 —
     * 이 행이 곧 발급 단위고, 번호도 검증 대상도 이 행의 것이다.
     *
     * 한때 그 셋을 회원이 들었다(`model회원.발급번호`·`QR`). 그러면 등급이 올라가도 번호가
     * 그대로였고, 검증 QR 은 "이 사람이 있다"만 말했다 — 대조할 취득 건이 없었기 때문이다.
     *
     * 아래는 등급 행일 때만 뜻이 있다. 역할 행에서 부르면 빈 값이다.
     * ------------------------------------------------------------------ */

  /**
     * 이 등급을 취득한 날. **등급증에 찍히는 발급일이 이것이다.**
     *
     * 뽑은 날이 아니다 — 증서에 적는 날짜는 취득일이고, 뽑을 때마다 달라지는 값은
     * 같은 종이를 두 번 뽑았을 때 두 장이 서로 다른 문서가 되게 만든다.
     * (재발급본에 뽑은 날을 따로 적어야 하는 규칙이 생기면 그때는 이 행의 값이 아니라
     *  재발급 시점의 값이므로 `meta` 같은 칸이 필요하다. 지금은 그 규칙이 없다)
     */
  get 발급일() { return this.기간[0] }

  /**
     * 등급증 발급번호.
     *
     * 연도는 뽑은 해가 아니라 **취득한 해**다. 재발급해도 같은 번호가 나오고, 등급이 올라가면
     * 새 행이라 번호도 새로 난다 — 번호가 가리키는 것이 사람이 아니라 취득 건이라서다.
     *
     * **id 를 자르지 않는다.** 뒷 세 자리만 쓰던 때가 있었는데 그러면 행 1001 과 2001 이
     * 같은 번호를 낸다. 자리를 맞추려고 자른 것이 번호의 유일성을 깬 경우다.
     */
  get 발급번호() {
    if (this.state.gradeId == null) return ''
    return `GRD-${this.발급일.format('YYYY')}-${this.stateId}`
  }

  /** 종이의 QR 에 담기는 주소. 가리키는 것은 회원이 아니라 **이 행**이다 (`qrVerify.ts`) */
  get 검증URL() {
    return buildQrVerifyUrl({ type: 'grade', id: String(this.stateId ?? '') })
  }

  /**
     * 이 취득 건의 등급증을 연다. **과거 등급의 증서도 여기서 나온다** —
     * 회원 쪽 버튼(`model회원.do등급증출력`)은 현재 등급 한 장만 뽑는다.
     *
     * 값을 대는 표는 회원이 든다(`model회원.디자인틀주입`). 조직 상수·이름·사진이 그쪽 것이라
     * 여기서 다시 모으면 두 벌이 되고, 이 행이 대는 것은 등급·발급일·발급번호뿐이다.
     */
  do등급증출력 = () => this.회원?.do등급증출력_이력(this)

  _content = computed(() => {
    return {
      comp: renderComps.div,
      props: { class: 'flex flex-col w-full gap-2' },
      children: [
        {
          comp: renderComps.div,
          props: { class: 'flex flex-row items-end' },
          children: [
            { comp: renderComps.UBadge, props: { label: this.엔티티?.label, icon: this.엔티티?.아이콘 } },
            { comp: renderComps.div, value: ` 로 수정 됨`, props: { class: 'text-sm text-muted' } }
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

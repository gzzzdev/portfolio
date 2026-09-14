import { BaseModels2, BaseModel2, 타입지정, getRepoInstance, hasServerPk } from '~utils/models'
import type { BaseXXDto, BaseXX } from '~utils/models'
import { computed, toValue } from 'vue'

import { i승급목표등급seed, model등급s, type model등급 } from './model등급'
import { model등급심사s, type model등급심사 } from './model등급심사'
import { model회원의등급심사s, type model회원의등급심사 } from './model회원의등급심사'
import { model회원s, type model회원 } from '~models/test2'

export interface i등급별심사dto extends BaseXXDto {

  gradingEventId: string
  targetGradeId: string
}

export interface i등급별심사 extends BaseXX {
  등급심사: model등급심사 | null
  목표등급: model등급 | null
  회원의등급심사s: model회원의등급심사[]
  대상자수: number
  합격자수: number
  불합격자수: number
}

export class model등급별심사s extends BaseModels2<model등급별심사, i등급별심사dto> {
  protected etcFields = []
  static getInstance = () => getRepoInstance('model등급별심사s', () => new model등급별심사s())

  private constructor() {
    super(model등급별심사, 'per-gradings', { hasConfirm: false })
  }

  override _generate = () => new model등급별심사().generate()
  override _init = () => new model등급별심사().init()

  getsBy등급심사 = (등급심사: model등급심사): model등급별심사[] =>
    toValue(this.list)
      .filter(row => row.등급심사?.isSame(등급심사))
      .toSorted(
        (a, b) =>
          (a.목표등급?.급수 ?? 0) - (b.목표등급?.급수 ?? 0)
          || String(a.state?.id ?? '').localeCompare(String(b.state?.id ?? ''), undefined, {
            numeric: true
          })
      )

  /** 목표 등급 기준 — 회차 심사일 최신순 */
  getsBy목표등급 = (등급: model등급): model등급별심사[] =>
    toValue(this.list)
      .filter(row => row.목표등급?.isSame(등급))
      .toSorted((a, b) => {
        const dateA = a.등급심사?.심사일?.valueOf() ?? 0
        const dateB = b.등급심사?.심사일?.valueOf() ?? 0
        return (
          dateB - dateA
          || String(b.state?.id ?? '').localeCompare(String(a.state?.id ?? ''), undefined, {
            numeric: true
          })
        )
      })

  getBy등급심사_목표등급 = (
    등급심사: model등급심사,
    목표등급: model등급
  ): model등급별심사 | null =>
    this.getsBy등급심사(등급심사).find(row => row.목표등급?.isSame(목표등급)) ?? null

  /**
   * 회차 저장 후 승급 목표 등급별 트랙 자동 생성.
   *
   * `afterCreate`/`afterSave`가 부르는 자리라 저장 전 행은 **조용히** 물러난다 —
   * `pksOf`의 "저장 필요" 안내를 띄우면 매 저장마다 알림이 뜬다.
   */
  ensureFor등급심사 = async (등급심사: model등급심사) => {
    const eid = 등급심사?.stateId
    if (!hasServerPk(eid)) return

    const existing = new Set(
      this.getsBy등급심사(등급심사).map(row => String(row.state.targetGradeId ?? '').trim())
    )
    /**
     * 시드가 아니라 **목록의 등급**으로 만든다.
     *
     * 예전엔 `String(row.id)` — 시드에 적힌 PK를 그대로 `targetGradeId`에 넣었다. 그 값은
     * 서버가 매긴 PK와 무관하므로(시드의 id는 서버에 닿지도 않는다) 만들어지는 행이 통째로
     * 끊긴 FK를 든다. supabase에서 등급 id가 1~4로 매겨지자 드러났고, 타입(`Omit<…,'id'>`)이
     * 그제야 잡았다. 시드에서 가져올 건 **어느 등급이냐(`code`)**뿐이고 PK는 목록이 준다.
     */
    const 등급repo = model등급s.getInstance()
    const toCreate = i승급목표등급seed
      .map(row => 등급repo.getByCode(row.code))
      .filter((등급): 등급 is model등급 => !!등급?.stateId)
      .filter(등급 => !existing.has(String(등급.stateId)))
      .map(등급 => ({
        gradingEventId: String(eid),
        targetGradeId: String(등급.stateId)
      }))
    if (!toCreate.length) return
    await this.creates(toCreate)
  }
}

export class model등급별심사 extends BaseModel2<i등급별심사dto> implements i등급별심사 {
  constructor(state?: i등급별심사dto) {
    super(model등급별심사s.getInstance(), state)
  }

  bindModel = null as any
  override afterCreate = () => {}
  override beforeSave = () => true
  override afterSave = () => {}

  override 자동필드ss = [
    {
      label: '기본',
      list: [
        {
          key: '회원의등급심사s',
          label: '회원의 등급심사',
          type: 타입지정._.카드s,
          show: true,
          is한줄: false,
          props: {
            do빈생성: () =>
              model회원의등급심사s
                .getInstance()
                .do빈생성_등급별심사관점(String(this.stateId ?? ''))
          }
        }
        //
        // { key: '등급심사', label: '등급심사 회차', show: true, canEdit: false },
        // { key: '목표등급', label: '목표 등급', show: true, canEdit: false },
        // { key: '대상자수', label: '대상', type: 타입지정._.숫자, show: true, canEdit: false },
        // { key: '합격자수', label: '합격', type: 타입지정._.숫자, show: true, canEdit: false },
        // { key: '불합격자수', label: '불합격', type: 타입지정._.숫자, show: true, canEdit: false },
      ]
    },
    {
      label: '회원의 등급심사',
      config: { ratio: 40 },
      list: [

      ]
    }
  ]

  override 자동버튼s = this.기본버튼s.concat([
    {
      key: 'do대상자s등록',
      label: '대상자등록',
      icon: 'i-lucide-users',
      show: true
    },
    {
      key: 'do일괄심사',
      label: '일괄 심사',
      icon: 'i-lucide-badge-check',
      show: true
    }
  ])

  override generate() {
    return {
      ...this.init(),
      gradingEventId: String(this.state?.gradingEventId ?? ''),
      targetGradeId: String(this.state?.targetGradeId ?? '')
    }
  }

  override init() {
    return {
      gradingEventId: '',
      targetGradeId: ''
    }
  }

  get gradingEventId() {
    return String(this.state?.gradingEventId ?? '').trim()
  }

  set gradingEventId(v: string) {
    this.state.gradingEventId = String(v ?? '').trim()
  }

  get targetGradeId() {
    return String(this.state?.targetGradeId ?? '').trim()
  }

  set targetGradeId(v: string) {
    this.state.targetGradeId = String(v ?? '').trim()
  }

  get 등급심사() {
    return model등급심사s.getInstance().getById(this.gradingEventId) ?? null
  }

  get 목표등급() {
    return model등급s.getInstance().getById(this.targetGradeId) ?? null
  }

  get 회원의등급심사s(): model회원의등급심사[] {
    return model회원의등급심사s.getInstance().getsBy등급별심사(this)
  }

  get 대상자수() {
    return this.회원의등급심사s.length
  }

  get 합격자수() {
    return this.회원의등급심사s.filter(row => row.상태 === 'passed').length
  }

  get 불합격자수() {
    return this.회원의등급심사s.filter(row => row.상태 === 'fail').length
  }

  _badges = computed(() => {
    const total = this.대상자수
    const passed = this.합격자수
    const failed = this.불합격자수
    return [
      { label: `대상 ${total}`, color: 'neutral' as const },
      { label: `합격 ${passed}`, color: passed > 0 ? ('primary' as const) : ('neutral' as const) },
      { label: `불합격 ${failed}`, color: failed > 0 ? ('error' as const) : ('neutral' as const) }
    ]
  })

  override get badges() {
    return toValue(this._badges)
  }

  override get label() {
    return (this.목표등급?.label ?? (this.targetGradeId || '-')) + '등급심사'
  }

  override get sub() {
    const total = this.대상자수
    if (!total) return '대상 없음'
    return `대상 ${total}명 · 합격 ${this.합격자수} · 불합격 ${this.불합격자수}`
  }

  is승급대상 = (회원: model회원) => {
    if (!hasServerPk(회원.stateId)) return false

    const 목표등급 = this.목표등급
    if (!목표등급) return false

    const 기본등급
      = toValue(model등급s.getInstance().list).find(row => row.is기본옵션) ?? null
    const 현재등급 = 회원.등급 ?? 기본등급
    if (!현재등급) return false
    return Number(목표등급.급수 ?? 0) === Number(현재등급.급수 ?? 0) + 1
  }

  do대상자s등록 = async () => {
    if (!hasServerPk(this.stateId)) {
      useAlert().error('대상자 등록 불가', '등급별 심사를 먼저 저장한 뒤 다시 시도해주세요.')
      return
    }
    if (import.meta.server) return

    const repo = model회원의등급심사s.getInstance()
    const 회원s = toValue(model회원s.getInstance().회원s)
    if (!회원s.length) {
      useAlert().show('대상자 등록', '등록된 회원이 없습니다.')
      return
    }

    const 이미있음 = new Set(
      repo
        .getsBy등급별심사(this)
        .map(row => String(row.state.memberId ?? '').trim())
        .filter(Boolean)
    )

    // 같은 회차의 다른 트랙에서 이미 심사 중인 회원. `status`(없는 멤버)가 아니라
    // 형제 코드(`do일괄심사`)와 같은 판정을 쓴다 — 합격·불합격이 안 난 행이 심사중이다.
    const 등급심사 = this.등급심사
    const 심사중 = new Set(
      (등급심사 ? repo.getsBy등급심사(등급심사) : [])
        .filter(row => row.상태 !== 'passed' && row.상태 !== 'fail')
        .map(row => String(row.state.memberId ?? ''))
        .filter(Boolean)
    )

    const toAdd = 회원s.filter((m: model회원) => {
      const mid = String(m.stateId ?? '')
      if (!mid || 이미있음.has(mid) || 심사중.has(mid)) return false
      return this.is승급대상(m)
    })

    if (!toAdd.length) {
      useAlert().show(
        '대상자 등록',
        '추가할 대상이 없습니다. (해당 등급 승급 대상 없음·기등록·같은 회차 심사중)'
      )
      return
    }

    const 제외수 = 회원s.length - toAdd.length
    const msg = [
      `${this.label} 기준`,
      `전체 ${회원s.length}명 중 ${toAdd.length}명을 등록합니다.`,
      제외수 > 0 ? `(제외 ${제외수}명)` : '',
      '계속할까요?'
    ]
      .filter(Boolean)
      .join('\n')
    if (!confirm(msg)) return

    const items = toAdd.map((m: model회원) =>
      repo.buildDtoFor심사(String(m.stateId), String(this.stateId))
    )
    try {
      await repo.creates(items)
      useAlert().success('대상자 등록', `${items.length}명을 등록했습니다.`)
    } catch {
      /* creates에서 알림 */
    }
  }

  do일괄심사 = async () => {
    if (!hasServerPk(this.stateId)) {
      useAlert().error('일괄 심사 불가', '등급별 심사를 먼저 저장한 뒤 다시 시도해주세요.')
      return
    }
    if (import.meta.server) return

    const candidates = this.회원의등급심사s.filter(
      row => row.상태 !== 'passed' && row.상태 !== 'fail'
    )
    if (!candidates.length) {
      useAlert().show('일괄 심사', '심사할 대상자가 없습니다.')
      return
    }

    const msg = [`${this.label}`, `미심사 ${candidates.length}명을 일괄 심사합니다.`, '계속할까요?'].join(
      '\n'
    )
    if (!confirm(msg)) return

    let passed = 0
    let failed = 0
    let skipped = 0

    for (const row of candidates) {
      const result = await row.do심사({ silent: true })
      if (result === 'passed') passed++
      else if (result === 'fail') failed++
      else skipped++
    }

    if (passed + failed === 0) {
      useAlert().show('일괄 심사', skipped > 0 ? '처리된 건이 없습니다.' : '심사 결과가 없습니다.')
      return
    }

    const parts = [`합격 ${passed}명`, `불합격 ${failed}명`]
    if (skipped > 0) parts.push(`건너뜀 ${skipped}명`)
    useAlert().success('일괄 심사', parts.join(' · '))
  }
}

export { model등급별심사 as modelPerGrading, model등급별심사s as modelPerGradings }

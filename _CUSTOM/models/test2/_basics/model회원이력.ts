import { computed, toValue } from 'vue'
import type { model회원 } from './model회원'
import type { model역할 } from './model역할'
import type { model등급 } from '../grades'
import {
  model회원상태이력s,
  type model회원상태이력
} from './model회원상태이력'
import { getRepoInstance } from '~utils/models'
import {
  model회원관계이력s,
  type model회원관계이력,
  type i회원관계이력엔티티타입
} from './model회원관계이력'

/** 상태이력 + 관계이력 유니온 (독자 API 없음) */
export type model회원이력 = model회원상태이력 | model회원관계이력
export type i회원관계엔티티타입 = i회원관계이력엔티티타입

const by최신 = (a: model회원이력, b: model회원이력) => {
  // 기간 getter는 endDate null을 mDayjs(null)로 감싸서 null 판별이 불가 → state.endDate 사용
  const aEnd = a.state.endDate
  const bEnd = b.state.endDate
  if (aEnd == null && bEnd == null) {
    const at = a.state.startDate ? new Date(a.state.startDate).valueOf() : 0
    const bt = b.state.startDate ? new Date(b.state.startDate).valueOf() : 0
    return bt - at
  }
  if (aEnd == null) return -1 // null(진행중)이 최신
  if (bEnd == null) return 1
  return new Date(bEnd).valueOf() - new Date(aEnd).valueOf()
}

/**
 * 독자 API 없이 `model회원상태이력s` + `model회원관계이력s`를 융합하는 Facade.
 * 저장/reads는 각 repo에 위임하고, `list`·조회 API만 통합한다.
 */
export class model회원이력s {
  static getInstance = () => getRepoInstance('model회원이력s', () => new model회원이력s())

  private constructor() {}

  private get 상태() { return model회원상태이력s.getInstance() }
  private get 관계() { return model회원관계이력s.getInstance() }

  // id 겹치는 문제 발생함.
  list = computed(() => [
    ...toValue(this.상태.list),
    ...toValue(this.관계.list)
  ].sort(by최신))

  관계이력s = computed(() => toValue(this.관계.list))
  상태이력s = computed(() => toValue(this.상태.list))
  역할이력s = computed(() => toValue(this.관계.역할이력s))
  등급이력s = computed(() => toValue(this.관계.등급이력s))

  reads = () => Promise.all([this.상태.reads(), this.관계.reads()])

  getsBy회원 = (_회원: model회원) => [
    ...this.상태.getsBy회원(_회원),
    ...this.관계.getsBy회원(_회원)
  ].sort(by최신)

  get관계이력sBy회원 = (_회원: model회원) => this.관계.getsBy회원(_회원)
  get상태이력sBy회원 = (_회원: model회원) => this.상태.getsBy회원(_회원)
  get등급이력sBy회원 = (_회원: model회원) => this.관계.get등급이력sBy회원(_회원)
  get역할이력sBy회원 = (_회원: model회원) => this.관계.get역할이력sBy회원(_회원)

  get현재이력By회원 = (회원: model회원) => this.상태.get현재이력By회원(회원) ?? null

  get현재이력By회원_엔티티 = (회원: model회원, entityType: i회원관계엔티티타입) => {
    const key = entityType === 'roles' ? 'roleId' : 'gradeId'
    return this.관계.get현재이력By회원_엔티티(회원, key)
  }

  get현재등급이력By회원 = (회원: model회원) => this.get현재이력By회원_엔티티(회원, 'grades')
  get현재역할이력sBy회원 = (회원: model회원) => this.관계.get현재역할이력sBy회원(회원)

  get등급By회원 = (회원: model회원) => model회원관계이력s.getInstance().get등급By회원(회원)
  get역할sBy회원 = (회원: model회원) => model회원관계이력s.getInstance().get역할sBy회원(회원)
  get회원sBy등급 = (등급: model등급) => this.관계.get회원sBy등급(등급)
  get회원sBy역할 = (역할: model역할) => this.관계.get회원sBy역할(역할)

  do상태기록 = (회원: model회원, reason?: string) => this.상태.do상태기록(회원, reason)
  do등급기록 = (회원: model회원, to등급?: model등급 | null, reason?: string) =>
    this.관계.do등급기록(회원, to등급 ?? undefined, reason)

  do역할추가 = (회원: model회원, to역할?: model역할 | null, reason?: string) =>
    this.관계.do역할추가(회원, to역할 ?? undefined, reason)

  do역할해제 = (회원: model회원, 역할: model역할) =>
    this.관계.do역할해제(회원, 역할)

  do시드역할부여 = (회원: model회원, codes: readonly string[]) =>
    this.관계.do시드역할부여(회원, codes)
}

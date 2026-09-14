import { BaseModels2, BaseModel2, 타입지정, getRepoInstance } from '~utils/models'
import type { BaseXX, BaseXXDto } from '~utils/models'
import { pick1 } from '~utils'
import { model등급s, type model등급 } from './'
import type { i등급코드 } from './model등급'
import { i등급요건seed } from '../seeds'

export interface i등급요건dto extends BaseXXDto {

  /** model등급.id */
  gradeId: string
  /** 조건 없음 여부 (DTO 영문 필드) */
  noCondition?: boolean
  /** @deprecated legacy field - use `noCondition` */
  is조건없음?: boolean
  /** 수련시간 컷 (이상) */
  requiredTrainingHoursCut?: number
  /** 필기시간 컷 (이상) */
  requiredWrittenTimeCut?: number
}

export interface i등급요건 extends BaseXX {
  등급: model등급 | null
  noCondition: boolean
  is조건없음: boolean
  수련시간컷: number | null
  필기시간컷: number | null
  requiredTrainingHoursCut: number | null
  requiredWrittenTimeCut: number | null
}

/**
 * 시드 한 행. **PK도 `gradeId`도 없다** — 시드는 서버가 매길 PK를 알 수 없으므로
 * 대상 등급을 `gradeCode`로 가리키고, 실제 `gradeId`는 `model등급요건s.seed해소`가 채운다.
 */
export type i등급요건시드 = Omit<i등급요건dto, 'id' | 'gradeId'> & { gradeCode: i등급코드 }

export class model등급요건s extends BaseModels2<model등급요건, i등급요건dto, i등급요건시드> {
  protected etcFields = []
  static getInstance = () => getRepoInstance('model등급요건s', () => new model등급요건s())

  private constructor() {
    super(model등급요건, 'grade-conditions')
  }

  override async reads() {
    return super.reads()
  }

  /**
   * 등급 PK로 그 등급의 승급 조건을 찾는다.
   *
   * 예전엔 시드 배열에서 `gradeId`가 맞는 행을 찾아 **그 시드 행의 `id`**로 `getById`를 했다.
   * 시드의 PK가 서버 배정과 같다는 전제였는데 그런 보장이 없고, 실제로 시드는 `3001~3003`,
   * 서버는 `1001~1004`라 매칭이 0건 → 호출부 네 곳이 전부 `null`을 받고 있었다.
   * 목록에서 직접 거르면 그 전제 자체가 사라진다.
   */
  getByGradeId = (gradeId: string): model등급요건 | null => {
    const id = String(gradeId ?? '').trim()
    if (!id) return null
    return toValue(this.list).find(row => row.gradeId === id) ?? null
  }

  /**
   * 시드의 `gradeCode`를 실제 등급 PK로 바꾼다. 등급이 먼저 있어야 하므로 여기서 읽는다.
   * code를 못 찾은 행은 **떨어뜨린다** — 끊긴 FK를 만들어 넣느니 안 넣는 게 낫다.
   */
  protected override async seed해소(rows: i등급요건dto[]): Promise<i등급요건dto[]> {
    const 등급repo = model등급s.getInstance()
    await 등급repo.reads()

    const out: i등급요건dto[] = []
    for (const row of rows) {
      const { gradeCode, ...rest } = row as i등급요건dto & { gradeCode?: i등급코드 }
      const 등급 = gradeCode ? 등급repo.getByCode(gradeCode) : null
      if (!등급?.stateId) {
        console.warn(`[등급요건 seed] 등급 code '${gradeCode}'를 못 찾아 건너뜀`)
        continue
      }
      out.push({ ...rest, gradeId: String(등급.stateId) } as i등급요건dto)
    }
    return out
  }

  override _generate = () => new model등급요건().generate()
  override _init = () => new model등급요건().init()
  protected override seed = i등급요건seed
}

export class model등급요건 extends BaseModel2<i등급요건dto> implements i등급요건 {
  constructor(state?: i등급요건dto) {
    super(model등급요건s.getInstance(), state)
  }

  override afterCreate = () => { }
  override beforeSave = () => true
  override afterSave = () => { }

  override 자동필드ss = [
    {
      label: '기본',
      list: [
        {
          key: 'gradeId',
          label: '등급',
          type: 타입지정.선택0,
          // 시드가 아니라 **목록**에서 뽑는다 — 시드의 id는 서버 PK가 아니라 고를 수 없는 값이다.
          options: computed(() => toValue(model등급s.getInstance().options)),
          show: !true
        },
        {
          key: 'noCondition',
          label: '등급요건',
          type: 타입지정.선택0,
          options: [
            { label: '무조건', value: true },
            { label: '필수요건', value: false }
          ],
          show: true
        },
        {
          key: 'requiredTrainingHoursCut',
          label: '[수련시간 컷]',
          type: 타입지정._.숫자2,
          props: { min: 0, max: 5000, step: 1, suffix: '시간' },
          show: computed(() => !this.is조건없음)
        },
        {
          key: 'requiredWrittenTimeCut',
          label: '[필기시간 컷]',
          type: 타입지정._.숫자2,
          props: { min: 0, max: 5000, step: 1, suffix: '시간' },
          show: computed(() => !this.is조건없음)
        }
      ]
    }
  ]

  override generate() {
    const row = pick1([...i등급요건seed])
    // 시드는 등급을 code로 가리킨다. PK는 목록에서 얻는다 — 아직 안 읽혔으면 빈 값.
    const 등급 = model등급s.getInstance().getByCode(row.gradeCode)
    return {
      ...this.init(),
      gradeId: String(등급?.stateId ?? ''),
      noCondition: row.noCondition ?? row.is조건없음,
      requiredTrainingHoursCut: row.requiredTrainingHoursCut,
      requiredWrittenTimeCut: row.requiredWrittenTimeCut
    }
  }

  override init() {
    return {
      createdAt: this.state?.createdAt ?? new Date(),
      gradeId: String(model등급s.getInstance().get기본등급()?.stateId ?? ''),
      noCondition: true
    }
  }

  get gradeId(): string {
    return String(this.state?.gradeId ?? '').trim()
  }

  set gradeId(v: string) {
    this.state!.gradeId = String(v ?? '').trim()
  }

  get 등급(): model등급 | null {
    return model등급s.getInstance().getById(this.gradeId) ?? null
  }

  get is조건없음(): boolean {
    return this.noCondition
  }

  set is조건없음(v: boolean) {
    this.noCondition = v
  }

  get noCondition(): boolean {
    return Boolean(this.state?.noCondition ?? this.state?.is조건없음)
  }

  set noCondition(v: boolean) {
    this.state!.noCondition = Boolean(v)
    delete this.state!.is조건없음
    if (this.state!.noCondition) {
      delete this.state!.requiredTrainingHoursCut
      delete this.state!.requiredWrittenTimeCut
    }
  }

  private _normReq = (v: unknown) => {
    const n = Math.floor(Number(v))
    return Number.isFinite(n) && n > 0 ? n : null
  }

  get 수련시간컷(): number | null {
    if (this.is조건없음) return null
    return this._normReq(this.state?.requiredTrainingHoursCut)
  }

  set 수련시간컷(v: number | null) {
    const n = this._normReq(v)
    if (n == null) delete this.state!.requiredTrainingHoursCut
    else this.state!.requiredTrainingHoursCut = n
  }

  get 필기시간컷(): number | null {
    if (this.is조건없음) return null
    return this._normReq(this.state?.requiredWrittenTimeCut)
  }

  set 필기시간컷(v: number | null) {
    const n = this._normReq(v)
    if (n == null) delete this.state!.requiredWrittenTimeCut
    else this.state!.requiredWrittenTimeCut = n
  }

  // 자동필드 key, DTO와의 호환을 위해 영문 별칭 유지
  get requiredTrainingHoursCut(): number | null {
    return this.수련시간컷
  }

  set requiredTrainingHoursCut(v: number | null) {
    this.수련시간컷 = v
  }

  get requiredWrittenTimeCut(): number | null {
    return this.필기시간컷
  }

  set requiredWrittenTimeCut(v: number | null) {
    this.필기시간컷 = v
  }

  private _cond문자열 = () => {
    if (this.is조건없음) return []
    const parts: string[] = []
    if (this.수련시간컷 != null) parts.push(`수련시간≥${this.수련시간컷}`)
    if (this.필기시간컷 != null) parts.push(`필기시간≥${this.필기시간컷}`)
    return parts
  }

  /** 수련시간·필기시간이 이 등급 승급 기준을 충족하는지 */
  is충족 = (trainingHours: number, writtenHours: number, _writtenScore = 0) => {
    if (this.is조건없음) return true
    const t = Math.max(0, Math.floor(Number(trainingHours) || 0))
    const w = Math.max(0, Math.floor(Number(writtenHours) || 0))
    if (this.수련시간컷 != null && t < this.수련시간컷) return false
    if (this.필기시간컷 != null && w < this.필기시간컷) return false
    return true
  }

  /** 미충족 조건 문자열 (전직 심사 메시지와 동일 형식) */
  get미충족 = (trainingHours: number, writtenHours: number, _writtenScore = 0) => {
    if (this.is조건없음) return []
    const t = Math.max(0, Math.floor(Number(trainingHours) || 0))
    const w = Math.max(0, Math.floor(Number(writtenHours) || 0))
    const out: string[] = []
    if (this.수련시간컷 != null && t < this.수련시간컷) out.push(`수련시간≥${this.수련시간컷}`)
    if (this.필기시간컷 != null && w < this.필기시간컷) out.push(`필기시간≥${this.필기시간컷}`)
    return out
  }

  override get label(): string {
    const 등급명 = this.등급?.label ?? (this.gradeId || '-')
    const conds = this._cond문자열()
    const cond = conds.length ? conds.join(', ') : '조건 없음'
    return `${등급명} · ${cond}`
  }
}

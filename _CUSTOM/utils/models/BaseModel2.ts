import { computed, reactive, ref, toRaw, toValue, type ComputedRef, type Ref } from 'vue'
import type { i필드 } from './ORM'
import { clone } from '~utils'

import type { BaseXXDto, FuncQueue, i목록Badge, i요약타일 } from './BaseModels2.types'
import { doLog, is개발자 } from './BaseModels2.env'
import { hasServerPk, rowKeyOf } from './BaseModels2.identity'
/** 타입으로만 쓴다 — 저장소 접근은 전부 생성자로 주입받은 인스턴스를 거치므로 런타임 의존이 없다. */
import type { BaseModels2 } from './BaseModels2'
// import type { RenderItem } from '~/components/view/렌더/renderComps'; //순환참조 걱정.

export abstract class BaseModel2<Dto extends BaseXXDto> {
  /**
     * `state`를 **반응형으로 못 박는다.**
     *
     * 저장소를 거친 행은 `_list`(=`ref`)의 원소라 이미 프록시지만, 생성자로 **직접 만든** 행
     * (공개 글쓰기 화면의 새 글처럼 아직 목록에도 서버에도 없는 것)의 `state`는 `init()`이
     * 돌려준 맨 객체다. 그러면 화면이 `모델.제목`을 읽어도 추적할 것이 없어서, 사람이 타이핑한
     * 값만 (DOM이 제 값을 들고 있어서) 보이고 **코드가 넣은 값은 조용히 묻힌다** —
     * `doAI초안`이 채운 제목·본문, 챗봇이 넘긴 초안이 전부 그렇게 사라졌다. `is수정됨`·
     * `본문텍스트` 같은 computed도 영영 갱신되지 않아 저장·발행 버튼이 안 켜진다.
     * 행을 어디서 만들었느냐에 따라 반응성이 갈리는 것 자체가 함정이라 여기서 한 번에 막는다.
     *
     * **부작용이 없는 근거** — 요점은 이 클래스의 코드가 프록시 `state`를 이미 매일 다룬다는 것이다.
     * 목록 행이 그렇게 돌고 있었고, 이 변경은 소수파(직접 만든 행)를 다수파에 맞출 뿐이다.
     * - 이미 프록시인 것에 다시 걸면 **같은 프록시**가 돌아온다. `new this.modelClass(x, this)`의
     *   `x`가 그래서 그대로다 — 저장소가 쥔 행과 모델의 `state`가 갈라지지 않는다.
     * - `stateClear`·`do수정취소`는 원본을 `toRaw`로 떠서 클론한다(`clone(toRaw(...))`).
     * - 서버로 나가는 몸통(`toApiPayload`·`creates`·`updates`)은 `Object.entries`로 읽으므로
     *   프록시든 아니든 같은 값이 나온다.
     * - `rowKeyOf`의 `Object.defineProperty`는 트랩이 없어 **raw에** 심긴다. 프록시로 물어도
     *   같은 키가 나오니 `_modelCache` 키가 갈라질 일이 없다.
     * - dto는 JSON 값만 담는다. Date·File 같은 비-평범 객체는 `reactive`가 손대지 않고 통과시킨다.
     */
  constructor(protected repo: BaseModels2<any, Dto, any>, public state = this.init() as Dto) {
    this.state = reactive(state) as Dto
    this.stateClear()
  }

  // just_created라도 들어감.

  abstract init(): Omit<Dto, 'id'>
  abstract generate(): Omit<Dto, 'id'>

  protected abstract 자동필드ss: { list: i필드[], label: string, show?: boolean | ComputedRef<boolean>, config?: { ratio?: number } }[]

  protected get 기본버튼s(): i필드[] {
    return [
      {
        key: 'do로그',
        show: is개발자,
        is수정할때만: true,
        label: '로그',
        icon: 'i-mdi-light-console',
        position: 'top'
      },
      {
        key: 'do초기화',
        show: false,
        is수정할때만: true,
        label: '초기화',
        icon: 'i-iwwa-reset',
        position: 'top'
      },
      {
        key: 'do초안',
        show: is개발자, // 개발단계에서는 계속필요함.
        is수정할때만: true,
        label: '초안',
        icon: 'i-ph-dice-three-light',
        position: 'top'
      }
    ]
  }

  protected 자동버튼s: i필드[] = this.기본버튼s

  do로그 = () => {
    doLog(this.state)
    doLog(toValue(this.state2))
    useAlert().log(`로그 출력`, JSON.stringify({ ...this.state }))
  }

  do초기화 = () => {
    const a = this.init()

    Object.entries(a).splice(0, 10).forEach(([key, value]) =>
      this.state[key] = value as any)
    if (false)// 그래야 저장을 유도함.
      this.stateClear()
    useAlert().log(`초기화했습니다`)
  }

  /** 서브클래스가 `super.do초안()`으로 이어받을 수 있게 화살표 필드가 아니라 프로토타입 메서드로 둔다. */
  do초안() {
    const a = this.generate()
    Object.assign(this.state, a)
    useAlert().log(`임의값을 생성했습니다`)
  }

  add(is등록필요 = true) {
    return this.repo.create(this.state, is등록필요)
  }

  do수정취소 = () => {
    const 이전상태 = clone(toRaw(this.state2.value))
    if (!이전상태) return

    Object.keys(this.state)
      .filter(key => !Object.hasOwn(이전상태, key))
      .forEach((key) => { delete (this.state as Record<string, unknown>)[key] })
    Object.assign(this.state, 이전상태)

    this.queue.clear()
    this.stateUI.do저장ing = false;
    (toValue((this as any).bindModel) as BaseModel2<any> | undefined)?.do수정취소()
  }

  do저장 = (is모두저장 = false, showAlert = true) => new Promise<boolean>(async (res, rej) => {
    let isSaveSuccess = false
    // `beforeSave`는 비동기를 받는다 — 저장 직전에 원격을 한 번 다녀와야 하는 모델이 있다
    // (예: `model회원게시글`이 썸네일이 비었을 때 Unsplash에서 한 장 골라 채운다).
    // 동기 구현은 그대로 동작한다: `await`는 프라미스가 아닌 값을 그대로 통과시킨다.
    if ((await this.beforeSave?.()) == false) {
      this.stateUI.do저장ing = false
      res(false)
      return
    }
    this.stateUI.do저장ing = true

    await toValue(this.bindModel)?.do저장(is모두저장, false)

    // 초안은 아직 서버에 없다 — PUT할 행이 없으니 여기서 POST로 갈라 보낸다.
    // `afterCreate`도 "추가 버튼"이 아니라 **이 순간**이 제 자리다.
    const is신규저장 = this.is신규
    const 저장 = is신규저장
      ? this.repo.createDraft(this.state)
      : this.repo.update(this.state)

    저장.then(async (a) => {
      if (a) Object.assign(this.state, a)
      if (is신규저장) await this.afterCreate?.()

      // 끝나면 초기화.
      Object.entries(this.state).filter(([key]) => /[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(key))
        .forEach(([key, value]) => (delete this.state[key]))

      if (!is모두저장) {
        if (this.queue.size > 0) {
          const Qs = Array.from(this.queue.values())
          await Promise.all(Qs.map(q => q.func()))
          if (showAlert)
            useAlert().log(`동기화 (${Qs.length}건)`, Qs.map(x => x.label))
        }
        if (showAlert)
          useAlert().log(is신규저장 ? `추가했습니다` : `수정했습니다`, `${Object.values(this.state).slice(0, 3).join('/')} (${this.repo.apiURL})`)
      }
      this.afterSave?.()
      isSaveSuccess = true
    }).catch((error: any) => {
      if (showAlert)
        useAlert().log(is신규저장 ? `추가 실패` : `수정 실패`, error.message)
    }).finally(() => {
      this.stateUI.do저장ing = false
      if (isSaveSuccess && !is모두저장)
        this.stateClear()

      res(isSaveSuccess)
    })
  })

  /**
     * 지웠으면 `true`, 물음 앞에서 물러섰으면 `false`.
     *
     * 예전엔 `const res = confirm(...)`이 Promise의 `res`를 가려서, 취소하면 `res(false)`가
     * boolean을 부르다 TypeError로 터졌다. 실행이 거기서 끊겨 지워지진 않았지만 그 예외가
     * executor 밖으로 못 나가 **Promise가 영영 안 풀렸다** — `await m.delete()` 하는 쪽이 멈춘다.
     * 그래서 이름을 갈라주고, 취소면 `false`로 풀고 끝낸다.
     *
     * 부르는 쪽은 돌아온 값을 봐야 한다. 이제 취소도 `.then`을 태우므로, 값을 안 보면
     * "취소했는데 상세가 닫힌다"가 된다.
     */
  delete = (isDB = true) => new Promise<boolean>(async (res, rej) => {
    if (isDB && this.repo?.config?.hasConfirm) {
      if (!confirm(`${this.label}을 정말 삭제할까요?`)) {
        res(false)
        return
      }
    }

    // 초안은 서버에 없다 — DELETE를 보내면 404다. 목록에서 걷어내면 그걸로 끝.
    if (this.is신규) {
      this.repo.remove로컬(this.rowKey)
      res(true)
      return
    }

    this.stateUI.do삭제ing = true
    {
      this.repo.delete(this.stateId!)
        .then(() => {
          this.stateUI.do삭제ing = false
          if (isDB && this.repo?.config?.hasConfirm)
            useAlert().log(`삭제했습니다.`, `${this.label} (${this.stateId}) (${this.repo.apiURL})`)
          res(true)
        }).catch((error) => {
          this.stateUI.do삭제ing = false
          useAlert().log(`삭제 실패`, error.message)
          rej(false)
        }) // id가 있다고 가정
      return false
    }
  })

  abstract afterCreate?: () => void | Promise<void>

  /** 저장 직전. `false`를 돌려주면 저장을 멈춘다. 비동기 가능 — 호출부가 await 한다. */
  abstract beforeSave?: () => boolean | void | Promise<boolean | void>
  abstract afterSave?: () => void

  protected state2: Ref<any> = ref()
  stateUI = reactive({
    do저장ing: false,
    do삭제ing: false
  })

  /** `BaseModels2.do모두저장`이 행별 뒷일을 걷어 한 번에 돌린다 — 그래서 열려 있다. */
  queue = reactive(new Map<string | number, FuncQueue>())

  /**
     * 이 행이 **서버에 저장된 뒤** 실행할 뒷일을 건다.
     *
     * 저장 전 행의 PK가 있어야 되는 일이 여기 온다. 큐는 `do저장`이 POST/PUT을 끝낸 **다음**에 돌므로
     * `func` 안에서는 `stateId`가 이미 서버 PK다 — 그러니 PK는 반드시 **`func` 안에서** 읽을 것.
     * 큐에 뭔가 걸려 있으면 `is수정됨`이 참이라 저장 버튼도 알아서 켜지고,
     * `do수정취소`로 물러서면 큐도 같이 비워진다(= 뒷일도 없던 일이 된다).
     *
     * `addQueue`가 `protected`라 남의 모델에 뒷일을 걸 수 없었다. 이게 그 창구다.
     */
  do저장후에(q: { qId: string | number, label: string, func: () => Promise<void> | void, type?: FuncQueue['type'] }) {
    this.addQueue({
      type: q.type ?? 'create',
      qId: q.qId,
      milliseconds: Date.now(),
      label: q.label,
      func: q.func as FuncQueue['func']
    })
  }

  protected addQueue(funcQueue?: FuncQueue) {
    if (!funcQueue)
      return
    doLog('addQueue', funcQueue)
    const { qId: id, type, func, label } = funcQueue
    if (!this.queue.has(id)) {
      this.queue.set(id, { type, func, label })
      doLog(Array.from(this.queue.values()))
      return
    }

    const existing = this.queue.get(id)

    if (type === 'delete') {
      if (existing.type === 'create') {
        // C -> D: 아예 없었던 일로 함
        this.queue.delete(id)
      } else {
        // U -> D: 결국 삭제만 남음
        this.queue.set(id, { type: 'delete', func, label })
      }
    } else if (type === 'update') {
      // C -> U: 여전히 CREATE 상태 (데이터만 최신)
      // U -> U: 마지막 UPDATE 데이터로 갱신

      this.queue.set(id, { type: existing.type, func, label })
    } else if (type === 'create') {
      // D -> C: 삭제 후 생성이므로 사실상 UPDATE와 유사하게 취급 가능
      this.queue.set(id, { type: 'update', func, label })
    }

    doLog(Array.from(this.queue.values()))
  }

  stateClear = () => {
    this.state2.value = clone(toRaw(this.state)); this.queue.clear(); this.stateUI.do저장ing = false
  }

  bindModels?: ComputedRef<BaseModel2<any>[]>

  /**
     * 초안은 태어날 때부터 "저장 필요"다.
     * 생성자가 `stateClear()`로 스냅샷을 떠버려서, 값 비교만으로는 방금 만든 빈 행이 깨끗해 보인다
     * — 그러면 저장 버튼이 안 켜져 사용자가 새 행을 서버에 올릴 방법이 없다.
     *
     * **네 항을 단락 없이 먼저 다 읽는다.** `||` 로 이으면 `is신규` 가 참인 동안 이 computed 의
     * 의존이 `state.id` **한 칸뿐**이 된다. 그 한 칸이 알림 없이 채워지는 길이 실제로 있었고
     * (`BaseModels2.creates` 가 raw 와 프록시에 같은 값을 두 번 적었다) 그러면 값이 `true` 에
     * 얼어붙어 **저장해도 뱃지가 안 내려간다.** 다 읽어두면 `state2`·`state` 의 어느 변화로도 깨어난다 —
     * 판정을 쓰는 쪽의 조심성이 아니라 이 자리에서 값을 치른다.
     */
  is수정됨 = computed(() => {
    const 신규 = this.is신규
    const 붙은모델 = toValue(toValue(this.bindModel)?.is수정됨) ?? false
    const 큐 = this.queue.size > 0
    const 값다름 = JSON.stringify({ ...toValue(this.state2), id: undefined })
      !== JSON.stringify({ ...this.state, id: undefined })
    return 신규 || 붙은모델 || 큐 || 값다름
  })

  is저장중 = computed(() => (toValue(toValue(this.bindModel)?.is저장중) ?? false) || this.stateUI.do저장ing)
  is삭제중 = computed(() => (toValue(toValue(this.bindModel)?.is삭제중) ?? false) || this.stateUI.do삭제ing)

  get label() { return this?.이름 ?? this?.제목 ?? this.state?.label ?? this.state?.title ?? this.state?.name ?? '' }
  get icon() { return this?.아이콘 ?? this.state?.icon ?? '' }
  get thumbnail() {
    return this?.이미지 ?? this?.썸네일 ?? this.state?.thumbnail
      ?? undefined
  }

  /**
   * 세로카드 표지 칸의 비율(CSS `aspect-ratio`). **그림 모양은 모델이 안다** — 표지 그림(AI 생성)은
   * 16:9 라 기본이 `16 / 10` 이고, 증명사진(3:4)·아바타(1:1)처럼 모양이 다른 모델만 덮어쓴다.
   * 한 목록은 한 모델이라 목록 전체가 같은 칸을 갖는다(`m/List/List.vue` 가 첫 장 값으로 정한다).
   * 칸을 16:10 하나로 못 박았을 때는 3:4 증명사진이 칸 가운데 반만 차는 우표가 됐다(2026-09-11).
   */
  get 표지비율(): string { return '16 / 10' }

  set label(v: string) {
    if (Object.hasOwn(this.state, 'label'))
      this.state.label = v
    else if (Object.hasOwn(this.state, 'title'))
      this.state.title = v
    else if (Object.hasOwn(this.state, 'name'))
      this.state.name = v
  }

  // get description() { return this?.설명 ?? this?.소개 ?? this.state?.description ?? this.state?.intro ?? ''; }

  get header(): any { return null }
  get content(): any { return null }

  get sub() { return '' }
  set sub(v: string) { }// 없으면 버그남.
  get badges(): i목록Badge[] { return [] }

  /**
     * 상세 판 머리글 아래 요약 타일. 기본은 없음 — 보여줄 게 있는 모델만 override 한다.
     * (`badges`와 같은 자리의 확장점이다. 목록 카드가 `badges`를 쓰듯 상세 판이 이걸 쓴다.)
     */
  get 요약s(): i요약타일[] { return [] }

  // 이게 셀프만 되고 외부에선 안됨.
  /** **서버 PK.** 저장 전 행은 `null` — 행을 지목하는 축은 이게 아니라 `rowKey`다. */
  get stateId(): string | number | null { return this.state.id ?? null }

  /**
     * 이 행의 **클라이언트 identity**. 서버 PK(`stateId`)와 다른 축이다 — `rowKeyOf` 주석 참고.
     * "어느 행이냐"를 묻는 자리(캐시·렌더 키·`isSame`)는 `stateId`가 아니라 이걸 봐야 한다.
     */
  get rowKey() { return rowKeyOf(this.state) }

  /**
     * 아직 서버에 없는 초안 행 — **서버 PK가 없는 행**이 정의다.
     * 저장(POST/PUT)·삭제(DELETE 생략)·더티 판정·정렬이 전부 이 한 줄로 갈린다.
     */
  get is신규() { return !hasServerPk(this.state?.id) }

  get 순서(): number {
    const n = Number(this.state?.order)
    return Number.isFinite(n) ? n : 0
  }

  set 순서(v: number) {
    if (!this.state) return
    this.state.order = Number.isFinite(Number(v)) ? Number(v) : 0
  }

  get 자식s(): Array<string | number> {
    const v = this.state?.childIds
    return Array.isArray(v) ? v : []
  }

  set 자식s(v: Array<string | number>) {
    if (!this.state) return
    this.state.childIds = Array.isArray(v) ? [...v] : []
  }

  /**
     * 기본은 최신(=PK 큰) 순. 초안은 PK가 없어 `Number()`가 NaN/0이고,
     * 그런 비교함수는 정렬 자체를 비결정적으로 만든다 — 그래서 따로 태운다.
     */
  compareTo(b: this) {
    if (this.is신규 !== b.is신규) return this.is신규 ? -1 : 1 // 새로 만든 행은 맨 위
    if (this.is신규) return this.rowKey < b.rowKey ? -1 : 1 // `local:` 키가 0패딩 순번이라 곧 만든 순
    return Number(b.stateId) - Number(this.stateId)
  }

  /**
     * PK가 아니라 identity로 비교한다. PK로 비교하면 저장 전 행끼리
     * `null == null`(또는 `undefined == undefined`)이 참이라 **서로 다른 초안 둘이 같은 행으로 판정된다.**
     */
  isSame(item: this) { return this.메뉴명 == item.메뉴명 && this.rowKey === item.rowKey }

  get 메뉴명() { return this.repo?.tableName }
}

/**
 * 디자인틀 = 인쇄물 한 벌의 **배치**. 테이블 `design-templates`.
 *
 * 배치란 규격(mm)과 그 위에 놓인 상자들의 좌표(%)다 (`디자인틀/types.ts` 의 `i틀`).
 * 세 레이어(배경 · 표식 · 글자)가 한 벌이고, **좌표를 데이터가 갖는다** — 코드가 아니라
 * 표의 행이 "이름이 어디에 놓이는가"를 안다. 만드는 주체도 AI가 아니라 사람이고,
 * 고치는 자리는 캔버스(`app/components/PrintTemplate`)다.
 *
 * **이 자리에 좌표를 코드가 들던 층이 있었다.** AI가 색·서체만 갈아 끼우는 구조라
 * "이름을 조금 왼쪽으로"가 코드 수정이었고, 그래서 사람이 손댈 수 없어 폐기했다. 지금은
 * 그게 캔버스에서 상자를 끄는 일이고, 회원 카드 출력(`model회원.do디자인틀출력`)도 이쪽에 물려 있다.
 *
 * **행이 곧 디자인틀이다.** 캔버스가 잡는 `i틀` 은 이 행을 깊게 뜬 작업 사본이고(`열기`),
 * 저장은 그 사본을 다시 이 행에 담는다(`담기`). 사본을 두는 이유는 하나다 — 행을 그대로
 * 물리면 상자를 끄는 순간 목록에 앉은 행이 같이 움직여, 저장하지도 않은 변경이 목록에 비친다.
 *
 * dto 칸이 영문인 것은 취향이 아니다. `BaseModels2.toApiPayload` 가 **한글 키를 서버 전송에서
 * 통째로 걸러내므로**(`/[ㄱ-ㅎㅏ-ㅣ가-힣]/` 로 키를 검사한다) `이름`·`면s` 를 최상위 칸으로
 * 두면 저장이 조용히 빈 몸으로 나간다. 다만 거르는 것은 **최상위 키 하나뿐**이라, `pages`
 * 안에 담긴 면·상자의 한글 키는 그대로 간다 — 칸 이름만 영문이고, 그 칸에 담기는 값객체는 한글이다.
 */
import { computed, toValue } from 'vue'
import { BaseModels2, BaseModel2, 타입지정, type BaseXX, type BaseXXDto, getRepoInstance } from '~utils/models'
import { clone } from '~utils'
import { model메뉴s } from '../_basics/model메뉴'
import { i디자인틀seed } from '../seeds'
import {
  노출용도s,
  면s복제,
  빈디자인틀,
  용도정의s,
  type i규격,
  type i면,
  type i용도,
  type i틀
} from './디자인틀'

const 용도options = 노출용도s.map(k => ({ label: k, value: k }))

const is사용중options = [
  { label: '사용중', value: true, icon: 'i-material-symbols-light:check-circle-outline' },
  { label: '보관', value: false, icon: 'i-material-symbols-light:circle-outline' }
]

export interface i디자인틀dto extends BaseXXDto {
  label: string
  purpose: i용도
  /** 실물 규격. 앞뒤 크기가 다른 인쇄물은 없으므로 면이 아니라 디자인틀이 하나만 든다 */
  size: i규격
  /** 면 배열. 길이 1이면 한 면, 2면 앞뒤 — 상한은 2다 (`i틀` 머리말) */
  pages: i면[]
  /**
     * 이 용도에서 **실제 발급에 쓰이는** 디자인틀인가.
     *
     * 같은 용도로 배치가 여럿 서기 때문에 필요하다 — 명함이 세 가지 있으면 회원 화면의
     * '명함 출력'이 그중 무엇을 뽑을지 정할 근거가 있어야 한다. 용도당 한 줄만 참이고,
     * 그 규칙은 세터가 지킨다 (`is사용중`).
     */
  isDefault: boolean
}

export interface i디자인틀 extends BaseXX {
  이름: string
  용도: i용도
  규격: i규격
  면s: i면[]
  is사용중: boolean
}

export class model디자인틀s extends BaseModels2<model디자인틀, i디자인틀dto> {
  protected etcFields = []
  static getInstance = () => getRepoInstance('model디자인틀s', () => new model디자인틀s())

  /**
     * `hasConfirm: false` — 지우기·추가를 묻고 알리는 일은 편집기가 이미 한다
     * (`use디자인틀.ts` 의 확인창). 베이스까지 물으면 같은 삭제에 창이 두 번 뜬다.
     */
  private constructor() {
    super(model디자인틀, 'design-templates', { hasConfirm: false })
  }

  /** `view목록5` 가 제목·세는단위를 읽는 자리 (`/admin/design-templates` 관리 화면). 다른 표와 같은 관례다 */
  get 메뉴() { return model메뉴s.getInstance().getBy테이블명(this.tableName) }

  /**
     * 표가 비었을 때 세울 시작 배치. 회원 카드 출력이 이 표에 기대므로 폴백이 필요하다
     * (`seeds/model디자인틀.seed.ts` 머리말). 붙박이 렌더러를 폐기한 대가로 지는 몫이다.
     */
  protected override seed = i디자인틀seed

  override _generate = () => new model디자인틀().generate()
  override _init = () => new model디자인틀().init()

  /**
     * id 로 디자인틀을 집는다. **없으면 `null`.**
     *
     * 한때 "없으면 첫 디자인틀"이었다. 코드가 든 붙박이가 늘 하나는 있던 시절의 폴백인데, 그게 있으면
     * 사라진 디자인틀 자리에 엉뚱한 배치(등급증)가 서고 '되돌리기'가 남의 배치를 깔아 버린다.
     * 지금은 표가 통째로 비어 있을 수도 있으므로 폴백을 댈 곳 자체가 없다.
     */
  디자인틀찾기 = (id: string): model디자인틀 | null =>
    toValue(this.list).find(row => String(row.stateId) === id) ?? null

  /** 같은 용도의 디자인틀들. "명함이 몇 가지 있나"를 보여줄 때 쓴다 */
  용도별디자인틀s = (용도: i용도) => toValue(this.list).filter(row => row.용도 === 용도)

  /**
     * 이 용도로 발급할 때 쓸 디자인틀. **지정된 게 없으면 그 용도의 첫 디자인틀로 떨어진다.**
     *
     * `null` 을 돌려주고 부르는 쪽이 알아서 하게 두지 않는 이유: 디자인틀이 있는데 아무도
     * '사용중'을 안 눌렀다는 건 고르지 않았다는 뜻이지 뽑지 말라는 뜻이 아니다. 그 상태에서
     * 출력이 막히면 사람은 왜 안 나오는지 알 길이 없다 — 표에 디자인틀이 버젓이 있기 때문이다.
     *
     * 정말로 없을 때만(그 용도의 행이 0개) `null` 이고, 그때는 뽑을 것이 실제로 없다.
     */
  get사용중 = (용도: i용도): model디자인틀 | null => {
    const 후보s = this.용도별디자인틀s(용도)
    return 후보s.find(row => row.is사용중) ?? 후보s[0] ?? null
  }

  /**
     * 목록에 선 것 중 첫 줄. 숨긴 용도(`용도정의s[].show`)의 행은 건너뛴다 —
     * 그냥 첫 행을 열면 캔버스에는 떠 있는데 왼쪽 목록 어디에도 없는 디자인틀이 된다.
     */
  첫디자인틀 = (): model디자인틀 | null =>
    toValue(this.list).find(row => 용도정의s[row.용도]?.show) ?? null

  options = computed(() =>
    toValue(this.list).map(row => ({ label: `${row.용도} · ${row.이름}`, value: row.stateId }))
  )
}

export class model디자인틀 extends BaseModel2<i디자인틀dto> implements i디자인틀 {
  constructor(state?: i디자인틀dto) {
    super(model디자인틀s.getInstance(), state)
  }

  override afterCreate = () => { }
  override beforeSave = () => true
  override afterSave = () => { }

  /** 빈 종이 한 장. 모양의 근거는 `빈디자인틀()` 하나뿐이라 여기서 다시 적지 않는다 */
  override init() {
    const 틀 = 빈디자인틀()
    return {
      label: 틀.이름,
      purpose: 틀.용도,
      size: 틀.규격,
      pages: 틀.면s,
      isDefault: false
    }
  }

  override generate() {
    return this.init()
  }

  override get label() { return this.이름 }
  override get sub() { return this.용도 }

  get 이름() { return this.state.label }
  set 이름(v) { this.state.label = v }
  get 용도() { return this.state.purpose }
  set 용도(v) { this.state.purpose = v }
  get 규격() { return this.state.size }
  set 규격(v) { this.state.size = v }
  get 면s() { return this.state.pages }
  set 면s(v) { this.state.pages = v }

  get is사용중() { return !!this.state.isDefault }
  set is사용중(v: boolean) {
    this.state.isDefault = v
    if (!v) return
    // 용도당 하나만 사용중 — 끄는 쪽은 저장까지 해야 새로고침 뒤에도 하나로 남는다
    model디자인틀s.getInstance()
      .용도별디자인틀s(this.용도)
      .filter(row => !row.isSame(this) && row.state.isDefault)
      .forEach((row) => { row.state.isDefault = false })
    this.repo.do모두저장()
  }

  /**
     * 목록은 **만든 순서대로** 선다. 베이스 기본값(`compareTo`)이 최신 우선이라 뒤집는다.
     *
     * 디자인틀목록의 '새 디자인틀' 칸이 목록 맨 끝의 점선 네모라서다 — 거기서 만든 것이 목록 맨 위로
     * 튀면 방금 누른 자리와 결과가 어긋난다. "늘어난 자리 바로 다음에 선다"가 그 칸을 머리말이
     * 아니라 목록 끝에 둔 이유이기도 하다 (`목록.vue`).
     */
  override compareTo(b: this) {
    // 초안은 서버 id가 없어 `Number()`가 NaN이다 — 베이스와 같은 이유로 따로 태우되,
    // 여기는 '만든 순서'라 새 행이 맨 **끝**에 선다(점선 네모를 누른 자리 그대로).
    if (this.is신규 !== b.is신규) return this.is신규 ? 1 : -1
    if (this.is신규) return String(this.stateId) < String(b.stateId) ? -1 : 1
    return Number(this.stateId) - Number(b.stateId)
  }

  _badges = computed(() => [
    { label: this.용도 },
    { label: this.규격?.이름 ?? '규격 없음' },
    ...(this.면s?.length > 1 ? [{ label: '양면' }] : []),
    ...(this.is사용중 ? [{ label: '사용중' }] : [])
  ])

  override get badges() { return toValue(this._badges) }

  /**
     * 자동 틀에는 이름과 용도만 둔다.
     *
     * 규격과 면은 **캔버스가 소유한다** — 좌표를 틀 입력칸으로 고치는 것은 이 편집기가 있는
     * 이유 자체를 부정하는 일이고, `면s` 를 텍스트로 노출하면 JSON 한 벌이 입력칸에 뜬다.
     */
  override 자동필드ss = [
    {
      label: '기본',
      list: [
        { key: '이름', label: '디자인틀명' },
        { key: '용도', label: '용도', type: 타입지정.선택0, options: 용도options as any, props: { type: 'radio' } },
        { key: 'is사용중', label: '발급에 사용', type: 타입지정.선택0, options: is사용중options as any }
      ]
    }
  ]

  /**
     * 이 행을 캔버스에 열 수 있는 모양으로 편다.
     *
     * 하는 일은 **깊게 뜨는 것** 하나다. 행을 그대로 물리면 캔버스에서 상자를 끄는 순간 목록에
     * 앉아 있는 행의 좌표가 같이 움직인다. 상자 id 까지 새로 내는 건(`면s복제`) 같은 배치를 두 번
     * 열었을 때 선택(`i선택`)과 실측(`글자실측키`)이 둘을 가르게 하려는 것이다.
     *
     * id 는 그대로 들고 온다 — 편 것이 곧 그 디자인틀이라 저장하면 같은 행으로 돌아가야 한다.
     */
  열기 = (): i틀 => ({
    id: String(this.stateId ?? ''),
    이름: this.이름,
    용도: this.용도,
    규격: { ...this.규격 },
    면s: 면s복제(this.면s)
  })

  /**
     * 캔버스에서 고친 것을 이 행에 담는다. **저장하지는 않는다** — 부르는 쪽이 이어서 `do저장()`.
     *
     * 깊게 복사하는 이유는 `열기` 와 정확히 반대 방향의 같은 문제다. 얕게 물리면 저장한 뒤로
     * 행과 캔버스가 같은 배열을 보게 되어, 다음에 상자를 끄는 순간 저장본이 같이 움직인다.
     * 그러면 "고쳤는가"(`손댐`)가 영영 거짓이 되어 저장 버튼이 다시 뜨지 않는다.
     */
  담기 = (틀: i틀) => {
    this.state.label = 틀.이름
    this.state.purpose = 틀.용도
    this.state.size = { ...틀.규격 }
    this.state.pages = clone(틀.면s)
  }
}

/**
 * 새 행을 만들어 저장한다. 돌려주는 행의 id 가 곧 `i틀.id` 에 들어갈 값이다.
 *
 * 만드는 절차를 모델이 갖는 자리다 (`doAI디자인생성` · `do애셋보관` 과 같은 층).
 */
export async function do디자인틀추가(틀: i틀): Promise<model디자인틀> {
  const row = new model디자인틀()
  row.담기(틀)
  return await row.add()
}

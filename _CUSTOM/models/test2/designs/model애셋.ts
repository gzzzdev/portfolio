import { computed, toValue } from 'vue'
import { BaseModels2, BaseModel2, 타입지정, type BaseXX, type BaseXXDto, getRepoInstance } from '~utils/models'

/**
 * 애셋 — 문서에 얹을 그림을 저장해 두고 **다시 고르는** 것.
 *
 * 디자인틀(`model디자인틀`)의 배경과 표식은 지금 매번 AI로 새로 뽑는다. 그런데 마음에 든 종이나
 * 도장은 다음 문서에서도 쓰고 싶고, 그때마다 다시 뽑는 건 값도 값이지만 **같은 것이 다시 안 나온다**.
 * 그래서 뽑은 것을 여기 남겨 두고, 다음부터는 고르거나(기본) 새로 뽑거나(+) 하게 한다.
 *
 * 한때 AI가 색·서체를 만들어 씌우던 스킨 층의 형제였다. 저쪽이 폐기되면서 AI 생성물을 저장해
 * 재사용하는 모델은 이것 하나만 남았다 — 그래서 여기가 그 관례의 유일한 자리다.
 *
 * 종류를 한 모델에 담은 이유는 저장 구조가 같아서다(링크 + 묘사 + 비율). 실제 차이는
 * "배경은 비율로 걸러야 하고 표식은 아니다" 하나뿐이라 필드 하나와 필터 한 줄로 끝난다.
 * 나중에 폰트·문양이 늘어도 `종류`에 한 줄이면 된다 — 그러라고 이 이름이다.
 */

export const i애셋종류options = [
  { label: '배경', value: '배경', icon: 'i-lucide-image' },
  { label: '표식', value: '표식', icon: 'i-lucide-award' }
] as const
export type i애셋종류 = typeof i애셋종류options[number]['value']

/**
 * 비율이 같다고 볼 허용치.
 *
 * 배경 그림이 문서 규격 그대로 생성되고 나서야(gen_img 의 `frameRatio` — 빈 캔버스 경로)
 * 의미가 생긴 값이다. 그 전에는 상류 비율 enum 에 A4(1:1.414)가 없어 늘 5.7% 를 깔고 갔으므로
 * 어긋남이 상태가 아니라 상수였다. 지금은 갓 뽑은 배경이 0.005% 라, 0.5% 를 넘으면
 * 그건 **규격이 다른 그림**이다.
 *
 * 디자인틀 편집기의 "이 배경이 낡았는가" 판정(`app/components/PrintTemplate/생성지시문.ts`)도 이 값을 쓴다 — 두 곳이 따로 임계를 들면
 * 목록에는 뜨는데 얹으면 낡았다고 하는 그림이 생긴다.
 */
export const 비율허용 = 0.005

/** 이 그림의 비율을 이 문서에 써도 되는가. 비율을 모르는 그림(null)은 판단하지 않고 통과시킨다 */
export const is쓸수있는비율 = (그림비율: number | null | undefined, 문서비율: number) => {
  if (그림비율 == null || !Number.isFinite(문서비율) || 문서비율 <= 0) return true
  return Math.abs(1 - Math.min(그림비율, 문서비율) / Math.max(그림비율, 문서비율)) <= 비율허용
}

export interface i애셋dto extends BaseXXDto {
  kind: i애셋종류
  url: string
  prompt: string
  ratio: number | null
}

export interface i애셋 extends BaseXX {
  종류: i애셋종류
  링크: string
  묘사: string
  비율: number | null
}

export class model애셋s extends BaseModels2<model애셋, i애셋dto> {
  protected etcFields = []
  static getInstance = () => getRepoInstance('model애셋s', () => new model애셋s())

  private constructor() {
    super(model애셋, 'assets')
  }

  override _generate = () => new model애셋().generate()
  override _init = () => new model애셋().init()

  listBy종류 = (종류: i애셋종류) => toValue(this.list).filter(row => row.종류 === 종류)

  /**
     * 이 문서에 쓸 수 있는 배경.
     *
     * **비율이 안 맞는 배경은 아예 안 보여준다.** 고르는 순간 잘리거나 늘어나는데, 그건
     * 배경을 규격대로 뽑게 만들면서 없앤 바로 그 문제다. 목록에 두면 다시 들어온다.
     */
  list배경 = (문서비율: number) =>
    this.listBy종류('배경').filter(row => is쓸수있는비율(row.비율, 문서비율))

  /** 표식은 사각형 위치로 놓이므로 규격과 무관하다 — 거를 것이 없다 */
  list표식 = () => this.listBy종류('표식')
}

export class model애셋 extends BaseModel2<i애셋dto> implements i애셋 {
  constructor(state?: i애셋dto) {
    super(model애셋s.getInstance(), state)
  }

  override afterCreate = () => { }
  override beforeSave = () => true
  override afterSave = () => { }

  override init() {
    return {
      kind: '배경' as i애셋종류,
      url: '',
      prompt: '',
      ratio: null
    }
  }

  override generate() {
    return this.init()
  }

  /**
     * 이름 필드가 없다 — **그림을 보고 고르기 때문이다.**
     * 그래도 목록 UI 가 라벨을 요구하므로 묘사가 그 자리를 대신한다.
     */
  override get label() { return this.묘사 || '(묘사 없음)' }
  override get sub() { return this.종류 }

  get 종류() { return this.state.kind }
  set 종류(v) { this.state.kind = v }

  /**
     * 그림 주소. **`타입지정.링크`(Input링크)와 무관하다** — 그건 하이퍼링크 입력칸이고
     * 이 필드는 그림이라 틀에서 `타입지정.이미지`를 쓴다. 이름이 같아 자동완성으로 잘못 집기 쉽다.
     */
  get 링크() { return this.state.url }
  set 링크(v) { this.state.url = v }

  /** 이 그림을 만든 문장. "같은 결로 다시 뽑기"의 근거이자 목록의 라벨 */
  get 묘사() { return this.state.prompt }
  set 묘사(v) { this.state.prompt = v }

  /**
     * 만들 때의 문서 비율(폭/높이). 표식은 규격과 무관해 항상 null 이고,
     * 밖에서 받은 그림도 알 수 없어 null 이다 — 모르는 것은 거르지 않는다(`is쓸수있는비율`).
     */
  get 비율() { return this.state.ratio }
  set 비율(v) { this.state.ratio = v }

  _badges = computed(() => [{ label: this.종류 }])
  override get badges() { return toValue(this._badges) }

  override 자동필드ss = [
    {
      label: '기본',
      list: [
        { key: '종류', label: '종류', type: 타입지정.선택0, options: i애셋종류options as any, props: { type: 'radio' } },
        { key: '링크', label: '그림', type: 타입지정.이미지 },
        { key: '묘사', label: '묘사', is한줄: false }
      ]
    }
  ]
}

/**
 * 그림 하나를 애셋으로 보관한다. (`do디자인틀추가` 와 같은 자리 — 만드는 절차는 모델이 갖는다)
 *
 * **이미 보관된 링크면 그것을 돌려주고 새로 만들지 않는다.** 부르는 쪽이 "이 그림이 새 것인가"를
 * 판단하지 않아도 되게 하려는 것이다 — 화면은 문서에 얹힌 링크만 알지, 그게 방금 뽑은 것인지
 * 목록에서 고른 것인지 구분할 방법이 없다. 그 구분을 여기서 한 번에 끝낸다.
 */
export async function do애셋보관(입력: {
  종류: i애셋종류
  링크: string
  묘사?: string
  비율?: number | null
}) {
  const 링크 = 입력.링크?.trim()
  if (!링크) return null

  const repo = model애셋s.getInstance()
  const 이미있음 = toValue(repo.list).find(row => row.링크 === 링크)
  if (이미있음) return 이미있음

  const row = new model애셋()
  row.state.kind = 입력.종류
  row.state.url = 링크
  row.state.prompt = 입력.묘사?.trim() ?? ''
  row.state.ratio = 입력.종류 === '표식' ? null : (입력.비율 ?? null)
  await row.add()
  return row
}

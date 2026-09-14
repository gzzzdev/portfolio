import { computed, reactive, toValue } from 'vue'
import { BaseModels2, BaseModel2, 타입지정, type BaseXX, type BaseXXDto, getRepoInstance } from '~utils/models'
import { mDayjs, generateName2, pick1, randomDate, do누끼크로마블롭, do알파규격크롭, type i규격, type i날짜 } from '~utils'

export const i캐릭터성별options = [
  { label: '남자', value: 'MALE', emoji: '♂️', icon: 'i-lucide-mars' },
  { label: '여자', value: 'FEMALE', emoji: '♀️', icon: 'i-lucide-venus' }
] as const
export type i캐릭터성별 = typeof i캐릭터성별options[number]['value']

interface i생김새조각 { text: string, when?: (나이: number, 성별: i캐릭터성별) => boolean }

const is남 = (_나이: number, 성별: i캐릭터성별) => 성별 === 'MALE'
const is여 = (_나이: number, 성별: i캐릭터성별) => 성별 === 'FEMALE'

/**
 * 나이·성별에 안 맞으면 표본이 어색해지는 것(20대의 `흰머리`, 남자의 `긴 생머리`)을 `when`으로 거른다.
 * 한쪽 성별에 훨씬 흔한 머리모양은 그쪽으로 몰아두고, 양쪽 다 흔한 것만 조건 없이 남긴다.
 */
const 머리후보s: i생김새조각[] = [
  { text: '짧은 머리', when: is남 },
  { text: '스포츠머리', when: is남 },
  { text: '가르마 머리', when: is남 },
  { text: '단발머리', when: is여 },
  { text: '긴 생머리', when: is여 },
  { text: '묶은 머리', when: is여 },
  { text: '파마머리' },
  { text: '숱이 많은 머리' },
  { text: '흰머리가 섞인 머리', when: 나이 => 나이 >= 45 },
  { text: '약한 대머리', when: (나이, 성별) => 성별 === 'MALE' && 나이 >= 40 }
]

const 얼굴후보s: i생김새조각[] = [
  { text: '갸름한 얼굴' },
  { text: '둥근 얼굴' },
  { text: '각진 턱', when: is남 },
  { text: '짙은 눈썹', when: is남 },
  { text: '온화한 인상' },
  { text: '무뚝뚝한 표정' },
  { text: '주근깨' },
  { text: '볼에 점' },
  { text: '앳된 얼굴', when: 나이 => 나이 < 27 },
  { text: '잔주름', when: 나이 => 나이 >= 35 },
  { text: '짧은 수염', when: is남 }
]

const 안경후보s = ['안경', '뿔테 안경', '동그란 안경']

/**
 * `do초안`이 채우는 생김새 조각들 (예: `['약한 대머리', '잔주름', '안경']`).
 * 갈래별로 하나씩만 뽑는다 — 한 풀에서 여러 개를 뽑으면 `짧은 머리, 긴 생머리`처럼 모순되는 조합이 나온다.
 */
const 랜덤생김새s = (나이: number, 성별: i캐릭터성별) => {
  const 고르기 = (후보s: i생김새조각[]) => {
    const 남은s = 후보s.filter(item => item.when?.(나이, 성별) ?? true)
    return 남은s.length ? pick1(남은s).text : null
  }
  return [고르기(머리후보s), 고르기(얼굴후보s), Math.random() < 0.4 ? pick1(안경후보s) : null]
    .filter((v): v is string => !!v)
}

export interface i캐릭터dto extends BaseXXDto {
  name: string
  idPhoto: string | null
  /** 생김새·특이사항 조각들(`안경`, `잔주름`). 증명사진 생성 프롬프트에 쉼표로 이어 붙인다. */
  appearance: string[]
  gender: i캐릭터성별
  birthdate: string
}

export interface i캐릭터 extends BaseXX {
  이름: string
  증명사진: string | null
  생김새s: string[]
  성별: i캐릭터성별
  생년월일: i날짜
  readonly 나이: number
}

export class model캐릭터s extends BaseModels2<model캐릭터, i캐릭터dto> {
  protected etcFields = []
  override 정렬조건s = [
    { label: '이름↑', value: '이름↑', func: (a: model캐릭터, b: model캐릭터) => a.이름.localeCompare(b.이름) },
    { label: '이름↓', value: '이름↓', func: (a: model캐릭터, b: model캐릭터) => b.이름.localeCompare(a.이름) },
    { label: '나이↑', value: '나이↑', func: (a: model캐릭터, b: model캐릭터) => b.생년월일.valueOf() - a.생년월일.valueOf() },
    { label: '나이↓', value: '나이↓', func: (a: model캐릭터, b: model캐릭터) => a.생년월일.valueOf() - b.생년월일.valueOf() }
  ]

  override 필터조건ss = [
    this.라디오필터그룹(
      i캐릭터성별options.map(item => ({ ...item, match: (a: model캐릭터) => a.성별 === item.value })),
      { title: '성별', isMultiple: !false, initialValues: [] }
    )
  ]

  static getInstance = () => getRepoInstance('model캐릭터s', () => new model캐릭터s())

  private constructor() {
    super(model캐릭터, 'characters')
    /** 시험용 표라 전역 스위치(`NUXT_PUBLIC_API_URL`)를 안 따르고 lowDB에 남는다. */
    this.apiURL = `/api/v0/${this.tableName}`
  }

  /** 목록5 헤더가 읽는 최소 메뉴 — v2에는 model메뉴 행이 없어서 직접 준다. */
  메뉴 = reactive({ label: '인물', 아이콘: 'i-ph:users-three-light', is계층: false, is시스템: false })

  override _generate = () => new model캐릭터().generate()
  override _init = () => new model캐릭터().init()
}

export class model캐릭터 extends BaseModel2<i캐릭터dto> implements i캐릭터 {
  constructor(state?: i캐릭터dto) {
    super(model캐릭터s.getInstance(), state)
  }

  override afterCreate = () => { }
  override beforeSave = () => true
  override afterSave = () => { }

  /**
   * `props`는 view/1.ts에서 `ref({ ...config.props })`로 한 번 펼쳐진다 —
   * 클래스 필드로 두면 그 시점 값에 고정되므로, 상태에 따라 변하는 props를 넣을 수 있게 getter로 둔다.
   */
  override get 자동필드ss() {
    return [
      {
        label: '기본',
        list: [
          { key: '이름', label: '이름', show: true },
          { key: '성별', label: '성별', type: 타입지정.선택0, options: [...i캐릭터성별options], props: { type: 'radio' }, show: true },
          { key: '생년월일', label: '생년월일', type: 타입지정._.날짜, show: true },
          { key: '나이', label: '나이', type: 타입지정._.숫자, props: { readonly: true }, canEdit: false, show: true },
          // 생성은 `AI 증명사진` 버튼(do증명사진생성)이 단독으로 소유한다 — 필드 AI탭은 생김새를 남기지 않아 재생성 시 같은 인물이 안 나온다.
          { key: '증명사진', label: '증명사진', type: 타입지정.이미지2, props: { orientation: 'portrait', tags: '인물', can생성: false, can검색: false, 민감: true }, show: true },
          // 버튼필드: `position`을 안 주면 선언한 이 자리에 인라인으로 그려진다. ('top'을 주면 상단 버튼바로 승격)
          { key: 'do증명사진생성', label: 'AI 증명사진', type: 타입지정.버튼, icon: 'i-lucide-sparkles', show: true },
          // 캐릭터 고유의 외형(안경·머리·인상·흉터 같은 특이사항). 사람이 읽는 설명이자 증명사진 재생성의 씨앗이다.
          // 한 줄 문장이 아니라 조각들의 목록이라 태그로 받는다 — 한 칸씩 지우고 더할 수 있어야 사진 재생성의 씨앗을 손보기 쉽다.
          { key: '생김새s', label: '생김새', type: 타입지정._.문자s, show: true }
        ]
      }
    ]
  }

  override generate() {
    const gender = (Math.random() > 0.5 ? 'MALE' : 'FEMALE') as i캐릭터성별
    const _birthdate = randomDate({ from: '1980-01-01', to: '2006-12-31', 시각: '자정' })
    const 나이 = mDayjs().diff(mDayjs(_birthdate), 'year')
    return {
      ...this.init(),
      name: generateName2(_birthdate.getFullYear(), gender === 'MALE'),
      gender,
      birthdate: mDayjs(_birthdate).format('YYYY-MM-DD'),
      appearance: 랜덤생김새s(나이, gender)
    }
  }

  override init() {
    return {
      name: '이름',
      idPhoto: null,
      appearance: [] as string[],
      gender: 'MALE' as i캐릭터성별,
      birthdate: '2000-01-01'
    }
  }

  override get label() { return this.이름 }
  override get sub() { return `${this.나이}세${this.성별이모지}` }
  override get icon() { return 'i-lucide-user-round' }
  override get thumbnail() { return this.증명사진 ?? undefined }
  /** 증명사진은 3:4 다(필드 `orientation: 'portrait'`, 생성본 597×796) — 16:10 칸에 담으면 우표가 된다 */
  override get 표지비율() { return '3 / 4' }

  get 이름() { return this.state?.name ?? '' }
  set 이름(v: string) { if (!this.state) return; this.state.name = v }

  get 증명사진() { return this.state?.idPhoto ?? null }
  set 증명사진(v: string | null) { if (!this.state) return; this.state.idPhoto = v || null }

  get 생김새s() { return this.state?.appearance ?? [] }
  set 생김새s(v: string[]) { if (!this.state) return; this.state.appearance = v.map(item => item.trim()).filter(Boolean) }

  get 성별(): i캐릭터성별 {
    const v = this.state?.gender
    return v === 'MALE' || v === 'FEMALE' ? v : 'MALE'
  }

  set 성별(v: i캐릭터성별) { if (!this.state) return; this.state.gender = v }

  get 성별이모지() { return i캐릭터성별options.find(item => item.value === this.성별)?.emoji ?? '' }
  get 성별라벨() { return i캐릭터성별options.find(item => item.value === this.성별)?.label ?? '' }

  // `AI 증명사진`은 자동필드ss의 증명사진 바로 아래로 옮겼다 (버튼필드).
  override 자동버튼s = this.기본버튼s

  /**
   * 랜덤으로 채운 직후엔 사진이 없어 목록에서 다 똑같아 보인다 — 이어서 증명사진까지 물어본다.
   *
   * 사진은 랜덤 전후로 들고 있다가 되돌린다: `generate()`가 `init()`을 통째로 펼쳐 넘기는 탓에
   * `super.do초안()`의 `Object.assign`이 사진까지 `null`로 덮는데, 이건 다시 만들려면 AI 호출이
   * 필요한 값이라 주사위 한 번에 날아가면 안 된다.
   */
  override do초안() {
    const 이전증명사진 = this.증명사진

    super.do초안()

    this.증명사진 = 이전증명사진

    // 생김새가 통째로 새로 뽑혔으니 남아 있는 사진은 이제 다른 인물이다 — 다시 만들지 물어본다.
    const 물음 = this.증명사진 ? '증명사진도 새로 만들까요? (기존 사진은 교체됩니다)' : '증명사진도 생성할까요?'
    if (!confirm(물음)) {
      // 취소하면 옛 사진이 새 생김새 위에 그대로 남는다. 조용히 어긋난 채로 두지 않고 말해준다.
      if (this.증명사진)
        useAlert().log('사진은 그대로 두었습니다', '새로 뽑은 생김새와는 다른 인물입니다 — 저장 전에 확인하세요')
      return
    }
    // 저장은 안 맡긴다 — 랜덤 결과 전체를 사람이 확인하고 한 번에 저장해야 취소할 여지가 남는다.
    void this.do증명사진생성({ is저장: false })
  }

  /**
   * 후보 2장 → 골라서 저장. (`model애셋` 의 보관 흐름과 같은 자리)
   * 외형은 `생김새s` 필드를 그대로 읽는다 — 성별·나이도 필드에서 자동으로 들어간다.
   * (비어 있으면 성별·나이만으로 생성된다)
   *
   * `is저장:false`면 사진만 폼에 얹고 저장은 호출한 쪽에 맡긴다 — `do초안`처럼 아직 확정 전인
   * 편집 도중에 부를 때 사진 한 장 때문에 나머지 필드까지 통째로 커밋되면 되돌릴 수가 없다.
   * (버튼필드는 MouseEvent를 넘기는데 거기엔 `is저장`이 없어 기본값 `true`로 떨어진다)
   */
  do증명사진생성 = async (opts?: { is저장?: boolean }) => {
    // 초록 바탕은 **고르기 화면에서** 걷어낸다 — 모달이 후보를 전부 키잉해 보여주고
    // 고른 한 장만 올린다. 그래야 누끼가 망가진 장(머리카락이 삭거나 배경이 남은 장)을
    // 확정 전에 눈으로 보고 버릴 수 있다. 키잉에 실패한 장은 원본 그대로 돌아온다.
    const url = await useModalImage().open({
      title: `${this.이름} 증명사진 고르기`,
      prompt: this.증명사진프롬프트,
      stylePrompt: this.증명사진스타일,
      aspectRatio: '3:4',
      개수: 2,
      // 증명사진은 `uploads/ai/faces` 로. 지시문 경로라 서버는 용도를 모른다
      dir: 'faces',
      후처리: async (링크) => {
        // 초록이 아니어서 키잉이 물러나면(null) 크롭도 하지 않는다 — 잴 실루엣이 없다.
        // 크롭만 실패한 경우엔 누끼 뜬 장을 그대로 살린다. 얼굴 크기가 안 맞는 것보다
        // 배경이 남은 것이 눈에 훨씬 잘 띄므로, 둘 중 하나만 건진다면 누끼 쪽이다.
        const 키잉 = await do누끼크로마블롭(링크)
        if (!키잉) return null
        return (await do알파규격크롭(키잉, this.증명사진규격)) ?? 키잉
      }
    })
    if (!url) return

    this.증명사진 = url
    if (opts?.is저장 ?? true) await this.do저장()
  }

  /**
   * 사진3 AI생성 탭(`prompt` prop)의 피사체 묘사.
   * 성별·나이는 필드에서 자동으로 따오고, 캐릭터 고유의 외형(안경·머리·인상)만
   * `생김새s`로 남겨 재생성해도 같은 인물로 유지되게 한다.
   */
  get 증명사진프롬프트() {
    return [
      `${this.나이}-year-old Korean ${this.성별 === 'MALE' ? 'man' : 'woman'}`,
      ...this.생김새s
    ].filter(Boolean).join(', ')
  }

  /**
   * 증명사진의 촬영 규칙. **이 지식은 캐릭터에 종속되므로 모델이 소유한다** —
   * gen_img의 공용 프리셋(실사/라인아트)은 배경을 보케로 날리고 정면 얼굴을 회피시킨다.
   * (행사포스터는 model행사가, 강의썸네일은 model강의가 각자 갖는 방식)
   *
   * **짧게 쓴다.** 길게 쓸수록 나빠지는 걸 세 번 확인했다.
   * - `passport / ID photograph, official document standards` → 옷이 전부 짙은 남색이 됐다.
   *   학습 데이터의 증명사진 복장이 그것이라 뒤에 `plain everyday clothing` 을 적어도 못 이긴다.
   * - 모공·홍조·다크서클·각질을 늘어놓은 `Skin:` → 그게 다 동시에 보이는 순간, 즉 방금
   *   세안한 얼굴이 나왔다. 형용사를 열거하면 상태가 아니라 시점이 고정된다.
   * - `about 70% of the frame height` → 장마다 얼굴 크기가 달라졌다. 그림 모델은 자를 안 댄다.
   *
   * **여기 남은 것은 코드가 의존하는 조항뿐이다.**
   * - 초록 바탕: `do누끼크로마블롭` 이 색으로 걸러 지운다. 표식처럼 밝기로 지우면 흰 셔츠·눈
   *   흰자·이마 하이라이트에 구멍이 뚫려서, 살색·머리색과 안 겹치는 색이 필요하다.
   * - 바탕에 그림자·그라데이션 금지: 초록기가 떨어져 안 지워지고 얼룩으로 남는다.
   * - 초록 옷 금지: 스필 억제(`크로마키잉` 끝의 `ng > max(nr,nb)`)에 같이 죽는다.
   * - 넉넉한 프레이밍: 크기 맞추는 일은 `do알파규격크롭` 이 알파를 읽어 공짜로 한다
   *   (`증명사진규격`). 크롭은 잘라내기만 하므로 원본에서 잘린 머리카락은 못 되돌린다.
   */
  get 증명사진스타일() {
    return `A plain front-facing headshot, head and shoulders, on a chroma key green screen.

Framing: squarely facing the camera, both ears and the full hairline visible. Leave generous room above the head and beyond both shoulders — nothing but the chest may be cut off by the frame.
Expression: neutral, mouth closed, eyes open.
Background: flat #00b140 green, edge to edge, evenly lit. No gradient, shadow, texture or bokeh — it gets keyed out afterwards.
Light: soft, even and frontal, not glossy. Everything sharp; no shallow depth of field. No green spilling onto skin, hair or shoulders.
Subject: no makeup. Real skin, unretouched. Ordinary clothes, nothing green or teal. No hat, no sunglasses.
No text, logos, watermarks or borders.`
  }

  /**
   * 누끼 뜬 사진을 앉힐 프레임 규격 (`do알파규격크롭`). **여권사진 실물 규격을 비율로 옮긴 값이다** —
   * ICAO 9303 / 한국 여권사진은 세로 45mm 에 얼굴길이(정수리~턱) 32~36mm, 정수리 위 여백 3~5mm 다.
   * 여백 4mm / 45mm ≈ `정수리 0.09`. 비율 `3:4` 는 `do증명사진생성` 이 생성 때 이미 고정한다.
   *
   * **폭으로 말하는 이유는 여기서 잴 수 있는 것이 폭뿐이기 때문이다.** 크롭은 이목구비 모델 없이
   * 픽셀만 보므로 턱 끝이 안 나온다 (왜 못 찾는지는 `알파크롭.ts` 첫 주석에 적어 뒀다).
   * 그래서 규격의 얼굴길이를 폭으로 환산해 준다.
   *
   * `얼굴폭` — **살색으로 찾은 얼굴의 귀~귀 폭.** 사람 머리는 귀까지 친 폭이 정수리~턱 길이의
   * 약 0.655 배이므로, 얼굴길이 34mm 는 폭 22.3mm 이고 프레임 가로(45 × 3/4 = 33.75mm) 대비
   * `0.66` 이다. 머리카락이 안 드는 값이라 숱이 많든 짧든 같은 크기로 앉는다.
   *
   * `머리폭` — 살색을 못 찾았을 때만 쓰는 대비책. 실루엣의 머리 폭이라 **머리카락까지 친 값**이다.
   * 0.68 은 그 오차를 양끝에 반씩 나눠 준 값이라(숱 많은 쪽 0.72H, 짧은 머리 쪽 0.79H)
   * 32~36mm 안에는 남지만 장마다 흔들린다. 얼굴 크기가 장마다 달라 보이던 원인이 이것이고,
   * `얼굴폭` 이 그 자리를 대신한다.
   */
  get 증명사진규격(): i규격 { return { 가로: 3, 세로: 4, 정수리: 0.09, 얼굴폭: 0.66, 머리폭: 0.68 } }

  _생년월일 = computed(() => mDayjs(this.state?.birthdate ?? '2000-01-01'))
  get 생년월일() { return toValue(this._생년월일)! }
  set 생년월일(v: i날짜) {
    if (!this.state) return
    this.state.birthdate = v.format('YYYY-MM-DD')
  }

  get 나이() { return Math.max(0, mDayjs().diff(this.생년월일, 'year')) }
}

import { computed, reactive, ref, toValue } from 'vue'
import { BaseModels2, BaseModel2, 타입지정, getRepoInstance } from '~utils/models'
import type { BaseXX, BaseXXDto } from '~utils/models'
import { do필드폼 } from '~utils'
import {
  // 정규화 함수 여덟 개와 옵션 배열 여섯 개를 여기서 하나씩 끌어오던 자리다 (2026-09-09 정리).
  // 축이 자기 `normalize` 와 `options` 를 들게 되면서 전부 `AXES` 하나로 모였고,
  // 게터·세터의 말단 정규화는 걷었다 — 값이 들어오는 문은 `축설정` 하나다(그 머리말).
  AXES, AXIS_GROUPS, axisIndex, axisLength, axisPatch, axisRandomIndex, axisStepIndex,
  captureSnapshot, snapshotPatch, DEFAULT_THEME, THEME_AXIS_NAMES, 묶음축s, 상태키s, 상태채우기, 시력축s, 축묶음s, 축인덱스,
  // 아래 `export type *` 가 있어도 이 줄들은 지우면 안 된다 — 재수출은 지역 이름을 안 만들어서
  // 게터들의 타입 자리가 통째로 `Cannot find name` 이 된다.
  type ColorModePreference, type ThemeAxisName, type ThemeSnapshot, type ThemeState, type 시력축, type 축묶음, type 축옵션,
  type i강조색, type i굵기, type i그림자, type i글꼴, type i글자크기, type i라운드, type i줄간격,
  type i보조색, type i색온도, type i완제품id, type i재질, type i진하기, type i화면
} from '~utils/theme/축'
import { useThemeStore } from '~/stores/useThemeStore'
import { i테마새행, i테마seed } from './model테마.seed'

export type * from '~utils/theme/축'

// ═════════════════════════════  완제품이란 무엇인가  ═════════════════════════════
//
// **2026-09-09 에 `~utils/theme/완제품s.ts` 에서 접어 왔다.** 그 파일에 남아 있던 것은 별칭 셋과
// 항등함수 하나, 그리고 두 줄짜리 판정뿐이었다 — 완제품은 **이 표의 행**이라(`i테마dto`) 여기가
// 제자리다.
//
// 접을 수 있었던 것은 `완제품축만` 을 지웠기 때문이다. 그게 있는 동안 스토어가 그 모듈에서
// **값**을 가져갔고, 그러면 접는 순간 스토어 ↔ 모델 순환이 된다(스토어를 이 파일이 부른다).
// 지우고 나니 스토어가 가져가던 것이 전부 타입이 됐고, **타입 간선은 런타임에 없다.**

/** 완제품이 자기 모드를 들고 있으므로 화면 모드와 같은 값이다 — 이름만 이 자리 어휘로 둔다. */
export type PresetMode = i화면

/**
 * 완제품이 세우는 축들 = **테마의 축 전부**. 이 목록이 곧 `matchPresetId` 의 비교 대상이다.
 *
 * 전에는 축 이름 여섯 개를 배열 리터럴로 적어 뒀다. 그래서 재질·진하기·선 진하기·글자 크기·
 * 줄간격을 든 카드를 만들 수 없었다 — 그런 그림은 카드가 절반만 나르고 나머지는 사람이 「읽기」
 * 묶음에서 따로 돌려야 완성됐다. **목록을 두 벌 들면 반드시 한쪽만 늘어난다**, 그게 이 결함이
 * 생긴 방식이라 그 방식을 없앴다: 이제 축을 하나 늘리면 완제품도 같이 는다.
 *
 * 시력 축은 카드가 **비워 둘 수 있고**, 그때 판정은 그 축을 건너뛴다(`PresetTheme`).
 */
export const 완제품축s = 상태키s

/**
 * 완제품 한 장이 세우는 값. 생김새 축은 전부 들고, **시력 축은 비워 둘 수 있다**(`시력축s`) —
 * 빈 칸은 「이 카드는 말이 없다」다(2026-09-13). 그래서 `ThemeState` 와 같은 것이 아니라 그보다
 * 느슨하고, `ThemeState` 는 여기 그대로 들어간다(직접 맞춤 한 장이 그 길로 온다 — `프리셋격자.vue`).
 *
 * 전에는 `ThemeState` 그대로였다. 그러면 `카드` 가 빈 칸을 기본값으로 메워 넘기고 `테마씌우기` 가
 * 그 기본값을 쓴다 — 「아주 크게」로 놓고 노을을 누르면 글자가 보통으로 떨어졌다. 「손 안 댐」 문은
 * `축쓰기` 에 이미 있었는데(`undefined` 를 거른다) 거기에 `undefined` 가 도달한 적이 없었다.
 */
export type PresetTheme = Omit<ThemeState, 시력축> & Partial<Pick<ThemeState, 시력축>>

/** 화면에 그릴 완제품 한 장. 표의 행(`model테마.카드`)과 직접 맞춤이 둘 다 이 모양으로 온다. */
export interface ThemePreset {
  id: string
  label: string
  desc: string
  mode: PresetMode
  theme: PresetTheme
}

/** 판정에 필요한 최소. `ThemePreset` 에서 이름표를 뺀 것이다 — 판정은 이름을 안 본다. */
export type PresetLike = Pick<ThemePreset, 'id' | 'mode' | 'theme'>

/**
 * 지금 화면과 정확히 같은 완제품의 id. 없으면 `null` — 그게 「직접 맞춤」이다.
 *
 * **화면 모드도 비교한다.** 완제품은 자기 모드를 들고 있는 독립된 한 장이라(`프리셋격자.vue`),
 * 밝은 「잉크」와 어두운 「흑연」은 다른 카드다.
 *
 * 목록을 인자로 받는 이유는 목록이 표에 살기 때문이다. 아직 안 왔으면 빈 배열이 들어오고 `null`
 * 이 나간다 — 「아직 모른다」가 「직접 맞춤」과 같은 값이라 첫 화면에서 카드가 잠깐 안 켜질 뿐,
 * 틀린 카드가 켜지지는 않는다.
 *
 * **카드가 비워 둔 축은 안 본다**(`PresetTheme`). 안 그러면 글자만 키운 사람한테 카드가 영영 안
 * 켜지고, `직접맞춤갈무리` 가 그 상태를 「직접 맞춤」으로 담는다 — 글자 크기를 바꾼 건 카드를
 * 떠난 게 아니다.
 */
export function matchPresetId(state: ThemeState, mode: PresetMode, list: readonly PresetLike[]): string | null {
  return list.find((p) => {
    const 칸: Partial<ThemeState> = p.theme
    return p.mode === mode && 완제품축s.every(k => 칸[k] === undefined || 칸[k] === state[k])
  })?.id ?? null
}

/**
 * 완제품 행의 빈 칸을 채운다 — **시력 축은 빼고.** 생김새 축의 빈 칸은 옛 행이 새 칸을 안 든
 * 자리라 그 축의 기본값으로 세우지만(`상태채우기`), 시력 축의 빈 칸은 「이 카드는 말이 없다」라
 * 그대로 비워 둔다(`시력축s`). 메워 버리면 그 뜻이 「기본값으로 되돌려라」로 바뀐다 — 그게
 * 2026-09-13 이전의 버그였다(`PresetTheme` 머리말).
 */
function 완제품채우기(v: Partial<Record<keyof ThemeState, unknown>>): PresetTheme {
  const 비운시력칸: readonly string[] = 시력축s.filter(k => v[k] === undefined)
  return Object.fromEntries(
    Object.entries(상태채우기(v)).filter(([k]) => !비운시력칸.includes(k))
  ) as PresetTheme
}

/**
 * `theme` 표 — **행 하나가 완제품 한 장이고, 맨 앞 한 줄만 다르다.**
 *
 * | | 어디서 오나 | 무엇을 드나 | 저장 |
 * |---|---|---|---|
 * | 첫 행 = **현재 테마** | `reads` 가 지어낸다 | 축 12개 전부 | 없음 (스토어가 주인) |
 * | 나머지 = **완제품** | 서버 | 이름·설명·모드 + **축 전부** | 진짜 행 |
 *
 * ## 값은 스토어, 조작은 여기
 *
 * 축을 밀고 굴리고 되돌리고 완제품을 씌우는 일이 전부 이 파일에 있고, 값을 쓰는 문은 `축쓰기`
 * 하나다. **스토어로 되돌리지 말 것** — 화면·목록 버튼·챗봇 셋이 거는 일이라 입구가 둘이 되는
 * 순간 범위가 갈린다(`축쓰기` 머리말).
 *
 * 값만 스토어에 남은 이유는 첫 바이트다. SSR 첫 페인트가 쿠키 하나를 파싱해서 서는데
 * (`plugins/00.theme-ssr.server.ts`), 거기에 DB 왕복을 끼우면 누가 요청했는지부터 알아야 하고
 * 비로그인 방문자에겐 읽을 행조차 없다. **현재 테마만이 첫 바이트에 필요한 값이다.**
 * 그래서 그 행은 지어낸 껍데기고, 칸의 주인은 전부 `useThemeStore` 다.
 *
 * ## 왜 표를 안 갈랐나
 *
 * 한 클래스가 두 모양을 지는 값을 치른다(`자동필드ss`·`beforeSave`·공통 칸 열셋이 행마다 갈린다).
 * 그런데 가르면 더 비싸다 — **`aiV2` 가 소스의 칸과 「지금 값」을 `repo.list[0]` 에서 빌려 읽는다**
 * (`~utils/aiV2/source.ts` 의 `열린필드s`·`현재값`). 현재 테마가 그 자리에 그대로 앉아 있으면
 * 도우미는 한 줄도 안 고쳐도 된다. 그래서 **첫 행이라는 자리 자체가 계약이다** — `현재행보장`.
 */

/** 현재 테마 행의 id. 서버가 매기는 PK 와 **겹칠 수 없는** 값이어야 한다. */
export const 현재행id = 'theme'

/** 저장되는 값 = **완제품의 칸들.** 현재 테마 행은 이 칸을 하나도 안 쓴다(값이 스토어에 있다). */
/**
 * **축 열둘 — 이름과 타입의 원본이 여기다.**
 *
 * `~utils/theme/축` 의 `ThemeState` 가 이 표를 그대로 쓴다(`export type ThemeState = i테마축s`).
 * 표의 칸이 곧 테마의 축이고 축이 곧 표의 칸이라, 두 벌로 적을 이유가 없다 — 그리고 **기준은
 * 모델이다.** 축 하나를 늘리는 일은 여기 한 줄 + `AXES` 한 줄이다.
 *
 * 저쪽이 값이 아니라 **타입만** 가져가므로(`import type`) 런타임 간선이 아니다. 값을 가져가면
 * 스토어 ↔ 모델 순환이 된다 — 이 파일이 스토어를 부르기 때문이다.
 */
export interface i테마축s {
  font: i글꼴
  weight: i굵기
  fontScale: i글자크기
  lineHeight: i줄간격
  primary: i강조색
  secondary: i보조색
  bg: i색온도
  radius: i라운드
  elevation: i그림자
  variant: i재질
  contrast: i진하기
  borderContrast: i진하기
}

/**
 * 저장되는 값. 축 칸이 **전부 옵셔널**인데, 빈 칸의 뜻이 축에 따라 다르다.
 *
 * - 생김새 축: 이유는 **이미 부어진 행**이다 — 옛 행엔 늦게 는 칸이 없고, 게터가 `?? DEFAULT_THEME`
 *   로 빈 칸을 그 축의 기본값으로 세운다(보조색만 강조색을 따라간다). 그래서 마이그레이션 없이
 *   새 행과 옛 행이 섞여 산다.
 * - 시력 축(`시력축s`): 빈 칸이 **뜻을 가진다** — 「이 카드는 말이 없다」(2026-09-13). 씌워도 그 축은
 *   손대지 않고 판정도 안 본다(`PresetTheme`). 게터도 기본값으로 메우지 않고 `''` 로 내보낸다.
 */
export interface i테마dto extends BaseXXDto, Partial<i테마축s> {
  label: string
  desc: string
  /** 이 카드 자신의 화면 모드. 카드를 누르면 축과 **같이** 간다(`테마씌우기`). */
  mode: i화면
}

export interface i테마 extends BaseXX {
  label: string
  설명: string
  강조색: i강조색
  보조색: i보조색
  색온도: i색온도
  글꼴: i글꼴
  굵기: i굵기
  진하기: i진하기
  선진하기: i진하기
  라운드: i라운드
  그림자: i그림자
  재질: i재질
  화면: i화면
  /**
   * 시력 축 둘은 `''` 를 받는다 — 완제품 행의 「안 정함」이다(칸이 비어 있다, `시력축s`). 현재 테마
   * 행은 늘 값이다(스토어가 든다).
   */
  글자크기: i글자크기 | ''
  /** 클래스엔 게터가 있는데 여기 선언이 빠져 있었다 — 그래서 `테마칸s` 가 이 줄을 못 냈다. */
  줄간격: i줄간격 | ''
  완제품: i완제품id
}

const 화면options = [
  { label: '밝게', value: 'light' },
  { label: '어둡게', value: 'dark' }
] as const satisfies readonly 축옵션<i화면>[]

/**
 * 축 옵션을 폼 옵션으로 옮긴다. **모양은 같은데 타입이 안 맞는다** — `i선택항목` 은
 * `[key: string]: unknown` 을 들고 있고 `축옵션` 은 인터페이스라 암묵적 인덱스 시그니처가
 * 안 붙는다(TS 는 그걸 익명 객체 타입에만 준다). 새 객체로 떠내면 통과하고, 폼이 보는 건
 * label·value·icon 뿐이라 잃는 것도 없다.
 */
function 폼옵션s(os: readonly { label: string, value: string | number, icon?: string }[]) {
  return os.map(o => ({ label: o.label, value: o.value, icon: o.icon }))
}

/**
 * 완제품 폼의 시력 축 선택지 — 눈금 앞에 「안 정함」 한 칸. 값 `''` 는 눈금이 아니라 **칸을
 * 비우는** 것이다(세터의 `빈칸인가`). 현재 테마 행의 폼(`테마칸s`)에는 이 칸이 없다 — 스토어는
 * 늘 값을 든다.
 */
const 안정함 = { label: '안 정함', value: '' } as const

function 시력옵션s(os: readonly 축옵션<number>[]): readonly { label: string, value: string | number }[] {
  return [안정함, ...os]
}

/** 선택기가 「안 정함」으로 주는 `''`, 비울 때 주는 `null`(`Input/선택기`) — 둘 다 「칸을 지워라」다. */
function 빈칸인가(v: unknown): v is '' | null | undefined {
  return v === '' || v == null
}

/**
 * 되돌리기 범위 — 축 하나, 묶음 하나(`생김새`·`읽기`), 전체, 화면 모드.
 *
 * 묶음이 단위로 들어온 이유: 무작위가 묶음마다 하나씩이라 되돌리기도 그 범위여야 한다
 * (`축.ts` 의 `AXIS_GROUPS` 머리말). `full` 로 뭉치면 생김새를 굴린 뒤 읽기를 굴리고
 * 되돌렸을 때 생김새까지 같이 돌아간다.
 */
export type i되돌리기범위 = ThemeAxisName | 'full' | 'dark' | 축묶음

const 되돌리기범위s: i되돌리기범위[] = [...THEME_AXIS_NAMES, 'full', 'dark', ...축묶음s]

const 되돌리기깊이 = 48

export interface i되돌리기 {
  범위: i되돌리기범위
  갈무리: ThemeSnapshot
}

/**
 * 현재 테마 행 — 테마를 만지는 입구. **표를 안 읽었어도 선다.**
 *
 * 없으면 지어서라도 주는 이유는 부르는 자리 때문이다 — 테마 pane 의 손잡이들은 격자와 **같이**
 * 그려지는데, 표를 읽는 것은 그 격자가 `onMounted` 에서 시작하는 일이다(`프리셋격자.vue`).
 * `list[0]` 만 보면 첫 그림에서 손잡이가 통째로 죽는다.
 *
 * 값을 안 드는 껍데기라 **`setup` 에서 한 번 잡아 두고 써도 된다** — 지어 둔 행으로 축을 밀어도
 * 목록의 행으로 민 것과 결과가 같다(둘 다 스토어에 쓴다).
 */
export function 현재테마행(): model테마 {
  const 첫행 = toValue(model테마s.getInstance().list)[0]
  return 첫행?.is현재 ? 첫행 : new model테마({ id: 현재행id } as i테마dto)
}

/**
 * 챗봇의 `행동값` 이 그대로 들어오는 자리라 아무 말이나 올 수 있다. 못 알아들으면 `undefined`
 * = **전부** — 아무 일도 안 하는 것보다 낫다. 시킨 것은 어쨌든 「무작위」였고 되돌리기가 옆에 있다.
 */
function 묶음풀기(v?: string): 축묶음 | undefined {
  const s = String(v ?? '').trim()
  return (축묶음s as readonly string[]).includes(s) ? (s as 축묶음) : undefined
}

export function 완제품카드s(): ThemePreset[] {
  return toValue(model테마s.getInstance().list).filter(m => !m.is현재).map(m => m.카드)
}

function 완제품options(): readonly 축옵션<i완제품id>[] {
  return 완제품카드s().map(p => ({
    label: `${p.label}(${p.mode === 'dark' ? '어둡게' : '밝게'})`,
    value: p.id
  }))
}

/** **현재 테마 행 전용** 칸 목록. 완제품 행은 자기 폼을 따로 쓴다(`자동필드ss`). */
export const 테마칸s: {
  key: keyof i테마
  label: string
  options: (isDark: boolean) => readonly 축옵션<never>[]
}[] = [
  { key: '강조색', label: '강조색', options: d => AXES.primary.options(d) },
  { key: '보조색', label: '보조색', options: d => AXES.secondary.options(d) },
  { key: '색온도', label: '색온도', options: () => AXES.bg.options() },
  { key: '글꼴', label: '글꼴', options: () => AXES.font.options() },
  { key: '진하기', label: '진하기', options: () => AXES.contrast.options() },
  { key: '선진하기', label: '선 진하기', options: () => AXES.borderContrast.options() },
  { key: '라운드', label: '라운드', options: () => AXES.radius.options() },
  { key: '그림자', label: '그림자', options: () => AXES.elevation.options() },
  { key: '재질', label: '재질', options: () => AXES.variant.options() },
  { key: '화면', label: '화면', options: () => 화면options },
  { key: '글자크기', label: '글자 크기', options: () => AXES.fontScale.options() },
  { key: '줄간격', label: '줄간격', options: () => AXES.lineHeight.options() },
  { key: '완제품', label: '완제품', options: () => 완제품options() }
] as { key: keyof i테마, label: string, options: (isDark: boolean) => readonly 축옵션<never>[] }[]

export class model테마s extends BaseModels2<model테마, i테마dto> {
  protected etcFields = []
  static getInstance = () => getRepoInstance('model테마s', () => new model테마s())

  /** 완제품 카드들. 첫 행(현재 테마)은 시드가 아니다 — `reads` 가 지어낸다. */
  protected override seed = i테마seed

  private constructor() {
    super(model테마, 'theme')
    this.apiURL = `/api/v0/${this.tableName}`
  }

  메뉴 = reactive({ label: '테마', 아이콘: 'i-lucide-palette', is계층: false, is시스템: true })

  /**
   * 되돌리기 스택. **행이 아니라 표가 든다** — 현재 테마 행은 부를 때마다 새로 설 수 있고
   * (`현재테마행`) 스택은 탭 하나에 하나여야 한다. repo 싱글턴이 클라=탭·서버=요청 스코프라
   * (`BaseModels2.instance.ts`) 그 수명이 정확히 맞는다.
   */
  private _되돌리기s = ref<i되돌리기[]>([])

  /** 손잡이를 회색으로 만드는 조건(`m/테마/무작위.vue`) */
  되돌릴수있나 = computed(() => {
    const m = {} as Record<i되돌리기범위, boolean>
    for (const k of 되돌리기범위s) m[k] = false
    for (const e of toValue(this._되돌리기s)) m[e.범위] = true
    return m
  })

  /** 범위를 모르고 누르는 자리(목록 버튼·챗봇)가 본다 */
  get 되돌릴게있나() { return toValue(this._되돌리기s).length > 0 }

  /** **바꾸기 직전에** 부른다 — 담기는 것은 바뀌기 전의 상태다. */
  되돌리기담기(범위: i되돌리기범위, 갈무리: ThemeSnapshot) {
    this._되돌리기s.value = [...toValue(this._되돌리기s), { 범위, 갈무리 }].slice(-되돌리기깊이)
  }

  /**
   * 무인자 갈래가 있는 이유: 부르는 쪽이 무엇을 되돌릴지 **모르는** 자리가 있다(목록 버튼·챗봇).
   * 거기서 범위를 못 박으면 그 범위가 아닌 마지막 조작은 영영 안 돌아온다.
   */
  되돌리기꺼내기(범위?: i되돌리기범위): i되돌리기 | null {
    const 스택 = [...toValue(this._되돌리기s)]
    let i = -1
    if (범위 === undefined) i = 스택.length - 1
    else for (let n = 스택.length - 1; n >= 0; n--) { if (스택[n]!.범위 === 범위) { i = n; break } }
    if (i < 0) return null
    const [뽑은것] = 스택.splice(i, 1)
    this._되돌리기s.value = 스택
    return 뽑은것 ?? null
  }

  /** 표가 새로 왔을 때, **이제 이름이 생긴 조합은 연습장에서 치운다.** */
  private 연습장정리() {
    const theme = useThemeStore()
    const d = theme.직접맞춤
    if (d && matchPresetId(d.theme, d.mode, 완제품카드s())) theme.직접맞춤 = null
  }

  /** 행이 표에서 몇 번째인가 — `model테마.compareTo` 가 본다. 못 찾으면 맨 끝. */
  행자리(id: unknown): number {
    const i = (toValue(this._list) ?? []).findIndex(r => String(r?.id) === String(id))
    return i < 0 ? Number.MAX_SAFE_INTEGER : i
  }

  override 검색필드s = ['label', 'sub']

  override _generate = () => new model테마().generate()
  override _init = () => new model테마().init()

  /**
   * 현재 테마 행을 **맨 앞에** 놓는다. 자리가 계약이라서다 — `aiV2` 가 소스의 칸과 「지금 값」을
   * `repo.list[0]` 에서 빌려 읽는다(머리말). 뒤로 밀리는 순간 도우미가 완제품 한 장을
   * 현재 테마로 착각한다.
   */
  private 현재행보장() {
    const 나머지 = (toValue(this._list) ?? []).filter(r => String(r?.id) !== 현재행id)
    this._list.value = [{ id: 현재행id } as i테마dto, ...나머지]
  }

  /**
   * 정리를 클라이언트에서만 하는 이유는 받는 쪽이 전부 클라 전용이라서다: 갈무리는
   * `import.meta.client` 안에 있고, 격자는 통째로 `ClientOnly` 안이다(`l/테마.vue`).
   */
  override async reads(isBrief = false, force = false): Promise<boolean> {
    let ok = false
    try {
      ok = await super.reads(isBrief, force)
    } catch {
      // 표를 못 읽어도 테마는 선다 — 아래 `시드대역` 이 카드를 채운다. 사람에게 알릴 일이 아니다.
    }
    this.시드대역()
    this.현재행보장()
    if (import.meta.client) this.연습장정리()
    return ok
  }

  /**
   * 표에 완제품이 **한 장도 없으면 시드를 메모리에만 채운다**(서버에는 안 쓴다).
   *
   * 서버리스 배포(포트폴리오)는 `localDB` 가 번들에 없어 이 표가 늘 빈 채로 온다 — 그러면 테마
   * pane 의 격자가 통째로 비어, 소개 화면이 「써 볼 것」으로 내건 기능이 빈 칸으로 열렸다.
   * id 는 lowDB 가 매기는 값(`1001…`)과 같게 줘서, 나중에 진짜로 부었을 때도 카드 id 가 안 바뀐다.
   *
   * 대역인 동안은 「초기값설정」 문을 그대로 열어 둔다(`is초기데이터`) — 채운 것이 표의 행이 아니라서다.
   */
  private is시드대역 = false
  private 시드대역() {
    const 완제품s = (toValue(this._list) ?? []).filter(r => String(r?.id) !== 현재행id)
    this.is시드대역 = 완제품s.length === 0
    if (!this.is시드대역) return
    this._list.value = i테마seed.map((row, i) => ({ ...row, id: String(1001 + i) }) as i테마dto)
  }

  /**
   * 「초기값설정」 버튼이 뜨는 문(`목록5`). 베이스는 `list.length == 0` 을 보는데 **이 목록은
   * 절대 안 빈다**(현재 테마 행이 늘 앞에 있다) — 그대로 두면 버튼이 영영 안 뜬다.
   *
   * 세는 대상을 완제품 행으로 좁힌다. 아래 `do초기데이터` 가 붓는 것과 **같은 대상**이라야
   * 「버튼은 떴는데 눌러도 안 된다」가 안 생긴다. 시드 대역(`시드대역`)은 행으로 치지 않는다.
   */
  override get is초기데이터() {
    if (!toValue(this.is읽기완료)) return false
    return this.is시드대역 || toValue(this.list).filter(m => !m.is현재).length === 0
  }

  /**
   * 베이스는 「목록이 비어 있을 때만」 붓는다(안 빈다 — 바로 위 `is초기데이터`). 현재 테마 행을
   * 잠깐 걷어내고 넘기면 베이스가 세는 대상이 완제품뿐이 되어 판정이 정확해진다.
   */
  override async do초기데이터(opts?: { skipConfirm?: boolean, ensureRead?: boolean }) {
    if (opts?.ensureRead !== false) await this.reads()
    // 대역은 표의 행이 아니다 — 남겨 두면 베이스가 「이미 있다」로 읽고 안 붓는다
    this._list.value = this.is시드대역 ? [] : (toValue(this._list) ?? []).filter(r => String(r?.id) !== 현재행id)
    try {
      return await super.do초기데이터({ ...opts, ensureRead: false })
    } finally {
      this.현재행보장()
    }
  }
}

export class model테마 extends BaseModel2<i테마dto> implements i테마 {
  constructor(state?: i테마dto) {
    super(model테마s.getInstance(), state)
  }

  /** 이 행이 지어낸 현재 테마 행인가. 두 모양을 가르는 **유일한** 판정이다. */
  get is현재() { return String(this.stateId ?? '') === 현재행id }

  override afterCreate = () => { }

  /**
   * 목록은 **표의 행 순서**로 선다 — 격자 순서의 주인이 표라서다(`model테마.seed.ts`·`프리셋격자.vue`).
   * 베이스 기본값은 PK 내림차순이라, 그대로 두면 행을 아무리 옮겨도 화면은 1009→1001 로 뒤집혀
   * 나왔다(2026-09-15).
   *
   * 현재 테마 행은 **맨 앞**이다(`현재행보장` — 자리가 계약). PK 가 `'theme'` 라 베이스 비교로는
   * `NaN` 이 나와 자리가 정해지지 않는다. 초안은 **맨 끝** — 저장하면 lowDB 가 배열 끝에 붙이므로
   * 저장 전후로 자리가 안 튄다.
   */
  override compareTo(b: this) {
    if (this.is현재 !== b.is현재) return this.is현재 ? -1 : 1
    if (this.is신규 !== b.is신규) return this.is신규 ? 1 : -1
    if (this.is신규) return this.rowKey < b.rowKey ? -1 : 1
    return this.표.행자리(this.stateId) - this.표.행자리(b.stateId)
  }

  /**
   * 현재 테마 행은 **저장하지 않는다** — 값의 주인이 스토어라 서버에 올릴 행이 없고, 세터가 이미
   * 스토어에 적었으므로 여기서 할 일도 없다. `false` 를 주면 베이스가 PUT 을 안 보낸다.
   * (그 행은 `state` 를 안 건드리므로 애초에 더티가 되지 않아 `do모두저장` 에도 안 실린다.)
   */
  override beforeSave = () => {
    if (this.is현재) return false
    if (!this.label.trim()) {
      useAlert().error('저장할 수 없습니다', '이름을 입력해주세요.')
      return false
    }
    return true
  }

  override afterSave = () => { }

  override generate() {
    return this.init()
  }

  /** 「추가」가 만드는 것은 **완제품**이다. 현재 테마 행은 추가로 생기지 않는다. */
  override init(): Omit<i테마dto, 'id'> {
    return { ...i테마새행 }
  }

  /**
   * 완제품 폼의 강조색 팔레트는 **그 카드 자신의 모드**가 정한다 — 지금 화면 모드가 아니다.
   * 어두운 카드를 밝은 화면에서 고치는 일이 정상이고, 그때 밝은 팔레트를 보여주면 저장한 색이
   * 카드 미리보기와 어긋난다(미리보기도 자기 모드로 그린다 — `프리셋격자.vue`).
   */
  override get 자동필드ss() {
    if (this.is현재) {
      const 어두움 = useColorMode().value === 'dark'
      return [{
        label: '테마',
        list: 테마칸s.map(칸 => ({
          key: 칸.key,
          label: 칸.label,
          type: 타입지정.선택0,
          show: true,
          options: 폼옵션s(칸.options(어두움) as readonly { label: string, value: string | number }[])
        }))
      }]
    }
    const 어두움 = this.화면 === 'dark'
    return [{
      label: '완제품',
      list: [
        { key: 'label', label: '이름', show: true },
        { key: '설명', label: '설명', show: true },
        { key: '화면', label: '화면', type: 타입지정.선택0, options: 폼옵션s(화면options), show: true },
        { key: '글꼴', label: '글꼴', type: 타입지정.선택0, options: 폼옵션s(AXES.font.options()), show: true },
        { key: '굵기', label: '굵기', type: 타입지정.선택0, options: 폼옵션s(AXES.weight.options()), show: true },
        { key: '강조색', label: '강조색', type: 타입지정.선택0, options: 폼옵션s(AXES.primary.options(어두움)), show: true },
        { key: '색온도', label: '색온도', type: 타입지정.선택0, options: 폼옵션s(AXES.bg.options()), show: true },
        { key: '보조색', label: '보조색', type: 타입지정.선택0, options: 폼옵션s(AXES.secondary.options(어두움)), show: true },
        { key: '라운드', label: '라운드', type: 타입지정.선택0, options: 폼옵션s(AXES.radius.options()), show: true },
        { key: '그림자', label: '그림자', type: 타입지정.선택0, options: 폼옵션s(AXES.elevation.options()), show: true },
        { key: '재질', label: '재질', type: 타입지정.선택0, options: 폼옵션s(AXES.variant.options()), show: true },
        { key: '진하기', label: '진하기', type: 타입지정.선택0, options: 폼옵션s(AXES.contrast.options()), show: true },
        { key: '선진하기', label: '선 진하기', type: 타입지정.선택0, options: 폼옵션s(AXES.borderContrast.options()), show: true },
        { key: '글자크기', label: '글자 크기', type: 타입지정.선택0, options: 폼옵션s(시력옵션s(AXES.fontScale.options())), show: true },
        { key: '줄간격', label: '줄간격', type: 타입지정.선택0, options: 폼옵션s(시력옵션s(AXES.lineHeight.options())), show: true }
      ]
    }]
  }

  /**
   * 버튼은 **필드**라 행마다 갈리려면 생성 시점에 정해져야 한다(베이스가 `자동버튼s` 를 필드로
   * 든다 — 게터로 덮으면 베이스가 심은 자기 속성에 가려진다). 행의 모양은 안 변하므로 문제없다.
   */
  override 자동버튼s = this.기본버튼s.concat(
    this.is현재
      ? [
          { key: 'do수정', label: '값수정', icon: 'i-lucide-pencil', position: 'top', show: true },
          { key: 'do무작위', label: '무작위', icon: 'i-ph-dice-three-light', position: 'top', show: true },
          { key: 'do되돌리기', label: '되돌리기', icon: 'i-iwwa-reset', position: 'top', show: true }
        ]
      : [
          { key: 'do적용', label: '적용', icon: 'i-lucide-check', position: 'top', show: true },
          { key: 'do수정', label: '값수정', icon: 'i-lucide-pencil', position: 'top', show: true },
          { key: 'do삭제', label: '삭제', icon: 'i-lucide-trash-2', position: 'top', show: true }
        ]
  )

  do수정 = () => do필드폼(this)

  // ── 축 쓰기 ─────────────────────────────────────────────────
  /** 되돌리기 스택이 사는 곳 */
  private get 표() { return model테마s.getInstance() }

  /** preference 가 아니라 **그려지는** 값이다(`system` 포함). 팔레트 목록이 이걸로 갈린다. */
  private get 어두움() { return useColorMode().value === 'dark' }

  /**
   * 축 값 쓰기의 **유일한 길.** 그래서 직접 맞춤 갈무리도 여기 하나에 물린다 — 축을 바꾸는 길이
   * 여럿이라(앉히기·밀기·무작위·되돌리기·리스냅·완제품) 부르는 자리를 늘리면 반드시 하나를 빠뜨린다.
   *
   * **스토어에 쓰기 함수를 다시 만들지 말 것.** 값은 저쪽이 들지만 쓰는 문은 여기 하나다
   * (`useThemeStore` 머리말). Pinia 의 `$patch` 를 그대로 쓰는 것도 그래서다 — 스토어에 이름
   * 붙은 쓰기 구멍을 안 내려고.
   *
   * `갈무리: false` 는 완제품을 씌울 때뿐이다(`테마씌우기`). **카드를 누르는 건 손대는 게 아니다.**
   * 판정만으로도 대개 막히지만(씌운 직후 상태는 그 완제품과 정확히 같아 갈무리가 그냥 돌아간다),
   * 화면 모드가 축보다 늦게 바뀌는 한 틱 동안은 「축은 심해인데 모드는 아직 밝게」라 아무 완제품과도
   * 안 맞는다 — 그 틈에 연습장이 통째로 덮어써진다. 깃발 대신 인자인 이유는 시점이 아니라
   * **누가 부르는가**가 기준이라서다.
   */
  private 축쓰기(p: Partial<ThemeState>, opts?: { 갈무리?: boolean }) {
    const 쓸것 = Object.fromEntries(Object.entries(p).filter(([, v]) => v !== undefined))
    useThemeStore().$patch(쓸것 as Partial<ThemeState>)
    if (opts?.갈무리 !== false) this.직접맞춤갈무리()
  }

  /**
   * 지금 상태가 **어느 완제품과도 안 맞을 때만** 연습장에 담는다.
   *
   * 「완제품과 같으면 직접 맞춤이 아니다」가 이 한 줄의 전부다. 그래서 격자는 아홉 번째 카드를
   * 그릴지 말지 다시 안 따진다 — 값이 있으면 그린다.
   */
  private 직접맞춤갈무리() {
    if (!import.meta.client) return
    const theme = useThemeStore()
    const mode: PresetMode = this.어두움 ? 'dark' : 'light'
    const 축s = theme.themeState()
    if (matchPresetId(축s, mode, 완제품카드s())) return
    theme.직접맞춤 = { theme: 축s, mode }
  }

  /** **바꾸기 직전에** 부른다 */
  private 되돌리기담기(범위: i되돌리기범위) {
    if (!import.meta.client) return
    const theme = useThemeStore()
    this.표.되돌리기담기(범위, captureSnapshot(
      theme.themeState(),
      this.어두움,
      useColorMode().preference as ColorModePreference
    ))
  }

  // ── 축 조작 ─────────────────────────────────────────────────
  축위치(축: ThemeAxisName) { return axisIndex(축, useThemeStore().themeState(), this.어두움) }

  축길이(축: ThemeAxisName) { return axisLength(축, this.어두움) }

  /** 눈금 하나를 짚어 앉힌다. **되돌리기에 안 쌓는다** — 직접 고른 값은 다시 고르면 된다. */
  축앉히기(축: ThemeAxisName, 눈금: number) {
    this.축쓰기(axisPatch(축, 눈금, this.어두움) ?? {})
  }

  /** 한 칸 민다 — 축앉히기와 달리 **되돌리기에 쌓는다**(어디서 왔는지 되짚을 수 있어야 한다) */
  축밀기(축: ThemeAxisName, 걸음: number) {
    if (!import.meta.client) return
    this.되돌리기담기(축)
    this.축앉히기(축, axisStepIndex(축, useThemeStore().themeState(), this.어두움, 걸음))
  }

  /** 굴린 축이 몇이든 되돌리기는 **한 줄**이라 통째로 돌아온다 */
  private 축굴리기(축s: readonly ThemeAxisName[], 범위: i되돌리기범위) {
    if (!import.meta.client) return
    this.되돌리기담기(범위)
    const 어두움 = this.어두움
    for (const n of 축s) {
      if ((시력축s as readonly ThemeAxisName[]).includes(n)) continue
      this.축쓰기(axisPatch(n, axisRandomIndex(n, 어두움), 어두움) ?? {})
    }
  }

  /**
   * 무작위 — **단위는 묶음이다**(`AXIS_GROUPS`, 근거는 `m/테마/무작위.vue` 머리말).
   *
   * **「전부」를 `'full'` 한 줄로 합치지 말 것.** 되돌리기는 범위 이름이 **정확히 같은** 항목만
   * 찾으므로, 한 줄로 쌓으면 화면의 묶음 되돌리기 둘이 그걸 못 본다 — 굴린 사람이 테마 화면
   * 앞에서 회색 버튼만 보게 된다.
   *
   * 인자는 화면에서는 손잡이가 든 묶음, 챗봇에서는 `행동값` 이다(`i행동버튼.onClick(값?)` —
   * 행동 ABI 의 한 칸). 「생김새만 굴려줘」가 그 한 칸으로 온다.
   */
  do무작위 = (묶음?: string) => {
    const g = 묶음풀기(묶음)
    for (const 하나 of (g ? [g] : 축묶음s))
      this.축굴리기(묶음축s(하나), 하나)
  }

  /** **복원 범위는 꺼낸 항목이 정한다** — 무인자로 뽑은 것은 인자에 자기 범위가 안 적혀 있다. */
  do되돌리기 = (묶음?: string) => {
    if (!import.meta.client) return
    const 꺼낸것 = this.표.되돌리기꺼내기(묶음풀기(묶음))
    if (!꺼낸것) return

    const 범위 = 꺼낸것.범위
    if (범위 === 'full' || 범위 === 'dark')
      useColorMode().preference = 꺼낸것.갈무리.colorModePreference
    if (범위 === 'dark') return

    const 만 = 범위 === 'full'
      ? undefined
      : (범위 in AXIS_GROUPS ? 묶음축s(범위 as 축묶음) : [범위 as ThemeAxisName])
    this.축쓰기(snapshotPatch(꺼낸것.갈무리, this.어두움, 만))
  }

  /**
   * 화면 손잡이만 쓴다 — `i자동버튼Spec` 에 `disabled` 자리가 없어서 목록 버튼은 못 쓴다
   * (`view/1.ts`).
   */
  can되돌리기 = (묶음?: string) => {
    const g = 묶음풀기(묶음)
    return g ? toValue(this.표.되돌릴수있나)[g] : this.표.되돌릴게있나
  }

  /**
   * 완제품 한 장을 씌운다 — **카드가 든 축 전부** + **화면 모드**를 한 번에 덮어쓴다.
   *
   * 시력 축은 카드가 말할 때만 간다(`PresetTheme`). 비운 칸은 `축쓰기` 가 `undefined` 로 거르므로
   * 보는 사람의 글자 크기가 그대로 남는다 — 여기서 따로 할 일은 없고, `카드` 가 그 칸을 메우지
   * 않는 것이 전부다(`완제품채우기`).
   *
   * 모드까지 가는 이유: 완제품은 각자 자기 모드를 들고 있는 독립된 한 장이고, 격자가 카드를
   * 다 편다(`완제품s.ts`·`프리셋격자.vue`). 어두운 카드를 누르는 것이 곧 어둡게를 고르는 것이라,
   * 여기서 안 바꾸면 고른 그림과 실제 화면이 어긋난다.
   *
   * 되돌리기 한 줄(`'full'`)이 화면 모드 preference 까지 같이 담으므로 되돌리기는 한 번이면 된다.
   *
   * **씌우는 대상은 언제나 현재 테마다.** 완제품 행의 `do적용` 도 자기한테 바르는 게 아니라
   * 현재 테마 행을 찾아 여기로 온다.
   */
  테마씌우기(카드: { theme: PresetTheme, mode: PresetMode }) {
    this.되돌리기담기('full')
    this.축쓰기(카드.theme, { 갈무리: false })
    useColorMode().preference = 카드.mode
  }

  /**
   * 밝게/어둡게가 바뀌면 팔레트 목록 자체가 달라지므로 현재 색을 새 팔레트에서 가장 가까운
   * 색으로 다시 스냅한다. 보조색도 같은 팔레트를 쓰므로 함께 옮긴다 — 한쪽만 남으면 다크에서
   * 대비가 무너진다. 부르는 곳은 화면 모드를 감시하는 플러그인 하나다(`01.theme-sync.client.ts`).
   *
   * **여기서 완제품을 따라가지 않는다** — 완제품이 짝을 안 이루므로(`완제품s.ts` 머리말)
   * 건너뛸 곳이 없다. 모드를 뒤집으면 카드 표시가 풀리고 「직접 맞춤」이 되는 게 맞다.
   */
  축리스냅() {
    if (!import.meta.client) return
    const theme = useThemeStore()
    const 어두움 = this.어두움
    this.축쓰기(axisPatch('primary', AXES.primary.indexOf(theme.primary, 어두움), 어두움) ?? {})
    this.축쓰기(axisPatch('secondary', AXES.secondary.indexOf(theme.secondary, 어두움), 어두움) ?? {})
  }

  /** 연습장 한 장. 값은 스토어가 들지만 **담고 치우는 판단은 이 행**이 한다(`직접맞춤갈무리`). */
  get 직접맞춤() { return useThemeStore().직접맞춤 }

  축상태(): ThemeState { return useThemeStore().themeState() }

  /** 고치는 중인 카드를 화면에 씌워 본다. 격자에서 카드를 누르는 것과 같은 길이다. */
  do적용 = () => 현재테마행().테마씌우기({ theme: this.카드.theme, mode: this.화면 })

  /** 확인 창은 `delete()` 안에 있다 — 여기서 또 물으면 같은 질문이 두 번 뜬다. */
  do삭제 = () => this.delete()

  override get label() { return this.is현재 ? '테마' : (this.state?.label ?? '') }
  override set label(v: string) { if (this.is현재 || !this.state) return; this.state.label = String(v ?? '') }

  override get sub() {
    if (!this.is현재) return this.설명
    const id = this.완제품
    return id ? (완제품options().find(o => o.value === id)?.label ?? '') : '직접 맞춤'
  }

  get 설명() { return this.state?.desc ?? '' }
  set 설명(v: string) { if (!this.state) return; this.state.desc = String(v ?? '') }

  // ── 두 모양이 같이 쓰는 칸, 앞의 일곱 ─────────────────────────
  // 현재 테마 행은 스토어를, 완제품 행은 자기 `state` 를 읽고 쓴다.

  get 글꼴(): i글꼴 { return this.is현재 ? useThemeStore().font : (this.state?.font ?? DEFAULT_THEME.font) }
  set 글꼴(v: i글꼴) {
    if (this.is현재) this.축설정('font', v)
    else if (this.state) this.state.font = v
  }

  get 굵기(): i굵기 { return this.is현재 ? useThemeStore().weight : (this.state?.weight ?? DEFAULT_THEME.weight) }
  set 굵기(v: i굵기) {
    if (this.is현재) this.축설정('weight', v)
    else if (this.state) this.state.weight = v
  }

  get 강조색(): i강조색 { return this.is현재 ? useThemeStore().primary : (this.state?.primary ?? DEFAULT_THEME.primary) }
  set 강조색(v: i강조색) {
    if (this.is현재) this.축설정('primary', v)
    else if (this.state) this.state.primary = v
  }

  get 색온도(): i색온도 { return this.is현재 ? useThemeStore().bg : (this.state?.bg ?? DEFAULT_THEME.bg) }
  set 색온도(v: i색온도) {
    if (this.is현재) this.축설정('bg', v)
    else if (this.state) this.state.bg = v
  }

  get 라운드(): i라운드 { return this.is현재 ? useThemeStore().radius : (this.state?.radius ?? DEFAULT_THEME.radius) }
  set 라운드(v: i라운드) {
    if (this.is현재) this.축설정('radius', Number(v))
    else if (this.state) this.state.radius = v
  }

  get 그림자(): i그림자 { return this.is현재 ? useThemeStore().elevation : (this.state?.elevation ?? DEFAULT_THEME.elevation) }
  set 그림자(v: i그림자) {
    if (this.is현재) this.축설정('elevation', v)
    else if (this.state) this.state.elevation = v
  }

  /**
   * 현재 테마 행의 화면 모드는 **축이 아니라 `useColorMode`** 다 — 완제품 행은 자기 칸이다.
   * 완제품이 자기 모드를 드는 이유는 카드를 누르면 축과 같이 가야 해서다(`테마씌우기`).
   */
  get 화면(): i화면 {
    if (!this.is현재) return this.state?.mode === 'dark' ? 'dark' : 'light'
    return useColorMode().value === 'dark' ? 'dark' : 'light'
  }

  set 화면(v: i화면) {
    const mode = String(v) === 'dark' ? 'dark' : 'light'
    if (!this.is현재) { if (this.state) this.state.mode = mode; return }
    this.화면선호 = mode
  }

  /**
   * 현재 테마의 화면 모드 **선호** — `화면` 과 달리 `system` 을 받는다. 완제품 카드는 자기 모드를
   * 밝게/어둡게 중 하나로 들어야 해서(`테마씌우기`) `i화면` 에 `system` 을 넣지 않고 입구를 따로 뒀다.
   */
  get 화면선호(): ColorModePreference {
    return useColorMode().preference as ColorModePreference
  }

  set 화면선호(v: ColorModePreference) {
    if (!this.is현재) return
    // **`this.화면`(그려지는 값)이 아니라 preference 로 견준다.** preference 가 `system` 인데
    // 그게 어둡게로 풀리는 동안 「어둡게」를 누르면, 그려지는 값 기준으로는 같아서 아무 일도 안
    // 일어나고 축 패널의 알약은 아무 칸도 안 짚은 채로 남는다(그 줄은 preference 를 그린다).
    if (v === useColorMode().preference) return
    this.되돌리기담기('dark')
    useColorMode().preference = v
  }

  // ── 두 모양이 같이 쓰는 칸, 나머지 여섯 ───────────────────────
  //
  // **2026-09-09 이전에는 이 여섯이 `is현재` 를 안 봤다** — 완제품 행에 물어도 스토어(현재 테마)를
  // 읽고 썼다. 완제품이 이 축들을 안 나르던 시절엔 티가 안 났지만, 그게 곧 **카드가 테마의 절반만
  // 든다**는 뜻이었다. 이제 위 일곱과 같은 모양이다 — `is현재` 면 스토어, 아니면 자기 `state`.

  get 보조색(): i보조색 {
    if (this.is현재) return useThemeStore().secondary
    // 옛 행엔 이 칸이 없다 — 그때는 강조색을 따라간다(`i테마dto` 의 새 칸 주석).
    return this.state?.secondary ?? this.state?.primary ?? DEFAULT_THEME.secondary
  }

  set 보조색(v: i보조색) {
    if (this.is현재) this.축설정('secondary', v)
    else if (this.state) this.state.secondary = v
  }

  get 진하기(): i진하기 { return this.is현재 ? useThemeStore().contrast : (this.state?.contrast ?? DEFAULT_THEME.contrast) }
  set 진하기(v: i진하기) {
    if (this.is현재) this.축설정('contrast', v)
    else if (this.state) this.state.contrast = v
  }

  get 선진하기(): i진하기 { return this.is현재 ? useThemeStore().borderContrast : (this.state?.borderContrast ?? DEFAULT_THEME.borderContrast) }
  set 선진하기(v: i진하기) {
    if (this.is현재) this.축설정('borderContrast', v)
    else if (this.state) this.state.borderContrast = v
  }

  get 재질(): i재질 { return this.is현재 ? useThemeStore().variant : (this.state?.variant ?? DEFAULT_THEME.variant) }
  set 재질(v: i재질) {
    if (this.is현재) this.축설정('variant', v)
    else if (this.state) this.state.variant = v
  }

  /**
   * 글자 크기·줄간격도 **축이다**(2026-09-09, `축.ts` 의 `AXES`). 전에는 축이 아니라서
   * `축설정` 을 안 타고 스토어에 바로 썼는데, 완제품이 이 둘을 나르는 순간 그게 둘을 깬다:
   * **되돌리기가 못 잡고**(`captureSnapshot` 은 축만 돈다) 값을 바꿔도 **연습장 갈무리가 안 돈다**
   * (`축쓰기` 를 안 타니까). 카드를 누른 뒤 되돌리면 글자 크기만 남아 있던 것이 그 자국이다.
   *
   * 축이 된 것과 무작위가 굴리는 것은 여전히 다른 일이다 — `AXIS_GROUPS` 에는 안 넣었다.
   *
   * **완제품 행에서는 빈 칸을 기본값으로 메우지 않는다**(2026-09-13, `시력축s`). 다른 축과 달리
   * 빈 칸이 뜻을 가져서다 — 「이 카드는 말이 없다」. 폼에는 `''` 로 나가 「안 정함」에 앉고, 그
   * 값이 돌아오면 **칸을 지운다**(`빈칸인가`). 자리표시자를 남기면 그게 카드의 말이 된다.
   */
  get 글자크기(): i글자크기 | '' { return this.is현재 ? useThemeStore().fontScale : (this.state?.fontScale ?? '') }
  set 글자크기(v: i글자크기 | '') {
    if (this.is현재) this.축설정('fontScale', v)
    else if (!this.state) return
    else if (빈칸인가(v)) delete this.state.fontScale
    else this.state.fontScale = v
  }

  get 줄간격(): i줄간격 | '' { return this.is현재 ? useThemeStore().lineHeight : (this.state?.lineHeight ?? '') }
  set 줄간격(v: i줄간격 | '') {
    if (this.is현재) this.축설정('lineHeight', v)
    else if (!this.state) return
    else if (빈칸인가(v)) delete this.state.lineHeight
    else this.state.lineHeight = v
  }

  /** 어느 완제품과도 안 맞으면 빈 문자열 — 그게 「직접 맞춤」이다. */
  get 완제품(): i완제품id {
    const theme = useThemeStore()
    return matchPresetId(theme.themeState(), this.화면, 완제품카드s()) ?? ''
  }

  set 완제품(v: i완제품id) {
    const card = 완제품카드s().find(p => p.id === String(v ?? ''))
    if (card) this.테마씌우기(card)
  }

  /**
   * 격자와 스토어가 보는 모양.
   *
   * **열두 줄을 손으로 옮겨 적던 자리였다** (2026-09-09 이전). 「행을 그대로 넘기면 판정과
   * 미리보기가 dto 칸 이름에 묶인다」가 그 이유였는데, dto 칸 이름과 축 이름이 같아지면서
   * 그 이유가 없어졌다 — 묶일 다른 이름이 없다.
   *
   * 빈 칸은 `완제품채우기` 가 그 축의 기본값으로 채운다(옛 행이 새 칸을 안 든 자리) — **시력 축만
   * 빼고.** 거기서 빈 칸은 카드의 말이라 그대로 나간다(`PresetTheme`).
   * 보조색만 손으로 얹는다 — 없을 때 기본값이 아니라 **그 행의 강조색**을 따라가야 해서다.
   */
  get 카드(): ThemePreset {
    return {
      id: String(this.stateId ?? ''),
      label: this.label,
      desc: this.설명,
      mode: this.화면,
      theme: this.is현재
        ? useThemeStore().themeState()
        : 완제품채우기({ ...this.state, secondary: this.보조색 })
    }
  }

  /**
   * 폼이 고른 **값**을 눈금으로 바꿔 민다 — 현재 테마 행 전용이다(`자동필드ss`).
   *
   * **값이 들어오는 문은 여기 하나다.** 눈금에 없는 값이면 `i < 0` 으로 그냥 튕긴다 — 그래서
   * 게터·세터가 말단에서 다시 정규화할 이유가 없다(2026-09-09 에 걷었다). 값은 테마피커의
   * `options` 에서만 나오고, 틀린 값이 보이면 고칠 자리는 그 손잡이지 이 아래가 아니다.
   */
  private 축설정(name: ThemeAxisName, v: unknown) {
    const i = 축인덱스(AXES[name].options(this.어두움) as readonly 축옵션<unknown>[], v)
    if (i < 0) return
    this.축밀기(name, i - this.축위치(name))
  }
}

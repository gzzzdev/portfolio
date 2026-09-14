import type { Role } from '~base-comps/m/_스킨'

import type { RenderItem } from '~/components/view/렌더/renderComps'

/**
 * 호출부가 적어도 되는 색 — **이건 색이 아니라 뜻이다.**
 *
 * `neutral`·`primary` 가 없는 것이 요점이다. `neutral` 은 `app.config` 의 `NEUTRAL_DEFAULTS` 가
 * 이미 기본값으로 깔아 둔 것이라 적으면 죽은 값이고, `primary` 는 `m/테마/재질.ts` 의
 * `역할="강조"` 가 붙이는 색이라 호출부가 손으로 적을 값이 아니다 — 배지에는 아예 안 붙는다
 * (*"켜짐은 일부러 뺐다 — 그건 행동 유도가 아니라 **상태**다"* — `재질.ts`).
 *
 * **타입으로 막는 이유** — 이 자리는 화면이 아니라 모델이다(`_CUSTOM/models/**` 의 `_badges`).
 * 새 모델을 만들 때 옆 모델을 복붙해서 시작하므로, 린트로 뒤에서 잡는 것보다 **자동완성에
 * 애초에 `neutral` 이 안 뜨게** 하는 쪽이 싸다. 2026-09-07 에 좁히면서 25곳을 걷었다.
 */
export type 신호색 = 'success' | 'warning' | 'error' | 'info'

export interface ListCardBadge {
  label: string
  /** 신호일 때만 적는다. 안 적으면 회색조 — 그게 기본값이다 */
  color?: 신호색
  icon?: string
}

export interface ListCardAction {
  label?: string
  icon?: string
  /**
   * 신호일 때만 적는다(대개 `error` — 삭제). **강조는 여기가 아니라 `역할` 이다** —
   * `_Actions.vue` 가 `?? 'neutral'` 폴백을 지고 있던 동안은 `역할="강조"` 를 줘도 색이 안 붙어서
   * 호출부가 `color: 'primary'` 를 같이 적어야 했다. 그 폴백을 걷었으니 이제 역할이 색을 진다.
   */
  color?: 신호색
  /** 축 바깥으로 고정할 때만 — `강조`·`조용`·`인라인` (`~base-comps/m/_스킨`) */
  역할?: Role
  /** 역할로 표현이 안 될 때만. 적으면 테마 축이 못 건드린다 */
  variant?: string
  size?: string
  loading?: boolean
  onClick?: () => void
}

export interface ListCardTabItem {
  label: string
  value: string
}

export interface ListCardItem {
  // onClick?: () => void// 이건 기본으로 되는듯.
  /**
   * **서버 PK.** 저장되는 참조(`childIds`·메뉴 폴더s)가 이 값이다.
   * 저장 전 행에는 없거나 임시값이라, 선택·렌더 키로 쓰면 저장되는 순간 값이 바뀐다 — 그건 `key`.
   */
  id?: string | number
  /**
   * **화면 식별자**(`BaseModel2.rowKey`). 행의 수명 내내 안 변하고 서버로 안 나간다.
   * 선택 상태·키보드 이동·`:key`는 이걸 봐야 한다 — `item-key="key"`로 지정.
   */
  key?: string
  icon?: string
  eyebrow?: string
  label?: string
  label_suffix?: string
  brief?: string
  description?: string
  thumbnail?: string
  /**
   * 세로카드 표지 칸 비율(`'3 / 4'`). 모델의 `표지비율` 을 그대로 옮긴다. 목록은 **첫 장 값**으로
   * 모든 카드의 칸을 맞춘다 — 섞인 목록(이력 유니온 등)에서 줄마다 칸이 달라지지 않게. 없으면 `16 / 10`.
   */
  표지비율?: string
  badges?: ListCardBadge[]
  actions?: ListCardAction[]
  badgeN?: number
  isSelected?: boolean
  isExpand?: boolean
  is수정됨?: boolean
  is저장중?: boolean
  /** Trailing mTabs — 있으면 자동필드ss 사용 */
  model?: any
  /** model 없을 때 Trailing 탭 items */
  tabItems?: ListCardTabItem[]
  /** 계층(mList2 is계층) — BaseModel.자식s / state.childIds */
  childIds?: Array<string | number>

  header?: RenderItem// View렌더 렌더할 데이터
  content?: RenderItem// RenderComp|RenderItem
}

/**
 * 수정 표시 — **"이 카드에 아직 저장 안 된 변경이 있다"**.
 *
 * **라벨 바로 앞에 붙는다** (`*2026 봄학기 개강 안내`). 에디터 탭의 `*파일명` 관용 그대로다.
 * 읽는 곳은 `_/portrait.vue`·`_/landscape.vue`·`_/row.vue` 셋이고, 값을 고른 자리는
 * `/decisions/theme/unsaved` 판이다.
 *
 * ## 왜 라벨에 붙나 (2026-09-07)
 *
 * 그전엔 카드 겉 **좌상단에 뗀 별표**였다(`absolute left-2 top-2 size-6`). 세 가지가 겹쳐 깨졌다:
 *
 * 1. **자리를 안 비웠다.** 아이콘이 8~32px 를 먹는데 카드 본문은 `p-3`(12px)부터 시작한다.
 *    `row` 만 `pl-7` 로 비켜 주고 `portrait`·`landscape` 는 안 비켜서, eyebrow 첫 글자 위에
 *    별표가 그대로 얹혔다 — 취소선처럼 읽혔다.
 * 2. **저장중과 크기가 두 벌이었다.** 스피너 `size-4` 대 별표 `size-6`. 저장을 누르면 표시가
 *    작아졌다 커졌다.
 * 3. **앵커가 없었다.** 별표는 원래 이름에 붙는 물건인데 떼어 놓으면 뜻이 아니라 얼룩이다.
 *
 * 겉을 칠하는 안(왼쪽 선·면 틴트)은 **선택 표시가 이미 겉을 다 가져갔기 때문에** 못 쓴다
 * (`m/테마/선택표시.ts` — 링·틴트·우상단 배지). 수정됨은 선택과 거의 항상 같이 켜지므로
 * 두 표시는 반드시 다른 채널이어야 한다. 라벨 앞은 선택이 안 쓰는 유일한 자리였다.
 *
 * 자리를 넓게 비우는 안(좌상단 유지 + 패딩)은 **글자를 너무 밀어서** 접었고, 오른쪽 아래는
 * `actions`·`badges`·확장 탭의 임자가 있어 접었다.
 *
 * ## 지켜야 하는 것 둘
 *
 * 1. **저장중은 같은 자리에서 글리프만 갈린다.** 옆에 스피너를 하나 더 붙이면 켤 때마다
 *    글줄이 밀린다 — 위 2번이 정확히 그 문제였다.
 * 2. **`sr-only` 는 `<h3>` 밖에 둔다.** `row` 의 라벨은 `truncate`(= overflow-hidden)라
 *    안에 넣으면 잘린다.
 */
export const 수정표시 = {
  /** 라벨 앞 글리프. `text-primary` 는 "상호작용"이 아니라 상태색으로 쓰는 예외가 아니다 — 저장이 곧 다음 동작이다 */
  cls: 'mr-0.5 text-primary',
  글리프: '*',
  /** 저장중이면 같은 자리에서 이 아이콘으로 갈린다. 글줄 안이라 `inline-block`+`align-middle` 이 필요하다 */
  진행아이콘: 'i-lucide-loader-circle',
  진행cls: 'inline-block size-3.5 animate-spin align-middle',
  /** 읽어 주는 말. 색+글리프 하나뿐이라 이게 없으면 뜻이 안 전해진다 */
  말: (is저장중?: boolean) => (is저장중 ? '저장하는 중' : '저장 안 된 변경 있음')
} as const
/**
 * 카드 글자. **줄 수는 여기 안 적는다** — 카드는 `line-clamp-2`, 줄(`row`)은 `truncate` 로 각자 자른다.
 * 둘을 한 클래스 목록에 겹쳐 적으면 어느 쪽이 이길지가 스타일시트 순서로 정해진다.
 * 예전 `mt-[-3px]`·`mt-[-2px]` 는 한 줄 전제의 보정이라 걷었다 — 두 줄로 접히면 윗줄을 깎는다.
 */
export const styleCls = {
  label: 'text-lg leading-snug text-highlighted break-keep',
  eyebrow: ' text-xs text-muted ',
  brief: 'text-sm text-muted',
  icon: 'size-7',
  label_suffix: 'shrink-0 text-sm text-muted'
} as const

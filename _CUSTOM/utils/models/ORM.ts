import type { ComputedRef } from 'vue'
import { is_mTime, is_mDayjs, is_Period } from '~utils'

export interface i필드 {
  is한줄?: boolean
  /**
     * 폼을 여러 열로 나눠 그리는 뷰(`view상세5`)에서 이 필드가 원하는 가로 자리.
     * 안 쓰면 컴포넌트 종류에서 유도한다(`view/1.ts`의 `기본폭`).
     * - `'반'`   : 반 칸. 좁은 화면에서는 어차피 한 칸이라 대부분 여기.
     * - `'전체'` : 열을 나눠도 한 줄을 통째로. 안이 넓어야 안 깨지는 것들(카드·매트릭스·여러줄 문자).
     * - `'옆'`   : 본문에서 빼내 옆 열에 세로로 세운다(증명사진처럼 세로로 길고 좁은 것).
     * 한 열짜리 뷰(`view상세4`)는 이 값을 보지 않는다.
     */
  폭?: '반' | '전체' | '옆'
  key?: string
  type?: i컴포넌트
  /**
     * 이 필드를 **폼 목록에 둘지, 판 위쪽으로 끌어올릴지.**
     *
     * - `'top'`     : 필드 목록에서 빼고 위로 올린다. 버튼필드면 상단 버튼바로(기존 `자동버튼s`와
     *                 같은 자리), 그 밖의 필드면 판 머리글의 컨트롤로 간다.
     *                 **전체 그룹에서 모은다** — 상단은 탭 밖의 자리라 탭을 바꿔도 안 사라진다.
     * - `'default'` : 선언한 그 자리에 그린다. **생략과 같은 뜻이다** — 판정은 어디서나
     *                 `=== 'top'` 이라 둘을 갈라 쓸 일이 없다. 글로 남기려고만 열어둔 값이다.
     * - `'bot'`     : 하단 버튼바용 레거시 값 (현재 뷰에서 비활성).
     *
     * 버튼이 먼저 이 축을 썼고 값 필드가 뒤따랐다. 뜻은 한 낱말이다 — *목록에서 빼고 위로*.
     *
     * ## 머리글로 올린 값 필드는 라벨을 안 단다
     *
     * 머리글은 라벨 열이 없는 자리다(`view상세5`). 라벨이 있어야 무슨 칸인지 읽히는 필드면
     * 애초에 폼에 두는 게 맞다 — 올릴 값은 제목·구분처럼 **값만 봐도 읽히는 칸**이다.
     * 수정 가능 여부(`is수정중`·`can.수정`·`canEdit`)는 폼과 똑같이 따라간다.
     */
  position?: 'top' | 'bot' | 'default'// | 'left' | 'right';

  is수정할때만?: boolean

  show?: boolean | ComputedRef<boolean>
  loading?: boolean | ComputedRef<boolean>
  /**
     * 선택 계열 필드의 항목. `선택계층`은 항목 안에 하위 항목(`items`)을 한 겹 더 갖는다.
     *
     * **`computed`도 받는다.** 다른 표에서 오는 선택지(역할의 「테이블 권한」, 메뉴의 「접근 역할」,
     * 게시글의 「게시판」 등)는 그 표를 읽어야 채워지므로 배열 리터럴로는 못 적는다. 소비하는 쪽은
     * 이미 `toValue`로 받고 있었는데(`view/1.ts`) 타입만 좁아, 그 패턴을 쓰는 모델 8개가
     * 전부 `자동필드ss` 타입 오류를 내고 있었다. 실제 모양에 타입을 맞춘다.
     */
  options?: readonly i선택항목[] | ComputedRef<readonly i선택항목[]>
  getOptions?: () => { label: string, value: string }[]
  label?: string
  value?: any
  icon?: string
  canEdit?: boolean
  props?: Record<string, any>
  /** 버튼필드 전용. 없으면 `model[key]` 메서드를 그대로 쓴다. */
  onClick?: (model?: any) => void
  setter?: (v: any) => void
  /**
   * **이 칸을 달력에 올린다.** `model달력s`가 각 표의 `자동필드ss`를 훑어 이 표시가 달린
   * 날짜 계열 칸(`날짜`·`날짜2`·`기간`·`기간시간`)만 달력 항목으로 만든다.
   *
   * 기본은 안 올림이다 — 가입일·신청일·심사일도 같은 타입이라 타입만 보고 올리면 달력이
   * 잡음으로 덮인다. 칸의 `show` 는 그대로 존중된다(할일이 아닌 메모의 마감일은 빠진다).
   *
   * - `label`·`color`·`icon` : 범례 한 줄. 없으면 칸 라벨·기본색·표 메뉴 아이콘.
   * - `행색`                 : 이 행만 다른 색으로 (중요 할일을 빨갛게). 없으면 `color`.
   */
  달력?: boolean | {
    label?: string
    color?: string
    icon?: string
    행색?: (row: unknown) => string | undefined
  }
}

interface i컴포넌트 { name: string, props?: Record<string, unknown> }

/** `i필드.options` 항목. value 는 숫자/불리언 옵션도 있어 넓게 받는다. */
export interface i선택항목 {
  label: string
  value: string | number | boolean
  icon?: string
  /** `선택계층` 전용 하위 항목. */
  items?: readonly i선택항목[]
  [key: string]: unknown
}

/** 단일 값 입력용 기본 타입 (타입지정._ 로 노출). name 은 ORM.resolve.client.ts 의 registry 키와 일치해야 함. */
const 기본타입 = {
  is체크: { name: 'Input체크' },
  문자: { name: 'Input문자' },
  전화번호: { name: 'Input전화번호' },
  /**
     * 본문. **md 로 저장하고, 사람은 완성된 그림 위에서 바로 고친다.**
     *
     * **서식 있는 글은 이 칸 하나뿐이다 (2026-09-07).** `문자서식`(TipTap WYSIWYG, `mEditor2`)이
     * 여기 같이 서 있었고 그쪽은 HTML 을 뱉었다 — 그래서 저장된 값이 `resources`(md) 와
     * `member-posts`(HTML) 두 벌로 갈려 있었다. 그 갈래를 걷었다: 본문인 칸은 이리로 오고,
     * 한두 문장짜리 소개·요약은 `문자` + `props.is여러줄` 로 갔다(**본문이 아닌 것에 편집기를
     * 세우지 않는다** — `model자료.내용` 은 라벨이 `본문(Markdown)` 인데 HTML 편집기로 열려서
     * `# 제목` 이 글자로 보이고 있었다). 쓸 수 있는 `::` 어휘는 `~utils/mdc/blocks`.
     *
     * **타입 이름만 `문자md` 고 컴포넌트는 `Input본문` 이다** — `사람이 md 를 안 보기 때문`에
     * 화면 쪽 이름에는 저장 형식이 안 나온다(2026-09-12 에 `Input본문md` 에서 접미를 뗐다).
     * 그 자리는 통과만 하고, md ↔ 문서 객체 왕복은 한 층 아래 `mEditorMd`(`m/Editor/md.vue`)가
     * 진다. 그 머리말이 왕복의 대가를 적는다.
     */
  문자md: { name: 'Input본문' },
  카드: { name: 'Input카드' },
  카드s: { name: 'Input카드s' },
  숫자: { name: 'Input숫자' },
  숫자2: { name: 'Input숫자2' },
  문자s: { name: 'Input태그' },
  /**
     * 문항 배열(`enrollables.questions` jsonb). 문항이 표가 아니라 값이라 카드s 로 못 그린다 —
     * 한 칸이 배열 통째를 v-model 로 받아 줄 단위로 편집한다(`Input문항s.vue`).
     */
  문항s: { name: 'Input문항s' },
  /**
     * 신청 한 건의 답지(`model신청.답지`). **읽기 전용**이다 — 답은 신청자가 응답지(`/official/enrolls/[id]`)에서 쓰고,
     * 관리자가 여기서 고치면 누가 한 답인지가 흐려진다. 문항 배열과 짝이라 `문항s` 옆에 둔다.
     */
  답지: { name: 'Input답지' },
  시간: { name: 'Input시간' },
  날짜: { name: 'Input날짜' },
  날짜2: { name: 'Input날짜시간' },
  월선택: { name: 'Input월선택' },
  기간: { name: 'Input기간' },
  기간시간: { name: 'Input기간시간' },
  아이콘: { name: 'Input아이콘' }
} satisfies Record<string, i컴포넌트>

/** 선택/파일/버튼 등 확장 타입 (타입지정 최상위로 노출). */
const 확장타입 = {
  선택0: { name: 'Input선택기' },
  /**
     * 라디오 줄. 값이 서넛이고 다 보여주는 게 나을 때만 — 그 밖에는 `선택0`이다.
     *
     * `variant` 를 여기 적지 않는다(2026-09-05에 뺐다). 적혀 있으면 호출부가 안 넘겼는데도
     * 재질이 박히는 것이라 테마 축이 이 칸만 못 돈다 (CLAUDE.md 「테마」 위반). 남은 둘은
     * 축이 아니라 배치다 — 가로로 눕히는 것과 폼 줄 높이에 맞춘 크기.
     *
     * 옆에 있던 `선택`(USelect)·`선택4`(USelectMenu)는 같은 날 지웠다. 실사용 0인데다
     * 래퍼 없는 날것이라 `_ui` 를 안 타고, `선택4` 는 `valueKey` 를 안 주면 고른 **항목 객체**를
     * 통째로 emit 하는 함정까지 있었다. 고를 것이 많으면 `선택0`이 이미 검색까지 얹어 준다.
     */
  선택2: { name: 'URadioGroup', props: { orientation: 'horizontal', size: 'xs' } },
  선택계층: { name: 'Input선택기계층' },
  선택s: { name: 'Input선택기S' },
  매트릭스: { name: 'Input매트릭스' },

  파일: { name: 'Input파일' },
  이미지: { name: 'Input사진' },
  이미지2: { name: 'Input사진3' },
  유튜브: { name: 'Input유튜브' },
  링크: { name: 'Input링크' },

  /** 자동필드ss 안에 놓는 버튼. `position:'top'`이면 상단바로 승격, 없으면 선언한 자리에 인라인. */
  버튼: { name: 'Input버튼' }
  // `top버튼`·`do버튼`(같은 값 두 벌)은 지웠다. 부르는 곳이 없다.
} satisfies Record<string, i컴포넌트>

/** 필드타입 키 -> 컴포넌트 메타. 각 타입은 위 두 객체에 한 번씩만 선언한다. */
export const 타입지정 = {
  ...확장타입,
  _: 기본타입
}

// [미사용] 참조하는 곳 없음. 손으로 나열해 둔 옛 목록은 2026-09-05에 지웠다 —
//         이미 낡아 있었고(31개 중 15개), 그날 `선택`·`선택4`·`숫자3`이 빠지면서 아예 거짓말이 됐다.
//         다시 살릴 경우 나열하지 말고 타입지정에서 자동 생성할 것:
//         type i타입 = (typeof 타입지정)[Exclude<keyof typeof 타입지정, '_'>] | (typeof 타입지정._)[keyof typeof 타입지정._];

const detectType = (value: any) => {
  const _타입s = [
    { obj: 타입지정._.is체크, isType: (v: any) => { return typeof v === 'boolean' } },
    { obj: 타입지정._.문자, isType: (v: any) => { return typeof v === 'string' } },
    { obj: 타입지정._.숫자, isType: (v: any) => { return typeof v === 'number' } },
    { obj: 타입지정._.문자s, isType: (v: any) => { return Array.isArray(v) && !is_mDayjs(v[0]) } },
    { obj: 타입지정._.시간, isType: (v: any) => { return is_mTime(v) } },
    { obj: 타입지정._.날짜, isType: (v: any) => { return is_mDayjs(v) } },
    { obj: 타입지정._.기간, isType: (v: any) => { return is_Period(v) } }

  ]
  return _타입s.find(item => item.isType(value))?.obj
}

export const 타입_to_컴포넌트 = (value: any, config?: any) => {
  return (config?.type) ? config.type : detectType(value)
}

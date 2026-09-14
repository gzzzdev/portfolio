// `defineAppConfig` 는 Nuxt 자동 import — `nuxt/app` 에서 직접 가져오면
// Nitro 서버 번들에 Vue 앱 별칭이 딸려 들어가 빌드가 깨진다.
import navs from '../_CUSTOM/configs/nav'
import { DEFAULT_THEME } from '../_CUSTOM/utils/theme/축'

/**
 * 기본 `color` 를 `primary` → `neutral` 로 내리는 컴포넌트 목록.
 *
 * **왜 필요한가** — Nuxt UI 에서 `primary` 는 "브랜드 강조색"이 아니라 **"상호작용 역할"의 별칭**이다.
 * 아래 33개가 전부 `defaultVariants.color: 'primary'` 로 나오기 때문에, 테마 축에서 기본색 하나만
 * 바꿔도 버튼·입력·체크박스·탭·프로그레스·토스트가 통째로 그 색으로 칠해진다.
 * "화면 전체가 primary 색으로 물든다"의 원인이 이거다 — Nuxt UI 의 의도된 동작이고 버그가 아니다.
 *
 * **왜 `neutral` 인가** — Nuxt UI 의 `neutral` 은 다른 색 별칭과 달리 색 램프(`--ui-color-neutral-*`)를
 * 안 쓰고 시맨틱 토큰을 쓴다:
 *   solid   → `bg-inverted`  (라이트 = neutral-900 / 다크 = white)
 *   outline → `ring-accented text-default bg-default hover:bg-elevated`
 *   soft    → `bg-elevated hover:bg-accented/75`
 * 즉 **회색조 + 화면모드 자동 반전**이 이미 구현돼 있다. `primary` 를 검정/흰색으로 칠해서
 * 흑백 UI 를 흉내 내면 안 되는 이유이기도 하다 — 그러면 focus 링(`ring-primary`)까지 같이
 * 검정이 돼서 검정 버튼 위의 검정 테두리가 된다.
 *
 * **색이 남는 자리 (의도된 예외)**
 * - focus  : `assets/css/mTheme.css` 가 `:focus-visible` 에서만 강조색으로 갈아끼운다.
 * - 긍정/부정: 호출부가 `color="success|error|warning"` 을 적은 곳.
 * - 호출부가 `color="primary"` 를 명시한 곳도 그대로 색이 산다 — 기본값만 움직인다는 규칙은
 *   mButton 의 `variant` 축(`재질.ts`)과 같다.
 *
 * **유지보수** — 목록 출처는 `.nuxt/ui/*.ts` 중 `defaultVariants.color === 'primary'` 인 것 전부
 * (Nuxt UI 4.10 기준 33개). 버전을 올려 컴포넌트가 늘면 아래로 다시 뽑는다:
 *   `cd .nuxt/ui && grep -l '"color": "primary"' *.ts | while read f; do
 *      sed -n '/"defaultVariants"/,$p' "$f" | grep -q '"color": "primary"' && echo "${f%.ts}"; done`
 *   (파일명은 kebab-case, app.config 키는 camelCase 다: `input-menu` → `inputMenu`)
 */
const NEUTRAL_BY_DEFAULT = [
  'alert', 'badge', 'banner', 'breadcrumb', 'button', 'calendar', 'chatPrompt',
  'checkbox', 'checkboxGroup', 'chip', 'fileUpload', 'input', 'inputDate',
  'inputMenu', 'inputNumber', 'inputRating', 'inputTags', 'inputTime',
  'listbox', 'navigationMenu', 'pinInput', 'progress', 'radioGroup', 'select',
  'selectMenu', 'slider', 'stepper', 'switch', 'tabs', 'textarea', 'timeline',
  'toast', 'tree'
] as const

/** `{ button: { defaultVariants: { color: 'neutral' } }, … }` — 위 목록을 그대로 펼친 것 */
const NEUTRAL_DEFAULTS = Object.fromEntries(
  NEUTRAL_BY_DEFAULT.map(name => [name, { defaultVariants: { color: 'neutral' } }])
) as Record<(typeof NEUTRAL_BY_DEFAULT)[number], { defaultVariants: { color: 'neutral' } }>

export default defineAppConfig({
  navs,

  /**
   * 테마(사용자 테마)의 첫 방문 기본값 — `useThemeStore.init()` 가 읽는다.
   * 앱 레이어는 필요한 키만 덮어쓰면 되고, 나머지는 DEFAULT_THEME 로 채워진다.
   * 아래 `ui` (Nuxt UI 설정)와는 별개다 — 섞지 말 것.
   */
  defaultTheme: DEFAULT_THEME,

  /** Nuxt UI 자체 설정 */
  ui: {
    /**
     * 색 별칭 → Tailwind 팔레트. 런타임에는 테마 축이 `--ui-color-{alias}-*` 를 덮으므로
     * (`utils/theme/css.ts` 의 `aliasVars`) 여기 값은 **테마가 붙기 전 폴백**이다.
     * `neutral` 은 이제 화면 대부분이 서는 자리라 제일 중요하다 — 색온도 축이 이걸 덮는다.
     */
    colors: {
      primary: 'blue',
      secondary: 'violet',
      success: 'green',
      info: 'cyan',
      warning: 'amber',
      error: 'red',
      neutral: 'slate'
    },

    // 컨트롤 기본색을 회색조로 — 위 주석 참고
    ...NEUTRAL_DEFAULTS,

    /**
     * 모달·시트 뒷막 — Nuxt UI 기본 `bg-elevated/75` 를 스크림으로 바꾼다.
     * 다크의 elevated 는 바닥보다 밝아서(`mTheme.css` 면 블록) 뒷막이 화면을 **밝게** 덮고,
     * 제일 어두운 종이(모달)가 그 위에 구멍처럼 앉았다. 뒷막은 층이 아니라 막이라
     * 모드와 무관하게 어둡게. 45% 는 다크 바닥(900) 위에서 거의 안 보여 70% 로 올렸다.
     * 흐림을 같이 건다 — 어둡기만 하면 뒤 글자가 그대로 읽혀서 모달과 경쟁한다.
     */
    modal: { variants: { overlay: { true: { overlay: 'bg-black/70 backdrop-blur-sm' } } } },
    slideover: { slots: { overlay: 'bg-black/70 backdrop-blur-sm' } },
    drawer: { slots: { overlay: 'bg-black/70 backdrop-blur-sm' } },

    /**
     * 읽기 렌더러(`.nuxt/ui/prose/*`)를 덮는 자리. **여기가 편집판까지 같이 움직인다** —
     * `m/Editor/_/prose.ts` 가 이 값을 읽어 TipTap 노드에 같은 클래스를 입히기 때문이다(그 파일 머리말).
     * 한쪽만 바꿀 자리는 없고, 바꾸면 이미 저장된 본문 전부가 같이 바뀐다.
     */
    prose: {
      /**
       * 제목 사다리를 한 칸씩 내린다 — **문서의 제목이 화면의 제목을 이기지 않게.**
       *
       * 물려받은 값은 Nuxt UI 의 **문서 사이트** 테마다(`.nuxt/ui/prose/*`). 그 화면은 페이지 하나에
       * 글 하나라 `#` 이 곧 화면 제목이지만, 우리 쪽에서 본문은 **화면의 한 칸**이다 — 신청받기 상세의
       * 페이지 제목이 `text-xl sm:text-2xl`(20→24px) 인데 본문 `#` 이 `text-4xl`(36px), `##` 이 24px 라
       * 딸린 글이 자기를 담은 화면보다 크게 섰다. 그래서 넷을 한 칸씩 내렸다(36→30, 24→20, 20→18, 18→16).
       * `##` 위 여백도 48px 은 폭 넓은 문서 화면의 리듬이라 40px 로 줄인다.
       *
       * **문단 크기는 여기가 아니다.** 문단·목록은 테마에 크기가 없어 담은 자리에서 물려받고,
       * 그 자리가 `.m-본문`(`assets/css/mTheme.css`)이다 — 15px. 여기에 적으면 편집판이 표칸·알림
       * 안에 만드는 `<p>` 까지 커져서 읽기판과 어긋난다(그 블록의 머리말).
       *
       * **h4(16px)는 문단(15px)보다 1px 위다** — 굵기(`font-bold`)와 색(`text-highlighted`)이 단차를 진다.
       */
      h1: { slots: { base: 'text-3xl' } },
      h2: { slots: { base: 'text-xl mt-10' } },
      h3: { slots: { base: 'text-lg' } },
      h4: { slots: { base: 'text-base' } },

      /**
       * 행간만 만진다 — **크기는 `.m-본문` 이 지고 여기는 비율만 진다.**
       *
       * 물려받은 `leading-7` 은 28px 고정이라 문단이 15px 로 내려가면 1.87 이 된다. 테마가 16px 에서
       * 노리던 비율이 1.75 였으니 그 비율을 되돌린다(26.25px). 행간이 남으면 글자를 줄여도 덩어리는
       * 그대로 커 보인다 — 크기를 내린 값이 여기서 반쯤 새어 나간다.
       *
       * 값이 변수인 이유는 **읽는 사람이 고르기 때문이다** — 테마의 줄간격 조절값(좁게 1.5 · 보통 1.75 ·
       * 넓게 2)이 `--m-prose-leading` 을 넣는다(`m/테마/글꼴.ts`). 폴백 1.75 는 그 값이 아직 안 붙은
       * 첫 페인트용이고, 그래서 손잡이를 안 건드린 화면은 예전과 같다. **툴바가 아니라 여기인 이유**도
       * 그 파일 머리말에 있다 — md 에는 줄간격을 적을 자리가 없다.
       *
       * 표칸·알림 안은 안 따라온다. 그쪽은 `td` 가 `[&_p]:leading-6`·`[&_li]:leading-6` 으로 자식을
       * 직접 짚고(명시도 0,1,1 로 이긴다), 알림 안 문단은 편집판 CSS 가 `line-height: inherit` 로
       * 눕힌다(`m/Editor/Editor.vue` 의 `<style>`). 읽기판은 거기서 문단을 아예 안 만든다.
       */
      p: { base: 'leading-[var(--m-prose-leading,1.75)]' },
      li: { base: 'leading-[var(--m-prose-leading,1.75)]' },

      /**
       * 본문(prose) 카드에 **층 이름표**를 단다 — `::card-group` 의 낱장이 이걸 쓴다.
       *
       * 왜 여기냐 — `.nuxt/ui/prose/*` 는 통째로 평평하다(전체에 `shadow` 가 1건, `code-group`
       * 탭 인디케이터뿐). 우리 파일이 아니라서 호출부가 손댈 자리가 없고, 유일하게 닿는 곳이
       * 이 슬롯 덮어쓰기다. `ProseCard` 가 `tv({ extend: theme, ...appConfig.ui.prose.card })`
       * 로 도는데 extend 는 슬롯 클래스를 **더하는** 방식이라, 원본 `border`·`bg-default` 를
       * 안 지우고 그림자만 얹힌다. (`.m-층-카드` 가 유틸리티에 밀리는 문제도 없다 — 원본에
       * 겨룰 `shadow-*` 가 아예 없다.)
       *
       * **알림·표·코드에는 안 단다.** 판단 기준은 `mTheme.css` 그림자 블록의 마지막 줄 —
       * *글로 읽히느냐, 물건으로 얹혔느냐*. 카드는 얹힌 물건이고 `::note` 는 문장에 두른 띠다.
       * 액자 둘(`mdc/Photo`·`mdc/Youtube`)은 우리 파일이라 거기서 직접 단다.
       */
      card: {
        slots: { base: 'm-층-카드' }
      }
    }

    /**
     * container 는 **여기서 안 건드린다.** 폭은 `main.css` 의 `--ui-container` 한 곳이 소유하고
     * (「본문 자」), Nuxt UI 기본 base 가 그걸 그대로 읽는다.
     *
     * 예전엔 이 자리에 주석 처리된 `base:` 세 줄(2000/1376/1440)과 「1376px 기준」이라는 머리말이
     * 있었는데, **아무것도 안 도는 채로 다른 파일이 그 문장을 근거 삼아 인용했다** — `lHeader` 가
     * 「app.config ui.container 의 1376px 기준과 동일」이라며 `max-w-[1440px]` 을 박았다.
     * 안 도는 설정은 지운다.
     */
  }
})

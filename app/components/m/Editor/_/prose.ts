/**
 * 읽기 렌더러의 옷을 편집판에 그대로 입힌다. **테마 파일(`.nuxt/ui/prose/*`)이 정본이고 여기는 읽기만 한다.**
 *
 * 편집판의 문단·제목·목록·표는 ProseMirror 가 `<p>`·`<h2>`… 를 직접 만든다. 읽기 화면은 같은 요소를
 * `ProseP`·`ProseH2` 컴포넌트가 그리고, 그 컴포넌트가 하는 일은 사실상 **클래스 한 줄을 붙이는 것**이다
 * (`tv({ extend: theme, ...appConfig.ui.prose.p })`). 그 한 줄을 여기서 똑같이 계산해 `HTMLAttributes` 로
 * 넘긴다. 그래서 편집판과 읽기 화면이 픽셀로 같아지고, 테마를 바꾸면(`app.config.ts` 의 `ui.prose`)
 * 양쪽이 같이 움직인다. CSS 로 다시 적으면 두 벌이라 안 한다.
 *
 * 컨테이너(알림·카드·탭·접기)는 아이콘·제목 같은 부품이 있어 클래스만으로는 안 되고 노드뷰가 그린다 —
 * 그쪽은 각 `.vue` 가 같은 방식으로 테마를 직접 읽는다.
 */
import { tv } from '#ui/utils/tv'
import a from '#build/ui/prose/a'
import accordion from '#build/ui/accordion'
import badge from '#build/ui/badge'
import blockquote from '#build/ui/prose/blockquote'
import cardGroup from '#build/ui/prose/card-group'
import code from '#build/ui/prose/code'
import em from '#build/ui/prose/em'
import h1 from '#build/ui/prose/h1'
import h2 from '#build/ui/prose/h2'
import h3 from '#build/ui/prose/h3'
import h4 from '#build/ui/prose/h4'
import hr from '#build/ui/prose/hr'
import img from '#build/ui/prose/img'
import li from '#build/ui/prose/li'
import ol from '#build/ui/prose/ol'
import p from '#build/ui/prose/p'
import pre from '#build/ui/prose/pre'
import proseAccordion from '#build/ui/prose/accordion'
import proseBadge from '#build/ui/prose/badge'
import steps from '#build/ui/prose/steps'
import strong from '#build/ui/prose/strong'
import table from '#build/ui/prose/table'
import tabsItem from '#build/ui/prose/tabs-item'
import td from '#build/ui/prose/td'
import th from '#build/ui/prose/th'
import thead from '#build/ui/prose/thead'
import tr from '#build/ui/prose/tr'
import ul from '#build/ui/prose/ul'

export type 정렬 = 'left' | 'center' | 'right' | null | undefined

export interface iProse클래스s {
  p: string
  h: Record<1 | 2 | 3 | 4, string>
  ul: string
  ol: string
  li: string
  a: string
  code: string
  pre: string
  blockquote: string
  hr: string
  img: string
  strong: string
  em: string
  steps: string
  cardGroup: string
  tabsItem: string
  accordion: string
  badge: string
  표: { root: string, base: string, tr: string, th: (align: 정렬) => string, td: (align: 정렬) => string }
}

/* eslint-disable @typescript-eslint/no-explicit-any -- 테마 객체 모양이 파일마다 달라(`base` 하나 / `slots`) 느슨하게 받는다 */
export function prose클래스s(appConfig: any): iProse클래스s {
  const prose = appConfig?.ui?.prose ?? {}
  const 짓기 = (theme: any, 이름: string) => tv({ extend: theme, ...(prose[이름] || {}) } as any) as any
  const 하나 = (theme: any, 이름: string, v?: Record<string, unknown>): string => 짓기(theme, 이름)(v)
  const 슬롯 = (theme: any, 이름: string, v?: Record<string, unknown>): any => 짓기(theme, 이름)(v)

  const 표 = 슬롯(table, 'table')
  return {
    p: 하나(p, 'p'),
    h: { 1: 슬롯(h1, 'h1').base(), 2: 슬롯(h2, 'h2').base(), 3: 슬롯(h3, 'h3').base(), 4: 슬롯(h4, 'h4').base() },
    ul: 하나(ul, 'ul'),
    ol: 하나(ol, 'ol'),
    li: 하나(li, 'li'),
    a: 하나(a, 'a'),
    code: 하나(code, 'code'),
    pre: 슬롯(pre, 'pre').base(),
    blockquote: 하나(blockquote, 'blockquote'),
    hr: 하나(hr, 'hr'),
    img: 슬롯(img, 'img', { width: false }).base(),
    strong: 하나(strong, 'strong'),
    em: 하나(em, 'em'),
    steps: 하나(steps, 'steps', { level: '3' }),
    cardGroup: 하나(cardGroup, 'cardGroup'),
    tabsItem: 하나(tabsItem, 'tabsItem'),
    // 접기 뿌리 — 컴포넌트 테마(`ui.accordion.root`)에 prose 덮개(`my-5`)를 얹는다. `ProseAccordion` 이 하는 그대로.
    accordion: (tv(accordion as any) as any)().root({ class: 슬롯(proseAccordion, 'accordion').root() }),
    // 태그 — `ProseBadge` = `UBadge color=primary variant=subtle` + prose 덮개(`rounded-full`). 라벨 슬롯(`truncate`)은
    // 마크 하나로 그리는 자리라 뺀다 — 잘림 처리가 커서를 가린다.
    badge: [(tv(badge as any) as any)({ color: 'primary', variant: 'subtle', size: 'md' }).base(), 하나(proseBadge, 'badge')].join(' '),
    표: {
      root: 표.root(),
      base: 표.base(),
      tr: 하나(tr, 'tr'),
      // 머리칸: 읽기 화면은 `thead` 가 `bg-muted` 를 지고 칸은 투명하다. 편집판 표에는 `thead` 가 없어 칸이 그 색을 진다.
      th: align => [하나(th, 'th', { align: align ?? undefined }), 하나(thead, 'thead')].join(' '),
      td: align => 하나(td, 'td', { align: align ?? undefined })
    }
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

import type { Component } from 'vue'
import { resolveComponent } from 'vue'
import { URadioGroup } from '#components'
import { 타입지정 } from './ORM'

/**
 * 필드타입 -> 실제 컴포넌트. **렌더 밖에서 부르기 때문에** 이 파일이 있다 —
 * `view/1.ts`는 필드 목록을 만드는 자리라 `resolveComponent`가 못 선다.
 *
 * 예전엔 `#components`에서 28개를 손으로 import 해 객체에 또 한 번 나열했다.
 * 같은 이름이 폴더·`ORM.ts`·여기 세 군데에 적혀 있어서, 필드 하나 늘릴 때마다
 * 네 번 손대야 했다(파일 만들고 · 타입 적고 · import 적고 · 객체에 적고).
 * 이제 `Input/` 폴더를 훑어 이름을 짓고 **`타입지정`에 적힌 이름만** 골라 담는다.
 * 늘릴 때 손댈 곳은 파일과 `ORM.ts` 둘뿐이다.
 *
 * `eager: true`인 이유: 손목록 시절에도 28개가 전부 정적 import 라 이미 번들에 들어 있었다.
 * 여기서 lazy 로 바꾸면 번들은 줄지만 `:is`가 async 가 되어 폼이 늦게 뜬다 — 그건 별개 판단이라
 * 이 변경에서는 번들 모양을 그대로 둔다.
 */
const 모듈s = import.meta.glob<{ default: Component }>('~base-comps/Input/**/*.vue', { eager: true })

/**
 * 파일 경로 -> Nuxt 가 자동등록하는 이름. (`components: [{ path: '~/components' }]`, 접두어 기본값)
 * - 폴더명과 같은 파일명은 한 번만: `Input/선택기/선택기.vue` -> `Input선택기`
 * - `_`는 조각 경계: `사진3/_generate.vue` -> `Input사진3Generate`
 * 현재 `Input/*.vue` 40개에 대해 옛 손목록 27개와 전부 일치하는 것을 확인하고 넣었다.
 */
function comp이름(path: string): string {
  // 글롭 키는 이 파일 기준 상대경로라 앞에 `../`가 잔뜩 붙는다. 홈 경로에 `components`가
  // 또 있어도 안 밀리게 **마지막** `/components/` 뒤를 쓴다.
  const 꼬리 = path.slice(path.lastIndexOf('/components/') + '/components/'.length)
  const 조각s = 꼬리.replace(/\.vue$/, '').split('/')
  return 조각s
    .filter((조각, i) => 조각 !== 조각s[i - 1])
    .map(조각 => 조각.split('_').filter(Boolean).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(''))
    .join('')
}

/** `타입지정`이 실제로 부르는 이름들. `Input/` 안의 내부 부품(`_pill` 등)과 본문 블록은 여기서 걸러진다. */
const 쓰는이름s = new Set(
  [...Object.values(타입지정._), ...Object.values(타입지정)]
    .filter((v): v is { name: string } => !!v && typeof v === 'object' && 'name' in v)
    .map(v => v.name)
)

// `URadioGroup`(=`선택2`)만 날것으로 남았다 — `USelect`·`USelectMenu`·`UButton` 은
// 그 타입들(`선택`·`선택4`·`top버튼`·`do버튼`)과 함께 2026-09-05에 빠졌다.
const registry: Record<string, Component> = { URadioGroup }

for (const [path, mod] of Object.entries(모듈s)) {
  const name = comp이름(path)
  if (쓰는이름s.has(name))
    registry[name] = mod.default
}

if (import.meta.dev) {
  // 손목록이 지던 몫: 파일을 지우거나 이름을 바꾸면 여기서 티가 난다.
  // (`resolveComponent` 로 흘러가면 렌더 밖이라 조용히 문자열만 남는다.)
  const 못찾은s = [...쓰는이름s].filter(name => !registry[name])
  if (못찾은s.length)
    console.error('[ORM.resolve] 타입지정에 적혀 있는데 Input/ 에서 못 찾은 컴포넌트:', 못찾은s)
}

export function resolve필드Comp(meta?: { name?: string } | null): Component | string | null {
  if (!meta?.name)
    return null
  return registry[meta.name] ?? resolveComponent(meta.name)
}

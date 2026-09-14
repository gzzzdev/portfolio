<!--
  상단 메뉴에서 **자식 묶음을 어떻게 보여줄까**의 비교판. **지금은 안5(바 밑 한 줄)이고,
  2026-09-05에 `l/NavigationMenu2.vue` 가 그걸로 갔다.** 안1 은 **개편 전 기록**, 나머지는
  탈락한 안이다 — 지우지 말 것. 왜 저걸 안 골랐는지가 이 판의 절반이다.

  **안3 은 하루, 안4 는 반나절 살았다.** 셋 다 같은 날이다. 채택 표시를 옮기면서 안 지운 이유가
  그것이다: 실제로 화면에 올려 봐야 드러나는 것이 있고(그림자 3단을 입은 상주물 · 여섯이면 안 들어가는
  트레이), 그 기록이 여기 말고 남을 데가 없다.

  **판이 답을 못 준 물음이 하나 있다.** 안1~4 는 전부 "같은 자리에서 그림을 어떻게 바꿀까" 였고,
  진짜 문제는 **그 자리가 좁다**는 것이었다 — 실제 헤더의 가운데 슬롯은 1280px 창에서 521px 다.
  여기 무대들은 폭이 통짜라 그게 안 보인다. 그래서 안5 칸만 무대 모양이 다르다.

  왜 이 판이 필요했나 — `l/NavigationMenu2.vue` 는 알약(pill)인데 **자식이 있으면 알약을 안 씌운다**
  (`children ? navDropdownTriggerClass : navPillClass`). 그래서 실제 헤더에서 알약은 `요약` 하나뿐이고
  나머지 다섯은 맨 텍스트 + chevron 이다. 열리는 패널도 Nuxt UI 기본값 그대로라
  (`rounded-md` + `ring ring-default` + `shadow-lg`) 완전 둥근 알약 옆에서 각져 보인다.
  **어휘가 두 벌**인 것이 어색함의 정체지, 패널 하나가 못생긴 게 아니다.

  여기서 만지는 것은 그 두 겹이다 — (1) 트리거를 알약으로 통일할지, (2) 자식을 띄울지 눕힐지.

  **네 안 다 여기서 자족한다** — 실제 컴포넌트를 import 하지 않는다. 안1 은 개편 전 `NavigationMenu2` 의
  클래스·`ui` 를 통째로 베껴 온 것이고(그 코드는 이제 여기에만 남아 있다), 나머지는 손으로 짰다.
  접근성(포커스·Esc·roving tabindex)은 여기 없다 — 모양만 보는 자리다.

  링크는 전부 죽어 있다. `to` 를 안 주고 `onSelect` 로 아래 `현재경로` 만 옮긴다 — 없는 라우트라
  진짜로 이동하면 안 되고, 그래야 활성 알약이 어떻게 따라오는지가 이 판 안에서 다 보인다.
-->
<template>
  <div class="mx-auto w-full max-w-6xl px-4 py-8">
    <div class="mb-6 flex flex-wrap items-end gap-x-4 gap-y-2">
      <div>
        <h1 class="text-2xl font-semibold">
          상단 메뉴 · 자식 묶음
        </h1>
        <p class="mt-1 text-sm text-muted">
          알약은 남기고 그 아래 묶음을 어떻게 말할까. 네 안이 같은 메뉴 나무·같은 활성 상태를 쓴다.
        </p>
      </div>
      <div class="grow" />
      <div class="flex flex-row items-center gap-4">
        <label class="flex flex-row items-center gap-2 text-xs text-muted">
          아이콘
          <input선택기
            v-model="아이콘"
            type="radio"
            :items="아이콘s"
            :search="false"
            is폭자동
          />
        </label>
        <label class="flex flex-row items-center gap-2 text-xs text-muted">
          지금 페이지
          <input선택기
            v-model="현재경로"
            type="radio"
            :items="경로s"
            :search="false"
            is폭자동
          />
        </label>
      </div>
    </div>

    <div class="flex flex-col gap-10">
      <!-- 안1 · 개편 전 — 이제 여기에만 남아 있는 코드 -->
      <section>
        <h2 class="text-sm font-medium">
          1 · 개편 전 <span class="text-muted">(2026-09-05 이전 l/NavigationMenu2)</span>
        </h2>
        <p class="mt-0.5 mb-3 text-xs text-muted">
          알약은 자식 없는 항목에만 붙는다. 패널은 Nuxt UI 기본 — 각진 모서리·1px 선·기본 그림자에
          <code>min-w-40</code> 라 두 글자 라벨 오른쪽이 빈다.
        </p>
        <Stage>
          <UNavigationMenu
            :items="지금items"
            content-orientation="vertical"
            disable-click-trigger
            color="neutral"
            :ui="지금ui"
          />
        </Stage>
      </section>

      <!-- 안2 · 알약 통일 -->
      <section>
        <h2 class="text-sm font-medium">
          2 · 알약 통일 <span class="text-muted">(패널만 다시 칠함)</span>
        </h2>
        <p class="mt-0.5 mb-3 text-xs text-muted">
          트리거를 자식 유무와 무관하게 알약으로 두고, 패널은 <code>rounded-2xl</code> + 그림자 축 값,
          자식도 알약, 폭은 라벨에 맞춘다. 같은 컴포넌트에 <code>ui</code> 만 갈아 끼운 것이라 그대로 옮겨 붙는다.
        </p>
        <Stage>
          <UNavigationMenu
            :items="알약items"
            content-orientation="vertical"
            disable-click-trigger
            color="neutral"
            :ui="알약ui"
          />
        </Stage>
      </section>

      <!-- 안3 · 둘째 줄 -->
      <section>
        <h2 class="text-sm font-medium">
          3 · 둘째 줄 <span class="text-muted">(하루 썼다가 내림)</span>
        </h2>
        <p class="mt-0.5 mb-3 text-xs text-muted">
          섹션에 들어가 있는 동안 자식이 아래 줄에 계속 떠 있다. 오버레이·z-index·모바일 문제가 통째로
          사라지고 "지금 어디" 가 항상 보인다. 대신 헤더가 한 줄 높아지고, 자식 없는 섹션에선 줄이 사라져
          <b>세로로 출렁인다</b> — <code>useHideOnScroll</code> 오프셋에도 걸린다.
        </p>
        <p class="mt-0.5 mb-3 text-xs text-muted">
          <b>실제로 붙여 보고 내렸다.</b> 출렁임을 피하려고 줄을 흐름 밖(<code>absolute</code>)으로 뺐더니
          자기 면을 들어야 했고 — 종이 + 링 + <b>그림자 3단</b> — 그건 메뉴·팝오버의 층이다. <b>상주하는 물건이
            뜬 물건의 옷을 입으니</b> 열린 드롭다운처럼 보이는데 안 닫혀서, 눈이 계속 "닫아야 하나" 를 물었다.
          덤으로 본문 맨 위 한 줄을 덮었다. 옷만 벗기는 수선도 가능했지만, 그럴 바엔 줄을 안 만드는
          안4 가 낫다.
        </p>
        <Stage :바닥="false">
          <div class="flex flex-row flex-wrap items-center gap-1">
            <button
              v-for="항목 in 메뉴"
              :key="항목.label"
              type="button"
              :class="알약cls(is활성(항목))"
              @click="누름3(항목)"
            >
              <UIcon
                v-if="항목.icon && 아이콘 === '있음'"
                :name="항목.icon"
                class="size-[18px]"
              />
              {{ 항목.label }}
            </button>
          </div>
          <div
            v-if="자식s3.length"
            class="mt-2 flex flex-row flex-wrap items-center gap-1 border-t border-default pt-2"
          >
            <button
              v-for="자식 in 자식s3"
              :key="자식.label"
              type="button"
              :class="작은알약cls(현재경로 === 자식.path)"
              @click="현재경로 = 자식.path ?? 현재경로"
            >
              {{ 자식.label }}
            </button>
          </div>
        </Stage>
      </section>

      <!-- 안4 · 제자리 펼침 -->
      <section>
        <h2 class="text-sm font-medium">
          4 · 제자리 펼침 <span class="text-muted">(반나절 썼다가 내림)</span>
        </h2>
        <p class="mt-0.5 mb-3 text-xs text-muted">
          알약이 그 자리에서 벌어져 자식을 품는다. 줄 수도 층도 안 늘고 부모–자식 관계가 위치로 드러난다.
          여기 판은 <b>눌러서</b> 펼치지만, 실제 헤더는 그러지 않는다 — 아래 「실제 헤더와 다른 점」 참고.
          그 차이가 이 안의 두 약점을 거의 다 지운다.
        </p>
        <p class="mt-0.5 mb-3 text-xs text-muted">
          <b>가로 출렁임</b>은 라우트가 정하면 사라진다(잎을 옮겨도 자식 묶음이 그대로라 폭이 안 변한다).
          내린 건 <b>남은 쪽</b> 때문이다 — <b>콘텐츠(6)·커뮤니티(5)에서 줄이 안 들어갔다.</b> 여기 무대는
          폭이 통짜라 멀쩡해 보이지만, 실제 헤더에서 이 줄이 쓸 수 있는 폭은 화면의 41% 다. 안5 참고.
        </p>
        <Stage :바닥="false">
          <div class="flex flex-row flex-wrap items-center gap-1">
            <template
              v-for="항목 in 메뉴"
              :key="항목.label"
            >
              <div
                v-if="펼친 === 항목.label && 항목.children?.length"
                class="inline-flex items-center gap-1 rounded-full bg-elevated/60 p-1"
              >
                <button
                  type="button"
                  class="inline-flex items-center gap-1.5 rounded-full px-3 py-[0.3rem] text-[1.0625rem] leading-tight font-medium text-muted transition-colors duration-200 hover:text-highlighted"
                  @click="펼친 = null"
                >
                  <UIcon
                    v-if="항목.icon && 아이콘 === '있음'"
                    :name="항목.icon"
                    class="size-[18px]"
                  />
                  {{ 항목.label }}
                  <UIcon
                    name="i-lucide-x"
                    class="size-3.5 opacity-50"
                  />
                </button>
                <button
                  v-for="자식 in 항목.children"
                  :key="자식.label"
                  type="button"
                  :class="작은알약cls(현재경로 === 자식.path)"
                  @click="현재경로 = 자식.path ?? 현재경로"
                >
                  {{ 자식.label }}
                </button>
              </div>
              <button
                v-else
                type="button"
                :class="알약cls(is활성(항목))"
                @click="누름4(항목)"
              >
                <UIcon
                  v-if="항목.icon && 아이콘 === '있음'"
                  :name="항목.icon"
                  class="size-[18px]"
                />
                {{ 항목.label }}
                <UIcon
                  v-if="항목.children?.length"
                  name="i-lucide-chevron-down"
                  class="size-4 opacity-50"
                />
              </button>
            </template>
          </div>
        </Stage>
      </section>

      <!-- 안5 · 바 밑 한 줄 — 무대가 다르다: 바의 좌·우 칸을 같이 그려야 가운데가 좁은 게 보인다 -->
      <section>
        <h2 class="text-sm font-medium">
          5 · 바 밑 한 줄 ★지금 <span class="text-muted">(자식을 바 밖으로)</span>
        </h2>
        <p class="mt-0.5 mb-3 text-xs text-muted">
          섹션은 바 가운데에 그대로 두고, <b>자식만 바 밑 한 줄</b>로 내린다. 앞 네 안이 전부 가운데
          슬롯 안에서 그림을 바꾸려 했는데, 그 슬롯은 역할 탭·로고(왼쪽)와 테마·로그인·도크(오른쪽)와
          한 줄을 나눠 쓴다 — <b>1280px 창에서 521px</b>. 밑줄은 <b>1280px</b> 을 다 쓴다.
          자식이 여섯이든 열이든 안 넘치는 이유가 그림이 아니라 <b>자리</b>다.
        </p>
        <p class="mt-0.5 mb-3 text-xs text-muted">
          값: <b>헤더가 한 줄만큼 높아진다.</b> 자식 없는 섹션에선 안 그리므로 높이가 오르내리는데,
          그 높이는 <code>lHeader</code> 가 실측해 <code>--ui-layout-header-offset</code> 에 실어 보내고
          <code>calc(100dvh - offset)</code> 을 쓰는 페이지 서른 곳이 한 줄도 안 고치고 따라온다
          (실측 64px ↔ 99.09px).
        </p>
        <div class="overflow-hidden rounded-xl border border-default bg-page">
          <div class="bg-default">
            <!-- 바 한 줄 — 좌·우 칸은 자리만 잡는 회색 상자다(실제 내용이 아니라 폭을 보이려는 것) -->
            <div class="flex flex-row items-center gap-2 px-3 py-2">
              <div class="shrink-0 rounded-md border border-dashed border-default px-2 py-1 text-[10px] whitespace-nowrap text-dimmed">
                역할 탭 · 로고
              </div>
              <div class="flex grow flex-row flex-wrap items-center justify-center gap-1">
                <button
                  v-for="항목 in 메뉴"
                  :key="항목.label"
                  type="button"
                  :class="알약cls(is활성(항목))"
                  @click="누름3(항목)"
                >
                  {{ 항목.label }}
                </button>
              </div>
              <div class="shrink-0 rounded-md border border-dashed border-default px-2 py-1 text-[10px] whitespace-nowrap text-dimmed">
                테마 · 로그인 · 도크
              </div>
            </div>
            <!-- 밑줄 — 좌·우 칸 밖으로 나와 폭을 다 쓴다 -->
            <div
              v-if="자식s3.length"
              class="flex flex-row flex-wrap items-center justify-center gap-1 px-3 pb-2"
            >
              <button
                v-for="자식 in 자식s3"
                :key="자식.label"
                type="button"
                :class="작은알약cls(현재경로 === 자식.path)"
                @click="현재경로 = 자식.path ?? 현재경로"
              >
                <UIcon
                  v-if="자식.icon && 아이콘 === '있음'"
                  :name="자식.icon"
                  class="size-4"
                />
                {{ 자식.label }}
              </button>
            </div>
          </div>
          <div class="px-3 py-6 text-center text-xs text-dimmed">
            본문 — 밑줄이 흐름 안이라 덮지 않는다
          </div>
        </div>
      </section>
    </div>

    <div class="mt-10 rounded-xl border border-default p-4 text-xs text-muted">
      <p class="font-medium text-default">
        실제 헤더와 다른 점
      </p>
      <p class="mt-1">
        여기 안3·안4·안5 는 클릭 상태로 여닫지만, <code>l/NavigationMenu2.vue</code> 는
        <b>열림 상태를 안 든다</b> — 지금 경로가 속한 섹션이 곧 펼쳐진 섹션이다. 새로고침·뒤로가기·딥링크가
        맞아야 하기 때문이고, 링크를 받아 들어온 사람이 접힌 채로 도착하면 형제가 있다는 걸 모른다.
      </p>
      <p class="mt-1">
        그래서 실제 헤더에는 <b>닫는 버튼(×)도 chevron 도 없다.</b> 그리고 안5 의 좌·우 회색 칸은
        <b>폭을 보이려고 그린 가짜</b>다 — 실제 헤더에선 그 자리에 역할 탭과 테마·로그인·도크가 선다.
        밑줄이 <code>lHeader</code> 의 <code>#bottom</code> 슬롯(UHeader 안쪽)에 들어가는 이유도 그것이다:
        헤더의 면·선·그림자 안에 있어야 한 물건으로 읽히고, 무엇보다 래퍼 실측에 포함돼야 오프셋이 따라온다.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, ref } from 'vue'
import type { NavigationMenuItem } from '@nuxt/ui'

definePageMeta({
  제목: '상단 메뉴 · 자식 묶음'
})

type i링크 = {
  label: string
  path?: string
  icon?: string
  children?: i링크[]
}

/** 실제 GNB(`useNavs`)와 같은 모양의 장난감 나무. 라벨·묶음 크기는 스샷과 맞췄다. */
const 메뉴: i링크[] = [
  { label: '요약', path: '/summary', icon: 'i-lucide-layout-dashboard' },
  {
    label: '회원',
    icon: 'i-lucide-users',
    children: [
      { label: '회원', path: '/members', icon: 'i-lucide-user-round' },
      { label: '역할', path: '/roles', icon: 'i-lucide-shield' },
      { label: '등급', path: '/grades', icon: 'i-lucide-award' }
    ]
  },
  {
    label: '콘텐츠',
    icon: 'i-lucide-book-open',
    children: [
      { label: '강좌', path: '/courses', icon: 'i-lucide-book-open' },
      { label: '교재', path: '/books', icon: 'i-lucide-file-text' },
      { label: '자료실', path: '/files', icon: 'i-lucide-folder' }
    ]
  },
  {
    label: '모집·신청',
    icon: 'i-lucide-clipboard-list',
    children: [
      { label: '모집', path: '/recruits', icon: 'i-lucide-megaphone' },
      { label: '신청', path: '/applications', icon: 'i-lucide-clipboard-list' }
    ]
  },
  {
    label: '커뮤니티',
    icon: 'i-lucide-messages-square',
    children: [
      { label: '공지', path: '/notices', icon: 'i-lucide-bell' },
      { label: '게시판', path: '/boards', icon: 'i-lucide-messages-square' }
    ]
  },
  {
    label: '설정',
    icon: 'i-lucide-settings',
    children: [
      { label: '메뉴', path: '/menus', icon: 'i-lucide-list' },
      { label: '테마', path: '/theme', icon: 'i-lucide-palette' }
    ]
  }
]

const 아이콘s = [
  { label: '있음', value: '있음' },
  { label: '없음', value: '없음' }
]
const 아이콘 = ref<'있음' | '없음'>('있음')

const 경로s = [
  { label: '요약', value: '/summary' },
  { label: '회원>등급', value: '/grades' },
  { label: '콘텐츠>교재', value: '/books' }
]
const 현재경로 = ref('/summary')

function is활성(항목: i링크): boolean {
  if (항목.path && 항목.path === 현재경로.value) return true
  return Boolean(항목.children?.some(자식 => is활성(자식)))
}

/**
 * 하나짜리 무대. 실제 헤더처럼 종이 위에 메뉴를 놓고 그 아래에 내용을 깐다 —
 * 뜨는 패널이 **무엇을 덮는지**가 안 보이면 층을 판단할 수 없다.
 * (`바닥: false` 는 안 덮는 안들 — 둘째 줄·제자리 펼침 — 에서 밑판을 뺀다.)
 */
const Stage = defineComponent({
  name: 'Stage',
  props: { 바닥: { type: Boolean, default: true } },
  setup(props, { slots }) {
    const 카드s = [
      ['회원', '9 명'],
      ['메뉴', '28 개'],
      ['강좌', '4 개']
    ]
    return () =>
      h('div', { class: 'overflow-hidden rounded-xl border border-default bg-page' }, [
        h('div', { class: 'relative z-10 bg-default px-3 py-2' }, slots.default?.()),
        props.바닥
          ? h(
              'div',
              { class: 'flex flex-row gap-3 p-3' },
              카드s.map(([이름, 값]) =>
                h(
                  'div',
                  {
                    key: 이름,
                    class:
                      'flex h-24 w-40 flex-col justify-between rounded-lg border border-default bg-default p-3 text-xs text-muted m-층-카드'
                  },
                  [이름, h('span', { class: 'text-lg font-semibold text-highlighted' }, 값)]
                )
              )
            )
          : null
      ])
  }
})

/* ─────────────────────────── 공용 알약 클래스 ─────────────────────────── */

/**
 * `NavigationMenu2.navPillClass` 를 그대로 옮긴 것. 안1 은 이걸 자식 없는 항목에만 쓰고,
 * 안2~4 는 전부에 쓴다 — 그 차이 하나가 이 판의 절반이다.
 */
function 알약cls(활성: boolean) {
  return [
    'inline-flex items-center gap-2 rounded-full border px-[1.125rem] py-[0.45rem] text-[1.0625rem] leading-tight font-medium whitespace-nowrap no-underline transition-colors duration-200',
    활성
      ? 'border-transparent bg-inverted text-inverted'
      : 'border-transparent text-muted hover:bg-inverted hover:text-inverted'
  ]
}

/** 자식용 — 부모보다 한 단 작고, 골라진 것만 채운다. */
function 작은알약cls(활성: boolean) {
  return [
    'inline-flex items-center gap-1.5 rounded-full px-3 py-[0.3rem] text-sm leading-tight font-medium whitespace-nowrap transition-colors duration-200',
    활성 ? 'bg-inverted text-inverted' : 'text-muted hover:bg-elevated hover:text-highlighted'
  ]
}

/* ─────────────────────────── 안1 · 지금 값 ─────────────────────────── */

/** `NavigationMenu2.navigationMenuUi` 를 그대로 옮긴 것. */
const 지금ui = {
  root: 'gap-0',
  item: 'py-0',
  link: 'before:hidden',
  linkLeadingIcon: 'size-[18px]',
  linkTrailingIcon: 'size-[18px] opacity-80',
  viewportWrapper: 'start-0 justify-start pt-1',
  viewport: 'left-0! min-w-40',
  childList: 'flex min-w-40 flex-col gap-0 p-1',
  childLink: 'w-full items-center justify-start gap-2 px-3 py-2 text-left'
}

/** 같이 옮긴 것 — 자식이 있으면 알약을 벗는다. */
function 지금트리거cls(활성: boolean) {
  return [
    'inline-flex items-center gap-2 border-transparent bg-transparent px-3 py-[0.45rem] text-base leading-tight font-medium whitespace-nowrap no-underline transition-colors duration-200',
    활성
      ? 'text-highlighted'
      : 'text-muted hover:text-highlighted data-[state=open]:text-highlighted'
  ]
}

/* ─────────────────────────── 안2 · 알약 통일 ─────────────────────────── */

/**
 * 안1 과 다른 것만 보면 된다 —
 * `viewport`: 모서리를 `2xl` 로(알약 옆에서 `md` 는 각져 보인다), 폭을 라벨에 맞추고, box-shadow 를 그림자 축에 건다.
 *   ⚠️ 여기만 이름표(`.m-층-드롭다운`)가 아니라 `shadow-(--m-depth-3)` 다 — 원본 슬롯에 `shadow-lg` 가
 *   있어서 이름표만 얹으면 **유틸리티가 이겨 축이 안 닿는다**(`mTheme.css` 그림자 블록의 그 함정).
 *   같은 그룹의 클래스라야 twMerge 가 `shadow-lg` 를 밀어낸다. 옮겨 붙일 때 **그림자 손잡이를 끝까지
 *   돌려 그림자가 따라오는지** 한 번 볼 것 — 안 움직이면 밀린 것이다.
 * `ring ring-default` 는 남긴다 — 다크에선 그림자가 검정 위 검정이라 이 선이 패널의 윤곽이다.
 * `childLink`: `before:` 가 hover/활성 배경을 그리므로 그쪽 모서리를 둥글려야 알약이 된다.
 * 폭: `min-w-40` → `min-w-max`. 두 글자 라벨에 40 은 오른쪽이 빈다.
 */
const 알약ui = {
  root: 'gap-0.5',
  item: 'py-0',
  link: 'before:hidden',
  linkLeadingIcon: 'size-[18px]',
  linkTrailingIcon: 'size-4 opacity-50',
  viewportWrapper: 'start-0 justify-start pt-2',
  viewport: 'left-0! min-w-max rounded-2xl bg-default p-1.5 shadow-(--m-depth-3)',
  childList: 'flex min-w-max flex-col gap-0.5 p-0',
  childLink: 'w-full items-center justify-start gap-2 rounded-full px-3.5 py-2 text-left before:inset-0 before:rounded-full'
}

/* ─────────────────────────── 나무 → UNavigationMenu items ─────────────────────────── */

function 자식들(children: i링크[]): NavigationMenuItem[] {
  return children.map(자식 => ({
    label: 자식.label,
    icon: 아이콘.value === '있음' ? 자식.icon : undefined,
    active: 현재경로.value === 자식.path,
    /** 없는 라우트라 `to` 를 안 준다. 이동 대신 이 판의 활성만 옮긴다. */
    onSelect: (e: Event) => {
      e.preventDefault()
      if (자식.path) 현재경로.value = 자식.path
    }
  }))
}

function items(알약통일: boolean): NavigationMenuItem[] {
  return 메뉴.map((항목) => {
    const 활성 = is활성(항목)
    const 자식 = 항목.children?.length ? 자식들(항목.children) : undefined
    return {
      label: 항목.label,
      icon: 아이콘.value === '있음' ? 항목.icon : undefined,
      active: 활성,
      children: 자식,
      class: 자식 && !알약통일
        ? 지금트리거cls(활성)
        : [
            ...알약cls(활성),
            /* 열려 있는 동안에도 알약을 유지한다. 활성이 아닐 때만 반 칸 채워 "열림"을 말한다. */
            활성 ? '' : 'data-[state=open]:bg-elevated data-[state=open]:text-highlighted'
          ],
      onSelect: 자식
        ? undefined
        : (e: Event) => {
            e.preventDefault()
            if (항목.path) 현재경로.value = 항목.path
          }
    }
  })
}

const 지금items = computed(() => items(false))
const 알약items = computed(() => items(true))

/* ─────────────────────────── 안3 · 둘째 줄 ─────────────────────────── */

/** 둘째 줄은 **열린 것**이 아니라 **지금 있는 섹션**을 보여준다. 그래서 기본값이 현재 섹션이다. */
const 섹션3 = ref<string | null>(null)
const 자식s3 = computed<i링크[]>(() => {
  const 이름 = 섹션3.value ?? 메뉴.find(항목 => is활성(항목))?.label
  return 메뉴.find(항목 => 항목.label === 이름)?.children ?? []
})
function 누름3(항목: i링크) {
  if (항목.children?.length) {
    섹션3.value = 항목.label
    return
  }
  섹션3.value = 항목.label
  if (항목.path) 현재경로.value = 항목.path
}

/* ─────────────────────────── 안4 · 제자리 펼침 ─────────────────────────── */

const 펼친 = ref<string | null>(null)
function 누름4(항목: i링크) {
  if (항목.children?.length) {
    펼친.value = 항목.label
    return
  }
  펼친.value = null
  if (항목.path) 현재경로.value = 항목.path
}
</script>

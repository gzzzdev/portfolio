<template>
  <!--
    도크 여닫이. FAB 가 아니라 헤더 크롬으로 둔다 —
    이건 화면의 주된 생성 액션이 아니라 `m로그인4` 와 같은 부류의 앱 토글이고,
    무엇보다 **켜는 자리와 끄는 자리가 같아야** 껏다 켰다 쓸 수 있다.
    (셸이 `lg:pe-(--dock-inset)` 로 줄어들면서 이 버튼은 패널 왼쪽 가장자리로 물러나고,
     비워진 우상단은 패널 **맨 윗줄**의 닫기 버튼이 이어받는다 — 우상단 한 지점에서 왕복이 닫힌다.)

    **아이콘은 패널 자체다** — 접혀 있으면 펴는 그림, 펴져 있으면 접는 그림.
    (좁은 화면에서는 그 패널이 아래에서 올라오는데 그림은 그대로 옆판이다. 방향을 갈라 그리려면
     서버가 폭을 모르므로 아이콘 둘을 CSS 로 감춰야 하는데, 툴팁·뱃지가 딸린 버튼이라 값이 크다.
     여기서 말하는 건 "이 자리에 패널이 있다"뿐이라 방향은 지고 간다.)
    한때 활성 pane 의 아이콘을 썼는데(무엇이 남아 있는지 알리려고), 그 pane 을 여는 버튼이
    같은 헤더 줄에 따로 있으면 **똑같은 아이콘 둘**이 나란히 서서 어느 쪽이 무엇인지 못 가른다
    (테마의 헤더 팔레트가 있던 시절 실제로 그랬다 — 그 버튼은 2026-09-07 에 걷혔고, 테마는
    패널 목록의 한 줄이 됐다). 무엇이 남아 있는지는 툴팁의 이름과 점이 맡는다 —
    이 버튼이 말할 것은 "이 자리에 패널이 있다"뿐이다.

    라벨도 같은 뜻으로 맞춘다. **열렸으면 `패널 닫기`** — 이 버튼이 접는 것은 펴져 있는 pane 이
    아니라 패널 전체다. 활성 pane 이름(`테마 닫기`)을 쓰면 목록에서 그 줄만 접는 것처럼 읽히는데,
    누르면 패널째 사라진다. **닫혔을 때만** pane 이름을 쓴다 — 그때는 무엇이 기다리는지가
    정보다(점과 같은 일).
  -->
  <UTooltip
    :text="열닫말"
    :kbds="['meta', 'J']"
  >
    <mButton
      :icon="open ? 'i-lucide-panel-right-close' : 'i-lucide-panel-right-open'"
      역할="조용"
      :class="['relative', 실사
        ? ['text-inherit! hover:bg-current/10!', open ? 'bg-current/10!' : '']
        : open ? 'bg-elevated text-highlighted' : '']"
      :ui="실사 ? { leadingIcon: 'size-6' } : undefined"
      :aria-pressed="open"
      :aria-label="열닫말"
      @click="toggle"
    >
      <!--
        사라지는 버튼이 아니라 눌린 채 남는 토글이므로, 뱃지는 닫혔을 때만 알릴 일이 있다.
        점이 버튼 기준으로 앉으려면 루트가 positioned 여야 한다 — 옛 FAB 는 `fixed` 라 저절로 됐던 것.
      -->
      <template
        v-if="hasBadge && !open"
        #trailing
      >
        <span class="absolute right-1 top-1 size-2 rounded-full bg-primary" />
      </template>
    </mButton>
  </UTooltip>
</template>

<script setup lang="ts">
import type { DockPaneOptions } from '~/composables/useDock'

defineProps<{
  /**
   * 사진 히어로 머리(`layout-official`)용 — `m로그인4` 의 `실사` 와 짝이다. 눌린 판(`bg-elevated`)이 사진 위에서 흰 네모로 뜨지 않게
   * 글자색을 부르는 쪽에서 받고(`text-inherit`) 바탕도 그 색을 옅게 깐다. 아이콘도 한 치수 키워 메뉴 글씨와 무게를 맞춘다.
   */
  실사?: boolean
}>()

const { open, visiblePanes, activePane, openPane, close } = useDock()

const label = computed(() =>
  activePane.value ? toValue(activePane.value.label) : 'AI도우미'
)

/** 열렸으면 패널을 접는 버튼, 닫혔으면 그 안에서 기다리는 것을 여는 버튼 */
const 열닫말 = computed(() => open.value ? '패널 닫기' : `${label.value} 열기`)

function badgeOf(pane: DockPaneOptions) {
  const v = toValue(pane.badge)
  return v === 0 || v === '' ? undefined : v
}

const hasBadge = computed(() => visiblePanes.value.some(p => badgeOf(p)))

function toggle() {
  if (open.value) close()
  else openPane()
}

/**
 * ⌘J(맥) / Ctrl+J(윈도우). 조합을 두 번 적지 않는다 — `meta` 는 맥이 아닐 때
 * `defineShortcuts` 가 ctrl 로 바꿔 준다.
 *
 * **왜 ⌘K 가 아닌가**(2026-09-15): ⌘K 는 한때 이 키였는데, 다른 사이트에서 ⌘K 는 찾기라
 * 처음 온 사람이 검색하려다 채팅을 열었다. ⌘K 는 전체 찾기(`l/전체찾기`)에 넘기고
 * 도우미는 Notion AI 와 같은 ⌘J 로 옮겼다. 윈도우 크롬·파이어폭스의 Ctrl+J(다운로드)는
 * 페이지가 `preventDefault` 로 막을 수 있는 키다 — 탭·창 키(⌘T·⌘W·⌘N)와 다르다.
 *
 * 이 컴포넌트에 두는 이유: 레이아웃마다 하나씩만 렌더되므로 리스너도 하나뿐이고,
 * 여닫는 판단(`toggle`)이 이미 여기 있다. `useDock` 에 두면 pane 마다 리스너가 붙는다.
 *
 * `usingInput: true` — 없으면 입력창·contenteditable 에 커서가 있는 동안 죽는다.
 *   도크를 열면 `lAI_CopilotV2` 이 프롬프트로 포커스를 옮기므로 **열자마자 그 상태**다.
 *   즉 이게 없으면 같은 키로 못 닫는다.
 * `layoutIndependent` — e.key 가 아니라 e.code(`KeyJ`)로 맞춘다.
 *   QWERTY 가 아닌 배열이나 IME 가 낀 상황에서 e.key 가 다른 글자로 와도 흔들리지 않는다.
 */
defineShortcuts({
  meta_j: { usingInput: true, handler: toggle }
}, { layoutIndependent: true })
</script>

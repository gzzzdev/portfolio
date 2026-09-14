<template>
  <!--
    좁은 화면에서 펼쳐져 있을 때만 깔리는 스크림.
    **눌러도 닫지 않고 「한 줄」로 내린다** — 도우미를 버리는 게 아니라 뒤의 화면을 보려는 동작이고,
    그때 마지막 답변과 실행 버튼은 스트립에 남아야 한다(닫으면 누를 것까지 같이 사라진다).
  -->
  <Transition
    enter-active-class="transition-opacity duration-200"
    leave-active-class="transition-opacity duration-200"
    enter-from-class="opacity-0"
    leave-to-class="opacity-0"
  >
    <div
      v-if="open && !한줄"
      class="fixed inset-0 z-30 bg-black/40 lg:hidden"
      aria-hidden="true"
      @click="한줄로"
    />
  </Transition>

  <!--
    도크 패널.

    `USidebar` 를 걷어냈다. 그쪽의 `mode="slideover"` 는 lg 미만에서 **오른쪽에서 덮는 다이얼로그**가
    되는데, 그러면 도우미가 몰아놓은 화면을 도우미가 가린다 — "여름채소 7건입니다"라고 말하면서
    그 7건을 한 개도 못 보게 하는 자기모순이다(`l/AI_CopilotV2.vue` — 도우미는 렌더러를 안 들고 있다).
    좁은 화면에서는 **아래에서 올라오고**, 화면을 밀 때마다 스스로 한 줄로 내려간다.

    닫혀 있어도 마운트를 유지한다(옛 offcanvas 와 같은 이유) — 갈아끼우면 초안·대화가 날아간다.
    화면 밖으로 밀어두고 `pointer-events-none` 으로 손이 안 닿게만 한다.

    z-30: 앱의 모달 레이어(modalWrapper 의 content = z-31) **바로 아래**.
    답변의 실행 버튼이 여는 모달(do등급증출력 등)이 패널 뒤로 숨지 않으려면 이 관계가 필요하다.

    바닥에서 올라온 시트는 **층 4(`m-층-모달`)** 다 — 사다리가 "모달·시트"라고 적어둔 그 칸이고,
    스크림과 짝이다. 데스크톱의 도크는 화면 가장자리에 물려 테두리로 끝나므로 그 층을 벗는다
    (`lg:shadow-none` — 층 이름표는 `@layer components` 라 `max-lg:` 같은 변형이 안 생긴다).

    **두 높이가 다 구체값이라 그냥 흐른다** — 한 줄은 `--dock-peek`, 펼침은 `72dvh`.
    한때 접힘을 `height: auto` 로 뒀는데(스트립을 실측해서), **auto 는 전이가 안 돼** 매번 툭 끊겼다.
    그래서 높이를 정해 두고 스트립이 그 안에 들어오게 했다(`useDock.한줄높이`). `overflow-hidden` 은
    그 약속이 깨졌을 때 밖으로 삐져나오지 말라는 뜻이다.

    **폭 분기는 JS 가 아니라 CSS 로 한다.** `useResponsive` 는 데스크톱 UA 에 `ssrWidth` 를 안 주므로
    서버에서 `is데스크탑` 이 거짓이고, 그걸로 마크업을 가르면 넓은 화면에서 바텀시트로 그려진 뒤
    하이드레이션에 튄다(실측). 클래스 변형은 서버·클라 출력이 같아서 그 문제가 아예 없다 —
    JS 판정이 남는 자리는 **사용자가 만진 뒤에만 참이 되는** `한줄` 하나뿐이다.
  -->
  <aside
    class="fixed z-30 flex flex-col overflow-hidden bg-default transition-[transform,height] duration-250 ease-out
           inset-x-0 bottom-0 rounded-t-2xl border-t border-default m-층-모달
           lg:inset-y-0 lg:inset-x-auto lg:end-0 lg:w-(--dock-width) lg:rounded-none lg:border-t-0 lg:border-s lg:shadow-none"
    :class="[
      open ? 'translate-y-0 lg:translate-x-0' : 'translate-y-full lg:translate-y-0 lg:translate-x-full pointer-events-none',
      한줄 ? 'h-(--dock-peek) lg:h-auto' : 'h-[72dvh] lg:h-auto'
    ]"
    :aria-hidden="!open"
    @keydown.esc="close"
  >
    <!--
      손잡이. 좁은 화면에서 한 줄 ↔ 펼침을 오가는 자리다.
      넓게 잡는 이유: 스트립이 얇아서(한 줄+버튼) 정확히 겨냥하기 어렵다.
    -->
    <div class="flex shrink-0 items-center lg:hidden">
      <button
        type="button"
        class="flex grow justify-center py-2"
        :aria-expanded="!한줄"
        :aria-label="한줄 ? '도우미 펼치기' : '한 줄로 내리기'"
        @click="한줄토글"
      >
        <span class="h-1 w-10 rounded-full bg-accented" />
      </button>

      <!-- 한 줄일 때는 헤더가 없다. 아주 닫는 길이 여기 하나 남는다. -->
      <mButton
        v-if="한줄"
        icon="i-lucide-x"
        역할="조용"
        size="xs"
        class="me-2"
        aria-label="도우미 닫기"
        @click="close"
      />
    </div>

    <!--
      Esc 로 닫기. 전역 keydown 으로 잡지 않는 이유: 답변의 실행 버튼이 여는 do* 모달(z-31)이 이 패널
      **위에** 뜨는데, 그때 Esc 를 전역에서 먹으면 모달만 닫혀야 할 자리에서 도크까지 같이 닫힌다.
      여기 걸어두면 패널 안에 포커스가 있을 때만 버블링으로 올라온다(모달은 포털로 빠져나간다).

      ⌘J 로 열면 `lAI_CopilotV2` 이 프롬프트로 포커스를 옮겨주므로 열자마자 Esc 가 듣는다.
      포커스를 안 가져가는 pane 이 활성일 때는 패널을 한 번 클릭해야 한다.
    -->

    <!--
      ## 목록 — 줄 하나가 곧 pane 이고, 고른 줄이 **그 자리에서** 펴진다

      옛 알약 탭 한 줄을 세로로 세운 것이다. 그때는 활성 탭만 글자를 갖고 나머지는 아이콘만
      남았는데, 그건 28rem 폭에 다섯 개를 세우려던 값이었다. 세로로 쌓으면 그 제약이 없어져서
      **이름이 늘 보인다** — 무엇이 이 패널 안에 있는지 열자마자 읽힌다.

      그게 지금 이 목록이 지는 짐이다: 테마의 헤더 팔레트를 걷어내면서(2026-09-07) 테마로 가는
      길은 이 목록 하나만 남았다. 아이콘만 남는 탭이었으면 「테마」라는 글자가 앱 어디에도 없다.

      **활성 pane 의 내용은 그 줄 바로 아래에 온다.** 그래서 목록을 두 토막으로 돌린다 —
      활성 줄까지(`위줄s`) 그리고, 슬롯을 끼우고, 나머지(`아래줄s`)를 그린다. 슬롯은 한 번만
      그려질 수 있어서(pane 들이 거기 통째로 마운트돼 있다) 이 방법 말고는 CSS `order` 로
      DOM 을 뒤집는 수뿐인데, 그러면 탭 이동 순서가 눈에 보이는 순서와 어긋난다.

      **한 줄일 때는 목록이 통째로 빠진다.** 줄 둘·초기화까지 남기면 「한 줄」이 네 줄이 되고,
      그만큼 뒤의 화면을 도로 먹는다 — 접힘의 목적이 그 화면을 보는 것인데.
      줄을 옮기려면 펼치면 된다. 아주 닫는 길은 손잡이 줄의 × 와 헤더의 여닫이가 진다.
    -->
    <template v-if="줄보임">
      <lDock줄
        v-for="(pane, i) in 위줄s"
        :key="pane.id"
        :pane="pane"
        :활성="isActive(pane.id)"
        class="border-b border-default"
        :class="i === 0 ? 'lg:min-h-[calc(var(--ui-layout-header-offset,var(--ui-header-height,4rem))_-_1px)]' : ''"
        @열기="activate(pane.id)"
      >
        <!--
          패널 자신의 닫기는 **맨 윗줄 오른쪽 끝**이다 — 헤더의 여닫이가 있던 x 좌표를 그대로
          이어받아 우상단 한 지점에서 왕복이 닫힌다(`lDock토글` 머리말). 활성 줄이 아니라
          늘 첫 줄인 이유: 이건 pane 의 크롬이 아니라 **패널의** 크롬이라 자리가 움직이면 안 된다.

          닫기 아이콘은 패널이 나가는 방향을 가리킨다 — 옆으로 물러나거나, 아래로 내려가거나.
          둘을 나란히 두고 CSS 로 하나만 남긴다(패널 기하와 같은 이유 — 서버에서 폭을 모른다).
        -->
        <template
          v-if="i === 0"
          #끝
        >
          <mButton
            icon="i-lucide-chevron-down"
            역할="조용"
            size="xs"
            class="lg:hidden"
            aria-label="닫기"
            @click="close"
          />
          <mButton
            icon="i-lucide-panel-right-close"
            역할="조용"
            size="xs"
            class="hidden lg:inline-flex"
            aria-label="닫기"
            @click="close"
          />
        </template>
      </lDock줄>
    </template>

    <!--
      pane 들은 여기 그대로 마운트돼 있다(패널을 닫아도 살아 있다).
      전환은 각 pane 이 자기 루트에 건 `v-show` 로 일어난다 — 갈아끼우면 초안이 날아가는데,
      탭은 남아 있으니 앱이 거짓말을 하게 된다.

      **한 줄일 때도 같은 slot 이다.** 무엇을 남길지는 pane 이 정한다(`useDockPane().한줄`) —
      도크는 마지막 답변이 있는지도 모르고, 알 필요도 없다.
    -->
    <div
      class="min-h-0 grow"
      :class="한줄 ? 'px-4 pb-3' : 'p-4'"
    >
      <!-- 요약을 안 그리는 pane 이 활성일 때. 이름만 남기고 손잡이로 되돌아가게 둔다. -->
      <p
        v-if="한줄 && !한줄지원"
        class="truncate text-sm text-muted"
      >
        {{ activePane ? labelOf(activePane) : '' }}
      </p>

      <!--
        `h-full` 은 펼쳤을 때만 건다. 한 줄일 때 패널 높이는 **내용이 정하는데**(`height: auto`),
        그 위에 100% 를 얹으면 기준이 없는 백분율이 된다 — 스트립이 0 높이로 접힐 수 있는 자리다.
      -->
      <div
        v-show="!한줄 || 한줄지원"
        :class="한줄 ? '' : 'h-full min-h-0'"
      >
        <slot />
      </div>
    </div>

    <!--
      활성 줄 **아래**에 남은 줄들. 위쪽 줄과 같은 컴포넌트고, 테두리만 반대쪽에 긋는다 —
      선은 내용과 줄 사이에 한 겹이면 된다(위줄은 `border-b`, 아래줄은 `border-t`).
    -->
    <template v-if="줄보임">
      <lDock줄
        v-for="pane in 아래줄s"
        :key="pane.id"
        :pane="pane"
        :활성="false"
        class="border-t border-default"
        @열기="activate(pane.id)"
      />
    </template>
  </aside>
</template>

<script setup lang="ts">
import type { DockPaneOptions } from '~/composables/useDock'

// `vars` 는 안 받는다 — 도크 변수를 쓰는 건 셸(`:style="dockVars"`)이고,
// 여기서 받던 유일한 이유였던 `:root` 받아 적기가 없어졌다(아래 주석).
const {
  open, visiblePanes, activePane, 한줄,
  activate, close, isActive, 접기, 한줄토글
} = useDock()

function labelOf(pane: DockPaneOptions) {
  return toValue(pane.label)
}

const 한줄지원 = computed(() => !!activePane.value?.한줄있음)

/**
 * 줄 목록은 **마운트된 뒤에만** 그린다.
 *
 * pane 은 슬롯 안에서 자기를 신고하는데(`useDockPane` 은 setup 에서 레지스트리를 갈아끼운다),
 * 서버에서는 그 신고가 **이 컴포넌트의 템플릿을 그리는 도중에** 일어난다 —
 * 슬롯보다 앞에 있는 `위줄s` 는 빈 레지스트리를 보고, 뒤에 있는 `아래줄s` 는 그때까지 신고된 것만 본다.
 * 클라이언트는 자식이 마운트되기 전에 부모 vdom 을 다 만들어서 양쪽 다 빈 목록이 되고,
 * 그래서 서버 DOM 이 클라 vdom 보다 자식이 많아진다("Hydration children mismatch" — 실측: 서버 1줄/클라 0줄,
 * 서버에 남던 한 줄은 슬롯의 마지막인 `l테마` 였다).
 *
 * 도크는 서버에서 **늘 닫혀 있으므로**(`useState('dock:open', () => false)`) 서버가 줄을 그릴 이유가 없다.
 * 양쪽 다 안 그리게 맞춰두면 불일치가 사라지고, 목록은 마운트 직후 등록이 끝난 레지스트리로 한 번에 선다.
 */
const 마운트됨 = ref(false)
onMounted(() => {
  마운트됨.value = true
})
const 줄보임 = computed(() => 마운트됨.value && !한줄.value)

/**
 * 목록을 활성 줄에서 자른다 — 내용이 **고른 줄 바로 아래**에 오게 하려고.
 * `activePane` 은 지목이 사라지면 첫 줄로 흘러내리므로(`useDock`) `findIndex` 가 -1 이면
 * 보일 줄 자체가 없는 때다. 그때는 위가 비고 아래도 비어서 목록이 통째로 안 그려진다.
 */
const 활성순번 = computed(() => visiblePanes.value.findIndex(p => p.id === activePane.value?.id))
const 위줄s = computed(() => visiblePanes.value.slice(0, 활성순번.value + 1))
const 아래줄s = computed(() => visiblePanes.value.slice(활성순번.value + 1))

function 한줄로() {
  접기()
}

/*
 * 한때 `--dock-peek`·`--dock-inset-bottom` 을 `:root` 에도 받아 적었다. **텔레포트로 셸 밖에
 * 나간 것**이 인라인 변수를 못 물려받아서였고, 그 유일한 소비자가 좁은 화면의 상세(`mPopup is화면`)였다.
 * 상세가 셸 안(`mBox반응형` 의 트랙)으로 돌아오면서 셸 밖 소비자가 없어졌다 —
 * 네 셸(`default`·`layout-test`·`layout-v2`·`layout-p`)이 다 루트에 `:style="dockVars"` 를 달고 있으므로
 * 도크 자신을 포함해 안쪽은 전부 상속으로 받는다. 값의 주인은 `useDock` 하나다.
 */
</script>

<template>
  <!-- max-h-[calc(100dvh-var(--ui-header-height))] -->
  <!-- @container -->

  <!-- --container-8xl -->
  <mBox유리

    class=" w-full h-full max-w-(--ui-container) mx-auto  overflow-y-auto min-h-0"
    :is투명="is미니"
    :class="[props?.ui?.root
    //  is열림 ? 'bg-red-500!' : 'bg-blue-500!'
    ]"
  >
    <template #top>
      <slot name="top" />
    </template>
    <template #bot>
      <slot name="bot" />
    </template>
    <!--
          **여기서 폭을 재지 않는다.** 판정은 `useResponsive()`(`useBreakpoints` → `matchMedia`)가
          한다 — 재는 방식이면 `:is투명` 이 이 요소의 조상을 바꾸므로 판정이 자기 결과에 물린다.
        -->
    <div class="h-full w-full">
      <!--
              좁은 화면: 목록과 상세가 **한 트랙 위에 나란히** 있고, 선택이 트랙을 민다.

              예전엔 상세가 `mPopup` 으로 셸 밖(텔레포트)에 나가서 화면 전체를 덮는 판이 됐다.
              그러면 **자리를 스스로 계산해야 한다** — 헤더 아래부터 도크 「한 줄」 위까지를
              `top-[var(--ui-layout-header-offset)] bottom-[var(--dock-inset-bottom)]` 로 다시 그리고,
              셸 밖에서는 그 변수가 안 물려지니 `lDock`·`layout-v2` 가 `:root` 에 값을 한 번 더 적었다.
              여기 그대로 두면 그 사각형은 **부모가 이미 잡아준 것**이라 아무것도 계산하지 않는다.

              밀어서 바꾸는 이유는 전이 효과가 아니라 **말이 맞아서**다. 이건 위에 얹힌 층이 아니라
              옆 칸이고(그래서 `층`을 안 쓴다 — 층은 덮는 것의 어휘다), 목록에서 행을 골라 상세로
              「넘어가는」 그 개념이 화면에서 그대로 보인다. 목록이 언마운트되지 않으니 스크롤 위치도
              설계상 남는다(예전엔 뒤에 깔려 있어서 우연히 유지됐다).
            -->
      <div
        v-if="is미니"
        class="relative h-full w-full overflow-hidden"
      >
        <div
          class="h-full w-full transition-transform duration-250 ease-out"
          :class="is열림 ? '-translate-x-full' : ''"
        >
          <slot
            name="left"
            :is미니="is미니"
          />
        </div>
        <!-- 면이 불투명하지 않으면 미는 동안 뒤의 목록이 비친다. -->
        <div
          class="absolute inset-0 h-full w-full px-2 md:px-4 bg-default transition-transform duration-250 ease-out"
          :class="is열림 ? '' : 'translate-x-full'"
          :aria-hidden="!is열림"
        >
          <slot
            name="right"
            :is열림="is열림"
            :is미니="is미니"
          />
        </div>
      </div>

      <mSplitter
        v-else
        v-model="ratio"
        :can수정="is수정중"
        :reverse="props.reverse"
      >
        <template
          v-if="ratio>0"
          #left
        >
          <slot
            name="left"
            :is미니="is미니"
          />
        </template>
        <template
          v-if="ratio<99"
          #right
        >
          <slot
            name="right"
            :is미니="is미니"
          />
        </template>
      </mSplitter>
    </div>
  </mBox유리>
</template>

<script lang="ts">
</script>

<script setup lang="ts">
interface i기타 {
  reverse?: boolean
  is수정중?: boolean
}
interface Props {
  ui?: { root?: string }
}

const ratio = defineModel<number>('ratio', { default: 40, required: true })

/**
 * **좁은가.** `useResponsive()` 한 곳에서만 나온다 — `useBreakpoints` 는 `matchMedia` 이므로
 * 레이아웃을 되재지 않고(물림이 없다), `ssrWidth` 로 첫 HTML 도 UA 기준으로 맞게 그려진다.
 * 예전엔 이 상자의 실측 폭(`useResponsive2`)으로 정하면서 판정 → 면 → 폭 → 판정 이 물려 떨었다.
 *
 * 소비자(`목록5`·`Input/카드s`)도 같은 컴포저블을 직접 부른다 — `v-model:is미니` 왕복이 없다.
 */
const { is미니 } = useResponsive()

/**
 * 상세 쪽이 열려 있나. **예전 이름은 `isPopup` 이었다** — 팝업으로 구현돼 있을 때 붙은 이름이고,
 * 그 팝업이 없어졌으므로 이름도 같이 간다. 값의 뜻은 그대로다(목록5 에서는 `selectedId` 파생).
 */
const is열림 = defineModel<boolean>('is열림', { default: false })

const props = withDefaults(defineProps<Props & i기타>(), {
  reverse: false,
  is수정중: false
})
</script>

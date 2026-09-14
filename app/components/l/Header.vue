<template>
    <!-- UHeader 는 루트가 여러 개라 Transition 이 헤더 DOM 에 클래스를 못 붙임 → 단일 래퍼에 슬라이드 적용 -->
    <Transition  appear :css="is모션" name="l-header-from-top">
        <div ref="headerWrapRef" class="l-header-wrap" :class="headerWrapClass">
            <!--
                `mode="drawer"` — 모바일 메뉴는 **바닥에서 올라오는 서랍**이다. Nuxt UI 기본값은
                `modal` + `fullscreen` 이라 링크 예닐곱 개에 화면을 통째로 쓰고, 엄지에서 제일 먼
                위쪽부터 채운다. 서랍은 아래에서 올라오고 필요한 만큼만 높다.
                (`drawer` 는 시트 안에 로고·우측 아이콘 줄을 다시 안 그린다 — `props.mode !== 'drawer'`.
                 바가 그대로 보이는 채로 덮이니 두 벌이 될 이유가 없다.)
            -->
            <UHeader
                v-model:open="메뉴열림"
                :ui="ui"
                mode="drawer"
                :toggle-side="토글자리"
            >
                <!--
                    햄버거 자리. 안 넘기면 Nuxt UI 기본 아이콘 버튼이 그대로 선다 —
                    `v-if` 가 없으면 빈 템플릿이 기본값을 덮어 **모바일에서 메뉴를 못 연다.**
                    `default` 레이아웃은 여기에 「지금 섹션 이름 ▾」 을 끼운다.
                -->
                <template
                    v-if="$slots.toggle"
                    #toggle="toggleProps"
                >
                    <slot
                        name="toggle"
                        v-bind="toggleProps"
                    />
                </template>
                <template #top>
                    <slot name="top"></slot>
                </template>
                <template #title>
                    <slot name="title">
                        <Logo  class="h-6 w-auto" />
                    </slot>
                </template>

                <slot></slot>

                <template #left>
                    <slot name="left"></slot>
                </template>
                <template #right>
                    <slot name="right"></slot>
                </template>

                <template #body>
                    <slot name="mobile"></slot>
                </template>

            </UHeader>

            <!--
                바 **밑에 매달리는** 한 줄. 규율 둘이 같이 지켜져야 한다 —

                1. **바의 높이에 안 들어간다** (`absolute top-full`). 래퍼가 `relative` 라 여기 붙고,
                   `useElementSize(headerWrapRef)` 는 절대 배치된 자식을 안 세므로
                   **`--ui-layout-header-offset` 이 안 움직인다.** 그래서 이 줄이 생기고 없어져도
                   본문이 위아래로 안 밀리고, 그 변수를 읽는 도크·페이지 서른 곳이 아무 일도 안 겪는다.
                   (한 번 흐름 안에 넣어 봤다가 되돌렸다. 헤더가 64→99px 로 커지면서 본문이 통째로
                   내려갔고, 실측이 한 프레임 늦게 오는 바람에 그 사이 화면이 넘쳐 흘렀다.)
                2. **화면 폭을 통째로 쓴다** (`inset-x-0`). 바의 가운데 슬롯은 역할 탭·로고와
                   테마/로그인/도크가 나눠 써서 1280px 창에서 **521px** 뿐이다 — 자식 여섯짜리
                   섹션이 안 들어간 게 그림 탓이 아니라 그 폭 탓이었다. 여기는 **1280px** 을 다 쓴다.

                흐름 밖이라 **자기 면을 들어야 한다** — 본문 위에 얹히기 때문이다. 그 면은 줄 쪽
                (`lNavigationMenu2`)이 그린다: 불투명한 바닥 + 층 1. 바의 그림자는 이 줄이 가리고,
                이 줄이 대신 아래로 드리운다 — 그래야 두 줄이 한 물건으로 읽힌다.
                내용이 없으면 빈 div 라 아무것도 안 보인다.
            -->
            <div class="pointer-events-none absolute inset-x-0 top-full">
                <div class="pointer-events-auto">
                    <slot name="bottom"></slot>
                </div>
            </div>
        </div>
    </Transition>
    <div
        v-if="shouldReserveHeaderSpace"
        aria-hidden="true"
        class="pointer-events-none w-full shrink-0"
        :style="{ height: `${Math.round(headerStackHeight * 100) / 100}px` }"
    ></div>

</template>


<script setup lang="ts">
import { depthClass, type DepthLayer } from '~utils/theme/축'

interface Props{
    hide_on_load?: boolean
    is투명?: boolean
    is모션?: boolean
    /**
     * **몇 번 층인가** — `0` 종이(선만) · `1` 카드(기본) · `2` 떠있음 …
     * 값은 그림자 축이 정한다 (`m/테마/그림자.ts`). 옛 `elevation` prop 을 대신한다.
     */
    층?: DepthLayer
    is고정?:boolean
    /**
     * 햄버거(모바일 토글)가 서는 쪽. 기본은 Nuxt UI 와 같은 `right`.
     * 「지금 섹션 이름」을 이 자리에 놓는 레이아웃은 `left` 로 옮긴다 — 오른쪽엔 이미 아이콘 셋
     * (테마·로그인·도크)이 서 있어서 390px 에서 라벨이 들어갈 폭이 없고, 「지금 어디」는
     * 먼저 읽히는 자리에 있어야 한다.
     */
    토글자리?: 'left' | 'right'
}
/**
 * 모바일 메뉴(서랍) 열림. **여기서 드는 유일한 화면 상태**다 — 내비 자체는 라우트에서 파생되고
 * (`lNavigationMenu2`), 이건 서랍 하나의 여닫이다. 라우트가 바뀌면 `UHeader` 의 `autoClose` 가
 * 닫지만, 지금 있는 섹션을 다시 누르는 경우는 호출부가 이 모델로 닫는다.
 */
const 메뉴열림 = defineModel<boolean>('open', { default: false })

const props = withDefaults(defineProps<Props>(), {
    hide_on_load:false,
    is투명:false,
    is모션:true,
    is고정:false,
    층: 1,
    토글자리: 'right',
})
import { ref, onBeforeMount, watch, onUnmounted, computed } from 'vue'
import { useElementSize, useWindowScroll } from '@vueuse/core'

/** 투명 헤더 + `default` 레이아웃 흰 글자 동기화 */
const TRANSPARENT_HEADER_SCROLLED_KEY = 'l-header-transparent-scrolled'
const TRANSPARENT_SCROLL_THRESHOLD_PX = 12

const { y: windowScrollY } = useWindowScroll()
const isTransparentHeaderScrolled = useState(TRANSPARENT_HEADER_SCROLLED_KEY, () => false)

watch(
    [() => props.is투명, windowScrollY],
    () => {
        if (!props.is투명) {
            isTransparentHeaderScrolled.value = false
            return
        }
        isTransparentHeaderScrolled.value = windowScrollY.value > TRANSPARENT_SCROLL_THRESHOLD_PX
    },
    { immediate: true },
)

/** `#top` 배너 + 내비 전체 높이 — `Main`/히어로 `calc(100dvh - …)` 가 테마 한 줄만 빼던 불일치 보정 */
const HEADER_OFFSET_VAR = '--ui-layout-header-offset'

const isBaseReady = ref(!false); //에러날 수 있음.. 
onBeforeMount(() => {
    isBaseReady.value = true;
});

const headerWrapRef = ref<HTMLElement | null>(null)
const { height: headerStackHeight } = useElementSize(headerWrapRef)

watch(
    headerStackHeight,
    (h) => {
        if (h <= 0) return
        document.documentElement.style.setProperty(
            HEADER_OFFSET_VAR,
            `${Math.round(h * 100) / 100}px`,
        )
    },
    { flush: 'post', immediate: true },
)

onUnmounted(() => {
    document.documentElement.style.removeProperty(HEADER_OFFSET_VAR)
})

const _ui = ''

/**
 * 층. 예전엔 `STATIC_HEADER_ELEVATION = 123` 이라는 상수를 `normalizeElevation` 에 넣어
 * (유효하지 않은 값 → 기본값) 결국 `shadow-sm` 을 얻는 우회로였다. 지금은 층 하나로 끝나고,
 * 몇 px 인지는 그림자 축이 정한다.
 */
const 층 = computed(() => (props.is투명 ? 0 : props.층))

const appliedElevationClass = computed(() => depthClass(층.value))

/**
 * 선. 그림자가 있으면 **한 단 뒤로 뺀다** — 경계를 알리는 채널이 둘(그림자·선)이 되니 선이
 * 다 짊어질 이유가 없다. 그림자가 없으면 선이 유일한 채널이라 제 농도를 쓴다.
 * `mBox종이`(`m/Box/종이.vue` 의 `선`)·`mBox유리` 와 같은 규칙이고, 셋 다 **구조선 토큰**
 * (`border-default`)을 쓰니 **선 진하기 축이 여기까지 걸린다.**
 *
 * 2026-09-09 전까지 여기만 `border-0 outline-none` 으로 선을 **통째로 지웠다.** 층 1이 기본이고
 * 레이아웃도 1을 넘기니(`default.vue`) 헤더엔 선이 아예 없었고, 그래서 선 진하기를 굴려도
 * 아무 일이 안 일어났다. 「`mBox종이` 와 같은 규칙」이라는 주석은 그 동작(`87179cf`, 2026-05-11)보다
 * **넉 달 뒤**(`58a25fb`)에 붙은 사후 라벨이었다 — 종이는 낮추는데 여기는 지웠으니 방향이 반대였다.
 */
const 선농도 = computed(() => (층.value > 0 ? 'border-default/50' : 'border-default'))




/** fixed 는 래퍼에 둠(슬라이드 transform 과 충돌·다중 루트 이슈 방지) */
const headerWrapClass = computed(() =>
    (props.is투명 || props.is고정) ? 'fixed inset-x-0 top-0 z-50 w-full' : 'relative z-50 w-full'
)
const shouldReserveHeaderSpace = computed(() => props.is고정 && !props.is투명)

const ui = computed(() => {
    /**
     * #top(배너) + 내비를 같이 쓸 때 기본 theme root 의 h-(--ui-header-height) 때문에
     * 두 줄이 한 줄 높이에 눌리거나 넘쳐 내비가 헤더 배경 박스 밖으로 나가 히어로가 비침.
     * 또한 bg-black/10 단독은 theme 의 bg-default/75·backdrop-blur 를 덮어 유리막이 사라짐.
     */
    const rootLayout = '!h-auto !max-h-none flex w-full flex-col'
    const barRow = 'min-h-(--ui-header-height) h-auto shrink-0'
    /**
     * **폭은 안 적는다.** `UContainer` 의 base 가 이미 `max-w-(--ui-container)` 이고, 그 값이
     * 본문 셸·페이지가 다 같이 읽는 하나뿐인 자다(`main.css` 「본문 자」). 여기서 리터럴을 얹으면
     * tailwind-merge 가 그 base 를 걷어내서, **이 파일만 몰래 다른 폭을 갖게 된다** — 실제로
     * 「`app.config` ui.container 의 1376px 기준과 동일」이라는 주석을 달고 `max-w-[1440px]` 이
     * 박혀 있었다. 셋 다 사실이 아니었고(그 설정은 통째로 주석), 그래서 바가 본문보다 넓었다.
     *
     * 대신 **가로 패딩만 되돌린다.** base 의 `px-4 sm:px-6 lg:px-8` 을 두면 폭은 같은데 안쪽만
     * 32px 좁아서, 바 양 끝(왼쪽 역할 탭·오른쪽 도크 여닫이)이 아래 카드 모서리보다 안으로 들어간다.
     * 본문 카드(`mBox반응형`)는 가로 패딩이 없다 — 상자 대 상자로 맞춘다.
     */
    const containerMax = 'mx-auto w-full px-0 sm:px-0 lg:px-0'

    if (props.is투명) {
        const atTop = !isTransparentHeaderScrolled.value
        /** 스크롤 후 내비·로고가 화면 끝에 붙어 보이지 않게 가로 패딩 */
        const containerPadX = atTop
            ? 'px-4 sm:px-5 lg:px-6'
            : 'px-5 sm:px-7 lg:px-9'
        const rootBar = atTop
            ? [
                  rootLayout,
                  /* theme 기본 bg·backdrop 과 겹치지 않게 완전 투명 */
                  '!static !bg-transparent !backdrop-blur-none text-white',
                  /* 히어로 위에선 그을 경계가 없다 — 폭만 잡아 두고 색은 스크롤될 때 든다 */
                  'border-b border-transparent',
                  appliedElevationClass.value,
                  'transition-[background-color,backdrop-filter,border-color] duration-300 ease-out',
              ].join(' ')
            : [
                  rootLayout,
                  /* 반투명+블러 제거: 히어로/셸 배경과 이중으로 스며드는 느낌 방지 */
                  '!static bg-page',
                  `border-b ${선농도.value}`,
                  appliedElevationClass.value,
                  'transition-[background-color,backdrop-filter,border-color] duration-300 ease-out',
              ].join(' ')
        return {
            root: rootBar,
            container: [barRow, containerMax, containerPadX].join(' '),
        }
    }
    return {
        root: [
            rootLayout,
            '!static bg-page/50',
            `border-b ${선농도.value}`,
            appliedElevationClass.value,
        ].join(' '),
        container: [barRow, containerMax].join(' '),
    }
});

</script>

<style scoped>
/* 래퍼 단일 루트에만 붙음 — :deep 불필요 */
.l-header-from-top-enter-active {
    transition:
        transform 0.55s cubic-bezier(0.22, 1, 0.36, 1),
        opacity 0.4s ease;
}
.l-header-from-top-enter-from {
    opacity: 0;
    transform: translate3d(0, -100%, 0);
}
.l-header-from-top-enter-to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
}
</style>

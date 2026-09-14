<template>
  <!--
    오른쪽 `trailing` 슬롯은 신청 목록 머리(`view/신청받기목록.vue`)의 그 자리다 — 조건을 걸었을 때만 뜨는
    건수처럼, 제목과 같은 밑줄에 서는 짧은 말. 버튼은 여기가 아니라 아래 도구 줄에 둔다.
  -->
  <header class="flex flex-wrap items-end justify-between gap-x-6 gap-y-1">
    <div class="min-w-0">
      <!--
        눈썹은 **상위 묶음이 따로 있을 때만** 뜻이 있다(「회원 > 등급」의 회원).
        제목과 같은 말이면 안 그린다 — 같은 글자를 크기만 달리해 두 번 적는 게 이 자리의 오래된 버릇이었다.
      -->
      <p
        v-if="눈썹"
        class="text-xs text-dimmed"
      >
        {{ 눈썹 }}
      </p>
      <!-- 히어로가 같은 제목을 이미 말했으면 줄째 뺀다(`useIsHeroTitle`) -->
      <h1
        v-if="!is히어로제목"
        class="font-semibold text-highlighted"
        :class="dense ? 'text-xl' : 'text-2xl'"
      >
        {{ title }}
      </h1>
      <p
        v-if="description"
        class="mt-1 max-w-3xl text-sm text-muted"
      >
        {{ description }}
      </p>
    </div>
    <slot name="trailing" />
  </header>
</template>

<script setup lang="ts">
import { useIsHeroTitle } from '~/composables/useLayoutHero'

/**
 * 페이지 머리 한 벌 — 제목 · (눈썹) · 설명.
 *
 * ## 2026-09-06 — 모래밭 어휘로 맞췄다
 *
 * 예전 모습은 랜딩페이지 관용구였다: 작은 **강조색** 눈썹 + `uppercase tracking-[0.12em]` +
 * `font-bold tracking-tight` 제목 + 손으로 적은 `dark:text-white`. 운영 화면 위에 얹히면
 * 그 화면만 튄다. 지금은 `/decisions/content/*` 가 쓰는 그 한 벌과 같은 값이다 —
 * `text-2xl font-semibold text-highlighted` + `mt-1 text-sm text-muted`.
 *
 * 무엇이 빠졌고 왜인지:
 *
 * - **강조색.** 눈썹은 누를 것도 급한 것도 아니다. 색을 갖는 역할은 `강조` 하나뿐이고
 *   (CLAUDE.md 「테마」), 여기 색을 두면 강조색 축을 돌릴 때 눈썹만 요란하게 따라 돈다.
 * - **`uppercase` · 자간.** 한글에서 `uppercase` 는 아무 일도 안 하고 자간만 벌어져 이름이 흩어진다.
 *   예전에도 `dense` 에서만 껐는데, 끄는 게 맞으면 늘 꺼야 한다.
 * - **`dark:text-white`.** 토큰이 이미 모드별로 갈린다 — `text-highlighted` 한 개와 같은 뜻이다.
 * - **반응형 자간·간격 사다리(`@container`).** 머리 하나 그리는 데 컨테이너 쿼리가 필요하지 않았다.
 *
 * `dense` 는 크기 한 칸만 남겼다(목록 위에 얹힐 때 `text-xl`).
 *
 * ## 2026-09-14 — 방문자 목록 셋이 같은 머리를 쓴다
 *
 * 신청 목록이 자기 머리를 따로 그리고 있었고(`view/신청받기목록.vue` — 제목 옆 밑줄에 건수),
 * 자료·소통은 여기를 `dense` 로 썼다. 자료·소통을 신청 목록의 문법으로 맞추면서(`/decisions` 의 `목록-문법`)
 * 그 「제목 옆 자리」를 `trailing` 슬롯으로 열었다 — 걸렀을 때만 뜨는 건수가 거기 선다.
 * 크기는 그대로 `text-2xl font-semibold` 다(신청 목록의 `font-bold tracking-tight` 는 09-05 판이고,
 * 이 컴포넌트의 09-06 결정이 더 뒤다).
 */
const props = withDefaults(
  defineProps<{
    eyebrow?: string
    title?: string
    description?: string
    /** 목록 위에 얹히는 헤더용 — 제목을 한 칸 줄인다 */
    dense?: boolean
  }>(),
  {
    eyebrow: '',
    title: '페이지 제목',
    description: '',
    dense: false
  }
)

/** 제목과 같은 말이면 눈썹이 아니다. 앞뒤 공백만 다른 경우까지 같은 것으로 본다. */
const 눈썹 = computed(() => {
  const v = props.eyebrow?.trim() ?? ''
  return v && v !== (props.title?.trim() ?? '') ? v : ''
})

const is히어로제목 = useIsHeroTitle(() => props.title)
</script>

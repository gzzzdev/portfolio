<template>
  <ProseCallout
    color="neutral"
    :icon="icon || 'i-lucide-info'"
  >
    <slot mdc-unwrap="p" />
  </ProseCallout>
</template>

<script setup lang="ts">
/**
 * `::note` — **알림.** `@nuxt/ui` 의 `ProseNote` 를 **색만 바꿔** 대신한다(`info` → `neutral`).
 *
 * ## 왜 색을 내렸나
 *
 * 강조색이 본문에서 사는 자리를 `::point` 하나로 정하고 나니(그 파일 머리말), 기본 보충 박스가
 * 청록인 게 방해가 됐다 — 테마 기본 강조색이 파랑이라 **둘이 나란히 있으면 거의 안 갈린다**
 * (2026-09-05 모래밭 실측). 요점을 하나만 두기로 해 놓고 옆 칸이 비슷한 색이면 그 하나가 안 산다.
 *
 * 뜻으로도 이쪽이 맞다. `note` 의 `쓸때` 가 "읽고 지나가도 되는 보충"이다.
 * **조용해야 하는 칸에 색이 있을 이유가 없다.** `neutral` 은 `@nuxt/ui` 에서 색 램프가 아니라
 * 시맨틱 토큰(`bg-muted`·`border-muted`·`text-default`)으로 그려지므로 재질·색온도 축을 그대로 탄다.
 *
 * 남은 색 규칙은 한 줄이다 — **본문에서 색을 갖는 칸은 `::point` 하나.**
 *
 * ## 왜 `ProseNote` 를 못 고쳤나
 *
 * `ProseNote.vue` 가 `color="info"` 를 **박아서** 넘긴다. `app.config.ts` 의 `ui.prose.callout` 은
 * tv 테마(클래스)를 덮는 자리라 컴포넌트가 넘기는 prop 은 못 바꾼다. 그래서 이름표를 바꿔 끼운다 —
 * `nuxt.config.ts` 의 `mdc.components.map` 이 `note` 를 `ProseNote` 대신 이 파일로 보낸다.
 * (`info` 색 자체를 회색으로 재정의하는 길도 있지만, 그러면 색 이름이 거짓말을 하게 된다.)
 */
interface Props {
  /** 기본 아이콘 대신 쓸 것(`i-lucide-*`). 대개 생략한다. */
  icon?: string
}
defineProps<Props>()
</script>

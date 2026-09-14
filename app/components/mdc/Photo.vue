<template>
  <figure
    class="mx-auto my-5"
    :class="폭"
  >
    <div class="overflow-hidden rounded-lg bg-muted ring-1 ring-default m-층-카드">
      <NuxtImg
        :src="src"
        :alt="alt || ''"
        class="w-full object-cover"
        :style="ratio ? { aspectRatio: ratio } : undefined"
        loading="lazy"
      />
    </div>
    <figcaption
      v-if="$slots.default"
      class="mt-2 text-center text-sm text-muted"
    >
      <slot />
    </figcaption>
  </figure>
</template>

<script setup lang="ts">
/**
 * `::photo` — 본문 사진 한 장. **어댑터다** (`utils/mdc/blocks.ts` 머리말의 그 어댑터 층).
 *
 * **이름이 `frame` 이 아닌 이유**: `frame` 은 브라우저가 아는 태그라(frameset 시절의 유물)
 * 컴포넌트로 안 잡히고 `<frame>` 으로 나가 통째로 사라진다. 경고도 안 뜬다.
 * `figure`·`picture`·`img` 도 같은 이유로 못 쓴다 (2026-09-05 실측).
 *
 * 새 디자인이 아니라 `NuxtImg` 를 감싸 캡션과 테두리만 얹는다. 하는 일은 정확히
 * **md 문자열 속성 → 안전한 props 부분집합** 이고, 그래서 `class`·`style`·`width` 를 안 받는다.
 * 크기는 임의 값이 아니라 `size` 세 단계 중에서 고르고, 면·선·층은 축이 정한다
 * (`bg-muted` · `ring-default` · `m-층-카드`).
 *
 * **기본이 `md` 인 이유** — 예전엔 본문 폭을 끝까지 채웠는데, 넓은 본문에서 가로 사진 한 장이
 * 화면을 통째로 덮었다(2026-09-14). 크게 보여야 하는 사진만 `size="full"` 로 편다.
 *
 * **층 1 을 다는 이유** — 사진은 글이 아니라 글 위에 얹힌 물건이다. 그림자 사다리는 「어디에
 * 있는지」를 안 묻으므로(`mTheme.css` 그림자 블록) 본문 안이라고 층이 내려가지 않는다.
 * 알림·표·코드는 반대쪽이라 안 단다 — 그건 문장에 띠를 두른 것이지 얹힌 물건이 아니다.
 *
 * `mImage` 를 안 쓴 이유: 그건 폼 미리보기용 로딩 래퍼라 기본 클래스가 `h-full` 이다
 * (칸 높이에 맞춰 줄어드는 게 맞는 자리). 본문 사진은 반대로 **제 비율대로 눕는** 게 맞고,
 * `NuxtImg` 는 `nuxt.config` 의 이미지 파이프라인(avif/webp·quality 75·densities)을 탄다.
 *
 * 캡션은 속성이 아니라 **본문**이다 — 캡션에 링크나 강조가 들어갈 수 있는데
 * 속성 문자열로는 마크다운이 안 먹는다.
 */
import { computed } from 'vue'

interface Props {
  /** 그림 주소. `/img/...`(public) 또는 업로드 경로. */
  src: string
  /** 대체 텍스트. 안 적으면 빈 값 — 장식용 그림이라는 뜻이 된다. */
  alt?: string
  /**
     * `16/9` 처럼. 안 주면 원본 비율대로 눕는다.
     *
     * **속성 이름이 한글이면 안 된다** — `비율` 로 뒀다가 2026-09-05 에 파서로 확인했다.
     * `remark-mdc` 는 속성 이름 첫 글자에 `asciiAlpha`(또는 `:`·`_`)만 허용하고,
     * 안 맞으면 그 속성만 빠지는 게 아니라 **`::photo` 줄 전체가 평범한 문단으로 떨어진다.**
     * 블록 이름과 같은 제약이다(`utils/mdc/blocks.ts` 머리말). 값은 한글이어도 된다.
     */
  ratio?: string
  /**
   * `sm` · `md` · `full`. 안 주거나 모르는 값이면 `md`.
   * 폭 상한일 뿐이라 `나란히` 칸처럼 이미 좁은 자리에서는 칸을 채운다.
   */
  size?: string
}
const props = defineProps<Props>()

const 폭s: Record<string, string> = { sm: 'max-w-sm', md: 'max-w-2xl', full: 'w-full' }
const 폭 = computed(() => 폭s[props.size ?? ''] ?? 폭s.md)
</script>

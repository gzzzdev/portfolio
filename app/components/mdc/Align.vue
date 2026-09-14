<template>
  <div :class="정렬클래스">
    <slot />
  </div>
</template>

<script setup lang="ts">
/**
 * `::align{to="center"}` — **문단을 어디에 놓을까.** 가운데·오른쪽·양쪽.
 *
 * ## 왜 컨테이너인가 (2026-09-06)
 *
 * 정렬은 문단 하나에 거는 서식이라 문단의 **속성**이었으면 좋았을 것이다. 그런데 저장이 md 라
 * 문단은 속성을 실을 자리가 없다. 세 가지를 실제로 재 봤고(`@nuxtjs/mdc` 파서·stringify 왕복),
 * 컨테이너만 살아 돌아왔다.
 *
 * | 적는 법 | 결과 |
 * |---|---|
 * | `글.{align="center"}` | 파서가 **글자로** 읽는다 — 중괄호가 본문에 그대로 남는다 |
 * | `<p style="text-align:center">` | 파싱은 되는데 stringify 가 `style` 을 **통째로 버린다** |
 * | `::align{to="center"}` | 왕복 무손실 |
 *
 * 컨테이너라서 덤으로 얻는 것도 있다 — 여러 문단을 한 번에 고르면 **묶음 하나**로 감싸진다.
 * 문단 속성이었으면 문단마다 따로 붙었을 것이다.
 *
 * ## 여백을 안 준다
 *
 * `::note`·`::photo` 와 다르게 `my-5` 가 없다. 이건 **보이는 상자가 아니라 자리만 옮기는 껍데기**라
 * 자기 여백이 있으면 안 되고, 테두리·안쪽여백이 없으니 안쪽 문단의 `my-5` 가 껍데기를 통과해
 * (margin collapsing) 정렬 안 한 문단과 같은 간격이 된다. 편집판도 같은 이유로 여백이 없다.
 */
import { computed } from 'vue'
import { 정렬클래스of } from '~utils/mdc/blocks'

interface Props {
  /** `center` · `right` · `justify`. 그 밖은 왼쪽으로 본다. */
  to?: string
}
const props = defineProps<Props>()

const 정렬클래스 = computed(() => 정렬클래스of(props.to))
</script>

<template>
  <div class="w-full overflow-x-hidden">
    <UInput
      v-model="model"
      type="tel"
      inputmode="tel"
      autocomplete="tel"
      class="max-w-full"
      :ui="ui읽기(readonly, inputUi)"
      :readonly="readonly"
    />
  </div>
</template>

<script setup lang="ts">
/**
 * 전화번호 한 줄. 값은 손대지 않고 그대로 담는다 — 자릿수·하이픈은 나라마다 다르고,
 * 이 앱은 아직 어느 모양으로 맞출지 정한 적이 없다. 다듬을 자리가 생기면 모델 setter다.
 *
 * `type="tel"` 은 모바일 키패드를 숫자로 띄우기 위한 것이지 검증이 아니다(브라우저는
 * tel 을 검증하지 않는다).
 *
 * 2026-09-05에 다시 썼다. 그전에는 `UInput` 이 주석 처리된 채 날 `<input>` 이었고,
 * 그래서 테마·`_ui` 를 하나도 안 탔다(테두리 없는 맨 텍스트로 그려졌다). `:ui` 를 native
 * input 에 넘기고 있었고, `<div>tel</div>` 이 박혀 있어 필드 라벨 옆에 영문 라벨이 하나 더
 * 붙었고, `readonly` 를 안 받아 **읽기모드에서도 고쳐졌다**. `model견본` 에 깔아놓고 보니
 * 다른 칸들과 혼자 달라서 드러났다.
 */
import { _ui, ui읽기 } from './_'

interface Props {
  readonly?: boolean
}

withDefaults(defineProps<Props>(), {
  readonly: false
})

const inputUi = {
  ..._ui,
  base: `${_ui.base} w-auto min-w-48 max-w-full field-sizing-content`
}

const model = defineModel<string | null>({ required: false, default: null })
</script>

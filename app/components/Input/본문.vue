<template>
  <mEditorMd
    v-model="model"
    :readonly="readonly"
  />
</template>

<script setup lang="ts">
/**
 * **폼 칸 「본문」의 자리.** 안에 서는 것은 `mEditorMd` 고, 이 파일이 하는 일은 그 자리를 갖는 것뿐이다.
 * 액자·`ClientOnly`·md 왕복은 전부 그쪽이 진다(`m/Editor/md.vue` 머리말).
 *
 * **통과만 하는 파일이 왜 있나** — 폼 칸은 **이름 문자열로 해석된다.** `ORM.ts` 의
 * `문자md: { name: 'Input본문' }` 을 `ORM.resolve.client.ts` 가 `resolveComponent` 로 세우고,
 * `view/1.ts` 의 `폭_전체` 도 같은 문자열을 본다. 그 이름은 `Input*` 여야 한다 — `기본타입` 열여덟 칸이
 * 다 그렇고, 한 칸만 `m` 을 가리키면 범용 부품 층에 폼 계약 때문에만 있는 파일이 앉는다.
 *
 * **`md` 접미가 여기 없는 이유** (2026-09-12): 예전 이름은 `Input본문md` 였고, `ORM.ts` 가
 * *「타입 이름은 `문자md` 인데 컴포넌트는 `Input본문md` 다」* 로 그 어긋남을 변명하고 있었다.
 * 변명의 근거가 **사람은 md 를 안 본다** 였는데, md 결속이 `mEditorMd` 로 내려간 지금은
 * 폼 칸이 아는 것도 「본문」 하나다. 저장 형식은 아래 층의 사정이라 이름에 안 나온다.
 */
interface Props {
  readonly?: boolean
}
withDefaults(defineProps<Props>(), { readonly: false })

const model = defineModel<string | null>({ required: false, default: null })
</script>

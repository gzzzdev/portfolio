<template>
  <!--
    디자인틀이 종이로 나가는 모습을 값과 함께 확인하는 자리.

    한때 이 페이지는 코드로 짜인 붙박이 렌더러에 props 를 손으로 물려 그렸다. 그 렌더러는
    좌표를 코드가 들고 있어서 여기서 볼 수 있는 것이 "고정된 구도 + 바뀐 값" 뿐이었다.
    지금은 구도도 표에서 온다 — `/admin/edit/design-templates` 에서 상자를 끌면 이 화면이 따라 바뀐다.
  -->
  <div class="flex flex-col gap-3 p-4">
    <div class="flex items-center gap-2 text-xs text-muted">
      <USelect
        v-model="용도"
        :items="용도items"
        size="xs"
        class="w-40"
      />
      <span v-if="틀">{{ 틀.이름 }} · {{ 틀.규격.이름 }}</span>
      <span v-if="틀 && 틀.면s.length > 1">
        · <button
          class="underline"
          @click="면 = 면 ? 0 : 1"
        >{{ 틀.면s[면]?.라벨 }} 면</button>
      </span>
      <!-- 실제 발급은 값이 없는 자리를 비운 채 내보낸다. 그 차이를 눈으로 보라고 둔 토글이다 -->
      <label class="flex items-center gap-1">
        <UCheckbox v-model="예시허용" />
        예시로 채우기
      </label>
    </div>

    <p
      v-if="!트리"
      class="text-sm text-dimmed"
    >
      {{ 틀 ? '이 디자인틀에 그 면이 없습니다.' : `${용도} 디자인틀이 없습니다. /edit/design-templates 에서 하나 만드세요.` }}
    </p>
    <view렌더
      v-else
      :model-value="트리"
    />
  </div>
</template>

<script setup lang="ts">
import { model디자인틀s, to디자인틀, 노출용도s, 미리보기폭, type i용도 } from '~models/test2'

definePageMeta({
  제목: '인쇄 디자인틀',
  설명: '표에서 온 구도로 상장·증서를 그려본다. 구도는 /edit/design-templates 에서 만든다.',
  상태: '실사용',
  쓰는곳: '발급 화면'
})

const 디자인틀s = model디자인틀s.getInstance()
await 디자인틀s.reads()

const 용도items = 노출용도s.map(k => ({ label: k, value: k }))
const 용도 = ref<i용도>(노출용도s[0] ?? '등급증')
const 면 = ref(0)
const 예시허용 = ref(true)

const 틀 = computed(() => 디자인틀s.get사용중(용도.value)?.열기() ?? null)

/**
 * 값을 대지 않는다 — 여기서 보고 싶은 것은 배치이고, 실값은 `model회원.디자인틀주입` 의 몫이다.
 * 그래서 기본이 `예시허용` 이다. 끄면 실제 발급과 같은 상태(빈 자리는 빈 채로)가 보인다.
 */
const 트리 = computed(() => (틀.value
  ? to디자인틀(틀.value, {}, { 폭: 미리보기폭(틀.value.규격), 면: 면.value, 예시허용: 예시허용.value })
  : null))

watch(틀, () => { 면.value = 0 })
</script>

<template>
  <!--
    표식 생성. 배경 생성기(`생성배경.vue`)의 형제다 — 뽑고·기다리고·고르는 일만 같고
    (`useAIImage` · `m이미지후보s`) 어휘는 공유하지 않는다. 저쪽이 지질과 문양을 말한다면
    여기는 꼴과 자리와 획을 말한다. 그래서 `애셋고르기.vue` 안으로 합치지 않았다.

    **누끼도 보관도 여기서 하지 않는다.** 흰 바탕을 지우고 보관함에 넣는 일은 `패널표식.vue`
    가 `표식.url` 을 지켜보다 한다 — 목록에서 고른 그림과 방금 뽑은 그림이 그 한 자리로 모여야
    "이미 누끼를 거친 그림에 알파를 또 얹는" 일이 안 생긴다. 이 컴포넌트가 하는 일은
    url 과 묘사를 표식에 물리는 것까지다.
  -->
  <div class="flex flex-col gap-2">
    <!--
      칩은 설정이 아니라 문장 삽입기다. 누르면 그 원형의 문구가 아래 칸에 그대로 박히고,
      사용자는 뒤에 덧붙이거나 통째로 고친다. 그래서 활성 표시의 근거도 따로 없다 —
      칸에 든 문장이 그 원형의 것과 같은 동안만 켜져 있다. (배경 쪽과 같은 규칙)
    -->
    <div class="flex flex-wrap items-center gap-1">
      <mButton
        v-for="원형 in 표식원형s"
        :key="원형.key"
        size="xs"
        class="rounded-full"
        :켜짐="묘사 === 원형.묘사"
        :title="원형.묘사"
        @click="묘사 = 원형.묘사"
      >
        {{ 원형.이름 }}
      </mButton>

      <div class="grow" />

      <!-- 배경 쪽과 같은 자리·같은 규칙이다 (`생성배경.vue` 의 그 버튼) -->
      <mButton
        size="xs"
        class="rounded-full"

        icon="i-lucide-sparkles"
        :loading="문장짓는중"
        :disabled="isLoading"
        title="칸에 적은 말을 영문 표식 묘사로 바꿔 씁니다"
        @click="do문장짓기"
      >
        AI 문장
      </mButton>
    </div>

    <p
      v-if="문장오류"
      class="text-xs text-error"
    >
      {{ 문장오류 }}
    </p>

    <form
      class="flex items-start gap-1.5"
      @submit.prevent="do생성"
    >
      <UTextarea
        v-model="묘사"
        :rows="2"
        size="sm"
        autoresize
        class="flex-1"
        :disabled="isLoading"
        placeholder="원형을 고르거나, 표식의 꼴 · 자리 · 획 · 색을 영어로 적으세요"
      />
      <mButton
        type="submit"
        size="sm"

        icon="i-lucide-sparkles"
        :loading="isLoading"
      />
    </form>

    <m이미지후보s
      v-model="model"
      :후보s="후보s"
      :로딩="isLoading"
      :오류="error"
      :개수="생성개수"
      안내="원형을 고르고 만들면 2장을 뽑아 드려요. 마음에 드는 걸 고르세요."
    />

    <div class="px-1 text-right text-xs text-muted">
      by AI
    </div>
  </div>
</template>

<script setup lang="ts">
import { AI표식묘사 } from './AI채우기'
import { 표식원형s, 표식지시문 } from './생성지시문'
import type { i용도 } from '~models/test2'

/** 한 번에 만들 후보 장수. 표식은 뽑을 때마다 획이 달라서 나란히 놓고 골라야 한다 */
const 생성개수 = 2

/**
 * 문장을 지을 때만 쓴다 — 지시문(`표식지시문`)은 용도를 안 본다. 같은 도장이 등급증에도
 * 회원증에도 얹히기 때문인데, 무엇을 그릴지 **고를** 때는 그 차이가 실제로 있다.
 */
const props = defineProps<{ 용도: i용도 }>()

/** 고른 표식 그림 (`i표식.url`). 부모가 여기에 누끼를 뜨고 보관함에 넣는다 */
const model = defineModel<string | null>({ required: false, default: null })
/**
 * 그 그림을 만든 문장 (`i표식.묘사`). 화면에 보이는 이 문장이 곧 서버로 가는 문장이고,
 * 표식이 그것을 들고 있어야 보관함에도 같이 실려 "같은 결로 다시 뽑기"가 성립한다
 * (범용 생성기에 얹혀 있던 동안 도장만 이게 없었다 — `표식원형s` 머리말).
 */
const 묘사 = defineModel<string>('묘사', { required: true })

const { 후보s, isLoading, error, 생성 } = useAIImage()

/** 문장 짓기는 그림 뽑기와 다른 호출이라 로딩·오류를 따로 든다 (`생성배경.vue` 와 같다) */
const { ask: 물음, isLoading: 문장짓는중, error: 문장오류 } = useAI()

async function do문장짓기() {
  try {
    const 새묘사 = await AI표식묘사(물음.lite, props.용도, 묘사.value)
    if (새묘사) 묘사.value = 새묘사
  } catch {
    // `useAI` 가 error 에 담아 두고, 칩 줄 아래 한 줄이 그걸 띄운다
  }
}

async function do생성() {
  const 새후보s = await 생성(묘사.value, {
    stylePrompt: 표식지시문,
    count: 생성개수,
    /**
     * **정사각으로 못 박는다.** 서버 기본은 `16:9` 라(`resolveAspectRatio`) 그냥 두면
     * 납작한 표식이 온다 — 표식은 정사각 rect 로 놓이고(`새표식`) `object-contain` 이라
     * 그 비율이 그대로 남는다. 배경처럼 `frameRatio` 로 갈 이유는 없다: 1:1 은
     * 상류 enum 에 이미 있는 값이라 빈 캔버스를 깔 필요가 없다.
     *
     * 꼴이 여럿이 된 뒤에도 하나로 두는 이유: 정사각은 모든 꼴이 쓸 수 있는 유일한 비율이다.
     * 모서리 리본은 정사각 대각선을 그대로 쓰고, 세로로 긴 로제트는 3:4 가 낫겠지만 놓이는
     * rect 가 정사각이라 `object-contain` 이 그만큼 letterbox 로 깎는다 — 비율을 원형마다
     * 받으려면 rect 도 같이 받아야 하고, 그건 이 층이 지금 하는 일이 아니다.
     */
    aspectRatio: '1:1'
  })

  if (새후보s.length === 1) model.value = 새후보s[0]!.url
}
</script>

<template>
  <!--
    배경 생성. 사진3(참고이미지)의 형제이지 자식이 아니다 — 뽑고·기다리고·고르는 일만
    같고(`useAIImage` · `m이미지후보s`) 프롬프트 어휘는 공유하지 않는다.
    저쪽이 렌즈와 조리개를 말한다면 여기는 지질과 문양을 말한다.
  -->
  <div class="flex flex-col gap-2">
    <!--
      칩은 설정이 아니라 문장 삽입기다. 누르면 그 원형의 문구가 아래 칸에 그대로 박히고,
      사용자는 뒤에 덧붙이거나 통째로 고친다. 그래서 활성 표시의 근거도 따로 없다 —
      칸에 든 문장이 그 원형의 것과 같은 동안만 켜져 있다.
    -->
    <div class="flex flex-wrap items-center gap-1">
      <mButton
        v-for="원형 in 배경원형s"
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

      <!--
        칩이 못 하는 몫. 원형은 여섯 가지뿐이라 "한지인데 좀 더 어둡게"를 적을 길이 없고,
        이 칸의 문장은 영문이어야 한다(`stylePrompt` 경로는 번역 단계를 건너뛴다).
        그래서 **칸에 든 한글을 재료로** 영문 두 줄을 지어 같은 칸에 박는다 — 칩과 같은 자리,
        같은 규칙이다(보이는 문장이 곧 나가는 문장). 빈 칸이면 용도만 보고 짓는다.
      -->
      <mButton
        size="xs"
        class="rounded-full"

        icon="i-lucide-sparkles"
        :loading="문장짓는중"
        :disabled="isLoading"
        title="칸에 적은 말을 영문 지질 묘사로 바꿔 씁니다"
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

    <!--
      규격이 바뀌어 이 그림이 더는 이 종이의 것이 아닐 때. 지우지 않고 권하기만 한다 —
      다시 뽑는 값이 비싸고, 사용자가 규격을 잠깐 둘러보는 중일 수도 있다.
    -->
    <div
      v-if="낡음"
      class="flex items-center gap-2 rounded-md bg-warning/10 p-2 text-xs text-warning"
    >
      <span class="flex-1">규격이 바뀌었습니다. 이 배경은 다른 비율로 만든 그림이라 잘리거나 늘어납니다.</span>
      <mButton
        size="xs"
        color="warning"

        :loading="isLoading"
        @click="do생성"
      >
        이 규격으로 다시
      </mButton>
    </div>

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
        placeholder="원형을 고르거나, 종이의 재질 · 문양 · 톤을 영어로 적으세요"
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
import { AI배경묘사 } from './AI채우기'
import { 배경낡음, 배경원형s, 배경지시문 } from './생성지시문'
import type { i규격, i배경, i용도 } from '~models/test2'
import { do애셋보관 } from '~models/test2'

/** 한 번에 만들 후보 장수. 종이는 뽑을 때마다 결이 달라서 나란히 놓고 골라야 한다 */
const 생성개수 = 2

/**
 * 규격과 용도 둘 다 지시문으로 간다. 용도는 **구도를 가르는 유일한 축**이다 —
 * 증서는 가운데를 비우고 네 변에 띠를 두르지만, 포스터는 전면을 채우는 것이 정상이고
 * 명함은 진한 단색 한 판이 기본이다 (`구도지시`).
 */
const props = defineProps<{ 규격: i규격, 용도: i용도 }>()

/** 고른 배경 그림 (`i배경.url`) */
const model = defineModel<string | null>({ required: false, default: null })
/**
 * 그 그림을 만든 문장 (`i배경.묘사`). 화면에 보이는 이 문장이 곧 서버로 가는 문장이고,
 * 저장돼 있어야 나중에 "같은 결로 다시 뽑기"가 성립한다. 저장된 디자인틀이 저마다 미리
 * 들고 있으므로 열어 둔 디자인틀은 빈 칸이 아니라 그 문장에서 시작한다.
 */
const 묘사 = defineModel<string>('묘사', { required: true })
/**
 * 이 그림을 만든 문서 비율 (`i배경.비율`). 규격이 바뀐 것을 나중에 알아보는 유일한 근거다.
 *
 * **model 이 바뀔 때마다 찍지 않는다.** 저장된 디자인틀을 열면 model 이 null→url 로 한 번 바뀌는데,
 * 거기서 지금 규격을 찍어 버리면 어긋난 그림이 갓 뽑은 그림으로 위장한다. 그래서 이 컴포넌트가
 * **방금 만들어 낸 후보**일 때만 찍는다 — 그 그림만 지금 규격으로 만들어졌음이 확실하다.
 */
const 비율 = defineModel<number | null>('비율', { required: true })

const { 후보s, isLoading, error, 생성 } = useAIImage()

/**
 * 문장을 짓는 쪽은 그림을 뽑는 쪽과 **다른 호출**이라 로딩도 오류도 따로 든다.
 * 한 벌로 묶으면 문장을 짓는 동안 후보 자리가 로딩으로 덮인다 — 뽑은 것은 그대로 있는데도.
 */
const { ask: 물음, isLoading: 문장짓는중, error: 문장오류 } = useAI()

/** 칸에 든 말을 재료로 영문 묘사를 짓고 **같은 칸에 박는다**. 빈 문장이 오면 칸을 건드리지 않는다 */
async function do문장짓기() {
  try {
    const 새묘사 = await AI배경묘사(물음.lite, props.규격, props.용도, 묘사.value)
    if (새묘사) 묘사.value = 새묘사
  } catch {
    // `useAI` 가 error 에 담아 두고, 칩 줄 아래 한 줄이 그걸 띄운다
  }
}

const 문서비율 = computed(() => props.규격.폭mm / props.규격.높이mm)
const 낡음 = computed(() => 배경낡음({ url: model.value, 묘사: 묘사.value, 비율: 비율.value } as i배경, props.규격))

/**
 * 방금 뽑은 후보를 고르면 그 비율을 찍고 **보관한다**.
 *
 * `후보s` 에 든 것만 다룬다. 저장된 디자인틀을 열 때도 model 이 null→url 로 바뀌는데, 거기서
 * 지금 규격을 찍으면 어긋난 그림이 갓 뽑은 그림으로 위장하고, 남의 그림이 내 보관함에 쌓인다.
 */
watch(model, (url) => {
  if (!url || !후보s.value.some(c => c.url === url)) return
  비율.value = 문서비율.value
  do애셋보관({ 종류: '배경', 링크: url, 묘사: 묘사.value, 비율: 문서비율.value })
})

async function do생성() {
  const 새후보s = await 생성(묘사.value, {
    // 규격은 지시문 안에도 들어간다 — 비율은 이 그림의 후처리 사항이 아니라 주제의 일부다.
    // 프레임만 맞춰 주고 말면 모델이 다른 비율을 전제로 구도를 잡고, 그걸 늘이거나 잘라내게 된다
    stylePrompt: 배경지시문(props.규격, props.용도),
    count: 생성개수,
    /**
     * **인쇄물이라 기본값(lite / 1K)으로는 안 된다.** 1K 는 A4 세로에서 896×1200 인데
     * 300dpi 인쇄는 2480×3508 이라 2.8배 확대다 — 레이드 라인·닥섬유·기요셰 미세선처럼
     * 이 배경의 내용 자체인 디테일이 정확히 거기서 제일 먼저 뭉갠다. 원형을 아무리 자세히
     * 적어도 화면에는 뿌연 색종이가 왔다.
     *
     * 둘은 한 몸이다 — `lite` 는 1K 만 받으므로 레벨을 안 올리면 서버가 400 이다
     * (`AI_IMAGE_SIZES_BY_LEVEL`). 2K = 1792×2400, 한 장에 2.8MB.
     */
    imageLevel: 'flash',
    imageSize: '2K',
    /**
     * 비율은 프레임 파라미터가 아니라 **규격 그대로** 넘긴다.
     * 상류의 `aspectRatio` 는 14개짜리 enum 이라 A4(1:1.414)가 없고, 가장 가까운 값을 골라도
     * 5.7% 가 남아 그만큼을 화면에서 늘이거나 잘라내야 했다. 서버가 이 비율로 빈 캔버스를 깔면
     * 그림이 애초에 규격대로 나온다 (실측 오차 0.00%).
     */
    frameRatio: 문서비율.value
  })

  if (새후보s.length === 1) model.value = 새후보s[0]!.url
}
</script>

<template>
  <div
    class="flex flex-col gap-2"
    :class="isSidePanelLayout ? 'h-full' : ''"
  >
    <form
      class="flex items-center gap-1.5"
      @submit.prevent="do생성"
    >
      <mInput
        v-model="promptInput"
        class="flex-1"
        placeholder="이미지 설명"
        trailing-icon=""
        :readonly="is로딩중"
      />
      <mButton
        type="submit"
        size="sm"

        icon="i-lucide-sparkles"
        :loading="is로딩중"
      />
    </form>

    <div
      v-if="!has지시문"
      class="flex flex-col gap-1 px-1"
    >
      <div class="flex flex-wrap items-center gap-1">
        <mButton
          v-for="style in 스타일목록"
          :key="style.key"
          size="xs"
          class="rounded-full"
          :켜짐="선택스타일 === style.key"
          :icon="선택스타일 === style.key ? 'i-lucide-check' : undefined"
          @click="() => 선택스타일 = style.key"
        >
          {{ style.label }}
        </mButton>

        <mButton
          v-if="선택프롬프트"
          size="xs"
          역할="조용"
          class="ml-auto rounded-full transition-transform duration-150"
          :class="is프롬프트열림 ? 'rotate-180' : ''"
          icon="i-lucide-chevron-down"
          title="적용되는 프롬프트 보기"
          @click="() => is프롬프트열림 = !is프롬프트열림"
        />
      </div>

      <pre
        v-if="is프롬프트열림 && 미리보기프롬프트"
        class="max-h-40 overflow-y-auto whitespace-pre-wrap rounded-md bg-elevated/50 p-2 text-[0.6875rem] leading-relaxed text-muted"
      >{{ 미리보기프롬프트 }}</pre>
    </div>

    <m이미지후보s
      v-model="model"
      :후보s="후보s"
      :로딩="isLoading"
      :오류="error"
      :개수="생성개수"
      :세로배치="isSidePanelLayout"
    />

    <div class="px-1 text-right text-xs text-muted">
      by AI
    </div>
  </div>
</template>

<script setup lang="ts">
import type { RandPicOrientation } from '~/composables/useRandPic'

/**
 * 홈페이지에 얹을 **참고 이미지**를 뽑는 자리. 이 컴포넌트가 소유한 것은 그 용도의 어휘다 —
 * 실사(렌즈·조리개·보케)와 라인아트(한 줄 획·아이콘화)의 상세 프롬프트가 서버 프리셋에
 * 들어 있고, 여기는 그 목록을 받아 고르게 한다.
 *
 * 뽑고·기다리고·고르는 일은 이 용도의 것이 아니라서 밖으로 나가 있다
 * (`useAIImage` · `m이미지후보s`). 증서 종이 같은 다른 용도는 같은 둘을 쓰되
 * 프롬프트 층은 자기 것을 따로 든다.
 */

interface Props {
  prompt?: string
  /**
   * 호출한 모델이 소유한 스타일 지시문. 주면 서버 프리셋(실사/라인아트/…) 대신 이게 쓰인다.
   * 증명사진·포스터처럼 모델에 종속된 그림 규칙은 그 모델이 갖고 있어야 하므로,
   * 여기서는 내용을 모른 채 서버로 넘기기만 한다.
   */
  stylePrompt?: string
  /** 저장 폴더 (`uploads/ai/<dir>`). 비우면 서버가 프리셋으로 정한다 */
  dir?: string
  /** 지정하면 orientation 매핑을 덮어쓴다 (증명사진의 3:4처럼 딱 떨어지는 비율용) */
  aspectRatio?: string
  orientation?: RandPicOrientation
  isSidePanelLayout?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  prompt: '',
  stylePrompt: '',
  dir: '',
  aspectRatio: '',
  orientation: 'landscape',
  isSidePanelLayout: false
})

/** 모델이 지시문을 준 경우 스타일 칩은 의미가 없다 (서버 프리셋을 안 타므로) */
const has지시문 = computed(() => Boolean(props.stylePrompt))

const model = defineModel<string | null>({ required: false, default: null })
const is로딩중 = defineModel<boolean>('isDoing', { required: false, default: false })

interface 스타일프리셋 {
  key: string
  label: string
  prompt: string
}

/** 한 번에 만들 후보 장수. 여러 장 뽑아 그 중 하나를 고르게 한다. */
const 생성개수 = 2

const ASPECT_RATIO_BY_ORIENTATION: Record<RandPicOrientation, string> = {
  landscape: '16:9',
  portrait: '9:16',
  squarish: '1:1'
}

const { 후보s, isLoading, error, 생성 } = useAIImage()
// 로딩은 부모도 봐야 한다 (`isDoing`) — 훅이 든 값이 유일한 근거고 이 모델은 그 사본이다
watch(isLoading, (v) => { is로딩중.value = v })

const promptInput = ref(props.prompt)
// 프리셋(라벨/프롬프트)의 단일 출처는 서버(gen_img.ts). 조회 실패해도 생성은 폴백 라벨로 동작한다.
const 폴백스타일: 스타일프리셋[] = [
  { key: 'photo', label: '실사', prompt: '' },
  { key: 'lineart', label: '라인아트', prompt: '' }
]

const 스타일목록 = ref<스타일프리셋[]>(폴백스타일)
const 선택스타일 = ref('photo')
const 선택프롬프트 = computed(() => 스타일목록.value.find(item => item.key === 선택스타일.value)?.prompt ?? '')
const is프롬프트열림 = ref(false)

/**
 * 마지막 생성에 실제로 쓰인 장면 묘사. 후보가 저마다 자기 장면을 들고 있으므로
 * 따로 담아 두지 않는다 — 맨 앞이 곧 가장 최근 생성분이다.
 */
const 최근장면 = computed(() => 후보s.value[0]?.scene ?? '')

// 서버(gen_img.ts)가 GET 프리셋에 끼워 보내는 자리표시자. 문구가 갈리면 아래 폴백으로 빠진다.
const SCENE_PLACEHOLDER = '(입력한 주제로 만든 장면 묘사가 여기에 들어갑니다)'

// 프롬프트를 열어봤을 때 자리표시자 대신 실제 장면이 보이도록 갈아끼운다.
const 미리보기프롬프트 = computed(() => {
  const 원본 = 선택프롬프트.value
  if (!최근장면.value) return 원본

  const 치환됨 = 원본.replace(SCENE_PLACEHOLDER, 최근장면.value)
  if (치환됨 !== 원본) return 치환됨

  // 자리표시자를 못 찾은 경우에도 실제 장면은 보여준다.
  return `[실제 적용된 장면]\n${최근장면.value}\n\n${원본}`
})

onMounted(async () => {
  try {
    const res = await $fetch<{ styles: 스타일프리셋[] }>('/api-etc/ai/gen_img')
    if (res?.styles?.length) 스타일목록.value = res.styles
  } catch {
    // 폴백 유지
  }
})

async function do생성() {
  const 새후보s = await 생성(promptInput.value, {
    style: 선택스타일.value,
    stylePrompt: props.stylePrompt || undefined,
    // 안 주면 서버가 프리셋으로 정한다 (실사→ai, 라인아트→lineart)
    dir: props.dir || undefined,
    count: 생성개수,
    aspectRatio: props.aspectRatio || ASPECT_RATIO_BY_ORIENTATION[props.orientation]
  })

  // 후보가 여러 장이면 고르는 건 사용자 몫. 한 장뿐일 때만 바로 적용한다.
  if (새후보s.length === 1) model.value = 새후보s[0]!.url
}
</script>

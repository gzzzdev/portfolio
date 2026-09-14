<template>
  <!--
    프롬프트를 모르는 표시층. 무엇을 어떻게 뽑았는지는 부르는 쪽 사정이고,
    여기는 "뽑는 중 / 실패함 / 뽑힌 것들 중 하나를 고름" 세 상태만 그린다.
  -->
  <UAlert
    v-if="오류"
    color="error"
    title="이미지 생성 실패"
    :description="오류"
  />

  <div :class="세로배치 ? 'flex-1 min-h-0 overflow-y-auto pr-1' : ''">
    <div
      v-if="로딩"
      class="flex aspect-video w-full items-center justify-center rounded-md border border-default bg-muted/30 text-xs text-muted"
    >
      {{ 개수 }}장 생성 중입니다... (약 10~20초)
    </div>

    <div
      v-if="후보s.length > 0"
      class="mt-2 grid gap-2"
      :class="세로배치 ? 'grid-cols-1' : 'grid-cols-2'"
    >
      <div
        v-for="item in 후보s"
        :key="item.url"
        role="button"
        tabindex="0"
        class="relative cursor-pointer overflow-hidden rounded-md border transition"
        :class="model === item.url ? 'border-primary ring-2 ring-primary/30' : 'border-accented hover:border-primary/60'"
        @click="() => model = item.url"
        @keydown.enter.prevent="() => model = item.url"
        @keydown.space.prevent="() => model = item.url"
      >
        <img
          :src="item.url"
          :alt="item.prompt"
          class="aspect-video w-full object-cover"
          loading="lazy"
        >
        <div class="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/75 via-black/35 to-transparent px-2 py-1.5 text-[0.6875rem] text-white">
          <p
            class="truncate"
            :title="item.scene || item.prompt"
          >
            {{ item.scene || item.prompt }}
          </p>
        </div>
      </div>
    </div>

    <p
      v-else-if="!로딩"
      class="px-1 py-4 text-center text-xs text-muted"
    >
      {{ 안내문 }}
    </p>
  </div>
</template>

<script setup lang="ts">
import type { AIImageItem } from '~/composables/useAIImage'

/**
 * 루트가 둘이라(얼럿 + 결과 영역) 물려받은 속성을 어디에 붙일지 정할 수 없다.
 * 감싸는 div 를 하나 두면 `세로배치` 의 `flex-1 min-h-0` 가 한 겹 밀려 안 먹는다 —
 * 그 클래스는 부모 flex 컬럼의 **직계 자식**에 붙어야 뜻이 서기 때문이다.
 */
defineOptions({ inheritAttrs: false })

interface Props {
  후보s: AIImageItem[]
  로딩?: boolean
  오류?: string | null
  /** 한 번에 뽑는 장수. 안내 문구가 이 숫자를 말한다 */
  개수?: number
  /** 좁고 긴 옆패널에 놓일 때. 한 줄로 세우고 스스로 스크롤한다 */
  세로배치?: boolean
  /** 아직 아무것도 안 뽑았을 때의 문구. 무엇을 넣어야 하는지가 용도마다 달라서 받는다 */
  안내?: string
}

const props = withDefaults(defineProps<Props>(), {
  로딩: false,
  오류: null,
  개수: 2,
  세로배치: false,
  안내: ''
})

/** 고른 후보의 url */
const model = defineModel<string | null>({ required: false, default: null })

const 안내문 = computed(
  () => props.안내 || `주제를 입력하면 ${props.개수}장을 만들어 드려요. 마음에 드는 걸 고르세요.`
)
</script>

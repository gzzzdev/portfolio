<template>
  <div
    ref="rootEl"
    class="w-full photo-picker-container"
  >
    <div class="photo-picker-layout">
      <div
        ref="previewEl"
        class="group relative w-full overflow-visible rounded-md border border-accented"
        :class="[
          !readonly && !hasModel ? 'cursor-pointer' : '',
          is가림 ? 'cursor-pointer outline-none' : ''
        ]"
        :style="previewStyle"
        :tabindex="is가림 ? 0 : undefined"
        @click="() => onPreviewClick()"
      >
        <div class="h-full w-full overflow-hidden rounded-[inherit]">
          <mImage
            v-if="hasModel"
            :src="model || ''"
            :class="사진class"
            :type="type"
          />
          <div
            v-else-if="!readonly"
            class="flex h-full w-full flex-col items-center justify-center gap-2 bg-muted/30 text-sm text-muted"
          >
            <span>대표사진이 비어있습니다.</span>
            <span class="text-xs">{{ has패널 ? '이 영역을 클릭해 바로 업로드하거나, 오른쪽 탭에서 선택하세요.' : '이 영역을 클릭해 업로드하세요.' }}</span>
          </div>
          <div
            v-else
            class="flex h-full w-full items-center justify-center bg-muted/30 text-sm text-muted"
          >
            비어있음
          </div>
        </div>

        <!--
          사진을 뒤로 물리는 막. 고장난 게 아니라 일부러 덮었다는 표까지 겸한다.
          클릭·hover를 가로채면 안 되니 `pointer-events-none` — 밑의 미리보기가 그대로 받는다.
        -->
        <div
          v-if="is가림"
          class="pointer-events-none absolute inset-0 z-10 flex items-end justify-center bg-default/45 pb-3 transition-opacity duration-300 group-hover:opacity-0 group-focus:opacity-0"
        >
          <span class="flex items-center gap-1 rounded-full bg-default/70 px-2 py-0.5 text-[0.6875rem] leading-4 text-dimmed">
            <UIcon
              name="i-lucide-eye-off"
              class="size-3"
            />
            올리면 보입니다
          </span>
        </div>

        <div
          v-if="hasModel && !readonly"
          class="absolute right-0 top-0 z-10"
        >
          <mButton
            icon="i-material-symbols-light-close-rounded"

            class=" rounded-full  text-primary"

            @click.stop="() => clearSelection()"
          />
          <!-- shadow-sm ring-1 ring-black/10 hover:bg-neutral-50 dark:bg-white dark:text-error-500 dark:hover:bg-neutral-100" -->
        </div>

        <input
          ref="refInput"
          type="file"
          style="display: none;"
          accept="image/png, image/jpeg"
          @change="(e) => onUploadChange(e)"
        >
      </div>

      <template v-if="!readonly && has패널">
        <div
          class="photo-picker-side"
          :class="isSidePanelLayout ? 'photo-picker-side-horizontal' : 'photo-picker-side-vertical'"
          :style="isSidePanelLayout && previewHeightPx ? { height: previewHeightPx } : undefined"
        >
          <div
            class="photo-picker-toggle-wrap"
            :class="isSidePanelLayout ? 'photo-picker-toggle-wrap-horizontal' : 'photo-picker-toggle-wrap-vertical'"
          >
            <mButton
              size="xs"
              역할="조용"
              icon="i-lucide-chevron-left"
              class="photo-picker-panel-toggle transition-transform duration-150"
              :class="panelToggleRotateClass"
              @click="() => isPanelOpen = !isPanelOpen"
            />
          </div>

          <Transition :name="panelTransitionName">
            <mBox유리
              v-if="isPanelOpen"
              class="w-full p-3 photo-picker-panel"
              :style="isSidePanelLayout && previewHeightPx ? { height: previewHeightPx } : undefined"
            >
              <div
                class="flex flex-col gap-2"
                :class="isSidePanelLayout ? 'h-full' : ''"
              >
                <div
                  v-if="tabs.length > 1"
                  class="flex items-center gap-1 rounded-md bg-elevated/50 p-0.5"
                >
                  <mButton
                    v-for="tab in tabs"
                    :key="tab.key"
                    size="xs"
                    class="flex-1 justify-center"
                    역할="조용"
                    :켜짐="activeTab === tab.key"
                    :icon="tab.icon"
                    :disabled="is로딩중"
                    @click="() => activeTab = tab.key"
                  >
                    {{ tab.label }}
                  </mButton>
                </div>

                <Photo3Unsplash
                  v-if="activeTab === 'search'"
                  v-model="model"
                  v-model:is-doing="is로딩중"
                  :tags="tags"
                  :count="count"
                  :orientation="orientation"
                  :is-side-panel-layout="isSidePanelLayout"
                />
                <Photo3Generate
                  v-else-if="activeTab === 'ai'"
                  v-model="model"
                  v-model:is-doing="is로딩중"
                  :prompt="promptSeed"
                  :style-prompt="props.stylePrompt"
                  :dir="props.dir"
                  :aspect-ratio="props.aspectRatio"
                  :orientation="orientation"
                  :is-side-panel-layout="isSidePanelLayout"
                />
              </div>
            </mBox유리>
          </Transition>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { RandPicOrientation } from '~/app/composables/useRandPic'
import Photo3Unsplash from './_unsplash.vue'
import Photo3Generate from './_generate.vue'

interface Props {
  readonly?: boolean
  type?: 'client' | 'server'
  tags?: string | string[]
  count?: number
  orientation?: RandPicOrientation
  /** AI 생성 탭 프롬프트 초기값 (예: 강의 제목) */
  prompt?: string
  /** 호출한 모델이 소유한 스타일 지시문 (증명사진·포스터 등). 그대로 통과시킨다 */
  stylePrompt?: string
  /**
   * 저장 폴더 (`uploads/ai/<dir>`). 비우면 서버가 프리셋으로 정한다.
   * `stylePrompt` 와 짝이다 — 지시문을 주는 쪽만이 무슨 그림인지 알기 때문이다.
   */
  dir?: string
  /** 지정하면 orientation 매핑 대신 이 비율로 생성 */
  aspectRatio?: string
  /**
   * AI생성 탭을 쓸 수 있는지. 끄면 이 입력은 업로드/검색 전용이 된다.
   * 모델이 자기 버튼(예: model캐릭터의 `AI 증명사진`)으로 생성 흐름을 따로 소유할 때 꺼서
   * 생성 입구가 둘로 갈라지지 않게 한다.
   */
  can생성?: boolean
  /** 검색(Unsplash) 탭을 쓸 수 있는지 */
  can검색?: boolean
  /**
   * 얼굴처럼 크게 펼쳐두기 민망한 사진(예: `model캐릭터`의 증명사진).
   * 켜면 흐리게 덮고, 올리거나(hover) 포커스·클릭했을 때 걷는다.
   *
   * **수정 중인지는 안 따진다.** 읽기모드에만 걸었더니 `is수정중`을 항상 켜둔 화면
   * (`v2/characters`)에서 아무 일도 안 일어났다. 민망한 건 사진이 화면에 펼쳐져 있다는
   * 사실이지 모드가 아니다. 어차피 올리면 걷히니 고르는 데도 지장이 없다.
   *
   * 블러 세기·전환 시간 같은 수치는 일부러 프롭으로 안 뺐다. 쪼개면 호출부마다 조합이 갈려
   * 같은 얼굴이 화면마다 다르게 보이고, 그때부터 "얼굴을 어떻게 보여줄지"가 이 컴포넌트가 아니라
   * 모델 파일들로 흩어진다. 이름이 `블러`가 아닌 것도 같은 이유 — 나중에 가리는 방식이
   * 원형 아바타로 바뀌어도 호출부는 그대로 둘 수 있다.
   */
  민감?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  readonly: false,
  type: 'client',
  tags: '자연',
  count: 8,
  orientation: 'landscape',
  prompt: '',
  stylePrompt: '',
  dir: '',
  aspectRatio: '',
  can생성: true,
  can검색: true,
  민감: false
})

const 전체탭s = [
  { key: 'ai', label: 'AI생성', icon: 'i-lucide-sparkles' },
  { key: 'search', label: '검색', icon: 'i-lucide-search' }
] as const
type i탭 = (typeof 전체탭s)[number]['key']

const tabs = computed(() =>
  전체탭s.filter(tab => (tab.key === 'ai' ? props.can생성 : props.can검색))
)
/** 쓸 수 있는 탭이 하나도 없으면 패널을 통째로 감춘다 (= 업로드/뷰어 전용) */
const has패널 = computed(() => tabs.value.length > 0)

const activeTab = ref<i탭>(props.can생성 ? 'ai' : 'search')
watch(tabs, (list) => {
  if (!list.some(tab => tab.key === activeTab.value)) activeTab.value = list[0]?.key ?? 'ai'
})

const model = defineModel<string | null>({ required: false, default: null })
const is로딩중 = defineModel<boolean>('isDoing', { required: false, default: false })

const refInput = ref<HTMLInputElement | null>(null)
const rootEl = ref<HTMLElement | null>(null)
const previewEl = ref<HTMLElement | null>(null)
const isPanelOpen = ref(true)
const isSidePanelLayout = ref(false)
const previewHeightPx = ref('')
let resizeObserver: ResizeObserver | null = null
const SIDE_LAYOUT_BREAKPOINT = 560

/** 사진이 아직 없을 때 자리를 잡아둘 기본 비율 (가로/세로) */
const 기본비율: Record<RandPicOrientation, number> = {
  landscape: 16 / 9,
  portrait: 3 / 4,
  squarish: 1
}
/**
 * 세로형 미리보기 높이 상한. 목적은 그대로 — 세로 사진이 가로 사진보다 눈에 띄게 커 보이지 않게 하는 것.
 * 기준만 옮겼다. 400은 세로 사진도 폼 본문(약 700px)을 통째로 쓰던 시절, 그 폭의 16:9 높이(≈394px)에
 * 맞춘 값이었다. 지금 패널 없는 세로 사진은 `폭:'옆'`으로 빠져 옆 열에 선다(`view/1.ts`의 `기본폭`).
 * 옆 열에서는 높이 캡(400)이 아니라 열 폭이 먼저 걸려 높이가 384px까지 자라는데, 이건 같은 폼의
 * 가로 사진(본문 폭 기준 ≈300px)보다 확실히 크다. 옆 열에서도 가로 사진과 비슷한 높이로 끝나도록 내렸다.
 *
 * 폭 캡이 `비율 × 이 값`이라 이 값을 바꾸면 세로 사진의 폭도 같이 움직인다.
 * `모델필드s2`의 `사이드폭`이 그 폭에 맞춰져 있으니 함께 봐야 한다.
 */
const 세로형최대높이 = 320
/**
 * 옆 패널 높이 하한.
 * 패널은 미리보기 높이를 따라가는데, 가로로 긴 사진이면 미리보기가 낮아져 패널까지 눌린다.
 * AI생성 탭(프롬프트 입력 + 스타일 칩 + 결과 그리드)이 접히지 않는 최소치.
 */
const PANEL_MIN_HEIGHT = 320

/** 실제로 로드된 사진의 가로/세로. 없으면 null */
const 실제비율 = ref<number | null>(null)

const hasModel = computed(() => Boolean(model.value && model.value !== ''))
/**
 * 클릭으로 한 번 걷어둔 상태. hover가 없는 터치 화면을 위한 것이라 다시 누르면 도로 덮인다.
 * hover·포커스로 걷는 건 여기 안 들어온다 — 그건 CSS(`group-hover`)가 하고 손을 떼면 알아서 돌아온다.
 */
const is벗김 = ref(false)
/** 지금 덮여 있나 */
const is가림 = computed(() => props.민감 && hasModel.value && !is벗김.value)
const type = computed(() => props.type)
const tags = computed(() => props.tags)
const count = computed(() => props.count)
const orientation = computed(() => props.orientation)
const promptSeed = computed(() => props.prompt)
const panelToggleRotateClass = computed(() => {
  if (isSidePanelLayout.value) {
    return isPanelOpen.value ? 'rotate-180' : 'rotate-0'
  }
  return isPanelOpen.value ? 'rotate-90' : '-rotate-90'
})
const panelTransitionName = computed(() =>
  isSidePanelLayout.value ? 'photo-panel-x' : 'photo-panel-y'
)
/**
 * 사진에 걸리는 클래스. 덮을 때 살짝 키우는 건 blur가 가장자리를 비워
 * 액자 안쪽에 테두리처럼 빈 띠가 생기기 때문이다.
 * 걷는 조건(hover·focus)은 CSS에 맡긴다 — 손을 떼면 알아서 돌아와야 해서 상태로 들 이유가 없다.
 *
 * **해제는 `blur-0`이 아니라 `blur-none`.** tailwind v4의 blur 스케일은 `xs/sm/md/lg/…`이고
 * 해제값 이름이 `none`이다. `blur-0`은 존재하지 않는 클래스라 조용히 사라져서,
 * hover해도 아무 일이 안 일어난다(에러도 안 난다).
 *
 * blur는 4px로 얕게만 건다. 세기를 올려서 감추려 들면 16px도 모자라고(사각 프레임은
 * 문질러도 안 없어진다) 그 전에 뭉갠 티만 난다. 가리는 일은 위에 덮는 막이 하고,
 * blur는 "일부러 뒤로 물린 것"이라는 신호만 준다.
 */
const 사진class = computed(() =>
  [
    'h-full w-full object-contain transition duration-300',
    is가림.value
      ? 'scale-105 blur-xs group-hover:scale-100 group-hover:blur-none group-focus:scale-100 group-focus:blur-none'
      : ''
  ].join(' ')
)

/**
 * 미리보기 틀은 사진 비율을 그대로 따라간다.
 * 틀을 16:9로 고정해두면 세로 사진이 위아래로 잘려서, 고른 사진과 보이는 사진이 달라진다.
 *
 * 가로형은 예전처럼 폭을 꽉 채운다. 폭을 캡으로 묶으면 넓은 폼에서 오른쪽이 비어버린다.
 * 세로형만 높이를 묶고, 그만큼 폭도 같이 줄인다 (높이만 묶으면 사진 옆에 빈 액자가 남는다).
 */
const previewStyle = computed(() => {
  const 비율 = 실제비율.value ?? 기본비율[props.orientation]
  if (비율 >= 1) return { aspectRatio: String(비율) }

  return {
    aspectRatio: String(비율),
    maxHeight: `${세로형최대높이}px`,
    maxWidth: `${Math.round(비율 * 세로형최대높이)}px`
  }
})

/** mImage 는 load 이벤트를 흘려주지 않으므로, 비율만 따로 재본다 (같은 URL이라 브라우저 캐시를 탄다) */
watch(
  model,
  (src) => {
    실제비율.value = null
    is벗김.value = false // 다른 사람 사진으로 갈아탔는데 걷힌 채로 있으면 안 된다
    if (!import.meta.client || !src) return

    const probe = new window.Image()
    probe.onload = () => {
      if (model.value !== src) return
      if (probe.naturalWidth && probe.naturalHeight) {
        실제비율.value = probe.naturalWidth / probe.naturalHeight
      }
    }
    probe.src = src
  },
  { immediate: true }
)

function onPreviewClick() {
  // 가려둔 사진은 클릭이 곧 걷기/덮기다 (hover가 없는 터치 화면용 입구).
  // 사진이 있을 때 클릭은 원래 아무것도 안 했으니(아래 줄) 뺏어오는 동작이 없다.
  if (props.민감 && hasModel.value) {
    is벗김.value = !is벗김.value
    return
  }
  if (props.readonly || hasModel.value) return
  openFileInput()
}

function openFileInput() {
  refInput.value?.click()
}

function clearSelection() {
  model.value = ''
}

async function onUploadChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file || is로딩중.value) return

  is로딩중.value = true
  try {
    const formData = new FormData()
    formData.append('file', file)
    const res = await $fetch<{ publicUrl: string }>('/api/v1/files/upload', {
      method: 'POST',
      body: formData
    })
    model.value = res.publicUrl
  } finally {
    is로딩중.value = false
    input.value = ''
  }
}

onMounted(() => {
  if (!rootEl.value) return

  const updateLayoutMode = () => {
    const rootWidth = rootEl.value?.getBoundingClientRect().width ?? 0
    isSidePanelLayout.value = rootWidth >= SIDE_LAYOUT_BREAKPOINT
    previewHeightPx.value = previewEl.value
      ? `${Math.max(previewEl.value.clientHeight, PANEL_MIN_HEIGHT)}px`
      : ''
  }

  resizeObserver = new ResizeObserver(updateLayoutMode)
  resizeObserver.observe(rootEl.value)
  if (previewEl.value) resizeObserver.observe(previewEl.value)
  updateLayoutMode()
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
})
</script>

<style scoped>
.photo-picker-container {
  container-type: inline-size;
}

.photo-picker-layout {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.photo-picker-side {
  display: flex;
}

.photo-picker-side-vertical {
  flex-direction: column;
  gap: 0;
}

.photo-picker-side-horizontal {
  flex-direction: row;
  gap: 0;
  align-items: stretch;
}

.photo-picker-toggle-wrap {
  display: flex;
  flex-shrink: 0;
}

.photo-picker-toggle-wrap-vertical {
  width: 100%;
  justify-content: center;
}

.photo-picker-toggle-wrap-horizontal {
  height: 100%;
  align-items: center;
  justify-content: center;
}

.photo-picker-panel-toggle {
  flex-shrink: 0;
}

.photo-panel-x-enter-active,
.photo-panel-x-leave-active,
.photo-panel-y-enter-active,
.photo-panel-y-leave-active {
  overflow: hidden;
}

.photo-panel-x-enter-active,
.photo-panel-x-leave-active {
  transition: max-width 0.22s ease, opacity 0.16s ease;
}

.photo-panel-x-enter-from,
.photo-panel-x-leave-to {
  max-width: 0;
  opacity: 0.75;
}

.photo-panel-x-enter-to,
.photo-panel-x-leave-from {
  max-width: 320px;
  opacity: 1;
}

.photo-panel-y-enter-active,
.photo-panel-y-leave-active {
  transition: max-height 0.22s ease, opacity 0.16s ease;
}

.photo-panel-y-enter-from,
.photo-panel-y-leave-to {
  max-height: 0;
  opacity: 0.75;
}

.photo-panel-y-enter-to,
.photo-panel-y-leave-from {
  max-height: 560px;
  opacity: 1;
}

@container (min-width: 560px) {
  .photo-picker-layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: start;
    gap: 0;
  }

  .photo-picker-panel {
    width: clamp(240px, 32cqw, 320px);
    align-self: stretch;
  }
}
</style>

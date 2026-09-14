<template>
  <!-- 루트 폭은 `is폭자동`이 가른다 — 근거는 script 의 프롭 주석에. -->
  <div
    class="relative mr-2"
    :class="is폭자동 ? 'w-auto flex-none min-w-fit max-w-max' : (is미니 ? 'w-auto min-w-0 max-w-full' : 'w-full min-w-0 max-w-full')"
  >
    <div
      ref="칸El"
      class="min-w-0 overflow-x-auto overflow-y-hidden"
      :class="is미니 ? 'flex-none' : 'w-full'"
    >
      <template v-if="is미니">
        <!--
          넘치면 줄을 바꾼다 — 가로 스크롤은 칩을 스크롤 뒤에 숨긴다. `is폭자동`이면 폭이 곧 내용이라 한 줄 그대로다.
          읽기모드는 `disabled` 가 아니라 `pointer-events-none` 이다: 흐려지지 않고, 클릭이 부모(카드 이동)로 간다.
        -->
        <div
          class="flex items-center gap-0 gap-y-1 -space-x-px whitespace-nowrap"
          :class="is폭자동 ? 'w-max' : 'flex-wrap'"
        >
          <template
            v-for="item in items"
            :key="item.value"
          >
            <mButton
              type="button"
              :disabled="loading || item.disabled"
              :tabindex="readonly ? -1 : undefined"
              :loading="loading && isRadioSelected(item)"
              :icon="item.icon"
              역할="조용"
              size="xs"
              :class="[
                'min-h-0 min-w-0 rounded-none first:rounded-s-sm last:rounded-e-sm border px-1.5 py-0.5 text-[0.6875rem] leading-tight font-normal bg-transparent!',
                item.value == _model
                  ? 'relative z-1 border-primary text-primary hover:bg-transparent!'
                  : 'border-accented text-default hover:bg-transparent!',
                readonly || loading || item.disabled ? 'cursor-default' : 'cursor-pointer',
                readonly ? 'pointer-events-none' : ''
              ]"
              :ui="{ base: 'justify-center', leadingIcon: 'size-3' }"
              @click="() => selectRadio(item)"
            >
              <div>
                {{ item.label }}
                <span v-if="item.count > 0">({{ item.count }})</span>
              </div>
            </mButton>
          </template>
        </div>
      </template>
      <div
        v-else-if="타입 == 'radio'"
        :class="isUI ? _class : ''"
      >
        <!-- 넘치면 글자를 걷고 아이콘만 남긴다 — 근거는 `_use아이콘만.ts` -->
        <div
          class="inline-flex w-fit max-w-full items-center rounded-xl gap-0.5 p-0.5"
          :class="readonly ? '' : 스킨.트랙"
          role="group"
          :aria-disabled="readonly || loading || undefined"
          :aria-busy="loading || undefined"
        >
          <Pill
            v-for="item in 표시items"
            :key="String(item.value)"
            :active="isRadioSelected(item)"
            :state="itemState(item)"
            :icon="item.icon"
            :color="item.color"
            :label="item.label"
            :아이콘만="is아이콘만 && !isRadioSelected(item)"
            @click="() => selectRadio(item)"
          >
            <span>{{ item.label }}</span>
            <span
              v-if="(item.count ?? 0) > 0"
              class="text-muted"
            >({{ item.count }})</span>
          </Pill>
          <span
            v-if="표시items.length === 0"
            class="px-2 py-1 text-xs text-dimmed"
          >—</span>
        </div>
      </div>

      <div
        v-else-if="타입 == 'select'"
        :class="isUI ? _class : ''"
      >
        <USelectMenu
          v-model="model"
          :ui="isUI ? _uiCursor : { ..._uiCursor, root: '' }"
          :class="isUI ? 'w-full' : ''"
          :items="items"
          :size="is미니 ? 'xs' : 'lg'"
          :readonly="readonly"
          :disabled="readonly || loading"
          :loading="loading"
        >
          <template #item="{ item }">
            <div :class="{ 'text-primary': item.value == _model }">
              {{ item.label }}
            </div>
          </template>
        </USelectMenu>
      </div>

      <div
        v-else
        :class="_class"
      >
        <USelect
          class="w-full"
          :model-value="model?.value ?? ''"
          size="lg"
          :ui="_uiCursor"
          :items="items"
          :readonly="readonly"
          :disabled="readonly || loading"
          :loading="loading"
          @update:model-value="(x) => _model = x ?? null"
        >
          <template #item="{ item }">
            <div :class="{ 'text-primary': item.value == _model }">
              {{ item.label }}
            </div>
          </template>
        </USelect>
      </div>
    </div>
    <mIcon
      v-if="has삭제 && !readonly && !loading && has선택값"
      name="i-material-symbols-close"
      class="size-4 absolute -right-3.5 -top-0.5 shrink-0 cursor-pointer text-muted hover:text-default"
      :aria-label="삭제라벨"
      @click.stop="clearSelection"
    />
  </div>
</template>

<script setup lang="ts">
import { USelect } from '#components'
import { computed, ref } from 'vue'
import { _ui, _class } from '../_'
import Pill from './_pill.vue'
import { use아이콘만 } from './_use아이콘만'
import { useSegmentSkin } from '~base-comps/m/_스킨'

interface i기타 {
  search?: boolean
  indicator?: boolean
  type?: 'radio' | 'select' | 'search'
  is미니?: boolean
  /**
     * 폭을 내용에 붙인다. 기본(`false`)은 `w-full` — 폼 한 칸을 채우는 자리라 그게 맞다.
     *
     * 켜는 자리는 **툴바 줄**이다: 제목·스페이서와 한 줄에 서므로 늘어나면 안 되고 내용 폭에
     * 붙어야 한다. 프롭이 없던 동안 호출부 7곳이 `w-auto! flex-none min-w-fit max-w-max` 를
     * 복붙해 루트의 `w-full` 과 싸웠다(2026-09-05에 걷어냄). `!` 가 필요했던 건 그 `w-full` 이
     * 같이 붙어 나갔기 때문이고, 한쪽만 나가는 지금은 필요 없다.
     *
     * **`is미니`는 대안이 아니었다** — 저쪽은 폭이 아니라 마크업을 바꾼다(Pill → `mButton묶음` 모양).
     * 둘은 직교라 같이 켜도 된다(`view/목록5/_view필터조건.vue` 가 그렇게 쓴다).
     */
  is폭자동?: boolean
  /** 선택 해제 버튼 표시(값이 있을 때만 노출, 클릭 시 v-model 을 null 로) */
  has삭제?: boolean
  삭제라벨?: string
}
type iSemanticColor = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'
interface iItem { icon?: string, label: string, count?: number, value: string | number | boolean, disabled?: boolean, color?: iSemanticColor }

interface Props extends i기타 {
  items: iItem[]
  readonly?: boolean
  loading?: boolean

  isUI?: boolean

}

type i값 = iItem | string | number | boolean | null

const props = withDefaults(defineProps<Props>(), {
  items: () => [{ label: '...', value: '...', count: 0 }],
  search: !false,
  readonly: false,
  loading: false,
  indicator: true,
  isUI: true,
  is미니: false,
  is폭자동: false,
  has삭제: false,
  삭제라벨: '선택 해제'
})

/** 껍데기 생김새는 재질 축이 정한다 — `m/테마/세그먼티드.ts` */
const 스킨 = useSegmentSkin()

const _model = defineModel<i값>({ required: false, default: null })

const has선택값 = computed(() => {
  const v = _model.value
  return v != null && v !== ''
})

const clearSelection = () => {
  _model.value = null
}

const _uiCursor = computed(() => {
  const cur = props.readonly || props.loading ? 'cursor-default' : 'cursor-pointer'
  return {
    ..._ui,
    content: `z-40 ${cur}`,
    base: `text-md ${cur}`,
    item: cur
  }
})

const isRadioSelected = (item: iItem) => item.value == _model.value

/**
 * 읽기모드에선 고른 것만 남긴다 — 안 고른 보기까지 늘어놓는 건 '고르라'는 신호인데,
 * 읽기모드엔 고를 게 없다. (성별 2개는 괜찮아도 역할 5개·등급 4개가 늘 펼쳐져 있으면 화면이 시끄럽다.)
 */
const 표시items = computed(() => (props.readonly ? props.items.filter(isRadioSelected) : props.items))

const 칸El = ref<HTMLElement | null>(null)
const { is아이콘만 } = use아이콘만(칸El, () => 표시items.value.map(x => `${x.label}${x.count ?? ''}`).join('|'))

const selectRadio = (item: iItem) => {
  if (props.readonly || props.loading || item.disabled) return
  _model.value = item.value
}

const itemState = (item: iItem) => {
  if (props.loading) return 'loading' as const
  if (item.disabled) return 'disabled' as const
  if (props.readonly) return 'readonly' as const
  return 'idle' as const
}

// markR
const model = computed({
  get: () => props?.items?.find(x => x.value == _model.value) ?? undefined,
  set: (v: any) => {
    if (v == null) {
      _model.value = null
      return
    }
    _model.value = typeof v === 'object' && v && 'value' in v ? v.value : v
  }
})

const 타입 = computed(() => {
  if (props.type == 'radio') {
    return 'radio'
  } else if (props.type == 'select') {
    return 'select'
  } else if (props.type == 'search') {
    return 'search'
  } else if (props.items.length <= 5) {
    return 'radio'
  } else if (props.search && props.items.length > 20) {
    return 'select'
  } else {
    return 'search'
  }

  // items.length < 5
})
</script>

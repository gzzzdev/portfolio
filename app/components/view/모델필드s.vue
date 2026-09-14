<template>
  <div class="flex flex-col gap-x-5 gap-1 overflow-x-hidden">
    <template
      v-for="(block, bIdx) in blocks"
      :key="bIdx"
    >
      <!-- 액션바: 연달아 놓인 버튼필드 묶음. 라벨 컬럼 들여쓰기 없이 한 줄에 나란히 세운다. -->
      <div
        v-if="block.is액션바"
        v-show="block.entries.some(e => isItemVisible(e.item))"
        class="w-full flex flex-row flex-wrap items-center gap-2 pt-1 pb-2"
      >
        <template
          v-for="e in block.entries"
          :key="e.idx"
        >
          <ClientOnly v-if="isItemVisible(e.item)">
            <component
              v-bind="{ align: 'no-field', ...toValue(e.item.props) }"
              :is="e.item.comp"
              v-model:is-doing="get로딩Ref(e.idx).value"
            />
          </ClientOnly>
        </template>
      </div>
      <template v-else>
        <template
          v-for="{ item, idx } in block.entries"
          :key="idx"
        >
          <div
            v-if="isItemVisible(item)"
            :class="{ 'min-w-80 max-w-100': !true }"
          >
            <!-- 버튼필드: 라벨 컬럼/구분선 없이 그 자리에 그대로. readonly도 넘기지 않는다. -->
            <div
              v-if="item.is버튼"
              class="w-full pt-1 pb-2"
            >
              <ClientOnly>
                <component
                  v-bind="toValue(item.props)"
                  :is="item.comp"
                  v-model:is-doing="get로딩Ref(idx).value"
                />
              </ClientOnly>
            </div>
            <div
              v-else-if="item.is한줄 ?? is한줄"
              class="w-full flex flex-row gap-1"
            >
              <div
                class="w-20 shrink-0 text-sm text-muted"
                :class="[!true ? 'text-right' : 'text-left pl-3']"
              >
                {{ item.label }}
              </div>
              <div class="grow min-w-0 pl-1 pt-1 pb-3">
                <ClientOnly>
                  <component
                    :is="item?.botHTML"
                    v-if="item?.botHTML"
                  />
                  <component
                    v-bind="toValue(item.props)"
                    :is="item.comp"
                    v-model:is-doing="get로딩Ref(idx).value"
                    :model-value="item.value"
                    :readonly="isItemReadonly(item)"
                    @update:model-value="(v) => item.setter(v)"
                  />
                </ClientOnly>
              </div>
            </div>
            <div
              v-else
              class="w-full"
            >
              <USeparator
                v-if="items.length > 1"
                :label="item.label"
                size="xs"
                class="w-full mt-3 mb-2 px-2"
              />
              <div class="pl-1 pt-1 pb-2">
                <ClientOnly>
                  <component
                    :is="item?.botHTML"
                    v-if="item?.botHTML"
                  />
                  <component
                    v-bind="toValue(item.props)"
                    :is="item.comp"
                    v-model:is-doing="get로딩Ref(idx).value"
                    :model-value="item.value"
                    :readonly="isItemReadonly(item)"
                    @update:model-value="(v) => item.setter(v)"
                  />
                </ClientOnly>
              </div>
            </div>
          </div>
        </template>
      </template>
    </template>
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed, toValue, type Ref } from 'vue'

interface Props {
  items: any[]
  is한줄?: boolean
  is수정중?: boolean
  /** true면 can.수정까지 함께 검사 (상세4) */
  needCan수정?: boolean
  can?: {
    수정?: boolean
    삭제?: boolean
    생성?: boolean
  }
  get로딩Ref: (idx: number) => Ref<boolean>
}

const props = withDefaults(defineProps<Props>(), {
  is한줄: true,
  is수정중: false,
  needCan수정: false,
  can: () => ({})
})

/**
 * 연달아 선언된 버튼필드를 하나의 "액션바" 블록으로 묶는다.
 * - 2개 이상 이어질 때만 액션바 = 출력탭처럼 버튼만 있는 화면은 한 줄에 나란히.
 * - 필드 사이에 낀 버튼 1개(예: 회비 납부)는 그대로 둔다 — 위아래 입력칸과 라인을 맞춰야 하므로.
 * `get로딩Ref(idx)`가 원본 인덱스를 요구해서 묶을 때도 idx를 함께 들고 다닌다.
 */
const blocks = computed(() => {
  const out: { is액션바: boolean, entries: { item: any, idx: number }[] }[] = []

  props.items.forEach((item, idx) => {
    const last = out[out.length - 1]
    if (item?.is버튼 && last?.is액션바)
      last.entries.push({ item, idx })
    else
      out.push({ is액션바: !!item?.is버튼, entries: [{ item, idx }] })
  })

  // 홀로 남은 버튼은 액션바로 승격하지 않는다.
  return out.map(b => b.is액션바 && b.entries.length < 2 ? { ...b, is액션바: false } : b)
})

/** 버튼필드는 `is수정할때만`까지 함께 본다 (상단바 버튼과 같은 규칙). */
const isItemVisible = (item: any) => {
  if (!toValue(item.show))
    return false
  if (item.is버튼 && item.is수정할때만)
    return !!toValue(props.is수정중)
  return true
}

const isItemReadonly = (item: any) => {
  if (props.needCan수정)
    return !(toValue(props.is수정중) && props.can?.수정 && toValue(item.canEdit))
  return !toValue(props.is수정중) || !toValue(item.canEdit)
}
</script>

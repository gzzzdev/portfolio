<template>
  <component
    :is="Card"
    v-bind="isAdd ? { label: props.label } : props.item"
    :is-add="isAdd"
    :data-list-idx="isAdd ? undefined : props.idx"
    class="cursor-pointer"
    :class="{ 'min-w-full col-span-full': !isAdd && !isRow && selected && props.can확장 }"
    :item-cls="itemCls"
    :is-selected="selected"
    :is-expand="selected"
    :can확장="props.can확장"
    :그림칸="props.그림칸"
    :표지비율="props.표지비율"
    @click="onClick"
  >
    <template
      v-if="!isAdd && props.item?.header"
      #header
    >
      <View렌더 :model-value="props.item.header" />
    </template>
    <template
      v-if="!isAdd"
      #trailing
    >
      <slot
        name="trailing"
        v-bind="slotScope"
      />
    </template>
    <template
      v-if="!isAdd && selected && !props.deferBody"
      #body
    >
      <view상세4
        v-if="props.item?.model"
        v-model:is수정중="is수정중"
        is투명
        class="p-0!"
        :model-value="props.item.model"
        :can="props.can"
        @on-close="emit('close')"
      />
      <template v-else>
        <View렌더
          v-if="props.item?.content"
          class="ml-3 my-3"
          :model-value="props.item.content"
        />
        <slot
          name="body"
          v-bind="slotScope"
        />
      </template>
    </template>
  </component>
</template>

<script lang="ts">
// `Props`·`toProps` 는 밖(`m/Sortable` 의 item 슬롯)이 쓴다. 값 export 는 setup 블록에
// 못 두므로 여기 선다 — 두 블록은 한 모듈로 합쳐지니 setup 에서 그대로 보인다.
// `Props`·`toProps` 는 밖(`Sortable` 의 item 슬롯)이 쓴다. 값 export 는 setup 블록에
// 못 두므로 여기 선다 — 두 블록은 한 모듈로 합쳐지니 setup 에서 그대로 보인다.
import type { ListCardItem } from '../types'

export interface Props {
  item?: ListCardItem
  idx?: number
  type?: 'landscape' | 'portrait' | 'row'
  selected?: boolean
  can확장?: boolean
  isAdd?: boolean
  label?: string
  /** true면 body를 카드 안에 그리지 않음 (Sortable item-bot 등 외부 렌더용) */
  deferBody?: boolean
  /**
   * 그림 자리를 둘지. **카드가 아니라 목록이 정한다** — 목록에 그림 있는 행이 하나라도 있으면
   * 모든 카드가 자리를 갖고(없는 카드는 아이콘 타일), 하나도 없으면 아무도 안 갖는다.
   * 카드 혼자 정하면 사진 없는 회원 한 명만 글줄이 어긋나거나, 메모처럼 전부 그림이 없는
   * 목록이 회색 네모로 도배된다. 안 주면(목록 밖에서 카드만 쓸 때) 카드가 제 그림으로 정한다.
   */
  그림칸?: boolean
  /** 세로카드 표지 칸 비율 — 이것도 목록이 정한다(첫 장의 `표지비율`). 안 주면 카드가 제 값으로 */
  표지비율?: string
  can?: {
    생성?: boolean
    수정?: boolean
    삭제?: boolean
  }
}

export function toProps(p: Props): Props {
  return {
    item: p.item,
    idx: p.idx,
    type: p.type,
    selected: p.selected,
    can확장: p.can확장,
    isAdd: p.isAdd,
    label: p.label,
    deferBody: p.deferBody,
    그림칸: p.그림칸,
    표지비율: p.표지비율,
    can: p.can
  }
}
</script>

<script setup lang="ts">
import Portrait from './portrait.vue'
import Landscape from './landscape.vue'
import Row from './row.vue'
import type { Component } from 'vue'
import { selectionCls } from '~base-comps/m/_스킨'

const props = withDefaults(defineProps<Props>(), {
  item: undefined,
  idx: 0,
  type: 'row',
  selected: false,
  can확장: false,
  isAdd: false,
  label: undefined,
  deferBody: false,
  그림칸: undefined,
  표지비율: undefined,
  can: () => ({
    생성: false,
    수정: false,
    삭제: false
  })
})

const emit = defineEmits<{
  select: []
  close: []
  add: []
}>()

const is수정중 = defineModel<boolean>('is수정중', { default: false })

const isAdd = computed(() => props.isAdd)
const isRow = computed(() => props.type === 'row')
const selected = computed(() => props.selected)

const Card = computed<Component>(() => {
  if (props.type === 'portrait') return Portrait
  if (props.type === 'landscape') return Landscape
  return Row
})

/**
 * 선택 표시 — 클래스도 근거도 전부 `m/테마/선택표시.ts` 가 정본이다. 여기 다시 적지 말 것.
 *
 * **손잡이가 없다.** 2026-09-05 에 축(조용·보통·또렷·윤곽)을 걷어내고 한 벌로 못 박았다 —
 * 윤곽 + 틴트 + 코너 배지. 배지 마크업은 카드 셋이 각자 `_선택배지.vue` 로 그리고, 여기서는
 * 카드 겉면 클래스만 만든다. 비선택은 빈 문자열이라 목록 전체 사정(`has선택`)을 볼 필요가 없다.
 *
 * 이 함수의 유일한 읽는 곳이라, 다른 목록 부품이 생기면 여기가 아니라 `selectionCls` 를 부를 것.
 */
const itemCls = computed(() => selectionCls(selected.value))

const slotScope = computed(() => ({
  item: props.item,
  idx: props.idx,
  selected: selected.value
}))

const onClick = () => {
  if (isAdd.value) emit('add')
  else emit('select')
}
</script>

<template>
  <draggable
    v-model="idsModel"
    :item-key="ctx.idKey"
    :group="{ name: props.groupName, pull: true, put: putGroups }"
    :disabled="!ctx.props.is수정중"
    handle=".row-handle"
    :animation="150"
    :move="onMove"
  >
    <template #item="{ element: id }">
      <template v-if="ctx.is구분선Id(id)">
        <slot
          :id="id"
          name="divider"
          :depth="props.depth"
          :is-editing="ctx.props.is수정중"
          :inset="props.depth > 0"
        >
          <view구분선
            :inset="props.depth > 0"
            :is수정중="ctx.props.is수정중"
          />
        </slot>
      </template>

      <!--
        bare 의 my-2 는 행 카드의 선택 배지가 **위로 6px** 나갈 자리다
        (`m/테마/선택표시.ts` 「함정 2」). draggable 이 block div 라 이웃 margin 이
        **상쇄**되므로 두 행 사이는 16px 이 아니라 8px 이다 — 줄이면 배지가 윗 카드를 문다.
      -->
      <div
        v-else-if="rowItem(id)"
        data-kind="row"
        :class="ctx.props.bare
          ? 'my-2'
          : 'border border-default px-2 my-1 rounded-md'"
      >
        <slot
          :id="id"
          name="item-top"
          :item="rowItem(id)!"
          :depth="props.depth"
        />

        <div
          :class="ctx.props.folderFrameClass"
          class="flex flex-col"
        >
          <div class="w-full flex flex-row items-center gap-2">
            <mButton
              v-if="can접기(id)"
              size="xs"
              역할="조용"
              square
              class="shrink-0"
              :icon="ctx.isCollapsed(id) ? 'i-lucide-chevron-right' : 'i-lucide-chevron-down'"
              :aria-label="ctx.isCollapsed(id) ? '펴기' : '접기'"
              :aria-expanded="!ctx.isCollapsed(id)"
              @click.stop="ctx.toggleCollapsed(id)"
            />
            <div
              v-else-if="ctx.props.is계층"
              class="size-6 shrink-0"
              aria-hidden="true"
            />

            <div
              v-if="ctx.props.is수정중"
              class="row-handle"
            >
              <slot
                :id="id"
                name="row-handle"
                :item="rowItem(id)!"
                :depth="props.depth"
                :is-editing="ctx.props.is수정중"
              >
                <LazyUIcon
                  name="i-lucide-grip-vertical"
                  class="cursor-grab z-999"
                />
              </slot>
            </div>

            <slot
              :id="id"
              name="item-label"
              :item="rowItem(id)!"
              :depth="props.depth"
              :is-editing="ctx.props.is수정중"
              :is-selected="ctx.selected.value === id"
              :select="() => selectRow(id)"
            >
              <span class="py-1.5">{{ rowItem(id)?.label }}</span>
            </slot>

            <slot
              :id="id"
              name="item-trailing"
              :item="rowItem(id)!"
              :depth="props.depth"
              :is-editing="ctx.props.is수정중"
            />
          </div>

          <!-- 계층 모드: 구분선 제외 모든 item이 childIds 드롭 존 -->
          <Sortable2List
            v-if="ctx.props.is계층 && rowItem(id) && !ctx.isCollapsed(id)"
            v-model:ids="rowItem(id)!.childIds!"
            :depth="props.depth + 1"
            group-name="items-shared"
            :put-groups="['mixed-root', 'items-shared']"
            class="pl-3"
          >
            <template
              v-for="(_, name) in $slots"
              :key="name"
              #[name]="slotData"
            >
              <slot
                :name="name"
                v-bind="slotData || {}"
              />
            </template>
          </Sortable2List>
        </div>

        <slot
          :id="id"
          name="item-bot"
          :item="rowItem(id)!"
          :depth="props.depth"
        />
      </div>
    </template>
  </draggable>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import draggable from 'vuedraggable'
import view구분선 from './_view구분선.vue'
import {
  SORTABLE2_KEY,
  type RowId,
  type Sortable2Ctx,
  type Sortable2ListSlots
} from './_types'

defineOptions({ name: 'Sortable2List' })

interface Props {
  depth?: number
  groupName: string
  putGroups?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  depth: 0,
  putGroups: () => ['mixed-root', 'items-shared']
})

defineSlots<Sortable2ListSlots>()

const idsModel = defineModel<RowId[]>('ids', { required: true })

const ctx = inject(SORTABLE2_KEY) as Sortable2Ctx

const putGroups = props.putGroups

const rowItem = (id: RowId) => ctx.itemOf(id)

/** 자식이 있을 때만 접기 토글 */
const can접기 = (id: RowId) => {
  if (!ctx.props.is계층)
    return false
  return (rowItem(id)?.childIds?.length ?? 0) > 0
}

const selectRow = (id: RowId) => {
  if (ctx.props.can선택)
    ctx.selected.value = id
}

const onMove = (evt: {
  draggedContext?: { element?: RowId }
  relatedContext?: { list?: RowId[] }
}) => {
  const draggingId = evt.draggedContext?.element
  if (draggingId == null)
    return true

  const relatedList = evt.relatedContext?.list
  if (!relatedList)
    return true

  for (const item of ctx.itemsModel.value) {
    if (!('childIds' in item) || item.childIds !== relatedList)
      continue
    if (ctx.wouldCreateCycle(draggingId, item.id))
      return false
  }
  return true
}
</script>

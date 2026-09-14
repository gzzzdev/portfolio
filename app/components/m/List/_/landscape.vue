<!--
  목록 보기 — **가로카드 = 명함.** 그림은 누군지 알아보는 **표시**(정사각 64)고, 옆에 이름과
  속성 몇 개, 배지는 바닥에 붙는다. 세 보기의 역할 구분은 `portrait.vue` 머리말이 정본이다.

  걷어낸 것 (2026-09-11): `description` 을 `평점 · 장소` 로 쪼개 핀 아이콘을 붙이던 칸 —
  템플릿(`Amanda Smith`) 잔재였고 채우는 모델이 하나도 없었다. 그 아래를 늘 `p-2` 로 비워 두던 것,
  카드 높이를 `min-h-xs`/`max-h-xs` 로 누르던 것도 같이 걷었다 — 높이는 격자 줄이 정한다.
  최소 폭은 180 → 240 이다(`useGridCols` 의 `MIN_W`). 180 이면 그림 64 를 빼고 글 칸이 80px 남짓이라
  두 글자 이름도 접혔다 — `mdc/List.vue` 가 landscape 를 뺀 이유가 그것이다.
-->
<template>
  <div class="@container relative h-full w-full min-w-0">
    <div
      v-if="props.isAdd"
      class="flex h-full min-h-24 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-md m-빈자리 px-3 py-2 text-sm"
      @click.stop="emit('click', $event)"
    >
      <UIcon
        name="i-stash-list-add-light"
        class="size-5 text-current opacity-70"
      />
      {{ props.label }}
    </div>
    <div
      v-else
      class="relative flex h-full flex-col overflow-hidden rounded-md m-층-카드 ring-1 ring-default bg-default"
      :class="props.itemCls"
      @click.stop="() => emit('click', $event)"
    >
      <!--
        pr-3.5: 우상단 선택 배지(`_선택배지.vue`) 가 카드 안으로 먹는 12px 자리. 선택과 무관하게 늘 비운다 — 고를 때만 비우면 글줄이 다시 접혀 덜컹인다.
        **`gap` 을 안 쓴다** — `Trailing`·body 는 대개 빈 칸인데도 flex 자식이라 gap 을 한 번씩 먹는다(16px). 간격은 배지가 `mt-2` 로 진다.
      -->
      <div class="flex grow flex-col p-3 pr-3.5">
        <template v-if="can확장 && isExpand">
          <Row
            v-bind="props"
            :can확장="false"
            embedded
          >
            <template #icon>
              <slot name="icon" />
            </template>
            <template #trailing>
              <slot name="trailing" />
            </template>
          </Row>
        </template>
        <template v-else>
          <div class="flex min-w-0 cursor-pointer gap-3">
            <slot name="icon">
              <Picture
                v-if="is그림칸"
                :src="props.thumbnail"
                :icon="props.icon"
                :alt="props.label || '프로필'"
                :px="128"
                아이콘cls="size-7"
                class="size-16 rounded-md ring-1 ring-default"
              />
              <UIcon
                v-else-if="props.icon"
                :name="props.icon"
                :class="[styleCls.icon, 'mt-0.5 shrink-0']"
              />
            </slot>

            <slot name="header">
              <div class="flex min-w-0 flex-1 flex-col gap-0.5">
                <div
                  v-if="props.eyebrow"
                  :class="[styleCls.eyebrow, 'truncate']"
                >
                  {{ props.eyebrow }}
                </div>

                <div class="flex min-w-0 flex-row items-end gap-1">
                  <!-- 수정 표시는 라벨 **앞**에 붙는다 (`m/List/types.ts` 의 `수정표시`) -->
                  <h3 :class="[styleCls.label, 'line-clamp-2']">
                    <span
                      v-if="props.is수정됨 || props.is저장중"
                      :class="수정표시.cls"
                    ><UIcon
                      v-if="props.is저장중"
                      :name="수정표시.진행아이콘"
                      :class="수정표시.진행cls"
                    /><template v-else>{{ 수정표시.글리프 }}</template></span>{{ props.label }}
                  </h3>
                  <span
                    v-if="props.is수정됨 || props.is저장중"
                    class="sr-only"
                  >{{ 수정표시.말(props.is저장중) }}</span>
                  <div
                    v-if="props.label_suffix"
                    :class="styleCls.label_suffix"
                  >
                    {{ props.label_suffix }}
                  </div>
                </div>
                <p
                  v-if="props.brief || props.description"
                  :class="[styleCls.brief, 'line-clamp-2']"
                >
                  {{ props.brief || props.description }}
                </p>
              </div>
            </slot>
          </div>

          <div class="grow" />

          <Badges
            class="mt-2"
            :badges="props.badges"
            :max="props.badgeN"
          />

          <Trailing
            :actions="props.actions"
            is압축
          >
            <slot name="trailing" />
          </Trailing>
        </template>

        <div
          class="min-w-0"
          @click.stop
        >
          <slot
            name="body"
            :item="props"
          >
            <slot :item="props" />
          </slot>
        </div>
      </div>
    </div>

    <!-- 카드 **밖**. 안쪽은 `overflow-hidden` 이라 코너에 못 걸친다 (`m/테마/선택표시.ts` 「함정 2」) -->
    <SelectionBadge :선택됨="props.isSelected" />
  </div>
</template>

<script setup lang="ts">
import { styleCls, 수정표시, type ListCardItem } from '../types'
import Badges from './_Badges.vue'
import Trailing from './_Trailing.vue'
import Row from './row.vue'
import SelectionBadge from './_선택배지.vue'
import Picture from './_그림.vue'

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const props = withDefaults(defineProps<ListCardItem & {
  itemCls?: string | string[]
  isAdd?: boolean
  can확장?: boolean
  /** 그림 자리를 둘지 — 목록이 정한다(`Item.vue`). 안 주면 제 그림이 있을 때만 */
  그림칸?: boolean
}>(), {
  isAdd: false,
  can확장: false,
  eyebrow: undefined,
  label: undefined,
  label_suffix: undefined,
  brief: undefined,
  description: undefined,
  thumbnail: undefined,
  badges: () => ([]),
  badgeN: 3,
  actions: () => [],
  isSelected: false,
  isExpand: false,
  is수정됨: false,
  is저장중: false,
  그림칸: undefined
})

const is그림칸 = computed(() => props.그림칸 ?? !!props.thumbnail)
</script>

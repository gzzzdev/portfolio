<!--
  목록 보기 — **줄.** 이름을 훑는다. 그림은 누군지 알아보는 **표시**(정사각 44).
  세 보기의 역할 구분은 `portrait.vue` 머리말이 정본이다.
-->
<template>
  <div
    :class="props.embedded ? 'w-full' : 'w-full px-2'"
    @click="() => emit('click', $event)"
  >
    <button
      v-if="!props.embedded && props.isAdd"
      type="button"
      class="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md m-빈자리 px-3 py-2 text-sm"
    >
      <UIcon
        name="i-stash-list-add-light"
        class="size-5 text-current opacity-70"
      />
      {{ props.label }}
    </button>
    <div
      v-else
      class="relative"
    >
      <div
        :class="[
          'relative overflow-hidden rounded-md',
          props.embedded
            ? 'bg-transparent'
            : ['p-2.5 pr-4 ring-1 ring-default bg-default m-층-카드', props.itemCls]
        ]"
      >
        <div class="flex w-full min-w-0 cursor-pointer flex-row items-center gap-3">
          <slot name="icon">
            <Picture
              v-if="is그림칸"
              :src="props.thumbnail"
              :icon="props.icon"
              :alt="props.label || '프로필'"
              :px="88"
              class="size-11 rounded-md"
            />
            <UIcon
              v-else-if="props.icon"
              :name="props.icon"
              :class="[styleCls.icon, 'shrink-0']"
            />
          </slot>

          <slot name="header">
            <div class="flex min-w-0 flex-1 flex-col gap-0.5">
              <!--
                **라벨이 이긴다.** 라벨은 제 폭을 먼저 갖고(`shrink-0 max-w-full`) eyebrow 는 남은 자리만
                갖는다(`flex-1 min-w-0`). 예전엔 거꾸로 eyebrow 가 `shrink-0 whitespace-nowrap` 이라
                eyebrow 가 길면 라벨이 폭 0 으로 사라졌다(`model문서.sub` 가 `독자 · 요약` 한 문장이다).
              -->
              <div class="flex min-w-0 flex-row items-baseline gap-1.5">
                <!--
                  수정 표시는 라벨 **앞**에 붙는다 (`m/List/types.ts` 의 `수정표시`).
                  `embedded`(카드가 펼쳐졌을 때 이 줄이 그 카드의 머리글이 된다) 에서도 그린다.
                -->
                <h3 :class="[styleCls.label, 'max-w-full shrink-0 truncate', { 'text-dimmed italic': !props.label }]">
                  <span
                    v-if="props.is수정됨 || props.is저장중"
                    :class="수정표시.cls"
                  ><UIcon
                    v-if="props.is저장중"
                    :name="수정표시.진행아이콘"
                    :class="수정표시.진행cls"
                  /><template v-else>{{ 수정표시.글리프 }}</template></span>{{ props.label || '제목 없음' }}
                </h3>
                <!-- `sr-only` 는 h3 **밖**. 안은 `truncate`(= overflow-hidden) 라 잘린다 -->
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
                <div
                  v-if="props.eyebrow"
                  :class="[styleCls.eyebrow, 'ml-1 min-w-0 flex-1 truncate']"
                >
                  {{ props.eyebrow }}
                </div>
              </div>
              <div
                v-if="props.brief"
                :class="[styleCls.brief, 'truncate']"
              >
                {{ props.brief }}
              </div>
            </div>
          </slot>

          <Badges
            :badges="props.badges"
            :max="props.badgeN"
            size="md"
            :wrap="false"
          />

          <Trailing :actions="props.actions">
            <slot name="trailing" />
          </Trailing>
        </div>

        <div
          v-if="!props.embedded"
          class="min-w-0"
          @click.stop
        >
          <slot name="body" />
        </div>
      </div>

      <!-- 카드 **밖**. 안쪽은 `overflow-hidden` 이라 코너에 못 걸친다 (`m/테마/선택표시.ts` 「함정 2」) -->
      <SelectionBadge
        v-if="!props.embedded"
        :선택됨="props.isSelected"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { styleCls, 수정표시, type ListCardItem } from '../types'
import Badges from './_Badges.vue'
import Trailing from './_Trailing.vue'
import SelectionBadge from './_선택배지.vue'
import Picture from './_그림.vue'

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const props = withDefaults(defineProps<ListCardItem & {
  itemCls?: string | string[]
  isAdd?: boolean
  can확장?: boolean
  /** portrait/landscape expand 시 카드 없이 헤더만 */
  embedded?: boolean
  /** 그림 자리를 둘지 — 목록이 정한다(`Item.vue`). 안 주면 제 그림이 있을 때만 */
  그림칸?: boolean
}>(), {
  isAdd: false,
  can확장: false,
  embedded: false,
  isSelected: false,
  isExpand: false,
  is수정됨: false,
  is저장중: false,
  badges: () => [],
  badgeN: 2,
  actions: () => [],
  그림칸: undefined
})

const is그림칸 = computed(() => props.그림칸 ?? !!props.thumbnail)
</script>

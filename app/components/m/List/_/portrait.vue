<!--
  목록 보기 — **세로카드 = 표지.**

  ## 세 보기는 「그림이 무슨 역할이냐」로 갈린다 (2026-09-11)

  | 보기     | 그림의 역할        | 그림 칸                  | 읽는 법                    |
  |----------|--------------------|--------------------------|----------------------------|
  | 목록     | **표시**(누군지)   | 정사각 44                | 이름을 훑는다              |
  | 가로카드 | **표시**(누군지)   | 정사각 64, 글 왼쪽       | 명함 — 이름 + 속성 몇 개   |
  | 세로카드 | **표지**(무엇인지) | 카드 폭 전체, 16:10 고정 | 그림을 먼저 보고 고른다    |

  예전엔 이 구분이 없고 「그림을 몇 px 폭으로 줄이나」(120·64·44)만 달랐다. 그래서 16:9 그림은
  띠가 됐고, 그림이 없는 모델에서는 세로·가로카드가 거의 같은 물건이었다. 모래밭
  `sandbox/theme/list-views` 에서 옛 부품과 같은 표본으로 나란히 놓고 골랐다.

  - **그림 자리를 둘지는 목록이 정한다**(`Item.vue` 의 `그림칸`). 한 장이라도 그림이 있으면 모두
    자리를 갖고 없는 카드는 아이콘 타일로 채운다 — 격자 한 줄의 글이 같은 높이에서 시작한다.
    하나도 없으면(메모·일정·태그·자료) 아무도 안 갖는다 — 그러면 표지 없는 좁은 글 카드가 된다.
    그런 모델에 세로카드를 **숨기지는 않는다** — 저장된 보기를 강등하는 길이 하나 더 생기고,
    그림 유무가 필터에 따라 바뀌어 손잡이가 깜빡인다.
  - **표지 비율은 모델이 준다**(`BaseModel2.표지비율`, 목록은 첫 장 값으로 맞춘다). 기본 **16:10** 은
    `view/신청받기목록.vue` 의 카드와 맞췄고 표지 그림 원본(16:9)이 거의 안 잘린다. 증명사진(캐릭터)은 3:4,
    아바타(회원)는 1:1 이다. 처음엔 16:10 하나로 못 박았는데, 3:4 증명사진이 「담기」 규칙에 걸려
    칸 가운데 반만 차는 우표가 됐다 — 자리가 모양을 정하는 건 맞지만, 그 자리를 정하는 건 카드 종류가 아니라 담는 것이다.
  - **뼈대가 고정이다.** 라벨·brief 두 줄, 배지는 바닥. 겉면이 `h-full` 이라 격자 줄 높이를 채운다 —
    예전엔 겉면에 `h-full` 이 없어 한 줄의 테두리가 글 길이대로 제각각 끝났다.
-->
<template>
  <div class="@container relative h-full w-full min-w-0">
    <div
      v-if="props.isAdd"
      class="flex h-full min-h-32 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-md m-빈자리 px-3 py-2 text-sm"
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
      <div
        v-if="can확장 && isExpand"
        class="p-3"
      >
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

      <template v-else>
        <slot name="preicon" />
        <slot name="icon">
          <Picture
            v-if="is그림칸"
            :src="props.thumbnail"
            :icon="props.icon"
            :alt="props.label || '프로필'"
            :비율="props.표지비율 ?? '16 / 10'"
            :px="480"
            아이콘cls="size-10"
            class="w-full border-b border-default"
          />
        </slot>

        <!--
          pr-3.5: 우상단 선택 배지(`_선택배지.vue`) 가 카드 안으로 먹는 12px 자리. 선택과 무관하게 늘 비운다 — 고를 때만 비우면 글줄이 다시 접혀 덜컹인다.
          **이 줄기에는 `gap` 을 안 쓴다** — `Trailing`·body 는 대개 빈 칸인데도 flex 자식이라 gap 을 한 번씩 먹는다. 글 사이 간격은 머리글 묶음 안에서 진다.
        -->
        <div class="flex min-w-0 grow cursor-pointer flex-col p-3 pr-3.5">
          <UIcon
            v-if="!is그림칸 && !$slots.icon && props.icon"
            :name="props.icon"
            class="mb-2 size-6 text-muted"
          />
          <div class="flex min-w-0 flex-col gap-1">
            <slot name="header">
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
            </slot>
          </div>

          <div class="grow" />

          <Badges
            class="mt-1"
            :badges="props.badges"
            :max="props.badgeN"
          />

          <Trailing
            :actions="props.actions"
            is압축
          >
            <slot name="trailing" />
          </Trailing>

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
      </template>
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
  eyebrow: undefined,
  label: undefined,
  label_suffix: undefined,
  brief: undefined,
  description: undefined,
  thumbnail: undefined,
  badges: () => ([]),
  badgeN: 2,
  actions: () => [],
  isSelected: false,
  is수정됨: false,
  is저장중: false,
  can확장: false,
  그림칸: undefined,
  표지비율: undefined
})

const is그림칸 = computed(() => props.그림칸 ?? !!props.thumbnail)
</script>

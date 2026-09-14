<template>
  <div class="flex flex-col gap-1">
    <span
      v-if="이름"
      class="hidden text-xs text-muted sm:block"
    >{{ 이름 }}</span>
    <div
      class="relative flex flex-col rounded-xl p-[2px]"
      :class="[스킨.트랙, 세로 ? '' : 'sm:flex-row']"
    >
      <span
        class="pointer-events-none absolute inset-x-[2px] top-[2px] rounded-lg transition-[transform,opacity] duration-200 ease-out"
        :class="[스킨.칸(true), 세로 ? '' : 'sm:hidden']"
        :style="알약('세로')"
      />
      <span
        v-if="!세로"
        class="pointer-events-none absolute inset-y-[2px] left-[2px] hidden rounded-lg transition-[transform,opacity] duration-200 ease-out sm:block"
        :class="스킨.칸(true)"
        :style="알약('가로')"
      />
      <button
        v-for="(칸, i) in items"
        :key="String(칸.value)"
        type="button"
        class="relative z-10 flex h-[28px] min-w-0 items-center justify-center gap-1 rounded-lg text-xs leading-none transition-colors"
        :class="[
          세로 ? 'sm:justify-start sm:px-2' : 'sm:flex-1',
          i === idx ? 'font-semibold' : '',
          스킨.글자(i === idx)
        ]"
        :title="칸.title ?? 칸.label"
        :aria-pressed="i === idx"
        @click="model = 칸.value"
      >
        <UIcon
          :name="칸.icon"
          class="size-[14px] shrink-0"
          :class="세로 ? '' : 'sm:hidden'"
        />
        <span class="hidden truncate sm:inline">{{ 칸.label }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T extends string | number">
/**
 * **세로 손잡이 줄에 서는 트랙 하나.** 테마 판(`m/테마/축줄s.vue`)의 `쌓기` 모양을 그대로 입는다 —
 * 이름이 위, 트랙이 아래, 고른 칸 위로 알약 하나가 미끄러진다. 껍데기·알약·글자는 `useSegmentSkin()` 이
 * 재질 축에서 준다. 손으로 적지 않으니 테마 판에서 재질을 돌리면 이것도 같이 바뀐다.
 *
 * **폰 폭(sm 미만)에서는** 줄이 아이콘 폭이라 트랙을 **세로로** 세우고 이름·글자를 걷는다. 알약도 방향이
 * 달라서 둘을 깔고 CSS 로 하나만 보인다 — 폭을 JS 로 재면 서버 그림과 어긋난다.
 * `세로` 면 넓은 폭에서도 세로다(칸이 많고 글자가 긴 줄).
 *
 * 폼 칸의 `input선택기`(radio) 와 같은 스킨이지만 그건 가로로 흐르는 폼 칸이라, 좁은 세로 줄에서 쓰려고 따로 섰다.
 */
import { useSegmentSkin } from '~base-comps/m/_스킨'

interface i칸<V> { value: V, label: string, icon: string, title?: string }

const props = defineProps<{
  이름?: string
  items: i칸<T>[]
  세로?: boolean
}>()

const model = defineModel<T>({ required: true })

const 스킨 = useSegmentSkin()

const idx = computed(() => props.items.findIndex(칸 => 칸.value === model.value))

/** 칸 n 개짜리 트랙에서 idx 번째 칸을 덮는 알약. 트랙 안쪽 여백(2px × 2)을 뺀 길이를 n 등분한다 — `축줄s.vue` 와 같은 셈. */
function 알약(방향: '가로' | '세로') {
  const 한칸 = `calc((100% - 4px) / ${props.items.length})`
  const 밀기 = `${Math.max(idx.value, 0) * 100}%`
  const 보임 = idx.value < 0 ? 0 : 1
  return 방향 === '가로'
    ? { width: 한칸, transform: `translateX(${밀기})`, opacity: 보임 }
    : { height: 한칸, transform: `translateY(${밀기})`, opacity: 보임 }
}
</script>

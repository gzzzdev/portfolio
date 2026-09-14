<template>
  <div
    ref="뿌리"
    class="flex min-w-fit max-w-max flex-none flex-row items-center gap-1"
  >
    <!--
      묶음 이름은 **라벨 토글과 무관하게 늘 뜬다.** 이게 사라지면 「항목별로 나뉘어 있다」가
      테두리 하나로만 남아서, 아이콘만 켠 숙련자 화면에서 묶음이 안 읽힌다.
      대신 아주 작다 — 읽으라고 있는 게 아니라 경계를 세우려고 있다.
    -->
    <span
      v-if="이름"
      class="shrink-0 text-[0.625rem] leading-none text-dimmed"
    >{{ 이름 }}</span>

    <div class="inline-flex w-max flex-row items-center gap-0 -space-x-px whitespace-nowrap">
      <template
        v-for="(it, i) in 항목s"
        :key="it.key"
      >
        <!--
          **펼치는 것** — 값이 여럿이라 이어붙이면 줄이 길어지는 항목(제목 다섯).
          여기서만 `relative` 감싸개가 하나 더 붙는다. 그래서 모서리 둥글기가 `first:`/`last:` 가
          아니라 **셈**이다 — 감싸개 안의 버튼은 늘 첫째이자 막내라 변형이 못 읽는다.
        -->
        <div
          v-if="it.하위s"
          class="relative"
        >
          <mButton
            type="button"
            역할="조용"
            size="xs"
            :icon="it.아이콘"
            :disabled="it.막힘"
            :title="it.도움말"
            aria-haspopup="menu"
            :aria-expanded="열림 === it.key"
            :class="버튼클래스(it, i)"
            :ui="{ base: 'justify-center', leadingIcon: 아이콘크기 }"
            @click="열림 = 열림 === it.key ? null : it.key"
          >
            <span v-if="라벨보임 && it.라벨">{{ it.라벨 }}</span>
            <UIcon
              name="i-lucide-chevron-down"
              class="size-2.5 shrink-0"
            />
          </mButton>

          <!--
            `mousedown.prevent` 로 편집판의 포커스와 고른 범위를 지킨다 — 툴바mini 안에서는
            바깥 감싸개가 이미 막고 있지만, 위 줄에서도 같은 목록이 뜨므로 여기서도 막는다.
          -->
          <div
            v-if="열림 === it.key"
            class="m-층-드롭다운 absolute left-0 top-full z-30 mt-1 flex w-max min-w-28 flex-col rounded-md border border-default bg-default py-1"
            role="menu"
            @mousedown.prevent
          >
            <button
              v-for="하 in it.하위s"
              :key="하.key"
              type="button"
              role="menuitem"
              :disabled="하.막힘"
              :title="하.도움말"
              class="flex flex-row items-center gap-2 px-2 py-1 text-left text-[0.6875rem] leading-tight"
              :class="[
                하.켜짐 ? 'text-primary' : 'text-default',
                하.막힘 ? 'cursor-default text-dimmed' : 'cursor-pointer hover:bg-elevated'
              ]"
              @click="고르기(하)"
            >
              <UIcon
                :name="하.아이콘"
                class="size-3 shrink-0"
              />
              <span class="grow">{{ 하.라벨 ?? 하.key }}</span>
              <UIcon
                name="i-lucide-check"
                class="size-3 shrink-0"
                :class="하.켜짐 ? '' : 'invisible'"
              />
            </button>
          </div>
        </div>

        <mButton
          v-else
          type="button"
          역할="조용"
          size="xs"
          :icon="it.아이콘"
          :disabled="it.막힘"
          :title="it.도움말"
          :aria-pressed="it.켜짐 ?? undefined"
          :class="버튼클래스(it, i)"
          :ui="{ base: 'justify-center', leadingIcon: 아이콘크기 }"
          @click="emit('누름', it.key)"
        >
          <span v-if="라벨보임 && it.라벨">{{ it.라벨 }}</span>
        </mButton>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * **버튼 몇 개를 테두리 하나로 이어 붙인 묶음.** 앞에 작은 이름표가 붙는다.
 *
 * 목록5 필터가 쓰는 모양 그대로다 — 축 이름 + 이어붙은 칸들(`Input/선택기/S.vue` 의 `is미니`
 * 가지). 툴바에도 같은 모양을 쓰는 이유는 하는 일이 같아서다: **여럿 중에 켜진 것을 보여준다.**
 * 필터가 「지금 무엇으로 거르는 중인가」를 보여주듯, 툴바는 「커서 자리에 무엇이 걸려 있나」를
 * 보여준다. 같은 것을 다르게 그리면 사람이 두 번 배운다.
 *
 * ## 필터와 다른 점 하나
 *
 * 필터는 **고르는 것**이라 값이 모델에 있고, 여기는 **하는 것**이라 값이 문서에 있다.
 * 그래서 `v-model` 이 아니라 `켜짐`(들어오는 상태)과 `누름`(나가는 행동)으로 나뉜다 —
 * 눌렀다고 켜지는 게 아니라, 눌러서 문서가 바뀌고 그 결과로 켜진다.
 *
 * ## 펼치는 항목(`하위s`)
 *
 * **값이 넷을 넘으면 이어붙이지 않고 접는다.** 제목이 그렇다 — h1~h4 에 「본문으로」까지 다섯이라
 * 늘어놓으면 묶음 하나가 줄의 절반을 먹고, 글자 위에 뜨는 `툴바mini` 에서는 아예 화면을 벗어난다.
 * 접힌 쪽은 **지금 값이 버튼 얼굴에 남는다**(부르는 쪽이 `아이콘`·`도움말` 을 그때그때 준다).
 *
 * 나가는 신호는 접혔든 폈든 `누름` 하나다. **부르는 쪽은 이게 목록에서 왔는지 모른다** —
 * 알 필요가 없어야 접기가 모양의 문제로 남는다.
 *
 * ## 모양의 정본
 *
 * 클래스 문자열은 `S.vue` 의 `is미니` 가지에서 왔다. **지금 두 벌이다** — 셋째가 생기면
 * 그때는 이 컴포넌트로 S.vue 를 돌려세울 것. 필터 UI 를 지금 건드리는 값이 더 커서 미뤘다.
 */
import { onClickOutside, useEventListener } from '@vueuse/core'

export interface i묶음항목 {
  key: string
  아이콘: string
  /** `라벨보임` 일 때만 뜬다. 아이콘만으로 통하는 것도 라벨은 갖고 있어야 한다(도움말·검색). */
  라벨?: string
  /** `title` 로 나간다. 아이콘만 켠 상태에서 이게 유일한 설명이다. */
  도움말?: string
  켜짐?: boolean
  막힘?: boolean
  /** 있으면 **펼치는 항목**이 된다 — 누르면 아래로 목록이 뜨고, 고른 것의 `key` 가 `누름` 으로 나간다. */
  하위s?: i묶음항목[]
}

const props = withDefaults(defineProps<{
  이름?: string
  항목s: i묶음항목[]
  라벨보임?: boolean
  /**
   * 이 묶음 아이콘의 크기. **기본은 `size-3`(12px)이고, 그게 이 툴바의 밀도다.**
   * 키우는 건 예외라야 한다 — 지금 유일한 손님은 본문 편집기의 `표` 묶음인데,
   * 거기 일곱은 「어느 쪽·어느 축」을 **그림으로** 말하는 것이라(표에 줄이 붙고 빠진다)
   * 12px 로는 낙서가 된다. 실제 크기로 찍어 보고 정했다. 화살표처럼 기하로만 된 것은 12px 로 족하다.
   */
  아이콘크기?: string
}>(), { 아이콘크기: 'size-3' })

const emit = defineEmits<{ (e: '누름', key: string): void }>()

/** 지금 펴 있는 항목의 `key`. 한 묶음에 둘이 동시에 펴지지 않는다. */
const 열림 = ref<string | null>(null)
const 뿌리 = ref<HTMLElement | null>(null)
onClickOutside(뿌리, () => 열림.value = null)
/**
 * Esc 로 걷기. **묶음이 아니라 문서에 건다** — 목록은 `mousedown.prevent` 로 포커스를 안 가져가서
 * (편집판의 고른 범위를 지키려고 그렇다) 키가 이 나무로 안 온다. 눌린 데가 어디든 걷는 게 맞다.
 */
useEventListener('keydown', (ev: KeyboardEvent) => {
  if (ev.key === 'Escape' && 열림.value) 열림.value = null
})

/** 펴 둔 항목이 사라지면(표 밖으로 나가는 것처럼) 목록도 같이 걷는다. */
watch(() => props.항목s, (v) => {
  if (열림.value && !v.some(it => it.key === 열림.value)) 열림.value = null
})

function 고르기(하: i묶음항목) {
  if (하.막힘) return
  열림.value = null
  emit('누름', 하.key)
}

/**
 * 이어붙은 테두리. 양 끝만 둥글다 — 원본은 `first:`/`last:` 변형이었는데, 펼치는 항목이
 * 감싸개를 하나 더 두면서 그 변형이 감싸개 안에서만 읽혀 못 쓰게 됐다. 그래서 자리를 센다.
 */
function 버튼클래스(it: i묶음항목, i: number) {
  return [
    'min-h-0 min-w-0 rounded-none border px-1.5 py-0.5 text-[0.6875rem] leading-tight font-normal bg-transparent!',
    i === 0 ? 'rounded-s-sm' : '',
    i === props.항목s.length - 1 ? 'rounded-e-sm' : '',
    it.켜짐
      ? 'relative z-1 border-primary text-primary hover:bg-transparent!'
      : 'border-accented text-default hover:bg-transparent!',
    it.막힘 ? 'cursor-default text-dimmed' : 'cursor-pointer'
  ]
}
</script>

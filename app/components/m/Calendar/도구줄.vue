<!--
  달력 도구줄. **제목과 이동 손잡이를 붙여 둔다** — 바뀌는 값(제목)과 그 값을 바꾸는 손잡이(◀ 오늘 ▶)는
  붙어 있어야 달을 넘길 때 눈이 화면을 가로지르지 않는다. 뷰 전환만 반대쪽에 남긴다 —
  자주 안 누르고, 누르면 화면이 통째로 바뀌는 것이라 성격이 다르다.

  손잡이는 전부 있는 것이다 — `mButton 역할="조용"` 셋, `mTabs type="segment"` 하나.
  뷰 이름은 여기서 정하지 않는다. 부르는 쪽이 `탭s` 로 준다(모래밭은 달력·기간 둘).
-->
<template>
  <header class="flex flex-wrap items-center gap-x-3 gap-y-2">
    <h2 class="text-xl font-semibold tracking-tight text-highlighted tabular-nums">
      {{ 제목 }}
    </h2>

    <div class="flex items-center">
      <mButton
        icon="i-lucide-chevron-left"
        역할="조용"
        size="xs"
        square
        aria-label="이전"
        @click="emit('이전')"
      />
      <mButton
        icon="i-lucide-chevron-right"
        역할="조용"
        size="xs"
        square
        aria-label="다음"
        @click="emit('다음')"
      />
    </div>

    <mButton
      역할="조용"
      size="xs"
      label="오늘"
      @click="emit('오늘')"
    />

    <div class="grow" />

    <span
      v-if="쪽지"
      class="text-[0.72rem] tabular-nums text-dimmed"
    >{{ 쪽지 }}</span>

    <mTabs
      v-if="탭s.length > 1"
      v-model="뷰"
      :items="탭s"
      type="segment"
      size="xs"
    />
  </header>
</template>

<script setup lang="ts">
defineProps<{
  제목: string
  쪽지?: string
  탭s: { label: string, value: string }[]
}>()

const 뷰 = defineModel<string>('뷰', { required: true })

const emit = defineEmits<{
  이전: []
  다음: []
  오늘: []
}>()
</script>

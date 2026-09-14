<template>
  <!--
    아직 안 만든 화면 자리에 세우는 안내. **빈 화면을 대신하는 물건이 아니다** —
    "무엇이 없는가"와 "그동안 무엇이 되는가"를 같이 말해야 사람이 다음 걸음을 안다.
    그래서 `되는일s` 를 받는다: 그것 없이 '준비중' 넉 자만 뜨면 여기 온 사람은 자기가
    하려던 일이 아예 막혔는지 우회로가 있는지를 알 길이 없다.

    이름이 ASCII 인 이유: 자동등록 이름(`viewComingSoon`)을 템플릿에서 태그로 써야 하는데,
    한글로 **시작하는** 태그는 Vue 템플릿 파서가 태그로 읽지 못한다.
  -->
  <div class="flex h-full w-full items-center justify-center p-6">
    <div class="w-full max-w-xl rounded-xl border border-default bg-elevated/30 px-8 py-10">
      <div class="flex flex-col items-center gap-3 text-center">
        <UIcon
          :name="icon"
          class="size-9 text-dimmed"
        />
        <p class="text-[0.68rem] uppercase tracking-wide text-dimmed">
          준비중
        </p>
        <h1 class="text-xl font-semibold text-highlighted">
          {{ title }}
        </h1>
        <p
          v-if="description"
          class="max-w-md text-sm leading-6 text-muted whitespace-pre-line"
        >
          {{ description }}
        </p>
      </div>

      <!-- 막힌 것 옆에 열린 것을 같이 세운다 -->
      <div
        v-if="되는일s.length"
        class="mt-7 border-t border-default pt-5"
      >
        <p class="mb-2 text-xs font-medium text-default">
          그동안 되는 일
        </p>
        <ul class="flex flex-col gap-1.5">
          <li
            v-for="(일, i) in 되는일s"
            :key="i"
            class="flex items-start gap-2 text-sm leading-6 text-muted"
          >
            <UIcon
              name="i-lucide-check"
              class="mt-1 size-3.5 shrink-0 text-primary"
            />
            <span>{{ 일 }}</span>
          </li>
        </ul>
      </div>

      <div class="mt-6 flex justify-center">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    /** 무엇이 준비중인가. 화면 이름 그대로 적는다 */
    title?: string
    /** 왜 아직인가 · 무엇이 남았는가. 줄바꿈은 그대로 산다 */
    description?: string
    /** 이 화면이 막힌 동안에도 되는 일. 비우면 그 칸이 통째로 빠진다 */
    되는일s?: string[]
    icon?: string
  }>(),
  {
    title: '준비중입니다',
    description: '',
    되는일s: () => [],
    icon: 'i-lucide-hammer'
  }
)
</script>

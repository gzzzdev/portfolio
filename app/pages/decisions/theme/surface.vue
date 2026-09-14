<script setup lang="ts">
import { DEPTH_SLOTS, 그림자options } from '~utils/theme/축'
import { 현재테마행 } from '~models/(system)'
import { useThemeStore } from '~/stores/useThemeStore'

definePageMeta({
  제목: '상자 — 종이와 유리'
})

const theme = useThemeStore()
/** 축을 **쓰는** 일은 행을 거친다 — 값 읽기는 스토어 그대로다(`m/테마/축줄s.vue` 머리말). */
const 행 = 현재테마행()

const is투명 = ref(false)
const is중첩 = ref(false)
const is연하게 = ref(false)
</script>

<template>
  <div class="p-4 flex flex-col gap-6">
    <div>
      <h2 class="text-lg font-semibold text-highlighted">
        상자 — 종이 vs 유리
      </h2>
      <p class="text-sm text-muted mt-1">
        같은 골격에 <b>면이 다른</b> 두 상자다. <code>mBox종이</code> 는 불투명 토큰(<code>bg-default</code>),
        <code>mBox유리</code> 는 반투명(<code>bg-white/90 dark:bg-white/1</code>) + <code>backdrop-blur</code> 라
        <b>뒤가 비친다.</b> 아래 <b>진하기</b> 축을 굴리면 <b>둘 다</b> 테두리가 같이 움직인다 —
        유리의 하드코딩도 걷어냈다. 남은 차이는 <b>종이만 elevation 이 실제로 그림자를 붙인다</b>는 것.
      </p>
    </div>

    <div class="flex flex-wrap gap-4 items-center">
      <!-- 이 페이지의 주장("진하기를 굴리면 둘 다 움직인다")을 여기서 바로 확인한다 — 헤더 메뉴까지 갈 이유가 없다 -->
      <ClientOnly>
        <M테마축줄s
          :줄s="['진하기']"
          class="w-fit"
        />
      </ClientOnly>
      <mButton
        :켜짐="is투명"
        @click="is투명 = !is투명"
      >
        is투명
      </mButton>
      <mButton
        :켜짐="is중첩"
        @click="is중첩 = !is중첩"
      >
        is중첩
      </mButton>
      <mButton
        :켜짐="is연하게"
        @click="is연하게 = !is연하게"
      >
        is연하게
      </mButton>
    </div>

    <!-- 9 vs 2 — 같은 값을 물려 나란히 둔다. 축을 굴렸을 때 갈리는 걸 보는 게 이 줄의 목적. -->
    <section class="flex flex-col gap-2">
      <h3 class="text-sm font-medium text-toned">
        나란히 — 왼쪽 mBox종이(불투명) / 오른쪽 mBox유리(반투명)
      </h3>
      <div class="flex flex-wrap gap-4">
        <div class="w-72 h-40">
          <mBox종이
            :is투명="is투명"
            :is중첩="is중첩"
            :is연하게="is연하게"
          >
            <template #top>
              <div class="text-sm font-medium text-highlighted">
                mBox종이
              </div>
            </template>
            <p class="text-sm text-muted">
              면이 <code>bg-default</code> — 불투명. 테두리는 <code>border-default</code> 라 진하기 축을 따라 움직인다.
            </p>
          </mBox종이>
        </div>

        <div class="w-72 h-40">
          <mBox유리
            :is투명="is투명"
            :is중첩="is중첩"
            :is연하게="is연하게"
          >
            <template #top>
              <div class="text-sm font-medium text-highlighted">
                mBox유리
              </div>
            </template>
            <p class="text-sm text-muted">
              면이 알파 + <code>backdrop-blur</code> — 뒤가 비친다. 테두리는 축을 따라오지만
              <code>elevation</code> 은 계산만 하고 루트에 안 얹는다.
            </p>
          </mBox유리>
        </div>
      </div>
    </section>

    <!--
      층 사다리. **여기가 그림자 축을 검증하는 자리다** — 축을 굴리면 넷이 *간격을 유지한 채* 같이
      움직여야 한다. 하나만 움직이거나 넷이 겹치면 사다리가 아니라 단일 값으로 퇴화한 것이다.
      다크로 뒤집어도 볼 것: 그림자가 아니라 **흰 후광**이 사다리를 진다 (`그림자.ts` 의 `WHITE_GLOW`).
    -->
    <section class="flex flex-col gap-2">
      <h3 class="text-sm font-medium text-toned">
        층 — 축을 굴리면 넷이 같이 움직인다 (층이 있으면 선은 한 단 뒤로)
      </h3>
      <!--
        축줄s 의 `그림자` 줄이 아니라 인라인 버튼인 이유: 여기선 한 축을 끝에서 끝까지 굴려 보는 게
        목적이라 버튼 두 개로 족하다. (2026-09-05 부터 `그림자` 은 축줄s 에도 트랙으로 있다)
      -->
      <ClientOnly>
        <div class="flex flex-wrap items-center gap-1">
          <span class="me-1 text-xs text-muted">그림자</span>
          <button
            v-for="(칸, i) in 그림자options"
            :key="칸.value"
            type="button"
            class="rounded-md border border-accented px-2 py-1 text-xs transition-colors"
            :class="theme.elevation === 칸.value ? 'border-inverted font-semibold text-highlighted' : 'text-dimmed hover:text-default'"
            @click="행.축앉히기('elevation', i)"
          >
            {{ 칸.label }}
          </button>
        </div>
      </ClientOnly>
      <div class="flex flex-wrap gap-4">
        <div class="w-44 h-28">
          <mBox종이 :층="0">
            <div class="text-xs text-muted">
              0 · 종이 (층 없음)
            </div>
          </mBox종이>
        </div>
        <div
          v-for="(이름, i) in DEPTH_SLOTS"
          :key="이름"
          class="w-44 h-28"
        >
          <mBox종이 :층="(i + 1) as 0 | 1 | 2 | 3 | 4">
            <div class="text-xs text-muted">
              {{ i + 1 }} · {{ 이름 }}
            </div>
          </mBox종이>
        </div>
      </div>
    </section>
  </div>
</template>

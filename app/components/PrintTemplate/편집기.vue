<template>
  <!--
    좌: 디자인틀목록(무엇을 만들지) / 중: 디자인틀 캔버스 / 우: 레이어 컨트롤(어떻게 배치할지).
    디자인틀 선택은 레이어 편집과 성격이 다르므로 오른쪽 패널에 얹지 않고 캔버스 반대편에 세운다.
    폭 조절은 mSplitter 안에 mSplitter — 바깥은 [디자인틀목록+캔버스] : [패널],
    안쪽은 [디자인틀목록] : [캔버스]. 안쪽 비율은 자기 컨테이너 기준이라 서로 간섭하지 않는다.
  -->
  <div class="h-[calc(100dvh-4.75rem)] min-h-0 w-full">
    <mSplitter v-model="작업ratio">
      <template #left>
        <mSplitter v-model="디자인틀목록ratio">
          <template #left>
            <Catalog
              v-model="틀"
              v-model:선택="선택"
            />
          </template>

          <template #right>
            <div class="flex h-full min-h-0 flex-col bg-elevated/30">
              <!--
                열어 둔 디자인틀에 대한 띠. 이름 · 규격 메타 · 저장/되돌리기가 여기 모인다 —
                셋 다 "지금 열려 있는 그 디자인틀"의 것이라, 목록을 늘리고 줄이는 왼쪽
                디자인틀목록과는 다루는 대상이 다르다.
              -->
              <div class="flex shrink-0 items-center gap-2 border-b border-default px-3 py-1.5 text-xs text-muted">
                <UInput
                  v-model="틀.이름"
                  size="xs"
                  variant="none"
                  placeholder="디자인틀 이름"
                  class="w-40 shrink-0"
                  :ui="{ base: 'px-1 font-medium text-default' }"
                />
                <span>{{ 틀.규격.이름 }}</span>
                <span>{{ 틀.규격.폭mm }}×{{ 틀.규격.높이mm }}mm</span>
                <span v-if="틀.면s.length > 1">· {{ 틀.면s.length }}면</span>
                <span v-if="선택">
                  · {{ 틀.면s.length > 1 ? `${틀.면s[선택.면]?.라벨 ?? ''} ` : '' }}{{ 선택.레이어 }} 선택됨
                </span>
                <span class="hidden lg:inline">· 인쇄 {{ 인쇄폭(틀.규격) }}px @300dpi</span>

                <div class="grow" />

                <FormatBar
                  v-model="틀"
                  v-model:선택="선택"
                />
              </div>

              <div class="min-h-0 flex-1">
                <Canvas
                  v-model="틀"
                  v-model:선택="선택"
                />
              </div>
            </div>
          </template>
        </mSplitter>
      </template>

      <template #right>
        <div class="h-full border-l border-default">
          <Panel
            v-model="틀"
            v-model:선택="선택"
          />
        </div>
      </template>
    </mSplitter>
  </div>
</template>

<script setup lang="ts">
import Catalog from './목록.vue'
import FormatBar from './편집바.vue'
import Canvas from './캔버스.vue'
import Panel from './패널.vue'
import { 빈디자인틀, 인쇄폭 } from '~models/test2'
import { 글자실측키, type i글자실측, type i선택 } from './편집타입'

/** 바깥: [디자인틀목록+캔버스] 대 [레이어 패널] */
const 작업ratio = ref(74)
/** 안쪽: [디자인틀목록] 대 [캔버스] — 바깥 왼쪽 칸 안에서의 비율 */
const 디자인틀목록ratio = ref(28)

/**
 * 빈 디자인틀로 연다. 시작 배치가 코드에서 빠져 하드코딩할 id 가 없어졌고, 저장소 목록은
 * 브라우저에서 뒤늦게 온다 — 도착하면 디자인틀목록 패널이 첫 디자인틀을 연다.
 */
const 틀 = ref(빈디자인틀())
const 선택 = ref<i선택>(null)

/** 캔버스가 재서 넣고, 오른쪽 패널이 읽는다 (`글자실측키`) */
provide(글자실측키, ref<Record<string, i글자실측>>({}))
</script>

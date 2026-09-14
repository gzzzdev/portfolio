<template>
  <div class="h-[calc(100dvh-3.75rem)]">
    <mBox반응형
      v-model:ratio="ratio"
      v-model:is열림="is열림"
    >
      <template #left="{ is미니: mini }">
        <div class="h-full overflow-y-auto">
          <div
            v-if="mini"
            class="sticky top-0 z-10 flex justify-end border-b border-default bg-default/80 px-5 py-2 backdrop-blur"
          >
            <mButton
              size="sm"

              label="질문별 소계"
              trailing-icon="i-lucide-panel-right"
              @click="is열림 = true"
            />
          </div>
          <view버블분석 />
        </div>
      </template>
      <template #right>
        <div class="flex h-full flex-col">
          <!--
            좁은 화면에서 이 칸은 트랙 위로 밀려 들어온다. 여는 손잡이가 왼쪽의 버튼이므로
            닫는 손잡이도 여기 있어야 한다 — 예전엔 팝업 배경을 눌러 닫혔는데, 그 배경이 없어졌다.
            (목록5 는 이 자리를 `view상세5` 가 채우고, 그쪽은 자기 머리에 뒤로가 있다.)
          -->
          <div
            v-if="is미니"
            class="flex shrink-0 flex-row items-center border-b border-default py-1"
          >
            <mButton
              역할="조용"
              icon="i-material-symbols-light-arrow-back-ios-new-rounded"
              label="문항"
              @click="is열림 = false"
            />
          </div>
          <div class="min-h-0 grow overflow-y-auto">
            <view질문소계 />
          </div>
        </div>
      </template>
    </mBox반응형>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'layout-test',
  제목: '문항 편집',
  설명: 'mBox반응형 위에 문항을 좌우로 놓고 편집한다.',
  상태: '실사용',
  쓰는곳: '목록5·카드s'
})

const ratio = ref(55)
const is열림 = ref(false)
const { is미니 } = useResponsive()
</script>

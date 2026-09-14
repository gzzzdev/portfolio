<template>
  <div
    class="max-h-[calc(100dvh-var(--ui-layout-header-offset,var(--ui-header-height,4rem)))] w-full p-4 flex flex-col gap-8"
  >
    <mPageIntro
      eyebrow="MY ACCOUNT"
      title="내 정보"
      description="등록된 회원 정보를 확인하고 필요한 내용을 최신 상태로 관리해 주세요."
    />

    <div
      v-if="isLoading"
      class="space-y-6 py-4"
    >
      <div class="flex items-center gap-4">
        <USkeleton class="size-12 rounded-xl" />
        <div class="flex-1 space-y-2">
          <USkeleton class="h-5 w-32" />
          <USkeleton class="h-4 w-56 max-w-full" />
        </div>
      </div>
      <USeparator />
      <div class="space-y-4">
        <USkeleton
          v-for="index in 5"
          :key="index"
          class="h-10 w-full"
        />
      </div>
    </div>

    <div
      v-else-if="myMember"
      class="flex flex-col gap-5"
    >
      <div class="flex justify-end">
        <mSwitch
          v-model="is수정중"
          :left-label="is수정중 ? '읽기 모드로' : '수정하기'"
        />
      </div>

      <view상세4
        v-model="myMember"
        v-model:is수정중="is수정중"
        :can="{ 수정: true }"
      />

      <div
        v-if="is수정중 && myMember.is수정됨"
        class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"
      >
        <mButton
          class="justify-center px-5"
          size="lg"
          label="변경 취소"
          @click="myMember.do수정취소()"
        />
        <mButton
          :loading="myMember.is저장중"
          역할="강조"
          class="justify-center px-5"
          size="lg"
          label="변경사항 저장"
          @click="myMember.do저장()"
        />
      </div>
    </div>

    <UAlert
      v-else
      icon="i-lucide-user-x"
      title="회원 정보를 찾을 수 없습니다."
      description="로그인 상태를 확인한 뒤 다시 시도해 주세요."
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeMount } from 'vue'

// 새로 만든 Pinia Store 임포트
import { useMyAuthStore } from '~/stores/useMyAuthStore'

import type { model회원 as modelXX } from '~models/test2'
import { model회원s as modelXXs,
  model회원이력s,
  model역할s, model등급s, model메뉴s } from '~models/test2'

const XXs = modelXXs.getInstance()

const authStore = useMyAuthStore()

// 기존의 useAuth_legacy()에서 뽑아쓰던 전역 상태를,
// 이 페이지 전용 UI 로컬 상태로 전환 (스토어에 넣을 필요 없음)
const is수정중 = ref(false)

const isLoading = ref(true)
const myMember = ref<modelXX | null>(null)

onBeforeMount(() => {
  const myId = authStore.회원Id

  if (!myId) {
    isLoading.value = false
    return
  }

  isLoading.value = true

  Promise.all([
    XXs.read(myId),
    model메뉴s.getInstance().reads(),

    // readbymember
    model회원이력s.getInstance().reads(),
    model역할s.getInstance().reads(),
    model등급s.getInstance().reads()
  ])
    .then(([_member]) => {
      myMember.value = _member
      isLoading.value = false
    })
    .catch((error) => {
      useAlert().error(error)
      isLoading.value = false
    })
})
</script>

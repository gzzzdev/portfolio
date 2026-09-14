<template>
  <div
    class="flex h-full w-full items-center justify-center px-4 py-8"
    style="min-height: 100dvh;"
  >
    <div class="w-full max-w-2xl">
      <UCard class="w-full">
        <template #header>
          <div class="space-y-3 text-center">
            <p class="text-xs font-medium tracking-wide text-muted">
              ADMIN ONLY
            </p>
            <h1 class="text-2xl font-semibold">
              첫 시작 준비
            </h1>
            <p class="text-sm text-muted">
              처음 시작할 때 필요한 기본 정보(권한/메뉴)를 준비합니다.
            </p>
            <UBadge :color="needInit ? 'warning' : 'success'">
              {{ needInit ? '기본 정보 없음' : '준비 완료' }}
            </UBadge>
          </div>
        </template>

        <div class="space-y-5">
          <div class="rounded-lg border border-default bg-elevated/40 px-4 py-5">
            <p class="text-sm font-semibold text-highlighted">
              현재 상태
            </p>
            <p class="mt-1 text-sm text-toned">
              권한/메뉴 기본 정보 상태
            </p>

            <p
              v-if="isChecking"
              class="mt-4 text-sm text-muted"
            >
              상태를 확인하고 있습니다...
            </p>
            <p
              v-else
              class="mt-4 text-sm text-muted"
            >
              {{ needInit ? '기본 정보가 비어 있습니다. 아래 버튼으로 바로 준비하세요.' : '기본 정보가 준비되어 있습니다. 메인으로 이동해 시작하세요.' }}
            </p>
          </div>

          <div class="flex items-center justify-center">
            <mButton
              :켜짐="needInit"
              size="lg"
              :loading="isSubmitting"
              :disabled="isChecking"
              @click="needInit ? runInit() : goHome()"
            >
              {{ needInit ? '지금 준비하기' : '메인으로 가기' }}
            </mButton>
          </div>

          <!--
            개발 계정은 초기데이터로 못 만든다 — `users` 행까지가 표의 몫이고, 신원은 `auth.users`가
            소유해서 PostgREST 밖이다. 그래서 한 칸(`users.authId`)만 이 버튼이 채운다.
          -->
          <div
            v-if="isDev"
            class="rounded-lg border border-default bg-elevated/40 px-4 py-5"
          >
            <p class="text-sm font-semibold text-highlighted">
              개발 계정
            </p>
            <p class="mt-1 text-sm text-toned">
              클릭로그인용 계정을 Supabase Auth에 만들고 회원과 잇습니다. 여러 번 눌러도 안전합니다.
            </p>
            <div class="mt-4 flex items-center gap-3">
              <mButton
                size="sm"
                :loading="is계정생성중"
                :disabled="isChecking || needInit"
                @click="run개발계정()"
              >
                개발 계정 만들기
              </mButton>
              <span
                v-if="needInit"
                class="text-sm text-muted"
              >기본 정보를 먼저 준비하세요.</span>
            </div>
            <ul
              v-if="계정결과s.length"
              class="mt-3 space-y-1 text-sm text-muted"
            >
              <li
                v-for="r in 계정결과s"
                :key="r.email"
              >
                {{ r.email }} — {{ r.상태 }}
              </li>
            </ul>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useMyAuthStore } from '~/stores/useMyAuthStore'

definePageMeta({
  layout: 'layout-none'
})

const authStore = useMyAuthStore()
const is관리자 = computed(() => authStore.is관리자)
const 시스템 = useSystem()

const isChecking = ref(true)
const isSubmitting = ref(false)
const needInit = ref(false)

const isDev = Boolean(useRuntimeConfig().public.isDev)
const is계정생성중 = ref(false)
const 계정결과s = ref<{ email: string, 상태: string }[]>([])

const run개발계정 = async () => {
  if (!isDev || !is관리자.value) return
  is계정생성중.value = true
  try {
    const 답 = await $fetch<{ 결과s: { email: string, 상태: string }[] }>('/auth/dev/accounts', {
      method: 'POST',
      credentials: 'include'
    })
    계정결과s.value = 답?.결과s ?? []
  } catch (error) {
    useAlert().show('개발 계정 만들기 실패', (error as Error)?.message ?? String(error))
  } finally {
    is계정생성중.value = false
  }
}

const goHome = () => navigateTo('/')

const refreshStatus = async () => {
  if (!is관리자.value) {
    await goHome()
    return
  }
  isChecking.value = true
  try {
    await 시스템.reads()
    needInit.value = 시스템.is초기데이터.value
  } finally {
    isChecking.value = false
  }
}

const runInit = async () => {
  if (!is관리자.value) {
    await goHome()
    return
  }
  if (!needInit.value) {
    await goHome()
    return
  }

  isSubmitting.value = true
  try {
    await 시스템.do초기데이터({ skipConfirm: true, ensureRead: true })
    await goHome()
  } finally {
    isSubmitting.value = false
  }
}

await refreshStatus()
</script>

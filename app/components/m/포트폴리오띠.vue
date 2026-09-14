<!--
  포트폴리오 띠. **이 리포(portfolio)에만 있는 줄이다** — 제품(base)에는 없다.

  **모든 화면 맨 위에 서고, 포트폴리오의 내비게이션이다.** 앞줄 전체가 소개 화면(`/portfolio`)으로 가는 입구고,
  오른쪽에 포트폴리오 화면 셋(소개·이력서·고민 기록)과 저장소·역할 갈아타기가 선다.
  `/` 로 걸지 않는다 — `/` 는 로그인한 사람을 역할의 첫 메뉴로 보내서(`access-control.global`) 운영자가 소개로 못 돌아온다.

  **역할 메뉴(`menus` 표)에 올리지 않는 이유** — 그 표는 제품의 것이다. 행을 넣으면 운영자 메뉴 편집 화면에
  「포트폴리오」가 뜨고, 접근제어(`access-control.global`)가 그 경로를 보호 대상으로 삼고, 역할마다 메뉴 순서까지
  손봐야 한다. 포트폴리오는 이 리포(portfolio)에만 있는 겉옷이라 겉옷 안(이 띠)에서 끝낸다.
  역할 목록·로그인은 `usePortfolio` 가 갖는다(소개 화면과 같은 목록).

  **로그인해 제품 안에 들어가면 띠를 어두운 면으로 뒤집는다.** 운영자 레이아웃 헤더도 회색 바닥(`bg-page/50`)이라
  옅은 띠(`bg-elevated/60`)가 헤더 윗줄처럼 붙어 읽혔다 — 띠는 제품 밖 겉옷이라 한눈에 갈려야 한다.
  면만이 아니라 글자·버튼 토큰까지 같이 뒤집어야 해서 색을 손으로 적지 않고 `dark` 클래스로 토큰 범위를 연다
  (Nuxt UI 토큰·`dark:` 변형이 둘 다 `.dark` 조상을 본다). 다크 모드에선 바닥보다 한 칸 더 내려간 검정이라 여전히 갈린다.
-->
<template>
  <div
    class="border-b text-sm"
    :class="지금역할 ? 'dark border-default bg-default text-default' : 'border-default bg-elevated/60'"
  >
    <div class="mx-auto flex w-full max-w-(--ui-container) flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2">
      <NuxtLink
        to="/portfolio"
        class="group min-w-0 grow basis-72 text-default"
      >
        <span class="font-semibold text-highlighted group-hover:underline">김건엽</span>
        <span class="text-dimmed"> · </span>
        {{ 문구.띠 }}
        <span class="text-dimmed"> — </span>
        <span class="text-muted">이 서비스를 만들었습니다</span>
      </NuxtLink>

      <nav
        aria-label="포트폴리오"
        class="flex items-center gap-0.5"
      >
        <NuxtLink
          v-for="링크 in 포트폴리오링크s"
          :key="링크.to"
          :to="링크.to"
          class="rounded-md px-2 py-1 text-xs transition-colors hover:bg-elevated hover:text-highlighted"
          :class="is지금(링크.to) ? 'font-semibold text-primary' : 'text-muted'"
          :aria-current="is지금(링크.to) ? 'page' : undefined"
        >
          {{ 링크.label }}
        </NuxtLink>
      </nav>

      <div class="flex flex-wrap items-center gap-1.5">
        <span
          v-if="지금안내"
          class="inline-flex items-center gap-1.5 rounded-full border border-default px-2.5 py-0.5 text-xs text-highlighted"
        >
          <UIcon
            :name="지금안내.icon"
            class="size-3.5"
          />
          {{ 지금안내.역할 }} 계정으로 보는 중
        </span>
        <mButton
          v-if="isDev && 지금역할 !== 운영자.code"
          역할="강조"
          size="xs"
          icon="i-lucide-log-in"
          :loading="진행중 === 운영자.email"
          :disabled="Boolean(진행중)"
          @click="둘러보기(운영자)"
        >
          운영자 화면 둘러보기
        </mButton>
        <mButton
          역할="조용"
          size="xs"
          icon="i-simple-icons-github"
          :to="저장소"
          target="_blank"
          external
        >
          저장소
        </mButton>
        <UPopover
          v-if="isDev"
          v-model:open="열림"
          :content="{ align: 'end' }"
          :ui="{ content: 'z-40' }"
        >
          <mButton
            역할="조용"
            size="xs"
            trailing-icon="i-lucide-chevron-down"
            :ui="{ trailingIcon: 열림 ? 'rotate-180 transition-transform' : 'transition-transform' }"
          >
            역할 바꾸기
          </mButton>

          <template #content>
            <ul class="flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-1 p-1.5 text-sm">
              <li
                v-for="안내 in 역할s"
                :key="안내.email"
              >
                <button
                  type="button"
                  class="flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-start transition-colors hover:bg-elevated disabled:opacity-50"
                  :aria-label="`${안내.역할} 계정으로 들어가기`"
                  :aria-current="지금역할 === 안내.code ? 'true' : undefined"
                  :disabled="Boolean(진행중)"
                  @click="열림 = false; 둘러보기(안내)"
                >
                  <UIcon
                    :name="진행중 === 안내.email ? 'i-lucide-loader-circle' : 안내.icon"
                    class="size-4 shrink-0 text-muted"
                    :class="{ 'animate-spin': 진행중 === 안내.email }"
                  />
                  <span class="min-w-0 grow">
                    <span class="block font-medium text-highlighted">
                      {{ 안내.역할 }}
                      <span
                        v-if="지금역할 === 안내.code"
                        class="ms-1 text-xs font-normal text-primary"
                      >지금 보는 중</span>
                    </span>
                    <span class="block text-xs text-muted">{{ 안내.볼것 }}</span>
                  </span>
                </button>
              </li>
            </ul>
          </template>
        </UPopover>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useMyAuthStore } from '~/stores/useMyAuthStore'
import { usePortfolio } from '~/composables/usePortfolio'

const route = useRoute()
const 포트폴리오링크s = [
  { label: '소개', to: '/portfolio' },
  { label: '이력서', to: '/resume' },
  { label: '고민 기록', to: '/decisions' }
]
/** 하위(`/decisions/nav` 같은 비교판)까지 켠다 */
const is지금 = (to: string) => route.path === to || route.path.startsWith(`${to}/`)
const authStore = useMyAuthStore()
const { isDev, 문구, 역할s, 저장소, 진행중, 둘러보기 } = usePortfolio()
const 운영자 = 역할s[0]!

const 열림 = ref(false)
const 지금역할 = computed(() => authStore.isLoggedIn ? authStore.currentRole : null)
/** 포트폴리오 역할 중 지금 들어가 있는 것. 목록 밖 계정(직접 로그인 등)도 로그인했으면 띠는 뒤집는다. */
const 지금안내 = computed(() => {
  if (!지금역할.value) return null
  return 역할s.find(안내 => 안내.code === 지금역할.value) ?? null
})
</script>

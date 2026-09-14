<template>
  <!--
    **`실사` 판** — 사진 히어로를 깐 기관 홈페이지 머리(`layout-official`)용. 앱 머리의 「로그인」 글자 버튼·세로 칸막이는
    사진 위에서 앱 조각처럼 튄다. 원본 사이트의 돋보기처럼 **테 없는 선 아이콘 하나**로 선다.
    글자색은 부르는 쪽이 준다(`text-inherit`) — 사진 위 흰색, 바탕이 들면 기본색.
  -->
  <div
    v-if="실사"
    class="flex shrink-0 items-center"
  >
    <UDropdownMenu
      v-if="authStore.isLoggedIn && authStore.user"
      :items="내메뉴s"
      :content="{ align: 'end' }"
    >
      <mButton
        역할="조용"
        icon="i-lucide-circle-user-round"
        :aria-label="`${memberDisplayName || '내 계정'} 메뉴`"
        :class="실사버튼"
        :ui="실사아이콘ui"
      />
    </UDropdownMenu>
    <UTooltip
      v-else
      text="로그인"
    >
      <mButton
        역할="조용"
        icon="i-lucide-circle-user-round"
        aria-label="로그인"
        :loading="authStore.isLoading"
        :class="실사버튼"
        :ui="실사아이콘ui"
        @click="is모달 = true"
      />
    </UTooltip>
    <m로그인모달 v-model:open="is모달" />
  </div>

  <div
    v-else
    class="ml-3 flex shrink-0 items-center gap-2 border-l border-default pl-3"
  >
    <template v-if="authStore.isLoggedIn && authStore.user">
      <span
        class="text-muted hidden max-w-36 truncate text-sm sm:inline cursor-pointer"
        :title="String(memberDisplayName || '')"
        @click="() => navigateTo('/my-info')"
      >
        {{ memberDisplayName }}
      </span>
      <mButton
        size="xs"
        @click="onLogout"
      >
        로그아웃
      </mButton>
    </template>
    <!--
      `:loading` 이 없으면 누른 티가 안 난다 — 모달이 닫히고 버튼은 "로그인" 그대로라
      로그인이 끝날 때까지 **아무 일도 안 일어난 것처럼** 보인다.
      `isLoading` 은 `login클릭` 이 `withLoading` 으로 올린다.
      소셜 쪽은 `oauthLogin` 이 provider 로 떠나는 길에 올린다 — 떠나기까지의 한두 초가 같은 공백이었다.
    -->
    <mButton
      v-else
      size="xs"
      :loading="authStore.isLoading"
      @click="is모달 = true"
    >
      로그인
    </mButton>

    <!--
      드롭다운이 아니라 **모달**을 연다 — 신청 상세의 「로그인하고 신청하기」와 같은 창이라
      어디서 로그인하든 모양이 하나다. 모달은 `v-else` 바깥에 둔다: 안에 두면 로그인되는 순간
      모달이 닫힘 애니메이션 없이 뜯겨 나간다.
    -->
    <m로그인모달 v-model:open="is모달" />
  </div>
</template>

<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import { useMyAuthStore } from '~/stores/useMyAuthStore'

defineProps<{
  /** 사진 히어로 머리용 아이콘 판. 위 템플릿 머리말 */
  실사?: boolean
}>()

const authStore = useMyAuthStore()

const is모달 = ref(false)

/** 개발 계정은 새로고침 없이 로그인된다 — 닫는 건 부르는 쪽 몫이다(`m로그인모달` 머리말). */
watch(() => authStore.isLoggedIn, (is로그인) => {
  if (is로그인) is모달.value = false
})

const memberDisplayName = computed(() => authStore.표시이름)

async function onLogout() {
  await authStore.logout()
  if (import.meta.client) {
    await navigateTo('/')
  }
}

/** `lDock토글` 의 `실사` 판과 같은 값 — 둘이 한 줄에 나란히 서서 모양이 어긋나면 안 된다. */
const 실사버튼 = 'text-inherit! hover:bg-current/10!'
const 실사아이콘ui = { leadingIcon: 'size-6' }

const 내메뉴s = computed<DropdownMenuItem[][]>(() => [
  [{ label: String(memberDisplayName.value || '내 계정'), type: 'label' }],
  [
    { label: '내 정보', icon: 'i-lucide-user-round', to: '/my-info' },
    { label: '로그아웃', icon: 'i-lucide-log-out', onSelect: onLogout }
  ]
])
</script>

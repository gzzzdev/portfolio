<!--
  로그인 모달. 로그인 방법 목록(`use로그인`)을 버튼으로 편다. **로그인 창은 이것 하나다.**

  여는 자리 — 머리글의 「로그인」(`m로그인4`), 그리고 "보다가 행동하려는 순간"(비회원이 신청 상세에서
  「로그인하고 신청하기」를 누를 때). 뒤쪽은 머리글까지 올라가게 하지 않고 그 자리에서 끝낸다.

  - 소셜: provider 를 다녀와 **지금 주소로** 새 문서가 뜬다. 모달은 그 문서에 없다.
  - 개발 계정: 새로고침 없이 로그인된다. 모달을 닫고 목록을 다시 읽는 건 **부르는 쪽 몫**이다
    (`회원Id` 를 watch) — 무엇을 다시 읽어야 하는지는 화면마다 달라서.
  - 비회원(`비회원신청`을 켰을 때): 이름·연락처·동의를 받아 `비회원신청` 이벤트로 넘긴다.
    익명 로그인과 신청은 부르는 쪽이 한다 — 이 모달은 "무엇으로 신청할지"만 받는다.

  ## 모양 — 「구름」 (2026-09-14, 기록 `로그인-창`)

  파스텔 구름 머리 위에 앱 마크가 걸터앉고, 소셜은 **흰 알약 + 원 타일 마크**다. 브랜드 색을 알약
  전체에 칠하지 않는 게 이 안의 요점이다 — 창에서 가장 센 색이 카카오 노랑이 되지 않는다.
  `UModal` 의 기본 머리를 안 쓰고 카드 전체를 `#content` 에 그린다(머리 모양이 곧 인상이라).
  그래서 제목·설명은 reka 의 `DialogTitle`·`DialogDescription` 으로 직접 단다 — 안 달면 읽기 도구가
  창 이름을 못 읽는다.

  파스텔은 테마 축 밖이다. `--ui-bg` 에 섞고, 다크에서는 섞는 양을 줄인다(`--파스텔`) —
  다크 바탕에 라이트만큼 섞으면 흙빛 회색이 된다(실측).
-->
<template>
  <UModal
    v-model:open="open"
    :ui="{ content: 'w-[calc(100vw-2rem)] max-w-[400px] sm:max-w-[400px] overflow-visible bg-transparent shadow-none ring-0' }"
  >
    <template #content>
      <div class="relative max-h-[calc(100dvh-2rem)] w-full overflow-y-auto rounded-[28px] bg-default ring-1 ring-default m-층-모달 [--파스텔:1] dark:[--파스텔:0.3]">
        <div
          class="pointer-events-none absolute inset-x-0 top-0 h-36"
          :style="구름칠"
        />
        <div class="h-36" />
        <button
          type="button"
          class="absolute right-3 top-3 z-10 flex size-8 items-center justify-center rounded-full bg-default/70 text-muted backdrop-blur transition-colors hover:text-highlighted"
          aria-label="닫기"
          @click="open = false"
        >
          <UIcon
            name="i-lucide-x"
            class="size-4"
          />
        </button>

        <div class="relative -mt-16 flex flex-col items-center px-7 pb-6 text-center">
          <span class="flex size-[72px] items-center justify-center rounded-[22px] bg-inverted text-[28px] font-bold text-inverted m-층-떠있음">
            {{ 마크글자 }}
          </span>
          <DialogTitle
            as="h2"
            class="mt-5 text-[22px] font-bold tracking-tight text-highlighted"
          >
            {{ 제목 }}
          </DialogTitle>
          <DialogDescription class="mt-1.5 text-sm text-muted">
            {{ 설명 }}
          </DialogDescription>

          <div class="mt-7 w-full space-y-2.5">
            <button
              v-for="방법 in 소셜s"
              :key="방법.label"
              type="button"
              class="relative flex h-12 w-full items-center justify-center rounded-full border border-default bg-default text-[15px] font-medium text-highlighted transition-all hover:border-accented hover:bg-elevated active:scale-[.99] disabled:opacity-60"
              :disabled="authStore.isLoading"
              @click="소셜클릭(방법)"
            >
              <m브랜드마크
                :이름="방법.마크!"
                타일
                원
                class="absolute left-2 size-8"
              />
              {{ 방법.label }}로 계속하기
            </button>
          </div>
          <p class="mt-5 text-xs text-dimmed">
            처음이면 이 버튼으로 바로 가입돼요
          </p>

          <!--
            비회원 신청. 로그인 버튼 **아래**에 둔다 — 회원이면 내 신청이 어디서나 보이고, 비회원은
            이 브라우저에서만 이어진다. 그 차이를 문구로 말하고 고르게 한다.
          -->
          <template v-if="비회원신청">
            <div class="mt-6 flex w-full items-center gap-3">
              <span class="h-px flex-1 bg-(--ui-border)" />
              <span class="text-xs text-dimmed">또는 비회원으로</span>
              <span class="h-px flex-1 bg-(--ui-border)" />
            </div>
            <form
              class="mt-4 w-full space-y-3 text-left"
              @submit.prevent="do비회원신청"
            >
              <UFormField
                label="이름"
                required
              >
                <UInput
                  v-model="이름"
                  class="w-full"
                  size="lg"
                  :ui="{ base: 'rounded-xl' }"
                  autocomplete="name"
                />
              </UFormField>
              <UFormField
                label="연락처"
                required
                help="신청 확인·안내 연락에만 씁니다."
              >
                <UInput
                  v-model="연락처"
                  class="w-full"
                  size="lg"
                  :ui="{ base: 'rounded-xl' }"
                  type="tel"
                  inputmode="tel"
                  autocomplete="tel"
                  placeholder="010-0000-0000"
                />
              </UFormField>
              <UCheckbox
                v-model="is동의"
                label="개인정보(이름·연락처) 수집·이용에 동의합니다."
              />
              <p class="text-xs text-muted">
                비회원 신청은 <b>이 브라우저에서만</b> 이어서 볼 수 있습니다. 나중에 이 브라우저에서 처음 쓰는 계정으로 가입하면 신청이 그 계정에 이어집니다.
              </p>
              <mButton
                type="submit"
                block
                size="lg"
                역할="강조"
                class="rounded-full"
                :loading="authStore.isLoading"
                :disabled="!!비회원불가사유"
                :label="비회원불가사유 ?? '비회원으로 신청'"
              />
            </form>
          </template>

          <!-- 개발 계정은 여닫이 안에 — 닫힌 모양이 운영 모양이다(`m개발계정`). 포트폴리오에선 소셜을 누르면 안내와 함께 편다 -->
          <m개발계정
            v-model:안내="is개발안내"
            class="mt-3"
          />
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { DialogDescription, DialogTitle } from 'reka-ui'
import { useMyAuthStore } from '~/stores/useMyAuthStore'
import { use로그인, type i로그인방법 } from '~/composables/use로그인'

withDefaults(defineProps<{
  제목?: string
  설명?: string
  /** 비회원으로 신청하는 칸을 연다. 그 회차가 `is비회원허용` 일 때만 켠다. */
  비회원신청?: boolean
}>(), {
  제목: '마장터에 오신 걸 반겨요',
  설명: '쓰던 계정으로 바로 들어오세요.',
  비회원신청: false
})

const emit = defineEmits<{
  비회원신청: [입력: { 이름: string, 연락처: string }]
}>()

const open = defineModel<boolean>('open', { default: false })

const authStore = useMyAuthStore()
const { isDev, 소셜s, 개발로그인s } = await use로그인()
const toast = useToast()

/**
 * 포트폴리오 배포(`isDev`)에선 소셜로 떠나지 않는다 — 리뷰어에게 가입을 시킬 수 없다.
 * 대신 알림을 띄우고 맨 아래 개발 계정을 안내와 함께 편다. 소셜을 누른 사람은 그 칩을 누른다.
 * 창을 닫으면 다시 접는다(열림을 기억하지 않는 `m개발계정` 과 같은 이유).
 */
const is개발안내 = ref(false)
watch(open, (is열림) => {
  if (!is열림) is개발안내.value = false
})

function 소셜클릭(방법: i로그인방법) {
  if (!isDev || !개발로그인s.value.length) return 방법.onSelect()
  is개발안내.value = true
  toast.add({
    color: 'neutral',
    icon: 'i-lucide-code-xml',
    title: '포트폴리오 사이트예요',
    description: `${방법.label} 로그인 대신 아래 개발 계정을 이용해주세요.`
  })
}

/** 앱 마크 자리. 진짜 로고가 생기면 이 글자 한 칸을 그림으로 바꾼다. */
const 마크글자 = '마'

/** 파스텔은 `--ui-bg` 에 섞는다. 양에 `--파스텔`(라이트 1 · 다크 0.3)을 곱한다. */
const 파스텔 = (색: string, 양: number) => `color-mix(in oklab, ${색} calc(${양}% * var(--파스텔, 1)), var(--ui-bg))`

/**
 * 구름 판. **밑으로 흰색을 덮어 흐리지 않고, 마스크로 투명하게 지운다.**
 * 모달은 가운데 정렬이라 카드 윗변이 반 픽셀에 걸리는데(실측 170.5px), 그러면 칠한 판의 밑단 한 줄이
 * 바깥과 반씩 섞인다. 흰 덮개로 흐리면 그 한 줄에서 덮개만 반쯤 벗겨져 **밑의 파스텔이 가는 선으로 비쳤다.**
 * 마스크로 밑단을 투명하게 만들면 섞일 색이 없어 선도 없다.
 */
const 구름칠 = {
  background: [
    `radial-gradient(60% 90% at 15% 10%, ${파스텔('#A5B4FC', 80)}, transparent 70%)`,
    `radial-gradient(55% 80% at 85% 0%, ${파스텔('#FBCFE8', 85)}, transparent 70%)`,
    `radial-gradient(70% 100% at 55% 100%, ${파스텔('#BAE6FD', 80)}, transparent 70%)`,
    파스텔('#E0E7FF', 60)
  ].join(', '),
  maskImage: 'linear-gradient(to bottom, black 40%, transparent)'
}

const 이름 = ref('')
const 연락처 = ref('')
const is동의 = ref(false)

/** 버튼이 왜 안 눌리는지 버튼 글자로 말한다. 휴대폰·일반전화 모두 9~11자리. */
const 비회원불가사유 = computed(() => {
  if (!이름.value.trim()) return '이름을 적어주세요'
  const 숫자 = 연락처.value.replace(/\D/g, '')
  if (숫자.length < 9 || 숫자.length > 11) return '연락처를 확인해주세요'
  if (!is동의.value) return '수집·이용에 동의해주세요'
  return null
})

const do비회원신청 = () => {
  if (비회원불가사유.value) return
  emit('비회원신청', { 이름: 이름.value.trim(), 연락처: 연락처.value.replace(/\D/g, '') })
}
</script>

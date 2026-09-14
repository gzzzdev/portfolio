<!--
  **쪽 보기 판.** 본문을 한글 문서처럼 **A4 쪽으로 잘라** 1쪽·2쪽으로 세로로 쌓고 인쇄해 본다.

  **판 자체는 `m쪽보기`(`app/components/m/쪽보기/`)로 옮겼다**(2026-09-14) — 어떻게 자르는지·요구·아는 한계는
  그 머리말이 정본이다. 여기는 그걸 샘플 글과 편집기 옆에 세워서 눈으로 대 보는 자리만 남았다.
  실사용 자리는 `/resources/[id]` 읽기 화면이다.

  ## 무엇을 묻는 판인가

  **흐르는 웹 본문에 「쪽」을 씌우면 읽기가 나아지나.** 한글의 2쪽 보기가 되는 건 쪽이 먼저 있어서다.
  우리 본문(md)은 폭에 맞춰 흐르는 글이라 쪽이 없다 — 그걸 씌웠을 때 무엇이 좋아지고 무엇이 깨지는지를 본다.

  ## 판정 (눈으로)

  1. **긴 글(「세 편 이어서」)에서** 2쪽이 흐름보다 한눈에 잘 들어오는가.
  2. **쪽 경계에서** 사진·표·제목이 흉하게 잘리지 않는가(`break-inside: avoid` 가 버티는가).
  3. **짧은 글(샘플 하나)에서** 쪽이 오히려 빈 종이만 늘리지 않는가.
  4. **폰 폭에서** A4 를 맞춤 배율로 줄이면 글자가 읽히는가 — 안 읽히면 폰에서는 이 모드가 없는 것이다.
  5. **인쇄** — 1쪽은 A4 세로 한 장에 한 쪽, 2쪽은 A4 가로 한 장에 두 쪽으로 나오는가.

  ## 이 판에만 있는 것

  **모드(수정·읽기)** — 요구가 「수정이 아니고 보기 모드일 때」라서, 수정이면 편집기(`mEditorMd`)만 서고
  쪽 보기 손잡이는 읽기일 때만 뜬다. 「흐름」은 지금의 보기 모드(`mEditorMd` readonly) 그대로다.
-->
<template>
  <div class="mx-auto flex w-full max-w-(--ui-container) items-start gap-3 px-4 py-8 sm:gap-6">
    <aside class="sticky top-4 w-9 shrink-0 sm:w-44">
      <m쪽보기손잡이
        v-if="읽기"
        v-model:보기="보기"
        v-model:여백mm="여백mm"
        :쪽수="판?.쪽수 ?? 1"
        :배율="판?.배율 ?? 1"
        :인쇄준비중="판?.인쇄준비중"
        :저장중="판?.저장중"
        @인쇄="판?.인쇄()"
        @저장="판?.저장($event)"
      >
        <template #앞>
          <m쪽보기트랙
            v-model="모드"
            이름="모드"
            :items="모드s"
          />
        </template>
        <template #뒤>
          <m쪽보기트랙
            v-model="고른샘플"
            이름="샘플"
            :items="샘플s"
            세로
          />
        </template>
      </m쪽보기손잡이>

      <div
        v-else
        class="flex flex-col gap-3"
      >
        <m쪽보기트랙
          v-model="모드"
          이름="모드"
          :items="모드s"
        />
        <m쪽보기트랙
          v-model="고른샘플"
          이름="샘플"
          :items="샘플s"
          세로
        />
      </div>
    </aside>

    <main class="min-w-0 flex-1">
      <div
        v-if="!읽기"
        class="mx-auto max-w-225"
      >
        <mEditorMd v-model="md" />
      </div>

      <m쪽보기
        v-else
        ref="판"
        v-model:보기="보기"
        :md="md"
        :여백mm="여백mm"
      >
        <template #흐름>
          <div class="mx-auto max-w-225">
            <mEditorMd
              v-model="md"
              readonly
            />
          </div>
        </template>
      </m쪽보기>
    </main>
  </div>
</template>

<script setup lang="ts">
import { 본문샘플s } from '~utils/mdc/samples'
import { 기본여백mm, type i쪽보기, type i저장형식 } from '~base-comps/m/쪽보기/_옵션'

definePageMeta({
  제목: '쪽 보기'
})

// ── 샘플 ────────────────────────────────────────────────────────────────
/** 샘플 하나는 한 쪽이면 끝나서 쪽 보기가 뭘 하는지 안 보인다. 그래서 셋을 이은 긴 글을 기본으로 둔다. */
const 이어서 = '__이어서'
const 샘플아이콘: Record<string, string> = { 매뉴얼: 'i-lucide-book-marked', 공지: 'i-lucide-megaphone', 과정: 'i-lucide-graduation-cap' }
const 샘플s = [
  { label: '세 편 이어서', value: 이어서, icon: 'i-lucide-layers' },
  ...본문샘플s.map(s => ({ label: s.제목, value: s.key, icon: 샘플아이콘[s.key] ?? 'i-lucide-file-text' }))
]
const 고른샘플 = ref(이어서)
const md = ref('')
watch(고른샘플, (key) => {
  md.value = key === 이어서
    ? 본문샘플s.map(s => s.md).join('\n\n')
    : 본문샘플s.find(s => s.key === key)?.md ?? ''
}, { immediate: true })

// ── 모드 ────────────────────────────────────────────────────────────────
const 모드s = [
  { value: '수정', label: '수정', icon: 'i-lucide-pencil' },
  { value: '읽기', label: '읽기', icon: 'i-lucide-eye' }
]
const 모드 = ref<'수정' | '읽기'>('읽기')
const 읽기 = computed(() => 모드.value === '읽기')

const 보기 = ref<i쪽보기>('2쪽')
const 여백mm = ref(기본여백mm)

const 판 = ref<{ 인쇄: () => Promise<void>, 저장: (형식: i저장형식) => Promise<void>, 쪽수: number, 배율: number, 인쇄준비중: boolean, 저장중: i저장형식 | null } | null>(null)
</script>

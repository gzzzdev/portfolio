<!--
  **게시판 상세도 성격을 따라 갈려야 하나**의 비교판.

  ## 이 판이 답하는 물음

  목록은 성격에 따라 넷으로 갈린다(공지·소식·질문답변·자료). 그런데 **상세는 한 벌이다** —
  `mBoard` 하나가 넷을 다 그린다. FAQ의 답을 눌러도 공지와 같은 화면이고, 자료실 글에 들어가도
  받을 파일이 본문 안 링크로만 있다. 2026-09-02에 「상세가 안 갈린다」로 적어 두고 미뤘던 자리다.

  같이 걸리는 것 둘:

  - **폭이 튄다.** 목록은 `max-w-5xl`, 상세는 `max-w-8xl` 이라 글을 열면 화면이 넓어졌다가
    뒤로 가면 좁아진다. 위 「폭 맞춤」으로 그 차이를 볼 것.
  - **`type` 이 '게시글' 로 박혀 있다.** 목록의 「구분」이 죽어 있는 것과 같은 뿌리다
    (게시글에 분류 필드가 없다 — 목록 판의 각주 참고).

  ## 판 셋

  1. **지금** — 한 벌. `mBoard` 가 넷을 다 그린다.
  2. **성격을 따라 갈린다** — 상세도 넷. FAQ는 그 자리에서 옆 질문까지 펼치고, 자료는 받기가
     본문보다 위에 서고, 소식은 그림이 먼저다.
  3. **한 벌 + 주변만 갈린다** — 본문 블록은 하나로 두고, 그 **아래**(이전·다음 / 관련 소식 /
     같은 구분 질문 / 같은 자료)만 성격이 정한다.

  ## 판 읽는 법

  - **성격을 바꿔 가며 같은 안을 볼 것.** 1번은 자료·질문에서 제일 아프고, 2번은 공지에서
    과해 보인다. 3번이 그 사이를 노린 안이다.
  - 2번과 3번의 진짜 차이는 그림이 아니라 **유지비**다. 2번은 상세가 넷이 되고
    (`Boards/Board.vue` 가 네 벌이 된다), 3번은 한 벌에 슬롯 하나가 는다.
  - 표본은 손으로 박은 값이다(`./_표본.ts`).
-->
<template>
  <div
    class="mx-auto w-full px-4 py-8"
    :class="폭맞춤 ? 'max-w-5xl' : 'max-w-8xl'"
  >
    <header class="mb-5">
      <h1 class="text-2xl font-semibold text-highlighted">
        상세도 성격을 따라 갈려야 하나
      </h1>
      <p class="mt-1 text-sm text-muted">
        목록은 넷으로 갈리는데 상세는 한 벌이다 ·
        <span class="text-highlighted">2026-09-02에 미뤄 둔 자리</span>
      </p>
    </header>

    <div class="mb-4 flex flex-wrap items-center gap-x-6 gap-y-2">
      <div class="flex flex-wrap gap-2">
        <mButton
          v-for="안 in 안s"
          :key="안.키"
          size="sm"
          역할="조용"
          :켜짐="안키 === 안.키"
          :label="안.이름"
          @click="안키 = 안.키"
        />
      </div>
      <UCheckbox
        v-model="폭맞춤"
        label="폭 맞춤 (목록과 같은 5xl)"
      />
    </div>

    <div class="mb-4 flex flex-wrap items-center gap-2">
      <span class="text-xs text-dimmed">게시판</span>
      <mButton
        v-for="칸 in 표본게시판s"
        :key="칸.슬러그"
        size="xs"
        역할="조용"
        :켜짐="성격 === 칸.형식"
        :label="칸.이름"
        @click="성격 = 칸.형식"
      />
    </div>

    <div class="mb-5 rounded-lg border border-default bg-muted px-4 py-3 text-sm leading-relaxed">
      <p>
        <span class="text-dimmed">왜 ·</span> {{ 판.왜 }}
      </p>
      <p class="mt-1">
        <span class="text-dimmed">대가 ·</span> {{ 판.대가 }}
      </p>
      <p class="mt-1">
        <span class="text-dimmed">유지비 ·</span> {{ 판.유지비 }}
      </p>
    </div>

    <div class="rounded-xl border border-default bg-default p-4 m-층-카드 sm:p-6">
      <!-- ── 안 A · 지금 (한 벌) ────────────────────────────────────── -->
      <template v-if="안키 === 'A'">
        <mBoard :post="글" />
      </template>

      <!-- ── 안 B · 성격을 따라 갈린다 ──────────────────────────────── -->
      <template v-else-if="안키 === 'B'">
        <!-- 자료 — 받으러 온 사람이다. 받기가 본문보다 위에 선다. -->
        <template v-if="성격 === 'DOCS'">
          <div class="flex flex-wrap items-baseline gap-3">
            <UBadge
              size="sm"
              :label="글.type ?? '자료'"
            />
            <h2 class="text-2xl font-bold text-highlighted">
              {{ 글.title }}
            </h2>
          </div>
          <div class="mt-4 flex flex-wrap items-center gap-4 rounded-xl border border-default bg-elevated p-4">
            <UIcon
              name="i-lucide-file-text"
              class="size-8 shrink-0 text-dimmed"
            />
            <div class="min-w-0">
              <div class="truncate font-medium text-highlighted">
                {{ 첨부이름 }}
              </div>
              <div class="text-sm text-muted tabular-nums">
                PDF · 2.4MB · {{ 글.views }}번 받음
              </div>
            </div>
            <div class="grow" />
            <mButton
              역할="강조"
              icon="i-lucide-download"
              label="받기"
            />
          </div>
          <p class="mt-4 text-sm leading-relaxed text-toned">
            교재 3판입니다. 2판과 달라진 곳은 4장(비화성음)과 부록 악보입니다.
          </p>
        </template>

        <!-- 질문·답변 — 답을 읽으러 왔고, 옆 질문도 대개 궁금하다. -->
        <template v-else-if="성격 === 'FAQ'">
          <div class="flex flex-wrap items-baseline gap-3">
            <UBadge
              size="sm"
              :label="글.type ?? '질문'"
            />
            <h2 class="text-xl font-bold text-highlighted">
              {{ 글.title }}
            </h2>
          </div>
          <div class="mt-3 rounded-xl border border-default bg-elevated p-4 text-sm leading-relaxed text-toned">
            같은 학기 안에서 한 번 옮길 수 있습니다. 데스크에 말씀해 주세요.
          </div>
          <div class="mt-5 border-t border-default pt-4">
            <h3 class="text-sm font-semibold text-highlighted">
              같이 묻는 질문
            </h3>
            <div
              v-for="옆 in 옆글s"
              :key="String(옆.id)"
              class="flex items-center gap-3 border-b border-default py-3"
            >
              <UIcon
                name="i-lucide-circle-help"
                class="size-4 shrink-0 text-dimmed"
              />
              <span class="truncate text-sm text-toned">{{ 옆.title }}</span>
              <div class="grow" />
              <UIcon
                name="i-lucide-chevron-down"
                class="size-4 shrink-0 text-dimmed"
              />
            </div>
            <p class="mt-3 text-xs text-dimmed">
              여기서 바로 펼친다 — 목록으로 나갔다 들어오지 않는다.
            </p>
          </div>
        </template>

        <!-- 소식 — 그림이 먼저다. -->
        <template v-else-if="성격 === 'CARD'">
          <div class="flex h-56 items-center justify-center rounded-xl border border-default bg-elevated">
            <UIcon
              name="i-lucide-image"
              class="size-10 text-dimmed"
            />
          </div>
          <h2 class="mt-4 text-2xl font-bold text-highlighted">
            {{ 글.title }}
          </h2>
          <p class="mt-1 text-sm text-muted tabular-nums">
            {{ 글.author }} · {{ 날짜(글.date) }} · 조회 {{ 글.views }} · 좋아요 {{ 글.likes }}
          </p>
          <p class="mt-4 text-sm leading-relaxed text-toned">
            스물세 명이 무대에 올랐습니다. 사진을 함께 올립니다.
          </p>
          <div class="mt-4 grid grid-cols-3 gap-2">
            <div
              v-for="n in 3"
              :key="n"
              class="flex h-24 items-center justify-center rounded-lg border border-default bg-elevated"
            >
              <UIcon
                name="i-lucide-image"
                class="size-5 text-dimmed"
              />
            </div>
          </div>
        </template>

        <!-- 공지 — 지금 상세가 이미 이걸 위한 것이라 거의 그대로다. -->
        <template v-else>
          <mBoard :post="글" />
          <p class="mt-3 text-xs text-dimmed">
            공지에서는 이 안이 지금과 거의 같다 — 그래서 「상세를 넷으로 나눈다」의 값은
            공지가 아니라 자료·질문에서 나온다.
          </p>
        </template>
      </template>

      <!-- ── 안 C · 한 벌 + 주변만 갈린다 ───────────────────────────── -->
      <template v-else>
        <mBoard :post="글" />
        <section class="mt-6 border-t border-default pt-4">
          <h3 class="text-sm font-semibold text-highlighted">
            {{ 주변.제목 }}
          </h3>
          <div
            v-for="옆 in 옆글s"
            :key="String(옆.id)"
            class="flex items-center gap-3 border-b border-default py-3"
          >
            <UIcon
              :name="주변.아이콘"
              class="size-4 shrink-0 text-dimmed"
            />
            <span class="truncate text-sm text-toned">{{ 옆.title }}</span>
            <div class="grow" />
            <span class="shrink-0 text-xs text-dimmed tabular-nums">{{ 날짜(옆.date) }}</span>
          </div>
          <p class="mt-3 text-xs text-dimmed">
            {{ 주변.덧 }}
          </p>
        </section>
      </template>
    </div>

    <p class="mt-4 border-t border-dashed border-default pt-3 text-xs leading-relaxed text-dimmed">
      상세의 <code>type</code> 은 지금 <code>'게시글'</code> 로 박혀 있다 — 목록의 「구분」이 죽어 있는 것과 같은 뿌리다.
      셋 중 무엇을 고르든 그 값은 <b>모델에서 온다</b>.
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { boardAttachmentUrl } from '~/composables/useBoardFilter'
import type { i게시판표시형식 } from '~models/test2'
import { 표본게시판s, 표본행s, 표본글 } from './_표본'

definePageMeta({
  제목: '게시판 상세 세 안'
})

type i안키 = 'A' | 'B' | 'C'

const 안s = [
  {
    키: 'A' as const,
    이름: 'A · 지금 (한 벌)',
    왜: '상세는 결국 「제목 · 쓴 사람 · 본문」이다. 한 벌이면 어느 게시판에서 들어와도 같은 자리에 같은 것이 있고, 고칠 데도 하나다.',
    대가: '자료실에서 받을 파일이 본문 안 링크로만 있고, FAQ에서 답 하나 보려고 목록을 나갔다 들어와야 한다. 목록은 성격을 아는데 상세는 모른다.',
    유지비: '한 벌. 지금 그대로다.'
  },
  {
    키: 'B' as const,
    이름: 'B · 성격을 따라 갈린다',
    왜: '들어온 사람이 하려는 일이 성격마다 다르다 — 자료는 받으러, 질문은 답만 보러, 소식은 그림 보러 온다. 목록이 이미 그렇게 갈려 있으니 상세도 따라가는 게 일관된다.',
    대가: '공지에서는 지금과 거의 같아서, 넷으로 나눈 값이 두 성격(자료·질문)에서만 나온다. 그리고 조합이 늘면 「이 게시판은 어떤 상세였지」를 사람이 외워야 한다.',
    유지비: '상세가 넷이 된다 — Boards/Board.vue 가 네 벌.'
  },
  {
    키: 'C' as const,
    이름: 'C · 한 벌 + 주변만',
    왜: '본문 블록은 성격과 무관하게 같다. 실제로 갈리는 건 「이 글을 읽고 나서 뭘 하나」다 — 이전 공지, 다른 소식, 옆 질문, 같은 폴더 자료. 그 자리만 갈면 값의 대부분을 가져온다.',
    대가: '자료실에서 받기 버튼이 여전히 본문 아래다. 「받으러 온 사람」에게는 B가 확실히 낫고, 이 안은 그 하나를 포기한다.',
    유지비: '한 벌 + 슬롯 하나.'
  }
]

const 안키 = ref<i안키>('A')
const 성격 = ref<i게시판표시형식>('DOCS')
const 폭맞춤 = ref(true)

const 판 = computed(() => 안s.find(안 => 안.키 === 안키.value)!)
const 행 = computed(() => 표본글(성격.value))
const 옆글s = computed(() => 표본행s(성격.value, true).slice(1, 4))

const 글 = computed(() => ({
  id: 행.value.id,
  type: 행.value.type ?? '게시글',
  title: 행.value.title,
  author: 행.value.author,
  date: 행.value.date,
  views: 행.value.views,
  likes: 행.value.likes ?? 0,
  content: 행.value.body ?? ''
}))

const 첨부이름 = computed(() =>
  (boardAttachmentUrl(행.value.body)?.split('/').pop() ?? '첨부 없음'))

/** C 안에서 성격이 정하는 건 이 블록 하나뿐이다. */
const 주변 = computed(() => ({
  LIST: { 제목: '이전 · 다음 공지', 아이콘: 'i-lucide-list', 덧: '읽고 나면 대개 그 다음 공지를 본다.' },
  CARD: { 제목: '다른 소식', 아이콘: 'i-lucide-image', 덧: '그림이 붙으면 이 자리가 카드 셋이 된다.' },
  FAQ: { 제목: '같이 묻는 질문', 아이콘: 'i-lucide-circle-help', 덧: '펼치지는 않는다 — 펼치려면 B다.' },
  DOCS: { 제목: '같은 자료', 아이콘: 'i-lucide-folder-open', 덧: '받기 버튼은 여전히 본문 아래다. 그게 이 안의 대가.' }
}[성격.value]))

const 날짜 = (d: string | Date) => new Date(d).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })
</script>

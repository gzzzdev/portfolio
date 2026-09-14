<!--
  목록 보기 셋(세로카드·가로카드·목록) — **재는 판.**

  카드 뼈대는 2026-09-11 에 이 판에서 옛 부품과 시안을 나란히 놓고 골라 실코드(`m/List/_/*`)로 옮겼다.
  무엇을 왜 골랐는지는 `_/portrait.vue` 머리말이 정본이다 — 여기 두 벌로 적지 않는다.
  시안 칸은 옮긴 뒤 걷었다(둘이 같은 그림을 그리면 한쪽은 거짓말할 일만 남는다).

  남은 일은 둘이다.

  1. **`useGridCols` 의 `MIN_H` 를 재 주는 자리.** 그 값은 카드 제 치수라 카드를 고치면 같이 움직인다.
     머리의 「첫 장」이 그 값이다 — 회원 표본·칸 폭 560 에서 읽어 거기 적는다.
  2. **가장자리 표본.** 사진 없는 회원·깨진 주소·긴 라벨·긴 eyebrow(「섞임」), 그림이 하나도 없는 목록(「메모」).
     카드를 고칠 때 이 둘을 세 보기로 다 돌려 볼 것.

  **도메인 데이터를 안 읽는다**(모래밭 규율) — 표본은 모델이 카드에 주는 값을 손으로 옮긴 것이다.
-->
<template>
  <div class="mx-auto w-full max-w-(--ui-container) px-4 py-8">
    <div class="mb-4">
      <h1 class="text-2xl font-semibold text-highlighted">
        목록 보기 셋
      </h1>
      <p class="mt-1 text-sm text-muted">
        실제 <code class="font-mono text-xs">mList</code> 를 표본·칸 폭별로 그린다.
        카드를 고치면 여기서 「첫 장」을 재서 <code class="font-mono text-xs">useGridCols</code> 의 <code class="font-mono text-xs">MIN_H</code> 에 적는다.
      </p>
    </div>

    <div
      id="손잡이"
      class="sticky top-0 z-20 -mx-4 mb-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-default bg-default/90 px-4 py-2 backdrop-blur"
    >
      <label class="flex items-center gap-2 text-xs text-muted">
        표본
        <input선택기
          v-model="표본"
          type="radio"
          :items="표본s"
          :search="false"
          is폭자동
        />
      </label>
      <label class="flex items-center gap-2 text-xs text-muted">
        보기
        <input선택기
          v-model="보기"
          type="radio"
          :items="보기s"
          :search="false"
          is폭자동
        />
      </label>
      <label class="flex items-center gap-2 text-xs text-muted">
        칸 폭
        <input선택기
          v-model="칸폭"
          type="radio"
          :items="칸폭s"
          :search="false"
          is폭자동
        />
      </label>
    </div>

    <section
      id="판"
      class="min-w-0"
      :style="칸style"
    >
      <div class="mb-2 flex flex-wrap items-baseline gap-x-3">
        <h2 class="text-sm font-medium text-highlighted">
          <code class="font-mono text-xs">mList type="{{ 보기type }}"</code>
        </h2>
        <span class="text-xs text-dimmed">{{ 재기.cols }}열 · 첫 장 {{ 재기.높이 }}px</span>
      </div>
      <div
        ref="ref칸"
        class="rounded-lg border border-dashed border-default"
      >
        <mList
          v-model:selected-id="선택id"
          :items="표본items"
          item-key="key"
          :type="보기type"
        />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useResizeObserver } from '@vueuse/core'
import type { ListCardItem, 신호색 } from '~base-comps/m/List/types'

definePageMeta({
  제목: '목록 보기 셋',
  설명: '세로카드·가로카드·목록을 실제 mList 로 표본·칸 폭별로 그린다. 카드 치수(MIN_H)를 재는 자리이자 가장자리 표본판.',
  상태: '실사용',
  쓰는곳: 'm/List/_/useGridCols 의 MIN_H · m/List/_/portrait·landscape·row'
})

/* ── 손잡이 ─────────────────────────────────────────── */

const 보기s = [
  { label: '세로카드', value: '세로카드', icon: 'i-lucide-rectangle-vertical' },
  { label: '가로카드', value: '가로카드', icon: 'i-lucide-rectangle-horizontal' },
  { label: '목록', value: '목록', icon: 'i-lucide-list' }
]
const 보기 = ref<'세로카드' | '가로카드' | '목록'>('가로카드')
/** `목록5.vue` 의 `보기type` 과 같은 사상 */
const 보기type = computed(() =>
  보기.value === '목록' ? 'row' : 보기.value === '가로카드' ? 'landscape' : 'portrait')

/** 목록5 가 실제로 서는 폭들. 360 = 폰, 560 = 분할창 왼쪽, 840 = 상세 없는 넓은 목록 */
const 칸폭s = [
  { label: '360', value: 360 },
  { label: '560', value: 560 },
  { label: '840', value: 840 },
  { label: '꽉', value: 0 }
]
const 칸폭 = ref(560)
const 칸style = computed(() => (칸폭.value ? { width: `min(100%, ${칸폭.value}px)` } : undefined))

/* ── 표본: 모델이 카드에 주는 값 그대로 (label·sub→eyebrow·brief·icon·thumbnail·badges) ── */

const 아바타 = (seed: string) => `https://api.dicebear.com/9.x/lorelei/svg?seed=${seed}`

/**
 * `model회원` — `sub` 는 `YY성별(id)`, `이미지` 는 dicebear, `badges` 는 **색 있는 것만** 남긴다
 * (등급·「정상」은 색이 없어 빠진다). `brief` 는 없다. `표지비율` 은 1:1(아바타).
 */
const 회원s: ListCardItem[] = [
  { key: 'm1', label: '김모', eyebrow: '90♂️(1001)', thumbnail: 아바타('1001'), icon: 'i-lucide-user', 표지비율: '1 / 1', badges: [{ label: '운영자', color: 'info' }] },
  { key: 'm2', label: '송서영2', eyebrow: '05♀️(1003)', thumbnail: 아바타('1003'), icon: 'i-lucide-user', 표지비율: '1 / 1', badges: [{ label: '학습자' }] },
  { key: 'm3', label: '고채민', eyebrow: '00♂️(1004)', thumbnail: 아바타('1004'), icon: 'i-lucide-user', 표지비율: '1 / 1', badges: [{ label: '휴면', color: 'warning' }] },
  { key: 'm4', label: '장준준', eyebrow: '00♂️(1005)', thumbnail: 아바타('1005'), icon: 'i-lucide-user', 표지비율: '1 / 1', badges: [] },
  { key: 'm5', label: '한수경', eyebrow: '83♀️(1006)', thumbnail: 아바타('1006'), icon: 'i-lucide-user', 표지비율: '1 / 1', badges: [{ label: '교수자' }, { label: '준회원', color: 'warning' }, { label: '휴면', color: 'warning' }] },
  { key: 'm6', label: '노상준', eyebrow: '91♂️(1007)', thumbnail: 아바타('1007'), icon: 'i-lucide-user', 표지비율: '1 / 1', badges: [] }
]

/**
 * `model캐릭터`(v2) — 증명사진이 **3:4**(생성본 597×796), `표지비율` 도 `3 / 4`.
 * `sub` 는 `나이세성별 · 지역 · 직업` 한 줄이라 좁은 세로카드에서 뒤가 잘린다 — 그 `sub` 를 검색·상세 머리글·
 * 도우미 표기가 같이 읽어서 카드 사정으로 줄이지 않았다.
 */
const 얼굴 = (파일: string) => `/uploads/ai/faces/${파일}.png`
const 캐릭터s: ListCardItem[] = [
  { key: 'p1', label: '양혜선', eyebrow: '32세♀️ · 충남 · 학생', thumbnail: 얼굴('made-1788244715191-t4kaeh6m8i'), icon: 'i-lucide-user-round', 표지비율: '3 / 4' },
  { key: 'p2', label: '손유진', eyebrow: '43세♀️ · 제주 · 공무원', thumbnail: 얼굴('made-1788245530703-kcsbsfrvxo'), icon: 'i-lucide-user-round', 표지비율: '3 / 4' },
  { key: 'p3', label: '안유지', eyebrow: '32세♀️ · 대전 · 전문직', thumbnail: 얼굴('made-1788174514337-y5edfxm9f8'), icon: 'i-lucide-user-round', 표지비율: '3 / 4' },
  { key: 'p4', label: '조현수', eyebrow: '36세♂️ · 서울', thumbnail: 얼굴('made-1788242482656-w0avkwwleln'), icon: 'i-lucide-user-round', 표지비율: '3 / 4' },
  { key: 'p5', label: '남재우', eyebrow: '28세♂️ · 충남', thumbnail: 얼굴('made-1788244345935-9wvs87jaltb'), icon: 'i-lucide-user-round', 표지비율: '3 / 4' },
  { key: 'p6', label: '김민준', eyebrow: '21세♂️ · 세종 · 직장인', thumbnail: 얼굴('made-1788244321520-4w1159z2386'), icon: 'i-lucide-user-round', 표지비율: '3 / 4' }
]

/**
 * `model역할`·`model등급` 이 실제로 `primary` 를 넣는다(`회원 N` 이 0 보다 크면). `신호색` 타입 밖인데
 * 모델 쪽 `_badges` 가 타입을 안 달아 통과하고 `목록5` 가 그대로 흘려보낸다 — 표본도 그 값을 그대로 쓴다.
 */
const 강조 = 'primary' as unknown as 신호색

/** `model역할` — 표지 그림은 16:9, `sub` 는 영문명, 배지는 `회원 N` */
const 역할s: ListCardItem[] = [
  { key: 'r1', label: '운영자', eyebrow: 'Administrator', icon: 'i-fluent:person-settings-20-regular', thumbnail: '/uploads/ai/seed/ai-generated-1787988519910-33iqyzc4uhe.jpg', badges: [{ label: '회원 2', color: 강조 }] },
  { key: 'r2', label: '교수자', eyebrow: 'Teacher', icon: 'i-hugeicons:teacher', thumbnail: '/uploads/ai/seed/ai-generated-1787988233509-5db9c7faoa.jpg', badges: [{ label: '회원 1', color: 강조 }] },
  { key: 'r3', label: '학습자', eyebrow: 'Learner', icon: 'i-hugeicons:student', thumbnail: '/uploads/ai/seed/ai-generated-1787988184743-5mjnlyi2oqw.jpg', badges: [{ label: '회원 5', color: 강조 }] },
  { key: 'r4', label: '준회원', eyebrow: 'Associate Member', icon: 'i-fluent:person-question-mark-20-regular', thumbnail: '/uploads/ai/seed/ai-generated-1787988122908-zgv8c6mgqj.jpg', badges: [{ label: '회원 0' }] },
  { key: 'r5', label: '비회원', eyebrow: 'Guest', icon: 'i-fluent:person-question-mark-20-regular', thumbnail: '/uploads/ai/seed/ai-generated-1787987843701-ha4smracz2h.jpg', badges: [{ label: '회원 0' }] }
]

/** `_콘텐츠물`(수업·행사) — 표지 16:9, `sub` 는 `toCompactDates`, `brief` 없음 */
const 콘텐츠s: ListCardItem[] = [
  { key: 'c1', label: '2026학년도 1학기', eyebrow: '26.03.02~26.06.19', icon: 'i-ph-calendar-blank-light', thumbnail: '/uploads/enroll_thumb/ai-generated-1788353015030-w4mun3iby57.jpg' },
  { key: 'c2', label: '연구방법론 입문', eyebrow: '26.03.03~26.06.16', icon: 'i-ph-chalkboard-teacher-light', thumbnail: '/uploads/enroll_thumb/ai-generated-1788353019205-k61bnflthee.jpg' },
  { key: 'c3', label: '학술논문 작성 실습', eyebrow: '26.03.05~26.06.18', icon: 'i-ph-chalkboard-teacher-light', thumbnail: '/uploads/enroll_thumb/ai-generated-1788353023072-vy9zcx2ca5.jpg' },
  { key: 'c4', label: '2026 춘계학술대회', eyebrow: '26.05.15~26.05.16', icon: 'i-ph-presentation-chart-light', thumbnail: '/uploads/enroll_thumb/ai-generated-1788353027083-r89uk0omgnl.jpg' },
  { key: 'c5', label: '제1분과: 방법론', eyebrow: '26.05.15', icon: 'i-ph-confetti-light', thumbnail: '/uploads/enroll_thumb/ai-generated-1788353031155-jfzvd4prht8.jpg' },
  { key: 'c6', label: '신입회원 오리엔테이션', eyebrow: '26.04.04', icon: 'i-ph-confetti-light', thumbnail: '/uploads/enroll_thumb/ai-generated-1788353039227-qvnq3wvkj4.jpg' }
]

/** `model메모` — 그림 없음, `sub` 비어 있음, `brief` 는 요약 */
const 메모s: ListCardItem[] = [
  { key: 'n1', label: '회비 미납자 연락', icon: 'i-material-symbols-light:task-alt', brief: '8월분 미납 12명. 문자 먼저, 사흘 뒤 전화.', badges: [{ label: '높음', color: 'warning' }] },
  { key: 'n2', label: '추계학술대회 장소 후보', icon: 'i-material-symbols-light:lightbulb-outline', brief: '코엑스·aT센터·대전컨벤션. 투표로 넘길지 이사회에서 정할지.' },
  { key: 'n3', label: '신입 오리엔테이션 자료 갱신', icon: 'i-material-symbols-light:task-alt', brief: '작년 자료에 회비 안내가 옛 금액으로 남아 있다.', is수정됨: true },
  { key: 'n4', label: '홈페이지 공지 문구', icon: 'i-material-symbols-light:edit-note-outline', brief: '' },
  { key: 'n5', label: '투표 결과 공개 범위', icon: 'i-material-symbols-light:lightbulb-outline', brief: '익명 집계라 득표수만. 참여율은 공개해도 되는지 확인.' }
]

/**
 * 가장자리만 모은다 — 사진 있는 회원 옆에 사진 없는 회원, 깨진 주소, 긴 라벨, 긴 eyebrow.
 * 깨진 주소는 `_/_그림.vue` 의 `@error` 가 아이콘 타일로 받는다(예전엔 alt 글자가 최종 상태였다).
 */
const 섞임s: ListCardItem[] = [
  회원s[0]!,
  { key: 'x1', label: '(이름 없음)', eyebrow: '00♂️(1009)', icon: 'i-lucide-user', badges: [] },
  { key: 'x2', label: '깨진 주소', eyebrow: '404', thumbnail: '/uploads/없는-그림.jpg', icon: 'i-lucide-user', badges: [{ label: '휴면', color: 'warning' }] },
  { key: 'x3', label: '아주 긴 이름이 두 줄을 넘어가면 어디서 끊기나 — 학술논문 작성 실습 심화반', eyebrow: '스태프 · 데스크와 상담 담당이 신청 한 건을 받아 등록까지 끝내는 절차', thumbnail: '/uploads/enroll_thumb/ai-generated-1788353023072-vy9zcx2ca5.jpg', badges: [{ label: '교수자' }, { label: '운영자', color: 'info' }, { label: '휴면', color: 'warning' }, { label: '회원 3' }] },
  { key: 'x4', label: '글만 있는 행', brief: '아이콘도 그림도 없다 — 머리글자로 버틴다.' },
  { ...회원s[4]!, is수정됨: true }
]

const 표본s = [
  { label: '회원', value: '회원' },
  { label: '캐릭터', value: '캐릭터' },
  { label: '역할', value: '역할' },
  { label: '수업·행사', value: '콘텐츠' },
  { label: '메모', value: '메모' },
  { label: '섞임', value: '섞임' }
]
const 표본 = ref<'회원' | '캐릭터' | '역할' | '콘텐츠' | '메모' | '섞임'>('회원')
const 표본items = computed(() => ({
  회원: 회원s,
  캐릭터: 캐릭터s,
  역할: 역할s,
  콘텐츠: 콘텐츠s,
  메모: 메모s,
  섞임: 섞임s
})[표본.value])

const 선택id = ref<string | number | null>('m2')
watch(표본, () => {
  선택id.value = 표본items.value[1]?.key ?? null
})

/* ── 재기: 열 수와 첫 장 높이 — `MIN_H` 에 적을 값 ───────────── */

const ref칸 = useTemplateRef<HTMLElement>('ref칸')
const 재기 = reactive({ cols: 0, 높이: 0 })
useResizeObserver(ref칸, () => {
  const 첫장 = ref칸.value?.querySelector<HTMLElement>('[data-list-idx="0"]')
  const 격자 = 첫장?.parentElement
  재기.cols = 보기type.value === 'row' || !격자
    ? 1
    : getComputedStyle(격자).gridTemplateColumns.split(' ').filter(Boolean).length
  재기.높이 = Math.round(첫장?.getBoundingClientRect().height ?? 0)
})
</script>

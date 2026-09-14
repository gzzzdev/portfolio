<!--
  목록 카드의 **수정 표시** — "이 카드에 아직 저장 안 된 변경이 있다".

  **골랐다 (2026-09-07): 라벨 앞 인라인 별표 `*라벨`.** 실코드는 `m/List/types.ts` 의 `수정표시` 와
  `_/portrait`·`_/landscape`·`_/row` 셋에 들어가 있고, **근거 원문은 그 `수정표시` 머리말이 정본이다** —
  여기 두 벌로 적지 않는다. 이 판에 남은 일은 하나뿐이다: 고른 값과 안 고른 값이 나란히 보이는 것.

  첫 칸(`앞 · 인라인 ★지금`)은 **부품이 자기 표시를 그린다**(`is수정됨`·`is저장중` 을 넘길 뿐이다).
  손으로 베껴 두면 값을 고칠 때 이 판이 거짓말을 한다. 나머지 셋은 이 판이 `#header` 로 얹는다.

  ## 걷어낸 것 (2026-09-07)

  처음엔 "표시를 카드 어디에 두나"로 여섯 안을 깔았는데 넷이 같은 이유로 죽었다 —
  **다 자기 영역을 요구했다.** 판에서 지웠고, 왜 죽었는지는 한 줄씩만 남긴다:

  - **좌상단 별표**(옛 값) — 카드·가로카드가 그 자리를 안 비워 eyebrow 첫 글자를 덮었다.
  - **좌상단 유지 + 패딩** — 글자를 너무 밀어낸다. 수정과 무관하게 카드마다 16px 이 늘 빠진다.
  - **왼쪽 선** — 선 자체에 뜻이 없고, 그 자리는 이미 선택 몫이다(`m/테마/선택표시.ts`).
  - **우측 저장 버튼만** — 오른쪽 아래는 `actions`·`badges`·확장 탭의 임자가 있다.
  - **라벨 옆 「저장 안 됨」 pill** — 뜻은 제일 잘 읽히는데 라벨을 한 줄 더 접는다.
    남은 넷은 이 안을 **폭 없이** 다시 쓴 것이다.

  ## 판 쓰는 법

  카드를 누르면 그 카드의 「수정됨」이 켜졌다 꺼진다. `선택 겹침` 을 켜면 수정된 카드가 동시에
  선택된 것으로 그려진다 — 두 표시가 한 카드 위에서 싸우는지를 본다.
  `상태` 를 저장중으로 돌리면 **같은 자리에서 글리프만 갈리는지**를 본다.
  보기 셋(카드·가로카드·줄)을 전부 돌릴 것.

  **줄 보기에서 걸린 별건 하나** (2026-09-07): `sub` 를 `실제` 로 두면 줄 카드의 라벨이 `2..` 로
  굶는다. `model문서.sub` 는 `독자 · 요약` 을 이어 붙인 한 문장인데 `_/row.vue` 가 그걸 라벨과
  같은 줄에 `shrink-0 whitespace-nowrap` 으로 두기 때문이다 — 폭을 eyebrow 가 다 가져가고
  `min-w-0 truncate` 인 라벨만 잘린다. **이 판과 무관한 버그**라 손잡이(`sub`)로 비켜 두었다.
  → 2026-09-11 에 고쳤다 — 이제 라벨이 제 폭을 먼저 갖고 eyebrow 가 남은 자리를 갖는다(`_/row.vue`).
  이 판의 `#header` 안들은 옛 배치를 흉내 낸 채라 `실제` 에서 여전히 굶지만, 부품 칸(★지금)은 안 굶는다.

  **머리말 markup 이 두 벌인 건 일부러다.** 줄(`row`)은 라벨과 eyebrow 가 한 줄이고
  카드·가로카드는 eyebrow 가 위에 눕는다 — 표시가 붙는 자리가 다르므로 한 벌로 못 합친다.
-->
<template>
  <div class="mx-auto w-full max-w-7xl px-4 py-8">
    <div class="mb-4 flex flex-wrap items-end gap-x-4 gap-y-2">
      <div>
        <h1 class="text-2xl font-semibold">
          수정 표시
        </h1>
        <p class="mt-1 text-sm text-muted">
          표시가 자기 영역을 갖지 않고 <b class="text-default">라벨에 붙어 따라다닐 수 있나.</b>
          카드를 누르면 그 카드의 「수정됨」이 켜진다.
        </p>
      </div>
      <div class="grow" />
      <div class="flex flex-row flex-wrap items-center gap-4">
        <label class="flex flex-row items-center gap-2 text-xs text-muted">
          보기
          <input선택기
            v-model="보기"
            type="radio"
            :items="보기s"
            :search="false"
            is폭자동
          />
        </label>
        <label class="flex flex-row items-center gap-2 text-xs text-muted">
          상태
          <input선택기
            v-model="상태"
            type="radio"
            :items="상태s"
            :search="false"
            is폭자동
          />
        </label>
        <label class="flex flex-row items-center gap-2 text-xs text-muted">
          sub
          <input선택기
            v-model="sub길이"
            type="radio"
            :items="sub길이s"
            :search="false"
            is폭자동
          />
        </label>
        <mSwitch2
          v-model="선택겹침"
          label="선택 겹침"
        />
      </div>
    </div>

    <!-- 고른 값. 근거 원문은 `m/List/types.ts` 의 `수정표시` 머리말이 정본이라 여기 안 옮긴다 -->
    <div class="mb-8 rounded-lg border border-default bg-elevated/40 p-3 text-xs leading-relaxed text-muted">
      <p>
        <b class="text-default">골랐다 (2026-09-07) · 라벨 앞 인라인 별표 <code class="text-default">*라벨</code>.</b>
        첫 칸이 지금 값이고 <b class="text-default">부품이 자기 표시를 그린다</b> —
        값은 <code class="text-default">m/List/types.ts</code> 의 <code class="text-default">수정표시</code>,
        읽는 곳은 <code class="text-default">_/portrait</code>·<code class="text-default">_/landscape</code>·<code class="text-default">_/row</code> 셋.
        왜 그 값인지는 그 머리말이 정본이다.
      </p>
      <p class="mt-2">
        나머지 셋은 <b class="text-default">안 고른 값</b>이다. 자기 영역을 요구하던 넷(좌상단 별표·패딩·왼쪽 선·우측 버튼·pill)은
        판에서 걷었고 사유는 이 파일 머리말에 한 줄씩 남겼다.
      </p>
    </div>

    <div class="mb-3 flex items-baseline gap-2 border-b border-default pb-1">
      <h2 class="text-sm font-medium text-highlighted">
        라벨에 붙어 따라다닌다
      </h2>
      <span class="text-xs text-dimmed">eyebrow·brief 는 안 건드리고 라벨 한 줄에만 붙는다. 갈리는 건 「글줄을 미느냐」 하나.</span>
    </div>

    <div class="mb-10 grid grid-cols-1 gap-8 lg:grid-cols-2 xl:grid-cols-3">
      <section
        v-for="안 in 안s"
        :key="안.key"
      >
        <h3 class="text-sm font-medium">
          {{ 안.제목 }}
        </h3>
        <p class="mt-0.5 text-xs text-muted">
          {{ 안.근거 }}
        </p>
        <p class="mt-0.5 mb-3 text-xs text-warning">
          약점 · {{ 안.약점 }}
        </p>

        <div :class="보기 === '줄' ? 'flex flex-col gap-2' : 'grid grid-cols-2 gap-3'">
          <component
            :is="카드"
            v-for="문서 in 문서s"
            :key="문서.key"
            v-bind="문서"
            :is수정됨="안.부품 && 켬(문서) && 상태 === '수정됨'"
            :is저장중="안.부품 && 켬(문서) && 상태 === '저장중'"
            :is-selected="선택겹침 && 켬(문서)"
            @click="() => 뒤집기(문서)"
          >
            <!--
                라벨에 붙는 안들. 부품의 `#header` 를 갈아 끼우되 글자 클래스는 부품의
                `styleCls` 를 그대로 쓴다 — 겉모습을 흉내 내면 여기서 고른 값이 목록에서 안 맞는다.
                내어쓰기(`앞내`)는 라벨 **줄 상자** 에 매단다. h3 안에 넣으면 줄 보기에서
                `truncate`(=overflow-hidden)에 잘린다.
              -->
            <template
              v-if="안.표시"
              #header
            >
              <!-- 줄: 라벨과 eyebrow 가 한 줄 -->
              <div
                v-if="보기 === '줄'"
                class="flex min-w-0 flex-1 flex-col gap-0.5"
              >
                <div class="relative flex min-w-0 flex-row items-baseline gap-1.5">
                  <span
                    v-if="켬(문서) && 안.표시 === '앞내'"
                    class="absolute top-0 right-full mr-1 flex flex-row items-center text-lg leading-7 text-primary"
                  >
                    <UIcon
                      v-if="상태 === '저장중'"
                      name="i-lucide-loader-circle"
                      class="size-3 animate-spin"
                    />
                    <template v-else>*</template>
                  </span>
                  <!--
                      저장중은 **같은 자리에서** 글리프를 갈아 끼운다 — 옆에 하나 더 붙이면
                      켤 때마다 글줄이 밀린다(지금 값의 2번 문제가 그것이다).
                    -->
                  <h3 :class="[styleCls.label, 'min-w-0 truncate break-keep']">
                    {{ 문서.label }}<span
                      v-if="켬(문서) && (안.표시 === '뒤' || 안.표시 === '뒤점')"
                      :class="안.표시 === '뒤' ? 'ml-1 text-primary' : 'ml-1.5 align-middle text-[0.5em] text-primary'"
                    ><UIcon
                      v-if="상태 === '저장중'"
                      name="i-lucide-loader-circle"
                      class="inline-block size-3.5 animate-spin align-middle text-primary"
                    /><template v-else>{{ 안.표시 === '뒤' ? '*' : '●' }}</template></span>
                  </h3>
                  <span
                    v-if="켬(문서)"
                    class="sr-only"
                  >{{ 상태 === '저장중' ? '저장하는 중' : '저장 안 된 변경 있음' }}</span>
                  <div
                    v-if="문서.eyebrow"
                    :class="styleCls.eyebrow"
                    class="ml-2 shrink-0 whitespace-nowrap"
                  >
                    {{ 문서.eyebrow }}
                  </div>
                </div>
                <div
                  v-if="문서.brief"
                  :class="[styleCls.brief, 'line-clamp-2']"
                >
                  {{ 문서.brief }}
                </div>
              </div>

              <!-- 카드·가로카드: eyebrow 가 라벨 위에 눕는다 -->
              <div
                v-else
                class="flex min-w-0 flex-col gap-1"
              >
                <div
                  v-if="문서.eyebrow"
                  :class="styleCls.eyebrow"
                >
                  {{ 문서.eyebrow }}
                </div>
                <div class="relative flex min-w-0 flex-row items-end gap-1">
                  <span
                    v-if="켬(문서) && 안.표시 === '앞내'"
                    class="absolute top-0 right-full mr-1 flex flex-row items-center text-lg leading-7 text-primary"
                  >
                    <UIcon
                      v-if="상태 === '저장중'"
                      name="i-lucide-loader-circle"
                      class="size-3 animate-spin"
                    />
                    <template v-else>*</template>
                  </span>
                  <!--
                      저장중은 **같은 자리에서** 글리프를 갈아 끼운다 — 옆에 하나 더 붙이면
                      켤 때마다 글줄이 밀린다(지금 값의 2번 문제가 그것이다).
                    -->
                  <h3 :class="styleCls.label">
                    {{ 문서.label }}<span
                      v-if="켬(문서) && (안.표시 === '뒤' || 안.표시 === '뒤점')"
                      :class="안.표시 === '뒤' ? 'ml-1 text-primary' : 'ml-1.5 align-middle text-[0.5em] text-primary'"
                    ><UIcon
                      v-if="상태 === '저장중'"
                      name="i-lucide-loader-circle"
                      class="inline-block size-3.5 animate-spin align-middle text-primary"
                    /><template v-else>{{ 안.표시 === '뒤' ? '*' : '●' }}</template></span>
                  </h3>
                  <span
                    v-if="켬(문서)"
                    class="sr-only"
                  >{{ 상태 === '저장중' ? '저장하는 중' : '저장 안 된 변경 있음' }}</span>
                </div>
                <div
                  v-if="문서.brief"
                  :class="[styleCls.brief, 'line-clamp-2']"
                >
                  {{ 문서.brief }}
                </div>
              </div>
            </template>
          </component>
        </div>
      </section>
    </div>

    <!--
      아직 고르지 않았다. 여기 적는 건 결론이 아니라 **판정 기준** 이다 —
      기준이 판에 적혀 있어야 다음에 열었을 때 같은 잣대로 본다.
    -->
    <div class="mt-4 rounded-lg border border-default p-4 text-xs leading-relaxed text-muted">
      <p class="mb-1 font-medium text-default">
        무엇으로 고르나 (아직 안 골랐다)
      </p>
      <p>
        <b class="text-default">1. 자기 영역을 요구하지 않는가.</b> 탈락한 넷이 전부 여기서 죽었다 —
        자리를 비우면 글자를 밀고, 오른쪽 아래는 이미 임자가 있고, 왼쪽 선은 자리를 안 먹는 대신
        선 자체에 뜻이 없다. 남은 계열은 하나뿐이다: <b class="text-default">라벨에 붙어 따라다닌다.</b>
        eyebrow·brief 는 손대지 않는다.
      </p>
      <p class="mt-2">
        <b class="text-default">2. 글줄을 미는가.</b> 여기서 세 후보가 갈린다.
        <code class="text-default">앞·인라인</code> 은 라벨을 한 글자 민다 — 목록을 세로로 훑을 때
        <b class="text-default">라벨 왼쪽 끝이 행마다 어긋난다.</b>
        <code class="text-default">앞·내어쓰기</code> 는 라벨 줄 상자 밖(<code>right-full</code>)에 매달아
        <b class="text-default">아무것도 안 민다</b> — 대신 카드 안쪽 여백 12px 에 얹히므로 그 자리가 있어야 한다.
        <code class="text-default">뒤</code> 는 왼쪽 끝을 안 건드리는 대신 라벨이 길면 밀려난다.
      </p>
      <p class="mt-2">
        <b class="text-default">3. 줄 보기에서 살아남는가.</b> <code class="text-default">_/row.vue</code> 의
        라벨은 <code class="text-default">truncate</code>(= overflow-hidden)다. 표시를 h3 <b class="text-default">안</b>에
        넣으면 내어쓰기가 잘린다 — 그래서 이 판은 라벨 <b class="text-default">줄 상자</b>에 매단다.
        실코드로 옮길 때 제일 먼저 깨질 자리라 줄 보기로 꼭 확인할 것.
      </p>
      <p class="mt-2">
        <b class="text-default">4. 저장중이 같은 자리에서 이어지는가.</b> 수정됨 → 저장중 → 깨끗은 한 축의
        세 칸이다. 표시가 자리를 옮기거나 크기가 바뀌면 그건 다른 물건 셋이다(지금 값의 2번 문제).
        「상태」를 돌려서 그 자리가 안 움직이는 안만 남긴다.
      </p>
      <p class="mt-2">
        <b class="text-default">5. 선택과 채널이 갈리는가.</b> 선택은 카드 <b class="text-default">겉</b>을
        전부 가져갔다 — 링 · 틴트 · 우상단 배지(<code class="text-default">m/테마/선택표시.ts</code>).
        라벨에 붙는 계열은 겉을 하나도 안 칠하므로 이 기준은 전부 통과한다.
        「선택 겹침」을 켜고 확인할 것.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import Portrait from '~base-comps/m/List/_/portrait.vue'
import Landscape from '~base-comps/m/List/_/landscape.vue'
import Row from '~base-comps/m/List/_/row.vue'
import { styleCls, type ListCardItem } from '~base-comps/m/List/types'

definePageMeta({
  제목: '수정 표시'
})

const 보기s = [
  { label: '카드', value: '카드' },
  { label: '가로카드', value: '가로카드' },
  { label: '줄', value: '줄' }
]
const 보기 = ref<'카드' | '가로카드' | '줄'>('카드')

const 상태s = [
  { label: '수정됨', value: '수정됨' },
  { label: '저장중', value: '저장중' }
]
const 상태 = ref<'수정됨' | '저장중'>('수정됨')

/** 수정 표시와 선택 표시를 한 카드에 같이 켠다. 이 판의 핵심 검증 */
const 선택겹침 = ref(true)

const 카드 = computed(() =>
  보기.value === '카드' ? Portrait : 보기.value === '가로카드' ? Landscape : Row)

/**
 * sub 길이. **`실제` 가 진짜 값이다** — `model문서.sub` 가 `독자 · 요약` 을 이어 붙이므로 늘 한 문장이다.
 *
 * 그런데 `_/row.vue` 는 eyebrow 를 라벨과 **한 줄에** `shrink-0 whitespace-nowrap` 으로 두므로,
 * 그 한 문장이 폭을 통째로 가져가고 `min-w-0 truncate` 인 라벨이 `2..` 로 굶는다.
 * **이 판이 고르려는 것과 무관한, 줄 보기의 별건 버그다.** 그래서 손잡이로 뺐다 —
 * `짧게` 로 돌려야 줄 보기에서 표시를 판정할 수 있다.
 */
const sub길이s = [
  { label: '실제', value: '실제' },
  { label: '짧게', value: '짧게' }
]
const sub길이 = ref<'실제' | '짧게'>('실제')

/** 스크린샷과 같은 표본 — 문서 목록. eyebrow 가 길어야 지금 값의 1번 문제가 재현된다 */
const 문서s = computed<ListCardItem[]>(() => 짧나.value
  ? [
      { key: 'a', label: '수강 신청 처리', eyebrow: '스태프' },
      { key: 'b', label: '2026 봄학기 개강 안내', eyebrow: '방문자' },
      { key: 'c', label: '기초반', eyebrow: '방문자' }
    ]
  : [
      {
        key: 'a',
        label: '수강 신청 처리',
        eyebrow: '스태프 · 데스크와 상담 담당이 신청 한 건을 받아 등록까지 끝내는 절차.'
      },
      {
        key: 'b',
        label: '2026 봄학기 개강 안내',
        eyebrow: '방문자 · 2026 봄학기 개강 안내 — 반 편성과 준비물, 휴강일.'
      },
      {
        key: 'c',
        label: '기초반',
        eyebrow: '방문자 · 기초반 소개 — 누가 듣는지, 시간표, 수강료.'
      }
    ])
const 짧나 = computed(() => sub길이.value === '짧게')

/** 눌러서 켜고 끈다. 기본은 스크린샷과 같은 칸 하나 */
const 수정된칸s = ref<Set<string>>(new Set(['b']))
const 켬 = (문서: ListCardItem) => 수정된칸s.value.has(문서.key!)
const 뒤집기 = (문서: ListCardItem) => {
  const 다음 = new Set(수정된칸s.value)
  if (다음.has(문서.key!)) 다음.delete(문서.key!)
  else 다음.add(문서.key!)
  수정된칸s.value = 다음
}

type i안 = {
  key: string
  제목: string
  근거: string
  약점: string
  /**
   * **부품이 자기 표시를 그린다.** 지금 값 한 칸만 이걸 켠다 — `is수정됨`·`is저장중` 만 넘기고
   * 마크업은 `_/portrait`·`_/landscape`·`_/row` 가 낸다. 손으로 베끼면 값을 고칠 때 판이 거짓말을 한다.
   */
  부품?: boolean
  /**
   * 이 판이 `#header` 로 얹는 안 고른 값들.
   * `앞내`=줄 상자 밖 내어쓰기(안 민다) · `뒤`=접미 별표 · `뒤점`=접미 점.
   */
  표시?: '앞내' | '뒤' | '뒤점'
}

const 안s: i안[] = [
  {
    key: 'pre',
    제목: '앞 · 인라인 — `*라벨` ★지금',
    근거: '에디터 탭 관용 그대로. 이름 바로 앞이라 뜻이 앵커에 붙고, 라벨 한 줄만 건드린다 — eyebrow·brief 는 안 밀린다. 부품이 직접 그리는 칸이다.',
    약점: '라벨을 한 글자 민다. 목록을 세로로 훑을 때 수정된 행만 라벨 왼쪽 끝이 어긋나고, 켜고 끌 때 글자가 덜컹인다.',
    부품: true
  },
  {
    key: 'hang',
    제목: '안 고름 — 앞 · 내어쓰기',
    근거: '`right-full` 로 라벨 줄 상자 바깥에 건다. 자리를 하나도 안 먹어 켜고 꺼도 글줄이 안 움직이고, 왼쪽 끝 정렬이 그대로다.',
    약점: '카드 안쪽 여백 12px 위에 얹힌다 — 그 자리가 좁아지면 글리프가 카드 밖으로 나가 잘린다. 줄 보기에서 아이콘·썸네일이 있으면 그 간격에 낀다.',
    표시: '앞내'
  },
  {
    key: 'post',
    제목: '안 고름 — 뒤 · `라벨*`',
    근거: '라벨 왼쪽 끝을 아예 안 건드려 정렬이 안 흔들린다. 「제목 다 읽고 나서 상태」라는 읽기 순서도 자연스럽다.',
    약점: '라벨이 길어 잘리는 줄 보기에서는 표시가 밀려나거나 같이 잘린다. 훑을 때 왼쪽에서 안 잡힌다.',
    표시: '뒤'
  },
  {
    key: 'postdot',
    제목: '안 고름 — 뒤 · 점 `라벨●`',
    근거: '별표보다 조용하다. 글자가 아니라 도형이라 라벨 글꼴·크기와 안 싸우고, 여러 칸이 켜지면 세어진다.',
    약점: '「뒤」와 같은 약점에 더해 뜻이 안 읽힌다 — 점 하나는 배웠을 때만 상태로 보이고, 아니면 그냥 장식이다.',
    표시: '뒤점'
  }
]
</script>

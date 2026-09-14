<template>
  <div class="my-5">
    <div
      v-if="!종류"
      class="rounded-lg border border-dashed border-accented p-4 text-sm text-muted"
    >
      <code>kind</code> 가 없거나 모르는 값이다. 쓸 수 있는 것: {{ 종류이름s.join(' · ') }}
    </div>
    <template v-else>
      <mList
        :items="items"
        :type="type"
        item-key="key"
      />
      <p
        v-if="!items.length"
        class="py-6 text-center text-sm text-muted"
      >
        {{ 종류.label }}(이)가 아직 없다.
      </p>
    </template>
  </div>
</template>

<script setup lang="ts">
/**
 * `::list` — **목록 뷰어.** 본문 안에서 모델 목록 하나를 그린다.
 *
 * ## 왜 `::수업목록`·`::설문목록` 이 아닌가
 *
 * 설문·퀴즈·투표·수업·행사는 전부 `model콘텐츠물` 을 상속한다. 즉 **모양이 같다** —
 * `label` · `sub` · `thumbnail` 셋이 `BaseModel2` 에 이미 있고, 목록 카드(`mList`)가
 * 읽는 것도 정확히 그 셋이다. 종류별로 블록을 만들면 다섯 개가 같은 세 필드를 그린다.
 * 그건 어휘가 아니라 복붙이다. 그래서 종류는 **이름이 아니라 속성**이다.
 *
 * ## 지금은 뷰어까지만이다
 *
 * 신청 버튼·신청받기 상태 배지·클릭 이동은 **일부러 없다.** 그 축(누가 볼 수 있나 · 언제 마감인가)이
 * 붙는 순간 이건 문서 블록이 아니라 화면이 되고, 그러면 `::` 로 적을 물건이 아니다.
 * 먼저 그림만 본다.
 *
 * ## 속성 이름은 ASCII 여야 한다
 *
 * `kind` 이지 `종류` 가 아니다. `remark-mdc` 는 속성 이름 첫 글자에 `asciiAlpha`(`:`·`_` 포함)만
 * 받고, 안 맞으면 그 속성만 빠지는 게 아니라 **줄 전체가 평범한 문단으로 떨어진다**
 * (2026-09-05 파서로 확인 — 블록 이름과 같은 제약). **값은 한글이어도 된다.**
 * 그래서 이름은 영어, 값은 한글이다 — `{kind="설문"}`.
 *
 * ## 표가 모델을 따라온다
 *
 * `종류표` 에 `satisfies Record<i신청받기대상, …>` 를 걸어 뒀다. 콘텐츠물이 하나 늘면
 * `i신청받기대상` 이 늘고, 그러면 **여기가 컴파일 에러로 막는다.** 손으로 관리하는 목록이 아니다.
 * (`_대상레지스트리.ts` 가 같은 장치를 쓴다. 거기 얹지 않은 건 그 표가 "신청받기가 붙을 수 있는가"를
 * 뜻하기 때문이다 — 이건 그 축과 상관없이 그냥 목록을 그린다.)
 */
import {
  model설문s, model퀴즈s, model투표s, model수업s, model행사s,
  보이는대상이름표s, type i신청받기대상
} from '~models/test2'
import type { ListCardItem } from '~base-comps/m/List/types'

interface Props {
  /** 무엇의 목록인가. 한글 라벨(`설문`) 또는 테이블명(`surveys`). */
  kind?: string
  /** `줄`(기본) · `세로`. `가로`는 없다 — 아래 `type` 주석. */
  view?: string
  /** 최대 몇 개까지. 안 주면 전부. */
  limit?: string | number
}
const props = defineProps<Props>()

/**
 * 라벨·아이콘은 **여기서 안 적는다** — `enrolls/types.i신청받기대상이름표s` 가 정본이다.
 * 이 파일이 아는 건 종류마다 어느 repo 를 부르느냐 하나뿐이고, `satisfies` 가 거는 컴파일
 * 방어(대상이 늘면 여기가 막힌다)는 그 표에 그대로 남는다.
 */
// 다섯 repo 의 공통 상위 타입을 적으려면 제네릭 다섯 개가 따라 들어온다. 여기서 쓰는 건
// `list` 와 `reads()` 뿐이라 그 값이 없다.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type i종류repo = () => any

const repo표 = {
  surveys: () => model설문s.getInstance(),
  quizzes: () => model퀴즈s.getInstance(),
  polls: () => model투표s.getInstance(),
  classes: () => model수업s.getInstance(),
  occasions: () => model행사s.getInstance()
} satisfies Record<i신청받기대상, i종류repo>

const 종류표 = Object.fromEntries(
  보이는대상이름표s.map(이름표 => [
    이름표.value,
    { label: 이름표.label, icon: 이름표.icon, repo: repo표[이름표.value] }
  ])
) as Record<i신청받기대상, { label: string, icon: string, repo: i종류repo }>

const 종류이름s = Object.values(종류표).map(x => x.label)

const 종류 = computed(() => {
  const k = String(props.kind ?? '').trim()
  if (!k) return null
  return 종류표[k as i신청받기대상]
    ?? Object.values(종류표).find(x => x.label === k)
    ?? null
})

/**
 * `줄`·`세로` → `mList` 의 판. 값은 한글로 받고 여기서만 영어로 옮긴다.
 *
 * **`landscape` 는 일부러 뺐다.** 본문 폭(676px)에서 두 칸으로 떨어지면 카드 하나가 300px 남짓이고,
 * 그 안에서 다시 썸네일과 글이 좌우로 갈려 제목이 한 자씩 끊긴다 — `회원 교 / 육 수요 / 조사`
 * (2026-09-05 모래밭 실측). 목록 화면에서는 멀쩡한 판이라 컴포넌트 문제가 아니라 **폭 문제**다.
 * 본문은 넓어질 수 없으니 여기서는 못 쓴다.
 *
 * 2026-09-11 에 가로카드 최소 폭을 180 → 240 으로 올리고 그림 칸을 정사각 64 로 고정했다
 * (`m/List/_/landscape.vue` 머리말) — 이 사정의 뿌리가 그것이었으니 다시 열어 볼 만하다. 아직 안 열었다.
 */
const type = computed<'row' | 'portrait'>(() =>
  String(props.view ?? '').trim() === '세로' ? 'portrait' : 'row')

const repo = computed(() => 종류.value?.repo())

// 본문이 어디에 실릴지 모르므로(게시글·페이지·미리보기) 이 블록이 제 데이터를 스스로 읽는다.
// `reads()` 는 repo 싱글턴 캐시를 타서 같은 종류가 두 번 나와도 요청은 한 번이다.
watchEffect(() => { repo.value?.reads() })

const items = computed<ListCardItem[]>(() => {
  const rows = repo.value ? toValue(repo.value.list) ?? [] : []
  const n = Number(props.limit)
  const 잘린것 = Number.isFinite(n) && n > 0 ? rows.slice(0, n) : rows
  return 잘린것.map((row: any) => ({
    id: row.stateId,
    key: row.rowKey,
    label: row.label,
    // 다섯 종류가 **전부 `sub` 를 이미 덮어 뒀다** — 수업은 기간·장소, 설문은 문항 수처럼
    // 각자 한 줄 요약을 안다. 이 블록이 요약을 지어낼 필요가 없는 이유고, 종류별 블록을
    // 안 만들어도 되는 이유이기도 하다. (`설명`은 안 덮은 모델이 생겼을 때의 대비.)
    brief: row.sub || row.설명 || '',
    thumbnail: row.thumbnail,
    표지비율: row.표지비율,
    icon: 종류.value?.icon
  }))
})
</script>

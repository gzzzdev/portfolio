<!--
  **필터 조건줄 — 자리가 없을 때만 접히고, 여는 손잡이는 「띠」다** (2026-09-09).

  `m/Editor/Editor.vue` 의 툴바에서 가져왔다. 가만히 있을 때 보이는 건 가운데 짧은 실선 한 토막뿐이고,
  손이 얹히면 띠가 옅게 뜨면서 토막이 넓어진다 — **어디를 눌러야 하는지를 아이콘이 아니라
  넓이가 말한다.** 화면에 처음 오는 것이 칩 열두 개가 아니라 **목록**이어야 한다는 것이고,
  거르는 일은 마음먹고 하는 일이라 그 손잡이는 한 번 눌러서 연다.

  ## 왜 접나 — 재서 나온 값이다

  폴드 가로(1015×604)를 재니, 펼친 칩줄이 **125px** 를 먹었다(2026-09-09).
  좁은 왼쪽 칸(≈400px)에서 5군이 5줄로 감기기 때문이다. 띠로 접으면 **32px**.
  목록에 남는 자리가 260 → 353 으로 늘고, 카드 1.6장이 2.2장이 된다.
  (나머지 한 칸은 `목록5.vue` 의 보기 강등이다. 둘이 같이 가서 4.7장이 된다.)

  ## 접혀도 반드시 남는 것 둘

  툴바는 눌러서 실행하는 것이라 접혀도 잃는 게 「어휘가 안 보인다」뿐인데, **필터는 지금 상태를
  말하는 것**이라 접으면 걸러진 목록을 전체로 오해한다. 그래서 띠에는 늘 남는다 —
  **개수 배지**(`view/카드목록.vue:29-36` 이 이미 같은 이유로 남긴다)와 **고른 칩**.
  안 고른 것만 접힌다. 고른 칩은 띠에서 바로 ✕ 로 뗄 수 있어야 한다 — 펴야만 풀 수 있으면
  「접힌 채로 상태를 본다」는 말이 반쪽이 된다.

  개수 배지가 띠로 내려온 덕에 **줄 한가운데로 뜨던 자리도 없어졌다.** 예전엔 5줄로 감긴
  칩 뭉치의 형제라 그 뭉치 높이의 한가운데에 섰다.

  ## 띠가 선을 진다

  띠는 **늘 서 있고 서랍이 그 위에서 열린다.** 그래서 도구와 목록을 가르는 선도 띠가 진다 —
  **펴진 동안에만** 아래에 선이 걸리고, 접히면 선이 없다(`m/Editor/_/틀.ts` 의 `띠선` 과 같은 규율).
  접혔는데 선을 그으면 걷어낸 「빈 띠 + 선」이 그대로 돌아온다.

  ## 손잡이도 자리가 없을 때만 선다

  띠는 **접을 이유가 있을 때만** 손잡이가 된다(`can접기`). 세로가 남아도는 화면에서도 손잡이를
  세워 두면, 아무도 안 쓰는 32px 짜리 줄 하나가 목록 위에 늘 튀어나와 있게 된다 —
  걷으려고 만든 크롬이 제가 크롬이 되는 꼴이다. 넓을 때 남는 건 **개수 배지 한 장**뿐이고,
  값은 `목록5.vue` 의 `is필터접기` 가 내려온다(판단은 자리를 아는 쪽이 진다). 「저장해 둔 카드가 서나」
  (`is좁은높이`)가 아니라 **「그려지는 보기가 서나」**다 — 카드가 줄로 강등됐으면 줄로 묻는다.
  묻는 것도 둘이다(2026-09-12): **펼친 칩줄을 물고도 3장이 서나**, 그리고 **칩줄이 목록보다 더 먹나.**
  둘째가 없으면 줄 보기가 빠진다 — 줄은 한 장이 64px 이라 폰 세로에서도 4장이 서고, 그래서
  칩줄이 화면 절반을 먹은 채로 「자리는 넉넉하다」가 나왔다.

  대가는 분명하다 — **넓은 화면에서는 손으로 접을 수 없다.** 그래도 그쪽이 맞는 것이,
  접는 것이 취향이 아니라 자리가 모자랄 때 쓰는 수단이라서다. 넓은데 접고 싶어지면
  그건 「칩줄이 넓은 화면에서도 과하다」는 뜻이니, 손잡이가 아니라 칩줄을 고칠 일이다.

  **접힘은 안 남긴다** — 다시 오면 또 접혀 있다. 상태를 안 남기는 것은 본문 툴바와 같고,
  **기본값은 반대다** — 그쪽은 펴짐이다(어휘로 가는 문이 툴바뿐이라서). 여기는 접을 이유가
  자리이므로, 자리가 없으면 접힌 채로 온다.
-->
<template>
  <div class="flex flex-col">
    <!--
      **서랍.** 펴져 있을 때만 칩이 전부 선다. 바깥 구조(`flex-wrap` + 군 이름 캡션)는
      접기 전과 같다 — 접는 것이 바뀐 것이지 칩이 서는 법이 바뀐 게 아니다.
    -->
    <div v-if="is펼침" class="flex flex-wrap items-center gap-x-3 gap-y-1.5 w-full min-w-0 px-1 pt-1">
      <template v-for="(grp, i) in 필터조건ss" :key="grp.key">
        <!--
          축 이름(`title`)은 모델이 진작 달아뒀는데(`필터조건ss`의 `{ title: '역할' }`) 화면이 안 썼다.
          그래서 칩 12개가 전부 같은 무게로 늘어서고, 무엇으로 거르는 중인지는 값을 보고 짐작해야 했다.
        -->
        <div class="flex flex-none items-center gap-1 min-w-fit max-w-max">
          <span
            v-if="grp.title"
            class="shrink-0 text-[0.625rem] leading-none text-dimmed"
          >{{ grp.title }}</span>
          <Input선택기S v-if="grp.isMultiple" :is미니="!false" :model-value="선택값s(그룹선택(grp))" type="radio" :search="false" :is-u-i="false" has삭제 삭제라벨="이 구간 필터 해제" :items="필터선택기items[i] ?? []" is폭자동 @update:model-value="(v) => emit('update:선택', grp.key, v ?? [])" />
          <input선택기 v-else :is미니="!false" :model-value="그룹선택(grp)" type="radio" :search="false" :indicator="false" :is-u-i="false" has삭제 삭제라벨="이 구간 필터 해제" :items="필터선택기items[i] ?? []" is폭자동 @update:model-value="(v) => emit('update:선택', grp.key, (v ?? null) as string | null)" />
        </div>
      </template>
    </div>

    <!--
      **띠.** 누르는 면은 `absolute inset-0` 짜리 단추 한 장이고, 그 위에 얹힌 칩·배지만
      제 몫을 가져간다 — 단추 안에 단추를 넣으면 마크업이 깨진다.
    -->
    <div class="group relative flex items-center gap-1.5 px-1">
      <!--
        **접을 이유가 없으면 띠도 없다.** 두 경우다 — 필터 축이 아예 없는 모델(`/v2/animals`)에서는
        눌러 봐야 **빈 서랍**이 열리고, 세로가 넉넉한 화면에서는 접어 봐야 **버는 자리가 없다.**
        둘 다 띠가 「여기 눌러라」고 거짓말을 하는 것이라, 손잡이를 안 그린다 — 개수 배지만 남는다.
      -->
      <template v-if="can접기">
        <button type="button" class="absolute inset-0 rounded-md transition-colors group-hover:bg-elevated/70" :aria-expanded="상태 === '펼침'" :aria-label="상태 === '펼침' ? '필터 접기' : '필터 펼치기'" @click="상태 = 상태 === '펼침' ? '띠' : '펼침'" />
        <span class="pointer-events-none absolute left-1/2 top-1/2 h-[3px] w-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accented transition-all duration-200 group-hover:w-16" />
      </template>

      <!-- **접혀도 남는 것 하나 — 고른 칩.** 없으면 무엇으로 거르는 중인지 알 길이 없다. -->
      <div v-if="상태 === '띠' && 고른칩s.length > 0" class="relative flex min-w-0 flex-wrap items-center gap-1 py-1">
        <UBadge v-for="칩 in 고른칩s" :key="칩.key" size="sm" variant="soft" class="gap-1">
          <span
            v-if="칩.군"
            class="text-[0.625rem] text-dimmed"
          >{{ 칩.군 }}</span>
          <span>{{ 칩.label }}</span>
          <button type="button" class="-mr-0.5 rounded text-dimmed transition-colors hover:text-default" :aria-label="`${칩.label} 필터 해제`" @click.stop="칩.해제()">
            <mIcon name="i-lucide-x" class="size-3" />
          </button>
        </UBadge>
      </div>

      <div class="grow" />

      <!-- **접혀도 남는 것 둘 — 개수.** 없으면 걸러진 목록을 전체로 오해한다. -->
      <mChip :number="상태 === '띠' ? 0 : 선택된필터s.length" class="relative shrink-0" size="3xl">
        <UBadge size="md" class="shrink-0 min-h-7.5">
          <template v-if="is필터적용">
            <span class="text-primary">{{ 필터수 }}</span>
            <span class="text-muted">/{{ 전체수 }}{{ 세는단위 }}</span>
          </template>
          <span
            v-else
            class="text-muted"
          >{{ 전체수 }}{{ 세는단위 }}</span>
        </UBadge>
      </mChip>
    </div>

    <!-- **펴진 동안에만** 선을 건다. 접히면 크롬이 띠 한 장뿐이라 그 아래 선은 이유가 없다. -->
    <USeparator v-if="is펼침" class="mx-[-5px] mb-2 mt-1" />
  </div>
</template>

<script setup lang="ts">
import type { BaseModels } from '~utils'
import type { i필터라디오그룹, i필터선택s } from '~utils/models'

/** 선택값은 목록5가 소유한다 — 여기는 그리고 되돌려줄 뿐이다(`i필터라디오그룹` 주석 참고). */
const props = defineProps<{
  repository: BaseModels<any, any>
  검색어?: string
  필터수: number
  선택s: i필터선택s
  /** 자리가 모자란가. 판단은 `목록5.vue` 가 지고 여기는 **손잡이를 세울지에만** 쓴다. */
  is좁은높이?: boolean
  /** 목록5의 `범위`. 칩 개수도 그 안에서 센다 — 안 그러면 담당자 화면에 전체 회원 수가 뜬다. */
  범위?: (row: any) => boolean
}>()

const 범위목록 = computed(() => props.범위 ? props.repository.list.value.filter(props.범위) : props.repository.list.value)

const emit = defineEmits<{
  (e: 'update:선택', key: string, value: string | string[] | null): void
}>()

const 그룹선택 = (g: i필터라디오그룹<any>) =>
  g.key in props.선택s ? props.선택s[g.key]! : (g.기본선택 ?? null)

const 필터조건ss = computed(() => props.repository?.필터조건ss ?? [])
const 세는단위 = computed(() => props.repository?.메뉴?.집합?.세는단위)
const 전체수 = computed(() => 범위목록.value.length)
const is필터적용 = computed(() => props.필터수 !== 전체수.value)

const 선택값s = (selected: string | string[] | null | undefined) =>
  Array.isArray(selected) ? selected : selected == null || selected === '' ? [] : [selected]

/**
 * **접힘은 이 줄이 정하지 않는다 — 목록5가 든다.**
 *
 * 접는 건 취향이 아니라 **자리가 모자랄 때 쓰는 수단**이라, 자리를 아는 쪽이 정해야 한다.
 * 한동안 여기서 `'띠'` 로 시작했는데 그러면 세로가 남아도는 데스크톱에서도 접힌 채로 떠서,
 * 아무것도 안 벌면서 「무엇으로 거를 수 있는지」만 감춘다. 판단은 `목록5.vue` 의 `is필터접기`다
 * (prop 이름은 `is좁은높이` 로 남아 있다). 상세의 요약 타일은 `is좁은높이` 를 따로 받는다(`상세5.vue`).
 *
 * 사람이 띠를 누르면 여기서 뒤집고, 그 값은 **저장하지 않는다** — 다시 오면 규칙대로 다시 선다
 * (`m/Editor/Editor.vue` 툴바와 같은 규율).
 */
const 상태 = defineModel<'띠' | '펼침'>('상태', { default: '펼침' })

/** 필터 축이 하나도 없는 모델이 있다(`/v2/animals`). 그때는 서랍에 넣을 것도 없다. */
const has필터축 = computed(() => 필터조건ss.value.length > 0)

/** 손잡이를 세우나 — 넣을 것이 있고, 접어서 벌 자리가 있을 때만. */
const can접기 = computed(() => has필터축.value && !!props.is좁은높이)

/**
 * **서랍이 열려 있나.** `can접기` 와 **같은 값이 아니다** — 손잡이가 없으면 접을 방법이 없으니
 * 늘 펴져 있어야 한다. 둘을 한 깃발로 묶으면 넓은 화면에서 손잡이와 함께 **칩줄까지 사라진다.**
 */
const is펼침 = computed(() => has필터축.value && (!can접기.value || 상태.value === '펼침'))

/**
 * 접힌 띠에 남는 것. **군 이름을 같이 적는다** — 값만 있으면 무슨 축인지 못 읽는다.
 * 여러 값을 받는 군(`isMultiple`)은 뗀 값 하나만 빼서 되돌려준다.
 */
const 고른칩s = computed(() =>
  필터조건ss.value.flatMap((g) => {
    const values = 선택값s(그룹선택(g))
    return values.map(v => ({
      key: `${g.key}:${v}`,
      군: g.title ?? '',
      label: g.options.find(o => o.value === v)?.label ?? v,
      해제: () => emit('update:선택', g.key, g.isMultiple ? values.filter(x => x !== v) : null)
    }))
  })
)

const 선택된필터s = computed(() =>
  필터조건ss.value.flatMap(g => 선택값s(그룹선택(g)))
)

const 그룹predicate = (g: (typeof 필터조건ss.value)[number]) => {
  const values = 선택값s(그룹선택(g))
  if (values.length === 0) return (_a: any, _i: number) => true
  const opts = g.options.filter(o => values.includes(o.value))
  if (opts.length === 0) return (_a: any, _i: number) => true
  return (a: any, i: number) => opts.some(o => o.match(a, i))
}

const 필터선택기items = computed(() => {
  const 키워드 = props.검색어 ?? ''
  const base = 범위목록.value
    .filter(x => x.label?.includes(키워드) || x.sub?.includes(키워드))

  return 필터조건ss.value.map((grp, grpIdx) => {
    const otherPredicates = 필터조건ss.value.map((g, i) => {
      if (i === grpIdx) return (_a: any, _i: number) => true
      return 그룹predicate(g)
    })
    const ctx = base.filter((x, idx) => otherPredicates.every(fn => fn(x, idx)))

    return grp.options.map(o => ({
      label: o.label,
      value: o.value,
      icon: o.icon,
      count: ctx.reduce((n, row, idx) => {
        try {
          return o.match(row, idx) ? n + 1 : n
        } catch {
          return n
        }
      }, 0)
    })).filter(x => x.count > 0)
  })
})
</script>

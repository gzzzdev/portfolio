<template>
  <!--
    **가로 넘침은 `clip` 으로 자른다 — `hidden` 이 아니다.** `overflow-x: hidden` 은 세로를
    `auto` 로 끌어올려 이 칸을 **스크롤 칸으로 만든다.** 그러면 안에 사는 붙박이(본문 편집기의
    툴바 — `m/Editor/Editor.vue` 의 `sticky` 크롬)가 진짜 스크롤 칸(`m/Box/유리.vue`)이 아니라 늘어나기만 하는
    이 칸에 붙어서, 스크롤해도 아무 데도 안 붙는다. `clip` 은 자르기만 하고 스크롤 칸이 안 된다.
  -->
  <div
    ref="rootEl"
    class="w-full overflow-x-clip"
  >
    <div class="flex flex-row items-start gap-6">
      <!-- 본문: 컨테이너가 넓어지면 좌우로 나뉜다 -->
      <div
        class="grow min-w-0 grid gap-x-5 gap-1 items-start"
        :class="열수 === 2 ? 'grid-cols-2' : 'grid-cols-1'"
      >
        <template
          v-for="(block, bIdx) in blocks"
          :key="bIdx"
        >
          <!-- 액션바: 연달아 놓인 버튼필드 묶음. 라벨 컬럼 들여쓰기 없이 한 줄에 나란히 세운다. -->
          <div
            v-if="block.is액션바"
            v-show="block.entries.some(e => isItemVisible(e.item))"
            class="col-span-full w-full flex flex-row flex-wrap items-center gap-2 pt-1 pb-2"
          >
            <template
              v-for="e in block.entries"
              :key="e.idx"
            >
              <ClientOnly v-if="isItemVisible(e.item)">
                <component
                  v-bind="{ align: 'no-field', ...toValue(e.item.props) }"
                  :is="e.item.comp"
                  v-model:is-doing="get로딩Ref(e.idx).value"
                />
              </ClientOnly>
            </template>
          </div>
          <template v-else>
            <template
              v-for="{ item, idx } in block.entries"
              :key="idx"
            >
              <div
                v-if="isItemVisible(item)"
                class="min-w-0"
                :class="칸클래스(item)"
              >
                <!-- 버튼필드: 라벨 컬럼/구분선 없이 그 자리에 그대로. readonly도 넘기지 않는다. -->
                <div
                  v-if="item.is버튼"
                  class="w-full pt-1 pb-2"
                >
                  <ClientOnly>
                    <component
                      v-bind="toValue(item.props)"
                      :is="item.comp"
                      v-model:is-doing="get로딩Ref(idx).value"
                    />
                  </ClientOnly>
                </div>
                <div
                  v-else-if="item.is한줄 ?? is한줄"
                  class="w-full flex flex-row gap-1"
                >
                  <!--
                                      여백·줄 높이는 **두 모드가 한 벌**이다. 읽기판만 촘촘하게 두면
                                      뒤집을 때 판이 통째로 96px 움직인다(`decisions/read-edit` 실측).
                                      `min-h-10` = 입력칸 32 + `py-1` 8 — 제일 큰 칸에 맞춘 값이고,
                                      36 으로 두면 칩 무리(38)가 넘쳐 칩 줄만 혼자 자란다.
                                    -->
                  <div
                    class="w-20 shrink-0 min-h-10 flex items-center gap-1 text-left pl-3 text-sm"
                    :class="is잠긴칸(item) ? 'text-dimmed' : 'text-muted'"
                  >
                    <span class="min-w-0 truncate">{{ item.label }}</span>
                    <!-- 수정판인데 못 고치는 칸. 상자가 안 생기는 이유를 라벨이 말해준다 -->
                    <mIcon
                      v-if="is잠긴칸(item)"
                      name="i-material-symbols-light-lock-outline"
                      class="size-3 shrink-0"
                    />
                  </div>
                  <div class="grow min-w-0 min-h-10 flex items-center pl-1 py-1">
                    <ClientOnly>
                      <component
                        :is="item?.botHTML"
                        v-if="item?.botHTML"
                      />
                      <component
                        v-bind="toValue(item.props)"
                        :is="item.comp"
                        v-model:is-doing="get로딩Ref(idx).value"
                        :model-value="item.value"
                        :readonly="isItemReadonly(item)"
                        @update:model-value="(v) => item.setter(v)"
                      />
                    </ClientOnly>
                  </div>
                </div>
                <div
                  v-else
                  class="w-full"
                >
                  <USeparator
                    v-if="has구분선라벨(item)"
                    :label="item.label"
                    size="xs"
                    class="w-full mt-3 mb-2 px-2"
                  />
                  <div class="pl-1 pt-1 pb-2">
                    <ClientOnly>
                      <component
                        :is="item?.botHTML"
                        v-if="item?.botHTML"
                      />
                      <component
                        v-bind="toValue(item.props)"
                        :is="item.comp"
                        v-model:is-doing="get로딩Ref(idx).value"
                        :model-value="item.value"
                        :readonly="isItemReadonly(item)"
                        @update:model-value="(v) => item.setter(v)"
                      />
                    </ClientOnly>
                  </div>
                </div>
              </div>
            </template>
          </template>
        </template>

        <div
          v-if="$slots.default"
          class="col-span-full"
        >
          <slot />
        </div>
      </div>

      <!-- 옆 열: 세로로 긴 필드(증명사진 등)를 본문에서 빼내 붙여둔다. 라벨은 위로 올린다 -->
      <div
        v-if="has사이드"
        class="shrink-0 flex flex-col gap-1"
        :style="{ width: `${사이드폭}px` }"
      >
        <template
          v-for="{ item, idx } in 사이드필드s"
          :key="idx"
        >
          <div
            v-if="isItemVisible(item)"
            class="min-w-0"
          >
            <div
              v-if="item.is버튼"
              class="w-full pt-1 pb-2"
            >
              <ClientOnly>
                <component
                  v-bind="{ align: 'no-field', ...toValue(item.props) }"
                  :is="item.comp"
                  v-model:is-doing="get로딩Ref(idx).value"
                />
              </ClientOnly>
            </div>
            <template v-else>
              <div class="pl-1 pb-1 text-sm text-muted">
                {{ item.label }}
              </div>
              <ClientOnly>
                <component
                  :is="item?.botHTML"
                  v-if="item?.botHTML"
                />
                <component
                  v-bind="toValue(item.props)"
                  :is="item.comp"
                  v-model:is-doing="get로딩Ref(idx).value"
                  :model-value="item.value"
                  :readonly="isItemReadonly(item)"
                  @update:model-value="(v) => item.setter(v)"
                />
              </ClientOnly>
            </template>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, toValue, type Ref } from 'vue'

/**
 * `view모델필드s`의 여러 열 판. 한 필드 = 한 줄이던 것을 컨테이너 폭에 맞춰 나눠 그린다.
 * 한 열짜리가 필요하면 원본(`view모델필드s`)을 그대로 쓰면 된다 — 이쪽은 좁아지면 원본과 같은 모양이 된다.
 *
 * 기준이 뷰포트가 아니라 **제 컨테이너 폭**인 이유: 이 폼은 목록5의 드래그 가능한 분할창,
 * 모바일 모달, 전체폭 페이지에 동시에 들어간다. 화면이 1920이어도 분할창은 400일 수 있다.
 */
interface Props {
  items: any[]
  /**
     * 지금 그리는 탭 그룹의 이름. **구분선 라벨을 뺄지 말지에만 쓴다**(`has구분선라벨`).
     * 안 넘기면 예전 규칙("칸이 하나면 구분선 없음") 그대로다.
     */
  그룹라벨?: string
  is한줄?: boolean
  is수정중?: boolean
  /** true면 can.수정까지 함께 검사 (상세4/5) */
  needCan수정?: boolean
  can?: {
    수정?: boolean
    삭제?: boolean
    생성?: boolean
  }
  get로딩Ref: (idx: number) => Ref<boolean>
}

const props = withDefaults(defineProps<Props>(), {
  그룹라벨: '',
  is한줄: true,
  is수정중: false,
  needCan수정: false,
  can: () => ({})
})

type i엔트리 = { item: any, idx: number }

/**
 * 구분선 라벨(칸 이름)을 그릴까.
 *
 * 원래 규칙은 "칸이 하나뿐이면 안 그린다" 였다. 근거는 **탭 이름이 이미 그 말을 한다**는 것이다 —
 * 「본문」탭에 본문 하나면 `본문` 구분선은 같은 글자의 반복이다.
 *
 * 그런데 `position:'top'`으로 칸을 머리글에 올리면서 "칸이 하나"와 "탭 이름이 곧 그 칸"이 갈라졌다.
 * 문서의 「기본」탭은 제목·읽는 사람이 위로 빠져 요약만 남는데, 「기본」은 요약을 가리키는 말이 아니다.
 * 라벨이 사라지자 이름 없는 큰 상자만 남아서, 본문과 구별이 안 됐다.
 *
 * 그래서 세는 걸 그만두고 **이름이 겹치는지**를 본다. 그룹라벨을 안 받으면 예전 규칙 그대로다.
 */
const has구분선라벨 = (item: any) => {
  if (props.items.length > 1)
    return true
  return !!props.그룹라벨 && item?.label !== props.그룹라벨
}

/** 한 열이 답답하지 않으려면: 라벨 w-20(80) + 여백(8) + 입력 최소(≈290) */
const 열최소폭 = 380
/** 열 사이 간격(gap-x-5) */
const 열간격 = 20
/**
 * 옆 열 폭. 사진3의 세로형 미리보기 폭 캡(3:4 × `세로형최대높이` 320 = 240)에 맞춘다.
 * 이보다 넓으면 사진은 캡에서 멈추고 열 오른쪽만 비고, 좁으면 열 폭이 캡보다 먼저 걸려
 * 사진3이 잡아둔 높이 상한이 무의미해진다.
 */
const 사이드폭 = 240
/** 옆 열과 본문 사이(gap-6) */
const 사이드간격 = 24
/** 옆 열을 세우고도 본문이 남겨야 할 최소 폭 */
const 본문최소폭 = 420

const rootEl = ref<HTMLElement | null>(null)
const { width } = useResponsive2(rootEl)

const 폭of = (item: any) => (item?.폭 ?? '반') as '반' | '전체' | '옆'

/**
 * `폭:'옆'`인 필드를 옆 열로 뽑는다. 바로 뒤에 붙어 있는 버튼필드도 같이 데려간다 —
 * `AI 증명사진`처럼 그 필드에 딸린 동작이 본문에 홀로 남으면 무엇에 대한 버튼인지 알 수 없다.
 */
const 나눔 = computed(() => {
  const 전체: i엔트리[] = props.items.map((item, idx) => ({ item, idx }))
  const 본문: i엔트리[] = []
  const 사이드: i엔트리[] = []
  let 직전이사이드 = false

  전체.forEach((e) => {
    if (폭of(e.item) === '옆') {
      사이드.push(e)
      직전이사이드 = true
      return
    }
    if (직전이사이드 && e.item?.is버튼) {
      사이드.push(e)
      return
    }
    직전이사이드 = false
    본문.push(e)
  })

  return { 전체, 본문, 사이드 }
})

/** 옆 열은 "뽑을 게 보이고" + "본문이 안 눌릴 때"만. 아니면 원래 순서 그대로 본문에 남는다. */
const has사이드 = computed(() =>
  나눔.value.사이드.some(e => isItemVisible(e.item))
  && width.value - 사이드폭 - 사이드간격 >= 본문최소폭
)

const 본문필드s = computed(() => (has사이드.value ? 나눔.value.본문 : 나눔.value.전체))
const 사이드필드s = computed(() => (has사이드.value ? 나눔.value.사이드 : []))

const 본문폭 = computed(() => width.value - (has사이드.value ? 사이드폭 + 사이드간격 : 0))
/** 폭이 아직 안 재진 첫 렌더(0)에서는 한 열 = 기존 모양. */
const 열수 = computed(() => (본문폭.value >= 열최소폭 * 2 + 열간격 ? 2 : 1))

/**
 * 반 칸에 들어가면 안 되는 것들은 한 줄을 통째로 쓴다.
 * 구분선 라벨 모드(`is한줄:false`)도 마찬가지 — 섹션 제목이 반 줄만 그어지면 잘린 것처럼 보인다.
 */
const 칸클래스 = (item: any) => {
  if (열수.value === 1)
    return ''
  if (폭of(item) === '전체')
    return 'col-span-full'
  return (item.is한줄 ?? props.is한줄) ? '' : 'col-span-full'
}

/**
 * 연달아 선언된 버튼필드를 하나의 "액션바" 블록으로 묶는다.
 * - 2개 이상 이어질 때만 액션바 = 출력탭처럼 버튼만 있는 화면은 한 줄에 나란히.
 * - 필드 사이에 낀 버튼 1개(예: 회비 납부)는 그대로 둔다 — 위아래 입력칸과 라인을 맞춰야 하므로.
 * `get로딩Ref(idx)`가 원본 인덱스를 요구해서 묶을 때도 idx를 함께 들고 다닌다.
 */
const blocks = computed(() => {
  const out: { is액션바: boolean, entries: i엔트리[] }[] = []

  본문필드s.value.forEach((e) => {
    const last = out[out.length - 1]
    if (e.item?.is버튼 && last?.is액션바)
      last.entries.push(e)
    else
      out.push({ is액션바: !!e.item?.is버튼, entries: [e] })
  })

  // 홀로 남은 버튼은 액션바로 승격하지 않는다.
  return out.map(b => b.is액션바 && b.entries.length < 2 ? { ...b, is액션바: false } : b)
})

/** 버튼필드는 `is수정할때만`까지 함께 본다 (상단바 버튼과 같은 규칙). */
const isItemVisible = (item: any) => {
  if (!toValue(item.show))
    return false
  if (item.is버튼 && item.is수정할때만)
    return !!toValue(props.is수정중)
  return true
}

/**
 * **판 전체가** 수정판이냐. `isItemReadonly`와 다른 축이다 — 그쪽은 필드 하나가 잠겼는지를 보고,
 * 이쪽은 화면이 지금 고치는 화면인지를 본다.
 *
 * 여백·줄 높이는 이제 이 값으로 안 갈린다(두 모드가 한 벌이다 — 위 템플릿 주석).
 * 남은 쓸모는 **잠긴 칸 표시** 하나다: 수정판인데 이 칸만 못 고치면, 상자가 안 생기는 게
 * 빠뜨린 것처럼 보인다. 그래서 라벨이 대신 말한다.
 */
const is수정판 = computed(() =>
  props.needCan수정
    ? !!(toValue(props.is수정중) && props.can?.수정)
    : !!toValue(props.is수정중)
)

const is잠긴칸 = (item: any) => is수정판.value && isItemReadonly(item)

const isItemReadonly = (item: any) => {
  if (props.needCan수정)
    return !(toValue(props.is수정중) && props.can?.수정 && toValue(item.canEdit))
  return !toValue(props.is수정중) || !toValue(item.canEdit)
}
</script>

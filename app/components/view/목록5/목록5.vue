<template>
  <mBox반응형
    v-model:is열림="is상세열림"
    :ratio="ratio"
    :reverse="props.reverse"
    :ui="{
    }"
    :is수정중="is수정중"
  >
    <template v-if="false" #bot />
    <template v-if="!is미니 && props.isReady" #top>
      <div class="flex flex-row gap-2  px-2 pt-2 items-center ">
        <template v-if="repository.메뉴">
          <mIcon v-if="false" :name="repository.메뉴.아이콘" class="w-5 h-5 mr-[-5px]" />
          <m라벨 v-model:label="repository.메뉴.label" :can수정="is수정중" size="3xl" suffix="관리" />

          <div v-if="!props.repository?.메뉴?.is계층">
            <input선택기 v-model="정렬조건" :items="정렬조건s" :search="false" />
          </div>
        </template>

        <div class="flex flex-row gap-4 items-center">
          <mSwitch2 v-if="false" v-model="is한줄" :label="is한줄 ? '1줄' : '2줄'" />
        </div>

        <div class="grow">
          <slot name="top" />
        </div>
        <div v-if="can수정" class="flex flex-row gap-2 items-center">
          <mButton v-if="repository.is초기데이터" icon="i-material-symbols-light-home-storage-outline-rounded" label="초기값설정" is미니 @click.stop.prevent="() => repository.do초기데이터()" />

          <template v-for="item in repo버튼s" :key="item.label">
            <mChip v-if="toValue(item.show)" :number="toValue(item.chip)" size="3xl">
              <mButton :loading="toValue(item.loading)" :icon="item.icon" :label="is미니 ? undefined : item.label" @mousedown.prevent="() => { }" @click.stop.prevent="() => item.onClick()" />
            </mChip>
          </template>

          <mSwitch2 v-if="!false" v-model="is수정중" :label="is수정중 ? '읽기모드로' : '수정하기'" is반대 />

          <mButton v-if="false" icon="i-lets-icons-add-light" label="랜덤" @mousedown.prevent @click.stop.prevent="() => { repository.random(); }" />

          <slot name="top-right" />
        </div>
      </div>

      <USeparator v-if="!false" class="mt-2 mb-2 shadow-xs " />
    </template>
    <template #left>
      <mBox유리 is투명>
        <template v-if="is미니" #top>
          <div class="flex flex-row gap-2  px-2 pt-2 items-center ">
            <input선택기 v-if="!props.repository?.메뉴?.is계층" v-model="정렬조건" :items="정렬조건s" :search="false" :indicator="false" />
            <mSwitch2 v-if="false" v-model="is한줄" :label="is한줄 ? '1줄' : '2줄'" />

            <div class="grow" />
            <div class="flex flex-row gap-2 items-center">
              <!-- 상세의 편집은 모바일에서만 -->

              <template v-for="item in repo버튼s" :key="item.label">
                <mChip v-if="toValue(item.show)" :number="toValue(item.chip)" size="3xl">
                  <mButton :loading="toValue(item.loading)" :icon="item.icon" :label="is미니 ? undefined : item.label" @mousedown.prevent="() => { }" @click.stop.prevent="() => item.onClick()" />
                </mChip>
              </template>

              <mSwitch2 v-if="can수정" v-model="is수정중" :label="is수정중 ? '읽기모드로' : '수정하기'" is반대 />

              <mButton v-if="false" icon="i-material-symbols-light-add" label="추가" is미니 @click.stop.prevent="() => do추가()" />

              <mButton v-if="false" icon="i-lets-icons-add-light" label="랜덤" @mousedown.prevent @click.stop.prevent="() => { repository.random(); }" />
            </div>
          </div>
          <USeparator class="mt-2 mb-2 mx-[-5px] shadow-xs" />
        </template>
        <div v-if="!props.isReady" class="h-full w-full flex flex-col gap-4  overflow-y-auto min-h-0">
          <template v-for="n in 15" :key="n">
            <USkeleton class="h-30 " />
          </template>
        </div>

        <template v-else>
          <div class="h-full flex flex-col">
            <!-- 재는 이유는 `is좁은높이` 주석에. 목록 칸과 **합이 일정한** 짝이라 판단의 입력이 된다. -->
            <div ref="ref필터칸">
              <view필터조건 v-model:상태="필터상태" :is좁은높이="is필터접기":repository="props.repository" :범위="props.범위" :검색어="검색어" :필터수="필터수" :선택s="필터선택s" @update:선택="set그룹선택" />
            </div>
            <div v-if="!(필터된목록.length > 0)" class="grow min-h-0">
              <div v-if="is목록조회중 || !is목록조회완료" class="h-full w-full flex flex-col gap-3 overflow-y-auto py-1">
                <template v-for="n in 8" :key="`loading-${n}`">
                  <USkeleton class="h-10 w-full" />
                </template>
              </div>
              <div v-else class="h-full flex items-center justify-center px-4">
                <div class="flex flex-col items-center gap-2 text-center text-sm leading-relaxed text-muted ">
                  <template v-if="is필터적용">
                    <div class="flex flex-row items-end gap-1">
                      <template v-for="(label, i) in 선택된필터s" :key="label">
                        <UBadge :label="label" />
                      </template>
                      <div>인</div>
                    </div>
                    <div class="flex flex-row items-end text-xl">
                      <span v-if="선택된필터s.length === 0">선택한 조건</span>
                      {{ props.repository?.메뉴?.label ?? '항목' }}은 없습니다.
                    </div>
                  </template>

                  <!--
                                        기본은 `{이름}이 없습니다`. 모델이 `메뉴.빈문구`를 주면 그걸 쓴다 —
                                        이름이 도메인과 부딪히는 화면이 있어서다. `/admin/tables`(표 등록부)가 그 예로,
                                        행이 곧 표라 "테이블이 없습니다"가 **그 DB 표가 없다**로 읽힌다.
                                        비어 있을 때가 대개 뭘 해야 하는지 알려줄 자리이기도 하다.
                                    -->
                  <p v-else class="text-muted">
                    {{ props.repository?.메뉴?.빈문구
                      ?? `${props.repository?.메뉴?.label ?? '항목'}이 없습니다.` }}
                  </p>
                </div>
              </div>
            </div>
            <!--
              **재는 칸.** 보기를 줄로 내릴지가 여기 높이로 정해진다(`useGridCols` 의 `드는장수`).
              뷰포트가 아니라 이 칸이라야 위아래 크롬이 바뀔 때 규칙이 저절로 따라온다.
            -->
            <div ref="ref목록칸" class="grow min-h-0 flex flex-col">
              <template v-if="tab보기 == '목록'">
                <mList2 v-if="props.repository?.메뉴?.is계층" ref="ref_mList" v-model:items="카드목록" v-model:selected-id="selectedId" v-model:is수정중="is수정중" class="grow min-h-0" is계층 item-key="key" type="row" :추가라벨="`새 ${props.repository.메뉴?.label} 추가`" :do추가="can추가 ? do추가 : undefined" />

                <mList v-else ref="ref_mList" v-model:selected-id="selectedId" class="grow px-1 pb-1" :items="카드목록" item-key="key" :type="'row'" :추가라벨="`새 ${props.repository.메뉴?.label} 추가`" :do추가="can추가 ? do추가 : undefined" />
              </template>
              <template v-else>
                <mList ref="ref_mList" v-model:selected-id="selectedId" class="grow px-1 pb-1" :items="카드목록" item-key="key" :type="is가로카드보기 ? 'landscape' : 'portrait'" :추가라벨="`새 ${props.repository.메뉴?.label} 추가`" :do추가="can추가 ? do추가 : undefined" />
              </template>
            </div>
          </div>
        </template>

        <template v-if="props.isReady" #bot>
          <div class="px-2 pt-5 flex flex-col gap-2">
            <div class="flex flex-row gap-2 justify-between items-center">
              <div v-if="검색어" class="mb-1">
                <UBadge size="md" icon="i-mdi-magnify" class="max-w-[320px]">
                  <span class="truncate">검색: {{ 검색어 }}</span>
                </UBadge>
              </div>
              <div class="grow" />
            </div>

            <div class="flex flex-row gap-2  items-center ">
              <!--
                **강등 중에도 그린다.** 누르면 강등이 풀리고 그 보기가 그대로 그려지므로(`보기손댐`)
                손잡이가 거짓말을 하지 않는다. 강등 중에는 `목록` 이 눌려 보인다 — 지금 그려진 것이 그것이라서다.
              -->
              <div>
                <input선택기 v-model="tab보기" type="radio" :items="i메뉴보기모드options.map(x => ({ ...x, label: undefined }))" :search="false" />
              </div>
              <div v-if="false">
                <mSwitch2 v-model="is중요정보만" :label="is중요정보만 ? '중요만' : '전체'" is반대 />
              </div>
              <UInput v-model="필터" :ui="{ base: 'text-md' }" trailing-icon="i-mdi-search" class="w-full grow " placeholder="" />
            </div>
          </div>
        </template>
      </mBox유리>
    </template>

    <template #right>
      <!--
              **좁은 화면에서는 상세가 카드가 아니라 면이다.** 넓을 땐 분할창 오른쪽에 놓이는
              한 장이라 테두리가 왼쪽 목록과 자기를 가르지만, 시트로 열리면 그 상자가 이미 화면 전체다 —
              거기에 또 테두리를 두르면 화면 안에 카드가 든 모양이 되고, 좌우 26px 이 선 긋는 데만 쓰인다.
            -->
      <view상세5 v-if="selected" :key="selected?.rowKey" ref="ref상세" v-model:is수정중="is수정중" v-model:tab자동필드="tab자동필드" v-model:ratio="ratio" :is중첩="!is미니" :is투명="!!is미니" :class="['h-full', is미니 ? '' : 'border']" :model-value="selected" :is한줄="is한줄" :can="{ 수정: !props.repository.메뉴?.is시스템, 삭제: props.can삭제 && !props.repository.메뉴?.is시스템 }" :is미니="is미니" @on-close="() => { selectedId = null; }" @update:is-doing="(v) => is로딩중 = v" @on-do="() => do포커스()" />

      <mBox유리 v-else class="h-full w-full " is중첩 />
    </template>
  </mBox반응형>
</template>

<script lang="ts">
</script>

<script setup lang="ts">
import type { UPopover, USeparator } from '#components'
import { useElementSize } from '@vueuse/core'
import { computed, onUnmounted, ref, useTemplateRef, watch } from 'vue'
import { 드는장수, 좁은높이인가, 최소장수 } from '~base-comps/m/List/_/useGridCols'
import {
  model메뉴s,
  type i폴더sdto,
  type i폴더레이아웃아이템dto,
  i메뉴보기모드options
} from '~models/test2'
import type { BaseModels } from '~utils'
import { 행검색매칭 } from '~utils'
// 도우미(`aiV2/source.ts`)와 **같은 함수**를 써야 도우미가 만든 주소를 이 화면이 읽는다.
// `~utils`는 `models`를 다시 내보내지 않아서(BaseModels 는 타입 자리라 안 걸렸다) 여기서 직접 가져온다.
import { 필터축쿼리키 } from '~utils/models'
import type { i필터선택s } from '~utils/models'
import { clear화면대상, set화면대상 } from '~utils/ai/화면문맥'
import view필터조건 from './_view필터조건.vue'

interface i기타 {
  is한줄?: boolean
  type?: 'collapsible' | 'popup'
  ratio?: number
  reverse?: boolean
  can수정?: boolean
  /** 상세의 「삭제」를 놓을지. 기본 켬 — 한동안 선언만 돼 있고 상세로 안 넘어갔다(담당자 화면에서 드러남). */
  can삭제?: boolean
  /**
     * 목록 끝의 「새 … 추가」 줄을 놓을지. 기본 켬.
     *
     * 2026-09-05까지 **선언만 돼 있고 아무것도 안 했다** — `do추가`가 mList에 무조건 넘어가서
     * 끄든 켜든 그 줄이 떴다. 행이 정의에서 나오는 표(`model테마`처럼 저장소가 서버가 아닌 것)를
     * 붙이면서 드러났다. 기본이 켬이라 기존 호출부의 화면은 그대로다.
     */
  can추가?: boolean
  isReady?: boolean
  /**
     * 조회 상태(검색어·정렬·필터축)를 주소에 물릴지. 기본 켬.
     *
     * 끄는 자리는 **그 축을 페이지가 이미 주소에 물고 있을 때**뿐이다(`member-posts`의 `?menuId=`).
     * 둘 다 켜면 같은 뜻의 파라미터가 두 개 붙는다.
     */
  주소동기?: boolean
  /**
     * 이 화면이 다룰 행의 범위. 필터 칩과 달리 사람이 풀 수 없고, 개수도 이 안에서만 센다.
     * 담당자 화면(`/admin/own-members`·`/admin/own-enrolls`)이 「내 담당 회원」으로 좁히는 자리다.
     */
  범위?: (row: any) => boolean
}
interface Props {
  repository: BaseModels<any, any>
}

useKeysShortcut('save', () => {
  do저장()
})

const isDev = useRuntimeConfig().public.isDev

const props = withDefaults(defineProps<i기타 & Props>(), {
  title: '',
  repository: undefined,
  ratio: 40,
  type: 'popup',
  reverse: false,
  can수정: true,
  can삭제: true,
  can추가: true,
  isReady: !false,
  주소동기: true

})

const ratio = ref(props.ratio)

const is수정중 = defineModel<boolean>('is수정중', { default: false })

const is로딩중 = ref(false)

const ononff_list = ref<boolean[]>([])

const is한줄 = defineModel<boolean>('is한줄', { default: true })

// `is상세열림` 은 아래 `is미니` 뒤에 있다 — 선택에서 파생되므로 둘 다 정의된 뒤여야 한다.
// if (false)
//     props.repository?.reads?.();

// default: null,
// required: false
const selectedId = defineModel<any>('selected-id', { default: null })
const selected = defineModel<any>('selected', { default: null })

/**
 * 선택한 행을 챗봇의 화면 문맥으로 등록한다.
 *
 * 페이지마다 배선하지 않는 이유: 선택을 소유하는 건 언제나 이 컴포넌트다.
 * 챗봇의 계획 단계는 대화 기록을 못 보므로("회원증출력!"에는 대상이 없다) 사용자가 무엇을
 * 열어놓고 말하는지를 알 방법이 이것뿐이다. 나가는 건 id·label뿐, 행은 앱 안에만 남는다.
 */
watch(selected, v => set화면대상(props.repository?.tableName ?? '', v), { immediate: true })
onUnmounted(() => clear화면대상(selected.value))

const ref_mList = useTemplateRef<{ do포커스: () => void }>('ref_mList')

/**
 * 상세 폼의 탭(= `자동필드ss`의 묶음). **`?id=`의 부속이라 주소에도 산다** — 아래 「탭」 절.
 */
const tab자동필드 = ref('')

/**
 * 한 행이 실제로 가진 묶음 라벨들. **상세5가 탭을 그릴 때와 같은 조건**(`show`)으로 거른다 —
 * 두 벌로 세면 주소가 화면에 없는 탭을 가리키게 된다.
 */
const 탭라벨s = (m: any): string[] =>
  ((m?.자동필드ss ?? []) as any[])
    .filter(g => toValue(g?.show ?? true))
    .map(g => String(g?.label ?? ''))
    .filter(Boolean)

const 역할별설정 = computed(() => props.repository.메뉴?.역할별?.() ?? null)

const is저장필요개수 = computed(() =>
  props.repository.is저장필요개수
  + (toValue(props.repository.메뉴?.is수정됨) ? 1 : 0)
  + (toValue(역할별설정.value?.is수정됨) ? 1 : 0)
)

const is저장필요 = computed(() =>
  toValue(props.repository.메뉴?.is수정됨)
  || toValue(역할별설정.value?.is수정됨)
  || toValue(props.repository.is저장필요)
)

const do저장 = () => {
  if (toValue(props.repository.메뉴?.is수정됨))
    props.repository.메뉴.do저장()
  if (toValue(역할별설정.value?.is수정됨))
    역할별설정.value.do저장()
  if (toValue(props.repository.is저장필요))
    props.repository?.do모두저장()
}

const repo버튼s = [
  {
    label: '모두 저장',
    icon: 'i-material-symbols-light-save-outline-rounded',
    onClick: do저장,
    show: is저장필요,
    loading: computed(() => toValue(props.repository.is저장중)),
    chip: is저장필요개수
  }
]

const do포커스 = () => ref_mList.value?.do포커스()

/**
 * 우측 도크(AI도우미·메일쓰기…)가 열려 있는지. 열려 있으면 **사람의 손이 그쪽에 있다**고 본다 —
 * 포커스가 지금 어디 있는지 캐묻지 않는 이유는 그게 브라우저마다 다르기 때문이다
 * (사파리는 버튼을 눌러도 포커스를 안 옮긴다). 열림 하나면 판단이 선다.
 */
const dock = useDock()

/**
 * 이번 선택을 **주소가 옮겼는지**(`do주소선택`이 세운다). 사람이 카드를 누른 것과 구분하려고 둔다 —
 * 아래 포커스 판단이 이것 하나로 갈린다. ref 가 아닌 이유: 렌더에 안 쓰이고 watch 한 번 사이에만 산다.
 */
let is주소발선택 = false

watch(selectedId, (id) => {
  // 어느 경로로 왔는지는 이번 한 번만 뜻이 있다. 아래 어디로 빠져나가든 표시는 여기서 지운다.
  const 주소발 = is주소발선택
  is주소발선택 = false

  if (id == null) {
    selected.value = null
    return
  }
  if (is로딩중.value) return
  const model = 필터된목록.value.find(m => m.rowKey === id)
  if (!model) return
  selected.value = model

  // 탭도 여기서 갈린다. **앞 행에서 보던 탭을 다음 행에 물려주지 않는다** —
  // 주소가 옮긴 선택(도우미·링크·뒤로가기)일 때만 주소에 적힌 묶음을 따르고,
  // 손으로 고른 선택은 그 행의 첫 묶음에서 시작한다.
  //
  // 이 판단이 여기 있는 이유는 `주소발`이 여기서만 살아 있어서다. 아래 주소 watch로 내리면
  // 앞 행의 탭이 그대로 주소에 남아 있어서 「손으로 고른 새 행」과 구분이 안 된다.
  const 이행탭s = 탭라벨s(model)
  const 주소탭 = 주소발 ? url선택탭.value : ''
  tab자동필드.value = (주소탭 && 이행탭s.includes(주소탭) ? 주소탭 : 이행탭s[0]) ?? ''

  // 손으로 카드를 누른 선택은 **언제나** 목록이 포커스를 쥔다 — 그래야 고른 자리에서 곧장
  // 방향키로 다음 행에 간다(`useListNav`가 root 포커스에 매달려 있다).
  //
  // 주소가 옮긴 선택(도우미의 `?id=`·링크·뒤로가기)에서만 갈린다. 도크가 열려 있으면 그 선택을
  // 시킨 손은 채팅 입력에 있다 — 거기서 커서를 뺏으면 말로 골라놓고 다음 문장을 치려고
  // 입력창을 다시 눌러야 한다. 도크가 닫혀 있으면 뺏을 데가 없으니 목록이 받아 방향키를 살린다.
  if (!주소발 || !dock.open.value) do포커스()
})

// 좁은가. `mBox반응형` 과 같은 컴포저블에서 받는다 — 왕복 없이 둘이 같은 값을 본다.
const { is미니 } = useResponsive()

/**
 * 좁은 화면의 상세(팝업)가 열려 있나. **상태가 아니라 선택에서 파생된다.**
 *
 * 따로 든 불리언이었을 때 주소와 따로 놀았다. `?id=` 가 지워져도(도우미가 "여름채소 보여줘"로
 * 화면을 옮기는 턴) 이 값은 참으로 남아 **빈 유리 상자가 목록을 덮었고**, 반대로 배경을 눌러
 * 닫아도 `?id=` 는 그대로라 도우미는 여전히 그 행을 보고 있다고 판단했다.
 *
 * 파생시키면 그 두 가지가 같이 없어진다 — 여닫힘의 주인이 주소 하나가 된다.
 * 닫는 것은 곧 선택을 지우는 것이고(setter), 그러면 위의 주소 watch 가 `?id=` 를 걷어간다.
 */
const is상세열림 = computed({
  get: () => !!is미니.value && !!selected.value,
  set: (v: boolean) => { if (!v) selectedId.value = null }
})

/**
 * 좁은 화면에서 상세가 열리면 도크를 「한 줄」로 내린다.
 *
 * **도우미가 연 것이든 손으로 연 것이든 같다.** 화면을 덮는 상세가 떴는데 도크가 펼쳐진 채면
 * 둘이 서로를 가린다 — 도우미가 미는 쪽은 `화면으로()` 가 이미 접지만, 손으로 고른 선택에는
 * 그 통로가 없어서 여기가 그 자리다. 접혀 있으면 마지막 답변과 실행 버튼이 상세 위에 한 줄로 남는다.
 *
 * 도크가 닫혀 있으면 아무 일도 안 일어난다(`useDock.한줄` 이 열림을 같이 본다).
 */
watch(is상세열림, (v) => { if (v) dock.접기() })

const isFooter = inject('isFooter')
watch(is미니, (v) => { if (isFooter) isFooter.value = !v })

const 필터 = ref('')
const 검색어 = computed(() => 필터.value.trim())
const route = useRoute()
const 메뉴repo = model메뉴s.getInstance()
const 현재메뉴 = computed(() => 메뉴repo.getByPath(route.path))
const is폴더아이템 = (item: i폴더레이아웃아이템dto): item is i폴더sdto => {
  return typeof item === 'object' && item !== null && Array.isArray(item.children)
}

//  = 정렬조건.value;
const 정렬조건s = props.repository.정렬조건s
const 정렬조건 = ref<any>(정렬조건s[0]?.value)// '글자순');

const topN = ref(100)
const 필터조건ss = computed(() => props.repository?.필터조건ss ?? [])

/**
 * 필터 축별 선택값. **repo가 아니라 이 컴포넌트가 소유한다.**
 *
 * repo는 `getInstance()` 싱글턴이라, 선택을 repo에 두면 같은 모델을 보는 목록이 둘 이상일 때
 * (목록 + 선택 모달, 우측 도크) 한쪽 필터가 다른 쪽을 끌고 다닌다. 정렬조건·검색어·topN이
 * 이미 여기 로컬로 있으니, 같은 성격인 필터 선택만 repo에 남을 이유도 없다.
 * repo에는 축의 **정의**(`options`·`match`·`기본선택`)만 남는다 — AI 어휘도 그 정의만 읽는다.
 *
 * URL과 필터를 물려야 하는 페이지(`member-posts`)는 `v-model:필터선택`으로 이 상태를 가져간다.
 */
const 필터선택s = defineModel<i필터선택s>('필터선택', { default: () => ({}) })

/** 뷰가 아직 안 건드린 축은 모델이 선언한 `기본선택`을 쓴다. */
const 그룹선택 = (g: { key: string, 기본선택?: string | string[] | null }) =>
  g.key in 필터선택s.value ? 필터선택s.value[g.key] : (g.기본선택 ?? null)

const set그룹선택 = (key: string, v: string | string[] | null) => {
  필터선택s.value = { ...필터선택s.value, [key]: v }
}

const 선택값s = (selected: string | string[] | null | undefined) =>
  Array.isArray(selected) ? selected : selected == null || selected === '' ? [] : [selected]

const 필터predicates = computed(() =>
  필터조건ss.value.map((g) => {
    const values = 선택값s(그룹선택(g))
    if (values.length === 0) return (_a: any, _i: number) => true
    const opts = g.options.filter(o => values.includes(o.value))
    if (opts.length === 0) return (_a: any, _i: number) => true
    return (a: any, i: number) => opts.some(o => o.match(a, i))
  })
)

const 범위목록 = computed(() => {
  const 범위 = props.범위
  return 범위 ? props.repository.list.value.filter(범위) : props.repository.list.value
})

const 필터된목록 = computed(() => {
  const 키워드 = 검색어.value
  const 선택정렬함수 = 정렬조건s.find(x => x.value == 정렬조건.value)?.func
  // 검색 대상은 모델이 `검색필드s`로 선언한다(비면 label/sub — 종전 동작).
  // 챗봇의 `검색어s`도 같은 함수를 쓰므로 "화면에서 걸리는 건 챗봇에서도 걸린다"가 성립한다.
  return 범위목록.value
    .filter(x => 행검색매칭(x, props.repository.검색필드s, 키워드))
    .toSorted((a: any, b: any) => {
      return 선택정렬함수?.(a, b) ?? 0
    })
    .filter((x, idx) => 필터predicates.value.every(fn => fn(x, idx)))
})

const ref상세 = ref<any>()

const is중요정보만 = ref(!false)

const 전체수 = computed(() => 범위목록.value.length)
const 필터수 = computed(() => 필터된목록.value.length)
const is필터적용 = computed(() => 필터수.value !== 전체수.value)
const 선택된필터s = computed(() =>
  필터조건ss.value.flatMap(g => 선택값s(그룹선택(g)))
)
const is목록조회중 = computed(() => props.repository?.is읽는중?.value ?? false)
const is목록조회완료 = computed(() => (props.repository?.is읽기완료?.value ?? false) || props.isReady)

const getBadges = (model: any): { label: string, color?: string, variant?: string, size?: string, icon?: string }[] => {
  const raw = Array.isArray(model?.badges) ? model.badges : []
  return raw
    .map((badge: any) => (typeof badge === 'string' ? { label: badge } : badge))
    .filter((badge: any) => typeof badge?.label === 'string' && badge.label.length > 0)
    .filter((badge: any) => is중요정보만.value ? badge.color !== 'neutral' : true)// 되도록 중요값만 보이도록.
}

/** 저장된 PK → 화면키. 목록에 없는 행(필터로 빠졌거나 아직 안 읽힘)은 카드로 낼 수 없으니 버린다. */
const to화면키 = (pk: unknown): string | null =>
  props.repository.getById?.(pk as any)?.rowKey ?? null

/**
 * 화면키 → 저장할 PK. **저장 전 행은 `null`** — 남의 `childIds`/`폴더s`에 박아둘 PK가 아직 없다.
 * (예전엔 여기로 `pending-…`이 그대로 흘러들어가 DB에 남았다.)
 */
const toPK = (화면키: unknown) => {
  const model = props.repository.getByKey?.(String(화면키))
  return model && !model.is신규 ? model.stateId : null
}

const 카드목록 = computed({
  get: () =>
    toValue(필터된목록).map(model => ({
      // `key`가 화면 식별자(rowKey), `id`는 서버 PK. 갈라둔 이유는 저장되는 값과 아닌 값이
      // 섞여 있어서다 — `childIds`·`폴더s`는 DB로 가고, 선택·렌더 키는 안 간다.
      key: model.rowKey,
      id: model.stateId,
      eyebrow: model.sub,
      brief: model.brief,
      label: model.label,
      icon: model.icon,
      thumbnail: model.thumbnail,
      표지비율: model.표지비율,
      badges: getBadges(model).map(({ label, color, icon }) => ({ label, color, icon })),
      is수정됨: toValue(model.is수정됨),
      is저장중: toValue(model.is저장중),
      // mList2는 `childIds`를 `idOf`(=`key`)와 **같은 네임스페이스**로 본다.
      // 저장된 값은 PK라, 여기서 화면키로 바꿔 넣고 setter에서 되돌린다.
      childIds: [...(model.자식s ?? [])].map(to화면키).filter((k): k is string => !!k)
    })),
  set: (cards) => {
    if (!Array.isArray(cards)) return
    // 카드가 들고 있는 건 전부 화면키다 — 트리 판정도 화면키끼리 한다.
    const nested = new Set(
      cards.flatMap(c => (Array.isArray(c.childIds) ? c.childIds : [])).map(k => String(k))
    )
    const rootIds: Array<string | number> = []
    cards.forEach((card, idx) => {
      const 화면키 = (card as { key?: unknown })?.key
      if (화면키 == null) return
      const model = props.repository.getByKey?.(String(화면키))
      if (!model) return
      model.순서 = idx
      model.자식s = (Array.isArray(card.childIds) ? card.childIds : [])
        .map(toPK)
        .filter((pk): pk is string | number => pk != null)
      const pk = toPK(화면키)
      if (pk != null && !nested.has(String(화면키))) rootIds.push(pk)
    })
    // 기존 폴더s 정렬 호환 (루트 순서)
    if (props.repository.메뉴 && Array.isArray(rootIds))
      props.repository.메뉴.폴더s = [...rootIds]
  }
})

const on생성직후 = () => setTimeout(() => {
  ref상세.value?.do수정중()// = true;
}, 100)

onMounted(() => {
  if (props.repository.메뉴 && props.repository.메뉴.폴더s)
    check폴더s()
  return
})
const check폴더s = () => {
  const 폴더s = props.repository.메뉴.폴더s
  if (!Array.isArray(폴더s)) return

  const normalizeId = (value: unknown) => String(value ?? '').trim()
  const 목록ids = toValue(props.repository.list)
    .filter(item => !item.is신규) // 저장 전 행의 임시 id를 레이아웃(=DB)에 남기지 않는다
    .map(item => normalizeId(item?.state?.id))
    .filter(Boolean)

  const 기존레이아웃Ids = new Set(
    폴더s
      .flatMap(item => (is폴더아이템(item) ? item.children : [item]))
      .map(childId => normalizeId(childId))
      .filter(Boolean)
  )

  const 새로추가한ids = new Set<string>()
  const 누락ids = 목록ids.filter((id) => {
    if (기존레이아웃Ids.has(id)) return false
    if (새로추가한ids.has(id)) return false
    새로추가한ids.add(id)
    return true
  })

  if (!누락ids.length) return

  props.repository.메뉴.폴더s = [...props.repository.메뉴.폴더s, ...누락ids]
}

const do추가 = async () => {
  const a = await props.repository.empty()
  console.log(a)
  selectedId.value = toValue(필터된목록).find(x => x.isSame(a))?.rowKey ?? a?.rowKey ?? null
  on생성직후()
}

/**
 * ## 낮은 화면에서는 카드가 아니라 줄이다 (2026-09-09)
 *
 * **폴드 가로(1015×604)를 재서 나온 규칙**이다(2026-09-09). 그 화면에서는 크롬을 아무리 접어도
 * **카드 보기로는 3장이 안 선다** — 제목줄·하단줄까지 전부 걷어 봐야 2.6장이고, 줄로 바꾸면
 * 크롬에 손 안 대고 3.5장이다. 그래서 낮은 화면에서 갈리는 건 「크롬을 얼마나 접느냐」가 아니라
 * **「카드냐 줄이냐」**다. 크롬은 필터를 띠로 접는 것 하나만 손댄다(`_view필터조건.vue`).
 *
 * ### 방아쇠는 뷰포트가 아니라 **칸**이다
 *
 * 처음엔 `max-height: 800` 이었다. 그런데 800 은 「가로카드 3.5장(563) + 그때 크롬(234)」에서
 * 나온 수라 **크롬을 고치면 같이 움직인다** — 필터를 띠로 접는 것만으로 78px 어긋났다.
 * 폭은 **배치**(한 칸이냐 두 칸이냐)를 가르니 단계(모바일/태블릿/PC)가 자연스럽지만,
 * 세로가 가르는 건 **용량**이라 단계로 만들 것이 아니다. 그래서 `useGridCols`(「몇 열 드나」)의
 * 쌍둥이로 적는다 — **「이 칸에 몇 장 드나」**. 칸을 재므로 크롬이 바뀌어도 안 틀린다.
 *
 * ### 되먹임이 없어야 한다
 *
 * 판단의 입력은 **사람이 저장해 둔 보기**지 지금 그려진 보기가 아니다. 그리는 값을 도로 넣으면
 * 줄로 내려가는 순간 조건이 풀려서 카드↔줄을 오간다. 그래서 카드 치수는 재지 않고 `MIN_H` 로
 * **선언**돼 있다 — 안 그려진 종류의 높이를 알아야 하기 때문이다.
 *
 * **저장값은 안 건드린다.** `메뉴.보기모드` 는 메뉴 설정이라 화면이 덮어쓰면 안 되고, 여기서는
 * 그릴 때만 내린다. 기기를 세로로 돌리면 저장해 둔 보기로 그대로 돌아온다.
 */
const ref목록칸 = useTemplateRef<HTMLElement>('ref목록칸')
const { height: 목록칸높이 } = useElementSize(ref목록칸)

const ref필터칸 = useTemplateRef<HTMLElement>('ref필터칸')
const { height: 필터칸높이 } = useElementSize(ref필터칸)

/** `메뉴.보기모드` 의 세 값 → `mList` 의 `type`. 두 어휘가 만나는 유일한 자리다. */
const 보기type = (v: string | undefined) =>
  v === '목록' ? 'row' : v === '가로카드' ? 'landscape' : 'portrait'

const 저장보기 = computed(() => props.repository?.메뉴?.보기모드)

/**
 * **목록과 필터가 나눠 쓰는 자리.** 필터를 접든 펴든 이 합은 안 변한다 — 둘이 같은 세로 칸의
 * 형제이고 목록이 `grow` 라, 필터가 줄면 그만큼 목록이 늘 뿐이다.
 *
 * 판단의 입력이 **이것**이라야 한다. 목록 칸만 보면 「좁다 → 필터를 접는다 → 넓어졌다 →
 * 필터를 편다 → 좁다」로 오간다. 합은 결정의 결과에 안 움직이므로 그 고리가 안 생긴다.
 */
const 공유높이 = computed(() => 목록칸높이.value + 필터칸높이.value)

/**
 * **세로가 좁은가** — 「필터를 접을 수 있는 만큼 접고도 3장이 안 서나」.
 *
 * 식은 `useGridCols` 의 `좁은높이인가` 한 곳에 있다. 여기서 **입력만** 고른다 —
 * 무엇을 재는 칸으로 볼지(`공유높이`)와 어느 보기로 물을지(저장해 둔 보기)다.
 *
 * **이 값이 답하는 건 하나다 — 보기를 줄로 내릴지.** 넓으면 안 내린다:
 * **걷는 건 자리가 없을 때 쓰는 수단이지 기본값이 아니다.**
 *
 * 한때 둘을 더 물었고 둘 다 떼어 냈다. 필터 접기는 **강등된 뒤의 보기**로 물어야 해서
 * 따로 뗐고(`is필터접기`), 상세의 요약 타일은 **카드 장수와 상관이 없어서** 뗐다 —
 * 시트로 열리면 상세가 화면 전체를 쓰는데 이 판단의 입력은 `#left` 의 두 칸이라
 * 폰 세로에서 어긋났다(2026-09-12). 타일은 이제 `상세5.vue` 가 제 칸 폭으로 줄인다
 * (`is요약압축`) — 걷는 게 아니라 줄이는 것이라 「회비 미납」 신호도 안 잃는다.
 */
const is좁은높이 = computed(() =>
  좁은높이인가(보기type(저장보기.value), 공유높이.value, 표지비율.value))

/**
 * 세로카드 한 장의 길이가 표지 비율로 갈려서(3:4 증명사진은 16:10 의 1.5배) 판단에 같이 넣는다.
 * `mList` 가 칸을 맞추는 규칙(첫 장 값)과 **같은 값**이어야 두 쪽이 같은 카드를 두고 말한다.
 * 그린 보기에서 오는 값이 아니라 모델에서 오는 값이라 되먹임이 없다.
 */
const 표지비율 = computed(() => 카드목록.value.find(카드 => 카드.표지비율)?.표지비율)

/**
 * **사람이 이 화면에서 보기를 직접 골랐나.** 고른 보기는 강등보다 앞선다.
 *
 * 강등은 「저장해 둔 보기가 이 칸에 안 서니 줄로 그린다」는 기본값의 보정이지 금지가 아니다.
 * 한동안 강등 중엔 보기 손잡이를 숨겼는데, 3:4 증명사진(`/p/characters`)은 보통 모니터에서 늘 강등이라
 * **카드로 볼 길이 아예 없었다.** 그래서 손잡이는 늘 세우고, 누르면 그 보기를 그대로 그린다.
 * 저장은 안 한다(`필터손댐` 과 같은 규율) — 다시 오면 규칙대로 다시 선다.
 */
const 보기손댐 = ref(false)

const is보기강등 = computed(() => !보기손댐.value && is좁은높이.value)

/** 그려지는 보기. `is필터접기` 가 이걸 읽고 그 `watch` 가 곧바로 평가하므로 그보다 먼저 선다. */
const tab보기 = computed({
  get: () => (is보기강등.value ? '목록' : 저장보기.value),
  set: (v) => {
    if (!props.repository?.메뉴) return
    보기손댐.value = true
    props.repository.메뉴.보기모드 = v
  }
})

/**
 * **펼친 필터가 먹는 높이.** 펴져 있을 때만 갱신하고 접히면 그 값을 **얼린다**(watch 는 `필터상태`
 * 아래에 있다) — 접힌 뒤의 띠 높이로 갱신하면 「접었더니 넓어졌다 → 편다 → 좁다」로 진동한다.
 * 얼려 두면 판단의 입력이 접힘 상태에 안 움직이므로, 한 번 접힌 것은 `공유높이` 가 실제로 늘 때만 펴진다.
 *
 * 처음엔 `0` 이라 「필터가 자리를 안 먹는다」로 시작한다 — 첫 그림은 펴진 채로 서고 재고 나서 접힐 일이면
 * 접힌다. 반대로 뒀으면 붙자마자 한 번 접혔다 펴져서 덜컹인다(`필터손댐` 주석의 그 증상).
 */
const 필터펼침높이 = ref(0)

/**
 * **필터를 접을지는 「펼친 필터를 물고도 3장이 서나」로 묻는다** — 「접고도 안 서나」(`is좁은높이`)가 아니다.
 *
 * 한동안 `좁은높이인가` 를 그대로 썼다. 그 식은 띠높이를 미리 빼고 「접고도 안 서나」를 묻는데,
 * 접기의 방아쇠로 쓰면 **접어서 해결되는 경우가 정확히 사각지대로 빠진다.** 접으면 서는 칸은
 * 「접고도 안 서는 것은 아니다」라 안 좁다가 나오고, 그래서 안 접고, 안 접었으니 3장이 안 선다.
 * 폰 세로 + 가로카드가 그 자리였다(2026-09-12 실측): 필터가 활짝 펴진 채로 카드 2장이 떴다.
 * 강등도 안 걸렸는데 그건 맞다 — 접으면 서는 칸이라 줄로 내릴 이유가 없었다.
 *
 * 그려지는 보기(`tab보기`)로 묻는 것은 그대로다. 저장해 둔 보기로 물으면 **강등으로 이미 해결된 것을
 * 또 걷는다** — 3:4 증명사진(`/p/characters`, 한 장 303px)은 줄로 내려 그리고 있는데도 칩만 숨었다.
 *
 * **절이 둘이다.** 장수만 물으면 줄 보기가 빠진다 — 줄은 한 장이 64px 이라 문턱이 208px 이고,
 * 폰 세로의 목록 칸은 필터가 활짝 펴져 있어도 4장 넘게 선다. 그래서 「3장은 서지만 필터가 목록보다
 * 더 먹는」 화면이 남는다(2026-09-12, 폰 세로 + 줄). 둘째 절이 그 자리를 잡는다:
 * **펼친 필터가 형제 칸의 절반을 넘게 먹으면 접는다.** 절반은 임의의 수가 아니라
 * 「필터가 목록보다 더 먹는다」는 뜻 그대로다 — 이 판의 주인은 목록이다.
 *
 * 되먹임은 없다 — `공유높이` 는 필터 상태에 안 움직이고, `필터펼침높이` 는 접히면 얼어 있다.
 */
const is필터접기 = computed(() => {
  if (공유높이.value <= 0) return false
  const 목록칸 = 공유높이.value - 필터펼침높이.value
  return 드는장수(보기type(tab보기.value), 목록칸, 표지비율.value) < 최소장수
    || 필터펼침높이.value > 목록칸
})

/**
 * 필터를 접은 채로 설지.
 *
 * **상태를 걸어 두지 않고 규칙에서 바로 읽는다.** `watch` 로 넣어 두면 **첫 측정의 순간값이
 * 그대로 눌어붙는다** — 붙자마자 한 번은 목록 칸이 0 이라 「좁다」가 나오고, 그때 걸린
 * 「띠」가 화면이 다 선 뒤에도 남는다. 계산으로 두면 값이 갱신되는 즉시 저절로 풀린다.
 *
 * 사람이 띠를 누른 것만 `필터손댐` 으로 덮어쓰고, **경계를 넘으면 그 손댐도 놓는다** —
 * 창을 줄여서 자리가 없어졌는데 아까 펴 둔 것 때문에 계속 펴져 있으면 규칙이 무의미하다.
 * 저장은 안 한다. 다시 오면 규칙대로 다시 선다.
 *
 * 손댐이 **좁을 때만 생긴다.** 넓으면 조건줄이 손잡이를 아예 안 그리기 때문이다(`can접기`) —
 * 그래서 이 `null` 되돌리기는 좁음→넓음 방향에선 이미 없는 값을 지우는 셈이고,
 * 실제로 일하는 건 넓음→좁음, 그리고 좁은 채로 경계를 다시 넘는 경우다.
 */
const 필터손댐 = ref<'띠' | '펼침' | null>(null)
watch(is필터접기, () => { 필터손댐.value = null })

const 필터상태 = computed({
  get: () => 필터손댐.value ?? (is필터접기.value ? '띠' : '펼침'),
  set: (v: '띠' | '펼침') => { 필터손댐.value = v }
})

/**
 * **규칙이 펴 둔 동안만 잰다** — 접혔을 때(띠 높이로 갱신하면 진동)도, **사람이 손댄 동안**도 안 잰다.
 *
 * 손댐 중에 재면 **펴는 행위가 제 손댐을 지운다.** 펼치면 필터칸이 다시 재어지고, 그 값이
 * `is필터접기` 를 뒤집는 순간 위 `watch(is필터접기)` 가 「경계를 넘었다」로 읽어 `필터손댐` 을
 * 놓아 버린다 — 규칙이 다시 접으니 단추가 안 먹는 것처럼 보인다(2026-09-12, 가로카드).
 * 재기를 규칙이 펴 둔 상태에만 묶으면 판정이 손댐 중에 얼어 있어, 손댐을 놓는 건 `공유높이` 나
 * 그려지는 보기가 실제로 변할 때뿐이 된다 — 그게 그 `watch` 가 애초에 하려던 일이다.
 */
watch(필터칸높이, (h) => {
  if (h > 0 && 필터손댐.value === null && !is필터접기.value) 필터펼침높이.value = h
})

const is가로카드보기 = computed(() => tab보기.value !== '세로카드')

/**
 * 선택을 **주소에 둔다** — `?id=<식별자>`.
 *
 * 앱 안의 임시 채널이 아니라 URL인 이유: 새로고침·뒤로가기·링크 공유가 전부 공짜로 따라오고,
 * 도우미가 대상을 옮기는 것도 "그 주소로 이동"이면 끝이라 따로 배선할 게 없다.
 *
 * 이름이 그냥 `id`인 건 **한 라우트에 이 컴포넌트가 하나**이기 때문이다(현재 전 페이지가 그렇다).
 * 쿼리 이름은 라우트 안에서만 겹치므로 다른 화면의 `?id=`와는 부딪히지 않는다.
 * 한 화면에 목록을 둘 놓게 되면 그때 이 칸부터 갈라야 한다.
 *
 * 축은 **서버 PK 우선, 없으면 rowKey**다.
 *
 * PK만 싣던 시절엔 저장 전 행(초안)이 주소에 못 올라갔다 — PK가 없으니까. 그래서 도우미가
 * 만든 초안을 화면에서 열어줄 길이 없었고, "만들기"만 다른 통로를 파야 했다. `rowKey`를
 * 대신 실으면 통로가 하나로 남는다. 대신 두 값의 성격이 다르다 — PK는 영구라 새로고침·공유가
 * 따라오고, `rowKey`(`local:*`)는 이 탭에서만 뜻이 있다.
 *
 * 그래서 **저장되는 순간 주소를 PK로 갈아끼운다.** rowKey는 저장돼도 `local:*`로 굳으므로
 * (그게 맞다 — 폼이 쥔 모델이 그대로 살아 있어야 한다) 안 갈아끼우면 이미 저장된 행인데
 * 링크가 죽는다. 아래 watch가 `selected`(인스턴스)가 아니라 **식별자**를 보는 이유다.
 */
const 첫값 = (v: unknown) => (Array.isArray(v) ? v[0] : v)
const 식별 = (m: any) => String((m && !m.is신규 ? m.stateId : m?.rowKey) ?? '')
const url선택id = computed(() => String(route.query.id ?? ''))

/** 주소 → 화면. 목록이 아직 안 실렸으면 물러난다 — 채워지는 순간 이 watch가 다시 온다. */
const do주소선택 = () => {
  const id = url선택id.value
  if (!id || 식별(selected.value) === id) return

  const 대상 = toValue(props.repository?.list ?? []).find((m: any) => 식별(m) === id)
  if (!대상) return

  if (!필터된목록.value.some(m => m.rowKey === 대상.rowKey)) {
    // 검색어에 가려진 것뿐일 수 있다. 한 번 풀어주고 물러난다(목록이 바뀌면 다시 불린다).
    if (검색어.value) 필터.value = ''
    return
  }
  // 값이 그대로면 아래 watch 가 안 뛴다 — 그때 표시를 남기면 다음 **손 클릭**이 그걸 주워 쓴다.
  if (selectedId.value !== 대상.rowKey) is주소발선택 = true
  selectedId.value = 대상.rowKey
}
watch([url선택id, 필터된목록], do주소선택, { immediate: true })

/**
 * 주소에서 선택이 빠지면 화면의 선택도 걷는다. **뒤로가기로 상세를 닫는 길이 이것이다.**
 *
 * `do주소선택` 은 빈 id 에서 그냥 물러난다(열 대상이 없으니까). 그래서 이게 없으면 뒤로가기가
 * URL 만 되돌리고 상세는 열린 채 남는다 — 좁은 화면에서는 그 상세가 화면을 통째로 덮고 있다.
 * 도우미의 조회 턴(`?id=` 를 안 들고 가는 이동)도 같은 길로 상세를 닫는다.
 *
 * 값이 실제로 갈릴 때만 뛰므로 손 클릭과 경합하지 않는다 — 클릭은 '' → id 로 가지 그 반대가 아니다.
 */
watch(url선택id, (id) => {
  if (!id && selected.value) selectedId.value = null
})

/**
 * 탭도 주소에 둔다 — `?tab=<묶음 라벨>`. **`?id=`의 부속이다.**
 *
 * 탭은 열린 행 안에서만 뜻이 있어서 수명이 선택과 같다. 그래서 둘을 **한 번의 이동으로 같이
 * 쓴다**(아래 watch 하나가 유일한 writer다). 따로 쓰면 각자 `route.query`를 복사해 가서 나중
 * 것이 앞 것을 덮고, 선택이 지워진 주소에 탭만 남는 **고아**가 생긴다 — 그 고아는 다음에
 * 손으로 연 행에서 아무도 안 시킨 탭으로 나타난다.
 *
 * **버릴지 말지는 식별자가 아니라 행으로 가른다**(위 `selectedId` watch). 초안이 저장되면
 * 식별자가 `local:*` → PK로 갈리는데, 그건 다른 행이 아니라 같은 행이다 — 식별자로 가르면
 * 저장하는 순간 폼이 첫 탭으로 튄다.
 *
 * 첫 묶음은 주소에 안 적는다(조회 축들과 같은 규칙 — 주소에는 벗어난 것만 적는다).
 * 묶음이 하나뿐인 행에는 탭이랄 게 없으므로 역시 안 적는다.
 */
const url선택탭 = computed(() => String(첫값(route.query.tab) ?? ''))
const 탭쿼리 = computed(() => {
  const 있는s = 탭라벨s(selected.value)
  const t = String(tab자동필드.value ?? '')
  return 있는s.length > 1 && t && t !== 있는s[0] && 있는s.includes(t) ? t : undefined
})

/** 주소 → 화면. **같은 행에서 탭만 갈릴 때**다(행이 갈리는 경우는 `selectedId` watch가 진다). */
watch(url선택탭, (t) => {
  const 있는s = 탭라벨s(selected.value)
  if (!있는s.length) return
  // 없는 이름이면 첫 묶음이다. 조용히 흘리는 게 아니라, 그 행에 없는 탭이라 열 자리가 없다.
  const 다음 = (t && 있는s.includes(t) ? t : 있는s[0]) ?? ''
  if (다음 !== String(tab자동필드.value ?? '')) tab자동필드.value = 다음
})

/**
 * 화면 → 주소. 이게 없으면 도우미가 적어둔 주소와 눈에 보이는 선택이 곧장 어긋난다.
 * `replace`: 행을 훑을 때마다 히스토리가 쌓이면 뒤로가기가 못 쓰게 된다.
 *
 * **인스턴스가 아니라 식별자를 본다.** 초안이 저장돼 PK를 받아도 모델 인스턴스는 그대로라,
 * `watch(selected, ...)`는 그 순간 안 뛴다 — 주소가 `local:*`에 멈춰 죽은 링크가 된다.
 *
 * `id`와 `tab`을 **한 번에** 쓴다 — 주소에서 둘을 가르는 유일한 자리다(위 「탭」 참고).
 */
watch([() => 식별(selected.value), 탭쿼리], ([id, tab]) => {
  // 선택이 없으면 탭도 없다 — 고아를 만들지 않는 자리가 여기다.
  const 탭 = id ? tab : undefined
  if (id === url선택id.value && (탭 ?? '') === url선택탭.value) return

  // **좁은 화면에서 행을 여는 것은 이동이다.** 상세가 화면을 통째로 덮으므로 뒤로가기가 그
  // 상세를 닫는 것이어야 하는데, 전부 replace 로 적으면 뒤로가기가 페이지를 떠나 버린다.
  // (예전엔 `mPopup` 이 자기 가짜 항목을 밀어 그 노릇을 했다 — 선택 한 번에 항목이 둘 쌓여
  //  「선택은 살아 있는데 상세는 닫힌」 상태가 만들어지던 원인이다. 이제 주소 하나가 진다.)
  //
  // 넓은 화면은 그대로 replace: 방향키로 행을 훑는 자리라 한 행마다 쌓이면 뒤로가기를 못 쓴다.
  // **여는 전이에서만** 민다 — 행에서 행으로 옮길 때까지 쌓으면 돌아가는 길이 그만큼 길어진다.
  const 여는중 = !!id && !url선택id.value
  const push = !!is미니.value && 여는중
  void navigateTo({ query: { ...route.query, id: id || undefined, tab: 탭 } }, { replace: !push })
})

/**
 * 조회 상태도 주소에 둔다 — `?q=`(검색어) · `?sort=`(정렬) · `?f_<축>=`(필터 축).
 *
 * `?id=`(선택)과 같은 이유이고, 하나가 더 있다: **도우미가 화면을 모는 채널이 주소뿐**이라
 * 주소에 없는 상태는 말로 바꿀 수 없다. "여름채소"가 화면에 걸리려면 필터가 여기 있어야 한다.
 *
 * 축 이름은 `key`가 아니라 `title`을 쓴다 — 이유는 `필터축쿼리키`(도우미와 공유하는 함수)에 적혀 있다.
 *
 * **기본값은 안 적는다.** 안 건드린 축은 모델의 `기본선택`이 답이고, 그걸 주소에 박아두면
 * 모델이 기본을 바꿔도 옛 링크가 옛 기본을 되살린다. 주소에는 **벗어난 것만** 적는다.
 *
 * 읽기는 **전량 교체**다(주소에 없으면 비운다). 그래야 뒤로가기가 필터를 되돌린다 —
 * 일부만 반영하면 도우미가 걸어둔 필터에서 빠져나올 방법이 없어진다.
 *
 * 쓰기는 늘 `replace`다. 사용자가 직접 만진 것은 뒤로가기 대상이 아니다(한 글자 칠 때마다
 * 히스토리가 쌓이면 뒤로가기가 못 쓰게 된다). 반대로 **도우미가 걸어준 것은 `push`**여서
 * 뒤로가기 한 번이면 보던 화면으로 돌아온다 — 그 선택은 거는 쪽(도우미)에 있다.
 */
const 기본정렬 = 정렬조건s[0]?.value

/** 이 컴포넌트가 소유하는 쿼리 키들. 나머지는 남의 것이라 손대지 않는다. */
const 조회키s = computed(() => ['q', 'sort', ...필터조건ss.value.map(필터축쿼리키)])

/** 화면 상태 → 쿼리. 기본값에서 벗어난 것만 담는다. */
const 조회쿼리 = computed<Record<string, string>>(() => {
  const out: Record<string, string> = {}
  if (검색어.value) out.q = 검색어.value
  if (정렬조건.value && 정렬조건.value !== 기본정렬) out.sort = String(정렬조건.value)
  필터조건ss.value.forEach((g) => {
    if (!(g.key in 필터선택s.value)) return // 아직 안 건드린 축은 주소에 안 올린다
    const v = 필터선택s.value[g.key]
    const s = Array.isArray(v) ? v.join(',') : String(v ?? '')
    if (s) out[필터축쿼리키(g)] = s
  })
  return out
})

/** 주소 → 화면. */
const do주소조회 = () => {
  if (!props.주소동기) return

  const q = String(첫값(route.query.q) ?? '')
  if (q !== 검색어.value) 필터.value = q

  const sort = String(첫값(route.query.sort) ?? '') || 기본정렬
  if (sort !== 정렬조건.value && 정렬조건s.some(x => x.value === sort)) 정렬조건.value = sort

  const 다음: i필터선택s = { ...필터선택s.value }
  let 바뀜 = false
  필터조건ss.value.forEach((g) => {
    const raw = 첫값(route.query[필터축쿼리키(g)])
    // 주소에 없으면 **비운다**(= 모델의 기본선택으로 되돌린다). 뒤로가기가 여기에 걸린다.
    if (raw == null || raw === '') {
      if (g.key in 다음) { delete 다음[g.key]; 바뀜 = true }
      return
    }
    const v = g.isMultiple ? String(raw).split(',').filter(Boolean) : String(raw)
    if (JSON.stringify(다음[g.key]) !== JSON.stringify(v)) { 다음[g.key] = v; 바뀜 = true }
  })
  if (바뀜) 필터선택s.value = 다음
}
watch(() => 조회키s.value.map(k => String(첫값(route.query[k]) ?? '')).join('\u0000'), do주소조회, { immediate: true })

/** 화면 → 주소. */
watch(조회쿼리, (q) => {
  if (!props.주소동기) return
  const 지금 = Object.fromEntries(조회키s.value.map(k => [k, String(첫값(route.query[k]) ?? '')]).filter(([, v]) => v))
  if (JSON.stringify(지금) === JSON.stringify(q)) return
  // 내 키만 걷어내고 다시 적는다 — `id`나 페이지가 쥔 파라미터는 그대로 둔다.
  const 나머지 = Object.fromEntries(Object.entries(route.query).filter(([k]) => !조회키s.value.includes(k)))
  void navigateTo({ query: { ...나머지, ...q } }, { replace: true })
})
</script>

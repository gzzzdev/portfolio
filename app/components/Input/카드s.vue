<template>
  <div>
    <div class="flex flex-row gap-2 items-center">
      <div v-if="!false">
        <input선택기
          v-model="tab보기"
          type="radio"
          :items="i메뉴보기모드options.map(x => ({ ...x, label: undefined }))"
          :search="false"
        />
      </div>
      <div v-if="false">
        <mSwitch2
          v-model="is중요정보만"
          :label="is중요정보만 ? '중요만' : '전체'"
          is반대
        />
      </div>
      <UInput
        v-model="필터"
        :ui="{ base: 'text-md' }"
        trailing-icon="i-mdi-search"
        class="w-full grow"
        placeholder=""
      />
    </div>

    <!--
      빈 목록 안내. `can추가`일 때는 그리지 않는다 — 그 경우 mList가 자기 자리에 `+ 추가` 카드를
      이미 그리고, 둘 다 나오면 점선 상자가 둘로 쌓인다.
      예전엔 여기가 `@click` 없는 `<button>`이라, 추가 슬롯처럼 생겼는데 눌러도 아무 일이 없었다.
    -->
    <template v-if="listItems.length === 0 && !can추가">
      <div class="my-2 flex justify-center">
        <div
          :class="[
            'w-full h-20 inline-flex items-center justify-center rounded-lg',
            'border border-dashed border-accented',
            'px-6 py-2.5 text-sm',
            'text-toned',
            'bg-muted'
          ]"
        >
          {{ 검색어 ? '검색 결과가 없습니다.' : '목록이 없습니다.' }}
        </div>
      </div>
    </template>
    <template v-if="!true && openedId">
      <mBox반응형
        v-model:is열림="is열림"
      >
        <template #left>
          <mList
            v-model:selected-id="openedId"
            :items="listItems"
            type="row"
            :추가라벨="can추가 ? '+ 추가' : undefined"
            :do추가="can추가 ? props.do빈생성 : undefined"
            can확장
          >
            <template #actions>
              <div />
            </template>
          </mList>
        </template>
        <template #right>
          <div>
            <USeparator class=" px-2 mt-1 mb-4" />
            <view모델필드s
              :items="표시필드s"
              :is한줄="true"
              :is수정중="is수정중"
              :get로딩Ref="get로딩Ref"
            />
          </div>
        </template>
      </mBox반응형>
    </template>
    <template v-else-if="!false">
      <mList
        v-model:selected-id="openedId"
        v-model:tab="tab자동필드"
        :items="listItems"
        :type="listType"
        :추가라벨="can추가 ? '+ 추가' : undefined"
        :do추가="can추가 ? props.do빈생성 : undefined"
        can확장
        :is수정중="!readonly"
        :can="{ 수정: !readonly, 삭제: !readonly, 생성: can추가 }"
      >
        <template #trailing="{ item }">
          <div
            class="flex min-w-0 shrink items-center gap-1"
            data-no-collapse
            @click.stop
          >
            <mButton
              v-if="item.model?.is수정됨"
              class="p-1"
              icon="i-material-symbols-light-save-outline-rounded"
              :loading="item.model?.is저장중"
              :label="(is미니 || ['portrait', 'landscape'].includes(listType)) ? undefined : '저장'"
              @click.stop.prevent="() => item.model?.do저장()"
            />

            <mButton
              v-if="false"
              class="p-1"
              역할="조용"
              color="error"
              icon="i-material-symbols-light-close-rounded"
              :loading="item.model?.is삭제중"
              @click.stop.prevent="() => item.model?.delete?.()"
            />
          </div>
        </template>
      </mList>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, toValue } from 'vue'
import type { ListCardAction, ListCardItem } from '~/components/m/List/types'
import { get버튼s } from '~/components/view/1'
import {
  i메뉴보기모드options,
  type i메뉴보기모드
} from '~models/test2'

interface Props {
  readonly?: boolean
  do빈생성?: () => void
  show탭?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  readonly: false,
  show탭: true
})

const can추가 = computed(() => !props.readonly && !!props.do빈생성)

const { is미니 } = useResponsive()
const is열림 = ref(false)

const _filteredList = defineModel<BaseModels<any>[] | null>({ required: false, default: () => [] })

const 필터 = ref('')
const 검색어 = computed(() => 필터.value.trim())
const tab보기 = ref<i메뉴보기모드>('목록')
const is중요정보만 = ref(true)

const listType = computed(() => {
  if (tab보기.value === '목록') return 'row'
  return tab보기.value === '가로카드' ? 'landscape' : 'portrait'
})

const 필터된목록 = computed(() => {
  const 키워드 = 검색어.value
  // 모델에서 준 정렬 유지 (id 재정렬하면 이력 유니온 등에서 순서가 깨짐)
  return toValue(_filteredList)
    .filter((x: any) => !키워드 || x.label?.includes(키워드) || x.sub?.includes(키워드))
})

type CardListItem = ListCardItem & { model: any }

const openedId = ref<string | number | null>(null)
const top버튼s = (model: any) =>
  get버튼s(model).filter((x: any) => x.position == 'top')

const toActions = (model: any): ListCardAction[] => {
  const actions: ListCardAction[] = top버튼s(model)
    .filter((btn: any) => toValue(btn.show) && ((btn.is수정할때만 && is수정중.value) || !btn.is수정할때만))
    .map((btn: any) => ({
      // dropdown overflow에 필요 — is미니여도 label 유지
      label: btn.label,
      icon: btn.icon,
      color: 'neutral',
      size: 'xs',
      onClick: () => btn.onClick?.()
    }))

  return actions
}

const listItems = computed<CardListItem[]>(() =>
  (필터된목록.value ?? []).map((model: any, idx: number) => {
    return {
      // 화면 식별자일 뿐 저장되지 않는다(`openedId` 조회용) — PK가 아니라 rowKey를 쓴다.
      // PK로 잡으면 저장 전 행이 PK를 받는 순간 열려 있던 카드가 닫힌다.
      id: model.메뉴명 + ':' + model.rowKey,
      label: model.label,
      eyebrow: model.sub,
      brief: model.brief,
      icon: model?.icon,
      thumbnail: model?.thumbnail,
      표지비율: model?.표지비율,
      is수정됨: !!toValue(model?.is수정됨),
      is저장중: !!toValue(model?.is저장중),
      actions: toActions(model),
      header: model?.header,
      content: model?.content,
      model
    }
  })
)
const openedModel = computed(() =>
  listItems.value.find(x => x.id === openedId.value)?.model
)

const is수정중 = computed(() => !props.readonly)
const tab자동필드 = ref('')

const { 표시필드s, get로딩Ref } = useModelForm(openedModel, {
  tab자동필드
})
</script>

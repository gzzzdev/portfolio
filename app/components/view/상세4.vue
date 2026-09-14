<template>
  <!-- is투명 -->
  <mBox유리
    v-if="model !== undefined"
    :is중첩="is중첩"
    :is투명="is투명"
  >
    <template #top>
      <slot name="top">
        <div class="w-full flex flex-row gap-2 mt-1">
          <mButton
            v-if="is미니"
            class="p-1"
            역할="조용"
            :icon="true ? 'i-material-symbols-light-arrow-back-ios-new-rounded' : 'i-material-symbols-light-close'"
            @click.stop.prevent="() => emit('onClose')"
          />

          <mTabs
            v-if="has복수자동필드"
            v-model="tab자동필드"
            class="h-3 grow"
            :items="model?.자동필드ss?.filter(x => toValue(x.show ?? true)).map(x => ({ label: x.label, value: x.label })) ?? []"
          >
            <template #top>
              <div class="flex flex-row gap-1">
                <template v-for="item in 버튼s.filter(x => x.position == 'top')">
                  <mButton
                    v-if="toValue(item.show) && ((item.is수정할때만 && is수정중) || !item.is수정할때만)"
                    :icon="item.icon"
                    :label="is미니 ? undefined : item.label"
                    @click="() => { item.onClick(); emit('onDo') }"
                  />
                </template>

                <div class="grow h-8" />
                <!-- 빈칸이라도 있어야함. -->
                <!-- 상세의 수정은 모바일에서만.  -->
                <template v-if="false">
                  <mSwitch2
                    v-if="is미니 && can?.수정"
                    v-model="is수정중"
                    :label="is수정중 ? '읽기모드로' : '수정하기'"
                    is반대
                  />
                </template>

                <mButton
                  v-if="model?.is수정됨 && is미니"
                  class="p-1"
                  icon="i-material-symbols-light-save-outline-rounded"
                  :loading="model?.is저장중"
                  :label="is미니 ? undefined : '저장'"
                  @click.stop.prevent="() => { model?.do저장(); emit('onDo') }"
                />
              </div>
            </template>
          </mTabs>
          <div
            v-else
            class="grow flex flex-row gap-1 justify-end"
          >
            <template v-for="item in 버튼s.filter(x => x.position == 'top')">
              <mButton
                v-if="toValue(item.show) && ((item.is수정할때만 && is수정중) || !item.is수정할때만)"
                :icon="item.icon"
                :label="is미니 ? undefined : item.label"
                @click="() => { item.onClick(); emit('onDo') }"
              />
            </template>
            <!-- 빈칸이라도 있어야함. -->
            <!-- 상세의 수정은 모바일에서만.  -->
            <mSwitch2
              v-if="is미니 && can?.수정"
              v-model="is수정중"
              :label="is수정중 ? '읽기모드로' : '수정하기'"
              is반대
            />

            <mButton
              v-if="model?.is수정됨 && is미니"
              class="p-1"
              icon="i-material-symbols-light-save-outline-rounded"
              :loading="model?.is저장중"
              :label="is미니 ? undefined : '저장'"
              @click.stop.prevent="() => { model?.do저장(); emit('onDo') }"
            />
          </div>

          <!-- || true -->
        </div>

        <!-- 탭 밑줄. 구조선(border-default)이 아니라 **컨트롤선**이다 — 담는 선이 아니라
                     탭 컨트롤의 일부라, 바로 아래 입력칸 테두리(ring-accented)와 같은 층이어야 한다. -->
        <USeparator
          class="mt-2 mb-4"
          :ui="{ border: 'border-accented' }"
        />
      </slot>
    </template>

    <view모델필드s
      :items="표시필드s"
      :is한줄="true"
      :is수정중="is수정중"
      need-can수정
      :can="can"
      :get로딩Ref="get로딩Ref"
    >
      <template v-if="is수정중 && can?.삭제">
        <USeparator class="mt-6" />
        <div class="flex flex-wrap gap-2 justify-end mr-2 mt-3 mb-2">
          <mButton
            v-if="can?.삭제"
            :icon="!true ? 'i-material-symbols-light-close' : 'i-material-symbols-light-delete-outline-rounded'"
            color="error"
            label="삭제"
            :loading="model?.is삭제중"
            @click.stop.prevent="() => { model?.delete()?.then((is지웠다) => { if (!is지웠다) return; emit('onClose'); emit('onDo') }) }"
          />
        </div>
      </template>
    </view모델필드s>

    <template #bot>
      <slot name="bot" />
    </template>
  </mBox유리>
</template>

<script setup lang="ts">
import { computed, toValue } from 'vue'

interface i기타 {
  is한줄?: boolean
  is미니?: boolean
  is중첩?: boolean
  is투명?: boolean
  // can.수정?: boolean;
  can?: {
    생성?: boolean
    수정?: boolean
    삭제?: boolean
    // 저장?: boolean;

    // update?: boolean;
  }
}
interface Emits {
  'onDo'?: () => void
  'onClose'?: () => void
  'update:isDoing'?: (isDoing: boolean) => void
}
const props = withDefaults(defineProps<i기타>(), {
  is한줄: false,
  is미니: false,
  is중첩: false,
  is투명: false,
  can: () => ({
    생성: false,
    수정: false,
    삭제: false
  })
})
const model = defineModel<any>({ required: false, default: () => ({}) })

const is수정중 = defineModel<boolean>('is수정중', { default: false })

const emit = defineEmits<Emits>()

const tab자동필드 = defineModel<string>('tab자동필드', { required: true, default: '' })
const ratio = defineModel<number>('ratio', { required: !true })

const { 버튼s, 표시필드s, get로딩Ref } = useModelForm(model, {
  tab자동필드,
  ratio,
  emit
})

useKeysShortcut('esc', () => {
  if (props.is미니)
    emit('onClose')
    // props.repository?.do모두저장();
    // console.log('saveData');
})

const has복수자동필드 = computed(() => (model.value?.자동필드ss?.length ?? 0) > 1)

const do수정중 = () => { }
defineExpose({
  do수정중
})
</script>

<template>
  <!-- is투명 -->

  <mBox유리
    v-if="model !== undefined"
    class="bg-default!"
  >
    <template #top>
      <slot name="top">
        <div
          class=" w-full flex flex-row items-center  "
          :class="{
            'cursor-pointer': collapsible
          }"
          @click="onCardClick"
        >
          <mIcon
            v-if="model?.icon"
            class="mt-2 size-8"
            :name="model?.icon"
          />
          <mButton
            v-else-if="collapsible"
            class="p-1"
            역할="조용"
            :icon="open ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
          />

          <div
            v-if="collapsible && 접힘라벨"
            class="px-2 text-sm text-toned cursor-pointer select-none"
          >
            {{ 접힘라벨 }}
          </div>

          <div
            v-if="collapsible && 접힘서브"
            class="px-1 text-xs text-muted cursor-pointer select-none truncate"
          >
            {{ 접힘서브 }}
          </div>

          <div class="grow" />

          <template v-if="show컨트롤">
            <mButton
              v-if="model?.is수정됨"
              class="p-1"
              icon="i-material-symbols-light-save-outline-rounded"
              :loading="model?.is저장중"
              :label="is미니 ? undefined : '저장'"
              @click.stop.prevent="() => { model?.do저장(); emit('onDo') }"
            />

            <div
              v-if="show탭 && model?.자동필드ss?.length > 1"
              class="flex min-h-0 max-h-full min-w-0 shrink items-center overflow-hidden"
            >
              <mTabs2
                v-model="tab자동필드"
                :items="model?.자동필드ss?.map(x => ({ label: x.label, value: x.label })) ?? []"
                @update:model-value="open = true"
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
                  </div>
                </template>
              </mTabs2>
            </div>
            <div
              v-else
              class="gap-1 flex flex-row"
            >
              <template v-for="item in 버튼s.filter(x => x.position == 'top')">
                <mButton
                  v-if="toValue(item.show) && ((item.is수정할때만 && is수정중) || !item.is수정할때만)"
                  :icon="item.icon"
                  :label="is미니 ? undefined : item.label"
                  @click="() => { item.onClick(); emit('onDo') }"
                />
              </template>
            </div>

            <mButton
              v-if="is수정중 && can?.삭제"
              class="p-1"
              역할="조용"
              color="error"
              icon="i-material-symbols-light-close-rounded"
              :loading="model?.is삭제중"
              @click.stop.prevent="() => { model?.delete()?.then((is지웠다) => { if (!is지웠다) return; emit('onClose'); emit('onDo') }) }"
            />

            <!-- || true -->
          </template>
        </div>
        <div
          v-if="model?.content"
          class="pl-[45px] text-sm text-muted"
        >
          <View렌더 :model-value="model?.content" />
        </div>
        <USeparator
          v-if="collapsible && open"
          :class="['mt-3 mb-4']"
        />
      </slot>
    </template>

    <view모델필드s
      v-if="open"
      :items="표시필드s"
      :is한줄="is한줄"
      :is수정중="is수정중"
      :get로딩Ref="get로딩Ref"
    />
  </mBox유리>
</template>

<script setup lang="ts">
import { computed, toValue } from 'vue'

interface i기타 {
  is한줄?: boolean
  is미니?: boolean
  readonly?: boolean
  // can.수정?: boolean;
  can: {
    생성?: boolean
    수정?: boolean
    삭제?: boolean
    // 저장?: boolean;

    // update?: boolean;
  }
  show컨트롤?: boolean
  show탭?: boolean
}
interface Emits {
  'onDo'?: () => void
  'onClose'?: () => void
  'update:isDoing'?: (isDoing: boolean) => void
}
const props = withDefaults(defineProps<i기타>(), {
  is한줄: !false,
  readonly: false,
  show컨트롤: false,
  show탭: true,

  can: () => ({
    생성: false,
    수정: false,
    삭제: false
  })
})
const model = defineModel<any>({ required: false, default: () => ({}) })
const is수정중 = defineModel<boolean>('is수정중', { required: true, default: false })
const open = defineModel<boolean>('open', { required: false, default: true })
const collapsible = defineModel<boolean>('collapsible', { required: false, default: false })

const emit = defineEmits<Emits>()

const { is미니 } = useResponsive()

const tab자동필드 = defineModel<string>('tab자동필드', { required: true, default: '' })
const ratio = defineModel<number>('ratio', { required: !true })

const { 버튼s, 표시필드s, get로딩Ref } = useModelForm(model, {
  tab자동필드,
  ratio,
  emit
})

watch(() => props.can?.수정, v => is수정중.value = (v))
watch(() => props.readonly, (v) => {
  if (v) {
    is수정중.value = false
    return
  }
  if (props.can?.수정)
    is수정중.value = true
}, { immediate: true })

useKeysShortcut('esc', () => {
})

const 접힘라벨 = computed(() => {
  const m = model.value ?? {}
  const 자동그룹라벨 = m?.자동필드ss?.[0]?.label
  if (!collapsible.value)
    return 자동그룹라벨 ?? m.state?.label ?? m.id ?? '상세'
  return m.label ?? m.title ?? m.name ?? m.state?.label ?? m.id ?? '상세'
})

const 접힘서브 = computed(() => {
  const m = model.value ?? {}
  const sub = m.sub ?? m.subtitle ?? m.state?.sub
  if (!sub)
    return ''
  if (sub === 접힘라벨.value)
    return ''
  return sub
})

const onCardClick = (e: MouseEvent) => {
  const target = e.target as HTMLElement | null
  const isInteractive = !!target?.closest(
    'button, a, input, textarea, select, label, [role="button"], [data-no-collapse]'
  )

  if (isInteractive)
    return

  if (collapsible.value)
    open.value = !open.value
}

const do수정중 = () => { if (props.can.수정) is수정중.value = true }
defineExpose({
  do수정중
})
</script>

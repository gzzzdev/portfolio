<!--
  문항 배열(`enrollables.questions` jsonb) 편집칸. `타입지정._.문항s` 가 여기로 온다.

  문항이 표였을 때는 카드s(`Input카드s`)로 그렸다 — 행마다 상세가 열리고 저장이 따로였다.
  값이 되면서 그 껍데기가 다 사라졌다: 이 칸이 배열 통째를 v-model 로 받아 **줄 단위로 제자리에서** 고치고,
  저장은 회차(신청받기) 행이 한 번에 한다. 그래서 여기엔 저장 버튼이 없다.

  줄 하나 = 문두 · 유형 · 필수 · (선택형이면) 선택지 · (선택형이면) 정답·배점.
  정답이 비어 있으면 채점 안 하는 문항이다 — 설문·투표는 그냥 비워 둔다. 별도 「채점」 스위치를 두지 않는다.
-->
<template>
  <div class="w-full space-y-3">
    <div
      v-if="!model.length"
      class="rounded-lg border border-dashed border-default px-4 py-6 text-center text-sm text-muted"
    >
      {{ readonly ? '문항이 없습니다.' : '아직 문항이 없습니다. 아래에서 추가하세요.' }}
    </div>

    <div
      v-for="(문항, i) in model"
      :key="문항.id"
      class="rounded-lg border border-default bg-default p-3"
    >
      <!-- 줄 머리: 번호 · 문두 · 유형 · 필수 · 손잡이 -->
      <div class="flex flex-wrap items-start gap-2">
        <span class="mt-2 w-6 shrink-0 text-sm font-semibold text-dimmed tabular-nums">{{ i + 1 }}</span>

        <div class="min-w-0 grow basis-64">
          <UInput
            v-model="문항.label"
            class="w-full"
            placeholder="문두"
            :readonly="readonly"
            :ui="ui읽기(readonly)"
          />
        </div>

        <USelect
          :model-value="문항.type"
          :items="유형items"
          class="w-36 shrink-0"
          :disabled="readonly"
          @update:model-value="(v: any) => 문항유형바꾸기(문항, v)"
        />

        <UCheckbox
          v-model="문항.isRequired"
          label="필수"
          class="mt-1.5 shrink-0"
          :disabled="readonly"
        />

        <div
          v-if="!readonly"
          class="ml-auto flex shrink-0 items-center gap-0.5"
        >
          <mButton
            역할="인라인"
            size="xs"
            icon="i-ph-arrow-up-light"
            aria-label="위로"
            :disabled="i === 0"
            @click="do옮기기(i, -1)"
          />
          <mButton
            역할="인라인"
            size="xs"
            icon="i-ph-arrow-down-light"
            aria-label="아래로"
            :disabled="i === model.length - 1"
            @click="do옮기기(i, 1)"
          />
          <mButton
            역할="인라인"
            size="xs"
            icon="i-ph-trash-light"
            aria-label="지우기"
            @click="do지우기(i)"
          />
        </div>
      </div>

      <!-- 선택지. OX는 고정이라 안 그린다. -->
      <div
        v-if="is선택지편집(문항)"
        class="mt-2 flex flex-wrap items-start gap-2 pl-8"
      >
        <span class="mt-2 w-12 shrink-0 text-xs text-dimmed">선택지</span>
        <UInputTags
          :model-value="문항.options.map(o => o.label)"
          class="min-w-0 grow basis-64"
          placeholder="입력 후 Enter"
          :readonly="readonly"
          :disabled="readonly"
          @update:model-value="(v: any) => set선택지(문항, v)"
        />
      </div>

      <!-- 정답·배점. 선택형에만. 비워 두면 채점 안 함(설문·투표). -->
      <div
        v-if="is선택형(문항.type)"
        class="mt-2 flex flex-wrap items-start gap-2 pl-8"
      >
        <span class="mt-2 w-12 shrink-0 text-xs text-dimmed">정답</span>
        <USelectMenu
          :model-value="정답values(문항)"
          :items="선택지items(문항)"
          value-key="value"
          multiple
          class="min-w-0 grow basis-48"
          placeholder="없음 (채점 안 함)"
          :disabled="readonly || !선택지items(문항).length"
          @update:model-value="(v: any) => set정답(문항, v)"
        />
        <UInputNumber
          v-if="문항.answerKey?.length"
          v-model="문항.score"
          class="w-32 shrink-0"
          :min="0"
          :max="100"
          :step="5"
          :disabled="readonly"
        />
        <span
          v-if="문항.answerKey?.length"
          class="mt-2 text-xs text-dimmed"
        >점</span>
      </div>
    </div>

    <mButton
      v-if="!readonly"
      size="sm"
      역할="조용"
      icon="i-ph-plus-light"
      label="질문 추가"
      @click="do추가"
    />
  </div>
</template>

<script setup lang="ts">
import { ui읽기 } from './_'
import {
  i문항유형options, is선택형, is복수응답, create선택지, 새문항, 문항선택지s, 문항유형바꾸기,
  type i문항
} from '~models/test2'

interface Props {
  readonly?: boolean
}
const props = withDefaults(defineProps<Props>(), { readonly: false })

/** 배열을 **제자리에서** 고친다. 새 배열을 emit 하면 모델의 state 와 끊긴다. */
const model = defineModel<i문항[]>({ required: false, default: () => [] })

const 유형items = i문항유형options.map(x => ({ label: x.label, value: x.value }))

const is선택지편집 = (문항: i문항) => is선택형(문항.type) && 문항.type !== 'OX'
const 선택지items = (문항: i문항) => 문항선택지s(문항).map(x => ({ label: x.label, value: x.value }))
const 정답values = (문항: i문항) => 문항.answerKey ?? []

/** 태그 입력은 라벨을 준다. 값(value)은 이전 것을 지키고, 새 라벨은 라벨=값으로 만든다. */
const set선택지 = (문항: i문항, 라벨s: unknown) => {
  const 이전 = new Map(문항.options.map(x => [x.label, x.value]))
  const next = (Array.isArray(라벨s) ? 라벨s : []).map(String).filter(x => x.trim().length)
  문항.options = next.map(label => create선택지(label, 이전.get(label) ?? label))
  // 지워진 선택지를 가리키던 정답은 같이 뺀다 — 남기면 채점이 조용히 전부 오답이 된다.
  const 후보 = new Set(문항.options.map(x => x.value))
  if (문항.answerKey) {
    const 남은 = 문항.answerKey.filter(v => 후보.has(v))
    문항.answerKey = 남은.length ? 남은 : null
  }
}

const set정답 = (문항: i문항, v: unknown) => {
  const next = (Array.isArray(v) ? v : v == null ? [] : [v]).map(String)
  const 정리 = is복수응답(문항.type) ? next : next.slice(-1)
  문항.answerKey = 정리.length ? 정리 : null
}

const do추가 = () => {
  if (props.readonly) return
  model.value.push(새문항())
}

const do지우기 = (i: number) => {
  if (props.readonly) return
  model.value.splice(i, 1)
}

const do옮기기 = (i: number, d: -1 | 1) => {
  const j = i + d
  if (props.readonly || j < 0 || j >= model.value.length) return
  const [x] = model.value.splice(i, 1)
  model.value.splice(j, 0, x!)
}
</script>

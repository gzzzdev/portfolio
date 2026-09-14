<template>
  <div :class="_class">
    <template v-if="model && model !== ''">
      <div class="w-full max-h-24 relative">
        <mImage
          :src="model"
          class="max-h-24 w-full object-scale-down"
          :type="type"
        />
        <mButton
          v-if="!readonly"
          class="absolute top-0 right-0"
          icon="i-material-symbols-light-close-rounded"
          size="xs"
          역할="조용"
          @click="() => do삭제()"
        />
      </div>

      <!-- 이미지는 이거 필요없음.  -->
      <!-- 링크 자체를 embed하려는 경우. -->
    </template>
    <template v-else-if="!readonly">
      <div class="w-full min-h-5">
        <mBox유리
          class="cursor-pointer"
          @click="() => ref_input.click()"
        >
          <div class="text-center">
            사진을 선택해주세요.
          </div>
          <div
            v-if="is로딩중"
            class="text-center"
          >
            <UProgress indeterminate />
          </div>
          <input
            ref="ref_input"
            accept="image/png, image/jpeg"
            style="display: none;"
            type="file"
            @change="(e) => {
              on수정(e.target.files);
            }"
          >
        </mBox유리>
      </div>
    </template>
    <template v-else>
      <div class="w-full min-h-5">
        <mBox유리>
          <div class="text-center text-sm">
            비어있음
          </div>
        </mBox유리>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { _ui, _class } from './_'

interface Props {
  readonly?: boolean
  type?: 'client' | 'server'
}
const props = withDefaults(defineProps<Props>(), {
  readonly: false,
  type: 'client'
})

const ref_input = ref()

const model = defineModel<string | null>({ required: false, default: null })
const is로딩중 = defineModel<boolean>('isDoing', { required: true })

const do삭제 = () => {
  model.value = ''
}

const on수정 = async (_list: File[]) => {
  const _file = _list[0]

  const url = await do서버등록(_file)

  model.value = url
}
const do서버등록 = async (_file: File) => {
  is로딩중.value = true

  const formData = new FormData()
  formData.append('file', _file)
  const api = '/api/v1/files/upload'
  const res = await $fetch(api, { method: 'POST', body: formData })
  is로딩중.value = false
  return res.publicUrl
}
</script>

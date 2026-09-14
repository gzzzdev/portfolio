<template>
  <slot
    name="default"
    :on팝업="on팝업"
  >
    <mButton @click="() => on팝업()">
      그림넣기
    </mButton>
  </slot>

  <mPopup v-model="isPopup">
    <div class="p-4 rounded-md bg-default ">
      <div class="mb-2">
        <div class="text-xl ">
          사진
        </div>
        <div class="text-sm text-muted ">
          파일 또는 링크를 올려주세요.
        </div>
      </div>

      <mTabs
        v-model="tab"
        :items="tab_items"
        side="right"
      >
        <template #default="{ activeModel }">
          <template v-if="activeModel?.label == '링크'">
            <div class="w-full  min-w-96 min-h-12">
              <mInput
                v-model="link"
                class="w-full"
                placeholder="https://www."
              />
            </div>
            <div class="h-10 mt-4 mb-2 flex justify-end gap-2">
              <mButton
                :loading="is로딩"
                :icon="아이콘3"
                역할="강조"
                @click="() => do등록()"
              >
                등록
              </mButton>
            </div>
          </template>
          <template v-else-if="activeModel?.label == '파일'">
            <UFileUpload
              v-model="file"
              class="w-96 min-h-48"
              :dropzone="!false"
              :multiple="false"
            />
            <div class="h-10 mt-4 mb-2 flex justify-end gap-2">
              <mButton
                :loading="is로딩"
                :icon="아이콘1"
                역할="강조"
                @click="() => do업로드()"
              >
                업로드
              </mButton>
            </div>
          </template>
        </template>
      </mTabs>
    </div>
  </mPopup>
</template>

<script setup lang="ts">
const file = ref<File | null>(null)

const 아이콘1 = 'i-mdi-light-cloud-upload'
const 아이콘2 = 'i-material-symbols-light-upload-rounded'
const 아이콘3 = 'i-material-symbols-light-check-circle-outline-rounded'

const isPopup = ref(false)
const is로딩중 = ref(false)

const tab_items = [{ label: '링크', icon: 'i-mdi-light-link-variant' }, { label: '파일', icon: 'i-mdi-light-file-plus' }]
const tab = ref(1)

const link = defineModel<string>({ required: true, default: 'https://cdn0.iconfinder.com/data/icons/essential-vol-4/1000/occupations_jobs___flight_attendant_steward_safety_vest_instructions_man-256.png' })

const emit = defineEmits(['on업로드'])

const on팝업 = () => isPopup.value = true
const do등록 = () => {
  emit('on업로드', link.value)
  isPopup.value = false
}

const do업로드 = async (_file: File = file.value) => {
  if (!_file) return

  is로딩중.value = true

  const formData = new FormData()
  formData.append('file', _file)
  const api = '/api/v1/files/upload'
  const res = await $fetch(api, { method: 'POST', body: formData })
  is로딩중.value = false
  const url = res.publicUrl
  emit('on업로드', url)
  isPopup.value = false
  return res
}
</script>

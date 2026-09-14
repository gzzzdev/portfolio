<template>
  <div :class="_class">
    <template v-if="file">
      <div class="w-full flex flex-col gap-2">
        <div class="relative">
          <div
            v-if="isImageFile"
            class="w-full h-102 rounded-md overflow-hidden border border-default bg-muted cursor-pointer"
            @click="() => do다운로드(file.url, file.name + '.' + file.ext)"
          >
            <img
              :src="resolvedImageSrc"
              :alt="`${file.name}.${file.ext}`"
              class="w-full h-full object-contain"
              crossorigin="anonymous"
              referrerpolicy="no-referrer"
              @error="onImageError"
            >
          </div>
          <div
            v-else-if="isPdfFile"
            class="w-full h-102 rounded-md overflow-hidden border border-default bg-muted cursor-pointer"
            @click="() => do다운로드(file.url, file.name + '.' + file.ext)"
          >
            <iframe
              :src="pdfPreviewUrl"
              class="w-full h-full"
              title="PDF Preview"
            />
          </div>
          <div
            v-else
            class="w-full min-h-24 rounded-md border border-default bg-muted px-4 py-3 flex items-center gap-2"
          >
            <UIcon
              name="i-material-symbols-description-outline-rounded"
              class="text-xl text-muted"
            />
            <div class="text-sm text-default break-all">
              {{ fileLabel }}
            </div>
          </div>
          <mButton
            v-if="!readonly"
            class="absolute top-2 right-2 z-10 rounded-full bg-white/90"
            icon="i-material-symbols-close-rounded"
            size="xs"
            color="error"
            역할="조용"
            @click="() => do삭제()"
          />
        </div>
      </div>
    </template>
    <template v-else-if="!readonly">
      <div
        ref="dropZoneRef"
        class="w-full"
      >
        <div
          class="cursor-pointer flex flex-col items-center justify-center rounded-md border border-dashed border-accented transition-colors hover:border-primary hover:bg-primary/5"
          :class="[boxRatioClass, { 'border-primary bg-primary-50/40': isOverDropZone }]"
          @click="() => ref_input.click()"
        >
          <div class="h-full flex flex-col items-center justify-center gap-1 text-center text-sm text-toned">
            <UIcon
              name="i-material-symbols-light-upload-rounded"
              class="block text-2xl"
            />
            <span>파일 선택</span>
          </div>
          <div
            v-if="is로딩중"
            class="w-full px-6 mt-3"
          >
            <UProgress
              indeterminate
              size="sm"
            />
          </div>

          <input
            ref="ref_input"
            style="display: none;"
            type="file"
            @change="(e) => {
              on수정(e.target.files);
              console.log(e.target.files);
            }"
          >
        </div>
      </div>
    </template>
    <template v-else>
      <div :class="['w-full min-h-5 py-3', 'flex flex-col items-center justify-center rounded-md border border-dashed border-accented transition-colors hover:border-primary hover:bg-primary/5']">
        <div class="text-center text-sm">
          비어있음
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useDropZone } from '@vueuse/core'

import type { iFile } from '~utils'
import { _ui, _class } from './_'

interface Props {
  readonly?: boolean

  type: 'blob' | 'upload'

  is세로형?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  readonly: false,
  type: 'upload',
  is세로형: false
})

const emit = defineEmits<{ onFile: [file: File] }>()

const dropZoneRef = useTemplateRef('dropZoneRef')
const ref_input = ref()
const file = defineModel<iFile | null>({ required: false, default: null })

const is로딩중 = defineModel<boolean>('isDoing', { required: false, default: false })

const isImageFile = computed(() => {
  const ext = file.value?.ext?.toLowerCase()
  return ext === 'png' || ext === 'jpg' || ext === 'jpeg'
})

const isPdfFile = computed(() => {
  return file.value?.ext?.toLowerCase() === 'pdf'
})

const fileLabel = computed(() => {
  const name = file.value?.name || '파일'
  const ext = file.value?.ext ? `.${file.value.ext}` : ''
  return `${name}${ext}`
})

const pdfPreviewUrl = computed(() => {
  if (!file.value?.url) return ''
  return `${file.value.url}#toolbar=0&navpanes=0&scrollbar=1`
})

const blobImageUrl = ref('')

const normalizedFileUrl = computed(() => {
  const url = file.value?.url || ''
  if (!url) return ''
  // Firefox can fail on partially encoded URLs from external storage.
  return /supabase/i.test(url) ? encodeURI(url) : url
})

const resolvedImageSrc = computed(() => {
  return blobImageUrl.value || normalizedFileUrl.value
})

const revokeBlobImageUrl = () => {
  if (!blobImageUrl.value) return
  URL.revokeObjectURL(blobImageUrl.value)
  blobImageUrl.value = ''
}

watch(
  () => file.value?.url,
  () => {
    revokeBlobImageUrl()
  }
)

onBeforeUnmount(() => {
  revokeBlobImageUrl()
})

const onImageError = async () => {
  const url = normalizedFileUrl.value
  if (!url || blobImageUrl.value) return
  if (!/supabase/i.test(url)) return

  try {
    const response = await fetch(url, { mode: 'cors' })
    if (!response.ok) return
    const blob = await response.blob()
    blobImageUrl.value = URL.createObjectURL(blob)
  } catch {
    // keep original URL; image element remains in error state
  }
}

const boxRatioClass = computed(() => {
  return props.is세로형 ? 'aspect-[210/297] max-w-[40%]' : 'min-h-36'
})

const _objectFiles = ref<File[]>([])
// _objectFiles.value =
// await urlToFile(urls.value);

// [new File(['test'], 'test.txt', { type: 'text/plain' })];

const objectFiles = computed({
  get: () => _objectFiles.value,
  set: (v) => {
    _objectFiles.value = v

    file.value = do서버등록(v)
  }
})

const MAX_UPLOAD_SIZE_BYTES = 4.5 * 1024 * 1024
const TARGET_IMAGE_SIZE_BYTES = 3.8 * 1024 * 1024
const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp']

const isImageMimeType = (file: File) => IMAGE_MIME_TYPES.includes(file.type)

const loadImageElement = (file: File) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(objectUrl)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('이미지를 읽을 수 없습니다.'))
    }
    img.src = objectUrl
  })

const canvasToBlob = (canvas: HTMLCanvasElement, type: string, quality?: number) =>
  new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('이미지 압축에 실패했습니다.'))
        return
      }
      resolve(blob)
    }, type, quality)
  })

const compressImageForUpload = async (sourceFile: File): Promise<File> => {
  if (!isImageMimeType(sourceFile)) return sourceFile
  if (sourceFile.size <= TARGET_IMAGE_SIZE_BYTES) return sourceFile

  const img = await loadImageElement(sourceFile)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return sourceFile

  let width = img.naturalWidth
  let height = img.naturalHeight
  let quality = 0.9
  let iteration = 0
  const outputType = sourceFile.type === 'image/png' ? 'image/jpeg' : sourceFile.type
  let outputBlob: Blob | null = null

  while (iteration < 8) {
    canvas.width = Math.max(1, Math.round(width))
    canvas.height = Math.max(1, Math.round(height))
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

    outputBlob = await canvasToBlob(canvas, outputType, quality)
    if (outputBlob.size <= TARGET_IMAGE_SIZE_BYTES) break

    quality = Math.max(0.45, quality - 0.1)
    width *= 0.85
    height *= 0.85
    iteration += 1
  }

  if (!outputBlob) return sourceFile

  const nameWithoutExt = sourceFile.name.replace(/\.[^/.]+$/, '')
  const outputName = outputType === 'image/jpeg' ? `${nameWithoutExt}.jpg` : sourceFile.name
  return new File([outputBlob], outputName, { type: outputType })
}

const do삭제 = () => {
  if (confirm('정말 삭제할까요?')) {
    file.value = null
  }
}

const do다운로드 = async (url: string, fileName: string) => {
  try {
    // 이건 cors문제가 생길수 있는데..
    const response = await fetch(url)
    const blob = await response.blob()
    const objectUrl = window.URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = objectUrl
    a.setAttribute('download', fileName)
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    window.URL.revokeObjectURL(objectUrl)
  } catch (e) {

  }
}

const on수정 = async (_list: File[]) => {
  const originalFile = _list?.[0]
  if (!originalFile) return
  const _file = await compressImageForUpload(originalFile)

  if (_file.size > MAX_UPLOAD_SIZE_BYTES) {
    alert('파일이 너무 큽니다. 4.5MB 이하 파일만 업로드 가능합니다.')
    return
  }

  if (props.type == 'upload') {
    const url = await do서버등록(_file)

    file.value = {
      name: _file.name.split('.').shift() || '',
      ext: _file.name.split('.').pop() || '',
      url: url
    }
  } else if (props.type == 'blob') {
    emit('onFile', _file)
  }
}

const do서버등록 = async (_file: File) => {
  is로딩중.value = true
  try {
    const formData = new FormData()
    formData.append('file', _file)
    const api = '/api/v1/files/upload'
    const res = await $fetch(api, { method: 'POST', body: formData })
    return res.publicUrl
  } finally {
    is로딩중.value = false
  }
}
function onDrop(f: File[]) {
  on수정(f)
  // on수정(e.target.files);
}
const { isOverDropZone } = useDropZone(dropZoneRef, {
  onDrop,

  // specify the types of data to be received.
  dataTypes: ['image/jpeg', 'application/pdf', 'image/png'],
  // control multi-file drop
  multiple: !true,
  // whether to prevent default behavior for unhandled events
  preventDefaultForUnhandled: false
})
</script>

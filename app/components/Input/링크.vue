<template>
  <div :class="_class">
    <template v-if="tags">
      <img
        v-if="tags?.ogImage"
        :src="tags.ogImage"
        class="w-full h-40 object-cover rounded-lg"
      >
    </template>
    <input문자
      v-if="!readonly"
      v-model="str"
      class="w-full"
      :readonly="readonly"
    />
  </div>
</template>

<script setup lang="ts">
import { _ui, _class } from './_'

interface Props {
  is수정?: boolean
  readonly?: boolean
  useMeta?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  // is수정: false
  is수정: !false,
  readonly: false,
  useMeta: false

})
const model = defineModel<string | null>({ required: false, default: null })

const str = computed({
  get: () => model.value,
  set: (v: string) => {
    model.value = v
  }
})

const tags = ref<any>(null)

watch(() => model.value, async (newVal: string) => {
  if (import.meta.client && newVal) {
    if (props.useMeta)
      tags.value = await getMetaTags(newVal)
  }
}, { immediate: true })

async function getMetaTags(url: string) {
  if (!url) return null
  // alert('getMetaTags', url);
  // CORS 우회를 위해 프록시 서버 사용 (예시: allorigins)
  const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`

  try {
    const response = await fetch(proxyUrl)
    console.log(response)
    const data = await response.json()
    const htmlString = data.contents // 사이트의 HTML 내용

    // 1. 문자열을 HTML 문서 객체로 변환
    const parser = new DOMParser()
    const doc = parser.parseFromString(htmlString, 'text/html')

    // 2. 원하는 메타태그 정보 추출
    const getMeta = (property: string) => {
      return doc.querySelector(`meta[property='${property}']`)?.getAttribute('content')
        || doc.querySelector(`meta[name='${property}']`)?.getAttribute('content')
    }

    const metadata = {
      title: doc.querySelector('title')?.innerText,
      ogTitle: getMeta('og:title'),
      ogDescription: getMeta('og:description'),
      ogImage: getMeta('og:image')
    }

    console.log(metadata)
    return metadata
  } catch (error) {
    console.error('데이터를 가져오는데 실패했습니다:', error)
  }
}

// 사용 예시
</script>

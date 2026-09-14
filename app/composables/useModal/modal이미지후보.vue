<template>
  <div class="flex max-h-[90dvh] flex-col gap-3 p-5">
    <div class="flex items-baseline gap-2">
      <div class="text-lg">
        {{ title }}
      </div>
      <div class="truncate text-sm text-muted">
        “{{ prompt }}”
      </div>
    </div>

    <USeparator class="my-1" />

    <div
      v-if="isLoading"
      class="flex h-64 flex-col items-center justify-center gap-3 text-muted"
    >
      <UIcon
        name="i-lucide-loader-circle"
        class="size-8 animate-spin"
      />
      <span class="text-sm">{{ 개수 }}장을 만드는 중… (약 10~20초)</span>
    </div>

    <UAlert
      v-else-if="errorMessage"
      color="error"
      title="이미지 생성 실패"
      :description="errorMessage"
    />

    <div
      v-else-if="urls.length === 0"
      class="flex h-64 flex-col items-center justify-center gap-3 text-center"
    >
      <UIcon
        name="i-lucide-image-plus"
        class="size-8 text-dimmed"
      />
      <p class="text-sm text-muted">
        아래 <b>생성</b> 버튼을 누르면 {{ 개수 }}장을 만듭니다.
      </p>
    </div>

    <div
      v-else
      class="flex-1 overflow-auto"
    >
      <div class="flex flex-wrap items-start justify-center gap-4">
        <button
          v-for="(url, i) in urls"
          :key="url"
          type="button"
          class="flex shrink-0 cursor-pointer flex-col items-center gap-2 rounded-lg border p-2 transition"
          :class="selected === i
            ? 'border-primary ring-2 ring-primary/40'
            : 'border-gray-200 hover:border-gray-400 dark:border-gray-700'"
          @click="selected = i"
        >
          <img
            :src="후처리s.get(url)?.미리url ?? url"
            :alt="prompt"
            class="w-[200px] rounded-md object-cover"
            :class="후처리 ? '바둑판' : ''"
            :style="{ aspectRatio: css비율 }"
            loading="lazy"
          >
          <div
            v-if="후처리"
            class="flex items-center gap-1 text-xs"
          >
            <template v-if="처리중s.has(url)">
              <UIcon
                name="i-lucide-loader-circle"
                class="size-3.5 animate-spin text-dimmed"
              />
              <span class="text-muted">배경 지우는 중…</span>
            </template>
            <template v-else-if="후처리s.get(url)">
              <UIcon
                name="i-lucide-check"
                class="size-3.5 text-success"
              />
              <span class="text-muted">배경 지움</span>
            </template>
            <template v-else>
              <UIcon
                name="i-lucide-triangle-alert"
                class="size-3.5 text-warning"
              />
              <span class="text-warning">배경 못 지움</span>
            </template>
          </div>
        </button>
      </div>
    </div>

    <div class="mt-2 flex flex-row items-center gap-2">
      <div class="grow" />
      <mButton
        size="lg"
        :역할="urls.length ? '조용' : '강조'"
        :icon="urls.length ? 'i-lucide-refresh-cw' : 'i-lucide-sparkles'"
        :disabled="isLoading || 저장중"
        :label="생성라벨"
        @click="생성"
      >
        {{ 생성라벨 }}
      </mButton>
      <mButton
        size="xl"
        class="px-3"
        :ing="저장중"
        :disabled="isLoading || 후처리중 || 저장중 || selected === null"
        :label="confirmLabel"
        @click="submit"
      >
        {{ confirmLabel }}
      </mButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { USeparator } from '#components'
import { computed, onUnmounted, ref } from 'vue'
import { do이미지저장 } from '~utils'

/**
 * AI가 만든 이미지 후보를 나란히 보여주고 하나를 고르게 한다.
 *
 * **어떤 그림인지는 모른다.** 피사체(`prompt`)와 촬영 규칙(`stylePrompt`), 그리고 뽑은 뒤에
 * 무슨 손질을 하는지(`후처리`)까지 호출한 모델이 소유해서 넘겨준다 — 증명사진은 model캐릭터가,
 * 포스터는 model행사가. 그래야 도메인이 늘어도 이 모달과 gen_img를 안 건드린다.
 */
interface Props {
  title?: string
  /** 피사체 묘사 */
  prompt: string
  /** 호출한 모델이 소유한 촬영·화풍 지시문 */
  stylePrompt?: string
  aspectRatio?: string
  개수?: number
  confirmLabel?: string
  /**
   * 저장 폴더 (`uploads/ai/<dir>`). 생성물과 손질본이 같이 여기로 들어간다.
   * `stylePrompt` 를 주는 쪽은 이것도 준다 — 지시문 경로에서는 서버가 용도를 모른다.
   */
  dir?: string
  /**
   * 후보 한 장을 손질해 **바이트로** 돌려준다 (증명사진의 초록 배경 키잉 등).
   * 손질할 수 없는 장이면 `null` — 그 장은 원본 그대로 보여주고 그대로 확정된다.
   */
  후처리?: (url: string) => Promise<Blob | null>
  onConfirm: (url: string | null) => void
}

const props = withDefaults(defineProps<Props>(), {
  title: 'AI 이미지 고르기',
  stylePrompt: '',
  aspectRatio: '1:1',
  개수: 2,
  confirmLabel: '이 사진 사용',
  dir: 'ai',
  후처리: undefined
})

const urls = ref<string[]>([])
const isLoading = ref(false)
const errorMessage = ref('')
const selected = ref<number | null>(null)

/**
 * 손질에 성공한 후보만 담는다 (원본 링크 → 바이트 + 미리보기 링크).
 * **여기 없다는 건 손질에 실패했다는 뜻**이라, 화면이 그걸 그대로 배지로 읽는다.
 *
 * `다시 생성`이 이전 후보를 앞에 쌓으므로 배열 인덱스가 아니라 원본 링크로 물린다.
 */
const 후처리s = ref(new Map<string, { blob: Blob, 미리url: string }>())

/** 아직 손질을 기다리는 후보. 이전 배치의 후보가 같이 "지우는 중"으로 보이지 않게 장별로 센다 */
const 처리중s = ref(new Set<string>())
const 후처리중 = computed(() => 처리중s.value.size > 0)
const 저장중 = ref(false)

const css비율 = computed(() => props.aspectRatio.replace(':', ' / '))

const 생성라벨 = computed(() => (urls.value.length ? '다시 생성' : '생성'))

/**
 * **열자마자 뽑지 않는다.** 예전엔 `onMounted(생성)`이 있어서 창을 열었다 그냥 닫아도
 * `개수`장이 과금됐다 — 잘못 눌러도, 다른 필드를 보려다 열어도 돈이 나갔다.
 * 이미지는 장당 단가가 텍스트와 비교가 안 되므로 첫 생성도 사람이 누르게 둔다.
 */
const 생성 = async () => {
  isLoading.value = true
  errorMessage.value = ''
  selected.value = null
  try {
    const res = await $fetch<{ urls?: string[], url?: string }>('/api-etc/ai/gen_img', {
      method: 'POST',
      body: {
        prompt: props.prompt,
        stylePrompt: props.stylePrompt || undefined,
        aspectRatio: props.aspectRatio,
        count: props.개수,
        dir: props.dir
      }
    })
    const list = res?.urls?.length ? res.urls : res?.url ? [res.url] : []
    if (list.length === 0) throw new Error('생성 결과 URL이 없습니다.')
    // 최신 결과를 앞에 쌓아 이전 생성물과 비교해서 고를 수 있게 한다
    urls.value = [...list, ...urls.value]
    selected.value = 0
    // 손질은 그리드를 띄워 놓고 장별로 진행한다 — 스피너 뒤에서 하면 장별 배지가 보일 틈이 없다
    isLoading.value = false
    await 손질(list)
  } catch (error: any) {
    errorMessage.value
      = error?.data?.message || error?.statusMessage || error?.message || '이미지 생성 중 오류가 발생했습니다.'
  } finally {
    isLoading.value = false
  }
}

/**
 * 새로 뽑힌 후보를 전부 손질해 **보이는 것과 확정되는 것을 같게** 만든다.
 *
 * 손질은 브라우저 안에서 끝나고(canvas) 아무것도 올리지 않는다. 그래서 후보가 몇 장이든
 * 서버에 남는 파일은 늘지 않고, 대신 누끼가 망가진 장을 확정 전에 눈으로 걸러낼 수 있다.
 * 손질 자체가 실패해도 흐름을 세우지 않는다 — 그 장은 원본으로 남고 배지가 그렇다고 말한다.
 */
const 손질 = async (list: string[]) => {
  if (!props.후처리) return
  list.forEach(url => 처리중s.value.add(url))
  for (const url of list) {
    try {
      const blob = await props.후처리(url)
      if (blob) 후처리s.value.set(url, { blob, 미리url: URL.createObjectURL(blob) })
    } catch (e) {
      // 한 장이 망가져도 생성 자체를 실패로 돌리지 않는다 — 그 장만 원본으로 남으면 된다
      console.error('[이미지후보] 손질 실패 — 원본을 그대로 씁니다', e)
    } finally {
      처리중s.value.delete(url)
    }
  }
}

/**
 * 고른 한 장만 올린다. 손질된 장이면 그 바이트를, 아니면 원본 링크를 그대로 돌려준다.
 * 업로드가 실패해도 원본으로 물러난다 — 방금 고른 사진을 여기서 잃는 것이 제일 나쁘다.
 */
const submit = async () => {
  const i = selected.value
  if (i === null) return props.onConfirm(null)

  const url = urls.value[i] ?? null
  const 손질됨 = url ? 후처리s.value.get(url) : undefined
  if (!url || !손질됨) return props.onConfirm(url)

  저장중.value = true
  try {
    const 새url = await do이미지저장(손질됨.blob, props.dir)
    props.onConfirm(새url ?? url)
  } catch (e) {
    console.error('[이미지후보] 저장 실패 — 원본을 그대로 씁니다', e)
    props.onConfirm(url)
  } finally {
    저장중.value = false
  }
}

// blob 링크는 문서가 들고 있는 한 메모리에 남는다. 창이 닫히면 같이 놓아준다
onUnmounted(() => {
  후처리s.value.forEach(v => URL.revokeObjectURL(v.미리url))
  후처리s.value.clear()
})
</script>

<style scoped>
/** 투명 PNG를 흰 모달 위에 그냥 얹으면 "잘 지워진 것"과 "원래 흰 배경"이 똑같이 보인다 */
.바둑판 {
  background-image:
    linear-gradient(45deg, rgb(0 0 0 / 8%) 25%, transparent 25%, transparent 75%, rgb(0 0 0 / 8%) 75%),
    linear-gradient(45deg, rgb(0 0 0 / 8%) 25%, transparent 25%, transparent 75%, rgb(0 0 0 / 8%) 75%);
  background-position: 0 0, 8px 8px;
  background-size: 16px 16px;
  background-color: rgb(255 255 255 / 60%);
}
</style>

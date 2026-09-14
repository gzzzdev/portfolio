<template>
  <a
    :href="url || undefined"
    target="_blank"
    rel="noopener"
    class="not-prose my-5 flex items-center gap-3 rounded-lg bg-default p-3 ring-1 ring-default m-층-카드 hover:bg-elevated/50"
    :class="{ 'pointer-events-none opacity-60': !url }"
  >
    <UIcon
      name="i-lucide-file-down"
      class="size-6 shrink-0 text-muted"
    />
    <span class="min-w-0 grow">
      <span class="block truncate font-medium text-highlighted">{{ 이름 }}</span>
      <span
        v-if="꼬리"
        class="block truncate text-xs text-muted"
      >{{ 꼬리 }}</span>
    </span>
    <span class="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary">
      <UIcon
        name="i-lucide-download"
        class="size-4"
      />
      받기
    </span>
  </a>
</template>

<script setup lang="ts">
/**
 * `::download` — 본문에서 파일을 받게 하는 한 줄. **어댑터다** (`utils/mdc/blocks.ts` 머리말의 그 어댑터 층).
 *
 * 자료실 게시판이 「본문의 첫 링크」를 받기 버튼으로 뽑아 쓰던 자리를 블록으로 세운 것이다
 * (`useBoardFilter` 의 `boardAttachmentUrl`). 링크는 문장 안에 묻혀 무엇이 받는 파일인지 글이 말해 주지 않았고,
 * 블록이면 목록이 본문을 읽어 「받기」를 세울 수 있다(`~utils` 의 `본문받기s`).
 *
 * 이름이 `file`·`attachment` 가 아니라 `download` 인 건 뜻이 「받는다」라서다. HTML 태그 목록에도 없다
 * (`photo`·`youtube` 가 이름을 바꿔야 했던 그 목록 — `blocks.ts` 의 `못쓰는이름s`).
 *
 * 액자는 `::photo`·`::youtube` 와 같은 층 1(`m-층-카드`)이다 — 글이 아니라 글 위에 얹힌 물건이라서.
 * 주소가 비면 누를 수 없는 채로 선다 — 편집판에서 막 넣은 블록이 그 모양이다.
 */
import { computed } from 'vue'

interface Props {
  /** 받을 파일 주소. 업로드 경로 또는 바깥 주소. */
  url?: string
  /** 보여줄 이름. 안 주면 주소의 파일 이름을 쓴다. */
  title?: string
}
const props = defineProps<Props>()

/** 주소 끝의 파일 이름. 쿼리·조각은 뗀다. */
const 파일이름 = computed(() => {
  const 끝 = (String(props.url ?? '').split(/[?#]/)[0] ?? '').split('/').filter(Boolean).at(-1) ?? ''
  try {
    return decodeURIComponent(끝)
  } catch {
    return 끝
  }
})

const 이름 = computed(() => props.title?.trim() || 파일이름.value || '받을 파일')

/**
 * 이름 아래 흐린 줄 — 제목을 따로 적었으면 파일 이름을, 아니면 주소의 집을 보여준다.
 * 파일 이름은 **확장자가 있을 때만** 파일 이름이다 — `notion.so/product` 같은 자리표시 주소에서 마지막 조각
 * 「product」가 파일 이름인 양 서던 자리(2026-09-14). 그런 주소는 집(host)을 보여준다.
 */
const is파일이름 = computed(() => /\.[a-z0-9]{1,5}$/i.test(파일이름.value))
const 꼬리 = computed(() => {
  if (props.title?.trim() && is파일이름.value && 파일이름.value !== props.title.trim()) return 파일이름.value
  try {
    return props.url ? new URL(props.url).host.replace(/^www\./, '') : ''
  } catch {
    return ''
  }
})
</script>

<template>
  <div
    class="flex flex-row items-center gap-1 mr-5 pl-2"
    :class="!true ? 'pt-2 pb-1' : ''"
  >
    <div
      v-if="is수정 && can수정"
      ref="editableRef"
      contenteditable="true"
      :class="`min-w-[4.5em] border-b border-dashed border-accented outline-none text-${props.size} text-default`"
      @click.stop
      @input="onInput"
      @keydown.enter.prevent="finishEdit"
      @blur="finishEdit"
    />
    <div
      v-else
      :class="`text-${props.size} text-default`"
    >
      {{ label }}{{ !can수정 ? props.suffix : '' }}
    </div>

    <mButton
      v-if="can수정"
      size="sm"
      역할="조용"
      square
      :icon="is수정 ? 'i-lucide-check' : 'i-mingcute:edit-line'"
      :aria-label="is수정 ? '편집 완료' : '편집 시작'"
      @click.stop="toggleEdit"
    />
  </div>
</template>

<script setup lang="ts">
interface Props {
  suffix?: string
  size?: string

  can수정?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: '3xl'
})

const label = defineModel<string | undefined>('label', { default: '' })
const is수정 = ref(false)
const editableRef = ref<HTMLDivElement | null>(null)

const syncEditableText = () => {
  if (!editableRef.value) return
  const nextText = label.value ?? ''
  if (editableRef.value.innerText !== nextText) editableRef.value.innerText = nextText
}

const focusEditableEnd = () => {
  if (!editableRef.value) return
  editableRef.value.focus()

  const selection = window.getSelection()
  if (!selection) return
  const range = document.createRange()
  range.selectNodeContents(editableRef.value)
  range.collapse(false)
  selection.removeAllRanges()
  selection.addRange(range)
}

const onInput = (event: Event) => {
  const target = event.target as HTMLDivElement
  label.value = target.innerText
}

const finishEdit = () => {
  if (!is수정.value) return
  label.value = editableRef.value?.innerText ?? ''
  is수정.value = false
}

const toggleEdit = async () => {
  if (!props.can수정) return

  if (is수정.value) {
    finishEdit()
    return
  }

  is수정.value = true
  await nextTick()
  syncEditableText()
  focusEditableEnd()
}
</script>

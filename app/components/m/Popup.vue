<template>
  <!--
      **텔레포트 목적지가 층을 정한다.** `#__nuxt` 에는 `isolate` 가 걸려 있어 앱 전체가 쌓임 맥락
      하나에 갇힌다 — 그래서 `body` 로 나간 것은 **앱 안의 z 가 얼마든 언제나 위**다(헤더 z-50 도
      진다). Nuxt UI 의 모달도 그 밖(`#teleports`)에 있어서 도크 위에 뜨는 것이고, 그건 맞다.

      **여기 있던 `is화면` 은 없앴다 — 그건 모달이 아니었다.**
      좁은 화면의 상세가 이 팝업으로 열리던 시절이 있었다. 그러다 보니 이 컴포넌트 하나가
      목적지·z층·자리·모양·스크림·바깥클릭·히스토리 **일곱 가지**를 불리언 하나로 뒤집고 있었고,
      공유하는 건 `v-if` 와 esc 정도였다. 그건 변형이 아니라 다른 물건이다.
      상세는 셸 안으로 돌아가 `mBox반응형` 의 트랙에서 옆으로 밀린다 — 덮지 않으므로 층이 없고,
      자리를 계산하지 않으므로 `--ui-layout-header-offset`·`--dock-inset-bottom` 도 안 읽는다.
      **다시 이 파일로 끌어오지 말 것.** 끌어오는 순간 그 일곱이 같이 따라온다.
    -->
  <Teleport to="body">
    <div
      v-if="isPopup"
      class="fixed left-0 top-0 w-full h-full z-30 backdrop-blur-md bg-neutral-900/30"
      @keydown.esc="() => isPopup = false"
    >
      <div
        class="absolute top-0 left-0 w-full h-full"
        @click.stop="closePopup"
      />
      <div
        ref="el"
        class="absolute z-31 w-full max-w-120 px-1 min-w-50 min-h-30 top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2"
        @click="() => { }"
      >
        <slot />
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { onClickOutside } from '@vueuse/core'

const el = useTemplateRef<HTMLElement>('el')

const isPopup = defineModel<boolean>({ default: false })

// 팝업 후 뒤 div스크롤 방지.
watch(isPopup, (val) => {
  if (val) {
    document.body.style.overflow = 'hidden'
    // iOS Safari 대응: 터치 시 튕김 방지
    document.body.style.position = 'fixed'
    document.body.style.width = '100%'
  } else {
    document.body.style.overflow = ''
    document.body.style.position = ''
    document.body.style.width = ''
  }
})

/**
 * Android 뒤로가기 버튼 처리.
 *
 * 같은 URL 로 가짜 항목을 하나 밀어 두고 뒤로가기를 받아 닫는다. **열고 닫는 것이 주소에 안 사는**
 * 모달에는 이 방법뿐이다. 반대로 여닫힘이 주소에 사는 것(목록의 상세 — `?id=`)에 이걸 쓰면
 * 선택 한 번에 항목이 둘 쌓이므로, 그런 것은 애초에 이 컴포넌트를 쓰면 안 된다.
 */
let historyStateAdded = false

const closePopup = () => {
  isPopup.value = false
  if (historyStateAdded) {
    // history state를 제거하되 실제 뒤로가기는 하지 않음
    history.go(-1)
    historyStateAdded = false
  }
}

const handlePopstate = () => {
  if (isPopup.value && historyStateAdded) {
    isPopup.value = false
    historyStateAdded = false
  }
}

watch(isPopup, (newValue) => {
  if (newValue && !historyStateAdded) {
    // 팝업이 열릴 때 history state 추가
    history.pushState({ popup: true }, '', location.href)
    historyStateAdded = true
    window.addEventListener('popstate', handlePopstate, { passive: true })
  } else if (!newValue && historyStateAdded) {
    // 팝업이 닫힐 때 이벤트 리스너 제거
    window.removeEventListener('popstate', handlePopstate)
    historyStateAdded = false
  }
})

onUnmounted(() => {
  window.removeEventListener('popstate', handlePopstate)
})
</script>

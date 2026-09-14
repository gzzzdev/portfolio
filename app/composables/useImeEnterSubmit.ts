/**
 * 한글 입력에서 엔터를 두 번 쳐야 전송되는 문제를 없앤다.
 *
 * Nuxt UI 의 UChatPrompt 는 useIMEGuard 를 써서 조합 중(isComposing / keyCode 229)에 들어온
 * 엔터를 그냥 버리고, 조합이 끝난 뒤 50ms 도 마저 버린다. 마지막 음절이 조합 중인 채로 엔터를
 * 치는 한글에서는 첫 엔터가 조합을 확정만 하고 사라져서 늘 두 번을 쳐야 한다.
 *
 * 여기서는 버리는 대신 **미뤄서** 보낸다. 조합 중 엔터가 오면 표시만 해두고,
 * 이어서 오는 compositionend 뒤에 전송한다. 마지막 음절이 v-model 에 반영되고 나서
 * 보내야 하므로 nextTick 을 한 번 거친다.
 *
 * 쓰는 쪽은 UChatPrompt 에 :submit-on-enter="false" 를 같이 줘야 한다.
 * (그래야 컴포넌트 내부 가드가 비켜서고, 두 핸들러가 겹쳐 두 번 전송되지 않는다.)
 */
export const useImeEnterSubmit = (onSubmit: () => void) => {
  /** 조합 중에 들어와서 아직 처리하지 못한 엔터가 있는지 */
  let 보류중 = false

  const onKeydown = (event: KeyboardEvent) => {
    if (event.key !== 'Enter') {
      보류중 = false
      return
    }
    // Shift/Ctrl/Meta/Alt + 엔터는 줄바꿈. 브라우저 기본 동작에 맡긴다.
    if (event.shiftKey || event.ctrlKey || event.metaKey || event.altKey) return

    if (event.isComposing || event.keyCode === 229) {
      // 이 엔터는 IME 가 조합을 확정하는 데 쓴다. preventDefault 해도 IME 가 먼저 먹으므로
      // 손대지 않고, 곧 이어질 compositionend 에서 전송한다.
      보류중 = true
      return
    }

    event.preventDefault()
    onSubmit()
  }

  const onCompositionEnd = () => {
    if (!보류중) return
    보류중 = false
    // 이 시점엔 v-model 이 아직 마지막 음절을 못 받았을 수 있다.
    void nextTick(() => onSubmit())
  }

  return { onKeydown, onCompositionEnd }
}

type KeysType = 'save' | 'esc' | 'other'
export const useKeysShortcut = (type: KeysType, onAction: () => void) => {
  const handleKeydown = (event: KeyboardEvent) => {
    // 1. Ctrl(Win) 또는 Meta(Mac) + S 키 조합 확인

    const _condition = {
      save: (event: KeyboardEvent) => (event.ctrlKey || event.metaKey) && event.key === 's',
      esc: (event: KeyboardEvent) => event.key === 'Escape',
      other: (event: KeyboardEvent) => true
    }[type]

    const isKeydone = _condition(event)

    if (isKeydone) {
      // 2. 브라우저 기본 저장 창 방지 (중요!)
      event.preventDefault()

      // 3. 전달받은 콜백 함수 실행
      onAction()
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeydown)
  })

  onUnmounted(() => {
    // 메모리 누수 방지를 위한 이벤트 해제
    window.removeEventListener('keydown', handleKeydown)
  })
}

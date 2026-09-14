import { useClipboard } from '@vueuse/core'

export const useEasys = () => {
  const 복사 = async (text: string, showMsg = true) => {
    await useClipboard().copy(text)
    if (showMsg)
      useAlert().show(`복사됨 : ${text}`)
  }

  return {
    복사
  }
}

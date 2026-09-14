import { useSound } from '@vueuse/sound'

export const useSfx = () => {
  const tap = useSound('sounds/tab2.wav', { volume: 0.1 })

  return { tap }
}

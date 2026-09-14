import { defineComponent, h } from 'vue'
import MPayments from '../../components/m/Payments.vue'
import ModalWrapper from '../useModal/modalWrapper.vue'
import { splitOverlayAttrsForModal } from '../useModal/index'

export type UsePaymentsOpenArgs = {
  title?: string
  description?: string
  orderName: string
  customerName: string
  customerEmail: string
  amount: number
  couponDiscount?: number
  successUrl: string
  failUrl: string
  /** 닫기(X) 또는 `modal.close()` 직전에 한 번 호출 */
  onClose?: () => void
  readyOrderId?: string
}

/**
 * `useModal` / `ModalWrapper`와 동일하게 `useOverlay`에 얹어 결제 UI를 모달로 연다.
 */
export const usePayments = () => {
  const overlay = useOverlay()

  const modal = overlay.create(
    defineComponent({
      inheritAttrs: false,
      setup(_, { attrs }) {
        return () => {
          const raw = attrs as Record<string, any>
          const { shell, content } = splitOverlayAttrsForModal(raw)
          return h(
            ModalWrapper,
            {
              // `open` / `onUpdate:open` / `onAfter:leave` 가 여기 실려 온다.
              // 마지막 것이 없으면 `destroyOnClose` 가 영영 일하지 않는다 (useModal/index.ts 머리말)
              ...shell,
              scrollable: true,
              ui: { content: 'z-31 w-full max-w-3xl' }
            },
            {
              default: () =>
                h('div', { class: 'max-h-[85vh] overflow-y-auto' }, [h(MPayments, content)])
            }
          )
        }
      }
    }),
    { destroyOnClose: true }
  )

  const open = async (options: UsePaymentsOpenArgs) => {
    const { onClose: userOnClose, ...rest } = options
    return modal.open({
      ...rest,
      onClose: () => {
        userOnClose?.()
        modal.close()
      }
    })
  }

  return {
    open,
    close: modal.close,
    patch: modal.patch
  }
}

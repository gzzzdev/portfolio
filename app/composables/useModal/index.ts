import type { Component } from 'vue'
import ModalWrapper from './modalWrapper.vue'

import modal입력 from './modal입력.vue'
import modal필드폼 from './modal필드폼.vue'
import modal순서정렬 from './modal순서정렬.vue'
import modal렌더 from './modal렌더.vue'
import modal이미지후보 from './modal이미지후보.vue'
import modal확인 from './modal확인.vue'

import type { UseModalFieldsOpenOptions } from './modal필드폼.types'
import type { ModalConfirmChoice, UseModalConfirmOpenOptions } from './modal확인.types'
import type { i아이템s, i폴더s } from '@/components/m/Sortable/1/index.vue'
import type { RenderItem } from '~/components/view/렌더/renderComps'

/**
 * Overlay가 루트에 싣는 것들 중 **껍데기(`ModalWrapper` → `UModal`)의 몫**을 갈라낸다.
 * 나머지는 본문 컴포넌트로 간다.
 *
 * 닫힘 신호가 여기 끼어 있는 게 중요하다. `useOverlay`는 앱에 하나뿐인 배열이고, 거기서
 * 항목이 빠지는 길은 `@after:leave → unmount()` 하나뿐이다(`OverlayProvider.vue`).
 * 껍데기가 `inheritAttrs: false`로 폴스루를 막아 놓고 이 핸들러를 안 내려보내면 배열은
 * 영영 안 줄어든다.
 *
 * **키가 `onAfterLeave`가 아니라 `onAfter:leave`다.** 이벤트 이름에 콜론이 있으면 Vue는
 * 첫 글자만 올려 `onAfter:leave`로 만든다. 낙타등으로 짐작해 적으면 `undefined`를 얌전히
 * 넘기고 아무 일도 안 일어난다 — 눈에 보이는 증상이 없어서, 배열이 쌓이는 걸 세어 보기
 * 전에는 고쳤다고 믿게 된다. 실제로 그렇게 한 번 틀렸다.
 */
export function splitOverlayAttrsForModal(attrs: Record<string, any>) {
  const content = { ...attrs }
  const shell: Record<string, any> = {
    'open': content.open as boolean | undefined,
    'onUpdate:open': content['onUpdate:open'] as ((v: boolean) => void) | undefined,
    'onAfter:leave': content['onAfter:leave'] as (() => void) | undefined
  }
  delete content.open
  delete content['onUpdate:open']
  delete content['onAfter:leave']
  return { shell, content }
}

/** 컴포저블이 돌려주는 것. 고른 값 아니면 `null`(모달만 닫음) */
export type ModalOpener<열기옵션, 결과> = {
  open: (옵션: 열기옵션) => Promise<결과 | null>
  close: () => void
}

type ModalOpenerSpec<열기옵션> = {
  /** 열기 옵션 → 본문 컴포넌트 props. `onConfirm`은 틀이 붙이므로 여기서 만들지 않는다 */
  props: (옵션: 열기옵션) => Record<string, any>
  /**
   * 본문 props를 보고 `UModal` 쪽에 얹을 것을 정한다 (모달 폭 등).
   * 넘겨받은 객체에서 껍데기 전용 값을 지워도 된다 — 그대로 본문에 가는 객체다.
   */
  shell?: (본문props: Record<string, any>) => Record<string, any>
}

/**
 * 모달 컴포저블을 찍어내는 틀.
 *
 * 일곱 자리가 같은 스무 줄을 되풀이하고 있었다 — 껍데기 컴포넌트를 짓고, overlay에 올리고,
 * 열고, `undefined`를 `null`로 고쳐 돌려주고. 되풀이보다 나빴던 건 **되풀이가 조금씩 어긋나
 * 있었다는 것**이다. `after:leave`를 흘리는 것과 폴스루로 우연히 넘기는 것이 섞여 있었고,
 * `destroyOnClose`는 아무도 안 걸었다. 코드를 봐도 어느 쪽인지 알 수 없었다.
 *
 * 그래서 `useModalRender().open()`처럼 **누를 때마다 컴포저블을 새로 부르는** 자리에서는
 * 클릭 수만큼 닫힌 모달이 전역 배열에 쌓였다. 둘 다 여기서 한 번만 정한다.
 */
function createModalOpener<열기옵션, 결과>(본문: Component, spec: ModalOpenerSpec<열기옵션>) {
  return (): ModalOpener<열기옵션, 결과> => {
    const overlay = useOverlay()

    const wrapped = defineComponent({
      inheritAttrs: false,
      setup(_, { attrs }) {
        return () => {
          const { shell, content } = splitOverlayAttrsForModal(attrs as Record<string, any>)
          return h(ModalWrapper, { ...shell, ...(spec.shell?.(content) ?? {}) }, {
            default: () => h(본문, content)
          })
        }
      }
    })

    /** 지금 떠 있는 것. 밖에서 부르는 `close()`가 겨눌 곳 */
    let 현재: { close: (v?: any) => void } | null = null

    /**
     * **열 때마다 새로 만든다.** `destroyOnClose`가 닫힌 뒤 항목을 배열에서 빼므로, 하나를
     * 만들어 두고 두 번째로 열면 `getOverlay`가 'Overlay not found'로 죽는다. 한 번 만들어
     * 여러 번 여는 자리(`const 확인창 = useModalConfirm()` 를 setup 에 두는 꼴)가 실제로 있다.
     */
    const open = async (옵션: 열기옵션): Promise<결과 | null> => {
      const modal = overlay.create(wrapped, { destroyOnClose: true })
      현재 = modal

      const instance = modal.open({
        ...spec.props(옵션),
        onConfirm: (v: 결과) => {
          modal.close(v)
        }
      })
      const raw = await instance.result
      if (현재 === modal) 현재 = null
      if (raw === undefined) return null
      return (raw as 결과 | null) ?? null
    }

    return {
      open,
      /** 밖에서 닫는 길. 떠 있는 게 없으면 이미 이룬 일이다 */
      close: () => 현재?.close(null)
    }
  }
}

// async function open()

// export const useModal = () => {
//     const count = ref(0)

//     // const toast = useToast()
//     const overlay = useOverlay()

//     const modal = overlay.create(LazyModalExample)
//     const open = async () => {
//         const instance = modal.open({
//             count: count.value
//         })

//         const shouldIncrement = await instance.result

//         if (shouldIncrement) {
//             count.value++

//             // toast.add({
//             //     title: `Success: ${shouldIncrement}`,
//             //     color: 'success',
//             //     id: 'modal-success'
//             // })

//             // Update the count
//             modal.patch({
//                 count: count.value
//             })
//             return
//         }
//     };
//     return {
//         open
//     }
// }

export const useModal = (comp: any, attrs?: any) => {
  const overlay = useOverlay()

  const wrapped = defineComponent({
    setup() {
      return () => h(ModalWrapper, null, {
        default: () => h(comp, { ...attrs })
      })
    }
  })

  const modal = overlay.create(wrapped)

  const open = async (props?: any) => {
    const instance = modal.open(props || {})
  }
  return {
    open,
    close: modal.close
  }
}

export type {
  ModalFieldStep,
  ModalFieldStepInput,
  ModalFieldStepSelect,
  ModalFieldsWholeRandom,
  UseModalFieldsOpenOptions
} from './modal필드폼.types'

export type { ModalConfirmChoice, UseModalConfirmOpenOptions } from './modal확인.types'

export type useModalDragDropOpenOptions = {
  items: i아이템s
  folders: i폴더s
  is계층?: boolean
  title?: string
  description?: string
  confirmLabel?: string
  actions?: { label: string, icon: string, onClick: () => void }[]
}

export type useModalDragDropResult = {
  items: i아이템s
  folders: i폴더s
}

export type UseModalInputOpenOptions = {
  /** 큰 제목 (없으면 `message`만 상단에 표시) */
  title?: string
  /** 안내 문구 (`window.prompt` 첫 인자) */
  message?: string
  /** 초기값 (`window.prompt` 두 번째 인자) */
  defaultValue?: string
  placeholder?: string
  confirmLabel?: string
  /** 확인 시 문자열 앞뒤 공백 제거 */
  trim?: boolean
}

function normalizeModalInputOpenArgs(
  messageOrOptions?: string | UseModalInputOpenOptions,
  defaultValueArg?: string
): UseModalInputOpenOptions {
  if (typeof messageOrOptions === 'string')
    return { message: messageOrOptions, defaultValue: defaultValueArg ?? '' }
  return {
    ...(messageOrOptions ?? {}),
    defaultValue: messageOrOptions?.defaultValue ?? defaultValueArg ?? ''
  }
}

const 입력열기 = createModalOpener<UseModalInputOpenOptions, string>(modal입력, {
  props: opts => ({
    title: opts.title,
    message: opts.message,
    defaultValue: opts.defaultValue ?? '',
    placeholder: opts.placeholder,
    confirmLabel: opts.confirmLabel,
    trim: opts.trim
  })
})

/**
 * `window.prompt`와 같이 문자열을 입력받고, 확인이면 값·모달만 닫으면 `null`을 돌려준다.
 *
 * 옛 `prompt(말, 초기값)` 꼴로도 부를 수 있어서 열기 인자만 손으로 고른다.
 */
export const useModalInput = () => {
  const { open, close } = 입력열기()
  return {
    open: (
      messageOrOptions?: string | UseModalInputOpenOptions,
      defaultValueArg?: string
    ): Promise<string | null> => open(normalizeModalInputOpenArgs(messageOrOptions, defaultValueArg)),
    close
  }
}

const 확인기본갈래: ModalConfirmChoice[] = [
  { key: 'confirm', label: '확인', 역할: '강조' }
]

/**
 * `window.confirm`의 자리인데 **버튼 수가 자유롭다**. 고른 버튼의 `key`를 돌려주고,
 * 그냥 닫으면(ESC · 바깥 클릭 · X) `null`.
 *
 * 갈래가 셋 이상인 물음이 있어서 만들었다 — "저장할까요?"는 예/아니오로 갈리지 않는다.
 * 저장하고 진행 · 저장 없이 진행 · 그만두기가 다 다른 일이라, 둘로 접으면 취소 버튼이
 * "버린다"와 "그만둔다" 중 무엇인지 사람이 알 수 없다.
 */
export const useModalConfirm = createModalOpener<UseModalConfirmOpenOptions, string>(modal확인, {
  props: opts => ({
    title: opts.title,
    message: opts.message,
    choices: opts.choices?.length ? opts.choices : 확인기본갈래
  })
})

/** 단일 셀렉트 — `modal필드폼` 한 스텝으로 동일 동작 */
export const useModalSelect = (
  items: any[],
  onSelect: Function,
  config: { title?: string, description?: string } = {}
) => {
  const fields = useModalFields()
  return {
    open: async () => {
      const r = await fields.open({
        steps: [{ key: 'value', kind: 'select', items, initialValue: null, required: true }],
        title: config.title,
        description: config.description,
        confirmLabel: '선택'
      })
      if (r) onSelect(r.value)
    },
    close: fields.close
  }
}

export const useModal2 = (comp: any, attrs?: any) => {
  const overlay = useOverlay()

  const wrapped = defineComponent({
    setup() {
      return () => h(ModalWrapper, null, {
        default: () => h(comp, { ...attrs })
      })
    }
  })

  const modal = overlay.create(wrapped)

  const open = async (props?: any) => {
    return modal.open(props || {})
  }

  return {
    open,
    close: modal.close
  }
}

/**
 * 상세 `표시필드s`처럼 `select` / `input` 스텝을 배열로 넘기고, 한 모달에서 순서대로 받는다.
 * 조합이 늘어날 때마다 composable을 추가하지 않고 이쪽으로 모은다.
 */
export const useModalFields = createModalOpener<UseModalFieldsOpenOptions, Record<string, any>>(
  modal필드폼,
  {
    props: opts => ({
      steps: opts.steps,
      title: opts.title,
      description: opts.description,
      confirmLabel: opts.confirmLabel,
      wholeRandom: opts.wholeRandom
    })
  }
)

export type UseModalRenderOpenOptions = {
  modelValue: RenderItem
  title?: string
  filename?: string
  description?: string
  confirmLabel?: string
  /** portrait(기본)=좁은 모달, landscape=가로 증서용 넓은 모달 */
  orientation?: 'portrait' | 'landscape'
  /** PNG 저장 시 이 폭으로 다시 그려 캡처한다 (300dpi 인쇄용) */
  printBuild?: (폭: number) => RenderItem
  printWidth?: number
}

/** `View렌더`로 RenderItem을 모달에 표시한다. 확인이면 `true`, 모달만 닫으면 `null`. */
export const useModalRender = createModalOpener<UseModalRenderOpenOptions, true>(modal렌더, {
  props: opts => ({
    modelValue: opts.modelValue,
    title: opts.title,
    filename: opts.filename,
    description: opts.description,
    confirmLabel: opts.confirmLabel,
    orientation: opts.orientation,
    printBuild: opts.printBuild,
    printWidth: opts.printWidth
  }),
  shell: (content) => {
    const orientation = content.orientation === 'landscape' ? 'landscape' : 'portrait'
    delete content.orientation

    // portrait: Nuxt UI 기본 max-w-lg 유지 / landscape: 뷰포트에 맞춰 넓힘
    return {
      ui: {
        content:
          orientation === 'landscape'
            ? 'z-31 w-[calc(100vw-2rem)] max-w-[min(96vw,56rem)] !bg-transparent !shadow-none !ring-0'
            : 'z-31 !bg-transparent !shadow-none !ring-0'
      }
    }
  }
})

/** `mSortable1`로 items/folders 순서를 바꾸고, 확인이면 결과·모달만 닫으면 `null`을 돌려준다. */
export const useModalDragDrop = createModalOpener<useModalDragDropOpenOptions, useModalDragDropResult>(
  modal순서정렬,
  {
    props: opts => ({
      items: opts.items,
      folders: opts.folders,
      is계층: true,
      is수정중: true,
      title: opts.title,
      description: opts.description,
      confirmLabel: opts.confirmLabel,
      actions: opts.actions
    })
  }
)

export type UseModalImageOpenOptions = {
  title?: string
  /** 피사체 묘사. 무엇을 그릴지는 부르는 쪽(모델)이 소유한다 */
  prompt: string
  /** 촬영·화풍 지시문. 주면 서버 프리셋을 타지 않는다 */
  stylePrompt?: string
  aspectRatio?: string
  /** 한 번에 뽑을 후보 장수 */
  개수?: number
  confirmLabel?: string
  /** 저장 폴더 (`uploads/ai/<dir>`). `stylePrompt`를 주는 쪽은 이것도 준다 */
  dir?: string
  /** 후보 한 장을 손질해 바이트로 돌려준다 (증명사진의 초록 배경 키잉 등). 못 하면 `null` */
  후처리?: (url: string) => Promise<Blob | null>
}

/**
 * AI 이미지 후보를 나란히 뽑아 하나를 고른다. 고른 장의 URL, 모달만 닫으면 `null`.
 * (`model캐릭터.do증명사진생성`이 쓰는 자리 — 프롬프트·후처리는 전부 부르는 쪽이 준다)
 */
export const useModalImage = createModalOpener<UseModalImageOpenOptions, string>(modal이미지후보, {
  props: opts => ({
    title: opts.title,
    prompt: opts.prompt,
    stylePrompt: opts.stylePrompt,
    aspectRatio: opts.aspectRatio,
    개수: opts.개수,
    confirmLabel: opts.confirmLabel,
    dir: opts.dir,
    후처리: opts.후처리
  })
})

// export const useSelector = () => {
//     interface Item {
//         label: string,
//         value: string,
//     }

//     const overlay = useOverlay()

//     // const open = async (items:Item[]|string[] =  ['a', 'b', 'c'], onSelect: Function, title: string, description: string) => {
//     //     const UBadge = resolveComponent('UBadge');
//     //     const modal = overlay.create(UBadge); //생성 때 초기값이 배정됨.

//     //     // modal.patch({ items: items, onSelect: onSelect })

//     // }
//     const open = async (items:Item[]|string[] =  ['a', 'b', 'c'], onSelect: Function, title: string, description: string) => {

//         const modal = overlay.create(LazySelector); //생성 때 초기값이 배정됨.

//         const instance = modal.open({ items: items, onSelect: onSelect, title: title, description: description });

//         const result = await instance.result;
//         if (result) {
//             // console.log('shouldIncrement');
//             // console.log(shouldIncrement);
//             modal.patch({ items: {title,description,items}, onSelect: onSelect })
//             return result;
//         }

//     };
//     return {
//         open
//     }
// }

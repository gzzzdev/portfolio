import { useThemeStore } from '~/stores/useThemeStore'

/**
 * AI 그림 생성. 글(`useAI`)의 짝이다 — 한쪽은 `/ai/ask`, 한쪽은 `/ai/gen_img` 로 간다.
 *
 * **프롬프트는 여기 없다.** 무엇을 어떤 결로 그릴지는 부르는 쪽(용도)이 소유한다 —
 * 홈페이지 참고이미지(실사의 렌즈·조리개, 라인아트의 한 줄 획)와 인쇄물 배경(증서 종이의
 * 지질·문양)은 같은 어휘를 쓰지 않고, 한쪽 어휘를 다른 쪽에 끼워 넣으면 둘 다 흐려진다.
 *
 * 그래서 이 훅이 드는 것은 넷뿐이다: 문장을 어디로 보내는가, 오는 동안 무엇이 참인가
 * (`isLoading`), 실패하면 무슨 말이 남는가(`error`), 온 것을 어떻게 쌓는가(`후보s`).
 */

/**
 * 이 파일에서 **바깥으로 나가는 이름은 전부 영문**이다. 취향이 아니라 제약이라 적어 둔다 —
 * 컴포저블 자동 import(unimport)는 소스를 정규식으로 훑어 쓰인 이름을 찾는데, 한글 식별자는
 * 그 단어 경계에 걸리지 않아 **호출문을 찾지 못한다**. 그러면 import 가 안 붙고 화면이
 * `useAI이미지 is not defined` 로 통째로 빈다 (실측). 타입도 같은 이유로 첫 비ASCII 글자에서
 * 잘려 `.nuxt/imports.d.ts` 에 없는 이름이 적힌다.
 *
 * 컴포넌트는 다르다 — 템플릿 컴파일러가 태그를 보고 import 를 심으므로 `m이미지후보s` 는 붙는다.
 * 그래서 한글 이름이 되는 자리와 안 되는 자리가 갈린다. (형제 `useRandPic` 도 같은 자리에 영문)
 */
export interface AIImageItem {
  url: string
  /** 이 후보를 만든 주제 문장. 후보를 다시 볼 때 왜 이 그림인지의 근거다 */
  prompt: string
  /** 서버가 1단계에서 만든 장면 묘사. 지시문 경로(`skipScene`)면 주제와 같다 */
  scene: string
}

export interface AIImageOptions {
  /**
   * 통째로 넘기는 스타일 지시문. 주면 서버 프리셋(실사·라인아트·카드배경)을 타지 않고,
   * 주제를 장면으로 번역하는 1단계도 건너뛴다 — 이미 완성된 묘사라는 뜻이므로.
   */
  stylePrompt?: string
  /** 서버 프리셋 키. `stylePrompt` 가 없을 때만 쓰인다 */
  style?: string
  aspectRatio?: string
  /**
   * 실물 문서의 폭/높이. 주면 서버가 그 비율의 빈 캔버스를 깔고 그리므로 `aspectRatio` 는 무시된다 —
   * 상류의 비율 enum 14개에 없는 규격(A4 = 1:1.414)을 정확히 얻는 유일한 길이다.
   */
  frameRatio?: number
  /**
   * 생성 해상도. 기본(서버) 1K 는 화면용이다 — A4 300dpi 는 2480px 라
   * 종이 질감이 본체인 인쇄물 배경은 1K 로 뽑으면 제일 먼저 뭉갠다.
   */
  imageSize?: '1K' | '2K' | '4K'
  imageLevel?: 'lite' | 'flash' | 'pro'
  /** 한 번에 만들 후보 장수. 여러 장 뽑아 그 중 하나를 고르게 한다 */
  count?: number
  /**
   * 저장 폴더 (`uploads/ai/<dir>`). 안 주면 서버가 프리셋으로 정한다
   * (실사→`ai`, 라인아트→`lineart`, 카드배경→`paper_frame`).
   *
   * **`stylePrompt` 를 주는 쪽은 이것도 줘야 한다.** 그 경로에서 서버는 무슨 그림인지
   * 모르므로(증명사진인지 포스터인지) 폴더를 정할 근거가 없다.
   */
  dir?: string
}

interface AIImageResponse {
  urls?: string[]
  /** 하위 호환 (단일 URL 사용처) */
  url?: string
  scene?: string
}

/**
 * 이만큼 지나면 **아직 뽑는 중이라고 말한다**(ms). 글(`useAI`)의 같은 장치와 한 쌍이다.
 *
 * **그쪽(10초)보다 한참 길게 잡는다.** 글은 3초 안에 오는 것이 정상이라 10초면 이미 이상하지만,
 * 그림은 2K 두 장을 나란히 뽑는 일이라 그 정도는 정상 범위다 — 같은 값을 쓰면 뽑을 때마다
 * 토스트가 떠서 알림이 "이상하다"가 아니라 배경 소음이 된다.
 *
 * **한계(끊기)는 두지 않는다.** 글에는 상류가 물리는 조합이 실제로 있었지만(`useAI` 의
 * `응답한계`) 그림에는 그런 관측이 없고, 정상적으로 얼마나 걸리는지도 아직 재 보지 않았다.
 * 모르는 채로 자르면 **되던 생성이 안 되게** 된다 — 아는 만큼만 한다.
 */
const 느림알림 = 30_000

export default function useAIImage() {
  /** 최신 결과가 앞에 쌓인다 — 이전 생성물과 나란히 놓고 고를 수 있어야 해서다 */
  const 후보s = ref<AIImageItem[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  /** setup 안에서 잡아 둔다 — 타이머 콜백은 이미 그 문맥이 아니다 (`useAI` 와 같은 사정) */
  const 알림 = (() => {
    try {
      return useAlert()
    } catch {
      return null
    }
  })()

  /**
   * 이번에 만든 후보만 돌려준다 (`후보s` 는 누적이라 무엇이 새 것인지 알 수 없다).
   * 실패해도 던지지 않는다 — 부르는 쪽이 매번 try 로 감싸느니 `error` 를 보는 편이 낫다.
   */
  async function 생성(주제: string, 옵션: AIImageOptions = {}): Promise<AIImageItem[]> {
    if (isLoading.value) return []

    const 문장 = 주제.trim()
    if (!문장) {
      error.value = '주제(프롬프트)를 입력해주세요.'
      return []
    }

    error.value = null
    isLoading.value = true

    // 제때 오면 터지지 않는다. 그림은 원래 오래 걸리므로 문구도 "느리다"가 아니라 "하는 중"이다
    const 느림타이머 = setTimeout(() => {
      알림?.show('그림을 아직 뽑는 중입니다', `${느림알림 / 1000}초를 넘겼습니다. 조금만 더 기다려 주세요.`)
    }, 느림알림)

    try {
      // 강조색은 테마의 기본색을 따른다 (mQR 과 같은 관례).
      // 훅 안에서 집는 이유: 호출부마다 집으면 어느 한쪽만 테마를 안 따르는 날이 온다
      const themeStore = useThemeStore()

      const res = await $fetch<AIImageResponse>('/api-etc/ai/gen_img', {
        method: 'POST',
        body: {
          prompt: 문장,
          style: 옵션.style,
          stylePrompt: 옵션.stylePrompt || undefined,
          count: 옵션.count ?? 1,
          accentColor: themeStore.primary || undefined,
          aspectRatio: 옵션.aspectRatio,
          frameRatio: 옵션.frameRatio,
          imageSize: 옵션.imageSize,
          imageLevel: 옵션.imageLevel,
          dir: 옵션.dir
        }
      })

      const urls = res?.urls?.length ? res.urls : res?.url ? [res.url] : []
      if (urls.length === 0) throw new Error('생성 결과 URL이 없습니다.')

      const scene = res?.scene?.trim() ?? ''
      const 새후보s = urls.map(url => ({ url, prompt: 문장, scene }))

      후보s.value = [...새후보s, ...후보s.value]
      return 새후보s
    } catch (err: any) {
      error.value
        = err?.data?.message || err?.statusMessage || err?.message || '이미지 생성 중 오류가 발생했습니다.'
      return []
    } finally {
      clearTimeout(느림타이머)
      isLoading.value = false
    }
  }

  const reset = () => {
    후보s.value = []
    error.value = null
  }

  return { 후보s, isLoading, error, 생성, reset }
}

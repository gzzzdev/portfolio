type AskResponse = string | Record<string, unknown>
type AiModelLevel = 'lite' | 'flash' | 'pro'

/**
 * 응답을 기다리는 한계(ms). **없으면 영영 돈다.**
 *
 * 상류가 정말로 물리는 조합이 있다 — `flash`(gemini-3.6-flash)에 큰 responseSchema 를 물리면
 * 3분을 기다려도 안 돌아왔다 (실측 2026-09-02, `PrintTemplate/AI채우기.ts` 의 레벨 주석).
 * 그때 화면에 남는 것은 도는 스피너뿐이라 사용자는 더 기다려야 하는지 다시 눌러야 하는지
 * 알 길이 없고, 버튼도 잠겨 있어서 할 수 있는 일이 새로고침뿐이다.
 *
 * 끊고 오류로 말하는 편이 낫다 — 다시 누를지는 사람이 정한다. 넉넉히 잡는 이유는
 * 정상 호출이 실제로 느릴 수 있어서다 (`flash` 는 스키마 없이도 4초, 붙으면 10초를 쓴다).
 */
const 응답한계 = 90_000

/**
 * 이만큼 지나면 **아직 하는 중이라고 말한다**(ms).
 *
 * 한계를 줄이는 것과는 다른 일이다. 90초는 "이보다 오래면 고장"이라는 선이고, 이 값은
 * "여기부터는 잠자코 있으면 안 된다"는 선이다 — 실측이 전부 3초 안쪽이라(`AI채우기.ts` 의 표)
 * 10초를 넘겼다는 건 이미 평소와 다르다는 뜻이고, 그때 화면에 도는 스피너 하나만 있으면
 * 사람은 기다려야 할지 다시 눌러야 할지 모른 채 그냥 새로고침한다.
 *
 * 그래서 **한계까지 얼마인지도 같이 말한다.** "느립니다"만 알리면 할 수 있는 일이 없고,
 * "최대 90초"까지 알려야 기다릴지 말지를 사람이 정한다.
 */
const 느림알림 = 10_000

export default function useAI() {
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  /**
     * 여기서 잡아 둔다 — `useToast` 는 setup 안에서 불려야 하는데, 아래 알림은 타이머
     * 콜백에서 뜨므로 그때는 이미 그 문맥이 아니다.
     *
     * try 로 감싸는 이유: 이 컴포저블을 setup 밖(모델 메서드 안)에서 부르는 곳이 있다
     * (`model일정.ts`). 거기서는 토스트를 못 띄우는 게 맞지만, 그것 때문에 AI 호출 자체가
     * 죽어서는 안 된다 — 알림은 곁다리고 답을 받아오는 것이 본 일이다.
     */
  const 알림 = (() => {
    try {
      return useAlert()
    } catch {
      return null
    }
  })()

  const _ask = async (
    contents: string,
    schema?: unknown,
    level: AiModelLevel = 'lite'
  ): Promise<AskResponse> => {
    const trimmedContents = contents.trim()
    if (!trimmedContents) {
      throw new Error('contents is required')
    }

    isLoading.value = true
    error.value = null

    // 제때 오면 이 타이머는 터지지 않는다 — 평소에는 아무 말도 안 하는 것이 옳다
    const 느림타이머 = setTimeout(() => {
      알림?.show(
        'AI가 아직 답하는 중입니다',
        `${느림알림 / 1000}초를 넘겼습니다. 최대 ${응답한계 / 1000}초까지 기다립니다.`
      )
    }, 느림알림)

    try {
      const response = await $fetch<AskResponse | { error: string }>('/api-etc/ai/ask', {
        method: 'POST',
        body: {
          contents: trimmedContents,
          schema,
          level
        },
        timeout: 응답한계
      })

      if (typeof response === 'object' && response !== null && 'error' in response) {
        const errorMessage = typeof response.error === 'string' ? response.error : 'AI request failed'
        throw new Error(errorMessage)
      }

      return response
    } catch (err) {
      // 시간이 다 돼 끊은 것과 상류가 거절한 것은 사람이 할 일이 다르다 —
      // 앞은 다시 누르는 것이고, 뒤는 대개 프롬프트나 키 쪽이다. 그래서 말을 나눈다.
      //
      // **`err.name` 만 보면 못 잡는다.** ofetch 는 시간이 다 되면 `TimeoutError` 로 abort 하지만,
      // 밖으로 던지는 것은 그것을 `cause` 에 담은 `FetchError` 다 (`createFetchError`).
      // 그래서 원인 쪽 이름을 본다.
      const cause = err instanceof Error ? (err.cause as Error | undefined) : undefined
      const isTimeout = [err, cause].some(
        e => e instanceof Error && (e.name === 'TimeoutError' || e.name === 'AbortError')
      )
      const message = isTimeout
        ? `응답이 ${응답한계 / 1000}초를 넘겨 끊었습니다. 다시 시도해 주세요.`
        : err instanceof Error ? err.message : 'AI request failed'
      error.value = message
      throw err
    } finally {
      clearTimeout(느림타이머)
      isLoading.value = false
    }
  }

  const ask = {
    lite: (contents: string, schema?: unknown) => _ask(contents, schema, 'lite'),
    flash: (contents: string, schema?: unknown) => _ask(contents, schema, 'flash'),
    pro: (contents: string, schema?: unknown) => _ask(contents, schema, 'pro')
  }

  const reset = () => {
    error.value = null
  }

  return {
    ask,
    error,
    isLoading,
    reset
  }
}

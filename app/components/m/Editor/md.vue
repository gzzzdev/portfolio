<template>
  <div class="w-full">
    <ClientOnly>
      <mEditor
        v-model="문서"
        :readonly="readonly"
      />
      <!--
        **자리를 잡는 것이라 액자가 편집기와 같아야 한다.** 여기만 손으로 `rounded-lg border` 를
        적고 있었고 정작 안에 들어설 편집기에는 액자가 없어서, 다 불러오면 액자가 사라졌다.
        같은 파일 안 다섯 줄 차이로 어긋나 있던 것이고, **손이 저절로 테두리를 적었다는 것 자체가
        본문이 입력칸으로 보여야 한다는 증거**였다. 이제 둘 다 `본문틀` 에서 난다.
      -->
      <template #fallback>
        <div
          class="text-sm text-muted"
          :class="[틀.틀, 틀.판]"
        >
          불러오는 중…
        </div>
      </template>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
/**
 * **md 를 지고 서는 편집기.** 하는 일은 하나 — 값의 모양을 바꾼다. 속은 문서 객체만 다루는
 * `mEditor` 고, 이 파일이 그 겉을 md 로 맞춘다. 파서가 `@nuxtjs/mdc` 런타임이라 클라이언트에서만
 * 도는 것도 이 층의 사정이라, `ClientOnly` 와 자리표시 액자를 여기서 진다 — 그래야 폼 밖에서
 * md 를 쥔 자리(샌드박스 등)도 이것 하나만 세우면 된다.
 *
 * **폼 칸 자리는 이것을 감싸는 `Input본문` 이다** (`타입지정._.문자md` → `ORM.ts` 의 `name`).
 *
 * | | 값 |
 * |---|---|
 * | 밖(폼 칸 `Input본문`·DB·읽기 화면) | **md 문자열** (`i콘텐츠물dto.body`) |
 * | 안(`mEditor`) | **문서 객체** (ProseMirror JSON, `~utils/mdc/doc` 의 `iPM노드`) |
 *
 * ## 왜 저장은 md 인가 (2026-09-06 결정)
 *
 * **임시 다리가 아니다.** 한동안 「객체 저장으로 가는 길에 잠깐 서 있는 것」으로 적어 뒀는데,
 * 옮길 이유가 실제로는 없었다. md 저장이 주는 것을 이미 다 받고 있다 — `_CUSTOM/localDB` 의 본문
 * 13건(수업 3 · 행사 4 · 투표 2 · 퀴즈 2 · 설문 2)이 그대로 살고, 읽기 화면은 `<MDC :value="본문">`
 * 그대로고, 도우미 토큰도 md 기준이다. 객체 저장이 더 주는 건 아래 왕복 하나를
 * 없애는 것뿐인데, 그 왕복의 대가를 재 봤더니 작았다(아래 실측). 근거는 `doc.ts` 「저장은 md 다」가 정본.
 *
 * 그래서 왕복(md → 객체 → md)이 저장할 때마다 돈다. `doc.ts` 가 「사람 길에는 왕복이 없다」고
 * 말할 때 그건 **고치는 동안**의 이야기고, 저장 경계에서는 상관이 **있다** — 그게 곧 저장되는 값이다.
 *
 * ## 실측 (2026-09-06 · `localDB` 본문 13건 전부)
 *
 * **한 번 저장하면 원문이 정규화되고, 그 뒤로는 고정된다.** 왕복을 세 번 돌려 확인했다 —
 * 1회차에서 7건이 바뀌고 2·3회차는 한 글자도 안 바뀐다. **저장할 때마다 조금씩 갉히지 않는다.**
 * 그리고 **보이는 글자는 13건 전부 저장 전후가 같다**(파싱해서 평문으로 비교).
 * 달라지는 건 원문 생김새뿐이고, 셋이다.
 *
 * - **문장 중간 줄바꿈(`\n`)이 공백이 된다.** 읽기 렌더러(HTML)가 원래 공백으로 접는다.
 * - **표의 칸 폭이 재정렬되고 속성 순서가 사전순이 된다.**
 * - **`~` 가 `\~` 로 이스케이프된다.** `1~4주`·`2월10일~2월27일` 처럼 물결로 범위를 적은 3건에 걸린다.
 *   GFM 이 `~~` 를 취소선으로 읽어서 stringify 가 미리 막는 것이고, 다시 읽으면 `~` 로 돌아온다.
 *   백슬래시가 회차마다 늘어나는지도 봤는데 **안 늘어난다**(0→1→1→1 · 0→3→3→3 · 0→4→4→4).
 *
 * `doc.ts` 가 경고한 나머지 손실(태스크리스트 `- [x]`)은 **해당 자료가 0건**이라 안 걸린다.
 * 본문에 태스크리스트를 쓰기 시작하면 그때는 이 편집기가 아니라 저장 형식을 옮겨야 한다.
 *
 * ## 열기만 해도 값이 바뀌지는 않는다
 *
 * 위 정규화는 **사람이 고쳤을 때만** 나간다. 들일 때 만들어진 객체는 `들이는중` 표시가 막아서
 * `v-model` 로 되돌아가지 않는다 — 안 그러면 폼을 열기만 해도 「고쳤음」이 되어 저장 버튼이 살아난다.
 */
import { md에서문서, 문서에서md, type iPM노드 } from '~utils/mdc/doc'
import { 본문틀 } from './_/틀'

interface Props {
  readonly?: boolean
}
const props = withDefaults(defineProps<Props>(), { readonly: false })

/** 자리표시의 액자 — 들어설 편집기와 같은 곳에서 난다. 위 `#fallback` 주석 참고. */
const 틀 = computed(() => 본문틀(props.readonly))

const model = defineModel<string | null>({ required: false, default: null })

const 문서 = ref<iPM노드 | null>(null)

/** 내가 내보낸 md 가 `v-model` 로 되돌아온 것을 알아보는 표시. 되돌아온 값으로 다시 파싱하지 않는다. */
let 내가쓴md: string | null = null
/** 들이는 길에서 만든 객체가 나가는 길로 새지 않게 막는다. 머리말 「열기만 해도」 참고. */
let 들이는중 = false

// ── 들어오는 길 (md → 객체) ────────────────────────────────────────────
// 파서가 `@nuxtjs/mdc` 런타임이라 클라이언트에서만 돈다. 서버 렌더에서는 `ClientOnly` 가 자리를 잡는다.
watch(model, async (md) => {
  if (!import.meta.client) return
  if (md === 내가쓴md) return
  들이는중 = true
  try {
    문서.value = await md에서문서(md ?? '')
  } finally {
    // 위 대입이 부른 `문서` 감시자는 이 flush 안에서 돌고, `nextTick` 은 그 뒤에 풀린다.
    await nextTick()
    들이는중 = false
  }
}, { immediate: true })

// ── 나가는 길 (객체 → md) ──────────────────────────────────────────────
watch(문서, async (d) => {
  if (들이는중 || !d) return
  const md = await 문서에서md(d)
  if (md === (model.value ?? '')) return
  내가쓴md = md
  model.value = md
})
</script>

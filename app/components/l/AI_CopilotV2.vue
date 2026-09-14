<template>
  <!--
    v2 도크의 AI도우미 pane. 껍데기(패널·헤더·전환기)는 `lDock` 이 소유한다.
    `v-show`: 다른 탭으로 옮겨도 언마운트되지 않는다 — 돌아왔을 때 대화가 비어 있으면 안 된다.
  -->
  <div
    v-show="isActive"
    class="h-full min-h-0 flex flex-col"
  >
    <!--
      「한 줄」 — 좁은 화면에서 도크가 납작해졌을 때 채팅 대신 남는 것.

      **여기 실행 버튼이 같이 남는 게 요점이다.** 화면을 보려고 도우미를 완전히 치우면
      누를 버튼까지 같이 사라져서, "보려면 닫아야 하고 누르려면 열어야 하는" 교착이 된다.
      뒤에는 도우미가 방금 밀어놓은 화면이 그대로 보이고, 이 줄이 그 화면에 대한 말과 버튼을 진다.

      명단은 안 그린다. 명단은 원래 화면이 그리는 것이고(도우미는 렌더러를 안 든다),
      지금은 그 화면이 바로 뒤에 보이는 중이라 두 번 그릴 이유가 없다.
    -->
    <div
      v-if="한줄"
      class="flex items-start gap-2"
    >
      <UIcon
        name="i-lucide-bot"
        class="mt-1 size-4 shrink-0 text-muted"
      />
      <div class="min-w-0 flex-1 space-y-1.5">
        <!-- 글줄을 누르면 펼쳐진다 — 이어 말하려면 입력창이 있어야 한다. -->
        <button
          type="button"
          class="block w-full text-left"
          @click="이어말하기()"
        >
          <p
            class="line-clamp-2 text-sm/6"
            :class="한줄글 ? 'text-default' : 'text-muted'"
          >
            {{ 한줄글 || placeholder }}
          </p>
        </button>

        <!--
          접지 않고 옆으로 흘린다. 한 줄의 높이는 정해져 있어서(`--dock-peek`) 버튼이 두 줄로
          접히면 그 밖으로 밀려난다 — 스크롤이 나은 쪽이다.
        -->
        <div
          v-if="한줄버튼s.length"
          class="-mx-1 flex gap-1 overflow-x-auto px-1 pb-0.5"
        >
          <mButton
            v-for="(action, i) in 한줄버튼s"
            :key="i"
            size="xs"
            :color="action.color"
            :variant="action.variant"
            :역할="action.역할"
            :켜짐="action.켜짐"
            :icon="action.icon"
            :label="action.label"
            class="shrink-0 whitespace-nowrap"
            @click="action.onClick?.($event)"
          />
        </div>
      </div>
    </div>

    <!--
      한 줄일 때 채팅을 `display:none` 이 아니라 **0 높이로 접는다.**
      숨겨진 입력창은 포커스를 못 받고, 포커스를 못 받으면 모바일 키보드가 안 올라온다 —
      그러면 이어 말하려고 한 줄을 누른 뒤 입력창을 또 눌러야 한다(탭 두 번).
      접어만 두면 `이어말하기()` 가 **누른 그 제스처 안에서** 곧장 커서를 놓을 수 있다.
    -->
    <UChatPalette
      :class="한줄 ? 'h-0 overflow-hidden' : 'grow'"
    >
      <div
        ref="스크롤ref"
        class="h-full overflow-y-auto py-2"
      >
        <div
          v-if="!hasConversation"
          class="space-y-2"
        >
          <p class="text-sm font-semibold text-highlighted">
            이렇게 물어보세요
          </p>
          <div class="flex flex-col items-start gap-1">
            <mButton
              v-for="item in suggestions"
              :key="item"
              class="w-full justify-start px-0 text-left whitespace-normal"
              역할="조용"
              size="sm"
              :label="item"
              @click="askSuggestion(item)"
            />
          </div>
        </div>

        <UChatMessages
          v-else
          compact
          :messages="messages"
          :status="status"
          :assistant="{
            avatar: { icon: 'i-lucide-bot', size: 'sm' },
            ui: {
              // 본문 글자 크기를 앱과 맞춘다. 기본 테마는 크기를 안 정해 body(16px)를 상속받는데,
              // 옆 화면의 폼·목록은 전부 14px 라 도크만 혼자 커 보인다.
              content: 'text-sm/6',
              // compact 의 gap-1.5 는 상속 폰트 기준이라 아바타가 첫 줄에 붙는다.
              // 아래 여백도 마찬가지 — actions 를 흐름 안에 두면 기본 pb-8 은 빈 칸으로 남는다.
              container: 'gap-2 pb-4',
              // 실행 버튼이 붙는 자리라 호버해야 보이면 안 된다(기본 테마는 opacity-0 + absolute).
              actions: 'opacity-100 [@media(hover:hover)]:opacity-100 static mt-2 flex-wrap'
            }
          }"
          :user="{
            avatar: { icon: 'i-lucide-user' },
            side: 'right',
            ui: { content: 'text-sm/6', container: 'gap-2 pb-4' }
          }"
        >
          <!--
            답변 본문 + 앱이 그리는 명단. `metadata` 는 `UChatMessage` 가 선언한 prop 중
            앱이 자유롭게 쓸 수 있는 유일한 자리라 여기로 구조화된 값을 넘긴다.
            슬롯을 덮으면 기본 본문 렌더가 사라지므로 직접 옮겨 적었다.
          -->
          <template #content="{ parts, metadata }">
            <template
              v-for="(part, i) in (parts ?? [])"
              :key="i"
            >
              {{ part.text }}
            </template>

            <div
              v-if="metadata?.명단?.length"
              class="mt-2 overflow-hidden rounded-md border border-default divide-y divide-default"
            >
              <!--
                줄을 누르면 그 행이 화면에서 열린다. 명단은 이미 앱이 정확히 쥔 후보 목록이라,
                고르기 위해 이름을 다시 타이핑하게 하는 건 대화를 한 턴 더 쓰게 만들 뿐이다.
              -->
              <component
                :is="row.onClick ? 'button' : 'div'"
                v-for="(row, i) in metadata.명단"
                :key="i"
                :type="row.onClick ? 'button' : undefined"
                class="flex w-full items-center gap-1.5 px-2 py-1.5 text-left text-xs"
                :class="row.onClick ? 'cursor-pointer hover:bg-elevated' : ''"
                @click="row.onClick?.()"
              >
                <span class="min-w-0 flex-1 truncate font-medium text-highlighted">{{ row.label }}</span>
                <span
                  v-if="row.sub"
                  class="max-w-[35%] shrink-0 truncate text-muted"
                >{{ row.sub }}</span>
              </component>

              <!-- 잘렸으면 잘렸다고 적는다. 보이는 수를 전체인 것처럼 두면 앱이 거짓말을 한다. -->
              <p
                v-if="(metadata.총건수 ?? 0) > metadata.명단.length"
                class="px-2 py-1.5 text-xs text-muted"
              >
                총 {{ metadata.총건수 }}건 중 {{ metadata.명단.length }}건 표시
              </p>
            </div>
          </template>

          <!-- 기본 actions 렌더러는 라벨을 지우고 아이콘만 남긴다. 실행 버튼은 이름이 보여야 한다. -->
          <template #actions="{ actions }">
            <div class="flex flex-wrap gap-1">
              <mButton
                v-for="(action, i) in (actions ?? [])"
                :key="i"
                size="xs"
                :color="action.color"
                :variant="action.variant"
                :역할="action.역할"
                :켜짐="action.켜짐"
                :icon="action.icon"
                :label="action.label"
                class="whitespace-normal text-left"
                @click="action.onClick?.($event)"
              />
            </div>
          </template>
        </UChatMessages>
      </div>

      <template #prompt>
        <!--
          응답 대기 중에도 disabled 를 걸지 않는다 — textarea 가 disabled 되면 포커스가 떨어져
          엔터 직후 커서가 사라진다. 중복 전송은 useChatbot.send 의 status 가드가 막는다.
        -->
        <UChatPrompt
          ref="promptRef"
          v-model="input"
          :placeholder="placeholder"
          size="sm"
          :submit-on-enter="false"
          @submit="send()"
          @keydown="onPromptKeydown"
          @compositionend="onPromptCompositionEnd"
        >
          <UChatPromptSubmit
            :status="status"
            @stop="resetAndFocus"
            @reload="resetAndFocus"
          />
        </UChatPrompt>
      </template>
    </UChatPalette>
  </div>
</template>

<script setup lang="ts">
import { 계획조회V2, type PlannerResultV2 } from '~utils/aiV2/planner'
import type { i소스V2, i항목V2 } from '~utils/aiV2/source'
import { clear화면대상, get화면대상, type i화면대상 } from '~utils/ai/화면문맥'
import type { ChatAction } from '~/composables/useChatbot'
import { get행동버튼s } from '~/components/view/1'
import { 값s되돌리기, 값받을수있나, 선택지of값, 선택지찾기, 수정안두기, type i수정필드 } from '~utils/etc/필드수정'

/**
 * v2 전용 AI도우미 (aiV2). **파이프라인 지도는 `~utils/aiV2/README.md`** — 이 파일이 맡는 건
 * 그중 **③ 판정**과 **⑤ 버튼**이다.
 *
 * 판단이 LLM이 아니라 여기 있는 이유: 뭐가 있는지 아는 쪽이 판단하고, 모르는 쪽은 문장만 쓴다.
 * AI에 판단을 맡기면 없는 기능을 있다고 답한다.
 *
 * **`l/AI_Copilot.vue`(v1)의 사본이 아니다.** 저쪽이 다루는 축(필터 어휘·본문 발췌·글 초안·
 * 편집 중인 화면) 중 v2에 있는 것은 하나도 없다 — 없는 축을 위한 분기를 데려오면 매 턴 빈 값으로
 * 흐른다. 남긴 골격은 셋뿐이다: **조회 → 판정 → (버튼 + 이번 턴 지시).**
 *
 * 어떤 모델도 import하지 않는다. 무엇을 볼지는 전적으로 주입받는다(`sources.ts`).
 */
const props = defineProps<{ sources?: i소스V2[] }>()

/** 선택을 옮길 때 지금 어느 화면인지 봐야 한다(같은 경로면 이동하지 않는다). */
const route = useRoute()

/**
 * 무엇을 물어볼 수 있는지는 **주입받은 소스가 안다.** 손으로 적어두면 소스를 늘릴 때마다 빼먹는데,
 * 그 대가가 두 곳에서 다르다 — `placeholder` 는 안내가 낡을 뿐이지만, **시스템 프롬프트에서 빠진
 * 소스는 도우미가 "그런 데이터는 없다"고 답한다.** 실제로 `테마`·`회원2`가 붙은 뒤에도
 * 양쪽 다 "과일·동물·채소"라고 적혀 있었다.
 */
const 소스이름s = computed(() => (props.sources ?? []).map(s => s.label).filter(Boolean))

const 시스템프롬프트 = computed(() => `너는 v2 실험 화면의 AI도우미다.${소스이름s.value.length ? ` 참조 데이터는 ${소스이름s.value.join('·')} 목록뿐이다.` : ''}

응답 원칙:
- 마크다운 강조(**)를 쓰지 마라.
- 2~3문장으로 짧게 답한다.
- 건수는 앱이 센 값이 참조 데이터에 적혀 있다. 다시 세지 말고 그대로 쓰라.

지어내기 금지 (가장 중요):
- 참조 데이터에 없는 항목·기능·행동은 존재하지 않는다. 그럴듯해 보여도 만들어 내지 마라.
- 버튼은 앱이 답변 아래에 붙인다. 대괄호나 링크 모양으로 버튼을 본문에 그리지 마라.
  "[이번 답변 지시]"가 버튼을 언급하지 않았다면 이번 답변에는 버튼이 없다.
- 대괄호로 묶인 제목([과일] 등)은 앱 내부 구분자다. 답변 문장에 그대로 옮기지 마라.`)

/**
 * 각각 다른 경로를 밟는다: 건수 / 목록 / 대화로 선택 / 이름 지목 행동 / 화면 선택 행동 / 생성.
 * "기록 넣자"(행동)와 "하나 추가해"(생성)가 붙어 있는 건 **가장 헷갈리는 한 쌍**이라서다.
 */
const suggestions = [
  '과일 몇 건이야?',
  '동물 목록 보여줘',
  '여름채소 보여줘',
  '고양이 선택해줘',
  '감자 do토스트 실행해줘',
  'do토스트 해줘',
  '고구마에 기록 하나 넣자',
  '동물 하나 추가해',
  '채소 3개 추가해',
  '강아지 지워줘',
  // 마지막 하나는 **데이터가 아닌 소스**다(`model테마`) — 같은 파이프라인으로 화면 자체를 미는 턴이다.
  '그림자 좀 줄여줘'
]

const placeholder = computed(() =>
  소스이름s.value.length ? `${소스이름s.value.join(' / ')}에 대해 물어보세요.` : '무엇이든 물어보세요.'
)

/**
 * 직전 턴이 프롬프트에 올린 항목들. 계획 호출은 대화 기록을 안 받으므로
 * "그거 do토스트 해줘"의 "그거"를 planner가 알 방법이 이것뿐이다.
 *
 * `shallowRef` 인 이유: 항목에 모델 인스턴스(`row`)가 딸려 있어 깊은 반응형으로 감싸면
 * 저장소가 쥔 원본과 identity 가 어긋난다.
 */
const 직전항목s = shallowRef<i항목V2[]>([])

/**
 * 직전 턴이 볼 때의 화면 선택. 이번 턴의 것과 다르면 **사용자가 그 사이에 골랐다**는 뜻이다.
 * 이 순서는 앱에만 있다 — 프롬프트에서 두 근거는 나란히 놓일 뿐이라 LLM은 어느 쪽이 나중인지 모른다.
 */
const 이전화면키 = ref('')

/**
 * 화면을 미는 유일한 통로. **밀기 전에 좁은 화면의 도크를 한 줄로 내린다.**
 *
 * 이 도우미의 결과물은 답변 문장이 아니라 **바뀐 화면**이다. 좁은 화면에서 패널이 덮은 채로 두면
 * 결과가 자기 뒤에 숨고, 답변의 "현재 화면에는 …이 표시되고 있습니다"가 거짓말이 된다.
 * 넓은 화면에서는 아무 일도 안 일어난다(`useDock.한줄` 이 폭을 본다) — 부르는 쪽은 안 갈린다.
 */
function 화면으로(to: Parameters<typeof navigateTo>[0], opts?: Parameters<typeof navigateTo>[1]) {
  접기()
  return navigateTo(to, opts)
}

/**
 * 대화로 고른 한 건을 **화면이 실제로 열게** 한다 — 하는 일은 주소로 이동하는 것뿐이다.
 *
 * 앱 안에 전용 채널을 파지 않은 이유: 선택은 이미 주소에 있다(`?id=`). 도우미는 그 주소를 만들 뿐이고
 * 여는 건 그 소스를 그리는 화면이라, 새로고침·뒤로가기·링크 공유가 그대로 따라온다.
 * 저장 전 행(초안)도 이 길로 연다(축이 `rowKey`다) — 만들기만 따로 채널을 파면 창구가 둘이 된다.
 */
function do선택(x: i항목V2, source: i소스V2 | null, 탭 = '') {
  // 경로를 모르는 소스는 그릴 화면이 없다는 뜻이라 주소를 만들 수 없다(`sources.ts`가 준다).
  if (!x.id || !source?.path) return
  // 같은 화면이면 그 화면이 쥔 나머지 쿼리를 지킨다. 다른 화면으로 옮길 때는 가져가지 않는다 —
  // 파라미터는 그 페이지 것이지 따라다니는 게 아니다.
  const 같은화면 = route.path === source.path
  // **`tab`은 언제나 같이 쓴다**(말 안 했으면 지운다). 같은 화면의 쿼리를 그대로 물려받으면
  // 앞 행에서 보던 묶음이 새 행에 따라붙는데, 목록5는 주소가 옮긴 선택이면 그 탭을 믿고 연다.
  void 화면으로({ path: source.path, query: { ...(같은화면 ? route.query : {}), id: x.id, tab: 탭 || undefined } })
}

/**
 * 조회 턴에 **화면 목록을 좁힌다.** 도우미는 렌더러를 안 들고 있고, 목록·필터·정렬은 화면이
 * 이미 갖고 있다 — 할 일은 "어느 화면을, 어떤 조건으로"를 주소로 옮기는 것뿐이다(`i소스V2.조회쿼리`).
 *
 * **`push`다**(`do선택`의 `replace`와 다르다) — 도우미가 바꿔놓은 화면이라 뒤로가기 한 번으로
 * 돌아올 수 있어야 한다. 선택(`?id=`)은 **안 들고 간다**: 새 조건에 안 걸리는 행이 주소에 남으면
 * 화면이 그 행을 찾으려고 검색어를 도로 풀어버린다(목록5의 복구 경로).
 */
const 조회키인가 = (k: string) => k === 'q' || k === 'sort' || k.startsWith('f_')

function do화면조회(r: PlannerResultV2): boolean {
  const source = r.source
  const plan = r.plan
  if (!source?.path || !plan) return false
  // 무엇을 시키거나 만드는 턴은 화면을 옮기지 않는다 — 대상이 이미 정해져 있거나 아직 없다.
  if (plan.intent !== 'count' && plan.intent !== 'list') return false

  const 쿼리 = source.조회쿼리(plan)
  const 지금 = Object.fromEntries(
    Object.entries(route.query).filter(([k]) => 조회키인가(k)).map(([k, v]) => [k, String(Array.isArray(v) ? v[0] : v ?? '')])
  )
  if (route.path === source.path && JSON.stringify(지금) === JSON.stringify(쿼리)) return true

  void 화면으로({ path: source.path, query: 쿼리 })
  return true
}

/**
 * 목록에 **빈 줄**을 놓고, 마지막 줄을 그 자리에서 연다. 서버에는 아무것도 안 보낸다 —
 * 화면의 추가 버튼과 같은 흐름이다: 빈 줄 → 사람이 채움 → 저장.
 *
 * 값을 묻는 모달을 세우지 말 것. 필수 칸이 늘면 모달이 그만큼 길어지는데 그 폼은 화면이 이미
 * 갖고 있고, "채소 3개 추가해"에는 모달이 세 번 뜬다.
 *
 * 만든 것을 `직전항목s`에 올려두는 이유: 다음 턴의 "거기 제철 봄으로"가 가리킬 자리다.
 */
async function do초안(source: i소스V2, 이름s: string[], 개수: number, 값s: Record<string, string> = {}) {
  // 계획이 말한 이름은 `label` 칸에 앉는다 — 모델 어디서나 그 행의 이름이 사는 자리다.
  // 이름을 안 말한 줄은 이름 없이 만든다. 빈 줄을 놓는 게 이 흐름의 정상이라 되묻지 않는다.
  const 값s목록 = Array.from({ length: 개수 }, (_, i) => {
    const 이름 = String(이름s[i] ?? '').trim()
    return 이름 ? { ...값s, label: 이름 } : { ...값s }
  })

  const 만든s = await source.초안?.(값s목록)
  if (!만든s?.length) return

  직전항목s.value = 만든s
  do선택(만든s[만든s.length - 1]!, source)
}

/**
 * 행이 사라진 자리를 치운다. 지우는 일과 확인 창은 모델의 `do삭제`가 한다(`BaseModel2.delete`) —
 * 앱이 한 번 더 물으면 같은 질문이 두 번 뜬다.
 *
 * 없어진 행이 **세 군데에 남는다**: 주소(`?id=`), 대화가 쥔 지목 후보, 화면 대상 등록.
 * 그대로 두면 다음 턴의 "그거"가 없는 행을 가리킨다. 정말 지워졌을 때만 부른다.
 */
function 지운뒤정리(x: i항목V2) {
  직전항목s.value = 직전항목s.value.filter(item => !(item.source === x.source && item.id === x.id))
  // 화면이 이 행을 보고 있었다면 그 등록도 걷어낸다(자기가 건 것일 때만 지워진다).
  // 다음 턴의 "방금 선택함" 판정이 사라진 키를 기준으로 삼지 않도록 기준값도 같이 비운다.
  clear화면대상(x.row)
  이전화면키.value = ''

  if (String(route.query.id ?? '') === x.id) {
    const { id: _지운id, ...나머지 } = route.query
    void navigateTo({ path: route.path, query: 나머지 }, { replace: true })
  }
}

/** 명단은 두 건부터 그린다. 한 건이면 답변 문장과 버튼이 이미 이름을 밝힌다. */
const 명단최대 = 30
function 명단s(항목s: i항목V2[], source: i소스V2 | null) {
  if (항목s.length < 2) return []
  // 줄마다 선택 동작을 단다 — 명단은 앱이 이미 정확히 쥔 후보 목록이라, 그중 하나를 고르는 데
  // 이름을 다시 타이핑하고 계획을 한 번 더 세울 이유가 없다.
  const 열수있음 = !!source?.path
  return 항목s.slice(0, 명단최대).map(x => ({
    label: x.label,
    sub: x.sub,
    뱃지s: [],
    // 누른 뒤 커서를 입력창에 돌려놓는다(제안·초기화 버튼과 같은 처방). 줄을 눌렀다는 건 대화를
    // 이어가는 중이라는 뜻이고, 브라우저는 누른 버튼에 포커스를 남긴다.
    // 목록이 이 선택에 포커스를 뺏지 않는 것도 여기에 기댄다 — 쥔 사람이 있어야 물러난다(목록5).
    ...(열수있음 && x.id
      ? { onClick: () => {
          do선택(x, source)
          focusPrompt()
        } }
      : {})
  }))
}

/** 후보를 버튼으로 늘어놓을 수 있는 한계. 이보다 많으면 고르는 게 아니라 조건을 좁혀야 한다. */
const 후보최대 = 5
const 행동최대 = 4

/**
 * 되돌릴 수 없는 행동. 다른 `do*`와 같은 길로 오지만 **누르고 나면 물러설 자리가 없다.**
 * 여기 적힌 키만 세 가지 대접을 더 받는다: 지목된 턴에만 버튼이 붙고, 라벨에 대상 이름이 박히고,
 * 답변이 되돌릴 수 없다고 먼저 말한다. (확인 창·뒷정리는 이미 다른 곳에 있다.)
 */
const 위험행동키s = new Set(['do삭제'])

/**
 * **지목된 턴에만** 내미는 행동. 위험해서가 아니라 이 버튼이 무슨 일을 하는지가 그 문장 안에서만
 * 정해지기 때문이다 — 딸려 나오게 두면 아무것도 안 적힌 "값수정" 버튼이 앉는다.
 */
const 지목전용키s = new Set(['do수정'])

/** 지목되지 않은 턴에 딸려 나오면 안 되는 행동인가. */
const 지목필요 = (key: string) => 위험행동키s.has(key) || 지목전용키s.has(key)

/**
 * 행동 판정. **실패 원인을 종류로 가르는 게 요점이다** — 그런 기능이 없다 / 대상이 안 정해졌다 /
 * 지금은 못 한다 / 이번 턴은 행동이 아니다. 전부 "지원하지 않습니다"로 뭉개면 사용자는
 * 있는 기능을 없다고 학습한다.
 */
type i판정V2
  = { kind: '해당없음' }
    | { kind: '어휘밖' }
    | { kind: '대상없음' }
    | { kind: '대상다수', 총건수: number }
    | { kind: '후보제시', 총건수: number, 버튼s: ChatAction[] }
    | { kind: '전제불충족', 행동라벨: string, 대상표기: string }
    // 고칠 칸은 정해졌는데 **넣을 수 없는 값**이 온 경우(`좋아요`에 "많이"). 버튼을 만들지 않는다.
    | { kind: '값형식', 필드라벨: string, 타입: string, 값: string, 선택지?: string }
    | { kind: '준비됨', 버튼s: ChatAction[], 대상표기: string, 주의: string, 값: string, 위험: boolean, 수정표기: string }
    // 아래 둘은 행동(`do*`)이 아니라 **화면을 옮기는** 턴이다(`intent: 'select'`).
    // 한 건으로 좁혀진 쪽은 버튼이 없다 — 판정하는 동안 이미 열렸다.
    | { kind: '선택함', 대상표기: string, 화면표기: string, 이동: boolean, 탭표기: string }
    | { kind: '선택안내', 총건수: number }
    // 아래 둘은 **없던 행을 만드는** 턴이다(`intent: 'create'`). 대상이 아직 없다는 점이 다른 전부다.
    | { kind: '생성불가', 소스명: string }
    | { kind: '생성준비', 버튼s: ChatAction[], 소스명: string, 이름s: string[], 개수: number }

const 버튼없음 = '이번 답변에는 실행 버튼이 없다. 버튼이나 실행 가능한 조치를 언급하지 마라.'
const 실행주체 = '네가 실행했다고도, 실행하겠다고도, 진행하겠다고도 말하지 마라 — 누르는 사람은 사용자다.'
const 기능있음 = '기능이 없어서가 아니다. 지원하지 않는다고 말하지 마라.'
const 이유금지 = '왜 안 되는지 이유를 지어내지 마라.'

/** 버튼 라벨에 값을 붙일 때의 길이. 길면 버튼이 문단이 된다. */
const 값표기최대 = 24
const 값표기 = (값: string) => 값.length > 값표기최대 ? `${값.slice(0, 값표기최대)}…` : 값

/**
 * 이번 턴이 제안하는 값수정. 계획이 낸 쌍들을 **소스가 연 칸으로 풀어 놓은 것**이다.
 *
 * `칸s`(폼에 세울 칸 전부)와 `값s`(미리 채울 값)를 나눠 드는 이유: 폼은 사용자가 다른 칸도
 * 손볼 수 있어야 하므로 소스의 칸 전부를 세우고, 도우미가 말한 것만 값으로 앉는다.
 */
interface i수정제안 {
  칸s: i수정필드[]
  값s: Record<string, string>
  쌍s: { 필드: i수정필드, 값: string }[]
}

/**
 * `행동값`에 온 말이 **닫힌 칸 딱 하나의 선택지**면 그 쌍을 만들어 준다. 아니면 빈 배열.
 * 계획이 `수정s` 대신 `행동값`에 값을 싣는 일이 잦은데(lite 실측) 값 자체는 맞고,
 * 어느 칸인지는 선택지가 말해준다 — 앱만 아는 사실이라 앱이 판정한다.
 */
function 칸값한개로찾기(칸s: i수정필드[], 값: string): { 필드?: i수정필드, 값: string }[] {
  const 말 = String(값 ?? '').trim()
  if (!말) return []

  // ① 칸 이름과 그 칸의 선택지가 **둘 다** 적혀 있으면 그게 쌍이다.
  //    형식을 맞춰 파싱하려 들지 말 것 — lite 는 여기에 문장을 통째로 쓰기도 하고 그 형식이 매번 다르다.
  //    **이름과 값이 같이 있는가**만 본다.
  const 이름과값 = 칸s.flatMap((f) => {
    if (!f.선택지?.length || !말.includes(f.label)) return []
    const 걸린s = f.선택지.filter(o => 말.includes(o.label))
    return 걸린s.length === 1 ? [{ 필드: f, 값: 걸린s[0]!.label }] : []
  })
  if (이름과값.length === 1) return 이름과값

  // ② 칸 이름이 없으면 값만 본다. 통째로 맞든(`아주 크게`) 문장 안에 섞여 있든(`… 뿌리 …`)
  //    **딱 한 칸의 딱 한 선택지**에 걸릴 때만 건진다 — 여러 칸에 있는 말(`기본`은 진하기·그림자·
  //    완제품에 다 있다)로 찍으면 사용자가 시킨 적 없는 칸이 바뀐다. 애매하면 안 건지는 게 맞다.
  const 값만 = 칸s.flatMap((f) => {
    if (!f.선택지?.length) return []
    const 통째 = 선택지찾기(f, 말)
    if (통째) return [{ 필드: f, 값: 통째.label }]
    const 걸린s = f.선택지.filter(o => 말.includes(o.label))
    return 걸린s.length === 1 ? [{ 필드: f, 값: 걸린s[0]!.label }] : []
  })
  return 값만.length === 1 ? 값만 : []
}

/**
 * 행에서 칸 하나를 읽어 **사람이 읽는 문자로**. 닫힌 칸이면 행이 든 것은 내부 값이고 계획이
 * 말한 것은 라벨이라, 그대로 나란히 적으면 단위가 섞인다 — 실측: `그림자`가 `2 → 2`로 보였다.
 */
const 칸값 = (row: unknown, 필드: i수정필드) => {
  const v = (row as Record<string, unknown> | undefined)?.[필드.key]
  return String(선택지of값(필드, v)?.label ?? v ?? '')
}

/**
 * 값은 **지목된 행동에만** 넘긴다. 같이 붙는 다른 버튼은 그 문장이 시킨 일이 아니라 이 행이
 * 마침 할 수 있는 다른 일이라, 거기까지 흘리면 사용자가 말한 적 없는 조합이 만들어진다.
 *
 * 값이 붙은 버튼은 **라벨에 그 값을 적는다** — 누르기 전에 무엇이 쓰일지 보이지 않으면
 * 되돌릴 수 없는 일을 눈 감고 누르게 된다.
 */
function 버튼만들기(x: i항목V2, 지목: string, 허용: string[], 값 = '', 수정?: i수정제안): ChatAction[] {
  if (!x.row) return []
  return get행동버튼s(x.row)
    .filter(b => 허용.includes(b.key) && toValue(b.show) !== false)
    // 되돌릴 수 없는 행동은 **지목된 턴에만** 내민다. 딸려 나오면 "고구마에 기록 하나 넣자"의
    // 답변 아래에 삭제 버튼이 놓인다 — 시킨 적 없는 일이 시킨 일 옆에 같은 크기로 앉는다.
    .filter(b => !지목필요(b.key) || b.key === 지목)
    .toSorted((a, b) => Number(b.key === 지목) - Number(a.key === 지목))
    .slice(0, 행동최대)
    .map((b) => {
      const 이번값 = b.key === 지목 ? 값 : ''
      const 위험 = 위험행동키s.has(b.key)
      // `do수정`이 받을 값은 버튼을 타고 가지 않는다 — 고칠 칸이 여럿일 수 있는데 `onClick`은
      // 한 칸만 나르기 때문이다. 놓아두고(`수정안두기`) 폼이 꺼내 쓴다.
      const 이번수정 = 수정 && b.key === 지목 ? 수정 : undefined
      // 라벨은 확인이 아니라 **예고**다. 확인은 뜨는 폼이 받는다 — 칸이 셋이면 라벨 한 줄로는
      // 무엇이 무엇으로 바뀌는지 보여줄 수 없고, 보여줄 수 없는 것을 누르게 하면 안 된다.
      const 수정라벨 = !이번수정
        ? ''
        : 이번수정.쌍s.length === 1
          ? `${이번수정.쌍s[0]!.필드.label}: ${값표기(칸값(x.row, 이번수정.쌍s[0]!.필드))} → ${값표기(이번수정.쌍s[0]!.값)}`
          : 이번수정.쌍s.length
            ? `${이번수정.쌍s[0]!.필드.label} 외 ${이번수정.쌍s.length - 1}칸 수정`
            : '값수정'
      return {
        // 위험한 버튼은 **무엇이 사라지는지**를 라벨에 박는다("강아지 삭제").
        // 값이 붙는 버튼이 값을 적는 것과 같은 이유다 — 누르기 전에 보이지 않으면 눈 감고 누른다.
        label: 수정라벨 || (위험 ? `${x.label} ${b.label}` : 이번값 ? `${b.label}: ${값표기(이번값)}` : b.label),
        icon: b.icon,
        color: 위험 ? 'error' : 'primary',
        역할: undefined,
        켜짐: b.key === 지목,
        size: 'xs',
        onClick: () => {
          // 폼이 꺼내 갈 값을 바로 앞에 놓는다. 놓고 곧바로 부르므로 사이에 끼어들 틈이 없고,
          // 꺼내는 순간 비워지므로 눌리지 않은 제안이 다음 폼에 새지 않는다.
          if (이번수정) 수정안두기({ 칸s: 이번수정.칸s, 값s: 이번수정.값s })
          // 지운 뒤에 치울 게 있다(`지운뒤정리`). `do삭제`는 정말 지웠을 때만 `true`를 돌려주므로
          // 확인 창에서 취소하면 아무것도 건드리지 않는다. 실패는 모델이 이미 알린다.
          void Promise.resolve(b.onClick(이번값 || undefined))
            .then((결과) => { if (위험 && 결과 === true) 지운뒤정리(x) })
            .catch(() => { })
        }
      }
    })
}

/**
 * 버튼이 걸린 대상이 "사용자가 생각하는 그것"이 아닐 수 있는 경우를 앱이 잡는다.
 * 어긋났는지는 앱만 안다(직전 턴과 화면 둘 다 앱이 쥐고 있다) — 답변이 그걸 먼저 말하게 한다.
 */
function 대상주의(대상: i항목V2, 화면: i화면대상 | null, 직전: i항목V2[]): string {
  const 이전 = 직전.length === 1 ? 직전[0] : undefined
  if (이전?.id && 대상.id && 이전.id !== 대상.id)
    return `직전 턴에 얘기하던 ${이전.label}이(가) 아니라 다른 항목이다.`
  if (화면?.id && 대상.id && 화면.id !== 대상.id)
    return '사용자가 화면에 열어둔 항목이 아니다.'
  return ''
}

/**
 * 선택 턴 판정. 한 건으로 좁혀졌으면 **그 자리에서 열고**, 아니면 명단에서 고르게 둔다.
 *
 * **여기만 버튼을 안 거친다.** `do*`가 버튼을 요구하는 건 눌리는 순간 데이터가 바뀌기 때문인데,
 * 선택은 주소의 `?id=`를 옮길 뿐이라 되돌리는 비용이 "다른 이름을 한 번 더 말한다"뿐이다.
 * 후보 버튼도 따로 안 만든다 — 명단의 줄이 이미 그 버튼이다(`명단s`가 줄마다 `onClick`을 단다).
 */
function 선택판정(r: PlannerResultV2): i판정V2 {
  if (!r.총건수) return { kind: '대상없음' }

  // 여러 건이면 명단이 곧 고르는 자리다.
  const 하나 = r.항목s.length === 1 ? r.항목s[0] : undefined
  if (!하나) return { kind: '선택안내', 총건수: r.총건수 }
  // PK가 없는 행(저장 전)은 주소로 가리킬 수 없다. 화면이 없는 소스도 마찬가지다.
  if (!하나.id || !r.source?.path) return { kind: '대상없음' }

  // 화면이 바뀌었는지는 옮기기 **전에** 봐야 안다. 답변이 그 사실까지 말해야 하는 유일한 근거다.
  const 이동 = route.path !== r.source.path
  // 계획이 말한 묶음은 **그 소스에 실제로 있을 때만** 쓴다. enum 은 소스를 안 가리는 합집합이라
  // 다른 표의 묶음(`배경`)이 올 수 있고, 그대로 실어 보내면 화면은 첫 묶음을 여는데
  // 답변만 "성격을 열었다"고 말한다 — 앱이 아는 사실로 여기서 자른다.
  const 탭 = (() => {
    const t = String(r.plan?.탭 ?? '').trim()
    const 있는s = r.source?.탭어휘s() ?? []
    // 첫 묶음은 안 싣는다. 어차피 그게 열리는 자리라 주소에 적을 것도 없고(목록5의 같은 규칙),
    // 실으면 답변만 "기본 묶음을 펼쳤다"고 한 마디 더 하게 된다 — 아무 일도 안 한 것에 대해.
    return t && 있는s.includes(t) && t !== 있는s[0] ? t : ''
  })()
  do선택(하나, r.source, 탭)
  // 이 이동은 다음 턴에 `방금선택`으로 잡힌다(화면 키가 직전 턴과 달라진다). 그게 맞다 —
  // 누가 골랐든 이 대상이 대화에서 가장 나중에 세워진 것이라, 직전 턴의 목록보다 우선해야 한다.

  return { kind: '선택함', 대상표기: 하나.label, 화면표기: r.source.label, 이동, 탭표기: 탭 }
}

/**
 * 만들기 턴 판정. 조회 결과를 **하나도 보지 않는다** — 만들 행은 아직 어디에도 없다.
 * 갈리는 건 하나뿐이다: 이 소스에 추가 권한이 있는가(`sources.ts`가 켰는가).
 * 이름이 비어 있어도 막지 않는다 — 이름 없는 빈 줄이 이 흐름의 정상이다.
 */
function 생성판정(r: PlannerResultV2): i판정V2 {
  const source = r.source
  if (!source?.초안) return { kind: '생성불가', 소스명: source?.label ?? '' }

  const 이름s = (r.plan?.생성이름s ?? []).map(x => String(x ?? '').trim()).filter(Boolean)
  // 이름을 말했으면 **그 수가 곧 개수**다. 상한은 lite 가 큰 수를 낼 수 있어서다 —
  // 되돌리는 방법이 빈 줄을 하나씩 지우는 것뿐이라 대가가 개수에 비례한다.
  const 말한개수 = Math.trunc(Number(r.plan?.생성개수 ?? 0)) || 0
  const 개수 = Math.min(Math.max(이름s.length || 말한개수 || 1, 1), 10)

  // 만드는 턴에도 채울 칸을 나르는 자리는 `수정s` 하나다("기후대 열대인 강아지 추가해줘").
  // 못 푸는 칸은 조용히 버린다 — 빈 줄을 놓는 게 목적이라, 반쪽 때문에 턴을 접을 이유가 없다.
  const 칸s = source.수정필드s
  // 닫힌 칸이면 라벨을 내부 값으로 되돌린다(`값s되돌리기`). 안 되돌리면 초안에 `열매줄기` 같은
  // 목록 밖 값이 앉고, 그 행은 저장돼도 필터에 안 걸린다.
  const 생성값s = 값s되돌리기(
    (r.plan?.수정s ?? [])
      .map(x => ({ 필드: 칸s.find(f => f.label === String(x?.필드 ?? '').trim() || f.key === String(x?.필드 ?? '').trim()), 값: String(x?.값 ?? '').trim() }))
  )
  return {
    kind: '생성준비',
    소스명: source.label,
    이름s,
    개수,
    버튼s: [{
      // 이름을 하나만 말했을 때만 그 이름을 라벨에 쓴다. 여럿이면 이름을 늘어놓는 대신 개수를 밝힌다 —
      // 버튼 라벨이 목록이 되면 무엇을 누르는 건지가 오히려 안 읽힌다.
      label: 개수 > 1 ? `${source.label} ${개수}개 추가` : 이름s[0] ? `${이름s[0]} 추가` : `${source.label} 추가`,
      icon: 'i-lucide-plus',
      color: 'primary',
      역할: '강조',
      size: 'xs',
      onClick: () => { void do초안(source, 이름s, 개수, 생성값s) }
    }]
  }
}

/**
 * 계획 결과 → 판정. 앱만 아는 사실(화이트리스트·`show`·건수)로 종류를 정한다.
 * 안전은 세 겹이다: `행동키s` 화이트리스트(`sources.ts`) → `show` → `do*` 자신의 전제조건 검사.
 */
function 판정하기(r: PlannerResultV2, 화면: i화면대상 | null, 직전: i항목V2[]): i판정V2 {
  // 여는 건 모델의 행동이 아니라 화면의 일이라 화이트리스트를 거치지 않는다.
  // 상태를 바꾸지도 않는다 — 되돌리는 방법이 "다른 걸 고른다"뿐인 조작이라,
  // 여기만 판정이 곧 실행이다(버튼을 만들지 않고 그 자리에서 연다).
  if (r.plan?.intent === 'select') return 선택판정(r)
  // 만들기는 `행동키s`와 **다른 화이트리스트**를 탄다(소스의 `생성`). 있는 행에 시키는 일이 아니라
  // 없던 행을 만드는 일이라, 어느 `do*`가 열려 있는지와는 아무 상관이 없다.
  if (r.plan?.intent === 'create') return 생성판정(r)

  const 허용 = r.source?.행동키s ?? []
  const 지목 = String(r.plan?.행동 ?? '').trim()
  // 사용자가 이미 말한 내용. 없으면 빈 문자열이고, 그때는 눌린 뒤 모델이 알아서 묻는다.
  const 값 = String(r.plan?.행동값 ?? '').trim()

  if (!지목) return { kind: '해당없음' }
  if (!허용.includes(지목)) return { kind: '어휘밖' }

  /**
   * 계획의 쌍들을 **이 소스가 연 칸**으로 푼다. 계획은 라벨로 지목하고, 키로 되돌리는 건 앱의 일이다
   * (키도 받아주는 건 라벨과 키가 같은 칸이 대부분이라서다).
   *
   * **못 푸는 칸이 하나라도 있으면 통째로 접는다.** 계획이 소스를 빗나가 다른 표의 칸을 지목한
   * 경우가 여기로 오는데, 나머지만 반쪽으로 적용하면 사용자는 절반이 사라진 걸 모른다.
   */
  const 칸s = r.source?.수정필드s ?? []
  const 찾기 = (이름: string) => 칸s.find(f => f.label === 이름 || f.key === 이름)
  const 계획쌍s = 지목 === 'do수정'
    ? (r.plan?.수정s ?? []).map(x => ({ 필드: 찾기(String(x?.필드 ?? '').trim()), 값: String(x?.값 ?? '').trim() }))
    : []
  /**
   * `do수정`인데 **쌍이 하나도 없고 값만** 온 턴을 앱이 건진다 — 실측(2026-09-05):
   * "글자 좀 크게 해줘"에 lite 가 `{행동:"do수정", 행동값:"아주 크게"}`를 냈다(값은 맞고 자리만 틀렸다).
   * **쌍이 이미 있으면 안 건드린다** — 값을 하나 더 얹으면 말한 적 없는 칸이 같이 바뀐다.
   */
  const 쌍s = 지목 === 'do수정' && !계획쌍s.length ? 칸값한개로찾기(칸s, 값) : 계획쌍s
  if (지목 === 'do수정' && (!칸s.length || 쌍s.some(x => !x.필드))) return { kind: '어휘밖' }

  // 숫자·날짜 칸에 말이 들어온 경우("좋아요 많이 올려줘"). 폼에 그대로 앉히면 저장할 때
  // setter가 조용히 0으로 눌러버려서, 사용자는 자기가 시킨 적 없는 값이 들어간 걸 나중에야 안다.
  // 값을 다듬는 건 여기 일이 아니므로(그건 setter의 몫이다) 버튼을 만들지 않고 되묻는다.
  const 못받음 = 쌍s.find(x => x.필드 && !값받을수있나(x.필드, x.값))
  if (못받음?.필드)
    return {
      kind: '값형식',
      필드라벨: 못받음.필드.label,
      타입: 못받음.필드.타입,
      값: 못받음.값,
      // 닫힌 칸이면 **무엇을 넣을 수 있는지**까지 앱이 안다. 형식만 말하고 목록을 안 주면
      // 사용자는 다시 찍어야 하고, 두 번 틀리면 없는 기능으로 배운다.
      선택지: 못받음.필드.선택지?.map(o => o.label).join(' | ')
    }

  const 수정: i수정제안 | undefined = 지목 === 'do수정'
    ? {
        칸s,
        쌍s: 쌍s as { 필드: i수정필드, 값: string }[],
        값s: Object.fromEntries(쌍s.filter(x => x.필드 && x.값).map(x => [x.필드!.key, x.값]))
      }
    : undefined

  // 대상이 한 건으로 확정되지 않았을 때. 후보가 누구인지는 앱이 알고 있으므로 앱이 버튼으로 내민다.
  // 건수는 `총건수` — `항목s.length`는 상한에 맞춰 잘린 수라 그걸 말하면 앱이 거짓말을 한다.
  if (r.항목s.length !== 1) {
    if (!r.총건수) return { kind: '대상없음' }

    // 후보 버튼은 라벨이 **행 이름**으로 덮인다(어느 것인지 고르는 자리라 값은 여기 낄 데가 없다).
    // 값 자체는 그대로 실린다 — 고르고 나면 그게 쓰일 내용이다.
    //
    // 되돌릴 수 없는 행동은 후보를 늘어놓지 않는다. 이름만 적힌 버튼이 여럿이면 고르는 게 아니라
    // 찍는 것이고, 찍어서 지운 건 되돌릴 데가 없다. 좁히는 건 사용자의 말로 한다.
    const 버튼s = !위험행동키s.has(지목) && r.총건수 <= 후보최대
      ? r.항목s.flatMap(x => 버튼만들기(x, 지목, 허용, 값, 수정).slice(0, 1).map(b => ({ ...b, label: x.label })))
      : []
    return 버튼s.length
      ? { kind: '후보제시', 총건수: r.총건수, 버튼s }
      : { kind: '대상다수', 총건수: r.총건수 }
  }

  const 대상 = r.항목s[0]!
  if (!대상.row) return { kind: '대상없음' }

  const 버튼s = 버튼만들기(대상, 지목, 허용, 값, 수정)
  if (!버튼s.length) {
    // 키는 있는데 지금은 안 되는 경우와, 아예 없는 경우는 전혀 다른 말이어야 한다.
    const 이름 = get행동버튼s(대상.row).find(b => b.key === 지목)?.label
    return 이름
      ? { kind: '전제불충족', 행동라벨: 이름, 대상표기: 대상.label }
      : { kind: '어휘밖' }
  }

  return {
    kind: '준비됨',
    버튼s,
    대상표기: 대상.label,
    주의: 대상주의(대상, 화면, 직전),
    값,
    위험: 위험행동키s.has(지목),
    // 바꾸는 턴은 "무엇이 무엇으로"가 요점이라, 답변이 그걸 그대로 옮기게 사실을 적어 보낸다.
    수정표기: 수정
      ? 수정.쌍s.length
        ? 수정.쌍s.map(x => `${x.필드.label}: ${칸값(대상.row, x.필드)} → ${x.값 || '(폼에서 입력)'}`).join(' / ')
        : '(고칠 칸은 폼에서 고른다)'
      : ''
  }
}

interface 행동결과 { 버튼s: ChatAction[], 참조: string, 지시: string }

/** 판정 → 이번 턴에만 붙일 사실과 지침. 종류마다 하는 말이 다르다는 게 요점이다. */
function 서술(판정: i판정V2): 행동결과 {
  const 없음 = (지시: string): 행동결과 => ({ 버튼s: [], 참조: '', 지시 })

  switch (판정.kind) {
    case '해당없음':
      return 없음(버튼없음)
    case '어휘밖':
      return 없음(`${버튼없음} 사용자가 요청한 일은 이 데이터로는 지원하지 않는다고만 밝혀라. ${이유금지}`)
    case '대상없음':
      return 없음(`${버튼없음} 요청한 대상을 찾지 못했다고 밝히고 이름을 확인하라고 안내하라. ${기능있음} ${이유금지}`)
    case '대상다수':
      return 없음(`${버튼없음} 대상이 ${판정.총건수}건이라 한 건으로 좁혀지지 않았다.`
        + ` 그 건수를 밝히고 어느 것인지 알려달라고 안내하라. ${기능있음}`)
    case '전제불충족':
      return 없음(`${버튼없음} 요청한 "${판정.행동라벨}"은 ${판정.대상표기}의 현재 상태에서는 할 수 없다.`
        + ` 대상을 밝히고 그 사실만 전하라. ${기능있음} ${이유금지}`)
    case '값형식':
      // 무엇이 잘못됐는지를 앱이 안다. "지원하지 않는다"로 뭉개면 사용자는 되는 일을 안 되는 걸로 배운다.
      // 닫힌 칸이면 **무엇을 넣을 수 있는지**까지 말한다. 형식만 말하고 목록을 안 주면 또 찍어야 한다.
      return 없음(판정.선택지
        ? `${버튼없음} "${판정.값}"은(는) ${판정.필드라벨}에 넣을 수 없다 — 고를 수 있는 것은 ${판정.선택지} 뿐이다.`
        + ` 그 목록을 그대로 보여주고 하나를 고르게 하라. ${기능있음} ${이유금지}`
        : `${버튼없음} "${판정.값}"은(는) ${판정.필드라벨}에 넣을 수 없다 — ${판정.타입}만 받는 칸이다.`
          + ` 그 사실을 밝히고 ${판정.타입}로 다시 말해달라고 안내하라. ${기능있음} ${이유금지}`)
    case '후보제시':
      return {
        버튼s: 판정.버튼s,
        참조: `\n\n[대상 후보] ${판정.버튼s.map(b => b.label).join(' / ')}`,
        지시: `대상이 ${판정.총건수}건이라 확정되지 않았다. 후보의 이름을 그대로 나열해 어느 것인지 되물어라.`
          + ' 후보를 빼놓고 "선택해 주세요"라고만 하지 마라.\n'
          + `후보별 버튼은 앱이 답변 아래에 붙인다. 네가 버튼을 글로 그리지 마라. ${실행주체}`
      }
    case '선택함':
      // 이미 끝난 일이라 `실행주체`("누르는 사람은 사용자다")를 붙이지 않는다 — 여기서는 거짓이다.
      return {
        버튼s: [],
        참조: `\n\n[연 대상] ${판정.대상표기}`,
        지시: `앱이 "${판정.대상표기}"을(를) 화면에 이미 열었다. 그 이름을 그대로 밝히고 열었다고 과거형으로 말하라.\n`
          + (판정.이동 ? `${판정.화면표기} 화면으로 옮겨서 열었다. 화면이 바뀐 것도 같이 밝혀라.\n` : '')
          // 탭은 **앱이 실제로 연 것만** 적힌다(없는 묶음은 위에서 잘린다). 비었으면 한 줄이 통째로 빠지므로
          // 답변이 열지 않은 묶음을 열었다고 말할 자리가 없다.
          + (판정.탭표기 ? `그 행의 "${판정.탭표기}" 묶음을 펼친 채로 열었다. 그것도 한 마디로 밝혀라.\n` : '')
          + `${버튼없음} 누르라고도, 열어주겠다고도 하지 마라 — 이미 끝난 일이다.`
      }
    case '선택안내':
      return {
        버튼s: [],
        참조: '',
        지시: `대상이 ${판정.총건수}건이라 한 건으로 좁혀지지 않았다. 그 건수를 밝히고,`
          + ' 답변 아래 명단에서 이름을 누르면 그 항목이 화면에 열린다고 안내하라.\n'
          + '누르지 않고 이름을 말하거나 "두 번째 거"처럼 순서로 말해도 열린다는 것도 한 문장으로 덧붙여라.\n'
          + `명단 말고 다른 버튼이나 조치는 이번 답변에 없다. ${기능있음}`
      }
    case '생성불가':
      return 없음(`${버튼없음} ${판정.소스명 || '이 목록'}에는 새 항목을 추가할 수 없다고만 밝혀라. ${이유금지}`)
    case '생성준비': {
      // 이름을 못 정한 턴에 "예를 들면 강아지 같은" 을 덧붙이는 걸 막는다 — 그 순간 사용자는
      // 자기가 말한 적 없는 이름을 자기 것으로 읽는다.
      const 이름안내 = 판정.이름s.length
        ? `무엇을 만드는 버튼인지 이름(${판정.이름s.map(x => `"${x}"`).join(', ')})을 그대로 밝혀라.`
        : '이름은 정해지지 않았다. 이름 없는 빈 줄이 생긴다고 알려라. 이름을 지어내지 마라.'
      return {
        버튼s: 판정.버튼s,
        참조: `\n\n[추가할 곳] ${판정.소스명}\n[만들 줄 수] ${판정.개수}\n[추가할 이름] ${판정.이름s.join(', ') || '(없음)'}`,
        지시: `답변 아래에 ${판정.소스명} 목록에 빈 줄 ${판정.개수}개를 놓는 버튼이 붙는다.\n${이름안내}\n`
          + '누르면 그 화면이 열리고 빈 줄이 목록 맨 위에 생긴다.'
          + ' **거기서 값을 채우고 저장을 눌러야 실제로 저장된다** — 그 두 단계를 한 문장으로 알려라.\n'
          + `아직 아무것도 만들어지지 않았다. 추가됐다고 말하지 마라. ${실행주체}`
      }
    }
    case '준비됨': {
      const 라벨s = 판정.버튼s.map(b => b.label).join(' | ')
      // 값이 붙은 턴은 그 값이 요점이다. 다만 요점의 종류가 둘로 갈린다 —
      // 바꾸는 턴은 "무엇이 무엇으로"이고, 남기는 턴은 "준 내용이 다듬어지지 않고 그대로 쓰인다"이다.
      const 값안내 = 판정.수정표기
        ? `이번 턴은 값을 바꾸는 턴이다. ${판정.수정표기}\n`
        + '바뀌기 전 값과 바뀔 값을 그대로 밝혀라. 아직 바뀌지 않았다 — 바꿨다고 말하지 마라.\n'
        + '버튼을 누르면 그 값이 채워진 수정 폼이 뜨고, 저장은 사용자가 누른다. 그 사실을 한 문장으로 덧붙여라.\n'
        : 판정.값
          ? `사용자가 남길 내용을 이미 말했다: ${판정.값}\n그 내용을 그대로 옮기고 다듬거나 바꿔 쓰지 마라. 버튼을 누르면 그대로 쓰인다.\n`
          : ''
      // 되돌릴 수 없는 행동은 그 사실이 이번 답변의 요점이다. 아직 아무 일도 일어나지 않았다는 것,
      // 누르면 한 번 더 묻는다는 것, 그리고 대신 다른 걸 하라고 권하지 말 것.
      const 위험안내 = 판정.위험
        ? '되돌릴 수 없는 일이다. 아직 아무 일도 일어나지 않았고, 버튼을 누르면 한 번 더 확인을 묻는다.\n'
        + '그 사실만 전하고 대신 무엇을 하라고 권하지 마라. 이미 했다고 말하지 마라.\n'
        : ''
      return {
        버튼s: 판정.버튼s,
        참조: `\n\n[행동 대상] ${판정.대상표기}\n[가능한 행동] ${라벨s}`
          + (판정.수정표기 ? `\n[바꿀 값] ${판정.수정표기}` : 판정.값 ? `\n[행동에 쓸 내용] ${판정.값}` : ''),
        지시: `답변 아래에 실행 버튼이 붙는다: ${라벨s}.\n`
          + `누구에게 붙는 버튼인지 "${판정.대상표기}"를 그대로 밝혀라. 대상을 빼놓고 버튼만 언급하지 마라.\n`
          + 값안내
          + 위험안내
          + (판정.주의 ? `${판정.주의} 그 사실을 맨 앞에 한 문장으로 알려라.\n` : '')
          + '이 버튼으로 실행할 수 있다고 한 문장만 덧붙여라. 여기 없는 행동은 언급하지 마라.\n'
          // 대상이 한 건으로 확정된 턴이라 조회 건수는 할 말이 아니다. 그냥 두면 참조에 적힌
          // "결과 총 1건"을 엉뚱한 것의 건수로 옮겨 적는다(실측: "기록은 총 1건 확인됩니다").
          + '조회 건수는 말하지 마라. 이번 턴에 셀 것은 없다.\n'
          + 실행주체
      }
    }
  }
}

const { messages, input, status, hasConversation, send, reset } = useChatbot({
  system: 시스템프롬프트,
  level: 'lite',
  welcome: '안녕하세요. v2 AI도우미입니다.',
  // 질문 → (LLM) 조회 계획 → 앱이 실행 → 결과만 반환. 행 데이터는 LLM에 가지 않는다.
  context: async (q) => {
    // 한 번만 읽어 계획과 판정이 같은 화면을 본다. 그 사이 사용자가 선택을 바꿀 수도 있다.
    const 화면 = get화면대상()
    const 화면키 = 화면 ? `${화면.source}:${화면.id}` : ''
    // 직전 턴이 본 것과 다르면 그 사이에 사용자가 고른 것이다 — **선택이 없다가 생긴 경우도 포함한다**
    // (목록을 훑고 나서 행을 처음 클릭한 흐름이 정확히 이것이다).
    // 첫 턴에는 직전 항목이 없어 이 값이 무엇이든 계획이 달라지지 않는다.
    const 방금선택 = !!화면키 && 화면키 !== 이전화면키.value
    이전화면키.value = 화면키

    // 지금 화면에 걸린 조회 조건. **도우미가 기억하는 게 아니라 주소가 들고 있는 것을 읽는다** —
    // 그래서 사용자가 손으로 건 필터든 도우미가 건 필터든 같은 자격으로 이어받아진다.
    // 화면이 이 소스를 안 그리고 있으면(다른 탭) 이어받을 것도 없다.
    const 화면소스 = (props.sources ?? []).find(s => s.path && s.path === route.path)
    const 화면조건 = 화면소스
      ? { source: 화면소스.key, 필터s: 화면소스.쿼리필터s(route.query) }
      : null

    // 직전 항목은 아래에서 덮어쓰므로 미리 잡아둔다 — 판정이 "대상이 바뀌었는지"를 보려면 필요하다.
    const 직전 = 직전항목s.value
    const r = await 계획조회V2(props.sources ?? [], q, 직전, 화면, 방금선택, 화면조건)
    직전항목s.value = r.항목s

    const 판정 = 판정하기(r, 화면, 직전)
    const 행동 = 서술(판정)

    // 화면을 좁혔으면 답변 아래에 명단을 또 그리지 않는다 — 같은 목록이 두 군데 뜬다.
    // 도우미가 그리는 명단은 **화면이 없을 때의 대비책**이지 기본이 아니다.
    const 화면조회 = do화면조회(r)
    // 후보 버튼이 붙는 턴은 그 버튼이 곧 명단이다. 둘 다 붙이면 같은 이름을 두 번 늘어놓게 된다.
    const 명단 = 화면조회 || 판정.kind === '후보제시' ? [] : 명단s(r.항목s, r.source)

    const 지시s = [
      // 앱이 명단을 그리는 턴에 LLM까지 이름을 늘어놓으면 같은 걸 두 번 보게 된다.
      // "표로 붙인다"고 알려주면 자기가 마크다운 표를 그린다(실측) — 무엇을 하지 말지를 적는다.
      화면조회
        ? `조회 결과 ${r.총건수}건이 **화면 목록에 그대로 걸렸다**(사용자가 눈앞에서 보고 있다).`
        + ' 이름을 나열하지 마라. 마크다운 표도 목록도 만들지 마라.'
        // "좁혀졌다"를 단정하게 두면 조건을 **푼** 턴에도 좁혔다고 말한다(실측: 축이 하나 풀렸는데
        // "좁혀져 있습니다"라고 답했다). 참조에 적힌 조건을 옮기게만 하고 판단은 시키지 않는다.
        + ' 참조의 조건(...)에 적힌 것이 지금 목록에 걸린 조건 전부다. 그것과 건수를 한두 문장으로 밝혀라.'
        + ' 조건이 "없음"이면 거르지 않은 전체를 보고 있다고 알려라.'
        : 명단.length
          ? `조회된 ${r.총건수}건은 앱이 답변 아래에 직접 그린다. 이름을 나열하지 마라.`
          + ' 마크다운 표(| 로 칸을 나눈 것)도 목록도 만들지 마라. 건수와 눈에 띄는 점만 한두 문장으로 짚어라.'
          : '',
      행동.지시
    ].filter(Boolean)

    return {
      text: r.context + 행동.참조,
      지시: 지시s.join('\n'),
      actions: 행동.버튼s,
      metadata: { 명단, 총건수: r.총건수, 제목: r.source?.label ?? '' }
    }
  }
})

/**
 * 입력창에 커서를 돌려놓는다. 엔터 제출은 textarea 가 포커스를 쥐고 있어 손댈 필요가 없고,
 * 포커스가 다른 곳(제안·초기화 버튼)으로 가는 경로만 되돌린다.
 */
const promptRef = useTemplateRef<{ textareaRef?: HTMLTextAreaElement }>('promptRef')
function focusPrompt() {
  void nextTick(() => promptRef.value?.textareaRef?.focus())
}

/**
 * 엔터 전송은 UChatPrompt 내부 가드(useIMEGuard)에 맡기지 않는다.
 * 그쪽은 한글 조합 중 엔터를 버려서 늘 두 번 쳐야 했다. :submit-on-enter="false" 로 비켜세우고
 * 조합이 끝난 뒤 보내는 우리 핸들러를 textarea 에 흘려보낸다.
 */
const { onKeydown: onPromptKeydown, onCompositionEnd: onPromptCompositionEnd } = useImeEnterSubmit(() => send())

function askSuggestion(text: string) {
  focusPrompt()
  void send(text)
}

function resetAndFocus() {
  reset()
  직전항목s.value = []
  이전화면키.value = ''
  focusPrompt()
}

/**
 * 도크에 자기를 신고한다. 도크는 무엇이 들어오는지 모르고(레이아웃이 조립한다),
 * 이 pane 은 자기 아이콘·라벨·헤더 액션만 넘긴다 — 그래서 `sources` 가 도크를 거치지 않는다.
 *
 * id 가 'aiV2' 인 이유: 기존 도우미와 한 도크에 같이 올라가도 탭이 겹치지 않아야 한다.
 */
const { isActive, open, 한줄, 접기, 펼치기 } = useDockPane({
  id: 'aiV2',
  icon: 'i-lucide-bot',
  label: 'AI도우미(v2)',
  // 접혔을 때 마지막 답변과 실행 버튼을 스스로 그린다(아래 `한줄글`·`한줄버튼s`).
  한줄있음: true,
  actions: [{ icon: 'i-lucide-rotate-ccw', label: '대화 초기화', onClick: () => resetAndFocus() }]
})

/**
 * 한 줄에 남기는 것: **마지막 답변 한 줄 + 그 답변에 붙은 실행 버튼.**
 * 둘 다 이미 앱이 쥐고 있는 것이라 도크로 넘길 필요가 없다 — 무엇을 남길지는 pane 만 안다.
 */
const 마지막답변 = computed(() => {
  const ms = messages.value
  for (let i = ms.length - 1; i >= 0; i--) {
    if (ms[i]!.role === 'assistant') return ms[i]!
  }
  return null
})

/** 기다리는 중에는 지난 답변을 그대로 두지 않는다 — 방금 시킨 것에 대한 답으로 읽힌다. */
const 한줄글 = computed(() =>
  status.value === 'submitted'
    ? '생각하는 중…'
    : (마지막답변.value?.parts ?? []).map(p => p.text).join('').trim()
)

/** 버튼도 같이 감춘다. 지난 턴의 버튼이 새 질문의 답처럼 남아 있으면 엉뚱한 걸 누르게 된다. */
const 한줄버튼s = computed<ChatAction[]>(() =>
  status.value === 'submitted' ? [] : (마지막답변.value?.actions ?? [])
)

const 스크롤ref = useTemplateRef<HTMLElement>('스크롤ref')

/**
 * 한 줄을 눌러 **이어 말하기**.
 *
 * **펼치기보다 포커스가 먼저다.** 모바일 브라우저는 키보드를 사용자 제스처의 콜 스택 안에서만
 * 올려 주는데, 상태를 먼저 뒤집으면 DOM 갱신을 기다리는 사이에 활성화가 끊긴다.
 * 채팅을 0 높이로만 접어 두는 이유도 이것이다 — 접힌 입력창은 여전히 포커스를 받는다.
 *
 * 펼친 뒤 바닥으로 되감는 건 0 높이 동안 `scrollTop` 이 0으로 풀리기 때문이다.
 */
function 이어말하기() {
  promptRef.value?.textareaRef?.focus()
  펼치기()
  void nextTick(() => {
    const el = 스크롤ref.value
    if (el) el.scrollTop = el.scrollHeight
  })
}

/** offcanvas 라 계속 마운트돼 있어서 UChatPrompt 의 autofocus(onMounted)는 열 때 다시 안 걸린다. */
watch(() => open.value && isActive.value && !한줄.value, (v) => {
  if (v) focusPrompt()
})

/** 전체 찾기(⌘K)의 「AI도우미에게 묻기」가 놓고 간 질문. 꺼내 보내고 칸을 비운다(`useAskAI`). */
const askAI = useAskAI()
watch(askAI.대기질문, (q) => {
  if (q) askSuggestion(askAI.take())
}, { immediate: true })
</script>

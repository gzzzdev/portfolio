<template>
  <!--
    도크의 AI도우미 pane. 껍데기(패널·헤더·전환기)는 `lDock` 이 소유한다.
    이 컴포넌트는 대화 내용물만 그린다 — 메시징·메일쓰기가 같은 자리에 들어와도 여기는 손대지 않는다.

    `v-show`: 다른 탭으로 옮겨도 언마운트되지 않는다. 탭이 "열려 있는 작업"을 뜻하므로
    돌아왔을 때 대화가 비어 있으면 안 된다.
  -->
  <div
    v-show="isActive"
    class="h-full min-h-0 flex flex-col"
  >
    <UChatPalette class="grow">
      <div class="h-full overflow-y-auto py-2">
        <div
          v-if="!hasConversation"
          class="space-y-2"
        >
          <p class="text-sm font-semibold text-highlighted">
            이렇게 물어보세요
          </p>
          <!-- UButton 이 inline-flex 라 space-y 만으로는 한 줄에 붙는다. flex-col 로 세로 스택. -->
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

        <!-- compact: 좁은 패널이라 아바타(size-8→5)와 메시지 간격을 줄인다 -->
        <UChatMessages
          v-else
          compact
          :messages="messages"
          :status="status"
          :assistant="{
            avatar: { icon: 'i-lucide-bot', size: 'sm' },
            // 기본 테마의 actions 는 복사·재시도 같은 아이콘용이라 호버 전엔 opacity-0 이고
            // absolute 라 한 줄 높이만 차지한다. 여기 붙는 건 '회원증 출력' 같은 실행 버튼이라
            // 호버해야 보이면 있는 줄도 모른다 — 답변은 '버튼을 누르라'고 말하는데 화면엔 없다.
            // 항상 보이게 하고, 흐름 안에 놓아 여러 줄로 접히게 한다.
            ui: { actions: 'opacity-100 [@media(hover:hover)]:opacity-100 static mt-2 flex-wrap' }
          }"
          :user="{ avatar: { icon: 'i-lucide-user' }, side: 'right' }"
        >
          <!--
            답변 본문 + 앱이 그리는 명단.

            `metadata`는 `UChatMessage`가 선언한 prop 중 앱이 자유롭게 쓸 수 있는 유일한 자리다
            (`messageProps`에 실려 이 슬롯까지 그대로 내려온다). 컴포넌트를 개조하지 않고
            구조화된 값을 넘기는 경로가 이것뿐이라 여기를 쓴다.

            본문 렌더는 기본 구현과 같다 — 슬롯을 덮는 순간 기본이 사라지므로 직접 옮겨 적었다.
            사용자 메시지에도 이 슬롯이 걸리지만 `metadata`가 없어 본문만 나온다.
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
                NuxtLink 를 문자열로 지목하면(`:is="'NuxtLink'"`) 링크가 만들어지지 않는다(실측: a 태그가 0개).
                어차피 새 탭으로 여는 링크라 라우터를 태울 이유가 없어 소박하게 a 로 낸다 —
                `전문링크s` 버튼이 `target="_blank"` 로 하던 것과 같은 이동이다.
              -->
              <component
                :is="row.to ? 'a' : 'div'"
                v-for="(row, i) in metadata.명단"
                :key="i"
                :href="row.to"
                :target="row.to ? '_blank' : undefined"
                :rel="row.to ? 'noopener' : undefined"
                class="flex w-full items-center gap-1.5 px-2 py-1.5 text-xs"
                :class="row.to ? 'hover:bg-elevated' : ''"
              >
                <!--
                  `sub` 의 길이는 모델마다 다르다 — 회원은 `00♂(1005)` 같은 식별자지만
                  자료는 요약 한 문단이다. 그래서 `sub` 에 자리를 내주면 제목이 통째로 밀려난다(실측됨).
                  제목이 남는 폭을 먼저 가져가고, `sub` 는 정해진 몫 안에서만 보이게 한다.
                -->
                <span class="min-w-0 flex-1 truncate font-medium text-highlighted">{{ row.label }}</span>
                <span
                  v-if="row.sub"
                  class="max-w-[35%] shrink-0 truncate text-muted"
                >{{ row.sub }}</span>
                <UBadge
                  v-for="(badge, j) in row.뱃지s"
                  :key="j"
                  class="shrink-0"
                  size="sm"
                  :color="badge.color"
                  :icon="badge.icon"
                  :label="badge.label"
                />
              </component>

              <!-- 잘렸으면 잘렸다고 적는다. 화면에 보이는 수를 전체인 것처럼 두면 앱이 거짓말을 한다. -->
              <p
                v-if="(metadata.총건수 ?? 0) > metadata.명단.length"
                class="px-2 py-1.5 text-xs text-muted"
              >
                총 {{ metadata.총건수 }}건 중 {{ metadata.명단.length }}건 표시
              </p>
            </div>
          </template>

          <!--
            기본 actions 렌더러는 `:label="undefined"`로 덮어써 아이콘+툴팁만 남긴다.
            "등급증출력" 같은 실행 버튼은 라벨이 안 보이면 무슨 일이 일어날지 알 수 없으므로 직접 그린다.
          -->
          <template #actions="{ actions }">
            <div class="flex flex-wrap gap-1">
              <UButton
                v-for="(action, i) in (actions ?? [])"
                :key="i"
                size="xs"
                :color="action.color"
                :variant="action.variant ?? 'outline'"
                :icon="action.icon"
                :label="action.label"
                :to="action.to"
                :target="action.target"
                class="whitespace-normal text-left"
                @click="action.onClick?.($event)"
              />
            </div>
          </template>
        </UChatMessages>
      </div>

      <!-- ChatPalette의 prompt 슬롯이 border-t/rounded를 자식에 머지하므로 래퍼 div를 두지 않는다 -->
      <template #prompt>
        <!--
          응답 대기 중에도 disabled 를 걸지 않는다.
          textarea 가 disabled 되면 브라우저가 포커스를 떼버려서 엔터 직후 커서가 사라진다.
          중복 전송은 useChatbot.send 의 status 가드가 막고, 진행 상태는 UChatPromptSubmit 이 보여준다.
        -->
        <UChatPrompt
          ref="promptRef"
          v-model="input"
          placeholder="무엇이든 물어보세요."
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
import type { AiSource } from '~utils/ai/source'
import { 계획조회, type i직전항목, type PlannerResult } from '~utils/ai/planner'
import { get화면대상, type i화면대상 } from '~utils/ai/화면문맥'
import { get작업대상, 작업블록, type i작업대상 } from '~utils/ai/작업문맥'
import type { Plan } from '~utils/ai/plan'
import type { ChatAction } from '~/composables/useChatbot'
import { get행동버튼s, type i행동버튼 } from '~/components/view/1'
import { set행동초안, type i행동초안 } from '~utils/ai/초안'

// 이 컴포넌트는 어떤 모델도 import하지 않는다. 무슨 데이터를 볼지는 전적으로 주입받는다.
const props = defineProps<{ sources?: AiSource[] }>()

const 시스템프롬프트 = `너는 마장터 운영센터 AI도우미다.

응답 원칙:
- 마크다운 강조(**)를 쓰지 마라.
- 기본 답변은 3~5문장으로 간결하게 작성한다.
- 수치·비교·추세를 물으면 핵심 지표를 먼저 제시하고 짧은 해석을 덧붙인다.
- 모르는 것은 추정하지 말고 "확인 필요"라고 명시한다.
- 질문이 모호하면 바로 답하지 말고 필요한 기준을 1~2개 먼저 확인한다.

지어내기 금지 (가장 중요):
- 참조 데이터에 없는 자료·기능·행동은 존재하지 않는다. 그럴듯해 보여도 만들어 내지 마라.
  사용자가 요청한 일이 참조 데이터에 없으면 "지원하지 않는다" 또는 "확인 필요"라고 답한다.
- 버튼은 앱이 답변 아래에 붙인다. 대괄호나 링크 모양으로 버튼을 본문에 그리지 마라.
  "[이번 답변 지시]"가 버튼을 언급하지 않았다면 이번 답변에는 버튼이 없다. 버튼 얘기를 꺼내지 마라.
- 대괄호로 묶인 제목([회원], [가능한 행동] 등)은 앱 내부 구분자다. 답변 문장에 그대로 옮기지 마라.
- URL을 직접 쓰지 마라.

답변 톤:
- 공손하고 전문적인 한국어.
- 운영자가 바로 실행할 수 있게 핵심을 먼저 제시한다.
- 불필요한 수식어와 장황한 배경설명은 줄인다.
`

/**
 * 첫 화면의 예시 질문. 넷이 각각 **다른 경로**를 밟도록 골랐다 —
 * 하나만 눌러봐도 이 챗봇이 뭘 하는지 알게 하는 게 목적이지, 질문 예시를 나열하는 게 아니다.
 *
 *   1) 필터 축 하나로 집계          → intent=count
 *   2) 축 두 개 AND + 명단          → intent=list
 *   3) 자료 본문 발췌 + 전문 보기 링크 → intent=read
 *   4) 행동 지목 → 대상 되묻기 + 후보 버튼 (부수효과가 있는 유일한 경로)
 *
 * **반드시 실제 데이터에 걸리는 문장이어야 한다.** 이전 예시 셋은 전부 헛돌았다 —
 * "정회원"은 없는 역할이었고(운영자·담당자·학습자·준회원·비회원), "인대 손상"은
 * 자료가 다른 주제로 교체된 뒤 남은 잔해였다. 예시가 0건을 물으면 첫인상이 "얘 아무것도 모르네"가 된다.
 *
 * 1·2·4는 `i역할seed` 등 코드에 박힌 라벨을 쓰므로 데이터가 바뀌어도 버틴다.
 * 3만 `resources` 표(supabase)의 주제에 매여 있으니, 자료를 갈아끼우면 여기도 같이 고칠 것.
 */
const suggestions = [
  '담당자는 몇 명이야?',
  '20대 남자 회원 명단 보여줘',
  '총회 전자투표는 어떻게 해?',
  '준회원 회원증 출력해줘'
]

/**
 * 직전 턴이 프롬프트에 올린 항목들.
 *
 * 계획 수립 호출은 대화 기록을 안 받는다(현재 질문 한 줄뿐). 그래서 "그거 전문 보여줘"의
 * "그거"를 planner가 알 방법이 이것뿐이다. 기록 전체가 아니라 id·제목만 넘기므로 크기가 작다.
 */
// shallowRef: 항목에 모델 인스턴스(`row`)가 딸려 있다. 깊은 반응형으로 감싸면 모델이 프록시로
// 한 겹 더 싸여 저장소가 쥐고 있는 원본과 identity 가 어긋난다. 통째로 갈아끼우기만 하므로 얕아도 충분하다.
const 직전항목s = shallowRef<i직전항목[]>([])

/**
 * 답변 아래에 붙는 "전문 보기" 버튼.
 *
 * 예산(8,000자)은 LLM 컨텍스트의 제약일 뿐 사람의 제약이 아니다. 발췌만 보고 끝나지 않도록
 * 앱이 링크를 만든다 — LLM에게 URL을 쓰게 하면 id를 지어내고 토큰도 든다.
 * 본문이 있는 행만 대상이라 회원·등급 결과에는 붙지 않는다.
 */
/**
 * 답변 아래에 앱이 직접 그리는 명단.
 *
 * 지금까지 명단은 LLM이 참조 데이터의 표를 읽고 산문으로 옮겨 적었다. 그런데 그 값들은
 * **앱이 이미 정확히 쥐고 있다** — 건수를 앱이 세고 URL을 앱이 만드는 것과 같은 자리다.
 * 옮겨 적게 두면 토큰을 쓰면서 틀릴 여지만 생긴다(실측: `잠자는중=false`를 보고
 * "현재 활발히 활동 중인 상태입니다"라고 덧붙였다. 앱이 그렸으면 나올 수 없는 문장이다).
 *
 * 뱃지는 `i실행항목.뱃지s`가 실어온 모델의 `badges`다. 이 컴포넌트는 어떤 모델도 모르므로
 * 무엇을 뱃지로 낼지는 여전히 모델이 정한다 — 목록5 카드에 뜨는 것과 같은 값이다.
 *
 * 한 건이면 그리지 않는다. 그건 답변 문장과 (있다면) 행동 버튼이 이미 이름을 밝히므로
 * 명단을 또 붙이면 같은 걸 세 번 보게 된다.
 */
const 명단최대 = 30
/**
 * `sub`를 한 줄에 함께 실어도 되는 길이.
 *
 * `sub`의 성격이 모델마다 다르다 — 회원은 `00♂(1005)` 같은 식별자(동명이인을 가르므로 꼭 필요하다)지만,
 * 자료는 요약 한 문단이다. 길이로 가르면 둘 다 맞다: 짧은 건 식별자니 싣고, 긴 건 요약이니
 * 좁은 패널에서 제목 자리를 뺏게 두지 않는다(실측: 제목이 "동화(中割…"까지 잘렸다).
 */
const sub상한 = 20
function 명단s(항목s: i직전항목[]) {
  if (항목s.length < 2) return []
  return 항목s.slice(0, 명단최대).map(x => ({
    label: x.label,
    sub: x.sub.length <= sub상한 ? x.sub : '',
    뱃지s: x.뱃지s,
    // 열어볼 데가 있는 행만 링크. 주소는 소스가 만들어 실어 보낸다(`sources.ts`의 `링크`) —
    // 회원처럼 열 데가 없거나 비공개 글이면 비어 있고, 그런 행은 표시만 한다.
    ...(x.to ? { to: x.to } : {})
  }))
}

const 전문링크최대 = 5
function 전문링크s(항목s: i직전항목[]) {
  return 항목s
    .filter(x => x.has본문 && x.to)
    .slice(0, 전문링크최대)
    .map(x => ({
      label: x.label,
      icon: 'i-lucide-file-text',
      to: x.to!,
      target: '_blank',
      color: 'neutral',
      variant: 'outline',
      size: 'xs'
    }))
}

/**
 * 답변 아래에 붙는 실행 버튼(`do*`)과, 그 상황을 답변 LLM에게 알리는 블록.
 *
 * LLM은 이 버튼을 만들지도, 누르지도 않는다. 계획이 행동을 **지목**할 수는 있지만(`plan.행동`)
 * 그건 희망사항이고, 실제로 걸리는지는 여기서 앱이 판정한다. 실행 시점은 언제나 사용자의 클릭이다.
 * 전문 링크를 앱이 만드는 것과 같은 논리 — 다만 이쪽은 부수효과가 있으니 승인이 클릭이다.
 *
 * 안전은 세 겹으로 걸려 있다:
 * 1. `행동키s` 화이트리스트(`sources.ts`) — 개발용 do로그·do초안 등은 enum에조차 안 들어간다.
 * 2. `show`(대개 ComputedRef) — 이미 완납한 회원에게 "회비 납부"가 안 뜬다.
 * 3. `do*` 자신의 전제조건 검사 — 미저장 행이면 스스로 useAlert로 거절한다.
 */
const 행동최대 = 4
/** 후보를 버튼으로 늘어놓을 수 있는 한계. 이보다 많으면 고르는 게 아니라 조건을 좁혀야 한다. */
const 후보최대 = 5

/**
 * `참조`는 사실(참조 데이터에 붙는다), `지시`는 이번 턴에만 유효한 답변 지침.
 * 둘을 나누는 이유: 지시를 고정 프롬프트에 두면 lite가 "이번에도 그게 있다"고 가정해 지어낸다.
 */
interface 행동결과 { 버튼s: ChatAction[], 참조: string, 지시: string }

/**
 * 행동 판정. 왜 문자열 하나가 아니라 종류인가.
 *
 * 실패 원인은 넷이다 — 그런 기능이 없다 / 대상이 안 정해졌다 / 지금은 못 한다 / 이번 턴은 행동이 아니다.
 * 이걸 전부 "지원하지 않습니다"로 뭉개면 사용자는 **있는 기능을 없다고 학습한다**(실측됨: 회원증출력).
 * "없다"는 가장 비싼 오답이다 — 사용자가 다시 시도하지 않게 만들기 때문이다.
 *
 * 그래서 판정은 앱이 종류로 내리고(무엇이 참인지는 앱만 안다), LLM은 그 종류에 맞는 문장만 쓴다.
 */
type i판정
  /** 이번 턴은 행동 얘기가 아니었다. */
  = { kind: '해당없음' }
  /** 그런 행동이 이 데이터에 없다. **유일하게** "지원하지 않는다"고 말해도 되는 경우. */
    | { kind: '어휘밖' }
  /** 조건에 걸린 행이 0건. */
    | { kind: '대상없음' }
  /** N건이라 확정되지 않았고, 후보를 버튼으로 늘어놓기엔 많다. */
    | { kind: '대상다수', 총건수: number }
  /** N건이지만 후보마다 버튼을 줄 수 있다. */
    | { kind: '후보제시', 총건수: number, 버튼s: ChatAction[] }
  /** 행동은 있는데 이 대상의 지금 상태에서는 안 된다(`show=false`). */
    | { kind: '전제불충족', 행동라벨: string, 대상표기: string }
    /**
     * 버튼을 붙일 수 있다.
     *
     * `대상표기`가 딸려 있는 이유: 부수효과가 있는 버튼인데 "누구에게"가 빠지면
     * 사용자는 방금까지 얘기하던 사람이라고 읽는다. 실측된 사고가 그거였다 —
     * 대화는 김모(1001)를 세웠는데 계획이 화면 선택(노상준 1007)을 지목했고,
     * 답변이 이름을 안 밝혀서 사용자는 누른 뒤 모달을 보고서야 알았다.
     *
     * `주의`는 그 어긋남을 앱이 미리 잡아 적어두는 자리다. 지침으로 우선순위를 줘도
     * lite가 어길 수 있고, 어겼는지는 **앱만** 안다(직전 턴과 화면 둘 다 앱이 쥐고 있다).
     */
    | {
      kind: '준비됨'
      버튼s: ChatAction[]
      대상표기: string
      주의: string
      /** 초안이 딸린 행동이면 그 제목. 답변이 "빈 폼"과 "채워진 폼"을 다르게 말해야 하기 때문이다. */
      초안제목?: string
    }
    /**
     * 지금 **편집 중인 화면**에 버튼을 붙일 수 있다.
     *
     * '준비됨'과 가르는 이유는 답변이 해야 할 말이 다르기 때문이다. 저쪽은 "누구에게 걸리는
     * 버튼인지"를 밝혀야 하지만(엉뚱한 사람에게 부수효과가 걸리는 게 그 자리의 사고다),
     * 이쪽 대상은 사용자가 지금 보고 있는 화면이라 헷갈릴 여지가 없다. 대신 **무엇이 바뀌는지**를
     * 말해야 한다 — 눌리는 순간 화면의 글이 바뀌고, 그건 저장이 아니다.
     */
    | { kind: '작업준비됨', 버튼s: ChatAction[], 화면: string, 라벨s: string }

/** 실행 버튼이 하나도 없는 턴. 침묵하지 않고 "없다"고 못 박는다 — 침묵이 곧 지어내기의 빌미다. */
const 버튼없음 = '이번 답변에는 실행 버튼이 없다. 버튼이나 실행 가능한 조치를 언급하지 마라.'

/**
 * 버튼이 붙는 모든 갈래에 공통으로 붙인다.
 * 이 문장이 없으면 "선택되면 바로 작업을 진행하겠습니다"처럼 자기가 실행하는 것처럼 말한다(실측됨).
 */
const 실행주체 = '네가 실행했다고도, 실행하겠다고도, 진행하겠다고도 말하지 마라 — 누르는 사람은 사용자다.'
/** 못 하는 이유를 물으면 lite는 "내부 지침에 따라" 같은 근거를 만들어 낸다(실측됨). */
const 이유금지 = '왜 안 되는지 이유를 지어내지 마라.'
/**
 * 대상이 안 정해졌을 뿐인 갈래에 반드시 붙인다.
 * 이 한 줄이 없으면 lite가 "버튼 없음"을 곧장 "기능 없음"으로 옮겨 적는다 — 이번 버그가 정확히 그거였다.
 */
const 기능있음 = '기능이 없어서가 아니다. 지원하지 않는다고 말하지 마라.'

/**
 * 후보가 몇 안 될 때, 후보마다 "이 사람에게 그 행동" 버튼을 만든다.
 *
 * 일괄 실행을 여는 게 아니다 — 버튼 하나는 여전히 한 건이고, 어느 것을 실행할지는 사용자가 고른다.
 * `총건수`가 `후보최대`를 넘으면 호출되지 않는다.
 */
/**
 * 행동 버튼의 onClick — 초안을 얹고 `do*`를 부른다.
 *
 * 인자로 못 넘기는 이유는 `i행동버튼.onClick`이 무인자라서다(`~utils/ai/초안` 참고).
 * **누를 때** 얹는 게 요점이다. 계획이 나오자마자 얹어두면, 누르지 않고 지나간 초안이 남아 있다가
 * 나중에 사용자가 손으로 연 글쓰기 화면에 튀어나온다.
 * 초안 없는 행동을 누르면 `null`이 얹히므로, 지난 턴의 초안이 딸려 들어갈 일도 없다.
 */
function 실행핸들러(b: i행동버튼, 초안: Partial<i행동초안> | null | undefined) {
  return () => {
    set행동초안(초안 ?? null)
    void b.onClick()
  }
}

function 후보버튼s(항목s: i직전항목[], 지목: string, 허용: string[], 초안: Partial<i행동초안> | null | undefined): ChatAction[] {
  return 항목s.flatMap((x) => {
    if (!x.row) return []
    const b = get행동버튼s(x.row)
      .find(b => b.key === 지목 && 허용.includes(b.key) && toValue(b.show) !== false)
    if (!b) return []
    return [{
      label: `${x.label}${x.sub ? ` ${x.sub}` : ''}`,
      icon: b.icon,
      color: 'primary',
      variant: 'soft',
      size: 'xs',
      onClick: 실행핸들러(b, 초안)
    } satisfies ChatAction]
  })
}

/**
 * 버튼이 걸린 대상이 "사용자가 생각하는 그 사람"이 아닐 수 있는 경우를 앱이 잡아낸다.
 *
 * 사용자는 두 군데를 보며 말한다 — 방금 나눈 대화와, 지금 화면에 띄운 것.
 * 그 둘과 실제 대상이 어긋나면 부수효과가 엉뚱한 행에 걸린다. 어긋났는지는 앱만 알 수 있으므로
 * 판정할 때 문장으로 적어두고, 답변이 그걸 **먼저** 말하게 한다.
 *
 * 직전 대화를 화면보다 먼저 본다. "걔"는 방금 세운 대상을 가리키지 화면을 가리키지 않는다.
 */
function 대상주의(대상: i직전항목, 화면: i화면대상 | null, 직전: i직전항목[]): string {
  const 표기 = (x: { label: string, sub: string }) => `${x.label}${x.sub ? ` ${x.sub}` : ''}`

  // 직전 턴이 대상을 딱 하나 세웠는데 이번 대상이 그게 아니다 — 가장 잘 어긋나는 자리다.
  const 이전 = 직전.length === 1 ? 직전[0] : undefined
  if (이전?.id && 대상.id && 이전.id !== 대상.id)
    return `직전 턴에 얘기하던 ${표기(이전)}이(가) 아니라 다른 사람이다.`

  // 화면에 열어둔 것과 다른 사람에게 버튼이 붙는 건 정상이다(화면을 보며 남을 조회할 수 있다).
  // 정상이지만 **말해줘야 하는** 정상이다 — 사용자는 화면을 보며 말하고 있기 때문이다.
  if (화면?.id && 대상.id && 화면.id !== 대상.id)
    return '사용자가 화면에 열어둔 사람이 아니다.'

  return ''
}

/**
 * 편집 중인 화면에 걸린 행동을 실행한다.
 *
 * 지시가 있으면 인자로 넘긴다. `i행동버튼.onClick`이 무인자라 초안은 우편함(`set행동초안`)을 거쳤지만,
 * 그건 **화면을 건너갈 때** 얘기다 — 여기서는 그 인스턴스를 지금 손에 쥐고 있으므로 그냥 부르면 된다.
 * 키는 화면이 신고한 화이트리스트(`i작업대상.행동s`)를 이미 통과했고 `show`도 봤다.
 */
function 작업실행(작업: i작업대상, b: i행동버튼, 지시: string) {
  return () => {
    const fn = (작업.row as Record<string, unknown>)[b.key]
    if (지시 && typeof fn === 'function') {
      void (fn as (v: string) => unknown).call(작업.row, 지시)
      return
    }
    void b.onClick()
  }
}

/**
 * 편집 중인 화면에 붙는 버튼. 조회 결과와 **다른 자리**에서 판정한다 —
 * 그 대상은 조회로 찾은 행이 아니라 화면이 신고한 것이고, 저장 전이라 조회에 잡히지도 않는다.
 * 조회가 0건이어도 성립한다는 게 이 갈래의 요점이다.
 */
function 작업판정(plan: Plan | null, 작업: i작업대상 | null): i판정 | null {
  const 키 = String(plan?.작업행동 ?? '').trim()
  if (!키 || !작업) return null
  // 화면이 연 것만. 모델에 do를 추가했다고 챗봇 권한이 따라 늘어나면 안 된다(`행동키s`와 같은 규칙).
  if (!작업.행동s.includes(키)) return null

  const 전체 = get행동버튼s(작업.row).filter(x => 작업.행동s.includes(x.key))
  const 지목한 = 전체.find(x => x.key === 키)
  if (!지목한) return null
  // 있는데 지금은 안 되는 경우(빈 폼의 '발행')와 아예 없는 경우는 사용자에게 전혀 다른 말이어야 한다.
  if (toValue(지목한.show) === false)
    return { kind: '전제불충족', 행동라벨: 지목한.label, 대상표기: 작업.화면 }

  const 지시 = String(plan?.작업지시 ?? '').trim()
  // 지목한 것을 앞에 두되 나머지도 남긴다 — 지목이 빗나갔을 때 옳은 버튼이 옆에 같이 있는 편이 낫다
  // (`준비됨`과 같은 규칙). 지시는 지목한 버튼에만 딸려 간다.
  const 가능 = 전체
    .filter(x => toValue(x.show) !== false)
    .toSorted((a, b) => Number(b.key === 키) - Number(a.key === 키))
    .slice(0, 행동최대)

  return {
    kind: '작업준비됨',
    화면: 작업.화면,
    라벨s: 가능.map(x => x.label).join(' | '),
    버튼s: 가능.map(x => ({
      label: x.label,
      icon: x.icon,
      color: 'primary',
      variant: x.key === 키 ? 'solid' : 'soft',
      size: 'xs',
      onClick: 작업실행(작업, x, x.key === 키 ? 지시 : '')
    }))
  }
}

/**
 * 계획 결과 → 판정. 앱만 아는 사실(화이트리스트·`show`·건수)로 종류를 정한다.
 *
 * 안전은 세 겹으로 걸려 있다:
 * 1. `행동키s` 화이트리스트(`sources.ts`) — 개발용 do로그·do초안 등은 enum에조차 안 들어간다.
 * 2. `show`(대개 ComputedRef) — 이미 완납한 회원에게 "회비 납부"가 안 뜬다.
 * 3. `do*` 자신의 전제조건 검사 — 미저장 행이면 스스로 useAlert로 거절한다.
 * 실행 시점은 언제나 사용자의 클릭이므로, 여기서 하는 일은 승인이 아니라 **무엇을 제안할지** 고르는 것이다.
 */
function 판정하기(r: PlannerResult, 화면: i화면대상 | null, 직전: i직전항목[]): i판정 {
  const 허용 = r.source?.행동키s ?? []
  const 지목 = String(r.plan?.행동 ?? '').trim()
  // 계획이 초안까지 들고 왔으면 버튼에 딸려 보낸다. 지목한 행동이 안 걸리는 갈래에서는 쓰이지 않는다.
  const 초안 = r.plan?.초안

  // 이 소스에 열어둔 행동이 아예 없다(자료·등급 등).
  if (!허용.length) return 지목 ? { kind: '어휘밖' } : { kind: '해당없음' }

  // 대상이 한 건으로 확정되지 않았을 때.
  //
  // 되묻기를 답변 LLM에게 맡기면 "구체적으로 선택해 주시기 바랍니다" 같은 빈 문장이 나온다.
  // 후보가 누구인지는 **앱이 이미 알고 있으므로** 앱이 이름과 식별자를 찍어주고, 후보마다 버튼을 붙인다.
  // 건수는 `총건수`를 쓴다 — `항목s.length`는 예산에 맞춰 잘린 수라 그걸 말하면 앱이 거짓말을 한다.
  if (r.항목s.length !== 1) {
    if (!지목) return { kind: '해당없음' }
    if (!r.총건수) return { kind: '대상없음' }

    const 후보 = r.총건수 <= 후보최대 ? 후보버튼s(r.항목s, 지목, 허용, 초안) : []
    return 후보.length
      ? { kind: '후보제시', 총건수: r.총건수, 버튼s: 후보 }
      : { kind: '대상다수', 총건수: r.총건수 }
  }

  const 대상 = r.항목s[0]
  if (!대상?.row) return { kind: '해당없음' }

  const 전체 = get행동버튼s(대상.row).filter(b => 허용.includes(b.key))
  const 가능 = 전체.filter(b => toValue(b.show) !== false)

  // 지목했는데 안 걸리는 경우를 둘로 가른다. 모델에 키가 아예 없으면 '어휘밖',
  // 있는데 `show`가 false면 '전제불충족' — 사용자에게는 전혀 다른 말이어야 한다.
  const 대상표기 = `${대상.label}${대상.sub ? ` ${대상.sub}` : ''}`

  if (지목 && !가능.some(b => b.key === 지목)) {
    const 이름 = 전체.find(b => b.key === 지목)?.label
    return 이름 ? { kind: '전제불충족', 행동라벨: 이름, 대상표기 } : { kind: '어휘밖' }
  }

  if (!가능.length) return { kind: '해당없음' }

  // 지목한 행동을 맨 앞으로 올리고 강조하되, 나머지도 남긴다 —
  // 지목이 빗나갔을 때 옆에 옳은 버튼이 같이 있는 편이 사용자에게 낫다.
  const 정렬 = 지목
    ? 가능.toSorted((a, b) => Number(b.key === 지목) - Number(a.key === 지목))
    : 가능

  return {
    kind: '준비됨',
    대상표기,
    주의: 대상주의(대상, 화면, 직전),
    초안제목: String(초안?.제목 ?? '').trim() || undefined,
    버튼s: 정렬.slice(0, 행동최대).map(b => ({
      label: b.label,
      icon: b.icon,
      color: 'primary',
      variant: b.key === 지목 ? 'solid' : 'soft',
      size: 'xs',
      // 초안은 지목한 행동에만 얹는다 — 옆에 같이 놓인 다른 버튼(지목이 빗나갔을 때의 보험)에까지
      // 초안이 딸려 가면 사용자가 고른 적 없는 내용이 엉뚱한 폼에 앉는다.
      onClick: 실행핸들러(b, b.key === 지목 ? 초안 : null)
    }))
  }
}

/** 판정 → 이번 턴 프롬프트에 붙일 사실과 지침. 종류마다 하는 말이 다르다는 게 요점이다. */
function 서술(판정: i판정): 행동결과 {
  const 없음 = (지시: string): 행동결과 => ({ 버튼s: [], 참조: '', 지시 })

  switch (판정.kind) {
    case '해당없음':
      return 없음(버튼없음)

    case '어휘밖':
      return 없음(`${버튼없음} 사용자가 요청한 일은 이 데이터로는 지원하지 않는다고만 밝혀라. ${이유금지}`)

    case '대상없음':
      return 없음(`${버튼없음} 요청한 대상을 찾지 못했다고 밝히고 조건을 확인하라고 안내하라. ${기능있음} ${이유금지}`)

    case '대상다수':
      return 없음(`${버튼없음} 대상이 ${판정.총건수}건이라 한 건으로 좁혀지지 않았다.`
        + ` 그 건수를 밝히고 누구인지 알려달라고 안내하라. ${기능있음}`)

    case '전제불충족':
      return 없음(`${버튼없음} 요청한 "${판정.행동라벨}"은 ${판정.대상표기}의 현재 상태에서는 할 수 없다.`
        + ` 대상이 누구인지 밝히고 그 사실만 전하라. ${기능있음} ${이유금지}`)

    case '후보제시':
      return {
        버튼s: 판정.버튼s,
        참조: `\n\n[대상 후보] ${판정.버튼s.map(b => b.label).join(' / ')}`,
        지시: `대상이 ${판정.총건수}건이라 확정되지 않았다. 후보를 괄호 안 식별자까지 그대로 나열해 누구인지 되물어라`
          + '(예: "김모 93♂(93000)와 김모 88♀(bbbbb) 중 누구인가요?"). 후보를 빼놓고 "선택해 주세요"라고만 하지 마라.\n'
          + `후보별 버튼은 앱이 답변 아래에 붙인다. 네가 버튼을 글로 그리지 마라. ${실행주체}`
      }

    case '작업준비됨':
      return {
        버튼s: 판정.버튼s,
        참조: `\n\n[가능한 행동] ${판정.라벨s}`,
        지시: `답변 아래에 실행 버튼이 붙는다: ${판정.라벨s}.\n`
          + `사용자가 지금 열어놓고 편집 중인 "${판정.화면}"에 걸리는 버튼이다.\n`
          // 여기서 무엇이 일어나는지는 행동마다 다르다(초안은 폼을 고치고, 발행은 올린다).
          // 앱이 아는 건 버튼 이름뿐이니 그 이상은 말하지 못하게 막는다.
          + '아직 아무 일도 일어나지 않았다. 버튼이 눌려야 그 일이 일어나고, 무엇이 일어나는지는 버튼 이름이 말한다.\n'
          + '버튼 이름에 없는 결과를 덧붙이지 마라. 여기 없는 버튼은 존재하지 않는다 — 언급하지 마라.\n'
          // 실측: 빈 폼에 "내용 채워 …"라고 하자 그 말을 화면 상태로 옮겨 적었다("…가 입력되어 있습니다").
          // 화면에 무엇이 들어 있는지는 [작업 중인 화면]에만 적혀 있고, 사용자의 말은 아직 지시일 뿐이다.
          + '사용자가 방금 말한 내용을 화면에 이미 들어간 것처럼 말하지 마라.'
          + ' 화면의 내용은 [작업 중인 화면]에 적힌 것이 전부이고, "(비어 있음)"이라고 적힌 칸은 정말 비어 있다.\n'
          + '무엇을 어떻게 고칠지 네가 미리 써 보이지도 마라 — 글은 그 버튼이 쓴다.\n'
          + 실행주체
      }

    case '준비됨': {
      const 라벨s = 판정.버튼s.map(b => b.label).join(' | ')
      return {
        버튼s: 판정.버튼s,
        참조: `\n\n[행동 대상] ${판정.대상표기}\n[가능한 행동] ${라벨s}`,
        지시: `답변 아래에 실행 버튼이 붙는다: ${라벨s}.\n`
          // 대상을 빼고 "조회하신 회원에 대해 ~할 수 있습니다"라고만 쓰면 사용자는 화면 속 사람이라고 읽는다.
          + `누구에게 붙는 버튼인지 "${판정.대상표기}"를 괄호 안 식별자까지 그대로 밝혀라.`
          + ' 대상을 빼놓고 버튼만 언급하지 마라.\n'
          + (판정.주의 ? `${판정.주의} 그 사실을 맨 앞에 한 문장으로 알려라.\n` : '')
          // 초안이 붙은 턴은 말이 달라야 한다. "등록했습니다"도 "버튼을 누르세요"도 아니고,
          // **채워진 폼이 열린다**는 사실과 확인이 필요하다는 것 둘 다를 전해야 한다.
          + (판정.초안제목
            ? `버튼을 누르면 제목 "${판정.초안제목}"으로 초안이 채워진 글쓰기 화면이 열린다.`
            + ' 내용을 확인하고 등록하는 건 사용자다. 이미 올렸다고도, 올리겠다고도 말하지 마라.\n'
            : '')
          + '이 버튼으로 실행할 수 있다고 한 문장만 덧붙여라. 여기 없는 행동은 언급하지 마라.\n'
          + 실행주체
      }
    }
  }
}

// 오류는 useChatbot이 assistant 메시지로 밀어넣으므로 error는 따로 쓰지 않는다.
const { messages, input, status, hasConversation, send, reset } = useChatbot({
  system: 시스템프롬프트,
  level: 'lite',
  welcome: '안녕하세요. 운영센터 AI도우미입니다.',
  // 질문 → (LLM) 조회 계획 → 앱이 실행 → 결과만 반환. 행 데이터는 LLM에 가지 않는다.
  context: async (q) => {
    // 한 번만 읽어 계획과 판정이 같은 화면을 본다. 그 사이에 사용자가 선택을 바꿀 수도 있다.
    const 화면 = get화면대상()
    const 작업 = get작업대상()
    // 직전 항목은 아래에서 덮어쓰므로 미리 잡아둔다 — 판정이 "대상이 바뀌었는지"를 보려면 필요하다.
    const 직전 = 직전항목s.value
    const r = await 계획조회(props.sources ?? [], q, 직전, 화면, 작업)

    // 편집 중인 화면에 걸린 턴이면 그쪽이 이번 답변의 전부다.
    const 작업판 = 작업판정(r.plan, 작업)
    const is작업턴 = Boolean(작업판)
    // 작업 턴의 조회 결과는 계획이 비워둔 축의 잔여물이다. 그걸로 직전 항목을 덮으면
    // 다음 턴의 "걔"가 방금 얘기하던 사람에서 엉뚱한 행으로 옮겨간다.
    if (!is작업턴) 직전항목s.value = r.항목s

    const 판정 = 작업판 ?? 판정하기(r, 화면, 직전)
    const 행동 = 서술(판정)
    // 후보 버튼이 붙는 턴은 그 버튼이 곧 명단이다 — 라벨이 `label+sub`로 명단 한 줄과 똑같다.
    // 둘 다 붙이면 같은 이름을 두 번 늘어놓게 되고, 누를 수 있는 쪽이 어느 것인지도 흐려진다.
    // 작업 턴에도 붙이지 않는다 — 고쳐달라고 한 글 옆에 상관없는 목록이 늘어선다.
    const 명단 = is작업턴 || 판정.kind === '후보제시' ? [] : 명단s(r.항목s)
    // 명단이 붙으면 본문 있는 행은 줄 자체가 링크다. 같은 제목을 버튼으로 또 늘어놓지 않는다.
    const 링크s = is작업턴 || 명단.length ? [] : 전문링크s(r.항목s)

    // 발췌·전문 링크 안내도 실제로 붙었을 때만 넣는다. 고정 프롬프트에 두면 회원 조회에도 따라붙어
    // "100자 중 50자 발췌본" 같은 없는 말을 만들어 낸다(실측됨).
    const 지시s = [
      !is작업턴 && r.is발췌 ? '"N자 중 M자 발췌"라고 적힌 본문은 잘린 것이다. 발췌본이라는 사실을 밝히고, 전문이 필요해 보이면 자료를 하나 지정하거나 조건을 좁히라고 제안하라.' : '',
      링크s.length ? `자료 ${링크s.length}건의 전문 보기 버튼이 답변 아래에 붙는다. URL은 쓰지 마라.` : '',
      // 앱이 명단을 그리는 턴에 LLM까지 이름을 늘어놓으면 같은 걸 두 번 보게 된다.
      // 버튼과 같은 처방이다 — 앱이 붙이는 건 앱이 붙인다고 알려주고, 말은 못 하게 막는다.
      명단.length
        // "표로 붙인다"고 알려줬더니 자기가 마크다운 표를 그렸다(실측됨). 이 자리에 '표'라는 말을 쓰면
        // 표를 그려도 된다는 허락으로 읽는다. 무엇을 하지 말지를 적는다.
        ? `조회된 ${r.총건수}건은 앱이 답변 아래에 직접 그린다. 이름을 나열하지 말고, 등급·성별·상태 같은 행의 값도 옮겨 적지 마라.`
        + ' 마크다운 표(| 로 칸을 나눈 것)를 만들지 마라. 목록도 만들지 마라.'
        + ' 건수와 눈에 띄는 특징(치우침, 예외적인 한두 건)만 한두 문장으로 짚고 끝내라.'
        : '',
      행동.지시
    ].filter(Boolean)

    return {
      // 작업 턴에는 어휘·조회 결과 대신 그 화면만 싣는다. 본문은 앞부분만 나가고(`작업블록`),
      // 전문이 필요한 일은 버튼이 눌린 뒤 그 `do*`가 자기 호출에서 직접 읽는다.
      // 작업 턴이 아니어도 화면은 늘 싣는다 — "지금 뭐 쓰고 있지?"에 답할 수 있어야 하고, 두어 줄이다.
      text: (is작업턴 ? '' : r.context) + 작업블록(작업) + 행동.참조,
      지시: 지시s.join('\n'),
      actions: [...링크s, ...행동.버튼s],
      metadata: { 명단, 총건수: r.총건수, 제목: r.source?.label ?? '' }
    }
  }
})

/**
 * 입력창에 커서를 돌려놓는다.
 * 엔터 제출은 textarea 가 계속 포커스를 쥐고 있어서 손댈 필요가 없고,
 * 포커스가 다른 곳(제안 버튼·초기화 버튼)으로 가버리는 경로만 여기서 되돌린다.
 * UChatPrompt 는 내부 textarea 엘리먼트를 textareaRef 로 노출한다.
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
  focusPrompt()
}

/**
 * 도크에 자기를 신고한다. 도크는 여기 무엇이 들어오는지 모르고(레이아웃이 조립한다),
 * 이 pane 은 자기 아이콘·라벨·헤더 액션만 넘긴다 — 그래서 `sources` 가 도크를 거치지 않는다.
 *
 * 상주 pane 이라 `visible`·`onClose` 가 없다. AI도우미는 닫는 게 아니라 패널을 닫는 것이다.
 */
const { isActive, open } = useDockPane({
  id: 'ai',
  icon: 'i-lucide-bot',
  label: 'AI도우미',
  // '대화 초기화'가 도크 헤더 우측에 그려진다. 메일쓰기가 들어오면 그 자리가 '임시저장'이 된다.
  actions: [{ icon: 'i-lucide-rotate-ccw', label: '대화 초기화', onClick: () => resetAndFocus() }]
})

/**
 * 패널은 offcanvas 로 계속 마운트돼 있어서 UChatPrompt 의 autofocus(onMounted)는 열 때 다시 안 걸린다.
 * 탭이 여럿이 되면 "패널이 열렸다"만으로는 부족하다 — 다른 탭에 있는데 여기로 커서가 가면 안 된다.
 */
watch(() => open.value && isActive.value, (v) => {
  if (v) focusPrompt()
})

/** 전체 찾기(⌘K)의 「AI도우미에게 묻기」가 놓고 간 질문. 꺼내 보내고 칸을 비운다(`useAskAI`). */
const askAI = useAskAI()
watch(askAI.대기질문, (q) => {
  if (q) askSuggestion(askAI.take())
}, { immediate: true })
</script>

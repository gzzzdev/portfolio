<template>
  <!--
    "무엇을 만들 것인가"를 고르는 자리. 고르는 단위는 낱개 설정이 아니라 **디자인틀 한 벌**이다 —
    `0 종이·배경`에 명함, `2 글자`에 이름·소속·전화가 놓인 상태가 곧 `명함_1` 이고,
    A4 세로에 등급증 문구가 놓인 상태가 `등급증_1` 이다. 눌러야 할 곳이 한 군데인 이유다.

    그래서 배경·표식·글자(= 연 디자인틀을 어떻게 고칠 것인가)와는 성격이 달라
    오른쪽 레이어 패널에서 떼어내 캔버스 왼쪽에 세워 둔다.

    **여기 있는 것은 전부 목록을 늘리고 줄이는 일이다** — 새로 만들기 · 열기 · 복제 · 지우기.
    열어 둔 디자인틀을 저장하거나 되돌리는 일은 캔버스 위 디자인틀바(`편집바.vue`)로 나갔고,
    이름 칸도 그쪽에 있다 — 이름은 열어 둔 디자인틀의 것이라 캔버스와 함께 움직인다.
    가르는 선은 "목록이 달라지는가"다.

    목록은 통째로 표에서 온다(`model디자인틀`). 코드가 얹는 붙박이가 없으므로 모든 항목이
    똑같이 고쳐지고 지워진다 — 내가 만든 것이 별도 서랍에 들어가지 않는 이유이고,
    이 편집기가 "만들고 끝"이 아니라 "만들어 늘리는" 도구인 이유다.
  -->
  <div class="flex h-full min-h-0 flex-col border-r border-default bg-elevated/30">
    <div class="flex shrink-0 items-center gap-2 border-b border-default py-1 pl-4 pr-2 text-xs text-muted">
      <span class="font-medium text-default">디자인틀</span>
      <span>무엇을 만들지</span>

      <div class="grow" />

      <!--
        표를 다루는 화면(`/admin/design-templates`)으로 나가는 문. GNB 는 캔버스로 바로 오므로
        이 링크가 관리 화면에 닿는 유일한 길이다. 여기 둔 이유는 이 패널이 목록을 다루는 자리라서 —
        '발급에 사용' 지정처럼 목록5 에서만 되는 일이 그 화면에 있다.
      -->
      <mButton
        to="/admin/design-templates"
        label="관리"
        icon="i-ph:table-light"
        size="xs"
        역할="조용"
      />
    </div>

    <div class="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4">
      <!-- 용도로 묶어 보여준다: 같은 용도의 디자인틀들은 채울 수 있는 값이 같고 배치만 다르다 -->
      <section
        v-for="칸 in 용도칸s"
        :key="칸.용도"
        class="flex flex-col gap-1"
      >
        <p class="px-0.5 text-[0.68rem] uppercase tracking-wide text-dimmed">
          {{ 칸.용도 }}
        </p>

        <!--
          고르기와 고치기(이름·삭제)는 다른 일이라 버튼을 겹쳐 두지 않는다.
          바깥이 `div` 인 것도 그래서다 — 버튼 안에 버튼은 못 넣는다.

          복제·삭제는 그 줄에 손을 얹었을 때만 보인다. 목록에서 늘 하는 일은 여는 것 하나뿐인데
          항목마다 아이콘 둘이 상주하면 다섯 줄에 열 개가 서서 정작 이름이 안 읽힌다.

          이름 고치기는 여기 없다 — 이름은 열어 둔 디자인틀의 것이라 캔버스 위 이름 칸에서 고친다.
        -->
        <div
          v-for="c in 칸.디자인틀s"
          :key="c.id"
          class="group flex items-center gap-1 rounded-md border transition-colors"
          :class="c.id === 틀.id
            ? 'border-primary bg-primary/10'
            : 'border-accented bg-default hover:bg-elevated'"
        >
          <button
            type="button"
            class="flex min-w-0 grow flex-col items-start gap-0.5 px-3 py-2 text-left"
            @click="디자인틀열기(c.행)"
          >
            <span class="flex w-full items-center gap-1 text-sm font-medium text-default">
              <span class="truncate">{{ c.이름 }}</span>
              <!-- 발급에 쓰이는 한 줄. 용도당 하나뿐이라 아이콘 하나로 족하다 -->
              <UIcon
                v-if="c.행.is사용중"
                name="i-lucide-badge-check"
                class="size-3.5 shrink-0 text-primary"
              />
            </span>
            <span class="text-xs text-muted">
              {{ c.규격.이름 }} · {{ c.규격.폭mm }}×{{ c.규격.높이mm }}mm
              · {{ c.면수 > 1 ? '양면' : '단면' }}
              · 글자 {{ c.글자수 }}칸{{ c.표식수 ? ` · 표식 ${c.표식수}` : '' }}
            </span>
          </button>

          <div class="flex shrink-0 items-center pr-1 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
            <!--
              이 용도로 발급할 때 쓸 한 줄을 고른다. 회원 화면의 명함·등급증 버튼이 그 줄을
              뽑으므로(`model회원.do디자인틀출력`), 여기서 못 고르면 어느 배치가 나갈지 정할 방법이 없다.
              이미 사용중인 줄은 끄지 않는다 — 용도당 하나는 있어야 발급이 성립한다.
            -->
            <mButton
              v-if="!c.행.is사용중"
              size="xs"
              역할="조용"
              icon="i-lucide-badge-check"
              :disabled="바쁨"
              title="이 디자인틀로 발급하기"
              @click="사용중으로(c.행)"
            />
            <mButton
              size="xs"
              역할="조용"
              icon="i-lucide-copy"
              :disabled="바쁨"
              title="복제 — 이 디자인틀을 바탕으로 하나 더"
              @click="복제(c.행)"
            />
            <mButton
              size="xs"
              역할="조용"
              icon="i-lucide-trash-2"
              :disabled="바쁨"
              title="디자인틀 지우기"
              @click="디자인틀지우기(c.행)"
            />
          </div>
        </div>
      </section>

      <!--
        빈 종이에서 시작한다. 지금 것을 바탕으로 하나 뜨려면 항목의 복제 쪽이다.

        머리말의 버튼이 아니라 목록의 마지막 칸인 이유: 새로 만들기도 목록을 늘리는 일이라
        늘어난 자리 바로 다음에 서는 것이 맞다. 생김새는 `m/List` 의 추가 칸(`isAdd`)과
        같은 점선 상자 — 목록 끝의 점선 네모는 이 코드베이스에서 "여기 하나 더"의 어휘다.
      -->
      <button
        type="button"
        class="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md m-빈자리 px-3 py-2 text-sm"
        :disabled="바쁨"
        title="빈 종이에서 새 디자인틀을 시작합니다"
        @click="새로만들기"
      >
        <UIcon
          name="i-stash-list-add-light"
          class="size-5 text-current opacity-70"
        />
        새 디자인틀
      </button>

      <!-- 저장소가 통째로 비었을 때. 코드가 얹는 붙박이가 없으므로 실제로 일어날 수 있는 상태다 -->
      <p
        v-if="!용도칸s.length"
        class="text-xs text-dimmed"
      >
        아직 디자인틀이 없습니다. 위 점선 칸으로 빈 종이를 하나 띄우거나, 캔버스에서 배치를 짜고
        이름 칸 옆의 저장을 누르면 여기 섭니다.
      </p>

      <!-- 발급단위(몇 장을 뽑는가)와 자리 개수(칸이 몇 개인가)는 다른 축이라 나란히 적는다 -->
      <p class="text-xs text-muted">
        {{ 발급단위 === '한장' ? '한 장짜리 인쇄물' : '대상마다 값을 갈아끼워 발급' }}
        · 자리 {{ 현황.length }}개
        <span v-if="이미지요구s.length">· 이미지 {{ 이미지요구s.join('·') }}</span>
      </p>

      <!-- 상자에 붙은 꼬리표와 용도 어휘의 어긋남. 실값을 잇기 전에 여기서 잡힌다 -->
      <div
        v-if="모르는이름.length || 빠짐.length"
        class="flex flex-col gap-1 rounded-md bg-warning/10 p-2 text-xs text-warning"
      >
        <p v-if="모르는이름.length">
          용도가 모르는 이름: {{ 모르는이름.map(x => x.꼬리표).join(', ') }} — 대개 오타입니다.
        </p>
        <p v-if="빠짐.length">
          필수인데 디자인틀에 없음: {{ 빠짐.map(v => v.라벨).join(', ') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 노출용도s, 모르는자리s, 빠진필수s, model디자인틀s, 용도정의s, 자리현황, type i틀, type model디자인틀 } from '~models/test2'
import { use디자인틀 } from './use디자인틀'
import type { i선택 } from './편집타입'

const 디자인틀s = model디자인틀s.getInstance()

const 틀 = defineModel<i틀>({ required: true })
const 선택 = defineModel<i선택>('선택', { required: true })

/** 목록을 늘리고 줄이는 일만 꺼내 쓴다. 저장·되돌리기는 디자인틀바가 같은 자리에서 가져간다 */
const { 바쁨, 새로만들기, 디자인틀열기, 복제, 디자인틀지우기 } = use디자인틀(틀, 선택)

/**
 * 이 디자인틀을 그 용도의 발급본으로 삼는다. 끄는 쪽은 세터가 알아서 저장한다
 * (`model디자인틀.is사용중` — 용도당 하나만 참이어야 하므로 나머지를 같이 손본다).
 */
async function 사용중으로(행: model디자인틀) {
  행.is사용중 = true
  await 행.do저장(false, false)
}

/**
 * 목록을 읽고, 아직 아무것도 열지 않았으면 첫 디자인틀을 연다.
 *
 * "무엇으로 시작하는가"의 답도 이제 목록에서 나온다 — 코드가 `프리셋('등급증_1')` 처럼
 * 박아 둘 id 가 없어졌기 때문이다. 목록이 비어 있으면 빈 디자인틀 그대로 남는다.
 *
 * `디자인틀열기` 를 안 쓰는 건 그쪽이 "저장할까요?" 를 묻기 때문이다. 여기서 갈아치우는
 * 것은 사람이 손댄 적 없는 시작 상태라 물을 것이 없다.
 *
 * **목록에 선 것 중 첫 줄**이다. 그냥 `디자인틀s[0]` 을 열면 그게 숨긴 용도의 행일 때 캔버스에는
 * 떠 있는데 왼쪽 목록 어디에도 없는 디자인틀이 되고, 되돌리기·저장이 안 보이는 행에 가서 닿는다.
 */
onMounted(async () => {
  await 디자인틀s.reads()
  const 첫디자인틀 = 디자인틀s.첫디자인틀()
  if (틀.value.id || !첫디자인틀) return
  틀.value = 첫디자인틀.열기()
  선택.value = { 면: 0, 레이어: '배경' }
})

/**
 * 용도별로 묶어 세운 목록. 칸 수·표식 수는 여기서 한 번만 센다 — 템플릿에서 세면 매 렌더마다
 * 목록 전체를 다시 훑는다.
 *
 * `computed` 인 이유는 목록이 뒤늦게 도착하고 그 뒤로도 늘고 주는 것이라서다.
 * (한때 모듈 스코프 상수였다. 배치가 코드 안에 있던 시절엔 그걸로 충분했다)
 *
 * 행을 펴지 않고 `행` 그대로 든다 — `model디자인틀` 은 클래스라 스프레드하면 getter 가 전부
 * 떨어져 나가 `이름` 도 `면s` 도 없는 껍데기가 된다. 여는 것도 지우는 것도 행 본인이 해야 한다.
 */
const 용도칸s = computed(() => 노출용도s
  .map(용도 => ({
    용도,
    디자인틀s: 디자인틀s.용도별디자인틀s(용도).map(행 => ({
      행,
      id: String(행.stateId ?? ''),
      이름: 행.이름,
      규격: 행.규격,
      면수: 행.면s.length,
      글자수: 행.면s.reduce((n, 면) => n + 면.글자s.length, 0),
      표식수: 행.면s.reduce((n, 면) => n + 면.표식s.length, 0)
    }))
  }))
  .filter(칸 => 칸.디자인틀s.length))

/* ── 용도 · 주입 ─────────────────────────────────────────────────── */

const 발급단위 = computed(() => 용도정의s[틀.value.용도].발급단위)
/** 이 양식이 요구하는 이미지 칸 (로고·사진·QR). 표식에 같은 이름의 꼬리표를 달면 값이 들어온다 */
const 이미지요구s = computed(() => 용도정의s[틀.value.용도].이미지s)

/** 디자인틀이 실제로 가진 자리들 — 상자에 붙은 꼬리표가 유일한 근거다 */
const 현황 = computed(() => 자리현황(틀.value))
const 모르는이름 = computed(() => 모르는자리s(현황.value))
const 빠짐 = computed(() => 빠진필수s(틀.value))
</script>

<!--
  목록 카드의 **선택 표시** 비교판.

  **손잡이는 없다 (2026-09-05).** 하루 동안 네 칸짜리 테마 축이었는데 걷어내고 한 벌로 못 박았다 —
  첫 칸 `윤곽 + 틴트 + 배지` 가 지금 화면에 나가는 값이고, 나머지는 전부 **기록**이다.
  값도 근거도 `m/테마/선택표시.ts` 머리말이 정본이다.

  왜 접었나: 축이었을 때 실제로 나간 건 `윤곽` 하나뿐이었다. 면 사다리 세 칸은 전부 면 두 칸을
  바닥에 깔고 있어서 모드마다 움직이는 쪽이 반대고(라이트는 나머지가 내려앉고 다크는 고른 게
  떠오른다) 다크에선 그림자가 검정 위 검정이라 죽는다. 그리고 윤곽 혼자로는 평상시 카드도
  `ring-1 ring-default` 라 **같은 속성의 굵기·색만** 바뀌어 "테두리 진한 카드"로 읽혔다.
  배지는 그 축을 안 쓴다 — 없던 물건이 하나 생긴다. n 개를 골랐을 때 **세어지는** 것도 배지뿐이다.

  전부 실제 카드 컴포넌트(`portrait`/`row`)를 그대로 쓰고 `itemCls`·`isSelected` 만 갈아 끼운다.
  겉모습을 흉내 낸 게 아니라 진짜 부품이라, 여기서 보이는 것이 목록에서 보이는 것이다.
  아래 안들은 지우지 말 것 — 왜 안 골랐는지가 이 판의 절반이다.
-->
<template>
  <div class="mx-auto w-full max-w-6xl px-4 py-8">
    <div class="mb-6 flex flex-wrap items-end gap-x-4 gap-y-2">
      <div>
        <h1 class="text-2xl font-semibold">
          선택 표시
        </h1>
        <p class="mt-1 text-sm text-muted">
          카드를 눌러 선택을 옮기면 모든 안이 같이 반응한다. 첫 칸만 지금 값이고 나머지는 기록이다.
        </p>
      </div>
      <div class="grow" />
      <div class="flex flex-row items-center gap-4">
        <label class="flex flex-row items-center gap-2 text-xs text-muted">
          틴트 세기
          <input선택기
            v-model="틴트"
            type="radio"
            :items="틴트s"
            :search="false"
            is폭자동
          />
        </label>
        <input선택기
          v-model="보기"
          type="radio"
          :items="보기s"
          :search="false"
          is폭자동
        />
      </div>
    </div>

    <!-- 카드만 놓고 비교되는 안들. 격자·데이터가 같아야 차이가 표시 자체에서 온다. -->
    <div class="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
      <section
        v-for="안 in 안s"
        :key="안.key"
      >
        <h2 class="text-sm font-medium">
          {{ 안.제목 }}
        </h2>
        <p class="mt-0.5 mb-3 text-xs text-muted">
          {{ 안.근거 }}
        </p>

        <div :class="보기 === '카드' ? 'grid grid-cols-2 gap-3' : 'flex flex-col gap-2'">
          <component
            :is="보기 === '카드' ? Portrait : Row"
            v-for="사람 in 사람s"
            :key="사람.key"
            v-bind="사람"
            :item-cls="클래스(안, 사람)"
            :is-selected="!!안.배지 && 선택 === 사람.key"
            @click="() => 선택 = 사람.key!"
          />
        </div>
      </section>
    </div>

    <!--
      노치는 카드만 놓고는 판정할 수 없다 — "무엇을 가리키느냐"가 이 표시의 전부라서
      가리킬 상세 판이 옆에 있어야 한다. 그래서 이 안만 따로 세운다.
    -->
    <section class="mt-12">
      <h2 class="text-sm font-medium">
        {{ 노치안.제목 }}
      </h2>
      <p class="mt-0.5 mb-3 text-xs text-muted">
        {{ 노치안.근거 }}
      </p>

      <div class="flex flex-row items-start gap-5">
        <div class="flex w-96 shrink-0 flex-col gap-2">
          <div
            v-for="사람 in 사람s"
            :key="사람.key"
            class="relative"
          >
            <Row
              v-bind="사람"
              :item-cls="클래스(노치안, 사람)"
              :is-selected="false"
              @click="() => 선택 = 사람.key!"
            />
            <!-- 카드 안쪽은 `overflow-hidden` 이라 잘린다. 돌기는 카드 **바깥** 이 자리에서 그린다. -->
            <span
              v-if="선택 === 사람.key"
              class="pointer-events-none absolute top-1/2 -right-[19px] size-0 -translate-y-1/2 border-y-[10px] border-l-[10px] border-y-transparent border-l-primary/25"
            />
          </div>
        </div>

        <div class="min-h-72 grow rounded-md bg-primary/5 p-5 ring-1 ring-primary/25">
          <div class="text-xs text-dimmed">
            상세
          </div>
          <div class="mt-1 text-xl">
            {{ 선택사람?.label ?? '—' }}
          </div>
          <div class="mt-0.5 text-xs text-muted">
            {{ 선택사람?.eyebrow }}
          </div>
        </div>
      </div>
    </section>

    <div class="mt-12 rounded-lg border border-default p-4 text-xs leading-relaxed text-muted">
      <p class="mb-1 font-medium text-default">
        결론 · <b class="text-default">축을 접고 바닥으로</b> (2026-09-05)
      </p>
      <p>
        처음엔 <b class="text-default">물러나게</b> 하나로 갔었다. 그런데 재 보니 라이트
        <code class="text-default">1.03:1</code> · 다크 <code class="text-default">1.5:1</code> 로,
        WCAG 1.4.11 이 상태 표시에 요구하는 <code class="text-default">3:1</code> 에 한참 못 미쳤다.
        나머지 신호인 넓게 번지는 그림자는 더 나쁘다 — 나이 들며 제일 먼저 안 보이게 되는 종류다.
        <b class="text-default">눈 좋은 사람에게만 보이는 표시였던 것.</b>
      </p>
      <p class="mt-2">
        되돌리는 대신 <b class="text-default">세기 사다리</b>로 만들었다. 물러나게는 조용한 쪽 끝으로
        살아 있고 기본값이 한 칸 올라갔다. 강조색을 다시 쓰는 게 아니라 원래 파둔 구멍을 쓰는 것이다 —
        <code class="text-default">mTheme.css</code> 면 블록의 “primary 면이 허용되는 곳은 셋” 중
        하나가 정확히 <b class="text-default">선택 표시(10% 이하 알파 또는 왼쪽 선)</b> 다.
      </p>
      <p class="mt-2">
        <b class="text-default">그런데 사다리는 하루밖에 못 갔다.</b> 세 칸이 전부
        <b class="text-default">면 두 칸</b>을 바닥에 깔고 있는데, 그 바닥은 모드마다 움직이는 쪽이
        반대고 다크에선 그림자가 죽는다 — 같은 표시가 두 모드에서 다른 물건이 된다. 그래서 기본값이
        사다리 밖 <b class="text-default">윤곽</b> 으로 도망가 있었고, 결국 아무도 안 돌리는 손잡이가 됐다.
        <b class="text-default">기본값이 축 밖에 있는 축은 축이 아니다.</b> 2026-09-05 에 걷어냈다.
      </p>
      <p class="mt-2">
        남은 문제는 윤곽의 약점이었다 — 평상시 카드도 <code class="text-default">ring-1 ring-default</code>
        라 선택은 <b class="text-default">같은 속성의 굵기·색만</b> 바뀐다. 훑으면 “테두리 진한 카드”다.
        <b class="text-default">배지</b>는 그 축을 안 쓴다 — 없던 물건이 하나 생긴다. solid primary 라
        대비가 넉넉히 3:1 을 넘고, 면을 안 건드려 <b class="text-default">두 모드가 같은 값</b>이다.
        이 결론에 먼저 도달해 있던 건 테마 메뉴의 프리셋 격자다(“테두리 하나로는 약해서 체크를 얹는다”).
        새로 만든 게 아니라 이미 검증된 표시를 목록으로 옮긴 것.
      </p>
      <p class="mt-2">
        체크가 “다중선택”으로 읽혀 뜻이 어긋난다는 우려는 <b class="text-default">틀렸다</b>. 이 표시가
        말하는 건 처음부터 “골라짐”이고, 상세가 펼쳐지는 건 선택의 <i>결과</i>다. n 개가 골라지면 판이
        일괄적용 폼이 될 뿐 표시는 그대로다(게임 UI 관용). <b class="text-default">오히려 다중선택이
          배지를 요구한다</b> — 링 n 개는 안 세어지고 배지는 세어진다.
      </p>
      <p class="mt-2">
        값은 <code class="text-default">m/테마/선택표시.ts</code>, 배지 마크업은
        <code class="text-default">m/List/_/_선택배지.vue</code>, 읽는 곳은
        <code class="text-default">m/List/_/Item.vue</code> 하나다. 축이 사라지면서
        <code class="text-default">has선택</code>(“골라진 행이 하나라도 있는가”)도 같이 빠졌다 —
        비선택을 눌러 앉히지 않으니 목록 전체 사정을 볼 이유가 없다.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { selectionCls } from '~base-comps/m/_스킨'
import Portrait from '~base-comps/m/List/_/portrait.vue'
import Row from '~base-comps/m/List/_/row.vue'
import type { ListCardItem } from '~base-comps/m/List/types'

definePageMeta({
  제목: '선택 표시'
})

type i안 = {
  key: string
  제목: string
  근거: string
  /** 선택된 카드에 얹을 클래스 */
  선택: string
  /** 안 고른 카드에 얹을 클래스. 면 사다리 안들만 쓴다 — 표시의 무게를 반대쪽에 두는 안이다. */
  비선택?: string
  /** 카드 컴포넌트가 코너 배지를 그리게 할지. 지금 값만 켠다 */
  배지?: boolean
}

const 보기s = [
  { label: '카드', value: '카드' },
  { label: '줄', value: '줄' }
]
const 보기 = ref<'카드' | '줄'>('카드')

/**
 * 틴트 세기. 여기서 만져보라고 뺐다 — `/5` 는 이 테마에선 회색에 가까워 "선택"보다
 * "비활성"으로 읽힐 수 있다. 세기 하나로 뜻이 뒤집히는 표시라 눈으로 정해야 한다.
 *
 * 색은 전부 `primary` 다. 이 저장소에서 `primary` 는 브랜드색이 아니라 **"상호작용"의 별칭**이고
 * (`app.config.ts` 주석), 선택이야말로 그 뜻에 정확히 맞는 유일한 자리다.
 * 역할·등급 같은 **범주**를 primary 로 칠하면 안 되는 이유도 같다.
 *
 * `bg-white` 가 카드 기본 클래스에 이미 있어서 그냥 얹으면 CSS 선언 순서가 승부를 정한다 — `!` 로 못 박는다.
 * 그리고 Tailwind 는 소스에 **글자 그대로** 있는 클래스만 훑으므로 조합해 만들지 않고 통째로 적는다.
 */
const 틴트s = [
  { label: '5', value: 'bg-primary/5! dark:bg-primary/10!' },
  { label: '8', value: 'bg-primary/8! dark:bg-primary/14!' },
  { label: '12', value: 'bg-primary/12! dark:bg-primary/20!' }
]
const 틴트 = ref(틴트s[1]!.value)

/**
 * **첫 칸만 지금 값이다.** `selectionCls(true)` 를 그대로 부르고 배지는 카드 컴포넌트가 그린다 —
 * 손으로 베껴 두면 값을 고칠 때 이 판이 거짓말을 한다.
 *
 * 나머지는 **기록**이다. 걷어낸 면 사다리 세 칸(조용·보통·또렷)은 이제 모듈에 없으므로 여기에
 * 클래스를 옮겨 적었다 — 그때 화면이 어땠는지를 재현하려는 것이지, 되살릴 값이 아니다.
 * (되살릴 일이 생기면 근거는 `선택표시.ts` 머리말 「버린 것 — 면 사다리」에 남아 있다.)
 * Tailwind 는 소스에 **글자 그대로** 있는 클래스만 훑으므로 조합해 만들지 않고 통째로 적는다.
 */
const 면_선택 = 'bg-default! dark:bg-muted! shadow-[0_10px_30px_rgba(0,0,0,0.10)]! dark:shadow-none!'
const 면_비선택 = 'bg-muted! dark:bg-default! shadow-none!'
const 왼쪽선 = 'before:absolute before:inset-y-0 before:left-0 before:z-10 before:w-1 before:bg-primary before:content-[\'\']'
const 면틴트 = 'bg-linear-to-b from-primary/8 to-primary/8 dark:from-primary/14 dark:to-primary/14'

const 안s = computed<i안[]>(() => [
  {
    key: 'now',
    제목: '윤곽 + 틴트 + 배지 ★지금',
    근거: '테두리는 굵기·색만 바뀌어 훑을 때 뭉개진다. 배지는 없던 물건이 하나 생기는 신호라 그 축을 안 쓰고, n 개를 골랐을 때 세어지는 것도 이것뿐이다. 두 모드가 같은 값.',
    선택: selectionCls(true),
    배지: true
  },
  {
    key: 'ring',
    제목: '기록 — 윤곽만 (어제 기본값)',
    근거: '면을 아예 안 건드리고 테두리 한 겹만. 모드 분기가 없는 건 좋았는데, 평상시 카드도 ring-1 을 두르고 있어 "테두리 진한 카드"로 읽혔다. 배지가 메운 자리가 정확히 여기다.',
    선택: 'ring-2 ring-primary/70'
  },
  {
    key: 'recede',
    제목: '기록 — 조용 (물러나게)',
    근거: '고른 것을 강조하는 대신 나머지를 눌러 앉힌다. 색을 하나도 안 늘린다 — 대신 라이트 1.03:1 · 다크 1.5:1 이라 혼자서는 안 읽힌다. 이게 사다리를 만들게 된 출발점.',
    선택: 면_선택,
    비선택: 면_비선택
  },
  {
    key: 'bar',
    제목: '기록 — 보통 (+ 왼쪽 선)',
    근거: '면 사다리의 가운데. 선은 대비가 높고(solid primary) 면을 안 물들여 카드 안의 다른 색과 안 싸운다. 색은 하나만 는다.',
    선택: `${면_선택} ${왼쪽선}`,
    비선택: 면_비선택
  },
  {
    key: 'loud',
    제목: '기록 — 또렷 (+ 면 틴트)',
    근거: '사다리의 센 쪽 끝. 곁눈으로도 덩어리로 잡힌다. 틴트는 `background-image` 로 얹는다 — 면 색을 갈아치우면 불투명 바닥이 날아간다.',
    선택: `${면_선택} ${왼쪽선} ${면틴트}`,
    비선택: 면_비선택
  },
  {
    key: 'tint',
    제목: '탈락 — 틴트만 (물러나게 없이)',
    근거: '위 `또렷` 과 달리 비선택을 안 내린다. 그래서 틴트 세기를 올려야 읽히고, 올릴수록 카드 안의 배지·썸네일과 싸운다. 위 슬라이더로 그 지점을 찾아볼 것.',
    선택: `${틴트.value} ring-1 ring-primary/25 ${왼쪽선}`
  }
])

const 노치안 = computed<i안>(() => ({
  key: 'notch',
  제목: '노치 (상세 판을 가리킴)',
  근거: '"골라졌다"가 아니라 "이게 지금 오른쪽에 열려 있다"를 말한다. 의미는 가장 정확하고, 좁은 폭에서 상세가 팝업으로 뜨면 성립을 안 한다.',
  선택: `${틴트.value} ring-1 ring-primary/25`
}))

const 클래스 = (안: i안, 사람: ListCardItem) =>
  선택.value === 사람.key ? 안.선택 : (안.비선택 ?? '')

const 사람s: ListCardItem[] = [
  {
    key: '1001', label: '김모', eyebrow: '90♂ (1001)',
    thumbnail: 'https://api.dicebear.com/9.x/lorelei/svg?seed=1001',
    badges: [{ label: '운영자', color: 'info' }]
  },
  {
    key: '1003', label: '송서영2', eyebrow: '05♀ (1003)',
    thumbnail: 'https://api.dicebear.com/9.x/lorelei/svg?seed=1003',
    badges: [{ label: '교수자', color: 'secondary' }]
  },
  {
    key: '1006', label: '한수경', eyebrow: '83♀ (1006)',
    thumbnail: 'https://api.dicebear.com/9.x/lorelei/svg?seed=1006',
    badges: [{ label: '준회원', color: 'warning' }, { label: '휴면', color: 'warning' }]
  },
  {
    key: '1007', label: '노상준', eyebrow: '91♂ (1007)',
    thumbnail: 'https://api.dicebear.com/9.x/lorelei/svg?seed=1007',
    badges: [{ label: '준회원', color: 'warning' }]
  }
]

const 선택 = ref<string>('1006')
const 선택사람 = computed(() => 사람s.find(x => x.key === 선택.value) ?? null)
</script>

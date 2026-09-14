<template>
  <!--
    2단계. 고른 표식 하나만 다룬다 — 고르는 일은 글자와 마찬가지로 캔버스가 한다.
    (칩 줄이 있었지만 `표식 1`·`표식 2` 는 이름이 아니라 번호였다. 캔버스에서 표식을 직접
     누르는 편이 빠르고, 빈 표식도 점선 원으로 늘 보이므로 못 찾을 일이 없다)
  -->
  <section class="flex flex-col gap-2">
    <div class="flex items-center gap-2">
      <p class="text-xs text-muted">
        로고·리본·도장·봉인, 그리고 색만 칠한 색판. 조금씩 기울일 수 있습니다.
      </p>
      <div class="grow" />
      <!--
        이 단계의 **초안**을 AI 가 놓는다. 채워 주는 게 아니라 앉혀 놓는 것이라 이름이 '초안'이다 —
        나온 것은 평범한 표식이라 그대로 끌고 고치고 지운다 (`AI채우기.ts` 머리말).
        **그림은 안 뽑는다.** 다만 보관함에 쓸 만한 것이 있으면 그건 골라서 앉힌다
        (`AI채우기.ts` 의 `AI표식배치`) — 새로 뽑는 일만 상자마다 아래에서 한다.
      -->
      <mButton
        size="xs"

        icon="i-lucide-sparkles"
        :loading="isLoading"
        @click="doAI초안"
      >
        AI 초안
      </mButton>
      <!--
        색판을 따로 만드는 이유: 표식은 "고르기가 먼저"라 빈 상자가 보관함을 펴고 서는데,
        색판은 고를 것이 없다. 같은 버튼으로 만들게 하면 색을 칠하려는 사람이 매번
        보관함을 지나가야 한다.
      -->
      <mButton
        size="xs"

        icon="i-lucide-square"
        @click="색판추가"
      >
        색판
      </mButton>
      <mButton
        size="xs"

        icon="i-lucide-plus"
        @click="표식추가"
      >
        그림
      </mButton>
    </div>

    <!-- 글자 패널과 같은 칸. 관례보다 이쪽이 이긴다 (`AI채우기.ts` 의 `요청줄`) -->
    <UInput
      v-model="요청"
      size="xs"
      icon="i-lucide-message-square"
      placeholder="AI 초안에 한마디 — 비우면 판형 관례대로 (예: 직인만, 워터마크 빼고)"
      @keydown.enter="doAI초안"
    />

    <p
      v-if="error"
      class="text-xs text-error"
    >
      {{ error }}
    </p>

    <p
      v-if="!선택표식"
      class="text-xs text-dimmed"
    >
      {{ 면.표식s.length ? '캔버스에서 표식을 고르세요.' : '아직 없습니다. 그림이나 색판을 하나 만드세요.' }}
    </p>

    <div
      v-else
      class="flex flex-col gap-2 rounded-md bg-elevated/40 p-2"
    >
      <!--
        색판은 그림 자리를 통째로 대신한다 — 보관함도 생성기도 고를 것이 없다.
        색을 지우면(비우기) 다시 평범한 빈 표식이라 그때부터 보관함이 선다.
      -->
      <div
        v-if="is색판"
        class="flex items-center gap-2"
      >
        <input
          v-model="채움"
          type="color"
          class="h-6 w-8 shrink-0 cursor-pointer rounded border border-accented bg-transparent"
          title="색판 색"
        >
        <span class="text-xs tabular-nums text-muted">{{ 채움 }}</span>
        <div class="grow" />
        <mButton
          size="xs"
          역할="조용"
          @click="선택표식.채움 = null"
        >
          색 비우기
        </mButton>
      </div>

      <template v-else>
        <!--
          고르기가 먼저, 만들기가 나중이다. 매번 새로 뽑으면 값도 값이지만 **같은 표식이 다시 안 나온다** —
          한 번 마음에 든 것을 다음 디자인틀에서도 쓰려면 보관해 둔 것을 먼저 보여줘야 한다.
        -->
        <Pick애셋
          v-model="선택표식.url"
          v-model:만들기="만들기"
          종류="표식"
          빈안내="보관된 표식이 없습니다. + 로 하나 만들어 보세요."
          @고름="a => { if (선택표식) 선택표식.묘사 = a.묘사 }"
        />

        <!--
          표식은 흰 바탕으로 와서 얹기 전에 누끼를 뜬다(아래 watch). 묘사를 이 컴포넌트가 아니라
          **표식이** 들고 있는 것이 배경과 같은 규칙이다 — 그래야 보관함에도 그 문장이 같이 실려
          나중에 같은 결로 다시 뽑을 수 있다.
        -->
        <Gen표식
          v-if="만들기"
          v-model="선택표식.url"
          v-model:묘사="선택표식.묘사"
          :용도="틀.용도"
        />

        <!--
          맞추기 / 채우기. 그림에만 뜬다 — 색판은 사각형을 그대로 칠하므로 채울 방식이 없다.
          기본이 맞추기인 이유와 채우기가 위쪽을 남기는 이유는 `i표식.맞춤` 에 적어 뒀다.
        -->
        <div class="flex flex-wrap items-center gap-1">
          <mButton
            v-for="m in 표식맞춤s"
            :key="m"
            size="xs"
            class="rounded-full"
            :켜짐="(선택표식.맞춤 ?? '맞추기') === m"
            @click="선택표식.맞춤 = m"
          >
            {{ m }}
          </mButton>
        </div>
      </template>

      <!--
        글자 상자의 꼬리표와 **같은 규칙의 자유 문자열**이다 (`패널글자.vue` 의 그 칸과 한 쌍).
        이 칸이 없던 동안 QR·엠블럼·회원사진은 디자인틀로 들어올 길이 아예 없었다 —
        값이 URL 이라 글자 상자에 넣으면 종이에 주소가 인쇄되고, 표식에는 받을 칸이 없었다.

        고를 목록을 두지 않는 것도 글자 쪽과 같은 이유다. 이름을 대는 건 코드가 아니라
        사람이고, 어긋난 이름은 막는 대신 아래 한 줄이 알려 준다.
      -->
      <UInput
        v-if="!is색판"
        v-model="꼬리표"
        size="xs"
        placeholder="꼬리표 없음 (그냥 얹어 둔 그림)"
      />
      <p
        v-if="자리설명 && !is색판"
        class="text-xs text-dimmed"
      >
        {{ 자리설명 }}
      </p>

      <!-- 캔버스 손잡이와 같은 한계를 본다. 어긋나면 한쪽에서 돌린 각이 다른 쪽에서 끌려온다 -->
      <label class="flex items-center gap-2 text-xs text-muted">
        회전
        <USlider
          v-model="선택표식.회전"
          :min="-표식회전한계"
          :max="표식회전한계"
          :step="1"
          class="flex-1"
        />
        <span class="w-8 text-right tabular-nums">{{ 선택표식.회전 }}°</span>
      </label>

      <label class="flex items-center gap-2 text-xs text-muted">
        불투명도
        <USlider
          v-model="선택표식.불투명도"
          :min="0.1"
          :max="1"
          :step="0.05"
          class="flex-1"
        />
      </label>

      <div class="flex items-center gap-2">
        <USwitch
          :model-value="선택표식.합성 === '곱하기'"
          size="xs"
          label="곱하기 합성"
          @update:model-value="v => 선택표식!.합성 = v ? '곱하기' : '보통'"
        />
        <div class="grow" />
        <mButton
          size="xs"
          역할="조용"
          color="error"
          icon="i-lucide-trash-2"
          @click="표식삭제"
        >
          삭제
        </mButton>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import Gen표식 from './생성표식.vue'
import Pick애셋 from './애셋고르기.vue'
import { AI표식배치 } from './AI채우기'
import { do누끼 } from '~utils'
import { 표식맞춤s, 표식회전한계, type i틀 } from '~models/test2'
import type { i선택 } from './편집타입'
import { do애셋보관, model애셋s, 빈자리, 새표식, 용도정의s } from '~models/test2'

const 틀 = defineModel<i틀>({ required: true })
const 선택 = defineModel<i선택>('선택', { required: true })
const props = defineProps<{ 면i: number }>()

/** 이 패널이 만지는 면. 앞뒤가 동시에 떠 있어도 이 패널은 한 면의 것만 만진다 */
const 면 = computed(() => 틀.value.면s[props.면i]!)

const 선택표식 = computed(() =>
  (선택.value?.레이어 === '표식' && 선택.value.면 === props.면i
    ? 면.value.표식s.find(s => s.id === 선택.value!.id) ?? null
    : null))

/**
 * 생성기를 펴 둘지. 표식마다 따로 기억하지 않는다 — 표식을 갈아탈 때마다 열려 있으면
 * 보관 목록이 안 보이는데, 이 화면의 기본은 "고르기"다.
 */
const 만들기 = ref(false)
watch(선택표식, () => {
  만들기.value = false
})

/**
 * 이미 거쳐 간 링크. **없으면 무한 루프다** — 누끼 결과를 `표식.url` 에 넣는 순간 이 watch 가
 * 다시 돌기 때문이다. 디자인틀 하나를 편집하는 동안만 사는 값이라 굳이 밖으로 내보내지 않는다.
 */
const 거쳐감 = new Set<string>()

/**
 * 새로 뽑은 표식이 붙으면 **누끼를 뜨고 보관한다**.
 *
 * 보관 목록에 이미 있는 링크면 목록에서 고른 것이므로 둘 다 건너뛴다 — 그 그림은 처음 뽑힐 때
 * 이미 누끼를 거쳤고, 다시 뜨면 알파를 알파 위에 또 얹어 가장자리가 삭는다.
 */
watch(() => 선택표식.value?.url, async (url) => {
  if (!url || 거쳐감.has(url)) return
  거쳐감.add(url)

  const 표식 = 선택표식.value
  if (!표식) return

  const 보관됨 = model애셋s.getInstance().list표식().some(a => a.링크 === url)
  if (!보관됨) {
    // 누끼 뜬 표식은 `uploads/ai/seals` 로 모은다 (원본 생성물과 섞이지 않게).
    // 폴더 이름은 `씰` 이던 시절 것인데 그대로 둔다 — 갈면 이미 저장된 그림들과 두 곳으로 갈린다
    const 새url = await do누끼(url, undefined, 'seals')
    // 기다리는 동안 사용자가 다른 그림을 골랐을 수 있다. 그때는 덮어쓰지 않는다
    if (새url && 표식.url === url) {
      거쳐감.add(새url)
      표식.url = 새url
    }
  }

  // 묘사를 같이 보낸다 — 없으면 보관함에 그림만 쌓이고 "왜 이 표식인지"와
  // "같은 결로 다시 뽑기"가 둘 다 사라진다 (배경은 처음부터 이렇게 하고 있었다)
  await do애셋보관({ 종류: '표식', 링크: 표식.url!, 묘사: 표식.묘사 })
})

function 표식추가(색: string | null = null) {
  const s = 새표식()
  // 캔버스가 유일한 picker 라, 기본 자리에 그대로 쌓으면 밑에 깔린 표식을 클릭으로 못 꺼낸다
  s.rect = 빈자리(면.value.표식s.map(x => x.rect), s.rect)
  if (색) {
    s.채움 = 색
    // 색판은 안 돌린다. 그림의 -3° 는 손으로 찍은 도장 느낌을 내려는 값인데,
    // 면을 그렇게 기울이면 종이 귀퉁이에 삼각형 빈틈이 생긴다
    s.회전 = 0
    s.불투명도 = 1
  }
  면.value.표식s.push(s)
  선택.value = { 면: props.면i, 레이어: '표식', id: s.id }
}

/** 색판 한 장. 첫 색은 중간 회색이다 — 어느 종이 위에서도 "칠해졌다"가 보인다 */
const 색판추가 = () => 표식추가('#8a8a8a')

/* ── AI 초안 ─────────────────────────────────────────────────────── */

const { ask, isLoading, error } = useAI()
const 확인창 = useModalConfirm()

/** 이 패널이 떠 있는 동안만 사는 한마디 (`패널글자.vue` 와 한 쌍) */
const 요청 = ref('')

/**
 * 이 면의 표식 초안을 AI 가 한 벌 놓는다. 글자 쪽과 같은 규칙이다 — 이어 붙이지 않고 갈아엎고,
 * 잃을 것이 있을 때만 묻는다 (`패널글자.vue` 의 `doAI초안`).
 *
 * **누끼 watch 는 여기서 할 일이 없다.** 새로 뽑은 그림이 하나도 없어서다 — 상자는 `url` 이
 * 빈 채로 나오고, 보관함에서 골라 앉힌 것은 처음 뽑힐 때 이미 누끼를 거쳐 목록에 든 링크다
 * (그래서 그 watch 도 `보관됨` 에서 되돌아 나간다). 알파 위에 알파를 또 얹을 일이 없다.
 */
async function doAI초안() {
  if (면.value.표식s.length) {
    const 답 = await 확인창.open({
      title: 'AI 로 다시 놓을까요?',
      message: `이 면의 표식 ${면.value.표식s.length}개가 사라지고 AI 가 새로 놓습니다. 그림은 새로 뽑지 않고 자리와 묘사만 잡습니다 — 보관함에 맞는 표식이 있으면 그건 골라서 앉힙니다.`,
      choices: [
        { key: '놓기', label: '새로 놓기', color: 'primary', 역할: '강조' },
        { key: '취소', label: '취소' }
      ]
    })
    if (답 !== '놓기') return
  }

  // 보관함을 같이 넘긴다 — 초안이 고르는 목록과 아래 `Pick애셋` 이 보여 주는 목록이 같아야 한다
  const 보관s = model애셋s.getInstance().list표식().map(a => ({ 링크: a.링크, 묘사: a.묘사 }))

  // 실패는 `useAI` 가 error 에 담아 두고, 버튼 아래 한 줄이 그걸 띄운다
  const 새s = await AI표식배치(ask.lite, 틀.value, 면.value, 보관s, 요청.value).catch(() => null)
  if (!새s) return

  if (!새s.length) {
    error.value = '표식을 하나도 내지 못했습니다. 한 번 더 눌러 보세요.'
    return
  }

  면.value.표식s = 새s
  선택.value = null
}

/**
 * 이 표식이 색판인가. **그림이 이긴다** — 둘 다 들고 있으면 렌더러도 그림을 그린다(`렌더.ts`).
 * 그래서 판단 기준이 "색이 있는가"가 아니라 "그림이 없고 색이 있는가"다.
 */
const is색판 = computed(() => !!선택표식.value && !선택표식.value.url && !!선택표식.value.채움)

/** `null` 을 못 받는 `<input type="color">` 와 저장값 사이의 완충 */
const 채움 = computed({
  get: () => 선택표식.value?.채움 ?? '#8a8a8a',
  set: (v: string) => {
    if (선택표식.value) 선택표식.value.채움 = v
  }
})

function 표식삭제() {
  if (!선택표식.value) return
  면.value.표식s = 면.value.표식s.filter(s => s.id !== 선택표식.value!.id)
  // 이 면의 배경으로 물린다 — `null` 로 두면 어느 면을 고치던 중이었는지가 사라진다
  선택.value = { 면: props.면i, 레이어: '배경' }
}

/* ── 자리(꼬리표) ─────────────────────────────────────────────────── */

/** 빈 값은 꼬리표를 떼는 것 — 필드를 남겨 두면 주입 표에 유령 자리가 선다 (글자 쪽과 같은 규칙) */
const 꼬리표 = computed({
  get: () => 선택표식.value?.꼬리표 ?? '',
  set: (v: string) => {
    if (선택표식.value) 선택표식.value.꼬리표 = v.trim() || undefined
  }
})

/**
 * 이 이름이 이 용도가 아는 이미지 자리인가.
 *
 * 글자 쪽(`꼬리표변수`)과 달리 맞대어 볼 것이 **이름 목록뿐**이다 — `i용도정의.이미지s` 는
 * 라벨도 예시도 없이 "이 양식은 이걸 요구한다"만 적는다. 그림은 예시를 글로 보여줄 수 없어서다.
 */
const 자리설명 = computed(() => {
  const h = 꼬리표.value
  if (!h) return ''
  const 아는것 = 용도정의s[틀.value.용도].이미지s
  return 아는것.includes(h)
    ? `이 용도가 아는 자리입니다. 발급할 때 ${h} 이(가) 여기 들어옵니다.`
    : `이 용도가 모르는 이름입니다. 아는 자리: ${아는것.join(' · ') || '없음'}`
})
</script>

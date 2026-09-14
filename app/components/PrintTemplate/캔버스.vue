<template>
  <!--
    무대는 `container-type: size` — 종이 폭을 cqw·cqh 로 잡으면 가로·세로 어느 쪽이 좁아도
    비율이 안 깨진다 (JS 리사이즈 관측이 필요 없다).

    면이 둘이면 **앞뒤를 나란히 편다.** 보는 면을 고르는 토글을 두지 않는 이유:
    토글은 "지금 어느 면인가"라는 상태를 만들고, 그 상태는 선택(`i선택.면`)과 언제든 어긋난다.
    둘 다 떠 있으면 누른 종이가 곧 그 면이라 어긋날 상태 자체가 없다.

    상자는 종이 밖으로 조금 나갈 수 있다(`밖여유`). 그래서 무대 여백은 종이를 가운데 두려는
    장식이 아니라 **나간 상자의 테두리·손잡이가 서는 자리**다. `overflow-clip` 은 그 자리를
    넘어간 것이 바깥 스플리터 칸(`overflow-y-auto`)에 스크롤바를 만드는 걸 막는다 —
    끌 때마다 칸이 늘었다 줄었다 하면 종이가 그만큼 흔들린다.
  -->
  <div
    ref="무대"
    tabindex="0"
    class="flex h-full w-full items-center justify-center overflow-clip p-8 outline-none"
    style="container-type: size"
    @keydown.tab.exact.prevent="순회(1)"
    @keydown.tab.shift.prevent="순회(-1)"
    @keydown.esc="빠져나가기"
  >
    <div
      class="flex items-center justify-center"
      :class="쌓기 ? 'flex-col' : 'flex-row'"
      :style="{ gap: 간격 }"
    >
      <div
        v-for="(면, i) in 틀.면s"
        :key="i"
        class="relative shrink-0"
      >
        <!-- 면 이름표. 단면 문서엔 부를 이름이 없으니 안 띄운다 -->
        <div
          v-if="양면"
          class="absolute -top-5 left-0 flex items-center gap-1 text-[0.65rem] text-muted"
        >
          <span>{{ 면.라벨 }}</span>
        </div>

        <div
          ref="종이"
          class="relative overflow-hidden shadow-lg ring-1 ring-default"
          :style="종이스타일"
          @pointerdown.self="바탕누름(i)"
        >
          <!-- 1. 배경. 바탕색 판은 클릭을 먹지 않는다 — 빈 곳을 누르면 그 면의 배경이 잡혀야 한다 -->
          <div
            class="pointer-events-none absolute inset-0"
            :style="{ background: 면.배경.바탕색 }"
          />
          <img
            v-if="면.배경.url"
            :src="면.배경.url"
            alt=""
            class="pointer-events-none absolute inset-0 h-full w-full"
            :style="배경스타일(면)"
          >

          <!-- 2. 표식 -->
          <div
            v-for="표식 in 면.표식s"
            :key="표식.id"
            class="absolute cursor-move"
            :style="[rect스타일(표식.rect), 표식스타일(표식)]"
            @pointerdown="시작($event, i, '표식', 표식.id, '이동')"
            @pointerenter="호버켜기(i, '표식', 표식.id)"
            @pointerleave="호버 = null"
          >
            <!--
              **네이티브 이미지 드래그를 꺼야 한다.** 안 끄면 pointerdown 직후 브라우저가
              제 드래그(고스트 이미지)를 시작해 포인터 캡처를 빼앗고, 표식이 손에서 미끄러진다.
              배경 이미지는 처음부터 `pointer-events-none` 이라 이 문제가 없었다 — 여기만 빠져 있었다.
              포인터는 부모 div 가 전부 받으므로 이 그림은 아예 대상이 아니어도 된다.
            -->
            <img
              v-if="표식.url"
              :src="표식.url"
              alt=""
              draggable="false"
              class="pointer-events-none h-full w-full select-none"
              :style="표식그림스타일(표식)"
            >
            <!--
              색판(`i표식.채움`). 그림이 없을 때만 서므로 점선 원과 배타적이다 —
              색을 넣은 순간 그 상자는 더 이상 "아직 비어 있는 표식"이 아니다.
            -->
            <div
              v-else-if="표식.채움"
              class="pointer-events-none h-full w-full"
              :style="{ background: 표식.채움 }"
            />
            <!--
              아직 아무것도 없는 상자. 다만 **꼬리표를 단 자리는 빈 것이 아니다** —
              발급할 때 그 그림이 들어오는 칸이라 여기서 비어 있는 게 정상이다.
              둘을 같은 붉은 점선으로 그리던 동안, 초안을 돌리고 남은 자리 상자가
              "AI 가 못 채운 것"으로 보였다. 글자 쪽은 예시가 그 몫을 하는데
              (`i글자.예시`) 그림은 예시를 글로 보여줄 수 없으니, 이름이 그 자리를 대신한다.
            -->
            <div
              v-else
              class="flex h-full w-full flex-col items-center justify-center gap-px rounded-full border-2 border-dashed text-[0.6rem] leading-none"
              :class="표식.꼬리표 ? 'border-emerald-500/60 text-emerald-600' : 'border-red-400/70 text-red-400'"
            >
              {{ 표식.꼬리표 || '표식' }}
              <span
                v-if="표식.꼬리표"
                class="text-[0.5rem] opacity-70"
              >발급 시</span>
            </div>
          </div>

          <!-- 3. 글자 -->
          <div
            v-for="글자 in 면.글자s"
            :key="글자.id"
            :ref="el => 글자el(글자.id, el)"
            class="absolute cursor-move overflow-hidden"
            :class="{ 'outline-2 outline-red-500/80': 실측표[글자.id]?.넘침 }"
            :style="[rect스타일(글자.rect), 글자스타일(글자)]"
            @pointerdown="시작($event, i, '글자', 글자.id, '이동')"
            @pointerenter="호버켜기(i, '글자', 글자.id)"
            @pointerleave="호버 = null"
          >
            {{ 글자.내용 || 글자.예시 }}
          </div>
        </div>

        <!--
          **편집겹.** 테두리·이름표·손잡이는 종이 밖에 산다. 종이가 `overflow-hidden` 이라
          안에 두면 가장자리에 붙은 상자의 손잡이가 잘려 못 잡히고, 그래서 밖으로 나간 상자는
          아예 되돌릴 길이 없어진다 — 상자가 도련만큼 나갈 수 있게 된 이상(`밖여유`)
          이 층은 클립 밖이어야 한다. 잘리는 것은 그려지는 것(표식·글자)뿐이고, 그건 종이에서도
          그대로 잘리므로 맞는 그림이다.

          테두리는 상자에 **딱 붙는다**(offset 0). 2px 씩 띄우던 때는 그 여유가 작은 표식에서
          상자 자신보다 크게 읽혔고, 나란히 붙여 놓은 두 상자의 테두리가 서로 맞닿아 어느 쪽
          것인지 알 수 없었다. 무엇보다 종이 가장자리에 맞춰 놓은 상자가 안 맞아 보였다 —
          테두리가 곧 상자의 변이어야 눈으로 맞춘 자리를 믿을 수 있다.

          `z-10`: 두 면이 나란히 설 때 앞면에서 넘친 테두리가 뒷면 종이 밑에 깔리지 않게.
        -->
        <div class="pointer-events-none absolute inset-0 z-10">
          <!--
            얹기만 해도 뜨는 테두리·이름표. 상자 목록 패널을 지운 자리를 이게 메운다 —
            훑어보려고 매번 클릭해야 하면 목록을 지운 값이 없다.
            글자보다 상자가 크므로 이 점선은 "어디를 잡을 수 있는가"이기도 하다.
          -->
          <div
            v-if="호버핸들 && 호버핸들.면 === i"
            class="pointer-events-none absolute outline-2 outline-dashed outline-primary/50"
            :style="rect스타일(호버핸들.rect)"
          >
            <span
              class="absolute left-0 whitespace-nowrap rounded-sm bg-primary/80 px-1 py-px text-[10px] leading-tight text-white"
              :class="이름표자리(호버핸들.rect)"
            >{{ 호버핸들.라벨 }}</span>
          </div>

          <!--
            선택 표시 · 크기 · 회전. 별도 레이어라 대상의 회전·합성에 끌려가지 않는다.
            **테두리는 일부러 같이 안 돈다** — 크기 손잡이가 화면 축(가로=폭, 세로=높이) 그대로
            끌리기 때문이다. 테두리만 돌리면 손잡이가 대각선으로 붙어 놓고는 여전히 화면 축으로
            늘어나서, 보이는 방향과 늘어나는 방향이 어긋난다.
          -->
          <div
            v-if="선택핸들 && 선택핸들.면 === i"
            class="pointer-events-none absolute outline-2 outline-primary"
            :style="rect스타일(선택핸들.rect)"
          >
            <span
              class="absolute left-0 whitespace-nowrap rounded-sm bg-primary px-1 py-px text-[10px] leading-tight text-white"
              :class="이름표자리(선택핸들.rect)"
            >{{ 선택핸들.라벨 }}</span>
            <div
              class="pointer-events-auto absolute -bottom-1.5 -right-1.5 size-3 cursor-nwse-resize rounded-full bg-primary ring-2 ring-white"
              @pointerdown="시작($event, i, 선택핸들.레이어, 선택핸들.id, '크기')"
            />
            <!-- 회전은 표식만 갖는 값이다 (글자 상자엔 각도가 없다) -->
            <div
              v-if="선택핸들.레이어 === '표식'"
              class="pointer-events-auto absolute left-1/2 flex size-4 -translate-x-1/2 cursor-grab items-center justify-center rounded-full bg-primary text-white ring-2 ring-white active:cursor-grabbing"
              :class="회전자리(선택핸들.rect)"
              @pointerdown="시작($event, i, 선택핸들.레이어, 선택핸들.id, '회전')"
            >
              <UIcon
                name="i-lucide-rotate-cw"
                class="size-2.5"
              />
              <!--
                기울기는 눈으로 못 읽는다 — 3° 와 5° 는 봐서 같고, 그 2° 가 도장 느낌을 가른다.
                **돌리는 동안만, 손잡이 위로** 띄운다. 옆이나 아래에 두면 정작 읽어야 할 순간에
                커서와 손이 그 자리를 덮는다. 다 돌리고 나면 숫자는 패널이 계속 들고 있다.
              -->
              <span
                v-if="돌리는중"
                class="pointer-events-none absolute bottom-full left-1/2 mb-1 -translate-x-1/2 whitespace-nowrap rounded-sm bg-primary px-1 py-px text-[10px] leading-tight tabular-nums text-white"
              >{{ 선택핸들.회전 }}°</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useEventListener } from '@vueuse/core'
import { rect스타일, 표식그림스타일, 표식스타일, 글자스타일, 배경스타일 as 배경스타일계산, 표식회전한계, type iRect, type i배경, type i표식, type i틀 } from '~models/test2'
import { is상자선택, 글자실측키, type i글자실측, type i선택 } from './편집타입'

const 틀 = defineModel<i틀>({ required: true })
const 선택 = defineModel<i선택>('선택', { required: true })

const 무대 = useTemplateRef<HTMLElement>('무대')
const 종이s = useTemplateRef<HTMLElement[]>('종이')

const 양면 = computed(() => 틀.value.면s.length > 1)

/**
 * 이어붙이는 방향. **짧은 변 쪽으로 잇는다** — 가로로 긴 명함은 위아래로 쌓고,
 * 세로로 긴 A4 는 좌우로 편다. 합친 모양이 정사각에 가까워야 어떤 무대 비율에서도
 * 종이가 가장 크게 뜬다 (명함 두 장을 옆으로 붙이면 3.6:1 이라 무대에서 납작해진다).
 */
const 쌓기 = computed(() => 틀.value.규격.폭mm >= 틀.value.규격.높이mm)

/** 면 사이 간격. 무대 짧은 변 기준이라 종이가 커지면 같이 벌어진다 */
const 간격 = '3cqmin'

const 종이스타일 = computed(() => {
  const { 폭mm, 높이mm } = 틀.value.규격
  // 무대를 면 수로만 나눈다. 단면 문서가 쓰지도 않을 뒷면 자리에 폭을 내주면
  // 종이가 절반 크기로 떠서, %로 글자를 맞추는 이 편집의 정밀도가 그만큼 깎인다
  const n = 틀.value.면s.length
  const 여백 = `${간격} * ${n - 1}`

  return {
    aspectRatio: `${폭mm} / ${높이mm}`,
    // 종이 자신은 inline-size 컨테이너 — 글자 크기(cqw)가 종이 폭을 따르게 한다.
    // (자기 자신은 질의 대상이 아니라서 아래 cqw·cqh 는 무대 기준으로 풀린다)
    containerType: 'inline-size',
    width: 쌓기.value
      ? `min(100cqw, calc((100cqh - ${여백}) / ${n} * ${폭mm} / ${높이mm}))`
      : `min(calc((100cqw - ${여백}) / ${n}), calc(100cqh * ${폭mm} / ${높이mm}))`
  }
})

/*
 * 좌표·정렬·회전은 **`디자인틀/스타일.ts` 가 한 벌만 든다.** 여기서 다시 적으면 인쇄 렌더러
 * (`to디자인틀면`)와 갈라지고, 그러면 이 화면을 보고 짠 배치가 종이에서 어긋난다.
 * 이 파일이 넘기는 폭은 `null` — 종이가 `inline-size` 컨테이너라 글자 크기가 cqw 로 나간다.
 */
const 배경스타일 = (면: { 배경: i배경 }) => 배경스타일계산(면.배경)

/* ── 실측 ─────────────────────────────────────────────────────────── */

/**
 * "이 글자가 몇 줄이고 상자를 넘는가"는 **재는 것**이지 셈하는 게 아니다 (`i글자실측` 참고).
 *
 * `Range` 로 글자 자체의 사각형을 잡는다. `scrollHeight` 를 쓰면 안 된다 —
 * 상자는 `align-items: center` 인 flex 라, 위로 넘친 부분은 스크롤 영역에 잡히지 않아
 * 가운데 정렬된 글자의 넘침을 절반만 본다. `getClientRects()` 는 덤으로 줄 수를 준다
 * (세로쓰기면 열 하나가 rect 하나라 축을 나눠 볼 필요도 없다).
 *
 * `ResizeObserver` 는 쓰지 않는다. 무대가 `container-type: size` 라 글자 크기(cqw)도
 * 상자 폭(%)도 종이 폭에 비례한다 — 패널을 끌어 종이가 커져도 접히는 자리는 그대로다.
 * 관측할 게 없는 곳에 관측자를 두면 콜백 안에서 레이아웃이 다시 도는 고리만 얻는다.
 */
const 실측 = inject(글자실측키, null)
const 실측표 = computed(() => 실측?.value ?? {})

/**
 * id → 그 상자의 DOM. **`data-*` 속성으로 찾으면 안 된다** —
 * `uid` 가 `Date.now()` 기반이라 서버가 그린 id 와 클라가 만든 id 가 서로 다르고,
 * Vue 는 하이드레이션에서 평범한 속성을 다시 쓰지 않는다(서버가 쓴 걸 믿는다).
 * 그래서 DOM 에서 읽은 id 는 영원히 남의 id 다. ref 는 클라 쪽 값이라 그 함정이 없다.
 */
const 글자els = new Map<string, HTMLElement>()
const 글자el = (id: string, el: unknown) => {
  if (el) 글자els.set(id, el as HTMLElement)
  else 글자els.delete(id)
}

function 재기() {
  if (!실측) return
  const 표: Record<string, i글자실측> = {}
  const 범위 = document.createRange()
  for (const 면 of 틀.value.면s) {
    for (const g of 면.글자s) {
      const el = 글자els.get(g.id)
      if (!el?.isConnected) continue
      범위.selectNodeContents(el)
      const 글 = 범위.getBoundingClientRect()
      const 칸 = el.getBoundingClientRect()
      표[g.id] = {
        줄수: 범위.getClientRects().length,
        // 0.5px 는 소수 좌표에서 오는 떨림 — 이게 없으면 딱 맞는 상자가 깜빡인다
        넘침: 글.width > 칸.width + 0.5 || 글.height > 칸.height + 0.5
      }
    }
  }
  실측.value = 표
}

// flush:'post' 라 DOM 이 이미 갱신된 뒤다 (nextTick 을 따로 기다릴 필요가 없다)
watch(틀, 재기, { deep: true, flush: 'post' })
onMounted(() => {
  재기()
  // 웹폰트가 늦게 붙으면 첫 측정은 폴백 폰트 기준이다 — 붙고 나서 한 번 더 잰다
  document.fonts?.ready.then(재기)
})

/* ------------------------------------------------------------------ */
/* 잡아 끌기                                                           */
/* ------------------------------------------------------------------ */

function rect찾기(면i: number, 레이어: '표식' | '글자', id: string): iRect | null {
  const 면 = 틀.value.면s[면i]
  if (!면) return null
  const 목록 = 레이어 === '표식' ? 면.표식s : 면.글자s
  return 목록.find(x => x.id === id)?.rect ?? null
}

const 표식찾기 = (면i: number, id: string): i표식 | null =>
  틀.value.면s[면i]?.표식s.find(x => x.id === id) ?? null

/**
 * 지금 잡은 대상의 면·레이어·id·사각형을 한 덩이로. 선택 테두리와 크기·회전 손잡이가 같이 쓴다 —
 * 나눠 두면 템플릿에서 '배경이 아님'을 두 번 좁혀야 한다.
 * `회전` 은 표식일 때만 값이 있다 (글자 상자엔 각도가 없다).
 */
const 선택핸들 = computed(() => {
  const s = 선택.value
  if (!is상자선택(s)) return null
  const rect = rect찾기(s.면, s.레이어, s.id)
  if (!rect) return null
  return {
    면: s.면, 레이어: s.레이어, id: s.id, rect,
    라벨: 이름(s.면, s.레이어, s.id),
    회전: s.레이어 === '표식' ? 표식찾기(s.면, s.id)?.회전 ?? 0 : null
  }
})

type i모드 = '이동' | '크기' | '회전'

const 드래그 = ref<{ 면: number, 레이어: '표식' | '글자', id: string, 모드: i모드, x: number, y: number, 원본: iRect, 원본회전?: number, 시작각?: number } | null>(null)

const 가둠 = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

/**
 * 상자가 종이 **밖으로** 나갈 수 있는 여유(화면 px).
 *
 * 왜 밖이 필요한가 — 도련이다. 가장자리까지 칠한 색판·리본을 종이 안에 딱 맞춰 두면
 * 재단이 0.5mm만 밀려도 흰 줄이 남는다. 재단선 밖까지 넘겨 놓아야 잘린 자리가 색으로 찬다.
 * 얹어 두고 반쯤 걸치는 그림(모서리 리본, 옆으로 흘리는 로고)도 같은 문이 필요했다.
 * 그려지는 것은 종이가 잘라 준다 — 캔버스도 인쇄 렌더러도 종이가 `overflow: hidden` 이라
 * 화면에서 잘리는 만큼 종이에서도 잘린다.
 *
 * **왜 %가 아니라 px 인가**: 이 여유의 한계를 정하는 건 문서가 아니라 화면이다. 밖으로 나간
 * 상자의 손잡이는 무대 여백(`p-8` = 32px) 안에 서 있어야 다시 잡을 수 있고, 그 여백은 px 다.
 * %로 못을 박으면 종이가 커질수록 손잡이가 무대 밖으로 밀려나 영영 못 잡는 상자가 생긴다.
 * 손잡이가 상자 모서리에서 6px 더 나가므로 여백보다 그만큼 이상 작게 잡는다.
 */
const 여유px = 20

/** 그 변의 종이 길이(px)로 나눠 % 좌표계로 옮긴다 */
const 밖여유 = (변px: number) => (여유px / 변px) * 100

/**
 * 상자 한가운데에서 본 포인터의 방향(도). 회전은 이 각의 **변화량**이라,
 * 손잡이를 어디서 잡았는지와 상관없이 잡은 자리가 손을 따라온다.
 * 매번 종이를 다시 재는 이유는 이동·크기와 같다 — 끌던 중에 패널이 밀려 종이가 움직여도 안 튄다.
 */
function 포인터각(면i: number, r: iRect, e: PointerEvent): number {
  const 종이 = 종이s.value?.[면i]
  if (!종이) return 0
  const box = 종이.getBoundingClientRect()
  const cx = box.left + ((r.x + r.w / 2) / 100) * box.width
  const cy = box.top + ((r.y + r.h / 2) / 100) * box.height
  return (Math.atan2(e.clientY - cy, e.clientX - cx) * 180) / Math.PI
}

/**
 * 회전 손잡이를 상자 위에 둘지 아래에 둘지. 이름표(`이름표자리`)와 같은 사정이다 —
 * 편집겹이 클립 밖으로 나온 지금도 **위쪽만은 자리가 좁다**. 손잡이는 상자에서 28px 을 더
 * 올라가는데, 종이 위에 남은 것은 무대 여백뿐이고 거기엔 면 이름표가 이미 서 있다.
 */
const 회전자리 = (r: iRect) => (r.y > 8 ? '-top-7' : '-bottom-7')

/** 지금 각도를 끌고 있는가. 끌기 대상은 늘 선택된 것이라(`시작`) 대상을 따로 맞춰 볼 필요가 없다 */
const 돌리는중 = computed(() => 드래그.value?.모드 === '회전')

/** 빈 곳을 누르면 그 면의 배경이 잡힌다. 포커스도 같이 가져와야 이어서 Tab 이 먹는다 */
function 바탕누름(면i: number) {
  선택.value = { 면: 면i, 레이어: '배경' }
  무대.value?.focus()
}

function 시작(e: PointerEvent, 면i: number, 레이어: '표식' | '글자', id: string, 모드: i모드) {
  e.stopPropagation()
  // 상자를 누른 순간부터 Tab 이 먹어야 한다 (자식은 포커스를 못 받으므로 무대가 대신 받는다)
  무대.value?.focus()
  선택.value = { 면: 면i, 레이어, id }
  const r = rect찾기(면i, 레이어, id)
  if (!r) return
  드래그.value = {
    면: 면i, 레이어, id, 모드, x: e.clientX, y: e.clientY, 원본: { ...r },
    ...(모드 === '회전' ? { 원본회전: 표식찾기(면i, id)?.회전 ?? 0, 시작각: 포인터각(면i, r, e) } : {})
  }
}

// 창 전체에서 받는다 — 커서가 대상을 앞질러도 끌기가 끊기지 않는다 (mSplitter 와 같은 방식).
// 기준 상자는 **끌기 시작한 면의 종이**다. 옆 면 위로 커서가 넘어가도 좌표계가 바뀌지 않는다.
useEventListener(window, 'pointermove', (e: PointerEvent) => {
  const d = 드래그.value
  const 종이 = d && 종이s.value?.[d.면]
  if (!d || !종이) return
  const box = 종이.getBoundingClientRect()
  const dx = ((e.clientX - d.x) / box.width) * 100
  const dy = ((e.clientY - d.y) / box.height) * 100
  const r = rect찾기(d.면, d.레이어, d.id)
  if (!r) return

  if (d.모드 === '회전') {
    const 표식 = 표식찾기(d.면, d.id)
    if (!표식) return
    // 각도는 rect 를 안 건드리므로 원본 사각형으로 중심을 잡아도 끌리는 동안 흔들리지 않는다.
    // 손을 아무리 크게 돌려도 ±한계에서 멈춘다 (`표식회전한계` 참고).
    // shift 는 5°씩 — 이 폭에서 쓸모 있는 눈금은 그 정도다
    const 값 = (d.원본회전 ?? 0) + (포인터각(d.면, d.원본, e) - (d.시작각 ?? 0))
    표식.회전 = 가둠(e.shiftKey ? Math.round(값 / 5) * 5 : Math.round(값), -표식회전한계, 표식회전한계)
    return
  }

  if (d.모드 === '이동') {
    // 돌출은 제 크기의 절반까지 — 여유(px)가 상자보다 큰 작은 표식일 때만 걸리는 빗장이고,
    // 통째로 종이 밖에 나가 안 보이는 상자가 생기지 않게 한다 (안 보이면 되돌릴 수도 없다)
    const ox = Math.min(밖여유(box.width), d.원본.w / 2)
    const oy = Math.min(밖여유(box.height), d.원본.h / 2)
    r.x = 가둠(d.원본.x + dx, -ox, 100 - d.원본.w + ox)
    r.y = 가둠(d.원본.y + dy, -oy, 100 - d.원본.h + oy)
  } else {
    // 크기는 반대쪽 변이 이미 밖에 있을 수 있다 — `100 - x` 가 그 돌출을 이미 품으므로
    // 여기 더하는 여유는 늘어나는 쪽 변의 몫이다 (사방으로 도련을 낸 색판이 이렇게 나온다)
    r.w = 가둠(d.원본.w + dx, 2, 100 - d.원본.x + 밖여유(box.width))
    r.h = 가둠(d.원본.h + dy, 2, 100 - d.원본.y + 밖여유(box.height))
  }
})

useEventListener(window, 'pointerup', () => {
  드래그.value = null
})
/* ------------------------------------------------------------------ */
/* 가리키기 · 순회                                                      */
/* ------------------------------------------------------------------ */

/**
 * 상자의 이름표. 패널에 있던 목록의 한 줄(`5 참가안내`)을 그대로 여기로 옮긴 것이다.
 *
 * 종이에 뜨는 글자는 그 자리의 **값**(주입 전이면 예시)이라 캔버스만 봐서는 그게 무슨 자리인지
 * 알 길이 없다 — `10월 12일 (토) 오후 2시` 가 일시 자리인지 손으로 적은 고정문구인지 같아 보인다.
 * 그 한 가지를 이 이름표가 답한다. 상자 번호도 여기에만 있다.
 * 꼬리표가 없는 상자는 자리가 아니라 고정문구다 — 번호만으로는 부족해서 그렇게 적는다.
 */
function 이름(면i: number, 레이어: '표식' | '글자', id: string): string {
  const 면 = 틀.value.면s[면i]
  if (!면) return ''
  if (레이어 === '표식') {
    const i = 면.표식s.findIndex(x => x.id === id)
    // 색판은 이름으로 갈라 부른다 — 큰 판 하나가 종이의 절반을 덮고 있을 때
    // `표식 1` 이라고만 뜨면 그게 그림인지 칠한 면인지 눌러 보기 전엔 모른다.
    // 자리 상자는 번호보다 이름이 먼저다 — 번호는 순서일 뿐이고, 그 상자의 정체는 꼬리표다
    const s = 면.표식s[i]
    if (s?.꼬리표) return `${s.꼬리표} 자리`
    return `${s && !s.url && s.채움 ? '색판' : '표식'} ${i + 1}`
  }
  const i = 면.글자s.findIndex(x => x.id === id)
  return `${i + 1} ${면.글자s[i]?.꼬리표 || '고정문구'}`
}

/**
 * 이름표를 상자 위에 얹을지 안에 넣을지. 종이 밖으로 나가는 것 자체는 이제 된다(편집겹은
 * 클립 밖이다). 그래도 위쪽에 붙은 상자는 안에 넣는다 — 면 이름표('앞')가 `-top-5` 에 이미
 * 서 있어 겹치고, 도련만큼 올라간 상자라면 그 위는 무대 여백도 거의 남지 않는다.
 */
const 이름표자리 = (r: iRect) => (r.y > 6 ? '-top-4' : 'top-0')

const 호버 = ref<{ 면: number, 레이어: '표식' | '글자', id: string } | null>(null)

/** 끌고 있는 동안엔 커서가 남의 상자를 지나가도 이름표를 넘겨주지 않는다 */
function 호버켜기(면i: number, 레이어: '표식' | '글자', id: string) {
  if (드래그.value) return
  호버.value = { 면: 면i, 레이어, id }
}

/** 얹혀 있는 대상. 이미 선택된 것이면 안 그린다 — 실선 테두리가 그 자리에 이미 있다 */
const 호버핸들 = computed(() => {
  const h = 호버.value
  if (!h) return null
  const s = 선택.value
  if (is상자선택(s) && s.면 === h.면 && s.레이어 === h.레이어 && s.id === h.id) return null
  const rect = rect찾기(h.면, h.레이어, h.id)
  return rect ? { ...h, rect, 라벨: 이름(h.면, h.레이어, h.id) } : null
})

/** 그리는 순서 그대로(표식 → 글자). 화면에서 위에 얹힌 것이 목록에서도 뒤다 */
function 순회목록(면i: number) {
  const 면 = 틀.value.면s[면i]
  if (!면) return []
  return [
    ...면.표식s.map(x => ({ 면: 면i, 레이어: '표식' as const, id: x.id })),
    ...면.글자s.map(x => ({ 면: 면i, 레이어: '글자' as const, id: x.id }))
  ]
}

/**
 * Tab 으로 상자를 하나씩 집는다. 목록 패널을 지운 뒤로 **완전히 겹친 상자를 꺼내는 유일한 길**이다 —
 * 클릭은 언제나 맨 위 것만 잡는다.
 * 무대가 포커스를 가졌을 때만 가로채므로 패널 안의 탭 이동은 그대로다.
 */
function 순회(방향: 1 | -1) {
  const 면i = 선택.value?.면 ?? 0
  const 목록 = 순회목록(면i)
  if (!목록.length) return
  const s = 선택.value
  const 지금 = is상자선택(s) ? 목록.findIndex(x => x.레이어 === s.레이어 && x.id === s.id) : -1
  // 아무것도 안 잡은 상태에서 Tab 은 처음, Shift+Tab 은 끝으로 간다
  const 기준 = 지금 < 0 ? (방향 === 1 ? -1 : 0) : 지금
  선택.value = 목록[(기준 + 방향 + 목록.length) % 목록.length]!
}

/**
 * Tab 을 가로채는 이상 빠져나갈 문도 있어야 한다 (없으면 캔버스가 키보드를 가둔다).
 * 배경으로 물리는 이유는 삭제와 같다 — `null` 로 두면 어느 면을 보던 중이었는지가 사라진다.
 */
function 빠져나가기() {
  선택.value = { 면: 선택.value?.면 ?? 0, 레이어: '배경' }
  무대.value?.blur()
}
</script>

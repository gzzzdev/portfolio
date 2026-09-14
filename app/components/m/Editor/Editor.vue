<template>
  <div
    class="m-본문편집 relative w-full"
    :class="틀.틀"
  >
    <!--
      **손잡이는 둘이고, 이름도 둘이다 — `툴바`(펴면 서는 위 줄)와 `툴바mini`(지금 자리에 제 발로 오는 것).**
      표가 셋째를 부르지 않은 것도 이 줄 때문이다 — 표전용 손잡이를 따로 세우는 대신 `툴바mini` 가
      **뜨는 조건**만 넓혔다(고른 글자 → 지금 자리의 손). 이름이 늘면 사람이 셋을 배운다.

      **표 가장자리의 `+` 둘은 셋째가 아니다.** 이름 붙은 손잡이는 「무엇을 할 수 있나」를 늘어놓는 것이고,
      저건 표가 제 몸에 달고 있는 것이다 — 마우스를 얹어야 나오고, 어휘 목록에도 안 선다(`표그립`).

      **툴바는 두 층이고 사이에 줄 하나가 선다.**
      **기본**(제목·서식·정렬)은 **고른 자리에 그 자리에서 거는 것**이라 어느 편집기에나 있는 동작이고,
      **개발**(문단·상자·구조·미디어·데이터)은 **덩어리를 넣는 것**이라 우리가 정한 어휘다.
      **툴바mini 는 기본 층 그대로다** — 같은 배열을 걸러 쓰므로 순서가 어긋날 자리가 없다.
      **지금 `개발` 층은 `미디어`·`표` 만 선다** (2026-09-12 에 뺐고 09-14 에 `미디어` 만 되돌렸다) — `숨긴묶음s`.
      제목이 `문단`(개발)이 아니라 여기 선 이유도 그것이다 — 고른 글자 위에서 「이 줄을 제목으로」는
      늘 있는 손인데, 층을 옮기지 않으면 mini 에 들일 길이 목록을 두 번 적는 것뿐이었다.

      **어휘는 이 파일에 한 글자도 없다.** `::` 버튼은 사전(`MDC블록s`)이 만들고, 눌렀을 때 무엇이
      생기는지는 노드 정의 옆의 `누를때`(`확장.ts`)가 정한다 — 사전에만 있고 거기 없는 이름은 **막힌 채**
      뜬다. 묶음의 경계도 사전의 `묶음` 이 정한다. 색·글자크기 버튼은 **일부러 없다.** 어휘 밖은 누를 게 없다.
      `켜짐` 은 「지금 커서가 그 안에 있다」는 표시고, 한 번 더 누르면 벗겨진다(알림·요점·절차·나란히·정렬).

      **`::` 가 아닌 것 셋은 손으로 적는다** — 서식·문단·정렬. 사전이 만드는 건 `::` 어휘뿐이고,
      이 셋은 md 의 기본 문법(`**`·`~~`·`-`)이거나(서식·문단) 값이 넷이라 버튼 하나로 안 되는 것(정렬)이다.
      그래서 사전의 `문단` 묶음(`align`)은 아래 루프가 안 돈다.

      **밑줄은 없다.** 못 넣은 게 아니라 md 에 밑줄이 없어서다 — 확장부터 꺼져 있다(`확장.ts` 의 `underline: false`).
      **제목은 넷이고, 펼쳐서 고른다** — `h1`~`h4` 에 「본문으로」까지 다섯이라 이어붙이면 줄의 절반을
      먹는다. 그래서 `기본` 층의 `제목` 묶음이 **손잡이 하나**로 서고 누르면 아래로 목록이 뜬다.
      **h5·h6 은 없다** — 확장(`확장.ts`)도 읽기 화면의 옷(`prose.ts`)도 넷에서 닫혀 있다.

      **수정 모드의 기본은 펴짐이다 (2026-09-12 에 뒤집었다).** 열면 위 줄이 서 있고, 접는 건 액자
      윗변의 **띠** 하나다(아래). 읽기 모드에는 이 값이 안 걸린다 — 크롬 자체가 `v-if="!readonly"` 라
      툴바도 띠도 안 그려진다.

      뒤집기 전에는 기본이 접힘이었다. 화면에 처음 오는 것이 **버튼 스무 개가 아니라 글**이어야
      한다는 것이었고(옵시디언·노션이 서 있는 자리), 「본문을 고친다」는 **글자를 골라서** 하는
      일이라 그 손잡이(`툴바mini`)는 고르는 순간 제 발로 온다는 것까지 맞는 말이었다.
      **진 것은 어휘다** — 아래 「대가」가 그 값을 적어 뒀고, 그게 기본값을 뒤집은 이유다.

      **여는 손잡이는 아이콘이 아니라 자리다 — 액자 위쪽 가로 전체가 「띠」다.**
      가만히 있을 때 보이는 건 가운데의 짧은 실선 한 토막뿐이고(면도 테두리도 없다), 손이 얹히면
      띠가 아주 옅게 뜨면서 그 토막이 넓어진다. **어디를 눌러야 하는지를 아이콘이 아니라 넓이가
      말한다** — 아이패드 시트의 그래버와 같은 물건이고, 같은 이유로 얇다. 조준할 것이 없으니
      눌러야 할 자리를 못 맞힐 일도 없다.

      **`v` 아이콘은 자리를 바꿔 가며 두 번 해 보고 걷었다.** 액자 구석에 두든 선 가운데에 두든
      그건 「나 아이콘이오, 여기만 누르시오」라고 말하는 물건이라, 글만 있어야 할 판 위에서 혼자 튄다.
      (구석의 `v` 는 구글 독스 compact mode 의 것이고, 거기선 툴바가 기본으로 **보이고** 그 `v` 는
      이미 툴바를 아는 사람이 **숨기려고** 누른다. 기본이 펴짐이 된 지금은 우리 띠도 같은 일을 한다 —
      한동안은 하나뿐인 문을 「숨기기 토글」의 자리에 둔 셈이었으니, 그 어긋남은 없어졌다.
      그래도 `v` 는 안 돌아온다. 걷은 이유가 기본값이 아니라 **글만 있어야 할 판 위에서 아이콘이
      혼자 튄다**는 것이었고, 그건 그대로다.)

      **접는 손잡이도 같은 띠다 — 손잡이는 하나뿐이다.** 띠 한 장이 늘 서 있고 서랍이 그 위에서
      열리고 닫힌다: 접히면 띠가 액자의 맨 위고, 펴면 툴바 아래다. 띠가 늘 크롬의 마지막 층이라
      **도구와 글을 가르는 선도 띠가 진다**(`_/틀.ts` 의 `띠선`, 펴진 동안에만). 접힌 동안에는
      선이 없다 — 크롬이 띠뿐인데 그 아래 줄을 그으면 걷어낸 「빈 띠 + 선」이 그대로 돌아온다.

      **접힘의 대가는 어휘가 안 보인다는 것이었다** — 펴 보기 전에는 「알림」·「절차」·「카드」가
      있다는 걸 알 길이 없다. 요구 1(md 를 모르는 사람)이 거기서 걸렸고, 그래서 기본을 뒤집었다.
      **판정은 그때도 지금도 화면에서 한다**(`/decisions/content/wysiwyg`).

      **띠로는 그 대가가 안 없어졌다.** 툴바를 기본으로 접고 사는 편집기들(노션·리니어·크래프트)에는
      **펴는 손잡이가 아예 없다** — 대신 `/` 를 치면 그 자리에 어휘 목록이 뜬다. 어휘가 손잡이가 아니라
      **타이핑**으로 들어오는 것이고, 그래서 판 위에 크롬이 한 점도 없어도 된다. 우리는 그게 없어서
      (`확장.ts` 에 suggestion 이 없다) 툴바가 어휘로 가는 유일한 문이다.
      **`/` 가 생기면 기본값을 다시 물을 수 있다** — 어휘가 타이핑으로 들어오면 접고도 잃는 게 없다.

      **접힘은 안 남는다** — 접었다가 다시 열면 또 펴져 있다.
    -->
    <!--
      **크롬은 붙박이다 (`sticky`, 2026-09-12).** 긴 글에서 스크롤해도 툴바가 화면 위에 남는다.
      서랍(툴바)과 띠를 **한 덩이로** 붙인다 — 띠만 두고 가면 접는 손잡이가 툴바에서 떨어지고,
      무엇보다 `띠선` 이 「이 아래로 글이 지나간다」를 말하는 유일한 채널이라 붙박이가 되면 더 중요해진다.

      **왜 필요한가** — 남은 묶음 셋 중 **제목·정렬은 커서만으로 되는 명령**인데, `툴바mini` 는
      고른 것이 있어야 뜬다(`툴바mini갱신` 머리말의 표: 「그냥 커서 → 안 뜬다」). 그래서 붙박이가
      아니면 긴 글 아래쪽에는 그 둘의 손잡이가 **아예 없는 구간**이 생긴다. 서식(굵게·기울임)은
      고르는 게 전제라 mini 로 족하니, 이 붙박이가 사는 값은 정확히 제목·정렬이다.

      **`bg-default` 는 줘야 한다 — 「툴바 줄에 면을 안 준다」와 어긋나지 않는다.** `_/틀.ts` 가 막은 것은
      **파임**(`bg-muted`)이다: 「여기 쓰는 자리」로 읽히는 음영이 편집판에 깔리면 읽기 화면과
      픽셀로 같아야 한다는 기준에 걸린다. `bg-default` 는 판과 같은 색이라 **안 밀린 동안에는 아무것도
      안 바뀌고**, 밀릴 때만 글을 가린다 — 면이 아니라 불투명이 필요한 것이다. `backdrop-blur` 는 안 쓴다
      (집 규약의 sticky 바는 쓰지만, 글 위를 흐리게 지나가면 읽는 판이 산만하고 액자 안이라 섞일 바깥도 없다).
      `rounded-t-md` 는 액자의 `rounded-md` 와 같은 값 — 액자가 자식을 안 자르므로 안 주면 이 면이
      모서리를 네모지게 덮는다.

      **`top-0` 이다 — `--ui-layout-header-offset` 이 아니다.** 그 변수는 `lHeader` 가 **헤더 높이**를
      적는 것이고 헤더가 `fixed` 인지와 무관하게 적는다(`l/Header.vue`). 그런데 `default.vue` 는
      `is고정`·`is투명` 을 안 켜서 헤더가 `relative` 다 — 밀면 헤더가 같이 올라가 사라진다.
      그때 그 변수를 물면 툴바가 헤더 높이만큼 아래에 멈춰 **죽은 띠**가 생긴다.
      `is고정` 을 쓰는 레이아웃에 이 편집기가 서게 되면 그때 오프셋을 물릴 자리다.

      **`z-20` 은 `툴바mini` 와 같은 값이고, 그래서 맞다.** mini 는 판 안에 있어 DOM 에서 이 블록보다
      뒤라 같은 층이면 위로 온다 — 화면 위쪽에서 글자를 골라도 mini 가 툴바에 안 가린다.
      반대로 `표그립`(`z-10`)은 이 아래로 내려가야 한다: 표가 툴바 밑으로 밀렸을 때 `+` 가
      툴바 위에 뜨면 안 된다.
    -->
    <div
      v-if="!readonly && editor"
      class="sticky top-0 z-20 rounded-t-md bg-default"
    >
      <!--
        **서랍.** `grid-rows-[0fr] → [1fr]` 로 편다 — `height: auto` 는 전이가 안 되는데
        이 꼴은 **내용 높이 그대로** 밀린다(도크가 실측을 포기하고 고정 높이로 간 그 문제를
        여기서는 안 만난다: `useDock.ts`). 접힘은 줄을 지우는 게 아니라 **높이를 0 으로 누른 것**이라,
        펴면 글이 아래로 밀려 내려간다. 손잡이를 눌러 서랍을 당긴 것처럼 보이는 게 이 축이다.

        **`overflow-hidden` 은 미는 동안에만 건다(`펼침끝`).** 계속 걸어두면 `mButton묶음` 의 제목 목록이
        잘린다 — 그건 포털이 아니라 툴바 안에 `absolute` 로 사는 진짜 자식이다(`m/Button/묶음.vue`).
        **`inert` 은 눌린 동안 건다.** 안 걸면 높이 0 에 눌린 버튼 스무 개가 탭 순서에 그대로 남는다.
      -->
      <div
        class="grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none"
        :class="툴바보임 ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'"
      >
        <div
          :class="펼침끝 ? undefined : 'overflow-hidden'"
          :inert="!툴바보임"
        >
          <div
            class="flex flex-row flex-wrap items-center gap-x-3 gap-y-1.5"
            :class="틀.툴바"
          >
            <template
              v-for="(층, i) in 툴바층s"
              :key="층.층"
            >
              <!-- 층이 갈리는 자리에 줄 하나. 위는 고른 글자에 거는 것, 아래는 덩어리를 넣는 것. -->
              <div
                v-if="i"
                class="h-4 w-px shrink-0 bg-accented"
              />
              <mButton묶음
                v-for="묶음 in 층.묶음s"
                :key="묶음.이름"
                :이름="묶음.이름"
                :항목s="묶음.항목s"
                :라벨보임="라벨보임"
                :아이콘크기="묶음.아이콘크기"
                @누름="누르기"
              />
            </template>
            <div class="grow" />
            <mButton
              역할="조용"
              size="xs"
              icon="i-lucide-circle-help"
              :label="라벨보임 ? '도움말' : undefined"
              :켜짐="라벨보임"
              :title="라벨보임 ? '버튼 이름 감추기' : '버튼 이름 보이기'"
              :aria-pressed="라벨보임"
              @click="라벨보임 = !라벨보임"
            />
          </div>
        </div>
      </div>

      <!--
        **띠 — 서랍의 손잡이 하나.** 아이콘 하나가 아니라 **가로 전체가 누를 수 있는 자리**다.
        접기도 펴기도 이것뿐이라 늘 서 있고, 서랍이 이 위에서 열리고 닫힌다.
        「여기만 누르시오」라고 말하는 버튼을 안 세우려고 이렇게 됐다: 가만히 있을 때 보이는 것은
        가운데의 실선 한 토막뿐이고(면도 테두리도 없다), 손이 얹히면 띠 전체가 아주 옅게 뜨면서
        그 토막이 넓어진다. **어디를 눌러야 하는지를 아이콘이 아니라 넓이가 말한다.**

        `<button>` 을 손으로 적는다 — `mButton` 은 「누르는 물건」의 어휘고 이건 물건이 아니라
        **자리**다. 재질·색 축을 태우면 그 순간 버튼으로 보인다.
        `h-0.5` 는 2px 다. 아이패드 시트의 그래버와 같은 물건이고, 같은 이유로 얇다.

        `rounded-t-md` 는 액자의 `rounded-md` 와 같은 값 — 안 주면 hover 면이 액자 모서리 밖으로 삐진다.
        `mousedown.prevent` 는 **커서를 지키려고** 건다. 툴바를 펴는 건 글을 고치려는 것인데
        여는 순간 편집판이 포커스를 잃으면 방금 있던 자리를 다시 찍어야 한다(`툴바mini` 와 같은 이유).

        **띠는 안 사라지므로 띠 쪽에는 전이가 없다.** 움직이는 것은 서랍뿐이고 띠는 그 아래 모서리에
        붙어 같이 내려갔다 올라온다 — 손잡이가 제자리에 있는 채로 서랍만 밀리는 꼴이다.
      -->
      <button
        type="button"
        class="group flex w-full cursor-pointer items-center justify-center py-2 transition-colors hover:bg-elevated/40"
        :class="툴바보임 ? 틀.띠선 : 'rounded-t-md'"
        :title="툴바보임 ? '툴바 접기 — 고른 글자 위에 뜨는 것만 남는다' : '툴바 펴기'"
        :aria-label="툴바보임 ? '툴바 접기' : '툴바 펴기'"
        :aria-expanded="툴바보임"
        @mousedown.prevent
        @click="툴바보임 = !툴바보임"
      >
        <span class="h-0.5 w-8 rounded-full bg-accented transition-[width] duration-200 ease-out group-hover:w-14 motion-reduce:transition-none" />
      </button>
    </div>

    <!--
      `m-본문` 은 **글자 크기 한 자리**다(`assets/css/mTheme.css`). 읽기판의 `<MDC>` 와 같은 값을 물어야
      해서 이 컴포넌트 안이 아니라 거기 산다. 위 줄(툴바)은 안 감싼다 — 손잡이는 자기 `text-xs` 를
      rem 으로 지고 있어 영향은 없지만, 이 클래스가 말하는 건 「글이 서는 자리」다.
    -->
    <div
      ref="판"
      class="m-본문 relative"
      :class="틀.판"
      @mousemove="표그립갱신"
      @mouseleave="표그립 = null"
    >
      <EditorContent :editor="editor" />

      <!--
        **표 가장자리의 `+` 둘.** 마우스를 표에 얹으면 오른쪽·아래에 뜨고, 누르면 맨 끝에 칸/줄이 하나 붙는다.
        까닭과 그리는 방식은 `표그립` 머리말이 정본. `mousedown.prevent` 로 고른 자리를 지킨다 —
        누르는 동안 커서가 표 밖으로 튀면 방금 보던 표가 아닌 게 된다.
      -->
      <template v-if="표그립 && !readonly">
        <button
          type="button"
          class="m-본문-표그립 absolute z-10 flex w-4 cursor-pointer items-center justify-center rounded bg-elevated text-dimmed transition-colors hover:bg-accented hover:text-default"
          :style="{
            left: `${Math.min(표그립.왼 + 표그립.폭 + 2, (판폭 || 표그립.왼 + 표그립.폭 + 18) - 16)}px`,
            top: `${표그립.위}px`,
            height: `${표그립.높이}px`
          }"
          title="뒤에 칸 추가하기"
          @mousedown.prevent
          @click="끝에더하기('칸')"
        >
          <UIcon
            name="i-lucide-plus"
            class="size-3 shrink-0"
          />
        </button>
        <button
          type="button"
          class="m-본문-표그립 absolute z-10 flex h-4 cursor-pointer items-center justify-center rounded bg-elevated text-dimmed transition-colors hover:bg-accented hover:text-default"
          :style="{ left: `${표그립.왼}px`, top: `${표그립.위 + 표그립.높이 + 2}px`, width: `${표그립.폭}px` }"
          title="뒤에 줄 추가하기"
          @mousedown.prevent
          @click="끝에더하기('줄')"
        >
          <UIcon
            name="i-lucide-plus"
            class="size-3 shrink-0"
          />
        </button>
      </template>

      <!--
        **툴바mini — 지금 자리에 걸리는 손이 제 발로 오는 것.** 글자를 끌어 고르면 그 위에 뜨고
        (한글·워드에서 아는 동작이다), **표 안에 커서만 둬도 표 위에 뜬다.**
        표가 갈래를 하나 더 낸 이유는 위 줄이 기본으로 접혀 있어서다 — 줄·칸 손잡이는 커서만 두고 쓰는 것이라
        고른 범위가 없고, 접힌 동안에는 여기 말고 올 데가 없다. 뜨는 조건·매다는 자리는 `툴바mini갱신` 의 표가 정본.

        **내용은 여전히 여기서 안 적는다** — 기본 층(제목·서식·정렬)과 `표묶음` 을 그대로 물려받고
        순서도 위 줄과 같다. 덩어리를 넣는 것(문단·상자·구조·…)은 안 온다.
        `mousedown.prevent` 로 편집판의 포커스와 고른 범위를 지킨다.
      -->
      <div
        v-if="툴바mini"
        ref="미니"
        class="m-본문-툴바mini m-층-드롭다운 absolute z-20 flex w-max flex-row flex-wrap items-center gap-x-3 gap-y-1.5 rounded-lg border border-default bg-default px-2 py-1.5"
        :style="{
          left: `${툴바mini.x}px`,
          top: `${툴바mini.y}px`,
          transform: 'translate(-50%, calc(-100% - 8px))',
          maxWidth: 판폭 ? `${판폭}px` : undefined
        }"
        @mousedown.prevent
      >
        <mButton묶음
          v-for="묶음 in 툴바mini묶음s"
          :key="묶음.이름"
          :이름="묶음.이름"
          :항목s="묶음.항목s"
          :라벨보임="라벨보임"
          :아이콘크기="묶음.아이콘크기"
          @누름="누르기"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 본문 입력 — **보이는 대로 고치기.** md 도 HTML 도 모르는 사람이 쓰는 본문 편집기.
 *
 * ## 무엇인가
 *
 * 화면은 하나고, 거기 보이는 것이 곧 완성 화면이다. 제목은 제목 크기로, `::note` 는 진짜 알림 카드로 뜨고,
 * 그 그림 위에서 바로 타이핑된다. 글자를 끌어 고르면 툴바mini가 떠서 제목·굵게·기울임·정렬을 걸고,
 * 표 안에 커서를 두면 같은 것이 표 위에 떠서 줄·칸을 더하고 뺀다. 표에 마우스를 얹으면
 * 오른쪽·아래 가장자리에 `+` 가 떠서 맨 끝에 칸·줄을 붙인다.
 * 편집판과 미리보기를 나누지 않는다 — **원본이 화면의 번역본이 아니라서** 미리보기 창이 존재 이유를 잃었다.
 *
 * ## 원본은 객체다
 *
 * `v-model` 은 md 문자열이 아니라 **문서 객체(ProseMirror JSON, `~utils/mdc/doc` 의 `iPM노드`)** 다.
 * md 로 오가는 일은 이 컴포넌트 밖에서 일어난다 — 저장·불러오기 경계(`본문md.vue`)와 도우미·`.md` 내보내기.
 * 그래서 이 컴포넌트에는 직렬화가 없고, 사람이 고치는 동안에는 왕복 무손실이라는 문제 자체가 없다.
 * 그 결정의 근거와 아는 손실은 `doc.ts` 머리말이 정본이다.
 *
 * ## 그림이 같은 이유
 *
 * 문단·제목·목록·표는 읽기 렌더러(@nuxt/ui prose)의 클래스를 그대로 입고(`_/prose.ts`),
 * 알림·사진·나란히·영상·목록은 **읽기 컴포넌트(`mdc/*.vue`) 자체**를 노드뷰로 쓴다. 카드·탭·접기는 부품(제목·
 * 머리줄·질문)이 속성이라 같은 테마로 다시 그렸다. 편집판에만 있는 CSS 는 아래 `<style>` 의 몇 줄이고,
 * 전부 「읽기 화면이 문단 껍데기를 벗기는 자리(`mdc-unwrap`)」를 흉내 내는 것이다. 그 밖의 차이가 보이면 버그다.
 *
 * ## 어휘는 이 파일에 없다
 *
 * `::` 버튼의 목록은 사전(`~utils/mdc/blocks`)이, 눌렀을 때 생기는 것은 `_/확장.ts` 의 `누를때` 가 쥔다.
 * 어휘를 하나 늘릴 때 이 파일은 안 바뀐다. **아직 손잡이가 없는 것도 거기서 읽힌다** — `누를때` 에
 * 칸이 없는 이름은 툴바에 막힌 채로 뜬다(지금은 사진·영상·목록. 주소를 받을 칸이 있어야 해서다).
 *
 * ## 폼에는 어댑터를 거쳐 붙는다
 *
 * `타입지정._.문자md` 가 이걸 쓰는데, **여기 값은 객체고 저장되는 값은 md 문자열이다.**
 * 그 사이를 `본문md.vue` 가 잇는다 — 이 파일은 md 를 한 글자도 모르는 채로 둔다.
 * 왜 저장이 md 인지와 그 대가는 그 어댑터 머리말이 정본이다.
 */
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useResizeObserver } from '@vueuse/core'
import { EditorContent, useEditor, type Editor } from '@tiptap/vue-3'
import { TextSelection } from '@tiptap/pm/state'
import { CellSelection, TableMap, addColumn, addRow, isInTable, selectedRect } from '@tiptap/pm/tables'
import { useAppConfig } from '#imports'
import { MDC블록s } from '~utils/mdc/blocks'
import { 노드타입of, 빈문서, type iPM노드 } from '~utils/mdc/doc'
import { prose클래스s } from './_/prose'
import { 본문틀 } from './_/틀'
import { 누를때, 본문확장s, type i누를때 } from './_/확장'

interface Props {
  readonly?: boolean
}
const props = withDefaults(defineProps<Props>(), { readonly: false })

const model = defineModel<iPM노드 | null>({ default: null })

interface i손잡이 {
  key: string
  아이콘: string
  라벨?: string
  도움말?: string
  켜짐?: boolean
  막힘?: boolean
  /** 있으면 눌렀을 때 아래로 목록이 뜬다(`mButton묶음` 의 펼치는 항목). 제목 층 고르기가 유일한 손님. */
  하위s?: i손잡이[]
}

interface i툴바묶음 {
  이름: string
  항목s: i손잡이[]
  /** 이 묶음만 아이콘을 키운다. `표` 하나뿐이고, 그 까닭은 `표버튼s` 머리말에 있다. */
  아이콘크기?: string
}

const appConfig = useAppConfig()
const 클래스s = prose클래스s(appConfig)

/** 액자 — 외곽선 하나와 그림자뿐이다(`_/틀.ts`). 남은 축(반경·그림자)은 CSS 변수로 내려온다. */
const 틀 = computed(() => 본문틀(props.readonly))

const 판 = ref<HTMLElement | null>(null)
const 미니 = ref<HTMLElement | null>(null)
/**
 * 판의 폭. **`툴바mini` 의 폭 한계로 쓰인다** — 그리고 그게 이 값이 따로 있는 이유다.
 * `absolute` 요소는 폭을 안 주면 「담는 상자 폭 − `left`」 만큼만 쓸 수 있어서, 밀어 놓으면 좁아지고
 * 좁아지면 다시 밀리는 되돌이가 생긴다(실제로 세 줄로 접혔다). 그래서 폭을 **자리에서 떼어** 여기서 준다.
 */
const 판폭 = ref(0)
const 포커스 = ref(false)
/** `가운데` 는 밀기 전의 원래 자리다 — 폭을 잰 뒤 다시 밀 때 기준이 필요해서 같이 들고 있는다. */
const 툴바mini = ref<{ x: number, y: number, 가운데: number } | null>(null)

/** 내가 낸 변경이 `v-model` 로 되돌아올 때 다시 `setContent` 하지 않기 위한 표시. */
let 내가바꿈 = false

const editor = useEditor({
  extensions: 본문확장s(클래스s),
  content: model.value ?? 빈문서,
  editable: !props.readonly,
  editorProps: { attributes: { class: 'm-본문편집-판 outline-none' } },
  onUpdate: ({ editor: e }) => {
    내가바꿈 = true
    model.value = e.getJSON() as iPM노드
  },
  // `transaction` 은 view 가 새 상태를 그린 **뒤**에 온다 — 그래서 좌표를 여기서 잰다.
  onTransaction: ({ editor: e }) => 툴바mini갱신(e),
  onFocus: ({ editor: e }) => {
    포커스.value = true
    툴바mini갱신(e)
  },
  onBlur: () => {
    포커스.value = false
    툴바mini.value = null
  }
})

watch(model, (v) => {
  if (내가바꿈) {
    내가바꿈 = false
    return
  }
  editor.value?.commands.setContent(v ?? 빈문서, { emitUpdate: false })
})
watch(() => props.readonly, v => editor.value?.setEditable(!v))

/**
 * 표의 겉 상자(`TableView` 가 만드는 `div.root`). 표 안에 커서가 있을 때 `툴바mini` 가 매달릴 자리다.
 * **칸이 아니라 표에 매단다** — 칸에 매달면 칸을 옮길 때마다 손잡이가 따라 뛰고, 바로 위 칸을 가린다.
 */
function 표DOM(e: Editor): HTMLElement | null {
  if (!isInTable(e.state)) return null
  const dom = e.view.nodeDOM(selectedRect(e.state).tableStart - 1)
  return dom instanceof HTMLElement ? dom : null
}

/**
 * `툴바mini` 가 뜰지, 뜬다면 어디에 뜰지. **뜨는 조건은 「고른 글자가 있다」가 아니라 「지금 자리에 손이 있다」다.**
 * 갈래가 둘인 이유는 표 때문이다 — 표의 줄·칸 손잡이는 **커서만 두고** 쓰는 것이라 고른 범위가 없고,
 * 위 줄이 접혀 있으면(기본값) 그 손잡이가 여기 말고는 올 데가 없다.
 *
 * | 지금 자리 | 뜨나 | 매다는 곳 |
 * |---|---|---|
 * | 글자를 골랐다 | 뜬다 | 고른 범위 위 |
 * | 칸을 여럿 골랐다(`CellSelection`) | 뜬다 | 표 위 — 칸 범위는 좌표를 잴 `from`·`to` 가 글자가 아니다 |
 * | 표 안에 커서만 있다 | 뜬다 | 표 위 |
 * | 그 밖(원자 노드를 골랐다·그냥 커서) | 안 뜬다 | — |
 *
 * 표 위에 매다는 값은 **표 앞 문단을 잠깐 가린다는 것**이다. 표에서 커서를 빼면 곧 사라지고,
 * 고른 범위 위에 뜰 때 윗줄을 가리는 것과 같은 종류라 규칙을 하나로 뒀다.
 */
function 툴바mini갱신(e: Editor) {
  const 판el = 판.value
  if (!판el || props.readonly || !포커스.value) {
    툴바mini.value = null
    return
  }
  const sel = e.state.selection
  const 글자고름 = !sel.empty && sel instanceof TextSelection
  const 표el = 글자고름 ? null : 표DOM(e)
  if (!글자고름 && !표el) {
    툴바mini.value = null
    return
  }
  const r = 판el.getBoundingClientRect()
  let 좌: number, 우: number, 위: number
  if (글자고름) {
    const 시작 = e.view.coordsAtPos(sel.from)
    const 끝 = e.view.coordsAtPos(sel.to)
    좌 = 시작.left
    우 = 끝.left
    위 = Math.min(시작.top, 끝.top)
  } else {
    const b = 표el!.getBoundingClientRect()
    좌 = b.left
    우 = b.right
    위 = b.top
  }
  const 가운데 = (좌 + 우) / 2 - r.left
  툴바mini.value = { 가운데, x: 판안으로(가운데), y: 위 - r.top }
}

/**
 * 표 가장자리 손잡이 — **마우스를 표에 얹으면 오른쪽·아래에 `+` 가 뜬다.** 옵시디언·노션에서 아는 그것.
 *
 * ## 왜 툴바가 있는데도 이게 필요한가
 *
 * 툴바의 `오른쪽 칸` 은 「먼저 커서를 맞는 칸에 두고, 그다음 버튼을 누른다」다. 여기 `+` 는
 * **누른 자리가 곧 생길 자리**라 그 번역이 없다. 그리고 놀고 있을 때 화면을 안 먹는다 —
 * 표를 늘리는 흔한 두 동작에서 `툴바mini` 가 앞 문단을 가리는 대가가 통째로 사라진다.
 *
 * **손잡이 셋째가 아니다.** 이름이 붙는 손잡이(툴바·툴바mini)는 「무엇을 할 수 있나」를 늘어놓는 것이고,
 * 이건 표가 제 몸에 달고 있는 것이다 — 칸 너비를 끄는 손잡이와 같은 부류. 그래서 어휘 목록에도 안 선다.
 *
 * ## 어떻게 그리나
 *
 * **편집기 안을 안 건드린다.** 노드뷰에 남의 DOM 을 넣으면 ProseMirror 의 변경 감시(`ignoreMutation`)와
 * 다투게 되는데, `툴바mini` 가 이미 「판 위에 뜨는 층」이라 같은 자리를 쓰면 그 다툼이 아예 없다.
 * 좌표는 마우스 밑의 `<table>` 을 재서 판 기준으로 옮긴 것이고, 누를 때 쓸 표는 `pos`(문서 좌표)로 들고 있는다.
 *
 * **더하는 자리는 늘 맨 끝이다** — 커서가 어디 있든 상관없다. `addColumn`/`addRow` 를 직접 불러서
 * **고른 자리를 안 건드린다**(툴바 명령은 커서를 옮긴다). 앞에 넣기·빼기는 여전히 `표` 묶음의 일이다.
 */
const 표그립 = ref<{ 왼: number, 위: number, 폭: number, 높이: number, pos: number } | null>(null)
/** 같은 표 위를 지나는 동안 `posAtDOM` 을 매번 다시 풀지 않으려는 기억. */
let 최근표: HTMLElement | null = null

/** 표 노드가 선 자리(문서 좌표). DOM 에서 되짚는다. */
function 표pos(e: Editor, 표el: HTMLElement): number | null {
  try {
    const $p = e.state.doc.resolve(e.view.posAtDOM(표el, 0))
    for (let d = $p.depth; d > 0; d--) if ($p.node(d).type.name === 'table') return $p.before(d)
    return null
  } catch {
    return null
  }
}

function 표그립갱신(ev: MouseEvent) {
  const 판el = 판.value
  const e = editor.value
  if (!판el || !e || props.readonly) {
    표그립.value = null
    return
  }
  const 밑 = ev.target as HTMLElement | null
  // 손잡이 자신 위에 올라간 것이면 그대로 둔다 — 안 그러면 누르러 가는 길에 사라진다.
  if (밑?.closest('.m-본문-표그립')) return
  const 표el = 밑?.closest('table') as HTMLElement | null
  if (!표el || !판el.contains(표el)) {
    최근표 = null
    표그립.value = null
    return
  }
  const pos = 표el === 최근표 && 표그립.value ? 표그립.value.pos : 표pos(e, 표el)
  if (pos === null) {
    표그립.value = null
    return
  }
  최근표 = 표el
  표그립.value = { ...표자리(표el, 판el), pos }
}

function 표자리(표el: HTMLElement, 판el: HTMLElement) {
  const b = 표el.getBoundingClientRect()
  const r = 판el.getBoundingClientRect()
  return { 왼: b.left - r.left, 위: b.top - r.top, 폭: b.width, 높이: b.height }
}

/** 표의 **맨 끝**에 줄/칸 하나. `표그립` 이 들고 있는 표에 건다 — 커서가 어디 있든 상관없다. */
function 끝에더하기(축: '칸' | '줄') {
  const e = editor.value
  const g = 표그립.value
  if (!e || !g) return
  const node = e.state.doc.nodeAt(g.pos)
  if (node?.type.name !== 'table') return
  const map = TableMap.get(node)
  const rect = { map, table: node, tableStart: g.pos + 1, left: 0, top: 0, right: map.width, bottom: map.height }
  const tr = e.state.tr
  if (축 === '칸') addColumn(tr, rect, map.width)
  else addRow(tr, rect, map.height)
  e.view.dispatch(tr)
  // 표가 커졌으니 손잡이도 따라가야 한다. 마우스가 안 움직여 `표그립갱신` 이 안 도는 자리다.
  nextTick(() => {
    const dom = e.view.nodeDOM(g.pos)
    const 표el = dom instanceof HTMLElement ? dom.querySelector('table') : null
    const 판el = 판.value
    if (표el && 판el && 표그립.value) 표그립.value = { ...표자리(표el, 판el), pos: g.pos }
  })
}

/**
 * `툴바mini` 의 가로 자리를 **판 안으로 민다.** 이게 없으면 판 가장자리에서 고른 글자 위에 뜰 때
 * 손잡이의 절반이 편집판 밖으로 나간다(가운데 기준으로 `-50%` 옮겨 놓기 때문).
 *
 * **폭은 재서 쓴다.** 한동안 `160`(= 폭 320 을 가정)이 박혀 있었는데, 표 묶음이 붙으면서 mini 가
 * 두 배 가까이 넓어져 그 상수가 거짓이 됐다. 아직 안 그려졌을 때만 320 으로 친다.
 */
function 판안으로(가운데: number) {
  const 폭 = 판폭.value || (판.value?.clientWidth ?? 0)
  const 반 = (미니.value?.offsetWidth ?? 320) / 2 + 4
  return Math.min(Math.max(가운데, 반), Math.max(반, 폭 - 반))
}

/**
 * 폭이 바뀌면 다시 민다. **`갱신` 안에서 재는 것만으론 늦다** — `onTransaction` 은 ProseMirror 가
 * 부르는 것이라 Vue 가 묶음을 다시 그리기 **전**이고, 그 순간 재면 방금까지의 폭이 잡힌다
 * (표 안에서 글자를 고르면 묶음이 하나에서 넷으로 늘어 폭이 두 배가 된다 — 정확히 이 자리에서 어긋났다).
 * 그래서 「언제 그려졌나」를 맞히는 대신 **폭이 바뀌는 것을 듣는다.** `x` 는 폭에 영향을 안 줘서 돌지 않는다.
 */
useResizeObserver(미니, 다시밀기)
useResizeObserver(판, () => {
  // `contentRect` 가 아니라 `clientWidth` 다 — 좌표는 판의 **테두리 상자** 기준으로 재는데
  // `contentRect` 는 패딩을 뺀 값이라 그만큼 어긋난다(그립이 표 안으로 들어갔다).
  판폭.value = 판.value?.clientWidth ?? 0
  다시밀기()
})
function 다시밀기() {
  const t = 툴바mini.value
  if (t) t.x = 판안으로(t.가운데)
}

// ── 툴바 (펴면 서는 위 줄) ──

/**
 * 툴바를 폈나. **수정 모드의 기본은 펴짐** (2026-09-12). 어휘(「알림」·「절차」·「카드」)로 가는 문이
 * 툴바뿐이라, 접어 두면 md 를 모르는 사람에게는 그 어휘가 없는 것과 같았다 — 뒤집은 경위와
 * 접힘이 원래 노렸던 값은 `Editor.vue` 머리말이 정본이다.
 *
 * **읽기 모드에는 이 값이 안 걸린다** — 크롬 전체가 `v-if="!readonly"` 다. 그래서 초기값을
 * `readonly` 로 갈라 둘 이유도 없다. 접힌 동안에도 `툴바mini` 는 그대로 뜬다.
 *
 * **접히면 줄이 아예 안 그려진다.** 빈 껍데기를 남기면 높이와 `border-b` 만 남아 「버튼이 안 뜬
 * 툴바」로 읽힌다(`Editor.vue` 머리말). 접힌 동안의 크롬은 액자 윗변의 띠 하나다.
 *
 * **안 남는다.** 접었다가 다시 열면 또 펴져 있다 — 남기려면 「어느 편집기의 접힘인가」를 정해야
 * 하는데 폼 하나에 이게 여럿 뜰 수 있어서 그 이름을 여기서 못 짓는다(`라벨보임` 도 같은 이유로 안 남는다).
 */
const 툴바보임 = ref(true)

/**
 * 서랍이 다 펴졌나. **`overflow-hidden` 을 언제 뗄지**만 정하는 값이다.
 *
 * 미는 동안에는 잘라야 서랍처럼 보이고, 다 펴진 뒤에는 잘리면 안 된다 — `mButton묶음` 의 제목 목록이
 * 툴바 안에 `absolute` 로 사는 진짜 자식이라 그대로 잘린다. 그래서 편 뒤에 뗀다.
 *
 * **`transitionend` 를 안 듣는다.** `grid-template-rows` 전이를 못 돌리는 브라우저에서는 그 이벤트가
 * 영영 안 와서 목록이 계속 잘린다 — 못 도는 쪽이 조용히 망가지는 신호다. 시간으로 재면 어디서든 뗀다.
 *
 * **초기값이 `툴바보임` 을 따라간다.** 아래 `watch` 는 `immediate` 가 아니라서 **처음부터 펴진 판
 * (수정 모드의 기본, 2026-09-12)에서는 한 번도 안 돈다** — `false` 로 두면 미는 동안이 아예 없는데도
 * `overflow-hidden` 이 남아 첫 화면부터 제목 목록이 잘린다(토글을 두 번 해야 풀렸다).
 * 처음부터 펴져 있으면 밀 것이 없으니 그 자리가 곧 「다 펴진」 상태다.
 */
const 펼침끝 = ref(툴바보임.value)
let 펼침타이머: ReturnType<typeof setTimeout> | null = null

/** 위 `duration-200` 과 같은 값. 둘이 갈리면 목록이 잘린 채로 뜨거나(짧으면) 늦게 열린다(길면). */
const 서랍전이ms = 200

watch(툴바보임, (편다) => {
  if (펼침타이머) clearTimeout(펼침타이머)
  if (!편다) {
    펼침끝.value = false
    return
  }
  펼침타이머 = setTimeout(() => (펼침끝.value = true), 서랍전이ms)
})

onBeforeUnmount(() => {
  if (펼침타이머) clearTimeout(펼침타이머)
})

const 라벨보임 = ref(false)

/**
 * 제목 층 다섯. **사전이 아니라 확장이 정한 목록이다** — `확장.ts` 의 제목 노드가 `h1`~`h4` 만 그리고
 * (그 밖은 h2 로 접힌다), `doc.ts` 가 md 를 읽을 때도 `Math.min(4, …)` 로 접는다. **h5·h6 은 없다** —
 * 못 넣은 게 아니라 읽기 화면의 옷이 넷뿐이라서다(`prose.ts` 의 `h: {1,2,3,4}`).
 *
 * **「본문」이 다섯째다** — 벗기는 자리를 목록 안에 두면 「지금 무엇인가」와 「무엇으로 바꾸나」가
 * 한 곳에서 읽힌다. 정렬의 `왼쪽` 과 같은 손이다.
 */
const 제목버튼s = [
  { level: 0, 아이콘: 'i-lucide-pilcrow', 라벨: '본문', 도움말: '제목을 벗기고 보통 문단으로' },
  { level: 1, 아이콘: 'i-lucide-heading-1', 라벨: '제목 1', 도움말: '제목 1 — 가장 큰 것' },
  { level: 2, 아이콘: 'i-lucide-heading-2', 라벨: '제목 2', 도움말: '제목 2' },
  { level: 3, 아이콘: 'i-lucide-heading-3', 라벨: '제목 3', 도움말: '제목 3' },
  { level: 4, 아이콘: 'i-lucide-heading-4', 라벨: '제목 4', 도움말: '제목 4 — 가장 작은 것' }
] as const

/**
 * 정렬 넷. **`왼쪽` 은 벗기는 버튼이다** — md 에서 왼쪽은 「감싸개가 없는 상태」라 `::align{to="left"}` 라는 건
 * 없다(사전이 `to` 를 셋으로 닫았다). 그래서 켜짐도 「`align` 안에 없다」로 읽는다.
 */
const 정렬버튼s = [
  { to: 'left', 아이콘: 'i-lucide-align-left', 라벨: '왼쪽', 도움말: '왼쪽 — 기본값. 정렬을 벗긴다' },
  { to: 'center', 아이콘: 'i-lucide-align-center', 라벨: '가운데', 도움말: '가운데. 표제·서명처럼 짧은 줄에' },
  { to: 'right', 아이콘: 'i-lucide-align-right', 라벨: '오른쪽', 도움말: '오른쪽' },
  { to: 'justify', 아이콘: 'i-lucide-align-justify', 라벨: '양쪽', 도움말: '양쪽 — 오른쪽 끝을 맞춘다' }
] as const

/**
 * 표 손잡이. **칸 합치기·쪼개기도, 칸 너비도 없다** — GFM 표에 실을 자리가 없어서다. 편집판에서만 되고
 * 저장하면 사라지는 것은 어휘가 아니다(`doc.ts` 「어휘가 닫히는 자리」). 여기 있는 일곱은 전부 md 로 왕복된다.
 *
 * **머리줄 켜고 끄기도 없다.** GFM 표는 머리줄이 반드시 있고(`|---|` 줄), 머리줄을 벗긴 표를 저장하면
 * 첫 몸줄이 머리줄이 되어 돌아온다. 벗길 수 없는 것에 버튼을 두지 않는다.
 *
 * ## 여기만 lucide 가 아니다
 *
 * 이 편집기의 다른 아이콘은 전부 `lucide` 인데 **일곱만 표 모양 아이콘이다**(더하기는
 * `material-symbols-light`, 빼기는 `mdi`). 이유는 lucide 에 **줄·칸 빼기 그림이 아예 없어서**고,
 * 화살표로 때우면 「줄 빼기」와 「칸 빼기」가 같은 `✕` 로 서서 축이 안 읽힌다. 걷어낸 구 편집기
 * (`mEditor2`, 2026-09-07 삭제)의 손잡이 줄도 두 벌을 섞어 쓰고 있었다 — 같은 벽이다.
 *
 * **크기도 여기만 16px 이다**(`아이콘크기`). 표 모양은 12px 로 찍으면 낙서가 된다 — 실제 크기로
 * 다섯 갈래를 그려 놓고 골랐다(2026-09-07). 나머지 묶음이 12px 로 버티는 건 그것들이 그림이 아니라
 * 기하(화살표·글자)라서다.
 */
const 표버튼s = [
  { 명령: 'addRowBefore', 아이콘: 'i-material-symbols-light-add-row-above-outline-rounded', 라벨: '위에 줄', 도움말: '이 줄 위에 새 줄' },
  { 명령: 'addRowAfter', 아이콘: 'i-material-symbols-light-add-row-below-outline-rounded', 라벨: '아래 줄', 도움말: '이 줄 아래에 새 줄' },
  { 명령: 'deleteRow', 아이콘: 'i-mdi-table-row-remove', 라벨: '줄 빼기', 도움말: '이 줄을 지운다' },
  { 명령: 'addColumnBefore', 아이콘: 'i-material-symbols-light-add-column-left-outline-rounded', 라벨: '왼쪽 칸', 도움말: '이 칸 왼쪽에 새 칸' },
  { 명령: 'addColumnAfter', 아이콘: 'i-material-symbols-light-add-column-right-outline-rounded', 라벨: '오른쪽 칸', 도움말: '이 칸 오른쪽에 새 칸' },
  { 명령: 'deleteColumn', 아이콘: 'i-mdi-table-column-remove', 라벨: '칸 빼기', 도움말: '이 세로줄을 지운다' },
  { 명령: 'deleteTable', 아이콘: 'i-mdi-table-remove', 라벨: '표 빼기', 도움말: '표를 통째로 지운다' }
] as const

/**
 * 표 안에서 `정렬` 묶음이 되는 것 — GFM 의 칸 정렬(`|:---:|`)이다. 값이 셋뿐이라(양쪽이 없다) 위 정렬과 다르고,
 * **한 칸이 아니라 그 칸이 선 세로줄 전체에 걸린다** — md 의 정렬이 칸이 아니라 열의 것이라서, 한 칸만 갈면
 * 저장할 때 그 줄의 다른 칸에 묻어 나간다. 같은 값을 한 번 더 누르면 벗겨진다(정렬 없음이 기본값).
 */
const 칸정렬버튼s = [
  { to: 'left', 아이콘: 'i-lucide-align-left', 라벨: '왼쪽' },
  { to: 'center', 아이콘: 'i-lucide-align-center', 라벨: '가운데' },
  { to: 'right', 아이콘: 'i-lucide-align-right', 라벨: '오른쪽' }
] as const

/**
 * 표 묶음 — **표 안에서만 생긴다.** 위 줄의 `개발` 층과 `툴바mini` 가 이 한 벌을 나눠 쓴다.
 * 목록을 두 번 적지 않는 규율은 `툴바mini` 가 기본 층을 물려받는 것과 같다(그 아래 `툴바mini묶음s`).
 *
 * `막힘` 은 「지금 이 자리에서 그 명령이 안 먹는다」 — 한 줄짜리 표의 `줄 빼기` 같은 것.
 */
const 표묶음 = computed<i툴바묶음[]>(() => {
  const e = editor.value
  if (!e?.isActive('table')) return []
  return [{
    이름: '표',
    아이콘크기: 'size-4',
    항목s: 표버튼s.map(b => ({
      key: `표:${b.명령}`,
      아이콘: b.아이콘,
      라벨: b.라벨,
      도움말: b.도움말,
      막힘: !e.can()[b.명령]()
    }))
  }]
})

/**
 * **툴바에서 잠시 뺀 묶음들 (2026-09-12).** `문단`·`상자`·`구조`·`데이터`.
 * `미디어` 는 2026-09-14 에 되돌렸다 — 자료에 받을 파일을 넣는 길(`::download`)이 이 묶음뿐이라서다.
 * `개발` 층에는 `미디어` 와 `표` 가 남는다(표는 표 안에 커서가 있을 때만 생긴다).
 *
 * **되돌리는 건 이 집합을 비우는 것 하나다.** 묶음을 만드는 코드도 사전(`MDC블록s`)도 그대로 뒀다 —
 * 지우면 다시 적어야 하고, 사전은 읽기 화면과 한 벌이라(`~utils/mdc/blocks`) 여기서 건드릴 것이 아니다.
 *
 * **버튼이 사라지는 것이고 어휘가 사라지는 게 아니다.** 글머리·번호·인용은 StarterKit 의 입력 규칙이
 * 그대로 살아 있어 `- `·`1. `·`> ` 를 치면 지금도 생긴다(`_/확장.ts` 의 `StarterKit.configure`).
 * **표만 예외다** — 넣는 길이 이 버튼뿐이라(표에는 입력 규칙이 없다) 새 표를 못 만든다. 이미 있는
 * 표는 커서를 두면 `표` 묶음이 그대로 뜬다.
 *
 * `툴바mini` 는 안 걸린다 — 기본 층과 `표묶음` 만 물려받는다(`툴바mini묶음s`).
 */
const 숨긴묶음s = new Set<string>(['문단', '상자', '구조', '데이터'])

/**
 * 툴바의 두 층. **사이에 줄 하나가 선다.** (지금 `개발` 층은 `숨긴묶음s` 때문에 `미디어`·`표` 뿐이다.)
 *
 * **기본**(제목·서식·정렬) — 고른 글자·문단에 **그 자리에서 거는 것.** 새로 생기는 덩어리가 없다.
 * **개발**(문단·표·상자·구조·미디어·데이터) — 문서에 **덩어리를 넣는 것.** 우리가 정한 어휘고,
 * 뒤 넷은 사전(`MDC블록s`)의 `묶음` 이 순서까지 정한다.
 *
 * **`툴바mini` 는 기본 층을 그대로 쓴다** — 한 배열에서 갈라 나오므로 둘의 순서가 어긋날 자리가 없다.
 */
const 툴바층s = computed<{ 층: '기본' | '개발', 묶음s: i툴바묶음[] }[]>(() => {
  const e = editor.value
  const 표안 = !!e?.isActive('table')
  const 서식: i손잡이[] = [
    { key: '굵게', 아이콘: 'i-lucide-bold', 라벨: '굵게', 도움말: '굵게', 켜짐: e?.isActive('bold') },
    { key: '기울임', 아이콘: 'i-lucide-italic', 라벨: '기울임', 도움말: '기울임', 켜짐: e?.isActive('italic') },
    { key: '취소선', 아이콘: 'i-lucide-strikethrough', 라벨: '취소선', 도움말: '취소선 — 지워진 것', 켜짐: e?.isActive('strike') }
  ]
  /**
   * 제목 — **버튼 다섯이 아니라 펼치는 손잡이 하나다.** 늘어놓으면 이 묶음 혼자 줄의 절반을 먹고,
   * 글자 위에 뜨는 `툴바mini` 에서는 아예 화면을 벗어난다. 접힌 값은 **버튼 얼굴에 남는다** —
   * 아이콘이 지금 커서가 선 층이고, 아무 층도 아니면 밋밋한 `heading` 이다.
   *
   * **개발이 아니라 기본 층에 선다.** 하는 일이 「지금 있는 문단을 그 자리에서 갈아 끼우는 것」이라
   * 새로 생기는 덩어리가 없다 — 정렬과 같은 부류다. 그 덕에 `툴바mini` 가 목록을 따로 안 적고 물려받는다.
   */
  const 지금층 = [1, 2, 3, 4].find(l => e?.isActive('heading', { level: l })) ?? 0
  const 선층 = 제목버튼s.find(b => b.level === 지금층)!
  const 제목: i손잡이[] = [{
    key: '제목',
    아이콘: 지금층 ? 선층.아이콘 : 'i-lucide-heading',
    라벨: 선층.라벨,
    도움말: 지금층 ? `${선층.라벨} — 눌러서 층을 고친다` : '제목 층 고르기',
    켜짐: !!지금층,
    하위s: 제목버튼s.map(b => ({
      key: `제목:${b.level}`,
      아이콘: b.아이콘,
      라벨: b.라벨,
      도움말: b.도움말,
      켜짐: b.level === 지금층
    }))
  }]
  const 문단: i손잡이[] = [
    { key: '글머리', 아이콘: 'i-lucide-list', 라벨: '글머리', 도움말: '글머리 목록', 켜짐: e?.isActive('bulletList') },
    { key: '번호', 아이콘: 'i-lucide-list-ordered', 라벨: '번호', 도움말: '번호 목록', 켜짐: e?.isActive('orderedList') },
    { key: '인용', 아이콘: 'i-lucide-quote', 라벨: '인용', 도움말: '인용', 켜짐: e?.isActive('blockquote') },
    { key: '표', 아이콘: 'i-lucide-table', 라벨: '표', 도움말: 표안 ? '표 안이다 — 표 묶음으로 줄·칸을 고친다' : '3×3 표 넣기', 켜짐: 표안, 막힘: 표안 }
  ]
  /**
   * 정렬 묶음은 **자리에 따라 뜻이 갈린다** — 표 밖이면 문단을 감싸는 `::align`, 표 안이면 GFM 의 칸 정렬.
   * 자리를 옮기지 않는 이유는 하는 일이 같아서다: 「지금 있는 것을 어느 쪽에 붙일까」. `::align` 은 표 안에
   * 설 자리가 없다 — 칸 알맹이는 md 로 나갈 때 인라인이라야 한다.
   */
  const 정렬: i손잡이[] = 표안
    ? 칸정렬버튼s.map(b => ({
        key: `칸정렬:${b.to}`,
        아이콘: b.아이콘,
        라벨: b.라벨,
        도움말: `${b.라벨} — 이 칸이 선 세로줄 전체. 한 번 더 누르면 벗겨진다`,
        켜짐: e?.isActive('tableCell', { align: b.to }) || e?.isActive('tableHeader', { align: b.to })
      }))
    : 정렬버튼s.map(b => ({
        key: `정렬:${b.to}`,
        아이콘: b.아이콘,
        라벨: b.라벨,
        도움말: b.도움말,
        켜짐: b.to === 'left' ? !e?.isActive('align') : e?.isActive('align', { to: b.to })
      }))
  // 사전이 버튼을 만들고, `누를때`(`확장.ts`)가 그 버튼이 눌리는지를 정한다. 여기서 적는 어휘는 없다.
  const 사전 = (['상자', '구조', '미디어', '데이터'] as const).map(이름 => ({
    이름,
    항목s: MDC블록s.filter(b => b.묶음 === 이름).map<i손잡이>((b) => {
      const 손 = 누를때[b.이름]
      return {
        key: b.이름,
        아이콘: b.아이콘,
        라벨: b.라벨,
        도움말: 손 ? b.쓸때.replace(/\*\*/g, '') : `${b.라벨} — 넣는 손잡이가 아직 없다`,
        켜짐: e?.isActive(노드타입of(b.이름)),
        막힘: !손
      }
    })
  }))
  const 개발묶음s = [{ 이름: '문단', 항목s: 문단 }, ...표묶음.value, ...사전]
    .filter(묶음 => !숨긴묶음s.has(묶음.이름))
  return [
    { 층: '기본', 묶음s: [{ 이름: '제목', 항목s: 제목 }, { 이름: '서식', 항목s: 서식 }, { 이름: '정렬', 항목s: 정렬 }] },
    // 남은 게 없으면 층째로 뺀다 — 빈 층을 남기면 층 사이 줄(`v-if="i"`)만 혼자 서게 된다.
    ...(개발묶음s.length ? [{ 층: '개발' as const, 묶음s: 개발묶음s }] : [])
  ]
})

/**
 * 사전 어휘를 눌렀을 때. **어휘 목록도 본새도 여기 없다** — `확장.ts` 의 `누를때` 가 정본이고
 * 이 함수는 거기 적힌 네 방식을 실행할 뿐이다. 사전이 늘어도 이 파일은 안 바뀐다.
 */
function 어휘누르기(e: Editor, 이름: string, 손: i누를때) {
  const c = () => e.chain().focus()
  const type = 노드타입of(이름)
  switch (손.방식) {
    case '마크':
      c().toggleMark(type).run()
      return
    case '감싸기':
      c().toggleWrap(type).run()
      return
    case '넣기':
      c().insertContent(손.본새).run()
      return
    case '넣거나벗기기':
      if (e.isActive(type)) c().lift(type).run()
      else c().insertContent(손.본새).run()
  }
}

/**
 * 정렬 걸기·벗기기. 감싸개 하나를 씌우고 벗기는 일이라 세 갈래다 —
 * 밖이면 감싸고, 안인데 다른 값이면 값만 갈고, 안인데 같은 값이면(또는 `왼쪽`이면) 벗긴다.
 *
 * 여러 문단을 고른 채 누르면 **감싸개 하나**가 그 전부를 덮는다(`wrapIn` 이 블록 범위를 받는다).
 * 문단마다 따로 붙는 게 아니라서 md 도 `::align` 한 덩어리로 나간다.
 */
function 정렬하기(e: Editor, to: string) {
  const c = () => e.chain().focus()
  if (!e.isActive('align')) {
    if (to !== 'left') c().wrapIn('align', { to }).run()
    return
  }
  if (to === 'left' || e.isActive('align', { to })) c().lift('align').run()
  else c().updateAttributes('align', { to }).run()
}

/**
 * 칸 정렬 걸기·벗기기. **세로줄 전체에 건다** — GFM 의 정렬은 칸이 아니라 열의 것이라(`|:---:|` 는 구분줄 한 곳에만
 * 적힌다) 한 칸만 갈아도 저장 때 그 열 전부로 번진다. 화면이 저장 결과와 어긋나느니 처음부터 열로 건다.
 *
 * 켜짐/벗김의 기준은 **커서가 있는 칸**이다 — 그 칸이 이미 그 값이면 열 전부에서 벗기고, 아니면 열 전부에 건다.
 * `setNodeMarkup` 은 문서 길이를 안 바꾸므로 미리 잰 위치들이 그대로 유효하다.
 */
function 칸정렬하기(e: Editor, to: string) {
  e.chain().focus().command(({ tr, state, dispatch }) => {
    const rect = selectedRect(state)
    const 칸s = rect.map.cellsInRect({ left: rect.left, right: rect.right, top: 0, bottom: rect.map.height })
    const 기준 = state.doc.nodeAt(rect.tableStart + (rect.map.map[rect.top * rect.map.width + rect.left] ?? 칸s[0]!))
    const 값 = 기준?.attrs.align === to ? null : to
    if (dispatch) {
      for (const p of 칸s) {
        const pos = rect.tableStart + p
        const 칸 = tr.doc.nodeAt(pos)
        if (칸) tr.setNodeMarkup(pos, undefined, { ...칸.attrs, align: 값 })
      }
    }
    return true
  }).run()
}

function 누르기(key: string) {
  const e = editor.value
  if (!e) return
  const c = () => e.chain().focus()
  if (key.startsWith('정렬:')) {
    정렬하기(e, key.slice('정렬:'.length))
    return
  }
  if (key.startsWith('칸정렬:')) {
    칸정렬하기(e, key.slice('칸정렬:'.length))
    return
  }
  /** `제목:0` 은 벗기는 것 — 층이 아니라 「제목이 아님」이라 `toggleNode` 가 아니라 `setNode` 다. */
  if (key.startsWith('제목:')) {
    const level = Number(key.slice('제목:'.length))
    if (level) c().toggleNode('heading', 'paragraph', { level }).run()
    else c().setNode('paragraph').run()
    return
  }
  const 표명령 = 표버튼s.find(b => key === `표:${b.명령}`)?.명령
  if (표명령) {
    c()[표명령]().run()
    return
  }
  const 손 = 누를때[key]
  if (손) {
    어휘누르기(e, key, 손)
    return
  }
  // 남은 것은 `::` 가 아닌 셋 — md 의 기본 문법(`**`·`-`·`>`)과 표다. 사전이 만드는 어휘가 아니다.
  switch (key) {
    case '굵게':
      c().toggleBold().run()
      return
    case '기울임':
      c().toggleItalic().run()
      return
    case '취소선':
      c().toggleStrike().run()
      return
    case '글머리':
      c().toggleBulletList().run()
      return
    case '번호':
      c().toggleOrderedList().run()
      return
    case '인용':
      c().toggleBlockquote().run()
      return
    case '표':
      if (!e.isActive('table')) c().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  }
}

// ── 툴바mini (글자를 고르면 뜨는 것) ──

/**
 * `툴바mini` 에 오는 것 — **지금 자리에 걸리는 손뿐이다.** 여기만 따로 적는 목록은 여전히 없다:
 * 기본 층과 `표묶음` 을 그대로 물려받고, 순서도 위 줄과 같다(기본 층 → 표).
 *
 * **기본 층은 「고른 것이 있을 때」만 온다** — 제목·서식·정렬은 고른 자리에 거는 것이라, 표 안에 커서만
 * 둔 채 뜨면 누를 수 없는 버튼이 줄을 채운다. 그때는 표 묶음만 온다.
 * (표 안에서 글자를 고르면 넷이 다 온다 — 그 자리에서는 `정렬` 이 이미 칸 정렬이라 표 손잡이와 짝이 맞는다.)
 */
const 툴바mini묶음s = computed(() => {
  const sel = editor.value?.state.selection
  const 고름 = !!sel && !sel.empty && (sel instanceof TextSelection || sel instanceof CellSelection)
  const 기본 = 고름 ? 툴바층s.value.find(층 => 층.층 === '기본')?.묶음s ?? [] : []
  return [...기본, ...표묶음.value]
})
</script>

<style>
/*
  편집판에만 있는 CSS. 전부 「읽기 화면이 문단 껍데기를 벗기는 자리」를 흉내 낸다 —
  ProseMirror 는 커서가 서려면 문단(`<p>`)이 있어야 하고, 읽기 렌더러는 그 자리에서 `mdc-unwrap="p"` 로 문단을
  벗겨 글을 인라인으로 흘린다. 그 둘을 같은 그림으로 만드는 몇 줄이다. 옷(클래스) 자체는 여기 없다 — `_/prose.ts`.
*/
.m-본문편집 .ProseMirror {
  outline: none;
}

/* 상자(알림·요점): 알맹이 껍데기를 지우고, 첫 문단을 아이콘 옆에 인라인으로 흘린다. 문단 여백·행간은 상자 것을 따른다. */
.m-본문편집 .m-본문-상자알맹이 {
  display: contents;
}
.m-본문편집 .m-본문-상자알맹이 > p {
  margin: 0;
  line-height: inherit;
}
.m-본문편집 .m-본문-상자알맹이 > p:first-child {
  display: inline;
}
/* 상자는 노드뷰 감싸개 안에 홀로 있어 늘 `:last-child` 다 — 테마의 `last:mb-0` 이 매번 걸린다. 읽기 화면의 `my-5` 로 되돌린다. */
.m-본문편집 .ProseMirror .m-본문-상자 > div {
  margin-bottom: 1.25rem;
}

/* 표 머리칸: 읽기 화면은 인라인, 편집판은 문단. 몸칸(td)엔 테마가 `[&_p]:my-0` 를 주는데 머리칸엔 없다. 행간은 칸(`text-sm`)을 따른다. */
.m-본문편집 th > p {
  margin: 0;
  line-height: inherit;
}

/*
  목록 항목: **읽기 화면은 항목 안에 문단을 안 만든다.** 나가는 md 가 늘 붙은 목록(`- 가\n- 나`)이라
  `mdast` 가 문단을 벗기기 때문이다 — 하위 목록이 달린 항목도, 문단이 둘인 항목도 그렇다(왕복으로 확인).
  편집판은 커서가 서야 해서 늘 문단을 만들고, 그 문단이 `my-5`(20px)를 지고 있었다. 항목의 `my-1.5`(6px)와
  겹쳐 무너지면서 **항목 사이가 6px 이 아니라 20px** 이 됐다 — 읽기 화면과 3배 넘게 어긋난 자리다.
  머리칸(`th`)에서 한 것과 같은 수리고, 이 `<style>` 블록이 있는 이유 그 자체다.
*/
.m-본문편집 li > p {
  margin: 0;
  line-height: inherit;
}

/* 속성 입력(카드 제목·탭 이름·접기 질문): 글자처럼 보이는 입력칸. */
.m-본문편집 .m-본문-속성입력 {
  background: transparent;
  border: 0;
  padding: 0;
  margin: 0;
  outline: none;
  font: inherit;
  color: inherit;
  line-height: inherit;
  min-width: 1ch;
}
.m-본문편집 .m-본문-속성입력::placeholder {
  color: var(--ui-text-dimmed);
}
/* 글자 폭에 맞는 입력칸 — 안 보이는 글자가 폭을 재고 입력칸이 그 위에 겹친다. */
.m-본문편집 .m-본문-자동폭 {
  display: inline-grid;
  min-width: 2ch;
}
.m-본문편집 .m-본문-자동폭 > * {
  grid-area: 1 / 1;
}
.m-본문편집 .m-본문-자동폭 > span {
  visibility: hidden;
  white-space: pre;
}
.m-본문편집 .m-본문-자동폭 > input {
  width: 100%;
}

/*
  「엔터 두 번」 힌트 — 삼킨 빈 문단에 흐리게 얹는다(`확장.ts` 의 `문단엔터`가 언제 뜨는지까지 적어 뒀다).
  글월은 여기 없다. 데코레이션이 `data-hint` 로 들고 오고 이 규칙은 **옷만 입힌다** — 말이 바뀔 자리는 한 곳이라야 한다.
  `float:left; height:0` 은 자리를 안 먹게 하는 수법이다. 그냥 `::before` 로 두면 힌트가 인라인으로 서서
  **커서가 글월 뒤로 밀린다** — 빈 문단인데 커서가 문단 한가운데 있는 꼴이 된다.
*/
.m-본문편집 .m-본문-줄바꿈힌트::before {
  content: attr(data-hint);
  float: left;
  height: 0;
  pointer-events: none;
  user-select: none;
  color: var(--ui-text-dimmed);
  font-size: 0.875em;
}

/* 통째로 고른 원자(영상·목록). */
.m-본문편집 .ProseMirror-selectednode {
  outline: 2px solid var(--ui-primary);
  outline-offset: 2px;
  border-radius: 0.5rem;
}
</style>

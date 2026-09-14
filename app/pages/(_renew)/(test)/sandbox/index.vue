<!--
  모래밭(sandbox) 목차.

  **개발자 전용 자리다.** 부품·패턴을 여기서 먼저 세워 값을 물려 보고, 정해지면
  실코드(`app/components/*`·`app/pages/*`)로 옮긴다. 그래서 여기 있는 것은 완성품이 아니라
  **옮겨지기 전의 것**이고, 옮기고 나면 판은 지워도 된다 — 무엇을 골랐는지는 `/decisions` 이
  따로 진다.

  **언제든 통째로 쓸어버리는 자리다.** 이름이 그 뜻이다 — 쌓았다 허무는 곳.

  여기 목록은 손으로 적지 않는다. 각 데모 페이지가 `definePageMeta` 에 자기 이름표
  (`제목`·`설명`·`상태`·`쓰는곳`)를 달고, 이 화면은 라우터에서 그걸 긁어모을 뿐이다.
  그래서 데모를 하나 더 만들면 목차가 알아서 늘어나고, 지우면 알아서 빠진다.

  `상태`가 이 모래밭의 존재 이유다 —
  `대기` 는 만들어는 뒀는데 아직 실제 화면 어디에도 안 걸린 것. 잊히는 건 늘 이쪽이다.

  **`/decisions` 기록에 오르면 판은 여기서 나간다.** 그 판은
  `app/pages/decisions/*` 로 옮기고 **여기서는 지운다** — 밖에 내보이는 화면이 언제든 지우는
  이 폴더를 가리키고 있으면 안 되기 때문이다. 결론이 아직 없어도 같다(「아직 열려 있는
  질문」도 내보내는 기록이다). 그래서 여기 남은 판은 전부 「아직 기록에 안 올린 것」이고,
  이 목록이 짧아지는 게 정상이다.

  **묶음은 폴더가 정한다** (2026-09-05). 번호(`7`·`10`·`11`)로 부르던 것을 이름으로 바꾸면서
  `theme/`·`content/`·`survey/` 로 나눴다. 묶음 이름표만 아래 `묶음이름` 에 있고, 어느 묶음에
  들어갈지는 파일을 어디에 두느냐로 정해진다 — 목차에 손댈 일이 없다는 규칙은 그대로다.
  폴더 없이 뿌리에 둔 것은 「낱개」로 모인다.

  목차는 **한 화면에 다 들어오는 게 목적**이라 한 줄에 하나씩 눕히지 않고 격자로 깐다
  (`max-w-(--ui-container)` — 본문 자 하나를 같이 읽는다, 폭에 따라 2·3·4단). 그래서 카드에 적는 건 제목·경로·설명·쓰는 곳
  넷뿐이다 — 더 붙이고 싶으면 데모 페이지 안에 적을 것.
-->
<template>
  <div class="mx-auto w-full max-w-(--ui-container) px-4 py-8">
    <div class="mb-6">
      <h1 class="text-2xl font-semibold text-highlighted">
        모래밭
      </h1>
      <p class="mt-1 text-sm text-muted">
        여기서 세워 보고 실코드로 옮기는 자리(개발자용) ·
        전체 {{ 판s.length }}개 중 <span class="text-warning">대기 {{ 대기수 }}개</span>
      </p>
      <!--
        밖에 내보이는 화면. **이 모래밭을 안 읽는다** — 기록이 `~/utils/decisions` 에 따로 서 있고
        여기 판을 링크만 한다(없으면 링크가 빠진다). 모래밭은 언제든 지우는 도구라 그렇게 뒀다.
        결정이 나면 판이 아니라 그 기록에 한 줄 적을 것. `/decisions` 머리말이 정본.
      -->
      <p class="mt-2 text-xs text-dimmed">
        물음과 고른 값만 읽으려면 →
        <NuxtLink
          to="/decisions"
          class="text-muted underline underline-offset-2 hover:text-default"
        >이런 고민 속에 만들어졌습니다</NuxtLink>
      </p>
    </div>

    <section
      v-for="묶음 in 묶음s"
      :key="묶음.키"
      class="mb-7"
    >
      <div class="mb-2 flex items-baseline gap-2">
        <h2 class="text-sm font-medium text-highlighted">
          {{ 묶음.이름 }}
        </h2>
        <span class="font-mono text-xs text-dimmed">{{ 묶음.키 ? `${묶음.키}/` : '/sandbox' }}</span>
        <span class="text-xs text-dimmed">· {{ 묶음.항목s.length }}</span>
      </div>

      <ul class="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <li
          v-for="품 in 묶음.항목s"
          :key="품.경로"
        >
          <NuxtLink
            :to="품.경로"
            class="block h-full rounded-lg border border-default px-3 py-2.5 transition-colors hover:bg-elevated"
          >
            <span class="flex items-baseline gap-2">
              <span class="text-sm font-medium text-highlighted">{{ 품.제목 }}</span>
              <span class="grow" />
              <span
                v-if="품.상태 === '대기'"
                class="shrink-0 rounded bg-warning/10 px-1.5 py-0.5 text-xs text-warning"
              >대기</span>
            </span>
            <span class="mt-0.5 block font-mono text-xs text-dimmed">{{ 품.이름 }}</span>
            <span class="mt-1 block text-xs text-muted">{{ 품.설명 }}</span>
            <span
              v-if="품.쓰는곳"
              class="mt-1 block text-xs text-dimmed"
            >쓰는 곳 · {{ 품.쓰는곳 }}</span>
          </NuxtLink>
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
type i상태 = '실사용' | '대기'

/** 데모 페이지가 `definePageMeta` 로 다는 이름표. 라우터 meta 는 타입이 없어 여기서 좁힌다. */
interface i이름표 {
  제목?: string
  설명?: string
  상태?: i상태
  쓰는곳?: string
}

/** 폴더 → 묶음 이름. 여기 없는 폴더는 폴더명 그대로 뜬다. `''` 는 뿌리(폴더 없이 둔 낱개). */
const 묶음이름: Record<string, string> = {
  'device': '기기 축 · 반응형',
  'theme': '테마',
  'content': '본문 · 저작',
  'survey': '설문',
  'fresh': '산뜻 · 방문자 화면 다시 보기',
  '': '낱개'
}

/** 위에서부터 이 차례로 깔린다. 목록에 없는 폴더는 뒤에 알파벳순으로 붙는다. */
const 묶음차례 = ['fresh', 'device', 'theme', 'content', 'survey', '']

/** 라우트 표는 빌드 시점에 정해진다 — 한 번 훑으면 끝이라 computed 로 감싸지 않는다. */
const 판s = useRouter().getRoutes()
  .filter(route => route.path.startsWith('/sandbox/'))
  .map((route) => {
    const 이름표 = route.meta as i이름표
    const 조각s = route.path.replace('/sandbox/', '').split('/')
    return {
      경로: route.path,
      /** 폴더가 곧 묶음이다. 뿌리에 둔 것은 `''`. */
      묶음: 조각s.length > 1 ? 조각s[0]! : '',
      이름: 조각s.join('/'),
      제목: 이름표.제목 ?? '',
      설명: 이름표.설명 ?? '',
      상태: 이름표.상태 ?? '대기',
      쓰는곳: 이름표.쓰는곳
    }
  })
  /** 이름표가 없는 페이지는 모래밭에 올릴 준비가 안 된 것으로 본다. */
  .filter(품 => Boolean(품.제목))
  .sort((a, b) => a.경로.localeCompare(b.경로))

const 대기수 = 판s.filter(품 => 품.상태 === '대기').length

const 묶음s = [...new Set(판s.map(품 => 품.묶음))]
  .sort((a, b) => {
    const ia = 묶음차례.indexOf(a)
    const ib = 묶음차례.indexOf(b)
    return (ia < 0 ? 묶음차례.length : ia) - (ib < 0 ? 묶음차례.length : ib) || a.localeCompare(b)
  })
  .map(키 => ({
    키,
    이름: 묶음이름[키] ?? 키,
    /** 대기가 먼저다 — 잊히는 건 늘 이쪽이라 묶음 안에서도 위로 올린다. */
    항목s: 판s
      .filter(품 => 품.묶음 === 키)
      .sort((a, b) => Number(b.상태 === '대기') - Number(a.상태 === '대기'))
  }))
</script>

/**
 * `persona` — **가상 인물과 그 배경.**
 * 인물(`model캐릭터`) · 배경(시간적 `model배경` + 그 아래 공간적 `model장소`).
 *
 * v2(과일·동물·문서…)는 목록·폼·도우미를 시험하는 표본이라 지우고 다시 부어도 잃을 게 없어서 v2 배럴에서 갈라 나왔다.
 * 화면 주소는 `/p/*`다(`pages/(_renew)/(test)/p/`), 셸은 자기 것(`layout-p`)이다.
 * 옮기면 셸의 `탭s`·`aiV2/sources.ts`의 `personaAI소스s`·`access-control.global.ts`의 `접근제어제외경로s`가 같이 움직인다.
 */
export * from './model캐릭터'
export * from './model배경'
export * from './model장소'

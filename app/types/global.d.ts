type Maybe<T> = T | undefined

declare module '*.css';

declare module '#app' {
  interface PageMeta {
    /** `lLayoutHero` — `default`: 랜딩 캐로셀, `short`: 상세·브레드크럼 스트립 */
    layoutHero?: 'default' | 'short' | false
    /**
     * 화면 폭을 꽉 채우는 작업대인가(`view목록5`·`view상세5`·캔버스). `true` 면 `layouts/default.vue` 가
     * 칸(`--ui-container` · 종이 · 좌우 선)을 안 두른다 — 칸에 두르면 넓은 화면에서 작업대가 80rem 에 갇힌다.
     */
    꽉찬폭?: boolean
  }
}

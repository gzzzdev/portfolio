import { createNaverMap, type Options } from 'vue3-naver-maps'

/**
 * 네이버 지도 스크립트를 붙인다. 쓰는 자리는 `~base-comps/m/Map`.
 *
 * 예전엔 `as Options` 만 걸려 있고 그 타입을 **import 하지 않아** 통째로 검사를 빠져나갔다.
 * 그 사이에 `gl: true` 가 섞여 들어와 있었는데, 로더가 받는 건
 * `{ clientId, subModules, category, enableAiMaps }` 넷뿐이라(`dist/vue3-naver-maps.esm.js`)
 * 어차피 버려지는 값이었다 — 걷었다.
 *
 * `enableAiMaps: false` 라서 키는 `ncpClientId` 가 아니라 `ncpKeyId` 로 나간다.
 * `category` 는 그 반대편에서만 읽히므로 지금은 놀고 있다 — AI 지도를 켜면 그때 산다.
 */
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(createNaverMap, {
    clientId: useRuntimeConfig().public.naverMapClientId,
    enableAiMaps: false,
    category: 'ncp',
    // 'gl' 은 패키지가 아는 값('panorama'|'geocoder'|'drawing'|'visualization')이 아니지만
    // 로더가 검사 없이 `submodules=` 로 흘려보낸다. 원래 나가던 URL 을 그대로 두려고 남긴다.
    subModules: ['gl', 'panorama'] as Options['subModules']
  } satisfies Options)
})

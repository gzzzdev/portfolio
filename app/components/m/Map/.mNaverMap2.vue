<template>
  <div
    ref="el"
    class="w-full h-full rounded-lg"
  >
    <NaverMap
      v-if="render.지도"
      class="w-full h-full rounded-lg"
      :map-options="render.options"
      :init-layers="render.initLayers"
      @on-load="render.onLoad($event, el)"
    />

    <mButton @click="지도.do이동()">
      이동
    </mButton>
    <div v-if="false">
      <div>{{ 지도.핀s }}</div>
    </div>
  </div>
</template>

<script lang="ts">
import { generateName2, randomCoordi } from '~utils'

const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
const markerHtml = (p: i핀) => `
    <div class="flex flex-col items-center gap-1">
        <img src="${p.src}" alt="${escapeHtml(p.label)}" class="size-9 rounded-full border-2 border-white shadow" />
        <span class="rounded-full bg-gray-900 px-1.5 py-0.5 text-[11px] leading-none whitespace-nowrap text-white">${escapeHtml(p.label)}</span>
    </div>
`
export enum enum레이어 { 배경 = 'BACKGROUND', 도로 = 'BACKGROUND_DETAIL', 철도 = 'TRANSIT', 한글 = 'POI_KOREAN', 영문 = 'ENGLISH' }

class Renderer {
  map: naver.maps.Map
  options = {
    latitude: 36.7948, // 나사렛대학교 중심 위도
    longitude: 127.1212, // 나사렛대학교 중심 경도
    zoom: 16,
    zoomControl: false,
    zoomControlOptions: { position: 'TOP_RIGHT' }

  }

  get initLayers() {
    return this.지도.레이어s
  }

  initPanorama() {
    let pano
    this.map.onJSContentLoaded = function () {
      // 아이디 혹은 지도 좌표로 파노라마를 표시할 수 있습니다.
      pano = new naver.maps.Panorama('pano', {
        position: new naver.maps.LatLng(37.3599605, 127.1058814),
        pov: {
          pan: -133,
          tilt: 0,
          fov: 100
        }
      })

      // 파노라마 위치가 갱신되었을 때 발생하는 이벤트를 받아 지도의 중심 위치를 갱신합니다.
      naver.maps.Event.addListener(pano, 'pano_changed', function () {
        const latlng = pano.getPosition()

        if (!latlng.equals(map.getCenter())) {
          map.setCenter(latlng)
        }
      })
    }
  }

  toggle거리뷰 = () => {

  }

  constructor(private 지도: model네이버지도) {
  }

  streetLayer
  onLoad = (mapObject, el: HTMLElement) => {
    console.log(mapObject)
    this.map = mapObject
    this.do클리너시작(el)

    // this.streetLayer = new naver.maps.StreetLayer();

    // console.log(mapObject.naver);
    // console.log(mapObject.maps);
    // console.log(mapObject.StreetLayer);

    // console.log(mapObject.getStreetLayer());
    // console.log(mapObject);
    // console.log(mapObject.StreetLayer());

    // this.streetLayer.setMap(this.map);

    // 이유는 모르나 여기서 선언되어야함.
    // console.log(this.map);

    // this.initPanorama();

    // var streetLayer = new naver.maps.StreetLayer();
    // naver.maps.Event.once(this.map, 'init', function() {
    //     streetLayer.setMap(this.map);
    // });

    // // 거리뷰 버튼에 이벤트를 바인딩합니다.
    // var btn = document.querySelector('#street');
    // btn?.addEventListener("click", (e) => {
    //     e.preventDefault();

    //     // 거리뷰 레이어가 지도 위에 있으면 거리뷰 레이어를 지도에서 제거하고,
    //     // 거리뷰 레이어가 지도 위에 없으면 거리뷰 레이어를 지도에 추가합니다.
    //     if (streetLayer.getMap()) {
    //         streetLayer.setMap(null);
    //     } else {
    //         streetLayer.setMap(this.map);
    //     }
    // });
  }

  createNaverBrandingCleaner = (root: HTMLElement | null) => {
    let observer: MutationObserver | null = null

    const removeBrandingDom = () => {
      if (!root) return

      const logos = root.querySelectorAll(
        'img[src*="new-naver-logo-normal.png"][alt="NAVER"]'
      )
      logos.forEach(logo => logo.remove())

      const copyrightSpans = Array.from(root.querySelectorAll('span')).filter(
        el => el.textContent?.trim() === '© NAVER Corp.'
      )
      copyrightSpans.forEach((span) => {
        const wrapper = span.closest('div')
        if (wrapper) {
          wrapper.remove()
          return
        }
        span.remove()
      })
    }

    const start = () => {
      if (!root) return
      observer?.disconnect()
      removeBrandingDom()
      observer = new MutationObserver(removeBrandingDom)
      observer.observe(root, { childList: true, subtree: true })
    }

    const stop = () => {
      observer?.disconnect()
      observer = null
    }

    return { start, stop }
  }

  클리너: { start: () => void, stop: () => void } | null = null
  do클리너시작 = (el: HTMLElement) => {
    this.클리너 = this.createNaverBrandingCleaner(el)
    this.클리너.start()
  }

  do클리너종료 = () => {
    this.클리너?.stop()
  }
}

interface i핀 { label: string, src: string, coord: [number, number] }
export class model네이버지도 {
  state = reactive({ pins: [] })
  constructor() { }
  render: Renderer | null = null
  setRenderer(r: Renderer) {
    this.render = r
  }

  init핀s() {
    const _사람s: i핀[]
      = [{ label: 'p1', src: '/img/avatars/p1.png', coord: [35.965829, 126.954483] },
        { label: 'p2', src: '/img/avatars/p2.png', coord: [35.963829, 126.952283] },
        { label: 'p3', src: '/img/avatars/p3.png', coord: [35.964229, 126.955083] }]

    _사람s.forEach(사람 => this.add핀(사람))
  }

  get 핀s() {
    return this.state.pins
  }

  do1 = () => {
    this.render.toggle거리뷰()
    // ?.map
    // this.
    // initPanorama
  }

  add핀_랜덤 = () => {
    const coord = randomCoordi([35.965829, 126.954483], 500)

    const src = `https://api.dicebear.com/9.x/thumbs/svg?size=64&seed=${Math.random()}&radius=50`
    const birth = randomN(1980, 2010)
    this.add핀({ label: generateName2(birth) + `(${2026 - birth})`, src, coord: coord })
  }

  add핀_현위치() {
    const src = 'https://api.dicebear.com/9.x/lorelei/svg'
    this.add핀({ label: '현위치', src, coord: [35.965829, 126.954483] })
  }

  add핀(p: i핀) {
    this.state.pins.push(p)

    //
    const markerOptions: naver.maps.MarkerOptions = {
      position: new naver.maps.LatLng(p.coord[0], p.coord[1]),
      map: this.render?.map,
      title: p.label,
      icon: {
        content: markerHtml(p),
        anchor: new naver.maps.Point(18, 42)
      }
    }
    const marker = new naver.maps.Marker(markerOptions)
  }

  toggle레이어s = [
    { onoff: ref(!false), label: '배경', value: enum레이어.배경 },
    { onoff: ref(!false), label: '도로', value: enum레이어.도로 },
    { onoff: ref(false), label: '철도', value: enum레이어.철도 },
    { onoff: ref(!false), label: '한글', value: enum레이어.한글 },
    { onoff: ref(false), label: '영문', value: enum레이어.영문 }
  ]

  get 레이어s() {
    return this.toggle레이어s.filter(x => toValue(x.onoff)).map(x => x.value)
  }

  zoom = (_z: number) => {
    this.render?.map.setZoom(_z, true)
  }

  move = (coord: [number, number] = [36.7948, 127.1212], isZoom: boolean = !false) => {
    if (isZoom)
      this.zoom(17)

    this._move(coord)
  }

  _move = (coord: [number, number] = [36.7948, 127.1212]) => this.render?.map.panTo(new naver.maps.LatLng(coord[0], coord[1]))

  move원대 = () => this.move()
  move금천구 = () => this.move([37.4568644, 126.8955105])
  move용산구 = () => this.move([37.532527, 126.99049])
  move강남구 = () => this.move([37.5173050, 127.0475020])
}
</script>

<script setup lang="ts">
import { NaverMap } from 'vue3-naver-maps'
import { computed, reactive, ref } from 'vue'

const props = withDefaults(defineProps<{ modelValue: model네이버지도 }>(), {
  modelValue: () => new model네이버지도()
})

const 지도 = computed(() => props.modelValue)
const render = new Renderer(지도.value)

지도.value.setRenderer(render)

const el = ref<HTMLElement | null>(null)
</script>

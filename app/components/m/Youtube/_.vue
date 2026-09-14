<template>
  <div
    v-if="!is영화관"
    class="flex h-full flex-col"
    @pointerdown.stop
    @pointerup.stop
    @pointermove.stop="on사용자활동"
    @mouseenter.stop="on마우스진입"
    @mouseover.stop
    @mouseleave.stop="on마우스나감"
  >
    <PlayerUi
      :player-id="playerId"
      :cinema="false"
      :is재생전환커버표시="is재생전환커버표시"
      :is유튜브ui마스킹="is유튜브ui마스킹"
      :is진행드래그중="is진행드래그중"
      :is중앙컨트롤표시="is중앙컨트롤표시"
      :is-playing="isPlaying"
      :show-sound="showSound"
      :is-hovering-player="isHoveringPlayer"
      :volume="volume"
      :can-move="canMove"
      :watched-time="watchedTime"
      :진행슬라이더최대="진행슬라이더최대"
      :진행률="진행률"
      @update:volume="(v) => { volume = v }"
      @중앙재생="on중앙재생버튼입력"
      @사용자활동="on사용자활동"
      @진행드래그시작="on진행드래그시작"
      @진행슬라이더변경="on진행슬라이더변경"
      @전체화면토글="on전체화면토글"
    />
  </div>

  <UModal
    v-model:open="is영화관"
    fullscreen
    :dismissible="false"
    :ui="{ content: 'bg-black', body: 'h-full p-0' }"
  >
    <template #content>
      <div
        class="flex h-full w-full flex-col bg-black p-2"
        @pointerdown.stop
        @pointerup.stop
        @pointermove.stop="on사용자활동"
        @mouseenter.stop="on마우스진입"
        @mouseover.stop
        @mouseleave.stop="on마우스나감"
      >
        <PlayerUi
          :player-id="playerId"
          :cinema="true"
          :is재생전환커버표시="is재생전환커버표시"
          :is유튜브ui마스킹="is유튜브ui마스킹"
          :is진행드래그중="is진행드래그중"
          :is중앙컨트롤표시="is중앙컨트롤표시"
          :is-playing="isPlaying"
          :show-sound="showSound"
          :is-hovering-player="isHoveringPlayer"
          :volume="volume"
          :can-move="canMove"
          :watched-time="watchedTime"
          :진행슬라이더최대="진행슬라이더최대"
          :진행률="진행률"
          @update:volume="(v) => { volume = v }"
          @중앙재생="on중앙재생버튼입력"
          @사용자활동="on사용자활동"
          @진행드래그시작="on진행드래그시작"
          @진행슬라이더변경="on진행슬라이더변경"
          @전체화면토글="on전체화면토글"
        />
      </div>
    </template>
  </UModal>
</template>

<script lang="ts">
</script>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick, toRef } from 'vue'
import PlayerUi from './PlayerUi.vue'

interface Props {
  'url': string
  'autoplay': boolean
  'mute': boolean
  'startTime': number
  'watchedTime': number
  'onUpdate:watchedTime': (time: number) => void
  /** false면 볼륨 UI 숨김 */
  'showSound'?: boolean
  /** false면 부모에서 넘어오는 watchedTime/startTime 변경 시 seek 하지 않음 */
  'canMove'?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  autoplay: false,
  mute: false,
  start: 0,
  showSound: true,
  canMove: true
})
const emit = defineEmits(['on종료'])
const is영화관 = defineModel<boolean>('is영화관', { default: false })

const watchedTime = defineModel<number>('watchedTime', {
  required: true
})
const duration = defineModel<number>('duration', {
  required: true, default: 0
})

const player = ref<any>(null)
const playerId = `youtube-player-${Math.random().toString(36).substr(2, 9)}`
let timeInterval: any = null
let centerControlTimer: ReturnType<typeof setTimeout> | null = null
let playCoverTimer: ReturnType<typeof setTimeout> | null = null
let youtubeUiMaskTimer: ReturnType<typeof setTimeout> | null = null
let primeFallbackTimer: ReturnType<typeof setTimeout> | null = null
let seekOverlayHideTimer: ReturnType<typeof setTimeout> | null = null
let seekOverlayForceHideTimer: ReturnType<typeof setTimeout> | null = null
let 진행드래그종료핸들러: (() => void) | null = null
/** autoplay 아닐 때 프라이밍 재생 후 일시정지까지 대기 */
let primePauseTimer: ReturnType<typeof setTimeout> | null = null
const PRIME_PLAY_MS = 1000
/** 진행 슬라이더 손 뗀 뒤 상·하 시크 오버레이 제거까지 */
const SEEK_OVERLAY_HIDE_MS = 500
/** 이벤트 순서가 꼬여도 overlay가 영구 고정되지 않도록 강제 종료 */
const SEEK_OVERLAY_FORCE_HIDE_MS = 4000
const isPlaying = ref(false)
const is중앙컨트롤표시 = ref(true)
const isHoveringPlayer = ref(false)
const is재생전환커버표시 = ref(!false)
const is유튜브ui마스킹 = ref(false)
const has한번이라도재생됨 = ref(false)
const is일시정지후재생대기 = ref(false)
/** autoplay 아닐 때 N초 재생 후 pause하기 전까지(프라이밍) — has한번이라도재생됨과 분리 */
const is초기프라이밍 = ref(false)
const volume = ref(props.mute ? 0 : 100)
const 마지막토글시간 = ref(0)

const 진행률 = computed(() => {
  const d = duration.value
  if (!d || d <= 0) return 0
  return Math.min(100, Math.max(0, (100 * watchedTime.value) / d))
})

const 진행슬라이더최대 = computed(() => {
  const d = duration.value
  return d > 0 ? d : 0.01
})

/** 슬라이더 드래그 중에는 인터벌이 watchedTime을 덮어쓰지 않음 */
const is진행드래그중 = ref(false)

function detach진행드래그종료리스너() {
  if (!진행드래그종료핸들러) return
  window.removeEventListener('pointerup', 진행드래그종료핸들러)
  window.removeEventListener('pointercancel', 진행드래그종료핸들러)
  진행드래그종료핸들러 = null
}

function refresh진행드래그강제종료타이머() {
  if (seekOverlayForceHideTimer) {
    clearTimeout(seekOverlayForceHideTimer)
    seekOverlayForceHideTimer = null
  }
  seekOverlayForceHideTimer = setTimeout(() => {
    seekOverlayForceHideTimer = null
    is진행드래그중.value = false
    detach진행드래그종료리스너()
  }, SEEK_OVERLAY_FORCE_HIDE_MS)
}

/** 마지막 `update:model-value`(또는 pointerup 보조) 이후 SEEK_OVERLAY_HIDE_MS 뒤에 스크럽 종료 */
function schedule진행슬라이더종료() {
  if (seekOverlayHideTimer) {
    clearTimeout(seekOverlayHideTimer)
    seekOverlayHideTimer = null
  }
  seekOverlayHideTimer = setTimeout(() => {
    seekOverlayHideTimer = null
    if (seekOverlayForceHideTimer) {
      clearTimeout(seekOverlayForceHideTimer)
      seekOverlayForceHideTimer = null
    }
    is진행드래그중.value = false
    detach진행드래그종료리스너()
  }, SEEK_OVERLAY_HIDE_MS)
}

function on진행드래그시작() {
  if (!props.canMove) return
  if (seekOverlayHideTimer) {
    clearTimeout(seekOverlayHideTimer)
    seekOverlayHideTimer = null
  }
  is진행드래그중.value = true
  refresh진행드래그강제종료타이머()
  detach진행드래그종료리스너()
  진행드래그종료핸들러 = () => {
    schedule진행슬라이더종료()
  }
  window.addEventListener('pointerup', 진행드래그종료핸들러)
  window.addEventListener('pointercancel', 진행드래그종료핸들러)
}

function on진행슬라이더변경(v: number | number[] | undefined) {
  if (!props.canMove) return
  const next = Array.isArray(v) ? v[0] : v
  if (next == null || Number.isNaN(Number(next))) return
  const t = Number(next)
  is진행드래그중.value = true
  refresh진행드래그강제종료타이머()
  watchedTime.value = t
  if (player.value?.seekTo) player.value.seekTo(t, true)
  on사용자활동()
  schedule진행슬라이더종료()
}

declare global {
  interface Window {
    YT?: any
    onYouTubeIframeAPIReady?: () => void
  }
}

function loadYouTubeAPI() {
  return new Promise<void>((resolve) => {
    if (window.YT && window.YT.Player) {
      resolve()
      return
    }
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    document.body.appendChild(tag)
    window.onYouTubeIframeAPIReady = () => {
      resolve()
    }
  })
}

function extractYoutubeVideoId(url: string): string | null {
  if (!url) return null
  const patterns = [
    /[?&]v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /embed\/([a-zA-Z0-9_-]{11})/,
    /v\/([a-zA-Z0-9_-]{11})/,
    /shorts\/([a-zA-Z0-9_-]{11})/
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

function applyIframeInteractionGuard(target?: any) {
  const iframe = target?.getIframe?.()
  if (!iframe) return
  iframe.style.pointerEvents = 'none'
  iframe.style.zIndex = '0'
}

function showYoutubeUiMaskTemporarily() {
  is유튜브ui마스킹.value = true
  if (youtubeUiMaskTimer) {
    clearTimeout(youtubeUiMaskTimer)
    youtubeUiMaskTimer = null
  }
  youtubeUiMaskTimer = setTimeout(() => {
    youtubeUiMaskTimer = null
    is유튜브ui마스킹.value = false
  }, 3000)
}

function createPlayer() {
  if (!window.YT) return
  const videoId = extractYoutubeVideoId(props.url)
  if (!videoId) return
  player.value = new window.YT.Player(playerId, {
    height: '100%',
    width: '100%',
    videoId,
    playerVars: {
      rel: 0,
      modestbranding: 1,
      controls: 0,
      fs: 0,
      disablekb: 1,
      iv_load_policy: 3,
      cc_load_policy: 0,
      autoplay: props.autoplay ? 1 : 0,
      mute: props.mute ? 1 : 0,
      playsinline: 1
    },
    events: {
      onReady: (event: any) => {
        // 유튜브 iframe이 직접 hover/pointer를 받지 않도록 차단
        applyIframeInteractionGuard(event.target)
        setTimeout(() => applyIframeInteractionGuard(event.target), 0)
        setTimeout(() => applyIframeInteractionGuard(event.target), 100)
        duration.value = event.target.getDuration()

        // watchedTime부터 재생
        if (props.startTime > 0) {
          event.target.seekTo(props.startTime, true)
        }
        if (props.autoplay) {
          if (props.mute && event.target.mute) event.target.mute()
          event.target.playVideo()
          isPlaying.value = true
          if (event.target.setVolume) event.target.setVolume(volume.value)
        } else {
          if (event.target.setVolume) event.target.setVolume(volume.value)
          // autoplay 꺼진 iframe은 대부분 브라우저에서 '무음'일 때만 즉시 재생됨 → 프라이밍용으로 mute 후 아래에서 복구
          if (event.target.mute) event.target.mute()
          // 자동재생이 아니어도 잠깐 재생 후 멈춤 → duration/내부 상태 확보(재생 길이는 onStateChange에서 처리)

          is초기프라이밍.value = true
          if (primeFallbackTimer) clearTimeout(primeFallbackTimer)
          primeFallbackTimer = setTimeout(() => {
            primeFallbackTimer = null
            if (is초기프라이밍.value) is초기프라이밍.value = false
          }, 12000)
          event.target.playVideo()
        }
        // 재생시간 체크 인터벌 시작
        if (timeInterval) clearInterval(timeInterval)
        timeInterval = setInterval(() => {
          const current = player.value?.getCurrentTime?.() ?? 0
          if (!is진행드래그중.value) {
            watchedTime.value = current
            if (typeof props['onUpdate:watchedTime'] === 'function') {
              props['onUpdate:watchedTime'](current)
            }
          }
        }, 1000)
      },
      onStateChange: (event: any) => {
        applyIframeInteractionGuard(event.target)
        // 1: 재생중, 2: 일시정지, 0: 종료
        if (event.data === 1) {
          showYoutubeUiMaskTemporarily()
          if (is초기프라이밍.value) {
            if (primePauseTimer) return
            if (primeFallbackTimer) {
              clearTimeout(primeFallbackTimer)
              primeFallbackTimer = null
            }
            isPlaying.value = true
            시작_중앙컨트롤숨김타이머()
            primePauseTimer = setTimeout(() => {
              primePauseTimer = null
              const p = player.value
              if (!p) {
                is초기프라이밍.value = false
                return
              }
              is초기프라이밍.value = false
              const st = props.startTime > 0 ? props.startTime : 0
              p.pauseVideo()
              p.seekTo(st, true)
              if (!props.mute) {
                if (typeof p.unMute === 'function') p.unMute()
                if (typeof p.setVolume === 'function') p.setVolume(volume.value)
              }
              const d = p.getDuration?.()
              if (typeof d === 'number' && !Number.isNaN(d)) duration.value = d
              isPlaying.value = false
              is중앙컨트롤표시.value = true
              중단_중앙컨트롤숨김타이머()
            }, PRIME_PLAY_MS)
            return
          }
          isPlaying.value = true
          if (is일시정지후재생대기.value) {
            표시_재생전환커버()
            is일시정지후재생대기.value = false
          } else {
            is재생전환커버표시.value = false
          }
          has한번이라도재생됨.value = true
          시작_중앙컨트롤숨김타이머()
        } else if (event.data === 2) {
          isPlaying.value = false
          if (has한번이라도재생됨.value) {
            중단_재생전환커버타이머()
            is재생전환커버표시.value = true
            is일시정지후재생대기.value = true
          }
          중단_중앙컨트롤숨김타이머()
          is중앙컨트롤표시.value = true
        } else if (event.data === 0) {
          const wasPriming = is초기프라이밍.value
          if (wasPriming) {
            if (primePauseTimer) {
              clearTimeout(primePauseTimer)
              primePauseTimer = null
            }
            if (primeFallbackTimer) {
              clearTimeout(primeFallbackTimer)
              primeFallbackTimer = null
            }
            is초기프라이밍.value = false
          }
          isPlaying.value = false
          is일시정지후재생대기.value = false
          is재생전환커버표시.value = false
          중단_중앙컨트롤숨김타이머()
          is중앙컨트롤표시.value = true
          if (!wasPriming) emit('on종료')
          // 영상이 끝났을 때 실행할 코드
          // 예: emit('ended') 또는 ref 업데이트 등
        }
      }
    }
  })
}

onMounted(async () => {
  await loadYouTubeAPI()
  await nextTick()
  createPlayer()
})

const urlRef = toRef(props, 'url')
const autoplayRef = toRef(props, 'autoplay')
const muteRef = toRef(props, 'mute')
const watchedTimeRef = toRef(props, 'watchedTime')
const startTimeRef = toRef(props, 'startTime')
const canMoveRef = toRef(props, 'canMove')

// watchedTime이 바뀌면 플레이어 위치 이동
watch(watchedTimeRef, (newTime, oldTime) => {
  if (!canMoveRef.value) return
  if (player.value && typeof newTime === 'number' && Math.abs(player.value?.getCurrentTime() - newTime) > 1) {
    player.value.seekTo(newTime, true)
  }
})

// startTime이 바뀌면 플레이어 위치 이동
watch(startTimeRef, (newTime, oldTime) => {
  if (!canMoveRef.value) return
  if (player.value && typeof newTime === 'number' && Math.abs(player.value?.getCurrentTime() - newTime) > 1) {
    player.value.seekTo(newTime, true)
  }
})

function destroyPlayer() {
  if (youtubeUiMaskTimer) {
    clearTimeout(youtubeUiMaskTimer)
    youtubeUiMaskTimer = null
  }
  is유튜브ui마스킹.value = false
  if (primePauseTimer) {
    clearTimeout(primePauseTimer)
    primePauseTimer = null
  }
  if (primeFallbackTimer) {
    clearTimeout(primeFallbackTimer)
    primeFallbackTimer = null
  }
  if (seekOverlayHideTimer) {
    clearTimeout(seekOverlayHideTimer)
    seekOverlayHideTimer = null
  }
  if (seekOverlayForceHideTimer) {
    clearTimeout(seekOverlayForceHideTimer)
    seekOverlayForceHideTimer = null
  }
  detach진행드래그종료리스너()
  is진행드래그중.value = false
  is초기프라이밍.value = false
  중단_중앙컨트롤숨김타이머()
  중단_재생전환커버타이머()
  if (timeInterval) {
    clearInterval(timeInterval)
    timeInterval = null
  }
  if (player.value && player.value.destroy) {
    player.value.destroy()
    player.value = null
  }
}

watch([urlRef, autoplayRef, muteRef], async ([newUrl, newAutoplay, newMute], [oldUrl, oldAutoplay, oldMute]) => {
  // props 중 하나라도 바뀌면 플레이어 재생성
  destroyPlayer()
  await nextTick()
  createPlayer()
})
watch(is영화관, async () => {
  // 일반 화면 <-> 모달 전환 시 플레이어 mount 대상이 바뀌므로 재생성
  destroyPlayer()
  await nextTick()
  createPlayer()
})

function togglePlayPause() {
  if (!player.value) return
  if (isPlaying.value) {
    player.value.pauseVideo()
    isPlaying.value = false
    중단_중앙컨트롤숨김타이머()
    is중앙컨트롤표시.value = true
  } else {
    player.value.playVideo()
    isPlaying.value = true
    시작_중앙컨트롤숨김타이머()
  }
}
function on중앙재생버튼입력() {
  const now = Date.now()
  // 터치/포인터 환경에서 드물게 발생하는 연속 입력 중복 토글 방지
  if (now - 마지막토글시간.value < 200) return
  마지막토글시간.value = now
  togglePlayPause()
}

function 중단_중앙컨트롤숨김타이머() {
  if (!centerControlTimer) return
  clearTimeout(centerControlTimer)
  centerControlTimer = null
}
function 시작_중앙컨트롤숨김타이머() {
  중단_중앙컨트롤숨김타이머()
  is중앙컨트롤표시.value = true
  centerControlTimer = setTimeout(() => {
    if (isPlaying.value) is중앙컨트롤표시.value = false
  }, 3000)
}
function on사용자활동() {
  is중앙컨트롤표시.value = true
  if (isPlaying.value) 시작_중앙컨트롤숨김타이머()
}
function on마우스진입() {
  isHoveringPlayer.value = true
  on사용자활동()
}
function on마우스나감() {
  isHoveringPlayer.value = false
  if (!isPlaying.value) return
  is중앙컨트롤표시.value = false
  중단_중앙컨트롤숨김타이머()
}
function on전체화면토글(next: boolean) {
  is영화관.value = next
  is중앙컨트롤표시.value = true
}
function 중단_재생전환커버타이머() {
  if (!playCoverTimer) return
  clearTimeout(playCoverTimer)
  playCoverTimer = null
}
function 표시_재생전환커버() {
  중단_재생전환커버타이머()
  is재생전환커버표시.value = true
  playCoverTimer = setTimeout(() => {
    is재생전환커버표시.value = false
  }, 300)
}

watch(volume, (v) => {
  if (!player.value) return
  const next = Math.max(0, Math.min(100, Number(v ?? 0)))
  if (typeof player.value.setVolume === 'function') player.value.setVolume(next)
  if (next <= 0) {
    if (typeof player.value.mute === 'function') player.value.mute()
  } else if (typeof player.value.unMute === 'function') {
    player.value.unMute()
  }
})
</script>

/** 통합 UI·동작 규격 (부분 지정 시 나머지는 기본값과 병합) */
export interface i설정 {
  show: {
    /** false면 볼륨 슬라이더 숨김 */
    sound: boolean
    is수직?: boolean
  }
  config: {
    /** false면 마운트 직후 재생 영역을 켜지 않음 */
    is바로시작: boolean
    autoplay: boolean
    mute: boolean
    /** false면 부모 v-model watchedTime/startTime 변경 시 플레이어가 seek 하지 않음 */
    canMove: boolean
  }
}

export type i설정부분 = {
  show?: Partial<i설정['show']>
  config?: Partial<i설정['config']>
}

const default설정: i설정 = {
  show: {
    sound: true,
    is수직: false
  },
  config: {
    is바로시작: true,
    autoplay: false,
    mute: false,
    canMove: true
  }
}

export function merge_i설정(partial?: i설정부분): i설정 {
  if (!partial) {
    return {
      show: { ...default설정.show },
      config: { ...default설정.config }
    }
  }
  return {
    show: { ...default설정.show, ...partial.show },
    config: { ...default설정.config, ...partial.config }
  }
}

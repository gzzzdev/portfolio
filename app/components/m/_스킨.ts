/**
 * **부품이 테마 재질을 읽는 어휘.** 테마 축이 아니라 그 축을 보고 부품이 고르는 클래스 문자열이다.
 *
 * 이전엔 `model테마/재질`(역할→variant) · `model테마/세그먼티드`(칸 스킨) · `model테마/선택표시`
 * (선택 링·배지) 세 파일로 `_CUSTOM/models/` 안에 있었다. 셋 다 **모델이 아니다** — 표도 행도 없고,
 * 읽는 쪽이 전부 `app/components/m` · `Input` 이다. 축 정의(`~utils/theme/축`)는 값이 뭔지만 알면 되고,
 * 그 값을 어떤 Tailwind 클래스로 옮길지는 부품의 사정이라 부품 옆에 둔다.
 */

import { computed } from 'vue'
import type { i재질 } from '~utils/theme/축'
import { useThemeStore } from '~/stores/useThemeStore'

// ═════════════════════════════  역할 → variant  ═════════════════════════════

export type Variant = 'ghost' | 'soft' | 'subtle' | 'outline' | 'solid' | 'link'

export const ROLES = ['강조', '조용', '인라인'] as const
export type Role = (typeof ROLES)[number]

const 켜짐variant: Variant = 'solid'

const 고정표: Record<Role, Variant> = {
  강조: 'solid',
  조용: 'ghost',
  인라인: 'link'
}

export function colorFor(역할?: Role, 켜짐?: boolean): 'primary' | undefined {
  void 켜짐
  return 역할 === '강조' ? 'primary' : undefined
}

export function variantFor(
  step: i재질,
  역할?: Role,
  켜짐?: boolean
): Variant {
  if (역할 === '인라인')
    return 고정표.인라인

  if (켜짐)
    return 켜짐variant

  return 역할 ? 고정표[역할] : step
}

// ═════════════════════════════  세그먼티드(탭·선택기 트랙)  ═════════════════════════════

export const SEGMENT_TRACK: Record<i재질, string> = {
  outline: 'bg-default ring-1 ring-accented',
  soft: 'bg-elevated/90',
  subtle: 'bg-elevated/90 ring-1 ring-accented'
}

export const SEGMENT_ON: Record<i재질, string> = {
  outline: 'bg-primary/10 ring-1 ring-primary',
  soft: 'bg-default m-층-카드',
  subtle: 'bg-default ring-1 ring-accented m-층-카드'
}

export const SEGMENT_OFF = ''

export const SEGMENT_TRACK_SURFACE: Record<i재질, '종이' | '파임'> = {
  outline: '종이',
  soft: '파임',
  subtle: '파임'
}

const 면을깐다: Record<i재질, boolean> = {
  outline: false,
  soft: true,
  subtle: true
}

export const SEGMENT_TEXT_ON = 'text-highlighted font-semibold'
export const SEGMENT_TEXT_OFF = 'text-muted hover:text-highlighted'

export interface Segment스킨 {
  재질: i재질
  트랙: string
  트랙면: '종이' | '파임'
  칸: (선택됨: boolean) => string
  글자: (선택됨: boolean) => string
  칸면: (선택됨: boolean) => '종이' | '파임'
}

export function segmentSkin(재질: i재질): Segment스킨 {
  return {
    재질,
    트랙: SEGMENT_TRACK[재질],
    트랙면: SEGMENT_TRACK_SURFACE[재질],
    칸: 선택됨 => (선택됨 ? SEGMENT_ON[재질] : SEGMENT_OFF),
    글자: 선택됨 => (선택됨 ? SEGMENT_TEXT_ON : SEGMENT_TEXT_OFF),
    칸면: 선택됨 => (선택됨 && 면을깐다[재질] ? '종이' : SEGMENT_TRACK_SURFACE[재질])
  }
}

export function useSegmentSkin() {
  const theme = useThemeStore()
  return computed(() => segmentSkin(theme.variant))
}

// ═════════════════════════════  선택 표시(목록 링·배지)  ═════════════════════════════

const 윤곽 = 'ring-2 ring-primary/70'

const 틴트 = 'bg-linear-to-b from-primary/8 to-primary/8 dark:from-primary/14 dark:to-primary/14'

export function selectionCls(selected: boolean): string {
  return selected ? `${윤곽} ${틴트}` : ''
}

export const SELECTION_BADGE_CLS
  = 'pointer-events-none absolute -right-1.5 -top-1.5 z-10 flex size-4.5 items-center justify-center rounded-full bg-primary text-inverted m-층-카드'

export const SELECTION_BADGE_ICON = 'i-lucide-check'

export const i메뉴공개options = [
  { label: '공개', value: 'PUBLISHED', icon: 'i-lucide-eye' },
  { label: '숨김', value: 'HIDDEN', icon: 'i-lucide-eye-off' }
] as const
export type i메뉴상태 = (typeof i메뉴공개options)[number]['value']

export const i메뉴보기모드options = [
  { label: '세로카드', value: '세로카드', icon: 'i-lucide-rectangle-vertical' },
  { label: '가로카드', value: '가로카드', icon: 'i-lucide-rectangle-horizontal' },
  { label: '목록', value: '목록', icon: 'i-ph-list-bullets-light' }
] as const
export type i메뉴보기모드 = (typeof i메뉴보기모드options)[number]['value']

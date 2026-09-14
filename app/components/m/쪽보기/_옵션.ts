/**
 * 쪽 보기의 칸 목록. 판(`쪽보기.vue`)과 손잡이(`손잡이.vue`)가 같이 읽는다.
 */

export type i쪽보기 = '흐름' | '1쪽' | '2쪽'

export const 쪽보기options: { value: i쪽보기, label: string, icon: string }[] = [
  { value: '흐름', label: '흐름', icon: 'i-lucide-scroll-text' },
  { value: '1쪽', label: '1쪽', icon: 'i-lucide-file' },
  { value: '2쪽', label: '2쪽', icon: 'i-lucide-book-open' }
]

/**
 * **여백 — 네 변 같은 값, 15·20·30mm 셋, 기본은 가장 좁은 15mm.** 사람이 정한 칸이다(2026-09-14).
 * 한글 기본(좌우 30mm)이 가장 넓은 칸이다. 화면에서 줄여 보는 쪽에서는 여백이 곧 글자 크기를 깎는다.
 */
export const 여백options = [
  { value: 15, label: '15', icon: 'i-lucide-maximize' },
  { value: 20, label: '20', icon: 'i-lucide-square' },
  { value: 30, label: '30', icon: 'i-lucide-minimize' }
]
export const 기본여백mm = 15

/**
 * **저장 형식.** 옛 HWP(바이너리)는 짓기 어려워서 없다.
 * **HWPX 는 숨겼다(2026-09-14 사람이 정함)** — 짓는 코드(`~utils/mdc/hwpx`)는 살아 있고 버튼만 뺐다.
 * 한글에서 열어 확인한 뒤 아래 줄의 주석을 풀면 돌아온다.
 */
export type i저장형식 = 'pdf' | 'docx' | 'pptx' | 'hwpx'
export const 저장형식s: { value: i저장형식, label: string, icon: string, title: string }[] = [
  { value: 'pdf', label: 'PDF', icon: 'i-lucide-file-down', title: 'PDF 로 저장 — 인쇄 창에서 대상을 「PDF로 저장」으로 고른다' },
  { value: 'docx', label: 'DOCX', icon: 'i-lucide-file-text', title: '워드 파일로 저장' },
  { value: 'pptx', label: 'PPTX', icon: 'i-lucide-presentation', title: '발표 파일로 저장 — 제목(#·##)마다 한 장' }
  // { value: 'hwpx', label: 'HWPX', icon: 'i-lucide-file-type', title: '한글 파일로 저장 — 꼬리말(쪽 번호)은 아직 없다' }
]

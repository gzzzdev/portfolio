import { DEFAULT_THEME } from '~utils/theme/축'
import { 배경s } from '~utils/theme/색'
import type { i테마dto } from './model테마'

/**
 * `theme` 표의 초기데이터 — 완제품 카드들.
 *
 * **2026-09-08 이전에는 이 줄들이 `~utils/theme/완제품s.ts` 안의 배열이었다.** (그 파일은 2026-09-09 에
 * `model테마.ts` 로 접혔다.) 표로 옮긴 이유는
 * 조직마다 다른 목록을 줄 수 있어야 해서고, 옮기면서 그 파일에는 「완제품이 무엇인가」만 남았다.
 *
 * 이 표의 **첫 행은 시드가 아니다** — `model테마s.reads` 가 지어내는 현재 테마 행이고 서버에
 * 없다(`model테마.ts` 머리말). 여기 줄들은 그 뒤에 붙는 진짜 행들이다.
 *
 * **카드는 축 전부를 나른다**(`완제품축s`, 2026-09-09). 그전엔 여섯 칸뿐이라 재질·진하기·
 * 글자 크기를 든 그림은 카드가 절반만 줬다 — 「실록」을 넣다가 그 결함이 드러났다.
 *
 * **기본값인 축은 안 적는다.** 게터가 빈 칸을 그 축의 기본값으로 세우므로(`i테마dto` 의 칸 주석),
 * 적힌 칸은 곧 **이 카드가 기본에서 옮긴 값**이다. 여덟 장이 새 칸을 하나도 안 든 것은 빠뜨린 게
 * 아니라 그 뜻이다.
 *
 * **시력 축(글자 크기·줄간격)은 빈 칸의 뜻이 다르다**(2026-09-13, `시력축s`). 기본값이 아니라
 * **「이 카드는 말이 없다」** 다 — 씌워도 보는 사람의 글자 크기를 안 건드린다. 실록만 적은 것은
 * 「크게 읽기」가 그 카드의 정체라서고, 그래서 실록에서 기본으로 가도 글자 크기는 1.125 로 남는다.
 * 기본은 글자 크기에 말이 없다. 되돌리고 싶은 카드는 `fontScale: 1` 을 **적어야** 한다.
 *
 * 배경은 이름(`Slate`·`Mono`…)으로 적는다. 값은 oklch 열한 칸 중 여섯째라 눈으로 못 읽고,
 * 여기 표에서 알아야 하는 건 **어느 회색 계열인가** 뿐이다. `배경값` 이 그 이름을 값으로 바꾼다 —
 * 이 변환이 시드에 있는 것은 표에 들어가는 값이 이름이 아니라 실제 색이라서다. 사다리가 바뀌어도
 * 이미 부어진 행은 안 따라온다(그게 표에 사는 값의 뜻이다).
 */
function 배경값(label: string): string {
  const found = 배경s.find(b => b.label === label)?.colors[5]
  // 사다리에서 이름이 사라지면 조용히 기본 배경이 부어지는 대신 여기서 멈춘다.
  if (!found) throw new Error(`배경 「${label}」를 찾을 수 없습니다. ~utils/theme/색 의 배경s 를 확인하세요.`)
  return found
}

/** 굵기는 완제품이 고르는 축이 아니다 — 카드가 다 같은 값이라 표에서 뺐다. */
const 완제품굵기 = 500

/**
 * 순서가 곧 격자의 순서다(`프리셋격자.vue` 는 다시 줄 세우지 않는다). 밝은 카드와 어두운 카드가
 * 규칙적으로 번갈지도 뭉치지도 않고 섞이는 것이 이 순서가 맞는지 보는 방법이다.
 */
export const i테마seed: readonly Omit<i테마dto, 'id'>[] = [
  { label: '실록', desc: '남보라 · 평평한 판에 흐린 선, 크게 읽기', mode: 'light', font: 'pretendard', primary: '#5b5bd6', bg: 배경값('Gray'), radius: 0.375, elevation: -2, weight: 완제품굵기, borderContrast: -1, fontScale: 1.125, lineHeight: 2 },
  { label: '모닥불', desc: '살구 · 제일 둥글고 깊은 후광', mode: 'dark', font: 'gowun-dodum', primary: '#ffa18c', bg: 배경값('Stone'), radius: 0.5, elevation: 1, weight: 완제품굵기 },
  { label: '비취', desc: '청록 · 둥글고 깊은 그림자', mode: 'light', font: 'suit', primary: '#1e8477', bg: 배경값('Gray'), radius: 0.375, elevation: 1, weight: 완제품굵기 },
  { label: '자정', desc: '연하늘보라 · 살짝 둥글고 얕은 후광', mode: 'dark', font: 'pretendard', primary: '#a1bcff', bg: 배경값('Slate'), radius: 0.25, elevation: -1, weight: 완제품굵기 },
  { label: '기본', desc: '인디고 · 살짝 둥근', mode: 'light', font: 'pretendard', primary: '#3e63dd', bg: 배경값('Slate'), radius: 0.25, elevation: DEFAULT_THEME.elevation, weight: 완제품굵기 },
  { label: '노을', desc: '주홍 · 제일 둥글고 아주 깊은 그림자', mode: 'light', font: 'gowun-dodum', primary: '#db3b1b', bg: 배경값('Stone'), radius: 0.5, elevation: 2, weight: 완제품굵기 },
  { label: '심해', desc: '민트 · 둥글고 차가운 바탕', mode: 'dark', font: 'suit', primary: '#5ad6c3', bg: 배경값('Zinc'), radius: 0.375, elevation: 0, weight: 완제품굵기 },
  { label: '잉크', desc: '검정 · 각지고 그림자 없이', mode: 'light', font: 'pyeojin-gothic', primary: '#111111', bg: 배경값('Mono'), radius: 0, elevation: -2, weight: 완제품굵기 },
  { label: '흑연', desc: '흰빛 · 각지고 후광 없이', mode: 'dark', font: 'pyeojin-gothic', primary: '#ebebeb', bg: 배경값('Mono'), radius: 0, elevation: -2, weight: 완제품굵기 }
]

/** 새 완제품의 출발점 — 지금 화면이 아니라 기본값이다. 완제품을 새로 짜는 자리라 축 값이 이미 서 있어야 한다. */
export const i테마새행: Omit<i테마dto, 'id'> = {
  label: '새 완제품',
  desc: '',
  mode: 'light',
  font: DEFAULT_THEME.font,
  weight: 완제품굵기,
  primary: DEFAULT_THEME.primary,
  bg: DEFAULT_THEME.bg,
  radius: DEFAULT_THEME.radius,
  elevation: DEFAULT_THEME.elevation
}

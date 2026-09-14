const color = ''
const width = ''// w-full min-w-0 max-w-full';
const padding = ''
export const _class = `${width} ${padding}  `
// cursor-pointer

// class="w-full  overflow-x-hidden cursor-pointer"
export const _ui = {
  root: `${width} ${padding} ${color} z-50`,
  content: 'z-51 cursor-pointer',
  base: 'z-51 text-md cursor-pointer',
  item: 'z-51 cursor-pointer'
}

// :ui="true ? {} : {
//     base: [
//       ' gap-0',
//       'transition-colors gap-0'
//     ],
//     segment: [
//       'px-0 mx-0 p-0 m-0 bg-blue-500'
//     ],
//     separatorIcon: 'px-0 bg-green-500'
//   }"

/**
 * 읽기모드 입력칸: 껍데기(테두리·배경·그림자)만 벗긴다. **여백은 그대로 둔다.**
 *
 * 2026-09-05까지는 `px-0!` 로 안쪽 여백까지 벗겼다. 근거는 "테두리가 사라지면 여백은 그냥
 * 빈 공간이고, 라벨과 값 사이가 벌어져 한 줄로 안 읽힌다" 였는데, 그 대가를 실측했더니
 * 모드를 뒤집을 때 값이 **가로로 10px, 세로로 판 전체 96px** 움직였다(`decisions/read-edit`).
 * 격자가 그만큼 흔들린다. 벌어지는 10px 보다 이쪽이 크다.
 *
 * **읽기와 수정이 달라 보여야 한다는 요구는 그대로다.** 다만 그 차이를 여백이 아니라
 * 껍데기가 진다 — 뒤집으면 제자리에서 선과 면만 켜지고 꺼진다. 어느 모드인지는
 * 그것만으로 충분히 보이고(상단 버튼바가 통째로 바뀌는 건 덤), 격자는 안 움직인다.
 */
export const _읽기base = 'ring-0! shadow-none! bg-transparent! cursor-default'

/**
 * `:ui="ui읽기(readonly)"` 로 쓴다. 읽기가 아니면 넘긴 ui를 그대로 돌려준다(참조도 그대로).
 * `base`가 배열인 ui(태그 등)도 받는다 — 문자열로 이어붙이면 쉼표가 껴서 클래스가 깨진다.
 */
export const ui읽기 = <T extends Record<string, any>>(readonly?: boolean, ui: T = _ui as unknown as T): T =>
  readonly ? { ...ui, base: [ui.base, _읽기base].flat().filter(Boolean).join(' ') } : ui

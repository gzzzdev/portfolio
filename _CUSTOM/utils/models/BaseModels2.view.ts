import { reactive, toValue } from 'vue'
import { 정규화필터옵션 } from './BaseModels2.types'
import type { BaseXXDto, i정렬조건, i필터옵션입력, i필터라디오그룹 } from './BaseModels2.types'
import type { BaseModel2 } from './BaseModel2'
import type { BaseModels2 } from './BaseModels2'

/** `라디오필터그룹` — Vue key·그룹 식별용 (호출마다 고유) */
let _필터라디오그룹키seq = 0

/** `state.order`가 있으면 그걸로, 없으면 연결된 메뉴 폴더 순서 → 최신 → 제목↑ → 부제↑. */
export const 기본정렬조건s: i정렬조건[] = [
  // id랑 라벨은 무조건 있으니까.
  {
    label: '순서', value: '순서', func: (a: any, b: any) => {
      const ao = a?.state?.order
      const bo = b?.state?.order
      // model.state.order가 있으면 우선 (mList2 드래그 저장)
      if (ao != null || bo != null)
        return (Number(ao) || 0) - (Number(bo) || 0)
      const 폴더ids = ((a?.메뉴?.폴더s ?? b?.메뉴?.폴더s ?? a?.repo?.메뉴?.폴더s ?? b?.repo?.메뉴?.폴더s ?? []) as any[]).flatMap((x: any) => Array.isArray(x?.children) ? x.children : [x]).map((x: any) => `${x}`)
      return (폴더ids.indexOf(`${a?.stateId}`) - 폴더ids.indexOf(`${b?.stateId}`)) || ((a?.순서 ?? 0) - (b?.순서 ?? 0))
    }
  },
  { label: '최신', value: '최신', func: (a: any, b: any) => Number(b?.stateId ?? 0) - Number(a?.stateId ?? 0) },
  { label: '제목↑', value: '제목↑', func: (a: any, b: any) => toValue(a.label).localeCompare(toValue(b.label)) },
  { label: '부제↑', value: '부제↑', func: (a: any, b: any) => toValue(b?.sub)?.localeCompare(toValue(a?.sub) ?? 0) }
]

/**
 * @param opts.key 생략 시 내부 시퀀스로 유일한 `key` 생성 (Vue `:key`·식별용)
 * @param opts.title 다중 그룹일 때 대시보드 등 접두 라벨
 * @param opts.initialValues 옵션 `value`(들) — 뷰가 안 건드렸을 때의 `기본선택`. 생략 시 이 축은 필터 미적용.
 *   현재 선택은 여기 남지 않는다(뷰가 소유) — `i필터라디오그룹` 주석 참고.
 * @param opts.isMultiple true면 복수선택(OR), `selected`는 `string[]`
 */
export function 라디오필터그룹<T>(
  optionDefs: i필터옵션입력<T>[],
  opts?: {
    key?: string
    title?: string
    initialValues?: string | string[]
    isMultiple?: boolean
  }
): i필터라디오그룹<T> {
  const isMultiple = opts?.isMultiple ?? false
  const key = opts?.key ?? `f${_필터라디오그룹키seq++}`
  const raw = opts?.initialValues
  const 기본선택: string | string[] | null = isMultiple
    ? [...(Array.isArray(raw) ? raw : raw == null || raw === '' ? [] : [raw])]
    : Array.isArray(raw)
      ? (raw[0] ?? null)
      : (raw == null || raw === '' ? null : raw)
  return reactive({
    key,
    title: opts?.title,
    isMultiple,
    options: optionDefs.map(정규화필터옵션),
    기본선택
  }) as i필터라디오그룹<T>
}

/** 목록 드래그 정렬 모달을 열고 결과를 순서/메뉴 폴더에 반영한 뒤 일괄 저장한다. `repo.메뉴`(연결된 메뉴 모델)가 없으면 안내만 하고 끝. */
export function do순서정렬<T extends BaseModel2<Dto>, Dto extends BaseXXDto>(repo: BaseModels2<T, Dto>) {
  const 메뉴 = (repo as any).메뉴
  if (!메뉴) {
    useAlert().log('순서 정렬', '연결된 메뉴가 없습니다.')
    return
  }

  // 결과가 `메뉴.폴더s`로 **저장되므로** id는 서버 PK여야 한다.
  // 저장 전 행을 넣으면 임시 id(`pending-…`)가 그대로 DB에 남는다 — 아직 순서를 매길 행이 아니다.
  const items = toValue(repo.list)
    .filter(x => !x.is신규)
    .map(x => ({
      id: x.stateId,
      label: toValue(x.label),
      icon: x.icon
    }))
  const folders = 메뉴.폴더s?.length > 0 ? 메뉴.폴더s : [...items.map(x => x.id)]

  useModalDragDrop().open({
    title: '순서 정렬',
    folders,
    items
  }).then((result) => {
    if (!result) return

    result.items.forEach((x) => {
      const item = repo.getById(x.id)
      if (!item || toValue(item.label) === x.label) return
      item.label = x.label
    })

    메뉴.폴더s = result.folders
    메뉴.do저장?.()
    repo.do모두저장()
  })
}

import { computed, markRaw, reactive, ref, toValue, watch, type MaybeRefOrGetter, type Ref } from 'vue'
import { get필드s2, get버튼s, get상단필드s, get특정필드 } from '~/components/view/1'

type EmitIsDoing = (event: 'update:isDoing', value: boolean) => void

/**
 * 필드 하나당 로딩 ref 하나를 인덱스로 물고 있는 통.
 *
 * **목록마다 따로 판다.** 머리글로 올라간 필드와 폼에 남은 필드는 서로 다른 목록이라
 * 인덱스가 겹치고, 한 통을 같이 쓰면 짧은 쪽이 `splice`로 긴 쪽의 ref를 잘라낸다
 * (그 순간 저장 스피너가 엉뚱한 칸에서 돈다).
 */
const make로딩풀 = () => {
  const refs: Ref<boolean>[] = reactive([])

  const getRef = (idx: number) => {
    if (!refs[idx])
      refs[idx] = ref(false)
    return refs[idx]
  }

  const normalize = (fields: any[]) => {
    const normalized = fields.map((x: any, idx: number) => {
      x.comp = markRaw(x.comp)
      getRef(idx)
      return x
    })
    refs.splice(normalized.length)
    return normalized
  }

  return { refs, getRef, normalize }
}

export function useModelForm(
  model: MaybeRefOrGetter<any>,
  options: {
    tab자동필드: Ref<string>
    ratio?: Ref<number | undefined>
    emit?: EmitIsDoing
  }
) {
  const { tab자동필드, ratio, emit } = options

  const 본문풀 = make로딩풀()
  const 상단풀 = make로딩풀()

  const is로딩중s = 본문풀.refs
  const is로딩중 = computed(() =>
    본문풀.refs.some(x => toValue(x)) || 상단풀.refs.some(x => toValue(x))
  )

  if (emit) {
    watch(is로딩중, v => emit('update:isDoing', v))
  }

  const 필드s = computed(() => 본문풀.normalize(get필드s2(toValue(model))))

  const 선택자동그룹 = computed(() => {
    const groups = toValue(model)?.자동필드ss ?? []
    return groups.find((x: any) => x.label == tab자동필드.value) ?? groups[0]
  })

  // 상단 버튼바 = 모델의 `자동버튼s` + 자동필드ss 전체의 `position:'top'` 버튼필드.
  //
  // 선택된 탭 그룹만 넘기던 때가 있었는데, `position`은 그리는 자리지 보이는 조건이 아니다 —
  // 상단바에 있는 버튼이 탭을 바꾸면 사라지는 건 그 자리에서 예상되는 동작이 아니고,
  // 목록카드(`카드s`)는 탭이 없어 전체 그룹을 보고 있어서 같은 스펙이 화면마다 다르게 읽혔다.
  // 탭 안에서만 눌리게 하려면 `position`을 빼서 인라인으로 두면 된다 (`do신상랜덤`이 그 예).
  const 버튼s = computed(() => get버튼s(toValue(model)))

  /**
     * 판 머리글로 올라가는 값 필드. 버튼과 같은 이유로 **전체 그룹**에서 모은다(탭 밖의 자리).
     * 그리는 건 뷰의 몫이고, 머리글이 없는 뷰(`Input카드s` 등)는 안 그리면 된다 —
     * 상단 버튼필드가 지금도 그렇게 동작한다.
     */
  const 상단필드s = computed(() => 상단풀.normalize(get상단필드s(toValue(model))))

  const 표시필드s = computed(() => {
    const m = toValue(model)
    const group = 선택자동그룹.value
    const has자동그룹 = (m?.자동필드ss?.length ?? 0) > 0
    const from자동 = group?.list?.map((spec: any) => get특정필드(m, spec)) ?? []
    const fields = has자동그룹 ? from자동 : 필드s.value
    // 위로 올라간 것은 목록에서 뺀다. 버튼은 `버튼s`가, 값 필드는 `상단필드s`가 이미 그린다.
    //
    // 값 필드는 **키로** 뺀다. `position`으로 거르면 `label` 칸을 못 잡는다 — 그 칸은
    // 모델이 선언해서가 아니라 머리글이 이미 그 값을 그리고 있어서 올라가기 때문이다.
    const 위로간s = new Set(상단필드s.value.map((x: any) => String(x?.key ?? '')))
    return 본문풀.normalize(fields.filter((x: any) =>
      !(x?.is버튼 && x?.position === 'top') && !위로간s.has(String(x?.key ?? ''))
    ))
  })

  const get로딩Ref = (idx: number) => 본문풀.getRef(idx)
  const get상단로딩Ref = (idx: number) => 상단풀.getRef(idx)

  watch(
    () => toValue(model)?.자동필드ss,
    (groups) => {
      if (!tab자동필드.value && groups?.length)
        tab자동필드.value = groups[0].label
    },
    { immediate: true, deep: true }
  )

  if (ratio) {
    watch(tab자동필드, () => {
      ratio.value = 선택자동그룹.value?.config?.ratio ?? 40
    })
  }

  return {
    is로딩중,
    is로딩중s,
    필드s,
    버튼s,
    선택자동그룹,
    상단필드s,
    표시필드s,
    get로딩Ref,
    get상단로딩Ref
  }
}

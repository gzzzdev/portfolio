import { 타입_to_컴포넌트, 타입지정 } from '~utils/models'
import { resolve필드Comp } from '~utils/models/ORM.resolve.client'

type i필드 = any
type i자동필드Spec = {
  key?: string
  label?: string
  show?: any
  is한줄?: boolean
  /** 여러 열 뷰(`view상세5`)에서 이 필드가 원하는 가로 자리. 생략하면 `기본폭`이 정한다. */
  폭?: i폭
  canEdit?: boolean
  type?: any
  props?: Record<string, any>
  options?: { label: string, value: string }[]
  getOptions?: () => Promise<{ label: string, value: string }[]>
  getter?: (model: any) => any
  setter?: (model: any, v: any) => void
  loading?: any
  // 버튼필드(`타입지정.버튼`) 전용
  icon?: string
  position?: 'top' | 'bot'
  is수정할때만?: boolean
  /** 눌리지 않는 상태. `show:false`(사라짐)와 달리 자리를 지킨다. ref/computed 가능. */
  disabled?: any
  onClick?: (model: any) => void
}
type i자동버튼Spec = {
  key?: string
  label?: string
  show?: any
  is수정할때만?: boolean
  position?: 'top' | 'bot'
  icon?: string
  onClick?: (model: any) => void
}

/** 필드 하나가 원하는 가로 자리. 뜻은 `ORM.ts`의 `i필드.폭` 참고. */
export type i폭 = '반' | '전체' | '옆'

/** 반 칸(≈360px)에 넣으면 안이 눌려버리는 컴포넌트들. */
const 폭_전체 = new Set([
  'Input카드',
  'Input카드s',
  'Input매트릭스',
  'Input본문',
  'Input선택기S',
  'Input유튜브',
  'Input파일'
])

/**
 * 스펙에 `폭`이 없을 때 컴포넌트 종류에서 유도한다.
 * 타입→컴포넌트 매핑과 같은 관례라, 모델 작성자는 예외일 때만 `폭`을 직접 적으면 된다.
 */
export const 기본폭 = (compName?: string, props?: Record<string, any>): i폭 => {
  if (!compName)
    return '반'
  if (폭_전체.has(compName))
    return '전체'
    // 여러 줄 문자를 반 칸에 넣으면 한 줄이 너무 짧아져 읽기가 나빠진다.
  if (compName === 'Input문자' && props?.is여러줄)
    return '전체'
    // 사진3은 제 안에서 560px부터 AI생성/검색 패널을 옆으로 펼친다(`사진3.vue`의 SIDE_LAYOUT_BREAKPOINT).
    // 그 패널이 살아있으면 넓은 자리가 필요하고, 패널이 꺼진 사진(증명사진 등)은 세로로 길기만 해서
    // 본문 옆에 세워두는 편이 낫다. 즉 폭 요구가 타입이 아니라 props로 갈린다.
  if (compName === 'Input사진3')
    return (props?.can생성 !== false || props?.can검색 !== false) ? '전체' : '옆'
  return '반'
}

const getConfig = (model: any, key: string | number, spec?: i자동필드Spec) => {
  const configKey = `_config${String(key)}`
  const baseModel
    = typeof model === 'function'
      ? new model()
      : (model as Record<string, any> | null)
  const hasConfig = baseModel
    ? Object.prototype.hasOwnProperty.call(baseModel, configKey)
    : false
  const config = hasConfig ? (baseModel![configKey] ?? {}) : {}

  if (spec) {
    return {
      show: true,
      label: String(key),
      ...config,
      ...spec
    }
  }

  return {
    show: true,
    label: String(key),
    ...config
  }
}

/**
 * `model[key]`로 꺼낸 `do*` 핸들러를 model에 묶는다.
 * 여기서 꺼낸 함수는 `onClick()`처럼 model과 떨어져 호출되므로, 프로토타입 메서드로 선언된
 * `do*`(= 서브클래스가 `super.do초안()`을 부를 수 있는 형태)는 bind가 없으면 `this`를 잃는다.
 * 화살표 필드는 this가 이미 렉시컬이라 bind가 무해하다.
 */
const get핸들러 = (model: T, key: string) => {
  const fn = (model as Record<string, any>)?.[key]
  return typeof fn === 'function' ? fn.bind(model) : fn
}

/** `타입지정.버튼`으로 지정된 스펙인지. (값이 없고 onClick만 있는 필드) */
const is버튼타입 = (type: any) => !!type?.name && type.name === 타입지정.버튼.name

/** 한 겹짜리 ref/computed를 펴서 v-bind에 그대로 넘길 수 있는 값으로 만든다. */
const unwrap = (obj?: Record<string, any> | null) =>
  Object.fromEntries(Object.entries(obj ?? {}).map(([k, v]) => [k, toValue(v)]))

/**
 * 버튼필드를 일반 필드와 같은 모양(i필드)으로 만든다.
 * 값이 없으므로 `value`/`setter`는 비고, 대신 `props.onClick`으로 동작을 넘긴다.
 * `canEdit:false`지만 `Input버튼`은 readonly를 무시하므로 읽기모드에서도 눌린다.
 */
const make버튼필드 = (model: T, key: string, config: any) => {
  const onClick = config.onClick
    ? () => config.onClick(model)
    : get핸들러(model, key)

  return {
    key: String(key),
    is버튼: true,
    position: config.position,
    is수정할때만: config.is수정할때만 ?? false,
    show: computed(() => toValue(config.show) !== false && typeof onClick === 'function'),
    label: config.label ?? String(key),
    is한줄: false,
    폭: (config.폭 ?? '반') as i폭,
    comp: resolve필드Comp(타입지정.버튼),
    loading: computed(() => toValue(config.loading)),
    props: computed(() => ({
      label: config.label ?? String(key),
      icon: config.icon,
      // props 안의 ref/computed는 v-bind 시점에 unwrap되지 않아 `[object Object]`가 된다.
      // (`disabled`, `title`처럼 상태에 따라 변하는 값을 쓰려면 여기서 펴줘야 한다.)
      ...unwrap(config.props),
      // `disabled`는 `show`처럼 스펙 최상위에서도 받는다.
      disabled: toValue(config.disabled) ?? toValue(config.props?.disabled) ?? false,
      onClick
    })),
    canEdit: false,
    value: undefined,
    botHTML: undefined,
    setter: (_v: any) => { },
    onClick
  } satisfies i필드
}

const _get필드명s = (model: T) => {
  if (model == null)
    return []
  const proto = Object.getPrototypeOf(model) || {}
  const protoDescriptors = Object.getOwnPropertyDescriptors(proto)
  // class 필드에 선언된 화살표 함수(`do1 = () => {}`)도 잡아주기 위해 인스턴스 자체의 프로퍼티까지 포함
  const instanceDescriptors = Object.getOwnPropertyDescriptors(model ?? {})
  const descriptors = { ...protoDescriptors, ...instanceDescriptors }

  return Object.entries(descriptors)
    .filter(([k, d]) => k !== 'constructor' && (typeof d.get === 'function' || typeof d.set === 'function'))
    .filter(([k]) => getConfig(model, k).show !== false)
    .map(([k]) => k)
}
export const get특정필드 = (model: T, keyOrSpec: string | i자동필드Spec) => {
  const spec = typeof keyOrSpec === 'string' ? undefined : keyOrSpec
  const key = (typeof keyOrSpec === 'string' ? keyOrSpec : (keyOrSpec?.key ?? keyOrSpec?.label ?? '')) as string
  if (!key) {
    const safeComp = 타입_to_컴포넌트('', { type: 타입지정._.문자 })
    return {
      key: '',
      show: computed(() => false),
      label: '',
      폭: '반' as i폭,
      comp: resolve필드Comp(safeComp),
      loading: computed(() => false),
      props: computed(() => ({})),
      canEdit: false,
      value: '',
      botHTML: undefined,
      setter: (_v: any) => { }
    } satisfies i필드
  }

  let value: any
  try {
    value = spec?.getter
      ? spec.getter(model)
      : (model as Record<string, any>)?.[key]
  } catch {
    value = ''
  }

  const setter = (v: any) => {
    if (model == null)
      return
    if (spec?.setter) {
      spec.setter(model, v)
      return
    }
    (model as Record<string, any>)[key] = v
  }

  const config = getConfig(model, key, spec)

  if (is버튼타입(config.type))
    return make버튼필드(model, key, config)

  let comp// = 타입_to_컴포넌트(value, config);
  if (config?.options !== undefined && config.type == undefined)
    comp = 타입_to_컴포넌트(value, { type: 타입지정.선택0 })
  else
    comp = 타입_to_컴포넌트(value, config)
  if (!comp)
    comp = 타입_to_컴포넌트(value, { type: 타입지정._.문자 })

  const show = ref(config.show)
  const cardPassKeys = ['show컨트롤', 'show탭', 'is미니', 'collapsible'] as const
  const props = ref({
    ...config?.props,
    ...comp.props,
    ...Object.fromEntries(
      cardPassKeys
        .filter(k => config[k] !== undefined)
        .map(k => [k, config[k]])
    )
  })// ...config.props,

  props.value.items = toValue(config.options) ?? []

  if (config.getOptions) {
    show.value = false

    // `i필드.getOptions`(ORM.ts)는 배열을 돌려주는 동기 함수다(`model수업`의 학기·강사). 여기 타입만
    // Promise 로 적혀 있어 `.then` 이 터지고, 그 한 번에 수업 상세가 통째로 안 떴다. 둘 다 받는다.
    Promise.resolve(config.getOptions()).then((items) => {
      props.value.items = items
      show.value = true
    })
  }

  return {
    key: String(key),
    show: computed(() => toValue(show)), // !== false,
    label: config.label ?? String(key),
    is한줄: config.is한줄,
    폭: (config.폭 ?? 기본폭(comp?.name, props.value)) as i폭,

    comp: resolve필드Comp(comp),
    loading: computed(() => toValue(config.loading)), // toValue(config.loading ?? false),

    props: computed(() => toValue(props)),
    // 버튼필드만 들고 다니던 값. 값 필드도 `position:'top'`으로 머리글에 올라가므로
    // 여기서 실어 보내야 `표시필드s`가 폼 목록에서 뺄 수 있다.
    position: config.position,
    canEdit: config.canEdit ?? true,
    value,
    botHTML: undefined,
    setter
  } satisfies i필드
}

export const get필드s2 = (model: T) => {
  if (model == null)
    return []
  const arr = _get필드명s(model)
  return arr.map(key => get특정필드(model, key))
}

/**
 * `자동필드ss` 안의 버튼필드 중 `position:'top'`인 것을 상단 버튼바 항목으로 승격시킨다.
 *
 * 기본은 전체 그룹이다 — 상단바는 탭 밖의 자리라, 선언한 탭을 벗어났다고 버튼이 사라지면 안 된다.
 * (탭 안에서만 보여야 하는 버튼은 `position`을 빼서 선언한 자리에 인라인으로 둔다)
 * `그룹s`는 일부 그룹만 보고 싶을 때를 위해 남겨둔 인자로, 지금 넘기는 호출부는 없다.
 */
export const get승격버튼s = (model: T, 그룹s?: any[]) => {
  if (model == null)
    return []
  const groups = 그룹s ?? ((model as Record<string, any>)?.자동필드ss ?? [])
  return (groups as any[])
    .filter(g => toValue(g?.show ?? true))
    .flatMap(g => (g?.list ?? []) as i자동필드Spec[])
    .filter(spec => is버튼타입(spec?.type) && spec?.position === 'top')
    .map((spec) => {
      const key = String(spec.key ?? spec.label ?? '')
      const field = make버튼필드(model, key, getConfig(model, key, spec))
      return {
        key: field.key,
        show: field.show,
        is수정할때만: field.is수정할때만,
        position: 'top' as const,
        label: field.label,
        onClick: field.onClick,
        icon: spec.icon ?? undefined
      } satisfies i필드
    })
    .filter(x => typeof x.onClick === 'function')
}

/**
 * `label` 이 어느 칸에서 왔는지 **값으로** 찾는다.
 *
 * 키로 짐작하면 안 된다. `get label()` 은 모델이 마음대로 덮는 자리라, 칸 하나를 그대로 주는
 * 모델(`model캐릭터` 의 `이름`)도 있지만 **어느 칸도 아닌 것**을 주는 모델이 더 많다 —
 * `model테마` 는 `'테마'` 상수고, `model등급심사` 는 `회차명 || 날짜 조합`이다.
 * 키 목록으로 때려맞히면 그런 모델에서 엉뚱한 칸이 머리글로 끌려 올라간다.
 *
 * 그래서 **지금 값이 `label` 과 똑같은 칸**을 찾는다. 같으면 그 칸이 곧 머리글이 이미 보여준 것이고,
 * 없으면 뺄 것도 없다(머리글은 글자만 그리고 폼은 그대로 둔다).
 *
 * 값이 같은 칸이 둘 이상이면 `get label()` 이 읽는 순서로 끊는다.
 */
const label키순서 = ['이름', '제목', 'label', 'title', 'name']

const findLabel스펙 = (model: T, specs: i자동필드Spec[]) => {
  const label = String((model as Record<string, any>)?.label ?? '')
  if (!label)
    return undefined

  const 후보s = specs.filter((spec) => {
    if (is버튼타입(spec?.type))
      return false
    const key = String(spec?.key ?? '')
    if (!key)
      return false
    try {
      return String((model as Record<string, any>)?.[key] ?? '') === label
    } catch {
      return false
    }
  })
  if (!후보s.length)
    return undefined

  for (const k of label키순서) {
    const hit = 후보s.find(spec => String(spec?.key ?? '') === k)
    if (hit)
      return hit
  }
  return 후보s[0]
}

/**
 * 판 머리글이 지는 **값 필드**들. 폼 목록에서는 빠진다.
 *
 * 두 갈래가 들어온다.
 * 1. **`label` 칸 — 선언 없이 자동으로.** 머리글은 이미 `label` 을 글자로 그리고 있었고, 같은 값이
 *    바로 아래 `이름`/`제목` 칸에 또 있었다(`v2/characters` 의 「김민준」이 두 번, `견본`의 「반만 채운 것」이
 *    두 번). 머리글이 보여주는 값은 아래에서 뺀다 — 이게 규칙이고, 모델이 손들 필요가 없다.
 *    올라간 칸은 글자가 아니라 **입력칸**이라 거기서 바로 고쳐진다(`set label` 은 base 에 있다).
 * 2. **`position:'top'` 이 붙은 칸** — 모델이 따로 올려보낸 것(`model문서` 의 「읽는 사람」).
 *
 * 버튼은 여기 안 온다 — 그쪽은 `get버튼s` 가 상단 버튼바로 데려가고, 두 자리는 다르다.
 *
 * 전체 그룹에서 모으는 이유는 버튼과 같다: 머리글은 탭 밖의 자리다. 문서의 제목이 「본문」탭에서
 * 사라지면, 편집기를 보는 내내 지금 무슨 글을 고치는지가 화면에서 없어진다.
 *
 * **`thumbnail` 과 `sub` 은 안 뺀다.** 머리글의 동그란 사진은 꾸밈이고, 그 칸(`증명사진`)에는
 * 「AI 증명사진」처럼 딸린 동작이 있어 빼면 사진을 바꿀 길이 없어진다. `sub` 은 setter 가 없어서
 * 애초에 「위에서 고친다」가 성립하지 않는다 — 아래 칸을 뺄 근거가 없다. 둘 다 중복이어도 둔다.
 */
export const get상단필드s = (model: T, 그룹s?: any[]) => {
  if (model == null)
    return []
  const groups = 그룹s ?? ((model as Record<string, any>)?.자동필드ss ?? [])
  const specs = (groups as any[])
    .filter(g => toValue(g?.show ?? true))
    .flatMap(g => (g?.list ?? []) as i자동필드Spec[])

  const label스펙 = findLabel스펙(model, specs)
  const 올림s = specs.filter(spec => spec?.position === 'top' && !is버튼타입(spec?.type))

  // label 칸에 `position:'top'` 이 또 붙어 있어도 한 번만 (선언은 이제 군더더기지만 무해해야 한다).
  const 뽑힘s = [label스펙, ...올림s].filter((x): x is i자동필드Spec => !!x)
  const seen = new Set<string>()
  return 뽑힘s
    .filter((spec) => {
      const key = String(spec?.key ?? '')
      if (seen.has(key))
        return false
      seen.add(key)
      return true
    })
    .map(spec => ({
      ...get특정필드(model, spec),
      // 제목 자리인가. 뷰가 이 칸만 다르게 그린다 — 입력 상자가 아니라 `m라벨`(글자 + 연필)로.
      is라벨: spec === label스펙
    }))
}

export const get버튼s = (model: T, 그룹s?: any[]) => {
  if (model == null)
    return []
  const 승격버튼s = get승격버튼s(model, 그룹s)
  const buttonSpecs = (model as Record<string, any>)?.자동버튼s as i자동버튼Spec[] | undefined
  if (Array.isArray(buttonSpecs) && buttonSpecs.length > 0) {
    return buttonSpecs.map((spec) => {
      const key = String(spec.key ?? '')
      const onClick = spec.onClick
        ? () => spec.onClick?.(model)
        : get핸들러(model, key)
      return {
        key,
        show: spec.show ?? true,
        is수정할때만: spec.is수정할때만 ?? false,
        position: spec.position ?? 'top',
        label: spec.label ?? key,
        onClick,
        icon: spec.icon ?? undefined
      } satisfies i필드
    }).filter(x => !!x.onClick).concat(승격버튼s)
  }

  const hasConfig = (model: any, key: string | number) => {
    const configKey = `_config${String(key)}`
    const baseModel
      = typeof model === 'function'
        ? new model()
        : (model as Record<string, any> | null)

    return baseModel
      ? Object.prototype.hasOwnProperty.call(baseModel, configKey)
      : false
  }

  const proto = Object.getPrototypeOf(model) || {}
  const protoDescriptors = Object.getOwnPropertyDescriptors(proto)
  // class 필드 화살표 함수(`do1 = () => {}`)도 포함하려고 인스턴스 프로퍼티까지 합침
  const instanceDescriptors = Object.getOwnPropertyDescriptors(model ?? {})
  const descriptors = { ...protoDescriptors, ...instanceDescriptors }
  const _버튼s = Object.entries(descriptors)
    .filter(([k, d]) => k !== 'constructor' && (typeof d.value === 'function' && hasConfig(model, k)))
    .filter(([k]) => getConfig(model, k).show !== false)
    .map(([k]) => k)

  return _버튼s.map((key) => {
    const config = getConfig(model, key)

    return {
      key: String(key),
      show: config.show !== false,
      is수정할때만: config.is수정할때만 ?? false,
      position: config.position ?? 'top',
      label: config.label ?? String(key),
      onClick: get핸들러(model, key),
      icon: config.icon ?? undefined
    } satisfies i필드
  }).concat(승격버튼s)
}

/** 행 하나가 할 수 있는 행동(`do*`) 하나. `get행동버튼s`의 반환 원소. */
export type i행동버튼 = {
  key: string
  label: string
  icon?: string
  /** boolean 또는 ComputedRef. 호출부에서 `toValue`로 푼다. */
  show: any
  /**
     * 누르면 실행. 값을 받는 행동(`do기록(메시지)`)이 있어서 인자 자리를 열어둔다 —
     * 안 받는 행동은 그냥 무시한다.
     *
     * 단, `자동필드ss`에 `onClick`을 직접 적은 스펙은 model만 받는 래퍼라 값이 안 넘어간다.
     * 값이 필요한 행동은 `do*` 키로 선언할 것(그쪽은 바인딩된 메서드가 그대로 불린다).
     */
  onClick: (값?: string) => any
}

/**
 * 모델이 가진 행동 버튼(`do*`)을 **위치와 무관하게** 모은다.
 *
 * `get버튼s`는 상단 버튼바용이라 `position:'top'`인 것만 승격시키지만,
 * "이 행에 무슨 행동이 가능한가"를 묻는 쪽(챗봇 등)은 버튼이 화면 어디에 놓이는지를 신경 쓰지 않는다.
 * 실제로 회원의 do회비납부·do등급증출력 등은 `자동필드ss` 안의 인라인 버튼필드라 `get버튼s`에 안 잡힌다.
 *
 * `resolve필드Comp`를 거치지 않으므로(컴포넌트가 필요 없다) 렌더 밖에서도 부를 수 있다.
 * `show`는 풀지 않고 그대로 넘긴다 — 가용성 판단은 호출 시점에 해야 최신이다.
 */
export const get행동버튼s = (model: T): i행동버튼[] => {
  if (model == null)
    return []

  const 버튼specs = ((model as Record<string, any>)?.자동버튼s ?? []) as i자동버튼Spec[]
  const 필드specs = (((model as Record<string, any>)?.자동필드ss ?? []) as any[])
    .filter(g => toValue(g?.show ?? true))
    .flatMap(g => (g?.list ?? []) as i자동필드Spec[])
    .filter(spec => is버튼타입(spec?.type))

  const seen = new Set<string>()
  return [...버튼specs, ...필드specs]
    .map((spec) => {
      const key = String(spec.key ?? '')
      const config = getConfig(model, key, spec)
      const onClick = config.onClick
        ? () => config.onClick(model)
        : get핸들러(model, key)
      return {
        key,
        label: String(config.label ?? key),
        icon: config.icon ?? undefined,
        show: config.show ?? true,
        onClick
      } as i행동버튼
    })
    .filter((x) => {
      if (!x.key || typeof x.onClick !== 'function' || seen.has(x.key))
        return false
      seen.add(x.key)
      return true
    })
}

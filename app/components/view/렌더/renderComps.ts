const defs = {
  div: {},
  img: { valueProp: 'src' },
  UBadge: { valueProp: 'label' },
  UAvatar: { valueProp: 'src' },
  MIcon: { valueProp: 'name' },
  MQR: { valueProp: 'modelValue' },
  /** 고정 사각형에 맞춰 폰트가 자동으로 줄어드는 텍스트 (이름처럼 잘리면 안 되는 값) */
  MFit: { valueProp: 'text' }
  /*
     * 한때 `MArt`(프레임·길로슈·엠블럼을 그리는 벡터 레이어)가 여기 있었다. 좌표를 코드가 들던
     * 스킨 시절, div 의 사각형 어휘로 못 그리는 곡선을 대던 자리다. 디자인틀은 레이어가
     * 배경(그림) · 표식(그림·색판) · 글자뿐이라 이 노드를 만드는 코드가 하나도 안 남았다.
     * 컴포넌트 자체(`m/Art.vue`)는 이 저장소에 남은 유일한 벡터 문양 소스라 지우지 않았다 —
     * 표식을 벡터로 뽑게 되면 그때 다시 이 표에 올리면 된다.
     */
} as const

export type RenderCompKey = keyof typeof defs

export const renderComps = Object.fromEntries(
  (Object.keys(defs) as RenderCompKey[]).map(key => [key, { _k: key } as const])
) as { [K in RenderCompKey]: { readonly _k: K } }

export type RenderComp = typeof renderComps[RenderCompKey]

export interface RenderItem {
  comp: RenderComp
  props?: Record<string, unknown>
  children?: RenderItem | RenderItem[]
  value?: string
  key?: string
}

export const renderCompKey = (comp: RenderComp): RenderCompKey => comp._k

export const renderValueProp = (key: RenderCompKey): string | undefined => {
  const def = defs[key]
  return 'valueProp' in def ? def.valueProp : undefined
}

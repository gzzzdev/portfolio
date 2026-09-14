export const getCSSColor = (colorVar: string) => {
  if (typeof window === 'undefined') return colorVar
  const value = getComputedStyle(document.documentElement).getPropertyValue(colorVar).trim()
  return value || colorVar
}

// CSS 변수를 실제 색상 값으로 변환하는 함수
export const resolveCSSColor = (color: string) => {
  if (color.startsWith('var(')) {
    const varName = color.replace('var(', '').replace(')', '')
    return getCSSColor(varName)
  }
  return color
}

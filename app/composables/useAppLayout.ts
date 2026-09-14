export function useAppLayout() {
  const isHeader = useState<boolean>('layout:isHeader', () => true)
  const isFooter = useState<boolean>('layout:isFooter', () => false)

  const transparentHeader = useState<boolean>('layout:transparentHeader', () => false)
  return { isHeader, isFooter, transparentHeader }
}

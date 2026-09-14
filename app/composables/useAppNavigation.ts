import { storeToRefs } from 'pinia'
import type { BreadcrumbItem } from '@nuxt/ui'
import { useMyAuthStore } from '~/stores/useMyAuthStore'

type AppNavItem = {
  label?: string
  description?: string
  to?: string
  icon?: string
  active?: boolean
  branchActive?: boolean
  show?: boolean
  roles?: string[]
  children?: AppNavItem[]
}

function normalizePath(path: string): string {
  if (!path) return '/'
  if (path.length > 1 && path.endsWith('/')) return path.slice(0, -1)
  return path
}

function pathMatches(pathname: string, basePath: string): boolean {
  const current = normalizePath(pathname)
  const base = normalizePath(basePath)
  if (current === base) return true
  if (base === '/') return current === '/'
  return current.startsWith(`${base}/`)
}

function getPathMatchScore(pathname: string, basePath: string): number {
  const current = normalizePath(pathname)
  const base = normalizePath(basePath)
  if (current === base) return 2
  if (base === '/') return current === '/' ? 2 : 0
  return current.startsWith(`${base}/`) ? 1 : 0
}

function createBaseNavItems(appConfig: { navs?: AppNavItem[] }): AppNavItem[] {
  return Array.isArray(appConfig.navs) ? appConfig.navs : []
}

function filterVisibleNavItems(items: AppNavItem[]): AppNavItem[] {
  return items
    .filter(item => item.show !== false)
    .map(item => ({
      ...item,
      children: Array.isArray(item.children) ? filterVisibleNavItems(item.children) : undefined
    }))
}

function hasActivePathInTree(node: AppNavItem, path: string): boolean {
  if (!node || typeof node !== 'object') return false
  if (typeof node.to === 'string' && pathMatches(path, node.to)) return true
  if (!Array.isArray(node.children)) return false
  return node.children.some(child => hasActivePathInTree(child, path))
}

function withActiveTree(items: AppNavItem[], path: string): AppNavItem[] {
  return items.map((item) => {
    const children = Array.isArray(item.children) ? withActiveTree(item.children, path) : undefined
    const selfActive = Boolean(item.active) || (typeof item.to === 'string' && pathMatches(path, item.to))
    const childActive = children?.some(child => child.active || child.branchActive) ?? false
    return {
      ...item,
      children,
      branchActive: childActive,
      active: selfActive || childActive
    }
  })
}

type PathMatchCandidate = {
  node: AppNavItem
  chain: AppNavItem[]
  score: number
  depth: number
  pathLength: number
}

function pickBetterMatch(
  current: PathMatchCandidate | null,
  next: PathMatchCandidate | null
): PathMatchCandidate | null {
  if (!current) return next
  if (!next) return current
  if (next.score !== current.score) return next.score > current.score ? next : current
  if (next.depth !== current.depth) return next.depth > current.depth ? next : current
  if (next.pathLength !== current.pathLength) return next.pathLength > current.pathLength ? next : current
  return current
}

function findBestPathMatch(
  items: AppNavItem[],
  path: string,
  chain: AppNavItem[] = []
): PathMatchCandidate | null {
  let best: PathMatchCandidate | null = null
  for (const item of items) {
    const nextChain = item.label ? [...chain, item] : chain
    if (typeof item.to === 'string') {
      const score = getPathMatchScore(path, item.to)
      if (score > 0) {
        best = pickBetterMatch(best, {
          node: item,
          chain: nextChain,
          score,
          depth: nextChain.length,
          pathLength: normalizePath(item.to).length
        })
      }
    }
    if (Array.isArray(item.children)) {
      best = pickBetterMatch(best, findBestPathMatch(item.children, path, nextChain))
    }
  }
  return best
}

function findNodeByPath(items: AppNavItem[], path: string): AppNavItem | null {
  return findBestPathMatch(items, path)?.node ?? null
}

function findParents(items: AppNavItem[], path: string): AppNavItem[] {
  return findBestPathMatch(items, path)?.chain ?? []
}

export function useAppNavigation() {
  const route = useRoute()
  const { is관리자 } = storeToRefs(useMyAuthStore())
  const appConfig = useAppConfig() as { navs?: AppNavItem[] }

  const navs = computed<AppNavItem[]>(() => {
    const items = createBaseNavItems(appConfig)
    const roleFilteredItems = toValue(is관리자)
      ? items
      : items.filter(item => !item.roles?.includes('운영자'))
    const visibleItems = filterVisibleNavItems(roleFilteredItems)
    return withActiveTree(visibleItems, route.path)
  })

  const isShortLayoutRoute = computed(() => route.meta.layoutHero === 'short')

  const activeSubDetailParent = computed<AppNavItem | null>(() => {
    const navWithChildren = navs.value.filter(item => Array.isArray(item.children))
    const byChildPath = navWithChildren.find(item => hasActivePathInTree(item, route.path))
    if (byChildPath) return byChildPath
    return navWithChildren.find(item => item.active) ?? null
  })

  const activeSubDetailChildren = computed<AppNavItem[]>(() => {
    const children = activeSubDetailParent.value?.children
    if (!Array.isArray(children)) return []
    return withActiveTree(children, route.path)
  })

  const showSubDetailAside = computed(
    () => isShortLayoutRoute.value && activeSubDetailChildren.value.length > 0
  )

  const shortHeroByRoute = computed(() => {
    if (!isShortLayoutRoute.value) return null
    const matchedNode = findNodeByPath(navs.value, route.path)
    if (!matchedNode?.label) {
      const current = normalizePath(route.path)
      if (current === '/' || current === '/index') {
        return {
          title: '홈',
          breadcrumbs: [{ label: '홈', to: '/' }]
        }
      }
      return null
    }
    const parents = findParents(navs.value, route.path)
    const breadcrumbCore: BreadcrumbItem[] = parents.map(node => ({
      label: node.label ?? '',
      to: node.to
    }))
    return {
      title: matchedNode.label,
      description: matchedNode.description,
      breadcrumbs: [{ label: '홈', to: '/' }, ...breadcrumbCore]
    }
  })

  return {
    navs,
    isShortLayoutRoute,
    activeSubDetailParent,
    activeSubDetailChildren,
    showSubDetailAside,
    shortHeroByRoute
  }
}

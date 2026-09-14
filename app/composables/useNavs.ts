import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import {
  model역할s,
  model메뉴s,
  type i역할코드,
  type i메뉴권한,
  type model역할,
  type model메뉴
} from '~models/test2'
import {
  is구분선,
  isFolderItem,
  isRowNode,
  rowIdOf,
  type i폴더s
} from '@/components/m/Sortable/1/index.vue'

export type GnbMode = i메뉴권한

export type NavLink = {
  label: string
  /** 폴더(묶음)는 path 없음 — children만 노출 */
  path?: string
  icon?: string
  children?: NavLink[]
  /** 생략 또는 true면 GNB에 표시; false면 제외 */
  show?: MaybeRefOrGetter<boolean>
  /**
   * `path` 말고도 이 항목을 켜는 경로들. 게시판 메뉴가 쓴다 — GNB 에는 「소통」 한 칸(공지 게시판이 입구)만
   * 서고 소식·Q&A 는 그 화면의 탭이 옮기므로, `/boards/qna` 에서도 그 한 칸이 켜져야 한다.
   */
  활성경로s?: string[]
}
/** menuDirectory / Sortable 과 동일 키 */
export type NavDivider = { is구분선: true }
export type NavItem = NavLink | NavDivider
export type NavGroup = { navs: NavItem[] }
const EMPTY_NAV_GROUP: NavGroup = { navs: [] }

function roleByCode(code: i역할코드): model역할 | undefined {
  return toValue(model역할s.getInstance().list).find(r => r.stateCode === code)
}

function tableById(id: string | number): model메뉴 | null {
  return model메뉴s.getInstance().getById(id) ?? null
}

/** 게시판 메뉴 행들의 경로 — 어느 게시판 메뉴든 이 전부에서 켜진다. */
function 게시판경로s(): string[] {
  return toValue(model메뉴s.getInstance().list)
    .filter(menu => menu.is게시판)
    .map(menu => menu.경로)
    .filter(path => Boolean(path?.trim()))
}

function toNavLinkFromTable(table: model메뉴, show?: boolean): NavLink {
  return {
    label: table.이름 || table.label || String(table.stateId),
    path: table.경로,
    icon: table.아이콘 ?? undefined,
    ...(table.is게시판 ? { 활성경로s: 게시판경로s() } : {}),
    ...(show === false ? { show: false } : {})
  }
}

/**
 * 배치(역할의 `메뉴순서`)는 순서만 정한다. 자격은 언제나 메뉴의 `접근역할codes`가 소유한다.
 * 메뉴에서 역할을 회수해도 `메뉴순서`에는 id가 남으므로, 여기서 한 번 더 교차 확인한다.
 */
function resolveEntry(
  entry: i폴더s[number],
  used: Set<string>,
  role: i역할코드
): NavItem | null {
  if (is구분선(entry)) return { is구분선: true }

  if (isFolderItem(entry)) {
    const children: NavLink[] = []
    for (const child of entry.children) {
      const resolved = resolveEntry(child, used, role)
      if (!resolved || isNavDivider(resolved)) continue
      children.push(resolved)
    }
    if (children.length === 0) return null
    return {
      label: entry.label,
      children,
      ...(entry.show === false ? { show: false } : {})
    }
  }

  if (!(typeof entry === 'string' || typeof entry === 'number' || isRowNode(entry)))
    return null

  const id = String(rowIdOf(entry))
  if (!id || used.has(id)) return null
  const table = tableById(id)
  if (!table) return null
  if (!table.접근역할codes.includes(role)) return null
  used.add(id)
  return toNavLinkFromTable(table, isRowNode(entry) ? entry.show : undefined)
}

function menuDirectoryOf(role: model역할): i폴더s {
  const ordered = role.메뉴순서
  if (Array.isArray(ordered) && ordered.length > 0) return ordered
  return role.접근가능메뉴s.map((t: model메뉴) => t.stateId)
}

/**
 * 역할의 GNB 순서(폴더 안쪽까지 펼친) `메뉴 id → 위치`.
 * `navGroupFromRole`은 네비 트리를 만들지만, 게시판 버튼처럼 순서만 필요한 쪽을 위한 것.
 */
export function menuOrderMap(role: i역할코드): Map<string, number> {
  const map = new Map<string, number>()
  const roleModel = roleByCode(role)
  if (!roleModel) return map

  const walk = (entries: i폴더s) => {
    for (const entry of entries ?? []) {
      if (is구분선(entry)) continue
      if (isFolderItem(entry)) {
        walk(entry.children as i폴더s)
        continue
      }
      if (!(typeof entry === 'string' || typeof entry === 'number' || isRowNode(entry))) continue
      const id = String(rowIdOf(entry))
      if (id && !map.has(id)) map.set(id, map.size)
    }
  }
  walk(menuDirectoryOf(roleModel))
  return map
}

function navGroupFromRole(role: i역할코드): NavGroup {
  const roleModel = roleByCode(role)
  if (!roleModel) return EMPTY_NAV_GROUP
  const used = new Set<string>()
  const navs: NavItem[] = []
  for (const entry of menuDirectoryOf(roleModel)) {
    const item = resolveEntry(entry, used, role)
    if (item) navs.push(item)
  }
  return { navs }
}

function navGroupFromRoles(roles: readonly i역할코드[]): NavGroup {
  if (roles.length === 0) return EMPTY_NAV_GROUP
  if (roles.length === 1) return navGroupFromRole(roles[0]!)

  const used = new Set<string>()
  const navs: NavItem[] = []
  for (const code of roles) {
    const roleModel = roleByCode(code)
    if (!roleModel) continue
    for (const entry of menuDirectoryOf(roleModel)) {
      const item = resolveEntry(entry, used, code)
      if (item) navs.push(item)
    }
  }
  return { navs }
}

export function getNavsByMode(): Record<GnbMode, NavGroup> {
  return {
    guest: navGroupFromRole('guest'),
    associate: navGroupFromRole('associate'),
    admin: navGroupFromRole('admin'),
    manager: navGroupFromRole('manager'),
    learner: navGroupFromRole('learner')
  }
}

/** 모듈 로드 시점 스냅샷. repo가 아직 비어 있을 수 있으니 `getNavsByMode()`를 쓰는 게 맞다. */
export const navsByMode: Record<GnbMode, NavGroup> = getNavsByMode()

export function isNavDivider(item: NavItem): item is NavDivider {
  return is구분선(item)
}

function navLinkVisible(item: NavLink): boolean {
  return toValue(item.show ?? true)
}

/** 숨김 링크 제거 후, 구분선은 인접한 표시 링크 사이에만 유지 */
export function filterVisibleNavs(navs: NavItem[] | null | undefined): NavItem[] {
  if (!Array.isArray(navs) || navs.length === 0) return []
  const out: NavItem[] = []
  let pendingDivider = false
  for (const item of navs) {
    if (isNavDivider(item)) {
      pendingDivider = true
      continue
    }
    if (!navLinkVisible(item)) continue
    const children = Array.isArray(item.children)
      ? item.children.filter(child => navLinkVisible(child))
      : undefined
    const next: NavLink = children !== undefined ? { ...item, children } : item
    if (children && children.length === 0 && !next.path) continue
    if (pendingDivider && out.length > 0) out.push({ is구분선: true })
    pendingDivider = false
    out.push(next)
  }
  return out
}

/** 접근제어·리다이렉트용: 구분선 제외, 폴더 children 포함 leaf path */
export function pathsFromNavItems(navs: NavItem[] | null | undefined): string[] {
  if (!Array.isArray(navs) || navs.length === 0) return []
  const paths: string[] = []
  const walk = (items: NavItem[]) => {
    for (const item of items) {
      if (isNavDivider(item)) continue
      if (item.path?.trim()) paths.push(item.path)
      if (Array.isArray(item.children) && item.children.length > 0) walk(item.children)
    }
  }
  walk(navs)
  return paths
}

/**
 * 경로 비교 표준형 — 끝 슬래시만 지운다. 빈 값은 루트.
 *
 * 아래 넷은 **화면 셋이 같은 판정을 쓰게** 하려고 여기 있다. GNB 알약(바 가운데)·자식 줄(바 밑)·
 * 모바일 시트가 각자 `isRouteActive` 를 들고 있으면 세 벌이 조용히 갈라진다 — 실제로 갈라져
 * 있었고(레이아웃·내비가 같은 함수를 두 벌 들고 있었다), 시트가 셋째 벌이 될 자리였다.
 */
export function normalizeNavPath(path: string): string {
  const p = path.trim()
  if (!p) return '/'
  const cleaned = p.replace(/\/+$/, '')
  return cleaned || '/'
}

/**
 * 라우트 첫 칸 = 서브도메인. 배포는 서브도메인마다 앱이 따로고(`*-admin`·`*-official`),
 * base2 한 벌 안에서 그 갈래를 경로로 둔다. 접두어 없는 경로는 모든 서브도메인에 있는 공용 화면이다.
 */
export const 서브도메인루트s = ['/admin', '/official'] as const

/**
 * 서브도메인 루트는 그 서브도메인의 **홈**이라 `/` 처럼 자기 경로만 잡는다.
 * 자식까지 품으면 운영자 홈 알약이 모든 운영 화면에서 켜지고, 접근제어에선 홈 메뉴 하나가
 * 메뉴 행 없는 `/admin/*` 을 통째로 여는 열쇠가 된다(`access-control.global`).
 */
export function is서브도메인루트(path: string): boolean {
  return (서브도메인루트s as readonly string[]).includes(normalizeNavPath(path))
}

/** `target` 이 지금 경로를 품는가. 자식 경로(`/a/b`)도 `/a` 를 활성으로 만든다 — 루트(`/`·서브도메인)만 빼고. */
export function isNavPathActive(target: string, currentPath: string): boolean {
  const current = normalizeNavPath(currentPath)
  const t = normalizeNavPath(target)
  if (t === '/' || is서브도메인루트(t)) return current === t
  return current === t || current.startsWith(`${t}/`)
}

export function navHasChildren(item: NavLink): item is NavLink & { children: NavLink[] } {
  return Array.isArray(item.children) && item.children.length > 0
}

export function isNavItemActive(item: NavLink, currentPath: string): boolean {
  if (item.path?.trim() && isNavPathActive(item.path, currentPath)) return true
  if (item.활성경로s?.some(path => isNavPathActive(path, currentPath))) return true
  if (!navHasChildren(item)) return false
  return item.children.some(child => isNavItemActive(child, currentPath))
}

/**
 * 갈 곳. 폴더는 `path` 가 없으므로 **첫 잎**으로 보낸다 — 눌러도 아무 일이 없으면 알약이
 * 거짓말을 하고, 이동해야 아랫줄(과 모바일 토글 라벨)이 바뀐다.
 * 잎이 하나도 없으면 `null`(`filterVisibleNavs` 가 빈 폴더는 이미 걸러낸다).
 */
export function firstNavPath(item: NavLink): string | null {
  if (item.path?.trim()) return item.path
  if (!navHasChildren(item)) return null
  for (const child of item.children) {
    const found = firstNavPath(child)
    if (found) return found
  }
  return null
}

/**
 * 지금 경로가 속한 **최상위** 항목. 잎이어도 돌려준다 — 모바일 토글이 「지금 어디」를 이걸로 말한다
 * (`설정` 처럼 자식 없는 섹션에서도 이름이 나와야 한다).
 */
export function activeNavItemOf(
  items: NavItem[] | null | undefined,
  currentPath: string
): NavLink | null {
  if (!Array.isArray(items)) return null
  for (const item of items) {
    if (isNavDivider(item)) continue
    if (isNavItemActive(item, currentPath)) return item
  }
  return null
}

/**
 * 그중 **자식을 가진 것**만 — 바 밑 한 줄을 내는 섹션.
 * 하나만 돌려준다(두 섹션이 같은 경로를 물어도 아랫줄은 하나여야 한다).
 */
export function activeSectionOf(
  items: NavItem[] | null | undefined,
  currentPath: string
): (NavLink & { children: NavLink[] }) | null {
  const item = activeNavItemOf(items, currentPath)
  if (!item || !navHasChildren(item)) return null
  return item
}

export function useNavs(mode: MaybeRefOrGetter<GnbMode | readonly GnbMode[] | null | undefined>) {
  const activeNav = computed<NavGroup>(() => {
    const m = toValue(mode)
    if (!m) return EMPTY_NAV_GROUP
    if (Array.isArray(m)) return navGroupFromRoles(m)
    if (typeof m !== 'string') return EMPTY_NAV_GROUP
    return navGroupFromRoles([m])
  })
  const visibleNavs = computed(() => filterVisibleNavs(activeNav.value.navs))
  return {
    activeNav,
    visibleNavs,
    navsByMode
  }
}

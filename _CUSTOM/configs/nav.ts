type AppNavItem = {
  label?: string
  description?: string
  to?: string
  icon?: string
  active?: boolean
  branchActive?: boolean
  roles?: string[]
  children?: AppNavItem[]
}

const navs: AppNavItem[] = []

export default navs

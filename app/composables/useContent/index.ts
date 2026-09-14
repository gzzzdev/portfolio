import { queryCollection, queryCollectionNavigation, queryCollectionSearchSections, queryCollectionItemSurroundings, computed, type Ref, useAsyncData, ref } from '#imports'

import { findPageBreadcrumb, findPageHeadline, findPageChildren } from '@nuxt/content/utils'

const is경로 = !true
const getAllItems = (nav: iNav): iNav[] => {
  let children: iNav[] = []
  if (nav.children) {
    children = nav.children.map(x => getAllItems(x)).flat()
  }
  return [nav, ...children]
}

interface iNav { title: string, path: string, stem: string, children?: iNav[], page?: boolean }
export const recursiveForEach = (item: iNav, callback: (node: iNav) => void) => {
  // 1. 현재 노드에 대해 콜백 함수 실행
  callback(item)

  // 2. 'children' 속성이 있고, 배열이며, 비어있지 않다면
  if (item.children && Array.isArray(item.children) && item.children.length > 0) {
    // 3. 모든 자식 노드를 순회하며 재귀 호출
    for (const child of item.children) {
      recursiveForEach(child, callback)
    }
  }
}
export const THENAME = 'docs'
type keyofCollections = string
export const useContentPage = (path: string, collection: keyofCollections = THENAME) => {
  return useAsyncData(`${collection}-${path}-page`, () => {
    if (is경로)
      path = `/${collection}` + path

    return queryCollection(collection).path(path).first()
  })
}

export const useContentSurround = (path: string, collection: keyofCollections = THENAME) => {
  return useAsyncData(`${collection}-${path}-surround`, async () => {
    if (is경로)
      path = `/${collection}` + path
    let result = await queryCollectionItemSurroundings(collection, path, {
    }).order('order', 'ASC')
    result = result.filter(x => x !== null).map((x) => {
      x.path = x.path?.replace(`/${collection}`, '')
      x.stem = x.stem?.replace(`/${collection}`, '')
      return x
    })
    return result as any
  })
}

export const useContentCollection = (collection: keyofCollections = THENAME) => {
  return useAsyncData(`${collection}-search-sections2`, async () => {
    let result = await queryCollectionSearchSections(collection)
    if (is경로) {
      result = result.map((x) => {
        x.id = x.id.replace(`/${collection}`, '')
        return x
      })
    }

    return result
  })
}

export const useContentBreadcrumb = (navigation: Ref<any[] | null | undefined>, path: string, has제목: boolean = false, collection: keyofCollections = THENAME) => {
  return computed(() => {
    const nav = navigation.value
    const currentPath = path// typeof path === 'string' ? path : path.value;

    if (!nav || !Array.isArray(nav) || nav.length === 0) {
      return []
    }

    const breadcrumb = findPageBreadcrumb(nav, currentPath, { current: has제목, indexAsChild: true })
    // console.log(breadcrumb);

    // breadcrumb 배열 생성
    const breadcrumbItems = breadcrumb.map((item: any) => ({
      label: item.title || item.path,
      to: item.path == '' ? '/' : item.path, // 경우에 따라서..
      disabled: !true// item.disabled,
    }))

    if (is경로) {
      breadcrumbItems.forEach((item) => {
        item.to = item.to.replace(`/${collection}`, '')
      })
      const idx = breadcrumbItems.findIndex(x => x.label.toLowerCase() === collection.toLowerCase())
      if (idx !== undefined && idx !== -1) {
        breadcrumbItems.splice(idx, 1)
      }
    }
    breadcrumbItems.unshift({
      label: '전체',
      to: '/',
      disabled: false
    })

    return breadcrumbItems
  })
}

export const useContentNavigation = (collection: keyofCollections = THENAME) => {
  return useAsyncData(`${collection}-navigation2`, async () => {
    interface iNav {
      path: string
      icon?: string
      children?: iNav[]
    }

    const result1 = await queryCollectionNavigation(collection, ['icon', 'order', 'star']).order('order', 'ASC')// .order('title', 'ASC');

    if (result1 && result1[0]) {
      const rootNav = result1[0] as any

      recursiveForEach(rootNav, (node) => {
        if (!false) {
          const idx = node.children?.findIndex(x => x.stem.endsWith('/index') && x.path === node.path && x.stem === node.stem)
          if (idx !== undefined && idx !== -1) {
            node.children?.splice(idx, 1)
          }
        }

        if (node.children?.length == 0) {
          node.children = []
          node.page = false
        }

        if (is경로) {
          node.path = node.path.replace(`/${collection}`, '')
          node.stem = node.stem.replace(`${collection}/`, '')
        }
      })
    }
    // console.log(result1);

    // if (false)
    //     recursiveForEach(result1[0], async (node) => {
    //         const found = await queryCollection(THENAME).path(node.path).first();
    //     });
    // //console.log(result1);
    // return result1;
    // navigatoin에서 검색기능 사용하기 위해서는 이렇게 해야함.

    const root = result1?.[0]

    const root_children = root.children

    root_children[0].path = root_children[0].path == '' ? '/' : root_children[0].path
    return root_children// 이렇게 하면 다른 검색기능 문제가됨.
  })
}

export const useContentNavigation_star = (collection: keyofCollections = THENAME) => {
  return useAsyncData('navigation_star', async () => {
    let result = await queryCollection(collection).select('path', 'title', 'description').where('star', '=', true).order('order', 'ASC').all()

    if (is경로) {
      result = result.map((x) => {
        x.path = x.path.replace(`/${collection}`, '')
        if (x.path == '')
          x.path = '/'
        return x
      })
    }
    return result
  })
}

export const useContentChildren = (navigation: Ref<any[] | null | undefined>, path: string) => {
  return useAsyncData(`page_children-${path}`, async () => {
    const nav = navigation.value

    if (path == '/')
      return nav

    if (!nav || !Array.isArray(nav) || nav.length === 0) {
      return []
    }
    const result = findPageChildren(nav, path)

    return result
  })
}

// ------------------------------------------------------------ //

export const useContent_withTag2 = (collection: keyofCollections = THENAME) => {
  return useAsyncData(`${collection}-withTag2`, async () => {
    interface iNav {
      path: string
      icon?: string
      children?: iNav[]
    }

    const result1 = await queryCollection(collection).order('order', 'ASC')

    if (result1 && result1[0]) {
      const rootNav = result1[0] as any

      recursiveForEach(rootNav, (node) => {
        if (!false) {
          const idx = node.children?.findIndex(x => x.stem.endsWith('/index') && x.path === node.path && x.stem === node.stem)
          if (idx !== undefined && idx !== -1) {
            node.children?.splice(idx, 1)
          }
        }

        if (node.children?.length == 0) {
          node.children = []
          node.page = false
        }

        if (is경로) {
          node.path = node.path.replace(`/${collection}`, '')
          node.stem = node.stem.replace(`${collection}/`, '')
        }
      })
    }
    // console.log(result1);

    // if (false)
    //     recursiveForEach(result1[0], async (node) => {
    //         const found = await queryCollection(THENAME).path(node.path).first();
    //     });
    // //console.log(result1);
    // return result1;
    // navigatoin에서 검색기능 사용하기 위해서는 이렇게 해야함.

    const root = result1?.[0]

    const root_children = root.children

    root_children[0].path = root_children[0].path == '' ? '/' : root_children[0].path
    return root_children// 이렇게 하면 다른 검색기능 문제가됨.
  })
}

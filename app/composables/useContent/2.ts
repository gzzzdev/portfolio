import { THENAME, recursiveForEach } from './index'
import { queryCollection, queryCollectionNavigation, useAsyncData } from '#imports'

type iHTML태그 = string | 'div' | 'span' | 'p' | 'ul' | 'ol' | 'li' | 'a' | 'img' | 'br' | 'hr' | 'table' | 'tbody' | 'thead' | 'tfoot' | 'tr' | 'td' | 'th'
type i줄 = [iHTML태그, any, ...i줄[]]
interface i문서 {
  경로: string
  제목?: string
  줄s: i줄[]
}

const recursiveForEach2 = (_줄: i줄, callback: (줄: i줄) => void) => {
  const [태그, 속성, ...자식s] = _줄
  callback(_줄)
  for (const 자식 of 자식s) {
    recursiveForEach2(자식, callback)
  }
}

export const useContent_withTodo = (collection: string = THENAME) => {
  return useAsyncData(`${collection}-withTodo`, async () => {
    let 문서s: i문서[] = []
    // 모든 파일 가져오기
    let data = await (queryCollection(collection) as any).all()

    data = data.filter((x: any) => x.body.value.length > 0)
    data.forEach((x: any) => {
      문서s.push({
        경로: x.path,
        줄s: x.body.value as i줄[]
      })
    })

    문서s = 문서s.map((_문서) => {
      const { 경로, 줄s } = _문서
      const 줄s2 = 줄s.filter(([태그]) => 태그 === 't-todo' || 태그 === 'tt')

      return ({ ..._문서, 줄s: 줄s2 })
    })
    문서s = 문서s.filter((x: i문서) => x.줄s.length > 0)

    문서s = await 문서with제목(문서s, collection)

    return 문서s
  })
}

async function 문서with제목(문서s: i문서[], collection: string = THENAME) {
  const navigation = await queryCollectionNavigation(collection, ['icon', 'order', 'star']).order('order', 'ASC')
  const get제목By경로 = (경로: string) => {
    let found
    recursiveForEach(navigation[0], (y: any) => {
      if (y.path === 경로) {
        found = y.title
      }
    })
    return found
  }
  문서s = 문서s.map(_문서 => ({ ..._문서, 제목: get제목By경로(_문서.경로) }))
  return 문서s
}

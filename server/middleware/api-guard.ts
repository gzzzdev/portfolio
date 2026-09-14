import { do역할codes, do역할s, do로그인회원 } from '../utils/auth-인가'
import { 본인열ByTable } from '~models/test2/_basics/공개필드s'

/**
 * `/api/v0|v1/{table}` CRUD의 인가.
 *
 * 화면 진입은 `메뉴.접근역할codes`가 막지만(access-control 미들웨어), API는 그것과 다른 질문이다 —
 * guest도 GNB를 그리려면 `roles`/`menus`/`boards`를 **읽어야** 하지만 `/admin/roles` 화면은 못 본다.
 * 그 답을 들고 있는 게 `역할.권한s`(`{테이블}:{액션}`)이고, 여기서 그걸 실제로 쓴다.
 *
 * 기본은 `warn` — 거부했을 상황을 로그만 남기고 통과시킨다. 권한 데이터가 실제 호출을
 * 전부 덮는지 확인하기 전에 막으면 화면이 조용히 깨지기 때문. 확인 후 `enforce`로 올릴 것.
 */

type i가드모드 = 'off' | 'warn' | 'enforce'

/**
 * 테이블 CRUD가 아닌 하위 라우트. 여기서 다루지 않는다(파일 업로드는 자체 인가가 필요).
 * `grade`(채점)도 같다 — 테이블이 아니라 계산이라 `{테이블}:{액션}`으로 물을 게 없고,
 * 로그인·소유자 확인을 그 라우트가 직접 한다.
 *
 * 여기 `_counts`(표별 행 수)가 있었다. 여러 표를 한 번에 묻는 RPC 라 `{테이블}:{액션}`이
 * 하나로 안 나왔고, 그래서 관리자 확인을 그 라우트가 **직접** 지고 있었다. 지금은 `"table-counts"`
 * 뷰라서 평범한 표 하나고, 인가도 평범하게 `table-counts:read` 다 — 예외가 하나 줄었다.
 *
 * 그 이름은 등록부에 **행이 없다**(`표버전` 판정을 타면 안 되므로). 그래서 권한 어휘 쪽에
 * 따로 실어 준다 — `model테이블s.뷰이름s`. `enforce` 로 올리기 전에 역할에 넣을 것.
 */
const 비테이블경로s = new Set(['files', 'grade'])

const 액션by메서드: Record<string, string> = {
  GET: 'read',
  POST: 'create',
  PUT: 'update',
  PATCH: 'update',
  DELETE: 'delete'
}

export default defineEventHandler(async (event) => {
  const mode = (useRuntimeConfig(event).apiGuard ?? 'warn') as i가드모드
  if (mode === 'off') return

  const path = event.path.split('?')[0] ?? ''
  const m = /^\/api\/v[01]\/([^/]+)/.exec(path)
  if (!m) return

  const table = decodeURIComponent(m[1]!)
  if (비테이블경로s.has(table)) return

  const action = 액션by메서드[event.method.toUpperCase()]
  if (!action) return

  /**
   * 신원과 권한 어휘를 **동시에** 당긴다 — 서로를 안 보므로 직렬로 걸 이유가 없다.
   * 이 미들웨어는 모든 `/api/*` 요청에서 도는 자리다.
   */
  const [codes, 역할s] = await Promise.all([do역할codes(event), do역할s(event)])
  const has = (key: string) =>
    역할s.some(row => codes.includes(String(row.code)) && (row.permissions ?? []).includes(key))

  const 권한key = `${table}:${action}`
  if (has(권한key)) return

  /**
   * 전체 읽기는 없지만 `readPublic`이 있으면 **거부 대신 축소**한다.
   * 조인이 클라이언트에서 일어나기 때문 — 공개 게시판은 작성자 이름 한 줄 때문에 회원 테이블을 읽는다.
   * 여기서 403을 내면 게시판이 통째로 깨지고, 그렇다고 전체를 주면 명부가 유출된다.
   * 어댑터(`db_low.Reads`)가 이 플래그를 보고 `공개필드s`만 남긴다.
   */
  if (action === 'read' && has(`${table}:readPublic`)) {
    event.context.투영 = '공개'
    /**
     * 세션이 있는데 guest 인 사람 = 비회원(익명 로그인). 자기 행은 깎지 않도록 회원 id 를 실어 둔다.
     * 본인 열이 없는 표면 묻지 않는다 — 이 조회는 계정 표 왕복 하나라 모든 공개 읽기에 붙일 값이 아니다.
     */
    if (본인열ByTable[table]) event.context.투영본인 = (await do로그인회원(event))?.memberId ?? null
    return
  }

  if (mode === 'warn') {
    console.warn(`[api-guard] WOULD DENY  roles=[${codes.join(',')}]  ${event.method} ${path}  → 필요: ${권한key}`)
    return
  }

  throw createError({ statusCode: 403, statusMessage: `권한 없음 (${권한key})` })
})

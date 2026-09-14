import { do신청세트초기데이터, model게시판s, model등급s, model등급요건s, model메뉴s, model사용자s, model역할s, model회원s, model회원게시글s, model회원댓글s, model자료s } from '~models/test2'
import { model표개수s, model테이블s } from '~models/(system)'

type 초기데이터옵션 = {
  skipConfirm?: boolean
  ensureRead?: boolean
}

/**
 * **핵심 표가 채워진 걸 한 번이라도 봤나.** `do빈표확인` 의 빗장이다.
 *
 * ## 왜 캐시가 필요한가
 *
 * 그 판정은 개수 판(`"table-counts"` 뷰)을 읽는데, 그 뷰는 등록된 표 서른몇 개를 `count(*)`
 * 로 그 자리에서 센다. 그리고 등록부에 행이 없어(= 늘 최신이어야 해서) `표버전` 의
 * "안 바뀌었으면 안 받는다"를 **일부러** 안 탄다. 그래서 캐시를 여기서 진다.
 *
 * 부르는 자리는 `access-control` 미들웨어의 **관리자 SSR 진입 전부**다. 실측(2026-09-09,
 * 전체 239행)으로는 41ms 라 지금은 안 아프다 — 그런데 그때 세는 표에
 * `members`·`member-posts`·`member-comments` 가 들어 있다. **자라는 쪽이다.**
 *
 * ## 왜 이게 캐시해도 되는 값인가
 *
 * 이 질문의 답은 앱 일생에 **한 번** 뒤집힌다(빔 → 채워짐, 초기데이터를 넣는 순간).
 * 그래서 빗장은 **한 방향으로만** 잠근다 — 「채워짐」을 본 뒤로 안 묻고, 「비었음」과 실패는
 * 절대 기억하지 않는다. 설치 중에는 매번 다시 묻고, 다 채운 뒤에야 조용해진다.
 *
 * 되돌아가는 경우(DB 를 통째로 비움)에는 서버가 다시 뜰 때까지 유도가 안 뜬다. 그건 이미
 * 이 축이 받아들인 실패 방향이다 — 미들웨어는 조회가 터져도 `false`(유도 안 함)로 떨어지고,
 * `/admin/setup` 은 주소로 그냥 들어갈 수 있다. **틀린 유도보다 없는 유도가 덜 해롭다.**
 *
 * ## 왜 모듈 스코프인가
 *
 * SSR 에서 `표버전` 은 통째로 쉰다 — 서버 repo 가 요청 스코프라 매 요청이 빈 목록에서
 * 시작하기 때문이다(`BaseModels2.version` 머리말). 그러니 요청 안에 두면 아무것도 안 아낀다.
 * 요청끼리 공유해도 되는 건 이 값이 **DB 에 대한 사실**이지 사용자에 대한 값이 아니라서다 —
 * 여기 사용자별 값을 얹으면 그 순간 요청 간 유출이 된다.
 */
let is채워진걸본적있다 = false

export const useSystem = () => {
  /**
   * 표 등록부. **아래 `repos` 에 넣지 않는다.**
   *
   * 그 배열은 두 가지를 겸한다 — `시드PK` 로 FK 를 잇느라 *전부 비어 있을 때 한 번에* 돌아야 하는
   * 세트이고, 동시에 `do빈표확인`(하나라도 비면 관리자를 `/admin/setup` 으로) 의 대상이다.
   * 등록부를 거기 넣었더니 **빈 등록부 하나 때문에 모든 진입이 `/admin/setup` 으로 밀렸고**,
   * 정작 `/admin/setup` 은 "이미 채워진 표가 있습니다" 로 거절해서 빠져나갈 길이 없었다.
   *
   * 등록부는 행끼리 서로를 안 가리키므로 그 세트에 낄 이유가 없다. 아래에서 따로, 먼저 채운다.
   */
  const 테이블repo = model테이블s.getInstance()
  /** 개수 판. 등록부와 같은 열에 `count` 하나가 더 붙은 뷰다 — `do빈표확인` 이 이걸 읽는다. */
  const 개수repo = model표개수s.getInstance()
  const 역할repo = model역할s.getInstance()
  const 메뉴repo = model메뉴s.getInstance()
  const 게시판repo = model게시판s.getInstance()
  const 등급repo = model등급s.getInstance()
  const 등급요건repo = model등급요건s.getInstance()
  const 회원repo = model회원s.getInstance()
  const 사용자repo = model사용자s.getInstance()
  const 게시글repo = model회원게시글s.getInstance()
  const 댓글repo = model회원댓글s.getInstance()

  /**
   * **순서가 곧 의존이다.** 아래 `do초기데이터`가 이 배열을 그대로 훑으므로, FK로 가리키는 쪽이 뒤에 온다 —
   * 게시글은 게시판(`boardId`)과 회원(`memberId`)이 먼저 있어야 하고, 댓글은 게시글이 먼저 있어야 한다.
   *
   * **게시판 → 메뉴 → 역할** 순인 이유:
   * 메뉴의 `target.boardId`가 게시판을 가리키고, 역할의 `menuDirectory`가 메뉴를 가리킨다.
   * 예전엔 `역할 → 메뉴 → 게시판` 이었는데, 그때는 시드에 PK가 박혀 있어 의존이 안 보였다 —
   * 그 PK가 서버 배정과 어긋나자 GNB가 통째로 비었다(`menuDirectory`가 jsonb라 DB도 못 잡는다).
   * 지금은 앞 표를 만들며 남긴 `시드PK` 등록부에서 꺼내 쓰므로, 순서가 틀리면 그 자리에서 경고가 뜬다.
   *
   * 메뉴가 역할보다 앞이어도 되는 건 메뉴가 역할을 **code로** 가리키기 때문이다
   * (`accessRoleCodes`). 그건 PK가 아니라 앱 데이터라 순서를 안 탄다.
   *
   * 계정(`users`)이 회원 뒤인 이유도 같다 — `회원code`로 회원을 가리키므로 회원의 PK가 먼저 있어야 한다.
   * 계정은 신원(`auth.users`)과 도메인 회원을 잇는 표라, 이 표가 비면 아무도 로그인할 수 없다.
   */
  const repos = [게시판repo, 메뉴repo, 역할repo, 등급repo, 등급요건repo, 회원repo, 사용자repo, 게시글repo, 댓글repo] as const

  type iRepo = (typeof repos)[number]

  const doReads = async (list: readonly iRepo[]) => {
    await Promise.all(list.map(repo => toValue(repo.is읽기완료) ? Promise.resolve(true) : repo.reads()))
  }

  const reads = async () => doReads(repos)

  /**
   * 접근제어에 필요한 최소 세트. 비로그인 세션에서도 읽어야 한다 —
   * 메뉴가 비어 있으면 보호할 경로 자체가 없어져 전부 통과하기 때문.
   * (게시판 메뉴의 경로는 게시판 슬러그에서 파생되므로 게시판도 함께 읽는다.)
   */
  const reads네비 = async () => doReads([역할repo, 메뉴repo, 게시판repo])

  /**
   * 이미 읽어 둔 목록으로 판정한다 — **`reads()` 를 먼저 부른 곳에서만** 쓸 것(`/admin/setup` 화면).
   * 읽기 전에는 `is읽기완료` 가 false 라 언제나 `false` 다.
   * 아직 안 읽었을 수도 있는 자리(미들웨어)는 `do빈표확인()` 을 쓴다.
   */
  const is초기데이터 = computed(() => repos.some(repo => repo.is초기데이터))

  /**
   * 같은 질문을 **행을 안 받고** 묻는다. 최초 진입의 전역 미들웨어가 이걸 쓴다.
   *
   * 예전엔 이 판정 하나 때문에 미들웨어가 `reads()` 로 표 여덟 개를 통째로 읽었다. 그 값을
   * 실제로 보는 건 `admin` + SSR + `/admin/setup` 밖일 때뿐인데, 대가는 **모든 최초 진입**이 치렀다 —
   * 왕복 여덟 번에, 받은 목록이 SSR payload 로 HTML 에까지 실렸다(`member-posts` 24K,
   * `resources` 36K, `design-templates` 40K). 지금은 개수 판(`"table-counts"` 뷰) 한 번이다.
   *
   * **그 사이에 `_counts` 라는 전용 라우트가 있었다.** 여러 표를 인자로 받는 RPC 였고, 그래서
   * 인자 상한(20)·배치 실패·`api-guard` 예외를 부르는 쪽이 지고 있었다. 지금은 평범한 표
   * 하나라 그 셋이 다 없다(`model표개수s`, `CLAUDE.md` 의 뷰 규약).
   *
   * 개수와 `is초기데이터`(= `list.length === 0`)가 같은 답을 주는 근거는 **소프트삭제가 없다**는
   * 것이다(`isDeleted` 를 쓰기로 세팅하는 코드가 리포에 없다). 소프트삭제를 들이면 여기가 갈린다.
   *
   * **답을 못 받은 표를 `0`으로 읽지 않는다.** 이 함수에서 `0`은 "비었다"이고, 그 답 하나가
   * 관리자를 `/admin/setup`(누르면 "DB가 날라갑니다" 버튼이 있는 화면)으로 보낸다. 그런데 판정이
   * 필요한 유일한 상황이 바로 `0`이라, **못 읽은 것과 진짜 빈 것이 같은 값으로 도착하면**
   * 이 판정은 정확히 쓸모 있어야 할 자리에서 믿을 수 없게 된다. 그래서 숫자가 아니면 던진다.
   *
   * 못 물어보면(비관리자·네트워크·표 없음) 던지는 것도 같은 이유다. 부르는 쪽(미들웨어)이
   * 잡아서 **유도를 안 하는 쪽**으로 떨어진다 — 틀린 유도보다 없는 유도가 덜 해롭다.
   * (예전 `is초기데이터`는 `reads()` 가 터져도 `is읽기완료`가 `finally`에서 켜져서, 목록이
   * 비어 보이면 그대로 "초기데이터 필요"라고 답했다. 그쪽이 이 구분을 안 했던 자리다.)
   */
  const do빈표확인 = async (): Promise<boolean> => {
    if (is채워진걸본적있다) return false

    await 개수repo.reads()
    const 빈표있음 = repos.some((repo) => {
      const 개수 = 개수repo.개수of(repo.tableName)
      if (개수 == null)
        throw new Error(`개수 판에 ${repo.tableName} 이(가) 없습니다`)
      return 개수 === 0
    })

    if (!빈표있음) is채워진걸본적있다 = true
    return 빈표있음
  }

  /**
   * **전부 비어 있을 때 한 번에** 돌리는 게 전제다.
   *
   * 시드가 남의 행을 가리킬 땐 `code`로 적고, 앞 표를 만들며 `시드PK` 등록부에 남긴 짝을
   * 뒤 표가 꺼내 쓴다(`BaseModels2.시드PK`). 그 등록부는 **이 실행 안에서만** 산다 —
   * DB엔 표식이 없다. 그래서 앞 표가 이전 실행에서 이미 채워졌으면 뒤 표만 따로 못 채운다.
   *
   * 절반만 찬 상태로 들어오면 뒤 표의 `seed해소`가 던지는데, 그때는 이미 몇 표가 들어간 뒤다.
   * 그러느니 **들어가기 전에** 어느 표를 비워야 하는지 알려준다.
   */
  const do초기데이터 = async (opts?: 초기데이터옵션) => {
    const skipConfirm = opts?.skipConfirm ?? false
    const ensureRead = opts?.ensureRead ?? true

    /**
     * 빗장을 연다. 이 함수가 도는 건 표가 채워지거나(빔 → 참) 관리자가 비우고 다시 돌리는
     * (참 → 빔) 순간이고, 그 둘 다 `do빈표확인` 의 답이 바뀌는 자리다. 여기서 안 열면 다음
     * 진입이 낡은 「채워짐」을 그대로 믿는다 — 빗장이 스스로 틀릴 수 있는 유일한 자리다.
     */
    is채워진걸본적있다 = false

    if (ensureRead) await reads()

    /**
     * 등록부부터. FK 사슬 밖이라 아래 "전부 비어 있어야" 규칙을 안 타고, 없는 이름만 채운다.
     * 아래 검사에 걸려 되돌아가더라도 이건 이미 채워져 있는 게 맞다 — 권한 어휘와 캐시 판정이
     * 여기서 나온다.
     */
    try {
      await 테이블repo.do누락채우기()
    } catch (error) {
      useAlert().show('표 등록부 채우기 실패', (error as Error)?.message ?? String(error))
    }

    const 빈것 = repos.filter(repo => repo.is초기데이터)
    const 찬것 = repos.filter(repo => !repo.is초기데이터)
    if (빈것.length && 찬것.length) {
      useAlert().show(
        '초기데이터를 돌릴 수 없습니다',
        `이미 채워진 표가 있습니다 — ${찬것.map(r => r.tableName).join(', ')}.`
        + ` 시드는 전부 비어 있을 때 한 번에 돌려야 FK가 이어집니다.`
        + ` 위 표들을 비운 뒤 다시 시도하세요.`
      )
      return
    }

    for (const repo of repos) {
      if (!repo.is초기데이터) continue
      try {
        await repo.do초기데이터({ skipConfirm, ensureRead: false })
      } catch (error) {
        // 던진 쪽(`seed해소`)이 원인과 처방을 담아 보낸다 — 콘솔로만 새면 아무도 못 본다.
        useAlert().show(`초기데이터 중단 (${repo.tableName})`, (error as Error)?.message ?? String(error))
        throw error
      }
    }

    /**
     * 콘텐츠(설문·퀴즈·투표·수업·행사)와 그 신청받기·문항세트·문항.
     *
     * **위 `repos`에 끼울 수 없다.** 그 배열은 `is초기데이터`·`do빈표확인`을 겸하고, 그 값이
     * 미들웨어에서 `/admin/setup`으로 밀어내는 조건이다 — 설문 한 표가 비었다고 관리자를 초기설정
     * 화면에 가둘 일은 아니다.
     * 게다가 신청받기·문항세트·문항은 선언형 seed가 못 된다(`ownerId`·`questionnaireId`가 FK인데
     * 서버가 id를 다시 매긴다). 그래서 repo 루프가 아니라 `enrolls/seed.ts`의 생성기로 간다.
     *
     * 단계마다 "목록이 비어 있을 때만" 돌고 신청받기가 이미 있는 콘텐츠는 건너뛰므로,
     * 콘텐츠가 절반쯤 차 있어도 남은 자리만 채운다.
     */
    try {
      await do신청세트초기데이터({ skipConfirm })
    } catch (error) {
      useAlert().show('초기데이터 중단 (신청 세트)', (error as Error)?.message ?? String(error))
      throw error
    }

    /**
     * 자료(원본 문서). **위 `repos` 에 안 끼우는 이유는 콘텐츠와 같다** — 자료 한 표가 비었다고 관리자를
     * 초기설정 화면에 가둘 일이 아니다. 남을 가리키는 FK 가 없어 어느 자리에 서도 되고, 비었을 때만 채운다.
     */
    const 자료repo = model자료s.getInstance()
    try {
      await 자료repo.reads()
      if (자료repo.is초기데이터) await 자료repo.do초기데이터({ skipConfirm, ensureRead: false })
    } catch (error) {
      useAlert().show('초기데이터 중단 (자료)', (error as Error)?.message ?? String(error))
      throw error
    }
  }

  return {
    reads,
    reads네비,
    is초기데이터,
    do빈표확인,
    do초기데이터
  }
}

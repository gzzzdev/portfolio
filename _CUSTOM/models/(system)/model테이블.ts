import { reactive, toValue } from 'vue';
import { BaseModels2, BaseModel2, getRepoInstance, 타입지정, 표버전 } from '~utils/models';
import type { BaseXX, BaseXXDto } from '~utils/models';

/**
 * **표 등록부.** 행 하나가 표 하나다.
 *
 * 지금 담는 건 변경 번호 하나뿐이지만, 여기가 자랄 자리인 건 이 목록을 **관리자 화면이**
 * 필요로 하기 때문이다 — `model역할.iDB테이블s` 가 표 이름을 손으로 나열해 「테이블 권한」
 * 선택지를 만들고 있고, 그 목록은 이미 실제 모델과 어긋나 있다.
 *
 * ## 번호는 왜 개수가 아닌가
 *
 * 개수는 *추가·삭제로 원래 수로 돌아온* 상태를 구분하지 못한다. 번호는 쓰기마다 오르므로
 * "1개 남은 상태"와 "추가·삭제·추가로 1개 남은 상태"가 갈린다.
 *
 * ## 이 표 자신은 번호를 안 단다
 *
 * 캐시 판정의 뿌리라 늘 새로 읽어야 하고, 자기 번호를 자기가 들고 있으면 물어볼 상대가
 * 자기 자신이 된다. `BaseModels2.reads` 와 `db_low.do등록부손질` 양쪽이 이 표를 건너뛴다.
 * (`menus` 에 번호를 두면 안 됐던 것과 같은 이유 — 거긴 남의 쓰기마다 자기가 무효화된다.)
 *
 * ## 실 DB 표다
 *
 * `apiURL` 을 덮지 않는다 — 전역 스위치(`NUXT_PUBLIC_API_URL`)를 그대로 따라 v1(supabase)로 간다.
 * 표와 트리거는 `_CUSTOM/sql/tables.sql` 로 만든다. 그게 아직 안 돌았으면 조회가 실패하고,
 * `표버전.훑기` 가 그걸 "모름"으로 받아 **지금까지와 똑같이** 매번 목록을 받는다.
 */
export interface i테이블dto extends BaseXXDto {
  /** `BaseModels2.tableName` 과 같은 값. 이 표의 실질 키다. */
  name: string;
  /**
   * 쓰기마다 1 오르는 번호. **기계가 쓴다** — 그래서 `etcFields` 에 넣어 클라가 되돌려
   * 보내지 못하게 막는다. 사람이 이 행의 다른 칸을 고쳐 저장할 때 낡은 번호가 딸려 나가면
   * 모든 클라이언트의 캐시 판정이 조용히 틀리기 때문이다(`toApiPayload` 는 모르는 열도 실어 보낸다).
   * DB 쪽에도 같은 방어가 있다(`keep_table_version`) — 앱을 안 거치는 경로가 진짜 위험이라서다.
   */
  version: number;
  /**
   * 행을 세는 말('개'·'명'·'건'·'개 심사'). **표의 성질이지 화면 설정이 아니다** —
   * 회원은 어느 화면에서 세든 '명'이다. 그래서 `menus.target.dbTable` 에서 이리로 왔다.
   *
   * **이름이 `unit` 인 이유**: `toApiPayload` 는 한글 키를 *모듈이 붙인 값*으로 보고 서버 페이로드에서
   * 떨어뜨린다. 처음엔 `세는단위` 로 뒀는데 그러면 시드도 편집도 서버에 **영영 안 닿는다**.
   * `menus` 에서 같은 이름이 되던 건 그게 `target` jsonb *안* 이라 최상위 키가 `target` 이어서다.
   * 사람이 읽는 이름은 게터(`세는단위`)가 진다 — 다른 모델과 같은 관례다.
   */
  unit: string;
  /** 행이 부모-자식을 갖는가. 데이터 모양이라 역시 표 쪽이다(메뉴·태그가 `true`). */
  isHierarchy: boolean;
}

/**
 * 이 표의 행을 **누가 만드나.** 요약 화면의 분류가 여기서 나온다.
 *
 * - `'유입'` : 바깥이 만든다. 회원·신청·글·댓글·결제·이력. **혼자 자라는 쪽이다.**
 * - `'운영'` : 운영자가 열고 닫는다. 신청받기·행사·수업·설문·자료. 기간이나 상태가 있다.
 * - `'설정'` : 한 번 세우고 나머지가 참조한다. 메뉴·역할·등급·게시판·등록부.
 * - `'시험'` : v2 시험 축. 세긴 세지만 **관리 요약에는 안 선다**(`i누가options.is요약`).
 *
 * ## 왜 화면이 아니라 여기인가
 *
 * 요약 화면은 전에 **역할의 `메뉴순서`**로 묶었다. 그건 GNB 의 축이라 "어디를 누르나"에는
 * 답해도 "무엇이 자라나"에는 답하지 못한다 — 실측으로 묶음 여섯 중 셋이 칸 하나였고,
 * 그중 제일 큰 숫자가 `menus`(화면 자신을 그리는 표)였다. 그리고 메뉴가 없는 표
 * (`member-posts`·`member-comments`·`answers`·이력들)는 **아예 세지도 않았다.**
 *
 * ## 왜 DB 열이 아닌가
 *
 * `store` 와 같다 — 이건 표의 성질이지 운영자가 화면에서 고칠 값이 아니다. 시드에 두면
 * **새 표를 등록하는 순간 타입이 답을 요구한다**(`i테이블시드`). 주석으로 "새 표는 분류도
 * 적을 것"이라 적어두는 것과 달리, 안 적으면 빌드가 선다.
 */
export type i누가 = '유입' | '운영' | '설정' | '시험';

/**
 * **`value` 와 `label` 이 같다.** 값이 `'바깥'` 인데 화면엔 「들어오는 것」이라 뜨면 그 사이가
 * 번역표가 되고, 둘 중 하나만 고쳐지는 날이 온다. 한글 값이라 그럴 이유도 없다.
 *
 * `is요약` 이 **요약 화면에 묶음이 서는가**를 가른다.
 *
 * `'시험'` 은 값이 없어서가 아니라 **자리가 아니라서** 빠진다 — v2 시험 축의 표들이다
 * (화면이 `(test)/v2/*`·`(test)/p/*` 에 있다). 「아직 아무도 안 정했음」(=시드에 없음)과 **다른 상태**라
 * 여기 값으로 둔다. 대시보드에서 목록으로 빼면 그게 다시 손목록이 되고, 그 목록은 반드시
 * 등록부와 갈라진다 — 전 판의 `XXss` 가 그랬다.
 */
export const i누가options = [
  { label: '유입', value: '유입', 설명: '바깥이 만든다 — 사람이 늘면 는다', is요약: true },
  { label: '운영', value: '운영', 설명: '운영자가 열고 닫는다 — 기간이 있다', is요약: true },
  { label: '설정', value: '설정', 설명: '한 번 정하고 나머지가 참조한다', is요약: true },
  { label: '시험', value: '시험', 설명: 'v2 시험 표 — 관리 요약이 세지 않는다', is요약: false },
] as const;

/**
 * 표가 **어디 사는가**. 시드 행마다 박아 둔다 — 등록부는 자기 저장소에 사는 표만 담아야 한다.
 *
 * - `'스위치'` : 전역 스위치(`NUXT_PUBLIC_API_URL`)를 따라간다. 대부분의 표.
 * - `'v0'`    : 스위치와 무관하게 **lowDB 에 못박힌** 표. v2 시험 축이 그렇다
 *               (`model과일`·`model동물`… 이 생성자에서 `apiURL` 을 `/api/v0` 로 덮는다).
 *
 * 왜 필요한가: 스위치가 v1 일 때 등록부는 supabase 에 사는데, v0 고정 표의 **데이터는 lowDB 에**
 * 있다. 그 표를 supabase 등록부에 넣으면 lowDB 쪽 쓰기가 이 번호를 못 올려 **영영 0** 이 되고,
 * 클라는 "안 바뀌었다"고 믿어 목록을 다시 안 받는다 — 화면이 조용히 굳는다.
 */
export type i사는곳 = '스위치' | 'v0';

/**
 * `unit` 열의 **DB 기본값**(`_CUSTOM/sql/tables.sql`). 트리거가 만든 맨 행이 이 값을 갖는다.
 * 여기와 SQL 이 갈리면 `do누락채우기` 가 메울 행을 못 알아본다.
 */
const 기본세는단위 = '개';

/**
 * 시드 한 행. `store` 와 `누가` 는 **DB 로 안 나간다** — 앱만 읽는 값이다.
 * (`store` 는 `etcFields` 가, `누가` 는 한글 키라 `toApiPayload` 가 떨군다.)
 *
 * 둘 다 선택이 아니다: 새 표를 여기 적으면 **어디 사는지와 누가 만드는지를 그 자리에서** 답해야 한다.
 */
export type i테이블시드 = Omit<i테이블dto, 'id'> & { store: i사는곳; 누가: i누가 };

export interface i테이블 extends BaseXX {
  테이블명: string;
  버전: number;
  세는단위: string;
  is계층: boolean;
}

export class model테이블s extends BaseModels2<model테이블, i테이블dto, i테이블시드> {
  /**
   * `version` 은 기계가 쓰는 칸이라 되돌려 보내지 않는다(위 `version` 주석).
   * `store` 는 애초에 DB 열이 아니다 — 시드가 어느 등록부에 들어갈지 고르는 데만 쓴다.
   * (`누가` 는 여기 없어도 된다. 한글 키라 `toApiPayload` 가 이미 떨군다 — 그래서 이 목록은
   *  **영문 키만** 든다. 그래도 `do누락채우기` 는 실어 보내기 전에 직접 뺀다.)
   */
  protected etcFields = ['version', 'store'];
  static getInstance = () => getRepoInstance('model테이블s', () => new model테이블s());

  private constructor() {
    super(model테이블, 'tables');
  }

  /**
   * 목록5 헤더가 읽는 최소 메뉴 — 이 테이블은 `model메뉴` 행이 없어서 직접 준다(일부러 없다).
   *
   * `빈문구`를 주는 이유: 기본값은 `{label}이 없습니다`인데 여기서는 **행이 곧 표**라
   * "테이블이 없습니다"가 *그 DB 표가 없다*로 읽힌다. 화면이 떠 있다는 건 표가 있다는 뜻인데도.
   */
  메뉴 = reactive({
    label: '테이블',
    아이콘: 'i-lucide-table-2',
    is계층: false,
    is시스템: true,
    빈문구: '등록된 표가 없습니다. 「초기값설정」을 누르면 앱이 아는 표가 들어갑니다.',
  });

  override 검색필드s = ['테이블명'];

  /** 표 이름 → 번호. 등록부가 쓰는 모양 그대로 준다. */
  get 버전s(): Record<string, number> {
    return Object.fromEntries(toValue(this.list).map((x) => [x.테이블명, x.버전]));
  }

  /**
   * **등록부 행이 아닌데 라우트는 있는 이름들.** 등록부 위에 세운 뷰다
   * (`"table-counts"` = `model표개수`).
   *
   * 시드에 넣으면 안 된다 — 행이 생기는 순간 `표버전` 판정을 타서 "안 바뀌었으면 안 받는다"에
   * 걸리고, 개수는 늘 최신이어야 한다(`model표개수` 머리말).
   *
   * 그런데 `api-guard` 는 **요청 경로에서** 표 이름을 뽑아 `{표}:{액션}` 을 요구하고, 그
   * 어휘는 아래 `이름s` 하나에서 나온다. 여기 안 적으면 역할 편집기가 `table-counts:read` 를
   * **줄 방법이 없고**, `enforce` 로 올리는 순간 대시보드와 관리자 유도가 같이 죽는다.
   * (`model역할.iDB테이블s` 가 `tables` 를 빼먹으면 안 됐던 것과 같은 자리다.)
   */
  static readonly 뷰이름s = ['table-counts'] as const;

  /**
   * 표 이름만. 권한 어휘(`model역할.do권한key옵션s`)가 **이것만** 읽는다 — 그래서 등록부 행이
   * 없는 뷰(`뷰이름s`)도 여기서 같이 낸다. 등록부가 비어 있으면 빈 배열이고, 그때는 부르는
   * 쪽이 손목록으로 떨어진다.
   */
  get 이름s(): string[] {
    const 행이름s = toValue(this.list).map((x) => x.테이블명).filter(Boolean);
    return 행이름s.length ? [...행이름s, ...model테이블s.뷰이름s] : [];
  }

  /**
   * 앱이 아는 표 전부. **화면이 없는 표(`answers`·`tag-links`·이력들)도 넣는다** —
   * 등록부의 일이 화면을 그리는 게 아니라 "이 표가 추적 중인가"를 말하는 것이라서다.
   * 행이 없는 표는 판정에서 빠져 지금까지대로 매번 받는다(그게 안전한 쪽이다).
   *
   * `세는단위`·`isHierarchy` 값은 `model메뉴.seed` 의 `dbTable` 에서 그대로 가져왔다.
   * 거기 없던 표는 기본값('개'·`false`)이고, 필요해지면 이 표를 고치면 된다.
   *
   * `version` 은 `etcFields` 라 서버로 안 나간다 — DB 기본값 0 으로 시작한다.
   */
  protected override seed: readonly i테이블시드[] = [
  { name: 'animals', unit: '개', isHierarchy: false, version: 0, store: 'v0', 누가: '시험' },
  { name: 'assets', unit: '개', isHierarchy: false, version: 0, store: '스위치', 누가: '운영' },
  { name: 'basics', unit: '개', isHierarchy: false, version: 0, store: '스위치', 누가: '설정' },
  { name: 'boards', unit: '개', isHierarchy: false, version: 0, store: '스위치', 누가: '설정' },
  { name: 'characters', unit: '개', isHierarchy: false, version: 0, store: 'v0', 누가: '시험' },
  { name: 'classes', unit: '개', isHierarchy: false, version: 0, store: '스위치', 누가: '운영' },
  { name: 'design-templates', unit: '개', isHierarchy: false, version: 0, store: '스위치', 누가: '설정' },
  { name: 'docs', unit: '개', isHierarchy: false, version: 0, store: 'v0', 누가: '시험' },
  { name: 'enrollables', unit: '개', isHierarchy: false, version: 0, store: '스위치', 누가: '운영' },
  { name: 'enrolls', unit: '건', isHierarchy: false, version: 0, store: '스위치', 누가: '유입' },
  { name: 'eras', unit: '개', isHierarchy: false, version: 0, store: 'v0', 누가: '시험' },
  { name: 'events', unit: '개', isHierarchy: false, version: 0, store: '스위치', 누가: '운영' },
  { name: 'fees', unit: '개', isHierarchy: false, version: 0, store: '스위치', 누가: '설정' },
  { name: 'fruits', unit: '개', isHierarchy: false, version: 0, store: 'v0', 누가: '시험' },
  { name: 'grade-conditions', unit: '개', isHierarchy: false, version: 0, store: '스위치', 누가: '설정' },
  { name: 'grades', unit: '개', isHierarchy: false, version: 0, store: '스위치', 누가: '설정' },
  { name: 'gradings', unit: '개 심사', isHierarchy: false, version: 0, store: '스위치', 누가: '운영' },
  { name: 'member-comments', unit: '개', isHierarchy: false, version: 0, store: '스위치', 누가: '유입' },
  { name: 'member-entity-historys', unit: '개', isHierarchy: false, version: 0, store: '스위치', 누가: '유입' },
  { name: 'member-fees', unit: '개', isHierarchy: false, version: 0, store: '스위치', 누가: '유입' },
  { name: 'member-gradings', unit: '개', isHierarchy: false, version: 0, store: '스위치', 누가: '유입' },
  { name: 'member-posts', unit: '개', isHierarchy: false, version: 0, store: '스위치', 누가: '유입' },
  { name: 'member-status-historys', unit: '개', isHierarchy: false, version: 0, store: '스위치', 누가: '유입' },
  { name: 'members', unit: '명', isHierarchy: false, version: 0, store: '스위치', 누가: '유입' },
  { name: 'memos', unit: '개', isHierarchy: false, version: 0, store: '스위치', 누가: '시험' },
  { name: 'menus', unit: '개', isHierarchy: true, version: 0, store: '스위치', 누가: '설정' },
  { name: 'occasions', unit: '개', isHierarchy: false, version: 0, store: '스위치', 누가: '운영' },
  { name: 'payments', unit: '개', isHierarchy: false, version: 0, store: '스위치', 누가: '유입' },
  { name: 'per-gradings', unit: '개', isHierarchy: false, version: 0, store: '스위치', 누가: '설정' },
  { name: 'places', unit: '곳', isHierarchy: false, version: 0, store: 'v0', 누가: '시험' },
  { name: 'polls', unit: '개', isHierarchy: false, version: 0, store: '스위치', 누가: '운영' },
  { name: 'quizzes', unit: '개', isHierarchy: false, version: 0, store: '스위치', 누가: '운영' },
  { name: 'records', unit: '개', isHierarchy: false, version: 0, store: 'v0', 누가: '시험' },
  { name: 'resources', unit: '건', isHierarchy: false, version: 0, store: '스위치', 누가: '운영' },
  { name: 'roles', unit: '개', isHierarchy: false, version: 0, store: '스위치', 누가: '설정' },
  { name: 'samples', unit: '개', isHierarchy: false, version: 0, store: 'v0', 누가: '시험' },
  { name: 'surveys', unit: '개', isHierarchy: false, version: 0, store: '스위치', 누가: '운영' },
  { name: 'tables', unit: '개', isHierarchy: false, version: 0, store: '스위치', 누가: '설정' },
  { name: 'tag-links', unit: '개', isHierarchy: false, version: 0, store: '스위치', 누가: '운영' },
  { name: 'tags', unit: '개', isHierarchy: false, version: 0, store: '스위치', 누가: '시험' },
  { name: 'theme', unit: '개', isHierarchy: false, version: 0, store: 'v0', 누가: '설정' },
  { name: 'users', unit: '개', isHierarchy: false, version: 0, store: '스위치', 누가: '유입' },
  { name: 'vegetables', unit: '개', isHierarchy: false, version: 0, store: 'v0', 누가: '시험' },
  ];

  /**
   * 시드에 있는데 등록부에 없는 이름만 채운다. **`do초기데이터`(목록이 비어있을 때만)를 안 쓴다.**
   *
   * 이 표에는 쓰기가 없어도 행이 생긴다 — bump 트리거가 이름과 번호만 있는 행을 만들기 때문이다
   * (`_CUSTOM/sql/tables.sql`). 그래서 "비어있을 때만" 규약을 그대로 쓰면 **어느 표에 쓰기가
   * 한 번 있었던 순간 등록부를 영영 못 채운다.**
   *
   * 부분 채움이 여기서는 안전하다: 등록부 행은 서로를 안 가리키므로, 다른 표들이 `시드PK`로
   * FK 를 잇느라 "전부 비어 있을 때 한 번에" 돌아야 하는 사정이 이 표에는 없다.
   *
   * 이미 있는 행도 **기본값에 머물러 있으면** 시드값으로 메운다. 트리거가 만든 행은 이름과
   * 번호만 있고 `unit` 은 열 기본값('개')이라, 그대로 두면 `members` 가 영영 '개'로 세어진다.
   * 사람이 `/admin/tables` 에서 고쳐 둔 값은 기본값이 아니므로 안 건드린다 — "기본값에 머물러 있음"이
   * *아직 아무도 안 정했음*의 유일한 표식이다.
   */
  do누락채우기 = async () => {
    await this.reads(false, true);
    const 있는 = new Map(toValue(this.list).map((x) => [x.테이블명, x]));

    const 없는 = this.담당표s.filter((x) => !있는.has(x.name));
    // `store`·`누가` 는 여기서 떨군다. 뒤쪽 방어도 있지만, 애초에 안 실어 보내는 게 정직하다.
    const 만든s = 없는.length
      ? await this.creates(없는.map(({ store: _사는곳, 누가: _누가, ...row }) => ({ ...row })))
      : [];

    /** 트리거가 만들어 둔 맨 행 메우기. 값이 이미 시드와 같으면 저장할 게 없다. */
    const 메울s = this.담당표s
      .map((시드) => ({ 시드, 행: 있는.get(시드.name) }))
      .filter(({ 시드, 행 }) => 행
        && 행.세는단위 === 기본세는단위 && 시드.unit !== 기본세는단위);
    for (const { 시드, 행 } of 메울s) {
      행!.세는단위 = 시드.unit;
      행!.is계층 = 시드.isHierarchy;
    }
    if (메울s.length) await this.do모두저장(메울s.map((x) => x.행!));

    return 만든s;
  };

  /** 이 등록부가 사는 곳. `apiURL` 이 답한다 — 스위치가 v0 면 **모든** 표가 lowDB 에 있다. */
  private get isV0등록부() { return this.apiURL.startsWith('/api/v0'); }

  /**
   * 이 등록부가 담당하는 표. 다른 저장소에 사는 표는 **넣지 않는다** — 넣으면 그 표의 번호가
   * 영영 0 이 되고, 클라가 그걸 "안 바뀜"으로 읽어 목록이 굳는다(`i사는곳` 머리말).
   */
  private get 담당표s(): readonly i테이블시드[] {
    return this.isV0등록부 ? this.seed : this.seed.filter((x) => x.store === '스위치');
  }

  /**
   * `목록5` 의 「초기값설정」 버튼과 `useSystem` 이 **같은 길**을 타게 한다.
   *
   * 기반 구현은 "목록이 비어있을 때만" 이라, 트리거가 행 하나만 만들어 둬도 버튼이 거절한다.
   * 이 표에는 그 규약이 안 맞는다(`do누락채우기` 머리말). 문구도 바꾼다 — 기반 구현은
   * "DB가 날라갑니다" 라고 묻는데, 여기서 하는 일은 **없는 이름만 더하는 것**이다.
   */
  override async do초기데이터(opts?: { skipConfirm?: boolean; ensureRead?: boolean }) {
    if (!opts?.skipConfirm && !confirm('표 등록부에 없는 표를 채울까요? 이미 있는 행은 안 건드립니다.'))
      return [];
    return this.do누락채우기();
  }

  /**
   * 표 이름 → 누가 만드나. **시드가 정본이다** — DB 로 안 나가는 값이라 등록부 *행* 에는 없다.
   *
   * 등록부에는 있는데 시드에 없는 이름이면 `null`. 요약 화면은 그걸 **「미분류」로 그린다** —
   * 조용히 아무 묶음에나 넣으면 새 표가 생겼다는 사실 자체가 안 보인다.
   */
  누가of = (name: string): i누가 | null =>
    this.seed.find((x) => x.name === name)?.누가 ?? null;

  /** 표 이름으로 찾는다. **id 가 아니라 이름이 링크 키다** — `model메뉴` 주석 참고. */
  getBy이름 = (name: string): model테이블 | null =>
    toValue(this.list).find((x) => x.테이블명 === name) ?? null;

  override _generate = () => new model테이블().generate();
  override _init = () => new model테이블().init();
}

export class model테이블 extends BaseModel2<i테이블dto> implements i테이블 {
  constructor(state?: i테이블dto) {
    super(model테이블s.getInstance(), state);
  }

  override afterCreate = () => { };
  override beforeSave = () => true;
  override afterSave = () => { };

  override 자동필드ss = [
    {
      label: '테이블',
      list: [
        { key: '테이블명', label: '표 이름', show: true, canEdit: false },
        { key: '버전', label: '변경 번호', show: true, canEdit: false },
        { key: '세는단위', label: '세는단위', type: 타입지정._.문자, show: true },
        { key: 'is계층', label: '계층', type: 타입지정._.is체크, show: true },
      ],
    },
  ];

  override init(): Omit<i테이블dto, 'id'> {
    return { name: '', version: 0, unit: '개', isHierarchy: false };
  }

  override generate(): Omit<i테이블dto, 'id'> {
    return this.init();
  }

  override get label() { return this.테이블명; }
  override get sub() { return `v${this.버전}`; }

  get 테이블명() { return this.state?.name ?? ''; }
  get 버전() { return Number(this.state?.version ?? 0); }

  get 세는단위() { return this.state?.unit || '개'; }
  set 세는단위(v: string) { if (this.state) this.state.unit = v; }

  get is계층() { return Boolean(this.state?.isHierarchy); }
  set is계층(v: boolean) { if (this.state) this.state.isHierarchy = Boolean(v); }
}

/**
 * 등록부에 **읽는 방법을 꽂는다.** `~utils/models` 가 모델을 import 하면 방향이 뒤집히므로
 * (모델이 `BaseModels2` 를 상속한다) 꽂는 쪽이 여기다.
 *
 * `force = true` 인 건 이 표가 판정의 뿌리라서다 — 자기 자신은 번호로 건너뛸 수 없다.
 * 무더기 호출은 `표버전` 안의 게이트(1초)가 한 번으로 합친다.
 */
표버전.공급자등록(async () => {
  const repo = model테이블s.getInstance();
  await repo.reads(false, true);
  return repo.버전s;
});

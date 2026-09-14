import { computed, toValue } from 'vue';
import { BaseModels2, BaseModel2, 타입지정, getRepoInstance } from '~utils/models';
import type { BaseXX, BaseXXDto } from '~utils/models';
import { i게시판seed } from '../seeds';
import { model메뉴s, type model메뉴 } from './model메뉴';
import { model회원게시글s, type model회원게시글 } from './model회원게시글';

/**
 * 인증 스토어는 **동적으로** 부른다. 이유는 `model회원게시글`의 같은 헬퍼에 적어둔 것과 같다 —
 * `useMyAuthStore`가 `~models/test2`를 정적 import 하므로 마주 import 하면 순환이 되고,
 * 그 증상이 하필 GNB(메뉴·게시판)가 통째로 비는 형태로 나타난다.
 */
const get인증 = async () => (await import('~/stores/useMyAuthStore')).useMyAuthStore();

/**
 * 게시판 = 글이 쌓이는 콘텐츠 컨테이너.
 *
 * 네비게이션(경로·아이콘·접근역할·GNB 순서)은 `model메뉴`가 소유하고, 메뉴가 `target.boardId`로 이
 * 게시판을 가리킨다. 둘은 성격이 달라(네비 뼈대 vs 콘텐츠) 테이블도 분리했다.
 *
 * 참조 방향이 메뉴 → 게시판인 이유: 게시판은 메뉴 없이도 성립하지만(초안), 게시판이 안 붙은 게시판
 * 메뉴는 빈 껍데기다. 그리고 이 방향에서만 중복이 무해하다 — 한 게시판을 두 자리에 거는 건 말이 되고,
 * 한 메뉴가 게시판 둘을 여는 건 말이 안 된다.
 *
 * 다만 새 게시판을 만드는 사람은 이 화면에 있으므로, 연결 UI(`노출 메뉴`)는 여기 둔다.
 * 세터가 메뉴 쪽을 고치고 저장 큐에 실어 보낸다 — `model역할.do메뉴관리`와 같은 방식.
 * 게시판 접근 제어는 계속 메뉴가 담당한다(`access-control.global.ts`가 경로 기준).
 */
export interface i페이지인트로 {
  eyebrow: string;
  title: string;
  description: string;
}

export const i게시판공개options = [
  { label: '공개', value: true, icon: 'i-lucide-eye' },
  { label: '비공개', value: false, icon: 'i-lucide-eye-off' },
] as const;

/**
 * 게시판이 목록을 어떤 형태로 그리는가.
 *
 * 공지처럼 시간순 목록이 맞는 게시판, 소식처럼 그림이 먼저 눈에 들어와야 하는 게시판, FAQ처럼 답을 그
 * 자리에서 펼쳐야 하는 게시판은 성격이 다르다. 한때 이 값마다 목록 화면이 네 벌로 갈렸지만
 * **2026-09-14 동결로 화면은 한 벌**(`m/Boards/행.vue`)이 됐고, 지금 이 값이 가르는 건 FAQ의 펼침 하나다
 * (`/boards/[boardType]/index.vue` 의 `is펼침`). 나머지 값은 DB·도우미 설명(`model회원게시글`)에 남아 있다.
 *
 * 게시판(콘텐츠 컨테이너)이 소유하는 게 맞다 — 메뉴는 "어디로 가는가"만 알고, "어떻게 보이는가"는 모른다.
 */
export type i게시판표시형식 = 'LIST' | 'CARD' | 'FAQ' | 'DOCS';

export const i게시판표시형식options = [
  { label: '목록', value: 'LIST', icon: 'i-lucide-list' },
  { label: '카드', value: 'CARD', icon: 'i-lucide-layout-grid' },
  { label: '질문·답변', value: 'FAQ', icon: 'i-lucide-circle-help' },
  { label: '자료', value: 'DOCS', icon: 'i-lucide-folder-open' },
] as const;

const 표시형식s: readonly string[] = i게시판표시형식options.map((o) => o.value);

/**
 * 이 게시판에 **새 글을 쓸 자격**.
 *
 * 읽기는 계속 메뉴가 판단한다(`access-control.global.ts`가 경로 기준). 여기서 가리는 건 쓰기뿐이라
 * 축이 겹치지 않는다 — 공지사항은 누구나 읽지만 아무나 쓰면 안 되는 자리다.
 *
 * "새 글"에만 걸리는 규칙이다. 이미 올라온 글의 수정·삭제는 작성자 자격(`model회원게시글.can편집시도`)이
 * 가른다 — 게시판을 나중에 닫았다고 해서 남의 글이 된 것은 아니므로, 쓴 사람은 계속 자기 글을 건사한다.
 */
export type i게시판쓰기권한 = 'ADMIN' | 'MEMBER' | 'ANYONE';

export const i게시판쓰기권한options = [
  { label: '관리자만', value: 'ADMIN', icon: 'i-lucide-shield' },
  { label: '회원', value: 'MEMBER', icon: 'i-lucide-user' },
  { label: '누구나', value: 'ANYONE', icon: 'i-lucide-users' },
] as const;

const 쓰기권한s: readonly string[] = i게시판쓰기권한options.map((o) => o.value);

export interface i게시판dto extends BaseXXDto {
  slug: string;
  title: string;
  icon: string | null;
  description: string | null;
  isPublished: boolean;
  /** 이 필드가 생기기 전에 저장된 행은 `null` — 읽는 쪽에서 'LIST'로 본다 */
  viewMode: i게시판표시형식 | null;
  /** 이 필드가 생기기 전에 저장된 행은 `null` — 읽는 쪽에서 'ADMIN'으로 본다 */
  writeAccess: i게시판쓰기권한 | null;
  pageIntro: i페이지인트로 | null;
}

/**
 * 시드 한 행. `code`는 **시드가 이 게시판을 가리키는 이름**이고 DB로 나가지 않는다.
 * `slug`로는 안 된다 — `set 슬러그`로 편집되는 값이라 시드가 다시 돌 때 어긋난다.
 */
export type i게시판시드 = Omit<i게시판dto, 'id'> & { code: string };

export interface i게시판 extends BaseXX {
  슬러그: string;
  이름: string;
  아이콘: string | null;
  요약: string;
  공개: boolean;
  표시형식: i게시판표시형식;
  쓰기권한: i게시판쓰기권한;
  페이지인트로: i페이지인트로 | null;
  /** 공개 게시판 경로 — `/boards/{슬러그}` */
  readonly 경로: string;
  노출메뉴Id: string;
  readonly 노출메뉴: model메뉴 | null;
  readonly 회원게시글s: model회원게시글[];
}

/** 선택기(`SelectItem`)는 빈 문자열 value를 못 받는다 — "안 걸었음"을 나타내는 센티널. */
const 연결없음 = 'NONE';

const 빈페이지인트로 = (): i페이지인트로 => ({ eyebrow: '', title: '', description: '' });
const to슬러그 = (v: unknown): string => String(v ?? '').trim().replace(/^\/+|\/+$/g, '');

export class model게시판s extends BaseModels2<model게시판, i게시판dto, i게시판시드> {
  /** `code`는 시드 전용 이름이라 서버로 보내지 않는다 — `시드PK` 등록부에만 남는다. */
  protected etcFields = ['code'];

  /**
   * 목록5 검색창과 챗봇 `검색어s`가 함께 훑는 필드.
   *
   * 게시판이 4~5행뿐이라 검색이 사치 같지만, 챗봇에는 필수다 — "공지해"의 "공지"가 이 축에 걸려야
   * 대상이 한 건으로 확정되고 행동 버튼이 붙는다. 없으면 게시판 전체가 후보로 늘어선다.
   */
  override 검색필드s = ['이름', '슬러그', '요약'];

  override 필터조건ss = [
    this.라디오필터그룹<model게시판>(
      [
        { label: '공개', value: 'PUBLIC', icon: 'i-lucide-eye', match: (a) => a.공개 },
        { label: '비공개', value: 'PRIVATE', icon: 'i-lucide-eye-off', match: (a) => !a.공개, 대기: true },
      ],
      { title: '공개' },
    ),
  ];

  static getInstance = () => getRepoInstance('model게시판s', () => new model게시판s());

  private constructor() {
    super(model게시판, 'boards');
  }

  /** 목록5 헤더·순서정렬이 참조하는 "이 테이블을 그리는 메뉴" */
  get 메뉴() { return model메뉴s.getInstance().getBy테이블명(this.tableName); }

  getBy슬러그 = (slug: string): model게시판 | null =>
    toValue(this.list).find((board) => board.슬러그 === to슬러그(slug)) ?? null;


  /** 메뉴의 `연결 게시판` 필드용 옵션 */
  options = computed(() =>
    toValue(this.list).map((board) => ({
      label: board.이름 || board.슬러그,
      icon: board.아이콘 ?? undefined,
      value: String(board.stateId ?? ''),
    })),
  );

  override _generate = () => new model게시판().generate();
  override _init = () => new model게시판().init();
  protected override seed = i게시판seed;
}

export class model게시판 extends BaseModel2<i게시판dto> implements i게시판 {
  constructor(state?: i게시판dto) {
    super(model게시판s.getInstance(), state);
  }

  override 자동필드ss = [
    {
      label: '기본',
      list: [
        { key: '이름', label: '이름', show: true },
        { key: '슬러그', label: '슬러그', show: true },
        {
          key: '노출메뉴Id',
          label: '노출 메뉴',
          type: 타입지정.선택0,
          options: computed(() => [
            { label: '노출 안 함', value: 연결없음 },
            ...model메뉴s.getInstance()
              .get게시판가능메뉴s()
              .filter((menu) => !menu.is게시판 || menu.게시판Id === String(this.stateId ?? ''))
              .map((menu) => ({
                label: menu.이름 ? `${menu.이름} (${menu.경로})` : menu.경로,
                icon: menu.아이콘,
                value: String(menu.stateId ?? ''),
              })),
          ]),
          show: true,
        },
        { key: '아이콘', label: '아이콘', type: 타입지정._.아이콘 },
        {
          key: '공개',
          label: '공개',
          type: 타입지정._.is체크,
          options: i게시판공개options as any,
          show: true,
        },
        {
          key: '표시형식',
          label: '표시 형식',
          type: 타입지정.선택0,
          options: i게시판표시형식options as any,
          show: true,
        },
        {
          key: '쓰기권한',
          label: '쓰기 권한',
          type: 타입지정.선택0,
          options: i게시판쓰기권한options as any,
          show: true,
        },
        { key: '요약', label: '요약', type: 타입지정._.문자, props: { is여러줄: true } },
      ],
    },
    {
      label: '페이지',
      list: [
        { key: '페이지제목', label: '제목', type: 타입지정._.문자, show: true },
        { key: '페이지눈썹', label: '부제', type: 타입지정._.문자, show: true },
        {
          key: '페이지설명',
          label: '요약',
          type: 타입지정._.문자,
          props: { is여러줄: true },
          show: true,
        },
      ],
    },
    {
      label: '게시글',
      config: { ratio: 30 },
      list: [
        {
          key: '회원게시글s',
          label: '회원 게시글',
          type: 타입지정._.카드s,
          show: true,
          is한줄: false,
          props: {
            do빈생성: () => {
              const boardId = String(this.stateId ?? '');
              if (!boardId) {
                useAlert().show(
                  '저장 필요',
                  '게시판을 먼저 저장해 ID가 생긴 뒤에 게시글을 추가할 수 있습니다.',
                );
                return;
              }
              // 모달 없이 바로 만든다 — 물어볼 게 없다. 이 게시판은 여기가 알고,
              // 작성자는 지금 이 화면에 서 있는 운영자다.
              void model회원게시글s.getInstance().do빈생성_게시판관점(boardId);
            },
          },
        },
      ],
    },
  ];

  override 자동버튼s = this.기본버튼s.concat([
    {
      key: 'do이동',
      label: '게시판 열기',
      icon: 'i-lucide-external-link',
      // 슬러그가 없으면 갈 곳 자체가 없다 — 저장 전 새 행에서는 안 보인다.
      show: computed(() => Boolean(this.경로)),
    },
    {
      key: 'do글쓰기',
      label: '글쓰기',
      icon: 'i-lucide-pen-line',
      // 권한(`can글쓰기`)은 여기서 못 본다 — 인증 스토어가 동적 import라 computed 안에서 못 기다린다.
      // 그래서 가부는 `do글쓰기` 자신이 판정한다(`do*`가 스스로 전제조건을 보는 그 층).
      show: computed(() => Boolean(this.경로)),
    },
  ]);

  /**
   * 관리 화면(`/admin/boards`)에서 이 게시판의 공개 페이지(`/boards/{슬러그}`)로 건너간다.
   *
   * 비공개 게시판은 그 경로가 404를 던지므로(`[boardType]/index.vue`) 이동 전에 막는다 —
   * 눌러서 에러 페이지를 보는 것보다 이유를 말해 주는 편이 낫다.
   */
  do이동 = () => {
    if (!this.경로) {
      useAlert().show('슬러그 필요', '공개 경로(/boards/슬러그)가 없어 이동할 수 없습니다.');
      return;
    }
    if (!this.공개) {
      useAlert().show('비공개 게시판', '공개로 바꿔 저장한 뒤에 열 수 있습니다.');
      return;
    }
    navigateTo(this.경로);
  };

  /**
   * 이 게시판에 새 글을 쓰러 간다. 챗봇의 "공지해"가 닿는 자리이기도 하다.
   *
   * **행동이 글이 아니라 게시판에 붙는 이유**: 새 글은 아직 행이 없다. 대상으로 지목할 수 있는 건
   * 그 글이 들어갈 게시판뿐이다. 챗봇이 초안까지 들고 왔다면 그건 `set행동초안`으로 얹혀 오고,
   * 글쓰기 화면이 폼에 앉힌다 — 여기서는 그 존재를 몰라도 된다.
   *
   * 여기서 글을 만들지 않는다. 여는 건 공개 글쓰기 화면이고 등록은 거기서 사용자가 누른다.
   * 발행이라는 부수효과를 클릭 한 번으로 끝내지 않는 건 `do*` 전체에 걸린 규칙이다.
   */
  do글쓰기 = async () => {
    if (!this.경로) {
      useAlert().show('슬러그 필요', '공개 경로(/boards/슬러그)가 없어 글을 쓸 수 없습니다.');
      return;
    }
    const auth = await get인증();
    if (!this.can글쓰기({ is로그인: auth.isLoggedIn, is관리자: auth.is관리자 })) {
      useAlert().show(
        '글을 쓸 수 없는 게시판입니다',
        this.쓰기권한 === 'MEMBER'
          ? '회원만 글을 올릴 수 있습니다. 로그인한 뒤에 다시 시도해주세요.'
          : '이 게시판은 관리자만 글을 올릴 수 있습니다.',
      );
      return;
    }
    navigateTo(`${this.경로}/write`);
  };

  bindModel = null as any;
  override afterCreate = () => { };
  override beforeSave = () => {
    if (!this.슬러그) {
      useAlert().show('슬러그 필요', '공개 경로(/boards/슬러그)를 만들려면 슬러그가 있어야 합니다.');
      return false;
    }
    const 중복 = toValue(model게시판s.getInstance().list)
      .some((board) => board.stateId !== this.stateId && board.슬러그 === this.슬러그);
    if (중복) {
      useAlert().show('슬러그 중복', `이미 "${this.슬러그}" 슬러그를 쓰는 게시판이 있습니다.`);
      return false;
    }
    return true;
  };
  override afterSave = () => { };

  override generate() {
    return { ...this.init() };
  }

  override init() {
    return {
      slug: '',
      title: '새 게시판',
      icon: 'i-ph-list-bullets-light',
      description: null,
      isPublished: true,
      viewMode: 'LIST' as const,
      // 새 게시판은 닫힌 채로 태어난다. 만드는 사람이 바로 이 폼에 있으니 여는 건 한 번의 선택이지만,
      // 반대로 기본이 열려 있으면 "열어 둔 줄 몰랐다"가 된다.
      writeAccess: 'ADMIN' as const,
      pageIntro: 빈페이지인트로(),
    };
  }

  override get sub() { return this.경로; }

  _badges = computed(() => [
    { label: `글 ${this.회원게시글s.length}`, color: this.공개 ? 'primary' : 'neutral' },
  ]);
  override get badges() { return toValue(this._badges) as any; }

  get 이름() { return this.state?.title ?? ''; }
  set 이름(v: string) { if (!this.state) return; this.state.title = v; }

  get 슬러그() { return to슬러그(this.state?.slug); }
  set 슬러그(v: string) { if (!this.state) return; this.state.slug = to슬러그(v); }

  get 아이콘() { return this.state?.icon ?? null; }
  set 아이콘(v: string | null) { if (!this.state) return; this.state.icon = v; }

  get 요약() { return this.state?.description ?? ''; }
  set 요약(v: string) { if (!this.state) return; this.state.description = String(v ?? '').trim() || null; }

  get 공개() { return this.state?.isPublished ?? true; }
  set 공개(v: boolean) { if (!this.state) return; this.state.isPublished = Boolean(v); }

  /** 기존 행(`viewMode` 없음)은 목록으로 본다 — 지금까지 그렇게 그려 왔으니 그게 무변화다. */
  get 표시형식(): i게시판표시형식 {
    const v = String(this.state?.viewMode ?? '');
    return (표시형식s.includes(v) ? v : 'LIST') as i게시판표시형식;
  }
  set 표시형식(v: i게시판표시형식) {
    if (!this.state) return;
    this.state.viewMode = (표시형식s.includes(String(v)) ? v : 'LIST') as i게시판표시형식;
  }

  /** 기존 행(`writeAccess` 없음)은 관리자 전용으로 본다 — 권한은 모르면 닫는 쪽이 맞다. */
  get 쓰기권한(): i게시판쓰기권한 {
    const v = String(this.state?.writeAccess ?? '');
    return (쓰기권한s.includes(v) ? v : 'ADMIN') as i게시판쓰기권한;
  }
  set 쓰기권한(v: i게시판쓰기권한) {
    if (!this.state) return;
    this.state.writeAccess = (쓰기권한s.includes(String(v)) ? v : 'ADMIN') as i게시판쓰기권한;
  }

  /**
   * 이 사람이 여기에 **새 글**을 쓸 수 있는가. 관리자는 어느 게시판이든 쓴다.
   * 목록의 글쓰기 버튼과 `/boards/{슬러그}/write`가 같은 답을 쓰게 하려고 모델에 둔다.
   */
  can글쓰기(ctx: { is로그인?: boolean; is관리자?: boolean } = {}) {
    if (ctx.is관리자) return true;
    if (!this.공개) return false;
    switch (this.쓰기권한) {
      case 'ANYONE': return true;
      case 'MEMBER': return Boolean(ctx.is로그인);
      default: return false;
    }
  }

  get 경로() { return this.슬러그 ? `/boards/${this.슬러그}` : ''; }

  private ensure페이지인트로(): i페이지인트로 {
    if (!this.state) return 빈페이지인트로();
    if (!this.state.pageIntro) this.state.pageIntro = 빈페이지인트로();
    return this.state.pageIntro;
  }

  get 페이지인트로() { return this.state?.pageIntro ?? null; }
  set 페이지인트로(v: i페이지인트로 | null) { if (!this.state) return; this.state.pageIntro = v; }

  get 페이지제목() { return this.state?.pageIntro?.title ?? ''; }
  set 페이지제목(v: string) { this.ensure페이지인트로().title = v; }

  get 페이지눈썹() { return this.state?.pageIntro?.eyebrow ?? ''; }
  set 페이지눈썹(v: string) { this.ensure페이지인트로().eyebrow = v; }

  get 페이지설명() { return this.state?.pageIntro?.description ?? ''; }
  set 페이지설명(v: string) { this.ensure페이지인트로().description = v; }

  get 회원게시글s(): model회원게시글[] {
    return model회원게시글s.getInstance().getsBy게시판(this);
  }

  /**
   * 이 게시판을 여는 메뉴(역참조 — 링크는 메뉴가 들고 있다). 안 걸었으면 `null`.
   *
   * 이름을 `메뉴`로 두면 안 된다. `기본정렬조건s`의 '순서'가 `a.메뉴?.폴더s`를 먼저 보는데,
   * 거기서 말하는 메뉴는 "이 행이 속한 목록 화면의 메뉴"(= `repo.메뉴`)라서 뜻이 다르다.
   * 게시판 메뉴는 테이블이 아니라 `폴더s`가 항상 `[]`이고, `[] ?? x`는 `[]`이라 정렬이 죽는다.
   */
  get 노출메뉴(): model메뉴 | null {
    return model메뉴s.getInstance().getBy게시판(String(this.stateId ?? ''));
  }

  /** 폼 필드용 — 안 걸었으면 `연결없음` 센티널. */
  get 노출메뉴Id() { return String(this.노출메뉴?.stateId ?? '') || 연결없음; }

  /**
   * 화면은 여기 있지만 값은 메뉴가 소유한다. 이전/새 메뉴의 `target`을 고치고 저장 큐에 싣는다.
   * 큐에 실으면 `is수정됨`이 켜져 저장 버튼이 살아나고, 저장 시 메뉴도 함께 반영된다.
   */
  set 노출메뉴Id(v: string) {
    const 게시판id = String(this.stateId ?? '');
    const 다음 = String(v ?? '').trim() || 연결없음;
    const 이전 = this.노출메뉴Id;
    if (다음 === 이전) return;
    if (!게시판id) {
      useAlert().show('저장 필요', '게시판을 먼저 저장해 ID가 생긴 뒤에 메뉴에 걸 수 있습니다.');
      return;
    }

    const 메뉴repo = model메뉴s.getInstance();
    if (이전 !== 연결없음) 메뉴repo.getById(이전)?.do게시판연결해제();
    if (다음 !== 연결없음) 메뉴repo.getById(다음)?.do게시판연결(게시판id);

    this.addQueue({
      type: 'update',
      qId: 'board-menu-link',
      milliseconds: Date.now(),
      label: `노출 메뉴 (${메뉴repo.getById(다음)?.이름 ?? '노출 안 함'})`,
      func: async () => { await 메뉴repo.do모두저장(); },
    });
  }
}

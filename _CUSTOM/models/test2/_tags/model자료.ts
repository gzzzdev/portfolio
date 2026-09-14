import { computed, toValue } from 'vue'
import { BaseModels2, BaseModel2, 타입지정, type BaseXX, type BaseXXDto, getRepoInstance } from '~utils/models'
import { 본문대표그림, 본문받기s } from '~utils'
import { model메뉴s } from '../_basics/model메뉴'
import { i자료seed } from '../seeds'
// 태그는 `model태그` 연결이 아니라 문자열 배열(`tags`)이다 — 아래 `태그s` 주석 참고.
// import { model태그관계s } from './model태그관계'
// import { model태그s, type model태그 } from './model태그'

/**
 * 자료 — MD 본문을 담고 챗봇이 참조하는 문서.
 *
 * 메모(`model메모`)·게시글(`model회원게시글`)과 달리 회원·게시판에 매이지 않는 조직 지식이다.
 *
 * **칸은 제목·요약·본문·공개·태그(문자열 배열)뿐이다.** 종류·키워드·출처·발행일이 있었지만 분류는 태그와 겹쳤고
 * (종류에 기준이 없어 같은 성격의 글이 ETC·BOOK으로 갈렸다) 키워드는 전부 태그·본문에 있는 말이었고,
 * 출처는 챗봇의 `/resources/{id}` 링크가 대신한다. 다시 세우려면 그 칸을 읽는 곳부터 만들 것.
 *
 * **저장은 DB 필드, `.md`는 입출력 포맷.** 파일시스템에 두면 ORM 자동폼·목록5·필터·태그를
 * 전부 잃기 때문에 본문을 `content`에 담는다.
 */

/**
 * 본문 1건 상한(문자). 넘으면 저장을 막는다.
 *
 * lowdb는 요청마다 테이블 JSON을 통째로 읽으므로 큰 본문이 쌓이면 챗봇 이전에 자료 CRUD가 느려진다.
 * 검색 품질로도 나쁘다 — 매칭이 어디서 났든 문서 전체가 한 덩어리로 후보에 올라 랭킹이 무의미해진다.
 * 큰 자료는 챕터 단위로 나눠 넣는 게 맞다.
 */
export const 자료본문상한 = 100_000

export interface i자료dto extends BaseXXDto {
  title: string
  /**
   * 열은 문자열로 남아 있고 모델은 `공개` boolean으로만 본다. 운영자 전용(`ADMIN`)을 가르는 코드가
   * 없어서 실제로 갈리는 건 PUBLIC이냐 아니냐 둘뿐이었다(방문자 화면 `pages/(common)/resources`).
   */
  visibility: 'PUBLIC' | 'MEMBER'
  summary?: string
  content?: string
  tags?: string[]
}

export interface i자료 extends BaseXX {
  제목: string
  공개: boolean
  요약: string
  내용: string
  분량: number
  태그s: string[]
}

export class model자료s extends BaseModels2<model자료, i자료dto> {
  protected etcFields = []

  /**
     * 검색 축 — 선언 **순서가 곧 가중치**다. 제목에서 맞은 게 본문에서 맞은 것보다 위로 온다.
     *
     * `요약`이 제목 바로 다음인 게 중요하다. 요약은 사람이 읽으라고 있는 게 아니라
     * **검색·프롬프트용**이라, 잘 적혀 있으면 전문을 안 실어도 답이 되는 구간이 생긴다.
     */
  override 검색필드s = ['제목', '요약', '태그s', '내용']

  override 정렬조건s = [
    { label: '최신', value: '최신', func: (a: model자료, b: model자료) => Number(b.stateId) - Number(a.stateId) },
    { label: '제목↑', value: '제목↑', func: (a: model자료, b: model자료) => a.제목.localeCompare(b.제목) },
    { label: '분량↓', value: '분량↓', func: (a: model자료, b: model자료) => b.분량 - a.분량 }
  ]

  /**
   * 축은 여기가 든다 — 방문자 목록(`/resources`)·목록5·도우미가 같은 축을 읽는다(`model신청받기s` 와 같은 규약).
   * 「전체」 옵션이 없고 `기본선택` 이 null 인 건 「안 건다」가 곧 전체라서다.
   *
   * **형태** — 읽는 글(문서)과 받는 파일. 칸이 아니라 본문의 `::download` 블록 유무(`받기s`)로 갈린다.
   * 시드가 두 무더기(읽는 글 16 · 받는 글 10 — `seeds/model자료.seed`)라, 이 축이 곧 「자료실」이 자료로 합쳐지며 잃은 갈래다.
   */
  readonly 형태필터그룹 = this.라디오필터그룹<model자료>(
    [
      { label: '문서', value: '문서', icon: 'i-lucide-file-text', match: (a: model자료) => !a.받기s.length },
      { label: '파일', value: '파일', icon: 'i-lucide-file-down', match: (a: model자료) => a.받기s.length > 0 }
    ],
    { key: 'resource-kind', title: '형태' }
  )

  /** 방문자에게는 축이 아니라 바닥이다(회원 자료가 아예 안 보인다) — 화면이 로그인일 때만 칩으로 세운다. */
  readonly 공개필터그룹 = this.라디오필터그룹<model자료>(
    [
      { label: '공개', value: 'PUBLIC', icon: 'i-lucide-globe', match: (a: model자료) => a.공개 },
      { label: '회원', value: 'MEMBER', icon: 'i-lucide-users', match: (a: model자료) => !a.공개 }
    ],
    { key: 'resource-open', title: '공개' }
  )

  override 필터조건ss = [this.형태필터그룹, this.공개필터그룹]

  /**
   * **태그 축.** 값이 고정 목록이 아니라 데이터라 `필터조건ss` 에 못 들어간다(그 배열은 생성 때 한 번 만든다) —
   * 목록이 바뀔 때마다 다시 짓는다. 주소 키는 다른 축과 같은 규약(`필터축쿼리키` → `?f_태그=서식`)이라
   * 도우미가 걸어도 화면이 그대로 연다. 태그가 하나도 없으면 옵션이 비고, 화면은 그 축을 안 그린다.
   */
  _태그축 = computed(() => this.라디오필터그룹<model자료>(
    [...new Set(toValue(this.list).flatMap(자료 => 자료.태그s))]
      .sort((a, b) => a.localeCompare(b))
      .map(태그 => ({ label: 태그, value: 태그, icon: 'i-lucide-tag', match: (a: model자료) => a.태그s.includes(태그) })),
    { key: 'resource-tag', title: '태그' }
  ))

  get 태그축() { return toValue(this._태그축) }

  /** 목록이 비어 있을 때만 들어간다 — 부르는 곳은 `useSystem.do초기데이터` 끝. */
  protected override seed = i자료seed

  static getInstance = () => getRepoInstance('model자료s', () => new model자료s())

  private constructor() {
    // 전역 스위치를 따른다. 예전엔 lowDB(`/api/v0`)에 못박혀 있었다 — supabase 칸은 `_CUSTOM/sql/resources.sql`.
    super(model자료, 'resources')
  }

  get 메뉴() { return model메뉴s.getInstance().getBy테이블명(this.tableName) }

  override _generate = () => new model자료().generate()
  override _init = () => new model자료().init()
}

export class model자료 extends BaseModel2<i자료dto> implements i자료 {
  constructor(state?: i자료dto) {
    super(model자료s.getInstance(), state)
  }

  override afterCreate = () => { }
  override afterSave = () => { }

  /** 본문 상한은 여기서 막는다 — 넘긴 뒤 프롬프트 단계에서 자르는 건 이미 늦다. */
  override beforeSave = () => {
    if (this.내용.length > 자료본문상한) {
      useAlert().show(
        '본문이 너무 깁니다',
        `${this.내용.length.toLocaleString()}자 / 상한 ${자료본문상한.toLocaleString()}자. 챕터 단위로 나눠 저장하세요.`
      )
      return false
    }
    return true
  }

  override 자동필드ss = [
    {
      label: '본문',
      list: [
        { key: '제목', label: '제목', show: true },
        // 라벨에 `(Markdown)` 이 붙어 있던 자리다 — 값은 md 인데 칸이 HTML 편집기라
        // `# 제목` 이 글자로 보였고, 그 경고를 라벨이 지고 있었다. 칸이 맞으니 경고도 걷는다.
        { key: '내용', label: '본문', type: 타입지정._.문자md, is한줄: false, show: true }
      ]
    },
    {
      label: '검색·공개',
      list: [
        // 사람이 읽는 칸이 아니라 검색·프롬프트가 먹는 칸이다.
        { key: '요약', label: '요약', type: 타입지정._.문자, props: { is여러줄: true }, is한줄: false },
        { key: '태그s', label: '태그', type: 타입지정._.문자s, show: true },
        { key: '공개', label: '공개', type: 타입지정._.is체크, show: true }
      ]
    }
  ]

  override generate() { return this.init() }

  override init() {
    return {
      title: '새 자료',
      visibility: 'MEMBER' as const,
      summary: '',
      content: '',
      tags: []
    }
  }

  override get label() { return this.제목 }
  // 요약은 `sub`가 아니라 `brief`다 — `sub`는 행에서 제목 옆 `shrink-0 nowrap`(짧은 꼬리표 자리)라
  // 문장이 들어가면 제목을 0폭으로 누르고 뱃지 밑까지 넘친다. 제목 아래 2줄로 접히는 건 `brief`다.
  override get sub() { return '' }
  get brief() { return this.요약 }

  override get icon() { return 'i-mdi-light:file' }

  /**
   * 썸네일 칸이 없다 — 본문의 첫 사진(없으면 첫 영상)이 곧 얼굴이다(`~utils` 의 `본문대표그림`).
   * `computed` 인 건 본문 상한이 10만 자라 행마다 그릴 때 정규식을 돌리면 목록이 느려져서다.
   */
  _썸네일 = computed(() => 본문대표그림(this.내용))
  get 썸네일() { return toValue(this._썸네일) }

  /**
   * 받을 파일 — 본문의 `::download` 블록들(`~utils` 의 `본문받기s`). 칸이 따로 없는 이유는 썸네일과 같다:
   * 본문에서 블록을 빼면 목록의 「받기」 버튼도 같이 빠져야 한다.
   */
  _받기s = computed(() => 본문받기s(this.내용))
  get 받기s() { return toValue(this._받기s) }

  _badges = computed(() => {
    const badges: { label: string, color: string, icon?: string }[] = []

    if (!this.공개) badges.push({ label: '회원', color: 'warning', icon: 'i-lucide-users' })

    for (const 태그 of this.태그s)
      badges.push({ label: 태그, icon: 'i-lucide-tag' })

    if (this.분량) badges.push({ label: `${this.분량.toLocaleString()}자` })

    return badges
  })

  override get badges() { return toValue(this._badges) }

  get 제목() { return this.state?.title ?? '' }
  set 제목(v: string) { if (!this.state) return; this.state.title = v }

  get 공개() { return this.state?.visibility === 'PUBLIC' }
  set 공개(v: boolean) { if (!this.state) return; this.state.visibility = v ? 'PUBLIC' : 'MEMBER' }

  get 요약() { return this.state?.summary ?? '' }
  set 요약(v: string) { if (!this.state) return; this.state.summary = v }

  get 내용() { return this.state?.content ?? '' }
  set 내용(v: string) { if (!this.state) return; this.state.content = v }

  /** 본문 문자수. 정렬 축이자 "전문을 실어도 되는지"의 단서. */
  get 분량() { return this.내용.length }

  /**
   * 태그는 문자열 배열이다. `model태그`(계층·아이콘·기간이 있는 관계)에 매던 걸 걷었다 —
   * 자료 분류에는 이름 조각이면 충분하고, 관계 표를 같이 읽어야 뱃지가 서던 비용이 없어진다.
   * 되살리려면 아래 주석과 `model태그관계`의 `*자료*` 메서드를 같이 푼다.
   */
  get 태그s() { return this.state?.tags ?? [] }
  set 태그s(v: string[]) { if (!this.state) return; this.state.tags = v.map(x => x.trim()).filter(Boolean) }
  // get 태그s(): model태그[] { return model태그관계s.getInstance().get태그sBy자료(this) }
  // get 태그id() { return String(this.태그s[0]?.stateId ?? '') }
  // set 태그id(v: string) {
  //   void model태그관계s.getInstance().do자료태그변경(this, model태그s.getInstance().getById(v))
  // }
}

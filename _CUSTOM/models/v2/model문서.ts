import { reactive } from 'vue'
import { BaseModels2, BaseModel2, 타입지정, getRepoInstance } from '~utils/models'
import type { BaseXX, BaseXXDto } from '~utils/models'
import { i문서seed } from './model문서.seed'

/**
 * 본문(md) 한 편이 행 하나인 표. **「보이는 대로 고치기」를 표 위에 올린 자리다.**
 *
 * 편집기(`mEditor` · `타입지정._.문자md`)는 이미 두 군데서 돈다 — 모래밭
 * (`/decisions/content/wysiwyg`)과 신청받기 상세의 「본문」 칸이다. 그런데 앞은 **저장이 없고**,
 * 뒤는 본문이 콘텐츠물(신청받기·수업·행사…)에 **딸린 칸**이라 본문만 놓고 만들고 지울 수가 없다.
 * 그래서 편집기가 목록·추가·저장·삭제를 한 바퀴 도는 걸 본 적이 없었다. 이 표가 그 한 바퀴다.
 *
 * ## 그래서 칸이 넷뿐이다
 *
 * 이 표에서 궁금한 건 본문 한 칸이다. `제목`은 목록에서 행을 지목할 이름, `독자`는 필터 축 하나,
 * `요약`은 목록 두 번째 줄 — 셋 다 본문을 **둘러싸는 데 필요한 최소**고, 그 밖의 칸
 * (태그·공개범위·썸네일…)은 여기서 시험할 게 없다. 입력 타입 구경은 `model견본`이 따로 진다.
 *
 * ## 저장되는 값은 md 문자열이다
 *
 * `body`에 들어가는 건 md 원문이고 그게 최종이다(`~utils/mdc/doc` 「저장은 md 다」).
 * 폼 칸과 편집기 사이의 모양 변환(md ↔ 문서 객체)은 `m/Editor/md.vue` 가 진다 —
 * 모델은 문자열만 들고 있으면 된다. **한 번 저장하면 원문이 정규화되고 그 뒤로는 고정이다**
 * (그 어댑터 머리말의 실측). 시드로 넣은 md는 아직 그 왕복을 안 지났으니, 처음 저장한 행에서
 * 원문 생김새가 조금 달라지는 건 사고가 아니라 그 정규화다.
 *
 * ## 도우미(aiV2)에는 안 넣는다
 *
 * `aiV2/source.ts` 가 본문을 계약에서 뺐다 — 도우미의 수정 폼은 한 줄 입력이라 본문을 못 받는다.
 * 제목만 여는 것도 안 한다: 어휘(건수 + 설명 한 줄)만 늘고 시험되는 축이 없다.
 */

/**
 * 읽는 사람. **글의 종류가 아니라 독자로 갈랐다** — 같은 블록도 독자가 달라지면 쓰임이 달라진다는
 * 게 본문 샘플(`~utils/mdc/samples`)이 셋을 고른 기준이고, 이 표의 시드가 그 셋이다.
 */
export const i문서독자options = [
  { label: '스태프', value: '스태프' },
  { label: '회원', value: '회원' },
  { label: '방문자', value: '방문자' }
]

/** 저장되는 값. 키는 전부 ASCII다 — 한글 키는 서버로 나갈 때 걸러진다(`BaseModels2`의 순수 데이터값 추림). */
export interface i문서dto extends BaseXXDto {
  /** 제목. 목록이 행을 지목하는 이름이라 `beforeSave`가 빈 값을 막는다. */
  title: string
  /** 읽는 사람(`i문서독자options`). 닫힌 값이라 필터 축으로 쓴다. */
  reader: string
  /** 목록 두 번째 줄에 나가는 한 줄. **서식을 안 받는다** — 글을 쓰는 자리는 본문이다. */
  summary: string
  /** 본문 **md 원문**. */
  body: string
}

export interface i문서 extends BaseXX {
  label: string
  독자: string
  요약: string
  본문: string
}

export class model문서s extends BaseModels2<model문서, i문서dto> {
  protected etcFields = []
  static getInstance = () => getRepoInstance('model문서s', () => new model문서s())

  /**
   * 초기데이터 세 편(`model문서.seed`). **v2 표 중 시드를 가진 건 여기뿐이다** — 나머지(동물·과일·견본…)는
   * `_generate` 로 무작위 행을 뽑으면 그만인데, 본문은 무작위로 지어낼 수가 없다. 그래서 이 표만
   * `do초기데이터` 를 탄다(`_generate` 는 빈 문서를 연다 — 아래 `init`).
   */
  protected override seed = i문서seed

  private constructor() {
    super(model문서, 'docs')
    /** 시험용 표라 전역 스위치(`NUXT_PUBLIC_API_URL`)를 안 따르고 lowDB에 남는다. */
    this.apiURL = `/api/v0/${this.tableName}`
  }

  /** 목록5 헤더가 읽는 최소 메뉴 — v2에는 `model메뉴` 행이 없어서 직접 준다. */
  메뉴 = reactive({ label: '문서', 아이콘: 'i-lucide-file-text', is계층: false, is시스템: false })

  /**
   * 검색이 훑을 칸. **본문(md 원문)까지 넣는다** — 문서를 찾는 말은 대개 제목이 아니라 본문 속 단어다.
   * 대신 `::note` 같은 어휘 이름도 글자로 걸린다. 그걸 막으려면 파서를 태워야 하는데
   * (`문서평문`), 검색 한 번에 13건을 다 파싱하는 값이 여기서는 안 나온다.
   */
  override 검색필드s = ['label', '요약', '본문']

  /** 축은 하나. 이 표의 목적이 필터가 아니라 본문이라, 축이 늘면 목록 왼쪽이 편집기보다 커진다. */
  override 필터조건ss = [
    this.라디오필터그룹<model문서>(
      i문서독자options.map(o => ({
        label: o.label,
        value: (a: model문서) => a.독자 === o.value
      })),
      { key: '독자', title: '읽는 사람' }
    )
  ]

  override _generate = () => new model문서().generate()
  override _init = () => new model문서().init()
}

export class model문서 extends BaseModel2<i문서dto> implements i문서 {
  constructor(state?: i문서dto) {
    super(model문서s.getInstance(), state)
  }

  override afterCreate = () => { }
  override beforeSave = () => {
    if (!this.label.trim()) {
      useAlert().error('저장할 수 없습니다', '제목을 입력해주세요.')
      return false
    }
    return true
  }

  override afterSave = () => { }

  /**
   * **묶음은 하나다.** `자동필드ss`의 그룹이 곧 상세 탭이라(`상세5.vue`), 가르면 얻는 것 없이
   * **행을 열 때마다 한 번 더 눌러야** 본문이 나온다 — 본문이 곧 이 표의 이유인데 그게 한 칸
   * 뒤에 숨는다. 편집기가 다른 칸을 밀어내는 것도 여기선 문제가 안 된다: 제목·읽는 사람이
   * 머리글로 올라가 폼에 남는 게 요약 한 줄뿐이다.
   * (콘텐츠 쪽도 같은 판단으로 「기본」 한 묶음이다 — `enrolls/_콘텐츠물.필드_기본`.)
   */
  override 자동필드ss = [
    {
      label: '문서',
      list: [
        /* 제목은 머리글이 이미 `label`을 그리므로 여기서 빠진다(`get상단필드s`). 선언은 그대로 둔다. */
        { key: 'label', label: '제목', show: true },
        { key: '독자', label: '읽는 사람', type: 타입지정.선택0, options: i문서독자options, show: true },
        {
          key: '요약', label: '요약', type: 타입지정._.문자,
          is한줄: false, 폭: '전체' as const, show: true,
          props: { is여러줄: true, rows: 2 }
        },
        { key: '본문', label: '본문', type: 타입지정._.문자md, is한줄: false, 폭: '전체' as const, show: true }
      ]
    }
  ]

  override 자동버튼s = this.기본버튼s.concat([
    { key: 'do삭제', label: '삭제', icon: 'i-lucide-trash-2', position: 'top', show: true }
  ])

  /** 확인 창은 `delete()` 안에 있다 — 여기서 또 물으면 같은 질문이 두 번 뜬다. */
  do삭제 = () => this.delete()

  override generate() {
    return this.init()
  }

  /** 새 행은 본문이 빈 채로 열린다. 편집기는 빈 문서에서 시작하는 게 정상이다(빈 문단 하나). */
  override init() {
    return {
      title: '새 문서',
      reader: '',
      summary: '',
      body: ''
    }
  }

  override get label() { return this.state?.title ?? '' }
  set label(v: string) { if (!this.state) return; this.state.title = String(v ?? '') }

  get 독자() { return this.state?.reader ?? '' }
  set 독자(v: string) { if (!this.state) return; this.state.reader = String(v ?? '') }

  get 요약() { return this.state?.summary ?? '' }
  set 요약(v: string) { if (!this.state) return; this.state.summary = String(v ?? '') }

  /** 폼 칸이 주고받는 값은 md 문자열이다. `null`이 와도 문자열로 눌러 둔다 — 어댑터가 빈 문서로 읽는다. */
  get 본문() { return this.state?.body ?? '' }
  set 본문(v: string) { if (!this.state) return; this.state.body = String(v ?? '') }

  /**
   * **목록 두 번째 줄 전용.** 제목만 보면 누구에게 쓴 글인지가 안 보이는데, 카드에는 칸이 없어서
   * 한 줄로 압축해 준다.
   *
   * 상세에는 안 올라간다 — 거긴 이 두 값이 각각 제 칸으로 있고(독자는 머리글, 요약은 폼),
   * 압축본을 또 얹으면 같은 문장이 두 번 나온다. `view상세5`의 머리글은 어느 모델에서도
   * `sub`을 안 읽는다 — 뺄 칸을 특정할 수 없는 값이라 `sub` 쪽을 지운다(그 `머리글` 주석).
   */
  override get sub() {
    return [this.독자, this.요약].filter(Boolean).join(' · ')
  }
}

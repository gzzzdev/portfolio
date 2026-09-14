import { computed, toValue } from 'vue'
import { BaseModels2, BaseModel2, 타입지정 } from '~utils/models'
import type { BaseXX, BaseXXDto, i필드 } from '~utils/models'
import { mDayjs, toCompactDates, 본문대표그림, type i기간 } from '~utils'
import { model메뉴s } from '../_basics/model메뉴'
import { model신청받기s, type model신청받기 } from './model신청받기'
import { is자리차지, type i신청받기대상, type i문항 } from './types'

/**
 * 신청받기가 붙을 수 있는 **콘텐츠물**의 공통 부분.
 *
 * 테이블을 합치지 않고 클래스만 합친다 — `tableName`이 API 경로·메뉴·행 동일성 셋을 한꺼번에
 * 맡고 있어서, 테이블을 합치면 `/surveys = model설문s = surveys` 사슬이 통째로 끊긴다.
 * 공유해야 할 건 행이 아니라 코드였다.
 */
export interface i콘텐츠물dto extends BaseXXDto {
  title: string
  /** **한 줄 요약.** 목록 카드 밑에 깔리고 `::list`·검색이 읽는다. 서식이 들어가면 안 되는 자리다. */
  description: string
  /**
     * **본문(마크다운).** 상세 화면이 `<MDC>` 로 그린다. 쓸 수 있는 `::` 어휘는 `~utils/mdc/blocks`.
     *
     * **사람은 이 md 를 안 본다** — 폼에서는 완성 그림 위에서 바로 고치고(`mEditor`), 저장할 때만
     * md 가 된다(`m/Editor/md.vue`). 그래서 한 번 고쳐 저장하면 원문 생김새가 정규화되고
     * (줄바꿈 → 공백 · 표 칸 폭 · `~`→`\~`) 그 뒤로는 고정된다. **보이는 글자는 안 바뀐다** —
     * 13건 전부로 재 봤고, 그 실측이 `mEditorMd` 머리말에 있다.
     *
     * `description` 과 갈라 둔 이유는 자리가 다르기 때문이다 — 요약은 카드에서 두 줄로 잘리고,
     * 본문은 상세에서만 펼쳐진다. 한 칸이 둘을 겸하면 카드에 마크업이 새거나 본문이 한 줄로 눌린다
     * (실제로 그랬다: `description` 이 `문자서식`(TipTap HTML)으로 열려 있었는데 담긴 값은 한 줄 요약이었다.
     * 그 타입은 2026-09-07에 없어졌다 — 본문은 `문자md`, 한두 문장은 `문자`+`is여러줄` 로 갈렸다).
     */
  body: string
  thumbnail: string | null
}

export interface i콘텐츠물 extends BaseXX {
  제목: string
  설명: string
  본문: string
  이미지: string | null
  신청받기s: model신청받기[]
}

export abstract class model콘텐츠물s<
  T extends model콘텐츠물<D>,
  D extends i콘텐츠물dto
> extends BaseModels2<T, D> {
  protected etcFields = []

  get 메뉴() { return model메뉴s.getInstance().getBy테이블명(this.tableName) }

  /**
     * 시드를 부은 뒤 회차 목록을 **강제로 다시 읽는다.** 1회차는 콘텐츠 INSERT 트리거가 DB 에서
     * 만들므로 클라의 `model신청받기s.list` 는 그 행을 모른다. 표버전 판정이 잡아 주긴 하지만
     * 1초 게이트 안에서는 낡은 번호를 볼 수 있어 여기서 확실히 한다.
     *
     * 옛 `do자동모집끄고`(저장 직후 클라가 신청받기를 여는 훅을 시드 동안 끄던 스위치)는 없어졌다 —
     * 클라가 신청받기를 안 만드니 끌 것도 없다.
     */
  override async do초기데이터(opts?: { skipConfirm?: boolean, ensureRead?: boolean }) {
    const 만든s = await super.do초기데이터(opts)
    if (만든s?.length) await model신청받기s.getInstance().reads(false, true)
    return 만든s
  }
}

export abstract class model콘텐츠물<D extends i콘텐츠물dto> extends BaseModel2<D> implements i콘텐츠물 {
  /**
     * 저장 직후 회차 목록을 다시 읽는다. **1회차는 DB 트리거가 같은 트랜잭션에서 만들었다** —
     * 클라가 만드는 게 아니라 받아 오는 것이다. 이게 옛 `do모집자동생성`의 자리다.
     */
  override afterCreate = async () => {
    await model신청받기s.getInstance().reads(false, true)
  }

  /**
     * 검증을 통과하면 썸네일까지 채워 놓고 저장으로 넘긴다.
     * 콘텐츠마다 갈리는 건 **무엇을 검증하느냐**뿐이라, 서브클래스가 손댈 자리는 `is저장가능`만 남긴다.
     */
  override beforeSave = async () => {
    if (!this.is저장가능()) return false
    await this.do썸네일자동()
    return true
  }

  override afterSave = () => { }

  /** 저장해도 되는 상태인가. 서브클래스는 `super.is저장가능()`으로 이어받는다. */
  protected is저장가능(): boolean {
    if (!this.제목.trim()) {
      useAlert().error('저장할 수 없습니다', '제목을 입력해주세요.')
      return false
    }
    return true
  }

  override get label() { return this.제목 }
  /**
     * **화면에 보이는 그림**. 사람이 고른 것 → 본문의 첫 사진(없으면 첫 영상) → 타입의 기본 그림 순이다.
     *
     * `이미지`(=`state.thumbnail`)와 갈라 두는 게 핵심이다 — 본문 그림도 기본 그림도 여기서만 살고 칸에는
     * 안 들어간다. 본문에서 사진을 빼면 그림도 같이 빠져야 하고, 저장돼서 서버로 가는 값도 안 더럽혀진다.
     * `do썸네일자동`은 본문에 그림이 있으면 안 그린다(그 사진이 곧 얼굴이다) — 기본 그림만으로는 여전히
     * "비었다"고 본다. 카드가 빈 채로 뜨는 건 그림이 없어서가 아니라 **AI 생성이 4~5초 걸리고 실패는
     * 삼키기 때문**이라, 막을 자리는 저장 쪽이 아니라 그리는 쪽이다.
     */
  override get thumbnail() { return this.이미지 || this.본문그림 || this.기본썸네일 || undefined }

  /** 본문이 스스로 내놓는 그림(`~utils` 의 `본문대표그림`). `computed` 인 건 본문이 길어서다. */
  _본문그림 = computed(() => 본문대표그림(this.본문))
  get 본문그림() { return toValue(this._본문그림) }

  /**
     * 그림이 하나도 없을 때 목록 카드에 깔리는 타입의 얼굴(`public/img/thumb/*.svg`).
     *
     * `사진태그s`와 같은 자리에 같은 이유로 있다 — 콘텐츠마다 어울릴 그림이 이미 정해져 있다.
     * 다만 저건 사람이 **고를 때** 쓰는 검색어고 이건 아무도 안 골랐을 때의 바닥이다.
     * 빈 문자열이면 폴백을 안 깐다(= 예전대로 아이콘이 뜬다).
     */
  protected get 기본썸네일(): string { return '' }

  get 제목() { return this.state?.title ?? '' }
  set 제목(v: string) { this.state.title = v ?? '' }

  get 설명() { return this.state?.description ?? '' }
  set 설명(v: string) { this.state.description = v ?? '' }

  get 본문() { return this.state?.body ?? '' }
  set 본문(v: string) { this.state.body = v ?? '' }

  get 이미지() { return this.state?.thumbnail ?? null }
  set 이미지(v: string | null) { this.state.thumbnail = v }

  /**
     * 이 콘텐츠가 신청받기에서 불리는 이름 = 자기 테이블명.
     *
     * `entityType` 같은 별도 코드를 두지 않는 이유다 — 두 곳에 적으면 어긋날 수 있지만,
     * `메뉴명`은 `repo.tableName` 그 자체라 어긋날 자리가 없다.
     */
  get 신청받기대상표() { return this.메뉴명 as i신청받기대상 }

  _신청받기s = computed(() => model신청받기s.getInstance().getsBy대상(this.신청받기대상표, this.stateId))
  /** 이 콘텐츠의 회차 전부, 회차 오름차순. 대개 하나다. */
  get 신청받기s() { return toValue(this._신청받기s) }

  /**
     * **지금 회차** = 가장 최근 회차. 「신청받기」 구역·목록 카드·상태가 보는 그 하나.
     * 저장 전 콘텐츠는 아직 없다(트리거가 저장 때 만든다).
     */
  get 현재신청받기(): model신청받기 | null { return this.신청받기s.at(-1) ?? null }
  /** `현재신청받기`의 옛 이름. 읽는 자리가 남아 있어 별칭으로 둔다. */
  get 대표신청받기(): model신청받기 | null { return this.현재신청받기 }

  /** 지금 회차의 문항. 문항은 회차가 갖는다(jsonb) — 콘텐츠는 제목·본문·이미지만 든다. */
  get 문항s(): i문항[] { return this.현재신청받기?.문항s ?? [] }
  get 신청s() { return this.신청받기s.flatMap(신청받기 => 신청받기.신청s) }
  /** 자리를 먹는 신청 수(대기·승인). 회차 전부를 합친다. */
  get 신청수() { return this.신청s.filter(신청 => is자리차지(신청.상태)).length }
  /** 답을 낸 수. 문답물의 「응답 41」. */
  get 응답수() { return this.신청s.filter(신청 => 신청.is제출됨).length }
  get is신청받는중() { return this.신청받기s.some(신청받기 => 신청받기.is신청받는중) }

  /**
     * 회차를 하나 더 연다(추가 회차·얼리버드/일반·1학기/2학기). 문항은 직전 회차에서 id 째 복사된다.
     * 버튼은 상단바에 있고(`자동버튼s`) 「신청받기」 탭은 둘 이상일 때만 목록이 된다 — 대부분의 콘텐츠는
     * 회차라는 말 자체를 안 본다(와이어프레임 원칙 3).
     */
  do회차추가 = async () => model신청받기s.getInstance().do회차추가(this.신청받기대상표, this)

  /** 지금 회차의 신청을 연다·마감한다(`model신청받기.do신청열기`). 버튼은 둘 중 지금 할 수 있는 하나만 뜬다. */
  do신청열기 = async () => this.현재신청받기?.do신청열기()
  do신청마감 = async () => this.현재신청받기?.do신청마감()

  override 자동버튼s = this.기본버튼s.concat([
    {
      key: 'do신청열기',
      label: '신청 열기',
      icon: 'i-ph-door-open-light',
      position: 'top' as const,
      show: computed(() => !this.is신규 && !!this.현재신청받기 && !this.현재신청받기.is신청받는중)
    },
    {
      key: 'do신청마감',
      label: '신청 마감',
      icon: 'i-ph-lock-simple-light',
      position: 'top' as const,
      show: computed(() => !this.is신규 && !!this.현재신청받기?.is신청받는중)
    },
    {
      key: 'do회차추가',
      label: '회차 추가',
      icon: 'i-ph-plus-circle-light',
      position: 'top' as const,
      show: computed(() => !this.is신규 && this.신청받기s.length > 0)
    }
  ])

  /**
     * 사람이 썸네일을 **고를 때** 뜨는 후보의 영문 검색어(Unsplash). 한글 제목으로는 검색이 안 되고,
     * 타입마다 어울릴 그림은 이미 정해져 있어서 여기 한 번 적는다.
     *
     * 저장 시 자동으로 채우는 쪽(`do썸네일자동`)은 이걸 안 쓴다 — 거긴 제목·설명으로 그린다.
     */
  protected get 사진태그s(): string[] { return [] }

  /**
     * 콘텐츠 한 벌을 쓰는 자리 — 제목·요약·썸네일·본문이 한 탭에 다 있다.
     * 콘텐츠마다 자기 필드를 끼워 넣을 수 있게 인자로 받는다.
     *
     * **탭은 「기본 | 문항 | 신청받기」 셋뿐이다.** `자동필드ss`의 그룹이 그대로 상세 탭이 되는데
     * (`상세5.vue`), 예전엔 본문·사진이 각자 탭이라 다섯이었다. 한 콘텐츠를 쓰려면 탭 셋을
     * 오가야 했고, 그 셋은 **묶어도 안 부딪히는 것들**이었다 — 문항·신청받기만이 제 목록을 가진다.
     *
     * **요약은 서식을 안 받는다.** 이 값이 나가는 자리가 목록 카드의 두 줄(`line-clamp-2`)과
     * `::list` 의 한 줄이라, 마크업이 들어가면 태그가 글자로 샌다. 글을 쓰는 자리는 「본문」이다.
     *
     * **본문은 맨 아래, 썸네일은 옆 열이다.** md 에디터가 폼 한 칸을 통째로 먹어서, 중간에 두면
     * 제목·요약이 화면 밖으로 밀린다. 썸네일은 `폭:'옆'` 이라 240px 옆 열로 빠지므로
     * (`모델필드s2.vue`) 세로 자리를 안 뺏는다 — 폼이 좁으면 알아서 아래로 접힌다.
     */
  protected 필드_기본(추가: i필드[] = []) {
    return {
      label: '기본',
      list: [
        { key: '제목', label: '제목', show: true },
        ...추가,
        {
          key: '설명', label: '요약', type: 타입지정._.문자,
          is한줄: false, 폭: '전체' as const, show: true,
          props: { is여러줄: true, rows: 2 }
        },
        {
          key: '이미지', label: '썸네일', type: 타입지정.이미지2,
          is한줄: false, 폭: '옆' as const, show: true,
          props: { tags: this.사진태그s, count: 4, orientation: 'landscape' as const }
        },
        // md 한 칸뿐이다 — 어휘(`::`)는 `~utils/mdc/blocks` 가 정하고 꾸미기는 축이 정한다.
        { key: '본문', label: '본문', type: 타입지정._.문자md, is한줄: false, 폭: '전체' as const, show: true }
      ] as i필드[]
    }
  }

  /**
     * 저장 직전, 썸네일이 비어 있으면 제목·설명으로 그림 한 장을 그려 채운다(`/api-etc/ai/gen_img`).
     *
     * **고르지 않고 그린다.** 타입 태그로 스톡 사진을 뽑아 봤지만, "2027년 차기 회장 선출"에
     * 아무 투표함 사진이나 붙는 건 그 콘텐츠의 그림이 아니라 그 분류의 그림이었다.
     * 여기 그림은 목록 카드에서 제목 옆에 붙는 얼굴이라 내용과 어긋나면 안 고르느니만 못하다.
     * (장면묘사 + 생성 두 번이라 4~5초 걸린다. 비어 있을 때 한 번뿐이다.)
     *
     * **이미 그림이 있으면 손대지 않는다.** 사람이 고른 것을 기계가 덮으면 안 되고,
     * 그래서 다시 그리게 하는 방법도 명확하다 — 썸네일을 비우고 저장하면 된다.
     *
     * 실패는 삼킨다. 썸네일은 콘텐츠의 부속이지 저장의 조건이 아니다.
     */
  protected do썸네일자동 = async () => {
    if (import.meta.server) return
    if (this.이미지) return
    // 사진·영상을 넣은 글의 그림은 그 사진·영상이다 — 위에 AI 그림을 덮으면 카드가 엉뚱해진다(`thumbnail`).
    if (this.본문그림) return

    // 요약은 평문이지만 본문은 md 라 기호가 섞인다 — 장면을 뽑는 데 마크업은 방해만 된다.
    const 글 = `${this.설명} ${this.본문}`
      .replace(/```[\s\S]*?```/g, ' ')
      .replace(/^::.*$/gm, ' ')
      .replace(/[#>*`_|-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    const 주제 = [this.제목.trim(), 글.slice(0, 300)].filter(Boolean).join(' — ')
    if (!주제) return

    try {
      const r = await $fetch<{ url?: string }>('/api-etc/ai/gen_img', {
        method: 'POST',
        body: { prompt: 주제, style: 'photo', aspectRatio: '16:9', dir: 'enroll_thumb' }
      })
      if (!r?.url) return
      this.이미지 = r.url
      useAlert().log('썸네일 생성', '제목·설명으로 그렸습니다.')
    } catch {
      // 그림을 못 받았다고 저장을 막지 않는다
    }
  }

  /**
     * 「신청받기」 탭 — 회차를 보는 **유일한** 자리. 기간·정원·요금·문항·신청 현황이 회차 카드 안에 있다.
     *
     * 회차가 하나면 그 카드 한 장, 둘 이상이면 같은 자리에서 목록이 된다. 예전엔 목록이 「회차」 탭으로
     * 따로 있었는데, 두 탭이 같은 행(`model신청받기`)을 보여 줘서 「신청받기」와 「회차」가 다른 것처럼 읽혔다.
     * 저장 전 콘텐츠는 카드가 비어 있고, 저장하면 트리거가 만든 1회차가 뜬다.
     */
  protected 필드_신청받기() {
    return {
      label: '신청받기',
      config: { ratio: 55 },
      list: [
        {
          key: '현재신청받기',
          label: '신청받기',
          type: 타입지정._.카드,
          is한줄: false,
          폭: '전체' as const,
          show: computed(() => this.신청받기s.length <= 1),
          props: { can: { 수정: true, 삭제: false } }
        } as i필드,
        {
          key: '신청받기s',
          label: '회차',
          type: 타입지정._.카드s,
          is한줄: false,
          폭: '전체' as const,
          show: computed(() => this.신청받기s.length > 1),
          props: { can: { 수정: true } }
        } as i필드
      ]
    }
  }
}

/**
 * 문항으로 답을 받는 콘텐츠 — 설문·퀴즈·투표.
 *
 * 셋의 차이는 `문항.answerKey`의 유무와 익명 집계뿐이라, 여기서 갈릴 게 없다.
 * 답을 내면 신청이 「제출」이 된다(`model신청.do제출`) — 심사 단계가 없다.
 */
export abstract class model문답물<D extends i콘텐츠물dto> extends model콘텐츠물<D> {
  /** 지금 회차에 빈 문항을 하나 붙인다. 설문 상세에서 곧장 문항을 쓰게 하는 통로. */
  do문항추가 = () => {
    const 신청받기 = this.현재신청받기
    if (!신청받기) {
      useAlert().show('저장 필요', '먼저 저장해야 문항을 만들 수 있습니다.')
      return
    }
    return 신청받기.do문항추가()
  }

  get is채점물() { return this.문항s.some(문항 => (문항.answerKey?.length ?? 0) > 0) }
}

/** 기간·장소가 있는 콘텐츠 — 행사·수업. 회차가 갈리기 쉬운 쪽이다(1학기/2학기, 얼리버드/일반). */
export interface i모임물dto extends i콘텐츠물dto {
  startDate: Date
  endDate: Date
  place: string
  /** 상위 모임. 학기 > 수업, 학술대회 > 세션처럼 한 겹 묶을 때만 쓴다. */
  parentId: string | null
}

export abstract class model모임물<D extends i모임물dto> extends model콘텐츠물<D> {
  protected override is저장가능(): boolean {
    if (!super.is저장가능()) return false
    if (this.기간[1].isBefore(this.기간[0])) {
      useAlert().error('저장할 수 없습니다', '종료일이 시작일보다 빠릅니다.')
      return false
    }
    return true
  }

  override get sub() { return toCompactDates(this.기간[0], this.기간[1]) }

  get 기간() {
    return [mDayjs(this.state?.startDate), mDayjs(this.state?.endDate)] as i기간
  }

  set 기간(v: i기간) {
    this.state.startDate = v[0].toDate()
    this.state.endDate = (v[1] ?? v[0]).toDate()
  }

  get 장소() { return this.state?.place ?? '' }
  set 장소(v: string) { this.state.place = v ?? '' }

  get 상위id() { return String(this.state?.parentId ?? '') }
  set 상위id(v: string) { this.state.parentId = String(v ?? '') || null }

  protected 필드_기간() {
    return [
      // 달력 라벨·색은 안 정한다 — 행사·수업이 이 칸을 같이 쓰므로 `model달력s` 가 표 메뉴에서 라벨을 붙인다.
      { key: '기간', label: '기간', type: 타입지정._.기간, show: true, 달력: true },
      { key: '장소', label: '장소', show: true }
    ] as i필드[]
  }

  protected 모임init() {
    const 시작 = mDayjs().startOf('day')
    return {
      title: '',
      description: '',
      body: '',
      thumbnail: null,
      startDate: 시작.toDate(),
      endDate: 시작.add(1, 'day').toDate(),
      place: '',
      parentId: null
    }
  }
}

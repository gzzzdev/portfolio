import { reactive, toValue } from 'vue'
import { BaseModels2, BaseModel2, 타입지정, getRepoInstance } from '~utils/models'
import type { BaseXX, BaseXXDto } from '~utils/models'
import { mDayjs } from '~utils'

/**
 * 한 대상에 **여러 줄이 날짜순으로 쌓이는** 기록.
 *
 *     3/4 감자가 상함
 *     3/5 새로 감자 들어옴
 *
 * 그래서 `날짜`가 따로 있다 — `createdAt`(적은 시각)으로 대신할 수 없다.
 * 어제 일을 오늘 적는 일이 흔하고, 축은 "언제 적었나"가 아니라 "언제 일어났나"다.
 *
 * 대상은 `대상Id` **한 칸**이고, 거기에 `표:PK`를 담는다(`fruits:1001`).
 * 표 이름이 필요한 건 v2 세 표가 id를 각자 1001부터 매기기 때문이다 —
 * 과일#1001(사과)과 동물#1001(고양이)이 실제로 부딪힌다. 열을 둘로 쪼개지 않은 건
 * 조회가 늘 두 축을 맞춰야 하기 때문이고, 한 칸이면 `대상키()` 하나로 끝난다.
 */
export interface i기록dto extends BaseXXDto {
  /** `표:PK` (`대상키()`가 만든다) */
  targetId: string
  /** 일어난 날 `YYYY-MM-DD`. 적은 시각은 `createdAt`이 따로 들고 있다. */
  date: string
  msg: string
  /** 좋아요 수. 지금은 그냥 숫자 한 칸이라 누가 눌렀는지는 남지 않는다. */
  likes: number
}

/** 기록이 가리키는 자리 — 표 이름과 서버 PK를 한 칸에 담는다. */
export const 대상키 = (표: string, id: unknown) => `${표}:${String(id ?? '')}`

/** 대상 표 → 사람이 읽는 이름. v2에 표가 늘면 여기 한 줄 늘린다. */
const 표라벨s: Record<string, string> = { fruits: '과일', animals: '동물', vegetables: '채소' }

export interface i기록 extends BaseXX {
  대상Id: string
  날짜: ReturnType<typeof mDayjs>
  메시지: string
  좋아요: number
}

export class model기록s extends BaseModels2<model기록, i기록dto> {
  protected etcFields = []
  static getInstance = () => getRepoInstance('model기록s', () => new model기록s())

  private constructor() {
    super(model기록, 'records')
    /** 시험용 표라 전역 스위치(`NUXT_PUBLIC_API_URL`)를 안 따르고 lowDB에 남는다. */
    this.apiURL = `/api/v0/${this.tableName}`
  }

  /** 목록5 헤더가 읽는 최소 메뉴 — 이 테이블은 model메뉴 행이 없어서 직접 준다. */
  메뉴 = reactive({ label: '기록', 아이콘: 'i-lucide-scroll-text', is계층: false, is시스템: false })

  override 검색필드s = ['메시지', '대상Id']

  override _generate = () => new model기록().generate()
  override _init = () => new model기록().init()

  /**
   * 특정 대상(`표`, `PK`)에 쌓인 기록 — 최신 날짜부터.
   *
   * 같은 날짜가 여럿이면 적은 순서(`createdAt`)로 가른다. 날짜만 보면 하루에 두 줄 적었을 때
   * 순서가 매번 뒤집힌다(`sort`가 안정정렬이어도 원본 순서는 서버가 준 순서다).
   */
  listBy대상(표: string, id: unknown) {
    const key = 대상키(표, id)
    if (key.endsWith(':')) return []
    return toValue(this.list)
      .filter(row => row.대상Id === key)
      .sort((a, b) =>
        (b.state.date ?? '').localeCompare(a.state.date ?? '')
        || String(b.state.createdAt ?? '').localeCompare(String(a.state.createdAt ?? ''))
      )
  }

  /**
   * 한 줄 남긴다 — 과일·동물·채소의 `do기록` 버튼이 부르는 자리.
   *
   * `메시지`를 들고 오면 **묻지 않는다.** AI도우미는 사용자가 이미 말한 내용을 그대로 들고 온다
   * (`토마토에 기록추가해 "2222"`). 그때도 모달을 띄우면 방금 한 말을 다시 타이핑시키는 꼴이다 —
   * 버튼을 누른 것 자체가 확인이다. 내용을 모를 때만(화면의 기록 버튼) 묻는다.
   *
   * 저장 전(서버 PK 없음) 행은 막는다. 기록만 먼저 붙으면 대상이 없는 `:` 키가 생겨서
   * 나중에 그 행이 저장돼도 서로를 못 찾는다.
   */
  do기록입력 = async (표: string, id: unknown, 대상라벨: string, 메시지?: string) => {
    if (import.meta.server) return
    if (id == null || String(id).trim() === '') {
      useAlert().show('저장 먼저', '기록은 저장된 행에만 답니다.')
      return
    }
    // 날짜는 오늘로 넣는다. 지난 일을 적어야 하면 기록 상세에서 날짜만 고쳐 쓴다 —
    // 매번 날짜부터 묻게 하면 대부분인 "오늘 일" 한 줄이 두 걸음이 된다.
    const 내용 = (메시지 ?? '').trim() || (await useModalInput().open({
      title: `${대상라벨 || '대상'} 기록`,
      message: `${mDayjs().format('M/D')} 에 남깁니다`,
      placeholder: '예: 감자가 상함',
      trim: true
    })) || ''
    if (!내용) return
    await this.do기록(표, id, 내용)
    return this.reads()
  }

  /** 기록 남기기 — 부르는 쪽은 자기 표·id와 할 말만 안다. */
  do기록 = async (표: string, id: unknown, 메시지: string, 날짜 = mDayjs()) => {
    const m = new model기록()
    m.대상Id = 대상키(표, id)
    m.날짜 = 날짜
    m.메시지 = 메시지
    await m.add(true)
    return m
  }
}

export class model기록 extends BaseModel2<i기록dto> implements i기록 {
  constructor(state?: i기록dto) {
    super(model기록s.getInstance(), state)
  }

  override afterCreate = () => { }
  override beforeSave = () => {
    if (!this.메시지.trim()) {
      useAlert().show('내용 필요', '기록 내용을 입력하세요.')
      return false
    }
    return true
  }

  override afterSave = () => { }

  override 자동필드ss = [
    {
      label: '기록',
      list: [
        { key: '날짜', label: '날짜', type: 타입지정._.날짜, show: true },
        { key: '메시지', label: '내용', show: true },
        { key: '좋아요', label: '좋아요', type: 타입지정._.숫자, show: true },
        { key: '대상Id', label: '대상', show: true, canEdit: false }
      ]
    }
  ]

  override 자동버튼s = this.기본버튼s

  override generate() {
    return this.init()
  }

  /** `createdAt`은 서버가 찍는다(클라 값은 무시된다) — 여기서 채우면 ISO 문자열과 Date가 섞여 정렬이 깨진다. */
  override init() {
    return {
      targetId: '',
      date: mDayjs().format('YYYY-MM-DD'),
      msg: '',
      likes: 0
    }
  }

  /** 사람이 쓰는 그대로 — `3/4 감자가 상함`. */
  override get label() { return this.줄 }

  /** 어디에 달린 기록인지 — 본문만 보면 어느 행 얘긴지 알 수 없다. */
  override get sub() { return this.대상표시 }

  /** 목록 한 줄. 대상 상세에 쌓아 보일 때도 이 문자열을 쓴다. */
  get 줄() {
    const 날 = this.날짜.isValid() ? this.날짜.format('M/D') : ''
    return 날 ? `${날} ${this.메시지}` : this.메시지
  }

  /** `fruits:1001` → `과일 #1001`. 모르는 표는 키를 그대로 보여준다. */
  get 대상표시() {
    const [표, ...나머지] = this.대상Id.split(':')
    const pk = 나머지.join(':')
    if (!pk) return this.대상Id
    return `${표라벨s[표] ?? 표} #${pk}`
  }

  get 날짜() {
    const d = mDayjs(String(this.state?.date ?? '').trim())
    return d.isValid() ? d : mDayjs(this.state?.createdAt)
  }

  set 날짜(v: ReturnType<typeof mDayjs>) {
    if (!this.state) return
    this.state.date = mDayjs(v).format('YYYY-MM-DD')
  }

  get 메시지() { return this.state?.msg ?? '' }
  set 메시지(v: string) { if (!this.state) return; this.state.msg = String(v ?? '') }

  /** 음수·NaN은 0으로 눌러 둔다 — 폼이 빈 칸을 보내면 `Number('')`가 0이 아니라 NaN이 된다. */
  get 좋아요() {
    const n = Number(this.state?.likes)
    return Number.isFinite(n) ? n : 0
  }

  set 좋아요(v: number) {
    if (!this.state) return
    const n = Number(v)
    this.state.likes = Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0
  }

  get 대상Id() { return String(this.state?.targetId ?? '') }
  set 대상Id(v: unknown) { if (!this.state) return; this.state.targetId = String(v ?? '') }
}

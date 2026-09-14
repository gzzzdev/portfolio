# 팀 마장터 — 회원관리시스템

협회·학회·동호회 규모의 단체를 위한 회원 관리 · 활동 운영 · 전자투표 시스템.

**[portfolio.team-mjt.com](https://portfolio.team-mjt.com)** — 로그인 모달의 `개발 계정`으로 역할별 화면을 볼 수 있다.

---

## 기능

| 영역 | 내용 |
|---|---|
| 회원 | 명부, 역할·등급·상태, 회비 납부, 상태·관계 변경 이력 |
| 권한 | 역할 5종(운영자·담당자·학습자·준회원·비회원), 역할별 메뉴 노출, 표 단위 CRUD 권한 |
| 활동 | 행사 · 수업 · 설문 · 퀴즈 · 투표 — 한 신청 표로 받는다 |
| 결제 | 토스페이먼츠 |
| 문서 | 회원증 발급, 자료, 게시판 |
| AI | 자연어로 목록을 거르고 세는 도우미 (Gemini) |

**Nuxt 4 · Vue 3 · TypeScript · Nuxt UI · Supabase** — 로그인은 구글 · 네이버 · 카카오 OAuth, 세션은 Supabase Auth.

---

## 구조

### 1. 모델 = 표 = REST 경로

엔티티 하나가 모델 한 쌍(`model{이름}` 행 / `model{이름}s` 저장소)이고, 저장소는 표 이름 하나로 REST 경로에 붙는다.
라우트는 표마다 만들지 않는다. `[table]` 동적 라우트 한 벌이 모든 표를 받는다.

```ts
export class model신청s extends BaseModels2<model신청, i신청dto> {
  static getInstance = () => getRepoInstance('model신청s', () => new model신청s())
  private constructor() { super(model신청, 'enrolls') }   // → /api/v1/enrolls
}
```

```
server/api/v1/[table]/
  index.get.ts   index.post.ts   bulk.post.ts   bulk.put.ts
  [id].get.ts    [id].put.ts     [id].delete.ts
```

- 새 표를 추가할 때 서버 코드는 손대지 않는다. SQL로 표를 만들고 모델을 하나 쓰면 끝이다.
- `/api/v0`은 lowDB(로컬 JSON), `/api/v1`은 Supabase. 같은 모델이 `NUXT_PUBLIC_API_URL`로 저장소를 바꾼다.
- 여러 표를 한 번에 봐야 하는 조회도 새 라우트 대신 DB 뷰로 만든다. 뷰도 표 이름이라 같은 경로·인가를 그대로 탄다(`table-counts`).

### 2. 조인은 클라이언트에서

서버는 표를 그대로 돌려주고, 관계는 모델의 getter가 다른 저장소를 찾아 잇는다.

```ts
class model신청 {
  _회원 = computed(() => model회원s.getInstance().getById(this.회원id) ?? null)
  get 회원() { return toValue(this._회원) }
  get 신청자이름() { return this.회원?.label ?? '' }
}
```

화면은 필요한 표를 한 번에 읽어 두기만 하면 된다.

```ts
await Promise.all([
  model회비s.getInstance().reads(),
  model회원회비s.getInstance().reads(),
  model회원s.getInstance().reads(),
  model결제s.getInstance().reads()
])
```

- 저장소는 싱글턴이라 목록·GNB·챗봇이 같은 목록을 공유한다. 클라이언트는 탭 단위, SSR은 요청 단위로 인스턴스를 둔다(`getRepoInstance`).
- SSR에서 읽은 목록은 Nuxt payload로 넘겨 하이드레이션 때 다시 받지 않는다.
- 표마다 변경 번호(`tables.version`, 트리거로 증가)를 두고, 번호가 그대로면 `reads()`가 요청을 건너뛴다.
- 저장은 바뀐 행만 모아 신규는 `bulk POST`, 기존은 `bulk PUT`으로 나눠 보낸다(`do모두저장`).

#### 페이지네이션을 두지 않는다 — 전송량으로 정했다

목록은 표 전체를 한 번에 받고 거르기·정렬·검색은 클라이언트가 한다.
본문이 있는 자료 행이 건당 약 3.3KB라 1,000건이 전송 약 **3.3MB**, 힙 약 **15MB**다.
이 규모에서는 페이지를 넘길 때마다 서버를 왕복하는 비용이 첫 전송량보다 크다고 봤다.

- 검색은 `검색필드s`를 `.some()` 단축평가로 훑고 본문을 맨 뒤에 둔다(`model자료`: `['제목', '요약', '태그s', '내용']`). 대부분의 검색어는 앞 필드에서 걸려 본문까지 안 간다.
- AI 도우미 자료는 첫 질문을 보낼 때만 받는다(`ai/planner.ts`의 `s.load()`). 도우미를 안 쓰는 화면은 받지 않는다.
- **언제 버리나** — 한 표가 수천 건대로 오르면 이 전략은 유지되지 않는다. 그때는 열 투영(`?brief=true`)과 본문 지연 로드로 단계적으로 옮긴다.

### 3. 인가는 표 이름 기준

클라이언트 조인 때문에 권한을 "어느 화면"이 아니라 "어느 표의 어느 동작"으로 묻는다.

- `server/middleware/api-guard.ts`가 경로와 메서드를 `{table}:{read|create|update|delete}`로 바꿔 역할의 권한 목록과 대조한다.
- 공개 게시판이 작성자 이름 때문에 `members`를 읽는 경우처럼, 전체 읽기 대신 `readPublic`만 가진 역할은 거부하지 않고 **열을 좁혀** 준다. 공개 열은 표별 화이트리스트(`공개필드s.ts`)로 정한다.

### 4. 모델 선언으로 화면을 그린다

관리 화면은 페이지마다 만들지 않는다. 저장소를 `view목록5`에 넘기면 목록 · 필터 · 정렬 · 검색 · 상세 · 수정이 모델 선언에서 나온다.

```vue
<view목록5 v-model:selected="selected" :repository="model회비s.getInstance()" :can수정="is관리자" />
```

모델이 선언하는 것:

| 선언 | 화면에서 |
|---|---|
| `자동필드ss` | 상세 · 수정 폼. 그룹이 여럿이면 탭. 필드 타입(`타입지정`)이 입력 컴포넌트를 정한다 |
| `필터조건ss` | 필터 라디오 그룹. 축끼리 AND |
| `정렬조건s` | 정렬 선택 |
| `검색필드s` | 검색창이 훑는 필드. 앞에 적은 필드일수록 관련도가 높다 |

```ts
override 필터조건ss = [this.종류필터그룹, this.상태필터그룹, this.결제필터그룹]

override 자동필드ss = [{
  label: '신청',
  list: [
    { key: '신청일', label: '신청일', type: 타입지정._.날짜, canEdit: false },
    { key: '상태',   label: '상태',   type: 타입지정.선택0, options: i신청단계options }
  ]
}]
```

같은 선언을 다른 곳도 읽는다.

- **AI 도우미** — `필터조건ss` · `정렬조건s` · `검색필드s`를 질의 어휘로 쓴다. 자연어를 이 축들의 조합으로 바꾸고, 거르고 세는 건 앱이 한다.
- **달력** — `자동필드ss`에서 `달력` 표시가 달린 날짜 필드를 모아 한 달력에 올린다.

---

## 디렉터리

```
_CUSTOM/
  utils/models/     BaseModel2 · BaseModels2 — 저장소, 저장, 캐시, 필드 타입
  models/test2/     도메인 모델 (회원 · 신청 · 등급 · 결제 · 게시판 …) 과 시드
  models/v2/        새 구조를 먼저 검증하는 모델
  utils/ai, aiV2/   AI 도우미
  sql/              Supabase 스키마 · 뷰 · 트리거
app/
  components/view/  모델을 받아 그리는 뷰 (목록5 · 상세5 · 캘린더 …)
  pages/admin/      표별 관리 화면
server/
  api/v0, v1/       [table] 동적 CRUD (lowDB / Supabase)
  middleware/       api-guard — 표 단위 인가
  routes/auth/      OAuth 콜백 · 세션
```

## 실행

```bash
bun install
bun run dev      # http://localhost:3000
```

`.env`에 `NUXT_SUPABASE_URL` · `NUXT_SUPABASE_ANON_KEY` · `NUXT_SUPABASE_SERVICE_ROLE_KEY` · `NUXT_PUBLIC_API_URL`이 필요하다. 전체 목록은 `nuxt.config.ts`의 `runtimeConfig`.

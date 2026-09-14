# TODO

## 상단 버튼바: `자동버튼s` vs 필드버튼 `position:'top'` 의 역할 정하기

`position:'top'` 이 탭과 무관해지면서(`useModelForm`) 두 채널이 **그리는 자리는 같아졌다.**
그래도 `자동버튼s` 는 못 없앤다 — 축이 다르다.

- `기본버튼s`(do로그·do초기화·do초안)는 상속으로 전 모델에 한 번에 깔린다
  (`BaseModels2.ts` 의 `protected get 기본버튼s()` → `자동버튼s = this.기본버튼s`).
  필드버튼으로 옮기면 모델마다 `자동필드ss` 에 3개씩 복붙해야 한다.
- `자동버튼s` 는 스펙에서 `onClick(model)` 을 직접 받아(`ORM.ts` 의 `i필드.onClick`) 모델 메서드가
  아닌 동작도 붙는다. 필드버튼은 키→메서드 배선뿐.

**정할 것**: "모델 개별 버튼은 필드버튼(`타입지정.버튼`)으로 새로 만들고, `자동버튼s` 에는 `기본버튼s` 만 남긴다" 로 방향을 굳힐지.
굳히면 `_CUSTOM/utils/models/ORM.ts` 의 `position` 주석과 `BaseModels2.기본버튼s` 위에 한 줄씩 적어둔다.
정리 대상은 `자동버튼s` 를 override 하는 **20곳**(test2 15 · v2 5)이다.

> 정정. 이 항목의 근거 하나가 없어졌다 —
> **`자동버튼s = []` 로 기본 3종을 끄는 용법은 이제 어디에도 없다** (`test2`·`v2` 둘 다 안 쓴다).
> 그래서 "필드버튼에는 상속 끄기가 없다"는 반대 논거는 지금 실사용 근거가 없다 —
> 되살리려면 새 사례가 필요하다.

## 그림 저장을 Supabase 로 옮긴다 — **지금 쓰는 것만** (2026-09-08)

`server/utils/storage.ts` 의 `saveImage()` 는 Supabase 를 먼저 치고 실패하면
`_CUSTOM/public/uploads/<dir>/` 에 떨군다. 그 폴백 주석에 「프로토타입/개발용」이라
적혀 있는데 **287장이 거기 쌓여 있었다** — 폴백으로만 돌았다는 뜻이다.

문제는 양이 아니라 **지우는 길이 없다**는 것이다. `server/api/v1/files/delete.ts` 는
Supabase 스토리지에서만 지운다. 로컬 `uploads/` 를 지우는 코드는 리포에 없다.
그림을 만들 때마다 파일이 남고 화면에서 버려도 파일은 앉는다 — 쓰기 전용 창고다.

`.gitignore` 라 깃에는 안 올라간다. 그래서 클론·CI 에는 값이 안 붙는다.
**값이 붙는 곳은 빌드다** — `dir.public` 이 `_CUSTOM/public` 이라 nitro 가 통째로 복사한다.
2026-09-07 빌드 실측: `.output` 362MB 중 `public/uploads` 가 **285MB(79%)**,
정작 앱 코드(`_nuxt`)는 9.5MB 였다. preset 이 `node-server` 라 `.output` 을 옮겨 띄우면
그때마다 같이 나간다.

**할 것**
1. 지금 localDB 가 실제로 가리키는 **56장**(55MB)만 Supabase 로 올리고, 그 행의 주소를
   Supabase URL 로 바꾼다. 어느 표가 가리키는지는 `characters`(16) · `assets`(13) ·
   `design-templates`(8) · `roles`(5) · `occasions`(4) 순.
2. 옮기고 나면 `_CUSTOM/public/uploads` 는 개발 폴백 전용으로 비워 둔다.
3. **삭제 짝을 만든다.** `saveImage` 가 있으면 `deleteImage` 도 있어야 한다 —
   지금은 Supabase 만 지우니 로컬은 영영 안 준다. 이걸 안 하면 다음 달에 또 쌓인다.

**같이 볼 것**: `@supabase/supabase-js` 를 서버 8곳이 직접 import 하는데
`package.json` 에 없다. `@nuxtjs/supabase`(nuxt.config 에선 모듈로 꺼져 있음)를 타고 온
전이 의존이라, 그 줄이 빠지면 로그인·업로드가 같이 죽는다. 옮길 때 같이 세울 것.

**안 쓰는 231장(202MB)은 `_아카이브/uploads/` 로 밀어 뒀다**(2026-09-08, 지운 게 아니다).
`.gitignore` 에 들어 있고, 원래 하위 폴더 구조 그대로다.
`ai/_trash`(94) · `ai/paper_frame`(59) · `ai/faces`(30) 순으로 많다.

## `creates`(bulk)가 `id`를 서버로 실어 보낸다 (2026-09-08)

`createDraft`(단건)는 PK를 **무조건** 지우고 보낸다 — `delete payload.id`. 만드는 요청이니
PK는 서버가 매기는 게 맞기 때문이다. 그런데 `creates`(bulk)는 조건이 붙어 있다:

```ts
// BaseModels2.creates
const payload = this.toApiPayload(item);
if (isClientPendingRowId(payload.id)) delete payload.id;   // ← pending 일 때만
```

`isClientPendingRowId` 는 `pending-*` 만 참이다. 그래서 그 밖의 값(시드가 적어둔 `'1001'`,
화면에서 복제해 온 행에 남은 옛 PK 등)은 **그대로 서버까지 나간다.**

지금 사고가 안 나는 이유는 어댑터가 떼주기 때문이다 —
`db_low.BulkCreate` 는 `withCreateMeta(item, ids[i])` 로 덮어쓰고,
`db_supabase.BulkCreate` 는 `const { id: _id, ...rest }` 로 뺀다.
즉 **안전이 클라이언트가 아니라 어댑터에 얹혀 있다.** 어댑터를 하나 더 만들거나
PostgREST 로 직접 올리는 길이 생기면 그 순간 시드 PK 가 DB 로 들어간다.

(스키마가 `generated always as identity` 라 그때는 조용히 들어가는 대신 에러로 터진다.
그건 다행이지만, 클라가 안 보내면 애초에 안 만날 일이다.)

**할 것**
1. `creates` 의 `if (isClientPendingRowId(...))` 조건을 걷고 `createDraft` 처럼 무조건 지운다.
   `creates(items: Omit<Dto,'id'>[])` 라 타입상으로도 PK 가 없는 게 맞다.
2. 걷은 뒤 `isClientPendingRowId` 가 아직 쓰이는 자리를 확인한다 —
   `identity.ts` 주석대로 `pending-*` 는 **이제 아무도 안 만든다**. 마지막 사용처가
   여기뿐이면 그 판정 자체를 지울 수 있다.

## 보안 — 인가가 한 겹인데 그 겹이 꺼져 있다 (2026-09-09)

어댑터가 service role 이라 RLS 는 우회되고(`POLICY` 는 SQL 세 파일에 한 줄도 없다),
막는 자리는 `api-guard` 하나뿐인데 그게 `warn` 이다. 아래 순서로 조인다.

1. `.env` 의 `NUXT_PUBLIC_IS_DEV=true` 를 운영에서 끈다 — `auth/dev/login` 의 404 가 그 플래그 하나에 걸려 있어, 켜진 채 나가면 `admin@local.dev` 가 비밀번호 없는 관리자 문이다.
2. `api/v1/files/*` 네 라우트에 인가를 붙인다 — 지금 **검사가 한 줄도 없다**(`api-guard` 는 `files` 를 면제하며 "자체 인가가 필요"라고만 적어뒀다). 버킷을 `'files'` 로 하드코딩해 실제 `bucket0` 을 못 찾는 덕에 안 터지는 것뿐이라, 그 줄을 고치는 순간 무인가 읽기·삭제가 산다.
3. `NUXT_TOSS_PAYMENTS_WEBHOOK_SECRET` 을 진짜 값으로 바꾸고 `webhook.post.ts` 의 `!== '1'` 센티널을 지운다 — 지금은 HMAC 검증을 통째로 건너뛴다.
4. `server/routes/api-etc/**` 를 `/api/` 아래로 옮기거나 별도 인가를 건다 — 경로가 `/api/` 로 시작하지 않아 `api-guard` 정규식에 **애초에 안 걸리고**, `ai/ask` 가 임의 프롬프트를 gemini 키로 무제한 태운다(리포에 rate limit 이 없다).
5. `warn` 로그를 며칠 모아 권한 구멍을 메운 뒤 `NUXT_API_GUARD=enforce` 로 올린다.
6. 안 읽히는 비밀 두 줄(`NUXT_JWT_SECRET`·`NUXT_SESSION_PASSWORD`)은 `.env` 에서 지운다 — 코드 어디서도 안 쓰는데 유출면만 된다.

**사설(깃헙·netlify·supabase 대체) 조건에서 같이 볼 것**: 자가호스팅 Supabase 가 대칭 HS256 이면
`do신원` 의 JWKS 로컬 검증 전제(ES256)가 깨지고 그 비밀 하나가 `service_role` 위조키가 된다.
`custom_access_token_hook` 도 대시보드 토글이 아니라 GoTrue 환경변수로 직접 걸어야 한다 —
안 걸리면 `app_metadata.gnbRoles` 가 늘 비어 전원 `guest` 다(5번을 올린 뒤엔 화면이 통째로 죽는다).

## 프로젝트 평가 요약 (2026-09-12)

에이전트 4개로 모델·서버·프론트·AI/문서를 훑고 lint·vue-tsc 를 실측했다. 보안은 고칠 수 있는 것이라
지금 시점 우선순위가 아니다(위 「보안」 절이 이미 정확하다 — 6항목 전부 코드와 일치 확인).
**지금 중요한 건 아이디어의 승산**이고, 그 축에서 본 결론은 아래와 같다.

**승산이 있는 근거 (이미 증명된 것)**
- 모델 한 벌(DTO·repo·row + `자동필드ss`)로 라우트·인가키·캐시·목록·상세·폼·챗봇 어휘가 따라온다.
  관리 화면 40개가 페이지당 약 40줄(`(admin)/fees.vue` 41줄). 새 도메인 추가 비용이 거의 0 — 이게 핵심 가설이고 **작동한다.**
- 챗봇: LLM에 실행권을 안 주고 턴마다 스키마 enum을 닫아 없는 선택지를 표현 불가능하게 만드는 설계(`aiV2/planner.ts:98-136`).
  lite 모델로도 버티는 이유다. MCP 안 쓰는 논거도 `aiV2/README.md` 에 있다.
- identity(PK/rowKey 분리)·표버전 재조회 게이트·SSR 페이로드 인계·요청 스코프 repo — 깨지기 쉬운 자리를 구조로 막았다.

**승산을 갉아먹는 것 (고칠수록 가설 검증이 빨라지는 순)**
1. **타입 강제 장치가 없다.** strict 켜놓고 typecheck 스크립트·`vue-tsc` 가 없어 앱 547건 · 서버 459건 오류가 쌓였다.
   진성 버그 포함: `BaseModels2.create`(`:534`)만 `toApiPayload` 를 건너뛰어 한글 모듈키가 서버로 나감,
   기반 클래스가 선언 안 된 `bindModel` 에 의존해 서브클래스 9곳이 `null as any`,
   `목록5.vue:194`·`_view필터조건.vue:122` 가 리포에 없는 `BaseModels` 타입을 import(→ repo prop 무타입),
   `view/1.ts:3` `type i필드 = any` 에서 모델 주도 축의 타입 안전성이 전부 샌다.
   → `bun add -d typescript vue-tsc` + `typecheck` 스크립트가 첫 걸음. 모델 코어(payload·identity·version)는 순수 함수라 vitest 로 바로 덮인다.
2. **v1/v2 가 양쪽 다 살아 있다.** 컴포넌트 세대 쌍 9개(`상세4↔5`, `AI_Copilot↔V2` 1,815줄, `캘린더↔2`, `List↔2`…),
   AI 파이프라인 4파일 두 벌, 라우트 v0/v1 복제, DB 둘(lowdb 13 repo / supabase 36 repo) 동시 가동.
   `layout-v2` 를 쓰는 실서비스 페이지는 0개(실험 12개뿐). `CLAUDE.md:5`「v2가 리뉴얼」↔ `aiV2/README.md:80`「v1이 실사용」이 반대다.
   → 어느 쪽이 정본인지 한 줄로 정하고 문서 둘을 맞춘다. 둘이 사는 기간만큼 드리프트가 는다(`TODO.md:47-48` 두 문장은 이미 거짓).
3. **서버 프로젝트 타입 오류 459건의 원인 = 공유 모델이 UI 를 부른다.** `_CUSTOM/models` 에서 `useAlert()` 124회 · 브라우저 `confirm()` 26회.
   서버·배치·테스트에서 모델을 못 돌리는 구조라, 승산 검증(시드 대량 생성·AI 평가 배치)에 바로 걸린다.
4. **스키마가 DTO 가 아니라 localDB 실값에서 생성**돼 행 0인 표는 DDL 에서 빠진다 — 모델 49개 중 14개가 `schema.sql` 에 없다
   (`fees`·`member-fees`·`payments`·`gradings`·`basics`…). 마이그레이션 부재, `drop cascade` 재생성이 유일한 변경 경로.
5. 죽은 코드 약 1,600줄 + 유령 의존성: `l/LayoutHero.vue`(687, 어느 레이아웃도 안 그림), `m/Map/*`+`vue3-naver-maps`,
   `Radios/*`·`File2`·`Stepper`·`Colorpicker2`·`useSaveShortcut`·`useHideOnScroll`, `better-sqlite3`(참조 0), `nuxt-og-image`(등록만),
   `@nuxt/content`(유틸 3개용). 페이지 83개 중 46개가 실험·데모·문서.

**실측 수치**: 소스 558파일 / 91,861줄 · ESLint 2,472(자동수정 1,828, 실질 535) · `any` 299 · 테스트 0 · CI 0 · 미커밋 85건.
**곁다리**: `BaseModels2.ts:48` 에 리터럴 NUL 바이트가 있어 `grep` 이 이 파일을 통째로 건너뛴다(`\u0000` 으로 바꿀 것).
`access-control.global.ts:45` 가 `/v2 /p /sandbox /decisions` 를 접근제어에서 빼는데 빌드 제외가 없어 운영에 그대로 노출된다.

## 클라이언트 첫 로드 4.4MB — 단일 청크 2MB 를 쪼갠다 (2026-09-12)

폰에서 dev 서버(`--host 0.0.0.0`)로 화면을 보다가 아무것도 안 눌려서 재봤다. dev 는 Vite 가
모듈을 낱개로 내보내 **요청 1,543건 / 35.0MB** 다 — 10Mbps 제한을 걸면 하이드레이션까지 **45초**,
그동안 SSR HTML 은 떠 있는데 탭은 하나도 안 먹는다(모바일 실기기에서 그렇게 보였다).
dev 를 폰으로 보는 건 애초에 안 맞으니 그건 `bun run build && bun run preview` 로 피하면 된다.

문제는 그 **preview 값**이다. 같은 조건에서 요청 101건 / **4.43MB** / 하이드레이션 4.2초:

| 종류 | 크기 |
|---|---|
| script | 3,145KB |
| stylesheet | 311KB |
| 기타(폰트·이미지) | 720KB |
| document(SSR HTML) | 133KB |

이 중 절반 이상이 **청크 하나**다 — `_nuxt/vwUe_EyS.js` 가 **2,002KB(gzip 620KB)**.
안에 `@supabase`(문자열 106회)·`highlight`(154회)·`pinia`·`tosspayments` 가 같이 뭉쳐 있고
다른 청크 여러 개가 이걸 물고 있어서 **사실상 어느 페이지를 가도 받는다**.

**배포 설정으로 해결되는 부분과 아닌 부분을 갈라 둔다.**
`nuxt preview` 는 Nitro 노드 서버가 자산을 **날것으로** 내보낸다(전 응답 `content-encoding` 없음).
실서버(nginx·Vercel·Cloudflare 등)는 gzip/brotli 가 기본이고 `max-age=31536000, immutable` 이
이미 붙어 있어 재방문은 네트워크를 거의 안 탄다. 실제로 압축해 재보면
`vwUe_EyS.js` 2,002→620KB · `X0yiU4rx.js` 588→184KB · `BGStX3CD.js` 492→150KB ·
`entry.css` 307→40KB 로, 첫 로드는 대략 **1.6~1.8MB** 로 내려간다(폰트·이미지는 이미 압축돼 안 준다).

**그래도 gzip 620KB 단일 청크는 남는다.** 이건 압축·CDN 밖이고 번들 구조 문제다.

**할 것**
1. `vwUe_EyS.js` 의 실제 구성부터 본다(지금 근거는 청크 안 문자열 빈도뿐이다 — `rollupOptions.output.manualChunks`
   를 붙이거나 `nuxi analyze` 로 정본 수치를 낸다).
2. 코드 하이라이터는 쓰는 자리에서만 동적 import 한다 — 지금은 전 페이지가 받는다.
3. `tosspayments` 는 결제 화면에서만 필요하다. 같은 방식으로 떼어낼 후보.
4. 떼어낸 뒤 같은 조건(10Mbps 제한 · 모바일 UA)에서 다시 재서 숫자를 이 항목에 덧붙인다.

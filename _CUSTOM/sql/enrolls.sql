-- ============================================================================
-- 신청 도메인 — `enrollables`(신청받기 = 회차) · `enrolls`(신청)
--
-- 2026-09-13 재설계(안 B). 설계 근거는 ERD/와이어프레임 산출물과 `enrolls/index.ts` 머리말.
--
-- 돌리는 순서: `schema.sql` → `tables.sql` → `schema.auth.sql`(members.isGuest) → **이 파일**. SQL 에디터에서 돌린다.
-- 두 번 돌아도 안전하다 — 표를 drop 후 create 하고, 트리거는 drop if exists 뒤에 건다.
-- (schema.sql 이 만드는 옛 표 다섯 — recruits·applications·questionnaires·questions·answers —
--  은 여기서 지운다. 생성기(`_생성기/gen-schema.mjs`)는 localDB 를 읽는데 그 축은 버렸다.)
--
-- ## 왜 이 모양인가
--
-- - **콘텐츠 표 다섯은 그대로**(surveys·quizzes·polls·classes·occasions). `/surveys = model설문s
--   = surveys` 사슬이 라우트·메뉴·인가를 공짜로 주기 때문이다.
-- - **신청받기는 콘텐츠 없이 못 산다.** `enrollables` 가 FK 다섯 중 **정확히 하나**를 채운다(check).
--   `ownerTable`·`ownerId` 는 그 다섯에서 **DB 가 계산하는 열**(generated) — 클라가 `대상표`
--   하나로 곧장 대상을 찾고, 유일 인덱스 `(ownerTable, ownerId, round)` 를 짧게 건다.
--   (id 가 bigint 라 표가 다르면 PK 가 겹친다. coalesce 만으로는 설문 3번과 퀴즈 3번이 부딪힌다.)
-- - **1회차는 트리거가 만든다.** 콘텐츠 행이 생기면 같은 트랜잭션에서 round 1 이 선다.
--   클라이언트 훅(`do모집자동생성`)이 순서대로 저장하던 시절엔 트랜잭션이 없어 고아·중복이 났다.
-- - **문항은 `questions` jsonb.** 문항세트·문항·응답 세 표를 없앴다. 답(`enrolls.answers`)은
--   배열 위치가 아니라 문항 `id`(JSON 안의 짧은 문자열)로 묶는다. 회차를 복사하면 id 가 따라간다.
-- - **비회원도 회원 행이 있다**(2026-09-14 변경). 비회원 신청은 Supabase 익명 로그인으로 `members`
--   한 행(`isGuest = true`)을 얻고 그 `memberId` 로 신청한다 — `enrolls` 에 비회원 갈래가 없다.
--   예전의 `guest*` 칸·전화번호 유일 인덱스는 `enrolls-guest-to-member.sql` 이 걷었다.
--   비회원 신청 검사(`allowGuest`)는 5) 트리거가, 정원 동시판정은 아직 안 건다(「나중」 절).
-- - **신청수는 열로 두지 않는다.** 읽을 때 센다(클라이언트가 `enrolls` 를 좁혀 받아 센다 —
--   `공개필드s.enrolls`). 카운터 열은 상태 전이·시드·직접 SQL 에서 어긋난다(`tables.sql` 5절).
--
-- 열 이름은 camelCase 를 따옴표로 감싼다(`tables.sql` 머리말과 같은 관례).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 0) 옛 표 정리
-- ---------------------------------------------------------------------------
drop table if exists public."answers" cascade;
drop table if exists public."questions" cascade;
drop table if exists public."questionnaires" cascade;
drop table if exists public."applications" cascade;
drop table if exists public."recruits" cascade;
-- 옛 세대의 같은 이름 표(어댑터 LMS 잔재). 모양이 달라 그대로 못 쓴다.
drop table if exists public."enrolls" cascade;
drop table if exists public."enrollables" cascade;

-- ---------------------------------------------------------------------------
-- 1) enrollables — 신청받기 = 회차
--
-- `not null default` 가 많은 건 schema.sql 관례("전부 nullable")와 다르다. 이유: 1회차를
-- **트리거가 FK 하나만 넣어** 만들므로, 나머지 칸은 DB 기본값이 의미 있는 값이어야 한다.
-- 정원 0 = 무제한(모델 `정원` 이 그렇게 읽는다).
-- ---------------------------------------------------------------------------
create table public."enrollables" (
  "id"                    bigint generated always as identity primary key,
  "createdAt"             timestamptz not null default now(),

  "surveyId"              bigint references public."surveys"("id")   on delete cascade,
  "quizId"                bigint references public."quizzes"("id")   on delete cascade,
  "pollId"                bigint references public."polls"("id")     on delete cascade,
  "classId"               bigint references public."classes"("id")   on delete cascade,
  "occasionId"            bigint references public."occasions"("id") on delete cascade,

  -- 다섯 FK 에서 계산. 클라는 이 둘을 **읽기만** 한다(`model신청받기s.etcFields`) —
  -- generated 열에 값을 실어 보내면 PostgREST 가 거절한다.
  "ownerTable" text generated always as (
    case
      when "surveyId"   is not null then 'surveys'
      when "quizId"     is not null then 'quizzes'
      when "pollId"     is not null then 'polls'
      when "classId"    is not null then 'classes'
      when "occasionId" is not null then 'occasions'
    end
  ) stored,
  "ownerId" bigint generated always as (
    coalesce("surveyId", "quizId", "pollId", "classId", "occasionId")
  ) stored,

  "round"                 integer     not null default 1,
  "applicationStartDate"  timestamptz not null default now(),
  "applicationEndDate"    timestamptz not null default (now() + interval '30 days'),
  "usageStartDate"        timestamptz not null default now(),
  "usageEndDate"          timestamptz not null default (now() + interval '90 days'),
  "maxParticipants"       integer     not null default 0,
  "priceType"             text        not null default 'FREE',
  "price"                 integer     not null default 0,
  -- 공개 상태(PREPARING·PUBLISHED·HIDDEN·COMPLETED). 「신청받는 중」은 열이 아니라 기간·정원·공개로 계산한다.
  "status"                text        not null default 'PREPARING',
  -- 문항 배열. 퀴즈 정답(answerKey)도 당분간 여기(설계 미결 — enroll-redesign 메모).
  "questions"             jsonb       not null default '[]'::jsonb,
  "allowGuest"            boolean     not null default false,

  constraint enrollables_one_owner check (
    ("surveyId" is not null)::int + ("quizId" is not null)::int + ("pollId" is not null)::int
    + ("classId" is not null)::int + ("occasionId" is not null)::int = 1
  ),
  constraint enrollables_round_positive check ("round" >= 1)
);

-- 같은 콘텐츠에 같은 회차 번호는 하나. 시드를 두 번 돌리거나 저장을 두 번 눌러도 1차가 둘이 안 된다.
create unique index enrollables_owner_round on public."enrollables" ("ownerTable", "ownerId", "round");

-- ---------------------------------------------------------------------------
-- 2) 1회차 자동 생성 — 콘텐츠 표 다섯에 AFTER INSERT 트리거 하나씩
--
-- FK 열 이름을 트리거 인자로 받는다. 나머지 칸은 표 기본값. 시드는 이 행을 UPDATE 로 채운다.
-- bulk INSERT(PostgREST 배열)도 행마다 돈다(for each row).
-- ---------------------------------------------------------------------------
create or replace function public.enrollable_round1() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  execute format('insert into public."enrollables" (%I, "round") values ($1, 1)', tg_argv[0])
    using new.id;
  return null;
end $$;

drop trigger if exists _enrollable_round1 on public."surveys";
create trigger _enrollable_round1 after insert on public."surveys"
  for each row execute function public.enrollable_round1('surveyId');

drop trigger if exists _enrollable_round1 on public."quizzes";
create trigger _enrollable_round1 after insert on public."quizzes"
  for each row execute function public.enrollable_round1('quizId');

drop trigger if exists _enrollable_round1 on public."polls";
create trigger _enrollable_round1 after insert on public."polls"
  for each row execute function public.enrollable_round1('pollId');

drop trigger if exists _enrollable_round1 on public."classes";
create trigger _enrollable_round1 after insert on public."classes"
  for each row execute function public.enrollable_round1('classId');

drop trigger if exists _enrollable_round1 on public."occasions";
create trigger _enrollable_round1 after insert on public."occasions"
  for each row execute function public.enrollable_round1('occasionId');

-- ---------------------------------------------------------------------------
-- 3) enrolls — 신청
--
-- status: PENDING(대기) · APPROVED(승인) · REJECTED(반려) · SUBMITTED(제출, 문답물) · CANCELED(취소)
-- **자리를 먹는 상태 = PENDING + APPROVED.** 세는 규칙의 정본은 클라 `types.ts`(`자리차지상태s`)다 —
-- 정원 트리거를 걸 때 같은 집합을 SQL 함수로 옮긴다.
--
-- FK 가 cascade 인 이유: 회차가 지워진 신청, 회원이 지워진 신청은 의미가 없고,
-- `memberId` 가 not null 이라 `set null` 이면 회원 삭제 자체가 막힌다.
-- ---------------------------------------------------------------------------
create table public."enrolls" (
  "id"              bigint generated always as identity primary key,
  "createdAt"       timestamptz not null default now(),
  "enrollableId"    bigint not null references public."enrollables"("id") on delete cascade,
  -- 비회원도 회원 행이 있으므로 늘 채워진다(`members.isGuest`).
  "memberId"        bigint not null references public."members"("id") on delete cascade,
  -- 답. `{ [문항id]: string[] }` — 선택형은 선택지 value 들, 자유입력은 `[입력값]`.
  "answers"         jsonb not null default '{}'::jsonb,
  "status"          text  not null default 'PENDING',
  "submittedAt"     timestamptz
);

-- 회원(비회원 포함)은 한 회차에 한 번.
create unique index enrolls_member_once on public."enrolls" ("enrollableId", "memberId");
-- 신청수 세기·회차별 목록.
create index enrolls_by_enrollable on public."enrolls" ("enrollableId", "status");

-- ---------------------------------------------------------------------------
-- 4) 등록부 번호 트리거 + 개수 판 — `tables.sql` 3)·5) 와 같은 것을 새 표에만 다시 건다
-- ---------------------------------------------------------------------------
do $$
declare t text;
begin
  if not exists (select 1 from pg_proc where proname = 'bump_table_version') then
    raise notice 'tables.sql 을 먼저 돌리세요 — bump_table_version 이 없습니다.';
    return;
  end if;
  foreach t in array array['enrollables', 'enrolls'] loop
    execute format(
      'create or replace trigger _bump_version after insert or update or delete on public.%I
         for each statement execute function public.bump_table_version()', t);
    execute format(
      'create or replace trigger _bump_version_truncate after truncate on public.%I
         for each statement execute function public.bump_table_version()', t);
  end loop;
  if exists (select 1 from pg_proc where proname = 'rebuild_table_counts') then
    perform public.rebuild_table_counts();
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 5) 비회원 신청 검사 — enrolls BEFORE INSERT
--
-- 신청한 회원이 비회원(`members.isGuest`)이면 그 회차가 `allowGuest` 일 때만 받는다.
-- 어댑터가 service role 이라 RLS 는 우회되므로 트리거가 맞는 자리다. 기간·정원은 여기서 안 본다
-- (회원과 같은 규칙이라 비회원만의 검사가 아니다 — 정원은 아래 「나중」).
-- ---------------------------------------------------------------------------
create or replace function public.enroll_guest_check() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if exists (select 1 from public."members" m where m."id" = new."memberId" and m."isGuest")
     and not exists (select 1 from public."enrollables" e where e."id" = new."enrollableId" and e."allowGuest") then
    raise exception '비회원 신청을 받지 않는 회차입니다.' using errcode = 'P0001';
  end if;
  return new;
end $$;

drop trigger if exists _enroll_guest_check on public."enrolls";
create trigger _enroll_guest_check before insert on public."enrolls"
  for each row execute function public.enroll_guest_check();

-- ---------------------------------------------------------------------------
-- 나중 (지금 단계에서는 안 건다 — 아이디어 검증이 먼저다)
--
-- - 정원 동시판정: enrolls BEFORE INSERT 에서 enrollables 행을 `for update` 로 잠그고
--   PENDING+APPROVED 수 < maxParticipants(0 이면 무제한)일 때만 통과.
-- ---------------------------------------------------------------------------

-- 확인:
--   select "ownerTable", "ownerId", "round", "status" from public."enrollables" order by 1, 2, 3;
--   select name, count from public."table-counts" where name in ('enrollables', 'enrolls');

-- ============================================================================
-- 표 등록부(`tables`) — 표별 변경 번호
--
-- v1(supabase)에서 **돌아가고 있다.** 이 파일을 고치면 SQL 에디터에서 다시 돌린다 —
-- 아래 5) 의 뷰는 `create or replace` 가 아니라 drop 후 create 라 두 번 돌아도 안전하다.
-- lowDB(`/api/v0`) 축에서는 같은 모양을 `db_low` 가 손으로 만든다(`do버전올림`·`표개수판`).
--
-- 왜 개수가 아니라 번호인가: 개수는 *추가·삭제로 원래 수로 돌아온* 상태를 구분하지 못한다.
-- 번호는 쓰기마다 오르므로 "1개 남은 상태"와 "추가·삭제·추가로 1개 남은 상태"가 갈린다.
-- ============================================================================

-- 열 이름이 영문인 이유: `BaseModels2.toApiPayload` 가 **한글 키를 서버로 안 보낸다**
-- (한글 키 = 모듈이 붙인 값이라는 규약). 사람이 읽는 이름은 모델 게터가 진다(`세는단위`).
-- camelCase 는 따옴표로 감싼다 — Postgres 는 안 감싸면 소문자로 접는다(`menus` 도 같은 관례).
create table if not exists public.tables (
  id            bigint      generated always as identity primary key,
  name          text        not null unique,
  version       bigint      not null default 0,
  unit          text        not null default '개',
  "isHierarchy" boolean     not null default false,
  "createdAt"   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 1) 번호 올리기
--
-- `for each statement` 이라 100행짜리 bulk 도 1만 오른다. 클라가 알아야 하는 건
-- "몇 행이 바뀌었나"가 아니라 "바뀌었나"라서다.
--
-- 한 가지 알아둘 것: statement 트리거는 **0행을 건드린 문장에서도 뜬다.** 아무것도 안 바뀌었는데
-- 번호가 오르는 경우가 있고, 그러면 클라가 한 번 더 받는다 — 놓치는 쪽이 아니라 더 받는 쪽이다.
-- ---------------------------------------------------------------------------
create or replace function public.bump_table_version() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.tables (name, version) values (tg_table_name, 1)
  on conflict (name) do update set version = public.tables.version + 1;
  return null;
end $$;

-- ---------------------------------------------------------------------------
-- 2) 번호는 기계만 쓴다
--
-- 관리자가 이 행의 다른 칸을 고쳐 저장하면 클라가 들고 있던 **낡은 번호가 딸려 나온다**
-- (`BaseModels2.toApiPayload` 는 모르는 열도 그대로 실어 보낸다). 그 한 번에 모든
-- 클라이언트의 캐시 판정이 조용히 틀린다. 앱에서도 막지만(`model테이블.etcFields`),
-- SQL 에디터·다른 클라이언트는 앱을 안 거치므로 진짜 방어는 여기다.
--
-- `pg_trigger_depth() > 1` 은 **위 `bump_table_version` 이 낸 UPDATE 만 통과**시킨다.
-- 그게 없으면 bump 의 `on conflict do update` 가 이 트리거에 되감겨 번호가 안 오른다.
-- ---------------------------------------------------------------------------
create or replace function public.keep_table_version() returns trigger
language plpgsql as $$
begin
  if pg_trigger_depth() > 1 then return new; end if;
  new.version := old.version;
  return new;
end $$;

drop trigger if exists _keep_version on public.tables;
create trigger _keep_version before update on public.tables
for each row execute function public.keep_table_version();

-- ---------------------------------------------------------------------------
-- 3) public 의 모든 표에 붙이기 (`tables` 자신은 뺀다)
--
-- 등록부 자신에 붙이면 **남의 쓰기마다 자기 번호가 올라** 매번 무효화된다. 이 표는 판정의
-- 뿌리라 늘 새로 읽는 쪽이고, 그래서 번호를 안 단다.
-- 표를 새로 만들면 이 블록을 다시 돌린다(`if not exists` 라 두 번 돌아도 안전).
-- ---------------------------------------------------------------------------
do $$
declare t record;
begin
  for t in
    select c.relname
    from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind = 'r' and c.relname <> 'tables'
  loop
    execute format(
      'create or replace trigger _bump_version after insert or update or delete on public.%I
         for each statement execute function public.bump_table_version()', t.relname);
    execute format(
      'create or replace trigger _bump_version_truncate after truncate on public.%I
         for each statement execute function public.bump_table_version()', t.relname);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- 4) 행은 **앱이 채운다**
--
-- 여기서 `pg_class` 를 훑어 미리 넣지 않는다. 행 목록의 정본이 두 곳(DB 카탈로그와
-- `model테이블s.seed`)이 되면 어긋나고, 어긋난 쪽이 권한 어휘가 되기 때문이다.
-- `세는단위`·`isHierarchy` 같은 값은 애초에 카탈로그가 모르는 것이기도 하다.
--
-- 그래서 이 표는 **비어 있는 채로 시작**하고, 관리자가 `/admin/setup` 초기데이터를 돌리면 채워진다.
-- 그 전까지는 행이 없으니 클라가 "모름"으로 받아 지금까지처럼 매번 목록을 받는다.
--
-- 위 bump 트리거의 `on conflict ... insert` 는 남겨 둔다 — 시드에 없는 표에 쓰기가 들어와도
-- 번호는 세야 하고, 그때는 `세는단위` 없이 이름과 번호만 있는 행이 생긴다.
-- ---------------------------------------------------------------------------

-- 확인:  select name, version from public.tables order by name;

-- ---------------------------------------------------------------------------
-- 5) 개수 판 — `"table-counts"` 뷰
--
-- 등록부의 **모든 열 + `count`**. 개수만 담으면 화면이 등록부를 따로 한 번 더 읽어야 해서
-- 왕복이 안 준다. 열을 다 이어야 요약 화면이 **한 번**에 끝난다.
--
-- ## 왜 `tables` 에 열로 안 붙였나
--
-- 등록부는 **초당 강제로 읽히는 표**다(`model테이블.ts` 의 `표버전.공급자등록` → `reads(force)`,
-- 1초 게이트). 개수를 그 행에 얹으면 "바뀌었나"를 물을 때마다 표 서른몇 개를 세게 된다.
-- 제일 자주 묻는 질문이 제일 싸야 한다 — 그래서 같은 데이터를 **판 둘로** 두고, 비싼 판은
-- 부르는 쪽만 물게 한다.
--
-- ## 왜 트리거 카운터가 아닌가
--
-- `INSERT/DELETE` 에서 ±1 하면 읽기가 O(1) 이지만 `TRUNCATE`·`COPY`·앱을 안 거치는 경로에서
-- 어긋난다. **틀린 숫자는 없는 숫자보다 나쁘다** — 요약 화면이 방금 「0」과 「못 셈」을 가른
-- 이유가 그거다. 그래서 읽을 때 센다.
--
-- ## 이름 목록을 SQL 에 안 적는 이유
--
-- `union all` 을 손으로 박으면 표가 늘 때마다 사람이 여기를 고쳐야 한다 — 등록부를 만든 취지에
-- 정면으로 어긋난다. 그래서 **등록부를 읽어 뷰를 짜는 함수**를 둔다. 위 3) 블록과 같은 관례고,
-- 표를 새로 만들면 둘을 같이 돌린다.
--
-- ## 없는 표가 「못 셈」이 되는 곳
--
-- union 은 `pg_class` 와 조인하므로 **실제로 존재하는 표만** 센다. 그리고 등록부에 그걸
-- **`left join`** 한다 — 등록부엔 있는데 DB 엔 없는 표(`gradings`·`basics`·`member-gradings`·
-- `per-gradings`)가 `count = null` 로 남는다.
--
-- `inner join` 이면 그 표들이 뷰에서 **사라진다.** 그러면 화면이 "스키마가 등록부보다 뒤처져
-- 있다"는 사실을 못 보여준다 — 안 보이는 것과 0 은 똑같이 나쁘다. `null` 이라야 「못 셈」이 선다.
--
-- 권한/RLS 절이 없는 건 어댑터가 **service role** 을 쓰기 때문이다(`db_supabase.getClient`).
-- 인가는 앱이 진다 — `api-guard` 의 `table-counts:read`.
-- ---------------------------------------------------------------------------
create or replace function public.rebuild_table_counts() returns void
language plpgsql security definer set search_path = public as $$
declare 절 text;
begin
  select string_agg(
           format('select %L::text as name, count(*)::bigint as count from public.%I', t.name, t.name),
           ' union all ' order by t.name)
    into 절
  from public.tables t
  join pg_class c on c.relname = t.name
  join pg_namespace n on n.oid = c.relnamespace and n.nspname = 'public'
  where c.relkind = 'r';

  -- 등록부가 아직 비어 있으면 **빈 뷰**를 세운다. 뷰 자체가 없으면 화면이 404 로 죽는데,
  -- 여기서 알아야 할 답은 "아직 아무것도 안 셌다"이지 "이런 자원이 없다"가 아니다.
  if 절 is null then
    절 := 'select null::text as name, null::bigint as count where false';
  end if;

  -- `create or replace view` 는 열 구성이 바뀌면 거절한다. `tables` 에 열이 늘면 그 순간
  -- 이 함수가 서므로 drop 후 create 한다.
  execute 'drop view if exists public."table-counts"';
  execute format(
    'create view public."table-counts" as
       select t.*, c.count from public.tables t left join (%s) c on c.name = t.name',
    절);
end $$;

select public.rebuild_table_counts();

-- 확인:  select name, count, version from public."table-counts" order by count desc;

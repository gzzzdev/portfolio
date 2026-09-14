-- ==========================================================================
-- 인증 축 스키마. Supabase 대시보드 → SQL Editor 에서 한 번 돌린다.
-- (`_CUSTOM/sql/schema.sql`은 localDB에서 생성되는 도메인 표 36개고, 이건 손으로 든다 —
--  `auth` 스키마는 Supabase가 소유해서 생성기가 볼 수 있는 localDB에 대응물이 없다.)
--
-- 설계:
--  - 신원은 `auth.users`(Supabase Auth)가 소유한다. 이메일·비밀번호·소셜 연동·토큰 갱신이 거기 있다.
--  - `public.users`는 그 신원과 도메인 회원(`members`)을 잇는 표다. 회원과 1:1.
--  - **`users.id`는 bigint를 유지한다.** 표준 예제는 `profiles.id uuid = auth.users.id` 인데,
--    이 리포의 ORM은 `BaseModel2.compareTo`가 `Number(stateId)`로 정렬하고
--    「PK 큰 순 = 최신순」이 문서화된 불변식이다(`_CUSTOM/sql/schema.sql` 머리말). uuid를 PK로 쓰면
--    그 뺄셈이 NaN이 되어 모든 목록의 정렬이 조용히 무너진다.
--    그래서 연결은 `authId uuid unique references auth.users(id) on delete cascade`가 진다 —
--    참조 대상이 `auth.users`의 PK라는 표준 요건은 그대로 지킨다.
--  - 같은 선택 덕에 **v0(lowdb)와 모양이 안 갈린다.** 시드는 양쪽에 똑같이 들어가고,
--    `authId`만 v1에서 나중에 채워진다.
-- ==========================================================================


-- ──────────────────────────────────────────────────────────────────────
-- 1. auth_users 폐기
--
-- 네이버 로그인이 쓰던 표. `member_id`를 따로 들고 있어서 `users`와 **같은 질문에 두 번 답한다.**
-- 실제로 그 한 행의 `member_id`(=7)는 어느 회원도 가리키지 않는 끊긴 FK였다.
-- 신원은 `auth.users`, 연결은 `public.users` 하나로 모은다.
-- ──────────────────────────────────────────────────────────────────────
drop table if exists "auth_users" cascade;


-- ──────────────────────────────────────────────────────────────────────
-- 2. users ↔ auth.users 연결
-- ──────────────────────────────────────────────────────────────────────
alter table "users"
  add column if not exists "authId" uuid;

-- 계정 하나에 신원 하나. 같은 소셜 계정이 회원 둘로 갈라지는 걸 DB가 막는다.
create unique index if not exists "users_authId_key" on "users" ("authId");

-- `auth.users` 행이 지워지면 연결도 함께 지운다(표준 권장).
-- `memberId`는 `on delete set null`이다 — 계정을 지워도 도메인 회원 기록은 남아야 한다.
alter table "users"
  drop constraint if exists "users_authId_fkey";
alter table "users"
  add constraint "users_authId_fkey"
  foreign key ("authId") references auth.users(id) on delete cascade;

-- 로그인이 이메일로 계정을 찾는다.
create unique index if not exists "users_email_key" on "users" (lower("email"));


-- ──────────────────────────────────────────────────────────────────────
-- 3. 역할을 JWT에 싣는다 — Custom Access Token Hook
--
-- 지금 `server/utils/auth-jwt.signJwt({ gnbRoles })`가 하던 일을 DB가 대신한다.
-- 이게 없으면 토큰에 역할이 없어서 `api-guard`가 모든 요청을 guest로 판정한다
-- (네이버 로그인이 정확히 그 상태였다).
--
-- 역할은 `members`의 열이 아니라 `member-entity-historys`의 **끝나지 않은 이력**이다.
-- ──────────────────────────────────────────────────────────────────────
create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
security definer set search_path = ''
as $$
declare
  claims    jsonb;
  role_codes text[];
begin
  select coalesce(array_agg(distinct r."code"), '{}')
    into role_codes
  from public."users" u
  join public."member-entity-historys" h
    on h."memberId" = u."memberId"
   and h."endDate" is null
   and h."roleId" is not null
  join public."roles" r
    on r."id" = h."roleId"
  where u."authId" = (event->>'user_id')::uuid;

  claims := event->'claims';

  -- `app_metadata`는 사용자가 못 고치는 자리다(`user_metadata`와 다른 점).
  -- 역할을 거기 두지 않으면 클라이언트가 자기 역할을 바꿔 보낼 수 있다.
  if claims->'app_metadata' is null then
    claims := jsonb_set(claims, '{app_metadata}', '{}'::jsonb);
  end if;
  claims := jsonb_set(claims, '{app_metadata,gnbRoles}', to_jsonb(role_codes));

  return jsonb_set(event, '{claims}', claims);
end;
$$;

grant execute on function public.custom_access_token_hook to supabase_auth_admin;
revoke execute on function public.custom_access_token_hook from authenticated, anon, public;

-- 훅이 읽어야 하는 표들. `security definer`라도 소유자 권한으로 도는 것이지
-- 대상 롤에 grant가 없으면 못 읽는다.
grant usage on schema public to supabase_auth_admin;
grant select on public."users", public."member-entity-historys", public."roles"
  to supabase_auth_admin;

-- ⚠️ 함수를 만든 뒤 **대시보드에서 켜야** 동작한다:
--    Authentication → Hooks → Customize Access Token (JWT) Claims
--    → Postgres 함수 `public.custom_access_token_hook` 선택


-- ──────────────────────────────────────────────────────────────────────
-- 4. 소셜 신규 가입 시 회원·계정 자동 생성
--
-- 구글/카카오/네이버로 처음 들어온 사람은 `auth.users` 행만 있고 도메인 회원이 없다.
-- 그 상태로는 역할 조회가 빈 배열이라 guest로 떨어진다.
--
-- 이미 같은 이메일의 계정이 있으면(= 클릭로그인 시드 계정) **회원을 새로 만들지 않고 연결만** 한다.
-- 없으면 회원 한 행을 만들고 계정을 잇는다. 역할은 여기서 안 준다 —
-- 기본 역할 부여는 앱(`model회원.afterCreate`)이 이미 가진 규칙이고, 두 곳에서 주면 갈라진다.
--
-- **익명 로그인(비회원)도 이 길을 탄다**(2026-09-14). `signInAnonymously({ options: { data: { name, phone } } })`
-- 로 들어오면 이메일이 없고 `is_anonymous` 가 참이다 — 회원 행을 `isGuest = true` 로 만들고
-- 이름·연락처를 메타데이터에서 옮긴다. 비회원의 신원은 **그 브라우저의 익명 세션**이고,
-- 전화번호는 신원이 아니라 연락처다(같은 번호라고 합치지 않는다).
-- ──────────────────────────────────────────────────────────────────────
alter table public."members"
  add column if not exists "phone"   text,
  add column if not exists "isGuest" boolean not null default false;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
declare
  existing_user_id bigint;
  new_member_id    bigint;
begin
  if new.email is not null then
    select u."id" into existing_user_id
    from public."users" u
    where lower(u."email") = lower(new.email)
    limit 1;
  end if;

  if existing_user_id is not null then
    update public."users" set "authId" = new.id where "id" = existing_user_id;
    return new;
  end if;

  insert into public."members" ("name", "phone", "isGuest")
  values (
    coalesce(new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'full_name',
             case when new.is_anonymous then '비회원' else '이름없음' end),
    nullif(regexp_replace(coalesce(new.raw_user_meta_data ->> 'phone', ''), '\D', '', 'g'), ''),
    coalesce(new.is_anonymous, false)
  )
  returning "id" into new_member_id;

  insert into public."users" ("email", "memberId", "authId")
  values (new.email, new_member_id, new.id);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_auth_user();


-- ──────────────────────────────────────────────────────────────────────
-- 5. 비회원 → 회원 전환 (익명 세션에 소셜 계정을 잇는다)
--
-- 비회원이 `linkIdentity` 로 구글 등을 이으면 **`auth.users` 행이 그대로고 id 도 그대로**다 —
-- INSERT 가 아니라 UPDATE 라 위 트리거는 안 돈다. 그래서 여기서 계정에 이메일을 채우고
-- 회원의 `isGuest` 를 끈다. 회원 행이 그대로라 비회원 때 낸 신청이 **합칠 것 없이** 이어진다.
--
-- 이미 가입된 소셜 계정은 Supabase 가 잇기를 거부한다(identity_already_exists). 그 경우는
-- 그냥 로그인하게 되고 비회원 쪽 신청은 따로 남는다 — 드문 경우라 지금은 운영자가 본다.
-- ──────────────────────────────────────────────────────────────────────
create or replace function public.handle_auth_user_linked()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  if coalesce(old.is_anonymous, false) and not coalesce(new.is_anonymous, false) then
    update public."users" set "email" = new.email where "authId" = new.id;
    update public."members" m set "isGuest" = false
      from public."users" u
     where u."authId" = new.id and m."id" = u."memberId";
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_linked on auth.users;
create trigger on_auth_user_linked
  after update of is_anonymous on auth.users
  for each row execute procedure public.handle_auth_user_linked();

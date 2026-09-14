-- ============================================================================
-- 마이그레이션 (2026-09-14) — 비회원 신청을 `enrolls.guest*` 에서 「비회원 회원 행」으로
--
-- `enrolls.sql` 은 표를 drop 후 create 하므로 **데이터가 있는 DB 에 다시 돌리면 신청이 날아간다.**
-- 이미 그 파일을 돌린 DB 는 이것만 돌린다. 새로 까는 DB 는 `enrolls.sql` 만으로 이 모양이 된다.
--
-- 돌리는 순서: `schema.auth.sql`(members.phone·isGuest + 트리거 두 개) → **이 파일**.
-- 두 번 돌아도 안전하다.
--
-- 대시보드에서 켤 것 두 가지(SQL 로 못 켠다):
--   Authentication → Sign In / Providers → **Allow anonymous sign-ins**
--   Authentication → Sign In / Providers → **Allow manual linking** (비회원 → 소셜 계정 잇기)
-- ============================================================================

-- 비회원 칸으로 들어온 신청은 옮길 회원이 없다. 이 시점엔 비회원 신청 화면이 없었으므로 0건이어야 한다.
delete from public."enrolls" where "memberId" is null;

alter table public."enrolls" drop constraint if exists enrolls_who;
drop index if exists public.enrolls_guest_once;
alter table public."enrolls"
  drop column if exists "guestName",
  drop column if exists "guestPhone",
  drop column if exists "guestTokenHash";
alter table public."enrolls" alter column "memberId" set not null;

-- 부분 인덱스(where memberId is not null)였던 것을 전체로. memberId 가 늘 있으니 조건이 필요 없다.
drop index if exists public.enrolls_member_once;
create unique index enrolls_member_once on public."enrolls" ("enrollableId", "memberId");

-- 비회원 신청 검사 트리거 — `enrolls.sql` 5) 와 같은 것.
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

-- 확인:
--   select column_name from information_schema.columns where table_name = 'enrolls' order by ordinal_position;
--   select column_name from information_schema.columns where table_name = 'members' and column_name in ('phone', 'isGuest');

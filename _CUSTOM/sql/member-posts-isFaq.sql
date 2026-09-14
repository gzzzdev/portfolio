-- ============================================================================
-- 마이그레이션 (2026-09-15) — 게시글의 「자주 묻는 질문」 표시
--
-- 옛 `faq` 게시판을 걷고 `qna` 하나로 합치면서, 자주 묻는 것인지는 **글**이 가른다(`model게시판.seed`).
-- 모델(`model회원게시글.isFaq`)과 시드는 이미 이 열을 쓰는데 supabase 에만 없어서,
-- lowDB → supabase 이관 때 이 열이 PostgREST 400 으로 막힌다.
--
-- `schema.sql` 에는 생성기가 이미 넣어 두었다(localDB 값에서 뽑힘). 여기는 살아 있는 DB 에 붙이는 한 줄이다.
-- 두 번 돌아도 안전하다.
-- ============================================================================

alter table public."member-posts"
  add column if not exists "isFaq" boolean not null default false;

-- PostgREST 가 새 열을 바로 보게 스키마 캐시를 갱신한다.
notify pgrst, 'reload schema';

-- 확인:
--   select "id", "title", "isFaq" from public."member-posts" order by "id" desc limit 5;

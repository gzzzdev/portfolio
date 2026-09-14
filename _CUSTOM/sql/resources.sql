-- ============================================================================
-- 자료(`resources`) — lowDB(`/api/v0`)에서 supabase 로 올린다 (2026-09-14)
--
-- 돌리는 순서: `schema.sql` → `tables.sql` → **이 파일**. SQL 에디터에서 돌린다.
-- 두 번 돌아도 안전하다 — 전부 `if exists` / `if not exists` 다.
--
-- ## 왜 이 파일이 따로 있나
--
-- `schema.sql` 은 생성기가 `localDB/*.json` 에서 뽑는데, 자료는 이제 localDB 에 살지 않는다.
-- 옛 세대 표가 supabase 에 먼저 서 있었고(칸: kind·keywords·sourceName·publishedAt), 모델은
-- 그 칸들을 걷고 태그를 문자열 배열로 바꿨다(`model자료.ts` 머리말). 표를 drop 하지 않고
-- 칸만 맞추는 건 이미 올린 행을 살리기 위해서다.
-- ============================================================================

-- 1) 모델이 걷은 옛 칸
alter table public."resources" drop column if exists "kind";
alter table public."resources" drop column if exists "keywords";
alter table public."resources" drop column if exists "sourceName";
alter table public."resources" drop column if exists "publishedAt";

-- 2) 태그 — `model자료.태그s` (string[]). 다른 배열 칸과 같이 jsonb(`schema.sql` 의 `appearance` 등).
--    `not null default '[]'` 인 건 모델이 `?? []` 로 읽긴 하지만 SQL 로 넣은 행에도 빈 배열이 서게.
alter table public."resources" add column if not exists "tags" jsonb not null default '[]'::jsonb;

-- 3) 새로 만든 표가 아니라 트리거는 이미 붙어 있다(`tables.sql` 3절). 혹시 표를 다시 만들었다면
--    그 블록을 다시 돌릴 것 — 안 붙으면 등록부 번호가 안 올라 목록이 조용히 굳는다.

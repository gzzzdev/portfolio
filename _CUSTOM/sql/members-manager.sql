-- ============================================================================
-- 마이그레이션 (2026-09-14) — 교수자 역할을 걷고 「담당자」(중간관리자)로
--
-- 담당은 콘텐츠가 아니라 **회원**에 붙는다. 운영자가 회원마다 담당자 한 명을 지정하고(`members.managerId`),
-- 담당자는 자기 담당 회원의 신청·상태·등급을 처리한다. 무엇을 할 수 있는지는 역할 권한(`/admin/roles`),
-- 누구에게 할 수 있는지는 이 열이 정한다. 서버는 아직 「내 담당만」을 막지 않는다 — 화면이 거른다.
--
-- `schema.sql` 은 localDB 생성기가 뽑는 옛 축이라 여기 열·FK 를 넣지 않는다(`enrolls.sql` 과 같은 처지).
-- 두 번 돌아도 안전하다.
-- ============================================================================

-- 1) 담당자 열. 담당자 회원이 지워지면 담당이 풀린다.
alter table public."members"
  add column if not exists "managerId" bigint;

alter table public."members" drop constraint if exists "members_managerId_fkey";
alter table public."members"
  add constraint "members_managerId_fkey" foreign key ("managerId") references public."members"("id") on delete set null;

create index if not exists members_manager on public."members" ("managerId");

-- 2) 역할 코드 teacher → manager. 역할 이력은 roleId 로 붙어 있어 그대로 따라온다.
--    권한은 앱 시드(`model역할.seed` 의 manager)와 같은 기본값 — 콘텐츠·신청받기 만들기를 걷는다. 이후엔 `/admin/roles` 에서 고친다.
update public."roles"
   set "code" = 'manager', "label" = '담당자', "labelEn" = 'Manager', "icon" = 'i-ph:user-focus-light', "thumbnail" = null,
       "description" = '운영자가 맡긴 회원(members.managerId)의 신청·상태·등급을 처리하는 중간관리 역할.',
       "permissions" = '[
         "boards:read", "classes:read", "enrollables:read", "enrolls:read", "enrolls:update",
         "grade-conditions:read", "grades:read",
         "member-entity-historys:create", "member-entity-historys:read", "member-entity-historys:update",
         "member-fees:read", "member-posts:read", "member-status-historys:create", "member-status-historys:read",
         "members:read", "members:update", "menus:read", "occasions:read", "payments:read",
         "polls:read", "quizzes:read", "resources:read", "roles:read", "surveys:read"
       ]'::jsonb
 where "code" = 'teacher';

-- 3) 메뉴의 접근역할. `/teacher` 행은 `/admin/own-enrolls`(담당신청)로 자리를 넘긴다(시드와 같은 자리).
--    경로 첫 칸의 서브도메인은 `routes-subdomain.sql` 과 같다.
update public."menus"
   set "accessRoleCodes" = (
         select coalesce(jsonb_agg(case when v = 'teacher' then 'manager' else v end), '[]'::jsonb)
           from jsonb_array_elements_text("accessRoleCodes"::jsonb) as v
       )
 where "accessRoleCodes"::jsonb ? 'teacher';

--    메뉴 표엔 code 열이 없다(시드 전용 이름) — 경로로 찾는다. 행 id 가 그대로라 역할의 menuDirectory 도 따라온다.
update public."menus"
   set "title" = '담당신청', "icon" = 'i-ph-hand-pointing-light', "path" = '/admin/own-enrolls'
 where "path" = '/teacher';

-- 4) 개발 클릭로그인 계정 이메일(`model사용자.seed`·`auth-개발계정`). `/auth/dev/accounts` 가 이메일로 잇는다.
--    이미 이어진 계정은 그 라우트가 건너뛰므로 비밀번호도 여기서 새 값으로 맞춘다.
update public."users" set "email" = 'admin_manager@local.dev' where "email" = 'admin_teacher@local.dev';
update public."users" set "email" = 'manager@local.dev'       where "email" = 'teacher@local.dev';
update auth.users set email = 'admin_manager@local.dev', encrypted_password = extensions.crypt('dev-admin-manager-1234', extensions.gen_salt('bf'))
 where email = 'admin_teacher@local.dev';
update auth.users set email = 'manager@local.dev', encrypted_password = extensions.crypt('dev-manager-1234', extensions.gen_salt('bf'))
 where email = 'teacher@local.dev';

-- 확인:
--   select "code", "label", "menuDirectory" from public."roles" order by "id";
--   select "id", "title", "path", "accessRoleCodes" from public."menus" where "accessRoleCodes"::jsonb ? 'manager';

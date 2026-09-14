-- ============================================================================
-- 마이그레이션 (2026-09-14) — 라우트 첫 칸을 서브도메인으로
--
-- 배포는 서브도메인마다 앱이 따로다(`*-admin`·`*-official`, 모두 base2 를 layer 로 받는다).
-- base2 한 벌 안에서 그 갈래가 보이도록 경로 첫 칸에 서브도메인을 둔다.
--   /admin/*     운영자·담당자 (운영자 홈 `/admin`, 담당자 홈 `/admin/own`)
--   /official/*  게스트·회원 (홈 `/official`)
--   접두어 없음   모든 서브도메인에 있는 공용 화면(`pages/(common)`) — 게시판·자료·내 정보
--
-- 메뉴 표엔 code 열이 없다 — 경로로 찾는다. 행 id 가 그대로라 역할의 menuDirectory 도 따라온다.
-- `members-manager.sql` 보다 먼저 돌아도, 나중에 돌아도 같은 결과다(그쪽이 새 경로를 바로 쓴다).
-- 두 번 돌아도 안전하다.
-- ============================================================================

-- 1) 경로 옮기기. 이미 옮긴 행은 옛 경로가 아니라서 안 걸린다.
update public."menus" as m
   set "path" = v.new_path
  from (values
    ('/dashboard',             '/admin'),
    ('/menus',                 '/admin/menus'),
    ('/members',               '/admin/members'),
    ('/roles',                 '/admin/roles'),
    ('/grades',                '/admin/grades'),
    ('/gradings',              '/admin/gradings'),
    ('/own-enrolls',           '/admin/own-enrolls'),
    ('/own-members',           '/admin/own-members'),
    ('/design-templates',      '/admin/design-templates'),
    ('/edit/design-templates', '/admin/edit/design-templates'),
    ('/boards',                '/admin/boards'),
    ('/surveys',               '/admin/surveys'),
    ('/quizzes',               '/admin/quizzes'),
    ('/polls',                 '/admin/polls'),
    ('/classes',               '/admin/classes'),
    ('/occasions',             '/admin/occasions'),
    ('/enrolls',               '/admin/enrolls'),
    ('/users',                 '/admin/users'),
    ('/do-enrolls',            '/official/enrolls'),
    ('/home1',                 '/official')
  ) as v(old_path, new_path)
 where m."path" = v.old_path;

-- 2) 담당자 홈 메뉴 행(`model메뉴.seed` 의 `own`). 없을 때만 넣는다.
insert into public."menus" ("title", "icon", "path", "accessRoleCodes", "target", "createdAt")
select '할 일', 'i-ph:tray-light', '/admin/own', '["manager"]'::jsonb, '{"kind":"PAGE"}'::jsonb, '2026-09-14T00:00:00.000Z'
 where not exists (select 1 from public."menus" where "path" = '/admin/own');

-- 3) 담당자 menuDirectory 의 첫 칸에 그 행을 세운다 — 첫 칸이 곧 홈이다(`access-control.global`).
--    아직 역할 코드가 teacher 면 `members-manager.sql` 을 먼저 돌릴 것(이 줄은 manager 만 본다).
update public."roles" as r
   set "menuDirectory" = jsonb_build_array(m."id"::text) || coalesce(r."menuDirectory"::jsonb, '[]'::jsonb)
  from public."menus" as m
 where r."code" = 'manager'
   and m."path" = '/admin/own'
   and not (coalesce(r."menuDirectory"::jsonb, '[]'::jsonb) ? m."id"::text);

-- 확인:
--   select "id", "title", "path", "accessRoleCodes" from public."menus" order by "id";
--   select "code", "menuDirectory" from public."roles" where "code" = 'manager';

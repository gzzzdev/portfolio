-- ==========================================================================
-- localDB 36개 표에서 뽑은 스키마.
-- 생성: node _CUSTOM/sql/_생성기/gen-schema.mjs   (손으로 고치지 말고 생성기를 고칠 것)
--
-- id는 bigint identity — 클라 ORM의 compareTo가 Number(stateId)로 정렬하고
-- 「PK 큰 순 = 최신순」이 불변식이라 정렬이 숫자를 요구한다.
-- code 열은 roles·grades뿐 — 앱(api-guard·JWT)이 읽는 값이라 남긴다.
-- 열은 id·createdAt 말고 전부 nullable — 필수 여부는 모델이 판정한다.
-- FK는 on delete set null — localDB엔 제약이 아예 없었으므로 cascade로 올리면
-- 지금까지 없던 연쇄 삭제가 생긴다. 지우는 쪽을 좁히는 건 나중에.
-- ==========================================================================

-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
-- 이 블록은 아래에서 다시 만드는 36개 표를 **통째로 지운다.**
-- supabase에 남은 옛 세대 데이터를 버리고 새 스키마로 다시 세우려는 것이다.
-- 지우면 안 되는 게 있으면 여기서 멈출 것.
-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
drop table if exists "animals" cascade;
drop table if exists "answers" cascade;
drop table if exists "applications" cascade;
drop table if exists "assets" cascade;
drop table if exists "boards" cascade;
drop table if exists "characters" cascade;
drop table if exists "classes" cascade;
drop table if exists "design-templates" cascade;
drop table if exists "docs" cascade;
drop table if exists "events" cascade;
drop table if exists "fruits" cascade;
drop table if exists "grade-conditions" cascade;
drop table if exists "grades" cascade;
drop table if exists "member-comments" cascade;
drop table if exists "member-entity-historys" cascade;
drop table if exists "member-posts" cascade;
drop table if exists "member-status-historys" cascade;
drop table if exists "members" cascade;
drop table if exists "memos" cascade;
drop table if exists "menus" cascade;
drop table if exists "occasions" cascade;
drop table if exists "polls" cascade;
drop table if exists "questionnaires" cascade;
drop table if exists "questions" cascade;
drop table if exists "quizzes" cascade;
drop table if exists "records" cascade;
drop table if exists "recruits" cascade;
drop table if exists "resources" cascade;
drop table if exists "roles" cascade;
drop table if exists "samples" cascade;
drop table if exists "surveys" cascade;
drop table if exists "tag-links" cascade;
drop table if exists "tag-memos" cascade;
drop table if exists "tags" cascade;
drop table if exists "users" cascade;
drop table if exists "vegetables" cascade;

-- 아래는 supabase에 있지만 이 스키마에 **없는** 옛 표다. 새 스키마의 일부가 아니라서
-- 손대지 않는다 — 지우려면 주석을 직접 풀 것. 괄호 안은 조사 시점 행수.
-- drop table if exists "enrollables" cascade;   -- 38행
-- drop table if exists "enrolls" cascade;   -- 3행
-- drop table if exists "fees" cascade;   -- 0행
-- drop table if exists "lectures" cascade;   -- 10행
-- drop table if exists "m-c-lectures" cascade;   -- 6행
-- drop table if exists "member-fees" cascade;   -- 0행
-- drop table if exists "payments" cascade;   -- 0행

-- ──────────────────────────────────────────────────────────────────────
-- animals  (localDB 25행)
create table if not exists "animals" (
  "id"          bigint generated always as identity primary key,
  "createdAt"   timestamptz not null default now(),
  "label"                     text,
  "climate"                   text,
  "order"                     integer,
  "likes"                     integer,
  "diet"                      text,
  "weight"                    double precision,
  "nightAwake"                boolean
);

-- ──────────────────────────────────────────────────────────────────────
-- answers  (localDB 24행)
create table if not exists "answers" (
  "id"          bigint generated always as identity primary key,
  "createdAt"   timestamptz not null default now(),
  "applicationId"             bigint,
  "questionId"                bigint,
  "attempt"                   integer,
  "values"                    jsonb,
  "submittedAt"               timestamptz
);

-- ──────────────────────────────────────────────────────────────────────
-- applications  (localDB 7행)
create table if not exists "applications" (
  "id"          bigint generated always as identity primary key,
  "createdAt"   timestamptz not null default now(),
  "recruitId"                 bigint,
  "memberId"                  bigint,
  "registrationDate"          timestamptz,
  "status"                    text
);

-- ──────────────────────────────────────────────────────────────────────
-- assets  (localDB 20행)
create table if not exists "assets" (
  "id"          bigint generated always as identity primary key,
  "createdAt"   timestamptz not null default now(),
  "kind"                      text,
  "url"                       text,
  "prompt"                    text,
  "ratio"                     double precision
);

-- ──────────────────────────────────────────────────────────────────────
-- boards  (localDB 4행)
create table if not exists "boards" (
  "id"          bigint generated always as identity primary key,
  "createdAt"   timestamptz not null default now(),
  "slug"                      text,
  "title"                     text,
  "icon"                      text,
  "description"               text,
  "isPublished"               boolean,
  "pageIntro"                 jsonb,
  "viewMode"                  text,
  "writeAccess"               text
);

-- ──────────────────────────────────────────────────────────────────────
-- characters  (localDB 16행)
create table if not exists "characters" (
  "id"          bigint generated always as identity primary key,
  "createdAt"   timestamptz not null default now(),
  "name"                      text,
  "idPhoto"                   text,
  "birthdate"                 date,
  "region"                    text,
  "gender"                    text,
  "appearance"                jsonb,
  "education"                 text,
  "major"                     text,
  "regionSub"                 text,
  "job"                       text,
  "income"                    text,
  "household"                 text,
  "film"                      text,
  "actor"                     text,
  "billing"                   text,
  "traits"                    jsonb,
  "bio"                       text,
  "roleImage"                 text,
  "hobbies"                   jsonb,
  "interests"                 jsonb,
  "memories"                  jsonb,
  "secrets"                   jsonb,
  "majorField"                text
);

-- ──────────────────────────────────────────────────────────────────────
-- classes  (localDB 3행)
create table if not exists "classes" (
  "id"          bigint generated always as identity primary key,
  "createdAt"   timestamptz not null default now(),
  "title"                     text,
  "description"               text,
  "body"                      text,
  "thumbnail"                 text,
  "startDate"                 timestamptz,
  "endDate"                   timestamptz,
  "place"                     text,
  "parentId"                  bigint,
  "category"                  text,
  "teacherId"                 bigint
);

-- ──────────────────────────────────────────────────────────────────────
-- design-templates  (localDB 6행)
create table if not exists "design-templates" (
  "id"          bigint generated always as identity primary key,
  "createdAt"   timestamptz not null default now(),
  "label"                     text,
  "purpose"                   text,
  "size"                      jsonb,
  "pages"                     jsonb,
  "isDefault"                 boolean
);

-- ──────────────────────────────────────────────────────────────────────
-- docs  (localDB 3행)
create table if not exists "docs" (
  "id"          bigint generated always as identity primary key,
  "createdAt"   timestamptz not null default now(),
  "order"                     integer,
  "title"                     text,
  "reader"                    text,
  "summary"                   text,
  "body"                      text
);

-- ──────────────────────────────────────────────────────────────────────
-- events  (localDB 13행)
create table if not exists "events" (
  "id"          bigint generated always as identity primary key,
  "createdAt"   timestamptz not null default now(),
  "name"                      text,
  "startDate"                 date,
  "endDate"                   date
);

-- ──────────────────────────────────────────────────────────────────────
-- fruits  (localDB 25행)
create table if not exists "fruits" (
  "id"          bigint generated always as identity primary key,
  "createdAt"   timestamptz not null default now(),
  "label"                     text,
  "origin"                    text,
  "order"                     integer,
  "likes"                     integer,
  "kind"                      text,
  "sweet"                     integer,
  "openDay"                   date
);

-- ──────────────────────────────────────────────────────────────────────
-- grade-conditions  (localDB 3행)
create table if not exists "grade-conditions" (
  "id"          bigint generated always as identity primary key,
  "createdAt"   timestamptz not null default now(),
  "gradeId"                   bigint,
  "noCondition"               boolean,
  "requiredTrainingHoursCut"  integer,
  "requiredWrittenTimeCut"    integer
);

-- ──────────────────────────────────────────────────────────────────────
-- grades  (localDB 4행)
create table if not exists "grades" (
  "id"          bigint generated always as identity primary key,
  "createdAt"   timestamptz not null default now(),
  "code"                      text not null unique,
  "icon"                      text,
  "label"                     text,
  "labelEn"                   text,
  "description"               text,
  "is오름차순"                    boolean,
  "isDefault"                 boolean,
  "thumbnail"                 text,
  "duration_type"             text,
  "alertDays"                 integer,
  "graceDays"                 integer,
  "labelAffix"                jsonb,
  "requiredWrittenTest"       integer
);

-- ──────────────────────────────────────────────────────────────────────
-- member-comments  (localDB 28행)
create table if not exists "member-comments" (
  "id"          bigint generated always as identity primary key,
  "createdAt"   timestamptz not null default now(),
  "commentableType"           text,
  "commentableId"             bigint,
  "isGuest"                   boolean,
  "memberId"                  bigint,
  "authorName"                text,
  "guestName"                 text,
  "guestPassword"             text,
  "body"                      text
);

-- ──────────────────────────────────────────────────────────────────────
-- member-entity-historys  (localDB 30행)
create table if not exists "member-entity-historys" (
  "id"          bigint generated always as identity primary key,
  "createdAt"   timestamptz not null default now(),
  "memberId"                  bigint,
  "roleId"                    bigint,
  "startDate"                 timestamptz,
  "endDate"                   timestamptz,
  "reason"                    text,
  "gradeId"                   bigint
);

-- ──────────────────────────────────────────────────────────────────────
-- member-posts  (localDB 23행)
create table if not exists "member-posts" (
  "id"          bigint generated always as identity primary key,
  "createdAt"   timestamptz not null default now(),
  "boardId"                   bigint,
  "isGuest"                   boolean,
  "memberId"                  bigint,
  "guestName"                 text,
  "guestPassword"             text,
  "title"                     text,
  "body"                      text,
  "thumbnail"                 text,
  "isPublished"               boolean,
  "isFaq"                     boolean not null default false,
  "updatedAt"                 timestamptz,
  "likes"                     integer,
  "views"                     integer
);

-- ──────────────────────────────────────────────────────────────────────
-- member-status-historys  (localDB 21행)
create table if not exists "member-status-historys" (
  "id"          bigint generated always as identity primary key,
  "createdAt"   timestamptz not null default now(),
  "memberId"                  bigint,
  "snapshot"                  jsonb,
  "startDate"                 timestamptz,
  "endDate"                   timestamptz,
  "reason"                    text
);

-- ──────────────────────────────────────────────────────────────────────
-- members  (localDB 9행)
create table if not exists "members" (
  "id"          bigint generated always as identity primary key,
  "createdAt"   timestamptz not null default now(),
  "name"                      text,
  "birthdate"                 date,
  "gender"                    text,
  "thumbnail"                 text,
  "currentMemberFeeId"        bigint,
  "hp"                        integer,
  "mp"                        integer,
  "isSleeping"                boolean
);

-- ──────────────────────────────────────────────────────────────────────
-- memos  (localDB 4행)
create table if not exists "memos" (
  "id"          bigint generated always as identity primary key,
  "createdAt"   timestamptz not null default now(),
  "name"                      text,
  "type"                      text,
  "importance"                text,
  "status"                    text,
  "dueDate"                   date,
  "brief"                     text,
  "link"                      text,
  "content"                   text,
  "hasContent"                boolean
);

-- ──────────────────────────────────────────────────────────────────────
-- menus  (localDB 28행)
create table if not exists "menus" (
  "id"          bigint generated always as identity primary key,
  "createdAt"   timestamptz not null default now(),
  "title"                     text,
  "icon"                      text,
  "path"                      text,
  "accessRoleCodes"           jsonb,
  "target"                    jsonb,
  "isSystem"                  boolean,
  "status"                    text
);

-- ──────────────────────────────────────────────────────────────────────
-- occasions  (localDB 4행)
create table if not exists "occasions" (
  "id"          bigint generated always as identity primary key,
  "createdAt"   timestamptz not null default now(),
  "title"                     text,
  "description"               text,
  "body"                      text,
  "thumbnail"                 text,
  "startDate"                 timestamptz,
  "endDate"                   timestamptz,
  "place"                     text,
  "parentId"                  bigint,
  "category"                  text
);

-- ──────────────────────────────────────────────────────────────────────
-- polls  (localDB 2행)
create table if not exists "polls" (
  "id"          bigint generated always as identity primary key,
  "createdAt"   timestamptz not null default now(),
  "title"                     text,
  "description"               text,
  "body"                      text,
  "thumbnail"                 text,
  "isAnonymous"               boolean
);

-- ──────────────────────────────────────────────────────────────────────
-- questionnaires  (localDB 11행)
create table if not exists "questionnaires" (
  "id"          bigint generated always as identity primary key,
  "createdAt"   timestamptz not null default now(),
  "title"                     text,
  "description"               text,
  "isAnonymous"               boolean
);

-- ──────────────────────────────────────────────────────────────────────
-- questions  (localDB 27행)
create table if not exists "questions" (
  "id"          bigint generated always as identity primary key,
  "createdAt"   timestamptz not null default now(),
  "questionnaireId"           bigint,
  "seq"                       integer,
  "label"                     text,
  "type"                      text,
  "options"                   jsonb,
  "answerKey"                 jsonb,
  "score"                     integer,
  "isRequired"                boolean
);

-- ──────────────────────────────────────────────────────────────────────
-- quizzes  (localDB 2행)
create table if not exists "quizzes" (
  "id"          bigint generated always as identity primary key,
  "createdAt"   timestamptz not null default now(),
  "title"                     text,
  "description"               text,
  "body"                      text,
  "thumbnail"                 text,
  "passScore"                 integer,
  "maxAttempts"               integer
);

-- ──────────────────────────────────────────────────────────────────────
-- records  (localDB 8행)
create table if not exists "records" (
  "id"          bigint generated always as identity primary key,
  "createdAt"   timestamptz not null default now(),
  "targetId"                  text,
  "date"                      date,
  "msg"                       text,
  "likes"                     integer
);

-- ──────────────────────────────────────────────────────────────────────
-- recruits  (localDB 14행)
create table if not exists "recruits" (
  "id"          bigint generated always as identity primary key,
  "createdAt"   timestamptz not null default now(),
  "ownerTable"                text,
  "ownerId"                   bigint,
  "applicationStartDate"      timestamptz,
  "applicationEndDate"        timestamptz,
  "usageStartDate"            timestamptz,
  "usageEndDate"              timestamptz,
  "priceType"                 text,
  "price"                     integer,
  "maxParticipants"           integer,
  "status"                    text,
  "questionnaireId"           bigint
);

-- ──────────────────────────────────────────────────────────────────────
-- resources  (localDB 10행)
create table if not exists "resources" (
  "id"          bigint generated always as identity primary key,
  "createdAt"   timestamptz not null default now(),
  "title"                     text,
  "visibility"                text,
  "summary"                   text,
  "content"                   text
);

-- ──────────────────────────────────────────────────────────────────────
-- roles  (localDB 5행)
create table if not exists "roles" (
  "id"          bigint generated always as identity primary key,
  "createdAt"   timestamptz not null default now(),
  "code"                      text not null unique,
  "icon"                      text,
  "label"                     text,
  "labelEn"                   text,
  "color"                     text,
  "description"               text,
  "isDefault"                 boolean,
  "thumbnail"                 text,
  "permissions"               jsonb,
  "menuDirectory"             jsonb
);

-- ──────────────────────────────────────────────────────────────────────
-- samples  (localDB 3행)
create table if not exists "samples" (
  "id"          bigint generated always as identity primary key,
  "createdAt"   timestamptz not null default now(),
  "order"                     integer,
  "label"                     text,
  "memo"                      text,
  "phone"                     text,
  "rich"                      text,
  "link"                      text,
  "icon"                      text,
  "tags"                      jsonb,
  "num"                       integer,
  "gauge"                     integer,
  "isOn"                      boolean,
  "day"                       text,
  "dayTime"                   text,
  "time"                      text,
  "month"                     text,
  "range"                     jsonb,
  "rangeTime"                 jsonb,
  "pick"                      text,
  "pickRadio"                 text,
  "picks"                     jsonb,
  "cat"                       text,
  "catSub"                    text,
  "matrix"                    jsonb,
  "photo"                     text,
  "photo2"                    text,
  "file"                      jsonb,
  "youtube"                   text
);

-- ──────────────────────────────────────────────────────────────────────
-- surveys  (localDB 3행)
create table if not exists "surveys" (
  "id"          bigint generated always as identity primary key,
  "createdAt"   timestamptz not null default now(),
  "title"                     text,
  "description"               text,
  "body"                      text,
  "thumbnail"                 text,
  "category"                  text
);

-- ──────────────────────────────────────────────────────────────────────
-- tag-links  (localDB 49행)
create table if not exists "tag-links" (
  "id"          bigint generated always as identity primary key,
  "createdAt"   timestamptz not null default now(),
  "tagId"                     bigint,
  "startDate"                 timestamptz,
  "endDate"                   timestamptz,
  "reason"                    text,
  "eventId"                   bigint,
  "memoId"                    bigint,
  "resourceId"                bigint
);

-- ──────────────────────────────────────────────────────────────────────
-- tag-memos  (localDB 28행)
create table if not exists "tag-memos" (
  "id"          bigint generated always as identity primary key,
  "createdAt"   timestamptz not null default now(),
  "tagId"                     bigint,
  "startDate"                 timestamptz,
  "endDate"                   timestamptz,
  "reason"                    text,
  "memoId"                    bigint
);

-- ──────────────────────────────────────────────────────────────────────
-- tags  (localDB 13행)
create table if not exists "tags" (
  "id"          bigint generated always as identity primary key,
  "createdAt"   timestamptz not null default now(),
  "name"                      text,
  "icon"                      text,
  "order"                     integer,
  "childIds"                  jsonb
);

-- ──────────────────────────────────────────────────────────────────────
-- users  (localDB 5행)
create table if not exists "users" (
  "id"          bigint generated always as identity primary key,
  "createdAt"   timestamptz not null default now(),
  "email"                     text,
  "memberId"                  bigint
);

-- ──────────────────────────────────────────────────────────────────────
-- vegetables  (localDB 25행)
create table if not exists "vegetables" (
  "id"          bigint generated always as identity primary key,
  "createdAt"   timestamptz not null default now(),
  "label"                     text,
  "season"                    text,
  "order"                     integer,
  "likes"                     integer,
  "eatPart"                   text,
  "growDays"                  integer,
  "rawOk"                     boolean
);

-- ==========================================================================
-- 외래키. 이름만으로는 대상을 못 정한다 —
-- tag-links.memoId 는 memos(4행)가 아니라 tag-memos(28행)를 가리킨다.
-- ==========================================================================
alter table "answers" add constraint "answers_applicationId_fkey" foreign key ("applicationId") references "applications"("id") on delete set null;
alter table "answers" add constraint "answers_questionId_fkey" foreign key ("questionId") references "questions"("id") on delete set null;
alter table "applications" add constraint "applications_recruitId_fkey" foreign key ("recruitId") references "recruits"("id") on delete set null;
alter table "applications" add constraint "applications_memberId_fkey" foreign key ("memberId") references "members"("id") on delete set null;
alter table "classes" add constraint "classes_parentId_fkey" foreign key ("parentId") references "classes"("id") on delete set null;
alter table "classes" add constraint "classes_teacherId_fkey" foreign key ("teacherId") references "members"("id") on delete set null;
alter table "grade-conditions" add constraint "grade-conditions_gradeId_fkey" foreign key ("gradeId") references "grades"("id") on delete set null;
alter table "member-comments" add constraint "member-comments_memberId_fkey" foreign key ("memberId") references "members"("id") on delete set null;
alter table "member-entity-historys" add constraint "member-entity-historys_memberId_fkey" foreign key ("memberId") references "members"("id") on delete set null;
alter table "member-entity-historys" add constraint "member-entity-historys_roleId_fkey" foreign key ("roleId") references "roles"("id") on delete set null;
alter table "member-entity-historys" add constraint "member-entity-historys_gradeId_fkey" foreign key ("gradeId") references "grades"("id") on delete set null;
alter table "member-posts" add constraint "member-posts_boardId_fkey" foreign key ("boardId") references "boards"("id") on delete set null;
alter table "member-posts" add constraint "member-posts_memberId_fkey" foreign key ("memberId") references "members"("id") on delete set null;
alter table "member-status-historys" add constraint "member-status-historys_memberId_fkey" foreign key ("memberId") references "members"("id") on delete set null;
alter table "occasions" add constraint "occasions_parentId_fkey" foreign key ("parentId") references "occasions"("id") on delete set null;
alter table "questions" add constraint "questions_questionnaireId_fkey" foreign key ("questionnaireId") references "questionnaires"("id") on delete set null;
alter table "recruits" add constraint "recruits_questionnaireId_fkey" foreign key ("questionnaireId") references "questionnaires"("id") on delete set null;
alter table "tag-links" add constraint "tag-links_tagId_fkey" foreign key ("tagId") references "tags"("id") on delete set null;
alter table "tag-links" add constraint "tag-links_eventId_fkey" foreign key ("eventId") references "events"("id") on delete set null;
alter table "tag-links" add constraint "tag-links_memoId_fkey" foreign key ("memoId") references "tag-memos"("id") on delete set null;
alter table "tag-links" add constraint "tag-links_resourceId_fkey" foreign key ("resourceId") references "resources"("id") on delete set null;
alter table "tag-memos" add constraint "tag-memos_tagId_fkey" foreign key ("tagId") references "tags"("id") on delete set null;
alter table "tag-memos" add constraint "tag-memos_memoId_fkey" foreign key ("memoId") references "tag-memos"("id") on delete set null;
alter table "users" add constraint "users_memberId_fkey" foreign key ("memberId") references "members"("id") on delete set null;

-- 폴리모픽 참조라 FK를 못 건다:
--   records.targetId               "vegetables:1002" 꼴 (표 이름이 값 안에 있다)
--   member-comments.commentableId  commentableType 과 짝
--   recruits.ownerId               ownerTable 과 짝 (surveys·quizzes·polls·classes·occasions)

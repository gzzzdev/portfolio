import type { i역할dto } from '../_basics/model역할';

// 시드는 PK를 적지 않는다 — 타입(`Omit<…,'id'>`)이 막는다. 서버가 매기기 때문이다.
// 남의 행을 가리켜야 하면 `code`로 적고 `BaseModels2`의 `시드PK` 등록부가 실제 PK로 바꾼다.
// (여기 `code`는 그것과 별개다 — `api-guard`·JWT가 읽는 앱 데이터라 DB 열로도 남는다.)

/**
 * 각 역할의 `color` 는 **DB 에 저장되는 값**이다 — 관리자가 `i역할색상options`(`model역할.ts`)에서
 * 고른 것의 초기값이고, 화면을 칠하는 결정이 아니라 그 결정의 **씨앗**이다. 그래서 회색조 규약
 * (`eslint.회색조.mjs`) 밖이다. 바꾸려면 화면에서 바꾸지 여기서 안 바꾼다.
 */
/* eslint-disable no-restricted-syntax -- 색이 스타일이 아니라 저장되는 데이터다 (위 주석) */

export const i역할seed: readonly Omit<i역할dto, 'id'>[] = [
  {
    code: 'admin',
    icon: 'i-fluent:person-settings-20-regular',
    label: '운영자',
    labelEn: 'Administrator',
    color: 'info',
    description: '운영 및 관리 권한을 보유해 시스템 정책과 회원 관리를 담당하는 최고 역할.',
    isDefault: false,
    thumbnail: 'https://eswksuuglpexfhryjqvk.supabase.co/storage/v1/object/public/bucket0/files/role_admin2.png',
    permissions: [
      'assets:create',
      'assets:delete',
      'assets:read',
      'assets:update',
      'basics:create',
      'basics:delete',
      'basics:read',
      'basics:update',
      'boards:create',
      'boards:delete',
      'boards:read',
      'boards:update',
      'characters:create',
      'characters:delete',
      'characters:read',
      'characters:update',
      'classes:create',
      'classes:delete',
      'classes:read',
      'classes:update',
      'design-templates:create',
      'design-templates:delete',
      'design-templates:read',
      'design-templates:update',
      'enrollables:create',
      'enrollables:delete',
      'enrollables:read',
      'enrollables:update',
      'enrolls:create',
      'enrolls:delete',
      'enrolls:read',
      'enrolls:update',
      'eras:create',
      'eras:delete',
      'eras:read',
      'eras:update',
      'events:create',
      'events:delete',
      'events:read',
      'events:update',
      'fees:create',
      'fees:delete',
      'fees:read',
      'fees:update',
      'grade-conditions:create',
      'grade-conditions:delete',
      'grade-conditions:read',
      'grade-conditions:update',
      'grades:create',
      'grades:delete',
      'grades:read',
      'grades:update',
      'gradings:create',
      'gradings:delete',
      'gradings:read',
      'gradings:update',
      'member-comments:create',
      'member-comments:delete',
      'member-comments:read',
      'member-comments:update',
      'member-enrolls:create',
      'member-enrolls:delete',
      'member-enrolls:read',
      'member-enrolls:update',
      'member-entity-historys:create',
      'member-entity-historys:delete',
      'member-entity-historys:read',
      'member-entity-historys:update',
      'member-fees:create',
      'member-fees:delete',
      'member-fees:read',
      'member-fees:update',
      'member-gradings:create',
      'member-gradings:delete',
      'member-gradings:read',
      'member-gradings:update',
      'member-posts:create',
      'member-posts:delete',
      'member-posts:read',
      'member-posts:update',
      'member-status-historys:create',
      'member-status-historys:delete',
      'member-status-historys:read',
      'member-status-historys:update',
      'members:create',
      'members:delete',
      'members:read',
      'members:update',
      'memos:create',
      'memos:delete',
      'memos:read',
      'memos:update',
      'menus:create',
      'menus:delete',
      'menus:read',
      'menus:update',
      'occasions:create',
      'occasions:delete',
      'occasions:read',
      'occasions:update',
      'payments:create',
      'payments:delete',
      'payments:read',
      'payments:update',
      'per-gradings:create',
      'per-gradings:delete',
      'per-gradings:read',
      'per-gradings:update',
      'polls:create',
      'polls:delete',
      'polls:read',
      'polls:update',
      'quizzes:create',
      'quizzes:delete',
      'quizzes:read',
      'quizzes:update',
      'resources:create',
      'resources:delete',
      'resources:read',
      'resources:update',
      'roles:create',
      'roles:delete',
      'roles:read',
      'roles:update',
      'surveys:create',
      'surveys:delete',
      'surveys:read',
      'surveys:update',
      // 개수 판(`"table-counts"` 뷰)과 그 원본 등록부. 둘 다 **읽기만** — 개수는 계산된 열이고
      // 등록부는 기계가 쓰는 번호를 인다. 행 수는 "회원이 몇 명인가"를 그대로 말하므로 운영자만.
      'table-counts:read',
      'tables:read',
      'tag-links:create',
      'tag-links:delete',
      'tag-links:read',
      'tag-links:update',
      'tags:create',
      'tags:delete',
      'tags:read',
      'tags:update',
      'users:create',
      'users:delete',
      'users:read',
      'users:update',
    ],
    createdAt: new Date('2026-07-27T09:39:10.497Z'),
    menuDirectory: [
      'dashboard',
      {
            is구분선: true,
            id: 'sep-1785140858196'
      },
      {
            id: 'my-info',
            show: false
      },
      {
            id: 4,
            label: '회원',
            children: [
                  'members',
                  'users',
                  'roles',
                  'grades',
                  {
                        id: 'gradings',
                        show: false
                  }
            ]
      },
      {
            id: 2,
            label: '활동',
            children: [
                  'occasions',
                  'classes',
                  'surveys',
                  // 퀴즈는 활동 셋에서 빠진다. 투표는 전역에서 숨긴다(`enrolls/types.숨긴대상s`).
                  {
                        id: 'quizzes',
                        show: false
                  },
                  {
                        id: 'polls',
                        show: false
                  }
            ]
      },
      // 신청은 활동 안이 아니라 곁에 선다 — 활동은 내보내는 것, 신청은 들어오는 것이다. 활동별 신청은 이미
      // 콘텐츠 상세 「신청 현황」에 있고, 여기는 활동을 가로질러 들어온 것을 모아 보는 자리. 항목이 하나라 폴더는 없다.
      'enrolls',
      // 회차 표는 화면이 아니다 — 콘텐츠 상세 안 「신청받기」가 그 자리다. 표 메뉴만 숨겨 둔다.
      {
            id: 'enrollables',
            show: false
      },
      // 공지·소식·Q&A 는 메뉴에 없다 — 홈이 입구다(더보기·Q&A 링크). 주소는 메뉴 행이 계속 지킨다.
      'resources',
      {
            is구분선: true,
            id: 'sep-1785140760981'
      },
      {
            id: 5,
            label: '설정',
            children: [
                  'menus',
                  'boards',
                  'edit-design-templates'
            ]
      }
] as any
  },
  {
    code: 'manager',
    icon: 'i-ph:user-focus-light',
    label: '담당자',
    labelEn: 'Manager',
    color: 'secondary',
    description: '운영자가 맡긴 회원(members.managerId)의 신청·상태·등급을 처리하는 중간관리 역할.',
    isDefault: false,
    thumbnail: null,
    /**
     * **무엇을** 할 수 있나는 이 목록이고 운영자가 `/admin/roles` 에서 고친다. **누구에게**는 코드가 정한다 —
     * 담당 화면(`/admin/own`·`/admin/own-members`·`/admin/own-enrolls`)이 `managerId` 로 거른다. 콘텐츠·신청받기는 운영자 몫이라 읽기만.
     * 표 단위 권한이라 서버는 아직 「내 담당만」을 막지 않는다(화면만 거른다).
     */
    permissions: [
      'boards:read',
      'classes:read',
      'enrollables:read',
      'enrolls:read',
      'enrolls:update',
      'grade-conditions:read',
      'grades:read',
      'member-entity-historys:create',
      'member-entity-historys:read',
      'member-entity-historys:update',
      'member-fees:read',
      'member-posts:read',
      'member-status-historys:create',
      'member-status-historys:read',
      'members:read',
      'members:update',
      'menus:read',
      'occasions:read',
      'payments:read',
      'polls:read',
      'quizzes:read',
      'resources:read',
      'roles:read',
      'surveys:read',
    ],
    createdAt: new Date('2026-07-27T09:39:10.497Z'),
    menuDirectory: [
      // 첫 칸이 홈이다 — `/` 로 들어오면 여기로 간다(`access-control.global`).
      'own',
      'own-members',
      'own-enrolls',
      'home',
      // 게시판은 메뉴 하나다 — 공지·소식·Q&A 는 한 벌 화면(`/decisions` 의 `게시판-형태`)의 탭이 옮긴다.
      // 싣는 행은 `boards-notice`(이름 「소통」)뿐이고, 소식·Q&A 행은 경로를 지키려고(`access-control.global`) 남는다.
      'boards-notice',
      'resources',
      {
            id: 'my-info',
            show: false
      }
] as any
  },
  {
    code: 'learner',
    icon: 'i-hugeicons:student',
    label: '학습자',
    labelEn: 'Learner',
    color: 'primary',
    description: '학습 콘텐츠 열람과 신청 기능 중심으로 서비스를 이용하는 역할.',
    isDefault: false,
    thumbnail: 'https://eswksuuglpexfhryjqvk.supabase.co/storage/v1/object/public/bucket0/files/role_student3.png',
    permissions: [
      'boards:read',
      'classes:read',
      'enrollables:read',
      /**
       * 학습자는 자기 신청을 만들고·읽고·고친다. 전체 `read` 인 건 `readOwn` 이 아직 가드에
       * 구현되지 않아서다 — 남의 답이 보이는 문제는 알고 미룬다(아이디어 검증이 먼저).
       */
      'enrolls:create',
      'enrolls:read',
      'enrolls:update',
      'grade-conditions:read',
      'grades:read',
      'member-enrolls:create',
      'member-enrolls:read',
      'member-enrolls:update',
      'member-entity-historys:read',
      'member-posts:read',
      'member-status-historys:read',
      'members:read',
      'menus:read',
      'occasions:read',
      'polls:read',
      'quizzes:read',
      'resources:read',
      'roles:read',
      'surveys:read',
    ],
    createdAt: new Date('2026-07-27T09:39:10.497Z'),
    menuDirectory: [
      'home',
      'do-enrolls',
      'boards-notice',
      'resources',
      {
            id: 'my-info',
            show: false
      }
] as any
  },
  {
    code: 'associate',
    icon: 'i-fluent:person-question-mark-20-regular',
    label: '준회원',
    labelEn: 'Associate Member',
    color: 'warning',
    description: '기본 회원 역할으로 서비스의 일반 기능을 이용할 수 있는 단계.',
    isDefault: true,
    thumbnail: 'https://eswksuuglpexfhryjqvk.supabase.co/storage/v1/object/public/bucket0/files/role_associate.png',
    permissions: [
      'boards:read',
      'grade-conditions:read',
      'grades:read',
      'member-entity-historys:read',
      'member-posts:read',
      'member-status-historys:read',
      'members:read',
      'menus:read',
      'resources:read',
      'roles:read',
    ],
    createdAt: new Date('2026-07-27T09:39:10.497Z'),
    menuDirectory: [
      'home',
      'boards-notice',
      'resources'
] as any
  },
  {
    code: 'guest',
    icon: 'i-fluent:person-question-mark-20-regular',
    label: '비회원',
    labelEn: 'Guest',
    color: 'neutral',
    description: '로그인하지 않은 방문자 역할.',
    isDefault: false,
    thumbnail: 'https://eswksuuglpexfhryjqvk.supabase.co/storage/v1/object/public/bucket0/files/role_guest.jpg',
    permissions: [
      'boards:read',
      'grades:read',
      'member-posts:read',
      'members:readPublic',
      'menus:read',
      'resources:read',
      'roles:read',
      /**
       * 신청 목록(`/official/enrolls`)이 그리는 것까지. **회차와 그 콘텐츠만 전체 읽기**다 —
       * 카드 한 장이 회차 행 + 콘텐츠(설문·퀴즈·투표·수업·행사)의 제목/설명/이미지로 만들어지고,
       * 그 조인이 클라이언트에서 일어나기 때문.
       */
      'enrollables:read',
      'surveys:read',
      'quizzes:read',
      'polls:read',
      'classes:read',
      'occasions:read',
      /**
       * 신청은 **개수만** 필요하다(`신청받기.신청수`, 정원 마감 판정). 누가 냈는지·무엇을 썼는지는
       * 비회원이 볼 것이 아니라 `readPublic`으로 둔다 — `공개필드s.enrolls`가 회차 id와
       * 상태만 남긴다. **자기 신청은 예외** — 비회원(익명 세션)도 회원 행이 있어서, 요청자의
       * `members.id` 와 `memberId` 가 같은 행은 통째로 받는다(`공개필드s.본인열ByTable`).
       */
      'enrolls:readPublic',
      /**
       * 비회원 신청. 신청자는 익명 로그인으로 생긴 비회원 회원 행이고(`schema.auth.sql` 4절),
       * 그 회차가 `allowGuest` 인지는 DB 트리거가 본다(`enrolls.sql` 5절). `update` 는 문항 답을
       * 이어 쓰는 데 필요하다 — 행 소유자 검사가 없는 건 학습자 역할도 같다.
       */
      'enrolls:create',
      'enrolls:update',
    ],
    createdAt: new Date('2026-07-27T09:39:10.497Z'),
    menuDirectory: [
      'home',
      'do-enrolls',
      'boards-notice',
      'resources'
] as any
  },
];

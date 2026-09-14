import type { i메뉴시드 } from '../_basics/model메뉴'

export const i메뉴seed: readonly i메뉴시드[] = [
  {
    title: '요약',
    icon: 'i-material-symbols-light:team-dashboard-outline',
    code: 'dashboard',

    path: '/admin',
    accessRoleCodes: [
      'admin'
    ],
    target: { kind: 'PAGE' },
    createdAt: new Date('2026-07-26T09:06:34.265Z')
  },
  {
    title: '메뉴',
    icon: 'i-quill:hamburger',
    code: 'menus',

    path: '/admin/menus',
    accessRoleCodes: [
      'admin'
    ],
    target: {
      kind: 'TABLE',
      dbTable: {
        name: 'menus',
        viewMode: '목록',
        isHierarchy: true,
        세는단위: '개',
        folders: [
          '1001',
          '1003',
          '1004',
          '1005',
          '1006',
          '1002',
          '1025',
          '1007',
          '1008',
          '1009',
          '1010',
          '1011',
          '1012',
          '1017',
          '1018',
          '1019',
          {
            id: 2,
            label: '활동',
            children: [
              '1030',
              '1031',
              '1032',
              '1033',
              '1034'
            ]
          },
          {
            id: 3,
            label: '신청',
            children: [
              '1035',
              '1036'
            ]
          },
          {
            id: 1,
            label: '커뮤니티',
            children: [
              '1013',
              '1014',
              '1015',
              '1016'
            ]
          }
        ]
      }
    },
    createdAt: new Date('2026-07-26T09:06:34.265Z')
  },
  {
    title: '회원',
    icon: 'i-ph:users-light',
    code: 'members',

    path: '/admin/members',
    accessRoleCodes: [
      'admin'
    ],
    target: {
      kind: 'TABLE',
      dbTable: {
        name: 'members',
        viewMode: '가로카드',
        isHierarchy: false,
        세는단위: '명',
        folders: [
          '1015',
          '1014',
          '1013',
          '1012',
          '1011',
          '1010',
          '1009',
          '1008',
          '1007',
          '1006',
          '1005',
          '1004',
          '1003',
          '1002',
          '1001',
          '1016',
          '1017'
        ]
      }
    },
    createdAt: new Date('2026-07-26T09:06:34.265Z')
  },
  {
    title: '역할',
    icon: 'i-clarity:id-badge-line',
    code: 'roles',

    path: '/admin/roles',
    isSystem: false,
    accessRoleCodes: [
      'admin'
    ],
    target: {
      kind: 'TABLE',
      dbTable: {
        name: 'roles',
        viewMode: '가로카드',
        isHierarchy: false,
        세는단위: '개',
        folders: [
          '1001',
          '1002',
          '1003',
          '1004',
          '1005'
        ]
      }
    },
    createdAt: new Date('2026-07-26T09:06:34.265Z')
  },
  {
    title: '등급',
    icon: 'i-iconamoon:certificate-badge-thin',
    code: 'grades',

    path: '/admin/grades',
    accessRoleCodes: [
      'admin'
    ],
    target: {
      kind: 'TABLE',
      dbTable: {
        name: 'grades',
        viewMode: '가로카드',
        isHierarchy: false,
        세는단위: '개',
        folders: [
          '1001',
          '1002',
          '1003',
          '1004'
        ]
      }
    },
    createdAt: new Date('2026-07-26T09:06:34.265Z')
  },
  {
    title: '등급심사',
    icon: 'i-ph:certificate-light',
    code: 'gradings',

    path: '/admin/gradings',
    status: 'HIDDEN',
    accessRoleCodes: [
      'admin'
    ],
    target: {
      kind: 'TABLE',
      dbTable: {
        name: 'gradings',
        viewMode: '목록',
        isHierarchy: false,
        세는단위: '개 심사',
        folders: []
      }
    },
    createdAt: new Date('2026-07-26T09:06:34.265Z')
  },
  {
    /**
     * 담당자가 맡은 회원들의 신청. 옛 `/teacher`(빈 페이지) 자리를 이어받았다 — 배열 순서가 PK 순서라
     * 줄을 지우지 않고 이 자리를 바꿨다(아래 `users` 머리말).
     */
    title: '담당신청',
    icon: 'i-ph-hand-pointing-light',
    code: 'own-enrolls',

    path: '/admin/own-enrolls',
    accessRoleCodes: [
      'manager'
    ],
    target: { kind: 'PAGE' },
    createdAt: new Date('2026-07-26T09:06:34.265Z')
  },
  {
    title: '담당회원',
    icon: 'i-ph:users-light',
    code: 'own-members',

    path: '/admin/own-members',
    accessRoleCodes: [
      'manager'
    ],
    target: { kind: 'PAGE' },
    createdAt: new Date('2026-07-26T09:06:34.265Z')
  },
  {
    title: '학술대회신청',
    icon: 'i-material-symbols-light:event-outline-rounded',
    code: 'enroll-conferences',

    path: '/enroll-conferences',
    accessRoleCodes: [
      'learner'
    ],
    target: { kind: 'PAGE' },
    createdAt: new Date('2026-07-26T09:06:34.265Z')
  },
  {
    title: '학회지신청',
    icon: 'i-mdi-light:book',
    code: 'enroll-journals',

    path: '/enroll-journals',
    accessRoleCodes: [
      'learner'
    ],
    target: { kind: 'PAGE' },
    createdAt: new Date('2026-07-26T09:06:34.265Z')
  },
  {
    title: '등급신청',
    icon: 'i-lucide-file-check',
    code: 'enroll-qualifications',

    path: '/enroll-qualifications',
    accessRoleCodes: [
      'learner'
    ],
    target: { kind: 'PAGE' },
    createdAt: new Date('2026-07-26T09:06:34.265Z')
  },
  {
    title: '일반행사신청',
    icon: 'i-material-symbols-light:event-outline-rounded',
    code: 'enroll-occasions',

    path: '/enroll-occasions',
    accessRoleCodes: [
      'learner'
    ],
    target: { kind: 'PAGE' },
    createdAt: new Date('2026-07-26T09:06:34.265Z')
  },
  {
    title: '나의 정보',
    icon: 'i-mynaui:user',
    code: 'my-info',

    path: '/my-info',
    accessRoleCodes: [
      'learner',
      'manager',
      'admin'
    ],
    target: { kind: 'PAGE' },
    createdAt: new Date('2026-07-26T09:06:34.265Z')
  },
  {
    /**
     * **GNB 의 「소통」 한 칸이 이 행이다.** 공지·소식·Q&A 는 한 벌 화면이라(`/decisions` 의 `게시판-형태`)
     * 메뉴를 셋 두지 않고, 들어와서 탭으로 옮긴다. 그래서 이름이 「공지」가 아니라 묶음 이름이고,
     * 공지 게시판이 입구다. 묶음 이름(2026-09-14): 「게시판」은 틀이름이라 무엇이 있는지 말하지 않고,
     * 「안내」는 누구나 묻는 Q&A 가 들어오면서 틀린 말이 됐다. 소식·Q&A 행은 역할 메뉴에 안 싣지만 **지우면 안 된다** — 보호 경로와 자격이
     * 메뉴 행에서 나와서(`access-control.global`) 행이 없으면 `/boards/qna` 가 막힌다.
     * GNB 켜짐은 게시판 경로 전부에 붙는다(`useNavs` 의 `활성경로s`).
     */
    title: '소통',
    icon: 'i-ph:list-bullets-light',
    code: 'boards-notice',

    path: '/boards/notice',
    accessRoleCodes: [
      'admin',
      'manager',
      'associate',
      'guest',
      'learner'
    ],
    target: { kind: 'BOARD', boardCode: 'notice' },
    createdAt: new Date('2026-07-26T09:06:34.265Z')
  },
  {
    title: 'Q&A',
    icon: 'i-ph:chat-centered-dots-light',
    code: 'boards-qna',

    path: '/boards/qna',
    accessRoleCodes: [
      'admin',
      'manager',
      'associate',
      'guest',
      'learner'
    ],
    target: { kind: 'BOARD', boardCode: 'qna' },
    createdAt: new Date('2026-07-26T09:06:34.265Z')
  },
  {
    /**
     * 방문자가 읽는 자료(`model자료`). **옛 「자료실」 게시판 자리를 그대로 이어받았다** — 배열 순서가
     * PK 순서라(아래 `users` 머리말) 줄을 새로 끼우지 않고 이 자리를 바꿨다. **운영자도 이 문 하나로 들어와** 목록에서 만들고 상세에서 고친다.
     */
    title: '자료',
    icon: 'i-lucide-library-big',
    code: 'resources',

    path: '/resources',
    accessRoleCodes: [
      'admin',
      'manager',
      'associate',
      'guest',
      'learner'
    ],
    target: { kind: 'PAGE' },
    createdAt: new Date('2026-07-26T09:06:34.265Z')
  },
  {
    title: '소식',
    icon: 'i-fluent:news-20-regular',
    code: 'boards-news',

    path: '/boards/news',
    accessRoleCodes: [
      'admin',
      'manager',
      'associate',
      'guest',
      'learner'
    ],
    target: { kind: 'BOARD', boardCode: 'news' },
    createdAt: new Date('2026-07-26T09:06:34.265Z')
  },
  {
    title: '메모',
    icon: 'i-lucide-sticky-note',
    code: 'memos',

    path: '/v2/memos',
    accessRoleCodes: [
      'admin'
    ],
    target: {
      kind: 'TABLE',
      dbTable: {
        name: 'memos',
        viewMode: '목록',
        isHierarchy: false,
        세는단위: '개',
        folders: []
      }
    },
    createdAt: new Date('2026-07-26T09:06:34.265Z')
  },
  {
    title: '태그',
    icon: 'i-lucide-tags',
    code: 'tags',

    path: '/v2/tags',
    accessRoleCodes: [
      'admin'
    ],
    target: {
      kind: 'TABLE',
      dbTable: {
        name: 'tags',
        viewMode: '목록',
        isHierarchy: false,
        세는단위: '개',
        folders: []
      }
    },
    createdAt: new Date('2026-07-26T09:06:34.265Z')
  },
  {
    title: '일정',
    icon: 'i-lucide-calendar',
    code: 'events',

    path: '/v2/events',
    accessRoleCodes: [
      'admin'
    ],
    target: {
      kind: 'TABLE',
      dbTable: {
        name: 'events',
        viewMode: '목록',
        isHierarchy: false,
        세는단위: '개',
        folders: []
      }
    },
    createdAt: new Date('2026-07-26T09:06:34.265Z')
  },
  /**
   * 디자인틀 **표**를 다루는 화면. GNB 에는 안 뜨고(`menuDirectory` 에 `1026` 이 대신 실렸다)
   * 캔버스에서 링크로 들어온다 — 진입점은 캔버스 쪽이라서다 (`1026` 머리말).
   * `kind: 'TABLE'` 은 이제 참이다: 이 경로가 실제로 `view목록5` 를 그린다.
   */
  {
    title: '디자인틀 관리',
    icon: 'i-ph:table-light',
    code: 'design-templates',

    path: '/admin/design-templates',
    accessRoleCodes: [
      'admin'
    ],
    target: {
      kind: 'TABLE',
      dbTable: {
        name: 'design-templates',
        viewMode: '목록',
        isHierarchy: false,
        세는단위: '개',
        folders: []
      }
    },
    createdAt: new Date('2026-07-26T09:06:34.265Z')
  },
  /**
   * 디자인틀의 **GNB 진입점**. 캔버스는 표를 목록으로 그리지 않으므로 `kind: 'PAGE'` 다.
   *
   * 목록 화면(`1024`)이 아니라 이쪽이 GNB 에 서는 이유: 여기서 하는 일이 실제 작업이다.
   * 목록5 에서만 되는 것은 '발급에 사용' 지정 정도고, 만들기·복제·지우기는 편집기 좌측
   * 디자인틀목록이 이미 한다. 그래서 자주 여는 쪽을 앞에 두고, 관리 화면은 거기서 링크로 간다.
   *
   * 줄 자체가 없으면 이 경로가 access-control 의 관리 경로 집합에서 통째로 빠진다 —
   * 보호 대상은 메뉴의 `경로`가 소유하고, 판정은 `isSameOrChildPath` 라 `/admin/design-templates` 로는
   * 이 경로에 닿지 않는다(부모가 아니라 형제다).
   */
  {
    /**
     * 제목에 `(준비중)` 이 붙어 있다. GNB 는 메뉴의 `title` 을 그대로 라벨로 쓰므로
     * (`l/NavigationMenu2.vue`), 뱃지 슬롯을 새로 내지 않고 여기서 한 번에 말한다.
     * 화면을 되살릴 때(`PrintTemplate/준비중.ts`) 같이 떼면 된다.
     */
    title: '디자인틀 (준비중)',
    icon: 'i-lucide-layout-template',
    code: 'edit-design-templates',

    path: '/admin/edit/design-templates',
    accessRoleCodes: [
      'admin'
    ],
    target: { kind: 'PAGE' },
    createdAt: new Date('2026-09-01T00:00:00.000Z')
  },
  {
    /**
     * 자료 표 메뉴. **GNB 에는 안 뜬다** — 자료의 문은 역할과 상관없이 위 `resources`(`/resources`) 하나다
     * (운영자용 `/admin/resources` 가 따로 떠서 메뉴에 자료가 두 번 보이던 걸 2026-09-14 걷었다).
     * 행이 남는 이유는 `enrollables` 와 같다 — `model자료s.메뉴`(라벨·아이콘)·표 이름 ↔ 메뉴 사슬, 그리고 PK 밀림.
     */
    title: '자료',
    icon: 'i-lucide-library-big',
    code: 'admin-resources',

    path: '/admin/resources',
    accessRoleCodes: [
      'admin'
    ],
    target: {
      kind: 'TABLE',
      dbTable: {
        name: 'resources',
        viewMode: '목록',
        isHierarchy: false,
        세는단위: '건',
        folders: []
      }
    },
    createdAt: new Date('2026-08-29T00:00:00.000Z')
  },
  {
    title: '게시판',
    icon: 'i-ph:list-bullets-light',
    code: 'boards',

    path: '/admin/boards',
    accessRoleCodes: [
      'admin'
    ],
    target: {
      kind: 'TABLE',
      dbTable: {
        name: 'boards',
        viewMode: '목록',
        isHierarchy: false,
        세는단위: '개',
        folders: [
          '1001',
          '1002',
          '1004'
        ]
      }
    },
    createdAt: new Date('2026-09-01T00:00:00.000Z')
  },
  {
    title: '설문',
    icon: 'i-ph:clipboard-text-light',
    code: 'surveys',

    path: '/admin/surveys',
    accessRoleCodes: [
      'admin'
    ],
    target: {
      kind: 'TABLE',
      dbTable: {
        name: 'surveys',
        viewMode: '가로카드',
        isHierarchy: false,
        세는단위: '개',
        folders: []
      }
    },
    createdAt: new Date('2026-09-02T00:00:00.000Z')
  },
  {
    title: '퀴즈',
    icon: 'i-ph:exam-light',
    code: 'quizzes',

    path: '/admin/quizzes',
    accessRoleCodes: [
      'admin'
    ],
    target: {
      kind: 'TABLE',
      dbTable: {
        name: 'quizzes',
        viewMode: '가로카드',
        isHierarchy: false,
        세는단위: '개',
        folders: []
      }
    },
    createdAt: new Date('2026-09-02T00:00:00.000Z')
  },
  {
    title: '투표',
    icon: 'i-ph:list-checks-light',
    code: 'polls',

    path: '/admin/polls',
    accessRoleCodes: [
      'admin'
    ],
    target: {
      kind: 'TABLE',
      dbTable: {
        name: 'polls',
        viewMode: '가로카드',
        isHierarchy: false,
        세는단위: '개',
        folders: []
      }
    },
    createdAt: new Date('2026-09-02T00:00:00.000Z')
  },
  {
    title: '수업',
    icon: 'i-ph:chalkboard-teacher-light',
    code: 'classes',

    path: '/admin/classes',
    accessRoleCodes: [
      'admin'
    ],
    target: {
      kind: 'TABLE',
      dbTable: {
        name: 'classes',
        viewMode: '가로카드',
        isHierarchy: false,
        세는단위: '개',
        folders: []
      }
    },
    createdAt: new Date('2026-09-02T00:00:00.000Z')
  },
  {
    title: '행사',
    icon: 'i-ph:confetti-light',
    code: 'occasions',

    path: '/admin/occasions',
    accessRoleCodes: [
      'admin'
    ],
    target: {
      kind: 'TABLE',
      dbTable: {
        name: 'occasions',
        viewMode: '가로카드',
        isHierarchy: false,
        세는단위: '개',
        folders: []
      }
    },
    createdAt: new Date('2026-09-02T00:00:00.000Z')
  },
  {
    /**
     * 신청받기(회차) 표 메뉴. **GNB 에는 안 뜬다** — 운영자에게 '신청받기'는 화면이 아니라 콘텐츠 상세 안의
     * 「신청받기」 구역이다(2026-09-13 재설계). 여기 남는 이유는 `model신청받기s.메뉴`(라벨·아이콘)와
     * 표 이름 ↔ 메뉴 사슬이고, 자리를 지키는 이유는 아래 `계정` 메뉴 주석과 같다(PK 밀림).
     * 옛 `recruits` 자리다.
     */
    title: '신청받기',
    icon: 'i-ph:megaphone-light',
    code: 'enrollables',

    path: '/admin/enrollables',
    accessRoleCodes: [
      'admin'
    ],
    target: {
      kind: 'TABLE',
      dbTable: {
        name: 'enrollables',
        viewMode: '목록',
        isHierarchy: false,
        세는단위: '개',
        folders: []
      }
    },
    createdAt: new Date('2026-09-02T00:00:00.000Z')
  },
  {
    /**
     * 신청 표의 운영자 목록. 표 이름 그대로 `/admin/enrolls` 에 선다 — 회원이 신청하는 문은 아래
     * `do-enrolls` 로 비킨다. 표는 `enrolls` 하나고 문은 둘이다.
     * 옛 `applications` 자리다.
     */
    title: '신청',
    icon: 'i-ph:hand-pointing-light',
    code: 'enrolls',

    path: '/admin/enrolls',
    accessRoleCodes: [
      'admin'
    ],
    target: {
      kind: 'TABLE',
      dbTable: {
        name: 'enrolls',
        viewMode: '목록',
        isHierarchy: false,
        세는단위: '건',
        folders: []
      }
    },
    createdAt: new Date('2026-09-02T00:00:00.000Z')
  },
  {
    title: '신청',
    icon: 'i-ph:hand-pointing-light',
    code: 'do-enrolls',

    path: '/official/enrolls',
    accessRoleCodes: [
      'learner',
      // 비회원도 목록까지는 본다. 신청·응답은 상세에서 로그인으로 막힌다.
      'guest'
    ],
    target: { kind: 'PAGE' },
    createdAt: new Date('2026-09-02T00:00:00.000Z')
  },
  {
    /**
     * 로그인 계정. GNB에서는 「회원」 묶음에 든다(`model역할.seed`의 admin `menuDirectory`) —
     * 이 표가 하는 일이 신원(`auth.users`)과 회원을 잇는 것 하나뿐이라서다(`model사용자.ts`).
     *
     * 행이 없으면 `/admin/users` 화면은 머리글도 없고(`model사용자s.메뉴`) 접근제어도 안 탄다 —
     * 보호할 경로 목록이 메뉴에서 나온다(`access-control.global`).
     *
     * **그런데도 배열 가운데가 아니라 끝에 선다.** 이 배열의 순서가 곧 서버가 매기는 PK 순서인데
     * (`db_low.allocateIds`), 위 `menus` 메뉴의 `folders`는 그 PK를 **날것으로** 적어 둔 목록이다.
     * 가운데 끼우면 뒤따르는 메뉴가 전부 한 칸씩 밀려 그 목록이 조용히 어긋난다(화면은 돈다).
     * GNB 순서는 여기가 아니라 역할의 `menuDirectory`가 code로 정하므로, 끝에 서도 잃는 게 없다.
     */
    title: '계정',
    icon: 'i-ph:key-light',
    code: 'users',

    path: '/admin/users',
    isSystem: false,
    accessRoleCodes: [
      'admin'
    ],
    target: {
      kind: 'TABLE',
      dbTable: {
        name: 'users',
        viewMode: '목록',
        isHierarchy: false,
        세는단위: '개',
        folders: []
      }
    },
    createdAt: new Date('2026-09-09T00:00:00.000Z')
  },
  {
    /**
     * 비회원의 입구(`/official`, 포털형 홈 — `access-control.global` 이 `/` 를 여기로 보낸다).
     * 서브도메인 루트라 **자기 경로만** 잡는다 — `/official/*` 를 품지 않는다(`is서브도메인루트`).
     * GNB 에는 guest 의 `menuDirectory` 에만 싣는다. 접근역할이 다섯 전부인 건 행이 생기는 순간
     * 이 경로가 보호 대상이 되기 때문이다 — guest 만 적으면 로그인한 사람이 홈에서 튕긴다.
     * 끝에 서는 이유는 위 `users` 머리말과 같다(PK 밀림).
     */
    title: '홈',
    icon: 'i-ph:house-light',
    code: 'home',

    path: '/official',
    accessRoleCodes: [
      'admin',
      'manager',
      'associate',
      'guest',
      'learner'
    ],
    target: { kind: 'PAGE' },
    createdAt: new Date('2026-09-14T00:00:00.000Z')
  },
  {
    /**
     * 담당자의 홈(`/admin/own`) — 맡은 회원에게서 **지금 처리할 일**만 모은다. 운영자 홈(`/admin`)이
     * 「무엇이 얼마나 있나」라면 여기는 「무엇을 손봐야 하나」다. 담당자 `menuDirectory` 의 첫 칸이라
     * `/` 로 들어오면 여기로 온다. 끝에 서는 이유는 위 `users` 머리말과 같다(PK 밀림).
     */
    title: '할 일',
    icon: 'i-ph:tray-light',
    code: 'own',

    path: '/admin/own',
    accessRoleCodes: [
      'manager'
    ],
    target: { kind: 'PAGE' },
    createdAt: new Date('2026-09-14T00:00:00.000Z')
  }
]

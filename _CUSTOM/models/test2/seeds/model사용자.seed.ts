import type { i사용자시드 } from '~models/test2'

/**
 * 로그인 계정 시드. **역할별로 한 명씩**이다 — 개발 중 역할을 갈아끼우며 화면을 보려면
 * 그 역할을 가진 계정이 실제로 있어야 하고, 그게 클릭로그인 목록이 된다.
 *
 * `회원code`는 `model회원.seed`가 자기를 부르는 이름이고, `seed해소`가 실제 `memberId`로 바꾼다.
 * 역할은 여기 안 적는다 — 역할은 계정이 아니라 **회원**의 것이라 `member-entity-historys`에 살고,
 * 그 선언은 `i회원seed.역할codes`가 들고 있다.
 *
 * **비밀번호는 여기 없다.** 이 파일은 `model사용자.ts`(클라 모델)가 import하므로 클라 번들로 나간다.
 * 개발 계정의 비밀번호는 서버에만 사는 `server/utils/auth-개발계정.ts`가 들고 있다.
 */
export const i사용자seed: readonly i사용자시드[] = [
  {
    email: 'admin@local.dev',
    회원code: 'admin',
    memberId: null,
    authId: null
  },
  {
    email: 'admin_manager@local.dev',
    회원code: 'admin_manager',
    memberId: null,
    authId: null
  },
  {
    email: 'manager@local.dev',
    회원code: 'manager',
    memberId: null,
    authId: null
  },
  {
    email: 'learner@local.dev',
    회원code: 'learner',
    memberId: null,
    authId: null
  },
  {
    email: 'associate@local.dev',
    회원code: 'associate',
    memberId: null,
    authId: null
  }
]

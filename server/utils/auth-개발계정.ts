import { i사용자seed } from '~models/test2/seeds/model사용자.seed'

/**
 * 개발용 클릭로그인 계정의 **비밀번호**. 서버에만 산다.
 *
 * 시드(`model사용자.seed`)에 두지 않는 이유: 그 파일은 `model사용자.ts`(클라 모델)가 import하므로
 * **클라 번들로 나간다.** 이메일과 회원 연결은 나가도 되는 값이지만 비밀번호는 아니다.
 * `server/utils/*`는 Nitro에만 들어간다.
 *
 * 여기 있는 계정으로 들어오는 문(`auth/dev/*`)은 전부 `isDev`에서만 열린다.
 * 운영에서는 라우트 자체가 404다 — 이 비밀번호를 아는 것만으론 아무 데도 못 들어간다.
 */
const 비밀번호by이메일: Record<string, string> = {
  'admin@local.dev': 'dev-admin-1234',
  'admin_manager@local.dev': 'dev-admin-manager-1234',
  'manager@local.dev': 'dev-manager-1234',
  'learner@local.dev': 'dev-learner-1234',
  'associate@local.dev': 'dev-associate-1234'
}

/** 시드에 없는 이메일은 개발 계정이 아니다 — 이 문으로 임의 계정에 들어가지 못하게 막는 자리. */
const 개발이메일s = new Set(i사용자seed.map(x => String(x.email).toLowerCase()))

export const is개발계정 = (email: string) => 개발이메일s.has(email.trim().toLowerCase())

export const do개발비밀번호 = (email: string): string | null => {
  const key = email.trim().toLowerCase()
  if (!개발이메일s.has(key)) return null
  return 비밀번호by이메일[key] ?? null
}

/** 계정 생성이 훑는 목록. 시드 순서 = 로그인 드롭다운 순서다. */
export const 개발계정s = i사용자seed
  .map(x => ({ email: String(x.email), password: do개발비밀번호(String(x.email)) }))
  .filter((x): x is { email: string, password: string } => Boolean(x.email && x.password))

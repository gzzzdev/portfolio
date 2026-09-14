export { i기본seed } from './model기본.seed'
export { i메뉴seed } from './model메뉴.seed'
export { i게시판seed } from './model게시판.seed'
// 게시판 3개의 글·댓글. 두 모델 몫이지만 댓글의 FK가 글 id 배정과 한 몸이라 한 파일에 있다.
export { i회원게시글seed, i회원댓글seed } from './model게시판콘텐츠.seed'
export { i등급seed } from './model등급.seed'
export { i등급요건seed } from './model등급요건.seed'
export { i역할seed } from './model역할.seed'
export { i직업seed } from './model직업.seed'
export { i회원seed } from './model회원.seed'
// 로그인 계정. 회원 뒤에 온다 — `회원code`로 회원을 가리키므로 `시드PK` 등록부가 먼저 차야 한다.
export { i사용자seed } from './model사용자.seed'
export { i디자인틀seed } from './model디자인틀.seed'
// 자료(원본 문서). 옛 자료실 게시판 글도 여기로 왔다. FK 가 없어 순서를 안 탄다.
export { i자료seed } from './model자료.seed'

// 신청받기·신청 세트 콘텐츠. 신청받기·문항세트·문항은 선언형이 아니라 `enrolls/seed.ts`가 실제 PK로 엮는다.
export { i설문seed } from './model설문.seed'
export { i퀴즈seed } from './model퀴즈.seed'
export { i투표seed } from './model투표.seed'
export { i수업seed } from './model수업.seed'
export { i행사seed } from './model행사.seed'

// **DB `code` 열은 roles·grades뿐** — 앱(api-guard·JWT·menus.accessRoleCodes)이 읽는 값이라 남긴다. 시드가 FK 엮을 때 쓰는 code는 DB에 안 들어간다(`BaseModels2`의 `시드PK` 등록부가 초기데이터 실행 중에만 들고 있다).

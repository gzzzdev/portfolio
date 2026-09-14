<!--
  `/` 는 그리는 화면이 없다 — 누가 오든 `access-control.global` 이 보낸다.
  로그인했으면 지금 역할의 첫 메뉴(운영자 `/admin`, 담당자 `/admin/own`), 비로그인이면 포트폴리오 소개(`/portfolio`).

  그런데도 이 파일이 있는 건 **라우트 기록을 잡아 두려고**다. 없으면 제품이 「홈으로」 쓰는 `navigateTo('/')`
  (로그아웃·401·에러 화면)마다 Vue Router 가 "No match" 를 찍고, 미들웨어가 못 도는 날엔 404 가 뜬다.
-->
<template>
  <div />
</template>

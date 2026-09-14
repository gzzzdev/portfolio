# CLAUDE.md

Nuxt 4 모노레포의 `base` 레이어. 도메인은 회원관리시스템. 핵심 커스텀 코드는 `_CUSTOM/`에 있고,
alias는 `~utils`→`_CUSTOM/utils`, `~models`→`_CUSTOM/models`, `~base-comps`→`app/components`.
**v2가 리뉴얼이고 v1은 구닥다리다.** 새 축은 v2(`~utils/aiV2`·`~models/v2`·`layout-v2`)에서 먼저 검증하고 v1로 옮긴다.

**여러 표를 한 번에 묻는 조회는 새 라우트가 아니라 DB 뷰로 낸다** — 뷰도 `model{이름}s` ↔ `/api/v1/{이름}`
사슬을 그대로 타서 라우트·인가·캐시가 공짜다(`"table-counts"`). 특수 엔드포인트를 파면 인자 상한·배치 실패·
가드 예외를 전부 손으로 진다(`_counts`가 그랬다).

**손대기 전에 그 자리에서 검증한다.** 주석·문서의 문장은 근거가 아니라 단서다 — 코드로 먼저 확인하고,
무엇을 고쳤으면 그 이름을 말하는 다른 자리까지 같이 훑는다.

## 지뢰

- **셸로 리포를 훑을 땐 `git -c core.quotepath=false ls-files -z` + `while IFS= read -r -d ''`.**
  기본 `ls-files`는 한글 경로를 8진수로 이스케이프해서 뒤따르는 루프가 통째로 깨진다.
- **`_CUSTOM/localDB/*.json`에 `git checkout --`/`git restore`를 쓰지 말 것.**
  커밋되지 않은 채 오래 살아 있는 앱 생성 데이터라 되돌릴 곳이 없다.
  고칠 일이 있으면 해당 부분만 손대고, 재생성이 필요하면 `_CUSTOM/models/test2/seeds/*`에서 다시 만든다.
- `.env`·`runtimeConfig`의 비밀 값(geminiApiKey, tossPaymentsSecretKey 등)은 커밋하지 말 것.

import {
  model회원s,
  model등급s,
  model자료s,
  model게시판s,
  model회원게시글s,
  type model게시판,
  type model회원게시글
} from '~models/test2'
import { fromRepo, type AiSource } from './source'
import { 행id } from './plan'

/**
 * 사이트 전역 챗봇이 참조할 데이터 목록.
 *
 * **모델과 AI가 만나는 유일한 지점**이다. 모델을 추가·교체하려면 여기만 고치면 되고,
 * `AI_Copilot.vue`·`useChatbot`·`server/utils/ai.ts`는 건드릴 일이 없다.
 *
 * 행 데이터는 LLM에 가지 않는다. 모델의 `필터조건ss`/`정렬조건s`/`검색필드s`(목록5가 읽는 그 정의)가
 * 어휘가 되고, LLM은 조회 계획만 뱉는다. `fields`는 그 계획을 실행한 **결과 행**을 적을 때만 쓰인다.
 */
export function 사이트AI소스s(): AiSource[] {
  return [
    fromRepo(model회원s.getInstance(), {
      label: '회원',
      fields: ['이름', '성별', '생년월일', '등급', '잠자는중'],
      // 챗봇이 제안할 수 있는 행동. 모델의 `do*`를 통째로 여는 게 아니라 여기 적은 것만 열린다 —
      // 모델에 do를 추가했다고 챗봇 권한이 따라 늘어나면 안 되기 때문이다.
      // 실행은 언제나 사용자의 클릭이고, 전제조건 검사·실패 안내는 do 자신이 이미 한다.
      행동: ['do회비납부', 'do명함출력', 'do회원증출력', 'do등급증출력']
    }),
    fromRepo(model등급s.getInstance(), {
      label: '등급',
      fields: ['이름', '급수', '구독구분', '소개']
    }),
    fromRepo(model자료s.getInstance(), {
      label: '자료',
      // 본문은 `fields`가 아니라 `본문필드`로 준다 — 표 셀은 한 줄이라 8만 자를 감당 못 하고,
      // 발췌는 예산을 따로 배분받아야 한다.
      fields: ['제목', '요약'],
      본문필드: '내용',
      링크: row => `/resources/${encodeURIComponent(행id(row))}`
    }),
    /**
     * 게시판은 **조회보다 행동을 위해** 있다.
     *
     * 4~5행짜리 메타라 "무슨 게시판 있어?"에 답하는 값도 있지만, 진짜 이유는 새 글의 대상이다 —
     * "오늘 3~4시에 점검한다고 공지해"에서 지목할 수 있는 행은 아직 없는 글이 아니라 게시판이다.
     * 초안(제목·본문)은 계획의 `초안`에 실려 와서 글쓰기 화면의 폼에 앉는다.
     */
    fromRepo(model게시판s.getInstance(), {
      label: '게시판',
      fields: ['이름', '요약', '경로', '공개'],
      행동: ['do글쓰기'],
      링크: (row: model게시판) => (row.공개 ? row.경로 : null)
    }),
    fromRepo(model회원게시글s.getInstance(), {
      label: '게시글',
      // 게시판·작성자는 `sub`에도 있지만 표에 열로 세워야 LLM이 "공지 중에서"처럼 묶어 읽는다.
      fields: ['제목', '게시판', '작성자표시', '작성일시', '공개'],
      // md 원문(`본문`)이 아니라 평문 파생값. `::` 블록 표시가 발췌 예산을 먹지 않게.
      본문필드: '본문텍스트',
      /**
       * 공개 글만 링크한다. 상세 페이지가 비공개 글을 "글을 찾을 수 없습니다"로 막으므로
       * 링크를 걸면 챗봇이 막다른 길을 권하는 꼴이 된다 — 답변에 이름은 그대로 나온다.
       */
      링크: (row: model회원게시글) => {
        const 슬러그 = row.게시판?.슬러그?.trim()
        return row.공개 && 슬러그 ? `/boards/${encodeURIComponent(슬러그)}/${행id(row)}` : null
      }
    })
  ]
}

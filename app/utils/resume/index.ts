/**
 * 개발자 이력서(`/resume`)의 자료.
 *
 * 정본은 저장소 밖의 `이력_정리.md` 이고, `portfolio.json`·`portfolio.types.ts` 는 거기서 파생돼 **그대로 복사해 온 것**이다.
 * 고칠 일이 있으면 md → json 순서로 고쳐서 다시 덮는다 — 여기서 json 을 손으로 고치면 원본과 두 벌이 된다.
 *
 * `app/utils/` 바로 아래가 아니라 한 칸 안쪽에 둔 건 자동 import 를 피하려는 것이다.
 * `Link`·`Period`·`Project` 같은 흔한 이름이 전역으로 새면 도메인 타입과 부딪친다.
 */
import data from './portfolio.json'
import type { Period, ProjectStatus, EmploymentType, PortfolioData, StorySection } from './portfolio.types'

export type * from './portfolio.types'

/** json 은 `"2024-10"` 을 `string` 으로 읽어서 `ISODate` 템플릿 리터럴과 안 맞는다 — 모양은 파생 단계가 보장한다 */
export const 이력 = data as PortfolioData

const 월 = (d: string) => d.replace('-', '.')

export function 기간(p: Period): string {
  return `${월(p.start)} – ${p.end ? 월(p.end) : '현재'}`
}

/**
 * 경력순 — 진행 중이 맨 위, 그다음 끝난 달이 늦은 순, 같으면 시작이 늦은 순.
 * json 의 배열 순서는 원본 md 의 서술 순서라 시간순이 아니다(`exp-ginue` 가 `exp-majangteo` 뒤에 있다).
 */
export function 경력순<T extends { period: Period }>(items: T[]): T[] {
  const 끝 = (p: Period) => p.end ?? '9999-99'
  return [...items].sort((a, b) =>
    끝(b.period).localeCompare(끝(a.period)) || b.period.start.localeCompare(a.period.start))
}

/** 글자만 — 색을 입히지 않는다(흑백 + 회색, `pages/resume.vue` 머리말) */
export const 진행상태s: Record<ProjectStatus, string> = {
  ongoing: '진행 중',
  completed: '완료',
  prototype: '프로토타입',
  discontinued: '중단',
  failed: '실패'
}

export const 고용형태s: Record<EmploymentType, string> = {
  'full-time': '정규직',
  'freelance': '프리랜서',
  'contract': '계약',
  'founder': '창업'
}

/**
 * story 단락이 사는 경력·프로젝트 칸 — `refs[0]` 이다(`s4 도구가 없을 때` → `proj-geumun`).
 * 「웹 줄기」(`s5`)는 다섯 칸을 가리키는 개관이라 한 칸에 못 넣고, 같은 제목의 thread(`t-web`)에 붙인다.
 */
export const 줄기에붙는단락 = 이력.story.find(s => s.heading === '웹 줄기')

export const story단락s: Record<string, StorySection[]> = {}
for (const s of 이력.story) {
  const 칸 = s.refs[0]
  if (s === 줄기에붙는단락 || !칸) continue
  ;(story단락s[칸] ??= []).push(s)
}

/**
 * **이 사이트 자신을 가리키는 링크는 화면에서 뺀다.** 원본 md 는 서류(PDF)로도 나가서 「포트폴리오」「서비스」 링크가 필요하지만,
 * `/resume` 은 이미 그 사이트 안이다 — 누르면 같은 곳이 새 탭으로 열린다.
 * 외주 배포(`wishket`)는 도메인이 달라 누르면 토스판으로 건너가기까지 한다. json 을 고치지 않고 그릴 때 거른다.
 */
const 이사이트 = 'portfolio.team-mjt.com'
export function 바깥링크s<T extends { url: string }>(links: T[] | undefined): T[] {
  return (links ?? []).filter(l => !l.url.includes(이사이트))
}

/** story·threads 의 `ref` 가 가리키는 경력·프로젝트의 이름. 페이지 안 앵커(`#exp-…`)로 건너간다 */
export const 참조이름s: Record<string, string> = Object.fromEntries([
  ...이력.experience.map(e => [e.id, e.org]),
  ...이력.projects.map(p => [p.id, p.name])
])

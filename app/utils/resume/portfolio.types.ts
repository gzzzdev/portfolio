/**
 * 포트폴리오 데이터 스키마
 * 원본은 이력_정리.md. 이 파일과 portfolio.json은 거기서 파생된다.
 *
 * 표시 규칙
 * - summary, highlights : 목록/카드에서 항상 보인다
 * - details             : "더보기"를 누르면 펼쳐진다 (각주 성격)
 * - md에 "서류에는 쓰지 않음"으로 표시된 내용은 JSON에 포함하지 않는다
 */

export type ISODate = `${number}-${number}`; // "2024-10"

export interface Period {
  start: ISODate;
  end: ISODate | null; // null = 현재
}

export interface Link {
  label: string;
  url: string;
}

/** 펼쳐서 보는 설명 한 덩어리 */
export interface Detail {
  title: string;
  body: string; // markdown 허용
}

export type EmploymentType =
  | "full-time"
  | "freelance"
  | "contract"
  | "founder";

export interface Experience {
  id: string;
  org: string;
  role: string;
  employmentType: EmploymentType;
  period: Period;
  /** 한 줄 요약. 목록에서 항상 보인다 */
  summary: string;
  /** 불릿. 카드에서 항상 보인다 */
  highlights: string[];
  /** 더보기 */
  details: Detail[];
  tech: string[];
  links?: Link[];
  /** 지원서 5칸 기재 여부 등, 표시와 무관한 메모 */
  note?: string;
}

export type ProjectStatus =
  | "ongoing"
  | "completed"
  | "prototype"
  | "discontinued"
  | "failed";

export interface Project {
  id: string;
  name: string;
  period: Period;
  status: ProjectStatus;
  /** 어떤 맥락의 프로젝트인지 (개인 / 팀 마장터 초기 / 연구소 과제 …) */
  context: string;
  summary: string;
  highlights: string[];
  details: Detail[];
  tech: string[];
  links?: Link[];
}

export interface Education {
  school: string;
  major: string;
  period: Period;
}

export interface Award {
  /** 연도를 모르는 재학 중 수상은 "재학" — 비워 두면 맨 아래 깔려 최근 일처럼 읽힌다 */
  year: number | string | null;
  title: string;
  by?: string;
  note?: string;
}

export interface SkillGroup {
  label: string;
  items: string[];
}

/** "웹 줄기" — 스택이 바뀌어도 화면을 만들어 온 이력 */
export interface LineageRow {
  year: string;
  what: string;
  stack: string;
}

export interface Profile {
  name: string;
  title: string;
  email: string;
  links: Link[];
  /** 짧은 단락 한두 개. 단락은 빈 줄(`\n\n`)로 나눈다 — markdown 은 아니다 */
  intro: string;
  /** 본인이 정한 키워드 */
  keywords: string[];
}

export interface CareerStats {
  total: string;         // "5년 5개월"
  webFrontend: string;   // "3년 3개월"
  note: string;          // 산정 기준
}


/** 사이트가 위에서 아래로 읽히는 순서. 첫 화면. */
export interface StorySection {
  id: string;
  heading: string;
  /** 두세 문단, markdown */
  body: string;
  /** 이 단락이 가리키는 experience / project id */
  refs: string[];
}

/** 시간이 아니라 주제로 묶은 줄기 */
export interface Thread {
  id: string;
  title: string;
  /** 왜 이 줄기를 보여주는지 한 줄 */
  why: string;
  /** 순서대로. 각 항목은 "언제 · 무엇 · 어떻게" 한 줄 */
  steps: { year: string; what: string; how: string; ref?: string }[];
}

/** 지원 맥락 */
export interface Applying {
  target: string;            // "토스플레이스 Frontend Developer"
  motivation: string;        // markdown
  /** 검토자가 바로 확인할 수 있는 것 */
  proof: Link[];
}

export interface PortfolioData {
  generatedFrom: string; // 원본 md 경로
  generatedAt: string;   // ISO datetime
  profile: Profile;
  stats: CareerStats;
  story: StorySection[];
  threads: Thread[];
  applying: Applying;
  skills: SkillGroup[];
  lineage: LineageRow[];
  experience: Experience[];
  projects: Project[];
  education: Education[];
  awards: Award[];
}

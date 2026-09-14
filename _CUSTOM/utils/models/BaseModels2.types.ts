export type iID = string | number;

export interface BaseXXDto {
    /**
     * **서버 PK.** 서버가 주기 전엔 `null`이다 — 저장 전 행은 이 자리가 비어 있는 게 정직하다.
     * 화면이 행을 지목하는 축은 이게 아니라 `BaseModel2.rowKey`다(`rowKeyOf` 주석 참고).
     */
    id: iID | null;
    createdAt?: Date;//처버에서 처리될때가 있기때문.
    /** 목록 드래그 순서 (Sortable / mList2) */
    order?: number;
    /** 계층 자식 id들 (Sortable2 childIds) */
    childIds?: Array<string | number>;
    isDeleted?: boolean;
}

export interface BaseXX {
    state: any;
    stateId: iID | null;
    순서?: number;
    자식s?: Array<string | number>;
    label: string;
    readonly sub: string;

    메뉴명: string;

}

export interface FuncQueue {

    type: 'create' | 'update' | 'delete';
    qId: string | number;
    //
    milliseconds: number,
    func: Function
    label: string;
}

export interface i목록Badge {
    label: string;
    color?: string;
    variant?: 'solid' | 'outline' | 'soft' | 'subtle';
    size?: 'xs' | 'sm' | 'md' | 'lg';
    icon?: string;
}

/**
 * 상세 판 머리글 아래 한 줄에 놓는 요약 타일.
 *
 * 폼 필드와 **다른 축**이다: 필드는 "고칠 값", 요약은 "안 고치고 알아야 할 값"이다.
 * 자동필드ss에 밀어 넣으면 읽기전용 입력칸이 늘어날 뿐이고, 그건 이미 화면에 넘친다.
 */
export interface i요약타일 {
    label: string;
    value: string;
    /** 값 아래 작은 글씨 — 근거(원본 날짜 등) */
    sub?: string;
    /** 값 글자 색. 없으면 기본색 — **경고할 게 있을 때만** 준다. 다 칠하면 아무것도 안 보인다. */
    color?: 'primary' | 'success' | 'warning' | 'error' | 'info';
    icon?: string;
}

/** 라디오/체크 그룹 안의 한 옵션 — `value`로 선택 비교, `match`로 행 필터 */
export interface i필터옵션<T> {
    label: string;
    /** 선택 식별자 (`selected`와 비교) */
    value: string;
    match: (_: T, idx: number) => boolean;
    icon?: string;
    condition?: (list: any[]) => boolean;
    /**
     * **이 칸에 걸린 행은 누가 손대 주기를 기다린다** — 접수·미납·비공개·진행중처럼
     * 「다음 상태로 넘어가야 하는데 아직 안 넘어간」 쪽. 요약 화면의 「할 일」 보기가 이걸 읽는다.
     *
     * **화면이 아니라 모델이 판정한다.** 「접수는 대기고 확정은 아니다」는 그 표의 뜻이라
     * 요약 화면이 이름을 보고 맞힐 값이 아니다 — 맞히게 두면 표가 늘 때마다 조용히 틀린다.
     * 안 적으면 `false`, 즉 **한 표에 대기 칸이 하나도 없는 게 기본**이고 그 표는 조용한 쪽으로 간다.
     */
    대기?: boolean;
}

/** 팩토리 입력 — `value`가 함수면 레거시(predicate)로 보고 `label`을 선택키로 씀 */
export type i필터옵션입력<T> = {
    label: string;
    value?: string | ((_ : T, idx: number) => boolean);
    match?: (_: T, idx: number) => boolean;
    icon?: string;
    condition?: (list: any[]) => boolean;
    /** `i필터옵션.대기` 참고 — 기다리는 쪽에만 적는다 */
    대기?: boolean;
};

/**
 * 정렬 축 하나. `label`은 사람이 읽는 이름(목록 UI·AI 어휘), `value`는 선택 식별자.
 *
 * `func`가 `any`인 건 모델별 predicate(`(a: model회원, b: model회원) => number`)를
 * 반변성 때문에 `unknown`으로는 못 받기 때문이다.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type i정렬조건 = { label: string; value: string; func: (a: any, b: any) => number };

/**
 * 범주(축) 하나의 **정의**. "지금 무엇이 선택돼 있는가"는 여기 없다.
 *
 * repo는 `getInstance()` 싱글턴이라 선택을 여기 두면 같은 모델을 보는 화면끼리
 * (목록 + 선택 모달, 우측 도크 등) 필터가 서로 딸려 움직인다.
 * 선택의 소유자는 뷰다 — `목록5`의 `필터선택s`(`v-model:필터선택`).
 *
 * 옵션 `value`가 `null`/빈 배열로 선택되면 그 축은 필터를 안 건다.
 */
export type i필터라디오그룹<T> = {
    key: string;
    title?: string;
    options: i필터옵션<T>[];
    /** 뷰가 이 축을 아직 안 건드렸을 때 쓰는 값. 단일: `string | null`, 복수(`isMultiple`): `string[]` */
    기본선택: string | string[] | null;
    isMultiple?: boolean;
};

/** 축 `key` → 그 축의 선택값. `목록5`가 소유하고 `v-model:필터선택`으로 페이지에 열어준다. */
export type i필터선택s = Record<string, string | string[] | null>;

export function 정규화필터옵션<T>(d: i필터옵션입력<T>): i필터옵션<T> {
    if (typeof d.value === 'function') {
        return {
            label: d.label,
            value: d.label,
            match: d.value,
            icon: d.icon,
            condition: d.condition,
            대기: d.대기,
        };
    }
    return {
        label: d.label,
        value: d.value ?? d.label,
        match: d.match ?? ((_a, _i) => true),
        icon: d.icon,
        condition: d.condition,
        대기: d.대기,
    };
}

/**
 * 필터 축을 **주소와 대화에서 부르는 이름**. `title`이 있으면 그것, 없으면 `key`.
 *
 * `라디오필터그룹`의 `key`는 안 주면 `f0`·`f1`로 자동 생성된다 — 코드가 바뀌면 갈리는 값이라
 * 링크에도 어휘에도 남길 수 없다. `title`은 사람이 붙인 이름이고 화면 필터 UI에 이미 떠 있으므로,
 * 주소(`?f_제철=여름`)와 도우미의 `"축=값"`이 **같은 말**을 하게 된다.
 *
 * 목록5와 도우미가 이 함수를 같이 쓴다. 두 벌로 두면 이름이 갈려서 도우미가 건 주소를 화면이 못 읽는다.
 */
export const 필터축이름 = (g: { key: string; title?: string }): string =>
    (g.title || g.key).replace(/\s+/g, '');

/** 그 축이 주소에서 쓰는 쿼리 키. */
export const 필터축쿼리키 = (g: { key: string; title?: string }): string => `f_${필터축이름(g)}`;

/**
 * `"축=값"` 한 줄을 축·옵션으로 되돌린다(도우미의 `필터s`가 그 형식이다). 못 찾으면 `null`.
 * 값은 옵션의 **`label`**로 지목한다 — 어휘에 나가는 것도, 화면 UI에 뜨는 것도 label이다.
 */
export function 필터조건찾기<T>(
    그룹s: i필터라디오그룹<T>[],
    조건: string,
): { 그룹: i필터라디오그룹<T>; 옵션: i필터옵션<T> } | null {
    const i = String(조건 ?? '').indexOf('=');
    if (i < 0) return null;
    const 축 = 조건.slice(0, i).replace(/\s+/g, '');
    const 값 = 조건.slice(i + 1).trim();
    const 그룹 = 그룹s.find((g) => 필터축이름(g) === 축);
    const 옵션 = 그룹?.options.find((o) => o.label === 값);
    return 그룹 && 옵션 ? { 그룹, 옵션 } : null;
}

/** `do모두저장`이 한 행을 넘긴 이유. */
export type i저장건너뜀사유 = '검증실패' | '삭제됨' | 'PK없음';

/**
 * `do모두저장`의 결과.
 *
 * 예전에는 아무것도 돌려주지 않았다. `beforeSave`가 `false`를 준 행은 `continue`로 빠지고
 * 서버 왕복이 터져도 `catch {}`가 삼켜서, 부르는 쪽에서 **부분 저장을 알 방법이 없었다**
 * ("3개는 들어가고 1개는 조용히 안 들어감"). 그 구멍을 값으로 메운다.
 */
export interface i저장결과<T> {
    /** 서버에 실제로 올라간 행들. */
    저장s: T[];
    /** 저장하지 않고 넘긴 행들. `model`의 `beforeSave`가 이미 이유를 띄웠을 수 있다. */
    건너뜀s: { model: T; 사유: i저장건너뜀사유 }[];
    /** 서버 왕복이 통째로 실패했을 때의 에러(`creates`/`updates`가 이미 알림을 띄운다). */
    error?: unknown;
    /** 넘긴 것도, 터진 것도 없나. 부르는 쪽은 대개 이것만 보면 된다. */
    is완료: boolean;
}

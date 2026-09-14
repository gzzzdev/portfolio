import { cachedRead } from '~utils'

/**
 * **표별 변경 번호 등록부.** `reads()` 가 "안 바뀌었으면 안 받는다"를 판정하는 자리다.
 *
 * 왜 개수가 아니라 번호인가: 개수는 *추가·삭제로 원래 수로 돌아온* 상태를 구분하지 못한다.
 * 번호는 쓰기마다 1씩 오르므로 "1개 남은 상태"와 "추가·삭제·추가로 1개 남은 상태"가 갈린다.
 *
 * 왜 이 파일이 모델을 import 하지 않는가: 번호를 담은 표(`tables`)를 읽는 것도 결국 모델이고,
 * `~utils/models` 가 `~models` 를 알면 방향이 뒤집힌다(모델은 이 파일의 `BaseModels2` 를 상속한다).
 * 그래서 **읽는 방법은 앱이 꽂는다** — `공급자등록`.
 */

/** 번호를 담은 표의 이름. 이 표 자신은 버전 판정을 안 탄다 — 판정의 뿌리라 늘 새로 읽는다. */
export const 표버전표이름 = 'tables'

/** 서버가 지금 말하는 번호. `훑기`가 채운다. */
let 현재s: Record<string, number> = {}
/** 표별 **마지막으로 성공한 읽기가 반영한** 번호. 이것과 `현재s`가 같으면 다시 안 받는다. */
const 읽은s = new Map<string, number>()
let 공급자: (() => Promise<Record<string, number>>) | null = null

/**
 * 번호 조회의 게이트. 한 화면이 `Promise.all([a.reads(), b.reads(), ...])` 로 몰아치므로,
 * 그 무더기가 **한 번만** 물어보게 병합한다(`cachedRead` 가 inflight 를 합친다).
 * TTL 이 짧은 건 이 값이 "지금 바뀌었나"의 근거라서다 — 길면 캐시가 늦게 깨진다.
 */
const 게이트 = cachedRead(1000)

export const 표버전 = {
  /**
     * 번호를 어떻게 읽을지 앱이 꽂는다. 안 꽂으면 이 등록부는 **통째로 잠자고**,
     * `reads()` 는 지금까지와 똑같이 매번 받는다 — 켜지 않은 축은 아무것도 안 바꾼다.
     */
  공급자등록: (f: () => Promise<Record<string, number>>) => { 공급자 = f },

  /**
     * 이 표가 반영하게 될 번호를 준다. 모르면 `undefined` — 그 표는 판정에서 빠진다
     * (등록부에 행이 없는 표, 공급자 미등록, 조회 실패 전부 여기로 떨어진다).
     *
     * **읽기 전에** 잡아야 한다. 행을 받는 동안 쓰기가 들어오면 번호가 이미 올라가 있어
     * 다음 `reads()` 가 다시 받는다 — 놓치는 쪽이 아니라 한 번 더 받는 쪽으로 틀린다.
     */
  훑기: async (table: string): Promise<number | undefined> => {
    /**
         * **서버(SSR)에서는 통째로 쉰다.** 서버 repo 는 요청 스코프라 매 요청이 빈 목록에서
         * 시작한다 — 건너뛸 목록 자체가 없으니 번호를 물어봐야 이득이 없고, 이 모듈의 상태는
         * 모듈 스코프라 요청끼리 공유된다. 클라(탭 수명 repo)에서만 값이 있는 판정이다.
         */
    if (import.meta.server) return undefined
    if (!공급자) return undefined
    try {
      await 게이트('표버전', async () => { 현재s = (await 공급자!()) ?? {} })
    } catch {
      /** 못 물어보면 판정을 포기한다 — 캐시를 잘못 살려두느니 한 번 더 받는다. */
      return undefined
    }
    return 현재s[table]
  },

  /** 그 번호를 이미 반영한 목록을 들고 있나. */
  is반영됨: (table: string, 번호: number | undefined) =>
    번호 != null && 읽은s.get(table) === 번호,

  /** 읽기가 성공했을 때, 그 읽기가 반영한 번호를 남긴다. 번호를 모르면 안 남긴다. */
  기록: (table: string, 번호: number | undefined) => {
    if (번호 == null) 읽은s.delete(table)
    else 읽은s.set(table, 번호)
  },

  /** 그 표의 판정을 버린다. `reset()`(계정 전환)과 쓰기 직후가 부른다. */
  잊기: (table: string) => { 읽은s.delete(table) }
}

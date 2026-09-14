/**
 * 인쇄물에 찍히는 위변조 확인 주소. QR 표식에 담기는 값이 이것 하나다.
 *
 * **`id` 가 가리키는 것이 `type` 마다 다르다.**
 *   · `grade`  — **등급이력 행**(`member-entity-historys`)의 id. 회원이 아니다.
 *   · `member` — 회원 행의 id.
 *
 * 등급증이 회원을 가리키던 때가 있었다. 그때 검증 화면이 할 수 있는 말은 "이 사람이 있다"
 * 뿐이었다 — 종이에 찍힌 등급·발급일·발급번호와 대조할 상대가 없었기 때문이다. 등급증은
 * 등급 취득 **한 건**에 한 장이므로(1:1) 대조할 것은 그 취득 행이고, 그 행은 `endDate` 로
 * 유효·만료까지 이미 들고 있다. 그래서 발급을 따로 저장하는 표 없이도 검증이 성립한다.
 *
 * 회원증·명함이 `member` 인 것은 그쪽의 1:1 상대가 회원 행이라서다 (명함은 애초에 증명이
 * 아니지만 QR 자리는 같은 함수를 탄다).
 */
export type QrVerifyType = 'grade' | 'member'

export function buildQrVerifyUrl(
  query: { type?: QrVerifyType, id?: string, no?: string },
  origin?: string
) {
  const params = new URLSearchParams()
  if (query.type) params.set('type', query.type)
  if (query.id) params.set('id', String(query.id))
  if (query.no) params.set('no', String(query.no))

  const path = `/qr-verify?${params.toString()}`
  const base = (origin
    ?? (typeof window !== 'undefined' ? window.location.origin : '')
  ).replace(/\/$/, '')

  return base ? `${base}${path}` : path
}

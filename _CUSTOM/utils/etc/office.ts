/**
 * 표 한 벌을 .xlsx 로 내려준다.
 *
 * `xlsx` 는 설치 7MB 짜리다 — **머리말 import 나 플러그인 provide 로 올리지 말 것.**
 * 예전엔 `plugins/excel.client.ts` 가 `$XLSX` 로 물려 모든 클라이언트 진입에 얹혔는데,
 * 실제로 부르는 자리는 여기 하나뿐이라 누르는 순간에만 받도록 내렸다.
 */
export const do엑셀다운 = async (title: string, headers: string[] = ['A', 'B', 'C'], rows: string[][] = [['1', '2', '3']]) => {
  const XLSX = await import('xlsx')

  const data = [headers, ...rows]

  const ws = XLSX.utils.aoa_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')

  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([wbout], { type: 'application/octet-stream' })

  // 다운로드 트리거
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${title}.xlsx`

  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

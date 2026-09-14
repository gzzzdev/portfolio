export * from './generators'
export * from './easys'

export const doDownlaod = async (file: iFile) => {
  const url = file.url + '?download'
  const response = await fetch(url)
  const blob = await response.blob()
  const objectUrl = window.URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = objectUrl
  a.setAttribute('download', file.name ?? 'download')
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

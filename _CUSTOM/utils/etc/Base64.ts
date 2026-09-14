import { Base64 as _Base64 } from 'js-base64'

const encodeBase64 = (str: string) => {
  return _Base64.encode(str)
}

const decodeBase64 = (str: string) => {
  return _Base64.decode(str)
}
export const Base64 = {
  encode: encodeBase64,
  decode: decodeBase64
}

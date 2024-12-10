import axios from 'axios'
import { config } from './config.js'

export enum ROUTES {
  API_ADMIN = 'api/admin',
}

export const getUrl = (url: string, tempConfig?: any) => {
  if (url.startsWith('http')) return url
  const cfg = tempConfig || config
  const trailingSlash = cfg.url.endsWith('/') ? '' : '/'
  return cfg.url + trailingSlash + url
}

const getConfig = (tempConfig?: any) => ({
  headers: { Authorization: tempConfig?.token || config.token },
})

const get = async <T>(url: string, tempConfig?: any): Promise<T> =>
  axios
    .get(getUrl(url, tempConfig), getConfig(tempConfig))
    .then((res) => res.data)
    .catch((error: any) => {
      throw new Error(error.response.data.message)
    })

// const post = async <T>(url: string): Promise<T> =>
//   axios
//     .post(getUrl(url), {}, getConfig())
//     .then((res) => res.data)
//     .catch((error: any) => {
//       throw new Error(error.response.data.message)
//     })

export const api = {
  get,
  // post,
}

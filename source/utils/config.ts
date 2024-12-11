import nconf from 'nconf'
import path from 'path'
import os from 'os'
import fs from 'fs'

const CONFIG_FILENAME = 'config.json'
const CONFIG_DIR = path.join(os.homedir(), '.releash')
const CONFIG_PATH = path.join(CONFIG_DIR, CONFIG_FILENAME)

nconf.argv().env().file({ file: CONFIG_PATH })

export const config = {
  url: nconf.get('URL'),
  token: nconf.get('TOKEN'),
  project: nconf.get('PROJECT'),
  isValid: () => !!config.url && !!config.token,
  save(config: { url: string; token: string; project?: string }) {
    const url = config.url + (config.url.endsWith('/') ? '' : '/')
    nconf.set('URL', url)
    nconf.set('TOKEN', config.token)
    config.project && nconf.set('PROJECT', config.project)
    try {
      fs.mkdirSync(CONFIG_DIR)
    } catch (err: unknown) {
      if ((err as any).code !== 'EEXIST') {
        throw new Error(`Could not create config directory: ${String(err)}`)
      }
    }
    nconf.save((error: any) => {
      if (error) {
        throw new Error(error)
      }
    })
  },
}

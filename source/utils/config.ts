import nconf from 'nconf'

nconf.argv().env().file({ file: 'config.json' })

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
    nconf.save((error: any) => {
      if (error) {
        throw new Error(error)
      }
    })
  },
}

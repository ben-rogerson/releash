import inquirer from 'inquirer'
import { createSpinner } from 'nanospinner'
import chalk from 'chalk'
import { config } from './config.js'
import { ROUTES } from './api.js'
import { api } from './api.js'
import type { ProjectData } from './interfaces.js'

const textLogo = `
██████╗ ███████╗██╗     ███████╗ █████╗ ███████╗██╗  ██╗
██╔══██╗██╔════╝██║     ██╔════╝██╔══██╗██╔════╝██║  ██║
██████╔╝█████╗  ██║     █████╗  ███████║███████╗███████║
██╔══██╗██╔══╝  ██║     ██╔══╝  ██╔══██║╚════██║██╔══██║
██║  ██║███████╗███████╗███████╗██║  ██║███████║██║  ██║
╚═╝  ╚═╝╚══════╝╚══════╝╚══════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝
`

export const handler = () => {
  console.log(
    `${textLogo}\nWelcome to the Releash setup!\nJust a couple of questions to get started:\n`
  )

  inquirer
    .prompt(
      // @ts-expect-error TOFIX
      [
        {
          message:
            'What’s your Unleash URL? (eg: `https://us.app.unleash-hosted.com/usbXXXXX`):\n',
          name: 'url',
          validate: (url: string) => {
            if (!url.startsWith('https://') && !url.startsWith('http://'))
              return 'URL must start with https:// or http://'
            return true
          },
          optional: false,
        },
        {
          message:
            'What’s your API token? (eg: `user:123123123123123123123123123123123`):\n',
          name: 'token',
          validate: (token: string) => {
            if (token.length < 6)
              return 'Add a valid token, get it from your "View profile settings" > "Personal API tokens"'
            return true
          },
        },
        {
          message: 'Default project (eg: `Blah`) (Enter to skip):\n',
          name: 'project',
          optional: true,
        },
      ]
    )
    .then(({ url, token, project }) => {
      // Test an API call to check if the details are valid
      api
        .get<ProjectData>(`${ROUTES.API_ADMIN}/projects`, {
          url,
          token,
        })
        .then((data) => data.projects.length > 0)
        // All good, save the config
        .then(() => save({ url, token, project }))
        // If the API call fails, show an error message
        .catch((error: any) => {
          console.error(
            chalk.red(
              `\n🚧 Couldn\'t connect using those details, please try again.\n\nError: ${
                'message' in error ? error.message : String(error)
              }`
            )
          )
        })
    })
}

const save = ({
  url,
  token,
  project,
}: {
  url: string
  token: string
  project?: string
}) => {
  const spinner = createSpinner('Saving...').start()
  try {
    config.save({ url, token, project })
    spinner.success({
      text: chalk.green('Setup complete! Now run `releash` again.'),
    })
  } catch (error: any) {
    spinner.error({ text: error.message })
  }
}

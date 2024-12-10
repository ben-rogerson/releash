import inquirer from 'inquirer'
import { createSpinner } from 'nanospinner'
import chalk from 'chalk'
import { config } from './utils/config.js'
import { ROUTES } from './utils/api.js'
import { api } from './utils/api.js'
import type { ProjectData } from './utils/interfaces.js'

const textLogo = `
██████╗ ███████╗██╗     ███████╗ █████╗ ███████╗██╗  ██╗
██╔══██╗██╔════╝██║     ██╔════╝██╔══██╗██╔════╝██║  ██║
██████╔╝█████╗  ██║     █████╗  ███████║███████╗███████║
██╔══██╗██╔══╝  ██║     ██╔══╝  ██╔══██║╚════██║██╔══██║
██║  ██║███████╗███████╗███████╗██║  ██║███████║██║  ██║
╚═╝  ╚═╝╚══════╝╚══════╝╚══════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝
`

export const handler = () => {
  console.log(textLogo)

  config.isValid()
    ? console.log(
        `${chalk.green(
          '🎉 Releash is already setup!'
        )}\nWe’ll run through the setup again so you can update your values:\n`
      )
    : console.log(
        `Welcome to the setup wizard! 🧙\nJust a couple of questions before you get started:\n`
      )

  inquirer
    .prompt(
      // @ts-expect-error TOFIX
      [
        {
          message: `What’s your Unleash URL? ${
            !config.url
              ? chalk.gray('eg: `https://us.app.unleash-hosted.com/usbXXXXX`')
              : ''
          }\n `,
          name: 'url',
          validate: (url: string) => {
            if (!url.startsWith('https://') && !url.startsWith('http://'))
              return 'URL must start with https:// or http://'
            return true
          },
          default: config.url,
          optional: false,
        },
        {
          message: `What’s your API token?${
            !config.token
              ? chalk.gray(' eg: `user:123123123123123123123123123123123`')
              : ''
          }\n  In Unleash, generate a token in "View profile settings" > "Personal API tokens"\n `,
          name: 'token',
          validate: (token: string) => {
            if (token.length < 6)
              return 'Add a valid token or we won’t be able to connect to Unleash."'
            return true
          },
          default: config.token,
        },
        {
          message: `Always open a specific project? (optional) Enter the project name:`,
          name: 'project',
          optional: true,
          default: config.project,
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
  const spinner = createSpinner('Saving&hellip;').start()
  try {
    config.save({ url, token, project })
    spinner.success({
      text: `Setup complete! 🎉\n\n${chalk.yellow(
        '✨Tips'
      )}\n- Run ${chalk.bold(
        'releash -s'
      )} to update your API token or default project.\n- Run ${chalk.bold(
        `releash -p <project-name>`
      )} to open a specific project (project name is unfussy).\n`,
    })
    console.log(
      chalk.green(
        `🎏 Releash is ready! Run ${chalk.bold('releash')} to see your${
          project ? ` ${chalk.bold(project)}` : ''
        } flags.`
      )
    )
  } catch (error: any) {
    spinner.error({ text: error.message })
  }
}
